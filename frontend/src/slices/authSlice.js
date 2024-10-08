import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
      localStorage.setItem('token', action.payload.token);
      console.log('User Info Set:', state.userInfo);
    },
    logout: (state, action) => {
      state.userInfo = null;
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token'); 
      console.log('User Logged Out');
    }
  }
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
