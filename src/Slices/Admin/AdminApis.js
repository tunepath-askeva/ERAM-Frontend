import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/admin"
    : "https://eram-backend-2gvv.onrender.com/api/admin";

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
      query: ({ searchTerm, page = 1, pageSize = 10 } = {}) => {
        let url = "/Pipeline?";
        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
        url += `page=${page}&limit=${pageSize}`;
        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return {
          allPipelines: response.pipelines || response.allPipelines,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
        };
      },
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
    disablePipeline: builder.mutation({
      query: (pipelineId) => ({
        url: `pipeline/${pipelineId}`,
        method: "PATCH",
      }),
      invalidatesTags: ["Pipeline"],
    }),
    copyPipeline: builder.mutation({
      query: (pipelineId) => ({
        url: `/pipeline/copy/${pipelineId}`,
        method: "POST",
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
    getWorkOrders: builder.query({
      query: ({ searchTerm, page, pageSize }) => {
        let url = "/workOrder?";
        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
        if (page) url += `page=${page}&`;
        if (pageSize) url += `limit=${pageSize}&`;
        return {
          url: url.slice(0, -1),
          method: "GET",
        };
      },
    }),
    getWorkOrderById: builder.query({
      query: (id) => `/workOrder/${id}`,
    }),
    editWorkOrder: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/editWorkOrder/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteWorkOrder: builder.mutation({
      query: (id) => ({
        url: `workOrder/${id}`,
        method: "DELETE",
      }),
    }),
    publishWorkOrder: builder.mutation({
      query: (id) => ({
        url: `publish/${id}`,
        method: "PATCH",
      }),
    }),
    toggleWorkOrderStatus: builder.mutation({
      query: (id) => ({
        url: `workOrder/${id}`,
        method: "PATCH",
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
      query: ({ searchTerm, page = 1, pageSize = 10 } = {}) => {
        let url = "/recruiters?";
        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
        url += `page=${page}&limit=${pageSize}`;
        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return {
          recruiters: response.recruiters,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
        };
      },
    }),

    editRecruiter: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/recruiters/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    disableRecruiterStatus: builder.mutation({
      query: ({ recruiterId, accountStatus }) => ({
        url: `/recruiters/${recruiterId}`,
        method: "PATCH",
        body: { accountStatus },
      }),
    }),
    deleteRecruiter: builder.mutation({
      query: (recruiterId) => ({
        url: `/recruiters/${recruiterId}`,
        method: "DELETE",
      }),
    }),
    getRecruiterById: builder.query({
      query: (recruiterId) => ({
        url: `/recruiters/${recruiterId}`,
        method: "GET",
      }),
    }),
    addProject: builder.mutation({
      query: (projectData) => ({
        url: "/projects",
        method: "POST",
        body: projectData,
      }),
    }),
    editProject: builder.mutation({
      query: ({ id, ...projectData }) => ({
        url: `projects/${id}`,
        method: "PUT",
        body: projectData,
      }),
    }),
    getProjects: builder.query({
      query: ({ searchTerm, page, pageSize }) => {
        let url = "/projects?";
        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
        if (page) url += `page=${page}&`;
        if (pageSize) url += `limit=${pageSize}&`;
        return {
          url: url.slice(0, -1),
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return {
          allProjects: response.projects || response.allProjects,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
        };
      },
      providesTags: ["Project"],
    }),
    getProjects: builder.query({
      query: ({ searchTerm = "", page, pageSize } = {}) => {
        let url = "/projects?";

        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

        const isPaginated = page !== undefined && pageSize !== undefined;

        if (isPaginated) {
          url += `page=${page}&limit=${pageSize}&`;
        }

        return {
          url: url.slice(0, -1),
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return {
          allProjects: response.projects || response.allProjects || [],
          totalCount: response.totalCount ?? 0,
          totalPages: response.totalPages ?? 0,
        };
      },
      providesTags: ["Project"],
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/project/${id}`,
        method: "DELETE",
      }),
    }),
    getProjectById: builder.query({
      query: (id) => `/project/${id}`,
    }),
    disableProjectStatus: builder.mutation({
      query: ({ projectId, accountStatus }) => ({
        url: `/project/${projectId}`,
        method: "PATCH",
        body: { accountStatus },
      }),
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
    getCandidates: builder.query({
      query: ({ searchTerm, page, pageSize }) => {
        let url = "/candidate?";
        if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
        if (page) url += `page=${page}&`;
        if (pageSize) url += `limit=${pageSize}&`;
        return {
          url: url.slice(0, -1),
          method: "GET",
        };
      },
      transformResponse: (response) => {
        return {
          getCandidates: response.candidates || response.getCandidates,
          totalCount: response.totalCount,
          totalPages: response.totalPages,
        };
      },
    }),
    editCandidate: builder.mutation({
      query: ({ id, candidateData }) => ({
        url: `/candidate/${id}`,
        method: "PUT",
        body: candidateData,
      }),
    }),
    deleteCandidate: builder.mutation({
      query: (candidateId) => ({
        url: `/candidate/${candidateId}`,
        method: "DELETE",
      }),
    }),
    getCandidateById: builder.query({
      query: (candidateId) => ({
        url: `/candidate/${candidateId}`,
        method: "GET",
      }),
    }),
    disableCandidateStatus: builder.mutation({
      query: (candidateId) => ({
        url: `/candidate/${candidateId}`,
        method: "PATCH",
      }),
    }),
    getApproval: builder.query({
      query: ({ searchTerm = "", page, pageSize } = {}) => {
        let url = "/approval";
        const queryParams = [];

        if (searchTerm)
          queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
        if (page !== undefined) queryParams.push(`page=${page}`);
        if (pageSize !== undefined) queryParams.push(`limit=${pageSize}`);

        if (queryParams.length > 0) {
          url += `?${queryParams.join("&")}`;
        }

        return {
          url,
          method: "GET",
        };
      },

      transformResponse: (response) => {
        return {
          approvals: response.data?.approvals || response.approvals || [],
          total: response.total,
          totalPages: response.totalPages,
        };
      },
      providesTags: ["Approval"],
    }),
    addApproval: builder.mutation({
      query: (approvalData) => ({
        url: "/approval",
        method: "POST",
        body: approvalData,
      }),
    }),
    updateApproval: builder.mutation({
      query: ({ id, ...approvalData }) => ({
        url: `/approval/${id}`,
        method: "PUT",
        body: approvalData,
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
  useDisablePipelineMutation,
  useCopyPipelineMutation,
  //pipeline stages
  useEditStageMutation,
  useDeleteStageMutation,

  //Workorder
  useCreateWorkOrderMutation,
  useGetWorkOrdersQuery,
  useGetWorkOrderByIdQuery,
  useDeleteWorkOrderMutation,
  usePublishWorkOrderMutation,
  useToggleWorkOrderStatusMutation,
  useEditWorkOrderMutation,

  //admin branch
  useGetAdminBranchQuery,

  //recruiter
  useCreateRecruiterMutation,
  useGetRecruitersQuery,
  useEditRecruiterMutation,
  useDisableRecruiterStatusMutation,
  useGetRecruiterByIdQuery,
  useDeleteRecruiterMutation,

  //projects
  useAddProjectMutation,
  useEditProjectMutation,
  useGetProjectsQuery,
  useDeleteProjectMutation,
  useGetProjectByIdQuery,
  useDisableProjectStatusMutation,

  //Candidate
  useAddCandidateMutation,
  useBulkImportCandidatesMutation,
  useGetCandidatesQuery,
  useDeleteCandidateMutation,
  useGetCandidateByIdQuery,
  useEditCandidateMutation,
  useDisableCandidateStatusMutation,

  //Level
  useGetApprovalQuery,
  useAddApprovalMutation,
  useUpdateApprovalMutation,
} = adminApi;
