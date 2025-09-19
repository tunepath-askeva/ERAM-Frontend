import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined, CalendarOutlined, FileTextOutlined } from '@ant-design/icons';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetEmployeeAdminDashboardQuery } from "../../Slices/Employee/EmployeeApis";
import SkeletonLoader from '../../Global/SkeletonLoader';

const EmployeeAdminDashboard = () => {
  const { data, isLoading } = useGetEmployeeAdminDashboardQuery();

  // Prepare chart data for Recharts
  const chartData = data ? [
    {
      name: 'Employees',
      value: data.totalEmployees,
    },
    {
      name: 'Leave Requests',
      value: data.totalLeaveRequests,
    },
    {
      name: 'Other Requests',
      value: data.totalOtherRequests,
    },
  ] : [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          border: '1px solid #da2c46',
          borderRadius: '4px',
          padding: '8px 12px',
          color: 'white',
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`${label}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

 if(isLoading){
  return <SkeletonLoader />
 }

  return (
    <div style={{ padding: '24px'}}>
      <h1 style={{ marginBottom: '24px', color: '#da2c46', fontSize: '28px', fontWeight: 'bold' }}>
        Employee Admin Dashboard
      </h1>
      
      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Employees"
              value={data.totalEmployees}
              prefix={<UserOutlined style={{ color: '#da2c46' }} />}
              valueStyle={{ color: '#da2c46', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Leave Requests"
              value={data.totalLeaveRequests}
              prefix={<CalendarOutlined style={{ color: '#da2c46' }} />}
              valueStyle={{ color: '#da2c46', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Other Requests"
              value={data.totalOtherRequests}
              prefix={<FileTextOutlined style={{ color: '#da2c46' }} />}
              valueStyle={{ color: '#da2c46', fontSize: '32px', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Area Chart */}
      <Card 
        title={
          <span style={{ color: '#da2c46', fontSize: '18px', fontWeight: 'bold' }}>
            Metrics Overview
          </span>
        }
        style={{ marginBottom: '24px' }}
      >
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#da2c46"
                strokeWidth={3}
                fill="rgba(218, 44, 70, 0.2)"
                fillOpacity={0.6}
                dot={{ fill: '#da2c46', strokeWidth: 2, stroke: '#ffffff', r: 6 }}
                activeDot={{ r: 8, stroke: '#da2c46', strokeWidth: 2, fill: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeAdminDashboard;