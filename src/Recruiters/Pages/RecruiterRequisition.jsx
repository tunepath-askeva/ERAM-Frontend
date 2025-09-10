import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  message,
  Modal,
  Descriptions,
  Input,
  Row,
  Col,
  Select,
  DatePicker,
  Pagination,
  Divider,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetClientsQuery,
  useGetRequisitionsQuery,
  useDeleteRequisitionMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const RecruiterRequisition = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [requisitionToDelete, setRequisitionToDelete] = useState(null);
  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );


  const { data: clientData } = useGetClientsQuery();
  const {
    data: requisitionData,
    isLoading: requisitionsLoading,
    refetch,
  } = useGetRequisitionsQuery({
    search: debouncedSearchText,
    filters,
    pagination: {
      page: pagination.current,
      pageSize: pagination.pageSize,
    },
  });

  const [deleteRequisition, { isLoading: isDeleting }] =
    useDeleteRequisitionMutation();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setPagination((prev) => ({ ...prev, current: 1 }));
    }, 700);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Refetch data when returning from add/edit pages
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);

    // Also refetch when component mounts
    refetch();

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch]);

  const clients =
    clientData?.clients?.map((client) => ({
      id: client._id,
      name: client.fullName,
      email: client.email,
    })) || [];

  useEffect(() => {
    if (requisitionData) {
      setPagination((prev) => ({
        ...prev,
        current: requisitionData.page || 1,
        pageSize: requisitionData.limit || 10,
        total: requisitionData.total || 0,
      }));
    }
  }, [requisitionData]);

  // Group requisitions by requisitionNo and referenceNo
  const groupedRequisitions = useMemo(() => {
    if (!requisitionData?.requisition) return [];

    const grouped = {};

    requisitionData.requisition.forEach((req) => {
      const groupKey = `${req.requisitionNo || "N/A"}-${
        req.referenceNo || "N/A"
      }`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          key: groupKey,
          requisitionNo: req.requisitionNo,
          referenceNo: req.referenceNo,
          client: req.client,
          project: req.project,
          count: 0,
          positions: [],
          // Use the first requisition's data for group-level info
          groupData: req,
        };
      }

      grouped[groupKey].positions.push({
        ...req,
        key: req._id,
        status: req.isActive,
      });
      grouped[groupKey].count++;
    });

    return Object.values(grouped);
  }, [requisitionData]);

  const handleAddNew = () => {
    navigate("/recruiter/requisition/add");
  };

  const handleEdit = (record) => {
    navigate(`/recruiter/requisition/edit/${record._id}`);
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const handleDelete = async (id) => {
    try {
      await deleteRequisition(id).unwrap();
      message.success("Requisition deleted successfully");
      refetch();
    } catch (error) {
      console.error("Error deleting requisition:", error);
      if (error.status === 401) {
        message.error("Authentication failed. Please log in again.");
      } else if (error.status === 403) {
        message.error("You don't have permission to delete requisitions.");
      } else if (error.data?.message) {
        message.error(`Deletion failed: ${error.data.message}`);
      } else {
        message.error("Failed to delete requisition. Please try again.");
      }
    } finally {
      setIsDeleteModalVisible(false);
      setRequisitionToDelete(null);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedRequisition(record);
    setIsDetailModalVisible(true);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchText("");
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value || undefined,
    }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleClearAllFilters = () => {
    setSearchText("");
    setFilters({});
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const hasActiveFilters = () => {
    return (
      searchText ||
      Object.keys(filters).some((key) => filters[key] !== undefined)
    );
  };

  const formatSalary = (record) => {
    if (
      !record.salaryMin &&
      record.salaryMin !== 0 &&
      !record.salaryMax &&
      record.salaryMax !== 0
    )
      return "N/A";
    const currency = record.salaryType === "annual" ? "SAR " : "";
    const suffix =
      {
        hourly: "/hr",
        weekly: "/wk",
        monthly: "/mo",
        annual: "/yr",
      }[record.salaryType] || "";

    return `${currency}${record.salaryMin || 0} - ${
      record.salaryMax || 0
    }${suffix}`;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "draft":
        return "orange";
      default:
        return "default";
    }
  };

  const formatStatusText = (status) => {
    if (!status) return "Draft";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Columns for individual positions within a group
  const positionColumns = [
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (text) => text || "N/A",
    },
    {
      title: "Employment Type",
      dataIndex: "EmploymentType",
      key: "EmploymentType",
      width: 120,
      render: (type) => (
        <Tag
          color={
            type === "full-time"
              ? "green"
              : type === "part-time"
              ? "blue"
              : "orange"
          }
        >
          {type || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Experience",
      key: "experience",
      render: (_, record) =>
        `${record.experienceMin || 0} - ${record.experienceMax || 0} years`,
      width: 120,
    },
    {
      title: "Salary",
      key: "salary",
      render: (_, record) => formatSalary(record),
      width: 150,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "N/A"),
      width: 120,
    },
    {
      title: "Approval Status",
      dataIndex: "approvalstatus",
      key: "approvalstatus",
      render: (approvalstatus) => (
        <Tag
          color={
            approvalstatus === "approved"
              ? "green"
              : approvalstatus === "rejected"
              ? "red"
              : "orange"
          }
        >
          {approvalstatus ? approvalstatus.toUpperCase() : "PENDING"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{formatStatusText(status)}</Tag>
      ),
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => handleViewDetails(record)}
            icon={<EyeOutlined />}
            size="small"
          >
            View
          </Button>

          {hasPermission("edit-requisitions") && (
            <Button
              type="link"
              onClick={() => handleEdit(record)}
              icon={<EditOutlined />}
              size="small"
              disabled={record.convertedToWorkorder} // 🔹 disable edit
            >
              Edit
            </Button>
          )}

          {hasPermission("delete-requisitions") && (
            <Button
              type="link"
              danger
              onClick={() => {
                setRequisitionToDelete(record._id);
                setIsDeleteModalVisible(true);
              }}
              icon={<DeleteOutlined />}
              size="small"
              disabled={record.convertedToWorkorder} // 🔹 disable delete
            />
          )}

          {record.convertedToWorkorder && (
            <Tag color="purple">Converted to Work Order</Tag>
          )}
        </Space>
      ),
      width: 150,
      fixed: "right",
    },
  ];

  const customStyles = `
    .ant-btn-primary {
      background-color: #da2c46 !important;
      border-color: #da2c46 !important;
    }
    .ant-btn-primary:hover {
      background-color: #c2253d !important;
      border-color: #c2253d !important;
    }
    .ant-btn-primary:focus {
      background-color: #c2253d !important;
      border-color: #c2253d !important;
    }
    .ant-btn-primary:active {
      background-color: #aa1f34 !important;
      border-color: #aa1f34 !important;
    }
    .search-container {
      margin-bottom: 16px;
    }
    .search-info {
      color: #666;
      font-size: 12px;
      margin-top: 4px;
    }
    .requisition-group-card {
      margin-bottom: 16px;
    }
    .requisition-group-header {
      padding: 12px 16px;
      margin: -16px -16px 16px -16px;
      border-radius: 6px 6px 0 0;
      border-bottom: 1px solid #d9d9d9;
    }
    .group-title {
      font-size: 16px;
      font-weight: 600;
      color: #da2c46;
      margin-bottom: 4px;
    }
    .group-subtitle {
      font-size: 12px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .group-stats {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
  `;

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  return (
    <>
      <style>{customStyles}</style>
      <div style={{ padding: "8px 16px" }}>
        <Card
          title="Client Requisitions"
          extra={
            hasPermission("add-requisitions") && (
              <Button
                type="primary"
                onClick={handleAddNew}
                icon={<PlusOutlined />}
                size="small"
              >
                Create New
              </Button>
            )
          }
          size="small"
        >
          {/* Search and Filter Section */}
          <div className="search-container">
            <Row gutter={[16, 8]} align="middle" style={{ marginBottom: 12 }}>
              <Col xs={24} sm={16} md={12} lg={10}>
                <Input.Search
                  placeholder="Search requisitions by title,requisitionNo and referenceNo..."
                  value={searchText}
                  onChange={handleSearchChange}
                  allowClear
                  enterButton={<SearchOutlined />}
                  onSearch={() => setDebouncedSearchText(searchText)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col xs={24} sm={8} md={6} lg={4}>
                <Button
                  type={showFilters ? "primary" : "default"}
                  icon={<FilterOutlined />}
                  onClick={() => setShowFilters(!showFilters)}
                  size="small"
                >
                  Filters
                </Button>
              </Col>
              <Col xs={24} sm={24} md={6} lg={6}>
                <Space>
                  {hasActiveFilters() && (
                    <Button
                      type="link"
                      size="small"
                      onClick={handleClearAllFilters}
                      style={{ padding: 0 }}
                    >
                      Clear All
                    </Button>
                  )}
                  <div className="search-info">
                    {searchText && (
                      <span>
                        Searching for: <strong>{searchText}</strong>
                      </span>
                    )}
                  </div>
                </Space>
              </Col>
            </Row>

            {/* Filter Controls */}
            {showFilters && (
              <Row
                gutter={[16, 8]}
                style={{
                  marginBottom: 16,
                  padding: "12px",
                  backgroundColor: "#fafafa",
                  borderRadius: "6px",
                }}
              >
                <Col xs={24} sm={12} md={6} lg={6}>
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
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
                    <Option value="draft">Draft</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
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
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <Option value="full-time">Full-time</Option>
                    <Option value="part-time">Part-time</Option>
                    <Option value="contract">Contract</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
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
                    size="small"
                    style={{ width: "100%" }}
                    allowClear
                  />
                </Col>
              </Row>
            )}
          </div>

          {/* Grouped Requisitions Display */}
          <div style={{ minHeight: "400px" }}>
            {requisitionsLoading ? (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                Loading...
              </div>
            ) : groupedRequisitions.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "50px 0",
                  color: "#999",
                }}
              >
                {hasActiveFilters()
                  ? "No requisitions found matching the applied filters"
                  : "No requisitions available"}
              </div>
            ) : (
              groupedRequisitions.map((group) => (
                <Card
                  key={group.key}
                  className="requisition-group-card"
                  size="small"
                >
                  <div className="requisition-group-header">
                    <div className="group-title">
                      Requisition.No: {group.requisitionNo || "N/A"}
                    </div>
                    <div className="group-title">
                      Reference.No: {group.referenceNo || "N/A"}
                    </div>
                    <div className="group-subtitle">
                      <span>
                        <strong>Client:</strong>{" "}
                        {clients.find((c) => c.id === group.client)?.name ||
                          "N/A"}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Project:</strong> {group.project?.name || "N/A"}
                      </span>
                    </div>
                    <div className="group-stats">
                      <Tag color="blue">
                        {group.count} Position{group.count > 1 ? "s" : ""}
                      </Tag>
                      {(() => {
                        const statusCounts = group.positions.reduce(
                          (acc, pos) => {
                            const status = pos.isActive || "draft";
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
                              {formatStatusText(status)}: {count}
                            </Tag>
                          )
                        );
                      })()}
                    </div>
                  </div>

                  <Table
                    columns={positionColumns}
                    dataSource={group.positions}
                    pagination={false}
                    size="small"
                    rowKey="key"
                    scroll={{ x: 1000 }}
                    style={{ marginTop: 0 }}
                  />
                </Card>
              ))
            )}
          </div>

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePaginationChange}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={["10", "20", "50", "100"]}
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
            />
          </div>
        </Card>

        {/* Detail View Modal */}
        <Modal
          title={`Requisition Details - ${selectedRequisition?.title || "N/A"}`}
          visible={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
              Close
            </Button>,

            hasPermission("edit-requisitions") &&
              !selectedRequisition?.convertedToWorkorder && (
                <Button
                  key="edit"
                  type="primary"
                  onClick={() => {
                    setIsDetailModalVisible(false);
                    handleEdit(selectedRequisition);
                  }}
                >
                  Edit
                </Button>
              ),
          ]}
          width={900}
          style={{ top: 20 }}
        >
          {selectedRequisition && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Requisition Number">
                {selectedRequisition.requisitionNo || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Reference Number">
                {selectedRequisition.referenceNo || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Client" span={2}>
                {clients.find((c) => c.id === selectedRequisition.client)
                  ?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Project" span={2}>
                {selectedRequisition.project?.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Job Title" span={2}>
                {selectedRequisition.title || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Employment Type">
                <Tag
                  color={
                    selectedRequisition.EmploymentType === "full-time"
                      ? "green"
                      : selectedRequisition.EmploymentType === "part-time"
                      ? "blue"
                      : "orange"
                  }
                >
                  {selectedRequisition.EmploymentType || "N/A"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Workplace">
                {selectedRequisition.workplace || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Office Location">
                {selectedRequisition.officeLocation || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Job Function">
                {selectedRequisition.jobFunction || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Industry">
                {selectedRequisition.companyIndustry || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Education">
                {selectedRequisition.Education || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {selectedRequisition.experienceMin || 0} -{" "}
                {selectedRequisition.experienceMax || 0} years
              </Descriptions.Item>
              <Descriptions.Item label="Salary">
                {formatSalary(selectedRequisition)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={getStatusColor(selectedRequisition.isActive)}>
                  {formatStatusText(selectedRequisition.isActive)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Number of Candidates">
                {selectedRequisition.numberOfCandidate || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Nationality">
                {selectedRequisition.nationality || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Visa Category">
                {selectedRequisition.visacategory || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Visa Category Type">
                {selectedRequisition.visacategorytype || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {selectedRequisition.startDate
                  ? dayjs(selectedRequisition.startDate).format("YYYY-MM-DD")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {selectedRequisition.endDate
                  ? dayjs(selectedRequisition.endDate).format("YYYY-MM-DD")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Application Deadline">
                {selectedRequisition.deadlineDate
                  ? dayjs(selectedRequisition.deadlineDate).format("YYYY-MM-DD")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Alert Date">
                {selectedRequisition.alertDate
                  ? dayjs(selectedRequisition.alertDate).format("YYYY-MM-DD")
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                  {selectedRequisition.description || "N/A"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Key Responsibilities" span={2}>
                <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                  {selectedRequisition.keyResponsibilities || "N/A"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Qualifications" span={2}>
                <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                  {selectedRequisition.qualification || "N/A"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Requirements" span={2}>
                <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                  {selectedRequisition.jobRequirements || "N/A"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Required Skills" span={2}>
                {selectedRequisition.requiredSkills?.length > 0
                  ? selectedRequisition.requiredSkills.map((skill) => (
                      <Tag key={skill} color="blue" style={{ marginBottom: 4 }}>
                        {skill}
                      </Tag>
                    ))
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Languages" span={2}>
                {selectedRequisition.languagesRequired?.length > 0
                  ? selectedRequisition.languagesRequired.map((lang) => (
                      <Tag key={lang} color="green" style={{ marginBottom: 4 }}>
                        {lang}
                      </Tag>
                    ))
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Benefits" span={2}>
                <div style={{ maxHeight: "80px", overflowY: "auto" }}>
                  {Array.isArray(selectedRequisition.benefits)
                    ? selectedRequisition.benefits.join(", ")
                    : selectedRequisition.benefits || "N/A"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Pipeline Stages" span={2}>
                {selectedRequisition.pipelineStageTimeline?.length > 0 ? (
                  <div>
                    {selectedRequisition.pipelineStageTimeline.map(
                      (stage, index) => (
                        <Tag
                          key={stage._id}
                          color="purple"
                          style={{ marginBottom: 4 }}
                        >
                          {stage.stageName} (Order: {stage.stageOrder})
                        </Tag>
                      )
                    )}
                  </div>
                ) : (
                  "No pipeline stages configured"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Converted to Work Order">
                {selectedRequisition?.convertedToWorkorder ? (
                  <Tag color="purple">Yes</Tag>
                ) : (
                  <Tag color="default">No</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Confirm Delete"
          visible={isDeleteModalVisible}
          onOk={() => handleDelete(requisitionToDelete)}
          onCancel={() => {
            setIsDeleteModalVisible(false);
            setRequisitionToDelete(null);
          }}
          confirmLoading={isDeleting}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to delete this requisition?</p>
          <p>This action cannot be undone.</p>
        </Modal>
      </div>
    </>
  );
};

export default RecruiterRequisition;
