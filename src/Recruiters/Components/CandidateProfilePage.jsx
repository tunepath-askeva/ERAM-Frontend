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
  Collapse,
  Button,
  Space,
  Tabs,
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
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { useGetSourcedCandidateQuery } from "../../Slices/Recruiter/RecruiterApis";

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

  const candidate = propCandidate || candidateData?.users;

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
                </Space>
              </div>
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
                  <Descriptions.Item label="Nationality">
                    {candidate.nationality || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Visa Status">
                    {candidate.visaStatus?.join(", ") || "Not specified"}
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Title level={5}>Skills</Title>
                <div style={{ marginBottom: "24px" }}>
                  {candidate.skills?.map((skill, index) => (
                    <Tag key={index} style={{ marginBottom: "8px" }}>
                      {skill}
                    </Tag>
                  ))}
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
                      <Text>{exp.title}</Text>
                      <div style={{ margin: "8px 0" }}>
                        <Text type="secondary">
                          {exp.startDate} - {exp.endDate || "Present"}
                        </Text>
                      </div>
                      <Text>{exp.description}</Text>
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
                        {edu.degree} in {edu.field}
                      </Text>
                      <div style={{ margin: "8px 0" }}>
                        <Text type="secondary">Graduated: {edu.year}</Text>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Text>No education information added</Text>
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
                  <iframe
                    src={candidate.resumeUrl}
                    style={{ width: "100%", height: "800px", border: "none" }}
                    title="Candidate Resume"
                  />
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
                  <Descriptions.Item label="Date of Birth">
                    {candidate.dateOfBirth || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {candidate.gender || "Not specified"}
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
                  <Descriptions.Item label="Address">
                    {[
                      candidate.streetName,
                      candidate.city,
                      candidate.state,
                      candidate.country,
                      candidate.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Not specified"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Emergency Contact">
                    {candidate.emergencyContactNo} (
                    {candidate.contactPersonName})
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
