"use client";

import { Users, X } from "lucide-react";
import { useState } from "react";

import FriendsPopup from "./FriendsPopup";

import useFriends from "@/hooks/useFriends";
import { Button } from "@/components/ui/button";

const FriendList = () => {
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const { isFetching, friends } = useFriends();
  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="fixed bottom-[5%] right-6 z-[var(--z-dropdown)] gap-2 bg-background"
        onClick={() => setIsPopupOpen(!isPopupOpen)}
        aria-label={isPopupOpen ? "Close friends" : "Open friends"}
      >
        {!isPopupOpen ? (
          <>
            <Users />
            <span>Friends</span>
          </>
        ) : (
          <X />
        )}
      </Button>
      {isPopupOpen && (
        <FriendsPopup
          isLoading={isFetching}
          setIsPopupOpen={setIsPopupOpen}
          friends={friends}
        />
      )}
    </>
  );
};

export default FriendList;
