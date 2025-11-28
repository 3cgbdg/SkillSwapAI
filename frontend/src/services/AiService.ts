import { api } from "./axiosInstance";

class AiService {
  async getNewAiSuggestionSkills(): Promise<{
    skills: string[];
    message: string;
  } | null> {
    const res = await api.post("/ai/profile/skills");
    return res.data;
  }
}

const aiService = new AiService();
export default aiService;
