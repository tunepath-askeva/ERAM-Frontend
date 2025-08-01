import React, { useState, useEffect } from "react";
import { Layout, Button, Drawer } from "antd";
import {
  SolutionOutlined,
  SettingOutlined,
  LogoutOutlined,
  FormOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useLogoutSuperAdminMutation } from "../../Slices/SuperAdmin/SuperAdminApis.js";
import { userLogout } from "../../Slices/Users/UserSlice.js";

const { Sider } = Layout;

const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};

const EmployeeSidebar = ({
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

  const [employeeInfo, setEmployeeInfo] = useState({
    name: "Employee",
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

  const menuItems = [
    {
      key: "/employee/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/employee/raise-request",
      icon: <SolutionOutlined />,
      label: "Raise Request",
    },
    {
      key: "/employee/leave-request",
      icon: <FormOutlined />,
      label: "Leave Request",
    },
    {
      key: "/employee/company-policy",
      icon: <SolutionOutlined />,
      label: "Company Policies",
    },
    {
      key: "/employee/profile-settings",
      icon: <SettingOutlined />,
      label: "Profile-Settings",
    },
  ];

  useEffect(() => {
    const fetchEmployeeInfo = () => {
      try {
        const possibleKeys = ["employeeInfo", "userInfo"];

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

          const name = parsedData.name || parsedData.fullName || "Employee";

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

  const getFirstLetter = () => {
    return employeeInfo.name.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(userLogout({ role: "employee" }));

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
                background:
                  "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {getFirstLetter()}
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <h1
                style={{
                  fontSize: "20px",
                  color: "#1e293b",
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                {employeeInfo.name}
              </h1>
              {employeeInfo.roles && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  {employeeInfo.roles}
                </span>
              )}
            </div>
          </div>
        )}
        {collapsed && !screenSize.isMobile && (
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            {getFirstLetter()}
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

export default EmployeeSidebar;
