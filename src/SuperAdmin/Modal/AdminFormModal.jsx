// AdminFormModal.jsx
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Typography,
  Space,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  LockOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title } = Typography;

const AdminFormModal = ({
  open,
  onCancel,
  onSubmit,
  branches = [],
  loading,
  mode = "add",
  title,
  initialValues = null,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        form.setFieldsValue({
          firstName: initialValues.firstName,
          lastName: initialValues.lastName,
          email: initialValues.email,
          phone: initialValues.phone,
          branchId: initialValues.branchId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        fullName: `${values.firstName} ${values.lastName}`,
        role: "admin",
        email: values.email,
        branchId: values.branchId,
        phone: values.phone,
        cPassword: values.password,
      };

      await onSubmit(payload);

      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue("password") === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Passwords do not match!"));
    },
  });

  return (
    <Modal
      title={
        <Space>
          {mode === "add" ? <PlusOutlined /> : <SaveOutlined />}
          {title}
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={700}
      okText={mode === "add" ? "Create Admin" : "Save Changes"}
      cancelText="Cancel"
      destroyOnClose={true}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        {/* Basic Information Section */}
        <Card
          size="small"
          title={
            <Space>
              <UserOutlined />
              <span>Basic Information</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please enter first name" },
                  {
                    min: 2,
                    message: "First name must be at least 2 characters",
                  },
                  {
                    pattern: /^[a-zA-Z\s]+$/,
                    message: "First name should only contain letters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter first name"
                  prefix={<UserOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Please enter last name" },
                  {
                    min: 2,
                    message: "Last name must be at least 2 characters",
                  },
                  {
                    pattern: /^[a-zA-Z\s]+$/,
                    message: "Last name should only contain letters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter last name"
                  prefix={<UserOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: "Please enter email address" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  placeholder="admin@company.com"
                  prefix={<MailOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^[+]?[0-9\s-()]+$/,
                    message: "Please enter a valid phone number",
                  },
                ]}
              >
                <Input
                  placeholder="+91 98765 43210"
                  prefix={<PhoneOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Branch Assignment Section */}
        <Card
          size="small"
          title={
            <Space>
              <BankOutlined />
              <span>Branch Assignment</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            label="Assign Branch"
            name="branchId"
            rules={[{ required: true, message: "Please select a branch" }]}
          >
            <Select
              placeholder="Select branch"
              size="large"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {branches.map((branch) => (
                <Option key={branch._id} value={branch._id}>
                  <Space>
                    <BankOutlined />
                    <span>{branch.name}</span>
                    <span style={{ color: "#666", fontSize: "12px" }}>
                      ({branch.branchCode})
                    </span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Card>

        {/* Security Section */}
        <Card
          size="small"
          title={
            <Space>
              <LockOutlined />
              <span>Security</span>
            </Space>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder="Enter password"
                  prefix={<LockOutlined />}
                  size="large"
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
                  validateConfirmPassword,
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder="Confirm password"
                  prefix={<LockOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default AdminFormModal;
