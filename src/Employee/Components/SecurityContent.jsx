import React from "react";
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
import { LockOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const SecurityContent = ({ employeeData }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Received values of form: ", values);
    // Implement password change logic here
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
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
            >
              Update Password
            </Button>
          </div>
        </Form>
      </Card>

      {/* Rest of the security content... */}
    </div>
  );
};

export default SecurityContent;
