"use client";

import { io, Socket } from "socket.io-client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { SocketContextType, IChat } from "@/types/types";
import {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} from "@/redux/onlineUsersSlice";
import { updateChatNewMessagesForReceiver } from "@/redux/chatsSlice";
import friendsService from "@/services/FriendsService";

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const { chats } = useAppSelector((state) => state.chats);
  const dispatch = useAppDispatch();
  const chatsRef = useRef<IChat[] | null>(chats);

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  const getOnlineFriends = async () => {
    const data = await friendsService.getFriendsOnlineStatus();
    dispatch(setOnlineUsers(data));
  }

  useEffect(() => {
    if (!user) return;
    const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      withCredentials: true,
    });
    setSocket(sock);


    const handleSetToOnline = ({ id }: { id: string }) => {
      dispatch(addOnlineUser(id));
    };
    getOnlineFriends();
    const intervalGetOnlineStatus = setInterval(async () => {
      getOnlineFriends();
    }, 30000)
    sock.on("setToOnline", handleSetToOnline);

    const intervalHeartbeat = setInterval(() => {
      sock.emit('heartbeat');
    }, 30000);




    const handleReceiveMessage = (payload: {
      from: string;
      id: string;
      messageContent: string;
    }) => {
      const chat = (chatsRef.current || []).find(
        (c) => c.friend.id === payload.from
      );
      if (chat) {
        dispatch(
          updateChatNewMessagesForReceiver({
            chatId: chat.chatId,
            message: payload.messageContent,
          })
        );
      }
    };

    sock.on("receiveMessage", handleReceiveMessage);

    return () => {
      clearInterval(intervalHeartbeat);
      clearInterval(intervalGetOnlineStatus);
      sock.off("setToOnline", handleSetToOnline);
      sock.off("receiveMessage", handleReceiveMessage);
      sock.disconnect();
    };
  }, [user, dispatch]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
