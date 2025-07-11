import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/super-admin"
    : "https://eram-backend-2gvv.onrender.com/api/super-admin";

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
  }),
});

export const {
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

  //login
  useLoginSuperAdminMutation,
  useVerifyAdminLoginOtpMutation,
  useLogoutSuperAdminMutation,

  //super admin profile
  useRequestUpdateProfileMutation,
  useVerifyUpdateProfileMutation,
} = superAdminApi;
