import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Divider,
  Checkbox,
  message,
  Avatar,
} from "antd";
import {
  LockOutlined,
  LoginOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  MailOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserCredentials } from "../Slices/Users/UserSlice";
import { useLoginUserMutation } from "../Slices/Users/UserApis";

const { Title, Text, Link } = Typography;

const LoginSection = ({ currentBranch }) => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const [loginUser] = useLoginUserMutation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
        branchId: currentBranch?._id,
      }).unwrap();

      if (response.requireOtp) {
        message.info(
          "OTP sent to your email. Please verify to complete login."
        );
        navigate("/verify-otp", {
          state: { email: response.email, message: response.message },
        });
        return;
      }

      message.success("Login successful!");

      const userRole = response.user.roles;
      const permissions = response.user.permissions || [];
      const userInfo = {
        email: response.user.email,
        name: response.user.name,
        roles: response.user.roles,
        employeeAdmin: response.user.employeeAdmin || null,
      };

      const payload = {
        userInfo: userInfo,
        role: userRole,
      };

      if (userRole === "recruiter") {
        payload.permissions = permissions;
      }

      // ✅ store in Redux + localStorage
      dispatch(setUserCredentials(payload));

      // ✅ Navigate by role
      switch (userRole) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "candidate":
          navigate("/candidate-jobs");
          break;
        case "employee":
          navigate("/employee/company-news");
          break;
        case "recruiter":
          if (response.user.employeeAdmin === "Employee Admin") {
            navigate("/employee-admin/dashboard");
          } else {
            navigate("/recruiter/dashboard");
          }
          break;
        case "super_admin":
          navigate("/super-admin/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(error?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info("Password reset link will be sent to your email.");
  };

  const getLogoSrc = () => {
    if (currentBranch?.brand_logo) {
      return currentBranch.brand_logo;
    }
    return "/Workforce.svg";
  };

  const getBranchName = () => {
    return currentBranch?.name || "ERAM TALENT";
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img
          src={getLogoSrc()}
          alt={`${getBranchName()} Logo`}
          style={{
            height: "60px",
            width: "auto",
            maxWidth: "180px",
            objectFit: "contain",
          }}
          onError={(e) => {
            // Fallback to default logo if branch logo fails to load
            e.target.src = "/Workforce.svg";
          }}
        />

        <Title
          level={2}
          style={{
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Welcome to Login
        </Title>

        <Text
          style={{
            fontSize: "16px",
            display: "block",
          }}
        >
          Access your {currentBranch?.name || "Branch"} account
        </Text>
      </div>

      <Card
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          border: "none",
          borderRadius: "16px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        }}
        bodyStyle={{ padding: "32px" }}
      >
        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label={
              <span
                style={{
                  color: "#374151",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Email Address
              </span>
            }
            name="email"
            rules={[
              {
                required: true,
                message: "Please enter your email address!",
              },
              {
                type: "email",
                message: "Please enter a valid email address!",
              },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: "#da2c46" }} />}
              placeholder="Enter your email address"
              style={{
                borderRadius: "8px",
                padding: "12px",
                borderColor: "#da2c46",
                fontSize: "16px",
              }}
            />
          </Form.Item>

          <Form.Item
            label={
              <span
                style={{
                  color: "#374151",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Password
              </span>
            }
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password!",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters long!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#da2c46" }} />}
              placeholder="Enter your password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              style={{
                borderRadius: "8px",
                padding: "12px",
                borderColor: "#da2c46",
                fontSize: "16px",
              }}
            />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox style={{ color: "#64748b" }}>Remember me</Checkbox>
            </Form.Item>

            <Link
              onClick={handleForgotPassword}
              style={{ color: "#da2c46", fontWeight: "500" }}
            >
              Forgot password?
            </Link>
          </div>

          <Form.Item style={{ marginBottom: "16px" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                border: "none",
                borderRadius: "8px",
                height: "48px",
                fontSize: "16px",
                fontWeight: "600",
                boxShadow: "0 4px 16px rgba(218, 44, 70, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 20px rgba(218, 44, 70, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0px)";
                e.target.style.boxShadow = "0 4px 16px rgba(218, 44, 70, 0.3)";
              }}
            >
              Sign In
            </Button>
          </Form.Item>

          <Divider />

          {/* ✅ Sign up section */}
          <div style={{ textAlign: "center" }}>
            <Text>Don’t have an account? </Text>
            <Link
              style={{ color: "#da2c46", fontWeight: "500" }}
              onClick={() =>
                navigate(
                  currentBranch?._id
                    ? `/branch-register?branchId=${currentBranch._id}`
                    : "/branch-register"
                )
              }
            >
              Sign up here
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginSection;
