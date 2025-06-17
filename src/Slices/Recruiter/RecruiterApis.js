import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "https://eram-backend-2gvv.onrender.com/api/recruiter";

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
    getRecruiterJobs: builder.query({
      query: () => ({
        url: "/recruiter",
        methid: "GET",
      }),
    }),
  }),
});

export const { useGetRecruiterJobsQuery } = recruiterApi;
