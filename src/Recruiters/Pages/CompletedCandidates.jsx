import React, { useState, useCallback, useMemo } from "react";
import {
  Table,
  Input,
  Space,
  Typography,
  Card,
  Spin,
  Tag,
  Avatar,
  Button,
  Tooltip,
  Empty,
  Drawer,
  Tabs,
  Divider,
  Timeline,
  List,
  Row,
  Col,
  Badge,
  Rate,
  Descriptions,
  Modal,
  Form,
  message,
  DatePicker,
  Checkbox,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined,
} from "@ant-design/icons";
import {
  useGetPipelineCompletedCandidatesQuery,
  useConvertEmployeeMutation,
  useGetPipelineCompletedCandidateByIdQuery,
  useRejectCandidateFromStageMutation,
} from "../../Slices/Recruiter/RecruiterApis"; // Update this path
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import { useSnackbar } from "notistack";

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { TabPane } = Tabs;

const CompletedCandidates = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) =>
      `${range[0]}-${range[1]} of ${total} candidates`,
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [convertForm] = Form.useForm();
  const [candidateToConvert, setCandidateToConvert] = useState(null);
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [candidateToReject, setCandidateToReject] = useState(null);

  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  const debouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
      setPagination((prev) => ({
        ...prev,
        current: 1,
      }));
    }, 500),
    []
  );

  const handleSearch = (value) => {
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const {
    data: apiData,
    isLoading,
    refetch,
    error,
  } = useGetPipelineCompletedCandidatesQuery({
    page: pagination.current,
    limit: pagination.pageSize,
    search: debouncedSearchTerm,
    status: "completed",
  });

  const {
    data: candidateDetails,
    isLoading: isCandidateDetailsLoading,
    isFetching: isCandidateDetailsFetching,
  } = useGetPipelineCompletedCandidateByIdQuery(selectedCandidate?._id, {
    skip: !selectedCandidate?._id,
  });

  const [convertEmployee, { isLoading: isConverting }] =
    useConvertEmployeeMutation();

  const [rejectCandidateFromStage, { isLoading: isRejecting }] =
    useRejectCandidateFromStageMutation();

  React.useEffect(() => {
    if (apiData?.total) {
      setPagination((prev) => ({
        ...prev,
        total: apiData.total,
      }));
    }
  }, [apiData]);

  const handleTableChange = (page, pageSize) => {
    setPagination((prev) => ({
      ...prev,
      current: page,
      pageSize: pageSize || prev.pageSize,
    }));
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidate(null);
    setTimeout(() => setSelectedCandidate(candidate), 0);
    setDrawerVisible(true);
  };

  const handleDownloadDocument = (fileUrl, fileName) => {
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRejectCompleted = (candidate) => {
    setCandidateToReject(candidate);
    setIsRejectModalVisible(true);
  };

  const handleConfirmReject = async () => {
    try {
      if (!rejectionReason.trim()) {
        message.error("Please provide a rejection reason");
        return;
      }

      if (!candidateToReject?._id) {
        message.error("No candidate selected");
        return;
      }

      // Call API WITHOUT stageId for completed candidates
      await rejectCandidateFromStage({
        id: candidateToReject._id,
        rejectionReason: rejectionReason.trim(),
        stageId: undefined,
      }).unwrap();

      enqueueSnackbar("Completed candidate rejected successfully", {
        variant: "success",
      });

      // Reset state
      setIsRejectModalVisible(false);
      setRejectionReason("");
      setCandidateToReject(null);

      // Refresh data
      refetch();
    } catch (error) {
      console.error("Error rejecting candidate:", error);
      enqueueSnackbar(error?.data?.message || "Failed to reject candidate", {
        variant: "error",
      });
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    if (extension === "pdf")
      return <FilePdfOutlined style={{ color: "#ff4d4f" }} />;
    if (["jpg", "jpeg", "png", "gif"].includes(extension))
      return <FileImageOutlined style={{ color: "#1890ff" }} />;
    return <FileOutlined style={{ color: "#52c41a" }} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      case "completed":
        return "success";
      default:
        return "default";
    }
  };

  const renderCandidateDetails = () => {
    const candidate = candidateDetails?.data || selectedCandidate;
    const saCan = selectedCandidate;
    if (!candidate) return <Spin />;

    return (
      <div style={{ padding: "16px 0" }}>
        <Card size="small" style={{ marginBottom: "16px" }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space size="large">
                <Avatar
                  size={64}
                  src={saCan?.user?.image}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: "#da2c46" }}
                />
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {saCan?.user?.fullName || "N/A"}
                  </Title>
                  <Text type="secondary">{saCan?.user?.email || "N/A"}</Text>
                  <br />
                  {candidate.selectedMovingComment && (
                    <Paragraph style={{ marginTop: 8 }}>
                      <Text strong>Pipeline Comments: </Text>
                      {candidate.selectedMovingComment}
                    </Paragraph>
                  )}
                </div>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          title="Work Order Details"
          style={{ marginBottom: "16px" }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Work Order">
              {saCan?.workOrder?.title || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(candidate.status)}>
                {candidate.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Sourced">
              <Tag
                color={candidate.isSourced === "true" ? "success" : "default"}
              >
                {candidate.isSourced === "true" ? "YES" : "NO"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {candidate.stageProgress?.length > 0 && (
          <Card size="small" title="Stages Progress">
            {candidate.stageProgress.map((stage, index) => (
              <Card
                key={stage._id}
                size="small"
                type="inner"
                title={
                  <Space>
                    <Badge
                      status={getStatusColor(stage.stageStatus)}
                      text={stage.stageName}
                    />
                    <Tag color={getStatusColor(stage.stageStatus)}>
                      {stage.stageStatus?.toUpperCase()}
                    </Tag>
                  </Space>
                }
                style={{
                  marginBottom:
                    index < candidate.stageProgress.length - 1 ? "12px" : 0,
                }}
              >
                {stage.recruiterReviews?.length > 0 && (
                  <div style={{ marginBottom: "12px" }}>
                    <Text strong>Recruiter Reviews:</Text>
                    {stage.recruiterReviews.map((review) => (
                      <div
                        key={review._id}
                        style={{ marginLeft: "16px", marginTop: "8px" }}
                      >
                        <Space direction="vertical" size="small">
                          <div>
                            <Text strong>{review.reviewerName}</Text>
                            <Tag
                              color={getStatusColor(review.status)}
                              style={{ marginLeft: "8px" }}
                            >
                              {review.status?.toUpperCase()}
                            </Tag>
                          </div>
                          {review.reviewComments && (
                            <Text italic>"{review.reviewComments}"</Text>
                          )}
                          {review.reviewedAt && (
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              Reviewed at: {formatDate(review.reviewedAt)}
                            </Text>
                          )}
                        </Space>
                      </div>
                    ))}
                  </div>
                )}

                {stage.stageCompletedAt && (
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    <ClockCircleOutlined /> Completed at:{" "}
                    {formatDate(stage.stageCompletedAt)}
                  </Text>
                )}
              </Card>
            ))}
          </Card>
        )}

        {candidate.separatePipelineApprovals?.length > 0 && (
          <Card
            size="small"
            title="Separate Pipeline Approvals"
            style={{ marginTop: "16px" }}
          >
            <List
              dataSource={candidate.separatePipelineApprovals}
              renderItem={(approval) => (
                <List.Item>
                  <Text>{approval}</Text>
                </List.Item>
              )}
            />
          </Card>
        )}
      </div>
    );
  };

  const renderTimeline = () => {
    const candidate = candidateDetails?.data || selectedCandidate;
    if (!candidate?.stageProgress) return null;

    const timelineItems = [];

    candidate.stageProgress.forEach((stage) => {
      if (stage.stageCompletedAt) {
        timelineItems.push({
          dot: <CheckCircleOutlined style={{ color: "#da2c46" }} />,
          color: "green",
          children: (
            <div>
              <Text strong>Stage Completed: {stage.stageName}</Text>
              <br />
              <Text type="secondary">{formatDate(stage.stageCompletedAt)}</Text>
              <br />
              <Tag color={getStatusColor(stage.stageStatus)} size="small">
                {stage.stageStatus?.toUpperCase()}
              </Tag>
            </div>
          ),
          time: stage.stageCompletedAt,
        });
      }

      stage.recruiterReviews?.forEach((review) => {
        if (review.reviewedAt) {
          timelineItems.push({
            dot: <CommentOutlined style={{ color: "#1890ff" }} />,
            children: (
              <div>
                <Text strong>
                  {review.reviewerName} reviewed {stage.stageName}
                </Text>
                <br />
                <Text type="secondary">{formatDate(review.reviewedAt)}</Text>
                <br />
                {review.reviewComments && (
                  <>
                    <Text italic>"{review.reviewComments}"</Text>
                    <br />
                  </>
                )}
                <Tag color={getStatusColor(review.status)} size="small">
                  {review.status?.toUpperCase()}
                </Tag>
              </div>
            ),
            time: review.reviewedAt,
          });
        }
      });
    });

    timelineItems.sort((a, b) => new Date(b.time) - new Date(a.time));

    return (
      <div style={{ padding: "16px 0" }}>
        <Timeline mode="left">
          {timelineItems.map((item, index) => (
            <Timeline.Item key={index} dot={item.dot} color={item.color}>
              {item.children}
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    );
  };

  const renderDocuments = () => {
    const candidate = candidateDetails?.data || selectedCandidate;
    if (!candidate?.stageProgress) return null;

    const allDocuments = [];
    candidate.stageProgress.forEach((stage) => {
      stage.uploadedDocuments?.forEach((doc) => {
        allDocuments.push({
          ...doc,
          stageName: stage.stageName,
          stageId: stage._id,
        });
      });

      stage.additionalStageDocuments?.forEach((doc) => {
        allDocuments.push({
          ...doc,
          stageName: stage.stageName,
          stageId: stage._id,
          isAdditional: true,
        });
      });
    });

    if (candidate.workOrderuploadedDocuments?.length > 0) {
      candidate.workOrderuploadedDocuments.forEach((doc) => {
        allDocuments.push({
          ...doc,
          stageName: "Work Order",
          stageId: "work-order",
        });
      });
    }

    return (
      <div style={{ padding: "16px 0" }}>
        <List
          itemLayout="horizontal"
          dataSource={allDocuments}
          renderItem={(document) => (
            <List.Item
              actions={[
                hasPermission("view-download-icon") && (
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      handleDownloadDocument(
                        document.fileUrl,
                        document.fileName
                      )
                    }
                    style={{ color: "#da2c46" }}
                  >
                    Download
                  </Button>
                ),
              ].filter(Boolean)} // ✅ remove false/null entries
            >
              <List.Item.Meta
                avatar={getFileIcon(document.fileName)}
                title={
                  <Space>
                    <Text strong>{document.documentName}</Text>
                    <Tag size="small" color="blue">
                      {document.stageName}
                    </Tag>
                    {document.isAdditional && (
                      <Tag color="orange" size="small">
                        Additional Document
                      </Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">{document.fileName}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Uploaded: {formatDate(document.uploadedAt)}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {allDocuments.length === 0 && (
          <Empty description="No documents uploaded" />
        )}
      </div>
    );
  };

  const columns = [
    {
      title: "Candidate",
      dataIndex: ["user", "fullName"],
      key: "fullName",
      width: 250,
      render: (text, record) => (
        <Space>
          <Avatar
            size={40}
            src={record.user?.image}
            icon={<UserOutlined />}
            style={{ backgroundColor: "#da2c46" }}
          />
          <div>
            <div style={{ fontWeight: 500, color: "#262626" }}>
              {record.user?.fullName}
            </div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.user?.email}
            </Text>
          </div>
        </Space>
      ),
      sorter: true,
    },
    {
      title: "Work Order",
      dataIndex: ["workOrder", "title"],
      key: "workOrder",
      width: 200,
      render: (text, record) => (
        <div>
          <Text strong style={{ color: "#da2c46" }}>
            {record.workOrder?.title}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.workOrder?.jobCode}
          </Text>
        </div>
      ),
    },
    {
      title: "Pipeline",
      dataIndex: ["workOrder", "pipelineName"],
      key: "pipeline",
      width: 180,
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag
          icon={<CheckCircleOutlined />}
          color="success"
          style={{
            borderColor: "#32da2cff",
            color: "#32da2cff",
          }}
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => handleViewCandidate(record)}
            style={{
              borderColor: "#da2c46",
              color: "#da2c46",
            }}
          >
            View
          </Button>
          {hasPermission("convert-to-employee") && (
            <Button
              type="default"
              onClick={() => {
                setCandidateToConvert(record);
                convertForm.setFieldsValue({
                  fullName: record.user?.fullName || "",
                  dateOfJoining: null,
                  category: "",
                  assignedJobTitle: "",
                  eramId: "",
                  badgeNo: "",
                  gatePassId: "",
                  aramcoId: "",
                  otherId: "",
                  plantId: "",
                  officialEmail: "",
                  basicAssets: "",
                  iqamaId: "",
                  employeeGroup: "",
                  reportingAndDocumentation: "",
                  employmentType: "",
                });
                setConvertModalVisible(true);
              }}
              style={{
                borderColor: "#da2c46",
                color: "#da2c46",
              }}
            >
              Convert
            </Button>
          )}

          {hasPermission("rej-candidate") && (
            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => handleRejectCompleted(record)}
            >
              Reject
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <Space
          style={{
            width: "100%",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <Title level={3} style={{ margin: 0, color: "#262626" }}>
              Completed Candidates
            </Title>
            <Text type="secondary">
              View all candidates who have completed the pipeline process
            </Text>
          </div>
          {/* <Button
            type="primary"
            onClick={refetch}
            style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
          >
            Refresh
          </Button> */}
        </Space>

        {/* Search Bar */}
        <Search
          placeholder="Search by name, email, work order..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
          enterButton={
            <Button
              style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
              icon={<SearchOutlined />}
            />
          }
        />
      </div>

      {/* Table */}
      <Spin spinning={isLoading}>
        <Table
          columns={columns}
          dataSource={apiData?.data || []}
          rowKey="_id"
          pagination={{
            ...pagination,
            onChange: handleTableChange,
            onShowSizeChange: handleTableChange,
            pageSizeOptions: ["10", "20", "50", "100"],
            style: { marginTop: "16px" },
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    {debouncedSearchTerm
                      ? `No candidates found for "${debouncedSearchTerm}"`
                      : "No completed candidates found"}
                  </span>
                }
              />
            ),
          }}
        />
      </Spin>

      {/* Candidate Details Drawer */}
      <Drawer
        title={
          <Space>
            <Avatar
              icon={<UserOutlined />}
              src={selectedCandidate?.user?.image}
              style={{ backgroundColor: "#da2c46" }}
            />
            <span>{selectedCandidate?.user?.fullName}</span>
          </Space>
        }
        width={800}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        closeIcon={<CloseOutlined />}
        extra={
          <Button
            type="primary"
            ghost
            onClick={() => setDrawerVisible(false)}
            style={{ borderColor: "#da2c46", color: "#da2c46" }}
          >
            Close
          </Button>
        }
      >
        <Tabs defaultActiveKey="details" type="card">
          {hasPermission("view-candidate-details-tab") && (
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Candidate Details
                </span>
              }
              key="details"
            >
              {renderCandidateDetails()}
            </TabPane>
          )}
          {hasPermission("view-timeline-tab") && (
            <TabPane
              tab={
                <span>
                  <ClockCircleOutlined />
                  Timeline
                </span>
              }
              key="timeline"
            >
              {renderTimeline()}
            </TabPane>
          )}
          {hasPermission("view-documents-tab") && (
            <TabPane
              tab={
                <span>
                  <FileTextOutlined />
                  Documents
                </span>
              }
              key="documents"
            >
              {renderDocuments()}
            </TabPane>
          )}
        </Tabs>
      </Drawer>

      <Modal
        title={`Convert ${
          candidateToConvert?.user?.fullName || ""
        } to Employee`}
        open={convertModalVisible}
        onCancel={() => {
          setConvertModalVisible(false);
          convertForm.resetFields();
          setCandidateToConvert(null);
        }}
        footer={null}
        width="90%"
        style={{
          top: 20,
          maxWidth: 1000,
          margin: "0 auto",
        }}
        bodyStyle={{
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          padding: "24px 16px",
        }}
      >
        <Form
          form={convertForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (!candidateToConvert) throw new Error("No candidate selected");
              if (!candidateToConvert.user?._id)
                throw new Error("Candidate user info is incomplete");

              const payload = {
                ...values,
                candidateId: candidateToConvert.user._id,
                customFieldId: candidateToConvert._id,
                workOrderId: candidateToConvert.workOrder._id,
                // Convert date objects to ISO strings
                dateOfJoining: values.dateOfJoining?.toISOString(),
                lastArrival: values.lastArrival?.toISOString(),
                iqamaIssueDate: values.iqamaIssueDate?.toISOString(),
                iqamaExpiryDate: values.iqamaExpiryDate?.toISOString(),
                iqamaArabicDateOfIssue:
                  values.iqamaArabicDateOfIssue?.toISOString(),
                iqamaArabicDateOfExpiry:
                  values.iqamaArabicDateOfExpiry?.toISOString(),
                lastWorkingDay: values.lastWorkingDay?.toISOString(),
                employmentType: values.employeeType,
                iqamaId: values.iqamaId,
                employeeGroup: values.employeeGroup,
                reportingAndDocumentation: values.reportingAndDocumentation,
                sponsorName: values.sponsorName, // Already exists, just verify
                eligibleVacationDays: values.eligibleVacationDays,
                eligibleVacationMonth: values.eligibleVacationMonth,
                assetAllocation: values.assetAllocation
                  ? values.assetAllocation.split(",").map((item) => item.trim())
                  : [],
              };

              await convertEmployee(payload).unwrap();
              enqueueSnackbar("Candidate successfully converted to employee!", {
                variant: "success",
              });
              refetch();
              setConvertModalVisible(false);
              convertForm.resetFields();
              setCandidateToConvert(null);
            } catch (error) {
              console.error("Conversion failed:", error);
              enqueueSnackbar(
                error?.data?.message || "Failed to convert candidate.",
                { variant: "error" }
              );
            }
          }}
        >
          {/* Mandatory Fields Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: "#da2c46", marginBottom: 16 }}>
              Mandatory Information
            </h3>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="fullName"
                  rules={[
                    { required: true, message: "Please enter full name" },
                  ]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Date of Joining"
                  name="dateOfJoining"
                  rules={[
                    {
                      required: true,
                      message: "Please select date of joining",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select date"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Category"
                  name="category"
                  rules={[{ required: true, message: "Please enter category" }]}
                >
                  <Input placeholder="Enter category" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Assigned Job Title"
                  name="assignedJobTitle"
                  rules={[
                    { required: true, message: "Please enter job title" },
                  ]}
                >
                  <Input placeholder="Enter job title" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="ERAM ID"
                  name="eramId"
                  rules={[{ required: true, message: "Please enter ERAM ID" }]}
                >
                  <Input placeholder="Enter ERAM ID" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Official Email Account"
                  name="officialEmail"
                  rules={[
                    { required: true, message: "Please enter official email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="Enter official email" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Optional Basic Fields Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: "#da2c46", marginBottom: 16 }}>
              Optional Basic Information
            </h3>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Badge Number" name="badgeNo">
                  <Input placeholder="Enter badge number" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Gate Pass ID" name="gatePassId">
                  <Input placeholder="Enter gate pass ID" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Aramco ID" name="aramcoId">
                  <Input placeholder="Enter Aramco ID" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Other ID" name="otherId">
                  <Input placeholder="Enter other ID" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Plant ID" name="plantId">
                  <Input placeholder="Enter plant ID" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="External Employee Number"
                  name="externalEmpNo"
                >
                  <Input placeholder="Enter external emp no" maxLength={20} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Iqama ID" name="iqamaId">
                  <Input placeholder="Enter Iqama ID" maxLength={50} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Additional Employee Details Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: "#da2c46", marginBottom: 16 }}>
              Additional Employee Details
            </h3>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Designation" name="designation">
                  <Input placeholder="Enter designation" maxLength={100} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Visa Category" name="visaCategory">
                  <Input placeholder="Enter visa category" maxLength={50} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Employee Group" name="employeeGroup">
                  <Input placeholder="Enter employee group" maxLength={50} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Employee Type" name="employmentType">
                  <Input
                    placeholder="SUPPLIER, INTERNAL, or DIRECT"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Payroll Group" name="payrollGroup">
                  <Input placeholder="Enter payroll group" maxLength={50} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Sponsor Name" name="sponsorName">
                  <Input placeholder="Enter sponsor name" maxLength={100} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Work Hours" name="workHours">
                  <Input
                    type="number"
                    placeholder="Enter work hours (e.g., 8)"
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Work Days" name="workDays">
                  <Input
                    type="number"
                    placeholder="Enter work days (e.g., 5)"
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Air Ticket Frequency"
                  name="airTicketFrequency"
                >
                  <Input
                    placeholder="Enter air ticket frequency"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Probation Period" name="probationPeriod">
                  <Input placeholder="Enter probation period" maxLength={50} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Period of Contract" name="periodOfContract">
                  <Input placeholder="Enter contract period" maxLength={20} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Work Location" name="workLocation">
                  <Input placeholder="Enter work location" maxLength={50} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Family Status" name="familyStatus">
                  <Input placeholder="Family or Single" maxLength={20} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Last Arrival" name="lastArrival">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select last arrival date"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Eligible Vacation Days"
                  name="eligibleVacationDays"
                >
                  <Input
                    type="number"
                    placeholder="Enter vacation days (e.g., 22)"
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Eligible Vacation Month"
                  name="eligibleVacationMonth"
                >
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Enter vacation month (e.g., 11.9)"
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Iqama Details Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: "#da2c46", marginBottom: 16 }}>
              Iqama Details
            </h3>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Iqama Issue Date" name="iqamaIssueDate">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select issue date"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Iqama Expiry Date" name="iqamaExpiryDate">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select expiry date"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Iqama Arabic Date of Issue"
                  name="iqamaArabicDateOfIssue"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select Arabic issue date"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Iqama Arabic Date of Expiry"
                  name="iqamaArabicDateOfExpiry"
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select Arabic expiry date"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Insurance & Benefits Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: "#da2c46", marginBottom: 16 }}>
              Insurance & Benefits
            </h3>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="GOSI" name="gosi">
                  <Input placeholder="Enter GOSI number" maxLength={50} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Driving License" name="drivingLicense">
                  <Input placeholder="Enter driving license" maxLength={50} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={12} md={8}>
                <Form.Item
                  label="Medical Policy"
                  name="medicalPolicy"
                  valuePropName="checked"
                >
                  <Checkbox>Has Medical Policy</Checkbox>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={16}>
                <Form.Item
                  label="Medical Policy Number"
                  name="medicalPolicyNumber"
                >
                  <Input
                    placeholder="Enter medical policy number"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Number of Dependents" name="noOfDependent">
                  <Input
                    type="number"
                    placeholder="Enter number of dependents"
                    maxLength={2}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Insurance Category" name="insuranceCategory">
                  <Input
                    placeholder="Enter insurance category"
                    maxLength={50}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Class Code" name="classCode">
                  <Input placeholder="Enter class code" maxLength={20} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="Asset Allocation (comma-separated)"
                  name="assetAllocation"
                >
                  <Input placeholder="e.g., Laptop, Vehicle, Phone" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Other Information Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: "#da2c46", marginBottom: 16 }}>
              Other Information
            </h3>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Last Working Day" name="lastWorkingDay">
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Select last working day"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12}>
                <Form.Item label="Last Login Time" name="lastLoginTime">
                  <Input placeholder="Enter last login time" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={12} lg={6}>
                <Form.Item
                  label="Reporting And Documentation"
                  name="reportingAndDocumentation"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Enter reporting and documentation details"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={[16, 8]}>
              <Col xs={24} sm={24} md={12}>
                <Form.Item
                  label="First Time Login"
                  name="firstTimeLogin"
                  valuePropName="checked"
                >
                  <Checkbox>First Time Login</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Basic Asset Management: Laptop, Vehicle, etc"
              name="basicAssets"
            >
              <Input.TextArea
                rows={3}
                placeholder="Enter asset management details"
              />
            </Form.Item>
          </div>

          {/* Form Actions */}
          <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
            <Button
              onClick={() => {
                setConvertModalVisible(false);
                convertForm.resetFields();
                setCandidateToConvert(null);
              }}
              style={{ marginRight: 8 }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              style={{ backgroundColor: "#da2c46" }}
              htmlType="submit"
              loading={isConverting}
            >
              Pipeline Completion
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Reject Completed Candidate"
        open={isRejectModalVisible}
        onOk={handleConfirmReject}
        onCancel={() => {
          setIsRejectModalVisible(false);
          setRejectionReason("");
          setCandidateToReject(null);
        }}
        okText="Confirm Rejection"
        cancelText="Cancel"
        okType="danger"
        okButtonProps={{
          loading: isRejecting,
          disabled: !rejectionReason.trim(),
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text strong style={{ fontSize: "16px" }}>
            Are you sure you want to reject this completed candidate?
          </Text>

          {candidateToReject && (
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                backgroundColor: "#f5f5f5",
                borderRadius: "6px",
              }}
            >
              <Text strong>Candidate: </Text>
              <Text>{candidateToReject.user?.fullName}</Text>
              <br />
              <Text strong>Work Order: </Text>
              <Text>{candidateToReject.workOrder?.title}</Text>
              <br />
              <Text strong>Status: </Text>
              <Tag color="success">COMPLETED</Tag>
            </div>
          )}

          <Form.Item
            label="Rejection Reason"
            required
            style={{ marginTop: "16px", marginBottom: "8px" }}
          >
            <Input.TextArea
              rows={4}
              placeholder="Provide detailed reason for rejection (minimum 10 characters)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              backgroundColor: "#fff2f0",
              borderRadius: "6px",
              border: "1px solid #ffccc7",
            }}
          >
            <Text strong style={{ color: "#cf1322" }}>
              ⚠️ Warning
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              This candidate has already completed the pipeline. Rejecting will:
              <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
                <li>Change status from "completed" to "rejected"</li>
                <li>Record this rejection in the system</li>
                <li>Notify the candidate and relevant recruiters</li>
                <li>This action cannot be undone</li>
              </ul>
            </Text>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #fafafa !important;
          font-weight: 600 !important;
        }
        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }
        .ant-pagination-item-active a {
          color: #fff !important;
        }
        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }
        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #da2c46 !important;
        }
        .ant-tabs-ink-bar {
          background-color: #da2c46 !important;
        }
      `}</style>
    </div>
  );
};

export default CompletedCandidates;
