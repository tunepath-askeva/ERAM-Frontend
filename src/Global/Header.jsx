import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Drawer, Space } from 'antd';
import { MenuOutlined, UserOutlined, HomeOutlined, InfoCircleOutlined, CustomerServiceOutlined, ContactsOutlined, BankOutlined, LoginOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header: AntHeader } = Layout;

const Header = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getActiveKey = () => {
    if (location.pathname.includes('branches')) return 'branch';
    if (location.pathname.includes('contacts')) return 'contacts';
    if (location.pathname.includes('services')) return 'services';
    if (location.pathname.includes('about')) return 'about';
    return 'home';
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: 'About Us',
    },
    {
      key: 'services',
      icon: <CustomerServiceOutlined />,
      label: 'Services',
    },
    {
      key: 'contacts',
      icon: <ContactsOutlined />,
      label: 'Contact Us',
    },
    {
      key: 'branch',
      icon: <BankOutlined />,
      label: 'Branches',
    },
  ];

  const handleMenuClick = (e) => {
    if (e.key === 'home') {
      navigate('/');
    } else if (e.key === 'about') {
      navigate('/about');
    } else if (e.key === 'services') {
      navigate('/services');
    } else if (e.key === 'contacts') {
      navigate('/contacts');
    } else if (e.key === 'branch') {
      navigate('/branches');
    }
  };

  const showMobileMenu = () => {
    setMobileMenuVisible(true);
    // Disable body scroll when mobile menu is open
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
    // Re-enable body scroll when mobile menu is closed
    document.body.style.overflow = 'auto';
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <>
      {/* Spacer div to account for fixed header */}
      <div style={{ height: '80px' }}></div>

      <AntHeader
        style={{
          position: 'fixed',
          zIndex: 1000,
          width: '100%',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
          padding: '0 20px',
          height: '80px',
          lineHeight: '80px',
          borderBottom: 'none'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0'
        }}>

          {/* Logo Section */}
          <div style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }} onClick={() => navigate('/')}>
            <img
              src="/Workforce.svg"
              alt="ERAM Workforce Logo"
              style={{
                height: '100px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Desktop Navigation Menu */}
          {!isMobile && (
            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              margin: '0 40px'
            }}>
              <Menu
                mode="horizontal"
                selectedKeys={[getActiveKey()]}
                items={menuItems.map(item => ({
                  ...item,
                  icon: null // Remove icons for desktop menu
                }))}
                onClick={handleMenuClick}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#333',
                  flex: 1,
                  justifyContent: 'center',
                  minWidth: '400px'
                }}
              />
            </div>
          )}

          {/* Login Button */}
          {!isMobile ? (
            <div>
              <Button
                type="primary"
                icon={<LoginOutlined />}
                onClick={handleLogin}
                style={{
                  backgroundColor: '#da2c46',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: '500',
                  height: '40px',
                  padding: '0 20px'
                }}
              >
                Login
              </Button>
            </div>
          ) : (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={showMobileMenu}
              style={{
                fontSize: '20px',
                color: '#333',
                height: '45px',
                width: '45px'
              }}
            />
          )}
        </div>
      </AntHeader>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <img
              src="/Workforce.svg"
              alt="ERAM Workforce Logo"
              style={{
                height: '40px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>
        }
        placement="right"
        onClose={closeMobileMenu}
        open={mobileMenuVisible}
        width={300}
        bodyStyle={{ 
          padding: 0, 
          backgroundColor: '#f8f9fa',
          overflowY: 'auto',
          height: 'calc(100% - 55px)' // Adjust for header height
        }}
        headerStyle={{
          backgroundColor: '#fff',
          borderBottom: '1px solid #eee',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
        style={{
          overflow: 'hidden'
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
            border: 'none',
            fontSize: '16px',
            backgroundColor: 'transparent',
            padding: '10px'
          }}
        />
        <div style={{ padding: '20px' }}>
          <Button
            block
            type="primary"
            icon={<LoginOutlined />}
            onClick={() => {
              handleLogin();
              closeMobileMenu();
            }}
            style={{
              backgroundColor: '#da2c46',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: '500',
              height: '40px'
            }}
          >
            Login
          </Button>
        </div>
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
        .ant-menu-item, .ant-btn {
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

export default Header;