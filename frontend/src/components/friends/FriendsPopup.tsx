"use client";

import { IFriend } from "@/types/chat";
import ChatsService from "@/services/ChatsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookUser, MessageSquareMore } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

import { UserRow } from "@/components/composites";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

const FriendsPopup = ({
  isLoading,
  setIsPopupOpen,
  friends,
}: {
  isLoading: boolean;
  friends: IFriend[];
  setIsPopupOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createChat } = useMutation({
    mutationFn: async (friend: IFriend) =>
      ChatsService.createChat({
        friendId: friend.id,
        friendName: friend.name || "",
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["chats"], (old: unknown) => {
        if (!Array.isArray(old)) return [data];
        return [data, ...old];
      });
      setIsPopupOpen(false);
      router.push(`/inbox/${data.chatId}`);
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && setIsPopupOpen(false)}>
      <DialogContent className="fixed right-6 bottom-24 left-auto top-auto max-h-[70vh] w-[min(100vw-3rem,380px)] translate-x-0 translate-y-0 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Your friends</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : friends.length > 0 ? (
          <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
            {friends.map((friend) => (
              <li key={friend.id}>
                <UserRow
                  media={
                    <UserAvatar
                      name={friend.name}
                      imageUrl={friend.imageUrl}
                      size="sm"
                    />
                  }
                  title={friend.name}
                  actions={
                    <div className="flex shrink-0 gap-1">
                      <Link
                        href={`/profiles/${friend.id}`}
                        className={cn(
                          buttonVariants({
                            variant: "outline",
                            size: "icon-sm",
                          })
                        )}
                        aria-label={`View ${friend.name}'s profile`}
                      >
                        <BookUser size={16} />
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label={`Message ${friend.name}`}
                        onClick={() => createChat(friend)}
                      >
                        <MessageSquareMore size={16} />
                      </Button>
                    </div>
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No friends yet. Add people from search or matches.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FriendsPopup;
