import React, { useRef, useState } from "react";
import { Card, Space, Spin, Empty, Row, Col } from "antd";
import { Funnel } from "@ant-design/plots";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  RiseOutlined,
  FunnelPlotOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

const primaryColor = "#da2c46";

const getSafeNumber = (value) => {
  if (value === null || value === undefined || value === "null" || value === "undefined") {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// ─── Custom Tooltip Component ──────────────────────────────────────────────────
const CustomTooltip = ({ visible, x, y, label, value, primaryColor = "#da2c46" }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        zIndex: 9999,
        pointerEvents: "none",
        transform: "translate(-50%, -100%)",
        marginTop: "-10px",
        fontSize: "13px",
        lineHeight: "1.5",
        whiteSpace: "nowrap",
        border: `1px solid ${primaryColor}40`,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "4px", color: primaryColor }}>
        {label}
      </div>
      <div style={{ color: "#fff" }}>
        Candidates: <strong style={{ color: primaryColor }}>{value}</strong>
      </div>
    </div>
  );
};


// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, primaryColor = "#da2c46" }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          border: `1px solid ${primaryColor}40`,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "4px", color: primaryColor }}>
          {data.status}
        </div>
        <div style={{ color: "#fff" }}>
          Candidates: <strong style={{ color: primaryColor }}>{data.count}</strong>
        </div>
      </div>
    );
  }
  return null;
};

