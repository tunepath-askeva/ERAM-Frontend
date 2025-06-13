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
    Timeline,
    Progress,
    Tabs,
    Steps,
    Rate,
    Upload,
    DatePicker,
    Alert,
    Statistic,
    Popconfirm,
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

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Application Status Configuration
const APPLICATION_STATUSES = {
    SUBMITTED: {
        key: 'submitted',
        label: 'Application Submitted',
        color: '#6b7280',
        icon: <FileTextOutlined />,
        description: 'Your application has been submitted successfully'
    },
    UNDER_REVIEW: {
        key: 'under_review',
        label: 'Under Review',
        color: '#f59e0b',
        icon: <EyeOutlined />,
        description: 'HR team is reviewing your application'
    },
    SHORTLISTED: {
        key: 'shortlisted',
        label: 'Shortlisted',
        color: '#3b82f6',
        icon: <StarOutlined />,
        description: 'Congratulations! You have been shortlisted'
    },
    INTERVIEW_SCHEDULED: {
        key: 'interview_scheduled',
        label: 'Interview Scheduled',
        color: '#8b5cf6',
        icon: <CalendarOutlined />,
        description: 'Interview has been scheduled'
    },
    INTERVIEW_COMPLETED: {
        key: 'interview_completed',
        label: 'Interview Completed',
        color: '#06b6d4',
        icon: <CheckCircleOutlined />,
        description: 'Interview round completed'
    },
    FINAL_ROUND: {
        key: 'final_round',
        label: 'Final Round',
        color: '#f59e0b',
        icon: <TrophyOutlined />,
        description: 'You are in the final selection round'
    },
    OFFER_EXTENDED: {
        key: 'offer_extended',
        label: 'Offer Extended',
        color: '#10b981',
        icon: <CheckCircleOutlined />,
        description: 'Job offer has been extended to you'
    },
    HIRED: {
        key: 'hired',
        label: 'Hired',
        color: '#059669',
        icon: <TrophyOutlined />,
        description: 'Congratulations! You have been hired'
    },
    REJECTED: {
        key: 'rejected',
        label: 'Not Selected',
        color: '#ef4444',
        icon: <CloseOutlined />,
        description: 'Unfortunately, you were not selected for this position'
    },
    WITHDRAWN: {
        key: 'withdrawn',
        label: 'Withdrawn',
        color: '#6b7280',
        icon: <LeftOutlined />,
        description: 'Application withdrawn by candidate'
    }
};

