import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Typography,
  Space,
  Tag,
  Divider,
  Button,
  Spin,
  Alert,
  Avatar,
  Breadcrumb,
  Layout,
} from "antd";
import {
  HomeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  BankOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useGetBranchesQuery } from "../Slices/Users/UserApis.js";
import HomeFooter from "../Global/Footer";
import Header from "../Global/Header";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const BranchHome = () => {
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get("branchId");
  const navigate = useNavigate();

  const { data: branches, isLoading, error } = useGetBranchesQuery();
  const [currentBranch, setCurrentBranch] = useState(null);

  useEffect(() => {
    if (branches?.branch) {
      const host = window.location.hostname; // e.g. branch1.company.com
      const branch = branches.branch.find((b) => b.url.includes(host));
      setCurrentBranch(branch);
    }
  }, [branches]);

  const formatAddress = (location) => {
    if (!location) return "";
    const { street, city, state, country, postalCode } = location;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  };

  const handleGoBack = () => {
    navigate("/branches");
  };

  const handleLogin = () => {
    navigate(`/login?branchId=${branchId}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <Header />
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <Spin size="large" />
        </Content>
        <HomeFooter />
      </Layout>
    );
  }

  if (error || !currentBranch) {
    return (
      <Layout>
        <Header />
        <Content style={{ padding: "50px 20px", minHeight: "60vh" }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <Alert
              message="Branch Not Found"
              description="The requested branch could not be found. Please check the URL or try again."
              type="error"
              action={
                <Button size="small" danger onClick={handleGoBack}>
                  Back to Branches
                </Button>
              }
            />
          </div>
        </Content>
        <HomeFooter />
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />

      {/* Breadcrumb */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          padding: "16px 0",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
        >
          <Breadcrumb>
            <Breadcrumb.Item>
              <HomeOutlined
                onClick={handleGoBack}
                style={{ cursor: "pointer" }}
              />
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <a onClick={handleGoBack} style={{ cursor: "pointer" }}>
                Branches
              </a>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{currentBranch.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%)`,
          padding: "60px 0",
          color: "white",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: "30px" }}>
            {currentBranch.brand_logo ? (
              <Avatar
                size={120}
                src={currentBranch.brand_logo}
                style={{
                  backgroundColor: "white",
                  border: "4px solid rgba(255,255,255,0.3)",
                  marginBottom: "20px",
                }}
              />
            ) : (
              <Avatar
                size={120}
                icon={<BankOutlined />}
                style={{
                  backgroundColor: "rgba(255,255,255,0.2)",
                  border: "4px solid rgba(255,255,255,0.3)",
                  marginBottom: "20px",
                }}
              />
            )}
          </div>

          <Title
            level={1}
            style={{
              color: "white",
              marginBottom: "10px",
              fontSize: "3rem",
              fontWeight: "600",
            }}
          >
            Welcome to {currentBranch.name}
          </Title>

          <Text
            style={{
              fontSize: "18px",
              color: "rgba(255,255,255,0.9)",
              display: "block",
              marginBottom: "10px",
            }}
          >
            Branch Code: {currentBranch.branchCode}
          </Text>

          {currentBranch.description && (
            <Paragraph
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.8)",
                maxWidth: "600px",
                margin: "0 auto 30px",
                fontStyle: "italic",
              }}
            >
              "{currentBranch.description}"
            </Paragraph>
          )}

          <Space size="large">
            <Tag
              color={currentBranch.isActive ? "success" : "error"}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                borderRadius: "20px",
              }}
            >
              {currentBranch.isActive ? "Active Branch" : "Inactive Branch"}
            </Tag>

            {currentBranch.url && (
              <Tag
                color="blue"
                icon={<GlobalOutlined />}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  borderRadius: "20px",
                }}
              >
                Online Services
              </Tag>
            )}
          </Space>
        </div>
      </section>

      <Content
        style={{
          backgroundColor: "#f8fafc",
          padding: "60px 0",
          minHeight: "40vh",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}
        >
          <Row gutter={[32, 32]}>
            {/* Contact Information Card */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <PhoneOutlined style={{ color: "#3b82f6" }} />
                    <span>Contact Information</span>
                  </Space>
                }
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                <Space
                  direction="vertical"
                  size="large"
                  style={{ width: "100%" }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <EnvironmentOutlined
                        style={{
                          color: "#10b981",
                          fontSize: "18px",
                          marginTop: "4px",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "4px" }}
                        >
                          Address:
                        </Text>
                        <Text style={{ color: "#64748b", lineHeight: "1.6" }}>
                          {formatAddress(currentBranch.location)}
                        </Text>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                      }}
                    >
                      <PhoneOutlined
                        style={{
                          color: "#3b82f6",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "4px" }}
                        >
                          Phone:
                        </Text>
                        <Text
                          copyable={{
                            text: currentBranch.location.branch_phoneno,
                          }}
                          style={{ fontSize: "16px", fontWeight: "500" }}
                        >
                          {currentBranch.location.branch_phoneno}
                        </Text>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <MailOutlined
                        style={{
                          color: "#f59e0b",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      />
                      <div>
                        <Text
                          strong
                          style={{ display: "block", marginBottom: "4px" }}
                        >
                          Email:
                        </Text>
                        <Text
                          copyable={{
                            text: currentBranch.location.branch_email,
                          }}
                          style={{ color: "#3b82f6", wordBreak: "break-word" }}
                        >
                          {currentBranch.location.branch_email}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>

            {/* Services Card */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <Space>
                    <BankOutlined style={{ color: "#10b981" }} />
                    <span>Our Services</span>
                  </Space>
                }
                style={{
                  height: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                }}
                bodyStyle={{ padding: "24px" }}
              >
                {currentBranch.services && currentBranch.services.length > 0 ? (
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
                  >
                    {currentBranch.services.map((service, index) => (
                      <Tag
                        key={index}
                        color="geekblue"
                        style={{
                          padding: "8px 16px",
                          fontSize: "14px",
                          borderRadius: "20px",
                          border: "none",
                        }}
                      >
                        {service}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Text type="secondary">
                    No services information available.
                  </Text>
                )}
              </Card>
            </Col>
          </Row>

          {/* Action Buttons */}
          <div
            style={{
              textAlign: "center",
              marginTop: "50px",
              padding: "40px 0",
            }}
          >
            <Space size="large">
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={handleGoBack}
                style={{
                  borderRadius: "25px",
                  padding: "10px 30px",
                  height: "auto",
                }}
              >
                Back to Branches
              </Button>

              <Button
                type="primary"
                size="large"
                icon={<UserOutlined />}
                onClick={handleLogin}
                style={{
                  borderRadius: "25px",
                  padding: "10px 30px",
                  height: "auto",
                  background: "linear-gradient(135deg, #3b82f6, #10b981)",
                  border: "none",
                }}
              >
                Login to Branch Portal
              </Button>
            </Space>
          </div>
        </div>
      </Content>

      <HomeFooter />
    </Layout>
  );
};

export default BranchHome;
