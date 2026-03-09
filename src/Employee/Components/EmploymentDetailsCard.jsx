import React from "react";
import {
  Card,
  Form,
  Input,
  Row,
  Col,
  Typography,
  DatePicker,
  Switch,
  Select,
} from "antd";
import {
  IdcardOutlined,
  MailOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ViewField from "./ViewField";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EmploymentDetailsCard = ({ employeeData }) => {
  const [form] = Form.useForm();

  // Format date for DatePicker
  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString) : null;
  };

  const formInitialValues = {
    // Read-only fields
    workorderId: typeof employeeData?.employmentDetails?.workorderId === "object"
      ? employeeData.employmentDetails.workorderId._id || ""
      : employeeData?.employmentDetails?.workorderId || "",
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
    
    // Project field
    project: employeeData?.employmentDetails?.project?._id || employeeData?.employmentDetails?.project || "",
    
    // Department field (editable)
    department: employeeData?.employmentDetails?.department || "",
    
    // Reporting Manager field (editable)
    reportingManager: employeeData?.employmentDetails?.reportingManager || "",
  };

  return (
    <Card
      title={
        <span>
          <SafetyOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          Employment Details (Read Only)
        </span>
      }
      style={{ marginBottom: 24, borderRadius: "12px" }}
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
          <ViewField
            label="ERAM ID"
            value={employeeData?.employmentDetails?.eramId}
            prefix={<IdcardOutlined />}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Assigned Job Title"
            value={employeeData?.employmentDetails?.assignedJobTitle}
          />
        </Col>

          {/* <Col xs={24} sm={12}>
            <Form.Item label="Work Order ID" name="workorderId">
              <Input 
                prefix={<IdcardOutlined />} 
                disabled
                value={
                  typeof employeeData?.employmentDetails?.workorderId === "object"
                    ? employeeData.employmentDetails.workorderId._id || ""
                    : employeeData?.employmentDetails?.workorderId || ""
                }
              />
            </Form.Item>
          </Col> */}

        {employeeData?.employmentDetails?.workorderId && (
          <Col xs={24} sm={12}>
            <ViewField
              label="Work Order Title"
              value={
                typeof employeeData.employmentDetails.workorderId === "object"
                  ? employeeData.employmentDetails.workorderId.title
                  : null
              }
            />
          </Col>
        )}

        {employeeData?.employmentDetails?.workorderId && 
         typeof employeeData.employmentDetails.workorderId === "object" &&
         employeeData.employmentDetails.workorderId.jobCode && (
          <Col xs={24} sm={12}>
            <ViewField
              label="Job Code"
              value={employeeData.employmentDetails.workorderId.jobCode}
            />
          </Col>
        )}

        {employeeData?.employmentDetails?.workorderId?.project && (
          <Col xs={24} sm={12}>
            <ViewField
              label="Work Order Project"
              value={
                typeof employeeData.employmentDetails.workorderId.project === "object"
                  ? `${employeeData.employmentDetails.workorderId.project.name} ${
                      employeeData.employmentDetails.workorderId.project.prefix
                        ? `(${employeeData.employmentDetails.workorderId.project.prefix})`
                        : ""
                    }`
                  : null
              }
            />
          </Col>
        )}

        <Col xs={24} sm={12}>
          <ViewField
            label="Assigned Project"
            value={
              employeeData?.employmentDetails?.project
                ? typeof employeeData.employmentDetails.project === "object"
                  ? `${employeeData.employmentDetails.project.name} ${
                      employeeData.employmentDetails.project.prefix
                        ? `(${employeeData.employmentDetails.project.prefix})`
                        : ""
                    }`
                  : employeeData.employmentDetails.project
                : null
            }
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Date of Joining"
            value={
              employeeData?.employmentDetails?.dateOfJoining
                ? dayjs(employeeData.employmentDetails.dateOfJoining).format("YYYY-MM-DD")
                : null
            }
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Category"
            value={employeeData?.employmentDetails?.category}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Designation"
            value={employeeData?.employmentDetails?.designation}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="External Emp No"
            value={employeeData?.employmentDetails?.externalEmpNo}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Official Email"
            value={employeeData?.employmentDetails?.officialEmail}
            prefix={<MailOutlined />}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="GOSI"
            value={employeeData?.employmentDetails?.gosi}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Payroll Group"
            value={employeeData?.employmentDetails?.payrollGroup}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Employee Group"
            value={employeeData?.employmentDetails?.employeeGroup}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Employment Type"
            value={employeeData?.employmentDetails?.employmentType}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Sponsor Name"
            value={employeeData?.employmentDetails?.sponsorName}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Work Location"
            value={employeeData?.employmentDetails?.workLocation}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Family Status"
            value={employeeData?.employmentDetails?.familyStatus}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Eligible Vacation Days"
            value={employeeData?.employmentDetails?.eligibleVacationDays}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Eligible Vacation Month"
            value={employeeData?.employmentDetails?.eligibleVacationMonth}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Iqama ID"
            value={employeeData?.employmentDetails?.iqamaId}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Driving License"
            value={employeeData?.employmentDetails?.drivingLicense}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Class Code"
            value={employeeData?.employmentDetails?.classCode}
          />
        </Col>

        {/* Additional Employment Details Section */}
        <Col span={24} style={{ marginTop: 24 }}>
          <Text
            strong
            style={{ color: "#da2c46", marginBottom: 16, display: "block" }}
          >
            Additional Employment Details (Read Only)
          </Text>
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Department"
            value={employeeData?.employmentDetails?.department}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Reporting Manager"
            value={employeeData?.employmentDetails?.reportingManager}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ViewField
            label="Badge Number"
            value={employeeData?.employmentDetails?.badgeNo}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ViewField
            label="Gate Pass ID"
            value={employeeData?.employmentDetails?.gatePassId}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ViewField
            label="Aramco ID"
            value={employeeData?.employmentDetails?.aramcoId}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ViewField
            label="Other ID"
            value={employeeData?.employmentDetails?.otherId}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ViewField
            label="Plant ID"
            value={employeeData?.employmentDetails?.plantId}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ViewField
            label="Visa Category"
            value={employeeData?.employmentDetails?.visaCategory}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Period of Contract"
            value={employeeData?.employmentDetails?.periodOfContract}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Probation Period"
            value={employeeData?.employmentDetails?.probationPeriod}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Insurance Category"
            value={employeeData?.employmentDetails?.insuranceCategory}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Medical Policy Number"
            value={employeeData?.employmentDetails?.medicalPolicyNumber}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Number of Dependents"
            value={employeeData?.employmentDetails?.noOfDependent}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Work Days"
            value={employeeData?.employmentDetails?.workDays}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Work Hours"
            value={employeeData?.employmentDetails?.workHours}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Air Ticket Frequency"
            value={employeeData?.employmentDetails?.airTicketFrequency}
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Last Arrival"
            value={
              employeeData?.employmentDetails?.lastArrival
                ? dayjs(employeeData.employmentDetails.lastArrival).format("YYYY-MM-DD")
                : null
            }
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Last Working Day"
            value={
              employeeData?.employmentDetails?.lastWorkingDay
                ? dayjs(employeeData.employmentDetails.lastWorkingDay).format("YYYY-MM-DD")
                : null
            }
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Iqama Issue Date"
            value={
              employeeData?.employmentDetails?.iqamaIssueDate
                ? dayjs(employeeData.employmentDetails.iqamaIssueDate).format("YYYY-MM-DD")
                : null
            }
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Iqama Expiry Date"
            value={
              employeeData?.employmentDetails?.iqamaExpiryDate
                ? dayjs(employeeData.employmentDetails.iqamaExpiryDate).format("YYYY-MM-DD")
                : null
            }
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Iqama Arabic Date of Issue"
            value={
              employeeData?.employmentDetails?.iqamaArabicDateOfIssue
                ? dayjs(employeeData.employmentDetails.iqamaArabicDateOfIssue).format("YYYY-MM-DD")
                : null
            }
          />
        </Col>

        <Col xs={24} sm={12}>
          <ViewField
            label="Iqama Arabic Date of Expiry"
            value={
              employeeData?.employmentDetails?.iqamaArabicDateOfExpiry
                ? dayjs(employeeData.employmentDetails.iqamaArabicDateOfExpiry).format("YYYY-MM-DD")
                : null
            }
          />
        </Col>

        <Col xs={24}>
          <ViewField
            label="Basic Assets"
            value={employeeData?.employmentDetails?.basicAssets}
          />
        </Col>

        <Col xs={24}>
          <ViewField
            label="Reporting and Documentation"
            value={employeeData?.employmentDetails?.reportingAndDocumentation}
          />
        </Col>

        {/* Asset Allocation */}
        <Col xs={24}>
          <ViewField
            label="Asset Allocation"
            value={
              Array.isArray(employeeData?.employmentDetails?.assetAllocation) &&
              employeeData.employmentDetails.assetAllocation.length > 0
                ? employeeData.employmentDetails.assetAllocation.join(", ")
                : null
            }
          />
        </Col>

        {/* Switch Fields */}
        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(0, 0, 0, 0.85)",
                marginBottom: 8,
              }}
            >
              First Time Login
            </div>
            <div
              style={{
                padding: "4px 11px",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                minHeight: "32px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <Text>
                {employeeData?.employmentDetails?.firstTimeLogin ? "Yes" : "No"}
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} sm={12}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(0, 0, 0, 0.85)",
                marginBottom: 8,
              }}
            >
              Medical Policy
            </div>
            <div
              style={{
                padding: "4px 11px",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                minHeight: "32px",
                display: "flex",
                alignItems: "center",
                backgroundColor: "#fafafa",
              }}
            >
              <Text>
                {employeeData?.employmentDetails?.medicalPolicy ? "Yes" : "No"}
              </Text>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default EmploymentDetailsCard;
