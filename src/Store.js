import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./Slices/Users/UserSlice";
import superAdminAuthReducer from "./Slices/SuperAdmin/SuperAdminSlice";
import { userApi } from "./Slices/Users/UserApis";
import { superAdminApi } from "./Slices/SuperAdmin/SuperAdminApis";
import { adminApi } from "./Slices/Admin/AdminApis.js";

const store = configureStore({
  reducer: {
    superAdminAuth: superAdminAuthReducer,
    userAuth: userAuthReducer,
    [userApi.reducerPath]: userApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(superAdminApi.middleware)
      .concat(adminApi.middleware),
  devTools: true,
});

export default store;
