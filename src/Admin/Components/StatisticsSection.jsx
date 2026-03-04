import React from "react";
import { Row, Col, Typography, Divider } from "antd";
import StatisticCard from "./StatisticCard";
import {
  UserOutlined,
  ProjectOutlined,
  FileDoneOutlined,
  ShoppingOutlined,
  TeamOutlined,
  FunnelPlotOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

const StatisticsSection = ({ statistics, hoverData, primaryColor = "#da2c46" }) => {
  if (!statistics) return null;

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
          Main Statistics
        </Title>
        <Divider style={{ margin: "8px 0 16px 0", borderColor: `${primaryColor}30` }} />
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            title="Total Clients"
            value={statistics.totalClients ?? 0}
            icon={UserOutlined}
            iconColor="#1890ff"
            gradientColors="linear-gradient(135deg, #fff 0%, #f0f9ff 100%)"
            hoverData={hoverData?.clientSummary}
            hoverColumns={[
              { title: "Branch", dataIndex: "branchName", key: "branchName" },
              { title: "Client", dataIndex: "clientName", key: "clientName" },
              { title: "Projects", dataIndex: "numberOfProjects", key: "numberOfProjects" },
              { title: "Active WOs", dataIndex: "numberOfActiveWOs", key: "numberOfActiveWOs" },
              { title: "Required", dataIndex: "totalCandidatesReq", key: "totalCandidatesReq" },
              { title: "Hired", dataIndex: "hired", key: "hired" },
              { title: "In Pipeline", dataIndex: "staged", key: "staged" },
              { title: "Pending", dataIndex: "pending", key: "pending" },
            ]}
            hoverTitle="Client Summary"
            primaryColor={primaryColor}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            title="Total Projects"
            value={statistics.totalProjects ?? 0}
            icon={ProjectOutlined}
            iconColor="#faad14"
            gradientColors="linear-gradient(135deg, #fff 0%, #fffbf0 100%)"
            hoverData={hoverData?.projectSummary}
            hoverColumns={[
              { title: "Branch", dataIndex: "branchName", key: "branchName" },
              { title: "Client", dataIndex: "clientName", key: "clientName" },
              { title: "Project", dataIndex: "projectName", key: "projectName" },
              { title: "Active WOs", dataIndex: "numberOfActiveWOs", key: "numberOfActiveWOs" },
              { title: "Required", dataIndex: "totalCandidatesReq", key: "totalCandidatesReq" },
              { title: "Hired", dataIndex: "hired", key: "hired" },
              { title: "In Pipeline", dataIndex: "staged", key: "staged" },
              { title: "Pending", dataIndex: "pending", key: "pending" },
            ]}
            hoverTitle="Project Summary"
            primaryColor={primaryColor}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            title="Active Work Orders"
            value={statistics.activeWorkOrders ?? 0}
            icon={FileDoneOutlined}
            iconColor="#52c41a"
            gradientColors="linear-gradient(135deg, #fff 0%, #f6ffed 100%)"
            hoverData={hoverData?.activeWOSummary}
            hoverColumns={[
              { title: "Branch", dataIndex: "branchName", key: "branchName" },
              { title: "Client", dataIndex: "clientName", key: "clientName" },
              { title: "Project", dataIndex: "projectName", key: "projectName" },
              { title: "WO Name", dataIndex: "woName", key: "woName" },
              { title: "Required", dataIndex: "totalCandidatesReq", key: "totalCandidatesReq" },
              { title: "Hired", dataIndex: "hired", key: "hired" },
              { title: "In Pipeline", dataIndex: "staged", key: "staged" },
              { title: "Pending", dataIndex: "pending", key: "pending" },
            ]}
            hoverTitle="Active Work Orders Summary"
            primaryColor={primaryColor}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            title="Active Requisitions"
            value={statistics.activeRequisitions ?? 0}
            icon={ShoppingOutlined}
            iconColor={primaryColor}
            gradientColors="linear-gradient(135deg, #fff 0%, #fef7f7 100%)"
            description="Approved, not converted"
            hoverData={hoverData?.requisitionSummary}
            hoverColumns={[
              { title: "Branch", dataIndex: "branchName", key: "branchName" },
              { title: "Requisition No", dataIndex: "requisitionNo", key: "requisitionNo" },
              { title: "Reference No", dataIndex: "referenceNo", key: "referenceNo" },
              { title: "Title", dataIndex: "title", key: "title" },
              { title: "Project", dataIndex: "projectName", key: "projectName" },
            ]}
            hoverTitle="Active Requisitions Summary"
            primaryColor={primaryColor}
          />
        </Col>
      </Row>
    </>
  );
};

export const CandidateMetricsSection = ({ statistics, primaryColor = "#da2c46" }) => {
  if (!statistics) return null;

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
          Candidate Metrics
        </Title>
        <Divider style={{ margin: "8px 0 16px 0", borderColor: `${primaryColor}30` }} />
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            title="Total Candidates Needed"
            value={statistics.totalCandidatesNeeded ?? 0}
            icon={TeamOutlined}
            iconColor="#1890ff"
            gradientColors="linear-gradient(135deg, #fff 0%, #f0f9ff 100%)"
            description="Based on work orders"
            primaryColor={primaryColor}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            title="Candidates in Pipeline"
            value={statistics.totalCandidatesInPipeline ?? 0}
            icon={FunnelPlotOutlined}
            iconColor="#faad14"
            gradientColors="linear-gradient(135deg, #fff 0%, #fff7e6 100%)"
            description="In stage process"
            primaryColor={primaryColor}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            title="Total Hired/Converted"
            value={statistics.totalHired ?? 0}
            icon={CheckCircleOutlined}
            iconColor="#52c41a"
            gradientColors="linear-gradient(135deg, #fff 0%, #f6ffed 100%)"
            description="Candidates hired"
            primaryColor={primaryColor}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticCard
            title="Pending Requirements"
            value={statistics.pendingRequirements ?? 0}
            icon={ClockCircleOutlined}
            iconColor="#ff4d4f"
            gradientColors="linear-gradient(135deg, #fff 0%, #fff1f0 100%)"
            description="Still needed"
            primaryColor={primaryColor}
          />
        </Col>
      </Row>
    </>
  );
};

export default StatisticsSection;

