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
  Switch,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  RocketOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  UnorderedListOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  BookOutlined,
  DollarOutlined,
  StopOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  useGetWorkOrdersQuery,
  useDeleteWorkOrderMutation,
  usePublishWorkOrderMutation,
  useToggleWorkOrderStatusMutation,
} from "../../Slices/Admin/AdminApis";

const { Title, Text, Paragraph } = Typography;

const WorkOrder = () => {
  const navigate = useNavigate();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState(null);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [workOrderToPublish, setWorkOrderToPublish] = useState(null);
  const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
  const [workOrderToDeactivate, setWorkOrderToDeactivate] = useState(null);
  const [activateModalVisible, setActivateModalVisible] = useState(false);
  const [workOrderToActivate, setWorkOrderToActivate] = useState(null);

  const { data: workOrdersData, isLoading, refetch } = useGetWorkOrdersQuery();
  const workOrders = workOrdersData?.workorders || [];

  const [deleteWorkOrder] = useDeleteWorkOrderMutation();
  const [publishWorkOrder] = usePublishWorkOrderMutation();
  const [toggleWorkOrderStatus] = useToggleWorkOrderStatusMutation();

  const showDeleteModal = (workOrder) => {
    setWorkOrderToDelete(workOrder);
    setDeleteModalVisible(true);
  };

  const showPublishModal = (workOrder) => {
    setWorkOrderToPublish(workOrder);
    setPublishModalVisible(true);
  };

  const showDeactivateModal = (workOrder) => {
    setWorkOrderToDeactivate(workOrder);
    setDeactivateModalVisible(true);
  };

  const showActivateModal = (workOrder) => {
    setWorkOrderToActivate(workOrder);
    setActivateModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setWorkOrderToDelete(null);
  };

  const handlePublishCancel = () => {
    setPublishModalVisible(false);
    setWorkOrderToPublish(null);
  };

  const handleDeactivateCancel = () => {
    setDeactivateModalVisible(false);
    setWorkOrderToDeactivate(null);
  };

  const handleActivateCancel = () => {
    setActivateModalVisible(false);
    setWorkOrderToActivate(null);
  };

  const handleDeleteConfirm = async () => {
    if (!workOrderToDelete) return;

    try {
      await deleteWorkOrder(workOrderToDelete._id).unwrap();
      message.success(
        `Work Order "${workOrderToDelete.title}" deleted successfully`
      );
      refetch();
      setDeleteModalVisible(false);
      setWorkOrderToDelete(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to delete work order");
      console.error("Delete error:", error);
    }
  };

  const handlePublishConfirm = async () => {
    if (!workOrderToPublish) return;

    try {
      await publishWorkOrder(workOrderToPublish._id).unwrap();
      message.success(
        `Work Order "${workOrderToPublish.title}" published successfully`
      );
      refetch();
      setPublishModalVisible(false);
      setWorkOrderToPublish(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to publish work order");
      console.error("Publish error:", error);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!workOrderToDeactivate) return;

    try {
      await toggleWorkOrderStatus(workOrderToDeactivate._id).unwrap();
      message.success(
        `Work Order "${workOrderToDeactivate.title}" deactivated successfully`
      );
      refetch();
      setDeactivateModalVisible(false);
      setWorkOrderToDeactivate(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to deactivate work order");
      console.error("Deactivate error:", error);
    }
  };

  const handleActivateConfirm = async () => {
    if (!workOrderToActivate) return;

    try {
      await toggleWorkOrderStatus(workOrderToActivate._id).unwrap();
      message.success(
        `Work Order "${workOrderToActivate.title}" activated successfully`
      );
      refetch();
      setActivateModalVisible(false);
      setWorkOrderToActivate(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to activate work order");
      console.error("Activate error:", error);
    }
  };

  const handleStatusToggle = (workOrder) => {
    if (workOrder.isActive === "active") {
      // Show confirmation modal for deactivation
      showDeactivateModal(workOrder);
    } else {
      // Show confirmation modal for activation
      showActivateModal(workOrder);
    }
  };

  const handleViewWorkOrder = (workOrderId) => {
    navigate(`/admin/view-workorder/${workOrderId}`);
  };

  const handleEditWorkOrder = (workOrderId) => {
    navigate(`/admin/edit-workorder/${workOrderId}`);
  };

  const handleCreateWorkOrder = () => {
    navigate("/admin/add-workorder");
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "draft":
        return <Tag color="orange">Draft</Tag>;
      case "published":
        return <Tag color="green">Published</Tag>;
      case "active":
        return <Tag color="blue">Active</Tag>;
      case "inactive":
        return <Tag color="red">Inactive</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getEmploymentType = (type) => {
    switch (type) {
      case "full-time":
        return "Full Time";
      case "part-time":
        return "Part Time";
      case "contract":
        return "Contract";
      case "temporary":
        return "Temporary";
      case "internship":
        return "Internship";
      default:
        return type;
    }
  };

  const getWorkplaceType = (type) => {
    switch (type) {
      case "on-site":
        return "On Site";
      case "remote":
        return "Remote";
      case "hybrid":
        return "Hybrid";
      default:
        return type;
    }
  };

  const renderActionButtons = (workOrder) => {
    const isDraft = workOrder.workOrderStatus === "draft";
    const isPublished = workOrder.workOrderStatus === "published";
    const isActive = workOrder.isActive === "active";

    return (
      <Space size="small">
        <Tooltip title="View Details">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewWorkOrder(workOrder._id)}
          />
        </Tooltip>

        {isDraft && (
          <>
            <Tooltip title="Edit Work Order">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditWorkOrder(workOrder._id)}
              />
            </Tooltip>
            <Tooltip title="Publish Work Order">
              <Button
                type="text"
                size="small"
                icon={<RocketOutlined />}
                onClick={() => showPublishModal(workOrder)}
              />
            </Tooltip>
            <Tooltip title="Delete Work Order">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => showDeleteModal(workOrder)}
              />
            </Tooltip>
          </>
        )}

        {isPublished && (
          <>
            <Tooltip title="Edit Work Order">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEditWorkOrder(workOrder._id)}
              />
            </Tooltip>
            <Tooltip
              title={isActive ? "Deactivate Work Order" : "Activate Work Order"}
            >
              <Button
                type="text"
                size="small"
                icon={isActive ? <StopOutlined /> : <PlayCircleOutlined />}
                onClick={() => handleStatusToggle(workOrder)}
                style={{
                  color: isActive ? "#ff4d4f" : "#52c41a",
                }}
              />
            </Tooltip>
          </>
        )}
      </Space>
    );
  };

  return (
    <>
      <div
        style={{
          padding: "16px",
          minHeight: "100vh",
          "@media (min-width: 576px)": {
            padding: "24px",
          },
          "@media (min-width: 768px)": {
            padding: "32px",
          },
        }}
      >
        <div className="workorder-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UnorderedListOutlined
              size={24}
              style={{ marginRight: "8px", color: "#2c3e50" }}
            />
            <Title
              level={2}
              className="work-order-title"
              style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}
            >
              Work Order Management
            </Title>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateWorkOrder}
            className="workorder-button"
            style={{
              background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              width: "100%",
              height: "44px",
            }}
            block
          >
            Create New Work Order
          </Button>
        </div>

        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <Skeleton />
          </div>
        ) : workOrders?.length > 0 ? (
          <Row
            gutter={[
              { xs: 12, sm: 16, md: 16, lg: 20, xl: 24 },
              { xs: 12, sm: 16, md: 16, lg: 20, xl: 24 },
            ]}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
              "@media (min-width: 576px)": {
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "20px",
              },
              "@media (min-width: 768px)": {
                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                gap: "24px",
              },
              "@media (min-width: 1200px)": {
                gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              },
            }}
          >
            {workOrders.map((workOrder) => (
              <div key={workOrder._id}>
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
                    "@media (min-width: 768px)": {
                      borderRadius: "16px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    },
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
                        <FolderOpenOutlined
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
                            "@media (min-width: 576px)": {
                              fontSize: "16px",
                            },
                          }}
                          title={workOrder.title}
                        >
                          {workOrder.title}
                        </Text>
                      </div>
                      {getStatusTag(workOrder.workOrderStatus)}
                    </div>
                  }
                  extra={renderActionButtons(workOrder)}
                  bodyStyle={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "16px",
                    "@media (min-width: 576px)": {
                      padding: "20px",
                    },
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
                      <Space size={[8, 16]} wrap>
                        <Tag icon={<BookOutlined />}>
                          {workOrder.jobFunction}
                        </Tag>
                        <Tag icon={<GlobalOutlined />}>
                          {getWorkplaceType(workOrder.workplace)}
                        </Tag>
                        <Tag icon={<ClockCircleOutlined />}>
                          {getEmploymentType(workOrder.EmploymentType)}
                        </Tag>
                        {workOrder.annualSalary && (
                          <Tag icon={<DollarOutlined />}>
                            ${workOrder.annualSalary}
                          </Tag>
                        )}
                      </Space>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ color: "#2c3e50", fontSize: "13px" }}
                      >
                        Pipeline Stages:
                      </Text>
                      <div
                        style={{
                          marginTop: 8,
                          maxHeight: "120px",
                          overflowY: "auto",
                          overflowX: "hidden",
                        }}
                      >
                        {workOrder.pipeline?.stages?.map((stage, index) => (
                          <Tag
                            key={index}
                            color="blue"
                            style={{
                              marginBottom: 6,
                              marginRight: 6,
                              borderRadius: 6,
                              fontSize: "11px",
                              padding: "2px 6px",
                              display: "inline-block",
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              "@media (min-width: 576px)": {
                                fontSize: "12px",
                                padding: "4px 8px",
                                borderRadius: 8,
                              },
                            }}
                          >
                            {stage.name}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ color: "#2c3e50", fontSize: "12px" }}
                      >
                        <FileTextOutlined style={{ marginRight: 4 }} />
                        Job Code:
                      </Text>
                      <div style={{ marginTop: 6 }}>
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          {workOrder.jobCode}
                        </Text>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ color: "#2c3e50", fontSize: "12px" }}
                      >
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        Deadline:
                      </Text>
                      <div style={{ marginTop: 6 }}>
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          {new Date(
                            workOrder.deadlineDate
                          ).toLocaleDateString()}
                        </Text>
                      </div>
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
              "@media (min-width: 768px)": {
                borderRadius: "16px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              },
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
                      "@media (min-width: 576px)": {
                        fontSize: "16px",
                      },
                    }}
                  >
                    No work orders created yet
                  </Text>
                  <br />
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                      "@media (min-width: 576px)": {
                        fontSize: "14px",
                      },
                    }}
                  >
                    Create your first work order to get started
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </div>

      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#ff4d4f" }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>Delete Work Order</span>
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
            onClick={handleDeleteConfirm}
            size="large"
            icon={<DeleteOutlined />}
          >
            Delete Work Order
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
              style={{
                color: "#ff4d4f",
                fontSize: "16px",
                marginTop: "2px",
                flexShrink: 0,
              }}
            />
            <div>
              <Text strong style={{ color: "#ff4d4f", fontSize: "13px" }}>
                This action cannot be undone!
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
                All work order data including stages and associated records will
                be permanently removed.
              </Text>
            </div>
          </div>

          {workOrderToDelete && (
            <div>
              <Text
                style={{
                  fontSize: "14px",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Are you sure you want to delete the following work order?
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
                  <Text
                    strong
                    style={{
                      fontSize: "14px",
                      color: "#2c3e50",
                      wordBreak: "break-word",
                    }}
                  >
                    {workOrderToDelete.title}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Status:</strong> {workOrderToDelete.workOrderStatus}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Job Code:</strong> {workOrderToDelete.jobCode}
                  </Text>
                </div>

                <div>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Created:</strong>{" "}
                    {new Date(workOrderToDelete.createdAt).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Publish Confirmation Modal */}
      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#1890ff" }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18, color: "#1890ff" }}
            />
            <span style={{ fontSize: "16px" }}>Publish Work Order</span>
          </div>
        }
        open={publishModalVisible}
        onCancel={handlePublishCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handlePublishCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="publish"
            type="primary"
            onClick={handlePublishConfirm}
            size="large"
            icon={<RocketOutlined />}
          >
            Publish Work Order
          </Button>,
        ]}
        maskClosable={false}
        destroyOnClose
      >
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              background: "#e6f7ff",
              border: "1px solid #91d5ff",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <WarningOutlined
              style={{
                color: "#1890ff",
                fontSize: "16px",
                marginTop: "2px",
                flexShrink: 0,
              }}
            />
            <div>
              <Text strong style={{ color: "#1890ff", fontSize: "13px" }}>
                This will make the work order visible to candidates!
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
                Once published, the work order cannot be edited without
                unpublishing it first.
              </Text>
            </div>
          </div>

          {workOrderToPublish && (
            <div>
              <Text
                style={{
                  fontSize: "14px",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Are you sure you want to publish the following work order?
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
                  <Text
                    strong
                    style={{
                      fontSize: "14px",
                      color: "#2c3e50",
                      wordBreak: "break-word",
                    }}
                  >
                    {workOrderToPublish.title}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Current Status:</strong> Draft
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Job Code:</strong> {workOrderToPublish.jobCode}
                  </Text>
                </div>

                <div>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Created:</strong>{" "}
                    {new Date(
                      workOrderToPublish.createdAt
                    ).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#ff4d4f" }}
          >
            <StopOutlined
              style={{ marginRight: 8, fontSize: 18, color: "#ff4d4f" }}
            />
            <span style={{ fontSize: "16px" }}>Deactivate Work Order</span>
          </div>
        }
        open={deactivateModalVisible}
        onCancel={handleDeactivateCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleDeactivateCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="deactivate"
            type="primary"
            danger
            onClick={handleDeactivateConfirm}
            size="large"
            icon={<StopOutlined />}
          >
            Deactivate Work Order
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
              style={{
                color: "#ff4d4f",
                fontSize: "16px",
                marginTop: "2px",
                flexShrink: 0,
              }}
            />
            <div>
              <Text strong style={{ color: "#ff4d4f", fontSize: "13px" }}>
                This will make the work order invisible to candidates!
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
                Candidates will no longer be able to apply for this position.
              </Text>
            </div>
          </div>

          {workOrderToDeactivate && (
            <div>
              <Text
                style={{
                  fontSize: "14px",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Are you sure you want to deactivate the following work order?
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
                  <Text
                    strong
                    style={{
                      fontSize: "14px",
                      color: "#2c3e50",
                      wordBreak: "break-word",
                    }}
                  >
                    {workOrderToDeactivate.title}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Current Status:</strong> Active
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Job Code:</strong> {workOrderToDeactivate.jobCode}
                  </Text>
                </div>

                <div>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Created:</strong>{" "}
                    {new Date(
                      workOrderToDeactivate.createdAt
                    ).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Activate Confirmation Modal */}
      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#52c41a" }}
          >
            <PlayCircleOutlined
              style={{ marginRight: 8, fontSize: 18, color: "#52c41a" }}
            />
            <span style={{ fontSize: "16px" }}>Activate Work Order</span>
          </div>
        }
        open={activateModalVisible}
        onCancel={handleActivateCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleActivateCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="activate"
            type="primary"
            onClick={handleActivateConfirm}
            size="large"
            icon={<PlayCircleOutlined />}
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
          >
            Activate Work Order
          </Button>,
        ]}
        maskClosable={false}
        destroyOnClose
      >
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              background: "#f6ffed",
              border: "1px solid #b7eb8f",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <WarningOutlined
              style={{
                color: "#52c41a",
                fontSize: "16px",
                marginTop: "2px",
                flexShrink: 0,
              }}
            />
            <div>
              <Text strong style={{ color: "#52c41a", fontSize: "13px" }}>
                This will make the work order visible to candidates!
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
                Candidates will be able to apply for this position.
              </Text>
            </div>
          </div>

          {workOrderToActivate && (
            <div>
              <Text
                style={{
                  fontSize: "14px",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Are you sure you want to activate the following work order?
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
                  <Text
                    strong
                    style={{
                      fontSize: "14px",
                      color: "#2c3e50",
                      wordBreak: "break-word",
                    }}
                  >
                    {workOrderToActivate.title}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Current Status:</strong> Inactive
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Job Code:</strong> {workOrderToActivate.jobCode}
                  </Text>
                </div>

                <div>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Created:</strong>{" "}
                    {new Date(
                      workOrderToActivate.createdAt
                    ).toLocaleDateString()}
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

export default WorkOrder;
