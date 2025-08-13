import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Table,
  Space,
  Modal,
  Tag,
  Typography,
  Divider,
  Row,
  Col,
  message,
  Popconfirm,
  Spin,
  Image,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  GlobalOutlined,
  UploadOutlined,
  MinusCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  useCreateNewsMutation,
  useGetNewsQuery,
  useDeleteNewsMutation,
} from "../../Slices/Employee/EmployeeApis";
import { useNavigate } from "react-router-dom";
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const EmployeeAdminNews = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const {
    data: companyNews,
    isLoading: isLoadingNews,
    refetch,
  } = useGetNewsQuery();
  const [createNews, { isLoading: isCreatingNews }] = useCreateNewsMutation();
  const [deleteNews, { isLoading: isDeletingNews }] = useDeleteNewsMutation();

  const customStyles = {
    primaryColor: "#da2c46",
    cardStyle: {
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(218, 44, 70, 0.1)",
      border: `1px solid rgba(218, 44, 70, 0.2)`,
    },
    buttonStyle: {
      backgroundColor: "#da2c46",
      borderColor: "#da2c46",
      borderRadius: "6px",
    },
  };

  const newsData =
    companyNews?.news?.map((item) => ({
      id: item._id,
      title: item.title,
      description: item.description || "",
      subsections:
        item.subsections?.map((sub) => ({
          id: sub._id,
          title: sub.subtitle,
          content: sub.subdescription,
          image: sub.image,
        })) || [],
      status: item.status || "draft",
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      coverImage: item.coverImage || "",
    })) || [];

  const createFileList = (imageUrl, fileName = "image") => {
    if (!imageUrl) return undefined;
    return {
      fileList: [
        {
          uid: "-1",
          name: fileName,
          status: "done",
          url: imageUrl,
          thumbUrl: imageUrl,
        },
      ],
    };
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("description", values.description || "");

      // Handle cover image
      if (values.coverImage?.fileList?.[0]) {
        const coverFile = values.coverImage.fileList[0];
        if (coverFile.originFileObj) {
          // New file upload
          formData.append("files", coverFile.originFileObj);
          formData.append("coverImage", coverFile.name);
        }
      }

      // Handle subsections
      if (values.subsections && values.subsections.length > 0) {
        values.subsections.forEach((section, index) => {
          formData.append(`subsections[${index}][subtitle]`, section.title);
          formData.append(
            `subsections[${index}][subdescription]`,
            section.content
          );

          // Handle subsection images
          if (section.image?.fileList?.[0]) {
            const imageFile = section.image.fileList[0];
            if (imageFile.originFileObj) {
              // New file upload
              formData.append("files", imageFile.originFileObj);
              formData.append(`subsections[${index}][image]`, imageFile.name);
            }
          } else {
            formData.append(`subsections[${index}][image]`, "");
          }
        });
      }

      const result = await createNews(formData).unwrap();
      message.success(result.message || "News created successfully!");
      form.resetFields();
      refetch();
    } catch (error) {
      console.error("Error creating news:", error);
      message.error(error?.data?.message || "Failed to create news");
    }
  };

  const handleEdit = (record) => {
    navigate(`/employee-admin/news/edit/${record.id}`);
  };

  const showDeleteConfirm = (record) => {
    setCurrentRecord(record);
    setDeleteModalVisible(true);
  };

  const handleDeleteNews = async () => {
    try {
      const result = await deleteNews(currentRecord.id).unwrap();
      message.success(result.message || "News deleted successfully!");
      setDeleteModalVisible(false);
       refetch();
    } catch (error) {
      console.error("Error deleting news:", error);
      message.error(error?.data?.message || "Failed to delete news");
    }
  };

  const showPublishConfirm = (record) => {
    setCurrentRecord(record);
    setPublishModalVisible(true);
  };

  const handlePublishNews = async () => {
    try {
      // Implement your publish/unpublish logic here
      // const result = await publishNews(currentRecord.id).unwrap();
      message.success("News status updated successfully!");
      setPublishModalVisible(false);
      refetch(); 
    } catch (error) {
      console.error("Error updating news status:", error);
      message.error(error?.data?.message || "Failed to update news status");
    }
  };

  const handleView = (record) => {
    navigate(`/employee-admin/news/view/${record.id}`);
  };

  const handleCancel = () => {
    form.resetFields();
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => (
        <Text strong style={{ color: "#da2c46" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Text ellipsis style={{ maxWidth: 200 }}>
          {text || "No description"}
        </Text>
      ),
    },
    {
      title: "Subsections",
      dataIndex: "subsections",
      key: "subsections",
      render: (subsections) => <Text>{subsections?.length || 0} sections</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "published" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
            type="text"
            title="View Details"
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            type="text"
            style={{ color: "#da2c46" }}
            title="Edit News"
          />
          <Button
            icon={<GlobalOutlined />}
            onClick={() => showPublishConfirm(record)}
            size="small"
            type="text"
            style={{
              color: record.status === "published" ? "#fa8c16" : "#52c41a",
            }}
            title={record.status === "published" ? "Unpublish" : "Publish"}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record)}
            size="small"
            type="text"
            danger
            title="Delete News"
          />
        </Space>
      ),
    },
  ];

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
    listType: "picture-card",
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
    onPreview: async (file) => {
      let src = file.url || file.thumbUrl;
      if (!src) {
        src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj);
          reader.onload = () => resolve(reader.result);
        });
      }
      const image = new Image();
      image.src = src;
      const imgWindow = window.open(src);
      imgWindow?.document.write(image.outerHTML);
    },
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <Card style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ marginBottom: "8px", color: "#da2c46" }}>
          <FileTextOutlined /> Company News Management
        </Title>
        <Paragraph type="secondary">
          Upload, create, view, edit, delete, and archive company news.
        </Paragraph>
      </Card>

      {/* News Creation Form */}
      <Row gutter={24} style={{ marginBottom: "32px" }}>
        <Col span={24}>
          <Card
            title={
              <span style={{ color: "#da2c46" }}>Create News Article</span>
            }
            style={customStyles.cardStyle}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="News Title"
                    name="title"
                    rules={[
                      { required: true, message: "Please enter news title" },
                    ]}
                  >
                    <Input
                      placeholder="Enter compelling news title"
                      style={{ borderRadius: "6px" }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Cover Image" name="coverImage">
                    <Upload {...uploadProps}>
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload Cover</div>
                      </div>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="News Description" name="description">
                <TextArea
                  rows={4}
                  placeholder="Write a comprehensive description of the news..."
                  style={{ borderRadius: "6px" }}
                />
              </Form.Item>

              <Divider orientation="left" style={{ color: "#da2c46" }}>
                <Text strong>Article Subsections</Text>
              </Divider>

              <Form.List name="subsections">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        size="small"
                        style={{
                          marginBottom: "16px",
                          border: `1px solid rgba(218, 44, 70, 0.1)`,
                        }}
                        extra={
                          <Button
                            type="text"
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            danger
                          />
                        }
                      >
                        <Form.Item
                          {...restField}
                          label="Subsection Title"
                          name={[name, "title"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter subsection title",
                            },
                          ]}
                        >
                          <Input placeholder="Enter subsection title" />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label="Subsection Content"
                          name={[name, "content"]}
                          rules={[
                            {
                              required: true,
                              message: "Please enter subsection content",
                            },
                          ]}
                        >
                          <TextArea
                            rows={3}
                            placeholder="Write subsection content..."
                          />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          label="Subsection Image"
                          name={[name, "image"]}
                        >
                          <Upload {...uploadProps}>
                            <div>
                              <PlusOutlined />
                              <div style={{ marginTop: 8 }}>Upload Image</div>
                            </div>
                          </Upload>
                        </Form.Item>
                      </Card>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                        style={{
                          width: "100%",
                          borderColor: "#da2c46",
                          color: "#da2c46",
                          borderRadius: "6px",
                        }}
                      >
                        Add Subsection
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>

              <Form.Item style={{ marginTop: "24px" }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isCreatingNews}
                  size="large"
                  style={customStyles.buttonStyle}
                  icon={<FileTextOutlined />}
                >
                  Create News
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      {/* News Table */}
      <Row gutter={24}>
        <Col span={24}>
          <Card
            title={
              <span style={{ color: "#da2c46" }}>Company News Articles</span>
            }
            style={customStyles.cardStyle}
          >
            <Table
              columns={columns}
              dataSource={newsData}
              rowKey="id"
              loading={isLoadingNews}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} articles`,
              }}
              locale={{
                emptyText: "No news articles created yet",
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Delete News Article"
        visible={deleteModalVisible}
        onOk={handleDeleteNews}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Yes, Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        confirmLoading={isDeletingNews}
        width={450}
      >
        <div>
          <p>
            Are you sure you want to delete{" "}
            <strong>"{currentRecord?.title}"</strong>?
          </p>
          <p style={{ color: "#666", fontSize: "14px" }}>
            This action cannot be undone. The news article and all its content
            will be permanently removed.
          </p>
        </div>
      </Modal>

      <Modal
        title={`${
          currentRecord?.status === "published" ? "Unpublish" : "Publish"
        } News Article`}
        visible={publishModalVisible}
        onOk={handlePublishNews}
        onCancel={() => setPublishModalVisible(false)}
        okText={`Yes, ${
          currentRecord?.status === "published" ? "Unpublish" : "Publish"
        }`}
        okButtonProps={{
          style: {
            backgroundColor:
              currentRecord?.status === "published" ? "#fa8c16" : "#52c41a",
            borderColor:
              currentRecord?.status === "published" ? "#fa8c16" : "#52c41a",
          },
        }}
        cancelText="Cancel"
        width={450}
      >
        <div>
          <p>
            Are you sure you want to{" "}
            {currentRecord?.status === "published" ? "unpublish" : "publish"}{" "}
            <strong>"{currentRecord?.title}"</strong>?
          </p>
          <p style={{ color: "#666", fontSize: "14px" }}>
            {currentRecord?.status === "published"
              ? "This will make the news article private and remove it from public view."
              : "This will make the news article public and visible to all employees."}
          </p>
        </div>
      </Modal>

      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
        .ant-modal-confirm .ant-modal-confirm-title {
          font-weight: 600;
        }
        .ant-modal-confirm .ant-modal-confirm-content {
          margin-top: 16px;
        }
        .ant-upload-select-picture-card i {
          font-size: 32px;
          color: #999;
        }
        .ant-upload-select-picture-card .ant-upload-text {
          margin-top: 8px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default EmployeeAdminNews;
