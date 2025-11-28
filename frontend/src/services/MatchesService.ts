import { IMatch } from "@/types/types";
import { api } from "./axiosInstance";

class MatchesService {
  async getActiveMatches(): Promise<IMatch[]> {
    const res = await api.get("/matches/active");
    return res.data;
  }

  async getAvailableMatches(): Promise<IMatch[]> {
    const res = await api.get("/matches/available");
    return res.data;
  }

  async generateActiveMatch(
    partnerId: string
  ): Promise<{ match: IMatch; message: string }> {
    const res = await api.post("/matches", { otherId: partnerId });
    return res.data;
  }
}

const matchesService = new MatchesService()
export default matchesService;

