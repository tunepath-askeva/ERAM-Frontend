import { useGetCompanyNewsQuery } from "../../Slices/Employee/EmployeeApis";
import {
  Card,
  Row,
  Col,
  Modal,
  Image,
  Divider,
  Typography,
  Tag,
  Avatar,
  Space,
  Spin,
  Button,
} from "antd";
import { useState } from "react";
import { 
  CalendarOutlined, 
  UserOutlined, 
  FileTextOutlined,
  CloseOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const EmployeeCompanyNews = () => {
  const { data: companyNews } = useGetCompanyNewsQuery();
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Custom styles matching NewsDetailView
  const customStyles = {
    primaryColor: "#da2c46",
    cardStyle: {
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(218, 44, 70, 0.1)",
      border: `1px solid rgba(218, 44, 70, 0.2)`,
    },
  };

  const handleReadMore = (news, e) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedNews(news);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="news-container">
      <div className="news-header">
        <Title level={2} className="news-title">
          Company News
        </Title>
        <Text type="secondary" className="news-subtitle">
          Stay updated with the latest announcements
        </Text>
      </div>

      <div className="news-list">
        {companyNews?.news
          ?.filter((newsItem) => newsItem.status === "published")
          ?.map((newsItem) => (
          <Card
            key={newsItem._id}
            className="news-wide-card"
            hoverable
          >
            <Row gutter={24} align="middle">
              {/* Left side - Image */}
              <Col xs={24} sm={8} md={6}>
                <div className="news-image-container">
                  <Image
                    src={newsItem.coverImage}
                    alt={newsItem.title}
                    className="news-image"
                    preview={false}
                  />
                  <div className="news-badge">
                    <Tag color="blue">{newsItem.status.toUpperCase()}</Tag>
                  </div>
                </div>
              </Col>

              {/* Right side - Content */}
              <Col xs={24} sm={16} md={18}>
                <div className="news-content">
                  {/* Meta Information */}
                  <div className="news-meta">
                    <Space size="large">
                      <Space size="small">
                        <Avatar icon={<UserOutlined />} size="small" />
                        <Text type="secondary">Admin</Text>
                      </Space>
                      <Space size="small">
                        <CalendarOutlined style={{ color: "#888" }} />
                        <Text type="secondary">
                          {new Date(newsItem.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </Space>
                    </Space>
                  </div>

                  {/* Title */}
                  <Title level={3} className="news-card-title">
                    {newsItem.title}
                  </Title>

                  {/* Description */}
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    className="news-card-description"
                  >
                    {newsItem.description}
                  </Paragraph>

                  {/* Read More Button */}
                  <div className="news-actions">
                    <Button
                      type="primary"
                      icon={<ArrowRightOutlined />}
                      onClick={(e) => handleReadMore(newsItem, e)}
                      className="read-more-btn"
                    >
                      Read More
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        ))}
      </div>

      {/* Modal remains the same */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={900}
        className="news-modal"
        closeIcon={<CloseOutlined style={{ fontSize: "20px", color: "#999" }} />}
        styles={{
          body: { padding: 0, maxHeight: "80vh", overflowY: "auto" }
        }}
      >
        {selectedNews && (
          <div style={{ padding: "24px" }}>
            {/* Main content card */}
            <Card style={customStyles.cardStyle}>
              {/* News Header */}
              <div style={{ marginBottom: "24px" }}>
                <Space wrap style={{ marginBottom: "16px" }}>
                  <Tag
                    color={selectedNews.status === "published" ? "green" : "orange"}
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    {selectedNews.status?.toUpperCase() || "DRAFT"}
                  </Tag>
                  {selectedNews.createdAt && (
                    <Text type="secondary">
                      <CalendarOutlined style={{ marginRight: "4px" }} />
                      {new Date(selectedNews.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </Space>

                <Title
                  level={1}
                  style={{ 
                    color: customStyles.primaryColor, 
                    marginBottom: "16px",
                    fontSize: "28px"
                  }}
                >
                  {selectedNews.title}
                </Title>

                {/* Cover Image */}
                {selectedNews.coverImage && (
                  <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <Image
                      src={selectedNews.coverImage}
                      alt={selectedNews.title}
                      style={{
                        maxWidth: "100%",
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      }}
                      placeholder={
                        <div
                          style={{
                            padding: "40px",
                            backgroundColor: "#f5f5f5",
                            borderRadius: "12px",
                          }}
                        >
                          <Spin />
                        </div>
                      }
                    />
                  </div>
                )}

                {/* Description */}
                {selectedNews.description && (
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
                      {selectedNews.description}
                    </Paragraph>
                  </>
                )}
              </div>

              {/* Subsections */}
              {selectedNews.subsections && selectedNews.subsections.length > 0 && (
                <>
                  <Divider
                    style={{
                      margin: "32px 0",
                      borderColor: customStyles.primaryColor,
                    }}
                  />

                  <Title
                    level={3}
                    style={{ 
                      color: customStyles.primaryColor, 
                      marginBottom: "24px" 
                    }}
                  >
                    Article Sections
                  </Title>

                  <Row gutter={[24, 24]}>
                    {selectedNews.subsections.map((section, index) => (
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
                            {section.subdescription
                              ?.split("\r\n")
                              .map((paragraph, i) => (
                                <span key={i}>
                                  {paragraph}
                                  {i < section.subdescription.split("\r\n").length - 1 && (
                                    <>
                                      <br />
                                      <br />
                                    </>
                                  )}
                                </span>
                              ))}
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
                                      borderRadius: "8px",
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
                    {selectedNews.createdAt
                      ? new Date(selectedNews.createdAt).toLocaleString()
                      : "N/A"}
                  </Text>
                </Col>
                <Col xs={24} sm={12}>
                  <Text type="secondary">
                    <strong>Last Updated:</strong>{" "}
                    {selectedNews.updatedAt
                      ? new Date(selectedNews.updatedAt).toLocaleString()
                      : "N/A"}
                  </Text>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>

      <style jsx>{`
        .news-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .news-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .news-title {
          color: #da2c46;
          margin-bottom: 8px;
        }

        .news-subtitle {
          font-size: 16px;
        }

        .news-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .news-wide-card {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
        }

        .news-wide-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: #da2c46;
        }

        .news-image-container {
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          border-radius: 8px;
        }

        .news-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .news-wide-card:hover .news-image {
          transform: scale(1.05);
        }

        .news-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
        }

        .news-content {
          padding: 8px 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .news-meta {
          margin-bottom: 12px;
        }

        .news-card-title {
          margin-bottom: 12px;
          color: #333;
          font-size: 20px;
          line-height: 1.3;
        }

        .news-card-description {
          color: #666;
          margin-bottom: 16px;
          font-size: 14px;
          line-height: 1.5;
          flex-grow: 1;
        }

        .news-actions {
          margin-top: auto;
        }

        .read-more-btn {
          background: #da2c46;
          border-color: #da2c46;
          border-radius: 6px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .read-more-btn:hover {
          background: #da2c46;
          border-color: #da2c46;
          transform: translateX(2px);
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .news-image-container {
            height: 200px;
            margin-bottom: 16px;
          }
          
          .news-content {
            padding: 0;
          }
          
          .news-card-title {
            font-size: 18px;
          }
        }

        /* Modal Styles */
        .news-modal .ant-modal-content {
          border-radius: 12px;
          overflow: hidden;
        }

        .news-modal .ant-modal-header {
          border-bottom: none;
          padding: 16px 24px;
        }

        .news-modal .ant-modal-close {
          top: 16px;
          right: 16px;
        }

        .news-modal .ant-modal-close-x {
          width: 40px;
          height: 40px;
          line-height: 40px;
          font-size: 16px;
        }
      `}</style>
    </div>
  );
};

export default EmployeeCompanyNews;