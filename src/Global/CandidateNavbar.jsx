import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import { useLogoutSuperAdminMutation } from "../Slices/SuperAdmin/SuperAdminApis.js";
import { userLogout } from "../Slices/Users/UserSlice.js";
import {
  Layout,
  Avatar,
  Dropdown,
  Menu,
  Button,
  Badge,
  List,
  Typography,
  Empty,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuOutlined,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  BellOutlined,
  MailOutlined,
} from "@ant-design/icons";
import styled from "styled-components";
import { socket } from "../utils/socket.js";
import { notification } from "antd";
import { useGetCandidateNotificationQuery } from "../Slices/Users/UserApis.js";

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

const CandidateNavbar = ({ collapsed, setCollapsed, setDrawerVisible }) => {
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

  const [candidateInfo, setCandidateInfo] = useState({
    name: "Candidate",
    email: "",
    roles: "",
  });

  const [notificationList, setNotificationList] = useState([]);
  const [notificationVisible, setNotificationVisible] = useState(false);

  const [logout] = useLogoutSuperAdminMutation();
  const { data: notifications } = useGetCandidateNotificationQuery();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(notifications, "hi notificaiotns");

  useEffect(() => {
    const candidateDataRaw =
      localStorage.getItem("candidateInfo") ||
      localStorage.getItem("candidate");

    const candidateData = candidateDataRaw
      ? JSON.parse(candidateDataRaw)
      : null;

    if (!candidateData?.email) return;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", candidateData.email.toLowerCase());
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
    const fetchCandidateInfo = () => {
      try {
        const possibleKeys = ["candidateInfo", "candidate"];

        let candidateData = null;
        let foundKey = null;

        for (const key of possibleKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            candidateData = data;
            foundKey = key;
            break;
          }
        }

        if (candidateData) {
          const parsedData = JSON.parse(candidateData);

          // Extract name with multiple fallbacks
          const name =
            parsedData.name ||
            parsedData.fullName ||
            parsedData.candidateName ||
            (parsedData.firstName && parsedData.lastName
              ? `${parsedData.firstName} ${parsedData.lastName}`
              : null) ||
            (parsedData.first_name && parsedData.last_name
              ? `${parsedData.first_name} ${parsedData.last_name}`
              : null) ||
            "Candidate";

          const email = parsedData.email || parsedData.candidateEmail || "";

          let roles = "";
          if (parsedData.roles) {
            if (Array.isArray(parsedData.roles)) {
              roles = parsedData.roles.join(", ");
            } else {
              roles = parsedData.roles;
            }
          } else {
            roles = parsedData.role || parsedData.candidateRole || "";
          }

          const extractedInfo = {
            name: name,
            email: email,
            roles: roles,
          };

          setCandidateInfo(extractedInfo);
        } else {
          console.warn("No candidate data found in localStorage");

          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
          }
        }
      } catch (error) {
        console.error("Error parsing candidate info from localStorage:", error);
      }
    };

    fetchCandidateInfo();

    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes("candidate") || e.key.includes("user"))) {
        fetchCandidateInfo();
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

  const combinedNotifications = [
    ...(notifications?.notification || []),
    ...notificationList,
  ];

    const unreadNotifications = combinedNotifications.filter((n) => !n.isRead);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(userLogout({ role: "candidate" }));

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

  const handleNotificationClick = () => {};

  const getFirstLetter = () => {
    return candidateInfo.name.charAt(0).toUpperCase();
  };

  const notificationMenu = (
  <div
    style={{
      maxWidth: 300,
      maxHeight: 300,
      overflowY: "auto",
      padding: "10px",
    }}
  >
    {unreadNotifications.length === 0 ? (
      <Empty
        description="No new notifications"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    ) : (
      <>
        <List
          dataSource={unreadNotifications}
          renderItem={(item) => (
            <List.Item
              key={item._id}
              onClick={() => handleNotificationClick(item)}
              style={{
                cursor: "pointer",
                backgroundColor: "#e6f7ff",
                borderLeft: "4px solid #1890ff",
                paddingLeft: 10,
              }}
            >
              <div>
                <Text strong>{item.title}</Text>
                <br />
                <Text type="secondary">{item.message}</Text>
              </div>
            </List.Item>
          )}
        />
        <div style={{ textAlign: "center", marginTop: 10 }}>
          <Button type="link" onClick={() => navigate("/notifications")}>
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
          <UserName>{candidateInfo.name}</UserName>
          {candidateInfo.roles && (
            <div
              style={{
                color: "#64748b",
                fontSize: "11px",
                marginTop: "4px",
                fontWeight: "500",
              }}
            >
              {candidateInfo.roles}
            </div>
          )}
          {candidateInfo.email && (
            <UserEmail>
              <MailOutlined style={{ fontSize: "12px" }} />
              {candidateInfo.email}
            </UserEmail>
          )}
        </UserInfoContainer>
      ),
      disabled: true,
    },
    {
      key: "",
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
        >
          <Badge
            count={combinedNotifications.filter((n) => !n.isRead).length}
            size="small"
          >
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
            {candidateInfo.name ? getFirstLetter() : <UserOutlined />}
          </Avatar>
        </Dropdown>
      </div>
    </AppBar>
  );
};

export default CandidateNavbar;
