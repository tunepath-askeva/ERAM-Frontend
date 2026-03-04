import React from "react";
import { Card, Row, Col, Select, DatePicker, Button, Space, Typography } from "antd";
import { FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const DashboardFilters = ({
  filters,
  setFilters,
  filterOptions,
  filterOptionsLoading,
  onExportExcel,
  onReset,
  primaryColor = "#da2c46",
}) => {
  return (
    <Card
      title={
        <Space>
          <FileExcelOutlined style={{ color: primaryColor }} />
          <span style={{ fontSize: "clamp(16px, 2.5vw, 18px)", fontWeight: "600" }}>
            Filters & Export
          </span>
        </Space>
      }
      style={{
        borderRadius: "16px",
        marginBottom: "clamp(16px, 2.5vw, 24px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      }}
      headStyle={{
        borderBottom: `2px solid ${primaryColor}20`,
        borderRadius: "16px 16px 0 0",
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Client
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Clients (Multiple)"
            value={Array.isArray(filters.clientId) ? filters.clientId : (filters.clientId === "all" ? [] : [filters.clientId])}
            onChange={(value) => setFilters(prev => ({ ...prev, clientId: value.length === 0 ? [] : value }))}
            disabled={filterOptionsLoading}
            loading={filterOptionsLoading}
            allowClear
            options={filterOptions?.clients?.map(client => ({
              label: client?.name || "N/A",
              value: client?.id || "",
            })) || []}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Project
          </Text>
          <Select
            mode="multiple"
            style={{ width: "100%" }}
            placeholder="Select Projects (Multiple)"
            value={Array.isArray(filters.projectId) ? filters.projectId : (filters.projectId === "all" ? [] : [filters.projectId])}
            onChange={(value) => setFilters(prev => ({ ...prev, projectId: value.length === 0 ? [] : value }))}
            disabled={filterOptionsLoading}
            loading={filterOptionsLoading}
            allowClear
            options={filterOptions?.projects?.map(project => ({
              label: project?.name || "N/A",
              value: project?.id || "",
            })) || []}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Work Order
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Work Order"
            value={filters.workOrderId}
            onChange={(value) => setFilters(prev => ({ ...prev, workOrderId: value }))}
            disabled={filterOptionsLoading}
            loading={filterOptionsLoading}
            options={[
              { label: "All Work Orders", value: "all" },
              ...(filterOptions?.workOrders?.map(wo => ({
                label: wo?.name || "N/A",
                value: wo?.id || "",
              })) || []),
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Reference Code
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Reference Code"
            value={filters.referenceCode}
            onChange={(value) => setFilters(prev => ({ ...prev, referenceCode: value }))}
            disabled={filterOptionsLoading}
            loading={filterOptionsLoading}
            options={[
              { label: "All Reference Codes", value: "all" },
              ...(filterOptions?.referenceCodes?.map(ref => ({
                label: ref?.name || "N/A",
                value: ref?.id || "",
              })) || []),
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Work Order Dates
          </Text>
          <RangePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setFilters(prev => ({
                  ...prev,
                  startDate: dates[0].format("YYYY-MM-DD"),
                  endDate: dates[1].format("YYYY-MM-DD"),
                }));
              } else {
                setFilters(prev => ({
                  ...prev,
                  startDate: null,
                  endDate: null,
                }));
              }
            }}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Deadline Period
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="Filter by Deadline"
            value={filters.deadlinePeriod}
            onChange={(value) => setFilters(prev => ({ ...prev, deadlinePeriod: value }))}
            allowClear
            options={[
              { label: "7 Days", value: "7" },
              { label: "15 Days", value: "15" },
              { label: "30 Days", value: "30" },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Completion %
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="Filter by Completion"
            value={filters.completionPercentage}
            onChange={(value) => setFilters(prev => ({ ...prev, completionPercentage: value }))}
            allowClear
            options={[
              { label: "<= 25%", value: "<=25" },
              { label: "<= 50%", value: "<=50" },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Date Range (KPIs/Achievements)
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="Select Days"
            value={filters.dateRange}
            onChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
            options={[
              { label: "Past 7 Days", value: "7" },
              { label: "Past 15 Days", value: "15" },
              { label: "Past 30 Days", value: "30" },
            ]}
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Text strong style={{ display: "block", marginBottom: "8px", fontSize: "clamp(12px, 1.8vw, 14px)" }}>
            Actions
          </Text>
          <Space wrap>
            <Button
              type="primary"
              icon={<FileExcelOutlined />}
              onClick={onExportExcel}
            >
              Export to Excel
            </Button>
            <Button onClick={onReset}>
              Reset
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default DashboardFilters;

