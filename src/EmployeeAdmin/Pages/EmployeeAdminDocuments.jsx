import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Card,
  Typography,
  Tag,
  Spin,
  Alert,
  Input,
} from "antd";
import {
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetEmployeeAdminDocumentsQuery } from "../../Slices/Employee/EmployeeApis";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title } = Typography;

const EmployeeAdminDocuments = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 2500);
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { data, isLoading, error } = useGetEmployeeAdminDocumentsQuery({
    page,
    limit: pageSize,
    search: debouncedSearch,
  });

  const handleViewDocument = (id, email) => {
    navigate(`/employee-admin/documents/${id}`, {
      state: { employeeEmail: email },
    });
  };

  const columns = [
    {
      title: "Employee ID",
      dataIndex: ["user", "employmentDetails", "eramId"],
      key: "eramId",
      width: 120,
      responsive: ["md"],
      render: (eramId) => (
        <Tag color="#da2c46" style={{ fontWeight: "bold" }}>
          {eramId}
        </Tag>
      ),
    },
    {
      title: "Full Name",
      dataIndex: ["user", "fullName"],
      key: "fullName",
      render: (name) => (
        <Space>
          <UserOutlined style={{ color: "#da2c46" }} />
          <span style={{ fontWeight: "500" }}>{name}</span>
        </Space>
      ),
    },
    {
      title: "Job Title",
      dataIndex: ["user", "employmentDetails", "assignedJobTitle"],
      key: "jobTitle",
      responsive: ["lg"],
      render: (title) => <Tag color="blue">{title}</Tag>,
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      responsive: ["sm"],
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: "#da2c46" }} />
          <span style={{ fontSize: "12px", wordBreak: "break-all" }}>
            {email}
          </span>
        </Space>
      ),
    },
    {
      title: "Phone",
      dataIndex: ["user", "phone"],
      key: "phone",
      responsive: ["xl"],
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: "#da2c46" }} />
          <span>{phone}</span>
        </Space>
      ),
    },
    {
      title: "Work Order",
      dataIndex: ["workOrder", "title"],
      key: "workOrder",
      responsive: ["lg"],
      render: (title, record) => {
        const isWorkOrderEmployee = !!record?.workOrder?.title;

        return (
          <Tag color={isWorkOrderEmployee ? "green" : "blue"}>
            {isWorkOrderEmployee ? title : "Added Employee"}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDocument(record._id, record.user?.email)}
          style={{
            backgroundColor: "#da2c46",
            borderColor: "#da2c46",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#c42240";
            e.target.style.borderColor = "#c42240";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "#da2c46";
            e.target.style.borderColor = "#da2c46";
          }}
        >
          View
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Error"
          description="Failed to fetch employee documents. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const employees = data?.data || [];
  const total = data?.total || 0;

  return (
    <div style={{ padding: "8px 16px" }}>
      <Card size="small" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Title level={2} style={{ color: "#da2c46", marginBottom: "4px" }}>
              Employee Admin Documents
            </Title>
            <p style={{ color: "#666", margin: 0 }}>
              Manage and view employee documentation and details
            </p>
          </div>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search by ERAM ID"
            allowClear
            style={{ width: 250, height: 35 }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={employees}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (p, size) => {
              setPage(p);
              setPageSize(size);
            },
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} employees`,
          }}
          scroll={{ x: "max-content" }}
        />

        {employees.length === 0 && !isLoading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            No employee documents found.
          </div>
        )}
      </Card>
    </div>
  );
};

export default EmployeeAdminDocuments;
