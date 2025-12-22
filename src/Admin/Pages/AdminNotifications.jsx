import React, { useState, useEffect, useCallback } from "react";
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
  Pagination,
  message,
  Form,
  Modal,
  Input,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  MoreOutlined,
  CloseOutlined,
  CheckOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  useClearAllNotificationMutation,
  useMarkAllReadMutation,
  useMarkAsReadByIdMutation,
  useDeleteNotificationMutation,
} from "../../Slices/Users/UserApis.js";
import { useGetAdminNotificationsQuery } from "../../Slices/Admin/AdminApis.js";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SkeletonLoader from "../../Global/SkeletonLoader.jsx";
import ReactMarkdown from "react-markdown";
import { useApproveRejectRequisitionMutation } from "../../Slices/Recruiter/RecruiterApis.js";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TextArea, Search } = Input;

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [form] = Form.useForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setPage(1);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  const [approveRejectRequisition, { isLoading: submittingAction }] =
    useApproveRejectRequisitionMutation();

  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useGetAdminNotificationsQuery({
    page,
    limit: pageSize,
    search: debouncedSearchTerm,
  });

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

  const handleApproveReject = (notification, action) => {
    setSelectedNotification(notification);
    setActionType(action);
    setModalVisible(true);
  };

  const handleSearch = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();

      await approveRejectRequisition({
        notificationId: selectedNotification._id,
        requisitionId: selectedNotification.requisitionId,
        status: actionType,
        remarks: values.remarks,
        isAdmin: true,
      }).unwrap();

      message.success(`Requisition ${actionType}d successfully`);
      setModalVisible(false);
      form.resetFields();
      setSelectedNotification(null);
      setActionType(null);
      refetch();
    } catch (error) {
      if (error.name !== "ValidationError") {
        message.error(`Failed to ${actionType} requisition`);
        console.error(`${actionType} error:`, error);
      }
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setSelectedNotification(null);
    setActionType(null);
  };

  const isRequisitionApprovalNotification = (notification) => {
    return (
      notification.requisitionId &&
      notification.title?.toLowerCase().includes("requisition") &&
      (notification.title?.toLowerCase().includes("assigned") ||
        notification.title?.toLowerCase().includes("requisition"))
    );
  };

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
      <div>
        <SkeletonLoader />
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
        <div style={{ marginBottom: "8px" }}>
          <Text
            strong
            style={{ fontSize: "16px", marginBottom: "8px", display: "block" }}
          >
            Search Notifications
          </Text>
          <Search
            placeholder="Search notifications by title, message, or type..."
            allowClear
            value={searchTerm}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            style={{ width: "100%" }}
            size="large"
            prefix={<SearchOutlined style={{ color: "#da2c46" }} />}
          />
          {debouncedSearchTerm && (
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Searching for: "{debouncedSearchTerm}"
                <Button
                  type="link"
                  size="small"
                  onClick={clearSearch}
                  style={{ padding: "0 4px", fontSize: "12px" }}
                >
                  Clear
                </Button>
              </Text>
            </div>
          )}
        </div>
      </Card>

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
                      <ReactMarkdown
                        style={{
                          marginBottom: "8px",
                          fontSize: "clamp(13px, 2.5vw, 14px)",
                          whiteSpace: "pre-line",
                        }}
                      >
                        {item.message}
                      </ReactMarkdown>
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ marginTop: "8px" }}
                      >
                        {isRequisitionApprovalNotification(item) &&
                          !item.Status && (
                            <Space style={{ marginTop: "12px" }}>
                              <Button
                                type="primary"
                                icon={<CheckOutlined />}
                                size="small"
                                style={{
                                  backgroundColor: "#52c41a",
                                  borderColor: "#52c41a",
                                }}
                                onClick={() =>
                                  handleApproveReject(item, "approved")
                                }
                              >
                                Approve
                              </Button>

                              <Button
                                danger
                                icon={<CloseOutlined />}
                                size="small"
                                onClick={() =>
                                  handleApproveReject(item, "rejected")
                                }
                              >
                                Reject
                              </Button>
                            </Space>
                          )}

                        {item.Status && (
                          <Tag
                            color={item.Status === "approved" ? "green" : "red"}
                            style={{ marginTop: "12px", fontWeight: "bold" }}
                          >
                            {item.Status.toUpperCase()}
                          </Tag>
                        )}

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

                        {item.redirectPath && (
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              navigate(item.redirectPath);
                            }}
                            style={{ padding: 0, color: "#da2c46" }}
                          >
                            Click here to visit →
                          </Button>
                        )}
                      </Space>
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
      </Card>
      <Modal
        title={`${
          actionType === "approved" ? "Approve" : "Reject"
        } Requisition`}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmLoading={submittingAction}
        okText={actionType === "approved" ? "Approve" : "Reject"}
        okButtonProps={{
          style:
            actionType === "approved"
              ? { backgroundColor: "#52c41a", borderColor: "#52c41a" }
              : { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" },
        }}
        cancelText="Cancel"
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ remarks: "" }}>
          <Form.Item
            name="remarks"
            label="Remarks"
            rules={[
              {
                required: true,
                message: "Please provide remarks for your decision",
              },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder={`Please provide your reason for ${
                actionType === "approved" ? "approving" : "rejecting"
              } this requisition...`}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminNotifications;
