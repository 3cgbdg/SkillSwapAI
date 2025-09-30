import { IChat, IUser } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChartArea } from "lucide-react";

interface IinitialState {
    chats: IChat[] | null,
}

const initialState: IinitialState = {
    chats: null
}

const chatsSlice = createSlice({
    name: "currentChat",
    initialState,
    reducers: {
        getChats: (state, action: PayloadAction<IChat[]>) => {
            state.chats = action.payload;
        },
        updateChats: (state, action: PayloadAction<IChat>) => {
            const realIdx = state.chats?.findIndex(chat => chat.chatId == action.payload.chatId);
            if (realIdx == -1) {
                state.chats = state.chats ? [...state.chats, action.payload] : [action.payload]
            }
        },
        updateChatNewMessages: (state, action: PayloadAction<{ chatId: string, message: string }>) => {
            if (state.chats) {
                state.chats = state.chats.map((chat) => {
                    if (chat.chatId == action.payload.chatId) {
                        return (
                            { ...chat, _count: { id: chat._count.id + 1 }, lastMessageContent: action.payload.message }
                        )
                    } else {
                        return ({ ...chat })
                    }
                })
            }



        },
        updateChatSeen: (state, action: PayloadAction<{ chatId: string }>) => {
            if (state.chats && action.payload.chatId !== "") {
                const chatIdx = state.chats.findIndex(chat => chat.chatId === action.payload.chatId);
                if (chatIdx !== -1) {
                    state.chats[chatIdx]._count.id -= 1
                }
            }


        },

    },

}
)

export const { getChats, updateChats, updateChatNewMessages, updateChatSeen } = chatsSlice.actions;
export default chatsSlice.reducer;
