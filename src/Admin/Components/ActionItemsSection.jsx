import React from "react";
import { Row, Col, Card, Statistic, Typography, Divider, Popover, Table, Button } from "antd";
import { ClockCircleOutlined, RiseOutlined, DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import dayjs from "dayjs";
import { message } from "antd";

const { Title, Text } = Typography;

// Function to export hover data to Excel
const exportHoverDataToExcel = (data, columns, title) => {
  if (!data || data.length === 0) {
    message.warning("No data available to export");
    return;
  }

  try {
    // Convert table columns to Excel format
    const excelData = data.map((item) => {
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

const ActionItemsSection = ({ hoverData, primaryColor = "#da2c46" }) => {
  if (!hoverData) return null;

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
          Action Items
        </Title>
        <Divider style={{ margin: "8px 0 16px 0", borderColor: `${primaryColor}30` }} />
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={12}>
          <Popover
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>Expiring Work Orders</span>
                {(hoverData?.expiringWOs || []).length > 0 && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const columns = [
                        { title: "Branch", dataIndex: "branchName", key: "branchName" },
                        { title: "Client", dataIndex: "clientName", key: "clientName" },
                        { title: "Project", dataIndex: "projectName", key: "projectName" },
                        { title: "WO Name", dataIndex: "woName", key: "woName" },
                        { title: "Required", dataIndex: "totalCandidatesReq", key: "totalCandidatesReq" },
                        { title: "Hired", dataIndex: "hired", key: "hired" },
                        { title: "In Pipeline", dataIndex: "staged", key: "staged" },
                        { title: "Pending", dataIndex: "pending", key: "pending" },
                      ];
                      exportHoverDataToExcel(hoverData?.expiringWOs || [], columns, "Expiring_Work_Orders");
                    }}
                    style={{
                      backgroundColor: "#faad14",
                      borderColor: "#faad14",
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
            }
            content={
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table
                  size="small"
                  dataSource={hoverData?.expiringWOs || []}
                  columns={[
                    { title: "Branch", dataIndex: "branchName", key: "branchName" },
                    { title: "Client", dataIndex: "clientName", key: "clientName" },
                    { title: "Project", dataIndex: "projectName", key: "projectName" },
                    { title: "WO Name", dataIndex: "woName", key: "woName" },
                    { title: "Required", dataIndex: "totalCandidatesReq", key: "totalCandidatesReq" },
                    { title: "Hired", dataIndex: "hired", key: "hired" },
                    { title: "In Pipeline", dataIndex: "staged", key: "staged" },
                    { title: "Pending", dataIndex: "pending", key: "pending" },
                  ]}
                  pagination={false}
                />
              </div>
            }
            trigger="hover"
          >
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
                title={<span style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: "600" }}>Expiring Work Orders</span>}
                value={hoverData?.expiringWOs?.length || 0}
                prefix={<ClockCircleOutlined style={{ color: "#faad14", fontSize: "clamp(20px, 3vw, 24px)" }} />}
                valueStyle={{ color: "#faad14", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "bold" }}
              />
              <Text type="secondary" style={{ fontSize: "clamp(10px, 1.5vw, 12px)", display: "block", marginTop: "8px" }}>
                Nearing deadline
              </Text>
            </Card>
          </Popover>
        </Col>
        <Col xs={24} sm={12} md={12}>
          <Popover
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                <span style={{ fontWeight: "600", fontSize: "14px" }}>Work Orders on Priority</span>
                {(hoverData?.wosOnPriority || []).length > 0 && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      const columns = [
                        { title: "Branch", dataIndex: "branchName", key: "branchName" },
                        { title: "Client", dataIndex: "clientName", key: "clientName" },
                        { title: "Project", dataIndex: "projectName", key: "projectName" },
                        { title: "WO Name", dataIndex: "woName", key: "woName" },
                        { title: "Required", dataIndex: "totalCandidatesReq", key: "totalCandidatesReq" },
                        { title: "Hired", dataIndex: "hired", key: "hired" },
                        { title: "In Pipeline", dataIndex: "staged", key: "staged" },
                        { title: "Pending", dataIndex: "pending", key: "pending" },
                      ];
                      exportHoverDataToExcel(hoverData?.wosOnPriority || [], columns, "Work_Orders_on_Priority");
                    }}
                    style={{
                      backgroundColor: "#ff4d4f",
                      borderColor: "#ff4d4f",
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
            }
            content={
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table
                  size="small"
                  dataSource={hoverData?.wosOnPriority || []}
                  columns={[
                    { title: "Branch", dataIndex: "branchName", key: "branchName" },
                    { title: "Client", dataIndex: "clientName", key: "clientName" },
                    { title: "Project", dataIndex: "projectName", key: "projectName" },
                    { title: "WO Name", dataIndex: "woName", key: "woName" },
                    { title: "Required", dataIndex: "totalCandidatesReq", key: "totalCandidatesReq" },
                    { title: "Hired", dataIndex: "hired", key: "hired" },
                    { title: "In Pipeline", dataIndex: "staged", key: "staged" },
                    { title: "Pending", dataIndex: "pending", key: "pending" },
                  ]}
                  pagination={false}
                />
              </div>
            }
            trigger="hover"
          >
            <Card
              hoverable
              style={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #fff 0%, #fff1f0 100%)",
                border: "none",
                boxShadow: "0 8px 24px rgba(255, 77, 79, 0.12)",
                cursor: "pointer",
              }}
            >
              <Statistic
                title={<span style={{ fontSize: "clamp(12px, 1.8vw, 14px)", fontWeight: "600" }}>WOs on Priority</span>}
                value={hoverData?.wosOnPriority?.length || 0}
                prefix={<RiseOutlined style={{ color: "#ff4d4f", fontSize: "clamp(20px, 3vw, 24px)" }} />}
                valueStyle={{ color: "#ff4d4f", fontSize: "clamp(24px, 4vw, 32px)", fontWeight: "bold" }}
              />
              <Text type="secondary" style={{ fontSize: "clamp(10px, 1.5vw, 12px)", display: "block", marginTop: "8px" }}>
                High/Urgent priority
              </Text>
            </Card>
          </Popover>
        </Col>
      </Row>
    </>
  );
};

export default ActionItemsSection;

