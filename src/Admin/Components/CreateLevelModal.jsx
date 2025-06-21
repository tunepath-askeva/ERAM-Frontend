import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Card,
  Space,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Avatar,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  SettingOutlined,
  SaveOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  OrderedListOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const LevelItem = ({ level, index, onEdit, onDelete, isEditMode }) => {
  return (
    <Col xs={24} sm={12} lg={8}>
      <Card
        size="small"
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: "2px solid #e8f4fd",
          marginBottom: "16px",
        }}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Tag color="blue" style={{ borderRadius: "8px", fontSize: "12px" }}>
              #{index + 1}
            </Tag>
            <Text strong style={{ fontSize: "14px" }}>
              {level.title}
            </Text>
            {isEditMode && level._id && (
              <Tag color="green" style={{ fontSize: "10px" }}>
                Saved
              </Tag>
            )}
          </div>
        }
        extra={
          <Space>
            <Tooltip title="Edit Level">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(index)}
                style={{ borderRadius: "6px" }}
              />
            </Tooltip>
            <Tooltip title="Delete Level">
              <Popconfirm
                title="Delete Level"
                description={
                  isEditMode && level._id
                    ? "This will permanently delete the level. Are you sure?"
                    : "Are you sure you want to remove this level?"
                }
                icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
                onConfirm={() => onDelete(index)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  style={{ borderRadius: "6px" }}
                />
              </Popconfirm>
            </Tooltip>
          </Space>
        }
      >
        {level.description && (
          <Paragraph
            type="secondary"
            style={{
              fontSize: "13px",
              marginBottom: "8px",
              lineHeight: "1.4",
            }}
          >
            {level.description}
          </Paragraph>
        )}

        {level.assignedTo && (
          <div style={{ marginBottom: "8px" }}>
            <Text strong style={{ fontSize: "12px" }}>
              <UserOutlined style={{ marginRight: "4px" }} />
              Assigned To:
            </Text>
            <Text style={{ marginLeft: "8px", fontSize: "12px" }}>
              {level.assignedTo}
            </Text>
          </div>
        )}
      </Card>
    </Col>
  );
};

