import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import EmployeeNavbar from "./EmployeeNavbar";
import EmployeeSidebar from "./EmployeeSidebar";
import { Outlet, useLocation } from "react-router-dom";

const { Content } = Layout;

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  largeDesktop: 1600
};

const EmployeeLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/employee/dashboard";
  
  const [collapsed, setCollapsed] = useState(isDashboard);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < BREAKPOINTS.mobile,
    isTablet: window.innerWidth >= BREAKPOINTS.mobile && window.innerWidth < BREAKPOINTS.tablet,
    isDesktop: window.innerWidth >= BREAKPOINTS.tablet && window.innerWidth < BREAKPOINTS.largeDesktop,
    isLargeDesktop: window.innerWidth >= BREAKPOINTS.largeDesktop
  });

  useEffect(() => {
    // Set collapsed state based on dashboard route
    if (!screenSize.isMobile) {
      setCollapsed(isDashboard);
    }
  }, [isDashboard, screenSize.isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      const newScreenSize = {
        width,
        height,
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.largeDesktop,
        isLargeDesktop: width >= BREAKPOINTS.largeDesktop
      };
      
      setScreenSize(newScreenSize);
      
      if (newScreenSize.isMobile) {
        setCollapsed(true);
        setDrawerVisible(false);
      } else if (newScreenSize.isTablet && width < 900) {
        setCollapsed(isDashboard || true);
      } else if (!newScreenSize.isMobile) {
        setCollapsed(isDashboard);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); 
    
    return () => window.removeEventListener("resize", handleResize);
  }, [isDashboard]);

  const getLayoutMargin = () => {
    if (screenSize.isMobile) return 0;
    
    const sidebarWidth = getSidebarWidth();
    const collapsedWidth = getCollapsedWidth();
    
    return collapsed ? collapsedWidth : sidebarWidth;
  };

  const getSidebarWidth = () => {
    if (screenSize.isMobile) return 280;
    if (screenSize.isTablet) return 220;
    return 250;
  };

  const getCollapsedWidth = () => {
    if (screenSize.isTablet) return 70;
    return 80;
  };

  const getContentPadding = () => {
    if (screenSize.isMobile) return 12;
    if (screenSize.isTablet) return 16;
    if (screenSize.isDesktop) return 24;
    return 32; 
  };



  const getNavbarHeight = () => {
    if (screenSize.isMobile) return 56;
    if (screenSize.isTablet) return 60;
    if (screenSize.isLargeDesktop) return 68;
    return 64;
  };

  const getAvailableHeight = () => {
    const navbarHeight = getNavbarHeight();
    return `calc(100vh - ${navbarHeight}px)`;
  };

  return (
    <Layout 
      style={{ 
        minHeight: "100vh", 
        height: isDashboard && !screenSize.isMobile && !screenSize.isTablet ? "100vh" : "auto",
        background: "#f8f9fa",
        overflow: isDashboard && !screenSize.isMobile && !screenSize.isTablet ? "hidden" : (screenSize.isMobile ? "hidden" : "auto")
      }}
    >
      <EmployeeSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
      />
      
      <Layout
        style={{
          marginLeft: getLayoutMargin(),
          transition: "margin-left 0.3s ease",
          minHeight: isDashboard && !screenSize.isMobile && !screenSize.isTablet ? "100vh" : "100vh",
          height: isDashboard && !screenSize.isMobile && !screenSize.isTablet ? "100vh" : "auto",
          position: "relative",
          paddingTop: getNavbarHeight(),
          overflow: isDashboard && !screenSize.isMobile && !screenSize.isTablet ? "hidden" : "auto",
        }}
      >
        <EmployeeNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setDrawerVisible={setDrawerVisible}
        />
        
        <Content
          style={{
            padding: isDashboard ? 0 : getContentPadding(),
            minHeight: isDashboard ? (screenSize.isMobile || screenSize.isTablet ? "auto" : getAvailableHeight()) : `calc(100vh - ${getNavbarHeight() + 40}px)`, 
            background: "#fff",
            borderRadius: isDashboard ? 0 : (screenSize.isMobile ? 6 : 8),
            boxShadow: isDashboard ? "none" : (screenSize.isMobile ? 
              "0 1px 2px rgba(0, 0, 0, 0.1)" : 
              "0 1px 4px rgba(0, 0, 0, 0.1)"),
            overflow: isDashboard ? (screenSize.isMobile || screenSize.isTablet ? "auto" : "hidden") : "auto",
            position: "relative",
            width: isDashboard ? "100%" : "auto",
            height: isDashboard ? (screenSize.isMobile || screenSize.isTablet ? "auto" : getAvailableHeight()) : "auto",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isDashboard ? "100%" : (screenSize.isLargeDesktop ? "1400px" : "100%"),
              margin: isDashboard ? 0 : (screenSize.isLargeDesktop ? "0 auto" : "0"),
              height: isDashboard ? "100%" : "auto",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
      
      {screenSize.isMobile && drawerVisible && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            zIndex: 1000,
            transition: "opacity 0.3s ease",
          }}
          onClick={() => setDrawerVisible(false)}
        />
      )}
    </Layout>
  );
};

export default EmployeeLayout;