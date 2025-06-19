import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    Row,
    Col,
    Typography,
    Tag,
    Space,
    Modal,
    message,
    Form,
    Input,
    Select,
    Upload,
    Avatar,
    Switch,
    Tabs,
    List,
    Progress,
    Alert,
    Radio,
    Checkbox,
    InputNumber,
    DatePicker,
} from "antd";
import {
    UserOutlined,
    LockOutlined,
    EditOutlined,
    UploadOutlined,
    CameraOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    TrophyOutlined,
    GlobalOutlined,
    ApartmentOutlined,
    CrownOutlined,
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    SaveOutlined,
    ReloadOutlined,
    CalendarOutlined,
    IdcardOutlined,
    FlagOutlined,
    ProjectOutlined,
    NumberOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// Mock employee data with updated fields
const mockEmployeeData = {
    _id: "emp123",
    projectName: "Digital Transformation Initiative",
    employeeId: "EMP001",
    eramId: "ERAM123456",
    igamaNationalId: "IG789012345",
    name: "Sarah Johnson",
    nationality: "Indian",
    jobTitle: "Senior HR Manager",
    type: "Full-time",
    avatar: "https://via.placeholder.com/100",
    joinDate: "2020-03-15",
    bio: "Experienced HR professional with 8+ years in talent acquisition and employee engagement.",

    // Company Information
    company: {
        name: "TechCorp Solutions",
        industry: "Information Technology",
        size: "500-1000",
        website: "https://techcorp.com",
        description: "Leading technology solutions provider specializing in cloud infrastructure and digital transformation.",
        logo: "https://via.placeholder.com/80",
        address: "Whitefield, Bengaluru, Karnataka",
        founded: "2015"
    },

    // Role Information
    role: {
        title: "HR Manager",
        level: "Senior",
        permissions: ["view_candidates", "schedule_interviews", "create_job_posts", "manage_team"],
        maxJobPosts: 10,
        maxInterviewsPerDay: 5
    }
};

const EmployeeProfileSettings = () => {
    const [employeeData, setEmployeeData] = useState(mockEmployeeData);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const [editMode, setEditMode] = useState({});
    const [uploadModal, setUploadModal] = useState(false);
    const [profileCompletion, setProfileCompletion] = useState(85);

    // Forms
    const [profileForm] = Form.useForm();
    const [companyForm] = Form.useForm();
    const [securityForm] = Form.useForm();

    useEffect(() => {
        // Initialize forms with current data
        profileForm.setFieldsValue(employeeData);
        companyForm.setFieldsValue(employeeData.company);
        calculateProfileCompletion();
    }, [employeeData]);

    const calculateProfileCompletion = () => {
        let completion = 0;
        const fields = [
            employeeData.projectName,
            employeeData.employeeId,
            employeeData.eramId,
            employeeData.igamaNationalId,
            employeeData.name,
            employeeData.nationality,
            employeeData.jobTitle,
            employeeData.type
        ];

        fields.forEach(field => {
            if (field) completion += 12.5; // 100/8 fields = 12.5% each
        });

        setProfileCompletion(Math.min(completion, 100));
    };

    const handleProfileUpdate = async (values) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setEmployeeData({ ...employeeData, ...values });
            message.success("Profile updated successfully!");
            setEditMode({});
        } catch (error) {
            message.error("Failed to update profile");
        }
        setLoading(false);
    };

    const handleCompanyUpdate = async (values) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setEmployeeData({ ...employeeData, company: { ...employeeData.company, ...values } });
            message.success("Company information updated successfully!");
            setEditMode({});
        } catch (error) {
            message.error("Failed to update company information");
        }
        setLoading(false);
    };

    const handleAvatarUpload = ({ file, fileList }) => {
        if (file.status === 'done') {
            message.success("Profile picture updated successfully!");
            setEmployeeData({ ...employeeData, avatar: URL.createObjectURL(file.originFileObj) });
        }
    };

    const toggleEditMode = (section) => {
        setEditMode({
            ...editMode,
            [section]: !editMode[section]
        });
    };

    // Profile Tab Content
    const ProfileContent = () => (
        <div>
            {/* Profile Completion */}
            <Card
                style={{
                    marginBottom: 24,
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(218, 44, 70, 0.05) 0%, rgba(165, 22, 50, 0.05) 100%)"
                }}
            >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0, color: "#da2c46" }}>
                        <TrophyOutlined style={{ marginRight: 8 }} />
                        Profile Completion
                    </Title>
                    <Text style={{ fontSize: "16px", fontWeight: 600, color: "#da2c46" }}>
                        {profileCompletion}%
                    </Text>
                </div>
                <Progress
                    percent={profileCompletion}
                    strokeColor={{
                        '0%': '#da2c46',
                        '100%': '#a51632',
                    }}
                    showInfo={false}
                />
                <Text type="secondary" style={{ fontSize: "12px", marginTop: 8, display: "block" }}>
                    Complete your profile to improve team collaboration and efficiency
                </Text>
            </Card>

            {/* Basic Information */}
            <Card
                title={
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>
                            <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                            Personal Information
                        </span>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => toggleEditMode('basic')}
                        >
                            {editMode.basic ? 'Cancel' : 'Edit'}
                        </Button>
                    </div>
                }
                style={{ marginBottom: 24, borderRadius: "12px" }}
            >
                <Form
                    form={profileForm}
                    layout="vertical"
                    onFinish={handleProfileUpdate}
                >
                    <Row gutter={24}>
                        <Col span={24} style={{ textAlign: "center", marginBottom: 24 }}>
                            <div style={{ position: "relative", display: "inline-block" }}>
                                <Avatar
                                    size={100}
                                    src={employeeData.avatar}
                                    icon={<UserOutlined />}
                                    style={{ border: "4px solid #da2c46" }}
                                />
                                <Button
                                    type="primary"
                                    shape="circle"
                                    icon={<CameraOutlined />}
                                    size="small"
                                    onClick={() => setUploadModal(true)}
                                    style={{
                                        position: "absolute",
                                        bottom: 0,
                                        right: 0,
                                        background: "#da2c46",
                                        border: "2px solid white"
                                    }}
                                />
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <Text style={{ display: "block", fontSize: "16px", fontWeight: 600 }}>
                                    {employeeData.name}
                                </Text>
                                <Text type="secondary">{employeeData.jobTitle}</Text>
                                <br />
                                <Tag color="blue" style={{ marginTop: 4 }}>
                                    ID: {employeeData.employeeId}
                                </Tag>
                            </div>
                        </Col>

                        {/* Row 1 */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Project Name"
                                name="projectName"
                                rules={[{ required: true, message: 'Please enter project name' }]}
                            >
                                <Input
                                    prefix={<ProjectOutlined />}
                                    placeholder="Enter project name"
                                    disabled={!editMode.basic}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Employee ID"
                                name="employeeId"
                                rules={[{ required: true, message: 'Please enter employee ID' }]}
                            >
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="Enter employee ID"
                                    disabled={!editMode.basic}
                                />
                            </Form.Item>
                        </Col>

                        {/* Row 2 */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="ERAM ID"
                                name="eramId"
                                rules={[{ required: true, message: 'Please enter ERAM ID' }]}
                            >
                                <Input
                                    prefix={<NumberOutlined />}
                                    placeholder="Enter ERAM ID"
                                    disabled={!editMode.basic}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Igama National ID"
                                name="igamaNationalId"
                                rules={[{ required: true, message: 'Please enter Igama National ID' }]}
                            >
                                <Input
                                    prefix={<IdcardOutlined />}
                                    placeholder="Enter Igama National ID"
                                    disabled={!editMode.basic}
                                />
                            </Form.Item>
                        </Col>

                        {/* Row 3 */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Please enter your name' }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Enter your full name"
                                    disabled={!editMode.basic}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Nationality"
                                name="nationality"
                                rules={[{ required: true, message: 'Please enter your nationality' }]}
                            >
                                <Input
                                    prefix={<FlagOutlined />}
                                    placeholder="Enter nationality"
                                    disabled={!editMode.basic}
                                />
                            </Form.Item>
                        </Col>

                        {/* Row 4 */}
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Job Title"
                                name="jobTitle"
                                rules={[{ required: true, message: 'Please enter your job title' }]}
                            >
                                <Input
                                    placeholder="Enter job title"
                                    disabled={!editMode.basic}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Type"
                                name="type"
                                rules={[{ required: true, message: 'Please select employee type' }]}
                            >
                                <Select placeholder="Select employee type" disabled={!editMode.basic}>
                                    <Option value="Full-time">Full-time</Option>
                                    <Option value="Part-time">Part-time</Option>
                                    <Option value="Contract">Contract</Option>
                                    <Option value="Temporary">Temporary</Option>
                                    <Option value="Intern">Intern</Option>
                                    <Option value="Consultant">Consultant</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    {editMode.basic && (
                        <div style={{ textAlign: "right", marginTop: 16 }}>
                            <Space>
                                <Button onClick={() => toggleEditMode('basic')}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ background: "#da2c46", border: "none" }}
                                >
                                    Save Changes
                                </Button>
                            </Space>
                        </div>
                    )}
                </Form>
            </Card>

            {/* Company Information */}
            <Card
                title={
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>
                            <ApartmentOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                            Company Information
                        </span>
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => toggleEditMode('company')}
                        >
                            {editMode.company ? 'Cancel' : 'Edit'}
                        </Button>
                    </div>
                }
                style={{ marginBottom: 24, borderRadius: "12px" }}
            >
                <Form
                    form={companyForm}
                    layout="vertical"
                    onFinish={handleCompanyUpdate}
                >
                    <Row gutter={24} align="middle">
                        <Col xs={24} sm={4} style={{ textAlign: "center" }}>
                            <Avatar
                                size={64}
                                src={employeeData.company.logo}
                                icon={<ApartmentOutlined />}
                                style={{ border: "2px solid #da2c46" }}
                            />
                        </Col>
                        <Col xs={24} sm={20}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Company Name"
                                        name="name"
                                        rules={[{ required: true, message: 'Please enter company name' }]}
                                    >
                                        <Input
                                            placeholder="Enter company name"
                                            disabled={!editMode.company}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item
                                        label="Industry"
                                        name="industry"
                                        rules={[{ required: true, message: 'Please select industry' }]}
                                    >
                                        <Select placeholder="Select industry" disabled={!editMode.company}>
                                            <Option value="Information Technology">Information Technology</Option>
                                            <Option value="Healthcare">Healthcare</Option>
                                            <Option value="Finance">Finance</Option>
                                            <Option value="Education">Education</Option>
                                            <Option value="Manufacturing">Manufacturing</Option>
                                            <Option value="Retail">Retail</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Company Size"
                                name="size"
                            >
                                <Select placeholder="Select company size" disabled={!editMode.company}>
                                    <Option value="1-10">1-10 employees</Option>
                                    <Option value="11-50">11-50 employees</Option>
                                    <Option value="51-200">51-200 employees</Option>
                                    <Option value="201-500">201-500 employees</Option>
                                    <Option value="500-1000">500-1000 employees</Option>
                                    <Option value="1000+">1000+ employees</Option>
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Website"
                                name="website"
                            >
                                <Input
                                    prefix={<GlobalOutlined />}
                                    placeholder="https://company.com"
                                    disabled={!editMode.company}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Founded Year"
                                name="founded"
                            >
                                <InputNumber
                                    placeholder="2015"
                                    style={{ width: '100%' }}
                                    disabled={!editMode.company}
                                />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Address"
                                name="address"
                            >
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Enter company address"
                                    disabled={!editMode.company}
                                />
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                label="Company Description"
                                name="description"
                            >
                                <TextArea
                                    rows={3}
                                    placeholder="Describe your company..."
                                    disabled={!editMode.company}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {editMode.company && (
                        <div style={{ textAlign: "right", marginTop: 16 }}>
                            <Space>
                                <Button onClick={() => toggleEditMode('company')}>
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ background: "#da2c46", border: "none" }}
                                >
                                    Save Changes
                                </Button>
                            </Space>
                        </div>
                    )}
                </Form>
            </Card>

            {/* Role & Permissions */}
            <Card
                title={
                    <span>
                        <CrownOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                        Role & Permissions
                    </span>
                }
                style={{ marginBottom: 24, borderRadius: "12px" }}
            >
                <Row gutter={24}>
                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Role: </Text>
                            <Tag color="blue">{employeeData.role.title}</Tag>
                            <Tag color="green">{employeeData.role.level}</Tag>
                        </div>
                    </Col>
                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Limits: </Text>
                            <Text type="secondary">
                                Max {employeeData.role.maxJobPosts} job posts, {employeeData.role.maxInterviewsPerDay} interviews/day
                            </Text>
                        </div>
                    </Col>
                </Row>

                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>Permissions:</Text>
                    <Space wrap>
                        {employeeData.role.permissions.map((permission, index) => (
                            <Tag key={index} color="blue-inverse" style={{ marginBottom: 4 }}>
                                <CheckCircleOutlined style={{ marginRight: 4 }} />
                                {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Tag>
                        ))}
                    </Space>
                </div>

                <Alert
                    message="Role Management"
                    description="Contact your administrator to modify your role or permissions."
                    type="info"
                    showIcon
                    style={{ marginTop: 16 }}
                />
            </Card>
        </div>
    );

    // Security Tab Content
    const SecurityContent = () => (
        <div>
            <Card
                title={
                    <span>
                        <SafetyCertificateOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                        Password & Security
                    </span>
                }
                style={{ marginBottom: 24, borderRadius: "12px" }}
            >
                <Form
                    form={securityForm}
                    layout="vertical"
                >
                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Current Password"
                                name="currentPassword"
                                rules={[{ required: true, message: 'Please enter current password' }]}
                            >
                                <Input.Password placeholder="Enter current password" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={24}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="New Password"
                                name="newPassword"
                                rules={[
                                    { required: true, message: 'Please enter new password' },
                                    { min: 8, message: 'Password must be at least 8 characters' }
                                ]}
                            >
                                <Input.Password placeholder="Enter new password" />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={12}>
                            <Form.Item
                                label="Confirm New Password"
                                name="confirmPassword"
                                dependencies={['newPassword']}
                                rules={[
                                    { required: true, message: 'Please confirm your password' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Passwords do not match'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password placeholder="Confirm new password" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ textAlign: "right", marginTop: 16 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ background: "#da2c46", border: "none" }}
                        >
                            Update Password
                        </Button>
                    </div>
                </Form>
            </Card>

            <Card
                title="Two-Factor Authentication"
                style={{ marginBottom: 24, borderRadius: "12px" }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <Text strong>Enable Two-Factor Authentication</Text>
                        <div style={{ marginTop: 4 }}>
                            <Text type="secondary">Add an extra layer of security to your account</Text>
                        </div>
                    </div>
                    <Switch defaultChecked={false} />
                </div>
            </Card>

            <Card
                title="Login Sessions"
                style={{ borderRadius: "12px" }}
            >
                <List
                    itemLayout="horizontal"
                    dataSource={[
                        {
                            device: "Chrome on Windows",
                            location: "Bengaluru, India",
                            time: "Current session",
                            current: true
                        },
                        {
                            device: "Mobile App on iPhone",
                            location: "Bengaluru, India",
                            time: "2 hours ago",
                            current: false
                        }
                    ]}
                    renderItem={(item) => (
                        <List.Item
                            actions={!item.current ? [
                                <Button type="link" danger size="small">
                                    Terminate
                                </Button>
                            ] : []}
                        >
                            <List.Item.Meta
                                avatar={<Avatar icon={<LockOutlined />} />}
                                title={
                                    <div>
                                        {item.device}
                                        {item.current && <Tag color="green" style={{ marginLeft: 8 }}>Current</Tag>}
                                    </div>
                                }
                                description={`${item.location} • ${item.time}`}
                            />
                        </List.Item>
                    )}
                />
            </Card>
        </div>
    );

    // Avatar Upload Modal
    const AvatarUploadModal = () => (
        <Modal
            title="Update Profile Picture"
            open={uploadModal}
            onCancel={() => setUploadModal(false)}
            footer={null}
            centered
        >
            <div style={{ textAlign: "center" }}>
                <Avatar
                    size={120}
                    src={employeeData.avatar}
                    icon={<UserOutlined />}
                    style={{ border: "4px solid #da2c46", marginBottom: 16 }}
                />
                <Upload
                    accept="image/*"
                    showUploadList={false}
                    customRequest={({ file, onSuccess }) => {
                        setTimeout(() => {
                            onSuccess("ok");
                        }, 0);
                    }}
                    onChange={handleAvatarUpload}
                >
                    <Button
                        type="primary"
                        icon={<UploadOutlined />}
                        style={{ background: "#da2c46", border: "none" }}
                    >
                        Upload New Picture
                    </Button>
                </Upload>
                <div style={{ marginTop: 16, color: '#666', fontSize: '12px' }}>
                    Recommended: Square image, max 2MB
                </div>
            </div>
        </Modal>
    );

    return (
        <div style={{
            padding: "24px",
            minHeight: "100vh"
        }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
                                <UserOutlined style={{ marginRight: 12 }} />
                                Employee Profile Settings
                            </Title>
                            <Text type="secondary">
                                Manage your profile and security settings
                            </Text>
                        </Col>
                        <Col>
                            <Space>
                                <Button icon={<ReloadOutlined />}>
                                    Refresh
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    style={{ background: "#da2c46", border: "none" }}
                                >
                                    Save All Changes
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </div>

                {/* Main Content */}
                <Card style={{ borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        type="card"
                        size="large"
                        items={[
                            {
                                key: "profile",
                                label: (
                                    <span>
                                        <UserOutlined />
                                        Profile
                                    </span>
                                ),
                                children: <ProfileContent />
                            },
                            {
                                key: "security",
                                label: (
                                    <span>
                                        <SafetyCertificateOutlined />
                                        Security</span>
                                ),
                                children: <SecurityContent />
                            }
                        ]}
                    />
                </Card>

                {/* Avatar Upload Modal */}
                <AvatarUploadModal />
            </div>
        </div>
    );
};

export default EmployeeProfileSettings;