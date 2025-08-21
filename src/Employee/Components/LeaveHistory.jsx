import React, { useState, useEffect, useCallback } from "react";
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
  Input,
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
import { useGetEmployeeLeaveHistoryQuery } from "../../Slices/Employee/EmployeeApis";

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Option } = Select;

const LeaveHistory = ({ mobileView, setLeaveRequests }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewLeaveDrawer, setViewLeaveDrawer] = useState(false);

  // Debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      if (searchText !== debouncedSearchText) {
        setCurrentPage(1); // Reset to first page when search changes
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, debouncedSearchText]);

  // Build query parameters
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    status: filterStatus !== "all" ? filterStatus : undefined,
    leaveType: filterType !== "all" ? filterType : undefined,
    startDate: dateRange[0]
      ? dayjs(dateRange[0]).format("YYYY-MM-DD")
      : undefined,
    endDate: dateRange[1]
      ? dayjs(dateRange[1]).format("YYYY-MM-DD")
      : undefined,
    search: debouncedSearchText || undefined,
  };

  // Use the query with parameters
  const {
    data: leaveHistoryData,
    isLoading,
    refetch,
  } = useGetEmployeeLeaveHistoryQuery(queryParams);

  const leaveRequests = leaveHistoryData?.leaves || [];
  const totalRecords = leaveHistoryData?.total || 0;

  const normalizedLeaves = leaveRequests?.map((leave) => ({
    id: leave._id,
    type:
      leave.leaveType.charAt(0).toUpperCase() +
      leave.leaveType.slice(1) +
      " Leave",
    startDate: leave.startDate,
    endDate: leave.endDate,
    reason: leave.reason,
    isHalfDay: leave.isHalfDay,
    days: dayjs(leave.endDate).diff(dayjs(leave.startDate), "day") + 1,
    status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1),
    urgency: leave.urgency,
    documents: leave.uploadedDocuments || [],
    fullData: leave,
  }));

  const leaveTypes = [
    { value: "annual", label: "Annual Leave", color: "blue" },
    { value: "sick", label: "Sick Leave", color: "red" },
    { value: "casual", label: "Casual Leave", color: "green" },
    { value: "maternity", label: "Maternity Leave", color: "pink" },
    { value: "paternity", label: "Paternity Leave", color: "cyan" },
    { value: "compensatory", label: "Compensatory Off", color: "orange" },
    { value: "emergency", label: "Emergency Leave", color: "volcano" },
  ];

  // Handle filter changes
  const handleStatusChange = (value) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value) => {
    setFilterType(value);
    setCurrentPage(1);
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates || []);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

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
      refetch(); // Refetch data after cancellation
    } catch (error) {
      message.error("Failed to cancel leave request");
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleClearFilters = () => {
    setFilterStatus("all");
    setFilterType("all");
    setDateRange([]);
    setSearchText("");
    setCurrentPage(1);
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
              setSelectedLeave(record.fullData || record);
              setViewLeaveDrawer(true);
            }}
          >
            {!mobileView && "View"}
          </Button>
          {record.status === "Pending" && (
            <Popconfirm
              title="Cancel leave request?"
              onConfirm={() => handleCancelLeave(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                {!mobileView && "Cancel"}
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
            Leave History ({totalRecords} requests)
          </span>
        }
        style={{ borderRadius: "12px" }}
        extra={
          !mobileView && (
            <Space wrap>
              <Input.Search
                placeholder="Search leaves..."
                value={searchText}
                onChange={handleSearchChange}
                style={{ width: 200 }}
                allowClear
                loading={isLoading && searchText !== debouncedSearchText}
              />
              <Select
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={handleStatusChange}
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
                onChange={handleTypeChange}
                style={{ width: 150 }}
              >
                <Option value="all">All Types</Option>
                {leaveTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ width: 250 }}
              />
              <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                Refresh
              </Button>
              <Button onClick={handleClearFilters}>Clear Filters</Button>
            </Space>
          )
        }
      >
        {/* Mobile Filters */}
        {mobileView && (
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <Input.Search
                placeholder="Search leaves..."
                value={searchText}
                onChange={handleSearchChange}
                style={{ width: "100%" }}
                allowClear
                loading={isLoading && searchText !== debouncedSearchText}
              />
              <Space style={{ width: "100%" }} wrap>
                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={handleStatusChange}
                  style={{ width: "48%" }}
                >
                  <Option value="all">All Status</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                </Select>
                <Select
                  placeholder="Type"
                  value={filterType}
                  onChange={handleTypeChange}
                  style={{ width: "48%" }}
                >
                  <Option value="all">All Types</Option>
                  {leaveTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.label}
                    </Option>
                  ))}
                </Select>
              </Space>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                style={{ width: "100%" }}
                placeholder={["Start Date", "End Date"]}
              />
              <Space style={{ width: "100%" }}>
                <Button icon={<ReloadOutlined />} onClick={handleRefresh} block>
                  Refresh
                </Button>
                <Button onClick={handleClearFilters} block>
                  Clear Filters
                </Button>
              </Space>
            </Space>
          </div>
        )}

        {normalizedLeaves.length === 0 ? (
          <Empty
            description={isLoading ? "Loading..." : "No leave requests found"}
            style={{ padding: "40px 0" }}
          />
        ) : (
          <Table
            dataSource={normalizedLeaves}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalRecords,
              showSizeChanger: true,
              showQuickJumper: !mobileView,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["5", "10", "20", "50"],
              size: mobileView ? "small" : "default",
            }}
            onChange={handleTableChange}
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
