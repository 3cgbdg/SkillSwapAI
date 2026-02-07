import { Found } from "@/types/common";
import { api } from "./axiosInstance";

class SearchService {
  async searchUsersAndSkillsByChars(chars: string): Promise<Found[]> {
    const res = await api.get("/search", { params: { chars } });
    return res.data;
  }
}

const searchService = new SearchService();
export default searchService;
