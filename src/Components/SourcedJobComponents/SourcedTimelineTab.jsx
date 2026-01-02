import React from "react";
import { Card, Typography, Timeline, Badge, Tag, Space } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SourcedTimelineTab = ({ sourcedJob }) => {
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "hired":
      case "approved":
      case "completed":
        return { icon: <CheckCircleOutlined />, color: "green" };
      case "pipeline":
        return { icon: <ClockCircleOutlined />, color: "blue" };
      case "shortlisted":
        return { icon: <CheckCircleOutlined />, color: "cyan" };
      case "interview":
        return { icon: <ClockCircleOutlined />, color: "purple" };
      case "rejected":
        return { icon: <ExclamationCircleOutlined />, color: "red" };
      case "withdrawn":
        return { icon: <ExclamationCircleOutlined />, color: "orange" };
      case "pending":
        return { icon: <ClockCircleOutlined />, color: "orange" };
      default:
        return { icon: <ClockCircleOutlined />, color: "blue" };
    }
  };

  // Get stage progress from sourcedJob
  const stageProgress = sourcedJob?.stageProgress || [];

  return (
    <Card>
      <Title level={4} style={{ marginBottom: "24px" }}>
        Application Progress Timeline
      </Title>

      <Timeline>
        {/* Application Submitted */}
        <Timeline.Item
          dot={<CheckCircleOutlined style={{ color: "green" }} />}
          color="green"
        >
          <div>
            <Text strong>Application Submitted</Text>
            <br />
            <Text type="secondary">
              {sourcedJob?.createdAt
                ? new Date(sourcedJob.createdAt).toLocaleString()
                : "Date not available"}
            </Text>
          </div>
        </Timeline.Item>

        {/* Stage Progress Items */}
        {stageProgress.map((stage, index) => {
          // Determine stage status - use stageStatus or check if approved
          const stageStatus = stage.stageStatus || "pending";
          const statusInfo = getStatusInfo(stageStatus);

          return (
            <Timeline.Item
              key={stage._id || index}
              dot={React.cloneElement(statusInfo.icon, {
                style: { color: statusInfo.color },
              })}
              color={statusInfo.color}
            >
              <div>
                <Text strong>
                  {stage.stageName || stage.name || `Stage ${index + 1}`}
                </Text>
                <br />
                <Badge
                  color={statusInfo.color}
                  text={stageStatus?.toUpperCase() || "PENDING"}
                />
                <br />

                {/* Recruiter Reviews */}
                {stage.recruiterReviews?.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary">Reviewer Status:</Text>
                    {stage.recruiterReviews.map((review, reviewIndex) => (
                      <div
                        key={review._id || reviewIndex}
                        style={{ marginLeft: "16px", marginTop: "4px" }}
                      >
                        <Tag
                          color={
                            review.status === "approved"
                              ? "green"
                              : review.status === "pending"
                              ? "orange"
                              : "red"
                          }
                        >
                          {review.status?.toUpperCase()}
                        </Tag>
                        <Text type="secondary">
                          {" "}
                          - {review.recruiterId?.fullName || "Recruiter"}
                        </Text>
                        {review.reviewComments && (
                          <Text type="secondary">
                            : {review.reviewComments}
                          </Text>
                        )}
                        {review.reviewedAt && (
                          <div style={{ marginTop: "4px" }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Reviewed:{" "}
                              {new Date(review.reviewedAt).toLocaleString()}
                            </Text>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Documents Information */}
                <div style={{ marginTop: "8px" }}>
                  <Text type="secondary">
                    Documents uploaded:{" "}
                    {(stage.uploadedDocuments?.length || 0) +
                      (stage.additionalStageDocuments?.length || 0)}
                  </Text>
                  {stage.requiredDocuments?.length > 0 && (
                    <div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Required: {stage.requiredDocuments.join(", ")}
                      </Text>
                    </div>
                  )}
                </div>

                {/* Stage Dates */}
                {stage.stageCompletedAt ? (
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">
                      Completed:{" "}
                      {new Date(stage.stageCompletedAt).toLocaleString()}
                    </Text>
                  </div>
                ) : stage.startDate ? (
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">
                      Started: {new Date(stage.startDate).toLocaleDateString()}
                    </Text>
                  </div>
                ) : null}

                {/* Stage Description */}
                {stage.description && (
                  <div style={{ marginTop: "8px" }}>
                    <Text
                      type="secondary"
                      style={{ fontSize: "12px", fontStyle: "italic" }}
                    >
                      {stage.description}
                    </Text>
                  </div>
                )}
              </div>
            </Timeline.Item>
          );
        })}

        {sourcedJob?.offerDetails?.length > 0 &&
          sourcedJob.offerDetails.map((offer, offerIndex) => (
            <Timeline.Item
              key={`offer-${offerIndex}`}
              dot={
                offer.currentStatus === "offer-accepted" ? (
                  <CheckCircleOutlined style={{ color: "green" }} />
                ) : (
                  <ClockCircleOutlined style={{ color: "orange" }} />
                )
              }
              color={
                offer.currentStatus === "offer-accepted" ? "green" : "orange"
              }
            >
              <div>
                <Text strong>Offer Letter</Text>
                <br />
                <Badge
                  color={
                    offer.currentStatus === "offer-accepted"
                      ? "green"
                      : "orange"
                  }
                  text={
                    offer.currentStatus?.toUpperCase().replace("-", " ") ||
                    "PENDING"
                  }
                />
                <br />
                {offer.description && (
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    {offer.description}
                  </Text>
                )}
                {offer.offerDocument?.uploadedAt && (
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Sent:{" "}
                      {new Date(
                        offer.offerDocument.uploadedAt
                      ).toLocaleString()}
                    </Text>
                  </div>
                )}
                {offer.signedOfferDocument?.uploadedAt && (
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Signed:{" "}
                      {new Date(
                        offer.signedOfferDocument.uploadedAt
                      ).toLocaleString()}
                    </Text>
                  </div>
                )}
                {offer.additionalDocuments && offer.additionalDocuments.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                      Additional Documents ({offer.additionalDocuments.length}):
                    </Text>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      {offer.additionalDocuments.map((doc, docIndex) => (
                        <a
                          key={docIndex}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: "12px" }}
                        >
                          <FileTextOutlined style={{ marginRight: "4px" }} />
                          {doc.documentName || doc.fileName || `Document ${docIndex + 1}`}
                        </a>
                      ))}
                    </Space>
                  </div>
                )}
                {offer.signedAdditionalDocuments && offer.signedAdditionalDocuments.length > 0 && (
                  <div style={{ marginTop: "8px" }}>
                    <Text type="secondary" style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                      Signed Additional Documents ({offer.signedAdditionalDocuments.length}):
                    </Text>
                    <Space direction="vertical" size="small" style={{ width: "100%" }}>
                      {offer.signedAdditionalDocuments.map((doc, docIndex) => (
                        <a
                          key={docIndex}
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: "12px", color: "#52c41a" }}
                        >
                          <CheckCircleOutlined style={{ marginRight: "4px" }} />
                          {doc.documentName || doc.fileName || `Signed Document ${docIndex + 1}`}
                        </a>
                      ))}
                    </Space>
                  </div>
                )}
              </div>
            </Timeline.Item>
          ))}

        {/* Current Status */}
        {sourcedJob?.status && (
          <Timeline.Item
            dot={React.cloneElement(getStatusInfo(sourcedJob.status).icon, {
              style: { color: getStatusInfo(sourcedJob.status).color },
            })}
            color={getStatusInfo(sourcedJob.status).color}
          >
            <div>
              <Text strong>Current Status</Text>
              <br />
              <Badge
                color={getStatusInfo(sourcedJob.status).color}
                text={
                  sourcedJob.status?.replace("_", " ").toUpperCase() ||
                  "PENDING"
                }
              />
              {sourcedJob.updatedAt && (
                <div style={{ marginTop: "4px" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Last Updated:{" "}
                    {new Date(sourcedJob.updatedAt).toLocaleString()}
                  </Text>
                </div>
              )}
            </div>
          </Timeline.Item>
        )}

        {/* Status History Section */}
        {sourcedJob?.statusHistory?.length > 0 && (
          <Timeline.Item color="gray">
            <div>
              <Text strong>Status History</Text>
              <div style={{ marginTop: "8px" }}>
                {sourcedJob.statusHistory.map((history, index) => (
                  <div key={index} style={{ marginBottom: "8px" }}>
                    <Tag color={getStatusInfo(history.status).color}>
                      {history.status?.toUpperCase()}
                    </Tag>
                    <Text type="secondary" style={{ marginLeft: "8px" }}>
                      by {history.changedBy?.name || "System"}
                    </Text>
                    <div style={{ marginLeft: "8px" }}>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {new Date(history.changedAt).toLocaleString()}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Timeline.Item>
        )}
      </Timeline>
    </Card>
  );
};

export default SourcedTimelineTab;
