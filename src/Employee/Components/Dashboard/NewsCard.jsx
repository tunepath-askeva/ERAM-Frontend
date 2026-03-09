import { Card, Space, Typography, Empty, Spin, Button, Image, Tag } from "antd";
import { PaperClipOutlined, ArrowRightOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text, Title } = Typography;

const NewsCard = ({ publishedNews, newsLoading, screenSize, isRightSidebar = false }) => {
  const navigate = useNavigate();
  const width = screenSize?.width || 0;
  const isVeryLargeScreen = width >= 1200;
  const isLargeScreen = width >= 1024 && width < 1200;
  const displayNews = isRightSidebar ? publishedNews.slice(0, 3) : publishedNews.slice(0, 2);
  
  const handleNewsClick = (news, e) => {
    if (e) {
      e.stopPropagation();
    }
    navigate(`/employee/company-news/${news._id}`);
  };

  return (
    <Card
      title={
        <Space size="small">
          <PaperClipOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "12px" : isVeryLargeScreen ? "16px" : isLargeScreen ? "15px" : "14px" }}>
            {isRightSidebar ? "Company News" : "News & Events"}
          </Text>
        </Space>
      }
      hoverable={!isRightSidebar}
      onClick={!isRightSidebar ? () => navigate("/employee/company-news") : undefined}
      style={{
        cursor: !isRightSidebar ? "pointer" : "default",
        borderRadius: "8px",
        border: "1px solid #e8e8e8",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: screenSize.isMobile ? "10px" : isVeryLargeScreen ? "12px" : isLargeScreen ? "10px" : "12px",
        flex: 1,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : screenSize.isDesktop ? "8px 10px" : "10px 12px",
        minHeight: "auto",
      }}
    //   extra={
    //     isRightSidebar && publishedNews.length > 0 && (
    //       <Button
    //         type="primary"
    //         size="small"
    //         onClick={(e) => {
    //           e.stopPropagation();
    //           navigate("/employee/company-news");
    //         }}
    //         style={{
    //           fontSize: "10px",
    //           height: "24px",
    //           padding: "0 8px",
    //         }}
    //       >
    //         Update Feed
    //       </Button>
    //     )
    //   }
    >
      {newsLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Spin size="small" />
        </div>
      ) : publishedNews.length > 0 ? (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: isRightSidebar ? (isVeryLargeScreen ? "12px" : "10px") : "8px", flex: 1, overflow: "hidden" }}>
            {displayNews.map((news, index) => (
              <div
                key={news._id || index}
                style={{
                  display: "flex",
                  flexDirection: isRightSidebar ? "row" : "column",
                  gap: isRightSidebar ? (isVeryLargeScreen ? "12px" : "10px") : "4px",
                  paddingBottom: index < displayNews.length - 1 ? (isRightSidebar ? (isVeryLargeScreen ? "12px" : "10px") : "8px") : 0,
                  borderBottom: index < displayNews.length - 1 && isRightSidebar ? "1px solid #f0f0f0" : "none",
                  cursor: isRightSidebar ? "pointer" : "default",
                  flexShrink: 0,
                }}
                onClick={isRightSidebar ? (e) => handleNewsClick(news, e) : undefined}
              >
                {isRightSidebar && (
                  <div style={{ flexShrink: 0 }}>
                    {news.coverImage ? (
                      <Image
                        src={news.coverImage}
                        alt={news.title}
                        preview={false}
                        style={{
                          width: isVeryLargeScreen ? "100px" : isLargeScreen ? "90px" : "80px",
                          height: isVeryLargeScreen ? "75px" : isLargeScreen ? "68px" : "60px",
                          objectFit: "cover",
                          borderRadius: "6px",
                        }}
                        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                      />
                    ) : (
                      <div
                        style={{
                          width: isVeryLargeScreen ? "100px" : isLargeScreen ? "90px" : "80px",
                          height: isVeryLargeScreen ? "75px" : isLargeScreen ? "68px" : "60px",
                          backgroundColor: "#f0f0f0",
                          borderRadius: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PaperClipOutlined style={{ fontSize: isVeryLargeScreen ? "24px" : "20px", color: "#bfbfbf" }} />
                      </div>
                    )}
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: isRightSidebar ? (isVeryLargeScreen ? "6px" : "4px") : "2px", flexWrap: "wrap" }}>
                    <Text
                      strong
                      style={{
                        fontSize: screenSize.isMobile ? (isRightSidebar ? "11px" : "9px") : isRightSidebar ? (isVeryLargeScreen ? "13px" : isLargeScreen ? "12px" : "12px") : "10px",
                        color: isRightSidebar ? "#262626" : "#1890ff",
                        lineHeight: 1.4,
                        flex: 1,
                        minWidth: 0,
                        wordBreak: "break-word",
                      }}
                      ellipsis={{ tooltip: news.title, rows: isRightSidebar ? 2 : 1 }}
                    >
                      {news.title || "NEWS"}
                    </Text>
                    {news.type === "event" && (
                      <Tag color="purple" style={{ fontSize: isVeryLargeScreen ? "9px" : "8px", padding: isVeryLargeScreen ? "0 5px" : "0 4px", margin: 0, lineHeight: isVeryLargeScreen ? "16px" : "14px", flexShrink: 0 }}>
                        Event
                      </Tag>
                    )}
                  </div>
                  {isRightSidebar && news.description && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: screenSize.isMobile ? "9px" : isVeryLargeScreen ? "11px" : "10px",
                        display: "block",
                        lineHeight: 1.3,
                        marginBottom: isVeryLargeScreen ? "4px" : "3px",
                        wordBreak: "break-word",
                      }}
                      ellipsis={{ tooltip: news.description, rows: 2 }}
                    >
                      {news.description}
                    </Text>
                  )}
                  <Text
                    type="secondary"
                    style={{
                      fontSize: screenSize.isMobile ? "9px" : isVeryLargeScreen ? "10px" : "10px",
                      display: "flex",
                      alignItems: "center",
                      marginTop: isRightSidebar ? (isVeryLargeScreen ? "4px" : "3px") : "2px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <CalendarOutlined style={{ marginRight: "4px", fontSize: isVeryLargeScreen ? "11px" : "10px" }} />
                    {news.type === "event" && news.eventDate
                      ? `Event: ${dayjs(news.eventDate).format("DD MMM YYYY")}`
                      : dayjs(news.createdAt).fromNow()}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text
                type="secondary"
                style={{
                  fontSize: screenSize.isMobile ? "9px" : "10px",
                }}
              >
                {isRightSidebar ? "No news available" : "No news or events"}
              </Text>
            }
            imageStyle={{ height: 30 }}
          />
        </div>
      )}
    </Card>
  );
};

export default NewsCard;