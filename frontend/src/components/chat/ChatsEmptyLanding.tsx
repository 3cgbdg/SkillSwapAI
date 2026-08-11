"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

import { EmptyState } from "@/components/composites";
import { UserAvatar } from "@/components/ui/user-avatar";
import useFriends from "@/hooks/useFriends";
import ChatsService from "@/services/ChatsService";
import { showErrorToast } from "@/utils/toast";

export function ChatsEmptyLanding() {
  const { friends, isFetching } = useFriends();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createChat } = useMutation({
    mutationFn: async (payload: { friendId: string; friendName: string }) =>
      ChatsService.createChat(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["chats"], (old: unknown) => {
        if (!Array.isArray(old)) return [data];
        return [data, ...old];
      });
      router.push(`/inbox/${data.chatId}`);
    },
    onError: (err: Error) => showErrorToast(err.message),
  });

  const list = friends?.slice(0, 8) ?? [];

  return (
    <EmptyState
      icon={MessageSquare}
      title="Start a conversation"
      description="Pick a friend to open a chat, or search in the sidebar."
      className="border-none bg-transparent"
    >
      {isFetching ? (
        <p className="text-muted-foreground text-sm">Loading friends…</p>
      ) : list.length > 0 ? (
        <ul className="mt-2 flex w-full max-w-md flex-col gap-2">
          {list.map((friend) => (
            <li key={friend.id}>
              <button
                type="button"
                className="hover:bg-muted flex w-full items-center gap-3 rounded-lg border border-border px-3 py-2 text-left transition-colors"
                onClick={() =>
                  createChat({
                    friendId: friend.id,
                    friendName: friend.name || "",
                  })
                }
              >
                <UserAvatar
                  name={friend.name}
                  imageUrl={friend.imageUrl}
                  size="sm"
                />
                <span className="font-medium">{friend.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          Add friends from Matches to chat here.
        </p>
      )}
    </EmptyState>
  );
}
