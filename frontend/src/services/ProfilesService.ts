import { IUser } from "@/types/auth";
import { ApiResponse } from "@/types/common";
import { api } from "./axiosInstance";

class ProfilesService {
  async getOwnProfile(): Promise<IUser> {
    const res = await api.get("/auth/profile");
    // #region agent log
    fetch("http://127.0.0.1:7877/ingest/c055a23c-4c84-4eb5-84c0-8abae4e46ddd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "ee6149",
      },
      body: JSON.stringify({
        sessionId: "ee6149",
        hypothesisId: "H1-H3",
        location: "ProfilesService.ts:getOwnProfile",
        message: "profile response shape",
        data: {
          topKeys:
            res && typeof res === "object" ? Object.keys(res as object) : [],
          hasDataKey: !!(res as { data?: unknown })?.data,
          completedSessionsCount:
            (res as { data?: { completedSessionsCount?: number } })?.data
              ?.completedSessionsCount ??
            (res as { completedSessionsCount?: number })
              ?.completedSessionsCount,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return res.data;
  }
  async getProfileById(id: string): Promise<IUser> {
    const res = await api.get(`profiles/${id}`);
    return res.data;
  }

  async uploadAvatarImage(
    form: FormData
  ): Promise<{ url: string; message: string }> {
    const res = await api.post<{ url: string; message: string }>(
      "profiles/me/avatar/upload",
      form
    );
    return res.data;
  }

  async updateProfile(
    id: string,
    data: { name?: string; bio?: string; email?: string }
  ): Promise<ApiResponse<null>> {
    const res = await api.patch(`profiles/${id}`, data);
    return res.data;
  }

  async deleteAvatarImage(): Promise<ApiResponse<null>> {
    const res = await api.delete("profiles/me/avatar/delete");
    return res.data;
  }
}

const profilesService = new ProfilesService();
export default profilesService;
