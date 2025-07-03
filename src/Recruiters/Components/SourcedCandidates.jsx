import { useState, useMemo, useEffect } from "react";
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
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  CheckOutlined,
  EyeOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useGetJobApplicationsQuery,
  useUpdateCandidateStatusMutation,
  useGetSourcedCandidateQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const SourcedCandidates = ({ jobId }) => {
  console.log(jobId, "JOB");
  const [activeTab, setActiveTab] = useState("sourced");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Search related states - Added company field
  const [searchFilters, setSearchFilters] = useState({
    experience: "",
    qualification: "",
    skills: [],
    location: "",
    company: "", // Added company filter
  });
  const [shouldFetch, setShouldFetch] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [queryParams, setQueryParams] = useState("");

  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  // Build query params for API call - Added company parameter
  const buildQueryParams = () => {
    const params = new URLSearchParams();

    if (searchFilters.experience) {
      params.append("experience", searchFilters.experience);
    }
    if (searchFilters.qualification) {
      params.append("qualification", searchFilters.qualification);
    }
    if (searchFilters.skills && searchFilters.skills.length > 0) {
      params.append("skills", searchFilters.skills.join(","));
    }
    if (searchFilters.location) {
      params.append("location", searchFilters.location);
    }
    if (searchFilters.company) {
      params.append("company", searchFilters.company);
    }

    console.log("Search Filters:", searchFilters);
    console.log("Query Params:", params.toString());
    return params.toString();
  };

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
      })) || [];

    const candidatesMap = new Map();

    sourcedCandidates.forEach((candidate) => {
      candidatesMap.set(candidate._id, candidate);
    });

    jobAppCandidates.forEach((candidate) => {
      if (candidatesMap.has(candidate._id)) {
        const existingCandidate = candidatesMap.get(candidate._id);
        candidatesMap.set(candidate._id, {
          ...existingCandidate,
          ...candidate,
          isApplied: true,
          status: candidate.status || existingCandidate.status,
        });
      } else {
        candidatesMap.set(candidate._id, candidate);
      }
    });

    return Array.from(candidatesMap.values());
  }, [jobApplications, sourcedCandidatesData]);

  const { sourcedCandidates, selectedCandidates } = useMemo(() => {
    return {
      sourcedCandidates: allCandidates.filter((candidate) => {
        const status = candidate.status;
        return (
          !status ||
          status === "sourced" ||
          (status === "applied" && !candidate.isApplied)
        );
      }),
      selectedCandidates: allCandidates.filter(
        (candidate) => candidate.status === "selected"
      ),
    };
  }, [allCandidates]);

  const handleSearch = () => {
    const params = buildQueryParams();
    console.log("Triggering search with filters:", searchFilters);
    console.log("Final query params:", params);

    setQueryParams(params);
    setShouldFetch(true);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  // Updated to clear company filter as well
  const handleClearSearch = () => {
    setSearchFilters({
      experience: "",
      qualification: "",
      skills: [],
      location: "",
      company: "", // Clear company filter
    });
    setSkillInput("");
    setShouldFetch(false);
    setQueryParams("");
  };

  const handleSkillAdd = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !searchFilters.skills.includes(trimmedSkill)) {
      setSearchFilters((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmedSkill],
      }));
      setSkillInput("");
      console.log("Added skill:", trimmedSkill);
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setSearchFilters((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      if (!selectedCandidate) return;

      await updateCandidateStatus({
        applicationId: selectedCandidate.applicationId,
        Id: selectedCandidate._id,
        status: newStatus,
        jobId: jobId,
        isSourced: true,
      }).unwrap();

      const statusMessages = {
        selected: "Candidate moved to selected successfully",
        screening: "Candidate moved to screening successfully",
        hired: "Candidate marked as hired successfully",
        rejected: "Candidate marked as rejected successfully",
      };

      message.success(
        statusMessages[newStatus] || "Candidate status updated successfully"
      );

      refetchSourced();
      jobRefetch();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error(error.data?.message || "Failed to update candidate status");
    }
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

  const hasActiveFilters = () => {
    return Object.values(searchFilters).some((value) =>
      Array.isArray(value) ? value.length > 0 : value !== ""
    );
  };

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
          {/* Universal Search Section - Updated with Company field */}
          <Card
            size="small"
            style={{
              marginBottom: window.innerWidth < 768 ? "8px" : "16px",
              backgroundColor: "#fafafa",
            }}
          >
            <div
              style={{ marginBottom: window.innerWidth < 768 ? "8px" : "16px" }}
            >
              <Text
                strong
                style={{
                  marginBottom: "8px",
                  display: "block",
                  fontSize: window.innerWidth < 768 ? "14px" : "16px",
                }}
              >
                Search Candidates
              </Text>
            </div>

            <Row gutter={[window.innerWidth < 768 ? 8 : 16, 16]}>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Experience (years)
                </Text>
                <InputNumber
                  placeholder="Min years"
                  value={searchFilters.experience}
                  onChange={(value) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      experience: value || "",
                    }))
                  }
                  style={{ width: "100%" }}
                  min={0}
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={6}>
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Qualification
                </Text>
                <Input
                  placeholder="e.g., computer science, MBA"
                  value={searchFilters.qualification}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      qualification: e.target.value,
                    }))
                  }
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={6}>
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Location
                </Text>
                <Input
                  placeholder="e.g., bangalore, mumbai"
                  value={searchFilters.location}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                />
              </Col>

              <Col xs={24} sm={12} md={6} lg={6}>
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Company
                </Text>
                <Input
                  placeholder="e.g., google, microsoft, tcs"
                  value={searchFilters.company}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                />
              </Col>
            </Row>

            <Row
              gutter={[window.innerWidth < 768 ? 8 : 16, 16]}
              style={{ marginTop: "16px" }}
            >
              <Col span={24}>
                <Text strong style={{ marginBottom: "8px", display: "block" }}>
                  Skills
                </Text>
                <div
                  style={{ display: "flex", gap: "8px", marginBottom: "8px" }}
                >
                  <Input
                    placeholder="Add skill"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onPressEnter={handleSkillAdd}
                    style={{ flex: 1 }}
                  />
                  <Button onClick={handleSkillAdd} size="small">
                    Add
                  </Button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {searchFilters.skills.map((skill, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => handleSkillRemove(skill)}
                      style={{ marginBottom: "4px" }}
                    >
                      {skill}
                    </Tag>
                  ))}
                </div>
              </Col>
            </Row>

            <div style={{ marginTop: "16px", textAlign: "right" }}>
              <Space
                wrap
                style={{
                  width: "100%",
                  justifyContent:
                    window.innerWidth < 768 ? "center" : "flex-end",
                }}
              >
                {hasActiveFilters() && (
                  <Button
                    icon={<CloseOutlined />}
                    onClick={handleClearSearch}
                    size="small"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  style={{ background: "#da2c46" }}
                  disabled={!hasActiveFilters()}
                >
                  Search Candidates
                </Button>
              </Space>
            </div>
          </Card>

          <Divider
            style={{ margin: window.innerWidth < 768 ? "8px 0" : "12px 0" }}
          />

          <div
            style={{
              maxHeight: window.innerWidth < 768 ? "400px" : "600px",
              overflowY: "auto",
            }}
          >
            {isSourcedLoading ? (
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
            ) : shouldFetch && sourcedCandidates.length > 0 ? (
              <>
                {sourcedCandidates
                  .slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                  )
                  .map((candidate, index) => (
                    <CandidateCard
                      key={candidate._id || index}
                      candidate={candidate}
                      index={index}
                      onViewProfile={handleViewProfile}
                      showExperience={true}
                      showSkills={true}
                      maxSkills={3}
                    />
                  ))}
                <div style={{ marginTop: 16, textAlign: "center" }}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={sourcedCandidates.length}
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
            ) : shouldFetch && sourcedCandidates.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ fontSize: "14px", color: "#999" }}>
                    No candidates found matching your search criteria
                  </span>
                }
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ fontSize: "14px", color: "#999" }}>
                    Use the search filters above to find candidates
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
              Selected ({selectedCandidates.length})
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
            {selectedCandidates.length > 0 ? (
              <>
                {selectedCandidates
                  .slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                  )
                  .map((candidate, index) => (
                    <CandidateCard
                      key={candidate._id || index}
                      candidate={candidate}
                      index={index}
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
                    total={selectedCandidates.length}
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

      <Modal
        title="Candidate Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="move"
            type="primary"
            onClick={() => handleStatusUpdate(getNextStatus())}
            loading={isUpdatingStatus}
            disabled={isUpdatingStatus}
            style={{ background: "#da2c46" }}
          >
            {getModalButtonText()}
          </Button>,
        ]}
        width={window.innerWidth < 768 ? "95%" : "90%"}
        style={{ top: window.innerWidth < 768 ? 10 : 20 }}
        bodyStyle={{
          maxHeight:
            window.innerWidth < 768
              ? "calc(100vh - 150px)"
              : "calc(100vh - 200px)",
          overflowY: "auto",
          padding: window.innerWidth < 768 ? "8px" : "16px",
        }}
      >
        {selectedCandidate && (
          <Descriptions
            bordered
            column={window.innerWidth < 768 ? 1 : 2}
            size="small"
          >
            <Descriptions.Item label="Full Name" span={2}>
              {selectedCandidate.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedCandidate.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedCandidate.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedCandidate.location}
            </Descriptions.Item>
            <Descriptions.Item label="Title">
              {selectedCandidate.title}
            </Descriptions.Item>
            <Descriptions.Item label="Current Status">
              {getCandidateStatusTag(
                selectedCandidate.status,
                selectedCandidate.isApplied
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Skills" span={2}>
              <Space wrap>
                {selectedCandidate.skills?.map((skill, index) => (
                  <Tag key={index}>{skill}</Tag>
                ))}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Education" span={2}>
              {selectedCandidate.education?.length > 0 ? (
                selectedCandidate.education.map((edu, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <Text strong>
                      {edu.degree} in {edu.field}
                    </Text>
                    <br />
                    <Text type="secondary">
                      {edu.institution} ({edu.year})
                    </Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">No education information</Text>
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Work Experience" span={2}>
              {selectedCandidate.workExperience?.length > 0 ? (
                selectedCandidate.workExperience.map((exp, index) => (
                  <div key={index} style={{ marginBottom: 8 }}>
                    <Text strong>
                      {exp.title} at {exp.company}
                    </Text>
                    <br />
                    <Text type="secondary">{exp.duration}</Text>
                    <br />
                    <Text>{exp.description}</Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">No work experience</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SourcedCandidates;
