import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Tag,
  Avatar,
  Rate,
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
  Upload,
  Switch,
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
  InboxOutlined,
  TeamOutlined,
  IdcardOutlined,
  BankOutlined,
  DollarOutlined,
  SettingOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Dragger } = Upload;

const RecruiterEmployee = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDrawerVisible, setEmployeeDrawerVisible] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [addEmployeeModalVisible, setAddEmployeeModalVisible] = useState(false);
  const [editEmployeeModalVisible, setEditEmployeeModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [messageForm] = Form.useForm();
  const [addEmployeeForm] = Form.useForm();
  const [editEmployeeForm] = Form.useForm();

  // Custom styles
  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const iconTextStyle = {
    color: "#da2c46",
  };

  // Mock employee data
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Sarah Chen",
      email: "sarah.chen@company.com",
      phone: "+1 (555) 123-4567",
      position: "Senior Frontend Developer",
      department: "Engineering",
      location: "San Francisco, CA",
      status: "active",
      employmentType: "full-time",
      manager: "John Smith",
      hireDate: "2023-05-15",
      salary: "$120,000",
      skills: ["React", "TypeScript", "Node.js"],
      avatar: "https://via.placeholder.com/40x40/1890ff/ffffff?text=SC",
      lastActivity: "2 hours ago",
      starred: true,
      summary: "Experienced frontend developer with strong React expertise.",
      documents: [
        { name: "Employment_Contract.pdf", type: "contract" },
        { name: "NDA_Agreement.pdf", type: "nda" },
      ],
      performanceRating: 4.5,
      isAdmin: false,
    },
    {
      id: 2,
      name: "Marcus Johnson",
      email: "marcus.j@company.com",
      phone: "+1 (555) 987-6543",
      position: "Product Manager",
      department: "Product",
      location: "New York, NY",
      status: "active",
      employmentType: "full-time",
      manager: "Lisa Wong",
      hireDate: "2022-11-10",
      salary: "$110,000",
      skills: ["Product Strategy", "Analytics", "Agile"],
      avatar: "https://via.placeholder.com/40x40/52c41a/ffffff?text=MJ",
      lastActivity: "1 day ago",
      starred: false,
      summary: "Senior product manager with extensive experience in B2B SaaS.",
      documents: [
        { name: "Employment_Contract.pdf", type: "contract" },
        { name: "Stock_Options.pdf", type: "stock" },
      ],
      performanceRating: 4.2,
      isAdmin: true,
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      email: "emma.rodriguez@company.com",
      phone: "+1 (555) 456-7890",
      position: "UX Designer",
      department: "Design",
      location: "Austin, TX",
      status: "on-leave",
      employmentType: "full-time",
      manager: "Sarah Johnson",
      hireDate: "2023-08-22",
      salary: "$95,000",
      skills: ["Figma", "User Research", "Prototyping"],
      avatar: "https://via.placeholder.com/40x40/722ed1/ffffff?text=ER",
      lastActivity: "30 minutes ago",
      starred: true,
      summary: "Creative UX designer with strong user research background.",
      documents: [
        { name: "Employment_Contract.pdf", type: "contract" },
        { name: "Leave_Request.pdf", type: "leave" },
      ],
      performanceRating: 4.7,
      isAdmin: false,
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@company.com",
      phone: "+1 (555) 321-0987",
      position: "Backend Engineer",
      department: "Engineering",
      location: "Seattle, WA",
      status: "active",
      employmentType: "contract",
      manager: "John Smith",
      hireDate: "2024-01-05",
      salary: "$90/hour",
      skills: ["Python", "Django", "PostgreSQL"],
      avatar: "https://via.placeholder.com/40x40/fa8c16/ffffff?text=DK",
      lastActivity: "3 days ago",
      starred: false,
      summary: "Backend developer with Python expertise.",
      documents: [
        { name: "Contract_Agreement.pdf", type: "contract" },
        { name: "Confidentiality_Agreement.pdf", type: "nda" },
      ],
      performanceRating: 3.8,
      isAdmin: false,
    },
    {
      id: 5,
      name: "Lisa Thompson",
      email: "lisa.thompson@company.com",
      phone: "+1 (555) 654-3210",
      position: "Data Scientist",
      department: "Data",
      location: "Boston, MA",
      status: "inactive",
      employmentType: "full-time",
      manager: "Mike Brown",
      hireDate: "2021-09-18",
      terminationDate: "2024-05-20",
      salary: "$105,000",
      skills: ["Python", "Machine Learning", "SQL"],
      avatar: "https://via.placeholder.com/40x40/eb2f96/ffffff?text=LT",
      lastActivity: "2 weeks ago",
      starred: false,
      summary: "Data scientist with strong ML background.",
      documents: [
        { name: "Employment_Contract.pdf", type: "contract" },
        { name: "Termination_Letter.pdf", type: "termination" },
      ],
      performanceRating: 4.1,
      isAdmin: false,
    },
  ]);

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
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const updateEmployeeStatus = (employeeId, newStatus) => {
    setEmployees(
      employees.map((employee) =>
        employee.id === employeeId
          ? { ...employee, status: newStatus }
          : employee
      )
    );
    message.success(`Employee status updated to ${newStatus}`);
  };

  const handleViewProfile = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeDrawerVisible(true);
  };

  const handleSendMessage = (employee) => {
    setSelectedEmployee(employee);
    setMessageModalVisible(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    editEmployeeForm.setFieldsValue({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      location: employee.location,
      status: employee.status,
      employmentType: employee.employmentType,
      manager: employee.manager,
      hireDate: employee.hireDate,
      salary: employee.salary,
      skills: employee.skills,
      summary: employee.summary,
      isAdmin: employee.isAdmin,
    });
    setEditEmployeeModalVisible(true);
  };

  const handleAddEmployee = (values) => {
    const newEmployee = {
      id: employees.length + 1,
      name: values.name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      department: values.department,
      location: values.location,
      status: values.status || "active",
      employmentType: values.employmentType || "full-time",
      manager: values.manager || "",
      hireDate: values.hireDate || new Date().toISOString().split("T")[0],
      salary: values.salary || "",
      skills: values.skills || [],
      avatar: `https://via.placeholder.com/40x40/1890ff/ffffff?text=${values.name
        .split(" ")
        .map((n) => n[0])
        .join("")}`,
      lastActivity: "Just now",
      starred: false,
      summary: values.summary || "No summary provided.",
      documents: [],
      performanceRating: 0,
      isAdmin: values.isAdmin || false,
    };

    setEmployees([newEmployee, ...employees]);
    setAddEmployeeModalVisible(false);
    addEmployeeForm.resetFields();
    message.success(`${values.name} has been added successfully!`);
  };

  const handleEditEmployeeSubmit = (values) => {
    setEmployees(
      employees.map((employee) =>
        employee.id === selectedEmployee.id
          ? {
              ...employee,
              name: values.name,
              email: values.email,
              phone: values.phone,
              position: values.position,
              department: values.department,
              location: values.location,
              status: values.status,
              employmentType: values.employmentType,
              manager: values.manager,
              hireDate: values.hireDate,
              salary: values.salary,
              skills: values.skills,
              summary: values.summary,
              isAdmin: values.isAdmin,
            }
          : employee
      )
    );
    setEditEmployeeModalVisible(false);
    editEmployeeForm.resetFields();
    message.success(`${values.name}'s profile has been updated!`);
  };

  const getActionMenuItems = (employee) => [
    {
      key: "view",
      label: "View Profile",
      icon: <EyeOutlined style={iconTextStyle} />,
      onClick: () => handleViewProfile(employee),
    },
    {
      key: "message",
      label: "Send Message",
      icon: <MessageOutlined style={iconTextStyle} />,
      onClick: () => handleSendMessage(employee),
    },
    {
      key: "edit",
      label: "Edit Profile",
      icon: <EditOutlined style={iconTextStyle} />,
      onClick: () => handleEditEmployee(employee),
    },
    { type: "divider" },
    {
      key: "activate",
      label: "Activate",
      onClick: () => updateEmployeeStatus(employee.id, "active"),
      disabled: employee.status === "active",
    },
    {
      key: "leave",
      label: "Mark as On Leave",
      onClick: () => updateEmployeeStatus(employee.id, "on-leave"),
      disabled: employee.status === "on-leave",
    },
    {
      key: "deactivate",
      label: "Deactivate",
      danger: true,
      onClick: () => updateEmployeeStatus(employee.id, "inactive"),
      disabled: employee.status === "inactive",
    },
  ];

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
              {record.isAdmin && (
                <Tag color="red" style={{ fontSize: 10, padding: "0 4px" }}>
                  Admin
                </Tag>
              )}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <MailOutlined style={iconTextStyle} /> {record.email}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <EnvironmentOutlined style={iconTextStyle} /> {record.location}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Position & Department",
      dataIndex: "position",
      key: "position",
      responsive: ["lg"],
      render: (text, record) => (
        <div>
          <Text strong>{record.position}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            <BankOutlined style={{ marginRight: 4 }} /> {record.department}
          </Text>
          <div style={{ marginTop: 8 }}>
            <Tag color={employmentTypeConfig[record.employmentType].color}>
              {employmentTypeConfig[record.employmentType].label}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div>
          <Tag color={statusConfig[status].color}>
            {statusConfig[status].label}
          </Tag>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Hired: {record.hireDate}
          </Text>
          {record.terminationDate && (
            <Text type="secondary" style={{ fontSize: 12, display: "block" }}>
              Terminated: {record.terminationDate}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: "Performance",
      dataIndex: "performanceRating",
      key: "performance",
      responsive: ["lg"],
      render: (rating) => (
        <div>
          <Rate disabled allowHalf value={rating} style={{ fontSize: 14 }} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {rating.toFixed(1)}/5
          </Text>
        </div>
      ),
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      responsive: ["xl"],
      render: (salary) => (
        <div>
          <Text strong>
            <DollarOutlined style={{ marginRight: 4 }} /> {salary}
          </Text>
        </div>
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
          <Tooltip title="Send Message">
            <Button
              type="text"
              icon={<MessageOutlined style={iconTextStyle} />}
              size="small"
              onClick={() => handleSendMessage(record)}
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
          onClick={() => handleViewProfile(employee)}
        />,
        <MessageOutlined
          key="message"
          style={iconTextStyle}
          onClick={() => handleSendMessage(employee)}
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
            {employee.isAdmin && (
              <Tag color="red" style={{ fontSize: 10, padding: "0 4px" }}>
                Admin
              </Tag>
            )}
          </div>
          <Text style={{ display: "block", marginBottom: 4 }}>
            {employee.position}
          </Text>
          <div style={{ marginBottom: 8 }}>
            <Tag color={statusConfig[employee.status].color} size="small">
              {statusConfig[employee.status].label}
            </Tag>
            <Tag
              color={employmentTypeConfig[employee.employmentType].color}
              size="small"
              style={{ marginLeft: 4 }}
            >
              {employmentTypeConfig[employee.employmentType].label}
            </Tag>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
            {employee.skills.slice(0, 3).map((skill) => (
              <Tag key={skill} size="small">
                {skill}
              </Tag>
            ))}
          </div>
          <div style={{ marginTop: 8 }}>
            <Text>
              <BankOutlined style={{ marginRight: 4 }} /> {employee.department}
            </Text>
            <Text style={{ display: "block" }}>
              <DollarOutlined style={{ marginRight: 4 }} /> {employee.salary}
            </Text>
          </div>
          <Rate
            disabled
            allowHalf
            value={employee.performanceRating}
            style={{ fontSize: 12, marginTop: 8 }}
          />
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
              Employees
            </Title>
            <Text type="secondary">Manage your organization's employees</Text>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <Space
              size="small"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              <Button
                style={buttonStyle}
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setAddEmployeeModalVisible(true)}
              >
                Add Employee
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
              placeholder="Search employees, positions, departments, or skills..."
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

      {/* Add Employee Modal */}
      <Modal
        title="Add New Employee"
        open={addEmployeeModalVisible}
        onCancel={() => {
          setAddEmployeeModalVisible(false);
          addEmployeeForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={addEmployeeForm}
          layout="vertical"
          onFinish={handleAddEmployee}
          initialValues={{
            status: "active",
            employmentType: "full-time",
            isAdmin: false,
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter employee's name" },
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input placeholder="Enter location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Position"
                name="position"
                rules={[{ required: true, message: "Please enter position" }]}
              >
                <Input placeholder="Enter position/role" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Department"
                name="department"
                rules={[{ required: true, message: "Please enter department" }]}
              >
                <Input placeholder="Enter department" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Employment Type"
                name="employmentType"
                rules={[
                  {
                    required: true,
                    message: "Please select employment type",
                  },
                ]}
              >
                <Select>
                  <Option value="full-time">Full-time</Option>
                  <Option value="part-time">Part-time</Option>
                  <Option value="contract">Contract</Option>
                  <Option value="intern">Intern</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="on-leave">On Leave</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Manager"
                name="manager"
                rules={[{ required: false, message: "Please enter manager" }]}
              >
                <Input placeholder="Enter manager's name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Hire Date"
                name="hireDate"
                rules={[{ required: false, message: "Please select hire date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Salary"
                name="salary"
                rules={[{ required: false, message: "Please enter salary" }]}
              >
                <Input placeholder="Enter salary (e.g., $100,000 or $50/hour)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Admin Access"
                name="isAdmin"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Skills" name="skills">
            <Select
              mode="tags"
              placeholder="Enter skills (press Enter to add)"
              style={{ width: "100%" }}
            >
              <Option value="React">React</Option>
              <Option value="JavaScript">JavaScript</Option>
              <Option value="Python">Python</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="SQL">SQL</Option>
              <Option value="Product Management">Product Management</Option>
              <Option value="UX Design">UX Design</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Summary" name="summary">
            <Input.TextArea
              rows={3}
              placeholder="Brief summary about the employee..."
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setAddEmployeeModalVisible(false);
                  addEmployeeForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
                Add Employee
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        title={`Edit ${selectedEmployee?.name}'s Profile`}
        open={editEmployeeModalVisible}
        onCancel={() => {
          setEditEmployeeModalVisible(false);
          editEmployeeForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 700}
      >
        <Form
          form={editEmployeeForm}
          layout="vertical"
          onFinish={handleEditEmployeeSubmit}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Full Name"
                name="name"
                rules={[
                  { required: true, message: "Please enter employee's name" },
                ]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Phone"
                name="phone"
                rules={[
                  { required: true, message: "Please enter phone number" },
                ]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Location"
                name="location"
                rules={[{ required: true, message: "Please enter location" }]}
              >
                <Input placeholder="Enter location" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Position"
                name="position"
                rules={[{ required: true, message: "Please enter position" }]}
              >
                <Input placeholder="Enter position/role" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Department"
                name="department"
                rules={[{ required: true, message: "Please enter department" }]}
              >
                <Input placeholder="Enter department" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Employment Type"
                name="employmentType"
                rules={[
                  {
                    required: true,
                    message: "Please select employment type",
                  },
                ]}
              >
                <Select>
                  <Option value="full-time">Full-time</Option>
                  <Option value="part-time">Part-time</Option>
                  <Option value="contract">Contract</Option>
                  <Option value="intern">Intern</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Please select status" }]}
              >
                <Select>
                  <Option value="active">Active</Option>
                  <Option value="on-leave">On Leave</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Manager"
                name="manager"
                rules={[{ required: false, message: "Please enter manager" }]}
              >
                <Input placeholder="Enter manager's name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Hire Date"
                name="hireDate"
                rules={[{ required: false, message: "Please select hire date" }]}
              >
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Salary"
                name="salary"
                rules={[{ required: false, message: "Please enter salary" }]}
              >
                <Input placeholder="Enter salary (e.g., $100,000 or $50/hour)" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Admin Access"
                name="isAdmin"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Skills" name="skills">
            <Select
              mode="tags"
              placeholder="Enter skills (press Enter to add)"
              style={{ width: "100%" }}
            >
              <Option value="React">React</Option>
              <Option value="JavaScript">JavaScript</Option>
              <Option value="Python">Python</Option>
              <Option value="Node.js">Node.js</Option>
              <Option value="SQL">SQL</Option>
              <Option value="Product Management">Product Management</Option>
              <Option value="UX Design">UX Design</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Summary" name="summary">
            <Input.TextArea
              rows={3}
              placeholder="Brief summary about the employee..."
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setEditEmployeeModalVisible(false);
                  editEmployeeForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Send Message Modal */}
      <Modal
        title={`Message ${selectedEmployee?.name}`}
        open={messageModalVisible}
        onCancel={() => {
          setMessageModalVisible(false);
          messageForm.resetFields();
        }}
        footer={null}
        width={window.innerWidth < 768 ? "95%" : 600}
      >
        <Form
          form={messageForm}
          layout="vertical"
        >
          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter subject" }]}
          >
            <Input placeholder="Enter message subject" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[{ required: true, message: "Please enter your message" }]}
          >
            <Input.TextArea rows={6} placeholder="Write your message here..." />
          </Form.Item>

          <Form.Item label="Attachment" name="attachment">
            <Upload>
              <Button icon={<UploadOutlined />}>Add Attachment</Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  setMessageModalVisible(false);
                  messageForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button style={buttonStyle} htmlType="submit">
                Send Message
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Employee Profile Drawer */}
      <Drawer
        title={selectedEmployee?.name}
        placement="right"
        width={window.innerWidth < 768 ? "100%" : 600}
        onClose={() => setEmployeeDrawerVisible(false)}
        open={employeeDrawerVisible}
        extra={
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEmployeeDrawerVisible(false);
                handleEditEmployee(selectedEmployee);
              }}
            >
              Edit
            </Button>
            <Button
              icon={<MessageOutlined />}
              onClick={() => {
                setEmployeeDrawerVisible(false);
                handleSendMessage(selectedEmployee);
              }}
            >
              Message
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
                  {selectedEmployee.isAdmin && (
                    <Tag
                      color="red"
                      style={{ marginLeft: 8, fontSize: 12, padding: "0 4px" }}
                    >
                      Admin
                    </Tag>
                  )}
                </Title>
                <Text type="secondary">{selectedEmployee.position}</Text>
                <div style={{ marginTop: 8 }}>
                  <Tag color={statusConfig[selectedEmployee.status].color}>
                    {statusConfig[selectedEmployee.status].label}
                  </Tag>
                  <Tag
                    color={
                      employmentTypeConfig[selectedEmployee.employmentType].color
                    }
                    style={{ marginLeft: 8 }}
                  >
                    {employmentTypeConfig[selectedEmployee.employmentType].label}
                  </Tag>
                </div>
              </div>
            </div>

            <Tabs defaultActiveKey="1">
              <TabPane tab="Overview" key="1">
                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Contact Information</Title>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    <Text>
                      <MailOutlined
                        style={{ marginRight: 8, ...iconTextStyle }}
                      />
                      {selectedEmployee.email}
                    </Text>
                    <Text>
                      <PhoneOutlined
                        style={{ marginRight: 8, ...iconTextStyle }}
                      />
                      {selectedEmployee.phone}
                    </Text>
                    <Text>
                      <EnvironmentOutlined
                        style={{ marginRight: 8, ...iconTextStyle }}
                      />
                      {selectedEmployee.location}
                    </Text>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Employment Details</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Text strong>Department</Text>
                      <br />
                      <Text>{selectedEmployee.department}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Manager</Text>
                      <br />
                      <Text>{selectedEmployee.manager || "Not specified"}</Text>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 12 }}>
                    <Col span={12}>
                      <Text strong>Hire Date</Text>
                      <br />
                      <Text>{selectedEmployee.hireDate}</Text>
                    </Col>
                    <Col span={12}>
                      <Text strong>Salary</Text>
                      <br />
                      <Text>{selectedEmployee.salary}</Text>
                    </Col>
                  </Row>
                  {selectedEmployee.terminationDate && (
                    <Row gutter={16} style={{ marginTop: 12 }}>
                      <Col span={24}>
                        <Text strong>Termination Date</Text>
                        <br />
                        <Text>{selectedEmployee.terminationDate}</Text>
                      </Col>
                    </Row>
                  )}
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Performance</Title>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Rate
                      disabled
                      allowHalf
                      value={selectedEmployee.performanceRating}
                    />
                    <Text style={{ marginLeft: 8 }}>
                      {selectedEmployee.performanceRating.toFixed(1)}/5
                    </Text>
                  </div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <Title level={5}>Skills</Title>
                  <Space size={[8, 8]} wrap>
                    {selectedEmployee.skills.map((skill) => (
                      <Tag key={skill}>{skill}</Tag>
                    ))}
                  </Space>
                </div>

                <div>
                  <Title level={5}>Summary</Title>
                  <Text>{selectedEmployee.summary}</Text>
                </div>
              </TabPane>

              <TabPane tab="Documents" key="2">
                <Card>
                  <List
                    dataSource={selectedEmployee.documents}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<IdcardOutlined />}
                          title={<Text strong>{item.name}</Text>}
                          description={
                            <Text type="secondary">
                              {item.type
                                .split("-")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                )
                                .join(" ")}
                            </Text>
                          }
                        />
                        <Button
                          type="text"
                          icon={<DownloadOutlined style={iconTextStyle} />}
                        />
                      </List.Item>
                    )}
                  />
                  <Divider />
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <Upload>
                      <Button icon={<UploadOutlined />}>
                        Upload Additional Documents
                      </Button>
                    </Upload>
                  </div>
                </Card>
              </TabPane>

              <TabPane tab="Activity" key="3">
                <List
                  itemLayout="horizontal"
                  dataSource={[
                    {
                      title: "Hired",
                      description: "Employee was hired",
                      date: selectedEmployee.hireDate,
                      icon: <UserOutlined />,
                    },
                    {
                      title: "Onboarding Completed",
                      description: "Completed all onboarding tasks",
                      date: "2023-05-22",
                      icon: <SettingOutlined />,
                    },
                    selectedEmployee.terminationDate
                      ? {
                          title: "Terminated",
                          description: "Employee was terminated",
                          date: selectedEmployee.terminationDate,
                          icon: <CloseOutlined />,
                        }
                      : {
                          title: "Last Performance Review",
                          description: "Annual performance review completed",
                          date: "2024-01-15",
                          icon: <StarOutlined />,
                        },
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            icon={item.icon}
                            style={{
                              backgroundColor: "#f0f0f0",
                              color: "#da2c46",
                            }}
                          />
                        }
                        title={<Text strong>{item.title}</Text>}
                        description={
                          <>
                            <Text>{item.description}</Text>
                            <br />
                            <Text type="secondary">{item.date}</Text>
                          </>
                        }
                      />
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default RecruiterEmployee;