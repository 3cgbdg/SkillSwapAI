"use client";

import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
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
import { SocketContextType } from "@/types/socket";
import { IChat } from "@/types/chat";

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
    if (!user) {
      console.log("[SocketContext] No user found, skipping socket connection.");
      return;
    }
    console.log("[SocketContext] Initiating socket connection");
    const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      withCredentials: true,
      transports: ["websocket", "polling"], // Ensure multiple transports are tried
    });

    sock.on("connect_error", (err) => {
      console.error("[SocketContext] Connection error:", err.message, err);
    });

    sock.on("disconnect", (reason) => {
      console.warn("[SocketContext] Disconnected:", reason);
    });

    sock.on("reconnect_attempt", () => {
      console.log("[SocketContext] Attempting to reconnect...");
    });

    setSocket(sock);

    const intervalHeartbeat = setInterval(() => {
      if (sock.connected) {
        console.log("[SocketContext] Sending heartbeat...");
        sock.emit("heartbeat");
      }
    }, 30000);

    sock.on("connect", () => {
      console.log("[SocketContext] Connected to socket with ID:", sock.id);
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    });

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

    const handleAiSuggestionsReady = () => {
      toast.success("AI suggested some new skills for you!");
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    };

    sock.on("receiveMessage", handleReceiveMessage);
    sock.on("aiSuggestionsReady", handleAiSuggestionsReady);

    return () => {
      clearInterval(intervalHeartbeat);
      sock.off("receiveMessage", handleReceiveMessage);
      sock.off("aiSuggestionsReady", handleAiSuggestionsReady);
      sock.disconnect();
    };
  }, [user, queryClient]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
