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
import {
  useGetAllRecruiterCvsQuery,
  useDeleteRecruiterCvMutation,
} from "../../Slices/Recruiter/RecruiterApis";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const { data, isLoading } = useGetAllRecruiterCvsQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  const [deleteRecruiterCv, { isLoading: isDeleting }] =
    useDeleteRecruiterCvMutation();

  useEffect(() => {
    if (data?.getAllCV) {
      const formatted = data.getAllCV.map((cv) => ({
        id: cv._id,
        name: cv.applicantName || `${cv.firstName} ${cv.lastName}`,
        email: cv.email,
        fileName: cv.Resume?.[0]?.fileName || "N/A",
        fileUrl: cv.Resume?.[0]?.fileUrl || "",
        uploadDate: cv.Resume?.[0]?.uploadedAt || cv.createdAt,
        domain: cv.branch || "N/A",
        jobTitle: cv.jobId?.title || "Common Apply",
        jobCode: cv.jobId?.jobCode || "Common Apply",
      }));
      setCandidates(formatted);
      setFilteredCandidates(formatted);
    }
  }, [data]);

  const handleSearch = (value) => {
    setSearch(value);
  };

  const hasPermission = (permissionKey) => {
    return recruiterPermissions.includes(permissionKey);
  };

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
            </div>
          </div>
          <div
            style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}
          >
            <MailOutlined style={{ marginRight: "4px" }} />
            {record.email}
          </div>
          {record.fileName}
          <div style={{ fontSize: "11px", color: "#64748b" }}>
            <CalendarOutlined style={{ marginRight: "4px" }} />
            {formatDate(record.uploadDate)}
          </div>
          <div
            style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}
          >
            <strong>Job:</strong> {record.jobTitle} ({record.jobCode})
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
            <a
              href={record.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
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
            </a>
          </div>
        </div>
      ),
      responsive: ["md"],
    },
    {
      title: "Job Details",
      key: "jobDetails",
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: "500", color: "#1e293b" }}>
            {record.jobTitle}
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {record.jobCode}
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
                onClick={async () => {
                  if (record.fileUrl) {
                    try {
                      const response = await fetch(record.fileUrl, {
                        mode: "cors",
                      });
                      const blob = await response.blob();

                      const fileName = record.fileName || "cv.pdf";

                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);

                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      message.error("Failed to download CV!");
                    }
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

  const handleDownloadCV = (record) => {
    message.success(`Downloading ${record.fileName}`);
  };

  const handleDeleteCV = async (record) => {
    try {
      await deleteRecruiterCv(record.id).unwrap();
      message.success(`Deleted CV for ${record.name}`);

      const updatedCandidates = candidates.filter((c) => c.id !== record.id);
      setCandidates(updatedCandidates);
      setFilteredCandidates(updatedCandidates);
      setDrawerVisible(false);
    } catch (error) {
      message.error("Failed to delete CV!");
    }
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
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ flex: 1, minWidth: "250px" }}
            />

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
              rowKey="_id"
              loading={loading}
              scroll={{ x: 800 }}
              pagination={{
                current: page,
                pageSize: limit,
                onChange: (newPage, newLimit) => {
                  setPage(newPage);
                  setLimit(newLimit);
                },
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
                </div>
              </div>

              <Descriptions column={1} size="small">
                <Descriptions.Item label="Email">
                  {selectedCandidate.email}
                </Descriptions.Item>
                <Descriptions.Item label="CV File">
                  <a
                    href={selectedCandidate.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedCandidate.fileName}
                  </a>{" "}
                </Descriptions.Item>

                <Descriptions.Item label="Job Title">
                  {selectedCandidate.jobTitle}
                </Descriptions.Item>
                <Descriptions.Item label="Job Code">
                  {selectedCandidate.jobCode}
                </Descriptions.Item>

                <Descriptions.Item label="Upload Date">
                  {formatDate(selectedCandidate.uploadDate)}
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
                  onClick={() => {
                    if (selectedCandidate?.fileUrl) {
                      window.open(
                        selectedCandidate.fileUrl,
                        "_blank",
                        "noopener,noreferrer"
                      );
                    } else {
                      message.error("CV file not available!");
                    }
                  }}
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
            <Descriptions.Item label="CV File">
              <a
                href={selectedCandidate.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {selectedCandidate.fileName}
              </a>{" "}
            </Descriptions.Item>

            <Descriptions.Item label="Job Title">
              {selectedCandidate.jobTitle}
            </Descriptions.Item>
            <Descriptions.Item label="Job Code">
              {selectedCandidate.jobCode}
            </Descriptions.Item>

            <Descriptions.Item label="Upload Date">
              {formatDate(selectedCandidate.uploadDate)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Confirm Delete"
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={async () => {
          if (candidateToDelete) {
            await handleDeleteCV(candidateToDelete);
          }
          setDeleteModalVisible(false);
        }}
        okText={isDeleting ? "Deleting..." : "Delete"}
        okButtonProps={{ danger: true, loading: isDeleting }}
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
