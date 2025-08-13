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
  Drawer,
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
} from "@ant-design/icons";
import { useCreateNewsMutation } from "../../Slices/Employee/EmployeeApis";
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

const EmployeeAdminNews = () => {
  const [form] = Form.useForm();
  const [newsData, setNewsData] = useState([]);
  const [editingNews, setEditingNews] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [viewingNews, setViewingNews] = useState(null);

  const [createNews, { isLoading: isCreatingNews }] = useCreateNewsMutation();

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

  const handleSubmit = async (values) => {
    try {
      if (editingNews) {
        const updatedNews = {
          id: editingNews.id,
          ...values,
          status: editingNews.status,
          createdAt: editingNews.createdAt,
          updatedAt: new Date().toISOString(),
          coverImage:
            values.coverImage?.fileList?.[0]?.name || editingNews.coverImage,
        };

        setNewsData((prev) =>
          prev.map((item) => (item.id === editingNews.id ? updatedNews : item))
        );
        message.success("News updated successfully!");
        form.resetFields();
        setEditingNews(null);
      } else {
        const formData = new FormData();

        formData.append("title", values.title);
        formData.append("description", values.description);

        if (
          values.coverImage &&
          values.coverImage.fileList &&
          values.coverImage.fileList[0]
        ) {
          formData.append("files", values.coverImage.fileList[0].originFileObj);
          formData.append("coverImage", values.coverImage.fileList[0].name);
        }

        if (values.subsections && values.subsections.length > 0) {
          values.subsections.forEach((section, index) => {
            // Append each subsection field with array notation
            formData.append(`subsections[${index}][subtitle]`, section.title);
            formData.append(
              `subsections[${index}][subdescription]`,
              section.content
            );

            if (section.image?.fileList?.[0]) {
              formData.append("files", section.image.fileList[0].originFileObj);
              formData.append(
                `subsections[${index}][image]`,
                section.image.fileList[0].name
              );
            } else {
              formData.append(`subsections[${index}][image]`, "");
            }
          });
        }
        const result = await createNews(formData).unwrap();

        const newNewsItem = {
          id: result.news.id,
          title: result.news.title,
          description: result.news.description,
          subsections:
            result.news.subsections?.map((sub) => ({
              title: sub.subtitle,
              content: sub.subdescription,
              image: sub.image,
            })) || [],
          status: "published",
          createdAt: result.news.createdAt,
          updatedAt: result.news.updatedAt,
          coverImage: result.news.coverImage,
        };

        setNewsData((prev) => [...prev, newNewsItem]);
        message.success(result.message || "News created successfully!");
        form.resetFields();
      }
    } catch (error) {
      console.error("Error submitting news:", error);
      message.error(error?.data?.message || "Failed to save news");
    }
  };

  const handleEdit = (record) => {
    setEditingNews(record);
    form.setFieldsValue({
      ...record,
      coverImage: record.coverImage
        ? { fileList: [{ name: record.coverImage }] }
        : undefined,
      subsections:
        record.subsections?.map((section) => ({
          ...section,
          image: section.image
            ? { fileList: [{ name: section.image }] }
            : undefined,
        })) || [],
    });
  };

  const handleDelete = (id) => {
    setNewsData((prev) => prev.filter((item) => item.id !== id));
    message.success("News deleted successfully!");
  };

  const handlePublish = (id) => {
    setNewsData((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: item.status === "published" ? "draft" : "published",
            }
          : item
      )
    );
    message.success("News status updated!");
  };

  const handleView = (record) => {
    setViewingNews(record);
    setViewDrawerVisible(true);
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
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
            type="text"
            style={{ color: "#da2c46" }}
          />
          <Button
            icon={<GlobalOutlined />}
            onClick={() => handlePublish(record.id)}
            size="small"
            type="text"
            style={{
              color: record.status === "published" ? "#52c41a" : "#1890ff",
            }}
          />
          <Popconfirm
            title="Are you sure you want to delete this news?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" type="text" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: "image/*",
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
              <span style={{ color: "#da2c46" }}>
                {editingNews ? "Edit News Article" : "Create News Article"}
              </span>
            }
            style={customStyles.cardStyle}
            extra={
              editingNews && (
                <Button
                  onClick={() => {
                    setEditingNews(null);
                    form.resetFields();
                  }}
                  type="text"
                >
                  Cancel Edit
                </Button>
              )
            }
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
                      <Button
                        icon={<UploadOutlined />}
                        style={{ borderRadius: "6px" }}
                      >
                        Upload Cover Image
                      </Button>
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="News Description"
                name="description"
                rules={[
                  { required: true, message: "Please enter news description" },
                ]}
              >
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
                            <Button
                              icon={<UploadOutlined />}
                              style={{ borderRadius: "6px" }}
                              size="small"
                            >
                              Upload Image
                            </Button>
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
                  {editingNews ? "Update News" : "Create News"}
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
              <span style={{ color: "#da2c46" }}>Published News Articles</span>
            }
            style={customStyles.cardStyle}
          >
            <Table
              columns={columns}
              dataSource={newsData}
              rowKey="id"
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

      {/* View News Drawer */}
      <Drawer
        title={<span style={{ color: "#da2c46" }}>News Article Preview</span>}
        placement="right"
        width={600}
        onClose={() => setViewDrawerVisible(false)}
        open={viewDrawerVisible}
      >
        {viewingNews && (
          <div>
            <Title level={3}>{viewingNews.title}</Title>
            <Tag
              color={viewingNews.status === "published" ? "green" : "orange"}
            >
              {viewingNews.status.toUpperCase()}
            </Tag>
            <Divider />

            <Text strong>Description:</Text>
            <Paragraph>{viewingNews.description}</Paragraph>

            {viewingNews.subsections && viewingNews.subsections.length > 0 && (
              <>
                <Divider />
                <Title level={4}>Subsections:</Title>
                {viewingNews.subsections.map((section, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{ marginBottom: "12px" }}
                  >
                    <Title level={5}>{section.title}</Title>
                    <Paragraph>{section.content}</Paragraph>
                    {section.image && (
                      <div style={{ marginTop: "8px" }}>
                        <Text type="secondary">Image: {section.image}</Text>
                      </div>
                    )}
                  </Card>
                ))}
              </>
            )}

            <Divider />
            <Text type="secondary">
              Created: {new Date(viewingNews.createdAt).toLocaleString()}
            </Text>
            <br />
            <Text type="secondary">
              Updated: {new Date(viewingNews.updatedAt).toLocaleString()}
            </Text>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default EmployeeAdminNews;
