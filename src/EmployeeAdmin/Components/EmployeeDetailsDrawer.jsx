import React from "react";
import { Drawer, Tag, Spin, Button, Space, Divider, Image } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  IdcardOutlined,
  BankOutlined,
  ContactsOutlined,
  EditOutlined,
  SafetyOutlined,
  ToolOutlined,
  FileTextOutlined,
  GlobalOutlined,
  TrophyOutlined,
  BookOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  HeartOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useGetEmployeeDetailsQuery } from "../../Slices/Recruiter/RecruiterApis";

const EmployeeDetailsDrawer = ({
  visible,
  employeeId,
  onClose,
  onEdit,
  hasPermission,
}) => {
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

  // Entry Type Logic (same as main employee page)
  const getEntryTypeTag = () => {
    if (!employee) return null;
    
    const code = employee.uniqueCode || "";
    const entry = employee.enteringCandidate;

    // Converted from Candidate
    if (code.includes("CAND")) {
      return <Tag color="green">Converted to Employee</Tag>;
    }

    // Direct Employee (EMP)
    if (code.includes("EMP")) {
      if (entry === "bulk") {
        return <Tag color="cyan">Bulk Imported</Tag>;
      }

      if (entry === "addedemployee" || !entry) {
        return <Tag color="purple">Added Employee</Tag>;
      }
    }

    return null;
  };

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
            {hasPermission("edit-employee") && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onEdit(employee)}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Edit
              </Button>
            )}
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
          {/* Header Card with Profile Image */}
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
              {employee.image ? (
                <Image
                  src={employee.image}
                  alt={employee.fullName}
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid rgba(255, 255, 255, 0.3)",
                  }}
                  preview={true}
                />
              ) : (
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
              )}
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
                  {employee.employmentDetails?.assignedJobTitle || employee.title || "Employee"}
                </p>
                <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
                    color={
                      employee.accountStatus === "active" ? "green" : "red"
                    }
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
                  {getEntryTypeTag()}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          {employee.profileSummary && (
            <>
              <InfoSection title="Profile Summary" icon={<FileTextOutlined />}>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#333" }}>
                  {employee.profileSummary}
                </p>
              </InfoSection>
              <Divider />
            </>
          )}

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
              <InfoItem label="Gender" value={employee.gender} />
              <InfoItem 
                label="Date of Birth" 
                value={employee.dob ? new Date(employee.dob).toLocaleDateString() : null}
              />
              <InfoItem label="Age" value={employee.age} />
              <InfoItem label="Blood Group" value={employee.bloodGroup} />
              <InfoItem label="Marital Status" value={employee.maritalStatus} />
              <InfoItem label="Religion" value={employee.religion} />
              <InfoItem label="Nationality" value={employee.nationality} />
              <InfoItem label="Country of Birth" value={employee.countryOfBirth} />
              <InfoItem label="Location" value={employee.location} />
            </div>
          </InfoSection>

          <Divider />

          {/* Identity Documents */}
          <InfoSection title="Identity Documents" icon={<IdcardOutlined />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InfoItem label="Passport No" value={employee.passportNo} />
              <InfoItem label="Passport Place of Issue" value={employee.passportPlaceOfIssue} />
              <InfoItem label="Iqama No" value={employee.iqamaNo} span={2} />
            </div>
          </InfoSection>

          <Divider />

          {/* Employment Details */}
          <InfoSection title="Employment Details" icon={<EnvironmentOutlined />}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <InfoItem
                label="Job Title"
                value={employee.employmentDetails?.assignedJobTitle || employee.title}
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
                label="Work Order ID"
                value={employee.employmentDetails?.workorderId}
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

          {/* Professional Information */}
          {(employee.companyName || employee.agency || employee.clientCode || employee.workorderhint || employee.totalExperienceYears || employee.currentSalary || employee.expectedSalary || employee.noticePeriod) && (
            <>
              <InfoSection title="Professional Information" icon={<EnvironmentOutlined />}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  {employee.companyName && (
                    <InfoItem label="Company Name" value={employee.companyName} />
                  )}
                  {employee.agency && (
                    <InfoItem label="Agency" value={employee.agency} />
                  )}
                  {employee.clientCode && (
                    <InfoItem label="Client Code" value={employee.clientCode} />
                  )}
                  {employee.totalExperienceYears && (
                    <InfoItem label="Total Experience (Years)" value={employee.totalExperienceYears} />
                  )}
                  {employee.currentSalary && (
                    <InfoItem label="Current Salary" value={employee.currentSalary} />
                  )}
                  {employee.expectedSalary && (
                    <InfoItem label="Expected Salary" value={employee.expectedSalary} />
                  )}
                  {employee.noticePeriod && (
                    <InfoItem label="Notice Period" value={employee.noticePeriod} />
                  )}
                  {employee.workorderhint && (
                    <InfoItem label="Work Order Note" value={employee.workorderhint} span={2} />
                  )}
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

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
                  <InfoItem label="Branch ID" value={employee.branch?._id} />
                  <InfoItem
                    label="Branch Order"
                    value={employee.branch?.branchOrder}
                  />
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

          {/* Qualifications & Skills */}
          {(employee.qualifications?.length > 0 || employee.skills?.length > 0 || employee.languages?.length > 0) && (
            <>
              <InfoSection title="Qualifications & Skills" icon={<TrophyOutlined />}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {employee.qualifications?.length > 0 && (
                    <div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                        Qualifications
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {employee.qualifications.map((qual, index) => (
                          <Tag key={index} color="blue">{qual}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  {employee.skills?.length > 0 && (
                    <div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                        Skills
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {employee.skills.map((skill, index) => (
                          <Tag key={index} color="green">{skill}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  {employee.languages?.length > 0 && (
                    <div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                        Languages
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {employee.languages.map((lang, index) => (
                          <Tag key={index} color="purple">{lang}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

          {/* Additional Information */}
          {(employee.visaStatus?.length > 0 || employee.industry?.length > 0) && (
            <>
              <InfoSection title="Additional Information" icon={<GlobalOutlined />}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {employee.visaStatus?.length > 0 && (
                    <div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                        Visa Status
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {employee.visaStatus.map((visa, index) => (
                          <Tag key={index} color="orange">{visa}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                  {employee.industry?.length > 0 && (
                    <div>
                      <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
                        Industry
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {employee.industry.map((ind, index) => (
                          <Tag key={index} color="cyan">{ind}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

          {/* Certificates */}
          {employee.certificates?.length > 0 && (
            <>
              <InfoSection title="Certificates" icon={<TrophyOutlined />}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {employee.certificates.map((cert, index) => (
                    <div 
                      key={cert._id || index}
                      style={{
                        padding: "12px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "6px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, marginBottom: "4px" }}>
                          {cert.fileName}
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Uploaded: {cert.uploadedAt ? new Date(cert.uploadedAt).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                      <Button 
                        type="link" 
                        href={cert.fileUrl} 
                        target="_blank"
                        style={{ color: "#da2c46" }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

          {/* Education */}
          {employee.education?.length > 0 && (
            <>
              <InfoSection title="Education" icon={<BookOutlined />}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {employee.education.map((edu, index) => (
                    <div 
                      key={edu._id || index}
                      style={{
                        padding: "16px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "6px",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "8px", color: "#da2c46" }}>
                        {edu.degree}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <span style={{ fontSize: "12px", color: "#888" }}>Field: </span>
                          <span style={{ fontSize: "14px" }}>{edu.field}</span>
                        </div>
                        <div>
                          <span style={{ fontSize: "12px", color: "#888" }}>Year: </span>
                          <span style={{ fontSize: "14px" }}>{edu.year}</span>
                        </div>
                        <div style={{ gridColumn: "span 2" }}>
                          <span style={{ fontSize: "12px", color: "#888" }}>Institution: </span>
                          <span style={{ fontSize: "14px" }}>{edu.institution}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InfoSection>
              <Divider />
            </>
          )}

          {/* Work Experience */}
          {employee.workExperience?.length > 0 && (
            <>
              <InfoSection title="Work Experience" icon={<EnvironmentOutlined />}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {employee.workExperience.map((work, index) => (
                    <div 
                      key={work._id || index}
                      style={{
                        padding: "16px",
                        border: "1px solid #e8e8e8",
                        borderRadius: "6px",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "15px", marginBottom: "4px", color: "#da2c46" }}>
                        {work.title}
                      </div>
                      <div style={{ fontSize: "14px", marginBottom: "8px", color: "#666" }}>
                        {work.company}
                      </div>
                      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                        <div>
                          <span style={{ fontSize: "12px", color: "#888" }}>Period: </span>
                          <span style={{ fontSize: "13px" }}>
                            {work.startDate} - {work.endDate}
                          </span>
                        </div>
                        {work.workMode && (
                          <Tag color="blue">{work.workMode}</Tag>
                        )}
                      </div>
                    </div>
                  ))}
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

          {/* Social Links */}
          {employee.socialLinks &&
            Object.values(employee.socialLinks).some((link) => link) && (
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
                      <InfoItem
                        label="LinkedIn"
                        value={
                          <a href={employee.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: "#da2c46" }}>
                            {employee.socialLinks.linkedin}
                          </a>
                        }
                      />
                    )}
                    {employee.socialLinks?.github && (
                      <InfoItem
                        label="GitHub"
                        value={
                          <a href={employee.socialLinks.github} target="_blank" rel="noopener noreferrer" style={{ color: "#da2c46" }}>
                            {employee.socialLinks.github}
                          </a>
                        }
                      />
                    )}
                    {employee.socialLinks?.twitter && (
                      <InfoItem
                        label="Twitter"
                        value={
                          <a href={employee.socialLinks.twitter} target="_blank" rel="noopener noreferrer" style={{ color: "#da2c46" }}>
                            {employee.socialLinks.twitter}
                          </a>
                        }
                      />
                    )}
                    {employee.socialLinks?.facebook && (
                      <InfoItem
                        label="Facebook"
                        value={
                          <a href={employee.socialLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ color: "#da2c46" }}>
                            {employee.socialLinks.facebook}
                          </a>
                        }
                      />
                    )}
                  </div>
                </InfoSection>
                <Divider />
              </>
            )}

          {/* Job Preferences */}
          {employee.jobPreferences &&
            Object.values(employee.jobPreferences).some(
              (pref) =>
                (Array.isArray(pref) && pref.length > 0) ||
                (typeof pref === "string" && pref)
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
              <InfoItem label="Employee ID" value={employee._id} span={2} />
            </div>
          </InfoSection>
        </div>
      )}
    </Drawer>
  );
};

export default EmployeeDetailsDrawer;