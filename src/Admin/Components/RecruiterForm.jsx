import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Card,
  Typography,
  Space,
  InputNumber,
  Select,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  BankOutlined,
  LockOutlined,
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  EnvironmentOutlined,
  StarOutlined,
  ToolOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  useCreateRecruiterMutation,
  useEditRecruiterMutation,
} from "../../Slices/Admin/AdminApis.js";
import { useSnackbar } from "notistack";

const { Title } = Typography;
const { Option } = Select;

const recruiterTypes = [
  "Recruiter",
  "Admin Recruiter",
  "HR",
  "Visa",
  "Vehicle",
  "Airticket",
  "Agency",
  "Co-Ordinator",
  "Co-Ordinator Admin",
];

const accessPermissions = [
  { key: "dashboard", label: "Dashboard" },
  { key: "jobs", label: "Jobs" },
  { key: "candidates", label: "Candidates" },
  { key: "staged-candidates", label: "Staged Candidates" },
  { key: "approvals", label: "Approvals" },
  { key: "employees", label: "Employees" },
  { key: "payroll", label: "Payroll" },
];

const RecruiterForm = ({
  open,
  onCancel,
  onSuccess,
  mode = "add",
  title,
  initialValues = null,
  recruiterId = null,
}) => {
  const [form] = Form.useForm();
  const [createRecruiter, { isLoading: isCreating }] =
    useCreateRecruiterMutation();
  const [editRecruiter, { isLoading: isEditing }] = useEditRecruiterMutation();
  const { enqueueSnackbar } = useSnackbar();
  
  // State to manage dynamic recruiter types
  const [dynamicRecruiterTypes, setDynamicRecruiterTypes] = useState(recruiterTypes);

  const isLoading = isCreating || isEditing;

  const modalTitle =
    title || (mode === "edit" ? "Edit Recruiter" : "Add New Recruiter");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        // If the recruiter type from initialValues is not in the predefined list, add it
        if (initialValues.recruiterType && !recruiterTypes.includes(initialValues.recruiterType)) {
          setDynamicRecruiterTypes(prev => [...prev, initialValues.recruiterType]);
        }
        
        form.setFieldsValue({
          fullName: initialValues.fullName || "",
          email: initialValues.email || "",
          phoneno: initialValues.phone || "",
          specialization: initialValues.specialization || "",
          experience: initialValues.experience || 0,
          recruiterType: initialValues.recruiterType || "Recruiter",
          permissions: initialValues.permissions || [],
        });
      } else {
        form.resetFields();
        // Reset dynamic types when adding new recruiter
        setDynamicRecruiterTypes(recruiterTypes);
      }
    }
  }, [open, mode, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        fullName: values.fullName,
        email: values.email,
        phoneno: values.phoneno,
        specialization: values.specialization,
        experience: values.experience,
        recruiterType: values.recruiterType, // This will now be a string
        permissions: values.permissions || [],
        role: "recruiter",
      };

      if (mode === "add") {
        payload.password = values.password;
      } else if (mode === "edit" && values.password) {
        payload.password = values.password;
      }

      let result;
      if (mode === "edit") {
        result = await editRecruiter({
          id: recruiterId,
          ...payload,
        }).unwrap();
        enqueueSnackbar("Recruiter updated successfully!", {
          variant: "success",
        });
      } else {
        result = await createRecruiter(payload).unwrap();
        enqueueSnackbar("Recruiter created successfully!", {
          variant: "success",
        });
      }

      form.resetFields();

      if (onSuccess) {
        onSuccess(result);
      }

      onCancel();
    } catch (error) {
      console.error("Failed to save recruiter:", error);
      const errorMessage =
        error?.data?.message ||
        (mode === "edit"
          ? "Failed to update recruiter"
          : "Failed to create recruiter");
      enqueueSnackbar(errorMessage, {
        variant: "error",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setDynamicRecruiterTypes(recruiterTypes);
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

  // Handle custom recruiter type selection
  const handleRecruiterTypeChange = (value) => {
    // If the selected value is not in the current options, add it
    if (value && !dynamicRecruiterTypes.includes(value)) {
      setDynamicRecruiterTypes(prev => [...prev, value]);
    }
  };

  return (
    <Modal
      title={
        <Space>
          {mode === "edit" ? <EditOutlined /> : <PlusOutlined />}
          {modalTitle}
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
      confirmLoading={isLoading}
      width={800}
      okText={mode === "add" ? "Create Recruiter" : "Update Recruiter"}
      cancelText="Cancel"
      destroyOnClose={true}
    >
      <Form form={form} layout="vertical" autoComplete="off">
        <Card
          size="small"
          title={
            <Space>
              <UserOutlined />
              <span>Personal Information</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[
                  { required: true, message: "Please enter full name" },
                  {
                    min: 2,
                    message: "Full name must be at least 2 characters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter recruiter's full name"
                  prefix={<UserOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Recruiter Type"
                name="recruiterType"
                rules={[
                  { required: true, message: "Please select recruiter type" },
                ]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Select or type recruiter type"
                  size="large"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={handleRecruiterTypeChange}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && !dynamicRecruiterTypes.includes(value)) {
                      setDynamicRecruiterTypes(prev => [...prev, value]);
                      form.setFieldsValue({ recruiterType: value });
                    }
                  }}
                  onPressEnter={(e) => {
                    const value = e.target.value;
                    if (value && !dynamicRecruiterTypes.includes(value)) {
                      setDynamicRecruiterTypes(prev => [...prev, value]);
                      form.setFieldsValue({ recruiterType: value });
                    }
                  }}
                  notFoundContent={null}
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <div
                        style={{
                          padding: '8px',
                          borderTop: '1px solid #f0f0f0',
                          fontSize: '12px',
                          color: '#666',
                        }}
                      >
                        💡 Tip: Type and press Enter or click away to add custom type
                      </div>
                    </div>
                  )}
                >
                  {dynamicRecruiterTypes.map((type) => (
                    <Option key={type} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          title={
            <Space>
              <UserOutlined />
              <span>Contact Information</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
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
                  placeholder="recruiter@company.com"
                  prefix={<MailOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phoneno"
                rules={[
                  { required: true, message: "Please enter phone number" },
                  {
                    pattern: /^[+]?[0-9\s-()]+$/,
                    message: "Please enter a valid phone number",
                  },
                ]}
              >
                <Input
                  placeholder="+91 98765 43210"
                  prefix={<PhoneOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          title={
            <Space>
              <ToolOutlined />
              <span>Professional Information</span>
            </Space>
          }
          style={{ marginBottom: mode === "add" ? 16 : 0 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Specialization"
                name="specialization"
                rules={[
                  { required: true, message: "Please enter specialization" },
                ]}
              >
                <Input
                  placeholder="e.g., IT, Healthcare, Finance"
                  prefix={<BankOutlined />}
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Experience (Years)"
                name="experience"
                rules={[
                  { required: true, message: "Please enter experience" },
                  {
                    type: "number",
                    min: 0,
                    max: 50,
                    message: "Experience must be between 0 and 50 years",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Years of experience"
                  style={{ width: "100%" }}
                  size="large"
                  min={0}
                  max={50}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

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
                  (Leave empty to keep current password)
                </span>
              )}
            </Space>
          }
          style={{ marginBottom: 16 }}
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

        <Card
          size="small"
          title={
            <Space>
              <CheckCircleOutlined />
              <span>Access Permissions</span>
            </Space>
          }
        >
          <Form.Item name="permissions">
            <Checkbox.Group style={{ width: "100%" }}>
              <Row gutter={[16, 16]}>
                {accessPermissions.map((permission) => (
                  <Col span={8} key={permission.key}>
                    <Checkbox value={permission.key}>
                      {permission.label}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
};

export default RecruiterForm;