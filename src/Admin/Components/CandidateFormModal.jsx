import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
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

const { Option } = Select;
const { TextArea } = Input;

const CandidateFormModal = ({
  visible,
  onCancel,
  onSubmit,
  form,
  editingCandidate,
}) => {
  const [candidateTypeInput, setCandidateTypeInput] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [addCandidate, { isLoading: isAdding }] = useAddCandidateMutation();
  const [editCandidate, { isLoading: isEditing }] = useEditCandidateMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { data: clientsData } = useGetClientsQuery({
    includePagination: false,
  });

  const activeSuppliers =
    clientsData?.clients?.filter(
      (client) =>
        client.accountStatus === "active" && client.clientType === "Supplier"
    ) || [];

  const isEditMode = !!editingCandidate;
  const isLoading = isAdding || isEditing;

  const parsePhoneNumber = (fullPhone) => {
    if (!fullPhone || !fullPhone.startsWith("+")) {
      return { countryCode: "91", phoneNumber: fullPhone || "" };
    }

    const phoneWithoutPlus = fullPhone.substring(1);
    const supportedCodes = phoneUtils
      .getSupportedCountryCodes()
      .sort((a, b) => b.length - a.length);

    for (const code of supportedCodes) {
      if (phoneWithoutPlus.startsWith(code)) {
        return {
          countryCode: code,
          phoneNumber: phoneWithoutPlus.substring(code.length),
        };
      }
    }

    return { countryCode: "91", phoneNumber: phoneWithoutPlus };
  };

  useEffect(() => {
    if (visible) {
      if (isEditMode && editingCandidate) {
        const nameParts = editingCandidate.fullName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName =
          nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
        const middleName =
          nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

        const { countryCode, phoneNumber: parsedPhone } = parsePhoneNumber(
          editingCandidate.phone
        );
        setSelectedCountryCode(countryCode);
        setPhoneNumber(parsedPhone);

        form.setFieldsValue({
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          email: editingCandidate.email || "",
          countryCode: countryCode,
          phoneNumber: parsedPhone,
          companyName: editingCandidate.companyName || "",
          specialization: editingCandidate.specialization || "",
          experience: editingCandidate.totalExperienceYears || "",
          qualifications: editingCandidate.qualifications || "",
          supplierId: editingCandidate.supplierId || undefined,
          candidateType: editingCandidate.candidateType || "",
        });
      } else {
        form.resetFields();
        setSelectedCountryCode("91");
        setPhoneNumber("");
        form.setFieldsValue({
          countryCode: "91",
        });
      }
    }
  }, [visible, form, isEditMode, editingCandidate]);

  const handleSubmit = async (values) => {
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

      const fullPhoneNumber = phoneUtils.formatWithCountryCode(
        countryCode,
        phoneNumber
      );

      if (isEditMode) {
        const editPayload = {
          ...payload,
          firstName: firstName?.trim(),
          middleName: middleName?.trim() || "",
          lastName: lastName?.trim(),
          fullName,
          phone: fullPhoneNumber,
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
      setSelectedCountryCode("91");
      setPhoneNumber("");
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
    const cleanValue = value.replace(/\D/g, ""); // Remove non-digits

    const limits = phoneUtils.getLimits(selectedCountryCode);
    if (limits && cleanValue.length <= limits.max) {
      setPhoneNumber(cleanValue);
      form.setFieldsValue({ phoneNumber: cleanValue });
    }
  };

  const handleCountryCodeChange = (value) => {
    setSelectedCountryCode(value);
    // Re-validate phone number when country code changes
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
          } (+${code})`,
          searchText: `${country?.name || ""} ${code}`.toLowerCase(),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const countryOptions = getCountryOptions();

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
                    {countryOptions.map((option) => (
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
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Experience"
              name="experience"
              rules={[{ required: true, message: "Please enter experience" }]}
            >
              <Input placeholder="Enter work experience." />
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
                    form.setFieldsValue({ candidateType: candidateTypeInput });
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
    </Modal>
  );
};

export default CandidateFormModal;
