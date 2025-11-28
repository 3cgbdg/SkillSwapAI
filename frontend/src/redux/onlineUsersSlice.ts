import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IonlineUsersState {
  onlineUsers: string[];
}

const initialState: IonlineUsersState = {
  onlineUsers: [],
};

const onlineUsersSlice = createSlice({
  name: "onlineUsers",
  initialState,
  reducers: {
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(
        (user) => user != action.payload
      );
    },
    addOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers.push(action.payload);
    },
  },
});

export const { removeOnlineUser, setOnlineUsers, addOnlineUser } =
  onlineUsersSlice.actions;
export default onlineUsersSlice.reducer;
