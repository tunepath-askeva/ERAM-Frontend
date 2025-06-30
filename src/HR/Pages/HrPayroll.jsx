import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Avatar,
  Modal,
  Form,
  Select,
  DatePicker,
  Card,
  Row,
  Col,
  Statistic,
  Dropdown,
  message,
  Tooltip,
  Badge,
  Progress,
  Tabs,
  Divider,
  InputNumber,
  Switch,
  Typography,
  Alert,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  BankOutlined,
  CalendarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  CreditCardOutlined,
  WalletOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MoneyCollectOutlined,
  PercentageOutlined,
  CalculatorOutlined,
  PrinterOutlined,
  SendOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

const HrPayroll = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      employeeId: "EMP001",
      name: "Alice Johnson",
      email: "alice.johnson@company.com",
      phone: "+1 234 567 8900",
      position: "Senior Frontend Developer",
      department: "Engineering",
      baseSalary: 85000,
      hourlyRate: 45,
      employmentType: "Full-time",
      payFrequency: "Monthly",
      bankAccount: "****1234",
      taxId: "TX123456789",
      startDate: "2022-03-15",
      status: "Active",
      lastPayroll: dayjs().format("YYYY-MM-DD"),
      overtime: 8,
      bonus: 2000,
      deductions: 1200,
      netPay: 7850,
      ytdGross: 94200,
      ytdNet: 78650,
      allowances: ["Transport: $200", "Meal: $150"],
      benefits: ["Health Insurance", "Dental", "401k"],
      taxExemptions: 2,
      dependents: 1,
    },
    {
      id: 2,
      employeeId: "EMP002",
      name: "Bob Smith",
      email: "bob.smith@company.com",
      phone: "+1 234 567 8901",
      position: "Product Manager",
      department: "Product",
      baseSalary: 95000,
      hourlyRate: 52,
      employmentType: "Full-time",
      payFrequency: "Bi-weekly",
      bankAccount: "****5678",
      taxId: "TX987654321",
      startDate: "2021-08-20",
      status: "Active",
      lastPayroll: dayjs().format("YYYY-MM-DD"),
      overtime: 4,
      bonus: 3000,
      deductions: 1500,
      netPay: 8750,
      ytdGross: 105000,
      ytdNet: 87250,
      allowances: ["Transport: $300", "Phone: $100"],
      benefits: ["Health Insurance", "Dental", "Vision", "401k"],
      taxExemptions: 3,
      dependents: 2,
    },
    {
      id: 3,
      employeeId: "EMP003",
      name: "Carol Davis",
      email: "carol.davis@company.com",
      phone: "+1 234 567 8902",
      position: "UX Designer",
      department: "Design",
      baseSalary: 72000,
      hourlyRate: 38,
      employmentType: "Full-time",
      payFrequency: "Monthly",
      bankAccount: "****9012",
      taxId: "TX456789123",
      startDate: "2023-01-10",
      status: "Active",
      lastPayroll: dayjs().format("YYYY-MM-DD"),
      overtime: 6,
      bonus: 1000,
      deductions: 950,
      netPay: 6500,
      ytdGross: 78000,
      ytdNet: 65500,
      allowances: ["Transport: $150"],
      benefits: ["Health Insurance", "401k"],
      taxExemptions: 1,
      dependents: 0,
    },
    {
      id: 4,
      employeeId: "EMP004",
      name: "David Wilson",
      email: "david.wilson@company.com",
      phone: "+1 234 567 8903",
      position: "Backend Developer",
      department: "Engineering",
      baseSalary: 88000,
      hourlyRate: 47,
      employmentType: "Full-time",
      payFrequency: "Monthly",
      bankAccount: "****3456",
      taxId: "TX789123456",
      startDate: "2022-07-05",
      status: "On Leave",
      lastPayroll: dayjs().subtract(1, 'month').format("YYYY-MM-DD"),
      overtime: 12,
      bonus: 2500,
      deductions: 1300,
      netPay: 8200,
      ytdGross: 98400,
      ytdNet: 82000,
      allowances: ["Transport: $200", "Meal: $150", "Internet: $75"],
      benefits: ["Health Insurance", "Dental", "401k", "Life Insurance"],
      taxExemptions: 2,
      dependents: 1,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isPayrollModalVisible, setIsPayrollModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [processingPayroll, setProcessingPayroll] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();
  const [payrollForm] = Form.useForm();

  const primaryColor = "#da2461";

  const departments = [
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
    "HR",
    "Finance",
  ];
  const employmentTypes = ["Full-time", "Part-time", "Contract", "Intern"];
  const payFrequencies = ["Weekly", "Bi-weekly", "Monthly", "Quarterly"];
  const statuses = ["Active", "Inactive", "On Leave", "Terminated"];

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Inactive":
        return "default";
      case "On Leave":
        return "warning";
      case "Terminated":
        return "error";
      default:
        return "default";
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      Engineering: "blue",
      Product: "purple",
      Design: "pink",
      Marketing: "orange",
      Sales: "green",
      HR: "cyan",
      Finance: "gold",
    };
    return colors[department] || "default";
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchText.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchText.toLowerCase());
    const matchesDepartment =
      filterDepartment === "all" || employee.department === filterDepartment;
    const matchesStatus =
      filterStatus === "all" || employee.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      ...employee,
      startDate: employee.startDate ? dayjs(employee.startDate) : null,
    });
    setIsModalVisible(true);
  };

  const handleViewEmployee = (employee) => {
    setViewingEmployee(employee);
    setIsViewModalVisible(true);
  };

  const handleProcessPayroll = (employee) => {
    setProcessingPayroll(employee);
    payrollForm.setFieldsValue({
      employeeId: employee.employeeId,
      employeeName: employee.name,
      baseSalary: employee.baseSalary,
      overtime: 0,
      bonus: 0,
      deductions: 0,
      payPeriod: dayjs().format("YYYY-MM"),
    });
    setIsPayrollModalVisible(true);
  };

  const handleDeleteEmployee = (employeeId) => {
    Modal.confirm({
      title: "Delete Employee",
      content: "Are you sure you want to delete this employee from payroll?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        setEmployees(
          employees.filter((employee) => employee.id !== employeeId)
        );
        message.success("Employee deleted successfully");
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingEmployee) {
        setEmployees(
          employees.map((employee) =>
            employee.id === editingEmployee.id
              ? {
                  ...employee,
                  ...values,
                  startDate: values.startDate?.format("YYYY-MM-DD"),
                }
              : employee
          )
        );
        message.success("Employee updated successfully");
      } else {
        const newEmployee = {
          id: Date.now(),
          employeeId: `EMP${String(employees.length + 1).padStart(3, "0")}`,
          ...values,
          startDate: values.startDate?.format("YYYY-MM-DD"),
          status: "Active",
          lastPayroll: null,
          overtime: 0,
          bonus: 0,
          deductions: 0,
          netPay: 0,
          ytdGross: 0,
          ytdNet: 0,
          allowances: [],
          benefits: [],
          taxExemptions: 0,
          dependents: 0,
        };
        setEmployees([...employees, newEmployee]);
        message.success("Employee added successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handlePayrollSubmit = () => {
    payrollForm.validateFields().then((values) => {
      const grossPay =
        values.baseSalary +
        values.overtime * processingPayroll.hourlyRate +
        values.bonus;
      const netPay = grossPay - values.deductions;

      setEmployees(
        employees.map((employee) =>
          employee.id === processingPayroll.id
            ? {
                ...employee,
                lastPayroll: dayjs().format("YYYY-MM-DD"),
                overtime: values.overtime,
                bonus: values.bonus,
                deductions: values.deductions,
                netPay: netPay,
                ytdGross: employee.ytdGross + grossPay,
                ytdNet: employee.ytdNet + netPay,
              }
            : employee
        )
      );

      message.success("Payroll processed successfully");
      setIsPayrollModalVisible(false);
      payrollForm.resetFields();
    });
  };

  const actionMenuItems = (employee) => [
    {
      key: "view",
      label: "View Details",
      icon: <EyeOutlined />,
      onClick: () => handleViewEmployee(employee),
    },
    {
      key: "edit",
      label: "Edit Employee",
      icon: <EditOutlined />,
      onClick: () => handleEditEmployee(employee),
    },
    {
      key: "payroll",
      label: "Process Payroll",
      icon: <DollarOutlined />,
      onClick: () => handleProcessPayroll(employee),
    },
    {
      key: "payslip",
      label: "Generate Payslip",
      icon: <FileTextOutlined />,
      onClick: () => message.info("Payslip generated"),
    },
    {
      key: "delete",
      label: "Delete Employee",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteEmployee(employee.id),
    },
  ];

  const columns = [
    {
      title: "Employee",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text, record) => (
        <Space>
          <Avatar
            style={{ backgroundColor: primaryColor, color: "white" }}
            icon={<UserOutlined />}
          />
          <div>
            <div style={{ fontWeight: 600, color: "#262626" }}>{text}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.employeeId} • {record.position}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department) => (
        <Tag color={getDepartmentColor(department)} style={{ fontWeight: 500 }}>
          {department}
        </Tag>
      ),
    },
    {
      title: "Base Salary",
      dataIndex: "baseSalary",
      key: "baseSalary",
      render: (salary) => (
        <div style={{ fontWeight: 600, color: primaryColor }}>
          ${salary?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "Employment",
      dataIndex: "employmentType",
      key: "employmentType",
      render: (type, record) => (
        <div>
          <div>{type}</div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.payFrequency}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 500 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Last Payroll",
      dataIndex: "lastPayroll",
      key: "lastPayroll",
      render: (date) => (
        <div>{date ? dayjs(date).format("MMM DD, YYYY") : "Not processed"}</div>
      ),
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "netPay",
      render: (netPay) => (
        <div style={{ fontWeight: 600, color: "#52c41a" }}>
          ${netPay?.toLocaleString()}
        </div>
      ),
    },
    {
      title: "YTD Gross",
      dataIndex: "ytdGross",
      key: "ytdGross",
      render: (ytdGross) => (
        <div style={{ fontWeight: 500 }}>${ytdGross?.toLocaleString()}</div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<DollarOutlined />}
            onClick={() => handleProcessPayroll(record)}
            style={{ borderColor: primaryColor, color: primaryColor }}
          >
            Payroll
          </Button>
          <Dropdown
            menu={{ items: actionMenuItems(record) }}
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{ color: primaryColor }}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter((e) => e.status === "Active").length,
    totalPayroll: employees.reduce((sum, e) => sum + (e.netPay || 0), 0),
    avgSalary:
      employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0) /
      employees.length,
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <Title
          level={2}
          style={{
            margin: 0,
            background: `linear-gradient(135deg, ${primaryColor} 0%, #764ba2 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontSize: "32px",
            fontWeight: "bold",
          }}
        >
          💰 Payroll Management
        </Title>
        <Text type="secondary" style={{ fontSize: "16px" }}>
          Manage employee payroll, salaries, and compensation
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #764ba2 100%)`,
              border: "none",
              borderRadius: "16px",
              color: "white",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Total Employees
                </span>
              }
              value={stats.totalEmployees}
              prefix={<TeamOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              border: "none",
              borderRadius: "16px",
              color: "white",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Active Employees
                </span>
              }
              value={stats.activeEmployees}
              prefix={<CheckCircleOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              border: "none",
              borderRadius: "16px",
              color: "white",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Total Payroll
                </span>
              }
              value={stats.totalPayroll}
              prefix="$"
              suffix={<DollarOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontWeight: "bold" }}
              precision={0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            style={{
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              border: "none",
              borderRadius: "16px",
              color: "white",
            }}
            bodyStyle={{ padding: "24px" }}
          >
            <Statistic
              title={
                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                  Avg Salary
                </span>
              }
              value={stats.avgSalary}
              prefix="$"
              suffix={<TrophyOutlined style={{ color: "white" }} />}
              valueStyle={{ color: "white", fontWeight: "bold" }}
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search employees..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: "100%" }}
              size="large"
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Department"
              value={filterDepartment}
              onChange={setFilterDepartment}
              style={{ width: "100%" }}
              size="large"
            >
              <Option value="all">All Departments</Option>
              {departments.map((dept) => (
                <Option key={dept} value={dept}>
                  {dept}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: "100%" }}
              size="large"
            >
              <Option value="all">All Status</Option>
              {statuses.map((status) => (
                <Option key={status} value={status}>
                  {status}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                icon={<DownloadOutlined />}
                size="large"
                onClick={() => message.success("Payroll report exported")}
              >
                Export Report
              </Button>
              <Button
                icon={<PrinterOutlined />}
                size="large"
                onClick={() => message.success("Payslips generated")}
              >
                Print Payslips
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddEmployee}
                size="large"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, #764ba2 100%)`,
                  border: "none",
                  borderRadius: "8px",
                }}
              >
                Add Employee
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Employees Table */}
      <Card
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
        bodyStyle={{ padding: "0" }}
      >
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          pagination={{
            total: filteredEmployees.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} employees`,
            style: { padding: "16px 24px" },
          }}
          scroll={{ x: 1200 }}
          style={{ borderRadius: "16px" }}
        />
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal
        title={
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            {editingEmployee ? "✏️ Edit Employee" : "➕ Add New Employee"}
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText={editingEmployee ? "Update Employee" : "Add Employee"}
        style={{ top: 20 }}
        okButtonProps={{ style: { background: primaryColor, borderColor: primaryColor } }}
      >
        <div style={{ marginTop: "20px" }}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[
                    { required: true, message: "Please enter employee name" },
                  ]}
                >
                  <Input placeholder="Enter full name" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="Enter email address" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: "Please enter phone number" },
                  ]}
                >
                  <Input placeholder="Enter phone number" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="position"
                  label="Position"
                  rules={[{ required: true, message: "Please enter position" }]}
                >
                  <Input placeholder="Enter position" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="department"
                  label="Department"
                  rules={[
                    { required: true, message: "Please select department" },
                  ]}
                >
                  <Select placeholder="Select department" size="large">
                    {departments.map((dept) => (
                      <Option key={dept} value={dept}>
                        {dept}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="employmentType"
                  label="Employment Type"
                  rules={[
                    {
                      required: true,
                      message: "Please select employment type",
                    },
                  ]}
                >
                  <Select placeholder="Select employment type" size="large">
                    {employmentTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="baseSalary"
                  label="Base Salary"
                  rules={[
                    { required: true, message: "Please enter base salary" },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter base salary"
                    style={{ width: "100%" }}
                    size="large"
                    formatter={(value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="hourlyRate"
                  label="Hourly Rate"
                  rules={[
                    { required: true, message: "Please enter hourly rate" },
                  ]}
                >
                  <InputNumber
                    placeholder="Enter hourly rate"
                    style={{ width: "100%" }}
                    size="large"
                    formatter={(value) => `$ ${value}`}
                    parser={(value) => value.replace(/\$\s?/g, "")}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="payFrequency"
                  label="Pay Frequency"
                  rules={[
                    { required: true, message: "Please select pay frequency" },
                  ]}
                >
                  <Select placeholder="Select pay frequency" size="large">
                    {payFrequencies.map((freq) => (
                      <Option key={freq} value={freq}>
                        {freq}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[
                    { required: true, message: "Please select start date" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select start date"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="bankAccount"
                  label="Bank Account"
                  rules={[
                    { required: true, message: "Please enter bank account" },
                  ]}
                >
                  <Input placeholder="Enter bank account number" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="taxId"
                  label="Tax ID"
                  rules={[{ required: true, message: "Please enter tax ID" }]}
                >
                  <Input
                    placeholder="Enter tax identification number"
                    size="large"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        title={
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            👤 Employee Details
          </div>
        }
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        width={800}
        footer={null}
        style={{ top: 20 }}
      >
        {viewingEmployee && (
          <div style={{ marginTop: "20px" }}>
            <Row gutter={24}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <Avatar
                    size={120}
                    style={{
                      backgroundColor: primaryColor,
                      color: "white",
                      fontSize: "48px",
                      marginBottom: "16px",
                    }}
                    icon={<UserOutlined />}
                  />
                  <Title level={4} style={{ marginBottom: "4px" }}>
                    {viewingEmployee.name}
                  </Title>
                  <Text type="secondary">{viewingEmployee.position}</Text>
                </div>
              </Col>
              <Col span={16}>
                <Tabs defaultActiveKey="1">
                  <TabPane tab="Basic Info" key="1">
                    <Row gutter={16} style={{ marginBottom: "16px" }}>
                      <Col span={12}>
                        <Text strong>Employee ID:</Text>
                        <div>{viewingEmployee.employeeId}</div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Department:</Text>
                        <div>
                          <Tag
                            color={getDepartmentColor(
                              viewingEmployee.department
                            )}
                          >
                            {viewingEmployee.department}
                          </Tag>
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: "16px" }}>
                      <Col span={12}>
                        <Text strong>Email:</Text>
                        <div>{viewingEmployee.email}</div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Phone:</Text>
                        <div>{viewingEmployee.phone}</div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: "16px" }}>
                      <Col span={12}>
                        <Text strong>Employment Type:</Text>
                        <div>{viewingEmployee.employmentType}</div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Pay Frequency:</Text>
                        <div>{viewingEmployee.payFrequency}</div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: "16px" }}>
                      <Col span={12}>
                        <Text strong>Start Date:</Text>
                        <div>
                          {dayjs(viewingEmployee.startDate).format(
                            "MMMM D, YYYY"
                          )}
                        </div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Status:</Text>
                        <div>
                          <Tag color={getStatusColor(viewingEmployee.status)}>
                            {viewingEmployee.status}
                          </Tag>
                        </div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="Payroll Info" key="2">
                    <Row gutter={16} style={{ marginBottom: "16px" }}>
                      <Col span={12}>
                        <Text strong>Base Salary:</Text>
                        <div>
                          ${viewingEmployee.baseSalary?.toLocaleString()}
                        </div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Hourly Rate:</Text>
                        <div>${viewingEmployee.hourlyRate}</div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: "16px" }}>
                      <Col span={12}>
                        <Text strong>Bank Account:</Text>
                        <div>{viewingEmployee.bankAccount}</div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Tax ID:</Text>
                        <div>{viewingEmployee.taxId}</div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginBottom: "16px" }}>
                      <Col span={12}>
                        <Text strong>Tax Exemptions:</Text>
                        <div>{viewingEmployee.taxExemptions}</div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Dependents:</Text>
                        <div>{viewingEmployee.dependents}</div>
                      </Col>
                    </Row>
                    <Divider />
                    <Row gutter={16}>
                      <Col span={12}>
                        <Text strong>Last Payroll Date:</Text>
                        <div>
                          {viewingEmployee.lastPayroll
                            ? dayjs(viewingEmployee.lastPayroll).format(
                                "MMMM D, YYYY"
                              )
                            : "Not processed"}
                        </div>
                      </Col>
                      <Col span={12}>
                        <Text strong>Net Pay:</Text>
                        <div style={{ color: "#52c41a", fontWeight: "bold" }}>
                          ${viewingEmployee.netPay?.toLocaleString()}
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={16} style={{ marginTop: "16px" }}>
                      <Col span={12}>
                        <Text strong>YTD Gross:</Text>
                        <div>${viewingEmployee.ytdGross?.toLocaleString()}</div>
                      </Col>
                      <Col span={12}>
                        <Text strong>YTD Net:</Text>
                        <div>${viewingEmployee.ytdNet?.toLocaleString()}</div>
                      </Col>
                    </Row>
                  </TabPane>
                  <TabPane tab="Benefits" key="3">
                    <Text strong>Allowances:</Text>
                    <div style={{ marginBottom: "16px" }}>
                      {viewingEmployee.allowances.length > 0 ? (
                        viewingEmployee.allowances.map((allowance, index) => (
                          <Tag
                            key={index}
                            color="blue"
                            style={{ marginBottom: "8px" }}
                          >
                            {allowance}
                          </Tag>
                        ))
                      ) : (
                        <Text type="secondary">No allowances</Text>
                      )}
                    </div>
                    <Text strong>Benefits:</Text>
                    <div>
                      {viewingEmployee.benefits.length > 0 ? (
                        viewingEmployee.benefits.map((benefit, index) => (
                          <Tag
                            key={index}
                            color="green"
                            style={{ marginBottom: "8px" }}
                          >
                            {benefit}
                          </Tag>
                        ))
                      ) : (
                        <Text type="secondary">No benefits</Text>
                      )}
                    </div>
                  </TabPane>
                </Tabs>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Process Payroll Modal */}
      <Modal
        title={
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
            💰 Process Payroll
          </div>
        }
        open={isPayrollModalVisible}
        onOk={handlePayrollSubmit}
        onCancel={() => setIsPayrollModalVisible(false)}
        width={700}
        okText="Process Payroll"
        style={{ top: 20 }}
        okButtonProps={{ style: { background: primaryColor, borderColor: primaryColor } }}
      >
        {processingPayroll && (
          <div style={{ marginTop: "20px" }}>
            <Form form={payrollForm} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="employeeId" label="Employee ID">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="employeeName" label="Employee Name">
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="baseSalary" label="Base Salary">
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="payPeriod"
                    label="Pay Period"
                    rules={[
                      { required: true, message: "Please select pay period" },
                    ]}
                  >
                    <DatePicker
                      picker="month"
                      style={{ width: "100%" }}
                      disabledDate={(current) =>
                        current && current > dayjs().endOf("day")
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Additional Earnings</Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="overtime"
                    label="Overtime Hours"
                    initialValue={0}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      precision={1}
                      step={0.5}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="bonus" label="Bonus Amount" initialValue={0}>
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Deductions</Divider>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="deductions"
                    label="Total Deductions"
                    initialValue={0}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      formatter={(value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                      min={0}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Summary</Divider>

              <Alert
                message="Payroll Calculation"
                type="info"
                showIcon
                style={{ marginBottom: "16px" }}
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Card
                    size="small"
                    title="Gross Pay"
                    style={{ textAlign: "center" }}
                  >
                    <Statistic
                      value={
                        processingPayroll.baseSalary +
                        (payrollForm.getFieldValue("overtime") || 0) *
                          processingPayroll.hourlyRate +
                        (payrollForm.getFieldValue("bonus") || 0)
                      }
                      prefix="$"
                      precision={2}
                      valueStyle={{ color: primaryColor }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    title="Net Pay"
                    style={{ textAlign: "center" }}
                  >
                    <Statistic
                      value={
                        processingPayroll.baseSalary +
                        (payrollForm.getFieldValue("overtime") || 0) *
                          processingPayroll.hourlyRate +
                        (payrollForm.getFieldValue("bonus") || 0) -
                        (payrollForm.getFieldValue("deductions") || 0)
                      }
                      prefix="$"
                      precision={2}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
              </Row>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HrPayroll;