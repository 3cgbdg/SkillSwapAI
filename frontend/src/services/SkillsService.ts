import { ApiResponse } from "@/types/types";
import { api } from "./axiosInstance";

class SkillsService {
  async getSkills(chars: string): Promise<{ id: string; title: string }[]> {
    const res = await api.get("/skills", { params: { chars } });
    return res.data;
  }

  async addKnownSkill(str: string): Promise<ApiResponse<null>> {
    const res = await api.post("/skills/known", { title: str });
    return res.data;
  }
  async addWantToLearnSkill(
    str: string,
    aiGenerated: boolean = false
  ): Promise<ApiResponse<null>> {
    const res = await api.post(
      `/skills/want-to-learn${aiGenerated ? "?ai=true" : ""}`,
      { title: str }
    );
    return res.data;
  }

  async deleteKnownSkill(str: string): Promise<ApiResponse<null>> {
    const res = await api.delete("/skills/known", { params: { title: str } });
    return res.data;
  }
  async deleteWantToLearnSkill(str: string): Promise<ApiResponse<null>> {
    const res = await api.delete("/skills/want-to-learn", {
      params: { title: str },
    });
    return res.data;
  }
}

const skillsService = new SkillsService();
export default skillsService;
