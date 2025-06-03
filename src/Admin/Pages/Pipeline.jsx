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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useAddPipelineMutation } from "../../Slices/Admin/AdminApis";

const { Title, Text } = Typography;
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

  const [addPipeline, { isLoading: isCreating, error }] =
    useAddPipelineMutation();

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

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
    setStages([]);
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
    const pipelineName = form.getFieldValue("pipelineName");

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
      <div style={{ padding: "24px" }}>
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Title level={2}>Pipeline Management</Title>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Create New Pipeline
          </Button>
        </div>

        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No pipelines created yet"
        />
      </div>

      <Modal
        title={
          <span>
            <EditOutlined /> Create New Pipeline
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        width={900}
        footer={null}
        destroyOnClose
      >
        <div style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "20px" }}>
            <Text strong>Pipeline Name</Text>
            <Input
              placeholder="e.g., Software Developer Hiring Process"
              size="large"
              value={form.getFieldValue("pipelineName") || ""}
              onChange={(e) =>
                form.setFieldsValue({ pipelineName: e.target.value })
              }
              style={{ marginTop: "8px" }}
            />
          </div>

          <Divider>
            <Text strong>
              <OrderedListOutlined /> Pipeline Stages ({stages.length})
            </Text>
          </Divider>

          {/* Existing Stages */}
          {stages.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <Row gutter={[16, 16]}>
                {stages.map((stage, index) => (
                  <Col xs={24} sm={12} lg={8} key={index}>
                    <Card
                      size="small"
                      title={
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Tag color="blue">#{stage.order}</Tag>
                          <Text strong>{stage.name}</Text>
                        </div>
                      }
                      extra={
                        <Space>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => editStage(index)}
                          />
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteStage(index)}
                          />
                        </Space>
                      }
                    >
                      {stage.description && (
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          {stage.description}
                        </Text>
                      )}
                      {stage.requiredDocuments.length > 0 && (
                        <div style={{ marginTop: "8px" }}>
                          <Text style={{ fontSize: "11px" }}>
                            <FileTextOutlined />{" "}
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
              <span>
                {isEditingStage ? "✏️ Edit Stage" : "➕ Add New Stage"}
              </span>
            }
            style={{ marginBottom: "20px" }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={16}>
                <div style={{ marginBottom: "12px" }}>
                  <Text strong>Stage Name</Text>
                  <Input
                    placeholder="e.g., Technical Interview, HR Round"
                    value={currentStage.name}
                    onChange={(e) =>
                      setCurrentStage((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    style={{ marginTop: "4px" }}
                  />
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ marginBottom: "12px" }}>
                  <Text strong>Order</Text>
                  <InputNumber
                    min={1}
                    value={currentStage.order}
                    onChange={(value) =>
                      setCurrentStage((prev) => ({ ...prev, order: value }))
                    }
                    style={{ width: "100%", marginTop: "4px" }}
                  />
                </div>
              </Col>
            </Row>

            <div style={{ marginBottom: "12px" }}>
              <Text strong>Description (Optional)</Text>
              <TextArea
                rows={2}
                placeholder="Brief description of this stage..."
                value={currentStage.description}
                onChange={(e) =>
                  setCurrentStage((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                style={{ marginTop: "4px" }}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <Text strong>Required Documents</Text>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    placeholder="Enter document name"
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    onPressEnter={addDocument}
                  />
                  <Button
                    type="primary"
                    onClick={addDocument}
                    icon={<PlusOutlined />}
                  >
                    Add
                  </Button>
                </Space.Compact>

                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    <InfoCircleOutlined /> Quick add common documents:
                  </Text>
                  <div style={{ marginTop: "4px" }}>
                    {commonDocuments.map((doc) => (
                      <Tag
                        key={doc}
                        style={{ cursor: "pointer", margin: "2px" }}
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
                  <div>
                    <Text strong style={{ fontSize: "12px" }}>
                      Selected Documents:
                    </Text>
                    <div style={{ marginTop: "4px" }}>
                      {currentStage.requiredDocuments.map((doc, index) => (
                        <Tag
                          key={index}
                          closable
                          onClose={() => removeDocument(index)}
                          color="blue"
                          style={{ margin: "2px" }}
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
            >
              {isEditingStage ? "Update Stage" : "Add Stage"}
            </Button>
          </Card>

          <div style={{ marginBottom: 0, marginTop: "20px" }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button onClick={handleCancel} disabled={isCreating}>
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                disabled={stages.length === 0}
                onClick={handleSubmit}
                loading={isCreating} // Show loading spinner
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
