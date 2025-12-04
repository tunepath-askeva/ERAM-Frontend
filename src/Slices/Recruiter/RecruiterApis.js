import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/recruiter"
    : `https://${window.location.hostname}/api/recruiter`;

export const recruiterApi = createApi({
  reducerPath: "recruiterApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDashboardData: builder.query({
      query: () => ({
        url: "/dashboard",
        methid: "GET",
      }),
    }),
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
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        queryParams.append("page", params.page || 1);
        queryParams.append("limit", params.limit || 6);

        if (params.searchText) {
          queryParams.append("search", params.searchText);
        }

        if (params.status && params.status !== "all") {
          queryParams.append("status", params.status);
        }

        return {
          url: `/recruiter?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return {
          jobs: response.jobs,
          totalJobs: response.totalJobs, // ✅ Keep original property name
          totalCount: response.totalJobs,
        };
      },
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
          limit: response.limit || 10,
          message: response.message || "",
        };
      },
    }),

    getWorkOrderBasedSourcedCandidates: builder.query({
      query: ({ jobId, page = 1, limit = 10, ...filters }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [
              key,
              value.toString(),
            ])
          ),
        });

        return {
          url: `/sourced-candidate/${jobId}?${params.toString()}`,
          method: "GET",
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
    getWorkOrderDetails: builder.query({
      query: ({ jobId, page = 1, limit = 10 }) => ({
        url: `/job-details/${jobId}`,
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
      query: ({
        Id,
        status,
        jobId,
        isSourced,
        comment,
        pipelineId,
        candidateType,
      }) => ({
        url: `/candidate/status/${Id}`,
        method: "POST",
        body: { status, jobId, isSourced, comment, pipelineId, candidateType },
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
      query: ({
        page = 1,
        limit = 6,
        search = "",
        status = "all",
        jobId = "all",
      } = {}) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search) {
          params.append("search", search);
        }

        if (status && status !== "all") {
          params.append("status", status);
        }

        if (jobId && jobId !== "all") {
          params.append("jobId", jobId);
        }

        return {
          url: `/pipelineJobs?${params.toString()}`,
          method: "GET",
        };
      },
    }),

    getPipelineJobsExport: builder.query({
      query: ({ search = "", status = "all", jobId = "all" } = {}) => {
        const params = new URLSearchParams({ export: "true" });

        if (search) params.append("search", search);
        if (status && status !== "all") params.append("status", status);
        if (jobId && jobId !== "all") params.append("jobId", jobId);

        return {
          url: `/pipelineJobs?${params.toString()}`,
          method: "GET",
          responseHandler: async (response) => {
            const blob = await response.blob();
            return blob;
          },
        };
      },
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
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        queryParams.append("page", params.page || 1);
        queryParams.append("limit", params.limit || 10);

        if (params.search) {
          queryParams.append("search", params.search);
        }

        if (params.status) {
          queryParams.append("status", params.status);
        }

        return {
          url: `/candidate?${queryParams.toString()}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return response;
      },
    }),

    getPipelineCompletedCandidateById: builder.query({
      query: (id) => `/candidate/${id}`,
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
      query: ({ id, status, _id, remarks }) => ({
        url: `/interviewStatus/${id}`,
        method: "PUT",
        body: { status, _id, remarks },
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
      query: ({ search = "", filters = {}, pagination = {} }) => {
        const params = new URLSearchParams();

        if (search) params.append("search", search);

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value);
          }
        });

        // Add pagination
        params.append("page", pagination.page || 1);
        params.append("limit", pagination.pageSize || 10);

        return {
          url: `/requisition?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    getProjects: builder.query({
      query: () => ({
        url: "/projects",
        method: "GET",
      }),
    }),
    getRequisitionsById: builder.query({
      query: (id) => ({
        url: `/get-requisition/${id}`,
        method: "GET",
      }),
    }),
    submitRequisition: builder.mutation({
      query: (requisition) => ({
        url: "/requisition",
        method: "POST",
        body: requisition,
      }),
    }),
    stagedCandidateNotify: builder.mutation({
      query: ({ workOrderId, userId }) => ({
        url: `/remainder/${workOrderId}`,
        method: "POST",
        body: { userId },
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
    getAllBranchedCandidate: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();

        queryParams.append("page", params.page || 1);
        queryParams.append("limit", params.limit || 10);

        if (params.search) {
          queryParams.append("search", params.search);
        }

        if (params.skills) {
          queryParams.append("skills", params.skills);
        }

        if (params.location) {
          queryParams.append("location", params.location);
        }

        if (params.experience) {
          queryParams.append("experience", params.experience);
        }

        if (params.industry) {
          queryParams.append("industry", params.industry);
        }

        return {
          url: `/all-candidate?${queryParams.toString()}`,
          method: "GET",
        };
      },

      transformResponse: (response) => {
        return response;
      },
    }),
    getAllcandidatebyId: builder.query({
      query: (id) => ({
        url: `/all-candidate/${id}`,
        method: "GET",
      }),
    }),
    updateBranchedCandidate: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/branched-candidates/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["BranchedCandidate"],
    }),
    getRecruiterJobTimelineId: builder.query({
      query: ({ id, page = 1, limit = 10 }) =>
        `/job-timeline/${id}?page=${page}&limit=${limit}`,
    }),
    convertEmployee: builder.mutation({
      query: (payload) => ({
        url: "/employee",
        method: "POST",
        body: payload,
      }),
    }),
    getBranchEmployess: builder.query({
      query: ({ page = 1, pageSize = 10, search = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        });

        if (search) params.append("search", search);

        return {
          url: `/employees?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    getEmployeeDetails: builder.query({
      query: (id) => ({
        url: `/get-employee/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Employee", id }],
    }),
    addEmployee: builder.mutation({
      query: (employeeData) => ({
        url: "/add-employee",
        method: "POST",
        body: employeeData,
      }),
    }),
    updateEmployee: builder.mutation({
      query: ({ id, ...employeeData }) => ({
        url: `/edit-employee/${id}`,
        method: "PUT",
        body: employeeData,
      }),
    }),
    deleteEmployee: builder.mutation({
      query: (id) => ({
        url: `/delete-employee/${id}`,
        method: "DELETE",
      }),
    }),
    bulkImportEmployees: builder.mutation({
      query: (employeesData) => ({
        url: "/employees/bulk-import",
        method: "POST",
        body: employeesData,
      }),
    }),
    getRecruiterNotification: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        if (search && search.trim()) {
          params.append("search", search.trim());
        }

        return {
          url: `/notify?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    addCandidate: builder.mutation({
      query: (candidateData) => ({
        url: "/candidate",
        method: "POST",
        body: candidateData,
      }),
    }),

    bulkImportCandidates: builder.mutation({
      query: (formData) => ({
        url: "/Candidate/bulk",
        method: "POST",
        body: formData,
      }),
    }),

    getRecruiterInterviews: builder.query({
      query: () => ({
        url: `/rec-interview`,
        method: "GET",
      }),
    }),

    offerInfo: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/offer-info/${id}`,
        method: "POST",
        body: formData,
      }),
    }),
    getCurrentWorkOrderDetailsForFiltering: builder.query({
      query: (jobId) => ({
        url: `/workorder-filter/${jobId}`,
        method: "GET",
      }),
    }),
    currentWorkorderDetailsFiltering: builder.mutation({
      query: ({ body }) => ({
        url: `/curr-filter`,
        method: "POST",
        body: body,
      }),
    }),
    approveRejectRequisition: builder.mutation({
      query: ({ notificationId, requisitionId, status, remarks, isAdmin }) => ({
        url: `/req-status/${notificationId}`,
        method: "PATCH",
        body: {
          requisitionId,
          status,
          remarks,
          isAdmin,
        },
      }),
    }),
    filterAllCandidates: builder.mutation({
      query: (filters) => ({
        url: "/all-candidates-filter",
        method: "POST",
        body: filters,
      }),
    }),
    getAllJobStageDetails: builder.query({
      query: () => ({
        url: "/job-details",
        method: "GET",
      }),
    }),
    updateJobStatus: builder.mutation({
      query: ({ jobId, status, description }) => ({
        url: `/workorderstatus-notify`,
        method: "POST",
        body: {
          workOrderId: jobId,
          status: status,
          description: description,
        },
      }),
    }),
    exportCandidates: builder.mutation({
      query: (filters = {}) => ({
        url: "/exportall-candidate",
        method: "GET",
        params: filters,
        responseHandler: (response) => response.blob(),
      }),
    }),
    getAllRecruiterCvs: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: "/cv",
        method: "GET",
        params: { page, limit, search },
      }),
    }),

    getLowLevelCandidatesByJob: builder.query({
      query: ({ jobId, page = 1, limit = 20, search = "" }) =>
        `/lowlevel-candidate/${jobId}?page=${page}&limit=${limit}&search=${search}`,
    }),
    getLowLevelAppliedCandidatesByJob: builder.query({
      query: ({ jobId, page = 1, limit = 20, search = "" }) => {
        let params = new URLSearchParams({ page, limit });
        if (search) params.append("search", search);

        return `/applied-cvs/${jobId}?${params.toString()}`;
      },
    }),

    deleteRecruiterCv: builder.mutation({
      query: (id) => ({
        url: `/cv/${id}`,
        method: "DELETE",
      }),
    }),
    addRemarksCvCandidates: builder.mutation({
      query: ({ candidateId, remarks }) => ({
        url: `/remarks-cv/${candidateId}`,
        method: "POST",
        body: { remarks },
      }),
    }),
    convertToCandidate: builder.mutation({
      query: ({ values, id }) => ({
        url: `/converts/${id}`,
        method: "POST",
        body: {
          values,
        },
      }),
    }),
    exportRecruiterCvs: builder.mutation({
      query: () => ({
        url: "/export-cvs",
        method: "POST",
        responseHandler: async (response) => {
          const blob = await response.blob();
          return blob;
        },
      }),
    }),
    importRecruiterCvs: builder.mutation({
      query: (formData) => ({
        url: "/import-cvs",
        method: "POST",
        body: formData,
      }),
    }),
    updateTaggedPipeline: builder.mutation({
      query: ({ id, pipelineId }) => ({
        url: `/tagged-pipeline/${id}`,
        method: "PATCH",
        body: { pipelineId },
      }),
    }),
    updateStageDates: builder.mutation({
      query: ({ id, stageId, startDate, endDate }) => ({
        url: `/update-stage-dates/${id}`,
        method: "PATCH",
        body: { stageId, startDate, endDate },
      }),
    }),
    updateStageRecruiters: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/update-stage-recruiters/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetDashboardDataQuery,
  useGetPipelinesQuery,
  useGetRecruiterJobsQuery,
  useUpdateRecruiterJobMutation,
  useGetRecruiterJobIdQuery,
  useGetJobApplicationsQuery,
  useGetSourcedCandidateQuery,
  useGetWorkOrderBasedSourcedCandidatesQuery,
  useGetSelectedCandidatesQuery,
  useGetScreeningCandidatesQuery,
  useGetWorkOrderDetailsQuery,
  useUpdateCandidateStatusMutation,
  useGetRecruiterStagesQuery,
  useMoveToPipelineMutation,
  useGetPipelineJobsQuery,
  useLazyGetPipelineJobsExportQuery,
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
  useGetRequisitionsByIdQuery,
  useGetProjectsQuery,
  useGetAllBranchedCandidateQuery,
  useGetAllcandidatebyIdQuery,
  useUpdateBranchedCandidateMutation,
  useStagedCandidateNotifyMutation,
  useGetRecruiterJobTimelineIdQuery,
  useConvertEmployeeMutation,
  useGetBranchEmployessQuery,
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeeDetailsQuery,
  useBulkImportEmployeesMutation,
  useGetPipelineCompletedCandidateByIdQuery,
  useGetRecruiterNotificationQuery,
  useAddCandidateMutation,
  useBulkImportCandidatesMutation,
  useGetRecruiterInterviewsQuery,
  useOfferInfoMutation,
  useGetCurrentWorkOrderDetailsForFilteringQuery,
  useCurrentWorkorderDetailsFilteringMutation,
  useApproveRejectRequisitionMutation,
  useFilterAllCandidatesMutation,
  useGetAllJobStageDetailsQuery,
  useUpdateJobStatusMutation,
  useExportCandidatesMutation,
  useGetAllRecruiterCvsQuery,
  useDeleteRecruiterCvMutation,
  useGetLowLevelCandidatesByJobQuery,
  useGetLowLevelAppliedCandidatesByJobQuery,
  useAddRemarksCvCandidatesMutation,
  useConvertToCandidateMutation,
  useExportRecruiterCvsMutation,
  useImportRecruiterCvsMutation,
  useUpdateTaggedPipelineMutation,
  useUpdateStageDatesMutation,
  useUpdateStageRecruitersMutation
} = recruiterApi;
