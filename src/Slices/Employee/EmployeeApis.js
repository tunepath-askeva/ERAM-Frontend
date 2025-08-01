import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/employees"
    : "https://eram-backend-2gvv.onrender.com/api/employees";

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getEmployeeProfile: builder.query({
      query: () => ({
        url: "/profile",
        methid: "GET",
      }),
    }),
  }),
});

export const { useGetEmployeeProfileQuery } = employeeApi;
