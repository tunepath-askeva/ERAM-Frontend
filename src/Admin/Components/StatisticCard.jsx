import React from "react";
import { Card, Statistic, Typography, Popover, Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { message } from "antd";

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

  // Function to export hover data to Excel
  const exportHoverDataToExcel = (data, columns, title) => {
    if (!data || data.length === 0) {
      message.warning("No data available to export");
      return;
    }

    try {
      // Convert table columns to Excel format
      const excelData = data.map((item, index) => {
        const row = {};
        columns.forEach((col) => {
          const key = col.dataIndex || col.key;
          if (key) {
            // Handle nested keys (e.g., "client.name")
            const keys = key.split(".");
            let value = item;
            for (const k of keys) {
              value = value?.[k];
            }
            row[col.title || key] = value ?? "";
          }
        });
        return row;
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      
      // Set column widths
      const maxWidths = {};
      excelData.forEach((row) => {
        Object.keys(row).forEach((key) => {
          const cellValue = String(row[key] || "");
          const currentWidth = maxWidths[key] || 10;
          maxWidths[key] = Math.max(currentWidth, Math.min(cellValue.length + 2, 50));
        });
      });
      
      worksheet["!cols"] = Object.keys(maxWidths).map((key) => ({
        wch: maxWidths[key],
      }));

      XLSX.utils.book_append_sheet(workbook, worksheet, title || "Sheet1");

      // Generate filename with timestamp
      const sanitizedTitle = (title || "Export").replace(/[^a-z0-9]/gi, "_");
      const filename = `${sanitizedTitle}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`;
      
      // Download file
      XLSX.writeFile(workbook, filename);
      message.success(`Successfully exported ${data.length} records to Excel`);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      message.error("Failed to export data. Please try again.");
    }
  };

  if (hoverData && hoverColumns) {
    // Filter out entries with N/A for critical fields (branchName, clientName, projectName)
    const filteredHoverData = (hoverData || []).filter(item => {
      // Don't show entries where branchName is N/A or null/undefined
      if (item.branchName === "N/A" || !item.branchName) return false;
      // For client summary, ensure clientName is valid
      if (item.clientName === "N/A" || (!item.clientName && hoverTitle === "Client Summary")) return false;
      // For project summary, ensure projectName is valid
      if (item.projectName === "N/A" || (!item.projectName && hoverTitle === "Project Summary")) return false;
      return true;
    });

    const popoverTitle = (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <span style={{ fontWeight: "600", fontSize: "14px" }}>{hoverTitle || title}</span>
        {filteredHoverData.length > 0 && (
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              exportHoverDataToExcel(filteredHoverData, hoverColumns, hoverTitle || title);
            }}
            style={{
              backgroundColor: primaryColor,
              borderColor: primaryColor,
              fontSize: "12px",
              height: "28px",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
            title="Download to Excel"
          >
            Export
          </Button>
        )}
      </div>
    );

    return (
      <Popover
        title={popoverTitle}
        content={
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {filteredHoverData.length > 0 ? (
              <Table
                size="small"
                dataSource={filteredHoverData}
                columns={hoverColumns}
                pagination={false}
              />
            ) : (
              <div style={{ padding: "16px", textAlign: "center", color: "#999" }}>
                No data available
              </div>
            )}
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

