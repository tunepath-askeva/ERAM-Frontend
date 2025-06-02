import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Space,
  Divider,
  Alert,
  message,
  Row,
  Col,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  ArrowLeftOutlined,
  UserAddOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  GoogleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterUserMutation } from "../Slices/Users/UserApis";
import OtpModal from "../Modal/OtpModal";
import Header from "../Global/HEader";
import HomeFooter from "../Global/Footer";

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const roles = [
    { value: "candidate", label: "Candidate" },
    { value: "employee", label: "Employee" },
  ];

  const onFinish = async (values) => {
    setLoading(true);
    const fullName = `${values.firstName} ${values.lastName}`;

    const userData = {
      firstName: values.firstName,
      lastName: values.lastName,
      fullName: fullName,
      role: values.role,
      email: values.email,
      phone: values.phone,
      cPassword: values.cPassword,
    };

    try {
      console.log("Registration data:", userData);

      const response = await registerUser(userData).unwrap();
      console.log("Registration successful:", response);

      setRegisteredEmail(values.email);
      message.success("Registration successful! Please verify your email.");

      setShowOtpModal(true);
    } catch (error) {
      console.error("Registration failed:", error);
      message.error(
        error?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerifySuccess = (otpResponse) => {
    setShowOtpModal(false);
    setRegisteredEmail("");
    message.success("Email verified successfully! Please login to continue.");
    navigate("/login");
  };

  const handleOtpModalCancel = () => {
    setShowOtpModal(false);
    setRegisteredEmail("");

    message.info(
      "Email verification cancelled. Please register again if needed."
    );
  };

  const handleGoogleSignUp = () => {
    message.info("Google Sign-Up functionality to be implemented");
  };

  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f0f0",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 500,
            boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
            borderRadius: "20px",
            border: "none",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          {/* Header Section */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {/* Replace this with your company logo */}
              <img
                src="/logo-2.png"
                alt="Company Logo"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span style={{ display: "none" }}>Logo</span>
            </div>
            <p
              style={{
                margin: 0,
                color: "#7f8c8d",
                fontSize: "16px",
              }}
            >
              Sign up to get started
            </p>
          </div>

          {/* Registration Form */}
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            scrollToFirstError
          >
            {/* Name Fields */}
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      First Name
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please input your first name!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: "#bdc3c7" }} />}
                    placeholder="John"
                    size="large"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e1e5e9",
                      fontSize: "16px",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      Last Name
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please input your last name!",
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: "#bdc3c7" }} />}
                    placeholder="Doe"
                    size="large"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e1e5e9",
                      fontSize: "16px",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Role Selection */}
            <Form.Item
              name="role"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Register As
                </span>
              }
              rules={[{ required: true, message: "Please select your role!" }]}
            >
              <Select
                placeholder="Select your role"
                size="large"
                style={{
                  borderRadius: "12px",
                }}
                suffixIcon={<TeamOutlined style={{ color: "#bdc3c7" }} />}
              >
                {roles.map((role) => (
                  <Option key={role.value} value={role.value}>
                    {role.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {/* Email Field */}
            <Form.Item
              name="email"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Email Address
                </span>
              }
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Please enter a valid email!" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="john.doe@example.com"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",

                  fontSize: "16px",
                }}
              />
            </Form.Item>

            {/* Phone Field */}
            <Form.Item
              name="phone"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Phone Number
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please input your phone number!",
                },
              ]}
            >
              <Input
                prefix={<PhoneOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="+1 (555) 123-4567"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",
                  fontSize: "16px",
                }}
              />
            </Form.Item>

            {/* Password Field */}
            <Form.Item
              name="password"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Password
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters!",
                },
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="Create a strong password"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",
                  fontSize: "16px",
                }}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {/* Confirm Password Field */}
            <Form.Item
              name="cPassword"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Confirm Password
                </span>
              }
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="Confirm your password"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",
                  fontSize: "16px",
                }}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            {/* Submit Button */}
            <Form.Item style={{ marginTop: "24px", marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || isLoading}
                block
                size="large"
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg,rgb(231, 82, 82) 0%,rgb(185, 48, 48) 100%)",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                }}
              >
                {loading || isLoading
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </Form.Item>
          </Form>

          {/* Sign In Link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #ecf0f1",
            }}
          >
            <span style={{ color: "#7f8c8d", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#f5222d",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Sign in here
              </Link>
            </span>
          </div>
        </Card>
      </div>

      {/* OTP Modal */}
      <OtpModal
        visible={showOtpModal}
        onCancel={handleOtpModalCancel}
        email={registeredEmail}
        onVerifySuccess={handleOtpVerifySuccess}
      />

      <HomeFooter />
    </>
  );
};

export default Register;
