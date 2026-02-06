import { useQuery } from "@tanstack/react-query";
import MatchesService from "@/services/MatchesService";
import { IMatch } from "@/types/match";

export const useMatches = () => {
    return useQuery<IMatch[]>({
        queryKey: ["matches"],
        queryFn: MatchesService.getActiveMatches,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export default useMatches;
