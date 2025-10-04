"use client"

import { api } from "@/api/axiosInstance"
import { useSocket } from "@/context/SocketContext"
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks"
import { updateChatNewMessages, updateChatSeen } from "@/redux/chatsSlice"
import { IChat, IMessage } from "@/types/types"
import { current } from "@reduxjs/toolkit"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { CheckCheck, EllipsisVertical, Send } from "lucide-react"
import { useParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"




const Page = () => {
    const { onlineUsers } = useAppSelector(state => state.onlineUsers)
    const { socket } = useSocket();
    const queryClient = useQueryClient();
    const { user } = useAppSelector(state => state.auth)
    const [messageInput, setMessageInput] = useState<string>("")
    const { id } = useParams() as { id: string };
    const { chats } = useAppSelector(state => state.chats);
    const [currentChat, setCurrentChat] = useState<IChat | null>(null);
    const dispatch = useAppDispatch();
    const endRef = useRef<HTMLDivElement>(null);
    const refs = useRef<HTMLDivElement[]>([]);
    const lastMessageRef = useRef<string>("");

    // useQuery for getting all messages from db
    const { data: messages } = useQuery({
        queryKey: ['messages', currentChat?.chatId],
        queryFn: async () => {
            const res = await api.get(`/chats/messages?with=${currentChat?.friend.id}`);
            return res.data;

        },
        enabled: !!currentChat
    })



    // tracking new messages for actions
    useEffect(() => {
        if (!messages || !socket || !user) return;
        const elements = refs.current.filter(Boolean);
        if (!elements.length) return;
        // getting obserrver to define new message to mark it seen 
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = refs.current.findIndex(el => el === entry.target);
                        if (idx !== -1) {
                            const msg = messages[idx];
                            if (!msg.isSeen && msg.fromId !== user.id) {
                                socket.emit("updateSeen", { messageId: msg.id });
                                dispatch(updateChatSeen({ chatId: id }))
                            }
                            observer.unobserve(entry.target);
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        elements.forEach(el => el && observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, [messages, socket, user, currentChat]);


    useEffect(() => {
        if (chats && id) {
            setCurrentChat(chats.find(chat => chat.chatId === id) ?? null);
        }
    }, [chats, id])

    // listening to socket events
    useEffect(() => {
        if (!socket || !user) return;

       
        socket.on('receiveMessage', ({ from, id, messageContent }: { from: string, id: string, messageContent: string }) => {
            queryClient.setQueryData(['messages', currentChat?.chatId], (old: any) => {
                if (currentChat) {
                    dispatch(updateChatNewMessages({ chatId: currentChat.chatId, message: messageContent }));
                }
                return [...old, { fromId: from, content: messageContent, createdAt: new Date(), id: id }]
            })
        })

        socket.on('updateSeen', ({ messageId }: { messageId: string }) => {
            queryClient.setQueryData(['messages', currentChat?.chatId], (old: IMessage[]) => {

                return old.map((item) => {
                    if (item.id == messageId) {
                        return ({ ...item, isSeen: true });
                    } else {
                        return (item);
                    }
                })
            })
        })

        return () => {
            socket.off("receiveMessage");
            socket.off("messageSent");
            socket.off("updateSeen");
        };


    }, [socket])

    // listening to message sent event
    useEffect(() => {
        if (!socket || !user) return;
        socket.on('messageSent', (data: { id: string, createdAt: string | Date }) => {
            queryClient.setQueryData(['messages', currentChat?.chatId], (old: IMessage[] = []) => {
                const updated = [...old, { fromId: user.id, content: lastMessageRef.current, createdAt: new Date(data.createdAt), isSeen: false, id: data.id }];
            });
        })
        return () => {
            socket.off("messageSent");
        };
    }, [user, socket])

    // func for  sending new message
    const handleSend = () => {
        if (socket && user && messageInput.trim() !== "") {
            lastMessageRef.current = messageInput;
            socket.emit("sendMessage", { to: currentChat?.friend.id, message: messageInput });

            setMessageInput("");
        }

    }

    // getting down to the latest messages with scroll 
    useEffect(() => {
        if (refs && messages) {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
            refs.current = Array((messages as IMessage[]).length).fill(null);
        }
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
                            <span className={`text-sm leading-5  ${currentChat && onlineUsers.includes(currentChat.friend.id) ? "text-green-300" : "text-gray"}`}>{currentChat && onlineUsers.includes(currentChat.friend.id) ? "Online" : "Offline"}</span>
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
                    <div ref={(el) => { refs.current[idx] = el! }} key={msg.id ?? idx} className={`w-fit rounded-[10px] text-gray  p-3  ${msg.fromId === user?.id ? 'bg-lightBlue self-end' : "bg-neutral-200"}`}>
                        <p className={`text-wrap mb-1   leading-5 text-sm ${msg.fromId === user?.id ? "text-neutral-900" : ""}`}>{msg.content}</p>
                        <div className="flex justify-between items-center flex-row-reverse gap-2">
                            {
                                msg.fromId == user?.id &&
                                <div className={`${msg.isSeen ? "text-blue" : ""}`}><CheckCheck size={16} /></div>

                            }
                            <div className=" text-xs leading-4 ">{new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}</div>
                        </div>


                    </div>
                )) : <span className="flex mt-40 justify-center w-full">Start conversation</span>
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