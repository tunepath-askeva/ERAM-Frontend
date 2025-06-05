import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Space,
  message,
  InputNumber,
  Select,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  LockOutlined,
  SaveOutlined,
  PlusOutlined,
  EnvironmentOutlined,
  StarOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useCreateRecruiterMutation } from "../../Slices/Admin/AdminApis";

const { Title } = Typography;
const { Option } = Select;

const RecruiterForm = ({
  open,
  onCancel,
  onSuccess,
  mode = "add",
  title = "Add New Recruiter",
  initialValues = null,
}) => {
  const [form] = Form.useForm();
  const [createRecruiter, { isLoading }] = useCreateRecruiterMutation();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        form.setFieldsValue({
          fullName: initialValues.fullName,
          email: initialValues.email,
          phoneno: initialValues.phoneno,
          specialization: initialValues.specialization,
          experience: initialValues.experienceYears,
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
        fullName: values.fullName,
        email: values.email,
        phoneno: values.phoneno,
        specialization: values.specialization,
        experience: values.experience,
        password: values.password,
        role: "recruiter",
      };

      const result = await createRecruiter(payload).unwrap();

      message.success("Recruiter created successfully!");
      form.resetFields();

      if (onSuccess) {
        onSuccess(result);
      }

      onCancel();
    } catch (error) {
      console.error("Failed to create recruiter:", error);
      message.error(error?.data?.message || "Failed to create recruiter");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      const password = getFieldValue("password");

      if (!value || password === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Passwords do not match!"));
    },
  });

  return (
    <Modal
      title={
        <Space>
          <PlusOutlined />
          {title}
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg, #ff4d4f 0%, #d9363e 100%)",
        },
      }}
      confirmLoading={isLoading}
      width={700}
      okText={mode === "add" ? "Create Recruiter" : "Update Recruiter"}
      cancelText="Cancel"
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        {/* Personal Information Section */}
        <Card
          size="small"
          title={
            <Space>
              <UserOutlined />
              <span>Personal Information</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[
                  { required: true, message: "Please enter full name" },
                  {
                    min: 2,
                    message: "Full name must be at least 2 characters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter recruiter's full name"
                  prefix={<UserOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Contact Information Section */}
        <Card
          size="small"
          title={
            <Space>
              <UserOutlined />
              <span>Contact Information</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
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
                  placeholder="recruiter@company.com"
                  prefix={<MailOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phoneno"
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

        {/* Professional Information Section */}
        <Card
          size="small"
          title={
            <Space>
              <ToolOutlined />
              <span>Professional Information</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Specialization"
                name="specialization"
                rules={[
                  { required: true, message: "Please enter specialization" },
                ]}
              >
                <Input
                  placeholder="e.g., IT, Healthcare, Finance"
                  prefix={<BankOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Experience (Years)"
                name="experience"
                rules={[
                  { required: true, message: "Please enter experience" },
                  {
                    type: "number",
                    min: 0,
                    max: 50,
                    message: "Experience must be between 0 and 50 years",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Years of experience"
                  style={{ width: "100%" }}
                  size="large"
                  min={0}
                  max={50}
                />
              </Form.Item>
            </Col>
          </Row>
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
                  {
                    required: mode === "add",
                    message: "Please enter password",
                  },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters",
                  },
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
                  {
                    required: mode === "add",
                    message: "Please confirm password",
                  },
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

export default RecruiterForm;