import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Badge,
  Button,
  Modal,
  Descriptions,
  Tag,
  Space,
  Tabs,
  message,
  Tooltip,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  Input,
  Select,
  Grid,
  Image,
  List,
  Drawer,
  Dropdown,
  Result
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DownloadOutlined,
  UserOutlined,
  FileTextOutlined,
  SendOutlined,
  CommentOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
  MenuOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  useGetApprovalInfoQuery,
  useApproveCandidateDocumentsMutation,
  useGetSeperateApprovalsQuery,
} from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const RecruiterApprovals = () => {
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("workOrder");
  const [hasLoadedWorkOrders, setHasLoadedWorkOrders] = useState(false);
  const [hasLoadedSeparateApprovals, setHasLoadedSeparateApprovals] =
    useState(false);

  const [approvalComments, setApprovalComments] = useState("");
  const screens = useBreakpoint();

  const {
    data: workOrders = [],
    isLoading: loadingWorkOrders,
    refetch: refetchWorkOrders,
  } = useGetApprovalInfoQuery(undefined, {
    skip: activeTab !== "workOrder",
    refetchOnMountOrArgChange: true,
  });

  const {
    data: separateApprovals = [],
    isLoading: loadingSeparateApprovals,
    refetch: refetchSeparateApprovals,
  } = useGetSeperateApprovalsQuery(undefined, {
    skip: activeTab !== "separate",
    refetchOnMountOrArgChange: true,
  });

  const [approveCandidateDocuments, { isLoading: isApproving }] =
    useApproveCandidateDocumentsMutation();

  const isMobile = screens.xs;
  const isTablet = screens.sm || screens.md;
  const isDesktop = screens.lg || screens.xl;

  useEffect(() => {
    if (activeTab === "workOrder" && !hasLoadedWorkOrders) {
      refetchWorkOrders().then(() => setHasLoadedWorkOrders(true));
    } else if (activeTab === "separate" && !hasLoadedSeparateApprovals) {
      refetchSeparateApprovals().then(() =>
        setHasLoadedSeparateApprovals(true)
      );
    }
  }, [activeTab]);

  const getWorkOrderTableData = () => {
    const tableData = [];

    const separateStageIds = new Set();
    separateApprovals.forEach((approval) => {
      approval.pipelineStageTimeline.forEach((stage) => {
        separateStageIds.add(stage.stageId);
      });
    });

    workOrders.forEach((workOrder) => {
      workOrder.pipelineStageTimeline.forEach((stage) => {
        // ✅ Skip if stage is a separate approval
        const isSeparateApproval = stage.separateApprovalId && !stage.levelInfo;
        if (isSeparateApproval) return;

        const candidates = stage.uploadedDocuments?.length
          ? stage.uploadedDocuments
          : [
              {
                candidateId: stage.candidateId || "N/A",
                candidateName: stage.candidateName || "Unknown Candidate",
                candidateEmail: stage.candidateEmail || "N/A",
                documents: [],
              },
            ];

        candidates.forEach((candidate) => {
          tableData.push({
            key: `${workOrder._id}-${stage._id}-${candidate.candidateId}`,
            workOrderId: workOrder._id,
            workOrderTitle: workOrder.title,
            jobCode: workOrder.jobCode,
            candidateId: candidate.candidateId,
            candidateName: candidate.candidateName,
            candidateEmail: candidate.candidateEmail,
            stageName: stage.stageName,
            stageOrder: stage.stageOrder,
            recruiterName:
              stage.recruiterIds?.map((r) => r.fullName).join(", ") || "N/A",
            recruiterEmail:
              stage.recruiterIds?.map((r) => r.email).join(", ") || "N/A",
            documentsCount: candidate.documents?.length || 0,
            documents: candidate.documents || [],
            uploadedAt: candidate.documents?.[0]?.uploadedAt,
            stageDetails: stage.stageDetails,
            customFields: stage.customFields,
            requiredDocuments: stage.requiredDocuments,
            status: stage.levelInfo?.levelStatus || "pending",
            workOrder,
            stage,
            candidate,
            levelStatus: stage.levelInfo?.levelStatus,
            levelName: stage.levelInfo?.levelName,
          });
        });
      });
    });

    return tableData;
  };

  const getSeparateApprovalsTableData = () => {
    const tableData = [];

    separateApprovals.forEach((workOrder) => {
      const {
        _id: workOrderId,
        title,
        jobCode,
        pipelineStageTimeline,
      } = workOrder;

      pipelineStageTimeline.forEach((stage) => {
        const {
          stageId,
          stageName,
          recruiterId,
          recruiterIds,
          approvalId,
          separateApprovalId,
          uploadedDocuments = [],
          levelInfo,
          stageStatus,
          recruiterReviews = [],
        } = stage;

        const recruiters = recruiterIds || (recruiterId ? [recruiterId] : []);

        const candidates = uploadedDocuments?.length
          ? uploadedDocuments
          : [
              {
                candidateId: stage.candidateId || "N/A",
                candidateName: stage.candidateName || "Unknown Candidate",
                candidateEmail: stage.candidateEmail || "N/A",
                documents: [],
              },
            ];

        candidates.forEach((candidateDoc) => {
          const {
            candidateId,
            candidateName,
            candidateEmail,
            documents = [],
          } = candidateDoc;

          const status = levelInfo?.approverStatus || stageStatus;

          tableData.push({
            key: `${workOrderId}-${stageId}-${candidateId}`,
            workOrderId,
            workOrderTitle: title,
            jobCode,
            stageId,
            stageName,
            recruiterName:
              recruiters.map((r) => r.fullName || r.name).join(", ") || "N/A",
            recruiterEmail: recruiters.map((r) => r.email).join(", ") || "N/A",
            candidateId,
            candidateName,
            candidateEmail,
            documents,
            documentsCount: documents.length,
            uploadedAt: documents?.[0]?.uploadedAt,
            status,
            levelStatus: levelInfo?.levelStatus,
            levelName: levelInfo?.levelName,
            levelId: levelInfo?.levelId,
            separateApprovalId,
            approvalId,
            stage,
            candidate: {
              candidateId,
              candidateName,
              candidateEmail,
              documents,
            },
            isSeparateApproval: true,
          });
        });
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
      pending_review: "orange",
      approved: "green",
      rejected: "red",
      pending: "orange",
      in_review: "blue",
      completed: "green",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending_review: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending",
      in_review: "In Review",
      completed: "Completed",
    };
    return texts[status] || status;
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

  const getWorkOrderColumns = () => {
    const baseColumns = [
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
                      lineHeight: "1.3",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
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
                      lineHeight: "1.2",
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
                  lineHeight: "1.3",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "2px",
                }}
              >
                {text}
              </div>
            </Tooltip>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                lineHeight: "1.2",
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
        render: (text, record) => {
          const levelName = record.levelName || "N/A";

          return (
            <Space direction="vertical" size={0}>
              <Tooltip title={`Stage: ${text}`}>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                    lineHeight: 1.3,
                    display: "block",
                  }}
                >
                  Stage:{" "}
                  {isMobile
                    ? text.length > 8
                      ? `${text.substring(0, 8)}...`
                      : text
                    : text}
                </Text>
              </Tooltip>
              <Tooltip title={`Level: ${levelName}`}>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                    lineHeight: 1.2,
                    display: "block",
                  }}
                >
                  Level:{" "}
                  {isMobile
                    ? levelName.length > 8
                      ? `${levelName.substring(0, 8)}...`
                      : levelName
                    : levelName}
                </Text>
              </Tooltip>
            </Space>
          );
        },
      },
      {
        title: "Recruitment Team Member",
        dataIndex: "recruiterName",
        key: "recruiterName",
        width: isMobile ? 150 : isTablet ? 160 : 200,
        ellipsis: true,
        render: (text, record) => {
          return (
            <div style={{ minWidth: 0 }}>
              <Tooltip title={text}>
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: isMobile ? "11px" : isTablet ? "12px" : "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "1.3",
                    marginBottom: "2px",
                  }}
                >
                  {text || "N/A"}
                </div>
              </Tooltip>
              {!isMobile &&
                record.recruiterEmail &&
                record.recruiterEmail !== "N/A" && (
                  <Tooltip title={record.recruiterEmail}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: isTablet ? "11px" : "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        lineHeight: "1.2",
                      }}
                    >
                      {record.recruiterEmail}
                    </Text>
                  </Tooltip>
                )}
            </div>
          );
        },
      },
      {
        title: "Docs",
        dataIndex: "documentsCount",
        key: "documentsCount",
        width: isMobile ? 80 : isTablet ? 90 : 100,
        align: "center",
        render: (count, record) => (
          <Tooltip title={`${count} document(s) uploaded`}>
            <Space
              size="small"
              direction={isMobile ? "vertical" : "horizontal"}
            >
              <FileTextOutlined
                style={{
                  fontSize: isMobile ? "14px" : isTablet ? "16px" : "16px",
                  color: "#1890ff",
                }}
              />
              <span
                style={{
                  fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
                  fontWeight: 500,
                }}
              >
                {count}
              </span>
            </Space>
          </Tooltip>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: isMobile ? 100 : isTablet ? 120 : 130,
        render: (status, record) => {
          const displayStatus =
            record.stage?.levelInfo?.approverStatus || "pending";
          const statusText = getStatusText(displayStatus);
          const statusColor = getStatusColor(displayStatus);

          return (
            <Space>
              <Badge status={statusColor} />
              <span
                style={{
                  fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                  fontWeight: 500,
                  color: statusColor === "default" ? undefined : statusColor,
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
              <Dropdown
                menu={getActionsMenu(record)}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  size="small"
                  style={{
                    color: "#da2c46",
                    border: "1px solid #da2c46",
                  }}
                />
              </Dropdown>
            ) : (
              <Space size="small" wrap>
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
              </Space>
            )}
          </div>
        ),
      },
    ];

    return baseColumns;
  };

  const getSeparateApprovalsColumns = () => {
    const baseColumns = [
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
                      lineHeight: "1.3",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
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
                      lineHeight: "1.2",
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
                  lineHeight: "1.3",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "2px",
                }}
              >
                {text}
              </div>
            </Tooltip>
            <Text
              type="secondary"
              style={{
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                lineHeight: "1.2",
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
        render: (text, record) => {
          const levelName = record.levelName || "N/A";

          return (
            <Space direction="vertical" size={0}>
              <Tooltip title={`Stage: ${text}`}>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                    lineHeight: 1.3,
                    display: "block",
                  }}
                >
                  Stage:{" "}
                  {isMobile
                    ? text.length > 8
                      ? `${text.substring(0, 8)}...`
                      : text
                    : text}
                </Text>
              </Tooltip>
              <Tooltip title={`Level: ${levelName}`}>
                <Text
                  strong
                  style={{
                    fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                    lineHeight: 1.2,
                    display: "block",
                  }}
                >
                  Level:{" "}
                  {isMobile
                    ? levelName.length > 8
                      ? `${levelName.substring(0, 8)}...`
                      : levelName
                    : levelName}
                </Text>
              </Tooltip>
            </Space>
          );
        },
      },
      {
        title: "Recruitment Team Member",
        dataIndex: "recruiterName",
        key: "recruiterName",
        width: isMobile ? 150 : isTablet ? 160 : 200,
        ellipsis: true,
        render: (text, record) => {
          return (
            <div style={{ minWidth: 0 }}>
              <Tooltip title={text}>
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: isMobile ? "11px" : isTablet ? "12px" : "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "1.3",
                    marginBottom: "2px",
                  }}
                >
                  {text || "N/A"}
                </div>
              </Tooltip>
              {!isMobile &&
                record.recruiterEmail &&
                record.recruiterEmail !== "N/A" && (
                  <Tooltip title={record.recruiterEmail}>
                    <Text
                      type="secondary"
                      style={{
                        fontSize: isTablet ? "11px" : "12px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                        lineHeight: "1.2",
                      }}
                    >
                      {record.recruiterEmail}
                    </Text>
                  </Tooltip>
                )}
            </div>
          );
        },
      },
      {
        title: "Docs",
        dataIndex: "documentsCount",
        key: "documentsCount",
        width: isMobile ? 80 : isTablet ? 90 : 100,
        align: "center",
        render: (count) => (
          <Tooltip title={`${count} document(s) uploaded`}>
            <Space
              size="small"
              direction={isMobile ? "vertical" : "horizontal"}
            >
              <FileTextOutlined style={{ color: "#1890ff" }} />
              <span style={{ fontWeight: 500 }}>{count}</span>
            </Space>
          </Tooltip>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: isMobile ? 100 : isTablet ? 120 : 130,
        render: (status, record) => {
          const statusText = getStatusText(status);
          const statusColor = getStatusColor(status);

          return (
            <Space>
              <Badge status={statusColor} />
              <span
                style={{
                  fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                  fontWeight: 500,
                  color: statusColor === "default" ? undefined : statusColor,
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
              <Dropdown
                menu={getActionsMenu(record)}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<MoreOutlined />}
                  size="small"
                  style={{
                    color: "#da2c46",
                    border: "1px solid #da2c46",
                  }}
                />
              </Dropdown>
            ) : (
              <Space size="small" wrap>
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
              </Space>
            )}
          </div>
        ),
      },
    ];

    return baseColumns;
  };

  const handleViewDetails = (record) => {
    setSelectedWorkOrder(record);
    setSelectedCandidate(record.candidate);
    setDetailsModalVisible(true);
  };

  const handleApprove = (record) => {
    setSelectedWorkOrder(record);
    setSelectedCandidate(record.candidate);
    setApproveModalVisible(true);
  };

  const handleApprovalSubmit = async () => {
    try {
      if (!selectedWorkOrder || !selectedCandidate) return;

      const approvalId = selectedWorkOrder.isSeparateApproval
        ? selectedWorkOrder.separateApprovalId
        : selectedWorkOrder.stage?.approvalId;

      const levelId = selectedWorkOrder.stage?.levelInfo?.levelId || null;
      const stageId = selectedWorkOrder.stage?.stageId || null;

      if (!approvalId) {
        message.error("Missing required approval information");
        return;
      }

      await approveCandidateDocuments({
        workOrderid: selectedWorkOrder.workOrderId,
        userId: selectedCandidate.candidateId,
        approvalId,
        levelId,
        stageId,
        status: "approved",
        comments: approvalComments,
      }).unwrap();

      message.success(
        `Documents approved for ${selectedCandidate.candidateName}!`
      );
      setApproveModalVisible(false);
      setApprovalComments("");
      refetchWorkOrders();
      refetchSeparateApprovals();
    } catch (error) {
      message.error(error.data?.message || "Failed to approve documents");
      console.error("Approval error:", error);
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

  const getModalWidth = () => {
    if (isMobile) return "95%";
    if (isTablet) return "85%";
    return 1000;
  };

  const getTableHeight = () => {
    if (isMobile) return 400;
    if (isTablet) return 500;
    return 600;
  };

  const getTableScrollConfig = () => {
    const totalWidth = isMobile ? 950 : isTablet ? 1070 : 1170;
    return {
      x: totalWidth,
      y: getTableHeight(),
    };
  };

  return (
    <div>
      {/* Header */}
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "16px" }}
      >
        <Col span={24}>
          <Title
            level={isMobile ? 4 : isTablet ? 3 : 2}
            style={{ margin: 0, color: "#262626" }}
          >
            Document Approvals
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: isMobile ? "12px" : "14px",
              display: "block",
              marginTop: "4px",
            }}
          >
            Review and approve candidate document submissions
          </Text>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        style={{ marginBottom: 16 }}
        destroyInactiveTabPane={true}
      >
        <TabPane tab="Work Order Approvals" key="workOrder">
          <Table
            columns={getWorkOrderColumns()}
            dataSource={hasLoadedWorkOrders ? getWorkOrderTableData() : []}
            loading={loadingWorkOrders}
            pagination={{
              pageSize: 10,
              showQuickJumper: isDesktop,
              size: isMobile ? "small" : "default",
            }}
            scroll={getTableScrollConfig()}
            size={isMobile ? "small" : isTablet ? "small" : "default"}
            rowClassName="table-row-hover"
            className="responsive-table"
          />
        </TabPane>
        <TabPane tab="Separate Approvals" key="separate">
          <Table
            columns={getSeparateApprovalsColumns()}
            dataSource={
              hasLoadedSeparateApprovals ? getSeparateApprovalsTableData() : []
            }
            loading={loadingSeparateApprovals}
            pagination={{
              pageSize: 10,
              showQuickJumper: isDesktop,
              size: isMobile ? "small" : "default",
            }}
            scroll={getTableScrollConfig()}
            size={isMobile ? "small" : isTablet ? "small" : "default"}
            rowClassName="table-row-hover"
            className="responsive-table"
          />
        </TabPane>
        <TabPane tab="Requisition Approvals" key="requisition">
          <Result
            status="404"
            title="Coming Soon"
            subTitle="This Page is Under Development coming soon"
          />
        </TabPane>
      </Tabs>

      {isMobile ? (
        <Drawer
          title={
            <Title level={5} style={{ margin: 0 }}>
              Document Review Details
            </Title>
          }
          placement="bottom"
          visible={detailsModalVisible}
          onClose={() => setDetailsModalVisible(false)}
          height="90%"
          extra={
            selectedWorkOrder?.status === "pending" && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailsModalVisible(false);
                  handleApprove(selectedWorkOrder);
                }}
                disabled={!selectedCandidate?.documents?.length}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Approve
              </Button>
            )
          }
        >
          {selectedWorkOrder && selectedCandidate && (
            <div style={{ padding: "8px 0" }}>
              <DetailsContent
                selectedWorkOrder={selectedWorkOrder}
                selectedCandidate={selectedCandidate}
                isMobile={isMobile}
                isTablet={isTablet}
                getFileIcon={getFileIcon}
                handleDownloadDocument={handleDownloadDocument}
                formatDate={formatDate}
              />
            </div>
          )}
        </Drawer>
      ) : (
        <Modal
          title={
            <Title level={4} style={{ margin: 0 }}>
              Document Review Details
            </Title>
          }
          visible={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailsModalVisible(false)}>
              Close
            </Button>,
            selectedWorkOrder?.status === "pending" && (
              <Button
                key="approve"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setDetailsModalVisible(false);
                  handleApprove(selectedWorkOrder);
                }}
                disabled={!selectedCandidate?.documents?.length}
                style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              >
                Approve Documents
              </Button>
            ),
          ]}
          width={getModalWidth()}
          style={{ top: isTablet ? 20 : undefined }}
          bodyStyle={{
            maxHeight: "70vh",
            overflow: "auto",
          }}
        >
          {selectedWorkOrder && selectedCandidate && (
            <DetailsContent
              selectedWorkOrder={selectedWorkOrder}
              selectedCandidate={selectedCandidate}
              isMobile={isMobile}
              isTablet={isTablet}
              getFileIcon={getFileIcon}
              handleDownloadDocument={handleDownloadDocument}
              formatDate={formatDate}
              hasDocuments={selectedCandidate?.documents?.length > 0}
            />
          )}
        </Modal>
      )}

      {/* Approve Modal */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            Approve Documents
          </Title>
        }
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
        {selectedCandidate && (
          <div>
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div>
                <Text strong>Candidate: </Text>
                <Text>{selectedCandidate.candidateName}</Text>
              </div>
              <div>
                <Text strong>Work Order: </Text>
                <Text>{selectedWorkOrder?.workOrderTitle}</Text>
              </div>
              <div>
                <Text strong>Stage: </Text>
                <Text>{selectedWorkOrder?.stageName}</Text>
              </div>
              <div>
                <Text strong>Level: </Text>
                <Text>{selectedWorkOrder?.levelName || "N/A"}</Text>
              </div>
              <div>
                <Text strong>Documents: </Text>
                <Text>
                  {selectedCandidate.documents?.length || 0} files uploaded
                </Text>
              </div>
            </Space>

            <Divider />

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
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

      <style jsx>{`
        .table-row-hover:hover {
          background-color: #f5f5f5;
        }

        .responsive-table .ant-table-thead > tr > th {
          background-color: #fafafa;
          font-weight: 600;
          border-bottom: 2px solid #f0f0f0;
        }

        .responsive-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0;
          vertical-align: top;
          padding: ${isMobile
            ? "8px 4px"
            : isTablet
            ? "12px 8px"
            : "12px 16px"};
        }

        .responsive-table .ant-table-thead > tr > th {
          padding: ${isMobile
            ? "8px 4px"
            : isTablet
            ? "12px 8px"
            : "12px 16px"};
          font-size: ${isMobile ? "11px" : isTablet ? "12px" : "14px"};
        }

        .responsive-table .ant-table-tbody > tr > td {
          font-size: ${isMobile ? "11px" : isTablet ? "12px" : "14px"};
        }

        .responsive-table .ant-table-container {
          border: 1px solid #f0f0f0;
          border-radius: 8px;
        }

        .responsive-table .ant-table-body {
          overflow: auto !important;
        }

        .ant-descriptions-item-label {
          font-weight: 500;
        }

        .ant-card {
          transition: all 0.3s ease;
        }

        .ant-dropdown-menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Custom scrollbar for table */
        .responsive-table .ant-table-body::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        .responsive-table .ant-table-body::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .responsive-table .ant-table-body::-webkit-scrollbar-thumb {
          background: #da2c46;
          border-radius: 4px;
        }

        .responsive-table .ant-table-body::-webkit-scrollbar-thumb:hover {
          background: #b8253a;
        }

        /* Mobile specific styles */
        @media (max-width: 576px) {
          .responsive-table .ant-table-container {
            font-size: 11px;
          }

          .responsive-table .ant-table-tbody > tr > td,
          .responsive-table .ant-table-thead > tr > th {
            padding: 6px 4px;
          }

          .responsive-table .ant-tag {
            margin: 0;
            padding: 0 4px;
            font-size: 10px;
            line-height: 18px;
          }
        }

        /* Tablet specific styles */
        @media (min-width: 577px) and (max-width: 992px) {
          .responsive-table .ant-table-tbody > tr > td,
          .responsive-table .ant-table-thead > tr > th {
            padding: 8px 6px;
          }
        }

        /* Improve text truncation */
        .responsive-table .ant-table-cell {
          word-break: break-word;
        }

        /* Pagination responsive styles */
        @media (max-width: 576px) {
          .ant-pagination {
            text-align: center;
          }

          .ant-pagination-options {
            display: none;
          }
        }

        /* Table header sticky positioning */
        .responsive-table .ant-table-thead > tr > th {
          position: sticky;
          top: 0;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

// Details Content Component
const DetailsContent = ({
  selectedWorkOrder,
  selectedCandidate,
  isMobile,
  isTablet,
  getFileIcon,
  handleDownloadDocument,
  formatDate,
}) => (
  <div>
    {/* Work Order Information */}
    <Title
      level={5}
      style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}
    >
      Work Order Information
    </Title>
    <Descriptions
      bordered
      column={isMobile ? 1 : 2}
      size={isMobile ? "small" : "default"}
      style={{ marginBottom: "16px" }}
    >
      <Descriptions.Item label="Work Order Title">
        {selectedWorkOrder.workOrderTitle}
      </Descriptions.Item>
      <Descriptions.Item label="Job Code">
        {selectedWorkOrder.jobCode}
      </Descriptions.Item>
      <Descriptions.Item label="Stage">
        {selectedWorkOrder.stageName}
      </Descriptions.Item>
      <Descriptions.Item label="Level">
        {selectedWorkOrder.levelName || "N/A"}
      </Descriptions.Item>
    </Descriptions>

    {/* Candidate Information */}
    <Title
      level={5}
      style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}
    >
      Candidate Information
    </Title>
    <Descriptions
      bordered
      column={isMobile ? 1 : 2}
      size={isMobile ? "small" : "default"}
      style={{ marginBottom: "16px" }}
    >
      <Descriptions.Item label="Name">
        {selectedCandidate.candidateName}
      </Descriptions.Item>
      <Descriptions.Item label="Email">
        {selectedCandidate.candidateEmail}
      </Descriptions.Item>
      <Descriptions.Item label="Documents Count">
        {selectedCandidate.documents?.length || 0}
      </Descriptions.Item>
    </Descriptions>

    {/* Uploaded Documents */}
    <Title
      level={5}
      style={{ fontSize: isMobile ? "14px" : "16px", marginBottom: "12px" }}
    >
      Uploaded Documents
    </Title>
    {selectedCandidate.documents?.length > 0 ? (
      <List
        dataSource={selectedCandidate.documents}
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
                <Text
                  ellipsis={{ tooltip: document.fileName }}
                  style={{
                    fontSize: isMobile ? "12px" : "14px",
                    fontWeight: 500,
                  }}
                >
                  {document.fileName}
                </Text>
              }
              description={
                <Space size="small">
                  <Text
                    type="secondary"
                    style={{ fontSize: isMobile ? "10px" : "12px" }}
                  >
                    {formatDate(document.uploadedAt)}
                  </Text>
                  {document.fileSize && (
                    <Text
                      type="secondary"
                      style={{ fontSize: isMobile ? "10px" : "12px" }}
                    >
                      ({document.fileSize})
                    </Text>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
        style={{ marginBottom: "24px" }}
        size={isMobile ? "small" : "default"}
      />
    ) : (
      <Text type="secondary">No documents uploaded</Text>
    )}
  </div>
);

export default RecruiterApprovals;
