"use client"

import { IChat, IFriend } from "@/types/types";
import Image from "next/image";
import { BookUser, MessageSquareMore, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { useMutation } from "@tanstack/react-query";
import { updateChats } from "@/redux/chatsSlice";
import { Dispatch, SetStateAction, useEffect } from "react";
import ChatsService from "@/services/ChatsService";
import Spinner from "../Spinner";
import { toast } from "react-toastify";

const FriendsPopup = ({ friends, isLoading, setIsPopupOpen }: { friends: IFriend[] | undefined, isLoading: boolean, setIsPopupOpen: Dispatch<SetStateAction<boolean>> }) => {
    const router = useRouter()
    const dispatch = useAppDispatch();


    // for getting to chat or creating it 
    const { mutate: createChat } = useMutation({
        mutationFn: async ({ payload }: { payload: { friendId: string, friendName: string } }) => ChatsService.createChat(payload),
        onSuccess: (data) => {
            toast.success(data.message);
            setIsPopupOpen(false)
            router.push(`/chats/${data.chat.chatId}`);
            dispatch(updateChats(data.chat));
        },
        onError: (err) => {
            toast.error(err.message);
        }
    })

    useEffect(() => {
        document.body.style.overflowY = "hidden";
        return () => { document.body.style.overflowY = "auto"; }
    }, [])
    return (
        <div className="size-full fixed inset-0 bg-gray/40 flex items-center justify-center ">
            <div className="max-w-[700px] flex flex-col gap-6 w-full  _border rounded-2xl  bg-white z-110 p-6">
                <h1 className="section-title">Friends</h1>
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
                                        <button onClick={() => { router.push(`/profiles/${friend.id}`); setIsPopupOpen(false) }} className="button-blue">
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

            </div>
        </div>
    )
}

export default FriendsPopup