"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { IRequest } from "@/types/session";
import AuthService from "@/services/AuthService";
import RequestsService from "@/services/RequestsService";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

import HeaderLogo from "./headerComponents/HeaderLogo";
import NotificationsBell from "./headerComponents/NotificationsBell";
import AvatarMenu from "./headerComponents/AvatarMenu";
import { CommandPalette } from "./CommandPalette";
import { AsyncBoundary } from "@/components/composites";
import useFriends from "@/hooks/useFriends";

const Header = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { addFriend } = useFriends();

  const mutation = useMutation({
    mutationFn: async () => await AuthService.logOut(),
    onSuccess: () => {
      queryClient.clear();
      router.push("/auth/login");
    },
  });

  const {
    data: reqs,
    isError,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["reqs"],
    queryFn: async () => RequestsService.getRequests(),
  });

  const mutationAcceptSession = useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      requestId: string;
      friendId: string;
    }) => RequestsService.acceptSessionRequest(payload),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        if (!old) return [];
        return old.filter((req: IRequest) => req.id !== id);
      });
    },
  });

  const mutationRejectSession = useMutation({
    mutationFn: async (payload: {
      sessionId: string;
      requestId: string;
      friendId: string;
    }) => RequestsService.rejectSessionRequest(payload),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        if (!old) return [];
        return old.filter((req: IRequest) => req.id !== id);
      });
    },
  });

  const mutationRequestDelete = useMutation({
    mutationFn: async ({ requestId }: { requestId: string }) =>
      RequestsService.deleteRequest(requestId),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => {
        if (!old) return [];
        return old.filter((req: IRequest) => req.id !== id);
      });
    },
  });

  useEffect(() => {
    if (!socket) return;

    const append = (payload: { request: IRequest }) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) => [
        ...(old ?? []),
        payload.request,
      ]);
    };

    socket.on("friendRequest", append);
    socket.on("sessionCreationRequest", append);
    socket.on("sessionAcceptedRequest", append);
    socket.on("sessionRejectedRequest", append);

    return () => {
      socket.off("friendRequest", append);
      socket.off("sessionCreationRequest", append);
      socket.off("sessionAcceptedRequest", append);
      socket.off("sessionRejectedRequest", append);
    };
  }, [socket, queryClient]);

  return (
    <>
      <CommandPalette />
      <header className="border-border bg-card relative flex items-center gap-2 border-b px-2 py-3 md:gap-4 md:px-6">
        <div className="flex shrink-0 items-center gap-2 md:gap-4">
          <SidebarTrigger />
          <div className="md:hidden">
            <HeaderLogo />
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="text-muted-foreground hidden max-w-md min-w-0 flex-1 justify-start gap-2 md:inline-flex"
          onClick={() =>
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
            )
          }
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate">Search matches, skills, people…</span>
          <kbd className="bg-muted ml-auto hidden shrink-0 rounded px-1.5 py-0.5 text-xs lg:inline">
            Ctrl+K
          </kbd>
        </Button>

        <div className="relative ml-auto flex shrink-0 items-center gap-2 md:gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-label="Search"
            onClick={() =>
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", ctrlKey: true })
              )
            }
          >
            <Search className="size-4" />
          </Button>

          <AsyncBoundary isLoading={isLoading} isError={isError} error={error}>
            <NotificationsBell
              reqs={reqs ?? []}
              isLoading={isLoading}
              onAcceptSession={(data) => mutationAcceptSession.mutate(data)}
              onRejectSession={(data) => mutationRejectSession.mutate(data)}
              onAddFriend={(data) => addFriend(data)}
              onDeleteRequest={(data) => mutationRequestDelete.mutate(data)}
            />
          </AsyncBoundary>

          <ThemeToggle />
          <AvatarMenu onLogOut={() => mutation.mutate()} />
        </div>
      </header>
    </>
  );
};

export default Header;