// Mock data for applied jobs
const mockAppliedJobs = [
    {
        _id: "1",
        title: "Senior Frontend Developer",
        company: "TechCorp Solutions",
        companyLogo: "https://via.placeholder.com/40",
        location: "Bengaluru, Karnataka, India",
        workType: "Hybrid",
        employmentType: "Full-time",
        experience: "3-5 years",
        salary: "₹12-18 LPA",
        appliedDate: "2025-06-08",
        status: "interview_scheduled",
        applicationId: "APP001",
        skills: ["React.js", "TypeScript", "Node.js", "GraphQL"],
        interviewDate: "2025-06-12",
        interviewTime: "10:00 AM",
        interviewType: "Video Interview",
        interviewDetails: {
            platform: "Google Meet",
            link: "https://meet.google.com/xyz-abc-def",
            interviewer: "Sarah Johnson",
            designation: "Senior Technical Lead",
            phone: "+91 9876543210",
            email: "sarah.johnson@techcorp.com"
        },
        timeline: [
            { date: "2025-06-08", status: "submitted", note: "Application submitted successfully" },
            { date: "2025-06-09", status: "under_review", note: "Application under review by HR team" },
            { date: "2025-06-10", status: "shortlisted", note: "Shortlisted for technical interview" },
            { date: "2025-06-11", status: "interview_scheduled", note: "Technical interview scheduled for June 12th" }
        ],
        notes: "Prepare for React concepts, system design, and coding challenges",
        priority: "high"
    },
    {
        _id: "2",
        title: "Data Scientist",
        company: "Analytics Pro",
        companyLogo: "https://via.placeholder.com/40",
        location: "Mumbai, Maharashtra, India",
        workType: "Remote",
        employmentType: "Full-time",
        experience: "2-4 years",
        salary: "₹10-16 LPA",
        appliedDate: "2025-06-05",
        status: "offer_extended",
        applicationId: "APP002",
        skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
        offerDetails: {
            salary: "₹14 LPA",
            joiningDate: "2025-07-01",
            offerValidTill: "2025-06-20",
            benefits: ["Health Insurance", "Flexible Work Hours", "Learning Budget"]
        },
        timeline: [
            { date: "2025-06-05", status: "submitted", note: "Application submitted" },
            { date: "2025-06-06", status: "under_review", note: "Initial screening completed" },
            { date: "2025-06-07", status: "interview_scheduled", note: "Technical round scheduled" },
            { date: "2025-06-08", status: "interview_completed", note: "Technical interview completed" },
            { date: "2025-06-09", status: "final_round", note: "HR round scheduled" },
            { date: "2025-06-10", status: "offer_extended", note: "Job offer extended" }
        ],
        notes: "Great team culture and learning opportunities",
        priority: "high"
    },
    {
        _id: "3",
        title: "UI/UX Designer",
        company: "Design Studio",
        companyLogo: "https://via.placeholder.com/40",
        location: "Pune, Maharashtra, India",
        workType: "On-site",
        employmentType: "Full-time",
        experience: "1-3 years",
        salary: "₹6-10 LPA",
        appliedDate: "2025-06-01",
        status: "rejected",
        applicationId: "APP003",
        skills: ["Figma", "Adobe XD", "Prototyping", "User Research"],
        rejectionReason: "Looking for candidates with more experience in user research",
        timeline: [
            { date: "2025-06-01", status: "submitted", note: "Portfolio submitted" },
            { date: "2025-06-02", status: "under_review", note: "Portfolio review in progress" },
            { date: "2025-06-04", status: "rejected", note: "Not selected - seeking more UX research experience" }
        ],
        feedback: "Strong visual design skills, but need more user research experience",
        priority: "medium"
    },
    {
        _id: "4",
        title: "Backend Engineer",
        company: "Startup Inc",
        companyLogo: "https://via.placeholder.com/40",
        location: "Hyderabad, Telangana, India",
        workType: "Hybrid",
        employmentType: "Full-time",
        experience: "2-5 years",
        salary: "₹8-14 LPA",
        appliedDate: "2025-06-07",
        status: "under_review",
        applicationId: "APP004",
        skills: ["Python", "Django", "PostgreSQL", "Redis"],
        timeline: [
            { date: "2025-06-07", status: "submitted", note: "Application submitted with coding test" },
            { date: "2025-06-08", status: "under_review", note: "Coding test under evaluation" }
        ],
        notes: "Submitted coding assignment - waiting for feedback",
        priority: "medium"
    },
    {
        _id: "5",
        title: "DevOps Engineer",
        company: "Cloud Solutions",
        companyLogo: "https://via.placeholder.com/40",
        location: "Chennai, Tamil Nadu, India",
        workType: "Remote",
        employmentType: "Contract",
        experience: "3-6 years",
        salary: "₹15-22 LPA",
        appliedDate: "2025-05-28",
        status: "hired",
        applicationId: "APP005",
        skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
        joiningDate: "2025-06-15",
        timeline: [
            { date: "2025-05-28", status: "submitted", note: "Application with portfolio submitted" },
            { date: "2025-05-30", status: "shortlisted", note: "Technical screening passed" },
            { date: "2025-06-02", status: "interview_completed", note: "Technical interview completed" },
            { date: "2025-06-04", status: "offer_extended", note: "Job offer received" },
            { date: "2025-06-06", status: "hired", note: "Offer accepted - joining on June 15th" }
        ],
        notes: "Exciting opportunity to work with cutting-edge cloud technologies",
        priority: "high"
    }
];

