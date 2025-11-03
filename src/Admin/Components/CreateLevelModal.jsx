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
  Select,
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
import {
  useAddApprovalMutation,
  useUpdateApprovalMutation,
  useGetRecruitersQuery,
  useGetRecruitersNameQuery,
} from "../../Slices/Admin/AdminApis";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const LevelItem = ({
  level,
  index,
  onEdit,
  onDelete,
  isEditMode,
  recruiters = [],
}) => {
  const approversList = level.assignedRecruiters
    ? level.assignedRecruiters
    : level.approvers?.user
    ? [
        recruiters.find((r) => r._id === level.approvers.user) || {
          _id: level.approvers.user,
          fullName: level.approvers.user,
        },
      ]
    : [];

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
              #{level.levelOrder}
            </Tag>
            <Text strong style={{ fontSize: "14px" }}>
              {level.levelName}
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

        {approversList.length > 0 && (
          <div style={{ marginBottom: "8px" }}>
            <Text strong style={{ fontSize: "12px" }}>
              <UserOutlined style={{ marginRight: "4px" }} />
              Approvers:
            </Text>
            <div style={{ marginTop: "4px" }}>
              {approversList.map((approver, i) => (
                <Tooltip
                  key={i}
                  title={`${approver.fullName} (${
                    approver.email || "No email"
                  })`}
                >
                  <Tag style={{ margin: "2px" }}>{approver.fullName}</Tag>
                </Tooltip>
              ))}
            </div>
          </div>
        )}
      </Card>
    </Col>
  );
};

