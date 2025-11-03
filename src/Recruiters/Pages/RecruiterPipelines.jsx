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
  Switch,
  Input,
  Pagination,
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
  CloseOutlined,
  InfoCircleOutlined,
  OrderedListOutlined,
  ApartmentOutlined,
  CheckOutlined,
  StopOutlined,
  CheckCircleOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import {
  useGetPipelinesQuery,
  useDeletePipelineMutation,
  useGetPipelineByIdQuery,
  useDisablePipelineMutation,
  useCopyPipelineMutation,
} from "../../Slices/Admin/AdminApis.js";
import CreatePipelineModal from "../../Admin/Components/CreatePipelineModal.jsx";
import "../../index.css";
import SkeletonLoader from "../../Global/SkeletonLoader.jsx";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const RecruiterPipelines = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPipeline, setEditingPipeline] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [pipelineToToggle, setPipelineToToggle] = useState(null);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [pipelineToCopy, setPipelineToCopy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: pipelinesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetPipelinesQuery({
    searchTerm: debouncedSearchTerm,
    page: pagination.current,
    pageSize: pagination.pageSize,
  });

  const {
    data: pipelineDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetPipelineByIdQuery(selectedPipelineId, {
    skip: !selectedPipelineId,
  });

  const [deletePipeline, { isLoading: isDeleting }] =
    useDeletePipelineMutation();

  const [disablePipeline, { isLoading: isDisabling }] =
    useDisablePipelineMutation();

  const [copyPipeline, { isLoading: isCopying }] = useCopyPipelineMutation();

  useEffect(() => {
    if (isError) {
      enqueueSnackbar(
        `Failed to load pipelines: ${
          error?.data?.message || error?.message || "Unknown error"
        }`,
        { variant: "error" }
      );
    }
  }, [isError, error]);

  const pipelines = pipelinesResponse?.allPipelines || [];
  const totalCount = pipelinesResponse?.totalCount || 0;

  const isPipelineActive = (pipeline) => {
    return pipeline?.pipelineStatus === "active";
  };

  const showDeleteModal = (pipeline) => {
    setPipelineToDelete(pipeline);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setPipelineToDelete(null);
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const handleDeleteConfirm = async () => {
    if (!pipelineToDelete) return;

    try {
      await deletePipeline(pipelineToDelete._id).unwrap();
      enqueueSnackbar(
        `Pipeline "${pipelineToDelete.name}" deleted successfully`,
        { variant: "success" }
      );
      setDeleteModalVisible(false);
      setPipelineToDelete(null);
      refetch();
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to delete pipeline";
      enqueueSnackbar(errorMessage, { variant: "error" });
      console.error("Delete error:", error);
    }
  };

  const showDisableModal = (pipeline) => {
    setPipelineToToggle(pipeline);
    setDisableModalVisible(true);
  };

  const handleDisableCancel = () => {
    setDisableModalVisible(false);
    setPipelineToToggle(null);
  };

  const handleToggleStatus = async () => {
    if (!pipelineToToggle) return;

    try {
      const response = await disablePipeline(pipelineToToggle._id).unwrap();
      const newStatus = response.pipeline.pipelineStatus;
      enqueueSnackbar(
        `Pipeline "${pipelineToToggle.name}" is now ${newStatus}`,
        { variant: "success" }
      );
      setDisableModalVisible(false);
      setPipelineToToggle(null);
      refetch();
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to update pipeline status";
      enqueueSnackbar(errorMessage, { variant: "error" });
      console.error("Status change error:", error);
    }
  };

  const showCopyModal = (pipeline) => {
    setPipelineToCopy(pipeline);
    setCopyModalVisible(true);
  };

  const handleCopyCancel = () => {
    setCopyModalVisible(false);
    setPipelineToCopy(null);
  };

  const handleCopyConfirm = async () => {
    if (!pipelineToCopy) return;

    try {
      const response = await copyPipeline(pipelineToCopy._id).unwrap();
      enqueueSnackbar(
        `Pipeline "${pipelineToCopy.name}" copied successfully as "${response.data.name}"`,
        { variant: "success" }
      );
      setCopyModalVisible(false);
      setPipelineToCopy(null);
      refetch();
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to copy pipeline";
      enqueueSnackbar(errorMessage, { variant: "error" });
      console.error("Copy error:", error);
    }
  };

  const showCreateModal = () => {
    setEditingPipeline(null);
    setIsModalVisible(true);
  };

  const showEditModal = (pipeline) => {
    setEditingPipeline(pipeline);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setEditingPipeline(null);
    refetch();
  };

  const handleViewPipeline = (pipelineId) => {
    setSelectedPipelineId(pipelineId);
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedPipelineId(null);
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
        <div className="pipeline-header">
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
                className="pipeline-title"
                style={{ margin: 0, color: "#2c3e50", fontSize: "22px" }}
              >
                Pipeline Management
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
                placeholder="Search Pipelines"
                allowClear
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPagination({ ...pagination, current: 1 }); // Reset to first page on search
                }}
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  borderRadius: "8px",
                  height: "35px",
                }}
                size="large"
                className="custom-search-input"
              />

              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
                className="pipeline-button"
                style={{
                  background:
                    "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  height: "48px", // Explicit height
                  minWidth: "190px", // Minimum width to prevent shrinking
                }}
              >
                Create New Pipeline
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <SkeletonLoader />
        ) : pipelines?.length > 0 ? (
          <>
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
              {pipelines.map((pipeline) => (
                <div key={pipeline._id}>
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
                            title={pipeline.name}
                          >
                            {pipeline.name}
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Tag
                            color={isPipelineActive(pipeline) ? "green" : "red"}
                          >
                            {isPipelineActive(pipeline) ? "Active" : "Inactive"}
                          </Tag>
                          <Badge
                            count={pipeline.stages.length}
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
                          {[...pipeline.stages]
                            .sort((a, b) => a.order - b.order)
                            .map((stage, index) => (
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
                                  "@media (min-width: 576px)": {
                                    fontSize: "12px",
                                    padding: "4px 8px",
                                    borderRadius: 8,
                                  },
                                }}
                                title={` ${stage.name}`}
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
                          Documents Required:
                        </Text>
                        <div style={{ marginTop: 6 }}>
                          {pipeline.stages.reduce((totalDocs, stage) => {
                            return totalDocs + stage.requiredDocuments.length;
                          }, 0) > 0 ? (
                            <Text type="secondary" style={{ fontSize: "11px" }}>
                              {pipeline.stages.reduce((totalDocs, stage) => {
                                return (
                                  totalDocs + stage.requiredDocuments.length
                                );
                              }, 0)}{" "}
                              documents across all stages
                            </Text>
                          ) : (
                            <Text type="secondary" style={{ fontSize: "11px" }}>
                              No documents required
                            </Text>
                          )}
                        </div>
                      </div>

                      <div style={{ marginBottom: 16 }}>
                        <Text
                          strong
                          style={{ color: "#2c3e50", fontSize: "12px" }}
                        >
                          <FileTextOutlined style={{ marginRight: 4 }} />
                          Created By:
                        </Text>

                        <div style={{ marginTop: 6 }}>
                          {pipeline?.createdBy ? (
                            <>
                              <Text
                                type="primary"
                                style={{ fontSize: "11px", display: "block" }}
                              >
                                {pipeline?.createdBy.fullName}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "11px" }}
                              >
                                {pipeline?.createdBy.email}
                              </Text>
                            </>
                          ) : (
                            <Text type="secondary" style={{ fontSize: "11px" }}>
                              N/A
                            </Text>
                          )}
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
                              onClick={() => handleViewPipeline(pipeline._id)}
                            />
                          </Tooltip>
                          <Tooltip title="Copy Pipeline">
                            <Button
                              type="text"
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => showCopyModal(pipeline)}
                              style={{ color: "#1890ff" }}
                            />
                          </Tooltip>
                          <Tooltip title="Edit Pipeline">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => showEditModal(pipeline)}
                            />
                          </Tooltip>
                          <Tooltip
                            title={
                              isPipelineActive(pipeline)
                                ? "Disable Pipeline"
                                : "Enable Pipeline"
                            }
                          >
                            <Button
                              type="text"
                              size="small"
                              icon={
                                isPipelineActive(pipeline) ? (
                                  <StopOutlined />
                                ) : (
                                  <CheckCircleOutlined />
                                )
                              }
                              onClick={() => showDisableModal(pipeline)}
                              style={{
                                color: isPipelineActive(pipeline)
                                  ? "#ff4d4f"
                                  : "#52c41a",
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Delete Pipeline">
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => showDeleteModal(pipeline)}
                            />
                          </Tooltip>
                        </Space>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </Row>
            <div
              style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={totalCount}
                onChange={handlePaginationChange}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={["12", "24", "36", "64", "128"]}
              />
            </div>
          </>
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
                    No pipelines found
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
                    {searchTerm
                      ? "No pipelines match your search"
                      : "Create your first pipeline to get started with structured hiring"}
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </div>

      {/* View Pipeline Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Pipeline Details
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
        bodyStyle={{
          maxHeight: "70vh", // 👈 Fixed height relative to viewport
          overflowY: "auto", // 👈 Enables vertical scroll inside modal body
          paddingRight: 16,
        }}
      >
        {isLoadingDetails ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Loading pipeline details...</Text>
            </div>
          </div>
        ) : detailsError ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <Text type="danger">
              Failed to load pipeline details. Please try again.
            </Text>
          </div>
        ) : pipelineDetails?.getPipelineByIds ? (
          <div>
            <Card
              title="Pipeline Information"
              style={{ marginBottom: 16 }}
              size="small"
            >
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Name">
                  <Text strong>{pipelineDetails.getPipelineByIds.name}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Total Stages">
                  <Badge
                    count={pipelineDetails.getPipelineByIds.stages?.length || 0}
                    showZero
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      pipelineDetails.getPipelineByIds.pipelineStatus ===
                      "active"
                        ? "green"
                        : "red"
                    }
                  >
                    {pipelineDetails.getPipelineByIds.pipelineStatus ===
                    "active"
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
                  Pipeline Stages (
                  {pipelineDetails.getPipelineByIds.stages?.length || 0})
                </div>
              }
              size="small"
            >
              {pipelineDetails.getPipelineByIds.stages?.length > 0 ? (
                <List
                  dataSource={[...pipelineDetails.getPipelineByIds.stages].sort(
                    (a, b) => a.order - b.order
                  )}
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
                            style={{ display: "flex", alignItems: "center" }}
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
                              Stage #{stage.order}
                            </Tag>
                            <Text
                              strong
                              style={{ marginLeft: 12, fontSize: 16 }}
                            >
                              {stage.name}
                            </Text>
                          </div>
                        </div>

                        {stage.description && (
                          <div style={{ marginBottom: 12 }}>
                            <Text
                              strong
                              style={{ fontSize: 13, color: "#666" }}
                            >
                              Description:
                            </Text>
                            <Paragraph
                              style={{
                                margin: "4px 0 0 0",
                                color: "#333",
                                fontSize: 14,
                                lineHeight: 1.5,
                                paddingLeft: 12,
                                borderLeft: "3px solid #e6f7ff",
                                backgroundColor: "#f9f9f9",
                                padding: "8px 12px",
                                borderRadius: "4px",
                              }}
                            >
                              {stage.description}
                            </Paragraph>
                          </div>
                        )}

                        {stage.requiredDocuments?.length > 0 && (
                          <div>
                            <Text
                              strong
                              style={{
                                fontSize: 13,
                                color: "#666",
                                display: "block",
                                marginBottom: 8,
                              }}
                            >
                              <FileTextOutlined style={{ marginRight: 6 }} />
                              Required Documents (
                              {stage.requiredDocuments.length}):
                            </Text>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px",
                              }}
                            >
                              {stage.requiredDocuments.map((doc, docIndex) => (
                                <Tag
                                  key={docIndex}
                                  style={{
                                    fontSize: 12,
                                    padding: "4px 8px",
                                    backgroundColor: "#e6f7ff",
                                    borderColor: "#91d5ff",
                                    borderRadius: "6px",
                                    margin: 0,
                                  }}
                                >
                                  {doc}
                                </Tag>
                              ))}
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
                  description="No stages configured for this pipeline"
                />
              )}
            </Card>
          </div>
        ) : (
          <Empty description="Pipeline not found" />
        )}
      </Modal>

      {/* Create/Edit Pipeline Modal */}
      <CreatePipelineModal
        visible={isModalVisible}
        onClose={handleModalClose}
        editingPipeline={editingPipeline}
      />

      {/* Copy Pipeline Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: "#1890ff",
            }}
          >
            <CopyOutlined style={{ marginRight: 8, fontSize: 18 }} />
            <span style={{ fontSize: "16px" }}>Copy Pipeline</span>
          </div>
        }
        open={copyModalVisible}
        onCancel={handleCopyCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleCopyCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={handleCopyConfirm}
            loading={isCopying}
            size="large"
            icon={<CopyOutlined />}
            style={{
              background: "#1890ff",
              borderColor: "#1890ff",
            }}
          >
            Copy Pipeline
          </Button>,
        ]}
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
              "@media (min-width: 576px)": {
                padding: "16px",
                marginBottom: "20px",
              },
            }}
          >
            <InfoCircleOutlined
              style={{
                color: "#52c41a",
                fontSize: "16px",
                marginTop: "2px",
                flexShrink: 0,
                "@media (min-width: 576px)": {
                  fontSize: "18px",
                },
              }}
            />
            <div>
              <Text strong style={{ color: "#52c41a", fontSize: "13px" }}>
                Copy Pipeline Information
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
                The copied pipeline will be created with "Copy" suffix and
                inactive status.
              </Text>
            </div>
          </div>

          {pipelineToCopy && (
            <div>
              <Text>
                You are about to copy the pipeline{" "}
                <Text strong>"{pipelineToCopy.name}"</Text> which contains{" "}
                <Text strong>{pipelineToCopy.stages.length}</Text> stages.
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">
                  <strong>New pipeline will be named:</strong> "
                  {pipelineToCopy.name} Copy"
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  The copied pipeline will include all stages, configurations,
                  and required documents.
                </Text>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color: isPipelineActive(pipelineToToggle) ? "#ff4d4f" : "#52c41a",
            }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>
              {isPipelineActive(pipelineToToggle) ? "Disable" : "Enable"}{" "}
              Pipeline
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
            danger={isPipelineActive(pipelineToToggle)}
            onClick={handleToggleStatus}
            loading={isDisabling}
            size="large"
            style={{
              background: isPipelineActive(pipelineToToggle)
                ? "#ff4d4f"
                : "#52c41a",
              borderColor: isPipelineActive(pipelineToToggle)
                ? "#ff4d4f"
                : "#52c41a",
            }}
          >
            {isPipelineActive(pipelineToToggle) ? "Disable" : "Enable"}
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              background: isPipelineActive(pipelineToToggle)
                ? "#fff2f0"
                : "#f6ffed",
              border: isPipelineActive(pipelineToToggle)
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
                color: isPipelineActive(pipelineToToggle)
                  ? "#ff4d4f"
                  : "#52c41a",
                fontSize: "16px",
                marginTop: "2px",
                flexShrink: 0,
              }}
            />
            <div>
              <Text
                strong
                style={{
                  color: isPipelineActive(pipelineToToggle)
                    ? "#ff4d4f"
                    : "#52c41a",
                }}
              >
                {isPipelineActive(pipelineToToggle)
                  ? "Disabling this pipeline"
                  : "Enabling this pipeline"}
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c" }}>
                {isPipelineActive(pipelineToToggle)
                  ? "This pipeline will no longer be available for new hiring processes."
                  : "This pipeline will become available for new hiring processes."}
              </Text>
            </div>
          </div>

          {pipelineToToggle && (
            <div>
              <Text>
                You are about to{" "}
                {isPipelineActive(pipelineToToggle) ? "disable" : "enable"} the
                pipeline{" "}
                <Text strong style={{ color: "#2c3e50" }}>
                  "{pipelineToToggle.name}"
                </Text>
                .
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">
                  Current status:{" "}
                  <Tag
                    color={isPipelineActive(pipelineToToggle) ? "green" : "red"}
                  >
                    {isPipelineActive(pipelineToToggle) ? "Active" : "Inactive"}
                  </Tag>
                </Text>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Pipeline Modal */}
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
            <span style={{ fontSize: "16px" }}>Delete Pipeline</span>
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
            loading={isDeleting}
            size="large"
            icon={<DeleteOutlined />}
          >
            Delete Pipeline
          </Button>,
        ]}
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
              <Text strong style={{ color: "#ff4d4f" }}>
                This action cannot be undone
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c" }}>
                All data associated with this pipeline will be permanently
                deleted.
              </Text>
            </div>
          </div>

          {pipelineToDelete && (
            <div>
              <Text>
                You are about to delete the pipeline{" "}
                <Text strong style={{ color: "#2c3e50" }}>
                  "{pipelineToDelete.name}"
                </Text>
                .
              </Text>
              <div style={{ marginTop: 12 }}>
                <Text type="secondary">
                  This pipeline contains{" "}
                  <Text strong>{pipelineToDelete.stages.length}</Text> stages.
                </Text>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text type="danger">
                  <strong>Warning:</strong> Any ongoing hiring processes using
                  this pipeline will be affected.
                </Text>
              </div>
            </div>
          )}
        </div>
      </Modal>
      <style jsx>{`
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
      `}</style>
    </>
  );
};

export default RecruiterPipelines;
