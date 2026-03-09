import { Card, Space, Typography, Empty, Spin, Timeline } from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Text } = Typography;

const EventsCard = ({ publishedEvents, eventsLoading, screenSize }) => {
  const navigate = useNavigate();
  const width = screenSize?.width || 0;
  const isVeryLargeScreen = width >= 1200;
  const isLargeScreen = width >= 1024 && width < 1200;
  const displayEvents = publishedEvents.slice(0, 3);
  
  const handleEventClick = (event, e) => {
    if (e) {
      e.stopPropagation();
    }
    navigate(`/employee/company-news/${event._id}`);
  };

  return (
    <Card
      title={
        <Space size="small">
          <ClockCircleOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "12px" : isVeryLargeScreen ? "16px" : isLargeScreen ? "15px" : "14px" }}>
            Upcoming Events
          </Text>
        </Space>
      }
      hoverable={false}
      style={{
        cursor: "default",
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
        padding: screenSize.isMobile ? "8px 10px" : "10px 12px",
        minHeight: "auto",
      }}
    >
      {eventsLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Spin size="small" />
        </div>
      ) : displayEvents.length > 0 ? (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <Timeline
            size="small"
            style={{ flex: 1, overflow: "hidden" }}
            items={displayEvents.map((event, index) => ({
              color: index === 0 ? "#1890ff" : "#d9d9d9",
              children: (
                <div 
                  style={{ 
                    marginBottom: index < displayEvents.length - 1 ? (isVeryLargeScreen ? "10px" : "8px") : 0,
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  <Text
                    strong
                    style={{
                      fontSize: screenSize.isMobile ? "11px" : isVeryLargeScreen ? "13px" : isLargeScreen ? "12px" : "12px",
                      display: "block",
                      marginBottom: isVeryLargeScreen ? "6px" : "4px",
                      color: "#262626",
                      lineHeight: 1.4,
                      wordBreak: "break-word",
                    }}
                    ellipsis={{ tooltip: event.title, rows: 2 }}
                  >
                    {event.title}
                  </Text>
                  {event.description && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: screenSize.isMobile ? "9px" : isVeryLargeScreen ? "11px" : "10px",
                        display: "block",
                        lineHeight: 1.3,
                        marginBottom: isVeryLargeScreen ? "4px" : "3px",
                        wordBreak: "break-word",
                      }}
                      ellipsis={{ tooltip: event.description, rows: 2 }}
                    >
                      {event.description}
                    </Text>
                  )}
                  <Space 
                    direction="vertical" 
                    size={isVeryLargeScreen ? 4 : 2} 
                    style={{ 
                      fontSize: screenSize.isMobile ? "9px" : isVeryLargeScreen ? "10px" : "10px",
                      width: "100%",
                    }}
                  >
                    <Space size="small">
                      <CalendarOutlined style={{ color: "#1890ff", fontSize: isVeryLargeScreen ? "11px" : "10px" }} />
                      <Text type="secondary">
                        {dayjs(event.eventDate).format("DD MMM YYYY")}
                      </Text>
                    </Space>
                    {event.eventLocation && (
                      <Space size="small">
                        <EnvironmentOutlined style={{ color: "#52c41a", fontSize: isVeryLargeScreen ? "11px" : "10px" }} />
                        <Text type="secondary" ellipsis={{ tooltip: event.eventLocation, rows: 1 }}>
                          {event.eventLocation}
                        </Text>
                      </Space>
                    )}
                  </Space>
                </div>
              ),
            }))}
          />
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
                No upcoming events
              </Text>
            }
            imageStyle={{ height: 30 }}
          />
        </div>
      )}
    </Card>
  );
};

export default EventsCard;