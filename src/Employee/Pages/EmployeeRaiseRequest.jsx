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
  message,
} from "antd";
import {
  PlusOutlined,
  HistoryOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  SolutionOutlined,
  FileTextOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import EmployeeRaiseRequestForm from "../Components/EmployeeRaiseRequestForm";
import RequestHistory from "../Components/RequestHistory";
import {
  useGetEmployeeProfileQuery,
  useGetRequestHistoryQuery,
  useSubmitSelectedTicketsMutation,
} from "../../Slices/Employee/EmployeeApis";

const { Title, Text } = Typography;

const EmployeeRaiseRequest = () => {
  const [activeTab, setActiveTab] = useState("submit");
  const [mobileView, setMobileView] = useState(false);
  const [requestFilters, setRequestFilters] = useState({
    page: 1,
    pageSize: 10,
    status: "all",
    requestType: "all",
    search: "",
    startDate: null,
    endDate: null,
  });

  const { data } = useGetEmployeeProfileQuery();
  const {
    data: requestHistoryData,
    refetch: refetchRequestHistory,
    isLoading: isLoadingHistory,
  } = useGetRequestHistoryQuery(requestFilters);

  const [submitSelectedTickets, { isLoading: isSubmittingTickets }] =
    useSubmitSelectedTicketsMutation();

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
  };

  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setRequestFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const getRequestStats = () => {
    const stats = requestHistoryData?.stats;
    if (stats) {
      return stats; // Use server-side calculated stats
    }

    // Fallback to client-side calculation if stats not provided
    const requestList = requestHistoryData?.requests || [];
    if (!requestList.length)
      return {
        totalRequests: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        cancelled: 0,
      };

    const currentYear = dayjs().year();

    const yearlyRequests = requestList.filter((req) => {
      const requestDate = req.createdAt || new Date().toISOString();
      return dayjs(requestDate).year() === currentYear;
    });

    return {
      totalRequests: yearlyRequests.length,
      approved: yearlyRequests.filter((req) => req.status === "approved")
        .length,
      pending: yearlyRequests.filter((req) => req.status === "pending").length,
      rejected: yearlyRequests.filter((req) => req.status === "rejected")
        .length,
      cancelled: yearlyRequests.filter((req) => req.status === "cancelled")
        .length,
    };
  };

  const stats = getRequestStats();

  const handleRequestSubmit = async () => {
    await refetchRequestHistory();
    setActiveTab("history");
  };

  const handleTicketSubmit = async (requestId, ticketId) => {
    try {
      const result = await submitSelectedTickets({
        requestId,
        ticketId,
      }).unwrap();

      message.success(result.message || "Ticket submitted successfully!");
      await refetchRequestHistory();
      return result;
    } catch (error) {
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to submit ticket. Please try again.";
      message.error(errorMessage);
      throw error;
    }
  };

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
              value={stats.pending || 0}
              prefix={<HourglassOutlined style={{ color: "#faad14" }} />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable size="small">
            <Statistic
              title="Approved"
              value={stats.approved || 0}
              prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable size="small">
            <Statistic
              title="Rejected"
              value={stats.rejected || 0}
              prefix={<CloseCircleOutlined style={{ color: "#ff4d4f" }} />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card hoverable size="small">
            <Statistic
              title="This Year"
              value={stats.totalRequests || 0}
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
            key: "submit",
            label: (
              <span style={{ color: "#da2c46" }}>
                <PlusOutlined />
                {!mobileView && " Submit Request"}
              </span>
            ),
            children: (
              <EmployeeRaiseRequestForm
                onRequestSubmit={handleRequestSubmit}
                mobileView={mobileView}
                onTicketSubmit={handleTicketSubmit}
              />
            ),
          },
          {
            key: "history",
            label: (
              <span style={{ color: "#da2c46" }}>
                <HistoryOutlined />
                {!mobileView && " Request History"}
                <Badge
                  count={stats.pending || 0}
                  size="small"
                  style={{ marginLeft: 8 }}
                />
              </span>
            ),
            children: (
              <RequestHistory
                mobileView={mobileView}
                requests={requestHistoryData?.requests || []}
                pagination={requestHistoryData?.pagination}
                isLoading={isLoadingHistory}
                onRefresh={refetchRequestHistory}
                onTicketSubmit={handleTicketSubmit}
                onFiltersChange={handleFiltersChange}
              />
            ),
          },
        ]}
      />

      {mobileView && activeTab !== "submit" && (
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
            background: "#da2c46",
            border: "none",
          }}
          onClick={() => setActiveTab("submit")}
        />
      )}
    </div>
  );
};

export default EmployeeRaiseRequest;
