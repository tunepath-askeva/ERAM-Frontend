import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  message,
  Popconfirm,
  Spin,
  Tooltip,
  Tag,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  //   useAddEmployeeMutation,
  //   useUpdateEmployeeMutation,
  //   useDeleteEmployeeMutation,
  //   useBulkImportEmployeesMutation,
  useDisableEmployeeMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import { useGetBranchEmployessforAdminQuery } from "../../Slices/Admin/AdminApis";
// import AddEmployeeModal from "../Components/AddEmployeeModal";
// import EditEmployeeModal from "../Components/EditEmployeeModal";
// import ImportEmployeeCSVModal from "../Components/ImportEmployeeCSVModal";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import AdminEmployeeDetails from "../Components/AdminEmployeeDetails";
import { AlignCenter } from "lucide-react";

const AdminEmployees = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
  } = useGetBranchEmployessforAdminQuery({
    page,
    pageSize,
    search: debouncedSearch,
  });

  //   const [addEmployee, { isLoading: isAdding }] = useAddEmployeeMutation();
  //   const [updateEmployee, { isLoading: isUpdating }] =
  //     useUpdateEmployeeMutation();
  //   const [deleteEmployee] = useDeleteEmployeeMutation();
  const [disableEmployee] = useDisableEmployeeMutation();
  //   const [bulkImportEmployees, { isLoading: isImporting }] =
  //     useBulkImportEmployeesMutation();

  const employees = branchEmployeesResponse?.data || [];
  const total = branchEmployeesResponse?.total || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleAdd = async (values) => {
    try {
      const result = await addEmployee(values).unwrap();
      enqueueSnackbar(result.message || "Employee added successfully", {
        variant: "success",
      });
      setIsAddModalVisible(false);
      await refetch();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to add employee", {
        variant: "error",
      });
    }
  };

  const handleView = (record) => {
    setSelectedEmployeeId(record._id);
    setIsDetailsDrawerVisible(true);
  };

  const handleEdit = (record) => {
    setEditingEmployeeId(record._id);
    setIsEditModalVisible(true);
    setIsDetailsDrawerVisible(false);
  };

  const handleUpdate = async (values) => {
    try {
      const result = await updateEmployee(values).unwrap();
      enqueueSnackbar(result.message || "Employee updated successfully", {
        variant: "success",
      });
      setIsEditModalVisible(false);
      setEditingEmployeeId(null);
      await refetch();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to update employee", {
        variant: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteEmployee(id).unwrap();
      enqueueSnackbar(result.message || "Employee deleted successfully", {
        variant: "success",
      });
      await refetch();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to delete employee", {
        variant: "error",
      });
    }
  };

  const handleDisable = async (id) => {
    try {
      const result = await disableEmployee(id).unwrap();
      enqueueSnackbar(
        result.message || "Employee status updated successfully",
        { variant: "success" }
      );
      await refetch();
    } catch (error) {
      enqueueSnackbar(
        error?.data?.message || "Failed to update employee status",
        { variant: "error" }
      );
    }
  };

  // Bulk import employees
  const handleBulkImport = async (data) => {
    try {
      const result = await bulkImportEmployees(data).unwrap();

      if (result.insertedCount > 0) {
        enqueueSnackbar(
          `Successfully imported ${
            result.insertedCount
          } employee(s). Duplicates skipped: ${
            result.duplicateCount || 0
          }, Invalid: ${result.invalidCount || 0}`,
          { variant: "success", autoHideDuration: 5000 }
        );
      } else if (result.duplicateCount > 0 || result.invalidCount > 0) {
        enqueueSnackbar(
          `No new employees imported. Duplicates: ${
            result.duplicateCount || 0
          }, Invalid: ${result.invalidCount || 0}`,
          { variant: "warning", autoHideDuration: 5000 }
        );
      } else {
        enqueueSnackbar("No employees were imported", { variant: "info" });
      }

      setIsImportModalVisible(false);
      await refetch();
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to import employees", {
        variant: "error",
      });
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
      ...employees.map((emp) =>
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
    enqueueSnackbar("Employees exported successfully", { variant: "success" });
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
      title: "Unique Code",
      dataIndex: "uniqueCode",
      key: "uniqueCode",
      render: (text) => text || "-",
    },
    {
      title: "Entry Type",
      key: "enteringCandidate",
      render: (_, record) => {
        const code = record.uniqueCode || "";
        const entry = record.enteringCandidate;

        // 🟢 Converted from Candidate
        if (code.includes("CAND")) {
          return <Tag color="green">Converted to Employee</Tag>;
        }

        // 🔵 Direct Employee (EMP)
        if (code.includes("EMP")) {
          if (entry === "bulk") {
            return <Tag color="cyan">Bulk Imported</Tag>;
          }

          if (entry === "addedemployee" || !entry) {
            return <Tag color="purple">Added Employee</Tag>;
          }
        }

        return "-";
      },
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
      width: 250,
      align: "center",
      fixed: "right",
      render: (_, record) => (
        <Space>
          {/* View */}
          <Tooltip title="View Employee">
            <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
              View
            </Button>
          </Tooltip>

          {/* <Tooltip title="Edit Employee">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{ color: "#da2c46", padding: 0 }}
            />
          </Tooltip> */}

          {/* Deactivate / Activate Button */}
          <>
            {record.accountStatus === "active" ? (
              // 🔴 Deactivate
              <Tooltip title="Deactivate Employee">
                <Popconfirm
                  title="Deactivate employee"
                  description="Are you sure you want to deactivate this employee?"
                  onConfirm={() => handleDisable(record._id)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ style: { backgroundColor: "#da2c46" } }}
                >
                  <Button danger icon={<StopOutlined />}>
                    Deactivate
                  </Button>
                </Popconfirm>
              </Tooltip>
            ) : (
              // 🟢 Activate
              <Tooltip title="Activate Employee">
                <Popconfirm
                  title="Activate employee"
                  description="Are you sure you want to activate this employee?"
                  onConfirm={() => handleDisable(record._id)}
                  okText="Yes"
                  cancelText="No"
                  okButtonProps={{ style: { backgroundColor: "#52c41a" } }}
                >
                  <Button
                    icon={<CheckCircleOutlined />}
                    style={{ backgroundColor: "#52c41a", color: "#fff" }}
                  >
                    Activate
                  </Button>
                </Popconfirm>
              </Tooltip>
            )}
          </>
          {/* 
          <Tooltip title="Delete Employee">
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
              />
            </Popconfirm>
          </Tooltip> */}
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
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
          />

          <Space wrap>
            {/* <Button
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
            </Button> */}
          </Space>
        </Space>
      </div>

      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={employees}
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
      {/* 
      <AddEmployeeModal
        visible={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        onSubmit={handleAdd}
        isLoading={isAdding}
      />

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

      <ImportEmployeeCSVModal
        visible={isImportModalVisible}
        onCancel={() => setIsImportModalVisible(false)}
        onImport={handleBulkImport}
        isLoading={isImporting}
      /> */}

      <AdminEmployeeDetails
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

export default AdminEmployees;
