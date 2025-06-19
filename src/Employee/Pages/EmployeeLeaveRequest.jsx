import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Tooltip,
    Space,
    Modal,
    message,
    Form,
    Input,
    Select,
    Upload,
    DatePicker,
    Tabs,
    Table,
    Popconfirm,
    Statistic,
    Descriptions,
    Radio,
    Checkbox,
    Alert,
    Badge,
    Drawer,
    Timeline,
    Progress,
    Avatar,
    Empty,
    Spin
} from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    UserOutlined,
    UploadOutlined,
    TeamOutlined,
    MailOutlined,
    PhoneOutlined,
    SaveOutlined,
    ReloadOutlined,
    HeartOutlined,
    DollarOutlined,
    InfoCircleOutlined,
    SearchOutlined,
    FilterOutlined,
    AuditOutlined,
    BarChartOutlined,
    HistoryOutlined,
    HourglassOutlined,
    CheckOutlined,
    StopOutlined,
    WarningOutlined,
    BellOutlined,
    DownloadOutlined,
    PrinterOutlined,
    SendOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    CarOutlined,
    GiftOutlined,
    RestOutlined,
    MenuOutlined,
    MobileOutlined,
    TabletOutlined
} from "@ant-design/icons";
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

// Mock employee data
const mockEmployeeData = {
    _id: "emp123",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@company.com",
    phone: "+91 9876543210",
    designation: "Senior HR Manager",
    department: "Human Resources",
    employeeId: "EMP001",
    reportingManager: "John Smith",
    managerEmail: "john.smith@company.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c2cd?w=100&h=100&fit=crop&crop=face",

    // Leave Balances
    leaveBalances: {
        annual: { total: 24, used: 8, remaining: 16 },
        sick: { total: 12, used: 3, remaining: 9 },
        casual: { total: 12, used: 5, remaining: 7 },
        maternity: { total: 180, used: 0, remaining: 180 },
        paternity: { total: 15, used: 0, remaining: 15 },
        compensatory: { total: 0, used: 0, remaining: 0 },
        emergency: { total: 5, used: 1, remaining: 4 }
    },

    // Company Leave Policies
    leavePolicies: {
        maxConsecutiveDays: 30,
        minAdvanceNotice: 7,
        maxPendingRequests: 3,
        requireApproval: true,
        allowHalfDay: true,
        weekendsIncluded: false,
        holidaysIncluded: false
    }
};

// Mock leave requests data
const mockLeaveRequests = [
    {
        id: 1,
        type: "Annual Leave",
        startDate: "2024-07-15",
        endDate: "2024-07-19",
        days: 5,
        reason: "Family vacation to Goa. Planning to spend quality time with family and explore the beautiful beaches.",
        status: "Approved",
        appliedDate: "2024-06-20",
        approvedBy: "John Smith",
        approvedDate: "2024-06-21",
        comments: "Approved. Enjoy your vacation!",
        isHalfDay: false,
        urgency: "Normal"
    },
    {
        id: 2,
        type: "Sick Leave",
        startDate: "2024-06-10",
        endDate: "2024-06-12",
        days: 3,
        reason: "Fever and flu symptoms. Doctor advised complete rest for recovery.",
        status: "Approved",
        appliedDate: "2024-06-09",
        approvedBy: "John Smith",
        approvedDate: "2024-06-09",
        comments: "Get well soon! Take proper rest.",
        isHalfDay: false,
        urgency: "High",
        medicalCertificate: true
    },
    {
        id: 3,
        type: "Casual Leave",
        startDate: "2024-08-05",
        endDate: "2024-08-05",
        days: 1,
        reason: "Personal work - bank and government office visits",
        status: "Pending",
        appliedDate: "2024-07-28",
        approvedBy: null,
        approvedDate: null,
        comments: null,
        isHalfDay: true,
        urgency: "Normal"
    },
    {
        id: 4,
        type: "Annual Leave",
        startDate: "2024-09-15",
        endDate: "2024-09-20",
        days: 6,
        reason: "Wedding ceremony of close family member",
        status: "Rejected",
        appliedDate: "2024-07-20",
        approvedBy: "John Smith",
        approvedDate: "2024-07-22",
        comments: "Peak project period. Please reschedule after project completion.",
        isHalfDay: false,
        urgency: "Normal"
    },
    {
        id: 5,
        type: "Emergency Leave",
        startDate: "2024-05-20",
        endDate: "2024-05-21",
        days: 2,
        reason: "Family emergency - hospitalization",
        status: "Approved",
        appliedDate: "2024-05-19",
        approvedBy: "John Smith",
        approvedDate: "2024-05-19",
        comments: "Hope everything is fine. Take care.",
        isHalfDay: false,
        urgency: "Critical"
    },
    {
        id: 6,
        type: "Maternity Leave",
        startDate: "2024-12-01",
        endDate: "2025-05-30",
        days: 180,
        reason: "Maternity leave for childbirth and newborn care",
        status: "Approved",
        appliedDate: "2024-10-15",
        approvedBy: "John Smith",
        approvedDate: "2024-10-16",
        comments: "Congratulations! All the best for the new journey.",
        isHalfDay: false,
        urgency: "Normal"
    }
];

