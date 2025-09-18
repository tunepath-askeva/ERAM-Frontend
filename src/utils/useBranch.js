import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useGetBranchByDomainQuery,
  useGetBranchByIdQuery,
} from "../Slices/Users/UserApis";

export const useBranch = () => {
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branchId");
  const currentDomain = window.location.hostname;

  // Use ID query if branchId exists, otherwise use domain query
  const {
    data: branchByIdData,
    isLoading: idLoading,
    error: idError,
  } = useGetBranchByIdQuery(branchId, {
    skip: !branchId,
  });

  const {
    data: branchByDomainData,
    isLoading: domainLoading,
    error: domainError,
  } = useGetBranchByDomainQuery(currentDomain, {
    skip: !!branchId, // Skip if we have branchId
  });

  // Determine which data to use
  const currentBranch = branchId
    ? branchByIdData?.branch
    : branchByDomainData?.branch;

  const isLoading = branchId ? idLoading : domainLoading;
  const error = branchId ? idError : domainError;

  return {
    currentBranch,
    isLoading,
    error,
    branchId,
    foundByDomain: !branchId && !!branchByDomainData?.branch,
  };
};
