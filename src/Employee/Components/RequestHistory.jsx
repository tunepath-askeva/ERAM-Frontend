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
  Badge,
  Spin,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  HistoryOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import RequestDetailsDrawer from "./RequestDetailsDrawer";

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Option } = Select;

const RequestHistory = ({
  mobileView,
  requests = [],
  isLoading = false,
  onRefresh,
  onTicketSubmit 
}) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewRequestDrawer, setViewRequestDrawer] = useState(false);

  const normalizedRequests = requests?.map((request) => ({
    id: request._id,
    requestType: request.requestType,
    description: request.description,
    status: request.status.charAt(0).toUpperCase() + request.status.slice(1),
    documents: request.uploadedDocuments || [],
    createdAt: request.createdAt || new Date().toISOString(),
    fullData: request,
  }));

  const requestTypes = [
    { value: "travel", label: "Travel Request", color: "blue" },
    { value: "exit", label: "Exit Reentry", color: "green" },
    { value: "vehicle", label: "Vehicle Related Request", color: "orange" },
    { value: "payslip", label: "Payslip Request", color: "purple" },
    { value: "general", label: "General Request", color: "cyan" },
    { value: "other", label: "Other Request", color: "volcano" },
  ];

  const getFilteredRequests = () => {
    return (
      normalizedRequests?.filter((req) => {
        const statusMatch =
          filterStatus === "all" || req.status.toLowerCase() === filterStatus;
        const typeMatch =
          filterType === "all" ||
          req.requestType.toLowerCase().includes(filterType);
        return statusMatch && typeMatch;
      }) || []
    );
  };

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

  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
      message.success("Request history refreshed!");
    }
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
      dataIndex: "documents",
      key: "documents",
      render: (documents) => (
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
            status === "Approved"
              ? "green"
              : status === "Rejected"
              ? "red"
              : status === "Pending"
              ? "orange"
              : status === "Cancelled"
              ? "red"
              : "blue"
          }
        >
          {status}
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
              setSelectedRequest(record.fullData || record);
              setViewRequestDrawer(true);
            }}
          >
            {mobileView ? "" : "View"}
          </Button>
        </Space>
      ),
    },
  ];

  const filteredData = getFilteredRequests();

  return (
    <div className="request-history-container">
      <Card
        title={
          <span>
            <HistoryOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Request History ({filteredData.length} requests)
          </span>
        }
        style={{ borderRadius: "12px" }}
        loading={isLoading}
        extra={
          !mobileView && (
            <Space>
              <Select
                placeholder="Filter by Status"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
              <Select
                placeholder="Filter by Type"
                value={filterType}
                onChange={setFilterType}
                style={{ width: 180 }}
                allowClear
              >
                <Option value="all">All Types</Option>
                <Option value="travel">Travel Request</Option>
                <Option value="exit">Exit Reentry</Option>
                <Option value="vehicle">Vehicle Related</Option>
                <Option value="payslip">Payslip Request</Option>
                <Option value="general">General Request</Option>
                <Option value="other">Other Request</Option>
              </Select>
              <RangePicker />
              <Button icon={<SearchOutlined />}>Search</Button>
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
        {/* Mobile Filters */}
        {mobileView && (
          <div style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: "100%" }}>
              <Row gutter={8}>
                <Col span={12}>
                  <Select
                    placeholder="Filter by Status"
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
                <Col span={12}>
                  <Select
                    placeholder="Filter by Type"
                    value={filterType}
                    onChange={setFilterType}
                    style={{ width: "100%" }}
                    allowClear
                  >
                    <Option value="all">All Types</Option>
                    <Option value="travel">Travel Request</Option>
                    <Option value="exit">Exit Reentry</Option>
                    <Option value="vehicle">Vehicle Related</Option>
                    <Option value="payslip">Payslip Request</Option>
                    <Option value="general">General Request</Option>
                    <Option value="other">Other Request</Option>
                  </Select>
                </Col>
              </Row>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
                block
              >
                Refresh History
              </Button>
            </Space>
          </div>
        )}

        {filteredData.length === 0 && !isLoading ? (
          <Empty
            description="No requests found"
            style={{ padding: "40px 0" }}
          />
        ) : (
          <Spin spinning={isLoading}>
            <Table
              dataSource={filteredData}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} requests`,
              }}
              scroll={{ x: true }}
              size={mobileView ? "small" : "middle"}
              rowClassName={(record) =>
                record.status === "Pending" ? "pending-row" : ""
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
