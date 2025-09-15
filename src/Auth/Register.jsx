import React, { useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Typography,
  Row,
  Col,
  Checkbox,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useRegisterUserMutation } from "../Slices/Users/UserApis.js";
import OtpModal from "../Modal/OtpModal";
import Header from "../Global/Header";
import HomeFooter from "../Global/Footer";
import { phoneUtils, countryInfo } from "../utils/countryMobileLimits.js";

const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("966");

  const [registerUser, { isLoading }] = useRegisterUserMutation();

  const generateCountryOptions = () => {
    const supportedCodes = phoneUtils.getSupportedCountryCodes();

    return supportedCodes
      .map((code) => {
        const info = countryInfo[code];
        const limits = phoneUtils.getLimits(code);

        return {
          value: code,
          label: info ? `${info.flag} +${code} ${info.name}` : `+${code}`,
          searchText: info
            ? `${code} ${info.name} +${code}`.toLowerCase()
            : code,
          limits: limits,
        };
      })
      .sort((a, b) => {
        if (a.value === "966") return -1;
        if (b.value === "966") return 1;
        const aName = countryInfo[a.value]?.name || "";
        const bName = countryInfo[b.value]?.name || "";
        return aName.localeCompare(bName);
      });
  };

  const getSelectedCountryDisplay = (countryCode) => {
    const info = countryInfo[countryCode];
    return info ? `${info.flag} +${countryCode}` : `+${countryCode}`;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone, countryCode = selectedCountryCode) => {
    if (!phone || !phone.trim()) return false;

    const cleanPhone = phone.replace(/\D/g, "");

    return phoneUtils.validateMobileNumber(countryCode, cleanPhone);
  };

  const validateStrongPassword = (password) => {
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const validateName = (name) => {
    const nameRegex = /^[a-zA-Z\s]{1,}$/;
    return nameRegex.test(name.trim());
  };

  const onFinish = async (values) => {
    setLoading(true);

    try {
      if (!values.firstName || !values.firstName.trim()) {
        enqueueSnackbar("Please enter your first name.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!validateName(values.firstName)) {
        enqueueSnackbar("First name should contain only letters.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!values.lastName || !values.lastName.trim()) {
        enqueueSnackbar("Please enter your last name.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!validateName(values.lastName)) {
        enqueueSnackbar("Last name should contain only letters.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!values.email || !values.email.trim()) {
        enqueueSnackbar("Please enter your email address.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!validateEmail(values.email)) {
        enqueueSnackbar("Please enter a valid email address.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!values.phoneNumber || !values.phoneNumber.trim()) {
        enqueueSnackbar("Please enter your phone number.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!validatePhone(values.phoneNumber, selectedCountryCode)) {
        const limits = phoneUtils.getLimits(selectedCountryCode);
        const countryName =
          countryInfo[selectedCountryCode]?.name || "selected country";
        const errorMessage = limits
          ? `Please enter a valid phone number for ${countryName} (${limits.min}-${limits.max} digits).`
          : "Please enter a valid phone number.";

        enqueueSnackbar(errorMessage, {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!values.password) {
        enqueueSnackbar("Please enter a password.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (!validateStrongPassword(values.password)) {
        enqueueSnackbar(
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
          {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
            autoHideDuration: 4000,
          }
        );
        setLoading(false);
        return;
      }

      if (!values.cPassword) {
        enqueueSnackbar("Please confirm your password.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      if (values.password !== values.cPassword) {
        enqueueSnackbar("Password and confirm password do not match.", {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        });
        setLoading(false);
        return;
      }

      const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;

      const cleanPhoneNumber = values.phoneNumber.replace(/\D/g, "");
      const formattedPhone = `+${selectedCountryCode}${cleanPhoneNumber}`;

      const userData = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        fullName: fullName,
        role: "candidate",
        email: values.email.trim().toLowerCase(),
        phone: formattedPhone,
        cPassword: values.cPassword,
      };

      console.log("Registration data:", userData);

      const response = await registerUser(userData).unwrap();
      console.log("Registration successful:", response);

      setRegisteredEmail(values.email.trim().toLowerCase());
      enqueueSnackbar("Registration successful! Please verify your email.", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });

      setShowOtpModal(true);
    } catch (error) {
      console.error("Registration failed:", error);
      enqueueSnackbar(
        error?.data?.message ||
          error?.message ||
          "Registration failed. Please try again.",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);

    const firstError = errorInfo.errorFields[0];
    if (firstError && firstError.errors.length > 0) {
      enqueueSnackbar(firstError.errors[0], {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });
    } else {
      enqueueSnackbar("Please check your input fields.", {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });
    }
  };

  const handleOtpVerifySuccess = (otpResponse) => {
    setShowOtpModal(false);
    setRegisteredEmail("");
    enqueueSnackbar("Email verified successfully! Please login to continue.", {
      variant: "success",
      anchorOrigin: { vertical: "top", horizontal: "right" },
      autoHideDuration: 3000,
    });
    navigate("/login");
  };

  const handleOtpModalCancel = () => {
    setShowOtpModal(false);
    setRegisteredEmail("");

    enqueueSnackbar(
      "Email verification cancelled. Please register again if needed.",
      {
        variant: "error",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      }
    );
  };

  const handleGoogleSignUp = () => {
    enqueueSnackbar("Google Sign-Up functionality to be implemented", {
      variant: "info",
      anchorOrigin: { vertical: "top", horizontal: "right" },
      autoHideDuration: 3000,
    });
  };

  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f0f0",
          padding: "20px",
        }}
      >
        <Card
          style={{
            width: "100%",
            maxWidth: 500,
            boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
            borderRadius: "20px",
            border: "none",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: "40px" }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: "40px",
            }}
          >
            <div
              style={{
                margin: "0 auto 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                color: "white",
                fontWeight: "bold",
              }}
            >
              <img
                src="/logo-2.png"
                alt="Company Logo"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <span style={{ display: "none" }}>Logo</span>
            </div>
            <p
              style={{
                margin: 0,
                color: "#7f8c8d",
                fontSize: "16px",
              }}
            >
              Sign up to get started
            </p>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            layout="vertical"
            scrollToFirstError
          >
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="firstName"
                  label={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      First Name
                    </span>
                  }
                >
                  <Input
                    prefix={<UserOutlined style={{ color: "#bdc3c7" }} />}
                    placeholder="John"
                    size="large"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e1e5e9",
                      fontSize: "16px",
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="lastName"
                  label={
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        color: "#2c3e50",
                      }}
                    >
                      Last Name
                    </span>
                  }
                >
                  <Input
                    prefix={<UserOutlined style={{ color: "#bdc3c7" }} />}
                    placeholder="Doe"
                    size="large"
                    style={{
                      borderRadius: "12px",
                      border: "1px solid #e1e5e9",
                      fontSize: "16px",
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="email"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Email Address
                </span>
              }
            >
              <Input
                prefix={<MailOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="john.doe@example.com"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",
                  fontSize: "16px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Phone Number
                </span>
              }
            >
              <Input.Group compact>
                <Select
                  value={selectedCountryCode}
                  onChange={setSelectedCountryCode}
                  style={{ width: "35%" }}
                  size="large"
                  showSearch
                  placeholder="Country"
                  optionFilterProp="searchtext"
                  filterOption={(input, option) =>
                    option.searchtext
                      ?.toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {generateCountryOptions().map((option) => (
                    <Option
                      key={option.value}
                      value={option.value}
                      searchtext={option.searchText}
                      label={getSelectedCountryDisplay(option.value)}
                    >
                      {option.label}
                    </Option>
                  ))}
                </Select>
                <Form.Item name="phoneNumber" noStyle>
                  <Input
                    prefix={<PhoneOutlined style={{ color: "#bdc3c7" }} />}
                    placeholder={`Enter ${
                      phoneUtils.getLimits(selectedCountryCode)?.min
                    }-${phoneUtils.getLimits(selectedCountryCode)?.max} digits`}
                    size="large"
                    maxLength={
                      phoneUtils.getLimits(selectedCountryCode)?.max || 15
                    }
                    onInput={(e) => {
                      // Only allow digits
                      e.target.value = e.target.value.replace(/\D/g, "");
                    }}
                    style={{
                      width: "65%",
                      borderRadius: "0 12px 12px 0",
                      border: "1px solid #e1e5e9",
                      fontSize: "16px",
                    }}
                  />
                </Form.Item>
              </Input.Group>
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Password
                </span>
              }
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="Create a strong password"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",
                  fontSize: "16px",
                }}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="cPassword"
              label={
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2c3e50",
                  }}
                >
                  Confirm Password
                </span>
              }
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#bdc3c7" }} />}
                placeholder="Confirm your password"
                size="large"
                style={{
                  borderRadius: "12px",
                  border: "1px solid #e1e5e9",
                  fontSize: "16px",
                }}
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item
              name="terms"
              valuePropName="checked"
              initialValue={true}
              rules={[
                {
                  validator: (_, value) =>
                    value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("You must accept the Terms and Conditions")
                        ),
                },
              ]}
            >
              <Checkbox defaultChecked>
                I agree to the{" "}
                <Link style={{ color: "#f5222d" }}>Terms and Conditions</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginTop: "24px", marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading || isLoading}
                block
                size="large"
                style={{
                  height: "48px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg,rgb(231, 82, 82) 0%,rgb(185, 48, 48) 100%)",
                  border: "none",
                  fontSize: "16px",
                  fontWeight: "600",
                  boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
                }}
              >
                {loading || isLoading
                  ? "Creating Account..."
                  : "Create Account"}
              </Button>
            </Form.Item>
          </Form>

          <div
            style={{
              textAlign: "center",
              marginTop: "32px",
              paddingTop: "24px",
              borderTop: "1px solid #ecf0f1",
            }}
          >
            <span style={{ color: "#7f8c8d", fontSize: "14px" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#f5222d",
                  fontWeight: "600",
                  textDecoration: "none",
                }}
              >
                Sign in here
              </Link>
            </span>
          </div>
        </Card>
      </div>

      <OtpModal
        visible={showOtpModal}
        onCancel={handleOtpModalCancel}
        email={registeredEmail}
        onVerifySuccess={handleOtpVerifySuccess}
      />

      <HomeFooter />
    </>
  );
};

export default Register;
