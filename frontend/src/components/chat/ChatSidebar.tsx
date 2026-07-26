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
import { cn } from "@/lib/utils";

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
      router.push(`/chats/${data.chatId}`);
    },
    onError: (err: Error) => {
      showErrorToast(err.message);
    },
  });

  return (
    <Card
      className={cn(
        "flex h-full shrink-0 grow-0 flex-col overflow-hidden rounded-[10px] py-6 px-4",
        isFullyOpen ? "md:w-[340px]" : "md:w-fit",
        "w-full"
      )}
    >
      <div className="mb-4 flex flex-col gap-1.5">
        <div
          className={cn(
            "flex items-center gap-2",
            isFullyOpen ? "justify-between" : "justify-center"
          )}
        >
          {isFullyOpen && (
            <h2 className="text-2xl font-bold leading-8">Messages</h2>
          )}
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
          <div className="relative flex justify-between rounded-2xl border border-border p-2 leading-6">
            <Input
              onChange={async (e) => {
                setChars(e.target.value);
                if (e.target.value.length === 1) {
                  await refetch();
                }
              }}
              placeholder="Create a new conversation with..."
              value={chars}
              className="basis-full border-0 px-2 text-sm shadow-none focus-visible:ring-0"
            />
            {!isFetching ? (
              friends &&
              chars.length > 0 &&
              friends.length > 0 && (
                <div className="absolute left-0 top-full z-50 min-w-[250px]">
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
                            className="justify-start gap-2 rounded-xl"
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
              )
            ) : (
              <Spinner size="sm" className="mr-2" />
            )}
            <div className="flex items-center justify-center">
              <Search size={20} />
            </div>
          </div>
        )}
      </div>
      {isFullyOpen && (
        <p className="my-2 text-sm leading-5 text-muted-foreground">
          Recent conversations
        </p>
      )}

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {chats?.map((chat) => (
          <button
            type="button"
            key={chat.chatId}
            onClick={() => router.push(`/chats/${chat.chatId}`)}
            className={cn(
              "group flex cursor-pointer justify-between gap-4 rounded-[6px] p-3.5 transition-all hover:bg-secondary",
              path === `/chats/${chat.chatId}` && "bg-secondary"
            )}
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar
                  name={chat.friend.name}
                  imageUrl={chat.friend.imageUrl}
                  size="md"
                />
                <span
                  className={cn(
                    "absolute bottom-0 right-0 size-3 rounded-full border-2 border-background",
                    onlineUsers.includes(chat.friend.id)
                      ? "bg-success"
                      : "bg-muted-foreground"
                  )}
                  aria-hidden
                />
              </div>

              {isFullyOpen && (
                <div className="text-left">
                  <h3 className="max-w-[160px] truncate font-medium">
                    {chat.friend.name}
                  </h3>
                  <div className="relative max-w-[150px]">
                    <p className="truncate text-sm leading-5 text-muted-foreground">
                      {chat.lastMessageContent}
                    </p>
                    <div
                      className={cn(
                        "pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l to-transparent",
                        path === `/chats/${chat.chatId}`
                          ? "from-secondary"
                          : "from-card group-hover:from-secondary"
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
            {isFullyOpen && (
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs leading-4 text-muted-foreground">
                  {chat._max
                    ? new Date(chat._max.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null}
                </span>
                {chat._count && chat._count.id > 0 && (
                  <Badge className="px-2 py-0.5">{chat._count.id}</Badge>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </Card>
  );
};

export default React.memo(ChatSidebar);
