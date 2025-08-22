// AddCandidateModal.jsx
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  TrophyOutlined,
  LockOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";

const { Option } = Select;
const { TextArea } = Input;

const AddCandidateModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  isSubmitting = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedCountryCode, setSelectedCountryCode] = useState("91");

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedCountryCode("91");
      form.setFieldsValue({
        countryCode: "91",
      });
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    try {
      const { confirmPassword, firstName, lastName, countryCode, phoneNumber, ...payload } = values;

      const fullName = `${firstName} ${lastName}`.trim();
      const fullPhoneNumber = `+${countryCode}${phoneNumber}`;

      const createPayload = {
        ...payload,
        fullName,
        phone: fullPhoneNumber,
        role: "candidate",
      };

      await onSubmit(createPayload);
      form.resetFields();
      setSelectedCountryCode("91");
    } catch (error) {
      console.error("Error creating candidate:", error);
      enqueueSnackbar(
        error?.message || "Failed to create candidate. Please try again.",
        { variant: "error" }
      );
    }
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue("password");
    
    if (!value || password === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match!"));
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined
            style={{ marginRight: 8, color: "#da2c46", fontSize: 18 }}
          />
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            Add New Candidate
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
        style={{ padding: "16px 0" }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={12}>
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
            <Form.Item label="Phone Number" style={{ marginBottom: 0 }}>
              <Input.Group compact>
                <Form.Item
                  name="countryCode"
                  style={{ width: "30%" }}
                  rules={[{ required: true, message: "Select country" }]}
                  initialValue="91"
                >
                  <Select
                    placeholder="Code"
                    value={selectedCountryCode}
                    onChange={setSelectedCountryCode}
                  >
                    <Option value="91">+91 (IN)</Option>
                    <Option value="1">+1 (US)</Option>
                    <Option value="44">+44 (UK)</Option>
                    <Option value="971">+971 (UAE)</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="phoneNumber"
                  style={{ width: "70%" }}
                  rules={[
                    { required: true, message: "Please enter phone number" },
                    {
                      pattern: /^[0-9]{10,15}$/,
                      message: "Please enter valid phone number",
                    },
                  ]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder="Enter phone number"
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
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
          <Col span={12}>
            <Form.Item
              label="Experience"
              name="experience"
              rules={[{ required: true, message: "Please enter experience" }]}
            >
              <Input placeholder="Enter work experience in years" />
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
              <Input
                placeholder="Enter educational qualifications, certifications, degrees, etc."
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter password",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
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
                {
                  required: true,
                  message: "Please confirm password",
                },
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

export default AddCandidateModal;