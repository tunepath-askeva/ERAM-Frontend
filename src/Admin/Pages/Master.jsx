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
} from "@ant-design/icons";
import {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useDeleteProjectMutation,
} from "../../Slices/Admin/AdminApis";
import ProjectFormModal from "../Components/ProjectFormModal";
const { Title, Text, Paragraph } = Typography;

const Master = () => {
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); 
  const [editingProject, setEditingProject] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

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
  } = useGetProjectByIdQuery(selectedProjectId, {
    skip: !selectedProjectId,
  });

  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

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
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Created:{" "}
                        {new Date(project.createdAt).toLocaleDateString(
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
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        ID: {project._id.slice(-6)}
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
        style={{ maxWidth: 600 }}
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
        ) : selectedProject ? (
          <div style={{ padding: "16px 0" }}>
            <div style={{ marginBottom: 20 }}>
              <Text
                strong
                style={{
                  color: "#2c3e50",
                  fontSize: "16px",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                {selectedProject.name}
              </Text>
              <Space>
                <Badge
                  count={selectedProject.prefix}
                  style={{ backgroundColor: "#52c41a" }}
                />
                <Tag
                  color={selectedProject.status === "active" ? "green" : "red"}
                  style={{ textTransform: "capitalize" }}
                >
                  {selectedProject.status}
                </Tag>
              </Space>
            </div>

            <div style={{ marginBottom: 20 }}>
              <Text
                strong
                style={{
                  color: "#666",
                  fontSize: "14px",
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Description:
              </Text>
              <Paragraph
                style={{
                  color: "#333",
                  lineHeight: 1.6,
                  background: "#f9f9f9",
                  padding: "12px",
                  borderRadius: "6px",
                }}
              >
                {selectedProject.description}
              </Paragraph>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#8c8c8c",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <span>
                Created:{" "}
                {new Date(selectedProject.createdAt).toLocaleDateString()}
              </span>
              <span>
                Updated:{" "}
                {new Date(selectedProject.updatedAt).toLocaleDateString()}
              </span>
              <span>ID: {selectedProject._id}</span>
            </div>
          </div>
        ) : null}
      </Modal>

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
    </>
  );
};

export default Master;
