"use client"

import FriendsService from "@/services/FriendsService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookUser, MessageSquareMore, UserRound, Users, X } from "lucide-react";
import { useState } from "react"
import Spinner from "./Spinner";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IChat } from "@/types/types";
import { updateChats } from "@/redux/chatsSlice";
import { useAppDispatch } from "@/hooks/reduxHooks";
import ChatsService from "@/services/ChatsService";

// button + fixed friend list
const FriendList = () => {
    const router = useRouter()
    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
    const dispatch = useAppDispatch();

    // getting list of friends
    const { data: friends, isLoading } = useQuery({
        queryKey: ['friends'],
        queryFn: async () => {
            const friends = await FriendsService.getFriends();
            return friends;
        },
        enabled: isPopupOpen,
        staleTime: Infinity,

    })

    const { mutate: createChat } = useMutation({
        mutationFn: async ({ payload }: { payload: { friendId: string, friendName: string } }) => ChatsService.createChat(payload),
        onSuccess: (data: IChat) => {
            setIsPopupOpen(false)
            router.push(`/chats/${data.chatId}`);
            dispatch(updateChats(data));
        }
    })
    return (
        <>
            {/* button */}
            <button onClick={() => setIsPopupOpen(!isPopupOpen)} className="button-transparent z-110 gap-2 text-base! leading-7! font-semibold!  bg-white! w-fit  fixed right-6 bottom-1/20">
                {!isPopupOpen ? <><Users /><span>FriendsList</span> </> : <X />}

            </button>
{isPopupOpen &&
            <div className="max-w-[700px] flex flex-col gap-6 w-full left-1/2 top-1/2 -translate-1/2 _border rounded-2xl fixed bg-white z-110 p-6">
                <h1 className="section-title">Friends list</h1>
                {isLoading ? <Spinner size={24} color="blue" /> :

                    <div className="overflow-y-auto flex flex-col max-h-[600px] gap-2">
                        {friends && (friends.length > 0
                            ?
                            friends.map(friend => (
                                <div key={friend.id} className="_border flex items-center p-3 justify-between gap-4 rounded-2xl">
                                    <div className="flex  gap-4">
                                        <div className=" _border w-[48px] relative h-[48px] flex items-center justify-center rounded-full overflow-hidden">
                                            {!friend?.imageUrl ? <UserRound size={24} /> :
                                                <Image className="object-cover" src={friend.imageUrl} fill alt="user image" />
                                            }
                                        </div>
                                        <span className="text-lg leading-7 font-semibold ">{friend.name}</span>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => {router.push(`/profiles/${friend.id}`); setIsPopupOpen(false)}} className="button-blue">
                                            <BookUser size={20} />
                                        </button>

                                        <button onClick={() => createChat({ payload: { friendId: friend.id, friendName: friend.name } })} className="button-blue flex items-center gap-5">
                                            <MessageSquareMore size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                            :
                            <span className="text-center">No friends yet</span>
                        )}
                    </div>}

            </div> }
            {/* list */}
        </>
    )
}

export default FriendList