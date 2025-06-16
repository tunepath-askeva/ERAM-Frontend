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
  Descriptions,
  List,
  Spin,
  Input,
  Form,
  Select,
  Dropdown,
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
  BulbOutlined,
  TeamOutlined,
  EyeOutlined,
  BankOutlined,
  CalendarOutlined,
  GlobalOutlined,
  BookOutlined,
  FilterOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  UserOutlined,
  HomeOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  DownOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetJobsByBranchQuery } from "../Slices/Users/UserApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

const CandidateJobs = () => {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailVisible, setJobDetailVisible] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const navigate = useNavigate();

  // API call
  const { data: apiData, isLoading, error } = useGetJobsByBranchQuery();

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const transformJobData = (workorders) => {
    return (
      workorders?.map((workorder) => ({
        _id: workorder._id,
        title: workorder.title,
        company: "Company Name",
        companyLogo: "https://via.placeholder.com/40",
        location: workorder.officeLocation || "Location not specified",
        workType:
          workorder.workplace === "on-site"
            ? "On-site"
            : workorder.workplace === "remote"
            ? "Remote"
            : "Hybrid",
        employmentType:
          workorder.EmploymentType === "full-time"
            ? "Full-time"
            : workorder.EmploymentType === "part-time"
            ? "Part-time"
            : workorder.EmploymentType === "contract"
            ? "Contract"
            : "Full-time",
        experience: workorder.Experience
          ? `${workorder.Experience}+ years`
          : "Not specified",
        salary:
          workorder.salaryType === "annual" && workorder.annualSalary
            ? `₹${(workorder.annualSalary / 100000).toFixed(1)} LPA`
            : workorder.salaryType === "monthly" && workorder.monthlySalary
            ? `₹${workorder.monthlySalary}/month`
            : "Salary not disclosed",
        postedDate: workorder.createdAt,
        skills: workorder.requiredSkills || [],
        description: workorder.description || "No description available",
        requirements: workorder.jobRequirements
          ? [workorder.jobRequirements]
          : [],
        category: workorder.jobFunction || "General",
        isRemote: workorder.workplace === "remote",
        isSaved: false,
        jobCode: workorder.jobCode,
        startDate: workorder.startDate,
        endDate: workorder.endDate,
        deadlineDate: workorder.deadlineDate,
        numberOfCandidate: workorder.numberOfCandidate,
        benefits: workorder.benefits || [],
        education: workorder.Education,
        companyIndustry: workorder.companyIndustry,
        workOrderStatus: workorder.workOrderStatus,
        isActive: workorder.isActive,
      })) || []
    );
  };

  useEffect(() => {
    if (apiData?.workorders) {
      const transformedJobs = transformJobData(apiData.workorders);
      setFilteredJobs(transformedJobs);
    }
  }, [apiData]);

  useEffect(() => {
    applyFilters();
  }, [
    searchKeyword,
    locationFilter,
    workTypeFilter,
    employmentTypeFilter,
    experienceFilter,
    categoryFilter,
  ]);

  const applyFilters = () => {
    if (!apiData?.workorders) return;

    const transformedJobs = transformJobData(apiData.workorders);

    let filtered = transformedJobs.filter((job) => {
      const matchesKeyword =
        !searchKeyword ||
        job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.company.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.skills.some((skill) =>
          skill.toLowerCase().includes(searchKeyword.toLowerCase())
        );

      const matchesLocation =
        !locationFilter ||
        job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesWorkType =
        !workTypeFilter || job.workType === workTypeFilter;
      const matchesEmploymentType =
        !employmentTypeFilter || job.employmentType === employmentTypeFilter;
      const matchesExperience =
        !experienceFilter || job.experience.includes(experienceFilter);
      const matchesCategory =
        !categoryFilter || job.category === categoryFilter;

      return (
        matchesKeyword &&
        matchesLocation &&
        matchesWorkType &&
        matchesEmploymentType &&
        matchesExperience &&
        matchesCategory
      );
    });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleJobClick = (job) => {
    navigate(`/candidate-jobs/${job._id}`);
  };

  const handleSaveJob = (job) => {
    const newSavedJobs = new Set(savedJobs);
    if (savedJobs.has(job._id)) {
      newSavedJobs.delete(job._id);
      message.success("Job removed from saved jobs");
    } else {
      newSavedJobs.add(job._id);
      message.success("Job saved successfully");
    }
    setSavedJobs(newSavedJobs);

    // Update filtered jobs to reflect saved status
    setFilteredJobs((prevJobs) =>
      prevJobs.map((j) => ({
        ...j,
        isSaved: j._id === job._id ? !j.isSaved : j.isSaved,
      }))
    );
  };

  const clearFilters = () => {
    setSearchKeyword("");
    setLocationFilter("");
    setWorkTypeFilter("");
    setEmploymentTypeFilter("");
    setExperienceFilter("");
    setCategoryFilter("");
  };

  const formatDate = (dateString) => {
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
    return filteredJobs.slice(startIndex, endIndex);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (workTypeFilter) count++;
    if (employmentTypeFilter) count++;
    if (experienceFilter) count++;
    if (categoryFilter) count++;
    return count;
  };

  // Get unique values for filter options from API data
  const getFilterOptions = () => {
    if (!apiData?.workorders) {
      return {
        workTypes: [],
        employmentTypes: [],
        categories: [],
        experiences: [],
      };
    }

    const workTypes = [
      ...new Set(
        apiData.workorders.map((job) =>
          job.workplace === "on-site"
            ? "On-site"
            : job.workplace === "remote"
            ? "Remote"
            : "Hybrid"
        )
      ),
    ];

    const employmentTypes = [
      ...new Set(
        apiData.workorders.map((job) =>
          job.EmploymentType === "full-time"
            ? "Full-time"
            : job.EmploymentType === "part-time"
            ? "Part-time"
            : job.EmploymentType === "contract"
            ? "Contract"
            : "Full-time"
        )
      ),
    ];

    const categories = [
      ...new Set(
        apiData.workorders.map((job) => job.jobFunction).filter(Boolean)
      ),
    ];

    const experiences = [
      ...new Set(
        apiData.workorders.map((job) => job.Experience).filter(Boolean)
      ),
    ];

    return { workTypes, employmentTypes, categories, experiences };
  };

  const { workTypes, employmentTypes, categories, experiences } =
    getFilterOptions();

  // Filter form component for reuse in dropdown and drawer
  const FilterForm = ({ isDrawer = false }) => (
    <div
      style={{
        padding: isDrawer ? "0" : "16px",
        minWidth: isDrawer ? "auto" : "280px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {!isDrawer && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <Text strong style={{ fontSize: "16px", color: "#da2c46" }}>
              Filter Jobs
            </Text>
            <Button type="link" onClick={clearFilters} size="small">
              Clear All
            </Button>
          </div>
        )}

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Work Type
          </Text>
          <Select
            placeholder="Select work type"
            style={{ width: "100%" }}
            value={workTypeFilter}
            onChange={setWorkTypeFilter}
            allowClear
          >
            {workTypes.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Employment Type
          </Text>
          <Select
            placeholder="Select employment type"
            style={{ width: "100%" }}
            value={employmentTypeFilter}
            onChange={setEmploymentTypeFilter}
            allowClear
          >
            {employmentTypes.map((type) => (
              <Option key={type} value={type}>
                {type}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Experience Level
          </Text>
          <Select
            placeholder="Select experience"
            style={{ width: "100%" }}
            value={experienceFilter}
            onChange={setExperienceFilter}
            allowClear
          >
            {experiences.map((exp) => (
              <Option key={exp} value={exp}>
                {exp}+ years
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong style={{ display: "block", marginBottom: "8px" }}>
            Category
          </Text>
          <Select
            placeholder="Select category"
            style={{ width: "100%" }}
            value={categoryFilter}
            onChange={setCategoryFilter}
            allowClear
          >
            {categories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </div>

        {isDrawer && (
          <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
            <Button type="link" onClick={clearFilters} style={{ flex: 1 }}>
              Clear All
            </Button>
            <Button
              type="primary"
              onClick={() => setMobileFiltersVisible(false)}
              style={{
                flex: 1,
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                border: "none",
              }}
            >
              Apply Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const filterDropdownMenu = {
    items: [
      {
        key: "filters",
        label: <FilterForm />,
      },
    ],
  };

  // Show loading state
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
          title="Failed to Load Jobs"
          subTitle={"Something went wrong while fetching jobs."}
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
    <>
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        {/* Header */}
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
            <BulbOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Your Perfect Job Awaits
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
            Browse opportunities that reflect your abilities and aspirations.
          </Text>
        </div>

        {/* Search and Filter Section */}
        <Card
          style={{
            marginBottom: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Desktop Search Bar */}
          <div className="desktop-search" style={{ display: "block" }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={24} md={10} lg={10} xl={10}>
                <Search
                  placeholder="Job title or keyword"
                  size="large"
                  prefix={<SearchOutlined style={{ color: "#da2c46" }} />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} sm={12} md={6} lg={6} xl={6}>
                <Input
                  placeholder="City or country"
                  size="large"
                  prefix={<EnvironmentOutlined style={{ color: "#da2c46" }} />}
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                {/* Desktop Filter Dropdown */}
                <div className="desktop-filter" style={{ display: "none" }}>
                  <Dropdown
                    menu={filterDropdownMenu}
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      size="large"
                      style={{ width: "100%", position: "relative" }}
                    >
                      <FilterOutlined />
                      Filters
                      <DownOutlined
                        style={{ fontSize: "10px", marginLeft: "4px" }}
                      />
                      {getActiveFiltersCount() > 0 && (
                        <Badge
                          count={getActiveFiltersCount()}
                          size="small"
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            backgroundColor: "#da2c46",
                          }}
                        />
                      )}
                    </Button>
                  </Dropdown>
                </div>
                {/* Mobile Filter Button */}
                <div className="mobile-filter" style={{ display: "block" }}>
                  <Button
                    size="large"
                    style={{ width: "100%", position: "relative" }}
                    onClick={() => setMobileFiltersVisible(true)}
                  >
                    <FilterOutlined />
                    <span style={{ display: "none" }}>Filters</span>
                    {getActiveFiltersCount() > 0 && (
                      <Badge
                        count={getActiveFiltersCount()}
                        size="small"
                        style={{
                          position: "absolute",
                          top: "-8px",
                          right: "-8px",
                          backgroundColor: "#da2c46",
                        }}
                      />
                    )}
                  </Button>
                </div>
              </Col>
              <Col xs={12} sm={6} md={4} lg={4} xl={4}>
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  style={{
                    width: "100%",
                    background:
                      "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                    border: "none",
                  }}
                >
                  <span className="search-text" style={{ display: "inline" }}>
                    Search
                  </span>
                </Button>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Mobile Filter Drawer */}
        <Drawer
          title="Filter Jobs"
          placement="bottom"
          closable={true}
          onClose={() => setMobileFiltersVisible(false)}
          open={mobileFiltersVisible}
          height="auto"
          style={{ maxHeight: "80vh" }}
        >
          <FilterForm isDrawer={true} />
        </Drawer>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <Card style={{ marginBottom: "16px", borderRadius: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <Text style={{ fontWeight: 500, fontSize: "14px" }}>
                Active Filters:
              </Text>
              {workTypeFilter && (
                <Tag
                  closable
                  onClose={() => setWorkTypeFilter("")}
                  color="blue"
                  style={{ fontSize: "12px" }}
                >
                  Work: {workTypeFilter}
                </Tag>
              )}
              {employmentTypeFilter && (
                <Tag
                  closable
                  onClose={() => setEmploymentTypeFilter("")}
                  color="green"
                  style={{ fontSize: "12px" }}
                >
                  Employment: {employmentTypeFilter}
                </Tag>
              )}
              {experienceFilter && (
                <Tag
                  closable
                  onClose={() => setExperienceFilter("")}
                  color="orange"
                  style={{ fontSize: "12px" }}
                >
                  Exp: {experienceFilter}
                </Tag>
              )}
              {categoryFilter && (
                <Tag
                  closable
                  onClose={() => setCategoryFilter("")}
                  color="purple"
                  style={{ fontSize: "12px" }}
                >
                  Category: {categoryFilter}
                </Tag>
              )}
              <Button type="link" size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </Card>
        )}

        {/* Results Counter */}
        <div style={{ marginBottom: "16px" }}>
          <Text
            style={{
              fontSize: "clamp(14px, 2.5vw, 16px)",
              fontWeight: 500,
              color: "#374151",
            }}
          >
            {filteredJobs.length} jobs found
          </Text>
        </div>

        {/* Job Listings */}
        {filteredJobs.length > 0 ? (
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
                  {/* Mobile Layout */}
                  <div className="mobile-job-card" style={{ display: "block" }}>
                    {/* Header with Company Logo, Title, and Save Button */}
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
                            {job.companyIndustry || job.company}
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

                      {/* Save Button */}
                      <Tooltip
                        title={
                          savedJobs.has(job._id)
                            ? "Remove from saved"
                            : "Save job"
                        }
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={
                            savedJobs.has(job._id) ? (
                              <HeartFilled style={{ color: "#da2c46" }} />
                            ) : (
                              <HeartOutlined />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job);
                          }}
                          style={{ border: "1px solid #e0e0e0", flexShrink: 0 }}
                        />
                      </Tooltip>
                    </div>

                    {/* Location, Work Type, and Salary */}
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <Space wrap size="small" style={{ flex: 1 }}>
                          <Tag
                            icon={<EnvironmentOutlined />}
                            color="blue"
                            style={{ fontSize: "11px", margin: "2px" }}
                          >
                            {job.location}
                          </Tag>
                          <Tag
                            icon={
                              job.workType === "Remote" ? (
                                <HomeOutlined />
                              ) : (
                                <BankOutlined />
                              )
                            }
                            color="green"
                            style={{ fontSize: "11px", margin: "2px" }}
                          >
                            {job.workType}
                          </Tag>
                        </Space>
                        {job.salary && (
                          <Text
                            strong
                            style={{
                              color: "#da2c46",
                              fontSize: "clamp(14px, 2.5vw, 16px)",
                              flexShrink: 0,
                              marginLeft: "8px",
                            }}
                          >
                            {job.salary}
                          </Text>
                        )}
                      </div>

                      <Space wrap size="small">
                        <Tag
                          color="orange"
                          style={{ fontSize: "11px", margin: "2px" }}
                        >
                          {job.employmentType}
                        </Tag>
                        <Tag
                          color="purple"
                          style={{ fontSize: "11px", margin: "2px" }}
                        >
                          {job.experience}
                        </Tag>
                        {job.numberOfCandidate && (
                          <Tag
                            color="cyan"
                            style={{ fontSize: "11px", margin: "2px" }}
                          >
                            {job.numberOfCandidate} positions
                          </Tag>
                        )}
                      </Space>
                    </div>

                    {/* Skills */}
                    {job.skills.length > 0 && (
                      <div style={{ marginBottom: "12px" }}>
                        <Space wrap size="small">
                          {job.skills.slice(0, 3).map((skill, skillIndex) => (
                            <Tag
                              key={skillIndex}
                              style={{
                                fontSize: "10px",
                                border: "1px solid #da2c46",
                                color: "#da2c46",
                                background: "#fff",
                                borderRadius: "4px",
                                margin: "2px",
                              }}
                            >
                              {skill}
                            </Tag>
                          ))}
                          {job.skills.length > 3 && (
                            <Tag
                              style={{
                                fontSize: "10px",
                                color: "#666",
                                margin: "2px",
                              }}
                            >
                              +{job.skills.length - 3} more
                            </Tag>
                          )}
                        </Space>
                      </div>
                    )}

                    {/* Description */}
                    <Paragraph
                      ellipsis={{ rows: 2 }}
                      style={{
                        margin: "0 0 12px 0",
                        color: "#666",
                        fontSize: "clamp(12px, 2.5vw, 14px)",
                        lineHeight: "1.4",
                      }}
                    >
                      {job.description}
                    </Paragraph>

                    {/* Footer with Date and Actions */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <Text
                          type="secondary"
                          style={{ fontSize: "11px", display: "block" }}
                        >
                          Posted {formatDate(job.postedDate)}
                        </Text>
                        {job.deadlineDate && (
                          <Text
                            type="warning"
                            style={{ fontSize: "11px", display: "block" }}
                          >
                            Deadline:{" "}
                            {new Date(job.deadlineDate).toLocaleDateString()}
                          </Text>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Tooltip title="Share job">
                          <Button
                            type="text"
                            size="small"
                            icon={<ShareAltOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              message.info(
                                "Share functionality would be implemented here"
                              );
                            }}
                            style={{ border: "1px solid #e0e0e0" }}
                          />
                        </Tooltip>

                        <Button
                          type="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJobClick(job);
                          }}
                          style={{
                            background:
                              "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                            border: "none",
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div style={{ marginTop: "24px", textAlign: "center" }}>
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={filteredJobs.length}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                showQuickJumper
                style={{ marginTop: "16px" }}
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
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary" style={{ fontSize: "16px" }}>
                  No jobs found matching your criteria
                </Text>
              }
            >
              <Button
                type="primary"
                onClick={clearFilters}
                style={{
                  background:
                    "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  border: "none",
                }}
              >
                Clear Filters
              </Button>
            </Empty>
          </Card>
        )}
      </div>
    </>
  );
};

export default CandidateJobs;
