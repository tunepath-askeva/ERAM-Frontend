import {
  Drawer,
  Card,
  Space,
  Avatar,
  Typography,
  Tag,
  Badge,
  Descriptions,
  List,
  Timeline,
  Button,
} from "antd";
import { UserOutlined, FileTextOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

function CandidateDetailsDrawer({ visible, onClose, candidate }) {
  if (!candidate) return null;

  return (
    <Drawer
      title={candidate.fullName}
      placement="right"
      size="large"
      onClose={onClose}
      open={visible}
      style={{ borderRadius: 8 }}
    >
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Card>
          <Space align="start" size="large">
            <Avatar
              size={80}
              src={candidate.image}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#da2c46" }}
            />
            <Space direction="vertical" size={0}>
              <Title level={3} style={{ margin: 0 }}>
                {candidate.fullName}
              </Title>
              <Text type="secondary" style={{ fontSize: "16px" }}>
                {candidate.title}
              </Text>
              <Space wrap style={{ marginTop: 8 }}>
                <Tag
                  color={
                    candidate.candidateType === "Khafalath" ? "gold" : "green"
                  }
                >
                  {candidate.candidateType}
                </Tag>
                <Badge
                  status={
                    candidate.accountStatus === "active" ? "success" : "error"
                  }
                  text={candidate.accountStatus}
                />
              </Space>
            </Space>
          </Space>
        </Card>

        <Card title="Contact Information">
          <Descriptions column={1}>
            <Descriptions.Item label="Email">
              {candidate.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {candidate.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {candidate.location}
            </Descriptions.Item>
            {candidate.city && (
              <Descriptions.Item label="City">
                {candidate.city}
              </Descriptions.Item>
            )}
            {candidate.state && (
              <Descriptions.Item label="State">
                {candidate.state}
              </Descriptions.Item>
            )}
            {candidate.country && (
              <Descriptions.Item label="Country">
                {candidate.country}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title="Personal Information">
          <Descriptions column={1}>
            {candidate.age && (
              <Descriptions.Item label="Age">
                {candidate.age} years
              </Descriptions.Item>
            )}
            {candidate.gender && (
              <Descriptions.Item label="Gender">
                {candidate.gender}
              </Descriptions.Item>
            )}
            {candidate.maritalStatus && (
              <Descriptions.Item label="Marital Status">
                {candidate.maritalStatus}
              </Descriptions.Item>
            )}
            {candidate.nationality && (
              <Descriptions.Item label="Nationality">
                {candidate.nationality}
              </Descriptions.Item>
            )}
            {candidate.languages && candidate.languages.length > 0 && (
              <Descriptions.Item label="Languages">
                {candidate.languages.join(", ")}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title="Professional Information">
          <Descriptions column={1}>
            <Descriptions.Item label="Experience">
              {candidate.totalExperienceYears} years
            </Descriptions.Item>
            {candidate.currentSalary && (
              <Descriptions.Item label="Current Salary">
                ₹{candidate.currentSalary}
              </Descriptions.Item>
            )}
            {candidate.expectedSalary && (
              <Descriptions.Item label="Expected Salary">
                ₹{candidate.expectedSalary}
              </Descriptions.Item>
            )}
            {candidate.noticePeriod && (
              <Descriptions.Item label="Notice Period">
                {candidate.noticePeriod}
              </Descriptions.Item>
            )}
            {candidate.industry && candidate.industry.length > 0 && (
              <Descriptions.Item label="Industry">
                {candidate.industry.map((ind) => (
                  <Tag key={ind} color="blue">
                    {ind}
                  </Tag>
                ))}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {candidate.skills && candidate.skills.length > 0 && (
          <Card title="Skills">
            <Space wrap>
              {candidate.skills.map((skill) => (
                <Tag key={skill} color="blue" style={{ marginBottom: 8 }}>
                  {skill}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

        {candidate.education && candidate.education.length > 0 && (
          <Card title="Education">
            <List
              dataSource={candidate.education}
              renderItem={(edu) => (
                <List.Item>
                  <List.Item.Meta
                    title={`${edu.degree} in ${edu.field}`}
                    description={`${edu.institution} - ${edu.year}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        )}

        {candidate.workExperience && candidate.workExperience.length > 0 && (
          <Card title="Work Experience">
            <Timeline>
              {candidate.workExperience.map((exp, index) => (
                <Timeline.Item key={index}>
                  <Title level={5} style={{ margin: 0 }}>
                    {exp.company}
                  </Title>
                  <Text type="secondary">
                    {exp.startDate} - {exp.endDate || "Present"}
                  </Text>
                  {exp.description && (
                    <Paragraph style={{ marginTop: 8 }}>
                      {exp.description}
                    </Paragraph>
                  )}
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        )}

        {candidate.profileSummary && (
          <Card title="Profile Summary">
            <Paragraph>{candidate.profileSummary}</Paragraph>
          </Card>
        )}

        {candidate.resumeUrl && (
          <Card title="Resume">
            <Button
              type="primary"
              style={{ backgroundColor: "#da2c46" }}
              icon={<FileTextOutlined />}
              href={candidate.resumeUrl}
              target="_blank"
            >
              Download Resume
            </Button>
          </Card>
        )}
      </Space>
    </Drawer>
  );
}

export default CandidateDetailsDrawer;
