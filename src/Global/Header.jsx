import React, { useState } from 'react';
import { Layout, Menu, Button, Drawer, Space } from 'antd';
import { MenuOutlined, UserOutlined, HomeOutlined, InfoCircleOutlined, CustomerServiceOutlined, ContactsOutlined, BankOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';


const { Header: AntHeader } = Layout;

const Header = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const navigate = useNavigate();

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
      key: 'contact',
      icon: <ContactsOutlined />,
      label: 'Contact Us',
    },
    {
      key: 'branch',
      icon: <BankOutlined />,
      label: 'branches',
    },
  ];

  const handleMenuClick = (e) => {
    console.log('Menu clicked:', e.key);
    if(e.key === 'branch'){
      navigate('/branches')
    }
  };

  const showMobileMenu = () => {
    setMobileMenuVisible(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuVisible(false);
  };

  return (
    <>
      {/* Spacer div to account for fixed header */}
      <div style={{ height: '70px' }}></div>

      <AntHeader
        style={{
          position: 'fixed',
          zIndex: 1000,
          width: '100%',
          top: 0,
          backgroundColor: '#4a5568',
          boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
          padding: '0 20px',
          height: '70px',
          lineHeight: '70px',
          borderBottom: 'none'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1250px',
          margin: '0 auto',
          height: '100%'
        }}>

          {/* Logo Section */}
          <div style={{
            minWidth: 'fit-content',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Company Logo Image */}
            <img
              src="/Eram-Logo.png" // Replace with your actual logo path
              alt="ERAM TALENT Logo"
              style={{
                height: '45px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Desktop Navigation Menu */}
          <div className="desktop-menu" style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            maxWidth: '800px',
            marginLeft: '40px'
          }}>
            <Menu
              mode="horizontal"
              selectedKeys={['home']}
              items={menuItems.map(item => ({
                ...item,
                icon: null // Remove icons for desktop menu to match design
              }))}
              onClick={handleMenuClick}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '15px',
                fontWeight: '400',
                color: '#fff',
                flex: 1,
                justifyContent: 'space-between',
                minWidth: '400px'
              }}
              theme="dark"
            />
          </div>

          {/* Desktop Login Button */}
          <div className="desktop-login" style={{ minWidth: 'fit-content' }}>
            <Button
              type="primary"
              icon={<UserOutlined />}
              size="middle"
              style={{
                backgroundColor: '#ff4757',
                borderColor: '#ff4757',
                borderRadius: '25px',
                fontWeight: '500',
                padding: '0 25px',
                height: '40px'
              }}
            >
              Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="mobile-menu-btn" style={{ display: 'none' }}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={showMobileMenu}
              style={{
                fontSize: '20px',
                color: '#fff',
                height: '45px',
                width: '45px'
              }}
            />
          </div>
        </div>
      </AntHeader>

      {/* Mobile Drawer Menu */}
      <Drawer
        title={
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'
          }}>
            <div style={{
              color: '#ff4757',
              fontSize: '28px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              lineHeight: '28px',
              marginBottom: '2px'
            }}>
              ERAM
            </div>
            <div style={{
              fontSize: '10px',
              letterSpacing: '3px',
              color: '#666',
              fontWeight: '300'
            }}>
              TALENT
            </div>
          </div>
        }
        placement="right"
        onClose={closeMobileMenu}
        open={mobileMenuVisible}
        width={320}
        bodyStyle={{ padding: 0, backgroundColor: '#f8f9fa' }}
        headerStyle={{ backgroundColor: '#fff', borderBottom: '1px solid #eee' }}
      >
        <Menu
          mode="vertical"
          selectedKeys={['home']}
          items={menuItems}
          onClick={(e) => {
            handleMenuClick(e);
            closeMobileMenu();
          }}
          style={{
            border: 'none',
            fontSize: '16px',
            backgroundColor: 'transparent'
          }}
        />

        <div style={{
          padding: '25px',
          borderTop: '1px solid #eee',
          marginTop: '20px',
          backgroundColor: '#fff'
        }}>
          <Button
            type="primary"
            icon={<UserOutlined />}
            block
            size="large"
            style={{
              backgroundColor: '#ff4757',
              borderColor: '#ff4757',
              borderRadius: '25px',
              fontWeight: '500',
              height: '45px'
            }}
          >
            Login
          </Button>
        </div>
      </Drawer>

      {/* Responsive CSS */}
      <style jsx>{`
        /* Mobile Styles */
        @media (max-width: 992px) {
          .desktop-menu {
            display: none !important;
          }
          .desktop-login {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        
        @media (min-width: 993px) {
          .mobile-menu-btn {
            display: none !important;
          }
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

        /* Desktop menu item spacing */
        @media (min-width: 993px) {
          .ant-menu-horizontal {
            display: flex !important;
            justify-content: center !important;
          }
          
          .ant-menu-horizontal .ant-menu-item {
            padding: 0 30px !important;
            margin: 0 10px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          
          .ant-menu-horizontal .ant-menu-item:hover {
            color: #ff4757 !important;
            background-color: transparent !important;
          }
          
          .ant-menu-horizontal .ant-menu-item-selected {
            color: #ff4757 !important;
            background-color: transparent !important;
          }
          
          .ant-menu-horizontal > .ant-menu-item::after,
          .ant-menu-horizontal > .ant-menu-submenu::after {
            border-bottom: 2px solid #ff4757;
          }
        }

        /* Large desktop optimizations */
        @media (min-width: 1200px) {
          .ant-menu-horizontal .ant-menu-item {
            padding: 0 20px;
            margin: 0 8px;
          }
        }

        /* Extra large screens */
        @media (min-width: 1400px) {
          .ant-menu-horizontal .ant-menu-item {
            padding: 0 25px;
            margin: 0 10px;
          }
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
          color: #ff4757 !important;
        }

        .ant-drawer-body .ant-menu-item-selected {
          background-color: #ff4757 !important;
          color: #fff !important;
        }

        /* Smooth transitions */
        .ant-menu-item, .ant-btn {
          transition: all 0.3s ease !important;
        }
      `}</style>
    </>
  );
};

export default Header;