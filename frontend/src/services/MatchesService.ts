import { IMatch } from "@/types/match";
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
  ): Promise<{ jobId: string; message: string }> {
    const res: { jobId?: string; message?: string; data?: { jobId: string } } =
      await api.post("/matches", { otherId: partnerId });
    const jobId = res.jobId ?? res.data?.jobId ?? "";
    return { jobId, message: res.message ?? "Match generation started" };
  }
}

const matchesService = new MatchesService();
export default matchesService;
