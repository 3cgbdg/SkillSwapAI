"use client"

import { api } from "@/api/axiosInstance";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { updateChats } from "@/redux/chatsSlice";
import { IChat } from "@/types/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, MessageSquare, MessageSquareMore } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const page = () => {
    const { id } = useParams() as { id: string };
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { data: profile } = useQuery({
        queryKey: ['profile', id],
        queryFn: async () => {
            const res = await api.get(`profiles/${id}`);
            return res.data;
        }
    })
    // for getting 
    const mutationCreateChat = useMutation({
        mutationFn: async ({ payload }: { payload: { friendId: string, friendName: string } }) => { const res = await api.post("/chats", payload); return res.data },
        onSuccess: (data: IChat) => {
            router.push(`/chats/${data.chatId}`);
            dispatch(updateChats(data));
        }
    })

    const redirectToChat = (friendName: string) => {
        // getting chat whether its created or whether its not then creating a new one and getting its id to get route of the chats page of it 
        mutationCreateChat.mutate({ payload: { friendId: id, friendName } });
    }
    return (
        <div className="grid gap-8 grid-cols-3">
            <div className="_border rounded-[10px] col-span-2 banner_gradient flex flex-col gap-4  p-8">
                <div className="flex flex-col gap-2">
                    <h1 className="page-title">Your AI-Powered Training Plan with Alex Rivera</h1>
                    <p className="text-lg leading-7 ">Mastering Advanced JavaScript</p>
                </div>
                <div className="">
                    Description
                </div>
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl leading-7 font-semibold">Benefits:</h3>
                    <ol className="list-disc">

                        <li className="">dsd</li>
                        <li className="">dsd</li>
                        <li className="">dsd</li>
                    </ol>
                </div>
            </div>
            <div className="_border rounded-[10px] col-span-1 p-6">
                <div className="flex flex-col gap-4 items-center">
                    <div className="size-24 rounded-full bg-black"></div>
                    <h2 className="section-title">{profile?.name}</h2>
                    <div className="flex flex-col gap-3 mt-4 w-full">
                        <button onClick={() => redirectToChat(profile.name)} className="button-blue flex items-center gap-5">
                            <MessageSquareMore size={20} />
                            <span>Message {profile?.name}</span>
                        </button>
                        <button className="button-transparent rounded-md! flex items-center gap-5">
                            <Calendar size={20} />
                            <span>Schedule Session</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page