import { IGeneratedPlan, IMatch } from "@/types/types";
import { api } from "./axiosInstance";

class MatchesService {
    async getMatches(): Promise<IMatch[]> {
        const res = await api.get(`/matches`);
        return res.data;
    }
    async generateMatches(): Promise<IMatch[]> {
        const res = await api.post('/matches');
        return res.data;
    }

    async generatePlan(): Promise<IGeneratedPlan> {
        const res = await api.post('/matches/plan');
        return res.data
    }

    async getPlan(currentMatchId: string | undefined): Promise<IGeneratedPlan | null> {

        if (!currentMatchId) return null;
        const res = await api.get(`/matches/${currentMatchId}/plan`);
        return res.data as IGeneratedPlan;

    }
}

export default new MatchesService();