import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  Alert,
  Tag,
  Avatar,
  Space,
  Tooltip,
  notification,
  Typography,
  Card,
} from "antd";
import {
  BellOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  useGetExpiredDocumentsQuery,
  useBulkNotifyExpiredDocumentsMutation,
  useSingleNotifyExpiredDocumentMutation,
} from "../../Slices/Employee/EmployeeApis";

const { TextArea } = Input;
const { Text, Title } = Typography;

const EmployeeAdminExpiredDocuments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [notificationData, setNotificationData] = useState({
    subject: "Document Expiry Notification",
    description:
      "Your document has expired or is about to expire. Please renew it as soon as possible to avoid any compliance issues.",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 2500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isFetching } = useGetExpiredDocumentsQuery({
    search: debouncedSearch,
    page: currentPage,
    limit: pageSize,
  });

  const [bulkNotify] = useBulkNotifyExpiredDocumentsMutation();
  const [singleNotify] = useSingleNotifyExpiredDocumentMutation();

  const processedData = useMemo(() => {
    if (!data?.expiredDocuments) return [];

    return data.expiredDocuments.map((doc) => {
      const now = new Date();
      const expiryDate = new Date(doc.expiryDate);
      const timeDiff = expiryDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      let documentStatus = "active";
      let statusColor = "green";
      let statusText = "Active";

      if (daysDiff < 0) {
        documentStatus = "expired";
        statusColor = "#da2c46";
        statusText = `Expired ${Math.abs(daysDiff)} days ago`;
      } else if (daysDiff <= 7) {
        documentStatus = "expiring";
        statusColor = "orange";
        statusText = `Expires in ${daysDiff} days`;
      }

      return {
        ...doc,
        documentStatus,
        statusColor,
        statusText,
        daysDiff,
      };
    });
  }, [data]);

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
    setSelectedRowKeys([]); // Clear selection when page changes
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setDebouncedSearch("");
  };

  const expiredCount = processedData.filter(
    (doc) => doc.documentStatus === "expired"
  ).length;
  const expiringCount = processedData.filter(
    (doc) => doc.documentStatus === "expiring"
  ).length;

  const totalDocuments =
    data?.pagination?.totalDocuments || data?.totalDocuments || 0;

  const columns = [
    {
      title: "Employee ID",
      key: "employeeId",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.user?.employmentDetails?.eramId || "N/A"}
          </div>
        </div>
      ),
      width: 120,
    },
    {
      title: "Employee",
      key: "employee",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "#da2c46" }}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.user.fullName}</div>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {record.user.email}
            </Text>
          </div>
        </Space>
      ),
      width: 250,
    },
    {
      title: "Document",
      key: "document",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 8, color: "#da2c46" }} />
            {record.documentName}
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.fileName}
          </Text>
        </div>
      ),
      width: 200,
    },
    {
      title: "Work Order",
      dataIndex: ["workOrder", "title"],
      key: "workOrder",
      render: (title) => (
        <Text style={{ fontSize: "14px" }}>{title || "N/A"}</Text>
      ),
      width: 150,
    },
    {
      title: "Expiry Date",
      key: "expiryDate",
      render: (_, record) => (
        <div>
          <CalendarOutlined
            style={{ marginRight: 8, color: record.statusColor }}
          />
          {new Date(record.expiryDate).toLocaleDateString("en-GB")}
        </div>
      ),
      width: 130,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <Tooltip title={`Document ${record.statusText.toLowerCase()}`}>
          <Tag
            color={
              record.documentStatus === "expired"
                ? "red"
                : record.documentStatus === "expiring"
                ? "orange"
                : "green"
            }
            icon={
              record.documentStatus === "expired" ? (
                <ExclamationCircleOutlined />
              ) : record.documentStatus === "expiring" ? (
                <WarningOutlined />
              ) : null
            }
          >
            {record.statusText}
          </Tag>
        </Tooltip>
      ),
      width: 160,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            onClick={() => window.open(record.fileUrl, "_blank")}
            style={{ color: "#da2c46", padding: 0 }}
          >
            View Document
          </Button>
          <Button
            type="link"
            style={{ color: "#1677ff", padding: 0 }}
            onClick={() => handleSingleNotify(record)}
          >
            Notify
          </Button>
        </Space>
      ),
      width: 180,
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      name: record.user.fullName,
    }),
  };

  const handleNotify = async () => {
    if (
      !notificationData.subject.trim() ||
      !notificationData.description.trim()
    ) {
      notification.error({
        message: "Validation Error",
        description: "Please fill in both subject and description fields.",
        placement: "topRight",
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const selectedUsers = processedData.filter((doc) =>
        selectedRowKeys.includes(doc._id)
      );

      const payload = {
        emails: selectedUsers.map((u) => u.user.email),
        subject: notificationData.subject,
        message: notificationData.description,
        documentIds: selectedRowKeys,
      };

      // Example API call
      const response = await bulkNotify(payload);

      console.log("Payload to send:", response);

      notification.success({
        message: "Notifications Sent Successfully",
        description: `Notification sent to ${selectedUsers.length} employee(s) about their document expiry.`,
        placement: "topRight",
      });

      setIsModalVisible(false);
      setSelectedRowKeys([]);
      setNotificationData({
        subject: "Document Expiry Notification",
        description:
          "Your document has expired or is about to expire. Please renew it as soon as possible to avoid any compliance issues.",
      });
    } catch (error) {
      notification.error({
        message: "Failed to Send Notifications",
        description: "Please try again later.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSingleNotify = (record) => {
    setSelectedRecord(record);
    setConfirmVisible(true);
  };

  const getSelectedEmployees = () => {
    return processedData.filter((doc) => selectedRowKeys.includes(doc._id));
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setNotificationData({
      subject: "Document Expiry Notification",
      description:
        "Your document has expired or is about to expire. Please renew it as soon as possible to avoid any compliance issues.",
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
          Document Expiry Management
        </Title>
        <Text type="secondary">
          Manage and notify employees about their expired or expiring documents
        </Text>
      </div>

      {/* Search Bar */}
      <Card style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 1, marginRight: "16px" }}>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Search by Employee ID (ERAM ID)
            </Text>
            <Input
              placeholder="Enter ERAM ID to search..."
              prefix={<SearchOutlined style={{ color: "#da2c46" }} />}
              value={searchTerm}
              onChange={handleSearchChange}
              allowClear
              onClear={handleSearchClear}
              style={{ maxWidth: "400px" }}
              suffix={
                debouncedSearch !== searchTerm &&
                searchTerm && (
                  <Tooltip title="Searching in 2.5 seconds...">
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#da2c46",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                  </Tooltip>
                )
              }
            />
            {debouncedSearch && (
              <Text
                type="secondary"
                style={{ fontSize: "12px", marginTop: "4px", display: "block" }}
              >
                Searching for: "{debouncedSearch}"
              </Text>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <Text strong>Total Documents: {totalDocuments}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {isFetching
                ? "Loading..."
                : `Showing ${processedData.length} results`}
            </Text>
          </div>
        </div>
      </Card>

      {/* Alerts for expired and expiring documents */}
      <div style={{ marginBottom: "24px" }}>
        {expiredCount > 0 && (
          <Alert
            message={`${expiredCount} document(s) have expired`}
            description="These documents require immediate attention and renewal."
            type="error"
            icon={<ExclamationCircleOutlined />}
            style={{ marginBottom: "12px" }}
            showIcon
          />
        )}
        {expiringCount > 0 && (
          <Alert
            message={`${expiringCount} document(s) expiring within 7 days`}
            description="Consider notifying employees to renew these documents soon."
            type="warning"
            icon={<WarningOutlined />}
            style={{ marginBottom: "12px" }}
            showIcon
          />
        )}
        {processedData.length === 0 && debouncedSearch && !isLoading && (
          <Alert
            message="No documents found"
            description={`No expired documents found for ERAM ID: "${debouncedSearch}"`}
            type="info"
            showIcon
            style={{ marginBottom: "12px" }}
          />
        )}
      </div>

      {/* Action Bar */}
      <Card style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Text strong>
              {selectedRowKeys.length > 0
                ? `${selectedRowKeys.length} employee(s) selected`
                : "Select employees to send notifications"}
            </Text>
            {selectedRowKeys.length > 0 && (
              <div style={{ marginTop: "4px" }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Selected:{" "}
                  {getSelectedEmployees()
                    .map((emp) => emp.user.fullName)
                    .join(", ")}
                </Text>
              </div>
            )}
          </div>
          <Button
            type="primary"
            icon={<BellOutlined />}
            onClick={() => setIsModalVisible(true)}
            disabled={selectedRowKeys.length === 0}
            style={{
              backgroundColor:
                selectedRowKeys.length > 0 ? "#da2c46" : undefined,
              borderColor: selectedRowKeys.length > 0 ? "#da2c46" : undefined,
            }}
          >
            Notify Selected ({selectedRowKeys.length})
          </Button>
        </div>
      </Card>

      {/* Documents Table */}
      <Card>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={processedData}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalDocuments,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} documents`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          loading={isLoading || isFetching}
          rowClassName={(record) => {
            if (record.documentStatus === "expired") return "expired-row";
            if (record.documentStatus === "expiring") return "expiring-row";
            return "";
          }}
        />
      </Card>

      {/* Notification Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <BellOutlined style={{ marginRight: "8px", color: "#da2c46" }} />
            Send Document Expiry Notification
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={600}
        destroyOnClose={true}
      >
        <div style={{ marginBottom: "20px" }}>
          <Alert
            message={`Sending notification to ${selectedRowKeys.length} employee(s)`}
            type="info"
            showIcon
            style={{ marginBottom: "16px" }}
          />

          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "20px",
            }}
          >
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              Selected Employees:
            </Text>
            {getSelectedEmployees().map((emp, index) => (
              <div key={emp._id} style={{ marginBottom: "4px" }}>
                <Text>
                  {index + 1}. {emp.user.fullName} (
                  {emp.user?.employmentDetails?.eramId || "N/A"}) -
                  <Text type="secondary"> {emp.documentName}</Text>
                  <Tag
                    size="small"
                    color={emp.documentStatus === "expired" ? "red" : "orange"}
                    style={{ marginLeft: "8px" }}
                  >
                    {emp.statusText}
                  </Tag>
                </Text>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ marginBottom: "16px" }}>
            <Text strong>Notification Subject</Text>
            <span style={{ color: "#da2c46", marginLeft: "4px" }}>*</span>
            <Input
              placeholder="Enter notification subject"
              value={notificationData.subject}
              style={{ marginTop: "8px" }}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  subject: e.target.value,
                }))
              }
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <Text strong>Message Description</Text>
            <span style={{ color: "#da2c46", marginLeft: "4px" }}>*</span>
            <TextArea
              rows={4}
              placeholder="Enter your notification message..."
              showCount
              maxLength={500}
              value={notificationData.description}
              style={{ marginTop: "8px" }}
              onChange={(e) =>
                setNotificationData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <Button onClick={handleModalCancel}>Cancel</Button>
            <Button
              type="primary"
              loading={loading}
              icon={<BellOutlined />}
              style={{
                backgroundColor: "#da2c46",
                borderColor: "#da2c46",
              }}
              onClick={handleNotify}
            >
              {loading ? "Sending..." : "Send Notifications"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            <ExclamationCircleOutlined
              style={{ marginRight: 8, color: "#da2c46" }}
            />
            Confirm Send Notification
          </div>
        }
        open={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfirmVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            style={{ backgroundColor: "#da2c46", borderColor: "#da2c46" }}
            onClick={async () => {
              if (!selectedRecord) return;
              try {
                const payload = {
                  email: selectedRecord.user.email,
                  workOrder: selectedRecord.workOrder?.title || "N/A",
                  documentName: selectedRecord.documentName,
                  expiryDate: selectedRecord.expiryDate,
                  subject: "Document Expiry Notification",
                  message: `Your document "${
                    selectedRecord.documentName
                  }" under work order "${
                    selectedRecord.workOrder?.title
                  }" has expired or will expire on ${new Date(
                    selectedRecord.expiryDate
                  ).toLocaleDateString("en-GB")}. 
            Please renew it to avoid compliance issues.`,
                };

                await singleNotify(payload);

                notification.success({
                  message: "Notification Sent",
                  description: `Notification sent to ${selectedRecord.user.fullName} (${selectedRecord.user.email})`,
                  placement: "topRight",
                });

                setConfirmVisible(false);
              } catch (error) {
                notification.error({
                  message: "Failed to Send Notification",
                  description: "Please try again later.",
                  placement: "topRight",
                });
              }
            }}
          >
            Send
          </Button>,
        ]}
      >
        {selectedRecord && (
          <div>
            <p>
              Are you sure you want to notify{" "}
              <b>{selectedRecord.user.fullName}</b> ({selectedRecord.user.email}
              )?
            </p>
            <p>
              <b>Document:</b> {selectedRecord.documentName}
            </p>
            <p>
              <b>Work Order:</b> {selectedRecord.workOrder?.title || "N/A"}
            </p>
            <p>
              <b>Expiry Date:</b>{" "}
              {new Date(selectedRecord.expiryDate).toLocaleDateString("en-GB")}
            </p>
          </div>
        )}
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
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        .ant-input-affix-wrapper:focus,
        .ant-input-affix-wrapper-focused {
          border-color: #da2c46 !important;
          box-shadow: 0 0 0 2px rgba(218, 44, 70, 0.2) !important;
        }
        .ant-input:focus {
          border-color: #da2c46 !important;
          box-shadow: 0 0 0 2px rgba(218, 44, 70, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default EmployeeAdminExpiredDocuments;