const CreateLevelModal = ({ visible, onClose, editingLevel, onSuccess }) => {
  const [levels, setLevels] = useState([]);

  const { data: recruitersData, isLoading: isRecruitersLoading } =
    useGetRecruitersNameQuery();
  const [addApproval] = useAddApprovalMutation();
  const [updateApproval] = useUpdateApprovalMutation();

  const recruiters = recruitersData?.recruitername || [];

  const [currentLevel, setCurrentLevel] = useState({
    levelName: "",
    description: "",
    approvers: null,
    levelOrder: 1,
  });
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [groupName, setGroupName] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (editingLevel && visible) {
      setIsEditMode(true);
      setGroupName(editingLevel.groupName);

      const formattedLevels = editingLevel.levels.map((level) => ({
        ...level,
        // CHANGE THIS: Convert assignedRecruiters to approvers format
        approvers: level.assignedRecruiters?.[0]
          ? { user: level.assignedRecruiters[0]._id }
          : null,
      }));

      setLevels(formattedLevels);
      setCurrentLevel({
        levelName: "",
        description: "",
        approvers: null, // CHANGE: null instead of []
        levelOrder: formattedLevels.length + 1,
      });
    } else if (visible) {
      setIsEditMode(false);
      resetForm();
    }
  }, [editingLevel, visible]);

  const resetForm = () => {
    setLevels([]);
    setGroupName("");
    setCurrentLevel({
      levelName: "",
      description: "",
      approvers: null,
      levelOrder: 1,
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
    if (!currentLevel.levelName.trim()) {
      enqueueSnackbar("Level name is required", { variant: "error" });
      return;
    }

    const newLevel = {
      ...currentLevel,
      levelOrder: isEditingLevel ? currentLevel.levelOrder : levels.length + 1,
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
      levelName: "",
      description: "",
      approvers: null,
      levelOrder: levels.length + 2,
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
        // If you need actual API deletion, you should add a delete endpoint to your API
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
    if (!groupName || !groupName.trim()) {
      enqueueSnackbar("Group name is required", { variant: "error" });
      return;
    }

    if (levels.length === 0) {
      enqueueSnackbar("At least one level is required", { variant: "error" });
      return;
    }

    // Format the levels data to match your API expectations
    const levelData = {
      groupName: groupName.trim(),
      levels: levels.map((level) => {
        // Keep existing level data if it has an _id (already saved)
        const baseLevel = {
          levelName: level.levelName,
          description: level.description,
          levelOrder: level.levelOrder,
        };

        // If level has _id, include it to update existing level
        if (level._id) {
          baseLevel._id = level._id;
        }

        // Convert approvers to assignedRecruiters format
        if (level.approvers?.user) {
          baseLevel.assignedRecruiters = [{ _id: level.approvers.user }];
        } else if (level.assignedRecruiters) {
          // Keep existing assignedRecruiters if no changes
          baseLevel.assignedRecruiters = level.assignedRecruiters.map(
            (recruiter) => ({ _id: recruiter._id })
          );
        } else {
          baseLevel.assignedRecruiters = [];
        }

        return baseLevel;
      }),
    };

    try {
      setIsLoading(true);
      let result;
      if (isEditMode) {
        result = await updateApproval({
          id: editingLevel._id,
          ...levelData,
        }).unwrap();
      } else {
        result = await addApproval(levelData).unwrap();
      }

      enqueueSnackbar(
        `Approval flow ${isEditMode ? "updated" : "created"} successfully!`,
        { variant: "success" }
      );
      resetForm();
      onClose(result);
    } catch (error) {
      enqueueSnackbar(
        error.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} approval flow`,
        { variant: "error" }
      );
      console.error(
        `Approval flow ${isEditMode ? "update" : "creation"} error:`,
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
          {isEditMode ? "Edit Approval Flow" : "Create New Approval Flow"}
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
              Approval Flow Information
            </Text>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <Text strong style={{ color: "#2c3e50" }}>
              Group Name *
            </Text>
            <Input
              placeholder="e.g., Executive Approval, Manager Approval"
              size="large"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              style={{
                marginTop: "8px",
                borderRadius: "8px",
                border: "2px solid #e8f4fd",
                fontSize: "16px",
              }}
              prefix={<EditOutlined style={{ color: "#da2c46" }} />}
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
                Approval Levels
              </Text>
              <br />
              <Text
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                }}
              >
                Add approval levels to this flow
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
                  recruiters={recruiters}
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
              {isEditingLevel
                ? "Edit Approval Level"
                : "Add New Approval Level"}
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
                  Level Name *
                </Text>
                <Input
                  placeholder="e.g., HR Review, Manager Approval"
                  value={currentLevel.levelName}
                  onChange={(e) =>
                    setCurrentLevel((prev) => ({
                      ...prev,
                      levelName: e.target.value,
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
                  Level Order
                </Text>
                <Input
                  type="number"
                  min="1"
                  value={currentLevel.levelOrder}
                  onChange={(e) =>
                    setCurrentLevel((prev) => ({
                      ...prev,
                      levelOrder: parseInt(e.target.value) || 1,
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
              Approvers
            </Text>
            <Select
              placeholder="Select approver"
              loading={isRecruitersLoading}
              value={currentLevel.approvers?.user || undefined}
              onChange={(value) =>
                setCurrentLevel((prev) => ({
                  ...prev,
                  approvers: value ? { user: value } : null,
                }))
              }
              style={{
                width: "100%",
                marginTop: "8px",
              }}
              optionFilterProp="label"
              showSearch
              filterOption={(input, option) =>
                (option?.children?.toString()?.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
            >
              {recruiters.map((recruiter) => (
                <Option
                  key={recruiter._id}
                  value={recruiter._id}
                  label={`${recruiter.fullName} (${recruiter.email})`}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      size="small"
                      style={{
                        backgroundColor: "#da2c46",
                        marginRight: 8,
                        fontSize: "12px",
                      }}
                    >
                      {recruiter.fullName.charAt(0)}
                    </Avatar>
                    <div>
                      <Text strong>{recruiter.fullName}</Text>

                      <Text
                        type="secondary"
                        style={{ fontSize: "12px", marginLeft: 3 }}
                      >
                        ({recruiter.email})
                      </Text>
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

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
                    levelName: "",
                    description: "",
                    approvers: [],
                    levelOrder: levels.length + 1,
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
              ? "Update Flow"
              : "Create Flow"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateLevelModal;
