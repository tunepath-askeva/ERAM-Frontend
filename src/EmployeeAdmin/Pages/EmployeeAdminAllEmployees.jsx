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
  Typography,
  Alert,
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
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useBulkImportEmployeesMutation,
  useDisableEmployeeMutation,
  useLazyExportEmployeesCSVQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import {
  useGetBranchEmployessQuery,
  useInitiateAttritionMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import AddEmployeeModal from "../Components/AddEmployeeModal";
import EditEmployeeModal from "../Components/EditEmployeeModal";
import ImportEmployeeCSVModal from "../Components/ImportEmployeeCSVModal";
import EmployeeDetailsDrawer from "../Components/EmployeeDetailsDrawer";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";
import MoveToAttritionModal from "../Components/MoveToAttritionModal";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Text } = Typography;

const EmployeeAdminAllEmployees = () => {
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
  const [importResults, setImportResults] = useState(null);
  const [isAttritionModalVisible, setIsAttritionModalVisible] = useState(false);
  const [selectedEmployeeForAttrition, setSelectedEmployeeForAttrition] =
    useState(null);

  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  // API Queries and Mutations
  const {
    data: branchEmployeesResponse,
    isLoading,
    error,
    refetch,
  } = useGetBranchEmployessQuery({
    page,
    pageSize,
    search: debouncedSearch,
  });

  const [initiateAttrition, { isLoading: isInitiatingAttrition }] =
    useInitiateAttritionMutation();

  const [addEmployee, { isLoading: isAdding }] = useAddEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [disableEmployee] = useDisableEmployeeMutation();
  const [bulkImportEmployees, { isLoading: isImporting }] =
    useBulkImportEmployeesMutation();
  const [triggerExport, { isLoading: isExporting }] =
    useLazyExportEmployeesCSVQuery();

  const employees = branchEmployeesResponse?.data || [];
  const total = branchEmployeesResponse?.total || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Add new employee
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

  const handleOpenAttritionModal = (employee) => {
    setSelectedEmployeeForAttrition(employee);
    setIsAttritionModalVisible(true);
    setIsDetailsDrawerVisible(false); // Close drawer when opening modal
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

  // Delete employee
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

  const handleInitiateAttrition = async (values) => {
    try {
      const result = await initiateAttrition({
        employeeId: selectedEmployeeForAttrition._id,
        ...values,
      }).unwrap();

      enqueueSnackbar(
        result.message || "Attrition process initiated successfully",
        { variant: "success" }
      );

      setIsAttritionModalVisible(false);
      setSelectedEmployeeForAttrition(null);
      await refetch(); // This will now work properly
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to initiate attrition", {
        variant: "error",
      });
    }
  };

  // Bulk import employees
  const handleBulkImport = async (data) => {
    try {
      const result = await bulkImportEmployees(data).unwrap();

      // Store results for alert display
      setImportResults(result);

      // Build detailed message
      let successMsg = "";
      let warningMsg = "";
      let errorMsg = "";

      if (result.insertedCount > 0) {
        successMsg = `✓ Successfully imported ${result.insertedCount} employee(s)`;
      }

      if (result.duplicateCount > 0) {
        warningMsg = `⚠ ${result.duplicateCount} duplicate(s) skipped`;
      }

      if (result.invalidCount > 0) {
        errorMsg = `✕ ${result.invalidCount} invalid entrie(s)`;
      }

      // Show appropriate snackbar based on results
      if (
        result.insertedCount > 0 &&
        result.duplicateCount === 0 &&
        result.invalidCount === 0
      ) {
        // Perfect import - all success
        enqueueSnackbar(successMsg, {
          variant: "success",
          autoHideDuration: 4000,
        });
      } else if (result.insertedCount > 0) {
        // Partial success with some issues
        const messages = [successMsg, warningMsg, errorMsg].filter(Boolean);
        enqueueSnackbar(
          <div>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx < messages.length - 1 ? "4px" : "0",
                }}
              >
                {msg}
              </div>
            ))}
            <div style={{ marginTop: "8px", fontSize: "12px", opacity: 0.9 }}>
              Check the alert below for details
            </div>
          </div>,
          {
            variant: "warning",
            autoHideDuration: 6000,
          }
        );
      } else if (result.duplicateCount > 0 || result.invalidCount > 0) {
        // No success - only errors/duplicates
        const messages = [warningMsg, errorMsg].filter(Boolean);
        enqueueSnackbar(
          <div>
            <div style={{ fontWeight: 600, marginBottom: "4px" }}>
              Import Failed
            </div>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: idx < messages.length - 1 ? "4px" : "0",
                }}
              >
                {msg}
              </div>
            ))}
            <div style={{ marginTop: "8px", fontSize: "12px", opacity: 0.9 }}>
              Check the alert below for details
            </div>
          </div>,
          {
            variant: "error",
            autoHideDuration: 7000,
          }
        );
      } else {
        // Edge case - no data processed
        enqueueSnackbar("No employees were imported", {
          variant: "info",
          autoHideDuration: 4000,
        });
      }

      setIsImportModalVisible(false);

      // MOVE REFETCH HERE - ALWAYS REFETCH AFTER IMPORT COMPLETES
      await refetch();
    } catch (error) {
      console.error("Import error:", error);

      // Enhanced error message
      const errorMessage = error?.data?.message || "Failed to import employees";
      const errorDetails = error?.data?.error || "";

      enqueueSnackbar(
        <div>
          <div style={{ fontWeight: 600, marginBottom: "4px" }}>
            Import Error
          </div>
          <div>{errorMessage}</div>
          {errorDetails && (
            <div style={{ marginTop: "4px", fontSize: "12px", opacity: 0.9 }}>
              {errorDetails}
            </div>
          )}
        </div>,
        {
          variant: "error",
          autoHideDuration: 8000,
        }
      );

      // ALSO REFETCH ON ERROR (in case partial import happened)
      await refetch();
    }
  };

  const handleExport = async () => {
    try {
      const blob = await triggerExport().unwrap();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `employees_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Employees exported successfully", {
        variant: "success",
      });
    } catch (error) {
      enqueueSnackbar("Failed to export employees", { variant: "error" });
    }
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
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 200,
      render: (createdBy) => {
        if (!createdBy) {
          return <Text type="secondary">N/A</Text>;
        }

        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: 13 }}>
              {createdBy.fullName}
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                wordBreak: "break-all",
              }}
            >
              {createdBy.email}
            </Text>
          </Space>
        );
      },
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
      render: (phone, record) => {
        if (record.phoneCountryCode && phone) {
          return phoneUtils.formatWithCountryCode(record.phoneCountryCode, phone);
        }
        return phone || "-";
      },
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
          {/* View */}
          <Tooltip title="View Employee">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              style={{ color: "#1890ff", padding: 0 }}
            />
          </Tooltip>

          {/* Edit */}
          {hasPermission("edit-employee") && (
            <Tooltip title="Edit Employee">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                style={{ color: "#da2c46", padding: 0 }}
              />
            </Tooltip>
          )}

          {/* Deactivate / Activate Button */}
          {hasPermission("delete-employee") && (
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
                    <Button
                      type="link"
                      danger
                      icon={<StopOutlined />}
                      style={{ padding: 0 }}
                    />
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
                      type="link"
                      style={{ padding: 0, color: "#52c41a" }}
                      icon={<CheckCircleOutlined />}
                    />
                  </Popconfirm>
                </Tooltip>
              )}
            </>
          )}

          {/* Delete */}
          {hasPermission("delete-employee") && (
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
            </Tooltip>
          )}
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
            {hasPermission("add-employee") && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalVisible(true)}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Add Employee
              </Button>
            )}
            {hasPermission("import-employee-csv") && (
              <Button
                icon={<UploadOutlined />}
                onClick={() => setIsImportModalVisible(true)}
              >
                Import CSV
              </Button>
            )}
            {hasPermission("export-employee-csv") && (
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                disabled={employees.length === 0}
              >
                Export CSV
              </Button>
            )}
          </Space>
        </Space>
      </div>

      {importResults && (
        <Alert
          message={<span style={{ fontWeight: 600 }}>Bulk Import Results</span>}
          description={
            <div>
              <div style={{ marginBottom: "12px" }}>
                <Text strong style={{ color: "#52c41a" }}>
                  ✓ Successfully Imported:
                </Text>{" "}
                {importResults.insertedCount} employee(s)
              </div>

              {importResults.duplicateCount > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <Text strong style={{ color: "#faad14" }}>
                    ⚠ Duplicates Skipped:
                  </Text>{" "}
                  {importResults.duplicateCount} employee(s)
                  {importResults.duplicates &&
                    importResults.duplicates.length > 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "8px",
                          backgroundColor: "#fffbe6",
                          borderRadius: "4px",
                          maxHeight: "120px",
                          overflowY: "auto",
                        }}
                      >
                        {importResults.duplicates.map((dup, idx) => (
                          <div
                            key={idx}
                            style={{ fontSize: "12px", marginBottom: "4px" }}
                          >
                            • <Text code>{dup.email}</Text> - {dup.reason}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {importResults.invalidCount > 0 && (
                <div>
                  <Text strong style={{ color: "#ff4d4f" }}>
                    ✕ Invalid Entries:
                  </Text>{" "}
                  {importResults.invalidCount} employee(s)
                  {importResults.invalid &&
                    importResults.invalid.length > 0 && (
                      <div
                        style={{
                          marginTop: "8px",
                          padding: "8px",
                          backgroundColor: "#fff1f0",
                          borderRadius: "4px",
                          maxHeight: "200px", // INCREASE THIS
                          overflowY: "auto",
                        }}
                      >
                        {importResults.invalid.map((inv, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: "12px",
                              marginBottom: "8px", // INCREASE spacing
                              paddingBottom: "8px",
                              borderBottom:
                                idx < importResults.invalid.length - 1
                                  ? "1px solid #ffccc7"
                                  : "none", // ADD border
                            }}
                          >
                            • <Text code>{inv.email}</Text>
                            {inv.fullName && (
                              <Text> ({inv.fullName})</Text>
                            )}{" "}
                            {/* ADD name if available */}
                            <div
                              style={{
                                marginLeft: "16px",
                                marginTop: "4px",
                                color: "#8c8c8c",
                                whiteSpace: "pre-wrap", // ALLOW wrapping for long reasons
                                wordBreak: "break-word",
                              }}
                            >
                              Reason: {inv.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          }
          type={
            importResults.insertedCount > 0
              ? "success"
              : importResults.duplicateCount > 0 ||
                importResults.invalidCount > 0
              ? "warning"
              : "info"
          }
          showIcon
          closable
          onClose={() => setImportResults(null)}
          style={{ marginBottom: "16px" }}
        />
      )}

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
          scroll={{ x: "max-content" }}
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
        hasPermission={hasPermission}
        onAttritionInitiated={refetch}
        onInitiateAttrition={handleOpenAttritionModal}
      />

      <MoveToAttritionModal
        visible={isAttritionModalVisible}
        onCancel={() => {
          setIsAttritionModalVisible(false);
          setSelectedEmployeeForAttrition(null);
          refetch();
        }}
        employee={selectedEmployeeForAttrition}
        onSubmit={handleInitiateAttrition}
        isLoading={isInitiatingAttrition}
      />
    </div>
  );
};

export default EmployeeAdminAllEmployees;
