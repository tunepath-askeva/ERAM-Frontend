import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  message,
  Empty,
  Badge,
  Tooltip,
  Modal,
  Tag,
  Spin,
  Input,
} from "antd";
import {
  PlusOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  TagOutlined,
  FolderOpenOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  StopOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useDeleteProjectMutation,
  useDisableProjectStatusMutation, // Add this new mutation
} from "../../Slices/Admin/AdminApis";
import ProjectFormModal from "../Components/ProjectFormModal";
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const Master = () => {
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProject, setEditingProject] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [projectToToggle, setProjectToToggle] = useState(null);

  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    refetch: refetchProjects,
    error: projectsError,
  } = useGetProjectsQuery();

  const {
    data: selectedProject,
    isLoading: isLoadingProjectDetails,
    error: projectDetailsError,
    refetch: refetchSingle,
  } = useGetProjectByIdQuery(selectedProjectId, {
    skip: !selectedProjectId,
  });

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();
  const [toggleProjectStatus, { isLoading: isToggling }] =
    useDisableProjectStatusMutation();

  const projects = projectsData?.allProjects || [];

  const showCreateModal = () => {
    setModalMode("create");
    setEditingProject(null);
    setIsFormModalVisible(true);
  };

  const showEditModal = (project) => {
    setModalMode("edit");
    setEditingProject(project);
    setIsFormModalVisible(true);
  };

  const handleFormModalClose = () => {
    setIsFormModalVisible(false);
    setEditingProject(null);
  };

  const handleFormSuccess = () => {
    setIsFormModalVisible(false);
    setEditingProject(null);
    refetchProjects();
  };

  const showDeleteModal = (project) => {
    setProjectToDelete(project);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setProjectToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      await deleteProject(projectToDelete._id).unwrap();
      message.success(`Project "${projectToDelete.name}" deleted successfully`);
      setDeleteModalVisible(false);
      setProjectToDelete(null);
      refetchProjects();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(
        error?.data?.message || error?.message || "Failed to delete project"
      );
    }
  };

  const showStatusModal = (project) => {
    setProjectToToggle(project);
    setStatusModalVisible(true);
  };

  const handleStatusCancel = () => {
    setStatusModalVisible(false);
    setProjectToToggle(null);
  };

  const handleStatusConfirm = async () => {
    if (!projectToToggle) return;

    try {
      const newStatus =
        projectToToggle.status === "active" ? "inActive" : "active";
      await toggleProjectStatus({
        projectId: projectToToggle._id,
        accountStatus: newStatus,
      }).unwrap();

      message.success(
        `Project "${projectToToggle.name}" has been ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
      setStatusModalVisible(false);
      setProjectToToggle(null);
      refetchProjects();
    } catch (error) {
      console.error("Status toggle error:", error);
      message.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update project status"
      );
    }
  };

  const handleViewProject = (project) => {
    setSelectedProjectId(project._id);
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedProjectId(null);
  };

  if (projectsError) {
    return (
      <div style={{ padding: "16px" }}>
        <Card>
          <Empty
            description={
              <div style={{ textAlign: "center" }}>
                <Text style={{ fontSize: "16px", color: "#ff4d4f" }}>
                  Failed to load projects
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  {projectsError?.data?.message ||
                    projectsError?.message ||
                    "Something went wrong"}
                </Text>
                <br />
                <Button
                  type="primary"
                  onClick={refetchProjects}
                  style={{ marginTop: 16 }}
                >
                  Retry
                </Button>
              </div>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: "16px", minHeight: "100vh" }}>
        <div className="project-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DeploymentUnitOutlined
              size={24}
              style={{ marginRight: "8px", color: "#2c3e50" }}
            />
            <Title
              level={2}
              className="project-title"
              style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}
            >
              Project Management
            </Title>
          </div>

          <Input.Search
            placeholder="Search Projects"
            allowClear
            style={{
              maxWidth: "300px",
              width: "100%",
              borderRadius: "8px",
              height: "44px",
            }}
          />

          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={showCreateModal}
            className="project-button"
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              width: "100%",
              height: "44px",
            }}
            block
          >
            Create New Project
          </Button>
        </div>

        {isLoadingProjects ? (
          <Card loading style={{ borderRadius: "16px" }} />
        ) : projects?.length > 0 ? (
          <Row
            gutter={[16, 16]}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "16px",
            }}
          >
            {projects.map((project) => (
              <div key={project._id}>
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
                            color: "#ff4d4f",
                            marginRight: 8,
                            fontSize: "16px",
                            flexShrink: 0,
                          }}
                        />
                        <Text
                          strong
                          style={{
                            fontSize: "16px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={project.name}
                        >
                          {project.name}
                        </Text>
                      </div>
                      <Badge
                        count={project.prefix}
                        style={{ backgroundColor: "#52c41a", flexShrink: 0 }}
                      />
                    </div>
                  }
                  extra={
                    <Space size="small">
                      <Tooltip title="View Details">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewProject(project)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit Project">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => showEditModal(project)}
                        />
                      </Tooltip>
                      <Tooltip
                        title={
                          project.status === "active"
                            ? "Deactivate Project"
                            : "Activate Project"
                        }
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={
                            project.status === "active" ? (
                              <StopOutlined />
                            ) : (
                              <PlayCircleOutlined />
                            )
                          }
                          onClick={() => showStatusModal(project)}
                          style={{
                            color:
                              project.status === "active"
                                ? "#ff4d4f"
                                : "#52c41a",
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Delete Project">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteModal(project)}
                        />
                      </Tooltip>
                    </Space>
                  }
                  bodyStyle={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    padding: "20px",
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
                        <FileTextOutlined style={{ marginRight: 4 }} />
                        Description:
                      </Text>
                      <Paragraph
                        style={{
                          marginTop: 8,
                          marginBottom: 0,
                          color: "#666",
                          fontSize: "12px",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={project.description}
                      >
                        {project.description}
                      </Paragraph>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ color: "#2c3e50", fontSize: "12px" }}
                      >
                        <TagOutlined style={{ marginRight: 4 }} />
                        Project Prefix:
                      </Text>
                      <div style={{ marginTop: 6 }}>
                        <Tag
                          color="blue"
                          style={{
                            borderRadius: 6,
                            fontSize: "12px",
                            padding: "4px 8px",
                          }}
                        >
                          {project.prefix}
                        </Tag>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{ marginBottom: 16 }}>
                      <Text
                        strong
                        style={{ color: "#2c3e50", fontSize: "12px" }}
                      >
                        Status:
                      </Text>
                      <div style={{ marginTop: 6 }}>
                        <Tag
                          color={project.status === "active" ? "green" : "red"}
                          style={{
                            borderRadius: 6,
                            fontSize: "12px",
                            padding: "4px 8px",
                            textTransform: "capitalize",
                          }}
                        >
                          {project.status}
                        </Tag>
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
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: "16px", color: "#7f8c8d" }}>
                    No projects created yet
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Create your first project to get started with project
                    management
                  </Text>
                </div>
              }
            />
          </Card>
        )}
      </div>

      <ProjectFormModal
        visible={isFormModalVisible}
        onCancel={handleFormModalClose}
        onSuccess={handleFormSuccess}
        editProject={editingProject}
        mode={modalMode}
      />

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Project Details
          </div>
        }
        open={viewModalVisible}
        refetch={refetchSingle}
        onCancel={handleViewModalClose}
        footer={[
          <Button
            key="close"
            type="primary"
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            }}
            onClick={handleViewModalClose}
          >
            Close
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 700 }}
        centered
        destroyOnClose
      >
        {isLoadingProjectDetails ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
            <Text style={{ display: "block", marginTop: 16 }}>
              Loading project details...
            </Text>
          </div>
        ) : projectDetailsError ? (
          <div style={{ textAlign: "center", color: "#ff4d4f" }}>
            <Text>Failed to load project details</Text>
            <br />
            <Text type="secondary">
              {projectDetailsError?.data?.message ||
                projectDetailsError?.message}
            </Text>
          </div>
        ) : selectedProject?.findProject ? (
          <div style={{ padding: "8px 0" }}>
            {/* Project Header */}
            <div
              style={{
                marginBottom: 24,
                padding: "20px",
                background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                borderRadius: "12px",
                border: "1px solid #dee2e6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <FolderOpenOutlined
                  style={{
                    fontSize: "24px",
                    color: "#da2c46",
                    marginRight: 12,
                  }}
                />
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    color: "#2c3e50",
                    fontSize: "22px",
                  }}
                >
                  {selectedProject.findProject.name}
                </Title>
              </div>

              <Space size="middle" wrap>
                <Badge
                  count={selectedProject.findProject.prefix}
                  style={{
                    backgroundColor: "#52c41a",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                />
                <Tag
                  color={
                    selectedProject.findProject.status === "active"
                      ? "green"
                      : "red"
                  }
                  style={{
                    textTransform: "capitalize",
                    fontSize: "12px",
                    padding: "4px 12px",
                    borderRadius: "6px",
                  }}
                >
                  {selectedProject.findProject.status}
                </Tag>
              </Space>
            </div>

            {/* Project Details Grid */}
            <div style={{ display: "grid", gap: "20px" }}>
              {/* Description Section */}
              <div
                style={{
                  background: "#fff",
                  border: "1px solid #f0f0f0",
                  borderRadius: "8px",
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <FileTextOutlined
                    style={{
                      color: "#666",
                      marginRight: 8,
                      fontSize: "16px",
                    }}
                  />
                  <Text
                    strong
                    style={{
                      color: "#2c3e50",
                      fontSize: "14px",
                    }}
                  >
                    Description
                  </Text>
                </div>
                <Paragraph
                  style={{
                    color: "#555",
                    lineHeight: 1.6,
                    margin: 0,
                    fontSize: "14px",
                    background: "#f9f9f9",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  {selectedProject.findProject.description ||
                    "No description provided"}
                </Paragraph>
              </div>

              {/* Project Information Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    padding: "16px",
                  }}
                >
                  <Text
                    strong
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Project Prefix
                  </Text>
                  <Tag
                    color="blue"
                    style={{
                      fontSize: "14px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: "600",
                    }}
                  >
                    {selectedProject.findProject.prefix}
                  </Tag>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Delete Modal */}
      <Modal
        title={
          <div
            style={{ display: "flex", alignItems: "center", color: "#ff4d4f" }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>Delete Project</span>
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
            loading={isDeleting}
            onClick={handleDeleteConfirm}
            size="large"
            icon={<DeleteOutlined />}
          >
            Delete Project
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
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            <WarningOutlined
              style={{
                color: "#ff4d4f",
                fontSize: "18px",
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
                All project data and associated records will be permanently
                removed.
              </Text>
            </div>
          </div>

          {projectToDelete && (
            <div>
              <Text
                style={{
                  fontSize: "16px",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Are you sure you want to delete the following project?
              </Text>

              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #e8e8e8",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "16px",
                      color: "#2c3e50",
                      wordBreak: "break-word",
                    }}
                  >
                    {projectToDelete.name}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Prefix:</strong> {projectToDelete.prefix}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Status:</strong> {projectToDelete.status}
                  </Text>
                </div>

                <div>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Created:</strong>{" "}
                    {new Date(projectToDelete.createdAt).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Status Toggle Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color:
                projectToToggle?.status === "active" ? "#ff4d4f" : "#52c41a",
            }}
          >
            {projectToToggle?.status === "active" ? (
              <StopOutlined style={{ marginRight: 8, fontSize: 18 }} />
            ) : (
              <PlayCircleOutlined style={{ marginRight: 8, fontSize: 18 }} />
            )}
            <span style={{ fontSize: "16px" }}>
              {projectToToggle?.status === "active" ? "Deactivate" : "Activate"}{" "}
              Project
            </span>
          </div>
        }
        open={statusModalVisible}
        onCancel={handleStatusCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleStatusCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={isToggling}
            onClick={handleStatusConfirm}
            size="large"
            style={{
              backgroundColor:
                projectToToggle?.status === "active" ? "#ff4d4f" : "#52c41a",
              borderColor:
                projectToToggle?.status === "active" ? "#ff4d4f" : "#52c41a",
            }}
            icon={
              projectToToggle?.status === "active" ? (
                <StopOutlined />
              ) : (
                <PlayCircleOutlined />
              )
            }
          >
            {projectToToggle?.status === "active" ? "Deactivate" : "Activate"}{" "}
            Project
          </Button>,
        ]}
        maskClosable={false}
        destroyOnClose
      >
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              background:
                projectToToggle?.status === "active" ? "#fff2f0" : "#f6ffed",
              border: `1px solid ${
                projectToToggle?.status === "active" ? "#ffccc7" : "#b7eb8f"
              }`,
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
            }}
          >
            {projectToToggle?.status === "active" ? (
              <WarningOutlined
                style={{
                  color: "#ff4d4f",
                  fontSize: "18px",
                  marginTop: "2px",
                  flexShrink: 0,
                }}
              />
            ) : (
              <InfoCircleOutlined
                style={{
                  color: "#52c41a",
                  fontSize: "18px",
                  marginTop: "2px",
                  flexShrink: 0,
                }}
              />
            )}
            <div>
              <Text
                strong
                style={{
                  color:
                    projectToToggle?.status === "active"
                      ? "#ff4d4f"
                      : "#52c41a",
                  fontSize: "13px",
                }}
              >
                {projectToToggle?.status === "active"
                  ? "This will deactivate the project!"
                  : "This will activate the project!"}
              </Text>
              <br />
              <Text style={{ color: "#8c8c8c", fontSize: "12px" }}>
                {projectToToggle?.status === "active"
                  ? "The project will be marked as inactive and may affect related operations."
                  : "The project will be marked as active and ready for operations."}
              </Text>
            </div>
          </div>

          {projectToToggle && (
            <div>
              <Text
                style={{
                  fontSize: "16px",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Are you sure you want to{" "}
                {projectToToggle.status === "active"
                  ? "deactivate"
                  : "activate"}{" "}
                the following project?
              </Text>

              <div
                style={{
                  background: "#fafafa",
                  border: "1px solid #e8e8e8",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div style={{ marginBottom: "10px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "16px",
                      color: "#2c3e50",
                      wordBreak: "break-word",
                    }}
                  >
                    {projectToToggle.name}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Prefix:</strong> {projectToToggle.prefix}
                  </Text>
                </div>

                <div style={{ marginBottom: "6px" }}>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>Current Status:</strong>
                    <Tag
                      color={
                        projectToToggle.status === "active" ? "green" : "red"
                      }
                      style={{
                        marginLeft: "8px",
                        textTransform: "capitalize",
                      }}
                    >
                      {projectToToggle.status}
                    </Tag>
                  </Text>
                </div>

                <div>
                  <Text style={{ color: "#666", fontSize: "12px" }}>
                    <strong>New Status:</strong>
                    <Tag
                      color={
                        projectToToggle.status === "active" ? "red" : "green"
                      }
                      style={{
                        marginLeft: "8px",
                        textTransform: "capitalize",
                      }}
                    >
                      {projectToToggle.status === "active"
                        ? "inActive"
                        : "active"}
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

export default Master;
