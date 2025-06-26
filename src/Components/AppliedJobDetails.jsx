import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Badge,
  Divider,
  List,
  Collapse,
  Upload,
  message,
  Space,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { ConfigProvider } from "antd";
import {
  useUploadStageDocumentsMutation,
  useGetAppliedJobByIdQuery,
} from "../Slices/Users/UserApis";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AppliedJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: response, isLoading, isError } = useGetAppliedJobByIdQuery(id);
  const [uploadStageDocuments] = useUploadStageDocumentsMutation();

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
        <Text type="secondary">Please try again later</Text>
      </div>
    );
  }

  // Updated to handle the correct data structure
  if (!response?.appliedJob) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Title level={4}>Job not found</Title>
      </div>
    );
  }

  const appliedJob = response.appliedJob;
  const { workOrder, stageProgress } = appliedJob;

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "hired":
        return { icon: <CheckCircleOutlined />, color: "green" };
      case "pipeline":
        return { icon: <ClockCircleOutlined />, color: "blue" };
      case "shortlisted":
        return { icon: <CheckCircleOutlined />, color: "cyan" };
      case "interview_scheduled":
        return { icon: <ClockCircleOutlined />, color: "purple" };
      case "rejected":
        return { icon: <ExclamationCircleOutlined />, color: "red" };
      case "withdrawn":
        return { icon: <ExclamationCircleOutlined />, color: "orange" };
      case "completed":
        return { icon: <CheckCircleOutlined />, color: "green" };
      case "pending":
        return { icon: <ClockCircleOutlined />, color: "orange" };
      default:
        return { icon: <ClockCircleOutlined />, color: "blue" };
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      if (file.status === "done") {
        setUploadedFiles((prev) => ({
          ...prev,
          [stageId]: [
            ...(prev[stageId] || []),
            {
              name: file.name,
              size: file.size,
              type: file.type,
              documentType: docType,
              lastModified: file.lastModified,
              preview: URL.createObjectURL(file.originFileObj),
              originFileObj: file.originFileObj,
            },
          ],
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
        message.error("File must be smaller than 5MB!");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 1000);
    },
    onChange: handleFileUpload(stageId, docType),
  });

  const handleSubmitDocuments = async (stageId) => {
    const stageFiles = uploadedFiles[stageId] || [];
    const stage = appliedJob.stageProgress.find((s) => s._id === stageId);

    if (stageFiles.length === 0) {
      message.warning("Please upload at least one document before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await uploadStageDocuments({
        customFieldId: appliedJob._id,
        stageId: stage.stageId,
        files: stageFiles.map((file) => file.originFileObj),
        filesMetadata: stageFiles.map((file) => ({
          fileName: file.name,
          documentName: file.documentType,
          fileSize: file.size,
          fileType: file.type,
        })),
      }).unwrap();

      message.success(response.message || "Documents submitted successfully!");
      setUploadedFiles((prev) => ({
        ...prev,
        [stageId]: [],
      }));
    } catch (error) {
      console.error("Failed to upload documents:", error);
      message.error(error?.data?.message || "Failed to submit documents");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          src={"https://via.placeholder.com/64"}
          size={64}
          style={{ backgroundColor: "#f0f2f5" }}
        >
          {workOrder.companyIndustry?.[0]?.toUpperCase() || "C"}
        </Avatar>
        <div>
          <Title level={3} style={{ marginBottom: "4px" }}>
            {workOrder.title}
          </Title>
          <Text strong style={{ fontSize: "16px" }}>
            {workOrder.companyIndustry || "Company"}
          </Text>
        </div>
      </div>

      <Descriptions
        bordered
        column={1}
        labelStyle={{ fontWeight: "600", width: "200px" }}
      >
        <Descriptions.Item label="Job Code">
          {workOrder.jobCode || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Location">
          {workOrder.officeLocation || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Work Type">
          <Tag color={workOrder.workplace === "remote" ? "green" : "blue"}>
            {workOrder.workplace === "remote" ? "Remote" : "On-site"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Company Industry">
          {workOrder.companyIndustry || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Annual Salary">
          {formatCurrency(workOrder.annualSalary)}
        </Descriptions.Item>
        <Descriptions.Item label="Start Date">
          {workOrder.startDate
            ? new Date(workOrder.startDate).toLocaleDateString()
            : "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="End Date">
          {workOrder.endDate
            ? new Date(workOrder.endDate).toLocaleDateString()
            : "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Application Status">
          <Tag
            color={getStatusInfo(appliedJob.status).color}
            icon={getStatusInfo(appliedJob.status).icon}
          >
            {appliedJob.status?.replace("_", " ").toUpperCase() || "PENDING"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Applied Date">
          {appliedJob.createdAt
            ? new Date(appliedJob.createdAt).toLocaleDateString()
            : "Not available"}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {appliedJob.updatedAt
            ? new Date(appliedJob.updatedAt).toLocaleDateString()
            : "Not available"}
        </Descriptions.Item>
        <Descriptions.Item label="Skills Required">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {workOrder.requiredSkills?.length > 0 ? (
              workOrder.requiredSkills.map((skill, index) => (
                <Tag key={index} color="blue">
                  {skill}
                </Tag>
              ))
            ) : (
              <Text type="secondary">No specific skills mentioned</Text>
            )}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Job Description">
          {workOrder.description || "No description provided"}
        </Descriptions.Item>
        {workOrder.benefits?.length > 0 && (
          <Descriptions.Item label="Benefits">
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {workOrder.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  );

  // Enhanced Timeline Tab Content
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
              {new Date(appliedJob.createdAt).toLocaleString()}
            </Text>
          </div>
        </Timeline.Item>

        {stageProgress?.map((stage, index) => {
          const statusInfo = getStatusInfo(stage.stageStatus);
          return (
            <Timeline.Item
              key={stage._id || index}
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
                  text={stage.stageStatus?.toUpperCase() || "PENDING"}
                />
                <br />

                {stage.recruiterReviews?.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary">Reviewer Status:</Text>
                    {stage.recruiterReviews.map((review, reviewIndex) => (
                      <div
                        key={review._id || reviewIndex}
                        style={{ marginLeft: "16px", marginTop: "4px" }}
                      >
                        <Tag
                          color={
                            review.status === "approved"
                              ? "green"
                              : review.status === "pending"
                              ? "orange"
                              : "red"
                          }
                        >
                          {review.status?.toUpperCase()}
                        </Tag>
                        {review.reviewComments && (
                          <Text type="secondary">
                            {" "}
                            - {review.reviewComments}
                          </Text>
                        )}
                        {review.reviewedAt && (
                          <div style={{ marginTop: "4px" }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Reviewed:{" "}
                              {new Date(review.reviewedAt).toLocaleString()}
                            </Text>
                          </div>
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

        <Timeline.Item
          dot={React.cloneElement(getStatusInfo(appliedJob.status).icon, {
            style: { color: getStatusInfo(appliedJob.status).color },
          })}
          color={getStatusInfo(appliedJob.status).color}
        >
          <div>
            <Text strong>Current Status</Text>
            <br />
            <Badge
              color={getStatusInfo(appliedJob.status).color}
              text={
                appliedJob.status?.replace("_", " ").toUpperCase() || "PENDING"
              }
            />
          </div>
        </Timeline.Item>
      </Timeline>
    </Card>
  );

  // Enhanced Documents Tab Content
  // Enhanced Documents Tab Content
  const DocumentsContent = () => {
    // Helper function to extract document name from mixed array
    const getDocumentName = (doc) => {
      if (typeof doc === "string") {
        return doc;
      }
      if (typeof doc === "object" && doc.title) {
        return doc.title;
      }
      return "Unknown Document";
    };

    // Helper function to get document ID
    const getDocumentId = (doc) => {
      if (typeof doc === "object" && doc._id) {
        return doc._id;
      }
      return null;
    };

    // Helper function to check if a required document has been uploaded
    const isDocumentUploaded = (stageDocuments, requiredDocName) => {
      return stageDocuments?.some(
        (doc) =>
          doc.documentType === requiredDocName ||
          doc.fileName?.toLowerCase().includes(requiredDocName.toLowerCase()) ||
          doc.name?.toLowerCase().includes(requiredDocName.toLowerCase())
      );
    };

    // Helper function to get uploaded document for a required document
    const getUploadedDocument = (stageDocuments, requiredDocName) => {
      return stageDocuments?.find(
        (doc) =>
          doc.documentType === requiredDocName ||
          doc.fileName?.toLowerCase().includes(requiredDocName.toLowerCase()) ||
          doc.name?.toLowerCase().includes(requiredDocName.toLowerCase())
      );
    };

    return (
      <div>
        {stageProgress?.map((stage, index) => {
          // Get the full stage details from the stage object
          const fullStage = stage.fullStage || stage;
          const requiredDocs = fullStage.requiredDocuments || [];
          const uploadedDocs = stage.uploadedDocuments || [];
          const pendingDocs = uploadedFiles[stage._id] || [];

          return (
            <Card key={stage._id || index} style={{ marginBottom: "16px" }}>
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
                    {stage.stageStatus?.toUpperCase() || "PENDING"}
                  </Tag>
                </Text>
              </div>

              {/* Required Documents Section */}
              {requiredDocs.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <Title level={3}>
                    Required Documents ({requiredDocs.length})
                  </Title>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {requiredDocs.map((doc, docIndex) => {
                      const docName = getDocumentName(doc);
                      const docId = getDocumentId(doc);
                      const isUploaded = isDocumentUploaded(
                        uploadedDocs,
                        docName
                      );
                      const isPending = pendingDocs.some(
                        (pendingDoc) => pendingDoc.documentType === docName
                      );

                      return (
                        <div
                          key={docId || docIndex}
                          style={{
                            padding: "12px",
                            border: `2px solid ${
                              isUploaded
                                ? "#52c41a"
                                : isPending
                                ? "#faad14"
                                : "#d9d9d9"
                            }`,
                            borderRadius: "8px",
                            backgroundColor: isUploaded
                              ? "#f6ffed"
                              : isPending
                              ? "#fffbf0"
                              : "#fafafa",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <FileTextOutlined
                              style={{
                                color: isUploaded
                                  ? "#52c41a"
                                  : isPending
                                  ? "#faad14"
                                  : "#8c8c8c",
                                fontSize: "16px",
                              }}
                            />
                            <Text strong style={{ fontSize: "14px" }}>
                              {docName}
                            </Text>
                          </div>

                          <div
                            style={{
                              marginTop: "8px",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {isUploaded ? (
                              <Tag
                                color="success"
                                size="small"
                                icon={<CheckCircleOutlined />}
                              >
                                Uploaded
                              </Tag>
                            ) : isPending ? (
                              <Tag
                                color="warning"
                                size="small"
                                icon={<ClockCircleOutlined />}
                              >
                                Pending Submit
                              </Tag>
                            ) : (
                              <Tag color="default" size="small">
                                Not Uploaded
                              </Tag>
                            )}
                          </div>

                          {docId && (
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "11px",
                                display: "block",
                                marginTop: "4px",
                              }}
                            >
                              ID: {docId}
                            </Text>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploaded Documents Section */}
              {uploadedDocs.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <Title level={3}>
                    Uploaded Documents ({uploadedDocs.length})
                  </Title>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {uploadedDocs.map((doc, docIndex) => (
                      <div
                        key={`uploaded-${docIndex}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                          border: "1px solid #b7eb8f",
                          borderRadius: "6px",
                          backgroundColor: "#f6ffed",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "#52c41a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FileTextOutlined
                              style={{ color: "white", fontSize: "14px" }}
                            />
                          </div>

                          <div style={{ flex: 1 }}>
                            <Text strong style={{ display: "block" }}>
                              {doc.fileName ||
                                doc.name ||
                                `Document ${docIndex + 1}`}
                            </Text>
                            {doc.documentType && (
                              <Tag
                                color="green"
                                size="small"
                                style={{ marginTop: "4px" }}
                              >
                                {doc.documentType}
                              </Tag>
                            )}
                            {doc.uploadedAt && (
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: "12px",
                                  display: "block",
                                  marginTop: "2px",
                                }}
                              >
                                Uploaded:{" "}
                                {new Date(doc.uploadedAt).toLocaleDateString()}{" "}
                              </Text>
                            )}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Tag color="success" icon={<CheckCircleOutlined />}>
                            Submitted
                          </Tag>
                          <Button
                            type="primary"
                            size="small"
                            ghost
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
                  </div>
                </div>
              )}

              {pendingDocs.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <Title level={3}>
                    Pending Documents ({pendingDocs.length})
                  </Title>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {pendingDocs.map((file, fileIndex) => (
                      <div
                        key={`pending-${fileIndex}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: "#faad14",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FileTextOutlined
                              style={{ color: "white", fontSize: "14px" }}
                            />
                          </div>

                          <div style={{ flex: 1 }}>
                            <Text strong style={{ display: "block" }}>
                              {file.name}
                            </Text>
                            {file.documentType && (
                              <Tag
                                color="orange"
                                size="small"
                                style={{ marginTop: "4px" }}
                              >
                                {file.documentType}
                              </Tag>
                            )}
                            <Text
                              type="secondary"
                              style={{
                                fontSize: "12px",
                                display: "block",
                                marginTop: "2px",
                              }}
                            >
                              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                            </Text>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Button
                            type="text"
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
              )}

              {/* No Documents Message */}
              {requiredDocs.length === 0 &&
                uploadedDocs.length === 0 &&
                pendingDocs.length === 0 && (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <FileTextOutlined
                      style={{ fontSize: "48px", color: "#d9d9d9" }}
                    />
                    <Title
                      level={5}
                      style={{ marginTop: "16px", color: "#999" }}
                    >
                      No documents required or uploaded
                    </Title>
                    <Text type="secondary">
                      This stage doesn't require any documents at the moment.
                    </Text>
                  </div>
                )}

              <Divider />

              {/* Upload Section */}
              <div>
                <Title level={3}>Upload New Documents</Title>

                {requiredDocs.length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    {requiredDocs.map((doc, docIndex) => {
                      const docName = getDocumentName(doc);
                      const docId = getDocumentId(doc);
                      const isUploaded = isDocumentUploaded(
                        uploadedDocs,
                        docName
                      );

                      return (
                        <div
                          key={docId || docIndex}
                          style={{
                            border: `2px dashed ${
                              isUploaded ? "#52c41a" : "#d9d9d9"
                            }`,
                            borderRadius: "12px",
                            padding: "20px",
                            textAlign: "center",
                            backgroundColor: isUploaded ? "#f6ffed" : "#fafafa",
                            transition: "all 0.3s ease",
                            cursor: isUploaded ? "not-allowed" : "pointer",
                            opacity: isUploaded ? 0.6 : 1,
                            position: "relative",
                          }}
                          onMouseEnter={(e) => {
                            if (!isUploaded) {
                              e.currentTarget.style.borderColor = "#da2c46";
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(218, 44, 70, 0.15)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isUploaded) {
                              e.currentTarget.style.borderColor = "#d9d9d9";
                              e.currentTarget.style.backgroundColor = "#fafafa";
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }
                          }}
                        >
                          {isUploaded && (
                            <div
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                backgroundColor: "#52c41a",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CheckCircleOutlined
                                style={{ color: "white", fontSize: "12px" }}
                              />
                            </div>
                          )}

                          <Upload
                            {...uploadProps(stage._id, docName)}
                            disabled={isUploaded}
                            style={{ width: "100%" }}
                          >
                            <div>
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  backgroundColor: isUploaded
                                    ? "#52c41a"
                                    : "#da2c46",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 12px",
                                  transition: "transform 0.3s ease",
                                }}
                              >
                                {isUploaded ? (
                                  <CheckCircleOutlined
                                    style={{ fontSize: "20px", color: "white" }}
                                  />
                                ) : (
                                  <UploadOutlined
                                    style={{ fontSize: "20px", color: "white" }}
                                  />
                                )}
                              </div>
                              <Text
                                strong
                                style={{
                                  display: "block",
                                  marginBottom: "4px",
                                  fontSize: "16px",
                                }}
                              >
                                {docName}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                {isUploaded
                                  ? "Already uploaded"
                                  : "Click to upload or drag & drop"}
                              </Text>
                              {!isUploaded && (
                                <div
                                  style={{
                                    marginTop: "8px",
                                    fontSize: "10px",
                                    color: "#999",
                                  }}
                                >
                                  PDF, DOC, JPG, PNG (Max 5MB)
                                </div>
                              )}
                            </div>
                          </Upload>
                        </div>
                      );
                    })}
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

              {pendingDocs.length > 0 && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "16px",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <Text>
                      Ready to Submit: {pendingDocs.length} document(s)
                    </Text>
                    <div style={{ marginTop: "8px" }}>
                      {pendingDocs.map((file, index) => (
                        <Tag
                          key={index}
                          color="blue"
                          style={{ marginBottom: "4px" }}
                        >
                          {file.name}
                        </Tag>
                      ))}
                    </div>
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
                        minWidth: "140px",
                      }}
                      icon={!isSubmitting ? <CheckCircleOutlined /> : null}
                    >
                      {isSubmitting ? "Submitting..." : `Submit`}
                    </Button>
                    <Button
                      size="large"
                      onClick={() =>
                        setUploadedFiles((prev) => ({
                          ...prev,
                          [stage._id]: [],
                        }))
                      }
                    >
                      Clear All ({pendingDocs.length})
                    </Button>
                  </Space>
                </div>
              )}
            </Card>
          );
        })}

        {!stageProgress?.length && (
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

  // Pipeline Tab Content (existing implementation)
  const PipelineContent = () => (
    <Card>
      <Title level={4} style={{ marginBottom: "24px" }}>
        Pipeline Stages
      </Title>

      {stageProgress?.length > 0 ? (
        stageProgress.map((stage, index) => (
          <div key={index} style={{ marginBottom: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title level={5} style={{ marginBottom: 0 }}>
                {stage.stageName}
              </Title>
              <Tag
                color={
                  stage.stageStatus === "completed"
                    ? "green"
                    : stage.stageStatus === "pending"
                    ? "orange"
                    : "blue"
                }
              >
                {stage.stageStatus?.toUpperCase() || "PENDING"}
              </Tag>
            </div>

            {stage.fullStage?.description && (
              <Text
                style={{
                  display: "block",
                  marginTop: "8px",
                  marginBottom: "16px",
                }}
              >
                {stage.fullStage.description}
              </Text>
            )}

            <Divider />

            <Title level={5} style={{ marginBottom: "16px" }}>
              Pipeline Information
            </Title>

            <Descriptions size="small" column={1}>
              <Descriptions.Item label="Pipeline Name">
                {stage.pipelineId?.name || "Not specified"}
              </Descriptions.Item>
              <Descriptions.Item label="Stage ID">
                {stage.stageId}
              </Descriptions.Item>
              <Descriptions.Item label="Recruiter ID">
                {stage.recruiterId}
              </Descriptions.Item>
              <Descriptions.Item label="Dependency Type">
                <Tag color="blue">
                  {stage.fullStage?.dependencyType || "Not specified"}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {stage.recruiterReviews?.length > 0 && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: "16px" }}>
                  Recruiter Reviews
                </Title>
                <List
                  dataSource={stage.recruiterReviews}
                  renderItem={(review) => (
                    <List.Item>
                      <Card size="small" style={{ width: "100%" }}>
                        <div>
                          <Text strong>Status: </Text>
                          <Tag
                            color={
                              review.status === "approved"
                                ? "green"
                                : review.status === "pending"
                                ? "orange"
                                : "red"
                            }
                          >
                            {review.status?.toUpperCase()}
                          </Tag>
                          <br />
                          {review.reviewComments && (
                            <>
                              <Text strong>Comments: </Text>
                              <Text>{review.reviewComments}</Text>
                              <br />
                            </>
                          )}
                          {review.reviewedAt && (
                            <>
                              <Text strong>Reviewed At: </Text>
                              <Text>
                                {new Date(review.reviewedAt).toLocaleString()}
                              </Text>
                            </>
                          )}
                        </div>
                      </Card>
                    </List.Item>
                  )}
                />
              </>
            )}

            {stage.uploadedDocuments?.length > 0 && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: "16px" }}>
                  Uploaded Documents
                </Title>
                <List
                  dataSource={stage.uploadedDocuments}
                  renderItem={(doc) => (
                    <List.Item>
                      <FileTextOutlined style={{ marginRight: "8px" }} />
                      <Text>{doc.name || "Document"}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}

            {stage.fullStage?.requiredDocuments?.length > 0 && (
              <>
                <Divider />
                <Title level={5} style={{ marginBottom: "16px" }}>
                  Required Documents
                </Title>
                <List
                  dataSource={stage.fullStage.requiredDocuments}
                  renderItem={(doc) => (
                    <List.Item>
                      <FileTextOutlined style={{ marginRight: "8px" }} />
                      <Text>{doc}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}

            {index < stageProgress.length - 1 && <Divider dashed />}
          </div>
        ))
      ) : (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <ClockCircleOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <Title level={4} style={{ marginTop: "16px", color: "#999" }}>
            No pipeline stages available
          </Title>
          <Text type="secondary">
            Pipeline information will appear as your application progresses.
          </Text>
        </div>
      )}
    </Card>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#da2c46",
        },
      }}
    >
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
              children: <OverviewContent />,
            },
            {
              label: <span>Timeline</span>,
              key: "timeline",
              children: <TimelineContent />,
            },
            {
              label: <span>Documents</span>,
              key: "documents",
              children: <DocumentsContent />,
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
};

export default AppliedJobDetails;
