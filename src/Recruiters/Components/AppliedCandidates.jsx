import React, { useState } from "react";
import {
  useGetJobApplicationsQuery,
  useUpdateCandidateStatusMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import {
  Card,
  Spin,
  Alert,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Empty,
  Button,
  Space,
  Modal,
  Dropdown,
  Menu,
  message,
  Descriptions,
  Divider,
  Skeleton,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const AppliedCandidates = ({ jobId, candidateType = "applied" }) => {
  const { data, error, isLoading, refetch } = useGetJobApplicationsQuery(jobId);
  console.log(data, "jobs");
  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  if (isLoading) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Failed to load applications"
          description="Unable to fetch candidate applications for this job."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const { workOrder, formResponses } = data || {};

  if (!formResponses || formResponses.length === 0) {
    return (
      <div style={{ padding: "16px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ fontSize: "14px", color: "#999" }}>
              No applications found for this job
            </span>
          }
        />
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter candidates based on type
  const filteredCandidates = formResponses.filter((app) => {
    if (candidateType === "declined") {
      return app.status === "declined" || app.status === "rejected";
    } else {
      return (
        !app.status || app.status === "applied" || app.status === "pending"
      );
    }
  });

  const handleViewResume = (resumeUrl, candidateName) => {
    if (!resumeUrl) {
      message.warning("No resume available for this candidate");
      return;
    }
    setSelectedResume({ url: resumeUrl, name: candidateName });
    setResumeModalVisible(true);
  };

  const handleDownloadResume = (resumeUrl, candidateName) => {
    if (!resumeUrl) {
      message.warning("No resume available for this candidate");
      return;
    }

    // Create a temporary link element to trigger download
    const link = document.createElement("a");
    link.href = resumeUrl;
    link.download = `${candidateName}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Resume download started");
  };

  const handleStatusChange = (applicationId, newStatus) => {
    console.log("Updating status:", applicationId, newStatus);
    message.success(`Candidate status updated to ${newStatus}`);
  };

  const handleMoveToScreening = async (candidateId) => {
    try {
      await updateCandidateStatus({
        Id: candidateId,
        status: "screening",
        jobId: jobId,
      }).unwrap();

      message.success("Candidate moved to screening successfully!");
      setDetailsModalVisible(false);
      refetch(); // Refresh the data
    } catch (error) {
      console.error("Failed to move candidate to screening:", error);
      message.error(
        error.data?.message || "Failed to move candidate to screening"
      );
    }
  };

  const getStatusMenuItems = (application, currentStatus) => {
    const items = [
      {
        key: "applied",
        label: "Mark as Applied",
        icon: <CheckCircleOutlined />,
        disabled: currentStatus === "applied",
      },
      {
        key: "declined",
        label: "Decline Candidate",
        icon: <CloseCircleOutlined />,
        disabled: currentStatus === "declined",
        danger: true,
      },
    ];

    return (
      <Menu
        onClick={({ key }) => handleStatusChange(application._id, key)}
        items={items}
      />
    );
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setDetailsModalVisible(true);
  };

  const renderApplicationDetails = () => {
    if (!selectedApplication) return null;

    const { user, responses } = selectedApplication;

    const resumeField = responses?.find(
      (response) =>
        response.fieldType === "file" ||
        (response.label && response.label.toLowerCase().includes("resume"))
    );
    const resumeUrl = user?.resume || resumeField?.value;
    const candidateName = user?.fullName || "Candidate";

    return (
      <div>
        <Descriptions bordered column={1} size="small">
          {responses?.map((response, index) => {
            if (
              !response.value ||
              response.fieldType === "file" ||
              (response.label &&
                response.label.toLowerCase().includes("resume"))
            ) {
              return null;
            }

            return (
              <Descriptions.Item
                key={`field-${index}`}
                label={response.label || `Field ${index + 1}`}
              >
                {response.value}
              </Descriptions.Item>
            );
          })}
        </Descriptions>

        {resumeUrl && (
          <>
            <Divider orientation="left">Resume</Divider>
            <Space>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => handleViewResume(resumeUrl, candidateName)}
              >
                View Resume
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadResume(resumeUrl, candidateName)}
              >
                Download Resume
              </Button>
            </Space>
          </>
        )}
      </div>
    );
  };

  const renderCandidateCard = (application, index) => {
    const { user, responses, createdAt, status = "applied" } = application;
    const resumeUrl =
      user?.resume || responses?.find((r) => r.fieldType === "file")?.value;

    return (
      <Card
        key={application._id || index}
        size="small"
        style={{
          marginBottom: "12px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        hoverable
      >
        <Row gutter={[16, 12]} align="middle">
          <Col flex="none">
            <Avatar
              size={48}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Col>

          <Col flex="auto">
            <div>
              <Title
                level={5}
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {user?.fullName || "Unknown Candidate"}
              </Title>

              <Space direction="vertical" size={2}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <MailOutlined style={{ fontSize: "12px", color: "#666" }} />
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {user?.email || "No email provided"}
                  </Text>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <CalendarOutlined
                    style={{ fontSize: "12px", color: "#666" }}
                  />
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    Applied on {formatDate(createdAt)}
                  </Text>
                </div>

                {resumeUrl && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FileTextOutlined
                      style={{ fontSize: "12px", color: "#666" }}
                    />
                    <Space size={4}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          handleViewResume(resumeUrl, user?.fullName)
                        }
                        style={{
                          padding: "0",
                          fontSize: "12px",
                          height: "auto",
                        }}
                      >
                        View Resume
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() =>
                          handleDownloadResume(resumeUrl, user?.fullName)
                        }
                        style={{
                          padding: "0",
                          fontSize: "12px",
                          height: "auto",
                        }}
                      >
                        Download
                      </Button>
                    </Space>
                  </div>
                )}
              </Space>
            </div>
          </Col>

          <Col flex="none">
            <Space direction="vertical" size={4} align="end">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Tag
                  color={candidateType === "declined" ? "red" : "green"}
                  style={{ fontSize: "11px" }}
                >
                  {candidateType === "declined" ? "Declined" : "Applied"}
                </Tag>

                {candidateType === "applied" && (
                  <Dropdown
                    overlay={getStatusMenuItems(application, status)}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      style={{ fontSize: "12px" }}
                    />
                  </Dropdown>
                )}
              </div>

              <Button
                type="primary"
                size="small"
                style={{ fontSize: "12px", background: "#da2c46" }}
                onClick={() => handleViewDetails(application)}
              >
                View Details
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  if (filteredCandidates.length === 0) {
    return (
      <div style={{ padding: "16px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ fontSize: "14px", color: "#999" }}>
              {candidateType === "declined"
                ? "No declined candidates found"
                : "No applications found for this job"}
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "0", fontSize: "14px" }}>
      {/* Header Section */}
      <div style={{ marginBottom: "16px" }}>
        <Title
          level={4}
          style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#da2c46",
          }}
        >
          {candidateType === "declined"
            ? `Declined Candidates (${filteredCandidates.length})`
            : `Applied Candidates (${filteredCandidates.length})`}
        </Title>

        {workOrder && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Tag color="blue" style={{ fontSize: "12px" }}>
              {workOrder.jobCode}
            </Tag>
            <Tag color="green" style={{ fontSize: "12px" }}>
              {workOrder.workplace}
            </Tag>
            {workOrder.officeLocation && (
              <Tag style={{ fontSize: "12px" }}>{workOrder.officeLocation}</Tag>
            )}
          </div>
        )}

        <Text style={{ fontSize: "13px", color: "#666" }}>
          {candidateType === "declined"
            ? "Candidates that have been declined for this position"
            : "Applications received for this position"}
        </Text>
      </div>

      {/* Candidates List */}
      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        {filteredCandidates.map((application, index) =>
          renderCandidateCard(application, index)
        )}
      </div>

      {/* Resume Modal */}
      <Modal
        title={`Resume - ${selectedResume?.name || "Candidate"}`}
        open={resumeModalVisible}
        onCancel={() => setResumeModalVisible(false)}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() =>
              handleDownloadResume(selectedResume?.url, selectedResume?.name)
            }
          >
            Download
          </Button>,
          <Button key="close" onClick={() => setResumeModalVisible(false)}>
            Close
          </Button>,
        ]}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ height: "70vh", padding: 0 }}
      >
        {selectedResume?.url && (
          <iframe
            src={selectedResume.url}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Resume Preview"
          />
        )}
      </Modal>

      <Modal
        title="Application Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>,
          candidateType === "applied" && selectedApplication?.user?._id && (
            <Button
              key="move-to-screening"
              type="primary"
              icon={<ArrowRightOutlined />}
              onClick={() =>
                handleMoveToScreening(selectedApplication.user._id)
              }
              loading={isUpdatingStatus}
              style={{ backgroundColor: "#da2c46" }}
            >
              Move to Screening
            </Button>
          ),
        ]}
        width={800}
      >
        {renderApplicationDetails()}
      </Modal>
    </div>
  );
};

export default AppliedCandidates;
