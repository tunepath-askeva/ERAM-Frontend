import { configureStore } from "@reduxjs/toolkit";
import userAuthReducer from "./Slices/Users/UserSlice";
import { userApi } from "./Slices/Users/UserApis";

const store = configureStore({
  reducer: {
    userAuth: userAuthReducer,
    [userApi.reducerPath]: userApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userApi.middleware),
  devTools: true,
});

export default store;
