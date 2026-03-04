import React, { useState, useRef } from "react";
import { Card, Space, Spin, Empty } from "antd";
import { Column, Area } from "@ant-design/plots";
import { BranchesOutlined } from "@ant-design/icons";

const getSafeNumber = (value) => {
  if (value === null || value === undefined || value === 'null' || value === 'undefined') {
    return 0;
  }
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// ─── Custom Tooltip Component ──────────────────────────────────────────────────
const CustomTooltip = ({ visible, x, y, branch, users, workOrders, candidates, hired, primaryColor = "#da2c46" }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        color: "#fff",
        padding: "12px 14px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        zIndex: 9999,
        pointerEvents: "none",
        transform: "translate(-50%, -100%)",
        marginTop: "-10px",
        fontSize: "13px",
        lineHeight: "1.6",
        whiteSpace: "nowrap",
        border: `1px solid ${primaryColor}40`,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "8px", color: primaryColor, fontSize: "14px" }}>
        {branch}
      </div>
      <div style={{ color: "#fff", margin: "4px 0" }}>
        <span style={{ color: primaryColor }}>●</span> Users: <strong style={{ color: primaryColor }}>{users}</strong>
      </div>
      <div style={{ color: "#fff", margin: "4px 0" }}>
        <span style={{ color: "#52c41a" }}>●</span> Work Orders: <strong style={{ color: "#52c41a" }}>{workOrders}</strong>
      </div>
      <div style={{ color: "#fff", margin: "4px 0" }}>
        <span style={{ color: "#faad14" }}>●</span> Candidates: <strong style={{ color: "#faad14" }}>{candidates}</strong>
      </div>
      <div style={{ color: "#fff", margin: "4px 0" }}>
        <span style={{ color: "#52c41a" }}>●</span> Hired: <strong style={{ color: "#52c41a" }}>{hired}</strong>
      </div>
    </div>
  );
};

export const BranchPerformanceColumnChart = ({ branchPerformanceData, loading, primaryColor = "#da2c46" }) => {
  const [tooltip, setTooltip] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    branch: "", 
    users: 0, 
    workOrders: 0, 
    candidates: 0, 
    hired: 0 
  });
  const chartRef = useRef(null);
  const containerRef = useRef(null);

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

  // Handle tooltip on chart ready
  const handleChartReady = (plot) => {
    if (!plot) return;
    
    plot.on("element:mouseenter", (evt) => {
      try {
        // Try multiple paths to get the data
        const data = evt.data?.data || evt.data?.datum || evt.data || {};
        const branch = data.branch || evt.data?.branch || "Unknown";
        const users = getSafeNumber(data.users || evt.data?.users || 0);
        const workOrders = getSafeNumber(data.workOrders || evt.data?.workOrders || 0);
        const candidates = getSafeNumber(data.candidates || evt.data?.candidates || 0);
        const hired = getSafeNumber(data.hired || evt.data?.hired || 0);
        
        // Get mouse position - try multiple event properties
        const clientX = evt.x || evt.clientX || evt.offsetX || 0;
        const clientY = evt.y || evt.clientY || evt.offsetY || 0;
        
        const containerRect = containerRef.current?.getBoundingClientRect();
        const x = containerRect ? containerRect.left + clientX : clientX;
        const y = containerRect ? containerRect.top + clientY : clientY;
        
        setTooltip({
          visible: true,
          x: x,
          y: y - 10,
          branch: branch,
          users: users,
          workOrders: workOrders,
          candidates: candidates,
          hired: hired,
        });
      } catch (error) {
        console.error("Tooltip error:", error);
      }
    });

    plot.on("element:mouseleave", () => {
      setTooltip({ visible: false, x: 0, y: 0, branch: "", users: 0, workOrders: 0, candidates: 0, hired: 0 });
    });
  };

  const config = {
    data: chartData,
    xField: 'branch',
    yField: 'users',
    color: primaryColor,
    columnStyle: { radius: [8, 8, 0, 0] },
    label: {
      position: 'middle',
      style: {
        fill: '#FFFFFF',
        opacity: 0.9,
        fontSize: window.innerWidth < 768 ? 10 : 12,
        fontWeight: 'bold',
      },
    },
    tooltip: false, // Disable default tooltip
    height: window.innerWidth < 768 ? 300 : 400,
    onReady: handleChartReady,
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <Column {...config} ref={chartRef} />
      <CustomTooltip
        visible={tooltip.visible}
        x={tooltip.x}
        y={tooltip.y}
        branch={tooltip.branch}
        users={tooltip.users}
        workOrders={tooltip.workOrders}
        candidates={tooltip.candidates}
        hired={tooltip.hired}
        primaryColor={primaryColor}
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

  const config = {
    data: chartData,
    xField: 'branch',
    yField: 'users',
    smooth: true,
    areaStyle: {
      fill: `l(270) 0:${primaryColor} 1:${primaryColor}40`,
    },
    color: primaryColor,
    tooltip: {
      customContent: (title, items) => {
        if (!items || items.length === 0) return "";
        const item = items[0];
        const datum = item?.data || {};
        const branch = datum?.branch ?? item?.name ?? title ?? "Unknown";
        // Access value: item.value (computed) takes priority for yField (users), then item.data.users (original)
        const users = getSafeNumber(item?.value ?? datum?.users ?? 0);
        const workOrders = getSafeNumber(datum?.workOrders ?? 0);
        const candidates = getSafeNumber(datum?.candidates ?? 0);
        const hired = getSafeNumber(datum?.hired ?? 0);
        
        return `<div style="padding: 12px;">
          <h4 style="margin: 0 0 8px 0; color: ${primaryColor};">${branch}</h4>
          <p style="margin: 4px 0;"><span style="color: ${primaryColor};">●</span> Users: ${users}</p>
          <p style="margin: 4px 0;"><span style="color: #52c41a;">●</span> Work Orders: ${workOrders}</p>
          <p style="margin: 4px 0;"><span style="color: #faad14;">●</span> Candidates: ${candidates}</p>
          <p style="margin: 4px 0;"><span style="color: #52c41a;">●</span> Hired: ${hired}</p>
        </div>`;
      },
    },
    height: window.innerWidth < 768 ? 300 : 400,
  };

  return <Area {...config} />;
};

export const BranchPerformanceSection = ({ 
  branchPerformanceData, 
  loading, 
  primaryColor = "#da2c46" 
}) => {
  if (!branchPerformanceData || branchPerformanceData.length === 0) return null;

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
      <div style={{ marginBottom: "24px" }}>
        <Card
          title={
            <Space>
              <BranchesOutlined style={{ color: primaryColor }} />
              <span style={{ fontSize: "clamp(14px, 2vw, 16px)", fontWeight: "600" }}>
                Branch Performance Overview
              </span>
            </Space>
          }
          style={{
            borderRadius: "16px",
            minHeight: window.innerWidth < 768 ? "350px" : "450px",
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

