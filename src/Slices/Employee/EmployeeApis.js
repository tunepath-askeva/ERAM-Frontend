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
    submitLeaveRequest: builder.mutation({
      query: (formData) => ({
        url: "/leave-request",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Leave"],
    }),
    getEmployeeLeaveHistory: builder.query({
      query: () => ({
        url: "/leave-history",
        methid: "GET",
      }),
    }),

    //EmployeeAdmin Apis
    getEmployeeAdminLeaveHistory: builder.query({
      query: () => ({
        url: "/leaves",
        method: "GET",
      }),
    }),
    getLeaveRequestById: builder.query({
      query: (id) => `/leaves/${id}`,
    }),
  }),
});

export const {
  useGetEmployeeProfileQuery,
  useSubmitLeaveRequestMutation,
  useGetEmployeeLeaveHistoryQuery,

  //employee admin
  useGetEmployeeAdminLeaveHistoryQuery,
  useGetLeaveRequestByIdQuery,
} = employeeApi;
