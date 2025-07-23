import React, { useState } from "react";
import {
  Card,
  Tag,
  Typography,
  Row,
  Col,
  Avatar,
  Button,
  Space,
  Checkbox,
  Divider,
  Modal,
  Timeline,
  Spin,
  Empty,
  Collapse,
  List,
  Badge,
  Descriptions,
  Pagination 
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TrophyOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ToolOutlined,
  EyeOutlined,
  DollarOutlined,
  GlobalOutlined,
  StarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  MinusCircleOutlined,
  CalendarOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useGetCandidateTimelineQuery } from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const CandidateCard = ({
  candidate,
  index,
  onViewProfile,
  showExperience = true,
  showSkills = true,
  maxSkills = 3,
  onSelectCandidate,
  isSelected,
  isSelectable = false,
}) => {
  const navigate = useNavigate();
  const [isTimelineModalVisible, setIsTimelineModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const {
    data: timelineData,
    isLoading: isTimelineLoading,
    isError: isTimelineError,
    refetch: refetchTimeline,
  } = useGetCandidateTimelineQuery(
    {
      id: candidate._id,
      page: pagination.current,
      pageSize: pagination.pageSize,
    },
    {
      skip: !isTimelineModalVisible,
    }
  );

  const calculateExperience = (workExperience) => {
    if (
      !workExperience ||
      !Array.isArray(workExperience) ||
      workExperience.length === 0
    ) {
      return 0;
    }

    let totalMonths = 0;
    workExperience.forEach((exp) => {
      if (!exp.startDate) {
        return;
      }

      try {
        const start = new Date(exp.startDate);

        if (isNaN(start.getTime())) {
          return;
        }

        let end;
        if (
          !exp.endDate ||
          exp.endDate === "Present" ||
          exp.endDate === "present"
        ) {
          end = new Date();
        } else {
          end = new Date(exp.endDate);
          if (isNaN(end.getTime())) {
            end = new Date();
          }
        }

        const monthsDiff =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());

        if (monthsDiff > 0) {
          totalMonths += monthsDiff;
        }
      } catch (error) {
        console.warn("Error calculating experience for:", exp);
        return;
      }
    });

    return Math.round((totalMonths / 12) * 10) / 10;
  };

  const getExperienceDisplay = () => {
    if (candidate.totalExperienceYears) {
      return candidate.totalExperienceYears;
    }

    const calculatedExp = calculateExperience(candidate.workExperience);

    if (calculatedExp === 0) {
      return "Fresher";
    }

    if (calculatedExp < 1) {
      return "< 1 year";
    }

    return `${calculatedExp} year${calculatedExp !== 1 ? "s" : ""}`;
  };

  const experience = getExperienceDisplay();

  const handleViewProfile = () => {
    onViewProfile(candidate);
  };

  const handleViewTimeline = () => {
    setIsTimelineModalVisible(true);
  };

  const handleTimelineModalClose = () => {
    setIsTimelineModalVisible(false);
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
  };

  const formatSalary = (salary) => {
    if (!salary || salary === "0") return null;

    const numSalary = parseFloat(salary);
    if (isNaN(numSalary)) return salary;

    if (numSalary >= 100000) {
      return `₹${(numSalary / 100000).toFixed(1)}L`;
    } else if (numSalary >= 1000) {
      return `₹${(numSalary / 1000).toFixed(0)}K`;
    } else {
      return `₹${numSalary}`;
    }
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

  const renderTimelineModal = () => (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <ClockCircleOutlined style={{ color: "#da2c46" }} />
          <span>Work Order Timeline - {candidate.fullName || "Candidate"}</span>
          {timelineData?.length > 0 && (
            <Badge
              count={timelineData.length}
              style={{ backgroundColor: "#da2c46" }}
            />
          )}
        </div>
      }
      open={isTimelineModalVisible}
      onCancel={handleTimelineModalClose}
      footer={[
        <div
          key="pagination"
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={timelineData?.totalCount || 0}
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            style={{ margin: 0 }}
          />
          <Button
            key="close"
            type="primary"
            style={{ background: "#da2c46" }}
            onClick={handleTimelineModalClose}
          >
            Close
          </Button>
        </div>,
      ]}
      width={1000}
      style={{ top: 20 }}
    >
      {isTimelineLoading ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: "#666" }}>
            Loading timeline...
          </div>
        </div>
      ) : isTimelineError ? (
        <div style={{ textAlign: "center", padding: "48px" }}>
          <CloseCircleOutlined
            style={{ fontSize: "48px", color: "#f5222d", marginBottom: 16 }}
          />
          <div style={{ color: "#f5222d", fontSize: "16px", marginBottom: 8 }}>
            Error Loading Timeline
          </div>
          <div style={{ color: "#666" }}>
            Failed to load timeline data. Please try again.
          </div>
          <Button
            type="primary"
            style={{ marginTop: 16, backgroundColor: "#da2c46" }}
            onClick={() => refetchTimeline()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div style={{ maxHeight: "75vh", overflowY: "auto", padding: "8px 0" }}>
          {timelineData?.data?.length > 0 ? (
            <>
              <div
                style={{
                  display: "flex",
                  gap: 16,
                  marginBottom: 24,
                  padding: "16px 20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: 8,
                  border: "1px solid #e9ecef",
                }}
              >
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#da2c46",
                    }}
                  >
                    {timelineData.totalCount}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Total Work Orders
                  </div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#52c41a",
                    }}
                  >
                    {
                      timelineData.filter((wo) => wo.status === "completed")
                        .length
                    }
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>Completed</div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {
                      timelineData.filter((wo) => wo.status === "pipeline")
                        .length
                    }
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>In Pipeline</div>
                </div>
                <div style={{ textAlign: "center", flex: 1 }}>
                  <div
                    style={{ fontSize: 24, fontWeight: "bold", color: "#666" }}
                  >
                    {timelineData.reduce(
                      (total, wo) => total + (wo.stages?.length || 0),
                      0
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    Total Stages
                  </div>
                </div>
              </div>

              <Collapse
                accordion={false}
                defaultActiveKey={timelineData.length === 1 ? ["0"] : []}
                style={{ backgroundColor: "transparent" }}
                expandIcon={({ isActive }) => (
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: isActive ? "#da2c46" : "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                    }}
                  >
                    {isActive ? (
                      <MinusCircleOutlined
                        style={{ color: "#fff", fontSize: 12 }}
                      />
                    ) : (
                      <ClockCircleOutlined
                        style={{ color: "#666", fontSize: 12 }}
                      />
                    )}
                  </div>
                )}
              >
                {timelineData.map((workOrder, woIndex) => (
                  <Panel
                    key={woIndex}
                    header={
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          width: "100%",
                          paddingRight: 16,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              backgroundColor:
                                workOrder.status === "completed"
                                  ? "#52c41a"
                                  : workOrder.status === "in_progress"
                                  ? "#1890ff"
                                  : "#d9d9d9",
                            }}
                          />
                          <div>
                            <div
                              style={{
                                fontWeight: "bold",
                                fontSize: 15,
                                color: "#da2c46",
                              }}
                            >
                              {workOrder.workOrderTitle}
                            </div>
                            <div style={{ fontSize: 12, color: "#666" }}>
                              Work Order #{woIndex + 1} •{" "}
                              {workOrder.stages?.length || 0} stages
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          {workOrder.isSourced && (
                            <Badge
                              status="success"
                              text="Sourced"
                              style={{ fontSize: 11 }}
                            />
                          )}
                          <Tag
                            color={
                              workOrder.status === "completed"
                                ? "success"
                                : workOrder.status === "in_progress"
                                ? "processing"
                                : "default"
                            }
                            style={{
                              margin: 0,
                              fontSize: 11,
                              borderRadius: 12,
                            }}
                          >
                            {workOrder.status.replace("_", " ").toUpperCase()}
                          </Tag>
                        </div>
                      </div>
                    }
                    style={{
                      marginBottom: 16,
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div style={{ padding: "0 16px 16px 16px" }}>
                      {/* Work Order Details */}
                      {workOrder.selectedMovingComment && (
                        <div
                          style={{
                            marginBottom: 20,
                            padding: 12,
                            backgroundColor: "#f8f9fa",
                            borderRadius: 8,
                            borderLeft: "4px solid #da2c46",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 6,
                            }}
                          >
                            <CommentOutlined
                              style={{ color: "#da2c46", fontSize: 14 }}
                            />
                            <Text strong style={{ fontSize: 13 }}>
                              Moving Comment
                            </Text>
                          </div>
                          <Text style={{ fontSize: 13, fontStyle: "italic" }}>
                            "{workOrder.selectedMovingComment}"
                          </Text>
                        </div>
                      )}

                      {/* Stages Timeline */}
                      {workOrder.stages && workOrder.stages.length > 0 ? (
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 16,
                              paddingBottom: 8,
                              borderBottom: "1px solid #f0f0f0",
                            }}
                          >
                            <TrophyOutlined
                              style={{ color: "#da2c46", fontSize: 16 }}
                            />
                            <Text strong style={{ color: "#da2c46" }}>
                              Interview Stages Progress
                            </Text>
                            <Tag style={{ marginLeft: "auto", fontSize: 11 }}>
                              {
                                workOrder.stages.filter(
                                  (s) => s.stageStatus === "approved"
                                ).length
                              }{" "}
                              / {workOrder.stages.length} Completed
                            </Tag>
                          </div>

                          <Timeline size="small" style={{ marginLeft: 8 }}>
                            {workOrder.stages.map((stage, stageIndex) => (
                              <Timeline.Item
                                key={stageIndex}
                                dot={
                                  <div
                                    style={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                      backgroundColor:
                                        stage.stageStatus === "approved"
                                          ? "#52c41a"
                                          : stage.stageStatus === "rejected"
                                          ? "#f5222d"
                                          : "#faad14",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border: "2px solid #fff",
                                      boxShadow:
                                        "0 0 0 1px " +
                                        (stage.stageStatus === "approved"
                                          ? "#52c41a"
                                          : stage.stageStatus === "rejected"
                                          ? "#f5222d"
                                          : "#faad14"),
                                    }}
                                  >
                                    {stage.stageStatus === "approved" ? (
                                      <CheckCircleOutlined
                                        style={{ fontSize: 8, color: "#fff" }}
                                      />
                                    ) : stage.stageStatus === "rejected" ? (
                                      <CloseCircleOutlined
                                        style={{ fontSize: 8, color: "#fff" }}
                                      />
                                    ) : (
                                      <ClockCircleOutlined
                                        style={{ fontSize: 8, color: "#fff" }}
                                      />
                                    )}
                                  </div>
                                }
                                color="transparent"
                              >
                                <div style={{ paddingBottom: 12 }}>
                                  {/* Stage Header - Compact */}
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      marginBottom: 8,
                                    }}
                                  >
                                    <Text strong style={{ fontSize: 14 }}>
                                      {stage.stageName}
                                    </Text>
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                      }}
                                    >
                                      <Tag
                                        color={
                                          stage.stageStatus === "approved"
                                            ? "success"
                                            : stage.stageStatus === "rejected"
                                            ? "error"
                                            : "warning"
                                        }
                                        style={{
                                          margin: 0,
                                          fontSize: 10,
                                          borderRadius: 8,
                                        }}
                                      >
                                        {stage.stageStatus.toUpperCase()}
                                      </Tag>
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 11 }}
                                      >
                                        {stage.stageCompletedAt
                                          ? new Date(
                                              stage.stageCompletedAt
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                            })
                                          : "Pending"}
                                      </Text>
                                    </div>
                                  </div>

                                  {/* Recruiter Reviews - Compact */}
                                  {stage.recruiterReviews &&
                                    stage.recruiterReviews.length > 0 && (
                                      <div
                                        style={{
                                          backgroundColor: "#fafafa",
                                          padding: 8,
                                          borderRadius: 6,
                                          marginTop: 6,
                                          border: "1px solid #f0f0f0",
                                        }}
                                      >
                                        <Collapse size="small" ghost>
                                          <Panel
                                            header={
                                              <Text
                                                style={{
                                                  fontSize: 12,
                                                  color: "#666",
                                                }}
                                              >
                                                Reviews (
                                                {stage.recruiterReviews.length})
                                              </Text>
                                            }
                                            key="reviews"
                                          >
                                            {stage.recruiterReviews.map(
                                              (review, reviewIndex) => (
                                                <div
                                                  key={reviewIndex}
                                                  style={{
                                                    marginBottom:
                                                      reviewIndex <
                                                      stage.recruiterReviews
                                                        .length -
                                                        1
                                                        ? 8
                                                        : 0,
                                                    paddingBottom:
                                                      reviewIndex <
                                                      stage.recruiterReviews
                                                        .length -
                                                        1
                                                        ? 8
                                                        : 0,
                                                    borderBottom:
                                                      reviewIndex <
                                                      stage.recruiterReviews
                                                        .length -
                                                        1
                                                        ? "1px solid #e8e8e8"
                                                        : "none",
                                                  }}
                                                >
                                                  <div
                                                    style={{
                                                      display: "flex",
                                                      justifyContent:
                                                        "space-between",
                                                      alignItems: "center",
                                                      marginBottom: 4,
                                                    }}
                                                  >
                                                    <Text
                                                      strong
                                                      style={{ fontSize: 12 }}
                                                    >
                                                      {review.recruiterName}
                                                    </Text>
                                                    <Tag
                                                      color={
                                                        review.status ===
                                                        "approved"
                                                          ? "success"
                                                          : review.status ===
                                                            "rejected"
                                                          ? "error"
                                                          : "warning"
                                                      }
                                                      style={{
                                                        margin: 0,
                                                        fontSize: 10,
                                                      }}
                                                    >
                                                      {review.status.toUpperCase()}
                                                    </Tag>
                                                  </div>

                                                  {review.reviewComments && (
                                                    <div
                                                      style={{
                                                        fontSize: 11,
                                                        color: "#666",
                                                        fontStyle: "italic",
                                                        marginBottom: 4,
                                                        lineHeight: 1.4,
                                                      }}
                                                    >
                                                      "{review.reviewComments}"
                                                    </div>
                                                  )}

                                                  <Text
                                                    type="secondary"
                                                    style={{ fontSize: 10 }}
                                                  >
                                                    {new Date(
                                                      review.reviewedAt
                                                    ).toLocaleDateString(
                                                      "en-US",
                                                      {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                      }
                                                    )}
                                                  </Text>
                                                </div>
                                              )
                                            )}
                                          </Panel>
                                        </Collapse>
                                      </div>
                                    )}
                                </div>
                              </Timeline.Item>
                            ))}
                          </Timeline>
                        </div>
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: 20,
                            color: "#999",
                          }}
                        >
                          <MinusCircleOutlined
                            style={{ fontSize: 24, marginBottom: 8 }}
                          />
                          <div>No stages defined for this work order</div>
                        </div>
                      )}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "48px" }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <div>
                    <div style={{ fontSize: 16, marginBottom: 8 }}>
                      No Timeline Data
                    </div>
                    <div style={{ color: "#666" }}>
                      No work order timeline found for this candidate
                    </div>
                  </div>
                }
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );

  return (
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
          {isSelectable && (
            <Col flex="none">
              <Checkbox
                checked={isSelected}
                onChange={(e) =>
                  onSelectCandidate(candidate._id, e.target.checked)
                }
              />
            </Col>
          )}

          <Col flex="auto">
            <Row align="top" gutter={[16, 12]}>
              <Col
                xs={24}
                md={18}
                style={{
                  paddingRight: "clamp(0px, 2vw, 16px)",
                  marginBottom: "clamp(0px, 3vw, 12px)",
                }}
              >
                <div style={{ marginBottom: "clamp(8px, 1.5vw, 12px)" }}>
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
                      {candidate.fullName || "Unknown Candidate"}
                    </Text>
                    {candidate.title && (
                      <Tag color="blue" style={{ margin: 0 }}>
                        {candidate.title}
                      </Tag>
                    )}
                    {showExperience && (
                      <Text
                        type="secondary"
                        style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                      >
                        {experience} exp
                      </Text>
                    )}

                    {candidate.similarityScore && (
                      <Tag
                        icon={<StarOutlined />}
                        color="green"
                        style={{
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        Match Score:{" "}
                        {(candidate.similarityScore * 100).toFixed(0)}%
                      </Tag>
                    )}

                    {candidate.candidateType && (
                      <Tag color="blue" style={{ margin: 0 }}>
                        Candidate Type : {candidate.candidateType || "GENERAL"}
                      </Tag>
                    )}
                  </div>
                </div>

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
                    <BankOutlined style={{ color: "#666", fontSize: "14px" }} />
                    <Text
                      style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                      ellipsis
                    >
                      Current Company :{" "}
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
                    <Text style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}>
                      Current Location : {candidate.location || "Not specified"}
                    </Text>
                  </Space>

                  <Divider
                    type="vertical"
                    style={{ margin: 0, height: "auto" }}
                  />

                  <div>
                    {getCandidateStatusTag(
                      candidate.status,
                      candidate.isApplied
                    )}
                  </div>
                </div>

                {/* Second row with salary and nationality */}
                <div
                  style={{
                    marginBottom: "clamp(8px, 1.5vw, 12px)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 12px",
                    alignItems: "center",
                  }}
                >
                  {formatSalary(candidate.currentSalary) && (
                    <>
                      <Space size={4}>
                        <DollarOutlined
                          style={{ color: "#666", fontSize: "14px" }}
                        />
                        <Text
                          style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                          type="secondary"
                        >
                          Current Salary:{" "}
                          {formatSalary(candidate.currentSalary)}
                        </Text>
                      </Space>

                      {candidate.nationality && (
                        <Divider
                          type="vertical"
                          style={{ margin: 0, height: "auto" }}
                        />
                      )}
                    </>
                  )}

                  {candidate.nationality && (
                    <Space size={4}>
                      <GlobalOutlined
                        style={{ color: "#666", fontSize: "14px" }}
                      />
                      <Text style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}>
                        Nationality : {candidate.nationality}
                      </Text>
                    </Space>
                  )}
                </div>

                {showSkills && candidate.skills?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px 8px",
                      alignItems: "center",
                    }}
                  >
                    <ToolOutlined style={{ color: "#666", fontSize: "14px" }} />
                    <Text
                      type="secondary"
                      style={{ fontSize: "clamp(13px, 1.5vw, 14px)" }}
                    >
                      Key Skills:
                    </Text>
                    {candidate.skills
                      .slice(0, maxSkills)
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
                    {candidate.skills.length > maxSkills && (
                      <Tag
                        style={{
                          margin: 0,
                          fontSize: "clamp(12px, 1.3vw, 13px)",
                        }}
                      >
                        +{candidate.skills.length - maxSkills} more
                      </Tag>
                    )}
                  </div>
                )}
              </Col>
              <Col
                xs={24}
                md={6}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
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
                    maxWidth: "150px",
                    fontSize: "clamp(13px, 1.5vw, 14px)",
                    padding: "6px 12px",
                  }}
                  icon={<EyeOutlined />}
                  onClick={handleViewProfile}
                >
                  View Profile
                </Button>

                <Button
                  type="primary"
                  style={{
                    backgroundColor: "#da2c46",
                    width: "100%",
                    maxWidth: "150px",
                    fontSize: "clamp(13px, 1.5vw, 14px)",
                    padding: "6px 12px",
                  }}
                  icon={<ClockCircleOutlined />}
                  onClick={handleViewTimeline}
                >
                  View Timeline
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {renderTimelineModal()}
    </div>
  );
};

export default CandidateCard;
