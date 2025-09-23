import React, { useState, useEffect, useRef } from "react";
import { Modal, Form, Input, Button, Steps, Typography, Space } from "antd";
import { MailOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { useSnackbar } from "notistack";
import {
  useForgotPasswordMutation,
  useVerifyForgotOtpMutation,
  useResetPasswordMutation,
} from "../Slices/Users/UserApis"; // Adjust import path as needed

const { Title, Text } = Typography;
const { Step } = Steps;

// Custom OTP Input Component
const OtpInput = ({ value, onChange }) => {
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  useEffect(() => {
    if (value && value.length === 6) {
      setOtpValues(value.split(""));
    }
  }, [value]);

  const handleChange = (index, val) => {
    if (!/^\d*$/.test(val)) return; // Only allow digits

    const newOtpValues = [...otpValues];
    newOtpValues[index] = val;
    setOtpValues(newOtpValues);

    // Call onChange with the complete OTP
    const completeOtp = newOtpValues.join("");
    onChange?.(completeOtp);

    // Auto-focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");
    if (!/^\d{6}$/.test(paste)) return;

    const newOtpValues = paste.split("");
    setOtpValues(newOtpValues);
    onChange?.(paste);
    inputRefs.current[5]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
      {otpValues.map((val, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          value={val}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          maxLength={1}
          style={{
            width: "48px",
            height: "56px",
            textAlign: "center",
            fontSize: "24px",
            fontWeight: "bold",
            borderRadius: "12px",
            border: "2px solid #e1e5e9",
            transition: "all 0.2s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#da2c46";
            e.target.style.boxShadow = "0 0 0 2px rgba(218, 44, 70, 0.1)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e1e5e9";
            e.target.style.boxShadow = "none";
          }}
        />
      ))}
    </div>
  );
};

const ForgotPasswordModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const [forgotPassword, { isLoading: isEmailLoading }] =
    useForgotPasswordMutation();
  const [verifyForgotOtp, { isLoading: isOtpLoading }] =
    useVerifyForgotOtpMutation();
  const [resetPassword, { isLoading: isResetLoading }] =
    useResetPasswordMutation();

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Reset modal state when closed
  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setEmail("");
      setOtp("");
      setTimer(0);
      form.resetFields();
    }
  }, [visible, form]);

  const handleEmailSubmit = async (values) => {
    try {
      const response = await forgotPassword(values.email).unwrap();

      setEmail(values.email);
      setCurrentStep(1);
      setTimer(300); // 5 minutes timer

      enqueueSnackbar(
        response.message || "OTP sent to your email successfully!",
        {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      enqueueSnackbar(
        error?.data?.message ||
          error?.message ||
          "Failed to send OTP. Please try again.",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    }
  };

  const handleOtpSubmit = async (values) => {
    try {
      const response = await verifyForgotOtp({
        email: email,
        otp: values.otp,
      }).unwrap();

      setOtp(values.otp);
      setCurrentStep(2);

      enqueueSnackbar(response.message || "OTP verified successfully!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      enqueueSnackbar(
        error?.data?.message ||
          error?.message ||
          "Invalid OTP. Please try again.",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    }
  };

  const handlePasswordReset = async (values) => {
    try {
      if (values.newPassword !== values.confirmPassword) {
        enqueueSnackbar("Passwords do not match!", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        return;
      }

      const response = await resetPassword({
        email: email,
        newPassword: values.newPassword,
      }).unwrap();

      enqueueSnackbar(response.message || "Password reset successfully!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });

      onClose(); // Close modal on success
    } catch (error) {
      console.error("Password reset error:", error);
      enqueueSnackbar(
        error?.data?.message ||
          error?.message ||
          "Failed to reset password. Please try again.",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    }
  };

  const handleResendOtp = async () => {
    try {
      await forgotPassword(email).unwrap();
      setTimer(300); // Reset timer to 5 minutes
      enqueueSnackbar("OTP sent again to your email!", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Failed to resend OTP. Please try again.",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const steps = [
    {
      title: "Email",
      icon: <MailOutlined style={{color:"#da2c46"}} />,
    },
    {
      title: "Verify OTP",
      icon: <SafetyOutlined style={{color:"#da2c46"}} />,
    },
    {
      title: "Reset Password",
      icon: <LockOutlined  style={{color:"#da2c46"}}/>,
    },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Title level={4} style={{ color: "#2c3e50", marginBottom: "8px" }}>
              Enter Your Email
            </Title>
            <Text
              type="secondary"
              style={{ marginBottom: "24px", display: "block" }}
            >
              We'll send you a verification code to reset your password
            </Text>

            <Form form={form} onFinish={handleEmailSubmit} layout="vertical">
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Please enter a valid email!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "#bdc3c7" }} />}
                  placeholder="Enter your email address"
                  size="large"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #e1e5e9",
                    height: "48px",
                    fontSize: "16px",
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isEmailLoading}
                  block
                  size="large"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #da2c46 0%, #b91c35 100%)",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(218, 44, 70, 0.4)",
                  }}
                >
                  {isEmailLoading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        );

      case 1:
        return (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Title level={4} style={{ color: "#2c3e50", marginBottom: "8px" }}>
              Verify OTP
            </Title>
            <Text
              type="secondary"
              style={{ marginBottom: "24px", display: "block" }}
            >
              Enter the 6-digit code sent to {email}
            </Text>

            {timer > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Resend OTP in:{" "}
                  <strong style={{ color: "#da2c46" }}>
                    {formatTime(timer)}
                  </strong>
                </Text>
              </div>
            )}

            <Form form={form} onFinish={handleOtpSubmit} layout="vertical">
              <Form.Item
                name="otp"
                rules={[
                  { required: true, message: "Please enter the OTP!" },
                  { len: 6, message: "OTP must be 6 digits!" },
                  {
                    pattern: /^\d{6}$/,
                    message: "OTP must contain only numbers!",
                  },
                ]}
              >
                <OtpInput />
              </Form.Item>

              <Space
                direction="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isOtpLoading}
                  block
                  size="large"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #da2c46 0%, #b91c35 100%)",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(218, 44, 70, 0.4)",
                  }}
                >
                  {isOtpLoading ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button
                  type="link"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || isEmailLoading}
                  style={{
                    padding: 0,
                    fontSize: "14px",
                    color: timer > 0 ? "#bdc3c7" : "#da2c46",
                    fontWeight: "500",
                  }}
                >
                  {timer > 0 ? "Resend OTP" : "Resend OTP"}
                </Button>
              </Space>
            </Form>
          </div>
        );

      case 2:
        return (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <Title level={4} style={{ color: "#2c3e50", marginBottom: "8px" }}>
              Reset Password
            </Title>
            <Text
              type="secondary"
              style={{ marginBottom: "24px", display: "block" }}
            >
              Create a new password for your account
            </Text>

            <Form form={form} onFinish={handlePasswordReset} layout="vertical">
              <Form.Item
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: "Please enter your new password!",
                  },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bdc3c7" }} />}
                  placeholder="Enter new password"
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
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: "#bdc3c7" }} />}
                  placeholder="Confirm new password"
                  size="large"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #e1e5e9",
                    height: "48px",
                    fontSize: "16px",
                  }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isResetLoading}
                  block
                  size="large"
                  style={{
                    height: "48px",
                    borderRadius: "12px",
                    background:
                      "linear-gradient(135deg, #da2c46 0%, #b91c35 100%)",
                    border: "none",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 15px rgba(218, 44, 70, 0.4)",
                  }}
                >
                  {isResetLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      destroyOnClose
      style={{
        borderRadius: "20px",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: "40px 30px",
      }}
    >
      <div style={{ marginBottom: "30px" }}>
        <Steps
          current={currentStep}
          items={steps}
          size="small"
          style={{
            ".ant-steps-item-finish .ant-steps-item-icon": {
              backgroundColor: "#da2c46",
              borderColor: "#da2c46",
            },
            ".ant-steps-item-active .ant-steps-item-icon": {
              backgroundColor: "#da2c46",
              borderColor: "#da2c46",
            },
          }}
        />
      </div>

      {renderStepContent()}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button
          type="link"
          onClick={onClose}
          style={{
            padding: 0,
            fontSize: "14px",
            color: "#7f8c8d",
            fontWeight: "500",
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default ForgotPasswordModal;
