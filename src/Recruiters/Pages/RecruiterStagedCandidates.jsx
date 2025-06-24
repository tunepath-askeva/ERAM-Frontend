import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Typography,
  Tag,
  Empty,
  Space,
  Badge,
  List,
  Spin,
  Avatar,
  Button,
  Tabs,
  Dropdown,
  Menu,
  Modal,
  message,
  Row,
  Col,
  Input,
  Select,
  Tooltip,
  Drawer,
  Pagination,
} from "antd";
import {
  TeamOutlined,
  EnvironmentOutlined,
  MoreOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  UserOutlined,
  LeftOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  BankOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetPipelineJobsQuery } from "../../Slices/Recruiter/RecruiterApis";
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const RecruiterStagedCandidates = () => {
  const navigate = useNavigate();
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [targetStage, setTargetStage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  const primaryColor = "#da2c46";

  // Use RTK Query hook
  const { data: apiData, isLoading, error } = useGetPipelineJobsQuery();

  // Process API data to match component structure
  const processedData = useMemo(() => {
    if (!apiData?.pipelineCandidates) return { jobs: [], allCandidates: [] };

    const jobsMap = new Map();
    const allCandidates = [];

    apiData.pipelineCandidates.forEach((candidateData) => {
      const workOrder = candidateData.workOrder;
      const user = candidateData.user;
      const stageProgress = candidateData.stageProgress || [];

      // Create or get job entry
      if (!jobsMap.has(workOrder._id)) {
        // Extract unique stages from all candidates for this job
        const allStagesForJob = apiData.pipelineCandidates
          .filter((c) => c.workOrder._id === workOrder._id)
          .flatMap((c) => c.stageProgress || [])
          .reduce((stages, progress) => {
            if (!stages.find((s) => s._id === progress.stageId)) {
              stages.push({
                _id: progress.stageId,
                name: progress.stageName,
                order: stages.length + 1,
              });
            }
            return stages;
          }, []);

        jobsMap.set(workOrder._id, {
          _id: workOrder._id,
          title: workOrder.title,
          company: workOrder.companyIndustry || "Company",
          location: workOrder.officeLocation,
          workType: "Remote", 
          applications: 0, 
          isActive: candidateData.status === "pipeline",
          postedDate: new Date().toISOString(),
          jobCode: workOrder.jobCode,
          pipeline: {
            _id: stageProgress[0]?.pipelineId || "default-pipeline",
            name: "Hiring Pipeline",
            stages: allStagesForJob,
          },
          candidates: [],
        });
      }

      const job = jobsMap.get(workOrder._id);

      const currentStageProgress = stageProgress[0]; 
      const processedCandidate = {
        _id: candidateData._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: null, 
        status: candidateData.status === "pipeline" ? "Active" : "Inactive",
        currentStage: currentStageProgress?.stageId || null,
        currentStageName: currentStageProgress?.stageName || "Unknown",
        stageStatus: currentStageProgress?.stageStatus || "pending",
        jobId: workOrder._id,
        appliedDate: new Date().toISOString(),
        stageProgress: stageProgress,
      };

      job.candidates.push(processedCandidate);
      allCandidates.push(processedCandidate);
    });

    const jobs = Array.from(jobsMap.values()).map((job) => ({
      ...job,
      applications: job.candidates.length,
    }));

    return { jobs, allCandidates };
  }, [apiData]);

  const { jobs, allCandidates } = processedData;

  useEffect(() => {
    setFilteredJobs(jobs);
  }, [jobs]);

  const selectedJobCandidates = useMemo(() => {
    if (!selectedJob) return [];
    return allCandidates.filter(
      (candidate) => candidate.jobId === selectedJob._id
    );
  }, [selectedJob, allCandidates]);

  useEffect(() => {
    if (selectedJob && selectedJob.pipeline?.stages?.length > 0) {
      setActiveStage(selectedJob.pipeline.stages[0]._id);
    }
  }, [selectedJob]);

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

  const handleJobSelect = (job) => {
    setSelectedJob(job);
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
    setActiveStage(null);
  };

  const handleStageChange = (stageId) => {
    setActiveStage(stageId);
  };

  const handleMoveCandidate = (candidate, e) => {
    e?.stopPropagation();
    setSelectedCandidate(candidate);
    setTargetStage(null);
    setIsMoveModalVisible(true);
  };

  const confirmMoveCandidate = () => {
    if (!selectedCandidate || !targetStage) {
      message.warning("Please select a target stage");
      return;
    }

 
    message.success(
      `Moved ${selectedCandidate.name} to ${getStageName(targetStage)}`
    );
    setIsMoveModalVisible(false);

  
    // refetch();
  };

  const getStageName = (stageId) => {
    if (!selectedJob) return "";
    const stage = selectedJob.pipeline.stages.find((s) => s._id === stageId);
    return stage ? stage.name : "";
  };

  const getCandidatesInStage = (stageId) => {
    return selectedJobCandidates.filter(
      (candidate) => candidate.currentStage === stageId
    );
  };

  const getCandidateCountForJob = (jobId) => {
    return allCandidates.filter((c) => c.jobId === jobId).length;
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" tip="Loading pipeline data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Card>
          <Empty
            description={
              <div>
                <Text type="danger">Failed to load pipeline data</Text>
                <br />
                <Text type="secondary">Please try refreshing the page</Text>
              </div>
            }
          >
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              style={{ background: primaryColor, border: "none" }}
            >
              Refresh Page
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  if (!selectedJob) {
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
            Candidate Pipeline Management
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
            Select a job to view and manage candidates through hiring pipeline
            stages
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
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
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
                  job.company
                    .toLowerCase()
                    .includes(searchText.toLowerCase()) ||
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
                  onClick={() => handleJobSelect(job)}
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
                        <TeamOutlined
                          style={{ fontSize: "12px", color: "#666" }}
                        />
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          {getCandidateCountForJob(job._id)} candidates
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
                        Pipeline: {job.pipeline.name}
                      </Tag>
                      {job.pipeline.stages.slice(0, 2).map((stage, index) => (
                        <Tag
                          key={index}
                          style={{
                            fontSize: "10px",
                            padding: "0 6px",
                            borderRadius: "4px",
                          }}
                        >
                          {stage.name}
                        </Tag>
                      ))}
                      {job.pipeline.stages.length > 2 && (
                        <Tooltip
                          title={job.pipeline.stages
                            .slice(2)
                            .map((s) => s.name)
                            .join(", ")}
                          placement="top"
                        >
                          <Tag
                            style={{
                              fontSize: "10px",
                              padding: "0 6px",
                              borderRadius: "4px",
                            }}
                          >
                            +{job.pipeline.stages.length - 2} more
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
                     
                      <Button
                        type="primary"
                        size="small"
                        style={{
                          background: primaryColor,
                          border: "none",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobSelect(job);
                        }}
                      >
                        View Pipeline
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
                          color:
                            current === currentPage ? "#fff" : primaryColor,
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
                    : "No pipeline jobs found"}
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
                  Clear Filters
                </Button>
              ) : null}
            </Empty>
          </Card>
        )}
      </div>
    );
  }

  // Show candidate pipeline view for selected job
  return (
    <div style={{ padding: "16px", minHeight: "100vh" }}>
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={handleBackToJobs}
          style={{ color: primaryColor }}
        >
          Back to Jobs
        </Button>
      </div>

      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {selectedJob.title}
              </Title>
              <Text strong style={{ display: "block", marginTop: "4px" }}>
                {selectedJob.company} • {selectedJob.location}
              </Text>
            </div>
            <Tag color={selectedJob.isActive ? "green" : "red"}>
              {selectedJob.isActive ? "Active" : "Inactive"}
            </Tag>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <Text
              type="secondary"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <TeamOutlined /> {selectedJobCandidates.length} candidates
            </Text>
            <Text
              type="secondary"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <EnvironmentOutlined /> {selectedJob.workType}
            </Text>
            <Text
              type="secondary"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <DollarOutlined /> {selectedJob.salary}
            </Text>
            <Text
              type="secondary"
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <CalendarOutlined /> Deadline:{" "}
              {new Date(selectedJob.deadline).toLocaleDateString()}
            </Text>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text strong>Pipeline:</Text>
            <Tag color="blue">{selectedJob.pipeline.name}</Tag>
          </div>
        </div>
      </Card>

      <div style={{ overflowX: "auto", marginBottom: "16px" }}>
        <Tabs
          activeKey={activeStage}
          onChange={handleStageChange}
          tabPosition="top"
          type="card"
          style={{ minWidth: "max-content" }}
        >
          {selectedJob.pipeline.stages.map((stage) => (
            <TabPane
              key={stage._id}
              tab={
                <Badge
                  count={getCandidatesInStage(stage._id).length}
                  offset={[10, -5]}
                  style={{
                    backgroundColor:
                      activeStage === stage._id ? primaryColor : "#d9d9d9",
                  }}
                >
                  <span style={{ padding: "0 8px" }}>{stage.name}</span>
                </Badge>
              }
            />
          ))}
        </Tabs>
      </div>

      {activeStage && (
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Title level={4} style={{ marginBottom: "16px" }}>
            {getStageName(activeStage)} Candidates (
            {getCandidatesInStage(activeStage).length})
          </Title>

          {getCandidatesInStage(activeStage).length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={getCandidatesInStage(activeStage)}
              renderItem={(candidate) => (
                <List.Item
                  actions={[
                    <Dropdown
                      overlay={
                        <Menu>
                          {selectedJob.pipeline.stages
                            .filter(
                              (stage) => stage._id !== candidate.currentStage
                            )
                            .map((stage) => (
                              <Menu.Item
                                key={stage._id}
                                onClick={() => {
                                  setSelectedCandidate(candidate);
                                  setTargetStage(stage._id);
                                  confirmMoveCandidate();
                                }}
                              >
                                Move to {stage.name}
                              </Menu.Item>
                            ))}
                        </Menu>
                      }
                      placement="bottomRight"
                      trigger={["click"]}
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>,
                  ]}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar src={candidate.avatar} icon={<UserOutlined />} />
                    }
                    title={
                      <Text strong style={{ fontSize: "16px" }}>
                        {candidate.name}
                      </Text>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          {candidate.email}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          {candidate.phone}
                        </Text>
                        <div>
                          <Tag
                            color={
                              candidate.stageStatus === "completed"
                                ? "green"
                                : candidate.stageStatus === "rejected"
                                ? "red"
                                : "blue"
                            }
                            style={{ fontSize: "11px" }}
                          >
                            {candidate.stageStatus}
                          </Tag>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              marginLeft: "8px",
                            }}
                          >
                            Applied {formatDate(candidate.appliedDate)}
                          </Text>
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description={
                <Text type="secondary">No candidates in this stage</Text>
              }
              style={{ padding: "40px 0" }}
            />
          )}
        </Card>
      )}

      {/* Move Candidate Modal */}
      <Modal
        title={`Move ${selectedCandidate?.name || "Candidate"}`}
        visible={isMoveModalVisible}
        onOk={confirmMoveCandidate}
        onCancel={() => setIsMoveModalVisible(false)}
        okText="Confirm Move"
        okButtonProps={{
          style: { background: primaryColor, border: "none" },
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <Text>
            Current Stage:{" "}
            <Text strong>
              {selectedCandidate?.currentStageName || "Unknown"}
            </Text>
          </Text>
        </div>
        <div>
          <Text style={{ display: "block", marginBottom: "8px" }}>
            Select Target Stage:
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="Select stage"
            value={targetStage}
            onChange={setTargetStage}
          >
            {selectedJob?.pipeline.stages
              .filter((stage) => stage._id !== selectedCandidate?.currentStage)
              .map((stage) => (
                <Option key={stage._id} value={stage._id}>
                  {stage.name}
                </Option>
              ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default RecruiterStagedCandidates;
