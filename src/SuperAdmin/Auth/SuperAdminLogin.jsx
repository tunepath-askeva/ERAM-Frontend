import React, { useState } from "react";
import { Form, Input, Button, Card, message, Divider, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  GoogleOutlined,
  VerifiedOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginSuperAdminMutation } from "../../Slices/SuperAdmin/SuperAdminAPIs";
import { setSuperAdminCredentials } from "../../Slices/SuperAdmin/SuperAdminSlice";
import SuperAdminOtpModal from "../Modal/SuperAdminOtpModal";

const SuperAdminLogin = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginSuperAdmin, { isLoading }] = useLoginSuperAdminMutation();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const onFinish = async (values) => {
    try {
      const response = await loginSuperAdmin({
        email: values.email,
        password: values.password,
      }).unwrap();

      if (response.requireOtp) {
        message.success("OTP sent to your email!");
        setUserEmail(response.email);
        setShowOtpModal(true);
      } else {
        message.success("Login successful!");

        const superAdminInfo = {
          email: response.user.email,
          name: response.user.name,
          roles: response.user.roles,
        };

        dispatch(setSuperAdminCredentials(superAdminInfo));
        navigate("/superadmin");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(error?.message || "Login failed. Please try again.");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Please check your input fields");
  };

  const handleGoogleSignIn = () => {
    message.info("Google Sign-In functionality to be implemented");
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleOtpVerificationSuccess = (response) => {
    message.success("Super Admin login successful!");

    // Don't store token in localStorage - it's now in cookies
    // Only store user information
    const superAdminInfo = {
      email: response.user.email,
      name: response.user.name,
      roles: response.user.roles,
    };

    dispatch(setSuperAdminCredentials(superAdminInfo));

    setShowOtpModal(false);
    navigate("/superadmin");
  };

  const handleOtpModalCancel = () => {
    setShowOtpModal(false);
    setUserEmail("");
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f0f0",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 450,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            borderRadius: "20px",
            border: "none",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          {/* Super Admin Logo Section */}
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
                fontSize: "48px",
                color: "#1890ff",
                fontWeight: "bold",
              }}
            >
              <VerifiedOutlined />
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "700",
                color: "#2c3e50",
                marginBottom: "8px",
              }}
            >
              Super Admin Portal
            </h1>
            <p
              style={{
                margin: 0,
                color: "#7f8c8d",
                fontSize: "16px",
              }}
            >
              Secure administrative access
            </p>
          </div>

          {/* Login Form */}
          <Form
            form={form}
            name="superAdminLogin"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
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
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email address!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="Enter your admin email address"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",
                  height: "48px",
                  fontSize: "16px",
                }}
              />
            </Form.Item>

            <Form.Item
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
              name="password"
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
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="Enter your admin password"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",
                  height: "48px",
                  fontSize: "16px",
                }}
              />
            </Form.Item>

            {/* Forgot Password Link */}
            <div
              style={{
                textAlign: "right",
                marginBottom: "24px",
              }}
            >
              {/* <Button
                type="link"
                onClick={handleForgotPassword}
                style={{
                  padding: 0,
                  fontSize: "14px",
                  color: "#667eea",
                  fontWeight: "500",
                }}
              >
                Forgot password?
              </Button> */}
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                block
                size="large"
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",

                  border: "none",
                  fontSize: "16px",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                }}
              >
                {isLoading ? "Signing in..." : "Sign In as Super Admin"}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>

      {/* Super Admin OTP Modal */}
      <SuperAdminOtpModal
        visible={showOtpModal}
        onCancel={handleOtpModalCancel}
        email={userEmail}
        onVerifySuccess={handleOtpVerificationSuccess}
        mode="login"
      />
    </>
  );
};

export default SuperAdminLogin;
