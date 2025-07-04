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
  experience: [0, 20],
  qualification: "",
  skills: [],
  location: "",
  company: "",
  salary: [0, 100000],
  jobRole: "",
  industry: "",
};

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

    if (filters.experience[0] > 0 || filters.experience[1] < 20) {
      params.append("minExperience", filters.experience[0].toString());
      params.append("maxExperience", filters.experience[1].toString());
    }
    if (filters.qualification) {
      params.append("qualification", filters.qualification);
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
    if (filters.jobRole) {
      params.append("jobRole", filters.jobRole);
    }
    if (filters.salary[0] > 0 || filters.salary[1] < 100000) {
      params.append("minSalary", filters.salary[0].toString());
      params.append("maxSalary", filters.salary[1].toString());
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
                  <div key={candidate._id} style={{ marginBottom: "16px" }}>
                    <Card hoverable>
                      <Row align="middle" gutter={[16, 16]}>
                        <Col flex="none">
                          <Checkbox
                            checked={selectedCandidates.includes(candidate._id)}
                            onChange={(e) =>
                              handleCandidateSelect(
                                candidate._id,
                                e.target.checked
                              )
                            }
                          />
                        </Col>

                        <Col flex="auto">
                          <Row align="top" gutter={[16, 8]}>
                            <Col span={18}>
                              <div style={{ marginBottom: "8px" }}>
                                <Text
                                  strong
                                  style={{
                                    fontSize: "16px",
                                    marginRight: "12px",
                                  }}
                                >
                                  {candidate.fullName}
                                </Text>
                                <Tag color="blue">{candidate.title}</Tag>
                                <Text type="secondary">
                                  {candidate.totalExperienceYears || 0} years
                                  exp
                                </Text>
                              </div>

                              <div style={{ marginBottom: "8px" }}>
                                <Space split={<Divider type="vertical" />}>
                                  <Space>
                                    <BankOutlined style={{ color: "#666" }} />
                                    <Text>
                                      {candidate.currentCompany ||
                                        candidate.workExperience?.[0]
                                          ?.company ||
                                        "Not specified"}
                                    </Text>
                                  </Space>
                                  <Space>
                                    <EnvironmentOutlined
                                      style={{ color: "#666" }}
                                    />
                                    <Text>{candidate.location}</Text>
                                  </Space>
                                  <Space>
                                    {getCandidateStatusTag(
                                      candidate.status,
                                      candidate.isApplied
                                    )}
                                  </Space>
                                </Space>
                              </div>

                              <div>
                                <Space>
                                  <ToolOutlined style={{ color: "#666" }} />
                                  <Text type="secondary">Skills:</Text>
                                  {candidate.skills
                                    ?.slice(0, 4)
                                    .map((skill, index) => (
                                      <Tag key={index} size="small">
                                        {skill}
                                      </Tag>
                                    ))}
                                  {candidate.skills?.length > 4 && (
                                    <Tag size="small" color="default">
                                      +{candidate.skills.length - 4} more
                                    </Tag>
                                  )}
                                </Space>
                              </div>
                            </Col>

                            <Col span={6} style={{ textAlign: "center" }}>
                              <div style={{ marginBottom: "8px" }}>
                                <Avatar
                                  size={60}
                                  src={candidate.image}
                                  icon={!candidate.image && <UserOutlined />}
                                  style={{ backgroundColor: "#da2c46" }}
                                />
                              </div>
                              <Button
                                type="primary"
                                size="small"
                                icon={<EyeOutlined />}
                                onClick={() => handleViewProfile(candidate)}
                                style={{ backgroundColor: "#da2c46" }}
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
              <Form.Item label="Experience (Years)">
                <Slider
                  range
                  min={0}
                  max={20}
                  value={tempFilters.experience}
                  onChange={(value) =>
                    setTempFilters((prev) => ({ ...prev, experience: value }))
                  }
                  marks={{
                    0: "0",
                    5: "5",
                    10: "10",
                    15: "15",
                    20: "20+",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Salary Range (₹)">
                <Slider
                  range
                  min={0}
                  max={100000}
                  step={5000}
                  value={tempFilters.salary}
                  onChange={(value) =>
                    setTempFilters((prev) => ({ ...prev, salary: value }))
                  }
                  marks={{
                    0: "0",
                    25000: "25K",
                    50000: "50K",
                    75000: "75K",
                    100000: "100K+",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Location">
                <Input
                  placeholder="Enter location (e.g., bangalore, mumbai)"
                  value={tempFilters.location}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Company">
                <Input
                  placeholder="Enter company name (e.g., google, microsoft)"
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
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Job Role">
                <Input
                  placeholder="Enter job role (e.g., software engineer)"
                  value={tempFilters.jobRole}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      jobRole: e.target.value,
                    }))
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Qualification">
                <Input
                  placeholder="Enter qualification (e.g., computer science, MBA)"
                  value={tempFilters.qualification}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      qualification: e.target.value,
                    }))
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
