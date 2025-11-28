import { ApiResponse, IRequest } from "@/types/types";
import { api } from "./axiosInstance";

class RequestsService {
  async getRequests(): Promise<IRequest[]> {
    {
      const res = await api.get("/requests");
      return res.data;
    }
  }

  async createFriendRequest({
    name,
    id,
  }: {
    name?: string;
    id?: string;
  }): Promise<ApiResponse<null>> {
    const res = name
      ? await api.post("/requests", { name })
      : await api.post("/requests", { id });
    return res.data;
  }

  async deleteRequest(requestId: string): Promise<string> {
    const res = await api.delete(`/requests/${requestId}`);
    return res.data;
  }

  async acceptSessionRequest({
    sessionId,
    requestId,
    friendId,
  }: {
    sessionId: string;
    requestId: string;
    friendId: string;
  }): Promise<string> {
    const res = await api.post(`/sessions/${sessionId}/accepted`, {
      requestId,
      friendId,
    });
    return res.data;
  }
  async rejectSessionRequest({
    sessionId,
    requestId,
    friendId,
  }: {
    sessionId: string;
    requestId: string;
    friendId: string;
  }): Promise<string> {
    const res = await api.post(`/sessions/${sessionId}/rejected`, {
      requestId,
      friendId,
    });
    return res.data;
  }
}

export default new RequestsService();
