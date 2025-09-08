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
  Button,
  Divider,
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
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SettingOutlined,
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
  "Employee Admin",
  "HR Admin",
  "HR",
  "Visa",
  "Vehicle",
  "Airticket",
  "Agency",
  "Co-Ordinator",
  "Co-Ordinator Admin",
  "Sales",
];

// Grouped permissions for better organization
const permissionGroups = [
  {
    title: "Side Navigation Tabs",
    icon: <DashboardOutlined />,
    permissions: [
      { key: "dashboard", label: "Dashboard" },
      { key: "jobs", label: "Jobs" },
      { key: "jobs-timeline", label: "Jobs Timeline" },
      { key: "all-candidates", label: "All Candidates" },
      { key: "candidates", label: "Interview Candidates" },
      { key: "interviews", label: "Assigned Interviews" },
      { key: "staged-candidates", label: "Staged Candidates" },
      { key: "completed-candidates", label: "Completed Candidates" },
      { key: "approvals", label: "Approvals" },
      { key: "employees", label: "Employees" },
      { key: "notifications", label: "Notifications" },
      { key: "requisition", label: "Requisition" },
    ],
  },
  {
    title: "Job Management",
    icon: <FileTextOutlined />,
    permissions: [
      { key: "edit-job", label: "Edit Job" },
      { key: "deactivate-job", label: "Deactivate/Activate Job" },
      { key: "view-job-sourced", label: "View Sourced Candidates" },
      { key: "view-job-selected", label: "View Selected Candidates" },
      { key: "view-job-applied", label: "View Applied Candidates" },
      { key: "view-job-declined", label: "View Declined Candidates" },
      { key: "view-job-pending", label: "View Pending Candidates" },
      { key: "view-job-screening", label: "View Screening Candidates" },
      { key: "view-job-status", label: "View Work Order Status" },
      { key: "edit-requisitions", label: "Edit Requisition" },
      { key: "add-requisitions", label: "Add Requisition" },
      { key: "delete-requisitions", label: "Delete Requisition" },
    ],
  },
  {
    title: "Candidate Management",
    icon: <TeamOutlined />,
    permissions: [
      { key: "view-candidates", label: "View Candidates" },
      { key: "add-candidate", label: "Add Candidate" },
      { key: "bulk-upload", label: "Bulk Upload Candidates" },
      { key: "edit-candidate-details", label: "Edit Candidate" },
      { key: "download-documents", label: "Download Documents" },
      { key: "send-messages", label: "Send Messages" },
      { key: "view-profile", label: "View Candidate Profile" },
      { key: "notify-candidate", label: "Notify Candidate" },
    ],
  },
  {
    title: "Candidate Actions",
    icon: <SettingOutlined />,
    permissions: [
      { key: "move-to-interview", label: "Move to Interview" },
      { key: "make-offer", label: "Make Offer" },
      { key: "move-to-offer", label: "Move to Offer" },
      { key: "move-to-pipeline", label: "Move to Pipeline" },
      { key: "convert-to-employee", label: "Convert to Employee" },
      { key: "reject-candidate", label: "Reject Candidate" },
    ],
  },
  {
    title: "Interview Management",
    icon: <CalendarOutlined />,
    permissions: [
      { key: "schedule-interview", label: "Schedule Interview" },
      { key: "reschedule-interview", label: "Reschedule Interview" },
      { key: "view-interviews", label: "View Interviews" },
      { key: "change-interview-status", label: "Change Interview Status" },
    ],
  },
  {
    title: "Tab Views",
    icon: <FileTextOutlined />,
    permissions: [
      { key: "view-all-tab", label: "View All Tab" },
      { key: "view-completed-tab", label: "View Completed Tab" },
      { key: "view-interview-tab", label: "View Interview Tab" },
      { key: "view-offer-tab", label: "View Offer Tab" },
      { key: "view-rejected-tab", label: "View Rejected Tab" },
      { key: "view-overview-tab", label: "View Overview Tab" },
      { key: "view-activity-tab", label: "View Activity Tab" },
      { key: "view-documents-tab", label: "View Documents Tab" },
    ],
  },
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
  const [dynamicRecruiterTypes, setDynamicRecruiterTypes] =
    useState(recruiterTypes);

  const isLoading = isCreating || isEditing;

  const modalTitle =
    title || (mode === "edit" ? "Edit Recruiter" : "Add New Recruiter");

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initialValues) {
        // If the recruiter type from initialValues is not in the predefined list, add it
        if (
          initialValues.recruiterType &&
          !recruiterTypes.includes(initialValues.recruiterType)
        ) {
          setDynamicRecruiterTypes((prev) => [
            ...prev,
            initialValues.recruiterType,
          ]);
        }

        const experienceValue = initialValues.totalExperienceYears
          ? Number(initialValues.totalExperienceYears)
          : 0;

        form.setFieldsValue({
          fullName: initialValues.fullName || "",
          email: initialValues.email || "",
          phoneno: initialValues.phone || "",
          specialization: initialValues.specialization || "",
          experience: experienceValue || 0,
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
        recruiterType: values.recruiterType,
        permissions: Array.from(new Set([...(values.permissions || [])])),
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
    if (value && !dynamicRecruiterTypes.includes(value)) {
      setDynamicRecruiterTypes((prev) => [...prev, value]);
    }
  };

  // Handle group-level select all
  const handleGroupSelectAll = (groupPermissions, checked) => {
    const currentPermissions = form.getFieldValue("permissions") || [];
    const groupKeys = groupPermissions.map((p) => p.key);

    let newPermissions;
    if (checked) {
      // Add all group permissions
      newPermissions = Array.from(
        new Set([...currentPermissions, ...groupKeys])
      );
    } else {
      // Remove all group permissions
      newPermissions = currentPermissions.filter((p) => !groupKeys.includes(p));
    }

    form.setFieldsValue({ permissions: newPermissions });
  };

  // Check if all permissions in a group are selected
  const isGroupFullySelected = (groupPermissions) => {
    const currentPermissions = form.getFieldValue("permissions") || [];
    const groupKeys = groupPermissions.map((p) => p.key);
    return groupKeys.every((key) => currentPermissions.includes(key));
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
      width={1000}
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
                      setDynamicRecruiterTypes((prev) => [...prev, value]);
                      form.setFieldsValue({ recruiterType: value });
                    }
                  }}
                  onPressEnter={(e) => {
                    const value = e.target.value;
                    if (value && !dynamicRecruiterTypes.includes(value)) {
                      setDynamicRecruiterTypes((prev) => [...prev, value]);
                      form.setFieldsValue({ recruiterType: value });
                    }
                  }}
                  notFoundContent={null}
                  dropdownRender={(menu) => (
                    <div>
                      {menu}
                      <div
                        style={{
                          padding: "8px",
                          borderTop: "1px solid #f0f0f0",
                          fontSize: "12px",
                          color: "#666",
                        }}
                      >
                        💡 Tip: Type and press Enter or click away to add custom
                        type
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
              <Form.Item label="Specialization" name="specialization">
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

        {mode === "add" && (
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
        )}

        <Card
          size="small"
          title={
            <Space>
              <CheckCircleOutlined />
              <span>Access Permissions</span>
              <Button
                type="link"
                size="small"
                onClick={() => {
                  const allPermissions = permissionGroups.flatMap((group) =>
                    group.permissions.map((p) => p.key)
                  );
                  form.setFieldsValue({ permissions: allPermissions });
                }}
              >
                Select All
              </Button>
              <Button
                type="link"
                size="small"
                style={{ color: "#da2c46" }}
                onClick={() => {
                  form.setFieldsValue({ permissions: [] });
                }}
              >
                Deselect All
              </Button>
            </Space>
          }
        >
          <Form.Item name="permissions">
            <Checkbox.Group style={{ width: "100%", color: "#da2c46" }}>
              {permissionGroups.map((group, groupIndex) => (
                <div key={group.title} style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      marginBottom: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Space>
                      {group.icon}
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "14px",
                          color: "#da2c46",
                        }}
                      >
                        {group.title}
                      </span>
                    </Space>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        const isFullySelected = isGroupFullySelected(
                          group.permissions
                        );
                        handleGroupSelectAll(
                          group.permissions,
                          !isFullySelected
                        );
                      }}
                      style={{ padding: 0, height: "auto" }}
                    >
                      {isGroupFullySelected(group.permissions)
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <Row gutter={[12, 8]}>
                    {group.permissions.map((permission) => (
                      <Col span={8} key={permission.key}>
                        <Checkbox
                          value={permission.key}
                          style={{ fontSize: "13px" }}
                        >
                          {permission.label}
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                  {groupIndex < permissionGroups.length - 1 && (
                    <Divider style={{ margin: "16px 0 0 0" }} />
                  )}
                </div>
              ))}
            </Checkbox.Group>
          </Form.Item>
        </Card>
      </Form>
    </Modal>
  );
};

export default RecruiterForm;
