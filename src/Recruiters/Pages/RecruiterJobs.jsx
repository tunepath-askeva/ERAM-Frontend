import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Empty,
  Space,
  Badge,
  Modal,
  message,
  Divider,
  List,
  Spin,
  Input,
  Select,
  Avatar,
  Pagination,
  Result,
  Skeleton,
  Drawer,
} from "antd";
import {
  SearchOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  TeamOutlined,
  EyeOutlined,
  BankOutlined,
  CalendarOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  DownOutlined,
  EditOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetRecruiterJobsQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const RecruiterJobs = () => {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [currentRecruiterEmail, setCurrentRecruiterEmail] = useState("");
  const navigate = useNavigate();

  const { data: apiData, isLoading, error } = useGetRecruiterJobsQuery();

  const primaryColor = "#da2c46";

  useEffect(() => {
    if (apiData?.jobs) {
      const transformedJobs = transformJobData(apiData.jobs);
      setFilteredJobs(transformedJobs);
    }
  }, [apiData]);

  useEffect(() => {
    const recruiterInfo = JSON.parse(
      localStorage.getItem("recruiterInfo") || "{}"
    );
    setCurrentRecruiterEmail(recruiterInfo.email || "");
  }, []);

  const transformJobData = (jobs) => {
    if (!jobs || !Array.isArray(jobs)) return [];

    return jobs.map((job) => ({
      _id: job._id || "",
      title: job.title || "No title",
      company: job.project?.name || "Company Name",
      location: job.officeLocation || job.workplace || "Location not specified",
      workType:
        job.workplace === "on-site"
          ? "On-site"
          : job.workplace === "remote"
          ? "Remote"
          : "Hybrid",
      employmentType: job.EmploymentType || "Full-time",
      experience: job.Experience ? `${job.Experience} years` : "Not specified",
      salary:
        job.salaryType === "annual" && job.annualSalary
          ? `$${parseInt(job.annualSalary).toLocaleString()}/year`
          : job.salaryType === "monthly" && job.monthlySalary
          ? `$${job.monthlySalary}/month`
          : "Salary not disclosed",
      postedDate: job.createdAt,
      skills: job.requiredSkills || [],
      description: job.description || "No description available",
      requirements: job.jobRequirements ? [job.jobRequirements] : [],
      isActive: job.isActive === "active",
      jobCode: job.jobCode,
      applications: job.numberOfCandidate || 0,
      pipeline: job.pipeline?.[0]?.name || "No Pipeline",
      stages: job.pipeline?.[0]?.stages?.map((stage) => stage.name) || [],
      assignedRecruiters: job.assignedRecruiters || [],
      deadline: job.deadlineDate,
    }));
  };

  const handleJobClick = (job) => {
    navigate(`/recruiter-jobs/${job._id}`);
  };

  const handleDeactivateJob = (job, e) => {
    e.stopPropagation();
    Modal.confirm({
      title: "Confirm Deactivation",
      content: `Are you sure you want to deactivate "${job.title}"?`,
      okText: "Deactivate",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        message.success(`Deactivation request sent for ${job.title}`);
        // Here you would call your API to deactivate the job
      },
    });
  };

  const handleActivateJob = (job, e) => {
    e.stopPropagation();
    Modal.confirm({
      title: "Confirm Activation",
      content: `Are you sure you want to activate "${job.title}"?`,
      okText: "Activate",
      cancelText: "Cancel",
      onOk() {
        message.success(`Activation request sent for ${job.title}`);
        // Here you would call your API to activate the job
      },
    });
  };

  // Updated function to only check assignedRecruiters array
  const isRecruiterAssigned = (assignedRecruiters) => {
    return assignedRecruiters.some(
      (recruiter) =>
        recruiter.email.toLowerCase() === currentRecruiterEmail.toLowerCase()
    );
  };

  const handleEditJob = (job, e) => {
    e.stopPropagation();
    navigate(`/recruiter-jobs/edit/${job._id}`, { state: { jobData: job } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "today";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 90) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getCurrentPageJobs = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredJobs
      .filter((job) => {
        const matchesSearch =
          searchText === "" ||
          job.title.toLowerCase().includes(searchText.toLowerCase()) ||
          job.company.toLowerCase().includes(searchText.toLowerCase()) ||
          job.location.toLowerCase().includes(searchText.toLowerCase());

        const matchesStatus =
          filterStatus === "all" ||
          (filterStatus === "active" && job.isActive) ||
          (filterStatus === "inactive" && !job.isActive);

        return matchesSearch && matchesStatus;
      })
      .slice(startIndex, endIndex);
  };

  if (isLoading) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <Result
          status="404"
          title="No Jobs assigned yet for you."
          extra={[
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              key="retry"
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              }}
            >
              Retry
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <Title
          level={2}
          style={{
            margin: 0,
            color: "#2c3e50",
            fontSize: "clamp(20px, 4vw, 28px)",
            lineHeight: "1.2",
          }}
        >
          My Job Assignments
        </Title>
        <Text
          type="secondary"
          style={{
            display: "block",
            marginTop: 8,
            fontSize: "clamp(12px, 2.5vw, 14px)",
            padding: "0 16px",
          }}
        >
          Manage your assigned recruitment pipelines and candidates
        </Text>
      </div>

      <Card
        style={{
          marginBottom: "16px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={16} md={16} lg={16} xl={16}>
            <Input
              placeholder="Search jobs by title, company or location"
              size="large"
              prefix={<SearchOutlined style={{ color: primaryColor }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={12} sm={4} md={4} lg={4} xl={4}>
            <Button
              type="primary"
              size="large"
              icon={<FilterOutlined />}
              onClick={() => setMobileFiltersVisible(true)}
              style={{
                width: "100%",
                background: primaryColor,
                border: "none",
              }}
            >
              Filters
            </Button>
          </Col>
        </Row>
      </Card>

      <Drawer
        title="Filter Jobs"
        placement="bottom"
        closable={true}
        onClose={() => setMobileFiltersVisible(false)}
        open={mobileFiltersVisible}
        height="auto"
        style={{ maxHeight: "80vh" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Job Status
            </Text>
            <Select
              placeholder="Select status"
              style={{ width: "100%" }}
              value={filterStatus}
              onChange={setFilterStatus}
              allowClear
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <Button
              type="link"
              onClick={() => {
                setFilterStatus("all");
                setSearchText("");
              }}
              style={{ flex: 1 }}
            >
              Clear All
            </Button>
            <Button
              type="primary"
              onClick={() => setMobileFiltersVisible(false)}
              style={{
                flex: 1,
                background: primaryColor,
                border: "none",
              }}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>

      <div style={{ marginBottom: "16px" }}>
        <Text
          style={{
            fontSize: "clamp(14px, 2.5vw, 16px)",
            fontWeight: 500,
            color: "#374151",
          }}
        >
          {
            filteredJobs.filter((job) => {
              const matchesSearch =
                searchText === "" ||
                job.title.toLowerCase().includes(searchText.toLowerCase()) ||
                job.company.toLowerCase().includes(searchText.toLowerCase()) ||
                job.location.toLowerCase().includes(searchText.toLowerCase());

              const matchesStatus =
                filterStatus === "all" ||
                (filterStatus === "active" && job.isActive) ||
                (filterStatus === "inactive" && !job.isActive);

              return matchesSearch && matchesStatus;
            }).length
          }{" "}
          jobs found
          {filterStatus !== "all" && ` (${filterStatus})`}
        </Text>
      </div>

      {getCurrentPageJobs().length > 0 ? (
        <>
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            }}
          >
            {getCurrentPageJobs().map((job, index) => (
              <div
                key={job._id}
                style={{
                  padding: "16px",
                  borderBottom:
                    index === getCurrentPageJobs().length - 1
                      ? "none"
                      : "1px solid #f0f0f0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleJobClick(job)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f8f9fa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <div className="mobile-job-card" style={{ display: "block" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Avatar
                        src={job.companyLogo}
                        size={40}
                        style={{ backgroundColor: "#f0f0f0", flexShrink: 0 }}
                        icon={<BankOutlined />}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Title
                          level={4}
                          style={{
                            margin: 0,
                            fontSize: "clamp(16px, 3vw, 18px)",
                            lineHeight: "1.3",
                            color: "#1a1a1a",
                          }}
                        >
                          {job.title}
                        </Title>
                        <Text
                          style={{
                            fontSize: "clamp(12px, 2.5vw, 14px)",
                            color: "#666",
                            display: "block",
                            marginTop: "2px",
                          }}
                        >
                          {job.company}
                        </Text>
                        {job.jobCode && (
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              display: "block",
                              marginTop: "2px",
                            }}
                          >
                            Code: {job.jobCode}
                          </Text>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "8px",
                      }}
                    >
                      <Space>
                        {/* Only show edit button if recruiter is in the main assignedRecruiters array */}
                        {isRecruiterAssigned(job.assignedRecruiters) && (
                          <Tooltip title="Edit Job">
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={(e) => handleEditJob(job, e)}
                            />
                          </Tooltip>
                        )}
                        {job.isActive ? (
                          <Tooltip title="Deactivate Job">
                            <Button
                              type="text"
                              icon={<PoweroffOutlined />}
                              danger
                              onClick={(e) => handleDeactivateJob(job, e)}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activate Job">
                            <Button
                              type="text"
                              icon={<CheckCircleOutlined />}
                              style={{ color: "#52c41a" }}
                              onClick={(e) => handleActivateJob(job, e)}
                            />
                          </Tooltip>
                        )}
                      </Space>
                      <Tag
                        color={job.isActive ? "green" : "red"}
                        style={{
                          fontSize: "10px",
                          textTransform: "uppercase",
                          fontWeight: 500,
                        }}
                      >
                        {job.isActive ? "Active" : "Inactive"}
                      </Tag>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <EnvironmentOutlined
                        style={{ fontSize: "12px", color: "#666" }}
                      />
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        {job.location} • {job.workType}
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <DollarOutlined
                        style={{ fontSize: "12px", color: "#666" }}
                      />
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        {job.salary}
                      </Text>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <CalendarOutlined
                        style={{ fontSize: "12px", color: "#666" }}
                      />
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                      marginBottom: "12px",
                    }}
                  >
                    <Tag color="blue" style={{ fontSize: "10px" }}>
                      Pipeline: {job.pipeline}
                    </Tag>
                    {job.stages.slice(0, 2).map((stage, index) => (
                      <Tag
                        key={index}
                        style={{
                          fontSize: "10px",
                          padding: "0 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {stage}
                      </Tag>
                    ))}
                    {job.stages.length > 2 && (
                      <Tooltip
                        title={job.stages.slice(2).join(", ")}
                        placement="top"
                      >
                        <Tag
                          style={{
                            fontSize: "10px",
                            padding: "0 6px",
                            borderRadius: "4px",
                          }}
                        >
                          +{job.stages.length - 2} more
                        </Tag>
                      </Tooltip>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <CalendarOutlined />
                      Posted {formatDate(job.postedDate)}
                    </Text>
                    <Button
                      type="primary"
                      size="small"
                      style={{
                        background: primaryColor,
                        border: "none",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobClick(job);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "24px",
            }}
          >
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={
                filteredJobs.filter((job) => {
                  const matchesSearch =
                    searchText === "" ||
                    job.title
                      .toLowerCase()
                      .includes(searchText.toLowerCase()) ||
                    job.company
                      .toLowerCase()
                      .includes(searchText.toLowerCase()) ||
                    job.location
                      .toLowerCase()
                      .includes(searchText.toLowerCase());

                  const matchesStatus =
                    filterStatus === "all" ||
                    (filterStatus === "active" && job.isActive) ||
                    (filterStatus === "inactive" && !job.isActive);

                  return matchesSearch && matchesStatus;
                }).length
              }
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              itemRender={(current, type, originalElement) => {
                if (type === "prev") {
                  return (
                    <Button
                      style={{
                        background: "#fff",
                        color: primaryColor,
                        borderColor: "#d9d9d9",
                      }}
                    >
                      Previous
                    </Button>
                  );
                }
                if (type === "next") {
                  return (
                    <Button
                      style={{
                        background: "#fff",
                        color: primaryColor,
                        borderColor: "#d9d9d9",
                      }}
                    >
                      Next
                    </Button>
                  );
                }
                if (type === "page") {
                  return (
                    <Button
                      style={{
                        background:
                          current === currentPage ? primaryColor : "#fff",
                        color: current === currentPage ? "#fff" : primaryColor,
                        borderColor: "#d9d9d9",
                      }}
                    >
                      {current}
                    </Button>
                  );
                }
                return originalElement;
              }}
            />
          </div>
        </>
      ) : (
        <Card
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
            borderRadius: "12px",
          }}
        >
          <Empty
            description={
              <Text
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  color: "#666",
                }}
              >
                {searchText || filterStatus !== "all"
                  ? "No jobs match your search criteria"
                  : "No jobs assigned to you yet"}
              </Text>
            }
          >
            {searchText || filterStatus !== "all" ? (
              <Button
                type="primary"
                onClick={() => {
                  setSearchText("");
                  setFilterStatus("all");
                }}
                style={{
                  background: primaryColor,
                  border: "none",
                }}
              >
                Clear search and filters
              </Button>
            ) : null}
          </Empty>
        </Card>
      )}
    </div>
  );
};

export default RecruiterJobs;