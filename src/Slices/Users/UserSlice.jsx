import { createSlice } from "@reduxjs/toolkit";

const getRoleBasedKey = (role) => {
  return `${role}Info`;
};

const getRoleBasedTokenKey = (role) => {
  return `${role}token`;
};

const initializeUserState = () => {
  const roles = ['admin', 'candidate', 'employee', 'recruiter'];
  const state = {};
  
  roles.forEach(role => {
    const key = getRoleBasedKey(role);
    const storedInfo = localStorage.getItem(key);
    state[key] = storedInfo ? JSON.parse(storedInfo) : null;
  });
  
  return state;
};

const initialState = initializeUserState();

const userSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setUserCredentials: (state, action) => {
      const { userInfo, role } = action.payload;
      const roleKey = getRoleBasedKey(role);
      const tokenKey = getRoleBasedTokenKey(role);
      
      state[roleKey] = userInfo;
      
      localStorage.setItem(roleKey, JSON.stringify(userInfo));
      localStorage.setItem(tokenKey, userInfo.token);
    },
    
    userLogout: (state, action) => {
      const { role } = action.payload;
      const roleKey = getRoleBasedKey(role);
      const tokenKey = getRoleBasedTokenKey(role);
      
      state[roleKey] = null;
      
      localStorage.removeItem(roleKey);
      localStorage.removeItem(tokenKey);
    },
    
    clearAllUserData: (state) => {
      const roles = ['admin', 'candidate', 'employee', 'recruiter'];
      
      roles.forEach(role => {
        const roleKey = getRoleBasedKey(role);
        const tokenKey = getRoleBasedTokenKey(role);
        
        state[roleKey] = null;
        localStorage.removeItem(roleKey);
        localStorage.removeItem(tokenKey);
      });
    }
  },
});

export const { setUserCredentials, userLogout, clearAllUserData } = userSlice.actions;
export default userSlice.reducer;