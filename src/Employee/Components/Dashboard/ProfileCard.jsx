import React, { useState } from "react";
import { Card, Avatar, Typography, Tag, Space, Divider, Progress, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ProfileCard = ({ employee, profileCompletion, screenSize }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  // Avatar size: purely CSS-driven via percentage, but we still pass a number
  // to Ant Design's Avatar `size` prop as a fallback.
  const avatarSize = screenSize.isMobile
    ? Math.min(screenSize.width * 0.42, 160) // ~42vw, capped at 160px
    : screenSize.isTablet
    ? 190
    : 210;

  const cardPadding = screenSize.isMobile ? "14px" : screenSize.isTablet ? "18px" : "22px";

  return (
    <Card
      style={{
        background: "#ffffff",
        border: "1px solid #e8e8e8",
        borderRadius: "12px",
        boxShadow: isHovered
          ? "0 8px 30px rgba(218, 44, 70, 0.35), 0 0 40px rgba(218, 44, 70, 0.15)"
          : "0 2px 8px rgba(0, 0, 0, 0.08)",
        height: screenSize.isMobile ? "auto" : "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        margin: 0,
        transition: "box-shadow 0.3s ease",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: cardPadding,
        height: screenSize.isMobile ? "auto" : "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflowY: screenSize.isDesktop ? "auto" : "visible",
        overflowX: "hidden",
        overflow: screenSize.isMobile ? "visible" : "hidden",
        boxSizing: "border-box",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Top section ── */}
      <div>
        {/* Avatar + name block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginBottom: screenSize.isMobile ? "12px" : "16px",
            width: "100%",
          }}
        >
          {/* Avatar container — CSS percentage so it always fits */}
          <div
            style={{
              width: screenSize.isMobile ? "clamp(120px, 42vw, 160px)" : `${avatarSize}px`,
              height: screenSize.isMobile ? "clamp(120px, 42vw, 160px)" : `${avatarSize}px`,
              borderRadius: "50%",
              overflow: "hidden",
              flexShrink: 0,
              marginBottom: screenSize.isMobile ? "10px" : "14px",
              border: screenSize.isMobile ? "3px solid #ffffff" : "4px solid #ffffff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              backgroundColor: "#f5f5f5",
              // Force perfectly square container via aspect-ratio
              aspectRatio: "1 / 1",
            }}
          >
            {employee?.image ? (
              <img
                src={employee.image}
                alt="profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <Avatar
                size={avatarSize}
                icon={<UserOutlined />}
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#e6e6e6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: avatarSize * 0.4,
                  borderRadius: "50%",
                }}
              />
            )}
          </div>

          <Title
            level={4}
            style={{
              color: "#262626",
              margin: "0 0 4px 0",
              fontWeight: 600,
              fontSize: screenSize.isMobile ? "15px" : "17px",
              lineHeight: 1.3,
              wordBreak: "break-word",
              maxWidth: "100%",
            }}
          >
            {employee?.firstName || "DEMO"} {employee?.lastName || "Employee"}
          </Title>

          <Text
            style={{
              color: "#595959",
              display: "block",
              fontSize: screenSize.isMobile ? "11px" : "12px",
              marginBottom: "2px",
              fontWeight: 500,
            }}
          >
            ID: {employee?.employmentDetails?.eramId || "ERAM00123"}
          </Text>

          <Text
            style={{
              color: "#595959",
              display: "block",
              fontSize: screenSize.isMobile ? "11px" : "12px",
              marginBottom: "2px",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={
              employee?.employmentDetails?.assignedJobTitle ||
              employee?.employmentDetails?.designation ||
              "Developer"
            }
          >
            {employee?.employmentDetails?.assignedJobTitle ||
              employee?.employmentDetails?.designation ||
              "Developer"}
          </Text>

          <Text
            style={{
              color: "#8c8c8c",
              display: "block",
              fontSize: screenSize.isMobile ? "10px" : "11px",
              marginBottom: "8px",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {employee?.employmentDetails?.department || "N/A"}
          </Text>
        </div>

        <Divider style={{ borderColor: "#f0f0f0", margin: "10px 0" }} />

        {/* Contact details */}
        <div style={{ textAlign: "center" }}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <Text
              style={{
                color: "#595959",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: screenSize.isMobile ? "11px" : "12px",
                wordBreak: "break-all",
                flexWrap: "wrap",
              }}
            >
              <MailOutlined style={{ color: "#da2c46", flexShrink: 0 }} />
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "calc(100% - 24px)" }}>
                {employee?.email || "demoemp@test.com"}
              </span>
            </Text>

            <Text
              style={{
                color: "#595959",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                fontSize: screenSize.isMobile ? "11px" : "12px",
              }}
            >
              <PhoneOutlined style={{ color: "#da2c46", flexShrink: 0 }} />
              {employee?.phone || "N/A"}
            </Text>

            {employee?.employmentDetails?.workLocation && (
              <Text
                style={{
                  color: "#595959",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  fontSize: screenSize.isMobile ? "11px" : "12px",
                }}
              >
                <EnvironmentOutlined style={{ color: "#da2c46", flexShrink: 0 }} />
                {employee.employmentDetails.workLocation}
              </Text>
            )}

            <div style={{ marginTop: "4px" }}>
              <Tag
                color="green"
                style={{
                  padding: "3px 10px",
                  borderRadius: "16px",
                  fontSize: screenSize.isMobile ? "10px" : "11px",
                  border: "none",
                }}
              >
                <CheckCircleOutlined style={{ marginRight: "4px" }} />
                Active
              </Tag>
            </div>
          </Space>
        </div>
      </div>

      {/* ── Profile Completion ── */}
      <div style={{ textAlign: "center", marginTop: screenSize.isMobile ? "14px" : "18px" }}>
        <Text
          style={{
            color: "#262626",
            display: "block",
            marginBottom: "10px",
            fontSize: screenSize.isMobile ? "12px" : "13px",
            fontWeight: 600,
          }}
        >
          Profile Completion
        </Text>

        <Progress
          type="circle"
          percent={profileCompletion}
          size={screenSize.isMobile ? 90 : screenSize.isTablet ? 100 : 110}
          strokeColor={{ "0%": "#1890ff", "50%": "#40a9ff", "100%": "#69c0ff" }}
          trailColor="#f0f0f0"
          strokeWidth={8}
          format={(percent) => (
            <span style={{ fontSize: screenSize.isMobile ? "14px" : "16px", fontWeight: 600 }}>
              {percent}%
            </span>
          )}
          style={{
            marginBottom: "10px",
            filter:
              "drop-shadow(0 0 6px rgba(24,144,255,0.35)) drop-shadow(0 0 12px rgba(24,144,255,0.15))",
          }}
        />

        <Text
          style={{
            color: "#8c8c8c",
            display: "block",
            marginBottom: "12px",
            fontSize: screenSize.isMobile ? "10px" : "11px",
          }}
        >
          Profile completed {profileCompletion}%
        </Text>

        <Button
          type="primary"
          onClick={() => navigate("/employee/profile-settings")}
          style={{
            width: "100%",
            borderRadius: "8px",
            backgroundColor: "#da2c46",
            borderColor: "#da2c46",
            height: screenSize.isMobile ? "34px" : "38px",
            fontSize: screenSize.isMobile ? "11px" : "12px",
            fontWeight: 500,
          }}
        >
          Complete Now
        </Button>
      </div>
    </Card>
  );
};

export default ProfileCard;