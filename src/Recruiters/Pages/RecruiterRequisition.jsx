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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  ClearOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetClientsQuery,
  useGetRequisitionsQuery,
  useDeleteRequisitionMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import { useNavigate } from "react-router-dom";

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

  const handleAddNew = () => {
    navigate("/recruiter/requisition/add");
  };

  const handleEdit = (record) => {
    navigate(`/recruiter/requisition/edit/${record._id}`);
  };

const handlePaginationChange = (page, pageSize) => {
  setPagination({ current: page, pageSize });
};

  const formattedRequisitions = useMemo(() => {
    if (!requisitionData?.requisition) return [];
    return requisitionData.requisition.map((req) => ({
      ...req,
      key: req._id,
      status: req.isActive || "draft",
    }));
  }, [requisitionData]);

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

  const columns = [
    {
      title: "Req. Number",
      dataIndex: "requisitionNo",
      key: "requisitionNo",
      width: 120,
    },
    {
      title: "Reference Number",
      dataIndex: "referenceNo",
      key: "referenceNo",
      width: 150,
    },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client) => {
        const clientObj = clients.find((c) => c.id === client);
        return clientObj?.name || "N/A";
      },
      width: 150,
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      width: 150,
      render: (project) => project?.name || "N/A",
    },
    {
      title: "Job Title",
      dataIndex: "title",
      key: "title",
      width: 200,
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
          {type}
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
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "active"
              ? "green"
              : status === "inactive"
              ? "red"
              : "default"
          }
        >
          {status || "Draft"}
        </Tag>
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
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            icon={<EditOutlined />}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => {
              setRequisitionToDelete(record._id);
              setIsDeleteModalVisible(true);
            }}
            icon={<DeleteOutlined />}
            size="small"
          />
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
  `;

  return (
    <>
      <style>{customStyles}</style>
      <div style={{ padding: "8px 16px" }}>
        <Card
          title="Client Requisitions"
          extra={
            <Button
              type="primary"
              onClick={handleAddNew}
              icon={<PlusOutlined />}
              size="small"
            >
              Create New
            </Button>
          }
          size="small"
        >
          {/* Search and Filter Section */}
          <div className="search-container">
            <Row gutter={[16, 8]} align="middle" style={{ marginBottom: 12 }}>
              <Col xs={24} sm={16} md={12} lg={10}>
                <Input.Search
                  placeholder="Search requisitions..."
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
                      Client
                    </span>
                  </div>
                  <Select
                    placeholder="Select Client"
                    value={filters.client}
                    onChange={(value) => handleFilterChange("client", value)}
                    allowClear
                    size="small"
                    style={{ width: "100%" }}
                  >
                    {clients.map((client) => (
                      <Option key={client.id} value={client.id}>
                        {client.name}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={12} md={6} lg={6}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      Project
                    </span>
                  </div>
                  <Input
                    placeholder="Filter by project"
                    value={filters.project || ""}
                    onChange={(e) =>
                      handleFilterChange("project", e.target.value)
                    }
                    size="small"
                    style={{ width: "100%" }}
                    allowClear
                  />
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
                <Col xs={24} sm={12} md={6} lg={6}>
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
                    size="small"
                    style={{ width: "100%" }}
                    allowClear
                  />
                </Col>
              </Row>
            )}
          </div>

          <Table
            columns={columns}
            dataSource={formattedRequisitions}
            loading={requisitionsLoading}
            rowKey="key"
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            locale={{
              emptyText: hasActiveFilters()
                ? `No requisitions found matching the applied filters`
                : "No requisitions available",
            }}
          />

          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={handlePaginationChange}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={["10", "20", "50", "100"]}
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
            <Button
              key="edit"
              type="primary"
              onClick={() => {
                setIsDetailModalVisible(false);
                handleEdit(selectedRequisition);
              }}
            >
              Edit
            </Button>,
          ]}
          width={800}
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
                {selectedRequisition.project.name || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Job Title">
                {selectedRequisition.title}
              </Descriptions.Item>
              <Descriptions.Item label="Employment Type">
                <Tag
                  color={
                    selectedRequisition.EmploymentType === "full-time"
                      ? "green"
                      : "blue"
                  }
                >
                  {selectedRequisition.EmploymentType}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Workplace">
                {selectedRequisition.workplace}
              </Descriptions.Item>
              <Descriptions.Item label="Office Location">
                {selectedRequisition.officeLocation || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Job Function">
                {selectedRequisition.jobFunction}
              </Descriptions.Item>
              <Descriptions.Item label="Industry">
                {selectedRequisition.companyIndustry}
              </Descriptions.Item>
              <Descriptions.Item label="Experience">
                {selectedRequisition.experienceMin} -{" "}
                {selectedRequisition.experienceMax} years
              </Descriptions.Item>
              <Descriptions.Item label="Salary">
                {formatSalary(selectedRequisition)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedRequisition.isActive === "active" ? "green" : "red"
                  }
                >
                  {selectedRequisition.isActive}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Number of Candidates">
                {selectedRequisition.numberOfCandidate}
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
                {selectedRequisition.description}
              </Descriptions.Item>
              <Descriptions.Item label="Key Responsibilities" span={2}>
                {selectedRequisition.keyResponsibilities}
              </Descriptions.Item>
              <Descriptions.Item label="Qualifications" span={2}>
                {selectedRequisition.qualification}
              </Descriptions.Item>
              <Descriptions.Item label="Requirements" span={2}>
                {selectedRequisition.jobRequirements}
              </Descriptions.Item>
              <Descriptions.Item label="Required Skills" span={2}>
                {selectedRequisition.requiredSkills?.map((skill) => (
                  <Tag key={skill} color="blue">
                    {skill}
                  </Tag>
                )) || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Languages" span={2}>
                {selectedRequisition.languagesRequired?.map((lang) => (
                  <Tag key={lang} color="green">
                    {lang}
                  </Tag>
                )) || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Benefits" span={2}>
                {Array.isArray(selectedRequisition.benefits)
                  ? selectedRequisition.benefits.join(", ")
                  : selectedRequisition.benefits}
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
        >
          <p>Are you sure you want to delete this requisition?</p>
          <p>This action cannot be undone.</p>
        </Modal>
      </div>
    </>
  );
};

export default RecruiterRequisition;
