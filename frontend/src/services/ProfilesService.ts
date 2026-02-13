import { IUser } from "@/types/auth";
import { ApiResponse } from "@/types/common";
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

  async uploadAvatarImage(form: FormData): Promise<{ url: string; message: string }> {
    const res = await api.post<{ url: string; message: string }>("profiles/me/avatar/upload", form);
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
