import { api } from "./axiosInstance";

class AiService {
  async getNewAiSuggestionSkills(): Promise<{
    skills: string[];
    message: string;
  } | null> {
    const res: any = await api.post("/ai/profile/skills");
    if (!res) return null;
    return { skills: res.data, message: res.message };
  }
}

const aiService = new AiService();
export default aiService;
