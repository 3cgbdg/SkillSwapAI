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
    if (!user) return;
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

    setSocket(sock);

    const intervalHeartbeat = setInterval(() => {
      if (sock.connected) {
        sock.emit("heartbeat");
      }
    }, 30000);

    let hasConnectedOnce = false;
    sock.on("connect", () => {
      // Only force a profile refetch on this socket's first connect —
      // reconnects (flaky network, tab backgrounding) shouldn't override the
      // query's own staleTime with a forced refetch every time.
      if (!hasConnectedOnce) {
        hasConnectedOnce = true;
        void queryClient.invalidateQueries({ queryKey: ["profile"] });
      }
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
      // The matches/[id] page redirects away if the new match isn't in its
      // cached list yet, so the invalidated query must actually be
      // refetched — and that refetch awaited — before navigating there.
      // Otherwise the navigation can land before the list updates and the
      // page bounces the user straight back out.
      void queryClient
        .invalidateQueries({ queryKey: ["matches"], refetchType: "all" })
        .finally(() => {
          router.push(`/matches/${payload.match.id}`);
        });
    };

    const onMatchFailed = (payload: { message?: string }) => {
      showErrorToast(payload.message || "Failed to generate match");
    };

    const onReviewPrompt = (payload: { sessionTitle?: string }) => {
      showSuccessToast(
        payload.sessionTitle
          ? `How was "${payload.sessionTitle}"? Leave a review.`
          : "You have a session to review."
      );
      void queryClient.invalidateQueries({
        queryKey: ["reviews", "reviewable"],
      });
    };

    sock.on("receiveMessage", handleReceiveMessage);
    sock.on("aiSuggestionsReady", onAiSkillsSuggestion);
    sock.on("matchReady", onMatchReady);
    sock.on("matchFailed", onMatchFailed);
    sock.on("reviewPrompt", onReviewPrompt);

    return () => {
      clearInterval(intervalHeartbeat);
      sock.off("receiveMessage", handleReceiveMessage);
      sock.off("aiSuggestionsReady", onAiSkillsSuggestion);
      sock.off("matchReady", onMatchReady);
      sock.off("matchFailed", onMatchFailed);
      sock.off("reviewPrompt", onReviewPrompt);
      sock.disconnect();
    };
  }, [user, queryClient, router]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
