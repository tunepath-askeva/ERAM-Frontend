import React, { useState, useEffect } from "react";
import {
  Card,
  List,
  Typography,
  Tag,
  Badge,
  Button,
  Space,
  Avatar,
  Dropdown,
  Menu,
  Empty,
  Skeleton,
  Result,
  Popconfirm,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { useGetCandidateNotificationQuery } from "../Slices/Users/UserApis";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    refetch
  } = useGetCandidateNotificationQuery();

  useEffect(() => {
    if (apiData) {
      setNotifications(apiData.notification || []);
      setLoading(false);
    }
    if (apiError) {
      setError(apiError);
      setLoading(false);
    }
  }, [apiData, apiError]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification._id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification._id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "info":
        return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
      case "success":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "warning":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "error":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <BellOutlined style={{ color: "#722ed1" }} />;
    }
  };

  const getNotificationTag = (type) => {
    switch (type) {
      case "info":
        return <Tag color="blue">Info</Tag>;
      case "success":
        return <Tag color="green">Success</Tag>;
      case "warning":
        return <Tag color="orange">Warning</Tag>;
      case "error":
        return <Tag color="red">Alert</Tag>;
      default:
        return <Tag color="purple">Notification</Tag>;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading || apiLoading) {
    return (
      <div style={{ padding: "16px" }}>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (error || apiError) {
    return (
      <div style={{ padding: "16px" }}>
        <Result
          status="error"
          title="Failed to Load Notifications"
          subTitle="Something went wrong while fetching notifications."
          extra={
            <Button
              type="primary"
              onClick={() => refetch()}
              style={{
                background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              }}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
      <div style={{ marginBottom: "16px", textAlign: "center" }}>
        <Title
          level={2}
          style={{
            margin: 0,
            color: "#2c3e50",
            fontSize: "clamp(20px, 4vw, 28px)",
            lineHeight: "1.2",
          }}
        >
          <BellOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          Notifications
        </Title>
        <Text
          type="secondary"
          style={{
            display: "block",
            marginTop: 8,
            fontSize: "clamp(12px, 2.5vw, 14px)",
          }}
        >
          {unreadCount > 0
            ? `You have ${unreadCount} unread notifications`
            : "All caught up!"}
        </Text>
      </div>

      <Card
        style={{
          marginBottom: "16px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <Text strong style={{ fontSize: "16px" }}>
            Recent Notifications
          </Text>
          <Space>
            {unreadCount > 0 && (
              <Button type="link" size="small" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Popconfirm
                title="Are you sure you want to clear all notifications?"
                onConfirm={clearAllNotifications}
                okText="Yes"
                cancelText="No"
                placement="bottomRight"
              >
                <Button type="link" size="small" danger>
                  Clear all
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        {notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "12px 0",
                  backgroundColor: !item.isRead ? "#f6f9ff" : "transparent",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
                actions={[
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="mark-read"
                          onClick={() => handleMarkAsRead(item._id)}
                          disabled={item.isRead}
                        >
                          Mark as read
                        </Menu.Item>
                        <Menu.Item
                          key="delete"
                          danger
                          onClick={() => handleDeleteNotification(item._id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={["click"]}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      size="small"
                    />
                  </Dropdown>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!item.isRead}>
                      <Avatar
                        icon={getNotificationIcon(item.type)}
                        style={{
                          backgroundColor: "transparent",
                          fontSize: "24px",
                        }}
                      />
                    </Badge>
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: "clamp(14px, 3vw, 16px)",
                          marginRight: "8px",
                        }}
                      >
                        {item.title}
                      </Text>
                      {getNotificationTag(item.type)}
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ClockCircleOutlined />
                        {dayjs(item.createdAt).fromNow()}
                      </Text>
                    </div>
                  }
                  description={
                    <div style={{ marginTop: "8px" }}>
                      <Paragraph
                        style={{
                          marginBottom: "8px",
                          fontSize: "clamp(13px, 2.5vw, 14px)",
                        }}
                      >
                        {item.message}
                      </Paragraph>
                      {!item.isRead && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleMarkAsRead(item._id)}
                          style={{ padding: 0 }}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description={
              <Text
                style={{
                  fontSize: "clamp(14px, 2.5vw, 16px)",
                  color: "#666",
                }}
              >
                No notifications available
              </Text>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default Notifications;