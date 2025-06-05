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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const WorkOrder = () => {
  const navigate = useNavigate();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState(null);

  const workOrders = [
    {
      _id: "wo123456",
      name: "Website Redesign",
      status: "In Progress",
      stages: ["Planning", "Design", "Development"],
      documents: 5,
      createdAt: "2023-05-15",
    },
    {
      _id: "wo789012",
      name: "Mobile App Development",
      status: "Completed",
      stages: ["Planning", "Development", "Testing", "Deployment"],
      documents: 8,
      createdAt: "2023-03-10",
    },
  ];

  const showDeleteModal = (workOrder) => {
    setWorkOrderToDelete(workOrder);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setWorkOrderToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!workOrderToDelete) return;

    try {
      // Add your delete API call here
      message.success(
        `Work Order "${workOrderToDelete.name}" deleted successfully`
      );
      setDeleteModalVisible(false);
      setWorkOrderToDelete(null);
    } catch (error) {
      message.error(error?.message || "Failed to delete work order");
      console.error("Delete error:", error);
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
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
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

        {workOrders?.length > 0 ? (
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
                            "@media (min-width: 576px)": {
                              fontSize: "16px",
                            },
                          }}
                          title={workOrder.name}
                        >
                          {workOrder.name}
                        </Text>
                      </div>
                      <Tag
                        color={
                          workOrder.status === "Completed" ? "green" : "blue"
                        }
                      >
                        {workOrder.status}
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
                          onClick={() => handleViewWorkOrder(workOrder._id)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit Work Order">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditWorkOrder(workOrder._id)}
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
                    </Space>
                  }
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
                      <Text
                        strong
                        style={{ color: "#2c3e50", fontSize: "13px" }}
                      >
                        Work Order Stages:
                      </Text>
                      <div
                        style={{
                          marginTop: 8,
                          maxHeight: "120px",
                          overflowY: "auto",
                          overflowX: "hidden",
                        }}
                      >
                        {workOrder.stages.map((stage, index) => (
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
                            {stage}
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
                        Documents Required:
                      </Text>
                      <div style={{ marginTop: 6 }}>
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          {workOrder.documents} documents
                        </Text>
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
                          "@media (min-width: 576px)": {
                            fontSize: "12px",
                          },
                        }}
                      >
                        Created:{" "}
                        {new Date(workOrder.createdAt).toLocaleDateString(
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
                          "@media (min-width: 576px)": {
                            fontSize: "12px",
                          },
                        }}
                      >
                        ID: {workOrder._id.slice(-6)}
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

      {/* Delete Confirmation Modal */}
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
                    {workOrderToDelete.name}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Status:</strong> {workOrderToDelete.status}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Stages:</strong>{" "}
                    {workOrderToDelete.stages?.length || 0}
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
    </>
  );
};

export default WorkOrder;
