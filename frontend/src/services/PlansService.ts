import { ApiResponse, IGeneratedPlan } from "@/types/types";
import { api } from "./axiosInstance";

class PlansService {
    async generatePlan(): Promise<IGeneratedPlan> {
        const res = await api.post('/plans');
        return res.data
    }

    async getPlan(currentMatchId: string | undefined): Promise<IGeneratedPlan | null> {

        if (!currentMatchId) return null;
        const res = await api.get(`/plans/${currentMatchId}`);
        return res.data as IGeneratedPlan;

    }

    async setModuleStatusToCompleted(planId: string, moduleId: string): Promise<ApiResponse<null>> {
        const res = await api.patch(`/plans/${planId}/modules/${moduleId}/status/completed`);
        return res.data;
    }
}

export default new PlansService(); 