import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  MailOutlined,
  PhoneOutlined,
  CodeOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  useGetPipelineJobsQuery,
  useLazyGetPipelineJobsExportQuery,
} from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const RecruiterStagedCandidates = () => {
  const navigate = useNavigate();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [activeStage, setActiveStage] = useState(null);
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [movingCandidate, setMovingCandidate] = useState(null);
  const [targetStage, setTargetStage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterJob, setFilterJob] = useState("all");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  const primaryColor = "#da2c46";

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterJob]);

  const {
    data: apiData,
    isLoading,
    error,
    isFetching,
  } = useGetPipelineJobsQuery({
    page: currentPage,
    limit: pageSize,
    search: debouncedSearchText,
    status: filterStatus,
    jobId: filterJob,
  });

  const [triggerExport, { isFetching: isExporting }] =
    useLazyGetPipelineJobsExportQuery();

  const processedData = useMemo(() => {
    if (!apiData?.pipelineCandidates)
      return { candidates: [], jobs: [], totalCount: 0 };

    const candidates = [];
    const jobsMap = new Map();

    apiData.pipelineCandidates.forEach((candidateData) => {
      const workOrder = candidateData.workOrder;
      const user = candidateData.user;
      const stageProgress = candidateData.stageProgress || [];

      if (!jobsMap.has(workOrder._id)) {
        jobsMap.set(workOrder._id, {
          _id: workOrder._id,
          title: workOrder.title,
          company: workOrder.companyIndustry || "Company",
          location: workOrder.officeLocation,
          jobCode: workOrder.jobCode,
        });
      }

      const currentStageProgress = stageProgress[0];
      const processedCandidate = {
        _id: candidateData._id,
        candidateId: candidateData._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: null,
        status: candidateData.status === "pipeline" ? "Active" : "Inactive",
        currentStage: currentStageProgress?.stageId || null,
        currentStageName: currentStageProgress?.stageName || "Unknown",
        stageStatus: currentStageProgress?.stageStatus || "pending",
        appliedJob: {
          _id: workOrder._id,
          title: workOrder.title,
          company: workOrder.companyIndustry || "Company",
          location: workOrder.officeLocation,
          jobCode: workOrder.jobCode,
        },
        appliedDate: new Date().toISOString(),
        stageProgress: stageProgress,
        pipeline: {
          _id: stageProgress[0]?.pipelineId || "default-pipeline",
          name: "Hiring Pipeline",
          stages: stageProgress.map((progress, index) => ({
            _id: progress.stageId,
            name: progress.stageName,
            order: index + 1,
          })),
        },
      };

      candidates.push(processedCandidate);
    });

    const jobs = Array.from(jobsMap.values());

    return {
      candidates,
      jobs,
      totalCount: apiData.totalCount || candidates.length,
      currentPage: apiData.currentPage || currentPage,
      totalPages:
        apiData.totalPages ||
        Math.ceil((apiData.totalCount || candidates.length) / pageSize),
    };
  }, [apiData, currentPage, pageSize]);

  const { candidates, jobs, totalCount, totalPages } = processedData;

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

  const handleCandidateSelect = (candidate) => {
    navigate(`/recruiter/pipeline/${candidate.candidateId}`);
  };

  const handleBackToCandidates = () => {
    setSelectedCandidate(null);
    setActiveStage(null);
  };

  const handleStageChange = (stageId) => {
    setActiveStage(stageId);
  };

  const handleMoveCandidate = (candidate, e) => {
    e?.stopPropagation();
    setMovingCandidate(candidate);
    setTargetStage(null);
    setIsMoveModalVisible(true);
  };

  const handleExport = async () => {
    try {
      const blob = await triggerExport({
        search: debouncedSearchText,
        status: filterStatus,
        jobId: filterJob,
      }).unwrap();

      // Download Excel
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "pipeline_candidates.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      message.error("Failed to export candidates");
    }
  };

  const confirmMoveCandidate = () => {
    if (!movingCandidate || !targetStage) {
      message.warning("Please select a target stage");
      return;
    }

    message.success(
      `Moved ${movingCandidate.name} to ${getStageName(targetStage)}`
    );
    setIsMoveModalVisible(false);
  };

  const getStageName = (stageId) => {
    if (!selectedCandidate) return "";
    const stage = selectedCandidate.pipeline.stages.find(
      (s) => s._id === stageId
    );
    return stage ? stage.name : "";
  };

  const getCandidatesInStage = (stageId) => {
    if (!selectedCandidate) return [];
    return [];
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setFilterStatus("all");
    setFilterJob("all");
    setCurrentPage(1);
  };

  if (isLoading && !isFetching) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" tip="Loading candidates..." />
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
                <Text type="danger">Failed to load candidates data</Text>
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

  if (!selectedCandidate) {
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
            Pipeline Candidates
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
            View and manage candidates in the hiring pipeline
          </Text>
        </div>

        <Card
          style={{
            marginBottom: "16px",
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Row gutter={[16, 16]} align="middle" wrap>
            {/* Search Input */}
            <Col xs={24} md={10}>
              <Input
                placeholder="Search by name, email, or job title"
                size="large"
                prefix={<SearchOutlined style={{ color: primaryColor }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%" }}
                loading={isFetching}
                allowClear
              />
            </Col>

            {/* Export Button */}
            <Col xs={12} md={6}>
              <Button
                type="primary"
                size="large"
                icon={<DownloadOutlined />}
                loading={isExporting}
                onClick={handleExport}
                style={{
                  width: "100%",
                  background: primaryColor,
                  border: "none",
                }}
              >
                Export Excel
              </Button>
            </Col>
          </Row>
        </Card>

        <Drawer
          title="Filter Candidates"
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
                Candidate Status
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

            <div>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Applied Job
              </Text>
              <Select
                placeholder="Select job"
                style={{ width: "100%" }}
                value={filterJob}
                onChange={setFilterJob}
                allowClear
              >
                <Option value="all">All Jobs</Option>
                {jobs.map((job) => (
                  <Option key={job._id} value={job._id}>
                    {job.title} - {job.company}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <Button
                type="link"
                onClick={handleClearFilters}
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

        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: "clamp(14px, 2.5vw, 16px)",
              fontWeight: 500,
              color: "#374151",
            }}
          >
            {totalCount} candidates found
            {filterStatus !== "all" && ` (${filterStatus})`}
          </Text>
          {isFetching && <Spin size="small" />}
        </div>

        {candidates.length > 0 ? (
          <>
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                opacity: isFetching ? 0.7 : 1,
                transition: "opacity 0.3s ease",
              }}
            >
              {candidates.map((candidate, index) => (
                <div
                  key={candidate._id}
                  style={{
                    padding: "16px",
                    borderBottom:
                      index === candidates.length - 1
                        ? "none"
                        : "1px solid #f0f0f0",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onClick={() => handleCandidateSelect(candidate)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <div
                    className="mobile-candidate-card"
                    style={{ display: "block" }}
                  >
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
                          src={candidate.avatar}
                          size={48}
                          style={{ backgroundColor: "#f0f0f0", flexShrink: 0 }}
                          icon={<UserOutlined />}
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
                            {candidate.name}
                          </Title>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "2px",
                            }}
                          >
                            <MailOutlined
                              style={{ fontSize: "12px", color: "#666" }}
                            />
                            <Text
                              style={{
                                fontSize: "clamp(12px, 2.5vw, 13px)",
                                color: "#666",
                              }}
                            >
                              {candidate.email}
                            </Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              marginTop: "2px",
                            }}
                          >
                            <PhoneOutlined
                              style={{ fontSize: "12px", color: "#666" }}
                            />
                            <Text
                              style={{
                                fontSize: "clamp(12px, 2.5vw, 13px)",
                                color: "#666",
                              }}
                            >
                              {candidate.phone}
                            </Text>
                          </div>
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
                          color={
                            candidate.status === "Active" ? "green" : "red"
                          }
                          style={{
                            fontSize: "10px",
                            textTransform: "uppercase",
                            fontWeight: 500,
                          }}
                        >
                          {candidate.status}
                        </Tag>
                      </div>
                    </div>

                    {/* Applied Job Information */}
                    <Card
                      size="small"
                      style={{
                        marginBottom: "12px",
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e9ecef",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        <BankOutlined
                          style={{ fontSize: "14px", color: primaryColor }}
                        />
                        <Text
                          strong
                          style={{
                            fontSize: "14px",
                            color: "#1a1a1a",
                          }}
                        >
                          Applied for: {candidate.appliedJob.title}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          fontSize: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            {candidate.appliedJob.company}
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <EnvironmentOutlined
                            style={{ fontSize: "11px", color: "#666" }}
                          />
                          <Text
                            style={{
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            {candidate.appliedJob.location}
                          </Text>
                        </div>
                        {candidate.appliedJob.jobCode && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <CodeOutlined
                              style={{ fontSize: "11px", color: "#666" }}
                            />
                            <Text
                              style={{
                                fontSize: "12px",
                                color: "#666",
                              }}
                            >
                              {candidate.appliedJob.jobCode}
                            </Text>
                          </div>
                        )}
                      </div>
                    </Card>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
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
                        Current: {candidate.currentStageName}
                      </Tag>
                      <Tag
                        color={
                          candidate.stageStatus === "completed"
                            ? "green"
                            : candidate.stageStatus === "rejected"
                            ? "red"
                            : "orange"
                        }
                        style={{ fontSize: "11px" }}
                      >
                        Status: {candidate.stageStatus}
                      </Tag>
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
                        }}
                      >
                        Applied {formatDate(candidate.appliedDate)}
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
                          handleCandidateSelect(candidate);
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
                total={totalCount}
                onChange={handlePageChange}
                showSizeChanger={false}
                showQuickJumper={totalPages > 10}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} candidates`
                }
                itemRender={(current, type, originalElement) => {
                  if (type === "prev") {
                    return (
                      <Button
                        style={{
                          background: "#fff",
                          color: primaryColor,
                          borderColor: "#d9d9d9",
                        }}
                        disabled={isFetching}
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
                        disabled={isFetching}
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
                        disabled={isFetching}
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
                  {searchText || filterStatus !== "all" || filterJob !== "all"
                    ? "No candidates match your search criteria"
                    : "No candidates found"}
                </Text>
              }
            >
              {searchText || filterStatus !== "all" || filterJob !== "all" ? (
                <Button
                  type="primary"
                  onClick={handleClearFilters}
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

  return (
    <div style={{ padding: "16px", minHeight: "100vh" }}>
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={handleBackToCandidates}
          style={{ color: primaryColor }}
        >
          Back to Candidates
        </Button>
      </div>

      <Card>
        <Title level={3}>Individual Candidate Pipeline View</Title>
        <Text>
          This would show the detailed pipeline view for the selected candidate.
        </Text>
      </Card>
    </div>
  );
};

export default RecruiterStagedCandidates;
