import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FriendsService from "@/services/FriendsService";
import RequestsService from "@/services/RequestsService";
import { ApiResponse } from "@/types/common";
import { IFriend } from "@/types/chat";
import { IRequest } from "@/types/session";
import { useEffect } from "react";
import { showErrorToast, showSuccessToast } from "@/utils/toast";

// hook for maintaining friends and friends requests in cache and in case refething it
export const useFriends = () => {
  const qc = useQueryClient();

  const query = useQuery<IFriend[]>({
    queryKey: ["friends"],
    queryFn: async () => FriendsService.getFriends(),
  });

  // tracking error and showing it
  useEffect(() => {
    if (query.isError) {
      showErrorToast(query.error?.message || "An error occurred");
    }
  }, [query.error, query.isError]);

  // adding friend
  const { mutate: addFriend, isPending } = useMutation<
    { id: string; message: string },
    Error,
    { fromId: string; id: string }
  >({
    mutationFn: async ({ fromId, id }) =>
      FriendsService.createFriend(fromId, id),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["friends"] });
      // if its in friend request
      qc.setQueryData(["reqs"], (old: IRequest[]) => {
        if (!old) return [];
        return old.filter((req: IRequest) => req.id !== data.id);
      });
      showSuccessToast(data.message);
    },
    onError: (err) => {
      showErrorToast(err.message);
    },
  });

  // creating friend request
  const { mutate: createFriendRequest } = useMutation<
    ApiResponse<null>,
    Error,
    { name?: string; id?: string }
  >({
    mutationFn: async (payload) => RequestsService.createFriendRequest(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["reqs"] });
      showSuccessToast(data.message);
    },
    onError: (err) => {
      showErrorToast(err.message);
    },
  });

  return {
    friends: query.data ?? [],
    isFetching: query.isFetching,
    refetch: query.refetch,
    isPendingAddFriend: isPending,
    addFriend,
    createFriendRequest,
  };
};

export default useFriends;
