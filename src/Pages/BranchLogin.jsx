import React, { useState, useEffect } from "react";
import { Row, Col } from "antd";
import LoginSection from "./LoginSection";
import CVUploadSection from "./CVUploadSection";
import BranchHeader from "../Global/BranchHeader";
import BranchFooter from "../Global/BranchFooter";
import { useGetBranchByIdQuery } from "../Slices/Users/UserApis.js";
import { useSearchParams } from "react-router-dom";

function BranchLogin() {
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branchId");

  const { data: branchData, isLoading } = useGetBranchByIdQuery(branchId, {
    skip: !branchId,
  });

  const currentBranch = branchData?.branch;


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
              <CVUploadSection 
                currentBranch={currentBranch} 
              />
            </Col>
          </Row>
        </div>
      </div>
      <BranchFooter currentBranch={currentBranch} />
    </>
  );
}

export default BranchLogin;