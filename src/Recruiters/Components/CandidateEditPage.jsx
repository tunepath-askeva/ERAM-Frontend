// CandidateEditPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Space,
  Avatar,
  Upload,
  DatePicker,
  InputNumber,
  Radio,
  Checkbox,
  Divider,
  message,
  Spin,
  Tabs,
  List,
  Tag,
  Badge,
  Alert,
  Progress,
  Modal,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  DeleteOutlined,
  UploadOutlined,
  SaveOutlined,
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
  BookOutlined,
  TrophyOutlined,
  StarOutlined,
  IdcardOutlined,
  HomeOutlined,
  ContactsOutlined,
  LockOutlined,
  FileTextOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import {
  useUpdateBranchedCandidateMutation,
  useGetAllcandidatebyIdQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import PhoneInput from "../../Global/PhoneInput";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

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

const defaultIndustryOptions = [
  "Information Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Construction",
  "Hospitality",
  "Transportation",
  "Media & Entertainment",
  "Telecommunications",
  "Energy",
  "Agriculture",
  "Government",
  "Non-profit",
  "Other",
].map((item) => ({ value: item, label: item }));

const defaultVisaStatusOptions = [
  "Citizen",
  "Permanent Resident",
  "Work Visa",
  "Student Visa",
  "Tourist Visa",
  "H-1B Visa",
  "L-1 Visa",
  "F-1 Visa",
  "J-1 Visa",
  "O-1 Visa",
  "TN Visa",
  "E-3 Visa",
  "Green Card",
  "Asylum/Refugee",
  "No Visa/Illegal",
  "Other",
].map((item) => ({ value: item, label: item }));

const CandidateEditPage = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [isEduModalVisible, setIsEduModalVisible] = useState(false);
  const [isWorkModalVisible, setIsWorkModalVisible] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editingEducationData, setEditingEducationData] = useState({});
  const [editingWorkData, setEditingWorkData] = useState({});
  const [skills, setSkills] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [industry, setIndustry] = useState([]);
  const [visaStatus, setVisaStatus] = useState([]);
  const [education, setEducation] = useState([]);
  const [workExperience, setWorkExperience] = useState([]);
  const [candidateTypeInput, setCandidateTypeInput] = useState("");

  const [profileForm] = Form.useForm();
  const [personalForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [educationForm] = Form.useForm();
  const [workForm] = Form.useForm();

  // const candidate = state?.candidate || {};
  const {
    data: candidateData,
    isLoading,
    error,
    refetch,
  } = useGetAllcandidatebyIdQuery(id);
  const [updateCandidate] = useUpdateBranchedCandidateMutation();

  const candidate = candidateData?.candidateDetails || {};
  useEffect(() => {
    if (candidate) {
      const parsePhoneNumbers = (data) => {
        const result = { ...data };

        // Parse main phone
        const mainPhone = phoneUtils.parsePhoneNumber(data.phone);
        if (mainPhone.countryCode) {
          result.phoneCountryCode = mainPhone.countryCode;
          result.phone = mainPhone.phoneNumber;
        }

        // Parse contact person mobile (this was the missing piece)
        const contactMobile = phoneUtils.parsePhoneNumber(
          data.contactPersonMobile
        );
        if (contactMobile.countryCode) {
          result.contactPersonMobileCountryCode = contactMobile.countryCode;
          result.contactPersonMobile = contactMobile.phoneNumber;
        }

        // Parse contact person home number
        const contactHome = phoneUtils.parsePhoneNumber(
          data.contactPersonHomeNo
        );
        if (contactHome.countryCode) {
          result.contactPersonHomeNoCountryCode = contactHome.countryCode;
          result.contactPersonHomeNo = contactHome.phoneNumber;
        }

        // Parse emergency contact number (if this field exists)
        const emergencyPhone = phoneUtils.parsePhoneNumber(
          data.emergencyContactNo
        );
        if (emergencyPhone.countryCode) {
          result.emergencyContactNoCountryCode = emergencyPhone.countryCode;
          result.emergencyContactNo = emergencyPhone.phoneNumber;
        }

        return result;
      };

      const formData = parsePhoneNumbers({
        firstName: candidate.firstName || "",
        lastName: candidate.lastName || "",
        middleName: candidate.middleName || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        title: candidate.title || "",
        location: candidate.location || "",
        totalExperienceYears: candidate.totalExperienceYears || "",
        noticePeriod: candidate.noticePeriod || "",
        skills: candidate.skills || [],
        languages: candidate.languages || [],
        education: candidate.education || [],
        workExperience: candidate.workExperience || [],
        nationality: candidate.nationality || "",
        countryOfBirth: candidate.countryOfBirth || "",
        maritalStatus: candidate.maritalStatus || "",
        gender: candidate.gender || "",
        age: candidate.age || "",
        industry: candidate.industry || [],
        visaStatus: candidate.visaStatus || [],
        bloodGroup: candidate.bloodGroup || "",
        religion: candidate.religion || "",
        emergencyContactNo: candidate.emergencyContactNo || "",
        passportNo: candidate.passportNo || "",
        passportPlaceOfIssue: candidate.passportPlaceOfIssue || "",
        passportIssueDate: candidate.passportIssueDate
          ? dayjs(candidate.passportIssueDate)
          : null,
        passportExpiryDate: candidate.passportExpiryDate
          ? dayjs(candidate.passportExpiryDate)
          : null,
        iqamaNo: candidate.iqamaNo || "",
        region: candidate.region || "",
        streetNo: candidate.streetNo || "",
        streetName: candidate.streetName || "",
        block: candidate.block || "",
        building: candidate.building || "",
        zipCode: candidate.zipCode || "",
        city: candidate.city || "",
        state: candidate.state || "",
        country: candidate.country || "",
        contactPersonName: candidate.contactPersonName || "",
        contactPersonMobile: candidate.contactPersonMobile || "",
        contactPersonHomeNo: candidate.contactPersonHomeNo || "",
        nomineeName: candidate.nomineeName || "",
        nomineeRelationship: candidate.nomineeRelationship || "",
        profileSummary: candidate.profileSummary || "",
        currentSalary: candidate.currentSalary || "",
        expectedSalary: candidate.expectedSalary || "",
        resumeUrl: candidate.resumeUrl || "",
        socialLinks: candidate.socialLinks || {
          linkedin: "",
          github: "",
          twitter: "",
          facebook: "",
        },
        accountStatus: candidate.accountStatus || "active",
        candidateType: candidate.candidateType || "External",
        agency: candidate.agency ,
        workorderhint: candidate.workorderhint,
        clientCode: candidate.clientCode,
      });

      if (candidate.industry) {
        setIndustry(candidate.industry);
      }
      if (candidate.visaStatus) {
        setVisaStatus(candidate.visaStatus);
      }

      // Set form values
      profileForm.setFieldsValue(formData);
      personalForm.setFieldsValue(formData);
      addressForm.setFieldsValue(formData);
      contactForm.setFieldsValue(formData);
    }
  }, [candidate, profileForm, personalForm, addressForm, contactForm]);

  useEffect(() => {
    if (candidate.skills) {
      setSkills(candidate.skills);
    }
    if (candidate.languages) {
      setLanguages(candidate.languages);
    }
    if (candidate?.education) {
      setEducation(candidate.education);
    }
    if (candidate?.workExperience) {
      setWorkExperience(candidate.workExperience);
    }
  }, [candidate]);

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const profileValues = await profileForm.validateFields();
      const personalValues = await personalForm.validateFields();
      const addressValues = await addressForm.validateFields();
      const contactValues = await contactForm.validateFields();

      const combinePhoneNumbers = (values) => {
        const result = { ...values };
        Object.keys(values).forEach((key) => {
          if (key.endsWith("CountryCode") && values[key]) {
            const fieldName = key.replace("CountryCode", "");
            if (values[fieldName]) {
              result[fieldName] = `+${values[key]}${values[fieldName]}`;
            }
            delete result[key];
          }
        });
        return result;
      };

      const allValues = {
        ...combinePhoneNumbers(profileValues),
        ...combinePhoneNumbers(personalValues),
        ...combinePhoneNumbers(addressValues),
        ...combinePhoneNumbers(contactValues),
        skills,
        languages,
        education,
        workExperience,
        industry,
        visaStatus,
        socialLinks: profileValues.socialLinks || candidate.socialLinks || {},
      };

      // format dates
      if (allValues.passportIssueDate) {
        allValues.passportIssueDate = dayjs(allValues.passportIssueDate).format(
          "YYYY-MM-DD"
        );
      }
      if (allValues.passportExpiryDate) {
        allValues.passportExpiryDate = dayjs(
          allValues.passportExpiryDate
        ).format("YYYY-MM-DD");
      }

      const formData = new FormData();
      Object.entries(allValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item, i) => {
              if (typeof item === "object") {
                Object.entries(item).forEach(([subKey, subVal]) => {
                  formData.append(`${key}[${i}][${subKey}]`, subVal);
                });
              } else {
                formData.append(`${key}[${i}]`, item);
              }
            });
          } else if (typeof value === "object") {
            Object.entries(value).forEach(([subKey, subVal]) => {
              formData.append(`${key}[${subKey}]`, subVal);
            });
          } else {
            formData.append(key, value);
          }
        }
      });

      if (imageFile) {
        formData.append("image", imageFile);
      }

      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      await updateCandidate({ id, formData }).unwrap();

      enqueueSnackbar("Candidate updated successfully!", {
        variant: "success",
      });
      navigate(-1);
    } catch (error) {
      console.error("Update error:", error);
      enqueueSnackbar(error?.data?.message || "Failed to update candidate", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj;
      setImageFile(file);
    } else {
      setImageFile(null);
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
        id: editingEducationId || Math.random().toString(36).substr(2, 9),
      };

      setEducation((prev) =>
        editingEducationId
          ? prev.map((edu) =>
              edu.id === editingEducationId ? newEducation : edu
            )
          : [...prev, newEducation]
      );

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
        id: editingWorkId || Math.random().toString(36).substr(2, 9),
        isCurrent: isCurrentJob,
      };

      setWorkExperience((prev) =>
        editingWorkId
          ? prev.map((w) => (w.id === editingWorkId ? newWork : w))
          : [...prev, newWork]
      );

      setIsWorkModalVisible(false);
      setEditingWorkId(null);
      setIsCurrentJob(false);
      workForm.resetFields();
    } catch (err) {
      console.log("Validation error:", err);
    }
  };

  const handleEditWork = (work) => {
    setEditingWorkId(work.id);
    setEditingWorkData(work);
    const isCurrent = work.endDate === "Present";
    setIsCurrentJob(isCurrent);

    workForm.setFieldsValue({
      jobTitle: work.jobTitle || work.title,
      company: work.company,
      startDate: work.startDate ? dayjs(work.startDate) : null,
      endDate: isCurrent
        ? null
        : work.endDate !== "Present"
        ? dayjs(work.endDate)
        : null,
      description: work.description,
    });
    setIsWorkModalVisible(true);
  };

  const removeEducation = (id) => {
    setEducation((prev) => prev.filter((edu) => edu.id !== id));
  };

  const removeWork = (id) => {
    setWorkExperience((prev) => prev.filter((w) => w.id !== id));
  };

  const removeWorkExperience = (id) => {
    candidate.workExperience = candidate.workExperience.filter(
      (work) => work.id !== id
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <EditOutlined style={{ marginRight: 12, fontSize: 20 }} />
            <Title level={3} style={{ margin: 0 }}>
              Edit Candidate: {candidate.fullName}
            </Title>
          </div>
        }
        extra={
          <Space>
            <Button onClick={() => navigate(-1)}>Cancel</Button>
            <Button
              type="primary"
              loading={loading}
              onClick={handleSubmit}
              icon={<SaveOutlined />}
              style={{ background: "#da2c46", border: "none" }}
            >
              Save Changes
            </Button>
          </Space>
        }
        style={{ borderRadius: "12px" }}
      >
        <Tabs defaultActiveKey="profile" type="card">
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Profile Summary
              </span>
            }
            key="profile"
          >
            <Form form={profileForm} layout="vertical">
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
                      src={candidate.image}
                      icon={<UserOutlined />}
                      style={{ border: "4px solid #da2c46" }}
                    />
                    <div style={{ marginTop: 16 }}>
                      <Text type="secondary">Profile Image (View Only)</Text>
                    </div>
                  </div>
                </Col>

                <Col span={24}>
                  <Form.Item label="Profile Summary" name="profileSummary">
                    <TextArea
                      rows={6}
                      placeholder="Write a brief summary of the candidate's profile (max 500 characters)"
                      maxLength={500}
                      showCount
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="First Name" name="firstName">
                    <Input placeholder="Enter first name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Middle Name" name="middleName">
                    <Input placeholder="Enter middle name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Last Name" name="lastName">
                    <Input placeholder="Enter last name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      placeholder="Enter email"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <PhoneInput
                    form={profileForm}
                    name="phone"
                    label="Phone"
                    required={true}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Professional Title" name="title">
                    <Input placeholder="e.g. Full Stack Developer" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Total Experience (Years)"
                    name="totalExperienceYears"
                  >
                    <Select placeholder="Select experience">
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
                    <Select placeholder="Select notice period">
                      <Option value="Immediate">Immediate</Option>
                      <Option value="15 days">15 days</Option>
                      <Option value="1 month">1 month</Option>
                      <Option value="2 months">2 months</Option>
                      <Option value="3 months">3 months</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Current Location" name="location">
                    <Input
                      prefix={<EnvironmentOutlined />}
                      placeholder="Enter location"
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
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
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
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/₹\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Form.Item label="Agency" name="agency">
                    <Input
                      style={{ width: "100%" }}
                      placeholder="Enter agency name"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Form.Item label="Search Hint" name="workorderhint">
                    <Input
                      style={{ width: "100%" }}
                      placeholder="Enter Work order hint."
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Form.Item label="Client" name="clientCode">
                    <Input
                      style={{ width: "100%" }}
                      placeholder="Enter client name"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Password" name="password">
                    <Input.Password
                      style={{ width: "100%" }}
                      placeholder="Enter the password"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match!")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      style={{ width: "100%" }}
                      placeholder="Re-enter the password"
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
                    <Input placeholder="LinkedIn profile URL" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="GitHub" name={["socialLinks", "github"]}>
                    <Input placeholder="GitHub profile URL" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Twitter" name={["socialLinks", "twitter"]}>
                    <Input placeholder="Twitter profile URL" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Facebook"
                    name={["socialLinks", "facebook"]}
                  >
                    <Input placeholder="Facebook profile URL" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Divider orientation="left">Account Status</Divider>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Account Status" name="accountStatus">
                    <Select>
                      <Option value="active">Active</Option>
                      <Option value="inactive">Inactive</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Candidate Type" name="candidateType">
                    <Select
                      showSearch
                      allowClear
                      placeholder="Select or type candidate type"
                      defaultActiveFirstOption={false}
                      filterOption={(input, option) =>
                        (option?.children ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      onSearch={(val) => setCandidateTypeInput(val)}
                      onChange={(value) => {
                        profileForm.setFieldsValue({ candidateType: value });
                      }}
                      onBlur={() => {
                        const currentValue =
                          profileForm.getFieldValue("candidateType");
                        if (!currentValue && candidateTypeInput) {
                          profileForm.setFieldsValue({
                            candidateType: candidateTypeInput,
                          });
                        }
                      }}
                      onInputKeyDown={(e) => {
                        if (e.key === "Enter" && candidateTypeInput) {
                          profileForm.setFieldsValue({
                            candidateType: candidateTypeInput,
                          });
                        }
                      }}
                    >
                      {[
                        "General",
                        "Supplier",
                        "Own",
                        "SponserTransfer",
                        "Khafalath",
                        "External",
                        "Others",
                      ].map((type) => (
                        <Select.Option key={type} value={type}>
                          {type}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Form>

            <Card
              title={
                <span>
                  <StarOutlined style={{ marginRight: 8, color: "#da2c46" }} />
                  <span style={{ color: "#da2c46" }}>Skills</span>
                </span>
              }
              style={{ marginBottom: 24, borderRadius: "12px" }}
            >
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add skills"
                value={skills}
                onChange={(value) => setSkills(value)}
              />

              <div style={{ marginTop: 16 }}>
                {skills.length === 0 ? (
                  <Text type="secondary">No skills added yet</Text>
                ) : (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {skills.map((skill, idx) => (
                      <Tag
                        key={idx}
                        color="blue"
                        closable
                        onClose={() => {
                          setSkills(skills.filter((s) => s !== skill));
                        }}
                        style={{
                          padding: "4px 10px",
                          fontSize: "14px",
                          borderRadius: "16px",
                        }}
                      >
                        {skill}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
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
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Add languages"
                value={languages}
                onChange={(value) => setLanguages(value)}
              />

              <div style={{ marginTop: 16 }}>
                {languages.length === 0 ? (
                  <Text type="secondary">No languages added yet</Text>
                ) : (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}
                  >
                    {languages.map((lang, idx) => (
                      <Tag
                        key={idx}
                        color="blue"
                        closable
                        onClose={() =>
                          setLanguages(languages.filter((l) => l !== lang))
                        }
                        style={{
                          padding: "4px 10px",
                          fontSize: "14px",
                          borderRadius: "16px",
                        }}
                      >
                        {lang}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card
              title={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    <BookOutlined
                      style={{ marginRight: 8, color: "#da2c46" }}
                    />
                    <span style={{ color: "#da2c46" }}>Education</span>
                  </span>
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={addEducation}
                    style={{ background: "#da2c46", border: "none" }}
                  >
                    Add Education
                  </Button>
                </div>
              }
              style={{ marginBottom: 24, borderRadius: "12px" }}
            >
              {education.length === 0 ? ( // ✅ use local state here
                <div style={{ textAlign: "center", padding: 16 }}>
                  <Text type="secondary">No education added yet</Text>
                </div>
              ) : (
                <List
                  dataSource={education}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
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
                      ]}
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
              title="Work Experience"
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={addWorkExperience}
                  style={{ background: "#da2c46", border: "none" }}
                >
                  Add Work Experience
                </Button>
              }
              style={{ marginBottom: 24, borderRadius: "12px" }}
            >
              {workExperience.length === 0 ? (
                <div style={{ textAlign: "center", padding: 16 }}>
                  <Text type="secondary">No work experience added yet</Text>
                </div>
              ) : (
                <List
                  dataSource={workExperience}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => handleEditWork(item)}
                        />,
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeWork(item.id)}
                        />,
                      ]}
                    >
                      <List.Item.Meta
                        title={<Text strong>{item.jobTitle}</Text>}
                        description={
                          <div>
                            <Text>{item.company}</Text>
                            <br />
                            <Text type="secondary">
                              {item.startDate
                                ? new Date(item.startDate).toLocaleDateString()
                                : ""}{" "}
                              -{" "}
                              {item.isCurrent
                                ? "Present"
                                : item.endDate
                                ? new Date(item.endDate).toLocaleDateString()
                                : ""}
                            </Text>
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
            <Form form={personalForm} layout="vertical">
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Form.Item label="Nationality" name="nationality">
                    <Input placeholder="Enter nationality" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Country of Birth" name="countryOfBirth">
                    <Input placeholder="Enter country of birth" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Marital Status" name="maritalStatus">
                    <Select placeholder="Select marital status">
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
                    <Select placeholder="Select gender">
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
                    <Select placeholder="Select blood group">
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
                    <Select placeholder="Select religion">
                      {religionOptions.map((religion) => (
                        <Option key={religion} value={religion}>
                          {religion}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="Age" name="age">
                    <InputNumber
                      style={{ width: "100%" }}
                      min={18}
                      max={100}
                      placeholder="Enter age"
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Industry" name="industry">
                    <Select
                      mode="tags"
                      style={{ width: "100%" }}
                      placeholder="Add industries (type to add custom values)"
                      value={industry}
                      onChange={(value) => setIndustry(value)}
                      options={defaultIndustryOptions}
                      tokenSeparators={[","]}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Visa Status" name="visaStatus">
                    <Select
                      mode="tags"
                      style={{ width: "100%" }}
                      placeholder="Add visa statuses (type to add custom values)"
                      value={candidate.visaStatus}
                      onChange={(value) => setVisaStatus(value)}
                      options={defaultVisaStatusOptions}
                      tokenSeparators={[","]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>

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
                      <Input placeholder="Enter passport number" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item
                      label="Place of Issue"
                      name="passportPlaceOfIssue"
                    >
                      <Input placeholder="Enter place of issue" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={8}>
                    <Form.Item label="Iqama Number" name="iqamaNo">
                      <Input placeholder="Enter Iqama number" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item label="Issue Date" name="passportIssueDate">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item label="Expiry Date" name="passportExpiryDate">
                      <DatePicker style={{ width: "100%" }} />
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
            <Form form={addressForm} layout="vertical">
              <Row gutter={24}>
                <Col xs={24} sm={8}>
                  <Form.Item label="Country" name="country">
                    <Input placeholder="Enter country" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="State/Province" name="state">
                    <Input placeholder="Enter state/province" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item label="City" name="city">
                    <Input placeholder="Enter city" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Street Name" name="streetName">
                    <Input placeholder="Enter street name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item label="Zip/Postal Code" name="zipCode">
                    <Input placeholder="Enter zip/postal code" />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item label="Full Address" name="region">
                    <TextArea rows={3} placeholder="Enter full address" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
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
            <Form form={contactForm} layout="vertical">
              <Row gutter={24}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Emergency Contact Person Name"
                    name="contactPersonName"
                  >
                    <Input placeholder="Enter name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <PhoneInput
                    form={contactForm}
                    name="contactPersonMobile"
                    label="Emergency Contact Mobile"
                    required={true}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <PhoneInput
                    form={contactForm}
                    name="contactPersonHomeNo"
                    label="Emergency Contact Home No"
                    required={false}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="Nominee Name" name="nomineeName">
                    <Input placeholder="Enter nominee name" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nominee Relationship"
                    name="nomineeRelationship"
                  >
                    <Input placeholder="Enter relationship" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={`${editingEducationId ? "Edit" : "Add"} Education`}
        visible={isEduModalVisible}
        onOk={handleEducationSubmit}
        onCancel={() => setIsEduModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={educationForm} layout="vertical">
          <Form.Item name="degree" label="Degree">
            <Select placeholder="Select degree">
              {degreeOptions.map((degree) => (
                <Option key={degree} value={degree}>
                  {degree}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="field" label="Field of Study">
            <Input placeholder="e.g. Computer Science" />
          </Form.Item>

          <Form.Item name="institution" label="Institution">
            <Input placeholder="e.g. Harvard University" />
          </Form.Item>

          <Form.Item name="year" label="Year of Completion">
            <Input placeholder="e.g. 2015" />
          </Form.Item>
        </Form>
      </Modal>
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
              <Form.Item name="jobTitle" label="Job Title">
                <Input placeholder="e.g. Software Engineer" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="company" label="Company">
                <Input placeholder="e.g. Google" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Start Date">
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

export default CandidateEditPage;
