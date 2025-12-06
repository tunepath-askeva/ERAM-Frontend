import React, { useState, useEffect } from "react";
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
  Drawer,
  Dropdown,
  Card,
  Tag,
  Empty,
  Row,
  Col,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  MoreOutlined,
  CommentOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ProjectOutlined,
  MailOutlined,
} from "@ant-design/icons";
import {
  useGetRequisitionApprovalsQuery,
  useApproveRejectRequisitionMutation,
} from "../../Slices/Recruiter/RecruiterApis";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

const RequisitionApprovals = ({ isActive }) => {
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionComments, setActionComments] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const screens = useBreakpoint();
  const isMobile = screens.xs;
  const isTablet = screens.sm || screens.md;
  const isDesktop = screens.lg || screens.xl;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setPage(1); // Reset to first page on new search
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  const {
    data: response,
    isLoading,
    refetch,
  } = useGetRequisitionApprovalsQuery(
    {
      page,
      limit: pageSize,
      search: debouncedSearchTerm,
    },
    {
      skip: !isActive,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );

  const [approveRejectRequisition, { isLoading: isProcessing }] =
    useApproveRejectRequisitionMutation();

  // Extract approvals array from response
  const approvals = response?.approvals || [];

  useEffect(() => {
    if (isActive && !hasLoaded) {
      refetch().then(() => setHasLoaded(true));
    }
  }, [isActive, hasLoaded, refetch]);

  const getTableData = () => {
    if (!Array.isArray(approvals) || approvals.length === 0) {
      return [];
    }

    return approvals.map((approval) => ({
      key: approval._id,
      id: approval._id,
      requisitionId: approval.requisition?._id || "N/A",
      requisitionNo: approval.requisition?.requisitionNo || "N/A",
      requisitionTitle: approval.requisition?.title || "N/A",
      recruiterId: approval.recruiter || "N/A",
      action: approval.action,
      remark: approval.remark || "",
      actionAt: approval.actionAt,
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      requisition: approval.requisition, // Full requisition object
      rawData: approval, // Keep original data for reference
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "orange",
      approved: "green",
      rejected: "red",
      completed: "green",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const getStatusText = (status) => {
    const texts = {
      pending: "Pending Review",
      approved: "Approved",
      rejected: "Rejected",
      completed: "Completed",
    };
    return texts[status?.toLowerCase()] || status || "Unknown";
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <ClockCircleOutlined />,
      approved: <CheckCircleOutlined />,
      rejected: <CloseCircleOutlined />,
    };
    return icons[status?.toLowerCase()] || <ClockCircleOutlined />;
  };

  const getActionsMenu = (record) => ({
    items: [
      {
        key: "view",
        icon: <EyeOutlined />,
        label: "View Details",
        onClick: () => handleViewDetails(record),
      },
      ...(record.action === "pending"
        ? [
            {
              key: "approve",
              icon: <CheckCircleOutlined />,
              label: "Approve",
              onClick: () => handleOpenActionModal(record, "approved"),
            },
            {
              key: "reject",
              icon: <CloseCircleOutlined />,
              label: "Reject",
              onClick: () => handleOpenActionModal(record, "rejected"),
            },
          ]
        : []),
    ],
  });

  const formatId = (id, length = 8) => {
    if (!id) return "N/A";
    return isMobile ? `...${id.slice(-length)}` : id;
  };

  const getColumns = () => {
    return [
      {
        title: "Requisition No",
        dataIndex: "requisitionNo",
        key: "requisitionNo",
        width: isMobile ? 120 : isTablet ? 150 : 180,
        ellipsis: true,
        render: (text) => (
          <Tooltip title={text}>
            <Text
              strong
              style={{
                fontSize: isMobile ? "11px" : isTablet ? "12px" : "13px",
                color: "#1890ff",
              }}
            >
              {text}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: "Requisition Title",
        dataIndex: "requisitionTitle",
        key: "requisitionTitle",
        width: isMobile ? 150 : isTablet ? 180 : 220,
        ellipsis: true,
        render: (text) => (
          <Tooltip title={text}>
            <Text
              style={{
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                fontWeight: 500,
              }}
            >
              {text}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: "Status",
        dataIndex: "action",
        key: "action",
        width: isMobile ? 110 : isTablet ? 130 : 150,
        render: (status) => {
          const statusText = getStatusText(status);
          const statusColor = getStatusColor(status);

          return (
            <Tag
              icon={getStatusIcon(status)}
              color={statusColor}
              style={{
                fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                fontWeight: 500,
              }}
            >
              {isMobile ? statusText.split(" ")[0] : statusText}
            </Tag>
          );
        },
      },
      {
        title: "Submitted",
        dataIndex: "createdAt",
        key: "createdAt",
        width: isMobile ? 100 : isTablet ? 120 : 140,
        render: (date) => {
          if (!date) return "N/A";
          return (
            <Tooltip title={new Date(date).toLocaleString()}>
              <Text
                style={{
                  fontSize: isMobile ? "10px" : isTablet ? "11px" : "12px",
                }}
              >
                {new Date(date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: isMobile ? "2-digit" : "numeric",
                })}
              </Text>
            </Tooltip>
          );
        },
      },
      {
        title: "Actions",
        key: "actions",
        width: isMobile ? 80 : isTablet ? 180 : 220,
        fixed: "right",
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
                  style={{
                    color: "#da2c46",
                    border: "1px solid #da2c46",
                  }}
                />
              </Dropdown>
            ) : (
              <Space size="small" wrap>
                <Button
                  type="default"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetails(record)}
                  size={isTablet ? "small" : "default"}
                  style={{
                    fontSize: isTablet ? "11px" : "12px",
                  }}
                >
                  View
                </Button>
                {record.action === "pending" && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() => handleOpenActionModal(record, "approved")}
                      size={isTablet ? "small" : "default"}
                      style={{
                        backgroundColor: "#52c41a",
                        borderColor: "#52c41a",
                        fontSize: isTablet ? "11px" : "12px",
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      onClick={() => handleOpenActionModal(record, "rejected")}
                      size={isTablet ? "small" : "default"}
                      style={{
                        fontSize: isTablet ? "11px" : "12px",
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </Space>
            )}
          </div>
        ),
      },
    ];
  };

  const handleViewDetails = (record) => {
    setSelectedApproval(record);
    setDetailsModalVisible(true);
  };

  const handleOpenActionModal = (record, type) => {
    setSelectedApproval(record);
    setActionType(type);
    setActionModalVisible(true);
  };

  const handleActionSubmit = async () => {
    try {
      if (!selectedApproval) return;

      // Validate rejection comments
      if (actionType === "rejected" && !actionComments.trim()) {
        message.warning("Please provide rejection comments");
        return;
      }

      await approveRejectRequisition({
        notificationId: selectedApproval.id,
        requisitionId: selectedApproval.requisitionId,
        status: actionType,
        remarks: actionComments,
      }).unwrap();

      message.success(
        `Requisition ${
          actionType === "approved" ? "approved" : "rejected"
        } successfully!`
      );

      setActionModalVisible(false);
      setActionComments("");
      setActionType(null);
      setSelectedApproval(null);
      setHasLoaded(false);
      await refetch();
      setHasLoaded(true);
    } catch (error) {
      message.error(
        error.data?.message || `Failed to ${actionType} requisition`
      );
      console.error("Action error:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getModalWidth = () => {
    if (isMobile) return "95%";
    if (isTablet) return "85%";
    return 900;
  };

  const getTableHeight = () => {
    if (isMobile) return 400;
    if (isTablet) return 500;
    return 600;
  };

  const getTableScrollConfig = () => {
    const totalWidth = isMobile ? 770 : isTablet ? 990 : 1190;
    return {
      x: totalWidth,
      y: getTableHeight(),
    };
  };

  const tableData = getTableData();

  return (
    <div>
      {/* Search Bar */}
      <Card
        style={{
          marginBottom: "16px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div>
          <Text
            strong
            style={{ fontSize: "16px", marginBottom: "8px", display: "block" }}
          >
            Search Requisition Approvals
          </Text>
          <Input.Search
            placeholder="Search by requisition number or title..."
            allowClear
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={(value) => setSearchTerm(value)}
            style={{ width: "100%" }}
            size="large"
            prefix={<FileTextOutlined style={{ color: "#da2c46" }} />}
            loading={isLoading}
          />
          {debouncedSearchTerm && (
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Searching for: "{debouncedSearchTerm}"
                <Button
                  type="link"
                  size="small"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setPage(1);
                  }}
                  style={{ padding: "0 4px", fontSize: "12px" }}
                >
                  Clear
                </Button>
              </Text>
            </div>
          )}
        </div>
      </Card>

      <Table
        columns={getColumns()}
        dataSource={hasLoaded ? tableData : []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: response?.meta?.total || 0,
          showQuickJumper: isDesktop,
          size: isMobile ? "small" : "default",
          showTotal: (total) =>
            `Total ${total} approval${total !== 1 ? "s" : ""}`,
          onChange: (newPage, newPageSize) => {
            setPage(newPage);
            setPageSize(newPageSize);
          },
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={getTableScrollConfig()}
        size={isMobile ? "small" : isTablet ? "small" : "default"}
        rowClassName="table-row-hover"
        className="responsive-table"
        locale={{
          emptyText: (
            <Empty
              description="No requisition approvals found"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />

      {/* Details Modal/Drawer */}
      {isMobile ? (
        <Drawer
          title={
            <Title level={5} style={{ margin: 0 }}>
              Requisition Approval Details
            </Title>
          }
          placement="bottom"
          visible={detailsModalVisible}
          onClose={() => setDetailsModalVisible(false)}
          height="90%"
          extra={
            selectedApproval?.action === "pending" && (
              <Space size="small">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setDetailsModalVisible(false);
                    handleOpenActionModal(selectedApproval, "approved");
                  }}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  Approve
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setDetailsModalVisible(false);
                    handleOpenActionModal(selectedApproval, "rejected");
                  }}
                >
                  Reject
                </Button>
              </Space>
            )
          }
        >
          {selectedApproval && (
            <div style={{ padding: "8px 0" }}>
              <RequisitionDetailsContent
                approval={selectedApproval}
                isMobile={isMobile}
                isTablet={isTablet}
                formatDate={formatDate}
                getStatusText={getStatusText}
                getStatusColor={getStatusColor}
              />
            </div>
          )}
        </Drawer>
      ) : (
        <Modal
          title={
            <Title level={4} style={{ margin: 0 }}>
              Requisition Approval Details
            </Title>
          }
          visible={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailsModalVisible(false)}>
              Close
            </Button>,
            selectedApproval?.action === "pending" && (
              <Space key="actions" size="small">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    setDetailsModalVisible(false);
                    handleOpenActionModal(selectedApproval, "approved");
                  }}
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                  }}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setDetailsModalVisible(false);
                    handleOpenActionModal(selectedApproval, "rejected");
                  }}
                >
                  Reject
                </Button>
              </Space>
            ),
          ]}
          width={getModalWidth()}
          style={{ top: isTablet ? 20 : undefined }}
          bodyStyle={{
            maxHeight: "70vh",
            overflow: "auto",
          }}
        >
          {selectedApproval && (
            <RequisitionDetailsContent
              approval={selectedApproval}
              isMobile={isMobile}
              isTablet={isTablet}
              formatDate={formatDate}
              getStatusText={getStatusText}
              getStatusColor={getStatusColor}
            />
          )}
        </Modal>
      )}

      {/* Action Modal (Approve/Reject) */}
      <Modal
        title={
          <Title level={4} style={{ margin: 0 }}>
            {actionType === "approved" ? "Approve" : "Reject"} Requisition
          </Title>
        }
        visible={actionModalVisible}
        onCancel={() => {
          setActionModalVisible(false);
          setActionComments("");
          setActionType(null);
        }}
        onOk={handleActionSubmit}
        confirmLoading={isProcessing}
        okText={actionType === "approved" ? "Approve" : "Reject"}
        okButtonProps={{
          danger: actionType === "rejected",
          type: "primary",
          style:
            actionType === "approved"
              ? { backgroundColor: "#52c41a", borderColor: "#52c41a" }
              : undefined,
        }}
        width={isMobile ? "95%" : isTablet ? "80%" : "50%"}
      >
        {selectedApproval && (
          <div>
            <Space direction="vertical" style={{ width: "100%" }} size="medium">
              <div>
                <Text strong>Requisition No: </Text>
                <Text code copyable>
                  {selectedApproval.requisitionNo}
                </Text>
              </div>
              <div>
                <Text strong>Requisition Title: </Text>
                <Text>{selectedApproval.requisitionTitle}</Text>
              </div>
              <div>
                <Text strong>Current Status: </Text>
                <Tag color={getStatusColor(selectedApproval.action)}>
                  {getStatusText(selectedApproval.action)}
                </Tag>
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
                {actionType === "approved" ? "Approval" : "Rejection"} Remarks{" "}
                {actionType === "rejected" && (
                  <span style={{ color: "#ff4d4f" }}>*</span>
                )}
              </label>
              <TextArea
                rows={4}
                placeholder={`Add your ${
                  actionType === "approved" ? "approval" : "rejection"
                } remarks${actionType === "rejected" ? " (required)" : ""}...`}
                value={actionComments}
                onChange={(e) => setActionComments(e.target.value)}
                status={
                  actionType === "rejected" && !actionComments.trim()
                    ? "error"
                    : ""
                }
              />
            </div>

            {actionType === "rejected" && (
              <Text type="danger" style={{ fontSize: "12px" }}>
                <strong>Note:</strong> Rejection remarks are required to
                proceed.
              </Text>
            )}
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
          vertical-align: middle;
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

        .responsive-table .ant-table-container {
          border: 1px solid #f0f0f0;
          border-radius: 8px;
        }

        .responsive-table .ant-table-body {
          overflow: auto !important;
        }

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

        @media (max-width: 576px) {
          .responsive-table .ant-table-container {
            font-size: 11px;
          }

          .responsive-table .ant-table-tbody > tr > td,
          .responsive-table .ant-table-thead > tr > th {
            padding: 6px 4px;
          }
        }

        @media (min-width: 577px) and (max-width: 992px) {
          .responsive-table .ant-table-tbody > tr > td,
          .responsive-table .ant-table-thead > tr > th {
            padding: 8px 6px;
          }
        }

        .responsive-table .ant-table-thead > tr > th {
          position: sticky;
          top: 0;
          z-index: 1;
        }
      `}</style>
    </div>
  );
};

// Separate Details Component
const RequisitionDetailsContent = ({
  approval,
  isMobile,
  isTablet,
  formatDate,
  getStatusText,
  getStatusColor,
}) => {
  if (!approval || !approval.requisition) {
    return (
      <Empty
        description="No approval data available"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  const req = approval.requisition;

  return (
    <div>
      {/* Approval Information */}
      <Card
        title={
          <Title
            level={5}
            style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
          >
            Approval Information
          </Title>
        }
        style={{ marginBottom: "16px" }}
        size={isMobile ? "small" : "default"}
      >
        <Descriptions
          bordered
          column={isMobile ? 1 : 2}
          size={isMobile ? "small" : "default"}
        >
          <Descriptions.Item label="Status">
            <Tag color={getStatusColor(approval.action)}>
              {getStatusText(approval.action)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Action Date">
            {formatDate(approval.actionAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Created Date">
            {formatDate(approval.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated">
            {formatDate(approval.updatedAt)}
          </Descriptions.Item>
          {approval.remark && (
            <Descriptions.Item label="Remarks" span={isMobile ? 1 : 2}>
              <Text>{approval.remark}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Requisition Information */}
      <Card
        title={
          <Title
            level={5}
            style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
          >
            <FileTextOutlined style={{ marginRight: 8 }} />
            Requisition Information
          </Title>
        }
        style={{ marginBottom: "16px" }}
        size={isMobile ? "small" : "default"}
      >
        <Descriptions
          bordered
          column={isMobile ? 1 : 2}
          size={isMobile ? "small" : "default"}
        >
          <Descriptions.Item label="Requisition No">
            <Text code strong copyable>
              {req.requisitionNo}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Reference No">
            <Text>{req.referenceNo}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Title" span={isMobile ? 1 : 2}>
            <Text strong>{req.title}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={req.isActive === "active" ? "green" : "red"}>
              {req.isActive?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Overall Approval">
            <Tag color={getStatusColor(req.overallapprovalstatus)}>
              {req.overallapprovalstatus?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Employment Type">
            <Tag>{req.EmploymentType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Workplace">
            <Tag icon={<EnvironmentOutlined />}>{req.workplace}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Office Location" span={isMobile ? 1 : 2}>
            <Text>{req.officeLocation}</Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Job Details */}
      <Card
        title={
          <Title
            level={5}
            style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
          >
            <ProjectOutlined style={{ marginRight: 8 }} />
            Job Details
          </Title>
        }
        style={{ marginBottom: "16px" }}
        size={isMobile ? "small" : "default"}
      >
        <Descriptions
          bordered
          column={isMobile ? 1 : 2}
          size={isMobile ? "small" : "default"}
        >
          <Descriptions.Item label="Job Function" span={isMobile ? 1 : 2}>
            <Text>{req.jobFunction}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Industry" span={isMobile ? 1 : 2}>
            <Text>{req.companyIndustry}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Education">
            <Tag>{req.Education}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Qualification">
            <Text>{req.qualification}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Experience">
            <Text>
              {req.experienceMin} - {req.experienceMax} years
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Candidates Required">
            <Text strong>{req.numberOfCandidate}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={isMobile ? 1 : 2}>
            <Paragraph
              ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
              style={{ margin: 0 }}
            >
              {req.description}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item label="Requirements" span={isMobile ? 1 : 2}>
            <Paragraph
              ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
              style={{ margin: 0 }}
            >
              {req.jobRequirements}
            </Paragraph>
          </Descriptions.Item>
          <Descriptions.Item
            label="Key Responsibilities"
            span={isMobile ? 1 : 2}
          >
            <Paragraph
              ellipsis={{ rows: 3, expandable: true, symbol: "more" }}
              style={{ margin: 0 }}
            >
              {req.keyResponsibilities}
            </Paragraph>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Salary & Benefits */}
      <Card
        title={
          <Title
            level={5}
            style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
          >
            <DollarOutlined style={{ marginRight: 8 }} />
            Salary & Benefits
          </Title>
        }
        style={{ marginBottom: "16px" }}
        size={isMobile ? "small" : "default"}
      >
        <Descriptions
          bordered
          column={isMobile ? 1 : 2}
          size={isMobile ? "small" : "default"}
        >
          <Descriptions.Item label="Salary Type">
            <Tag>{req.salaryType}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Salary Range">
            <Text strong>
              {req.salaryMin} - {req.salaryMax}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Benefits" span={isMobile ? 1 : 2}>
            {req.benefits && req.benefits.length > 0 ? (
              <Space wrap>
                {req.benefits.map((benefit, index) => (
                  <Tag key={index} color="blue">
                    {benefit}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No benefits listed</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Requirements & Skills */}
      <Card
        title={
          <Title
            level={5}
            style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
          >
            Requirements & Skills
          </Title>
        }
        style={{ marginBottom: "16px" }}
        size={isMobile ? "small" : "default"}
      >
        <Descriptions
          bordered
          column={isMobile ? 1 : 2}
          size={isMobile ? "small" : "default"}
        >
          <Descriptions.Item label="Nationality">
            <Text>{req.nationality}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Visa Category">
            <Text>{req.visacategory}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Visa Type">
            <Tag>{req.visacategorytype}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Languages" span={isMobile ? 1 : 1}>
            {req.languagesRequired && req.languagesRequired.length > 0 ? (
              <Space wrap>
                {req.languagesRequired.map((lang, index) => (
                  <Tag key={index} color="purple">
                    {lang}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">Not specified</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Required Skills" span={isMobile ? 1 : 2}>
            {req.requiredSkills && req.requiredSkills.length > 0 ? (
              <Space wrap>
                {req.requiredSkills.map((skill, index) => (
                  <Tag key={index} color="green">
                    {skill}
                  </Tag>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No skills specified</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Dates */}
      <Card
        title={
          <Title
            level={5}
            style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
          >
            <CalendarOutlined style={{ marginRight: 8 }} />
            Important Dates
          </Title>
        }
        style={{ marginBottom: "16px" }}
        size={isMobile ? "small" : "default"}
      >
        <Descriptions
          bordered
          column={isMobile ? 1 : 2}
          size={isMobile ? "small" : "default"}
        >
          <Descriptions.Item label="Start Date">
            {formatDate(req.startDate)}
          </Descriptions.Item>
          <Descriptions.Item label="End Date">
            {formatDate(req.endDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Deadline Date">
            {formatDate(req.deadlineDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Alert Date">
            {formatDate(req.alertDate)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Client & Creator Info */}
      <Card
        title={
          <Title
            level={5}
            style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
          >
            <TeamOutlined style={{ marginRight: 8 }} />
            People Involved
          </Title>
        }
        style={{ marginBottom: "16px" }}
        size={isMobile ? "small" : "default"}
      >
        <Descriptions bordered column={1} size={isMobile ? "small" : "default"}>
          <Descriptions.Item label="Client">
            {req.client ? (
              <Space>
                <Avatar icon={<UserOutlined />} size="small" />
                <div>
                  <Text strong>{req.client.fullName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    <MailOutlined /> {req.client.email}
                  </Text>
                </div>
              </Space>
            ) : (
              <Text type="secondary">Not assigned</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {req.createdBy ? (
              <Space>
                <Avatar icon={<UserOutlined />} size="small" />
                <div>
                  <Text strong>{req.createdBy.fullName}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    <MailOutlined /> {req.createdBy.email}
                  </Text>
                </div>
              </Space>
            ) : (
              <Text type="secondary">Unknown</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned Recruiters">
            {req.assignedRecruiters && req.assignedRecruiters.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {req.assignedRecruiters.map((recruiter) => (
                  <Space key={recruiter._id}>
                    <Avatar
                      icon={<UserOutlined />}
                      size="small"
                      style={{ backgroundColor: "#1890ff" }}
                    />
                    <div>
                      <Text>{recruiter.fullName}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        <MailOutlined /> {recruiter.email}
                      </Text>
                    </div>
                  </Space>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No recruiters assigned</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Approval Recruiters">
            {req.approvalRecruiter && req.approvalRecruiter.length > 0 ? (
              <Space direction="vertical" style={{ width: "100%" }}>
                {req.approvalRecruiter.map((recruiter) => (
                  <Space key={recruiter._id}>
                    <Avatar
                      icon={<UserOutlined />}
                      size="small"
                      style={{ backgroundColor: "#52c41a" }}
                    />
                    <div>
                      <Text>{recruiter.fullName}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        <MailOutlined /> {recruiter.email}
                      </Text>
                    </div>
                  </Space>
                ))}
              </Space>
            ) : (
              <Text type="secondary">No approval recruiters</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Approval Remarks Section */}
      {req.approvalRemarks && req.approvalRemarks.length > 0 && (
        <Card
          title={
            <Title
              level={5}
              style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
            >
              <CommentOutlined style={{ marginRight: 8 }} />
              Approval Remarks History
            </Title>
          }
          style={{ marginBottom: "16px" }}
          size={isMobile ? "small" : "default"}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            {req.approvalRemarks.map((remark, index) => {
              // Find the recruiter from approvalRecruiter array
              const recruiter = req.approvalRecruiter?.find(
                (r) => r._id === remark.recruiterId
              );

              return (
                <Card
                  key={remark._id || index}
                  size="small"
                  style={{
                    backgroundColor:
                      remark.approvalstatus === "approved"
                        ? "#f6ffed"
                        : remark.approvalstatus === "rejected"
                        ? "#fff1f0"
                        : "#f0f0f0",
                    borderLeft: `4px solid ${
                      remark.approvalstatus === "approved"
                        ? "#52c41a"
                        : remark.approvalstatus === "rejected"
                        ? "#ff4d4f"
                        : "#d9d9d9"
                    }`,
                  }}
                >
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    size="small"
                  >
                    <Space>
                      <Avatar
                        icon={<UserOutlined />}
                        size="small"
                        style={{
                          backgroundColor:
                            remark.approvalstatus === "approved"
                              ? "#52c41a"
                              : remark.approvalstatus === "rejected"
                              ? "#ff4d4f"
                              : "#8c8c8c",
                        }}
                      />
                      <div>
                        <Text strong>
                          {recruiter?.fullName || "Unknown Recruiter"}
                        </Text>
                        {recruiter?.email && (
                          <>
                            <br />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              <MailOutlined /> {recruiter.email}
                            </Text>
                          </>
                        )}
                      </div>
                    </Space>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Tag
                        color={
                          remark.approvalstatus === "approved"
                            ? "green"
                            : remark.approvalstatus === "rejected"
                            ? "red"
                            : "default"
                        }
                        icon={
                          remark.approvalstatus === "approved" ? (
                            <CheckCircleOutlined />
                          ) : remark.approvalstatus === "rejected" ? (
                            <CloseCircleOutlined />
                          ) : (
                            <ClockCircleOutlined />
                          )
                        }
                      >
                        {remark.approvalstatus?.toUpperCase() || "PENDING"}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        <CalendarOutlined /> {formatDate(remark.date)}
                      </Text>
                    </div>

                    {remark.remark && (
                      <Paragraph
                        style={{
                          margin: 0,
                          padding: "8px",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          fontSize: isMobile ? "12px" : "14px",
                        }}
                      >
                        <Text strong>Remarks: </Text>
                        {remark.remark}
                      </Paragraph>
                    )}
                  </Space>
                </Card>
              );
            })}
          </Space>
        </Card>
      )}

      {/* Additional Information */}
      <Card
        title={
          <Title
            level={5}
            style={{ fontSize: isMobile ? "14px" : "16px", margin: 0 }}
          >
            Additional Information
          </Title>
        }
        size={isMobile ? "small" : "default"}
      >
        <Descriptions
          bordered
          column={isMobile ? 1 : 2}
          size={isMobile ? "small" : "default"}
        >
          <Descriptions.Item label="Is Common">
            <Tag color={req.isCommon ? "green" : "default"}>
              {req.isCommon ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Converted to Work Order">
            <Tag color={req.convertedToWorkorder ? "green" : "default"}>
              {req.convertedToWorkorder ? "Yes" : "No"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {formatDate(req.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {formatDate(req.updatedAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default RequisitionApprovals;
