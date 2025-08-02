import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  Card,
  Typography,
  message,
  Popconfirm,
  Badge,
  Divider,
  Row,
  Col,
  Spin,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { useGetEmployeeAdminLeaveHistoryQuery } from "../../Slices/Employee/EmployeeApis";

const { Title, Text } = Typography;

const LeaveRequestModal = ({ visible, onClose, leaveData }) => {
  if (!leaveData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "processing";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const handleDocumentDownload = (doc) => {
    window.open(doc.fileUrl, "_blank");
    message.success(`Downloading ${doc.documentName}`);
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileTextOutlined />
          <span>Leave Request Details</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <Title
                  level={4}
                  style={{
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <UserOutlined />
                  {leaveData.employee.fullName}
                </Title>
                <Space>
                  <Tag
                    color={getStatusColor(leaveData.status)}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    {leaveData.status.toUpperCase()}
                  </Tag>
                  <Tag
                    color={getUrgencyColor(leaveData.urgency)}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    {leaveData.urgency} Priority
                  </Tag>
                </Space>
              </div>
              <Divider />
            </Col>

            <Col span={12}>
              <Card
                size="small"
                title="Employee Information"
                style={{ height: "100%" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>Email: </Text>
                    <Text>{leaveData.employee.email}</Text>
                  </div>
                  <div>
                    <Text strong>Phone: </Text>
                    <Text>{leaveData.employee.phone}</Text>
                  </div>
                  <div>
                    <Text strong>Employee ID: </Text>
                    <Text code>{leaveData.employee._id}</Text>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={12}>
              <Card
                size="small"
                title="Leave Information"
                style={{ height: "100%" }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <Text strong>Leave Type: </Text>
                    <Tag color="blue">
                      {leaveData.leaveType.charAt(0).toUpperCase() +
                        leaveData.leaveType.slice(1)}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Half Day: </Text>
                    <Tag color={leaveData.isHalfDay ? "orange" : "default"}>
                      {leaveData.isHalfDay ? "Yes" : "No"}
                    </Tag>
                  </div>
                  <div>
                    <Text strong>Medical Certificate: </Text>
                    <Tag
                      color={leaveData.medicalCertificate ? "green" : "default"}
                    >
                      {leaveData.medicalCertificate
                        ? "Required"
                        : "Not Required"}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>

            <Col span={24}>
              <Card
                size="small"
                title={
                  <>
                    <CalendarOutlined /> Duration
                  </>
                }
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Start Date: </Text>
                      <Text>{formatDate(leaveData.startDate)}</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div>
                      <Text strong>End Date: </Text>
                      <Text>{formatDate(leaveData.endDate)}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>

            <Col span={24}>
              <Card size="small" title="Reason">
                <Text>{leaveData.reason}</Text>
              </Card>
            </Col>

            {leaveData.uploadedDocuments &&
              leaveData.uploadedDocuments.length > 0 && (
                <Col span={24}>
                  <Card size="small" title="Uploaded Documents">
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {leaveData.uploadedDocuments.map((doc) => (
                        <div
                          key={doc._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px",
                            background: "#f5f5f5",
                            borderRadius: "4px",
                          }}
                        >
                          <div>
                            <Text strong>{doc.documentName}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Uploaded: {formatDate(doc.uploadedAt)}
                            </Text>
                          </div>
                          <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            style={{ backgroundColor: "#da2c46" }}
                            onClick={() => handleDocumentDownload(doc)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>
              )}

            <Col span={24}>
              <Card size="small" title="Request Timeline">
                <Row gutter={16}>
                  <Col span={12}>
                    <div>
                      <Text strong>Requested Date: </Text>
                      <Text>{formatDate(leaveData.createdAt)}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

const EmployeeAdminLeaveRequest = () => {
  const { data, isLoading, error } = useGetEmployeeAdminLeaveHistoryQuery();
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [leaveData, setLeaveData] = useState([]);

  React.useEffect(() => {
    if (data?.leaves) {
      setLeaveData(data.leaves);
    }
  }, [data]);

  const handleViewRequest = (record) => {
    setSelectedLeave(record);
    setModalVisible(true);
  };

  const handleApproveRequest = (record) => {
    const updatedData = leaveData.map((leave) =>
      leave._id === record._id
        ? {
            ...leave,
            status: "approved",
            decisionDate: new Date().toISOString(),
          }
        : leave
    );
    setLeaveData(updatedData);
    message.success(`Leave request approved for ${record.employee.fullName}`);
  };

  const handleRejectRequest = (record) => {
    const updatedData = leaveData.map((leave) =>
      leave._id === record._id
        ? {
            ...leave,
            status: "rejected",
            decisionDate: new Date().toISOString(),
          }
        : leave
    );
    setLeaveData(updatedData);
    message.error(`Leave request rejected for ${record.employee.fullName}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "processing";
      case "approved":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency.toLowerCase()) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: ["employee", "fullName"],
      key: "employee",
      align: "center",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            {record.employee.email}
          </div>
        </div>
      ),
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
      align: "center",

      render: (type) => (
        <Tag color="blue">{type.charAt(0).toUpperCase() + type.slice(1)}</Tag>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      align: "center",

      render: (_, record) => (
        <div>
          <div>{formatDate(record.startDate)}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>
            to {formatDate(record.endDate)}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={getStatusColor(status)}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      render: (urgency) => (
        <Tag color={getUrgencyColor(urgency)} icon={<AlertOutlined />}>
          {urgency}
        </Tag>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => formatDate(date),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",

      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewRequest(record)}
            style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
          >
            View
          </Button>
          {record.status === "pending" && (
            <>
              <Popconfirm
                title="Approve Leave Request"
                description="Are you sure you want to approve this leave request?"
                onConfirm={() => handleApproveRequest(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Approve
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Reject Leave Request"
                description="Are you sure you want to reject this leave request?"
                onConfirm={() => handleRejectRequest(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<CloseOutlined />} size="small">
                  Reject
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const pendingCount = leaveData.filter(
    (leave) => leave.status === "pending"
  ).length;
  const approvedCount = leaveData.filter(
    (leave) => leave.status === "approved"
  ).length;
  const rejectedCount = leaveData.filter(
    (leave) => leave.status === "rejected"
  ).length;

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" />
        <div style={{ marginTop: "16px" }}>
          <Text>Loading leave requests...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Text type="danger">
          Error loading leave requests. Please try again.
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>Leave Request Management</Title>
        <Row gutter={16} style={{ marginTop: "16px" }}>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title level={3} style={{ color: "#1890ff", margin: 0 }}>
                  {pendingCount}
                </Title>
                <Text>Pending Requests</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title level={3} style={{ color: "#52c41a", margin: 0 }}>
                  {approvedCount}
                </Title>
                <Text>Approved Requests</Text>
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <div style={{ textAlign: "center" }}>
                <Title level={3} style={{ color: "#ff4d4f", margin: 0 }}>
                  {rejectedCount}
                </Title>
                <Text>Rejected Requests</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={leaveData}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
          scroll={{ x: "max-content" }}
        />
      </Card>

      <LeaveRequestModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedLeave(null);
        }}
        leaveData={selectedLeave}
      />
    </div>
  );
};

export default EmployeeAdminLeaveRequest;
