import React from "react";
import { Card, Typography, Timeline, Badge, Tag } from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const SourcedTimelineTab = ({ sourcedJob, stageProgress }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case "hired":
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
      case "completed":
        return { icon: <CheckCircleOutlined />, color: "green" };
      case "pending":
        return { icon: <ClockCircleOutlined />, color: "orange" };
      default:
        return { icon: <ClockCircleOutlined />, color: "blue" };
    }
  };

  return (
    <Card>
      <Title level={4} style={{ marginBottom: "24px" }}>
        Application Progress Timeline
      </Title>

      <Timeline>
        <Timeline.Item
          dot={<CheckCircleOutlined style={{ color: "green" }} />}
          color="green"
        >
          <div>
            <Text strong>Application Submitted</Text>
            <br />
            <Text type="secondary">
              {new Date(sourcedJob.createdAt).toLocaleString()}
            </Text>
          </div>
        </Timeline.Item>

        {stageProgress?.map((stage, index) => {
          const statusInfo = getStatusInfo(stage.stageStatus);
          return (
            <Timeline.Item
              key={stage._id || index}
              dot={React.cloneElement(statusInfo.icon, {
                style: { color: statusInfo.color },
              })}
              color={statusInfo.color}
            >
              <div>
                <Text strong>{stage.stageName}</Text>
                <br />
                <Badge
                  color={statusInfo.color}
                  text={stage.stageStatus?.toUpperCase() || "PENDING"}
                />
                <br />

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
                        {review.reviewComments && (
                          <Text type="secondary"> - {review.reviewComments}</Text>
                        )}
                        {review.reviewedAt && (
                          <div style={{ marginTop: "4px" }}>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Reviewed: {new Date(review.reviewedAt).toLocaleString()}
                            </Text>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: "8px" }}>
                  <Text type="secondary">
                    Documents uploaded: {stage.uploadedDocuments?.length || 0}
                  </Text>
                </div>

                {stage.stageCompletedAt && (
                  <div style={{ marginTop: "4px" }}>
                    <Text type="secondary">
                      Completed: {new Date(stage.stageCompletedAt).toLocaleString()}
                    </Text>
                  </div>
                )}
              </div>
            </Timeline.Item>
          );
        })}

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
              text={sourcedJob.status?.replace("_", " ").toUpperCase() || "PENDING"}
            />
          </div>
        </Timeline.Item>
      </Timeline>
    </Card>
  );
};

export default SourcedTimelineTab;