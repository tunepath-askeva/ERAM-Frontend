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
              {job?.experienceMin} - {job?.experienceMax} years
            </Descriptions.Item>
            <Descriptions.Item label="Salary">
              {job?.salaryMin} - {job?.salaryMax} ({job?.salaryType})
            </Descriptions.Item>
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
          <Paragraph>
            <Text strong>Description:</Text>
            <br />
            {job?.description || "N/A"}
          </Paragraph>

          <Paragraph>
            <Text strong>Job Requirements:</Text>
            <br />
            {job?.jobRequirements || "N/A"}
          </Paragraph>

          <Paragraph>
            <Text strong>Key Responsibilities:</Text>
            <br />
            {job?.keyResponsibilities || "N/A"}
          </Paragraph>

          <Paragraph>
            <Text strong>Qualification:</Text>
            <br />
            {job?.qualification || "N/A"}
          </Paragraph>

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
              <Text strong>Benefits:</Text>
              <Space wrap style={{ marginTop: "8px" }}>
                {job.benefits.map((benefit, i) => (
                  <Tag key={i} color="green">
                    {benefit}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default JobDetailsModal;