// Leave type configurations
const leaveTypes = [
    {
        value: "annual",
        label: "Annual Leave",
        color: "blue",
        icon: <CalendarOutlined />,
        description: "Yearly vacation days"
    },
    {
        value: "sick",
        label: "Sick Leave",
        color: "red",
        icon: <MedicineBoxOutlined />,
        description: "Medical leave for illness"
    },
    {
        value: "casual",
        label: "Casual Leave",
        color: "green",
        icon: <HomeOutlined />,
        description: "Short personal breaks"
    },
    {
        value: "maternity",
        label: "Maternity Leave",
        color: "pink",
        icon: <HeartOutlined />,
        description: "Maternity care leave"
    },
    {
        value: "paternity",
        label: "Paternity Leave",
        color: "cyan",
        icon: <TeamOutlined />,
        description: "Paternity care leave"
    },
    {
        value: "compensatory",
        label: "Compensatory Off",
        color: "orange",
        icon: <GiftOutlined />,
        description: "Comp off for overtime"
    },
    {
        value: "emergency",
        label: "Emergency Leave",
        color: "volcano",
        icon: <WarningOutlined />,
        description: "Urgent personal matters"
    }
];

const EmployeeLeaveRequest = () => {
    const [employeeData, setEmployeeData] = useState(mockEmployeeData);
    const [leaveRequests, setLeaveRequests] = useState(mockLeaveRequests);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("apply");
    const [viewLeaveDrawer, setViewLeaveDrawer] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const [mobileView, setMobileView] = useState(false);

    // Forms
    const [leaveForm] = Form.useForm();

    useEffect(() => {
        const handleResize = () => {
            setMobileView(window.innerWidth < 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate leave statistics
    const getLeaveStats = () => {
        const currentYear = dayjs().year();
        const yearlyRequests = leaveRequests.filter(req =>
            dayjs(req.appliedDate).year() === currentYear
        );

        return {
            totalRequests: yearlyRequests.length,
            approved: yearlyRequests.filter(req => req.status === "Approved").length,
            pending: yearlyRequests.filter(req => req.status === "Pending").length,
            rejected: yearlyRequests.filter(req => req.status === "Rejected").length,
            totalDays: yearlyRequests
                .filter(req => req.status === "Approved")
                .reduce((sum, req) => sum + req.days, 0)
        };
    };

    const stats = getLeaveStats();

    // Handle new leave request submission
    const handleLeaveSubmit = async (values) => {
        setLoading(true);
        try {
            const startDate = dayjs(values.dateRange[0]);
            const endDate = dayjs(values.dateRange[1]);
            const days = values.isHalfDay ? 0.5 : endDate.diff(startDate, 'day') + 1;

            const newRequest = {
                id: Date.now(),
                type: leaveTypes.find(t => t.value === values.leaveType)?.label,
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                days: days,
                reason: values.reason,
                status: "Pending",
                appliedDate: dayjs().format('YYYY-MM-DD'),
                approvedBy: null,
                approvedDate: null,
                comments: null,
                isHalfDay: values.isHalfDay || false,
                urgency: values.urgency || "Normal",
                medicalCertificate: values.medicalCertificate || false
            };

            setLeaveRequests([newRequest, ...leaveRequests]);
            message.success("Leave request submitted successfully!");
            leaveForm.resetFields();
        } catch (error) {
            message.error("Failed to submit leave request");
        }
        setLoading(false);
    };

    // Handle leave cancellation
    const handleCancelLeave = (id) => {
        const updatedRequests = leaveRequests.map(req =>
            req.id === id
                ? { ...req, status: "Cancelled" }
                : req
        );
        setLeaveRequests(updatedRequests);
        message.success("Leave request cancelled successfully!");
        setViewLeaveDrawer(false);
    };

    // Get filtered leave requests
    const getFilteredRequests = () => {
        return leaveRequests.filter(req => {
            const statusMatch = filterStatus === "all" || req.status.toLowerCase() === filterStatus;
            const typeMatch = filterType === "all" || req.type.toLowerCase().includes(filterType);
            return statusMatch && typeMatch;
        });
    };

    // Apply Leave Tab Content
    const ApplyLeaveContent = () => (
        <div className="apply-leave-container">
            {/* Quick Stats */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24,marginTop: 24 }}>
                <Col xs={12} sm={6}>
                    <Card
                        size="small"
                        style={{
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, rgba(24, 144, 255, 0.1) 0%, rgba(24, 144, 255, 0.05) 100%)",
                            border: "1px solid rgba(24, 144, 255, 0.2)"
                        }}
                    >
                        <Statistic
                            title="Pending"
                            value={stats.pending}
                            prefix={<HourglassOutlined style={{ color: "#faad14" }} />}
                            valueStyle={{ color: "#faad14", fontSize: mobileView ? 18 : 24 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card
                        size="small"
                        style={{
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, rgba(82, 196, 26, 0.1) 0%, rgba(82, 196, 26, 0.05) 100%)",
                            border: "1px solid rgba(82, 196, 26, 0.2)"
                        }}
                    >
                        <Statistic
                            title="Approved"
                            value={stats.approved}
                            prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                            valueStyle={{ color: "#52c41a", fontSize: mobileView ? 18 : 24 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card
                        size="small"
                        style={{
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, rgba(218, 44, 70, 0.1) 0%, rgba(218, 44, 70, 0.05) 100%)",
                            border: "1px solid rgba(218, 44, 70, 0.2)"
                        }}
                    >
                        <Statistic
                            title="Total Days"
                            value={stats.totalDays}
                            prefix={<CalendarOutlined style={{ color: "#da2c46" }} />}
                            valueStyle={{ color: "#da2c46", fontSize: mobileView ? 18 : 24 }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card
                        size="small"
                        style={{
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, rgba(250, 173, 20, 0.1) 0%, rgba(250, 173, 20, 0.05) 100%)",
                            border: "1px solid rgba(250, 173, 20, 0.2)"
                        }}
                    >
                        <Statistic
                            title="This Year"
                            value={stats.totalRequests}
                            prefix={<FileTextOutlined style={{ color: "#fa8c16" }} />}
                            valueStyle={{ color: "#fa8c16", fontSize: mobileView ? 18 : 24 }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Leave Application Form */}
            <Card
                title={
                    <span>
                        <PlusOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                        Apply for Leave
                    </span>
                }
                style={{ borderRadius: "12px" }}
            >
                <Form
                    form={leaveForm}
                    layout="vertical"
                    onFinish={handleLeaveSubmit}
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Leave Type"
                                name="leaveType"
                                rules={[{ required: true, message: 'Please select leave type' }]}
                            >
                                <Select
                                    placeholder="Select leave type"
                                    size="large"
                                    showSearch
                                    optionFilterProp="children"
                                >
                                    {leaveTypes.map(type => (
                                        <Option key={type.value} value={type.value}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    {type.icon}
                                                    <span style={{ marginLeft: 8 }}>{type.label}</span>
                                                </div>
                                                <Badge
                                                    count={employeeData.leaveBalances[type.value]?.remaining || 0}
                                                    style={{ backgroundColor: '#52c41a' }}
                                                />
                                            </div>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Urgency Level"
                                name="urgency"
                                initialValue="Normal"
                            >
                                <Radio.Group
                                    size="large"
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="Low">Low</Radio.Button>
                                    <Radio.Button value="Normal">Normal</Radio.Button>
                                    <Radio.Button value="High">High</Radio.Button>
                                    <Radio.Button value="Critical">Critical</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Form.Item
                                label="Leave Duration"
                                name="dateRange"
                                rules={[{ required: true, message: 'Please select leave duration' }]}
                            >
                                <RangePicker
                                    style={{ width: '100%' }}
                                    size="large"
                                    format="DD-MM-YYYY"
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} md={12}>
                            <Form.Item label="Leave Options">
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Form.Item name="isHalfDay" valuePropName="checked" style={{ marginBottom: 8 }}>
                                        <Checkbox>Half Day Leave</Checkbox>
                                    </Form.Item>
                                    <Form.Item name="medicalCertificate" valuePropName="checked" style={{ marginBottom: 0 }}>
                                        <Checkbox>Medical Certificate Available</Checkbox>
                                    </Form.Item>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        label="Reason for Leave"
                        name="reason"
                        rules={[
                            { required: true, message: 'Please provide reason for leave' },
                            { min: 10, message: 'Reason must be at least 10 characters' }
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Please provide detailed reason for your leave request..."
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        label="Supporting Documents (Optional)"
                        name="documents"
                    >
                        <Upload.Dragger
                            name="files"
                            multiple
                            action="/upload"
                            accept=".pdf,.doc,.docx,.jpg,.png"
                            beforeUpload={() => false}
                            style={{ padding: mobileView ? 16 : 24 }}
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag files to upload</p>
                            <p className="ant-upload-hint">
                                PDF, DOC, DOCX, JPG, PNG files. Max 5MB per file.
                            </p>
                        </Upload.Dragger>
                    </Form.Item>

                    <div style={{ textAlign: mobileView ? "center" : "right" }}>
                        <Space direction={mobileView ? "vertical" : "horizontal"} style={{ width: mobileView ? "100%" : "auto" }}>
                            <Button
                                size="large"
                                style={{ width: mobileView ? "100%" : "auto" }}
                                icon={<SaveOutlined />}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                size="large"
                                style={{
                                    background: "#da2c46",
                                    border: "none",
                                    width: mobileView ? "100%" : "auto"
                                }}
                                icon={<SendOutlined />}
                            >
                                Submit Request
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );

    // Leave History Tab Content
    const LeaveHistoryContent = () => (
        <div className="leave-history-container">
            {/* Filters */}
            <Card style={{ marginBottom: 24, borderRadius: "12px" , marginTop: 24  }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            placeholder="Filter by Status"
                            value={filterStatus}
                            onChange={setFilterStatus}
                            style={{ width: '100%' }}
                            allowClear
                        >
                            <Option value="all">All Status</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="approved">Approved</Option>
                            <Option value="rejected">Rejected</Option>
                            <Option value="cancelled">Cancelled</Option>
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Select
                            placeholder="Filter by Type"
                            value={filterType}
                            onChange={setFilterType}
                            style={{ width: '100%' }}
                            allowClear
                        >
                            <Option value="all">All Types</Option>
                            {leaveTypes.map(type => (
                                <Option key={type.value} value={type.value}>
                                    <span style={{ display: "flex", alignItems: "center" }}>
                                        {type.icon}
                                        <span style={{ marginLeft: 8 }}>{type.label}</span>
                                    </span>
                                </Option>
                            ))}
                        </Select>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={6}>
                        <RangePicker placeholder={['From Date', 'To Date']} style={{ width: '100%' }} />
                    </Col>

                    <Col xs={24} sm={12} md={24} lg={6}>
                        <Space wrap style={{ width: '100%', justifyContent: mobileView ? 'center' : 'flex-start' }}>
                            <Button icon={<SearchOutlined />} type="primary" style={{ background: "#da2c46", border: "none" }}>
                                Search
                            </Button>
                            <Button icon={<ReloadOutlined />}>Reset</Button>
                            <Button icon={<DownloadOutlined />}>Export</Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Leave History */}
            <Card
                title={
                    <span>
                        <HistoryOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                        Leave History ({getFilteredRequests().length} requests)
                    </span>
                }
                style={{ borderRadius: "12px" }}
            >
                {mobileView ? (
                    // Mobile Card View
                    <div className="mobile-leave-list">
                        {getFilteredRequests().length === 0 ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No leave requests found"
                                style={{ padding: "40px 0" }}
                            />
                        ) : (
                            getFilteredRequests().map(request => (
                                <Card
                                    key={request.id}
                                    size="small"
                                    style={{
                                        marginBottom: 16,
                                        borderRadius: "8px",
                                        border: "1px solid #f0f0f0"
                                    }}
                                    actions={[
                                        <Button
                                            type="link"
                                            icon={<EyeOutlined />}
                                            size="small"
                                            onClick={() => {
                                                setSelectedLeave(request);
                                                setViewLeaveDrawer(true);
                                            }}
                                        >
                                            View
                                        </Button>,
                                        request.status === 'Pending' && (
                                            <Popconfirm
                                                title="Cancel leave request?"
                                                description="Are you sure?"
                                                onConfirm={() => handleCancelLeave(request.id)}
                                                okText="Yes"
                                                cancelText="No"
                                            >
                                                <Button type="link" danger icon={<DeleteOutlined />} size="small">
                                                    Cancel
                                                </Button>
                                            </Popconfirm>
                                        )
                                    ].filter(Boolean)}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                                        <Tag color={leaveTypes.find(t => t.label === request.type)?.color}>
                                            {request.type}
                                        </Tag>
                                        <Tag
                                            color={
                                                request.status === 'Approved' ? 'green' :
                                                    request.status === 'Rejected' ? 'red' :
                                                        request.status === 'Pending' ? 'orange' : 'default'
                                            }
                                        >
                                            {request.status}
                                        </Tag>
                                    </div>

                                    <div style={{ marginBottom: 8 }}>
                                        <Text strong>
                                            {dayjs(request.startDate).format('DD MMM')} - {dayjs(request.endDate).format('DD MMM YYYY')}
                                        </Text>
                                        <br />
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {request.days} {request.days === 1 ? 'day' : 'days'}
                                            {request.isHalfDay && ' (Half Day)'}
                                        </Text>
                                    </div>

                                    <Paragraph
                                        ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
                                        style={{ marginBottom: 8, fontSize: 13 }}
                                    >
                                        {request.reason}
                                    </Paragraph>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Applied: {dayjs(request.appliedDate).format('DD MMM YYYY')}
                                        </Text>
                                        {request.urgency !== 'Normal' && (
                                            <Tag
                                                color={
                                                    request.urgency === 'Critical' ? 'red' :
                                                        request.urgency === 'High' ? 'orange' : 'blue'
                                                }
                                                size="small"
                                            >
                                                {request.urgency}
                                            </Tag>
                                        )}
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                ) : (
                    // Desktop Table View
                    <div style={{ overflowX: "auto" }}>
                        <Table
                            dataSource={getFilteredRequests()}
                            rowKey="id"
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) =>
                                    `${range[0]}-${range[1]} of ${total} requests`,
                                responsive: true
                            }}
                            scroll={{ x: 1000 }}
                            columns={[
                                {
                                    title: 'Leave Type',
                                    dataIndex: 'type',
                                    key: 'type',
                                    render: (text) => {
                                        const leaveType = leaveTypes.find(t => t.label === text);
                                        return (
                                            <Tag color={leaveType?.color} icon={leaveType?.icon}>
                                                {text}
                                            </Tag>
                                        );
                                    },
                                    filters: leaveTypes.map(type => ({
                                        text: type.label,
                                        value: type.label
                                    })),
                                    onFilter: (value, record) => record.type === value,
                                    width: 150,
                                },
                                {
                                    title: 'Duration',
                                    key: 'duration',
                                    render: (_, record) => (
                                        <div>
                                            <div style={{ fontWeight: 500 }}>
                                                {dayjs(record.startDate).format('DD MMM')} - {dayjs(record.endDate).format('DD MMM YYYY')}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#666' }}>
                                                {record.days} {record.days === 1 ? 'day' : 'days'}
                                                {record.isHalfDay && ' (Half Day)'}
                                            </div>
                                        </div>
                                    ),
                                    width: 180,
                                    sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
                                },
                                {
                                    title: 'Reason',
                                    dataIndex: 'reason',
                                    key: 'reason',
                                    render: (text) => (
                                        <Tooltip title={text} placement="topLeft">
                                            <div style={{
                                                maxWidth: 200,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {text}
                                            </div>
                                        </Tooltip>
                                    ),
                                    width: 220,
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'status',
                                    key: 'status',
                                    render: (status, record) => (
                                        <div>
                                            <Tag
                                                color={
                                                    status === 'Approved' ? 'green' :
                                                        status === 'Rejected' ? 'red' :
                                                            status === 'Pending' ? 'orange' :
                                                                status === 'Cancelled' ? 'default' : 'blue'
                                                }
                                                icon={
                                                    status === 'Approved' ? <CheckCircleOutlined /> :
                                                        status === 'Rejected' ? <CloseCircleOutlined /> :
                                                            status === 'Pending' ? <ClockCircleOutlined /> :
                                                                status === 'Cancelled' ? <StopOutlined /> : <InfoCircleOutlined />
                                                }
                                            >
                                                {status}
                                            </Tag>
                                            {record.urgency !== 'Normal' && (
                                                <Tag
                                                    color={
                                                        record.urgency === 'Critical' ? 'red' :
                                                            record.urgency === 'High' ? 'orange' : 'blue'
                                                    }
                                                    size="small"
                                                    style={{ marginTop: 4 }}
                                                >
                                                    {record.urgency}
                                                </Tag>
                                            )}
                                        </div>
                                    ),
                                    filters: [
                                        { text: 'Approved', value: 'Approved' },
                                        { text: 'Pending', value: 'Pending' },
                                        { text: 'Rejected', value: 'Rejected' },
                                        { text: 'Cancelled', value: 'Cancelled' }
                                    ],
                                    onFilter: (value, record) => record.status === value,
                                    width: 120,
                                },
                                {
                                    title: 'Applied Date',
                                    dataIndex: 'appliedDate',
                                    key: 'appliedDate',
                                    render: (date) => dayjs(date).format('DD MMM YYYY'),
                                    sorter: (a, b) => dayjs(a.appliedDate).unix() - dayjs(b.appliedDate).unix(),
                                    width: 120,
                                },
                                {
                                    title: 'Actions',
                                    key: 'actions',
                                    render: (_, record) => (
                                        <Space size="small">
                                            <Button
                                                type="link"
                                                icon={<EyeOutlined />}
                                                size="small"
                                                onClick={() => {
                                                    setSelectedLeave(record);
                                                    setViewLeaveDrawer(true);
                                                }}
                                            >
                                                View
                                            </Button>
                                            {record.status === 'Pending' && (
                                                <Popconfirm
                                                    title="Cancel leave request?"
                                                    description="Are you sure you want to cancel this request?"
                                                    onConfirm={() => handleCancelLeave(record.id)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Button type="link" danger icon={<DeleteOutlined />} size="small">
                                                        Cancel
                                                    </Button>
                                                </Popconfirm>
                                            )}
                                        </Space>
                                    ),
                                    width: 120,
                                    fixed: 'right',
                                },
                            ]}
                        />
                    </div>
                )}
            </Card>
        </div>
    );

    // Leave Balance Tab Content
    const LeaveBalanceContent = () => (
        <div className="leave-balance-container">
            <Row gutter={[16, 16]}>
                {Object.entries(employeeData.leaveBalances).map(([key, balance]) => {
                    const leaveType = leaveTypes.find(t => t.value === key);
                    if (!leaveType) return null;

                    const percentage = balance.total > 0 ? ((balance.remaining / balance.total) * 100) : 0;

                    return (
                        <Col xs={24} sm={12} lg={8} key={key}>
                            <Card
                                style={{
                                    borderRadius: "12px",
                                    marginTop: 24 ,
                                    background: `linear-gradient(135deg, rgba(${leaveType.color === 'blue' ? '24, 144, 255' :
                                            leaveType.color === 'red' ? '255, 77, 79' :
                                                leaveType.color === 'green' ? '82, 196, 26' :
                                                    leaveType.color === 'pink' ? '235, 47, 150' :
                                                        leaveType.color === 'cyan' ? '19, 194, 194' :
                                                            leaveType.color === 'orange' ? '250, 173, 20' :
                                                                '255, 87, 34' // volcano
                                        }, 0.1) 0%, rgba(${leaveType.color === 'blue' ? '24, 144, 255' :
                                            leaveType.color === 'red' ? '255, 77, 79' :
                                                leaveType.color === 'green' ? '82, 196, 26' :
                                                    leaveType.color === 'pink' ? '235, 47, 150' :
                                                        leaveType.color === 'cyan' ? '19, 194, 194' :
                                                            leaveType.color === 'orange' ? '250, 173, 20' :
                                                                '255, 87, 34' // volcano
                                        }, 0.05) 100%)`,
                                    border: `1px solid rgba(${leaveType.color === 'blue' ? '24, 144, 255' :
                                            leaveType.color === 'red' ? '255, 77, 79' :
                                                leaveType.color === 'green' ? '82, 196, 26' :
                                                    leaveType.color === 'pink' ? '235, 47, 150' :
                                                        leaveType.color === 'cyan' ? '19, 194, 194' :
                                                            leaveType.color === 'orange' ? '250, 173, 20' :
                                                                '255, 87, 34' // volcano
                                        }, 0.2)`
                                }}
                            >
                                <div style={{ textAlign: "center" }}>
                                    <div style={{
                                        fontSize: 24,
                                        marginBottom: 8,
                                        color: `#${leaveType.color === 'blue' ? '1890ff' :
                                                leaveType.color === 'red' ? 'ff4d4f' :
                                                    leaveType.color === 'green' ? '52c41a' :
                                                        leaveType.color === 'pink' ? 'eb2f96' :
                                                            leaveType.color === 'cyan' ? '13c2c2' :
                                                                leaveType.color === 'orange' ? 'faad14' :
                                                                    'ff5722' // volcano
                                            }`
                                    }}>
                                        {leaveType.icon}
                                    </div>
                                    <Title level={5} style={{ marginBottom: 8 }}>
                                        {leaveType.label}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {leaveType.description}
                                    </Text>
                                </div>

                                <div style={{ margin: "16px 0" }}>
                                    <Progress
                                        percent={percentage}
                                        showInfo={false}
                                        strokeColor={{
                                            '0%': `#${leaveType.color === 'blue' ? '1890ff' :
                                                    leaveType.color === 'red' ? 'ff4d4f' :
                                                        leaveType.color === 'green' ? '52c41a' :
                                                            leaveType.color === 'pink' ? 'eb2f96' :
                                                                leaveType.color === 'cyan' ? '13c2c2' :
                                                                    leaveType.color === 'orange' ? 'faad14' :
                                                                        'ff5722' // volcano
                                                }`,
                                            '100%': `#${leaveType.color === 'blue' ? '40a9ff' :
                                                    leaveType.color === 'red' ? 'ff7875' :
                                                        leaveType.color === 'green' ? '73d13d' :
                                                            leaveType.color === 'pink' ? 'f759ab' :
                                                                leaveType.color === 'cyan' ? '36cfc9' :
                                                                    leaveType.color === 'orange' ? 'ffc53d' :
                                                                        'ff8a65' // volcano
                                                }`,
                                        }}
                                        trailColor="#f5f5f5"
                                    />
                                </div>

                                <Row gutter={[8, 8]}>
                                    <Col span={8}>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: 18, fontWeight: 600, color: "#52c41a" }}>
                                                {balance.remaining}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#666" }}>
                                                Available
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: 18, fontWeight: 600, color: "#fa8c16" }}>
                                                {balance.used}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#666" }}>
                                                Used
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={8}>
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: 18, fontWeight: 600, color: "#1890ff" }}>
                                                {balance.total}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#666" }}>
                                                Total
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Leave Calendar Preview */}
            <Card
                title={
                    <span>
                        <CalendarOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                        Upcoming Leave Schedule
                    </span>
                }
                style={{ marginTop: 24, borderRadius: "12px" }}
            >
                <Timeline
                    mode={mobileView ? "left" : "alternate"}
                    items={
                        leaveRequests
                            .filter(req => req.status === 'Approved' && dayjs(req.startDate).isAfter(dayjs()))
                            .sort((a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix())
                            .slice(0, 5)
                            .map((req, index) => ({
                                dot: leaveTypes.find(t => t.label === req.type)?.icon,
                                color: leaveTypes.find(t => t.label === req.type)?.color,
                                children: (
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                            {req.type} - {req.days} {req.days === 1 ? 'day' : 'days'}
                                        </div>
                                        <div style={{ color: '#666', fontSize: 12, marginBottom: 4 }}>
                                            {dayjs(req.startDate).format('DD MMM YYYY')} - {dayjs(req.endDate).format('DD MMM YYYY')}
                                        </div>
                                        <div style={{ fontSize: 13 }}>
                                            {req.reason.length > 50 ? `${req.reason.substring(0, 50)}...` : req.reason}
                                        </div>
                                    </div>
                                )
                            }))
                    }
                />
                {leaveRequests.filter(req => req.status === 'Approved' && dayjs(req.startDate).isAfter(dayjs())).length === 0 && (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No upcoming approved leaves"
                        style={{ padding: "20px 0" }}
                    />
                )}
            </Card>
        </div>
    );

    // Leave Details Drawer
    const LeaveDetailsDrawer = () => (
        <Drawer
            title={
                <div style={{ display: "flex", alignItems: "center" }}>
                    <EyeOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                    Leave Request Details
                </div>
            }
            placement="right"
            size={mobileView ? "default" : "large"}
            onClose={() => setViewLeaveDrawer(false)}
            open={viewLeaveDrawer}
            extra={
                selectedLeave?.status === 'Pending' && (
                    <Popconfirm
                        title="Cancel this leave request?"
                        description="This action cannot be undone."
                        onConfirm={() => handleCancelLeave(selectedLeave.id)}
                        okText="Yes, Cancel"
                        cancelText="No"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />}>
                            Cancel Request
                        </Button>
                    </Popconfirm>
                )
            }
        >
            {selectedLeave && (
                <div className="leave-details">
                    {/* Status Alert */}
                    <Alert
                        message={`Leave Request ${selectedLeave.status}`}
                        description={
                            selectedLeave.status === 'Approved' ? 'Your leave request has been approved by your manager.' :
                                selectedLeave.status === 'Rejected' ? 'Your leave request has been rejected. Please check the comments below.' :
                                    selectedLeave.status === 'Pending' ? 'Your leave request is pending approval from your manager.' :
                                        'Your leave request has been cancelled.'
                        }
                        type={
                            selectedLeave.status === 'Approved' ? 'success' :
                                selectedLeave.status === 'Rejected' ? 'error' :
                                    selectedLeave.status === 'Pending' ? 'warning' : 'info'
                        }
                        showIcon
                        style={{ marginBottom: 24 }}
                    />

                    {/* Basic Information */}
                    <Card title="Request Information" style={{ marginBottom: 16, borderRadius: "8px" }}>
                        <Descriptions column={mobileView ? 1 : 2} bordered size="small">
                            <Descriptions.Item label="Leave Type">
                                <Tag
                                    color={leaveTypes.find(t => t.label === selectedLeave.type)?.color}
                                    icon={leaveTypes.find(t => t.label === selectedLeave.type)?.icon}
                                >
                                    {selectedLeave.type}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Duration">
                                {selectedLeave.days} {selectedLeave.days === 1 ? 'day' : 'days'}
                                {selectedLeave.isHalfDay && ' (Half Day)'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Start Date">
                                {dayjs(selectedLeave.startDate).format('DD MMM YYYY, dddd')}
                            </Descriptions.Item>
                            <Descriptions.Item label="End Date">
                                {dayjs(selectedLeave.endDate).format('DD MMM YYYY, dddd')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Applied On">
                                {dayjs(selectedLeave.appliedDate).format('DD MMM YYYY, HH:mm')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Urgency Level">
                                <Tag
                                    color={
                                        selectedLeave.urgency === 'Critical' ? 'red' :
                                            selectedLeave.urgency === 'High' ? 'orange' :
                                                selectedLeave.urgency === 'Low' ? 'blue' : 'default'
                                    }
                                >
                                    {selectedLeave.urgency}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    {/* Reason */}
                    <Card title="Reason for Leave" style={{ marginBottom: 16, borderRadius: "8px" }}>
                        <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                            {selectedLeave.reason}
                        </Paragraph>
                    </Card>

                    {/* Approval Information */}
                    {(selectedLeave.status === 'Approved' || selectedLeave.status === 'Rejected') && (
                        <Card title="Approval Details" style={{ marginBottom: 16, borderRadius: "8px" }}>
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="Approved/Rejected By">
                                    <div style={{ display: "flex", alignItems: "center" }}>
                                        <Avatar icon={<UserOutlined />} size="small" style={{ marginRight: 8 }} />
                                        {selectedLeave.approvedBy}
                                    </div>
                                </Descriptions.Item>
                                <Descriptions.Item label="Date">
                                    {dayjs(selectedLeave.approvedDate).format('DD MMM YYYY, HH:mm')}
                                </Descriptions.Item>
                                {selectedLeave.comments && (
                                    <Descriptions.Item label="Manager Comments">
                                        <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                            {selectedLeave.comments}
                                        </Paragraph>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    )}

                    {/* Additional Information */}
                    <Card title="Additional Information" style={{ borderRadius: "8px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {selectedLeave.medicalCertificate && (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <CheckCircleOutlined style={{ color: "#52c41a", marginRight: 8 }} />
                                    <Text>Medical certificate provided</Text>
                                </div>
                            )}
                            {selectedLeave.isHalfDay && (
                                <div style={{ display: "flex", alignItems: "center" }}>
                                    <ClockCircleOutlined style={{ color: "#faad14", marginRight: 8 }} />
                                    <Text>Half day leave</Text>
                                </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center" }}>
                                <CalendarOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                                <Text>
                                    Request ID: #{selectedLeave.id}
                                </Text>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </Drawer>
    );

    return (
        <div className="employee-leave-request" style={{ padding: mobileView ? 16 : 24, minHeight: "100vh" }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                            <Avatar
                                src={employeeData.avatar}
                                size={mobileView ? 48 : 64}
                                icon={<UserOutlined />}
                                style={{ marginRight: 16 }}
                            />
                            <div>
                                <Title level={mobileView ? 4 : 3} style={{ margin: 0 }}>
                                    {employeeData.firstName} {employeeData.lastName}
                                </Title>
                                <Text type="secondary">
                                    {employeeData.designation} • {employeeData.department}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    ID: {employeeData.employeeId}
                                </Text>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={16}>
                        <div style={{ textAlign: mobileView ? "left" : "right" }}>
                            <Space direction={mobileView ? "vertical" : "horizontal"} wrap>
                                <Button icon={<MailOutlined />} type="text">
                                    {employeeData.email}
                                </Button>
                                <Button icon={<PhoneOutlined />} type="text">
                                    {employeeData.phone}
                                </Button>
                                <Button icon={<UserOutlined />} type="text">
                                    Reports to: {employeeData.reportingManager}
                                </Button>
                            </Space>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Main Content */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                size={mobileView ? "small" : "large"}
                items={[
                    {
                        key: "apply",
                        label: (
                            <span>
                                <PlusOutlined />
                                {!mobileView && " Apply Leave"}
                            </span>
                        ),
                        children: <ApplyLeaveContent />
                    },
                    {
                        key: "history",
                        label: (
                            <span>
                                <HistoryOutlined />
                                {!mobileView && " Leave History"}
                                <Badge count={stats.pending} size="small" style={{ marginLeft: 8 }} />
                            </span>
                        ),
                        children: <LeaveHistoryContent />
                    },
                    {
                        key: "balance",
                        label: (
                            <span>
                                <BarChartOutlined />
                                {!mobileView && " Leave Balance"}
                            </span>
                        ),
                        children: <LeaveBalanceContent />
                    }
                ]}
                tabBarStyle={{
                    background: "#fff",
                    margin: 0,
                    padding: mobileView ? "0 16px" : "0 24px",
                    borderRadius: "12px 12px 0 0"
                }}
            />

            {/* Leave Details Drawer */}
            <LeaveDetailsDrawer />

            {/* Floating Action Button for Mobile */}
            {mobileView && activeTab !== "apply" && (
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<PlusOutlined />}
                    style={{
                        position: "fixed",
                        bottom: 24,
                        right: 24,
                        background: "#da2c46",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(218, 44, 70, 0.3)",
                        zIndex: 1000
                    }}
                    onClick={() => setActiveTab("apply")}
                />
            )}
        </div>
    );
};

export default EmployeeLeaveRequest;