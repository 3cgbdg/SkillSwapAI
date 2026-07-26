"use client";

import { io, Socket } from "socket.io-client";
import { showSuccessToast } from "@/utils/toast";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useProfile from "@/hooks/useProfile";
import useChats from "@/hooks/useChats";
import { SocketContextType } from "@/types/socket";
import { IChat } from "@/types/chat";
import { IMatch } from "@/types/match";
import { showErrorToast } from "@/utils/toast";

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();
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
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
    // Socket.IO treats any path in the connection URL as a namespace, not a
    // REST path. NEXT_PUBLIC_API_URL includes "/api" for axios's baseURL, so
    // strip it down to the origin here to stay on the gateways' default "/"
    // namespace.
    let socketUrl = apiUrl;
    try {
      socketUrl = new URL(apiUrl).origin;
    } catch {
      // leave socketUrl as-is if apiUrl isn't a valid absolute URL
    }
    const sock = io(socketUrl, {
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

    const onAiSkillsSuggestion = () => {
      showSuccessToast("AI suggested some new skills for you!");
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    };

    const onMatchReady = (payload: { match: IMatch; message?: string }) => {
      showSuccessToast(payload.message || "Your training plan is ready!");
      void queryClient.invalidateQueries({ queryKey: ["matches"] });
      router.push(`/matches/${payload.match.id}`);
    };

    const onMatchFailed = (payload: { message?: string }) => {
      showErrorToast(payload.message || "Failed to generate match");
    };

    sock.on("receiveMessage", handleReceiveMessage);
    sock.on("aiSuggestionsReady", onAiSkillsSuggestion);
    sock.on("matchReady", onMatchReady);
    sock.on("matchFailed", onMatchFailed);

    return () => {
      clearInterval(intervalHeartbeat);
      sock.off("receiveMessage", handleReceiveMessage);
      sock.off("aiSuggestionsReady", onAiSkillsSuggestion);
      sock.off("matchReady", onMatchReady);
      sock.off("matchFailed", onMatchFailed);
      sock.disconnect();
    };
  }, [user, queryClient, router]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
