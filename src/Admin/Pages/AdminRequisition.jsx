import React, { useState, useEffect } from "react";
import {
  Button,
  Table,
  Typography,
  Tag,
  Space,
  Input,
  Card,
  Tooltip,
  Empty,
  Spin,
  Badge,
  Pagination,
  Modal,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
// import { useGetRequisitionsQuery } from "../../Slices/Admin/AdminApis";

const { Title, Text } = Typography;

const AdminRequisition = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [requisitionToDelete, setRequisitionToDelete] = useState(null);

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Mock data - replace with actual API call
  const mockRequisitions = [
    {
      _id: "1",
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "Bangalore",
      employmentType: "Full-time",
      experience: "5-8 years",
      salary: "₹15-25 LPA",
      status: "active",
      priority: "high",
      positions: 2,
      postedDate: "2024-01-15",
      deadline: "2024-02-15",
      hiringManager: "John Doe",
      description: "Looking for experienced software engineer...",
      skills: ["React", "Node.js", "MongoDB", "AWS"],
      workMode: "Hybrid",
    },
    {
      _id: "2",
      title: "Product Manager",
      department: "Product",
      location: "Mumbai",
      employmentType: "Full-time",
      experience: "3-5 years",
      salary: "₹12-18 LPA",
      status: "paused",
      priority: "medium",
      positions: 1,
      postedDate: "2024-01-10",
      deadline: "2024-02-10",
      hiringManager: "Jane Smith",
      description: "Seeking product manager with strong analytical skills...",
      skills: ["Product Strategy", "Analytics", "SQL", "Agile"],
      workMode: "Remote",
    },
    {
      _id: "3",
      title: "UX Designer",
      department: "Design",
      location: "Delhi",
      employmentType: "Contract",
      experience: "2-4 years",
      salary: "₹8-12 LPA",
      status: "closed",
      priority: "low",
      positions: 1,
      postedDate: "2024-01-05",
      deadline: "2024-01-25",
      hiringManager: "Mike Johnson",
      description: "Creative UX designer for mobile applications...",
      skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
      workMode: "On-site",
    },
  ];

  // Uncomment and use actual API
  // const {
  //   data: requisitionData,
  //   isLoading,
  //   isError,
  //   refetch,
  // } = useGetRequisitionsQuery({
  //   searchTerm: debouncedSearchTerm,
  //   page: pagination.current,
  //   pageSize: pagination.pageSize,
  // });

  // Mock loading and error states
  const isLoading = false;
  const isError = false;
  const requisitionData = {
    requisitions: mockRequisitions,
    total: mockRequisitions.length,
  };

  const refetch = () => {
    console.log("Refetching data...");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const requisitions = requisitionData?.requisitions || [];
  const totalCount = requisitionData?.total || 0;

  const handleCreateWorkOrder = (requisition) => {
    // Navigate to create work order page with prefilled data
    navigate(`/admin/add-workorder`, {
      state: {
        requisitionData: requisition,
        prefilled: true,
      },
    });
  };

  const handleViewRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedRequisition(null);
  };

  const showDeleteModal = (requisition) => {
    setRequisitionToDelete(requisition);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setRequisitionToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!requisitionToDelete) return;

    try {
      // await deleteRequisitionApi(requisitionToDelete._id);
      await refetch();
      enqueueSnackbar(
        `Requisition "${requisitionToDelete.title}" deleted successfully`,
        { variant: "success" }
      );
      setDeleteModalVisible(false);
      setRequisitionToDelete(null);
    } catch (error) {
      enqueueSnackbar("Failed to delete requisition", { variant: "error" });
      console.error("Delete error:", error);
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "paused":
        return "orange";
      case "closed":
        return "red";
      default:
        return "blue";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "blue";
    }
  };

  const columns = [
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text) => (
        <Text strong style={{ color: "#2c3e50" }}>
          {text}
        </Text>
      ),
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 120,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: 120,
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Type",
      dataIndex: "employmentType",
      key: "employmentType",
      width: 100,
      render: (text) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: "Experience",
      dataIndex: "experience",
      key: "experience",
      width: 120,
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      width: 130,
      render: (text) => (
        <Text style={{ color: "#52c41a", fontWeight: "500" }}>{text}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: "Active", value: "active" },
        { text: "Paused", value: "paused" },
        { text: "Closed", value: "closed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Tag>
      ),
    },
    {
      title: "Positions",
      dataIndex: "positions",
      key: "positions",
      width: 80,
      render: (count) => (
        <Badge count={count} showZero style={{ backgroundColor: "#52c41a" }} />
      ),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      width: 120,
      render: (date) => (
        <Text style={{ fontSize: "12px" }}>
          {new Date(date).toLocaleDateString()}
        </Text>
      ),
      sorter: (a, b) => new Date(a.deadline) - new Date(b.deadline),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewRequisition(record)}
            />
          </Tooltip>
         
          <Button
            type="primary"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => handleCreateWorkOrder(record)}
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              borderColor: "#da2c46",
            }}
          >
            Create Work Order
          </Button>
        </Space>
      ),
    },
  ];

  if (isError) {
    return (
      <Card style={{ margin: 16 }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Failed to load requisitions"
        />
        <Button onClick={refetch} style={{ marginTop: 16 }}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div
        style={{
          padding: "16px",
          minHeight: "100vh",
          "@media (min-width: 576px)": {
            padding: "24px",
          },
          "@media (min-width: 768px)": {
            padding: "32px",
          },
        }}
      >
        <div className="requisition-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            {/* Title Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: "200px",
              }}
            >
              <FileTextOutlined
                size={24}
                style={{ marginRight: "8px", color: "#2c3e50" }}
              />
              <Title
                level={2}
                className="requisition-title"
                style={{ margin: 0, color: "#2c3e50", fontSize: "22px" }}
              >
                Requisition Management
              </Title>
            </div>

            {/* Search and Button Section */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                flex: 1,
                justifyContent: "flex-end",
                minWidth: "300px",
              }}
            >
              <Input.Search
                placeholder="Search Requisitions"
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  maxWidth: "300px",
                  width: "100%",
                  borderRadius: "8px",
                  height: "35px",
                }}
                size="large"
                className="custom-search-input"
              />

              
            </div>
          </div>
        </div>

        {/* Table */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Table
            columns={columns}
            dataSource={requisitions}
            rowKey="_id"
            loading={isLoading}
            pagination={false}
            scroll={{ x: 1400 }}
            size="middle"
            style={{
              borderRadius: "8px",
              overflow: "hidden",
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div style={{ textAlign: "center" }}>
                      <Text style={{ fontSize: "14px", color: "#7f8c8d" }}>
                        {searchTerm
                          ? "No requisitions match your search"
                          : "No requisitions created yet"}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {searchTerm
                          ? "Try a different search term"
                          : "Create your first requisition to get started"}
                      </Text>
                    </div>
                  }
                />
              ),
            }}
          />

          {/* Pagination */}
          {totalCount > 0 && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={totalCount}
                onChange={handlePaginationChange}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={["10", "20", "50", "100"]}
                showTotal={(total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`
                }
              />
            </div>
          )}
        </Card>
      </div>

      {/* View Requisition Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <InfoCircleOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            Requisition Details
          </div>
        }
        open={viewModalVisible}
        onCancel={handleViewModalClose}
        footer={[
          <Button key="close" onClick={handleViewModalClose}>
            Close
          </Button>,
          <Button
            key="create-work-order"
            type="primary"
            icon={<FileTextOutlined />}
            onClick={() => {
              handleCreateWorkOrder(selectedRequisition);
              handleViewModalClose();
            }}
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            }}
          >
            Create Work Order
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 800 }}
        centered
        destroyOnClose
      >
        {selectedRequisition && (
          <div>
            <Card title="Job Information" style={{ marginBottom: 16 }} size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Job Title">
                  <Text strong>{selectedRequisition.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Department">
                  <Tag color="blue">{selectedRequisition.department}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Location">
                  {selectedRequisition.location}
                </Descriptions.Item>
                <Descriptions.Item label="Work Mode">
                  <Tag color="purple">{selectedRequisition.workMode}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Employment Type">
                  <Tag>{selectedRequisition.employmentType}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Experience Required">
                  {selectedRequisition.experience}
                </Descriptions.Item>
                <Descriptions.Item label="Salary Range">
                  <Text style={{ color: "#52c41a", fontWeight: "500" }}>
                    {selectedRequisition.salary}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Positions">
                  <Badge
                    count={selectedRequisition.positions}
                    showZero
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedRequisition.status)}>
                    {selectedRequisition.status.charAt(0).toUpperCase() +
                      selectedRequisition.status.slice(1)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Priority">
                  <Tag color={getPriorityColor(selectedRequisition.priority)}>
                    {selectedRequisition.priority.charAt(0).toUpperCase() +
                      selectedRequisition.priority.slice(1)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Hiring Manager">
                  {selectedRequisition.hiringManager}
                </Descriptions.Item>
                <Descriptions.Item label="Deadline">
                  {new Date(selectedRequisition.deadline).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Job Description" style={{ marginBottom: 16 }} size="small">
              <Text>{selectedRequisition.description}</Text>
            </Card>

            <Card title="Required Skills" size="small">
              <Space wrap>
                {selectedRequisition.skills?.map((skill, index) => (
                  <Tag key={index} color="geekblue">
                    {skill}
                  </Tag>
                ))}
              </Space>
            </Card>
          </div>
        )}
      </Modal>

      {/* Delete Requisition Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", color: "#ff4d4f" }}>
            <ExclamationCircleOutlined style={{ marginRight: 8, fontSize: 18 }} />
            Delete Requisition
          </div>
        }
        open={deleteModalVisible}
        onCancel={handleDeleteCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleDeleteCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleDeleteConfirm}
            loading={isLoading}
            size="large"
            icon={<DeleteOutlined />}
          >
            Delete Requisition
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          {requisitionToDelete && (
            <>
              <div
                style={{
                  background: "#fff2f0",
                  border: "1px solid #ffccc7",
                  borderRadius: "8px",
                  padding: "12px",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                }}
              >
                <WarningOutlined
                  style={{
                    color: "#ff4d4f",
                    fontSize: "16px",
                    marginTop: "2px",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <Text strong style={{ color: "#ff4d4f" }}>
                    This action cannot be undone
                  </Text>
                  <br />
                  <Text style={{ color: "#8c8c8c" }}>
                    All data associated with this requisition will be permanently deleted.
                  </Text>
                </div>
              </div>

              <div>
                <Text>
                  You are about to delete the requisition{" "}
                  <Text strong style={{ color: "#2c3e50" }}>
                    "{requisitionToDelete.title}"
                  </Text>
                  .
                </Text>
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">
                    Department: <Text strong>{requisitionToDelete.department}</Text>
                  </Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text type="danger">
                    <strong>Warning:</strong> Any ongoing applications for this requisition will be affected.
                  </Text>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AdminRequisition;