import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Card,
  InputNumber,
  Select,
  Space,
  Divider,
  message,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Empty,
  Avatar,
  Badge,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  InfoCircleOutlined,
  RocketOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useGetPipelinesQuery,
  useAddPipelineMutation,
} from "../../Slices/Admin/AdminApis";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Pipeline = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [stages, setStages] = useState([]);
  const [currentStage, setCurrentStage] = useState({
    name: "",
    order: 1,
    description: "",
    requiredDocuments: [],
  });
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [newDocument, setNewDocument] = useState("");
  const [pipelineName, setPipelineName] = useState("");

  const { data: pipelines, isLoading, refetch } = useGetPipelinesQuery();
  const [addPipeline, { isLoading: isCreating }] = useAddPipelineMutation();

  const commonDocuments = [
    "Resume/CV",
    "Cover Letter",
    "Portfolio",
    "References",
    "Transcripts",
    "Certificates",
    "Identity Proof",
    "Previous Employment Letter",
    "Salary Slips",
    "No Objection Certificate",
  ];

  const handleDeletePipeline = async (id) => {
    try {
      
      message.success("Pipeline deleted successfully");
      refetch();
    } catch (error) {
      message.error("Failed to delete pipeline");
      console.error("Delete error:", error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setStages([]);
    setPipelineName("");
    setCurrentStage({
      name: "",
      order: 1,
      description: "",
      requiredDocuments: [],
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsEditingStage(false);
    setEditingIndex(-1);
    setPipelineName("");
  };

  const addDocument = () => {
    if (newDocument.trim()) {
      setCurrentStage((prev) => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, newDocument.trim()],
      }));
      setNewDocument("");
    }
  };

  const removeDocument = (index) => {
    setCurrentStage((prev) => ({
      ...prev,
      requiredDocuments: prev.requiredDocuments.filter((_, i) => i !== index),
    }));
  };

  const selectCommonDocument = (doc) => {
    if (!currentStage.requiredDocuments.includes(doc)) {
      setCurrentStage((prev) => ({
        ...prev,
        requiredDocuments: [...prev.requiredDocuments, doc],
      }));
    }
  };

  const addStage = () => {
    if (!currentStage.name.trim()) {
      message.error("Stage name is required");
      return;
    }

    const newStage = {
      ...currentStage,
      order: isEditingStage ? currentStage.order : stages.length + 1,
    };

    if (isEditingStage) {
      const updatedStages = [...stages];
      updatedStages[editingIndex] = newStage;
      setStages(updatedStages);
      setIsEditingStage(false);
      setEditingIndex(-1);
      message.success("Stage updated successfully");
    } else {
      setStages([...stages, newStage]);
      message.success("Stage added successfully");
    }

    setCurrentStage({
      name: "",
      order: stages.length + 2,
      description: "",
      requiredDocuments: [],
    });
  };

  const editStage = (index) => {
    setCurrentStage(stages[index]);
    setIsEditingStage(true);
    setEditingIndex(index);
  };

  const deleteStage = (index) => {
    const updatedStages = stages.filter((_, i) => i !== index);
    const reorderedStages = updatedStages.map((stage, i) => ({
      ...stage,
      order: i + 1,
    }));
    setStages(reorderedStages);
    message.success("Stage deleted successfully");
  };

  const handleSubmit = async () => {
    if (!pipelineName || !pipelineName.trim()) {
      message.error("Pipeline name is required");
      return;
    }

    if (stages.length === 0) {
      message.error("At least one stage is required");
      return;
    }

    const pipelineData = {
      name: pipelineName.trim(),
      stages: stages,
    };

    try {
      const result = await addPipeline(pipelineData).unwrap();

      message.success("Pipeline created successfully!");
      console.log("Created pipeline:", result);

      setIsModalVisible(false);
      form.resetFields();
      setPipelineName("");
      setStages([]);
      setCurrentStage({
        name: "",
        order: 1,
        description: "",
        requiredDocuments: [],
      });
    } catch (error) {
      const errorMessage =
        error?.data?.message || error?.message || "Failed to create pipeline";
      message.error(errorMessage);
      console.error("Pipeline creation error:", error);
    }
  };

  return (
    <>
      <div
        style={{
          padding: "32px",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.95)",
            padding: "24px",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <div>
            <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
              <RocketOutlined
                style={{ marginRight: "12px", color: " #1890ff" }}
              />
              Pipeline Management
            </Title>
            <Paragraph style={{ margin: "8px 0 0 0", color: "#7f8c8d" }}>
              Create and manage your hiring pipelines with custom stages
            </Paragraph>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={showModal}
            style={{
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
            }}
          >
            Create New Pipeline
          </Button>
        </div>

        {isLoading ? (
          <Card loading style={{ borderRadius: "16px" }} />
        ) : pipelines?.length > 0 ? (
          <Row gutter={[16, 16]}>
            {pipelines.map((pipeline) => (
              <Col xs={24} sm={12} lg={8} key={pipeline._id}>
                <Card
                  style={{
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                  }}
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <FolderOpenOutlined
                        style={{ color: "#1890ff", marginRight: 8 }}
                      />
                      <Text strong>{pipeline.name}</Text>
                    </div>
                  }
                  extra={
                    <Space>
                      <Tooltip title="View">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={() => console.log("View", pipeline._id)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => console.log("Edit", pipeline._id)}
                        />
                      </Tooltip>
                      <Popconfirm
                        title="Are you sure to delete this pipeline?"
                        onConfirm={() => handleDeletePipeline(pipeline._id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Tooltip title="Delete">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                          />
                        </Tooltip>
                      </Popconfirm>
                    </Space>
                  }
                >
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Stages:</Text>
                    <div style={{ marginTop: 8 }}>
                      {pipeline.stages.map((stage, index) => (
                        <Tag
                          key={index}
                          color="blue"
                          style={{ marginBottom: 4, borderRadius: 8 }}
                        >
                          {stage.order}. {stage.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Text type="secondary">
                      Created:{" "}
                      {new Date(pipeline.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: "16px", color: "#7f8c8d" }}>
                    No pipelines created yet
                  </Text>
                  <br />
                  <Text type="secondary">
                    Create your first pipeline to get started with structured
                    hiring
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
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#2c3e50",
            }}
          >
            <Avatar
              style={{
                backgroundColor: "#1890ff",
                marginRight: "12px",
              }}
              icon={<SettingOutlined />}
            />
            Create New Pipeline
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        width={1000}
        footer={null}
        destroyOnClose
        style={{ top: "20px" }}
        bodyStyle={{
          padding: "24px",
        }}
      >
        <div style={{ marginTop: "8px" }}>
          {/* Pipeline Name Section */}
          <Card
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              border: "1px solid #e8f4fd",
            }}
          >
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "16px", color: "#2c3e50" }}>
                <FolderOpenOutlined
                  style={{ marginRight: "8px", color: "#1890ff" }}
                />
                Pipeline Information
              </Text>
            </div>
            <Input
              placeholder="e.g., Software Developer Hiring Process"
              size="large"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              style={{
                borderRadius: "8px",
                border: "2px solid #e8f4fd",
                fontSize: "16px",
              }}
              prefix={<EditOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>

          {/* Stages Header */}
          <Card
            style={{
              marginBottom: "20px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
              border: "none",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "white",
              }}
            >
              <div>
                <Text strong style={{ color: "white", fontSize: "18px" }}>
                  <OrderedListOutlined style={{ marginRight: "8px" }} />
                  Pipeline Stages
                </Text>
                <br />
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "14px",
                  }}
                >
                  Build your hiring process step by step
                </Text>
              </div>
              <Badge
                count={stages.length}
                style={{ backgroundColor: "#52c41a" }}
                showZero
              />
            </div>
          </Card>

          {/* Existing Stages */}
          {stages.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <Row gutter={[16, 16]}>
                {stages.map((stage, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: "12px",
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                        border: "2px solid #e8f4fd",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 24px rgba(0, 0, 0, 0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(0, 0, 0, 0.08)";
                      }}
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Tag
                            color="blue"
                            style={{ borderRadius: "8px", fontSize: "12px" }}
                          >
                            #{stage.order}
                          </Tag>
                          <Text strong style={{ fontSize: "14px" }}>
                            {stage.name}
                          </Text>
                        </div>
                      }
                      extra={
                        <Space>
                          <Tooltip title="Edit Stage">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => editStage(index)}
                              style={{
                                borderRadius: "6px",
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="Delete Stage">
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => deleteStage(index)}
                              style={{ borderRadius: "6px" }}
                            />
                          </Tooltip>
                        </Space>
                      }
                    >
                      {stage.description && (
                        <Paragraph
                          type="secondary"
                          style={{
                            fontSize: "13px",
                            marginBottom: "8px",
                            lineHeight: "1.4",
                          }}
                        >
                          {stage.description}
                        </Paragraph>
                      )}
                      {stage.requiredDocuments.length > 0 && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "8px",
                            background: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text style={{ fontSize: "12px" }}>
                            <FileTextOutlined style={{ marginRight: "4px" }} />
                            {stage.requiredDocuments.length} documents required
                          </Text>
                        </div>
                      )}
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}

          {/* Add/Edit Stage Form */}
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "16px",
                  color: "#2c3e50",
                }}
              >
                {isEditingStage ? "Edit Stage" : "Add New Stage"}
              </div>
            }
            style={{
              marginBottom: "24px",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              border: "2px solid #e8f4fd",
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={16}>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong style={{ color: "#2c3e50" }}>
                    Stage Name
                  </Text>
                  <Input
                    placeholder="e.g., Technical Interview, HR Round"
                    value={currentStage.name}
                    onChange={(e) =>
                      setCurrentStage((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    style={{
                      marginTop: "8px",
                      borderRadius: "8px",
                      border: "2px solid #e8f4fd",
                    }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong style={{ color: "#2c3e50" }}>
                    Order
                  </Text>
                  <InputNumber
                    min={1}
                    value={currentStage.order}
                    onChange={(value) =>
                      setCurrentStage((prev) => ({ ...prev, order: value }))
                    }
                    style={{
                      width: "100%",
                      marginTop: "8px",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </Col>
            </Row>

            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ color: "#2c3e50" }}>
                Description (Optional)
              </Text>
              <TextArea
                rows={3}
                placeholder="Brief description of this stage..."
                value={currentStage.description}
                onChange={(e) =>
                  setCurrentStage((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                style={{
                  marginTop: "8px",
                  borderRadius: "8px",
                  border: "2px solid #e8f4fd",
                }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ color: "#2c3e50" }}>
                Required Documents
              </Text>
              <Space
                direction="vertical"
                style={{ width: "100%", marginTop: "8px" }}
              >
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Enter document name"
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    onPressEnter={addDocument}
                    style={{ borderRadius: "8px 0 0 8px" }}
                  />
                  <Button
                    type="primary"
                    onClick={addDocument}
                    icon={<PlusOutlined />}
                    style={{
                      borderRadius: "0 8px 8px 0",
                      background:
                        "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    }}
                  >
                    Add
                  </Button>
                </Space.Compact>

                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px dashed #d9d9d9",
                  }}
                >
                  <Text type="secondary" style={{ fontSize: "13px" }}>
                    <InfoCircleOutlined style={{ marginRight: "4px" }} />
                    Quick add common documents:
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    {commonDocuments.map((doc) => (
                      <Tag
                        key={doc}
                        style={{
                          cursor: "pointer",
                          margin: "3px",
                          borderRadius: "6px",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => selectCommonDocument(doc)}
                        color={
                          currentStage.requiredDocuments.includes(doc)
                            ? "green"
                            : "default"
                        }
                      >
                        {doc}
                      </Tag>
                    ))}
                  </div>
                </div>

                {currentStage.requiredDocuments.length > 0 && (
                  <div
                    style={{
                      background: "#e6f7ff",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #91d5ff",
                    }}
                  >
                    <Text strong style={{ fontSize: "13px", color: "#1890ff" }}>
                      <CheckCircleOutlined style={{ marginRight: "4px" }} />
                      Selected Documents (
                      {currentStage.requiredDocuments.length}):
                    </Text>
                    <div style={{ marginTop: "8px" }}>
                      {currentStage.requiredDocuments.map((doc, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => removeDocument(index)}
                          color="blue"
                          style={{
                            margin: "3px",
                            borderRadius: "6px",
                          }}
                        >
                          {doc}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </Space>
            </div>

            <Button
              type="primary"
              onClick={addStage}
              icon={isEditingStage ? <EditOutlined /> : <PlusOutlined />}
              block
              size="large"
              style={{
                borderRadius: "8px",
                height: "48px",
                fontSize: "16px",
                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",

                border: "none",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              }}
            >
              {isEditingStage ? "Update Stage" : "Add Stage"}
            </Button>
          </Card>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              background: "rgba(255, 255, 255, 0.8)",
              borderRadius: "12px",
              backdropFilter: "blur(10px)",
            }}
          >
            <div>
              <Text type="secondary">
                {stages.length > 0
                  ? `${stages.length} stage${
                      stages.length > 1 ? "s" : ""
                    } configured`
                  : "Add at least one stage to create pipeline"}
              </Text>
            </div>
            <Space>
              <Button
                onClick={handleCancel}
                disabled={isCreating}
                style={{ borderRadius: "8px" }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                disabled={stages.length === 0 || !pipelineName.trim()}
                onClick={handleSubmit}
                loading={isCreating}
                style={{
                  borderRadius: "8px",
                  color: "white",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",

                  border: "none",
                  height: "40px",
                  paddingLeft: "24px",
                  paddingRight: "24px",
                }}
              >
                {isCreating ? "Creating..." : "Create Pipeline"}
              </Button>
            </Space>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Pipeline;
