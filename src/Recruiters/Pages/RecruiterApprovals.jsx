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
} from "@ant-design/icons";
import { useGetApprovalInfoQuery } from "../../Slices/Recruiter/RecruiterApis";

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

  // API call
  const {
    data: workOrders = [],
    isLoading: loading,
    error,
  } = useGetApprovalInfoQuery();

  // Transform API data for table display
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
            status: "pending_review", // Since no status in API, defaulting to pending
            workOrder: workOrder,
            stage: stage,
            candidate: candidate,
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
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending_review: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  // Responsive column configuration
  const getColumns = () => {
    const baseColumns = [
      {
        title: "Candidate",
        dataIndex: "candidateName",
        key: "candidateName",
        width: screens.xs ? 150 : 200,
        fixed: screens.xs ? "left" : false,
        render: (text, record) => (
          <Space size="small">
            <Avatar
              size={screens.xs ? "small" : "default"}
              icon={<UserOutlined />}
            />
            <div>
              <div
                style={{
                  fontWeight: 500,
                  fontSize: screens.xs ? "12px" : "14px",
                  lineHeight: "1.2",
                }}
              >
                {screens.xs ? text.split(" ")[0] : text}
              </div>
              {!screens.xs && (
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {record.candidateEmail}
                </Text>
              )}
            </div>
          </Space>
        ),
      },
      {
        title: "Work Order",
        dataIndex: "workOrderTitle",
        key: "workOrderTitle",
        width: screens.xs ? 120 : 180,
        render: (text, record) => (
          <div>
            <div
              style={{
                fontWeight: 500,
                fontSize: screens.xs ? "12px" : "14px",
                lineHeight: "1.2",
              }}
            >
              {screens.xs ? `${text.substring(0, 15)}...` : text}
            </div>
            <Text
              type="secondary"
              style={{ fontSize: screens.xs ? "10px" : "12px" }}
            >
              {record.jobCode}
            </Text>
          </div>
        ),
      },
      {
        title: "Stage",
        dataIndex: "stageName",
        key: "stageName",
        width: screens.xs ? 80 : 120,
        render: (text, record) => (
          <Tag color="blue" size={screens.xs ? "small" : "default"}>
            {screens.xs
              ? `L${record.stageOrder + 1}`
              : `${text} (L${record.stageOrder + 1})`}
          </Tag>
        ),
      },
    ];

    // Add recruiter column only for larger screens
    if (!screens.xs) {
      baseColumns.push({
        title: "Recruiter",
        dataIndex: "recruiterName",
        key: "recruiterName",
        width: 150,
        render: (text, record) => (
          <div>
            <div style={{ fontWeight: 500, fontSize: "14px" }}>{text}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.recruiterEmail}
            </Text>
          </div>
        ),
      });
    }

    baseColumns.push(
      {
        title: "Docs",
        dataIndex: "documentsCount",
        key: "documentsCount",
        width: screens.xs ? 60 : 80,
        render: (count, record) => (
          <Tooltip title={`${count} document(s) uploaded`}>
            <Space size="small">
              <FileTextOutlined
                style={{ fontSize: screens.xs ? "12px" : "14px" }}
              />
              <span style={{ fontSize: screens.xs ? "12px" : "14px" }}>
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
        width: screens.xs ? 90 : 120,
        render: (status) => (
          <Badge
            status={getStatusColor(status)}
            text={
              <span style={{ fontSize: screens.xs ? "11px" : "14px" }}>
                {screens.xs ? status.split("_")[0] : getStatusText(status)}
              </span>
            }
          />
        ),
      },
      {
        title: "Actions",
        key: "actions",
        width: screens.xs ? 100 : 150,
        fixed: screens.xs ? "right" : false,
        render: (_, record) => (
          <Space
            size="small"
            direction={screens.xs ? "vertical" : "horizontal"}
          >
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size={screens.xs ? "small" : "default"}
              style={{
                backgroundColor: "#da2c46",
                borderColor: "#da2c46",
                width: screens.xs ? "100%" : "auto",
              }}
            >
              {screens.xs ? null : "View"}
            </Button>
            {record.status === "pending_review" && (
              <Button
                type="default"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
                size={screens.xs ? "small" : "default"}
                style={{
                  color: "#da2c46",
                  borderColor: "#da2c46",
                  width: screens.xs ? "100%" : "auto",
                }}
              >
                {screens.xs ? null : "Approve"}
              </Button>
            )}
          </Space>
        ),
      }
    );

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

  const handleApprovalSubmit = () => {
    // Here you would call your approval API
    // For now, just showing success message
    message.success(
      `Documents approved for ${selectedCandidate?.candidateName}!`
    );
    setApproveModalVisible(false);
    setApprovalComments("");

    // You can update local state here or refetch data
    // Example: Update status to approved
    // updateApprovalStatus(selectedWorkOrder.key, 'approved');
  };

  const handleDownloadDocument = (document) => {
    // Open the document URL in new tab
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

  return (
    <div
      style={{
        padding: screens.xs ? "8px" : screens.sm ? "16px" : "24px",
        minHeight: "100vh",
      }}
    >
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "24px" }}
      >
        <Col xs={24} sm={24} md={18} lg={20}>
          <Title
            level={screens.xs ? 4 : screens.sm ? 3 : 2}
            style={{ margin: 0 }}
          >
            Document Approvals
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: screens.xs ? "12px" : "14px" }}
          >
            Review and approve candidate document submissions
          </Text>
        </Col>
      </Row>

      <Card
        style={{
          borderRadius: screens.xs ? "8px" : "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: screens.xs ? "12px" : "24px" }}
      >
        <Table
          columns={getColumns()}
          dataSource={tableData}
          loading={loading}
          pagination={{
            pageSize: screens.xs ? 5 : 10,
            showSizeChanger: !screens.xs,
            showQuickJumper: !screens.xs,
            showTotal: (total, range) =>
              screens.xs
                ? `${range[0]}-${range[1]}/${total}`
                : `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{
            x: screens.xs ? 800 : true,
            y: screens.xs ? 400 : undefined,
          }}
          size={screens.xs ? "small" : "default"}
          rowClassName="table-row-hover"
        />
      </Card>

      {/* Details Modal */}
      <Modal
        title={
          <Title
            level={4}
            style={{ margin: 0, fontSize: screens.xs ? "16px" : "18px" }}
          >
            Document Review Details
          </Title>
        }
        visible={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setDetailsModalVisible(false)}
            size={screens.xs ? "small" : "default"}
          >
            Close
          </Button>,
          selectedWorkOrder?.status === "pending_review" && (
            <Button
              key="approve"
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                setDetailsModalVisible(false);
                handleApprove(selectedWorkOrder);
              }}
              size={screens.xs ? "small" : "default"}
              style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
            >
              Approve Documents
            </Button>
          ),
        ]}
        width={screens.xs ? "95%" : screens.sm ? "90%" : 1000}
        style={{ top: screens.xs ? 10 : undefined }}
        bodyStyle={{
          padding: screens.xs ? "12px" : "24px",
          maxHeight: screens.xs ? "80vh" : "auto",
          overflow: "auto",
        }}
      >
        {selectedWorkOrder && selectedCandidate && (
          <div>
            {/* Work Order Information */}
            <Title level={5} style={{ fontSize: screens.xs ? "14px" : "16px" }}>
              Work Order Information
            </Title>
            <Descriptions
              bordered
              column={screens.xs ? 1 : 2}
              size={screens.xs ? "small" : "default"}
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
                {selectedWorkOrder.stageDetails?.description}
              </Descriptions.Item>
            </Descriptions>

            {/* Candidate Information */}
            <Title level={5} style={{ fontSize: screens.xs ? "14px" : "16px" }}>
              Candidate Information
            </Title>
            <Descriptions
              bordered
              column={screens.xs ? 1 : 2}
              size={screens.xs ? "small" : "default"}
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
            <Title level={5} style={{ fontSize: screens.xs ? "14px" : "16px" }}>
              Required Documents
            </Title>
            <div style={{ marginBottom: "16px" }}>
              {selectedWorkOrder.stageDetails?.requiredDocuments?.map(
                (doc, index) => (
                  <Tag
                    key={index}
                    color="#da2c46"
                    style={{
                      margin: "2px",
                      fontSize: screens.xs ? "11px" : "12px",
                    }}
                  >
                    {doc}
                  </Tag>
                )
              )}
              {selectedWorkOrder.requiredDocuments?.map((doc, index) => (
                <Tag
                  key={`req-${index}`}
                  color="green"
                  style={{
                    margin: "2px",
                    fontSize: screens.xs ? "11px" : "12px",
                  }}
                >
                  {doc.title}
                </Tag>
              ))}
            </div>

            {/* Uploaded Documents */}
            <Title level={5} style={{ fontSize: screens.xs ? "14px" : "16px" }}>
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
                      <Text style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                        {document.fileName}
                      </Text>
                    }
                    description={
                      <Text
                        type="secondary"
                        style={{ fontSize: screens.xs ? "11px" : "12px" }}
                      >
                        Uploaded: {formatDate(document.uploadedAt)}
                      </Text>
                    }
                  />
                </List.Item>
              )}
              style={{ marginBottom: "16px" }}
            />
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title={
          <Title
            level={4}
            style={{ margin: 0, fontSize: screens.xs ? "16px" : "18px" }}
          >
            Approve Documents
          </Title>
        }
        visible={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setApprovalComments("");
        }}
        onOk={handleApprovalSubmit}
        okText="Approve"
        okButtonProps={{
          type: "primary",
          style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
          size: screens.xs ? "small" : "default",
        }}
        cancelButtonProps={{
          size: screens.xs ? "small" : "default",
        }}
        width={screens.xs ? "95%" : screens.sm ? "80%" : "50%"}
        bodyStyle={{
          padding: screens.xs ? "12px" : "24px",
        }}
      >
        {selectedCandidate && (
          <div>
            <div style={{ marginBottom: "12px" }}>
              <Text strong style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                Candidate:{" "}
              </Text>
              <Text style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                {selectedCandidate.candidateName}
              </Text>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <Text strong style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                Work Order:{" "}
              </Text>
              <Text style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                {selectedWorkOrder?.workOrderTitle}
              </Text>
            </div>
            <div style={{ marginBottom: "12px" }}>
              <Text strong style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                Stage:{" "}
              </Text>
              <Text style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                {selectedWorkOrder?.stageName}
              </Text>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                Documents:{" "}
              </Text>
              <Text style={{ fontSize: screens.xs ? "12px" : "14px" }}>
                {selectedCandidate.documents?.length || 0} files uploaded
              </Text>
            </div>

            <Divider />

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                  fontSize: screens.xs ? "12px" : "14px",
                }}
              >
                Approval Comments
              </label>
              <TextArea
                rows={screens.xs ? 3 : 4}
                placeholder="Add your approval comments (optional)..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
                style={{ fontSize: screens.xs ? "12px" : "14px" }}
              />
            </div>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .table-row-hover:hover {
          background-color: #f5f5f5;
        }

        @media (max-width: 768px) {
          .ant-table-thead > tr > th {
            font-size: 12px;
            padding: 8px 4px;
          }

          .ant-table-tbody > tr > td {
            font-size: 12px;
            padding: 8px 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default RecruiterApprovals;
