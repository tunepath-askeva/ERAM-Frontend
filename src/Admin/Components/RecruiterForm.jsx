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
  useAddCustomMemberTypesMutation,
  useCreateRecruiterMutation,
  useEditRecruiterMutation,
  useGetMemberTypesQuery,
} from "../../Slices/Admin/AdminApis.js";
import { useSnackbar } from "notistack";
import PhoneInput from "../../Global/PhoneInput.jsx";
import { phoneUtils } from "../../utils/countryMobileLimits.js";

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

const permissionGroups = [
  {
    title: "Side Navigation Tabs",
    icon: <DashboardOutlined />,
    permissions: [
      { key: "dashboard", label: "Dashboard" },
      { key: "requisition", label: "Requisition" },
      { key: "jobs", label: "Jobs" },
      { key: "jobs-timeline", label: "Jobs Timeline" },
      { key: "all-candidates", label: "All Candidates" },
      { key: "all-cvs", label: "All CVs" },
      { key: "candidates", label: "Interview Candidates" },
      { key: "interviews", label: "Assigned Interviews" },
      { key: "staged-candidates", label: "Staged Candidates" },
      { key: "completed-candidates", label: "Completed Candidates" },
      { key: "approvals", label: "Approvals" },
      { key: "employees", label: "Employees" },
      { key: "notifications", label: "Notifications" },
    ],
  },
  {
    title: "Requisition Management",
    icon: <FileTextOutlined />,
    permissions: [
      { key: "edit-requisitions", label: "Edit Requisition" },
      { key: "add-requisitions", label: "Add Requisition" },
      { key: "delete-requisitions", label: "Delete Requisition" },
    ],
  },
  {
    title: "Job Management",
    icon: <FileTextOutlined />,
    permissions: [
      { key: "edit-job", label: "Edit Job" },
      { key: "deactivate-job", label: "Deactivate/Activate Job" },
      { key: "view-job-status", label: "View Work Order Status Tab" },
      { key: "view-job-sourced", label: "View Sourced Candidates Tab" },
      { key: "view-job-sourced-cv", label: "View Sourced CVs Tab" },
      { key: "view-job-selected", label: "View Selected Candidates Tab" },
      // { key: "view-job-selected", label: "View Selected Candidates Tab" },
      { key: "view-job-applied", label: "View Applied Candidates Tab" },
      { key: "view-job-applied-cv", label: "View Applied CVs Tab" },
      { key: "view-job-declined", label: "View Declined Candidates Tab" },
      { key: "view-job-pending", label: "View Pending Candidates Tab" },
      { key: "view-job-screening", label: "View Screening Candidates Tab" },
    ],
  },
  {
    title: "Candidate Management",
    icon: <TeamOutlined />,
    permissions: [
      { key: "view-all-candidates", label: "View All Candidates" },
      { key: "view-candidates", label: "View Candidates Icon" },
      { key: "add-candidate", label: "Add Candidate" },
      { key: "bulk-upload", label: "Bulk Upload Candidates" },
      { key: "edit-candidate-details", label: "Edit Candidate" },
    ],
  },
  {
    title: "CVs Management",
    icon: <TeamOutlined />,
    permissions: [
      { key: "view-cv", label: "View CV" },
      { key: "convert-candidate", label: "Convert CV to Candidate" },
      { key: "download-cv", label: "Download CV" },
      { key: "delete-cv", label: "Delete CV" },
    ],
  },
  {
    title: "Interview Candidate Actions",
    icon: <TeamOutlined />,
    permissions: [
      { key: "download-documents", label: "Download Documents" },
      { key: "send-messages", label: "Send Messages" },
      { key: "view-profile", label: "View Candidate Profile" },
      { key: "move-to-interview", label: "Move to Interview" },
      { key: "make-offer", label: "Make Offer" },
      { key: "move-to-offer", label: "Move to Offer" },
      { key: "move-to-pipeline", label: "Move to Pipeline" },
      { key: "reject-candidate", label: "Reject Candidate" },
      { key: "schedule-interview", label: "Schedule Interview" },
      { key: "reschedule-interview", label: "Reschedule Interview" },
      { key: "view-interviews", label: "View Interviews" },
      { key: "change-interview-status", label: "Change Interview Status" },
    ],
  },
  {
    title: "Completed Candidate Actions",
    icon: <SettingOutlined />,
    permissions: [{ key: "convert-to-employee", label: "Convert to Employee" }],
  },
  {
    title: "Staged Candidate Actions",
    icon: <SettingOutlined />,
    permissions: [{ key: "notify-candidate", label: "Notify Candidate" }],
  },
  {
    title: "Tab Views for Interview candidates",
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
  const [customMemberTypes] = useAddCustomMemberTypesMutation();
  const {
    data: memberTypesData,
    refetch: refetchMemberTypes,
    isFetching,
  } = useGetMemberTypesQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { enqueueSnackbar } = useSnackbar();

  const [dynamicRecruiterTypes, setDynamicRecruiterTypes] = useState([]);
  const [isLoadingMemberTypes, setIsLoadingMemberTypes] = useState(false);

  const isLoading = isCreating || isEditing;

  const modalTitle =
    title || (mode === "edit" ? "Edit Member" : "Add New Member");

  useEffect(() => {
    if (memberTypesData) {
      const apiMemberTypes = memberTypesData.map((item) => item.name);
      const allTypes = [...recruiterTypes, ...apiMemberTypes];
      setDynamicRecruiterTypes(Array.from(new Set(allTypes)));
    } else {
      setDynamicRecruiterTypes(recruiterTypes);
    }
  }, [memberTypesData]);

  useEffect(() => {
    if (open) {
      setIsLoadingMemberTypes(true);

      refetchMemberTypes()
        .then((res) => {
          setIsLoadingMemberTypes(false);

          // Merge default recruiter types with fetched API member types
          const apiMemberTypes = res.data?.map((item) => item.name) || [];
          const allTypes = [...recruiterTypes, ...apiMemberTypes];
          setDynamicRecruiterTypes(Array.from(new Set(allTypes)));

          if (mode === "edit" && initialValues) {
            // Ensure recruiter type exists in the options list
            if (
              initialValues.recruiterType &&
              !recruiterTypes.includes(initialValues.recruiterType) &&
              !apiMemberTypes.includes(initialValues.recruiterType)
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
              ...(initialValues.phone?.startsWith("+")
                ? (() => {
                    const { countryCode, phoneNumber } =
                      phoneUtils.parsePhoneNumber(initialValues.phone);
                    return {
                      phonenoCountryCode: countryCode || "91",
                      phoneno: phoneNumber || "",
                    };
                  })()
                : {
                    phonenoCountryCode: initialValues.phoneCountryCode || "91",
                    phoneno: initialValues.phone || "",
                  }),
              specialization: initialValues.specialization || "",
              experience: experienceValue || 0,
              recruiterType: initialValues.recruiterType || "Recruiter",
              permissions: initialValues.permissions || [],
            });
          } else {
            form.resetFields();
          }
        })
        .catch(() => {
          setIsLoadingMemberTypes(false);
          setDynamicRecruiterTypes(recruiterTypes);
        });
    }
  }, [open, mode, initialValues, form, refetchMemberTypes]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!recruiterTypes.includes(values.recruiterType)) {
        try {
          await customMemberTypes({ name: values.recruiterType });
        } catch (err) {
          console.error("Failed to save custom type", err);
        }
      }
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phoneno: values.phonenoCountryCode
          ? `+${values.phonenoCountryCode}${values.phoneno}`
          : values.phoneno,
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
      okText={mode === "add" ? "Create Member" : "Update Member"}
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
                label="Member Type"
                name="recruiterType"
                rules={[
                  { required: true, message: "Please select member type" },
                ]}
              >
                <Select
                  showSearch
                  allowClear
                  placeholder="Select or type member type"
                  size="large"
                  optionFilterProp="children"
                  loading={isLoadingMemberTypes || isFetching}
                  disabled={isLoadingMemberTypes || isFetching}
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
                  notFoundContent={isLoadingMemberTypes ? "Loading..." : null}
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
              <PhoneInput
                form={form}
                name="phoneno"
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Space>
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
                <span style={{ fontSize: "14px", fontWeight: 600 }}>
                  Access Permissions
                </span>
              </Space>
              <Space size="medium">
                <Button
                  type="primary"
                  ghost
                  size="small"
                  onClick={() => {
                    const allPermissions = permissionGroups.flatMap((group) =>
                      group.permissions.map((p) => p.key)
                    );
                    form.setFieldsValue({ permissions: allPermissions });
                  }}
                  style={{ borderRadius: "6px", fontSize: "12px" }}
                >
                  Select All
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    form.setFieldsValue({ permissions: [] });
                  }}
                  style={{ borderRadius: "6px", fontSize: "12px" }}
                >
                  Clear All
                </Button>
              </Space>
            </div>
          }
          style={{ marginBottom: 0 }}
        >
          <Form.Item name="permissions" style={{ marginBottom: 0 }}>
            <Checkbox.Group style={{ width: "100%" }}>
              <div
                style={{
                  maxHeight: "450px",
                  overflowY: "auto",
                  paddingRight: "8px",
                  scrollbarWidth: "thin",
                }}
              >
                <Row gutter={[16, 16]}>
                  {permissionGroups.map((group) => (
                    <Col span={24} key={group.title}>
                      <div
                        style={{
                          borderRadius: "8px",
                          padding: "16px",
                          border: "1px solid #e9ecef",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        }}
                      >
                        {/* Group Header */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                            paddingBottom: "8px",
                            borderBottom: "2px solid #dee2e6",
                          }}
                        >
                          <Space>
                            <div
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "8px",
                                backgroundColor: "#fde8e3ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#da2c46",
                                fontSize: "16px",
                              }}
                            >
                              {group.icon}
                            </div>
                            <div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  color: "#212529",
                                  marginBottom: "2px",
                                }}
                              >
                                {group.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#6c757d",
                                }}
                              >
                                {group.permissions.length} permission
                                {group.permissions.length !== 1 ? "s" : ""}
                              </div>
                            </div>
                          </Space>
                          <Form.Item
                            noStyle
                            shouldUpdate={(prev, cur) =>
                              prev.permissions !== cur.permissions
                            }
                          >
                            {({ getFieldValue }) => {
                              const currentPermissions =
                                getFieldValue("permissions") || [];
                              const groupKeys = group.permissions.map(
                                (p) => p.key
                              );
                              const isFullySelected = groupKeys.every((key) =>
                                currentPermissions.includes(key)
                              );

                              return (
                                <Button
                                  type="text"
                                  size="small"
                                  onClick={() =>
                                    handleGroupSelectAll(
                                      group.permissions,
                                      !isFullySelected
                                    )
                                  }
                                  style={{
                                    backgroundColor: isFullySelected
                                      ? "#fff2f0"
                                      : "#f0f9ff",
                                    color: isFullySelected
                                      ? "#cf1322"
                                      : "#0958d9",
                                    border: `1px solid ${
                                      isFullySelected ? "#ffccc7" : "#bae0ff"
                                    }`,
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    padding: "4px 12px",
                                    height: "auto",
                                  }}
                                >
                                  {isFullySelected
                                    ? "Deselect All"
                                    : "Select All"}
                                </Button>
                              );
                            }}
                          </Form.Item>
                        </div>

                        {/* Permissions List */}
                        <Row gutter={[8, 8]}>
                          {group.permissions.map((permission) => (
                            <Col
                              key={permission.key}
                              span={
                                group.permissions.length === 1
                                  ? 24
                                  : group.permissions.length === 2
                                  ? 12
                                  : group.permissions.length <= 4
                                  ? 12
                                  : 8
                              }
                            >
                              <div
                                className="custom-checkbox"
                                style={{
                                  backgroundColor: "#ffffff",
                                  border: "1px solid #e9ecef",
                                  borderRadius: "6px",
                                  padding: "8px 12px",
                                  minHeight: "36px",
                                  display: "flex",
                                  alignItems: "center",
                                  transition: "all 0.2s ease",
                                  cursor: "pointer",
                                  ":hover": {
                                    borderColor: "#da2c46",
                                    boxShadow: "0 2px 4px rgba(24,144,255,0.1)",
                                  },
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = "#da2c46";
                                  e.currentTarget.style.boxShadow =
                                    "0 2px 4px rgba(24,144,255,0.1)";
                                  e.currentTarget.style.transform =
                                    "translateY(-1px)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "#e9ecef";
                                  e.currentTarget.style.boxShadow = "none";
                                  e.currentTarget.style.transform =
                                    "translateY(0)";
                                }}
                              >
                                <Checkbox
                                  value={permission.key}
                                  style={{ width: "100%" }}
                                >
                                  <span
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: 500,
                                      color: "#495057",
                                      marginLeft: "8px",
                                      lineHeight: "1.4",
                                    }}
                                  >
                                    {permission.label}
                                  </span>
                                </Checkbox>
                              </div>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </Col>
                  ))}
                </Row>
              </div>
            </Checkbox.Group>
          </Form.Item>
        </Card>
      </Form>

      <style jsx>
        {`
          .custom-checkbox .ant-checkbox-checked .ant-checkbox-inner {
            background-color: #da2c46 !important;
            border-color: #da2c46 !important;
          }

          .custom-checkbox .ant-checkbox-input:focus + .ant-checkbox-inner {
            border-color: #da2c46 !important;
            box-shadow: 0 0 0 2px rgba(218, 44, 70, 0.2);
          }
        `}
      </style>
    </Modal>
  );
};

export default RecruiterForm;
