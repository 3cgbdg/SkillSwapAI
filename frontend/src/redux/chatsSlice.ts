import { IChat, IUser } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    chats: IChat[] | null,
}

const initialState: IinitialState = {
chats:null
}

const chatsSlice = createSlice({
    name: "currentChat",
    initialState,
    reducers: {
        getChats : (state,action:PayloadAction<IChat[]>)=>{
            state.chats= action.payload;
        }
    },

}
)

export const { getChats } = chatsSlice.actions;
export default chatsSlice.reducer;