const CreateLevelModal = ({ visible, onClose, editingLevel, onSuccess }) => {
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState({
    title: "",
    description: "",
    assignedTo: "",
  });
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [levelName, setLevelName] = useState("");
  const [levelDescription, setLevelDescription] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (editingLevel && visible) {
      setIsEditMode(true);
      setLevelName(editingLevel.name);
      setLevelDescription(editingLevel.description || "");
      setLevels(editingLevel.levels || []);
      setCurrentLevel({
        title: "",
        description: "",
        assignedTo: "",
      });
    } else if (visible) {
      setIsEditMode(false);
      resetForm();
    }
  }, [editingLevel, visible]);

  const resetForm = () => {
    setLevels([]);
    setLevelName("");
    setLevelDescription("");
    setCurrentLevel({
      title: "",
      description: "",
      assignedTo: "",
    });
    setIsEditingLevel(false);
    setEditingIndex(-1);
    setIsEditMode(false);
    setIsLoading(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const addLevel = async () => {
    if (!currentLevel.title.trim()) {
      enqueueSnackbar("Level title is required", { variant: "error" });
      return;
    }

    const newLevel = {
      ...currentLevel,
    };

    if (isEditingLevel) {
      const updatedLevels = [...levels];
      updatedLevels[editingIndex] = newLevel;
      setLevels(updatedLevels);
      enqueueSnackbar("Level updated successfully", { variant: "success" });
      setIsEditingLevel(false);
      setEditingIndex(-1);
    } else {
      setLevels([...levels, newLevel]);
      enqueueSnackbar("Level added successfully", { variant: "success" });
    }

    setCurrentLevel({
      title: "",
      description: "",
      assignedTo: "",
    });
  };

  const editLevelHandler = (index) => {
    setCurrentLevel(levels[index]);
    setIsEditingLevel(true);
    setEditingIndex(index);
  };

  const deleteLevelHandler = async (index) => {
    const levelToDelete = levels[index];

    try {
      if (isEditMode && levelToDelete._id) {
        // Simulate API call for deletion
        await new Promise((resolve) => setTimeout(resolve, 500));
        enqueueSnackbar("Level deleted successfully", { variant: "success" });
      }

      const updatedLevels = levels.filter((_, i) => i !== index);
      setLevels(updatedLevels);

      if (!isEditMode || !levelToDelete._id) {
        enqueueSnackbar("Level removed successfully", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete level", { variant: "error" });
      console.error("Level delete error:", error);
    }
  };

  const handleSubmit = async () => {
    if (!levelName || !levelName.trim()) {
      enqueueSnackbar("Level name is required", { variant: "error" });
      return;
    }

    if (levels.length === 0) {
      enqueueSnackbar("At least one level is required", { variant: "error" });
      return;
    }

    const levelData = {
      name: levelName.trim(),
      description: levelDescription.trim(),
      levels: levels,
      levelStatus: "active",
    };

    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = {
        ...levelData,
        _id: isEditMode ? editingLevel._id : `new-${Date.now()}`,
      };

      enqueueSnackbar(
        `Level ${isEditMode ? "updated" : "created"} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose(result);
    } catch (error) {
      enqueueSnackbar(
        `Failed to ${isEditMode ? "update" : "create"} level`,
        { variant: "error" }
      );
      console.error(
        `Level ${isEditMode ? "update" : "creation"} error:`,
        error
      );
    } finally {
      setIsLoading(false);
    }
  };

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
          {isEditMode ? "Edit Level" : "Create New Level"}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={900}
      footer={null}
      destroyOnClose
      style={{ top: "20px" }}
    >
      <div style={{ marginTop: "8px" }}>
        {/* Level Information Card */}
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
                style={{ marginRight: "8px", color: "#da2c46" }}
              />
              Level Information
            </Text>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <Text strong style={{ color: "#2c3e50" }}>
              Level Name *
            </Text>
            <Input
              placeholder="e.g., Executive Level, Manager Level"
              size="large"
              value={levelName}
              onChange={(e) => setLevelName(e.target.value)}
              style={{
                marginTop: "8px",
                borderRadius: "8px",
                border: "2px solid #e8f4fd",
                fontSize: "16px",
              }}
              prefix={<EditOutlined style={{ color: "#da2c46" }} />}
            />
          </div>
          <div>
            <Text strong style={{ color: "#2c3e50" }}>
              Description (Optional)
            </Text>
            <TextArea
              rows={3}
              placeholder="Brief description of this level..."
              value={levelDescription}
              onChange={(e) => setLevelDescription(e.target.value)}
              style={{
                marginTop: "8px",
                borderRadius: "8px",
                border: "2px solid #e8f4fd",
              }}
            />
          </div>
        </Card>

        {/* Levels Header */}
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
                Level Levels
              </Text>
              <br />
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                }}
              >
                Add levels to this level
              </Text>
            </div>
            <Tag
              style={{
                backgroundColor: "#722ed1",
                border: "none",
                color: "white",
                fontSize: "14px",
                padding: "4px 12px",
              }}
            >
              {levels.length} levels
            </Tag>
          </div>
        </Card>

        {/* Display Existing Levels */}
        {levels.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <Row gutter={[16, 16]}>
              {levels.map((level, index) => (
                <LevelItem
                  key={index}
                  level={level}
                  index={index}
                  onEdit={editLevelHandler}
                  onDelete={deleteLevelHandler}
                  isEditMode={isEditMode}
                />
              ))}
            </Row>
          </div>
        )}

        {/* Add/Edit Level Card */}
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
              {isEditingLevel ? "Edit Level" : "Add New Level"}
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
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: "16px" }}>
                <Text strong style={{ color: "#2c3e50" }}>
                  Level Title *
                </Text>
                <Input
                  placeholder="e.g., Initial Review, Final Approval"
                  value={currentLevel.title}
                  onChange={(e) =>
                    setCurrentLevel((prev) => ({
                      ...prev,
                      title: e.target.value,
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
            <Col xs={24} sm={12}>
              <div style={{ marginBottom: "16px" }}>
                <Text strong style={{ color: "#2c3e50" }}>
                  <UserOutlined style={{ marginRight: "4px" }} />
                  Assigned To
                </Text>
                <Input
                  placeholder="e.g., HR, Manager, Team Lead"
                  value={currentLevel.assignedTo}
                  onChange={(e) =>
                    setCurrentLevel((prev) => ({
                      ...prev,
                      assignedTo: e.target.value,
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
          </Row>

          <div style={{ marginBottom: "16px" }}>
            <Text strong style={{ color: "#2c3e50" }}>
              Description (Optional)
            </Text>
            <TextArea
              rows={3}
              placeholder="Brief description of this level..."
              value={currentLevel.description}
              onChange={(e) =>
                setCurrentLevel((prev) => ({
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

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <Button
              type="primary"
              icon={isEditingLevel ? <SaveOutlined /> : <PlusOutlined />}
              onClick={addLevel}
              size="large"
              style={{
                borderRadius: "8px",
                minWidth: "140px",
                height: "40px",
                fontSize: "14px",
                backgroundColor: "#da2c46",
              }}
            >
              {isEditingLevel ? "Update Level" : "Add Level"}
            </Button>
            {isEditingLevel && (
              <Button
                style={{
                  marginLeft: "12px",
                  borderRadius: "8px",
                  minWidth: "100px",
                  height: "40px",
                }}
                onClick={() => {
                  setIsEditingLevel(false);
                  setEditingIndex(-1);
                  setCurrentLevel({
                    title: "",
                    description: "",
                    assignedTo: "",
                  });
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Card>

        {/* Footer Buttons */}
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
            loading={isLoading}
            style={{
              borderRadius: "8px",
              minWidth: "140px",
              height: "44px",
              fontSize: "14px",
              backgroundColor: "#da2c46",
            }}
            icon={<SaveOutlined />}
          >
            {isLoading
              ? isEditMode
                ? "Updating..."
                : "Creating..."
              : isEditMode
              ? "Update Level"
              : "Create Level"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateLevelModal;