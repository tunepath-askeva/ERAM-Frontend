import React, { useState } from "react";
import {
  Drawer,
  Tabs,
  Descriptions,
  Tag,
  Typography,
  Spin,
  Alert,
  Grid,
  Avatar,
  Space,
  Button,
  Divider,
  Card,
  List,
  Image,
  Badge,
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
  CodeOutlined,
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
  DownloadOutlined,
  ManOutlined,
  WomanOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useGetCandidateByIdQuery } from "../../Slices/Admin/AdminApis.js";

const { Paragraph, Text, Title } = Typography;
const { useBreakpoint } = Grid;

const CandidateViewDrawer = ({ visible, onClose, candidateId }) => {
  const screens = useBreakpoint();
  const [activeTab, setActiveTab] = useState("basic");

  const { data, isLoading, isError, error } = useGetCandidateByIdQuery(
    candidateId,
    {
      skip: !candidateId || !visible,
    }
  );

  const candidate = data?.candidate;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderBasicInfo = () => (
    <div>
      {/* Header with Avatar and Basic Info */}
      <Card style={{ marginBottom: 24, border: "1px solid #f0f0f0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <Avatar
            size={80}
            src={candidate.image}
            icon={
              candidate.gender === "Male" ? <ManOutlined /> : <WomanOutlined />
            }
            style={{ backgroundColor: "#da2c46" }}
          />
          <div>
            <Title level={3} style={{ margin: 0, color: "#2c3e50" }}>
              {candidate.fullName}
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              {candidate.title || "No title specified"}
            </Text>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 8,
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
          </div>
        </div>

        {candidate.profileSummary && (
          <div>
            <Divider style={{ margin: "16px 0" }} />
            <Text strong>Profile Summary:</Text>
            <Paragraph style={{ marginTop: 8, whiteSpace: "pre-line" }}>
              {candidate.profileSummary}
            </Paragraph>
          </div>
        )}
      </Card>

      <Descriptions
        title="Personal Information"
        bordered
        column={screens.md ? 2 : 1}
        size="middle"
      >
        <Descriptions.Item
          label={
            <span>
              <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Full Name
            </span>
          }
        >
          <Text strong>{candidate.fullName}</Text>
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span>
              <MailOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Email
            </span>
          }
        >
          <Text copyable>{candidate.email}</Text>
        </Descriptions.Item>

        <Descriptions.Item
          label={
            <span>
              <PhoneOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Phone
            </span>
          }
        >
          <Text copyable>{candidate.phone}</Text>
        </Descriptions.Item>

        {candidate.age && (
          <Descriptions.Item
            label={
              <span>
                <CalendarOutlined
                  style={{ marginRight: 8, color: "#da2c46" }}
                />
                Age
              </span>
            }
          >
            <Text>{candidate.age} years</Text>
          </Descriptions.Item>
        )}

        {candidate.gender && (
          <Descriptions.Item
            label={
              <span>
                <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Gender
              </span>
            }
          >
            <Text>{candidate.gender}</Text>
          </Descriptions.Item>
        )}

        {candidate.maritalStatus && (
          <Descriptions.Item
            label={
              <span>
                <HeartOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Marital Status
              </span>
            }
          >
            <Text>{candidate.maritalStatus}</Text>
          </Descriptions.Item>
        )}

        {candidate.bloodGroup && (
          <Descriptions.Item
            label={
              <span>
                <HeartOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Blood Group
              </span>
            }
          >
            <Tag color="red">{candidate.bloodGroup}</Tag>
          </Descriptions.Item>
        )}

        {candidate.nationality && (
          <Descriptions.Item
            label={
              <span>
                <FlagOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Nationality
              </span>
            }
          >
            <Text>{candidate.nationality}</Text>
          </Descriptions.Item>
        )}

        {candidate.religion && (
          <Descriptions.Item
            label={
              <span>
                <BookOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Religion
              </span>
            }
          >
            <Text>{candidate.religion}</Text>
          </Descriptions.Item>
        )}

        {candidate.languages && candidate.languages.length > 0 && (
          <Descriptions.Item
            label={
              <span>
                <GlobalOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                Languages
              </span>
            }
            span={2}
          >
            <div>
              {candidate.languages[0].split(",").map((lang, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                  {lang.trim()}
                </Tag>
              ))}
            </div>
          </Descriptions.Item>
        )}
      </Descriptions>
    </div>
  );

  const renderContactInfo = () => (
    <div>
      <Card title="Address Information" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={screens.md ? 2 : 1}>
          {candidate.streetName && (
            <Descriptions.Item
              label={
                <span>
                  <HomeOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Street
                </span>
              }
            >
              {candidate.streetName}
            </Descriptions.Item>
          )}

          {candidate.city && (
            <Descriptions.Item
              label={
                <span>
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  City
                </span>
              }
            >
              {candidate.city}
            </Descriptions.Item>
          )}

          {candidate.state && (
            <Descriptions.Item
              label={
                <span>
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  State
                </span>
              }
            >
              {candidate.state}
            </Descriptions.Item>
          )}

          {candidate.country && (
            <Descriptions.Item
              label={
                <span>
                  <FlagOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Country
                </span>
              }
            >
              {candidate.country}
            </Descriptions.Item>
          )}

          {candidate.zipCode && (
            <Descriptions.Item
              label={
                <span>
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Zip Code
                </span>
              }
            >
              {candidate.zipCode}
            </Descriptions.Item>
          )}

          {candidate.region && (
            <Descriptions.Item
              label={
                <span>
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Region
                </span>
              }
              span={2}
            >
              {candidate.region}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Emergency Contacts" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={screens.md ? 2 : 1}>
          {candidate.contactPersonName && (
            <Descriptions.Item
              label={
                <span>
                  <ContactsOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Contact Person
                </span>
              }
            >
              {candidate.contactPersonName}
            </Descriptions.Item>
          )}

          {candidate.contactPersonMobile && (
            <Descriptions.Item
              label={
                <span>
                  <PhoneOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Mobile
                </span>
              }
            >
              <Text copyable>{candidate.contactPersonMobile}</Text>
            </Descriptions.Item>
          )}

          {candidate.contactPersonHomeNo && (
            <Descriptions.Item
              label={
                <span>
                  <PhoneOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Home
                </span>
              }
            >
              <Text copyable>{candidate.contactPersonHomeNo}</Text>
            </Descriptions.Item>
          )}

          {candidate.emergencyContactNo && (
            <Descriptions.Item
              label={
                <span>
                  <PhoneOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Emergency Contact
                </span>
              }
            >
              <Text copyable>{candidate.emergencyContactNo}</Text>
            </Descriptions.Item>
          )}

          {candidate.nomineeName && (
            <Descriptions.Item
              label={
                <span>
                  <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Nominee Name
                </span>
              }
            >
              {candidate.nomineeName}
            </Descriptions.Item>
          )}

          {candidate.nomineeRelationship && (
            <Descriptions.Item
              label={
                <span>
                  <TeamOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Relationship
                </span>
              }
            >
              {candidate.nomineeRelationship}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Social Links */}
      {candidate.socialLinks &&
        Object.values(candidate.socialLinks).some((link) => link) && (
          <Card title="Social Links">
            <Space wrap>
              {candidate.socialLinks.linkedin && (
                <Button
                  icon={<LinkOutlined />}
                  type="link"
                  href={
                    candidate.socialLinks.linkedin.startsWith("http")
                      ? candidate.socialLinks.linkedin
                      : `https://${candidate.socialLinks.linkedin}`
                  }
                  target="_blank"
                >
                  LinkedIn
                </Button>
              )}
              {candidate.socialLinks.github && (
                <Button
                  icon={<LinkOutlined />}
                  type="link"
                  href={
                    candidate.socialLinks.github.startsWith("http")
                      ? candidate.socialLinks.github
                      : `https://${candidate.socialLinks.github}`
                  }
                  target="_blank"
                >
                  GitHub
                </Button>
              )}
              {candidate.socialLinks.twitter && (
                <Button
                  icon={<LinkOutlined />}
                  type="link"
                  href={
                    candidate.socialLinks.twitter.startsWith("http")
                      ? candidate.socialLinks.twitter
                      : `https://${candidate.socialLinks.twitter}`
                  }
                  target="_blank"
                >
                  Twitter
                </Button>
              )}
              {candidate.socialLinks.facebook && (
                <Button
                  icon={<LinkOutlined />}
                  type="link"
                  href={
                    candidate.socialLinks.facebook.startsWith("http")
                      ? candidate.socialLinks.facebook
                      : `https://${candidate.socialLinks.facebook}`
                  }
                  target="_blank"
                >
                  Facebook
                </Button>
              )}
            </Space>
          </Card>
        )}
    </div>
  );

  const renderProfessionalInfo = () => (
    <div>
      <Card title="Professional Summary" style={{ marginBottom: 24 }}>
        <Descriptions bordered column={screens.md ? 2 : 1}>
          {candidate.companyName && (
            <Descriptions.Item
              label={
                <span>
                  <BankOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Current Company
                </span>
              }
            >
              {candidate.companyName}
            </Descriptions.Item>
          )}

          {candidate.title && (
            <Descriptions.Item
              label={
                <span>
                  <TrophyOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Current Title
                </span>
              }
            >
              {candidate.title}
            </Descriptions.Item>
          )}

          {candidate.totalExperienceYears && (
            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Total Experience
                </span>
              }
            >
              {candidate.totalExperienceYears} years
            </Descriptions.Item>
          )}

          {candidate.specialization && (
            <Descriptions.Item
              label={
                <span>
                  <TrophyOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Specialization
                </span>
              }
            >
              <Tag color="orange">{candidate.specialization}</Tag>
            </Descriptions.Item>
          )}

          {candidate.currentSalary && (
            <Descriptions.Item
              label={
                <span>
                  <DollarOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Current Salary
                </span>
              }
            >
              {candidate.currentSalary}
            </Descriptions.Item>
          )}

          {candidate.expectedSalary && (
            <Descriptions.Item
              label={
                <span>
                  <DollarOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Expected Salary
                </span>
              }
            >
              {candidate.expectedSalary}
            </Descriptions.Item>
          )}

          {candidate.noticePeriod && (
            <Descriptions.Item
              label={
                <span>
                  <ClockCircleOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Notice Period
                </span>
              }
            >
              {candidate.noticePeriod}
            </Descriptions.Item>
          )}

          {candidate.industry && candidate.industry.length > 0 && (
            <Descriptions.Item
              label={
                <span>
                  <BankOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Industry
                </span>
              }
            >
              {candidate.industry.map((ind, index) => (
                <Tag key={index} color="green">
                  {ind}
                </Tag>
              ))}
            </Descriptions.Item>
          )}

          {candidate.visaStatus && candidate.visaStatus.length > 0 && (
            <Descriptions.Item
              label={
                <span>
                  <IdcardOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Visa Status
                </span>
              }
            >
              {candidate.visaStatus.map((visa, index) => (
                <Tag key={index} color="blue">
                  {visa}
                </Tag>
              ))}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Skills */}
      <Card title="Technical Skills" style={{ marginBottom: 24 }}>
        {candidate.skills && candidate.skills.length > 0 ? (
          <div>
            {candidate.skills.map((skill, index) => (
              <Tag
                key={index}
                color="blue"
                style={{ marginBottom: 8, marginRight: 8 }}
              >
                {skill}
              </Tag>
            ))}
          </div>
        ) : (
          <Text type="secondary" style={{ fontStyle: "italic" }}>
            No technical skills specified
          </Text>
        )}
      </Card>

      {/* Work Experience */}
      {candidate.workExperience && candidate.workExperience.length > 0 && (
        <Card title="Work Experience">
          <List
            dataSource={candidate.workExperience}
            renderItem={(exp, index) => (
              <List.Item key={index}>
                <Card
                  size="small"
                  style={{ width: "100%", border: "1px solid #f0f0f0" }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 16 }}>
                      {exp.company}
                    </Text>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <Text type="secondary">
                      {formatDate(exp.startDate)} - {exp.endDate || "Present"}
                    </Text>
                  </div>
                  {exp.description && (
                    <Paragraph style={{ margin: 0 }}>
                      {exp.description}
                    </Paragraph>
                  )}
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Resume */}
      {candidate.resumeUrl && (
        <Card title="Resume" style={{ marginTop: 24 }}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            href={candidate.resumeUrl}
            target="_blank"
            style={{ background: "#da2c46" }}
          >
            View Resume
          </Button>
        </Card>
      )}

      {candidate.certificates && candidate.certificates.length > 0 && (
        <Card title="Certificates" style={{ marginTop: 24 }}>
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
                        Uploaded on:{" "}
                        {new Date(cert.uploadedAt).toLocaleDateString()}
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
      {candidate.education && candidate.education.length > 0 && (
        <Card title="Education Background">
          <List
            dataSource={candidate.education}
            renderItem={(edu, index) => (
              <List.Item key={index}>
                <Card
                  size="small"
                  style={{ width: "100%", border: "1px solid #f0f0f0" }}
                >
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="Degree">
                      <Tag color="blue">{edu.degree}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Field of Study">
                      {edu.field}
                    </Descriptions.Item>
                    <Descriptions.Item label="Institution">
                      {edu.institution}
                    </Descriptions.Item>
                    <Descriptions.Item label="Year">
                      {edu.year}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )}

      {candidate.qualifications && candidate.qualifications.length > 0 && (
        <Card title="Qualifications" style={{ marginTop: 24 }}>
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

  const renderDocumentsInfo = () => (
    <div>
      <Card title="Identity Documents">
        <Descriptions bordered column={screens.md ? 2 : 1}>
          {candidate.passportNo && (
            <Descriptions.Item
              label={
                <span>
                  <IdcardOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Passport Number
                </span>
              }
            >
              <Text copyable>{candidate.passportNo}</Text>
            </Descriptions.Item>
          )}

          {candidate.passportPlaceOfIssue && (
            <Descriptions.Item
              label={
                <span>
                  <EnvironmentOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Place of Issue
                </span>
              }
            >
              {candidate.passportPlaceOfIssue}
            </Descriptions.Item>
          )}

          {candidate.passportIssueDate && (
            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Issue Date
                </span>
              }
            >
              {formatDate(candidate.passportIssueDate)}
            </Descriptions.Item>
          )}

          {candidate.passportExpiryDate && (
            <Descriptions.Item
              label={
                <span>
                  <CalendarOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Expiry Date
                </span>
              }
            >
              {formatDate(candidate.passportExpiryDate)}
            </Descriptions.Item>
          )}

          {candidate.iqamaNo && (
            <Descriptions.Item
              label={
                <span>
                  <IdcardOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  Iqama Number
                </span>
              }
            >
              <Text copyable>{candidate.iqamaNo}</Text>
            </Descriptions.Item>
          )}

          {candidate.countryOfBirth && (
            <Descriptions.Item
              label={
                <span>
                  <FlagOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  Country of Birth
                </span>
              }
            >
              {candidate.countryOfBirth}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>Loading candidate details...</div>
        </div>
      );
    }

    if (isError) {
      return (
        <Alert
          message="Error"
          description={error?.message || "Failed to load candidate details"}
          type="error"
          showIcon
          style={{ margin: "20px 0" }}
        />
      );
    }

    if (!candidate) {
      return (
        <Alert
          message="No Data"
          description="Candidate details not found"
          type="info"
          showIcon
          style={{ margin: "20px 0" }}
        />
      );
    }

    const tabItems = [
      {
        key: "basic",
        label: (
          <span>
            <UserOutlined />
            Basic Info
          </span>
        ),
        children: renderBasicInfo(),
      },
      {
        key: "contact",
        label: (
          <span>
            <ContactsOutlined />
            Contact
          </span>
        ),
        children: renderContactInfo(),
      },
      {
        key: "professional",
        label: (
          <span>
            <BankOutlined />
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
      {
        key: "documents",
        label: (
          <span>
            <IdcardOutlined />
            Documents
          </span>
        ),
        children: renderDocumentsInfo(),
      },
    ];

    return (
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        style={{ height: "100%" }}
      />
    );
  };

  return (
    <Drawer
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <InfoCircleOutlined
            style={{ marginRight: 8, color: "#da2c46", fontSize: 18 }}
          />
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            Candidate Profile Details
          </span>
        </div>
      }
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
