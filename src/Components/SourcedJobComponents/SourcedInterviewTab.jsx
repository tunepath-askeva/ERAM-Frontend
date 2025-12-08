import React from "react";
import { Card, Typography, Descriptions, Tag } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SourcedInterviewTab = ({ sourcedJob }) => {
  if (!sourcedJob.interviewDetails || sourcedJob.interviewDetails.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <ClockCircleOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <Title level={4} style={{ marginTop: "16px", color: "#999" }}>
            No interview scheduled yet
          </Title>
          <Text type="secondary">
            Interview details will appear here once scheduled.
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Title level={4} style={{ marginBottom: "24px" }}>
        Interview Details
      </Title>

      {sourcedJob.interviewDetails.map((interview, index) => {
        const interviewDate = new Date(interview.date);

        return (
          <Card key={interview._id || index} style={{ marginBottom: "16px" }}>
            <Descriptions
              bordered
              column={1}
              labelStyle={{ fontWeight: "600", width: "200px" }}
            >
              <Descriptions.Item label="Title">
                {interview.title || "N/A"}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag
                  color={
                    interview.status === "scheduled"
                      ? "blue"
                      : interview.status === "completed"
                      ? "green"
                      : interview.status === "cancelled"
                      ? "red"
                      : "orange"
                  }
                >
                  {interview.status?.toUpperCase() || "PENDING"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Date">
                {interviewDate.toLocaleDateString()}
              </Descriptions.Item>

              <Descriptions.Item label="Time">
                {interviewDate.toLocaleTimeString()}
              </Descriptions.Item>

              <Descriptions.Item label="Mode">
                <Tag
                  color={
                    interview.mode === "online"
                      ? "blue"
                      : interview.mode === "telephonic"
                      ? "orange"
                      : "green"
                  }
                >
                  {interview.mode?.toUpperCase() || "NOT SPECIFIED"}
                </Tag>
              </Descriptions.Item>

              {interview.mode === "online" && interview.meetingLink && (
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

              {interview.mode === "in-person" && interview.location && (
                <Descriptions.Item label="Location">
                  {interview.location}
                </Descriptions.Item>
              )}

              {interview.mode === "telephonic" && (
                <Descriptions.Item label="Contact Method">
                  Candidate will receive a phone call from the interviewer
                </Descriptions.Item>
              )}

              {interview.notes && (
                <Descriptions.Item label="Notes">
                  <Text>{interview.notes}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        );
      })}
    </>
  );
};

export default SourcedInterviewTab;