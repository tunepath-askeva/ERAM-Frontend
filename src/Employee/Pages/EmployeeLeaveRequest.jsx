import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Button,
  Avatar,
  Typography,
  Space,
} from "antd";
import {
  PlusOutlined,
  HistoryOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  FileTextOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import LeaveForm from "../Components/LeaveForm";
import LeaveHistory from "../Components/LeaveHistory";
import {
  useGetEmployeeProfileQuery,
  useGetEmployeeLeaveHistoryQuery,
} from "../../Slices/Employee/EmployeeApis";
import SkeletonLoader from "../../Global/SkeletonLoader";
const { Title, Text } = Typography;

const EmployeeLeaveRequest = () => {
  const [activeTab, setActiveTab] = useState("apply");
  const [mobileView, setMobileView] = useState(false);

  const { data, isLoading } = useGetEmployeeProfileQuery();

  // Get basic stats without filters for the overview cards
  const { data: statsData, isLoading: LeaveHistoryLoading } =
    useGetEmployeeLeaveHistoryQuery({
      page: 1,
      limit: 1000, // Get all records for stats calculation
    });

  const user = data?.employee;

  const employeeData = {
    firstName: user?.firstName || "John",
    lastName: user?.lastName || "Doe",
    fullName: user?.fullName || "John Doe",
    designation:
      user?.employmentDetails?.assignedJobTitle || "Software Engineer",
    eramId: user?.employmentDetails?.eramId || "ERAM-123",
    email: user?.email || "john.doe@company.com",
    phone: user?.phone || "+1 234 567 8900",
    avatar: user?.image || null,
    leaveBalances: {
      annual: { total: 20, used: 5, remaining: 15 },
      sick: { total: 10, used: 2, remaining: 8 },
      casual: { total: 5, used: 1, remaining: 4 },
      maternity: { total: 90, used: 0, remaining: 90 },
      paternity: { total: 15, used: 0, remaining: 15 },
      compensatory: { total: 12, used: 3, remaining: 9 },
      emergency: { total: 3, used: 0, remaining: 3 },
    },
  };

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getLeaveStats = () => {
    const leaves = statsData?.leaves || [];
    if (!leaves.length)
      return {
        totalRequests: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        totalDays: 0,
      };

    const currentYear = dayjs().year();

    const yearlyRequests = leaves.filter(
      (req) => dayjs(req.appliedDate || req.createdAt).year() === currentYear
    );

    return {
      totalRequests: yearlyRequests.length,
      approved: yearlyRequests.filter((req) => req.status === "approved")
        .length,
      pending: yearlyRequests.filter((req) => req.status === "pending").length,
      rejected: yearlyRequests.filter((req) => req.status === "rejected")
        .length,
      totalDays: yearlyRequests
        .filter((req) => req.status === "approved")
        .reduce(
          (sum, req) =>
            sum +
            (dayjs(req.endDate).diff(dayjs(req.startDate), "day") +
              (req.isHalfDay ? 0.5 : 1)),
          0
        ),
    };
  };

  const stats = getLeaveStats();

  const handleLeaveSubmit = (newLeave) => {
    // Switch to history tab after successful submission
    setActiveTab("history");
  };

  if (isLoading && LeaveHistoryLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div style={{ padding: mobileView ? 16 : 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={employeeData.avatar}
                size={mobileView ? 48 : 64}
                icon={<UserOutlined />}
                style={{ marginRight: 16 }}
              />
              <div>
                <Title level={mobileView ? 4 : 3} style={{ margin: 0 }}>
                  {employeeData.fullName}
                </Title>
                <Text type="secondary">
                  {employeeData.designation} • {employeeData.eramId}
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} md={16}>
            <div style={{ textAlign: mobileView ? "left" : "right" }}>
              <Space direction={mobileView ? "vertical" : "horizontal"} wrap>
                <Button icon={<MailOutlined />} type="text">
                  {employeeData.email}
                </Button>
                <Button icon={<PhoneOutlined />} type="text">
                  {employeeData.phone}
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card hoverable size="small">
            <Statistic
              title="Pending"
              value={stats.pending}
              prefix={<HourglassOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable size="small">
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable size="small">
            <Statistic
              title="Total Days"
              value={stats.totalDays}
              prefix={<CalendarOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable size="small">
            <Statistic
              title="This Year"
              value={stats.totalRequests}
              prefix={<FileTextOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "apply",
            label: (
              <span style={{ color: "#da2c46" }}>
                <PlusOutlined />
                {!mobileView && " Apply Leave"}
              </span>
            ),
            children: (
              <LeaveForm
                onLeaveSubmit={handleLeaveSubmit}
                leaveBalances={employeeData.leaveBalances}
                mobileView={mobileView}
              />
            ),
          },
          {
            key: "history",
            label: (
              <span style={{ color: "#da2c46" }}>
                <HistoryOutlined />
                {!mobileView && " Leave History"}
                <Badge
                  count={stats.pending}
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              </span>
            ),
            children: <LeaveHistory mobileView={mobileView} />,
          },
        ]}
      />

      {mobileView && activeTab !== "apply" && (
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<PlusOutlined />}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
          onClick={() => setActiveTab("apply")}
        />
      )}
    </div>
  );
};

export default EmployeeLeaveRequest;
