import {  FormTypeSession, ISession } from "@/types/types";
import { api } from "./axiosInstance";

class SessionsService {
    // colors for events bg
    private colors = ['#5C6BC0', '#FF7043', '#43A047'];

    async getSessions(month: number): Promise<ISession[]> {
        const res = await api.get("/sessions", { params: { month } });
        return res.data;
    }

    async createSession(data: Omit<FormTypeSession, 'friendName'>): Promise<ISession> {
        {
            const res = await api.post("/sessions", { ...data, color: this.colors[Math.floor(Math.random() * 3)] });
            return res.data;
        }
    }
}

export default new SessionsService();