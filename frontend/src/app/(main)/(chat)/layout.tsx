"use client"

import { api } from "@/services/axiosInstance";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { SocketProvider } from "@/context/SocketContext";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { getChats } from "@/redux/chatsSlice";
import { IChat } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import { io } from "socket.io-client";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // redux dispatch for adding chats to global state
  const dispatch = useAppDispatch();


  const { data: chats, isSuccess } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await api.get("/chats");
      return res.data
    },
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







