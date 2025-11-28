"use client";

import { useSocket } from "@/context/SocketContext";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import { updateChats } from "@/redux/chatsSlice";
import {
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers,
} from "@/redux/onlineUsersSlice";
import ChatsService from "@/services/ChatsService";
import useFriends from "@/hooks/useFriends";
import { IChat, IFriend } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Spinner from "../Spinner";

// friend interface

const ChatSidebar = () => {
  // for routing across chats
  const router = useRouter();
  const path = usePathname();
  const [chars, setChars] = useState<string>("");
  const { friends, isFetching, refetch } = useFriends();
  const dispatch = useAppDispatch();
  const { chats } = useAppSelector((state) => state.chats);
  const { onlineUsers } = useAppSelector((state) => state.onlineUsers);
  const { socket } = useSocket();
  const [isFullyOpen, setIsFullyOpen] = useState<boolean>(true);
  useEffect(() => {
    if (!socket) return;
    socket.on("connect", () => {});
    socket.on("friendsOnline", ({ users }: { users: string[] }) => {
      dispatch(setOnlineUsers(users));
      console.log(users + "is online");
    });
    socket.on("setToOffline", ({ id }: { id: string }) => {
      dispatch(removeOnlineUser(id));
      console.log(id + "is offine");
    });
    socket.on("setToOnline", ({ id }: { id: string }) => {
      dispatch(addOnlineUser(id));
      console.log(id + "is online");
    });
    return () => {
      socket.off("setToOffline");
      socket.off("setToOnline");
      socket.off("friendsOnline");
    };
  }, [socket]);

  // friends are provided by useFriends(); call refetch() when we need to force load

  // for getting to chat or creating it
  const { mutate: createChat } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: { friendId: string; friendName: string };
    }) => ChatsService.createChat(payload),
    onSuccess: (data) => {
      dispatch(updateChats(data.chat));
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  return (
    <div
      className={`_border rounded-[10px] py-6 px-4 ${isFullyOpen ? "md:w-[340px]" : "md:w-fit"} w-full overflow-hidden flex flex-col grow-0 shrink-0 h-full `}
    >
      <div className="flex flex-col gap-1.5 mb-4">
        <div
          className={`flex items-center  ${isFullyOpen ? "justify-between" : "justify-center"} gap-2`}
        >
          {isFullyOpen && <h2 className="section-title">Messages</h2>}
          <button
            onClick={() => setIsFullyOpen(!isFullyOpen)}
            className={` cursor-pointer md:block hidden transition-all hover:text-blue `}
          >
            {isFullyOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
          </button>
        </div>
        {isFullyOpen && (
          <div className="_border p-2 rounded-2xl flex justify-between relative  leading-6">
            <input
              onChange={async (e) => {
                setChars(e.target.value);

                if (e.target.value.length === 1) {
                  await refetch();
                }
              }}
              placeholder="Create a new conversation with..."
              value={chars}
              className="basis-full text-sm px-2 outline-none"
            />
            {!isFetching ? (
              friends &&
              chars.length > 0 &&
              friends.length > 0 && (
                <div className="left-0 top-full absolute z-10 min-w-[250px] ">
                  <div className="flex flex-col gap-2 mt-2 p-2  _border bg-white rounded-md ">
                    <div className="flex flex-col  gap-1 max-h-[500px]  border-neutral-300">
                      {friends
                        .filter((friend) =>
                          friend.name
                            .toLowerCase()
                            .includes(chars.toLocaleLowerCase())
                        )
                        .map((friend, index) => {
                          return (
                            <button
                              onClick={() => {
                                setChars("");
                                createChat({
                                  payload: {
                                    friendId: friend.id,
                                    friendName: friend.name,
                                  },
                                });
                              }}
                              key={index}
                              className="flex gap-2 button-transparent items-center  rounded-xl  "
                            >
                              <Users size={20} />
                              {friend.name}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <div className="mr-2">
                <Spinner color="blue" size={20} />
              </div>
            )}
            <div className="flex items-center justify-center">
              <Search size={20} />
            </div>
          </div>
        )}
      </div>
      {isFullyOpen && (
        <p className="text-sm leading-5 text-gray my-2">Recent conversations</p>
      )}

      <div className="flex flex-col overflow-y-auto flex-1  gap-2">
        {chats?.map((chat, idx) => (
          <button
            key={idx}
            onClick={() => router.push(`/chats/${chat.chatId}`)}
            className={`rounded-[6px] p-3.5 cursor-pointer ${path == `/chats/${chat.chatId}` ? "bg-lightBlue" : ""} transition-all  hover:bg-lightBlue flex gap-4 justify-between`}
          >
            <div className="flex  gap-4 items-center">
              <div className="size-12  flex items-center justify-center relative rounded-full _border ">
                {chat?.friend.imageUrl ? (
                  <div className="size-12   relative rounded-full _border ">
                    <Image
                      className="object-cover rounded-full"
                      src={chat.friend.imageUrl}
                      fill
                      alt="user image"
                    />
                    <div
                      className={`absolute bottom-0  right-0 border-2 border-white rounded-full size-3 ${onlineUsers.includes(chat.friend.id) ? "bg-green-500" : "bg-gray"}`}
                    ></div>
                  </div>
                ) : (
                  <div>
                    <UserRound size={24} />
                    <div
                      className={`absolute bottom-0  right-0 border-2 border-white rounded-full size-3 ${onlineUsers.includes(chat.friend.id) ? "bg-green-500" : "bg-gray"}`}
                    ></div>
                  </div>
                )}
              </div>

              {isFullyOpen && (
                <div className="text-left">
                  <h3 className="">{chat.friend.name}</h3>
                  <p className="text-gray leading-5 text-sm">
                    {chat.lastMessageContent?.slice(0, 20)}...
                  </p>
                </div>
              )}
            </div>
            {isFullyOpen && (
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs leading-4 text-gray">
                  {chat._max
                    ? new Date(chat._max.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : null}
                </span>
                {chat._count && chat._count.id > 0 && (
                  <span className="rounded-full bg-blue text-white text-xs leading-5 font-semibold px-2 py-.5">
                    {chat._count.id}
                  </span>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ChatSidebar);
