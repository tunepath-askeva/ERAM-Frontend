import React, { useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  BankOutlined,
  StarOutlined,
} from "@ant-design/icons";
import PhoneInput from "../../Global/PhoneInput";

const { Option } = Select;

const ConvertToCandidateModal = ({
  visible,
  onCancel,
  handleSubmit,
  isSubmitting = false,
  initialValues = {},
}) => {
  const [form] = Form.useForm();
  const [selectedCountryCode, setSelectedCountryCode] = useState("");

  const handleCountryCodeChange = (value) => {
    setSelectedCountryCode(value);
  };

  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Please enter phone number"));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value || form.getFieldValue("password") === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match"));
  };

  const getCountryOptions = () => [
    { value: "+91", label: "India", searchText: "india" },
  ];

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined
            style={{ marginRight: 8, color: "#da2c46", fontSize: 18 }}
          />
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            Convert to candidate
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width="90%"
      style={{ maxWidth: 800 }}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel} size="large">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          size="large"
          loading={isSubmitting}
          style={{
            background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            border: "none",
          }}
        >
          Create Candidate
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        style={{ padding: "16px 0" }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Middle Name" name="middleName">
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter middle name (optional)"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter email address"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <PhoneInput
              form={form}
              name="phoneNumber"
              label="Phone Number"
              required
            />
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Company Name"
              name="companyName"
              rules={[{ required: true, message: "Please enter company name" }]}
            >
              <Input
                prefix={<BankOutlined />}
                placeholder="Enter current/previous company"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Specialization"
              name="specialization"
              rules={[
                { required: true, message: "Please enter specialization" },
              ]}
            >
              <Input
                prefix={<StarOutlined />}
                placeholder="e.g., React.js, Node.js, Python"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Agency" name="agency">
              <Input placeholder="Enter agency name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Search Hint" name="workorderhint">
              <Input placeholder="Hint for making search easier" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Client" name="client">
              <Input placeholder="Enter client name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Experience"
              name="experience"
              rules={[{ required: true, message: "Please enter experience" }]}
            >
              <Select placeholder="Select experience">
                <Option value="0-1">0-1 Years</Option>
                <Option value="1-2">1-2 Years</Option>
                <Option value="2-3">2-3 Years</Option>
                <Option value="3-5">3-5 Years</Option>
                <Option value="5-7">5-7 Years</Option>
                <Option value="7-10">7-10 Years</Option>
                <Option value="10+">10+ Years</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Qualifications"
              name="qualifications"
              rules={[
                { required: true, message: "Please enter qualifications" },
              ]}
            >
              <Input placeholder="Enter educational qualifications, certifications, degrees, etc." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm password" },
                { validator: validateConfirmPassword },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ConvertToCandidateModal;
