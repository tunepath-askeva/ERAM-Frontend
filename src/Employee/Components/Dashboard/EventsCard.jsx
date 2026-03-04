import { Card, Space, Typography, Empty, Spin, Timeline } from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Text } = Typography;

const EventsCard = ({ publishedEvents, eventsLoading, screenSize }) => {
  const navigate = useNavigate();
  const displayEvents = publishedEvents.slice(0, 3);

  return (
    <Card
      title={
        <Space size="small">
          <ClockCircleOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "12px" : "16px" }}>
            Upcoming Events
          </Text>
        </Space>
      }
      hoverable
      onClick={() => navigate("/employee/company-news")}
      style={{
        cursor: "pointer",
        borderRadius: "8px",
        border: "1px solid #e8e8e8",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: screenSize.isMobile ? "10px" : "12px",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        minHeight: 0,
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : "10px 12px",
        minHeight: "auto",
      }}
    >
      {eventsLoading ? (
        <Spin size="small" />
      ) : displayEvents.length > 0 ? (
        <Timeline
          size="small"
          items={displayEvents.map((event, index) => ({
            color: index === 0 ? "#1890ff" : "#d9d9d9",
            children: (
              <div style={{ marginBottom: index < displayEvents.length - 1 ? "8px" : 0 }}>
                <Text
                  strong
                  style={{
                    fontSize: screenSize.isMobile ? "11px" : "12px",
                    display: "block",
                    marginBottom: "4px",
                    color: "#262626",
                  }}
                  ellipsis={{ tooltip: event.title, rows: 1 }}
                >
                  {event.title}
                </Text>
                <Space 
                  direction="vertical" 
                  size={2} 
                  style={{ 
                    fontSize: screenSize.isMobile ? "9px" : "10px",
                    width: "100%",
                  }}
                >
                  <Space size="small">
                    <CalendarOutlined style={{ color: "#1890ff", fontSize: "10px" }} />
                    <Text type="secondary">
                      {dayjs(event.eventDate).format("DD MMM YYYY")}
                    </Text>
                  </Space>
                  {event.eventLocation && (
                    <Space size="small">
                      <EnvironmentOutlined style={{ color: "#52c41a", fontSize: "10px" }} />
                      <Text type="secondary" ellipsis={{ tooltip: event.eventLocation }}>
                        {event.eventLocation}
                      </Text>
                    </Space>
                  )}
                </Space>
              </div>
            ),
          }))}
        />
      ) : (
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
      )}
    </Card>
  );
};

export default EventsCard;