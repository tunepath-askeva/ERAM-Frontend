import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Tooltip,
  Spin,
  Card,
  Typography,
  Select,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { useGetAttritionHistoryQuery } from "../../Slices/Recruiter/RecruiterApis";
import AttritionHistoryDetailsModal from "../Components/AttritionHistoryDetailsModal"; // NEW IMPORT

const { Text } = Typography;
const { Option } = Select;

const AttritionHistory = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedAttrition, setSelectedAttrition] = useState(null); // CHANGED: Store full attrition object
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  const {
    data: historyResponse,
    isLoading,
    error,
    refetch,
  } = useGetAttritionHistoryQuery({
    page,
    pageSize,
    search: debouncedSearch,
    status: statusFilter,
  });

  const attritions = historyResponse?.data || [];
  const total = historyResponse?.total || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleViewDetails = (record) => {
    setSelectedAttrition(record); // CHANGED: Pass entire record
    setIsDetailsModalVisible(true);
  };

  const columns = [
    {
      title: "Employee Name",
      dataIndex: ["employee", "fullName"],
      key: "employeeName",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: ["employee", "email"],
      key: "email",
      width: 250,
    },
    {
      title: "Unique Code",
      dataIndex: ["employee", "uniqueCode"],
      key: "uniqueCode",
      width: 150,
    },
    {
      title: "Previous ERAM ID",
      dataIndex: "previousEramId",
      key: "previousEramId",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Attrition Type",
      dataIndex: "attritionType",
      key: "attritionType",
      width: 200,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 180,
      render: (status) => {
        if (status === "converted_to_candidate") {
          return (
            <Tag color="purple" style={{ fontWeight: 500 }}>
              Converted to Candidate
            </Tag>
          );
        }
        if (status === "cancelled") {
          return (
            <Tag color="orange" style={{ fontWeight: 500 }}>
              Cancelled
            </Tag>
          );
        }
        return <Tag>{status}</Tag>;
      },
    },
    {
      title: "Current Role",
      dataIndex: ["employee", "role"],
      key: "currentRole",
      width: 120,
      render: (role) => (
        <Tag color={role === "candidate" ? "green" : "blue"}>
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Initiated By",
      dataIndex: ["initiatedBy", "fullName"],
      key: "initiatedBy",
      width: 150,
    },
    {
      title: "Completed On",
      key: "completedOn",
      width: 180,
      render: (_, record) => {
        const date = record.convertedAt || record.cancelledAt;
        return date ? new Date(date).toLocaleString() : "-";
      },
    },
    {
      title: "Completed By",
      key: "completedBy",
      width: 150,
      render: (_, record) => {
        const user = record.convertedBy || record.cancelledBy;
        return user?.fullName || "-";
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: "#1890ff", padding: 0 }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "red" }}>
          Error loading attrition history:{" "}
          {error?.data?.message || error.message}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#da2c46", marginBottom: "8px", fontSize: "28px" }}>
          <HistoryOutlined /> Attrition History
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          View completed attrition processes - converted to candidates or
          cancelled
        </p>

        <Card style={{ marginBottom: "16px" }}>
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Space>
              <Input
                placeholder="Search by name, email, or code..."
                allowClear
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <Select
                placeholder="Filter by status"
                allowClear
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 200 }}
              >
                <Option value="">All</Option>
                <Option value="converted_to_candidate">
                  Converted to Candidate
                </Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Space>

            <Space>
              <Text type="secondary">
                Total: <strong>{total}</strong> record(s)
              </Text>
            </Space>
          </Space>
        </Card>
      </div>

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={attritions}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) =>
              `Total ${total} record${total !== 1 ? "s" : ""}`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={(pagination) => {
            setPage(pagination.current);
            setPageSize(pagination.pageSize);
          }}
          scroll={{ x: "max-content" }}
          size="middle"
        />
      </Spin>

      {/* NEW MODAL - passes entire attrition object */}
      <AttritionHistoryDetailsModal
        visible={isDetailsModalVisible}
        onClose={() => {
          setIsDetailsModalVisible(false);
          setSelectedAttrition(null);
        }}
        attrition={selectedAttrition}
        isLoading={false}
      />
    </div>
  );
};

export default AttritionHistory;
