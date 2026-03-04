import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Upload, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  BankOutlined,
  StarOutlined,
  FileTextOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import PhoneInput from "../../Global/PhoneInput";
import { useSnackbar } from "notistack";
import axios from "axios";
import { useGetAllClientsForDropdownQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Option } = Select;

const ConvertToCandidateModal = ({
  visible,
  onCancel,
  handleSubmit,
  isSubmitting = false,
  initialValues = {},
  existingCvUrl = "",
  existingCvFileName = "",
}) => {
  const [form] = Form.useForm();
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [documentFiles, setDocumentFiles] = useState([]);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  
  // Get all clients for dropdown
  const { data: clientsData } = useGetAllClientsForDropdownQuery({});
  const allClients = clientsData?.clients?.filter(
    (client) => client.accountStatus === "active"
  ) || [];
  
  // Combine external and local loading states
  const isLoading = isSubmitting || isSubmittingLocal;

  const handleCountryCodeChange = (value) => {
    setSelectedCountryCode(value);
  };

  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.reject(new Error("Please enter phone number"));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_, value) => {
    if (!value || form.getFieldValue("password") === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match"));
  };

  const getCountryOptions = () => [
    { value: "+91", label: "India", searchText: "india" },
  ];

  // Parse existing CV when modal opens
  useEffect(() => {
    if (visible) {
      // Reset states
      setDocumentFiles([]);
      setParsedResumeData(null);
      
      // Set initial values first
      if (initialValues) {
        form.setFieldsValue(initialValues);
      }
      
      // Then parse CV if URL exists
      if (existingCvUrl) {
        parseExistingCv();
      }
    }
  }, [visible, existingCvUrl, initialValues, form]);

  const parseExistingCv = async () => {
    if (!existingCvUrl) return;
    
    setIsParsingResume(true);
    
    try {
      // Fetch the CV file
      const response = await fetch(existingCvUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch CV file");
      }
      const blob = await response.blob();
      
      // Create a file object from the blob
      const file = new File([blob], existingCvFileName || "resume.pdf", {
        type: blob.type || "application/pdf",
      });
      
      const formData = new FormData();
      formData.append("resume", file);
      
      const baseUrl = window.location.hostname === "localhost"
        ? "http://localhost:5000/api/admin"
        : `https://${window.location.hostname}/api/admin`;
      
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];
      
      const parseResponse = await axios.post(`${baseUrl}/parse-resume`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      
      if (parseResponse.data?.data) {
        const parsed = parseResponse.data.data;
        setParsedResumeData(parsed);
        
        // Auto-fill form fields with parsed data, but don't override existing values
        const currentValues = form.getFieldsValue();
        form.setFieldsValue({
          firstName: parsed.firstName || currentValues.firstName || initialValues?.firstName,
          middleName: parsed.middleName || currentValues.middleName || initialValues?.middleName,
          lastName: parsed.lastName || currentValues.lastName || initialValues?.lastName,
          email: parsed.email || currentValues.email || initialValues?.email,
          phoneNumber: parsed.phone || currentValues.phoneNumber || initialValues?.phoneNumber,
          phoneNumberCountryCode: parsed.phoneCountryCode || currentValues.phoneNumberCountryCode || initialValues?.phoneNumberCountryCode || "91",
          companyName: parsed.companyName || currentValues.companyName || initialValues?.companyName,
          specialization: parsed.specialization || currentValues.specialization || initialValues?.specialization,
          qualifications: parsed.qualifications || currentValues.qualifications || initialValues?.qualifications,
          experience: parsed.experience || currentValues.experience || initialValues?.experience,
        });
        
        enqueueSnackbar("CV parsed successfully! Fields auto-filled.", {
          variant: "success",
        });
      }
    } catch (error) {
      console.error("CV parsing error:", error);
      enqueueSnackbar(
        error?.response?.data?.message || "Failed to parse CV. You can still fill the form manually.",
        { variant: "warning" }
      );
    } finally {
      setIsParsingResume(false);
    }
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


  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined
            style={{ marginRight: 8, color: "#da2c46", fontSize: 18 }}
          />
          <span style={{ fontSize: "16px", fontWeight: 600 }}>
            Convert to candidate
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
        onFinish={async (values) => {
          setIsSubmittingLocal(true);
          try {
            await handleSubmit(values, documentFiles, existingCvUrl);
          } finally {
            setIsSubmittingLocal(false);
          }
        }}
        initialValues={initialValues}
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
            <PhoneInput
              form={form}
              name="phoneNumber"
              label="Phone Number"
              required
            />
            <div style={{ fontSize: "12px", color: "#8c8c8c", marginTop: "4px" }}>
              Phone number will be stored without country code prefix
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Company Name"
              name="companyName"
              rules={[{ required: true, message: "Please enter company name" }]}
            >
              <Input
                prefix={<BankOutlined />}
                placeholder="Enter current/previous company"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Specialization"
              name="specialization"
              tooltip="If designation was provided during CV upload, it will be used here. You can modify if needed."
              rules={[
                { required: true, message: "Please enter specialization" },
              ]}
            >
              <Input
                prefix={<StarOutlined />}
                placeholder="e.g., React.js, Node.js, Python (or use designation)"
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

        {/* CV Info Section */}
        {existingCvUrl && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Existing CV">
                <div style={{ 
                  padding: "12px", 
                  background: "#f5f5f5", 
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <FileTextOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
                  <span style={{ flex: 1 }}>
                    {existingCvFileName || "CV File"}
                    {isParsingResume && " (Parsing...)"}
                    {parsedResumeData && !isParsingResume && " (Parsed)"}
                  </span>
                  {parsedResumeData && (
                    <span style={{ fontSize: "12px", color: "#52c41a" }}>
                      ✓ Details extracted
                    </span>
                  )}
                </div>
                {parsedResumeData && (
                  <div style={{ marginTop: 8, fontSize: "12px", color: "#666" }}>
                    CV details extracted and auto-filled in the form above
                  </div>
                )}
              </Form.Item>
            </Col>
          </Row>
        )}

        {/* Documents/Certificates Upload Section */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Upload Documents/Certificates - Optional">
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
              label="Designation"
              name="designation"
              tooltip="Designation from CV upload will be pre-filled if available"
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="e.g., Software Engineer, Project Manager" 
              />
            </Form.Item>
          </Col>
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
        </Row>

        <Row gutter={16}>
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
                { required: true, message: "Please enter password" },
                { min: 6, message: "Password must be at least 6 characters" },
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
                { required: true, message: "Please confirm password" },
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

export default ConvertToCandidateModal;
