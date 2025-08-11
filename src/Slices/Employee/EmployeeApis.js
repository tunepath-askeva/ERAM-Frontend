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
    raiseRequest: builder.mutation({
      query: (formData) => ({
        url: "/request",
        method: "POST",
        body: formData,
      }),
    }),
    getRequestHistory: builder.query({
      query: () => ({
        url: "/request-history",
        method: "GET",
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
        url: `/policy/${id}`,
        method: "PUT",
        body: {
          ...updateData,
          updatedAt: new Date().toISOString(),
        },
      }),
    }),

    deletePolicy: builder.mutation({
      query: (id) => ({
        url: `/delete-policy/${id}`,
        method: "DELETE",
      }),
    }),

    archivePolicy: builder.mutation({
      query: ({ id, currentStatus }) => ({
        url: `/policy-status/${id}`,
        method: "PATCH",
        body: {
          status: currentStatus === "active" ? "inactive" : "active",
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
        return `/policy/search?${params}`;
      },
    }),

    uploadPayrollFile: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("payrollFile", file);

        return {
          url: "/upload",
          method: "POST",
          body: formData,
        };
      },
    }),
    getPayroll: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/payroll",
        method: "GET",
        params: {
          page,
          limit,
          search,
        },
      }),
      providesTags: ["Payroll"],
    }),
    editPayroll: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/payroll/${id}`,
        method: "PUT",
        body: payload,
      }),
    }),
    getPayrollById: builder.query({
      query: (id) => ({
        url: `/payroll/${id}`,
        method: "GET",
      }),
    }),

    getEmployeePolicies: builder.query({
      query: () => ({
        url: "/employee-policy",
        method: "GET",
      }),
    }),
    getEmployeePayroll: builder.query({
      query: () => ({
        url: "/employee-payroll",
        method: "GET",
      }),
    }),
    generatePayslip: builder.mutation({
      query: (body) => ({
        url: "/payslip",
        method: "POST",
        body,
        responseHandler: async (response) => {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "Payslip.pdf";
          document.body.appendChild(a);
          a.click();
          a.remove();
        },
      }),
    }),
    getEmployeeNotification: builder.query({
      query: () => ({
        url: `/notify`,
        method: "GET",
      }),
    }),
    clearAllNotification: builder.mutation({
      query: () => ({
        url: `/clear-notification`,
        method: "POST",
      }),
    }),

    getEmployeeRaisedRequests: builder.query({
      query: () => ({
        url: "/requests",
        method: "GET",
      }),
    }),
    getEmployeeRaisedRequestById: builder.query({
      query: (requestId) => ({
        url: `/requests/${requestId}`,
        method: "GET",
      }),
    }),
    sendTicketInfo: builder.mutation({
      query: ({ requestId, ticketDetails }) => ({
        url: `/ticket-info/${requestId}`,
        method: "POST",
        body: { ticketDetails },
      }),
    }),
submitSelectedTickets: builder.mutation({
  query: ({ requestId, ticketId }) => ({ 
    url: `/submit-ticket/${requestId}`, 
    method: 'POST',
    body: { ticketId } 
  }),
}),
  }),
});

export const {
  useGetEmployeeProfileQuery,
  useSubmitLeaveRequestMutation,
  useGetEmployeeLeaveHistoryQuery,
  useGetEmployeePoliciesQuery,
  useGetRequestHistoryQuery,
  useSubmitSelectedTicketsMutation,

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
  useUploadPayrollFileMutation,
  useGetPayrollQuery,
  useEditPayrollMutation,
  useGetPayrollByIdQuery,
  useGetEmployeePayrollQuery,
  useGeneratePayslipMutation,
  useGetEmployeeNotificationQuery,
  useClearAllNotificationMutation,
  useRaiseRequestMutation,
  useGetEmployeeRaisedRequestsQuery,
  useGetEmployeeRaisedRequestByIdQuery,
  useSendTicketInfoMutation,
} = employeeApi;
