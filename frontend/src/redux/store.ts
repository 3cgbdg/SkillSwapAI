import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"
import chatsReducer from "./chatsSlice"
export const store = configureStore({
    reducer: {
        auth: authReducer,
        chats: chatsReducer,
    }
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;