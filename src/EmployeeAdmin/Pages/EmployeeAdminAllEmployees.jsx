import React, { useState } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Modal,
  Form,
  message,
  Upload,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

// Main Employee Admin Component
const EmployeeAdminAllEmployees = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      department: "IT",
      position: "Developer",
      salary: 75000,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      department: "HR",
      position: "Manager",
      salary: 85000,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike@example.com",
      department: "Sales",
      position: "Executive",
      salary: 65000,
    },
  ]);
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchText, setSearchText] = useState("");

  // Filter employees based on search
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(value.toLowerCase()) ||
        emp.email.toLowerCase().includes(value.toLowerCase()) ||
        emp.department.toLowerCase().includes(value.toLowerCase()) ||
        emp.position.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  // Add new employee
  const handleAdd = (values) => {
    const newEmployee = {
      id: Math.max(...employees.map((e) => e.id), 0) + 1,
      ...values,
    };
    const updated = [...employees, newEmployee];
    setEmployees(updated);
    setFilteredEmployees(updated);
    setIsAddModalVisible(false);
    message.success("Employee added successfully");
  };

  // Edit employee
  const handleEdit = (record) => {
    setEditingEmployee(record);
    setIsEditModalVisible(true);
  };

  const handleUpdate = (values) => {
    const updated = employees.map((emp) =>
      emp.id === editingEmployee.id ? { ...emp, ...values } : emp
    );
    setEmployees(updated);
    setFilteredEmployees(updated);
    setIsEditModalVisible(false);
    setEditingEmployee(null);
    message.success("Employee updated successfully");
  };

  // Delete employee
  const handleDelete = (id) => {
    const updated = employees.filter((emp) => emp.id !== id);
    setEmployees(updated);
    setFilteredEmployees(updated);
    message.success("Employee deleted successfully");
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["ID", "Name", "Email", "Department", "Position", "Salary"];
    const csvContent = [
      headers.join(","),
      ...filteredEmployees.map((emp) =>
        [
          emp.id,
          emp.name,
          emp.email,
          emp.department,
          emp.position,
          emp.salary,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    message.success("Employees exported successfully");
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Position", dataIndex: "position", key: "position" },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      render: (salary) => `$${salary.toLocaleString()}`,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: "#da2c46" }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete employee"
            description="Are you sure you want to delete this employee?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ style: { backgroundColor: "#da2c46" } }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#da2c46", marginBottom: "24px" }}>
          Employee Management
        </h1>

        <Space
          style={{
            marginBottom: "16px",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Input
            placeholder="Search employees..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsAddModalVisible(true)}
              style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
            >
              Add Employee
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setIsImportModalVisible(true)}
            >
              Import CSV
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleExport}>
              Export CSV
            </Button>
          </Space>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredEmployees}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <AddEmployeeModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={handleAdd}
      />

      <EditEmployeeModal
        visible={isEditModalVisible}
        employee={editingEmployee}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingEmployee(null);
        }}
        onSubmit={handleUpdate}
      />

      <ImportCSVModal
        visible={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        onImport={(importedEmployees) => {
          const maxId = Math.max(...employees.map((e) => e.id), 0);
          const newEmployees = importedEmployees.map((emp, index) => ({
            id: maxId + index + 1,
            ...emp,
          }));
          const updated = [...employees, ...newEmployees];
          setEmployees(updated);
          setFilteredEmployees(updated);
          setIsImportModalVisible(false);
          message.success(
            `${newEmployees.length} employees imported successfully`
          );
        }}
      />
    </div>
  );
};

