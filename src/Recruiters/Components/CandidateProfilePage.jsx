// CandidateProfilePage.jsx
import React from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Avatar,
  Divider,
  Tag,
  Descriptions,
  Button,
  Space,
  Tabs,
  List,
  Empty,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ToolOutlined,
  FileTextOutlined,
  BookOutlined,
  GlobalOutlined,
  IdcardOutlined,
  HomeOutlined,
  LinkedinOutlined,
  GithubOutlined,
  TwitterOutlined,
  FacebookOutlined,
  FilePdfOutlined 
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSourcedCandidateQuery } from "../../Slices/Recruiter/RecruiterApis";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const CandidateProfilePage = ({ candidate: propCandidate }) => {
  const { candidateId } = useParams();
  const navigate = useNavigate();

  const {
    data: candidateData,
    isLoading,
    error,
  } = useGetSourcedCandidateQuery(
    { userId: candidateId },
    { skip: !!propCandidate || !candidateId }
  );

  const candidate =
    propCandidate || candidateData?.users?.[0] || candidateData?.users;

  if ((isLoading && !propCandidate) || !candidate) {
    return <div>Loading...</div>;
  }

  if (error && !propCandidate) {
    return <div>Error loading candidate profile</div>;
  }

  const getCandidateStatusTag = (status, isApplied) => {
    if (!status || status === "sourced") {
      return isApplied ? (
        <Tag color="blue">Applied</Tag>
      ) : (
        <Tag color="default">Sourced</Tag>
      );
    }

    const statusColors = {
      applied: "blue",
      selected: "green",
      screening: "orange",
      hired: "purple",
      rejected: "red",
    };

    return (
      <Tag color={statusColors[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSocialLinks = () => {
    const { socialLinks } = candidate;
    if (!socialLinks) return null;

    const ensureProtocol = (url) => {
      if (!url) return "";
      if (!url.match(/^https?:\/\//)) {
        return `https://${url}`;
      }
      return url;
    };

    return (
      <div style={{ marginTop: "16px" }}>
        <Title level={5}>Social Links</Title>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          {socialLinks.linkedin && (
            <div>
              <LinkedinOutlined
                style={{ marginRight: "8px", color: "#0077B5" }}
              />
              <a
                href={ensureProtocol(socialLinks.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                LinkedIn
              </a>
            </div>
          )}
          {socialLinks.github && (
            <div>
              <GithubOutlined style={{ marginRight: "8px" }} />
              <a
                href={ensureProtocol(socialLinks.github)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                GitHub
              </a>
            </div>
          )}
          {socialLinks.twitter && (
            <div>
              <TwitterOutlined
                style={{ marginRight: "8px", color: "#1DA1F2" }}
              />
              <a
                href={ensureProtocol(socialLinks.twitter)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Twitter
              </a>
            </div>
          )}
          {socialLinks.facebook && (
            <div>
              <FacebookOutlined
                style={{ marginRight: "8px", color: "#1877F2" }}
              />
              <a
                href={ensureProtocol(socialLinks.facebook)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                Facebook
              </a>
            </div>
          )}
        </Space>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <Card>
        <Row gutter={[24, 24]}>
          {/* Left Column - Profile Overview */}
          <Col xs={24} md={8}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Avatar
                size={150}
                src={candidate.image}
                icon={<UserOutlined />}
                style={{ marginBottom: "16px" }}
              />
              <Title level={3} style={{ textAlign: "center" }}>
                {candidate.fullName}
              </Title>
              <Text strong style={{ fontSize: "16px", marginBottom: "8px" }}>
                {candidate.title}
              </Text>
              {getCandidateStatusTag(candidate.status, candidate.isApplied)}

              {candidate.age && (
                <Text type="secondary" style={{ marginTop: "8px" }}>
                  Age: {candidate.age} years
                </Text>
              )}

              <Divider />

              {/* Contact Information */}
              <div style={{ width: "100%" }}>
                <Title level={5}>Contact Information</Title>
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: "100%" }}
                >
                  <div>
                    <MailOutlined style={{ marginRight: "8px" }} />
                    <Text>{candidate.email}</Text>
                  </div>
                  <div>
                    <PhoneOutlined style={{ marginRight: "8px" }} />
                    <Text>{candidate.phone}</Text>
                  </div>
                  <div>
                    <EnvironmentOutlined style={{ marginRight: "8px" }} />
                    <Text>{candidate.location}</Text>
                  </div>
                  {candidate.emergencyContactNo && (
                    <div>
                      <PhoneOutlined
                        style={{ marginRight: "8px", color: "red" }}
                      />
                      <Text>
                        Emergency: {candidate.emergencyContactNo}
                        {candidate.contactPersonName &&
                          ` (${candidate.contactPersonName})`}
                      </Text>
                    </div>
                  )}
                </Space>
              </div>

              {getSocialLinks()}
            </div>
          </Col>

          {/* Right Column - Detailed Information */}
          <Col xs={24} md={16}>
            <Tabs defaultActiveKey="1">
              <TabPane
                tab={
                  <span>
                    <UserOutlined /> Overview
                  </span>
                }
                key="1"
              >
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Current Status">
                    {getCandidateStatusTag(
                      candidate.status,
                      candidate.isApplied
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Company">
                    {candidate.currentCompany ||
                      candidate.workExperience?.[0]?.company ||
                      "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Total Experience">
                    {candidate.totalExperienceYears || 0} years
                  </Descriptions.Item>
                  <Descriptions.Item label="Notice Period">
                    {candidate.noticePeriod || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Salary">
                    {candidate.currentSalary || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Expected Salary">
                    {candidate.expectedSalary || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Industry">
                    {candidate.industry?.join(", ") || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Languages">
                    {candidate.languages?.join(", ") || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nationality">
                    {candidate.nationality || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Visa Status">
                    {candidate.visaStatus?.join(", ") || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Agency">
                    {candidate.agency || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Work Order Hint">
                    {candidate.workorderhint || "Not specified"}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />
                <Title level={5}>Summary</Title>
                <div style={{ marginBottom: "24px" }}>
                  {candidate.profileSummary || "No summary provided"}
                </div>
                <Divider />

             
                <Title level={5}>Certificates</Title>
                <div style={{ marginBottom: "24px" }}>
                  {candidate.certificates &&
                  candidate.certificates.length > 0 ? (
                    <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
                      <List
                        dataSource={candidate.certificates}
                        renderItem={(cert) => (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <Text strong>
                                  {cert.documentName || cert.fileName}
                                </Text>
                              }
                              description={
                                <div>
                                  <Text type="secondary">
                                    Uploaded on:{" "}
                                    {dayjs(cert.uploadedAt).format(
                                      "MMM DD, YYYY"
                                    )}
                                  </Text>
                                  <br />
                                  <Button
                                    type="link"
                                    href={cert.fileUrl}
                                    target="_blank"
                                    icon={<FilePdfOutlined />}
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
                  ) : (
             "No certificates available" 
                  )}
                </div>
                <Divider />

                <Title level={5}>Skills</Title>
                <div style={{ marginBottom: "24px" }}>
                  {candidate.skills?.length > 0 ? (
                    candidate.skills.map((skill, index) => (
                      <Tag key={index} style={{ marginBottom: "8px" }}>
                        {skill}
                      </Tag>
                    ))
                  ) : (
                    <Text>No skills listed</Text>
                  )}
                </div>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BookOutlined /> Experience
                  </span>
                }
                key="2"
              >
                {candidate.workExperience?.length > 0 ? (
                  candidate.workExperience.map((exp, index) => (
                    <Card key={index} style={{ marginBottom: "16px" }}>
                      <Title level={5}>{exp.company}</Title>
                      <Text strong>{exp.title}</Text>
                      <div style={{ margin: "8px 0" }}>
                        <Text type="secondary">
                          {formatDate(exp.startDate)} -{" "}
                          {exp.endDate === "Present"
                            ? "Present"
                            : formatDate(exp.endDate)}
                        </Text>
                      </div>
                      {exp.description && <Text>{exp.description}</Text>}
                    </Card>
                  ))
                ) : (
                  <Text>No work experience added</Text>
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <BookOutlined /> Education
                  </span>
                }
                key="3"
              >
                {candidate.education?.length > 0 ? (
                  candidate.education.map((edu, index) => (
                    <Card key={index} style={{ marginBottom: "16px" }}>
                      <Title level={5}>{edu.institution}</Title>
                      <Text strong>
                        {edu.degree} {edu.field ? `in ${edu.field}` : ""}
                      </Text>
                      <div style={{ margin: "8px 0" }}>
                        <Text type="secondary">Graduated: {edu.year}</Text>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Text>No education information added</Text>
                )}

                {candidate.qualifications?.length > 0 && (
                  <>
                    <Divider />
                    <Title level={5}>Additional Qualifications</Title>
                    {candidate.qualifications.map((qual, index) => (
                      <Tag key={index} style={{ marginBottom: "8px" }}>
                        {qual}
                      </Tag>
                    ))}
                  </>
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FileTextOutlined /> Resume
                  </span>
                }
                key="4"
              >
                {candidate.resumeUrl ? (
                  <div>
                    <Button
                      type="primary"
                      href={candidate.resumeUrl}
                      target="_blank"
                      style={{ marginBottom: "16px", background: "#da2c46" }}
                    >
                      Download Resume
                    </Button>
                    <iframe
                      src={candidate.resumeUrl}
                      style={{ width: "100%", height: "600px", border: "none" }}
                      title="Candidate Resume"
                    />
                  </div>
                ) : (
                  <Text>No resume uploaded</Text>
                )}
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <IdcardOutlined /> Personal Details
                  </span>
                }
                key="5"
              >
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Full Name">
                    {`${candidate.firstName} ${
                      candidate.middleName ? candidate.middleName + " " : ""
                    }${candidate.lastName}`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {candidate.gender || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age">
                    {candidate.age || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Marital Status">
                    {candidate.maritalStatus || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Blood Group">
                    {candidate.bloodGroup || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Religion">
                    {candidate.religion || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Country of Birth">
                    {candidate.countryOfBirth || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {[
                      candidate.streetName,
                      candidate.region,
                      candidate.city,
                      candidate.state,
                      candidate.country,
                      candidate.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Emergency Contact">
                    {candidate.emergencyContactNo}
                    {candidate.contactPersonName &&
                      ` (${candidate.contactPersonName})`}
                  </Descriptions.Item>
                  <Descriptions.Item label="Home Contact">
                    {candidate.contactPersonHomeNo || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mobile Contact">
                    {candidate.contactPersonMobile || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nominee">
                    {candidate.nomineeName}
                    {candidate.nomineeRelationship &&
                      ` (${candidate.nomineeRelationship})`}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <GlobalOutlined /> Passport & Visa
                  </span>
                }
                key="6"
              >
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Passport Number">
                    {candidate.passportNo || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Passport Issue Date">
                    {formatDate(candidate.passportIssueDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Passport Expiry Date">
                    {formatDate(candidate.passportExpiryDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Place of Issue">
                    {candidate.passportPlaceOfIssue || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Iqama Number">
                    {candidate.iqamaNo || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Visa Status">
                    {candidate.visaStatus?.join(", ") || "Not specified"}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <ToolOutlined /> Job Preferences
                  </span>
                }
                key="7"
              >
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Preferred Roles">
                    {candidate.jobPreferences?.roles?.join(", ") ||
                      "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Preferred Locations">
                    {candidate.jobPreferences?.locations?.join(", ") ||
                      "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Salary Range">
                    {candidate.jobPreferences?.salaryRange || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Work Type">
                    {candidate.jobPreferences?.workType || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Employment Type">
                    {candidate.jobPreferences?.employmentType ||
                      "Not specified"}
                  </Descriptions.Item>
                </Descriptions>
              </TabPane>
            </Tabs>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CandidateProfilePage;