// ─── ApplicationStatusChart ───────────────────────────────────────────────────
export const ApplicationStatusChart = ({
  data,
  loading,
  primaryColor = "#da2c46",
}) => {
  if (loading) return <Spin size="large" style={{ display: "block", padding: "60px 0" }} />;

  if (!data || data.length === 0)
    return <Empty description="No application data available" style={{ padding: "60px 0" }} />;

  // Normalize: always use { status, count }
  const chartData = data
    .map((item) => ({
      status: item?.status || "Unknown",
      count: getSafeNumber(item?.count),
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count); // Sort by count descending

  if (chartData.length === 0)
    return <Empty description="No application data available" style={{ padding: "60px 0" }} />;

  return (
    <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 300 : 350}>
      <BarChart
        data={chartData}
        margin={{ 
          top: 20, 
          right: window.innerWidth < 768 ? 10 : 30, 
          left: window.innerWidth < 768 ? 0 : 20, 
          bottom: window.innerWidth < 768 ? 80 : 60 
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="status"
          angle={window.innerWidth < 768 ? -60 : -45}
          textAnchor="end"
          height={window.innerWidth < 768 ? 100 : 80}
          tick={{ fontSize: window.innerWidth < 768 ? 9 : 12 }}
          interval={0}
        />
        <YAxis 
          tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }}
          width={window.innerWidth < 768 ? 40 : 60}
        />
        <Tooltip content={<CustomBarTooltip primaryColor={primaryColor} />} />
        <Bar
          dataKey="count"
          fill={primaryColor}
          radius={[8, 8, 0, 0]}
          label={{
            position: "top",
            formatter: (value) => value,
            style: { 
              fill: primaryColor, 
              fontSize: window.innerWidth < 768 ? 9 : 12, 
              fontWeight: "bold" 
            },
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// ─── CandidatePipelineChart ───────────────────────────────────────────────────
export const CandidatePipelineChart = ({
  chartData,
  statistics,
  loading,
  primaryColor = "#da2c46",
}) => {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, label: "", value: 0 });
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  if (loading) return <Spin size="large" style={{ display: "block", padding: "60px 0" }} />;

  let funnelData = [];

  if (chartData?.funnelChartData?.length > 0) {
    funnelData = chartData.funnelChartData
      .map((item) => ({
        stage: item?.stage || "Unknown",
        value: getSafeNumber(item?.value),
      }))
      .filter((item) => item.value >= 0);
  } else if (statistics) {
    funnelData = [
      { stage: "Required",    value: getSafeNumber(statistics?.totalCandidatesNeeded) },
      { stage: "In Pipeline", value: getSafeNumber(statistics?.totalCandidatesInPipeline) },
      { stage: "Hired",       value: getSafeNumber(statistics?.totalHired) },
      { stage: "Pending",     value: getSafeNumber(statistics?.pendingRequirements) },
    ];
  }

  if (funnelData.length === 0)
    return <Empty description="No pipeline data available" style={{ padding: "60px 0" }} />;

  // Handle tooltip on chart ready
  const handleChartReady = (plot) => {
    if (!plot) return;
    
    plot.on("element:mouseenter", (evt) => {
      try {
        // Try multiple paths to get the data
        const data = evt.data?.data || evt.data?.datum || evt.data || {};
        const stage = data.stage || evt.data?.stage || "Unknown";
        const value = getSafeNumber(data.value || evt.data?.value || 0);
        
        // Get mouse position - try multiple event properties
        const clientX = evt.x || evt.clientX || evt.offsetX || 0;
        const clientY = evt.y || evt.clientY || evt.offsetY || 0;
        
        const containerRect = containerRef.current?.getBoundingClientRect();
        const x = containerRect ? containerRect.left + clientX : clientX;
        const y = containerRect ? containerRect.top + clientY : clientY;
        
        setTooltip({
          visible: true,
          x: x,
          y: y - 10, // Offset above cursor
          label: stage,
          value: value,
        });
      } catch (error) {
        console.error("Tooltip error:", error);
      }
    });

    plot.on("element:mouseleave", () => {
      setTooltip({ visible: false, x: 0, y: 0, label: "", value: 0 });
    });
  };

  const config = {
    data: funnelData,
    xField: "stage",
    yField: "value",
    label: {
      position: "center",
      formatter: (datum) => String(getSafeNumber(datum?.value)),
      style: {
        fill: "#fff",
        fontSize: window.innerWidth < 768 ? 12 : 14,
        fontWeight: "bold",
      },
    },
    tooltip: false, // Disable default tooltip
    color: ({ stage }) => {
      const colorMap = {
        Required:    "#1890ff",
        "In Pipeline": "#faad14",
        Hired:       "#52c41a",
        Pending:     "#ff4d4f",
      };
      return colorMap[stage] || primaryColor;
    },
    meta: {
      value: { alias: "Count" },
      stage: { alias: "Stage" },
    },
    height: window.innerWidth < 768 ? 300 : 350,
    onReady: handleChartReady,
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <Funnel {...config} ref={chartRef} />
      <CustomTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        label={tooltip.label}
        value={tooltip.value}
        primaryColor={primaryColor}
      />
    </div>
  );
};

// ─── Custom Pie Tooltip ───────────────────────────────────────────────────────
const CustomPieTooltip = ({ active, payload, primaryColor = "#da2c46" }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.85)",
          color: "#fff",
          padding: "10px 14px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          border: `1px solid ${primaryColor}40`,
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: "4px", color: primaryColor }}>
          {data.type}
        </div>
        <div style={{ color: "#fff" }}>
          Candidates: <strong style={{ color: primaryColor }}>{data.value}</strong>
        </div>
        {data.percent && (
          <div style={{ color: "#fff", fontSize: "12px", marginTop: "4px" }}>
            Percentage: {(data.percent * 100).toFixed(1)}%
          </div>
        )}
      </div>
    );
  }
  return null;
};