// Add Employee Modal Component
const AddEmployeeModal = ({ visible, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    salary: "",
  });

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.department ||
      !formData.position ||
      !formData.salary
    ) {
      message.error("Please fill all fields");
      return;
    }
    onSubmit({ ...formData, salary: parseFloat(formData.salary) });
    setFormData({
      name: "",
      email: "",
      department: "",
      position: "",
      salary: "",
    });
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      email: "",
      department: "",
      position: "",
      salary: "",
    });
    onCancel();
  };

  return (
    <Modal
      title={<span style={{ color: "#da2c46" }}>Add New Employee</span>}
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="Add"
      okButtonProps={{
        style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Name *
          </label>
          <Input
            placeholder="Enter name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Email *
          </label>
          <Input
            placeholder="Enter email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Department *
          </label>
          <Input
            placeholder="Enter department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Position *
          </label>
          <Input
            placeholder="Enter position"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Salary *
          </label>
          <Input
            placeholder="Enter salary"
            type="number"
            value={formData.salary}
            onChange={(e) =>
              setFormData({ ...formData, salary: e.target.value })
            }
          />
        </div>
      </div>
    </Modal>
  );
};

// Edit Employee Modal Component
const EditEmployeeModal = ({ visible, employee, onCancel, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    position: "",
    salary: "",
  });

  React.useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || "",
        email: employee.email || "",
        department: employee.department || "",
        position: employee.position || "",
        salary: employee.salary?.toString() || "",
      });
    }
  }, [employee]);

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.department ||
      !formData.position ||
      !formData.salary
    ) {
      message.error("Please fill all fields");
      return;
    }
    onSubmit({ ...formData, salary: parseFloat(formData.salary) });
  };

  return (
    <Modal
      title={<span style={{ color: "#da2c46" }}>Edit Employee</span>}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      okText="Update"
      okButtonProps={{
        style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Name *
          </label>
          <Input
            placeholder="Enter name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Email *
          </label>
          <Input
            placeholder="Enter email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Department *
          </label>
          <Input
            placeholder="Enter department"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Position *
          </label>
          <Input
            placeholder="Enter position"
            value={formData.position}
            onChange={(e) =>
              setFormData({ ...formData, position: e.target.value })
            }
          />
        </div>
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
          >
            Salary *
          </label>
          <Input
            placeholder="Enter salary"
            type="number"
            value={formData.salary}
            onChange={(e) =>
              setFormData({ ...formData, salary: e.target.value })
            }
          />
        </div>
      </div>
    </Modal>
  );
};

// Import CSV Modal Component
const ImportCSVModal = ({ visible, onCancel, onImport }) => {
  const [fileList, setFileList] = useState([]);
  const [importing, setImporting] = useState(false);

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error("Please select a CSV file");
      return;
    }

    setImporting(true);
    const file = fileList[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const employees = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const employee = {};

            headers.forEach((header, index) => {
              if (header === "salary") {
                employee[header] = parseFloat(values[index]) || 0;
              } else if (header !== "id") {
                employee[header] = values[index];
              }
            });

            return employee;
          })
          .filter((emp) => emp.name && emp.email);

        if (employees.length === 0) {
          message.error("No valid employee data found in CSV");
          setImporting(false);
          return;
        }

        onImport(employees);
        setFileList([]);
        setImporting(false);
      } catch (error) {
        message.error("Error parsing CSV file");
        setImporting(false);
      }
    };

    reader.onerror = () => {
      message.error("Error reading file");
      setImporting(false);
    };

    reader.readAsText(file);
  };

  const uploadProps = {
    beforeUpload: (file) => {
      if (!file.name.endsWith(".csv")) {
        message.error("Please upload a CSV file");
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
    },
    maxCount: 1,
  };

  return (
    <Modal
      title={
        <span style={{ color: "#da2c46" }}>Import Employees from CSV</span>
      }
      open={visible}
      onCancel={() => {
        onCancel();
        setFileList([]);
      }}
      onOk={handleUpload}
      okText="Import"
      confirmLoading={importing}
      okButtonProps={{
        style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <p>Upload a CSV file with the following columns:</p>
        <code
          style={{
            display: "block",
            padding: "8px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          name, email, department, position, salary
        </code>
      </div>
      <Upload {...uploadProps}>
        <Button icon={<UploadOutlined />}>Select CSV File</Button>
      </Upload>
    </Modal>
  );
};

export default EmployeeAdminAllEmployees;
