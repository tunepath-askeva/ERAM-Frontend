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
  StopOutlined,
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
  CheckCircleOutlined,
} from "@ant-design/icons";
import RecruiterForm from "../Components/RecruiterForm";

import {
  useGetRecruitersQuery,
  useDisableRecruiterStatusMutation,
} from "../../Slices/Admin/AdminApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AdminRecruiter = () => {
  const [recruiterModalVisible, setRecruiterModalVisible] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [recruiterToToggle, setRecruiterToToggle] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRecruiterId, setSelectedRecruiterId] = useState(null);

  // API integration
  const {
    data: recruitersResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetRecruitersQuery();

  const [toggleRecruiterStatus, { isLoading: isToggling }] =
    useDisableRecruiterStatusMutation();

  const recruiters = recruitersResponse?.recruiters || recruitersResponse || [];

  // Get selected recruiter data from the existing list
  const selectedRecruiterData = recruiters.find(
    (recruiter) => recruiter._id === selectedRecruiterId
  );

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

  const showDisableModal = (recruiter) => {
    setRecruiterToToggle(recruiter);
    setDisableModalVisible(true);
  };

  const handleDisableCancel = () => {
    setDisableModalVisible(false);
    setRecruiterToToggle(null);
  };

  const handleToggleStatus = async () => {
    if (!recruiterToToggle) return;

    try {
      const newStatus =
        recruiterToToggle.accountStatus === "active" ? "inActive" : "active";

      await toggleRecruiterStatus({
        recruiterId: recruiterToToggle._id,
        accountStatus: newStatus,
      }).unwrap();

      const action = newStatus === "active" ? "enabled" : "disabled";
      message.success(
        `Recruiter "${getRecruiterDisplayName(
          recruiterToToggle
        )}" ${action} successfully`
      );

      setDisableModalVisible(false);
      setRecruiterToToggle(null);
      refetch();
    } catch (error) {
      message.error(
        error?.data?.message ||
          `Failed to ${
            recruiterToToggle.accountStatus === "active" ? "disable" : "enable"
          } recruiter`
      );
      console.error("Toggle status error:", error);
    }
  };

  const showCreateModal = () => {
    setEditingRecruiter(null);
    setRecruiterModalVisible(true);
  };

  const showEditModal = (recruiter) => {
    setEditingRecruiter(recruiter);
    setRecruiterModalVisible(true);
  };

  const handleRecruiterModalClose = () => {
    setRecruiterModalVisible(false);
    setEditingRecruiter(null);
  };

  const handleRecruiterSuccess = (newRecruiter) => {
    refetch();
    const action = editingRecruiter ? "updated" : "created";
    message.success(`Recruiter ${action} successfully!`);
  };

  const handleViewRecruiter = (recruiterId) => {
    setSelectedRecruiterId(recruiterId);
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedRecruiterId(null);
  };

  // Helper function to get recruiter display name
  const getRecruiterDisplayName = (recruiter) => {
    return recruiter?.fullName || recruiter?.companyName || "Unknown Recruiter";
  };

  const getRecruiterLocation = (recruiter) => {
    return recruiter?.specialization || recruiter?.location || "Not specified";
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
              background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
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
                            color: "#da2c46",
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
                      <Tooltip
                        title={
                          recruiter.accountStatus === "active"
                            ? "Disable Recruiter"
                            : "Enable Recruiter"
                        }
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={
                            recruiter.accountStatus === "active" ? (
                              <StopOutlined />
                            ) : (
                              <CheckCircleOutlined />
                            )
                          }
                          onClick={() => showDisableModal(recruiter)}
                          style={{
                            color:
                              recruiter.accountStatus === "active"
                                ? "#ff4d4f"
                                : "#52c41a",
                          }}
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

      {/* Recruiter Form Modal - Used for both Create and Edit */}
      <RecruiterForm
        open={recruiterModalVisible}
        onCancel={handleRecruiterModalClose}
        onSuccess={handleRecruiterSuccess}
        mode={editingRecruiter ? "edit" : "add"}
        title={editingRecruiter ? "Edit Recruiter" : "Add New Recruiter"}
        initialValues={editingRecruiter}
        recruiterId={editingRecruiter?._id}
      />

      {/* View Recruiter Modal - Using separate component */}
      {/* <RecruiterView
        open={viewModalVisible}
        onClose={handleViewModalClose}
        recruiterData={selectedRecruiterData}
      /> */}

      {/* Disable/Enable Confirmation Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color:
                recruiterToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>
              {recruiterToToggle?.accountStatus === "active"
                ? "Disable"
                : "Enable"}{" "}
              Recruiter
            </span>
          </div>
        }
        open={disableModalVisible}
        onCancel={handleDisableCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleDisableCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger={recruiterToToggle?.accountStatus === "active"}
            onClick={handleToggleStatus}
            loading={isToggling}
            size="large"
            style={{
              background:
                recruiterToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
              borderColor:
                recruiterToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
          >
            {recruiterToToggle?.accountStatus === "active"
              ? "Disable"
              : "Enable"}
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <Text>
            Are you sure you want to{" "}
            {recruiterToToggle?.accountStatus === "active"
              ? "disable"
              : "enable"}{" "}
            the recruiter{" "}
            <Text strong>{getRecruiterDisplayName(recruiterToToggle)}</Text>?
          </Text>
          {recruiterToToggle?.accountStatus === "active" && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Disabling will prevent this recruiter from accessing the system.
              </Text>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AdminRecruiter;
