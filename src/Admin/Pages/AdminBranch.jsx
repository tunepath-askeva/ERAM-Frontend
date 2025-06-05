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
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Card loading style={{ borderRadius: '16px' }} />
      </div>
    );
  }

  const branch = data?.branch;

  if (!branch) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Card style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)' }}>
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
      padding: '16px',
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <div className="branch-header" style={{ marginBottom: '16px' }}>

        <Card
          style={{
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              minWidth: 0,
              flex: 1
            }}>
              <Avatar
                size={32}
                icon={<BankOutlined />}
                style={{
                  color: '#2c3e50',
                  backgroundColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <Title level={3} style={{
                  margin: 0,
                  color: '#2c3e50',
                  fontSize: '18px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  Admin Assigned To -
                  <span style={{ color: "#1890ff" }}>
                    {/* " " */} {branch.name}
                  </span>
                </Title>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Space wrap style={{ marginTop: '4px' }}>
                  <Tag color="blue" style={{ fontSize: '12px', padding: '2px 8px' }}>
                    {branch.branchCode}
                  </Tag>
                  <Badge
                    status={branch.isActive ? "success" : "error"}
                    text={branch.isActive ? "Active" : "Inactive"}
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                </Space>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Content Section */}
      <Row gutter={[16, 16]}>
        {/* Branch Information */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <BankOutlined style={{ color: '#1890ff' }} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Branch Information</span>
              </Space>
            }
            style={{
              borderRadius: '12px',
              height: '100%',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
            }}
            headStyle={{
              borderBottom: '1px solid #f0f0f0',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            <Descriptions
              column={{ xs: 1, sm: 1, md: 2 }}
              labelStyle={{ fontWeight: 600, color: '#595959', fontSize: '14px' }}
              contentStyle={{ color: '#262626', fontSize: '14px' }}
              size="middle"
            >
              <Descriptions.Item
                label={
                  <Space>
                    <BankOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
                    Branch Name
                  </Space>
                }
              >
                <Text strong style={{ fontSize: '14px' }}>{branch.name}</Text>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <CheckCircleOutlined style={{ color: '#1890ff', fontSize: '14px' }} />
                    Code
                  </Space>
                }
              >
                <Tag color="geekblue" style={{ fontSize: '12px', padding: '2px 8px' }}>
                  {branch.branchCode}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <EnvironmentOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                    Address
                  </Space>
                }
                span={2}
              >
                <div style={{ lineHeight: '1.5', fontSize: '14px' }}>
                  <div>{branch.location.street}</div>
                  <div>{branch.location.city}, {branch.location.state}</div>
                  <div>{branch.location.country} - {branch.location.postalCode}</div>
                </div>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <PhoneOutlined style={{ color: '#fa8c16', fontSize: '14px' }} />
                    Phone
                  </Space>
                }
              >
                <a href={`tel:${branch.location.branch_phoneno}`} style={{ color: '#1890ff', fontSize: '14px' }}>
                  {branch.location.branch_phoneno}
                </a>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined style={{ color: '#eb2f96', fontSize: '14px' }} />
                    Email
                  </Space>
                }
              >
                <a href={`mailto:${branch.location.branch_email}`} style={{ color: '#1890ff', fontSize: '14px' }}>
                  {branch.location.branch_email}
                </a>
              </Descriptions.Item>

              <Descriptions.Item
                label="Description"
                span={2}
              >
                <Text style={{ fontSize: '14px' }}>{branch.description}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Status & Timeline */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* Status Card */}
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Status</span>
                </Space>
              }
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
              headStyle={{
                borderBottom: '1px solid #f0f0f0',
                fontSize: '16px',
                fontWeight: 600
              }}
              size="small"
            >
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <Badge
                  status={branch.isActive ? "success" : "error"}
                  style={{ fontSize: '16px' }}
                />
                <Title level={4} style={{
                  margin: '8px 0 0 0',
                  color: branch.isActive ? '#52c41a' : '#ff4d4f',
                  fontSize: '16px'
                }}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </Title>
                <Text type="secondary" style={{ fontSize: '12px' }}>Branch Status</Text>
              </div>
            </Card>

            {/* Timeline Card */}
            <Card
              title={
                <Space>
                  <CalendarOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Timeline</span>
                </Space>
              }
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
              headStyle={{
                borderBottom: '1px solid #f0f0f0',
                fontSize: '16px',
                fontWeight: 600
              }}
              size="small"
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong style={{ color: '#595959', fontSize: '12px' }}>Created:</Text>
                  <br />
                  <Text style={{ fontSize: '14px' }}>{formatDate(branch.createdAt)}</Text>
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div>
                  <Text strong style={{ color: '#595959', fontSize: '12px' }}>Last Updated:</Text>
                  <br />
                  <Text style={{ fontSize: '14px' }}>{formatDate(branch.updatedAt)}</Text>
                </div>
              </Space>
            </Card>

            {/* Services Card */}
            <Card
              title={
                <Space>
                  <SettingOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                  <span style={{ fontSize: '16px', fontWeight: 600 }}>Services</span>
                </Space>
              }
              style={{
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
              }}
              headStyle={{
                borderBottom: '1px solid #f0f0f0',
                fontSize: '16px',
                fontWeight: 600
              }}
              size="small"
            >
              {branch.services && branch.services.length > 0 ? (
                <Space wrap>
                  {branch.services.map((service, index) => (
                    <Tag key={index} color="purple" style={{ padding: '2px 8px', fontSize: '12px' }}>
                      {service}
                    </Tag>
                  ))}
                </Space>
              ) : (
                <Text type="secondary" style={{ fontStyle: 'italic', fontSize: '12px' }}>
                  No services configured
                </Text>
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default AdminBranch;