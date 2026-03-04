import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/super-admin"
    : `https://${window.location.hostname}/api/super-admin`;

export const superAdminApi = createApi({
  reducerPath: "superAdminApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include",
    prepareHeaders: (headers) => {
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSuperDashboardData: builder.query({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
    }),
    loginSuperAdmin: builder.mutation({
      query: (credentials) => ({
        url: "/Login",
        method: "POST",
        body: credentials,
      }),
    }),

    verifyAdminLoginOtp: builder.mutation({
      query: (otpData) => ({
        url: "/adminLoginverify",
        method: "POST",
        body: otpData,
      }),
    }),

    logoutSuperAdmin: builder.mutation({
      query: () => ({
        url: "/Logout",
        method: "POST",
      }),
    }),

    createBranch: builder.mutation({
      query: (branchData) => ({
        url: "/branch",
        method: "POST",
        body: branchData,
      }),
      invalidatesTags: ["Branch"],
    }),
    updateBranch: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/branch/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),
    deleteBranch: builder.mutation({
      query: (branchId) => ({
        url: `/branch/${branchId}`,
        method: "DELETE",
      }),
    }),
    getBranchById: builder.query({
      query: (branchId) => `/branch/${branchId}`,
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
      query: (params = {}) => {
        const { page = 1, limit = 10, search, status } = params;

        const queryParams = new URLSearchParams();

        queryParams.append("page", page.toString());
        queryParams.append("limit", limit.toString());

        if (search && search.trim()) {
          queryParams.append("search", search.trim());
        }

        if (status && status !== "all") {
          queryParams.append("status", status);
        }

        return `/admin?${queryParams.toString()}`;
      },
      providesTags: ["Admin"],
      transformResponse: (response) => {
        return {
          allAdmins: response.allAdmins || response.data || [],
          totalCount:
            response.totalCount ||
            response.total ||
            response.allAdmins?.length ||
            0,
          currentPage: response.currentPage || response.page || 1,
          totalPages:
            response.totalPages ||
            Math.ceil((response.totalCount || response.total || 0) / 10),
          hasMore: response.hasMore || false,
        };
      },
    }),
    getSingleAdmin: builder.query({
      query: (adminId) => `/adminId/${adminId}`,
    }),
    UpdateAdmin: builder.mutation({
      query: ({ adminId, ...adminData }) => ({
        url: `/admin/${adminId}`,
        method: "PUT",
        body: adminData,
      }),
      invalidatesTags: ["Admin"],
    }),
    disableAdmin: builder.mutation({
      query: ({ adminId }) => ({
        url: "/admin",
        method: "PATCH",
        body: { adminId },
      }),
    }),
    deleteAdmin: builder.mutation({
      query: (adminId) => ({
        url: `/delete-admin/${adminId}`,
        method: "DELETE",
      }),
    }),

    requestUpdateProfile: builder.mutation({
      query: (profileData) => ({
        url: "/editProfile",
        method: "POST",
        body: profileData,
      }),
    }),

    verifyUpdateProfile: builder.mutation({
      query: (otpData) => ({
        url: "/verifyEditProfile",
        method: "POST",
        body: otpData,
      }),
      invalidatesTags: ["SuperAdmin"],
    }),
    submitWhatsappApi: builder.mutation({
      query: (clientData) => ({
        url: "/whatsapp-api",
        method: "POST",
        body: clientData,
      }),
    }),
    getNotification: builder.query({
      query: ({ page = 1, limit = 10 }) => ({
        url: `/notify?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getFilteredDashboardData: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        
        // Handle multi-select filters (arrays)
        if (filters.branchId) {
          if (Array.isArray(filters.branchId) && filters.branchId.length > 0) {
            filters.branchId.forEach(id => {
              if (id !== "all") params.append("branchId", id);
            });
          } else if (filters.branchId !== "all") {
            params.append("branchId", filters.branchId);
          }
        }
        if (filters.clientId) {
          if (Array.isArray(filters.clientId) && filters.clientId.length > 0) {
            filters.clientId.forEach(id => {
              if (id !== "all") params.append("clientId", id);
            });
          } else if (filters.clientId !== "all") {
            params.append("clientId", filters.clientId);
          }
        }
        if (filters.projectId) {
          if (Array.isArray(filters.projectId) && filters.projectId.length > 0) {
            filters.projectId.forEach(id => {
              if (id !== "all") params.append("projectId", id);
            });
          } else if (filters.projectId !== "all") {
            params.append("projectId", filters.projectId);
          }
        }
        if (filters.workOrderId && filters.workOrderId !== "all") {
          params.append("workOrderId", filters.workOrderId);
        }
        if (filters.referenceCode && filters.referenceCode !== "all") {
          params.append("referenceCode", filters.referenceCode);
        }
        if (filters.startDate) {
          params.append("startDate", filters.startDate);
        }
        if (filters.endDate) {
          params.append("endDate", filters.endDate);
        }
        if (filters.deadlinePeriod) {
          params.append("deadlinePeriod", filters.deadlinePeriod);
        }
        if (filters.completionPercentage) {
          params.append("completionPercentage", filters.completionPercentage);
        }
        if (filters.dateRange) {
          params.append("dateRange", filters.dateRange);
        }

        return {
          url: `/dashboard/filtered?${params.toString()}`,
          method: "GET",
        };
      },
    }),
    getBranchFilterOptions: builder.query({
      query: (branchId) => {
        const params = branchId && branchId !== "all" 
          ? `?branchId=${branchId}` 
          : "";
        return {
          url: `/dashboard/filter-options${params}`,
          method: "GET",
        };
      },
    }),
    getSuperAdminChartData: builder.query({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        
        // Handle multi-select filters (arrays)
        if (filters.branchId) {
          if (Array.isArray(filters.branchId) && filters.branchId.length > 0) {
            filters.branchId.forEach(id => {
              if (id !== "all") params.append("branchId", id);
            });
          } else if (filters.branchId !== "all") {
            params.append("branchId", filters.branchId);
          }
        }
        if (filters.clientId) {
          if (Array.isArray(filters.clientId) && filters.clientId.length > 0) {
            filters.clientId.forEach(id => {
              if (id !== "all") params.append("clientId", id);
            });
          } else if (filters.clientId !== "all") {
            params.append("clientId", filters.clientId);
          }
        }
        if (filters.projectId) {
          if (Array.isArray(filters.projectId) && filters.projectId.length > 0) {
            filters.projectId.forEach(id => {
              if (id !== "all") params.append("projectId", id);
            });
          } else if (filters.projectId !== "all") {
            params.append("projectId", filters.projectId);
          }
        }
        if (filters.workOrderId && filters.workOrderId !== "all") {
          params.append("workOrderId", filters.workOrderId);
        }
        if (filters.referenceCode && filters.referenceCode !== "all") {
          params.append("referenceCode", filters.referenceCode);
        }
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        if (filters.deadlinePeriod) params.append("deadlinePeriod", filters.deadlinePeriod);
        if (filters.completionPercentage) params.append("completionPercentage", filters.completionPercentage);
        
        return {
          url: `/dashboard/chart-data?${params.toString()}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  //dashboard
  useGetSuperDashboardDataQuery,

  //branch
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useGetBranchesQuery,
  useDeleteBranchMutation,
  useGetBranchByIdQuery,

  //admins
  useCreateAdminMutation,
  useGetAdminsQuery,
  useGetSingleAdminQuery,
  useUpdateAdminMutation,
  useDisableAdminMutation,
  useDeleteAdminMutation,

  //login
  useLoginSuperAdminMutation,
  useVerifyAdminLoginOtpMutation,
  useLogoutSuperAdminMutation,

  //super admin profile
  useRequestUpdateProfileMutation,
  useVerifyUpdateProfileMutation,

  //whatsapp
  useSubmitWhatsappApiMutation,

  //Notify

  useGetNotificationQuery,

  //Filtered Dashboard
  useGetFilteredDashboardDataQuery,
  useGetBranchFilterOptionsQuery,
  useGetSuperAdminChartDataQuery,
} = superAdminApi;
