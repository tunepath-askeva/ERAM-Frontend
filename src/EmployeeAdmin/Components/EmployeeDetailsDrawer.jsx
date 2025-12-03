import React from "react";
import { Drawer, Descriptions, Tag, Spin, Button, Space, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  IdcardOutlined,
  BankOutlined,
  HomeOutlined,
  ContactsOutlined,
  EditOutlined,
  SafetyOutlined,
  IdcardFilled,
  MailFilled,
  ToolOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useGetEmployeeDetailsQuery } from "../../Slices/Recruiter/RecruiterApis";

const EmployeeDetailsDrawer = ({ visible, employeeId, onClose, onEdit }) => {
  const { data, isLoading, error } = useGetEmployeeDetailsQuery(employeeId, {
    skip: !employeeId || !visible,
  });

  const employee = data?.employee;

  const InfoSection = ({ title, icon, children }) => (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "16px",
          color: "#da2c46",
        }}
      >
        {icon}
        <h3 style={{ margin: 0, marginLeft: "8px", color: "#da2c46" }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  const InfoItem = ({ label, value, span = 1 }) => (
    <div
      style={{
        marginBottom: "12px",
        gridColumn: span > 1 ? `span ${span}` : "auto",
      }}
    >
      <div style={{ fontSize: "12px", color: "#888", marginBottom: "4px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", fontWeight: 500 }}>
        {value || <span style={{ color: "#ccc" }}>Not provided</span>}
      </div>
    </div>
  );

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <UserOutlined style={{ color: "#da2c46" }} />
          <span style={{ color: "#da2c46" }}>Employee Details</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={720}
      extra={
        employee && (
          <Space>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => onEdit(employee)}
              style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
            >
              Edit
            </Button>
          </Space>
        )
      }
    >
      {isLoading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px", color: "#666" }}>
            Loading employee details...
          </p>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "red" }}>Error loading employee details</p>
        </div>
      )}

      {employee && (
        <div>
          {/* Header Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #da2c46 0%, #ff4d6d 100%)",
              padding: "24px",
              borderRadius: "8px",
              marginBottom: "24px",
              color: "white",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                }}
              >
                {employee.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, color: "white", fontSize: "24px" }}>
                  {employee.fullName}
                </h2>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    opacity: 0.9,
                    fontSize: "14px",
                  }}
                >
                  {employee.employmentDetails?.assignedJobTitle || "Employee"}
                </p>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
                  <Tag
                    color="white"
                    style={{
                      color: "#da2c46",
                      fontWeight: 500,
                    }}
                  >
                    {employee.uniqueCode}
                  </Tag>
                  <Tag
                    color={employee.accountStatus === "active" ? "green" : "red"}
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {employee.accountStatus?.toUpperCase()}
                  </Tag>
                  <Tag
                    color="blue"
                    style={{
                      fontWeight: 500,
                    }}
                  >
                    {employee.candidateType}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <InfoSection title="Personal Information" icon={<UserOutlined />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InfoItem label="First Name" value={employee.firstName} />
              <InfoItem label="Middle Name" value={employee.middleName} />
              <InfoItem label="Last Name" value={employee.lastName} />
              <InfoItem label="Full Name" value={employee.fullName} />
              <InfoItem label="Email" value={employee.email} span={2} />
              <InfoItem label="Phone" value={employee.phone} />
              <InfoItem label="Role" value={employee.role} />
            </div>
          </InfoSection>

          <Divider />

          {/* Employment Details */}
          <InfoSection title="Employment Details" icon={<IdcardOutlined />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InfoItem
                label="Job Title"
                value={employee.employmentDetails?.assignedJobTitle}
              />
              <InfoItem
                label="Category"
                value={employee.employmentDetails?.category}
              />
              <InfoItem
                label="Date of Joining"
                value={
                  employee.employmentDetails?.dateOfJoining
                    ? new Date(
                        employee.employmentDetails.dateOfJoining
                      ).toLocaleDateString()
                    : null
                }
              />
              <InfoItem
                label="ERAM ID"
                value={employee.employmentDetails?.eramId}
              />
              <InfoItem
                label="Badge Number"
                value={employee.employmentDetails?.badgeNo}
              />
              <InfoItem
                label="Gate Pass ID"
                value={employee.employmentDetails?.gatePassId}
              />
              <InfoItem
                label="Aramco ID"
                value={employee.employmentDetails?.aramcoId}
              />
              <InfoItem
                label="Other ID"
                value={employee.employmentDetails?.otherId}
              />
              <InfoItem
                label="Plant ID"
                value={employee.employmentDetails?.plantId}
              />
              <InfoItem
                label="Official Email"
                value={employee.employmentDetails?.officialEmail}
                span={2}
              />
              <InfoItem
                label="Basic Assets"
                value={employee.employmentDetails?.basicAssets}
                span={2}
              />
              <InfoItem
                label="Reporting & Documentation"
                value={employee.employmentDetails?.reportingAndDocumentation}
                span={2}
              />
            </div>
          </InfoSection>

          <Divider />

          {/* Branch Information */}
          {employee.branch && (
            <>
              <InfoSection title="Branch Information" icon={<BankOutlined />}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <InfoItem
                    label="Branch ID"
                    value={employee.branch?._id}
                  />
                  <InfoItem
                    label="Branch Order"
                    value={employee.branch?.branchOrder}
                  />
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

          {/* Collections Section - Show only if any of these arrays have data */}
          {(employee.qualifications?.length > 0 || 
            employee.skills?.length > 0 || 
            employee.languages?.length > 0 ||
            employee.visaStatus?.length > 0 ||
            employee.industry?.length > 0 ||
            employee.certificates?.length > 0 ||
            employee.education?.length > 0 ||
            employee.workExperience?.length > 0) && (
            <>
              <InfoSection title="Additional Information" icon={<FileTextOutlined />}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {employee.qualifications?.length > 0 && (
                    <InfoItem 
                      label="Qualifications" 
                      value={employee.qualifications.join(", ")} 
                      span={2}
                    />
                  )}
                  {employee.skills?.length > 0 && (
                    <InfoItem 
                      label="Skills" 
                      value={employee.skills.join(", ")} 
                      span={2}
                    />
                  )}
                  {employee.languages?.length > 0 && (
                    <InfoItem 
                      label="Languages" 
                      value={employee.languages.join(", ")} 
                      span={2}
                    />
                  )}
                  {employee.visaStatus?.length > 0 && (
                    <InfoItem 
                      label="Visa Status" 
                      value={employee.visaStatus.join(", ")} 
                      span={2}
                    />
                  )}
                  {employee.industry?.length > 0 && (
                    <InfoItem 
                      label="Industry" 
                      value={employee.industry.join(", ")} 
                      span={2}
                    />
                  )}
                  {employee.certificates?.length > 0 && (
                    <InfoItem 
                      label="Certificates" 
                      value={employee.certificates.join(", ")} 
                      span={2}
                    />
                  )}
                  {employee.education?.length > 0 && (
                    <InfoItem 
                      label="Education" 
                      value={employee.education.join(", ")} 
                      span={2}
                    />
                  )}
                  {employee.workExperience?.length > 0 && (
                    <InfoItem 
                      label="Work Experience" 
                      value={employee.workExperience.join(", ")} 
                      span={2}
                    />
                  )}
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

          {/* Permissions */}
          {employee.permissions?.length > 0 && (
            <>
              <InfoSection title="Permissions" icon={<SafetyOutlined />}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                  }}
                >
                  {employee.permissions.map((permission, index) => (
                    <Tag key={index} color="blue">
                      {permission}
                    </Tag>
                  ))}
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

          {/* Social Links - Only show if any social link has value */}
          {employee.socialLinks && (
            Object.values(employee.socialLinks).some(link => link) && (
              <>
                <InfoSection title="Social Links" icon={<ContactsOutlined />}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    {employee.socialLinks?.linkedin && (
                      <InfoItem label="LinkedIn" value={employee.socialLinks.linkedin} />
                    )}
                    {employee.socialLinks?.github && (
                      <InfoItem label="GitHub" value={employee.socialLinks.github} />
                    )}
                    {employee.socialLinks?.twitter && (
                      <InfoItem label="Twitter" value={employee.socialLinks.twitter} />
                    )}
                    {employee.socialLinks?.facebook && (
                      <InfoItem label="Facebook" value={employee.socialLinks.facebook} />
                    )}
                  </div>
                </InfoSection>
                <Divider />
              </>
            )
          )}

          {/* Job Preferences - Only show if any preference has value */}
          {employee.jobPreferences && (
            Object.values(employee.jobPreferences).some(pref => 
              (Array.isArray(pref) && pref.length > 0) || 
              (typeof pref === 'string' && pref)
            ) && (
              <>
                <InfoSection title="Job Preferences" icon={<ToolOutlined />}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                    }}
                  >
                    {employee.jobPreferences?.roles?.length > 0 && (
                      <InfoItem 
                        label="Preferred Roles" 
                        value={employee.jobPreferences.roles.join(", ")} 
                        span={2}
                      />
                    )}
                    {employee.jobPreferences?.locations?.length > 0 && (
                      <InfoItem 
                        label="Preferred Locations" 
                        value={employee.jobPreferences.locations.join(", ")} 
                        span={2}
                      />
                    )}
                    {employee.jobPreferences?.salaryRange && (
                      <InfoItem 
                        label="Salary Range" 
                        value={employee.jobPreferences.salaryRange} 
                      />
                    )}
                    {employee.jobPreferences?.workType && (
                      <InfoItem 
                        label="Work Type" 
                        value={employee.jobPreferences.workType} 
                      />
                    )}
                    {employee.jobPreferences?.employmentType && (
                      <InfoItem 
                        label="Employment Type" 
                        value={employee.jobPreferences.employmentType} 
                      />
                    )}
                  </div>
                </InfoSection>
                <Divider />
              </>
            )
          )}

          {/* System Information */}
          <InfoSection title="System Information" icon={<CalendarOutlined />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InfoItem
                label="Created By"
                value={
                  employee.createdBy?.fullName || employee.createdBy?.email
                }
              />
              <InfoItem
                label="Created At"
                value={
                  employee.createdAt
                    ? new Date(employee.createdAt).toLocaleString()
                    : null
                }
              />
              <InfoItem
                label="Last Updated"
                value={
                  employee.updatedAt
                    ? new Date(employee.updatedAt).toLocaleString()
                    : null
                }
              />
              <InfoItem
                label="Employee ID"
                value={employee._id}
                span={2}
              />
            </div>
          </InfoSection>
        </div>
      )}
    </Drawer>
  );
};

export default EmployeeDetailsDrawer;