// CandidateDocumentsTab.jsx
import React from "react";
import { Card, List, Empty, Button } from "antd";
import { FileTextOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const CandidateDocumentsTab = ({ candidate }) => {
  if (!candidate) return null;

  return (
    <>
      {candidate.certificates && candidate.certificates.length > 0 ? (
        <Card style={{ marginBottom: 24, borderRadius: "12px" }}>
          <List
            dataSource={candidate.certificates}
            renderItem={(cert) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Text strong>
                      {cert.documentName || cert.fileName}
                    </Text>
                  }
                  description={
                    <div>
                      <Text type="secondary">
                        Uploaded on:{" "}
                        {dayjs(cert.uploadedAt).format("MMM DD, YYYY")}
                      </Text>
                      <br />
                      <Button
                        type="link"
                        href={cert.fileUrl}
                        target="_blank"
                        icon={<FilePdfOutlined />}
                      >
                        View Document
                      </Button>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ) : (
        <Empty description="No documents available" />
      )}
    </>
  );
};

export default CandidateDocumentsTab;

