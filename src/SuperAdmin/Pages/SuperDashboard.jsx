import React, { useMemo, useState, useEffect } from "react";
import { Card, Typography, Spin, Empty } from "antd";
import {
  useGetSuperDashboardDataQuery,
  useGetBranchesQuery,
  useGetBranchFilterOptionsQuery,
  useGetFilteredDashboardDataQuery,
  useGetSuperAdminChartDataQuery,
} from "../../Slices/SuperAdmin/SuperAdminApis";
import SuperDashboardFilters from "../Components/SuperDashboardFilters";
import StatisticsSection, {
  CandidateMetricsSection,
} from "../../Admin/Components/StatisticsSection";
import ActionItemsSection from "../../Admin/Components/ActionItemsSection";
import KPISection from "../../Admin/Components/KPISection";
import AchievementsSection from "../../Admin/Components/AchievementsSection";
import ChartsSection from "../../Admin/Components/DashboardCharts";
import BranchPerformanceSection from "../Components/BranchPerformanceChart";
import { handleSuperDashboardExportExcel } from "../Components/superDashboardUtils";

const { Title, Text } = Typography;

const SuperDashboard = () => {
  const [filters, setFilters] = useState({
    branchId: [], // Changed to array for multi-select
    clientId: [], // Changed to array for multi-select
    projectId: [], // Changed to array for multi-select
    workOrderId: "all",
    referenceCode: "all",
    startDate: null,
    endDate: null,
    deadlinePeriod: null, // New: 7, 15, or 30
    completionPercentage: null, // New: "<=25" or "<=50"
    dateRange: "7", // Default to 7 days for achievements/KPIs
  });

  const { data: branchesData, isLoading } = useGetSuperDashboardDataQuery();
  const { data: branchesResponse } = useGetBranchesQuery();
  const branchesList = branchesResponse?.branch || [];

  // Get filter options based on selected branches
  const selectedBranches =
    Array.isArray(filters.branchId) && filters.branchId.length > 0
      ? filters.branchId[0]
      : filters.branchId === "all"
        ? "all"
        : filters.branchId;

  const { data: filterOptions = {}, isLoading: filterOptionsLoading } =
    useGetBranchFilterOptionsQuery(selectedBranches, {
      skip:
        selectedBranches === "all" ||
        (Array.isArray(selectedBranches) && selectedBranches.length === 0),
    });

  const {
    data: filteredData,
    isLoading: filteredDataLoading,
    refetch: refetchFilteredData,
  } = useGetFilteredDashboardDataQuery(filters, {
    skip: false, // Always fetch to get initial data (all branches when no filters)
    refetchOnMountOrArgChange: true, // Refetch when filters change
  });

  // Get chart-specific data with counts
  const { data: chartData, isLoading: chartDataLoading } =
    useGetSuperAdminChartDataQuery(filters, {
      skip: false,
      refetchOnMountOrArgChange: true,
    });

  // Helper function to safely get numeric value - available throughout component
  const getSafeNumber = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "null" ||
      value === "undefined"
    ) {
      return 0;
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Update filter options when branch changes
  useEffect(() => {
    const hasBranches = Array.isArray(filters.branchId)
      ? filters.branchId.length > 0
      : filters.branchId !== "all";

    if (hasBranches) {
      setFilters((prev) => ({
        ...prev,
        clientId: [],
        projectId: [],
        workOrderId: "all",
        referenceCode: "all",
      }));
    }
  }, [filters.branchId]);

  // Excel Export Function
  const onExportExcel = () => {
    handleSuperDashboardExportExcel(
      filteredData,
      filters,
      filterOptions,
      branchesList,
      processedData,
    );
  };

  // Reset filters
  const onResetFilters = () => {
    setFilters({
      branchId: [],
      clientId: [],
      projectId: [],
      workOrderId: "all",
      referenceCode: "all",
      startDate: null,
      endDate: null,
      deadlinePeriod: null,
      completionPercentage: null,
      dateRange: "7",
    });
  };

  // Process branches data first (needed by branchPerformanceData)
  const processedData = useMemo(() => {
    if (!branchesData?.branches) return null;

    const branches = branchesData.branches;

    // Calculate totals
    const totalUsers = branches.reduce(
      (sum, branch) => sum + (branch?.totalUsers || 0),
      0,
    );
    const totalBranches = branches?.length || 0;
    const activeBranches = branches.filter(
      (branch) => branch?.isActive === true,
    ).length;

    // Branch performance data
    const branchPerformanceData = branches.map((branch) => ({
      branch: branch?.name || "N/A",
      users: branch?.totalUsers || 0,
      applications: Object.values(branch?.applications || {}).reduce(
        (sum, val) => sum + (val || 0),
        0,
      ),
    }));

    // Applications data - dynamically get all statuses
    const totalApplications = branches.reduce((sum, branch) => {
      if (!branch?.applications) return sum;
      return (
        sum +
        Object.values(branch.applications).reduce(
          (appSum, val) => appSum + (val || 0),
          0,
        )
      );
    }, 0);

    // Collect all unique statuses from all branches
    const allStatuses = new Set();
    branches.forEach((branch) => {
      if (branch?.applications) {
        Object.keys(branch.applications).forEach((status) => {
          allStatuses.add(status);
        });
      }
    });

    // Create application status data dynamically
    const applicationStatusData = Array.from(allStatuses)
      .map((status) => {
        const count = branches.reduce((sum, branch) => {
          return sum + (branch?.applications?.[status] || 0);
        }, 0);
        return { status, count };
      })
      .filter((item) => item?.count > 0);

    const successRate =
      totalApplications > 0
        ? Math.round(
            (branches.reduce(
              (sum, branch) => sum + (branch?.applications?.hired || 0),
              0,
            ) /
              totalApplications) *
              100,
          )
        : 0;

    return {
      totalUsers,
      totalBranches,
      activeBranches,
      totalApplications,
      successRate,
      branchPerformanceData,
      applicationStatusData,
      branches,
    };
  }, [branchesData]);

  // Get branch performance data - computed from filteredData or processedData
  const computedBranchPerformanceData = useMemo(() => {
    // Prioritize filtered data from backend
    if (
      filteredData?.branchPerformance &&
      filteredData.branchPerformance.length > 0
    ) {
      return filteredData.branchPerformance.map((branch) => ({
        branchName: branch?.name || "N/A",
        users: branch?.users?.total || 0,
        applications: Object.values(branch?.applications || {}).reduce(
          (sum, val) => sum + (val || 0),
          0,
        ),
        workOrders: branch?.workOrders?.total || 0,
        candidates: branch?.candidates?.total || 0,
        hired: branch?.candidates?.hired || 0,
      }));
    }

    // Fallback to processed data if no filters applied
    const branchIds = Array.isArray(filters.branchId)
      ? filters.branchId
      : filters.branchId === "all"
        ? []
        : [filters.branchId];
    if (branchIds.length > 0 && processedData?.branches) {
      return processedData.branches
        .filter((b) =>
          branchIds.includes(b?.branchId?.toString() || b?._id?.toString()),
        )
        .map((branch) => ({
          branchName: branch?.name || "N/A",
          users: branch?.totalUsers || 0,
          applications: Object.values(branch?.applications || {}).reduce(
            (sum, val) => sum + (val || 0),
            0,
          ),
          workOrders: 0,
          candidates: 0,
          hired: 0,
        }));
    }

    return (
      processedData?.branchPerformanceData?.map((branch) => ({
        branchName: branch?.branch || branch?.branchName || "N/A",
        users: branch?.users || 0,
        applications: branch?.applications || 0,
        workOrders: branch?.workOrders || 0,
        candidates: branch?.candidates || 0,
        hired: branch?.hired || 0,
      })) || []
    );
  }, [filteredData, processedData, filters.branchId]);

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <Card
          style={{
            textAlign: "center",
            width: "100%",
            maxWidth: "300px",
          }}
        >
          <Spin size="large" />
          <Title level={4} style={{ marginTop: "16px", color: "#da2c46" }}>
            Loading Dashboard Data...
          </Title>
        </Card>
      </div>
    );
  }

  if (!processedData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <Card style={{ width: "100%", maxWidth: "400px" }}>
          <Empty description="No dashboard data available" />
        </Card>
      </div>
    );
  }

  const primaryColor = "#da2c46";

  // Status color mapping
  const getStatusColor = (status) => {
    const colorMap = {
      hired: "#52c41a",
      offer: "#faad14",
      offer_pending: "#faad14",
      offer_revised: "#faad14",
      pipeline: "#1890ff",
      applied: "#6b7280",
      sourced: "#8b5cf6",
      rejected: "#ef4444",
      screening: "#f59e0b",
      selected: "#f59e0b",
      approved: "#52c41a",
      completed: "#52c41a",
      interview: "#8b5cf6",
      "in-pending": "#3b82f6",
    };
    return colorMap[status?.toLowerCase()] || primaryColor;
  };

  // Format status label for display
  const formatStatusLabel = (status) => {
    const statusMap = {
      hired: "Hired",
      offer: "Offer",
      offer_pending: "Offer Pending",
      offer_revised: "Offer Revised",
      pipeline: "Pipeline",
      applied: "Applied",
      sourced: "Sourced",
      rejected: "Rejected",
      screening: "Screening",
      selected: "Selected",
      approved: "Approved",
      completed: "Completed",
      interview: "Interview",
      "in-pending": "Pending",
    };
    return (
      statusMap[status?.toLowerCase()] ||
      status?.charAt(0).toUpperCase() + status?.slice(1) ||
      "Unknown"
    );
  };

  // Get application status data - use chart data API if available, otherwise fallback
  const getApplicationStatusData = () => {
    // Helper function to ensure count is a valid number
    const ensureValidCount = (count) => {
      if (
        count === null ||
        count === undefined ||
        count === "null" ||
        count === "undefined"
      ) {
        return 0;
      }
      const numCount = Number(count);
      return isNaN(numCount) ? 0 : numCount;
    };

    // Prioritize chart data from API
    if (
      chartData?.applicationStatusData &&
      Array.isArray(chartData.applicationStatusData)
    ) {
      return chartData.applicationStatusData
        .map((item) => {
          const count = ensureValidCount(item?.count);
          return {
            status: formatStatusLabel(item?.status || "unknown"),
            originalStatus: item?.status || "unknown",
            count: count,
          };
        })
        .filter(
          (item) => item.count > 0 && item.status && item.status !== "unknown",
        );
    }

    // Fallback to filtered data if chart data not available
    if (
      filteredData?.applicationStatusData &&
      Array.isArray(filteredData.applicationStatusData)
    ) {
      return filteredData.applicationStatusData
        .map((item) => {
          const count = ensureValidCount(item?.count);
          return {
            status: formatStatusLabel(item?.status || "unknown"),
            originalStatus: item?.status || "unknown",
            count: count,
          };
        })
        .filter(
          (item) => item.count > 0 && item.status && item.status !== "unknown",
        );
    }

    // Return empty array if no data available
    return [];
  };

  const applicationStatusConfig = {
    data: getApplicationStatusData()
      .map((item) => ({
        status: item?.status || "Unknown",
        count: item?.count ?? 0,
        originalStatus: item?.originalStatus || item?.status,
      }))
      .filter((item) => item.count > 0),
    xField: "status",
    yField: "count",
    seriesField: "status",
    color: (datum) => {
      const originalStatus =
        datum?.originalStatus || datum?.status || "unknown";
      return getStatusColor(originalStatus);
    },
    columnStyle: {
      radius: [8, 8, 0, 0],
    },
    label: {
      position: "middle",
      formatter: (datum) => {
        const count = Number(datum?.count ?? datum?.value ?? 0);
        return count > 0 ? String(count) : "";
      },
      style: {
        fill: "#FFFFFF",
        opacity: 0.9,
        fontSize: window.innerWidth < 768 ? 10 : 12,
        fontWeight: "bold",
      },
    },
    tooltip: {
      customContent: (title, items) => {
        if (!items || items.length === 0) return "";
        const item = items[0];
        const datum = item?.data || {};
        // Access value: item.value (computed) takes priority, then item.data.count (original)
        const count = getSafeNumber(item?.value ?? datum?.count ?? 0);
        const status = datum?.status ?? item?.name ?? title ?? "Unknown";
        return `<div style="padding:10px;">
      <strong>${status}</strong><br/>
      Candidates: ${count}
    </div>`;
      },
    },
  };

  // Get branch area chart data - use chart data API if available
  const getBranchAreaChartData = () => {
    if (
      chartData?.branchPerformanceAreaData &&
      Array.isArray(chartData.branchPerformanceAreaData) &&
      chartData.branchPerformanceAreaData.length > 0
    ) {
      return chartData.branchPerformanceAreaData.map((item) => ({
        branch: item.branch || "N/A",
        users: getSafeNumber(item.users),
        workOrders: getSafeNumber(item.workOrders),
        candidates: getSafeNumber(item.candidates),
        hired: getSafeNumber(item.hired),
      }));
    }
    // Fallback to computedBranchPerformanceData
    return computedBranchPerformanceData.map((branch) => ({
      branch: branch.branchName || "N/A",
      users: branch.users || 0,
      workOrders: branch.workOrders || 0,
      candidates: branch.candidates || 0,
      hired: branch.hired || 0,
    }));
  };

  const branchAreaChartConfig = {
    data: getBranchAreaChartData(),
    xField: "branch",
    yField: "users",
    smooth: true,
    areaStyle: {
      fill: `l(270) 0:${primaryColor}40 1:${primaryColor}10`,
    },
    line: {
      color: primaryColor,
      size: 3,
    },
    point: {
      size: 6,
      shape: "circle",
      style: {
        fill: primaryColor,
        stroke: "#fff",
        lineWidth: 2,
      },
    },
    label: {
      position: "top",
      formatter: (datum) => {
        const val = getSafeNumber(datum?.users ?? datum?.value ?? 0);
        return String(val);
      },
      style: {
        fill: "#666",
        fontSize: window.innerWidth < 768 ? 10 : 12,
        fontWeight: "bold",
      },
    },
    tooltip: {
      customContent: (title, items) => {
        if (!items || items.length === 0) return "";

        const item = items[0];
        const datum = item?.data || {};
        const branchName = datum?.branch ?? item?.name ?? title ?? "Branch";
        // Access value: item.value (computed) takes priority, then item.data.users (original)
        const users = getSafeNumber(item?.value ?? datum?.users ?? 0);
        const workOrders = getSafeNumber(datum?.workOrders ?? 0);
        const candidates = getSafeNumber(datum?.candidates ?? 0);
        const hired = getSafeNumber(datum?.hired ?? 0);

        return `<div style="padding: 12px;">
          <h4 style="margin: 0 0 8px 0; color: ${primaryColor};">${branchName}</h4>
          <p style="margin: 4px 0;"><span style="color: ${primaryColor};">●</span> Users: ${users}</p>
          <p style="margin: 4px 0;"><span style="color: #52c41a;">●</span> Work Orders: ${workOrders}</p>
          <p style="margin: 4px 0;"><span style="color: #faad14;">●</span> Candidates: ${candidates}</p>
          <p style="margin: 4px 0;"><span style="color: #52c41a;">●</span> Hired: ${hired}</p>
        </div>`;
      },
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding:
          window.innerWidth < 576
            ? "8px 12px 24px"
            : window.innerWidth < 768
              ? "16px 20px 24px"
              : "24px",
      }}
    >
      {/* Header - Responsive */}
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <Title
          level={1}
          style={{
            margin: 0,
            color: primaryColor,
            fontSize: "clamp(1.5rem, 5vw, 3rem)",
            background: `linear-gradient(135deg, ${primaryColor}, #ff7875)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px",
          }}
        >
          Super Admin Dashboard
        </Title>
        <Text
          style={{
            fontSize: "clamp(14px, 2.5vw, 18px)",
            color: "#666",
            display: "block",
            padding: "0 16px",
          }}
        >
          Comprehensive overview of all branches and operations
        </Text>
      </div>

      {/* Filters Section */}
      <SuperDashboardFilters
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        filterOptionsLoading={filterOptionsLoading}
        branchesList={branchesList}
        onExportExcel={onExportExcel}
        onReset={onResetFilters}
        primaryColor={primaryColor}
      />

      {/* Main Statistics */}
      <StatisticsSection
        statistics={filteredData?.statistics}
        hoverData={filteredData?.hoverData}
        primaryColor={primaryColor}
      />

      {/* Candidate Metrics */}
      <CandidateMetricsSection
        statistics={filteredData?.statistics}
        primaryColor={primaryColor}
      />

      {/* Action Items */}
      <ActionItemsSection
        hoverData={filteredData?.hoverData}
        primaryColor={primaryColor}
      />

      {/* KPIs Section */}
      <KPISection kpis={filteredData?.kpis} primaryColor={primaryColor} />

      {/* Achievements Section */}
      <AchievementsSection
        achievements={filteredData?.achievements}
        dateRange={filters.dateRange}
        primaryColor={primaryColor}
      />

      {/* Charts Section */}
      <ChartsSection
        filteredData={filteredData}
        chartData={chartData}
        filteredDataLoading={filteredDataLoading}
        chartDataLoading={chartDataLoading}
        primaryColor={primaryColor}
      />

      <BranchPerformanceSection
        branchPerformanceData={computedBranchPerformanceData}
        loading={filteredDataLoading}
        primaryColor={primaryColor}
      />
    </div>
  );
};

export default SuperDashboard;
