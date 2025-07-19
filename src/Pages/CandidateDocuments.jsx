import React, { useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  DatePicker,
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
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  CalendarOutlined,
  UserOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useGetCandidateDocumentsQuery } from "../Slices/Users/UserApis";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const CandidateDocuments = () => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    document: null,
  });
  const [filters, setFilters] = useState({
    search: "",
    workOrder: "all",
    stage: "all",
    dateRange: null,
  });

  const { data } = useGetCandidateDocumentsQuery();

  // Mock data for demonstration
  const documentsData = [
    {
      id: 1,
      workOrderId: "WO-2024-001",
      workOrderTitle: "Software Developer Position - TechCorp",
      stage: "Application",
      documentName: "Resume_JohnDoe.pdf",
      documentType: "Resume",
      uploadDate: "2024-01-15",
      fileSize: "245 KB",
      status: "Approved",
      downloadUrl: "#",
    },
    {
      id: 2,
      workOrderId: "WO-2024-001",
      workOrderTitle: "Software Developer Position - TechCorp",
      stage: "Application",
      documentName: "CoverLetter_JohnDoe.pdf",
      documentType: "Cover Letter",
      uploadDate: "2024-01-15",
      fileSize: "189 KB",
      status: "Approved",
      downloadUrl: "#",
    },
    {
      id: 3,
      workOrderId: "WO-2024-001",
      workOrderTitle: "Software Developer Position - TechCorp",
      stage: "Interview",
      documentName: "Portfolio_Screenshots.zip",
      documentType: "Portfolio",
      uploadDate: "2024-01-20",
      fileSize: "2.3 MB",
      status: "Under Review",
      downloadUrl: "#",
    },
    {
      id: 4,
      workOrderId: "WO-2024-002",
      workOrderTitle: "Data Analyst Role - DataTech Solutions",
      stage: "Application",
      documentName: "Updated_Resume_2024.pdf",
      documentType: "Resume",
      uploadDate: "2024-02-01",
      fileSize: "267 KB",
      status: "Approved",
      downloadUrl: "#",
    },
    {
      id: 5,
      workOrderId: "WO-2024-002",
      workOrderTitle: "Data Analyst Role - DataTech Solutions",
      stage: "Technical Test",
      documentName: "SQL_Assessment_Results.pdf",
      documentType: "Test Results",
      uploadDate: "2024-02-05",
      fileSize: "445 KB",
      status: "Approved",
      downloadUrl: "#",
    },
    {
      id: 6,
      workOrderId: "WO-2024-003",
      workOrderTitle: "Frontend Developer - StartupXYZ",
      stage: "Application",
      documentName: "GitHub_Portfolio_Link.txt",
      documentType: "Portfolio Link",
      uploadDate: "2024-02-10",
      fileSize: "1 KB",
      status: "Pending",
      downloadUrl: "#",
    },
  ];

  const workOrders = [...new Set(documentsData.map((doc) => doc.workOrderId))];
  const stages = [...new Set(documentsData.map((doc) => doc.stage))];

  const getStatusColor = (status) => {
    const colors = {
      Approved: "success",
      "Under Review": "processing",
      Pending: "warning",
      Rejected: "error",
    };
    return colors[status] || "default";
  };

  const getDocumentTypeIcon = (type) => {
    const icons = {
      Resume: "📄",
      "Cover Letter": "📝",
      Portfolio: "💼",
      "Test Results": "📊",
      "Portfolio Link": "🔗",
      Certificate: "🏆",
    };
    return icons[type] || "📄";
  };

  const filteredData = documentsData.filter((doc) => {
    const matchesSearch =
      doc.documentName.toLowerCase().includes(filters.search.toLowerCase()) ||
      doc.workOrderTitle.toLowerCase().includes(filters.search.toLowerCase());
    const matchesWorkOrder =
      filters.workOrder === "all" || doc.workOrderId === filters.workOrder;
    const matchesStage = filters.stage === "all" || doc.stage === filters.stage;

    return matchesSearch && matchesWorkOrder && matchesStage;
  });

  const groupedData = filteredData.reduce((acc, doc) => {
    if (!acc[doc.workOrderId]) {
      acc[doc.workOrderId] = {
        workOrderId: doc.workOrderId,
        workOrderTitle: doc.workOrderTitle,
        documents: [],
      };
    }
    acc[doc.workOrderId].documents.push(doc);
    return acc;
  }, {});

  const columns = [
    {
      title: "Document",
      dataIndex: "documentName",
      key: "documentName",
      width: "35%",
      render: (text, record) => (
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <Space>
            <span style={{ fontSize: "16px" }}>
              {getDocumentTypeIcon(record.documentType)}
            </span>
            <Text strong style={{ fontSize: "14px" }}>
              {text}
            </Text>
          </Space>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.documentType} • {record.fileSize}
          </Text>
          {/* Show stage and date on mobile */}
          <div className="mobile-only" style={{ display: "none" }}>
            <Space wrap>
              <Tag color="#da2c46" size="small">
                {record.stage}
              </Tag>
              <Text type="secondary" style={{ fontSize: "11px" }}>
                <CalendarOutlined /> {record.uploadDate}
              </Text>
            </Space>
          </div>
        </Space>
      ),
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      width: "15%",
      className: "desktop-only",
      render: (stage) => (
        <Tag color="#da2c46" style={{ borderRadius: "4px" }}>
          {stage}
        </Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "uploadDate",
      key: "uploadDate",
      width: "20%",
      className: "desktop-only",
      render: (date) => (
        <Space>
          <CalendarOutlined style={{ color: "#da2c46" }} />
          <Text style={{ fontSize: "13px" }}>{date}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => (
        <Badge
          status={getStatusColor(status)}
          text={status}
          style={{ fontSize: "12px" }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Preview">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() =>
                setPreviewModal({ visible: true, document: record })
              }
              style={{ color: "#da2c46" }}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => window.open(record.downloadUrl)}
              style={{ color: "#da2c46" }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const workOrderTimeline = selectedWorkOrder
    ? groupedData[selectedWorkOrder]?.documents.map((doc) => ({
        children: (
          <div>
            <Text strong>{doc.stage}</Text>
            <br />
            <Text>{doc.documentName}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {doc.uploadDate}
            </Text>
          </div>
        ),
        color: "#da2c46",
      }))
    : [];

  return (
    <div style={{ padding: "12px" }}>
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
          .ant-table-thead > tr > th {
            padding: 8px 4px !important;
            font-size: 12px !important;
          }
          .ant-table-tbody > tr > td {
            padding: 8px 4px !important;
          }
          .ant-card-body {
            padding: 12px !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .ant-table-scroll {
            overflow-x: auto;
          }
          .ant-card {
            margin-bottom: 8px;
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
                        My Document History
                      </Title>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Track all your uploaded documents across work orders
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
                  count={documentsData.length}
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
                  placeholder="Search..."
                  prefix={<SearchOutlined style={{ color: "#da2c46" }} />}
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  size="middle"
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Work Order"
                  style={{ width: "100%" }}
                  value={filters.workOrder}
                  onChange={(value) =>
                    setFilters({ ...filters, workOrder: value })
                  }
                  size="middle"
                >
                  <Option value="all">All Work Orders</Option>
                  {workOrders.map((wo) => (
                    <Option key={wo} value={wo}>
                      {wo}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={12} md={4} lg={6}>
                <Select
                  placeholder="Stage"
                  style={{ width: "100%" }}
                  value={filters.stage}
                  onChange={(value) => setFilters({ ...filters, stage: value })}
                  size="middle"
                >
                  <Option value="all">All Stages</Option>
                  {stages.map((stage) => (
                    <Option key={stage} value={stage}>
                      {stage}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={12} sm={12} md={4} lg={6} className="desktop-only">
                <RangePicker
                  style={{ width: "100%" }}
                  onChange={(dates) =>
                    setFilters({ ...filters, dateRange: dates })
                  }
                  size="middle"
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Work Orders Overview */}
      <Row gutter={[8, 8]} style={{ marginBottom: "16px" }}>
        {Object.values(groupedData).map((workOrder) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={workOrder.workOrderId}>
            <Card
              hoverable
              size="small"
              onClick={() =>
                setSelectedWorkOrder(
                  selectedWorkOrder === workOrder.workOrderId
                    ? null
                    : workOrder.workOrderId
                )
              }
              style={{
                borderColor:
                  selectedWorkOrder === workOrder.workOrderId
                    ? "#da2c46"
                    : undefined,
                borderWidth:
                  selectedWorkOrder === workOrder.workOrderId ? "2px" : "1px",
                minHeight: "120px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <Title
                  level={5}
                  style={{
                    color: "#da2c46",
                    margin: "0 0 4px 0",
                    fontSize: "14px",
                  }}
                >
                  {workOrder.workOrderId}
                </Title>
                <Text
                  style={{
                    fontSize: "12px",
                    display: "block",
                    marginBottom: "8px",
                  }}
                >
                  {workOrder.workOrderTitle.length > 40
                    ? `${workOrder.workOrderTitle.substring(0, 40)}...`
                    : workOrder.workOrderTitle}
                </Text>
                <Space>
                  <Badge
                    count={workOrder.documents.length}
                    style={{ backgroundColor: "#da2c46" }}
                    showZero
                  />
                  <Text style={{ fontSize: "11px" }}>docs</Text>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Timeline View for Selected Work Order */}
      {selectedWorkOrder && (
        <Row gutter={[8, 8]} style={{ marginBottom: "16px" }}>
          <Col span={24}>
            <Card
              title={
                <Text style={{ fontSize: "14px" }}>
                  Timeline - {selectedWorkOrder}
                </Text>
              }
              size="small"
            >
              <Timeline items={workOrderTimeline} size="small" />
            </Card>
          </Col>
        </Row>
      )}

      {/* Documents Table */}
      <Row gutter={[8, 8]}>
        <Col span={24}>
          <Card
            title={<Text style={{ fontSize: "16px" }}>Documents List</Text>}
            size="small"
            extra={
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  size="small"
                  style={{ borderColor: "#da2c46", color: "#da2c46" }}
                  className="desktop-only"
                >
                  Export
                </Button>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              size="small"
              scroll={{ x: 600 }}
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                showQuickJumper: false,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total}`,
                responsive: true,
                simple: window.innerWidth < 768,
              }}
              expandable={{
                expandedRowRender: (record) => (
                  <div style={{ padding: "8px", backgroundColor: "#fafafa" }}>
                    <Row gutter={[8, 8]}>
                      <Col xs={24} sm={12}>
                        <Text strong style={{ fontSize: "12px" }}>
                          Work Order:{" "}
                        </Text>
                        <Text style={{ fontSize: "12px" }}>
                          {record.workOrderTitle}
                        </Text>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Text strong style={{ fontSize: "12px" }}>
                          Stage:{" "}
                        </Text>
                        <Tag color="#da2c46" size="small">
                          {record.stage}
                        </Tag>
                      </Col>
                    </Row>
                  </div>
                ),
                rowExpandable: () => true,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Preview Modal */}
      <Modal
        title={
          <Text style={{ fontSize: "16px" }}>
            Preview: {previewModal.document?.documentName}
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
              {getDocumentTypeIcon(previewModal.document.documentType)}
            </div>
            <Title level={4} style={{ fontSize: "18px" }}>
              {previewModal.document.documentName}
            </Title>
            <Space direction="vertical" size="small">
              <Text style={{ fontSize: "13px" }}>
                Document Type: {previewModal.document.documentType}
              </Text>
              <Text style={{ fontSize: "13px" }}>
                File Size: {previewModal.document.fileSize}
              </Text>
              <Text style={{ fontSize: "13px" }}>
                Upload Date: {previewModal.document.uploadDate}
              </Text>
              <Badge
                status={getStatusColor(previewModal.document.status)}
                text={previewModal.document.status}
              />
            </Space>
            <Divider />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Document preview would be displayed here in a real implementation
            </Text>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CandidateDocuments;
