import { ApiResponse, formTypeLogIn, formTypeSignUp, IMatch, IUser } from "@/types/types";
import { api } from "./axiosInstance";

class AuthService {
    async logIn(data: formTypeLogIn): Promise<ApiResponse<null>> {
        const res = await api.post('/auth/login', data);
        return res.data;
    }

    async getProfile(): Promise<IUser> {
        const res = await api.get(`/auth/profile`);
        return res.data;
    }
    async signUp(data: formTypeSignUp, knownSkills: string[] | null, skillsToLearn: string[] | null): Promise<ApiResponse<null>> {
        const res = await api.post('/auth/signup', { ...data, knownSkills, skillsToLearn });
        return res.data
    }
}

export default new AuthService();