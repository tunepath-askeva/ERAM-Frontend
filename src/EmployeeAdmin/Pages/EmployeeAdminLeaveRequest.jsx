import React, { useState, useCallback } from "react";
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
  Select,
  Input,
} from "antd";
import { debounce } from "lodash";
import { EyeOutlined, AlertOutlined } from "@ant-design/icons";
import { useGetEmployeeAdminLeaveHistoryQuery } from "../../Slices/Employee/EmployeeApis";
import LeaveRequestModal from "../Components/LeaveRequestModal";
const { Title, Text } = Typography;
const { Option } = Select;

const EmployeeAdminLeaveRequest = () => {
  const [selectedLeaveId, setSelectedLeaveId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [leaveData, setLeaveData] = useState([]);
  const [selectedEramId, setSelectedEramId] = useState(null);
  const [filters, setFilters] = useState({
    eramId: "",
    urgency: "",
    status: "",
    page: 1,
    pageSize: 10,
  });

  const { data, isLoading, error, refetch } =
    useGetEmployeeAdminLeaveHistoryQuery(filters);

  React.useEffect(() => {
    if (data?.leaves) {
      const transformedData = data.leaves.map((leave) => ({
        ...leave,
      }));
      setLeaveData(transformedData);
    }
  }, [data]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters((prev) => ({ ...prev, eramId: value, page: 1 }));
    }, 2000),
    []
  );

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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDueDays = (submittedDate) => {
    if (!submittedDate) return "N/A";
    const now = new Date();
    const submitted = new Date(submittedDate);
    const diffTime = Math.abs(now - submitted);
    return `${Math.floor(diffTime / (1000 * 60 * 60 * 24))} days`;
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
      title: "Eram Id",
      dataIndex: "eramId",
      key: "eramId",
      align: "center",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{record.eramId}</div>
        </div>
      ),
    },
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

  columns.splice(7, 0, {
    title: "Due Days",
    key: "dueDays",
    render: (_, record) => calculateDueDays(record.decisionDate),
  });

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

      <Row gutter={16} style={{ marginBottom: "16px" }}>
        <Col span={6}>
          <Input
            placeholder="Filter by ERAM ID"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Select Urgency"
            value={filters.urgency}
            onChange={(val) => handleFilterChange("urgency", val)}
            style={{ width: "100%" }}
          >
            <Option value="">All</Option>
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
        </Col>
        <Col span={6}>
          <Select
            placeholder="Select Status"
            value={filters.status}
            onChange={(val) => handleFilterChange("status", val)}
            style={{ width: "100%" }}
          >
            <Option value="">All</Option>
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={leaveData}
          rowKey="_id"
          pagination={{
            current: filters.page,
            pageSize: filters.pageSize,
            total: data?.total || 0,
            onChange: (page, pageSize) => {
              setFilters((prev) => ({ ...prev, page, pageSize }));
            },
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
      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
      `}</style>
    </div>
  );
};

export default EmployeeAdminLeaveRequest;
