import React, { useState } from "react";
import {
  Drawer,
  Tabs,
  Typography,
  Spin,
  Alert,
  Grid,
  Avatar,
  Button,
  Card,
  List,
  Row,
  Col,
  Tag,
  Progress,
  Skeleton,
  Empty,
  Divider,
  Result,
  Space 
} from "antd";
import {
  InfoCircleOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  BankOutlined,
  TrophyOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SafetyOutlined,
  IdcardOutlined,
  EnvironmentOutlined,
  BookOutlined,
  HeartOutlined,
  TeamOutlined,
  LinkOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  HomeOutlined,
  FlagOutlined,
  ContactsOutlined,
  ManOutlined,
  WomanOutlined,
  EyeOutlined,
  StarOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useGetCandidateByIdQuery } from "../../Slices/Admin/AdminApis.js";
import dayjs from "dayjs";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Text, Title, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const CandidateViewDrawer = ({ visible, onClose, candidateId }) => {
  const screens = useBreakpoint();
  const [activeTab, setActiveTab] = useState("profile");

  const { data, isLoading, isError, error } = useGetCandidateByIdQuery(
    candidateId,
    {
      skip: !candidateId || !visible,
    }
  );

  const candidate = data?.candidate;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return dayjs(dateString).format("MMM DD, YYYY");
  };

  const calculateProfileCompletion = () => {
    if (!candidate) return 0;

    const requiredFields = [
      candidate.fullName,
      candidate.email,
      candidate.phone,
      candidate.title,
      candidate.totalExperienceYears,
      candidate.nationality,
      candidate.countryOfBirth,
      candidate.maritalStatus,
      candidate.gender,
      candidate.age,
      candidate.industry?.length > 0,
      candidate.visaStatus?.length > 0,
      candidate.country,
      candidate.state,
      candidate.city,
      candidate.emergencyContactNo,
      candidate.contactPersonName,
      candidate.skills?.length > 0,
      candidate.education?.length > 0,
      candidate.workExperience?.length > 0,
    ];

    const completedFields = requiredFields.filter((field) => {
      if (typeof field === "boolean") return field;
      if (Array.isArray(field)) return field.length > 0;
      return field !== null && field !== undefined && field !== "";
    }).length;

    return Math.round((completedFields / requiredFields.length) * 100);
  };

  const profileCompletion = candidate ? calculateProfileCompletion() : 0;

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return "#52c41a";
    if (percentage >= 50) return "#faad14";
    return "#ff4d4f";
  };

  const getCompletionStatus = (percentage) => {
    if (percentage >= 80) return "Excellent";
    if (percentage >= 50) return "Good";
    return "Incomplete";
  };

  const formatUrl = (url) => {
    if (!url) return "";
    return url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
  };

  const renderProfileSummary = () => (
    <div>
      {/* Profile Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Avatar
          size={80}
          src={candidate?.image}
          icon={
            candidate?.gender === "Male" ? <ManOutlined /> : <WomanOutlined />
          }
          style={{ border: "4px solid #da2c46" }}
        />
        <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
          {candidate?.fullName}
        </Title>

        <Text type="secondary" style={{ fontSize: 16 }}>
          {candidate?.title || "No title specified"}
        </Text>

        <Title
          type="secondary"
          style={{ marginTop: 16, marginBottom: 4, fontSize: 16 }}
        >
          Unique Code : {candidate?.uniqueCode || "N/A"}
        </Title>

        {/* Status Tags */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Tag
            color={candidate.accountStatus === "active" ? "green" : "red"}
            icon={
              candidate.accountStatus === "active" ? (
                <CheckCircleOutlined />
              ) : (
                <StopOutlined />
              )
            }
          >
            {candidate.accountStatus?.toUpperCase()}
          </Tag>
          <Tag color="blue" icon={<SafetyOutlined />}>
            {candidate.role?.toUpperCase()}
          </Tag>
          {candidate.candidateType && (
            <Tag color="purple">{candidate.candidateType}</Tag>
          )}
        </div>

        {/* Profile Completion */}
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text strong style={{ marginRight: 8 }}>
              Profile Completion:
            </Text>
            <Text
              strong
              style={{ color: getCompletionColor(profileCompletion) }}
            >
              {getCompletionStatus(profileCompletion)} ({profileCompletion}%)
            </Text>
          </div>
          <Progress
            percent={profileCompletion}
            strokeColor={getCompletionColor(profileCompletion)}
            style={{ width: "80%", margin: "0 auto" }}
          />
        </div>

        {/* Last Updated */}
        <div style={{ marginTop: 16 }}>
          <Text strong style={{ marginRight: 8 }}>
            Profile Last Updated:
          </Text>
          <Text strong>
            {candidate.updatedAt
              ? dayjs(candidate.updatedAt).format("MMM DD, YYYY")
              : "Not available"}
          </Text>
        </div>
      </div>

      {/* Resume Button */}
      {candidate.resumeUrl && (
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Button
            type="primary"
            icon={<FilePdfOutlined />}
            href={candidate.resumeUrl}
            target="_blank"
            style={{ background: "#da2c46", border: "none" }}
          >
            View Resume
          </Button>
        </div>
      )}

      {/* Profile Summary Card */}
      <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
        <Row gutter={16}>
          <Col span={24}>
            <Paragraph>
              {candidate.profileSummary || "No profile summary provided"}
            </Paragraph>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Email:</Text>
            <br />
            <Text>
              <MailOutlined /> {candidate.email}
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Phone:</Text>
            <br />
            <Text>
              <PhoneOutlined /> {candidate.phoneCountryCode && candidate.phone
                ? phoneUtils.formatWithCountryCode(candidate.phoneCountryCode, candidate.phone)
                : candidate.phone || "-"}
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Location:</Text>
            <br />
            <Text>
              <EnvironmentOutlined /> {candidate.location}
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Experience:</Text>
            <br />
            <Text>{candidate.totalExperienceYears}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Notice Period:</Text>
            <br />
            <Text>{candidate.noticePeriod || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Current Salary:</Text>
            <br />
            <Text>{candidate.currentSalary || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Expected Salary:</Text>
            <br />
            <Text>{candidate.expectedSalary || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Agency:</Text>
            <br />
            <Text>{candidate.agency || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Search Hint:</Text>
            <br />
            <Text>{candidate.workorderhint || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Client:</Text>
            <br />
            <Text>{candidate.clientCode || "Not specified"}</Text>
          </Col>
        </Row>

        {candidate.skills && candidate.skills.length > 0 && (
          <>
            <Divider />
            <Text strong>
              <StarOutlined /> Skills:
            </Text>
            <br />
            {candidate.skills.map((skill, index) => (
              <Tag key={index} color="blue" style={{ marginTop: 8 }}>
                {skill}
              </Tag>
            ))}
          </>
        )}

        {candidate.languages && candidate.languages.length > 0 && (
          <>
            <Divider />
            <Text strong>
              <StarOutlined /> Languages:
            </Text>
            <br />
            {candidate.languages.map((language, index) => (
              <Tag key={index} color="green" style={{ marginTop: 8 }}>
                {language}
              </Tag>
            ))}
          </>
        )}
      </Card>
    </div>
  );

  const renderDocuments = () => (
    <div>
      {candidate.certificates && candidate.certificates.length > 0 && (
        <Card title="Certificates/Documents" style={{ borderRadius: "12px" }}>
          <List
            dataSource={candidate.certificates}
            renderItem={(cert) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Text strong>{cert.documentName || cert.fileName}</Text>
                  }
                  description={
                    <div>
                      <Text type="secondary">
                        Uploaded on: {formatDate(cert.uploadedAt)}
                      </Text>
                      <br />
                      <Button
                        type="link"
                        href={cert.fileUrl}
                        target="_blank"
                        icon={<EyeOutlined />}
                      >
                        View Certificate
                      </Button>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );

  const renderPersonalInfo = () => (
    <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Text strong>Full Name:</Text>
          <br />
          <Text>{candidate.fullName}</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Age:</Text>
          <br />
          <Text>{candidate.age || "Not provided"} years</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Age:</Text>
          <br />
          {dayjs(candidate.dob).format("MMM DD, YYYY")}
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Gender:</Text>
          <br />
          <Text>{candidate.gender || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Marital Status:</Text>
          <br />
          <Text>{candidate.maritalStatus || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Blood Group:</Text>
          <br />
          <Tag color="red">{candidate.bloodGroup || "Not provided"}</Tag>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Nationality:</Text>
          <br />
          <Text>{candidate.nationality || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Religion:</Text>
          <br />
          <Text>{candidate.religion || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>Country of Birth:</Text>
          <br />
          <Text>{candidate.countryOfBirth || "Not provided"}</Text>
        </Col>
      </Row>

      {/* Industry */}
      {candidate.industry && candidate.industry.length > 0 && (
        <>
          <Divider />
          <Text strong>Industry:</Text>
          <br />
          {candidate.industry.map((industry, index) => (
            <Tag key={index} color="purple" style={{ marginTop: 8 }}>
              {industry}
            </Tag>
          ))}
        </>
      )}

      {/* Visa Status */}
      {candidate.visaStatus && candidate.visaStatus.length > 0 && (
        <>
          <Divider />
          <Text strong>Visa Status:</Text>
          <br />
          {candidate.visaStatus.map((status, index) => (
            <Tag key={index} color="orange" style={{ marginTop: 8 }}>
              {status}
            </Tag>
          ))}
        </>
      )}

      {/* Passport Information */}
      {(candidate.passportNo || candidate.iqamaNo) && (
        <>
          <Divider />
          <Text strong>
            <FileTextOutlined /> Passport Information:
          </Text>
          <br />
          {candidate.passportNo && (
            <div style={{ marginTop: 8 }}>
              <Text>Passport No: {candidate.passportNo}</Text>
            </div>
          )}
          {candidate.passportPlaceOfIssue && (
            <div style={{ marginTop: 8 }}>
              <Text>Place of Issue: {candidate.passportPlaceOfIssue}</Text>
            </div>
          )}
          {candidate.passportIssueDate && (
            <div style={{ marginTop: 8 }}>
              <Text>Issue Date: {formatDate(candidate.passportIssueDate)}</Text>
            </div>
          )}
          {candidate.passportExpiryDate && (
            <div style={{ marginTop: 8 }}>
              <Text>
                Expiry Date: {formatDate(candidate.passportExpiryDate)}
              </Text>
            </div>
          )}
          {candidate.iqamaNo && (
            <div style={{ marginTop: 8 }}>
              <Text>Iqama No: {candidate.iqamaNo}</Text>
            </div>
          )}
        </>
      )}
    </Card>
  );

  const renderAddressInfo = () => (
    <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Text strong>Country:</Text>
          <br />
          <Text>{candidate.country || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>State/Province:</Text>
          <br />
          <Text>{candidate.state || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={8}>
          <Text strong>City:</Text>
          <br />
          <Text>{candidate.city || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Street Name:</Text>
          <br />
          <Text>{candidate.streetName || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Zip/Postal Code:</Text>
          <br />
          <Text>{candidate.zipCode || "Not provided"}</Text>
        </Col>
        <Col span={24}>
          <Text strong>Full Address:</Text>
          <br />
          <Text>{candidate.region || "Not provided"}</Text>
        </Col>
      </Row>

      {/* Emergency Contacts */}
      <Divider />
      <Title level={5}>Emergency Contacts</Title>
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Text strong>Contact Person:</Text>
          <br />
          <Text>{candidate.contactPersonName || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Contact Mobile:</Text>
          <br />
          <Text>
            {candidate.contactPersonMobileCountryCode && candidate.contactPersonMobile
              ? phoneUtils.formatWithCountryCode(candidate.contactPersonMobileCountryCode, candidate.contactPersonMobile)
              : candidate.contactPersonMobile || "Not provided"}
          </Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Contact Home:</Text>
          <br />
          <Text>
            {candidate.contactPersonHomeNoCountryCode && candidate.contactPersonHomeNo
              ? phoneUtils.formatWithCountryCode(candidate.contactPersonHomeNoCountryCode, candidate.contactPersonHomeNo)
              : candidate.contactPersonHomeNo || "Not provided"}
          </Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Emergency Contact:</Text>
          <br />
          <Text>
            {candidate.emergencyContactNoCountryCode && candidate.emergencyContactNo
              ? phoneUtils.formatWithCountryCode(candidate.emergencyContactNoCountryCode, candidate.emergencyContactNo)
              : candidate.emergencyContactNo || "Not provided"}
          </Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Nominee Name:</Text>
          <br />
          <Text>{candidate.nomineeName || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Nominee Relationship:</Text>
          <br />
          <Text>{candidate.nomineeRelationship || "Not provided"}</Text>
        </Col>
      </Row>

      {/* Social Links */}
      {candidate.socialLinks &&
        Object.values(candidate.socialLinks).some((link) => link) && (
          <>
            <Divider />
            <Title level={5}>Social Links</Title>
            <Row gutter={16}>
              {candidate.socialLinks.linkedin && (
                <Col xs={24} sm={12}>
                  <Text strong>LinkedIn:</Text>
                  <br />
                  <Text>
                    <a
                      href={formatUrl(candidate.socialLinks.linkedin)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {candidate.socialLinks.linkedin}
                    </a>
                  </Text>
                </Col>
              )}
              {candidate.socialLinks.github && (
                <Col xs={24} sm={12}>
                  <Text strong>GitHub:</Text>
                  <br />
                  <Text>
                    <a
                      href={formatUrl(candidate.socialLinks.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {candidate.socialLinks.github}
                    </a>
                  </Text>
                </Col>
              )}
              {candidate.socialLinks.twitter && (
                <Col xs={24} sm={12}>
                  <Text strong>Twitter:</Text>
                  <br />
                  <Text>
                    <a
                      href={formatUrl(candidate.socialLinks.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {candidate.socialLinks.twitter}
                    </a>
                  </Text>
                </Col>
              )}
              {candidate.socialLinks.facebook && (
                <Col xs={24} sm={12}>
                  <Text strong>Facebook:</Text>
                  <br />
                  <Text>
                    <a
                      href={formatUrl(candidate.socialLinks.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {candidate.socialLinks.facebook}
                    </a>
                  </Text>
                </Col>
              )}
            </Row>
          </>
        )}
    </Card>
  );

  const renderProfessionalInfo = () => (
    <div>
      <Card
        title="Professional Summary"
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Text strong>Current Company:</Text>
            <br />
            <Text>{candidate.companyName || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Current Title:</Text>
            <br />
            <Text>{candidate.title || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Total Experience:</Text>
            <br />
            <Text>{candidate.totalExperienceYears} years</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Specialization:</Text>
            <br />
            <Tag color="orange">
              {candidate.specialization || "Not specified"}
            </Tag>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Current Salary:</Text>
            <br />
            <Text>{candidate.currentSalary || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Expected Salary:</Text>
            <br />
            <Text>{candidate.expectedSalary || "Not specified"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Notice Period:</Text>
            <br />
            <Text>{candidate.noticePeriod || "Not specified"}</Text>
          </Col>
        </Row>
      </Card>

      {/* Work Experience */}
      {candidate.workExperience && candidate.workExperience.length > 0 && (
        <Card
          title="Work Experience"
          style={{ marginBottom: 24, borderRadius: "12px" }}
        >
          <List
            dataSource={candidate.workExperience}
            renderItem={(exp) => (
              <List.Item>
                <List.Item.Meta
                  title={<Text strong>{exp.company}</Text>}
                  description={
                    <div>
                      <Text type="secondary">
                        {formatDate(exp.startDate)} - {exp.endDate || "Present"}
                      </Text>
                      {exp.description && (
                        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                          {exp.description}
                        </Paragraph>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );

  const renderEducationInfo = () => (
    <div>
      {candidate.education && candidate.education.length > 0 ? (
        <Card
          title="Education Background"
          style={{ marginBottom: 24, borderRadius: "12px" }}
        >
          <List
            dataSource={candidate.education}
            renderItem={(edu) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Text strong>
                      {edu.degree} in {edu.field}
                    </Text>
                  }
                  description={
                    <div>
                      <Text>{edu.institution}</Text>
                      <br />
                      <Text type="secondary">{edu.year}</Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ) : (
        <Empty description="No education information available" />
      )}

      {candidate.qualifications && candidate.qualifications.length > 0 && (
        <Card title="Qualifications" style={{ borderRadius: "12px" }}>
          {candidate.qualifications.map((qual, index) => (
            <Tag
              key={index}
              color="purple"
              style={{ marginBottom: 8, marginRight: 8 }}
            >
              {qual}
            </Tag>
          ))}
        </Card>
      )}
    </div>
  );

  const renderEmploymentDetails = () => {
    const employment = candidate?.employmentDetails;

    if (!employment || Object.keys(employment).length === 0) {
      return <Empty description="No employment details available" />;
    }

    return (
      <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Text strong>Category:</Text>
            <br />
            <Text>{employment.category || "Not provided"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Assigned Job Title:</Text>
            <br />
            <Text>{employment.assignedJobTitle || "Not provided"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Date of Joining:</Text>
            <br />
            <Text>{formatDate(employment.dateOfJoining)}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Previous ERAM ID:</Text>
            <br />
            <Tag color="purple">
              {employment.previousEramId || "Not provided"}
            </Tag>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Official Email:</Text>
            <br />
            <Text>
              <MailOutlined /> {employment.officialEmail || "Not provided"}
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Badge No:</Text>
            <br />
            <Text>{employment.badgeNo || "Not provided"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Gate Pass ID:</Text>
            <br />
            <Text>{employment.gatePassId || "Not provided"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Aramco ID:</Text>
            <br />
            <Text>{employment.aramcoId || "Not provided"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Other ID:</Text>
            <br />
            <Text>{employment.otherId || "Not provided"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Plant ID:</Text>
            <br />
            <Text>{employment.plantId || "Not provided"}</Text>
          </Col>

          {employment.designation && (
            <Col xs={24} sm={12}>
              <Text strong>Designation:</Text>
              <br />
              <Text>{employment.designation}</Text>
            </Col>
          )}

          {employment.familyStatus && (
            <Col xs={24} sm={12}>
              <Text strong>Family Status:</Text>
              <br />
              <Text>{employment.familyStatus}</Text>
            </Col>
          )}

          {employment.externalEmpNo && (
            <Col xs={24} sm={12}>
              <Text strong>External Employee No:</Text>
              <br />
              <Text>{employment.externalEmpNo}</Text>
            </Col>
          )}

          {employment.employeeGroup && (
            <Col xs={24} sm={12}>
              <Text strong>Employee Group:</Text>
              <br />
              <Text>{employment.employeeGroup}</Text>
            </Col>
          )}

          {employment.employmentType && (
            <Col xs={24} sm={12}>
              <Text strong>Employment Type:</Text>
              <br />
              <Text>{employment.employmentType}</Text>
            </Col>
          )}

          {employment.workLocation && (
            <Col xs={24} sm={12}>
              <Text strong>Work Location:</Text>
              <br />
              <Text>{employment.workLocation}</Text>
            </Col>
          )}
        </Row>

        {/* Iqama Details */}
        {(employment.iqamaId ||
          employment.iqamaIssueDate ||
          employment.iqamaExpiryDate) && (
          <>
            <Divider />
            <Text strong style={{ fontSize: "16px" }}>
              <IdcardOutlined /> Iqama Details:
            </Text>
            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              {employment.iqamaId && (
                <Col xs={24} sm={12}>
                  <Text strong>Iqama ID:</Text>
                  <br />
                  <Text>{employment.iqamaId}</Text>
                </Col>
              )}
              {employment.iqamaIssueDate && (
                <Col xs={24} sm={12}>
                  <Text strong>Iqama Issue Date:</Text>
                  <br />
                  <Text>{formatDate(employment.iqamaIssueDate)}</Text>
                </Col>
              )}
              {employment.iqamaExpiryDate && (
                <Col xs={24} sm={12}>
                  <Text strong>Iqama Expiry Date:</Text>
                  <br />
                  <Text>{formatDate(employment.iqamaExpiryDate)}</Text>
                </Col>
              )}
              {employment.iqamaArabicDateOfIssue && (
                <Col xs={24} sm={12}>
                  <Text strong>Iqama Arabic Issue Date:</Text>
                  <br />
                  <Text>{formatDate(employment.iqamaArabicDateOfIssue)}</Text>
                </Col>
              )}
              {employment.iqamaArabicDateOfExpiry && (
                <Col xs={24} sm={12}>
                  <Text strong>Iqama Arabic Expiry Date:</Text>
                  <br />
                  <Text>{formatDate(employment.iqamaArabicDateOfExpiry)}</Text>
                </Col>
              )}
            </Row>
          </>
        )}

        {/* Work Details */}
        {(employment.workDays ||
          employment.workHours ||
          employment.airTicketFrequency) && (
          <>
            <Divider />
            <Text strong style={{ fontSize: "16px" }}>
              <ClockCircleOutlined /> Work Details:
            </Text>
            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              {employment.workDays && (
                <Col xs={24} sm={8}>
                  <Text strong>Work Days:</Text>
                  <br />
                  <Tag color="blue">{employment.workDays}</Tag>
                </Col>
              )}
              {employment.workHours && (
                <Col xs={24} sm={8}>
                  <Text strong>Work Hours:</Text>
                  <br />
                  <Tag color="blue">{employment.workHours}</Tag>
                </Col>
              )}
              {employment.airTicketFrequency && (
                <Col xs={24} sm={8}>
                  <Text strong>Air Ticket Frequency:</Text>
                  <br />
                  <Text>{employment.airTicketFrequency}</Text>
                </Col>
              )}
              {employment.lastArrival && (
                <Col xs={24} sm={12}>
                  <Text strong>Last Arrival:</Text>
                  <br />
                  <Text>{formatDate(employment.lastArrival)}</Text>
                </Col>
              )}
              {employment.lastWorkingDay && (
                <Col xs={24} sm={12}>
                  <Text strong>Last Working Day:</Text>
                  <br />
                  <Text>{formatDate(employment.lastWorkingDay)}</Text>
                </Col>
              )}
              {employment.eligibleVacationDays && (
                <Col xs={24} sm={12}>
                  <Text strong>Eligible Vacation Days:</Text>
                  <br />
                  <Tag color="green">
                    {employment.eligibleVacationDays} days
                  </Tag>
                </Col>
              )}
              {employment.eligibleVacationMonth && (
                <Col xs={24} sm={12}>
                  <Text strong>Eligible Vacation Month:</Text>
                  <br />
                  <Text>{employment.eligibleVacationMonth}</Text>
                </Col>
              )}
            </Row>
          </>
        )}

        {/* Contract & Insurance Details */}
        {(employment.visaCategory ||
          employment.periodOfContract ||
          employment.probationPeriod) && (
          <>
            <Divider />
            <Text strong style={{ fontSize: "16px" }}>
              <SafetyOutlined /> Contract & Insurance:
            </Text>
            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              {employment.visaCategory && (
                <Col xs={24} sm={12}>
                  <Text strong>Visa Category:</Text>
                  <br />
                  <Text>{employment.visaCategory}</Text>
                </Col>
              )}
              {employment.periodOfContract && (
                <Col xs={24} sm={12}>
                  <Text strong>Period of Contract:</Text>
                  <br />
                  <Text>{employment.periodOfContract}</Text>
                </Col>
              )}
              {employment.probationPeriod && (
                <Col xs={24} sm={12}>
                  <Text strong>Probation Period:</Text>
                  <br />
                  <Text>{employment.probationPeriod}</Text>
                </Col>
              )}
              {employment.insuranceCategory && (
                <Col xs={24} sm={12}>
                  <Text strong>Insurance Category:</Text>
                  <br />
                  <Text>{employment.insuranceCategory}</Text>
                </Col>
              )}
              {employment.gosi && (
                <Col xs={24} sm={12}>
                  <Text strong>GOSI:</Text>
                  <br />
                  <Text>{employment.gosi}</Text>
                </Col>
              )}
              {employment.payrollGroup && (
                <Col xs={24} sm={12}>
                  <Text strong>Payroll Group:</Text>
                  <br />
                  <Text>{employment.payrollGroup}</Text>
                </Col>
              )}
              {employment.sponsorName && (
                <Col xs={24} sm={12}>
                  <Text strong>Sponsor Name:</Text>
                  <br />
                  <Text>{employment.sponsorName}</Text>
                </Col>
              )}
              {employment.noOfDependent !== undefined && (
                <Col xs={24} sm={12}>
                  <Text strong>Number of Dependents:</Text>
                  <br />
                  <Tag color="orange">{employment.noOfDependent}</Tag>
                </Col>
              )}
              {employment.drivingLicense && (
                <Col xs={24} sm={12}>
                  <Text strong>Driving License:</Text>
                  <br />
                  <Text>{employment.drivingLicense}</Text>
                </Col>
              )}
              {employment.classCode && (
                <Col xs={24} sm={12}>
                  <Text strong>Class Code:</Text>
                  <br />
                  <Text>{employment.classCode}</Text>
                </Col>
              )}
              {employment.medicalPolicy && (
                <Col xs={24} sm={12}>
                  <Text strong>Medical Policy:</Text>
                  <br />
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Active
                  </Tag>
                  {employment.medicalPolicyNumber && (
                    <Text style={{ marginLeft: 8 }}>
                      ({employment.medicalPolicyNumber})
                    </Text>
                  )}
                </Col>
              )}
            </Row>
          </>
        )}

        {/* Additional Information */}
        {(employment.basicAssets || employment.reportingAndDocumentation) && (
          <>
            <Divider />
            <Text strong style={{ fontSize: "16px" }}>
              Additional Information:
            </Text>
            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              {employment.basicAssets && (
                <Col span={24}>
                  <Text strong>Basic Assets:</Text>
                  <br />
                  <Text>{employment.basicAssets}</Text>
                </Col>
              )}
              {employment.reportingAndDocumentation && (
                <Col span={24}>
                  <Text strong>Reporting & Documentation:</Text>
                  <br />
                  <Text>{employment.reportingAndDocumentation}</Text>
                </Col>
              )}
            </Row>
          </>
        )}

        {/* Asset Allocation */}
        {employment.assetAllocation &&
          employment.assetAllocation.length > 0 && (
            <>
              <Divider />
              <Text strong style={{ fontSize: "16px" }}>
                <BankOutlined /> Asset Allocation:
              </Text>
              <div style={{ marginTop: 12 }}>
                {employment.assetAllocation.map((asset, index) => (
                  <Tag key={index} color="cyan" style={{ marginBottom: 8 }}>
                    {asset}
                  </Tag>
                ))}
              </div>
            </>
          )}
      </Card>
    );
  };

  const renderAttritionHistory = () => {
    const attritionRecords = data?.attritionRecords;

    if (!attritionRecords || attritionRecords.length === 0) {
      return <Empty description="No previous employment records" />;
    }

    return (
      <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
        <List
          dataSource={attritionRecords}
          renderItem={(record) => (
            <List.Item
              style={{
                borderLeft: `4px solid ${
                  record.status === "exit_approved"
                    ? "#52c41a"
                    : record.status === "rejected"
                    ? "#ff4d4f"
                    : record.status === "converted_to_candidate"
                    ? "#1890ff"
                    : record.status === "cancelled"
                    ? "#faad14"
                    : "#d9d9d9"
                }`,
                paddingLeft: 16,
                marginBottom: 16,
              }}
            >
              <List.Item.Meta
                avatar={
                  record.status === "exit_approved" ? (
                    <CheckCircleOutlined
                      style={{ fontSize: 28, color: "#52c41a" }}
                    />
                  ) : record.status === "rejected" ? (
                    <CloseCircleOutlined
                      style={{ fontSize: 28, color: "#ff4d4f" }}
                    />
                  ) : record.status === "converted_to_candidate" ? (
                    <CheckCircleOutlined
                      style={{ fontSize: 28, color: "#1890ff" }}
                    />
                  ) : (
                    <StopOutlined style={{ fontSize: 28, color: "#faad14" }} />
                  )
                }
                title={
                  <Space direction="vertical" size={0}>
                    <Space>
                      <Text strong style={{ fontSize: 18 }}>
                        {record.attritionType}
                      </Text>
                      <Tag
                        color={
                          record.status === "exit_approved"
                            ? "green"
                            : record.status === "rejected"
                            ? "red"
                            : record.status === "converted_to_candidate"
                            ? "blue"
                            : record.status === "cancelled"
                            ? "orange"
                            : "default"
                        }
                        style={{ fontSize: 12 }}
                      >
                        {record.status.replace(/_/g, " ").toUpperCase()}
                      </Tag>
                    </Space>
                  </Space>
                }
                description={
                  <div style={{ marginTop: 12 }}>
                    <Row gutter={[16, 12]}>
                      {record.previousEramId && (
                        <Col xs={24} sm={12}>
                          <Text strong>Previous ERAM ID: </Text>
                          <Tag color="purple">{record.previousEramId}</Tag>
                        </Col>
                      )}

                      {record.lastWorkingDate && (
                        <Col xs={24} sm={12}>
                          <Text strong>Last Working Date: </Text>
                          <Text type="secondary">
                            {formatDate(record.lastWorkingDate)}
                          </Text>
                        </Col>
                      )}

                      <Col span={24}>
                        <Text strong>Reason: </Text>
                        <Paragraph
                          style={{
                            marginTop: 4,
                            marginBottom: 8,
                            padding: 12,
                            background: "#f5f5f5",
                            borderRadius: 8,
                          }}
                        >
                          {record.reason}
                        </Paragraph>
                      </Col>

                      {record.projectName && (
                        <Col xs={24} sm={12}>
                          <Text strong>Project: </Text>
                          <Text>{record.projectName}</Text>
                        </Col>
                      )}

                      {record.noticePeriodServed && (
                        <Col xs={24} sm={12}>
                          <Text strong>Notice Period Served: </Text>
                          <Tag
                            color={
                              record.noticePeriodServed === "Yes"
                                ? "green"
                                : record.noticePeriodServed === "No"
                                ? "red"
                                : "default"
                            }
                          >
                            {record.noticePeriodServed}
                          </Tag>
                        </Col>
                      )}

                      {record.hrRemarks && (
                        <Col span={24}>
                          <Text strong>HR Remarks: </Text>
                          <Paragraph
                            type="secondary"
                            style={{
                              marginTop: 4,
                              padding: 12,
                              background: "#fafafa",
                              borderRadius: 8,
                            }}
                          >
                            {record.hrRemarks}
                          </Paragraph>
                        </Col>
                      )}

                      <Col xs={24} sm={12}>
                        <Text strong>Initiated By: </Text>
                        <Text type="secondary">
                          <MailOutlined /> {record.initiatedBy?.email || "N/A"}
                        </Text>
                      </Col>

                      {record.convertedBy && (
                        <Col xs={24} sm={12}>
                          <Text strong>Converted By: </Text>
                          <Text type="secondary">
                            <MailOutlined />{" "}
                            {record.convertedBy?.email || "N/A"}
                          </Text>
                        </Col>
                      )}

                      {record.cancelledBy && (
                        <>
                          <Col xs={24} sm={12}>
                            <Text strong>Cancelled By: </Text>
                            <Text type="secondary">
                              <MailOutlined />{" "}
                              {record.cancelledBy?.email || "N/A"}
                            </Text>
                          </Col>
                          {record.cancellationReason && (
                            <Col span={24}>
                              <Text strong>Cancellation Reason: </Text>
                              <Paragraph
                                type="secondary"
                                style={{ marginTop: 4 }}
                              >
                                {record.cancellationReason}
                              </Paragraph>
                            </Col>
                          )}
                        </>
                      )}
                    </Row>

                    {/* Approvers Section */}
                    {record.approvers && record.approvers.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Divider style={{ margin: "12px 0" }} />
                        <Text strong style={{ fontSize: 15 }}>
                          <TeamOutlined /> Approval History:
                        </Text>
                        <List
                          size="small"
                          style={{ marginTop: 12 }}
                          dataSource={record.approvers}
                          renderItem={(approver) => (
                            <List.Item
                              style={{
                                padding: "12px",
                                background: "#fafafa",
                                borderRadius: 8,
                                marginBottom: 8,
                              }}
                            >
                              <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                              >
                                <Space>
                                  {approver.status === "approved" ? (
                                    <CheckCircleOutlined
                                      style={{ color: "#52c41a", fontSize: 16 }}
                                    />
                                  ) : approver.status === "rejected" ? (
                                    <CloseCircleOutlined
                                      style={{ color: "#ff4d4f", fontSize: 16 }}
                                    />
                                  ) : (
                                    <ClockCircleOutlined
                                      style={{ color: "#faad14", fontSize: 16 }}
                                    />
                                  )}
                                  <Text strong>
                                    {approver.approver?.email || "N/A"}
                                  </Text>
                                  <Tag
                                    color={
                                      approver.status === "approved"
                                        ? "green"
                                        : approver.status === "rejected"
                                        ? "red"
                                        : "orange"
                                    }
                                  >
                                    {approver.status.toUpperCase()}
                                  </Tag>
                                </Space>
                                {approver.approvedAt && (
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12, marginLeft: 24 }}
                                  >
                                    <CalendarOutlined />{" "}
                                    {formatDate(approver.approvedAt)} at{" "}
                                    {dayjs(approver.approvedAt).format("HH:mm")}
                                  </Text>
                                )}
                                {approver.remarks && (
                                  <div style={{ marginLeft: 24, marginTop: 4 }}>
                                    <Text
                                      type="secondary"
                                      style={{
                                        fontSize: 13,
                                        fontStyle: "italic",
                                      }}
                                    >
                                      "{approver.remarks}"
                                    </Text>
                                  </div>
                                )}
                              </Space>
                            </List.Item>
                          )}
                        />
                      </div>
                    )}

                    <Divider style={{ margin: "16px 0" }} />
                    <Row gutter={[16, 8]}>
                      <Col xs={24} sm={12}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <strong>Initiated:</strong>{" "}
                          {formatDate(record.createdAt)} at{" "}
                          {dayjs(record.createdAt).format("HH:mm")}
                        </Text>
                      </Col>
                      {record.convertedAt && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <strong>Converted:</strong>{" "}
                            {formatDate(record.convertedAt)} at{" "}
                            {dayjs(record.convertedAt).format("HH:mm")}
                          </Text>
                        </Col>
                      )}
                      {record.cancelledAt && (
                        <Col xs={24} sm={12}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <strong>Cancelled:</strong>{" "}
                            {formatDate(record.cancelledAt)} at{" "}
                            {dayjs(record.cancelledAt).format("HH:mm")}
                          </Text>
                        </Col>
                      )}
                    </Row>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton active avatar paragraph={{ rows: 6 }} />;
    }

    if (isError) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Result
            status="500"
            title="500"
            subTitle="Sorry, something went wrong."
          />
        </div>
      );
    }

    if (!candidate) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Result
            status="404"
            title="404"
            subTitle="Sorry, the page you visited does not exist."
          />
        </div>
      );
    }

    const tabItems = [
      {
        key: "profile",
        label: (
          <span>
            <UserOutlined />
            Profile Summary
          </span>
        ),
        children: renderProfileSummary(),
      },
      {
        key: "document",
        label: (
          <span>
            <FilePdfOutlined />
            Documents
          </span>
        ),
        children: renderDocuments(),
      },
      {
        key: "personal",
        label: (
          <span>
            <IdcardOutlined />
            Personal Information
          </span>
        ),
        children: renderPersonalInfo(),
      },
      {
        key: "address",
        label: (
          <span>
            <HomeOutlined />
            Address & Contact
          </span>
        ),
        children: renderAddressInfo(),
      },
      {
        key: "professional",
        label: (
          <span>
            <TrophyOutlined />
            Professional
          </span>
        ),
        children: renderProfessionalInfo(),
      },
      {
        key: "employment",
        label: (
          <span>
            <IdcardOutlined />
            Employment Details
          </span>
        ),
        children: renderEmploymentDetails(),
      },
      {
        key: "attrition",
        label: (
          <span>
            <FileTextOutlined />
            Previous Employment History
          </span>
        ),
        children: renderAttritionHistory(),
      },
      {
        key: "education",
        label: (
          <span>
            <BookOutlined />
            Education
          </span>
        ),
        children: renderEducationInfo(),
      },
    ];

    return (
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
        style={{ height: "100%" }}
      />
    );
  };

  return (
    <Drawer
      title="Candidate Profile Details"
      open={visible}
      onClose={onClose}
      width={screens.lg ? "60%" : "90%"}
      style={{ maxWidth: 1200 }}
      placement="right"
      destroyOnClose
      extra={
        <Button
          type="primary"
          onClick={onClose}
          style={{ background: "#da2c46" }}
        >
          Close
        </Button>
      }
    >
      <div style={{ height: "100%", overflow: "auto" }}>{renderContent()}</div>
    </Drawer>
  );
};

export default CandidateViewDrawer;
