import React, { useState } from "react";
import { Form, Input, Select, Button, message, Card } from "antd";
import { useSubmitFeedbackMutation } from "../../Slices/Employee/EmployeeApis";
const { Option } = Select;
const { TextArea } = Input;

const EmployeeFeedback = () => {
  const [form] = Form.useForm();
  const [feedbackType, setFeedbackType] = useState("suggestion");
  const [submitFeedback, { isLoading }] = useSubmitFeedbackMutation();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      const response = await submitFeedback(values).unwrap();
      message.success(response.message || "Feedback submitted successfully!");
      form.resetFields();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      message.error(
        error.data?.message || "Failed to submit feedback. Please try again."
      );
    }
  };

  const handleTypeChange = (value) => {
    setFeedbackType(value);
  };

  return (
    <div className="feedback-container">
      <Card
        title={
          <h1 style={{ color: "#da2c46", margin: 0 }}>
            Employee Feedback/Suggestion
          </h1>
        }
        bordered={false}
        className="feedback-card"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ type: "suggestion" }}
        >
          <Form.Item
            name="type"
            label="Feedback Type"
            rules={[
              { required: true, message: "Please select feedback type!" },
            ]}
          >
            <Select onChange={handleTypeChange} style={{ width: "100%" }}>
              <Option value="suggestion">Suggestion</Option>

              <Option value="anonymous">Anonymous Feedback</Option>
            </Select>
          </Form.Item>

          {feedbackType === "suggestion" && (
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input placeholder="Enter your email" />
            </Form.Item>
          )}

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: "Please input your feedback!" }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter your feedback or suggestion"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <style jsx>
        {`
          .feedback-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }

          .feedback-card {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
          }

          .ant-card-head-title {
            padding: 16px 0;
          }

          .ant-form-item-label label {
            font-weight: 500;
          }

          .ant-btn-primary:hover,
          .ant-btn-primary:focus {
            background-color: #c82333 !important;
            border-color: #c82333 !important;
          }
        `}
      </style>
    </div>
  );
};

export default EmployeeFeedback;
