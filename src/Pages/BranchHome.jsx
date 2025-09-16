import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useGetBranchesQuery } from "../Slices/Users/UserApis.js";
import HomeFooter from "../Global/Footer";
import Header from "../Global/Header";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const BranchHome = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: branches, isLoading, error } = useGetBranchesQuery();
  const [currentBranch, setCurrentBranch] = useState(null);

  // Function to find branch by current domain
  const findBranchByDomain = (branchesData) => {
    const currentHost = window.location.hostname;
    console.log("Current hostname:", currentHost);
    console.log("Available branches:", branchesData);

    // Find branch that matches current domain
    const matchedBranch = branchesData.find((branch) => {
      if (!branch.url) return false;

      // Ensure branch.url is a string
      let branchDomain = String(branch.url)
        .replace(/^https?:\/\//, "")
        .replace(/\/$/, "");

      console.log(`Comparing: ${currentHost} with ${branchDomain}`);

      return (
        (currentHost && currentHost.includes(branchDomain)) ||
        (branchDomain && branchDomain.includes(currentHost))
      );
    });

    return matchedBranch;
  };

  useEffect(() => {
    if (branches?.branch && Array.isArray(branches.branch)) {
      console.log("Branches loaded:", branches.branch);

      // Try to find branch by current domain
      const branchByDomain = findBranchByDomain(branches.branch);

      if (branchByDomain) {
        console.log("Branch found by domain:", branchByDomain);
        setCurrentBranch(branchByDomain);
      } else {
        // If no domain match, check if there's a branchId in URL params
        const branchId = searchParams.get("branchId");
        if (branchId) {
          const branchById = branches.branch.find((b) => b._id === branchId);
          console.log("Branch found by ID:", branchById);
          setCurrentBranch(branchById);
        } else {
          // No match found - this might be the main domain
          console.log(
            "No branch match found for domain:",
            window.location.hostname
          );
          setCurrentBranch(null);
        }
      }
    }
  }, [branches, searchParams]);

  const formatAddress = (location) => {
    if (!location) return "";
    const { street, city, state, country, postalCode } = location;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  };

  const handleGoToMainSite = () => {
    // Navigate to your main domain where all branches are listed
    window.location.href = "https://your-main-domain.com/branches"; // Replace with your actual main domain
  };

  const handleLogin = () => {
    navigate(`/login?branchId=${currentBranch._id}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Header />
        <Content
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px" }}>
              <Text>Loading branch information...</Text>
            </div>
          </div>
        </Content>
        <HomeFooter />
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Header />
        <Content style={{ padding: "50px 20px", minHeight: "60vh" }}>
          <div
            style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
          >
            <Alert
              message="Error Loading Branch Data"
              description="There was an error loading the branch information. Please try again."
              type="error"
              showIcon
              action={
                <Button
                  size="small"
                  danger
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              }
            />
          </div>
        </Content>
        <HomeFooter />
      </Layout>
    );
  }

  // No branch found state
  if (!currentBranch) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Header />
        <Content style={{ padding: "50px 20px", minHeight: "60vh" }}>
          <div
            style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
          >
            <Alert
              message="Branch Not Found"
              description={`No branch is configured for this domain: ${window.location.hostname}`}
              type="warning"
              showIcon
              action={
                <Button size="small" onClick={handleGoToMainSite}>
                  View All Branches
                </Button>
              }
            />

            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                background: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Text type="secondary">
                <strong>Debug Info:</strong>
                <br />
                Current Domain: {window.location.hostname}
                <br />
                Available Branches: {branches?.branch?.length || 0}
                <br />
                Branch URLs:{" "}
                {branches?.branch
                  ?.filter((b) => b.url)
                  .map((b) => b.url)
                  .join(", ") || "None"}
              </Text>
            </div>
          </div>
        </Content>
        <HomeFooter />
      </Layout>
    );
  }

  // Success state - render branch page
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />

      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(16, 185, 129, 0.9) 100%)`,
          padding: "80px 0",
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
              icon={
                currentBranch.isActive ? (
                  <CheckCircleOutlined />
                ) : (
                  <CloseCircleOutlined />
                )
              }
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
                Online Services Available
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
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <BankOutlined
                      style={{
                        fontSize: "48px",
                        color: "#d1d5db",
                        marginBottom: "16px",
                      }}
                    />
                    <div>
                      <Text type="secondary" style={{ fontSize: "16px" }}>
                        Services information will be available soon
                      </Text>
                    </div>
                  </div>
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
                icon={<HomeOutlined />}
                onClick={handleGoToMainSite}
                style={{
                  borderRadius: "25px",
                  padding: "10px 30px",
                  height: "auto",
                }}
              >
                View All Branches
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
                Login to {currentBranch.name}
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
