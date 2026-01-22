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
  useChangePasswordMutation,
  useAddCertificateMutation,
  useDeleteCertificateMutation,
} from "../Slices/Users/UserApis";
import { useDispatch } from "react-redux";
import { setUserCredentials } from "../Slices/Users/UserSlice";
import dayjs from "dayjs";
import PhoneInput from "../Global/PhoneInput";
import SkeletonLoader from "../Global/SkeletonLoader";
import { phoneUtils } from "../utils/countryMobileLimits";
import "./CandidateSettings.css";

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

const CandidateSettings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    fullName: "",
    email: "",
    phone: "",
    agency: "",
    workorderhint: "",
    clientCode: "",
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
    certificates: [],
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
    updatedAt: "",
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
    age: "",
    dob: null,
    industry: [],
    visaStatus: [],
  });

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [innerActiveTab, setInnerActiveTab] = useState("summary");
  const [isProfileEditable, setIsProfileEditable] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [isEduModalVisible, setIsEduModalVisible] = useState(false);
  const [isWorkModalVisible, setIsWorkModalVisible] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [isCertModalVisible, setIsCertModalVisible] = useState(false);
  const [editingCertId, setEditingCertId] = useState(null);
  const [editingCertData, setEditingCertData] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [editingEducationData, setEditingEducationData] = useState({
    title: "",
    degree: "",
    field: "",
    institution: "",
    year: "",
  });
  const [editingWorkId, setEditingWorkId] = useState(null);
  const [editingWorkData, setEditingWorkData] = useState({});

  const { data: getCandidate, isLoading } = useGetCandidateQuery();
  const [profileComplete] = useProfileCompletionMutation();
  const [changePassword] = useChangePasswordMutation();
  const [addCertificate] = useAddCertificateMutation();
  const [deleteCertificate] = useDeleteCertificateMutation();

  const [profileForm] = Form.useForm();
  const [personalForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [preferencesForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [educationForm] = Form.useForm();
  const [workForm] = Form.useForm();
  const [certForm] = Form.useForm();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Helper function to extract phone number and country code
  const extractPhoneData = (phoneStr, storedCountryCode) => {
    if (!phoneStr) return { phone: "", countryCode: storedCountryCode || "91" };
    
    // If we have a stored country code, use it
    if (storedCountryCode) {
      let phoneWithoutPlus = phoneStr.trim();
      while (phoneWithoutPlus.startsWith("+")) {
        phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
      }
      const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
      
      // If phone starts with country code, remove it
      if (cleanPhone.startsWith(storedCountryCode)) {
        return {
          phone: cleanPhone.slice(storedCountryCode.length),
          countryCode: storedCountryCode,
        };
      } else {
        return {
          phone: cleanPhone,
          countryCode: storedCountryCode,
        };
      }
    }
    
    // Fallback: extract country code if not stored
    let phoneWithoutPlus = phoneStr.trim();
    while (phoneWithoutPlus.startsWith("+")) {
      phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
    }
    
    const parsed = phoneUtils.parsePhoneNumber(phoneWithoutPlus);
    if (parsed.countryCode && parsed.phoneNumber) {
      return {
        phone: parsed.phoneNumber,
        countryCode: parsed.countryCode,
      };
    } else if (phoneWithoutPlus) {
      return {
        phone: phoneWithoutPlus.replace(/\D/g, ""),
        countryCode: "91", // Default to 91
      };
    }
    
    return { phone: "", countryCode: "91" };
  };

  useEffect(() => {
    if (getCandidate && getCandidate.user) {
      const candidateData = getCandidate.user;

      // Extract phone data for all phone fields
      const phoneData = extractPhoneData(candidateData.phone, candidateData.phoneCountryCode);
      const contactMobileData = extractPhoneData(candidateData.contactPersonMobile, candidateData.contactPersonMobileCountryCode);
      const contactHomeData = extractPhoneData(candidateData.contactPersonHomeNo, candidateData.contactPersonHomeNoCountryCode);
      const emergencyData = extractPhoneData(candidateData.emergencyContactNo, candidateData.emergencyContactNoCountryCode);

      const mappedData = {
        firstName: candidateData.firstName || "",
        lastName: candidateData.lastName || "",
        middleName: candidateData.middleName || "",
        fullName: candidateData.fullName || "",
        email: candidateData.email || "",
        phone: phoneData.phone,
        phoneCountryCode: phoneData.countryCode,
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
        certificates: Array.isArray(candidateData.certificates)
          ? candidateData.certificates.map((cert) => ({
              ...cert,
              id: cert.id || Math.random().toString(36).substr(2, 9),
            }))
          : [],
        nationality: candidateData.nationality || "",
        countryOfBirth: candidateData.countryOfBirth || "",
        maritalStatus: candidateData.maritalStatus || "",
        gender: candidateData.gender || "Others",
        age: candidateData.age || "",
        dob: candidateData.dob
          ? dayjs.isDayjs(candidateData.dob)
            ? candidateData.dob
            : dayjs(candidateData.dob)
          : null,
        industry: Array.isArray(candidateData.industry)
          ? candidateData.industry
          : candidateData.industry
          ? [candidateData.industry]
          : [],
        visaStatus: Array.isArray(candidateData.visaStatus)
          ? candidateData.visaStatus
          : candidateData.visaStatus
          ? [candidateData.visaStatus]
          : [],
        bloodGroup: candidateData.bloodGroup || "",
        religion: candidateData.religion || "",
        totalExperienceYears: candidateData.totalExperienceYears || "",
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
        contactPersonMobile: contactMobileData.phone,
        contactPersonMobileCountryCode: contactMobileData.countryCode,
        contactPersonHomeNo: contactHomeData.phone,
        contactPersonHomeNoCountryCode: contactHomeData.countryCode,
        emergencyContactNo: emergencyData.phone,
        emergencyContactNoCountryCode: emergencyData.countryCode,
        nomineeName: candidateData.nomineeName || "",
        nomineeRelationship: candidateData.nomineeRelationship || "",
        profileSummary: candidateData.profileSummary || "",
        currentSalary: candidateData.currentSalary || "",
        expectedSalary: candidateData.expectedSalary || "",
        resume: candidateData.resume || "",
        resumeUrl: candidateData.resumeUrl || "",
        resumeFile: null,
        updatedAt: candidateData.updatedAt || "",
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
        agency: candidateData.agency || "N/A",
        workorderhint: candidateData.workorderhint || "N/A",
        clientCode: candidateData.clientCode || "N/A",
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

      // calculateProfileCompletion(mappedData);
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
      data.age,

      data.skills?.length > 0,
      data.languages?.length > 0,
      data.education?.length > 0,
      data.workExperience?.length > 0,
      data.certificates?.length > 0,
      data.totalExperienceYears,
      data.industry?.length > 0,
      data.visaStatus?.length > 0,

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
      const missingFields = error.errorFields?.map((f) => f.name[0]).join(", ");
      enqueueSnackbar(
        missingFields
          ? `Please fill required fields: ${missingFields}`
          : "Please fill all required preference fields",
        { variant: "error" }
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setLoading(true);
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }).unwrap();

      enqueueSnackbar("Password changed successfully!", { variant: "success" });
      passwordForm.resetFields();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to change password", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
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

  const handleDobChange = (date) => {
    if (date) {
      const age = dayjs().diff(date, "year");
      personalForm.setFieldsValue({ age });
      setUserData((prev) => ({ ...prev, dob: date, age }));
    }
  };

  const handleProfileSave = async () => {
    try {
      let missingFields = [];

      try {
        await profileForm.validateFields();
      } catch (error) {
        const fields = error.errorFields.map((f) => f.name[0]);
        missingFields.push(...fields);
      }

      try {
        await personalForm.validateFields();
      } catch (error) {
        const fields = error.errorFields.map((f) => f.name[0]);
        missingFields.push(...fields);
      }

      try {
        await addressForm.validateFields();
      } catch (error) {
        const fields = error.errorFields.map((f) => f.name[0]);
        missingFields.push(...fields);
      }

      try {
        await contactForm.validateFields();
      } catch (error) {
        const fields = error.errorFields.map((f) => f.name[0]);
        missingFields.push(...fields);
      }

      try {
        await preferencesForm.validateFields();
      } catch (error) {
        const fields = error.errorFields.map((f) => f.name[0]);
        missingFields.push(...fields);
      }

      // If there are missing fields, show snackbar with details
      if (missingFields.length > 0) {
        const fieldLabels = {
          firstName: "First Name",
          lastName: "Last Name",
          email: "Email",
          phone: "Phone",
          title: "Professional Title",
          totalExperienceYears: "Total Experience",
          location: "Current Location",
          age: "Age",
          dob: "Date of Birth",
          nationality: "Nationality",
          countryOfBirth: "Country of Birth",
          country: "Country",
          state: "State",
          city: "City",
          contactPersonName: "Emergency Contact Person Name",
          roles: "Job Roles",
        };

        const missingFieldNames = missingFields
          .map((field) => fieldLabels[field] || field)
          .join(", ");

        enqueueSnackbar(
          `Please fill the following required fields: ${missingFieldNames}`,
          { variant: "error", autoHideDuration: 5000 }
        );
        return;
      }

      // Get form values - ensure we always have values even if forms weren't fully filled
      // Use getFieldsValue() as fallback to get current form values, then validate
      let profileValues = {};
      let personalValues = {};
      let addressValues = {};
      let contactValues = {};
      let preferencesValues = {};

      try {
        profileValues = await profileForm.validateFields();
      } catch (error) {
        // If validation fails, get current form values
        profileValues = profileForm.getFieldsValue();
      }

      try {
        personalValues = await personalForm.validateFields();
      } catch (error) {
        personalValues = personalForm.getFieldsValue();
      }

      try {
        addressValues = await addressForm.validateFields();
      } catch (error) {
        addressValues = addressForm.getFieldsValue();
      }

      try {
        contactValues = await contactForm.validateFields();
      } catch (error) {
        contactValues = contactForm.getFieldsValue();
      }

      try {
        preferencesValues = await preferencesForm.validateFields();
      } catch (error) {
        preferencesValues = preferencesForm.getFieldsValue();
      }

      // Explicitly get country codes from forms to ensure they're included
      const phoneCountryCode = profileForm.getFieldValue("phoneCountryCode") || "91";
      const contactPersonMobileCountryCode = contactForm.getFieldValue("contactPersonMobileCountryCode") || "91";
      const contactPersonHomeNoCountryCode = contactForm.getFieldValue("contactPersonHomeNoCountryCode") || "91";
      const emergencyContactNoCountryCode = contactForm.getFieldValue("emergencyContactNoCountryCode") || "91";

      // Ensure country codes are in the form values
      profileValues.phoneCountryCode = phoneCountryCode;
      contactValues.contactPersonMobileCountryCode = contactPersonMobileCountryCode;
      contactValues.contactPersonHomeNoCountryCode = contactPersonHomeNoCountryCode;
      contactValues.emergencyContactNoCountryCode = emergencyContactNoCountryCode;

      // Clean phone numbers - ensure they don't contain country codes
      // Phone numbers should be stored WITHOUT country code, country codes stored separately
      const preparePhoneNumbers = (values) => {
        const result = { ...values };

        // Process phone number - remove country code if present
        if (values.phone !== undefined) {
          let cleanPhone = values.phone ? values.phone.replace(/^\+/, "").replace(/\D/g, "") : "";
          const countryCode = values.phoneCountryCode || "91";
          // Remove country code from phone if it starts with it
          if (cleanPhone && cleanPhone.startsWith(countryCode)) {
            cleanPhone = cleanPhone.slice(countryCode.length);
          }
          result.phone = cleanPhone; // Store phone WITHOUT country code
        }
        result.phoneCountryCode = values.phoneCountryCode || "91";

        // Process emergency contact number
        if (values.emergencyContactNo !== undefined) {
          let cleanPhone = values.emergencyContactNo ? values.emergencyContactNo.replace(/^\+/, "").replace(/\D/g, "") : "";
          const countryCode = values.emergencyContactNoCountryCode || "91";
          if (cleanPhone && cleanPhone.startsWith(countryCode)) {
            cleanPhone = cleanPhone.slice(countryCode.length);
          }
          result.emergencyContactNo = cleanPhone; // Store phone WITHOUT country code
        }
        result.emergencyContactNoCountryCode = values.emergencyContactNoCountryCode || "91";

        // Process contact person mobile
        if (values.contactPersonMobile !== undefined) {
          let cleanPhone = values.contactPersonMobile ? values.contactPersonMobile.replace(/^\+/, "").replace(/\D/g, "") : "";
          const countryCode = values.contactPersonMobileCountryCode || "91";
          if (cleanPhone && cleanPhone.startsWith(countryCode)) {
            cleanPhone = cleanPhone.slice(countryCode.length);
          }
          result.contactPersonMobile = cleanPhone; // Store phone WITHOUT country code
        }
        result.contactPersonMobileCountryCode = values.contactPersonMobileCountryCode || "91";

        // Process contact person home number
        if (values.contactPersonHomeNo !== undefined) {
          let cleanPhone = values.contactPersonHomeNo ? values.contactPersonHomeNo.replace(/^\+/, "").replace(/\D/g, "") : "";
          const countryCode = values.contactPersonHomeNoCountryCode || "91";
          if (cleanPhone && cleanPhone.startsWith(countryCode)) {
            cleanPhone = cleanPhone.slice(countryCode.length);
          }
          result.contactPersonHomeNo = cleanPhone; // Store phone WITHOUT country code
        }
        result.contactPersonHomeNoCountryCode = values.contactPersonHomeNoCountryCode || "91";

        return result;
      };

      const allValues = {
        ...preparePhoneNumbers(profileValues),
        ...preparePhoneNumbers(personalValues),
        ...preparePhoneNumbers(addressValues),
        ...preparePhoneNumbers(contactValues),
        jobPreferences: preferencesValues,
        socialLinks: profileValues.socialLinks || userData.socialLinks,
        age: personalValues.age, // Add this
        dob: personalValues.dob,
        updatedAt: new Date().toISOString(),
        // Ensure firstName and lastName are always included (from form or existing data)
        firstName: profileValues.firstName || personalValues.firstName || userData.firstName || "",
        lastName: profileValues.lastName || personalValues.lastName || userData.lastName || "",
        middleName: profileValues.middleName || personalValues.middleName || userData.middleName || "",
        email: profileValues.email || userData.email || "",
      };

      // CRITICAL: Explicitly ensure all country code fields are in allValues with proper values
      // This ensures they're not lost during form merging
      allValues.phoneCountryCode = phoneCountryCode || allValues.phoneCountryCode || "91";
      allValues.contactPersonMobileCountryCode = contactPersonMobileCountryCode || allValues.contactPersonMobileCountryCode || "91";
      allValues.contactPersonHomeNoCountryCode = contactPersonHomeNoCountryCode || allValues.contactPersonHomeNoCountryCode || "91";
      allValues.emergencyContactNoCountryCode = emergencyContactNoCountryCode || allValues.emergencyContactNoCountryCode || "91";

      setLoading(true);

      const formData = new FormData();

      // Handle regular form fields (skip country codes - we'll handle them explicitly)
      Object.entries(allValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Skip country code fields - we'll append them explicitly at the end
          if (key.endsWith("CountryCode")) {
            return; // Skip country codes in this loop
          }
          
          if (dayjs.isDayjs(value)) {
            formData.append(key, value.format("YYYY-MM-DD"));
          } else if (key === "socialLinks" || key === "jobPreferences") {
            // Skip these as we'll handle them separately
          } else {
            formData.append(key, value);
          }
        }
      });
      
      // CRITICAL: Explicitly append all country code fields to ensure they're always included
      // This ensures country codes are never lost, even if they were empty or undefined
      formData.append("phoneCountryCode", allValues.phoneCountryCode || "91");
      formData.append("contactPersonMobileCountryCode", allValues.contactPersonMobileCountryCode || "91");
      formData.append("contactPersonHomeNoCountryCode", allValues.contactPersonHomeNoCountryCode || "91");
      formData.append("emergencyContactNoCountryCode", allValues.emergencyContactNoCountryCode || "91");

      // Handle JSON fields
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
      // Certificates are now managed via separate add/delete endpoints
      // No need to include them in profile completion

      // Handle image file
      if (imageFile) {
        formData.append("image", imageFile);
      }

      // Handle resume file
      if (userData.resumeFile) {
        formData.append("resume", userData.resumeFile);
      } else if (!userData.resumeFile && userData.resumeUrl === "") {
        formData.append("resume", "");
      }

      const res = await profileComplete(formData).unwrap();

      const emailChanged = allValues.email !== userData.email;

      // Use API response data or fallback to existing userData to avoid undefined values
      const responseUser = res?.user || {};
      const firstName = responseUser.firstName || allValues.firstName || userData.firstName || "";
      const lastName = responseUser.lastName || allValues.lastName || userData.lastName || "";
      const email = responseUser.email || allValues.email || userData.email || "";
      const fullName = responseUser.fullName || `${firstName} ${lastName}`.trim() || userData.fullName || "";

      const updatedUserInfo = {
        email: email,
        name: fullName || `${firstName} ${lastName}`.trim() || userData.fullName || "",
        roles: "candidate",
      };

      dispatch(
        setUserCredentials({
          userInfo: updatedUserInfo,
          role: "candidate",
        })
      );

      // Certificates are now managed via separate add/delete endpoints
      // Preserve existing certificates from userData (they're managed separately)
      const updatedCertificates = (userData.certificates || []).map(cert => ({
        ...cert,
        certificateFile: null, // Clear any file references after profile save
      }));

      // Merge API response data with existing userData to ensure all fields are preserved
      // Use API response as source of truth for updated fields, but preserve all existing fields
      // Priority: API response > form values (allValues) > existing userData
      const updatedData = {
        ...userData, // Start with ALL existing data to preserve everything
        // Apply form values (only update fields that were actually in the form)
        ...Object.fromEntries(
          Object.entries(allValues).filter(([_, value]) => value !== undefined && value !== null)
        ),
        // Use API response data for fields that were updated on server
        ...(responseUser.firstName !== undefined && { firstName: responseUser.firstName }),
        ...(responseUser.lastName !== undefined && { lastName: responseUser.lastName }),
        ...(responseUser.middleName !== undefined && { middleName: responseUser.middleName }),
        ...(responseUser.email !== undefined && { email: responseUser.email }),
        ...(responseUser.fullName !== undefined && { fullName: responseUser.fullName }),
        ...(responseUser.image !== undefined && { image: responseUser.image }),
        ...(responseUser.resumeUrl !== undefined && { resumeUrl: responseUser.resumeUrl }),
        ...(responseUser.skills !== undefined && { skills: responseUser.skills }),
        ...(responseUser.languages !== undefined && { languages: responseUser.languages }),
        ...(responseUser.education !== undefined && { education: responseUser.education }),
        ...(responseUser.workExperience !== undefined && { workExperience: responseUser.workExperience }),
        ...(responseUser.socialLinks !== undefined && { socialLinks: responseUser.socialLinks }),
        ...(responseUser.jobPreferences !== undefined && { jobPreferences: responseUser.jobPreferences }),
        // Always update these
        fullName: fullName || userData.fullName || `${firstName} ${lastName}`.trim(),
        imageFile: null, // Clear file reference after upload
        resumeFile: null, // Clear file reference after upload
        certificates: updatedCertificates, // Preserve certificates
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
      enqueueSnackbar("Please fill all required education fields", {
        variant: "error",
      });
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

  const addCertificate = () => {
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to add certificate");
      return;
    }
    certForm.resetFields();
    setEditingCertId(null);
    setEditingCertData({}); // Clear any previous data
    setIsCertModalVisible(true);
  };

  const handleCertificateSubmit = async () => {
    try {
      const values = await certForm.validateFields();
      const certificateFile =
        editingCertData.certificateFile ||
        (editingCertId &&
          userData.certificates.find((c) => c.id === editingCertId)
            ?.certificateFile);

      // If editing existing certificate (that already has fileUrl), just update title locally
      if (editingCertId) {
        const existingCert = userData.certificates.find((c) => c.id === editingCertId);
        if (existingCert?.fileUrl && !certificateFile) {
          // Just updating title, no file upload needed
          setUserData((prev) => ({
            ...prev,
            certificates: prev.certificates.map((cert) =>
              cert.id === editingCertId ? { ...cert, title: values.title } : cert
            ),
          }));
          setIsCertModalVisible(false);
          setEditingCertId(null);
          setEditingCertData({});
          return;
        }
      }

      // If no file is selected, show error
      if (!certificateFile) {
        enqueueSnackbar("Please select a certificate file", {
          variant: "error",
        });
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("certificate", certificateFile);
      formData.append("title", values.title);

      // Call API to add certificate
      const res = await addCertificate(formData).unwrap();

      // Update local state with the new certificate from API
      const newCertificate = {
        id: res.certificate._id || res.certificate.id || Math.random().toString(36).substr(2, 9),
        title: res.certificate.fileName || values.title,
        fileUrl: res.certificate.fileUrl,
        certificateFile: null, // Clear file reference after upload
      };

      if (editingCertId) {
        // Replace existing certificate
        setUserData((prev) => ({
          ...prev,
          certificates: prev.certificates.map((cert) =>
            cert.id === editingCertId ? newCertificate : cert
          ),
        }));
      } else {
        // Add new certificate
        setUserData((prev) => ({
          ...prev,
          certificates: [...prev.certificates, newCertificate],
        }));
      }

      enqueueSnackbar("Certificate added successfully", {
        variant: "success",
      });
      setIsCertModalVisible(false);
      setEditingCertId(null);
      setEditingCertData({});
    } catch (err) {
      console.error("Certificate upload error:", err);
      enqueueSnackbar(err?.data?.message || "Failed to upload certificate", {
        variant: "error",
      });
    }
  };

  const handleEditCertificate = (cert) => {
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to edit certificate");
      return;
    }
    setEditingCertId(cert.id);
    setEditingCertData({
      ...cert,
      certificateFile: cert.certificateFile || null,
      fileUrl: cert.fileUrl || "",
    });
    certForm.setFieldsValue({
      title: cert.title,
    });
    setIsCertModalVisible(true);
  };

  const removeCertificate = async (id) => {
    if (!isProfileEditable) {
      message.warning("Please enable edit mode to remove certificate/document");
      return;
    }

    const certificate = userData.certificates.find((c) => c.id === id);
    
    // If certificate has a fileUrl, it's been uploaded - delete from server
    if (certificate?.fileUrl) {
      try {
        // Find the certificate ID from the database (could be _id or id)
        const certificateId = certificate._id || certificate.id;
        
        if (certificateId) {
          await deleteCertificate(certificateId).unwrap();
          enqueueSnackbar("Certificate deleted successfully", {
            variant: "success",
          });
        }
      } catch (err) {
        console.error("Certificate delete error:", err);
        enqueueSnackbar(err?.data?.message || "Failed to delete certificate", {
          variant: "error",
        });
        return; // Don't remove from UI if delete failed
      }
    }

    // Remove from local state
    setUserData({
      ...userData,
      certificates: userData.certificates.filter((cert) => cert.id !== id),
    });
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
      enqueueSnackbar("Please fill all required work experience fields", {
        variant: "error",
      });
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
          <div className="completion-alert-header">
            <div className="completion-alert-left">
              <FireOutlined className="completion-alert-icon" />
              <span>Complete your profile to get recruiters' attention!</span>
            </div>
            <div className="completion-alert-right">
              <Progress
                percent={profileCompletion}
                size="small"
                strokeColor={{
                  "0%": "#ff4d4f",
                  "50%": "#faad14",
                  "100%": "#52c41a",
                }}
                className="completion-alert-progress"
              />
              <Text className="completion-alert-percentage">
                {profileCompletion}%
              </Text>
            </div>
          </div>
        }
        description={
          <div className="completion-alert-description">
            <Text type="secondary">
              🎯 Profiles with 100% completion get{" "}
              <Text strong style={{ color: "#da2c46" }}>
                5x more views
              </Text>{" "}
              from recruiters!
            </Text>
            <div className="completion-alert-missing">
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
        showIcon={false}
        className="profile-completion-alert"
        action={
          <div className="completion-alert-action">
            <Button
              size="small"
              type="primary"
              onClick={toggleProfileEdit}
              style={{ background: "#da2c46", border: "none" }}
              icon={<EditOutlined />}
            >
              Complete Now
            </Button>
          </div>
        }
      />
    );
  };

  const ProfileContent = () => (
    <div style={{ padding: 24 }}>
      <ProfileCompletionAlert />

      <div className="action-buttons-section">
        <div className="action-buttons-space">
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
      </div>

      <Tabs defaultActiveKey="basic"  activeKey={innerActiveTab} 
  onChange={setInnerActiveTab}  type="card">
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Profile Summary
            </span>
          }
          key="summary"
        >
          <Card>
            <Form form={profileForm} layout="vertical" initialValues={userData}>
              <Row gutter={24}>
                <Col span={24} className="avatar-section">
                  <div className="avatar-container">
                    <Avatar
                      size={100}
                      src={userData.image}
                      icon={<UserOutlined />}
                      style={{ border: "4px solid #da2c46" }}
                    />
                    {isProfileEditable && (
                      <div className="avatar-upload-section">
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
                  <PhoneInput
                    form={profileForm}
                    name="phone"
                    label="Phone"
                    required={true}
                    disabled={!isProfileEditable}
                  />
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
                      disabled={!isProfileEditable}
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
                      disabled
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Form.Item label="Search Hint" name="workorderhint">
                    <Input
                      style={{ width: "100%" }}
                      placeholder="Enter Work order hint."
                      disabled
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12} lg={8}>
                  <Form.Item label="Client" name="clientCode">
                    <Input
                      style={{ width: "100%" }}
                      placeholder="Enter client name"
                      disabled
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Divider orientation="left">Social Media Links</Divider>
                </Col>
                <div className="social-links-grid">
                  <Col xs={24} sm={24}>
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
                </div>

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
                    Last updated:{" "}
                    {userData.updatedAt
                      ? dayjs(userData.updatedAt).format("MMM DD, YYYY")
                      : "Not available"}
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
          <Card>
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
                    label="Age"
                    name="age"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your age",
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={18}
                      max={100}
                      placeholder="Enter your age"
                      disabled={!isProfileEditable}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={8}>
                  <Form.Item
                    label="Date of Birth"
                    name="dob"
                    rules={[
                      {
                        required: true,
                        message: "Please select your date of birth",
                      },
                    ]}
                  >
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Select date of birth"
                      disabled={!isProfileEditable}
                      onChange={handleDobChange}
                      disabledDate={(current) => {
                        return current && current > dayjs().endOf("day");
                      }}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="Industry"
                    name="industry"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Please add at least one industry",
                    //   },
                    // ]}
                  >
                    <Select
                      mode="tags"
                      style={{ width: "100%" }}
                      placeholder="Add industries (type to add custom values)"
                      value={userData.industry}
                      onChange={(value) =>
                        setUserData({ ...userData, industry: value })
                      }
                      disabled={!isProfileEditable}
                      options={defaultIndustryOptions}
                      tokenSeparators={[","]}
                    />
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="Visa Status"
                    name="visaStatus"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Please add at least one visa status",
                    //   },
                    // ]}
                  >
                    <Select
                      mode="tags"
                      style={{ width: "100%" }}
                      placeholder="Add visa statuses (type to add custom values)"
                      value={userData.visaStatus}
                      onChange={(value) =>
                        setUserData({ ...userData, visaStatus: value })
                      }
                      disabled={!isProfileEditable}
                      options={defaultVisaStatusOptions}
                      tokenSeparators={[","]}
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
              <IdcardOutlined />
              Documents
            </span>
          }
          key="documents"
        >
          <Card>
            <Card
              title={
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    <SafetyOutlined
                      style={{ marginRight: 8, color: "#da2c46" }}
                    />
                    <span style={{ color: "#da2c46" }}>
                      Certificates & Documents
                    </span>
                  </span>
                  {isProfileEditable && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={addCertificate}
                      style={{ background: "#da2c46", border: "none" }}
                    >
                      Add Certificate/Document
                    </Button>
                  )}
                </div>
              }
              style={{ marginBottom: 24, borderRadius: "12px" }}
            >
              {userData.certificates.length === 0 ? (
                <div style={{ textAlign: "center", padding: 16 }}>
                  <Text type="secondary">
                    No certificates or documents added yet
                  </Text>
                </div>
              ) : (
                <List
                  dataSource={userData.certificates}
                  renderItem={(item) => (
                    <List.Item
                      actions={
                        isProfileEditable
                          ? [
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={() => handleEditCertificate(item)}
                              />,
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => removeCertificate(item.id)}
                              />,
                            ]
                          : null
                      }
                    >
                      <List.Item.Meta
                        title={
                          <Text strong>
                            {item.fileName || item.documentName || item.title}
                          </Text>
                        }
                        description={
                          <div>
                            {item.fileUrl && (
                              <div style={{ marginTop: 4 }}>
                                <Button
                                  type="link"
                                  size="small"
                                  href={item.fileUrl}
                                  icon={<EyeOutlined />}
                                >
                                  View Certificate
                                </Button>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
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
          <Card>
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
          <Card>
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
                  <PhoneInput
                    form={contactForm}
                    name="contactPersonMobile"
                    label="Emergency Contact Mobile"
                    required={false}
                    disabled={!isProfileEditable}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <PhoneInput
                    form={contactForm}
                    name="contactPersonHomeNo"
                    label="Emergency Contact Home No"
                    required={false}
                    disabled={!isProfileEditable}
                  />
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

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="candidate-settings-container container">
      {" "}
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card
            title={
              <div className="profile-header">
                <SettingOutlined className="profile-header-icon" />
                <Title level={4} className="profile-header-title">
                  Candidate Settings
                </Title>
              </div>
            }
            bordered={false}
            className="candidate-settings-card"
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              tabPosition={isMobile ? "top" : "left"}
              className="candidate-tabs"
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
      <Modal
        title={`${editingCertId ? "Edit" : "Add"} Certificate`}
        visible={isCertModalVisible}
        onOk={handleCertificateSubmit}
        onCancel={() => setIsCertModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
        width={600}
      >
        <Form form={certForm} layout="vertical">
          <Form.Item
            name="title"
            label="Certificate Title"
            rules={[
              { required: true, message: "Please enter certificate title" },
            ]}
          >
            <Input placeholder="e.g. AWS Certified Solutions Architect" />
          </Form.Item>

          <Form.Item label="Upload Certificate">
            <Upload
              accept=".pdf"
              showUploadList={false}
              beforeUpload={(file) => {
                const isLt5M = file.size / 1024 / 1024 < 5;
                if (!isLt5M) {
                  message.error("Certificate must be smaller than 5MB!");
                  return false;
                }

                const allowedTypes = ["application/pdf"];
                if (!allowedTypes.includes(file.type)) {
                  message.error("Only PDF files are allowed!");
                  return false;
                }

                // Store the file for the certificate being edited/added
                setUserData((prev) => ({
                  ...prev,
                  certificates: prev.certificates.map((cert) =>
                    cert.id === editingCertId
                      ? {
                          ...cert,
                          certificateFile: file,
                          fileUrl: URL.createObjectURL(file),
                        }
                      : cert
                  ),
                }));

                // If adding new certificate, store file temporarily
                if (!editingCertId) {
                  setEditingCertData((prev) => ({
                    ...prev,
                    certificateFile: file,
                    fileUrl: URL.createObjectURL(file),
                  }));
                }

                return false; // prevent auto upload
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Certificate</Button>
            </Upload>

            {/* Show current file info */}
            {(editingCertData.fileUrl ||
              (editingCertId &&
                userData.certificates.find((c) => c.id === editingCertId)
                  ?.fileUrl)) && (
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Current certificate: </Text>
                <Button
                  type="link"
                  href={
                    editingCertData.fileUrl ||
                    userData.certificates.find((c) => c.id === editingCertId)
                      ?.fileUrl
                  }
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
                    if (editingCertId) {
                      setUserData((prev) => ({
                        ...prev,
                        certificates: prev.certificates.map((cert) =>
                          cert.id === editingCertId
                            ? { ...cert, fileUrl: "", certificateFile: null }
                            : cert
                        ),
                      }));
                    } else {
                      setEditingCertData((prev) => ({
                        ...prev,
                        fileUrl: "",
                        certificateFile: null,
                      }));
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CandidateSettings;
