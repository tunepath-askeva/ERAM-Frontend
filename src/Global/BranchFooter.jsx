import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Input,
  Divider,
  Card,
  Tooltip,
  Tag,
} from "antd";
import {
  LinkedinOutlined,
  TwitterOutlined,
  InstagramOutlined,
  FacebookOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  SendOutlined,
  ArrowUpOutlined,
  HeartFilled,
  GlobalOutlined,
  BankOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const BranchFooter = ({ currentBranch }) => {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const params = useParams();
  const branchCode = params.branchCode;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = (value) => {
    console.log("Newsletter subscription:", value);
    setEmail("");
  };

  const footerStyle = {
    background: "#ffffff",
    color: "#000000",
    padding: "60px 0 20px",
    position: "relative",
    overflow: "hidden",
    borderTop: "1px solid #f0f0f0",
  };

  const socialButtonStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    background: "rgba(0, 0, 0, 0.02)",
    color: "#000000",
    fontSize: "16px",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  const linkStyle = {
    color: "rgba(0, 0, 0, 0.7)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    fontSize: "14px",
    lineHeight: "2",
    display: "block",
  };

  const cardStyle = {
    background: "transparent",
    border: "none",
    padding: "0",
    height: "100%",
  };

  // Get logo source - prioritize branch logo, fallback to default
  const getLogoSrc = () => {
    if (currentBranch?.brand_logo) {
      return currentBranch.brand_logo;
    }
    return "/Workforce.svg";
  };

  // Format address from branch location
  const formatAddress = (location) => {
    if (!location) return "Business Address Not Available";
    const { street, city, state, country, postalCode } = location;
    const parts = [street, city, state, postalCode, country].filter(Boolean);
    return parts.join(", ");
  };

  // Get company/branch name
  const getCompanyName = () => {
    return currentBranch?.name || "ERAM TALENT";
  };

  // Get contact details
  const getContactInfo = () => {
    if (currentBranch?.location) {
      return {
        address: formatAddress(currentBranch.location),
        phone: currentBranch.location.branch_phoneno || "+1 (555) 123-4567",
        email: currentBranch.location.branch_email || "info@eramtalent.com",
      };
    }
    return {
      address: "Business Address Not Available",
      phone: "+1 (555) 123-4567",
      email: "info@eramtalent.com",
    };
  };

  const contactInfo = getContactInfo();

  return (
    <Footer style={footerStyle}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        <Row gutter={[32, 32]}>
          {/* Company Info */}
          <Col xs={24} sm={12} md={6}>
            <div style={cardStyle}>
              <div style={{ marginBottom: "20px" }}>
                <img
                  src={getLogoSrc()}
                  style={{
                    height: "100px",
                    width: "auto",
                    maxWidth: "200px",
                    objectFit: "contain",
                  }}
                  alt={`${getCompanyName()} Logo`}
                  onError={(e) => {
                    e.target.src = "/Workforce.svg";
                  }}
                />
              </div>

              {/* Branch Info */}
              {currentBranch && (
                <div style={{ marginBottom: "16px" }}>
                  <Title
                    level={4}
                    style={{ color: "#1e293b", margin: 0, fontSize: "18px" }}
                  >
                    {currentBranch.name}
                  </Title>
                  {currentBranch.branchCode && (
                    <Text style={{ color: "#64748b", fontSize: "14px" }}>
                      Branch Code: {currentBranch.branchCode}
                    </Text>
                  )}
                  {currentBranch.description && (
                    <Paragraph
                      style={{
                        color: "rgba(0, 0, 0, 0.7)",
                        marginTop: "8px",
                        marginBottom: "12px",
                        lineHeight: "1.5",
                        fontSize: "13px",
                      }}
                      ellipsis={{ rows: 2 }}
                    >
                      {currentBranch.description}
                    </Paragraph>
                  )}

                  {/* Branch Status & URL */}
                  <Space wrap style={{ marginBottom: "12px" }}>
                    <Tag
                      color={currentBranch.isActive ? "success" : "error"}
                      style={{ fontSize: "11px" }}
                    >
                      {currentBranch.isActive ? "Active" : "Inactive"}
                    </Tag>
                    {currentBranch.url && (
                      <Tag
                        color="blue"
                        icon={<GlobalOutlined />}
                        style={{ fontSize: "11px" }}
                      >
                        Online
                      </Tag>
                    )}
                  </Space>
                </div>
              )}

              {!currentBranch && (
                <Paragraph
                  style={{
                    color: "rgba(0, 0, 0, 0.7)",
                    marginBottom: "20px",
                    lineHeight: "1.6",
                  }}
                >
                  Delivering innovative solutions and personalized expertise,
                  empowering businesses to thrive and excel in their industries.
                </Paragraph>
              )}

              <Space direction="vertical" size="small">
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}
                >
                  <EnvironmentOutlined
                    style={{
                      color: "#da2c46",
                      fontSize: "16px",
                      marginTop: "2px",
                      flexShrink: 0,
                    }}
                  />
                  <Text
                    style={{
                      color: "rgba(0, 0, 0, 0.7)",
                      fontSize: "14px",
                      lineHeight: "1.4",
                    }}
                  >
                    {contactInfo.address}
                  </Text>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <PhoneOutlined
                    style={{ color: "#da2c46", fontSize: "16px" }}
                  />
                  <Text
                    style={{ color: "rgba(0, 0, 0, 0.7)", fontSize: "14px" }}
                    copyable={{ text: contactInfo.phone }}
                  >
                    {contactInfo.phone}
                  </Text>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <MailOutlined
                    style={{ color: "#da2c46", fontSize: "16px" }}
                  />
                  <Text
                    style={{ color: "rgba(0, 0, 0, 0.7)", fontSize: "14px" }}
                    copyable={{ text: contactInfo.email }}
                  >
                    {contactInfo.email}
                  </Text>
                </div>
              </Space>
            </div>
          </Col>

          {/* Quick Links */}
          <Col xs={24} sm={12} md={6}>
            <div style={cardStyle}>
              <Title
                level={4}
                style={{
                  color: "#000000",
                  marginBottom: "20px",
                  fontSize: "18px",
                }}
              >
                Quick Links
              </Title>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                {[
                  { label: "Home", path: "/home" },
                  { label: "Apply / Login", path: "/branch-login" },
                  { label: "Register", path: "/branch-register" },
                ].map((item) => {
                  const pathWithParams = branchCode 
                    ? `/${encodeURIComponent(branchCode)}${item.path}`
                    : item.path;
                  
                  // Check if current path matches (with or without branch code)
                  const currentPath = window.location.pathname;
                  const isActive = 
                    currentPath === pathWithParams ||
                    currentPath === item.path ||
                    (item.label === "Home" && (
                      currentPath === "/home" || 
                      currentPath.endsWith("/home")
                    )) ||
                    (item.label === "Apply / Login" && 
                      currentPath.includes("branch-login")) ||
                    (item.label === "Register" && 
                      currentPath.includes("branch-register"));

                  return (
                    <Link
                      key={item.label}
                      to={pathWithParams}
                      style={{
                        ...linkStyle,
                        textDecoration: isActive ? "underline" : "none",
                        color: isActive ? "#da2c46" : "rgba(0, 0, 0, 0.7)",
                        display: "block",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.target.style.color = "#da2c46";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.target.style.color = "rgba(0, 0, 0, 0.7)";
                        }
                      }}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </Space>
            </div>
          </Col>

          {/* Branch Services */}
          <Col xs={24} sm={12} md={6}>
            <div style={cardStyle}>
              <Title
                level={4}
                style={{
                  color: "#000000",
                  marginBottom: "20px",
                  fontSize: "18px",
                }}
              >
                {currentBranch?.services && currentBranch.services.length > 0
                  ? "Our Services"
                  : "Available Services"}
              </Title>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                {currentBranch?.services && currentBranch.services.length > 0
                  ? currentBranch.services.slice(0, 5).map((service, index) => (
                      <Text
                        key={index}
                        style={{
                          ...linkStyle,
                          cursor: "default",
                        }}
                      >
                        {service}
                      </Text>
                    ))
                  : [
                      "Talent Acquisition",
                      "Executive Search",
                      "HR Consulting",
                      "Recruitment Process",
                      "Career Guidance",
                    ].map((item) => (
                      <Text
                        key={item}
                        style={{
                          ...linkStyle,
                          cursor: "default",
                        }}
                      >
                        {item}
                      </Text>
                    ))}
              </Space>
            </div>
          </Col>

          {/* Newsletter */}
          <Col xs={24} sm={12} md={6}>
            <div style={cardStyle}>
              <Title
                level={4}
                style={{
                  color: "#000000",
                  marginBottom: "20px",
                  fontSize: "18px",
                }}
              >
                Stay Connected
              </Title>
              <Paragraph
                style={{
                  color: "rgba(0, 0, 0, 0.7)",
                  marginBottom: "20px",
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                Subscribe to our newsletter for the latest job opportunities and
                updates.
              </Paragraph>

              <Search
                placeholder="Enter your email"
                enterButton={
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    style={{
                      backgroundColor: "#da2c46",
                      borderColor: "#da2c46",
                    }}
                  />
                }
                size="large"
                onSearch={handleSubscribe}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  marginBottom: "20px",
                }}
              />

              <Title
                level={4}
                style={{
                  color: "#000000",
                  marginBottom: "15px",
                  fontSize: "18px",
                }}
              >
                Follow Us
              </Title>
              <Space size="middle">
                {[
                  { icon: <LinkedinOutlined />, color: "#0077b5" },
                  { icon: <TwitterOutlined />, color: "#1da1f2" },
                  { icon: <InstagramOutlined />, color: "#e4405f" },
                  { icon: <FacebookOutlined />, color: "#1877f2" },
                ].map((social, index) => (
                  <Tooltip key={index} title="Follow us">
                    <a
                      href="#"
                      style={socialButtonStyle}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = social.color;
                        e.currentTarget.style.borderColor = social.color;
                        e.currentTarget.style.color = "#ffffff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(0, 0, 0, 0.02)";
                        e.currentTarget.style.borderColor =
                          "rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.color = "#000000";
                      }}
                    >
                      {social.icon}
                    </a>
                  </Tooltip>
                ))}
              </Space>
            </div>
          </Col>
        </Row>

        <Divider
          style={{
            borderColor: "rgba(0, 0, 0, 0.1)",
            margin: "40px 0 20px",
          }}
        />

        {/* Bottom Bar */}
        <Row justify="center">
          <Col>
            <Text
              style={{
                color: "rgba(0, 0, 0, 0.5)",
                fontSize: "14px",
                textAlign: "center",
                display: "block",
              }}
            >
              © {new Date().getFullYear()} {getCompanyName()}. All rights
              reserved.
              {currentBranch?.branchCode && (
                <span> • Branch: {currentBranch.branchCode}</span>
              )}
            </Text>
          </Col>
        </Row>
      </div>

      {/* Responsive CSS */}
      <style jsx>{`
        /* Mobile adjustments */
        @media (max-width: 768px) {
          .ant-row {
            row-gap: 24px !important;
          }

          .ant-col {
            margin-bottom: 20px;
          }
        }

        /* Small mobile adjustments */
        @media (max-width: 480px) {
          .ant-layout-footer {
            padding: 40px 16px 20px !important;
          }

          .ant-divider {
            margin: 30px 0 15px !important;
          }
        }

        /* Link hover effects */
        a:hover {
          text-decoration: none !important;
        }

        /* Search input hover */
        .ant-input-search .ant-input:hover,
        .ant-input-search .ant-input:focus {
          box-shadow: none !important;
        }

        /* Search input border color */
        .ant-input-search .ant-input {
          border-color: #da2c46 !important;
        }

        /* Logo color adjustment */
        .ant-layout-footer img {
          filter: none !important;
        }
      `}</style>
    </Footer>
  );
};

export default BranchFooter;
