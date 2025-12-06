import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Descriptions,
  Button,
  Space,
  Typography,
  Tag,
  Spin,
  Alert,
  Row,
  Col,
  Divider,
  Table,
  Badge,
  Tooltip,
  Empty,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  NotificationOutlined,
} from "@ant-design/icons";
import {
  useGetEmployeeAdminDocumentByIdQuery,
  useNotifyEmployeeMutation,
} from "../../Slices/Employee/EmployeeApis";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { TextArea } = Input;

const EmployeeDocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, isLoading, error } = useGetEmployeeAdminDocumentByIdQuery(id);
  const [notifyEmployee, { isLoading: isNotifying }] =
    useNotifyEmployeeMutation();

  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  // Modal state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Get employee email from location state or from API data
  const employeeEmail =
    location.state?.employeeEmail || data?.details?.user?.email;

  const handleBack = () => {
    navigate("/employee-admin/documents");
  };

  const showNotificationModal = () => {
    form.setFieldsValue({
      email: employeeEmail,
      documentTitle: "",
      description: "",
    });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmitNotification = async (values) => {
    try {
      await notifyEmployee({
        email: values.email,
        title: values.documentTitle,
        description: values.description,
      }).unwrap();

      message.success("Notification sent successfully!");
      setIsModalVisible(false);
      form.resetFields();
    } catch (err) {
      console.error("Notification error:", err);
      message.error(
        err.data?.message || "Failed to send notification. Please try again."
      );
    }
  };

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
          description="Failed to fetch employee document details. Please try again later."
          type="error"
          showIcon
          action={<Button onClick={handleBack}>Go Back</Button>}
        />
      </div>
    );
  }

  const employee = data?.details;

  if (!employee) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Not Found"
          description="Employee document not found."
          type="warning"
          showIcon
          action={<Button onClick={handleBack}>Go Back</Button>}
        />
      </div>
    );
  }

  const {
    user,
    workOrder,
    documents,
    addedAt,
    createdAt,
    updatedAt,
    branchId,
  } = employee;

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "No expiry date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to get status display
  const getStatusDisplay = (status, expiryDate) => {
    if (status === "active") {
      if (expiryDate) {
        const isExpiringSoon =
          new Date(expiryDate) <=
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const isExpired = new Date(expiryDate) < new Date();

        if (isExpired) {
          return {
            color: "error",
            icon: <ExclamationCircleOutlined />,
            text: "Expired",
          };
        } else if (isExpiringSoon) {
          return {
            color: "warning",
            icon: <ClockCircleOutlined />,
            text: "Expiring Soon",
          };
        }
      }
      return {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Active",
      };
    }
    return { color: "default", icon: null, text: status };
  };

  const expiredDocs = documents?.filter(
    (doc) => doc.expiryDate && new Date(doc.expiryDate) < new Date()
  );

  const expiringSoonDocs = documents?.filter(
    (doc) =>
      doc.expiryDate &&
      new Date(doc.expiryDate) <=
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
      new Date(doc.expiryDate) > new Date()
  );

  // Documents table columns
  const documentColumns = [
    {
      title: "Document",
      dataIndex: "documentName",
      key: "documentName",
      render: (name, record) => (
        <div>
          <Space>
            <FileTextOutlined style={{ color: "#da2c46" }} />
            <span
              style={{
                fontWeight: "500",
                fontSize: "clamp(12px, 2.5vw, 14px)",
              }}
            >
              {name}
            </span>
          </Space>
          <div
            style={{
              fontSize: "11px",
              color: "#999",
              marginTop: "2px",
              display: "block",
            }}
          >
            {record.fileName}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      responsive: ["md"],
      render: (status, record) => {
        const statusDisplay = getStatusDisplay(status, record.expiryDate);
        return (
          <Badge
            status={statusDisplay.color}
            text={
              <Space size={4}>
                {statusDisplay.icon}
                <span style={{ fontSize: "12px" }}>{statusDisplay.text}</span>
              </Space>
            }
          />
        );
      },
    },
    {
      title: "Dates",
      key: "dates",
      responsive: ["lg"],
      render: (_, record) => (
        <div style={{ fontSize: "12px" }}>
          <div style={{ marginBottom: "4px" }}>
            <CalendarOutlined style={{ color: "#666", marginRight: "4px" }} />
            {formatDate(record.uploadedAt)}
          </div>
          <div
            style={{
              color:
                record.expiryDate && new Date(record.expiryDate) < new Date()
                  ? "#ff4d4f"
                  : "inherit",
            }}
          >
            Exp: {formatDate(record.expiryDate)}
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Tooltip title="View Document">
            {hasPermission("view-employee-documents") && (
              <Button
                type="primary"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => window.open(record.fileUrl, "_blank")}
                style={{
                  backgroundColor: "#da2c46",
                  borderColor: "#da2c46",
                  fontSize: "12px",
                }}
              />
            )}
          </Tooltip>
          <Tooltip title="Download">
            {hasPermission("download-employee-documents") && (
              <Button
                icon={<DownloadOutlined />}
                size="small"
                style={{ fontSize: "12px" }}
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = record.fileUrl;
                  link.download = record.fileName;
                  link.click();
                }}
              />
            )}
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "8px 16px" }}>
      {/* Header */}
      <Card
        size="small"
        style={{
          marginBottom: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <Row
          align="middle"
          justify="space-between"
          gutter={[16, 16]}
          style={{ flexWrap: "wrap" }}
        >
          <Col>
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={handleBack}
                size="small"
                style={{
                  borderColor: "#da2c46",
                  color: "#da2c46",
                }}
              >
                Back
              </Button>
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#da2c46",
                  fontSize: "clamp(16px, 4vw, 24px)",
                }}
              >
                Employee Document Details
              </Title>
            </Space>
          </Col>
          <Col>
            {hasPermission("notify-employee-documents") && (
              <Button
                type="primary"
                icon={<NotificationOutlined />}
                onClick={showNotificationModal}
                style={{
                  backgroundColor: "#da2c46",
                  borderColor: "#da2c46",
                }}
              >
                Notify Employee
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {(expiredDocs.length > 0 || expiringSoonDocs.length > 0) && (
        <>
          {expiredDocs.length > 0 && (
            <Alert
              message="Some documents have expired!"
              description={
                <div>
                  <div style={{ marginBottom: 4 }}>
                    Please notify the employee to update these expired
                    documents:
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {expiredDocs.map((doc) => (
                      <li key={doc._id} style={{ color: "#ff4d4f" }}>
                        {doc.documentName} (Expired on{" "}
                        {formatDate(doc.expiryDate)})
                      </li>
                    ))}
                  </ul>
                </div>
              }
              type="error"
              showIcon
              style={{ marginBottom: 12 }}
              action={
                <Button
                  size="small"
                  type="primary"
                  onClick={showNotificationModal}
                  style={{
                    backgroundColor: "#da2c46",
                    borderColor: "#da2c46",
                  }}
                >
                  Notify
                </Button>
              }
            />
          )}
          {expiringSoonDocs.length > 0 && (
            <Alert
              message="Some documents are expiring soon!"
              description={
                <div>
                  <div style={{ marginBottom: 4 }}>
                    Please notify the employee to renew these documents:
                  </div>
                  <ul style={{ paddingLeft: 18, margin: 0 }}>
                    {expiringSoonDocs.map((doc) => (
                      <li key={doc._id} style={{ color: "#faad14" }}>
                        {doc.documentName} (Expires on{" "}
                        {formatDate(doc.expiryDate)})
                      </li>
                    ))}
                  </ul>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 12 }}
              action={
                <Button
                  size="small"
                  type="primary"
                  onClick={showNotificationModal}
                  style={{
                    backgroundColor: "#da2c46",
                    borderColor: "#da2c46",
                  }}
                >
                  Notify
                </Button>
              }
            />
          )}
        </>
      )}

      {/* Documents Section */}
      <Card
        size="small"
        style={{
          marginTop: "16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        title={
          <Space>
            <FileTextOutlined style={{ color: "#da2c46" }} />
            <span style={{ fontSize: "clamp(14px, 3vw, 16px)" }}>
              Documents ({documents?.length || 0})
            </span>
          </Space>
        }
        extra={
          <Badge
            count={
              documents?.filter((doc) => doc.status === "active").length || 0
            }
            showZero
            style={{ backgroundColor: "#da2c46" }}
          />
        }
      >
        {documents && documents.length > 0 ? (
          <Table
            columns={documentColumns}
            dataSource={documents}
            rowKey="_id"
            pagination={false}
            scroll={{ x: 600 }}
            size="small"
          />
        ) : (
          <Empty
            description="No documents uploaded"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ margin: "20px 0" }}
          />
        )}
      </Card>

      {/* Notification Modal */}
      <Modal
        title={
          <Space>
            <NotificationOutlined style={{ color: "#da2c46" }} />
            Send Notification to Employee
          </Space>
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        destroyOnClose={true}
        width={window.innerWidth < 768 ? "95%" : 600}
        style={{ top: window.innerWidth < 768 ? 20 : 50 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitNotification}
          size="medium"
        >
          <Form.Item
            name="email"
            label="Employee Email"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </Form.Item>

          <Form.Item
            name="documentTitle"
            label="Document Title/Subject"
            rules={[
              { required: true, message: "Document title is required" },
              { min: 3, message: "Title must be at least 3 characters" },
            ]}
          >
            <Input
              prefix={<FileTextOutlined />}
              placeholder="Enter document title or subject"
              maxLength={100}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Message/Description"
            rules={[
              { required: true, message: "Message is required" },
              { min: 10, message: "Message must be at least 10 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Type your message to the employee here..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleModalCancel}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isNotifying}
                style={{
                  backgroundColor: "#da2c46",
                  borderColor: "#da2c46",
                }}
              >
                Send Notification
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style jsx>{`
        @media (max-width: 576px) {
          .ant-table-thead > tr > th {
            padding: 6px 4px !important;
            font-size: 11px !important;
          }
          .ant-table-tbody > tr > td {
            padding: 6px 4px !important;
            font-size: 11px !important;
          }
          .ant-btn {
            padding: 2px 6px !important;
            font-size: 11px !important;
            height: auto !important;
          }
          .ant-card-head-title {
            font-size: 14px !important;
          }
          .ant-space-item {
            margin-bottom: 4px;
          }
        }

        @media (max-width: 768px) {
          .ant-modal .ant-modal-body {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EmployeeDocumentDetail;
