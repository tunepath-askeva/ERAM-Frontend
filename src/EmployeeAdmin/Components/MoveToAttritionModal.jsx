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
  Card,
} from "antd";
import { UserAddOutlined, EditOutlined } from "@ant-design/icons";
import { useGetRecruitersNameQuery, useGetProjectsQuery } from "../../Slices/Admin/AdminApis";
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
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // Fetch admin users for approver selection
  const { data: adminUsers, isLoading: loadingAdmins } =
    useGetRecruitersNameQuery();

  // Fetch projects for project selection
  const { data: projectsData } = useGetProjectsQuery({ 
    page: 1, 
    pageSize: 1000 
  });
  const projects = projectsData?.allProjects || [];

  // Email update mutation
  const [updateEmail, { isLoading: isUpdatingEmail }] =
    useUpdateEmployeeEmailMutation();

  useEffect(() => {
    if (visible && employee) {
      // Get project ID from employee's project or work order project
      let projectId = "";
      if (employee.employmentDetails?.project) {
        if (typeof employee.employmentDetails.project === "object") {
          projectId = employee.employmentDetails.project._id || "";
        } else {
          projectId = employee.employmentDetails.project || "";
        }
      } else if (employee.employmentDetails?.workorderId?.project) {
        if (typeof employee.employmentDetails.workorderId.project === "object") {
          projectId = employee.employmentDetails.workorderId.project._id || "";
        } else {
          projectId = employee.employmentDetails.workorderId.project || "";
        }
      }

      form.setFieldsValue({
        employeeId: employee._id,
        employeeName: employee.fullName,
        eramId: employee.employmentDetails?.eramId || "N/A",
        noticePeriodServed: "N/A",
        project: projectId,
      });
      setSelectedProjectId(projectId);
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

      // Get project name from selected project ID
      const selectedProject = projects.find(p => p._id === values.project);
      const projectName = selectedProject 
        ? `${selectedProject.name}${selectedProject.prefix ? ` (${selectedProject.prefix})` : ""}`
        : "";

      // Format the data for API
      const attritionData = {
        attritionType: values.attritionType,
        otherAttritionType: values.otherAttritionType,
        reason: values.reason,
        lastWorkingDate: values.lastWorkingDate?.format("YYYY-MM-DD"),
        projectName: projectName,
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
    setSelectedProjectId("");
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
              
              {/* Project Information */}
              {(employee?.employmentDetails?.project || employee?.employmentDetails?.workorderId?.project) && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    Current Project
                  </div>
                  <div style={{ fontWeight: 500 }}>
                    {(() => {
                      let projectDisplay = "N/A";
                      if (employee.employmentDetails?.project) {
                        if (typeof employee.employmentDetails.project === "object") {
                          projectDisplay = `${employee.employmentDetails.project.name || ""}${
                            employee.employmentDetails.project.prefix 
                              ? ` (${employee.employmentDetails.project.prefix})` 
                              : ""
                          }`;
                        }
                      } else if (employee.employmentDetails?.workorderId?.project) {
                        if (typeof employee.employmentDetails.workorderId.project === "object") {
                          projectDisplay = `${employee.employmentDetails.workorderId.project.name || ""}${
                            employee.employmentDetails.workorderId.project.prefix 
                              ? ` (${employee.employmentDetails.workorderId.project.prefix})` 
                              : ""
                          }`;
                        }
                      }
                      return projectDisplay;
                    })()}
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

          {/* Project Selection */}
          <Form.Item 
            name="project" 
            label="Project"
            tooltip="Select the project for this attrition. The current project is pre-selected if available."
          >
            <Select
              placeholder="Select project"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children?.toString()?.toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
              allowClear
              style={{ width: "100%" }}
              notFoundContent={projects.length === 0 ? "No projects available" : "No projects found"}
              onChange={(value) => setSelectedProjectId(value || "")}
            >
              {projects.map((project) => (
                <Option key={project._id} value={project._id}>
                  {project.name} {project.prefix && `(${project.prefix})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          {/* Display selected project details */}
          {selectedProjectId && (() => {
            const selectedProject = projects.find(p => p._id === selectedProjectId);
            if (selectedProject) {
              return (
                <Card 
                  size="small" 
                  style={{ 
                    marginTop: "-8px", 
                    marginBottom: "16px",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #91d5ff"
                  }}
                  bodyStyle={{ padding: "12px" }}
                >
                  <div style={{ fontSize: "13px", color: "#0050b3" }}>
                    <strong style={{ display: "block", marginBottom: "4px" }}>
                      Selected Project Details:
                    </strong>
                    <div style={{ marginLeft: "8px" }}>
                      <div><strong>Name:</strong> {selectedProject.name}</div>
                      {selectedProject.prefix && (
                        <div><strong>Prefix:</strong> {selectedProject.prefix}</div>
                      )}
                      {selectedProject.description && (
                        <div style={{ marginTop: "4px", fontStyle: "italic", color: "#595959" }}>
                          <strong>Description:</strong> {selectedProject.description}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            }
            return null;
          })()}

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
