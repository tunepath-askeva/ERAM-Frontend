import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Avatar, Progress, Badge } from 'antd';
import { 
  Column, 
  Pie, 
  Area, 
  DualAxes,
  Bar
} from '@ant-design/plots';
import {
  UserOutlined,
  BranchesOutlined,
  TeamOutlined,
  TrophyOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import { useGetSuperDashboardDataQuery } from "../../Slices/SuperAdmin/SuperAdminApis";

const { Title, Text } = Typography;

const SuperDashboard = () => {
  const { data: branchesData, isLoading } = useGetSuperDashboardDataQuery();

  // Process the API data for visualizations
  const processedData = React.useMemo(() => {
    if (!branchesData?.branches) return null;

    const branches = branchesData.branches;
    
    // Total statistics
    const totalUsers = branches.reduce((sum, branch) => sum + branch.totalUsers, 0);
    const totalBranches = branches.length;
    const activeBranches = branches.filter(branch => branch.isActive).length;
    
    // User distribution across all branches
    const userTypeData = [
      { type: 'Candidates', count: branches.reduce((sum, branch) => sum + (branch.users?.candidates || 0), 0) },
      { type: 'Recruiters', count: branches.reduce((sum, branch) => sum + (branch.users?.recruiters || 0), 0) },
      { type: 'Employees', count: branches.reduce((sum, branch) => sum + (branch.users?.employees || 0), 0) },
      { type: 'Clients', count: branches.reduce((sum, branch) => sum + (branch.users?.clients || 0), 0) },
      { type: 'Staff', count: branches.reduce((sum, branch) => sum + (branch.users?.staff || 0), 0) },
      { type: 'Admins', count: branches.reduce((sum, branch) => sum + (branch.users?.admin || 0), 0) },
      { type: 'Super Admins', count: branches.reduce((sum, branch) => sum + (branch.users?.super_admin || 0), 0) },
    ];

    // Debug log to check the data
    console.log('Branches data:', branches);
    console.log('User Type Data before filter:', userTypeData);
    
    // Keep all data including zeros for debugging, filter only if needed
    const filteredUserTypeData = userTypeData.filter(item => item.count > 0);
    console.log('User Type Data after filter:', filteredUserTypeData);

    // Branch performance data
    const branchPerformanceData = branches.map(branch => ({
      branch: branch.name,
      users: branch.totalUsers,
      applications: (branch.applications?.hired || 0) + (branch.applications?.offer || 0) + (branch.applications?.pipeline || 0),
      hired: branch.applications?.hired || 0,
      offers: branch.applications?.offer || 0,
      pipeline: branch.applications?.pipeline || 0,
    }));

    // Applications status data
    const totalApplications = branches.reduce((sum, branch) => {
      const apps = branch.applications || {};
      return sum + (apps.hired || 0) + (apps.offer || 0) + (apps.pipeline || 0);
    }, 0);

    const applicationStatusData = [
      { 
        status: 'Hired', 
        count: branches.reduce((sum, branch) => sum + (branch.applications?.hired || 0), 0),
        percentage: branches.reduce((sum, branch) => sum + (branch.applications?.hired || 0), 0) / Math.max(totalApplications, 1) * 100
      },
      { 
        status: 'Offer', 
        count: branches.reduce((sum, branch) => sum + (branch.applications?.offer || 0), 0),
        percentage: branches.reduce((sum, branch) => sum + (branch.applications?.offer || 0), 0) / Math.max(totalApplications, 1) * 100
      },
      { 
        status: 'Pipeline', 
        count: branches.reduce((sum, branch) => sum + (branch.applications?.pipeline || 0), 0),
        percentage: branches.reduce((sum, branch) => sum + (branch.applications?.pipeline || 0), 0) / Math.max(totalApplications, 1) * 100
      },
    ].filter(item => item.count > 0);

    return {
      totalUsers,
      totalBranches,
      activeBranches,
      totalApplications,
      userTypeData: filteredUserTypeData,
      branchPerformanceData,
      applicationStatusData,
      branches
    };
  }, [branchesData]);

  if (isLoading || !processedData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text>Loading dashboard data...</Text>
      </div>
    );
  }

  const primaryColor = '#da2c46';
  const secondaryColors = ['#da2c46', '#ff7875', '#ffa39e', '#ffb3b3', '#ffc9c9'];

  // Chart configurations
  const userTypeChartConfig = {
    data: processedData.userTypeData,
    angleField: 'count',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    label: {
      type: 'spider',
      labelHeight: 28,
      content: '{name}\n{percentage}',
    },
    color: secondaryColors,
    interactions: [{ type: 'element-active' }],
  };

  const branchUsersChartConfig = {
    data: processedData.branchPerformanceData,
    xField: 'branch',
    yField: 'users',
    color: primaryColor,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
      },
    },
  };

  const applicationStatusConfig = {
    data: processedData.applicationStatusData,
    xField: 'status',
    yField: 'count',
    seriesField: 'status',
    color: ({ status }) => {
      const colorMap = {
        'Hired': '#52c41a',
        'Offer': '#faad14',
        'Pipeline': '#1890ff'
      };
      return colorMap[status] || primaryColor;
    },
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
      },
    },
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: primaryColor }}>
          Super Admin Dashboard
        </Title>
        <Text type="secondary">Comprehensive overview of all branches and operations</Text>
      </div>

      {/* Key Metrics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Branches"
              value={processedData.totalBranches}
              prefix={<BranchesOutlined style={{ color: primaryColor }} />}
              valueStyle={{ color: primaryColor }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="success">{processedData.activeBranches} Active</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={processedData.totalUsers}
              prefix={<UserOutlined style={{ color: primaryColor }} />}
              valueStyle={{ color: primaryColor }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">Across all branches</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Applications"
              value={processedData.totalApplications}
              prefix={<FileDoneOutlined style={{ color: primaryColor }} />}
              valueStyle={{ color: primaryColor }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">All statuses</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={processedData.totalApplications > 0 ? 
                Math.round((processedData.applicationStatusData.find(item => item.status === 'Hired')?.count || 0) / processedData.totalApplications * 100) : 0}
              suffix="%"
              prefix={<TrophyOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">Hiring success</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="User Distribution by Type" style={{ height: '400px' }}>
            {processedData.userTypeData.length > 0 ? (
              <Pie {...userTypeChartConfig} height={300} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Text type="secondary">No user data available</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Total Users: {processedData.totalUsers}
                </Text>
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Applications Status" style={{ height: '400px' }}>
            {processedData.applicationStatusData.length > 0 ? (
              <Column {...applicationStatusConfig} height={300} />
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Text type="secondary">No application data available</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Branch Performance Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="Branch Performance - User Count" style={{ height: '400px' }}>
            <Column {...branchUsersChartConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* Branch Details Cards */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Branch Details" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              {processedData.branches.map((branch) => (
                <Col xs={24} md={12} lg={8} key={branch.branchId}>
                  <Card
                    size="small"
                    style={{ 
                      border: `2px solid ${branch.isActive ? primaryColor : '#d9d9d9'}`,
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <Avatar 
                        src={branch.brand_logo} 
                        size={48}
                        style={{ marginRight: '12px', backgroundColor: primaryColor }}
                      >
                        {branch.name.charAt(0)}
                      </Avatar>
                      <div style={{ flex: 1 }}>
                        <Title level={5} style={{ margin: 0, color: primaryColor }}>
                          {branch.name}
                        </Title>
                        <Text type="secondary">{branch.branchCode}</Text>
                      </div>
                      <Badge 
                        status={branch.isActive ? 'success' : 'default'} 
                        text={branch.isActive ? 'Active' : 'Inactive'}
                      />
                    </div>
                    
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Total Users:</Text>
                        <Text strong style={{ color: primaryColor }}>{branch.totalUsers}</Text>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Candidates:</Text>
                        <Text>{branch.users?.candidates || 0}</Text>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text>Recruiters:</Text>
                        <Text>{branch.users?.recruiters || 0}</Text>
                      </div>
                      
                      {branch.applications && Object.keys(branch.applications).length > 0 && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Applications:</Text>
                            <Text strong>
                              {(branch.applications.hired || 0) + (branch.applications.offer || 0) + (branch.applications.pipeline || 0)}
                            </Text>
                          </div>
                          
                          <div style={{ fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text type="secondary">Hired: {branch.applications.hired || 0}</Text>
                              <Text type="secondary">Offers: {branch.applications.offer || 0}</Text>
                              <Text type="secondary">Pipeline: {branch.applications.pipeline || 0}</Text>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div style={{ marginTop: '8px', fontSize: '11px' }}>
                        <Text type="secondary">
                          📍 {branch.location.city}, {branch.location.state}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SuperDashboard;