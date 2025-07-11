import { createSlice } from "@reduxjs/toolkit";

const getRoleBasedKey = (role) => {
  return `${role}Info`;
};

const initializeUserState = () => {
  const roles = ["admin", "candidate", "employee", "recruiter"];
  const state = {};

  roles.forEach((role) => {
    const key = getRoleBasedKey(role);
    const storedInfo = localStorage.getItem(key);
    state[key] = storedInfo ? JSON.parse(storedInfo) : null;
  });

  const storedPermissions = localStorage.getItem("recruiterPermissions");
  state.recruiterPermissions = storedPermissions
    ? JSON.parse(storedPermissions)
    : [];

  return state;
};

const initialState = initializeUserState();

const userSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setUserCredentials: (state, action) => {
      const { userInfo, role, permissions } = action.payload;
      const roleKey = getRoleBasedKey(role);

      state[roleKey] = userInfo;
      localStorage.setItem(roleKey, JSON.stringify(userInfo));

      if (role === "recruiter" && permissions) {
        state.recruiterPermissions = permissions;
        localStorage.setItem(
          "recruiterPermissions",
          JSON.stringify(permissions)
        );
      }
    },

    userLogout: (state, action) => {
      const { role } = action.payload;
      console.log(role, "role", action.payload, "Payload");
      const roleKey = getRoleBasedKey(role);

      state[roleKey] = null;

      localStorage.removeItem(roleKey);

      if (role === "recruiter") {
        state.recruiterPermissions = [];
        localStorage.removeItem("recruiterPermissions");
      }
    },

    clearAllUserData: (state) => {
      const roles = ["admin", "candidate", "employee", "recruiter"];

      roles.forEach((role) => {
        const roleKey = getRoleBasedKey(role);
        state[roleKey] = null;
        localStorage.removeItem(roleKey);
      });
    },
  },
});

export const { setUserCredentials, userLogout, clearAllUserData } =
  userSlice.actions;
export default userSlice.reducer;
