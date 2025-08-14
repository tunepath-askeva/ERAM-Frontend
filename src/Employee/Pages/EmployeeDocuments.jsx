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
  message,
  Spin,
  Dropdown,
  Divider,
} from "antd";
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
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetEmployeeDocumentsQuery } from "../../Slices/Employee/EmployeeApis";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;
const { Dragger } = Upload;

const EmployeeDocuments = () => {
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetEmployeeDocumentsQuery();

  // Extract documents from the nested API response structure
  const documents = apiResponse?.documents?.length > 0 
    ? apiResponse.documents.flatMap(record => 
        record.documents?.map(doc => ({
          ...doc,
          workOrderId: record.workOrder?._id,
          workOrderTitle: record.workOrder?.title,
          recordId: record._id
        })) || []
      )
    : [];

  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isReplaceMode, setIsReplaceMode] = useState(false);
  const [documentToReplace, setDocumentToReplace] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [newDocument, setNewDocument] = useState({
    file: null,
    documentName: "",
    hasExpiry: null,
    expiryDate: null,
  });

  const documentTypes = [
    "Aadhar Card",
    "PAN Card",
    "Passport",
    "Driving License",
    "Portfolio",
    "Resume",
    "Cover Letter",
    "Educational Certificate",
    "Experience Letter",
    "Other",
  ];

  const formatDate = (dateString) => {
    return dayjs(dateString).format("DD MMM YYYY");
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = dayjs(expiryDate);
    const today = dayjs();
    const diffDays = expiry.diff(today, "day");
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return dayjs(expiryDate).isBefore(dayjs(), "day");
  };

  const getExpiryTag = (expiryDate) => {
    if (!expiryDate) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />}>
          No Expiry
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
      // Here you would integrate with your upload API
      const formData = new FormData();
      formData.append("file", newDocument.file);
      formData.append("documentName", newDocument.documentName);
      if (newDocument.hasExpiry && newDocument.expiryDate) {
        formData.append(
          "expiryDate",
          newDocument.expiryDate.format("YYYY-MM-DD")
        );
      }
      if (isReplaceMode && documentToReplace) {
        formData.append("replaceDocumentId", documentToReplace._id);
      }

      // Replace this with your actual API call
      // await uploadDocumentMutation(formData);

      message.success(
        isReplaceMode
          ? "Document replaced successfully!"
          : "Document uploaded successfully!"
      );
      refetch(); // Refresh the documents list
      resetUploadForm();
    } catch (error) {
      message.error("Failed to upload document. Please try again.");
      console.error("Upload error:", error);
    }
  };

  const deleteDocument = async (id, documentName) => {
    try {
      // Here you would integrate with your delete API
      // await deleteDocumentMutation(id);

      message.success(`${documentName} deleted successfully!`);
      refetch(); // Refresh the documents list
    } catch (error) {
      message.error("Failed to delete document. Please try again.");
      console.error("Delete error:", error);
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

  const getDocumentActions = (doc) => [
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
    {
      key: "delete",
      label: "Delete Document",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => deleteDocument(doc._id, doc.documentName),
    },
  ];

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin size="large" />
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
                    marginTop: "4px"
                  }}
                >
                  {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
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
                    <Dropdown
                      menu={{
                        items: getDocumentActions(doc).map((action) => ({
                          key: action.key,
                          label:
                            action.key === "delete" ? (
                              <Popconfirm
                                title="Delete Document"
                                description="Are you sure you want to delete this document?"
                                onConfirm={action.onClick}
                                okText="Yes"
                                cancelText="No"
                                okButtonProps={{
                                  style: {
                                    backgroundColor: "#da2c46",
                                    borderColor: "#da2c46",
                                  },
                                }}
                              >
                                <span style={{ color: "#ff4d4f" }}>
                                  {action.icon} {action.label}
                                </span>
                              </Popconfirm>
                            ) : (
                              <span onClick={action.onClick}>
                                {action.icon} {action.label}
                              </span>
                            ),
                          danger: action.danger,
                        })),
                      }}
                      trigger={["click"]}
                      placement="bottomRight"
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        size="small"
                      />
                    </Dropdown>,
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
                              fontStyle: "italic"
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
                <Select
                  placeholder="Select document type"
                  value={newDocument.documentName}
                  onChange={(value) =>
                    setNewDocument((prev) => ({ ...prev, documentName: value }))
                  }
                  style={{ width: "100%", marginBottom: "16px" }}
                  size="large"
                  disabled={isReplaceMode}
                >
                  {documentTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
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
      </div>
    </div>
  );
};

export default EmployeeDocuments;