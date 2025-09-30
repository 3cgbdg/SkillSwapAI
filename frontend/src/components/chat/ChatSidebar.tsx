"use client"

import { api } from "@/api/axiosInstance";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { updateChats } from "@/redux/chatsSlice";
import { IChat, IFriend } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { Plus, Search, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

// friend interface



const ChatSidebar = () => {
    // for routing across chats 
    const router = useRouter();
    const path = usePathname();
    const [chars, setChars] = useState<string>("");
    const [friends, setFriends] = useState<IFriend[] | null>(null);
    const dispatch = useAppDispatch();
    const {chats} = useAppSelector(state=>state.chats);
    const mutationSearch = useMutation({
        mutationFn: async () => { const res = await api.get("/friends"); return res.data },
        onSuccess: (data) => {
            setFriends(data);
        }
    })

    const mutationCreateChat = useMutation({
        mutationFn: async ({payload}:{payload:{friendId:string,friendName:string}}) => { const res = await api.post("/chats",payload); return res.data },
        onSuccess: (data:IChat) => {
            dispatch(updateChats(data));
        }
    })


    return (
        <div className="_border rounded-[10px] py-6 px-4 basis-[368px] grow-0 shrink-0 ">
            <div className="flex flex-col gap-1.5 mb-4">
                <h2 className="section-title">
                    Messages
                </h2>
                <p className="text-sm leading-5 text-gray">Recent conversations</p>
                <div className="_border p-2 rounded-2xl flex justify-between relative  leading-6">
                    <input onChange={async (e) => {

                        setChars(e.target.value);

                        if (e.target.value.length === 1) {
                            await mutationSearch.mutate();

                        }

                    }} placeholder="Create a new conversation with..." value={chars} className="basis-full text-sm px-2 outline-none" />
                    <div className="flex items-center justify-center"><Search size={20} /></div>
                    {friends && chars.length > 0 && friends.length > 0 &&
                        <div className="left-0 top-full absolute z-10 min-w-[250px] ">
                            <div className="flex flex-col gap-2 mt-2 p-2  _border bg-white rounded-md ">
                                <div className="flex flex-col  gap-1 max-h-[500px]  border-neutral-300">
                                    {friends.filter(friend => friend.name.toLowerCase().includes(chars.toLocaleLowerCase())).map((friend, index) => {
                                        return (
                                            <button onClick={() => {
                                                mutationCreateChat.mutate({payload:{friendId:friend.id,friendName:friend.name}});
                                            }} key={index} className="flex gap-2 button-transparent items-center  rounded-xl  ">
                                                <Users size={20} />
                                                {friend.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    }
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
                            <span className="text-xs leading-4 text-gray">{chat._max ?new Date(chat._max.createdAt).toLocaleTimeString():null}</span>
                            <span className="rounded-full bg-blue text-white text-xs leading-5 font-semibold px-2 py-.5">{chat._count ?chat._count.id : null}</span>
                        </div>
                    </button>

                ))}


            </div>
        </div>
    )
}

export default React.memo(ChatSidebar)