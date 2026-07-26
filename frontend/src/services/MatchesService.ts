import { IMatch } from "@/types/match";
import { api } from "./axiosInstance";

class MatchesService {
  async getActiveMatches(): Promise<IMatch[]> {
    const res = await api.get("/matches/active");
    // #region agent log
    fetch("http://127.0.0.1:7877/ingest/c055a23c-4c84-4eb5-84c0-8abae4e46ddd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "ee6149",
      },
      body: JSON.stringify({
        sessionId: "ee6149",
        hypothesisId: "H1-H2",
        location: "MatchesService.ts:getActiveMatches",
        message: "active matches response",
        data: {
          isArray: Array.isArray(res),
          resKeys:
            res && typeof res === "object" && !Array.isArray(res)
              ? Object.keys(res as object)
              : [],
          dataLen: Array.isArray((res as { data?: unknown })?.data)
            ? (res as { data: unknown[] }).data.length
            : Array.isArray(res)
              ? (res as unknown[]).length
              : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
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
