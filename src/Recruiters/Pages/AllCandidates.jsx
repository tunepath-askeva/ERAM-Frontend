import React, { useState, useMemo } from "react";
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
  Dropdown,
  Menu,
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
  MoreOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useGetAllBranchedCandidateQuery,
  useUpdateBranchedCandidateMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import CandidateDetailsDrawer from "./CandidateDetailsDrawer";
import CandidateEditModal from "./CandidateEditModal";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

function AllCandidates() {
  const {
    data: allcandidates,
    isLoading,
    error,
    refetch,
  } = useGetAllBranchedCandidateQuery();
  const [updateCandidate, { isLoading: isUpdating }] =
    useUpdateBranchedCandidateMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedExperience, setSelectedExperience] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);

  const filterOptions = useMemo(() => {
    if (!allcandidates?.users)
      return { skills: [], locations: [], industries: [] };

    const skills = [
      ...new Set(allcandidates.users.flatMap((user) => user.skills || [])),
    ];
    const locations = [
      ...new Set(
        allcandidates.users.map((user) => user.location).filter(Boolean)
      ),
    ];
    const industries = [
      ...new Set(allcandidates.users.flatMap((user) => user.industry || [])),
    ];

    return { skills, locations, industries };
  }, [allcandidates]);

  const filteredCandidates = useMemo(() => {
    if (!allcandidates?.users) return [];

    return allcandidates.users.filter((candidate) => {
      const matchesSearch =
        !searchTerm ||
        candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.skills?.some((skill) =>
          skill.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesSkills =
        selectedSkills.length === 0 ||
        selectedSkills.some((skill) => candidate.skills?.includes(skill));

      const matchesLocation =
        !selectedLocation || candidate.location === selectedLocation;

      const matchesExperience =
        !selectedExperience ||
        candidate.totalExperienceYears === selectedExperience;

      const matchesIndustry =
        !selectedIndustry || candidate.industry?.includes(selectedIndustry);

      return (
        matchesSearch &&
        matchesSkills &&
        matchesLocation &&
        matchesExperience &&
        matchesIndustry
      );
    });
  }, [
    allcandidates,
    searchTerm,
    selectedSkills,
    selectedLocation,
    selectedExperience,
    selectedIndustry,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSkills([]);
    setSelectedLocation("");
    setSelectedExperience("");
    setSelectedIndustry("");
  };

  const showCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setDrawerVisible(true);
  };

  const handleEditCandidate = (candidate) => {
    setCandidateToEdit(candidate);
    setEditModalVisible(true);
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
    } catch (error) {
      message.error("Failed to update candidate");
      console.error("Update error:", error);
    }
  };

  const getSocialIcon = (platform) => {
    const icons = {
      linkedin: <LinkedinOutlined />,
      github: <GithubOutlined />,
      twitter: <TwitterOutlined />,
      facebook: <FacebookOutlined />,
    };
    return icons[platform] || null;
  };

  const CandidateCard = ({ candidate }) => (
    <div style={{ height: 420, marginBottom: 16 }}>
      <Card
        hoverable
        className="candidate-card"
        style={{
          borderRadius: 8,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        bodyStyle={{
          padding: 16,
          height: "calc(100% - 57px)",
          position: "relative",
          overflow: "hidden",
        }}
        actions={[
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showCandidateDetails(candidate)}
          >
            View Details
          </Button>,
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditCandidate(candidate)}
          >
            Edit
          </Button>,
        ]}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            marginBottom: 16,
            height: 70,
          }}
        >
          <Avatar
            size={64}
            src={candidate.image}
            icon={<UserOutlined />}
            style={{
              backgroundColor: "#1890ff",
              flexShrink: 0,
              marginRight: 12,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title
              level={4}
              style={{
                margin: 0,
                fontSize: "16px",
                lineHeight: "20px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={candidate.fullName}
            >
              {candidate.fullName}
            </Title>
            <Text
              type="secondary"
              style={{
                display: "block",
                fontSize: "14px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: 2,
              }}
              title={candidate.title || "Position not specified"}
            >
              {candidate.title || "Position not specified"}
            </Text>
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 6,
              overflow: "hidden",
            }}
          >
            <MailOutlined
              style={{ color: "#666", fontSize: "12px", marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: "12px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={candidate.email}
            >
              {candidate.email}
            </Text>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 6,
              overflow: "hidden",
            }}
          >
            <PhoneOutlined
              style={{ color: "#666", fontSize: "12px", marginRight: 8 }}
            />
            <Text style={{ fontSize: "12px" }}>{candidate.phone}</Text>
          </div>

          {candidate.location && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 6,
                overflow: "hidden",
              }}
            >
              <EnvironmentOutlined
                style={{ color: "#666", fontSize: "12px", marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={candidate.location}
              >
                {candidate.location}
              </Text>
            </div>
          )}

          {candidate.totalExperienceYears && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <CalendarOutlined
                style={{ color: "#666", fontSize: "12px", marginRight: 8 }}
              />
              <Text style={{ fontSize: "12px" }}>
                {candidate.totalExperienceYears} years experience
              </Text>
            </div>
          )}
        </div>

        <div style={{ height: 60, marginBottom: 12 }}>
          <Text
            strong
            style={{ fontSize: "12px", display: "block", marginBottom: 6 }}
          >
            Skills:
          </Text>
          <div style={{ height: 40, overflow: "hidden" }}>
            {candidate.skills && candidate.skills.length > 0 ? (
              <>
                {candidate.skills.slice(0, 2).map((skill) => (
                  <Tag
                    key={skill}
                    color="blue"
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      marginBottom: 4,
                      marginRight: 4,
                      height: "auto",
                      lineHeight: "14px",
                    }}
                  >
                    {skill.length > 10 ? `${skill.substring(0, 10)}...` : skill}
                  </Tag>
                ))}
                {candidate.skills.length > 2 && (
                  <Tag
                    color="default"
                    style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      height: "auto",
                      lineHeight: "14px",
                    }}
                  >
                    +{candidate.skills.length - 2}
                  </Tag>
                )}
              </>
            ) : (
              <Text type="secondary" style={{ fontSize: "12px" }}>
                No skills listed
              </Text>
            )}
          </div>
        </div>

        {/* Status Section - Fixed at Bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 45,
            left: 16,
            right: 16,
            height: 25,
          }}
        >
          <Space wrap size="small">
            <Badge
              status={
                candidate.accountStatus === "active" ? "success" : "error"
              }
              text={
                <span style={{ fontSize: "11px" }}>
                  {candidate.accountStatus}
                </span>
              }
            />
            <Tag
              color={candidate.candidateType === "Khafalath" ? "gold" : "green"}
              style={{
                fontSize: "10px",
                padding: "1px 4px",
                height: "18px",
                lineHeight: "16px",
              }}
            >
              {candidate.candidateType}
            </Tag>
            {candidate.noticePeriod && (
              <Tag
                color="orange"
                style={{
                  fontSize: "10px",
                  padding: "1px 4px",
                  height: "18px",
                  lineHeight: "16px",
                }}
              >
                {candidate.noticePeriod === "Immediate"
                  ? "Immediate"
                  : "Notice"}
              </Tag>
            )}
          </Space>
        </div>

        {candidate.socialLinks &&
          Object.entries(candidate.socialLinks).some(([_, link]) => link) && (
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: 16,
                right: 16,
                height: 20,
              }}
            >
              <Space size="small">
                {Object.entries(candidate.socialLinks).map(([platform, link]) =>
                  link ? (
                    <Tooltip key={platform} title={`${platform} profile`}>
                      <Button
                        type="text"
                        icon={getSocialIcon(platform)}
                        size="small"
                        href={
                          link.startsWith("http") ? link : `https://${link}`
                        }
                        target="_blank"
                        style={{
                          padding: "2px 2px",
                          minWidth: "auto",
                          height: "20px",
                          width: "20px",
                        }}
                      />
                    </Tooltip>
                  ) : null
                )}
              </Space>
            </div>
          )}
      </Card>
    </div>
  );

  if (isLoading) {
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
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <Title level={2}>All Candidates</Title>
        <Text type="secondary">
          Showing {filteredCandidates.length} of{" "}
          {allcandidates?.users?.length || 0} candidates
        </Text>
      </div>

      <Card style={{ marginBottom: "24px" }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Search
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
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

      {filteredCandidates.length === 0 ? (
        <Empty
          description="No candidates found"
          style={{ marginTop: "50px" }}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCandidates.map((candidate) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={candidate._id}>
              <CandidateCard candidate={candidate} />
            </Col>
          ))}
        </Row>
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
