import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";
import LoginSection from "./LoginSection";
import CVUploadSection from "./CVUploadSection";
import BranchHeader from "../Global/BranchHeader";
import BranchFooter from "../Global/BranchFooter";
import SkeletonLoader from "../Global/SkeletonLoader";
// import { useGetBranchByIdQuery } from "../Slices/Users/UserApis.js";
// import { useSearchParams } from "react-router-dom";

import { useBranch } from "../utils/useBranch";

function BranchLogin() {
  const { currentBranch, isLoading, error } = useBranch();

  if (isLoading) {
    return (
      <div>
        <BranchHeader currentBranch={null} />
        <SkeletonLoader />
        <BranchFooter currentBranch={null} />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <BranchHeader currentBranch={null} />
        <div>Error loading branch details</div>
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
          <Row gutter={[40, 40]} align="middle">
            <Col xs={24} lg={12}>
              <LoginSection currentBranch={currentBranch} />
            </Col>

            <Col xs={24} lg={12}>
              <CVUploadSection currentBranch={currentBranch} />
            </Col>
          </Row>
        </div>
      </div>
      <BranchFooter currentBranch={currentBranch} />
    </>
  );
}

export default BranchLogin;
