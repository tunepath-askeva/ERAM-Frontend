import React, { useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  TrophyOutlined,
  TeamOutlined,
  LockOutlined,
  BookOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useAddCandidateMutation } from "../../Slices/Admin/AdminApis";

const { Option } = Select;
const { TextArea } = Input;

const CandidateFormModal = ({ visible, onCancel, onSubmit, form }) => {
  const [addCandidate, { isLoading: isAdding }] = useAddCandidateMutation();

  useEffect(() => {
    if (visible) {
      form.resetFields();
    }
  }, [visible, form]);

  const handleSubmit = async (values) => {
    try {
      // Remove confirmPassword from payload as it's not needed for API
      const { confirmPassword, firstName, lastName, ...payload } = values;

      // Combine first name and last name into fullName
      const fullName = `${firstName} ${lastName}`.trim();

      // Add the combined fullName and static role to payload
      const finalPayload = {
        ...payload,
        fullName,
        role: "candidate",
      };

      // Create new candidate
      await addCandidate(finalPayload).unwrap();
      message.success("Candidate created successfully!");

      // Call parent onSubmit if provided (for any additional logic)
      if (onSubmit) {
        onSubmit(values);
      }

      // Close modal and reset form
      onCancel();
      form.resetFields();
    } catch (error) {
      console.error("Error creating candidate:", error);
      message.error(
        error?.data?.message || "Failed to create candidate. Please try again."
      );
    }
  };

  const validateConfirmPassword = (_, value) => {
    if (!value || form.getFieldValue("password") === value) {
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
          loading={isAdding}
          style={{
            background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
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
        {/* First Name and Last Name */}
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
            <Form.Item
              label="Phone"
              name="phone"
              rules={[{ required: true, message: "Please enter phone number" }]}
            >
              <Input
                prefix={<PhoneOutlined />}
                placeholder="Enter phone number"
              />
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
               <Input
                placeholder="Enter work experience."
              />
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
                rows={3}
                placeholder="Enter educational qualifications, certifications, degrees, etc."
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Password fields */}
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

export default CandidateFormModal;
