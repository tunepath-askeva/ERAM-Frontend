import React from 'react';
import {
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Button,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const CandidateCard = ({ 
  candidate, 
  index, 
  onViewProfile,
  showExperience = true,
  showSkills = true,
  maxSkills = 3 
}) => {
  const calculateExperience = (workExperience) => {
    if (!workExperience || !Array.isArray(workExperience) || workExperience.length === 0) {
      return 0;
    }
    
    let totalMonths = 0;
    workExperience.forEach(exp => {
      if (exp.startDate) {
        const start = new Date(exp.startDate);
        const end = exp.endDate ? new Date(exp.endDate) : new Date();
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                          (end.getMonth() - start.getMonth());
        totalMonths += monthsDiff;
      }
    });
    
    return Math.round(totalMonths / 12 * 10) / 10;
  };

  const experience = calculateExperience(candidate.workExperience);

  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(candidate);
    } else {
      console.log("View candidate:", candidate);
    }
  };

  return (
    <Card
      key={candidate._id || index}
      size="small"
      style={{
        marginBottom: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      hoverable
    >
      <Row gutter={[16, 12]} align="middle">
        <Col flex="none">
          <Avatar
            size={48}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#1890ff" }}
          >
            {candidate?.fullName?.charAt(0)?.toUpperCase()}
          </Avatar>
        </Col>

        <Col flex="auto">
          <div>
            <Title
              level={5}
              style={{
                margin: "0 0 4px 0",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              {candidate?.fullName || "Unknown Candidate"}
            </Title>

            <Space direction="vertical" size={2}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <MailOutlined style={{ fontSize: "12px", color: "#666" }} />
                <Text style={{ fontSize: "13px", color: "#666" }}>
                  {candidate?.email || "No email provided"}
                </Text>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <PhoneOutlined style={{ fontSize: "12px", color: "#666" }} />
                <Text style={{ fontSize: "13px", color: "#666" }}>
                  {candidate?.phone || "No phone provided"}
                </Text>
              </div>

              {showExperience && experience > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <TrophyOutlined style={{ fontSize: "12px", color: "#666" }} />
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {experience} years experience
                  </Text>
                </div>
              )}


              {candidate.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#666" }}>📍</span>
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {candidate.location}
                  </Text>
                </div>
              )}

              {showSkills && candidate.skills && candidate.skills.length > 0 && (
                <div style={{ marginTop: "4px" }}>
                  <Space size={4} wrap>
                    {candidate.skills.slice(0, maxSkills).map((skill, idx) => (
                      <Tag key={idx} size="small" color="blue">
                        {skill}
                      </Tag>
                    ))}
                    {candidate.skills.length > maxSkills && (
                      <Tag size="small" color="default">
                        +{candidate.skills.length - maxSkills} more
                      </Tag>
                    )}
                  </Space>
                </div>
              )}
            </Space>
          </div>
        </Col>

        <Col flex="none">
          <Space direction="vertical" size={4} align="end">
            <Tag
              color={candidate.status === "contacted" ? "blue" : "orange"}
              style={{ fontSize: "11px" }}
            >
              {candidate.status || "new"}
            </Tag>

            <Button
              type="primary"
              size="small"
              style={{ fontSize: "12px" }}
              onClick={handleViewProfile}
            >
              View Profile
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default CandidateCard;