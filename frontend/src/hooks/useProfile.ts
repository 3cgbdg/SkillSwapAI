import { useQuery } from "@tanstack/react-query";
import ProfilesService from "@/services/ProfilesService";
import { IUser } from "@/types/types";

export const useProfile = () => {
    return useQuery<IUser>({
        queryKey: ["profile"],
        queryFn: ProfilesService.getOwnProfile,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 3,
    });
};

export default useProfile;
