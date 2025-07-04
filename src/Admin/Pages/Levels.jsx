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
  Divider,
  Descriptions,
  List,
  Spin,
  Input,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  ApartmentOutlined,
  CheckCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import CreateLevelModal from "../Components/CreateLevelModal";
import "../../index.css";
import { useGetApprovalQuery } from "../../Slices/Admin/AdminApis";

const { Title, Text, Paragraph } = Typography;

const Levels = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [levelToDelete, setLevelToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState(null);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [levelToToggle, setLevelToToggle] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const {
    data: approvalData,
    isLoading,
    isError,
    refetch,
  } = useGetApprovalQuery();

  const levels =
    approvalData?.aprovals?.map((approval) => ({
      ...approval,
      name: approval.groupName,
      stages: approval.levels,
      levelStatus: "active",
    })) || [];

  const isLevelActive = (level) => {
    return level?.levelStatus === "active";
  };

  const showDeleteModal = (level) => {
    setLevelToDelete(level);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setLevelToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!levelToDelete) return;

    try {
      // await deleteLevelApi(levelToDelete._id);

      await refetch();

      enqueueSnackbar(
        `Level "${levelToDelete.groupName}" deleted successfully`,
        {
          variant: "success",
        }
      );
      setDeleteModalVisible(false);
      setLevelToDelete(null);
    } catch (error) {
      enqueueSnackbar("Failed to delete level", { variant: "error" });
      console.error("Delete error:", error);
    }
  };

  const showDisableModal = (level) => {
    setLevelToToggle(level);
    setDisableModalVisible(true);
  };

  const handleDisableCancel = () => {
    setDisableModalVisible(false);
    setLevelToToggle(null);
  };

  const handleToggleStatus = async () => {
    if (!levelToToggle) return;

    try {
      // await toggleLevelStatusApi(levelToToggle._id, !isLevelActive(levelToToggle));

      await refetch();

      enqueueSnackbar(
        `Level "${levelToToggle.groupName}" is now ${isLevelActive(levelToToggle) ? "inactive" : "active"
        }`,
        { variant: "success" }
      );
      setDisableModalVisible(false);
      setLevelToToggle(null);
    } catch (error) {
      enqueueSnackbar("Failed to update level status", { variant: "error" });
      console.error("Status change error:", error);
    }
  };

  const showCreateModal = () => {
    setEditingLevel(null);
    setIsModalVisible(true);
  };

  const showEditModal = (level) => {
    setEditingLevel(level);
    setIsModalVisible(true);
  };

  const handleModalClose = (updatedLevel = null) => {
    if (updatedLevel) {
      refetch();
    }
    setIsModalVisible(false);
    setEditingLevel(null);
  };

  const handleViewLevel = (levelId) => {
    setSelectedLevelId(levelId);
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedLevelId(null);
  };

  const getLevelDetails = (levelId) => {
    return levels.find((level) => level._id === levelId);
  };

  if (isError) {
    return (
      <Card style={{ margin: 16 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Failed to load levels"
        />
        <Button onClick={refetch} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </Card>
    );
  }

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
        <div className="level-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {/* Title Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "200px",
              }}
            >
              <ApartmentOutlined
                size={24}
                style={{ marginRight: "8px", color: "#2c3e50" }}
              />
              <Title
                level={2}
                className="level-title"
                style={{ margin: 0, color: "#2c3e50", fontSize: "22px" }}
              >
                Level Management
              </Title>
            </div>

            {/* Search and Button Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flex: 1,
                justifyContent: "flex-end",
                minWidth: "300px",
              }}
            >
              <Input.Search
                placeholder="Search Levels"
                allowClear
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  borderRadius: "8px",
                  height: "35px", // Increased height to match button
                }}
                size="large" // Added size prop
                className="custom-search-input"
              />

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
                className="level-button"
                style={{
                  background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  height: "48px", // Explicit height
                  minWidth: "170px", // Minimum width to prevent shrinking
                }}
              >
                Create New Level
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Card loading style={{ borderRadius: "16px" }} />
        ) : levels?.length > 0 ? (
          <Row
            gutter={[16, 16]}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "16px",
            }}
          >
            {levels.map((level) => (
              <div key={level._id}>
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
                          }}
                          title={level.groupName}
                        >
                          {level.groupName}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Tag color={isLevelActive(level) ? "green" : "red"}>
                          {isLevelActive(level) ? "Active" : "Inactive"}
                        </Tag>
                        <Badge
                          count={level.levels?.length || 0}
                          style={{
                            backgroundColor: "#52c41a",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                    </div>
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
                      <Text
                        strong
                        style={{ color: "#2c3e50", fontSize: "13px" }}
                      >
                        Level Stages:
                      </Text>
                      <div
                        style={{
                          marginTop: 8,
                          maxHeight: "120px",
                          overflowY: "auto",
                          overflowX: "hidden",
                        }}
                      >
                        {[...(level.levels || [])]
                          .sort((a, b) => a.levelOrder - b.levelOrder)
                          .map((stage) => (
                            <Tag
                              key={stage._id}
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
                              }}
                              title={` ${stage.levelName}`}
                            >
                              {stage.levelName}
                            </Tag>
                          ))}
                      </div>
                    </div>

                    <div style={{ marginTop: "auto" }}>
                      <Space
                        size="small"
                        style={{ justifyContent: "flex-end", width: "100%" }}
                      >
                        <Tooltip title="View Details">
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewLevel(level._id)}
                          />
                        </Tooltip>
                        <Tooltip title="Edit Level">
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => showEditModal(level)}
                          />
                        </Tooltip>
                        <Tooltip
                          title={
                            isLevelActive(level)
                              ? "Disable Level"
                              : "Enable Level"
                          }
                        >
                          <Button
                            type="text"
                            size="small"
                            icon={
                              isLevelActive(level) ? (
                                <StopOutlined />
                              ) : (
                                <CheckCircleOutlined />
                              )
                            }
                            onClick={() => showDisableModal(level)}
                            style={{
                              color: isLevelActive(level)
                                ? "#ff4d4f"
                                : "#52c41a",
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Delete Level">
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => showDeleteModal(level)}
                          />
                        </Tooltip>
                      </Space>
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
                    No levels created yet
                  </Text>
                  <br />
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "12px",
                    }}
                  >
                    Create your first level to get started
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </div>

      {/* View Level Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Level Details
          </div>
        }
        open={viewModalVisible}
        onCancel={handleViewModalClose}
        footer={[
          <Button
            key="close"
            type="primary"
            style={{
              background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
            }}
            onClick={handleViewModalClose}
          >
            Close
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 800 }}
        centered
        destroyOnClose
      >
        {isLoading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Loading level details...</Text>
            </div>
          </div>
        ) : (
          <div>
            {selectedLevelId && getLevelDetails(selectedLevelId) ? (
              <>
                <Card
                  title="Level Information"
                  style={{ marginBottom: 16 }}
                  size="small"
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Name">
                      <Text strong>
                        {getLevelDetails(selectedLevelId).groupName}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Description">
                      <Text>
                        {getLevelDetails(selectedLevelId).description ||
                          "No description"}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Stages">
                      <Badge
                        count={
                          getLevelDetails(selectedLevelId).levels?.length || 0
                        }
                        showZero
                        style={{ backgroundColor: "#52c41a" }}
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      <Tag
                        color={
                          isLevelActive(getLevelDetails(selectedLevelId))
                            ? "green"
                            : "red"
                        }
                      >
                        {isLevelActive(getLevelDetails(selectedLevelId))
                          ? "Active"
                          : "Inactive"}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title={
                    <div>
                      <OrderedListOutlined style={{ marginRight: 8 }} />
                      Level Stages (
                      {getLevelDetails(selectedLevelId).levels?.length || 0})
                    </div>
                  }
                  size="small"
                >
                  {getLevelDetails(selectedLevelId).levels?.length > 0 ? (
                    <List
                      dataSource={[
                        ...getLevelDetails(selectedLevelId).levels,
                      ].sort((a, b) => a.levelOrder - b.levelOrder)}
                      renderItem={(stage, index) => (
                        <List.Item
                          style={{
                            background: index % 2 === 0 ? "#fafafa" : "white",
                            borderRadius: 8,
                            marginBottom: 12,
                            padding: "16px",
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          <div style={{ width: "100%" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 12,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <Tag
                                  color="blue"
                                  style={{
                                    margin: 0,
                                    fontSize: "12px",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                  }}
                                >
                                  Stage #{stage.levelOrder}
                                </Tag>
                                <Text
                                  strong
                                  style={{ marginLeft: 12, fontSize: 16 }}
                                >
                                  {stage.levelName}
                                </Text>
                              </div>
                            </div>

                            {stage.assignedRecruiters?.length > 0 && (
                              <div style={{ marginTop: 8 }}>
                                <Text
                                  strong
                                  style={{
                                    fontSize: 13,
                                    color: "#666",
                                  }}
                                >
                                  Assigned Recruiters:
                                </Text>
                                <div style={{ marginTop: 4 }}>
                                  {stage.assignedRecruiters.map(
                                    (recruiter, i) => (
                                      <Tag key={i} style={{ marginBottom: 4 }}>
                                        {recruiter.fullName} ({recruiter.email})
                                      </Tag>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No stages configured for this level"
                    />
                  )}
                </Card>
              </>
            ) : (
              <Empty description="Level not found" />
            )}
          </div>
        )}
      </Modal>

      {/* Create/Edit Level Modal */}
      <CreateLevelModal
        visible={isModalVisible}
        onClose={handleModalClose}
        editingLevel={editingLevel}
      />

      {/* Disable Level Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color:
                levelToToggle && isLevelActive(levelToToggle)
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>
              {levelToToggle && isLevelActive(levelToToggle)
                ? "Disable"
                : "Enable"}{" "}
              Level
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
            danger={levelToToggle && isLevelActive(levelToToggle)}
            onClick={handleToggleStatus}
            loading={isLoading}
            size="large"
            style={{
              background:
                levelToToggle && isLevelActive(levelToToggle)
                  ? "#ff4d4f"
                  : "#52c41a",
              borderColor:
                levelToToggle && isLevelActive(levelToToggle)
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
          >
            {levelToToggle && isLevelActive(levelToToggle)
              ? "Disable"
              : "Enable"}
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          {levelToToggle && (
            <>
              <div
                style={{
                  background: isLevelActive(levelToToggle)
                    ? "#fff2f0"
                    : "#f6ffed",
                  border: isLevelActive(levelToToggle)
                    ? "1px solid #ffccc7"
                    : "1px solid #b7eb8f",
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
                    color: isLevelActive(levelToToggle) ? "#ff4d4f" : "#52c41a",
                    fontSize: "16px",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <Text
                    strong
                    style={{
                      color: isLevelActive(levelToToggle)
                        ? "#ff4d4f"
                        : "#52c41a",
                    }}
                  >
                    {isLevelActive(levelToToggle)
                      ? "Disabling this level"
                      : "Enabling this level"}
                  </Text>
                  <br />
                  <Text style={{ color: "#8c8c8c" }}>
                    {isLevelActive(levelToToggle)
                      ? "This level will no longer be available for new hiring processes."
                      : "This level will become available for new hiring processes."}
                  </Text>
                </div>
              </div>

              <div>
                <Text>
                  You are about to{" "}
                  {isLevelActive(levelToToggle) ? "disable" : "enable"} the
                  level{" "}
                  <Text strong style={{ color: "#2c3e50" }}>
                    "{levelToToggle.groupName}"
                  </Text>
                  .
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">
                    Current status:{" "}
                    <Tag color={isLevelActive(levelToToggle) ? "green" : "red"}>
                      {isLevelActive(levelToToggle) ? "Active" : "Inactive"}
                    </Tag>
                  </Text>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Level Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#ff4d4f",
            }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>Delete Level</span>
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
            loading={isLoading}
            size="large"
            icon={<DeleteOutlined />}
          >
            Delete Level
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          {levelToDelete && (
            <>
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
                  <Text strong style={{ color: "#ff4d4f" }}>
                    This action cannot be undone
                  </Text>
                  <br />
                  <Text style={{ color: "#8c8c8c" }}>
                    All data associated with this level will be permanently
                    deleted.
                  </Text>
                </div>
              </div>

              <div>
                <Text>
                  You are about to delete the level{" "}
                  <Text strong style={{ color: "#2c3e50" }}>
                    "{levelToDelete.groupName}"
                  </Text>
                  .
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">
                    This level contains{" "}
                    <Text strong>{levelToDelete.levels?.length || 0}</Text>{" "}
                    stages.
                  </Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="danger">
                    <strong>Warning:</strong> Any ongoing hiring processes using
                    this level will be affected.
                  </Text>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Levels;
