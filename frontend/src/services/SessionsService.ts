import { ISession } from "@/types/session";
import { api } from "./axiosInstance";
import { createSessionFormData } from "@/validation/createSession";

class SessionsService {
  // colors for events bg
  private colors = ["#5C6BC0", "#FF7043", "#43A047"];

  async getSessions(month: number): Promise<ISession[]> {
    const res = await api.get("/sessions", { params: { month } });
    return res.data;
  }
  async getTodaysSessions(): Promise<ISession[]> {
    const res = await api.get("/sessions/today");
    return res.data;
  }

  async createSession(
    data: Omit<createSessionFormData, "friendName">
  ): Promise<{ session: ISession; message: string }> {
    const res = await api.post("/sessions", {
      ...data,
      color: this.colors[Math.floor(Math.random() * 3)],
    });
    return res.data;
  }
}

const sessionsService = new SessionsService();
export default sessionsService;
