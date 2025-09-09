import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Tag,
  Typography,
  Input,
  Select,
  Space,
  Button,
  Badge,
  Tooltip,
  Empty,
  Spin,
  Table,
  Pagination,
  message,
  Form,
  Modal,
  Upload,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  LinkedinOutlined,
  DownloadOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  UploadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  useGetAllBranchedCandidateQuery,
  useUpdateBranchedCandidateMutation,
  useAddCandidateMutation,
  useBulkImportCandidatesMutation,
  useFilterAllCandidatesMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import { useNavigate } from "react-router-dom";
import SkeletonLoader from "../../Global/SkeletonLoader";
import CandidateDetailsDrawer from "./CandidateDetailsDrawer";
import AddCandidateModal from "../Components/AddCandidateModal";
import BulkImportModal from "../Components/BulkImportModal";
import AdvancedFiltersModal from "../Components/AdvancedFiltersModal";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function AllCandidates() {
  const navigate = useNavigate();

  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [addCandidateModalVisible, setAddCandidateModalVisible] =
    useState(false);
  const [bulkUploadModalVisible, setBulkUploadModalVisible] = useState(false);
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);

  // Advanced filters state
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [isAdvancedFilterApplied, setIsAdvancedFilterApplied] = useState(false);
  const [advancedCurrentPage, setAdvancedCurrentPage] = useState(1);
  const [advancedPageSize, setAdvancedPageSize] = useState(10);

  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [filteredTotal, setFilteredTotal] = useState(0);

  const [filters, setFilters] = useState({});
  const [addCandidateForm] = Form.useForm();

  const debouncedSearchTerm = useDebounce(searchTerm, 700);
  const { enqueueSnackbar } = useSnackbar();

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };

    // Only use basic filters for GET API - remove advanced filter logic
    if (debouncedSearchTerm && !isAdvancedFilterApplied) {
      params.search = debouncedSearchTerm;
    }

    if (selectedSkills.length > 0 && !isAdvancedFilterApplied) {
      params.skills = selectedSkills.join(",");
    }

    if (selectedLocation && !isAdvancedFilterApplied) {
      params.location = selectedLocation;
    }

    if (selectedExperience && !isAdvancedFilterApplied) {
      params.experience = selectedExperience;
    }

    if (selectedIndustry && !isAdvancedFilterApplied) {
      params.industry = selectedIndustry;
    }

    return params;
  }, [
    currentPage,
    pageSize,
    debouncedSearchTerm,
    selectedSkills,
    selectedLocation,
    selectedExperience,
    selectedIndustry,
    isAdvancedFilterApplied,
  ]);

  const {
    data: candidatesResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllBranchedCandidateQuery(queryParams, {
    skip: !queryParams,
  });

  const [
    filterCandidates,
    { data, isLoading: filterLoading, error: filterError },
  ] = useFilterAllCandidatesMutation();

  const [updateCandidate, { isLoading: isUpdating }] =
    useUpdateBranchedCandidateMutation();

  const [addCandidate, { isLoading: isAddingCandidate }] =
    useAddCandidateMutation();

  const [bulkImportCandidates, { isLoading: isBulkImporting }] =
    useBulkImportCandidatesMutation();

  const handleApplyFilters = async (appliedFilters) => {
    try {
      setFilters(appliedFilters);
      const response = await filterCandidates({
        ...appliedFilters,
        page: 1,
        limit: pageSize,
      }).unwrap();

      setFilteredCandidates(response?.candidates || []);
      setFilteredTotal(response?.total || response?.candidates?.length || 0);

      setAdvancedFilters(appliedFilters);
      setIsAdvancedFilterApplied(true);

      setAdvancedCurrentPage(1);
      setAdvancedPageSize(pageSize);

      message.success(
        `Found ${
          response?.candidates?.length || 0
        } candidates matching your criteria`
      );
    } catch (error) {
      message.error("Failed to apply filters. Please try again.");
      console.error("Filter error:", error);
    }
  };

  const isRecentlyUpdated = (date) => {
    if (!date) return false;
    const updated = new Date(date);
    const now = new Date();
    const diff = (now - updated) / (1000 * 60 * 60 * 24); // in days
    return diff <= 2;
  };

  const candidates = isAdvancedFilterApplied
    ? filteredCandidates
    : candidatesResponse?.users || [];

  const sortedCandidates = useMemo(() => {
    const recent = candidates.filter((c) => isRecentlyUpdated(c.updatedAt));
    const others = candidates.filter((c) => !isRecentlyUpdated(c.updatedAt));

    // Sort both groups by updatedAt desc
    recent.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    others.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    // Put recent first
    return [...recent, ...others];
  }, [candidates]);

  const totalCandidates = isAdvancedFilterApplied
    ? filteredTotal
    : candidatesResponse?.total || 0;

  const currentPaginationPage = isAdvancedFilterApplied
    ? advancedCurrentPage
    : currentPage;
  const currentPaginationPageSize = isAdvancedFilterApplied
    ? advancedPageSize
    : pageSize;

  const filterOptions = data?.filterOptions || {
    skills: [],
    locations: [],
    industries: [],
    agency: "",
  };

  useEffect(() => {
    if (!isAdvancedFilterApplied && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [
    debouncedSearchTerm,
    selectedSkills,
    selectedLocation,
    selectedExperience,
    selectedIndustry,
    isAdvancedFilterApplied,
  ]);

  const clearFilters = useCallback(() => {
    // Clear basic filters
    setSearchTerm("");
    setSelectedSkills([]);
    setSelectedLocation("");
    setSelectedExperience("");
    setSelectedIndustry("");

    // Clear advanced filters
    setAdvancedFilters({});
    setFilteredCandidates([]);
    setFilteredTotal(0);
    setIsAdvancedFilterApplied(false);

    setCurrentPage(1);

    message.success("All filters cleared");
  }, []);

  const showCandidateDetails = useCallback((candidate) => {
    setSelectedCandidateId(candidate._id);
    setDrawerVisible(true);
  }, []);

  const handleEditCandidate = useCallback((candidate) => {
    setCandidateToEdit(candidate);
    setEditModalVisible(true);
  }, []);

  const handleEdit = useCallback((candidate) => {
    navigate(`/recruiter/allcandidates/${candidate._id}`);
  });

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  const handleEditSubmit = async (updatedData) => {
    try {
      await updateCandidate({
        id: candidateToEdit._id,
        ...updatedData,
      }).unwrap();
      message.success("Candidate updated successfully");
      setEditModalVisible(false);
      setCandidateToEdit(null);
      refetch();
    } catch (error) {
      message.error("Failed to update candidate");
      console.error("Update error:", error);
    }
  };

  const handleAddCandidate = async (candidateData) => {
    try {
      const response = await addCandidate(candidateData).unwrap();
      setAddCandidateModalVisible(false);
      refetch();

      return { success: true, data: response };
    } catch (error) {
      throw error;
    }
  };

  const handleBulkImport = async (candidates) => {
    try {
      const response = await bulkImportCandidates({
        candidates,
        role: "candidate",
      }).unwrap();

      setBulkUploadModalVisible(false);
      refetch();

      return { success: true, data: response };
    } catch (error) {
      console.error("❌ Bulk import error:", error);
      throw error;
    }
  };

  const handleNormalPageChange = useCallback(
    (page, size) => {
      setCurrentPage(page);
      if (size !== pageSize) {
        setPageSize(size);
        setCurrentPage(1);
      }
    },
    [pageSize]
  );

  const handleAdvancedPageChange = useCallback(
    async (page, size) => {
      try {
        const response = await filterCandidates({
          ...advancedFilters,
          page: page,
          limit: size,
        }).unwrap();

        setFilteredCandidates(response?.candidates || []);
        setFilteredTotal(response?.total || response?.candidates?.length || 0);
        setAdvancedCurrentPage(page);
        if (size !== advancedPageSize) {
          setAdvancedPageSize(size);
        }
      } catch (error) {
        message.error("Failed to load more candidates");
        console.error("Pagination error:", error);
      }
    },
    [advancedFilters, advancedPageSize, filterCandidates]
  );

  const currentPaginationHandler = isAdvancedFilterApplied
    ? handleAdvancedPageChange
    : handleNormalPageChange;

  const handleSearchChange = useCallback(
    (e) => {
      // If advanced filters are applied, clear them when using basic search
      if (isAdvancedFilterApplied) {
        setAdvancedFilters({});
        setIsAdvancedFilterApplied(false);
      }
      setSearchTerm(e.target.value);
    },
    [isAdvancedFilterApplied]
  );

  const buttonStyle = {
    background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
    border: "none",
    color: "white",
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: "fullName",
      render: (text, record) => (
        <Space>
          <Avatar src={record.image} icon={<UserOutlined />} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {text}
          {isRecentlyUpdated(record.updatedAt) && (
  <Tooltip title="Recently updated profile within the last 2 days">
    <span className="glow-dot" />
  </Tooltip>
)}

            </div>
            <Text type="secondary">{record.title || "No title"}</Text>
          </div>
        </Space>
      ),
    },

    {
      title: "Contact",
      dataIndex: "email",
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary">{record.phone || "No phone"}</Text>
        </div>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      render: (text) => text || "Not specified",
    },
    {
      title: "Experience",
      dataIndex: "totalExperienceYears",
      render: (text) => (text ? `${text} years` : "Not specified"),
    },
    {
      title: "Skills",
      dataIndex: "skills",
      render: (skills) => (
        <div style={{ maxWidth: 200 }}>
          {skills && skills.length > 0 ? (
            <Space wrap size={[4, 4]}>
              {skills.slice(0, 3).map((skill) => (
                <Tag
                  key={skill}
                  color="blue"
                  style={{ fontSize: 10, margin: 0 }}
                >
                  {skill.length > 10 ? `${skill.substring(0, 10)}...` : skill}
                </Tag>
              ))}
              {skills.length > 3 && (
                <Tag style={{ fontSize: 10, margin: 0 }}>
                  +{skills.length - 3}
                </Tag>
              )}
            </Space>
          ) : (
            <Text type="secondary">No skills</Text>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "accountStatus",
      render: (status, record) => (
        <Space>
          <Tag color={status === "active" ? "green" : "red"}>{status}</Tag>
          {record.candidateType && (
            <Tag color={record.candidateType === "Khafalath" ? "gold" : "blue"}>
              {record.candidateType}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => showCandidateDetails(record)}
          />
          {hasPermission("edit-candidate-details") && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          )}
        </Space>
      ),
    },
  ];

  const isLoadingData = isAdvancedFilterApplied ? filterLoading : isLoading;

  if (isLoadingData && currentPage === 1) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <SkeletonLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Title level={4} type="danger">
          Error loading candidates
        </Title>
        <Text>Please try again later.</Text>
        <Button onClick={refetch} style={{ marginLeft: 8 }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} sm={16} md={12}>
            <Title
              level={2}
              style={{ margin: 0, fontSize: "clamp(1.2rem, 4vw, 2rem)" }}
            >
              All Candidates
            </Title>
            <Text type="secondary">
              Manage and track your candidates in branch
              {isAdvancedFilterApplied && (
                <Badge
                  count="Advanced Filters Active"
                  style={{
                    backgroundColor: "#da2c46",
                    marginLeft: 8,
                    fontSize: "10px",
                  }}
                />
              )}
            </Text>
          </Col>
          <Col xs={24} sm={8} md={12}>
            <Space
              size="small"
              style={{ width: "100%", justifyContent: "flex-end" }}
            >
              {hasPermission("bulk-upload") && (
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  onClick={() => setBulkUploadModalVisible(true)}
                >
                  Bulk Upload
                </Button>
              )}
              {hasPermission("add-candidate") && (
                <Button
                  style={buttonStyle}
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={() => setAddCandidateModalVisible(true)}
                >
                  Add Candidate
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={12}>
            <Search
              placeholder="Search candidates, skills, email, title..."
              value={searchTerm}
              onChange={handleSearchChange}
              prefix={<SearchOutlined />}
              allowClear
              loading={isLoading && searchTerm !== debouncedSearchTerm}
              disabled={isAdvancedFilterApplied}
            />
            {isAdvancedFilterApplied && (
              <Text type="secondary" style={{ fontSize: "12px", marginTop: 4 }}>
                Basic search disabled while advanced filters are active
              </Text>
            )}
          </Col>

          <Col xs={24} sm={12} md={8} lg={12}>
            <Space>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setAdvancedFiltersVisible(true)}
                type={isAdvancedFilterApplied ? "primary" : "default"}
                style={isAdvancedFilterApplied ? buttonStyle : {}}
              >
                Advanced Filters
              </Button>
              <Button onClick={clearFilters} icon={<FilterOutlined />}>
                Clear All Filters
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {candidates.length === 0 && !isLoading ? (
        <Empty
          description={
            isAdvancedFilterApplied
              ? "No candidates found matching your advanced filter criteria"
              : debouncedSearchTerm ||
                selectedSkills.length > 0 ||
                selectedLocation ||
                selectedExperience ||
                selectedIndustry
              ? "No candidates found matching your criteria"
              : "No candidates found"
          }
          style={{ marginTop: "50px" }}
        />
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={sortedCandidates}
            rowKey="_id"
            pagination={false}
            scroll={{ x: true }}
            bordered
            loading={isLoadingData}
          />

          <div style={{ marginTop: 16, marginBottom: 16, textAlign: "center" }}>
            <Pagination
              current={currentPaginationPage}
              pageSize={currentPaginationPageSize}
              total={totalCandidates}
              onChange={currentPaginationHandler}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} candidates`
              }
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        </>
      )}

      <CandidateDetailsDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        candidateId={selectedCandidateId}
      />

      <AddCandidateModal
        visible={addCandidateModalVisible}
        onCancel={() => setAddCandidateModalVisible(false)}
        onSubmit={handleAddCandidate}
        form={addCandidateForm}
        isSubmitting={isAddingCandidate}
      />

      <BulkImportModal
        visible={bulkUploadModalVisible}
        onCancel={() => setBulkUploadModalVisible(false)}
        onImport={handleBulkImport}
      />

      <AdvancedFiltersModal
        visible={advancedFiltersVisible}
        onCancel={() => setAdvancedFiltersVisible(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={advancedFilters}
        filterOptions={filterOptions}
      />

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
    </div>
  );
}

export default AllCandidates;
