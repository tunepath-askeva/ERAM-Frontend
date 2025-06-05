import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  DashboardOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  ApartmentOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack"; // Add this import
import { useLogoutSuperAdminMutation } from "../../Slices/SuperAdmin/SuperAdminApis";
import { userLogout } from "../../Slices/Users/UserSlice";

const { Sider } = Layout;

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

const AdminSidebar = ({
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

  const [logout] = useLogoutSuperAdminMutation();
  const { enqueueSnackbar } = useSnackbar(); // Add this hook
  const [hoveredKey, setHoveredKey] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const selectedKey = location.pathname;

  const menuItems = [
    {
      key: "/admin/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/admin/branches",
      icon: <AppstoreOutlined />,
      label: "Branches",
    },
    {
      key: "/admin/recruiters",
      icon: <UserOutlined />,
      label: "Recruiters",
    },
    {
      key: "/admin/workorder",
      icon: <UnorderedListOutlined />,
      label: "Work Order",
    },
    {
      key: "/admin/pipeline",
      icon: <ApartmentOutlined />,
      label: "pipeline",
    },
  ];

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

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(userLogout({ role: "admin" }));

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
        {(!collapsed || screenSize.isMobile) && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #2563eb 0%, #9333ea 100%)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              A
            </div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: "bold",
                color: "#1e293b",
                margin: 0,
              }}
            >
              Admin
            </h1>
          </div>
        )}
        {collapsed && !screenSize.isMobile && (
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #2563eb 0%, #9333ea 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            A
          </div>
        )}
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
                  ? "#dbeafe"
                  : hoveredKey === item.key
                  ? "#f1f5f9"
                  : "transparent",
              color:
                selectedKey === item.key
                  ? "#1d4ed8"
                  : hoveredKey === item.key
                  ? "#1e293b"
                  : "#475569",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: screenSize.isMobile ? "16px" : "14px",
              textAlign: "left",
              borderRight:
                selectedKey === item.key ? "2px solid #2563eb" : "none",
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
                    ? "#2563eb"
                    : hoveredKey === item.key
                    ? "#2563eb"
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

export default AdminSidebar;
