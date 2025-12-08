import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Typography, Button, Tabs, ConfigProvider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useGetAppliedJobByIdQuery } from "../Slices/Users/UserApis";
import OverviewTab from "./AppliedJobComponents/OverviewTab";
import InterviewTab from "./AppliedJobComponents/InterviewTab";
import TimelineTab from "./AppliedJobComponents/TimelineTab";
import DocumentsTab from "./AppliedJobComponents/DocumentsTab";

const { Title } = Typography;

const AppliedJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [selectedExistingFiles, setSelectedExistingFiles] = useState({});
  const [editingDocuments, setEditingDocuments] = useState({});
  const [editReplacements, setEditReplacements] = useState({});

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetAppliedJobByIdQuery(id);

  useEffect(() => {
    return () => {
      // Clean up object URLs to avoid memory leaks
      Object.values(uploadedFiles).forEach((files) => {
        files.forEach((file) => {
          if (file.preview) {
            URL.revokeObjectURL(file.preview);
          }
        });
      });
    };
  }, [uploadedFiles]);

  if (isLoading) {
    return (
      <div
        style={{ display: "flex", justifyContent: "center", padding: "40px" }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Title level={4}>Error loading job details</Title>
        <Typography.Text type="secondary">
          Please try again later
        </Typography.Text>
      </div>
    );
  }

  if (!response?.appliedJob) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Title level={4}>Job not found</Title>
      </div>
    );
  }

  const appliedJob = response.appliedJob;
  const { workOrder, stageProgress } = appliedJob;

  const documentProps = {
    appliedJob,
    uploadedFiles,
    setUploadedFiles,
    selectedExistingFiles,
    setSelectedExistingFiles,
    editingDocuments,
    setEditingDocuments,
    editReplacements,
    setEditReplacements,
    refetch,
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#da2c46" } }}>
      <div style={{ padding: "24px" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: "16px", color: "#da2c46" }}
        >
          Back to Applications
        </Button>

        <Title level={2} style={{ marginBottom: "24px" }}>
          {workOrder.title} - Application Details
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              label: <span>Overview</span>,
              key: "overview",
              children: (
                <OverviewTab appliedJob={appliedJob} workOrder={workOrder} />
              ),
            },
            {
              label: <span>Timeline</span>,
              key: "timeline",
              children: (
                <TimelineTab
                  appliedJob={appliedJob}
                  stageProgress={stageProgress}
                />
              ),
            },
            {
              label: <span>Documents</span>,
              key: "documents",
              children: <DocumentsTab {...documentProps} />,
            },
            {
              label: <span>Interview</span>,
              key: "interview",
              children: <InterviewTab appliedJob={appliedJob} />,
              disabled: !appliedJob.interviewDetails,
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
};

export default AppliedJobDetails;
