import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/context/SocketContext";

export const useOnlineUsers = () => {
    const queryClient = useQueryClient();
    const { socket } = useSocket();

    const { data: onlineUsers = [] } = useQuery<string[]>({
        queryKey: ["online-users"],
        queryFn: () => [], // Initial state is empty, updated by sockets
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!socket) return;

        socket.on("friendsOnline", ({ users }: { users: string[] }) => {
            queryClient.setQueryData(["online-users"], users);
        });

        socket.on("setToOffline", ({ id }: { id: string }) => {
            queryClient.setQueryData(["online-users"], (old: string[] = []) =>
                old.filter((userId) => userId !== id)
            );
        });

        socket.on("setToOnline", ({ id }: { id: string }) => {
            queryClient.setQueryData(["online-users"], (old: string[] = []) => {
                if (old.includes(id)) return old;
                return [...old, id];
            });
        });

        return () => {
            socket.off("setToOffline");
            socket.off("setToOnline");
            socket.off("friendsOnline");
        };
    }, [socket, queryClient]);

    return onlineUsers;
};

export default useOnlineUsers;
