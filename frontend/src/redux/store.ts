import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"
import chatsReducer from "./chatsSlice"
import sessionsReducer from "./sessionsSlice"
import onlineUsersSlice from "./onlineUsersSlice"
export const store = configureStore({
    reducer: {
        auth: authReducer,
        chats: chatsReducer,
        sessions: sessionsReducer,
        onlineUsers: onlineUsersSlice,

    }
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;