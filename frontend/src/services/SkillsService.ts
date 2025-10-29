import { api } from "./axiosInstance";

class SkillsService {
    async getSkills(chars: string) {
        console.log(chars)
        const res = await api.get('/skills', { params: { chars } });
        return res.data;
    }
}

export default new SkillsService();