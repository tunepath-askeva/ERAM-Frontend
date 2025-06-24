import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Badge,
  Button,
  Modal,
  Descriptions,
  Steps,
  Tag,
  Space,
  Tabs,
  Upload,
  message,
  Tooltip,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
  Input,
  Select,
  DatePicker,
  Grid,
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
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;
const { TabPane } = Tabs;
const { useBreakpoint } = Grid;

const RecruiterApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [sendToApproverModalVisible, setSendToApproverModalVisible] =
    useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const screens = useBreakpoint();

  // Mock data - replace with actual API calls
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setApprovals(mockApprovals);
      setLoading(false);
    }, 1000);
  }, []);

  const mockApprovals = [
    {
      id: 1,
      candidateName: "John Doe",
      candidateEmail: "john.doe@email.com",
      workOrderId: "WO-2025-001",
      workOrderTitle: "Senior React Developer",
      stageName: "Technical Assessment",
      stageLevel: 2,
      submissionDate: "2025-06-20",
      status: "pending_recruiter_review",
      documents: [
        { name: "Technical_Assessment.pdf", size: "2.5 MB", type: "pdf" },
        { name: "Code_Sample.zip", size: "1.2 MB", type: "zip" },
      ],
      candidateComments:
        "Completed the technical assessment as requested. Please find the code samples attached.",
      approvalFlow: [
        {
          level: 1,
          approver: "Recruiter",
          status: "pending",
          name: "Sarah Wilson",
        },
        {
          level: 2,
          approver: "Technical Lead",
          status: "not_started",
          name: "Mike Johnson",
        },
        {
          level: 3,
          approver: "Hiring Manager",
          status: "not_started",
          name: "Jennifer Smith",
        },
      ],
    },
    {
      id: 2,
      candidateName: "Jane Smith",
      candidateEmail: "jane.smith@email.com",
      workOrderId: "WO-2025-002",
      workOrderTitle: "UI/UX Designer",
      stageName: "Portfolio Review",
      stageLevel: 1,
      submissionDate: "2025-06-19",
      status: "sent_to_approvers",
      documents: [
        { name: "Portfolio.pdf", size: "15.3 MB", type: "pdf" },
        { name: "Design_Samples.figma", size: "8.7 MB", type: "figma" },
      ],
      candidateComments:
        "Here is my latest portfolio with recent design work and case studies.",
      approvalFlow: [
        {
          level: 1,
          approver: "Recruiter",
          status: "approved",
          name: "Sarah Wilson",
          approvedDate: "2025-06-20",
        },
        {
          level: 2,
          approver: "Design Lead",
          status: "pending",
          name: "Alex Chen",
        },
        {
          level: 3,
          approver: "Creative Director",
          status: "not_started",
          name: "Maria Garcia",
        },
      ],
    },
    {
      id: 3,
      candidateName: "Robert Johnson",
      candidateEmail: "robert.j@email.com",
      workOrderId: "WO-2025-003",
      workOrderTitle: "DevOps Engineer",
      stageName: "System Design",
      stageLevel: 3,
      submissionDate: "2025-06-18",
      status: "ready_for_final_approval",
      documents: [
        { name: "System_Architecture.pdf", size: "3.1 MB", type: "pdf" },
        { name: "Infrastructure_Plan.docx", size: "1.8 MB", type: "docx" },
      ],
      candidateComments:
        "System design document with detailed infrastructure planning and scalability considerations.",
      approvalFlow: [
        {
          level: 1,
          approver: "Recruiter",
          status: "approved",
          name: "Sarah Wilson",
          approvedDate: "2025-06-19",
        },
        {
          level: 2,
          approver: "Technical Lead",
          status: "approved",
          name: "David Kim",
          approvedDate: "2025-06-20",
        },
        {
          level: 3,
          approver: "Engineering Manager",
          status: "approved",
          name: "Lisa Brown",
          approvedDate: "2025-06-21",
        },
      ],
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending_recruiter_review: "orange",
      sent_to_approvers: "blue",
      ready_for_final_approval: "green",
      approved: "success",
      rejected: "error",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending_recruiter_review: "Pending Review",
      sent_to_approvers: "With Approvers",
      ready_for_final_approval: "Ready for Final",
      approved: "Approved",
      rejected: "Rejected",
    };
    return texts[status] || status;
  };

  const getApprovalStepStatus = (approvalStatus) => {
    const statusMap = {
      approved: "finish",
      pending: "process",
      rejected: "error",
      not_started: "wait",
    };
    return statusMap[approvalStatus] || "wait";
  };

  const filteredApprovals = approvals.filter((approval) => {
    switch (activeTab) {
      case "pending":
        return approval.status === "pending_recruiter_review";
      case "in_progress":
        return approval.status === "sent_to_approvers";
      case "ready":
        return approval.status === "ready_for_final_approval";
      case "completed":
        return approval.status === "approved";
      default:
        return true;
    }
  });

  const responsiveColumns = () => {
    const baseColumns = [
      {
        title: "Candidate",
        dataIndex: "candidateName",
        key: "candidateName",
        render: (text, record) => (
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <div style={{ fontWeight: 500 }}>{text}</div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.candidateEmail}
              </Text>
            </div>
          </Space>
        ),
      },
      {
        title: "Work Order",
        dataIndex: "workOrderTitle",
        key: "workOrderTitle",
        render: (text, record) => (
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.workOrderId}
            </Text>
          </div>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => (
          <Badge status={getStatusColor(status)} text={getStatusText(status)} />
        ),
      },
      {
        title: "Stage",
        dataIndex: "stageName",
        key: "stageName",
        render: (text, record) => (
          <Tag color="blue">
            {text} (Level {record.stageLevel})
          </Tag>
        ),
      },
      {
        title: "Submitted",
        dataIndex: "submissionDate",
        key: "submissionDate",
        render: (date) => new Date(date).toLocaleDateString(),
      },
      {
        title: "Docs",
        dataIndex: "documents",
        key: "documents",
        render: (documents) => (
          <Tooltip title={`${documents.length} document(s)`}>
            <FileTextOutlined /> {documents.length}
          </Tooltip>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="middle">
            <Button
              type={screens.xs ? "text" : "primary"}
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size="small"
            >
              {screens.xs ? null : "View"}
            </Button>
            {record.status === "pending_recruiter_review" && (
              <Button
                type={screens.xs ? "text" : "default"}
                icon={<SendOutlined />}
                onClick={() => handleSendToApprovers(record)}
                size="small"
              >
                {screens.xs ? null : "Send"}
              </Button>
            )}
            {record.status === "ready_for_final_approval" && (
              <Button
                type={screens.xs ? "text" : "primary"}
                icon={<CheckCircleOutlined />}
                onClick={() => handleFinalApproval(record)}
                size="small"
              >
                {screens.xs ? null : "Approve"}
              </Button>
            )}
          </Space>
        ),
      },
    ];

    const fullColumns = [
      ...baseColumns,
      {
        title: "Stage",
        dataIndex: "stageName",
        key: "stageName",
        render: (text, record) => (
          <Tag color="blue">
            {text} (Level {record.stageLevel})
          </Tag>
        ),
      },
      {
        title: "Submitted",
        dataIndex: "submissionDate",
        key: "submissionDate",
        render: (date) => new Date(date).toLocaleDateString(),
      },
      {
        title: "Docs",
        dataIndex: "documents",
        key: "documents",
        render: (documents) => (
          <Tooltip title={`${documents.length} document(s)`}>
            <FileTextOutlined /> {documents.length}
          </Tooltip>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space size="middle">
            <Button
              type={screens.xs ? "text" : "primary"}
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              size="small"
            >
              {screens.xs ? null : "View"}
            </Button>
            {record.status === "pending_recruiter_review" && (
              <Button
                type={screens.xs ? "text" : "default"}
                icon={<SendOutlined />}
                onClick={() => handleSendToApprovers(record)}
                size="small"
              >
                {screens.xs ? null : "Send"}
              </Button>
            )}
            {record.status === "ready_for_final_approval" && (
              <Button
                type={screens.xs ? "text" : "primary"}
                icon={<CheckCircleOutlined />}
                onClick={() => handleFinalApproval(record)}
                size="small"
              >
                {screens.xs ? null : "Approve"}
              </Button>
            )}
          </Space>
        ),
      },
    ];

    if (screens.xs) {
      return baseColumns;
    } else if (screens.sm) {
      return baseColumns.filter(
        (col) => col.key !== "stageName" && col.key !== "submissionDate"
      );
    } else if (screens.md) {
      return baseColumns.filter((col) => col.key !== "submissionDate");
    } else {
      return baseColumns;
    }
  };

  const handleViewDetails = (record) => {
    setSelectedApproval(record);
    setDetailsModalVisible(true);
  };

  const handleSendToApprovers = (record) => {
    setSelectedApproval(record);
    setSendToApproverModalVisible(true);
  };

  const handleFinalApproval = (record) => {
    Modal.confirm({
      title: "Final Approval",
      content: `Are you sure you want to give final approval for ${record.candidateName}'s ${record.stageName} stage?`,
      onOk: () => {
        // Update the approval status
        const updatedApprovals = approvals.map((approval) =>
          approval.id === record.id
            ? { ...approval, status: "approved" }
            : approval
        );
        setApprovals(updatedApprovals);
        message.success("Stage approved successfully!");
      },
    });
  };

  const handleSendToApproversSubmit = (values) => {
    // Update the approval status
    const updatedApprovals = approvals.map((approval) =>
      approval.id === selectedApproval.id
        ? { ...approval, status: "sent_to_approvers" }
        : approval
    );
    setApprovals(updatedApprovals);
    setSendToApproverModalVisible(false);
    message.success("Sent to approvers successfully!");
  };

  const handleDownloadDocument = (document) => {
    message.info(`Downloading ${document.name}...`);
    // Implement actual download logic here
  };

  return (
    <div style={{ padding: screens.xs ? "12px" : "24px" }}>
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: "24px" }}
      >
        <Col>
          <Title level={screens.xs ? 4 : 2}>Recruiter Approvals</Title>
          <Text type="secondary">Review and manage candidate submissions</Text>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabPosition={screens.xs ? "top" : "top"}
          size={screens.xs ? "small" : "default"}
        >
          <TabPane
            tab={screens.xs ? "Pending" : "Pending Review"}
            key="pending"
          >
            <Table
              columns={responsiveColumns()}
              dataSource={filteredApprovals}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              size={screens.xs ? "small" : "default"}
            />
          </TabPane>
          <TabPane
            tab={screens.xs ? "In Progress" : "In Progress"}
            key="in_progress"
          >
            <Table
              columns={responsiveColumns()}
              dataSource={filteredApprovals}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              size={screens.xs ? "small" : "default"}
            />
          </TabPane>
          <TabPane tab={screens.xs ? "Ready" : "Ready for Final"} key="ready">
            <Table
              columns={responsiveColumns()}
              dataSource={filteredApprovals}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              size={screens.xs ? "small" : "default"}
            />
          </TabPane>
          <TabPane tab={screens.xs ? "Done" : "Completed"} key="completed">
            <Table
              columns={responsiveColumns()}
              dataSource={filteredApprovals}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
              size={screens.xs ? "small" : "default"}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Details Modal */}
      <Modal
        title="Approval Details"
        visible={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={null}
        width={screens.xs ? "100%" : 800}
        style={{ top: screens.xs ? 0 : undefined }}
        bodyStyle={{ padding: screens.xs ? "12px" : "24px" }}
      >
        {selectedApproval && (
          <div>
            <Descriptions
              title="Candidate Info"
              bordered
              column={screens.xs ? 1 : 2}
              size={screens.xs ? "small" : "default"}
            >
              <Descriptions.Item label="Name">
                {selectedApproval.candidateName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedApproval.candidateEmail}
              </Descriptions.Item>
              <Descriptions.Item label="Work Order">
                {selectedApproval.workOrderTitle}
              </Descriptions.Item>
              <Descriptions.Item label="Work Order ID">
                {selectedApproval.workOrderId}
              </Descriptions.Item>
              <Descriptions.Item label="Stage">
                {selectedApproval.stageName}
              </Descriptions.Item>
              <Descriptions.Item label="Stage Level">
                {selectedApproval.stageLevel}
              </Descriptions.Item>
              <Descriptions.Item label="Submitted">
                {new Date(selectedApproval.submissionDate).toLocaleDateString()}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge
                  status={getStatusColor(selectedApproval.status)}
                  text={getStatusText(selectedApproval.status)}
                />
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={5}>Candidate Comments</Title>
            <Card size="small" style={{ marginBottom: "16px" }}>
              <Text>{selectedApproval.candidateComments}</Text>
            </Card>

            <Title level={5}>Documents</Title>
            <div style={{ marginBottom: "16px" }}>
              {selectedApproval.documents.map((doc, index) => (
                <Card key={index} size="small" style={{ marginBottom: "8px" }}>
                  <Row justify="space-between" align="middle">
                    <Col flex="auto">
                      <Space>
                        <FileTextOutlined />
                        <span style={{ wordBreak: "break-word" }}>
                          {doc.name}
                        </span>
                        <Text type="secondary">({doc.size})</Text>
                      </Space>
                    </Col>
                    <Col>
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownloadDocument(doc)}
                        size="small"
                      >
                        {screens.xs ? null : "Download"}
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>

            <Title level={5}>Approval Flow</Title>
            <Steps
              direction={screens.xs ? "horizontal" : "vertical"}
              current={selectedApproval.approvalFlow.findIndex(
                (step) => step.status === "pending"
              )}
              responsive={false}
            >
              {selectedApproval.approvalFlow.map((step, index) => (
                <Step
                  key={index}
                  title={
                    screens.xs
                      ? step.approver
                      : `${step.approver} - ${step.name}`
                  }
                  status={getApprovalStepStatus(step.status)}
                  description={
                    !screens.xs &&
                    (step.status === "approved"
                      ? `Approved on ${step.approvedDate}`
                      : step.status === "pending"
                      ? "Awaiting approval"
                      : "Not started")
                  }
                />
              ))}
            </Steps>
          </div>
        )}
      </Modal>

      {/* Send to Approvers Modal */}
      <Modal
        title="Send to Approvers"
        visible={sendToApproverModalVisible}
        onCancel={() => setSendToApproverModalVisible(false)}
        onOk={() => handleSendToApproversSubmit()}
        okText="Send to Approvers"
        width={screens.xs ? "90%" : "50%"}
      >
        {selectedApproval && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Candidate
              </label>
              <Input value={selectedApproval.candidateName} disabled />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Stage
              </label>
              <Input value={selectedApproval.stageName} disabled />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Recruiter Comments <span style={{ color: "red" }}>*</span>
              </label>
              <TextArea
                rows={4}
                placeholder="Add your review comments for the approvers..."
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 500,
                }}
              >
                Priority
              </label>
              <Select style={{ width: "100%" }} defaultValue="normal">
                <Select.Option value="low">Low</Select.Option>
                <Select.Option value="normal">Normal</Select.Option>
                <Select.Option value="high">High</Select.Option>
                <Select.Option value="urgent">Urgent</Select.Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecruiterApprovals;
