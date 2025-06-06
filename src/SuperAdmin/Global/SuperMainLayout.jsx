import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import SuperSidebar from "./SuperSidebar";
import SuperNavbar from "./SuperNavbar";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

// Responsive breakpoints
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
  largeDesktop: 1600
};

const SuperMainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
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
      
      // Auto-collapse sidebar on mobile and small tablets
      if (newScreenSize.isMobile) {
        setCollapsed(true);
        setDrawerVisible(false);
      } else if (newScreenSize.isTablet && width < 900) {
        setCollapsed(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate dynamic margins and paddings based on screen size
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
    return 32; // Large desktop
  };

  const getNavbarHeight = () => {
    if (screenSize.isMobile) return 56;
    if (screenSize.isTablet) return 60;
    if (screenSize.isLargeDesktop) return 68;
    return 64;
  };

  return (
    <Layout 
      style={{ 
        minHeight: "100vh", 
        background: "#f8f9fa",
        overflow: screenSize.isMobile ? "hidden" : "auto"
      }}
    >
      <SuperSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        drawerVisible={drawerVisible}
        setDrawerVisible={setDrawerVisible}
      />
      
      <Layout
        style={{
          marginLeft: getLayoutMargin(),
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          position: "relative",
          paddingTop: getNavbarHeight(), // Add padding for fixed navbar
        }}
      >
        <SuperNavbar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setDrawerVisible={setDrawerVisible}
        />
        
        <Content
          style={{
            padding: getContentPadding(),
            minHeight: `calc(100vh - ${getNavbarHeight() + 40}px)`, // Account for navbar height
            background: "#fff",
            borderRadius: screenSize.isMobile ? 6 : 8,
            boxShadow: screenSize.isMobile ? 
              "0 1px 2px rgba(0, 0, 0, 0.1)" : 
              "0 1px 4px rgba(0, 0, 0, 0.1)",
            overflow: "auto",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: screenSize.isLargeDesktop ? "1400px" : "100%",
              margin: screenSize.isLargeDesktop ? "0 auto" : "0",
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
      
      {/* Mobile overlay when drawer is open */}
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

export default SuperMainLayout;