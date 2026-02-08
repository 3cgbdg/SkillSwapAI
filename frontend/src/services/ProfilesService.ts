import { ApiResponse, IUser } from "@/types/types";
import { api } from "./axiosInstance";

class ProfilesService {
  async getOwnProfile(): Promise<IUser> {
    const res = await api.get("/auth/profile");

    return res.data;
  }
  async getProfileById(id: string): Promise<IUser> {
    const res = await api.get(`profiles/${id}`);
    return res.data;
  }

  async uploadImage(form: FormData): Promise<{ url: string; message: string }> {
    const res: any = await api.post("profiles/photo/upload", form);
    return { url: res.data.url, message: res.message };
  }

  async updateProfile(
    id: string,
    data: { name?: string; bio?: string; email?: string }
  ): Promise<ApiResponse<null>> {
    const res = await api.patch(`profiles/${id}`, data);
    return res.data;
  }

  async getPollingDataAiSuggestions(): Promise<ApiResponse<null | string[]>> {
    const res = await api.get("profiles/ai-suggestions/polling");
    return res.data;
  }

  async deleteAvatarImage(): Promise<ApiResponse<null>> {
    const res = await api.delete("profiles/photo/delete");
    return res.data;
  }
}

const profilesService = new ProfilesService();
export default profilesService;
