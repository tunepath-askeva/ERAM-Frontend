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
    getAllStaffs: builder.query({
      query: () => ({
        url: "/staff",
        methid: "GET",
      }),
    }),
    getAllLevels: builder.query({
      query: () => ({
        url: "/levels",
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
      query: (searchParams = "") => ({
        url: `/sourced${searchParams ? `?${searchParams}` : ""}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        return {
          users: response.users || [],
          total: response.total || 0,
          page: response.page || 1,
          totalPages: response.totalPages || 1,
          message: response.message || "",
        };
      },
    }),

    getExactMatchCandidates: builder.query({
      query: (id) => ({
        url: `/exact/${id}`,
        method: "GET",
      }),
    }),
    getSelectedCandidates: builder.query({
      query: ({ jobId, page, limit }) => ({
        url: `/selected/${jobId}`,
        method: "GET",
        params: {
          page,
          limit,
        },
      }),
    }),
    getScreeningCandidates: builder.query({
      query: ({ jobId, page, limit }) => ({
        url: `/screening/${jobId}`,
        method: "GET",
        params: {
          page,
          limit,
        },
      }),
    }),
    getPendingCandidates: builder.query({
      query: ({ jobId, page, limit }) => ({
        url: `/inpending/${jobId}`,
        method: "GET",
        params: {
          page,
          limit,
        },
      }),
    }),

    updateCandidateStatus: builder.mutation({
      query: ({ Id, status, jobId, isSourced, comment, pipelineId }) => ({
        url: `/candidate/status/${Id}`,
        method: "POST",
        body: { status, jobId, isSourced, comment, pipelineId },
      }),
    }),

    getRecruiterStages: builder.query({
      query: (Id) => ({
        url: `/stages/${Id}`,
        method: "GET",
      }),
    }),

    moveToPipeline: builder.mutation({
      query: ({ jobId, userId, pipelineData, isPipeline }) => ({
        url: "/pipeline",
        method: "PUT",
        body: { jobId, userId, pipelineData, isPipeline },
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
    getSeperateApprovals: builder.query({
      query: () => ({
        url: `/seperatePipeline`,
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
        method: "PUT",
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
      query: ({ id, status, _id }) => ({
        url: `/interviewStatus/${id}`,
        method: "PUT",
        body: { status, _id },
      }),
    }),
    notifyCandidate: builder.mutation({
      query: ({ userId, workOrderId, customFieldId }) => ({
        url: "/notify",
        method: "POST",
        body: { userId, workOrderId, customFieldId },
      }),
    }),
    getClients: builder.query({
      query: () => ({
        url: "/clients",
        method: "GET",
      }),
    }),
    getRequisitions: builder.query({
      query: () => ({
        url: "/requisition",
        method: "GET",
      }),
    }),
    submitRequisition: builder.mutation({
      query: (requisitionData) => ({
        url: "/requisition",
        method: "POST",
        body: requisitionData,
      }),
    }),
    editRequisition: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/requisition/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Requisition"],
    }),
    deleteRequisition: builder.mutation({
      query: (id) => ({
        url: `/requisition/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Requisition"],
    }),
    getCandidateTimeline: builder.query({
      query: ({ id, page = 1, pageSize = 10 }) => ({
        url: `/timeline/${id}?page=${page}&pageSize=${pageSize}`,
        method: "GET",
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
  useGetSelectedCandidatesQuery,
  useGetScreeningCandidatesQuery,
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
  useChangeInterviewStatusMutation,
  useGetPendingCandidatesQuery,
  useNotifyCandidateMutation,
  useGetAllLevelsQuery,
  useGetAllStaffsQuery,
  useGetExactMatchCandidatesQuery,
  useSubmitRequisitionMutation,
  useGetClientsQuery,
  useGetRequisitionsQuery,
  useEditRequisitionMutation,
  useDeleteRequisitionMutation,
  useGetSeperateApprovalsQuery,
  useGetCandidateTimelineQuery,
} = recruiterApi;
