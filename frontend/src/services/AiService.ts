import { api } from "./axiosInstance";

class AiService {

    async getNewAiSuggestionSkills(): Promise<string[] | null> {
        const res = await api.post('/ai/profile/skills');
        return res.data;
    }
}

export default new AiService();