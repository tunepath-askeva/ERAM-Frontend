import { Card, Space, Typography, List, Empty, Spin, Badge, Button } from "antd";
import { BellOutlined, ClockCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

const NotificationsCard = ({ notifications, notificationsLoading, screenSize }) => {
  const navigate = useNavigate();

  return (
    <Card
      title={
        <Space size="small">
          <BellOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "12px" : "16px" }}>
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
        padding: screenSize.isMobile ? "10px" : "12px",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        minHeight: 0,
        maxHeight: screenSize.isMobile ? "300px" : undefined,
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : "10px 12px",
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
        <Spin size="small" />
      ) : notifications.length > 0 ? (
        <List
          size="small"
          dataSource={notifications.slice(0, 5)}
          renderItem={(notification) => (
            <List.Item
              style={{
                padding: "4px 0",
                border: "none",
                borderBottom:
                  notifications.indexOf(notification) < notifications.slice(0, 5).length - 1
                    ? "1px solid #f0f0f0"
                    : "none",
              }}
            >
              <Space style={{ width: "100%" }} align="start" size="small">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    strong
                    style={{
                      fontSize: screenSize.isMobile ? "10px" : "11px",
                      display: "block",
                      marginBottom: "2px",
                    }}
                    ellipsis={{ tooltip: notification.title }}
                  >
                    {notification.title}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: screenSize.isMobile ? "9px" : "10px",
                      display: "block",
                      lineHeight: "1.3",
                    }}
                    ellipsis={{ tooltip: notification.message }}
                  >
                    {notification.message}
                  </Text>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: screenSize.isMobile ? "8px" : "9px",
                      display: "block",
                      marginTop: "2px",
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: "3px", fontSize: "9px" }} />
                    {dayjs(notification.createdAt).fromNow()}
                  </Text>
                </div>
                {!notification.isRead && <Badge dot style={{ marginTop: "2px" }} />}
              </Space>
            </List.Item>
          )}
        />
      ) : (
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
      )}
    </Card>
  );
};

export default NotificationsCard;