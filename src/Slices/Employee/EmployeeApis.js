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
    getCompanyNews: builder.query({
      query: () => ({
        url: "/employee-news",
        method: "GET",
      }),
    }),
    getEmployeeDocuments: builder.query({
      query: () => ({
        url: "/doc",
        method: "GET",
      }),
    }),

    //EmployeeAdmin Apis
    getEmployeeAdminLeaveHistory: builder.query({
      query: ({ eramId, urgency, status, page, pageSize }) => {
        const params = new URLSearchParams();
        if (eramId) params.append("eramId", eramId);
        if (urgency) params.append("urgency", urgency);
        if (status) params.append("status", status);
        if (page) params.append("page", page);
        if (pageSize) params.append("pageSize", pageSize);

        return {
          url: `/leaves?${params.toString()}`,
          method: "GET",
        };
      },
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
        method: "POST",
        body: { ticketId },
      }),
    }),
    approveSelectedTicket: builder.mutation({
      query: ({ id, status, ticketApprovalNote }) => ({
        url: `/ticket-status/${id}`,
        method: "PATCH",
        body: { status, ticketApprovalNote },
      }),
    }),
    changeOtherRequestStatus: builder.mutation({
      query: ({ id, status, comment }) => ({
        url: `/request-status/${id}`,
        method: "PATCH",
        body: {
          status,
          approvalNote: comment,
        },
      }),
    }),
    createNews: builder.mutation({
      query: (newsData) => ({
        url: "/news",
        method: "POST",
        body: newsData,
      }),
    }),
    getNews: builder.query({
      query: () => ({
        url: "/news",
        method: "GET",
      }),
    }),
    getNewsById: builder.query({
      query: (id) => ({
        url: `/news/${id}`,
        method: "GET",
      }),
    }),
    updateNews: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/news/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),

    deleteNews: builder.mutation({
      query: (id) => ({
        url: `/news/${id}`,
        method: "DELETE",
      }),
    }),

    publishNews: builder.mutation({
      query: (id) => ({
        url: `/news/${id}`,
        method: "PATCH",
      }),
    }),
    getFeedbacks: builder.query({
      query: () => ({
        url: "/feedback",
        method: "GET",
      }),
    }),
    submitFeedback: builder.mutation({
      query: (feedbackData) => ({
        url: "/feedback",
        method: "POST",
        body: feedbackData,
      }),
    }),
    uploadEmployeeDocument: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/employee-doc/${id}`,
        method: "POST",
        body: formData,
      }),
    }),
    replaceEmployeeDocument: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/replace-doc/${id}`,
        method: "POST",
        body: formData,
      }),
    }),
    setEmployeeDocumentAlertDate: builder.mutation({
      query: ({ id, docId, date }) => {
        const formData = new FormData();
        formData.append("docId", docId);
        formData.append("date", date);

        return {
          url: `/alertDate/${id}`,
          method: "POST",
          body: formData,
        };
      },
    }),
    getEmployeeAdminDocuments: builder.query({
      query: () => ({
        url: "/admin-doc",
        method: "GET",
      }),
    }),
    getEmployeeAdminDocumentById: builder.query({
      query: (id) => `/admin-doc/${id}`,
    }),
    notifyEmployee: builder.mutation({
      query: (notificationData) => ({
        url: "/notify",
        method: "POST",
        body: notificationData,
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
  useGetCompanyNewsQuery,

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
  useApproveSelectedTicketMutation,
  useChangeOtherRequestStatusMutation,
  useCreateNewsMutation,
  useGetNewsQuery,
  useGetNewsByIdQuery,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  usePublishNewsMutation,
  useGetFeedbacksQuery,
  useSubmitFeedbackMutation,
  useGetEmployeeDocumentsQuery,
  useUploadEmployeeDocumentMutation,
  useReplaceEmployeeDocumentMutation,
  useSetEmployeeDocumentAlertDateMutation,
  useGetEmployeeAdminDocumentsQuery,
  useGetEmployeeAdminDocumentByIdQuery,
  useNotifyEmployeeMutation,
} = employeeApi;
