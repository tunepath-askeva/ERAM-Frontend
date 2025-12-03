import React, { useState, useEffect } from "react";
import { Modal, Input, message, Checkbox, Form } from "antd";
import PhoneInput from "../../Global/PhoneInput";
import { useGetEmployeeDetailsQuery } from "../../Slices/Recruiter/RecruiterApis";

const EditEmployeeModal = ({
  visible,
  employeeId,
  onCancel,
  onSubmit,
  isLoading,
}) => {
  const { data: employeeDetails, isLoading: isEmployeeLoading } =
    useGetEmployeeDetailsQuery(employeeId, {
      skip: !employeeId || !visible, // Skip query when no ID or modal not visible
    });

  const employee = employeeDetails?.employee;

  const [form] = Form.useForm();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    assignedJobTitle: "",
    category: "",
    eramId: "",
    badgeNo: "",
    dateOfJoining: "",
    gatePassId: "",
    aramcoId: "",
    otherId: "",
    plantId: "",
    officialEmail: "",
    basicAssets: "",
    reportingAndDocumentation: "",
  });

  const [changePassword, setChangePassword] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee?.firstName || "",
        middleName: employee?.middleName || "",
        lastName: employee?.lastName || "",
        email: employee.email || "",
        password: "",
        confirmPassword: "",
        assignedJobTitle: employee.employmentDetails?.assignedJobTitle || "",
        category: employee.employmentDetails?.category || "",
        eramId: employee.employmentDetails?.eramId || "",
        badgeNo: employee.employmentDetails?.badgeNo || "",
        dateOfJoining: employee.employmentDetails?.dateOfJoining
          ? new Date(employee.employmentDetails.dateOfJoining)
              .toISOString()
              .split("T")[0]
          : "",
        gatePassId: employee.employmentDetails?.gatePassId || "",
        aramcoId: employee.employmentDetails?.aramcoId || "",
        otherId: employee.employmentDetails?.otherId || "",
        plantId: employee.employmentDetails?.plantId || "",
        officialEmail: employee.employmentDetails?.officialEmail || "",
        basicAssets: employee.employmentDetails?.basicAssets || "",
        reportingAndDocumentation:
          employee.employmentDetails?.reportingAndDocumentation || "",
      });

      form.setFieldsValue({
        phone: employee.phone || "",
      });

      setChangePassword(false);
    }
  }, [employee, form]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      message.error(
        "Please fill all required fields (First Name, Last Name, Email, Phone)"
      );
      return false;
    }

    const phone = form.getFieldValue("phone");
    const phoneCountryCode = form.getFieldValue("phoneCountryCode");

    if (!phone || !phoneCountryCode) {
      message.error(
        "Please fill all required fields (First Name, Last Name, Email, Phone)"
      );
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      message.error("Please enter a valid email address");
      return false;
    }

    if (changePassword) {
      if (!formData.password) {
        message.error("Password is required when changing password");
        return false;
      }

      if (formData.password.length < 6) {
        message.error("Password must be at least 6 characters");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        message.error("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields(["phone", "phoneCountryCode"]);

      if (!validateForm()) return;

      const phone = form.getFieldValue("phone");
      const phoneCountryCode = form.getFieldValue("phoneCountryCode");
      const fullPhone = `${phoneCountryCode}${phone}`;

      const dataToSubmit = {
        id: employeeId,
        ...formData,
        phone: fullPhone,
      };

      if (!changePassword) {
        delete dataToSubmit.password;
        delete dataToSubmit.confirmPassword;
      } else {
        delete dataToSubmit.confirmPassword;
      }

      onSubmit(dataToSubmit);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    setChangePassword(false);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={
        <span style={{ color: "#da2c46", fontSize: "18px" }}>
          Edit Employee
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Update Employee"
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

          {/* Password Section */}
          <div
            style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: "16px" }}
          >
            <Checkbox
              checked={changePassword}
              onChange={(e) => setChangePassword(e.target.checked)}
              style={{ marginBottom: "12px" }}
            >
              <span style={{ fontWeight: 500 }}>Change Password</span>
            </Checkbox>

            {changePassword && (
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
                    New Password *
                  </label>
                  <Input.Password
                    placeholder="Enter new password (min 6 characters)"
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
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                  />
                </div>
              </div>
            )}
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
                <Input
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) =>
                    handleInputChange("dateOfJoining", e.target.value)
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
                    handleInputChange(
                      "reportingAndDocumentation",
                      e.target.value
                    )
                  }
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

export default EditEmployeeModal;
