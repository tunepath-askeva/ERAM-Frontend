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
  Collapse,
  Badge,
  Modal,
  Descriptions,
  Tag,
  message,
  DatePicker,
  TimePicker,
  Form,
  Skeleton,
  Steps,
  Pagination,
  Avatar,
  Checkbox,
} from "antd";
import {
  EyeOutlined,
  CalendarOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  CheckOutlined,
  CloseOutlined,
  ArrowRightOutlined,
  UserOutlined,
  BankOutlined,
  EnvironmentOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import {
  useUpdateCandidateStatusMutation,
  useGetRecruiterStagesQuery,
  useMoveToPipelineMutation,
  useGetScreeningCandidatesQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Step } = Steps;

const ScreeningCandidates = ({ jobId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isBulkMoving, setIsBulkMoving] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const [form] = Form.useForm();

  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  const {
    data: screeningData,
    isLoading,
    error,
    refetch,
  } = useGetScreeningCandidatesQuery({
    jobId,
    page: pagination.current,
    limit: pagination.pageSize,
  });

  const [moveToPipeline, { isLoading: isMovingToPipeline }] =
    useMoveToPipelineMutation();

  const [filters, setFilters] = useState({
    skills: [],
    education: [],
    location: "",
    screeningStatus: [],
  });

  const { data: recruiterStages, isLoading: recruiterStagesLoading } =
    useGetRecruiterStagesQuery(jobId);

  useEffect(() => {
    if (screeningData) {
      setPagination((prev) => ({
        ...prev,
        total:
          screeningData.total ||
          screeningData.customFieldResponses?.length ||
          0,
      }));
    }
  }, [screeningData]);

  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize,
      total: pagination.total,
    });
  };

  const allCandidates = useMemo(() => {
    return (
      screeningData?.customFieldResponses?.map((response) => ({
        ...response.user,
        candidateStatus: response.status,
        applicationId: response._id,
        responses: response.responses,
        image: response.user?.image,
        workOrder: response.workOrder,
        interviewDetails: response.interviewDetails,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt,
      })) || []
    );
  }, [screeningData]);

  const screeningCount = useMemo(() => {
    return allCandidates.length;
  }, [allCandidates]);

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

  const filteredCandidates = useMemo(() => {
    let candidates = allCandidates;

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
  }, [allCandidates, searchTerm, filters]);

  const clearAllFilters = () => {
    setFilters({
      skills: [],
      education: [],
      location: "",
      screeningStatus: [],
    });
    setSearchTerm("");
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.skills.length > 0) count++;
    if (filters.education.length > 0) count++;
    if (filters.location) count++;
    if (filters.screeningStatus.length > 0) count++;
    return count;
  }, [filters]);

  const handleViewProfile = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalVisible(true);
  };

  const handleStatusUpdate = async (newStatus, additionalData = {}) => {
    try {
      if (!selectedCandidate) return;

      await updateCandidateStatus({
        applicationId: selectedCandidate.applicationId,
        status: newStatus,
        jobId: jobId,
        ...additionalData,
      }).unwrap();

      const statusMessages = {
        interview: "Interview scheduled successfully",
        rejected: "Candidate rejected",
        shortlisted: "Candidate shortlisted for next round",
      };

      message.success(
        statusMessages[newStatus] || "Candidate status updated successfully"
      );
      refetch();
      setIsModalVisible(false);
      setIsScheduleModalVisible(false);
    } catch (error) {
      console.error("Failed to update candidate status:", error);
      message.error(error.data?.message || "Failed to update candidate status");
    }
  };

  const handleScheduleSubmit = (values) => {
    const interviewDateTime = dayjs(
      values.date.format("YYYY-MM-DD") + " " + values.time.format("HH:mm")
    );

    const scheduleData = {
      interviewType: values.interviewType,
      interviewDateTime: interviewDateTime.toISOString(),
      interviewNotes: values.notes,
      interviewLink: values.interviewLink,
    };

    handleStatusUpdate("interview", scheduleData);
  };

  const getScreeningStatusColor = (status) => {
    const colors = {
      screening: "blue",
      interview: "orange",
      shortlisted: "green",
      rejected: "red",
    };
    return colors[status] || "default";
  };

  const handleMoveToPipeline = async () => {
    try {
      if (!selectedCandidate) return;

      await moveToPipeline({
        applicationId: selectedCandidate.applicationId,
        jobId: jobId,
        userId: selectedCandidate._id,
      }).unwrap();

      message.success("Candidate moved to pipeline successfully");
      refetch();
      setIsModalVisible(false);
    } catch (error) {
      console.error("Failed to move candidate to pipeline:", error);
      message.error(
        error.data?.message || "Failed to move candidate to pipeline"
      );
    }
  };

  const handleBulkMoveToPipeline = async () => {
    if (selectedCandidates.length === 0) {
      message.warning("Please select at least one candidate");
      return;
    }

    setIsBulkMoving(true);
    try {
      const promises = selectedCandidates.map((candidateId) => {
        const candidate = allCandidates.find((c) => c._id === candidateId);
        return moveToPipeline({
          applicationId: candidate.applicationId,
          jobId: jobId,
          userId: candidate._id,
        }).unwrap();
      });

      await Promise.all(promises);
      message.success(
        `Moved ${selectedCandidates.length} candidates to pipeline successfully`
      );
      setSelectedCandidates([]);
      refetch();
    } catch (error) {
      console.error("Failed to move candidates to pipeline:", error);
      message.error(
        error.data?.message || "Failed to move candidates to pipeline"
      );
    } finally {
      setIsBulkMoving(false);
    }
  };

  const handleSelectCandidate = (candidateId, checked) => {
    setSelectedCandidates((prev) =>
      checked ? [...prev, candidateId] : prev.filter((id) => id !== candidateId)
    );
  };

  const handleSelectAll = (e) => {
    const currentPageCandidates = filteredCandidates
      .slice(
        (pagination.current - 1) * pagination.pageSize,
        pagination.current * pagination.pageSize
      )
      .map((candidate) => candidate._id);

    if (e.target.checked) {
      setSelectedCandidates((prev) => [
        ...new Set([...prev, ...currentPageCandidates]),
      ]);
    } else {
      setSelectedCandidates((prev) =>
        prev.filter((id) => !currentPageCandidates.includes(id))
      );
    }
  };

  if (isLoading || recruiterStagesLoading) {
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

  return (
    <div style={{ padding: "0", fontSize: "14px" }}>
      <div style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title
              level={4}
              style={{
                margin: "0 0 8px 0",
                fontSize: "18px",
                fontWeight: "600",
                color: "#da2c46",
              }}
            >
              Screening Candidates ({screeningCount})
            </Title>
          </Col>
          <Col>
            {selectedCandidates.length > 0 && (
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={handleBulkMoveToPipeline}
                loading={isBulkMoving}
                style={{ background: "#da2c46" }}
              >
                Move Selected ({selectedCandidates.length})
              </Button>
            )}
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      <div>
        {filteredCandidates.length > 0 ? (
          <>
            <Card size="small" style={{ marginBottom: "16px" }}>
              <Checkbox
                onChange={handleSelectAll}
                checked={filteredCandidates
                  .slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                  )
                  .every((candidate) =>
                    selectedCandidates.includes(candidate._id)
                  )}
                indeterminate={
                  filteredCandidates
                    .slice(
                      (pagination.current - 1) * pagination.pageSize,
                      pagination.current * pagination.pageSize
                    )
                    .some((candidate) =>
                      selectedCandidates.includes(candidate._id)
                    ) &&
                  !filteredCandidates
                    .slice(
                      (pagination.current - 1) * pagination.pageSize,
                      pagination.current * pagination.pageSize
                    )
                    .every((candidate) =>
                      selectedCandidates.includes(candidate._id)
                    )
                }
              >
                Select all candidates on this page
              </Checkbox>
            </Card>

            {filteredCandidates
              .slice(
                (pagination.current - 1) * pagination.pageSize,
                pagination.current * pagination.pageSize
              )
              .map((candidate, index) => (
                <div
                  key={candidate._id || index}
                  style={{ marginBottom: "clamp(12px, 2vw, 16px)" }}
                >
                  <Card
                    hoverable
                    style={{
                      padding: "clamp(16px, 3vw, 24px)",
                      borderRadius: "12px",
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    <Row align="middle" gutter={[16, 16]}>
                      {/* Left side - Candidate Details */}
                      <Col xs={24} md={18}>
                        <Row align="top" gutter={[16, 12]}>
                          {/* Checkbox Column */}
                          <Col xs={2}>
                            <Checkbox
                              checked={selectedCandidates.includes(
                                candidate._id
                              )}
                              onChange={(e) =>
                                handleSelectCandidate(
                                  candidate._id,
                                  e.target.checked
                                )
                              }
                            />
                          </Col>

                          {/* Main Details Column */}
                          <Col xs={22}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                marginBottom: "clamp(8px, 1.5vw, 12px)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  alignItems: "center",
                                  gap: "8px 12px",
                                }}
                              >
                                <Text
                                  strong
                                  style={{
                                    fontSize: "clamp(16px, 1.8vw, 18px)",
                                    lineHeight: 1.3,
                                    marginRight: "8px",
                                  }}
                                >
                                  {candidate.fullName}
                                </Text>
                                <Tag color="blue" style={{ margin: 0 }}>
                                  {candidate.title}
                                </Tag>
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: "clamp(13px, 1.5vw, 14px)",
                                  }}
                                >
                                  {candidate.totalExperienceYears || 0} years
                                  exp
                                </Text>
                              </div>
                            </div>

                            {/* Company/Location Row */}
                            <div
                              style={{
                                marginBottom: "clamp(8px, 1.5vw, 12px)",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px 12px",
                                alignItems: "center",
                              }}
                            >
                              <Space size={4}>
                                <BankOutlined
                                  style={{ color: "#666", fontSize: "14px" }}
                                />
                                <Text
                                  style={{
                                    fontSize: "clamp(13px, 1.5vw, 14px)",
                                  }}
                                  ellipsis
                                >
                                  {candidate.currentCompany ||
                                    candidate.workExperience?.[0]?.company ||
                                    "Not specified"}
                                </Text>
                              </Space>

                              <Divider
                                type="vertical"
                                style={{ margin: 0, height: "auto" }}
                              />

                              <Space size={4}>
                                <EnvironmentOutlined
                                  style={{ color: "#666", fontSize: "14px" }}
                                />
                                <Text
                                  style={{
                                    fontSize: "clamp(13px, 1.5vw, 14px)",
                                  }}
                                >
                                  {candidate.location}
                                </Text>
                              </Space>

                              <Divider
                                type="vertical"
                                style={{ margin: 0, height: "auto" }}
                              />

                              <Tag
                                color={getScreeningStatusColor(
                                  candidate.candidateStatus
                                )}
                              >
                                {candidate.candidateStatus?.toUpperCase() ||
                                  "SCREENING"}
                              </Tag>
                            </div>

                            {/* Skills Section */}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "6px 8px",
                                alignItems: "center",
                              }}
                            >
                              <ToolOutlined
                                style={{ color: "#666", fontSize: "14px" }}
                              />
                              <Text
                                type="secondary"
                                style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                              >
                                Skills:
                              </Text>
                              {candidate.skills
                                ?.slice(0, 5)
                                .map((skill, index) => (
                                  <Tag
                                    key={index}
                                    style={{
                                      margin: 0,
                                      fontSize: "clamp(12px, 1.3vw, 13px)",
                                      padding: "2px 8px",
                                    }}
                                  >
                                    {skill}
                                  </Tag>
                                ))}
                              {candidate.skills?.length > 5 && (
                                <Tag
                                  style={{
                                    margin: 0,
                                    fontSize: "clamp(12px, 1.3vw, 13px)",
                                  }}
                                >
                                  +{candidate.skills.length - 5} more
                                </Tag>
                              )}
                            </div>
                          </Col>
                        </Row>
                      </Col>

                      {/* Right side - Avatar and View Button */}
                      <Col xs={24} md={6}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "clamp(8px, 1.5vw, 12px)",
                          }}
                        >
                          <div
                            style={{
                              width: "clamp(80px, 20vw, 100px)",
                              height: "clamp(80px, 20vw, 100px)",
                              borderRadius: "12px",
                              backgroundColor: "#da2c46",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              overflow: "hidden",
                            }}
                          >
                            {candidate.image ? (
                              <img
                                src={candidate.image}
                                alt={candidate.fullName}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <UserOutlined
                                style={{
                                  fontSize: "clamp(32px, 8vw, 40px)",
                                  color: "#fff",
                                }}
                              />
                            )}
                          </div>

                          <Button
                            type="primary"
                            style={{
                              backgroundColor: "#da2c46",
                              width: "100%",
                              maxWidth: "100px",
                              fontSize: "clamp(13px, 1.5vw, 14px)",
                              padding: "6px 12px",
                            }}
                            icon={<EyeOutlined />}
                            onClick={() => handleViewProfile(candidate)}
                          >
                            View
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </div>
              ))}
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Pagination
                current={pagination.current}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePaginationChange}
                showSizeChanger
                pageSizeOptions={[10, 20, 50, 100]}
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
                  : "No screening candidates found"}
              </span>
            }
          />
        )}
      </div>

      {/* Candidate Details Modal */}
      <Modal
        title="Candidate Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "16px",
        }}
      >
        {selectedCandidate && (
          <>
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
              <Descriptions.Item label="Status">
                <Tag
                  color={getScreeningStatusColor(
                    selectedCandidate.candidateStatus
                  )}
                >
                  {selectedCandidate.candidateStatus?.toUpperCase() ||
                    "SCREENING"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Location">
                {selectedCandidate.location}
              </Descriptions.Item>
              <Descriptions.Item label="Title">
                {selectedCandidate.title}
              </Descriptions.Item>
              <Descriptions.Item label="Work Order">
                {selectedCandidate.workOrder?.title || "N/A"}
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

            <Divider orientation="left" style={{ margin: "16px 0" }}>
              {/* Move to Pipeline */}
            </Divider>

            <div style={{ marginBottom: "16px" }}>
              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                onClick={handleMoveToPipeline}
                loading={isMovingToPipeline}
                style={{ background: "#da2c46" }}
              >
                Move to Pipeline
              </Button>
            </div>

            <Divider />

            <div
              style={{
                display: "flex",
                flexDirection: window.innerWidth < 768 ? "column" : "row",
                gap: "8px",
                justifyContent: "space-between",
                marginTop: "16px",
              }}
            >
              <Button onClick={() => setIsModalVisible(false)}>Close</Button>
              <div
                style={{
                  display: "flex",
                  flexDirection: window.innerWidth < 768 ? "column" : "row",
                  gap: "8px",
                }}
              >
                <Button danger onClick={() => handleStatusUpdate("rejected")}>
                  <CloseOutlined /> Reject
                </Button>
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ScreeningCandidates;
