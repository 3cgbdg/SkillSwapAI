import { ApiResponse } from "@/types/common";
import { api } from "./axiosInstance";
import { signUpFormData } from "@/validation/signUp";
import { logInFormData } from "@/validation/logIn";

class AuthService {
  async logIn(data: logInFormData): Promise<ApiResponse<null>> {
    return api.post("/auth/login", data);
  }

  async signUp(
    data: Omit<signUpFormData, "checkBox">,
    knownSkills: string[] | null,
    skillsToLearn: string[] | null
  ): Promise<ApiResponse<null>> {
    return api.post("/auth/signup", {
      ...data,
      knownSkills,
      skillsToLearn,
    });
  }

  async logOut(): Promise<ApiResponse<null>> {
    return api.delete("/auth/logout");
  }
}

const authService = new AuthService();
export default authService;
