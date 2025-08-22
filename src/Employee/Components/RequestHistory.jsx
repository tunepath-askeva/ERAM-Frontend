import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  Select,
  DatePicker,
  Space,
  Empty,
  Tooltip,
  Typography,
  Badge,
  Spin,
  Input,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  HistoryOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import RequestDetailsDrawer from "./RequestDetailsDrawer";

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const RequestHistory = ({
  mobileView,
  requests = [],
  isLoading = false,
  onRefresh,
  onTicketSubmit,
  pagination,
  onFiltersChange
}) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewRequestDrawer, setViewRequestDrawer] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFiltersChange();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText, filterStatus, filterType, dateRange]);

  const handleFiltersChange = () => {
    const filters = {
      page: 1, // Reset to first page when filters change
      pageSize: pagination?.pageSize || 10,
      status: filterStatus,
      requestType: filterType,
      search: searchText,
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
    };

    onFiltersChange?.(filters);
  };

  const handleTableChange = (paginationConfig) => {
    const newFilters = {
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      status: filterStatus,
      requestType: filterType,
      search: searchText,
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
    };

    onFiltersChange?.(newFilters);
  };

  const handleRefresh = () => {
    handleFiltersChange();
  };

  const handleReset = () => {
    setFilterStatus("all");
    setFilterType("all");
    setSearchText("");
    setDateRange(null);
    // Reset will trigger the useEffect which will call handleFiltersChange
  };

  const requestTypes = [
    { value: "travel", label: "Travel Request", color: "blue" },
    { value: "exit", label: "Exit Reentry", color: "green" },
    { value: "vehicle", label: "Vehicle Related Request", color: "orange" },
    { value: "payslip", label: "Payslip Request", color: "purple" },
    { value: "general", label: "General Request", color: "cyan" },
    { value: "other", label: "Other Request", color: "volcano" },
  ];

  const getRequestTypeTag = (type) => {
    const requestType = requestTypes.find((t) =>
      type.toLowerCase().includes(t.value)
    );
    return (
      <Tag color={requestType?.color || "default"}>
        {type.length > 20 ? `${type.substring(0, 20)}...` : type}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Request Type",
      dataIndex: "requestType",
      key: "requestType",
      render: (text) => getRequestTypeTag(text),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Tooltip title={text}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {text}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Documents",
      dataIndex: "uploadedDocuments",
      key: "documents",
      render: (documents = []) => (
        <Space>
          <Badge count={documents.length} size="small">
            <FileTextOutlined style={{ fontSize: 16 }} />
          </Badge>
          {documents.length > 0 && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {documents.length} file{documents.length > 1 ? "s" : ""}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "rejected"
              ? "red"
              : status === "pending"
              ? "orange"
              : status === "cancelled"
              ? "red"
              : "blue"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <div>
          <div>{dayjs(date).format("DD MMM YYYY")}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {dayjs(date).format("HH:mm")}
          </Text>
        </div>
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
              setSelectedRequest(record);
              setViewRequestDrawer(true);
            }}
          >
            {mobileView ? "" : "View"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="request-history-container">
      <Card
        title={
          <span>
            <HistoryOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Request History ({pagination?.total || 0} requests)
          </span>
        }
        style={{ borderRadius: "12px" }}
        loading={isLoading}
        extra={
          !mobileView && (
            <Space>
              <Button
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset Filters
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Refresh
              </Button>
            </Space>
          )
        }
      >
        {/* Filters */}
        <div style={{ marginBottom: 16 }}>
          <Space direction={mobileView ? "vertical" : "horizontal"} style={{ width: "100%" }}>
            <Row gutter={[8, 8]} style={{ width: "100%" }}>
              <Col xs={24} sm={24} md={6}>
                <Search
                  placeholder="Search requests..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: "100%" }}
                  allowClear
                />
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Select
                  placeholder="Status"
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="all">All Status</Option>
                  <Option value="pending">Pending</Option>
                  <Option value="approved">Approved</Option>
                  <Option value="rejected">Rejected</Option>
                  <Option value="cancelled">Cancelled</Option>
                </Select>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Select
                  placeholder="Type"
                  value={filterType}
                  onChange={setFilterType}
                  style={{ width: "100%" }}
                  allowClear
                >
                  <Option value="all">All Types</Option>
                  <Option value="Travel Request">Travel Request</Option>
                  <Option value="Exit Reentry">Exit Reentry</Option>
                  <Option value="Vehicle Related Request">Vehicle Related</Option>
                  <Option value="Payslip Request">Payslip Request</Option>
                  <Option value="General Request">General Request</Option>
                  <Option value="New/Other Request">Other Request</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <RangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  style={{ width: "100%" }}
                  format="DD MMM YYYY"
                  allowClear
                />
              </Col>
              {mobileView && (
                <Col xs={24}>
                  <Space style={{ width: "100%" }}>
                    <Button onClick={handleReset} block>
                      Reset
                    </Button>
                    <Button
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                      loading={isLoading}
                      block
                    >
                      Refresh
                    </Button>
                  </Space>
                </Col>
              )}
            </Row>
          </Space>
        </div>

        {requests.length === 0 && !isLoading ? (
          <Empty
            description="No requests found"
            style={{ padding: "40px 0" }}
          />
        ) : (
          <Spin spinning={isLoading}>
            <Table
              dataSource={requests}
              columns={columns}
              rowKey="_id"
              pagination={{
                current: pagination?.page || 1,
                pageSize: pagination?.pageSize || 10,
                total: pagination?.total || 0,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} requests`,
                pageSizeOptions: ['5', '10', '20', '50'],
              }}
              onChange={handleTableChange}
              scroll={{ x: true }}
              size={mobileView ? "small" : "middle"}
              rowClassName={(record) =>
                record.status === "pending" ? "pending-row" : ""
              }
            />
          </Spin>
        )}
      </Card>

      <RequestDetailsDrawer
        visible={viewRequestDrawer}
        onClose={() => setViewRequestDrawer(false)}
        request={selectedRequest}
        mobileView={mobileView}
        onTicketSubmit={onTicketSubmit}
      />
    </div>
  );
};

export default RequestHistory;