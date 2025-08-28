import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
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
  Timeline,
  Progress,
  Tabs,
  Steps,
  Rate,
  Upload,
  DatePicker,
  Alert,
  Statistic,
  Skeleton,
  Result,
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
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  PlusOutlined,
  UploadOutlined,
  MessageOutlined,
  HistoryOutlined,
  TrophyOutlined,
  StarOutlined,
  RightOutlined,
  LeftOutlined,
  ReloadOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  LinkOutlined,
  NotificationOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  useGetUserAppliedJobsQuery,
  useWithdrawJobApplicationMutation,
  useGetSourcedJobsQuery,
} from "../Slices/Users/UserApis";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Application Status Configuration
const APPLICATION_STATUSES = {
  APPLIED: {
    key: "applied",
    label: "Application Submitted",
    color: "#6b7280",
    icon: <FileTextOutlined />,
    description: "Your application has been submitted successfully",
  },
  DECLINED: {
    key: "declined",
    label: "Declined",
    color: "#ef4444",
    icon: <CloseOutlined />,
    description: "You declined this offer",
  },
  SCREENING: {
    key: "screening",
    label: "Screening",
    color: "#f59e0b",
    icon: <EyeOutlined />,
    description: "Your profile is being screened by the recruiter",
  },
  SELECTED: {
    key: "selected",
    label: "Selected",
    color: "#f59e0b",
    icon: <CheckCircleOutlined />,
    description: "Your profile is being selected by the recruiter",
  },
  PIPELINE: {
    key: "pipeline",
    label: "In-Pipeline",
    color: "#8b5cf6",
    icon: <CalendarOutlined />,
    description: "Moved to Pipeline",
  },
  PENDING: {
    key: "in-pending",
    label: "Pending",
    color: "#3b82f6",
    icon: <StarOutlined />,
    description:
      "Your profile is in pending pls update all required documents.",
  },
  // Add the 'interview' status that's coming from your API
  INTERVIEW: {
    key: "interview",
    label: "Interview Scheduled",
    color: "#8b5cf6",
    icon: <CalendarOutlined />,
    description: "Interview has been scheduled",
  },
  INTERVIEW_SCHEDULED: {
    key: "scheduled",
    label: "Interview Scheduled",
    color: "#8b5cf6",
    icon: <CalendarOutlined />,
    description: "Interview has been scheduled",
  },
  INTERVIEW_COMPLETED: {
    key: "interview_completed",
    label: "Interview Completed",
    color: "#06b6d4",
    icon: <CheckCircleOutlined />,
    description: "Interview round completed",
  },
  FINAL_ROUND: {
    key: "final_round",
    label: "Final Round",
    color: "#f59e0b",
    icon: <TrophyOutlined />,
    description: "You are in the final selection round",
  },
  OFFER_EXTENDED: {
    key: "offer_extended",
    label: "Offer Extended",
    color: "#10b981",
    icon: <CheckCircleOutlined />,
    description: "Job offer has been extended to you",
  },
  OFFER: {
    key: "offer",
    label: "Hired",
    color: "#059669",
    icon: <TrophyOutlined />,
    description: "Congratulations! You have been hired",
  },
  REJECTED: {
    key: "rejected",
    label: "Not Selected",
    color: "#ef4444",
    icon: <CloseOutlined />,
    description: "Unfortunately, you were not selected for this position",
  },
  WITHDRAWN: {
    key: "withdrawn",
    label: "Withdrawn",
    color: "#6b7280",
    icon: <LeftOutlined />,
    description: "Application withdrawn by candidate",
  },
};
const CandidateAppliedJobs = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { data: apiData, isLoading, isError } = useGetUserAppliedJobsQuery();
  const { data: sourcedData } = useGetSourcedJobsQuery();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeMainTab, setActiveMainTab] = useState("applied");
  const [activeSubTab, setActiveSubTab] = useState("all");
  // Filter states
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateRangeFilter, setDateRangeFilter] = useState([]);
  const [withdrawJobApplication, { isLoading: isWithdrawing }] =
    useWithdrawJobApplicationMutation();

  useEffect(() => {
    const formattedAppliedJobs =
      apiData?.appliedJobs?.map((app) => {
        const workOrder = app.workOrder;
        return {
          _id: app._id,
          title: workOrder.title,
          company: workOrder.companyIndustry || "Company Name",
          companyLogo: "https://via.placeholder.com/40",
          location: workOrder.officeLocation,
          workType: workOrder.workplace === "on-site" ? "On-site" : "Remote",
          employmentType: workOrder.employmentType || "Full-time",
          experience: workOrder.experience || "Not specified",
          salary: `₹${workOrder.annualSalary}`,
          appliedDate: app.createdAt.split("T")[0],
          status: app.status,
          applicationId: workOrder.jobCode,
          skills: workOrder.requiredSkills || [],
          notes: workOrder.description,
          benefits: workOrder.benefits || [],
          priority: "medium",
          applicationType: "applied",
          timeline: [
            {
              date: app.createdAt.split("T")[0],
              status: "applied",
              note: "Application submitted successfully",
            },
          ],
        };
      }) || [];

    const formattedSourcedJobs =
      sourcedData?.sourcedJobs?.map((job) => {
        const workOrder = job.workOrder;
        console.log(job.status, "SOURCED JOB STATUS");
        return {
          _id: job._id,
          title: workOrder.title,
          company: workOrder.companyIndustry || "Company Name",
          companyLogo: "https://via.placeholder.com/40",
          location: workOrder.officeLocation,
          workType: workOrder.workplace === "on-site" ? "On-site" : "Remote",
          employmentType: workOrder.employmentType || "Full-time",
          experience: workOrder.experience || "Not specified",
          salary: `₹${workOrder.annualSalary}`,
          appliedDate: job.createdAt.split("T")[0],
          status: job.status,
          applicationId: workOrder.jobCode,
          skills: workOrder.requiredSkills || [],
          notes: workOrder.description,
          benefits: workOrder.benefits || [],
          priority: "medium",
          applicationType: "sourced",
          timeline: [
            {
              date: job.createdAt.split("T")[0],
              status: job.status,
              note: "You were sourced for this position",
            },
          ],
        };
      }) || [];

    setApplications([...formattedAppliedJobs, ...formattedSourcedJobs]);
    setFilteredApplications([...formattedAppliedJobs, ...formattedSourcedJobs]);
  }, [apiData, sourcedData]);

  useEffect(() => {
    applyFilters();
  }, [
    searchKeyword,
    statusFilter,
    priorityFilter,
    dateRangeFilter,
    activeMainTab,
    activeSubTab,
    applications,
  ]);

  const applyFilters = () => {
    let filtered = applications.filter((app) => {
      const matchesKeyword =
        !searchKeyword ||
        app.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        app.company.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        app.applicationId.toLowerCase().includes(searchKeyword.toLowerCase());

      const matchesStatus = !statusFilter || app.status === statusFilter;
      const matchesPriority =
        !priorityFilter || app.priority === priorityFilter;

      const matchesDateRange =
        !dateRangeFilter.length ||
        (new Date(app.appliedDate) >= dateRangeFilter[0] &&
          new Date(app.appliedDate) <= dateRangeFilter[1]);

      let matchesMainTab = true;
      if (activeMainTab === "applied") {
        matchesMainTab = app.applicationType === "applied";
      } else if (activeMainTab === "sourced") {
        matchesMainTab = app.applicationType === "sourced";
      }

      let matchesSubTab = true;
      if (activeSubTab === "active") {
        matchesSubTab = ![
          "rejected",
          "declined",
          "withdrawn",
          "offer",
        ].includes(app.status);
      } else if (activeSubTab === "interviews") {
        matchesSubTab = [
          "scheduled",
          "interview_completed",
          "final_round",
        ].includes(app.status);
      } else if (activeSubTab === "offers") {
        matchesSubTab = ["offer_extended", "offer"].includes(app.status);
      } else if (activeSubTab === "closed") {
        matchesSubTab = ["rejected", "declined", "withdrawn", "offer"].includes(
          app.status
        );
      }

      return (
        matchesKeyword &&
        matchesStatus &&
        matchesPriority &&
        matchesDateRange &&
        matchesMainTab &&
        matchesSubTab
      );
    });

    setFilteredApplications(filtered);
    setCurrentPage(1);
  };

  const handleApplicationClick = (application) => {
    if (application.applicationType === "sourced") {
      navigate(`/candidate-applied-jobs/sourced-jobs/${application._id}`);
    } else {
      navigate(`/candidate-applied-jobs/applied-jobs/${application._id}`);
    }
  };

  const handleWithdrawApplication = (application) => {
    setSelectedApplication(application);
    setWithdrawModalVisible(true);
  };

  const confirmWithdraw = async () => {
    if (selectedApplication) {
      try {
        await withdrawJobApplication(selectedApplication._id).unwrap();

        setApplications((prev) =>
          prev.map((app) =>
            app._id === selectedApplication._id
              ? {
                  ...app,
                  status: "withdrawn",
                  withdrawnDate: new Date().toISOString().split("T")[0],
                }
              : app
          )
        );
        enqueueSnackbar("Application withdrawn successfully", {
          variant: "success",
        });
        setWithdrawModalVisible(false);
        setSelectedApplication(null);
      } catch (error) {
        enqueueSnackbar("Failed to withdraw application. Please try again.", {
          variant: "error",
        });
        console.error("Withdrawal error:", error);
      }
    }
  };

  const getStatusConfig = (status) => {
    const statusKey = status?.toUpperCase();
    return APPLICATION_STATUSES[statusKey] || APPLICATION_STATUSES.APPLIED;
  };

  const getStatusProgress = (status) => {
    const statusOrder = [
      "applied",
      "under_review",
      "in-pending",
      "interview",
      "interview_completed",
      "final_round",
      "offer_extended",
      "offer",
    ];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "today";
    if (diffDays < 30) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getCurrentPageApplications = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredApplications.slice(startIndex, endIndex);
  };

  const getMainTabCount = (mainTabKey) => {
    return applications.filter((app) => {
      if (mainTabKey === "applied") return app.applicationType === "applied";
      if (mainTabKey === "sourced") return app.applicationType === "sourced";
      return false;
    }).length;
  };

  const getSubTabCount = (mainTabKey, subTabKey) => {
    return applications.filter((app) => {
      let matchesMainTab = true;
      if (mainTabKey === "applied") {
        matchesMainTab = app.applicationType === "applied";
      } else if (mainTabKey === "sourced") {
        matchesMainTab = app.applicationType === "sourced";
      }

      if (!matchesMainTab) return false;

      if (subTabKey === "all") return true;
      if (subTabKey === "active") {
        return !["rejected", "declined", "withdrawn", "offer"].includes(
          app.status
        );
      }
      if (subTabKey === "interviews") {
        return [
          "interview_scheduled",
          "interview_completed",
          "final_round",
        ].includes(app.status);
      }
      if (subTabKey === "offers") {
        return ["offer_extended", "offer"].includes(app.status);
      }
      if (subTabKey === "closed") {
        return ["rejected", "declined", "withdrawn", "offer"].includes(
          app.status
        );
      }
      return false;
    }).length;
  };

  const getTabCount = (tabKey) => {
    return applications.filter((app) => {
      if (tabKey === "applied") return app.applicationType === "applied";
      if (tabKey === "sourced") return app.applicationType === "sourced";
      if (tabKey === "active")
        return !["rejected", "declined", "withdrawn", "offer"].includes(
          app.status
        );
      if (tabKey === "interviews")
        return [
          "interview_scheduled",
          "interview_completed",
          "final_round",
        ].includes(app.status);
      if (tabKey === "offers")
        return ["offer_extended", "offer"].includes(app.status);
      return false;
    }).length;
  };

  const clearFilters = () => {
    setSearchKeyword("");
    setStatusFilter("");
    setDateRangeFilter([]);
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

  if (isError) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <Alert
          message="Error"
          description="Failed to load applied jobs. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          padding: "12px 16px",
          minHeight: "100vh",
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <Title
            level={2}
            style={{ margin: 0, color: "#2c3e50", textAlign: "center" }}
          >
            <FileTextOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            My Job Applications
          </Title>
          <Text
            type="secondary"
            style={{ display: "block", textAlign: "center", marginTop: 8 }}
          >
            Track all your job applications in one place
          </Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={12} sm={6} md={6} lg={6}>
            <Card style={{ borderRadius: "12px", textAlign: "center" }}>
              <Statistic
                title={`Total ${
                  activeMainTab === "applied" ? "Applied" : "Sourced"
                }`}
                value={getMainTabCount(activeMainTab)}
                valueStyle={{ color: "#da2c46" }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6} lg={6}>
            <Card style={{ borderRadius: "12px", textAlign: "center" }}>
              <Statistic
                title="Active Applications"
                value={getSubTabCount(activeMainTab, "active")}
                valueStyle={{ color: "#1890ff" }}
                prefix={<SyncOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6} lg={6}>
            <Card style={{ borderRadius: "12px", textAlign: "center" }}>
              <Statistic
                title="Interviews"
                value={getSubTabCount(activeMainTab, "interviews")}
                valueStyle={{ color: "#722ed1" }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6} md={6} lg={6}>
            <Card style={{ borderRadius: "12px", textAlign: "center" }}>
              <Statistic
                title="Offers"
                value={getSubTabCount(activeMainTab, "offers")}
                valueStyle={{ color: "#52c41a" }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* Search and Filter Section */}
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Row gutter={[12, 16]} align="middle">
            <Col xs={24} sm={24} md={12} lg={12}>
              <Search
                placeholder="Search applications..."
                size="large"
                prefix={<SearchOutlined style={{ color: "#6b7280" }} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{
                  ".ant-input": {
                    borderColor: "#d1d5db",
                    borderRadius: "12px",
                  },
                }}
              />
            </Col>
            <Col xs={12} sm={12} md={6} lg={8}>
              <Select
                placeholder="Status"
                size="large"
                style={{ width: "100%" }}
                value={statusFilter || undefined}
                onChange={setStatusFilter}
                allowClear={!!statusFilter}
              >
                {Object.values(APPLICATION_STATUSES).map((status) => (
                  <Option key={status.key} value={status.key}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: status.color,
                        }}
                      />
                      {status.label}
                    </div>
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={4} lg={4}>
              <Button
                size="large"
                style={{
                  width: "100%",
                  border: "none",
                  color: "white",
                  background:
                    "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                }}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Tabs for filtering */}
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "16px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Tabs
            activeKey={activeMainTab}
            onChange={(key) => {
              setActiveMainTab(key);
              setActiveSubTab("all");
            }}
            size="large"
            type="line"
            style={{
              ".ant-tabs-tab": {
                color: "#6b7280",
                fontWeight: 500,
              },
              ".ant-tabs-tab-active": {
                color: "#1f2937",
                fontWeight: 600,
              },
            }}
          >
            <TabPane
              tab={`Applied (${getMainTabCount("applied")})`}
              key="applied"
            >
              <Tabs
                activeKey={activeSubTab}
                onChange={setActiveSubTab}
                size="default"
                type="card"
                style={{ marginTop: "16px" }}
              >
                <TabPane
                  tab={`All (${getSubTabCount("applied", "all")})`}
                  key="all"
                />
                <TabPane
                  tab={`Active (${getSubTabCount("applied", "active")})`}
                  key="active"
                />
                <TabPane
                  tab={`Interviews (${getSubTabCount(
                    "applied",
                    "interviews"
                  )})`}
                  key="interviews"
                />
                <TabPane
                  tab={`Offers (${getSubTabCount("applied", "offers")})`}
                  key="offers"
                />
                <TabPane
                  tab={`Closed (${getSubTabCount("applied", "closed")})`}
                  key="closed"
                />
              </Tabs>
            </TabPane>

            <TabPane
              tab={`Sourced (${getMainTabCount("sourced")})`}
              key="sourced"
            >
              <Tabs
                activeKey={activeSubTab}
                onChange={setActiveSubTab}
                size="default"
                type="card"
                style={{ marginTop: "16px" }}
              >
                <TabPane
                  tab={`All (${getSubTabCount("sourced", "all")})`}
                  key="all"
                />
                <TabPane
                  tab={`Active (${getSubTabCount("sourced", "active")})`}
                  key="active"
                />
                <TabPane
                  tab={`Interviews (${getSubTabCount(
                    "sourced",
                    "interviews"
                  )})`}
                  key="interviews"
                />
                <TabPane
                  tab={`Offers (${getSubTabCount("sourced", "offers")})`}
                  key="offers"
                />
                <TabPane
                  tab={`Closed (${getSubTabCount("sourced", "closed")})`}
                  key="closed"
                />
              </Tabs>
            </TabPane>
          </Tabs>
        </Card>

        {/* Results Counter */}
        <div style={{ marginBottom: "20px" }}>
          <Text
            style={{
              fontSize: "clamp(14px, 2.5vw, 16px)",
              fontWeight: 500,
              color: "#374151",
            }}
          >
            {filteredApplications.length} applications found
          </Text>
        </div>

        {/* Application Listings */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" />
          </div>
        ) : filteredApplications.length > 0 ? (
          <>
            <Row gutter={[12, 16]}>
              {getCurrentPageApplications().map((application) => {
                const statusConfig = getStatusConfig(application.status);
                return (
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={8}
                    xl={8}
                    key={application._id}
                  >
                    <Card
                      hoverable
                      style={{
                        borderRadius: "16px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        border: "1px solid #e5e7eb",
                        height: "460px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      bodyStyle={{
                        padding: "20px",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onClick={() => handleApplicationClick(application)}
                    >
                      {/* Company Logo and Header */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "12px",
                          marginBottom: "16px",
                        }}
                      >
                        <Avatar
                          src={application.companyLogo}
                          size={48}
                          style={{
                            backgroundColor: "#f3f4f6",
                            color: "#6b7280",
                          }}
                        >
                          {application.company[0]}
                        </Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Title
                            level={5}
                            style={{
                              margin: 0,
                              fontSize: "clamp(14px, 2.5vw, 16px)",
                              fontWeight: 600,
                              color: "#1f2937",
                              lineHeight: 1.3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {application.title}
                          </Title>
                          <Text
                            style={{
                              fontSize: "clamp(12px, 2vw, 14px)",
                              color: "#6b7280",
                              fontWeight: 500,
                            }}
                          >
                            {application.company}
                          </Text>
                        </div>
                      </div>

                      {/* Status and Progress */}
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <Tag
                            icon={statusConfig.icon}
                            color={statusConfig.color}
                            style={{
                              border: "none",
                              borderRadius: "20px",
                              padding: "4px 12px",
                              fontSize: "clamp(10px, 2vw, 12px)",
                              fontWeight: 500,
                            }}
                          >
                            {statusConfig.label}
                          </Tag>
                          <Text
                            style={{
                              fontSize: "clamp(10px, 2vw, 12px)",
                              color: "#9ca3af",
                              fontWeight: 500,
                            }}
                          >
                            {application.applicationId}
                          </Text>
                        </div>

                        {!["rejected", "withdrawn"].includes(
                          application.status
                        ) && (
                          <Progress
                            percent={getStatusProgress(application.status)}
                            strokeColor={{
                              "0%": statusConfig.color,
                              "100%": statusConfig.color,
                            }}
                            showInfo={false}
                            strokeWidth={6}
                            style={{ marginBottom: "8px" }}
                          />
                        )}
                      </div>

                      {/* Job Details */}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <EnvironmentOutlined
                            style={{ color: "#6b7280", fontSize: "12px" }}
                          />
                          <Text
                            style={{
                              fontSize: "clamp(11px, 2vw, 13px)",
                              color: "#374151",
                            }}
                          >
                            {application.location} • {application.workType}
                          </Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <DollarOutlined
                            style={{ color: "#6b7280", fontSize: "12px" }}
                          />
                          <Text
                            style={{
                              fontSize: "clamp(11px, 2vw, 13px)",
                              color: "#374151",
                            }}
                          >
                            {application.salary}
                          </Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <ClockCircleOutlined
                            style={{ color: "#6b7280", fontSize: "12px" }}
                          />
                          <Text
                            style={{
                              fontSize: "clamp(11px, 2vw, 13px)",
                              color: "#374151",
                            }}
                          >
                            Applied {formatDate(application.appliedDate)}
                          </Text>
                        </div>
                      </div>

                      {/* Skills Tags */}
                      <div style={{ marginTop: "auto" }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                            maxHeight: "60px",
                            overflow: "hidden",
                          }}
                        >
                          {application.skills
                            .slice(0, 4)
                            .map((skill, index) => (
                              <Tag
                                key={index}
                                style={{
                                  backgroundColor: "#f3f4f6",
                                  color: "#374151",
                                  border: "none",
                                  borderRadius: "6px",
                                  fontSize: "clamp(9px, 1.8vw, 11px)",
                                  padding: "2px 8px",
                                  fontWeight: 500,
                                }}
                              >
                                {skill}
                              </Tag>
                            ))}
                          {application.skills.length > 4 && (
                            <Tag
                              style={{
                                backgroundColor: "#e5e7eb",
                                color: "#6b7280",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "clamp(9px, 1.8vw, 11px)",
                                padding: "2px 8px",
                                fontWeight: 500,
                              }}
                            >
                              +{application.skills.length - 4}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Pagination */}
            <div
              style={{
                display: "flex",
                justifyContent: "right",
                marginTop: "32px",
                marginBottom: "24px",
              }}
            >
              <Pagination
                current={currentPage}
                total={filteredApplications.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} applications`
                }
                style={{
                  ".ant-pagination-item": {
                    borderRadius: "8px",
                  },
                }}
              />
            </div>
          </>
        ) : (
          <Card
            style={{
              textAlign: "center",
              padding: "60px 20px",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Empty
              description={
                <Text type="secondary">
                  No applications found. Try adjusting your filters.
                </Text>
              }
            />
          </Card>
        )}
      </div>
      {/* Application Detail Modal */}
      {selectedApplication && (
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Avatar
                src={selectedApplication.companyLogo}
                size={40}
                style={{
                  backgroundColor: "#f3f4f6",
                  color: "#6b7280",
                }}
              >
                {selectedApplication.company[0]}
              </Avatar>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "18px",
                    color: "#1f2937",
                  }}
                >
                  {selectedApplication.title}
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  {selectedApplication.company}
                </div>
              </div>
            </div>
          }
          open={detailModalVisible}
          onCancel={() => {
            setDetailModalVisible(false);
            setSelectedApplication(null);
          }}
          width="90%"
          style={{ maxWidth: 800 }}
          footer={
            <div
              style={{
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
                padding: "16px 0 0 0",
              }}
              className="application-modal-footer"
            >
              <Button
                key="close"
                onClick={() => setDetailModalVisible(false)}
                style={{
                  minWidth: "100px",
                  height: "40px",
                  flex: "1 1 auto",
                  maxWidth: "120px",
                }}
              >
                Close
              </Button>

              {selectedApplication?.applicationType === "applied" &&
                !["offer", "rejected", "withdrawn"].includes(
                  selectedApplication.status
                ) && (
                  <Button
                    key="withdraw"
                    danger
                    onClick={() =>
                      handleWithdrawApplication(selectedApplication)
                    }
                    style={{
                      minWidth: "140px",
                      height: "40px",
                      flex: "1 1 auto",
                      maxWidth: "180px",
                      fontWeight: 500,
                      borderColor: "#ff4d4f",
                      color: "#ff4d4f",
                    }}
                  >
                    Withdraw Application
                  </Button>
                )}
            </div>
          }
        >
          <Tabs defaultActiveKey="overview" style={{ marginTop: "24px" }}>
            <TabPane tab="Overview" key="overview">
              <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
                <Descriptions.Item label="Application ID">
                  {selectedApplication.applicationId}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag
                    icon={getStatusConfig(selectedApplication.status).icon}
                    color={getStatusConfig(selectedApplication.status).color}
                    style={{ borderRadius: "12px", padding: "4px 12px" }}
                  >
                    {getStatusConfig(selectedApplication.status).label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {selectedApplication.location}
                </Descriptions.Item>
                <Descriptions.Item label="Work Type">
                  {selectedApplication.workType}
                </Descriptions.Item>
                <Descriptions.Item label="Employment Type">
                  {selectedApplication.employmentType}
                </Descriptions.Item>
                <Descriptions.Item label="Experience Required">
                  {selectedApplication.experience}
                </Descriptions.Item>
                <Descriptions.Item label="Salary Range">
                  {selectedApplication.salary}
                </Descriptions.Item>
                <Descriptions.Item label="Applied Date">
                  {new Date(
                    selectedApplication.appliedDate
                  ).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="Skills Required">
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {selectedApplication.skills.map((skill, index) => (
                      <Tag key={index} style={{ borderRadius: "8px" }}>
                        {skill}
                      </Tag>
                    ))}
                  </div>
                </Descriptions.Item>
                {selectedApplication.notes && (
                  <Descriptions.Item label="Description">
                    {selectedApplication.notes}
                  </Descriptions.Item>
                )}
                {selectedApplication.benefits &&
                  selectedApplication.benefits.length > 0 && (
                    <Descriptions.Item label="Benefits">
                      <ul style={{ margin: 0, paddingLeft: "20px" }}>
                        {selectedApplication.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </Descriptions.Item>
                  )}
              </Descriptions>
            </TabPane>

            <TabPane tab="Timeline" key="timeline">
              <Timeline
                items={selectedApplication.timeline.map((item, index) => ({
                  dot: React.cloneElement(getStatusConfig(item.status).icon, {
                    style: { color: getStatusConfig(item.status).color },
                  }),
                  color: getStatusConfig(item.status).color,
                  children: (
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {getStatusConfig(item.status).label}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "14px",
                          marginBottom: "4px",
                        }}
                      >
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: "14px" }}>{item.note}</div>
                    </div>
                  ),
                }))}
              />
            </TabPane>
          </Tabs>
        </Modal>
      )}

      {/* Withdraw Confirmation Modal */}
      <Modal
        title="Withdraw Application"
        open={withdrawModalVisible}
        onOk={confirmWithdraw}
        onCancel={() => {
          setWithdrawModalVisible(false);
          setSelectedApplication(null);
        }}
        okText="Yes, Withdraw"
        cancelText="Cancel"
        okButtonProps={{
          danger: true,
          loading: isWithdrawing,
        }}
        confirmLoading={isWithdrawing}
      >
        <p>Are you sure you want to withdraw your application for:</p>
        {selectedApplication && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              margin: "16px 0",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: "16px" }}>
              {selectedApplication.title}
            </div>
            <div style={{ color: "#6b7280" }}>
              {selectedApplication.company}
            </div>
          </div>
        )}
        <p style={{ color: "#ef4444", fontSize: "14px" }}>
          <ExclamationCircleOutlined style={{ marginRight: "8px" }} />
          Note: Once withdrawn, you cannot reapply for this position
        </p>
      </Modal>
    </>
  );
};

export default CandidateAppliedJobs;
