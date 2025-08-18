import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Avatar,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Upload,
  message,
  Card 
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  UploadOutlined,
  ProjectOutlined,
  IdcardOutlined,
  NumberOutlined,
  FlagOutlined,
  MailOutlined
} from "@ant-design/icons";

const { Text } = Typography;

const PersonalInformationCard = ({ employeeData, loading, onUpdate }) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);

  const handleAvatarUpload = ({ file, fileList }) => {
    if (file.status === "done") {
      message.success("Profile picture updated successfully!");
      onUpdate({
        ...employeeData,
        image: URL.createObjectURL(file.originFileObj),
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      await onUpdate(values);
      setEditMode(false);
    } catch (error) {
      message.error("Failed to update profile");
    }
  };

  // Map API response to form fields
  const formInitialValues = {
    firstName: employeeData?.firstName || '',
    middleName: employeeData?.middleName || '',
    lastName: employeeData?.lastName || '',
    fullName: employeeData?.fullName || '',
    eramId: employeeData?.employmentDetails?.eramId || employeeData?.eramId || '',
    nationality: employeeData?.nationality || '',
    assignedJobTitle: employeeData?.employmentDetails?.assignedJobTitle || employeeData?.title || '',
    email: employeeData?.email || '',
  };

  return (
    <>
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Personal Information
            </span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit"}
            </Button>
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={formInitialValues}
        >
          <Row gutter={24}>
            <Col span={24} style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  size={100}
                  src={employeeData?.image}
                  icon={<UserOutlined />}
                  style={{ border: "4px solid #da2c46" }}
                />
                <Button
                  type="primary"
                  shape="circle"
                  icon={<CameraOutlined />}
                  size="small"
                  onClick={() => setUploadModal(true)}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "#da2c46",
                    border: "2px solid white",
                  }}
                />
              </div>
              <div style={{ marginTop: 12 }}>
                <Text
                  style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  {employeeData?.fullName || `${employeeData?.firstName || ''} ${employeeData?.lastName || ''}`.trim()}
                </Text>
                <Text type="secondary">
                  {employeeData?.employmentDetails?.assignedJobTitle || employeeData?.title}
                </Text>
                <br />
                <Tag color="blue" style={{ marginTop: 4 }}>
                  ID: {employeeData?.employmentDetails?.eramId || employeeData?.eramId}
                </Tag>
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="First Name" name="firstName">
                <Input prefix={<UserOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Middle Name" name="middleName">
                <Input prefix={<UserOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Last Name" name="lastName">
                <Input prefix={<UserOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Full Name" name="fullName">
                <Input prefix={<UserOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="ERAM ID" name="eramId">
                <Input prefix={<IdcardOutlined />} disabled />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Nationality" name="nationality">
                <Input prefix={<FlagOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Job Title" name="assignedJobTitle">
                <Input disabled />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Email" name="email">
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
            </Col>
          </Row>

          {editMode && (
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <Space>
                <Button onClick={() => setEditMode(false)}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ background: "#da2c46", border: "none" }}
                >
                  Save Changes
                </Button>
              </Space>
            </div>
          )}
        </Form>
      </Card>

      <Modal
        title="Update Profile Picture"
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={null}
        centered
      >
        <div style={{ textAlign: "center" }}>
          <Avatar
            size={120}
            src={employeeData?.image}
            icon={<UserOutlined />}
            style={{ border: "4px solid #da2c46", marginBottom: 16 }}
          />
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
            onChange={handleAvatarUpload}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              style={{ background: "#da2c46", border: "none" }}
            >
              Upload New Picture
            </Button>
          </Upload>
          <div style={{ marginTop: 16, color: "#666", fontSize: "12px" }}>
            Recommended: Square image, max 2MB
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PersonalInformationCard;