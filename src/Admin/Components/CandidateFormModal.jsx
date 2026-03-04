import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Spin, Upload, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  TrophyOutlined,
  TeamOutlined,
  LockOutlined,
  BookOutlined,
  StarOutlined,
  ShopOutlined,
  GlobalOutlined,
  UploadOutlined,
  FileTextOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import {
  useAddCandidateMutation,
  useEditCandidateMutation,
  useGetClientsQuery,
} from "../../Slices/Admin/AdminApis.js";
import { useSnackbar } from "notistack";
import {
  countryMobileLimits,
  phoneUtils,
  countryInfo,
} from "../../utils/countryMobileLimits.js";
import PhoneInput from "../../Global/PhoneInput.jsx";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;

const CandidateFormModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  editingCandidate,
  isLoadingCandidate = false,
}) => {
  const [candidateTypeInput, setCandidateTypeInput] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addCandidate, { isLoading: isAdding }] = useAddCandidateMutation();
  const [editCandidate, { isLoading: isEditing }] = useEditCandidateMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: clientsData } = useGetClientsQuery({
    page: 1,
    limit: 100000,
  });

  // Get all clients (not just suppliers) for dropdown
  const allClients =
    clientsData?.clients?.filter(
      (client) => client.accountStatus === "active"
    ) || [];

  const activeSuppliers =
    clientsData?.clients?.filter(
      (client) =>
        client.accountStatus === "active" && client.clientType === "Supplier"
    ) || [];

  const isEditMode = !!editingCandidate;
  const isLoading = isAdding || isEditing || isSubmitting;

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
          phone: parsed.phone || form.getFieldValue("phone"),
          phoneCountryCode: parsed.phoneCountryCode || form.getFieldValue("phoneCountryCode") || "91",
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
      // Reset file states when modal opens
      setResumeFile(null);
      setDocumentFiles([]);
      setParsedResumeData(null);
      
      if (isEditMode && editingCandidate && !isLoadingCandidate) {
        // Add safety check for fullName
        const fullName = editingCandidate.fullName || "";
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName =
          nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
        const middleName =
          nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

        // Parse phone number properly using countryMobileLimits
        let phoneCountryCode = "91"; // default
        let phoneNumber = "";

        if (editingCandidate.phone) {
          // Remove + prefix if present (handle multiple + signs)
          let phoneWithoutPlus = editingCandidate.phone.trim();
          while (phoneWithoutPlus.startsWith("+")) {
            phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
          }
          
          // Clean to digits only
          const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");

          if (cleanPhone) {
            // Use improved parsePhoneNumber that uses countryMobileLimits directly
            const parsed = phoneUtils.parsePhoneNumber(cleanPhone);

            if (parsed.countryCode && parsed.phoneNumber) {
              phoneCountryCode = parsed.countryCode;
              phoneNumber = parsed.phoneNumber;
            } else {
              // If parsing fails, treat entire number as phone
              phoneNumber = cleanPhone;
            }
          }
        }

        form.setFieldsValue({
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          email: editingCandidate.email || "",
          phoneCountryCode: phoneCountryCode,
          phone: phoneNumber,
          companyName: editingCandidate.companyName || "",
          specialization: editingCandidate.specialization || "",
          experience: editingCandidate.totalExperienceYears || "",
          qualifications: editingCandidate.qualifications || "",
          supplierId:
            editingCandidate.supplier ||
            editingCandidate.supplierId ||
            undefined,
          candidateType: editingCandidate.candidateType || "",
          agency: editingCandidate.agency || "",
          workorderhint: editingCandidate.workorderhint || "",
          client: editingCandidate.clientCode || "",
          nationality: editingCandidate.nationality || "",
        });
      } else if (!isEditMode) {
        form.resetFields();
      }
    }
  }, [visible, form, isEditMode, editingCandidate, isLoadingCandidate]);

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const {
        confirmPassword,
        firstName,
        middleName,
        lastName,
        phoneCountryCode,
        phone,
        ...payload
      } = values;

      const fullName = [firstName, middleName, lastName]
        .filter(Boolean)
        .map((name) => name.trim())
        .join(" ");

      // Clean phone number - remove country code if present, store number alone
      const cleanPhone = phone ? phone.replace(/^\+/, "").replace(/\D/g, "") : "";
      // Remove country code from phone if it starts with it
      const phoneWithoutCode = phoneCountryCode && cleanPhone.startsWith(phoneCountryCode)
        ? cleanPhone.slice(phoneCountryCode.length)
        : cleanPhone;
      
      if (isEditMode) {
        const editPayload = {
          ...payload,
          firstName: firstName?.trim(),
          middleName: middleName?.trim() || "",
          lastName: lastName?.trim(),
          fullName,
          phone: phoneWithoutCode, // Phone number WITHOUT country code
          phoneCountryCode: phoneCountryCode || "91", // Country code sent separately
          supplier: payload.supplierId,
        };

        if (!payload.password) {
          delete editPayload.password;
        }

        await editCandidate({
          id: editingCandidate._id,
          candidateData: editPayload,
        }).unwrap();

        enqueueSnackbar("Candidate updated successfully!", {
          variant: "success",
        });
      } else {
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
          phoneCountryCode: phoneCountryCode || "91", // Country code sent separately
          role: "candidate",
        };
        
        // Append all payload fields to FormData
        Object.keys(createPayload).forEach((key) => {
          if (createPayload[key] !== undefined && createPayload[key] !== null) {
            formData.append(key, createPayload[key]);
          }
        });
        
        const baseUrl = window.location.hostname === "localhost"
          ? "http://localhost:5000/api/admin"
          : `https://${window.location.hostname}/api/admin`;
        
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];
        
        await axios.post(`${baseUrl}/candidate`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });
        
        enqueueSnackbar("Candidate created successfully!", {
          variant: "success",
        });
      }

      if (onSubmit) {
        onSubmit(values);
      }

      onCancel();
      form.resetFields();
      setResumeFile(null);
      setDocumentFiles([]);
      setParsedResumeData(null);
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} candidate:`,
        error
      );
      enqueueSnackbar(
        error?.response?.data?.message || error?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } candidate. Please try again.`,
        { variant: "error" }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue("password");

    if (isEditMode && !password && !value) {
      return Promise.resolve();
    }

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
            {isEditMode ? "Edit Candidate" : "Add New Candidate"}
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width="90%"
      style={{ maxWidth: 800 }}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel} size="large">
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          size="large"
          loading={isLoading}
          style={{
            background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
            border: "none",
          }}
        >
          {isEditMode ? "Update Candidate" : "Create Candidate"}
        </Button>,
      ]}
    >
      {isLoadingCandidate ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Loading candidate details...</div>
        </div>
      ) : (
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
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter first name"
                />
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
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Enter last name"
                />
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
                name="phone"
                label="Phone Number"
                required={true}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[
                  { required: true, message: "Please enter company name" },
                ]}
              >
                <Input
                  prefix={<BankOutlined />}
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
                  prefix={<StarOutlined />}
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
                <Input placeholder="e.g., Indian..." />
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
              <Form.Item label="Work Order Hint" name="workorderhint">
                <Input placeholder="eg. This candidate is for work order 1" />
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
                <Input
                  rows={3}
                  placeholder="Enter educational qualifications, certifications, degrees, etc."
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Add Supplier Field */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Supplier (Optional)"
                name="supplierId"
                help="Select a supplier if this candidate is associated with one"
              >
                <Select
                  placeholder={
                    clientsData ? "Select a supplier" : "Loading suppliers..."
                  }
                  allowClear
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    String(option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={!clientsData}
                  notFoundContent={
                    activeSuppliers.length === 0
                      ? "No active suppliers available"
                      : null
                  }
                >
                  {activeSuppliers.map((supplier) => (
                    <Option
                      key={supplier._id}
                      value={supplier._id}
                      title={supplier.fullName || supplier.companyName}
                    >
                      {supplier.fullName ||
                        supplier.companyName ||
                        `Supplier (ID: ${supplier._id})`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Candidate Type"
                name="candidateType"
                rules={[
                  {
                    required: true,
                    message: "Please select or enter candidate type",
                  },
                ]}
                initialValue="General"
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Select or type candidate type"
                  value={form.getFieldValue("candidateType")}
                  onSearch={(val) => setCandidateTypeInput(val)}
                  onChange={(value) => {
                    form.setFieldsValue({ candidateType: value });
                  }}
                  onBlur={() => {
                    const currentValue = form.getFieldValue("candidateType");
                    if (!currentValue && candidateTypeInput) {
                      form.setFieldsValue({
                        candidateType: candidateTypeInput,
                      });
                    }
                  }}
                  filterOption={(input, option) =>
                    (option?.children ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {[
                    "General",
                    "Supplier",
                    "Own",
                    "SponserTransfer",
                    "Khafalath",
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={isEditMode ? "New Password (Optional)" : "Password"}
                name="password"
                rules={[
                  {
                    required: !isEditMode,
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
                  placeholder={
                    isEditMode
                      ? "Leave blank to keep current password"
                      : "Enter password"
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={isEditMode ? "Confirm New Password" : "Confirm Password"}
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: !isEditMode && form.getFieldValue("password"),
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
      )}
    </Modal>
  );
};

export default CandidateFormModal;
