import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  message,
  Spin,
  Alert,
} from "antd";
import { UserAddOutlined, EditOutlined } from "@ant-design/icons";
import { useGetRecruitersNameQuery } from "../../Slices/Admin/AdminApis";
import { useUpdateEmployeeEmailMutation } from "../../Slices/Recruiter/RecruiterApis";
import { useSnackbar } from "notistack";

const { TextArea } = Input;
const { Option } = Select;

const ATTRITION_TYPES = [
  "Resignation",
  "Personal Reasons",
  "Relocation",
  "End of Contract",
  "By Project/Client",
  "Non Renewal",
  "Probation unsatisfactory",
  "Article 80",
  "Project Completion",
  "Temporary Assignment End",
  "Termination - Performance Issues",
  "Termination - Policy Violation",
  "Termination - Misconduct",
  "Layoff / Redundancy",
  "Role Elimination",
  "Early Retirement",
  "Medical Retirement",
  "Unauthorized Absence",
  "Absconding / Job Abandonment",
  "Internal Transfer",
  "Promotion to Other Group Company",
  "Department Change",
  "Contract End",
  "Immediate Termination",
  "Death",
  "Poor Performance",
  "Failure to Meet KPIs",
  "Probation Not Confirmed",
  "Other",
];

const MoveToAttritionModal = ({
  visible,
  onCancel,
  onSubmit,
  employee,
  isLoading,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  // Fetch admin users for approver selection
  const { data: adminUsers, isLoading: loadingAdmins } =
    useGetRecruitersNameQuery();

  // Email update mutation
  const [updateEmail, { isLoading: isUpdatingEmail }] =
    useUpdateEmployeeEmailMutation();

  useEffect(() => {
    if (visible && employee) {
      form.setFieldsValue({
        employeeId: employee._id,
        employeeName: employee.fullName,
        eramId: employee.employmentDetails?.eramId || "N/A",
        noticePeriodServed: "N/A",
      });
      setNewEmail(employee.email);
    }
  }, [visible, employee, form]);

  const handleAttritionTypeChange = (value) => {
    setShowOtherInput(value === "Other");
    if (value !== "Other") {
      form.setFieldValue("otherAttritionType", undefined);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
      return false;
    }
    if (email === employee?.email) {
      setEmailError("New email must be different from current email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleEmailUpdate = async () => {
    if (!validateEmail(newEmail)) {
      return;
    }

    try {
      const result = await updateEmail({
        employeeId: employee._id,
        newEmail: newEmail.trim(),
      }).unwrap();

      enqueueSnackbar(result.message || "Email updated successfully", {
        variant: "success",
      });

      setIsEditingEmail(false);
      setEmailError("");

      handleCancel();
    } catch (error) {
      if (error?.data?.message) {
        enqueueSnackbar(error.data.message, {
          variant: "error",
        });
      } else {
        enqueueSnackbar("Failed to update email", {
          variant: "error",
        });
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Format the data for API
      const attritionData = {
        attritionType: values.attritionType,
        otherAttritionType: values.otherAttritionType,
        reason: values.reason,
        lastWorkingDate: values.lastWorkingDate?.format("YYYY-MM-DD"),
        projectName: values.projectName,
        noticePeriodServed: values.noticePeriodServed,
        hrRemarks: values.hrRemarks,
        approvers: values.approvers, // Array of approver IDs
        notifyRecruiters: values.notifyRecruiters || [], // NEW: Array of recruiter IDs to notify
      };

      await onSubmit(attritionData);
      form.resetFields();
      setShowOtherInput(false);
      setIsEditingEmail(false);
      setNewEmail("");
      setEmailError("");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setShowOtherInput(false);
    setIsEditingEmail(false);
    setNewEmail("");
    setEmailError("");
    onCancel();
  };

  // Filter out employee admins for approvers
  const adminApprovers = adminUsers?.recruitername?.filter(
    (admin) => admin.recruiterType === "Employee Admin"
  );

  // Filter recruiters for notification (excluding Employee Admins)
  const recruitersForNotification = adminUsers?.recruitername?.filter(
    (recruiter) => recruiter.recruiterType !== "Employee Admin"
  );

  return (
    <Modal
      title={
        <Space>
          <UserAddOutlined style={{ color: "#da2c46" }} />
          <span style={{ color: "#da2c46" }}>Move to Attrition</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={isLoading}
          disabled={isEditingEmail}
          style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
        >
          Initiate Attrition Process
        </Button>,
      ]}
    >
      <Spin spinning={isLoading || loadingAdmins}>
        <Form form={form} layout="vertical" requiredMark="optional">
          {/* Employee Information with Email Edit */}
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: "6px",
              marginBottom: "24px",
            }}
          >
            <h4 style={{ marginBottom: "12px", color: "#da2c46" }}>
              Employee Information
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  Employee Name
                </div>
                <div style={{ fontWeight: 500 }}>{employee?.fullName}</div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#888" }}>ERAM ID</div>
                <div style={{ fontWeight: 500 }}>
                  {employee?.employmentDetails?.eramId || "N/A"}
                </div>
              </div>

              {/* Email Section with Edit */}
              <div style={{ gridColumn: "1 / -1" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#888",
                    marginBottom: "4px",
                  }}
                >
                  Email
                </div>
                {isEditingEmail ? (
                  <div>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Space style={{ width: "100%" }}>
                        <Input
                          value={newEmail}
                          onChange={(e) => {
                            setNewEmail(e.target.value);
                            setEmailError("");
                          }}
                          placeholder="Enter new email"
                          style={{ width: 300 }}
                          status={emailError ? "error" : ""}
                        />
                        <Button
                          size="small"
                          type="primary"
                          onClick={handleEmailUpdate}
                          loading={isUpdatingEmail}
                          style={{
                            backgroundColor: "#52c41a",
                            borderColor: "#52c41a",
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setIsEditingEmail(false);
                            setNewEmail(employee?.email || "");
                            setEmailError("");
                          }}
                        >
                          Cancel
                        </Button>
                      </Space>
                      {emailError && (
                        <div style={{ color: "#ff4d4f", fontSize: "12px" }}>
                          {emailError}
                        </div>
                      )}
                    </Space>
                  </div>
                ) : (
                  <Space>
                    <div style={{ fontWeight: 500 }}>{employee?.email}</div>
                    <Button
                      size="small"
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => setIsEditingEmail(true)}
                      style={{ padding: 0 }}
                    >
                      Edit Email
                    </Button>
                  </Space>
                )}
              </div>

              {/* Show Previous Email if exists */}
              {employee?.previousEmail && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    Previous Email
                  </div>
                  <div style={{ fontSize: "13px", color: "#8c8c8c" }}>
                    {employee.previousEmail}
                    {employee.emailChangedAt && (
                      <span style={{ marginLeft: "8px", fontSize: "11px" }}>
                        (Changed on{" "}
                        {new Date(employee.emailChangedAt).toLocaleDateString()}
                        )
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  Unique Code
                </div>
                <div style={{ fontWeight: 500 }}>
                  {employee?.uniqueCode || "N/A"}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#888" }}>Job Title</div>
                <div style={{ fontWeight: 500 }}>
                  {employee?.employmentDetails?.assignedJobTitle || "N/A"}
                </div>
              </div>
              {employee?.employmentDetails?.department && (
                <div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    Department
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {employee.employmentDetails.department}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Alert if email is being edited */}
          {isEditingEmail && (
            <Alert
              message="Email Edit Mode"
              description="Please save or cancel email changes before submitting the attrition form."
              type="info"
              showIcon
              style={{ marginBottom: "16px" }}
            />
          )}

          {/* Attrition Type */}
          <Form.Item
            name="attritionType"
            label="Attrition Type"
            rules={[
              { required: true, message: "Please select attrition type" },
            ]}
          >
            <Select
              placeholder="Select attrition type"
              onChange={handleAttritionTypeChange}
              showSearch
              optionFilterProp="children"
            >
              {ATTRITION_TYPES.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Other Attrition Type (if "Other" is selected) */}
          {showOtherInput && (
            <Form.Item
              name="otherAttritionType"
              label="Specify Other Attrition Type"
              rules={[
                {
                  required: true,
                  message: "Please specify the attrition type",
                },
              ]}
            >
              <Input placeholder="Enter attrition type" />
            </Form.Item>
          )}

          {/* Reason */}
          <Form.Item
            name="reason"
            label="Reason"
            rules={[
              { required: true, message: "Please provide a reason" },
              { min: 10, message: "Reason must be at least 10 characters" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Provide detailed reason for attrition"
            />
          </Form.Item>

          {/* Last Working Date */}
          <Form.Item
            name="lastWorkingDate"
            label="Last Working Date (LWD)"
            rules={[
              { required: true, message: "Please select last working date" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="DD-MM-YYYY" />
          </Form.Item>

          {/* Project Name */}
          <Form.Item name="projectName" label="Project Name">
            <Input placeholder="Enter project name (if applicable)" />
          </Form.Item>

          {/* Notice Period Served */}
          <Form.Item
            name="noticePeriodServed"
            label="Notice Period Served"
            rules={[
              {
                required: true,
                message: "Please select notice period status",
              },
            ]}
          >
            <Select placeholder="Select notice period status">
              <Option value="Yes">Yes</Option>
              <Option value="No">No</Option>
              <Option value="N/A">N/A</Option>
            </Select>
          </Form.Item>

          {/* HR Remarks */}
          <Form.Item name="hrRemarks" label="HR Remarks">
            <TextArea rows={3} placeholder="Additional HR remarks (optional)" />
          </Form.Item>

          {/* Approvers Selection */}
          <Form.Item
            name="approvers"
            label="Select Approvers (Required)"
            rules={[
              {
                required: true,
                message: "Please select at least one approver",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select admin users who need to approve"
              loading={loadingAdmins}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {adminApprovers?.map((admin) => (
                <Option key={admin._id} value={admin._id}>
                  {admin.fullName} ({admin.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="notifyRecruiters"
            label="Notify Recruiters (Optional)"
            tooltip="Select recruiters who should be notified but don't need to approve"
          >
            <Select
              mode="multiple"
              placeholder="Select recruiters to notify about this attrition"
              loading={loadingAdmins}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {adminApprovers?.map((admin) => (
                <Option key={admin._id} value={admin._id}>
                  {admin.fullName} ({admin.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Hidden Fields */}
          <Form.Item name="employeeId" hidden>
            <Input />
          </Form.Item>
        </Form>

        {/* Information Note */}
        <div
          style={{
            backgroundColor: "#fff7e6",
            border: "1px solid #ffd591",
            padding: "12px",
            borderRadius: "6px",
            marginTop: "16px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#8c8c8c" }}>
            <strong>Note:</strong> Once initiated, the employee will be moved to
            "Exit Initiated" status. The selected approvers will receive
            detailed approval requests, and selected recruiters will be notified
            for information. After all approvals are received, you can convert
            the employee back to a candidate. The employee can still login to
            download documents.
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default MoveToAttritionModal;
