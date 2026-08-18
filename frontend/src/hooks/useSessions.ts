import { useQuery } from "@tanstack/react-query";
import SessionsService from "@/services/SessionsService";
import { ISession } from "@/types/session";

export const useSessions = () => {
  return useQuery<ISession[]>({
    queryKey: ["sessions"],
    queryFn: () => {
      const from = new Date();
      from.setHours(0, 0, 0, 0);
      const to = new Date(from);
      to.setFullYear(to.getFullYear() + 1);
      return SessionsService.getSessionsRange(
        from.toISOString(),
        to.toISOString()
      );
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export default useSessions;
