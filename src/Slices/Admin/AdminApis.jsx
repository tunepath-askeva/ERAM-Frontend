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
  }),
});

export const {
  useAddPipelineMutation,
  useGetPipelinesQuery,
  useDeletePipelineMutation,
  useEditPipelineMutation,
  useGetPipelineByIdQuery,
  useEditStageMutation,
  useDeleteStageMutation,
} = adminApi;
