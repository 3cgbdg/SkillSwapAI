import { ApiResponse, FormTypeLogIn, FormTypeSignUp } from "@/types/types";
import { api } from "./axiosInstance";

class AuthService {
    async logIn(data: FormTypeLogIn): Promise<ApiResponse<null>> {
        const res = await api.post('/auth/login', data);
        return res.data;
    }

    async signUp(data: FormTypeSignUp, knownSkills: string[] | null, skillsToLearn: string[] | null): Promise<ApiResponse<null>> {
        const res = await api.post('/auth/signup', { ...data, knownSkills, skillsToLearn });
        return res.data
    }

    async logOut(): Promise<ApiResponse<null>> {
        const res = await api.delete("/auth/logout");
        return res.data;

    }
}

export default new AuthService();