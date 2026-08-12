"use client";

import NotificationsList from "@/components/layout/headerComponents/NotificationsList";
import { AsyncBoundary, DataEmpty } from "@/components/composites";
import { Spinner } from "@/components/ui/spinner";
import useFriends from "@/hooks/useFriends";
import RequestsService from "@/services/RequestsService";
import { IRequest } from "@/types/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Inbox } from "lucide-react";

export function InboxRequestsPanel() {
  const queryClient = useQueryClient();
  const { addFriend } = useFriends();

  const {
    data: reqs,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["reqs"],
    queryFn: () => RequestsService.getRequests(),
  });

  const mutationAcceptSession = useMutation({
    mutationFn: (payload: {
      sessionId: string;
      requestId: string;
      friendId: string;
    }) => RequestsService.acceptSessionRequest(payload),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) =>
        (old ?? []).filter((req) => req.id !== id)
      );
    },
  });

  const mutationRejectSession = useMutation({
    mutationFn: (payload: {
      sessionId: string;
      requestId: string;
      friendId: string;
    }) => RequestsService.rejectSessionRequest(payload),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) =>
        (old ?? []).filter((req) => req.id !== id)
      );
    },
  });

  const mutationRequestDelete = useMutation({
    mutationFn: ({ requestId }: { requestId: string }) =>
      RequestsService.deleteRequest(requestId),
    onSuccess: (id: string) => {
      queryClient.setQueryData(["reqs"], (old: IRequest[]) =>
        (old ?? []).filter((req) => req.id !== id)
      );
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <AsyncBoundary isError={isError} error={error}>
      {reqs && reqs.length > 0 ? (
        <NotificationsList
          reqs={reqs}
          onAcceptSession={(data) => mutationAcceptSession.mutate(data)}
          onRejectSession={(data) => mutationRejectSession.mutate(data)}
          onAddFriend={(data) => addFriend(data)}
          onDeleteRequest={(data) => mutationRequestDelete.mutate(data)}
        />
      ) : (
        <DataEmpty
          icon={Inbox}
          title="No pending requests"
          description="Friend and session invites will show up here."
        />
      )}
    </AsyncBoundary>
  );
}
