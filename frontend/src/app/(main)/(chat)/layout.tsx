"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { getChats } from "@/redux/chatsSlice";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ChatsService from "@/services/ChatsService";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // redux dispatch for adding chats to global state
  const dispatch = useAppDispatch();

  const {
    data: chats,
    isSuccess,
    isError,
    error,
  } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => ChatsService.getChats(),
  });

  useEffect(() => {
    if (isSuccess && chats) {
      dispatch(getChats(chats));
    }
  }, [isSuccess, chats]);

  // handling error
  useEffect(() => {
    if (isError) toast.error(error.message);
  }, [isError, error]);

  const { id } = useParams() as { id: string };
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = () => setIsMobile(mq.matches);

    handler();
    mq.addEventListener("change", handler);

    return () => mq.removeEventListener("change", handler);
  }, []);

  if (isMobile === null) return null;
  return (
    <div className="flex gap-8 max-h-[800px] md:max-h-[705px]">
      {((window.matchMedia("(max-width: 767px)").matches && !id) ||
        window.matchMedia("(min-width: 769px)").matches) && <ChatSidebar />}
      <div className="w-full">{children}</div>
    </div>
  );
}
