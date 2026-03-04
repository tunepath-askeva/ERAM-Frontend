import React from "react";
import { Empty, Typography } from "antd";

const { Text } = Typography;

const PieChart = ({ data }) => {
  if (!data || data.length === 0)
    return <Empty description="No data available" />;

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = [
    "#da2c46",
    "#f04a6e",
    "#ff4757",
    "#e74c3c",
    "#dc3545",
    "#c82333",
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: `conic-gradient(
            ${data
              .map((item, index) => {
                const startAngle =
                  (data.slice(0, index).reduce((sum, d) => sum + d.value, 0) /
                    total) *
                  360;
                const endAngle =
                  (data
                    .slice(0, index + 1)
                    .reduce((sum, d) => sum + d.value, 0) /
                    total) *
                  360;
                return `${colors[index]} ${startAngle}deg ${endAngle}deg`;
              })
              .join(", ")}
          )`,
          position: "relative",
          marginBottom: "30px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "white",
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Text
            strong
            style={{
              fontSize: "28px",
              color: "#da2c46",
              marginBottom: "-5px",
            }}
          >
            {total}
          </Text>
          <Text style={{ fontSize: "14px", color: "#666" }}>Total Users</Text>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "15px",
          width: "100%",
        }}
      >
        {data.map((item, index) => (
          <div
            key={item.type}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "#f8f9fa",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                backgroundColor: colors[index],
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            ></div>
            <div>
              <Text style={{ fontSize: "13px", fontWeight: "500" }}>
                {item.type}
              </Text>
              <Text
                style={{ fontSize: "11px", color: "#666", marginLeft: "5px" }}
              >
                ({Math.round((item.value / total) * 100)}%)
              </Text>
              <div>
                <Text
                  strong
                  style={{ fontSize: "16px", color: colors[index] }}
                >
                  {item.value}
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChart;

