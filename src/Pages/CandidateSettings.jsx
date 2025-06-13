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
  Divider,
  Form,
  Input,
  Select,
  Upload,
  Avatar,
  Switch,
  DatePicker,
  Tabs,
  List,
  Badge,
  Alert,
  Progress,
  Steps,
  Radio,
  Checkbox,
  Slider,
  TimePicker,
  InputNumber,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  BellOutlined,
  LockOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BankOutlined,
  BookOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  GlobalOutlined,
  LinkedinOutlined,
  GithubOutlined,
  TwitterOutlined,
  FacebookOutlined,
  SaveOutlined,
  ReloadOutlined,
  HeartOutlined,
  TeamOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  StarOutlined,
  DollarOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;

// Mock user data
const mockUserData = {
  _id: "user123",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+91 9876543210",
  location: "Bengaluru, Karnataka, India",
  avatar: "https://via.placeholder.com/100",
  title: "Full Stack Developer",
  bio: "Passionate full-stack developer with 3+ years of experience in building scalable web applications using modern technologies.",
  experience: "3-5 years",
  expectedSalary: "₹12-18 LPA",
  skills: ["React", "Node.js", "JavaScript", "MongoDB", "Express.js", "TypeScript"],
  languages: ["English", "Hindi", "Kannada"],
  education: [
    {
      id: 1,
      degree: "Bachelor of Engineering",
      field: "Computer Science",
      institution: "XYZ University",
      year: "2020",
      grade: "8.5 CGPA"
    }
  ],
  workExperience: [
    {
      id: 1,
      title: "Software Developer",
      company: "Tech Solutions Inc.",
      duration: "2021 - Present",
      description: "Developed and maintained web applications using React and Node.js"
    }
  ],
  socialLinks: {
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe",
    portfolio: "https://johndoe.dev"
  },
  preferences: {
    jobAlerts: true,
    emailNotifications: true,
    profileVisibility: "public",
    preferredLocations: ["Bengaluru", "Mumbai", "Pune"],
    workType: ["Remote", "Hybrid"],
    employmentType: ["Full-time"],
    industries: ["Technology", "Startups"]
  },
  privacy: {
    showEmail: false,
    showPhone: false,
    showSalary: true,
    allowRecruiterContact: true
  }
};

