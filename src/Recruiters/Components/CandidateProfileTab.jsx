// CandidateProfileTab.jsx
import React from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Divider,
  List,
  Empty,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  HomeOutlined,
  ContactsOutlined,
  BookOutlined,
  TrophyOutlined,
  FileTextOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { Space } from "antd";
import dayjs from "dayjs";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Text, Paragraph } = Typography;

const CandidateProfileTab = ({ candidate }) => {
  if (!candidate) return null;

  return (
    <>
      {/* Profile Summary Tab */}
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
              <PhoneOutlined />{" "}
              {candidate.phoneCountryCode && candidate.phone
                ? phoneUtils.formatWithCountryCode(
                    candidate.phoneCountryCode,
                    candidate.phone
                  )
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

      {/* Personal Information Tab */}
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
            <Text>{candidate.countryOfBirth || "Not provided"}</Text>
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
            <Text strong>Date of Birth:</Text>
            <br />
            {candidate.dateOfBirth || candidate.dob
              ? dayjs(candidate.dateOfBirth || candidate.dob).format("MMM DD, YYYY")
              : "Not provided"}
          </Col>
          <Col xs={24} sm={8}>
            <Text strong>Emergency Contact:</Text>
            <br />
            <Text>
              {candidate.emergencyContactNoCountryCode &&
              candidate.emergencyContactNo
                ? phoneUtils.formatWithCountryCode(
                    candidate.emergencyContactNoCountryCode,
                    candidate.emergencyContactNo
                  )
                : candidate.emergencyContactNo || "Not provided"}
            </Text>
          </Col>
        </Row>

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
                <Text>
                  Issue Date:{" "}
                  {dayjs(candidate.passportIssueDate).format("MMM DD, YYYY")}
                </Text>
              </div>
            )}
            {candidate.passportExpiryDate && (
              <div style={{ marginTop: 8 }}>
                <Text>
                  Expiry Date:{" "}
                  {dayjs(candidate.passportExpiryDate).format("MMM DD, YYYY")}
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

      {/* Address Information Tab */}
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

      {/* Contact Information Tab */}
      <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Text strong>Emergency Contact Person:</Text>
            <br />
            <Text>{candidate.contactPersonName || "Not provided"}</Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Emergency Contact Mobile:</Text>
            <br />
            <Text>
              {candidate.contactPersonMobileCountryCode &&
              candidate.contactPersonMobile
                ? phoneUtils.formatWithCountryCode(
                    candidate.contactPersonMobileCountryCode,
                    candidate.contactPersonMobile
                  )
                : candidate.contactPersonMobile || "Not provided"}
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text strong>Emergency Contact Home No:</Text>
            <br />
            <Text>
              {candidate.contactPersonHomeNoCountryCode &&
              candidate.contactPersonHomeNo
                ? phoneUtils.formatWithCountryCode(
                    candidate.contactPersonHomeNoCountryCode,
                    candidate.contactPersonHomeNo
                  )
                : candidate.contactPersonHomeNo || "Not provided"}
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
      </Card>

      {/* Education Tab */}
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
                          <Text type="secondary">Grade: {item.grade}</Text>
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

      {/* Work Experience Tab */}
      {candidate.workExperience && candidate.workExperience.length > 0 ? (
        <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
          <List
            dataSource={candidate.workExperience}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={<Text strong>{item.jobTitle || item.title}</Text>}
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
                        <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                          {item.description}
                        </Paragraph>
                      )}
                      {item.workMode && (
                        <div>
                          <Tag color="blue">Work Mode: {item.workMode}</Tag>
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

      {/* Employment Details Tab */}
      {candidate.employmentDetails ? (
        <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Text strong>Category:</Text>
              <br />
              <Text>
                {candidate.employmentDetails.category || "Not provided"}
              </Text>
            </Col>
            <Col xs={24} sm={12}>
              <Text strong>Assigned Job Title:</Text>
              <br />
              <Text>
                {candidate.employmentDetails.assignedJobTitle ||
                  "Not provided"}
              </Text>
            </Col>
            {candidate.employmentDetails.noOfDependent && (
              <Col xs={24} sm={12}>
                <Text strong>Number of Dependents:</Text>
                <br />
                <Text>{candidate.employmentDetails.noOfDependent}</Text>
              </Col>
            )}
            {candidate.employmentDetails.medicalPolicy && (
              <Col xs={24} sm={12}>
                <Text strong>Medical Policy:</Text>
                <br />
                <Tag color="green">Active</Tag>
                {candidate.employmentDetails.medicalPolicyNumber && (
                  <Text style={{ marginLeft: 8 }}>
                    ({candidate.employmentDetails.medicalPolicyNumber})
                  </Text>
                )}
              </Col>
            )}
          </Row>

          {candidate.employmentDetails.assetAllocation &&
            candidate.employmentDetails.assetAllocation.length > 0 && (
              <>
                <Divider />
                <Text strong style={{ fontSize: "16px" }}>
                  Asset Allocation:
                </Text>
                <List
                  style={{ marginTop: 12 }}
                  dataSource={candidate.employmentDetails.assetAllocation}
                  renderItem={(asset) => (
                    <List.Item>
                      <Text>{asset}</Text>
                    </List.Item>
                  )}
                />
              </>
            )}
        </Card>
      ) : (
        <Empty description="No employment details available" />
      )}

      {/* Previous Employment History Tab */}
      {candidate.attritionRecords && candidate.attritionRecords.length > 0 ? (
        <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
          <List
            dataSource={candidate.attritionRecords}
            renderItem={(record) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    record.status === "exit_approved" ? (
                      <CheckCircleOutlined
                        style={{ fontSize: 24, color: "#52c41a" }}
                      />
                    ) : record.status === "rejected" ? (
                      <CloseCircleOutlined
                        style={{ fontSize: 24, color: "#ff4d4f" }}
                      />
                    ) : record.status === "converted_to_candidate" ? (
                      <CheckCircleOutlined
                        style={{ fontSize: 24, color: "#1890ff" }}
                      />
                    ) : (
                      <CloseCircleOutlined
                        style={{ fontSize: 24, color: "#faad14" }}
                      />
                    )
                  }
                  title={
                    <Space direction="vertical" size={0}>
                      <Space>
                        <Text strong style={{ fontSize: 16 }}>
                          {record.workOrder?.title || "Previous Employment"}
                        </Text>
                        <Tag
                          color={
                            record.status === "exit_approved"
                              ? "green"
                              : record.status === "rejected"
                              ? "red"
                              : record.status === "converted_to_candidate"
                              ? "blue"
                              : "orange"
                          }
                        >
                          {record.status}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <strong>Initiated on:</strong>{" "}
                        {dayjs(record.createdAt).format("MMM DD, YYYY HH:mm")}
                      </Text>
                      {record.convertedAt && (
                        <>
                          {" | "}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <strong>Converted on:</strong>{" "}
                            {dayjs(record.convertedAt).format(
                              "MMM DD, YYYY HH:mm"
                            )}
                          </Text>
                        </>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ) : (
        <Empty description="No previous employment records" />
      )}

      {/* Social Media Tab */}
      {candidate.socialLinks && (
        <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
          <Row gutter={16}>
            {candidate.socialLinks.linkedin && (
              <Col xs={24} sm={12}>
                <Text strong>LinkedIn:</Text>
                <br />
                <Text>
                  <a
                    href={
                      candidate.socialLinks.linkedin.startsWith("http")
                        ? candidate.socialLinks.linkedin
                        : `https://${candidate.socialLinks.linkedin}`
                    }
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
                    href={
                      candidate.socialLinks.github.startsWith("http")
                        ? candidate.socialLinks.github
                        : `https://${candidate.socialLinks.github}`
                    }
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
                    href={
                      candidate.socialLinks.twitter.startsWith("http")
                        ? candidate.socialLinks.twitter
                        : `https://${candidate.socialLinks.twitter}`
                    }
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
                    href={
                      candidate.socialLinks.facebook.startsWith("http")
                        ? candidate.socialLinks.facebook
                        : `https://${candidate.socialLinks.facebook}`
                    }
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
    </>
  );
};

export default CandidateProfileTab;

