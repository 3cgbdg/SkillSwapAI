import { IChat, IMessage } from "@/types/chat";
import { api } from "./axiosInstance";

class ChatsService {
  async getChat(currentChatId: string | undefined): Promise<IMessage[]> {
    const res = await api.get(`/chats/messages?with=${currentChatId}`);
    return res.data;
  }
  async getChats(): Promise<IChat[]> {
    const res = await api.get("/chats");
    return res.data;
  }

  async createChat(payload: {
    friendId: string;
    friendName: string;
  }): Promise<IChat> {
    const res = await api.post("/chats", payload);
    return res.data;
  }
}

const chatsService = new ChatsService();
export default chatsService;
