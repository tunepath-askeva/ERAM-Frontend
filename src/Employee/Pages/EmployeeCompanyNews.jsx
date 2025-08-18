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
} from "antd";
import { useState } from "react";
import { CalendarOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const EmployeeCompanyNews = () => {
  const { data: companyNews } = useGetCompanyNewsQuery();
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleCardClick = (news) => {
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

      <Row gutter={[24, 24]}>
        {companyNews?.news?.map((newsItem) => (
          <Col key={newsItem._id} xs={24} sm={12} lg={8}>
            <Card
              hoverable
              className="news-card"
              onClick={() => handleCardClick(newsItem)}
              cover={
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
              }
            >
              <div className="news-meta">
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
              </div>

              <Title level={4} className="news-card-title">
                {newsItem.title}
              </Title>

              <Paragraph
                ellipsis={{ rows: 3 }}
                className="news-card-description"
              >
                {newsItem.description}
              </Paragraph>

              <div className="news-footer">
                <Text className="news-read-more" strong>
                  Read More →
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={null}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        className="news-modal"
        closeIcon={<span className="modal-close-btn">×</span>}
      >
        {selectedNews && (
          <div className="news-detail">
            <div className="news-detail-header">
              <Title level={2} className="news-detail-title">
                {selectedNews.title}
              </Title>
              <Space size="middle" className="news-detail-meta">
                <Space size="small">
                  <Avatar icon={<UserOutlined />} size="small" />
                  <Text type="secondary">Admin</Text>
                </Space>
                <Space size="small">
                  <CalendarOutlined style={{ color: "#888" }} />
                  <Text type="secondary">
                    {new Date(selectedNews.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </Text>
                </Space>
                <Tag color="blue">{selectedNews.status.toUpperCase()}</Tag>
              </Space>
            </div>

            <Image
              src={selectedNews.coverImage}
              alt={selectedNews.title}
              className="news-detail-image"
              preview={false}
            />

            <Paragraph className="news-detail-description">
              {selectedNews.description}
            </Paragraph>

            <Divider className="news-divider" />

            {selectedNews.subsections?.map((subsection, index) => (
              <div key={subsection._id} className="news-subsection">
                {subsection.subtitle && (
                  <Title level={4} className="subsection-title">
                    {subsection.subtitle}
                  </Title>
                )}
                {subsection.image && (
                  <Image
                    src={subsection.image}
                    alt={subsection.subtitle}
                    className="subsection-image"
                    preview={false}
                  />
                )}
                <Paragraph className="subsection-description">
                  {subsection.subdescription
                    .split("\r\n")
                    .map((paragraph, i) => (
                      <span key={i}>
                        {paragraph}
                        <br />
                        <br />
                      </span>
                    ))}
                </Paragraph>
                {index < selectedNews.subsections.length - 1 && (
                  <Divider className="news-divider" />
                )}
              </div>
            ))}
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
          color: #1890ff;
          margin-bottom: 8px;
        }

        .news-subtitle {
          font-size: 16px;
        }

        .news-card {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .news-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .news-image-container {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .news-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }

        .news-card:hover .news-image {
          transform: scale(1.05);
        }

        .news-badge {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .news-meta {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: #666;
          font-size: 13px;
        }

        .news-card-title {
          margin-bottom: 12px;
          color: #333;
        }

        .news-card-description {
          color: #555;
          margin-bottom: 16px;
          flex-grow: 1;
        }

        .news-footer {
          border-top: 1px solid #f0f0f0;
          padding-top: 12px;
        }

        .news-read-more {
          color: #1890ff;
          transition: color 0.3s;
        }

        .news-card:hover .news-read-more {
          color: #40a9ff;
        }

        /* News Detail Modal Styles */
        .news-modal .ant-modal-content {
          padding: 0;
          border-radius: 8px;
          overflow: hidden;
        }

        .news-modal .ant-modal-body {
          padding: 0;
        }

        .news-detail {
          padding: 0;
        }

        .news-detail-header {
          padding: 24px 24px 0;
        }

        .news-detail-title {
          margin-bottom: 16px;
          color: #333;
        }

        .news-detail-meta {
          margin-bottom: 24px;
        }

        .news-detail-image {
          width: 100%;
          max-height: 400px;
          object-fit: cover;
          margin-bottom: 24px;
        }

        .news-detail-description {
          font-size: 16px;
          line-height: 1.8;
          padding: 0 24px;
          color: #444;
        }

        .news-divider {
          margin: 24px 0;
        }

        .news-subsection {
          padding: 0 24px;
          margin-bottom: 24px;
        }

        .subsection-title {
          color: #333;
          margin-bottom: 16px;
        }

        .subsection-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          margin: 16px 0;
          border-radius: 4px;
        }

        .subsection-description {
          font-size: 15px;
          line-height: 1.7;
          color: #555;
        }

        .modal-close-btn {
          font-size: 24px;
          color: #999;
          padding: 16px;
          display: inline-block;
          transition: color 0.3s;
        }

        .modal-close-btn:hover {
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default EmployeeCompanyNews;
