import SessionsService from "@/services/SessionsService";
import { ISession, IUser } from "@/types/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    sessions: ISession[] | null,
    loading: boolean,
    error: string | null
}

const initialState: IinitialState = {
    sessions: null,
    loading: false,
    error: null
}


export const fetchTodaysSessions = createAsyncThunk("session/fetchTodaysSessions",
    async (_, { rejectWithValue }) => {
        try {
            const sessions: ISession[] = await SessionsService.getTodaysSessions();
            return sessions;
        } catch (err) {
            return rejectWithValue('Unauthorized');
        }
    }
)

const sessionsSlice = createSlice({
    name: "sessions",
    initialState,
    reducers: {
        setSessions: (state, action: PayloadAction<ISession[]>) => {
            state.sessions = [...action.payload]
        },
        addSession: (state, action: PayloadAction<ISession>) => {
            if (state.sessions) {
                state.sessions.push(action.payload);
            } else {
                state.sessions = [action.payload];
            }
        }

    }, extraReducers: (builder) => {
        builder
            .addCase(fetchTodaysSessions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTodaysSessions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchTodaysSessions.fulfilled, (state, action: PayloadAction<ISession[]>) => {
                state.loading = false;
                state.sessions = action.payload;
            })
    },

}
)

export const { setSessions, addSession } = sessionsSlice.actions;
export default sessionsSlice.reducer;
