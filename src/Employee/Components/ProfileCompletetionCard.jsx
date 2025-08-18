import React from "react";
import { Card, Typography, Progress } from "antd";
import { TrophyOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const ProfileCompletionCard = ({ completionPercentage }) => (
  <Card
    style={{
      marginBottom: 24,
      borderRadius: "12px",
      background: "linear-gradient(135deg, rgba(218, 44, 70, 0.05) 0%, rgba(165, 22, 50, 0.05) 100%)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <Title level={4} style={{ margin: 0, color: "#da2c46" }}>
        <TrophyOutlined style={{ marginRight: 8 }} />
        Profile Completion
      </Title>
      <Text style={{ fontSize: "16px", fontWeight: 600, color: "#da2c46" }}>
        {completionPercentage}%
      </Text>
    </div>
    <Progress
      percent={completionPercentage}
      strokeColor={{ "0%": "#da2c46", "100%": "#a51632" }}
      showInfo={false}
    />
    <Text type="secondary" style={{ fontSize: "12px", marginTop: 8, display: "block" }}>
      Complete your profile to improve team collaboration and efficiency
    </Text>
  </Card>
);

export default ProfileCompletionCard;