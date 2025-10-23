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
  Upload,
  Progress 
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  SignatureOutlined,
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
  UploadOutlined,
  FileExcelOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import {
  useGetAllRecruiterCvsQuery,
  useDeleteRecruiterCvMutation,
  useAddRemarksCvCandidatesMutation,
  useConvertToCandidateMutation,
  useExportRecruiterCvsMutation,
  useImportRecruiterCvsMutation,
} from "../../Slices/Recruiter/RecruiterApis";
import SkeletonLoader from "../../Global/SkeletonLoader";
import ConvertToCandidateModal from "../Components/ConvertToCandidatModal";

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
  const [addRemarksModalVisible, setAddRemarksModalVisible] = useState(false);
  const [remarksText, setRemarksText] = useState("");
  const [convertModalVisible, setConvertModalVisible] = useState(false);
  const [candidateToConvert, setCandidateToConvert] = useState(null);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [candidateConverting] = useConvertToCandidateMutation();

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

  const { data, isLoading, refetch } = useGetAllRecruiterCvsQuery({
    page,
    limit,
    search: debouncedSearch,
  });

  const [deleteRecruiterCv, { isLoading: isDeleting }] =
    useDeleteRecruiterCvMutation();

  const [exportCvs, { isLoading: isExporting }] =
    useExportRecruiterCvsMutation();

  const [importCvs, { isLoading: isImporting }] =
    useImportRecruiterCvsMutation();

  const [addRemarks, { isLoading: isAdding }] =
    useAddRemarksCvCandidatesMutation();

  useEffect(() => {
    if (data?.getAllCV) {
      const formatted = data.getAllCV.map((cv) => ({
        id: cv._id,
        name: cv.applicantName || `${cv.firstName} ${cv.lastName}`,
        email: cv.email,
        fileName: cv.resume?.[0]?.fileName || "N/A",
        fileUrl: cv.resume?.[0]?.fileUrl || "",
        uploadDate: cv.resume?.[0]?.uploadedAt || cv.createdAt,
        domain: cv.branch || "N/A",
        jobTitle: cv.jobId?.title || "Common Apply",
        jobCode: cv.jobId?.jobCode || "Common Apply",
        remarks: cv.remarks || "No remarks added yet...",
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

  const handleConvertCandidate = (record) => {
    setCandidateToConvert({
      id: record.id,
      firstName: record.firstName || record.name.split(" ")[0],
      lastName: record.lastName || record.name.split(" ")[1] || "",
      email: record.email,
    });
    setConvertModalVisible(true);
  };

  const handleConvertSubmit = async (values) => {
    const { phoneNumber, phoneNumberCountryCode, ...rest } = values;
    const fullPhone = `+${phoneNumberCountryCode}${phoneNumber}`;

    try {
      await candidateConverting({
        id: candidateToConvert.id,
        values: { ...rest, phone: fullPhone },
      }).unwrap();

      message.success(
        `${values.firstName} ${values.lastName} converted to candidate!`
      );
      setConvertModalVisible(false);
    } catch (error) {
      message.error("Failed to convert candidate!");
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList); // Allow multiple files
  };

  const beforeUpload = (file) => {
    const isPdf = file.type === "application/pdf";
    if (!isPdf) {
      message.error(`${file.name} is not a PDF file`);
    }
    return isPdf || Upload.LIST_REMOVE; // Only allow PDFs
  };

  const handleImportCvs = async () => {
    if (fileList.length === 0) {
      message.error("Please select at least one PDF file to upload!");
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj); // Changed to "files" (plural)
    });

    try {
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      await importCvs(formData).unwrap();

      clearInterval(progressInterval);
      setUploadProgress(100);

      message.success(`${fileList.length} CV(s) imported successfully!`);
      refetch();
      setIsImportModalVisible(false);
      setFileList([]);
      setUploadProgress(0);
    } catch (error) {
      console.error(error);
      message.error("Failed to import CVs!");
      setUploadProgress(0);
    }
  };

  const handleExportCvs = async () => {
    try {
      const blob = await exportCvs().unwrap();

      const url = window.URL.createObjectURL(
        new Blob([blob], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resumes.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      message.success("CVs exported successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to export CVs!");
    }
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
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      render: (text) => (
        <span style={{ fontSize: "13px", color: "#374151" }}>
          {text || "—"}
        </span>
      ),
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
                onClick={() => handleConvertCandidate(record)}
              >
                Convert to Candidate
              </Menu.Item>
            )}
            {hasPermission("add-cv-remarks") && (
              <Menu.Item
                key="remarks"
                icon={<SignatureOutlined />}
                onClick={() => {
                  setSelectedCandidate(record);
                  setAddRemarksModalVisible(true);
                }}
              >
                Add Remarks
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
      refetch();
      setCandidates(updatedCandidates);
      setFilteredCandidates(updatedCandidates);
      setDrawerVisible(false);
    } catch (error) {
      message.error("Failed to delete CV!");
    }
  };

  if (isLoading) {
    return (
      <div>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: isMobile ? "12px" : "24px",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
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

            {hasPermission("import-cvs") && (
              <Button
                icon={<ImportOutlined />}
                size={isMobile ? "middle" : "large"}
                onClick={() => setIsImportModalVisible(true)}
                style={{
                  borderColor: "#da2c46",
                  color: "#da2c46",
                  minWidth: isMobile ? "auto" : "120px",
                }}
              >
                {isMobile ? "Import CVs" : "Import CVs"}
              </Button>
            )}

            {hasPermission("export-cvs") && (
              <Button
                icon={<ExportOutlined />}
                size={isMobile ? "middle" : "large"}
                loading={isExporting}
                onClick={handleExportCvs}
                style={{
                  borderColor: "#da2c46",
                  color: "#da2c46",
                  minWidth: isMobile ? "auto" : "120px",
                }}
              >
                {isMobile ? "Export" : "Export CVs"}
              </Button>
            )}
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
                <Descriptions.Item label="Remarks">
                  {selectedCandidate.remarks || "No remarks added"}
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

            <Descriptions.Item label="Remarks">
              {selectedCandidate.remarks || "No remarks added"}
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

      <Modal
        title={`Add Remarks for ${selectedCandidate?.name || ""}`}
        open={addRemarksModalVisible}
        onCancel={() => {
          setAddRemarksModalVisible(false);
          setRemarksText("");
        }}
        onOk={async () => {
          if (!remarksText.trim()) {
            message.error("Please enter remarks before submitting!");
            return;
          }
          try {
            await addRemarks({
              candidateId: selectedCandidate?.id,
              remarks: remarksText,
            }).unwrap();

            setCandidates((prev) =>
              prev.map((c) =>
                c.id === selectedCandidate?.id
                  ? { ...c, remarks: remarksText }
                  : c
              )
            );
            setFilteredCandidates((prev) =>
              prev.map((c) =>
                c.id === selectedCandidate?.id
                  ? { ...c, remarks: remarksText }
                  : c
              )
            );

            message.success("Remarks added successfully!");
            setAddRemarksModalVisible(false);
            setRemarksText("");
          } catch (error) {
            message.error("Failed to add remarks!");
          }
        }}
        okText={isAdding ? "Saving..." : "Save"}
        confirmLoading={isAdding}
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
            border: "none",
            color: "#fff",
          },
        }}
      >
        <Input.TextArea
          rows={4}
          value={remarksText}
          onChange={(e) => setRemarksText(e.target.value)}
          placeholder="Enter remarks here..."
        />
      </Modal>

      <Modal
        title="Import CVs"
        open={isImportModalVisible}
        onCancel={() => {
          setIsImportModalVisible(false);
          setFileList([]);
          setUploadProgress(0);
        }}
        onOk={handleImportCvs}
        okText={isImporting ? "Importing..." : "Import"}
        confirmLoading={isImporting}
        okButtonProps={{
          disabled: fileList.length === 0,
          style: {
            background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
            border: "none",
            color: "#fff",
          },
        }}
        width={600}
      >
        <p style={{ marginBottom: 16, color: "#64748b" }}>
          Upload one or multiple PDF files containing candidate resumes.
        </p>

        <Upload.Dragger
          accept=".pdf"
          beforeUpload={beforeUpload}
          fileList={fileList}
          onChange={handleUploadChange}
          multiple
          listType="picture"
          iconRender={() => <FileTextOutlined style={{ color: "#da2c46" }} />}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ color: "#da2c46", fontSize: 48 }} />
          </p>
          <p
            className="ant-upload-text"
            style={{ fontSize: 16, fontWeight: 500 }}
          >
            Click or drag PDF files to this area
          </p>
          <p className="ant-upload-hint" style={{ color: "#64748b" }}>
            Support for single or bulk upload. Only PDF files are accepted.
          </p>
        </Upload.Dragger>

        {fileList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text strong>Selected Files: {fileList.length}</Text>
          </div>
        )}

        {isImporting && uploadProgress > 0 && (
          <div style={{ marginTop: 16 }}>
            <Text style={{ marginBottom: 8, display: "block" }}>
              Uploading... {uploadProgress}%
            </Text>
            <Progress
              percent={uploadProgress}
              status={uploadProgress === 100 ? "success" : "active"}
              strokeColor={{
                "0%": "#da2c46",
                "100%": "#b91c3c",
              }}
            />
          </div>
        )}
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
      {convertModalVisible && (
        <ConvertToCandidateModal
          visible={convertModalVisible}
          onCancel={() => setConvertModalVisible(false)}
          initialValues={candidateToConvert}
          handleSubmit={handleConvertSubmit}
        />
      )}
    </div>
  );
};

export default LowLevelCandidates;
