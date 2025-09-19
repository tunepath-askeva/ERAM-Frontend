import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Table,
  Typography,
  Space,
  Tag,
  Avatar,
  Tooltip,
  Empty,
  Spin,
  Row,
  Col,
  Badge,
  message,
  Popconfirm,
  Drawer,
  Descriptions,
  Dropdown,
  Menu,
  Modal,
  Divider,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  FilterOutlined,
  ReloadOutlined,
  MoreOutlined,
  PhoneOutlined,
  MailOutlined,
  UserAddOutlined,
  ImportOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;
const { Search } = Input;

const LowLevelCandidates = () => {
  const recruiterPermissions = useSelector(
    (state) => state.userAuth.recruiterPermissions
  );

  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const mockData = [
      {
        id: 1,
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+966501234567",
        fileName: "John_Smith_CV.pdf",
        fileSize: "2.3 MB",
        uploadDate: "2024-03-15T10:30:00Z",
        domain: "branch1.company.com",
        status: "new",
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah.j@email.com",
        phone: "+966509876543",
        fileName: "Sarah_Johnson_Resume.docx",
        fileSize: "1.8 MB",
        uploadDate: "2024-03-14T14:20:00Z",
        domain: "branch2.company.com",
        status: "reviewed",
      },
      {
        id: 3,
        name: "Ahmed Al-Rashid",
        email: "ahmed.rashid@email.com",
        phone: "+966512345678",
        fileName: "Ahmed_CV_2024.pdf",
        fileSize: "3.1 MB",
        uploadDate: "2024-03-13T09:15:00Z",
        domain: "main.company.com",
        status: "shortlisted",
      },
      {
        id: 4,
        name: "Maria Garcia",
        email: "maria.garcia@email.com",
        phone: "+966587654321",
        fileName: "Maria_Garcia_CV.pdf",
        fileSize: "2.7 MB",
        uploadDate: "2024-03-12T16:45:00Z",
        domain: "branch1.company.com",
        status: "new",
      },
    
    ];

    setLoading(true);
    setTimeout(() => {
      setCandidates(mockData);
      setFilteredCandidates(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  // Search functionality
  const handleSearch = (value) => {
    setSearchTerm(value);
    const filtered = candidates.filter(
      (candidate) =>
        candidate.name.toLowerCase().includes(value.toLowerCase()) ||
        candidate.email.toLowerCase().includes(value.toLowerCase()) ||
        candidate.fileName.toLowerCase().includes(value.toLowerCase()) ||
        candidate.domain.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCandidates(filtered);
  };

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "#da2c46";
      case "reviewed":
        return "#f59e0b";
      case "shortlisted":
        return "#10b981";
      case "rejected":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Mobile Card Component
  const MobileCard = ({ record }) => (
    <Card
      style={{
        marginBottom: "12px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
      bodyStyle={{ padding: "16px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
            }}
          >
            <Avatar
              size={32}
              style={{
                backgroundColor: "#da2c46",
                color: "white",
                fontWeight: "600",
              }}
              icon={<UserOutlined />}
            >
              {record.name.charAt(0).toUpperCase()}
            </Avatar>
            <div>
              <div
                style={{
                  fontWeight: "600",
                  color: "#1e293b",
                  fontSize: "14px",
                }}
              >
                {record.name}
              </div>
              <Tag
                color={getStatusColor(record.status)}
                style={{
                  borderRadius: "4px",
                  fontSize: "10px",
                  padding: "2px 6px",
                  textTransform: "capitalize",
                }}
              >
                {record.status}
              </Tag>
            </div>
          </div>

          <div
            style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}
          >
            <MailOutlined style={{ marginRight: "4px" }} />
            {record.email}
          </div>
          <div
            style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}
          >
            <PhoneOutlined style={{ marginRight: "4px" }} />
            {record.phone}
          </div>
          <div
            style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}
          >
            <FileTextOutlined style={{ marginRight: "4px" }} />
            {record.fileName} ({record.fileSize})
          </div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            <CalendarOutlined style={{ marginRight: "4px" }} />
            {formatDate(record.uploadDate)}
          </div>
        </div>

        <Button
          type="text"
          icon={<MoreOutlined />}
          onClick={() => {
            setSelectedCandidate(record);
            setDrawerVisible(true);
          }}
          style={{ color: "#64748b" }}
        />
      </div>
    </Card>
  );

  // Desktop Table columns
  const columns = [
    {
      title: "Candidate",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={40}
            style={{
              backgroundColor: "#da2c46",
              color: "white",
              fontWeight: "600",
            }}
            icon={<UserOutlined />}
          >
            {text.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: "600", color: "#1e293b" }}>{text}</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              {record.email}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              {record.phone}
            </div>
          </div>
        </div>
      ),
      responsive: ["lg"],
    },
    {
      title: "CV File",
      dataIndex: "fileName",
      key: "fileName",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FileTextOutlined style={{ color: "#da2c46", fontSize: "16px" }} />
          <div>
            <div
              style={{
                fontWeight: "500",
                color: "#1e293b",
                maxWidth: "200px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {text}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>
              {record.fileSize}
            </div>
          </div>
        </div>
      ),
      responsive: ["md"],
    },
    {
      title: "Upload Date",
      dataIndex: "uploadDate",
      key: "uploadDate",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <CalendarOutlined style={{ color: "#64748b", fontSize: "14px" }} />
          <span style={{ fontSize: "14px", color: "#374151" }}>
            {formatDate(text)}
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{
            borderRadius: "6px",
            fontSize: "12px",
            padding: "4px 8px",
            textTransform: "capitalize",
          }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const menu = (
          <Menu
            style={{
              padding: "4px 0",
            }}
          >
            {hasPermission("view-cv") && (
              <Menu.Item
                key="view"
                icon={<EyeOutlined />}
                onClick={() => {
                  setSelectedCandidate(record);
                  setViewModalVisible(true);
                }}
              >
                View
              </Menu.Item>
            )}

            {hasPermission("download-cv") && (
              <Menu.Item
                key="download"
                icon={<DownloadOutlined />}
                onClick={() => {
                  if (record.fileUrl) {
                    window.open(record.fileUrl, "_blank");
                  } else {
                    message.error("CV file not available!");
                  }
                }}
              >
                Download CV
              </Menu.Item>
            )}

            {hasPermission("convert-candidate") && (
              <Menu.Item
                key="convert"
                icon={<UserAddOutlined />}
                onClick={() => {
                  message.success(`Converted ${record.name} to candidate`);
                }}
              >
                Convert to Candidate
              </Menu.Item>
            )}

            <Divider style={{ margin: "4px 0" }} />

            {hasPermission("delete-cv") && (
              <Menu.Item
                key="delete"
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  setCandidateToDelete(record);
                  setDeleteModalVisible(true);
                }}
              >
                Delete
              </Menu.Item>
            )}
          </Menu>
        );

        return (
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  const handleViewCV = (record) => {
    message.info(`Viewing CV for ${record.name}`);
  };

  const handleDownloadCV = (record) => {
    message.success(`Downloading ${record.fileName}`);
  };

  const handleDeleteCV = (record) => {
    const updatedCandidates = candidates.filter((c) => c.id !== record.id);
    setCandidates(updatedCandidates);
    setFilteredCandidates(updatedCandidates);
    message.success(`Deleted CV for ${record.name}`);
    setDrawerVisible(false);
  };

  return (
    <div
      style={{
        padding: isMobile ? "12px" : "24px",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? "16px" : "32px" }}>
          <Card
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? "12px" : "0",
              marginBottom: "16px",
            }}
          >
            <div>
              <Title
                level={isMobile ? 3 : 2}
                style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: isMobile ? "24px" : "32px",
                  fontWeight: "700",
                }}
              >
                CV Applications
              </Title>
              <Text
                style={{
                  color: "#64748b",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                Manage and review candidate CVs submitted through quick apply
              </Text>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card
          style={{
            marginBottom: "24px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
          }}
          bodyStyle={{ padding: isMobile ? "16px" : "24px" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Search
              placeholder="Search by name, email, filename..."
              allowClear
              enterButton={
                <Button
                  icon={<SearchOutlined />}
                  style={{
                    background:
                      "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                    border: "none",
                    color: "white",
                  }}
                >
                  {isMobile ? "" : "Search"}
                </Button>
              }
              size={isMobile ? "middle" : "large"}
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ flex: 1, minWidth: "250px" }} // 🔥 keeps search bar wide
            />

            <Badge count={filteredCandidates.length} showZero>
              <Button
                icon={<FilterOutlined />}
                size={isMobile ? "middle" : "large"}
                style={{
                  borderColor: "#da2c46",
                  color: "#da2c46",
                  minWidth: isMobile ? "auto" : "120px",
                }}
              >
                {isMobile ? "Filter" : "Filter"}
              </Button>
            </Badge>

            <Button
              icon={<ImportOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{
                borderColor: "#da2c46",
                color: "#da2c46",
                minWidth: isMobile ? "auto" : "120px",
              }}
            >
              {isMobile ? "Import CVs" : "Import CVs"}
            </Button>

            <Button
              icon={<ExportOutlined />}
              size={isMobile ? "middle" : "large"}
              style={{
                borderColor: "#da2c46",
                color: "#da2c46",
                minWidth: isMobile ? "auto" : "120px",
              }}
            >
              {isMobile ? "Export CVs" : "Export CVs"}
            </Button>
          </div>
        </Card>

        {isMobile ? (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
              </div>
            ) : filteredCandidates.length === 0 ? (
              <Empty
                description={
                  searchTerm
                    ? `No applications found for "${searchTerm}"`
                    : "No CV applications yet"
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                {searchTerm && (
                  <Button
                    type="primary"
                    onClick={() => handleSearch("")}
                    style={{
                      background:
                        "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                      border: "none",
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </Empty>
            ) : (
              filteredCandidates.map((candidate) => (
                <MobileCard key={candidate.id} record={candidate} />
              ))
            )}
          </div>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
            }}
            bodyStyle={{ padding: "0" }}
          >
            <Table
              columns={columns}
              dataSource={filteredCandidates}
              rowKey="id"
              loading={loading}
              scroll={{ x: 800 }}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: !isMobile,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} applications`,
                style: { padding: "16px 24px" },
                simple: isMobile,
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      searchTerm
                        ? `No applications found for "${searchTerm}"`
                        : "No CV applications yet"
                    }
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  >
                    {searchTerm && (
                      <Button
                        type="primary"
                        onClick={() => handleSearch("")}
                        style={{
                          background:
                            "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
                          border: "none",
                        }}
                      >
                        Clear Search
                      </Button>
                    )}
                  </Empty>
                ),
              }}
            />
          </Card>
        )}

        <Drawer
          title="Candidate Details"
          placement="bottom"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          height={400}
        >
          {selectedCandidate && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <Avatar
                  size={48}
                  style={{
                    backgroundColor: "#da2c46",
                    color: "white",
                    fontWeight: "600",
                  }}
                  icon={<UserOutlined />}
                >
                  {selectedCandidate.name.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#1e293b",
                      fontSize: "18px",
                    }}
                  >
                    {selectedCandidate.name}
                  </div>
                  <Tag
                    color={getStatusColor(selectedCandidate.status)}
                    style={{
                      borderRadius: "4px",
                      fontSize: "12px",
                      padding: "4px 8px",
                      textTransform: "capitalize",
                    }}
                  >
                    {selectedCandidate.status}
                  </Tag>
                </div>
              </div>

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email">
                  {selectedCandidate.email}
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  {selectedCandidate.phone}
                </Descriptions.Item>
                <Descriptions.Item label="CV File">
                  {selectedCandidate.fileName} ({selectedCandidate.fileSize})
                </Descriptions.Item>
                <Descriptions.Item label="Upload Date">
                  {formatDate(selectedCandidate.uploadDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Domain">
                  {selectedCandidate.domain}
                </Descriptions.Item>
              </Descriptions>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewCV(selectedCandidate)}
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    border: "none",
                    flex: 1,
                  }}
                >
                  View CV
                </Button>
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadCV(selectedCandidate)}
                  style={{
                    borderColor: "#10b981",
                    color: "#10b981",
                    flex: 1,
                  }}
                >
                  Download
                </Button>
              </div>
            </div>
          )}
        </Drawer>
      </div>

      <Modal
        title="Candidate Details"
        visible={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
      >
        {selectedCandidate && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label="Name">
              {selectedCandidate.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedCandidate.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedCandidate.phone}
            </Descriptions.Item>
            <Descriptions.Item label="CV File">
              {selectedCandidate.fileName} ({selectedCandidate.fileSize})
            </Descriptions.Item>
            <Descriptions.Item label="Upload Date">
              {formatDate(selectedCandidate.uploadDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Domain">
              {selectedCandidate.domain}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Confirm Delete"
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={() => {
          if (candidateToDelete) {
            handleDeleteCV(candidateToDelete);
          }
          setDeleteModalVisible(false);
        }}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{candidateToDelete?.name}</strong>?
        </p>
      </Modal>

      <style jsx>{`
        .ant-table-thead > tr > th {
          background-color: #f8fafc !important;
          border-bottom: 2px solid #e2e8f0 !important;
          font-weight: 600 !important;
          color: #374151 !important;
          padding: 16px !important;
        }

        .ant-table-tbody > tr:hover > td {
          background-color: #f8fafc !important;
        }

        .ant-table-tbody > tr > td {
          padding: 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }

        .ant-pagination-item-active {
          border-color: #da2c46 !important;
          background-color: #da2c46 !important;
        }

        .ant-pagination-item-active a {
          color: white !important;
        }

        .ant-pagination-item:hover {
          border-color: #da2c46 !important;
        }

        .ant-pagination-item:hover a {
          color: #da2c46 !important;
        }

        @media (max-width: 768px) {
          .ant-card-body {
            padding: 12px !important;
          }

          .ant-typography h2 {
            font-size: 20px !important;
          }

          .ant-btn {
            height: auto !important;
            padding: 6px 12px !important;
          }
        }

        @media (max-width: 576px) {
          .ant-search-button {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LowLevelCandidates;
