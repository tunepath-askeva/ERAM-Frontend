import React, { useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Row,
  Col,
  Card,
  Typography,
  Space,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  LockOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import PhoneInput from "../../Global/PhoneInput";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Option } = Select;
const { Title } = Typography;

const AdminFormModal = ({
  open,
  onCancel,
  onSubmit,
  branches = [],
  loading,
  mode = "add",
  title,
  initialValues = null,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        // Extract phone data with country code
        let phone = initialValues.phone || "";
        let phoneCountryCode = initialValues.phoneCountryCode || "";
        
        if (phone && !phoneCountryCode) {
          // Extract country code if not stored
          let phoneWithoutPlus = phone.trim();
          while (phoneWithoutPlus.startsWith("+")) {
            phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
          }
          const parsed = phoneUtils.parsePhoneNumber(phoneWithoutPlus);
          if (parsed.countryCode && parsed.phoneNumber) {
            phoneCountryCode = parsed.countryCode;
            phone = parsed.phoneNumber;
          } else {
            phoneCountryCode = "91"; // Default
          }
        } else if (phone && phoneCountryCode) {
          // Remove country code from phone if present
          let phoneWithoutPlus = phone.trim();
          while (phoneWithoutPlus.startsWith("+")) {
            phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
          }
          const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
          if (cleanPhone.startsWith(phoneCountryCode)) {
            phone = cleanPhone.slice(phoneCountryCode.length);
          } else {
            phone = cleanPhone;
          }
        }

        form.setFieldsValue({
          firstName: initialValues.firstName,
          lastName: initialValues.lastName,
          email: initialValues.email,
          phone: phone,
          phoneCountryCode: phoneCountryCode || "91",
          branchId: initialValues.branchId,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, mode, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      let payload;

      // Clean phone number and get country code
      const phoneNumber = values.phone ? values.phone.replace(/^\+/, "").replace(/\D/g, "") : "";
      const phoneCountryCode = values.phoneCountryCode || "91";

      if (mode === "edit") {
        payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          fullName: `${values.firstName} ${values.lastName}`,
          email: values.email,
          branchId: values.branchId,
          phone: phoneNumber, // Phone number without country code
          phoneCountryCode: phoneCountryCode, // Country code sent separately
        };

        if (values.password && values.password.trim() !== "") {
          payload.cPassword = values.password;
        }

        payload.adminId = initialValues.id;
      } else {
        payload = {
          firstName: values.firstName,
          lastName: values.lastName,
          fullName: `${values.firstName} ${values.lastName}`,
          role: "admin",
          email: values.email,
          branchId: values.branchId,
          phone: phoneNumber, // Phone number without country code
          phoneCountryCode: phoneCountryCode, // Country code sent separately
          cPassword: values.password,
        };
      }

      await onSubmit(payload);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      const password = getFieldValue("password");

      if (mode === "edit" && !password && !value) {
        return Promise.resolve();
      }

      if (!value || password === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("Passwords do not match!"));
    },
  });

  return (
    <Modal
      title={
        <Space>
          {mode === "add" ? <PlusOutlined /> : <SaveOutlined />}
          {title}
        </Space>
      }
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okButtonProps={{
        style: {
          background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
        },
      }}
      confirmLoading={loading}
      width={700}
      okText={mode === "add" ? "Create Admin" : "Save Changes"}
      cancelText="Cancel"
      destroyOnClose={true}
      styles={{
        body: { maxHeight: "70vh", overflowY: "auto" },
      }}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Card
          size="small"
          title={
            <Space>
              <UserOutlined />
              <span>Basic Information</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  { required: true, message: "Please enter first name" },
                  {
                    min: 2,
                    message: "First name must be at least 2 characters",
                  },
                  {
                    pattern: /^[a-zA-Z\s]+$/,
                    message: "First name should only contain letters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter first name"
                  prefix={<UserOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  { required: true, message: "Please enter last name" },
                  {
                    min: 2,
                    message: "Last name must be at least 2 characters",
                  },
                  {
                    pattern: /^[a-zA-Z\s]+$/,
                    message: "Last name should only contain letters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter last name"
                  prefix={<UserOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email Address"
                name="email"
                rules={[
                  { required: true, message: "Please enter email address" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  placeholder="admin@company.com"
                  prefix={<MailOutlined />}
                  size="large"
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
        </Card>

        <Card
          size="small"
          title={
            <Space>
              <BankOutlined />
              <span>Branch Assignment</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            label="Assign Branch"
            name="branchId"
            rules={[{ required: true, message: "Please select a branch" }]}
          >
            <Select
              placeholder="Select branch"
              size="large"
              showSearch
              optionFilterProp="searchLabel"
              allowClear
              filterOption={(input, option) =>
                option?.searchLabel?.includes(input.toLowerCase())
              }
              options={branches.map((branch) => ({
                label: (
                  <Space>
                    <BankOutlined />
                    <span>{branch.name}</span>
                    <span style={{ color: "#666", fontSize: "12px" }}>
                      ({branch.branchCode})
                    </span>
                  </Space>
                ),
                value: branch._id,
                // plain text for search
                searchLabel:
                  `${branch.name} ${branch.branchCode}`.toLowerCase(),
              }))}
            />
          </Form.Item>
        </Card>

        {/* Security Section */}
        <Card
          size="small"
          title={
            <Space>
              <LockOutlined />
              <span>Security</span>
              {mode === "edit" && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    fontWeight: "normal",
                  }}
                >
                  (Leave blank to keep current password)
                </span>
              )}
            </Space>
          }
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: mode === "add",
                    message: "Please enter password",
                  },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters",
                  },
                  {
                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
                  },
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder={
                    mode === "edit"
                      ? "Enter new password (optional)"
                      : "Enter password"
                  }
                  prefix={<LockOutlined />}
                  size="large"
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
                    required: mode === "add",
                    message: "Please confirm password",
                  },
                  validateConfirmPassword,
                ]}
                hasFeedback
              >
                <Input.Password
                  placeholder={
                    mode === "edit"
                      ? "Confirm new password"
                      : "Confirm password"
                  }
                  prefix={<LockOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </Modal>
  );
};

export default AdminFormModal;
