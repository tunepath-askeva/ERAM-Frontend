import React, { useState } from "react";
import { useGetSourcedCandidatesQuery } from "../../Slices/Recruiter/RecruiterApis";
import {
  Card,
  Spin,
  Alert,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Empty,
  Button,
  Space,
  Modal,
  Dropdown,
  Menu,
  message,
  Input,
  Select,
  Divider
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const SourcedCandidates = ({ jobId }) => {
  const { data, error, isLoading } = useGetSourcedCandidatesQuery(jobId);
  const [resumeModalVisible, setResumeModalVisible] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const { candidates = [] } = data || {};

  if (!candidates || candidates.length === 0) {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleViewResume = (resumeUrl, candidateName) => {
    if (!resumeUrl) {
      message.warning("No resume available for this candidate");
      return;
    }
    setSelectedResume({ url: resumeUrl, name: candidateName });
    setResumeModalVisible(true);
  };

  const handleDownloadResume = (resumeUrl, candidateName) => {
    if (!resumeUrl) {
      message.warning("No resume available for this candidate");
      return;
    }
    
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${candidateName}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("Resume download started");
  };

  const filteredCandidates = candidates.filter(candidate => {
    // Filter by search term
    const matchesSearch = 
      candidate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.phone?.includes(searchTerm);
    
    // Filter by status
    const matchesStatus = 
      statusFilter === "all" || 
      candidate.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const renderCandidateCard = (candidate, index) => {
    return (
      <Card
        key={candidate._id || index}
        size="small"
        style={{
          marginBottom: "12px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        hoverable
      >
        <Row gutter={[16, 12]} align="middle">
          <Col flex="none">
            <Avatar
              size={48}
              icon={<UserOutlined />}
              style={{ backgroundColor: "#1890ff" }}
            >
              {candidate?.fullName?.charAt(0)?.toUpperCase()}
            </Avatar>
          </Col>

          <Col flex="auto">
            <div>
              <Title
                level={5}
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                {candidate?.fullName || "Unknown Candidate"}
              </Title>

              <Space direction="vertical" size={2}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <MailOutlined style={{ fontSize: "12px", color: "#666" }} />
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {candidate?.email || "No email provided"}
                  </Text>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <PhoneOutlined style={{ fontSize: "12px", color: "#666" }} />
                  <Text style={{ fontSize: "13px", color: "#666" }}>
                    {candidate?.phone || "No phone provided"}
                  </Text>
                </div>

                {candidate.resume && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FileTextOutlined style={{ fontSize: "12px", color: "#666" }} />
                    <Space size={4}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewResume(candidate.resume, candidate.fullName)}
                        style={{ padding: "0", fontSize: "12px", height: "auto" }}
                      >
                        View Resume
                      </Button>
                      <Button
                        type="link"
                        size="small"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadResume(candidate.resume, candidate.fullName)}
                        style={{ padding: "0", fontSize: "12px", height: "auto" }}
                      >
                        Download
                      </Button>
                    </Space>
                  </div>
                )}
              </Space>
            </div>
          </Col>

          <Col flex="none">
            <Space direction="vertical" size={4} align="end">
              <Tag 
                color={candidate.status === "contacted" ? "blue" : "orange"} 
                style={{ fontSize: "11px" }}
              >
                {candidate.status || "new"}
              </Tag>
              
              <Button
                type="primary"
                size="small"
                style={{ fontSize: "12px" }}
                onClick={() => {
                  // Handle view candidate details
                  console.log("View candidate:", candidate);
                }}
              >
                View Profile
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <div style={{ padding: "0", fontSize: "14px" }}>
      {/* Header Section */}
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
          Sourced Candidates ({candidates.length})
        </Title>

        <Text style={{ fontSize: "13px", color: "#666" }}>
          Candidates sourced for this position
        </Text>
      </div>

      {/* Search and Filter Section */}
      <div style={{ marginBottom: "16px" }}>
        <Row gutter={16} align="middle">
          <Col span={16}>
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
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Filter by status"
              suffixIcon={<FilterOutlined />}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Statuses</Option>
              <Option value="new">New</Option>
              <Option value="contacted">Contacted</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>
        </Row>
      </div>

      <Divider style={{ margin: "12px 0" }} />

      {/* Candidates List */}
      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate, index) =>
            renderCandidateCard(candidate, index)
          )
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: "14px", color: "#999" }}>
                No candidates match your search criteria
              </span>
            }
          />
        )}
      </div>

      {/* Footer Actions */}
      <div
        style={{
          marginTop: "16px",
          padding: "12px 0",
          borderTop: "1px solid #f0f0f0",
          textAlign: "center",
        }}
      >
        <Space>
          <Button type="default" size="small">
            Export Candidates
          </Button>
          <Button type="primary" size="small">
            Bulk Actions
          </Button>
        </Space>
      </div>

      {/* Resume Modal */}
      <Modal
        title={`Resume - ${selectedResume?.name || 'Candidate'}`}
        open={resumeModalVisible}
        onCancel={() => setResumeModalVisible(false)}
        footer={[
          <Button key="download" 
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadResume(selectedResume?.url, selectedResume?.name)}
          >
            Download
          </Button>,
          <Button key="close" onClick={() => setResumeModalVisible(false)}>
            Close
          </Button>,
        ]}
        width="80%"
        style={{ top: 20 }}
        bodyStyle={{ height: '70vh', padding: 0 }}
      >
        {selectedResume?.url && (
          <iframe
            src={selectedResume.url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Resume Preview"
          />
        )}
      </Modal>
    </div>
  );
};

export default SourcedCandidates;