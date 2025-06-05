import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "http://localhost:5000/api/admin";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    addPipeline: builder.mutation({
      query: (pipelineData) => ({
        url: "/addPipeline",
        method: "POST",
        body: pipelineData,
      }),
    }),
    getPipelines: builder.query({
      query: () => "/Pipeline",
      providesTags: ["Pipeline"],
    }),
    getPipelineById: builder.query({
      query: (pipelineId) => `/Pipeline/${pipelineId}`,
    }),
    deletePipeline: builder.mutation({
      query: (pipelineId) => ({
        url: `/deletePipeline/${pipelineId}`,
        method: "DELETE",
      }),
    }),
    editPipeline: builder.mutation({
      query: ({ pipelineId, pipelineData }) => ({
        url: `/editPipeline/${pipelineId}`,
        method: "PUT",
        body: pipelineData,
      }),
    }),
    editStage: builder.mutation({
      query: ({ stageId, stageData }) => ({
        url: `/stagesEdit/${stageId}`,
        method: "PUT",
        body: stageData,
      }),
    }),
    deleteStage: builder.mutation({
      query: (stageId) => ({
        url: `/deleteStage/${stageId}`,
        method: "DELETE",
      }),
    }),

    createWorkOrder: builder.mutation({
      query: (workOrderData) => ({
        url: "/WorkOrder",
        method: "POST",
        body: workOrderData,
      }),
    }),
    getAdminBranch: builder.query({
      query: () => ({
        url: "/branches",
        methid: "GET",
      }),
    }),
    createRecruiter: builder.mutation({
      query: (recruiterData) => ({
        url: "/recruiters",
        method: "POST",
        body: recruiterData,
      }),
    }),
    getRecruiters: builder.query({
      query: () => ({
        url: "/recruiters",
        method: "GET",
      }),
    }),
  }),
});

export const {
  //pipeline
  useAddPipelineMutation,
  useGetPipelinesQuery,
  useDeletePipelineMutation,
  useEditPipelineMutation,
  useGetPipelineByIdQuery,
  //pipeline stages
  useEditStageMutation,
  useDeleteStageMutation,

  //Workorder
  useCreateWorkOrderMutation,

  //admin branch
  useGetAdminBranchQuery,

  //recruiter
  useCreateRecruiterMutation,
  useGetRecruitersQuery,
} = adminApi;
