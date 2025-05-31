import React, { useState, useEffect } from 'react';
import {
    Layout,
    Row,
    Col,
    Typography,
    Space,
    Button,
    Input,
    Divider,
    Card,
    Tooltip,

} from 'antd';
import {
    LinkedinOutlined,
    TwitterOutlined,
    InstagramOutlined,
    FacebookOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    SendOutlined,
    ArrowUpOutlined,
    HeartFilled
} from '@ant-design/icons';

const { Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const HomeFooter = () => {
    const [visible, setVisible] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSubscribe = (value) => {
        console.log('Newsletter subscription:', value);
        setEmail('');
        // Add your subscription logic here
    };

    const footerStyle = {
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: '#ffffff',
        padding: '60px 0 20px',
        position: 'relative',
        overflow: 'hidden',
        transform: visible ? 'translateY(0)' : 'translateY(50px)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 119, 0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
    };

    const socialButtonStyle = {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        background: 'rgba(255, 255, 255, 0.05)',
        color: '#ffffff',
        fontSize: '18px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
    };

    const linkStyle = {
        color: 'rgba(255, 255, 255, 0.8)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        fontSize: '14px',
        lineHeight: '2',
    };

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        backdropFilter: 'blur(10px)',
        padding: '24px',
        height: '100%',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    };

    return (
        <Footer style={footerStyle}>
            <div style={overlayStyle} />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>
                <Row gutter={[32, 48]}>
                    {/* Company Info */}
                    <Col xs={24} sm={12} lg={6}>
                        <div style={{ ...cardStyle, transform: visible ? 'translateY(0)' : 'translateY(30px)', transitionDelay: '0.1s' }}>
                            <div style={{ marginBottom: '16px' }}>
                                    <img 
                                        src="/Eram-Logo.png" 
                                        style={{
                                            height: window.innerWidth < 576 ? '40px' : '50px', 
                                            maxWidth: '200px',
                                            objectFit: 'contain',
                                            filter: 'brightness(1.2)',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                            </div>
                            <Paragraph style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                marginBottom: '24px',
                                lineHeight: '1.6'
                            }}>
                                Delivering innovative solutions and personalized expertise, empowering businesses to thrive and excel in their industries.
                            </Paragraph>

                            <Space direction="vertical" size="small">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <EnvironmentOutlined style={{ color: '#667eea', fontSize: '16px' }} />
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                        123 Business Street, Suite 100
                                    </Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <PhoneOutlined style={{ color: '#667eea', fontSize: '16px' }} />
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                        +1 (555) 123-4567
                                    </Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <MailOutlined style={{ color: '#667eea', fontSize: '16px' }} />
                                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                                        info@eramtalent.com
                                    </Text>
                                </div>
                            </Space>
                        </div>
                    </Col>

                    {/* Quick Links */}
                    <Col xs={24} sm={12} lg={6}>
                        <div style={{ ...cardStyle, transform: visible ? 'translateY(0)' : 'translateY(30px)', transitionDelay: '0.2s' }}>
                            <Title level={4} style={{ color: '#ffffff', marginBottom: '24px' }}>
                                Quick Links
                            </Title>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                {['Home', 'About Us', 'Services', 'Contact'].map((item, index) => (
                                    <div
                                        key={item}
                                        style={{
                                            ...linkStyle,
                                            transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                                            transitionDelay: `${0.3 + index * 0.1}s`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color = '#667eea';
                                            e.target.style.transform = 'translateX(8px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                                            e.target.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </Space>
                        </div>
                    </Col>

                    {/* Services */}
                    <Col xs={24} sm={12} lg={6}>
                        <div style={{ ...cardStyle, transform: visible ? 'translateY(0)' : 'translateY(30px)', transitionDelay: '0.3s' }}>
                            <Title level={4} style={{ color: '#ffffff', marginBottom: '24px' }}>
                                Our Services
                            </Title>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                {['Talent Acquisition', 'Executive Search', 'HR Consulting', 'Recruitment Process', 'Career Guidance', 'Training Solutions'].map((item, index) => (
                                    <div
                                        key={item}
                                        style={{
                                            ...linkStyle,
                                            transform: visible ? 'translateX(0)' : 'translateX(-20px)',
                                            transitionDelay: `${0.4 + index * 0.1}s`
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color = '#667eea';
                                            e.target.style.transform = 'translateX(8px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color = 'rgba(255, 255, 255, 0.8)';
                                            e.target.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </Space>
                        </div>
                    </Col>

                    {/* Newsletter */}
                    <Col xs={24} sm={12} lg={6}>
                        <div style={{ ...cardStyle, transform: visible ? 'translateY(0)' : 'translateY(30px)', transitionDelay: '0.4s' }}>
                            <Title level={4} style={{ color: '#ffffff', marginBottom: '16px' }}>
                                Stay Connected
                            </Title>
                            <Paragraph style={{
                                color: 'rgba(255, 255, 255, 0.8)',
                                marginBottom: '24px',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                Subscribe to our newsletter for the latest updates and insights.
                            </Paragraph>

                            <Search
                                placeholder="Enter your email"
                                enterButton={<SendOutlined />}
                                size="large"
                                onSearch={handleSubscribe}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    marginBottom: '24px',
                                    '& .ant-input': {
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        color: '#ffffff'
                                    },
                                    '& .ant-btn': {
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }
                                }}
                            />

                            <Title level={5} style={{ color: '#ffffff', marginBottom: '16px' }}>
                                Follow Us
                            </Title>
                            <Space size="medium" style={{ gap: '10px' }}>
                                {[
                                    { icon: <LinkedinOutlined />, color: '#0077b5', delay: '0.5s' },
                                    { icon: <TwitterOutlined />, color: '#1da1f2', delay: '0.6s' },
                                    { icon: <InstagramOutlined />, color: '#e4405f', delay: '0.7s' },
                                    { icon: <FacebookOutlined />, color: '#1877f2', delay: '0.8s' }
                                ].map((social, index) => (
                                    <Tooltip key={index} title="Follow us">
                                        <div
                                            style={{
                                                ...socialButtonStyle,
                                                transform: visible ? 'scale(1)' : 'scale(0)',
                                                transitionDelay: social.delay
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = social.color;
                                                e.currentTarget.style.transform = 'translateY(-5px) scale(1.1)';
                                                e.currentTarget.style.boxShadow = `0 10px 30px ${social.color}40`;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        >
                                            {social.icon}
                                        </div>
                                    </Tooltip>
                                ))}
                            </Space>
                        </div>
                    </Col>
                </Row>

                <Divider style={{
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    margin: '48px 0 24px',
                    transform: visible ? 'scaleX(0)' : 'scaleX(0)',
                    transition: 'transform 0.8s ease',
                    transitionDelay: '0.9s'
                }} />

                {/* Bottom Bar */}
                <Row
                    justify="space-between"
                    align="middle"
                    style={{
                        transform: visible ? 'translateY(0)' : 'translateY(20px)',
                        opacity: visible ? 1 : 0,
                        transition: 'all 0.6s ease',
                        transitionDelay: '1s'
                    }}
                >
                    <Col xs={24} sm={12}>
                        <Text style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '14px'
                        }}>
                            © {new Date().getFullYear()} Eram Talent. All rights reserved.
                        </Text>
                    </Col>
                </Row>
            </div>
        </Footer>
    );
};

export default HomeFooter;