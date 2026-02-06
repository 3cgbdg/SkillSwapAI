import { ApiResponse } from "@/types/common";
import { IGeneratedPlan } from "@/types/plan";
import { api } from "./axiosInstance";

class PlansService {
  async getPlan(
    currentMatchId: string | undefined
  ): Promise<IGeneratedPlan | null> {
    if (!currentMatchId) return null;
    const res = await api.get(`/plans/${currentMatchId}`);
    return res.data as IGeneratedPlan;
  }

  async setModuleStatusToCompleted(
    planId: string,
    moduleId: string
  ): Promise<ApiResponse<null>> {
    const res = await api.patch(
      `/plans/${planId}/modules/${moduleId}/status/completed`
    );
    return res.data;
  }
}

const plansService = new PlansService();
export default plansService;
