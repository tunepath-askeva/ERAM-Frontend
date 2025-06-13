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
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;

// Mock data for demonstration
const mockJobs = [
  {
    _id: "1",
    title: "Backend Developer",
    company: "Seekho",  
    companyLogo: "https://via.placeholder.com/40",
    location: "Bengaluru, Karnataka, India",
    workType: "On-site",
    employmentType: "Full-time",
    experience: "2-5 years",
    salary: "₹8-15 LPA",
    postedDate: "2025-06-10",
    skills: ["Node.js", "MongoDB", "Express.js", "JavaScript"],
    description: "We are looking for a skilled Backend Developer to join our growing team. You will be responsible for developing server-side logic, maintaining the central database, and ensuring high performance and responsiveness to requests from the front-end.",
    requirements: ["2+ years of experience in backend development", "Strong knowledge of Node.js", "Experience with databases"],
    category: "Technology",
    isRemote: false,
    isSaved: false,
  },
  {
    _id: "2",
    title: "Sr Data Engineer",
    company: "Reveal Health Tech",
    companyLogo: "https://via.placeholder.com/40",
    location: "Bengaluru, Karnataka, India",
    workType: "Hybrid",
    employmentType: "Full-time",
    experience: "5-8 years",
    salary: "₹15-25 LPA",
    postedDate: "2025-06-10",
    skills: ["Python", "SQL", "AWS", "Data Engineering"],
    description: "Join our data team to build scalable data pipelines and analytics solutions. You will work with cutting-edge technologies to process and analyze large datasets.",
    requirements: ["5+ years in data engineering", "Strong Python skills", "Cloud experience preferred"],
    category: "Engineering",
    isRemote: false,
    isSaved: true,
  },
  {
    _id: "3",
    title: "Graphic Designer",
    company: "Astrome Technologies",
    companyLogo: "https://via.placeholder.com/40",
    location: "Bengaluru, Karnataka, India",
    workType: "On-site",
    employmentType: "Full-time",
    experience: "2-4 years",
    salary: "₹6-12 LPA",
    postedDate: "2025-06-10",
    skills: ["Adobe Creative Suite", "UI/UX", "Figma", "Branding"],
    description: "Astrome Technologies is seeking a talented and creative Graphic Designer with 2+ years of experience to join our design team and create compelling visual content.",
    requirements: ["2+ years of graphic design experience", "Proficiency in Adobe Creative Suite", "Strong portfolio"],
    category: "Design",
    isRemote: false,
    isSaved: false,
  },
  {
    _id: "4",
    title: "Sales Engineer, India",
    company: "Genetec",
    companyLogo: "https://via.placeholder.com/40",
    location: "Bengaluru, Karnataka, India",
    workType: "On-site",
    employmentType: "Full-time",
    experience: "3-6 years",
    salary: "₹10-18 LPA",
    postedDate: "2025-03-10",
    skills: ["Sales", "Engineering", "B2B", "Technical Sales"],
    description: "We are looking for a Sales Engineer to drive business growth in the Indian market. You will combine technical expertise with sales skills to help customers understand our solutions.",
    requirements: ["3+ years in technical sales", "Engineering background", "Strong communication skills"],
    category: "Sales",
    isRemote: false,
    isSaved: false,
  },
];

