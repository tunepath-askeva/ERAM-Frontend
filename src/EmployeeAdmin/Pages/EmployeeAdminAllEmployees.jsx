import React, { useState, useEffect } from "react";
import { Table, Button, Space, Input, message, Popconfirm, Spin } from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useBulkImportEmployeesMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import { useGetBranchEmployessQuery } from "../../Slices/Recruiter/RecruiterApis";
import AddEmployeeModal from "../Components/AddEmployeeModal";
import EditEmployeeModal from "../Components/EditEmployeeModal";
import ImportEmployeeCSVModal from "../Components/ImportEmployeeCSVModal";
import EmployeeDetailsDrawer from "../Components/EmployeeDetailsDrawer";

const EmployeeAdminAllEmployees = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [isDetailsDrawerVisible, setIsDetailsDrawerVisible] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [searchText, setSearchText] = useState("");

  // API Queries and Mutations
  const {
    data: branchEmployeesResponse,
    isLoading,
    error,
    refetch,
  } = useGetBranchEmployessQuery({
    page,
    pageSize,
  });

  const [addEmployee, { isLoading: isAdding }] = useAddEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [bulkImportEmployees, { isLoading: isImporting }] =
    useBulkImportEmployeesMutation();

  const employees = branchEmployeesResponse?.data || [];
  const total = branchEmployeesResponse?.total || 0;

  // Update filtered employees when API data changes
  useEffect(() => {
    if (employees.length > 0) {
      setFilteredEmployees(employees);
    }
  }, [employees]);

  // Filter employees based on search
  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = employees.filter(
      (emp) =>
        emp.fullName?.toLowerCase().includes(value.toLowerCase()) ||
        emp.email?.toLowerCase().includes(value.toLowerCase()) ||
        emp.employmentDetails?.assignedJobTitle
          ?.toLowerCase()
          .includes(value.toLowerCase()) ||
        emp.employmentDetails?.category
          ?.toLowerCase()
          .includes(value.toLowerCase()) ||
        emp.employmentDetails?.eramId
          ?.toLowerCase()
          .includes(value.toLowerCase())
    );
    setFilteredEmployees(filtered);
  };

  // Add new employee
  const handleAdd = async (values) => {
    try {
      const result = await addEmployee(values).unwrap();
      message.success(result.message || "Employee added successfully");
      setIsAddModalVisible(false);
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to add employee");
    }
  };

  // View employee details
  const handleView = (record) => {
    setSelectedEmployeeId(record._id);
    setIsDetailsDrawerVisible(true);
  };

  // Edit employee
  const handleEdit = (record) => {
    setEditingEmployeeId(record._id);
    setIsEditModalVisible(true);
    setIsDetailsDrawerVisible(false);
  };

  const handleUpdate = async (values) => {
    try {
      const result = await updateEmployee(values).unwrap();
      message.success(result.message || "Employee updated successfully");
      setIsEditModalVisible(false);
      setEditingEmployeeId(null);
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to update employee");
    }
  };

  // Delete employee
  const handleDelete = async (id) => {
    try {
      const result = await deleteEmployee(id).unwrap();
      message.success(result.message || "Employee deleted successfully");
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to delete employee");
    }
  };

  // Bulk import employees
  const handleBulkImport = async (data) => {
    try {
      const result = await bulkImportEmployees(data).unwrap();

      const successMessage = [];
      if (result.insertedCount > 0) {
        successMessage.push(`Imported: ${result.insertedCount}`);
      }
      if (result.duplicateCount > 0) {
        successMessage.push(`Duplicates skipped: ${result.duplicateCount}`);
      }
      if (result.invalidCount > 0) {
        successMessage.push(`Invalid skipped: ${result.invalidCount}`);
      }

      if (successMessage.length > 0) {
        message.success(successMessage.join(" | "));
      } else {
        message.warning("No employees were imported");
      }

      setIsImportModalVisible(false);
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to import employees");
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = [
      "ERAM ID",
      "Full Name",
      "Email",
      "Phone",
      "Job Title",
      "Category",
      "Badge No",
      "Date of Joining",
      "Salary",
    ];

    const csvContent = [
      headers.join(","),
      ...filteredEmployees.map((emp) =>
        [
          emp.employmentDetails?.eramId || "",
          emp.fullName,
          emp.email,
          emp.phone,
          emp.employmentDetails?.assignedJobTitle || "",
          emp.employmentDetails?.category || "",
          emp.employmentDetails?.department || "",
          emp.employmentDetails?.badgeNo || "",
          emp.employmentDetails?.dateOfJoining
            ? new Date(emp.employmentDetails.dateOfJoining).toLocaleDateString()
            : "",
          emp.employmentDetails?.salary || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    message.success("Employees exported successfully");
  };

  const columns = [
    {
      title: "ERAM ID",
      dataIndex: ["employmentDetails", "eramId"],
      key: "eramId",
      width: 120,
      render: (text) => text || "-",
    },
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleView(record)}
          style={{ padding: 0, height: "auto", color: "#da2c46" }}
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Job Title",
      dataIndex: ["employmentDetails", "assignedJobTitle"],
      key: "assignedJobTitle",
      render: (text) => text || "-",
    },
    {
      title: "Date of Joining",
      dataIndex: ["employmentDetails", "dateOfJoining"],
      key: "dateOfJoining",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            style={{ color: "#1890ff", padding: 0 }}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: "#da2c46", padding: 0 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete employee"
            description="Are you sure you want to delete this employee? This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ style: { backgroundColor: "#da2c46" } }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              style={{ padding: 0 }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: "red" }}>
          Error loading employees: {error?.data?.message || error.message}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#da2c46", marginBottom: "8px", fontSize: "28px" }}>
          Employee Management
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          Manage your organization's employees, track details, and handle bulk
          operations
        </p>

        <Space
          style={{
            marginBottom: "16px",
            width: "100%",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <Input
            placeholder="Search by name, email, job title, or ERAM ID..."
            allowClear
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 400 }}
          />

          <Space wrap>
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
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={filteredEmployees.length === 0}
            >
              Export CSV
            </Button>
          </Space>
        </Space>
      </div>

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="_id"
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) =>
              `Total ${total} employee${total !== 1 ? "s" : ""}`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Spin>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={handleAdd}
        isLoading={isAdding}
      />

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        visible={isEditModalVisible}
        employeeId={editingEmployeeId}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingEmployeeId(null); // Reset ID instead of employee object
        }}
        onSubmit={handleUpdate}
        isLoading={isUpdating}
      />

      {/* Import CSV Modal */}
      <ImportEmployeeCSVModal
        visible={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        onImport={handleBulkImport}
        isLoading={isImporting}
      />

      {/* Employee Details Drawer */}
      <EmployeeDetailsDrawer
        visible={isDetailsDrawerVisible}
        employeeId={selectedEmployeeId}
        onClose={() => {
          setIsDetailsDrawerVisible(false);
          setSelectedEmployeeId(null);
        }}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default EmployeeAdminAllEmployees;
