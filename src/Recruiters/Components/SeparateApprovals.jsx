import React, { useState } from "react";
import {
  Table,
  Badge,
  Button,
  Modal,
  Descriptions,
  Space,
  message,
  Tooltip,
  Avatar,
  Typography,
  Divider,
  Input,
  Grid,
  List,
  Drawer,
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  MoreOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const SeparateApprovals = ({
  separateApprovals = [],
  loading,
  onApprove,
  isApproving,
}) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [approvalComments, setApprovalComments] = useState("");
  console.log(selectedRecord,'selectedRecord-=-=')

  const screens = useBreakpoint();
  const isMobile = screens.xs;
  const isTablet = screens.sm || screens.md;
  const isDesktop = screens.lg || screens.xl;

  const getTableData = () => {
    const tableData = [];

    separateApprovals.forEach((workOrder) => {
      workOrder.pipelineStageTimeline.forEach((stage) => {
        if (stage.levelInfo && stage.levelInfo.candidateId) {
          const { levelInfo } = stage;

          const candidateDoc = stage.uploadedDocuments?.find(
            (doc) => doc.candidateId === levelInfo.candidateId
          );

          const documents = candidateDoc?.documents || [];

          tableData.push({
            key: `${workOrder.workOrderId}-${stage.stageId}-${levelInfo.candidateId}`,
            workOrderId: workOrder.workOrderId,
            workOrderTitle: workOrder.title,
            jobCode: workOrder.jobCode,
            candidateId: levelInfo.candidateId,
            candidateName: levelInfo.candidateName,
            candidateEmail: levelInfo.candidateEmail,
            stageName: stage.stageName,
            stageId: stage.stageId,
            approvalId: stage.approvalId,
            recruiterName: levelInfo.recruiter?.fullName || "N/A",
            recruiterEmail: levelInfo.recruiter?.email || "N/A",
            documentsCount: documents.length,
            documents: documents,
            uploadedAt: documents[0]?.uploadedAt,
            status: levelInfo.approverStatus || levelInfo.levelStatus || "pending",
            levelStatus: levelInfo.levelStatus,
            levelName: levelInfo.levelName,
            levelId: levelInfo.levelId,
            hasDocuments: documents.length > 0,
          });
        }
      });
    });

    return tableData;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileOutlined style={{ color: "#1890ff" }} />;
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImageOutlined style={{ color: "#52c41a" }} />;
      default:
        return <FileOutlined style={{ color: "#1890ff" }} />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      approved: "green",
      rejected: "red",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "pending",
      approved: "approved",
      rejected: "rejected",
    };
    return texts[status] || status;
  };

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setDetailsModalVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedRecord(record);
    setApproveModalVisible(true);
  };

  const handleApprovalSubmit = async () => {
    try {
      if (!selectedRecord) return;

      await onApprove({
        workOrderid: selectedRecord.workOrderId,
        userId: selectedRecord.candidateId,
        approvalId: selectedRecord.approvalId,
        levelId: selectedRecord.levelId,
        stageId: selectedRecord.stageId,
        status: "approved",
        comments: approvalComments,
      });

      message.success(`Documents approved for ${selectedRecord.candidateName}!`);
      setApproveModalVisible(false);
      setApprovalComments("");
      setSelectedRecord(null);
    } catch (error) {
      message.error(error.message || "Failed to approve documents");
    }
  };

  const handleDownloadDocument = (document) => {
    window.open(document.fileUrl, "_blank");
    message.info(`Opening ${document.fileName}...`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getActionsMenu = (record) => ({
    items: [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "View Details",
        onClick: () => handleViewDetails(record),
      },
    ],
  });

  const columns = [
    {
      title: "Candidate",
      dataIndex: "candidateName",
      key: "candidateName",
      width: isMobile ? 200 : isTablet ? 220 : 260,
      ellipsis: true,
      render: (text, record) => (
        <div style={{ minWidth: 0 }}>
          <Space size="small" style={{ width: "100%" }}>
            <Avatar
              size={isMobile ? "small" : "default"}
              icon={<UserOutlined />}
              style={{ flexShrink: 0 }}
            />
            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <Tooltip title={text}>
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {text}
                </div>
              </Tooltip>
              <Tooltip title={record.candidateEmail}>
                <Text
                  type="secondary"
                  style={{
                    fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    display: "block",
                  }}
                >
                  {record.candidateEmail}
                </Text>
              </Tooltip>
            </div>
          </Space>
        </div>
      ),
    },
    {
      title: "Work Order",
      dataIndex: "workOrderTitle",
      key: "workOrderTitle",
      width: isMobile ? 180 : isTablet ? 200 : 240,
      ellipsis: true,
      render: (text, record) => (
        <div style={{ minWidth: 0 }}>
          <Tooltip title={text}>
            <div
              style={{
                fontWeight: 500,
                fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </div>
          </Tooltip>
          <Text
            type="secondary"
            style={{
              fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
            }}
          >
            {record.jobCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Stage & Level",
      dataIndex: "stageName",
      key: "stageName",
      width: isMobile ? 140 : isTablet ? 160 : 200,
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Tooltip title={`Stage: ${text}`}>
            <Text
              strong
              style={{
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                display: "block",
              }}
            >
              Stage: {isMobile && text.length > 8 ? `${text.substring(0, 8)}...` : text}
            </Text>
          </Tooltip>
          <Tooltip title={`Level: ${record.levelName || "N/A"}`}>
            <Text
              strong
              style={{
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                display: "block",
              }}
            >
              Level: {isMobile && record.levelName?.length > 8 
                ? `${record.levelName.substring(0, 8)}...` 
                : record.levelName || "N/A"}
            </Text>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Recruiter",
      dataIndex: "recruiterName",
      key: "recruiterName",
      width: isMobile ? 150 : isTablet ? 160 : 200,
      ellipsis: true,
      render: (text, record) => (
        <div style={{ minWidth: 0 }}>
          <Tooltip title={text}>
            <div
              style={{
                fontWeight: 500,
                fontSize: isMobile ? "11px" : isTablet ? "12px" : "14px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text || "N/A"}
            </div>
          </Tooltip>
          {!isMobile && record.recruiterEmail && record.recruiterEmail !== "N/A" && (
            <Tooltip title={record.recruiterEmail}>
              <Text
                type="secondary"
                style={{
                  fontSize: isTablet ? "11px" : "12px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {record.recruiterEmail}
              </Text>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      title: "Docs",
      dataIndex: "documentsCount",
      key: "documentsCount",
      width: isMobile ? 80 : isTablet ? 90 : 100,
      align: "center",
      render: (count) => (
        <Tooltip title={`${count} document(s) uploaded`}>
          <Space size="small" direction={isMobile ? "vertical" : "horizontal"}>
            <FileTextOutlined style={{ fontSize: isMobile ? "14px" : "16px", color: "#1890ff" }} />
            <span style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: 500 }}>{count}</span>
          </Space>
        </Tooltip>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: isMobile ? 100 : isTablet ? 120 : 130,
      render: (status) => {
        const statusText = getStatusText(status);
        const statusColor = getStatusColor(status);
        return (
          <Space>
            <Badge status={statusColor} />
            <span
              style={{
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                fontWeight: 500,
              }}
            >
              {isMobile ? statusText.split(" ")[0] : statusText}
            </span>
          </Space>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: isMobile ? 80 : isTablet ? 140 : 180,
      render: (_, record) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          {isMobile ? (
            <Dropdown menu={getActionsMenu(record)} trigger={["click"]} placement="bottomRight">
              <Button
                type="text"
                icon={<MoreOutlined />}
                size="small"
                style={{ color: "#da2c46", border: "1px solid #da2c46" }}
              />
            </Dropdown>
          ) : (
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size={isTablet ? "small" : "default"}
              style={{
                backgroundColor: "#da2c46",
                borderColor: "#da2c46",
                fontSize: isTablet ? "11px" : "12px",
              }}
            >
              {isTablet ? "View" : "View Details"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={getTableData()}
        loading={loading}
        pagination={{
          pageSize: 10,
          showQuickJumper: isDesktop,
          size: isMobile ? "small" : "default",
        }}
        scroll={{
          x: isMobile ? 950 : isTablet ? 1070 : 1170,
          y: isMobile ? 400 : isTablet ? 500 : 600,
        }}
        size={isMobile ? "small" : isTablet ? "small" : "default"}
      />

      {/* Details Modal */}
      {isMobile ? (
        <Drawer
          title={<Title level={5} style={{ margin: 0 }}>Separate Approval Details</Title>}
          placement="bottom"
          visible={detailsModalVisible}
          onClose={() => setDetailsModalVisible(false)}
          height="90%"
          extra={
            selectedRecord?.status === "pending" && selectedRecord?.hasDocuments && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailsModalVisible(false);
                  handleApprove(selectedRecord);
                }}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Approve
              </Button>
            )
          }
        >
          {selectedRecord && (
            <DetailsContent
              record={selectedRecord}
              isMobile={isMobile}
              isTablet={isTablet}
              getFileIcon={getFileIcon}
              handleDownloadDocument={handleDownloadDocument}
              formatDate={formatDate}
            />
          )}
        </Drawer>
      ) : (
        <Modal
          title={<Title level={4} style={{ margin: 0 }}>Separate Approval Details</Title>}
          visible={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailsModalVisible(false)}>Close</Button>,
            selectedRecord?.status === "pending" && selectedRecord?.hasDocuments && (
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailsModalVisible(false);
                  handleApprove(selectedRecord);
                }}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Approve Documents
              </Button>
            ),
          ]}
          width={isMobile ? "95%" : isTablet ? "85%" : 1000}
          bodyStyle={{ maxHeight: "70vh", overflow: "auto" }}
        >
          {selectedRecord && (
            <DetailsContent
              record={selectedRecord}
              isMobile={isMobile}
              isTablet={isTablet}
              getFileIcon={getFileIcon}
              handleDownloadDocument={handleDownloadDocument}
              formatDate={formatDate}
            />
          )}
        </Modal>
      )}

      {/* Approve Modal */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}>Approve Documents</Title>}
        visible={approveModalVisible}
        onCancel={() => {
          setApproveModalVisible(false);
          setApprovalComments("");
        }}
        onOk={handleApprovalSubmit}
        confirmLoading={isApproving}
        okText="Approve"
        okButtonProps={{
          type: "primary",
          style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
        }}
        width={isMobile ? "95%" : isTablet ? "80%" : "50%"}
      >
        {selectedRecord && (
          <div>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div><Text strong>Candidate: </Text><Text>{selectedRecord.candidateName}</Text></div>
              <div><Text strong>Work Order: </Text><Text>{selectedRecord.workOrderTitle}</Text></div>
              <div><Text strong>Stage: </Text><Text>{selectedRecord.stageName}</Text></div>
              <div><Text strong>Level: </Text><Text>{selectedRecord.levelName || "N/A"}</Text></div>
              <div><Text strong>Documents: </Text><Text>{selectedRecord.documentsCount} files uploaded</Text></div>
            </Space>
            <Divider />
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                Approval Comments
              </label>
              <TextArea
                rows={4}
                placeholder="Add your approval comments (optional)..."
                value={approvalComments}
                onChange={(e) => setApprovalComments(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

const DetailsContent = ({ record, isMobile, isTablet, getFileIcon, handleDownloadDocument, formatDate }) => (
  <div>
    <Title level={5} style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}>
      Work Order Information
    </Title>
    <Descriptions bordered column={isMobile ? 1 : 2} size={isMobile ? "small" : "default"} style={{ marginBottom: "16px" }}>
      <Descriptions.Item label="Work Order Title">{record.workOrderTitle}</Descriptions.Item>
      <Descriptions.Item label="Job Code">{record.jobCode}</Descriptions.Item>
      <Descriptions.Item label="Stage">{record.stageName}</Descriptions.Item>
      <Descriptions.Item label="Level">{record.levelName || "N/A"}</Descriptions.Item>
    </Descriptions>

    <Title level={5} style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}>
      Candidate Information
    </Title>
    <Descriptions bordered column={isMobile ? 1 : 2} size={isMobile ? "small" : "default"} style={{ marginBottom: "16px" }}>
      <Descriptions.Item label="Name">{record.candidateName}</Descriptions.Item>
      <Descriptions.Item label="Email">{record.candidateEmail}</Descriptions.Item>
      <Descriptions.Item label="Documents Count">{record.documentsCount}</Descriptions.Item>
    </Descriptions>

    <Title level={5} style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}>
      Uploaded Documents
    </Title>
    {record.documents?.length > 0 ? (
      <List
        dataSource={record.documents}
        renderItem={(document) => (
          <List.Item
            actions={[
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleDownloadDocument(document)}
                size="small"
                style={{ color: "#da2c46" }}
              >
                View
              </Button>,
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadDocument(document)}
                size="small"
                style={{ color: "#da2c46" }}
              >
                Download
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={getFileIcon(document.fileName)}
              title={
                <Text ellipsis={{ tooltip: document.fileName }} style={{ fontSize: isMobile ? "12px" : "14px", fontWeight: 500 }}>
                  {document.fileName}
                </Text>
              }
              description={
                <Space size="small">
                  <Text type="secondary" style={{ fontSize: isMobile ? "10px" : "12px" }}>
                    {formatDate(document.uploadedAt)}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
        size={isMobile ? "small" : "default"}
      />
    ) : (
      <Text type="secondary">No documents uploaded</Text>
    )}
  </div>
);

export default SeparateApprovals;