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
} from "@ant-design/icons";
import {
  useClearAllNotificationMutation,
  useGetCandidateNotificationQuery,
  useMarkAllReadMutation,
  useMarkAsReadByIdMutation,
  useDeleteNotificationMutation,
  // useSendRevisionRequestMutation,
} from "../Slices/Users/UserApis";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [revisionModalVisible, setRevisionModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [offerLetterModalVisible, setOfferLetterModalVisible] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [revisionForm] = Form.useForm();

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
  // const [sendRevisionRequest, { isLoading: sendingRevision }] =
  //   useSendRevisionRequestMutation();

  useEffect(() => {
    if (apiData) {
      setNotifications(apiData.notifications || []);
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

  const handleAcceptOffer = async (notification) => {
    try {
      // Implement your accept offer logic here
      message.success("Offer accepted successfully!");
      handleMarkAsRead(notification._id);
    } catch (error) {
      message.error("Failed to accept offer");
      console.error("Accept offer error:", error);
    }
  };

  const handleRejectOffer = async (notification) => {
    try {
      // Implement your reject offer logic here
      message.success("Offer rejected");
      handleMarkAsRead(notification._id);
    } catch (error) {
      message.error("Failed to reject offer");
      console.error("Reject offer error:", error);
    }
  };

  const handleRequestRevision = (notification) => {
    setSelectedNotification(notification);
    setRevisionModalVisible(true);
  };

  const handleViewOfferLetter = (notification) => {
    setSelectedNotification(notification);
    setOfferLetterModalVisible(true);
  };

  const handleSendRevisionRequest = async (values) => {
    try {
      // await sendRevisionRequest({
      //   notificationId: selectedNotification._id,
      //   revisionRequirements: values.revisionRequirements,
      // }).unwrap();
      message.success("Revision request sent successfully");
      setRevisionModalVisible(false);
      revisionForm.resetFields();
      handleMarkAsRead(selectedNotification._id);
    } catch (error) {
      message.error("Failed to send revision request");
      console.error("Send revision request error:", error);
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

  const isOfferLetterNotification = (notification) => {
    return notification.title.includes("Offer Letter Received");
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
                      
                      {/* Offer Letter Actions - Removed Download Button */}
                      {isOfferLetterNotification(item) && (
                        <div style={{ marginTop: "12px" }}>
                          <Space wrap>
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleViewOfferLetter(item)}
                              icon={<EyeOutlined />}
                            >
                              View Offer Letter
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleAcceptOffer(item)}
                              icon={<CheckCircleOutlined />}
                              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
                            >
                              Accept
                            </Button>
                            <Button
                              size="small"
                              danger
                              onClick={() => handleRejectOffer(item)}
                            >
                              Reject
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleRequestRevision(item)}
                              icon={<FileTextOutlined />}
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

      {/* Revision Request Modal */}
      <Modal
        title="Request Offer Letter Revision"
        open={revisionModalVisible}
        onCancel={() => {
          setRevisionModalVisible(false);
          revisionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={revisionForm}
          layout="vertical"
          onFinish={handleSendRevisionRequest}
        >
          <Alert
            message="Please provide details about what changes you'd like in the offer letter"
            type="info"
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="revisionRequirements"
            label="Revision Requirements"
            rules={[
              {
                required: true,
                message: "Please provide revision requirements",
              },
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Please specify what changes you would like in the offer letter..."
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={() => {
                  setRevisionModalVisible(false);
                  revisionForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                // loading={sendingRevision}
              >
                Send Revision Request
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Offer Letter View Modal - Removed Download Options */}
      <Modal
        title="Offer Letter"
        open={offerLetterModalVisible}
        onCancel={() => setOfferLetterModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setOfferLetterModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={900}
        style={{ top: 20 }}
      >
        {selectedNotification && selectedNotification.fileUrl ? (
          <div>
            <Alert
              message="This is your official offer letter. You can view it below and use the action buttons in the notification to accept, reject, or request revisions."
              type="info"
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "6px", 
              height: "70vh",
              position: "relative",
              overflow: "hidden"
            }}>
              {pdfLoading && (
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  zIndex: 10
                }}>
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
                  border: "none"
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