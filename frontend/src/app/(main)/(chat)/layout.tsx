"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ChatsService from "@/services/ChatsService";
import { useParams } from "next/navigation";
import { showErrorToast } from "@/utils/toast";

const MOBILE_QUERY = "(max-width: 767px)";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isError, error } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => ChatsService.getChats(),
  });

  useEffect(() => {
    if (isError) showErrorToast(error?.message || "An error occurred");
  }, [isError, error]);

  const { id } = useParams() as { id?: string };
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const showSidebar = isMobile === null ? true : !isMobile || !id;

  return (
    <div className="flex min-h-[min(75dvh,800px)] gap-4 md:gap-6">
      {showSidebar ? <ChatSidebar /> : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
