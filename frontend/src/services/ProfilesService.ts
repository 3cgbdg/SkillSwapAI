import { ApiResponse, IUser } from "@/types/types";
import { api } from "./axiosInstance";

class AuthService {


    async getOwnProfile(): Promise<IUser> {
        const res = await api.get(`/auth/profile`);
        return res.data;
    }
    async getProfileById(id: string): Promise<IUser> {
        const res = await api.get(`profiles/${id}`);
        return res.data;
    }

    async uploadImage(form: FormData): Promise<string> {
        const res = await api.post(`profiles/photo/upload`, form);
        return res.data;
    }

    async updateProfile(id: string, data: { name?: string, bio?: string, email?: string }): Promise<string> {
        const res = await api.patch(`profiles/${id}`, data);
        return res.data;
    }

    async deleteAvatarImage(): Promise<ApiResponse<null>> {
        const res = await api.delete(`profiles/photo/delete`);
        return res.data;
    }

}

export default new AuthService();