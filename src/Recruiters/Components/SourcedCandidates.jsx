import { useState, useMemo } from "react";
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
  Collapse,
  Badge,
  Tabs,
  Modal,
  Descriptions,
  Tag,
  message,
  Skeleton,
  Pagination,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  TrophyOutlined,
  ToolOutlined,
  ClearOutlined,
  UserOutlined,
  CheckOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useGetJobApplicationsQuery,
  useUpdateCandidateStatusMutation,
  useGetSourcedCandidateQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

const SourcedCandidates = ({ jobId }) => {
  console.log(jobId, "JOB");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("sourced");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  const [filters, setFilters] = useState({
    skills: [],
    minExperience: null,
    maxExperience: null,
    education: [],
    location: "",
  });

  const {
    data: sourcedCandidatesData,
    isLoading: isSourcedLoading,
    error: sourcedError,
    refetch: refetchSourced,
  } = useGetSourcedCandidateQuery({});

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
        isApplied: true, // Mark as applied to job
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

    // Then update with job application candidates (if they applied)
    jobAppCandidates.forEach((candidate) => {
      if (candidatesMap.has(candidate._id)) {
        // Candidate exists in sourced, update their status and mark as applied
        const existingCandidate = candidatesMap.get(candidate._id);
        candidatesMap.set(candidate._id, {
          ...existingCandidate,
          ...candidate,
          isApplied: true,
          status: candidate.status || existingCandidate.status,
        });
      } else {
        // New candidate from job applications
        candidatesMap.set(candidate._id, candidate);
      }
    });

    return Array.from(candidatesMap.values());
  }, [jobApplications, sourcedCandidatesData]);

  const filterOptions = useMemo(() => {
    const allSkills = new Set();
    const allEducation = new Set();
    const allLocations = new Set();

    allCandidates.forEach((user) => {
      if (user.skills && Array.isArray(user.skills)) {
        user.skills.forEach((skill) => allSkills.add(skill.toLowerCase()));
      }

      if (user.education && Array.isArray(user.education)) {
        user.education.forEach((edu) => {
          if (edu.degree) allEducation.add(edu.degree);
          if (edu.field) allEducation.add(edu.field);
        });
      }

      if (user.location) {
        allLocations.add(user.location);
      }
    });

    return {
      skills: Array.from(allSkills).sort(),
      education: Array.from(allEducation).sort(),
      locations: Array.from(allLocations).sort(),
    };
  }, [allCandidates]);

  const { sourcedCandidates, selectedCandidates } = useMemo(() => {
    return {
      // Show only candidates with "sourced" status or no status (default sourced)
      sourcedCandidates: allCandidates.filter((candidate) => {
        const status = candidate.status;
        // Only show truly sourced candidates - no status, "sourced", or "applied" but not moved to other stages
        return (
          !status ||
          status === "sourced" ||
          (status === "applied" && !candidate.isApplied) // Only show applied if they haven't actually applied to this job
        );
      }),
      selectedCandidates: allCandidates.filter(
        (candidate) => candidate.status === "selected"
      ),
    };
  }, [allCandidates]);

  const filteredCandidates = useMemo(() => {
    let candidates;
    switch (activeTab) {
      case "sourced":
        candidates = sourcedCandidates;
        break;
      case "selected":
        candidates = selectedCandidates;
        break;
      default:
        candidates = sourcedCandidates;
    }

    if (searchTerm) {
      candidates = candidates.filter(
        (candidate) =>
          candidate.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          candidate.phone?.includes(searchTerm)
      );
    }

    if (filters.skills.length > 0) {
      candidates = candidates.filter((candidate) => {
        const candidateSkills =
          candidate.skills?.map((skill) => skill.toLowerCase()) || [];
        return filters.skills.some((filterSkill) =>
          candidateSkills.includes(filterSkill.toLowerCase())
        );
      });
    }

    if (filters.education.length > 0) {
      candidates = candidates.filter((candidate) => {
        const candidateEducation = candidate.education || [];
        return candidateEducation.some((edu) =>
          filters.education.some(
            (filterEdu) =>
              edu.degree?.toLowerCase().includes(filterEdu.toLowerCase()) ||
              edu.field?.toLowerCase().includes(filterEdu.toLowerCase())
          )
        );
      });
    }

    if (filters.location) {
      candidates = candidates.filter((candidate) =>
        candidate.location
          ?.toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    return candidates;
  }, [activeTab, sourcedCandidates, selectedCandidates, searchTerm, filters]);

  const clearAllFilters = () => {
    setFilters({
      skills: [],
      minExperience: null,
      maxExperience: null,
      education: [],
      location: "",
    });
    setSearchTerm("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.skills.length > 0) count++;
    if (filters.minExperience !== null || filters.maxExperience !== null)
      count++;
    if (filters.education.length > 0) count++;
    if (filters.location) count++;
    return count;
  }, [filters]);

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

  if (isSourcedLoading || jobLoading) {
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

  if (sourcedError || jobError) {
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
    <div style={{ padding: "0", fontSize: "14px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Title
          level={4}
          style={{
            margin: "0 0 8px 0",
            fontSize: "18px",
            fontWeight: "600",
            color: "#da2c46",
          }}
        >
          Candidates Management
        </Title>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane
          tab={
            <span style={{ color: "#da2c46" }}>
              <UserOutlined />
              Sourced ({sourcedCandidates.length})
            </span>
          }
          key="sourced"
        >
          <div style={{ marginBottom: "16px" }}>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Search
                  placeholder="Search candidates by name, email or phone"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "100%" }}
                />
              </Col>
              <Col flex="none">
                <Space>
                  <Badge count={activeFiltersCount} size="small">
                    <Button
                      icon={<FilterOutlined />}
                      onClick={() => setShowFilters(!showFilters)}
                      type={showFilters ? "primary" : "default"}
                    >
                      Filters
                    </Button>
                  </Badge>
                  {activeFiltersCount > 0 && (
                    <Button
                      icon={<ClearOutlined />}
                      onClick={clearAllFilters}
                      size="small"
                      type="text"
                    >
                      Clear All
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </div>

          {showFilters && (
            <Card
              size="small"
              style={{ marginBottom: "16px", backgroundColor: "#fafafa" }}
            >
              <Collapse ghost>
                <Panel
                  header={
                    <Space>
                      <FilterOutlined />
                      <Text strong>Advanced Filters</Text>
                    </Space>
                  }
                  key="1"
                >
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <div>
                        <Text
                          strong
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <ToolOutlined /> Skills
                        </Text>
                        <Select
                          mode="multiple"
                          placeholder="Select required skills"
                          value={filters.skills}
                          onChange={(value) =>
                            setFilters((prev) => ({ ...prev, skills: value }))
                          }
                          style={{ width: "100%" }}
                          allowClear
                        >
                          {filterOptions.skills.map((skill) => (
                            <Option key={skill} value={skill}>
                              {skill}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </Col>

                    <Col span={12}>
                      <div>
                        <Text
                          strong
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px",
                          }}
                        >
                          <BookOutlined /> Education
                        </Text>
                        <Select
                          mode="multiple"
                          placeholder="Select education requirements"
                          value={filters.education}
                          onChange={(value) =>
                            setFilters((prev) => ({
                              ...prev,
                              education: value,
                            }))
                          }
                          style={{ width: "100%" }}
                          allowClear
                        >
                          {filterOptions.education.map((edu) => (
                            <Option key={edu} value={edu}>
                              {edu}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
            </Card>
          )}

          <Divider style={{ margin: "12px 0" }} />

          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {filteredCandidates.length > 0 ? (
              <>
                {filteredCandidates
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
                <div style={{ marginTop: 16, textAlign: "right" }}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={filteredCandidates.length}
                    onChange={(page, pageSize) => {
                      setPagination((prev) => ({
                        ...prev,
                        current: page,
                        pageSize: pageSize,
                      }));
                    }}
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ fontSize: "14px", color: "#999" }}>
                    {searchTerm || activeFiltersCount > 0
                      ? "No candidates match your search criteria"
                      : "No sourced candidates found"}
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
          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
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
                        >
                          View Profile
                        </Button>,
                        <Button
                          key="move"
                          type="primary"
                          onClick={() => handleStatusUpdate("screening")}
                        >
                          Move to Screening
                        </Button>,
                      ]}
                    />
                  ))}
                <div style={{ marginTop: 16, textAlign: "right" }}>
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
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "16px",
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
