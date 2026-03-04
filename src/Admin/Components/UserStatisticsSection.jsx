import React from "react";
import { Row, Col, Card, Statistic, Progress, Typography, Divider } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  UsergroupAddOutlined,
  PieChartOutlined,
  FunnelPlotOutlined,
} from "@ant-design/icons";
import PieChart from "./PieChart";
import BarChart from "./BarChart";

const { Title, Text } = Typography;

const UserStatisticsSection = ({ 
  data, 
  isLoading, 
  roleData, 
  totalUsers, 
  getCount,
  primaryColor = "#da2c46" 
}) => {
  const statisticCardStyles = [
    {
      background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 8px 32px rgba(218, 44, 70, 0.25)",
    },
    {
      background: "linear-gradient(135deg, #da2c46 0%, #f04a6e 100%)",
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 8px 32px rgba(218, 44, 70, 0.25)",
    },
    {
      background: "linear-gradient(135deg, #da2c46 0%, #ff4757 100%)",
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 8px 32px rgba(218, 44, 70, 0.25)",
    },
    {
      background: "linear-gradient(135deg, #da2c46 0%, #e74c3c 100%)",
      borderRadius: "16px",
      border: "none",
      boxShadow: "0 8px 32px rgba(218, 44, 70, 0.25)",
    },
  ];

  const whiteCardStyle = {
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "none",
  };

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
          User Statistics
        </Title>
        <Divider style={{ margin: "8px 0 16px 0", borderColor: `${primaryColor}30` }} />
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card 
            style={{ 
              ...statisticCardStyles[0], 
              color: "white",
              minHeight: "clamp(140px, 20vw, 180px)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }} 
            hoverable
            bodyStyle={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "clamp(16px, 2.5vw, 24px)",
              height: "100%",
            }}
          >
            <Statistic
              title={
                <span 
                  style={{ 
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                    fontWeight: "500",
                    lineHeight: "1.4",
                    display: "block",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Total Candidates
                </span>
              }
              value={data?.totalCandidates || 0}
              prefix={<UserOutlined style={{ color: "white", fontSize: "clamp(20px, 3vw, 28px)" }} />}
              loading={isLoading}
              valueStyle={{
                color: "white",
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: "bold",
                lineHeight: "1.2",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card 
            style={{ 
              ...statisticCardStyles[1], 
              color: "white",
              minHeight: "clamp(140px, 20vw, 180px)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }} 
            hoverable
            bodyStyle={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "clamp(16px, 2.5vw, 24px)",
              height: "100%",
            }}
          >
            <Statistic
              title={
                <span 
                  style={{ 
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                    fontWeight: "500",
                    lineHeight: "1.4",
                    display: "block",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Total Users
                </span>
              }
              value={totalUsers}
              prefix={<TeamOutlined style={{ color: "white", fontSize: "clamp(20px, 3vw, 28px)" }} />}
              loading={isLoading}
              valueStyle={{
                color: "white",
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: "bold",
                lineHeight: "1.2",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card 
            style={{ 
              ...statisticCardStyles[2], 
              color: "white",
              minHeight: "clamp(140px, 20vw, 180px)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }} 
            hoverable
            bodyStyle={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "clamp(16px, 2.5vw, 24px)",
              height: "100%",
            }}
          >
            <Statistic
              title={
                <span 
                  style={{ 
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "clamp(11px, 1.6vw, 13px)",
                    fontWeight: "500",
                    lineHeight: "1.4",
                    display: "block",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    hyphens: "auto",
                  }}
                >
                  Recruitment Team Members
                </span>
              }
              value={getCount("recruiter")}
              prefix={<SolutionOutlined style={{ color: "white", fontSize: "clamp(20px, 3vw, 28px)" }} />}
              loading={isLoading}
              valueStyle={{
                color: "white",
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: "bold",
                lineHeight: "1.2",
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={12} lg={6}>
          <Card 
            style={{ 
              ...statisticCardStyles[3], 
              color: "white",
              minHeight: "clamp(140px, 20vw, 180px)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }} 
            hoverable
            bodyStyle={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "flex-start",
              padding: "clamp(16px, 2.5vw, 24px)",
              height: "100%",
            }}
          >
            <Statistic
              title={
                <span 
                  style={{ 
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "clamp(12px, 1.8vw, 14px)",
                    fontWeight: "500",
                    lineHeight: "1.4",
                    display: "block",
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Employees
                </span>
              }
              value={getCount("employee")}
              prefix={<UsergroupAddOutlined style={{ color: "white", fontSize: "clamp(20px, 3vw, 28px)" }} />}
              loading={isLoading}
              valueStyle={{
                color: "white",
                fontSize: "clamp(28px, 4vw, 36px)",
                fontWeight: "bold",
                lineHeight: "1.2",
              }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <PieChartOutlined style={{ color: primaryColor }} />
                <span style={{ fontSize: "clamp(16px, 2.5vw, 18px)", fontWeight: "600" }}>
                  User Distribution by Role
                </span>
              </div>
            }
            style={whiteCardStyle}
            loading={isLoading}
            hoverable
          >
            <PieChart data={roleData} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FunnelPlotOutlined style={{ color: primaryColor }} />
                <span style={{ fontSize: "clamp(16px, 2.5vw, 18px)", fontWeight: "600" }}>
                  Candidate Pipeline Status
                </span>
              </div>
            }
            style={whiteCardStyle}
            loading={isLoading}
            hoverable
          >
            <BarChart data={data?.statusCounts} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TeamOutlined style={{ color: primaryColor }} />
                <span style={{ fontSize: "clamp(16px, 2.5vw, 18px)", fontWeight: "600" }}>
                  Role Distribution Details
                </span>
              </div>
            }
            style={whiteCardStyle}
            loading={isLoading}
            hoverable
          >
            {data?.roleCounts?.map((role, index) => (
              <div key={role._id} style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px",
                  }}
                >
                  <Text style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: "500" }}>
                    {role._id.charAt(0).toUpperCase() + role._id.slice(1)}
                  </Text>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Text strong style={{ fontSize: "clamp(16px, 2.5vw, 18px)" }}>
                      {role.count}
                    </Text>
                    <Text style={{ fontSize: "clamp(11px, 1.5vw, 12px)", color: "#666" }}>
                      ({Math.round((role.count / totalUsers) * 100)}%)
                    </Text>
                  </div>
                </div>
                <Progress
                  percent={Math.round((role.count / totalUsers) * 100)}
                  strokeColor={{
                    "0%": ["#667eea", "#f093fb", "#4facfe", "#43e97b"][index],
                    "100%": ["#764ba2", "#f5576c", "#00f2fe", "#38f9d7"][index],
                  }}
                  trailColor="#f0f2f5"
                  strokeWidth={10}
                  style={{ marginBottom: "8px" }}
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FunnelPlotOutlined style={{ color: primaryColor }} />
                <span style={{ fontSize: "clamp(16px, 2.5vw, 18px)", fontWeight: "600" }}>
                  Status Overview
                </span>
              </div>
            }
            style={whiteCardStyle}
            loading={isLoading}
            hoverable
          >
            {data?.statusCounts?.map((status, index) => (
              <div
                key={status._id}
                style={{
                  marginBottom: "20px",
                  padding: "clamp(12px, 2vw, 16px)",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${
                    ["#667eea", "#f093fb"][index]
                  }15, ${["#764ba2", "#f5576c"][index]}15)`,
                  border: `1px solid ${["#667eea", "#f093fb"][index]}30`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "clamp(35px, 5vw, 40px)",
                      height: "clamp(35px, 5vw, 40px)",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${
                        ["#667eea", "#f093fb"][index]
                      }, ${["#764ba2", "#f5576c"][index]})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "clamp(16px, 2.5vw, 18px)",
                      fontWeight: "bold",
                    }}
                  >
                    {status.count}
                  </div>
                  <div>
                    <Text
                      style={{
                        fontSize: "clamp(14px, 2vw, 16px)",
                        fontWeight: "500",
                        display: "block",
                      }}
                    >
                      {status._id.charAt(0).toUpperCase() + status._id.slice(1)}
                    </Text>
                    <Text style={{ fontSize: "clamp(11px, 1.5vw, 12px)", color: "#666" }}>
                      Candidates in this stage
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default UserStatisticsSection;

