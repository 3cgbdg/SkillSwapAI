"use client"

import FriendsService from "@/services/FriendsService";
import { useQuery } from "@tanstack/react-query";
import { Users, X } from "lucide-react";
import { useEffect, useState } from "react"

import FriendsPopup from "./FriendsPopup";
import { toast } from "react-toastify";

// button + fixed friend list
const FriendList = () => {

    const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);

    // getting list of friends
    const { data: friends, isLoading, isError, error } = useQuery({
        queryKey: ['friends'],
        queryFn: async () => {
            const friends = await FriendsService.getFriends();
            return friends;
        },
        enabled: isPopupOpen,
        staleTime: Infinity,

    })

    useEffect(() => {
        if (isError) {
            toast.error(error.message);
        }
    }, [isError, error])

    return (
        <>
            {/* button */}
            <button onClick={() => setIsPopupOpen(!isPopupOpen)} className="button-transparent z-110 gap-2 text-base! leading-7! font-semibold!  bg-white! w-fit  fixed right-6 bottom-1/20">
                {!isPopupOpen ? <><Users /><span>Friends</span> </> : <X />}

            </button>
            {isPopupOpen &&
                <FriendsPopup isLoading={isLoading} setIsPopupOpen={setIsPopupOpen} friends={friends} />}
            {/* list */}
        </>
    )
}

export default FriendList