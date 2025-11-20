import React, { useState, useEffect, useMemo } from "react";
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
  Row,
  Col,
  Divider,
  Select,
  Collapse,
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
  FilterOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useGetAdminRequisiionQuery } from "../../Slices/Admin/AdminApis";
import dayjs from "dayjs";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const AdminRequisition = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeKeys, setActiveKeys] = useState([]);

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
    filters,
  });

  // Transform and group requisitions
  const { groupedRequisitions, totalCount } = useMemo(() => {
    if (!apiResponse || !apiResponse.requisitions) {
      return { groupedRequisitions: [], totalCount: 0 };
    }

    // First transform the data
    const transformedRequisitions = apiResponse.requisitions.map((req) => ({
      _id: req._id,
      title: req.title,
      requisitionNo: req.requisitionNo || "N/A",
      projectName: req.project?.name || "PROJECT",
      clientName: req.client?.fullName || "Client Name",
      referenceNo: req.referenceNo || "N/A",
      department: req.companyIndustry,
      location: req.officeLocation,
      employmentType: req.EmploymentType,
      experience: `${req.experienceMin}-${req.experienceMax} years`,
      salary: `SAR ${req.salaryMin}-${req.salaryMax}`,
      status: req.isActive,
      overallapprovalstatus: req.overallapprovalstatus,
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
        _id: req._id,
        client: req.client,
      },
    }));

    // Then group by requisitionNo and referenceNo
    const grouped = {};

    transformedRequisitions.forEach((req) => {
      const groupKey = `${req.requisitionNo}-${req.referenceNo}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          key: groupKey,
          requisitionNo: req.requisitionNo,
          referenceNo: req.referenceNo,
          clientName: req.clientName, // <-- FIX
          projectName: req.projectName, // <-- FIX
          count: 0,
          positions: [],
          groupData: req, // Use first requisition's data for group info
        };
      }

      grouped[groupKey].positions.push({
        ...req,
        key: req._id,
      });
      grouped[groupKey].count++;
    });

    return {
      groupedRequisitions: Object.values(grouped),
      totalCount: apiResponse.pagination?.total || 0,
    };
  }, [apiResponse]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateWorkOrder = (requisition) => {
    console.log("Creating work order for requisition:", requisition);

    navigate(`/admin/add-workorder`, {
      state: {
        requisitionData: {
          ...requisition.originalData,
          _id: requisition.originalData._id,
          client:
            requisition.originalData.client ||
            requisition.originalData.clientId,
          project:
            requisition.originalData.project ||
            requisition.originalData.projectId,
        },
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

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value || undefined,
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const hasActiveFilters = () => {
    return (
      searchTerm ||
      Object.keys(filters).some((key) => filters[key] !== undefined)
    );
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

  // Columns for individual positions within a group
  const positionColumns = [
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
      title: "Approval Status",
      dataIndex: "overallapprovalstatus",
      key: "overallapprovalstatus",
      width: 130,
      render: (status) => (
        <Tag
          color={
            status === "approved"
              ? "green"
              : status === "rejected"
              ? "red"
              : "orange"
          }
        >
          {status ? status.toUpperCase() : "PENDING"}
        </Tag>
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

          {!record.originalData.convertedToWorkorder && (
            <Button
              type="primary"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleCreateWorkOrder(record)}
              disabled={
                record.status === "inactive" ||
                record.overallapprovalstatus === "pending"
              }
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
          )}
        </Space>
      ),
    },
  ];

  const customStyles = `
    .ant-collapse-header {
      background-color: #fafafa !important;
      font-weight: 600 !important;
    }
    .ant-collapse-content-box {
      padding: 16px !important;
    }
    .ant-btn-primary {
      background-color: #da2c46 !important;
      border-color: #da2c46 !important;
    }
    .ant-btn-primary:hover {
      background-color: #c2253d !important;
      border-color: #c2253d !important;
    }
    .collapse-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding-right: 24px;
    }
    .collapse-header-left {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .collapse-header-title {
      font-size: 15px;
      color: #da2c46;
      font-weight: 600;
    }
     .collapse-status-title {
      font-size: 12px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .collapse-header-stats {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
  `;

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
      <style>{customStyles}</style>
      <div
        style={{
          padding: "16px",
          minHeight: "100vh",
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
              <Search
                placeholder="Search Requisitions"
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  maxWidth: "300px",
                  width: "100%",
                }}
                size="large"
              />
              <Button
                type={showFilters ? "primary" : "default"}
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                size="large"
              >
                Filters
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <Card
              size="small"
              style={{
                marginBottom: 16,
                backgroundColor: "#fafafa",
              }}
            >
              <Row gutter={[16, 8]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Status
                    </span>
                  </div>
                  <Select
                    placeholder="Select Status"
                    value={filters.status}
                    onChange={(value) => handleFilterChange("status", value)}
                    allowClear
                    style={{ width: "100%" }}
                  >
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="draft">Draft</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Employment Type
                    </span>
                  </div>
                  <Select
                    placeholder="Select Type"
                    value={filters.employmentType}
                    onChange={(value) =>
                      handleFilterChange("employmentType", value)
                    }
                    allowClear
                    style={{ width: "100%" }}
                  >
                    <Option value="full-time">Full-time</Option>
                    <Option value="part-time">Part-time</Option>
                    <Option value="contract">Contract</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Reference No
                    </span>
                  </div>
                  <Input
                    placeholder="Filter by reference no"
                    value={filters.referenceNo || ""}
                    onChange={(e) =>
                      handleFilterChange("referenceNo", e.target.value)
                    }
                    style={{ width: "100%" }}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Requisition No
                    </span>
                  </div>
                  <Input
                    placeholder="Filter by requisition no"
                    value={filters.requisitionNo || ""}
                    onChange={(e) =>
                      handleFilterChange("requisitionNo", e.target.value)
                    }
                    style={{ width: "100%" }}
                    allowClear
                  />
                </Col>
              </Row>
              {hasActiveFilters() && (
                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Button
                    type="link"
                    onClick={handleClearAllFilters}
                    style={{ padding: 0 }}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Grouped Requisitions with Collapse */}
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.95)",
          }}
        >
          {isLoading ? (
            <div>
              <SkeletonLoader />
            </div>
          ) : groupedRequisitions.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ textAlign: "center" }}>
                  <Text style={{ fontSize: "14px", color: "#7f8c8d" }}>
                    {hasActiveFilters()
                      ? "No requisitions match your search"
                      : "No requisitions created yet"}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {hasActiveFilters() ? "Try a different search term" : ""}
                  </Text>
                </div>
              }
            />
          ) : (
            <Collapse
              activeKey={activeKeys}
              onChange={setActiveKeys}
              style={{ backgroundColor: "transparent", border: "none" }}
            >
              {groupedRequisitions.map((group) => (
                <Panel
                  key={group.key}
                  header={
                    <div className="collapse-header-content">
                      <div className="collapse-header-left">
                        <div className="collapse-header-title">
                          Requisition No: {group.requisitionNo || "N/A"} |
                          Reference No: {group.referenceNo || "N/A"}
                        </div>
                        <div className="collapse-status-title">
                          <span>
                            <strong>Client:</strong> {group.clientName}
                          </span>
                          <span>•</span>
                          <span>
                            <strong>Project:</strong>{" "}
                            {group.projectName || "N/A"}
                          </span>
                        </div>
                        <div className="collapse-header-stats">
                          <Tag color="blue">
                            {group.count} Position{group.count > 1 ? "s" : ""}
                          </Tag>
                          {(() => {
                            const statusCounts = group.positions.reduce(
                              (acc, pos) => {
                                const status = pos.status || "draft";
                                acc[status] = (acc[status] || 0) + 1;
                                return acc;
                              },
                              {}
                            );

                            return Object.entries(statusCounts).map(
                              ([status, count]) => (
                                <Tag
                                  key={status}
                                  color={getStatusColor(status)}
                                  size="small"
                                >
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                  : {count}
                                </Tag>
                              )
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  }
                  style={{
                    marginBottom: 16,
                    borderRadius: "8px",
                    border: "1px solid #d9d9d9",
                  }}
                >
                  <Table
                    columns={positionColumns}
                    dataSource={group.positions}
                    pagination={false}
                    size="small"
                    rowKey="key"
                    scroll={{ x: 1000 }}
                  />
                </Panel>
              ))}
            </Collapse>
          )}

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
          ...(selectedRequisition?.originalData?.convertedToWorkorder
            ? []
            : [
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
              ]),
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
    </>
  );
};

export default AdminRequisition;
