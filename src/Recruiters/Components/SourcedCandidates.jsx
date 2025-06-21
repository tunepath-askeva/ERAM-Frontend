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
    // Get candidates from job applications
    const jobAppCandidates =
      jobApplications?.formResponses?.map((response) => ({
        ...response.user,
        candidateStatus: response.status,
        applicationId: response._id,
        responses: response.responses,
      })) || [];

    const sourcedCandidates =
      sourcedCandidatesData?.users?.map((user) => ({
        ...user,
        candidateStatus: user.candidateStatus || "sourced",
        applicationId: user._id,
      })) || [];

    // Merge candidates, giving priority to job application candidates
    const merged = [...jobAppCandidates];
    const existingIds = new Set(jobAppCandidates.map((c) => c._id));

    // Add sourced candidates that aren't already in job applications
    for (const candidate of sourcedCandidates) {
      if (!existingIds.has(candidate._id)) {
        merged.push(candidate);
      }
    }

    return merged;
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
      sourcedCandidates: allCandidates.filter(
        (candidate) =>
          candidate.candidateStatus === "sourced" ||
          candidate.candidateStatus === "applied"
      ),
      selectedCandidates: allCandidates.filter(
        (candidate) => candidate.candidateStatus === "selected"
      ),
    };
  }, [allCandidates]);

  const filteredCandidates = useMemo(() => {
    let candidates =
      activeTab === "sourced" ? sourcedCandidates : selectedCandidates;

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
      }).unwrap();

      const statusMessages = {
        selected: "Candidate moved to selected successfully",
        screening: "Candidate moved to screening successfully",
      };

      message.success(
        statusMessages[newStatus] || "Candidate status updated successfully"
      );

      // Refetch both data sources
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

    const currentStatus = selectedCandidate.candidateStatus;

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

    const currentStatus = selectedCandidate.candidateStatus;

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

  if (isSourcedLoading || jobLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <Spin size="large" />
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
                          Location
                        </Text>
                        <Input
                          placeholder="Enter location"
                          value={filters.location}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          allowClear
                        />
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
              filteredCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate._id || index}
                  candidate={candidate}
                  index={index}
                  onViewProfile={handleViewProfile}
                  showExperience={true}
                  showSkills={true}
                  maxSkills={3}
                />
              ))
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
              selectedCandidates.map((candidate, index) => (
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
              ))
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
        width={800}
      >
        {selectedCandidate && (
          <Descriptions bordered column={2}>
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
              <Tag
                color={
                  selectedCandidate.candidateStatus === "selected"
                    ? "green"
                    : "blue"
                }
              >
                {selectedCandidate.candidateStatus || "Sourced"}
              </Tag>
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
