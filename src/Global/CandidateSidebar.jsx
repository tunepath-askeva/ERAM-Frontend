import React, { useState, useEffect } from "react";
import { Layout, Button, Drawer, Badge } from "antd";
import {
  BulbOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  FormOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useLogoutSuperAdminMutation } from "../Slices/SuperAdmin/SuperAdminApis.js";
import { userLogout } from "../Slices/Users/UserSlice.js";
import { useGetCandidateNotificationQuery } from "../Slices/Users/UserApis.js";

const { Sider } = Layout;

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

const CandidateSidebar = ({
  collapsed,
  setCollapsed,
  setDrawerVisible,
  drawerVisible,
}) => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth < BREAKPOINTS.mobile,
    isTablet:
      window.innerWidth >= BREAKPOINTS.mobile &&
      window.innerWidth < BREAKPOINTS.tablet,
    isDesktop: window.innerWidth >= BREAKPOINTS.desktop,
  });

  const [candidateInfo, setCandidateInfo] = useState({
    name: "Candidate",
    email: "",
    roles: "",
  });

  const [logout] = useLogoutSuperAdminMutation();
  const { enqueueSnackbar } = useSnackbar();
  const [hoveredKey, setHoveredKey] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const selectedKey = location.pathname;
  const { data: notifications } = useGetCandidateNotificationQuery();

  const unreadNotificationsCount =
    notifications?.notification?.filter((n) => !n.isRead).length || 0;

  const menuItems = [
    {
      key: "/candidate-jobs",
      icon: <BulbOutlined />,
      label: "Jobs",
    },
    {
      key: "/candidate-applied-jobs",
      icon: <FormOutlined />,
      label: "Applied Jobs",
    },
    {
      key: "/candidate-documents",
      icon: <FilePdfOutlined />,
      label: "Documents",
    },
    {
      key: "/candidate-settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      key: "/notifications",
      icon: <BellOutlined />,
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span>Notifications</span>
          {unreadNotificationsCount > 0 && (
            <Badge
              count={unreadNotificationsCount}
              size="medium"
              style={{ backgroundColor: "#da2c46" }}
            />
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    const fetchCandidateInfo = () => {
      try {
        const possibleKeys = ["candidateInfo", "userInfo"];

        let candidateData = null;
        let foundKey = null;

        for (const key of possibleKeys) {
          const data = localStorage.getItem(key);
          if (data) {
            candidateData = data;
            foundKey = key;
            console.log(`Found candidate data in localStorage key: ${key}`);
            break;
          }
        }

        if (candidateData) {
          const parsedData = JSON.parse(candidateData);
          console.log(`Parsed data from ${foundKey}:`, parsedData);

          const name = parsedData.name || parsedData.fullName || "Candidate";

          // Extract email with multiple fallbacks
          const email = parsedData.email || "";

          let roles = "";
          if (parsedData.roles) {
            if (Array.isArray(parsedData.roles)) {
              roles = parsedData.roles.join(", ");
            } else {
              roles = parsedData.roles;
            }
          } else {
            roles = parsedData.role || "";
          }

          const extractedInfo = {
            name: name,
            email: email,
            roles: roles,
          };

          console.log("Extracted candidate info:", extractedInfo);
          setCandidateInfo(extractedInfo);
        } else {
          console.warn("No candidate data found in localStorage");
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
        console.error("Error parsing candidate info from localStorage:", error);
        // Keep default values if parsing fails
      }
    };

    fetchCandidateInfo();

    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes("candidate") || e.key.includes("user"))) {
        console.log("localStorage changed for key:", e.key);
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
        isDesktop: width >= BREAKPOINTS.desktop,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (e) => {
    navigate(e.key);
    if (screenSize.isMobile) setDrawerVisible(false);
  };

  const getSidebarWidth = () => {
    if (screenSize.isMobile) return 280;
    if (screenSize.isTablet) return 220;
    return 256;
  };

  const getCollapsedWidth = () => {
    if (screenSize.isTablet) return 70;
    return 80;
  };

  const getLogoHeight = () => {
    if (screenSize.isMobile) return "36px";
    if (screenSize.isTablet) return "32px";
    return "40px";
  };

  const getMenuItemHeight = () => {
    if (screenSize.isMobile) return "40px";
    if (screenSize.isTablet) return "36px";
    return "40px";
  };

  const getIconSize = () => {
    if (screenSize.isMobile) return "20px";
    if (screenSize.isTablet) return "18px";
    return "20px";
  };

  const getImageLogoSize = () => {
    if (screenSize.isMobile) return { width: "120px", height: "100px" };
    if (screenSize.isTablet)
      return collapsed
        ? { width: "40px", height: "100px" }
        : { width: "100px", height: "100px" };
    return collapsed
      ? { width: "50px", height: "100px" }
      : { width: "140px", height: "100px" };
  };

  const getFirstLetter = () => {
    return candidateInfo.name.charAt(0).toUpperCase();
  };

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

  const SidebarContent = (
    <div
      style={{
        height: "100%",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          height: screenSize.isMobile ? "56px" : "64px",
          display: "flex",
          alignItems: "center",
          justifyContent:
            collapsed && !screenSize.isMobile ? "center" : "flex-start",
          padding: collapsed && !screenSize.isMobile ? "0 12px" : "0 24px",
          borderBottom: "1px solid #e2e8f0",
          minHeight: screenSize.isMobile ? "56px" : "64px",
          marginBottom: "32px",
        }}
      >
        <div
          style={{
            padding: screenSize.isMobile
              ? "24px 24px 16px 24px"
              : "24px 24px 16px 24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
          >
            <img
              src="/Workforce.svg"
              alt="Company Logo"
              style={{
                ...getImageLogoSize(),
                objectFit: "contain",
                borderRadius: "4px",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div
              style={{
                display: "none",
                ...getImageLogoSize(),
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                fontSize: collapsed && !screenSize.isMobile ? "12px" : "14px",
                fontWeight: "500",
                textAlign: "center",
                border: "2px dashed #ccc",
              }}
            >
              {collapsed && !screenSize.isMobile ? "Logo" : "Your Logo Here"}
            </div>
          </div>
        </div>
      </div>

      <nav
        style={{
          padding: screenSize.isMobile ? "0 24px" : "0 24px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleMenuClick({ key: item.key })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 12px",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              backgroundColor:
                selectedKey === item.key
                  ? "#fde2e4"
                  : hoveredKey === item.key
                  ? "#f1f5f9"
                  : "transparent",
              color:
                selectedKey === item.key
                  ? "#e11d48"
                  : hoveredKey === item.key
                  ? "#1e293b"
                  : "#475569",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: screenSize.isMobile ? "16px" : "14px",
              textAlign: "left",
              borderRight:
                selectedKey === item.key ? "2px solid #e11d48" : "none",
              height: getMenuItemHeight(),
              justifyContent:
                collapsed && !screenSize.isMobile ? "center" : "flex-start",
            }}
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            {React.cloneElement(item.icon, {
              style: {
                color:
                  selectedKey === item.key
                    ? "#e11d48"
                    : hoveredKey === item.key
                    ? "#e11d48"
                    : "#64748b",
                fontSize: getIconSize(),
                minWidth: getIconSize(),
              },
            })}
            {(!collapsed || screenSize.isMobile) && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div
        style={{
          padding: screenSize.isMobile
            ? "32px 24px 24px 24px"
            : "32px 24px 24px 24px",
          borderTop: "1px solid #e2e8f0",
          marginTop: "auto",
        }}
      >
        <Button
          type="text"
          icon={React.cloneElement(<LogoutOutlined />, {
            style: {
              color: hoveredKey === "logout" ? "#ff4d4f" : "#ff4d4f",
              fontSize: getIconSize(),
              minWidth: getIconSize(),
            },
          })}
          block
          style={{
            color: hoveredKey === "logout" ? "#ff4d4f" : "#ff4d4f",
            height: getMenuItemHeight(),
            display: "flex",
            alignItems: "center",
            justifyContent:
              collapsed && !screenSize.isMobile ? "center" : "flex-start",
            fontWeight: "500",
            fontSize: screenSize.isMobile ? "16px" : "14px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
            backgroundColor:
              hoveredKey === "logout" ? "#ffccc7" : "transparent",
            border: "none",
            gap: "12px",
            padding: "8px 12px",
          }}
          onMouseEnter={() => setHoveredKey("logout")}
          onMouseLeave={() => setHoveredKey(null)}
          onClick={handleLogout}
        >
          {(!collapsed || screenSize.isMobile) && "Logout"}
        </Button>
      </div>
    </div>
  );

  if (screenSize.isMobile) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={getSidebarWidth()}
        style={{ zIndex: 1001 }}
        styles={{
          body: { padding: 0 },
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={getSidebarWidth()}
      collapsedWidth={getCollapsedWidth()}
      breakpoint={screenSize.isTablet ? "lg" : "xl"}
      style={{
        background: "#ffffff",
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
        borderRight: "1px solid #e2e8f0",
        transition: "all 0.3s ease",
      }}
    >
      {SidebarContent}
    </Sider>
  );
};

export default CandidateSidebar;
