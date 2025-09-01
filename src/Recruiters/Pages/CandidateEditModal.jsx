import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Upload,
  Button,
  message,
  Tag,
  Space,
} from "antd";
import {
  UploadOutlined,
  PlusOutlined,
  LockOutlined,
  EyeOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import {
  countryMobileLimits,
  phoneUtils,
  countryInfo,
} from "../../utils/countryMobileLimits.js";

const { Option } = Select;
const { TextArea } = Input;

const CandidateEditModal = ({ visible, onCancel, onSubmit, candidate }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("91");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (candidate && visible) {
      // Parse full name into components
      const nameParts = candidate.fullName?.split(" ") || [];
      const firstName = nameParts[0] || "";
      const lastName =
        nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
      const middleName =
        nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";

      const { countryCode, phoneNumber: parsedPhone } = parsePhoneNumber(
        candidate.phone
      );
      setSelectedCountryCode(countryCode);
      setPhoneNumber(parsedPhone);

      form.setFieldsValue({
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        email: candidate.email,
        countryCode,
        phoneNumber: parsedPhone,
        title: candidate.title,
        location: candidate.location,
        totalExperienceYears: candidate.totalExperienceYears,
        candidateType: candidate.candidateType,
        accountStatus: candidate.accountStatus,
        noticePeriod: candidate.noticePeriod,
        industry: candidate.industry,
      });
      setSkills(candidate.skills || []);
    }
  }, [candidate, visible, form]);

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

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const {
        password,
        confirmPassword,
        firstName,
        middleName,
        lastName,
        countryCode,
        phoneNumber,
        ...restValues
      } = values;

      const fullName = [firstName, middleName, lastName]
        .filter(Boolean)
        .map((name) => name.trim())
        .join(" ");

      const fullPhoneNumber = phoneUtils.formatWithCountryCode(
        countryCode,
        phoneNumber
      );

      const updatedData = {
        ...restValues,
        firstName: firstName?.trim(),
        middleName: middleName?.trim() || "",
        lastName: lastName?.trim(),
        fullName,
        phone: fullPhoneNumber,
        skills,
        _id: candidate._id,
      };

      if (password) {
        updatedData.password = password;
      }

      await onSubmit(updatedData);
      form.resetFields();
      setSkills([]);
    } catch (error) {
      message.error("Failed to update candidate");
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill && !skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleCancel = () => {
    form.resetFields();
    setSkills([]);
    setNewSkill("");
    onCancel();
  };

  const validateConfirmPassword = (_, value) => {
    const password = form.getFieldValue("password");

    // If password is empty, confirm password can also be empty
    if (!password) {
      return Promise.resolve();
    }

    if (!value || password === value) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Passwords do not match!"));
  };

  return (
    <Modal
      title="Edit Candidate"
      open={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
        },
      }}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "Please enter first name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="middleName" label="Middle Name">
              <Input placeholder="Enter middle name (optional)" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Please enter last name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Please enter full name" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row> */}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter email" },
                { type: "email", message: "Please enter valid email" },
              ]}
            >
              <Input />
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
          <Col span={8}>
            <Form.Item name="title" label="Job Title">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="location" label="Location">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="totalExperienceYears" label="Experience (Years)">
              <Input type="number" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="candidateType" label="Candidate Type">
              <Select>
                <Option value="Khafalath">Khafalath</Option>
                <Option value="External">External</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="accountStatus" label="Account Status">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="noticePeriod" label="Notice Period">
              <Select>
                <Option value="Immediate">Immediate</Option>
                <Option value="1 Month">1 Month</Option>
                <Option value="2 Months">2 Months</Option>
                <Option value="3 Months">3 Months</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Skills">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space>
              <Input
                placeholder="Add new skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onPressEnter={addSkill}
              />
              <Button
                type="primary"
                style={{ background: "#da2c46" }}
                icon={<PlusOutlined />}
                onClick={addSkill}
              >
                Add
              </Button>
            </Space>
            <div>
              {skills.map((skill) => (
                <Tag
                  key={skill}
                  closable
                  onClose={() => removeSkill(skill)}
                  style={{ marginBottom: 4 }}
                >
                  {skill}
                </Tag>
              ))}
            </div>
          </Space>
        </Form.Item>

        <Form.Item name="industry" label="Industry">
          <Select mode="multiple" placeholder="Select industries">
            <Option value="Technology">Technology</Option>
            <Option value="Healthcare">Healthcare</Option>
            <Option value="Finance">Finance</Option>
            <Option value="Education">Education</Option>
            <Option value="Manufacturing">Manufacturing</Option>
            <Option value="Retail">Retail</Option>
            <Option value="Consulting">Consulting</Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Password"
              name="password"
              rules={[
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
              rules={[{ validator: validateConfirmPassword }]}
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

export default CandidateEditModal;
