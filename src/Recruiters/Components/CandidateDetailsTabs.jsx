import React from "react";
import {
  Tabs,
  Badge,
  Button,
  Collapse,
  Descriptions,
  Tag,
  Space,
  List,
  Avatar,
  Empty,
  Typography,
  Tooltip,
  Card,
  Alert,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  SettingOutlined,
  FileOutlined,
  UserOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";

const { TabPane } = Tabs;
const { Title ,   Text} = Typography;
const { Panel } = Collapse;

const CandidateDetailsTabs = ({
  candidate,
  selectedCandidate,
  hasPermission,
  allRecruiters,
  isChangingStatus,
  handleChangeInterviewStatus,
  handleRescheduleInterview,
  setScheduleInterviewModalVisible,
  interviewForm,
  canMoveToOffer,
  handleMoveToOffer,
  handleRejectCandidate,
  setOfferAction,
  setOfferModalVisible,
  offerForm,
  setAcceptOfferModalVisible,
  acceptOfferForm,
  pipelineAlert,
  setPipelineAlert,
  activePipelines,
  handleChangePipeline,
  handleTagPipelineClick,
  handleMoveToSeparatePipeline,
  handleMoveCandidateToPipeline,
  levelGroups,
  staffs,
}) => {
  return (
    <Tabs defaultActiveKey="1">
      {hasPermission("view-interviews") && (
        <TabPane
          tab={
            <span>
              Interviews{" "}
              <Badge count={candidate.interviewDetails?.length || 0} />
            </span>
          }
          key="1"
        >
          {candidate.status === "interview" && (
            <div style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                style={{ background: "#da2c46" }}
                onClick={() => {
                  interviewForm.resetFields();
                  setScheduleInterviewModalVisible(true);
                }}
                icon={<PlusOutlined />}
              >
                Schedule New Interview
              </Button>
            </div>
          )}
          {candidate.interviewDetails?.length > 0 ? (
            <Collapse accordion>
              {candidate.interviewDetails.map((interview) => (
                <Panel
                  header={`${interview.title} (${interview.status})`}
                  key={interview._id}
                  extra={
                    <Space>
                      <Tag
                        color={
                          interview.status === "scheduled"
                            ? "blue"
                            : interview.status === "interview_completed"
                            ? "green"
                            : interview.status === "interview_hold"
                            ? "orange"
                            : "red"
                        }
                      >
                        {interview.status}
                      </Tag>
                      <Button
                        size="small"
                        disabled={
                          interview.status !== "scheduled" &&
                          interview.status !== "interview_hold"
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRescheduleInterview(interview);
                        }}
                      >
                        Reschedule
                      </Button>
                    </Space>
                  }
                >
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="Date & Time">
                      {new Date(interview.date).toLocaleString()}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mode">
                      {interview.mode === "online" ? "Online" : "In-Person"}
                    </Descriptions.Item>
                    {interview.mode === "online" && (
                      <Descriptions.Item label="Meeting Link">
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Join Meeting
                        </a>
                      </Descriptions.Item>
                    )}
                    <Descriptions.Item label="Interviewers">
                      {allRecruiters ? (
                        <List
                          size="small"
                          dataSource={interview?.interviewerIds?.map(
                            (id) =>
                              allRecruiters.otherRecruiters.find(
                                (r) => r._id === id
                              )
                          )}
                          renderItem={(recruiter) => (
                            <List.Item>
                              <List.Item.Meta
                                avatar={
                                  <Avatar
                                    src={recruiter?.image}
                                    size="small"
                                  />
                                }
                                title={recruiter?.fullName || "Unknown"}
                                description={recruiter?.specialization}
                              />
                            </List.Item>
                          )}
                        />
                      ) : (
                        <Text>Loading interviewers...</Text>
                      )}
                    </Descriptions.Item>
                    {interview.notes && (
                      <Descriptions.Item label="Notes">
                        {interview.notes}
                      </Descriptions.Item>
                    )}
                    {interview.remarks && (
                      <Descriptions.Item label="Remarks">
                        {interview.remarks}
                      </Descriptions.Item>
                    )}
                  </Descriptions>

                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    {interview.status === "scheduled" && (
                      <Button
                        danger
                        onClick={() =>
                          handleChangeInterviewStatus(
                            "interview_cancelled",
                            interview._id
                          )
                        }
                        loading={isChangingStatus}
                      >
                        Cancel
                      </Button>
                    )}

                    {interview.status === "pass" && (
                      <Button
                        type="primary"
                        style={{ background: "#da2c46" }}
                        onClick={() =>
                          handleChangeInterviewStatus(
                            "interview_completed",
                            interview._id
                          )
                        }
                        loading={isChangingStatus}
                      >
                        Mark as Completed
                      </Button>
                    )}

                    {interview.status === "fail" && (
                      <Button
                        danger
                        onClick={() =>
                          handleChangeInterviewStatus(
                            "interview_rejected",
                            interview._id
                          )
                        }
                        loading={isChangingStatus}
                      >
                        Reject
                      </Button>
                    )}

                    {interview.status === "interview_hold" && (
                      <Tag color="orange">
                        Waiting for interviewer's final decision
                      </Tag>
                    )}
                  </div>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <Empty
              description={
                selectedCandidate.status === "interview"
                  ? "No interviews scheduled yet"
                  : "No interviews were scheduled for this candidate"
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              {selectedCandidate.status === "interview" && (
                <Button
                  type="primary"
                  onClick={() => setScheduleInterviewModalVisible(true)}
                >
                  Schedule Interview
                </Button>
              )}
            </Empty>
          )}
        </TabPane>
      )}

      {hasPermission("view-offer-details") &&
        (candidate.status === "offer_pending" ||
          candidate.status === "offer_revised" ||
          candidate.status === "offer") && (
          <TabPane tab="Offer Details" key="offer">
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Status">
                <Tag
                  color={
                    candidate.status === "offer_pending"
                      ? "orange"
                      : candidate.status === "offer"
                      ? "green"
                      : candidate.status === "offer_revised"
                      ? "blue"
                      : "default"
                  }
                >
                  {candidate.status}
                </Tag>
              </Descriptions.Item>

              {candidate.offerDetails?.[0]?.currentStatus && (
                <Descriptions.Item label="Candidate Response">
                  <Tag
                    color={
                      candidate.offerDetails[0].currentStatus ===
                      "offer-accepted"
                        ? "green"
                        : candidate.offerDetails[0].currentStatus ===
                          "offer-rejected"
                        ? "red"
                        : candidate.offerDetails[0].currentStatus ===
                          "offer-revised"
                        ? "blue"
                        : "default"
                    }
                  >
                    {candidate.offerDetails[0].currentStatus}
                  </Tag>
                </Descriptions.Item>
              )}

              <Descriptions.Item label="Description">
                {candidate.offerDetails?.[0]?.description || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Offer Letter">
                {candidate.offerDetails?.[0]?.offerDocument?.fileUrl ? (
                  <a
                    href={candidate?.offerDetails[0]?.offerDocument?.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {candidate?.offerDetails[0]?.offerDocument?.fileName ||
                      "Download Offer Letter"}
                  </a>
                ) : (
                  "No file uploaded"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Signed Offer Letter">
                {candidate.offerDetails?.[0]?.signedOfferDocument?.fileUrl ? (
                  <a
                    href={
                      candidate?.offerDetails[0]?.signedOfferDocument?.fileUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {candidate?.offerDetails[0]?.signedOfferDocument
                      ?.fileName || "Download Signed Offer Letter"}
                  </a>
                ) : (
                  "No file uploaded"
                )}
              </Descriptions.Item>

              {candidate.offerDetails?.[0]?.additionalDocuments &&
                candidate.offerDetails[0].additionalDocuments.length > 0 && (
                  <Descriptions.Item label="Additional Documents">
                    <Space direction="vertical" size="small">
                      {candidate.offerDetails[0].additionalDocuments.map(
                        (doc, index) => (
                          <a
                            key={index}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {doc.documentName ||
                              doc.fileName ||
                              `Additional Document ${index + 1}`}
                          </a>
                        )
                      )}
                    </Space>
                  </Descriptions.Item>
                )}

              {candidate.offerDetails?.[0]?.signedAdditionalDocuments &&
                candidate.offerDetails[0].signedAdditionalDocuments.length >
                  0 && (
                  <Descriptions.Item label="Signed Additional Documents">
                    <Space direction="vertical" size="small">
                      {candidate.offerDetails[0].signedAdditionalDocuments.map(
                        (doc, index) => (
                          <a
                            key={index}
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {doc.documentName ||
                              doc.fileName ||
                              `Signed Document ${index + 1}`}
                          </a>
                        )
                      )}
                    </Space>
                  </Descriptions.Item>
                )}

              {candidate.offerDetails?.[0]?.statusHistory?.length > 0 && (
                <Descriptions.Item label="Status History">
                  <Collapse>
                    {candidate.offerDetails[0].statusHistory.map(
                      (history, index) => (
                        <Panel
                          header={`${history.status} - ${new Date(
                            history.changedAt
                          ).toLocaleString()}`}
                          key={index}
                        >
                          <Text strong>Status: </Text>
                          <Tag
                            color={
                              history.status === "offer-accepted"
                                ? "green"
                                : history.status === "offer-rejected"
                                ? "red"
                                : history.status === "offer-revised"
                                ? "blue"
                                : "default"
                            }
                          >
                            {history.status}
                          </Tag>
                          <br />
                          <Text strong>Description: </Text>
                          <Text>{history.description}</Text>
                          <br />
                          <Text strong>Changed at: </Text>
                          <Text>
                            {new Date(history.changedAt).toLocaleString()}
                          </Text>
                        </Panel>
                      )
                    )}
                  </Collapse>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              {(candidate.status === "offer_pending" ||
                candidate.status === "offer_revised") && (
                <>
                  <Button
                    onClick={() => {
                      setOfferAction("revise");
                      setOfferModalVisible(true);
                      offerForm.setFieldsValue({
                        description:
                          candidate.offerDetails?.[0]?.description,
                      });
                    }}
                    style={{ marginRight: 8 }}
                  >
                    Revise Offer
                  </Button>

                  {/* Only show "Accept Offer on Behalf" button if offer is not already accepted */}
                  {candidate.offerDetails?.[0]?.currentStatus !== "offer-accepted" && (
                    <Button
                      type="primary"
                      style={{
                        marginRight: 8,
                        background: "#52c41a",
                        borderColor: "#52c41a",
                      }}
                      onClick={() => {
                        setAcceptOfferModalVisible(true);
                        acceptOfferForm.resetFields();
                      }}
                    >
                      Accept Offer on Behalf
                    </Button>
                  )}

                  <Tooltip
                    title={
                      !canMoveToOffer(candidate).canMove
                        ? `Cannot move to offer: ${canMoveToOffer(candidate).reason} Please wait for the candidate to upload the signed offer document or accept on behalf.`
                        : ""
                    }
                  >
                    <Button
                      type="primary"
                      style={{ marginRight: 8 }}
                      onClick={() => handleMoveToOffer(candidate)}
                      disabled={!canMoveToOffer(candidate).canMove}
                    >
                      Move to Offer
                    </Button>
                  </Tooltip>

                  <Button
                    danger
                    onClick={() => handleRejectCandidate(candidate)}
                  >
                    Reject
                  </Button>
                </>
              )}

              {candidate.status === "offer" && <></>}
            </div>
          </TabPane>
        )}

      {hasPermission("view-pipeline") &&
        selectedCandidate.status === "offer" && (
          <TabPane tab="Pipeline" key="2">
            <div style={{ padding: 16 }}>
              <Title level={4}>Pipeline Information</Title>

              {pipelineAlert && (
                <Alert
                  type={pipelineAlert.type}
                  message={pipelineAlert.message}
                  showIcon
                  closable
                  onClose={() => setPipelineAlert(null)}
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* Pipeline Details */}
              <div style={{ marginBottom: 16 }}>
                <Card
                  size="small"
                  style={{
                    marginTop: 8,
                    background: "#f9f9f9",
                    border: "1px dashed #52c41a",
                    borderRadius: 8,
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <SettingOutlined />
                      <Text strong>Tagged Pipeline (Separate)</Text>
                    </div>
                  }
                >
                  {selectedCandidate?.tagPipeline ? (
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <Text strong>Pipeline Name:</Text>
                          <br />
                          <Text>
                            {selectedCandidate.tagPipeline.name || "Loading..."}
                          </Text>
                        </div>
                        <Button
                          type="default"
                          size="small"
                          onClick={handleChangePipeline}
                        >
                          Change Pipeline
                        </Button>
                      </div>
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() =>
                          handleTagPipelineClick(selectedCandidate.tagPipeline)
                        }
                      >
                        Configure Pipeline Details
                      </Button>
                    </Space>
                  ) : (
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <Text type="secondary">
                        No separate pipeline tagged.
                      </Text>
                    </Space>
                  )}
                </Card>
              </div>

              {selectedCandidate.tagPipeline?.stages && (
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>Pipeline Stages</Title>
                  <List
                    dataSource={selectedCandidate.tagPipeline.stages || []}
                    renderItem={(stage, index) => (
                      <List.Item>
                        <List.Item.Meta
                          title={`${index + 1}. ${stage.name}`}
                          description={
                            <>
                              {stage.description && (
                                <div>{stage.description}</div>
                              )}
                              {stage.requiredDocuments?.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                  <Text strong>Required Documents: </Text>
                                  {stage.requiredDocuments.map((doc, docIndex) => (
                                    <Tag key={docIndex} size="small">
                                      {doc}
                                    </Tag>
                                  ))}
                                </div>
                              )}
                              <div style={{ marginTop: 4 }}>
                                <Text type="secondary">
                                  Dependency: {stage.dependencyType}
                                </Text>
                              </div>
                            </>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </div>
              )}

              <Card
                size="small"
                style={{
                  marginTop: 16,
                  background: "#f0f5ff",
                  border: "1px solid #1890ff",
                  borderRadius: 8,
                }}
                title={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <FileOutlined />
                    <Text strong>Work Order Pipeline</Text>
                  </div>
                }
              >
                {(() => {
                  const pipelineId =
                    candidate?.workOrder?.pipelineStageTimeline?.[0]?.pipelineId;

                  const workOrderPipeline = activePipelines?.find(
                    (p) => p._id === pipelineId
                  );

                  return workOrderPipeline?.stages?.length > 0 ? (
                    <>
                      {candidate?.workOrder?.pipelineStageTimeline?.length >
                        0 && (
                        <>
                          <Title level={5}>Stage Timeline Details</Title>
                          <List
                            dataSource={
                              candidate.workOrder.pipelineStageTimeline
                            }
                            renderItem={(timelineStage, index) => {
                              const fullStageDetails =
                                workOrderPipeline.stages.find(
                                  (s) => s._id === timelineStage.stageId
                                );

                              return (
                                <List.Item key={timelineStage._id}>
                                  <Card
                                    size="small"
                                    style={{
                                      width: "100%",
                                      marginBottom: 8,
                                    }}
                                    title={
                                      <Space>
                                        <Text strong>{`${
                                          index + 1
                                        }. ${timelineStage.stageName}`}</Text>
                                        <Tag color="blue">
                                          {timelineStage.dependencyType}
                                        </Tag>
                                      </Space>
                                    }
                                  >
                                    <Descriptions
                                      bordered
                                      column={1}
                                      size="small"
                                    >
                                      <Descriptions.Item label="Start Date">
                                        {timelineStage.startDate
                                          ? new Date(
                                              timelineStage.startDate
                                            ).toLocaleDateString()
                                          : "Not set"}
                                      </Descriptions.Item>
                                      <Descriptions.Item label="End Date">
                                        {timelineStage.endDate
                                          ? new Date(
                                              timelineStage.endDate
                                            ).toLocaleDateString()
                                          : "Not set"}
                                      </Descriptions.Item>

                                      {timelineStage.recruiterIds?.length >
                                        0 && (
                                        <Descriptions.Item label="Assigned Recruiters">
                                          <Space wrap>
                                            {timelineStage.recruiterIds.map(
                                              (recruiterId) => {
                                                const recruiter =
                                                  allRecruiters?.otherRecruiters?.find(
                                                    (r) =>
                                                      r._id === recruiterId
                                                  );
                                                return recruiter ? (
                                                  <Tag
                                                    key={recruiterId}
                                                    icon={<UserOutlined />}
                                                  >
                                                    {recruiter.fullName ||
                                                      recruiter.email}
                                                  </Tag>
                                                ) : null;
                                              }
                                            )}
                                          </Space>
                                        </Descriptions.Item>
                                      )}

                                      {timelineStage.staffIds?.length > 0 && (
                                        <Descriptions.Item label="Assigned Staff">
                                          <Space wrap>
                                            {timelineStage.staffIds.map(
                                              (staffId) => {
                                                const staff = staffs?.find(
                                                  (s) => s._id === staffId
                                                );
                                                return staff ? (
                                                  <Tag
                                                    key={staffId}
                                                    icon={<UserOutlined />}
                                                  >
                                                    {staff.fullName ||
                                                      staff.email}
                                                  </Tag>
                                                ) : null;
                                              }
                                            )}
                                          </Space>
                                        </Descriptions.Item>
                                      )}

                                      {timelineStage.approvalId && (
                                        <Descriptions.Item label="Approval Level">
                                          {(() => {
                                            const level = levelGroups?.find(
                                              (l) =>
                                                l._id === timelineStage.approvalId
                                            );
                                            return level ? (
                                              <Tag color="purple">
                                                {level.groupName}
                                              </Tag>
                                            ) : (
                                              "Unknown Level"
                                            );
                                          })()}
                                        </Descriptions.Item>
                                      )}

                                      {fullStageDetails?.requiredDocuments
                                        ?.length > 0 && (
                                        <Descriptions.Item label="Required Documents">
                                          <Space wrap>
                                            {fullStageDetails.requiredDocuments.map(
                                              (doc, docIndex) => (
                                                <Tag
                                                  key={docIndex}
                                                  icon={<FileOutlined />}
                                                  color="orange"
                                                >
                                                  {typeof doc === "string"
                                                    ? doc
                                                    : doc.title || doc}
                                                </Tag>
                                              )
                                            )}
                                          </Space>
                                        </Descriptions.Item>
                                      )}

                                      {timelineStage.customFields?.length > 0 && (
                                        <Descriptions.Item label="Custom Fields">
                                          <Space
                                            direction="vertical"
                                            style={{
                                              width: "100%",
                                            }}
                                          >
                                            {timelineStage.customFields.map(
                                              (field, fieldIndex) => (
                                                <div key={fieldIndex}>
                                                  <Text strong>
                                                    {field.label}:{" "}
                                                  </Text>
                                                  <Text type="secondary">
                                                    {field.type}
                                                    {field.required && (
                                                      <Tag
                                                        color="red"
                                                        size="small"
                                                        style={{
                                                          marginLeft: 8,
                                                        }}
                                                      >
                                                        Required
                                                      </Tag>
                                                    )}
                                                  </Text>
                                                </div>
                                              )
                                            )}
                                          </Space>
                                        </Descriptions.Item>
                                      )}
                                    </Descriptions>
                                  </Card>
                                </List.Item>
                              );
                            }}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <Empty
                      description="No pipeline stages configured"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  );
                })()}
              </Card>

              <Divider />

              <Title level={5}>Move to Pipeline</Title>
              <Text
                type="secondary"
                style={{ marginBottom: 16, display: "block" }}
              >
                Move this candidate to the pipeline stage to complete all
                required stages before converting to employee.
              </Text>

              {/* Pipeline Action Buttons */}
              <Space>
                {selectedCandidate?.tagPipeline ? (
                  <>
                    <Button
                      type="primary"
                      style={{ background: "#da2c46" }}
                      icon={<ArrowRightOutlined />}
                      onClick={handleMoveToSeparatePipeline}
                    >
                      Move to Tagged Pipeline
                    </Button>
                    <Button
                      type="primary"
                      style={{ background: "#da2c46" }}
                      icon={<ArrowRightOutlined />}
                      onClick={() =>
                        handleMoveCandidateToPipeline(selectedCandidate)
                      }
                    >
                      Move to Work Order Pipeline
                    </Button>
                  </>
                ) : (
                  <Button
                    type="primary"
                    style={{ background: "#da2c46" }}
                    icon={<ArrowRightOutlined />}
                    onClick={() =>
                      handleMoveCandidateToPipeline(selectedCandidate)
                    }
                  >
                    Move to Work Order Pipeline
                  </Button>
                )}
              </Space>
            </div>
          </TabPane>
        )}
    </Tabs>
  );
};

export default CandidateDetailsTabs;

