import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Drawer,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  message,
  Spin,
  Alert,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  BankOutlined,
  CalendarOutlined,
  StarOutlined,
  StarFilled,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useGetBranchEmployessQuery } from "../../Slices/Recruiter/RecruiterApis";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text } = Typography;

const RecruiterEmployee = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDrawerVisible, setEmployeeDrawerVisible] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 700);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const { data, isLoading, error } = useGetBranchEmployessQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    search: debouncedSearchTerm,
  });

  useEffect(() => {
    if (data?.data) {
      const transformedEmployees = data.data.map((item) => ({
        id: item._id,
        name: item.fullName,
        email: item.email,
        phone: item.phone || "N/A",
        position: item.employmentDetails?.assignedJobTitle || "N/A",
        department: item.employmentDetails?.category || "N/A",
        location: "N/A",
        status: "active",
        employmentType: "full-time",
        manager: "N/A",
        hireDate: item.employmentDetails?.dateOfJoining
          ? new Date(item.employmentDetails.dateOfJoining).toLocaleDateString()
          : "N/A",
        salary: "N/A",
        skills: [],
        avatar: `https://via.placeholder.com/40x40/1890ff/ffffff?text=${item.fullName
          .split(" ")
          .map((n) => n[0])
          .join("")}`,
        lastActivity: new Date().toLocaleDateString(),
        starred: false,
        summary: item.employmentDetails?.basicAssets || "No summary provided.",
        performanceRating: 0,
        workOrderTitle: item.employmentDetails?.workorderId?.title || "N/A",
        eramId: item.employmentDetails?.eramId || "N/A",
        badgeNo: item.employmentDetails?.badgeNo || "N/A",
        aramcoId: item.employmentDetails?.aramcoId || "N/A",
        officialEmail: item.employmentDetails?.officialEmail || "N/A",
        otherId: item.employmentDetails?.otherId || "N/A",
        plantId: item.employmentDetails?.plantId || "N/A",
        gatePassId: item.employmentDetails?.gatePassId || "N/A",
        externalEmpNo: item.employmentDetails?.externalEmpNo || "N/A",
        designation: item.employmentDetails?.designation || "N/A",
        visaCategory: item.employmentDetails?.visaCategory || "N/A",
        employeeGroup: item.employmentDetails?.employeeGroup || "N/A",
        employeeType: item.employmentDetails?.employeeType || "N/A",
        payrollGroup: item.employmentDetails?.payrollGroup || "N/A",
        sponsorName: item.employmentDetails?.sponsorName || "N/A",
        workHours: item.employmentDetails?.workHours || "N/A",
        workDays: item.employmentDetails?.workDays || "N/A",
        airTicketFrequency: item.employmentDetails?.airTicketFrequency || "N/A",
        probationPeriod: item.employmentDetails?.probationPeriod || "N/A",
        periodOfContract: item.employmentDetails?.periodOfContract || "N/A",
        workLocation: item.employmentDetails?.workLocation || "N/A",
        familyStatus: item.employmentDetails?.familyStatus || "N/A",
        lastArrival: item.employmentDetails?.lastArrival
          ? new Date(item.employmentDetails.lastArrival).toLocaleDateString()
          : "N/A",
        iqamaIssueDate: item.employmentDetails?.iqamaIssueDate
          ? new Date(item.employmentDetails.iqamaIssueDate).toLocaleDateString()
          : "N/A",
        iqamaExpiryDate: item.employmentDetails?.iqamaExpiryDate
          ? new Date(
              item.employmentDetails.iqamaExpiryDate
            ).toLocaleDateString()
          : "N/A",
        iqamaArabicDateOfIssue: item.employmentDetails?.iqamaArabicDateOfIssue
          ? new Date(
              item.employmentDetails.iqamaArabicDateOfIssue
            ).toLocaleDateString()
          : "N/A",
        iqamaArabicDateOfExpiry: item.employmentDetails?.iqamaArabicDateOfExpiry
          ? new Date(
              item.employmentDetails.iqamaArabicDateOfExpiry
            ).toLocaleDateString()
          : "N/A",
        gosi: item.employmentDetails?.gosi || "N/A",
        drivingLicense: item.employmentDetails?.drivingLicense || "N/A",
        medicalPolicyNumber:
          item.employmentDetails?.medicalPolicyNumber || "N/A",
        medicalPolicy: item.employmentDetails?.medicalPolicy || false,
        noOfDependent: item.employmentDetails?.noOfDependent || "N/A",
        insuranceCategory: item.employmentDetails?.insuranceCategory || "N/A",
        classCode: item.employmentDetails?.classCode || "N/A",
        assetAllocation: item.employmentDetails?.assetAllocation || "N/A",
        lastWorkingDay: item.employmentDetails?.lastWorkingDay
          ? new Date(item.employmentDetails.lastWorkingDay).toLocaleDateString()
          : "N/A",
        lastLoginTime: item.employmentDetails?.lastLoginTime || "N/A",
        firstTimeLogin: item.employmentDetails?.firstTimeLogin || false,
      }));
      setEmployees(transformedEmployees);
      setPagination((prev) => ({
        ...prev,
        total: data.total || data.data.length,
      }));
    }
  }, [data]);

  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const iconTextStyle = {
    color: "#da2c46",
  };

  const statusConfig = {
    active: { color: "green", label: "Active" },
    "on-leave": { color: "orange", label: "On Leave" },
    inactive: { color: "red", label: "Inactive" },
  };

  const employmentTypeConfig = {
    "full-time": { color: "blue", label: "Full-time" },
    "part-time": { color: "purple", label: "Part-time" },
    contract: { color: "cyan", label: "Contract" },
    intern: { color: "gold", label: "Intern" },
  };

  const tablePagination = {
    ...pagination,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) =>
      `${range[0]}-${range[1]} of ${total} employees`,
    onChange: (page, pageSize) => {
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
      }));
    },
    onShowSizeChange: (current, size) => {
      setPagination((prev) => ({
        ...prev,
        current: 1,
        pageSize: size,
      }));
    },
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const toggleStar = (employeeId) => {
    setEmployees(
      employees.map((employee) =>
        employee.id === employeeId
          ? { ...employee, starred: !employee.starred }
          : employee
      )
    );
    message.success("Employee starred status updated!");
  };

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeDrawerVisible(true);
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "name",
      key: "name",
      responsive: ["md"],
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} size={40}>
            {record.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Text strong>{record.name}</Text>
              <Button
                type="text"
                size="small"
                icon={
                  record.starred ? (
                    <StarFilled style={{ color: "#faad14" }} />
                  ) : (
                    <StarOutlined />
                  )
                }
                onClick={() => toggleStar(record.id)}
              />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <MailOutlined style={iconTextStyle} /> {record.email}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <PhoneOutlined style={iconTextStyle} /> {record.phone}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      responsive: ["md"],
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      responsive: ["md"],
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Hire Date",
      dataIndex: "hireDate",
      key: "hireDate",
      responsive: ["lg"],
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusConfig[status].color}>
          {statusConfig[status].label}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="View Profile">
            <Button
              type="text"
              icon={<EyeOutlined style={iconTextStyle} />}
              size="small"
              onClick={() => handleViewProfile(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Mobile card view for employees
  const EmployeeCard = ({ employee }) => (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      actions={[
        <EyeOutlined
          key="view"
          style={iconTextStyle}
          onClick={() => handleViewProfile(employee)}
        />,
      ]}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar src={employee.avatar} size={48}>
          {employee.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text strong>{employee.name}</Text>
            <Button
              type="text"
              size="small"
              icon={
                employee.starred ? (
                  <StarFilled style={{ color: "#faad14" }} />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={() => toggleStar(employee.id)}
            />
          </div>
          <Text style={{ display: "block", marginBottom: 4 }}>
            {employee.position}
          </Text>
          <div style={{ marginBottom: 8 }}>
            <Tag color={statusConfig[employee.status].color} size="small">
              {statusConfig[employee.status].label}
            </Tag>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text>
              <BankOutlined style={{ marginRight: 4 }} /> {employee.department}
            </Text>
            <Text style={{ display: "block" }}>
              <CalendarOutlined style={{ marginRight: 4 }} />{" "}
              {employee.hireDate}
            </Text>
            <Text style={{ display: "block" }}>
              <MailOutlined style={{ marginRight: 4 }} /> {employee.email}
            </Text>
            <Text style={{ display: "block" }}>
              <PhoneOutlined style={{ marginRight: 4 }} /> {employee.phone}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div style={{ padding: "12px", textAlign: "center" }}>
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "12px", textAlign: "center" }}>
        <Alert
          message="Error"
          description="Failed to load employees. Please try again."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "12px",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
            <Title
              level={2}
              style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 2rem)" }}
            >
              Employees
            </Title>
            <Text type="secondary">View your organization's employees</Text>
          </Col>
        </Row>
      </Card>

      {/* Search */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24}>
            <Input
              allowClear
              placeholder="Search employees, positions, or departments..."
              prefix={<SearchOutlined style={iconTextStyle} />}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchQuery(e.target.value);
              }}
              size="large"
            />
          </Col>
        </Row>
      </Card>

      {/* Employees Table/Cards */}
      <Card>
        {/* Desktop Table View */}
        <div
          className="desktop-view"
          style={{ display: window.innerWidth >= 768 ? "block" : "none" }}
        >
          <Table
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="id"
            pagination={tablePagination}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <UsergroupAddOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <Title level={4} type="secondary">
                    No employees found
                  </Title>
                  <Text type="secondary">
                    Try adjusting your search to find employees.
                  </Text>
                </div>
              ),
            }}
          />
        </div>

        {/* Mobile Card View */}
        <div
          className="mobile-view"
          style={{ display: window.innerWidth < 768 ? "block" : "none" }}
        >
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <UsergroupAddOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Title level={4} type="secondary">
                No employees found
              </Title>
              <Text type="secondary">
                Try adjusting your search to find employees.
              </Text>
            </div>
          )}
        </div>
      </Card>

      {/* Employee Profile Drawer */}
      {/* Employee Profile Drawer */}
      <Drawer
        title={selectedEmployee?.name}
        placement="right"
        width={window.innerWidth < 768 ? "100%" : 700}
        onClose={() => setEmployeeDrawerVisible(false)}
        open={employeeDrawerVisible}
        extra={
          <Button
            type="primary"
            onClick={() => setEmployeeDrawerVisible(false)}
            style={{
              backgroundColor: "#da2c46",
              borderColor: "#da2c46",
            }}
          >
            Close
          </Button>
        }
      >
        {selectedEmployee && (
          <Spin spinning={false}>
            <div style={{ paddingBottom: 24 }}>
              {/* Header with Avatar and Basic Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: 24,
                  paddingBottom: 24,
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <Avatar src={selectedEmployee.avatar} size={80}>
                  {selectedEmployee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>
                <div style={{ marginLeft: 20, flex: 1 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <Title level={4} style={{ marginBottom: 4 }}>
                      {selectedEmployee.name}
                    </Title>
                    <Button
                      type="text"
                      icon={
                        selectedEmployee.starred ? (
                          <StarFilled style={{ color: "#faad14" }} />
                        ) : (
                          <StarOutlined />
                        )
                      }
                      onClick={() => toggleStar(selectedEmployee.id)}
                    />
                  </div>
                  <Text type="secondary">{selectedEmployee.position}</Text>
                  <div style={{ marginTop: 12 }}>
                    <Tag color={statusConfig[selectedEmployee.status].color}>
                      {statusConfig[selectedEmployee.status].label}
                    </Tag>
                    <Tag
                      color={
                        employmentTypeConfig[selectedEmployee.employmentType]
                          .color
                      }
                      style={{ marginLeft: 8 }}
                    >
                      {
                        employmentTypeConfig[selectedEmployee.employmentType]
                          .label
                      }
                    </Tag>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <Card
                size="small"
                title="Contact Information"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <MailOutlined style={{ color: "#da2c46" }} />
                      <div>
                        <Text strong>Email</Text>
                        <br />
                        <Text>{selectedEmployee.email}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <PhoneOutlined style={{ color: "#da2c46" }} />
                      <div>
                        <Text strong>Phone</Text>
                        <br />
                        <Text>{selectedEmployee.phone}</Text>
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <MailOutlined style={{ color: "#da2c46" }} />
                      <div>
                        <Text strong>Official Email</Text>
                        <br />
                        <Text>{selectedEmployee.officialEmail || "N/A"}</Text>
                      </div>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Employment Details */}
              <Card
                size="small"
                title="Employment Details"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Work Order</Text>
                      <br />
                      <Text>{selectedEmployee.workOrderTitle}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Department / Category</Text>
                      <br />
                      <Text>{selectedEmployee.department}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Assigned Job Title</Text>
                      <br />
                      <Text>{selectedEmployee.position}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Hire Date</Text>
                      <br />
                      <Text>{selectedEmployee.hireDate}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Designation</Text>
                      <br />
                      <Text>{selectedEmployee.designation || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Employee Group</Text>
                      <br />
                      <Text>{selectedEmployee.employeeGroup || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Employee Type</Text>
                      <br />
                      <Text>{selectedEmployee.employeeType || "N/A"}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* ID Information */}
              <Card
                size="small"
                title="ID Information"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>ERAM ID</Text>
                      <br />
                      <Text style={{ fontWeight: 500, color: "#da2c46" }}>
                        {selectedEmployee.eramId}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Badge Number</Text>
                      <br />
                      <Text>{selectedEmployee.badgeNo}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Aramco ID</Text>
                      <br />
                      <Text>{selectedEmployee.aramcoId}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Other ID</Text>
                      <br />
                      <Text>{selectedEmployee.otherId || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Plant ID</Text>
                      <br />
                      <Text>{selectedEmployee.plantId || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Gate Pass ID</Text>
                      <br />
                      <Text>{selectedEmployee.gatePassId || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>External Employee No</Text>
                      <br />
                      <Text>{selectedEmployee.externalEmpNo || "N/A"}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Contract & Work Details */}
              <Card
                size="small"
                title="Contract & Work Details"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Work Location</Text>
                      <br />
                      <Text>{selectedEmployee.workLocation || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Work Hours</Text>
                      <br />
                      <Text>{selectedEmployee.workHours || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Work Days</Text>
                      <br />
                      <Text>{selectedEmployee.workDays || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Period of Contract</Text>
                      <br />
                      <Text>{selectedEmployee.periodOfContract || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Probation Period</Text>
                      <br />
                      <Text>{selectedEmployee.probationPeriod || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Sponsor Name</Text>
                      <br />
                      <Text>{selectedEmployee.sponsorName || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Visa Category</Text>
                      <br />
                      <Text>{selectedEmployee.visaCategory || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Payroll Group</Text>
                      <br />
                      <Text>{selectedEmployee.payrollGroup || "N/A"}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Iqama Details */}
              {(selectedEmployee.iqamaIssueDate ||
                selectedEmployee.iqamaExpiryDate) && (
                <Card
                  size="small"
                  title="Iqama Details"
                  style={{ marginBottom: 16 }}
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Iqama Issue Date</Text>
                        <br />
                        <Text>{selectedEmployee.iqamaIssueDate || "N/A"}</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Iqama Expiry Date</Text>
                        <br />
                        <Text>{selectedEmployee.iqamaExpiryDate || "N/A"}</Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Iqama Arabic Issue Date</Text>
                        <br />
                        <Text>
                          {selectedEmployee.iqamaArabicDateOfIssue || "N/A"}
                        </Text>
                      </div>
                    </Col>
                    <Col xs={24} sm={12}>
                      <div>
                        <Text strong>Iqama Arabic Expiry Date</Text>
                        <br />
                        <Text>
                          {selectedEmployee.iqamaArabicDateOfExpiry || "N/A"}
                        </Text>
                      </div>
                    </Col>
                  </Row>
                </Card>
              )}

              {/* Insurance & Benefits */}
              <Card
                size="small"
                title="Insurance & Benefits"
                style={{ marginBottom: 16 }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>GOSI</Text>
                      <br />
                      <Text>{selectedEmployee.gosi || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Insurance Category</Text>
                      <br />
                      <Text>{selectedEmployee.insuranceCategory || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Medical Policy Number</Text>
                      <br />
                      <Text>
                        {selectedEmployee.medicalPolicyNumber || "N/A"}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Number of Dependents</Text>
                      <br />
                      <Text>{selectedEmployee.noOfDependent || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Air Ticket Frequency</Text>
                      <br />
                      <Text>
                        {selectedEmployee.airTicketFrequency || "N/A"}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Family Status</Text>
                      <br />
                      <Text>{selectedEmployee.familyStatus || "N/A"}</Text>
                    </div>
                  </Col>
                </Row>
              </Card>

              {/* Other Information */}
              <Card size="small" title="Other Information">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Last Arrival</Text>
                      <br />
                      <Text>{selectedEmployee.lastArrival || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Last Working Day</Text>
                      <br />
                      <Text>{selectedEmployee.lastWorkingDay || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>First Time Login</Text>
                      <br />
                      <Text>
                        {selectedEmployee.firstTimeLogin ? "Yes" : "No"}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <Text strong>Last Login Time</Text>
                      <br />
                      <Text>{selectedEmployee.lastLoginTime || "N/A"}</Text>
                    </div>
                  </Col>
                  <Col xs={24}>
                    <div>
                      <Text strong>Basic Assets Management</Text>
                      <br />
                      <Text style={{ whiteSpace: "pre-line" }}>
                        {selectedEmployee.summary || "No information provided"}
                      </Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </Spin>
        )}
      </Drawer>

      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
      `}</style>
    </div>
  );
};

export default RecruiterEmployee;
