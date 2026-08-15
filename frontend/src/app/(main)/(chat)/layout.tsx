"use client";

import ChatSidebar from "@/components/chat/ChatSidebar";
import { AsyncBoundary, SkeletonKit } from "@/components/composites";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import ChatsService from "@/services/ChatsService";
import { useParams } from "next/navigation";

import { MOBILE_MEDIA_QUERY } from "@/constants/breakpoints";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isError, error, isLoading } = useQuery({
    queryKey: ["chats"],
    queryFn: async () => ChatsService.getChats(),
  });

  const { id } = useParams() as { id?: string };
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MEDIA_QUERY);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const showSidebar = isMobile === null ? true : !isMobile || !id;

  return (
    <AsyncBoundary
      isLoading={isLoading}
      isError={isError}
      error={error}
      loadingFallback={<SkeletonKit.ChatLayoutSkeleton />}
    >
      <div className="flex min-h-[calc(100dvh_-_var(--header-h)_-_var(--space-page)_*_2)] flex-col gap-4 md:min-h-[calc(100dvh_-_var(--header-h)_-_var(--space-page)_*_2_-_4.5rem)] md:flex-row md:gap-6">
        {showSidebar ? <ChatSidebar /> : null}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AsyncBoundary>
  );
}
