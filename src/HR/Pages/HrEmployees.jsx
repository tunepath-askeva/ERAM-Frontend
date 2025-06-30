import React, { useState } from 'react';
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
  Badge
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Search } = Input;

const HrEmployees = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+1 234 567 8900',
      position: 'Software Engineer',
      department: 'Engineering',
      status: 'Active',
      joinDate: '2023-01-15',
      salary: 75000,
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+1 234 567 8901',
      position: 'Product Manager',
      department: 'Product',
      status: 'Active',
      joinDate: '2022-08-20',
      salary: 85000,
      avatar: null
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      phone: '+1 234 567 8902',
      position: 'Designer',
      department: 'Design',
      status: 'On Leave',
      joinDate: '2023-03-10',
      salary: 65000,
      avatar: null
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      phone: '+1 234 567 8903',
      position: 'HR Manager',
      department: 'Human Resources',
      status: 'Active',
      joinDate: '2021-11-05',
      salary: 70000,
      avatar: null
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [form] = Form.useForm();

  const departments = ['Engineering', 'Product', 'Design', 'Human Resources', 'Sales', 'Marketing'];
  const statuses = ['Active', 'On Leave', 'Inactive'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'green';
      case 'On Leave': return 'orange';
      case 'Inactive': return 'red';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Active': return <CheckCircleOutlined />;
      case 'On Leave': return <ClockCircleOutlined />;
      case 'Inactive': return <ExclamationCircleOutlined />;
      default: return null;
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchText.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchText.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    
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
      joinDate: employee.joinDate ? new Date(employee.joinDate) : null
    });
    setIsModalVisible(true);
  };

  const handleDeleteEmployee = (employeeId) => {
    Modal.confirm({
      title: 'Delete Employee',
      content: 'Are you sure you want to delete this employee?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setEmployees(employees.filter(emp => emp.id !== employeeId));
        message.success('Employee deleted successfully');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingEmployee) {
        // Update existing employee
        setEmployees(employees.map(emp => 
          emp.id === editingEmployee.id 
            ? { ...emp, ...values, joinDate: values.joinDate?.format('YYYY-MM-DD') }
            : emp
        ));
        message.success('Employee updated successfully');
      } else {
        // Add new employee
        const newEmployee = {
          id: Date.now(),
          ...values,
          joinDate: values.joinDate?.format('YYYY-MM-DD'),
          avatar: null
        };
        setEmployees([...employees, newEmployee]);
        message.success('Employee added successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleExport = () => {
    message.success('Employee data exported successfully');
  };

  const actionMenuItems = (employee) => [
    {
      key: 'edit',
      label: 'Edit Employee',
      icon: <EditOutlined />,
      onClick: () => handleEditEmployee(employee)
    },
    {
      key: 'delete',
      label: 'Delete Employee',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteEmployee(employee.id)
    }
  ];

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />}
            style={{ backgroundColor: '#da2c46' }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (department) => (
        <Tag color="blue">{department}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Dropdown 
          menu={{ items: actionMenuItems(record) }}
          trigger={['click']}
        >
          <Button 
            type="text" 
            icon={<MoreOutlined />}
            style={{ color: '#da2c46' }}
          />
        </Dropdown>
      ),
    },
  ];

  const stats = {
    total: employees.length,
    active: employees.filter(emp => emp.status === 'Active').length,
    onLeave: employees.filter(emp => emp.status === 'On Leave').length,
    departments: new Set(employees.map(emp => emp.department)).size
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, color: '#333' }}>
          Employee Management
        </h1>
        <p style={{ color: '#666', margin: '8px 0 0 0' }}>
          Manage your organization's employees
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Employees"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#da2c46' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="On Leave"
              value={stats.onLeave}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Departments"
              value={stats.departments}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search employees..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Department"
              value={filterDepartment}
              onChange={setFilterDepartment}
              style={{ width: '100%' }}
            >
              <Option value="all">All Departments</Option>
              {departments.map(dept => (
                <Option key={dept} value={dept}>{dept}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Status"
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">All Status</Option>
              {statuses.map(status => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                Export
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddEmployee}
                style={{ backgroundColor: '#da2c46', borderColor: '#da2c46' }}
              >
                Add Employee
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Employee Table */}
      <Card>
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
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText={editingEmployee ? 'Update' : 'Add'}
        okButtonProps={{ 
          style: { backgroundColor: '#da2c46', borderColor: '#da2c46' } 
        }}
      >
        <div style={{ marginTop: '20px' }}>
          <Form
            form={form}
            layout="vertical"
          >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter employee name' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="position"
                label="Position"
                rules={[{ required: true, message: 'Please enter position' }]}
              >
                <Input placeholder="Enter job position" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Department"
                rules={[{ required: true, message: 'Please select department' }]}
              >
                <Select placeholder="Select department">
                  {departments.map(dept => (
                    <Option key={dept} value={dept}>{dept}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  {statuses.map(status => (
                    <Option key={status} value={status}>{status}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="joinDate"
                label="Join Date"
                rules={[{ required: true, message: 'Please select join date' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="Select join date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="salary"
                label="Salary"
                rules={[{ required: true, message: 'Please enter salary' }]}
              >
                <Input 
                  type="number" 
                  placeholder="Enter salary" 
                  prefix="$"
                />
              </Form.Item>
            </Col>
          </Row>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default HrEmployees;