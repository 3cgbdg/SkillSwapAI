import { IUser } from "@/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IinitialState {
    user: IUser | null,
}

const initialState: IinitialState = {
    user: {
        id: "",
        name: "",
        email: "",
        knownSkills: [],
        skillsToLearn: [],
        imageUrl: "",
        bio: "",
    }
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        getProfile: (state, action: PayloadAction<IUser>) => {
            state.user = { ...action.payload }
        },
        logOut: (state) => {
            state.user = null
        },
        addKnownSkill: (state, action: PayloadAction<string>) => {
            const newItem = {
                id: 'temporary-id',
                title: action.payload
            }
            if (state.user?.knownSkills)
                state.user?.knownSkills.push(newItem);

        },
        addWantToLearnSkill: (state, action: PayloadAction<string>) => {
            const newItem = {
                id: 'temporary-id',
                title: action.payload
            }
            if (state.user?.skillsToLearn)
                state.user?.skillsToLearn.push(newItem);
        },
        deleteKnownSkill: (state, action: PayloadAction<string>) => {
            if (state.user?.knownSkills)
                state.user.knownSkills = state.user?.knownSkills?.filter(skill => skill.title !== action.payload)
        },
        deleteWantToLearnSkill: (state, action: PayloadAction<string>) => {
            if (state.user?.skillsToLearn)
                state.user.skillsToLearn = state.user?.skillsToLearn?.filter(skill => skill.title !== action.payload)
        },
        changeAvatar: (state, action: PayloadAction<string>) => {
            if (state.user)
                state.user.imageUrl = action.payload;
        }
    },

}
)

export const { getProfile,changeAvatar, logOut, addKnownSkill, addWantToLearnSkill, deleteKnownSkill, deleteWantToLearnSkill } = authSlice.actions;
export default authSlice.reducer;
