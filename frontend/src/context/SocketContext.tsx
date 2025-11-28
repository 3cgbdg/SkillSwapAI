"use client";

import { io, Socket } from "socket.io-client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAppSelector, useAppDispatch } from "@/hooks/reduxHooks";
import { SocketContextType } from "@/types/types";
import {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} from "@/redux/onlineUsersSlice";

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (!user) return;
    const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      withCredentials: true,
    });
    setSocket(sock);

    const handleFriendsOnline = ({ users }: { users: string[] }) => {
      dispatch(setOnlineUsers(users));
    };

    const handleSetToOnline = ({ id }: { id: string }) => {
      dispatch(addOnlineUser(id));
    };

    const handleSetToOffline = ({ id }: { id: string }) => {
      dispatch(removeOnlineUser(id));
    };

    sock.on("friendsOnline", handleFriendsOnline);
    sock.on("setToOnline", handleSetToOnline);
    sock.on("setToOffline", handleSetToOffline);

    return () => {
      sock.off("friendsOnline", handleFriendsOnline);
      sock.off("setToOnline", handleSetToOnline);
      sock.off("setToOffline", handleSetToOffline);
      sock.disconnect();
    };
  }, [user]);
  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
