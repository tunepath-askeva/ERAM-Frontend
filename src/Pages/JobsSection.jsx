import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Button,
  Input,
  Row,
  Col,
  Badge,
  Divider,
  Empty,
  Tooltip,
  Avatar,
  Spin,
  Alert,
  Modal,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  FilterOutlined,
  EyeOutlined,
  HeartOutlined,
  FileExcelOutlined,
  CalendarOutlined,
  UserOutlined,
  LoginOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useGetBranchJobsQuery } from "../Slices/Users/UserApis.js";
import { useNavigate } from "react-router-dom";
import CVUploadSection from "./CVUploadSection.jsx";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const JOBS_PER_PAGE = 12;

const JobsSection = ({ currentBranch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleJobsCount, setVisibleJobsCount] = useState(JOBS_PER_PAGE);
  const [cvModalVisible, setCvModalVisible] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const navigate = useNavigate();

  const {
    data: jobsResponse,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useGetBranchJobsQuery(window.location.hostname);

  const jobs = jobsResponse?.jobs || [];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");

    if (jobId) {
      setTimeout(() => {
        const el = document.getElementById(`job-${jobId}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });

          el.style.border = "2px solid #da2c46";
          el.style.boxShadow = "0 0 25px 6px rgba(218,44,70,0.6)";

          setTimeout(() => {
            el.style.border = "2px solid transparent";
            el.style.boxShadow = "";
          }, 20000);
        }
      }, 300);
    }
  }, [jobsResponse]);

  const filteredJobs = jobs.filter(
    (job) =>
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobFunction?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.officeLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyIndustry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleJobs = filteredJobs.slice(0, visibleJobsCount);
  const hasMoreJobs = filteredJobs.length > visibleJobsCount;

  const handleSearch = (value) => {
    setSearchTerm(value);
    setVisibleJobsCount(JOBS_PER_PAGE);
  };

  const handleShowMore = () => {
    setVisibleJobsCount((prev) =>
      Math.min(prev + JOBS_PER_PAGE, filteredJobs.length)
    );
  };

  const handleJobClick = () => {
    navigate("/branch-login");
  };

  const openCvModal = (jobId) => {
    setSelectedJobId(jobId);
    setCvModalVisible(true);
  };

  const closeCvModal = () => {
    setSelectedJobId(null);
    setCvModalVisible(false);
  };

  const getJobTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "full-time":
      case "fulltime":
        return "#da2c46";
      case "part-time":
      case "parttime":
        return "#f59e0b";
      case "contract":
        return "#8b5cf6";
      case "internship":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const getWorkplaceColor = (workplace) => {
    switch (workplace?.toLowerCase()) {
      case "on-site":
        return "#da2c46";
      case "remote":
        return "#10b981";
      case "hybrid":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const formatSalary = (salaryMin, salaryMax, salaryType = "monthly") => {
    if (!salaryMin && !salaryMax) return "Salary not disclosed";

    const formatNumber = (num) => {
      return new Intl.NumberFormat("en-US").format(num);
    };

    const prefix = "SAR ";

    if (salaryMin && salaryMax) {
      return `${prefix}${formatNumber(salaryMin)} - ${formatNumber(
        salaryMax
      )} ${salaryType}`;
    } else if (salaryMin) {
      return `${prefix}${formatNumber(salaryMin)}+ ${salaryType}`;
    } else {
      return `Up to ${prefix}${formatNumber(salaryMax)} ${salaryType}`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

const JobCard = ({ job }) => (
  <Card
    id={`job-${job._id}`}
    hoverable
    style={{
      borderRadius: "12px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      border: "2px solid transparent",
      transition: "all 0.3s ease-in-out",
      cursor: "pointer",
      width: "100%",
      display: "flex",
      flexDirection: "column",
      height: "100%", // allow auto-adjust in grid
    }}
    bodyStyle={{
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    }}
  >
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title
              level={5}
              style={{
                margin: 0,
                color: "#1e293b",
                fontSize: "clamp(14px, 2vw, 16px)", // responsive font
                fontWeight: "600",
                lineHeight: "1.3",
              }}
              ellipsis={{ rows: 2, tooltip: job.title }}
            >
              {job.title}
            </Title>
          </div>
          {job.workOrderStatus === "urgent" && (
            <Badge
              status="error"
              text="Urgent"
              style={{
                color: "#dc2626",
                fontSize: "10px",
                fontWeight: "500",
                flexShrink: 0,
              }}
            />
          )}
        </div>

        {job.jobCode && (
          <Tag color="blue" style={{ fontSize: "11px", padding: "2px 6px" }}>
            {job.jobCode}
          </Tag>
        )}
      </div>

      {/* Function / Industry */}
      <Text
        style={{
          color: "#64748b",
          marginBottom: "10px",
          display: "block",
          fontSize: "13px",
          lineHeight: "1.2",
        }}
        ellipsis
      >
        {job.jobFunction || job.companyIndustry || "General"}
      </Text>

      {/* Tags (employment type, workplace) */}
      <Space wrap size="small" style={{ marginBottom: "10px" }}>
        <Tag
          color={getJobTypeColor(job.EmploymentType)}
          style={{
            borderRadius: "3px",
            fontSize: "11px",
            padding: "2px 6px",
          }}
        >
          {job.EmploymentType || "Full-time"}
        </Tag>
        <Tag
          color={getWorkplaceColor(job.workplace)}
          style={{
            borderRadius: "3px",
            fontSize: "11px",
            padding: "2px 6px",
          }}
        >
          {job.workplace}
        </Tag>
      </Space>

      {/* Location */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginBottom: "10px",
        }}
      >
        <EnvironmentOutlined style={{ color: "#10b981", fontSize: "12px" }} />
        <Text style={{ fontSize: "12px", color: "#374151" }} ellipsis>
          {job.officeLocation}
        </Text>
      </div>

      {/* Experience & Education */}
      <Space wrap size="small" style={{ marginBottom: "10px" }}>
        {job.experienceMin && job.experienceMax && (
          <Tag style={{ fontSize: "11px", padding: "2px 6px" }}>
            {job.experienceMin}-{job.experienceMax} yrs
          </Tag>
        )}
        {job.Education && (
          <Tag style={{ fontSize: "11px", padding: "2px 6px" }}>
            {job.Education}
          </Tag>
        )}
      </Space>

      {/* Description */}
      <Paragraph
        style={{
          color: "#64748b",
          fontSize: "12px",
          lineHeight: "1.4",
          marginBottom: "10px",
          flex: 1,
        }}
        ellipsis={{ rows: 3 }}
      >
        {job.description}
      </Paragraph>

      {/* Skills */}
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <Text strong style={{ fontSize: "11px", color: "#374151" }}>
            Skills:
          </Text>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {job.requiredSkills.slice(0, 2).map((skill, index) => (
              <Tag
                key={index}
                style={{
                  fontSize: "10px",
                  borderRadius: "3px",
                  padding: "2px 6px",
                }}
              >
                {skill.length > 12 ? skill.substring(0, 12) + "..." : skill}
              </Tag>
            ))}
            {job.requiredSkills.length > 2 && (
              <Tag style={{ fontSize: "10px", padding: "2px 6px" }}>
                +{job.requiredSkills.length - 2}
              </Tag>
            )}
          </div>
        </div>
      )}

      {/* Footer (salary + buttons) */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: "8px",
          borderTop: "1px solid #f1f5f9",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Salary + Date Info */}
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
          <Space size="small">
            <DollarOutlined style={{ color: "#3b82f6", fontSize: "11px" }} />
            <Text style={{ fontSize: "11px", color: "#374151", fontWeight: "500" }}>
              {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
            </Text>
          </Space>
          {job.deadlineDate && (
            <Space size="small">
              <CalendarOutlined style={{ color: "#f59e0b", fontSize: "11px" }} />
              <Text style={{ fontSize: "10px", color: "#f59e0b" }}>
                {new Date(job.deadlineDate).toLocaleDateString("en-GB")}
              </Text>
            </Space>
          )}
        </div>

        {/* Buttons (responsive row) */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
              border: "none",
              borderRadius: "6px",
              height: "36px",
              fontSize: "12px",
              fontWeight: "600",
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleJobClick();
            }}
          >
            Apply Now
          </Button>

          <Button
            type="primary"
            icon={<LoginOutlined />}
            style={{
              flex: 1,
              background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
              border: "none",
              borderRadius: "6px",
              height: "36px",
              fontSize: "12px",
              fontWeight: "600",
            }}
            onClick={(e) => {
              e.stopPropagation();
              openCvModal(job._id);
            }}
          >
            CV Apply
          </Button>
        </div>
      </div>
    </div>
  </Card>
);


  // Loading state
  if (jobsLoading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Spin size="large" />
        <div style={{ marginTop: "20px" }}>
          <Text style={{ color: "#64748b" }}>Loading job opportunities...</Text>
        </div>
      </div>
    );
  }

  // Error state
  if (jobsError) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <Alert
          message="Error Loading Jobs"
          description="There was an error loading job opportunities. Please try again."
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={refetchJobs}>
              Retry
            </Button>
          }
          style={{ maxWidth: "400px", margin: "0 auto" }}
        />
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ marginBottom: "32px", textAlign: "center" }}>
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 8px 24px rgba(218, 44, 70, 0.3)",
          }}
        >
          <TeamOutlined style={{ fontSize: "24px", color: "white" }} />
        </div>

        <Title
          level={2}
          style={{
            color: "#1e293b",
            marginBottom: "8px",
            fontSize: "32px",
            fontWeight: "700",
          }}
        >
          Career Opportunities
        </Title>

        <Text
          style={{
            color: "#64748b",
            fontSize: "16px",
            display: "block",
          }}
        >
          Join our {currentBranch?.name || "team"}
        </Text>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: "24px" }}>
        <Search
          placeholder="Search jobs by title, function, location, or industry..."
          allowClear
          enterButton={
            <Button
              icon={<SearchOutlined />}
              style={{
                background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                border: "none",
                color: "white",
              }}
            >
              Search
            </Button>
          }
          size="large"
          onSearch={handleSearch}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ borderRadius: "8px" }}
        />
      </div>

      {/* Job Stats */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          border: "1px solid #e2e8f0",
        }}
        bodyStyle={{ padding: "20px" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            textAlign: "center",
          }}
        >
          <div>
            <Title
              level={3}
              style={{ color: "#da2c46", margin: 0, fontSize: "24px" }}
            >
              {filteredJobs.length}
            </Title>
            <Text style={{ color: "#64748b", fontSize: "14px" }}>
              Open Positions
            </Text>
          </div>

          <Divider type="vertical" style={{ height: "40px" }} />
          <div>
            <Title
              level={3}
              style={{ color: "#da2c46", margin: 0, fontSize: "24px" }}
            >
              {
                [
                  ...new Set(filteredJobs.map((job) => job.companyIndustry)),
                ].filter(Boolean).length
              }
            </Title>
            <Text style={{ color: "#64748b", fontSize: "14px" }}>
              Industries
            </Text>
          </div>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div style={{ flex: 1 }}>
        {visibleJobs.length > 0 ? (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <Text style={{ color: "#64748b", fontSize: "14px" }}>
                Showing {visibleJobs.length} of {filteredJobs.length} job
                {filteredJobs.length !== 1 ? "s" : ""}
                {searchTerm && ` for "${searchTerm}"`}
              </Text>
              <Button
                type="text"
                icon={<FilterOutlined />}
                style={{ color: "#64748b" }}
              >
                Filter
              </Button>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
              {visibleJobs.map((job) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={8}
                  xl={4}
                  xxl={4}
                  key={job._id}
                  style={{ display: "flex" }}
                >
                  <div style={{ width: "100%" }}>
                    <JobCard job={job} jobId={job._id} />
                  </div>
                </Col>
              ))}
            </Row>

            {/* Show More Button */}
            {hasMoreJobs && (
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleShowMore}
                  style={{
                    background:
                      "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0 32px",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 16px rgba(218, 44, 70, 0.3)",
                  }}
                >
                  Show More Jobs
                </Button>
              </div>
            )}
          </>
        ) : (
          <Empty
            description={
              <span style={{ color: "#64748b" }}>
                {searchTerm
                  ? `No jobs found for "${searchTerm}"`
                  : "No job opportunities available at this time"}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ paddingTop: "60px" }}
          >
            {searchTerm && (
              <Button
                type="primary"
                onClick={() => {
                  setSearchTerm("");
                  setVisibleJobsCount(JOBS_PER_PAGE);
                }}
                style={{
                  background:
                    "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Show All Jobs
              </Button>
            )}
          </Empty>
        )}
      </div>

      {/* Footer CTA */}
      <div
        style={{
          marginTop: "40px",
          textAlign: "center",
          padding: "32px 0",
          backgroundColor: "#f8fafc",
          borderRadius: "12px",
        }}
      >
        <Title level={4} style={{ color: "#1e293b", marginBottom: "8px" }}>
          Can't find the right position?
        </Title>
        <Text
          style={{
            color: "#64748b",
            fontSize: "14px",
            display: "block",
            marginBottom: "16px",
          }}
        >
          Submit your resume and we'll contact you when suitable positions
          become available.
        </Text>
        <Button
          size="large"
          style={{
            borderColor: "#da2c46",
            color: "#da2c46",
            borderRadius: "8px",
            fontWeight: "500",
            padding: "0 24px",
            height: "40px",
          }}
          onClick={() => navigate(`/branch-login`)}
        >
          Submit Your Resume
        </Button>
      </div>

      <Modal
        open={cvModalVisible}
        onCancel={closeCvModal}
        footer={null}
        centered
        width={600}
      >
        <CVUploadSection currentBranch={currentBranch} jobId={selectedJobId} />
      </Modal>
    </div>
  );
};

export default JobsSection;
