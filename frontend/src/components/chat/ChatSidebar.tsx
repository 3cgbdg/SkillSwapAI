"use client"

import { api } from "@/api/axiosInstance";
import { IChat } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { usePathname, useRouter } from "next/navigation"
import React, { useState } from "react"

// friend interface



const ChatSidebar = ({ chats }: { chats: IChat[] }) => {
    // for routing across chats 
    const router = useRouter();
    const path = usePathname();
    const [chars, setChars] = useState<string>("");

    const mutationSearch = useMutation({
        mutationFn: async (chars: { chars: string }) => { const res = await api.get("/friends", { params: chars }); return res.data },
      
    })
    
    return (
        <div className="_border rounded-[10px] py-6 px-4 basis-[368px] grow-0 shrink-0 ">
            <div className="flex flex-col gap-1.5 mb-4">
                <h2 className="section-title">
                    Messages
                </h2>
                <p className="text-sm leading-5 text-gray">Recent conversations</p>
                <div className="_border p-2 rounded-2xl flex justify-between leading-6">
                    <input onChange={async (e) => {

                        setChars(e.target.value);

                        if (e.target.value.length > 2) {
                            await mutationSearch.mutate({ chars: e.target.value });
                            setChars("search");

                        }

                    }} placeholder="Create a new conversation with..." value={chars} className="basis-full text-sm px-2 outline-none" />
                    <button className="button-transparent p-2!"><Plus size={16} /></button>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {chats?.map((chat, idx) => (

                    <button key={idx} onClick={() => router.push(`/chats/${chat.chatId}`)} className={`rounded-[6px] p-3.5 cursor-pointer ${path == `/chat/${chat.chatId}` ? "bg-lightBlue" : ""} transition-all  hover:bg-lightBlue flex gap-4 justify-between`}>
                        <div className="flex  gap-4 items-center">
                            <div className="rounded-full size-10 bg-black"></div>
                            <div className="text-left">
                                <h3 className="">{chat.friend.name}</h3>
                                <p className="text-gray leading-5 text-sm">{chat.lastMessageContent}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-xs leading-4 text-gray">{new Date(chat._max.createdAt).toLocaleTimeString()}</span>
                            <span className="rounded-full bg-blue text-white text-xs leading-5 font-semibold px-2 py-.5">{chat._count.id}</span>
                        </div>
                    </button>

                ))}


            </div>
        </div>
    )
}

export default React.memo(ChatSidebar)