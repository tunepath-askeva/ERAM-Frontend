import React from "react";
import { Row, Col } from "antd";
import BranchHeader from "../Global/BranchHeader";
import BranchFooter from "../Global/BranchFooter";
// import { useGetBranchByIdQuery } from "../Slices/Users/UserApis.js";
// import { useSearchParams } from "react-router-dom";
import Register from "../Auth/Register.jsx";
import { useBranch } from "../utils/useBranch.js";
import SkeletonLoader from "../Global/SkeletonLoader.jsx";

function BranchRegister() {
  // const [searchParams] = useSearchParams();
  // const branchId = searchParams.get("branchId");

  // const { data: branchData, isLoading } = useGetBranchByIdQuery(branchId, {
  //   skip: !branchId,
  // });

  const { currentBranch, isLoading, error } = useBranch(); // Use the new hook

  if (isLoading) {
    return (
      <div>
        <BranchHeader currentBranch={null} />
        <SkeletonLoader />
        <BranchFooter currentBranch={null} />
      </div>
    );
  }


  return (
    <>
      <BranchHeader currentBranch={currentBranch} />
      <div
        style={{
          padding: "40px 20px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
          <Register currentBranch={currentBranch} />
        </div>
      </div>
      <BranchFooter currentBranch={currentBranch} />
    </>
  );
}

export default BranchRegister;
