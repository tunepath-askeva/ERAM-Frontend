import React, { useState } from "react";
import {
  Upload,
  Button,
  Card,
  Typography,
  Form,
  Input,
  Space,
  Divider,
  notification,
  Spin,
  Row,
  Col,
  Tag,
  Modal,
  Table,
  Select,
  Popconfirm,
  Badge,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  EditOutlined,
  SaveOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  InboxOutlined,
} from "@ant-design/icons";

import {
  useUploadPolicyDocumentMutation,
  useCreatePolicyMutation,
  useGetPoliciesQuery,
  useGetPolicyByIdQuery,
  useUpdatePolicyMutation,
  useDeletePolicyMutation,
  useArchivePolicyMutation,
  useSearchPoliciesQuery,
} from "../../Slices/Employee/EmployeeApis";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EmployeeAdminCompanyPolicy = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // State management
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  // RTK Query hooks
  const [uploadPolicyDocument, { isLoading: isUploading }] =
    useUploadPolicyDocumentMutation();
  const [createPolicy, { isLoading: isCreating }] = useCreatePolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();
  const [deletePolicy] = useDeletePolicyMutation();
  const [archivePolicy] = useArchivePolicyMutation();

  // Queries
  const {
    data: policiesResponse,
    isLoading: isLoadingPolicies,
    refetch: refetchPolicies,
  } = useGetPoliciesQuery({
    page: 1,
    limit: 100,
    search: searchTerm,
    status: statusFilter,
  });

  const policies = policiesResponse?.data || [];

  // Handle file upload and parsing
  const handleFileUpload = async (file) => {
    try {
      setUploadedFile(file);

      // Validate file
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Invalid file type. Please upload PDF, DOC, or DOCX files only."
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error(
          "File size too large. Please upload files smaller than 10MB."
        );
      }

      // Upload and parse document
      const result = await uploadPolicyDocument(file).unwrap();
      setParsedData(result.data);

      // Pre-fill form with parsed data
      form.setFieldsValue({
        title: result.data.title || "",
        version: result.data.version || "1.0",
        description: result.data.description || "",
        content: result.data.content || "",
        department: result.data.department || "",
        tags: result.data.tags?.join(", ") || "",
      });

      notification.success({
        message: "Document Uploaded Successfully",
        description:
          "The policy document has been parsed and is ready for review.",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (error) {
      notification.error({
        message: "Upload Failed",
        description:
          error.message ||
          error.data?.message ||
          "Failed to upload and parse the document.",
      });
      setUploadedFile(null);
    }

    return false;
  };

  // Handle create new policy
  const handleCreatePolicy = async (values) => {
    try {
      const policyData = {
        ...values,
        tags: values.tags
          ? values.tags.split(",").map((tag) => tag.trim())
          : [],
        originalFileName: uploadedFile?.name,
        fileSize: uploadedFile?.size,
        fileType: uploadedFile?.type,
        parsedData,
      };

      await createPolicy(policyData).unwrap();

      notification.success({
        message: "Policy Created Successfully",
        description: "The company policy has been saved to the database.",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });

      // Reset form and state
      resetForm();
      refetchPolicies();
    } catch (error) {
      notification.error({
        message: "Create Failed",
        description: error.data?.message || "Failed to create the policy.",
      });
    }
  };

  // Handle update policy
  const handleUpdatePolicy = async (values) => {
    try {
      const updateData = {
        ...values,
        tags: values.tags
          ? values.tags.split(",").map((tag) => tag.trim())
          : [],
      };

      await updatePolicy({
        id: selectedPolicy.id,
        ...updateData,
      }).unwrap();

      notification.success({
        message: "Policy Updated Successfully",
        description: "The policy has been updated.",
      });

      setEditModalVisible(false);
      setSelectedPolicy(null);
      refetchPolicies();
    } catch (error) {
      notification.error({
        message: "Update Failed",
        description: error.data?.message || "Failed to update the policy.",
      });
    }
  };

  // Handle delete policy
  const handleDeletePolicy = async (policyId) => {
    try {
      await deletePolicy(policyId).unwrap();
      notification.success({
        message: "Policy Deleted",
        description: "The policy has been permanently deleted.",
      });
      refetchPolicies();
    } catch (error) {
      notification.error({
        message: "Delete Failed",
        description: error.data?.message || "Failed to delete the policy.",
      });
    }
  };

  // Handle archive policy
  const handleArchivePolicy = async (policyId) => {
    try {
      await archivePolicy(policyId).unwrap();
      notification.success({
        message: "Policy Archived",
        description: "The policy has been archived.",
      });
      refetchPolicies();
    } catch (error) {
      notification.error({
        message: "Archive Failed",
        description: error.data?.message || "Failed to archive the policy.",
      });
    }
  };

  // Handle view policy
  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setViewModalVisible(true);
  };

  // Handle edit policy
  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    editForm.setFieldsValue({
      ...policy,
      tags: Array.isArray(policy.tags)
        ? policy.tags.join(", ")
        : policy.tags || "",
    });
    setEditModalVisible(true);
  };

  // Reset form
  const resetForm = () => {
    form.resetFields();
    setUploadedFile(null);
    setParsedData(null);
    setPreviewMode(false);
  };

  // Table columns
  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <Text
            strong
            style={{ cursor: "pointer" }}
            onClick={() => handleViewPolicy(record)}
          >
            {text}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            v{record.version}
          </Text>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (text) => (text ? <Tag color="blue">{text}</Tag> : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Badge
          status={status === "active" ? "success" : "default"}
          text={status.charAt(0).toUpperCase() + status.slice(1)}
        />
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewPolicy(record)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPolicy(record)}
          >
            Edit
          </Button>
          <Button
            size="small"
            onClick={() => handleArchivePolicy(record.id)}
            disabled={record.status === "archived"}
          >
            Archive
          </Button>
          <Popconfirm
            title="Delete Policy"
            description="Are you sure you want to permanently delete this policy?"
            onConfirm={() => handleDeletePolicy(record.id)}
            okText="Yes"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.doc,.docx",
    beforeUpload: handleFileUpload,
    showUploadList: false,
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <Card style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px", color: "#1890ff" }}>
          <FileTextOutlined /> Company Policy Management
        </Title>
        <Paragraph type="secondary">
          Upload, create, view, edit, delete, and archive company policies with
          automatic content parsing.
        </Paragraph>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={10}>
          {/* Upload Section */}
          <Card
            title="Upload New Policy Document"
            style={{ marginBottom: "24px" }}
          >
            {!parsedData ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Upload.Dragger
                  {...uploadProps}
                  style={{ background: "#fafafa" }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined
                      style={{ fontSize: "48px", color: "#1890ff" }}
                    />
                  </p>
                  <p
                    className="ant-upload-text"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    Click or drag file to upload
                  </p>
                  <p className="ant-upload-hint" style={{ color: "#666" }}>
                    Supports PDF, DOC, DOCX (max 10MB)
                  </p>
                </Upload.Dragger>

                {isUploading && (
                  <div style={{ marginTop: "16px" }}>
                    <Spin size="large" />
                    <p style={{ marginTop: "12px", color: "#1890ff" }}>
                      Uploading and parsing document...
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div
                  style={{
                    marginBottom: "16px",
                    padding: "12px",
                    background: "#f6ffed",
                    border: "1px solid #b7eb8f",
                    borderRadius: "6px",
                  }}
                >
                  <CheckCircleOutlined
                    style={{ color: "#52c41a", marginRight: "8px" }}
                  />
                  <Text>Document parsed successfully: </Text>
                  <Tag color="blue">{uploadedFile?.name}</Tag>
                </div>

                {previewMode ? (
                  <div
                    style={{
                      padding: "16px",
                      background: "#fafafa",
                      borderRadius: "6px",
                      marginBottom: "16px",
                    }}
                  >
                    <Title level={4}>{form.getFieldValue("title")}</Title>
                    <Space style={{ marginBottom: "12px" }}>
                      <Tag>Version: {form.getFieldValue("version")}</Tag>
                      <Tag>Department: {form.getFieldValue("department")}</Tag>
                    </Space>
                    <Paragraph>{form.getFieldValue("description")}</Paragraph>
                    <Divider />
                    <div
                      style={{
                        whiteSpace: "pre-wrap",
                        maxHeight: "300px",
                        overflow: "auto",
                      }}
                    >
                      {form.getFieldValue("content")}
                    </div>
                  </div>
                ) : (
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreatePolicy}
                  >
                    <Form.Item
                      name="title"
                      label="Policy Title"
                      rules={[
                        {
                          required: true,
                          message: "Please enter policy title",
                        },
                      ]}
                    >
                      <Input placeholder="Enter policy title" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="version"
                          label="Version"
                          rules={[
                            { required: true, message: "Please enter version" },
                          ]}
                        >
                          <Input placeholder="e.g., 1.0" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="department" label="Department">
                          <Select placeholder="Select department">
                            <Option value="HR">Human Resources</Option>
                            <Option value="IT">Information Technology</Option>
                            <Option value="Finance">Finance</Option>
                            <Option value="Operations">Operations</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="description" label="Description">
                      <TextArea
                        rows={3}
                        placeholder="Brief description of the policy"
                      />
                    </Form.Item>

                    <Form.Item name="tags" label="Tags (comma separated)">
                      <Input placeholder="e.g., HR, Security, Compliance" />
                    </Form.Item>

                    <Form.Item
                      name="content"
                      label="Policy Content"
                      rules={[
                        {
                          required: true,
                          message: "Please enter policy content",
                        },
                      ]}
                    >
                      <TextArea
                        rows={8}
                        placeholder="Detailed policy content..."
                      />
                    </Form.Item>

                    <Form.Item>
                      <Space>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          loading={isCreating}
                        >
                          Create Policy
                        </Button>
                        <Button
                          onClick={() => setPreviewMode(!previewMode)}
                          icon={<EyeOutlined />}
                        >
                          {previewMode ? "Edit" : "Preview"}
                        </Button>
                        <Button onClick={resetForm}>Clear</Button>
                      </Space>
                    </Form.Item>
                  </Form>
                )}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          {/* Policy List */}
          <Card
            title="Existing Policies"
            extra={
              <Space>
                <Input
                  placeholder="Search policies..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 200 }}
                />
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 120 }}
                >
                  <Option value="active">Active</Option>
                  <Option value="archived">Archived</Option>
                  <Option value="">All</Option>
                </Select>
              </Space>
            }
          >
            <Table
              columns={columns}
              dataSource={policies}
              rowKey="id"
              loading={isLoadingPolicies}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} policies`,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* View Policy Modal */}
      <Modal
        title="View Policy"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setViewModalVisible(false);
              handleEditPolicy(selectedPolicy);
            }}
          >
            Edit
          </Button>,
        ]}
        width={800}
      >
        {selectedPolicy && (
          <div>
            <Title level={3}>{selectedPolicy.title}</Title>
            <Space style={{ marginBottom: "16px" }}>
              <Tag>Version: {selectedPolicy.version}</Tag>
              <Tag>Department: {selectedPolicy.department}</Tag>
              <Badge
                status={
                  selectedPolicy.status === "active" ? "success" : "default"
                }
                text={selectedPolicy.status}
              />
            </Space>
            <Paragraph>{selectedPolicy.description}</Paragraph>
            <Divider />
            <div
              style={{
                whiteSpace: "pre-wrap",
                maxHeight: "400px",
                overflow: "auto",
                padding: "16px",
                background: "#fafafa",
                borderRadius: "6px",
              }}
            >
              {selectedPolicy.content}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Policy Modal */}
      <Modal
        title="Edit Policy"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdatePolicy}>
          <Form.Item
            name="title"
            label="Policy Title"
            rules={[{ required: true, message: "Please enter policy title" }]}
          >
            <Input placeholder="Enter policy title" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="version"
                label="Version"
                rules={[{ required: true, message: "Please enter version" }]}
              >
                <Input placeholder="e.g., 1.0" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Department">
                <Select placeholder="Select department">
                  <Option value="HR">Human Resources</Option>
                  <Option value="IT">Information Technology</Option>
                  <Option value="Finance">Finance</Option>
                  <Option value="Operations">Operations</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} placeholder="Brief description of the policy" />
          </Form.Item>

          <Form.Item name="tags" label="Tags (comma separated)">
            <Input placeholder="e.g., HR, Security, Compliance" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Policy Content"
            rules={[{ required: true, message: "Please enter policy content" }]}
          >
            <TextArea rows={10} placeholder="Detailed policy content..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Update Policy
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EmployeeAdminCompanyPolicy;
