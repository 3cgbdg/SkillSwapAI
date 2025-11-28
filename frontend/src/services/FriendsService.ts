import { IFriend } from "@/types/types";
import { api } from "./axiosInstance";

class FriendsService {
  async getFriends(): Promise<IFriend[]> {
    const res = await api.get("/friends");
    return res.data;
  }

  async createFriend(
    fromId: string,
    id: string
  ): Promise<{ id: string; message: string }> {
    const data = (await api.post("/friends", { id: fromId })) as {
      message: string;
    };
    return { id, message: data.message };
  }
}

const friendsService = new FriendsService()
export default friendsService;

