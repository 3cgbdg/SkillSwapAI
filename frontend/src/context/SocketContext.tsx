"use client";

import { io, Socket } from "socket.io-client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import useProfile from "@/hooks/useProfile";
import useChats from "@/hooks/useChats";
import { SocketContextType, IChat } from "@/types/types";

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();
  const { data: user } = useProfile();
  const { data: chats = [] } = useChats();
  const chatsRef = useRef<IChat[]>(chats);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  useEffect(() => {
    if (!user) return;
    const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      withCredentials: true,
    });
    setSocket(sock);

    const intervalHeartbeat = setInterval(() => {
      sock.emit("heartbeat");
    }, 30000);

    const handleReceiveMessage = (payload: {
      from: string;
      id: string;
      messageContent: string;
    }) => {
      const chat = (chatsRef.current || []).find(
        (c) => c.friend.id === payload.from
      );
      if (chat) {
        queryClient.setQueryData(["chats"], (oldChats: IChat[] = []) => {
          return oldChats.map((c) =>
            c.chatId === chat.chatId
              ? { ...c, lastMessageContent: payload.messageContent }
              : c
          );
        });
      }
    };

    sock.on("receiveMessage", handleReceiveMessage);

    return () => {
      clearInterval(intervalHeartbeat);
      sock.off("receiveMessage", handleReceiveMessage);
      sock.disconnect();
    };
  }, [user, queryClient]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
