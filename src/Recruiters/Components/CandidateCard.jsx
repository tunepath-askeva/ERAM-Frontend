import React from "react";
import {
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Button,
  Space,
  Checkbox,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ToolOutlined,
  EyeOutlined,
  DollarOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const CandidateCard = ({
  candidate,
  index,
  onViewProfile,
  showExperience = true,
  showSkills = true,
  maxSkills = 3,
  onSelectCandidate,
  isSelected,
  isSelectable = false,
}) => {
  const navigate = useNavigate();

  const calculateExperience = (workExperience) => {
    if (
      !workExperience ||
      !Array.isArray(workExperience) ||
      workExperience.length === 0
    ) {
      return 0;
    }

    let totalMonths = 0;
    workExperience.forEach((exp) => {
      // Skip if startDate is null or undefined
      if (!exp.startDate) {
        return;
      }

      try {
        const start = new Date(exp.startDate);

        // Check if startDate is valid
        if (isNaN(start.getTime())) {
          return;
        }

        let end;
        // Handle endDate - check for "Present" or null/undefined
        if (
          !exp.endDate ||
          exp.endDate === "Present" ||
          exp.endDate === "present"
        ) {
          end = new Date();
        } else {
          end = new Date(exp.endDate);
          // Check if endDate is valid
          if (isNaN(end.getTime())) {
            end = new Date();
          }
        }

        const monthsDiff =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());

        // Only add positive months
        if (monthsDiff > 0) {
          totalMonths += monthsDiff;
        }
      } catch (error) {
        console.warn("Error calculating experience for:", exp);
        return;
      }
    });

    return Math.round((totalMonths / 12) * 10) / 10;
  };

  const getExperienceDisplay = () => {
    // First check if totalExperienceYears is available
    if (candidate.totalExperienceYears) {
      return candidate.totalExperienceYears;
    }

    // Otherwise calculate from work experience
    const calculatedExp = calculateExperience(candidate.workExperience);

    if (calculatedExp === 0) {
      return "Fresher";
    }

    if (calculatedExp < 1) {
      return "< 1 year";
    }

    return `${calculatedExp} year${calculatedExp !== 1 ? "s" : ""}`;
  };

  const experience = getExperienceDisplay();

  const handleViewProfile = () => {
    onViewProfile(candidate);
  };

  const formatSalary = (salary) => {
    if (!salary || salary === "0") return null;

    const numSalary = parseFloat(salary);
    if (isNaN(numSalary)) return salary;

    if (numSalary >= 100000) {
      return `₹${(numSalary / 100000).toFixed(1)}L`;
    } else if (numSalary >= 1000) {
      return `₹${(numSalary / 1000).toFixed(0)}K`;
    } else {
      return `₹${numSalary}`;
    }
  };

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
    <div
      key={candidate._id || index}
      style={{ marginBottom: "clamp(12px, 2vw, 16px)" }}
    >
      <Card
        hoverable
        style={{
          padding: "clamp(16px, 3vw, 24px)",
          borderRadius: "12px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Row align="middle" gutter={[16, 16]}>
          {isSelectable && (
            <Col flex="none">
              <Checkbox
                checked={isSelected}
                onChange={(e) =>
                  onSelectCandidate(candidate._id, e.target.checked)
                }
              />
            </Col>
          )}

          <Col flex="auto">
            <Row align="top" gutter={[16, 12]}>
              <Col
                xs={24}
                md={18}
                style={{
                  paddingRight: "clamp(0px, 2vw, 16px)",
                  marginBottom: "clamp(0px, 3vw, 12px)",
                }}
              >
                <div style={{ marginBottom: "clamp(8px, 1.5vw, 12px)" }}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "8px 12px",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: "clamp(16px, 1.8vw, 18px)",
                        lineHeight: 1.3,
                        marginRight: "8px",
                      }}
                    >
                      {candidate.fullName || "Unknown Candidate"}
                    </Text>
                    {candidate.title && (
                      <Tag color="blue" style={{ margin: 0 }}>
                        {candidate.title}
                      </Tag>
                    )}
                    {showExperience && (
                      <Text
                        type="secondary"
                        style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                      >
                        {experience} exp
                      </Text>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: "clamp(8px, 1.5vw, 12px)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 12px",
                    alignItems: "center",
                  }}
                >
                  <Space size={4}>
                    <BankOutlined style={{ color: "#666", fontSize: "14px" }} />
                    <Text
                      style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                      ellipsis
                    >
                      Current Company :{" "}
                      {candidate.currentCompany ||
                        candidate.workExperience?.[0]?.company ||
                        "Not specified"}
                    </Text>
                  </Space>

                  <Divider
                    type="vertical"
                    style={{ margin: 0, height: "auto" }}
                  />

                  <Space size={4}>
                    <EnvironmentOutlined
                      style={{ color: "#666", fontSize: "14px" }}
                    />
                    <Text style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}>
                      Current Location : {candidate.location || "Not specified"}
                    </Text>
                  </Space>

                  <Divider
                    type="vertical"
                    style={{ margin: 0, height: "auto" }}
                  />

                  <div>
                    {getCandidateStatusTag(
                      candidate.status,
                      candidate.isApplied
                    )}
                  </div>
                </div>

                {/* Second row with salary and nationality */}
                <div
                  style={{
                    marginBottom: "clamp(8px, 1.5vw, 12px)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 12px",
                    alignItems: "center",
                  }}
                >
                  {formatSalary(candidate.currentSalary) && (
                    <>
                      <Space size={4}>
                        <DollarOutlined
                          style={{ color: "#666", fontSize: "14px" }}
                        />
                        <Text
                          style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                          type="secondary"
                        >
                          Current Salary:{" "}
                          {formatSalary(candidate.currentSalary)}
                        </Text>
                      </Space>

                      {candidate.nationality && (
                        <Divider
                          type="vertical"
                          style={{ margin: 0, height: "auto" }}
                        />
                      )}
                    </>
                  )}

                  {candidate.nationality && (
                    <Space size={4}>
                      <GlobalOutlined
                        style={{ color: "#666", fontSize: "14px" }}
                      />
                      <Text style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}>
                        Nationality : {candidate.nationality}
                      </Text>
                    </Space>
                  )}
                </div>

                {showSkills && candidate.skills?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px 8px",
                      alignItems: "center",
                    }}
                  >
                    <ToolOutlined style={{ color: "#666", fontSize: "14px" }} />
                    <Text
                      type="secondary"
                      style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                    >
                      Key Skills:
                    </Text>
                    {candidate.skills
                      .slice(0, maxSkills)
                      .map((skill, index) => (
                        <Tag
                          key={index}
                          style={{
                            margin: 0,
                            fontSize: "clamp(12px, 1.3vw, 13px)",
                            padding: "2px 8px",
                          }}
                        >
                          {skill}
                        </Tag>
                      ))}
                    {candidate.skills.length > maxSkills && (
                      <Tag
                        style={{
                          margin: 0,
                          fontSize: "clamp(12px, 1.3vw, 13px)",
                        }}
                      >
                        +{candidate.skills.length - maxSkills} more
                      </Tag>
                    )}
                  </div>
                )}
              </Col>

              <Col
                xs={24}
                md={6}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "clamp(8px, 1.5vw, 12px)",
                }}
              >
                <div
                  style={{
                    width: "clamp(80px, 20vw, 100px)",
                    height: "clamp(80px, 20vw, 100px)",
                    borderRadius: "12px",
                    backgroundColor: "#da2c46",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  {candidate.image ? (
                    <img
                      src={candidate.image}
                      alt={candidate.fullName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <UserOutlined
                      style={{
                        fontSize: "clamp(32px, 8vw, 40px)",
                        color: "#fff",
                      }}
                    />
                  )}
                </div>

                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#da2c46",
                    width: "100%",
                    maxWidth: "100px",
                    fontSize: "clamp(13px, 1.5vw, 14px)",
                    padding: "6px 12px",
                  }}
                  icon={<EyeOutlined />}
                  onClick={handleViewProfile}
                >
                  View Profile
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CandidateCard;
