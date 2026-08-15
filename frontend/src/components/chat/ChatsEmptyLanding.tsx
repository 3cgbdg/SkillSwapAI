"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

import { DataEmpty, UserRow } from "@/components/composites";
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
    <DataEmpty
      icon={MessageSquare}
      title="Start a conversation"
      description="Pick a friend to open a chat, or search in the sidebar."
      className="border-none bg-transparent"
    >
      {isFetching ? (
        <p className="text-muted-foreground text-sm">Loading friends…</p>
      ) : list.length > 0 ? (
        <div className="mt-2 flex w-full max-w-md flex-col gap-2">
          {list.map((friend) => (
            <UserRow
              key={friend.id}
              onClick={() =>
                createChat({
                  friendId: friend.id,
                  friendName: friend.name || "",
                })
              }
              media={
                <UserAvatar
                  name={friend.name}
                  imageUrl={friend.imageUrl}
                  size="sm"
                />
              }
              title={friend.name}
            />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          Add friends from Matches to chat here.
        </p>
      )}
    </DataEmpty>
  );
}
