import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack"; // Add this import
import { useLogoutSuperAdminMutation } from "../../Slices/SuperAdmin/SuperAdminApis.js";
import { userLogout } from "../../Slices/Users/UserSlice.js";

import {
  Layout,
  Avatar,
  Dropdown,
  Menu,
  Button,
  Badge,
  Space,
  Empty,
  Popconfirm,
  List,
  Typography,
  Tag,
  notification,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  BellOutlined,
  MailOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { socket } from "../../utils/socket.js";
import { useGetEmployeeNotificationQuery } from "../../Slices/Employee/EmployeeApis.js";
import {
  useClearAllNotificationMutation,
  useMarkAllReadMutation,
  useMarkAsReadByIdMutation,
  useDeleteNotificationMutation,
} from "../../Slices/Users/UserApis.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const { Header } = Layout;
const { Text } = Typography;

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  largeDesktop: 1600,
};

const AppBar = styled(Header)`
  background: #ffffff !important;
  padding: 0 ${(props) => props.padding}px;
  height: ${(props) => props.height}px;
  line-height: ${(props) => props.height}px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: fixed !important;
  top: 0;
  left: ${(props) => props.leftMargin}px !important;
  right: 0 !important;
  z-index: 99 !important;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e8e8e8;
  transition: all 0.3s ease;

  @media (max-width: ${BREAKPOINTS.mobile}px) {
    padding: 0 12px;
    height: 56px;
    line-height: 56px;
    left: 0 !important;
  }

  @media (min-width: ${BREAKPOINTS.mobile}px) and (max-width: ${BREAKPOINTS.tablet}px) {
    padding: 0 16px;
    height: 60px;
    line-height: 60px;
  }

  @media (min-width: ${BREAKPOINTS.largeDesktop}px) {
    padding: 0 32px;
    height: 68px;
    line-height: 68px;
  }
`;

const NavButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f7fafc !important;
    border-color: transparent !important;
  }

  &:focus {
    background-color: #f7fafc !important;
    border-color: transparent !important;
  }
`;

const UserInfoContainer = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  background: #f8f9fa;
  margin: -8px -12px 8px -12px;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2a4365;
  font-size: 14px;
  margin-bottom: 2px;
`;

