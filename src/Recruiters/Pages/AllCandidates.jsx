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
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  LinkedinOutlined,
  GithubOutlined,
  TwitterOutlined,
  FacebookOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useGetAllBranchedCandidateQuery,
  useUpdateBranchedCandidateMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateDetailsDrawer from "./CandidateDetailsDrawer";
import CandidateEditModal from "./CandidateEditModal";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 700);

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

  const [updateCandidate, { isLoading: isUpdating }] =
    useUpdateBranchedCandidateMutation();

  const candidates = candidatesResponse?.users || [];
  const totalCandidates = candidatesResponse?.total || 0;
  const filterOptions = candidatesResponse?.filterOptions || {
    skills: [],
    locations: [],
    industries: [],
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
    setSelectedCandidate(candidate);
    setDrawerVisible(true);
  }, []);

  const handleEditCandidate = useCallback((candidate) => {
    setCandidateToEdit(candidate);
    setEditModalVisible(true);
  }, []);

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
          <Badge status={status === "active" ? "success" : "error"} />
          <Tag color={record.candidateType === "Khafalath" ? "gold" : "green"}>
            {record.candidateType}
          </Tag>
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
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditCandidate(record)}
          />
        </Space>
      ),
    },
  ];

  if (isLoading && currentPage === 1) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading candidates...</div>
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
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>All Candidates</Title>
        <Text type="secondary">
          Showing {candidates.length} of {totalCandidates} candidates
        </Text>
      </div>

      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
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
            <Select
              mode="multiple"
              placeholder="Select skills"
              value={selectedSkills}
              onChange={setSelectedSkills}
              style={{ width: "100%" }}
              maxTagCount={2}
              loading={isLoading}
            >
              {filterOptions.skills.map((skill) => (
                <Option key={skill} value={skill}>
                  {skill}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Select location"
              value={selectedLocation}
              onChange={setSelectedLocation}
              style={{ width: "100%" }}
              allowClear
              loading={isLoading}
            >
              {filterOptions.locations.map((location) => (
                <Option key={location} value={location}>
                  {location}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Experience"
              value={selectedExperience}
              onChange={setSelectedExperience}
              style={{ width: "100%" }}
              allowClear
            >
              <Option value="0-1">0-1 years</Option>
              <Option value="1-2">1-2 years</Option>
              <Option value="2-5">2-5 years</Option>
              <Option value="5+">5+ years</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Select
              placeholder="Industry"
              value={selectedIndustry}
              onChange={setSelectedIndustry}
              style={{ width: "100%" }}
              allowClear
              loading={isLoading}
            >
              {filterOptions.industries.map((industry) => (
                <Option key={industry} value={industry}>
                  {industry}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button onClick={clearFilters} icon={<FilterOutlined />}>
              Clear Filters
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
          <div style={{ marginTop: 16, textAlign: "right" }}>
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
        candidate={selectedCandidate}
      />

      <CandidateEditModal
        visible={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setCandidateToEdit(null);
        }}
        onSubmit={handleEditSubmit}
        candidate={candidateToEdit}
      />
    </div>
  );
}

export default AllCandidates;
