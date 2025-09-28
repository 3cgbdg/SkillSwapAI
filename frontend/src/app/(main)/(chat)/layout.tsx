"use client"

import { api } from "@/api/axiosInstance";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { useQuery } from "@tanstack/react-query";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  const { data: chats } = useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const res = await api.get("/chats");
      return res.data
    }
  })


  return (


    <div className="flex gap-8 h-[705px]">
      <ChatSidebar chats={chats} />
      {children}
    </div>




  );
}







