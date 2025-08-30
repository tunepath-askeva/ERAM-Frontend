import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Space, 
  Typography, 
  Progress, 
  Row, 
  Col,
  Statistic,
  Avatar,
  List,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  TeamOutlined 
} from '@ant-design/icons';
import { useGetWorkOrderDetailsQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;

const WorkOrderStatus = ({ jobId }) => {
  const { data, isLoading, error } = useGetWorkOrderDetailsQuery({ jobId });
  
  // Status configuration with colors and icons
  const statusConfig = {
    pipeline: { color: 'blue', text: 'Pipeline', icon: <ClockCircleOutlined /> },
    interview: { color: 'orange', text: 'Interview', icon: <ClockCircleOutlined /> },
    selected: { color: 'green', text: 'Selected', icon: <CheckCircleOutlined /> },
    rejected: { color: 'red', text: 'Rejected' },
    offered: { color: 'purple', text: 'Offered' },
    hired: { color: 'cyan', text: 'Hired' }
  };

  // Calculate status counts for statistics
  const getStatusCounts = () => {
    if (!data || !data.allWorkorderResponse) return {};
    
    return data.allWorkorderResponse.reduce((acc, candidate) => {
      acc[candidate.status] = (acc[candidate.status] || 0) + 1;
      return acc;
    }, {});
  };

  const statusCounts = getStatusCounts();
  const totalCandidates = data ? data.allWorkorderResponse.length : 0;

  // Table columns
  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'user',
      key: 'candidate',
      render: (user) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div>{user.fullName}</div>
            <Text type="secondary">{user.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusConfig[status]?.color || 'default'} icon={statusConfig[status]?.icon}>
          {statusConfig[status]?.text || status}
        </Tag>
      ),
    },
    {
      title: 'Sourced',
      dataIndex: 'isSourced',
      key: 'sourced',
      render: (isSourced) => (
        <Tag color={isSourced === "true" ? 'green' : 'volcano'}>
          {isSourced === "true" ? 'Yes' : 'No'}
        </Tag>
      ),
    },
  ];

  if (error) return <div>Error loading work order status</div>;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Work Order Status</Title>
      
      {/* Statistics Row */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Candidates"
              value={totalCandidates}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Col span={6} key={status}>
            <Card>
              <Statistic
                title={statusConfig[status]?.text || status}
                value={count}
                valueStyle={{ color: statusConfig[status]?.color }}
                prefix={statusConfig[status]?.icon}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Progress visualization */}
      <Card title="Recruitment Pipeline" style={{ marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <Progress 
            percent={Math.round((statusCounts.selected / totalCandidates) * 100) || 0} 
            status="active" 
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <Text type="secondary">Selection Progress</Text>
        </div>
      </Card>

      {/* Candidates Table */}
      <Card title="Candidate Details">
        <Table 
          columns={columns} 
          dataSource={data ? data.allWorkorderResponse : []} 
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Status Summary */}
      <Card title="Status Summary" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          {Object.entries(statusConfig).map(([key, config]) => (
            <Col span={8} key={key}>
              <Space>
                <Tag color={config.color} icon={config.icon}>
                  {config.text}
                </Tag>
                <Text strong>{statusCounts[key] || 0}</Text>
                <Text type="secondary">candidates</Text>
              </Space>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default WorkOrderStatus;