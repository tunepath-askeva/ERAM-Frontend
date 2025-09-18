import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Drawer, Space, Typography } from "antd";
import {
  MenuOutlined,
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  CustomerServiceOutlined,
  ContactsOutlined,
  BankOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const BranchHeader = ({ currentBranch }) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getActiveKey = () => {
    if (location.pathname.includes("branch-login")) return "branch-login";
    if (location.pathname.includes("branch-register")) return "branch-register";
    return "home";
  };

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "branch-login",
      icon: <LoginOutlined />,
      label: "Apply / Login",
    },
    {
      key: "branch-register",
      icon: <LoginOutlined />,
      label: "Register",
    },
  ];

  const handleMenuClick = (e) => {
    if (e.key === "home") {
      navigate("/home");
    }
    if (e.key === "branch-login") {
      navigate("/branch-login");
    }
    if (e.key === "branch-register") {
      navigate("/branch-register");
    }
  };

  const showMobileMenu = () => {
    setMobileMenuVisible(true);
    document.body.style.overflow = "hidden";
  };

  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
    document.body.style.overflow = "auto";
  };

  const handleLogin = () => {
    navigate("/branch-login");
  };

  const handleRegister = () => {
    navigate("/branch-register");
  };

  const handleLogoClick = () => {
    navigate("/home");
  };

  const getLogoSrc = () => {
    if (currentBranch?.brand_logo) {
      return currentBranch.brand_logo;
    }
    return "/Workforce.svg";
  };

  const getBranchName = () => {
    return currentBranch?.name || "ERAM TALENT";
  };

  return (
    <>
      <div style={{ height: "80px" }}></div>

      <AntHeader
        style={{
          position: "fixed",
          zIndex: 1000,
          width: "100%",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          boxShadow: "0 2px 15px rgba(0,0,0,0.1)",
          padding: "0 20px",
          height: "80px",
          lineHeight: "80px",
          borderBottom: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            height: "100%",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0",
          }}
        >
          {/* Logo Section */}
          <div
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
            onClick={handleLogoClick}
          >
            <img
              src={getLogoSrc()}
              alt={`${getBranchName()} Logo`}
              style={{
                height: "60px",
                width: "auto",
                maxWidth: "180px",
                objectFit: "contain",
              }}
              onError={(e) => {
                // Fallback to default logo if branch logo fails to load
                e.target.src = "/Workforce.svg";
              }}
            />
            {currentBranch && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  lineHeight: "1.2",
                }}
              >
                <Text strong style={{ fontSize: "16px", color: "#1e293b" }}>
                  {currentBranch.name}
                </Text>
                {currentBranch.branchCode && (
                  <Text style={{ fontSize: "12px", color: "#64748b" }}>
                    {currentBranch.branchCode}
                  </Text>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation Menu */}
          {!isMobile && (
            <div
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                margin: "0 40px",
              }}
            >
              <Menu
                mode="horizontal"
                selectedKeys={[getActiveKey()]}
                items={menuItems.map((item) => ({
                  ...item,
                  icon: null, // Remove icons for desktop menu
                }))}
                onClick={handleMenuClick}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: "500",
                  color: "#333",
                  flex: 1,
                  justifyContent: "center",
                  minWidth: "400px",
                }}
              />
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={showMobileMenu}
              style={{
                fontSize: "20px",
                color: "#333",
                height: "45px",
                width: "45px",
              }}
            />
          )}
        </div>
      </AntHeader>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img
              src={getLogoSrc()}
              alt={`${getBranchName()} Logo`}
              style={{
                height: "40px",
                width: "auto",
                maxWidth: "120px",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.src = "/Workforce.svg";
              }}
            />
            {currentBranch && (
              <div>
                <Text strong style={{ fontSize: "14px", color: "#1e293b" }}>
                  {currentBranch.name}
                </Text>
                {currentBranch.branchCode && <br />}
                {currentBranch.branchCode && (
                  <Text style={{ fontSize: "11px", color: "#64748b" }}>
                    {currentBranch.branchCode}
                  </Text>
                )}
              </div>
            )}
          </div>
        }
        placement="right"
        onClose={closeMobileMenu}
        open={mobileMenuVisible}
        width={300}
        bodyStyle={{
          padding: 0,
          backgroundColor: "#f8f9fa",
          overflowY: "auto",
          height: "calc(100% - 55px)",
        }}
        headerStyle={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #eee",
          padding: "16px 24px",
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
        style={{
          overflow: "hidden",
        }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          onClick={(e) => {
            handleMenuClick(e);
            closeMobileMenu();
          }}
          style={{
            border: "none",
            fontSize: "16px",
            backgroundColor: "transparent",
            padding: "10px",
          }}
        />
        {/* <div style={{ padding: "20px" }}>
          <Button
            block
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => {
              handleLogin();
              closeMobileMenu();
            }}
            style={{
              backgroundColor: "#da2c46",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "500",
              height: "40px",
            }}
          >
            Apply / Login
          </Button>
        </div>

        <div style={{ padding: "20px" }}>
          <Button
            block
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => {
              handleRegister();
              closeMobileMenu();
            }}
            style={{
              backgroundColor: "#da2c46",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "500",
              height: "40px",
            }}
          >
            Register
          </Button>
        </div> */}
      </Drawer>

      {/* Responsive CSS */}
      <style jsx>{`
        /* Desktop menu item styling */
        .ant-menu-horizontal {
          display: flex !important;
          justify-content: center !important;
        }

        .ant-menu-horizontal .ant-menu-item {
          padding: 0 15px !important;
          margin: 0 5px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #000 !important;
          transition: none !important;
        }

        .ant-menu-horizontal .ant-menu-item:hover {
          color: #da2c46 !important;
          background-color: transparent !important;
        }

        .ant-menu-horizontal .ant-menu-item-selected {
          color: #da2c46 !important;
          background-color: transparent !important;
        }

        .ant-menu-horizontal > .ant-menu-item-selected::after {
          border-bottom: 2px solid #da2c46 !important;
        }

        /* Mobile menu customization */
        .ant-drawer-body .ant-menu-item {
          padding: 15px 25px !important;
          margin: 5px 0 !important;
          border-radius: 8px !important;
          height: auto !important;
        }

        .ant-drawer-body .ant-menu-item:hover {
          background-color: #f0f0f0 !important;
          color: #da2c46 !important;
        }

        .ant-drawer-body .ant-menu-item-selected {
          background-color: #da2c46 !important;
          color: #fff !important;
        }

        /* Smooth transitions */
        .ant-menu-item,
        .ant-btn {
          transition: all 0.3s ease !important;
        }

        /* Tablet adjustments */
        @media (max-width: 768px) {
          .ant-layout-header {
            padding: 0 15px !important;
          }
        }

        /* Small mobile adjustments */
        @media (max-width: 480px) {
          .ant-layout-header {
            padding: 0 12px !important;
          }
        }

        /* Prevent scroll when mobile menu is open */
        body.ant-drawer-open {
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default BranchHeader;
