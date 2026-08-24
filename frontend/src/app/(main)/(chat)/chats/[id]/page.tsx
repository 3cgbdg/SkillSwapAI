"use client";

import { useSocket } from "@/context/SocketContext";
import { IChat, IMessage } from "@/types/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ChatsService from "@/services/ChatsService";
import useProfile from "@/hooks/useProfile";
import useChats from "@/hooks/useChats";
import useOnlineUsers from "@/hooks/useOnlineUsers";
import { AsyncBoundary } from "@/components/composites";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatThread } from "@/components/chat/ChatThread";
import { groupChatMessages, TEMP_MESSAGE_PREFIX } from "@/utils/chatMessages";
import { showErrorToast } from "@/utils/toast";

type ExtendedMessage = IMessage & { pending?: boolean; failed?: boolean };

const Page = () => {
  const onlineUsers = useOnlineUsers();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { data: user } = useProfile();
  const [messageInput, setMessageInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const { id } = useParams() as { id: string };
  const { data: chats = [] } = useChats();

  const currentChat = chats.find((chat) => chat.chatId === id) ?? null;
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [refsVersion, setRefsVersion] = useState(0);
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

  const flatMessages = useMemo(
    () => (messages as ExtendedMessage[]) ?? [],
    [messages]
  );

  const registerMessageRef = useCallback(
    (index: number, el: HTMLDivElement | null) => {
      if (refs.current[index] === el) return;
      refs.current[index] = el;
      setRefsVersion((v) => v + 1);
    },
    []
  );

  useEffect(() => {
    if (!messages || !socket || !user) return;
    const elements = refs.current.filter(Boolean) as HTMLDivElement[];
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

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [messages, socket, user, id, queryClient, refsVersion]);

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

    const handleMessageError = (payload?: { message?: string }) => {
      showErrorToast(payload?.message || "Message could not be sent");
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: ExtendedMessage[] = []) =>
          old.map((message) =>
            message.pending
              ? { ...message, pending: false, failed: true }
              : message
          )
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
    socket.on("messageError", handleMessageError);
    socket.on("typing", onTyping);
    socket.on("stopTyping", onStopTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("updateSeen", handleUpdateSeen);
      socket.off("messageError", handleMessageError);
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

  const sendMessage = (trimmed: string) => {
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
  };

  const handleSend = () => {
    const trimmed = messageInput.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setMessageInput("");
  };

  const handleRetry = (msg: ExtendedMessage) => {
    if (!currentChat || !user) return;
    queryClient.setQueryData(
      ["messages", currentChat.friend.id],
      (old: ExtendedMessage[] = []) => old.filter((m) => m.id !== msg.id)
    );
    sendMessage(msg.content);
  };

  const grouped = useMemo(
    () => groupChatMessages(flatMessages, user?.id),
    [flatMessages, user?.id]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    refs.current = Array(flatMessages.length).fill(null);
    setRefsVersion((v) => v + 1);
  }, [flatMessages]);

  const isOnline = Boolean(
    currentChat && onlineUsers.includes(currentChat.friend.id)
  );

  return (
    <AsyncBoundary isError={isError} error={error}>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <ChatThread
          currentChat={currentChat}
          isTyping={isTyping}
          isOnline={isOnline}
          isLoading={isLoading}
          grouped={grouped}
          flatMessages={flatMessages}
          registerMessageRef={registerMessageRef}
          onRetryMessage={handleRetry}
          containerRef={containerRef}
          endRef={endRef}
          footer={
            <ChatComposer
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSend}
              onTyping={emitTyping}
            />
          }
        />
      </div>
    </AsyncBoundary>
  );
};

export default Page;
