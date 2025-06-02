import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  superAdminInfo: localStorage.getItem("superAdminInfo")
    ? JSON.parse(localStorage.getItem("superAdminInfo"))
    : null,
};

const superAdminSlice = createSlice({
  name: "superAdminAuth",
  initialState,
  reducers: {
    setSuperAdminCredentials: (state, action) => {
      state.superAdminInfo = action.payload;
      localStorage.setItem("superAdminInfo", JSON.stringify(action.payload));
    },
    SuperAdminlogout: (state) => {
      state.superAdminInfo = null;
      localStorage.removeItem("superAdminInfo");
    },
  },
});

export const { setSuperAdminCredentials, SuperAdminlogout } = superAdminSlice.actions;
export default superAdminSlice.reducer;
