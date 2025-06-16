import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Card,
  InputNumber,
  Space,
  message,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
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
  CheckCircleOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useAddPipelineMutation,
  useEditPipelineMutation,
  useEditStageMutation,
  useDeleteStageMutation,
} from "../../Slices/Admin/AdminApis.js";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Sortable Stage Item Component
// Updated SortableStageItem Component
function SortableStageItem({
  stage,
  index,
  onEdit,
  onDelete,
  isEditMode,
  isEditingStageAPI,
  isDeletingStage,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stage.id || `stage-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <Col xs={24} sm={12} lg={8}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners} // Move listeners to the main container
      >
        <Card
          size="small"
          style={{
            borderRadius: "12px",
            boxShadow: isDragging
              ? "0 8px 24px rgba(0, 0, 0, 0.15)"
              : "0 4px 16px rgba(0, 0, 0, 0.08)",
            border: isDragging ? "2px solid #da2c46" : "2px solid #e8f4fd",
            transition: "all 0.3s ease",
            cursor: isDragging ? "grabbing" : "grab", // Always show grab cursor
            transform: isDragging ? "rotate(2deg)" : "none",
          }}
          // Remove onMouseEnter and onMouseLeave to disable hover effects
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {/* Remove the separate drag handle since the whole card is draggable now */}
              <Tag
                color="blue"
                style={{
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              >
                #{stage.order}
              </Tag>
              <Text strong style={{ fontSize: "14px" }}>
                {stage.name}
              </Text>
              {isEditMode && stage._id && (
                <Tag color="green" style={{ fontSize: "10px" }}>
                  Saved
                </Tag>
              )}
            </div>
          }
          extra={
            <Space>
              <Tooltip title="Edit Stage">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(index);
                  }}
                  style={{ borderRadius: "6px" }}
                  loading={isEditingStageAPI}
                  onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
                />
              </Tooltip>
              <Tooltip title="Delete Stage">
                <Popconfirm
                  title="Delete Stage"
                  description={
                    isEditMode && stage._id
                      ? "This will permanently delete the stage from the database. Are you sure?"
                      : "Are you sure you want to remove this stage?"
                  }
                  icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    onDelete(index);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{
                    danger: true,
                    loading: isDeletingStage,
                  }}
                >
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    style={{ borderRadius: "6px" }}
                    loading={isDeletingStage}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking button
                  />
                </Popconfirm>
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
          {stage.requiredDocuments && stage.requiredDocuments.length > 0 && (
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
      </div>
    </Col>
  );
}

const CreatePipelineModal = ({
  visible,
  onClose,
  editingPipeline,
  onSuccess,
}) => {
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
  const [isEditMode, setIsEditMode] = useState(false);

  const [addPipeline, { isLoading: isCreating }] = useAddPipelineMutation();
  const [editPipeline, { isLoading: isUpdating }] = useEditPipelineMutation();
  const [editStage, { isLoading: isEditingStageAPI }] = useEditStageMutation();
  const [deleteStage, { isLoading: isDeletingStage }] =
    useDeleteStageMutation();

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
    "Aadhar",
    "PAN Card",
    "Passport",
  ];

  useEffect(() => {
    if (editingPipeline && visible) {
      setIsEditMode(true);
      setPipelineName(editingPipeline.name);
      // Ensure each stage has a unique id for drag and drop
      const stagesWithIds = (editingPipeline.stages || []).map(
        (stage, index) => ({
          ...stage,
          id: stage._id || `temp-${index}`,
        })
      );
      setStages(stagesWithIds);
      setCurrentStage({
        name: "",
        order: (editingPipeline.stages?.length || 0) + 1,
        description: "",
        requiredDocuments: [],
      });
    } else if (visible) {
      setIsEditMode(false);
      resetForm();
    }
  }, [editingPipeline, visible]);

  const resetForm = () => {
    form.resetFields();
    setStages([]);
    setPipelineName("");
    setCurrentStage({
      name: "",
      order: 1,
      description: "",
      requiredDocuments: [],
    });
    setIsEditingStage(false);
    setEditingIndex(-1);
    setNewDocument("");
    setIsEditMode(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  // Handle drag end event
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = stages.findIndex(
      (stage) => (stage.id || `stage-${stages.indexOf(stage)}`) === active.id
    );
    const newIndex = stages.findIndex(
      (stage) => (stage.id || `stage-${stages.indexOf(stage)}`) === over.id
    );

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reorder stages array
    const reorderedStages = arrayMove(stages, oldIndex, newIndex);

    // Update order numbers
    const updatedStages = reorderedStages.map((stage, index) => ({
      ...stage,
      order: index + 1,
    }));

    setStages(updatedStages);

    // If in edit mode, update stages in backend
    if (isEditMode) {
      try {
        const updatePromises = updatedStages
          .filter(
            (stage) =>
              stage._id &&
              stage.order !== stages.find((s) => s._id === stage._id)?.order
          )
          .map((stage) => {
            return editStage({
              stageId: stage._id,
              stageData: {
                name: stage.name,
                order: stage.order,
                description: stage.description,
                requiredDocuments: stage.requiredDocuments,
              },
            }).unwrap();
          });

        if (updatePromises.length > 0) {
          await Promise.all(updatePromises);
          message.success("Stages reordered successfully");
        }
      } catch (error) {
        const errorMessage =
          error?.data?.message || error?.message || "Failed to reorder stages";
        message.error(errorMessage);
        console.error("Reorder error:", error);
        // Revert to original order on error
        setStages(stages);
      }
    } else {
      message.success("Stages reordered successfully");
    }

    // Update current stage order if not editing
    if (!isEditingStage) {
      setCurrentStage((prev) => ({
        ...prev,
        order: updatedStages.length + 1,
      }));
    }
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

  const addStage = async () => {
    if (!currentStage.name.trim()) {
      message.error("Stage name is required");
      return;
    }

    const newStage = {
      ...currentStage,
      order: isEditingStage ? currentStage.order : stages.length + 1,
      id:
        isEditingStage && stages[editingIndex]?.id
          ? stages[editingIndex].id
          : `temp-${Date.now()}`,
    };

    if (isEditingStage) {
      if (isEditMode && stages[editingIndex]._id) {
        try {
          const stageData = {
            name: newStage.name,
            order: newStage.order,
            description: newStage.description,
            requiredDocuments: newStage.requiredDocuments,
          };

          await editStage({
            stageId: stages[editingIndex]._id,
            stageData,
          }).unwrap();

          const updatedStages = [...stages];
          updatedStages[editingIndex] = {
            ...stages[editingIndex],
            ...newStage,
          };
          setStages(updatedStages);
          message.success("Stage updated successfully");
        } catch (error) {
          const errorMessage =
            error?.data?.message || error?.message || "Failed to update stage";
          message.error(errorMessage);
          console.error("Stage update error:", error);
          return;
        }
      } else {
        const updatedStages = [...stages];
        updatedStages[editingIndex] = newStage;
        setStages(updatedStages);
        message.success("Stage updated successfully");
      }

      setIsEditingStage(false);
      setEditingIndex(-1);
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

  const editStageHandler = (index) => {
    setCurrentStage(stages[index]);
    setIsEditingStage(true);
    setEditingIndex(index);
  };

  const deleteStageHandler = async (index) => {
    const stageToDelete = stages[index];

    if (isEditMode && stageToDelete._id) {
      try {
        await deleteStage(stageToDelete._id).unwrap();
        message.success("Stage deleted successfully from database");
      } catch (error) {
        const errorMessage =
          error?.data?.message || error?.message || "Failed to delete stage";
        message.error(errorMessage);
        console.error("Stage delete error:", error);
        return;
      }
    }

    const updatedStages = stages.filter((_, i) => i !== index);
    const reorderedStages = updatedStages.map((stage, i) => ({
      ...stage,
      order: i + 1,
    }));
    setStages(reorderedStages);

    if (!isEditingStage) {
      setCurrentStage((prev) => ({
        ...prev,
        order: reorderedStages.length + 1,
      }));
    }

    if (!isEditMode || !stageToDelete._id) {
      message.success("Stage removed successfully");
    }
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

    // Remove temporary ids before sending to backend
    const cleanedStages = stages.map(({ id, ...stage }) => stage);

    const pipelineData = {
      name: pipelineName.trim(),
      stages: cleanedStages,
    };

    try {
      let result;

      if (isEditMode) {
        result = await editPipeline({
          pipelineId: editingPipeline._id,
          pipelineData,
        }).unwrap();
        message.success("Pipeline updated successfully!");
      } else {
        result = await addPipeline(pipelineData).unwrap();
        message.success("Pipeline created successfully!");
      }

      console.log(`${isEditMode ? "Updated" : "Created"} pipeline:`, result);
      resetForm();
      onClose();
      if (onSuccess) onSuccess(result);
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        `Failed to ${isEditMode ? "update" : "create"} pipeline`;
      message.error(errorMessage);
      console.error(
        `Pipeline ${isEditMode ? "update" : "creation"} error:`,
        error
      );
    }
  };

  const isLoading =
    isCreating || isUpdating || isEditingStageAPI || isDeletingStage;

  // Create items array for SortableContext
  const sortableItems = stages.map(
    (stage, index) => stage.id || `stage-${index}`
  );

  return (
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
              backgroundColor: "#da2c46",
              marginRight: "12px",
            }}
            icon={isEditMode ? <EditOutlined /> : <SettingOutlined />}
          />
          {isEditMode ? "Edit Pipeline" : "Create New Pipeline"}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={1000}
      footer={null}
      destroyOnClose
      style={{ top: "20px", padding: "24px" }}
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
                style={{
                  marginRight: "8px",
                  color: "#da2c46",
                }}
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
            prefix={<EditOutlined style={{ color: "#da2c46" }} />}
          />
        </Card>

        {/* Stages Header */}
        <Card
          style={{
            marginBottom: "20px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
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
                {isEditMode
                  ? "Modify your hiring process steps - drag to reorder"
                  : "Build your hiring process step by step - drag to reorder"}
              </Text>
            </div>
            <Badge
              count={stages.length}
              style={{ backgroundColor: "#722ed1" }}
              showZero
            />
          </div>
        </Card>

        {/* Existing Stages with Drag & Drop */}
        {stages.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableItems}
                strategy={verticalListSortingStrategy}
              >
                <Row gutter={[16, 16]}>
                  {stages.map((stage, index) => (
                    <SortableStageItem
                      key={stage.id || `stage-${index}`}
                      stage={stage}
                      index={index}
                      onEdit={editStageHandler}
                      onDelete={deleteStageHandler}
                      isEditMode={isEditMode}
                      isEditingStageAPI={isEditingStageAPI}
                      isDeletingStage={isDeletingStage}
                    />
                  ))}
                </Row>
              </SortableContext>
            </DndContext>
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
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #e8f4fd",
                  }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addDocument}
                  style={{
                    borderRadius: "8px",
                    backgroundColor: "#da2c46",
                  }}
                >
                  Add
                </Button>
              </Space.Compact>

              {/* Common Documents */}
              <div style={{ marginTop: "12px" }}>
                <Text style={{ fontSize: "12px", color: "#666" }}>
                  <InfoCircleOutlined style={{ marginRight: "4px" }} />
                  Quick add common documents:
                </Text>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                  }}
                >
                  {commonDocuments.map((doc) => (
                    <Button
                      key={doc}
                      size="small"
                      type={
                        currentStage.requiredDocuments.includes(doc)
                          ? "primary"
                          : "default"
                      }
                      onClick={() => selectCommonDocument(doc)}
                      style={{
                        borderRadius: "16px",
                        fontSize: "12px",
                        height: "28px",
                        backgroundColor:
                          currentStage.requiredDocuments.includes(doc)
                            ? "#da2c46"
                            : undefined,
                      }}
                      disabled={currentStage.requiredDocuments.includes(doc)}
                    >
                      {currentStage.requiredDocuments.includes(doc) && (
                        <CheckCircleOutlined style={{ marginRight: "4px" }} />
                      )}
                      {doc}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Documents */}
              {currentStage.requiredDocuments.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <Text style={{ fontSize: "12px", color: "#666" }}>
                    Selected documents ({currentStage.requiredDocuments.length}
                    ):
                  </Text>
                  <div
                    style={{
                      marginTop: "8px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                    }}
                  >
                    {currentStage.requiredDocuments.map((doc, index) => (
                      <Tag
                        key={index}
                        closable
                        onClose={() => removeDocument(index)}
                        style={{
                          borderRadius: "12px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          backgroundColor: "#e6f7ff",
                          border: "1px solid #91d5ff",
                          color: "#0958d9",
                        }}
                      >
                        <FileTextOutlined style={{ marginRight: "4px" }} />
                        {doc}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </Space>
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type={isEditingStage ? "primary" : "primary"}
              icon={isEditingStage ? <SaveOutlined /> : <PlusOutlined />}
              onClick={addStage}
              size="large"
              style={{
                borderRadius: "8px",
                minWidth: "140px",
                height: "40px",
                fontSize: "14px",
                backgroundColor: "#da2c46",
              }}
              loading={isEditingStageAPI}
            >
              {isEditingStage ? "Update Stage" : "Add Stage"}
            </Button>
            {isEditingStage && (
              <Button
                style={{
                  marginLeft: "12px",
                  borderRadius: "8px",
                  minWidth: "100px",
                  height: "40px",
                }}
                onClick={() => {
                  setIsEditingStage(false);
                  setEditingIndex(-1);
                  setCurrentStage({
                    name: "",
                    order: stages.length + 1,
                    description: "",
                    requiredDocuments: [],
                  });
                }}
                disabled={isEditingStageAPI}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            paddingTop: "20px",
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Button
            size="large"
            onClick={handleCancel}
            style={{
              borderRadius: "8px",
              minWidth: "100px",
              height: "44px",
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            loading={isCreating || isUpdating}
            style={{
              borderRadius: "8px",
              minWidth: "140px",
              height: "44px",
              fontSize: "14px",
              backgroundColor: "#da2c46",
            }}
            icon={<SaveOutlined />}
          >
            {isCreating || isUpdating
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Pipeline"
              : "Create Pipeline"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePipelineModal;
