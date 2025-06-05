import React, { useState, useEffect } from "react";
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
import RecruiterForm from "../Components/RecruiterForm";
import { useGetRecruitersQuery } from "../../Slices/Admin/AdminApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AdminRecruiter = () => {
  const [recruiterModalVisible, setRecruiterModalVisible] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recruiterToDelete, setRecruiterToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(null);
  const [form] = Form.useForm();

  // API integration
  const {
    data: recruitersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRecruitersQuery();

  // Get current admin ID - replace with your actual admin ID from auth context/state
  const currentAdminId = "your-admin-id-here"; // Replace with actual admin ID

  // Transform API data to match your component's expected format
  const recruiters = recruitersResponse?.recruiters || recruitersResponse || [];

  // Handle API errors
  useEffect(() => {
    if (isError) {
      message.error(
        `Failed to load recruiters: ${
          error?.data?.message || error?.message || "Unknown error"
        }`
      );
    }
  }, [isError, error]);

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
      // TODO: Replace with actual delete API call
      // await deleteRecruiterMutation(recruiterToDelete._id);

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success(
        `Recruiter "${
          recruiterToDelete.fullName || recruiterToDelete.companyName
        }" deleted successfully`
      );
      setDeleteModalVisible(false);
      setRecruiterToDelete(null);

      // Refetch data after successful deletion
      refetch();
    } catch (error) {
      message.error("Failed to delete recruiter");
      console.error("Delete error:", error);
    }
  };

  const showCreateModal = () => {
    setEditingRecruiter(null);
    setRecruiterModalVisible(true);
  };

  const handleRecruiterModalClose = () => {
    setRecruiterModalVisible(false);
    setEditingRecruiter(null);
  };

  const handleRecruiterSuccess = (newRecruiter) => {
    // Refetch data after successful creation
    refetch();
    message.success("Recruiter created successfully!");
  };

  const handleViewRecruiter = (recruiterId) => {
    setSelectedRecruiterId(recruiterId);
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedRecruiterId(null);
  };

  const showEditModal = (recruiter) => {
    // Map API response fields to form fields
    const formValues = {
      fullName: recruiter.fullName,
      email: recruiter.email,
      phone: recruiter.phone,
      specialization: recruiter.specialization,
      experienceYears: recruiter.experienceYears,
      accountStatus: recruiter.accountStatus,
    };

    form.setFieldsValue(formValues);
    setEditingRecruiter(recruiter);
  };

  const onFinish = async (values) => {
    try {
      // TODO: Replace with actual update API call
      // await updateRecruiterMutation({ id: editingRecruiter._id, ...values });

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      message.success(`Recruiter "${values.fullName}" updated successfully`);
      setEditingRecruiter(null);
      form.resetFields();

      // Refetch data after successful update
      refetch();
    } catch (error) {
      message.error("Failed to update recruiter");
      console.error("Update error:", error);
    }
  };

  // Helper function to get recruiter display name
  const getRecruiterDisplayName = (recruiter) => {
    return recruiter.fullName || recruiter.companyName || "Unknown Recruiter";
  };

  // Helper function to get recruiter location
  const getRecruiterLocation = (recruiter) => {
    return recruiter.location || recruiter.specialization || "Not specified";
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
                          title={getRecruiterDisplayName(recruiter)}
                        >
                          {getRecruiterDisplayName(recruiter)}
                        </Text>
                      </div>
                      <Tag
                        color={
                          recruiter.accountStatus === "active" ? "green" : "red"
                        }
                      >
                        {recruiter.accountStatus}
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <TeamOutlined
                          style={{ marginRight: 8, color: "#666" }}
                        />
                        <Text>{getRecruiterLocation(recruiter)}</Text>
                      </div>
                      {recruiter.experienceYears && (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <Badge
                            count={`${recruiter.experienceYears}y exp`}
                            style={{ backgroundColor: "#52c41a" }}
                          />
                        </div>
                      )}
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
                        {new Date(
                          recruiter.createdAt || Date.now()
                        ).toLocaleDateString(undefined, {
                          year: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
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
                    {isError
                      ? "Failed to load recruiters"
                      : "No recruiters added yet"}
                  </Text>
                  <br />
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    {isError
                      ? "Please try refreshing the page"
                      : "Add your first recruiter to get started"}
                  </Text>
                  {isError && (
                    <div style={{ marginTop: 8 }}>
                      <Button type="link" onClick={refetch}>
                        Retry
                      </Button>
                    </div>
                  )}
                </div>
              }
            />
          </Card>
        )}
      </div>

      {/* Recruiter Form Modal */}
      <RecruiterForm
        open={recruiterModalVisible}
        onCancel={handleRecruiterModalClose}
        onSuccess={handleRecruiterSuccess}
        adminId={currentAdminId}
        title="Add New Recruiter"
      />

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
        {selectedRecruiterId && (
          <>
            <Card
              title="Recruiter Information"
              style={{ marginBottom: 16 }}
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Full Name">
                  <Text strong>
                    {
                      recruiters.find((r) => r._id === selectedRecruiterId)
                        ?.fullName
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
                <Descriptions.Item label="Specialization">
                  <Text>
                    {
                      recruiters.find((r) => r._id === selectedRecruiterId)
                        ?.specialization
                    }
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Experience">
                  <Text>
                    {
                      recruiters.find((r) => r._id === selectedRecruiterId)
                        ?.experienceYears
                    }{" "}
                    years
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      recruiters.find((r) => r._id === selectedRecruiterId)
                        ?.accountStatus === "active"
                        ? "green"
                        : "red"
                    }
                  >
                    {
                      recruiters.find((r) => r._id === selectedRecruiterId)
                        ?.accountStatus
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
                <Descriptions.Item label="Role">
                  <Text>
                    {
                      recruiters.find((r) => r._id === selectedRecruiterId)
                        ?.role
                    }
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </>
        )}
      </Modal>

      {/* Edit Modal */}
      {editingRecruiter && (
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center" }}>
              <UserOutlined style={{ marginRight: 8, color: "#1890ff" }} />
              Edit Recruiter
            </div>
          }
          open={!!editingRecruiter}
          onCancel={() => setEditingRecruiter(null)}
          footer={[
            <Button key="cancel" onClick={() => setEditingRecruiter(null)}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={isLoading}
              onClick={() => form.submit()}
            >
              Update Recruiter
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
              accountStatus: "active",
            }}
          >
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[
                { required: true, message: "Please enter the full name" },
              ]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter the email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter email" prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Phone Number"
              rules={[
                {
                  required: true,
                  message: "Please enter the phone number",
                },
              ]}
            >
              <Input
                placeholder="Enter phone number"
                prefix={<PhoneOutlined />}
              />
            </Form.Item>

            <Form.Item
              name="specialization"
              label="Specialization"
              rules={[
                {
                  required: true,
                  message: "Please enter the specialization",
                },
              ]}
            >
              <Input placeholder="Enter specialization" />
            </Form.Item>

            <Form.Item
              name="experienceYears"
              label="Experience (Years)"
              rules={[
                {
                  required: true,
                  message: "Please enter experience years",
                },
              ]}
            >
              <Input type="number" placeholder="Enter experience years" />
            </Form.Item>

            <Form.Item
              name="accountStatus"
              label="Status"
              rules={[
                {
                  required: true,
                  message: "Please select the status",
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
      )}

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
                    {getRecruiterDisplayName(recruiterToDelete)}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Email:</strong> {recruiterToDelete.email}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Phone:</strong> {recruiterToDelete.phone}
                  </Text>
                </div>

                <div>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Status:</strong>{" "}
                    <Tag
                      color={
                        recruiterToDelete.accountStatus === "active"
                          ? "green"
                          : "red"
                      }
                    >
                      {recruiterToDelete.accountStatus}
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
