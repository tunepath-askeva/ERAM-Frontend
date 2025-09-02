// CandidateDetailsDrawer.jsx
import React, { useState } from "react";
import {
  Drawer,
  Avatar,
  Tag,
  Divider,
  Typography,
  Row,
  Col,
  List,
  Card,
  Tabs,
  Progress,
  Button,
  Empty,
  message,
  Modal,
  Skeleton,
  Input,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BookOutlined,
  TrophyOutlined,
  IdcardOutlined,
  HomeOutlined,
  ContactsOutlined,
  FileTextOutlined,
  StarOutlined,
  FilePdfOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useGetAllcandidatebyIdQuery } from "../../Slices/Recruiter/RecruiterApis";

import { useNotifyEmployeeMutation } from "../../Slices/Employee/EmployeeApis";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const CandidateDetailsDrawer = ({ candidateId, visible, onClose }) => {
  const [notifyModalVisible, setNotifyModalVisible] = useState(false);
  const [remarks, setRemarks] = useState("");

  const { data, isLoading, error } = useGetAllcandidatebyIdQuery(candidateId, {
    skip: !candidateId,
  });

  const [sendNotification, { isLoading: isNotificationLoading }] =
    useNotifyEmployeeMutation();

  const candidate = data?.candidateDetails;

  if (!candidate) return null;

  const calculateProfileCompletion = () => {
    const requiredFields = [
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.phone,
      candidate.title,
      candidate.location,
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

  const profileCompletion =
    candidate.profileCompletion || calculateProfileCompletion();

  const handleNotifyCandidate = () => {
    setNotifyModalVisible(true);
  };

  const handleModalClose = () => {
    setNotifyModalVisible(false);
    setRemarks("");
  };

  const confirmNotification = async () => {
    if (!remarks.trim()) {
      message.warning("Please enter your remarks before sending.");
      return;
    }

    try {
      const response = await sendNotification({
        email: candidate.email,
        title: "Profile Updation - Immediate Action required!!!",
        description: remarks.trim(),
      }).unwrap();

      message.success(
        `Notification sent successfully to ${
          candidate.fullName || candidate.firstName
        }`
      );
      handleModalClose();
    } catch (error) {
      console.error("Notification error:", error);
      message.error(
        error?.data?.message || "Failed to send notification. Please try again."
      );
    }
  };

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

  return (
    <>
      <Drawer
        title="Candidate Details"
        placement="right"
        onClose={onClose}
        visible={visible}
        width={700}
        extra={
          <Button
            icon={<NotificationOutlined />}
            onClick={handleNotifyCandidate}
            style={{
              background: "#ff4d4f",
              borderColor: "#ff4d4f",
              color: "white",
            }}
          >
            Notify
          </Button>
        }
      >
        {isLoading ? (
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        ) : error ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Text type="danger">Failed to load candidate details</Text>
          </div>
        ) : (
          candidate && (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <Avatar
                  size={80}
                  src={candidate.image}
                  icon={<UserOutlined />}
                  style={{ border: "4px solid #da2c46" }}
                />
                <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                  {candidate.fullName ||
                    `${candidate.firstName} ${candidate.lastName}`}
                </Title>
                <Text type="secondary">{candidate.title}</Text>

                {/* Profile Completion Section */}
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
                      {getCompletionStatus(profileCompletion)} (
                      {profileCompletion}%)
                    </Text>
                  </div>
                  <Progress
                    percent={profileCompletion}
                    strokeColor={getCompletionColor(profileCompletion)}
                    style={{ width: "80%", margin: "0 auto" }}
                  />
                </div>

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
                      Profile Last Updated at:
                    </Text>
                    <Text strong>
                      {candidate.updatedAt
                        ? dayjs(candidate.updatedAt).format("MMM DD, YYYY")
                        : "Not available"}
                    </Text>
                  </div>
                </div>
              </div>

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

              <Tabs defaultActiveKey="profile" type="card">
                <TabPane
                  tab={
                    <span>
                      <UserOutlined />
                      Profile Summary
                    </span>
                  }
                  key="profile"
                >
                  <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
                    <Row gutter={16}>
                      <Col span={24}>
                        <Paragraph>
                          {candidate.profileSummary ||
                            "No profile summary provided"}
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
                        <Text>
                          {candidate.currentSalary || "Not specified"}
                        </Text>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Text strong>Expected Salary:</Text>
                        <br />
                        <Text>
                          {candidate.expectedSalary || "Not specified"}
                        </Text>
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
                          <Tag
                            key={index}
                            color="blue"
                            style={{ marginTop: 8 }}
                          >
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
                          <Tag
                            key={index}
                            color="green"
                            style={{ marginTop: 8 }}
                          >
                            {language}
                          </Tag>
                        ))}
                      </>
                    )}
                  </Card>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <IdcardOutlined />
                      Personal Information
                    </span>
                  }
                  key="personal"
                >
                  <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
                    <Row gutter={16}>
                      <Col xs={24} sm={8}>
                        <Text strong>Nationality:</Text>
                        <br />
                        <Text>{candidate.nationality || "Not provided"}</Text>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text strong>Country of Birth:</Text>
                        <br />
                        <Text>
                          {candidate.countryOfBirth || "Not provided"}
                        </Text>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text strong>Marital Status:</Text>
                        <br />
                        <Text>{candidate.maritalStatus || "Not provided"}</Text>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text strong>Gender:</Text>
                        <br />
                        <Text>{candidate.gender || "Not provided"}</Text>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text strong>Blood Group:</Text>
                        <br />
                        <Text>{candidate.bloodGroup || "Not provided"}</Text>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text strong>Religion:</Text>
                        <br />
                        <Text>{candidate.religion || "Not provided"}</Text>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text strong>Age:</Text>
                        <br />
                        <Text>{candidate.age || "Not provided"}</Text>
                      </Col>
                      <Col xs={24} sm={8}>
                        <Text strong>Emergency Contact:</Text>
                        <br />
                        <Text>
                          {candidate.emergencyContactNo || "Not provided"}
                        </Text>
                      </Col>
                    </Row>

                    {candidate.industry && candidate.industry.length > 0 && (
                      <>
                        <Divider />
                        <Text strong>Industry:</Text>
                        <br />
                        {candidate.industry.map((industry, index) => (
                          <Tag
                            key={index}
                            color="purple"
                            style={{ marginTop: 8 }}
                          >
                            {industry}
                          </Tag>
                        ))}
                      </>
                    )}

                    {candidate.visaStatus &&
                      candidate.visaStatus.length > 0 && (
                        <>
                          <Divider />
                          <Text strong>Visa Status:</Text>
                          <br />
                          {candidate.visaStatus.map((status, index) => (
                            <Tag
                              key={index}
                              color="orange"
                              style={{ marginTop: 8 }}
                            >
                              {status}
                            </Tag>
                          ))}
                        </>
                      )}

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
                            <Text>
                              Place of Issue: {candidate.passportPlaceOfIssue}
                            </Text>
                          </div>
                        )}
                        {candidate.passportIssueDate && (
                          <div style={{ marginTop: 8 }}>
                            <Text>
                              Issue Date:{" "}
                              {dayjs(candidate.passportIssueDate).format(
                                "MMM DD, YYYY"
                              )}
                            </Text>
                          </div>
                        )}
                        {candidate.passportExpiryDate && (
                          <div style={{ marginTop: 8 }}>
                            <Text>
                              Expiry Date:{" "}
                              {dayjs(candidate.passportExpiryDate).format(
                                "MMM DD, YYYY"
                              )}
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
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <HomeOutlined />
                      Address Information
                    </span>
                  }
                  key="address"
                >
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
                  </Card>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <ContactsOutlined />
                      Contact Information
                    </span>
                  }
                  key="contact"
                >
                  <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Text strong>Emergency Contact Person:</Text>
                        <br />
                        <Text>
                          {candidate.contactPersonName || "Not provided"}
                        </Text>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Text strong>Emergency Contact Mobile:</Text>
                        <br />
                        <Text>
                          {candidate.contactPersonMobile || "Not provided"}
                        </Text>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Text strong>Emergency Contact Home No:</Text>
                        <br />
                        <Text>
                          {candidate.contactPersonHomeNo || "Not provided"}
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
                        <Text>
                          {candidate.nomineeRelationship || "Not provided"}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <BookOutlined />
                      Education
                    </span>
                  }
                  key="education"
                >
                  {candidate.education && candidate.education.length > 0 ? (
                    <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
                      <List
                        dataSource={candidate.education}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <Text strong>
                                  {item.degree} in {item.field}
                                </Text>
                              }
                              description={
                                <div>
                                  <Text>{item.institution}</Text>
                                  <br />
                                  <Text type="secondary">{item.year}</Text>
                                  {item.grade && (
                                    <>
                                      <br />
                                      <Text type="secondary">
                                        Grade: {item.grade}
                                      </Text>
                                    </>
                                  )}
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
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <TrophyOutlined />
                      Work Experience
                    </span>
                  }
                  key="experience"
                >
                  {candidate.workExperience &&
                  candidate.workExperience.length > 0 ? (
                    <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
                      <List
                        dataSource={candidate.workExperience}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <Text strong>
                                  {item.jobTitle || item.title}
                                </Text>
                              }
                              description={
                                <div>
                                  <Text>{item.company}</Text>
                                  <br />
                                  <Text type="secondary">
                                    {item.startDate
                                      ? dayjs(item.startDate).format("MMM YYYY")
                                      : ""}{" "}
                                    -{" "}
                                    {item.endDate === "Present"
                                      ? "Present"
                                      : item.endDate
                                      ? dayjs(item.endDate).format("MMM YYYY")
                                      : ""}
                                  </Text>
                                  {item.description && (
                                    <Paragraph
                                      ellipsis={{ rows: 2, expandable: true }}
                                    >
                                      {item.description}
                                    </Paragraph>
                                  )}
                                  {item.workMode && (
                                    <div>
                                      <Tag color="blue">
                                        Work Mode: {item.workMode}
                                      </Tag>
                                    </div>
                                  )}
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  ) : (
                    <Empty description="No work experience available" />
                  )}
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <FileTextOutlined />
                      Certificates
                    </span>
                  }
                  key="certificates"
                >
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
                    <Empty description="No certificates available" />
                  )}
                </TabPane>

                <TabPane
                  tab={
                    <span>
                      <UserOutlined />
                      Social Media
                    </span>
                  }
                  key="social"
                >
                  {candidate.socialLinks && (
                    <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
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
                    </Card>
                  )}
                </TabPane>
              </Tabs>
            </>
          )
        )}
      </Drawer>

      {/* Notification Modal */}
      <Modal
        title="Notify Candidate"
        visible={notifyModalVisible}
        onOk={confirmNotification}
        onCancel={handleModalClose}
        okText="Send Notification"
        confirmLoading={isNotificationLoading}
        okButtonProps={{
          style: {
            backgroundColor: "#da2c46",
            borderColor: "#da2c46",
            color: "#fff",
          },
        }}
        cancelText="Cancel"
      >
        <p>
          Send a notification to{" "}
          <strong>{candidate.fullName || candidate.firstName}</strong>
        </p>

        <Input.TextArea
          rows={4}
          placeholder="Type your remarks or message here..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Modal>
    </>
  );
};

export default CandidateDetailsDrawer;
