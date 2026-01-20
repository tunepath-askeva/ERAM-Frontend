import React from "react";
import { Card, Descriptions, Tag, Typography, Avatar } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const OverviewTab = ({ appliedJob, workOrder }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case "hired":
        return { icon: <CheckCircleOutlined />, color: "green" };
      case "pipeline":
        return { icon: <ClockCircleOutlined />, color: "blue" };
      case "shortlisted":
        return { icon: <CheckCircleOutlined />, color: "cyan" };
      case "interview":
        return { icon: <ClockCircleOutlined />, color: "purple" };
      case "rejected":
        return { icon: <ExclamationCircleOutlined />, color: "red" };
      case "withdrawn":
        return { icon: <ExclamationCircleOutlined />, color: "orange" };
      case "completed":
        return { icon: <CheckCircleOutlined />, color: "green" };
      case "pending":
        return { icon: <ClockCircleOutlined />, color: "orange" };
      default:
        return { icon: <ClockCircleOutlined />, color: "blue" };
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <Avatar
          src={"https://via.placeholder.com/64"}
          size={64}
          style={{ backgroundColor: "#f0f2f5" }}
        >
          {workOrder.companyIndustry?.[0]?.toUpperCase() || "C"}
        </Avatar>
        <div>
          <Title level={3} style={{ marginBottom: "4px" }}>
            {workOrder.title}
          </Title>
          <Text strong style={{ fontSize: "16px" }}>
            {workOrder.companyIndustry || "Company"}
          </Text>
        </div>
      </div>

      <Descriptions
        bordered
        column={1}
        labelStyle={{ fontWeight: "600", width: "200px" }}
      >
        <Descriptions.Item label="Job Code">
          {workOrder.jobCode || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Location">
          {workOrder.officeLocation || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Work Type">
          <Tag color={workOrder.workplace === "remote" ? "green" : "blue"}>
            {workOrder.workplace === "remote"
              ? "Remote"
              : workOrder.workplace === "on-site"
              ? "On-site"
              : "Hybrid"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Company Industry">
          {workOrder.companyIndustry || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Salary Range">
          {workOrder.isSalaryVisible && workOrder.salaryMin && workOrder.salaryMax
            ? `${workOrder.salaryMin} - ${workOrder.salaryMax} (${
                workOrder.salaryType || "monthly"
              })`
            : "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Experience Required">
          {workOrder.experienceMin && workOrder.experienceMax
            ? `${workOrder.experienceMin} - ${workOrder.experienceMax} years`
            : "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Education">
          <Tag color="purple">
            {workOrder.Education?.toUpperCase() || "Not specified"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Qualification">
          {workOrder.qualification || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Start Date">
          {workOrder.startDate
            ? new Date(workOrder.startDate).toLocaleDateString()
            : "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="End Date">
          {workOrder.endDate
            ? new Date(workOrder.endDate).toLocaleDateString()
            : "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Visa Category">
          {workOrder.visacategory || "Not specified"}
        </Descriptions.Item>
        <Descriptions.Item label="Visa Category Type">
          <Tag color="orange">
            {workOrder.visacategorytype?.toUpperCase() || "Not specified"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Application Status">
          <Tag
            color={getStatusInfo(appliedJob.status).color}
            icon={getStatusInfo(appliedJob.status).icon}
          >
            {appliedJob.status?.replace("_", " ").toUpperCase() || "PENDING"}
          </Tag>
        </Descriptions.Item>
        {appliedJob.offerDetails?.length > 0 && (
          <Descriptions.Item label="Offer Status">
            <Tag
              color={
                appliedJob.offerDetails[0].currentStatus === "offer-accepted"
                  ? "green"
                  : appliedJob.offerDetails[0].currentStatus ===
                    "offer-rejected"
                  ? "red"
                  : "orange"
              }
              icon={
                appliedJob.offerDetails[0].currentStatus ===
                "offer-accepted" ? (
                  <CheckCircleOutlined />
                ) : (
                  <ClockCircleOutlined />
                )
              }
            >
              {appliedJob.offerDetails[0].currentStatus
                ?.toUpperCase()
                .replace("-", " ") || "PENDING"}
            </Tag>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Applied Status">
          <Tag color={appliedJob.isSourced === "true" ? "green" : "red"}>
            {appliedJob.isSourced === "true" ? "SOURCED" : "APPLIED"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Selected Moving Comment">
          {appliedJob.selectedMovingComment || "No comment provided"}
        </Descriptions.Item>
        <Descriptions.Item label="Applied Date">
          {appliedJob.createdAt
            ? new Date(appliedJob.createdAt).toLocaleDateString()
            : "Not available"}
        </Descriptions.Item>
        <Descriptions.Item label="Last Updated">
          {appliedJob.updatedAt
            ? new Date(appliedJob.updatedAt).toLocaleDateString()
            : "Not available"}
        </Descriptions.Item>
        <Descriptions.Item label="Skills Required">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {workOrder.requiredSkills?.length > 0 ? (
              workOrder.requiredSkills.map((skill, index) => (
                <Tag key={index} color="blue">
                  {skill}
                </Tag>
              ))
            ) : (
              <Text type="secondary">No specific skills mentioned</Text>
            )}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Job Description">
          {workOrder.description || "No description provided"}
        </Descriptions.Item>
        <Descriptions.Item label="Key Responsibilities">
          <div style={{ whiteSpace: "pre-line" }}>
            {workOrder.keyResponsibilities || "No responsibilities listed"}
          </div>
        </Descriptions.Item>
        {workOrder.benefits?.length > 0 && (
          <Descriptions.Item label="Benefits">
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {workOrder.benefits.map((benefit, index) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Required Documents">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {workOrder.documents?.length > 0 ? (
              workOrder.documents.map((doc, index) => (
                <Tag key={doc._id || index} color="cyan">
                  {doc.name} {doc.isMandatory && <Text type="danger">*</Text>}
                </Tag>
              ))
            ) : (
              <Text type="secondary">No documents required</Text>
            )}
          </div>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};

export default OverviewTab;
