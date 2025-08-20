import React from 'react';
import { useGetAdminDashboardDataQuery } from "../../Slices/Admin/AdminApis";
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress, 
  Typography,
  Space 
} from 'antd';
import {
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { Pie, Column } from '@ant-design/plots';

const { Title } = Typography;

const AdminDashboard = () => {
  const { data, isLoading } = useGetAdminDashboardDataQuery();
  
  // Prepare role data for pie chart
  const roleData = data?.roleCounts?.map(item => ({
    type: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    value: item.count
  })) || [];
  
  // Prepare status data for column chart
  const statusData = data?.statusCounts?.map(item => ({
    status: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count
  })) || [];
  
  // Calculate total users from role counts
  const totalUsers = data?.roleCounts?.reduce((sum, role) => sum + role.count, 0) || 0;
  
  // Pie chart configuration
  const pieConfig = {
    data: roleData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    height: 300,
  };
  
  // Column chart configuration
  const columnConfig = {
    data: statusData,
    xField: 'status',
    yField: 'count',
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.6,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    height: 300,
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Admin Dashboard</Title>
      
      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Candidates"
              value={data?.totalCandidates || 0}
              prefix={<UserOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={totalUsers}
              prefix={<TeamOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Recruiters"
              value={data?.roleCounts?.find(r => r._id === 'recruiter')?.count || 0}
              prefix={<SolutionOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Employees"
              value={data?.roleCounts?.find(r => r._id === 'employee')?.count || 0}
              prefix={<PieChartOutlined />}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Charts Section */}
      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title="User Distribution by Role" 
            bordered={false}
            loading={isLoading}
          >
            {data && <Pie {...pieConfig} />}
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="Candidate Status" 
            bordered={false}
            loading={isLoading}
          >
            {data && <Column {...columnConfig} />}
          </Card>
        </Col>
      </Row>
      
      {/* Additional Stats */}
      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="Role Distribution Details" loading={isLoading}>
            {data?.roleCounts?.map(role => (
              <div key={role._id} style={{ marginBottom: '16px' }}>
                <Space>
                  <span>{role._id.charAt(0).toUpperCase() + role._id.slice(1)}:</span>
                  <span style={{ fontWeight: 'bold' }}>{role.count}</span>
                  <Progress 
                    percent={Math.round((role.count / totalUsers) * 100)} 
                    size="small" 
                    style={{ width: '50%' }}
                  />
                </Space>
              </div>
            ))}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Status Overview" loading={isLoading}>
            {data?.statusCounts?.map(status => (
              <div key={status._id} style={{ marginBottom: '16px' }}>
                <Space>
                  <span>{status._id.charAt(0).toUpperCase() + status._id.slice(1)}:</span>
                  <span style={{ fontWeight: 'bold' }}>{status.count}</span>
                </Space>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;