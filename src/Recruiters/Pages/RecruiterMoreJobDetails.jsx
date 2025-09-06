import React, { useState, useMemo } from "react";
import { useGetAllJobStageDetailsQuery } from "../../Slices/Recruiter/RecruiterApis";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Typography,
  Space,
  Statistic,
  Progress,
  Empty,
  Spin,
  Alert,
  Divider,
  Button,
  Select,
  Input,
  DatePicker,
  Checkbox,
  Form,
  Badge,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
  PhoneOutlined,
  FileExcelOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
  ClearOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const RecruiterMoreJobDetails = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAllJobStageDetailsQuery();

  // Filter states
  const [filters, setFilters] = useState({
    workOrder: null,
    status: [],
    searchTerm: "",
    showFilters: false,
  });

  // Color palette matching the dashboard
  const colors = {
    primary: "#da2c46",
    success: "#52c41a",
    warning: "#faad14",
    info: "#1890ff",
    error: "#ff4d4f",
    purple: "#722ed1",
    cyan: "#13c2c2",
  };

  // Process data for analytics with filters
  const processAnalytics = (filteredData = null) => {
    const sourceData = filteredData || data?.results;
    if (!sourceData || sourceData.length === 0) return null;

    const analytics = {
      totalWorkOrders: sourceData.length,
      totalCandidates: 0,
      statusBreakdown: {},
      workOrderStats: [],
    };

    sourceData.forEach((workOrder) => {
      let workOrderTotal = 0;
      const workOrderStatuses = {};

      if (workOrder.statuses && Array.isArray(workOrder.statuses)) {
        workOrder.statuses.forEach((statusGroup) => {
          // Filter by status if specified
          if (
            filters.status.length > 0 &&
            !filters.status.includes(statusGroup.status)
          ) {
            return;
          }

          const count = statusGroup.totalCandidates || 0;
          workOrderTotal += count;
          analytics.totalCandidates += count;

          // Global status breakdown
          if (analytics.statusBreakdown[statusGroup.status]) {
            analytics.statusBreakdown[statusGroup.status] += count;
          } else {
            analytics.statusBreakdown[statusGroup.status] = count;
          }

          // Work order specific breakdown
          workOrderStatuses[statusGroup.status] = count;
        });
      }

      if (workOrderTotal > 0) {
        analytics.workOrderStats.push({
          title: workOrder.workOrderTitle || "Untitled Work Order",
          total: workOrderTotal,
          statuses: workOrderStatuses,
          statusDetails: workOrder.statuses || [],
        });
      }
    });

    return analytics;
  };

  // Get filtered data based on current filters
  const getFilteredData = useMemo(() => {
    if (!data?.results) return null;

    let filtered = [...data.results];

    // Filter by work order
    if (filters.workOrder) {
      filtered = filtered.filter(
        (wo) => wo.workOrderTitle === filters.workOrder
      );
    }

    // Filter by search term
    if (filters.searchTerm) {
      filtered = filtered.filter((wo) =>
        wo.workOrderTitle
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [data, filters.workOrder, filters.searchTerm]);

  const analytics = processAnalytics(getFilteredData);

  // Get available work orders for filter dropdown
  const getWorkOrderOptions = () => {
    if (!data?.results) return [];
    return data.results.map((wo) => ({
      value: wo.workOrderTitle,
      label: wo.workOrderTitle,
    }));
  };

  // Get available statuses for filter
  const getStatusOptions = () => {
    if (!data?.results) return [];
    const statuses = new Set();
    data.results.forEach((wo) => {
      if (wo.statuses) {
        wo.statuses.forEach((status) => {
          statuses.add(status.status);
        });
      }
    });
    return Array.from(statuses).map((status) => ({
      value: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
    }));
  };

  // Handle filter changes
  const handleWorkOrderChange = (value) => {
    setFilters((prev) => ({ ...prev, workOrder: value }));
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, searchTerm: e.target.value }));
  };

  const clearAllFilters = () => {
    setFilters({
      workOrder: null,
      status: [],
      searchTerm: "",
      showFilters: filters.showFilters,
    });
  };

  const toggleFilters = () => {
    setFilters((prev) => ({ ...prev, showFilters: !prev.showFilters }));
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.workOrder) count++;
    if (filters.status.length > 0) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  // Prepare chart data with filtered results
  const getStatusChartData = () => {
    if (!analytics || Object.keys(analytics.statusBreakdown).length === 0)
      return [];
    return Object.entries(analytics.statusBreakdown).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      type: status,
    }));
  };

  const getWorkOrderChartData = () => {
    if (!analytics || analytics.workOrderStats.length === 0) return [];
    return analytics.workOrderStats.map((wo) => ({
      workOrder:
        wo.title.length > 15 ? wo.title.substring(0, 15) + "..." : wo.title,
      fullTitle: wo.title,
      count: wo.total,
    }));
  };

  // Chart configurations (same as before)
  const statusPieConfig = {
    data: getStatusChartData(),
    angleField: "count",
    colorField: "status",
    radius: 0.8,
    innerRadius: 0.4,
    label: {
      type: "outer",
      content: "{name}: {value}",
      style: { fontSize: 12 },
    },
    color: (datum) => {
      const colorMap = {
        Selected: colors.success,
        Pipeline: colors.primary,
        Interview: colors.warning,
        Hired: colors.purple,
      };
      return colorMap[datum.status] || colors.info;
    },
    legend: {
      position: "bottom",
      itemName: { style: { fontSize: 12 } },
    },
    animation: {
      appear: {
        animation: "path-in",
        duration: 1000,
      },
    },
  };

  const workOrderColumnConfig = {
    data: getWorkOrderChartData(),
    xField: "workOrder",
    yField: "count",
    columnWidthRatio: 0.6,
    color: colors.primary,
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.9,
        fontSize: 14,
        fontWeight: "bold",
      },
    },
    tooltip: {
      formatter: (datum) => ({
        name: datum.fullTitle,
        value: `${datum.count} candidates`,
      }),
    },
    columnStyle: {
      radius: [6, 6, 0, 0],
    },
    animation: {
      appear: {
        animation: "scale-in-y",
        duration: 800,
      },
    },
  };

  // Table columns for detailed view
  const workOrderColumns = [
    {
      title: "Work Order",
      dataIndex: "title",
      key: "title",
      render: (title) => (
        <Text strong style={{ color: colors.primary }}>
          {title}
        </Text>
      ),
    },
    {
      title: "Total Candidates",
      dataIndex: "total",
      key: "total",
      render: (total) => (
        <Tag color="blue" style={{ fontSize: "14px", padding: "4px 8px" }}>
          {total}
        </Tag>
      ),
    },
    {
      title: "Status Distribution",
      key: "statuses",
      render: (record) => (
        <Space size="small" wrap>
          {Object.entries(record.statuses).map(([status, count]) => {
            const colorMap = {
              selected: "success",
              pipeline: "error",
              interview: "warning",
              hired: "purple",
            };
            return (
              <Tag
                key={status}
                color={colorMap[status]}
                style={{ margin: "2px" }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}: {count}
              </Tag>
            );
          })}
        </Space>
      ),
    },
  ];

  // Candidate details table
  const getCandidateColumns = () => [
    {
      title: "Candidate Name",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <Space>
          <UserOutlined style={{ color: colors.info }} />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => (
        <Space>
          <PhoneOutlined style={{ color: colors.info }} />
          <Text copyable>{phone}</Text>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colorMap = {
          selected: "success",
          pipeline: "error",
          interview: "warning",
          hired: "purple",
        };
        return (
          <Tag color={colorMap[status]} style={{ textTransform: "capitalize" }}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Work Order",
      dataIndex: "workOrder",
      key: "workOrder",
      render: (workOrder) => (
        <Text style={{ color: colors.primary }}>{workOrder}</Text>
      ),
    },
  ];

  // Flatten candidates for detailed table with filters
  const getAllCandidates = () => {
    if (!getFilteredData) return [];
    const candidates = [];

    getFilteredData.forEach((workOrder) => {
      if (workOrder.statuses && Array.isArray(workOrder.statuses)) {
        workOrder.statuses.forEach((statusGroup) => {
          // Filter by status if specified
          if (
            filters.status.length > 0 &&
            !filters.status.includes(statusGroup.status)
          ) {
            return;
          }

          if (statusGroup.candidates && Array.isArray(statusGroup.candidates)) {
            statusGroup.candidates.forEach((candidate) => {
              candidates.push({
                ...candidate,
                status: statusGroup.status,
                workOrder: workOrder.workOrderTitle,
                key: `${candidate.phone}_${statusGroup.status}_${workOrder.workOrderTitle}`,
              });
            });
          }
        });
      }
    });

    return candidates;
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <Spin size="large" tip="Loading job details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px" }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: "16px", color: colors.primary }}
        >
          Back to Dashboard
        </Button>
        <Alert
          message="Error Loading Job Details"
          description={`Unable to fetch job stage details: ${
            error.message || "Unknown error"
          }. Please try refreshing the page.`}
          type="error"
          showIcon
          action={
            <Space>
              <Button type="primary" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  if (!data?.results || data.results.length === 0) {
    return (
      <div style={{ padding: "24px" }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: "16px", color: colors.primary }}
        >
          Back to Dashboard
        </Button>
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <Empty
            description="No job details available"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ padding: "24px" }}>
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginBottom: "16px", color: colors.primary }}
        >
          Back to Dashboard
        </Button>
        <Alert
          message="No Data Available"
          description="No job analytics data could be processed from the available information."
          type="info"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      {/* Header with Back Button */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          type="link"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{
            color: colors.primary,
            fontSize: "16px",
            fontWeight: "500",
            padding: "0",
          }}
        >
          Back to Dashboard
        </Button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Title level={2} style={{ marginBottom: "0", color: colors.primary }}>
          <FileExcelOutlined style={{ marginRight: "12px" }} />
          Detailed Job Analytics
        </Title>

        <Space>
          <Badge count={getActiveFilterCount()} offset={[-5, 5]}>
            <Button
              type="primary" 
              icon={<FilterOutlined />}
              onClick={toggleFilters}
              style={{
                backgroundColor:  "#da2c46" ,
              }}
            >
              Filters
            </Button>
          </Badge>
          {getActiveFilterCount() > 0 && (
            <Button icon={<ClearOutlined />} onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </Space>
      </div>

      {/* Filters Panel */}
      {filters.showFilters && (
        <Card
          style={{ marginBottom: "24px", borderRadius: "12px" }}
          title={
            <Space>
              <FilterOutlined style={{ color: colors.primary }} />
              <Text strong>Filters</Text>
            </Space>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Work Order
              </Text>
              <Select
                style={{ width: "100%" }}
                placeholder="Select work order"
                value={filters.workOrder}
                onChange={handleWorkOrderChange}
                allowClear
              >
                {getWorkOrderOptions().map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={8}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Status
              </Text>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select statuses"
                value={filters.status}
                onChange={handleStatusChange}
                allowClear
              >
                {getStatusOptions().map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={8}>
              <Text strong style={{ display: "block", marginBottom: "8px" }}>
                Search Work Orders
              </Text>
              <Input
                placeholder="Search by work order name"
                value={filters.searchTerm}
                onChange={handleSearchChange}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* Summary Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{
              borderRadius: "12px",
              border: `2px solid ${colors.primary}20`,
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: colors.primary }}>
                  Total Work Orders
                </Text>
              }
              value={analytics.totalWorkOrders}
              prefix={
                <FileExcelOutlined
                  style={{ color: colors.primary, fontSize: "20px" }}
                />
              }
              valueStyle={{ color: colors.primary, fontSize: "32px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{
              borderRadius: "12px",
              border: `2px solid ${colors.info}20`,
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: colors.info }}>
                  Total Candidates
                </Text>
              }
              value={analytics.totalCandidates}
              prefix={
                <TeamOutlined
                  style={{ color: colors.info, fontSize: "20px" }}
                />
              }
              valueStyle={{ color: colors.info, fontSize: "32px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            hoverable
            style={{
              borderRadius: "12px",
              border: `2px solid ${colors.success}20`,
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: colors.success }}>
                  Hired Candidates
                </Text>
              }
              value={analytics.statusBreakdown.hired || 0}
              prefix={
                <TrophyOutlined
                  style={{ color: colors.success, fontSize: "20px" }}
                />
              }
              valueStyle={{ color: colors.success, fontSize: "32px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Section - Only render if data exists */}
      {getStatusChartData().length > 0 && (
        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          <Col xs={24} lg={24}>
            <Card
              title={
                <Space>
                  <FileExcelOutlined style={{ color: colors.primary }} />
                  <Text strong>Candidates per Work Order</Text>
                </Space>
              }
              style={{ height: "400px", borderRadius: "12px" }}
            >
              <div style={{ height: "300px" }}>
                {getWorkOrderChartData().length > 0 && (
                  <Column {...workOrderColumnConfig} />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Work Order Summary Table */}
      {analytics.workOrderStats.length > 0 && (
        <Card
          title={
            <Space>
              <FileExcelOutlined style={{ color: colors.primary }} />
              <Text strong>Work Order Summary</Text>
            </Space>
          }
          style={{ marginBottom: "32px", borderRadius: "12px" }}
        >
          <Table
            columns={workOrderColumns}
            dataSource={analytics.workOrderStats}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} work orders`,
            }}
            rowKey="title"
            size="middle"
          />
        </Card>
      )}

      {/* Detailed Candidate List */}
      {getAllCandidates().length > 0 && (
        <Card
          title={
            <Space>
              <UserOutlined style={{ color: colors.info }} />
              <Text strong>All Candidates Details</Text>
            </Space>
          }
          style={{ marginBottom: "32px", borderRadius: "12px" }}
        >
          <Table
            columns={getCandidateColumns()}
            dataSource={getAllCandidates()}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} candidates`,
            }}
            rowKey="key"
            size="middle"
          />
        </Card>
      )}

      {/* Status Breakdown Cards */}
      {Object.keys(analytics.statusBreakdown).length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: "32px" }}>
          {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
            const percentage =
              analytics.totalCandidates > 0
                ? ((count / analytics.totalCandidates) * 100).toFixed(1)
                : 0;
            const colorMap = {
              selected: colors.success,
              pipeline: colors.primary,
              interview: colors.warning,
              hired: colors.purple,
            };

            return (
              <Col xs={24} sm={12} lg={6} key={status}>
                <Card
                  size="small"
                  style={{
                    textAlign: "center",
                    borderRadius: "8px",
                    border: `2px solid ${colorMap[status]}20`,
                  }}
                >
                  <Text
                    strong
                    style={{
                      display: "block",
                      fontSize: "16px",
                      color: colorMap[status],
                      textTransform: "capitalize",
                      marginBottom: "8px",
                    }}
                  >
                    {status}
                  </Text>
                  <Text
                    style={{
                      fontSize: "24px",
                      fontWeight: "bold",
                      color: colorMap[status],
                    }}
                  >
                    {count}
                  </Text>
                  <Progress
                    percent={parseFloat(percentage)}
                    size="small"
                    strokeColor={colorMap[status]}
                    showInfo={false}
                    style={{ marginTop: "8px" }}
                  />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {percentage}% of total
                  </Text>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Summary Footer */}
      <Card
        style={{
          marginTop: "32px",
          textAlign: "center",
          borderRadius: "12px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Title
          level={4}
          style={{ marginBottom: "16px", color: colors.primary }}
        >
          Job Analytics Summary
        </Title>
        <Row gutter={[32, 16]} justify="center">
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "14px" }}
            >
              Total Work Orders
            </Text>
            <Text strong style={{ color: colors.primary, fontSize: "20px" }}>
              {analytics.totalWorkOrders}
            </Text>
          </Col>
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "14px" }}
            >
              Total Candidates
            </Text>
            <Text strong style={{ color: colors.info, fontSize: "20px" }}>
              {analytics.totalCandidates}
            </Text>
          </Col>
          <Col xs={24} sm={8}>
            <Text
              type="secondary"
              style={{ display: "block", fontSize: "14px" }}
            >
              Hiring Success Rate
            </Text>
            <Text strong style={{ color: colors.success, fontSize: "20px" }}>
              {analytics.totalCandidates > 0
                ? (
                    ((analytics.statusBreakdown.hired || 0) /
                      analytics.totalCandidates) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </Text>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default RecruiterMoreJobDetails;
