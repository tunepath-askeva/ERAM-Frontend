import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/users"
    : "http://tradelivetoday.com/api/users"; 

// let baseUrl;

// if (window.location.hostname === "localhost") {
//   // local dev
//   baseUrl = "http://localhost:5000/api/users";
// } else if (window.location.hostname === "103.205.65.133") {
//   // your new server
//   baseUrl = "http://103.205.65.133/api/users";
// } else {
//   // render server
//   baseUrl = "https://eram-backend-2gvv.onrender.com/api/users";
// }

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
    validateUserToken: builder.query({
      query: () => ({
        url: "/validate",
        method: "GET",
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
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/branchById?page=${page}&limit=${limit}`,
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
      query: ({ title, location, page = 1, limit = 10 }) => ({
        url: `/search?title=${encodeURIComponent(
          title
        )}&location=${encodeURIComponent(
          location
        )}&page=${page}&limit=${limit}`,
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

        // Add pagination parameters
        params.append("page", filters.page || 1);
        params.append("limit", filters.limit || 10);

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
    getCandidateNotification: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/notify?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),

    uploadStageDocuments: builder.mutation({
      query: ({ customFieldId, stageId, files, filesMetadata }) => {
        const formData = new FormData();
        formData.append("customFieldId", customFieldId);
        formData.append("stageId", stageId);
        formData.append("filesMetadata", JSON.stringify(filesMetadata));

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
    submitWorkOrderDocuments: builder.mutation({
      query: ({ customFieldId, files, filesMetadata }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        formData.append("filesMetadata", JSON.stringify(filesMetadata));
        formData.append("customFieldId", customFieldId);

        return {
          url: "/workOrderupload",
          method: "POST",
          body: formData,
        };
      },
    }),
    getCandidateDocuments: builder.query({
      query: () => ({
        url: `/documents`,
        method: "GET",
      }),
    }),
    clearAllNotification: builder.mutation({
      query: () => ({
        url: `/clear-notification`,
        method: "DELETE",
      }),
    }),
    markAllRead: builder.mutation({
      query: () => ({
        url: "/mark-read",
        method: "PATCH",
      }),
    }),

    markAsReadById: builder.mutation({
      query: (id) => ({
        url: `/mark-read/${id}`,
        method: "PATCH",
      }),
    }),

    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `/del-notification/${id}`,
        method: "DELETE",
      }),
    }),
    updateCandidateOfferStatus: builder.mutation({
      query: (data) => ({
        url: "/offer",
        method: "PUT",
        body: data,
      }),
    }),
    requestOfferRevision: builder.mutation({
      query: (body) => ({
        url: "/revising-offer",
        method: "PATCH",
        body,
      }),
    }),
    getJobSuggestions: builder.query({
      query: ({ searchQuery, fetchLocation = false }) => ({
        url: `/search-suggestions?query=${encodeURIComponent(
          searchQuery
        )}&fetchLocation=${fetchLocation}`,
        method: "GET",
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
  useGetSourcedJobsQuery,
  useGetJobsbyIdQuery,
  useGetCandidateNotificationQuery,
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
  useSubmitWorkOrderDocumentsMutation,
  useGetCandidateDocumentsQuery,
  useClearAllNotificationMutation,
  useDeleteNotificationMutation,
  useMarkAllReadMutation,
  useMarkAsReadByIdMutation,
  useValidateUserTokenQuery,
  useUpdateCandidateOfferStatusMutation,
  useRequestOfferRevisionMutation,
  useGetJobSuggestionsQuery,
} = userApi;
