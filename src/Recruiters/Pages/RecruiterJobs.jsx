import React, { useState, useEffect, useRef } from "react";
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
  Progress,
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
  GroupOutlined,
  UsergroupAddOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetRecruiterJobsQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const RecruiterJobs = () => {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [currentRecruiterEmail, setCurrentRecruiterEmail] = useState("");
  const navigate = useNavigate();
  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const searchTimerRef = useRef(null);

  const {
    data: apiData,
    isLoading,
    error,
  } = useGetRecruiterJobsQuery({
    page: currentPage,
    limit: pageSize,
    searchText: debouncedSearch,
    status: filterStatus !== "all" ? filterStatus : undefined,
  });

  const primaryColor = "#da2c46";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

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
      experience: job.experienceMin
        ? `${job.experienceMin}${
            job.experienceMax ? `-${job.experienceMax}` : ""
          } years`
        : "Not specified",
      salary:
        job.salaryType === "annual"
          ? `SAR ${
              job.salaryMin ? parseInt(job.salaryMin).toLocaleString() : ""
            }${
              job.salaryMax
                ? `-${parseInt(job.salaryMax).toLocaleString()}`
                : ""
            }/year`
          : job.salaryType === "monthly"
          ? `SAR ${job.salaryMin ? job.salaryMin : ""}${
              job.salaryMax ? `-${job.salaryMax}` : ""
            }/month`
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
      numberOfCandidate: job.numberOfCandidate || 0,
      numberOfEmployees: job.numberOfEmployees || 0,
    }));
  };

  const handleJobClick = (job) => {
    navigate(`/recruiter-jobs/${job._id}`);
  };

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
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

  // remove slice from getCurrentPageJobs
  const getCurrentPageJobs = () => {
    return filteredJobs; // no slicing, API already paginates
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
              allowClear
              placeholder="Search jobs by title, company or location"
              size="large"
              prefix={<SearchOutlined style={{ color: primaryColor }} />}
              value={searchText}
              onChange={handleSearchChange}
              style={{ width: "100%" }}
            />
          </Col>
          {/* 
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
          </Col> */}
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
                          <>
                            {hasPermission("edit-job") && (
                              <Tooltip title="Edit Job">
                                <Button
                                  type="text"
                                  icon={<EditOutlined />}
                                  onClick={(e) => handleEditJob(job, e)}
                                />
                              </Tooltip>
                            )}
                            {hasPermission("deactivate-job") && (
                              <>
                                {job.isActive ? (
                                  <Tooltip title="Deactivate Job">
                                    <Button
                                      type="text"
                                      icon={<PoweroffOutlined />}
                                      danger
                                      onClick={(e) =>
                                        handleDeactivateJob(job, e)
                                      }
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
                              </>
                            )}
                          </>
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
                      alignItems: "center",
                      gap: "4px",
                      flex: 1,
                      minWidth: "120px",
                      marginBottom: "12px",
                    }}
                  >
                    <UsergroupAddOutlined
                      style={{ fontSize: "14px", color: "#666" }}
                    />
                    <Tooltip
                      title={
                        job.numberOfEmployees > job.numberOfCandidate
                          ? "You have exceeded the required employees for this work order!"
                          : `${job.numberOfEmployees} out of ${job.numberOfCandidate} employees converted`
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            fontSize: "12px",
                            color:
                              job.numberOfEmployees > job.numberOfCandidate
                                ? "red"
                                : "#444",
                          }}
                        >
                          Employees Converted: {job.numberOfEmployees} /{" "}
                          {job.numberOfCandidate}
                          {job.numberOfEmployees > job.numberOfCandidate && (
                            <WarningOutlined
                              style={{ color: "red", marginLeft: 4 }}
                            />
                          )}
                        </Text>
                        <Progress
                          percent={Math.min(
                            (job.numberOfEmployees / job.numberOfCandidate) *
                              100,
                            100
                          )}
                          size="small"
                          showInfo={false}
                          strokeColor={
                            job.numberOfEmployees > job.numberOfCandidate
                              ? "red"
                              : "#52c41a"
                          }
                          style={{ marginTop: "2px", width: "25%" }}
                        />
                      </div>
                    </Tooltip>
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
              total={apiData?.totalCount || 0} // ✅ Use totalCount from transformResponse
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              showSizeChanger={true}
               pageSizeOptions={['5', '10', '20', '50', '100', '150']}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} jobs`
              } // Optional: show total info
              itemRender={(current, type, originalElement) => {
                if (type === "prev") {
                  return <Button>Previous</Button>;
                }
                if (type === "next") {
                  return <Button>Next</Button>;
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
      <style jsx>{`
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
      `}</style>
    </div>
  );
};

export default RecruiterJobs;
