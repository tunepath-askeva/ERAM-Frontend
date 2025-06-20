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
  FileAddOutlined,
} from "@ant-design/icons";
import {
  useGetCandidateQuery,
  useProfileCompletionMutation,
} from "../Slices/Users/UserApis";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;

const CandidateSettings = () => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    skills: [],
    qualifications: [],
    accountStatus: "",
    isActive: false,
    role: "",
    branch: "",
    avatar: "",
    location: "",
    title: "",
    education: [],
    workExperience: [],
    preferences: {
      emailNotifications: false,
      smsNotifications: false,
      jobAlerts: false,
      newsletter: false,
    },
    privacy: {
      profileVisibility: "public",
      showEmail: false,
      showPhone: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState({});
  const [uploadModal, setUploadModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(75);
  const [isEduModalVisible, setIsEduModalVisible] = useState(false);
  const [isWorkModalVisible, setIsWorkModalVisible] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [editingEducationData, setEditingEducationData] = useState({});
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editingWorkData, setEditingWorkData] = useState({});

  const { data: getCandidate } = useGetCandidateQuery();
  const [profileComplete] = useProfileCompletionMutation();

  const [profileForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  const [privacyForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [educationForm] = Form.useForm();
  const [workForm] = Form.useForm();

  useEffect(() => {
    if (
      getCandidate &&
      getCandidate.user &&
      Object.keys(getCandidate.user).length > 0
    ) {
      const candidateData = getCandidate.user;

      const mappedData = {
        firstName: candidateData.firstName || "",
        lastName: candidateData.lastName || "",
        fullName: candidateData.fullName || "",
        email: candidateData.email || "",
        phone: candidateData.phone || "",
        skills: Array.isArray(candidateData.skills) ? candidateData.skills : [],
        qualifications: Array.isArray(candidateData.qualifications)
          ? candidateData.qualifications
          : [],
        accountStatus: candidateData.accountStatus || "",
        isActive: candidateData.isActive || false,
        role: candidateData.role || "",
        branch: candidateData.branch || "",
        avatar: candidateData.avatar || "",
        location: candidateData.location || "",
        title: candidateData.title || "",
        education: Array.isArray(candidateData.education)
          ? candidateData.education.map(edu => ({ ...edu, id: edu.id || Math.random().toString(36).substr(2, 9) }))
          : [],
        workExperience: Array.isArray(candidateData.workExperience)
          ? candidateData.workExperience.map(work => ({ ...work, id: work.id || Math.random().toString(36).substr(2, 9) }))
          : [],
        preferences: {
          emailNotifications:
            candidateData.preferences?.emailNotifications || false,
          smsNotifications:
            candidateData.preferences?.smsNotifications || false,
          jobAlerts: candidateData.preferences?.jobAlerts || false,
          newsletter: candidateData.preferences?.newsletter || false,
        },
        privacy: {
          profileVisibility:
            candidateData.privacy?.profileVisibility || "public",
          showEmail: candidateData.privacy?.showEmail || false,
          showPhone: candidateData.privacy?.showPhone || false,
        },
      };

      setUserData(mappedData);

      profileForm.setFieldsValue(mappedData);
      preferencesForm.setFieldsValue(mappedData.preferences);
      privacyForm.setFieldsValue(mappedData.privacy);

      calculateProfileCompletion(mappedData);
    } else if (
      getCandidate === null ||
      (getCandidate &&
        (!getCandidate.user || Object.keys(getCandidate.user).length === 0))
    ) {
      console.log("No candidate data available or empty user object");
    }
  }, [getCandidate]);

  const calculateProfileCompletion = () => {
    let completion = 0;
    const fields = [
      userData.firstName,
      userData.lastName,
      userData.email,
      userData.phone,
      userData.location,
      userData.title,
      userData.skills?.length > 0,
      userData.education?.length > 0,
      userData.workExperience?.length > 0,
    ];

    fields.forEach((field) => {
      if (field) completion += 10;
    });

    setProfileCompletion(Math.min(completion, 100));
  };

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...userData,
        ...values,
        skills: userData.skills,
        education: userData.education,
        workExperience: userData.workExperience,
      };

      console.log("Payload to send to backend:", payload);

      const res = await profileComplete(payload);
      console.log(res, "hi response =-=");

      setUserData((prevData) => ({ ...prevData, ...values }));

      message.success("Profile updated successfully!");
      setEditMode({});
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    }
    setLoading(false);
  };

  const handlePreferencesUpdate = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...userData,
        preferences: values,
      };

      console.log("Preferences payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUserData({ ...userData, preferences: values });
      message.success("Preferences updated successfully!");
    } catch (error) {
      message.error("Failed to update preferences");
    }
    setLoading(false);
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      const payload = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      console.log("Password change payload:", payload);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      message.success("Password changed successfully!");
      passwordForm.resetFields();
    } catch (error) {
      message.error("Failed to change password");
    }
    setLoading(false);
  };

  const handleAvatarUpload = ({ file, fileList }) => {
    if (file.status === "done") {
      message.success("Profile picture updated successfully!");
      setUserData({
        ...userData,
        avatar: URL.createObjectURL(file.originFileObj),
      });
    }
  };

  const addEducation = () => {
    educationForm.resetFields();
    setEditingEducationId(null);
    setIsEduModalVisible(true);
  };

  const handleEducationSubmit = async () => {
    try {
      const values = await educationForm.validateFields();
      const newEducation = { 
        ...values, 
        id: editingEducationId || Math.random().toString(36).substr(2, 9) 
      };
      
      if (editingEducationId) {
        setUserData((prev) => ({
          ...prev,
          education: prev.education.map(edu => 
            edu.id === editingEducationId ? newEducation : edu
          ),
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          education: [...prev.education, newEducation],
        }));
      }
      setIsEduModalVisible(false);
      setEditingEducationId(null);
    } catch (err) {
      console.log("Validation error:", err);
    }
  };

  const handleEditEducation = (edu) => {
    setEditingEducationId(edu.id);
    setEditingEducationData(edu);
    educationForm.setFieldsValue(edu);
    setIsEduModalVisible(true);
  };

  const addWorkExperience = () => {
    workForm.resetFields();
    setEditingWorkId(null);
    setIsWorkModalVisible(true);
  };

  const handleWorkSubmit = async () => {
    try {
      const values = await workForm.validateFields();
      const newWork = {
        ...values,
        id: editingWorkId || Math.random().toString(36).substr(2, 9)
      };

      if (editingWorkId) {
        setUserData((prev) => ({
          ...prev,
          workExperience: prev.workExperience.map(work => 
            work.id === editingWorkId ? newWork : work
          ),
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          workExperience: [...prev.workExperience, newWork],
        }));
      }

      setIsWorkModalVisible(false);
      setEditingWorkId(null);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleEditWork = (work) => {
    setEditingWorkId(work.id);
    setEditingWorkData(work);
    workForm.setFieldsValue(work);
    setIsWorkModalVisible(true);
  };

  const removeEducation = (id) => {
    setUserData({
      ...userData,
      education: userData.education.filter((edu) => edu.id !== id),
    });
  };

  const removeWorkExperience = (id) => {
    setUserData({
      ...userData,
      workExperience: userData.workExperience.filter((work) => work.id !== id),
    });
  };

  const toggleEditMode = (section) => {
    setEditMode({
      ...editMode,
      [section]: !editMode[section],
    });
  };

  const handleSaveChanges = async () => {
    try {
      const formValues = await profileForm.validateFields();

      setLoading(true);

      const payload = {
        ...userData,
        ...formValues,
        skills: userData.skills,
        education: userData.education,
        workExperience: userData.workExperience,
      };

      console.log("Payload to send to backend:", payload);

      const res = await profileComplete(payload);
      console.log(res, "hi response =-=");

      setUserData((prevData) => ({ ...prevData, ...formValues }));

      message.success("Profile updated successfully!");
      setEditMode({});
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const ProfileContent = () => (
    <div>
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Basic Information
            </span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => toggleEditMode("basic")}
            >
              {editMode.basic ? "Cancel" : "Edit"}
            </Button>
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={userData}
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
                    border: "2px solid white",
                  }}
                />
              </div>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please enter your first name" },
                ]}
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
                rules={[
                  { required: true, message: "Please enter your last name" },
                ]}
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
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
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
                rules={[
                  { required: true, message: "Please enter your phone number" },
                ]}
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
                rules={[
                  { required: true, message: "Please enter your location" },
                ]}
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
                rules={[{ required: true, message: "Please enter your title" }]}
              >
                <Input
                  placeholder="e.g. Full Stack Developer"
                  disabled={!editMode.basic}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <StarOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Skills & Expertise
            </span>
            <Button
              type="link"
              icon={<PlusOutlined />}
              onClick={() => toggleEditMode("skills")}
            >
              {editMode.skills ? "Cancel" : "Add"}
            </Button>
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        {editMode.skills ? (
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="Add your skills"
            value={userData.skills}
            onChange={(skills) => setUserData({ ...userData, skills })}
            tokenSeparators={[","]}
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
      </Card>

      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <BookOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Education
            </span>
            <Button type="link" icon={<PlusOutlined />} onClick={addEducation}>
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
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditEducation(edu)} 
                  key="edit" 
                />,
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeEducation(edu.id)}
                  key="delete"
                />,
              ]}
            >
              <List.Item.Meta
                title={`${edu.degree} in ${edu.field}`}
                description={
                  <div>
                    <Text type="secondary">
                      {edu.institution} • {edu.year}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
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
                <Button 
                  type="link" 
                  icon={<EditOutlined />} 
                  onClick={() => handleEditWork(work)} 
                  key="edit" 
                />,
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeWorkExperience(work.id)}
                  key="delete"
                />,
              ]}
            >
              <List.Item.Meta
                title={work.title}
                description={
                  <div>
                    <Text type="secondary">
                      {work.company} • {work.duration}
                    </Text>
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

      {editMode.basic && (
        <div style={{ textAlign: "right", marginTop: 16 }}>
          <Space>
            <Button onClick={() => toggleEditMode("basic")}>Cancel</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={handleSaveChanges}
              style={{ background: "#da2c46", border: "none" }}
            >
              Save Changes
            </Button>
          </Space>
        </div>
      )}

      <Modal
        visible={isEduModalVisible}
        title={editingEducationId ? "Edit Education" : "Add Education"}
        onOk={handleEducationSubmit}
        onCancel={() => {
          setIsEduModalVisible(false);
          setEditingEducationId(null);
        }}
        okText={editingEducationId ? "Update" : "Add"}
      >
        <Form layout="vertical" form={educationForm}>
          <Form.Item name="degree" label="Degree" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="field" label="Field" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="institution"
            label="Institution"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="year" label="Year" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={isWorkModalVisible}
        title={editingWorkId ? "Edit Work Experience" : "Add Work Experience"}
        onOk={handleWorkSubmit}
        onCancel={() => {
          setIsWorkModalVisible(false);
          setEditingWorkId(null);
        }}
        okText={editingWorkId ? "Update" : "Add"}
      >
        <Form form={workForm} layout="vertical">
          <Form.Item
            label="Job Title"
            name="title"
            rules={[{ required: true, message: "Please enter job title" }]}
          >
            <Input placeholder="e.g. Software Engineer" />
          </Form.Item>

          <Form.Item
            label="Company"
            name="company"
            rules={[{ required: true, message: "Please enter company name" }]}
          >
            <Input placeholder="e.g. ABC Tech Pvt Ltd" />
          </Form.Item>

          <Form.Item
            label="Duration"
            name="duration"
            rules={[{ required: true, message: "Please enter duration" }]}
          >
            <Input placeholder="e.g. 2021 - Present" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} placeholder="Describe your role..." />
          </Form.Item>
        </Form>
      </Modal>
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
        rules={[
          { 
            required: true, 
            message: 'Please select at least one preferred location' 
          },
          {
            validator: (_, value) => 
              value && value.length <= 5 
                ? Promise.resolve() 
                : Promise.reject(new Error('Maximum 5 locations allowed'))
          }
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select preferred locations"
          style={{ width: "100%" }}
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
        rules={[
          { 
            required: true, 
            message: 'Please select at least one work type' 
          }
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select work type"
          style={{ width: "100%" }}
          maxTagCount={3}
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
        rules={[
          { 
            required: true, 
            message: 'Please select at least one employment type' 
          },
          {
            validator: (_, value) =>
              value && value.includes('Full-time') || value.includes('Part-time')
                ? Promise.resolve()
                : Promise.reject(new Error('Please select either Full-time or Part-time'))
          }
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select employment type"
          style={{ width: "100%" }}
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
        rules={[
          { 
            required: true, 
            message: 'Please select at least one industry' 
          },
          {
            validator: (_, value) =>
              value && value.length >= 1 && value.length <= 3
                ? Promise.resolve()
                : Promise.reject(new Error('Please select 1-3 industries'))
          }
        ]}
      >
        <Select
          mode="multiple"
          placeholder="Select industries"
          style={{ width: "100%" }}
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

      <div style={{ textAlign: "right" }}>
        <Space>
          <Button>Cancel</Button>
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
            rules={[
              { required: true, message: "Please enter your current password" },
            ]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { required: true, message: "Please enter new password" },
              { min: 8, message: "Password must be at least 8 characters" },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
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
            <ExclamationCircleOutlined
              style={{ marginRight: 8, color: "#ff4d4f" }}
            />
            Account Actions
          </span>
        }
        style={{ borderRadius: "12px" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
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
                  title: "Are you sure you want to delete your account?",
                  content:
                    "This action cannot be undone. All your data will be permanently removed.",
                  okText: "Yes, Delete Account",
                  okType: "danger",
                  cancelText: "Cancel",
                  onOk() {
                    message.success("Account deletion request submitted");
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
    <div style={{ padding: "16px", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <Title level={2} style={{ margin: 0, color: "#2c3e50" }}>
          <SettingOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          Profile Settings
        </Title>
        <Text
          type="secondary"
          style={{ display: "block", marginTop: 8, fontSize: "16px" }}
        >
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
            ".ant-tabs-tab": {
              borderRadius: "8px",
            },
            ".ant-tabs-tab-active": {
              background: "#da2c46",
              color: "white",
            },
          }}
        >
          <TabPane
            tab={
              <span>
                <UserOutlined style={{ marginRight: "5px" }} />
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
                <HeartOutlined style={{ marginRight: "5px" }} />
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
                <LockOutlined style={{ marginRight: "5px" }} />
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
            const isJpgOrPng =
              file.type === "image/jpeg" || file.type === "image/png";
            if (!isJpgOrPng) {
              message.error("You can only upload JPG/PNG file!");
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
              message.error("Image must smaller than 2MB!");
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
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary">
            Upload a profile picture (JPG/PNG, max 2MB)
          </Text>
        </div>
      </Modal>
    </div>
  );
};

export default CandidateSettings;