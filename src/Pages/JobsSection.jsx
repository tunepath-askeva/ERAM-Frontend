import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Alert,
  Modal,
  Pagination,
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
  FireOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  useGetBranchJobsQuery,
  useGetTrendingSkillsQuery,
} from "../Slices/Users/UserApis.js";
import { useNavigate } from "react-router-dom";
import CVUploadSection from "./CVUploadSection.jsx";
import SkeletonLoader from "../Global/SkeletonLoader.jsx";
import JobDetailsModal from "../Components/JobDetailsModa.jsx";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const JOBS_PER_PAGE = 12;

// Custom hook for debounced value
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const JobsSection = ({ currentBranch }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [cvModalVisible, setCvModalVisible] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsJobId, setDetailsJobId] = useState(null);

  const navigate = useNavigate();
  const trendingSkillsRef = useRef(null);
  const trendingJobsRef = useRef(null);

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // API query with pagination and search
  const {
    data: jobsResponse,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
    isFetching,
  } = useGetBranchJobsQuery({
    domain: window.location.hostname,
    page: currentPage,
    limit: JOBS_PER_PAGE,
    search: debouncedSearchTerm,
  });

  const { data: skillsResponse } = useGetTrendingSkillsQuery(
    window.location.hostname
  );

  const jobs = jobsResponse?.jobs || [];
  const totalJobs = jobsResponse?.total || 0;
  const totalPages = jobsResponse?.totalPages || 12;
  const apiTrendingSkills = skillsResponse?.trendingSkills || [];
  const apiTrendingJobs =
    skillsResponse?.last15Jobs?.map((job) => job.title) || [];
  const displayTrendingJobs = apiTrendingJobs;

  console.log("Jobs Response:", jobsResponse);
  console.log("Current Page:", currentPage);
  console.log("Total Jobs:", totalJobs);
  console.log("Search Term:", debouncedSearchTerm);

  // Reset to first page when search changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get("jobId");

    if (jobId && jobs.length > 0) {
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
  }, [jobsResponse, jobs]);

  useEffect(() => {
    const skillsContainer = trendingSkillsRef.current;
    const jobsContainer = trendingJobsRef.current;

    if (skillsContainer) {
      const scrollSkills = () => {
        if (
          skillsContainer.scrollLeft >=
          skillsContainer.scrollWidth - skillsContainer.clientWidth
        ) {
          skillsContainer.scrollLeft = 0;
        } else {
          skillsContainer.scrollLeft += 1;
        }
      };

      const skillsInterval = setInterval(scrollSkills, 50);
      return () => clearInterval(skillsInterval);
    }
  }, []);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJobClick = () => {
    navigate("/branch-login");
  };

  const openDetailsModal = (jobId) => {
    setDetailsJobId(jobId);
    setDetailsVisible(true);
  };

  const closeDetailsModal = () => {
    setDetailsVisible(false);
    setDetailsJobId(null);
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
        height: "100%",
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
                  fontSize: "clamp(14px, 2vw, 16px)",
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "6px",
            }}
          >
            <Space size="small" align="center">
              <DollarOutlined style={{ color: "#3b82f6", fontSize: "12px" }} />
              <Text
                style={{
                  fontSize: "12px",
                  color: "#374151",
                  fontWeight: "500",
                }}
              >
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
              </Text>
            </Space>

            {job.createdAt && (
              <Space size="small" align="center">
                <CalendarOutlined
                  style={{ color: "#f59e0b", fontSize: "12px" }}
                />
                <Text style={{ fontSize: "11px", color: "#f59e0b" }}>
                  Posted: {new Date(job.createdAt).toLocaleDateString("en-GB")}
                </Text>
              </Space>
            )}

            {job.createdAt && (
              <Space size="small" align="center">
                <CalendarOutlined
                  style={{ color: "#da2c46", fontSize: "12px" }}
                />
                <Text style={{ fontSize: "11px", color: "#da2c46" }}>
                  Deadline:{" "}
                  {new Date(job.createdAt).toLocaleDateString("en-GB")}
                </Text>
              </Space>
            )}
          </div>

          {/* Buttons Row */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            <Button
              type="primary"
              icon={<LoginOutlined />}
              style={{
                flex: 1,
                minWidth: "120px",
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
                minWidth: "120px",
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

            <Button
              type="default"
              icon={<EyeOutlined />}
              style={{
                flex: 1,
                minWidth: "120px",
                borderRadius: "6px",
                height: "36px",
                fontSize: "12px",
                fontWeight: "600",
              }}
              onClick={(e) => {
                e.stopPropagation();
                openDetailsModal(job._id);
              }}
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const TrendingSkillsCarousel = () => {
    const createInfiniteArray = (arr, minLength = 20) => {
      if (!arr || arr.length === 0) return [];
      const result = [...arr];
      while (result.length < minLength) {
        result.push(...arr);
      }
      return result;
    };

    const infiniteSkills = createInfiniteArray(apiTrendingSkills);

    if (infiniteSkills.length === 0) return null;

    return (
      <div className="trending-section">
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
        >
          <FireOutlined style={{ color: "#ff6b35", marginRight: "8px" }} />
          <Text strong style={{ color: "#374151", fontSize: "14px" }}>
            Trending Skills
          </Text>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-track skills-track">
            {infiniteSkills.map((skill, index) => (
              <Tag key={`skill-${index}`} className="carousel-item">
                {skill}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TrendingJobsCarousel = () => {
    const createInfiniteArray = (arr, minLength = 20) => {
      if (!arr || arr.length === 0) return [];
      const result = [...arr];
      while (result.length < minLength) {
        result.push(...arr);
      }
      return result;
    };

    const validJobTitles = displayTrendingJobs.filter(
      (job) => job && job.trim().length > 0
    );
    const infiniteJobs = createInfiniteArray(validJobTitles);

    if (infiniteJobs.length === 0) return null;

    return (
      <div className="trending-section">
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}
        >
          <TrophyOutlined style={{ color: "#d69e2e", marginRight: "8px" }} />
          <Text strong style={{ color: "#374151", fontSize: "14px" }}>
            Trending Jobs
          </Text>
        </div>

        <div className="carousel-wrapper">
          <div className="carousel-track jobs-track">
            {infiniteJobs.map((job, index) => (
              <Tag key={`job-${index}`} className="carousel-item">
                {job}
              </Tag>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (jobsLoading && currentPage === 1) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <SkeletonLoader />
      </div>
    );
  }

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
          placeholder="Search jobs by title, function......"
          allowClear
          enterButton={
            <Button
              icon={<SearchOutlined />}
              style={{
                background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                border: "none",
                color: "white",
              }}
              loading={isFetching}
            >
              Search
            </Button>
          }
          size="large"
          onSearch={handleSearch}
          onChange={handleSearchChange}
          style={{ borderRadius: "8px" }}
          value={searchTerm}
        />
      </div>

      {apiTrendingSkills.length > 0 && (
        <Col style={{ marginBottom: 15, marginTop: 5 }}>
          <TrendingSkillsCarousel />
        </Col>
      )}

      {displayTrendingJobs.length > 0 && (
        <Col>
          <TrendingJobsCarousel style={{ marginBottom: 15, marginTop: 15 }} />
        </Col>
      )}

      {/* Job Stats */}
      <Card
        style={{
          marginTop: "24px",
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
              {totalJobs}
            </Title>
            <Text style={{ color: "#64748b", fontSize: "14px" }}>
              Total Positions
            </Text>
          </div>

          <Divider type="vertical" style={{ height: "40px" }} />
          <div>
            <Title
              level={3}
              style={{ color: "#da2c46", margin: 0, fontSize: "24px" }}
            >
              {jobs.length}
            </Title>
            <Text style={{ color: "#64748b", fontSize: "14px" }}>
              Current Page
            </Text>
          </div>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div style={{ flex: 1, position: "relative" }}>
        {/* Loading overlay */}
        {isFetching && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(255, 255, 255, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
          >
            <SkeletonLoader />
          </div>
        )}

        {jobs.length > 0 ? (
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
                Showing {(currentPage - 1) * JOBS_PER_PAGE + 1} to{" "}
                {Math.min(currentPage * JOBS_PER_PAGE, totalJobs)} of{" "}
                {totalJobs} job
                {totalJobs !== 1 ? "s" : ""}
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
              {jobs.map((job) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "32px",
                  marginBottom: "24px",
                }}
              >
                <Pagination
                  current={currentPage}
                  total={totalJobs}
                  pageSize={JOBS_PER_PAGE}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} jobs`
                  }
                  style={{
                    "& .ant-pagination-item-active": {
                      backgroundColor: "#da2c46",
                      borderColor: "#da2c46",
                    },
                    "& .ant-pagination-item-active a": {
                      color: "white",
                    },
                  }}
                />
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
                  setCurrentPage(1);
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
        <CVUploadSection
          currentBranch={currentBranch}
          jobId={selectedJobId}
          closeCvModal={closeCvModal}
        />
      </Modal>

      <JobDetailsModal
        jobId={detailsJobId}
        visible={detailsVisible}
        onClose={closeDetailsModal}
      />

      <style jsx>
        {`
          .trending-section {
            margin-bottom: 20px;
          }

          .carousel-wrapper {
            overflow: hidden;
            position: relative;
            width: 100%;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 12px 0;
            mask-image: linear-gradient(
              to right,
              transparent,
              black 5%,
              black 95%,
              transparent
            );
            -webkit-mask-image: linear-gradient(
              to right,
              transparent,
              black 5%,
              black 95%,
              transparent
            );
          }

          .carousel-track {
            display: flex;
            gap: 12px;
            width: max-content;
            padding: 0 16px;
          }

          .carousel-item {
            flex-shrink: 0;
            padding: 6px 16px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            color: #fff;
            border-radius: 20px;
            background: linear-gradient(135deg, #da2c46 0%, #a51632 100%);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .skills-track {
            animation: scrollRight 60s linear infinite;
          }

          .jobs-track {
            animation: scrollLeft 60s linear infinite;
          }

          @keyframes scrollLeft {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }

          @keyframes scrollRight {
            0% {
              transform: translateX(-50%);
            }
            100% {
              transform: translateX(0);
            }
          }

          .carousel-track:hover {
            animation-play-state: paused;
          }

          .carousel-item:hover {
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(218, 44, 70, 0.3);
          }

          @media (max-width: 768px) {
            .skills-track {
              animation: scrollRight 40s linear infinite;
            }

            .jobs-track {
              animation: scrollLeft 40s linear infinite;
            }
          }
        `}
      </style>
    </div>
  );
};

export default JobsSection;
