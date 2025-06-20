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
import { useDispatch } from "react-redux";
import { setUserCredentials } from "../Slices/Users/UserSlice";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Step } = Steps;

const degreeOptions = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Diploma",
  "Certificate",
  "Professional Degree",
];

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
    image: "",
    imageFile: null,
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
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(75);
  const [isEduModalVisible, setIsEduModalVisible] = useState(false);
  const [isWorkModalVisible, setIsWorkModalVisible] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [editingEducationData, setEditingEducationData] = useState({
    title: "",
    degree: "",
    field: "",
    institution: "",
    year: "",
  });
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
        image: candidateData.image || "",
        location: candidateData.location || "",
        title: candidateData.title || "",
        education: Array.isArray(candidateData.education)
          ? candidateData.education.map((edu) => ({
              ...edu,
              id: edu.id || Math.random().toString(36).substr(2, 9),
            }))
          : [],
        workExperience: Array.isArray(candidateData.workExperience)
          ? candidateData.workExperience.map((work) => ({
              ...work,
              id: work.id || Math.random().toString(36).substr(2, 9),
            }))
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

  const handleAvatarUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj || newFileList[0];

      if (!file || file.url) {
        return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        message.error("Only JPEG, JPG, and PNG files are allowed!");
        setFileList([]);
        setImageFile(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        message.error("File size should not exceed 5MB!");
        setFileList([]);
        setImageFile(null);
        return;
      }

      setImageFile(file);
    } else {
      setImageFile(null);
    }
  };

  const toggleProfileEdit = () => {
    if (isProfileEditable) {
      profileForm.setFieldsValue(userData);
    }
    setIsProfileEditable(!isProfileEditable);
  };

  const handleProfileSave = async () => {
    try {
      const formValues = await profileForm.validateFields();
      setLoading(true);

      const formData = new FormData();

      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("skills", JSON.stringify(userData.skills));
      formData.append("education", JSON.stringify(userData.education));
      formData.append(
        "workExperience",
        JSON.stringify(userData.workExperience)
      );
      formData.append("preferences", JSON.stringify(userData.preferences));
      formData.append("privacy", JSON.stringify(userData.privacy));
      const res = await profileComplete(formData).unwrap();
      console.log("Profile update response:", res);
      const emailChanged = formValues.email !== userData.email;

      const updatedUserInfo = {
        email: formValues.email,
        name: `${formValues.firstName} ${formValues.lastName}`.trim(),
        roles: "candidate",
      };

      dispatch(
        setUserCredentials({
          userInfo: updatedUserInfo,
          role: "candidate",
        })
      );

      // Update local state
      setUserData((prev) => ({
        ...prev,
        ...formValues,
        imageFile: null,
        fullName: `${formValues.firstName} ${formValues.lastName}`.trim(),
      }));

      message.success("Profile updated successfully!");
      setIsProfileEditable(false);

      // If email changed, show message about needing to relogin
      if (emailChanged) {
        message.info("Email changed. Please login again with your new email.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(
        error?.data?.message ||
          error?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to add education");
      return;
    }
    educationForm.resetFields();
    setEditingEducationId(null);
    setIsEduModalVisible(true);
  };

  const handleEducationSubmit = async () => {
    try {
      const values = await educationForm.validateFields();
      const newEducation = {
        ...values,
        id: editingEducationId || Math.random().toString(36).substr(2, 9),
      };

      if (editingEducationId) {
        setUserData((prev) => ({
          ...prev,
          education: prev.education.map((edu) =>
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
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to edit education");
      return;
    }
    setEditingEducationId(edu.id);
    setEditingEducationData(edu);
    educationForm.setFieldsValue(edu);
    setIsEduModalVisible(true);
  };

  const addWorkExperience = () => {
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to add work experience");
      return;
    }
    workForm.resetFields();
    setEditingWorkId(null);
    setIsWorkModalVisible(true);
  };

  const handleWorkSubmit = async () => {
    try {
      const values = await workForm.validateFields();
      const newWork = {
        ...values,
        id: editingWorkId || Math.random().toString(36).substr(2, 9),
      };

      if (editingWorkId) {
        setUserData((prev) => ({
          ...prev,
          workExperience: prev.workExperience.map((work) =>
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
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to edit work experience");
      return;
    }
    setEditingWorkId(work.id);
    setEditingWorkData(work);
    workForm.setFieldsValue(work);
    setIsWorkModalVisible(true);
  };

  const removeEducation = (id) => {
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to remove education");
      return;
    }
    setUserData({
      ...userData,
      education: userData.education.filter((edu) => edu.id !== id),
    });
  };

  const removeWorkExperience = (id) => {
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to remove work experience");
      return;
    }
    setUserData({
      ...userData,
      workExperience: userData.workExperience.filter((work) => work.id !== id),
    });
  };

  const ProfileContent = () => (
    <div>
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Space style={{ marginTop: "8px" }}>
          {isProfileEditable && (
            <Button onClick={toggleProfileEdit}>Cancel</Button>
          )}
          {isProfileEditable ? (
            <Button
              type="primary"
              loading={loading}
              onClick={handleProfileSave}
              style={{ background: "#da2c46", border: "none" }}
            >
              Save Changes
            </Button>
          ) : (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={toggleProfileEdit}
              style={{ background: "#da2c46", border: "none" }}
            >
              Edit Profile
            </Button>
          )}
        </Space>
      </div>

      <Card
        title={
          <span>
            <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Basic Information
          </span>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form form={profileForm} layout="vertical" initialValues={userData}>
          <Row gutter={24}>
            <Col span={24} style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  size={100}
                  src={userData.image}
                  icon={<UserOutlined />}
                  style={{ border: "4px solid #da2c46" }}
                />
                {isProfileEditable && (
                  <div style={{ marginTop: 16 }}>
                    <Upload
                      accept="image/*"
                      fileList={fileList}
                      onChange={handleAvatarUpload}
                      beforeUpload={() => false}
                      maxCount={1}
                    >
                      <Button
                        type="primary"
                        icon={<CameraOutlined />}
                        style={{
                          marginRight: 8,
                          background: "#da2c46",
                          border: "none",
                        }}
                      >
                        Upload
                      </Button>
                    </Upload>
                    {userData.image && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setUserData({
                            ...userData,
                            image: "",
                            imageFile: null,
                          });
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                )}
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
                  disabled={!isProfileEditable}
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
                  disabled={!isProfileEditable}
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
                  disabled={!isProfileEditable}
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
                  disabled={!isProfileEditable}
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
                  disabled={!isProfileEditable}
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
                  disabled={!isProfileEditable}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card
        title={
          <span>
            <StarOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Skills & Expertise
          </span>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        {isProfileEditable ? (
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
            {isProfileEditable && (
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={addEducation}
              >
                Add Education
              </Button>
            )}
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <List
          dataSource={userData.education}
          renderItem={(edu) => (
            <List.Item
              actions={
                isProfileEditable
                  ? [
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
                    ]
                  : []
              }
            >
              <List.Item.Meta
                title={`${edu.title} (${edu.degree})`}
                description={
                  <div>
                    <Text type="secondary">
                      {edu.field} • {edu.institution} • {edu.year}
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
            {isProfileEditable && (
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={addWorkExperience}
              >
                Add Experience
              </Button>
            )}
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <List
          dataSource={userData.workExperience}
          renderItem={(work) => (
            <List.Item
              actions={
                isProfileEditable
                  ? [
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
                    ]
                  : []
              }
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
          <Form.Item
            name="title"
            label="Education Title"
            rules={[
              {
                required: true,
                message: "Please enter a title for this education",
              },
            ]}
          >
            <Input placeholder="e.g. Computer Science Degree" />
          </Form.Item>

          <Form.Item
            name="degree"
            label="Degree Type"
            rules={[{ required: true, message: "Please select a degree type" }]}
          >
            <Select placeholder="Select degree type">
              {degreeOptions.map((degree) => (
                <Option key={degree} value={degree}>
                  {degree}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="field"
            label="Field of Study"
            rules={[{ required: true, message: "Please enter field of study" }]}
          >
            <Input placeholder="e.g. Computer Science" />
          </Form.Item>

          <Form.Item
            name="institution"
            label="Institution"
            rules={[
              { required: true, message: "Please enter institution name" },
            ]}
          >
            <Input placeholder="e.g. University of California" />
          </Form.Item>

          <Form.Item
            name="year"
            label="Year"
            rules={[{ required: true, message: "Please enter year" }]}
          >
            <Input placeholder="e.g. 2015-2019" />
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
                  message: "Please select at least one preferred location",
                },
                {
                  validator: (_, value) =>
                    value && value.length <= 5
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Maximum 5 locations allowed")
                        ),
                },
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
                  message: "Please select at least one work type",
                },
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
                  message: "Please select at least one employment type",
                },
                {
                  validator: (_, value) =>
                    (value && value.includes("Full-time")) ||
                    value.includes("Part-time")
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(
                            "Please select either Full-time or Part-time"
                          )
                        ),
                },
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
                  message: "Please select at least one industry",
                },
                {
                  validator: (_, value) =>
                    value && value.length >= 1 && value.length <= 3
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("Please select 1-3 industries")
                        ),
                },
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
            Password & Security
          </span>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
        >
          <Row gutter={24}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Current Password"
                name="currentPassword"
                rules={[
                  { required: true, message: "Please enter current password" },
                ]}
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
                  { required: true, message: "Please enter new password" },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters",
                  },
                ]}
                hasFeedback
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label="Confirm New Password"
                name="confirmPassword"
                dependencies={["newPassword"]}
                hasFeedback
                rules={[
                  {
                    required: true,
                    message: "Please confirm your new password",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("The two passwords do not match!")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ textAlign: "right" }}>
            <Space>
              <Button onClick={() => passwordForm.resetFields()}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{ background: "#da2c46", border: "none" }}
              >
                Change Password
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24}>
        <Col xs={24} lg={6}>
          <Card
            style={{
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <Avatar
                size={100}
                src={userData.image}
                icon={<UserOutlined />}
                style={{ border: "4px solid #da2c46" }}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
                {userData.fullName}
              </Title>
              <Text type="secondary">{userData.title}</Text>
            </div>

            <Divider />

            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 16 }}>
                Profile Completion
              </Title>
              <Progress
                percent={profileCompletion}
                strokeColor="#da2c46"
                status="active"
              />
              {profileCompletion < 100 && (
                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: 8 }}
                >
                  Complete your profile to increase your visibility
                </Text>
              )}
            </div>

            <Divider />

            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                type="text"
                icon={<FileTextOutlined />}
                block
                onClick={() => setActiveTab("profile")}
                style={activeTab === "profile" ? { color: "#da2c46" } : {}}
              >
                Profile
              </Button>
              <Button
                type="text"
                icon={<HeartOutlined />}
                block
                onClick={() => setActiveTab("preferences")}
                style={activeTab === "preferences" ? { color: "#da2c46" } : {}}
              >
                Preferences
              </Button>
              <Button
                type="text"
                icon={<LockOutlined />}
                block
                onClick={() => setActiveTab("security")}
                style={activeTab === "security" ? { color: "#da2c46" } : {}}
              >
                Security
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={18}>
          <Card style={{ borderRadius: "12px" }} bodyStyle={{ padding: 0 }}>
            {activeTab === "profile" && <ProfileContent />}
            {activeTab === "preferences" && <PreferencesContent />}
            {activeTab === "security" && <SecurityContent />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CandidateSettings;
