import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./Slices/Users/UserSlice.js";
import superAdminAuthReducer from "./Slices/SuperAdmin/SuperAdminSlice.js";
import { userApi } from "./Slices/Users/UserApis.js";
import { superAdminApi } from "./Slices/SuperAdmin/SuperAdminApis.js";
import { adminApi } from "./Slices/Admin/AdminApis.js";
import { recruiterApi } from "./Slices/Recruiter/RecruiterApis.js";
import { employeeApi } from "./Slices/Employee/EmployeeApis.js";
import { rtkQueryErrorHandler } from "./errorHandlerMiddleware.js";

const store = configureStore({
  reducer: {
    superAdminAuth: superAdminAuthReducer,
    userAuth: userAuthReducer,
    [userApi.reducerPath]: userApi.reducer,
    [superAdminApi.reducerPath]: superAdminApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [recruiterApi.reducerPath]: recruiterApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userApi.middleware)
      .concat(superAdminApi.middleware)
      .concat(adminApi.middleware)
      .concat(recruiterApi.middleware)
      .concat(employeeApi.middleware)
      .concat(rtkQueryErrorHandler),
  devTools: true,
});

export default store;
