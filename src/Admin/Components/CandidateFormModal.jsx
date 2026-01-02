import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Select, Spin } from "antd";
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

  const [addCandidate, { isLoading: isAdding }] = useAddCandidateMutation();
  const [editCandidate, { isLoading: isEditing }] = useEditCandidateMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: clientsData } = useGetClientsQuery({
    page: 1,
    limit: 100000,
  });

  const activeSuppliers =
    clientsData?.clients?.filter(
      (client) =>
        client.accountStatus === "active" && client.clientType === "Supplier"
    ) || [];

  const isEditMode = !!editingCandidate;
  const isLoading = isAdding || isEditing;

  useEffect(() => {
    if (visible) {
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

      const fullPhoneNumber =
        phoneCountryCode && phone ? phoneCountryCode + phone : "";
      if (isEditMode) {
        const editPayload = {
          ...payload,
          firstName: firstName?.trim(),
          middleName: middleName?.trim() || "",
          lastName: lastName?.trim(),
          fullName,
          phone: fullPhoneNumber,
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
        const createPayload = {
          ...payload,
          firstName: firstName?.trim(),
          middleName: middleName?.trim() || "",
          lastName: lastName?.trim(),
          fullName,
          phone: fullPhoneNumber,
          role: "candidate",
        };

        await addCandidate(createPayload).unwrap();
        enqueueSnackbar("Candidate created successfully!", {
          variant: "success",
        });
      }

      if (onSubmit) {
        onSubmit(values);
      }

      onCancel();
      form.resetFields();
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} candidate:`,
        error
      );
      enqueueSnackbar(
        error?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } candidate. Please try again.`,
        { variant: "error" }
      );
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
                <Input placeholder="Enter client name" />
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
