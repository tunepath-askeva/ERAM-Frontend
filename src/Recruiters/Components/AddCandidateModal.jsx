import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Button, Row, Col, Select } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  TrophyOutlined,
  LockOutlined,
  StarOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import {
  countryMobileLimits,
  phoneUtils,
  countryInfo,
} from "../../utils/countryMobileLimits";

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

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setSelectedCountryCode("91");
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
          } (+${code})`,
          searchText: `${country?.name || ""} ${code}`.toLowerCase(),
        };
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  };

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

      const createPayload = {
        ...payload,
        firstName: firstName?.trim(),
        middleName: middleName?.trim() || "",
        lastName: lastName?.trim(),
        fullName,
        phone: fullPhoneNumber,
        role: "candidate",
      };

      await onSubmit(createPayload);

      form.resetFields();
      setSelectedCountryCode("91");
      setPhoneNumber("");
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
          loading={isSubmitting}
          style={{
            background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            border: "none",
          }}
        >
          Create Candidate
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
          <Col span={8}>
            <Form.Item label="Agency" name="agency">
              <Input placeholder="Enter agency name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Work Order Hint" name="workorderhint">
              <Input placeholder="Hint for making search easier" />
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
