import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "http://localhost:5000/api/recruiter";

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
    //Recruiter Jobs
    getRecruiterJobs: builder.query({
      query: () => ({
        url: "/recruiter",
        methid: "GET",
      }),
    }),
  }),
});

export const { useGetRecruiterJobsQuery } = recruiterApi;
