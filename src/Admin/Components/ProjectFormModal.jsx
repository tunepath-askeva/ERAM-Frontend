import React, { useState, useEffect } from "react";
import { Modal, Input, Button, Typography, message } from "antd";
import {
  PlusOutlined,
  ProjectOutlined,
  FileTextOutlined,
  TagOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useAddProjectMutation,
  useEditProjectMutation,
  useGetAdminBranchQuery,
} from "../../Slices/Admin/AdminApis";

const { Text } = Typography;
const { TextArea } = Input;

const ProjectFormModal = ({
  visible,
  onCancel,
  onSuccess,
  editProject = null,
  mode = "create",
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    prefix: "",
    description: "",
  });
  const [errors, setErrors] = useState({});

  const [addProject] = useAddProjectMutation();
  const [updateProject] = useEditProjectMutation();

  const { data: branchData, isLoading: isBranchLoading } =
    useGetAdminBranchQuery();
  const branchOrder = branchData?.branch?.branchOrder || "";

  useEffect(() => {
    if (visible) {
      if (mode === "edit" && editProject) {
        // For edit mode, split the prefix to show only the part before the branch order
        const prefixParts = editProject.prefix?.split("-") || [];
        const prefixWithoutOrder = prefixParts.slice(0, -1).join("-");

        setFormData({
          name: editProject.name || "",
          prefix: prefixWithoutOrder,
          description: editProject.description || "",
        });
      } else {
        setFormData({ name: "", prefix: "", description: "" });
      }
      setErrors({});
    }
  }, [visible, mode, editProject]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please enter project name!";
    } else if (formData.name.length < 3) {
      newErrors.name = "Project name must be at least 3 characters!";
    } else if (formData.name.length > 50) {
      newErrors.name = "Project name cannot exceed 50 characters!";
    }

    if (!formData.prefix.trim()) {
      newErrors.prefix = "Please enter project prefix!";
    } else if (!/^[A-Za-z0-9_-]+$/.test(formData.prefix)) {
      newErrors.prefix =
        "Prefix can only contain letters, numbers, hyphens, and underscores!";
    } else if (formData.prefix.length < 2 || formData.prefix.length > 10) {
      newErrors.prefix = "Prefix must be between 2-10 characters!";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Please enter project description!";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters!";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const finalFormData = {
        ...formData,
        prefix: formData.prefix
          ? `${formData.prefix}-${branchOrder}`
          : branchOrder,
      };

      if (mode === "edit" && editProject) {
        await updateProject({
          id: editProject._id,
          ...finalFormData,
        }).unwrap();
        message.success("Project updated successfully!");
      } else {
        await addProject(finalFormData).unwrap();
        message.success("Project created successfully!");
      }

      handleReset();
      onSuccess?.();
    } catch (error) {
      console.error("Error:", error);
      message.error(error?.data?.message || `Failed to ${mode} project`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "prefix") {
      if (mode === "edit" && editProject) {
        return;
      }
      value = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleReset = () => {
    setFormData({ name: "", prefix: "", description: "" });
    setErrors({});
  };

  const handleCancel = () => {
    handleReset();
    onCancel?.();
  };

  const isEdit = mode === "edit";
  const modalTitle = isEdit ? "Edit Project" : "Create New Project";
  const submitButtonText = isEdit ? "Update Project" : "Create Project";
  const submitIcon = isEdit ? <EditOutlined /> : <PlusOutlined />;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          {isEdit ? (
            <EditOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          ) : (
            <PlusOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          )}
          {modalTitle}
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width="90%"
      style={{ maxWidth: 600 }}
      centered
      footer={[
        <Button key="cancel" onClick={handleCancel} size="large">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          size="large"
          icon={submitIcon}
          style={{
            background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            border: "none",
          }}
        >
          {submitButtonText}
        </Button>,
      ]}
      destroyOnClose
      maskClosable={false}
    >
      <div style={{ padding: "16px 0" }}>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, color: "#2c3e50" }}
          >
            <ProjectOutlined style={{ marginRight: 6 }} />
            Project Name *
          </label>
          <Input
            size="large"
            placeholder="Enter your project name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            status={errors.name ? "error" : ""}
          />
          {errors.name && (
            <Text
              type="danger"
              style={{ fontSize: "12px", marginTop: 4, display: "block" }}
            >
              {errors.name}
            </Text>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, color: "#2c3e50" }}
          >
            <TagOutlined style={{ marginRight: 6 }} />
            Project Prefix *
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Input
              size="large"
              placeholder="e.g., PROJ"
              value={formData.prefix}
              onChange={(e) => handleInputChange("prefix", e.target.value)}
              status={errors.prefix ? "error" : ""}
              style={{ flex: 1 }}
            />
            <div
              style={{
                padding: "0 12px",
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f0f0",
                borderRadius: 6,
                minWidth: 40,
              }}
            >
              {branchOrder || "-"}
            </div>
          </div>
          <Text
            style={{
              color: "#8c8c8c",
              fontSize: "12px",
              marginTop: 4,
              display: "block",
            }}
          >
            A unique identifier (2-10 characters, letters, numbers, - and _
            only).
            {branchOrder &&
              ` Your prefix will be saved as ${
                formData.prefix
                  ? formData.prefix + "-" + branchOrder
                  : branchOrder
              }`}
          </Text>
          {errors.prefix && (
            <Text
              type="danger"
              style={{ fontSize: "12px", marginTop: 4, display: "block" }}
            >
              {errors.prefix}
            </Text>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, color: "#2c3e50" }}
          >
            <FileTextOutlined style={{ marginRight: 6 }} />
            Description *
          </label>
          <TextArea
            rows={4}
            placeholder="Describe your project goals, objectives, and key features..."
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            status={errors.description ? "error" : ""}
          />
          {errors.description && (
            <Text
              type="danger"
              style={{ fontSize: "12px", marginTop: 4, display: "block" }}
            >
              {errors.description}
            </Text>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProjectFormModal;
