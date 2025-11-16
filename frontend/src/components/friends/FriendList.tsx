"use client"

import FriendsService from "@/services/FriendsService";
import { useMutation, useQuery } from "@tanstack/react-query";
import { BookUser, MessageSquareMore, UserRound, Users, X } from "lucide-react";
import { useState } from "react"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IChat } from "@/types/types";
import { updateChats } from "@/redux/chatsSlice";
import { useAppDispatch } from "@/hooks/reduxHooks";
import ChatsService from "@/services/ChatsService";
import FriendsPopup from "./FriendsPopup";

// button + fixed friend list
const FriendList = () => {

    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

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


    return (
        <>
            {/* button */}
            <button onClick={() => setIsPopupOpen(!isPopupOpen)} className="button-transparent z-110 gap-2 text-base! leading-7! font-semibold!  bg-white! w-fit  fixed right-6 bottom-1/20">
                {!isPopupOpen ? <><Users /><span>Friends</span> </> : <X />}

            </button>
            {isPopupOpen &&
                <FriendsPopup isLoading={isLoading} setIsPopupOpen={setIsPopupOpen} friends={friends}/>}
            {/* list */}
        </>
    )
}

export default FriendList