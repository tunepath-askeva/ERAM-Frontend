import React from "react";
import { Empty, Typography } from "antd";

const { Text } = Typography;

const BarChart = ({ data }) => {
  if (!data || data.length === 0)
    return <Empty description="No status data available" />;

  const maxValue = Math.max(...data.map((item) => item.count));
  const colors = ["#da2c46", "#f04a6e", "#ff4757", "#e74c3c"];

  return (
    <div style={{ padding: "30px 20px" }}>
      {data.map((item, index) => (
        <div key={item._id} style={{ marginBottom: "25px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <Text style={{ fontSize: "16px", fontWeight: "500" }}>
              {item._id.charAt(0).toUpperCase() + item._id.slice(1)}
            </Text>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Text strong style={{ fontSize: "18px", color: colors[index] }}>
                {item.count}
              </Text>
              <Text style={{ fontSize: "12px", color: "#666" }}>
                (
                {Math.round(
                  (item.count / data.reduce((sum, d) => sum + d.count, 0)) *
                    100
                )}
                %)
              </Text>
            </div>
          </div>
          <div
            style={{
              width: "100%",
              height: "12px",
              backgroundColor: "#f0f2f5",
              borderRadius: "6px",
              overflow: "hidden",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                width: `${(item.count / maxValue) * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${colors[index]}, ${colors[index]}dd)`,
                borderRadius: "6px",
                transition: "width 0.3s ease",
                boxShadow: `0 2px 8px ${colors[index]}40`,
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;

