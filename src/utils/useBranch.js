import { useParams, useSearchParams } from "react-router-dom";
import { useGetBranchByDomainQuery } from "../Slices/Users/UserApis";

export const useBranch = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  // Try path param first, then fallback to query param for backward compatibility
  const branchCode = params.branchCode || searchParams.get("branchCode");
  const currentDomain = window.location.hostname;

  const {
    data: branchByDomainData,
    isLoading,
    error,
  } = useGetBranchByDomainQuery(
    branchCode 
      ? { branchCode } 
      : { domain: currentDomain }
  );

  return {
    currentBranch: branchByDomainData?.branch,
    isLoading,
    error,
    domain: currentDomain,
    branchCode,
  };
};
