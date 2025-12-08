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
  Select,
} from "antd";
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  UploadOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { ConfigProvider } from "antd";
import {
  useUploadStageDocumentsMutation,
  useGetAppliedJobByIdQuery,
  useSubmitWorkOrderDocumentsMutation,
} from "../Slices/Users/UserApis";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const AppliedJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedExistingFiles, setSelectedExistingFiles] = useState({});
  const [editingDocuments, setEditingDocuments] = useState({});
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useGetAppliedJobByIdQuery(id);
  const [uploadStageDocuments] = useUploadStageDocumentsMutation();
  const [submitWorkOrderDocuments] = useSubmitWorkOrderDocumentsMutation();

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
      case "interview":
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

  const handleSelectExistingFile = (stageId, certificate, documentType) => {
    console.log("Selecting existing file:", {
      stageId,
      certificate,
      documentType,
    }); // Debug log

    setSelectedExistingFiles((prev) => {
      const updated = {
        ...prev,
        [stageId]: [
          ...(prev[stageId] || []),
          {
            fileName: certificate.fileName,
            fileUrl: certificate.fileUrl,
            documentName: documentType,
            _id: certificate._id,
          },
        ],
      };
      console.log("Updated selectedExistingFiles:", updated); // Debug log
      return updated;
    });

    message.success(
      `${certificate.fileName} selected from existing certificates`
    );
  };

  const removeExistingFile = (stageId, fileId) => {
    setSelectedExistingFiles((prev) => {
      const updatedFiles = { ...prev };
      if (updatedFiles[stageId]) {
        updatedFiles[stageId] = updatedFiles[stageId].filter(
          (file) => file._id !== fileId
        );
        if (updatedFiles[stageId].length === 0) {
          delete updatedFiles[stageId];
        }
      }
      return updatedFiles;
    });
  };

  const handleEditDocument = (stageId, docName, currentDoc) => {
    setEditingDocuments((prev) => ({
      ...prev,
      [stageId]: {
        ...(prev[stageId] || {}),
        [docName]: currentDoc,
      },
    }));
  };

  const handleReplaceDocument = (
    stageId,
    docName,
    newFile,
    isExisting = false
  ) => {
    if (isExisting) {
      // Replacing with existing certificate
      setSelectedExistingFiles((prev) => ({
        ...prev,
        [stageId]: [
          ...(prev[stageId] || []).filter((f) => f.documentName !== docName),
          {
            fileName: newFile.fileName,
            fileUrl: newFile.fileUrl,
            documentName: docName,
            _id: newFile._id,
            isReplaced: true,
          },
        ],
      }));
    } else {
      // Replacing with new upload
      setUploadedFiles((prev) => ({
        ...prev,
        [stageId]: [
          ...(prev[stageId] || []).filter((f) => f.documentType !== docName),
          {
            name: newFile.name,
            size: newFile.size,
            type: newFile.type,
            documentType: docName,
            lastModified: newFile.lastModified,
            preview: URL.createObjectURL(newFile),
            originFileObj: newFile,
          },
        ],
      }));
    }

    // Clear editing state
    setEditingDocuments((prev) => {
      const updated = { ...prev };
      if (updated[stageId]) {
        delete updated[stageId][docName];
      }
      return updated;
    });

    message.success(`Document replaced successfully`);
  };

  const handleCancelEdit = (stageId, docName) => {
    setEditingDocuments((prev) => {
      const updated = { ...prev };
      if (updated[stageId]) {
        delete updated[stageId][docName];
      }
      return updated;
    });
  };

  const clearAllPendingDocuments = (stageId) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [stageId]: [],
    }));
    setSelectedExistingFiles((prev) => ({
      ...prev,
      [stageId]: [],
    }));
    setEditingDocuments((prev) => ({
      ...prev,
      [stageId]: {},
    }));
    message.success("All pending documents cleared");
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
    const existingFiles = selectedExistingFiles[stageId] || [];
    const stage = appliedJob.stageProgress.find((s) => s._id === stageId);

    console.log("Stage Files:", stageFiles);
    console.log("Existing Files:", existingFiles);

    if (stageFiles.length === 0 && existingFiles.length === 0) {
      message.warning("Please upload at least one document before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the payload
      const payload = {
        customFieldId: appliedJob._id,
        stageId: stage.stageId,
      };

      // Add new files if any
      if (stageFiles.length > 0) {
        payload.files = stageFiles.map((file) => file.originFileObj);
        payload.filesMetadata = stageFiles.map((file) => ({
          fileName: file.name,
          documentName: file.documentType,
          fileSize: file.size,
          fileType: file.type,
        }));
      } else {
        payload.files = [];
        payload.filesMetadata = [];
      }

      // Add existing files if any - WITHOUT isReplaced inside
      if (existingFiles.length > 0) {
        payload.existingFiles = existingFiles.map((file) => ({
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          documentName: file.documentName,
        }));
        payload.isReplaced = true; // ADD THIS - at payload level
      }

      console.log("Submitting payload:", payload);

      const response = await uploadStageDocuments(payload).unwrap();

      message.success(response.message || "Documents submitted successfully!");

      setUploadedFiles((prev) => ({
        ...prev,
        [stageId]: [],
      }));
      setSelectedExistingFiles((prev) => ({
        ...prev,
        [stageId]: [],
      }));

      await refetch();
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
            {workOrder.workplace === "remote"
              ? "Remote"
              : workOrder.workplace === "on-site"
              ? "On-site"
              : "Hybrid"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Company Industry">
          {workOrder.companyIndustry || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Salary Range">
          {workOrder.salaryMin && workOrder.salaryMax
            ? `${formatCurrency(workOrder.salaryMin)} - ${formatCurrency(
                workOrder.salaryMax
              )} (${workOrder.salaryType || "monthly"})`
            : "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Experience Required">
          {workOrder.experienceMin && workOrder.experienceMax
            ? `${workOrder.experienceMin} - ${workOrder.experienceMax} years`
            : "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Education">
          <Tag color="purple">
            {workOrder.Education?.toUpperCase() || "Not specified"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Qualification">
          {workOrder.qualification || "Not specified"}
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
        <Descriptions.Item label="Visa Category">
          {workOrder.visacategory || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Visa Category Type">
          <Tag color="orange">
            {workOrder.visacategorytype?.toUpperCase() || "Not specified"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Application Status">
          <Tag
            color={getStatusInfo(appliedJob.status).color}
            icon={getStatusInfo(appliedJob.status).icon}
          >
            {appliedJob.status?.replace("_", " ").toUpperCase() || "PENDING"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Applied Status">
          <Tag color={appliedJob.isSourced === "true" ? "green" : "red"}>
            {appliedJob.isSourced === "true" ? "SOURCED" : "APPLIED"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Selected Moving Comment">
          {appliedJob.selectedMovingComment || "No comment provided"}
        </Descriptions.Item>
        <Descriptions.Item label="Applied Date">
          {appliedJob.createdAt
            ? new Date(appliedJob.createdAt).toLocaleDateString()
            : "Not available"}
        </Descriptions.Item>
        <Descriptions.Item label="Selected Moving Comment">
          {appliedJob.selectedMovingComment || "No comment provided"}
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
        <Descriptions.Item label="Key Responsibilities">
          <div style={{ whiteSpace: "pre-line" }}>
            {workOrder.keyResponsibilities || "No responsibilities listed"}
          </div>
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
        <Descriptions.Item label="Required Documents">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {workOrder.documents?.length > 0 ? (
              workOrder.documents.map((doc, index) => (
                <Tag key={doc._id || index} color="cyan">
                  {doc.name} {doc.isMandatory && <Text type="danger">*</Text>}
                </Tag>
              ))
            ) : (
              <Text type="secondary">No documents required</Text>
            )}
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

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

  const DocumentsContent = () => {
    const getDocumentName = (doc) => {
      if (typeof doc === "string") {
        return doc;
      }
      if (typeof doc === "object" && doc.title) {
        return doc.title;
      }
      return "Unknown Document";
    };

    const getDocumentId = (doc) => {
      if (typeof doc === "object" && doc._id) {
        return doc._id;
      }
      return null;
    };

    const isDocumentUploaded = (stageDocuments, requiredDocName) => {
      return stageDocuments?.some(
        (doc) =>
          doc.documentName === requiredDocName ||
          doc.documentName?.toLowerCase() === requiredDocName.toLowerCase() ||
          doc.fileName?.toLowerCase().includes(requiredDocName.toLowerCase())
      );
    };

    const getUploadedDocument = (stageDocuments, requiredDocName) => {
      return stageDocuments?.find(
        (doc) =>
          doc.documentName === requiredDocName ||
          doc.documentName?.toLowerCase() === requiredDocName.toLowerCase() ||
          doc.fileName?.toLowerCase().includes(requiredDocName.toLowerCase())
      );
    };

    const getPendingRequiredDocuments = (requiredDocs, uploadedDocs) => {
      return requiredDocs.filter((doc) => {
        const docName = getDocumentName(doc);
        return !isDocumentUploaded(uploadedDocs, docName);
      });
    };

    const handleSubmitWorkOrderDocuments = async () => {
      const woFiles = uploadedFiles["workOrder"] || [];
      const existingFiles = selectedExistingFiles["workOrder"] || [];

      console.log("Work Order Files:", woFiles);
      console.log("Existing Files:", existingFiles);

      if (woFiles.length === 0 && existingFiles.length === 0) {
        message.warning(
          "Please upload at least one document before submitting"
        );
        return;
      }

      setIsSubmitting(true);

      try {
        // Prepare the payload
        const payload = {
          customFieldId: appliedJob._id,
        };

        // Add new files if any
        if (woFiles.length > 0) {
          payload.files = woFiles.map((file) => file.originFileObj);
          payload.filesMetadata = woFiles.map((file) => ({
            fileName: file.name,
            documentName: file.documentType,
            fileSize: file.size,
            fileType: file.type,
          }));
        } else {
          payload.files = [];
          payload.filesMetadata = [];
        }

        if (existingFiles.length > 0) {
          payload.existingFiles = existingFiles.map((file) => ({
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            documentName: file.documentName,
          }));
          payload.isReplaced = true;
        }

        console.log("Submitting work order payload:", payload);

        const response = await submitWorkOrderDocuments(payload).unwrap();

        message.success(
          response.message || "Documents submitted successfully!"
        );

        setUploadedFiles((prev) => ({
          ...prev,
          ["workOrder"]: [],
        }));
        setSelectedExistingFiles((prev) => ({
          ...prev,
          ["workOrder"]: [],
        }));

        await refetch();
      } catch (error) {
        console.error("Failed to upload work order documents:", error);
        message.error(error?.data?.message || "Failed to submit documents");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div>
        {appliedJob.workOrder?.documents?.length > 0 && (
          <Card style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ marginBottom: "16px" }}>
              <FileTextOutlined style={{ marginRight: "8px" }} />
              Work Order Required Documents
            </Title>

            <div style={{ marginBottom: "16px" }}>
              <Text type="secondary">
                Status:
                <Tag
                  color={
                    appliedJob.workOrderuploadedDocuments?.length ===
                    appliedJob.workOrder.documents.length
                      ? "success"
                      : "warning"
                  }
                  style={{ marginLeft: "8px" }}
                >
                  {appliedJob.workOrderuploadedDocuments?.length || 0}/
                  {appliedJob.workOrder.documents.length} Uploaded
                </Tag>
              </Text>
            </div>

            {/* Required Documents Grid */}
            <div style={{ marginBottom: "24px" }}>
              <Title level={3}>
                Required Documents ({appliedJob.workOrder.documents.length})
              </Title>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  gap: "12px",
                }}
              >
                {appliedJob.workOrder.documents.map((doc, docIndex) => {
                  const isUploaded = isDocumentUploaded(
                    appliedJob.workOrderuploadedDocuments,
                    doc.name
                  );
                  const isPending = uploadedFiles["workOrder"]?.some(
                    (pendingDoc) => pendingDoc.documentType === doc.name
                  );
                  const uploadedDoc = getUploadedDocument(
                    appliedJob.workOrderuploadedDocuments,
                    doc.name
                  );
                  const isEditing = editingDocuments["workOrder"]?.[doc.name]; // ADD THIS

                  return (
                    <div
                      key={doc._id || docIndex}
                      style={{
                        padding: "12px",
                        border: `2px solid ${
                          isEditing
                            ? "#1890ff" // ADD THIS
                            : isUploaded
                            ? "#52c41a"
                            : isPending
                            ? "#faad14"
                            : "#d9d9d9"
                        }`,
                        borderRadius: "8px",
                        backgroundColor: isEditing
                          ? "#e6f7ff" // ADD THIS
                          : isUploaded
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
                          justifyContent: "space-between",
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
                              color: isEditing
                                ? "#1890ff" // ADD THIS
                                : isUploaded
                                ? "#52c41a"
                                : isPending
                                ? "#faad14"
                                : "#8c8c8c",
                              fontSize: "16px",
                            }}
                          />
                          <Text strong style={{ fontSize: "14px" }}>
                            {doc.name}
                          </Text>
                        </div>

                        {/* ADD THIS SECTION - Action Buttons */}
                        <div style={{ display: "flex", gap: "8px" }}>
                          {isUploaded && uploadedDoc && !isEditing && (
                            <>
                              <Button
                                type="primary"
                                size="small"
                                ghost
                                onClick={() => {
                                  if (uploadedDoc.fileUrl) {
                                    window.open(uploadedDoc.fileUrl, "_blank");
                                  } else {
                                    message.info("File preview not available");
                                  }
                                }}
                                style={{
                                  borderColor: "#52c41a",
                                  color: "#52c41a",
                                }}
                              >
                                View
                              </Button>
                              <Button
                                type="default"
                                size="small"
                                onClick={() =>
                                  handleEditDocument(
                                    "workOrder",
                                    doc.name,
                                    uploadedDoc
                                  )
                                }
                              >
                                Edit
                              </Button>
                            </>
                          )}
                          {isEditing && (
                            <Button
                              type="text"
                              size="small"
                              onClick={() =>
                                handleCancelEdit("workOrder", doc.name)
                              }
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>

                      {doc.description && (
                        <Text type="secondary" style={{ marginTop: "4px" }}>
                          {doc.description}
                        </Text>
                      )}

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
                            color={isEditing ? "blue" : "success"}
                            size="small"
                            icon={<CheckCircleOutlined />}
                          >
                            {isEditing ? "Editing" : "Uploaded"}
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

                      {isUploaded && uploadedDoc?.uploadedAt && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {new Date(
                            uploadedDoc.uploadedAt
                          ).toLocaleDateString()}
                        </Text>
                      )}

                      {/* ADD THIS - Edit message */}
                      {isEditing && (
                        <Text
                          type="warning"
                          style={{
                            fontSize: "12px",
                            display: "block",
                            marginTop: "4px",
                          }}
                        >
                          Select replacement below
                        </Text>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ADD THIS - Edit/Replace Section for Work Order */}
            {Object.keys(editingDocuments["workOrder"] || {}).length > 0 && (
              <div style={{ marginTop: "16px" }}>
                {Object.keys(editingDocuments["workOrder"] || {}).map(
                  (docName) => {
                    const currentDoc = editingDocuments["workOrder"][docName];
                    return (
                      <div
                        key={`edit-wo-${docName}`}
                        style={{
                          marginTop: "16px",
                          padding: "16px",
                          border: "2px solid #1890ff",
                          borderRadius: "8px",
                          backgroundColor: "#f0f5ff",
                        }}
                      >
                        <Title
                          level={5}
                          style={{ color: "#1890ff", marginBottom: "16px" }}
                        >
                          Replace: {docName}
                        </Title>

                        {/* Upload New File */}
                        <div style={{ marginBottom: "16px" }}>
                          <Text
                            strong
                            style={{ display: "block", marginBottom: "8px" }}
                          >
                            Upload New File:
                          </Text>
                          <Upload
                            name="file"
                            multiple={false}
                            showUploadList={false}
                            beforeUpload={(file) => {
                              const isLt5M = file.size / 1024 / 1024 < 5;
                              if (!isLt5M) {
                                message.error("File must be smaller than 5MB!");
                                return Upload.LIST_IGNORE;
                              }
                              handleReplaceDocument(
                                "workOrder",
                                docName,
                                file,
                                false
                              );
                              return false;
                            }}
                          >
                            <Button
                              icon={<UploadOutlined />}
                              type="primary"
                              ghost
                            >
                              Choose New File
                            </Button>
                          </Upload>
                        </div>

                        {/* Or Select Existing */}
                        {appliedJob.certificates?.length > 0 && (
                          <div>
                            <Text
                              strong
                              style={{ display: "block", marginBottom: "8px" }}
                            >
                              Or Select from Existing Certificates:
                            </Text>
                            <Select
                              style={{ width: "100%" }}
                              placeholder="Select existing certificate"
                              onChange={(value) => {
                                const certificate =
                                  appliedJob.certificates.find(
                                    (cert) => cert._id === value
                                  );
                                handleReplaceDocument(
                                  "workOrder",
                                  docName,
                                  certificate,
                                  true
                                );
                              }}
                            >
                              {appliedJob.certificates.map((cert) => (
                                <Select.Option key={cert._id} value={cert._id}>
                                  {cert.fileName}
                                </Select.Option>
                              ))}
                            </Select>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}

            {/* Upload Section for Work Order Documents */}
            <Divider />
            <div>
              <Title level={3}>Upload Work Order Documents</Title>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                {appliedJob.workOrder.documents
                  .filter(
                    (doc) =>
                      !isDocumentUploaded(
                        appliedJob.workOrderuploadedDocuments,
                        doc.name
                      )
                  )
                  .map((doc, docIndex) => (
                    <div
                      key={`wo-${doc._id || docIndex}`}
                      style={{
                        border: "2px dashed #d9d9d9",
                        borderRadius: "12px",
                        padding: "20px",
                        textAlign: "center",
                        backgroundColor: "#fafafa",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
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
                        {...uploadProps("workOrder", doc.name)}
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
                            {doc.name}
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
                      {appliedJob.certificates?.length > 0 && (
                        <div style={{ marginTop: "12px" }}>
                          <Text
                            type="secondary"
                            style={{ display: "block", marginBottom: "8px" }}
                          >
                            Or select from existing certificates:
                          </Text>
                          <Select
                            style={{ width: "100%" }}
                            placeholder="Select existing certificate"
                            onChange={(value) => {
                              const certificate = appliedJob.certificates.find(
                                (cert) => cert._id === value
                              );
                              handleSelectExistingFile(
                                "workOrder",
                                certificate,
                                doc.name
                              );
                            }}
                          >
                            {appliedJob.certificates.map((cert) => (
                              <Select.Option key={cert._id} value={cert._id}>
                                {cert.fileName}
                              </Select.Option>
                            ))}
                          </Select>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Submit Button for Work Order Documents */}
            {(uploadedFiles["workOrder"]?.length > 0 ||
              selectedExistingFiles["workOrder"]?.length > 0) && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <Text strong style={{ fontSize: "16px" }}>
                    Ready to Submit:{" "}
                    {(uploadedFiles["workOrder"]?.length || 0) +
                      (selectedExistingFiles["workOrder"]?.length || 0)}{" "}
                    document(s)
                  </Text>
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {uploadedFiles["workOrder"]?.length > 0 && (
                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: "4px" }}
                        >
                          New Uploads:
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                          }}
                        >
                          {uploadedFiles["workOrder"].map((file, index) => (
                            <Tag key={index} color="blue">
                              {file.name}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedExistingFiles["workOrder"]?.length > 0 && (
                      <div>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: "4px" }}
                        >
                          Existing Files:
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                          }}
                        >
                          {selectedExistingFiles["workOrder"].map(
                            (file, index) => (
                              <Tag key={`existing-${index}`} color="green">
                                {file.fileName}
                              </Tag>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    loading={isSubmitting}
                    onClick={handleSubmitWorkOrderDocuments}
                    style={{
                      backgroundColor: "#da2c46",
                      borderColor: "#da2c46",
                      minWidth: "140px",
                    }}
                    icon={!isSubmitting ? <CheckCircleOutlined /> : null}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Documents"}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => clearAllPendingDocuments("workOrder")}
                  >
                    Clear All (
                    {(uploadedFiles["workOrder"]?.length || 0) +
                      (selectedExistingFiles["workOrder"]?.length || 0)}
                    )
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        )}

        {stageProgress?.map((stage, index) => {
          const fullStage = stage.fullStage || stage;
          const requiredDocs = fullStage.requiredDocuments || [];
          const uploadedDocs = stage.uploadedDocuments || [];
          const pendingDocs = uploadedFiles[stage._id] || [];

          const pendingRequiredDocs = getPendingRequiredDocuments(
            requiredDocs,
            uploadedDocs
          );

          const allRequiredDocsUploaded =
            requiredDocs.length > 0 && pendingRequiredDocs.length === 0;

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
                {/* Add completion status */}
                {requiredDocs.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary">
                      Document Status:
                      <Tag
                        color={allRequiredDocsUploaded ? "success" : "warning"}
                        style={{ marginLeft: "8px" }}
                      >
                        {uploadedDocs.length}/{requiredDocs.length} Uploaded
                      </Tag>
                    </Text>
                  </div>
                )}
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
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Uploaded Documents Section */}
              {/* Uploaded Documents Section */}
              {uploadedDocs.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Title level={3}>
                      Uploaded Documents ({uploadedDocs.length})
                    </Title>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {uploadedDocs.map((doc, docIndex) => {
                      const isEditing =
                        editingDocuments[stage._id]?.[doc.documentName];

                      return (
                        <div
                          key={`uploaded-${docIndex}`}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px",
                            border: isEditing
                              ? "2px solid #1890ff"
                              : "1px solid #b7eb8f",
                            borderRadius: "6px",
                            backgroundColor: isEditing ? "#e6f7ff" : "#f6ffed",
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
                                backgroundColor: isEditing
                                  ? "#1890ff"
                                  : "#52c41a",
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
                              {doc.documentName && (
                                <Tag
                                  color={isEditing ? "blue" : "green"}
                                  size="small"
                                  style={{ marginTop: "4px" }}
                                >
                                  {doc.documentName}
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
                                  {new Date(
                                    doc.uploadedAt
                                  ).toLocaleDateString()}
                                </Text>
                              )}
                              {isEditing && (
                                <Text
                                  type="warning"
                                  style={{ fontSize: "12px", display: "block" }}
                                >
                                  Select replacement below
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
                            {!isEditing ? (
                              <>
                                <Tag
                                  color="success"
                                  icon={<CheckCircleOutlined />}
                                >
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
                                      message.info(
                                        "File preview not available"
                                      );
                                    }
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  type="default"
                                  size="small"
                                  onClick={() =>
                                    handleEditDocument(
                                      stage._id,
                                      doc.documentName,
                                      doc
                                    )
                                  }
                                >
                                  Edit
                                </Button>
                              </>
                            ) : (
                              <Button
                                type="text"
                                size="small"
                                onClick={() =>
                                  handleCancelEdit(stage._id, doc.documentName)
                                }
                              >
                                Cancel Edit
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Edit/Replace Section */}
                  {Object.keys(editingDocuments[stage._id] || {}).map(
                    (docName) => {
                      const currentDoc = editingDocuments[stage._id][docName];
                      return (
                        <div
                          key={`edit-${docName}`}
                          style={{
                            marginTop: "16px",
                            padding: "16px",
                            border: "2px solid #1890ff",
                            borderRadius: "8px",
                            backgroundColor: "#f0f5ff",
                          }}
                        >
                          <Title
                            level={5}
                            style={{ color: "#1890ff", marginBottom: "16px" }}
                          >
                            Replace: {docName}
                          </Title>

                          {/* Upload New File */}
                          <div style={{ marginBottom: "16px" }}>
                            <Text
                              strong
                              style={{ display: "block", marginBottom: "8px" }}
                            >
                              Upload New File:
                            </Text>
                            <Upload
                              name="file"
                              multiple={false}
                              showUploadList={false}
                              beforeUpload={(file) => {
                                const isLt5M = file.size / 1024 / 1024 < 5;
                                if (!isLt5M) {
                                  message.error(
                                    "File must be smaller than 5MB!"
                                  );
                                  return Upload.LIST_IGNORE;
                                }
                                handleReplaceDocument(
                                  stage._id,
                                  docName,
                                  file,
                                  false
                                );
                                return false;
                              }}
                            >
                              <Button
                                icon={<UploadOutlined />}
                                type="primary"
                                ghost
                              >
                                Choose New File
                              </Button>
                            </Upload>
                          </div>

                          {/* Or Select Existing */}
                          {appliedJob.certificates?.length > 0 && (
                            <div>
                              <Text
                                strong
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                }}
                              >
                                Or Select from Existing Certificates:
                              </Text>
                              <Select
                                style={{ width: "100%" }}
                                placeholder="Select existing certificate"
                                onChange={(value) => {
                                  const certificate =
                                    appliedJob.certificates.find(
                                      (cert) => cert._id === value
                                    );
                                  handleReplaceDocument(
                                    stage._id,
                                    docName,
                                    certificate,
                                    true
                                  );
                                }}
                              >
                                {appliedJob.certificates.map((cert) => (
                                  <Select.Option
                                    key={cert._id}
                                    value={cert._id}
                                  >
                                    {cert.fileName}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {pendingDocs.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Title level={3}>
                      Pending Documents ({pendingDocs.length})
                    </Title>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => {
                        setUploadedFiles((prev) => ({
                          ...prev,
                          [stage._id]: [],
                        }));
                        message.success("All pending uploads cleared");
                      }}
                    >
                      Clear All Pending
                    </Button>
                  </div>
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
                          border: "1px solid #faad14",
                          borderRadius: "6px",
                          backgroundColor: "#fffbf0",
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

              {/* Selected Existing Files Section */}
              {selectedExistingFiles[stage._id]?.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <Title level={3}>
                      Selected Existing Files (
                      {selectedExistingFiles[stage._id].length})
                    </Title>
                    <Button
                      type="text"
                      danger
                      size="small"
                      onClick={() => {
                        setSelectedExistingFiles((prev) => ({
                          ...prev,
                          [stage._id]: [],
                        }));
                        message.success("All selected files cleared");
                      }}
                    >
                      Clear All Selected
                    </Button>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {selectedExistingFiles[stage._id].map((file, index) => (
                      <div
                        key={`existing-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                          border: "1px solid #52c41a",
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
                              {file.fileName}
                            </Text>
                            <Tag
                              color="green"
                              size="small"
                              style={{ marginTop: "4px" }}
                            >
                              {file.documentName} (Existing)
                            </Tag>
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
                            type="primary"
                            size="small"
                            ghost
                            onClick={() => window.open(file.fileUrl, "_blank")}
                          >
                            View
                          </Button>
                          <Button
                            type="text"
                            size="small"
                            danger
                            onClick={() =>
                              removeExistingFile(stage._id, file._id)
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingRequiredDocs.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <Title level={3}>
                      {pendingRequiredDocs.length > 0
                        ? `Upload Missing Documents (${pendingRequiredDocs.length} remaining)`
                        : "Upload Documents"}
                    </Title>

                    {pendingRequiredDocs.length > 0 ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                          gap: "16px",
                          marginBottom: "16px",
                        }}
                      >
                        {pendingRequiredDocs.map((doc, docIndex) => {
                          const docName = getDocumentName(doc);
                          const docId = getDocumentId(doc);

                          return (
                            <div
                              key={docId || docIndex}
                              style={{
                                border: "2px dashed #d9d9d9",
                                borderRadius: "12px",
                                padding: "20px",
                                textAlign: "center",
                                backgroundColor: "#fafafa",
                                transition: "all 0.3s ease",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#da2c46";
                                e.currentTarget.style.backgroundColor = "#fff";
                                e.currentTarget.style.transform =
                                  "translateY(-2px)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(218, 44, 70, 0.15)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#d9d9d9";
                                e.currentTarget.style.backgroundColor =
                                  "#fafafa";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow = "none";
                              }}
                            >
                              <Upload
                                {...uploadProps(stage._id, docName)}
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
                                      style={{
                                        fontSize: "20px",
                                        color: "white",
                                      }}
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
                                    {docName}
                                  </Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                  >
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
                              {appliedJob.certificates?.length > 0 && (
                                <div style={{ marginTop: "12px" }}>
                                  <Text
                                    type="secondary"
                                    style={{
                                      display: "block",
                                      marginBottom: "8px",
                                    }}
                                  >
                                    Or select from existing certificates:
                                  </Text>
                                  <Select
                                    style={{ width: "100%" }}
                                    placeholder="Select existing certificate"
                                    onChange={(value) => {
                                      const certificate =
                                        appliedJob.certificates.find(
                                          (cert) => cert._id === value
                                        );
                                      handleSelectExistingFile(
                                        stage._id,
                                        certificate,
                                        docName
                                      );
                                    }}
                                  >
                                    {appliedJob.certificates.map((cert) => (
                                      <Select.Option
                                        key={cert._id}
                                        value={cert._id}
                                      >
                                        {cert.fileName}
                                      </Select.Option>
                                    ))}
                                  </Select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : requiredDocs.length === 0 ? (
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
                        <Upload
                          {...uploadProps(stage._id, "General Document")}
                          style={{ width: "100%" }}
                        >
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
                    ) : (
                      <div style={{ textAlign: "center", padding: "20px" }}>
                        <CheckCircleOutlined
                          style={{ fontSize: "48px", color: "#52c41a" }}
                        />
                        <Title
                          level={5}
                          style={{ marginTop: "16px", color: "#52c41a" }}
                        >
                          All Required Documents Uploaded
                        </Title>
                        <Text type="secondary">
                          You have successfully uploaded all required documents
                          for this stage.
                        </Text>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button Section */}
              {(pendingDocs.length > 0 ||
                selectedExistingFiles[stage._id]?.length > 0) && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "16px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <Text strong style={{ fontSize: "16px" }}>
                      Ready to Submit:{" "}
                      {pendingDocs.length +
                        (selectedExistingFiles[stage._id]?.length || 0)}{" "}
                      document(s)
                    </Text>
                    <div
                      style={{
                        marginTop: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {pendingDocs.length > 0 && (
                        <div>
                          <Text
                            type="secondary"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            New Uploads:
                          </Text>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                            }}
                          >
                            {pendingDocs.map((file, index) => (
                              <Tag key={index} color="blue">
                                {file.name}
                              </Tag>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedExistingFiles[stage._id]?.length > 0 && (
                        <div>
                          <Text
                            type="secondary"
                            style={{ display: "block", marginBottom: "4px" }}
                          >
                            Existing Files:
                          </Text>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "4px",
                            }}
                          >
                            {selectedExistingFiles[stage._id].map(
                              (file, index) => (
                                <Tag key={`existing-${index}`} color="green">
                                  {file.fileName}
                                </Tag>
                              )
                            )}
                          </div>
                        </div>
                      )}
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
                      {isSubmitting ? "Submitting..." : "Submit Documents"}
                    </Button>
                    <Button
                      size="large"
                      onClick={() => clearAllPendingDocuments(stage._id)}
                    >
                      Clear All (
                      {pendingDocs.length +
                        (selectedExistingFiles[stage._id]?.length || 0)}
                      )
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

  const InterviewContent = () => {
    if (
      !appliedJob.interviewDetails ||
      appliedJob.interviewDetails.length === 0
    ) {
      return (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <ClockCircleOutlined
              style={{ fontSize: "48px", color: "#d9d9d9" }}
            />
            <Title level={4} style={{ marginTop: "16px", color: "#999" }}>
              No interview scheduled yet
            </Title>
            <Text type="secondary">
              Interview details will appear here once scheduled.
            </Text>
          </div>
        </Card>
      );
    }

    const interview = appliedJob.interviewDetails;
    const interviewDate = new Date(interview.date);
    const interviewers = interview.interviewerIds || [];

    return (
      <>
        <Title level={4} style={{ marginBottom: "24px" }}>
          Interview Details
        </Title>

        {appliedJob.interviewDetails.map((interview, index) => {
          const interviewDate = new Date(interview.date);

          return (
            <Card key={interview._id || index} style={{ marginBottom: "16px" }}>
              <Descriptions
                bordered
                column={1}
                labelStyle={{ fontWeight: "600", width: "200px" }}
              >
                <Descriptions.Item label="Title">
                  {interview.title || "N/A"}
                </Descriptions.Item>

                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      interview.status === "scheduled"
                        ? "blue"
                        : interview.status === "completed"
                        ? "green"
                        : interview.status === "cancelled"
                        ? "red"
                        : "orange"
                    }
                  >
                    {interview.status?.toUpperCase() || "PENDING"}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Date">
                  {interviewDate.toLocaleDateString()}
                </Descriptions.Item>

                <Descriptions.Item label="Time">
                  {interviewDate.toLocaleTimeString()}
                </Descriptions.Item>

                <Descriptions.Item label="Mode">
                  <Tag
                    color={
                      interview.mode === "online"
                        ? "blue"
                        : interview.mode === "telephonic"
                        ? "orange"
                        : "green"
                    }
                  >
                    {interview.mode?.toUpperCase() || "NOT SPECIFIED"}
                  </Tag>
                </Descriptions.Item>

                {/* Conditional fields based on interview mode */}
                {interview.mode === "online" && interview.meetingLink && (
                  <Descriptions.Item label="Meeting Link">
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Join Meeting
                    </a>
                  </Descriptions.Item>
                )}

                {interview.mode === "in-person" && interview.location && (
                  <Descriptions.Item label="Location">
                    {interview.location}
                  </Descriptions.Item>
                )}

                {interview.mode === "telephonic" && (
                  <Descriptions.Item label="Contact Method">
                    Candidate will receive a phone call from the interviewer
                  </Descriptions.Item>
                )}

                {interview.notes && (
                  <Descriptions.Item label="Notes">
                    <Text>{interview.notes}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          );
        })}
      </>
    );
  };

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
            {
              label: <span>Interview</span>,
              key: "interview",
              children: <InterviewContent />,
              disabled: !appliedJob.interviewDetails,
            },
          ]}
        />
      </div>
    </ConfigProvider>
  );
};

export default AppliedJobDetails;
