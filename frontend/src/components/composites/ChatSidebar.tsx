"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import useChats from "@/hooks/useChats";
import useOnlineUsers from "@/hooks/useOnlineUsers";
import ChatsService from "@/services/ChatsService";
import useFriends from "@/hooks/useFriends";
import { PanelLeftClose, PanelLeftOpen, Search, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { showErrorToast } from "@/utils/toast";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { PresenceDot, UserRow } from "@/components/composites";
import { cn } from "@/lib/utils";
import { withViewTransition } from "@/lib/viewTransition";

const ChatSidebar = () => {
  const router = useRouter();
  const path = usePathname();
  const [chars, setChars] = useState<string>("");
  const { friends, isFetching, refetch } = useFriends();
  const queryClient = useQueryClient();
  const { data: chats = [] } = useChats();
  const onlineUsers = useOnlineUsers();
  const [isFullyOpen, setIsFullyOpen] = useState<boolean>(true);

  const { mutate: createChat } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: { friendId: string; friendName: string };
    }) => ChatsService.createChat(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["chats"], (old: any) => {
        if (!old) return [data];
        return [data, ...old];
      });
      router.push(`/inbox/${data.chatId}`);
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  return (
    <Card
      className={cn(
        "flex h-full shrink-0 grow-0 flex-col rounded-none border-0 border-r py-4 px-3 shadow-none md:px-4",
        isFullyOpen ? "md:w-[340px]" : "md:w-fit",
        "w-full"
      )}
    >
      <div className="mb-4 flex flex-col gap-1.5">
        <div
          className={cn(
            "flex items-center gap-4",
            isFullyOpen ? "justify-between" : "justify-center"
          )}
        >
          {isFullyOpen && <h2 className="font-heading text-h2">Messages</h2>}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden md:inline-flex"
            onClick={() => setIsFullyOpen(!isFullyOpen)}
            aria-label={isFullyOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isFullyOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </Button>
        </div>
        {isFullyOpen && (
          <div className="relative flex items-center">
            <Input
              onChange={async (e) => {
                setChars(e.target.value);
                if (e.target.value.length === 1) {
                  await refetch();
                }
              }}
              placeholder="Create a new conversation with..."
              value={chars}
              className="pr-10"
            />
            <div className="text-muted-foreground pointer-events-none absolute right-3 flex items-center justify-center">
              {isFetching ? <Spinner size="sm" /> : <Search size={20} />}
            </div>
            {!isFetching &&
            friends &&
            chars.length > 0 &&
            friends.length > 0 ? (
              <div className="absolute left-0 top-full z-50 min-w-60">
                <Card className="mt-2 gap-1 p-2">
                  <div className="flex max-h-[500px] flex-col gap-1">
                    {friends
                      .filter((friend) =>
                        (friend.name || "")
                          .toLowerCase()
                          .includes(chars.toLocaleLowerCase())
                      )
                      .map((friend) => (
                        <Button
                          type="button"
                          key={friend.id}
                          variant="ghost"
                          className="justify-start gap-4"
                          onClick={() => {
                            setChars("");
                            createChat({
                              payload: {
                                friendId: friend.id,
                                friendName: friend.name || "",
                              },
                            });
                          }}
                        >
                          <Users size={20} />
                          {friend.name}
                        </Button>
                      ))}
                  </div>
                </Card>
              </div>
            ) : null}
          </div>
        )}
      </div>
      {isFullyOpen && (
        <p className="my-2 text-sm leading-5 text-muted-foreground">
          Recent conversations
        </p>
      )}

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {chats?.map((chat) =>
          isFullyOpen ? (
            <UserRow
              key={chat.chatId}
              className={cn(
                "border-0 bg-transparent",
                path === `/inbox/${chat.chatId}` && "bg-muted"
              )}
              onClick={() =>
                withViewTransition(() => router.push(`/inbox/${chat.chatId}`))
              }
              media={
                <div className="relative">
                  <UserAvatar
                    name={chat.friend.name}
                    imageUrl={chat.friend.imageUrl}
                    size="md"
                  />
                  <PresenceDot online={onlineUsers.includes(chat.friend.id)} />
                </div>
              }
              title={chat.friend.name}
              description={chat.lastMessageContent}
              actions={
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs leading-4 text-muted-foreground">
                    {chat._max
                      ? new Date(chat._max.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : null}
                  </span>
                  {chat._count && chat._count.id > 0 ? (
                    <Badge className="px-2 py-0.5">{chat._count.id}</Badge>
                  ) : null}
                </div>
              }
            />
          ) : (
            <Button
              type="button"
              key={chat.chatId}
              variant="ghost"
              size="icon"
              className="size-12"
              onClick={() => router.push(`/inbox/${chat.chatId}`)}
              aria-label={chat.friend.name}
            >
              <UserAvatar
                name={chat.friend.name}
                imageUrl={chat.friend.imageUrl}
                size="md"
              />
            </Button>
          )
        )}
      </div>
    </Card>
  );
};

export default React.memo(ChatSidebar);
