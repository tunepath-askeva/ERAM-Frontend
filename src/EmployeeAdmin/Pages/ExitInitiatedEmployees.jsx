import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Tag,
  Tooltip,
  Spin,
  Card,
  Typography,
  Modal,
  Form,
} from "antd";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import {
  useGetExitInitiatedEmployeesQuery,
  useConvertEmployeeToCandidateMutation,
  useCancelAttritionMutation,
  useGetAttritionDetailsQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import { useSnackbar } from "notistack";
import AttritionDetailsModal from "../Components/AttritionDetailsModal";

const { Text: AntText } = Typography;
const { TextArea } = Input;

const ExitInitiatedEmployees = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
  const [isConvertModalVisible, setIsConvertModalVisible] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelForm] = Form.useForm();

  const {
    data: exitEmployeesResponse,
    isLoading,
    error,
    refetch,
  } = useGetExitInitiatedEmployeesQuery({
    page,
    pageSize,
    search: debouncedSearch,
  });

  const { data: attritionData } = useGetAttritionDetailsQuery(
    selectedEmployeeId,
    {
      skip: !selectedEmployeeId || !isDetailsModalVisible,
    }
  );

  const [convertToCandidate, { isLoading: isConverting }] =
    useConvertEmployeeToCandidateMutation();

  const [cancelAttrition, { isLoading: isCancelling }] =
    useCancelAttritionMutation();

  const employees = exitEmployeesResponse?.data || [];
  const total = exitEmployeesResponse?.total || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const handleViewDetails = (record) => {
    setSelectedEmployeeId(record._id);
    setIsDetailsModalVisible(true);
  };

  const handleConvertToCandidate = async () => {
    console.log("🔵 handleConvertToCandidate called");
    console.log("selectedEmployeeId:", selectedEmployeeId);

    if (!selectedEmployeeId) {
      console.log("❌ No selectedEmployeeId");
      return;
    }

    setIsConvertModalVisible(true);
  };

  const confirmConvertToCandidate = async () => {
    try {
      console.log("🚀 Starting conversion...");
      const result = await convertToCandidate(selectedEmployeeId).unwrap();
      console.log("✅ Conversion successful:", result);

      enqueueSnackbar(
        result.message || "Employee converted to candidate successfully",
        { variant: "success" }
      );

      await refetch();

      setIsConvertModalVisible(false);
      setIsDetailsModalVisible(false);
      setSelectedEmployeeId(null);
    } catch (error) {
      console.error("❌ Conversion failed:", error);
      enqueueSnackbar(error?.data?.message || "Failed to convert employee", {
        variant: "error",
      });
    }
  };

  const handleCancelAttrition = async () => {
    console.log("🔴 handleCancelAttrition called");

    const attritionId = attritionData?.attrition?._id;
    console.log("attritionId:", attritionId);

    if (!attritionId) {
      console.log("❌ No attritionId found");
      enqueueSnackbar("Attrition ID not found", { variant: "error" });
      return;
    }

    setCancellationReason("");
    setIsCancelModalVisible(true);
  };

  const confirmCancelAttrition = async () => {
    const attritionId = attritionData?.attrition?._id;

    if (!cancellationReason || cancellationReason.trim().length < 10) {
      enqueueSnackbar("Please provide a reason (minimum 10 characters)", {
        variant: "error",
      });
      return;
    }

    try {
      console.log("🚀 Starting cancellation...");
      const result = await cancelAttrition({
        attritionId: attritionId,
        cancellationReason: cancellationReason.trim(),
      }).unwrap();
      console.log("✅ Cancellation successful:", result);

      enqueueSnackbar(result.message || "Attrition cancelled successfully", {
        variant: "success",
      });

      await refetch();

      setIsCancelModalVisible(false);
      setIsDetailsModalVisible(false);
      setSelectedEmployeeId(null);
      setCancellationReason("");
    } catch (error) {
      console.error("❌ Cancellation failed:", error);
      enqueueSnackbar(error?.data?.message || "Failed to cancel attrition", {
        variant: "error",
      });
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
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 250,
    },
    {
      title: "Unique Code",
      dataIndex: "uniqueCode",
      key: "uniqueCode",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Job Title",
      dataIndex: ["employmentDetails", "assignedJobTitle"],
      key: "assignedJobTitle",
      width: 200,
      render: (text) => text || "-",
    },
    {
      title: "Status",
      dataIndex: "accountStatus",
      key: "accountStatus",
      width: 150,
      render: (status) => {
        let color = "orange";
        let text = status;

        if (status === "exit_initiated") {
          color = "orange";
          text = "Exit Initiated";
        } else if (status === "exit_approved") {
          color = "green";
          text = "Exit Approved";
        }

        return (
          <Tag color={color} style={{ fontWeight: 500 }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Attrition Details">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              style={{ color: "#1890ff", padding: 0 }}
            />
          </Tooltip>
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
          Error loading exit initiated employees:{" "}
          {error?.data?.message || error.message}
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ color: "#da2c46", marginBottom: "8px", fontSize: "28px" }}>
          Exit Initiated Employees
        </h1>
        <p style={{ color: "#666", marginBottom: "24px" }}>
          View and manage employees who are in the exit/attrition process
        </p>

        <Card style={{ marginBottom: "16px" }}>
          <Space
            style={{
              width: "100%",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <Input
              placeholder="Search by name, email, ERAM ID, or unique code..."
              allowClear
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 400 }}
            />

            <Space>
              <AntText type="secondary">
                Total: <strong>{total}</strong> employee(s) in exit process
              </AntText>
            </Space>
          </Space>
        </Card>
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
          scroll={{ x: "max-content" }}
          size="middle"
        />
      </Spin>

      <AttritionDetailsModal
        visible={isDetailsModalVisible}
        employeeId={selectedEmployeeId}
        onClose={() => {
          setIsDetailsModalVisible(false);
          setSelectedEmployeeId(null);
        }}
        onRefresh={refetch}
        handleCancelAttrition={handleCancelAttrition}
        isCancelling={isCancelling}
        handleConvertToCandidate={handleConvertToCandidate}
        isConverting={isConverting}
      />

      <Modal
        title="Convert to Candidate"
        open={isConvertModalVisible}
        onOk={confirmConvertToCandidate}
        onCancel={() => setIsConvertModalVisible(false)}
        okText="Yes, Convert"
        cancelText="No"
        confirmLoading={isConverting}
        okButtonProps={{
          style: { backgroundColor: "#52c41a", borderColor: "#52c41a" },
        }}
      >
        <p>
          Are you sure you want to convert this employee back to a candidate?
          This action will move them out of the attrition process.
        </p>
      </Modal>

      {/* Cancel Attrition Modal */}
      <Modal
        title="Cancel Attrition Process"
        open={isCancelModalVisible}
        onOk={confirmCancelAttrition}
        onCancel={() => {
          setIsCancelModalVisible(false);
          setCancellationReason("");
        }}
        okText="Yes, Cancel Attrition"
        cancelText="No"
        confirmLoading={isCancelling}
        okButtonProps={{ danger: true }}
      >
        <p style={{ marginBottom: 16 }}>
          Are you sure you want to cancel this attrition? Employee will be
          restored to active status.
        </p>
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            Cancellation Reason <span style={{ color: "red" }}>*</span>
          </label>
          <TextArea
            rows={3}
            placeholder="Provide reason for cancellation (minimum 10 characters)"
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ExitInitiatedEmployees;
