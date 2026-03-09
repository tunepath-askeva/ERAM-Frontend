import { useGetCompanyNewsQuery } from "../../Slices/Employee/EmployeeApis";
import {
  Card,
  Row,
  Col,
  Image,
  Typography,
  Tag,
  Avatar,
  Space,
  Button,
  Result,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  CalendarOutlined,
  UserOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text, Paragraph } = Typography;

const EmployeeCompanyNews = () => {
  const { data: companyNews, isLoading, isError } = useGetCompanyNewsQuery();
  const navigate = useNavigate();

  const publishedNews =
    companyNews?.news?.filter((n) => n.status === "published") || [];

  const handleReadMore = (news, e) => {
    e.stopPropagation(); // Prevent card click event
    navigate(`/employee/company-news/${news._id}`);
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (isError) {
    return (
      <Result
        status="500"
        title="Something went wrong"
        subTitle="Unable to load company news and events. Please try again later."
      />
    );
  }

  return (
    <div className="news-container">
      <div className="news-header">
        <Title level={2} className="news-title">
          Company News & Events
        </Title>
        <Text type="secondary" className="news-subtitle">
          Stay updated with the latest announcements and events
        </Text>
      </div>

      {publishedNews.length === 0 ? (
        <Result
          status="404"
          title="No News or Events Available"
          subTitle="Company news, events, and announcements will appear here when available."
        />
      ) : (
        <div className="news-list">
          {companyNews?.news
            ?.filter((newsItem) => newsItem.status === "published")
            ?.map((newsItem) => (
              <Card key={newsItem._id} className="news-wide-card" hoverable>
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
                              {newsItem.type === "event" && newsItem.eventDate
                                ? `Event Date: ${new Date(newsItem.eventDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}`
                                : new Date(newsItem.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                            </Text>
                          </Space>
                          {newsItem.type === "event" && newsItem.eventLocation && (
                            <Space size="small">
                              <EnvironmentOutlined style={{ color: "#52c41a" }} />
                              <Text type="secondary" style={{ fontSize: "12px" }}>
                                {newsItem.eventLocation}
                              </Text>
                            </Space>
                          )}
                          {newsItem.type === "event" && (
                            <Tag color="purple" style={{ fontSize: "11px" }}>
                              Event
                            </Tag>
                          )}
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
      )}

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
      `}</style>
    </div>
  );
};

export default EmployeeCompanyNews;
