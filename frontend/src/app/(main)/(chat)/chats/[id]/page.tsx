"use client";

import { useSocket } from "@/context/SocketContext";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHooks";
import {
  updateChatNewMessagesForReceiver,
  updateChatNewMessagesForSender,
  updateChatSeen,
} from "@/redux/chatsSlice";
import { IChat, IMessage } from "@/types/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCheck, EllipsisVertical, Send, UserRound } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ChatsService from "@/services/ChatsService";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import Spinner from "@/components/Spinner";

const Page = () => {
  const { onlineUsers } = useAppSelector((state) => state.onlineUsers);
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const [messageInput, setMessageInput] = useState<string>("");
  const { id } = useParams() as { id: string };
  const { chats } = useAppSelector((state) => state.chats);
  const [currentChat, setCurrentChat] = useState<IChat | null>(null);
  const dispatch = useAppDispatch();
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const refs = useRef<HTMLDivElement[]>([]);
  const lastMessageRef = useRef<string>("");
  // useQuery for getting all messages from db
  const {
    data: messages,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["messages", currentChat?.friend.id],
    queryFn: async () => ChatsService.getChat(currentChat?.friend.id),

    enabled: !!currentChat,
  });

  // handling messages error

  useEffect(() => {
    if (isError) {
      toast.error(error.message);
    }
  }, [error, isError]);

  // tracking new messages for seeing it
  useEffect(() => {
    if (!messages || !socket || !user) return;
    const elements = refs.current.filter(Boolean);
    if (!elements.length) return;
    // getting obserrver to define new message to mark it seen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = refs.current.findIndex((el) => el === entry.target);
            if (idx !== -1) {
              const msg = messages[idx];
              if (!msg.isSeen && msg.fromId !== user.id) {
                if (socket?.connected) {
                  socket.emit("updateSeen", { messageId: msg.id });
                }
                dispatch(updateChatSeen({ chatId: id }));
              }
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.5, root: containerRef.current }
    );

    elements.forEach((el) => el && observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [messages, socket, user, currentChat, dispatch, id]);

  // getting current chat
  useEffect(() => {
    if (chats && id) {
      setCurrentChat(chats.find((chat) => chat.chatId === id) ?? null);
    }
  }, [chats, id]);

  // listening to socket events
  useEffect(() => {
    if (!socket || !user || !currentChat) return;

    // Handler for receiving messages
    const handleReceiveMessage = ({
      from,
      id,
      messageContent,
    }: {
      from: string;
      id: string;
      messageContent: string;
    }) => {
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: IMessage[] = []) => {
          // Only add message if it's from the other person in this chat
          if (from === currentChat.friend.id) {
            dispatch(
              updateChatNewMessagesForReceiver({
                chatId: currentChat.chatId,
                message: messageContent,
              })
            );
            return [
              ...old,
              {
                fromId: from,
                content: messageContent,
                createdAt: new Date(),
                id: id,
              },
            ];
          }
          return old;
        }
      );
    };

    // Handler for message sent confirmation
    const handleMessageSent = (data: {
      id: string;
      createdAt: string | Date;
    }) => {
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: IMessage[] = []) => {
          dispatch(
            updateChatNewMessagesForSender({
              chatId: currentChat.chatId,
              message: lastMessageRef.current,
            })
          );
          return [
            ...old,
            {
              fromId: user.id,
              content: lastMessageRef.current,
              createdAt: new Date(data.createdAt),
              isSeen: false,
              id: data.id,
            },
          ];
        }
      );
    };

    // Handler for message seen update
    const handleUpdateSeen = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData(
        ["messages", currentChat.friend.id],
        (old: IMessage[] = []) => {
          if (!old) return old;
          return old.map((item) => {
            if (item.id == messageId) {
              return { ...item, isSeen: true };
            } else {
              return item;
            }
          });
        }
      );
    };

    // Register handlers
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messageSent", handleMessageSent);
    socket.on("updateSeen", handleUpdateSeen);

    // Cleanup: remove handlers only for this specific chat
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messageSent", handleMessageSent);
      socket.off("updateSeen", handleUpdateSeen);
    };
  }, [socket, user, currentChat, queryClient, dispatch]);

  // func for  sending new message
  const handleSend = () => {
    if (socket && currentChat && user && messageInput.trim() !== "") {
      lastMessageRef.current = messageInput;
      if (socket?.connected) {
        socket.emit("sendMessage", {
          to: currentChat.friend.id,
          message: messageInput,
        });
      }

      setMessageInput("");
    }
  };

  // getting down to the latest messages with scroll
  useEffect(() => {
    if (refs && messages) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
      refs.current = Array((messages as IMessage[]).length).fill(null);
    }
  }, [messages]);

  return (
    <div className="flex flex-col gap-4">
      <Link href={"/chats"} className="md:hidden! button-blue ">
        Go to chats
      </Link>
      <div className="_border rounded-[10px] flex flex-col grow-1 ">
        {/* header */}
        <div className="border-b-[1px] border-neutral-300 ">
          <div className="py-5.5 px-6 flex justify-between items-center gap-2">
            <div className="items-center flex gap-3">
              <div className="size-12  flex items-center justify-center relative rounded-full border-2 _border ">
                {currentChat?.friend.imageUrl ? (
                  <Image
                    className="object-cover rounded-full"
                    src={currentChat?.friend.imageUrl}
                    fill
                    alt="user image"
                  />
                ) : (
                  <UserRound size={24} />
                )}
              </div>
              <div className="">
                <h3 className="text-xl leading-7 font-semibold">
                  {currentChat?.friend.name}
                </h3>
                <span
                  className={`text-sm leading-5  ${currentChat && onlineUsers.includes(currentChat.friend.id) ? "text-green-300" : "text-gray"}`}
                >
                  {currentChat && onlineUsers.includes(currentChat.friend.id)
                    ? "Online"
                    : "Offline"}
                </span>
              </div>
            </div>
            <button className="cursor-pointer p-1 rounded-md transition-all hover:bg-neutral-50">
              <EllipsisVertical />
            </button>
          </div>
        </div>

        {/* content */}
        <div
          ref={containerRef}
          className="flex gap-4 flex-col p-4 w-full h-[502px]   overflow-y-scroll"
        >
          {!isLoading ? (
            messages && messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  ref={(el) => {
                    refs.current[idx] = el!;
                  }}
                  key={msg.id ?? idx}
                  className={`w-fit rounded-[10px] text-gray  p-3  ${msg.fromId === user?.id ? "bg-lightBlue self-end" : "bg-neutral-200"}`}
                >
                  <p
                    className={`wrap-anywhere mb-1   leading-5 text-sm ${msg.fromId === user?.id ? "text-neutral-900" : ""}`}
                  >
                    {msg.content}
                  </p>
                  <div className="flex justify-between items-center flex-row-reverse gap-2">
                    {msg.fromId == user?.id && (
                      <div className={`${msg.isSeen ? "text-blue" : ""}`}>
                        <CheckCheck size={16} />
                      </div>
                    )}
                    <div className=" text-xs leading-4 ">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <span className="flex mt-40 justify-center w-full">
                Start conversation
              </span>
            )
          ) : (
            <div className="h-100 flex items-center justify-center">
              <Spinner color="blue" size={44} />
            </div>
          )}

          <div ref={endRef}></div>
        </div>

        {/* input */}
        <div className="border-t-[1px] border-neutral-300 w-full">
          <div className="p-4 flex gap-4 items-center px-10 ">
            <textarea
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="input resize-none text-sm leading-5.5  w-full"
              placeholder="Type your message here..."
            ></textarea>
            <button
              onClick={() => handleSend()}
              className="button-blue h-10 aspect-square"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
