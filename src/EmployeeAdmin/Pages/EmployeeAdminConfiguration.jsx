import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Select,
  Tag,
  Spin,
  Empty,
  Modal,
  Divider,
  Row,
  Col,
  Tooltip,
} from "antd";
import {
  SaveOutlined,
  DeleteOutlined,
  SettingOutlined,
  UserOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CloseOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  useGetEmployeeAdminRecruitersQuery,
  useGetRequestConfigurationQuery,
  useSaveRequestConfigurationMutation,
  useDeleteRequestConfigurationMutation,
} from "../../Slices/Employee/EmployeeApis";
import { useSnackbar } from "notistack";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const REQUEST_TYPES = [
  "Leave Request",
  "Exit Reentry",
  "Travel Request",
  "Vehicle Related Request",
  "Payslip Request",
  "General Request",
  "New/Other Request",
];

const EmployeeAdminConfiguration = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [configurations, setConfigurations] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [showConfigurationForm, setShowConfigurationForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteRequestType, setDeleteRequestType] = useState(null);

  const {
    data: recruitersData,
    isLoading: isLoadingRecruiters,
    error: recruitersError,
  } = useGetEmployeeAdminRecruitersQuery();

  const {
    data: configData,
    isLoading: isLoadingConfig,
    error: configError,
    refetch: refetchConfig,
  } = useGetRequestConfigurationQuery();

  const [saveConfiguration, { isLoading: isSaving }] =
    useSaveRequestConfigurationMutation();
  const [deleteConfiguration, { isLoading: isDeleting }] =
    useDeleteRequestConfigurationMutation();

  const recruiters = recruitersData?.recruiters || [];
  const existingConfigs = configData?.configurations || [];
  const hasConfigurations = existingConfigs.length > 0;

  // Initialize configurations from API data
  useEffect(() => {
    if (configData?.configurations) {
      const configMap = {};
      configData.configurations.forEach((config) => {
        configMap[config.requestType] = config.assignedRecruiters.map(
          (r) => r._id
        );
      });
      setConfigurations(configMap);
    }
  }, [configData]);

  const handleRecruiterChange = (requestType, selectedRecruiters) => {
    setConfigurations((prev) => ({
      ...prev,
      [requestType]: selectedRecruiters || [],
    }));
  };

  const handleSave = async (requestType) => {
    if (!configurations[requestType] || configurations[requestType].length === 0) {
      enqueueSnackbar("Please select at least one recruiter", {
        variant: "warning",
      });
      return;
    }

    setLoadingStates((prev) => ({ ...prev, [requestType]: true }));

    try {
      const result = await saveConfiguration({
        requestType,
        assignedRecruiters: configurations[requestType],
      }).unwrap();

      enqueueSnackbar(
        result.message || "Configuration saved successfully",
        {
          variant: "success",
        }
      );
      refetchConfig();
      setEditingConfig(null); // Exit edit mode after saving
    } catch (error) {
      console.error("Error saving configuration:", error);
      enqueueSnackbar(
        error?.data?.message || "Failed to save configuration",
        {
          variant: "error",
        }
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [requestType]: false }));
    }
  };

  const handleEdit = (requestType) => {
    setEditingConfig(requestType);
    setShowConfigurationForm(true);
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
    // Reset to original values from API
    if (configData?.configurations) {
      const configMap = {};
      configData.configurations.forEach((config) => {
        configMap[config.requestType] = config.assignedRecruiters.map(
          (r) => r._id
        );
      });
      setConfigurations(configMap);
    }
  };

  const handleDelete = (requestType) => {
    console.log("handleDelete called with requestType:", requestType);
    setDeleteRequestType(requestType);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteRequestType) return;
    
    console.log("Delete confirmed for:", deleteRequestType);
    try {
      console.log("Deleting configuration for:", deleteRequestType);
      const result = await deleteConfiguration(deleteRequestType).unwrap();
      console.log("Delete result:", result);
      
      enqueueSnackbar(
        result.message || "Configuration deleted successfully",
        {
          variant: "success",
        }
      );
      
      // Remove from local state
      setConfigurations((prev) => {
        const newConfig = { ...prev };
        delete newConfig[deleteRequestType];
        return newConfig;
      });
      
      // Close modal and reset
      setDeleteModalVisible(false);
      setDeleteRequestType(null);
      
      // Refetch configuration data
      await refetchConfig();
    } catch (error) {
      console.error("Error deleting configuration:", error);
      console.error("Error details:", {
        status: error?.status,
        data: error?.data,
        message: error?.message,
      });
      enqueueSnackbar(
        error?.data?.message || error?.message || "Failed to delete configuration",
        {
          variant: "error",
        }
      );
    }
  };

  const handleDeleteCancel = () => {
    console.log("Delete cancelled");
    setDeleteModalVisible(false);
    setDeleteRequestType(null);
  };

  const getAssignedRecruiters = (requestType) => {
    const config = configData?.configurations?.find(
      (c) => c.requestType === requestType
    );
    return config?.assignedRecruiters || [];
  };

  const getConfigInfo = (requestType) => {
    return configData?.configurations?.find(
      (c) => c.requestType === requestType
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      title: "Request Type",
      dataIndex: "requestType",
      key: "requestType",
      width: "20%",
      render: (text) => (
        <Text strong style={{ fontSize: "15px" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Assigned Recruiters",
      dataIndex: "assignedRecruiters",
      key: "assignedRecruiters",
      width: "35%",
      render: (_, record) => {
        const assignedRecruiters = getAssignedRecruiters(record.requestType);
        const configInfo = getConfigInfo(record.requestType);
        const isEditing = editingConfig === record.requestType;

        if (isEditing || !configInfo) {
          return (
            <Select
              mode="multiple"
              placeholder="Select recruiters"
              style={{ width: "100%" }}
              value={configurations[record.requestType] || []}
              onChange={(value) =>
                handleRecruiterChange(record.requestType, value)
              }
              loading={isLoadingRecruiters}
              disabled={loadingStates[record.requestType] || false}
              optionLabelProp="label"
            >
              {recruiters.map((recruiter) => (
                <Option 
                  key={recruiter._id} 
                  value={recruiter._id}
                  label={recruiter.fullName || recruiter.email}
                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: 500 }}>
                      {recruiter.fullName || "No Name"}
                    </span>
                    <span style={{ fontSize: "12px", color: "#8c8c8c" }}>
                      {recruiter.email}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          );
        }

        return (
          <div>
            {assignedRecruiters.length > 0 ? (
              <Space wrap>
                {assignedRecruiters.map((recruiter) => (
                  <Tag
                    key={recruiter._id}
                    icon={<UserOutlined />}
                    color="blue"
                    style={{ marginBottom: "8px" }}
                  >
                    {recruiter.fullName || recruiter.email}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No recruiters assigned</Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Created By",
      key: "createdBy",
      width: "20%",
      render: (_, record) => {
        const configInfo = getConfigInfo(record.requestType);
        if (!configInfo || !configInfo.createdBy) {
          return <Text type="secondary">-</Text>;
        }
        return (
          <div>
            <Text strong style={{ display: "block" }}>
              {configInfo.createdBy.fullName || configInfo.createdBy.email}
            </Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatDate(configInfo.createdAt)}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: "25%",
      render: (_, record) => {
        const configInfo = getConfigInfo(record.requestType);
        const hasConfiguration = configInfo && configInfo.assignedRecruiters?.length > 0;
        const isEditing = editingConfig === record.requestType;
        const isLoading = loadingStates[record.requestType] || false;

        if (isEditing) {
          return (
            <Space size="small">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={() => handleSave(record.requestType)}
                loading={isLoading}
                disabled={isLoadingRecruiters}
                size="small"
              >
                Save
              </Button>
              <Button
                icon={<CloseOutlined />}
                onClick={handleCancelEdit}
                disabled={isLoading}
                size="small"
              >
                Cancel
              </Button>
            </Space>
          );
        }

        return (
          <Space size="small">
            {hasConfiguration ? (
              <>
                <Tooltip title="Edit configuration">
                  <Button
                    type="default"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record.requestType)}
                    size="small"
                  >
                    Edit
                  </Button>
                </Tooltip>
                <Tooltip title="Delete configuration">
                  <Button
                    type="default"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Delete button clicked for:", record.requestType);
                      handleDelete(record.requestType);
                    }}
                    loading={isDeleting}
                    size="small"
                  >
                    Delete
                  </Button>
                </Tooltip>
              </>
            ) : (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleEdit(record.requestType)}
                size="small"
              >
                Configure
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  const tableData = REQUEST_TYPES.map((requestType) => ({
    key: requestType,
    requestType,
  }));

  if (isLoadingRecruiters || isLoadingConfig) {
    return <SkeletonLoader />;
  }

  if (recruitersError || configError) {
    return (
      <div style={{ padding: "24px" }}>
        <Card>
          <Empty
            description={
              <Text type="danger">
                {recruitersError?.data?.message ||
                  configError?.data?.message ||
                  "Failed to load configuration data"}
              </Text>
            }
          />
        </Card>
      </div>
    );
  }

  if (recruiters.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Empty
            description={
              <div>
                <Text strong style={{ fontSize: "16px", display: "block", marginBottom: "8px" }}>
                  No Employee Admin Recruiters Found
                </Text>
                <Text type="secondary">
                  Please add recruiters with recruiter type "Employee Admin" first.
                  Only recruiters with this type can be assigned to handle requests.
                </Text>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  // Show empty state with configure button if no configurations exist
  if (!hasConfigurations && !showConfigurationForm) {
    return (
      <div style={{ padding: "24px" }}>
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
            padding: "60px 24px",
          }}
        >
          <Empty
            image={
              <div style={{ marginBottom: "24px" }}>
                <SettingOutlined
                  style={{
                    fontSize: "80px",
                    color: "#da2c46",
                    marginBottom: "16px",
                  }}
                />
              </div>
            }
            description={
              <div>
                <Title
                  level={3}
                  style={{
                    marginTop: "16px",
                    marginBottom: "12px",
                    color: "#262626",
                  }}
                >
                  No Request Configuration Found
                </Title>
                <Paragraph
                  type="secondary"
                  style={{
                    fontSize: "16px",
                    maxWidth: "600px",
                    margin: "0 auto 32px",
                    lineHeight: "1.6",
                  }}
                >
                  Configure which employee admin recruiters should handle each
                  request type. Only configured members will be able to see
                  and handle requests of the assigned types.
                </Paragraph>
              </div>
            }
          >
            <Button
              type="primary"
              size="large"
              icon={<UserAddOutlined />}
              onClick={() => setShowConfigurationForm(true)}
              style={{
                marginTop: "24px",
                height: "48px",
                padding: "0 32px",
                fontSize: "16px",
                backgroundColor: "#da2c46",
                borderColor: "#da2c46",
                boxShadow: "0 4px 12px rgba(218, 44, 70, 0.3)",
              }}
            >
              Configure Request Handlers
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "12px",
            }}
          >
            <div>
              <Title
                level={3}
                style={{
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <SettingOutlined style={{ color: "#da2c46" }} />
                Request Configuration
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: "14px",
                  display: "block",
                  marginTop: "8px",
                }}
              >
                Configure which employee admin recruiters (recruiter type:
                "Employee Admin") can handle each request type. Only configured
                recruiters will see and be able to handle requests of the
                assigned types.
              </Text>
            </div>

          </div>

          {hasConfigurations && (
            <div style={{ marginTop: "16px" }}>
              <Tag
                icon={<CheckCircleOutlined />}
                color="success"
                style={{ fontSize: "13px", padding: "4px 12px" }}
              >
                {existingConfigs.length} request type
                {existingConfigs.length !== 1 ? "s" : ""} configured
              </Tag>
            </div>
          )}
        </div>

        {hasConfigurations && !showConfigurationForm && (
          <>
            <Divider />
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              loading={isLoadingConfig}
              rowKey="requestType"
              locale={{
                emptyText: (
                  <Empty
                    description="No request types available"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </>
        )}

        {showConfigurationForm && (
          <>
            <Divider />
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={false}
              loading={isLoadingConfig}
              rowKey="requestType"
              locale={{
                emptyText: (
                  <Empty
                    description="No request types available"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              }}
            />
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalVisible}
        title={
          <span>
            <DeleteOutlined style={{ color: "#ff4d4f", marginRight: "8px" }} />
            Delete Configuration
          </span>
        }
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        width={500}
        centered
        maskClosable={false}
        confirmLoading={isDeleting}
      >
        <div>
          <Paragraph>
            Are you sure you want to delete the configuration for{" "}
            <Text strong>{deleteRequestType}</Text>?
          </Paragraph>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            This action cannot be undone. The recruiters assigned to this request
            type will no longer be able to see or handle these requests.
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeAdminConfiguration;
