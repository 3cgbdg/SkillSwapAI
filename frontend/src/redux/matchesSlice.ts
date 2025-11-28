import MatchesService from "@/services/MatchesService";
import { IMatch } from "@/types/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// thunk
export const fetchActiveMatches = createAsyncThunk(
  "matches/fetchActiveMatches",
  async (_, { rejectWithValue }) => {
    try {
      const matches: IMatch[] = await MatchesService.getActiveMatches();
      return matches;
    } catch  {
      return rejectWithValue("Unauthorized");
    }
  }
);

interface IinitialState {
  matches: IMatch[];
  loading: boolean;
  error: string | null;
}

const initialState: IinitialState = {
  matches: [],
  loading: false,
  error: null,
};

const matchesSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {
    getMatches: (state, action: PayloadAction<IMatch[]>) => {
      state.matches = [...action.payload];
    },
    addMatch: (state, action: PayloadAction<IMatch>) => {
      state.matches.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })
      .addCase(
        fetchActiveMatches.fulfilled,
        (state, action: PayloadAction<IMatch[]>) => {
          state.loading = false;
          state.matches = action.payload;
        }
      );
  },
});

export const { getMatches, addMatch } = matchesSlice.actions;
export default matchesSlice.reducer;
