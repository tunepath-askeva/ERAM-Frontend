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
  Badge,
  Tabs,
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
  BarChartOutlined,
  PieChartOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

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

  // Color palette
  const colors = {
    primary: "#da2c46",
    success: "#52c41a",
    warning: "#faad14",
    info: "#1890ff",
    error: "#ff4d4f",
    purple: "#722ed1",
    cyan: "#13c2c2",
  };

  // Status color mapping based on your enum
  const getStatusColor = (status) => {
    const statusColors = {
      applied: "#1890ff",
      sourced: "#13c2c2",
      hired: "#52c41a",
      rejected: "#ff4d4f",
      screening: "#faad14",
      selected: "#722ed1",
      pipeline: "#da2c46",
      approved: "#52c41a",
      completed: "#52c41a",
      interview: "#faad14",
      offer: "#722ed1",
      offer_pending: "#faad14",
      offer_revised: "#ff7a45",
      "in-pending": "#faad14",
    };
    return statusColors[status] || "#666666";
  };

  // Process data for work order table
  const processWorkOrderData = (filteredData = null) => {
    const sourceData = filteredData || data?.results;
    if (!sourceData || sourceData.length === 0) return [];

    return sourceData.map((workOrder, index) => {
      // Initialize all status counts
      const statusCounts = {
        total: 0,
        sourced: 0,
        selected: 0,
        applied: 0,
        declined: 0,
        pending: 0,
        screening: 0,
        pipeline: 0,
        interview: 0,
        offer: 0,
        completed: 0,
        approvals: 0,
      };

      // Process statuses from API data
      if (workOrder.statuses && Array.isArray(workOrder.statuses)) {
        workOrder.statuses.forEach((statusGroup) => {
          const count = statusGroup.totalCandidates || 0;
          const status = statusGroup.status?.toLowerCase();

          statusCounts.total += count;

          // Map API statuses to table columns
          switch (status) {
            case "sourced":
              statusCounts.sourced = count;
              break;
            case "selected":
              statusCounts.selected = count;
              break;
            case "applied":
              statusCounts.applied = count;
              break;
            case "rejected":
              statusCounts.declined = count;
              break;
            case "in-pending":
            case "offer_pending":
              statusCounts.pending = count;
              break;
            case "screening":
              statusCounts.screening = count;
              break;
            case "pipeline":
              statusCounts.pipeline = count;
              break;
            case "interview":
              statusCounts.interview = count;
              break;
            case "offer":
              statusCounts.offer = count;
              break;
            case "completed":
            case "hired":
              statusCounts.completed = count;
              break;
            case "approved":
              statusCounts.approvals = count;
              break;
            default:
              break;
          }
        });
      }

      return {
        key: `wo-${index}`,
        workOrder: workOrder.workOrderTitle || `WO-${index + 1}`,
        ...statusCounts,
        rawData: workOrder,
      };
    });
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

  // Get filtered data
  const getFilteredData = useMemo(() => {
    if (!data?.results) return null;

    let filtered = [...data.results];

    if (filters.workOrder) {
      filtered = filtered.filter(
        (wo) => wo.workOrderTitle === filters.workOrder
      );
    }

    if (filters.searchTerm) {
      filtered = filtered.filter((wo) =>
        wo.workOrderTitle
          ?.toLowerCase()
          .includes(filters.searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [data, filters.workOrder, filters.searchTerm]);

  const workOrderData = processWorkOrderData(getFilteredData);
  const analytics = processAnalytics(getFilteredData);

  // Calculate totals for work order table
  const totals = useMemo(() => {
    if (workOrderData.length === 0) return {};

    return workOrderData.reduce((acc, row) => {
      acc.total = (acc.total || 0) + row.total;
      acc.sourced = (acc.sourced || 0) + row.sourced;
      acc.selected = (acc.selected || 0) + row.selected;
      acc.applied = (acc.applied || 0) + row.applied;
      acc.declined = (acc.declined || 0) + row.declined;
      acc.pending = (acc.pending || 0) + row.pending;
      acc.screening = (acc.screening || 0) + row.screening;
      acc.pipeline = (acc.pipeline || 0) + row.pipeline;
      acc.interview = (acc.interview || 0) + row.interview;
      acc.offer = (acc.offer || 0) + row.offer;
      acc.completed = (acc.completed || 0) + row.completed;
      return acc;
    }, {});
  }, [workOrderData]);

  // Filter functions
  const getWorkOrderOptions = () => {
    if (!data?.results) return [];
    return data.results.map((wo) => ({
      value: wo.workOrderTitle,
      label: wo.workOrderTitle,
    }));
  };

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

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.workOrder) count++;
    if (filters.status.length > 0) count++;
    if (filters.searchTerm) count++;
    return count;
  };

  const handleExportExcel = () => {
    if (!workOrderData || workOrderData.length === 0) return;

    // Prepare data for Excel
    const exportData = workOrderData.map((row) => ({
      "Work Order": row.rawData?.workOrderTitle || "Untitled",
      "Job Code": row.rawData?.jobCode || "N/A",
      "Requisition No": row.rawData?.requisitionNo || "N/A",
      "Reference No": row.rawData?.referenceNo || "N/A",
      "Total Candidates": row.total,
      Sourced: row.sourced,
      Selected: row.selected,
      Applied: row.applied,
      Declined: row.declined,
      Pending: row.pending,
      Screening: row.screening,
      Pipeline: row.pipeline,
      Interview: row.interview,
      Offer: row.offer || 0,
      Completed: row.completed,
    }));

    // Add totals row
    exportData.push({
      "Work Order": "TOTAL",
      "Job Code": "",
      "Requisition No": "",
      "Reference No": "",
      "Total Candidates": totals.total || 0,
      Sourced: totals.sourced || 0,
      Selected: totals.selected || 0,
      Applied: totals.applied || 0,
      Declined: totals.declined || 0,
      Pending: totals.pending || 0,
      Screening: totals.screening || 0,
      Pipeline: totals.pipeline || 0,
      Interview: totals.interview || 0,
      Offer: totals.offer || 0,
      Completed: totals.completed || 0,
    });

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WorkOrders");

    // Trigger download
    XLSX.writeFile(workbook, "WorkOrder status.xlsx");
  };

  // Chart data preparation
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

  // Chart configurations
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
        Completed: colors.success,
        Applied: colors.info,
        Sourced: colors.cyan,
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

  // Work Orders Table columns
  const workOrderColumns = [
    {
      title: "WorkOrder",
      dataIndex: "workOrder", // this is the flattened title
      key: "workOrder",
      fixed: "left",
      width: 220,
      render: (text, record) => {
        const wo = record.rawData || {};
        return (
          <div>
            <Text strong style={{ color: colors.primary }}>
              {wo.workOrderTitle || "Untitled"}
            </Text>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {wo.jobCode && (
                <div>
                  Job Code: <Text code>{wo.jobCode}</Text>
                </div>
              )}
              {wo.requisitionNo && (
                <div>
                  Req No: <Text code>{wo.requisitionNo}</Text>
                </div>
              )}
              {wo.referenceNo && (
                <div>
                  Ref No: <Text code>{wo.referenceNo}</Text>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: "Total Candidates",
      dataIndex: "total",
      key: "total",
      width: 130,
      align: "center",
      render: (count) => (
        <Tag color="blue" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Sourced Candidates",
      dataIndex: "sourced",
      key: "sourced",
      width: 140,
      align: "center",
      render: (count) => (
        <Tag color="cyan" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Selected Candidates",
      dataIndex: "selected",
      key: "selected",
      width: 140,
      align: "center",
      render: (count) => (
        <Tag color="purple" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Applied Candidates",
      dataIndex: "applied",
      key: "applied",
      width: 140,
      align: "center",
      render: (count) => (
        <Tag color="blue" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Declined Candidates",
      dataIndex: "declined",
      key: "declined",
      width: 140,
      align: "center",
      render: (count) => (
        <Tag color="red" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Pending Candidates",
      dataIndex: "pending",
      key: "pending",
      width: 140,
      align: "center",
      render: (count) => (
        <Tag color="orange" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Screening Candidates",
      dataIndex: "screening",
      key: "screening",
      width: 150,
      align: "center",
      render: (count) => (
        <Tag color="gold" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Pipeline Staged Candidates",
      dataIndex: "pipeline",
      key: "pipeline",
      width: 180,
      align: "center",
      render: (count) => (
        <Tag color="red" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Interview Candidates",
      dataIndex: "interview",
      key: "interview",
      width: 150,
      align: "center",
      render: (count) => (
        <Tag color="orange" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Offer Candidates",
      dataIndex: "offer",
      key: "offer",
      width: 150,
      align: "center",
      render: (count) => (
        <Tag color="purple" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
    {
      title: "Completed Candidates",
      dataIndex: "completed",
      key: "completed",
      width: 150,
      align: "center",
      render: (count) => (
        <Tag color="green" style={{ minWidth: "40px", textAlign: "center" }}>
          {count}
        </Tag>
      ),
    },
  ];

  // Analytics table columns for work order summary
  const analyticsColumns = [
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
          completed: "success",
          applied: "blue",
          sourced: "cyan",
          rejected: "red",
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

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
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
      {/* Header */}
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
          Comprehensive Job Analytics
        </Title>

        <Space>
          <Badge count={getActiveFilterCount()} offset={[-5, 5]}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={toggleFilters}
              style={{
                backgroundColor: "#da2c46",
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
        <Col xs={24} sm={6}>
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
              valueStyle={{ color: colors.primary, fontSize: "24px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
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
              valueStyle={{ color: colors.info, fontSize: "24px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
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
                  Hired/Completed
                </Text>
              }
              value={
                (analytics.statusBreakdown.hired || 0) +
                (analytics.statusBreakdown.completed || 0)
              }
              prefix={
                <TrophyOutlined
                  style={{ color: colors.success, fontSize: "20px" }}
                />
              }
              valueStyle={{ color: colors.success, fontSize: "24px" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card
            hoverable
            style={{
              borderRadius: "12px",
              border: `2px solid ${colors.warning}20`,
            }}
          >
            <Statistic
              title={
                <Text strong style={{ color: colors.warning }}>
                  Success Rate
                </Text>
              }
              value={
                analytics.totalCandidates > 0
                  ? (
                      (((analytics.statusBreakdown.hired || 0) +
                        (analytics.statusBreakdown.completed || 0)) /
                        analytics.totalCandidates) *
                      100
                    ).toFixed(1)
                  : 0
              }
              suffix="%"
              prefix={
                <TrophyOutlined
                  style={{ color: colors.warning, fontSize: "20px" }}
                />
              }
              valueStyle={{ color: colors.warning, fontSize: "24px" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content with Tabs */}
      <Tabs defaultActiveKey="1" size="large">
        <TabPane
          tab={
            <span>
              <TableOutlined />
              Work Order Breakdown
            </span>
          }
          key="1"
        >
          <Card
            title={
              <Space>
                <FileExcelOutlined style={{ color: colors.primary }} />
                <Text strong>Detailed Work Order Status Breakdown</Text>
              </Space>
            }
            extra={
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                style={{
                  backgroundColor: "#da2c46",
                  color: "#fff",
                  borderRadius: "6px",
                }}
              >
                Export to Excel
              </Button>
            }
            style={{ borderRadius: "12px" }}
          >
            <Table
              columns={workOrderColumns}
              dataSource={workOrderData}
              scroll={{ x: 1500 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} work orders`,
              }}
              size="middle"
              bordered
              summary={() => (
                <Table.Summary.Row style={{ backgroundColor: "#fafafa" }}>
                  <Table.Summary.Cell index={0}>
                    <Text strong style={{ color: colors.primary }}>
                      TOTAL
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    <Tag
                      color="blue"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.total || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="center">
                    <Tag
                      color="cyan"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.sourced || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="center">
                    <Tag
                      color="purple"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.selected || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="center">
                    <Tag
                      color="blue"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.applied || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="center">
                    <Tag
                      color="red"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.declined || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="center">
                    <Tag
                      color="orange"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.pending || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} align="center">
                    <Tag
                      color="gold"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.screening || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={8} align="center">
                    <Tag
                      color="red"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.pipeline || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={9} align="center">
                    <Tag
                      color="orange"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.interview || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={9} align="center">
                    <Tag
                      color="purple"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.offer || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={10} align="center">
                    <Tag
                      color="green"
                      style={{ minWidth: "40px", textAlign: "center" }}
                    >
                      <strong>{totals.completed || 0}</strong>
                    </Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        </TabPane>

        <TabPane
          tab={
            <span>
              <BarChartOutlined />
              Analytics & Charts
            </span>
          }
          key="2"
        >
          {/* Charts Section */}
          <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
            <Col xs={24} lg={24}>
              <Card
                title={
                  <Space>
                    <BarChartOutlined style={{ color: colors.primary }} />
                    <Text strong>Work Orders by Candidate Count</Text>
                  </Space>
                }
                style={{ borderRadius: "12px" }}
              >
                {getWorkOrderChartData().length > 0 ? (
                  <Column {...workOrderColumnConfig} />
                ) : (
                  <Empty description="No work order data available" />
                )}
              </Card>
            </Col>
          </Row>

          {/* Work Order Summary Table */}
          {analytics.workOrderStats.length > 0 && (
            <Card
              title={
                <Space>
                  <FileExcelOutlined style={{ color: colors.primary }} />
                  <Text strong>Work Order Analytics Summary</Text>
                </Space>
              }
              style={{ marginBottom: "32px", borderRadius: "12px" }}
            >
              <Table
                columns={analyticsColumns}
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

          {/* Status Breakdown Cards */}
          {Object.keys(analytics.statusBreakdown).length > 0 && (
            <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
              {Object.entries(analytics.statusBreakdown).map(
                ([status, count]) => {
                  const percentage =
                    analytics.totalCandidates > 0
                      ? ((count / analytics.totalCandidates) * 100).toFixed(1)
                      : 0;
                  const colorMap = {
                    selected: colors.success,
                    pipeline: colors.primary,
                    interview: colors.warning,
                    hired: colors.purple,
                    completed: colors.success,
                    applied: colors.info,
                    sourced: colors.cyan,
                    rejected: colors.error,
                    screening: colors.warning,
                    approved: colors.success,
                    "in-pending": colors.warning,
                    offer_pending: colors.warning,
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
                          {status.replace("_", " ")}
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
                }
              )}
            </Row>
          )}
        </TabPane>

        <TabPane
          tab={
            <span>
              <UserOutlined />
              Candidate Details
            </span>
          }
          key="3"
        >
          {/* Detailed Candidate List */}
          {getAllCandidates().length > 0 && (
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: colors.info }} />
                  <Text strong>All Candidates Details</Text>
                </Space>
              }
              style={{ borderRadius: "12px" }}
            >
              <Table
                columns={getCandidateColumns()}
                dataSource={getAllCandidates()}
                pagination={{
                  pageSize: 15,
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
        </TabPane>

        <TabPane
          tab={
            <span>
              <EyeOutlined />
              Summary Report
            </span>
          }
          key="4"
        >
          {/* Summary Report */}
          <Card
            style={{
              textAlign: "center",
              borderRadius: "12px",
            }}
            bodyStyle={{ padding: "32px" }}
          >
            <Title
              level={3}
              style={{ marginBottom: "24px", color: colors.primary }}
            >
              <TrophyOutlined style={{ marginRight: "12px" }} />
              Job Analytics Summary Report
            </Title>

            <Row
              gutter={[32, 24]}
              justify="center"
              style={{ marginBottom: "32px" }}
            >
              <Col xs={24} sm={8}>
                <Statistic
                  title={
                    <Text
                      strong
                      style={{ color: colors.primary, fontSize: "16px" }}
                    >
                      Total Work Orders
                    </Text>
                  }
                  value={analytics.totalWorkOrders}
                  valueStyle={{ color: colors.primary, fontSize: "36px" }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={
                    <Text
                      strong
                      style={{ color: colors.info, fontSize: "16px" }}
                    >
                      Total Candidates
                    </Text>
                  }
                  value={analytics.totalCandidates}
                  valueStyle={{ color: colors.info, fontSize: "36px" }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic
                  title={
                    <Text
                      strong
                      style={{ color: colors.success, fontSize: "16px" }}
                    >
                      Hiring Success Rate
                    </Text>
                  }
                  value={
                    analytics.totalCandidates > 0
                      ? (
                          (((analytics.statusBreakdown.hired || 0) +
                            (analytics.statusBreakdown.completed || 0)) /
                            analytics.totalCandidates) *
                          100
                        ).toFixed(1)
                      : 0
                  }
                  suffix="%"
                  valueStyle={{ color: colors.success, fontSize: "36px" }}
                />
              </Col>
            </Row>

            <Divider />

            {/* Top Performing Work Orders */}
            <Title
              level={4}
              style={{ color: colors.primary, marginBottom: "16px" }}
            >
              Top Performing Work Orders
            </Title>
            <Row gutter={[16, 16]} justify="center">
              {analytics.workOrderStats
                .sort((a, b) => b.total - a.total)
                .slice(0, 3)
                .map((wo, index) => (
                  <Col xs={24} sm={8} key={wo.title}>
                    <Card
                      size="small"
                      style={{
                        borderRadius: "8px",
                        border: `2px solid ${
                          index === 0
                            ? colors.success
                            : index === 1
                            ? colors.warning
                            : colors.info
                        }20`,
                      }}
                    >
                      <Space direction="vertical" align="center">
                        <Badge
                          count={index + 1}
                          style={{
                            backgroundColor:
                              index === 0
                                ? colors.success
                                : index === 1
                                ? colors.warning
                                : colors.info,
                          }}
                        />
                        <Text strong style={{ color: colors.primary }}>
                          {wo.title.length > 20
                            ? wo.title.substring(0, 20) + "..."
                            : wo.title}
                        </Text>
                        <Text style={{ fontSize: "20px", fontWeight: "bold" }}>
                          {wo.total} candidates
                        </Text>
                      </Space>
                    </Card>
                  </Col>
                ))}
            </Row>

            <Divider />

            {/* Key Metrics */}
            <Title
              level={4}
              style={{ color: colors.primary, marginBottom: "16px" }}
            >
              Key Performance Indicators
            </Title>
            <Row gutter={[24, 16]} justify="center">
              <Col xs={12} sm={6}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "14px" }}
                >
                  Average Candidates per WO
                </Text>
                <Text strong style={{ color: colors.info, fontSize: "18px" }}>
                  {analytics.totalWorkOrders > 0
                    ? Math.round(
                        analytics.totalCandidates / analytics.totalWorkOrders
                      )
                    : 0}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "14px" }}
                >
                  Most Common Status
                </Text>
                <Text
                  strong
                  style={{ color: colors.warning, fontSize: "18px" }}
                >
                  {Object.entries(analytics.statusBreakdown)
                    .sort(([, a], [, b]) => b - a)[0]?.[0]
                    ?.charAt(0)
                    .toUpperCase() +
                    Object.entries(analytics.statusBreakdown)
                      .sort(([, a], [, b]) => b - a)[0]?.[0]
                      ?.slice(1) || "N/A"}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "14px" }}
                >
                  Pipeline Conversion
                </Text>
                <Text strong style={{ color: colors.purple, fontSize: "18px" }}>
                  {analytics.statusBreakdown.pipeline > 0 &&
                  analytics.statusBreakdown.hired > 0
                    ? (
                        (analytics.statusBreakdown.hired /
                          analytics.statusBreakdown.pipeline) *
                        100
                      ).toFixed(1) + "%"
                    : "N/A"}
                </Text>
              </Col>
              <Col xs={12} sm={6}>
                <Text
                  type="secondary"
                  style={{ display: "block", fontSize: "14px" }}
                >
                  Interview Success Rate
                </Text>
                <Text strong style={{ color: colors.cyan, fontSize: "18px" }}>
                  {analytics.statusBreakdown.interview > 0 &&
                  (analytics.statusBreakdown.hired ||
                    analytics.statusBreakdown.completed)
                    ? (
                        (((analytics.statusBreakdown.hired || 0) +
                          (analytics.statusBreakdown.completed || 0)) /
                          analytics.statusBreakdown.interview) *
                        100
                      ).toFixed(1) + "%"
                    : "N/A"}
                </Text>
              </Col>
            </Row>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default RecruiterMoreJobDetails;
