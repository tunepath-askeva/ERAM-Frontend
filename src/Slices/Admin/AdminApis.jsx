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
      query: () => "/pipeline",
      providesTags: ["Pipeline"],
    }),
  }),
});

export const { useAddPipelineMutation, useGetPipelinesQuery } = adminApi;
