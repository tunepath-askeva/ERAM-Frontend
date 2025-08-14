import React from "react";
import { Table, Button, Space, Card, Typography, Tag, Spin, Alert } from "antd";
import {
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetEmployeeAdminDocumentsQuery } from "../../Slices/Employee/EmployeeApis";

const { Title } = Typography;

const EmployeeAdminDocuments = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetEmployeeAdminDocumentsQuery();

  const handleViewDocument = (id, email) => {
    navigate(`/employee-admin/documents/${id}`, { 
      state: { employeeEmail: email } 
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
          <span style={{ fontSize: "12px", wordBreak: "break-all" }}>{email}</span>
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
      render: (title) => <Tag color="green">{title}</Tag>,
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
          padding: "16px",
        }}
      >
        <Spin size="large" />
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

  return (
    <div style={{ padding: "8px 16px" }}>
      <Card 
        size="small"
        style={{ 
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <Title 
            level={2} 
            style={{ 
              color: "#da2c46", 
              marginBottom: "4px",
              fontSize: "clamp(18px, 4vw, 24px)"
            }}
          >
            Employee Admin Documents
          </Title>
          <p style={{ 
            color: "#666", 
            margin: 0,
            fontSize: "clamp(12px, 2.5vw, 14px)"
          }}>
            Manage and view employee documentation and details
          </p>
        </div>

        <Table
          columns={columns}
          dataSource={employees}
          rowKey="_id"
          scroll={{ 
            x: 800,
            scrollToFirstRowOnChange: true 
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: window.innerWidth > 768,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} employees`,
            size: "small",
            responsive: true,
            simple: window.innerWidth < 576,
          }}
          size="small"
          style={{
            "--ant-primary-color": "#da2c46",
          }}
          rowHoverColor="#f5f5f5"
          rowClassName={(record, index) => 
            index % 2 === 0 ? "even-row" : "odd-row"
          }
        />

        {employees.length === 0 && !isLoading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#666",
            }}
          >
            <div style={{ fontSize: "16px", marginBottom: "8px" }}>
              No employee documents found.
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>
              Employee documents will appear here once uploaded.
            </div>
          </div>
        )}
      </Card>

      <style jsx>{`
        @media (max-width: 576px) {
          .ant-table-thead > tr > th {
            padding: 8px 4px !important;
            font-size: 12px !important;
          }
          .ant-table-tbody > tr > td {
            padding: 8px 4px !important;
            font-size: 12px !important;
          }
          .ant-btn {
            padding: 4px 8px !important;
            font-size: 12px !important;
          }
          .ant-tag {
            font-size: 10px !important;
            padding: 0 4px !important;
          }
        }
        
        @media (max-width: 768px) {
          .ant-table-thead > tr > th {
            padding: 8px 6px !important;
          }
          .ant-table-tbody > tr > td {
            padding: 8px 6px !important;
          }
        }

        .even-row {
          background-color: #fafafa;
        }
        
        .odd-row {
          background-color: #ffffff;
        }
      `}</style>
    </div>
  );
};

export default EmployeeAdminDocuments;