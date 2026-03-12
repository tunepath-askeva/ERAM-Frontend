import React from "react";
import { Card, Space, Spin, Empty, Row, Col, Typography, Tooltip } from "antd";
import Chart from "react-apexcharts";
import { BranchesOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const getSafeNumber = (value) => {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

export const BranchPerformanceColumnChart = ({ branchPerformanceData, loading, primaryColor = "#da2c46" }) => {
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!branchPerformanceData || branchPerformanceData.length === 0) {
    return <Empty description="No branch performance data available" style={{ padding: "60px 0" }} />;
  }

  const chartData = branchPerformanceData.map(branch => ({
    branch: branch.branchName || 'Unknown',
    users: getSafeNumber(branch.users),
    workOrders: getSafeNumber(branch.workOrders),
    candidates: getSafeNumber(branch.candidates),
    hired: getSafeNumber(branch.hired),
  }));

  const series = [{
    name: 'Users',
    data: chartData.map(item => item.users)
  }];

  const options = {
    chart: {
      type: 'bar',
      height: window.innerWidth < 768 ? 250 : 300,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        columnWidth: '60%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: window.innerWidth < 768 ? '10px' : '12px',
        fontWeight: 'bold',
        colors: ['#FFFFFF']
      },
      formatter: function (val) {
        return val;
      }
    },
    xaxis: {
      categories: chartData.map(item => item.branch),
      labels: {
        style: {
          fontSize: window.innerWidth < 768 ? '10px' : '12px'
        },
        rotate: -45,
        rotateAlways: false
      }
    },
    yaxis: {
      title: {
        text: 'Number of Users',
        style: {
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          fontSize: window.innerWidth < 768 ? '10px' : '12px'
        }
      }
    },
    colors: [primaryColor],
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const branch = chartData[dataPointIndex];
        return `
          <div style="padding: 12px; background: rgba(0, 0, 0, 0.85); color: #fff; border-radius: 8px; border: 1px solid ${primaryColor}40;">
            <div style="font-weight: bold; margin-bottom: 8px; color: ${primaryColor}; font-size: 14px;">
              ${branch.branch}
            </div>
            <div style="color: #fff; margin: 4px 0;">
              <span style="color: ${primaryColor};">●</span> Users: <strong style="color: ${primaryColor};">${branch.users}</strong>
            </div>
            <div style="color: #fff; margin: 4px 0;">
              <span style="color: #52c41a;">●</span> Work Orders: <strong style="color: #52c41a;">${branch.workOrders}</strong>
            </div>
            <div style="color: #fff; margin: 4px 0;">
              <span style="color: #faad14;">●</span> Candidates: <strong style="color: #faad14;">${branch.candidates}</strong>
            </div>
            <div style="color: #fff; margin: 4px 0;">
              <span style="color: #52c41a;">●</span> Hired: <strong style="color: #52c41a;">${branch.hired}</strong>
            </div>
          </div>
        `;
      }
    },
    grid: {
      borderColor: '#e7e7e7',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Chart
        options={options}
        series={series}
        type="bar"
        height={window.innerWidth < 768 ? 250 : 300}
      />
    </div>
  );
};

export const BranchPerformanceAreaChart = ({ branchPerformanceData, loading, primaryColor = "#da2c46" }) => {
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "60px 0" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!branchPerformanceData || branchPerformanceData.length === 0) {
    return <Empty description="No branch performance data available" style={{ padding: "60px 0" }} />;
  }

  const chartData = branchPerformanceData.map(branch => ({
    branch: branch.branchName || 'Unknown',
    users: getSafeNumber(branch.users),
    workOrders: getSafeNumber(branch.workOrders),
    candidates: getSafeNumber(branch.candidates),
    hired: getSafeNumber(branch.hired),
  }));

  const series = [{
    name: 'Users',
    data: chartData.map(item => item.users)
  }];

  const options = {
    chart: {
      type: 'area',
      height: window.innerWidth < 768 ? 300 : 400,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3,
      colors: [primaryColor]
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: primaryColor,
            opacity: 1
          },
          {
            offset: 100,
            color: primaryColor,
            opacity: 0.3
          }
        ]
      }
    },
    xaxis: {
      categories: chartData.map(item => item.branch),
      labels: {
        style: {
          fontSize: window.innerWidth < 768 ? '10px' : '12px'
        },
        rotate: -45,
        rotateAlways: false
      }
    },
    yaxis: {
      title: {
        text: 'Number of Users',
        style: {
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          fontSize: window.innerWidth < 768 ? '10px' : '12px'
        }
      }
    },
    colors: [primaryColor],
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const branch = chartData[dataPointIndex];
        return `
          <div style="padding: 12px; background: rgba(0, 0, 0, 0.85); color: #fff; border-radius: 8px; border: 1px solid ${primaryColor}40;">
            <div style="font-weight: bold; margin-bottom: 8px; color: ${primaryColor}; font-size: 14px;">
              ${branch.branch}
            </div>
            <div style="color: #fff; margin: 4px 0;">
              <span style="color: ${primaryColor};">●</span> Users: <strong style="color: ${primaryColor};">${branch.users}</strong>
            </div>
            <div style="color: #fff; margin: 4px 0;">
              <span style="color: #52c41a;">●</span> Work Orders: <strong style="color: #52c41a;">${branch.workOrders}</strong>
            </div>
            <div style="color: #fff; margin: 4px 0;">
              <span style="color: #faad14;">●</span> Candidates: <strong style="color: #faad14;">${branch.candidates}</strong>
            </div>
            <div style="color: #fff; margin: 4px 0;">
              <span style="color: #52c41a;">●</span> Hired: <strong style="color: #52c41a;">${branch.hired}</strong>
            </div>
          </div>
        `;
      }
    },
    grid: {
      borderColor: '#e7e7e7',
      strokeDashArray: 4
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <Chart
        options={options}
        series={series}
        type="area"
        height={window.innerWidth < 768 ? 300 : 400}
      />
    </div>
  );
};

