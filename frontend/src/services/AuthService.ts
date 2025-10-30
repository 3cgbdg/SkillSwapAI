import { ApiResponse, FormTypeLogIn } from "@/types/types";
import { api } from "./axiosInstance";
import { signUpFormData } from "@/validation/signUp";

class AuthService {
    async logIn(data: FormTypeLogIn): Promise<ApiResponse<null>> {
        const res = await api.post('/auth/login', data);
        return res.data;
    }

    async signUp(data: Omit<signUpFormData, 'checkBox'>, knownSkills: string[] | null, skillsToLearn: string[] | null): Promise<ApiResponse<null>> {
        const res = await api.post('/auth/signup', { ...data, knownSkills, skillsToLearn });
        return res.data
    }

    async logOut(): Promise<ApiResponse<null>> {
        const res = await api.delete("/auth/logout");
        return res.data;

    }
}

export default new AuthService();