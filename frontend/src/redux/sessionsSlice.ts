import { ISession, IUser } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    sessions: ISession[] | null,
}

const initialState: IinitialState = {
    sessions: null
}

const sessionsSlice = createSlice({
    name: "sessions",
    initialState,
    reducers: {
        getSessions: (state, action: PayloadAction<ISession[]>) => {
            state.sessions = { ...action.payload }
        },
        addSession: (state, action: PayloadAction<ISession>) => {
            if (state.sessions) {
                state.sessions.push(action.payload);
            } else {
                state.sessions = [action.payload];
            }
        }

    },

}
)

export const { getSessions, addSession } = sessionsSlice.actions;
export default sessionsSlice.reducer;
