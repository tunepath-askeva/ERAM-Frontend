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

  const [submissionStatus, setSubmissionStatus] = useState(null);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!branchId || !currentBranch) return;
      
      try {
        const response = await fetch(`/api/check-cv-application-status?branchId=${branchId}`);
        const data = await response.json();
        
        if (data.hasSubmitted) {
          setSubmissionStatus({
            isSubmitted: true,
            referenceId: data.referenceId,
            branchName: data.branchName,
            submittedAt: data.submittedAt
          });
        }
      } catch (error) {
        console.error('Failed to check application status:', error);
      }
    };

    if (currentBranch && branchId) {
      checkApplicationStatus();
    }
  }, [branchId, currentBranch]);

  const handleApplicationSubmit = async (submissionData) => {
    try {
      const formData = new FormData();
      
      submissionData.files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
      
      formData.append('branchId', submissionData.branchId);
      formData.append('branchName', submissionData.branchName);
      formData.append('submittedAt', submissionData.submittedAt);

      const response = await fetch('/api/submit-cv-application', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();
      
      setSubmissionStatus({
        isSubmitted: true,
        referenceId: result.referenceId || `CV-${Date.now().toString().slice(-6)}`,
        branchName: submissionData.branchName,
        submittedAt: submissionData.submittedAt
      });

      return result;
    } catch (error) {
      console.error('Application submission failed:', error);
      throw error;
    }
  };

  const handleResetApplication = async (clearSubmission = true) => {
    if (clearSubmission) {
      try {
        // Optional: Call API to reset/clear application status
        // await fetch('/api/reset-cv-application', { method: 'POST' });
        
        setSubmissionStatus(null);
      } catch (error) {
        console.error('Failed to reset application:', error);
      }
    }
  };

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
                submissionStatus={submissionStatus}
                onApplicationSubmit={handleApplicationSubmit}
                onResetApplication={handleResetApplication}
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