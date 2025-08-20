import React, { useMemo } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Space, 
  Avatar, 
  Badge, 
  Spin,
  Empty,
  Progress,
  Tag,
  Divider
} from 'antd';
import {
  UserOutlined,
  BranchesOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';
import { 
  Column, 
  Pie, 
  Area,
  Bar
} from '@ant-design/plots';
import { useGetSuperDashboardDataQuery } from "../../Slices/SuperAdmin/SuperAdminApis";

const { Title, Text } = Typography;

const SuperDashboard = () => {
  const { data: branchesData, isLoading } = useGetSuperDashboardDataQuery();

  const processedData = useMemo(() => {
    if (!branchesData?.branches) return null;

    const branches = branchesData.branches;
    
    // Calculate totals
    const totalUsers = branches.reduce((sum, branch) => sum + branch.totalUsers, 0);
    const totalBranches = branches.length;
    const activeBranches = branches.filter(branch => branch.isActive).length;
    
    // Branch performance data
    const branchPerformanceData = branches.map(branch => ({
      branch: branch.name,
      users: branch.totalUsers,
      applications: Object.values(branch.applications || {}).reduce((sum, val) => sum + val, 0)
    }));

    // Applications data
    const totalApplications = branches.reduce((sum, branch) => {
      if (!branch.applications) return sum;
      return sum + Object.values(branch.applications).reduce((appSum, val) => appSum + val, 0);
    }, 0);

    const applicationStatusData = [
      { status: 'Hired', count: branches.reduce((sum, branch) => sum + (branch.applications?.hired || 0), 0) },
      { status: 'Offers', count: branches.reduce((sum, branch) => sum + (branch.applications?.offer || 0), 0) },
      { status: 'Pipeline', count: branches.reduce((sum, branch) => sum + (branch.applications?.pipeline || 0), 0) },
    ].filter(item => item.count > 0);

    const successRate = totalApplications > 0 ? 
      Math.round((branches.reduce((sum, branch) => sum + (branch.applications?.hired || 0), 0) / totalApplications) * 100) : 0;

    return {
      totalUsers,
      totalBranches,
      activeBranches,
      totalApplications,
      successRate,
      branchPerformanceData,
      applicationStatusData,
      branches
    };
  }, [branchesData]);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '16px'
      }}>
        <Card style={{ 
          textAlign: 'center', 
          width: '100%',
          maxWidth: '300px'
        }}>
          <Spin size="large" />
          <Title level={4} style={{ marginTop: '16px', color: '#da2c46' }}>
            Loading Dashboard Data...
          </Title>
        </Card>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '16px'
      }}>
        <Card style={{ width: '100%', maxWidth: '400px' }}>
          <Empty description="No dashboard data available" />
        </Card>
      </div>
    );
  }

  const primaryColor = '#da2c46';
  const gradientColors = ['#da2c46', '#ff7875', '#ffa39e', '#ffb3b3', '#ffc9c9', '#ffdbdb', '#ffe7e7'];

  // Chart configurations
  const branchUsersChartConfig = {
    data: processedData.branchPerformanceData,
    xField: 'branch',
    yField: 'users',
    color: primaryColor,
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
        fontSize: 12,
        fontWeight: 'bold'
      },
    },
    tooltip: {
      customContent: (title, items) => {
        if (items && items.length > 0) {
          const data = items[0].data;
          return `<div style="padding: 12px;">
            <h4 style="margin: 0 0 8px 0; color: ${primaryColor};">${title}</h4>
            <p style="margin: 4px 0;"><span style="color: ${primaryColor};">●</span> Users: ${data.users}</p>
            <p style="margin: 4px 0;"><span style="color: #1890ff;">●</span> Applications: ${data.applications}</p>
          </div>`;
        }
        return '';
      }
    }
  };

  const applicationStatusConfig = {
    data: processedData.applicationStatusData,
    xField: 'status',
    yField: 'count',
    seriesField: 'status',
    color: ({ status }) => {
      const colorMap = {
        'Hired': '#52c41a',
        'Offers': '#faad14',
        'Pipeline': '#1890ff'
      };
      return colorMap[status] || primaryColor;
    },
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.9,
        fontSize: 12,
        fontWeight: 'bold'
      },
    }
  };

  const branchAreaChartConfig = {
    data: processedData.branchPerformanceData,
    xField: 'branch',
    yField: 'users',
    smooth: true,
    areaStyle: {
      fill: `l(270) 0:${primaryColor}40 1:${primaryColor}10`
    },
    line: {
      color: primaryColor,
      size: 3
    },
    point: {
      color: primaryColor,
      size: 6
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '8px 12px 24px',
      // Responsive padding
      '@media (min-width: 576px)': {
        padding: '16px 20px 24px'
      },
      '@media (min-width: 768px)': {
        padding: '24px'
      }
    }}>
      {/* Header - Responsive */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title 
          level={1} 
          style={{ 
            margin: 0, 
            color: primaryColor,
            fontSize: 'clamp(1.5rem, 5vw, 3rem)',
            background: `linear-gradient(135deg, ${primaryColor}, #ff7875)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}
        >
          Super Admin Dashboard
        </Title>
        <Text style={{ 
          fontSize: 'clamp(14px, 2.5vw, 18px)', 
          color: '#666',
          display: 'block',
          padding: '0 16px'
        }}>
          Comprehensive overview of all branches and operations
        </Text>
      </div>

      {/* Key Metrics Row - Fully Responsive */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
              border: 'none',
              boxShadow: '0 8px 24px rgba(218, 44, 70, 0.12)',
              height: '100%'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '600' }}>Total Branches</span>}
              value={processedData.totalBranches}
              prefix={<BranchesOutlined style={{ color: primaryColor, fontSize: 'clamp(20px, 3vw, 24px)' }} />}
              valueStyle={{ color: primaryColor, fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#f6ffed', borderRadius: '8px' }}>
              <Text style={{ color: '#52c41a', fontWeight: '600', fontSize: 'clamp(12px, 1.8vw, 14px)' }}>
                <CheckCircleOutlined /> {processedData.activeBranches} Active
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)',
              border: 'none',
              boxShadow: '0 8px 24px rgba(24, 144, 255, 0.12)',
              height: '100%'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '600' }}>Total Users</span>}
              value={processedData.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff', fontSize: 'clamp(20px, 3vw, 24px)' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: '12px' }}>
              <Progress 
                percent={100} 
                strokeColor='#1890ff'
                showInfo={false} 
                size="small" 
              />
              <Text style={{ color: '#666', fontSize: 'clamp(10px, 1.5vw, 12px)' }}>Across all branches</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff 0%, #fffbf0 100%)',
              border: 'none',
              boxShadow: '0 8px 24px rgba(250, 173, 20, 0.12)',
              height: '100%'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '600' }}>Total Applications</span>}
              value={processedData.totalApplications}
              prefix={<FileDoneOutlined style={{ color: '#faad14', fontSize: 'clamp(20px, 3vw, 24px)' }} />}
              valueStyle={{ color: '#faad14', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: '12px' }}>
              <Space>
                <Tag color="processing">All Status</Tag>
              </Space>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fff 0%, #f6ffed 100%)',
              border: 'none',
              boxShadow: '0 8px 24px rgba(82, 196, 26, 0.12)',
              height: '100%'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: 'clamp(14px, 2vw, 16px)', fontWeight: '600' }}>Success Rate</span>}
              value={processedData.successRate}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: '#52c41a', fontSize: 'clamp(20px, 3vw, 24px)' }} />}
              valueStyle={{ color: '#52c41a', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: '12px' }}>
              <Progress 
                percent={processedData.successRate} 
                strokeColor='#52c41a'
                size="small" 
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Single Chart Row - Application Status Only */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <RiseOutlined style={{ color: primaryColor }} />
                <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', fontWeight: '600' }}>Application Status</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              minHeight: '400px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
            }}
            headStyle={{ 
              borderBottom: `2px solid ${primaryColor}20`,
              borderRadius: '16px 16px 0 0'
            }}
          >
            {processedData.applicationStatusData.length > 0 ? (
              <Column {...applicationStatusConfig} height={320} />
            ) : (
              <Empty 
                description="No application data available"
                style={{ padding: '80px 0' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Branch Performance Chart - Responsive */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <BranchesOutlined style={{ color: primaryColor }} />
                <span style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', fontWeight: '600' }}>Branch Performance Overview</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              minHeight: '400px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
            }}
            headStyle={{ 
              borderBottom: `2px solid ${primaryColor}20`,
              borderRadius: '16px 16px 0 0'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Title level={5} style={{ 
                  color: '#666', 
                  textAlign: 'center',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  marginBottom: '16px'
                }}>
                  User Count by Branch
                </Title>
                <Column {...branchUsersChartConfig} height={280} />
              </Col>
              <Col xs={24} lg={12}>
                <Title level={5} style={{ 
                  color: '#666', 
                  textAlign: 'center',
                  fontSize: 'clamp(14px, 2vw, 16px)',
                  marginBottom: '16px'
                }}>
                  User Growth Trend
                </Title>
                <Area {...branchAreaChartConfig} height={280} />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Branch Details Grid - Fully Responsive */}
      <Card 
        title={
          <Space>
            <BranchesOutlined style={{ color: primaryColor }} />
            <span style={{ fontSize: 'clamp(18px, 3vw, 20px)', fontWeight: '600' }}>Branch Details</span>
          </Space>
        }
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
        }}
        headStyle={{ 
          borderBottom: `2px solid ${primaryColor}20`,
          borderRadius: '16px 16px 0 0'
        }}
      >
        <Row gutter={[16, 16]}>
          {processedData.branches.map((branch) => {
            const totalApps = Object.values(branch.applications || {}).reduce((sum, val) => sum + val, 0);
            const hiredCount = branch.applications?.hired || 0;
            const offersCount = branch.applications?.offer || 0;
            const pipelineCount = branch.applications?.pipeline || 0;
            
            return (
              <Col xs={24} sm={24} md={12} lg={8} xl={6} key={branch.branchId}>
                <Card
                  hoverable
                  style={{ 
                    borderRadius: '12px',
                    border: `2px solid ${branch.isActive ? primaryColor : '#d9d9d9'}`,
                    background: branch.isActive 
                      ? 'linear-gradient(135deg, #fff 0%, #fef7f7 100%)'
                      : 'linear-gradient(135deg, #fff 0%, #f5f5f5 100%)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    height: '100%'
                  }}
                >
                  {/* Branch Header - Responsive */}
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                    <Avatar 
                      src={branch.brand_logo} 
                      size={window.innerWidth < 768 ? 48 : 56}
                      style={{ 
                        marginRight: '12px', 
                        backgroundColor: primaryColor,
                        border: `2px solid ${primaryColor}30`,
                        marginBottom: window.innerWidth < 480 ? '8px' : '0'
                      }}
                    >
                      {branch.name.charAt(0)}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: '120px' }}>
                      <Title level={5} style={{ 
                        margin: 0, 
                        color: primaryColor,
                        fontSize: 'clamp(14px, 2.2vw, 16px)'
                      }}>
                        {branch.name}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 'clamp(10px, 1.8vw, 12px)' }}>
                        {branch.branchCode}
                      </Text>
                    </div>
                    <Badge 
                      status={branch.isActive ? 'success' : 'default'} 
                      text={
                        <span style={{ 
                          fontWeight: '600',
                          color: branch.isActive ? '#52c41a' : '#999',
                          fontSize: 'clamp(11px, 1.5vw, 12px)'
                        }}>
                          {branch.isActive ? 'Active' : 'Inactive'}
                        </span>
                      }
                    />
                  </div>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  {/* User Statistics - Responsive */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <Text style={{ fontWeight: '600', fontSize: 'clamp(12px, 1.8vw, 14px)' }}>Total Users:</Text>
                      <Tag color="red" style={{ 
                        fontSize: 'clamp(12px, 2vw, 14px)', 
                        fontWeight: 'bold',
                        padding: '4px 8px'
                      }}>
                        {branch.totalUsers}
                      </Tag>
                    </div>
                    
                    <Row gutter={[8, 8]}>
                      <Col xs={12} sm={12}>
                        <div style={{ 
                          background: '#f0f9ff', 
                          padding: '8px', 
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <Text style={{ 
                            fontSize: 'clamp(14px, 2.5vw, 16px)', 
                            fontWeight: 'bold', 
                            color: '#1890ff' 
                          }}>
                            {branch.users?.candidates || 0}
                          </Text>
                          <br />
                          <Text style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', color: '#666' }}>Candidates</Text>
                        </div>
                      </Col>
                      <Col xs={12} sm={12}>
                        <div style={{ 
                          background: '#fff7e6', 
                          padding: '8px', 
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}>
                          <Text style={{ 
                            fontSize: 'clamp(14px, 2.5vw, 16px)', 
                            fontWeight: 'bold', 
                            color: '#faad14' 
                          }}>
                            {branch.users?.recruiters || 0}
                          </Text>
                          <br />
                          <Text style={{ fontSize: 'clamp(9px, 1.5vw, 11px)', color: '#666' }}>Recruiters</Text>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  
                  {/* Applications Section - Responsive */}
                  {totalApps > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <Divider style={{ margin: '12px 0' }} />
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <Text style={{ fontWeight: '600', fontSize: 'clamp(12px, 1.8vw, 14px)' }}>Applications:</Text>
                        <Tag color="blue" style={{ 
                          fontSize: 'clamp(12px, 2vw, 14px)', 
                          fontWeight: 'bold',
                          padding: '4px 8px'
                        }}>
                          {totalApps}
                        </Tag>
                      </div>
                      
                      <Row gutter={[4, 4]}>
                        <Col xs={8} sm={8}>
                          <div style={{ 
                            background: '#f6ffed', 
                            padding: '6px 4px', 
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}>
                            <Text style={{ 
                              fontSize: 'clamp(12px, 2vw, 14px)', 
                              fontWeight: 'bold', 
                              color: '#52c41a' 
                            }}>
                              {hiredCount}
                            </Text>
                            <br />
                            <Text style={{ fontSize: 'clamp(8px, 1.3vw, 10px)', color: '#666' }}>Hired</Text>
                          </div>
                        </Col>
                        <Col xs={8} sm={8}>
                          <div style={{ 
                            background: '#fff7e6', 
                            padding: '6px 4px', 
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}>
                            <Text style={{ 
                              fontSize: 'clamp(12px, 2vw, 14px)', 
                              fontWeight: 'bold', 
                              color: '#faad14' 
                            }}>
                              {offersCount}
                            </Text>
                            <br />
                            <Text style={{ fontSize: 'clamp(8px, 1.3vw, 10px)', color: '#666' }}>Offers</Text>
                          </div>
                        </Col>
                        <Col xs={8} sm={8}>
                          <div style={{ 
                            background: '#f0f9ff', 
                            padding: '6px 4px', 
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}>
                            <Text style={{ 
                              fontSize: 'clamp(12px, 2vw, 14px)', 
                              fontWeight: 'bold', 
                              color: '#1890ff' 
                            }}>
                              {pipelineCount}
                            </Text>
                            <br />
                            <Text style={{ fontSize: 'clamp(8px, 1.3vw, 10px)', color: '#666' }}>Pipeline</Text>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}
                  
                  {/* Location Info - Responsive */}
                  <div style={{ 
                    background: '#fafafa', 
                    padding: '10px', 
                    borderRadius: '8px',
                    marginTop: '12px'
                  }}>
                    <div style={{ marginBottom: '4px' }}>
                      <Text style={{ fontSize: 'clamp(10px, 1.5vw, 12px)', color: '#666' }}>
                        <EnvironmentOutlined style={{ marginRight: '4px' }} />
                        {branch.location.city}, {branch.location.state}
                      </Text>
                    </div>
                    <div>
                      <Text style={{ fontSize: 'clamp(9px, 1.3vw, 11px)', color: '#999' }}>
                        <PhoneOutlined style={{ marginRight: '4px' }} />
                        {branch.location.branch_phoneno}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>
    </div>
  );
};

export default SuperDashboard;