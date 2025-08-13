import React from "react";
import {
  Card,
  Typography,
  Tag,
  Divider,
  Spin,
  Image,
  Button,
  Space,
  Alert,
  Row,
  Col,
} from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useGetNewsByIdQuery } from "../../Slices/Employee/EmployeeApis";
import { useParams, useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

const NewsDetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: newsResponse, isLoading, error } = useGetNewsByIdQuery(id);

  const newsData = newsResponse?.news;

  const customStyles = {
    primaryColor: "#da2c46",
    cardStyle: {
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(218, 44, 70, 0.1)",
      border: `1px solid rgba(218, 44, 70, 0.2)`,
    },
  };

  if (isLoading) {
    return (
      <div
        style={{ textAlign: "center", padding: "100px 0", minHeight: "100vh" }}
      >
        <Spin size="large" />
        <div style={{ marginTop: "20px" }}>
          <Text>Loading news article...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px", minHeight: "100vh" }}>
        <Card style={customStyles.cardStyle}>
          <Alert
            message="Error Loading News"
            description="Failed to load the news article. Please try again later."
            type="error"
            showIcon
            style={{ marginBottom: "20px" }}
          />
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: customStyles.primaryColor,
              borderColor: customStyles.primaryColor,
            }}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div style={{ padding: "40px", minHeight: "100vh" }}>
        <Card style={customStyles.cardStyle}>
          <Alert
            message="News Not Found"
            description="The requested news article could not be found."
            type="warning"
            showIcon
            style={{ marginBottom: "20px" }}
          />
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/employee-admin/news")}
            style={{
              backgroundColor: customStyles.primaryColor,
              borderColor: customStyles.primaryColor,
            }}
          >
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      {/* Header with back button */}
      <Card style={{ ...customStyles.cardStyle, marginBottom: "24px" }}>
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/employee-admin/news")}
            style={{ color: customStyles.primaryColor }}
          >
            Back to News Management
          </Button>
        </Space>
      </Card>

      {/* Main content */}
      <Card style={customStyles.cardStyle}>
        {/* News Header */}
        <div style={{ marginBottom: "24px" }}>
          <Space wrap style={{ marginBottom: "16px" }}>
            <Tag
              color={newsData.status === "published" ? "green" : "orange"}
              style={{ fontSize: "12px", padding: "4px 8px" }}
            >
              {newsData.status?.toUpperCase() || "DRAFT"}
            </Tag>
            {newsData.createdAt && (
              <Text type="secondary">
                <CalendarOutlined style={{ marginRight: "4px" }} />
                {new Date(newsData.createdAt).toLocaleDateString()}
              </Text>
            )}
          </Space>

          <Title
            level={1}
            style={{ color: customStyles.primaryColor, marginBottom: "16px" }}
          >
            {newsData.title}
          </Title>

          {/* Cover Image */}
          {newsData.coverImage && (
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <Image
                src={newsData.coverImage}
                alt={newsData.title}
                style={{
                  maxWidth: "100%",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              />
            </div>
          )}

          {/* Description */}
          {newsData.description && (
            <>
              <Title level={4} style={{ color: customStyles.primaryColor }}>
                <FileTextOutlined style={{ marginRight: "8px" }} />
                Overview
              </Title>
              <Paragraph
                style={{
                  fontSize: "16px",
                  lineHeight: "1.6",
                  marginBottom: "32px",
                  color: "#444",
                }}
              >
                {newsData.description}
              </Paragraph>
            </>
          )}
        </div>

        {/* Subsections */}
        {newsData.subsections && newsData.subsections.length > 0 && (
          <>
            <Divider
              style={{
                margin: "32px 0",
                borderColor: customStyles.primaryColor,
              }}
            />

            <Title
              level={3}
              style={{ color: customStyles.primaryColor, marginBottom: "24px" }}
            >
              Article Sections
            </Title>

            <Row gutter={[24, 24]}>
              {newsData.subsections.map((section, index) => (
                <Col xs={24} key={section._id || index}>
                  <Card
                    style={{
                      borderRadius: "8px",
                      border: `1px solid rgba(218, 44, 70, 0.1)`,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    <Title
                      level={4}
                      style={{ marginBottom: "16px", color: "#333" }}
                    >
                      {section.subtitle}
                    </Title>

                    <Paragraph
                      style={{
                        fontSize: "15px",
                        lineHeight: "1.7",
                        marginBottom: section.image ? "20px" : "0",
                        color: "#555",
                      }}
                    >
                      {section.subdescription}
                    </Paragraph>

                    {section.image && (
                      <div style={{ textAlign: "center" }}>
                        <Image
                          src={section.image}
                          alt={section.subtitle}
                          style={{
                            maxWidth: "100%",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          }}
                          placeholder={
                            <div
                              style={{
                                padding: "40px",
                                backgroundColor: "#f5f5f5",
                              }}
                            >
                              <Spin />
                            </div>
                          }
                        />
                      </div>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Footer with timestamps */}
        <Divider style={{ margin: "40px 0 20px 0" }} />
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Text type="secondary">
              <strong>Created:</strong>{" "}
              {newsData.createdAt
                ? new Date(newsData.createdAt).toLocaleString()
                : "N/A"}
            </Text>
          </Col>
          <Col xs={24} sm={12}>
            <Text type="secondary">
              <strong>Last Updated:</strong>{" "}
              {newsData.updatedAt
                ? new Date(newsData.updatedAt).toLocaleString()
                : "N/A"}
            </Text>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default NewsDetailView;
