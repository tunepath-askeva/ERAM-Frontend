import React from "react";
import { Typography, Space } from "antd";

const { Text } = Typography;

/**
 * ViewField - A component to display form field values in view mode
 * Clean, readable text format without input box styling
 */
const ViewField = ({ label, value, prefix, placeholder = "Not provided", children, showLabel = true }) => {
  const displayValue = value !== undefined && value !== null && value !== "" 
    ? value 
    : placeholder;
  
  const isEmpty = displayValue === placeholder;

  return (
    <div style={{ marginBottom: 16 }}>
      {showLabel && (
        <div
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "rgba(0, 0, 0, 0.85)",
            marginBottom: 4,
          }}
        >
          {label}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          minHeight: "22px",
        }}
      >
        {prefix && (
          <span style={{ marginRight: 8, color: "rgba(0, 0, 0, 0.45)", fontSize: "14px" }}>
            {prefix}
          </span>
        )}
        {children || (
          <Text
            style={{
              color: isEmpty ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.85)",
              fontStyle: isEmpty ? "italic" : "normal",
              fontSize: "14px",
            }}
          >
            {displayValue}
          </Text>
        )}
      </div>
    </div>
  );
};

export default ViewField;