const UserEmail = styled.div`
  color: #64748b;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EmployeeAdminNavbar = ({ collapsed, setCollapsed, setDrawerVisible }) => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth < BREAKPOINTS.mobile,
    isTablet:
      window.innerWidth >= BREAKPOINTS.mobile &&
      window.innerWidth < BREAKPOINTS.tablet,
    isDesktop:
      window.innerWidth >= BREAKPOINTS.tablet &&
      window.innerWidth < BREAKPOINTS.largeDesktop,
    isLargeDesktop: window.innerWidth >= BREAKPOINTS.largeDesktop,
  });

  const [employeeInfo, setEmployeeInfo] = useState({
    name: "Employee Admin",
    email: "",
    roles: "",
  });

  const [notificationList, setNotificationList] = useState([]);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [page, setPage] = useState(1);

  const [logout] = useLogoutSuperAdminMutation();
  const { data: notifications, refetch: refetchNotifications } =
    useGetEmployeeNotificationQuery({ page, limit: 10 });
  const [clearAllNotifications, { isLoading: clearingAll }] =
    useClearAllNotificationMutation();
  const [markAllAsRead, { isLoading: markingAllRead }] =
    useMarkAllReadMutation();
  const [markAsReadById, { isLoading: markingAsRead }] =
    useMarkAsReadByIdMutation();
  const [deleteNotification, { isLoading: deleting }] =
    useDeleteNotificationMutation();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const recruiterDataRaw =
      localStorage.getItem("recruiterInfo") ||
      localStorage.getItem("recruiter");

    const recruiterData = recruiterDataRaw
      ? JSON.parse(recruiterDataRaw)
      : null;

    if (!recruiterData?.email) return;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", recruiterData.email.toLowerCase());
    });

    socket.on("notification", (data) => {
      notification.open({
        message: data.title,
        description: data.message,
        placement: "topRight",
        duration: 4,
      });

      setNotificationList((prevList) => [data, ...prevList]);
    });

    return () => {
      socket.off("connect");
      socket.off("notification");
    };
  }, []);

  useEffect(() => {
    const fetchEmployeeInfo = () => {
      try {
        const possibleKeys = ["recruiterInfo", "recruiter"];

        let employeeData = null;
        let foundKey = null;

        for (const key of possibleKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            employeeData = data;
            foundKey = key;
            console.log(`Found employee data in localStorage key: ${key}`);
            break;
          }
        }

        if (employeeData) {
          const parsedData = JSON.parse(employeeData);
          console.log(`Parsed data from ${foundKey}:`, parsedData);

          const name =
            parsedData.name ||
            parsedData.fullName ||
            parsedData.employeeName ||
            (parsedData.firstName && parsedData.lastName
              ? `${parsedData.firstName} ${parsedData.lastName}`
              : null) ||
            (parsedData.first_name && parsedData.last_name
              ? `${parsedData.first_name} ${parsedData.last_name}`
              : null) ||
            "Employee";

          const email = parsedData.email || parsedData.employeeEmail || "";

          let roles = "";
          if (parsedData.roles) {
            if (Array.isArray(parsedData.roles)) {
              roles = parsedData.roles.join(", ");
            } else {
              roles = parsedData.roles;
            }
          } else {
            roles = parsedData.role || parsedData.employeeRole || "";
          }

          const extractedInfo = {
            name: name,
            email: email,
            roles: roles,
          };

          console.log("Extracted employee info:", extractedInfo);
          setEmployeeInfo(extractedInfo);
        } else {
          console.warn("No employee data found in localStorage");
          console.log(
            "Available localStorage keys:",
            Object.keys(localStorage)
          );

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            console.log(`localStorage[${key}]:`, value);
          }
        }
      } catch (error) {
        console.error("Error parsing employee info from localStorage:", error);
      }
    };

    fetchEmployeeInfo();

    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes("employee") || e.key.includes("user"))) {
        console.log("localStorage changed for key:", e.key);
        fetchEmployeeInfo();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop:
          width >= BREAKPOINTS.tablet && width < BREAKPOINTS.largeDesktop,
        isLargeDesktop: width >= BREAKPOINTS.largeDesktop,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const combinedNotifications = [
    ...(notifications?.notifications || []), // ✅ plural
    ...notificationList,
  ];

  const unreadNotifications = combinedNotifications.filter((n) => !n.isRead);

  const handleMarkAsRead = async (id) => {
    try {
      await markAsReadById(id).unwrap();

      // Update local state
      if (notifications?.notifications?.some((n) => n._id === id)) {
        refetchNotifications();
      } else {
        setNotificationList((prev) =>
          prev.map((notification) =>
            notification._id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }

      // Optional: Show success message
      enqueueSnackbar("Notification marked as read", { variant: "success" });
    } catch (error) {
      console.error("Mark as read error:", error);
      enqueueSnackbar("Failed to mark notification as read", {
        variant: "error",
      });
    }
  };

  const handleDeleteNotification = (id) => {
    // Update local state
    if (notifications?.notifications?.some((n) => n._id === id)) {
      // This is from API data
      // In a real app, you would make an API call here to delete
      refetchNotifications();
    } else {
      // This is from socket data
      setNotificationList((prev) =>
        prev.filter((notification) => notification._id !== id)
      );
    }
  };

  const handleMarkAsReads = async (id) => {
    try {
      await markAsReadById(id).unwrap();

      // Update local state
      if (notifications?.notifications?.some((n) => n._id === id)) {
        refetchNotifications();
      } else {
        setNotificationList((prev) =>
          prev.map((notification) =>
            notification._id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }

      // Optional: Show success message
      enqueueSnackbar("Notification marked as read", { variant: "success" });
    } catch (error) {
      console.error("Mark as read error:", error);
      enqueueSnackbar("Failed to mark notification as read", {
        variant: "error",
      });
    }
  };

  const markAllAsReads = async () => {
    try {
      await markAllAsRead().unwrap();

      // Update local state
      refetchNotifications();
      setNotificationList((prev) =>
        prev.map((notification) => ({ ...notification, isRead: true }))
      );

      enqueueSnackbar("All notifications marked as read", {
        variant: "success",
      });
    } catch (error) {
      console.error("Mark all as read error:", error);
      enqueueSnackbar("Failed to mark all notifications as read", {
        variant: "error",
      });
    }
  };

  const clearAllNotification = async () => {
    try {
      await clearAllNotifications().unwrap();

      // Clear local state
      setNotificationList([]);
      refetchNotifications();

      enqueueSnackbar("All notifications cleared", { variant: "success" });
    } catch (error) {
      console.error("Clear all notifications error:", error);
      enqueueSnackbar("Failed to clear notifications", { variant: "error" });
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

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      handleMarkAsRead(item._id || item.id);
    }

    if (item.link) {
      navigate(item.link);
    }
  };

  const getNavbarHeight = () => {
    if (screenSize.isMobile) return 56;
    if (screenSize.isTablet) return 60;
    if (screenSize.isLargeDesktop) return 68;
    return 64;
  };

  const getPadding = () => {
    if (screenSize.isMobile) return 12;
    if (screenSize.isTablet) return 16;
    if (screenSize.isLargeDesktop) return 32;
    return 24;
  };

  const getIconSize = () => {
    if (screenSize.isMobile) return "16px";
    if (screenSize.isTablet) return "17px";
    return "18px";
  };

  const getButtonSize = () => {
    if (screenSize.isMobile) return 36;
    if (screenSize.isTablet) return 38;
    return 40;
  };

  const getAvatarSize = () => {
    if (screenSize.isMobile) return 32;
    if (screenSize.isTablet) return 36;
    return 40;
  };

  const getNavbarLeftMargin = () => {
    if (screenSize.isMobile) return 0;

    const sidebarWidth = screenSize.isTablet ? 220 : 250;
    const collapsedWidth = screenSize.isTablet ? 70 : 80;

    return collapsed ? collapsedWidth : sidebarWidth;
  };

  const getToggleIcon = () => {
    const iconStyle = {
      fontSize: getIconSize(),
      color: "#2a4365",
    };

    if (screenSize.isMobile) {
      return <MenuOutlined style={iconStyle} />;
    }

    return collapsed ? (
      <DoubleRightOutlined style={iconStyle} />
    ) : (
      <DoubleLeftOutlined style={iconStyle} />
    );
  };

  const toggleSidebar = () => {
    if (screenSize.isMobile) {
      setDrawerVisible(true);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(userLogout({ role: "recruiter" }));

      enqueueSnackbar("Logged out successfully", {
        variant: "success",
        anchorOrigin: { vertical: "top", horizontal: "right" },
        autoHideDuration: 3000,
      });

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      enqueueSnackbar(
        error?.data?.message ||
          error?.message ||
          "Logout failed. Please try again.",
        {
          variant: "error",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 3000,
        }
      );
    }
  };

  const getFirstLetter = () => {
    return employeeInfo.name.charAt(0).toUpperCase();
  };

  const notificationMenu = (
    <div
      style={{
        width: screenSize.isMobile ? "calc(100vw - 24px)" : "min(400px, 90vw)",
        maxHeight: screenSize.isMobile ? "calc(100vh - 120px)" : "500px",
        overflowY: "auto",
        padding: "0",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        backgroundColor: "#ffffff",
        position: screenSize.isMobile ? "fixed" : "relative",
        left: screenSize.isMobile ? "12px" : "auto",
        top: screenSize.isMobile ? "12px" : "auto",
      }}
    >
      {combinedNotifications.length === 0 ? (
        <div
          style={{
            padding: screenSize.isMobile ? "16px 12px" : "24px 16px",
            textAlign: "center",
          }}
        >
          <Empty
            description={
              <span
                style={{
                  color: "#666",
                  fontSize: screenSize.isMobile ? "13px" : "14px",
                  lineHeight: "1.4",
                }}
              >
                No notifications available
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{
              height: screenSize.isMobile ? 45 : 60,
              marginBottom: screenSize.isMobile ? "8px" : "12px",
            }}
          />
        </div>
      ) : (
        <>
          <div
            style={{
              padding: screenSize.isMobile ? "12px" : "16px",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: screenSize.isMobile ? "sticky" : "static",
              top: 0,
              background: "#fff",
              zIndex: 1,
            }}
          >
            <Text
              strong
              style={{
                fontSize: screenSize.isMobile ? "15px" : "16px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: screenSize.isMobile ? "60%" : "none",
              }}
            >
              <BellOutlined
                style={{
                  marginRight: screenSize.isMobile ? 6 : 8,
                  color: "#da2c46",
                  fontSize: screenSize.isMobile ? "14px" : "16px",
                }}
              />
              Notifications
            </Text>
            <Space size={screenSize.isMobile ? 4 : 8}>
              {unreadNotifications.length > 0 && (
                <Button
                  type="link"
                  size="small"
                  onClick={markAllAsReads}
                  loading={markingAllRead}
                  style={{
                    fontSize: screenSize.isMobile ? "12px" : "13px",
                    padding: screenSize.isMobile ? "0 4px" : "0 8px",
                    height: "auto",
                  }}
                >
                  Mark all
                </Button>
              )}
              <Popconfirm
                title="Clear all notifications?"
                onConfirm={clearAllNotification}
                okText="Yes"
                cancelText="No"
                placement="bottomRight"
                overlayStyle={{
                  width: screenSize.isMobile ? "80vw" : "auto",
                }}
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  loading={clearingAll}
                  style={{
                    fontSize: screenSize.isMobile ? "12px" : "13px",
                    padding: screenSize.isMobile ? "0 4px" : "0 8px",
                    height: "auto",
                  }}
                >
                  Clear all
                </Button>
              </Popconfirm>
            </Space>
          </div>
          <List
            dataSource={combinedNotifications}
            renderItem={(item) => (
              <List.Item
                key={item._id || item.id}
                onClick={() => handleNotificationClick(item)}
                style={{
                  cursor: "pointer",
                  padding: screenSize.isMobile ? "10px 12px" : "12px 16px",
                  borderBottom: "1px solid #f5f5f5",
                  transition: "all 0.2s",
                  backgroundColor: !item.isRead ? "#f6f9ff" : "transparent",
                  ":hover": {
                    backgroundColor: "#f9f9f9",
                  },
                }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: screenSize.isMobile ? "4px" : "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: screenSize.isMobile ? "4px" : "8px",
                        flexWrap: "wrap",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Avatar
                        icon={getNotificationIcon(item.type)}
                        style={{
                          backgroundColor: "transparent",
                          fontSize: screenSize.isMobile ? "16px" : "20px",
                          marginRight: screenSize.isMobile ? "4px" : "8px",
                          flexShrink: 0,
                        }}
                      />
                      <Text
                        strong
                        style={{
                          fontSize: screenSize.isMobile ? "13px" : "14px",
                          flex: 1,
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </Text>
                      {item.type && (
                        <Tag
                          color={
                            item.type === "info"
                              ? "blue"
                              : item.type === "success"
                              ? "green"
                              : item.type === "warning"
                              ? "orange"
                              : item.type === "error"
                              ? "red"
                              : "purple"
                          }
                          style={{
                            margin: 0,
                            fontSize: screenSize.isMobile ? "10px" : "12px",
                            padding: screenSize.isMobile ? "0 4px" : "0 6px",
                            lineHeight: "18px",
                            flexShrink: 0,
                          }}
                        >
                          {item.type.charAt(0).toUpperCase() +
                            item.type.slice(1)}
                        </Tag>
                      )}
                    </div>
                    {!item.isRead && (
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: "#1890ff",
                          flexShrink: 0,
                          marginTop: screenSize.isMobile ? "4px" : "6px",
                          marginLeft: "4px",
                        }}
                      />
                    )}
                  </div>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: screenSize.isMobile ? "12px" : "13px",
                      display: "block",
                      lineHeight: "1.4",
                      marginBottom: screenSize.isMobile ? "4px" : "8px",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.message}
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {item.createdAt && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: screenSize.isMobile ? "10px" : "11px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <ClockCircleOutlined
                          style={{
                            fontSize: screenSize.isMobile ? "10px" : "11px",
                          }}
                        />
                        {dayjs(item.createdAt || item.timestamp).fromNow()}
                      </Text>
                    )}
                    {!item.isRead && (
                      <Button
                        type="link"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsReads(item._id || item.id);
                        }}
                        loading={markingAsRead}
                        style={{
                          padding: 0,
                          fontSize: screenSize.isMobile ? "10px" : "11px",
                          height: "auto",
                        }}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div
            style={{
              padding: screenSize.isMobile ? "10px 12px" : "12px 16px",
              borderTop: "1px solid #f0f0f0",
              textAlign: "center",
              position: screenSize.isMobile ? "sticky" : "static",
              bottom: 0,
              background: "#fff",
              zIndex: 1,
            }}
          >
            <Button
              type="text"
              onClick={() => navigate("/employee-admin/notifications")}
              style={{
                color: "#da2c46",
                fontWeight: 500,
                fontSize: screenSize.isMobile ? "13px" : "14px",
                padding: screenSize.isMobile ? "0 8px" : "0 12px",
                width: "100%",
              }}
            >
              View All Notifications
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const userMenuItems = [
    {
      key: "user-info",
      label: (
        <UserInfoContainer>
          <UserName>{employeeInfo.name}</UserName>
          {employeeInfo.roles && (
            <div
              style={{
                color: "#64748b",
                fontSize: "11px",
                marginTop: "4px",
                fontWeight: "500",
              }}
            >
              {employeeInfo.roles}
            </div>
          )}
          {employeeInfo.email && (
            <UserEmail>
              <MailOutlined style={{ fontSize: "12px" }} />
              {employeeInfo.email}
            </UserEmail>
          )}
        </UserInfoContainer>
      ),
      disabled: true,
    },
    {
      key: "profile",
      icon: <UserOutlined style={{ color: "#2a4365" }} />,
      label: "Profile",
      onClick: () => navigate("/superadmin/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: <span style={{ color: "#ff4d4f" }}>Logout</span>,
      onClick: () => handleLogout(),
    },
  ];

  return (
    <AppBar
      height={getNavbarHeight()}
      padding={getPadding()}
      leftMargin={getNavbarLeftMargin()}
    >
      <NavButton
        type="text"
        icon={getToggleIcon()}
        onClick={toggleSidebar}
        style={{
          marginRight: screenSize.isMobile ? "8px" : "16px",
          width: getButtonSize(),
          height: getButtonSize(),
        }}
      />

      {!screenSize.isMobile && (
        <div
          style={{
            fontSize: screenSize.isTablet ? "16px" : "18px",
            fontWeight: 600,
            color: "#2a4365",
            marginRight: "auto",
          }}
        >
          {" "}
        </div>
      )}

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: screenSize.isMobile ? "8px" : "12px",
        }}
      >
        <Dropdown
          overlay={notificationMenu}
          trigger={["click"]}
          onOpenChange={(open) => setNotificationVisible(open)}
          placement="bottomRight"
        >
          <Badge count={unreadNotifications.length} size="small">
            <NavButton
              type="text"
              icon={
                <BellOutlined
                  style={{
                    color: "#2a4365",
                    fontSize: getIconSize(),
                  }}
                />
              }
              style={{
                width: getButtonSize(),
                height: getButtonSize(),
              }}
            />
          </Badge>
        </Dropdown>

        <Dropdown
          menu={{
            items: userMenuItems,
          }}
          placement="bottomRight"
          trigger={["click"]}
          arrow={!screenSize.isMobile}
        >
          <Avatar
            size={getAvatarSize()}
            style={{
              backgroundColor: "#2c5282",
              cursor: "pointer",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
              fontWeight: "600",
            }}
          >
            {employeeInfo.name ? getFirstLetter() : <UserOutlined />}
          </Avatar>
        </Dropdown>
      </div>
    </AppBar>
  );
};

export default EmployeeAdminNavbar;
