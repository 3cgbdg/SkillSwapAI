import { IFriend } from "@/types/types";
import { api } from "./axiosInstance";

class FriendsService {
    async getFriends(): Promise<IFriend[]> {
        const res = await api.get("/friends");
        return res.data
    }

    async createFriend(fromId: string, id: string): Promise<string> {
        await api.post("/friends", { id: fromId });
        return id;
    }

}

export default new FriendsService()