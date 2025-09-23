import { IUser } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    user: IUser | null,
}

const initialState: IinitialState = {
    user: null,
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        getProfile: (state, action: PayloadAction<IUser>) => {
            state.user = action.payload
        },
        logOut: (state) => {
            state.user = null
        }
    }
})

export const { getProfile, logOut } = authSlice.actions;
export default authSlice.reducer;
