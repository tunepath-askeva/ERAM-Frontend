import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  AppstoreOutlined,
  SettingOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

const SuperSidebar = ({
  collapsed,
  setCollapsed,
  setDrawerVisible,
  drawerVisible,
}) => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth < BREAKPOINTS.mobile,
    isTablet: window.innerWidth >= BREAKPOINTS.mobile && window.innerWidth < BREAKPOINTS.tablet,
    isDesktop: window.innerWidth >= BREAKPOINTS.desktop
  });
  
  const [hoveredKey, setHoveredKey] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname;

  const menuItems = [
    { key: "/superadmin", icon: <DashboardOutlined />, label: "Dashboard" },
    { key: "/superadmin/branches", icon: <AppstoreOutlined />, label: "Branches" },
    { key: "/superadmin/admins", icon: <UserOutlined />, label: "Admins" },
    { key: "/superadmin/settings", icon: <SettingOutlined />, label: "Settings" },
  ];

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.desktop
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = (e) => {
    navigate(e.key);
    if (screenSize.isMobile) setDrawerVisible(false);
  };

  // Dynamic sizing based on screen size
  const getSidebarWidth = () => {
    if (screenSize.isMobile) return 280;
    if (screenSize.isTablet) return 220;
    return 256; // 64 * 4 = 256px (w-64 equivalent)
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
    if (screenSize.isMobile) return "40px"; // py-2 equivalent
    if (screenSize.isTablet) return "36px";
    return "40px";
  };

  const getIconSize = () => {
    if (screenSize.isMobile) return "20px";
    if (screenSize.isTablet) return "18px";
    return "20px";
  };

  const SidebarContent = (
    <div
      style={{
        height: "100%",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e2e8f0", // border-slate-200
      }}
    >
      {/* Header with Logo */}
      <div
        style={{
          height: screenSize.isMobile ? "56px" : "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed && !screenSize.isMobile ? "center" : "flex-start",
          padding: collapsed && !screenSize.isMobile ? "0 12px" : "0 24px", // p-6 equivalent
          borderBottom: "1px solid #e2e8f0",
          minHeight: screenSize.isMobile ? "56px" : "64px",
          marginBottom: "32px", // mb-8 equivalent
        }}
      >
        {(!collapsed || screenSize.isMobile) && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                background: "linear-gradient(135deg, #2563eb 0%, #9333ea 100%)", // gradient-to-r from-blue-600 to-purple-600
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              S
            </div>
            <h1
              style={{
                fontSize: "20px", // text-xl
                fontWeight: "bold",
                color: "#1e293b", // text-slate-800
                margin: 0,
              }}
            >
              Super Admin
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
            S
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav style={{ 
        padding: screenSize.isMobile ? "0 24px" : "0 24px", // p-6 equivalent
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "8px", // space-y-2
      }}>
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleMenuClick({ key: item.key })}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "12px", // space-x-3
              padding: "8px 12px", // px-3 py-2
              borderRadius: "8px", // rounded-lg
              transition: "all 0.2s ease",
              backgroundColor: selectedKey === item.key 
                ? "#dbeafe" // bg-blue-50
                : hoveredKey === item.key 
                ? "#f1f5f9" // hover:bg-slate-100
                : "transparent",
              color: selectedKey === item.key 
                ? "#1d4ed8" // text-blue-700
                : hoveredKey === item.key 
                ? "#1e293b" // hover:text-slate-800
                : "#475569", // text-slate-600
              border: "none",
              cursor: "pointer",
              fontWeight: "500", // font-medium
              fontSize: screenSize.isMobile ? "16px" : "14px",
              textAlign: "left",
              borderRight: selectedKey === item.key ? "2px solid #2563eb" : "none", // border-r-2 border-blue-600
              height: getMenuItemHeight(),
              justifyContent: collapsed && !screenSize.isMobile ? "center" : "flex-start",
            }}
            onMouseEnter={() => setHoveredKey(item.key)}
            onMouseLeave={() => setHoveredKey(null)}
          >
            {React.cloneElement(item.icon, { 
              style: { 
                color: selectedKey === item.key ? "#2563eb" : hoveredKey === item.key ? "#2563eb" : "#64748b", // text-blue-600 : text-slate-500
                fontSize: getIconSize(),
                minWidth: getIconSize(),
              } 
            })}
            {(!collapsed || screenSize.isMobile) && (
              <span>{item.label}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Settings Section */}
      <div 
        style={{ 
          padding: screenSize.isMobile ? "32px 24px 24px 24px" : "32px 24px 24px 24px", // mt-8 pt-8 p-6
          borderTop: "1px solid #e2e8f0", // border-t border-slate-200
          marginTop: "auto"
        }}
      >
        <Button
          type="text"
          icon={React.cloneElement(<LogoutOutlined />, {
            style: { 
              color: hoveredKey === "logout" ? "#2563eb" : "#64748b",
              fontSize: getIconSize(),
              minWidth: getIconSize(),
            }
          })}
          block
          style={{
            color: hoveredKey === "logout" ? "#1e293b" : "#475569", // hover:text-slate-800 : text-slate-600
            height: getMenuItemHeight(),
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed && !screenSize.isMobile ? "center" : "flex-start",
            fontWeight: "500", // font-medium
            fontSize: screenSize.isMobile ? "16px" : "14px",
            borderRadius: "8px", // rounded-lg
            transition: "all 0.2s ease",
            backgroundColor: hoveredKey === "logout" ? "#f1f5f9" : "transparent", // hover:bg-slate-100
            border: "none",
            gap: "12px", // space-x-3
            padding: "8px 12px", // px-3 py-2
          }}
          onMouseEnter={() => setHoveredKey("logout")}
          onMouseLeave={() => setHoveredKey(null)}
        >
          {(!collapsed || screenSize.isMobile) && "Logout"}
        </Button>
      </div>
    </div>
  );

  // Mobile: Use Drawer
  if (screenSize.isMobile) {
    return (
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        bodyStyle={{ padding: 0 }}
        width={getSidebarWidth()}
        style={{ zIndex: 1001 }}
        styles={{
          body: { padding: 0 }
        }}
      >
        {SidebarContent}
      </Drawer>
    );
  }

  // Desktop/Tablet: Use Sider
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
        borderRight: "1px solid #e2e8f0", // border-r border-slate-200
        transition: "all 0.3s ease",
      }}
    >
      {SidebarContent}
    </Sider>
  );
};

export default SuperSidebar;