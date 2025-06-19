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
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  TrophyOutlined,
  ToolOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useGetSourcedCandidateQuery } from "../../Slices/Recruiter/RecruiterApis";
import CandidateCard from "./CandidateCard";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const SourcedCandidates = ({ jobId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    skills: [],
    minExperience: null,
    maxExperience: null,
    education: [],
    location: "",
  });


  const {
    data: filteredSource,
    isLoading,
    error,
  } = useGetSourcedCandidateQuery({
  });

  const filterOptions = useMemo(() => {
    const sourcedUsers = filteredSource?.users || [];

    const allSkills = new Set();
    const allEducation = new Set();
    const allLocations = new Set();

    sourcedUsers.forEach((user) => {
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
  }, [filteredSource?.users]);


  const filteredCandidates = useMemo(() => {
    let candidates = filteredSource?.users || [];

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
  }, [filteredSource?.users, searchTerm, filters]);

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

  if (isLoading) {
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

  if (error) {
    return (
      <div style={{ padding: "16px" }}>
        <Alert
          message="Failed to load sourced candidates"
          description="Unable to fetch sourced candidates for this job."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const sourcedUsers = filteredSource?.users || [];
  const total = filteredSource?.total || 0;

  if (!sourcedUsers || sourcedUsers.length === 0) {
    return (
      <div style={{ padding: "16px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ fontSize: "14px", color: "#999" }}>
              No sourced candidates found for this job
            </span>
          }
        />
      </div>
    );
  }

  const handleViewProfile = (candidate) => {
    console.log("View candidate:", candidate);
    // Add your navigation logic here
    // e.g., navigate to candidate detail page
  };

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
          Sourced Candidates ({filteredCandidates.length})
        </Title>

        <Text style={{ fontSize: "13px", color: "#666" }}>
          Candidates sourced for this position
        </Text>
      </div>

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
                        setFilters((prev) => ({ ...prev, education: value }))
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
    </div>
  );
};

export default SourcedCandidates;