const CandidateAppliedJobs = () => {
    const [applications, setApplications] = useState(mockAppliedJobs);
    const [filteredApplications, setFilteredApplications] = useState(mockAppliedJobs);
    const [loading, setLoading] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(6);
    const [activeTab, setActiveTab] = useState("all");

    // Filter states
    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [dateRangeFilter, setDateRangeFilter] = useState([]);

    useEffect(() => {
        applyFilters();
    }, [searchKeyword, statusFilter, priorityFilter, dateRangeFilter, activeTab]);

    const applyFilters = () => {
        let filtered = applications.filter(app => {
            const matchesKeyword = !searchKeyword ||
                app.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                app.company.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                app.applicationId.toLowerCase().includes(searchKeyword.toLowerCase());

            const matchesStatus = !statusFilter || app.status === statusFilter;
            const matchesPriority = !priorityFilter || app.priority === priorityFilter;

            const matchesDateRange = !dateRangeFilter.length || (
                new Date(app.appliedDate) >= dateRangeFilter[0] &&
                new Date(app.appliedDate) <= dateRangeFilter[1]
            );

            // Tab-based filtering
            let matchesTab = true;
            if (activeTab === "active") {
                matchesTab = !["rejected", "withdrawn", "hired"].includes(app.status);
            } else if (activeTab === "interviews") {
                matchesTab = ["interview_scheduled", "interview_completed", "final_round"].includes(app.status);
            } else if (activeTab === "offers") {
                matchesTab = ["offer_extended", "hired"].includes(app.status);
            } else if (activeTab === "closed") {
                matchesTab = ["rejected", "withdrawn", "hired"].includes(app.status);
            }

            return matchesKeyword && matchesStatus && matchesPriority && matchesDateRange && matchesTab;
        });

        setFilteredApplications(filtered);
        setCurrentPage(1);
    };

    const handleApplicationClick = (application) => {
        setSelectedApplication(application);
        setDetailModalVisible(true);
    };

    const handleWithdrawApplication = (application) => {
        setSelectedApplication(application);
        setWithdrawModalVisible(true);
    };

    const confirmWithdraw = () => {
        if (selectedApplication) {
            setApplications(prev =>
                prev.map(app =>
                    app._id === selectedApplication._id
                        ? { ...app, status: "withdrawn", withdrawnDate: new Date().toISOString().split('T')[0] }
                        : app
                )
            );
            message.success("Application withdrawn successfully");
            setWithdrawModalVisible(false);
            setSelectedApplication(null);
        }
    };

    const getStatusConfig = (status) => APPLICATION_STATUSES[status.toUpperCase()] || APPLICATION_STATUSES.SUBMITTED;

    const getStatusProgress = (status) => {
        const statusOrder = ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed', 'final_round', 'offer_extended', 'hired'];
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

    const getTabCount = (tabKey) => {
        return applications.filter(app => {
            if (tabKey === "all") return true;
            if (tabKey === "active") return !["rejected", "withdrawn", "hired"].includes(app.status);
            if (tabKey === "interviews") return ["interview_scheduled", "interview_completed", "final_round"].includes(app.status);
            if (tabKey === "offers") return ["offer_extended", "hired"].includes(app.status);
            if (tabKey === "closed") return ["rejected", "withdrawn", "hired"].includes(app.status);
            return false;
        }).length;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const clearFilters = () => {
        setSearchKeyword("");
        setStatusFilter("");
        setPriorityFilter("");
        setDateRangeFilter([]);
    };

    return (
        <>
            <div style={{
                padding: "12px 16px",
                minHeight: "100vh",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                    <Title level={2} style={{ margin: 0, color: "#2c3e50", textAlign: "center" }}>
                        <FileTextOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                        Empowering Your Career Journey
                    </Title>
                    <Text type="secondary" style={{ display: "block", textAlign: "center", marginTop: 8 }}>
                        Personalized job matches for your unique aspirations.
                    </Text>
                </div>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
                    <Col xs={12} sm={6} md={6} lg={6}>
                        <Card style={{ borderRadius: "12px", textAlign: "center" }}>
                            <Statistic
                                title="Total Applications"
                                value={applications.length}
                                valueStyle={{ color: "#da2c46" }}
                                prefix={<FileTextOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6}>
                        <Card style={{ borderRadius: "12px", textAlign: "center" }}>
                            <Statistic
                                title="Active Applications"
                                value={getTabCount("active")}
                                valueStyle={{ color: "#1890ff" }}
                                prefix={<SyncOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6}>
                        <Card style={{ borderRadius: "12px", textAlign: "center" }}>
                            <Statistic
                                title="Interviews"
                                value={getTabCount("interviews")}
                                valueStyle={{ color: "#722ed1" }}
                                prefix={<CalendarOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6} md={6} lg={6}>
                        <Card style={{ borderRadius: "12px", textAlign: "center" }}>
                            <Statistic
                                title="Offers"
                                value={getTabCount("offers")}
                                valueStyle={{ color: "#52c41a" }}
                                prefix={<TrophyOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Search and Filter Section */}
                <Card style={{
                    marginBottom: "24px",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                }}>
                    <Row gutter={[12, 16]} align="middle">
                        <Col xs={24} sm={24} md={12} lg={8}>
                            <Search
                                placeholder="Search applications..."
                                size="large"
                                prefix={<SearchOutlined style={{ color: "#6b7280" }} />}
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                style={{
                                    '.ant-input': {
                                        borderColor: '#d1d5db',
                                        borderRadius: '12px'
                                    }
                                }}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={4}>
                            <Select
                                placeholder="Status"
                                size="large"
                                style={{ width: "100%" }}
                                value={statusFilter || undefined} // Ensure undefined when empty to show placeholder
                                onChange={setStatusFilter}
                                allowClear={!!statusFilter} // Only show clear icon when there's a value
                            >
                                {Object.values(APPLICATION_STATUSES).map(status => (
                                    <Option key={status.key} value={status.key}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div
                                                style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: status.color
                                                }}
                                            />
                                            {status.label}
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={4}>
                            <Select
                                placeholder="Priority"
                                size="large"
                                style={{ width: "100%" }}
                                value={priorityFilter || undefined} // Ensure undefined when empty to show placeholder
                                onChange={setPriorityFilter}
                                allowClear={!!priorityFilter} // Only show clear icon when there's a value
                            >
                                <Option value="high">High Priority</Option>
                                <Option value="medium">Medium Priority</Option>
                                <Option value="low">Low Priority</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={4}>
                            <RangePicker
                                size="large"
                                style={{ width: "100%" }}
                                value={dateRangeFilter}
                                onChange={setDateRangeFilter}
                                placeholder={["From Date", "To Date"]}
                            />
                        </Col>
                        <Col xs={24} sm={12} md={4} lg={4}>
                            <Button
                                size="large"
                                style={{
                                    width: "100%",
                                    border: "none",
                                    color: "white",
                                    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)"
                                }}
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </Card>

                {/* Tabs for filtering */}
                <Card style={{
                    marginBottom: "24px",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        size="large"
                        type="line"
                        style={{
                            '.ant-tabs-tab': {
                                color: '#6b7280',
                                fontWeight: 500
                            },
                            '.ant-tabs-tab-active': {
                                color: '#1f2937',
                                fontWeight: 600
                            }
                        }}
                    >
                        <TabPane tab="All Applications" key="all" />
                        <TabPane tab="Active" key="active" />
                        <TabPane tab="Interviews" key="interviews" />
                        <TabPane tab="Offers" key="offers" />
                        <TabPane tab="Closed" key="closed" />
                    </Tabs>
                </Card>

                {/* Results Counter */}
                <div style={{ marginBottom: "20px" }}>
                    <Text style={{
                        fontSize: "clamp(14px, 2.5vw, 16px)",
                        fontWeight: 500,
                        color: "#374151"
                    }}>
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
                                    <Col xs={24} sm={24} md={12} lg={8} xl={8} key={application._id}>
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
                                                flexDirection: "column"
                                            }}
                                            bodyStyle={{
                                                padding: "20px",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column"
                                            }}
                                            onClick={() => handleApplicationClick(application)}
                                            actions={[
                                                <Tooltip title="View Details" key="view">
                                                    <Button
                                                        type="text"
                                                        icon={<EyeOutlined />}
                                                        style={{ color: "#6b7280" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleApplicationClick(application);
                                                        }}
                                                    />
                                                </Tooltip>,
                                                <Tooltip title="Contact" key="contact">
                                                    <Button
                                                        type="text"
                                                        icon={<MailOutlined />}
                                                        style={{ color: "#6b7280" }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle contact functionality
                                                        }}
                                                    />
                                                </Tooltip>,
                                                <Tooltip title="Withdraw Application" key="withdraw">
                                                    <Popconfirm
                                                        title="Are you sure you want to withdraw this application?"
                                                        onConfirm={(e) => {
                                                            e.stopPropagation();
                                                            handleWithdrawApplication(application);
                                                        }}
                                                        okText="Yes"
                                                        cancelText="No"
                                                        disabled={["hired", "rejected", "withdrawn"].includes(application.status)}
                                                    >
                                                        <Button
                                                            type="text"
                                                            icon={<DeleteOutlined />}
                                                            style={{
                                                                color: ["hired", "rejected", "withdrawn"].includes(application.status)
                                                                    ? "#d1d5db"
                                                                    : "#ef4444"
                                                            }}
                                                            disabled={["hired", "rejected", "withdrawn"].includes(application.status)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </Popconfirm>
                                                </Tooltip>
                                            ]}
                                        >
                                            {/* Priority Badge */}
                                            <div style={{ position: "absolute", top: "12px", right: "12px", zIndex: 1 }}>
                                                <Badge
                                                    color={getPriorityColor(application.priority)}
                                                    text={
                                                        <span style={{
                                                            fontSize: "10px",
                                                            fontWeight: 600,
                                                            textTransform: "uppercase",
                                                            color: getPriorityColor(application.priority)
                                                        }}>
                                                            {application.priority}
                                                        </span>
                                                    }
                                                />
                                            </div>

                                            {/* Company Logo and Header */}
                                            <div style={{
                                                display: "flex",
                                                alignItems: "flex-start",
                                                gap: "12px",
                                                marginBottom: "16px"
                                            }}>
                                                <Avatar
                                                    src={application.companyLogo}
                                                    size={48}
                                                    style={{
                                                        backgroundColor: "#f3f4f6",
                                                        color: "#6b7280"
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
                                                            overflow: "hidden"
                                                        }}
                                                    >
                                                        {application.title}
                                                    </Title>
                                                    <Text
                                                        style={{
                                                            fontSize: "clamp(12px, 2vw, 14px)",
                                                            color: "#6b7280",
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {application.company}
                                                    </Text>
                                                </div>
                                            </div>

                                            {/* Status and Progress */}
                                            <div style={{ marginBottom: "16px" }}>
                                                <div style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    marginBottom: "8px"
                                                }}>
                                                    <Tag
                                                        icon={statusConfig.icon}
                                                        color={statusConfig.color}
                                                        style={{
                                                            border: "none",
                                                            borderRadius: "20px",
                                                            padding: "4px 12px",
                                                            fontSize: "clamp(10px, 2vw, 12px)",
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {statusConfig.label}
                                                    </Tag>
                                                    <Text style={{
                                                        fontSize: "clamp(10px, 2vw, 12px)",
                                                        color: "#9ca3af",
                                                        fontWeight: 500
                                                    }}>
                                                        {application.applicationId}
                                                    </Text>
                                                </div>

                                                {!["rejected", "withdrawn"].includes(application.status) && (
                                                    <Progress
                                                        percent={getStatusProgress(application.status)}
                                                        strokeColor={{
                                                            '0%': statusConfig.color,
                                                            '100%': statusConfig.color,
                                                        }}
                                                        showInfo={false}
                                                        strokeWidth={6}
                                                        style={{ marginBottom: "8px" }}
                                                    />
                                                )}
                                            </div>

                                            {/* Job Details */}
                                            <div style={{
                                                flex: 1,
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "8px",
                                                marginBottom: "16px"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <EnvironmentOutlined style={{ color: "#6b7280", fontSize: "12px" }} />
                                                    <Text style={{
                                                        fontSize: "clamp(11px, 2vw, 13px)",
                                                        color: "#374151"
                                                    }}>
                                                        {application.location} • {application.workType}
                                                    </Text>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <DollarOutlined style={{ color: "#6b7280", fontSize: "12px" }} />
                                                    <Text style={{
                                                        fontSize: "clamp(11px, 2vw, 13px)",
                                                        color: "#374151"
                                                    }}>
                                                        {application.salary}
                                                    </Text>
                                                </div>

                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <ClockCircleOutlined style={{ color: "#6b7280", fontSize: "12px" }} />
                                                    <Text style={{
                                                        fontSize: "clamp(11px, 2vw, 13px)",
                                                        color: "#374151"
                                                    }}>
                                                        Applied {formatDate(application.appliedDate)}
                                                    </Text>
                                                </div>

                                                {application.interviewDate && application.status === "interview_scheduled" && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <CalendarOutlined style={{ color: "#f59e0b", fontSize: "12px" }} />
                                                        <Text style={{
                                                            fontSize: "clamp(11px, 2vw, 13px)",
                                                            color: "#f59e0b",
                                                            fontWeight: 500
                                                        }}>
                                                            Interview: {new Date(application.interviewDate).toLocaleDateString()} at {application.interviewTime}
                                                        </Text>
                                                    </div>
                                                )}

                                                {application.joiningDate && application.status === "hired" && (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                        <CheckCircleOutlined style={{ color: "#10b981", fontSize: "12px" }} />
                                                        <Text style={{
                                                            fontSize: "clamp(11px, 2vw, 13px)",
                                                            color: "#10b981",
                                                            fontWeight: 500
                                                        }}>
                                                            Joining: {new Date(application.joiningDate).toLocaleDateString()}
                                                        </Text>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Skills Tags */}
                                            <div style={{ marginTop: "auto" }}>
                                                <div style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "6px",
                                                    maxHeight: "60px",
                                                    overflow: "hidden"
                                                }}>
                                                    {application.skills.slice(0, 4).map((skill, index) => (
                                                        <Tag
                                                            key={index}
                                                            style={{
                                                                backgroundColor: "#f3f4f6",
                                                                color: "#374151",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                fontSize: "clamp(9px, 1.8vw, 11px)",
                                                                padding: "2px 8px",
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            {skill}
                                                        </Tag>
                                                    ))}
                                                    {application.skills.length > 4 && (
                                                        <Tag style={{
                                                            backgroundColor: "#e5e7eb",
                                                            color: "#6b7280",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            fontSize: "clamp(9px, 1.8vw, 11px)",
                                                            padding: "2px 8px",
                                                            fontWeight: 500
                                                        }}>
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
                        <div style={{
                            display: "flex",
                            justifyContent: "right",
                            marginTop: "32px",
                            marginBottom: "24px"
                        }}>
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
                                    '.ant-pagination-item': {
                                        borderRadius: '8px',
                                    }
                                }}
                            />
                        </div>
                    </>
                ) : (
                    <Card style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        borderRadius: "16px",
                        border: "1px solid #e5e7eb",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                    }}>
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div>
                                    <Title level={4} style={{ color: "#6b7280", marginBottom: "8px" }}>
                                        No Applications Found
                                    </Title>
                                    <Text style={{ color: "#9ca3af" }}>
                                        {searchKeyword || statusFilter || priorityFilter || dateRangeFilter.length
                                            ? "Try adjusting your filters to see more results"
                                            : "You haven't applied to any jobs yet"
                                        }
                                    </Text>
                                </div>
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
                                    color: "#6b7280"
                                }}
                            >
                                {selectedApplication.company[0]}
                            </Avatar>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: "18px", color: "#1f2937" }}>
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
                                padding: "16px 0 0 0"
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
                                    maxWidth: "120px"
                                }}
                            >
                                Close
                            </Button>

                            {selectedApplication.status === "interview_scheduled" && selectedApplication.interviewDetails && (
                                <Button
                                    key="join"
                                    type="primary"
                                    href={selectedApplication.interviewDetails.link}
                                    target="_blank"
                                    icon={<LinkOutlined />}
                                    style={{
                                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                        border: "none",
                                        minWidth: "140px",
                                        height: "40px",
                                        flex: "1 1 auto",
                                        maxWidth: "160px",
                                        fontWeight: 600
                                    }}
                                >
                                    Join Interview
                                </Button>
                            )}

                            {!["hired", "rejected", "withdrawn"].includes(selectedApplication.status) && (
                                <Button
                                    key="withdraw"
                                    danger
                                    onClick={() => handleWithdrawApplication(selectedApplication)}
                                    style={{
                                        minWidth: "140px",
                                        height: "40px",
                                        flex: "1 1 auto",
                                        maxWidth: "180px",
                                        fontWeight: 500,
                                        borderColor: "#ff4d4f",
                                        color: "#ff4d4f"
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
                                    {new Date(selectedApplication.appliedDate).toLocaleDateString()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Skills Required">
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                        {selectedApplication.skills.map((skill, index) => (
                                            <Tag key={index} style={{ borderRadius: "8px" }}>
                                                {skill}
                                            </Tag>
                                        ))}
                                    </div>
                                </Descriptions.Item>
                                {selectedApplication.notes && (
                                    <Descriptions.Item label="Notes">
                                        {selectedApplication.notes}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {/* Interview Details */}
                            {selectedApplication.status === "interview_scheduled" && selectedApplication.interviewDetails && (
                                <Alert
                                    message="Interview Scheduled"
                                    description={
                                        <div style={{ marginTop: "12px" }}>
                                            <p><strong>Date & Time:</strong> {new Date(selectedApplication.interviewDate).toLocaleDateString()} at {selectedApplication.interviewTime}</p>
                                            <p><strong>Type:</strong> {selectedApplication.interviewType}</p>
                                            <p><strong>Platform:</strong> {selectedApplication.interviewDetails.platform}</p>
                                            <p><strong>Interviewer:</strong> {selectedApplication.interviewDetails.interviewer} ({selectedApplication.interviewDetails.designation})</p>
                                            <p><strong>Contact:</strong> {selectedApplication.interviewDetails.email} | {selectedApplication.interviewDetails.phone}</p>
                                            <Button
                                                type="primary"
                                                href={selectedApplication.interviewDetails.link}
                                                target="_blank"
                                                icon={<LinkOutlined />}
                                                style={{ marginTop: "8px" }}
                                            >
                                                Join Interview
                                            </Button>
                                        </div>
                                    }
                                    type="info"
                                    style={{ marginTop: "16px" }}
                                />
                            )}

                            {/* Offer Details */}
                            {selectedApplication.status === "offer_extended" && selectedApplication.offerDetails && (
                                <Alert
                                    message="Job Offer Extended"
                                    description={
                                        <div style={{ marginTop: "12px" }}>
                                            <p><strong>Salary:</strong> {selectedApplication.offerDetails.salary}</p>
                                            <p><strong>Joining Date:</strong> {new Date(selectedApplication.offerDetails.joiningDate).toLocaleDateString()}</p>
                                            <p><strong>Offer Valid Till:</strong> {new Date(selectedApplication.offerDetails.offerValidTill).toLocaleDateString()}</p>
                                            <p><strong>Benefits:</strong></p>
                                            <ul>
                                                {selectedApplication.offerDetails.benefits.map((benefit, index) => (
                                                    <li key={index}>{benefit}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    }
                                    type="success"
                                    style={{ marginTop: "16px" }}
                                />
                            )}

                            {/* Rejection Details */}
                            {selectedApplication.status === "rejected" && selectedApplication.rejectionReason && (
                                <Alert
                                    message="Application Not Selected"
                                    description={
                                        <div style={{ marginTop: "12px" }}>
                                            <p><strong>Reason:</strong> {selectedApplication.rejectionReason}</p>
                                            {selectedApplication.feedback && (
                                                <p><strong>Feedback:</strong> {selectedApplication.feedback}</p>
                                            )}
                                        </div>
                                    }
                                    type="warning"
                                    style={{ marginTop: "16px" }}
                                />
                            )}

                            {/* Hired Details */}
                            {selectedApplication.status === "hired" && selectedApplication.joiningDate && (
                                <Alert
                                    message="Congratulations! You're Hired"
                                    description={
                                        <div style={{ marginTop: "12px" }}>
                                            <p><strong>Joining Date:</strong> {new Date(selectedApplication.joiningDate).toLocaleDateString()}</p>
                                        </div>
                                    }
                                    type="success"
                                    style={{ marginTop: "16px" }}
                                />
                            )}
                        </TabPane>

                        <TabPane tab="Timeline" key="timeline">
                            <Timeline
                                items={selectedApplication.timeline.map((item, index) => ({
                                    dot: React.cloneElement(getStatusConfig(item.status).icon, {
                                        style: { color: getStatusConfig(item.status).color }
                                    }),
                                    color: getStatusConfig(item.status).color,
                                    children: (
                                        <div>
                                            <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                                                {getStatusConfig(item.status).label}
                                            </div>
                                            <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "4px" }}>
                                                {new Date(item.date).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: "14px" }}>
                                                {item.note}
                                            </div>
                                        </div>
                                    )
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
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to withdraw your application for:</p>
                {selectedApplication && (
                    <div style={{
                        padding: "16px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        margin: "16px 0"
                    }}>
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
                    This action cannot be undone.
                </p>
            </Modal>
        </>
    );
};

export default CandidateAppliedJobs;