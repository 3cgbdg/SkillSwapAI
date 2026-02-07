import { useQuery } from "@tanstack/react-query";
import SessionsService from "@/services/SessionsService";
import { ISession } from "@/types/session";

export const useSessions = () => {
    return useQuery<ISession[]>({
        queryKey: ["sessions"],
        queryFn: SessionsService.getTodaysSessions,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export default useSessions;
