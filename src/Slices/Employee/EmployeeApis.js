import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/employees"
    : "https://eram-backend-2gvv.onrender.com/api/employees";

export const employeeApi = createApi({
  reducerPath: "employeeApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getEmployeeProfile: builder.query({
      query: () => ({
        url: "/profile",
        methid: "GET",
      }),
    }),
    submitLeaveRequest: builder.mutation({
      query: (formData) => ({
        url: "/leave-request",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Leave"],
    }),
    getEmployeeLeaveHistory: builder.query({
      query: () => ({
        url: "/leave-history",
        methid: "GET",
      }),
    }),

    //EmployeeAdmin Apis
    getEmployeeAdminLeaveHistory: builder.query({
      query: () => ({
        url: "/leaves",
        method: "GET",
      }),
    }),
    getLeaveRequestById: builder.query({
      query: (id) => `/leaves/${id}`,
    }),
    updateLeaveStatus: builder.mutation({
      query: ({ leaveId, status, comments }) => ({
        url: `/leave-status/${leaveId}`,
        method: "PATCH",
        body: {
          status,
          comments,
        },
      }),
    }),
    uploadPolicyDocument: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/doc-parse",
          method: "POST",
          body: formData,
          prepareHeaders: (headers) => {
            headers.delete("content-type");
            return headers;
          },
        };
      },
    }),

    createPolicy: builder.mutation({
      query: (data) => ({
        url: "/policy",
        method: "POST",
        
        body: data,
      }),
    }),

    getPolicies: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, search = "", status = "active" } = params;

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          search,
          status,
        });

        return `policy?${queryParams}`;
      },
    }),
    updatePolicy: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `policy/${id}`,
        method: "PUT",
        body: {
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      }),
    }),

    deletePolicy: builder.mutation({
      query: (id) => ({
        url: `policy/${id}`,
        method: "DELETE",
      }),
    }),

    archivePolicy: builder.mutation({
      query: (id) => ({
        url: `policy/${id}/archive`,
        method: "PATCH",
        body: {
          status: "archived",
          archivedAt: new Date().toISOString(),
        },
      }),
    }),

    searchPolicies: builder.query({
      query: (searchTerm) => {
        const params = new URLSearchParams({
          q: searchTerm,
          limit: "20",
        });
        return `policy/search?${params}`;
      },
    }),
  }),
});

export const {
  useGetEmployeeProfileQuery,
  useSubmitLeaveRequestMutation,
  useGetEmployeeLeaveHistoryQuery,

  //employee admin
  useGetEmployeeAdminLeaveHistoryQuery,
  useGetLeaveRequestByIdQuery,
  useUpdateLeaveStatusMutation,
  useUpdatePolicyMutation,
  useUploadPolicyDocumentMutation,
  useCreatePolicyMutation,
  useGetPoliciesQuery,
  useSearchPoliciesQuery,
  useArchivePolicyMutation,
  useDeletePolicyMutation,
} = employeeApi;
