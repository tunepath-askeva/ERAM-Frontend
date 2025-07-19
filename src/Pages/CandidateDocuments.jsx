import React, { useState } from "react";
import {
  Card,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Badge,
  Tooltip,
  Modal,
  Divider,
  Timeline,
  Avatar,
  Collapse,
  Progress,
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileZipOutlined,
  FileUnknownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CaretRightOutlined,
} from "@ant-design/icons";
import { useGetCandidateDocumentsQuery } from "../Slices/Users/UserApis";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const CandidateDocuments = () => {
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    document: null,
  });
  const [filters, setFilters] = useState({
    search: "",
    stage: "all",
    documentType: "all",
    workOrder: "all",
  });
  const [expandedWorkOrders, setExpandedWorkOrders] = useState([]);

  const { data, isLoading, error } = useGetCandidateDocumentsQuery();

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return (
          <FilePdfOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />
        );
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return (
          <FileImageOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
        );
      case "doc":
      case "docx":
        return (
          <FileWordOutlined style={{ color: "#1890ff", fontSize: "24px" }} />
        );
      case "xls":
      case "xlsx":
        return (
          <FileExcelOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
        );
      case "zip":
      case "rar":
        return (
          <FileZipOutlined style={{ color: "#faad14", fontSize: "24px" }} />
        );
      default:
        return (
          <FileUnknownOutlined style={{ color: "#d9d9d9", fontSize: "24px" }} />
        );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "pending":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      case "rejected":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <ClockCircleOutlined style={{ color: "#d9d9d9" }} />;
    }
  };

  const transformApiData = (apiData) => {
    if (!apiData?.data) return [];

    return apiData.data.map((workOrder) => {
      const stages = {};
      
      workOrder.uploadedDocuments?.forEach((doc) => {
        if (!stages[doc.stageName]) {
          stages[doc.stageName] = {
            name: doc.stageName,
            status: doc.stageStatus,
            completedAt: doc.stageCompletedAt,
            documents: [],
          };
        }
        stages[doc.stageName].documents.push({
          id: doc._id,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          uploadedAt: doc.uploadedAt,
          documentType: doc.documentName,
          status: doc.stageStatus,
          workOrderId: workOrder._id,
          workOrderTitle: workOrder.workOrderTitle,
        });
      });

      return {
        workOrderId: workOrder._id,
        workOrderTitle: workOrder.workOrderTitle,
        stages: Object.values(stages),
        totalDocuments: workOrder.uploadedDocuments?.length || 0,
      };
    });
  };

  const workOrdersData = transformApiData(data);

  const documentTypes = workOrdersData?.length
    ? [
        ...new Set(
          workOrdersData.flatMap((workOrder) =>
            workOrder.stages.flatMap(
              (stage) => stage.documents?.map((doc) => doc.documentType) || []
            )
          )
        ),
      ]
    : [];

  const filteredWorkOrders = workOrdersData.filter((workOrder) => {
    const matchesWorkOrder = 
      filters.workOrder === "all" || 
      workOrder.workOrderId === filters.workOrder;

    const hasMatchingStages = workOrder.stages.some((stage) => {
      const matchesSearch =
        filters.search === "" ||
        stage.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        stage.documents.some(
          (doc) =>
            doc.fileName.toLowerCase().includes(filters.search.toLowerCase()) ||
            doc.documentType.toLowerCase().includes(filters.search.toLowerCase())
        );

      const matchesStage =
        filters.stage === "all" || stage.name === filters.stage;
      const matchesDocType =
        filters.documentType === "all" ||
        stage.documents.some((doc) => doc.documentType === filters.documentType);

      return matchesSearch && matchesStage && matchesDocType;
    });

    return matchesWorkOrder && hasMatchingStages;
  });

  const handleWorkOrderExpand = (workOrderId, expanded) => {
    if (expanded) {
      setExpandedWorkOrders([...expandedWorkOrders, workOrderId]);
    } else {
      setExpandedWorkOrders(expandedWorkOrders.filter(id => id !== workOrderId));
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text>Loading documents...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text type="danger">Error loading documents. Please try again.</Text>
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text type="secondary">No documents found.</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "12px" }}>
      <style jsx>{`
        .stage-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }
        .document-card {
          transition: all 0.3s;
          border-radius: 8px;
        }
        .document-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
        .ant-collapse > .ant-collapse-item > .ant-collapse-header {
          align-items: center !important;
        }
        .work-order-collapse .ant-collapse-header {
          background-color: #f0f2f5;
          border-radius: 8px !important;
          padding: 12px 16px !important;
        }
        .work-order-collapse .ant-collapse-content {
          background-color: transparent;
        }
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <Row gutter={[8, 16]} style={{ marginBottom: "16px" }}>
        <Col span={24}>
          <Card size="small">
            <Row align="middle" justify="space-between">
              <Col xs={24} sm={16} md={18}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <Space>
                    <Avatar
                      icon={<FolderOpenOutlined />}
                      style={{ backgroundColor: "#da2c46" }}
                      size="large"
                    />
                    <div>
                      <Title
                        level={3}
                        style={{
                          margin: 0,
                          color: "#da2c46",
                          fontSize: "18px",
                        }}
                      >
                        My Document Stages
                      </Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Track all your uploaded documents grouped by work orders and stages
                      </Text>
                    </div>
                  </Space>
                </Space>
              </Col>
              <Col
                xs={24}
                sm={8}
                md={6}
                style={{ textAlign: "center", marginTop: "8px" }}
              >
                <Badge
                  count={workOrdersData.reduce((total, wo) => total + wo.totalDocuments, 0)}
                  style={{ backgroundColor: "#da2c46" }}
                  showZero
                >
                  <Button
                    icon={<FileTextOutlined />}
                    size="middle"
                    style={{ borderColor: "#da2c46", color: "#da2c46" }}
                  >
                    <span className="desktop-only">Total </span>Documents
                  </Button>
                </Badge>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={[8, 8]} style={{ marginBottom: "16px" }}>
        <Col span={24}>
          <Card size="small">
            <Row gutter={[8, 8]} align="middle">
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Search documents..."
                  prefix={<SearchOutlined style={{ color: "#da2c46" }} />}
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  size="middle"
                />
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Filter by Work Order"
                  style={{ width: "100%" }}
                  value={filters.workOrder}
                  onChange={(value) => setFilters({ ...filters, workOrder: value })}
                  size="middle"
                >
                  <Option value="all">All Work Orders</Option>
                  {workOrdersData.map((workOrder) => (
                    <Option key={workOrder.workOrderId} value={workOrder.workOrderId}>
                      {workOrder.workOrderTitle}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Filter by Stage"
                  style={{ width: "100%" }}
                  value={filters.stage}
                  onChange={(value) => setFilters({ ...filters, stage: value })}
                  size="middle"
                >
                  <Option value="all">All Stages</Option>
                  {workOrdersData.flatMap((workOrder) =>
                    workOrder.stages.map((stage) => (
                      <Option key={`${workOrder.workOrderId}-${stage.name}`} value={stage.name}>
                        {stage.name}
                      </Option>
                    ))
                  )}
                </Select>
              </Col>
              <Col xs={12} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Filter by Document Type"
                  style={{ width: "100%" }}
                  value={filters.documentType}
                  onChange={(value) =>
                    setFilters({ ...filters, documentType: value })
                  }
                  size="middle"
                >
                  <Option value="all">All Document Types</Option>
                  {documentTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Work Orders Collapse */}
      <Collapse
        accordion
        className="work-order-collapse"
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        onChange={(keys) => {
          // Handle accordion behavior while maintaining expanded state tracking
          const lastKey = keys[keys.length - 1];
          if (lastKey) {
            handleWorkOrderExpand(lastKey, true);
          } else {
            // When panel is closed, keys is empty
            // We don't have a way to know which panel was closed in accordion mode
            // So we'll just rely on the expand/collapse handlers
          }
        }}
      >
        {filteredWorkOrders.map((workOrder) => (
          <Panel
            key={workOrder.workOrderId}
            header={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <Text strong>{workOrder.workOrderTitle}</Text>
                <Badge
                  count={workOrder.totalDocuments}
                  style={{ backgroundColor: "#da2c46" }}
                />
              </div>
            }
            extra={
              <Tag color={
                workOrder.stages.every(s => s.status === "approved") ? "green" :
                workOrder.stages.some(s => s.status === "rejected") ? "red" : "orange"
              }>
                {workOrder.stages.every(s => s.status === "approved") ? "Completed" :
                 workOrder.stages.some(s => s.status === "rejected") ? "Rejected" : "In Progress"}
              </Tag>
            }
            onExpand={(expanded) => handleWorkOrderExpand(workOrder.workOrderId, expanded)}
          >
            {/* Stages Timeline */}
            <Row gutter={[8, 8]} style={{ marginBottom: "16px" }}>
              <Col span={24}>
                <Card size="small" title={<Text strong>Stages Progress</Text>}>
                  <Timeline mode="alternate">
                    {workOrder.stages.map((stage, index) => (
                      <Timeline.Item
                        key={index}
                        dot={getStatusIcon(stage.status)}
                        color={
                          stage.status === "approved"
                            ? "green"
                            : stage.status === "rejected"
                            ? "red"
                            : "orange"
                        }
                      >
                        <Card size="small" style={{ width: "100%" }}>
                          <Space direction="vertical" style={{ width: "100%" }}>
                            <Text strong>{stage.name}</Text>
                            <Text type="secondary">
                              {stage.status === "approved"
                                ? "Completed"
                                : stage.status === "rejected"
                                ? "Rejected"
                                : "In Progress"}
                            </Text>
                            {stage.completedAt && (
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                <CalendarOutlined />{" "}
                                {new Date(stage.completedAt).toLocaleDateString()}
                              </Text>
                            )}
                            <Progress
                              percent={
                                stage.status === "approved"
                                  ? 100
                                  : stage.status === "rejected"
                                  ? 100
                                  : 50
                              }
                              status={
                                stage.status === "approved"
                                  ? "success"
                                  : stage.status === "rejected"
                                  ? "exception"
                                  : "active"
                              }
                              size="small"
                            />
                          </Space>
                        </Card>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Card>
              </Col>
            </Row>

            {/* Documents by Stage */}
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Card size="small" title={<Text strong>Documents by Stage</Text>}>
                  <Collapse accordion>
                    {workOrder.stages.map((stage) => (
                      <Panel
                        key={stage.name}
                        header={
                          <div className="stage-header">
                            <Space>
                              <Text strong>{stage.name}</Text>
                              <Tag
                                color={
                                  stage.status === "approved"
                                    ? "green"
                                    : stage.status === "rejected"
                                    ? "red"
                                    : "orange"
                                }
                              >
                                {stage.status}
                              </Tag>
                            </Space>
                            <Badge
                              count={stage.documents.length}
                              style={{ backgroundColor: "#da2c46" }}
                            />
                          </div>
                        }
                        extra={
                          <Text type="secondary">
                            {stage.completedAt
                              ? new Date(stage.completedAt).toLocaleDateString()
                              : "In progress"}
                          </Text>
                        }
                      >
                        <Row gutter={[16, 16]}>
                          {stage.documents.map((doc) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={doc.id}>
                              <Card
                                className="document-card"
                                hoverable
                                actions={[
                                  <Tooltip title="Preview">
                                    <EyeOutlined
                                      key="preview"
                                      onClick={() =>
                                        setPreviewModal({
                                          visible: true,
                                          document: doc,
                                        })
                                      }
                                      style={{ color: "#da2c46" }}
                                    />
                                  </Tooltip>,
                                  <Tooltip title="Download">
                                    <DownloadOutlined
                                      key="download"
                                      onClick={() =>
                                        window.open(doc.fileUrl, "_blank")
                                      }
                                      style={{ color: "#da2c46" }}
                                    />
                                  </Tooltip>,
                                ]}
                              >
                                <Card.Meta
                                  avatar={getFileIcon(doc.fileName)}
                                  title={
                                    <Text ellipsis={{ tooltip: doc.fileName }}>
                                      {doc.fileName}
                                    </Text>
                                  }
                                  description={
                                    <Space direction="vertical" size={0}>
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {doc.documentType}
                                      </Text>
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        <CalendarOutlined />{" "}
                                        {new Date(
                                          doc.uploadedAt
                                        ).toLocaleDateString()}
                                      </Text>
                                      <Tag
                                        color={
                                          doc.status === "approved"
                                            ? "green"
                                            : doc.status === "rejected"
                                            ? "red"
                                            : "orange"
                                        }
                                        style={{ marginTop: "8px" }}
                                      >
                                        {doc.status}
                                      </Tag>
                                    </Space>
                                  }
                                />
                              </Card>
                            </Col>
                          ))}
                        </Row>
                      </Panel>
                    ))}
                  </Collapse>
                </Card>
              </Col>
            </Row>
          </Panel>
        ))}
      </Collapse>

      {/* Preview Modal */}
      <Modal
        title={
          <Text style={{ fontSize: "16px" }}>
            Preview: {previewModal.document?.fileName}
          </Text>
        }
        open={previewModal.visible}
        onCancel={() => setPreviewModal({ visible: false, document: null })}
        footer={[
          <Button
            key="download"
            type="primary"
            style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
            icon={<DownloadOutlined />}
            size="middle"
            onClick={() =>
              window.open(previewModal.document?.fileUrl, "_blank")
            }
          >
            Download
          </Button>,
        ]}
        width={Math.min(800, window.innerWidth - 32)}
        centered
      >
        {previewModal.document && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>
              {getFileIcon(previewModal.document.fileName)}
            </div>
            <Title level={4} style={{ fontSize: "18px" }}>
              {previewModal.document.fileName}
            </Title>
            <Space direction="vertical" size="small">
              <Text style={{ fontSize: "13px" }}>
                Work Order: {previewModal.document.workOrderTitle}
              </Text>
              <Text style={{ fontSize: "13px" }}>
                Document Type: {previewModal.document.documentType}
              </Text>
              <Text style={{ fontSize: "13px" }}>
                Upload Date:{" "}
                {new Date(
                  previewModal.document.uploadedAt
                ).toLocaleDateString()}
              </Text>
              <Tag
                color={
                  previewModal.document.status === "approved"
                    ? "green"
                    : previewModal.document.status === "rejected"
                    ? "red"
                    : "orange"
                }
              >
                {previewModal.document.status}
              </Tag>
            </Space>
            <Divider />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Click download to view the actual document
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CandidateDocuments;