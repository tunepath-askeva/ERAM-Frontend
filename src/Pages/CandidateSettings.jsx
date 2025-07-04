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
  IdcardOutlined,
  ContactsOutlined,
  HomeOutlined,
  SafetyOutlined,
  FlagOutlined,
  WarningOutlined,
  FireOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import {
  useGetCandidateQuery,
  useProfileCompletionMutation,
} from "../Slices/Users/UserApis";
import { useDispatch } from "react-redux";
import { setUserCredentials } from "../Slices/Users/UserSlice";
import dayjs from "dayjs";

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
const genderOptions = ["Male", "Female", "Prefer not to say", "Others"];
const maritalStatusOptions = ["Single", "Married"];
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const religionOptions = [
  "Christianity",
  "Islam",
  "Hinduism",
  "Buddhism",
  "Judaism",
  "Sikhism",
  "Jainism",
  "Other",
  "Prefer not to say",
];

const CandidateSettings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    fullName: "",
    email: "",
    phone: "",
    skills: [],
    languages: [],
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
    // Personal Information
    nationality: "",
    countryOfBirth: "",
    maritalStatus: "",
    gender: "",
    bloodGroup: "",
    religion: "",
    totalExperienceYears: "",
    emergencyContactNo: "",
    noticePeriod: "",
    // Passport Information
    passportNo: "",
    passportPlaceOfIssue: "",
    passportIssueDate: null,
    passportExpiryDate: null,
    iqamaNo: "",
    // Address Information
    region: "",
    streetNo: "",
    streetName: "",
    block: "",
    building: "",
    zipCode: "",
    city: "",
    state: "",
    country: "",
    // Emergency Contact
    contactPersonName: "",
    contactPersonMobile: "",
    contactPersonHomeNo: "",
    // Nominee Information
    nomineeName: "",
    nomineeRelationship: "",
    profileSummary: "",
    currentSalary: "",
    expectedSalary: "",
    resume: "",
    resumeFile: null,
    lastUpdated: "",
    socialLinks: {
      linkedin: "",
      github: "",
      twitter: "",
      facebook: "",
    },
    jobPreferences: {
      roles: [],
      locations: [],
      salaryRange: "",
      workType: "",
      employmentType: "",
    },
    workMode: "",
  });
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isEduModalVisible, setIsEduModalVisible] = useState(false);
  const [isWorkModalVisible, setIsWorkModalVisible] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isCurrentJob, setIsCurrentJob] = useState(false);

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
  const [personalForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [educationForm] = Form.useForm();
  const [workForm] = Form.useForm();

  useEffect(() => {
    if (getCandidate && getCandidate.user) {
      const candidateData = getCandidate.user;

      const mappedData = {
        firstName: candidateData.firstName || "",
        lastName: candidateData.lastName || "",
        middleName: candidateData.middleName || "",
        fullName: candidateData.fullName || "",
        email: candidateData.email || "",
        phone: candidateData.phone || "",
        skills: Array.isArray(candidateData.skills) ? candidateData.skills : [],
        qualifications: Array.isArray(candidateData.qualifications)
          ? candidateData.qualifications
          : [],
        languages: Array.isArray(candidateData.languages)
          ? candidateData.languages
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
          ? candidateData.workExperience.map((work) => {
              let startDate = null;
              let endDate = null;

              if (work.duration) {
                const [start, end] = work.duration.split("-");
                startDate = start;
                endDate = end === "present" ? "Present" : end;
              }

              return {
                ...work,
                startDate: work.startDate || startDate,
                endDate: work.endDate || endDate,
                id:
                  work.id ||
                  work._id ||
                  Math.random().toString(36).substr(2, 9),
              };
            })
          : [],
        nationality: candidateData.nationality || "",
        countryOfBirth: candidateData.countryOfBirth || "",
        maritalStatus: candidateData.maritalStatus || "",
        gender: candidateData.gender || "",

        bloodGroup: candidateData.bloodGroup || "",
        religion: candidateData.religion || "",
        totalExperienceYears: candidateData.totalExperienceYears || "",
        emergencyContactNo: candidateData.emergencyContactNo || "",
        noticePeriod: candidateData.noticePeriod || "",
        passportNo: candidateData.passportNo || "",
        passportPlaceOfIssue: candidateData.passportPlaceOfIssue || "",
        passportIssueDate: candidateData.passportIssueDate
          ? dayjs.isDayjs(candidateData.passportIssueDate)
            ? candidateData.passportIssueDate
            : dayjs(candidateData.passportIssueDate)
          : null,
        passportExpiryDate: candidateData.passportExpiryDate
          ? dayjs.isDayjs(candidateData.passportExpiryDate)
            ? candidateData.passportExpiryDate
            : dayjs(candidateData.passportExpiryDate)
          : null,

        iqamaNo: candidateData.iqamaNo || "",
        region: candidateData.region || "",
        streetNo: candidateData.streetNo || "",
        streetName: candidateData.streetName || "",
        block: candidateData.block || "",
        building: candidateData.building || "",
        zipCode: candidateData.zipCode || "",
        city: candidateData.city || "",
        state: candidateData.state || "",
        country: candidateData.country || "",
        contactPersonName: candidateData.contactPersonName || "",
        contactPersonMobile: candidateData.contactPersonMobile || "",
        contactPersonHomeNo: candidateData.contactPersonHomeNo || "",
        nomineeName: candidateData.nomineeName || "",
        nomineeRelationship: candidateData.nomineeRelationship || "",
        profileSummary: candidateData.profileSummary || "",
        currentSalary: candidateData.currentSalary || "",
        expectedSalary: candidateData.expectedSalary || "",
        resume: candidateData.resume || "",
        resumeUrl: candidateData.resumeUrl || "",
        resumeFile: null,
        lastUpdated: candidateData.lastUpdated || "",
        socialLinks: candidateData.socialLinks || {
          linkedin: "",
          github: "",
          twitter: "",
          facebook: "",
        },
        jobPreferences: candidateData.jobPreferences || {
          roles: [],
          locations: [],
          salaryRange: "",
          workType: "",
          employmentType: "",
        },
        workMode: candidateData.workMode || "",
      };

      setUserData(mappedData);

      profileForm.setFieldsValue(mappedData);
      personalForm.setFieldsValue(mappedData);
      addressForm.setFieldsValue(mappedData);
      contactForm.setFieldsValue(mappedData);
      preferencesForm.setFieldsValue({
        roles: mappedData.jobPreferences?.roles || [],
        locations: mappedData.jobPreferences?.locations || [],
        salaryRange: mappedData.jobPreferences?.salaryRange || "",
        workType: mappedData.jobPreferences?.workType || "",
        employmentType: mappedData.jobPreferences?.employmentType || "",
      });

      calculateProfileCompletion(mappedData);
    }
  }, [getCandidate]);

  const calculateProfileCompletion = (data = userData) => {
    const requiredFields = [
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.location,
      data.title,

      data.skills?.length > 0,
      data.languages?.length > 0,
      data.education?.length > 0,
      data.workExperience?.length > 0,
      data.totalExperienceYears,

      data.nationality,
      data.maritalStatus,
      data.gender,
      data.bloodGroup,
      data.countryOfBirth,

      data.city,
      data.state,
      data.country,
      data.zipCode,

      data.emergencyContactNo,
      data.contactPersonName,

      data.noticePeriod,
      data.passportNo,
    ];

    const completedFields = requiredFields.filter((field) => {
      if (typeof field === "boolean") return field;
      if (typeof field === "string") return field.trim() !== "";
      return field !== null && field !== undefined;
    }).length;

    const completion = Math.round(
      (completedFields / requiredFields.length) * 100
    );
    setProfileCompletion(completion);
  };

  const handlePreferencesUpdate = async () => {
    try {
      const values = await preferencesForm.validateFields();
      setLoading(true);

      const payload = {
        jobPreferences: {
          roles: values.roles || [],
          locations: values.locations || [],
          salaryRange: values.salaryRange || "",
          workType: values.workType || "",
          employmentType: values.employmentType || "",
        },
      };

      await profileComplete(payload).unwrap();

      setUserData((prev) => ({
        ...prev,
        jobPreferences: payload.jobPreferences,
      }));

      enqueueSnackbar("Preferences updated successfully!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Update error:", error);
      enqueueSnackbar(error?.data?.message || "Failed to update preferences", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      const payload = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));
      enqueueSnackbar("Password changed successfully!", {
        variant: "success",
      });
      passwordForm.resetFields();
    } catch (error) {
      enqueueSnackbar("Failed to change password", {
        variant: "error",
      });
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
      personalForm.setFieldsValue(userData);
      addressForm.setFieldsValue(userData);
      contactForm.setFieldsValue(userData);
    }
    setIsProfileEditable(!isProfileEditable);
  };

  const handleProfileSave = async () => {
    try {
      const profileValues = await profileForm.validateFields();
      const personalValues = await personalForm.validateFields();
      const addressValues = await addressForm.validateFields();
      const contactValues = await contactForm.validateFields();
      const preferencesValues = await preferencesForm.validateFields();

      const allValues = {
        ...profileValues,
        ...personalValues,
        ...addressValues,
        ...contactValues,
        jobPreferences: preferencesValues,
        socialLinks: profileValues.socialLinks || userData.socialLinks,
        lastUpdated: new Date().toISOString(),
      };

      setLoading(true);

      const formData = new FormData();

      Object.entries(allValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (dayjs.isDayjs(value)) {
            formData.append(key, value.format("YYYY-MM-DD"));
          } else if (key === "socialLinks" || key === "jobPreferences") {
            // Skip these as we'll handle them separately
          } else {
            formData.append(key, value);
          }
        }
      });

      formData.append(
        "socialLinks",
        JSON.stringify(allValues.socialLinks || {})
      );
      formData.append(
        "jobPreferences",
        JSON.stringify(allValues.jobPreferences || {})
      );

      formData.append("skills", JSON.stringify(userData.skills || []));
      formData.append("languages", userData.languages || []);
      formData.append("education", JSON.stringify(userData.education || []));
      formData.append(
        "workExperience",
        JSON.stringify(userData.workExperience || [])
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }
      if (userData.resumeFile) {
        formData.append("resume", userData.resumeFile); 
      } else if (!userData.resumeFile && userData.resumeUrl === "") {
        formData.append("resume", ""); 
      }

      const res = await profileComplete(formData).unwrap();

      const emailChanged = allValues.email !== userData.email;

      const updatedUserInfo = {
        email: allValues.email,
        name: `${allValues.firstName} ${allValues.lastName}`.trim(),
        roles: "candidate",
      };

      dispatch(
        setUserCredentials({
          userInfo: updatedUserInfo,
          role: "candidate",
        })
      );

      const updatedData = {
        ...userData,
        ...allValues,
        imageFile: null,
        fullName: `${allValues.firstName} ${allValues.lastName}`.trim(),
      };

      setUserData(updatedData);
      calculateProfileCompletion(updatedData);

      enqueueSnackbar("Profile updated successfully!", {
        variant: "success",
      });
      setIsProfileEditable(false);

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

      const formattedValues = {
        ...values,
        jobTitle: values.jobTitle || values.title,
        startDate: dayjs.isDayjs(values.startDate)
          ? values.startDate.format("YYYY-MM-DD")
          : values.startDate
          ? dayjs(values.startDate).format("YYYY-MM-DD")
          : null,
        endDate: isCurrentJob
          ? "Present"
          : dayjs.isDayjs(values.endDate)
          ? values.endDate.format("YYYY-MM-DD")
          : values.endDate
          ? dayjs(values.endDate).format("YYYY-MM-DD")
          : null,
        id: editingWorkId || Math.random().toString(36).substr(2, 9),
      };

      delete formattedValues.duration;

      if (editingWorkId) {
        setUserData((prev) => ({
          ...prev,
          workExperience: prev.workExperience.map((work) =>
            work.id === editingWorkId ? formattedValues : work
          ),
        }));
      } else {
        setUserData((prev) => ({
          ...prev,
          workExperience: [...prev.workExperience, formattedValues],
        }));
      }

      setIsWorkModalVisible(false);
      setEditingWorkId(null);
      setIsCurrentJob(false);
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

    const isCurrent =
      work.endDate === "Present" ||
      (work.duration && work.duration.includes("present"));

    setIsCurrentJob(isCurrent);

    workForm.setFieldsValue({
      jobTitle: work.jobTitle || work.title,
      company: work.company,
      startDate: dayjs.isDayjs(work.startDate)
        ? work.startDate
        : work.startDate
        ? dayjs(work.startDate)
        : work.duration
        ? dayjs(work.duration.split("-")[0])
        : null,
      endDate: isCurrent
        ? null
        : work.endDate === "Present"
        ? null
        : dayjs.isDayjs(work.endDate)
        ? work.endDate
        : work.endDate
        ? dayjs(work.endDate)
        : work.duration && !work.duration.includes("present")
        ? dayjs(work.duration.split("-")[1])
        : null,
      description: work.description,
    });
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

  const ProfileCompletionAlert = () => {
    if (profileCompletion >= 100) return null;

    return (
      <Alert
        message={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <FireOutlined
                style={{ color: "#ff4d4f", marginRight: 8, fontSize: 16 }}
              />
              <span style={{ fontWeight: "bold" }}>
                Complete your profile to get recruiters' attention!
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Progress
                percent={profileCompletion}
                size="small"
                strokeColor={{
                  "0%": "#ff4d4f",
                  "50%": "#faad14",
                  "100%": "#52c41a",
                }}
                style={{ width: 100, marginRight: 8 }}
              />
              <Text strong style={{ color: "#da2c46" }}>
                {profileCompletion}%
              </Text>
            </div>
          </div>
        }
        description={
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              🎯 Profiles with 100% completion get{" "}
              <Text strong style={{ color: "#da2c46" }}>
                5x more views
              </Text>{" "}
              from recruiters!
            </Text>
            <div style={{ marginTop: 4 }}>
              <Text type="secondary">
                Missing: {profileCompletion < 50 ? "Basic info, " : ""}
                {!userData.nationality ? "Nationality, " : ""}
                {!userData.totalExperienceYears ? "Experience, " : ""}
                {!userData.passportNo ? "Passport details, " : ""}
                {!userData.emergencyContactNo ? "Emergency contact" : ""}
              </Text>
            </div>
          </div>
        }
        type="warning"
        showIcon
        style={{
          marginBottom: 24,
          background: "linear-gradient(135deg, #fff2e8 0%, #fff1f0 100%)",
          border: "1px solid #ffb8b8",
          borderRadius: 12,
        }}
        action={
          <Button
            size="small"
            type="primary"
            onClick={toggleProfileEdit}
            style={{ background: "#da2c46", border: "none" }}
            icon={<EditOutlined />}
          >
            Complete Now
          </Button>
        }
      />
    );
  };

  const ProfileContent = () => (
    <div style={{ padding: 24 }}>
      <ProfileCompletionAlert />

      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Space>
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

      <Tabs defaultActiveKey="basic" type="card">
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Profile Summary
            </span>
          }
          key="summary"
        >
          <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
            <Form form={profileForm} layout="vertical" initialValues={userData}>
              <Row gutter={24}>
                <Col
                  span={24}
                  style={{ textAlign: "center", marginBottom: 24 }}
                >
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
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

                <Col span={24}>
                  <Form.Item label="Profile Summary" name="profileSummary">
                    <TextArea
                      rows={6}
                      placeholder="Write a brief summary of your profile (max 500 characters)"
                      maxLength={500}
                      disabled={!isProfileEditable}
                      showCount
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="First Name"
                    name="firstName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter first name"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Middle Name" name="middleName">
                    <Input
                      placeholder="Enter middle name"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Last Name"
                    name="lastName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
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
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
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
                    label="Professional Title"
                    name="title"
                    rules={[
                      { required: true, message: "Please enter your title" },
                    ]}
                  >
                    <Input
                      placeholder="e.g. Full Stack Developer"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Total Experience (Years)"
                    name="totalExperienceYears"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your total experience",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select experience"
                      disabled={!isProfileEditable}
                    >
                      <Option value="0-1">0-1 Years</Option>
                      <Option value="1-2">1-2 Years</Option>
                      <Option value="2-3">2-3 Years</Option>
                      <Option value="3-5">3-5 Years</Option>
                      <Option value="5-7">5-7 Years</Option>
                      <Option value="7-10">7-10 Years</Option>
                      <Option value="10+">10+ Years</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Notice Period" name="noticePeriod">
                    <Select
                      placeholder="Select notice period"
                      disabled={!isProfileEditable}
                    >
                      <Option value="Immediate">Immediate</Option>
                      <Option value="15 days">15 days</Option>
                      <Option value="1 month">1 month</Option>
                      <Option value="2 months">2 months</Option>
                      <Option value="3 months">3 months</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Current Location"
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
                    label="Current Salary (Annual)"
                    name="currentSalary"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Enter current salary"
                      disabled={!isProfileEditable}
                      formatter={(value) =>
                        `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Expected Salary (Annual)"
                    name="expectedSalary"
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      placeholder="Enter expected salary"
                      disabled={!isProfileEditable}
                      formatter={(value) =>
                        `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Divider orientation="left">Social Media Links</Divider>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="LinkedIn"
                    name={["socialLinks", "linkedin"]}
                  >
                    <Input
                      prefix={<LinkedinOutlined />}
                      placeholder="LinkedIn profile URL"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="GitHub" name={["socialLinks", "github"]}>
                    <Input
                      prefix={<GithubOutlined />}
                      placeholder="GitHub profile URL"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Twitter" name={["socialLinks", "twitter"]}>
                    <Input
                      prefix={<TwitterOutlined />}
                      placeholder="Twitter profile URL"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Facebook"
                    name={["socialLinks", "facebook"]}
                  >
                    <Input
                      prefix={<FacebookOutlined />}
                      placeholder="Facebook profile URL"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Divider orientation="left">Resume</Divider>
                  <Form.Item>
                    <Upload
                      accept=".pdf,.doc,.docx"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                          message.error("Resume must be smaller than 5MB!");
                          return false;
                        }

                        const allowedTypes = [
                          "application/pdf",
                          "application/msword",
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        ];
                        if (!allowedTypes.includes(file.type)) {
                          message.error(
                            "Only PDF, DOC, and DOCX files are allowed!"
                          );
                          return false;
                        }

                        setUserData({
                          ...userData,
                          resumeFile: file,
                          resumeUrl: URL.createObjectURL(file), // for preview
                        });
                        return false; // prevent auto upload
                      }}
                      disabled={!isProfileEditable}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        disabled={!isProfileEditable}
                      >
                        Upload Resume
                      </Button>
                    </Upload>

                    {userData.resumeUrl && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">Current resume: </Text>
                        <Button
                          type="link"
                          href={userData.resumeUrl}
                          target="_blank"
                          icon={<EyeOutlined />}
                          size="small"
                        >
                          View
                        </Button>
                        <Button
                          type="link"
                          danger
                          icon={<DeleteOutlined />}
                          size="small"
                          onClick={() => {
                            setUserData({
                              ...userData,
                              resumeUrl: "",
                              resumeFile: null,
                            });
                          }}
                          disabled={!isProfileEditable}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Text type="secondary">
                    Last updated: {userData.lastUpdated || "Not available"}
                  </Text>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card
            title={
              <span>
                <StarOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                <span style={{ color: "#da2c46" }}>Skills</span>
              </span>
            }
            style={{ marginBottom: 24, borderRadius: "12px" }}
          >
            <Form.Item>
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add your skills"
                value={userData.skills}
                onChange={(value) =>
                  setUserData({ ...userData, skills: value })
                }
                disabled={!isProfileEditable}
              />
            </Form.Item>
          </Card>

          <Card
            title={
              <span>
                <StarOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                <span style={{ color: "#da2c46" }}>Languages Known</span>
              </span>
            }
            style={{ marginBottom: 24, borderRadius: "12px" }}
          >
            <Form.Item>
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add your languages"
                value={userData.languages}
                onChange={(value) =>
                  setUserData({ ...userData, languages: value })
                }
                disabled={!isProfileEditable}
              />
            </Form.Item>
          </Card>

          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <BookOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  <span style={{ color: "#da2c46" }}>Education</span>
                </span>
                {isProfileEditable && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={addEducation}
                    style={{ background: "#da2c46", border: "none" }}
                  >
                    Add Education
                  </Button>
                )}
              </div>
            }
            style={{ marginBottom: 24, borderRadius: "12px" }}
          >
            {userData.education.length === 0 ? (
              <div style={{ textAlign: "center", padding: 16 }}>
                <Text type="secondary">No education added yet</Text>
              </div>
            ) : (
              <List
                dataSource={userData.education}
                renderItem={(item) => (
                  <List.Item
                    actions={
                      isProfileEditable
                        ? [
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEditEducation(item)}
                            />,
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeEducation(item.id)}
                            />,
                          ]
                        : null
                    }
                  >
                    <List.Item.Meta
                      title={
                        <Text strong>
                          {item.degree} in {item.field}
                        </Text>
                      }
                      description={
                        <div>
                          <Text>{item.institution}</Text>
                          <br />
                          <Text type="secondary">{item.year}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card
            title={
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>
                  <TrophyOutlined
                    style={{ marginRight: 8, color: "#da2c46" }}
                  />
                  <span style={{ color: "#da2c46" }}>Work Experience</span>
                </span>
                {isProfileEditable && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={addWorkExperience}
                    style={{ background: "#da2c46", border: "none" }}
                  >
                    Add Experience
                  </Button>
                )}
              </div>
            }
            style={{ marginBottom: 24, borderRadius: "12px" }}
          >
            {userData.workExperience.length === 0 ? (
              <div style={{ textAlign: "center", padding: 16 }}>
                <Text type="secondary">No work experience added yet</Text>
              </div>
            ) : (
              <List
                dataSource={userData.workExperience}
                renderItem={(item) => (
                  <List.Item
                    actions={
                      isProfileEditable
                        ? [
                            <Button
                              type="text"
                              icon={<EditOutlined />}
                              onClick={() => handleEditWork(item)}
                            />,
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => removeWorkExperience(item.id)}
                            />,
                          ]
                        : null
                    }
                  >
                    <List.Item.Meta
                      title={<Text strong>{item.jobTitle || item.title}</Text>}
                      description={
                        <div>
                          <Text>{item.company}</Text>
                          <br />
                          <Text type="secondary">
                            {item.duration ||
                              (item.startDate
                                ? dayjs(item.startDate).format("MMM YYYY")
                                : "")}{" "}
                            {!item.duration && "- "}
                            {!item.duration &&
                              (item.endDate === "Present"
                                ? "Present"
                                : item.endDate
                                ? dayjs(item.endDate).format("MMM YYYY")
                                : "")}
                          </Text>
                          <br />
                          {item.description && (
                            <Paragraph ellipsis={{ rows: 2, expandable: true }}>
                              {item.description}
                            </Paragraph>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <IdcardOutlined />
              Personal Information
            </span>
          }
          key="personal"
        >
          <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
            <Form
              form={personalForm}
              layout="vertical"
              initialValues={userData}
            >
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Nationality"
                    name="nationality"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your nationality",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter nationality"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Country of Birth"
                    name="countryOfBirth"
                    rules={[
                      {
                        required: true,
                        message: "Please enter country of birth",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter country of birth"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Marital Status" name="maritalStatus">
                    <Select
                      placeholder="Select marital status"
                      disabled={!isProfileEditable}
                    >
                      {maritalStatusOptions.map((status) => (
                        <Option key={status} value={status}>
                          {status}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Gender" name="gender">
                    <Select
                      placeholder="Select gender"
                      disabled={!isProfileEditable}
                    >
                      {genderOptions.map((status) => (
                        <Option key={status} value={status}>
                          {status}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Blood Group" name="bloodGroup">
                    <Select
                      placeholder="Select blood group"
                      disabled={!isProfileEditable}
                    >
                      {bloodGroupOptions.map((group) => (
                        <Option key={group} value={group}>
                          {group}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Religion" name="religion">
                    <Select
                      placeholder="Select religion"
                      disabled={!isProfileEditable}
                    >
                      {religionOptions.map((religion) => (
                        <Option key={religion} value={religion}>
                          {religion}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Emergency Contact No"
                    name="emergencyContactNo"
                    rules={[
                      {
                        required: true,
                        message: "Please enter emergency contact",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Enter emergency contact"
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
                <FileTextOutlined
                  style={{ marginRight: 8, color: "#da2c46" }}
                />
                <span style={{ color: "#da2c46" }}>Passport Information</span>
              </span>
            }
            style={{ marginBottom: 24, borderRadius: "12px" }}
          >
            <Form form={personalForm} layout="vertical">
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Form.Item label="Passport Number" name="passportNo">
                    <Input
                      placeholder="Enter passport number"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Place of Issue" name="passportPlaceOfIssue">
                    <Input
                      placeholder="Enter place of issue"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Iqama Number" name="iqamaNo">
                    <Input
                      placeholder="Enter Iqama number"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Issue Date" name="passportIssueDate">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={
                        dayjs.isDayjs(userData.passportIssueDate)
                          ? userData.passportIssueDate
                          : userData.passportIssueDate
                          ? dayjs(userData.passportIssueDate)
                          : null
                      }
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Expiry Date" name="passportExpiryDate">
                    <DatePicker
                      style={{ width: "100%" }}
                      value={
                        dayjs.isDayjs(userData.passportExpiryDate)
                          ? userData.passportExpiryDate
                          : userData.passportExpiryDate
                          ? dayjs(userData.passportExpiryDate)
                          : null
                      }
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <HomeOutlined />
              Address Information
            </span>
          }
          key="address"
        >
          <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
            <Form form={addressForm} layout="vertical" initialValues={userData}>
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Country"
                    name="country"
                    rules={[
                      { required: true, message: "Please enter country" },
                    ]}
                  >
                    <Input
                      placeholder="Enter country"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="State/Province"
                    name="state"
                    rules={[{ required: true, message: "Please enter state" }]}
                  >
                    <Input
                      placeholder="Enter state/province"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="City"
                    name="city"
                    rules={[{ required: true, message: "Please enter city" }]}
                  >
                    <Input
                      placeholder="Enter city"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Street Name" name="streetName">
                    <Input
                      placeholder="Enter street name"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Zip/Postal Code" name="zipCode">
                    <Input
                      placeholder="Enter zip/postal code"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Full Address" name="region">
                    <TextArea
                      rows={3}
                      placeholder="Enter full address"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <ContactsOutlined />
              Contact Information
            </span>
          }
          key="contact"
        >
          <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
            <Form form={contactForm} layout="vertical" initialValues={userData}>
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Emergency Contact Person Name"
                    name="contactPersonName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter contact person name",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Enter name"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Emergency Contact Mobile"
                    name="contactPersonMobile"
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Enter mobile number"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Emergency Contact Home No"
                    name="contactPersonHomeNo"
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Enter home number"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Nominee Name" name="nomineeName">
                    <Input
                      placeholder="Enter nominee name"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nominee Relationship"
                    name="nomineeRelationship"
                  >
                    <Input
                      placeholder="Enter relationship"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );

  return (
    <div className="container">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center" }}>
                <SettingOutlined style={{ marginRight: 12, fontSize: 20 }} />
                <Title level={4} style={{ margin: 0 }}>
                  Candidate Settings
                </Title>
              </div>
            }
            bordered={false}
            style={{ borderRadius: "12px" }}
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              tabPosition="left"
              style={{ minHeight: "80vh" }}
            >
              <TabPane
                tab={
                  <span>
                    <UserOutlined />
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
                    <BellOutlined />
                    Job Preferences
                  </span>
                }
                key="preferences"
              >
                <Card
                  title="Job Preferences"
                  style={{ marginBottom: 24, borderRadius: "12px" }}
                >
                  <Form
                    form={preferencesForm}
                    layout="vertical"
                    initialValues={{
                      roles: userData.jobPreferences?.roles || [],
                      locations: userData.jobPreferences?.locations || [],
                      salaryRange: userData.jobPreferences?.salaryRange || "",
                      workType: userData.jobPreferences?.workType || "",
                      employmentType:
                        userData.jobPreferences?.employmentType || "",
                    }}
                  >
                    <Form.Item
                      name="roles"
                      label="Roles Interested In"
                      rules={[
                        {
                          required: true,
                          message: "Please add at least one role",
                        },
                      ]}
                    >
                      <Select
                        mode="tags"
                        placeholder="Add roles you're interested in"
                        disabled={!isProfileEditable}
                        onChange={(value) =>
                          setUserData((prev) => ({
                            ...prev,
                            jobPreferences: {
                              ...prev.jobPreferences,
                              roles: value,
                            },
                          }))
                        }
                      />
                    </Form.Item>

                    <Form.Item name="locations" label="Preferred Locations">
                      <Select
                        mode="tags"
                        placeholder="Add preferred locations"
                        disabled={!isProfileEditable}
                        onChange={(value) =>
                          setUserData((prev) => ({
                            ...prev,
                            jobPreferences: {
                              ...prev.jobPreferences,
                              locations: value,
                            },
                          }))
                        }
                      />
                    </Form.Item>

                    <Form.Item name="salaryRange" label="Expected Salary Range">
                      <Select
                        placeholder="Select salary range"
                        disabled={!isProfileEditable}
                      >
                        <Option value="0-5 LPA">0-5 LPA</Option>
                        <Option value="5-10 LPA">5-10 LPA</Option>
                        <Option value="10-15 LPA">10-15 LPA</Option>
                        <Option value="15-20 LPA">15-20 LPA</Option>
                        <Option value="20+ LPA">20+ LPA</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="workType" label="Work Type Preference">
                      <Radio.Group disabled={!isProfileEditable}>
                        <Radio value="remote">Remote</Radio>
                        <Radio value="hybrid">Hybrid</Radio>
                        <Radio value="onsite">Onsite</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item name="employmentType" label="Employment Type">
                      <Radio.Group disabled={!isProfileEditable}>
                        <Radio value="full-time">Full-time</Radio>
                        <Radio value="part-time">Part-time</Radio>
                        <Radio value="contract">Contract</Radio>
                      </Radio.Group>
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        loading={loading}
                        onClick={handlePreferencesUpdate}
                        style={{ background: "#da2c46", border: "none" }}
                      >
                        Save Preferences
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <LockOutlined />
                    Security
                  </span>
                }
                key="security"
              >
                <Card
                  title="Change Password"
                  style={{ marginBottom: 24, borderRadius: "12px" }}
                >
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your current password",
                        },
                      ]}
                    >
                      <Input.Password placeholder="Enter current password" />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        {
                          required: true,
                          message: "Please enter your new password",
                        },
                        {
                          min: 8,
                          message: "Password must be at least 8 characters",
                        },
                      ]}
                    >
                      <Input.Password placeholder="Enter new password" />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Confirm New Password"
                      dependencies={["newPassword"]}
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your new password",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("newPassword") === value
                            ) {
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

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        style={{ background: "#da2c46", border: "none" }}
                      >
                        Change Password
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>

      {/* Education Modal */}
      <Modal
        title={`${editingEducationId ? "Edit" : "Add"} Education`}
        visible={isEduModalVisible}
        onOk={handleEducationSubmit}
        onCancel={() => setIsEduModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={educationForm} layout="vertical">
          <Form.Item
            name="degree"
            label="Degree"
            rules={[{ required: true, message: "Please select degree" }]}
          >
            <Select placeholder="Select degree">
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
            rules={[{ required: true, message: "Please enter institution" }]}
          >
            <Input placeholder="e.g. Harvard University" />
          </Form.Item>

          <Form.Item
            name="year"
            label="Year of Completion"
            rules={[{ required: true, message: "Please enter year" }]}
          >
            <Input placeholder="e.g. 2015" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Work Experience Modal */}
      <Modal
        title={`${editingWorkId ? "Edit" : "Add"} Work Experience`}
        visible={isWorkModalVisible}
        onOk={handleWorkSubmit}
        onCancel={() => setIsWorkModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
        width={700}
      >
        <Form form={workForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="jobTitle"
                label="Job Title"
                rules={[{ required: true, message: "Please enter job title" }]}
              >
                <Input placeholder="e.g. Software Engineer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company"
                label="Company"
                rules={[{ required: true, message: "Please enter company" }]}
              >
                <Input placeholder="e.g. Google" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Start Date"
                rules={[
                  { required: true, message: "Please select start date" },
                ]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="End Date">
                <DatePicker style={{ width: "100%" }} disabled={isCurrentJob} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Checkbox
              checked={isCurrentJob}
              onChange={(e) => {
                setIsCurrentJob(e.target.checked);
                if (e.target.checked) {
                  workForm.setFieldsValue({ endDate: null });
                }
              }}
            >
              I currently work here
            </Checkbox>
          </Form.Item>

          <Form.Item
            name="workMode"
            label="Work Mode"
            rules={[{ required: true, message: "Please select work mode" }]}
          >
            <Radio.Group>
              <Radio value="WFH">Work From Home</Radio>
              <Radio value="WFO">Work From Office</Radio>
              <Radio value="Hybrid">Hybrid</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="description" label="Job Description">
            <TextArea
              rows={4}
              placeholder="Describe your responsibilities and achievements"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CandidateSettings;
