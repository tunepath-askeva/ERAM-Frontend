import React, { useState, useEffect } from "react";
import { 
  useGetAdminDashboardDataQuery,
  useGetFilteredAdminDashboardDataQuery,
  useGetAdminFilterOptionsQuery,
  useGetAdminChartDataQuery
} from "../../Slices/Admin/AdminApis";
import { Typography, Space, Button } from "antd";
import { useNavigate } from "react-router-dom";
import DashboardFilters from "../Components/DashboardFilters";
import StatisticsSection, { CandidateMetricsSection } from "../Components/StatisticsSection";
import ActionItemsSection from "../Components/ActionItemsSection";
import KPISection from "../Components/KPISection";
import AchievementsSection from "../Components/AchievementsSection";
import ChartsSection from "../Components/DashboardCharts";
import UserStatisticsSection from "../Components/UserStatisticsSection";
import { handleExportExcel } from "../Components/dashboardUtils";

const { Title, Text } = Typography;

const primaryColor = "#da2c46";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useGetAdminDashboardDataQuery();
  
  // Filter state (no branch filter - admin only sees their branch)
  const [filters, setFilters] = useState({
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

  // Get filter options
  const { data: filterOptions = {}, isLoading: filterOptionsLoading } = useGetAdminFilterOptionsQuery();

  // Get filtered dashboard data
  const { data: filteredData, isLoading: filteredDataLoading } = useGetFilteredAdminDashboardDataQuery(
    filters,
    { 
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  // Get chart-specific data with counts
  const { data: chartData, isLoading: chartDataLoading } = useGetAdminChartDataQuery(
    filters,
    { 
      skip: false,
      refetchOnMountOrArgChange: true,
    }
  );

  // Reset dependent filters when client/project changes
  useEffect(() => {
    if (Array.isArray(filters.clientId) && filters.clientId.length > 0) {
      setFilters(prev => ({
        ...prev,
        projectId: [],
        workOrderId: "all",
        referenceCode: "all",
      }));
    }
  }, [filters.clientId]);

  useEffect(() => {
    if (Array.isArray(filters.projectId) && filters.projectId.length > 0) {
      setFilters(prev => ({
        ...prev,
        workOrderId: "all",
        referenceCode: "all",
      }));
    }
  }, [filters.projectId]);

  // Prepare role data for pie chart
  const roleData =
    data?.roleCounts?.map((item) => ({
      type: item._id.charAt(0).toUpperCase() + item._id.slice(1),
      value: item.count,
    })) || [];

  // Calculate total users from role counts
  const totalUsers =
    data?.roleCounts?.reduce((sum, role) => sum + role.count, 0) || 0;

  // Get specific role counts
  const getCount = (role) =>
    data?.roleCounts?.find((r) => r._id === role)?.count || 0;

  // Helper function to safely get numeric value
  const getSafeNumber = (value) => {
    if (value === null || value === undefined || value === 'null' || value === 'undefined') {
      return 0;
    }
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Excel Export Function
  const onExportExcel = () => {
    handleExportExcel(filteredData, filters, filterOptions, data);
  };

  // Reset filters
  const onResetFilters = () => {
    setFilters({
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

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Title level={3} type="danger">
          Error loading dashboard data
        </Title>
        <Text>Please try refreshing the page</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "clamp(12px, 2vw, 24px)",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "clamp(16px, 2.5vw, 32px)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <Title
              level={1}
              style={{
                fontSize: "clamp(24px, 4vw, 2.5rem)",
                fontWeight: "bold",
                marginBottom: "8px",
                color: primaryColor,
              }}
            >
              Admin Dashboard
            </Title>
            <Text style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "#666" }}>
              Overview of your branch statistics and user data
            </Text>
          </div>

          <Space wrap>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/admin/dashboard/details")}
              style={{
                borderRadius: "8px",
              }}
            >
              Get More Job Details
            </Button>
          </Space>
        </div>
      </div>

      {/* Filters Section */}
      <DashboardFilters
        filters={filters}
        setFilters={setFilters}
        filterOptions={filterOptions}
        filterOptionsLoading={filterOptionsLoading}
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
      <KPISection
        kpis={filteredData?.kpis}
        primaryColor={primaryColor}
      />

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

      {/* User Statistics Section */}
      {/* <UserStatisticsSection
        data={data}
        isLoading={isLoading}
        roleData={roleData}
        totalUsers={totalUsers}
        getCount={getCount}
        primaryColor={primaryColor}
      /> */}
    </div>
  );
};

export default AdminDashboard;
