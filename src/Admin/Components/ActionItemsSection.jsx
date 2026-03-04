import React from "react";
import { Row, Col, Card, Statistic, Typography, Divider, Popover, Table } from "antd";
import { ClockCircleOutlined, RiseOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

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
            title="Expiring Work Orders"
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
            title="Work Orders on Priority"
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

