import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SocketProvider } from "./SocketContext";

// Capture the handlers the provider registers on the socket so the test can
// fire them directly, and let each test control when they "arrive".
const socketHandlers: Record<string, (...args: unknown[]) => void> = {};
const fakeSocket = {
  connected: false,
  on: vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    socketHandlers[event] = handler;
  }),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => fakeSocket),
}));

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/utils/toast", () => ({
  showSuccessToast: vi.fn(),
  showErrorToast: vi.fn(),
}));

vi.mock("@/hooks/useProfile", () => ({
  default: () => ({ data: { id: "user-1" } }),
}));

vi.mock("@/hooks/useChats", () => ({
  default: () => ({ data: [] }),
}));

describe("SocketContext onMatchReady", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(socketHandlers)) delete socketHandlers[key];
  });

  it("waits for the matches list refetch to resolve before navigating to the new match", async () => {
    const queryClient = new QueryClient();
    // Seed a stale cached matches list, the way a user who already visited
    // /learning or /matches once would have -- this is exactly the
    // condition that made the matches/[id] page's `isLoading` false
    // immediately (cache present) and its "match not found -> redirect"
    // effect fire before the real list was refetched.
    queryClient.setQueryData(["matches"], []);

    let resolveInvalidate!: () => void;
    const invalidateSpy = vi
      .spyOn(queryClient, "invalidateQueries")
      .mockImplementation(
        () =>
          new Promise<void>((resolve) => {
            resolveInvalidate = resolve;
          })
      );

    render(
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <div />
        </SocketProvider>
      </QueryClientProvider>
    );

    await waitFor(() => expect(socketHandlers.matchReady).toBeDefined());

    socketHandlers.matchReady({
      match: { id: "match-1" },
      message: "Your training plan is ready!",
    });

    // invalidateQueries must be called with refetchType: "all" so a stale-
    // but-present cached list is actually refetched, not just marked stale.
    expect(invalidateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["matches"],
        refetchType: "all",
      })
    );

    // The router must not navigate until that refetch settles.
    expect(pushMock).not.toHaveBeenCalled();

    resolveInvalidate();
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/matches/match-1")
    );
  });
});
