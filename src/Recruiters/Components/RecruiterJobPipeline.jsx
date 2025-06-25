import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetPipelineJobsByIdQuery } from "../../Slices/Recruiter/RecruiterApis";
import {
  Card,
  Typography,
  Tag,
  Space,
  Badge,
  List,
  Spin,
  Avatar,
  Button,
  Tabs,
  Dropdown,
  Menu,
  Modal,
  message,
  Tooltip,
  Select,
  Empty,
} from "antd";
import {
  TeamOutlined,
  EnvironmentOutlined,
  MoreOutlined,
  UserOutlined,
  LeftOutlined,
  DollarOutlined,
  CalendarOutlined,
  BankOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const RecruiterJobPipeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [targetStage, setTargetStage] = useState(null);
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [processedJobData, setProcessedJobData] = useState(null);

  const primaryColor = "#da2c46";

  const { data: apiData, isLoading, error } = useGetPipelineJobsByIdQuery(id);

  useEffect(() => {
    if (apiData?.data) {
      const pipelineData = apiData.data;
      const workOrder = pipelineData.workOrder;
      const user = pipelineData.user;
      const stageProgress = pipelineData.stageProgress || [];
      const fullPipeline = pipelineData.fullPipeline;

      const currentStageProgress = stageProgress[0];

      const processedCandidate = {
        _id: pipelineData._id,
        pipelineCandidateId: pipelineData._id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        skills: user.skills || [],
        avatar: null,
        status: pipelineData.status === "pipeline" ? "Active" : "Inactive",
        currentStage: currentStageProgress?.stageId || null,
        currentStageName: currentStageProgress?.stageName || "Unknown",
        stageStatus: currentStageProgress?.stageStatus || "pending",
        appliedDate: pipelineData.createdAt,
        stageProgress: stageProgress,
        isSourced: pipelineData.isSourced === "true",
        responses: pipelineData.responses || [],
      };

      const jobData = {
        _id: workOrder._id,
        title: workOrder.title,
        company: workOrder.companyIndustry || "Company",
        location: workOrder.officeLocation,
        jobCode: workOrder.jobCode,
        description: workOrder.description,
        startDate: workOrder.startDate,
        endDate: workOrder.endDate,
        isActive: pipelineData.status === "pipeline",
        pipeline: {
          _id: fullPipeline._id,
          name: fullPipeline.name,
          stages: fullPipeline.stages || [],
        },
        candidates: [processedCandidate],
        deadline: workOrder.endDate,
      };

      setProcessedJobData(jobData);
    }
  }, [apiData, id]);

  useEffect(() => {
    if (processedJobData?.pipeline?.stages?.length > 0) {
      const currentCandidate = processedJobData.candidates[0];
      if (currentCandidate?.currentStage) {
        setActiveStage(currentCandidate.currentStage);
      } else {
        setActiveStage(processedJobData.pipeline.stages[0]._id);
      }
    }
  }, [processedJobData]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 90) return `${Math.ceil(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getStageName = (stageId) => {
    if (!processedJobData) return "";
    const stage = processedJobData.pipeline.stages.find(
      (s) => s._id === stageId
    );
    return stage ? stage.name : "";
  };

  const getCandidatesInStage = (stageId) => {
    return (
      processedJobData?.candidates?.filter(
        (candidate) => candidate.currentStage === stageId
      ) || []
    );
  };

  const handleMoveCandidate = (candidate, e) => {
    e?.stopPropagation();
    setSelectedCandidate(candidate);
    setTargetStage(null);
    setIsMoveModalVisible(true);
  };

  const confirmMoveCandidate = () => {
    if (!selectedCandidate || !targetStage) {
      message.warning("Please select a target stage");
      return;
    }
    console.log(
      "Moving candidate with ID:",
      selectedCandidate.pipelineCandidateId
    );
    console.log("To stage:", targetStage);

    message.success(
      `Moved ${selectedCandidate.name} to ${getStageName(targetStage)}`
    );
    setIsMoveModalVisible(false);

    // Make your API call here with selectedCandidate.pipelineCandidateId
    // Example:
    // moveCandidateToStage({
    //   candidateId: selectedCandidate.pipelineCandidateId,
    //   stageId: targetStage
    // });
  };

  if (isLoading) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin size="large" tip="Loading job pipeline..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Card>
          <Empty
            description={
              <div>
                <Text type="danger">Failed to load job pipeline</Text>
                <br />
                <Text type="secondary">Please try refreshing the page</Text>
              </div>
            }
          >
            <Button
              type="primary"
              onClick={() => window.location.reload()}
              style={{ background: primaryColor, border: "none" }}
            >
              Refresh Page
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  if (!processedJobData) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Empty description={<Text>No job data found</Text>} />
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", minHeight: "100vh" }}>
      <div style={{ marginBottom: "16px" }}>
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={() => navigate("/recruiter/staged-candidates")}
          style={{ color: primaryColor }}
        >
          Back to Jobs
        </Button>
      </div>

      <Card
        style={{
          marginBottom: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <Title level={3} style={{ margin: 0 }}>
                {processedJobData.title}
              </Title>
              <Text strong style={{ display: "block", marginTop: "4px" }}>
                {processedJobData.company} • {processedJobData.location}
              </Text>
              {processedJobData.jobCode && (
                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: "2px" }}
                >
                  Code: {processedJobData.jobCode}
                </Text>
              )}
              {processedJobData.description && (
                <Text
                  type="secondary"
                  style={{ display: "block", marginTop: "4px" }}
                >
                  {processedJobData.description}
                </Text>
              )}
            </div>
            <Tag color={processedJobData.isActive ? "green" : "red"}>
              {processedJobData.isActive ? "Active" : "Inactive"}
            </Tag>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {processedJobData.startDate && (
              <Text
                type="secondary"
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <CalendarOutlined /> Start:{" "}
                {new Date(processedJobData.startDate).toLocaleDateString()}
              </Text>
            )}
            {processedJobData.endDate && (
              <Text
                type="secondary"
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <CalendarOutlined /> End:{" "}
                {new Date(processedJobData.endDate).toLocaleDateString()}
              </Text>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text strong>Pipeline:</Text>
            <Tag color="blue">{processedJobData.pipeline.name}</Tag>
          </div>
        </div>
      </Card>

      <div style={{ overflowX: "auto", marginBottom: "16px" }}>
        <Tabs
          activeKey={activeStage}
          onChange={setActiveStage}
          tabPosition="top"
          type="card"
          style={{ minWidth: "max-content" }}
        >
          {processedJobData.pipeline.stages.map((stage) => (
            <TabPane
              key={stage._id}
              tab={
                <Badge
                  count={getCandidatesInStage(stage._id).length}
                  offset={[10, -5]}
                  style={{
                    backgroundColor:
                      activeStage === stage._id ? primaryColor : "#d9d9d9",
                  }}
                >
                  <span style={{ padding: "0 8px" }}>{stage.name}</span>
                </Badge>
              }
            />
          ))}
        </Tabs>
      </div>

      {activeStage && (
        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          }}
        >
          <Title level={4} style={{ marginBottom: "16px" }}>
            {getStageName(activeStage)} Candidates (
            {getCandidatesInStage(activeStage).length})
          </Title>

          {getCandidatesInStage(activeStage).length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={getCandidatesInStage(activeStage)}
              renderItem={(candidate) => (
                <List.Item
                  actions={[
                    <Dropdown
                      overlay={
                        <Menu>
                          {processedJobData.pipeline.stages
                            .filter(
                              (stage) => stage._id !== candidate.currentStage
                            )
                            .map((stage) => (
                              <Menu.Item
                                key={stage._id}
                                onClick={() => {
                                  setSelectedCandidate(candidate);
                                  setTargetStage(stage._id);
                                  confirmMoveCandidate();
                                }}
                              >
                                Move to {stage.name}
                              </Menu.Item>
                            ))}
                        </Menu>
                      }
                      placement="bottomRight"
                      trigger={["click"]}
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>,
                  ]}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f8f9fa")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar src={candidate.avatar} icon={<UserOutlined />} />
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Text strong style={{ fontSize: "16px" }}>
                          {candidate.name}
                        </Text>
                        {candidate.isSourced && (
                          <Tag color="orange" size="small">
                            Sourced
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          {candidate.email}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "13px" }}>
                          {candidate.phone}
                        </Text>
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div style={{ marginTop: "4px" }}>
                            {candidate.skills
                              .slice(0, 3)
                              .map((skill, index) => (
                                <Tag
                                  key={index}
                                  size="small"
                                  style={{ fontSize: "10px", margin: "1px" }}
                                >
                                  {skill}
                                </Tag>
                              ))}
                            {candidate.skills.length > 3 && (
                              <Tag
                                size="small"
                                style={{ fontSize: "10px", margin: "1px" }}
                              >
                                +{candidate.skills.length - 3} more
                              </Tag>
                            )}
                          </div>
                        )}
                        <div>
                          <Tag
                            color={
                              candidate.stageStatus === "completed"
                                ? "green"
                                : candidate.stageStatus === "rejected"
                                ? "red"
                                : "blue"
                            }
                            style={{ fontSize: "11px" }}
                          >
                            {candidate.stageStatus}
                          </Tag>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "11px",
                              marginLeft: "8px",
                            }}
                          >
                            Applied {formatDate(candidate.appliedDate)}
                          </Text>
                        </div>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              description={
                <Text type="secondary">No candidates in this stage</Text>
              }
              style={{ padding: "40px 0" }}
            />
          )}
        </Card>
      )}

      {/* Move Candidate Modal */}
      <Modal
        title={`Move ${selectedCandidate?.name || "Candidate"}`}
        visible={isMoveModalVisible}
        onOk={confirmMoveCandidate}
        onCancel={() => setIsMoveModalVisible(false)}
        okText="Confirm Move"
        okButtonProps={{
          style: { background: primaryColor, border: "none" },
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <Text>
            Current Stage:{" "}
            <Text strong>
              {selectedCandidate?.currentStageName || "Unknown"}
            </Text>
          </Text>
        </div>
        <div>
          <Text style={{ display: "block", marginBottom: "8px" }}>
            Select Target Stage:
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="Select stage"
            value={targetStage}
            onChange={setTargetStage}
          >
            {processedJobData?.pipeline.stages
              .filter((stage) => stage._id !== selectedCandidate?.currentStage)
              .map((stage) => (
                <Option key={stage._id} value={stage._id}>
                  {stage.name}
                </Option>
              ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default RecruiterJobPipeline;
