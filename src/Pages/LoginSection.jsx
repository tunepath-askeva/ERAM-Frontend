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

const { Title, Text, Link } = Typography;

const LoginSection = ({ currentBranch }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      console.log("Login attempt:", values);
      // Add your login logic here
      message.success("Login successful!");
    } catch (error) {
      message.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info("Password reset link will be sent to your email.");
  };

  return (
    <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>    
        
        <Title
          level={2}
          style={{
            marginBottom: "8px",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          Staff Login
        </Title>
        
        <Text
          style={{
            fontSize: "16px",
            display: "block",
          }}
        >
          Access your {currentBranch?.name || 'Branch'} account
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
              <span style={{ color: "#374151", fontWeight: "500", fontSize: "14px" }}>
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
              <span style={{ color: "#374151", fontWeight: "500", fontSize: "14px" }}>
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

 
        </Form>
      </Card>
    </div>
  );
};

export default LoginSection;