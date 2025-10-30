"use client"

import ChatSidebar from "@/components/chat/ChatSidebar";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { getChats } from "@/redux/chatsSlice";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import ChatsService from "@/services/ChatsService";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // redux dispatch for adding chats to global state
  const dispatch = useAppDispatch();


  const { data: chats, isSuccess } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => ChatsService.getChats(),
  })

  useEffect(() => {
    if (isSuccess && chats) {
      dispatch(getChats(chats))
      console.log(chats);
    }
  }, [isSuccess, chats])




  return (


    <div className="flex gap-8 h-[705px]">
      <ChatSidebar />
      {children}
    </div>




  );
}







