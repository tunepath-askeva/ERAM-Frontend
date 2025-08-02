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
  Alert,
  Descriptions,
  Collapse,
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
  useUpdatePolicyMutation,
  useDeletePolicyMutation,
  useArchivePolicyMutation,
  useSearchPoliciesQuery,
} from "../../Slices/Employee/EmployeeApis";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const EmployeeAdminCompanyPolicy = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [previewMode, setPreviewMode] = useState(false);

  const [uploadPolicyDocument, { isLoading: isUploading }] =
    useUploadPolicyDocumentMutation();
  const [createPolicy, { isLoading: isCreating }] = useCreatePolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] = useUpdatePolicyMutation();
  const [deletePolicy] = useDeletePolicyMutation();
  const [archivePolicy] = useArchivePolicyMutation();

  const {
    data: policiesResponse,
    isLoading: isLoadingPolicies,
    refetch: refetchPolicies,
  } = useGetPoliciesQuery({
    page: 1,
    limit: 50,
    search: searchTerm,
    status: statusFilter,
  });

  const policies = policiesResponse?.data || [];

  const handleFileUpload = async (file) => {
    try {
      setUploadStatus("uploading");
      setUploadedFile(file);

      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(
          "Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only."
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(
          "File size too large. Please upload files smaller than 10MB."
        );
      }

      console.log(
        "Uploading file:",
        file.name,
        "Size:",
        file.size,
        "Type:",
        file.type
      );

      const result = await uploadPolicyDocument(file).unwrap();

      console.log("Upload result:", result);

      const data = result.data || result;
      setParsedData(data);
      setUploadStatus("success");

      form.setFieldsValue({
        title:
          data.title ||
          data.documentTitle ||
          file.name.replace(/\.[^/.]+$/, ""),
        version: data.version || "1.0",
        content: data.content || data.text || data.extractedText || "",
        department: data.department || "",
      });

      notification.success({
        message: "Document Uploaded Successfully",
        description: `The document "${file.name}" has been parsed successfully.`,
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");

      notification.error({
        message: "Upload Failed",
        description:
          error.message ||
          error.data?.message ||
          `Failed to upload "${file.name}".`,
      });

      setUploadedFile(null);
      setParsedData(null);
    }

    return false;
  };

  const handleCreatePolicy = async (values) => {
    try {
      const payload = {
        title: values.title,
        createdAt: new Date().toISOString(),
        status: "active",
        content:
          (parsedData?.paragraphs && parsedData.paragraphs.join("\n\n")) ||
          parsedData?.content ||
          parsedData?.text ||
          parsedData?.extractedText ||
          "",
      };

      await createPolicy(payload).unwrap();

      notification.success({
        message: "Policy Created Successfully",
        description: "The company policy has been saved to the database.",
        icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
      });

      resetForm();
      refetchPolicies();
    } catch (error) {
      notification.error({
        message: "Create Failed",
        description: error.data?.message || "Failed to create the policy.",
      });
    }
  };

  const handleUpdatePolicy = async (values) => {
    try {
      const updateData = {
        title: values.title,
        content: values.content,
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

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setViewModalVisible(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    editForm.setFieldsValue({
      title: policy.title,
      content: policy.content,
    });
    setEditModalVisible(true);
  };

  const resetForm = () => {
    form.resetFields();
    setUploadedFile(null);
    setParsedData(null);
    setUploadStatus("idle");
    setPreviewMode(false);
  };

  const renderParsedDataDisplay = () => {
    if (!parsedData) return null;

    const getContentText = () => {
      if (parsedData.paragraphs && Array.isArray(parsedData.paragraphs)) {
        return parsedData.paragraphs.join("\n\n");
      }
      return (
        parsedData.content || parsedData.text || parsedData.extractedText || ""
      );
    };

    const contentText = getContentText();
    const totalLength = contentText.length;

    return (
      <Card
        title="Document Preview"
        size="small"
        style={{ height: "100%", display: "flex", flexDirection: "column" }}
      >
        <div style={{ flex: 1, overflow: "auto" }}>
          {parsedData.message && (
            <div style={{ marginBottom: 12 }}>
              <Text strong>Parse Status: </Text>
              <Tag color="green">{parsedData.message}</Tag>
            </div>
          )}

          {parsedData.paragraphs && (
            <div style={{ marginBottom: 12 }}>
              <Text strong>Paragraphs Found: </Text>
              <Tag color="blue">{parsedData.paragraphs.length}</Tag>
            </div>
          )}

          {totalLength > 0 && (
            <div style={{ marginBottom: 12 }}>
              <Text strong>Total Content Length: </Text>
              <Tag color="green">{totalLength} characters</Tag>
            </div>
          )}

          {contentText && (
            <div>
              <div
                style={{
                  marginTop: 8,
                  padding: "16px",
                  background: "#fafafa",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                  maxHeight: "400px",
                  overflow: "auto",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
                }}
              >
                {contentText.split("\n").map((line, index) => {
                  const trimmedLine = line.trim();

                  if (!trimmedLine) {
                    return <br key={index} />;
                  }
                  if (
                    trimmedLine.match(
                      /^[A-Z][A-Za-z\s]+(Document|Policy|Manual)$/
                    )
                  ) {
                    return (
                      <div
                        key={index}
                        style={{
                          fontWeight: "bold",
                          fontSize: "18px",
                          color: "#1890ff",
                          textAlign: "center",
                          marginBottom: "20px",
                          marginTop: "10px",
                          borderBottom: "2px solid #1890ff",
                          paddingBottom: "8px",
                        }}
                      >
                        {trimmedLine}
                      </div>
                    );
                  }

                  if (trimmedLine.match(/^\d+\.\s+[A-Z]/)) {
                    return (
                      <div
                        key={index}
                        style={{
                          fontWeight: "bold",
                          fontSize: "16px",
                          color: "#1890ff",
                          marginTop: "20px",
                          marginBottom: "12px",
                          paddingLeft: "0px",
                        }}
                      >
                        {trimmedLine}
                      </div>
                    );
                  }

                  if (trimmedLine.endsWith(":") && trimmedLine.length < 100) {
                    return (
                      <div
                        key={index}
                        style={{
                          fontWeight: "600",
                          fontSize: "15px",
                          color: "#595959",
                          marginTop: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        {trimmedLine}
                      </div>
                    );
                  }

                  if (trimmedLine.match(/^[-•\*]\s/)) {
                    return (
                      <div
                        key={index}
                        style={{
                          marginLeft: "20px",
                          marginBottom: "6px",
                          color: "#333",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            color: "#1890ff",
                            fontWeight: "bold",
                            marginRight: "8px",
                          }}
                        >
                          •
                        </span>
                        {trimmedLine.substring(2)}
                      </div>
                    );
                  }

                  if (
                    trimmedLine.match(/^\d+\.\s/) &&
                    !trimmedLine.match(/^\d+\.\s+[A-Z][A-Za-z\s]+$/)
                  ) {
                    return (
                      <div
                        key={index}
                        style={{
                          marginLeft: "20px",
                          marginBottom: "6px",
                          color: "#333",
                        }}
                      >
                        {trimmedLine}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={index}
                      style={{
                        marginBottom: "10px",
                        textAlign: "justify",
                        color: "#333",
                        textIndent: "0px",
                      }}
                    >
                      {trimmedLine}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div style={{ marginTop: "16px" }}>
          <Form form={form} layout="vertical" onFinish={handleCreatePolicy}>
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

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={isCreating}
                  style={{ backgroundColor: "#da2c46" }}
                >
                  Create Policy
                </Button>
                <Button
                  onClick={() => setPreviewMode(true)}
                  icon={<EyeOutlined />}
                >
                  Preview
                </Button>
                <Button onClick={resetForm}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      </Card>
    );
  };

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
    accept: ".pdf,.doc,.docx,.txt",
    beforeUpload: handleFileUpload,
    showUploadList: false,
    disabled: isUploading,
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      <Card style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px", color: "#da2c46" }}>
          <FileTextOutlined /> Company Policy Management
        </Title>
        <Paragraph type="secondary">
          Upload, create, view, edit, delete, and archive company policies with
          automatic content parsing.
        </Paragraph>
      </Card>

      {/* Upload and Preview Section */}
      <Row gutter={[24, 24]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="Upload Policy Document" style={{ height: "100%" }}>
            {uploadStatus === "idle" && !parsedData && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Upload.Dragger
                  {...uploadProps}
                  style={{ background: "#fafafa" }}
                >
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined
                      style={{ fontSize: "48px", color: "#da2c46" }}
                    />
                  </p>
                  <p
                    className="ant-upload-text"
                    style={{ fontSize: "16px", fontWeight: "500" }}
                  >
                    Click or drag file to upload
                  </p>
                  <p className="ant-upload-hint" style={{ color: "#666" }}>
                    Supports PDF, DOC, DOCX, TXT (max 10MB)
                  </p>
                </Upload.Dragger>
              </div>
            )}

            {uploadStatus === "uploading" && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
                <p
                  style={{
                    marginTop: "16px",
                    color: "#1890ff",
                    fontSize: "16px",
                  }}
                >
                  Uploading and parsing document...
                </p>
              </div>
            )}

            {uploadStatus === "error" && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Alert
                  message="Upload Failed"
                  description="There was an error uploading or parsing your document."
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
                <Button onClick={resetForm}>Try Again</Button>
              </div>
            )}

            {uploadStatus === "success" && parsedData && (
              <Alert
                message="Upload Successful"
                description="Document has been uploaded and parsed successfully."
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          {uploadStatus === "success" && parsedData ? (
            renderParsedDataDisplay()
          ) : (
            <Card title="Document Preview" style={{ height: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  minHeight: "300px",
                  color: "#bfbfbf",
                }}
              >
                <Text type="secondary">
                  {uploadStatus === "idle"
                    ? "Upload a document to see the preview"
                    : "Processing document..."}
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Policies Table Section */}
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

      {/* Modals */}
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
            style={{ backgroundColor: "#da2c46" }}
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

          <Form.Item
            name="content"
            label="Policy Content"
            rules={[{ required: true, message: "Please enter policy content" }]}
          >
            <TextArea
              rows={10}
              placeholder="Enter policy content"
              style={{ whiteSpace: "pre-wrap" }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{ backgroundColor: "#da2c46" }}
                loading={isUpdating}
              >
                Update Policy
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Policy Preview"
        open={previewMode}
        onCancel={() => setPreviewMode(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewMode(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        <div>
          <Title level={3}>
            {form.getFieldValue("title") || "Untitled Policy"}
          </Title>
          <Divider />
          <div
            style={{
              whiteSpace: "pre-wrap",
              maxHeight: "400px",
              overflow: "auto",
              padding: "16px",
              background: "#fafafa",
              borderRadius: "6px",
              fontSize: "14px",
              lineHeight: "1.6",
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            }}
          >
            {(() => {
              if (!parsedData) return "No content available";

              if (
                parsedData.paragraphs &&
                Array.isArray(parsedData.paragraphs)
              ) {
                return parsedData.paragraphs.join("\n\n");
              }

              return (
                parsedData.content ||
                parsedData.text ||
                parsedData.extractedText ||
                "No content available"
              );
            })()}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeAdminCompanyPolicy;
