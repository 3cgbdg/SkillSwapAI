"use client"

import { IChats } from "@/types/types";
import { usePathname, useRouter } from "next/navigation"
import React from "react"

// friend interface



const ChatSidebar = ({ chats }: { chats: IChats[] }) => {
    // for routing across chats 
    const router = useRouter();
    const path = usePathname();

    return (
        <div className="_border rounded-[10px] py-6 px-4 basis-[368px] grow-0 shrink-0 ">
            <div className="flex flex-col gap-1.5 mb-4">
                <h2 className="section-title">
                    Messages
                </h2>
                <p className="text-sm leading-5 text-gray">Recent conversations</p>
            </div>
            <div className="flex flex-col gap-2">
                {chats?.map((chat, idx) => (

                    <button key={idx} onClick={() => router.push(`/chat/${friend.id}`)} className={`rounded-[6px] p-3.5 cursor-pointer ${path == `/chat/${friend.id}` ? "bg-lightBlue" : ""} transition-all  hover:bg-lightBlue flex gap-4 justify-between`}>
                        <div className="flex  gap-4 items-center">
                            <div className="rounded-full size-10 bg-black"></div>
                            <div className="text-left">
                                <h3 className="">{chat.name}</h3>
                                <p className="text-gray leading-5 text-sm">Great, see you then!</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-xs leading-4 text-gray">{new Date().toLocaleTimeString()}</span>
                            <span className="rounded-full bg-blue text-white text-xs leading-5 font-semibold px-2 py-.5">2</span>
                        </div>
                    </button>

                ))}


            </div>
        </div>
    )
}

export default React.memo(ChatSidebar)