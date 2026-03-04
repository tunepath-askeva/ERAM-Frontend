import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  message,
  Spin,
  Alert,
  Select,
  DatePicker,
} from "antd";
import {
  PlusOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import {
  useGetNewsByIdQuery,
  useUpdateNewsMutation,
} from "../../Slices/Employee/EmployeeApis";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Title, Text } = Typography;

const EditNews = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();
  const [newsType, setNewsType] = useState("news");

  const {
    data: newsResponse,
    isLoading: isLoadingNews,
    error,
  } = useGetNewsByIdQuery(id);
  const [updateNews, { isLoading: isUpdatingNews }] = useUpdateNewsMutation();

  const newsData = newsResponse?.news;

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

  const createFileList = (imageUrl, fileName = "image") => {
    if (!imageUrl) return [];
    return [
      {
        uid: "-1",
        name: fileName,
        status: "done",
        url: imageUrl,
        thumbUrl: imageUrl,
      },
    ];
  };

  useEffect(() => {
    if (newsData) {
      const formValues = {
        title: newsData.title,
        description: newsData.description || "",
        coverImage: createFileList(newsData.coverImage, "cover-image"),
        type: newsData.type || "news",
        eventDate: newsData.eventDate ? dayjs(newsData.eventDate) : undefined,
        eventLocation: newsData.eventLocation || "",
        subsections:
          newsData.subsections?.map((section, index) => ({
            title: section.subtitle,
            content: section.subdescription,
            image: createFileList(section.image, `section-${index}-image`),
          })) || [],
      };
      setNewsType(newsData.type || "news");
      form.setFieldsValue(formValues);
    }
  }, [newsData, form]);

