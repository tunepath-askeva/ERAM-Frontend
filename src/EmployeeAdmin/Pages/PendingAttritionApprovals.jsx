import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Badge,
  Card,
  Typography,
  Spin,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useGetPendingAttritionApprovalsQuery } from "../../Slices/Recruiter/RecruiterApis";
import AttritionDetailsModal from "../Components/AttritionDetailsModal";

const { Title, Text } = Typography;

const PendingAttritionApprovals = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  const {
    data: approvalsResponse,
    isLoading,
    error,
    refetch,
  } = useGetPendingAttritionApprovalsQuery({
    page,
    pageSize,
  });

  const approvals = approvalsResponse?.data || [];
  const total = approvalsResponse?.total || 0;

  const handleViewDetails = (employeeId) => {
    setSelectedEmployeeId(employeeId);
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
      title: "ERAM ID",
      dataIndex: ["employee", "employmentDetails", "eramId"],
      key: "eramId",
      width: 120,
      render: (text) => text || "-",
    },
    {
      title: "Unique Code",
      dataIndex: ["employee", "uniqueCode"],
      key: "uniqueCode",
      width: 150,
    },
    {
      title: "Attrition Type",
      dataIndex: "attritionType",
      key: "attritionType",
      width: 200,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Initiated By",
      dataIndex: ["initiatedBy", "fullName"],
      key: "initiatedBy",
      width: 150,
    },
    {
      title: "Initiated On",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View & Approve/Reject">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record.employee._id)}
              style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
            >
              Review
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "red" }}>
          Error loading pending approvals: {error?.data?.message || error.message}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ marginBottom: "24px" }}>
        <Space direction="vertical" style={{ width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
              Pending Attrition Approvals
            </Title>
            <Badge count={total} style={{ backgroundColor: "#da2c46" }} />
          </div>
          <Text type="secondary">
            Review and approve/reject attrition requests that require your approval
          </Text>
        </Space>
      </Card>

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={approvals}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} pending approval(s)`,
            pageSizeOptions: ["10", "20", "50"],
          }}
          onChange={(pagination) => {
            setPage(pagination.current);
            setPageSize(pagination.pageSize);
          }}
          scroll={{ x: "max-content" }}
        />
      </Spin>

      <AttritionDetailsModal
        visible={isDetailsModalVisible}
        employeeId={selectedEmployeeId}
        onClose={() => {
          setIsDetailsModalVisible(false);
          setSelectedEmployeeId(null);
        }}
        onRefresh={refetch}
      />
    </div>
  );
};

export default PendingAttritionApprovals;