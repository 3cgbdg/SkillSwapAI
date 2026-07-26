"use client";

import { useSocket } from "@/context/SocketContext";
import { IChat, IMessage } from "@/types/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  EllipsisVertical,
  Send,
  UserRound,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatsService from "@/services/ChatsService";
import useProfile from "@/hooks/useProfile";
import useChats from "@/hooks/useChats";
import useOnlineUsers from "@/hooks/useOnlineUsers";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { groupChatMessages, TEMP_MESSAGE_PREFIX } from "@/utils/chatMessages";

type ExtendedMessage = IMessage & { pending?: boolean; failed?: boolean };

const Page = () => {
  const onlineUsers = useOnlineUsers();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user } = useProfile();
  const [messageInput, setMessageInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const { id } = useParams() as { id: string };
  const { data: chats = [] } = useChats();

  const currentChat = chats.find((chat) => chat.chatId === id) ?? null;
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<HTMLDivElement[]>([]);
  const lastMessageRef = useRef<string>("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const friendId = currentChat?.friend.id;

  const {
    data: messages,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["messages", friendId],
    queryFn: async () => ChatsService.getChat(friendId!),
    enabled: !!friendId,
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
              if (
                !msg.isSeen &&
                msg.fromId !== user.id &&
                !msg.id.startsWith(TEMP_MESSAGE_PREFIX)
              ) {
                if (socket?.connected) {
                  socket.emit("updateSeen", { messageId: msg.id });
                }
                queryClient.setQueryData(["chats"], (oldChats: IChat[] = []) =>
                  oldChats.map((c) =>
                    c.chatId === id
                      ? {
                          ...c,
                          _count: {
                            ...c._count,
                            id: Math.max(0, c._count.id - 1),
                          },
                        }
                      : c
                  )
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

    return () => observer.disconnect();
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
        (old: ExtendedMessage[] = []) => {
          if (from === currentChat.friend.id) {
            queryClient.setQueryData(["chats"], (oldChats: IChat[] = []) =>
              oldChats.map((c) =>
                c.chatId === currentChat.chatId
                  ? { ...c, lastMessageContent: messageContent }
                  : c
              )
            );
            return [
              ...old.filter((m) => !m.id.startsWith(TEMP_MESSAGE_PREFIX)),
              {
                fromId: from,
                content: messageContent,
                createdAt: new Date(),
                id: msgId,
                isSeen: false,
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
        (old: ExtendedMessage[] = []) => {
          const withoutTemp = old.filter(
            (m) =>
              !m.id.startsWith(TEMP_MESSAGE_PREFIX) ||
              m.content !== lastMessageRef.current
          );
          const hasReal = withoutTemp.some((m) => m.id === data.id);
          if (hasReal) return withoutTemp;
          queryClient.setQueryData(["chats"], (oldChats: IChat[] = []) =>
            oldChats.map((c) =>
              c.chatId === currentChat.chatId
                ? { ...c, lastMessageContent: lastMessageRef.current }
                : c
            )
          );
          return [
            ...withoutTemp,
            {
              fromId: user.id,
              content: lastMessageRef.current,
              createdAt: new Date(data.createdAt),
              isSeen: false,
              id: data.id,
              pending: false,
            },
          ];
        }
      );
    };

    const handleUpdateSeen = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: ExtendedMessage[] = []) =>
          old?.map((item) =>
            item.id === messageId ? { ...item, isSeen: true } : item
          ) ?? old
      );
    };

    const onTyping = ({ from }: { from: string }) => {
      if (from === currentChat.friend.id) setIsTyping(true);
    };
    const onStopTyping = ({ from }: { from: string }) => {
      if (from === currentChat.friend.id) setIsTyping(false);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("updateSeen", handleUpdateSeen);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("updateSeen", handleUpdateSeen);
      socket.off("typing", onTyping);
      socket.off("stopTyping", onStopTyping);
    };
  }, [socket, user, currentChat, queryClient]);

  const emitTyping = useCallback(() => {
    if (!socket?.connected || !friendId) return;
    socket.emit("typing", { to: friendId });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { to: friendId });
    }, 2000);
  }, [socket, friendId]);

  const handleSend = () => {
    const trimmed = messageInput.trim();
    if (!currentChat || !user || trimmed === "") return;

    if (!socket?.connected) {
      const tempId = `${TEMP_MESSAGE_PREFIX}${Date.now()}`;
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: ExtendedMessage[] = []) => [
          ...old,
          {
            id: tempId,
            content: trimmed,
            fromId: user.id,
            createdAt: new Date(),
            isSeen: false,
            failed: true,
          },
        ]
      );
      setMessageInput("");
      return;
    }

    const tempId = `${TEMP_MESSAGE_PREFIX}${Date.now()}`;
    lastMessageRef.current = trimmed;

    queryClient.setQueryData(
      ["messages", currentChat.friend.id],
      (old: ExtendedMessage[] = []) => [
        ...old,
        {
          id: tempId,
          content: trimmed,
          fromId: user.id,
          createdAt: new Date(),
          isSeen: false,
          pending: true,
        },
      ]
    );

    socket.emit("sendMessage", {
      to: currentChat.friend.id,
      message: trimmed,
    });
    socket.emit("stopTyping", { to: currentChat.friend.id });
    setMessageInput("");
  };

  const grouped = useMemo(
    () => groupChatMessages((messages as ExtendedMessage[]) ?? [], user?.id),
    [messages, user?.id]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    if (messages) {
      refs.current = Array(messages.length).fill(null);
    }
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Link href="/chats" className={cn(buttonVariants(), "md:hidden w-fit")}>
        Go to chats
      </Link>
      <Card className="flex min-h-[min(70dvh,720px)] flex-1 flex-col overflow-hidden rounded-xl p-0">
        <div className="border-b border-border shrink-0">
          <div className="flex items-center justify-between gap-2 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={currentChat?.friend.name}
                imageUrl={currentChat?.friend.imageUrl}
                size="md"
              />
              <div>
                <p className="font-heading font-semibold">
                  {currentChat?.friend.name}
                </p>
                <span
                  className={cn(
                    "block text-sm",
                    currentChat && onlineUsers.includes(currentChat.friend.id)
                      ? "text-success"
                      : "text-muted-foreground"
                  )}
                >
                  {isTyping
                    ? "Typing…"
                    : currentChat && onlineUsers.includes(currentChat.friend.id)
                      ? "Online"
                      : "Offline"}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="hover:bg-muted inline-flex size-8 items-center justify-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                aria-label="Chat options"
              >
                <EllipsisVertical className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    currentChat?.friend.id &&
                    router.push(`/profiles/${currentChat.friend.id}`)
                  }
                >
                  <UserRound className="size-4" />
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    router.push(
                      `/calendar?schedule=true&name=${encodeURIComponent(currentChat?.friend.name || "")}`
                    )
                  }
                >
                  <Calendar className="size-4" />
                  Schedule session
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => showErrorToast("Mute coming soon")}
                >
                  <VolumeX className="size-4" />
                  Mute
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6"
        >
          {!isLoading ? (
            messages && messages.length > 0 ? (
              <ChatMessageList items={grouped} />
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="Start the conversation"
                description="Send a message to begin chatting."
                className="mt-12 border-none bg-transparent"
              />
            )
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <Spinner size="xl" />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border bg-card shrink-0">
          <div className="flex items-end gap-3 p-4 md:px-6">
            <Textarea
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onChange={(e) => {
                setMessageInput(e.target.value);
                emitTyping();
              }}
              value={messageInput}
              className="min-h-10 w-full resize-none text-sm"
              placeholder="Type your message…"
              rows={1}
            />
            <Button
              type="button"
              size="icon"
              className="size-10 shrink-0"
              onClick={handleSend}
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
