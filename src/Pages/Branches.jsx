import React from "react";
import { Card, Row, Col, Tag, Typography, Space, Avatar, Divider } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  BankOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useGetBranchesQuery } from "../Slices/Users/UserApis.js";
import HomeFooter from "../Global/Footer";
import Header from "../Global/Header";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../Global/SkeletonLoader.jsx";

const { Title, Text, Paragraph } = Typography;

const Branches = () => {
  const { data: branches, isLoading, error } = useGetBranchesQuery();

  console.log(branches, "hi branches=-==-=");
  const navigate = useNavigate();

  if (isLoading)
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  if (error) return <div>Error loading branches</div>;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAddress = (location) => {
    const { street, city, state, country, postalCode } = location;
    return `${street}, ${city}, ${state} ${postalCode}, ${country}`;
  };

  const handleView = (branch) => {
    if (branch.url) {
      if (
        branch.url.startsWith("http://") ||
        branch.url.startsWith("https://")
      ) {
        window.location.href = branch.url; // ✅ Goes to external branch site
      } else {
        window.location.href = `https://${branch.url}?branchId=${branch._id}`;
      }
    } else {
      navigate(`/login?branchId=${branch._id}`); // fallback
    }
  };

  return (
    <>
      <Header />

      <section
        style={{
          position: "relative",
          height: "450px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "white",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage:
              "linear-gradient(135deg, rgba(218, 44, 70, 0.9) 0%, rgba(0, 0, 0, 0.9) 100%)",
            zIndex: 1,
          }}
        ></div>

        <div
          style={{
            position: "relative",
            zIndex: 2,
            maxWidth: "900px",
            width: "100%",
            padding: "0 20px",
            animation: "fadeInUp 1s ease",
          }}
        >
          <h1
            style={{
              color: "white",
              marginBottom: "1.5rem",
              fontSize: "3.5rem",
              fontWeight: "500",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              lineHeight: "1.2",
            }}
          >
            Our Branch Locations
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: "1.5rem",
              display: "block",
              maxWidth: "800px",
              margin: "0 auto 2rem",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
            }}
          >
            Find our offices across India - We're here to serve you better
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          minHeight: "60vh",
          padding: "40px 0 60px 0",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 20px",
          }}
        >
          <Row gutter={[24, 24]} justify="center">
            {branches?.branch?.map((branch) => (
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={8}
                xl={8}
                key={branch._id}
                style={{ display: "flex" }}
              >
                <Card
                  onClick={() => handleView(branch)}
                  hoverable
                  style={{
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                    height: "100%",
                    width: "100%",
                    border: "none",
                    overflow: "hidden",
                    transition: "all 0.3s ease",
                  }}
                  bodyStyle={{
                    padding: "20px",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  cover={
                    branch.brand_logo ? (
                      <div
                        style={{
                          height: "140px",
                          width: "100%",
                          background:
                            "linear-gradient(45deg, #f8fafc, #e2e8f0)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "20px",
                          position: "relative",
                        }}
                      >
                        <img
                          alt={branch.name}
                          src={branch.brand_logo}
                          style={{
                            maxHeight: "100%",
                            maxWidth: "100%",
                            objectFit: "contain",
                            borderRadius: "8px",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          style={{
                            display: "none",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "100%",
                            height: "100%",
                            color: "#94a3b8",
                          }}
                        >
                          <BankOutlined style={{ fontSize: "40px" }} />
                        </div>

                        {/* Status Badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                          }}
                        >
                          <Tag
                            color={branch.isActive ? "success" : "error"}
                            icon={
                              branch.isActive ? (
                                <CheckCircleOutlined />
                              ) : (
                                <CloseCircleOutlined />
                              )
                            }
                            style={{
                              borderRadius: "12px",
                              padding: "4px 12px",
                              fontSize: "12px",
                              fontWeight: "500",
                            }}
                          >
                            {branch.isActive ? "Active" : "Inactive"}
                          </Tag>
                        </div>

                        {/* URL Badge */}
                        {branch.url && (
                          <div
                            style={{
                              position: "absolute",
                              top: "12px",
                              left: "12px",
                            }}
                          >
                            <Tag
                              color="blue"
                              icon={<GlobalOutlined />}
                              style={{
                                borderRadius: "12px",
                                padding: "4px 12px",
                                fontSize: "11px",
                                fontWeight: "500",
                              }}
                            >
                              Online
                            </Tag>
                          </div>
                        )}
                      </div>
                    ) : null
                  }
                >
                  <div style={{ flex: 1 }}>
                    {/* Header Section */}
                    <div style={{ marginBottom: "16px", textAlign: "center" }}>
                      <Title
                        level={4}
                        style={{
                          margin: 0,
                          color: "#1e293b",
                          fontSize: "20px",
                          fontWeight: "600",
                        }}
                      >
                        {branch.name}
                      </Title>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "14px",
                          fontWeight: "500",
                        }}
                      >
                        {branch.branchCode}
                      </Text>
                      <div style={{ marginTop: "8px" }}>
                        <Tag
                          color="blue"
                          style={{
                            borderRadius: "8px",
                            fontSize: "11px",
                          }}
                        >
                          Order: {branch.branchOrder}
                        </Tag>
                      </div>
                    </div>

                    {/* Branch URL Display */}
                    {branch.url && (
                      <div
                        style={{ marginBottom: "16px", textAlign: "center" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                          }}
                        >
                          <GlobalOutlined
                            style={{ color: "#3b82f6", fontSize: "14px" }}
                          />
                          <Text
                            style={{
                              color: "#3b82f6",
                              fontSize: "13px",
                              fontWeight: "500",
                            }}
                          >
                            {branch.url}
                          </Text>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {branch.description && (
                      <div style={{ marginBottom: "16px" }}>
                        <Text
                          style={{
                            color: "#64748b",
                            fontStyle: "italic",
                            fontSize: "13px",
                            lineHeight: "1.5",
                            display: "block",
                            textAlign: "center",
                          }}
                        >
                          "{branch.description}"
                        </Text>
                      </div>
                    )}

                    <Divider
                      style={{ margin: "16px 0", borderColor: "#e2e8f0" }}
                    />

                    {/* Contact Information */}
                    <div style={{ marginBottom: "16px" }}>
                      <Space
                        direction="vertical"
                        size="middle"
                        style={{ width: "100%" }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "12px",
                          }}
                        >
                          <EnvironmentOutlined
                            style={{
                              color: "#10b981",
                              fontSize: "16px",
                              marginTop: "2px",
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            style={{
                              fontSize: "13px",
                              lineHeight: "1.5",
                              color: "#374151",
                            }}
                          >
                            {formatAddress(branch.location)}
                          </Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <PhoneOutlined
                            style={{
                              color: "#3b82f6",
                              fontSize: "16px",
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            copyable={{ text: branch.location.branch_phoneno }}
                            style={{
                              fontSize: "14px",
                              fontWeight: "500",
                              color: "#374151",
                            }}
                          >
                            {branch.location.branch_phoneno}
                          </Text>
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
                              fontSize: "16px",
                              flexShrink: 0,
                            }}
                          />
                          <Text
                            copyable={{ text: branch.location.branch_email }}
                            style={{
                              fontSize: "13px",
                              color: "#374151",
                              wordBreak: "break-word",
                            }}
                          >
                            {branch.location.branch_email}
                          </Text>
                        </div>
                      </Space>
                    </div>

                    {/* Services Section */}
                    {branch.services && branch.services.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <Text
                          strong
                          style={{
                            fontSize: "14px",
                            color: "#1e293b",
                            display: "block",
                            marginBottom: "8px",
                          }}
                        >
                          Services:
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                          }}
                        >
                          {branch.services.map((service, index) => (
                            <Tag
                              key={index}
                              color="geekblue"
                              style={{
                                borderRadius: "8px",
                                fontSize: "11px",
                              }}
                            >
                              {service}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Timestamps */}
                  <div
                    style={{
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "12px",
                      marginTop: "auto",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ marginBottom: "4px" }}>
                        <CalendarOutlined style={{ marginRight: "4px" }} />
                        Created: {formatDate(branch.createdAt)}
                      </div>
                      <div>
                        <CalendarOutlined style={{ marginRight: "4px" }} />
                        Updated: {formatDate(branch.updatedAt)}
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      <HomeFooter />
    </>
  );
};

export default Branches;
