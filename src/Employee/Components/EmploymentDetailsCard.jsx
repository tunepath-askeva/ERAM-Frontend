import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Button,
  Space,
  Typography,
  Tag,
  message,
} from "antd";
import {
  ApartmentOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  NumberOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const EmploymentDetailsCard = ({ employeeData, loading, onUpdate }) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = async (values) => {
    try {
      await onUpdate(values);
      setEditMode(false);
    } catch (error) {
      message.error("Failed to update employment details");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Map API response to form fields
  const formInitialValues = {
    officialEmail: employeeData?.employmentDetails?.officialEmail || '',
    dateOfJoining: formatDate(employeeData?.employmentDetails?.dateOfJoining),
    category: employeeData?.employmentDetails?.category || '',
    assignedJobTitle: employeeData?.employmentDetails?.assignedJobTitle || employeeData?.title || '',
    eramId: employeeData?.employmentDetails?.eramId || employeeData?.eramId || '',
    badgeNo: employeeData?.employmentDetails?.badgeNo || '',
    gatePassId: employeeData?.employmentDetails?.gatePassId || '',
    aramcoId: employeeData?.employmentDetails?.aramcoId || '',
    otherId: employeeData?.employmentDetails?.otherId || '',
    plantId: employeeData?.employmentDetails?.plantId || '',
  };

  return (
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
            <ApartmentOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Employment Details
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
          <Col xs={24} sm={12}>
            <Form.Item label="Official Email" name="officialEmail">
              <Input prefix={<MailOutlined />} disabled={!editMode} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Date of Joining" name="dateOfJoining">
              <Input prefix={<CalendarOutlined />} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Category" name="category">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Assigned Job Title" name="assignedJobTitle">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="ERAM ID" name="eramId">
              <Input prefix={<IdcardOutlined />} disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Badge No" name="badgeNo">
              <Input prefix={<NumberOutlined />} disabled={!editMode} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Gate Pass ID" name="gatePassId">
              <Input prefix={<IdcardOutlined />} disabled={!editMode} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Aramco ID" name="aramcoId">
              <Input prefix={<IdcardOutlined />} disabled={!editMode} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Other ID" name="otherId">
              <Input prefix={<NumberOutlined />} disabled={!editMode} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item label="Plant ID" name="plantId">
              <Input prefix={<NumberOutlined />} disabled={!editMode} />
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
  );
};

export default EmploymentDetailsCard;