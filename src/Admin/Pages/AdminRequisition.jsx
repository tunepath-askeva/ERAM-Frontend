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
import { useGetAdminRequisiionQuery } from "../../Slices/Admin/AdminApis";

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

  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const {
    data: apiResponse,
    isLoading,
    isError,
    refetch,
  } = useGetAdminRequisiionQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    search: debouncedSearchTerm,
  });

  const transformRequisitionData = (data) => {
    if (!data || !data.requisitions) return [];

    return data.requisitions.map((req) => ({
      _id: req._id,
      title: req.title,
      requisitionNo: req.requisitionNo || "N/A",
      referenceNo: req.referenceNo || "N/A",
      department: req.companyIndustry,
      location: req.officeLocation,
      employmentType: req.EmploymentType,
      experience: `${req.experienceMin}-${req.experienceMax} years`,
      salary: `SAR  ${req.salaryMin}-${req.salaryMax}`,
      status: req.isActive,
      priority: "medium",
      positions: req.numberOfCandidate,
      postedDate: new Date(req.createdAt).toISOString().split("T")[0],
      deadline: new Date(req.deadlineDate).toISOString().split("T")[0],
      hiringManager: "Manager",
      description: req.description,
      skills: req.requiredSkills,
      workMode: req.workplace,
      keyResponsibilities: req.keyResponsibilities,
      benefits: req.benefits,
      languages: req.languagesRequired || [],
      clientId: req.client,
      originalData: {
        ...req,
        client: req.client,
      },
    }));
  };

  const requisitions = transformRequisitionData(apiResponse);
  const totalCount = apiResponse?.pagination?.total || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1 on search
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateWorkOrder = (requisition) => {
    console.log(requisition, "hi requireuisurieusrieu siurieruie");
    navigate(`/admin/add-workorder`, {
      state: {
        requisitionData: requisition.originalData,
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

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
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
      title: "Requisition.No",
      dataIndex: "requisitionNo",
      key: "requisitionNo",
      width: 150,
      render: (requisitionNo) => (
        <span style={{ fontWeight: 500, color: "#2c3e50" }}>
          {requisitionNo || "-"}
        </span>
      ),
    },
    {
      title: "Reference.No",
      dataIndex: "referenceNo",
      key: "referenceNo",
      width: 150,
      render: (referenceNo) => (
        <span style={{ fontWeight: 500, color: "#2c3e50" }}>
          {referenceNo || "-"}
        </span>
      ),
    },
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
            disabled={record.status === "inactive"}
            style={{
              background:
                record.status === "inactive"
                  ? "#ccc"
                  : "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              borderColor: record.status === "inactive" ? "#ccc" : "#da2c46",
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
                        {searchTerm ? "Try a different search term" : ""}
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
            disabled={selectedRequisition?.status === "inactive"}
            style={{
              background:
                selectedRequisition?.status === "inactive"
                  ? "#ccc"
                  : "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
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
            <Card
              title="Job Information"
              style={{ marginBottom: 16 }}
              size="small"
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="Job Title">
                  <Text strong>{selectedRequisition.title}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Requisition Number">
                  <Text strong>{selectedRequisition.requisitionNo}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Reference Number">
                  <Text strong>{selectedRequisition.referenceNo}</Text>
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

            <Card
              title="Job Description"
              style={{ marginBottom: 16 }}
              size="small"
            >
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
            <Card
              title="Languages Required"
              size="small"
              style={{ marginTop: 16 }}
            >
              <Space wrap>
                {selectedRequisition.languages?.length > 0 ? (
                  selectedRequisition.languages.map((lang, index) => (
                    <Tag key={index} color="volcano">
                      {lang}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No languages specified</Text>
                )}
              </Space>
            </Card>
          </div>
        )}
      </Modal>
      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
      `}</style>
    </>
  );
};

export default AdminRequisition;
