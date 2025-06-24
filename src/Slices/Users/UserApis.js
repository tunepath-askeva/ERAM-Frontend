import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/users"
    : "https://eram-backend-2gvv.onrender.com/api/users";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
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
    searchJobs: builder.query({
      query: ({ title, location }) => ({
        url: `/search?title=${encodeURIComponent(
          title
        )}&location=${encodeURIComponent(location)}`,
        method: "GET",
      }),
    }),
    getUserAppliedJobs: builder.query({
      query: () => ({
        url: "/jobs",
        method: "GET",
      }),
    }),
    withdrawJobApplication: builder.mutation({
      query: (applicationId) => ({
        url: `/status/${applicationId}`,
        method: "POST",
      }),
    }),
    profileCompletion: builder.mutation({
      query: (formData) => ({
        url: `/profile`,
        method: "POST",
        body: formData,
      }),
    }),
    getCandidate: builder.query({
      query: () => ({
        url: `/candidate`,
        method: "GET",
      }),
    }),
    filterJobs: builder.query({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters.location) params.append("location", filters.location);
        if (filters.employmentType)
          params.append("employmentType", filters.employmentType);
        if (filters.experience) params.append("experience", filters.experience);
        if (filters.postedWithin)
          params.append("postedWithin", filters.postedWithin);
        if (filters.workplace) params.append("workplace", filters.workplace);

        return {
          url: `/filter?${params.toString()}`,
          method: "GET",
        };
      },
    }),

    getSourcedJobs: builder.query({
      query: () => ({
        url: "/sourcedJobs",
        method: "GET",
      }),
    }),
    getSourcedJobById: builder.query({
      query: (id) => ({
        url: `/sourcedJobs/${id}`,
        method: "GET",
      }),
    }),
    getAppliedJobById: builder.query({
      query: (id) => ({
        url: `/jobs/${id}`,
        method: "GET",
      }),
    }),
    uploadStageDocuments: builder.mutation({
      query: ({ customFieldId, stageId, files }) => {
        const formData = new FormData();
        formData.append("customFieldId", customFieldId);
        formData.append("stageId", stageId);

        files.forEach((file) => {
          if (file) {
            formData.append("files", file); 
          }
        });

        return {
          url: "/upload",
          method: "POST",
          body: formData,
        };
      },
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
  useGetSourcedJobsQuery,
  useGetJobsbyIdQuery,
  useSubmitJobApplicationMutation,
  useGetUserAppliedJobsQuery,
  useWithdrawJobApplicationMutation,
  useGetCandidateQuery,
  useProfileCompletionMutation,
  useLazySearchJobsQuery,
  useLazyFilterJobsQuery,
  useGetSourcedJobByIdQuery,
  useGetAppliedJobByIdQuery,
  useUploadStageDocumentsMutation,
} = userApi;