const CandidateJobs = () => {
  const [jobs, setJobs] = useState(mockJobs);
  const [filteredJobs, setFilteredJobs] = useState(mockJobs);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetailVisible, setJobDetailVisible] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set(["2"]));
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const navigate = useNavigate();

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [workTypeFilter, setWorkTypeFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    applyFilters();
  }, [searchKeyword, locationFilter, workTypeFilter, employmentTypeFilter, experienceFilter, categoryFilter]);

  const applyFilters = () => {
    let filtered = jobs.filter(job => {
      const matchesKeyword = !searchKeyword ||
        job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.company.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchKeyword.toLowerCase()));

      const matchesLocation = !locationFilter || job.location.toLowerCase().includes(locationFilter.toLowerCase());
      const matchesWorkType = !workTypeFilter || job.workType === workTypeFilter;
      const matchesEmploymentType = !employmentTypeFilter || job.employmentType === employmentTypeFilter;
      const matchesExperience = !experienceFilter || job.experience.includes(experienceFilter);
      const matchesCategory = !categoryFilter || job.category === categoryFilter;

      return matchesKeyword && matchesLocation && matchesWorkType && matchesEmploymentType && matchesExperience && matchesCategory;
    });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  };

  const handleJobClick = (job) => {
    navigate(`/candidate-applied-jobs/${job._id}`);
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

    // Update jobs state to reflect saved status
    setJobs(prevJobs =>
      prevJobs.map(j => ({
        ...j,
        isSaved: j._id === job._id ? !j.isSaved : j.isSaved
      }))
    );
    setFilteredJobs(prevJobs =>
      prevJobs.map(j => ({
        ...j,
        isSaved: j._id === job._id ? !j.isSaved : j.isSaved
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

  const filterDropdownMenu = {
    items: [
      {
        key: 'filters',
        label: (
          <div style={{ padding: '16px', minWidth: '280px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <Text strong style={{ fontSize: "16px", color: "#da2c46" }}>
                  Filter Jobs
                </Text>
                <Button type="link" onClick={clearFilters} size="small">
                  Clear All
                </Button>
              </div>

              <div>
                <Text strong style={{ display: "block", marginBottom: "8px" }}>Work Type</Text>
                <Select
                  placeholder="Select work type"
                  style={{ width: "100%" }}
                  value={workTypeFilter}
                  onChange={setWorkTypeFilter}
                  allowClear
                >
                  <Option value="On-site">On-site</Option>
                  <Option value="Remote">Remote</Option>
                  <Option value="Hybrid">Hybrid</Option>
                </Select>
              </div>

              <div>
                <Text strong style={{ display: "block", marginBottom: "8px" }}>Employment Type</Text>
                <Select
                  placeholder="Select employment type"
                  style={{ width: "100%" }}
                  value={employmentTypeFilter}
                  onChange={setEmploymentTypeFilter}
                  allowClear
                >
                  <Option value="Full-time">Full-time</Option>
                  <Option value="Part-time">Part-time</Option>
                  <Option value="Contract">Contract</Option>
                  <Option value="Internship">Internship</Option>
                </Select>
              </div>

              <div>
                <Text strong style={{ display: "block", marginBottom: "8px" }}>Experience Level</Text>
                <Select
                  placeholder="Select experience"
                  style={{ width: "100%" }}
                  value={experienceFilter}
                  onChange={setExperienceFilter}
                  allowClear
                >
                  <Option value="0-1">0-1 years</Option>
                  <Option value="2-5">2-5 years</Option>
                  <Option value="5-8">5-8 years</Option>
                  <Option value="8+">8+ years</Option>
                </Select>
              </div>

              <div>
                <Text strong style={{ display: "block", marginBottom: "8px" }}>Category</Text>
                <Select
                  placeholder="Select category"
                  style={{ width: "100%" }}
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  allowClear
                >
                  <Option value="Technology">Technology</Option>
                  <Option value="Engineering">Engineering</Option>
                  <Option value="Design">Design</Option>
                  <Option value="Sales">Sales</Option>
                  <Option value="Marketing">Marketing</Option>
                  <Option value="Finance">Finance</Option>
                </Select>
              </div>
            </div>
          </div>
        ),
      },
    ],
  };

  return (
    <>
      <div style={{ padding: "16px", minHeight: "100vh" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <Title level={2} style={{ margin: 0, color: "#2c3e50", textAlign: "center" }}>
            <BulbOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Your Perfect Job Awaits
          </Title>
          <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 8 }}>
            Browse opportunities that reflect your abilities and aspirations.
          </Text>
        </div>

        {/* Search and Filter Section */}
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={24} md={8} lg={8}>
              <Search
                placeholder="Job title or keyword"
                size="large"
                prefix={<SearchOutlined style={{ color: "#da2c46" }} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <Input
                placeholder="City or country"
                size="large"
                prefix={<EnvironmentOutlined style={{ color: "#da2c46" }} />}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                style={{ width: "100%" }}
              />
            </Col>
            <Col xs={12} sm={6} md={4} lg={4}>
              <Dropdown
                menu={filterDropdownMenu}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button
                  size="large"
                  style={{ width: "100%", position: "relative" }}
                >
                  <FilterOutlined />
                  Filters
                  <DownOutlined style={{ fontSize: "10px", marginLeft: "4px" }} />
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
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <Button
                type="primary"
                size="large"
                icon={<SearchOutlined />}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  border: "none",
                }}
              >
                Search Jobs
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <Card style={{ marginBottom: "16px", borderRadius: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <Text style={{ fontWeight: 500 }}>Active Filters:</Text>
              {workTypeFilter && (
                <Tag
                  closable
                  onClose={() => setWorkTypeFilter("")}
                  color="blue"
                >
                  Work Type: {workTypeFilter}
                </Tag>
              )}
              {employmentTypeFilter && (
                <Tag
                  closable
                  onClose={() => setEmploymentTypeFilter("")}
                  color="green"
                >
                  Employment: {employmentTypeFilter}
                </Tag>
              )}
              {experienceFilter && (
                <Tag
                  closable
                  onClose={() => setExperienceFilter("")}
                  color="orange"
                >
                  Experience: {experienceFilter}
                </Tag>
              )}
              {categoryFilter && (
                <Tag
                  closable
                  onClose={() => setCategoryFilter("")}
                  color="purple"
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
          <Text style={{ fontSize: "16px", fontWeight: 500, color: "#374151" }}>
            {filteredJobs.length} jobs found
          </Text>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <>
            <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)" }}>
              {getCurrentPageJobs().map((job, index) => (
                <div
                  key={job._id}
                  style={{
                    padding: "20px 24px",
                    borderBottom: index === getCurrentPageJobs().length - 1 ? "none" : "1px solid #f0f0f0",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleJobClick(job)}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8f9fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                    {/* Left Section - Company Logo & Job Info */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", flex: 1 }}>
                      <Avatar
                        src={job.companyLogo}
                        size={48}
                        style={{ backgroundColor: "#f0f0f0", flexShrink: 0 }}
                        icon={<BankOutlined />}
                      />

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Job Title & Company */}
                        <div style={{ marginBottom: "8px" }}>
                          <Title level={4} style={{ margin: 0, fontSize: "18px", lineHeight: "24px", color: "#1a1a1a" }}>
                            {job.title}
                          </Title>
                          <Text style={{ fontSize: "14px", color: "#666", display: "block", marginTop: "2px" }}>
                            {job.company}
                          </Text>
                        </div>

                        {/* Location & Work Type Tags */}
                        <div style={{ marginBottom: "12px" }}>
                          <Space wrap size="small">
                            <Tag icon={<EnvironmentOutlined />} color="blue" style={{ fontSize: "12px" }}>
                              {job.location.split(",")[0]}
                            </Tag>
                            <Tag icon={job.workType === "Remote" ? <HomeOutlined /> : <BankOutlined />} color="green" style={{ fontSize: "12px" }}>
                              {job.workType}
                            </Tag>
                            <Tag color="orange" style={{ fontSize: "12px" }}>{job.employmentType}</Tag>
                            <Tag color="purple" style={{ fontSize: "12px" }}>{job.experience}</Tag>
                          </Space>
                        </div>

                        {/* Skills */}
                        <div style={{ marginBottom: "12px" }}>
                          <Space wrap size="small">
                            {job.skills.slice(0, 4).map((skill, skillIndex) => (
                              <Tag
                                key={skillIndex}
                                style={{
                                  fontSize: "11px",
                                  border: "1px solid #da2c46",
                                  color: "#da2c46",
                                  background: "#fff",
                                  borderRadius: "4px"
                                }}
                              >
                                {skill}
                              </Tag>
                            ))}
                            {job.skills.length > 4 && (
                              <Tag style={{ fontSize: "11px", color: "#666" }}>
                                +{job.skills.length - 4} more
                              </Tag>
                            )}
                          </Space>
                        </div>

                        {/* Job Description */}
                        <Paragraph
                          ellipsis={{ rows: 2 }}
                          style={{ margin: 0, color: "#666", fontSize: "14px", lineHeight: "20px" }}
                        >
                          {job.description}
                        </Paragraph>
                      </div>
                    </div>

                    {/* Right Section - Salary, Date & Actions */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "12px",
                      minWidth: "200px",
                      flexShrink: 0
                    }}>
                      {/* Salary */}
                      {job.salary && (
                        <Text strong style={{ color: "#da2c46", fontSize: "16px" }}>
                          <DollarOutlined style={{ marginRight: 4 }} />
                          {job.salary}
                        </Text>
                      )}

                      {/* Posted Date */}
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Posted {formatDate(job.postedDate)}
                      </Text>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <Tooltip title={savedJobs.has(job._id) ? "Remove from saved" : "Save job"}>
                          <Button
                            type="text"
                            size="small"
                            icon={savedJobs.has(job._id) ? <HeartFilled style={{ color: "#da2c46" }} /> : <HeartOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveJob(job);
                            }}
                            style={{ border: "1px solid #e0e0e0" }}
                          />
                        </Tooltip>

                        <Tooltip title="Share job">
                          <Button
                            type="text"
                            size="small"
                            icon={<ShareAltOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              message.info("Share functionality would be implemented here");
                            }}
                            style={{ border: "1px solid #e0e0e0" }}
                          />
                        </Tooltip>

                        <Button
                          type="primary"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            message.success("Application submitted!");
                          }}
                          style={{
                            background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                            border: "none",
                            padding: "4px 16px",
                            height: "32px"
                          }}
                        >
                          Apply Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {filteredJobs.length > pageSize && (
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                <Pagination
                  current={currentPage}
                  total={filteredJobs.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} jobs`
                  }
                />
              </div>
            )}
          </>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
              textAlign: "center",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <Text style={{ fontSize: "16px", color: "#7f8c8d" }}>
                    No jobs found matching your criteria
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "14px" }}>
                    Try adjusting your search filters or check back later for new opportunities
                  </Text>
                  <div style={{ marginTop: 16 }}>
                    <Button type="link" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                </div>
              }
            />
          </Card>
        )}
      </div>
    </>
  );
};

export default CandidateJobs;