const CandidateSettings = () => {
  const [userData, setUserData] = useState(mockUserData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState({});
  const [uploadModal, setUploadModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(75);

  // Forms
  const [profileForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  const [privacyForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    // Initialize forms with current data
    profileForm.setFieldsValue(userData);
    preferencesForm.setFieldsValue(userData.preferences);
    privacyForm.setFieldsValue(userData.privacy);
    calculateProfileCompletion();
  }, [userData]);

  const calculateProfileCompletion = () => {
    let completion = 0;
    const fields = [
      userData.firstName, userData.lastName, userData.email, userData.phone,
      userData.location, userData.title, userData.bio, userData.skills?.length > 0,
      userData.education?.length > 0, userData.workExperience?.length > 0
    ];
    
    fields.forEach(field => {
      if (field) completion += 10;
    });
    
    setProfileCompletion(Math.min(completion, 100));
  };

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserData({ ...userData, ...values });
      message.success("Profile updated successfully!");
      setEditMode({});
    } catch (error) {
      message.error("Failed to update profile");
    }
    setLoading(false);
  };

  const handlePreferencesUpdate = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserData({ ...userData, preferences: values });
      message.success("Preferences updated successfully!");
    } catch (error) {
      message.error("Failed to update preferences");
    }
    setLoading(false);
  };

  const handlePrivacyUpdate = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserData({ ...userData, privacy: values });
      message.success("Privacy settings updated successfully!");
    } catch (error) {
      message.error("Failed to update privacy settings");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success("Password changed successfully!");
      passwordForm.resetFields();
    } catch (error) {
      message.error("Failed to change password");
    }
    setLoading(false);
  };

  const handleAvatarUpload = ({ file, fileList }) => {
    if (file.status === 'done') {
      message.success("Profile picture updated successfully!");
      setUserData({ ...userData, avatar: URL.createObjectURL(file.originFileObj) });
    }
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: "",
      field: "",
      institution: "",
      year: "",
      grade: ""
    };
    setUserData({
      ...userData,
      education: [...userData.education, newEducation]
    });
  };

  const addWorkExperience = () => {
    const newWork = {
      id: Date.now(),
      title: "",
      company: "",
      duration: "",
      description: ""
    };
    setUserData({
      ...userData,
      workExperience: [...userData.workExperience, newWork]
    });
  };

  const removeEducation = (id) => {
    setUserData({
      ...userData,
      education: userData.education.filter(edu => edu.id !== id)
    });
  };

  const removeWorkExperience = (id) => {
    setUserData({
      ...userData,
      workExperience: userData.workExperience.filter(work => work.id !== id)
    });
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
          Complete your profile to increase visibility to recruiters
        </Text>
      </Card>

      {/* Basic Information */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>
              <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Basic Information
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
                  src={userData.avatar}
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
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Please enter your first name' }]}
              >
                <Input 
                  placeholder="Enter first name"
                  disabled={!editMode.basic}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Please enter your last name' }]}
              >
                <Input 
                  placeholder="Enter last name"
                  disabled={!editMode.basic}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please enter your email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />}
                  placeholder="Enter email"
                  disabled={!editMode.basic}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input 
                  prefix={<PhoneOutlined />}
                  placeholder="Enter phone number"
                  disabled={!editMode.basic}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: 'Please enter your location' }]}
              >
                <Input 
                  prefix={<EnvironmentOutlined />}
                  placeholder="Enter location"
                  disabled={!editMode.basic}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} sm={12}>
              <Form.Item
                label="Professional Title"
                name="title"
                rules={[{ required: true, message: 'Please enter your title' }]}
              >
                <Input 
                  placeholder="e.g. Full Stack Developer"
                  disabled={!editMode.basic}
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                label="Bio"
                name="bio"
                rules={[{ required: true, message: 'Please enter your bio' }]}
              >
                <TextArea 
                  rows={4}
                  placeholder="Tell us about yourself..."
                  disabled={!editMode.basic}
                />
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

      {/* Skills Section */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>
              <StarOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Skills & Expertise
            </span>
            <Button 
              type="link" 
              icon={<EditOutlined />}
              onClick={() => toggleEditMode('skills')}
            >
              {editMode.skills ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        {editMode.skills ? (
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="Add your skills"
            value={userData.skills}
            onChange={(skills) => setUserData({ ...userData, skills })}
            tokenSeparators={[',']}
          />
        ) : (
          <Space wrap>
            {userData.skills.map((skill, index) => (
              <Tag 
                key={index}
                style={{
                  padding: "4px 12px",
                  fontSize: "14px",
                  border: "1px solid #da2c46",
                  color: "#da2c46",
                  background: "rgba(218, 44, 70, 0.05)",
                }}
              >
                {skill}
              </Tag>
            ))}
          </Space>
        )}
        
        {editMode.skills && (
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Space>
              <Button onClick={() => toggleEditMode('skills')}>
                Cancel
              </Button>
              <Button 
                type="primary"
                onClick={() => {
                  message.success("Skills updated successfully!");
                  toggleEditMode('skills');
                }}
                style={{ background: "#da2c46", border: "none" }}
              >
                Save Skills
              </Button>
            </Space>
          </div>
        )}
      </Card>

      {/* Education Section */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>
              <BookOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Education
            </span>
            <Button 
              type="link" 
              icon={<PlusOutlined />}
              onClick={addEducation}
            >
              Add Education
            </Button>
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <List
          dataSource={userData.education}
          renderItem={(edu) => (
            <List.Item
              actions={[
                <Button type="link" icon={<EditOutlined />} key="edit" />,
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeEducation(edu.id)}
                  key="delete"
                />
              ]}
            >
              <List.Item.Meta
                title={`${edu.degree} in ${edu.field}`}
                description={
                  <div>
                    <Text type="secondary">{edu.institution} • {edu.year}</Text>
                    {edu.grade && (
                      <div>
                        <Text>Grade: {edu.grade}</Text>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Work Experience Section */}
      <Card 
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>
              <BankOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Work Experience
            </span>
            <Button 
              type="link" 
              icon={<PlusOutlined />}
              onClick={addWorkExperience}
            >
              Add Experience
            </Button>
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <List
          dataSource={userData.workExperience}
          renderItem={(work) => (
            <List.Item
              actions={[
                <Button type="link" icon={<EditOutlined />} key="edit" />,
                <Button 
                  type="link" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => removeWorkExperience(work.id)}
                  key="delete"
                />
              ]}
            >
              <List.Item.Meta
                title={work.title}
                description={
                  <div>
                    <Text type="secondary">{work.company} • {work.duration}</Text>
                    <Paragraph style={{ marginTop: 8, marginBottom: 0 }}>
                      {work.description}
                    </Paragraph>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  // Preferences Tab Content
  const PreferencesContent = () => (
    <Form
      form={preferencesForm}
      layout="vertical"
      onFinish={handlePreferencesUpdate}
    >
      <Card 
        title={
          <span>
            <HeartOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Job Preferences
          </span>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Preferred Locations"
              name="preferredLocations"
            >
              <Select
                mode="multiple"
                placeholder="Select preferred locations"
                style={{ width: '100%' }}
              >
                <Option value="Bengaluru">Bengaluru</Option>
                <Option value="Mumbai">Mumbai</Option>
                <Option value="Pune">Pune</Option>
                <Option value="Delhi">Delhi</Option>
                <Option value="Hyderabad">Hyderabad</Option>
                <Option value="Chennai">Chennai</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              label="Work Type"
              name="workType"
            >
              <Select
                mode="multiple"
                placeholder="Select work type"
                style={{ width: '100%' }}
              >
                <Option value="Remote">Remote</Option>
                <Option value="On-site">On-site</Option>
                <Option value="Hybrid">Hybrid</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              label="Employment Type"
              name="employmentType"
            >
              <Select
                mode="multiple"
                placeholder="Select employment type"
                style={{ width: '100%' }}
              >
                <Option value="Full-time">Full-time</Option>
                <Option value="Part-time">Part-time</Option>
                <Option value="Contract">Contract</Option>
                <Option value="Internship">Internship</Option>
              </Select>
            </Form.Item>
          </Col>
          
          <Col xs={24} sm={12}>
            <Form.Item
              label="Preferred Industries"
              name="industries"
            >
              <Select
                mode="multiple"
                placeholder="Select industries"
                style={{ width: '100%' }}
              >
                <Option value="Technology">Technology</Option>
                <Option value="Startups">Startups</Option>
                <Option value="Finance">Finance</Option>
                <Option value="Healthcare">Healthcare</Option>
                <Option value="E-commerce">E-commerce</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card 
        title={
          <span>
            <BellOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Notification Preferences
          </span>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form.Item
          name="jobAlerts"
          valuePropName="checked"
          label="Job Alerts"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="emailNotifications"
          valuePropName="checked"
          label="Email Notifications"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="profileVisibility"
          label="Profile Visibility"
        >
          <Radio.Group>
            <Radio value="public">Public</Radio>
            <Radio value="private">Private</Radio>
            <Radio value="recruiters">Recruiters Only</Radio>
          </Radio.Group>
        </Form.Item>
      </Card>

      <div style={{ textAlign: "right" }}>
        <Space>
          <Button>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            style={{ background: "#da2c46", border: "none" }}
          >
            Save Preferences
          </Button>
        </Space>
      </div>
    </Form>
  );

  // Privacy Tab Content
  const PrivacyContent = () => (
    <Form
      form={privacyForm}
      layout="vertical"
      onFinish={handlePrivacyUpdate}
    >
      <Card 
        title={
          <span>
            <EyeOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Profile Visibility
          </span>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form.Item
          name="showEmail"
          valuePropName="checked"
          label="Show Email Address"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="showPhone"
          valuePropName="checked"
          label="Show Phone Number"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="showSalary"
          valuePropName="checked"
          label="Show Expected Salary"
        >
          <Switch />
        </Form.Item>
        
        <Form.Item
          name="allowRecruiterContact"
          valuePropName="checked"
          label="Allow Recruiters to Contact Me"
        >
          <Switch />
        </Form.Item>
      </Card>

      <div style={{ textAlign: "right" }}>
        <Space>
          <Button>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            style={{ background: "#da2c46", border: "none" }}
          >
            Save Privacy Settings
          </Button>
        </Space>
      </div>
    </Form>
  );

  // Security Tab Content
  const SecurityContent = () => (
    <div>
      <Card 
        title={
          <span>
            <LockOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Change Password
          </span>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>
          
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
          
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              style={{ background: "#da2c46", border: "none" }}
            >
              Change Password
            </Button>
          </div>
        </Form>
      </Card>

      <Card 
        title={
          <span>
            <ExclamationCircleOutlined style={{ marginRight: 8, color: "#ff4d4f" }} />
            Account Actions
          </span>
        }
        style={{ borderRadius: "12px" }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert
            message="Danger Zone"
            description="These actions cannot be undone. Please be careful."
            type="warning"
            showIcon
          />
          
          <div style={{ marginTop: 16 }}>
            <Button 
              danger
              onClick={() => {
                Modal.confirm({
                  title: 'Are you sure you want to delete your account?',
                  content: 'This action cannot be undone. All your data will be permanently removed.',
                  okText: 'Yes, Delete Account',
                  okType: 'danger',
                  cancelText: 'Cancel',
                  onOk() {
                    message.success('Account deletion request submitted');
                  },
                });
              }}
            >
              Delete Account
            </Button>
          </div>
        </Space>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: "16px", minHeight: "100vh"}}>
      {/* Header */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          <SettingOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          Profile Settings
        </Title>
        <Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: "16px" }}>
          Manage your profile, preferences, and account settings
        </Text>
      </div>

      {/* Settings Tabs */}
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          style={{
            '.ant-tabs-tab': {
              borderRadius: '8px',
            },
            '.ant-tabs-tab-active': {
              background: '#da2c46',
              color: 'white',
            }
          }}
        >
          <TabPane
            tab={
              <span>
                <UserOutlined style={{ marginRight: '5px' }}/>
                Profile
              </span>
            }
            key="profile"
          >
            <ProfileContent />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <HeartOutlined style={{ marginRight: '5px' }}/>
                Preferences
              </span>
            }
            key="preferences"
          >
            <PreferencesContent />
          </TabPane>
          <TabPane
            tab={
              <span>
                <EyeOutlined style={{ marginRight: '5px' }}/>
                Privacy
              </span>
            }
            key="privacy"
          >
            <PrivacyContent />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <LockOutlined style={{ marginRight: '5px' }}/>
                Security
              </span>
            }
            key="security"
          >
            <SecurityContent />
          </TabPane>
        </Tabs>
      </Card>

      {/* Upload Modal */}
      <Modal
        title="Upload Profile Picture"
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={null}
        centered
      >
        <Upload
          name="avatar"
          listType="picture-card"
          className="avatar-uploader"
          showUploadList={false}
          beforeUpload={(file) => {
            const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
            if (!isJpgOrPng) {
              message.error('You can only upload JPG/PNG file!');
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
              message.error('Image must smaller than 2MB!');
            }
            return isJpgOrPng && isLt2M;
          }}
          onChange={handleAvatarUpload}
        >
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text type="secondary">
            Upload a profile picture (JPG/PNG, max 2MB)
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateSettings;