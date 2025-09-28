"use client"

import { api } from "@/api/axiosInstance"
import { useAppSelector } from "@/hooks/reduxHooks"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { EllipsisVertical, Send } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

interface IMessage {
    content: string,
    fromId: string,
    createdAt: Date,
}

const Page = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const queryClient = useQueryClient();
    const { user } = useAppSelector(state => state.auth)
    const [messageInput, setMessageInput] = useState<string>("")
    const { id } = useParams() as { id: string }
    const endRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, { withCredentials: true });
        setSocket(sock);
        console.log(sock)
        return () => { sock.disconnect() };
    }, [])

    // query for gettingall messages from db

    const { data: messages } = useQuery({
        queryKey: ['messages'],
        queryFn: async () => {
            const res = await api.get(`/chats?with=${id}`);
            return res.data;
        }
    })


    useEffect(() => {
        if (socket) {
            socket.on('connect', () => { });
            socket.on('receiveMessage', ({ from, message }) => {
                queryClient.setQueryData(['messages'], (old: any) => {
                    return [...old, { fromId: from, content: message }]
                })
            })
            return () => {
                socket.off("friendRequest");
            };
        }

    }, [socket])

    const handleSend = () => {
        if (socket && user) {
            socket.emit("sendMessage", { to: id, message: messageInput });
            queryClient.setQueryData(['messages'], (old: any) => {
                return [...old, { fromId: user.id, content: messageInput }]
            })
            setMessageInput("");
        }
    }

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    return (



        <div className="_border rounded-[10px] flex flex-col grow-1 ">
            {/* header */}
            <div className="border-b-[1px] border-neutral-300 ">
                <div className="py-5.5 px-6 flex justify-between items-center gap-2">
                    <div className="items-center flex gap-3">
                        <div className="rounded-full size-12 bg-black"></div>
                        <div className="">
                            <h3 className="text-xl leading-7 font-semibold">Alice User</h3>
                            <span className="text-sm leading-5 text-green-300">Online</span>
                        </div>
                    </div>
                    <button className="cursor-pointer p-1 rounded-md transition-all hover:bg-neutral-50">
                        <EllipsisVertical />
                    </button>
                </div>
            </div>

            {/* content */}
            <div className="flex gap-4 flex-col p-4 w-full h-[502px]   overflow-y-scroll">
                {messages && messages.length > 0 ? (messages as IMessage[]).map((msg, idx) => (
                    <div key={idx} className={`w-fit rounded-[10px] text-gray  p-3  ${msg.fromId === user?.id ? 'bg-lightBlue self-end' : "bg-neutral-200"}`}>
                        <p className={`text-wrap mb-1   leading-5 text-sm ${msg.fromId === user?.id ? "text-neutral-900" : ""}`}>{msg.content}</p>
                        <div className="flex justify-end text-xs leading-4 ">10:20 AM</div>
                    </div>
                )) : <span className="flex mt-40 justify-center w-full">Start conversation...</span>
                }


                <div ref={endRef}></div>
            </div>

            {/* input */}
            <div className="border-t-[1px] border-neutral-300 w-full">
                <div className="p-4 flex gap-4 items-center px-10 ">
                    <textarea value={messageInput} onChange={(e) => setMessageInput(e.target.value)} className="input resize-none text-sm leading-5.5  w-full" placeholder="Type your message here..."></textarea>
                    <button onClick={() => handleSend()} className="button-blue h-10 aspect-square">
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>

    )
}

export default Page