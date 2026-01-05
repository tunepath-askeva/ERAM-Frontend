import React, { useState } from "react";
import { Modal, Input, message, Form, Checkbox, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import PhoneInput from "../../Global/PhoneInput";
import { useSnackbar } from "notistack";
import { useGetProjectsQuery } from "../../Slices/Admin/AdminApis";

const AddEmployeeModal = ({ visible, onCancel, onSubmit, isLoading }) => {
  const [form] = Form.useForm();
  const { enqueueSnackbar } = useSnackbar();
  const { data: projectsData } = useGetProjectsQuery({ 
    page: 1, 
    pageSize: 1000 
  });
  const projects = projectsData?.allProjects || [];
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",

    // MANDATORY EMPLOYMENT FIELDS
    assignedJobTitle: "",
    category: "",
    eramId: "",
    dateOfJoining: "",
    officialEmail: "",

    // OPTIONAL BASIC FIELDS
    badgeNo: "",
    gatePassId: "",
    aramcoId: "",
    otherId: "",
    plantId: "",

    // NEW ADDITIONAL FIELDS
    externalEmpNo: "",
    designation: "",
    visaCategory: "",
    employeeGroup: "",
    employmentType: "",
    payrollGroup: "",
    sponsorName: "",
    workHours: "",
    workDays: "",
    airTicketFrequency: "",
    probationPeriod: "",
    periodOfContract: "",
    workLocation: "",
    familyStatus: "",
    lastArrival: "",
    eligibleVacationDays: "",
    eligibleVacationMonth: "",

    // IQAMA DETAILS
    iqamaId: "",
    iqamaIssueDate: "",
    iqamaExpiryDate: "",
    iqamaArabicDateOfIssue: "",
    iqamaArabicDateOfExpiry: "",

    // INSURANCE & BENEFITS
    gosi: "",
    drivingLicense: "",
    medicalPolicy: false,
    medicalPolicyNumber: "",
    noOfDependent: "",
    insuranceCategory: "",
    classCode: "",
    assetAllocation: "",

    // OTHER FIELDS
    lastWorkingDay: "",
    lastLoginTime: "",
    firstTimeLogin: false,

    basicAssets: "",
    reportingAndDocumentation: "",
    project: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      enqueueSnackbar(
        "Please fill all required fields (First Name, Last Name, Email, Phone)",
        {
          variant: "error",
        }
      );
      return false;
    }

    const phone = form.getFieldValue("phone");
    const phoneCountryCode = form.getFieldValue("phoneCountryCode");

    if (!phone || !phoneCountryCode) {
      enqueueSnackbar("Phone number with country code is required", {
        variant: "error",
      });
      return false;
    }

    // MANDATORY EMPLOYMENT FIELDS
    if (!formData.assignedJobTitle) {
      enqueueSnackbar("Assigned Job Title is required", { variant: "error" });
      return false;
    }

    if (!formData.category) {
      enqueueSnackbar("Category is required", { variant: "error" });
      return false;
    }

    if (!formData.eramId) {
      enqueueSnackbar("ERAM ID is required", { variant: "error" });
      return false;
    }

    if (!formData.dateOfJoining) {
      enqueueSnackbar("Date of Joining is required", { variant: "error" });
      return false;
    }

    if (!formData.officialEmail) {
      enqueueSnackbar("Official Email is required", { variant: "error" });
      return false;
    }

    if (!formData.password) {
      enqueueSnackbar("Password is required", { variant: "error" });
      return false;
    }

    if (formData.password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "error",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      enqueueSnackbar("Please enter a valid email address", {
        variant: "error",
      });
      return false;
    }

    if (formData.officialEmail && !emailRegex.test(formData.officialEmail)) {
      enqueueSnackbar("Please enter a valid official email address", {
        variant: "error",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields(["phone", "phoneCountryCode"]);

      if (!validateForm()) return;

      const phone = form.getFieldValue("phone");
      const phoneCountryCode = form.getFieldValue("phoneCountryCode") || "91";
      // Clean phone number - remove + prefix and non-digits
      let cleanPhone = phone ? phone.replace(/^\+/, "").replace(/\D/g, "") : "";
      
      // Remove country code from phone if it starts with it
      if (cleanPhone && cleanPhone.startsWith(phoneCountryCode)) {
        cleanPhone = cleanPhone.slice(phoneCountryCode.length);
      }

      const { confirmPassword, ...dataToSubmit } = formData;
      dataToSubmit.phone = cleanPhone; // Phone number WITHOUT country code
      dataToSubmit.phoneCountryCode = phoneCountryCode; // Country code sent separately

      // Convert assetAllocation string to array
      if (dataToSubmit.assetAllocation) {
        dataToSubmit.assetAllocation = dataToSubmit.assetAllocation
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Validation failed:", error);
      enqueueSnackbar("Please check all required fields", { variant: "error" });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      assignedJobTitle: "",
      category: "",
      eramId: "",
      dateOfJoining: "",
      officialEmail: "",
      badgeNo: "",
      gatePassId: "",
      aramcoId: "",
      otherId: "",
      plantId: "",
      externalEmpNo: "",
      designation: "",
      visaCategory: "",
      employeeGroup: "",
      employmentType: "",
      payrollGroup: "",
      sponsorName: "",
      workHours: "",
      workDays: "",
      airTicketFrequency: "",
      probationPeriod: "",
      periodOfContract: "",
      workLocation: "",
      familyStatus: "",
      lastArrival: "",
      eligibleVacationDays: "",
      eligibleVacationMonth: "",
      iqamaId: "",
      iqamaIssueDate: "",
      iqamaExpiryDate: "",
      iqamaArabicDateOfIssue: "",
      iqamaArabicDateOfExpiry: "",
      gosi: "",
      drivingLicense: "",
      medicalPolicy: false,
      medicalPolicyNumber: "",
      noOfDependent: "",
      insuranceCategory: "",
      classCode: "",
      assetAllocation: "",
      lastWorkingDay: "",
      lastLoginTime: "",
      firstTimeLogin: false,
      basicAssets: "",
      reportingAndDocumentation: "",
      project: "",
    });
    onCancel();
  };

  return (
    <Modal
      title={
        <span style={{ color: "#da2c46", fontSize: "18px" }}>
          Add New Employee
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Add Employee"
      confirmLoading={isLoading}
      okButtonProps={{
        style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
      }}
      width={700}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: "70vh", overflowY: "auto" }}
    >
      <Form form={form} layout="vertical">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Personal Information Section */}
          <div
            style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }}
          >
            <h3 style={{ color: "#da2c46", marginBottom: "12px" }}>
              Personal Information
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  First Name *
                </label>
                <Input
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Middle Name
                </label>
                <Input
                  placeholder="Enter middle name"
                  value={formData.middleName}
                  onChange={(e) =>
                    handleInputChange("middleName", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Last Name *
                </label>
                <Input
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Email *
                </label>
                <Input
                  placeholder="Enter email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div>
                <PhoneInput
                  form={form}
                  name="phone"
                  label="Phone *"
                  required={true}
                />
              </div>
            </div>
          </div>

          {/* Login Credentials Section */}
          <div
            style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }}
          >
            <h3 style={{ color: "#da2c46", marginBottom: "12px" }}>
              Login Credentials
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Password *
                </label>
                <Input.Password
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Confirm Password *
                </label>
                <Input.Password
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Employment Details Section */}
          <div>
            <h3 style={{ color: "#da2c46", marginBottom: "12px" }}>
              Employment Details
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Job Title
                </label>
                <Input
                  placeholder="Enter job title"
                  value={formData.assignedJobTitle}
                  onChange={(e) =>
                    handleInputChange("assignedJobTitle", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Category
                </label>
                <Input
                  placeholder="Enter category"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Date of Joining
                </label>
                <DatePicker
                  style={{ width: "100%" }}
                  value={
                    formData.dateOfJoining
                      ? dayjs(formData.dateOfJoining)
                      : null
                  }
                  onChange={(date) =>
                    handleInputChange(
                      "dateOfJoining",
                      date ? date.format("YYYY-MM-DD") : ""
                    )
                  }
                  format="DD/MM/YYYY"
                  placeholder="Select date"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  ERAM ID
                </label>
                <Input
                  placeholder="Enter ERAM ID"
                  value={formData.eramId}
                  onChange={(e) => handleInputChange("eramId", e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Badge No
                </label>
                <Input
                  placeholder="Enter badge number"
                  value={formData.badgeNo}
                  onChange={(e) => handleInputChange("badgeNo", e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Gate Pass ID
                </label>
                <Input
                  placeholder="Enter gate pass ID"
                  value={formData.gatePassId}
                  onChange={(e) =>
                    handleInputChange("gatePassId", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Aramco ID
                </label>
                <Input
                  placeholder="Enter Aramco ID"
                  value={formData.aramcoId}
                  onChange={(e) =>
                    handleInputChange("aramcoId", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Other ID
                </label>
                <Input
                  placeholder="Enter other ID"
                  value={formData.otherId}
                  onChange={(e) => handleInputChange("otherId", e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Plant ID
                </label>
                <Input
                  placeholder="Enter plant ID"
                  value={formData.plantId}
                  onChange={(e) => handleInputChange("plantId", e.target.value)}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Official Email
                </label>
                <Input
                  placeholder="Enter official email"
                  type="email"
                  value={formData.officialEmail}
                  onChange={(e) =>
                    handleInputChange("officialEmail", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Basic Assets
                </label>
                <Input
                  placeholder="Enter basic assets"
                  value={formData.basicAssets}
                  onChange={(e) =>
                    handleInputChange("basicAssets", e.target.value)
                  }
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: 500,
                  }}
                >
                  Project
                </label>
                <Select
                  placeholder="Select project"
                  value={formData.project}
                  onChange={(value) => handleInputChange("project", value)}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.children?.toString()?.toLowerCase() ?? "").includes(
                      input.toLowerCase()
                    )
                  }
                  style={{ width: "100%" }}
                >
                  {projects.map((project) => (
                    <Select.Option key={project._id} value={project._id}>
                      {project.name} {project.prefix && `(${project.prefix})`}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: 500,
                }}
              >
                Reporting And Documentation
              </label>
              <Input.TextArea
                placeholder="Enter reporting and documentation details"
                value={formData.reportingAndDocumentation}
                onChange={(e) =>
                  handleInputChange("reportingAndDocumentation", e.target.value)
                }
                rows={3}
              />
            </div>

            <div
              style={{
                marginTop: 5,
                borderBottom: "1px solid #f0f0f0",
                paddingBottom: "16px",
              }}
            >
              <h3 style={{ color: "#da2c46", marginBottom: "12px" }}>
                Additional Employee Details
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    External Employee Number
                  </label>
                  <Input
                    placeholder="Enter external emp no"
                    maxLength={20}
                    value={formData.externalEmpNo}
                    onChange={(e) =>
                      handleInputChange("externalEmpNo", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Designation
                  </label>
                  <Input
                    placeholder="Enter designation"
                    maxLength={100}
                    value={formData.designation}
                    onChange={(e) =>
                      handleInputChange("designation", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Visa Category
                  </label>
                  <Input
                    placeholder="Enter visa category"
                    maxLength={50}
                    value={formData.visaCategory}
                    onChange={(e) =>
                      handleInputChange("visaCategory", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Employee Group
                  </label>
                  <Input
                    placeholder="Enter employee group"
                    maxLength={50}
                    value={formData.employeeGroup}
                    onChange={(e) =>
                      handleInputChange("employeeGroup", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Employee Type
                  </label>
                  <Input
                    placeholder="SUPPLIER, INTERNAL, or DIRECT"
                    maxLength={50}
                    value={formData.employmentType}
                    onChange={(e) =>
                      handleInputChange("employmentType", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Payroll Group
                  </label>
                  <Input
                    placeholder="Enter payroll group"
                    maxLength={50}
                    value={formData.payrollGroup}
                    onChange={(e) =>
                      handleInputChange("payrollGroup", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Sponsor Name
                  </label>
                  <Input
                    placeholder="Enter sponsor name"
                    maxLength={100}
                    value={formData.sponsorName}
                    onChange={(e) =>
                      handleInputChange("sponsorName", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Work Hours
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter work hours (e.g., 8)"
                    maxLength={2}
                    value={formData.workHours}
                    onChange={(e) =>
                      handleInputChange("workHours", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Work Days
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter work days (e.g., 5)"
                    maxLength={2}
                    value={formData.workDays}
                    onChange={(e) =>
                      handleInputChange("workDays", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Air Ticket Frequency
                  </label>
                  <Input
                    placeholder="Enter air ticket frequency"
                    maxLength={50}
                    value={formData.airTicketFrequency}
                    onChange={(e) =>
                      handleInputChange("airTicketFrequency", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Probation Period
                  </label>
                  <Input
                    placeholder="Enter probation period"
                    maxLength={50}
                    value={formData.probationPeriod}
                    onChange={(e) =>
                      handleInputChange("probationPeriod", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Period of Contract
                  </label>
                  <Input
                    placeholder="Enter contract period"
                    maxLength={20}
                    value={formData.periodOfContract}
                    onChange={(e) =>
                      handleInputChange("periodOfContract", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Work Location
                  </label>
                  <Input
                    placeholder="Enter work location"
                    maxLength={50}
                    value={formData.workLocation}
                    onChange={(e) =>
                      handleInputChange("workLocation", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Family Status
                  </label>
                  <Input
                    placeholder="Family or Single"
                    maxLength={20}
                    value={formData.familyStatus}
                    onChange={(e) =>
                      handleInputChange("familyStatus", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Last Arrival
                  </label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={
                      formData.lastArrival ? dayjs(formData.lastArrival) : null
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "lastArrival",
                        date ? date.format("YYYY-MM-DD") : ""
                      )
                    }
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Eligible Vacation Days
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter vacation days (e.g., 22)"
                    maxLength={2}
                    value={formData.eligibleVacationDays}
                    onChange={(e) =>
                      handleInputChange("eligibleVacationDays", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Eligible Vacation Month
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter vacation month (e.g., 11.9)"
                    value={formData.eligibleVacationMonth}
                    onChange={(e) =>
                      handleInputChange("eligibleVacationMonth", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Iqama Details Section */}
            <div
              style={{
                borderBottom: "1px solid #f0f0f0",
                paddingBottom: "16px",
              }}
            >
              <h3 style={{ color: "#da2c46", marginBottom: "12px" }}>
                Iqama Details
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Iqama ID
                  </label>
                  <Input
                    placeholder="Enter Iqama ID"
                    value={formData.iqamaId}
                    onChange={(e) =>
                      handleInputChange("iqamaId", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Iqama Issue Date
                  </label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={
                      formData.iqamaIssueDate
                        ? dayjs(formData.iqamaIssueDate)
                        : null
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "iqamaIssueDate",
                        date ? date.format("YYYY-MM-DD") : ""
                      )
                    }
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Iqama Expiry Date
                  </label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={
                      formData.iqamaExpiryDate
                        ? dayjs(formData.iqamaExpiryDate)
                        : null
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "iqamaExpiryDate",
                        date ? date.format("YYYY-MM-DD") : ""
                      )
                    }
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Iqama Arabic Date of Issue
                  </label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={
                      formData.iqamaArabicDateOfIssue
                        ? dayjs(formData.iqamaArabicDateOfIssue)
                        : null
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "iqamaArabicDateOfIssue",
                        date ? date.format("YYYY-MM-DD") : ""
                      )
                    }
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Iqama Arabic Date of Expiry
                  </label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={
                      formData.iqamaArabicDateOfExpiry
                        ? dayjs(formData.iqamaArabicDateOfExpiry)
                        : null
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "iqamaArabicDateOfExpiry",
                        date ? date.format("YYYY-MM-DD") : ""
                      )
                    }
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                  />
                </div>
              </div>
            </div>

            {/* Insurance & Benefits Section */}
            <div
              style={{
                borderBottom: "1px solid #f0f0f0",
                paddingBottom: "16px",
              }}
            >
              <h3 style={{ color: "#da2c46", marginBottom: "12px" }}>
                Insurance & Benefits
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    GOSI
                  </label>
                  <Input
                    placeholder="Enter GOSI number"
                    maxLength={50}
                    value={formData.gosi}
                    onChange={(e) => handleInputChange("gosi", e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Driving License
                  </label>
                  <Input
                    placeholder="Enter driving license"
                    maxLength={50}
                    value={formData.drivingLicense}
                    onChange={(e) =>
                      handleInputChange("drivingLicense", e.target.value)
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Checkbox
                    checked={formData.medicalPolicy}
                    onChange={(e) =>
                      handleInputChange("medicalPolicy", e.target.checked)
                    }
                  >
                    Medical Policy
                  </Checkbox>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Medical Policy Number
                  </label>
                  <Input
                    placeholder="Enter medical policy number"
                    maxLength={50}
                    value={formData.medicalPolicyNumber}
                    onChange={(e) =>
                      handleInputChange("medicalPolicyNumber", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Number of Dependents
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter number of dependents"
                    maxLength={2}
                    value={formData.noOfDependent}
                    onChange={(e) =>
                      handleInputChange("noOfDependent", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Insurance Category
                  </label>
                  <Input
                    placeholder="Enter insurance category"
                    maxLength={50}
                    value={formData.insuranceCategory}
                    onChange={(e) =>
                      handleInputChange("insuranceCategory", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Class Code
                  </label>
                  <Input
                    placeholder="Enter class code"
                    maxLength={20}
                    value={formData.classCode}
                    onChange={(e) =>
                      handleInputChange("classCode", e.target.value)
                    }
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Asset Allocation (comma-separated)
                  </label>
                  <Input
                    placeholder="e.g., Laptop, Vehicle, Phone"
                    value={formData.assetAllocation}
                    onChange={(e) =>
                      handleInputChange("assetAllocation", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Other Information Section */}
            <div>
              <h3 style={{ color: "#da2c46", marginBottom: "12px" }}>
                Other Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Last Working Day
                  </label>
                  <DatePicker
                    style={{ width: "100%" }}
                    value={
                      formData.lastWorkingDay
                        ? dayjs(formData.lastWorkingDay)
                        : null
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "lastWorkingDay",
                        date ? date.format("YYYY-MM-DD") : ""
                      )
                    }
                    format="DD/MM/YYYY"
                    placeholder="Select date"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: 500,
                    }}
                  >
                    Last Login Time
                  </label>
                  <DatePicker
                    style={{ width: "100%" }}
                    showTime
                    value={
                      formData.lastLoginTime
                        ? dayjs(formData.lastLoginTime)
                        : null
                    }
                    onChange={(date) =>
                      handleInputChange(
                        "lastLoginTime",
                        date ? date.format("YYYY-MM-DD HH:mm:ss") : ""
                      )
                    }
                    format="DD/MM/YYYY HH:mm:ss"
                    placeholder="Select date and time"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <Checkbox
                    checked={formData.firstTimeLogin}
                    onChange={(e) =>
                      handleInputChange("firstTimeLogin", e.target.checked)
                    }
                  >
                    First Time Login
                  </Checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default AddEmployeeModal;
