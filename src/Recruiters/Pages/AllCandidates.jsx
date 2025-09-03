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
  const [filters, setFilters] = useState({});
  const [addCandidateForm] = Form.useForm();

  const debouncedSearchTerm = useDebounce(searchTerm, 700);
  const { enqueueSnackbar } = useSnackbar();

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
    };

    if (debouncedSearchTerm) {
      params.search = debouncedSearchTerm;
    }

    if (selectedSkills.length > 0) {
      params.skills = selectedSkills.join(",");
    }

    if (selectedLocation) {
      params.location = selectedLocation;
    }

    if (selectedExperience) {
      params.experience = selectedExperience;
    }

    if (selectedIndustry) {
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
  ]);

  const {
    data: candidatesResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllBranchedCandidateQuery(queryParams);
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
    setFilters(appliedFilters);
    await filterCandidates(appliedFilters).unwrap();
  };

  const candidates = candidatesResponse?.users || [];
  const totalCandidates = candidatesResponse?.total || 0;
  const filterOptions = data?.filterOptions || {
    skills: [],
    locations: [],
    industries: [],
    agency: "",
  };

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [
    debouncedSearchTerm,
    selectedSkills,
    selectedLocation,
    selectedExperience,
    selectedIndustry,
  ]);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedSkills([]);
    setSelectedLocation("");
    setSelectedExperience("");
    setSelectedIndustry("");
    setCurrentPage(1);
  }, []);

  const showCandidateDetails = useCallback((candidate) => {
    setSelectedCandidateId(candidate._id); // store only ID
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

  const handlePageChange = useCallback(
    (page, size) => {
      setCurrentPage(page);
      if (size !== pageSize) {
        setPageSize(size);
        setCurrentPage(1);
      }
    },
    [pageSize]
  );

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

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
          <div>
            <div>{text}</div>
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

  if (isLoading && currentPage === 1) {
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
          <Col xs={24} sm={12} md={8} lg={18}>
            <Search
              placeholder="Search candidates, skills, email, title..."
              value={searchTerm}
              onChange={handleSearchChange}
              prefix={<SearchOutlined />}
              allowClear
              loading={isLoading && searchTerm !== debouncedSearchTerm}
            />
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Button onClick={clearFilters} icon={<FilterOutlined />}>
              Clear Search
            </Button>
          </Col>
        </Row>
      </Card>

      {candidates.length === 0 && !isLoading ? (
        <Empty
          description={
            debouncedSearchTerm ||
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
            dataSource={candidates}
            rowKey="_id"
            pagination={false}
            scroll={{ x: true }}
            bordered
            loading={isLoading}
          />

          <div style={{ marginTop: 16, marginBottom: 16, position: "center" }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalCandidates}
              onChange={handlePageChange}
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

      {/* Bulk Import Modal */}
      <BulkImportModal
        visible={bulkUploadModalVisible}
        onCancel={() => setBulkUploadModalVisible(false)}
        onImport={handleBulkImport}
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
