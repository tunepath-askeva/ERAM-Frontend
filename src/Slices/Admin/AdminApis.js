import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/admin"
    : `https://${window.location.hostname}/api/admin`;

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
    getAdminDashboardData: builder.query({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
    }),
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
          totalCount: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
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
      transformResponse: (response) => {
        return {
          workorders: response.workorders,
          totalCount: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
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
          totalCount: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
        };
      },
    }),

    getRecruitersName: builder.query({
      query: () => ({
        url: "/recruiter-name",
        method: "GET",
      }),
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
          totalCount: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
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
          totalCount: response.total ?? 0,
          totalPages: response.totalPages ?? 0,
          currentPage: response.page,
          pageSize: response.limit,
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
          totalCount: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
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
    getWhatsappConfig: builder.query({
      query: () => ({
        url: `/config`,
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
          currentPage: response.page,
          pageSize: response.limit,
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
    getClients: builder.query({
      query: ({ searchTerm = "", page, pageSize } = {}) => {
        let url = "/clients";
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
          clients: response.data?.clients || response.clients || [],
          total: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
        };
      },
      providesTags: ["Client"],
    }),
    addClient: builder.mutation({
      query: (clientData) => ({
        url: "/client",
        method: "POST",
        body: clientData,
      }),
      invalidatesTags: ["Client"],
    }),
    updateClient: builder.mutation({
      query: ({ clientId, ...clientData }) => ({
        url: `/client/${clientId}`,
        method: "PUT",
        body: clientData,
      }),
      invalidatesTags: ["Client"],
    }),
    deleteClient: builder.mutation({
      query: (id) => ({
        url: `/client/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Client"],
    }),
    disableClient: builder.mutation({
      query: (Id) => ({
        url: `/client/${Id}`,
        method: "PATCH",
      }),
    }),
    addStaff: builder.mutation({
      query: (staffData) => ({
        url: "/staff",
        method: "POST",
        body: staffData,
      }),
      invalidatesTags: ["Staff"],
    }),
    getStaffs: builder.query({
      query: ({ searchTerm = "", page, pageSize } = {}) => {
        let url = "/staffs";
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
          staffs: response.data?.staffs || response.staffs || [],
          total: response.total,
          totalPages: response.totalPages,
          currentPage: response.page,
          pageSize: response.limit,
        };
      },
      providesTags: ["Staff"],
    }),
    editStaff: builder.mutation({
      query: ({ staffId, ...staffData }) => ({
        url: `/staff/${staffId}`,
        method: "PUT",
        body: staffData,
      }),
      invalidatesTags: ["Staff"],
    }),
    deleteStaff: builder.mutation({
      query: (id) => ({
        url: `/staff/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Staff"],
    }),
    disableStaff: builder.mutation({
      query: (Id) => ({
        url: `/staff/${Id}`,
        method: "PATCH",
      }),
    }),
    getAdminRequisiion: builder.query({
      query: ({ page = 1, limit = 10, search = "" } = {}) => ({
        url: `/requisition?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`,
        method: "GET",
      }),
    }),
    submitWhatsappApi: builder.mutation({
      query: (clientData) => ({
        url: "/whatsapp-api",
        method: "POST",
        body: clientData,
      }),
    }),
    updateTemplateStatus: builder.mutation({
      query: ({ templateId, body, parentId }) => ({
        url: `/whatsapp-status/${templateId}`,
        method: "PATCH",
        body: {
          _id: parentId,
          ...body,
        },
      }),
    }),
    getAdminNotifications: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/notify?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getMemberTypes: builder.query({
      query: () => ({
        url: `/member-types`,
        method: "GET",
      }),
    }),
    addCustomMemberTypes: builder.mutation({
      query: (clientData) => ({
        url: "/member-types",
        method: "POST",
        body: clientData,
      }),
    }),
    deleteLevels: builder.mutation({
      query: (id) => ({
        url: `/level/${id}`,
        method: "DELETE",
      }),
    }),
    getJobCodesByProject: builder.query({
      query: (prefix) => ({
        url: `/job-codes`,
        method: "GET",
        params: { prefix },
      }),
    }),
    getBranchEmployessforAdmin: builder.query({
      query: ({ page = 1, pageSize = 10, search = "" }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
        });

        if (search) params.append("search", search);

        return {
          url: `/branch-employees?${params.toString()}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  //dashboard
  useGetAdminDashboardDataQuery,

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
  useGetRecruitersNameQuery,

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
  useDeleteLevelsMutation,

  //Client
  useAddClientMutation,
  useGetClientsQuery,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useDisableClientMutation,

  //Staff
  useAddStaffMutation,
  useGetStaffsQuery,
  useEditStaffMutation,
  useDeleteStaffMutation,
  useDisableStaffMutation,

  //Requisition
  useGetAdminRequisiionQuery,

  //whatsapp
  useSubmitWhatsappApiMutation,
  useGetWhatsappConfigQuery,
  useUpdateTemplateStatusMutation,

  //notifications
  useGetAdminNotificationsQuery,

  useAddCustomMemberTypesMutation,
  useGetMemberTypesQuery,

  useLazyGetJobCodesByProjectQuery,

  //Employees
  useGetBranchEmployessforAdminQuery
} = adminApi;
