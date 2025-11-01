import { IUser } from "@/types/types";
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

}

export default new AuthService();