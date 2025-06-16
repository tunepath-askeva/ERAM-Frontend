import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "http://localhost:5000/api/users";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: (userData) => ({
        url: "/Register",
        method: "POST",
        body: userData,
      }),
    }),
    loginUser: builder.mutation({
      query: (userData) => ({
        url: "/login",
        method: "POST",
        body: userData,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (otpData) => ({
        url: "/verifyOtp",
        method: "POST",
        body: otpData,
      }),
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "/logout",
        method: "POST",
        credentials: "include",
      }),
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: "/resend-otp",
        method: "POST",
        body: data,
      }),
    }),
    getBranches: builder.query({
      query: () => "/branch",
    }),

    //jobs
    getJobsByBranch: builder.query({
      query: () => ({
        url: "/branchById",
        method: "GET",
      }),
    }),
    getJobsbyId: builder.query({
      query: (jobId) => ({
        url: `/job/${jobId}`,
        method: "GET",
      }),
    }),
    submitJobApplication: builder.mutation({
      query: (formData) => ({
        url: "/candidate",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useGetBranchesQuery,

  //Jobs for candidates
  useGetJobsByBranchQuery,
  useGetJobsbyIdQuery,
  useSubmitJobApplicationMutation,
} = userApi;