export const BranchPerformanceSection = ({ 
  branchPerformanceData, 
  loading, 
  primaryColor = "#da2c46" 
}) => {
  if (!branchPerformanceData || branchPerformanceData.length === 0) return null;

  // Calculate totals for summary
  const totals = branchPerformanceData.reduce((acc, branch) => {
    acc.users += getSafeNumber(branch.users);
    acc.workOrders += getSafeNumber(branch.workOrders);
    acc.candidates += getSafeNumber(branch.candidates);
    acc.hired += getSafeNumber(branch.hired);
    return acc;
  }, { users: 0, workOrders: 0, candidates: 0, hired: 0 });

  const graphInfoTooltip = (
    <div style={{ maxWidth: "300px" }}>
      <div style={{ marginBottom: "8px", fontWeight: "600" }}>Branch Performance Graph</div>
      <div style={{ fontSize: "12px", lineHeight: "1.6" }}>
        This graph displays the <strong>number of users</strong> per branch as the primary metric. 
        The height of each bar represents the total user count for that branch.
        <br /><br />
        <strong>Hover over a bar</strong> to see detailed metrics including:
        <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
          <li>Total Users</li>
          <li>Work Orders</li>
          <li>Candidates</li>
          <li>Hired Candidates</li>
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: "16px", marginTop: "24px" }}>
        <h4
          style={{
            color: primaryColor,
            marginBottom: "8px",
            fontSize: "clamp(18px, 2.5vw, 22px)",
            fontWeight: "700",
          }}
        >
          Branch Performance
        </h4>
      </div>
      
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <div style={{ fontSize: "24px", fontWeight: "700", color: primaryColor, marginBottom: "4px" }}>
              {totals.users}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>Total Users</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#52c41a", marginBottom: "4px" }}>
              {totals.workOrders}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>Work Orders</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#faad14", marginBottom: "4px" }}>
              {totals.candidates}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>Candidates</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
            bodyStyle={{ padding: "16px" }}
          >
            <div style={{ fontSize: "24px", fontWeight: "700", color: "#52c41a", marginBottom: "4px" }}>
              {totals.hired}
            </div>
            <div style={{ fontSize: "14px", color: "#666" }}>Hired</div>
          </Card>
        </Col>
      </Row>

      {/* Graph Card */}
      <div style={{ marginBottom: "24px" }}>
        <Card
          title={
            <Space>
              <BranchesOutlined style={{ color: primaryColor }} />
              <span style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: "600" }}>
                Branch Performance Overview
              </span>
              <Tooltip title={graphInfoTooltip} placement="topRight">
                <InfoCircleOutlined 
                  style={{ 
                    color: primaryColor, 
                    cursor: "help",
                    fontSize: "16px",
                    marginLeft: "8px"
                  }} 
                />
              </Tooltip>
            </Space>
          }
          style={{
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
          headStyle={{
            borderBottom: `2px solid ${primaryColor}20`,
            borderRadius: "16px 16px 0 0",
          }}
        >
          <BranchPerformanceColumnChart
            branchPerformanceData={branchPerformanceData}
            loading={loading}
            primaryColor={primaryColor}
          />
        </Card>
      </div>
    </>
  );
};

export default BranchPerformanceSection;

