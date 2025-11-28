"use client";

import { Users, X } from "lucide-react";
import { useState } from "react";

import FriendsPopup from "./FriendsPopup";

import useFriends from "@/hooks/useFriends";

// button + fixed friend list
const FriendList = () => {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const { isFetching, friends } = useFriends();
  return (
    <>
      {/* button */}
      <button
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        className="button-transparent z-110 gap-2 text-base! leading-7! font-semibold!  bg-white! w-fit  fixed right-6 bottom-1/20"
      >
        {!isPopupOpen ? (
          <>
            <Users />
            <span>Friends</span>{" "}
          </>
        ) : (
          <X />
        )}
      </button>
      {isPopupOpen && (
        <FriendsPopup
          isLoading={isFetching}
          setIsPopupOpen={setIsPopupOpen}
          friends={friends}
        />
      )}
      {/* list */}
    </>
  );
};

export default FriendList;
