import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Card,
  Spin,
  Alert,
  Typography,
  Row,
  Col,
  Empty,
  Button,
  Space,
  Input,
  Select,
  Divider,
  InputNumber,
  Badge,
  Tabs,
  Modal,
  Descriptions,
  Tag,
  message,
  Skeleton,
  Pagination,
  AutoComplete,
  Slider,
  Checkbox,
  Form,
  Collapse,
  Avatar,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  CheckOutlined,
  EyeOutlined,
  CloseOutlined,
  FilterOutlined,
  ClearOutlined,
  EnvironmentOutlined,
  BankOutlined,
  DollarOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  useGetJobApplicationsQuery,
  useUpdateCandidateStatusMutation,
  useGetSourcedCandidateQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Panel } = Collapse;
const { Option } = Select;

const initialFilters = {
  keywords: "",
  experience: [0, 20],
  qualifications: [],
  skills: [],
  location: "",
  company: "",
  salary: [0, 2000000],
  jobRoles: [],
  industries: [],
  gender: null,
  nationality: null,
  ageRange: [18, 70],
  noticePeriod: null,
  profileUpdated: null,
  visaStatus: null,
  languages: [],
};

const locationOptions = [
  { value: "Dubai" },
  { value: "Abu Dhabi" },
  { value: "Sharjah" },
  { value: "Riyadh" },
  { value: "Jeddah" },
  { value: "Doha" },
  { value: "Manama" },
  { value: "Kuwait City" },
  { value: "Muscat" },
];

const industryOptions = [
  { value: "IT", label: "Information Technology" },
  { value: "Banking", label: "Banking & Finance" },
  { value: "Construction", label: "Construction" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Retail", label: "Retail" },
  { value: "Oil & Gas", label: "Oil & Gas" },
];

const jobRoleOptions = [
  { value: "Software Engineer", label: "Software Engineer" },
  { value: "Project Manager", label: "Project Manager" },
  { value: "Accountant", label: "Accountant" },
  { value: "HR Manager", label: "HR Manager" },
  { value: "Sales Executive", label: "Sales Executive" },
  { value: "Marketing Manager", label: "Marketing Manager" },
];

const qualificationOptions = [
  { value: "B.Tech", label: "Bachelor of Technology" },
  { value: "MBA", label: "Master of Business Administration" },
  { value: "B.Com", label: "Bachelor of Commerce" },
  { value: "M.Tech", label: "Master of Technology" },
  { value: "PhD", label: "Doctor of Philosophy" },
];

const nationalityOptions = [
  { value: "Indian", label: "Indian" },
  { value: "Pakistani", label: "Pakistani" },
  { value: "Bangladeshi", label: "Bangladeshi" },
  { value: "Filipino", label: "Filipino" },
  { value: "Emirati", label: "Emirati" },
  { value: "Saudi", label: "Saudi" },
];

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Arabic", label: "Arabic" },
  { value: "Hindi", label: "Hindi" },
  { value: "Urdu", label: "Urdu" },
  { value: "Malayalam", label: "Malayalam" },
  { value: "Tagalog", label: "Tagalog" },
];

