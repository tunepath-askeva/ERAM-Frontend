import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Typography,
  message,
  Row,
  Col,
  Space,
  Upload,
} from "antd";
import {
  SolutionOutlined,
  FormOutlined,
  SendOutlined,
  UploadOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { useRaiseRequestMutation } from "../../Slices/Employee/EmployeeApis";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EmployeeRaiseRequest = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [showCustomTitle, setShowCustomTitle] = useState(false);

  const [raiseRequest, { isLoading }] = useRaiseRequestMutation();

  const requestTypes = [
    "Travel Request",
    "Exit Reentry",
    "Vehicle Related Request",
    "Payslip Request",
    "General Request",
    "New/Other Request",
  ];

  const handleRequestTypeChange = (value) => {
    setShowCustomTitle(value === "New/Other Request");
    if (value !== "New/Other Request") {
      form.setFieldsValue({ customTitle: undefined });
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("File must be smaller than 10MB!");
      return false;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      message.error(
        "Please upload PDF, DOC, DOCX, images, or text files only!"
      );
      return false;
    }

    return false;
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && key !== "attachments") {
          formData.append(key, values[key]);
        }
      });

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append(`attachments`, file.originFileObj);
        }
      });

      const response = await raiseRequest(formData).unwrap();

      message.success("Your request has been submitted successfully!");
      form.resetFields();
      setFileList([]);
      setShowCustomTitle(false);
    } catch (error) {
      console.error("Request submission failed:", error);

      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to submit request. Please try again.";

      message.error(errorMessage);
    }
  };

  const uploadProps = {
    multiple: true,
    fileList,
    onChange: handleFileChange,
    beforeUpload,
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
                <SolutionOutlined style={{ marginRight: 12 }} />
                Employee Request Submission
              </Title>
              <Text type="secondary">
                Submit your requests with supporting documents
              </Text>
            </Col>
          </Row>
        </div>

        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="requestType"
                  label="Request Type"
                  rules={[
                    {
                      required: true,
                      message: "Please select request type",
                    },
                  ]}
                >
                  <Select
                    placeholder="Select request type"
                    suffixIcon={<FormOutlined />}
                    onChange={handleRequestTypeChange}
                  >
                    {requestTypes.map((type, index) => (
                      <Option key={index} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {showCustomTitle && (
                <Col xs={24} md={12}>
                  <Form.Item
                    name="customTitle"
                    label="Request Title"
                    rules={[
                      {
                        required: true,
                        message: "Please enter request title",
                      },
                      {
                        min: 3,
                        message: "Title should be at least 3 characters",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter your request title"
                      maxLength={100}
                      showCount
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Request Description"
                  rules={[
                    {
                      required: true,
                      message: "Please provide details about your request",
                    },
                    {
                      min: 20,
                      message: "Description should be at least 20 characters",
                    },
                  ]}
                >
                  <TextArea
                    rows={6}
                    placeholder="Please provide detailed information about your request..."
                    showCount
                    maxLength={1000}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item
                  name="attachments"
                  label={
                    <span>
                      <PaperClipOutlined style={{ marginRight: 8 }} />
                      Attachments (Optional)
                    </span>
                  }
                >
                  <Upload.Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined style={{color: "#da2c46"}} />
                    </p>
                    <p className="ant-upload-text">
                      Click or drag files to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support PDF, DOC, DOCX, images, and text files. Maximum
                      10MB per file.
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              </Col>
            </Row>

            <div style={{ textAlign: "right", marginTop: 24 }}>
              <Space>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setFileList([]);
                    setShowCustomTitle(false);
                  }}
                  disabled={isLoading}
                >
                  Clear All
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  icon={<SendOutlined />}
                  style={{
                    background: "#da2c46",
                    border: "none",
                  }}
                >
                  Submit Request
                </Button>
              </Space>
            </div>
          </Form>
        </Card>

        <Card
          style={{
            marginTop: 24,
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Title level={4} style={{ color: "#da2c46" }}>
            <SolutionOutlined style={{ marginRight: 8 }} />
            Request Process Information
          </Title>
          <div>
            <Text type="secondary">
              <ul style={{ paddingLeft: 20 }}>
                <li>Requests typically take 3-5 business days to process</li>
                <li>You will receive email notifications for status updates</li>
                <li>
                  HR or relevant department may contact you for additional
                  information
                </li>
                <li>All requests and attachments are kept confidential</li>
                <li>For urgent requests, please contact HR directly</li>
              </ul>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeRaiseRequest;
