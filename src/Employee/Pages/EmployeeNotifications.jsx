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
  message,
  Pagination,
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
import { useGetEmployeeNotificationQuery } from "../../Slices/Employee/EmployeeApis";
import {
  useClearAllNotificationMutation,
  useMarkAllReadMutation,
  useMarkAsReadByIdMutation,
  useDeleteNotificationMutation,
} from "../../Slices/Users/UserApis";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useGetEmployeeNotificationQuery({ page, limit: pageSize });

  const [clearAllNotifications, { isLoading: clearingAll }] =
    useClearAllNotificationMutation();
  const [markAllAsRead, { isLoading: markingAllRead }] =
    useMarkAllReadMutation();
  const [markAsReadById, { isLoading: markingAsRead }] =
    useMarkAsReadByIdMutation();
  const [deleteNotification, { isLoading: deleting }] =
    useDeleteNotificationMutation();

  useEffect(() => {
    if (apiData) {
      setNotifications(apiData.notifications || []); // ✅ fixed
      setLoading(false);
    }
    if (apiError) {
      setError(apiError);
      setLoading(false);
    }
  }, [apiData, apiError]);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsReadById(id).unwrap();
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      message.success("Notification marked as read");
    } catch (error) {
      message.error("Failed to mark notification as read");
      console.error("Mark as read error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );
      message.success("All notifications marked as read");
    } catch (error) {
      message.error("Failed to mark all notifications as read");
      console.error("Mark all as read error:", error);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await clearAllNotifications().unwrap();
      setNotifications([]);
      message.success("All notifications cleared");
    } catch (error) {
      message.error("Failed to clear notifications");
      console.error("Clear all notifications error:", error);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await deleteNotification(id).unwrap();
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== id)
      );
      message.success("Notification deleted");
    } catch (error) {
      message.error("Failed to delete notification");
      console.error("Delete notification error:", error);
    }
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

  const getNotificationActions = (item) => {
    const menuItems = [
      {
        key: "markRead",
        label: "Mark as read",
        icon: <CheckCircleOutlined />,
        disabled: item.isRead,
        onClick: () => handleMarkAsRead(item._id),
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteNotification(item._id),
      },
    ];

    return (
      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
        placement="bottomRight"
      >
        <Button
          type="text"
          icon={<MoreOutlined />}
          size="small"
          style={{ color: "#666" }}
        />
      </Dropdown>
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

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
          title="Nothing to Show Here" 
          // subTitle="Something went wrong while fetching notifications."
          extra={
            <Button
              type="primary"
              onClick={() => refetch()}
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
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
          <Text
            strong
            style={{ fontSize: "16px", display: "flex", alignItems: "center" }}
          >
            Recent Notifications
            {unreadCount > 0 && (
              <span
                style={{
                  marginLeft: "8px",
                  backgroundColor: "#da2c46",
                  color: "white",
                  borderRadius: "10px",
                  padding: "2px 8px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  animation: unreadCount > 0 ? "pulse 1.5s infinite" : "none",
                }}
              >
                {unreadCount} new
              </span>
            )}
            {/* {unreadCount === 0 && (
              <span style={{ marginLeft: "8px", color: "#52c41a" }}>
                ✓ All caught up!
              </span>
            )} */}
          </Text>
          <Space>
            {unreadCount > 0 && (
              <Button
                type="link"
                size="small"
                onClick={handleMarkAllAsRead}
                loading={markingAllRead}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Popconfirm
                title="Are you sure you want to clear all notifications?"
                onConfirm={handleClearAllNotifications}
                okText="Yes"
                cancelText="No"
                placement="bottomRight"
              >
                <Button type="link" size="small" danger loading={clearingAll}>
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
                actions={[getNotificationActions(item)]}
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
      <Pagination
        current={apiData?.pagination?.page || 1}
        pageSize={apiData?.pagination?.limit || 10}
        total={apiData?.pagination?.total || 0}
        onChange={(newPage, newPageSize) => {
          setPage(newPage);
          setPageSize(newPageSize);
        }}
        style={{ marginTop: 16, textAlign: "center" }}
      />
    </div>
  );
};

export default EmployeeNotifications;
