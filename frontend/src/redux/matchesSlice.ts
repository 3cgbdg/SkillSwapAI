import { IMatch } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    matches: IMatch[],
}

const initialState: IinitialState = {
    matches:[]
}

const matchesSlice = createSlice({
    name: "matches",
    initialState,
    reducers: {
        getMatches: (state, action: PayloadAction<IMatch[]>) => {
            state.matches = [ ...action.payload ]
        },
      
    },

}
)

export const {getMatches} = matchesSlice.actions;
export default matchesSlice.reducer;
