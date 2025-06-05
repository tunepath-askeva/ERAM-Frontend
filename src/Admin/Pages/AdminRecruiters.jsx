import React, { useState } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Empty,
  Space,
  Badge,
  Modal,
  message,
  Divider,
  Descriptions,
  List,
  Spin,
  Input,
  Form,
  Select,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AdminRecruiter = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recruiterToDelete, setRecruiterToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(null);
  const [form] = Form.useForm();

  // Mock data - replace with your actual API calls
  const mockRecruiters = [
    {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      status: "active",
      role: "Senior Recruiter",
      createdAt: "2023-05-15T10:00:00Z",
    },
    {
      _id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1987654321",
      status: "active",
      role: "Recruiter",
      createdAt: "2023-06-20T14:30:00Z",
    },
    {
      _id: "3",
      name: "Mike Johnson",
      email: "mike@example.com",
      phone: "+1122334455",
      status: "inactive",
      role: "Talent Sourcer",
      createdAt: "2023-07-10T09:15:00Z",
    },
  ];

  const [recruiters, setRecruiters] = useState(mockRecruiters);
  const [isLoading, setIsLoading] = useState(false);

  const showDeleteModal = (recruiter) => {
    setRecruiterToDelete(recruiter);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setRecruiterToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!recruiterToDelete) return;

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRecruiters(recruiters.filter((r) => r._id !== recruiterToDelete._id));
      message.success(
        `Recruiter "${recruiterToDelete.name}" deleted successfully`
      );
      setDeleteModalVisible(false);
      setRecruiterToDelete(null);
    } catch (error) {
      message.error("Failed to delete recruiter");
      console.error("Delete error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showCreateModal = () => {
    form.resetFields();
    setEditingRecruiter(null);
    setIsModalVisible(true);
  };

  const showEditModal = (recruiter) => {
    form.setFieldsValue(recruiter);
    setEditingRecruiter(recruiter);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingRecruiter(null);
    form.resetFields();
  };

  const handleViewRecruiter = (recruiterId) => {
    setSelectedRecruiterId(recruiterId);
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedRecruiterId(null);
  };

  const onFinish = async (values) => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (editingRecruiter) {
        // Update existing recruiter
        setRecruiters(
          recruiters.map((r) =>
            r._id === editingRecruiter._id ? { ...r, ...values } : r
          )
        );
        message.success(`Recruiter "${values.name}" updated successfully`);
      } else {
        // Add new recruiter
        const newRecruiter = {
          ...values,
          _id: `${recruiters.length + 1}`,
          createdAt: new Date().toISOString(),
        };
        setRecruiters([...recruiters, newRecruiter]);
        message.success(`Recruiter "${values.name}" added successfully`);
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("Failed to save recruiter");
      console.error("Save error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        style={{
          padding: "16px",
          minHeight: "100vh",
        }}
      >
        <div className="recruiter-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined
              size={24}
              style={{ marginRight: "8px", color: "#2c3e50" }}
            />
            <Title
              level={2}
              className="recruiter-title"
              style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}
            >
              Recruiter Management
            </Title>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
            className="recruiter-button"
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              width: "100%",
              height: "44px",
              marginTop: "16px",
            }}
            block
          >
            Add New Recruiter
          </Button>
        </div>

        {isLoading ? (
          <Card loading style={{ borderRadius: "16px" }} />
        ) : recruiters?.length > 0 ? (
          <Row
            gutter={[16, 16]}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {recruiters.map((recruiter) => (
              <div key={recruiter._id}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <UserOutlined
                          style={{
                            color: "#1890ff",
                            marginRight: 8,
                            fontSize: "16px",
                            flexShrink: 0,
                          }}
                        />
                        <Text
                          strong
                          style={{
                            fontSize: "14px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={recruiter.name}
                        >
                          {recruiter.name}
                        </Text>
                      </div>
                      <Tag
                        color={recruiter.status === "active" ? "green" : "red"}
                      >
                        {recruiter.status}
                      </Tag>
                    </div>
                  }
                  extra={
                    <Space size="small">
                      <Tooltip title="View Details">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewRecruiter(recruiter._id)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit Recruiter">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => showEditModal(recruiter)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete Recruiter">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteModal(recruiter)}
                        />
                      </Tooltip>
                    </Space>
                  }
                  bodyStyle={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <MailOutlined
                          style={{ marginRight: 8, color: "#666" }}
                        />
                        <Text>{recruiter.email}</Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <PhoneOutlined
                          style={{ marginRight: 8, color: "#666" }}
                        />
                        <Text>{recruiter.phone}</Text>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <TeamOutlined
                          style={{ marginRight: 8, color: "#666" }}
                        />
                        <Text>{recruiter.role}</Text>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: 12,
                      marginTop: "auto",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "10px",
                        }}
                      >
                        Created:{" "}
                        {new Date(recruiter.createdAt).toLocaleDateString(
                          undefined,
                          {
                            year: "2-digit",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </Text>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "10px",
                        }}
                      >
                        ID: {recruiter._id.slice(-6)}
                      </Text>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </Row>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              marginTop: "16px",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ textAlign: "center" }}>
                  <Text
                    style={{
                      fontSize: "14px",
                      color: "#7f8c8d",
                    }}
                  >
                    No recruiters added yet
                  </Text>
                  <br />
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    Add your first recruiter to get started
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </div>

      {/* View Recruiter Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            Recruiter Details
          </div>
        }
        open={viewModalVisible}
        onCancel={handleViewModalClose}
        footer={[
          <Button
            key="close"
            type="primary"
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
            }}
            onClick={handleViewModalClose}
          >
            Close
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 600 }}
        centered
        destroyOnClose
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Loading recruiter details...</Text>
            </div>
          </div>
        ) : (
          <div>
            {selectedRecruiterId && (
              <>
                <Card
                  title="Basic Information"
                  style={{ marginBottom: 16 }}
                  size="small"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">
                      <Text strong>
                        {
                          recruiters.find((r) => r._id === selectedRecruiterId)
                            ?.name
                        }
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                      <Text>
                        {
                          recruiters.find((r) => r._id === selectedRecruiterId)
                            ?.email
                        }
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone">
                      <Text>
                        {
                          recruiters.find((r) => r._id === selectedRecruiterId)
                            ?.phone
                        }
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Role">
                      <Text>
                        {
                          recruiters.find((r) => r._id === selectedRecruiterId)
                            ?.role
                        }
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag
                        color={
                          recruiters.find((r) => r._id === selectedRecruiterId)
                            ?.status === "active"
                            ? "green"
                            : "red"
                        }
                      >
                        {
                          recruiters.find((r) => r._id === selectedRecruiterId)
                            ?.status
                        }
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="Additional Information" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Created At">
                      <Text>
                        {new Date(
                          recruiters.find((r) => r._id === selectedRecruiterId)
                            ?.createdAt || Date.now()
                        ).toLocaleString()}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Recruiter ID">
                      <Text>{selectedRecruiterId}</Text>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit Recruiter Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
            {editingRecruiter ? "Edit Recruiter" : "Add New Recruiter"}
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={handleModalClose}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={() => form.submit()}
          >
            {editingRecruiter ? "Update Recruiter" : "Add Recruiter"}
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 600 }}
        centered
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            status: "active",
          }}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter the recruiter's name" },
            ]}
          >
            <Input placeholder="Enter recruiter's full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter the recruiter's email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="Enter recruiter's email"
              prefix={<MailOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                required: true,
                message: "Please enter the recruiter's phone number",
              },
            ]}
          >
            <Input
              placeholder="Enter recruiter's phone number"
              prefix={<PhoneOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[
              { required: true, message: "Please select the recruiter's role" },
            ]}
          >
            <Select placeholder="Select role">
              <Option value="Recruiter">Recruiter</Option>
              <Option value="Senior Recruiter">Senior Recruiter</Option>
              <Option value="Talent Sourcer">Talent Sourcer</Option>
              <Option value="Recruiting Manager">Recruiting Manager</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[
              {
                required: true,
                message: "Please select the recruiter's status",
              },
            ]}
          >
            <Select placeholder="Select status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#ff4d4f" }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>Delete Recruiter</span>
          </div>
        }
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleDeleteCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            loading={isLoading}
            onClick={handleDeleteConfirm}
            size="large"
            icon={<DeleteOutlined />}
          >
            Delete Recruiter
          </Button>,
        ]}
        maskClosable={false}
        destroyOnClose
      >
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              background: "#fff2f0",
              border: "1px solid #ffccc7",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <WarningOutlined
              style={{ color: "#ff4d4f", fontSize: "16px", marginTop: "2px" }}
            />
            <div>
              <Text strong style={{ color: "#ff4d4f", fontSize: "13px" }}>
                This action cannot be undone!
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
                All recruiter data including associated candidates and
                interviews will be removed.
              </Text>
            </div>
          </div>

          {recruiterToDelete && (
            <div>
              <Text
                style={{
                  fontSize: "14px",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Are you sure you want to delete the following recruiter?
              </Text>

              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #e8e8e8",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <Text strong style={{ fontSize: "14px", color: "#2c3e50" }}>
                    {recruiterToDelete.name}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Email:</strong> {recruiterToDelete.email}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Role:</strong> {recruiterToDelete.role}
                  </Text>
                </div>

                <div>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Status:</strong>{" "}
                    <Tag
                      color={
                        recruiterToDelete.status === "active" ? "green" : "red"
                      }
                    >
                      {recruiterToDelete.status}
                    </Tag>
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AdminRecruiter;
