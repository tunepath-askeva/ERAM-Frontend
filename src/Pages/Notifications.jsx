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
  Modal,
  Form,
  Input,
  Alert,
  Spin,
  Segmented,
  FloatButton,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  MoreOutlined,
  EyeOutlined,
  FileTextOutlined,
  CloseCircleOutlined,
  CheckOutlined,
  ClearOutlined,
  FilterOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  useClearAllNotificationMutation,
  useGetCandidateNotificationQuery,
  useMarkAllReadMutation,
  useMarkAsReadByIdMutation,
  useDeleteNotificationMutation,
  useUpdateCandidateOfferStatusMutation,
  useRequestOfferRevisionMutation,
} from "../Slices/Users/UserApis";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [offerLetterModalVisible, setOfferLetterModalVisible] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  // Modal states for different actions
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [revisionModalVisible, setRevisionModalVisible] = useState(false);

  // Forms for different actions
  const [acceptForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const [revisionForm] = Form.useForm();

  // Loading states for actions
  const [currentAction, setCurrentAction] = useState(null);

  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useGetCandidateNotificationQuery({ page, limit: pageSize });

  const [clearAllNotifications, { isLoading: clearingAll }] =
    useClearAllNotificationMutation();
  const [markAllAsRead, { isLoading: markingAllRead }] =
    useMarkAllReadMutation();
  const [markAsReadById, { isLoading: markingAsRead }] =
    useMarkAsReadByIdMutation();
  const [deleteNotification, { isLoading: deleting }] =
    useDeleteNotificationMutation();
  const [updateOfferStatus, { isLoading: updatingOffer }] =
    useUpdateCandidateOfferStatusMutation();
  const [requestOfferRevision, { isLoading: requestingRevision }] =
    useRequestOfferRevisionMutation();

  useEffect(() => {
    if (apiData) {
      const notificationsData = apiData.notifications || [];
      setNotifications(notificationsData);
      setFilteredNotifications(notificationsData);
      setLoading(false);
    }
    if (apiError) {
      setError(apiError);
      setLoading(false);
    }
  }, [apiData, apiError]);

  useEffect(() => {
    if (filterType === "all") {
      setFilteredNotifications(notifications);
    } else if (filterType === "unread") {
      setFilteredNotifications(notifications.filter((n) => !n.isRead));
    } else {
      setFilteredNotifications(
        notifications.filter((n) => n.type === filterType)
      );
    }
  }, [filterType, notifications]);

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
      setFilteredNotifications([]);
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

  // Open modals for different actions
  const handleAcceptOffer = (notification) => {
    setSelectedNotification(notification);
    setAcceptModalVisible(true);
  };

  const handleRejectOffer = (notification) => {
    setSelectedNotification(notification);
    setRejectModalVisible(true);
  };

  const handleRequestRevision = (notification) => {
    setSelectedNotification(notification);
    setRevisionModalVisible(true);
  };

  const handleViewOfferLetter = (notification) => {
    setSelectedNotification(notification);
    setOfferLetterModalVisible(true);
  };

  // Handle form submissions for different actions
  const handleAcceptOfferSubmit = async (values) => {
    try {
      setCurrentAction("accept");

      const payload = {
        workorderId: selectedNotification.workorderId,
        status: "offer-accepted",
        description: values.description || "",
      };

      await updateOfferStatus(payload).unwrap();

      message.success("Offer accepted successfully!");
      setAcceptModalVisible(false);
      acceptForm.resetFields();
      handleMarkAsRead(selectedNotification._id);
    } catch (error) {
      message.error("Failed to accept offer");
      console.error("Accept offer error:", error);
    } finally {
      setCurrentAction(null);
    }
  };

  const handleRejectOfferSubmit = async (values) => {
    try {
      setCurrentAction("reject");

      const payload = {
        workorderId: selectedNotification.workorderId,
        status: "offer-rejected",
        description: values.description,
      };

      await updateOfferStatus(payload).unwrap();

      message.success("Offer rejected");
      setRejectModalVisible(false);
      rejectForm.resetFields();
      handleMarkAsRead(selectedNotification._id);
    } catch (error) {
      message.error("Failed to reject offer");
      console.error("Reject offer error:", error);
    } finally {
      setCurrentAction(null);
    }
  };

  const handleSendRevisionRequest = async (values) => {
    try {
      setCurrentAction("revision");

      const payload = {
        workorderId: selectedNotification.workorderId,
        description: values.description,
      };

      await requestOfferRevision(payload).unwrap();

      message.success("Revision request sent successfully");
      setRevisionModalVisible(false);
      revisionForm.resetFields();
      handleMarkAsRead(selectedNotification._id);
    } catch (error) {
      message.error("Failed to send revision request");
      console.error("Send revision request error:", error);
    } finally {
      setCurrentAction(null);
    }
  };

  // Close modal handlers
  const handleCloseAcceptModal = () => {
    setAcceptModalVisible(false);
    acceptForm.resetFields();
  };

  const handleCloseRejectModal = () => {
    setRejectModalVisible(false);
    rejectForm.resetFields();
  };

  const handleCloseRevisionModal = () => {
    setRevisionModalVisible(false);
    revisionForm.resetFields();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "info":
        return (
          <InfoCircleOutlined style={{ color: "#1890ff", fontSize: "18px" }} />
        );
      case "success":
        return (
          <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
        );
      case "warning":
        return (
          <ExclamationCircleOutlined
            style={{ color: "#faad14", fontSize: "18px" }}
          />
        );
      case "error":
        return (
          <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: "18px" }} />
        );
      default:
        return <BellOutlined style={{ color: "#722ed1", fontSize: "18px" }} />;
    }
  };

  const getNotificationTag = (type) => {
    switch (type) {
      case "info":
        return (
          <Tag color="blue" icon={<InfoCircleOutlined />}>
            Info
          </Tag>
        );
      case "success":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Success
          </Tag>
        );
      case "warning":
        return (
          <Tag color="orange" icon={<ExclamationCircleOutlined />}>
            Warning
          </Tag>
        );
      case "error":
        return (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Alert
          </Tag>
        );
      default:
        return (
          <Tag color="purple" icon={<BellOutlined />}>
            Notification
          </Tag>
        );
    }
  };

  const isOfferLetterNotification = (notification) => {
    return notification.title.includes("Offer Letter Received");
  };

  const getNotificationActions = (item) => {
    const menuItems = [
      {
        key: "markRead",
        label: "Mark as read",
        icon: <CheckOutlined />,
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
      <div style={{ padding: "24px" }}>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  if (error || apiError) {
    return (
      <div style={{ padding: "24px" }}>
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
                borderRadius: "8px",
                padding: "8px 24px",
                height: "auto",
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
    <div style={{ padding: "16px 24px", minHeight: "100vh" }}>
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <Title
              level={2}
              style={{
                margin: 0,
                color: "#2c3e50",
                fontSize: "28px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #da2c46 0%, #a51632 100%)",
                  borderRadius: "12px",
                  width: "48px",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BellOutlined style={{ color: "white", fontSize: "24px" }} />
              </div>
              Notifications
            </Title>
            <Text
              type="secondary"
              style={{
                display: "block",
                marginTop: "8px",
                fontSize: "16px",
              }}
            >
              {unreadCount > 0
                ? `You have ${unreadCount} unread notifications`
                : "All caught up! You're all read."}
            </Text>
          </div>

          <Space>
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowSettings(!showSettings)}
              type={showSettings ? "primary" : "default"}
            >
              Filter
            </Button>
            {unreadCount > 0 && (
              <Button
                onClick={handleMarkAllAsRead}
                loading={markingAllRead}
                icon={<CheckOutlined />}
              >
                Mark all as read
              </Button>
            )}
            {notifications.length > 0 && (
              <Popconfirm
                title="Clear all notifications?"
                description="This will permanently delete all your notifications."
                onConfirm={handleClearAllNotifications}
                okText="Yes"
                cancelText="No"
                placement="bottomRight"
              >
                <Button danger loading={clearingAll} icon={<ClearOutlined />}>
                  Clear all
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        {showSettings && (
          <Card
            style={{
              marginBottom: "16px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Text strong>Filter by:</Text>
              <Segmented
                options={[
                  { label: "All", value: "all" },
                  { label: "Unread", value: "unread" },
                ]}
                value={filterType}
                onChange={setFilterType}
                size="large"
              />
            </Space>
          </Card>
        )}
      </div>

      <Card
        style={{
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
          border: "none",
          overflow: "hidden",
        }}
        bodyStyle={{ padding: 0 }}
      >
        {filteredNotifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "16px 24px",
                  backgroundColor: !item.isRead ? "#f0f7ff" : "transparent",
                  borderBottom: "1px solid #f0f0f0",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                actions={[getNotificationActions(item)]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!item.isRead} offset={[-5, 5]}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: !item.isRead
                            ? "linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%)"
                            : "#f9f9f9",
                        }}
                      >
                        {getNotificationIcon(item.type)}
                      </div>
                    </Badge>
                  }
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "4px",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: "16px",
                          color: !item.isRead ? "#2c3e50" : "#7f8c8d",
                        }}
                      >
                        {item.title}
                      </Text>
                      {getNotificationTag(item.type)}
                    </div>
                  }
                  description={
                    <div style={{ marginTop: "8px" }}>
                      <Paragraph
                        style={{
                          marginBottom: "8px",
                          fontSize: "14px",
                          color: !item.isRead ? "#2c3e50" : "#7f8c8d",
                        }}
                      >
                        {item.message}
                      </Paragraph>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
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

                        {/* Offer Letter Actions */}
                        {isOfferLetterNotification(item) && (
                          <div style={{ marginTop: "8px" }}>
                            <Space wrap>
                              <Button
                                type="primary"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewOfferLetter(item);
                                }}
                                icon={<EyeOutlined />}
                                style={{
                                  background:
                                    "linear-gradient(135deg, #da2c46 0%, #a51632 100%)",
                                  border: "none",
                                  borderRadius: "6px",
                                }}
                              >
                                View Offer
                              </Button>
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcceptOffer(item);
                                }}
                                icon={<CheckCircleOutlined />}
                                style={{
                                  background:
                                    "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                                  border: "none",
                                  color: "white",
                                  borderRadius: "6px",
                                }}
                              >
                                Accept
                              </Button>
                              <Button
                                size="small"
                                danger
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectOffer(item);
                                }}
                                icon={<CloseCircleOutlined />}
                                style={{ borderRadius: "6px" }}
                              >
                                Reject
                              </Button>
                              <Button
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRequestRevision(item);
                                }}
                                icon={<FileTextOutlined />}
                                style={{ borderRadius: "6px" }}
                              >
                                Request Revision
                              </Button>
                            </Space>
                          </div>
                        )}

                        {!item.isRead && !isOfferLetterNotification(item) && (
                          <Button
                            type="link"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(item._id);
                            }}
                            style={{ padding: 0, fontSize: "12px" }}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text
                style={{
                  fontSize: "16px",
                  color: "#7f8c8d",
                }}
              >
                No notifications found
              </Text>
            }
            style={{ padding: "60px 0" }}
          />
        )}

        <div style={{ padding: "16px 24px", borderTop: "1px solid #f0f0f0" }}>
          <Pagination
            current={apiData?.pagination?.page || 1}
            pageSize={apiData?.pagination?.limit || 10}
            total={apiData?.pagination?.total || 0}
            onChange={(newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
            style={{ textAlign: "center" }}
          />
        </div>
      </Card>

      {/* Accept Offer Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <span>Accept Offer Letter</span>
          </div>
        }
        open={acceptModalVisible}
        onCancel={handleCloseAcceptModal}
        footer={null}
        width={600}
        style={{ borderRadius: "12px" }}
      >
        <Form
          form={acceptForm}
          layout="vertical"
          onFinish={handleAcceptOfferSubmit}
        >
          <Alert
            message="You are about to accept this offer letter. Please provide any additional comments or confirmation message."
            type="success"
            style={{ marginBottom: 16, borderRadius: "8px" }}
          />

          <Form.Item
            name="description"
            label="Comments (Optional)"
            rules={[
              {
                max: 500,
                message: "Comments cannot exceed 500 characters",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Please provide any comments regarding your acceptance..."
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={handleCloseAcceptModal}
                style={{ borderRadius: "6px" }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updatingOffer && currentAction === "accept"}
                style={{
                  background:
                    "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Accept Offer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Offer Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
            <span>Reject Offer Letter</span>
          </div>
        }
        open={rejectModalVisible}
        onCancel={handleCloseRejectModal}
        footer={null}
        width={600}
        style={{ borderRadius: "12px" }}
      >
        <Form
          form={rejectForm}
          layout="vertical"
          onFinish={handleRejectOfferSubmit}
        >
          <Alert
            message="You are about to reject this offer letter. Please provide a reason for rejection."
            type="warning"
            style={{ marginBottom: 16, borderRadius: "8px" }}
          />

          <Form.Item
            name="description"
            label="Reason for Rejection"
            rules={[
              {
                required: true,
                message: "Please provide a reason for rejection",
              },
              {
                max: 500,
                message: "Reason cannot exceed 500 characters",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Please specify why you are rejecting this offer..."
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={handleCloseRejectModal}
                style={{ borderRadius: "6px" }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                danger
                style={{ borderRadius: "6px" }}
              >
                Reject Offer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Revision Request Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileTextOutlined style={{ color: "#1890ff" }} />
            <span>Request Offer Letter Revision</span>
          </div>
        }
        open={revisionModalVisible}
        onCancel={handleCloseRevisionModal}
        footer={null}
        width={600}
        style={{ borderRadius: "12px" }}
      >
        <Form
          form={revisionForm}
          layout="vertical"
          onFinish={handleSendRevisionRequest}
        >
          <Alert
            message="Please provide detailed information about what changes you'd like in the offer letter"
            type="info"
            style={{ marginBottom: 16, borderRadius: "8px" }}
          />

          <Form.Item
            name="description"
            label="Revision Requirements"
            rules={[
              {
                required: true,
                message: "Please provide revision requirements",
              },
              {
                max: 1000,
                message: "Requirements cannot exceed 1000 characters",
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Please specify what changes you would like in the offer letter..."
              style={{ borderRadius: "8px" }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={handleCloseRevisionModal}
                style={{ borderRadius: "6px" }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={requestingRevision && currentAction === "revision"} // Update this line
                style={{ borderRadius: "6px" }}
              >
                Send Revision Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Offer Letter View Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileTextOutlined />
            <span>Offer Letter</span>
          </div>
        }
        open={offerLetterModalVisible}
        onCancel={() => setOfferLetterModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setOfferLetterModalVisible(false)}
            style={{ borderRadius: "6px" }}
          >
            Close
          </Button>,
        ]}
        width={900}
        style={{ top: 20, borderRadius: "12px" }}
      >
        {selectedNotification && selectedNotification.fileUrl ? (
          <div>
            <Alert
              message="This is your official offer letter. You can view it below and use the action buttons in the notification to accept, reject, or request revisions."
              type="info"
              style={{ marginBottom: 16, borderRadius: "8px" }}
            />

            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                height: "70vh",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {pdfLoading && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10,
                  }}
                >
                  <Spin size="large" />
                </div>
              )}

              {/* PDF Viewer with restricted controls */}
              <embed
                src={`${selectedNotification.fileUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=100`}
                type="application/pdf"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                onLoad={() => setPdfLoading(false)}
                onError={() => {
                  setPdfLoading(false);
                  message.error("Failed to load offer letter.");
                }}
              />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Result
              status="warning"
              title="No Offer Letter Available"
              subTitle="The offer letter file is not available for this notification."
            />
          </div>
        )}
      </Modal>

      <FloatButton.BackTop visibilityHeight={100} />

      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }

        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
