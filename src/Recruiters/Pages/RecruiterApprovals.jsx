import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Badge,
  Button,
  Modal,
  Descriptions,
  Tag,
  Space,
  Tabs,
  message,
  Tooltip,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  Input,
  Select,
  Grid,
  Image,
  List,
  Drawer,
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  FileTextOutlined,
  SendOutlined,
  CommentOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  MenuOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  useGetApprovalInfoQuery,
  useApproveCandidateDocumentsMutation,
} from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const RecruiterApprovals = () => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [approvalComments, setApprovalComments] = useState("");
  const screens = useBreakpoint();

  const {
    data: workOrders = [],
    isLoading: loading,
    error,
    refetch,
  } = useGetApprovalInfoQuery();

  const [approveCandidateDocuments, { isLoading: isApproving }] =
    useApproveCandidateDocumentsMutation();

  const isMobile = screens.xs;
  const isTablet = screens.sm || screens.md;
  const isDesktop = screens.lg || screens.xl;

  const getTableData = () => {
    const tableData = [];

    workOrders.forEach((workOrder) => {
      workOrder.pipelineStageTimeline.forEach((stage) => {
        stage.uploadedDocuments.forEach((candidate) => {
          tableData.push({
            key: `${workOrder._id}-${stage._id}-${candidate.candidateId}`,
            workOrderId: workOrder._id,
            workOrderTitle: workOrder.title,
            jobCode: workOrder.jobCode,
            candidateId: candidate.candidateId,
            candidateName: candidate.candidateName,
            candidateEmail: candidate.candidateEmail,
            stageName: stage.stageName,
            stageOrder: stage.stageOrder,
            recruiterName: stage.recruiterId?.fullName,
            recruiterEmail: stage.recruiterId?.email,
            documentsCount: candidate.documents?.length || 0,
            documents: candidate.documents || [],
            uploadedAt: candidate.documents?.[0]?.uploadedAt,
            stageDetails: stage.stageDetails,
            customFields: stage.customFields,
            requiredDocuments: stage.requiredDocuments,
            status: stage.levelInfo?.levelStatus || "pending",
            workOrder: workOrder,
            stage: stage,
            candidate: candidate,
            levelStatus: stage.levelInfo?.levelStatus,
            levelName: stage.levelInfo?.levelName,
          });
        });
      });
    });

    return tableData;
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImageOutlined style={{ color: "#52c41a" }} />;
      default:
        return <FileOutlined style={{ color: "#1890ff" }} />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_review: "orange",
      approved: "green",
      rejected: "red",
      pending: "orange",
      in_review: "blue",
      completed: "green",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending_review: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending",
      in_review: "In Review",
      completed: "Completed",
    };
    return texts[status] || status;
  };

  const getActionsMenu = (record) => ({
    items: [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "View Details",
        onClick: () => handleViewDetails(record),
      },
    ],
  });

  // Responsive column configuration
  const getColumns = () => {
    const baseColumns = [
      {
        title: "Candidate",
        dataIndex: "candidateName",
        key: "candidateName",
        width: isMobile ? 200 : isTablet ? 220 : 260,
        ellipsis: true,
        render: (text, record) => (
          <div style={{ minWidth: 0 }}>
            <Space size="small" style={{ width: "100%" }}>
              <Avatar
                size={isMobile ? "small" : "default"}
                icon={<UserOutlined />}
                style={{ flexShrink: 0 }}
              />
              <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                <Tooltip title={text}>
                  <div
                    style={{
                      fontWeight: 500,
                      fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
                      lineHeight: "1.3",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    {text}
                  </div>
                </Tooltip>
                <Tooltip title={record.candidateEmail}>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "block",
                      lineHeight: "1.2",
                    }}
                  >
                    {record.candidateEmail}
                  </Text>
                </Tooltip>
              </div>
            </Space>
          </div>
        ),
      },
      {
        title: "Work Order",
        dataIndex: "workOrderTitle",
        key: "workOrderTitle",
        width: isMobile ? 180 : isTablet ? 200 : 240,
        ellipsis: true,
        render: (text, record) => (
          <div style={{ minWidth: 0 }}>
            <Tooltip title={text}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
                  lineHeight: "1.3",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "2px",
                }}
              >
                {text}
              </div>
            </Tooltip>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                lineHeight: "1.2",
              }}
            >
              {record.jobCode}
            </Text>
          </div>
        ),
      },
      {
        title: "Stage & Level",
        dataIndex: "stageName",
        key: "stageName",
        width: isMobile ? 140 : isTablet ? 160 : 200,
        render: (text, record) => {
          const levelName =
            record.workOrder?.pipelineStageTimeline[0]?.levelInfo?.levelName ||
            "N/A";

          return (
            <Space direction="vertical" size={0}>
              <Tooltip title={`Stage: ${text}`}>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                    lineHeight: 1.3,
                    display: "block",
                  }}
                >
                  Stage:{" "}
                  {isMobile
                    ? text.length > 8
                      ? `${text.substring(0, 8)}...`
                      : text
                    : text}
                </Text>
              </Tooltip>
              <Tooltip title={`Level: ${levelName}`}>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                    lineHeight: 1.2,
                    display: "block",
                  }}
                >
                  Level:{" "}
                  {isMobile
                    ? levelName.length > 8
                      ? `${levelName.substring(0, 8)}...`
                      : levelName
                    : levelName}
                </Text>
              </Tooltip>
            </Space>
          );
        },
      },
      {
        title: "Recruiter",
        dataIndex: "recruiterName",
        key: "recruiterName",
        width: isMobile ? 150 : isTablet ? 160 : 200,
        ellipsis: true,
        render: (text, record) => (
          <div style={{ minWidth: 0 }}>
            <Tooltip title={text}>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: isMobile ? "11px" : isTablet ? "12px" : "14px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: "1.3",
                  marginBottom: "2px",
                }}
              >
                {text || "N/A"}
              </div>
            </Tooltip>
            {!isMobile && (
              <Tooltip title={record.recruiterEmail}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isTablet ? "11px" : "12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                    lineHeight: "1.2",
                  }}
                >
                  {record.recruiterEmail || "N/A"}
                </Text>
              </Tooltip>
            )}
          </div>
        ),
      },
      {
        title: "Docs",
        dataIndex: "documentsCount",
        key: "documentsCount",
        width: isMobile ? 80 : isTablet ? 90 : 100,
        align: "center",
        render: (count, record) => (
          <Tooltip title={`${count} document(s) uploaded`}>
            <Space
              size="small"
              direction={isMobile ? "vertical" : "horizontal"}
            >
              <FileTextOutlined
                style={{
                  fontSize: isMobile ? "14px" : isTablet ? "16px" : "16px",
                  color: "#1890ff",
                }}
              />
              <span
                style={{
                  fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
                  fontWeight: 500,
                }}
              >
                {count}
              </span>
            </Space>
          </Tooltip>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: isMobile ? 100 : isTablet ? 120 : 130,
        render: (status, record) => {
          // Use the levelStatus if available, otherwise fall back to the status
          const displayStatus = record.levelStatus || status;
          const statusText = getStatusText(displayStatus);
          const statusColor = getStatusColor(displayStatus);

          return (
            <Space>
              <Badge status={statusColor} />
              <span
                style={{
                  fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                  fontWeight: 500,
                  color: statusColor === "default" ? undefined : statusColor,
                }}
              >
                {isMobile
                  ? statusText.split(" ")[0] // Show just first word on mobile
                  : statusText}
              </span>
            </Space>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: isMobile ? 80 : isTablet ? 140 : 180,
        render: (_, record) => (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {isMobile ? (
              <Dropdown
                menu={getActionsMenu(record)}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  size="small"
                  style={{
                    color: "#da2c46",
                    border: "1px solid #da2c46",
                  }}
                />
              </Dropdown>
            ) : (
              <Space size="small" wrap>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(record)}
                  size={isTablet ? "small" : "default"}
                  style={{
                    backgroundColor: "#da2c46",
                    borderColor: "#da2c46",
                    fontSize: isTablet ? "11px" : "12px",
                  }}
                >
                  {isTablet ? "View" : "View Details"}
                </Button>
              </Space>
            )}
          </div>
        ),
      },
    ];

    return baseColumns;
  };

  const handleViewDetails = (record) => {
    setSelectedWorkOrder(record);
    setSelectedCandidate(record.candidate);
    setDetailsModalVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedWorkOrder(record);
    setSelectedCandidate(record.candidate);
    setApproveModalVisible(true);
  };

  const handleApprovalSubmit = async () => {
    try {
      if (!selectedWorkOrder || !selectedCandidate) return;

      const approvalId = selectedWorkOrder.stage?.approvalId;
      const levelId = selectedWorkOrder.stage?.levelInfo?.levelId;

      if (!approvalId || !levelId) {
        message.error("Missing required approval information");
        return;
      }

      await approveCandidateDocuments({
        workOrderid: selectedWorkOrder.workOrderId, // Changed from workOrders._id
        userId: selectedCandidate.candidateId, // Changed from candidateId
        approvalId,
        levelId,
        status: "approved",
        comments: approvalComments,
      }).unwrap();

      message.success(
        `Documents approved for ${selectedCandidate.candidateName}!`
      );
      setApproveModalVisible(false);
      setApprovalComments("");
      refetch();
    } catch (error) {
      message.error(error.data?.message || "Failed to approve documents");
      console.error("Approval error:", error);
    }
  };

  const handleDownloadDocument = (document) => {
    window.open(document.fileUrl, "_blank");
    message.info(`Opening ${document.fileName}...`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const tableData = getTableData();

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text type="danger">
          Error loading approval data. Please try again.
        </Text>
      </div>
    );
  }

  const getModalWidth = () => {
    if (isMobile) return "95%";
    if (isTablet) return "85%";
    return 1000;
  };

  // Calculate table height based on screen size
  const getTableHeight = () => {
    if (isMobile) return 400;
    if (isTablet) return 500;
    return 600;
  };

  // Calculate scroll width based on column widths
  const getTableScrollConfig = () => {
    const totalWidth = isMobile ? 950 : isTablet ? 1070 : 1170;
    return {
      x: totalWidth,
      y: getTableHeight(),
    };
  };

  return (
    <div>
      {/* Header */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "16px" }}
      >
        <Col span={24}>
          <Title
            level={isMobile ? 4 : isTablet ? 3 : 2}
            style={{ margin: 0, color: "#262626" }}
          >
            Document Approvals
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: isMobile ? "12px" : "14px",
              display: "block",
              marginTop: "4px",
            }}
          >
            Review and approve candidate document submissions
          </Text>
        </Col>
      </Row>

      {/* Content */}

      <Table
        columns={getColumns()}
        dataSource={tableData}
        loading={loading}
        pagination={{
          pageSize: isMobile ? 10 : isTablet ? 10 : 10,
          showQuickJumper: isDesktop,
          size: isMobile ? "small" : "default",
          style: {
            marginTop: "16px",
            textAlign: "center",
          },
        }}
        scroll={getTableScrollConfig()}
        size={isMobile ? "small" : isTablet ? "small" : "default"}
        rowClassName="table-row-hover"
        
        className="responsive-table"
      />

      {/* Details Modal/Drawer */}
      {isMobile ? (
        <Drawer
          title={
            <Title level={5} style={{ margin: 0 }}>
              Document Review Details
            </Title>
          }
          placement="bottom"
          visible={detailsModalVisible}
          onClose={() => setDetailsModalVisible(false)}
          height="90%"
          extra={
            selectedWorkOrder?.status === "pending_review" && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailsModalVisible(false);
                  handleApprove(selectedWorkOrder);
                }}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Approve
              </Button>
            )
          }
        >
          {selectedWorkOrder && selectedCandidate && (
            <div style={{ padding: "8px 0" }}>
              <DetailsContent
                selectedWorkOrder={selectedWorkOrder}
                selectedCandidate={selectedCandidate}
                isMobile={isMobile}
                isTablet={isTablet}
                getFileIcon={getFileIcon}
                handleDownloadDocument={handleDownloadDocument}
                formatDate={formatDate}
              />
            </div>
          )}
        </Drawer>
      ) : (
        <Modal
          title={
            <Title level={4} style={{ margin: 0 }}>
              Document Review Details
            </Title>
          }
          visible={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailsModalVisible(false)}>
              Close
            </Button>,
            selectedWorkOrder?.status === "pending" && (
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailsModalVisible(false);
                  handleApprove(selectedWorkOrder);
                }}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Approve Documents
              </Button>
            ),
          ]}
          width={getModalWidth()}
          style={{ top: isTablet ? 20 : undefined }}
          bodyStyle={{
            maxHeight: "70vh",
            overflow: "auto",
          }}
        >
          {selectedWorkOrder && selectedCandidate && (
            <DetailsContent
              selectedWorkOrder={selectedWorkOrder}
              selectedCandidate={selectedCandidate}
              isMobile={isMobile}
              isTablet={isTablet}
              getFileIcon={getFileIcon}
              handleDownloadDocument={handleDownloadDocument}
              formatDate={formatDate}
            />
          )}
        </Modal>
      )}

      {/* Approve Modal */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Approve Documents
          </Title>
        }
        visible={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setApprovalComments("");
        }}
        onOk={handleApprovalSubmit}
        confirmLoading={isApproving}
        okText="Approve"
        okButtonProps={{
          type: "primary",
          style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
        }}
        width={isMobile ? "95%" : isTablet ? "80%" : "50%"}
      >
        {selectedCandidate && (
          <div>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div>
                <Text strong>Candidate: </Text>
                <Text>{selectedCandidate.candidateName}</Text>
              </div>
              <div>
                <Text strong>Work Order: </Text>
                <Text>{selectedWorkOrder?.workOrderTitle}</Text>
              </div>
              <div>
                <Text strong>Stage: </Text>
                <Text>{selectedWorkOrder?.stageName}</Text>
              </div>
              <div>
                <Text strong>Documents: </Text>
                <Text>
                  {selectedCandidate.documents?.length || 0} files uploaded
                </Text>
              </div>
            </Space>

            <Divider />

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Approval Comments
              </label>
              <TextArea
                rows={4}
                placeholder="Add your approval comments (optional)..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .table-row-hover:hover {
          background-color: #f5f5f5;
        }

        .responsive-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
          border-bottom: 2px solid #f0f0f0;
        }

        .responsive-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
          padding: ${isMobile
            ? "8px 4px"
            : isTablet
            ? "12px 8px"
            : "12px 16px"};
        }

        .responsive-table .ant-table-thead > tr > th {
          padding: ${isMobile
            ? "8px 4px"
            : isTablet
            ? "12px 8px"
            : "12px 16px"};
          font-size: ${isMobile ? "11px" : isTablet ? "12px" : "14px"};
        }

        .responsive-table .ant-table-tbody > tr > td {
          font-size: ${isMobile ? "11px" : isTablet ? "12px" : "14px"};
        }

        .responsive-table .ant-table-container {
          border: 1px solid #f0f0f0;
          border-radius: 8px;
        }

        .responsive-table .ant-table-body {
          overflow: auto !important;
        }

        .ant-descriptions-item-label {
          font-weight: 500;
        }

        .ant-card {
          transition: all 0.3s ease;
        }

        .ant-dropdown-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Custom scrollbar for table */
        .responsive-table .ant-table-body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .responsive-table .ant-table-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .responsive-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #da2c46;
          border-radius: 4px;
        }

        .responsive-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #b8253a;
        }

        /* Mobile specific styles */
        @media (max-width: 576px) {
          .responsive-table .ant-table-container {
            font-size: 11px;
          }

          .responsive-table .ant-table-tbody > tr > td,
          .responsive-table .ant-table-thead > tr > th {
            padding: 6px 4px;
          }

          .responsive-table .ant-tag {
            margin: 0;
            padding: 0 4px;
            font-size: 10px;
            line-height: 18px;
          }
        }

        /* Tablet specific styles */
        @media (min-width: 577px) and (max-width: 992px) {
          .responsive-table .ant-table-tbody > tr > td,
          .responsive-table .ant-table-thead > tr > th {
            padding: 8px 6px;
          }
        }

        /* Improve text truncation */
        .responsive-table .ant-table-cell {
          word-break: break-word;
        }

        /* Pagination responsive styles */
        @media (max-width: 576px) {
          .ant-pagination {
            text-align: center;
          }

          .ant-pagination-options {
            display: none;
          }
        }

        /* Table header sticky positioning */
        .responsive-table .ant-table-thead > tr > th {
          position: sticky;
          top: 0;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

// Details Content Component
const DetailsContent = ({
  selectedWorkOrder,
  selectedCandidate,
  isMobile,
  isTablet,
  getFileIcon,
  handleDownloadDocument,
  formatDate,
}) => (
  <div>
    {/* Work Order Information */}
    <Title
      level={5}
      style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}
    >
      Work Order Information
    </Title>
    <Descriptions
      bordered
      column={isMobile ? 1 : 2}
      size={isMobile ? "small" : "default"}
      style={{ marginBottom: "16px" }}
    >
      <Descriptions.Item label="Work Order Title">
        {selectedWorkOrder.workOrderTitle}
      </Descriptions.Item>
      <Descriptions.Item label="Job Code">
        {selectedWorkOrder.jobCode}
      </Descriptions.Item>
      <Descriptions.Item label="Stage">
        {selectedWorkOrder.stageName}
      </Descriptions.Item>
      <Descriptions.Item label="Stage Description">
        {selectedWorkOrder.stageDetails?.description || "N/A"}
      </Descriptions.Item>
    </Descriptions>

    {/* Candidate Information */}
    <Title
      level={5}
      style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}
    >
      Candidate Information
    </Title>
    <Descriptions
      bordered
      column={isMobile ? 1 : 2}
      size={isMobile ? "small" : "default"}
      style={{ marginBottom: "16px" }}
    >
      <Descriptions.Item label="Name">
        {selectedCandidate.candidateName}
      </Descriptions.Item>
      <Descriptions.Item label="Email">
        {selectedCandidate.candidateEmail}
      </Descriptions.Item>
      <Descriptions.Item label="Documents Count">
        {selectedCandidate.documents?.length || 0}
      </Descriptions.Item>
    </Descriptions>

    {/* Required Documents */}
    <Title
      level={5}
      style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}
    >
      Required Documents
    </Title>
    <div style={{ marginBottom: "16px" }}>
      {selectedWorkOrder.stageDetails?.requiredDocuments?.map((doc, index) => (
        <Tag
          key={index}
          color="#da2c46"
          style={{
            margin: "2px",
            fontSize: isMobile ? "11px" : "12px",
          }}
        >
          {doc}
        </Tag>
      ))}
      {selectedWorkOrder.requiredDocuments?.map((doc, index) => (
        <Tag
          key={`req-${index}`}
          color="green"
          style={{
            margin: "2px",
            fontSize: isMobile ? "11px" : "12px",
          }}
        >
          {doc.title}
        </Tag>
      ))}
    </div>

    {/* Uploaded Documents */}
    <Title
      level={5}
      style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}
    >
      Uploaded Documents
    </Title>
    <List
      dataSource={selectedCandidate.documents || []}
      renderItem={(document) => (
        <List.Item
          actions={[
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleDownloadDocument(document)}
              size="small"
              style={{ color: "#da2c46" }}
            >
              View
            </Button>,
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadDocument(document)}
              size="small"
              style={{ color: "#da2c46" }}
            >
              Download
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={getFileIcon(document.fileName)}
            title={
              <Text
                ellipsis={{ tooltip: document.fileName }}
                style={{
                  fontSize: isMobile ? "12px" : "14px",
                  fontWeight: 500,
                }}
              >
                {document.fileName}
              </Text>
            }
            description={
              <Space size="small">
                <Text
                  type="secondary"
                  style={{ fontSize: isMobile ? "10px" : "12px" }}
                >
                  {formatDate(document.uploadedAt)}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: isMobile ? "10px" : "12px" }}
                >
                  {document.fileSize ? `(${document.fileSize})` : ""}
                </Text>
              </Space>
            }
          />
        </List.Item>
      )}
      style={{ marginBottom: "24px" }}
      size={isMobile ? "small" : "default"}
    />
  </div>
);

export default RecruiterApprovals;
