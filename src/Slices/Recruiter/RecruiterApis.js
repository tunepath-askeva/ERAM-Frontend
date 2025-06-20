import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/recruiter"
    : "https://eram-backend-2gvv.onrender.com/api/recruiter";

export const recruiterApi = createApi({
  reducerPath: "recruiterApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPipelines: builder.query({
      query: () => "/Pipeline",
    }),
    getRecruiterJobs: builder.query({
      query: () => ({
        url: "/recruiter",
        methid: "GET",
      }),
    }),
    updateRecruiterJob: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/recruiter/${id}`,
        method: "PUT",
        body: patch,
      }),
    }),
    getRecruiterJobId: builder.query({
      query: (id) => `/jobs/${id}`,
    }),
    getJobApplications: builder.query({
      query: (jobId) => ({
        url: `/application/${jobId}`,
        method: "GET",
      }),
    }),
    getSourcedCandidate: builder.query({
      query: () => ({
        url: `/sourced`,
        method: "GET",
      }),
    }),
    updateCandidateStatus: builder.mutation({
      query: ({ Id, status,jobId }) => ({
        url: `/candidate/status/${Id}`,
        method: "POST",
        body: { status , jobId},
      }),
    }),
  }),
});

export const {
  useGetPipelinesQuery,
  useGetRecruiterJobsQuery,
  useUpdateRecruiterJobMutation,
  useGetRecruiterJobIdQuery,
  useGetJobApplicationsQuery,
  useGetSourcedCandidateQuery,
  useUpdateCandidateStatusMutation,
} = recruiterApi;
