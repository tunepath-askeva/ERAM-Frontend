import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Modal,
  Form,
  Select,
  DatePicker,
  Tabs,
  Badge,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  message,
  Drawer,
  List,
  Divider,
  Statistic,
  Switch,
  InputNumber,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  MoreOutlined,
  CalendarOutlined,
  StarOutlined,
  StarFilled,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  MessageOutlined,
  PlusOutlined,
  DownloadOutlined,
  CloseOutlined,
  UploadOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  BankOutlined,
  IdcardOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const RecruiterPayroll = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollDrawerVisible, setPayrollDrawerVisible] = useState(false);
  const [addPaymentModalVisible, setAddPaymentModalVisible] = useState(false);
  const [processPayrollModalVisible, setProcessPayrollModalVisible] =
    useState(false);
  const [approveLeaveModalVisible, setApproveLeaveModalVisible] =
    useState(false);
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const [payrollForm] = Form.useForm();
  const [leaveForm] = Form.useForm();

  // Custom styles
  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const iconTextStyle = {
    color: "#da2c46",
  };

  // Mock employee payroll data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah.chen@company.com",
      position: "Senior Frontend Developer",
      department: "Engineering",
      status: "active",
      avatar: "https://via.placeholder.com/40x40/1890ff/ffffff?text=SC",
      salary: 120000,
      paymentMethod: "bank-transfer",
      bankAccount: "****1234",
      lastPaymentDate: "2024-05-31",
      nextPaymentDate: "2024-06-30",
      totalPaid: 120000,
      attendance: {
        present: 22,
        absent: 0,
        late: 1,
        leaveDays: 3,
      },
      leaves: [
        {
          id: 1,
          type: "sick",
          status: "approved",
          startDate: "2024-06-05",
          endDate: "2024-06-07",
          days: 3,
          reason: "Flu and fever",
        },
      ],
      starred: true,
    },
    {
      id: 2,
      name: "Marcus Johnson",
      email: "marcus.j@company.com",
      position: "Product Manager",
      department: "Product",
      status: "active",
      avatar: "https://via.placeholder.com/40x40/52c41a/ffffff?text=MJ",
      salary: 110000,
      paymentMethod: "bank-transfer",
      bankAccount: "****5678",
      lastPaymentDate: "2024-05-31",
      nextPaymentDate: "2024-06-30",
      totalPaid: 110000,
      attendance: {
        present: 20,
        absent: 2,
        late: 0,
        leaveDays: 0,
      },
      leaves: [],
      starred: false,
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      email: "emma.rodriguez@company.com",
      position: "UX Designer",
      department: "Design",
      status: "on-leave",
      avatar: "https://via.placeholder.com/40x40/722ed1/ffffff?text=ER",
      salary: 95000,
      paymentMethod: "bank-transfer",
      bankAccount: "****9012",
      lastPaymentDate: "2024-05-31",
      nextPaymentDate: "2024-06-30",
      totalPaid: 95000,
      attendance: {
        present: 18,
        absent: 0,
        late: 0,
        leaveDays: 7,
      },
      leaves: [
        {
          id: 2,
          type: "vacation",
          status: "approved",
          startDate: "2024-06-10",
          endDate: "2024-06-16",
          days: 7,
          reason: "Annual vacation",
        },
      ],
      starred: true,
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@company.com",
      position: "Backend Engineer",
      department: "Engineering",
      status: "active",
      avatar: "https://via.placeholder.com/40x40/fa8c16/ffffff?text=DK",
      salary: 90000,
      paymentMethod: "check",
      bankAccount: "N/A",
      lastPaymentDate: "2024-05-31",
      nextPaymentDate: "2024-06-30",
      totalPaid: 90000,
      attendance: {
        present: 21,
        absent: 1,
        late: 2,
        leaveDays: 1,
      },
      leaves: [
        {
          id: 3,
          type: "personal",
          status: "pending",
          startDate: "2024-06-20",
          endDate: "2024-06-20",
          days: 1,
          reason: "Family event",
        },
      ],
      starred: false,
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.thompson@company.com",
      position: "Data Scientist",
      department: "Data",
      status: "inactive",
      avatar: "https://via.placeholder.com/40x40/eb2f96/ffffff?text=LT",
      salary: 105000,
      paymentMethod: "bank-transfer",
      bankAccount: "****3456",
      lastPaymentDate: "2024-05-20",
      nextPaymentDate: "N/A",
      totalPaid: 105000,
      attendance: {
        present: 15,
        absent: 0,
        late: 0,
        leaveDays: 0,
      },
      leaves: [],
      starred: false,
    },
  ]);

  const [payrollHistory, setPayrollHistory] = useState([
    {
      id: 1,
      period: "May 2024",
      status: "completed",
      totalAmount: 520000,
      employeesPaid: 5,
      paymentDate: "2024-05-31",
    },
    {
      id: 2,
      period: "April 2024",
      status: "completed",
      totalAmount: 520000,
      employeesPaid: 5,
      paymentDate: "2024-04-30",
    },
    {
      id: 3,
      period: "March 2024",
      status: "completed",
      totalAmount: 520000,
      employeesPaid: 5,
      paymentDate: "2024-03-31",
    },
  ]);

  const statusConfig = {
    active: { color: "green", label: "Active" },
    "on-leave": { color: "orange", label: "On Leave" },
    inactive: { color: "red", label: "Inactive" },
  };

  const leaveStatusConfig = {
    approved: {
      color: "green",
      label: "Approved",
      icon: <CheckCircleOutlined />,
    },
    pending: {
      color: "orange",
      label: "Pending",
      icon: <ClockCircleOutlined />,
    },
    rejected: {
      color: "red",
      label: "Rejected",
      icon: <CloseCircleOutlined />,
    },
  };

  const leaveTypeConfig = {
    vacation: { color: "blue", label: "Vacation" },
    sick: { color: "purple", label: "Sick" },
    personal: { color: "cyan", label: "Personal" },
    maternity: { color: "pink", label: "Maternity" },
    paternity: { color: "geekblue", label: "Paternity" },
  };

  const paymentMethodConfig = {
    "bank-transfer": { label: "Bank Transfer", icon: <BankOutlined /> },
    check: { label: "Check", icon: <FileTextOutlined /> },
    cash: { label: "Cash", icon: <DollarOutlined /> },
  };

  const filterCounts = {
    all: employees.length,
    active: employees.filter((e) => e.status === "active").length,
    "on-leave": employees.filter((e) => e.status === "on-leave").length,
    inactive: employees.filter((e) => e.status === "inactive").length,
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesFilter =
      selectedStatus === "all" || employee.status === selectedStatus;
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
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

  const handleViewPayroll = (employee) => {
    setSelectedEmployee(employee);
    setPayrollDrawerVisible(true);
  };

  const handleAddPayment = (values) => {
    const newPayment = {
      amount: values.amount,
      date: values.date.format("YYYY-MM-DD"), // Format with dayjs
      method: values.method,
      notes: values.notes,
    };

    message.success(
      `Payment of $${values.amount} recorded for ${selectedEmployee.name}`
    );
    setAddPaymentModalVisible(false);
    paymentForm.resetFields();
  };

  const handleProcessPayroll = (values) => {
    // Format the date using dayjs
    const formattedDate = values.paymentDate.format("YYYY-MM-DD");

    const newPayroll = {
      id: payrollHistory.length + 1,
      period: values.period,
      status: "completed",
      totalAmount: employees.reduce((sum, emp) => sum + emp.salary, 0),
      employeesPaid: employees.length,
      paymentDate: formattedDate,
    };

    setPayrollHistory([newPayroll, ...payrollHistory]);
    message.success(`Payroll processed for ${values.period}`);
    setProcessPayrollModalVisible(false);
    payrollForm.resetFields();
  };

  const handleApproveLeave = (values) => {
    // In a real app, you would update the leave status here
    setEmployees(
      employees.map((employee) => {
        if (employee.id === selectedEmployee.id) {
          const updatedLeaves = employee.leaves.map((leave) => {
            if (leave.id === selectedLeave.id) {
              return { ...leave, status: values.status, notes: values.notes };
            }
            return leave;
          });
          return { ...employee, leaves: updatedLeaves };
        }
        return employee;
      })
    );
    message.success(`Leave request ${values.status}`);
    setApproveLeaveModalVisible(false);
    leaveForm.resetFields();
  };

  const getActionMenuItems = (employee) => [
    {
      key: "view",
      label: "View Payroll",
      icon: <EyeOutlined style={iconTextStyle} />,
      onClick: () => handleViewPayroll(employee),
    },
    {
      key: "add-payment",
      label: "Add Payment",
      icon: <PlusOutlined style={iconTextStyle} />,
      onClick: () => {
        setSelectedEmployee(employee);
        setAddPaymentModalVisible(true);
      },
    },
    { type: "divider" },
    {
      key: "process-payroll",
      label: "Process Payroll",
      icon: <DollarOutlined style={iconTextStyle} />,
      onClick: () => setProcessPayrollModalVisible(true),
    },
  ];

  const payrollColumns = [
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
                <EnvironmentOutlined style={iconTextStyle} />{" "}
                {record.department}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      responsive: ["sm"],
      render: (salary) => (
        <Text strong>
          <DollarOutlined /> {salary.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      responsive: ["lg"],
      render: (_, record) => (
        <div>
          <Text>
            <BankOutlined style={{ marginRight: 4 }} />
            {paymentMethodConfig[record.paymentMethod].label}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Last: {record.lastPaymentDate}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Next: {record.nextPaymentDate}
          </Text>
        </div>
      ),
    },
    {
      title: "Attendance",
      key: "attendance",
      responsive: ["lg"],
      render: (_, record) => (
        <div>
          <Space size={4}>
            <Tag color="green">
              <CheckCircleOutlined /> {record.attendance.present}
            </Tag>
            <Tag color="red">
              <CloseCircleOutlined /> {record.attendance.absent}
            </Tag>
            <Tag color="orange">
              <ClockCircleOutlined /> {record.attendance.late}
            </Tag>
          </Space>
          <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
            Leave days: {record.attendance.leaveDays}
          </Text>
        </div>
      ),
    },
    {
      title: "Leaves",
      key: "leaves",
      responsive: ["xl"],
      render: (_, record) => (
        <div>
          {record.leaves.length > 0 ? (
            record.leaves.slice(0, 2).map((leave) => (
              <Tag
                key={leave.id}
                color={leaveStatusConfig[leave.status].color}
                style={{ marginBottom: 4 }}
              >
                {leaveTypeConfig[leave.type].label}: {leave.startDate} -{" "}
                {leave.endDate}
              </Tag>
            ))
          ) : (
            <Text type="secondary">No leaves</Text>
          )}
          {record.leaves.length > 2 && (
            <Tag>+{record.leaves.length - 2} more</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Space size="small">
          <Tooltip title="View Payroll">
            <Button
              type="text"
              icon={<EyeOutlined style={iconTextStyle} />}
              size="small"
              onClick={() => handleViewPayroll(record)}
            />
          </Tooltip>
          <Tooltip title="Add Payment">
            <Button
              type="text"
              icon={<PlusOutlined style={iconTextStyle} />}
              size="small"
              onClick={() => {
                setSelectedEmployee(record);
                setAddPaymentModalVisible(true);
              }}
            />
          </Tooltip>
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined style={iconTextStyle} />}
              size="small"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const payrollHistoryColumns = [
    {
      title: "Payroll Period",
      dataIndex: "period",
      key: "period",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <Text strong>
          <DollarOutlined /> {amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: "Employees Paid",
      dataIndex: "employeesPaid",
      key: "employeesPaid",
      render: (count) => (
        <Text>
          <TeamOutlined /> {count}
        </Text>
      ),
    },
    {
      title: "Payment Date",
      dataIndex: "paymentDate",
      key: "paymentDate",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" icon={<DownloadOutlined />}>
          Download
        </Button>
      ),
    },
  ];

  const tabItems = Object.entries(filterCounts).map(([status, count]) => ({
    key: status,
    label: (
      <Badge count={count} size="small" offset={[10, 0]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    ),
  }));

  // Mobile card view for employees
  const EmployeeCard = ({ employee }) => (
    <Card
      size="small"
      style={{ marginBottom: 12 }}
      actions={[
        <EyeOutlined
          key="view"
          style={iconTextStyle}
          onClick={() => handleViewPayroll(employee)}
        />,
        <PlusOutlined
          key="add-payment"
          style={iconTextStyle}
          onClick={() => {
            setSelectedEmployee(employee);
            setAddPaymentModalVisible(true);
          }}
        />,
        <Dropdown
          menu={{ items: getActionMenuItems(employee) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <MoreOutlined style={iconTextStyle} />
        </Dropdown>,
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
          <div style={{ marginBottom: 8 }}>
            <Text strong>
              <DollarOutlined /> {employee.salary.toLocaleString()}
            </Text>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            <Tag color="green">
              <CheckCircleOutlined /> {employee.attendance.present}
            </Tag>
            <Tag color="red">
              <CloseCircleOutlined /> {employee.attendance.absent}
            </Tag>
            <Tag color="orange">
              <ClockCircleOutlined /> {employee.attendance.late}
            </Tag>
            <Tag>Leave: {employee.attendance.leaveDays}</Tag>
          </div>
          {employee.leaves.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Latest leave: {employee.leaves[0].startDate} -{" "}
                {employee.leaves[0].endDate}
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

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
              Payroll Management
            </Title>
            <Text type="secondary">
              Manage employee payroll, attendance, and leaves
            </Text>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <Space
              size="small"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              <Button icon={<DownloadOutlined />} size="large">
                Export
              </Button>
              <Button
                style={buttonStyle}
                icon={<DollarOutlined />}
                size="large"
                onClick={() => setProcessPayrollModalVisible(true)}
              >
                Process Payroll
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Search and Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={18}>
            <Input
              placeholder="Search employees, positions, or departments..."
              prefix={<SearchOutlined style={iconTextStyle} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="large"
            />
          </Col>
          <Col xs={24} md={6}>
            <Button
              icon={<FilterOutlined style={iconTextStyle} />}
              size="large"
              block
            >
              More Filters
            </Button>
          </Col>
        </Row>

        {/* Status Filter Tabs */}
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          <Tabs
            activeKey={selectedStatus}
            onChange={setSelectedStatus}
            items={tabItems}
            size="small"
            tabBarStyle={{ margin: 0 }}
          />
        </div>
      </Card>

      {/* Employees Payroll Table/Cards */}
      <Card style={{ marginBottom: 24 }}>
        {/* Desktop Table View */}
        <div
          className="desktop-view"
          style={{ display: window.innerWidth >= 768 ? "block" : "none" }}
        >
          <Table
            columns={payrollColumns}
            dataSource={filteredEmployees}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} employees`,
              responsive: true,
            }}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <TeamOutlined
                    style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                  />
                  <Title level={4} type="secondary">
                    No employees found
                  </Title>
                  <Text type="secondary">
                    Try adjusting your search or filters to find employees.
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
              <TeamOutlined
                style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
              />
              <Title level={4} type="secondary">
                No employees found
              </Title>
              <Text type="secondary">
                Try adjusting your search or filters to find employees.
              </Text>
            </div>
          )}
        </div>
      </Card>

      {/* Payroll History */}
      <Card>
        <Title level={4} style={{ marginBottom: 16 }}>
          Payroll History
        </Title>
        <Table
          columns={payrollHistoryColumns}
          dataSource={payrollHistory}
          rowKey="id"
          pagination={{ pageSize: 5 }}
          size="middle"
        />
      </Card>

      {/* Add Payment Modal */}
      <Modal
        title={`Add Payment for ${selectedEmployee?.name}`}
        open={addPaymentModalVisible}
        onCancel={() => {
          setAddPaymentModalVisible(false);
          paymentForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 600}
      >
        <Form
          form={paymentForm}
          layout="vertical"
          onFinish={handleAddPayment}
          initialValues={{
            method: "bank-transfer",
            date: dayjs(), // Use dayjs() here
          }}
        >
          <Form.Item
            label="Amount"
            name="amount"
            rules={[{ required: true, message: "Please enter amount" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label="Payment Date"
            name="date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Payment Method"
            name="method"
            rules={[{ required: true, message: "Please select method" }]}
          >
            <Select>
              <Option value="bank-transfer">Bank Transfer</Option>
              <Option value="check">Check</Option>
              <Option value="cash">Cash</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Additional notes..." />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setAddPaymentModalVisible(false);
                  paymentForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
                Record Payment
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Process Payroll Modal */}
      <Modal
        title="Process Payroll"
        open={processPayrollModalVisible}
        onCancel={() => {
          setProcessPayrollModalVisible(false);
          payrollForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 600}
      >
        <Form
          form={payrollForm}
          layout="vertical"
          onFinish={handleProcessPayroll}
          initialValues={{
            paymentDate: dayjs(), // Use dayjs() instead of string
          }}
        >
          <Form.Item
            label="Payroll Period"
            name="period"
            rules={[{ required: true, message: "Please enter period" }]}
          >
            <Input placeholder="e.g., June 2024" />
          </Form.Item>

          <Form.Item
            label="Payment Date"
            name="paymentDate"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} placeholder="Additional notes..." />
          </Form.Item>

          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ marginBottom: 8 }}>
              Payroll Summary
            </Title>
            <Row gutter={16}>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Employees"
                    value={employees.length}
                    prefix={<TeamOutlined />}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small">
                  <Statistic
                    title="Total Amount"
                    value={employees.reduce((sum, emp) => sum + emp.salary, 0)}
                    prefix={<DollarOutlined />}
                    formatter={(value) =>
                      value.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })
                    }
                  />
                </Card>
              </Col>
            </Row>
          </div>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setProcessPayrollModalVisible(false);
                  payrollForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
                Process Payroll
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Approve Leave Modal */}
      <Modal
        title="Review Leave Request"
        open={approveLeaveModalVisible}
        onCancel={() => {
          setApproveLeaveModalVisible(false);
          leaveForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 600}
      >
        <Form
          form={leaveForm}
          layout="vertical"
          onFinish={handleApproveLeave}
          initialValues={{
            status: "approved",
          }}
        >
          <Form.Item
            label="Status"
            name="status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select>
              <Option value="approved">Approve</Option>
              <Option value="rejected">Reject</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Reason for approval/rejection..."
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setApproveLeaveModalVisible(false);
                  leaveForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
                Submit Review
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Employee Payroll Drawer */}
      <Drawer
        title={`${selectedEmployee?.name}'s Payroll`}
        placement="right"
        width={window.innerWidth < 768 ? "100%" : 600}
        onClose={() => setPayrollDrawerVisible(false)}
        open={payrollDrawerVisible}
        extra={
          <Space>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                setPayrollDrawerVisible(false);
                setAddPaymentModalVisible(true);
              }}
            >
              Add Payment
            </Button>
          </Space>
        }
      >
        {selectedEmployee && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <Avatar src={selectedEmployee.avatar} size={64}>
                {selectedEmployee.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Avatar>
              <div style={{ marginLeft: 16 }}>
                <Title level={4} style={{ marginBottom: 0 }}>
                  {selectedEmployee.name}
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
                </Title>
                <Text type="secondary">{selectedEmployee.position}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color={statusConfig[selectedEmployee.status].color}>
                    {statusConfig[selectedEmployee.status].label}
                  </Tag>
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Payroll" key="1">
                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Salary Information</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Annual Salary</Text>
                      <br />
                      <Text>
                        <DollarOutlined />{" "}
                        {selectedEmployee.salary.toLocaleString()}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Payment Method</Text>
                      <br />
                      <Text>
                        {
                          paymentMethodConfig[selectedEmployee.paymentMethod]
                            .icon
                        }{" "}
                        {
                          paymentMethodConfig[selectedEmployee.paymentMethod]
                            .label
                        }
                      </Text>
                      {selectedEmployee.paymentMethod === "bank-transfer" && (
                        <Text type="secondary" style={{ display: "block" }}>
                          Account: {selectedEmployee.bankAccount}
                        </Text>
                      )}
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 12 }}>
                    <Col span={12}>
                      <Text strong>Last Payment</Text>
                      <br />
                      <Text>{selectedEmployee.lastPaymentDate}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Next Payment</Text>
                      <br />
                      <Text>{selectedEmployee.nextPaymentDate}</Text>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 12 }}>
                    <Col span={24}>
                      <Text strong>Total Paid</Text>
                      <br />
                      <Text>
                        <DollarOutlined />{" "}
                        {selectedEmployee.totalPaid.toLocaleString()}
                      </Text>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Recent Payments</Title>
                  <List
                    dataSource={[
                      {
                        date: selectedEmployee.lastPaymentDate,
                        amount: selectedEmployee.salary,
                        method: selectedEmployee.paymentMethod,
                      },
                      {
                        date: "2024-04-30",
                        amount: selectedEmployee.salary,
                        method: selectedEmployee.paymentMethod,
                      },
                      {
                        date: "2024-03-31",
                        amount: selectedEmployee.salary,
                        method: selectedEmployee.paymentMethod,
                      },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Text strong>
                              {new Date(item.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </Text>
                          }
                          description={
                            <Text>
                              {paymentMethodConfig[item.method].icon}{" "}
                              {paymentMethodConfig[item.method].label}
                            </Text>
                          }
                        />
                        <Text strong>
                          <DollarOutlined /> {item.amount.toLocaleString()}
                        </Text>
                      </List.Item>
                    )}
                  />
                </div>
              </TabPane>

              <TabPane tab="Attendance" key="2">
                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Attendance Summary</Title>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Present"
                          value={selectedEmployee.attendance.present}
                          prefix={<CheckCircleOutlined />}
                          valueStyle={{ color: "#52c41a" }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Absent"
                          value={selectedEmployee.attendance.absent}
                          prefix={<CloseCircleOutlined />}
                          valueStyle={{ color: "#f5222d" }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="Late"
                          value={selectedEmployee.attendance.late}
                          prefix={<ClockCircleOutlined />}
                          valueStyle={{ color: "#fa8c16" }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Recent Attendance</Title>
                  <List
                    dataSource={[
                      { date: "2024-06-17", status: "present" },
                      { date: "2024-06-14", status: "present" },
                      { date: "2024-06-13", status: "late" },
                      { date: "2024-06-12", status: "present" },
                      { date: "2024-06-11", status: "present" },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          title={
                            <Text strong>
                              {new Date(item.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </Text>
                          }
                        />
                        {item.status === "present" ? (
                          <Tag color="green" icon={<CheckCircleOutlined />}>
                            Present
                          </Tag>
                        ) : item.status === "absent" ? (
                          <Tag color="red" icon={<CloseCircleOutlined />}>
                            Absent
                          </Tag>
                        ) : (
                          <Tag color="orange" icon={<ClockCircleOutlined />}>
                            Late
                          </Tag>
                        )}
                      </List.Item>
                    )}
                  />
                </div>
              </TabPane>

              <TabPane tab="Leaves" key="3">
                <div style={{ marginBottom: 24 }}>
                  <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                  >
                    <Title level={5} style={{ marginBottom: 0 }}>
                      Leave History
                    </Title>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => {
                        setSelectedLeave({
                          id:
                            Math.max(
                              ...selectedEmployee.leaves.map((l) => l.id),
                              0
                            ) + 1,
                          type: "vacation",
                          status: "pending",
                          startDate: new Date().toISOString().split("T")[0],
                          endDate: new Date().toISOString().split("T")[0],
                          days: 1,
                          reason: "",
                        });
                        setApproveLeaveModalVisible(true);
                      }}
                    >
                      Add Leave
                    </Button>
                  </Space>
                </div>

                {selectedEmployee.leaves.length > 0 ? (
                  <List
                    dataSource={selectedEmployee.leaves}
                    renderItem={(leave) => (
                      <List.Item
                        actions={[
                          leave.status === "pending" && (
                            <Button
                              type="text"
                              size="small"
                              onClick={() => {
                                setSelectedLeave(leave);
                                setApproveLeaveModalVisible(true);
                              }}
                            >
                              Review
                            </Button>
                          ),
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={leaveStatusConfig[leave.status].icon}
                              style={{
                                backgroundColor: "#f0f0f0",
                                color: leaveStatusConfig[leave.status].color,
                              }}
                            />
                          }
                          title={
                            <Text strong>
                              {leaveTypeConfig[leave.type].label} Leave
                            </Text>
                          }
                          description={
                            <>
                              <Text>
                                {leave.startDate} to {leave.endDate} (
                                {leave.days} day{leave.days > 1 ? "s" : ""})
                              </Text>
                              <br />
                              <Text type="secondary">{leave.reason}</Text>
                            </>
                          }
                        />
                        <Tag color={leaveStatusConfig[leave.status].color}>
                          {leaveStatusConfig[leave.status].label}
                        </Tag>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <Text type="secondary">No leave records found</Text>
                  </div>
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RecruiterPayroll;
