"use client"

import { io, Socket } from "socket.io-client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { useAppSelector } from "@/hooks/reduxHooks";


interface SocketContextType {
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const {user} = useAppSelector(state=>state.auth);
    useEffect(() => {
        if(!user)return;
        const sock = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
            withCredentials: true
        });
        setSocket(sock);

        return () => {
            sock.disconnect();
        };
    }, [user]);
    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
}