import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetSourcedJobByIdQuery } from "../Slices/Users/UserApis";
import {
  Spin,
  Descriptions,
  Tag,
  Typography,
  Card,
  Avatar,
  Button,
  Tabs,
  Timeline,
  Upload,
  message,
  Space,
  Divider,
  Badge,
  Tooltip,
} from "antd";
import {
  ArrowLeftOutlined,
  InboxOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ConfigProvider } from 'antd';
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Dragger } = Upload;

const SourcedJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { data: response, isLoading, isError } = useGetSourcedJobByIdQuery(id);

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
        <Text type="secondary">Please try again later</Text>
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

  const { sourcedJob } = response;
  const { workOrder } = sourcedJob;

  // File upload handlers
  const handleFileUpload = (info, stageId) => {
    const { status } = info.file;
    if (status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (status === "done") {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const uploadProps = (stageId) => ({
    name: "file",
    multiple: true,
    action: "/api/upload",
    onChange: (info) => handleFileUpload(info, stageId),
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  });

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "completed":
        return { icon: <CheckCircleOutlined />, color: "green" };
      case "pending":
        return { icon: <ClockCircleOutlined />, color: "orange" };
      case "rejected":
        return { icon: <ExclamationCircleOutlined />, color: "red" };
      default:
        return { icon: <ClockCircleOutlined />, color: "blue" };
    }
  };

  // Overview Tab Content
  const OverviewContent = () => (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Avatar
          src={workOrder.companyLogo || "https://via.placeholder.com/64"}
          size={64}
          style={{ backgroundColor: "#f0f2f5" }}
        >
          {workOrder.company?.[0]?.toUpperCase() || "C"}
        </Avatar>
        <div>
          <Title level={3} style={{ marginBottom: "4px" }}>
            {workOrder.title}
          </Title>
          {/* <Text strong style={{ fontSize: "16px" }}>
            {workOrder.company || "Company Name"}
          </Text> */}
        </div>
      </div>

      <Descriptions
        bordered
        column={1}
        labelStyle={{ fontWeight: "600", width: "200px" }}
      >
        <Descriptions.Item label="Job Code">
          {workOrder.jobCode}
        </Descriptions.Item>
        <Descriptions.Item label="Location">
          {workOrder.officeLocation}
        </Descriptions.Item>
        <Descriptions.Item label="Work Type">
          {workOrder.workplace === "remote" ? "Remote" : "On-site"}
        </Descriptions.Item>
        <Descriptions.Item label="Company Industry">
          {workOrder.companyIndustry}
        </Descriptions.Item>
        <Descriptions.Item label="Annual Salary">
          ₹{workOrder.annualSalary}
        </Descriptions.Item>
        <Descriptions.Item label="Start Date">
          {new Date(workOrder.startDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="End Date">
          {new Date(workOrder.endDate).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label="Application Status">
          <Tag color={getStatusInfo(sourcedJob.status).color}>
            {sourcedJob.status?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Skills Required">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {workOrder.requiredSkills?.map((skill, index) => (
              <Tag key={index}>{skill}</Tag>
            ))}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Job Description">
          {workOrder.description || "No description provided"}
        </Descriptions.Item>
        {workOrder.benefits?.length > 0 && (
          <Descriptions.Item label="Benefits">
            <ul style={{ margin: 0 }}>
              {workOrder.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );

  // Timeline Tab Content
  const TimelineContent = () => (
    <Card>
      <Title level={4} style={{ marginBottom: "24px" }}>
        Application Progress Timeline
      </Title>

      <Timeline>
        <Timeline.Item
          dot={<CheckCircleOutlined style={{ color: "green" }} />}
          color="green"
        >
          <div>
            <Text strong>Application Submitted</Text>
            <br />
            <Text type="secondary">
              {new Date(sourcedJob.createdAt).toLocaleString()}
            </Text>
          </div>
        </Timeline.Item>

        {sourcedJob.stageProgress?.map((stage, index) => {
          const statusInfo = getStatusInfo(stage.stageStatus);
          return (
            <Timeline.Item
              key={stage._id}
              dot={React.cloneElement(statusInfo.icon, {
                style: { color: statusInfo.color },
              })}
              color={statusInfo.color}
            >
              <div>
                <Text strong>{stage.stageName}</Text>
                <br />
                <Badge
                  color={statusInfo.color}
                  text={stage.stageStatus?.toUpperCase()}
                />
                <br />

                {stage.recruiterReviews?.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary">Reviewer Status:</Text>
                    {stage.recruiterReviews.map((review, reviewIndex) => (
                      <div
                        key={review._id}
                        style={{ marginLeft: "16px", marginTop: "4px" }}
                      >
                        <Tag
                          color={
                            review.status === "pending" ? "orange" : "green"
                          }
                        >
                          {review.status}
                        </Tag>
                        {review.reviewComments && (
                          <Text type="secondary">
                            {" "}
                            - {review.reviewComments}
                          </Text>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: "8px" }}>
                  <Text type="secondary">
                    Documents uploaded: {stage.uploadedDocuments?.length || 0}
                  </Text>
                </div>

                {stage.stageCompletedAt && (
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">
                      Completed:{" "}
                      {new Date(stage.stageCompletedAt).toLocaleString()}
                    </Text>
                  </div>
                )}
              </div>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </Card>
  );

  const DocumentsContent = () => (
    <div>
      {sourcedJob.stageProgress?.map((stage, index) => (
        <Card key={stage._id} style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "16px" }}>
            <FileTextOutlined style={{ marginRight: "8px" }} />
            {stage.stageName} - Documents
          </Title>

          <div style={{ marginBottom: "16px" }}>
            <Text type="secondary">
              Stage Status:
              <Tag
                color={getStatusInfo(stage.stageStatus).color}
                style={{ marginLeft: "8px" }}
              >
                {stage.stageStatus?.toUpperCase()}
              </Tag>
            </Text>
          </div>

          {stage.uploadedDocuments?.length > 0 ? (
            <div style={{ marginBottom: "16px" }}>
              <Text strong>Uploaded Documents:</Text>
              <div style={{ marginTop: "8px" }}>
                {stage.uploadedDocuments.map((doc, docIndex) => (
                  <Tag key={docIndex} icon={<FileTextOutlined />}>
                    {doc.name || `Document ${docIndex + 1}`}
                  </Tag>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: "16px" }}>
              <Text type="secondary">No documents uploaded yet</Text>
            </div>
          )}

          <Divider />

          <div>
            <Text strong style={{ marginBottom: "8px", display: "block" }}>
              Upload Documents for {stage.stageName}:
            </Text>
            <Dragger
              {...uploadProps(stage._id)}
              style={{ marginBottom: "16px" }}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#da2c46" }} />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for single or bulk upload. You can upload multiple
                documents for this stage.
              </p>
            </Dragger>

            <Space>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => message.info("Please select files to upload")}
                style={{ background: "#da2c46" }}
              >
                Upload Files
              </Button>
              
            </Space>
          </div>
        </Card>
      ))}

      {!sourcedJob.stageProgress?.length && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <FileTextOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
            <Title level={4} style={{ marginTop: "16px", color: "#999" }}>
              No stages available
            </Title>
            <Text type="secondary">
              Document upload will be available once the application progresses
              through stages.
            </Text>
          </div>
        </Card>
      )}
    </div>
  );

  const tabItems = [
    {
      key: "overview",
      label: "Overview",
      children: <OverviewContent />,
    },
    {
      key: "timeline",
      label: "Timeline",
      children: <TimelineContent />,
    },
    {
      key: "documents",
      label: "Documents",
      children: <DocumentsContent />,
    },
  ];

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: "16px", color: "#da2c46" }}
      >
        Back to Applications
      </Button>
      <ConfigProvider
        theme={{
          components: {
            Tabs: {
              itemActiveColor: "#da2c46",
              itemSelectedColor: "#da2c46",
              itemHoverColor: "#da2c46",
              inkBarColor: "#da2c46",
            },
          },
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </ConfigProvider>
    </div>
  );
};

export default SourcedJobDetails;
