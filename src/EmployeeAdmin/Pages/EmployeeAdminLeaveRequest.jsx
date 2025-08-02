import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Typography,
  message,
  Badge,
  Row,
  Col,
  Spin,
} from "antd";
import { EyeOutlined, AlertOutlined } from "@ant-design/icons";
import { useGetEmployeeAdminLeaveHistoryQuery } from "../../Slices/Employee/EmployeeApis";
import LeaveRequestModal from "../Components/LeaveRequestModal";
const { Title, Text } = Typography;

const EmployeeAdminLeaveRequest = () => {
  const { data, isLoading, error, refetch } =
    useGetEmployeeAdminLeaveHistoryQuery();
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [selectedEramId, setSelectedEramId] = useState(null);

  React.useEffect(() => {
    if (data?.leaves) {
      const transformedData = data.leaves.map((leave) => ({
        ...leave,
      }));
      setLeaveData(transformedData);
    }
  }, [data]);

  const handleViewRequest = (record) => {
    setSelectedLeaveId(record._id);
    setSelectedEramId(record.eramId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedLeaveId(null);
    setSelectedEramId(null);
    // Refetch data when modal closes to get updated status
    refetch();
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
    switch (urgency?.toLowerCase()) {
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
      dataIndex: "fullName",
      key: "employee",
      align: "center",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
      align: "center",
      render: (type) => (
        <Tag color="blue">{type?.charAt(0).toUpperCase() + type?.slice(1)}</Tag>
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
          text={status?.charAt(0).toUpperCase() + status?.slice(1)}
        />
      ),
    },
    {
      title: "Urgency",
      dataIndex: "urgency",
      key: "urgency",
      render: (urgency) => {
        if (!urgency) return <Tag color="default">Normal</Tag>;
        return (
          <Tag color={getUrgencyColor(urgency)} icon={<AlertOutlined />}>
            {urgency}
          </Tag>
        );
      },
    },
    {
      title: "Submitted",
      dataIndex: "decisionDate",
      key: "decisionDate",
      render: (date) => (date ? formatDate(date) : "N/A"),
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
        onClose={handleCloseModal}
        leaveId={selectedLeaveId}
        eramId={selectedEramId}
      />
    </div>
  );
};

export default EmployeeAdminLeaveRequest;
