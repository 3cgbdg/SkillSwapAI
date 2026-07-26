"use client";

import { useSocket } from "@/context/SocketContext";
import { IChat, IMessage } from "@/types/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, EllipsisVertical, Send } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ChatsService from "@/services/ChatsService";
import useProfile from "@/hooks/useProfile";
import useChats from "@/hooks/useChats";
import useOnlineUsers from "@/hooks/useOnlineUsers";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { showErrorToast } from "@/utils/toast";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { MessageSquare } from "lucide-react";

const Page = () => {
  const onlineUsers = useOnlineUsers();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { data: user } = useProfile();
  const [messageInput, setMessageInput] = useState<string>("");
  const { id } = useParams() as { id: string };
  const { data: chats = [] } = useChats();

  const currentChat = chats.find((chat) => chat.chatId === id) ?? null;
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<HTMLDivElement[]>([]);
  const lastMessageRef = useRef<string>("");

  const {
    data: messages,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["messages", currentChat?.friend.id],
    queryFn: async () => ChatsService.getChat(currentChat?.friend.id),
    enabled: !!currentChat,
  });

  useEffect(() => {
    if (isError) {
      showErrorToast(error?.message || "An error occurred");
    }
  }, [error, isError]);

  useEffect(() => {
    if (!messages || !socket || !user) return;
    const elements = refs.current.filter(Boolean);
    if (!elements.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = refs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) {
              const msg = messages[idx];
              if (!msg.isSeen && msg.fromId !== user.id) {
                if (socket?.connected) {
                  socket.emit("updateSeen", { messageId: msg.id });
                }
                queryClient.setQueryData(
                  ["chats"],
                  (oldChats: IChat[] = []) => {
                    return oldChats.map((c) =>
                      c.chatId === id
                        ? {
                            ...c,
                            _count: {
                              ...c._count,
                              id: Math.max(0, c._count.id - 1),
                            },
                          }
                        : c
                    );
                  }
                );
              }
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.5, root: containerRef.current }
    );

    elements.forEach((el) => el && observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [messages, socket, user, id, queryClient]);

  useEffect(() => {
    if (!socket || !user || !currentChat) return;

    const handleReceiveMessage = ({
      from,
      id: msgId,
      messageContent,
    }: {
      from: string;
      id: string;
      messageContent: string;
    }) => {
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: IMessage[] = []) => {
          if (from === currentChat.friend.id) {
            queryClient.setQueryData(["chats"], (oldChats: IChat[] = []) => {
              return oldChats.map((c) =>
                c.chatId === currentChat.chatId
                  ? { ...c, lastMessageContent: messageContent }
                  : c
              );
            });
            return [
              ...old,
              {
                fromId: from,
                content: messageContent,
                createdAt: new Date(),
                id: msgId,
              },
            ];
          }
          return old;
        }
      );
    };

    const handleMessageSent = (data: {
      id: string;
      createdAt: string | Date;
    }) => {
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: IMessage[] = []) => {
          queryClient.setQueryData(["chats"], (oldChats: IChat[] = []) => {
            return oldChats.map((c) =>
              c.chatId === currentChat.chatId
                ? { ...c, lastMessageContent: lastMessageRef.current }
                : c
            );
          });
          return [
            ...old,
            {
              fromId: user?.id ?? "",
              content: lastMessageRef.current,
              createdAt: new Date(data.createdAt),
              isSeen: false,
              id: data.id,
            },
          ];
        }
      );
    };

    const handleUpdateSeen = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: IMessage[] = []) => {
          if (!old) return old;
          return old.map((item) => {
            if (item.id == messageId) {
              return { ...item, isSeen: true };
            }
            return item;
          });
        }
      );
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("updateSeen", handleUpdateSeen);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("updateSeen", handleUpdateSeen);
    };
  }, [socket, user, currentChat, queryClient]);

  const handleSend = () => {
    if (socket && currentChat && user && messageInput.trim() !== "") {
      lastMessageRef.current = messageInput;
      if (socket?.connected) {
        socket.emit("sendMessage", {
          to: currentChat.friend.id,
          message: messageInput,
        });
      }
      setMessageInput("");
    }
  };

  useEffect(() => {
    if (refs.current && messages) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      refs.current = Array((messages as IMessage[]).length).fill(null);
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-4">
      <Link href="/chats" className={cn(buttonVariants(), "md:hidden w-fit")}>
        Go to chats
      </Link>
      <Card className="flex grow flex-col overflow-hidden rounded-[10px] p-0">
        <div className="border-b border-border">
          <div className="flex items-center justify-between gap-2 px-6 py-5.5">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={currentChat?.friend.name}
                imageUrl={currentChat?.friend.imageUrl}
                size="md"
              />
              <div>
                {currentChat?.friend.name}
                <span
                  className={cn(
                    "block text-sm leading-5",
                    currentChat && onlineUsers.includes(currentChat.friend.id)
                      ? "text-success"
                      : "text-muted-foreground"
                  )}
                >
                  {currentChat && onlineUsers.includes(currentChat.friend.id)
                    ? "Online"
                    : "Offline"}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Chat options"
            >
              <EllipsisVertical />
            </Button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex h-[502px] w-full flex-col gap-4 overflow-y-scroll p-4"
        >
          {!isLoading ? (
            messages && messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  ref={(el) => {
                    refs.current[idx] = el!;
                  }}
                  key={msg.id ?? idx}
                  className={cn(
                    "w-fit max-w-[85%] rounded-[10px] p-3 text-sm",
                    msg.fromId === user?.id
                      ? "ml-auto bg-secondary text-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <p
                    className={cn(
                      "wrap-anywhere mb-1 leading-5",
                      msg.fromId === user?.id && "text-foreground"
                    )}
                  >
                    {msg.content}
                  </p>
                  <div className="flex flex-row-reverse items-center justify-between gap-2">
                    {msg.fromId == user?.id && (
                      <div className={cn(msg.isSeen && "text-primary")}>
                        <CheckCheck size={16} />
                      </div>
                    )}
                    <div className="text-xs leading-4">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="Start the conversation"
                description="Send a message to begin chatting."
                className="mt-20 border-none bg-transparent"
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center">
              <Spinner size="xl" />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="sticky bottom-0 border-t border-border bg-card">
          <div className="flex items-center gap-4 p-4 px-6 md:px-10">
            <Textarea
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="min-h-10 w-full resize-none text-sm leading-5.5"
              placeholder="Type your message here..."
              rows={1}
            />
            <Button
              type="button"
              size="icon"
              className="size-10 shrink-0"
              onClick={() => handleSend()}
              aria-label="Send message"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Page;
