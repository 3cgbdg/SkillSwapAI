import { useQuery } from "@tanstack/react-query";
import ChatsService from "@/services/ChatsService";
import { IChat } from "@/types/chat";

export const useChats = () => {
    return useQuery<IChat[]>({
        queryKey: ["chats"],
        queryFn: ChatsService.getChats,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export default useChats;
