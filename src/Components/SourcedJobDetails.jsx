import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Typography, Button, Tabs, ConfigProvider } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useGetSourcedJobByIdQuery } from "../Slices/Users/UserApis";
import SourcedOverviewTab from "./SourcedJobComponents/SourcedOverviewTab";
import SourcedInterviewTab from "./SourcedJobComponents/SourcedInterviewTab";
import SourcedTimelineTab from "./SourcedJobComponents/SourcedTimelineTab";
import SourcedDocumentsTab from "./SourcedJobComponents/SourcedDocumentsTab";

const { Title } = Typography;

const SourcedJobDetails = () => {
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
  } = useGetSourcedJobByIdQuery(id);

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

  if (!response?.sourcedJob) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Title level={4}>Job not found</Title>
      </div>
    );
  }

  const sourcedJob = response.sourcedJob;
  const { workOrder, stageProgress } = sourcedJob;

  const documentProps = {
    sourcedJob,
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
                <SourcedOverviewTab sourcedJob={sourcedJob} workOrder={workOrder} />
              ),
            },
            {
              label: <span>Timeline</span>,
              key: "timeline",
              children: (
                <SourcedTimelineTab
                  sourcedJob={sourcedJob}
                  stageProgress={stageProgress}
                />
              ),
            },
            {
              label: <span>Documents</span>,
              key: "documents",
              children: <SourcedDocumentsTab {...documentProps} />,
            },
            {
              label: <span>Interview</span>,
              key: "interview",
              children: <SourcedInterviewTab sourcedJob={sourcedJob} />,
              disabled: !sourcedJob.interviewDetails,
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
};

export default SourcedJobDetails;