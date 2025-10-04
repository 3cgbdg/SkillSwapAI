import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";

interface IonlineUsersState {
    onlineUsers: string[],
}

const initialState: IonlineUsersState = {
    onlineUsers: [],

}

const onlineUsersSlice = createSlice({
    name: "onlineUsers",
    initialState,
    reducers: {
   
        addOnlineUser: (state, action: PayloadAction<string>) => {
            state.onlineUsers.push(action.payload);
        },
        removeOnlineUser: (state, action: PayloadAction<string>) => {
            state.onlineUsers = state.onlineUsers.filter(user => user != action.payload);
        },
    },

}
)

export const {  removeOnlineUser, addOnlineUser } = onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;
