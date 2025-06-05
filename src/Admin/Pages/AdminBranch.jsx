import React from 'react';
import { 
  Card, 
  Typography, 
  Descriptions, 
  Tag, 
  Space, 
  Avatar, 
  Divider,
  Row,
  Col,
  Badge,
  Button,
  Tooltip
} from 'antd';
import {
  BankOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useGetAdminBranchQuery } from "../../Slices/Admin/AdminApis";

const { Title, Text } = Typography;

const AdminBranch = () => {
  const { data, isLoading } = useGetAdminBranchQuery();
  
  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Card loading style={{ maxWidth: 1200, margin: '0 auto' }} />
      </div>
    );
  }

  const branch = data?.branch;

  if (!branch) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Card>
          <Text type="secondary">No branch data available</Text>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div style={{ 
      padding: '24px', 
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header Section */}
        <Card 
          style={{ 
            marginBottom: '24px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Space size="large" align="center">
                <Avatar 
                  size={64} 
                  icon={<BankOutlined />}
                  style={{ 
                    background: 'linear-gradient(45deg, #1890ff, #096dd9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
                <div>
                  <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                    {branch.name}
                  </Title>
                  <Space>
                    <Tag color="blue" style={{ fontSize: '12px', padding: '4px 8px' }}>
                      {branch.branchCode}
                    </Tag>
                    <Badge 
                      status={branch.isActive ? "success" : "error"} 
                      text={branch.isActive ? "Active" : "Inactive"}
                      style={{ fontSize: '14px', fontWeight: 500 }}
                    />
                  </Space>
                </div>
              </Space>
            </Col>
            <Col>
             
            </Col>
          </Row>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Branch Information */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <BankOutlined style={{ color: '#1890ff' }} />
                  <span>Branch Information</span>
                </Space>
              }
              style={{ 
                borderRadius: '16px', 
                height: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}
              headStyle={{ 
                borderBottom: '2px solid #f0f0f0',
                fontSize: '18px',
                fontWeight: 600
              }}
            >
              <Descriptions 
                column={{ xs: 1, sm: 1, md: 2 }} 
                labelStyle={{ fontWeight: 600, color: '#595959' }}
                contentStyle={{ color: '#262626' }}
              >
                <Descriptions.Item 
                  label={
                    <Space>
                      <BankOutlined style={{ color: '#1890ff' }} />
                      Branch Name
                    </Space>
                  }
                >
                  <Text strong style={{ fontSize: '16px' }}>{branch.name}</Text>
                </Descriptions.Item>
                
                <Descriptions.Item 
                  label={
                    <Space>
                      <Tag icon={<CheckCircleOutlined />} color="blue">Code</Tag>
                    </Space>
                  }
                >
                  <Tag color="geekblue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {branch.branchCode}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item 
                  label={
                    <Space>
                      <EnvironmentOutlined style={{ color: '#52c41a' }} />
                      Address
                    </Space>
                  }
                  span={2}
                >
                  <div style={{ lineHeight: '1.6' }}>
                    <div>{branch.location.street}</div>
                    <div>{branch.location.city}, {branch.location.state}</div>
                    <div>{branch.location.country} - {branch.location.postalCode}</div>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item 
                  label={
                    <Space>
                      <PhoneOutlined style={{ color: '#fa8c16' }} />
                      Phone
                    </Space>
                  }
                >
                  <a href={`tel:${branch.location.branch_phoneno}`} style={{ color: '#1890ff' }}>
                    {branch.location.branch_phoneno}
                  </a>
                </Descriptions.Item>

                <Descriptions.Item 
                  label={
                    <Space>
                      <MailOutlined style={{ color: '#eb2f96' }} />
                      Email
                    </Space>
                  }
                >
                  <a href={`mailto:${branch.location.branch_email}`} style={{ color: '#1890ff' }}>
                    {branch.location.branch_email}
                  </a>
                </Descriptions.Item>

                <Descriptions.Item 
                  label="Description" 
                  span={2}
                >
                  <Text>{branch.description}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Status & Timeline */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Status Card */}
              <Card
                title={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    Status
                  </Space>
                }
                style={{ 
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                headStyle={{ 
                  borderBottom: '2px solid #f0f0f0',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Badge 
                    status={branch.isActive ? "success" : "error"} 
                    style={{ fontSize: '18px' }}
                  />
                  <Title level={3} style={{ 
                    margin: '10px 0 0 0', 
                    color: branch.isActive ? '#52c41a' : '#ff4d4f' 
                  }}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </Title>
                  <Text type="secondary">Branch Status</Text>
                </div>
              </Card>

              {/* Timeline Card */}
              <Card
                title={
                  <Space>
                    <CalendarOutlined style={{ color: '#722ed1' }} />
                    Timeline
                  </Space>
                }
                style={{ 
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                headStyle={{ 
                  borderBottom: '2px solid #f0f0f0',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ color: '#595959' }}>Created:</Text>
                    <br />
                    <Text style={{ fontSize: '16px' }}>{formatDate(branch.createdAt)}</Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div>
                    <Text strong style={{ color: '#595959' }}>Last Updated:</Text>
                    <br />
                    <Text style={{ fontSize: '16px' }}>{formatDate(branch.updatedAt)}</Text>
                  </div>
                </Space>
              </Card>

              {/* Services Card */}
              <Card
                title="Services"
                style={{ 
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  border: 'none',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
                headStyle={{ 
                  borderBottom: '2px solid #f0f0f0',
                  fontSize: '16px',
                  fontWeight: 600
                }}
              >
                {branch.services.length > 0 ? (
                  <Space wrap>
                    {branch.services.map((service, index) => (
                      <Tag key={index} color="purple" style={{ padding: '4px 8px' }}>
                        {service}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary" style={{ fontStyle: 'italic' }}>
                    No services configured
                  </Text>
                )}
              </Card>
            </Space>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AdminBranch;