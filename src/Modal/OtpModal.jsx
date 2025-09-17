import React, { useState, useRef, useEffect } from "react";
import { Modal, Input, Button, Typography, Space, message } from "antd";
import {
  useVerifyOtpMutation,
  useResendOtpMutation,
} from "../Slices/Users/UserApis.js";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack"; // Add this import
import { CloseOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const OtpModal = ({ visible, onCancel, email, onVerifySuccess }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar(); // Add this hook

  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();

  useEffect(() => {
    if (visible) {
      startResendTimer();
      if (inputRefs.current[0]) {
        setTimeout(() => {
          inputRefs.current[0].focus();
        }, 100);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [visible]);

  const startResendTimer = () => {
    setResendTimer(60);
    setIsResendDisabled(true);

    timerRef.current = setInterval(() => {
      setResendTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setIsResendDisabled(false);
          clearInterval(timerRef.current);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === 6) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      message.error("Please enter complete 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const otpData = {
        email: email,
        otp: otpString,
      };

      const response = await verifyOtp(otpData).unwrap();
      message.success("OTP verified successfully!");

      if (onVerifySuccess) {
        onVerifySuccess(response);
      }

    } catch (error) {
      console.error("OTP verification failed:", error);
      enqueueSnackbar(error?.data?.message || error?.message || "Invalid OTP. Please try again.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const resendData = {
        email: email,
      };

      await resendOtp(resendData).unwrap();
      message.success("OTP resent successfully!");

      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();

      startResendTimer();
    } catch (error) {
      console.error("Resend OTP failed:", error);
      enqueueSnackbar(error?.data?.message || error?.message || "Failed to resend OTP. Please try again.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });
    }
  };

  const handleCancel = () => {
    setOtp(["", "", "", "", "", ""]);
    setResendTimer(0);
    setIsResendDisabled(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onCancel();
  };

  const maskedEmail = email
    ? `${email.substring(0, 2)}**${email.substring(email.indexOf("@"))}`
    : "";

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      centered
      width="90%"
      style={{
        maxWidth: 480,
        padding: "clamp(20px, 5vw, 40px) clamp(16px, 4vw, 24px)",
        borderRadius: "16px",
      }}
      closable={true}
      closeIcon={
        <CloseOutlined className="text-gray-400 hover:text-gray-600" />
      }
      maskClosable={false}
      className="ant-modal-custom"
      
    >
      <div className="text-center">
        <Title
          level={3}
          className="text-gray-900 mb-2 font-semibold"
          style={{ fontSize: "clamp(18px, 4vw, 24px)" }}
        >
          Email Verification
        </Title>

        <Text
          type="secondary"
          className="block mb-8 font-medium text-gray-400"
          style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
        >
          We have sent a 6-digit code to your email {maskedEmail}
        </Text>

        <Space direction="vertical" size={24} className="w-full">
          <div className="flex justify-center">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                maxLength={1}
                className="text-center"
                style={{
                  width: 60,
                  height: 56,
                  borderRadius: "12px",
                  fontSize: "18px",
                  padding: 0,
                  fontWeight: "normal",
                  borderColor: "#e5e7eb",
                  backgroundColor: "#fff",
                  textAlign: "center",
                  marginRight: index < 5 ? "4px" : "0",
                }}
              />
            ))}
          </div>

          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading || isLoading}
            className="w-full"
            style={{
              height: "clamp(24px, 8vw, 36px)",
              fontSize: "clamp(13px, 3vw, 14px)",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            Verify Account
          </Button>

          <div className="text-center">
            <Text
              type="secondary"
              className="font-medium text-gray-500"
              style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
            >
              Didn't receive code?{" "}
              {isResendDisabled ? (
                <Text
                  className="font-medium text-gray-400"
                  style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
                >
                  Resend in {resendTimer}s
                </Text>
              ) : (
                <Button
                  type="link"
                  className="p-0 text-blue-600 hover:text-blue-700 font-medium"
                  style={{ fontSize: "clamp(12px, 3vw, 14px)" }}
                  onClick={handleResendOtp}
                  loading={isResendLoading}
                  disabled={isResendDisabled}
                >
                  Resend
                </Button>
              )}
            </Text>
          </div>
        </Space>
      </div>
    </Modal>
  );
};

export default OtpModal;