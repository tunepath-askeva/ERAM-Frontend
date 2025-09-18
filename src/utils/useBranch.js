import { useGetBranchByDomainQuery } from "../Slices/Users/UserApis";

export const useBranch = () => {
  const currentDomain = window.location.hostname;

  const {
    data: branchByDomainData,
    isLoading,
    error,
  } = useGetBranchByDomainQuery(currentDomain);

  return {
    currentBranch: branchByDomainData?.branch,
    isLoading,
    error,
    domain: currentDomain,
  };
};
