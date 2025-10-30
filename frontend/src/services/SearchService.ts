import { Found } from "@/types/types";
import { api } from "./axiosInstance";

class SearchService {
    async searchUsersAndSkillsByChars(chars:string): Promise<Found[]> {
        const res = await api.get("/search", { params: chars });
        return res.data
    }


}


export default new SearchService();