// ─── StatusDistributionChart ──────────────────────────────────────────────────
export const StatusDistributionChart = ({
  chartData,
  applicationStatusData,
  loading,
  primaryColor = "#da2c46",
}) => {
  if (loading) return <Spin size="large" style={{ display: "block", padding: "60px 0" }} />;

  let pieData = [];

  if (chartData?.pieChartData?.length > 0) {
    pieData = chartData.pieChartData
      .map((item) => ({
        type: item?.type || "Unknown",
        value: getSafeNumber(item?.value),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sort by value descending
  } else if (applicationStatusData?.length > 0) {
    pieData = applicationStatusData
      .filter((item) => item?.status && getSafeNumber(item.count) > 0)
      .map((item) => ({
        type: item.status,
        value: getSafeNumber(item.count),
      }))
      .sort((a, b) => b.value - a.value);
  }

  if (!pieData || pieData.length === 0)
    return <Empty description="No status data available" style={{ padding: "60px 0" }} />;

  // Generate colors for pie chart
  const COLORS = [
    primaryColor,
    "#1890ff",
    "#52c41a",
    "#faad14",
    "#ff4d4f",
    "#722ed1",
    "#13c2c2",
    "#eb2f96",
    "#fa8c16",
    "#2f54eb",
    "#a0d911",
    "#f5222d",
  ];

  // Calculate total for percentage
  const total = pieData.reduce((sum, item) => sum + item.value, 0);
  const pieDataWithPercent = pieData.map((item) => ({
    ...item,
    percent: total > 0 ? item.value / total : 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={window.innerWidth < 768 ? 300 : 350}>
      <PieChart>
        <Pie
          data={pieDataWithPercent}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ type, value, percent }) => {
            // Show label only if segment is large enough
            if (percent > 0.05) {
              return window.innerWidth < 768 
                ? `${value}` 
                : `${type}: ${value} (${(percent * 100).toFixed(1)}%)`;
            }
            return "";
          }}
          outerRadius={window.innerWidth < 768 ? 80 : 100}
          innerRadius={window.innerWidth < 768 ? 20 : 30}
          fill="#8884d8"
          dataKey="value"
        >
          {pieDataWithPercent.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip primaryColor={primaryColor} />} />
        <Legend
          verticalAlign="bottom"
          height={window.innerWidth < 768 ? 80 : 100}
          iconType="circle"
          wrapperStyle={{ fontSize: window.innerWidth < 768 ? "10px" : "12px" }}
          formatter={(value, entry) => `${value}: ${entry.payload.value}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// ─── ChartsSection ────────────────────────────────────────────────────────────
export const ChartsSection = ({
  filteredData,
  chartData,
  filteredDataLoading,
  chartDataLoading,
  primaryColor = "#da2c46",
}) => {
  if (!filteredData?.applicationStatusData) return null;

  // ✅ Prefer chartData arrays (already computed from API), fallback to filteredData
  const statusData =
    chartData?.applicationStatusData?.length > 0
      ? chartData.applicationStatusData
      : filteredData.applicationStatusData;

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      <Col xs={24} lg={10}>
        <Card
          title={
            <Space>
              <RiseOutlined style={{ color: primaryColor }} />
              <span style={{ fontSize: "clamp(14px,2vw,16px)", fontWeight: "600" }}>
                Application Status
              </span>
            </Space>
          }
          style={{ borderRadius: "16px", minHeight: window.innerWidth < 768 ? "380px" : "400px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          headStyle={{ borderBottom: `2px solid ${primaryColor}20`, borderRadius: "16px 16px 0 0" }}
        >
          <ApplicationStatusChart
            data={statusData}
            loading={filteredDataLoading || chartDataLoading}
            primaryColor={primaryColor}
          />
        </Card>
      </Col>

      <Col xs={24} lg={7}>
        <Card
          title={
            <Space>
              <FunnelPlotOutlined style={{ color: primaryColor }} />
              <span style={{ fontSize: "clamp(14px,2vw,16px)", fontWeight: "600" }}>
                Candidate Pipeline
              </span>
            </Space>
          }
          style={{ borderRadius: "16px", minHeight: window.innerWidth < 768 ? "380px" : "400px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          headStyle={{ borderBottom: `2px solid ${primaryColor}20`, borderRadius: "16px 16px 0 0" }}
        >
          <CandidatePipelineChart
            chartData={chartData}
            statistics={filteredData?.statistics}
            loading={filteredDataLoading || chartDataLoading}
            primaryColor={primaryColor}
          />
        </Card>
      </Col>

      <Col xs={24} lg={7}>
        <Card
          title={
            <Space>
              <PieChartOutlined style={{ color: primaryColor }} />
              <span style={{ fontSize: "clamp(14px,2vw,16px)", fontWeight: "600" }}>
                Status Distribution
              </span>
            </Space>
          }
          style={{ borderRadius: "16px", minHeight: window.innerWidth < 768 ? "380px" : "400px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          headStyle={{ borderBottom: `2px solid ${primaryColor}20`, borderRadius: "16px 16px 0 0" }}
        >
          <StatusDistributionChart
            chartData={chartData}
            applicationStatusData={filteredData?.applicationStatusData}
            loading={filteredDataLoading || chartDataLoading}
            primaryColor={primaryColor}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ChartsSection;