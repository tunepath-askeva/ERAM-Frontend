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
  Collapse,
  Badge,
  Modal,
  Descriptions,
  Tag,
  message,
  DatePicker,
  TimePicker,
  Form,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  ToolOutlined,
  ClearOutlined,
  EyeOutlined,
  CalendarOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useGetJobApplicationsQuery,
  useUpdateCandidateStatusMutation,
  useGetSourcedCandidateQuery,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TextArea } = Input;

const ScreeningCandidates = ({ jobId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [form] = Form.useForm();

  const [updateCandidateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateCandidateStatusMutation();

  const [filters, setFilters] = useState({
    skills: [],
    education: [],
    location: "",
    screeningStatus: [],
  });

  const {
    data: jobApplications,
    isLoading: jobLoading,
    error: jobError,
    refetch: jobRefetch,
  } = useGetJobApplicationsQuery(jobId);

  const {
    data: filteredSource,
    isLoading,
    error,
    refetch,
  } = useGetSourcedCandidateQuery({});

  console.log(filteredSource, "Filtered");

  const allCandidates = useMemo(() => {
    return (
      jobApplications?.formResponses?.map((response) => ({
        ...response.user,
        candidateStatus: response.status,
        applicationId: response._id,
        responses: response.responses,
      })) || []
    );
  }, [jobApplications]);

  const filterOptions = useMemo(() => {
    const screeningCandidates = allCandidates.filter(
      (candidate) =>
        candidate.candidateStatus === "screening" ||
        candidate.candidateStatus === "interview" ||
        candidate.candidateStatus === "shortlisted" ||
        candidate.candidateStatus === "rejected"
    );

    const allSkills = new Set();
    const allEducation = new Set();
    const allLocations = new Set();

    screeningCandidates.forEach((user) => {
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

  const screeningCandidates = useMemo(() => {
    return allCandidates.filter(
      (candidate) =>
        candidate.candidateStatus === "screening" ||
        candidate.candidateStatus === "interview" ||
        candidate.candidateStatus === "shortlisted" ||
        candidate.candidateStatus === "rejected"
    );
  }, [allCandidates]);

  const filteredCandidates = useMemo(() => {
    let candidates = screeningCandidates;

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
  }, [screeningCandidates, searchTerm, filters]);

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

  const handleScheduleInterview = (candidate) => {
    setSelectedCandidate(candidate);
    setIsScheduleModalVisible(true);
    form.resetFields();
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

  if (isLoading) {
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

  if (error) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Failed to load screening candidates"
          description="Unable to fetch screening candidates for this job."
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
          Screening Candidates ({screeningCandidates.length})
        </Title>{" "}
      </div>

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
              actions={[
                <Button
                  key="view"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewProfile(candidate)}
                >
                  View Profile
                </Button>,
                <Button
                  key="schedule"
                  type="primary"
                  icon={<CalendarOutlined />}
                  onClick={() => handleScheduleInterview(candidate)}
                >
                  Schedule Interview
                </Button>,
                <Button
                  key="shortlist"
                  icon={<CheckOutlined />}
                  onClick={() => handleStatusUpdate("shortlisted")}
                >
                  Shortlist
                </Button>,
                <Button
                  key="reject"
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleStatusUpdate("rejected")}
                >
                  Reject
                </Button>,
              ]}
            />
          ))
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
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button
            key="shortlist"
            type="primary"
            onClick={() => handleStatusUpdate("shortlisted")}
          >
            <CheckOutlined /> Shortlist
          </Button>,
          <Button
            key="schedule"
            icon={<CalendarOutlined />}
            onClick={() => {
              setIsModalVisible(false);
              handleScheduleInterview(selectedCandidate);
            }}
          >
            Schedule Interview
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => handleStatusUpdate("rejected")}
          >
            <CloseOutlined /> Reject
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

      {/* Schedule Interview Modal */}
      <Modal
        title="Schedule Interview"
        visible={isScheduleModalVisible}
        onCancel={() => setIsScheduleModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsScheduleModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            Schedule Interview
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleScheduleSubmit}>
          <Form.Item
            name="interviewType"
            label="Interview Type"
            rules={[
              { required: true, message: "Please select interview type" },
            ]}
          >
            <Select placeholder="Select interview type">
              <Option value="phone">
                <PhoneOutlined /> Phone Interview
              </Option>
              <Option value="video">
                <VideoCameraOutlined /> Video Interview
              </Option>
              <Option value="in-person">In-Person Interview</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="time"
            label="Time"
            rules={[{ required: true, message: "Please select time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="interviewLink"
            label="Interview Link"
            rules={[
              {
                required: form.getFieldValue("interviewType") !== "in-person",
                message: "Please provide interview link",
              },
            ]}
          >
            <Input placeholder="Enter meeting link for phone/video interviews" />
          </Form.Item>

          <Form.Item name="notes" label="Notes">
            <TextArea
              rows={4}
              placeholder="Any additional notes for the candidate"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScreeningCandidates;
