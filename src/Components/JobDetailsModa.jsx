import React from "react";
import {
  Modal,
  Spin,
  Typography,
  Tag,
  Space,
  Descriptions,
  Divider,
  Grid,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { useGetBranchJobByIdQuery } from "../Slices/Users/UserApis";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

const JobDetailsModal = ({ jobId, visible, onClose }) => {
  const { data, isLoading, error } = useGetBranchJobByIdQuery(jobId, {
    skip: !jobId,
  });

  const job = data?.job;
  const screens = useBreakpoint();

  const modalWidth = screens.xs ? "100%" : 800;

  // Column count adjusts dynamically
  const columnCount = screens.xs || screens.sm ? 1 : 2;

  // Helper function to split text into bullet points
  const splitIntoPoints = (text) => {
    if (!text || !text.trim()) return [];
    
    let points = [];
    
    // First, check for numbered lists (1. 2. 3.)
    if (text.match(/^\d+\./m)) {
      points = text.split(/(?=^\d+\.\s)/m)
        .map(item => item.trim().replace(/^\d+\.\s*/, ""))
        .filter(item => item.trim());
    }
    // Then check for double newlines (paragraphs)
    else if (text.includes("\n\n")) {
      points = text.split(/\n\n+/)
        .map(item => item.trim())
        .filter(item => item.trim());
    }
    // Then check for single newlines
    else if (text.includes("\n")) {
      points = text.split(/\n+/)
        .map(item => item.trim())
        .filter(item => item.trim());
    }
    // Finally, split by sentence boundaries (periods followed by space and capital letter)
    else {
      // Split by period followed by space and capital letter (new sentence)
      // But avoid splitting on abbreviations like "Dr.", "Mr.", "Inc.", etc.
      // Also avoid splitting on decimal numbers like "3.5"
      const sentencePattern = /(?<=[.!?])\s+(?=[A-Z][a-z])/;
      points = text.split(sentencePattern)
        .map(item => item.trim())
        .filter(item => item.trim() && item.length > 0);
      
      // If splitting didn't create meaningful points, try splitting by periods more generally
      if (points.length <= 1) {
        // Split by period-space pattern, but be more careful
        points = text.split(/(?<=[.!?])\s+/)
          .map(item => item.trim())
          .filter(item => item.trim() && item.length > 3); // Filter out very short fragments
      }
      
      // If still no good split, keep as single point
      if (points.length === 0) {
        points = [text.trim()];
      }
    }
    
    // Clean up each point: remove leading numbers, extra spaces, ensure it ends properly
    return points
      .map(item => {
        // Remove leading numbers and dots (e.g., "1. ", "2. ")
        item = item.replace(/^\d+\.\s*/, "");
        // Remove leading dashes or bullets
        item = item.replace(/^[-•]\s*/, "");
        // Trim whitespace
        item = item.trim();
        // Ensure it ends with a period if it's a complete sentence (and doesn't already end with punctuation)
        if (item && !item.match(/[.!?]$/) && item.length > 10) {
          item = item + ".";
        }
        return item;
      })
      .filter(item => item && item.length > 0);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={modalWidth}
      bodyStyle={{
        maxHeight: "70vh", // prevent modal from growing too tall
        overflowY: "auto",
        padding: screens.xs ? "12px" : "24px",
      }}
      style={{ top: screens.xs ? 10 : 50 }}
      title={<Title level={5}>{job?.title || "Job Details"}</Title>}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Text type="danger">Failed to load job details</Text>
      ) : (
        <>
          {/* Basic Info */}
          <Descriptions bordered size="small" column={columnCount}>
            <Descriptions.Item label="Job Code">
              {job?.jobCode}
            </Descriptions.Item>
            <Descriptions.Item label="Workplace">
              {job?.workplace}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {job?.officeLocation}
            </Descriptions.Item>
            <Descriptions.Item label="Employment Type">
              {job?.EmploymentType}
            </Descriptions.Item>
            <Descriptions.Item label="Industry">
              {job?.companyIndustry}
            </Descriptions.Item>
            <Descriptions.Item label="Function">
              {job?.jobFunction}
            </Descriptions.Item>
            <Descriptions.Item label="Education">
              {job?.Education}
            </Descriptions.Item>
            <Descriptions.Item label="Experience">
              {job?.experienceMin && job?.experienceMax
                ? `${job.experienceMin} - ${job.experienceMax} years`
                : job?.experienceMin
                ? `${job.experienceMin}+ years`
                : job?.experienceMax
                ? `Up to ${job.experienceMax} years`
                : "Not mentioned"}
            </Descriptions.Item>
            {job?.isSalaryVisible && (job?.salaryMin || job?.salaryMax) && (
              <Descriptions.Item label="Salary">
                {job?.salaryMin} - {job?.salaryMax} ({job?.salaryType})
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Nationality">
              {job?.nationality}
            </Descriptions.Item>
            <Descriptions.Item label="Visa Category">
              {job?.visacategory}
            </Descriptions.Item>
            <Descriptions.Item label="Visa Type">
              {job?.visacategorytype}
            </Descriptions.Item>
            <Descriptions.Item label="Candidates Needed">
              {job?.numberOfCandidate}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {job?.isActive}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Timeline */}
          <Descriptions bordered size="small" column={columnCount}>
            <Descriptions.Item label="Deadline">
              {job?.deadlineDate
                ? new Date(job.deadlineDate).toLocaleDateString()
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Text Fields */}
          {job?.description && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                Description:
              </Text>
              <Paragraph style={{ fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                {job.description}
              </Paragraph>
            </div>
          )}

          {job?.jobRequirements && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                Job Requirements:
              </Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {splitIntoPoints(job.jobRequirements).map((requirement, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        color: "#444",
                      }}
                    >
                      <CheckCircleOutlined
                        style={{
                          color: "#52c41a",
                          marginTop: "2px",
                          flexShrink: 0,
                          fontSize: "14px",
                        }}
                      />
                      <span>{requirement}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {job?.keyResponsibilities && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                Key Responsibilities:
              </Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {splitIntoPoints(job.keyResponsibilities).map((responsibility, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        color: "#444",
                      }}
                    >
                      <CheckCircleOutlined
                        style={{
                          color: "#52c41a",
                          marginTop: "2px",
                          flexShrink: 0,
                          fontSize: "14px",
                        }}
                      />
                      <span>{responsibility}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {job?.qualification && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                Qualification:
              </Text>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {splitIntoPoints(job.qualification).map((qualification, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        color: "#444",
                      }}
                    >
                      <CheckCircleOutlined
                        style={{
                          color: "#52c41a",
                          marginTop: "2px",
                          flexShrink: 0,
                          fontSize: "14px",
                        }}
                      />
                      <span>{qualification}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <Divider />

          {/* Tags */}
          {job?.requiredSkills?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong>Required Skills:</Text>
              <Space wrap style={{ marginTop: "8px" }}>
                {job.requiredSkills.map((skill, i) => (
                  <Tag key={i} color="blue">
                    {skill}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          {job?.languagesRequired?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong>Languages Required:</Text>
              <Space wrap style={{ marginTop: "8px" }}>
                {job.languagesRequired.map((lang, i) => (
                  <Tag key={i} color="purple">
                    {lang}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          {job?.benefits?.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <Text strong style={{ fontSize: "14px", display: "block", marginBottom: "8px" }}>
                Benefits:
              </Text>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#444",
                }}
              >
                {job.benefits.map((benefit, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default JobDetailsModal;