const handleSubmit = async (values) => {
  try {
    const formData = new FormData();

    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("type", values.type || "news");
    
    if (values.type === "event") {
      if (values.eventDate) {
        formData.append("eventDate", values.eventDate.format("YYYY-MM-DD"));
      }
      if (values.eventLocation) {
        formData.append("eventLocation", values.eventLocation);
      }
    }

    // Handle cover image
    if (values.coverImage?.[0]) {
      const coverFile = values.coverImage[0];
      if (coverFile.originFileObj) {
        formData.append("files", coverFile.originFileObj);
        formData.append("coverImage", coverFile.name);
      } else if (coverFile.url) {
        formData.append("coverImage", coverFile.url);
      }
    }

    // Handle subsections
    if (values.subsections && values.subsections.length > 0) {
      values.subsections.forEach((section, index) => {
        formData.append(`subsections[${index}][subtitle]`, section.title);
        formData.append(`subsections[${index}][subdescription]`, section.content);

        if (section.image?.[0]) {
          const imageFile = section.image[0];
          if (imageFile.originFileObj) {
            formData.append("files", imageFile.originFileObj);
            formData.append(`subsections[${index}][image]`, imageFile.name);
          } else if (imageFile.url) {
            formData.append(`subsections[${index}][image]`, imageFile.url);
          }
        } else {
          formData.append(`subsections[${index}][image]`, "");
        }
      });
    }

    const result = await updateNews({ id, formData }).unwrap();
    message.success(result.message || "News updated successfully!");
    navigate("/employee-admin/news");
  } catch (error) {
    console.error("Error updating news:", error);
    message.error(error?.data?.message || "Failed to update news");
  }
};

  const handleCancel = () => {
    navigate("/employee-admin/news");
  };

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
      if (!src && file.originFileObj) {
        src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj);
          reader.onload = () => resolve(reader.result);
        });
      }
      if (src) {
        const image = new Image();
        image.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(image.outerHTML);
      }
    },
  };

  if (isLoadingNews) {
    return (
      <div
        style={{ textAlign: "center", padding: "100px 0", minHeight: "100vh" }}
      >
        <Spin size="large" />
        <div style={{ marginTop: "20px" }}>
          <Text>Loading news article...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", minHeight: "100vh" }}>
        <Card style={customStyles.cardStyle}>
          <Alert
            message="Error Loading News"
            description="Failed to load the news article. Please try again later."
            type="error"
            showIcon
            style={{ marginBottom: "20px" }}
          />
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/employee-admin/news")}
            style={customStyles.buttonStyle}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div style={{ padding: "40px", minHeight: "100vh" }}>
        <Card style={customStyles.cardStyle}>
          <Alert
            message="News Not Found"
            description="The requested news article could not be found."
            type="warning"
            showIcon
            style={{ marginBottom: "20px" }}
          />
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/employee-admin/news")}
            style={customStyles.buttonStyle}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      {/* Header */}
      <Card style={{ ...customStyles.cardStyle, marginBottom: "24px" }}>
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/employee-admin/news")}
            style={{ color: customStyles.primaryColor }}
          >
            Back to News Management
          </Button>
        </Space>
      </Card>

      {/* Edit Form */}
      <Card
        title={
          <span style={{ color: "#da2c46" }}>
            Edit {newsType === "event" ? "Event" : "News Article"}
          </span>
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
            <Col xs={24} md={8}>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: "Please select type" }]}
              >
                <Select
                  placeholder="Select type"
                  style={{ borderRadius: "6px" }}
                  onChange={(value) => {
                    setNewsType(value);
                    if (value === "news") {
                      form.setFieldsValue({ eventDate: undefined, eventLocation: undefined });
                    }
                  }}
                >
                  <Select.Option value="news">News</Select.Option>
                  <Select.Option value="event">Event</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={newsType === "event" ? 8 : 16}>
              <Form.Item
                label={newsType === "event" ? "Event Date" : "Title"}
                name={newsType === "event" ? "eventDate" : "title"}
                rules={
                  newsType === "event"
                    ? [{ required: true, message: "Please select event date" }]
                    : [{ required: true, message: "Please enter title" }]
                }
              >
                {newsType === "event" ? (
                  <DatePicker
                    style={{ width: "100%", borderRadius: "6px" }}
                    format="YYYY-MM-DD"
                    placeholder="Select event date"
                  />
                ) : (
                  <Input
                    placeholder="Enter compelling news title"
                    style={{ borderRadius: "6px" }}
                  />
                )}
              </Form.Item>
            </Col>
            {newsType === "event" && (
              <Col xs={24} md={8}>
                <Form.Item
                  label="Event Name"
                  name="title"
                  rules={[{ required: true, message: "Please enter event name" }]}
                >
                  <Input
                    placeholder="Enter event name"
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
            )}
          </Row>
          {newsType === "event" && (
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Event Location"
                  name="eventLocation"
                  rules={[{ required: true, message: "Please enter event location" }]}
                >
                  <Input
                    placeholder="Enter event location"
                    style={{ borderRadius: "6px" }}
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Cover Image"
                name="coverImage"
                valuePropName="fileList"
                getValueFromEvent={(e) => {
                  if (Array.isArray(e)) {
                    return e;
                  }
                  return e?.fileList;
                }}
              >
                <Upload {...uploadProps}>
                  {form.getFieldValue("coverImage")?.length ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload Cover</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label={newsType === "event" ? "Event Description" : "News Description"} 
            name="description"
          >
            <TextArea
              rows={4}
              placeholder={newsType === "event" ? "Write a comprehensive description of the event..." : "Write a comprehensive description of the news..."}
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
                    title={`Section ${name + 1}`}
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
                      valuePropName="fileList"
                      getValueFromEvent={(e) => {
                        if (Array.isArray(e)) {
                          return e;
                        }
                        return e?.fileList;
                      }}
                    >
                      <Upload {...uploadProps}>
                        {form.getFieldValue(["subsections", name, "image"])
                          ?.length ? null : (
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload Image</div>
                          </div>
                        )}
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
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdatingNews}
                size="large"
                style={customStyles.buttonStyle}
                icon={<SaveOutlined />}
              >
                Update {newsType === "event" ? "Event" : "News"}
              </Button>
              <Button
                size="large"
                onClick={handleCancel}
                style={{ borderRadius: "6px" }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <style jsx>{`
        .ant-upload-select-picture-card i {
          font-size: 32px;
          color: #999;
        }
        .ant-upload-select-picture-card .ant-upload-text {
          margin-top: 8px;
          color: #666;
        }
        .ant-form-item-label > label {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default EditNews;
