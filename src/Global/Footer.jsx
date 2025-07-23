import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    };

    const footerStyle = {
        background: '#ffffff',
        color: '#000000',
        padding: '60px 0 20px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #f0f0f0',
    };

    const socialButtonStyle = {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        background: 'rgba(0, 0, 0, 0.02)',
        color: '#000000',
        fontSize: '16px',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
    };

    const linkStyle = {
        color: 'rgba(0, 0, 0, 0.7)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        fontSize: '14px',
        lineHeight: '2',
        display: 'block',
    };

    const cardStyle = {
        background: 'transparent',
        border: 'none',
        padding: '0',
        height: '100%',
    };

    return (
        <Footer style={footerStyle}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                <Row gutter={[32, 32]}>
                    {/* Company Info */}
                    <Col xs={24} sm={12} md={6}>
                        <div style={cardStyle}>
                            <div style={{ marginBottom: '20px' }}>
                                <img
                                    src="/Workforce.svg"
                                    style={{
                                        height: '100px',
                                        width: 'auto',
                                        objectFit: 'contain',
                                    }}
                                    alt="ERAM TALENT Logo"
                                />
                            </div>
                            <Paragraph style={{
                                color: 'rgba(0, 0, 0, 0.7)',
                                marginBottom: '20px',
                                lineHeight: '1.6'
                            }}>
                                Delivering innovative solutions and personalized expertise, empowering businesses to thrive and excel in their industries.
                            </Paragraph>

                            <Space direction="vertical" size="small">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <EnvironmentOutlined style={{ color: '#da2c46', fontSize: '16px' }} />
                                    <Text style={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '14px' }}>
                                        123 Business Street, Suite 100
                                    </Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <PhoneOutlined style={{ color: '#da2c46', fontSize: '16px' }} />
                                    <Text style={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '14px' }}>
                                        +1 (555) 123-4567
                                    </Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <MailOutlined style={{ color: '#da2c46', fontSize: '16px' }} />
                                    <Text style={{ color: 'rgba(0, 0, 0, 0.7)', fontSize: '14px' }}>
                                        info@eramtalent.com
                                    </Text>
                                </div>
                            </Space>
                        </div>
                    </Col>

                    {/* Quick Links */}
                    <Col xs={24} sm={12} md={6}>
                        <div style={cardStyle}>
                            <Title level={4} style={{ color: '#000000', marginBottom: '20px', fontSize: '18px' }}>
                                Quick Links
                            </Title>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                {['Home', 'About', 'Services', 'Contacts', 'Branches'].map((item) => (
                                    <Link
                                        key={item}
                                        to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                                        style={{
                                            ...linkStyle,
                                            textDecoration: 'none',
                                            color: 'rgba(0, 0, 0, 0.7)',
                                            display: 'block',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color = '#da2c46';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color = 'rgba(0, 0, 0, 0.7)';
                                        }}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </Space>
                        </div>
                    </Col>

                    {/* Services */}
                    <Col xs={24} sm={12} md={6}>
                        <div style={cardStyle}>
                            <Title level={4} style={{ color: '#000000', marginBottom: '20px', fontSize: '18px' }}>
                                Our Services
                            </Title>
                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                {['Talent Acquisition', 'Executive Search', 'HR Consulting', 'Recruitment Process', 'Career Guidance'].map((item) => (
                                    <a
                                        key={item}
                                        href="/services"
                                        style={{
                                            ...linkStyle,
                                            textDecoration: 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.color = '#da2c46';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.color = 'rgba(0, 0, 0, 0.7)';
                                        }}
                                    >
                                        {item}
                                    </a>
                                ))}
                            </Space>
                        </div>
                    </Col>

                    {/* Newsletter */}
                    <Col xs={24} sm={12} md={6}>
                        <div style={cardStyle}>
                            <Title level={4} style={{ color: '#000000', marginBottom: '20px', fontSize: '18px' }}>
                                Stay Connected
                            </Title>
                            <Paragraph style={{
                                color: 'rgba(0, 0, 0, 0.7)',
                                marginBottom: '20px',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                Subscribe to our newsletter for the latest updates and insights.
                            </Paragraph>

                            <Search
                                placeholder="Enter your email"
                                enterButton={
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        style={{ backgroundColor: '#da2c46', borderColor: '#da2c46' }}
                                    />
                                }
                                size="large"
                                onSearch={handleSubscribe}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    marginBottom: '20px',
                                }}
                            />

                            <Title level={4} style={{ color: '#000000', marginBottom: '15px', fontSize: '18px' }}>
                                Follow Us
                            </Title>
                            <Space size="middle">
                                {[
                                    { icon: <LinkedinOutlined />, color: '#0077b5' },
                                    { icon: <TwitterOutlined />, color: '#1da1f2' },
                                    { icon: <InstagramOutlined />, color: '#e4405f' },
                                    { icon: <FacebookOutlined />, color: '#1877f2' }
                                ].map((social, index) => (
                                    <Tooltip key={index} title="Follow us">
                                        <a
                                            href="#"
                                            style={socialButtonStyle}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = social.color;
                                                e.currentTarget.style.borderColor = social.color;
                                                e.currentTarget.style.color = '#ffffff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.02)';
                                                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                                                e.currentTarget.style.color = '#000000';
                                            }}
                                        >
                                            {social.icon}
                                        </a>
                                    </Tooltip>
                                ))}
                            </Space>
                        </div>
                    </Col>
                </Row>

                <Divider style={{
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    margin: '40px 0 20px',
                }} />

                {/* Bottom Bar */}
                <Row justify="center">
                    <Col>
                        <Text style={{
                            color: 'rgba(0, 0, 0, 0.5)',
                            fontSize: '14px',
                            textAlign: 'center',
                            display: 'block'
                        }}>
                            © {new Date().getFullYear()} Eram Talent. All rights reserved.
                        </Text>
                    </Col>
                </Row>
            </div>

            {/* Responsive CSS */}
            <style jsx>{`
                /* Mobile adjustments */
                @media (max-width: 768px) {
                    .ant-row {
                        row-gap: 24px !important;
                    }
                    
                    .ant-col {
                        margin-bottom: 20px;
                    }
                }

                /* Small mobile adjustments */
                @media (max-width: 480px) {
                    .ant-layout-footer {
                        padding: 40px 16px 20px !important;
                    }
                    
                    .ant-divider {
                        margin: 30px 0 15px !important;
                    }
                }

                /* Link hover effects */
                a:hover {
                    text-decoration: none !important;
                }

                /* Search input hover */
                .ant-input-search .ant-input:hover,
                .ant-input-search .ant-input:focus {
                    box-shadow: none !important;
                }


                /* Search input border color */
                .ant-input-search .ant-input {
                    border-color: #da2c46 !important;
                }

                /* Logo color adjustment */
                .ant-layout-footer img {
                    filter: none !important;
                }
            `}</style>
        </Footer>
    );
};

export default HomeFooter;