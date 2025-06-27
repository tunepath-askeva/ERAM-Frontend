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
  Input,
  Empty,
  Collapse,
  Divider,
  Row,
  Col,
  Grid,
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
  FileOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const RecruiterJobPipeline = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [targetStage, setTargetStage] = useState(null);
  const [isMoveModalVisible, setIsMoveModalVisible] = useState(false);
  const [processedJobData, setProcessedJobData] = useState(null);
  const screens = useBreakpoint();

  const primaryColor = "#da2c46";

  const { data: apiData, isLoading, error } = useGetPipelineJobsByIdQuery(id);

  useEffect(() => {
    if (apiData?.data) {
      const pipelineData = apiData.data;
      const workOrder = pipelineData.workOrder;
      const user = pipelineData.user;
      const stageProgress = pipelineData.stageProgress || [];

      // Get pipeline data from stageProgress[0].pipelineId
      const fullPipeline = stageProgress[0]?.pipelineId || {};
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
        stageStatus: currentStageProgress?.stageStatus || "pending", // This comes from your API
        appliedDate: pipelineData.createdAt,
        stageProgress: stageProgress, // Keep the full stageProgress for reference
        isSourced: pipelineData.isSourced === "true",
        responses: pipelineData.responses || [],
        uploadedDocuments: currentStageProgress?.uploadedDocuments || [],
        recruiterReviews: currentStageProgress?.recruiterReviews || [],
        requiredDocuments:
          fullPipeline.stages?.find(
            (s) => s._id === currentStageProgress?.stageId
          )?.requiredDocuments || [],
        // Remove documentApprovalStatus since it doesn't exist in your API
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
        workOrder: workOrder,
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
    if (
      !processedJobData ||
      !processedJobData.pipeline ||
      !processedJobData.pipeline.stages
    )
      return "";
    const stage = processedJobData.pipeline.stages.find(
      (s) => s._id === stageId
    );
    return stage ? stage.name : "";
  };

  const getCandidatesInStage = (stageId) => {
    if (!processedJobData || !processedJobData.candidates) return [];
    return processedJobData.candidates.filter(
      (candidate) => candidate.currentStage === stageId
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

    // Check if stage is approved (this matches your API structure)
    const canMove = selectedCandidate.stageStatus === "approved";

    if (!canMove) {
      message.warning("Cannot move candidate until stage is approved");
      return;
    }

    message.success(
      `Moved ${selectedCandidate.name} to ${getStageName(targetStage)}`
    );
    setIsMoveModalVisible(false);
  };

  const handleViewDocument = (fileUrl, fileName) => {
    window.open(fileUrl, "_blank");
  };

  const renderDocuments = (candidate) => {
    if (
      !processedJobData ||
      !processedJobData.pipeline ||
      !processedJobData.pipeline.stages
    ) {
      return null;
    }

    const currentStage = processedJobData.pipeline.stages.find(
      (stage) => stage._id === candidate.currentStage
    );

    const stageTimeline =
      processedJobData.workOrder?.pipelineStageTimeline?.find(
        (timeline) => timeline.stageId === candidate.currentStage
      );

    // Combine required documents from both sources
    const allRequiredDocuments = [
      ...(currentStage?.requiredDocuments || []),
      ...(stageTimeline?.requiredDocuments?.map((doc) => doc.title) || []),
    ];

    // Remove duplicates
    const uniqueRequiredDocuments = [...new Set(allRequiredDocuments)];

    if (
      !candidate.uploadedDocuments ||
      candidate.uploadedDocuments.length === 0
    ) {
      return (
        <Empty
          description="No documents uploaded"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ margin: "20px 0" }}
        />
      );
    }

    return (
      <div style={{ marginTop: "16px" }}>
        <Title level={5} style={{ marginBottom: "12px" }}>
          <FileOutlined style={{ marginRight: "8px" }} />
          Uploaded Documents ({candidate.uploadedDocuments.length})
        </Title>

        <div style={{ marginBottom: "16px" }}>
          <Text strong>Required Documents: </Text>
          {uniqueRequiredDocuments.length > 0 ? (
            uniqueRequiredDocuments.map((doc, index) => (
              <Tag key={index} color="blue" style={{ margin: "2px" }}>
                {doc}
              </Tag>
            ))
          ) : (
            <Text type="secondary">None specified</Text>
          )}
        </div>

        <Row gutter={[16, 16]}>
          {candidate.uploadedDocuments.map((doc, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={doc._id || index}>
              <Card
                size="small"
                hoverable
                style={{
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                }}
                actions={[
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() =>
                      handleViewDocument(doc.fileUrl, doc.fileName)
                    }
                    style={{ color: primaryColor }}
                  >
                    View
                  </Button>,
                ]}
              >
                <Card.Meta
                  avatar={
                    <FileOutlined
                      style={{ fontSize: "24px", color: primaryColor }}
                    />
                  }
                  title={
                    <Tooltip title={doc.fileName}>
                      <Text style={{ fontSize: "12px" }} ellipsis>
                        {doc.fileName}
                      </Text>
                    </Tooltip>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      Uploaded: {formatDate(doc.uploadedAt)}
                    </Text>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  const renderApprovalSection = (candidate) => {
    // Check stage approval status from API
    const isStageApproved = candidate.stageStatus === "approved";

    // Check if there are any reviewer approvals pending
    const hasReviewerApprovals =
      candidate.recruiterReviews && candidate.recruiterReviews.length > 0;
    const allReviewersApproved = hasReviewerApprovals
      ? candidate.recruiterReviews.every(
          (review) => review.status === "approved"
        )
      : true;

    // Check if approval object exists and is approved
    const hasApprovalObject =
      candidate.stageProgress && candidate.stageProgress.length > 0;
    const isApprovalApproved = hasApprovalObject
      ? candidate.stageProgress[0]?.approval?.isApproved === true
      : false;

    // Button should be enabled when stage is approved
    const canMoveToNextStage = isStageApproved;

    const getStageStatusTag = () => {
      if (isStageApproved) {
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Stage Approved
          </Tag>
        );
      } else {
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Stage Pending
          </Tag>
        );
      }
    };

    const getApprovalStatusTag = () => {
      if (isApprovalApproved) {
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Approval Granted
          </Tag>
        );
      } else {
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Approval Pending
          </Tag>
        );
      }
    };

    const getStatusMessage = () => {
      if (canMoveToNextStage) {
        return "Stage has been approved. You can now move the candidate to the next stage.";
      } else {
        return "Stage approval is still pending. You cannot move the candidate until the stage is approved.";
      }
    };

    return (
      <div
        style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#fafafa",
          borderRadius: "8px",
          border: "1px solid #f0f0f0",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: screens.xs ? "column" : "row",
            justifyContent: "space-between",
            alignItems: screens.xs ? "flex-start" : "center",
            gap: screens.xs ? "12px" : "0",
          }}
        >
          <div>
            <Text strong>Approval Status:</Text>
            <div
              style={{
                marginTop: "4px",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              {getStageStatusTag()}
              {hasApprovalObject && getApprovalStatusTag()}
            </div>
          </div>

          <Space
            direction={screens.xs ? "vertical" : "horizontal"}
            style={{ width: screens.xs ? "100%" : "auto" }}
          >
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              disabled={!canMoveToNextStage}
              onClick={(e) => handleMoveCandidate(candidate, e)}
              style={{
                backgroundColor: canMoveToNextStage ? primaryColor : "#d9d9d9",
                borderColor: canMoveToNextStage ? primaryColor : "#d9d9d9",
                width: screens.xs ? "100%" : "auto",
              }}
              block={screens.xs}
            >
              Move to Next Stage
            </Button>
          </Space>
        </div>

        <div style={{ marginTop: "12px" }}>
          <Text
            type={canMoveToNextStage ? "success" : "secondary"}
            style={{ fontSize: "12px" }}
          >
            <ExclamationCircleOutlined style={{ marginRight: "4px" }} />
            {getStatusMessage()}
          </Text>
        </div>
      </div>
    );
  };

  const renderCustomFields = (candidate) => {
    if (
      !processedJobData ||
      !processedJobData.pipeline ||
      !processedJobData.pipeline.stages
    ) {
      return null;
    }

    const currentStage = processedJobData.pipeline.stages.find(
      (stage) => stage._id === candidate.currentStage
    );

    const stageTimeline =
      processedJobData.workOrder?.pipelineStageTimeline?.find(
        (timeline) => timeline.stageId === candidate.currentStage
      );

    if (
      !stageTimeline?.customFields ||
      stageTimeline.customFields.length === 0
    ) {
      return null;
    }

    return (
      <div style={{ marginTop: "16px" }}>
        <Title level={5} style={{ marginBottom: "12px" }}>
          Custom Fields
        </Title>

        {stageTimeline.customFields.map((field, index) => (
          <div key={index} style={{ marginBottom: "12px" }}>
            <Text strong>{field.label}:</Text>
            {field.type === "select" ? (
              <Select
                style={{ width: "100%", marginTop: "8px" }}
                placeholder={`Select ${field.label}`}
                options={field.options.map((option) => ({
                  value: option,
                  label: option,
                }))}
              />
            ) : (
              <Input
                style={{ width: "100%", marginTop: "8px" }}
                placeholder={`Enter ${field.label}`}
              />
            )}
          </div>
        ))}
      </div>
    );
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
    <div
      style={{
        padding: screens.xs ? "8px" : "16px",
        minHeight: "100vh",
        maxWidth: "100vw",
        overflowX: "hidden",
      }}
    >
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
              flexDirection: screens.xs ? "column" : "row",
              justifyContent: "space-between",
              alignItems: screens.xs ? "flex-start" : "flex-start",
              gap: screens.xs ? "8px" : "0",
            }}
          >
            <div>
              <Title level={screens.xs ? 4 : 3} style={{ margin: 0 }}>
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
                  style={{
                    display: "block",
                    marginTop: "4px",
                    fontSize: screens.xs ? "12px" : "14px",
                  }}
                >
                  {processedJobData.description}
                </Text>
              )}
            </div>
            <Tag
              color={processedJobData.isActive ? "green" : "red"}
              style={{ marginTop: screens.xs ? "8px" : "0" }}
            >
              {processedJobData.isActive ? "Active" : "Inactive"}
            </Tag>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {processedJobData.startDate && (
              <Text
                type="secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: screens.xs ? "12px" : "14px",
                }}
              >
                <CalendarOutlined /> Start:{" "}
                {new Date(processedJobData.startDate).toLocaleDateString()}
              </Text>
            )}
            {processedJobData.endDate && (
              <Text
                type="secondary"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: screens.xs ? "12px" : "14px",
                }}
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

      <div
        style={{
          overflowX: "auto",
          marginBottom: "16px",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Tabs
          activeKey={activeStage}
          onChange={setActiveStage}
          tabPosition="top"
          type={screens.xs ? "line" : "card"}
          style={{
            minWidth: screens.xs ? "100%" : "max-content",
            width: screens.xs ? "100%" : "auto",
          }}
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
                  <span
                    style={{
                      padding: screens.xs ? "0 4px" : "0 8px",
                      fontSize: screens.xs ? "12px" : "14px",
                    }}
                  >
                    {stage.name}
                  </span>
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
              itemLayout="vertical"
              dataSource={getCandidatesInStage(activeStage)}
              renderItem={(candidate) => (
                <List.Item
                  style={{
                    padding: screens.xs ? "12px" : "20px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={candidate.avatar}
                        icon={<UserOutlined />}
                        size={screens.xs ? "default" : "large"}
                      />
                    }
                    title={
                      <div
                        style={{
                          display: "flex",
                          flexDirection: screens.xs ? "column" : "row",
                          alignItems: screens.xs ? "flex-start" : "center",
                          gap: screens.xs ? "4px" : "8px",
                        }}
                      >
                        <Text
                          strong
                          style={{
                            fontSize: screens.xs ? "16px" : "18px",
                            lineHeight: screens.xs ? "1.2" : "1.5",
                          }}
                        >
                          {candidate.name}
                        </Text>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: screens.xs ? "4px" : "0",
                          }}
                        >
                          {candidate.isSourced && (
                            <Tag color="orange" size="small">
                              Sourced
                            </Tag>
                          )}
                          <Tag
                            color={
                              candidate.stageStatus === "completed"
                                ? "green"
                                : candidate.stageStatus === "rejected"
                                ? "red"
                                : "blue"
                            }
                            size={screens.xs ? "small" : "default"}
                          >
                            {candidate.stageStatus}
                          </Tag>
                        </div>
                      </div>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        <Text type="secondary">{candidate.email}</Text>
                        <Text type="secondary">{candidate.phone}</Text>
                        {candidate.skills && candidate.skills.length > 0 && (
                          <div>
                            {candidate.skills
                              .slice(0, screens.xs ? 3 : 5)
                              .map((skill, index) => (
                                <Tag
                                  key={index}
                                  size="small"
                                  style={{ margin: "1px" }}
                                >
                                  {skill}
                                </Tag>
                              ))}
                            {candidate.skills.length > (screens.xs ? 3 : 5) && (
                              <Tag size="small" style={{ margin: "1px" }}>
                                +
                                {candidate.skills.length - (screens.xs ? 3 : 5)}{" "}
                                more
                              </Tag>
                            )}
                          </div>
                        )}
                        <Text
                          type="secondary"
                          style={{
                            fontSize: screens.xs ? "11px" : "12px",
                          }}
                        >
                          Applied {formatDate(candidate.appliedDate)}
                        </Text>
                      </Space>
                    }
                  />

                  {/* Documents Section */}
                  <Collapse
                    ghost
                    style={{ marginTop: "16px" }}
                    items={[
                      {
                        key: "1",
                        label: (
                          <Text strong>
                            <FileOutlined style={{ marginRight: "8px" }} />
                            Documents & Approval (
                            {candidate.uploadedDocuments?.length || 0})
                          </Text>
                        ),
                        children: (
                          <div>
                            {renderDocuments(candidate)}
                            {renderCustomFields(candidate)}
                            {renderApprovalSection(candidate)}
                          </div>
                        ),
                      },
                    ]}
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
        width={screens.xs ? "90vw" : "520px"}
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

        {selectedCandidate &&
          selectedCandidate.documentApprovalStatus === "approved" && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#f6ffed",
                borderRadius: "6px",
              }}
            >
              <Text type="secondary" style={{ fontSize: "12px" }}>
                <CheckCircleOutlined
                  style={{ color: "#52c41a", marginRight: "4px" }}
                />
                Documents have been approved for this candidate
              </Text>
            </div>
          )}

        {selectedCandidate &&
          selectedCandidate.documentApprovalStatus !== "approved" && (
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                backgroundColor: "#fff2e8",
                borderRadius: "6px",
              }}
            >
              <Text type="warning" style={{ fontSize: "12px" }}>
                <ClockCircleOutlined
                  style={{ color: "#fa8c16", marginRight: "4px" }}
                />
                Documents are still pending approval. Cannot move candidate
                until approved.
              </Text>
            </div>
          )}
      </Modal>
    </div>
  );
};

export default RecruiterJobPipeline;
