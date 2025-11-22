import ProfilesService from "@/services/ProfilesService";
import { IUser } from "@/types/types";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

// thunk
export const fetchProfile = createAsyncThunk("user/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const user: IUser = await ProfilesService.getOwnProfile();
            return user;
        } catch (err) {
            return rejectWithValue('Unauthorized');
        }
    }
)


interface IinitialState {
    user: IUser | null,
    loading: boolean,
    error: string | null,
}

const initialState: IinitialState = {
    user: null,
    loading: false,
    error: null,
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
        addAiSuggestionSkills: (state, action: PayloadAction<string[]>) => {
            if (state.user)
                state.user.aiSuggestionSkills = action.payload;

        },
        addWantToLearnSkill: (state, action: PayloadAction<string>) => {
            const newItem = {
                id: 'temporary-id',
                title: action.payload
            }
            if (state.user?.skillsToLearn)
                state.user?.skillsToLearn.push(newItem);
        },
        removeAiSuggestionSkill(state, action: PayloadAction<string>) {
            if (state.user)
                state.user.aiSuggestionSkills = state.user.aiSuggestionSkills.filter(
                    skill => skill !== action.payload
                );
        }
        ,
        deleteKnownSkill: (state, action: PayloadAction<string>) => {
            if (state.user?.knownSkills)
                state.user.knownSkills = state.user?.knownSkills?.filter(skill => skill.title !== action.payload)
        },
        deleteWantToLearnSkill: (state, action: PayloadAction<string>) => {
            if (state.user?.skillsToLearn)
                state.user.skillsToLearn = state.user?.skillsToLearn?.filter(skill => skill.title !== action.payload)
        },
        changeAvatar: (state, action: PayloadAction<string | undefined>) => {
            if (state.user)
                state.user.imageUrl = action.payload;
        },
        updateProfile: (state, action: PayloadAction<{ name?: string, bio?: string, email?: string }>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        }


    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                toast.error(state.error);
            })
            .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
                state.loading = false;
                state.user = action.payload;
            })
    },

}
)

export const { getProfile, updateProfile, removeAiSuggestionSkill, addAiSuggestionSkills, changeAvatar, logOut, addKnownSkill, addWantToLearnSkill, deleteKnownSkill, deleteWantToLearnSkill } = authSlice.actions;
export default authSlice.reducer;
