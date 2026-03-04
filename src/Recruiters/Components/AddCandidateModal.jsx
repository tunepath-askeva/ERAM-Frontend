import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Upload, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  TrophyOutlined,
  LockOutlined,
  StarOutlined,
  FlagOutlined,
  UploadOutlined,
  FileTextOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import {
  countryMobileLimits,
  phoneUtils,
  countryInfo,
} from "../../utils/countryMobileLimits";
import axios from "axios";
import { useGetAllClientsForDropdownQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Option } = Select;
const { TextArea } = Input;

const AddCandidateModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  isSubmitting = false,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [selectedCountryCode, setSelectedCountryCode] = useState("91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  
  // Get all clients for dropdown
  const { data: clientsData } = useGetAllClientsForDropdownQuery({});
  const allClients = clientsData?.clients?.filter(
    (client) => client.accountStatus === "active"
  ) || [];
  
  // Combine external and local loading states
  const isLoading = isSubmitting || isSubmittingLocal;

  // Handle resume parsing
  const handleResumeUpload = async (file) => {
    setIsParsingResume(true);
    setResumeFile(file);
    
    try {
      const formData = new FormData();
      formData.append("resume", file);
      
      const baseUrl = window.location.hostname === "localhost"
        ? "http://localhost:5000/api/admin"
        : `https://${window.location.hostname}/api/admin`;
      
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      const response = await axios.post(`${baseUrl}/parse-resume`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      
      if (response.data?.data) {
        const parsed = response.data.data;
        setParsedResumeData(parsed);
        
        // Auto-fill form fields with parsed data
        form.setFieldsValue({
          firstName: parsed.firstName || form.getFieldValue("firstName"),
          middleName: parsed.middleName || form.getFieldValue("middleName"),
          lastName: parsed.lastName || form.getFieldValue("lastName"),
          email: parsed.email || form.getFieldValue("email"),
          phoneNumber: parsed.phone || form.getFieldValue("phoneNumber"),
          countryCode: parsed.phoneCountryCode || form.getFieldValue("countryCode") || "91",
          companyName: parsed.companyName || form.getFieldValue("companyName"),
          specialization: parsed.specialization || form.getFieldValue("specialization"),
          qualifications: parsed.qualifications || form.getFieldValue("qualifications"),
          experience: parsed.experience || form.getFieldValue("experience"),
        });
        
        enqueueSnackbar("Resume parsed successfully! Fields auto-filled.", {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Resume parsing error:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to parse resume",
        { variant: "error" }
      );
    } finally {
      setIsParsingResume(false);
    }
    
    return false; // Prevent auto upload
  };

  // Handle document uploads
  const handleDocumentUpload = (file) => {
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("File must be smaller than 10MB!");
      return false;
    }
    
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      message.error("Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed!");
      return false;
    }
    
    setDocumentFiles((prev) => [...prev, file]);
    return false; // Prevent auto upload
  };

  const handleDocumentRemove = (file) => {
    setDocumentFiles((prev) => prev.filter((item) => item.uid !== file.uid));
  };

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedCountryCode("91");
      setResumeFile(null);
      setDocumentFiles([]);
      setParsedResumeData(null);
      form.setFieldsValue({
        countryCode: "91",
      });
    }
  }, [visible, form]);

  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Please enter phone number"));
    }

    const cleanNumber = value.replace(/\D/g, "");
    const isValid = phoneUtils.validateMobileNumber(
      selectedCountryCode,
      cleanNumber
    );

    if (!isValid) {
      const limits = phoneUtils.getLimits(selectedCountryCode);
      return Promise.reject(
        new Error(
          `Phone number must be between ${limits.min} and ${
            limits.max
          } digits for ${
            countryInfo[selectedCountryCode]?.name || "selected country"
          }`
        )
      );
    }

    return Promise.resolve();
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const cleanValue = value.replace(/\D/g, "");

    const limits = phoneUtils.getLimits(selectedCountryCode);
    if (limits && cleanValue.length <= limits.max) {
      setPhoneNumber(cleanValue);
      form.setFieldsValue({ phoneNumber: cleanValue });
    }
  };

  const handleCountryCodeChange = (value) => {
    setSelectedCountryCode(value);
    form.validateFields(["phoneNumber"]);
  };

  const getCountryOptions = () => {
    return phoneUtils
      .getSupportedCountryCodes()
      .map((code) => {
        const country = countryInfo[code];
        return {
          value: code,
          label: `${country?.flag || ""} ${
            country?.name || `Country ${code}`
          } (${code})`,
          searchText: `${country?.name || ""} ${code}`.toLowerCase(),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const handleSubmit = async (values) => {
    setIsSubmittingLocal(true);
    try {
      const {
        confirmPassword,
        firstName,
        middleName,
        lastName,
        countryCode,
        phoneNumber,
        ...payload
      } = values;

      const fullName = [firstName, middleName, lastName]
        .filter(Boolean)
        .map((name) => name.trim())
        .join(" ");

      // Clean phone number - remove country code if present, store number alone
      const cleanPhone = phoneNumber ? phoneNumber.replace(/^\+/, "").replace(/\D/g, "") : "";
      // Remove country code from phone if it starts with it
      const phoneWithoutCode = cleanPhone.startsWith(countryCode) 
        ? cleanPhone.slice(countryCode.length) 
        : cleanPhone;

      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add resume file if provided
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }
      
      // Add document files if provided
      documentFiles.forEach((file) => {
        formData.append("documents", file);
      });
      
      // Add all other form data
      const createPayload = {
        ...payload,
        firstName: firstName?.trim(),
        middleName: middleName?.trim() || "",
        lastName: lastName?.trim(),
        fullName,
        phone: phoneWithoutCode, // Phone number WITHOUT country code
        phoneCountryCode: countryCode || "91", // Country code sent separately
        role: "candidate",
      };
      
      // Append all payload fields to FormData
      Object.keys(createPayload).forEach((key) => {
        if (createPayload[key] !== undefined && createPayload[key] !== null) {
          formData.append(key, createPayload[key]);
        }
      });
      
      // Pass formData to onSubmit (parent will handle the API call)
      await onSubmit(formData, createPayload);

      form.resetFields();
      setSelectedCountryCode("91");
      setPhoneNumber("");
      setResumeFile(null);
      setDocumentFiles([]);
      setParsedResumeData(null);
      enqueueSnackbar("Candidate created successfully!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error creating candidate:", error);

      let errorMessage = "Failed to create candidate. Please try again.";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsSubmittingLocal(false);
    }
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue("password");

    if (!value || password === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match!"));
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined
            style={{ marginRight: 8, color: "#da2c46", fontSize: 18 }}
          />
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            Add New Candidate
          </span>
        </div>
      }
      open={visible}
      onCancel={isLoading ? undefined : onCancel}
      closable={!isLoading}
      maskClosable={!isLoading}
      width="90%"
      style={{ maxWidth: 800 }}
      centered
      footer={[
        <Button 
          key="cancel" 
          onClick={onCancel} 
          size="large"
          disabled={isLoading}
        >
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          size="large"
          loading={isLoading}
          disabled={isLoading}
          style={{
            background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            border: "none",
          }}
        >
          {isLoading ? "Creating..." : "Create Candidate"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ padding: "16px 0" }}
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter first name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Middle Name" name="middleName">
              <Input
                prefix={<UserOutlined />}
                placeholder="Enter middle name (optional)"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Enter last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Enter email address"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Phone Number" style={{ marginBottom: 0 }}>
              <Input.Group compact>
                <Form.Item
                  name="countryCode"
                  style={{ width: "40%" }}
                  rules={[{ required: true, message: "Select country" }]}
                >
                  <Select
                    showSearch
                    placeholder="Country"
                    value={selectedCountryCode}
                    onChange={handleCountryCodeChange}
                    filterOption={(input, option) =>
                      option.searchText?.includes(input.toLowerCase())
                    }
                    style={{ width: "100%" }}
                  >
                    {getCountryOptions().map((option) => (
                      <Option
                        key={option.value}
                        value={option.value}
                        searchText={option.searchText}
                      >
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="phoneNumber"
                  style={{ width: "60%" }}
                  rules={[{ validator: validatePhoneNumber }]}
                >
                  <Input
                    prefix={<PhoneOutlined />}
                    placeholder={`Enter ${
                      phoneUtils.getLimits(selectedCountryCode)?.min || 0
                    }-${
                      phoneUtils.getLimits(selectedCountryCode)?.max || 0
                    } digits`}
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    maxLength={
                      phoneUtils.getLimits(selectedCountryCode)?.max || 15
                    }
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Company Name"
              name="companyName"
              rules={[{ required: true, message: "Please enter company name" }]}
            >
              <Input
               
                placeholder="Enter current/previous company"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Specialization"
              name="specialization"
              rules={[
                { required: true, message: "Please enter specialization" },
              ]}
            >
              <Input
               
                placeholder="e.g., React.js, Node.js, Python"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Nationality"
              name="nationality"
              rules={[
                { required: true, message: "Please enter nationality" },
              ]}
            >
              <Input
               
                placeholder="e.g., Indian..."
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Agency" name="agency">
              <Input placeholder="Enter agency name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Search Hint" name="workorderhint">
              <Input placeholder="Hint for making search easier" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Client" name="client">
              <Select
                placeholder="Select client"
                showSearch
                allowClear
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={allClients.map((client) => ({
                  value: client._id || client.ClientCode || client.fullName,
                  label: `${client.fullName}${client.ClientCode ? ` (${client.ClientCode})` : ""}`,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Resume Import Section */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Import Resume (PDF/DOC/DOCX)">
              <Upload
                accept=".pdf,.doc,.docx"
                beforeUpload={handleResumeUpload}
                showUploadList={false}
                maxCount={1}
              >
                <Button
                  icon={<FileTextOutlined />}
                  loading={isParsingResume}
                  disabled={isParsingResume}
                >
                  {isParsingResume ? "Parsing Resume..." : "Import & Parse Resume"}
                </Button>
              </Upload>
              {resumeFile && (
                <div style={{ marginTop: 8, color: "#52c41a" }}>
                  ✓ {resumeFile.name}
                  {parsedResumeData && " (Parsed)"}
                </div>
              )}
              {parsedResumeData && (
                <div style={{ marginTop: 4, fontSize: "12px", color: "#666" }}>
                  Resume details extracted and auto-filled
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>

        {/* Documents/Certificates Upload Section */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Upload Documents/Certificates">
              <Upload
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                beforeUpload={handleDocumentUpload}
                onRemove={handleDocumentRemove}
                fileList={documentFiles}
                multiple
              >
                <Button icon={<PaperClipOutlined />}>
                  Upload Documents
                </Button>
              </Upload>
              <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                You can upload multiple documents (PDF, DOC, DOCX, JPG, PNG)
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Experience"
              name="experience"
              rules={[{ required: true, message: "Please enter experience" }]}
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
          <Col span={12}>
            <Form.Item
              label="Qualifications"
              name="qualifications"
              rules={[
                { required: true, message: "Please enter qualifications" },
              ]}
            >
              <Input placeholder="Enter educational qualifications, certifications, degrees, etc." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please enter password",
                },
                {
                  min: 6,
                  message: "Password must be at least 6 characters",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter password"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm password",
                },
                { validator: validateConfirmPassword },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirm password"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddCandidateModal;
