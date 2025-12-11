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
  DatePicker,
  Switch,
  Select
} from "antd";
import {
  EditOutlined,
  CalendarOutlined,
  IdcardOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  BankOutlined,
  SafetyOutlined 
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { TextArea } = Input;

const EmploymentDetailsCard = ({ employeeData, loading, onUpdate }) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = async (values) => {
    try {
      await onUpdate({
        employmentDetails: values
      });
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update employment details", error);
    }
  };

  // Format date for DatePicker
  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString) : null;
  };

  const formInitialValues = {
    // Read-only fields
    workorderId: employeeData?.employmentDetails?.workorderId || '',
    dateOfJoining: formatDate(employeeData?.employmentDetails?.dateOfJoining),
    category: employeeData?.employmentDetails?.category || '',
    designation: employeeData?.employmentDetails?.designation || '',
    familyStatus: employeeData?.employmentDetails?.familyStatus || '',
    externalEmpNo: employeeData?.employmentDetails?.externalEmpNo || '',
    officialEmail: employeeData?.employmentDetails?.officialEmail || '',
    gosi: employeeData?.employmentDetails?.gosi || '',
    payrollGroup: employeeData?.employmentDetails?.payrollGroup || '',
    customFieldId: employeeData?.employmentDetails?.customFieldId || '',
    
    // Editable fields
    badgeNo: employeeData?.employmentDetails?.badgeNo || '',
    gatePassId: employeeData?.employmentDetails?.gatePassId || '',
    aramcoId: employeeData?.employmentDetails?.aramcoId || '',
    otherId: employeeData?.employmentDetails?.otherId || '',
    plantId: employeeData?.employmentDetails?.plantId || '',
    basicAssets: employeeData?.employmentDetails?.basicAssets || '',
    visaCategory: employeeData?.employmentDetails?.visaCategory || '',
    periodOfContract: employeeData?.employmentDetails?.periodOfContract || '',
    probationPeriod: employeeData?.employmentDetails?.probationPeriod || '',
    insuranceCategory: employeeData?.employmentDetails?.insuranceCategory || '',
    medicalPolicyNumber: employeeData?.employmentDetails?.medicalPolicyNumber || '',
    noOfDependent: employeeData?.employmentDetails?.noOfDependent || '',
    workDays: employeeData?.employmentDetails?.workDays || '',
    workHours: employeeData?.employmentDetails?.workHours || '',
    airTicketFrequency: employeeData?.employmentDetails?.airTicketFrequency || '',
    lastArrival: formatDate(employeeData?.employmentDetails?.lastArrival),
    lastWorkingDay: formatDate(employeeData?.employmentDetails?.lastWorkingDay),
    iqamaIssueDate: formatDate(employeeData?.employmentDetails?.iqamaIssueDate),
    iqamaExpiryDate: formatDate(employeeData?.employmentDetails?.iqamaExpiryDate),
    iqamaArabicDateOfIssue: formatDate(employeeData?.employmentDetails?.iqamaArabicDateOfIssue),
    iqamaArabicDateOfExpiry: formatDate(employeeData?.employmentDetails?.iqamaArabicDateOfExpiry),
    
    // Switch fields
    firstTimeLogin: employeeData?.employmentDetails?.firstTimeLogin || false,
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>
            <SafetyOutlined style={{ marginRight: 8, color: "#da2c46" }} />
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
          {/* Read-only Section */}
          <Col span={24}>
            <Text strong style={{ color: "#da2c46", marginBottom: 16, display: "block" }}>
              Official Information (Read Only)
            </Text>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Workorder ID" name="workorderId">
              <Input prefix={<IdcardOutlined />} disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Date of Joining" name="dateOfJoining">
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabled
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Category" name="category">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Designation" name="designation">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="External Emp No" name="externalEmpNo">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Official Email" name="officialEmail">
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="GOSI" name="gosi">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Payroll Group" name="payrollGroup">
              <Input disabled />
            </Form.Item>
          </Col>

          {/* Editable Section */}
          <Col span={24}>
            <Text strong style={{ color: "#da2c46", marginBottom: 16, display: "block" }}>
              Editable Employment Details
            </Text>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item label="Badge Number" name="badgeNo">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item label="Gate Pass ID" name="gatePassId">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item label="Aramco ID" name="aramcoId">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item label="Other ID" name="otherId">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item label="Plant ID" name="plantId">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={8}>
            <Form.Item label="Visa Category" name="visaCategory">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Period of Contract" name="periodOfContract">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Probation Period" name="probationPeriod">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Insurance Category" name="insuranceCategory">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Medical Policy Number" name="medicalPolicyNumber">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Number of Dependents" name="noOfDependent">
              <Input type="number" disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Work Days" name="workDays">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Work Hours" name="workHours">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Air Ticket Frequency" name="airTicketFrequency">
              <Input disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Last Arrival" name="lastArrival">
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Last Working Day" name="lastWorkingDay">
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Iqama Issue Date" name="iqamaIssueDate">
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Iqama Expiry Date" name="iqamaExpiryDate">
              <DatePicker
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item label="Basic Assets" name="basicAssets">
              <TextArea
                rows={3}
                disabled={!editMode}
                placeholder="List of basic assets assigned"
              />
            </Form.Item>
          </Col>

          {/* Switch Fields */}
          <Col xs={24} sm={12}>
            <Form.Item label="First Time Login" name="firstTimeLogin" valuePropName="checked">
              <Switch disabled />
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
                Save Employment Details
              </Button>
            </Space>
          </div>
        )}
      </Form>
    </Card>
  );
};

export default EmploymentDetailsCard;