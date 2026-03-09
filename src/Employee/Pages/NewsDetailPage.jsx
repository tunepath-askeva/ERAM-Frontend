import { useGetCompanyNewsQuery } from "../../Slices/Employee/EmployeeApis";
import {
  Row,
  Col,
  Image,
  Typography,
  Tag,
  Space,
  Spin,
  Button,
  Result,
  Divider,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  CalendarOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import SkeletonLoader from "../../Global/SkeletonLoader";
import dayjs from "dayjs";

const { Title, Text, Paragraph } = Typography;

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: companyNews, isLoading, isError } = useGetCompanyNewsQuery();

  // Find the news item by ID
  const selectedNews = companyNews?.news?.find((n) => n._id === id);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "";
    return dayjs(date).format("MMMM D, YYYY");
  };

  const formatTime = (date) => {
    if (!date) return "";
    return dayjs(date).format("h:mm A");
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (isError) {
    return (
      <Result
        status="500"
        title="Something went wrong"
        subTitle="Unable to load news details. Please try again later."
        extra={
          <Button type="primary" onClick={() => navigate("/employee/company-news")}>
            Go Back to News
          </Button>
        }
      />
    );
  }

  if (!selectedNews) {
    return (
      <Result
        status="404"
        title="News Not Found"
        subTitle="The news or event you're looking for doesn't exist or has been removed."
        extra={
          <Button type="primary" onClick={() => navigate("/employee/company-news")}>
            Go Back to News
          </Button>
        }
      />
    );
  }

  return (
    <div className="news-article-container">
      {/* Navigation Bar */}
      <div className="article-nav">
        <div className="article-nav-content">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/employee/company-news")}
            className="back-button"
          >
            Back to News & Events
          </Button>
        </div>
      </div>

      {/* Article Header */}
      <div className="article-header">
        <div className="article-header-content">
          {/* Category Tags */}
          <div className="article-tags">
            {selectedNews.type === "event" && (
              <Tag color="purple" className="article-tag">
                Event
              </Tag>
            )}
            <Tag
              color={selectedNews.status === "published" ? "green" : "orange"}
              className="article-tag"
            >
              {selectedNews.status?.toUpperCase() || "DRAFT"}
            </Tag>
          </div>

          {/* Main Title */}
          <Title level={1} className="article-title">
            {selectedNews.title}
          </Title>

          {/* Article Meta */}
          <div className="article-meta">
            <Space size="large" wrap>
              <Space size="small">
                <UserOutlined />
                <Text type="secondary">Company Administration</Text>
              </Space>
              <Space size="small">
                <CalendarOutlined />
                <Text type="secondary">
                  {selectedNews.type === "event" && selectedNews.eventDate
                    ? formatDate(selectedNews.eventDate)
                    : formatDate(selectedNews.createdAt)}
                </Text>
              </Space>
              {selectedNews.createdAt && (
                <Space size="small">
                  <ClockCircleOutlined />
                  <Text type="secondary">{formatTime(selectedNews.createdAt)}</Text>
                </Space>
              )}
              {selectedNews.type === "event" && selectedNews.eventLocation && (
                <Space size="small">
                  <EnvironmentOutlined style={{ color: "#52c41a" }} />
                  <Text type="secondary">{selectedNews.eventLocation}</Text>
                </Space>
              )}
            </Space>
          </div>
        </div>
      </div>

      {/* Cover Image - Hero Section */}
      {selectedNews.coverImage && (
        <div className="article-hero-section">
          <Image
            src={selectedNews.coverImage}
            alt={selectedNews.title}
            className="hero-cover-image"
            preview={false}
            placeholder={
              <div className="hero-image-placeholder">
                <Spin size="large" />
              </div>
            }
          />
        </div>
      )}

      {/* Article Content */}
      <div className="article-content-wrapper">
        <Row justify="center">
          <Col xs={24} sm={24} md={20} lg={16} xl={14}>
            <div className="article-content">
              {/* Main Description */}
              {selectedNews.description && (
                <div className="article-description">
                  <Paragraph className="lead-paragraph">
                    {selectedNews.description}
                  </Paragraph>
                </div>
              )}

              {/* Subsections */}
              {selectedNews.subsections && selectedNews.subsections.length > 0 && (
                <div className="article-subsections">
                  {selectedNews.subsections.map((section, index) => (
                    <div key={section._id || index} className="subsection">
                      {/* Subsection Title */}
                      {section.subtitle && (
                        <Title level={2} className="subsection-title">
                          {section.subtitle}
                        </Title>
                      )}

                      {/* Subsection Image (if before text) */}
                      {section.image && (
                        <div className="subsection-image-container">
                          <Image
                            src={section.image}
                            alt={section.subtitle || "Section image"}
                            className="subsection-image"
                            placeholder={
                              <div className="image-placeholder">
                                <Spin size="large" />
                              </div>
                            }
                          />
                          {section.subtitle && (
                            <Text type="secondary" className="image-caption">
                              {section.subtitle}
                            </Text>
                          )}
                        </div>
                      )}

                      {/* Subsection Description */}
                      {section.subdescription && (
                        <div className="subsection-content">
                          {section.subdescription
                            .split("\r\n")
                            .filter((para) => para.trim())
                            .map((paragraph, i) => (
                              <Paragraph key={i} className="subsection-paragraph">
                                {paragraph}
                              </Paragraph>
                            ))}
                        </div>
                      )}

                      {/* Divider between subsections (except last) */}
                      {index < selectedNews.subsections.length - 1 && (
                        <Divider className="subsection-divider" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Article Footer */}
              <div className="article-footer">
                <Divider />
                <div className="article-footer-content">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Text type="secondary" className="footer-label">
                        Published:
                      </Text>
                      <br />
                      <Text>
                        {selectedNews.createdAt
                          ? `${formatDate(selectedNews.createdAt)} at ${formatTime(selectedNews.createdAt)}`
                          : "N/A"}
                      </Text>
                    </Col>
                    {selectedNews.updatedAt && (
                      <Col xs={24} sm={12}>
                        <Text type="secondary" className="footer-label">
                          Last Updated:
                        </Text>
                        <br />
                        <Text>
                          {`${formatDate(selectedNews.updatedAt)} at ${formatTime(selectedNews.updatedAt)}`}
                        </Text>
                      </Col>
                    )}
                  </Row>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <style jsx>{`
        .news-article-container {
          background: #f5f5f5;
          min-height: calc(100vh - 64px);
        }

        .article-nav {
          background: #ffffff;
          border-bottom: 1px solid #e8e8e8;
          padding: 12px 0;
        }

        .article-nav-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .back-button {
          font-size: 14px;
        }

        .article-header {
          background: #ffffff;
          padding: 24px 0;
        }

        .article-header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .article-tags {
          margin-bottom: 12px;
        }

        .article-title {
          font-size: 32px;
          font-weight: 600;
          line-height: 1.3;
          margin: 0 0 16px 0;
        }

        .article-meta {
          padding-top: 12px;
          border-top: 1px solid #f0f0f0;
        }

        .article-hero-section {
          width: 100%;
          margin: 0;
          padding: 0;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }

        .hero-cover-image {
          width: 100%;
          height: auto;
          min-height: 400px;
          max-height: 70vh;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        .hero-image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          min-height: 400px;
          max-height: 70vh;
          background: #1a1a1a;
          border-radius: 0;
        }

        .article-content-wrapper {
          background: #ffffff;
          padding: 0 0 40px;
        }

        .article-content {
          max-width: 100%;
          padding: 0 16px;
        }

        .article-description {
          margin-bottom: 32px;
        }

        .lead-paragraph {
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 0;
        }

        .article-subsections {
          margin-top: 32px;
        }

        .subsection {
          margin-bottom: 32px;
        }

        .subsection-title {
          font-size: 24px;
          font-weight: 600;
          line-height: 1.4;
          margin: 0 0 16px 0;
        }

        .subsection-image-container {
          margin: 20px 0;
          text-align: center;
        }

        .subsection-image {
          width: 100%;
          max-width: 100%;
          border-radius: 4px;
        }

        .image-caption {
          display: block;
          margin-top: 8px;
          font-size: 13px;
          color: #8c8c8c;
        }

        .subsection-content {
          margin-top: 16px;
        }

        .subsection-paragraph {
          font-size: 16px;
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .subsection-divider {
          margin: 32px 0;
        }

        .article-footer {
          margin-top: 40px;
        }

        .article-footer-content {
          padding: 16px 0;
        }

        .footer-label {
          font-size: 12px;
          color: #8c8c8c;
        }

        .image-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          background: #f5f5f5;
          border-radius: 8px;
        }

        /* Mobile adjustments for hero section */
        @media (max-width: 576px) {
          .hero-cover-image {
            min-height: 250px;
            max-height: 50vh;
          }

          .hero-image-placeholder {
            min-height: 250px;
            max-height: 50vh;
          }
        }

        /* Tablet */
        @media (min-width: 768px) {
          .article-header {
            padding: 32px 0;
          }

          .article-title {
            font-size: 36px;
          }

          .subsection-title {
            font-size: 26px;
          }

          .lead-paragraph {
            font-size: 17px;
          }

          .subsection-paragraph {
            font-size: 17px;
          }

          .article-header-content,
          .article-content,
          .article-nav-content {
            padding-left: 24px;
            padding-right: 24px;
          }

          .hero-cover-image {
            min-height: 350px;
            max-height: 60vh;
          }

          .hero-image-placeholder {
            min-height: 350px;
            max-height: 60vh;
          }
        }

        /* Desktop */
        @media (min-width: 992px) {
          .article-header {
            padding: 40px 0;
          }

          .article-title {
            font-size: 40px;
          }

          .subsection-title {
            font-size: 28px;
          }

          .lead-paragraph {
            font-size: 18px;
          }

          .subsection-paragraph {
            font-size: 18px;
          }

          .article-header-content,
          .article-content,
          .article-nav-content {
            padding-left: 32px;
            padding-right: 32px;
          }

          .hero-cover-image {
            min-height: 450px;
            max-height: 65vh;
          }

          .hero-image-placeholder {
            min-height: 450px;
            max-height: 65vh;
          }
        }

        /* Large Desktop */
        @media (min-width: 1200px) {
          .article-header-content,
          .article-content,
          .article-nav-content {
            padding-left: 40px;
            padding-right: 40px;
          }

          .hero-cover-image {
            min-height: 500px;
            max-height: 70vh;
          }

          .hero-image-placeholder {
            min-height: 500px;
            max-height: 70vh;
          }
        }

        /* Print Styles */
        @media print {
          .article-nav {
            display: none;
          }

          .news-article-container {
            background: #ffffff;
          }
        }
      `}</style>
    </div>
  );
};

export default NewsDetailPage;
