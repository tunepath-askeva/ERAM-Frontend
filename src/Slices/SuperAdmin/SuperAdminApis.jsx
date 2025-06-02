import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = "http://localhost:5000/api/super-admin";

export const superAdminApi = createApi({
  reducerPath: "superAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createBranch: builder.mutation({
      query: (branchData) => ({
        url: "/branch",
        method: "POST",
        body: branchData,
      }),
      invalidatesTags: ["Branch"],
    }),
    getBranches: builder.query({
      query: () => "/branch",
      providesTags: ["Branch"],
    }),
    createAdmin: builder.mutation({
      query: (formData) => ({
        url: "/admin",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Admin"],
    }),
    getAdmins: builder.query({
      query: () => "/admin",
      providesTags: ["Admin"],
    }),
    getSingleAdmin: builder.query({
      query: (adminId) => `/adminId/${adminId}`,
    }),
  }),
});

export const {
  useCreateBranchMutation,
  useGetBranchesQuery,
  useCreateAdminMutation,
  useGetAdminsQuery,
  useGetSingleAdminQuery
} = superAdminApi;
