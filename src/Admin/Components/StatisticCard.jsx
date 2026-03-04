import React from "react";
import { Card, Statistic, Typography, Popover, Table } from "antd";

const { Text } = Typography;

const StatisticCard = ({
  title,
  value,
  prefix,
  icon,
  iconColor,
  gradientColors,
  hoverData,
  hoverColumns,
  hoverTitle,
  description,
  primaryColor = "#da2c46",
}) => {
  const cardContent = (
    <Card
      hoverable
      style={{
        borderRadius: "16px",
        background: gradientColors || "linear-gradient(135deg, #fff 0%, #f0f9ff 100%)",
        border: "none",
        boxShadow: `0 8px 24px ${iconColor || "#1890ff"}20`,
        cursor: hoverData ? "pointer" : "default",
      }}
    >
      <Statistic
        title={<span style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: "600" }}>{title}</span>}
        value={value ?? 0}
        prefix={prefix || (icon && React.createElement(icon, { 
          style: { color: iconColor || "#1890ff", fontSize: "clamp(20px, 3vw, 24px)" } 
        }))}
        valueStyle={{ 
          color: iconColor || "#1890ff", 
          fontSize: "clamp(24px, 4vw, 32px)", 
          fontWeight: "bold" 
        }}
      />
      {description && (
        <Text type="secondary" style={{ fontSize: "clamp(10px, 1.5vw, 12px)", display: "block", marginTop: "8px" }}>
          {description}
        </Text>
      )}
    </Card>
  );

  if (hoverData && hoverColumns) {
    return (
      <Popover
        title={hoverTitle || title}
        content={
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table
              size="small"
              dataSource={hoverData || []}
              columns={hoverColumns}
              pagination={false}
            />
          </div>
        }
        trigger="hover"
      >
        {cardContent}
      </Popover>
    );
  }

  return cardContent;
};

export default StatisticCard;

