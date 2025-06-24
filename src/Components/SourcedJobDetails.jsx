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
import { ConfigProvider } from "antd";
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

const DocumentsContent = () => {
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const removeFile = (stageId, fileIndex) => {
    setUploadedFiles((prev) => {
      const updatedFiles = { ...prev };
      if (updatedFiles[stageId]) {
        updatedFiles[stageId] = updatedFiles[stageId].filter(
          (_, index) => index !== fileIndex
        );
        if (updatedFiles[stageId].length === 0) {
          delete updatedFiles[stageId];
        }
      }
      return updatedFiles;
    });
  };

  const handleFileUpload = (stageId, docType) => {
    return (info) => {
      const { file } = info;
      if (file.status === 'done') {
        setUploadedFiles(prev => ({
          ...prev,
          [stageId]: [
            ...(prev[stageId] || []),
            {
              name: file.name,
              size: file.size,
              type: file.type,
              documentType: docType,
              lastModified: file.lastModified,
              preview: URL.createObjectURL(file.originFileObj)
            }
          ]
        }));
        message.success(`${file.name} file uploaded successfully.`);
      }
    };
  };

  const uploadProps = (stageId, docType) => ({
    name: "file",
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: ({ file, onSuccess }) => {
      // Simulate upload success after 1 second
      setTimeout(() => {
        onSuccess("ok");
      }, 1000);
    },
    onChange: handleFileUpload(stageId, docType)
  });

  const handleSubmitDocuments = (stageId) => {
    const stageFiles = uploadedFiles[stageId] || [];
    if (stageFiles.length === 0) {
      message.warning('Please upload at least one document before submitting');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      message.success(`${stageFiles.length} document(s) submitted successfully!`);
      setIsSubmitting(false);
      setUploadedFiles(prev => ({
        ...prev,
        [stageId]: []
      }));
    }, 2000);
  };

    return (
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

            {/* Display Required Documents */}
            {stage.fullStage?.requiredDocuments?.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <Text strong>Required Documents:</Text>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {stage.fullStage.requiredDocuments.map(
                    (docType, docIndex) => (
                      <Tag
                        key={docIndex}
                        color="blue"
                        icon={<FileTextOutlined />}
                        style={{ marginBottom: "4px" }}
                      >
                        {docType}
                      </Tag>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Display Uploaded Documents */}
            {stage.uploadedDocuments?.length > 0 ||
            uploadedFiles[stage._id]?.length > 0 ? (
              <div style={{ marginBottom: "16px" }}>
                <Text strong>Uploaded Documents:</Text>
                <div style={{ marginTop: "8px" }}>
                  {/* Show existing uploaded documents */}
                  {stage.uploadedDocuments?.map((doc, docIndex) => (
                    <div
                      key={`existing-${docIndex}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 12px",
                        border: "1px solid #d9d9d9",
                        borderRadius: "6px",
                        marginBottom: "8px",
                        backgroundColor: "#f0f9ff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <FileTextOutlined style={{ color: "#52c41a" }} />
                        <Text>
                          {doc.name ||
                            doc.originalName ||
                            `Document ${docIndex + 1}`}
                        </Text>
                        {doc.documentType && (
                          <Tag color="green" size="small">
                            Submitted
                          </Tag>
                        )}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {doc.uploadDate && (
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </Text>
                        )}
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            if (doc.fileUrl) {
                              window.open(doc.fileUrl, "_blank");
                            } else {
                              message.info("File preview not available");
                            }
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Show newly uploaded files (pending submission) */}
                  {uploadedFiles[stage._id]?.map((file, fileIndex) => (
                    <div
                      key={`new-${fileIndex}`}
                      
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <FileTextOutlined style={{ color: "#faad14" }} />
                        <Text>{file.name}</Text>
                       
                        {file.documentType && (
                          <Tag color="blue" size="small">
                            {file.documentType}
                          </Tag>
                        )}
                      </div>
                      <div
                       
                      >
                      
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={() => removeFile(stage._id, fileIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: "16px" }}>
                <Text type="secondary">No documents uploaded yet</Text>
              </div>
            )}

            <Divider />

            {/* Upload Section for Each Required Document */}
            <div>
              <Text strong style={{ marginBottom: "16px", display: "block" }}>
                Upload Documents:
              </Text>

              {stage.fullStage?.requiredDocuments?.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  {stage.fullStage.requiredDocuments.map(
                    (docType, docIndex) => (
                      <div
                        key={docIndex}
                        style={{
                          border: "2px dashed #d9d9d9",
                          borderRadius: "12px",
                          padding: "20px",
                          textAlign: "center",
                          backgroundColor: "#fafafa",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#da2c46";
                          e.currentTarget.style.backgroundColor = "#fff";
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(218, 44, 70, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#d9d9d9";
                          e.currentTarget.style.backgroundColor = "#fafafa";
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <Upload
                          {...uploadProps(stage._id, docType)}
                          style={{ width: "100%" }}
                        >
                          <div>
                            <div
                              style={{
                                width: "50px",
                                height: "50px",
                                borderRadius: "50%",
                                backgroundColor: "#da2c46",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 12px",
                                transition: "transform 0.3s ease",
                              }}
                            >
                              <UploadOutlined
                                style={{ fontSize: "20px", color: "white" }}
                              />
                            </div>
                            <Text
                              strong
                              style={{
                                display: "block",
                                marginBottom: "4px",
                                fontSize: "16px",
                              }}
                            >
                              {docType}
                            </Text>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Click to upload or drag & drop
                            </Text>
                            <div
                              style={{
                                marginTop: "8px",
                                fontSize: "10px",
                                color: "#999",
                              }}
                            >
                              PDF, DOC, JPG, PNG (Max 5MB)
                            </div>
                          </div>
                        </Upload>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div
                  style={{
                    border: "2px dashed #d9d9d9",
                    borderRadius: "12px",
                    padding: "40px",
                    textAlign: "center",
                    backgroundColor: "#fafafa",
                    maxWidth: "400px",
                  }}
                >
                  <Upload {...uploadProps(stage._id)}>
                    <div>
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: "#da2c46",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                        }}
                      >
                        <UploadOutlined
                          style={{ fontSize: "24px", color: "white" }}
                        />
                      </div>
                      <Text
                        strong
                        style={{
                          display: "block",
                          marginBottom: "8px",
                          fontSize: "18px",
                        }}
                      >
                        Upload Documents
                      </Text>
                      <Text type="secondary">
                        Click to upload or drag & drop your files
                      </Text>
                    </div>
                  </Upload>
                </div>
              )}
            </div>

            {/* Submit Button */}
            {uploadedFiles[stage._id]?.length > 0 && (
              <div
              >
                <div style={{ marginBottom: "12px" }}>
                  <Text type="secondary">
                    {uploadedFiles[stage._id].length} file(s) ready to submit
                  </Text>
                </div>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    loading={isSubmitting}
                    onClick={() => handleSubmitDocuments(stage._id)}
                    style={{
                      backgroundColor: "#da2c46",
                      borderColor: "#da2c46",
                      minWidth: "120px",
                    }}
                    icon={!isSubmitting ? <CheckCircleOutlined /> : null}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                  <Button
                    size="large"
                    onClick={() =>
                      setUploadedFiles((prev) => ({ ...prev, [stage._id]: [] }))
                    }
                  >
                    Clear All
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        ))}

        {!sourcedJob.stageProgress?.length && (
          <Card>
            <div style={{ textAlign: "center", padding: "40px" }}>
              <FileTextOutlined
                style={{ fontSize: "48px", color: "#d9d9d9" }}
              />
              <Title level={4} style={{ marginTop: "16px", color: "#999" }}>
                No stages available
              </Title>
              <Text type="secondary">
                Document upload will be available once the application
                progresses through stages.
              </Text>
            </div>
          </Card>
        )}
      </div>
    );
  };

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
