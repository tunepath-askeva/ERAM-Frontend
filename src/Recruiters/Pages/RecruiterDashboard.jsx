import React from 'react';
import { useGetDashboardDataQuery } from "../../Slices/Recruiter/RecruiterApis";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Progress, 
  Spin, 
  Alert, 
  Typography, 
  Space, 
  Tag, 
  Divider 
} from 'antd';
import { 
  UserOutlined, 
  FileTextOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  RiseOutlined 
} from '@ant-design/icons';
import { Pie, Column } from '@ant-design/plots';

const { Title, Text } = Typography;

const RecruiterDashboard = () => {
  // Mock data based on your API response structure
  const mockData = {
    candidates: {
      total: 30,
      byStatus: [
        { _id: null, count: 30 }
      ]
    },
    applications: {
      byStatus: [
        { _id: "interview", count: 1 },
        { _id: "hired", count: 1 },
        { _id: "pipeline", count: 1 }
      ]
    },
    interviews: [
      { _id: "interview_completed", count: 2 },
      { _id: "scheduled", count: 1 }
    ]
  };

  // Use the actual query (will fallback to mock data for demo)
  const { data = mockData, isLoading, error } = useGetDashboardDataQuery();

  // Color palette based on primary color #da2c46
  const colors = {
    primary: '#da2c46',
    success: '#52c41a',
    warning: '#faad14',
    info: '#1890ff',
    error: '#ff4d4f',
    purple: '#722ed1',
    cyan: '#13c2c2'
  };

  // Calculate totals
  const totalApplications = data.applications.byStatus.reduce((sum, item) => sum + item.count, 0);
  const totalInterviews = data.interviews.reduce((sum, item) => sum + item.count, 0);
  const hiredCount = data.applications.byStatus.find(item => item._id === 'hired')?.count || 0;
  const completedInterviews = data.interviews.find(item => item._id === 'interview_completed')?.count || 0;

  // Prepare chart data for AntV
  const applicationStatusData = data.applications.byStatus.map(item => ({
    status: item._id.charAt(0).toUpperCase() + item._id.slice(1),
    count: item.count,
    type: item._id
  }));

  const interviewData = data.interviews.map(item => ({
    status: item._id === 'interview_completed' ? 'Completed' : 'Scheduled',
    count: item.count,
    type: item._id
  }));

  // AntV Chart configurations
  const pieConfig = {
    data: applicationStatusData,
    angleField: 'count',
    colorField: 'status',
    radius: 0.8,
    innerRadius: 0.3,
    label: {
      type: 'outer',
      content: '{name}: {value} ({percentage})',
      style: {
        fontSize: 12,
        textAlign: 'center',
      }
    },
    statistic: {
      title: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '14px',
          color: '#666'
        },
        content: 'Total\nApplications',
      },
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: '24px',
          color: colors.primary,
          fontWeight: 'bold'
        },
        content: totalApplications.toString(),
      },
    },
    interactions: [
      { type: 'element-active' },
      { type: 'pie-statistic-active' }
    ],
    color: (datum) => {
      const colorMap = {
        'Hired': colors.success,
        'Interview': colors.warning,
        'Pipeline': colors.primary
      };
      return colorMap[datum.status] || colors.primary;
    },
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fontSize: 12,
        }
      }
    },
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    }
  };

  const columnConfig = {
    data: interviewData,
    xField: 'status',
    yField: 'count',
    columnWidthRatio: 0.6,
    color: (datum) => {
      return datum.status === 'Completed' ? colors.success : colors.info;
    },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.9,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
      },
      formatter: (datum) => datum.count.toString()
    },
    tooltip: {
      formatter: (datum) => {
        return { name: 'Count', value: datum.count };
      },
    },
    meta: {
      count: {
        alias: 'Interview Count',
      },
      status: {
        alias: 'Status',
      },
    },
    columnStyle: {
      radius: [6, 6, 0, 0],
      cursor: 'pointer'
    },
    animation: {
      appear: {
        animation: 'scale-in-y',
        duration: 800,
      },
    },
    interactions: [{ type: 'active-region' }]
  };

  // Table columns for applications
  const applicationColumns = [
    {
      title: 'Status',
      dataIndex: '_id',
      key: 'status',
      render: (status) => {
        const colorMap = {
          hired: 'success',
          interview: 'warning',
          pipeline: 'error'
        };
        return (
          <Tag color={colorMap[status]} style={{ textTransform: 'capitalize' }}>
            {status}
          </Tag>
        );
      }
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Text strong style={{ fontSize: '16px' }}>{count}</Text>
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (record) => {
        const percentage = ((record.count / totalApplications) * 100).toFixed(1);
        return (
          <Progress 
            percent={parseFloat(percentage)} 
            size="small" 
            strokeColor={colors.primary}
            format={(percent) => `${percent}%`}
          />
        );
      }
    }
  ];

  // Table columns for interviews
  const interviewColumns = [
    {
      title: 'Status',
      dataIndex: '_id',
      key: 'status',
      render: (status) => {
        const isCompleted = status === 'interview_completed';
        return (
          <Tag color={isCompleted ? 'success' : 'processing'}>
            {isCompleted ? 'Completed' : 'Scheduled'}
          </Tag>
        );
      }
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      render: (count) => <Text strong style={{ fontSize: '16px' }}>{count}</Text>
    },
    {
      title: 'Percentage',
      key: 'percentage',
      render: (record) => {
        const percentage = ((record.count / totalInterviews) * 100).toFixed(1);
        return (
          <Progress 
            percent={parseFloat(percentage)} 
            size="small" 
            strokeColor={colors.info}
            format={(percent) => `${percent}%`}
          />
        );
      }
    }
  ];

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Spin size="large" tip="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Dashboard"
        description="Unable to fetch dashboard data. Please try refreshing the page."
        type="error"
        showIcon
        style={{ margin: '20px' }}
        action={
          <Space>
            <Text 
              style={{ color: colors.primary, cursor: 'pointer' }} 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Text>
          </Space>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <div style={{  margin: '0 auto' }}>       

        {/* Key Metrics Cards */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: '12px', border: `2px solid ${colors.primary}20` }}>
              <Statistic
                title={<Text strong style={{ color: colors.primary }}>Total Candidates</Text>}
                value={data.candidates.total}
                prefix={<UserOutlined style={{ color: colors.primary, fontSize: '20px' }} />}
                valueStyle={{ color: colors.primary, fontSize: '32px' }}
                suffix={
                  <Space style={{ marginTop: '8px' }}>
                    <RiseOutlined style={{ color: colors.success, fontSize: '16px' }} />
                    <Text type="success" style={{ fontSize: '14px', fontWeight: '500' }}>Active Pipeline</Text>
                  </Space>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: '12px', border: `2px solid ${colors.info}20` }}>
              <Statistic
                title={<Text strong style={{ color: colors.info }}>Total Applications</Text>}
                value={totalApplications}
                prefix={<FileTextOutlined style={{ color: colors.info, fontSize: '20px' }} />}
                valueStyle={{ color: colors.info, fontSize: '32px' }}
                suffix={
                  <Text type="secondary" style={{ fontSize: '14px', marginTop: '8px' }}>
                    All Processing Stages
                  </Text>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: '12px', border: `2px solid ${colors.warning}20` }}>
              <Statistic
                title={<Text strong style={{ color: colors.warning }}>Interviews</Text>}
                value={totalInterviews}
                prefix={<CalendarOutlined style={{ color: colors.warning, fontSize: '20px' }} />}
                valueStyle={{ color: colors.warning, fontSize: '32px' }}
                suffix={
                  <Space style={{ marginTop: '8px' }}>
                    <ClockCircleOutlined style={{ color: colors.warning, fontSize: '16px' }} />
                    <Text style={{ fontSize: '14px', color: colors.warning, fontWeight: '500' }}>
                      {completedInterviews} Completed
                    </Text>
                  </Space>
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card hoverable style={{ borderRadius: '12px', border: `2px solid ${colors.success}20` }}>
              <Statistic
                title={<Text strong style={{ color: colors.success }}>Successfully Hired</Text>}
                value={hiredCount}
                prefix={<TrophyOutlined style={{ color: colors.success, fontSize: '20px' }} />}
                valueStyle={{ color: colors.success, fontSize: '32px' }}
                suffix={
                  <Space style={{ marginTop: '8px' }}>
                    <CheckCircleOutlined style={{ color: colors.success, fontSize: '16px' }} />
                    <Text type="success" style={{ fontSize: '14px', fontWeight: '500' }}>
                      Recruitment Complete
                    </Text>
                  </Space>
                }
              />
            </Card>
          </Col>
        </Row>

        {/* Charts Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <FileTextOutlined style={{ color: colors.primary }} />
                  <Text strong style={{ fontSize: '18px' }}>Application Status Distribution</Text>
                </Space>
              }
              style={{ height: '500px', borderRadius: '12px' }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ height: '400px' }}>
                <Pie {...pieConfig} />
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <CalendarOutlined style={{ color: colors.info }} />
                  <Text strong style={{ fontSize: '18px' }}>Interview Status Overview</Text>
                </Space>
              }
              style={{ height: '500px', borderRadius: '12px' }}
              bodyStyle={{ padding: '20px' }}
            >
              <div style={{ height: '400px' }}>
                <Column {...columnConfig} />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Detailed Tables */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <FileTextOutlined style={{ color: colors.primary }} />
                  <Text strong style={{ fontSize: '18px' }}>Application Breakdown</Text>
                </Space>
              }
              style={{ borderRadius: '12px' }}
            >
              <Table
                columns={applicationColumns}
                dataSource={data.applications.byStatus}
                pagination={false}
                size="middle"
                rowKey="_id"
                style={{ marginBottom: '16px' }}
              />
              
              <Divider style={{ margin: '16px 0' }} />
              
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong style={{ fontSize: '16px' }}>Total Applications:</Text>
                </Col>
                <Col>
                  <Text strong style={{ color: colors.primary, fontSize: '20px' }}>
                    {totalApplications}
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <CalendarOutlined style={{ color: colors.info }} />
                  <Text strong style={{ fontSize: '18px' }}>Interview Details</Text>
                </Space>
              }
              style={{ borderRadius: '12px' }}
            >
              <Table
                columns={interviewColumns}
                dataSource={data.interviews}
                pagination={false}
                size="middle"
                rowKey="_id"
                style={{ marginBottom: '16px' }}
              />
              
              <Divider style={{ margin: '16px 0' }} />
              
              <Row justify="space-between" align="middle">
                <Col>
                  <Text strong style={{ fontSize: '16px' }}>Total Interviews:</Text>
                </Col>
                <Col>
                  <Text strong style={{ color: colors.info, fontSize: '20px' }}>
                    {totalInterviews}
                  </Text>
                </Col>
              </Row>
              
              <Row justify="space-between" align="middle" style={{ marginTop: '12px' }}>
                <Col>
                  <Text type="secondary" style={{ fontSize: '14px' }}>Completion Rate:</Text>
                </Col>
                <Col>
                  <Text strong style={{ color: colors.success, fontSize: '16px' }}>
                    {totalInterviews > 0 ? ((completedInterviews / totalInterviews) * 100).toFixed(1) : 0}%
                  </Text>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Enhanced Summary Footer */}
        <Card 
          style={{ 
            marginTop: '24px', 
            textAlign: 'center',
            borderRadius: '12px',
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Title level={4} style={{ marginBottom: '24px', color: colors.primary }}>
             Key Performance Indicators
          </Title>
          
          <Row gutter={[32, 16]} justify="center">
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Conversion Rate (Hired/Applications)
                </Text>
                <Text strong style={{ color: colors.success, fontSize: '24px' }}>
                  {totalApplications > 0 ? ((hiredCount / totalApplications) * 100).toFixed(1) : 0}%
                </Text>
              </div>
            </Col>
            
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Interview Success Rate
                </Text>
                <Text strong style={{ color: colors.info, fontSize: '24px' }}>
                  {totalInterviews > 0 ? ((completedInterviews / totalInterviews) * 100).toFixed(1) : 0}%
                </Text>
              </div>
            </Col>
            
            <Col xs={24} sm={8}>
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>
                  Active Candidate Pipeline
                </Text>
                <Text strong style={{ color: colors.primary, fontSize: '24px' }}>
                  {data.candidates.total} Candidates
                </Text>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterDashboard;