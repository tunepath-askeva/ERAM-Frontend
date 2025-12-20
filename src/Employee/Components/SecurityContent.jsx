import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Button,
  List,
  Avatar,
  Switch,
  Alert,
  Space,
  Tag,
} from "antd";
import { useSnackbar } from "notistack";
import { LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useChangePasswordMutation } from "../../Slices/Users/UserApis";
const SecurityContent = ({ employeeData }) => {
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      const response = await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();

      enqueueSnackbar("Password changed successfully!", { variant: "success" });
      form.resetFields();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to change password", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card
        title={
          <span>
            <SafetyCertificateOutlined
              style={{ marginRight: 8, color: "#da2c46" }}
            />
            Password & Security
          </span>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form form={form} layout="vertical" onFinish={handlePasswordChange}>
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[
                  { required: true, message: "Please enter current password" },
                ]}
              >
                <Input.Password placeholder="Enter current password" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="New Password"
                name="newPassword"
                rules={[
                  { required: true, message: "Please enter new password" },
                  { min: 8, message: "Password must be at least 8 characters" },
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: "#da2c46", border: "none" }}
              loading={loading || isChangingPassword}
            >
              Update Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SecurityContent;
