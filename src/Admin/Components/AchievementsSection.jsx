import React from "react";
import { Row, Col, Card, Statistic, Typography, Divider } from "antd";
import {
  FileDoneOutlined,
  UserOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const AchievementsSection = ({ achievements, dateRange, primaryColor = "#da2c46" }) => {
  if (!achievements) return null;

  return (
    <>
      <div style={{ marginBottom: "16px", marginTop: "24px" }}>
        <Title
          level={4}
          style={{
            color: primaryColor,
            marginBottom: "8px",
            fontSize: "clamp(18px, 2.5vw, 22px)",
            fontWeight: "700",
          }}
        >
          Achievements (Past {dateRange || 7} Days)
        </Title>
        <Divider style={{ margin: "8px 0 16px 0", borderColor: `${primaryColor}30` }} />
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fff 0%, #f0f9ff 100%)",
              border: "none",
              boxShadow: "0 8px 24px rgba(24, 144, 255, 0.12)",
              cursor: "pointer",
            }}
          >
            <Statistic
              title={<span style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: "600" }}>New CVs Added</span>}
              value={achievements.newCVsAdded ?? 0}
              prefix={<FileDoneOutlined style={{ color: "#1890ff", fontSize: "clamp(20px, 3vw, 24px)" }} />}
              valueStyle={{ color: "#1890ff", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "bold" }}
            />
            <Text type="secondary" style={{ fontSize: "clamp(10px, 1.5vw, 12px)", display: "block", marginTop: "8px" }}>
              Past {dateRange || 7} days
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fff 0%, #fff7e6 100%)",
              border: "none",
              boxShadow: "0 8px 24px rgba(250, 173, 20, 0.12)",
              cursor: "pointer",
            }}
          >
            <Statistic
              title={<span style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: "600" }}>New Candidates Added</span>}
              value={achievements.newCandidatesAdded ?? 0}
              prefix={<UserOutlined style={{ color: "#faad14", fontSize: "clamp(20px, 3vw, 24px)" }} />}
              valueStyle={{ color: "#faad14", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "bold" }}
            />
            <Text type="secondary" style={{ fontSize: "clamp(10px, 1.5vw, 12px)", display: "block", marginTop: "8px" }}>
              Past {dateRange || 7} days
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fff 0%, #f6ffed 100%)",
              border: "none",
              boxShadow: "0 8px 24px rgba(82, 196, 26, 0.12)",
              cursor: "pointer",
            }}
          >
            <Statistic
              title={<span style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: "600" }}>Completed Work Orders</span>}
              value={achievements.completedWOs ?? 0}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a", fontSize: "clamp(20px, 3vw, 24px)" }} />}
              valueStyle={{ color: "#52c41a", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "bold" }}
            />
            <Text type="secondary" style={{ fontSize: "clamp(10px, 1.5vw, 12px)", display: "block", marginTop: "8px" }}>
              Past {dateRange || 7} days
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fff 0%, #f0f9ff 100%)",
              border: "none",
              boxShadow: "0 8px 24px rgba(24, 144, 255, 0.12)",
              cursor: "pointer",
            }}
          >
            <Statistic
              title={<span style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: "600" }}>Interviews Conducted</span>}
              value={achievements.interviewsConducted ?? 0}
              prefix={<TeamOutlined style={{ color: "#1890ff", fontSize: "clamp(20px, 3vw, 24px)" }} />}
              valueStyle={{ color: "#1890ff", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "bold" }}
            />
            <Text type="secondary" style={{ fontSize: "clamp(10px, 1.5vw, 12px)", display: "block", marginTop: "8px" }}>
              Past {dateRange || 7} days
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: "16px",
              background: "linear-gradient(135deg, #fff 0%, #f6ffed 100%)",
              border: "none",
              boxShadow: "0 8px 24px rgba(82, 196, 26, 0.12)",
              cursor: "pointer",
            }}
          >
            <Statistic
              title={<span style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: "600" }}>Converted to Employee</span>}
              value={achievements.convertedToEmployee ?? 0}
              prefix={<TrophyOutlined style={{ color: "#52c41a", fontSize: "clamp(20px, 3vw, 24px)" }} />}
              valueStyle={{ color: "#52c41a", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "bold" }}
            />
            <Text type="secondary" style={{ fontSize: "clamp(10px, 1.5vw, 12px)", display: "block", marginTop: "8px" }}>
              Past {dateRange || 7} days
            </Text>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AchievementsSection;

