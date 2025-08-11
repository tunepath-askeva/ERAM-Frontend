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
  SaveOutlined,
} from "@ant-design/icons";
import {
  useRaiseRequestMutation,
} from "../../Slices/Employee/EmployeeApis";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EmployeeRaiseRequestForm = ({ onRequestSubmit, mobileView }) => {
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

      if (values.requestType === "New/Other Request" && values.customTitle) {
        formData.append("requestType", values.customTitle);
      } else {
        formData.append("requestType", values.requestType);
      }

      Object.keys(values).forEach((key) => {
        if (
          key !== "requestType" &&
          key !== "customTitle" &&
          key !== "attachments" &&
          values[key] !== undefined
        ) {
          formData.append(key, values[key]);
        }
      });

      // Append each file to the FormData
      fileList.forEach((file) => {
        formData.append("attachments", file.originFileObj);
      });

      const response = await raiseRequest(formData).unwrap();
      
      message.success("Request submitted successfully!");
      
      // Clear form state
      form.resetFields();
      setFileList([]);
      setShowCustomTitle(false);
      
      // Call the callback to trigger refetch and navigation
      if (onRequestSubmit) {
        await onRequestSubmit(response);
      }
    } catch (err) {
      console.error("Error submitting request:", err);
      message.error(err.data?.message || "Failed to submit request");
    }
  };

  const handleClear = () => {
    form.resetFields();
    setFileList([]);
    setShowCustomTitle(false);
  };

  const formItemLayout = mobileView
    ? {
        labelCol: { span: 24 },
        wrapperCol: { span: 24 },
      }
    : {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
      };

  const buttonItemLayout = mobileView
    ? {
        wrapperCol: { span: 24, offset: 0 },
      }
    : {
        wrapperCol: { span: 18, offset: 6 },
      };

  return (
    <Card
      title={
        <Space>
          <SolutionOutlined />
          <Text strong>Raise a Request</Text>
        </Space>
      }
      bordered={false}
    >
      <Form
        form={form}
        {...formItemLayout}
        onFinish={handleSubmit}
        autoComplete="off"
        preserve={false}
      >
        <Form.Item
          name="requestType"
          label="Request Type"
          rules={[{ required: true, message: "Please select a request type!" }]}
        >
          <Select
            placeholder="Select request type"
            onChange={handleRequestTypeChange}
            allowClear
          >
            {requestTypes.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {showCustomTitle && (
          <Form.Item
            name="customTitle"
            label="Custom Title"
            rules={[
              { required: true, message: "Please enter your custom title!" },
              { max: 100, message: "Title must be less than 100 characters" },
            ]}
          >
            <Input placeholder="Enter your custom request title" />
          </Form.Item>
        )}

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: "Please enter a description!" },
            { max: 500, message: "Description must be less than 500 characters" },
          ]}
        >
          <TextArea rows={4} placeholder="Enter detailed description of your request" />
        </Form.Item>

        <Form.Item name="attachments" label="Attachments">
          <Upload
            fileList={fileList}
            onChange={handleFileChange}
            beforeUpload={beforeUpload}
            multiple
            listType="text"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
          >
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>
          <Text type="secondary" style={{ fontSize: 12 }}>
            (PDF, DOC, DOCX, JPG, PNG, GIF, TXT up to 10MB)
          </Text>
        </Form.Item>

        <Form.Item {...buttonItemLayout}>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={isLoading}
              style={{backgroundColor: "#da2c46"}}
              size="large"
            >
              {isLoading ? "Submitting..." : "Submit Request"}
            </Button>
            <Button
              htmlType="button"
              icon={<SaveOutlined />}
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EmployeeRaiseRequestForm;