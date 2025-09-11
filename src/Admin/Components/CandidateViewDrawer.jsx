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
          src={candidate.image}
          icon={
            candidate.gender === "Male" ? <ManOutlined /> : <WomanOutlined />
          }
          style={{ border: "4px solid #da2c46" }}
        />
        <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
          {candidate.fullName}
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          {candidate.title || "No title specified"}
        </Text>

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
              <PhoneOutlined /> {candidate.phone}
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
          <Text>{candidate.contactPersonMobile || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Contact Home:</Text>
          <br />
          <Text>{candidate.contactPersonHomeNo || "Not provided"}</Text>
        </Col>
        <Col xs={24} sm={12}>
          <Text strong>Emergency Contact:</Text>
          <br />
          <Text>{candidate.emergencyContactNo || "Not provided"}</Text>
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

      {/* Certificates */}
      {candidate.certificates && candidate.certificates.length > 0 && (
        <Card title="Certificates" style={{ borderRadius: "12px" }}>
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

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton active avatar paragraph={{ rows: 6 }} />;
    }

    if (isError) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="danger">Failed to load candidate details</Text>
        </div>
      );
    }

    if (!candidate) {
      return (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text type="secondary">Candidate details not found</Text>
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
