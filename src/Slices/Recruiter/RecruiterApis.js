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
    getAllRecruiters: builder.query({
      query: () => ({
        url: "/allrecruiter",
        methid: "GET",
      }),
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
      query: ({ Id, status, jobId, isSourced }) => ({
        url: `/candidate/status/${Id}`,
        method: "POST",
        body: { status, jobId, isSourced },
      }),
    }),

    getRecruiterStages: builder.query({
      query: (Id) => ({
        url: `/stages/${Id}`,
        method: "GET",
      }),
    }),

    moveToPipeline: builder.mutation({
      query: ({ jobId, userId }) => ({
        url: "/pipeline",
        method: "PUT",
        body: { jobId, userId },
      }),
    }),

    getPipelineJobs: builder.query({
      query: () => ({
        url: "pipelineJobs",
        method: "GET",
      }),
    }),
    getPipelineJobsById: builder.query({
      query: (id) => ({
        url: `/pipelinejobs/${id}`,
        method: "GET",
      }),
    }),
    getApprovalInfo: builder.query({
      query: () => ({
        url: `/approval-info`,
        method: "GET",
      }),
    }),

    approveCandidateDocuments: builder.mutation({
      query: ({
        approvalId,
        stageId,
        levelId,
        status,
        comments,
        workOrderid,
        userId,
      }) => ({
        url: `/approval/${approvalId}`,
        method: "POST",
        body: {
          levelId,
          stageId,
          status,
          comments,
          workOrderid,
          userId,
        },
      }),
    }),

    moveToNextStage: builder.mutation({
      query: (payload) => ({
        url: "/nextstage",
        method: "POST",
        body: payload,
      }),
    }),

    getPipelineCompletedCandidates: builder.query({
      query: () => ({
        url: `/candidate`,
        method: "GET",
      }),
    }),
    moveCandidateStatus: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/stage/${id}`,
        method: "PATCH",
        body: payload,
      }),
    }),
    addInterviewDetails: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/interview/${id}`,
        method: "PUT",
        body,
      }),
    }),
    changeInterviewStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/interviewStatus/${id}`,
        method: "PUT",
        body: { status },
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
  useGetRecruiterStagesQuery,
  useMoveToPipelineMutation,
  useGetPipelineJobsQuery,
  useGetPipelineJobsByIdQuery,
  useGetApprovalInfoQuery,
  useApproveCandidateDocumentsMutation,
  useMoveToNextStageMutation,
  useGetPipelineCompletedCandidatesQuery,
  useMoveCandidateStatusMutation,
  useGetAllRecruitersQuery,
  useAddInterviewDetailsMutation,
  useChangeInterviewStatusMutation
} = recruiterApi;
