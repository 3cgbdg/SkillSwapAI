import { ISession, SessionColorKey } from "@/types/session";
import { api } from "./axiosInstance";
import { createSessionFormData } from "@/validation/createSession";
import { SESSION_COLOR_KEYS } from "@/utils/sessionColors";

class SessionsService {
  async getSessionsRange(from: string, to: string): Promise<ISession[]> {
    const res = await api.get("/sessions", { params: { from, to } });
    return res.data;
  }

  async getSessions(month: number): Promise<ISession[]> {
    const year = new Date().getFullYear();
    const from = new Date(year, month, 1).toISOString();
    const to = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
    return this.getSessionsRange(from, to);
  }

  async getTodaysSessions(): Promise<ISession[]> {
    const res = await api.get("/sessions/today");
    return res.data;
  }

  async createSession(
    data: Omit<createSessionFormData, "friendName">
  ): Promise<{ session: ISession; message: string }> {
    const color =
      data.color ??
      (SESSION_COLOR_KEYS[
        Math.floor(Math.random() * SESSION_COLOR_KEYS.length)
      ] as SessionColorKey);
    const res: { data: ISession; message: string } = await api.post(
      "/sessions",
      {
        ...data,
        color,
      }
    );
    return { session: res.data, message: res.message };
  }
}

const sessionsService = new SessionsService();
export default sessionsService;
