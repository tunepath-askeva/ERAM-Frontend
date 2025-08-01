import React, { useState } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  Select,
  DatePicker,
  Space,
  Empty,
  Popconfirm,
  Tooltip,
  Typography,
  message,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import LeaveDetailsDrawer from "./LeaveDetailsDrawer";
const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Option } = Select;

const LeaveHistory = ({ mobileView, leaveRequests = [], setLeaveRequests }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewLeaveDrawer, setViewLeaveDrawer] = useState(false);

  const leaveTypes = [
    { value: "annual", label: "Annual Leave", color: "blue" },
    { value: "sick", label: "Sick Leave", color: "red" },
    { value: "casual", label: "Casual Leave", color: "green" },
    { value: "maternity", label: "Maternity Leave", color: "pink" },
    { value: "paternity", label: "Paternity Leave", color: "cyan" },
    { value: "compensatory", label: "Compensatory Off", color: "orange" },
    { value: "emergency", label: "Emergency Leave", color: "volcano" },
  ];

  const handleCancelLeave = async (id) => {
    try {
      // For now, just update the local state
      // Replace with actual API call when available
      if (setLeaveRequests) {
        setLeaveRequests(
          leaveRequests.map((req) =>
            req.id === id ? { ...req, status: "Cancelled" } : req
          )
        );
      }
      message.success("Leave request cancelled successfully");
      setViewLeaveDrawer(false);
    } catch (error) {
      message.error("Failed to cancel leave request");
    }
  };

  const getFilteredRequests = () => {
    return leaveRequests.filter((req) => {
      const statusMatch =
        filterStatus === "all" || req.status.toLowerCase() === filterStatus;
      const typeMatch =
        filterType === "all" || 
        req.type.toLowerCase().includes(filterType) ||
        leaveTypes.find(t => t.label === req.type)?.value === filterType;
      return statusMatch && typeMatch;
    });
  };

  const columns = [
    {
      title: "Leave Type",
      dataIndex: "type",
      key: "type",
      render: (text) => {
        const leaveType = leaveTypes.find((t) => t.label === text);
        return <Tag color={leaveType?.color}>{text}</Tag>;
      },
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {dayjs(record.startDate).format("DD MMM")} -{" "}
            {dayjs(record.endDate).format("DD MMM YYYY")}
          </div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {record.days} {record.days === 1 ? "day" : "days"}
            {record.isHalfDay && " (Half Day)"}
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "Approved"
              ? "green"
              : status === "Rejected"
              ? "red"
              : status === "Pending"
              ? "orange"
              : "default"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedLeave(record);
              setViewLeaveDrawer(true);
            }}
          >
            View
          </Button>
          {record.status === "Pending" && (
            <Popconfirm
              title="Cancel leave request?"
              onConfirm={() => handleCancelLeave(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                Cancel
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="leave-history-container">
      <Card
        title={
          <span>
            <HistoryOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Leave History ({getFilteredRequests().length} requests)
          </span>
        }
        style={{ borderRadius: "12px" }}
        extra={
          !mobileView && (
            <Space>
              <Select
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
              <Select
                placeholder="Filter by Type"
                value={filterType}
                onChange={setFilterType}
                style={{ width: 150 }}
              >
                <Option value="all">All Types</Option>
                {leaveTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
              <RangePicker />
              <Button icon={<SearchOutlined />}>Search</Button>
            </Space>
          )
        }
      >
        {/* Mobile Filters */}
        {mobileView && (
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Select
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: "100%" }}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
              <Select
                placeholder="Filter by Type"
                value={filterType}
                onChange={setFilterType}
                style={{ width: "100%" }}
              >
                <Option value="all">All Types</Option>
                {leaveTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Space>
          </div>
        )}

        {getFilteredRequests().length === 0 ? (
          <Empty
            description="No leave requests found"
            style={{ padding: "40px 0" }}
          />
        ) : (
          <Table
            dataSource={getFilteredRequests()}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
            size={mobileView ? "small" : "middle"}
          />
        )}
      </Card>

      <LeaveDetailsDrawer
        visible={viewLeaveDrawer}
        onClose={() => setViewLeaveDrawer(false)}
        leave={selectedLeave}
        onCancelLeave={handleCancelLeave}
        mobileView={mobileView}
      />
    </div>
  );
};

export default LeaveHistory;