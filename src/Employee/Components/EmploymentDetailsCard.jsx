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
  Select,
} from "antd";
import {
  EditOutlined,
  CalendarOutlined,
  IdcardOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  BankOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";

const { Text } = Typography;
const { TextArea } = Input;

const EmploymentDetailsCard = ({ employeeData, loading, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = async (values) => {
    try {
      await onUpdate({
        employmentDetails: values,
      });
      enqueueSnackbar("Employment details updated successfully!", {
        variant: "success",
      });
      setEditMode(false);
    } catch (error) {
      console.error("Failed to update employment details", error);
      enqueueSnackbar(
        error?.data?.message || "Failed to update employment details",
        {
          variant: "error",
        }
      );
    }
  };

  // Format date for DatePicker
  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString) : null;
  };

  const formInitialValues = {
    // Read-only fields
    workorderId: employeeData?.employmentDetails?.workorderId || "",
    dateOfJoining: formatDate(employeeData?.employmentDetails?.dateOfJoining),
    category: employeeData?.employmentDetails?.category || "",
    designation: employeeData?.employmentDetails?.designation || "",
    familyStatus: employeeData?.employmentDetails?.familyStatus || "",
    externalEmpNo: employeeData?.employmentDetails?.externalEmpNo || "",
    officialEmail: employeeData?.employmentDetails?.officialEmail || "",
    gosi: employeeData?.employmentDetails?.gosi || "",
    payrollGroup: employeeData?.employmentDetails?.payrollGroup || "",
    customFieldId: employeeData?.employmentDetails?.customFieldId || "",
    eramId: employeeData?.employmentDetails?.eramId || "",
    assignedJobTitle: employeeData?.employmentDetails?.assignedJobTitle || "",
    employeeGroup: employeeData?.employmentDetails?.employeeGroup || "",
    employmentType: employeeData?.employmentDetails?.employmentType || "",
    sponsorName: employeeData?.employmentDetails?.sponsorName || "",
    workLocation: employeeData?.employmentDetails?.workLocation || "",
    eligibleVacationDays:
      employeeData?.employmentDetails?.eligibleVacationDays || "",
    eligibleVacationMonth:
      employeeData?.employmentDetails?.eligibleVacationMonth || "",
    iqamaId: employeeData?.employmentDetails?.iqamaId || "",
    drivingLicense: employeeData?.employmentDetails?.drivingLicense || "",
    classCode: employeeData?.employmentDetails?.classCode || "",

    // Editable fields
    badgeNo: employeeData?.employmentDetails?.badgeNo || "",
    gatePassId: employeeData?.employmentDetails?.gatePassId || "",
    aramcoId: employeeData?.employmentDetails?.aramcoId || "",
    otherId: employeeData?.employmentDetails?.otherId || "",
    plantId: employeeData?.employmentDetails?.plantId || "",
    basicAssets: employeeData?.employmentDetails?.basicAssets || "",
    visaCategory: employeeData?.employmentDetails?.visaCategory || "",
    periodOfContract: employeeData?.employmentDetails?.periodOfContract || "",
    probationPeriod: employeeData?.employmentDetails?.probationPeriod || "",
    insuranceCategory: employeeData?.employmentDetails?.insuranceCategory || "",
    medicalPolicyNumber:
      employeeData?.employmentDetails?.medicalPolicyNumber || "",
    noOfDependent: employeeData?.employmentDetails?.noOfDependent || "",
    workDays: employeeData?.employmentDetails?.workDays || "",
    workHours: employeeData?.employmentDetails?.workHours || "",
    airTicketFrequency:
      employeeData?.employmentDetails?.airTicketFrequency || "",
    lastArrival: formatDate(employeeData?.employmentDetails?.lastArrival),
    lastWorkingDay: formatDate(employeeData?.employmentDetails?.lastWorkingDay),
    iqamaIssueDate: formatDate(employeeData?.employmentDetails?.iqamaIssueDate),
    iqamaExpiryDate: formatDate(
      employeeData?.employmentDetails?.iqamaExpiryDate
    ),
    iqamaArabicDateOfIssue: formatDate(
      employeeData?.employmentDetails?.iqamaArabicDateOfIssue
    ),
    iqamaArabicDateOfExpiry: formatDate(
      employeeData?.employmentDetails?.iqamaArabicDateOfExpiry
    ),
    reportingAndDocumentation:
      employeeData?.employmentDetails?.reportingAndDocumentation || "",

    // Switch/Boolean fields
    firstTimeLogin: employeeData?.employmentDetails?.firstTimeLogin || false,
    medicalPolicy: employeeData?.employmentDetails?.medicalPolicy || false,

    // Array fields
    assetAllocation: employeeData?.employmentDetails?.assetAllocation || [],
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
            <Text
              strong
              style={{ color: "#da2c46", marginBottom: 16, display: "block" }}
            >
              Official Information (Read Only)
            </Text>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="ERAM ID" name="eramId">
              <Input prefix={<IdcardOutlined />} disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Assigned Job Title" name="assignedJobTitle">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Workorder ID" name="workorderId">
              <Input prefix={<IdcardOutlined />} disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Date of Joining" name="dateOfJoining">
              <DatePicker
                style={{ width: "100%" }}
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

          <Col xs={24} sm={12}>
            <Form.Item label="Employee Group" name="employeeGroup">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Employment Type" name="employmentType">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Sponsor Name" name="sponsorName">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Work Location" name="workLocation">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Family Status" name="familyStatus">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Eligible Vacation Days"
              name="eligibleVacationDays"
            >
              <Input type="number" disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Eligible Vacation Month"
              name="eligibleVacationMonth"
            >
              <Input type="number" disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Iqama ID" name="iqamaId">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Driving License" name="drivingLicense">
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Class Code" name="classCode">
              <Input disabled />
            </Form.Item>
          </Col>

          {/* Editable Section */}
          <Col span={24} style={{ marginTop: 24 }}>
            <Text
              strong
              style={{ color: "#da2c46", marginBottom: 16, display: "block" }}
            >
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
              <Input type="number" disabled={!editMode} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Work Hours" name="workHours">
              <Input type="number" disabled={!editMode} />
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
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Last Working Day" name="lastWorkingDay">
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Iqama Issue Date" name="iqamaIssueDate">
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item label="Iqama Expiry Date" name="iqamaExpiryDate">
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Iqama Arabic Date of Issue"
              name="iqamaArabicDateOfIssue"
            >
              <DatePicker
                style={{ width: "100%" }}
                format="YYYY-MM-DD"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Iqama Arabic Date of Expiry"
              name="iqamaArabicDateOfExpiry"
            >
              <DatePicker
                style={{ width: "100%" }}
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

          <Col xs={24}>
            <Form.Item
              label="Reporting and Documentation"
              name="reportingAndDocumentation"
            >
              <TextArea
                rows={3}
                disabled={!editMode}
                placeholder="Reporting and documentation details"
              />
            </Form.Item>
          </Col>

          {/* Asset Allocation - Display as Tags */}
          <Col xs={24}>
            <Form.Item label="Asset Allocation" name="assetAllocation">
              <Select
                mode="tags"
                disabled={!editMode}
                placeholder="Add assets"
                style={{ width: "100%" }}
              >
                <Option value="laptop">Laptop</Option>
                <Option value="phone">Phone</Option>
                <Option value="tablet">Tablet</Option>
                <Option value="vehicle">Vehicle</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Switch Fields */}
          <Col xs={24} sm={12}>
            <Form.Item
              label="First Time Login"
              name="firstTimeLogin"
              valuePropName="checked"
            >
              <Switch disabled />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Medical Policy"
              name="medicalPolicy"
              valuePropName="checked"
            >
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
