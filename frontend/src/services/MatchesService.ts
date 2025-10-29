import { IMatch } from "@/types/types";
import { api } from "./axiosInstance";

class MatchesService {
    async getMatches(): Promise<IMatch[]> {
        const res = await api.get(`/matches`);
        return res.data;
    }
}

export default new MatchesService();