import { Card, Space, Typography, List, Empty, Spin, Badge, Button } from "antd";
import { BellOutlined, ClockCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationsCard = ({ notifications, notificationsLoading, screenSize }) => {
  const navigate = useNavigate();
  const width = screenSize?.width || 0;
  const isVeryLargeScreen = width >= 1200;
  const isLargeScreen = width >= 1024 && width < 1200;
  const isMediumScreen = width >= 768 && width < 1024;
  
  // Responsive font sizes - bigger for large screens, properly scaled
  const getTitleFontSize = () => {
    if (screenSize.isMobile) return "12px";
    if (isVeryLargeScreen) return "14px";
    if (isLargeScreen) return "13px";
    if (isMediumScreen) return "12px";
    return "12px";
  };
  
  const getMessageFontSize = () => {
    if (screenSize.isMobile) return "10px";
    if (isVeryLargeScreen) return "13px";
    if (isLargeScreen) return "12px";
    if (isMediumScreen) return "11px";
    return "11px";
  };
  
  const getTimeFontSize = () => {
    if (screenSize.isMobile) return "9px";
    if (isVeryLargeScreen) return "11px";
    if (isLargeScreen) return "10px";
    if (isMediumScreen) return "9px";
    return "9px";
  };

  return (
    <Card
      title={
        <Space size="small">
          <BellOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "12px" : isVeryLargeScreen ? "16px" : isLargeScreen ? "15px" : "14px" }}>
            Notifications
          </Text>
        </Space>
      }
      hoverable
      onClick={() => navigate("/employee/notifications")}
      style={{
        cursor: "pointer",
        borderRadius: "12px",
        border: "1px solid #e8e8e8",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: screenSize.isMobile ? "10px" : isVeryLargeScreen ? "12px" : isLargeScreen ? "10px" : "10px",
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
      extra={
        notifications.length > 0 && (
          <Button
            type="link"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate("/employee/notifications");
            }}
            style={{ padding: 0, fontSize: "10px" }}
          >
            View All <ArrowRightOutlined />
          </Button>
        )
      }
    >
      {notificationsLoading ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1 }}>
          <Spin size="small" />
        </div>
      ) : notifications.length > 0 ? (
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <List
            size="small"
            dataSource={notifications.slice(0, 5)}
            style={{ flex: 1, overflow: "hidden" }}
            renderItem={(notification) => (
              <List.Item
                style={{
                  padding: isVeryLargeScreen ? "6px 0" : isLargeScreen ? "5px 0" : "4px 0",
                  border: "none",
                  borderBottom:
                    notifications.indexOf(notification) < notifications.slice(0, 5).length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  flexShrink: 0,
                }}
              >
              <Space style={{ width: "100%", alignItems: "flex-start" }} size="small">
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <Text
                    strong
                    style={{
                      fontSize: getTitleFontSize(),
                      display: "block",
                      marginBottom: isVeryLargeScreen ? "3px" : "2px",
                      lineHeight: "1.3",
                      wordBreak: "break-word",
                    }}
                    ellipsis={{ tooltip: notification.title, rows: 1 }}
                  >
                    {notification.title}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: getMessageFontSize(),
                      display: "block",
                      lineHeight: "1.3",
                      marginBottom: isVeryLargeScreen ? "3px" : "2px",
                      wordBreak: "break-word",
                    }}
                    ellipsis={{ tooltip: notification.message, rows: 2 }}
                  >
                    {notification.message}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: getTimeFontSize(),
                      display: "block",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: "4px", fontSize: getTimeFontSize() }} />
                    {dayjs(notification.createdAt).fromNow()}
                  </Text>
                </div>
                {!notification.isRead && <Badge dot style={{ marginTop: "2px", flexShrink: 0 }} />}
              </Space>
            </List.Item>
          )}
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
                  fontSize: screenSize.isMobile ? "10px" : "11px",
                }}
              >
                No notifications
              </Text>
            }
            imageStyle={{ height: 30 }}
          />
        </div>
      )}
    </Card>
  );
};

export default NotificationsCard;