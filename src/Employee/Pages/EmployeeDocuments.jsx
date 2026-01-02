import React, { useState } from "react";
import {
  Button,
  Card,
  Modal,
  Steps,
  Upload,
  Select,
  DatePicker,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Popconfirm,
  Alert,
  Empty,
  Spin,
  Dropdown,
  Divider,
  Input,
  message,
} from "antd";
import { useSnackbar } from "notistack";
import {
  UploadOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  WarningOutlined,
  EditOutlined,
  MoreOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetEmployeeDocumentsQuery,
  useUploadEmployeeDocumentMutation,
  useReplaceEmployeeDocumentMutation,
  useSetEmployeeDocumentAlertDateMutation,
} from "../../Slices/Employee/EmployeeApis";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { Dragger } = Upload;

const EmployeeDocuments = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetEmployeeDocumentsQuery();

  const [uploadEmployeeDocument, { isLoading: isUploading }] =
    useUploadEmployeeDocumentMutation();

  const [replaceEmployeeDocument, { isLoading: isReplacing }] =
    useReplaceEmployeeDocumentMutation();

  const [setEmployeeDocumentAlertDate, { isLoading: isSettingAlert }] =
    useSetEmployeeDocumentAlertDateMutation();

  const documents =
    apiResponse?.documents?.length > 0
      ? apiResponse.documents.flatMap(
          (record) =>
            record.documents?.map((doc) => ({
              ...doc,
              workOrderId: record.workOrder?._id,
              workOrderTitle: record.workOrder?.title,
              recordId: record._id,
            })) || []
        )
      : [];

  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isExpiryModalVisible, setIsExpiryModalVisible] = useState(false);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [documentToReplace, setDocumentToReplace] = useState(null);
  const [documentForExpiry, setDocumentForExpiry] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [newDocument, setNewDocument] = useState({
    file: null,
    documentName: "",
    hasExpiry: null,
    expiryDate: null,
  });
  const [expiryForm, setExpiryForm] = useState({
    hasExpiry: null,
    expiryDate: null,
  });

  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD MMM YYYY");
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = dayjs(expiryDate).startOf("day");
    const today = dayjs().startOf("day");
    const diffDays = expiry.diff(today, "day");
    return diffDays >= 0 && diffDays <= 5;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return dayjs(expiryDate).isBefore(dayjs(), "day");
  };

  const getExpiringDocuments = () => {
    return documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      const expiry = dayjs(doc.expiryDate).startOf("day");
      const today = dayjs().startOf("day");
      const diffDays = expiry.diff(today, "day");

      // Include documents that expire today or within the next 5 days
      return diffDays >= 0 && diffDays <= 5;
    });
  };

  const getExpiredDocuments = () => {
    return documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      const expiry = dayjs(doc.expiryDate).startOf("day");
      const today = dayjs().startOf("day");
      return expiry.isBefore(today);
    });
  };

  const getExpiryTag = (expiryDate) => {
    if (!expiryDate) {
      return (
        <Tag color="default" icon={<ClockCircleOutlined />}>
          No Expiry Set
        </Tag>
      );
    }

    if (isExpired(expiryDate)) {
      return (
        <Tag color="error" icon={<ExclamationCircleOutlined />}>
          Expired
        </Tag>
      );
    }

    if (isExpiringSoon(expiryDate)) {
      return (
        <Tag color="warning" icon={<WarningOutlined />}>
          Expiring Soon
        </Tag>
      );
    }

    return <Tag color="success">Valid</Tag>;
  };

  // Set expiry date for existing document
  const openExpiryModal = (doc) => {
    setDocumentForExpiry(doc);
    setExpiryForm({
      hasExpiry: null,
      expiryDate: null,
    });
    setIsExpiryModalVisible(true);
  };

  const handleExpiryFormSubmit = async () => {
    try {
      if (expiryForm.hasExpiry === true && !expiryForm.expiryDate) {
        message.error("Please select an expiry date");
        return;
      }

      const userId = apiResponse?.userId;

      if (!userId) {
        message.error(
          "Document record ID not found. Please refresh and try again."
        );
        return;
      }

      const dateToSet =
        expiryForm.hasExpiry && expiryForm.expiryDate
          ? expiryForm.expiryDate.format("YYYY-MM-DD")
          : "";

      await setEmployeeDocumentAlertDate({
        id: userId,
        docId: documentForExpiry._id,
        date: dateToSet,
      }).unwrap();

      // Close modal first
      setIsExpiryModalVisible(false);
      resetExpiryForm();
      
      // Show success message
      message.success({
        content: "Document expiry date updated successfully!",
        duration: 3,
      });
      
      // Refetch data to update the UI
      await refetch();
    } catch (error) {
      message.error({
        content: error?.data?.message || "Failed to update document expiry. Please try again.",
        duration: 4,
      });
      console.error("Expiry update error:", error);
    }
  };

  const resetExpiryForm = () => {
    setExpiryForm({
      hasExpiry: null,
      expiryDate: null,
    });
    setDocumentForExpiry(null);
    setIsExpiryModalVisible(false);
  };

  const handleFileUpload = (info) => {
    const { file } = info;
    if (file.status !== "uploading") {
      setNewDocument((prev) => ({ ...prev, file: file.originFileObj || file }));
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!newDocument.file || !newDocument.documentName) {
        message.error("Please select document type and file");
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      // Only validate expiry date if hasExpiry is true
      if (newDocument.hasExpiry === true && !newDocument.expiryDate) {
        message.error("Please select expiry date");
        return;
      }
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExpirySelection = (hasExpiry) => {
    setNewDocument((prev) => ({
      ...prev,
      hasExpiry,
      expiryDate: hasExpiry ? prev.expiryDate : null,
    }));
  };

  const handleExpiryFormSelection = (hasExpiry) => {
    setExpiryForm((prev) => ({
      ...prev,
      hasExpiry,
      expiryDate: hasExpiry ? prev.expiryDate : null,
    }));
  };

  const startUpload = (replaceDoc = null) => {
    setIsReplaceMode(!!replaceDoc);
    setDocumentToReplace(replaceDoc);

    if (replaceDoc) {
      setNewDocument({
        file: null,
        documentName: replaceDoc.documentName,
        hasExpiry: replaceDoc.expiryDate ? true : null,
        expiryDate: replaceDoc.expiryDate ? dayjs(replaceDoc.expiryDate) : null,
      });
    } else {
      setNewDocument({
        file: null,
        documentName: "",
        hasExpiry: null,
        expiryDate: null,
      });
    }

    setCurrentStep(0);
    setIsUploadModalVisible(true);
  };

  const confirmUpload = async () => {
    try {
      console.log("API Response:", apiResponse);
      console.log("User ID:", apiResponse?.userId);

      const userId = apiResponse?.userId;

      if (!userId) {
        enqueueSnackbar("User ID not found. Please refresh and try again.", {
          variant: "error",
        });
        return;
      }

      const formData = new FormData();
      formData.append("documents", newDocument.file);
      formData.append("documentName", newDocument.documentName);

      // Add docId for replace mode
      if (isReplaceMode && documentToReplace) {
        formData.append("docId", documentToReplace._id);
      }

      if (newDocument.hasExpiry && newDocument.expiryDate) {
        formData.append(
          "expiryDate",
          newDocument.expiryDate.format("YYYY-MM-DD")
        );
      }

      if (isReplaceMode && documentToReplace) {
        // Use replace mutation
        await replaceEmployeeDocument({
          id: userId,
          formData,
        }).unwrap();

        enqueueSnackbar("Document replaced successfully!", {
          variant: "success",
        });
      } else {
        // Use upload mutation for new documents
        await uploadEmployeeDocument({
          id: userId,
          formData,
        }).unwrap();

        enqueueSnackbar("Document uploaded successfully!", {
          variant: "success",
        });
      }

      await refetch();
      resetUploadForm();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message ||
          `Failed to ${
            isReplaceMode ? "replace" : "upload"
          } document. Please try again.`,
        { variant: "error" }
      );
      console.error(`${isReplaceMode ? "Replace" : "Upload"} error:`, error);
    }
  };

  const resetUploadForm = () => {
    setNewDocument({
      file: null,
      documentName: "",
      hasExpiry: null,
      expiryDate: null,
    });
    setCurrentStep(0);
    setIsUploadModalVisible(false);
    setIsReplaceMode(false);
    setDocumentToReplace(null);
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    beforeUpload: () => false,
    onChange: handleFileUpload,
    showUploadList: false,
  };

  const existingDoc = documents.find(
    (doc) =>
      doc.documentName.toLowerCase() ===
        newDocument.documentName.toLowerCase() &&
      (!isReplaceMode || doc._id !== documentToReplace?._id)
  );

  const steps = [
    {
      title: "Document Details",
      icon: <FileTextOutlined />,
    },
    {
      title: "Expiry Information",
      icon: <CalendarOutlined />,
    },
    {
      title: "Confirmation",
      icon: <CheckCircleOutlined />,
    },
  ];

  const getDocumentActions = (doc) => {
    const actions = [
      {
        key: "view",
        label: "View Document",
        icon: <EyeOutlined />,
        onClick: () => window.open(doc.fileUrl, "_blank"),
      },
      {
        key: "replace",
        label: "Replace Document",
        icon: <EditOutlined />,
        onClick: () => startUpload(doc),
      },
    ];

    if (!doc.expiryDate) {
      actions.push({
        key: "setExpiry",
        label: "Set Expiry Date",
        icon: <CalendarOutlined />,
        onClick: () => openExpiryModal(doc),
      });
    }

    return actions;
  };

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <Card>
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <ExclamationCircleOutlined
                style={{
                  fontSize: "64px",
                  color: "#ff4d4f",
                  marginBottom: "16px",
                }}
              />
              <Title level={3} type="danger">
                Failed to load documents
              </Title>
              <Paragraph type="secondary">
                There was an error loading your documents.
              </Paragraph>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={refetch}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "12px 8px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 8px",
        }}
      >
        {/* Header */}
        <Card style={{ marginBottom: "16px" }} bodyStyle={{ padding: "16px" }}>
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={16} md={18}>
              <Title
                level={2}
                style={{
                  margin: 0,
                  marginBottom: "4px",
                  fontSize: "clamp(20px, 4vw, 24px)",
                }}
              >
                Document Management
              </Title>
              <Paragraph
                style={{
                  margin: 0,
                  color: "#666",
                  fontSize: "clamp(12px, 2.5vw, 14px)",
                }}
              >
                Upload, manage and track your important documents
              </Paragraph>
              {documents.length > 0 && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: "clamp(11px, 2vw, 13px)",
                    display: "block",
                    marginTop: "4px",
                  }}
                >
                  {documents.length} document{documents.length !== 1 ? "s" : ""}{" "}
                  uploaded
                </Text>
              )}
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => startUpload()}
                style={{
                  backgroundColor: "#da2c46",
                  borderColor: "#da2c46",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    display: window.innerWidth > 480 ? "inline" : "none",
                  }}
                >
                  Upload Document
                </span>
                <span
                  style={{
                    display: window.innerWidth <= 480 ? "inline" : "none",
                  }}
                >
                  Upload
                </span>
              </Button>
            </Col>
          </Row>
        </Card>

        {getExpiredDocuments().length > 0 && (
          <Card
            style={{ marginBottom: "16px" }}
            bodyStyle={{ padding: "16px" }}
          >
            <Alert
              message={`${getExpiredDocuments().length} Document${
                getExpiredDocuments().length > 1 ? "s" : ""
              } Expired`}
              description={
                <div>
                  <Text style={{ marginBottom: "8px", display: "block" }}>
                    The following documents have expired and need immediate
                    attention:
                  </Text>
                  <Space direction="vertical" size={4}>
                    {getExpiredDocuments().map((doc) => (
                      <div
                        key={doc._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Text strong style={{ color: "#ff4d4f" }}>
                          {doc.documentName}
                        </Text>
                        <Text type="secondary">
                          - Expired on {formatDate(doc.expiryDate)}
                        </Text>
                        <Text type="danger">
                          (
                          {Math.abs(dayjs(doc.expiryDate).diff(dayjs(), "day"))}{" "}
                          days ago)
                        </Text>
                        <Button
                          size="small"
                          type="primary"
                          danger
                          onClick={() => startUpload(doc)}
                          style={{ marginLeft: "auto" }}
                        >
                          Replace Now
                        </Button>
                      </div>
                    ))}
                  </Space>
                </div>
              }
              type="error"
              showIcon
              closable
              style={{ marginBottom: "16px" }}
            />
          </Card>
        )}

        {getExpiringDocuments().length > 0 && (
          <Card
            style={{ marginBottom: "16px" }}
            bodyStyle={{ padding: "16px" }}
          >
            <Alert
              message={`${getExpiringDocuments().length} Document${
                getExpiringDocuments().length > 1 ? "s" : ""
              } Expiring Soon`}
              description={
                <div>
                  <Text style={{ marginBottom: "8px", display: "block" }}>
                    The following documents will expire within 5 days:
                  </Text>
                  <Space direction="vertical" size={4}>
                    {getExpiringDocuments().map((doc) => {
                      const daysLeft = dayjs(doc.expiryDate)
                        .startOf("day")
                        .diff(dayjs().startOf("day"), "day");
                      return (
                        <div
                          key={doc._id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Text strong>{doc.documentName}</Text>
                          <Text type="secondary">
                            - Expires on {formatDate(doc.expiryDate)}
                          </Text>
                          <Text type={daysLeft === 0 ? "danger" : "warning"}>
                            (
                            {daysLeft === 0
                              ? "Expires today!"
                              : `${daysLeft} day${
                                  daysLeft > 1 ? "s" : ""
                                } left`}
                            )
                          </Text>
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => startUpload(doc)}
                            style={{
                              marginLeft: "auto",
                              backgroundColor:
                                daysLeft === 0 ? "#ff4d4f" : "#faad14",
                              borderColor:
                                daysLeft === 0 ? "#ff4d4f" : "#faad14",
                            }}
                          >
                            Replace
                          </Button>
                        </div>
                      );
                    })}
                  </Space>
                </div>
              }
              type="error"
              showIcon
              closable
              style={{ marginBottom: "16px" }}
            />
          </Card>
        )}

        {/* Documents Grid */}
        {documents.length > 0 ? (
          <Row gutter={[12, 12]}>
            {documents.map((doc) => (
              <Col key={doc._id} xs={24} sm={12} md={8} lg={6} xl={6}>
                <Card
                  hoverable
                  size="small"
                  style={{ height: "100%" }}
                  bodyStyle={{ padding: "12px" }}
                  actions={[
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                      size="small"
                    >
                      <span
                        style={{
                          display: window.innerWidth > 768 ? "inline" : "none",
                        }}
                      >
                        View
                      </span>
                    </Button>,
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => startUpload(doc)}
                      size="small"
                    >
                      <span
                        style={{
                          display: window.innerWidth > 768 ? "inline" : "none",
                        }}
                      >
                        Replace
                      </span>
                    </Button>,
                  ]}
                >
                  <Card.Meta
                    avatar={
                      <div
                        style={{
                          padding: "6px",
                          backgroundColor: "#f5f5f5",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "32px",
                          height: "32px",
                        }}
                      >
                        <FileTextOutlined
                          style={{ fontSize: "16px", color: "#666" }}
                        />
                      </div>
                    }
                    title={
                      <div
                        style={{
                          fontSize: "clamp(12px, 2.5vw, 14px)",
                          fontWeight: 600,
                        }}
                      >
                        {doc.documentName}
                      </div>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: "100%" }}
                      >
                        <Text
                          type="secondary"
                          style={{ fontSize: "clamp(10px, 2vw, 11px)" }}
                          ellipsis
                        >
                          {doc.fileName}
                        </Text>
                        {doc.workOrderTitle && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "clamp(9px, 1.8vw, 10px)",
                              fontStyle: "italic",
                            }}
                            ellipsis
                          >
                            Work Order: {doc.workOrderTitle}
                          </Text>
                        )}
                        <Space size={4} wrap>
                          <CalendarOutlined style={{ fontSize: "10px" }} />
                          <Text style={{ fontSize: "clamp(9px, 1.8vw, 10px)" }}>
                            {formatDate(doc.uploadedAt)}
                          </Text>
                        </Space>
                        {doc.expiryDate && (
                          <Space size={4} wrap>
                            <CalendarOutlined style={{ fontSize: "10px" }} />
                            <Text
                              style={{ fontSize: "clamp(9px, 1.8vw, 10px)" }}
                            >
                              Exp: {formatDate(doc.expiryDate)}
                            </Text>
                          </Space>
                        )}
                        <div style={{ marginTop: "4px" }}>
                          {getExpiryTag(doc.expiryDate)}
                        </div>
                        {!doc.expiryDate && (
                          <Button
                            type="link"
                            size="small"
                            icon={<CalendarOutlined />}
                            onClick={() => openExpiryModal(doc)}
                            style={{
                              padding: "2px 0",
                              height: "auto",
                              fontSize: "clamp(9px, 1.8vw, 10px)",
                            }}
                          >
                            Set Expiry Date
                          </Button>
                        )}
                      </Space>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card>
            <Empty
              image={
                <FileTextOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />
              }
              imageStyle={{ height: 60 }}
              description={
                <div>
                  <Title
                    level={4}
                    type="secondary"
                    style={{ fontSize: "clamp(16px, 3vw, 20px)" }}
                  >
                    No documents uploaded
                  </Title>
                  <Text
                    type="secondary"
                    style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}
                  >
                    Start by uploading your first document
                  </Text>
                </div>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => startUpload()}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Upload Document
              </Button>
            </Empty>
          </Card>
        )}

        {/* Upload Modal */}
        <Modal
          title={
            isReplaceMode
              ? `Replace ${documentToReplace?.documentName}`
              : "Upload Document"
          }
          open={isUploadModalVisible}
          onCancel={resetUploadForm}
          footer={null}
          width="90%"
          style={{ maxWidth: "600px" }}
          bodyStyle={{ padding: "16px" }}
        >
          <Steps
            current={currentStep}
            items={steps}
            style={{ marginBottom: "24px" }}
            size="small"
          />

          {/* Step 1: Document Selection */}
          {currentStep === 0 && (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              {isReplaceMode && (
                <Alert
                  message={`Replacing: ${documentToReplace?.documentName}`}
                  description="You are replacing an existing document. The old file will be permanently deleted."
                  type="info"
                  showIcon
                  style={{ marginBottom: "16px" }}
                />
              )}

              <div>
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Document Type *
                </Text>
                <Input
                  placeholder="Enter document type (e.g., Aadhar Card, PAN Card, etc.)"
                  value={newDocument.documentName}
                  onChange={(e) =>
                    setNewDocument((prev) => ({
                      ...prev,
                      documentName: e.target.value,
                    }))
                  }
                  style={{ width: "100%", marginBottom: "16px" }}
                  size="large"
                  disabled={isReplaceMode}
                />
              </div>

              <div>
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Choose File *
                </Text>
                <Dragger {...uploadProps} style={{ marginBottom: "8px" }}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p
                    className="ant-upload-text"
                    style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}
                  >
                    {newDocument.file
                      ? newDocument.file.name
                      : "Click or drag file to this area to upload"}
                  </p>
                  <p
                    className="ant-upload-hint"
                    style={{ fontSize: "clamp(10px, 2vw, 12px)" }}
                  >
                    Support for PDF, DOC, DOCX, JPG, PNG files. Maximum file
                    size 10MB.
                  </p>
                </Dragger>
              </div>

              <Row justify="end" gutter={8}>
                <Col>
                  <Button onClick={resetUploadForm}>Cancel</Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    disabled={!newDocument.file || !newDocument.documentName}
                    style={{
                      backgroundColor: "#da2c46",
                      borderColor: "#da2c46",
                    }}
                  >
                    Next
                  </Button>
                </Col>
              </Row>
            </Space>
          )}

          {/* Step 2: Expiry Date */}
          {currentStep === 1 && (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <ExclamationCircleOutlined
                  style={{
                    fontSize: "48px",
                    color: "#faad14",
                    marginBottom: "16px",
                  }}
                />
                <Title level={4} style={{ fontSize: "clamp(16px, 3vw, 20px)" }}>
                  Document Expiry
                </Title>
                <Paragraph style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}>
                  Does this document have an expiry date?
                </Paragraph>
              </div>

              {newDocument.hasExpiry === null && (
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <Button
                      block
                      size="large"
                      onClick={() => handleExpirySelection(true)}
                      style={{
                        height: "50px",
                        borderColor: "#da2c46",
                        color: "#da2c46",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                      }}
                    >
                      Yes, it expires
                    </Button>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Button
                      block
                      size="large"
                      onClick={() => handleExpirySelection(false)}
                      style={{
                        height: "50px",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                      }}
                    >
                      No expiry date
                    </Button>
                  </Col>
                </Row>
              )}

              {newDocument.hasExpiry === true && (
                <div>
                  <Text
                    strong
                    style={{ marginBottom: "8px", display: "block" }}
                  >
                    Expiry Date *
                  </Text>
                  <DatePicker
                    placeholder="Select expiry date"
                    value={newDocument.expiryDate}
                    onChange={(date) =>
                      setNewDocument((prev) => ({ ...prev, expiryDate: date }))
                    }
                    disabledDate={(current) =>
                      current && current < dayjs().endOf("day")
                    }
                    style={{ width: "100%", marginBottom: "16px" }}
                    size="large"
                  />
                </div>
              )}

              <Row justify="space-between">
                <Col>
                  <Button onClick={handlePrevStep}>Back</Button>
                </Col>
                <Col>
                  <Space>
                    {newDocument.hasExpiry === true && (
                      <Button onClick={() => handleExpirySelection(null)}>
                        Change
                      </Button>
                    )}
                    <Button
                      type="primary"
                      onClick={handleNextStep}
                      disabled={
                        newDocument.hasExpiry === true &&
                        !newDocument.expiryDate
                      }
                      style={{
                        backgroundColor: "#da2c46",
                        borderColor: "#da2c46",
                      }}
                    >
                      Next
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Space>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 2 && (
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div style={{ textAlign: "center" }}>
                <CheckCircleOutlined
                  style={{
                    fontSize: "48px",
                    color: "#52c41a",
                    marginBottom: "16px",
                  }}
                />
                <Title level={4} style={{ fontSize: "clamp(16px, 3vw, 20px)" }}>
                  {isReplaceMode ? "Confirm Replacement" : "Confirm Upload"}
                </Title>
                <Paragraph style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}>
                  Please review your document details
                </Paragraph>
              </div>

              <Card>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Row justify="space-between">
                    <Text strong>Document Type:</Text>
                    <Text>{newDocument.documentName}</Text>
                  </Row>
                  <Row justify="space-between">
                    <Text strong>File Name:</Text>
                    <Text ellipsis style={{ maxWidth: "200px" }}>
                      {newDocument.file?.name}
                    </Text>
                  </Row>
                  <Row justify="space-between">
                    <Text strong>Expiry Date:</Text>
                    <Text>
                      {newDocument.hasExpiry && newDocument.expiryDate
                        ? newDocument.expiryDate.format("DD MMM YYYY")
                        : "No expiry"}
                    </Text>
                  </Row>
                  {isReplaceMode && (
                    <Row justify="space-between">
                      <Text strong>Action:</Text>
                      <Text type="warning">Replace existing document</Text>
                    </Row>
                  )}
                </Space>
              </Card>

              {existingDoc && !isReplaceMode && (
                <Alert
                  message="Document Replacement"
                  description="A document with this type already exists and will be replaced."
                  type="warning"
                  showIcon
                />
              )}

              <Row justify="space-between">
                <Col>
                  <Button onClick={handlePrevStep}>Back</Button>
                </Col>
                <Col>
                  <Button
                    type="primary"
                    onClick={confirmUpload}
                    loading={isUploading || isReplacing} // Add isReplacing here
                    style={{
                      backgroundColor: "#da2c46",
                      borderColor: "#da2c46",
                    }}
                  >
                    {isReplaceMode ? "Replace Document" : "Upload Document"}
                  </Button>
                </Col>
              </Row>
            </Space>
          )}
        </Modal>

        {/* Set Expiry Modal */}
        <Modal
          title={`Set Expiry Date - ${documentForExpiry?.documentName}`}
          open={isExpiryModalVisible}
          onCancel={resetExpiryForm}
          footer={null}
          width="90%"
          style={{ maxWidth: "500px" }}
          bodyStyle={{ padding: "24px" }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <CalendarOutlined
                style={{
                  fontSize: "48px",
                  color: "#1890ff",
                  marginBottom: "16px",
                }}
              />
              <Title level={4} style={{ fontSize: "clamp(16px, 3vw, 20px)" }}>
                Document Expiry Information
              </Title>
              <Paragraph style={{ fontSize: "clamp(12px, 2.5vw, 14px)" }}>
                Does "{documentForExpiry?.documentName}" have an expiry date?
              </Paragraph>
            </div>

            {expiryForm.hasExpiry === null && (
              <Row gutter={[12, 12]}>
                <Col xs={24} sm={12}>
                  <Button
                    block
                    size="large"
                    onClick={() => handleExpiryFormSelection(true)}
                    style={{
                      height: "60px",
                      borderColor: "#da2c46",
                      color: "#da2c46",
                      fontSize: "clamp(12px, 2.5vw, 14px)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CalendarOutlined
                      style={{ fontSize: "20px", marginBottom: "4px" }}
                    />
                    Yes, it expires
                  </Button>
                </Col>
                <Col xs={24} sm={12}>
                  <Button
                    block
                    size="large"
                    onClick={() => handleExpiryFormSelection(false)}
                    style={{
                      height: "60px",
                      fontSize: "clamp(12px, 2.5vw, 14px)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ fontSize: "20px", marginBottom: "4px" }}
                    />
                    No expiry date
                  </Button>
                </Col>
              </Row>
            )}

            {expiryForm.hasExpiry === true && (
              <div>
                <Alert
                  message="Set Expiry Date"
                  description="Please select when this document expires. You'll receive notifications before it expires."
                  type="info"
                  showIcon
                  style={{ marginBottom: "16px" }}
                />
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Expiry Date *
                </Text>
                <DatePicker
                  placeholder="Select expiry date"
                  value={expiryForm.expiryDate}
                  onChange={(date) =>
                    setExpiryForm((prev) => ({ ...prev, expiryDate: date }))
                  }
                  disabledDate={(current) =>
                    current && current < dayjs().endOf("day")
                  }
                  style={{ width: "100%", marginBottom: "16px" }}
                  size="large"
                />
              </div>
            )}

            {expiryForm.hasExpiry === false && (
              <Alert
                message="No Expiry Date"
                description="This document will be marked as having no expiry date. You can change this later if needed."
                type="success"
                showIcon
              />
            )}

            <Row justify="space-between">
              <Col>
                <Button onClick={resetExpiryForm}>Cancel</Button>
              </Col>
              <Col>
                <Space>
                  {expiryForm.hasExpiry !== null && (
                    <Button onClick={() => handleExpiryFormSelection(null)}>
                      Change
                    </Button>
                  )}
                  <Button
                    type="primary"
                    onClick={handleExpiryFormSubmit}
                    loading={isSettingAlert}
                    disabled={
                      expiryForm.hasExpiry === null ||
                      (expiryForm.hasExpiry === true && !expiryForm.expiryDate)
                    }
                    style={{
                      backgroundColor: "#da2c46",
                      borderColor: "#da2c46",
                    }}
                  >
                    {expiryForm.hasExpiry === true
                      ? "Set Expiry Date"
                      : "Confirm No Expiry"}
                  </Button>
                </Space>
              </Col>
            </Row>
          </Space>
        </Modal>
      </div>
    </div>
  );
};

export default EmployeeDocuments;