const SourcedCandidates = ({ jobId }) => {
  const [activeTab, setActiveTab] = useState("sourced");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [filters, setFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState({ ...initialFilters });
  const [shouldFetch, setShouldFetch] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [queryParams, setQueryParams] = useState("");

  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();

    params.append("page", pagination.current.toString());
    params.append("limit", pagination.pageSize.toString());

    if (filters.keywords) {
      params.append("keywords", filters.keywords);
    }
    if (filters.experience[0] > 0 || filters.experience[1] < 30) {
      params.append("minExperience", filters.experience[0].toString());
      params.append("maxExperience", filters.experience[1].toString());
    }
    if (filters.qualifications?.length > 0) {
      params.append("qualifications", filters.qualifications.join(","));
    }
    if (filters.skills?.length > 0) {
      params.append("skills", filters.skills.join(","));
    }
    if (filters.location) {
      params.append("location", filters.location);
    }
    if (filters.company) {
      params.append("company", filters.company);
    }
    if (filters.jobRoles?.length > 0) {
      params.append("jobRoles", filters.jobRoles.join(","));
    }
    if (filters.industries?.length > 0) {
      params.append("industries", filters.industries.join(","));
    }
    if (filters.salary[0] > 0 || filters.salary[1] < 2000000) {
      params.append("minSalary", filters.salary[0].toString());
      params.append("maxSalary", filters.salary[1].toString());
    }
    if (filters.gender) {
      params.append("gender", filters.gender);
    }
    if (filters.nationality) {
      params.append("nationality", filters.nationality);
    }
    if (filters.ageRange[0] > 18 || filters.ageRange[1] < 70) {
      params.append("minAge", filters.ageRange[0].toString());
      params.append("maxAge", filters.ageRange[1].toString());
    }
    if (filters.noticePeriod) {
      params.append("noticePeriod", filters.noticePeriod);
    }
    if (filters.profileUpdated) {
      params.append("profileUpdated", filters.profileUpdated);
    }

    if (filters.visaStatus) {
      params.append("visaStatus", filters.visaStatus);
    }
    if (filters.languages?.length > 0) {
      params.append("languages", filters.languages.join(","));
    }

    return params.toString();
  }, [filters, pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (shouldFetch) {
      const params = buildQueryParams();
      setQueryParams(params);
    }
  }, [buildQueryParams, shouldFetch]);

  const {
    data: sourcedCandidatesData,
    isLoading: isSourcedLoading,
    error: sourcedError,
    refetch: refetchSourced,
  } = useGetSourcedCandidateQuery(queryParams, {
    skip: !shouldFetch || !queryParams,
  });

  const {
    data: jobApplications,
    isLoading: jobLoading,
    error: jobError,
    refetch: jobRefetch,
  } = useGetJobApplicationsQuery(jobId);

  useEffect(() => {
    if (sourcedCandidatesData) {
      setPagination((prev) => ({
        ...prev,
        total:
          sourcedCandidatesData.total ||
          sourcedCandidatesData.users?.length ||
          0,
      }));
    }
  }, [sourcedCandidatesData]);

  const allCandidates = useMemo(() => {
    const jobAppCandidates =
      jobApplications?.formResponses?.map((response) => ({
        ...response.user,
        status: response.status,
        applicationId: response._id,
        responses: response.responses,
        isApplied: true,
      })) || [];

    const sourcedCandidates =
      sourcedCandidatesData?.users?.map((user) => ({
        ...user,
        status: user.status || "sourced",
        applicationId: user._id,
        isApplied: false,
        isSourced: true,
        // Map additional fields that might be missing
        currentCompany:
          user.workExperience?.[0]?.company || user.currentCompany,
        totalExperienceYears: user.totalExperienceYears || 0,
      })) || [];

    const candidatesMap = new Map();

    [...sourcedCandidates, ...jobAppCandidates].forEach((candidate) => {
      if (!candidatesMap.has(candidate._id)) {
        candidatesMap.set(candidate._id, candidate);
      } else {
        const existing = candidatesMap.get(candidate._id);
        candidatesMap.set(candidate._id, {
          ...existing,
          ...candidate,
          isApplied: existing.isApplied || candidate.isApplied,
          status: candidate.status || existing.status,
        });
      }
    });

    return Array.from(candidatesMap.values());
  }, [jobApplications, sourcedCandidatesData]);

  const { sourcedCandidates, selectedCandidatesList } = useMemo(() => {
    const sourced = shouldFetch
      ? allCandidates.filter((candidate) => {
        const status = candidate.status;
        return (
          !status ||
          status === "sourced" ||
          status === "applied" ||
          candidate.isSourced
        );
      })
      : [];

    const selected = allCandidates.filter(
      (candidate) => candidate.status === "selected"
    );

    return { sourcedCandidates: sourced, selectedCandidatesList: selected };
  }, [allCandidates, shouldFetch]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.skills.length > 0 ||
      filters.location ||
      filters.company ||
      filters.qualification ||
      filters.jobRole ||
      filters.experience[0] > 0 ||
      filters.experience[1] < 20 ||
      filters.salary[0] > 0 ||
      filters.salary[1] < 100000
    );
  }, [filters]);

  const showFilterModal = () => {
    setTempFilters({ ...filters });
    setIsFilterModalVisible(true);
  };

  const handleFilterModalOk = () => {
    setFilters({ ...tempFilters });
    setShouldFetch(true);
    setPagination((prev) => ({ ...prev, current: 1 }));
    setIsFilterModalVisible(false);
  };

  const handleFilterModalCancel = () => {
    setIsFilterModalVisible(false);
  };

  const handleClearSearch = () => {
    setFilters(initialFilters);
    setTempFilters(initialFilters);
    setSkillInput("");
    setShouldFetch(false);
    setQueryParams("");
    setPagination((prev) => ({ ...prev, current: 1, total: 0 }));
    setSelectedCandidates([]);
    setSelectAll(false);
  };

  const handleSkillAdd = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !tempFilters.skills.includes(trimmedSkill)) {
      setTempFilters((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill],
      }));
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setTempFilters((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleCandidateSelect = (candidateId, checked) => {
    setSelectedCandidates((prev) =>
      checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const currentPageIds = sourcedCandidates.map((c) => c._id);
    setSelectedCandidates((prev) =>
      checked
        ? [...new Set([...prev, ...currentPageIds])]
        : prev.filter((id) => !currentPageIds.includes(id))
    );
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (selectedCandidates.length === 0) return;

    try {
      const updatePromises = selectedCandidates.map((candidateId) => {
        const candidate = allCandidates.find((c) => c._id === candidateId);
        if (!candidate) return Promise.resolve();

        return updateCandidateStatus({
          applicationId: candidate.applicationId,
          Id: candidate._id,
          status: newStatus,
          jobId: jobId,
          isSourced: true,
        }).unwrap();
      });

      await Promise.all(updatePromises);

      message.success(
        `Successfully moved ${selectedCandidates.length} candidates to ${newStatus}`
      );

      setSelectedCandidates([]);
      setSelectAll(false);
      refetchSourced();
      jobRefetch();
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error("Failed to update some candidate statuses");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedCandidate) return;

    try {
      await updateCandidateStatus({
        applicationId: selectedCandidate.applicationId,
        Id: selectedCandidate._id,
        status: newStatus,
        jobId: jobId,
        isSourced: true,
      }).unwrap();

      message.success(`Candidate moved to ${newStatus} successfully`);
      refetchSourced();
      jobRefetch();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error(error.data?.message || "Failed to update candidate status");
    }
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize,
    }));
    setSelectAll(false);
  };

  const getModalButtonText = () => {
    if (!selectedCandidate) return "Update Status";
    const currentStatus = selectedCandidate.status;

    if (
      !currentStatus ||
      currentStatus === "sourced" ||
      currentStatus === "applied"
    ) {
      return "Move to Selected";
    } else if (currentStatus === "selected") {
      return "Move to Screening";
    }
    return "Update Status";
  };

  const getNextStatus = () => {
    if (!selectedCandidate) return "selected";
    const currentStatus = selectedCandidate.status;

    if (
      !currentStatus ||
      currentStatus === "sourced" ||
      currentStatus === "applied"
    ) {
      return "selected";
    } else if (currentStatus === "selected") {
      return "screening";
    }
    return "selected";
  };

  const getCandidateStatusTag = (status, isApplied) => {
    if (!status || status === "sourced") {
      return isApplied ? (
        <Tag color="blue">Applied</Tag>
      ) : (
        <Tag color="default">Sourced</Tag>
      );
    }

    const statusColors = {
      applied: "blue",
      selected: "green",
      screening: "orange",
      hired: "purple",
      rejected: "red",
    };

    return (
      <Tag color={statusColors[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Tag>
    );
  };

  // Debug logging
  useEffect(() => {
    console.log("Debug - sourcedCandidatesData:", sourcedCandidatesData);
    console.log("Debug - sourcedCandidates:", sourcedCandidates);
    console.log("Debug - shouldFetch:", shouldFetch);
    console.log("Debug - queryParams:", queryParams);
  }, [sourcedCandidatesData, sourcedCandidates, shouldFetch, queryParams]);

  if (jobLoading) {
    return (
      <div style={{ padding: "8px 16px", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Skeleton active />
          <Skeleton active />
          <Skeleton active />
        </div>
      </div>
    );
  }

  if (jobError) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Failed to load candidates"
          description="Unable to fetch candidates data"
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: window.innerWidth < 768 ? "8px" : "0",
        fontSize: "14px",
      }}
    >
      <div style={{ marginBottom: "16px" }}>
        <Title
          level={4}
          style={{
            margin: "0 0 8px 0",
            fontSize: window.innerWidth < 768 ? "16px" : "18px",
            fontWeight: "600",
            color: "#da2c46",
          }}
        >
          Candidates Management
        </Title>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size={window.innerWidth < 768 ? "small" : "default"}
        tabBarStyle={{
          marginBottom: window.innerWidth < 768 ? "8px" : "16px",
        }}
      >
        <TabPane
          tab={
            <span style={{ color: "#da2c46" }}>
              <UserOutlined />
              Sourced ({sourcedCandidates.length})
            </span>
          }
          key="sourced"
        >
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: "20px" }}
          >
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={showFilterModal}
                  style={{ backgroundColor: "#da2c46" }}
                >
                  Advanced Filters
                </Button>
                {hasActiveFilters && (
                  <Button icon={<ClearOutlined />} onClick={handleClearSearch}>
                    Clear All
                  </Button>
                )}
              </Space>
            </Col>
            <Col>
              <Space>
                <Text>
                  {selectedCandidates.length} selected of{" "}
                  {sourcedCandidates.length} candidates
                </Text>
                {selectedCandidates.length > 0 && (
                  <Button
                    type="primary"
                    size="small"
                    style={{ backgroundColor: "#da2c46" }}
                    onClick={() => handleBulkStatusUpdate("selected")}
                  >
                    Move to Selected
                  </Button>
                )}
              </Space>
            </Col>
          </Row>

          {hasActiveFilters && (
            <Card size="small" style={{ marginBottom: "20px" }}>
              <Space wrap>
                <Text strong>Active Filters:</Text>
                {filters.skills.map((skill) => (
                  <Tag key={skill} color="blue">
                    {skill}
                  </Tag>
                ))}
                {filters.location && (
                  <Tag color="green">Location: {filters.location}</Tag>
                )}
                {filters.company && (
                  <Tag color="orange">Company: {filters.company}</Tag>
                )}
                {filters.qualification && (
                  <Tag color="purple">
                    Qualification: {filters.qualification}
                  </Tag>
                )}
                {filters.jobRole && (
                  <Tag color="cyan">Role: {filters.jobRole}</Tag>
                )}
                {(filters.experience[0] > 0 || filters.experience[1] < 20) && (
                  <Tag color="red">
                    Experience: {filters.experience[0]}-{filters.experience[1]}{" "}
                    years
                  </Tag>
                )}
                {(filters.salary[0] > 0 || filters.salary[1] < 100000) && (
                  <Tag color="gold">
                    Salary: ₹{filters.salary[0] / 1000}K-₹
                    {filters.salary[1] / 1000}K
                  </Tag>
                )}
              </Space>
            </Card>
          )}

          {shouldFetch && sourcedCandidates.length > 0 && (
            <Card size="small" style={{ marginBottom: "16px" }}>
              <Checkbox
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                Select all candidates on this page
              </Checkbox>
            </Card>
          )}

          <Divider
            style={{ margin: window.innerWidth < 768 ? "8px 0" : "12px 0" }}
          />

          <div
            style={{
              maxHeight: window.innerWidth < 768 ? "400px" : "600px",
              overflowY: "auto",
            }}
          >
            {!shouldFetch ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ fontSize: "14px", color: "#999" }}>
                    Use the advanced filters to find candidates
                  </span>
                }
              />
            ) : isSourcedLoading ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
              </div>
            ) : sourcedError ? (
              <Alert
                message="Failed to load sourced candidates"
                description="Unable to fetch sourced candidates data"
                type="error"
                showIcon
              />
            ) : sourcedCandidates.length > 0 ? (
              <>
                {sourcedCandidates.map((candidate) => (
                  <div key={candidate._id} style={{ marginBottom: "clamp(12px, 2vw, 16px)" }}>
                    <Card
                      hoverable
                      style={{
                        padding: "clamp(16px, 3vw, 24px)",
                        borderRadius: "12px"
                      }}
                      bodyStyle={{ padding: 0 }}
                    >
                      <Row align="middle" gutter={[16, 16]}>
                        <Col flex="none">
                          <Checkbox
                            checked={selectedCandidates.includes(candidate._id)}
                            onChange={(e) => handleCandidateSelect(candidate._id, e.target.checked)}
                          />
                        </Col>

                        <Col flex="auto">
                          <Row align="top" gutter={[16, 12]}>
                            {/* Main Content Column - Fluid width */}
                            <Col
                              xs={24}
                              md={18}
                              style={{
                                paddingRight: "clamp(0px, 2vw, 16px)",
                                marginBottom: "clamp(0px, 3vw, 12px)"
                              }}
                            >
                              <div style={{ marginBottom: "clamp(8px, 1.5vw, 12px)" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px 12px" }}>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "clamp(16px, 1.8vw, 18px)",
                                      lineHeight: 1.3,
                                      marginRight: "8px"
                                    }}
                                  >
                                    {candidate.fullName}
                                  </Text>
                                  <Tag color="blue" style={{ margin: 0 }}>{candidate.title}</Tag>
                                  <Text type="secondary" style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}>
                                    {candidate.totalExperienceYears || 0} years exp
                                  </Text>
                                </div>
                              </div>

                              {/* Company/Location Row - Responsive wrapping */}
                              <div style={{
                                marginBottom: "clamp(8px, 1.5vw, 12px)",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px 12px",
                                alignItems: "center"
                              }}>
                                <Space size={4}>
                                  <BankOutlined style={{ color: "#666", fontSize: "14px" }} />
                                  <Text style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }} ellipsis>
                                    {candidate.currentCompany || candidate.workExperience?.[0]?.company || "Not specified"}
                                  </Text>
                                </Space>

                                <Divider type="vertical" style={{ margin: 0, height: "auto" }} />

                                <Space size={4}>
                                  <EnvironmentOutlined style={{ color: "#666", fontSize: "14px" }} />
                                  <Text style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}>{candidate.location}</Text>
                                </Space>

                                <Divider type="vertical" style={{ margin: 0, height: "auto" }} />

                                <div>
                                  {getCandidateStatusTag(candidate.status, candidate.isApplied)}
                                </div>
                              </div>

                              {/* Skills Section - Fluid wrapping */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 8px", alignItems: "center" }}>
                                <ToolOutlined style={{ color: "#666", fontSize: "14px" }} />
                                <Text type="secondary" style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}>Skills:</Text>
                                {candidate.skills?.slice(0, 5).map((skill, index) => (
                                  <Tag
                                    key={index}
                                    style={{
                                      margin: 0,
                                      fontSize: "clamp(12px, 1.3vw, 13px)",
                                      padding: "2px 8px"
                                    }}
                                  >
                                    {skill}
                                  </Tag>
                                ))}
                                {candidate.skills?.length > 5 && (
                                  <Tag style={{ margin: 0, fontSize: "clamp(12px, 1.3vw, 13px)" }}>
                                    +{candidate.skills.length - 5} more
                                  </Tag>
                                )}
                              </div>
                            </Col>

                            {/* Avatar Column - Responsive sizing */}
                            <Col
                              xs={24}
                              md={6}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "clamp(8px, 1.5vw, 12px)"
                              }}
                            >
                              <div style={{
                                width: "clamp(80px, 20vw, 100px)",
                                height: "clamp(80px, 20vw, 100px)",
                                borderRadius: "12px",
                                backgroundColor: "#da2c46",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden"
                              }}>
                                {candidate.image ? (
                                  <img
                                    src={candidate.image}
                                    alt={candidate.fullName}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover"
                                    }}
                                  />
                                ) : (
                                  <UserOutlined style={{ fontSize: "clamp(32px, 8vw, 40px)", color: "#fff" }} />
                                )}
                              </div>

                              <Button
                                type="primary"
                                style={{
                                  backgroundColor: "#da2c46",
                                  width: "100%",
                                  maxWidth: "100px",
                                  fontSize: "clamp(13px, 1.5vw, 14px)",
                                  padding: "6px 12px"
                                }}
                                icon={<EyeOutlined />}
                                onClick={() => handleViewProfile(candidate)}
                              >
                                View Profile
                              </Button>
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Card>
                  </div>
                ))}

                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={handlePaginationChange}
                    showSizeChanger={true}
                    showQuickJumper={true}
                    showTotal={(total, range) =>
                      `${range[0]}-${range[1]} of ${total} candidates`
                    }
                    pageSizeOptions={["10", "20", "50"]}
                    simple={window.innerWidth < 768}
                    size={window.innerWidth < 768 ? "small" : "default"}
                  />
                </div>
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ fontSize: "14px", color: "#999" }}>
                    No candidates found matching your search criteria
                  </span>
                }
              />
            )}
          </div>
        </TabPane>

        <TabPane
          tab={
            <span style={{ color: "#da2c46" }}>
              <CheckOutlined />
              Selected ({selectedCandidatesList.length})
            </span>
          }
          key="selected"
        >
          <div
            style={{
              maxHeight: window.innerWidth < 768 ? "400px" : "600px",
              overflowY: "auto",
            }}
          >
            {selectedCandidatesList.length > 0 ? (
              <>
                {selectedCandidatesList
                  .slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                  )
                  .map((candidate) => (
                    <CandidateCard
                      key={candidate._id}
                      candidate={candidate}
                      onViewProfile={handleViewProfile}
                      showExperience={true}
                      showSkills={true}
                      maxSkills={3}
                      actions={[
                        <Button
                          key="view"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewProfile(candidate)}
                          size={window.innerWidth < 768 ? "small" : "default"}
                        >
                          {window.innerWidth < 768 ? "View" : "View Profile"}
                        </Button>,
                        <Button
                          key="move"
                          type="primary"
                          onClick={() => handleStatusUpdate("screening")}
                          size={window.innerWidth < 768 ? "small" : "default"}
                        >
                          {window.innerWidth < 768
                            ? "Screening"
                            : "Move to Screening"}
                        </Button>,
                      ]}
                    />
                  ))}
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={selectedCandidatesList.length}
                    onChange={(page, pageSize) => {
                      setPagination((prev) => ({
                        ...prev,
                        current: page,
                        pageSize: pageSize,
                      }));
                    }}
                    showSizeChanger={false}
                    simple={window.innerWidth < 768}
                    size={window.innerWidth < 768 ? "small" : "default"}
                  />
                </div>
              </>
            ) : (
              <Empty
                description={
                  <span style={{ fontSize: "14px", color: "#999" }}>
                    No selected candidates yet
                  </span>
                }
              />
            )}
          </div>
        </TabPane>
      </Tabs>

      {/* Advanced Filter Modal */}
      {/* Advanced Filter Modal */}
      <Modal
        title="Advanced Candidate Filters"
        open={isFilterModalVisible}
        onOk={handleFilterModalOk}
        onCancel={handleFilterModalCancel}
        width={800}
        okText="Apply Filters"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: "#da2c46" } }}
      >
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Keywords">
                <Input
                  placeholder="Job title, skills, companies, etc."
                  value={tempFilters.keywords}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      keywords: e.target.value,
                    }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Current Location">
                <AutoComplete
                  options={locationOptions}
                  placeholder="Search location"
                  value={tempFilters.location}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      location: value,
                    }))
                  }
                  filterOption={(inputValue, option) =>
                    option.value
                      .toUpperCase()
                      .indexOf(inputValue.toUpperCase()) !== -1
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Skills">
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Add skills (e.g., JavaScript, React)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onPressEnter={handleSkillAdd}
              />
              <Button
                type="primary"
                onClick={handleSkillAdd}
                style={{ backgroundColor: "#da2c46" }}
              >
                Add
              </Button>
            </Space.Compact>
            <div style={{ marginTop: 8 }}>
              {tempFilters.skills.map((skill) => (
                <Tag
                  key={skill}
                  closable
                  onClose={() => handleSkillRemove(skill)}
                  style={{ marginBottom: 4 }}
                >
                  {skill}
                </Tag>
              ))}
            </div>
          </Form.Item>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Experience (Years)">
                <Slider
                  range
                  min={0}
                  max={30}
                  value={tempFilters.experience}
                  onChange={(value) =>
                    setTempFilters((prev) => ({ ...prev, experience: value }))
                  }
                  marks={{
                    0: "0",
                    5: "5",
                    10: "10",
                    15: "15",
                    20: "20",
                    25: "25",
                    30: "30+",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Annual Salary Range (₹)"
                extra="Annual salary in rupees (L = lakhs)"
              >
                <Slider
                  range
                  min={0}
                  max={2000000}
                  step={50000}
                  value={tempFilters.salary}
                  onChange={(value) =>
                    setTempFilters((prev) => ({ ...prev, salary: value }))
                  }
                  marks={{
                    0: "0",
                    500000: "5L",
                    1000000: "10L",
                    1500000: "15L",
                    2000000: "20L+",
                  }}
                  tipFormatter={(value) => `${value / 100000}L`}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Current Company">
                <Input
                  placeholder="Current or past companies"
                  value={tempFilters.company}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Industry">
                <Select
                  mode="tags"
                  placeholder="Select industries"
                  value={tempFilters.industries}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      industries: value,
                    }))
                  }
                  tokenSeparators={[","]}
                  style={{ width: "100%" }}
                >
                  {industryOptions.map((industry) => (
                    <Option key={industry.value} value={industry.value}>
                      {industry.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Job Role">
                <Select
                  mode="tags"
                  placeholder="Select job roles"
                  value={tempFilters.jobRoles}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      jobRoles: value,
                    }))
                  }
                  tokenSeparators={[","]}
                  style={{ width: "100%" }}
                >
                  {jobRoleOptions.map((role) => (
                    <Option key={role.value} value={role.value}>
                      {role.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Qualification">
                <Select
                  mode="tags"
                  placeholder="Select qualifications"
                  value={tempFilters.qualifications}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      qualifications: value,
                    }))
                  }
                  tokenSeparators={[","]}
                  style={{ width: "100%" }}
                >
                  {qualificationOptions.map((qual) => (
                    <Option key={qual.value} value={qual.value}>
                      {qual.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item label="Gender">
                <Select
                  placeholder="Select gender"
                  value={tempFilters.gender}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      gender: value,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Nationality">
                <Select
                  placeholder="Select nationality"
                  value={tempFilters.nationality}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      nationality: value,
                    }))
                  }
                  showSearch
                  allowClear
                  style={{ width: "100%" }}
                >
                  {nationalityOptions.map((country) => (
                    <Option key={country.value} value={country.value}>
                      {country.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Age Range">
                <Slider
                  range
                  min={18}
                  max={70}
                  value={tempFilters.ageRange}
                  onChange={(value) =>
                    setTempFilters((prev) => ({ ...prev, ageRange: value }))
                  }
                  marks={{
                    18: "18",
                    25: "25",
                    35: "35",
                    45: "45",
                    55: "55",
                    70: "70+",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Form.Item label="Notice Period">
                <Select
                  placeholder="Select notice period"
                  value={tempFilters.noticePeriod}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      noticePeriod: value,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="immediate">Immediate</Option>
                  <Option value="1">1 month</Option>
                  <Option value="2">2 months</Option>
                  <Option value="3">3 months</Option>
                  <Option value="3+">More than 3 months</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Profile Updated">
                <Select
                  placeholder="When profile was updated"
                  value={tempFilters.profileUpdated}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      profileUpdated: value,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="7">Last 7 days</Option>
                  <Option value="15">Last 15 days</Option>
                  <Option value="30">Last 30 days</Option>
                  <Option value="60">Last 60 days</Option>
                  <Option value="90">Last 90 days</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Visa Status">
                <Select
                  placeholder="Select visa status"
                  value={tempFilters.visaStatus}
                  onChange={(value) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      visaStatus: value,
                    }))
                  }
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="visit">Visit Visa</Option>
                  <Option value="employment">Employment Visa</Option>
                  <Option value="resident">Residence Visa</Option>
                  <Option value="citizen">Citizen</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Languages Known">
            <Select
              mode="tags"
              placeholder="Select languages"
              value={tempFilters.languages}
              onChange={(value) =>
                setTempFilters((prev) => ({
                  ...prev,
                  languages: value,
                }))
              }
              tokenSeparators={[","]}
              style={{ width: "100%" }}
            >
              {languageOptions.map((lang) => (
                <Option key={lang.value} value={lang.value}>
                  {lang.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Candidate Profile Modal */}
      <Modal
        title="Candidate Profile"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="status"
            type="primary"
            loading={isUpdatingStatus}
            onClick={() => handleStatusUpdate(getNextStatus())}
            style={{ backgroundColor: "#da2c46" }}
          >
            {getModalButtonText()}
          </Button>,
        ]}
      >
        {selectedCandidate && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Name" span={2}>
              <Text strong>{selectedCandidate.fullName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Current Status">
              {getCandidateStatusTag(
                selectedCandidate.status,
                selectedCandidate.isApplied
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Current Company">
              {selectedCandidate.currentCompany ||
                selectedCandidate.workExperience?.[0]?.company ||
                "Not specified"}
            </Descriptions.Item>
            <Descriptions.Item label="Job Title">
              {selectedCandidate.title || "Not specified"}
            </Descriptions.Item>
            <Descriptions.Item label="Total Experience">
              {selectedCandidate.totalExperienceYears || 0} years
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedCandidate.location || "Not specified"}
            </Descriptions.Item>
            <Descriptions.Item label="Skills" span={2}>
              <Space wrap>
                {selectedCandidate.skills?.map((skill, index) => (
                  <Tag key={index}>{skill}</Tag>
                ))}
              </Space>
            </Descriptions.Item>
            {selectedCandidate.responses && (
              <Descriptions.Item label="Application Responses" span={2}>
                <Collapse bordered={false}>
                  {selectedCandidate.responses.map((response, i) => (
                    <Panel header={response.question} key={i}>
                      {response.answer}
                    </Panel>
                  ))}
                </Collapse>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SourcedCandidates;
