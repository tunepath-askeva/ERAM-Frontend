import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Tooltip,
  Empty,
  Space,
  Badge,
  Modal,
  message,
  Divider,
  Descriptions,
  List,
  Spin,
  Input,
  Form,
  Select,
  Upload,
  Skeleton,
} from "antd";
import {
  PlusOutlined,
  StopOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BankOutlined,
  GlobalOutlined,
  UploadOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CodeOutlined,
  DollarOutlined,
  DownloadOutlined,
  BookOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";

import {
  useGetCandidatesQuery,
  useBulkImportCandidatesMutation,
  useDeleteCandidateMutation,
  useGetCandidateByIdQuery,
  useDisableCandidateStatusMutation,
} from "../../Slices/Admin/AdminApis";
import CandidateFormModal from "../Components/CandidateFormModal";
import CandidateViewModal from "../Components/CandidateViewModal";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminCandidates = () => {
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [candidateToToggle, setCandidateToToggle] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [bulkImportVisible, setBulkImportVisible] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  const { data: candidatesData, isLoading, refetch } = useGetCandidatesQuery();
  const [bulkImportCandidates] = useBulkImportCandidatesMutation();
  const [deleteCandidate, { isLoading: isDeleting }] =
    useDeleteCandidateMutation();

  const [toggleCandidateStatus] = useDisableCandidateStatusMutation();

  const [form] = Form.useForm();

  const candidates = candidatesData?.getCandidates || [];

  const showDisableModal = (candidate) => {
    setCandidateToToggle(candidate);
    setDisableModalVisible(true);
  };

  const handleDisableCancel = () => {
    setDisableModalVisible(false);
    setCandidateToToggle(null);
  };

  const handleToggleStatus = async () => {
    if (!candidateToToggle) return;

    setIsToggling(true);

    try {
      await toggleCandidateStatus(candidateToToggle._id).unwrap();
      const newStatus =
        candidateToToggle.accountStatus === "active" ? "inactive" : "active";

      message.success(
        `Candidate "${candidateToToggle.fullName}" status updated to ${newStatus}`
      );

      setDisableModalVisible(false);
      setCandidateToToggle(null);
      refetch(); // Refresh the list
    } catch (error) {
      console.error("Toggle status error:", error);
      message.error(
        error?.data?.message ||
          "Failed to update candidate status. Please try again."
      );
    } finally {
      setIsToggling(false);
    }
  };

  const showDeleteModal = (candidate) => {
    setCandidateToDelete(candidate);
    setDeleteModalVisible(true);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setCandidateToDelete(null);
  };

  const handleDeleteCandidate = async () => {
    if (!candidateToDelete) return;

    try {
      await deleteCandidate(candidateToDelete._id).unwrap();
      message.success(
        `Candidate "${candidateToDelete.fullName}" has been deleted successfully`
      );
      setDeleteModalVisible(false);
      setCandidateToDelete(null);
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      message.error(
        error?.data?.message || "Failed to delete candidate. Please try again."
      );
    }
  };

  const showCreateModal = () => {
    setEditingCandidate(null);
    form.resetFields();
    setCandidateModalVisible(true);
  };

  const showEditModal = (candidate) => {
    setEditingCandidate(candidate);
    setCandidateModalVisible(true);
  };

  const handleCandidateModalClose = () => {
    setCandidateModalVisible(false);
    setEditingCandidate(null);
    form.resetFields();
    refetch();
  };

  const handleViewCandidate = (candidate) => {
    setSelectedCandidateId(candidate._id); // Change this line
    setViewModalVisible(true);
  };

  const handleViewModalClose = () => {
    setViewModalVisible(false);
    setSelectedCandidateId(null); // Change this line
  };

  const handleBulkImport = () => {
    setBulkImportVisible(true);
  };

  const handleBulkImportClose = () => {
    setBulkImportVisible(false);
    setFileList([]);
  };

  const beforeUpload = (file) => {
    const isCSVorExcel =
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    if (!isCSVorExcel) {
      message.error("You can only upload CSV or Excel files!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("File must be smaller than 5MB!");
      return false;
    }

    return true;
  };

  const parseCSV = (csvText) => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(
              new Error("CSV parsing failed: " + results.errors[0].message)
            );
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  const handleFileChange = (info) => {
    setFileList(info.fileList.slice(-1)); // Keep only the latest file
  };

  const processImport = async () => {
    if (fileList.length === 0) {
      message.error("Please select a file first");
      return;
    }

    setIsImporting(true);

    try {
      const file = fileList[0].originFileObj || fileList[0];

      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });

      const parsedData = await parseCSV(fileContent);

      if (parsedData.length === 0) {
        message.error("No valid data found in the file");
        setIsImporting(false);
        return;
      }

      const candidates = parsedData
        .map((row) => {
          const fullName =
            row["Full Name"] ||
            row["fullName"] ||
            row["Name"] ||
            `${row["First Name"] || row["firstName"] || ""} ${
              row["Last Name"] || row["lastName"] || ""
            }`.trim();

          return {
            fullName,
            email: row["Email"] || row["email"],
            phone: row["Phone"] || row["phone"],
            password: row["Password"] || row["password"],
            companyName:
              row["Company Name"] || row["companyName"] || row["Company"],
            specialization: row["Specialization"] || row["specialization"],
            qualifications: row["Qualifications"] || row["qualifications"],
          };
        })
        .filter((candidate) => {
          return candidate.fullName && candidate.email && candidate.password;
        });

      if (candidates.length === 0) {
        message.error(
          "No valid candidates found. Please check required fields: Full Name, Email, Password"
        );
        setIsImporting(false);
        return;
      }

      console.log("Candidates to import:", candidates);

      const response = await bulkImportCandidates({
        candidates,
        role: "candidate",
      }).unwrap();

      message.success(`Successfully imported ${response.count} candidates`);
      refetch();
      setBulkImportVisible(false);
      setFileList([]);
    } catch (error) {
      console.error("Import error:", error);

      if (error?.data?.message) {
        message.error(error.data.message);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error(
          "Failed to import candidates. Please check the file format and try again."
        );
      }
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <div
        style={{
          padding: "16px",
          minHeight: "100vh",
        }}
      >
        <div className="candidate-header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined
              size={24}
              style={{ marginRight: "8px", color: "#2c3e50" }}
            />
            <Title
              level={2}
              className="candidate-title"
              style={{ margin: 0, color: "#2c3e50", fontSize: "20px" }}
            >
              Candidate Management
            </Title>
          </div>

          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <Button
              type="default"
              size="large"
              icon={<UploadOutlined />}
              onClick={handleBulkImport}
              style={{
                borderRadius: "8px",
                fontSize: "14px",
                height: "44px",
                flex: 1,
                border: "1px solid #da2c46",
                color: "#da2c46",
              }}
            >
              Bulk Import
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={showCreateModal}
              style={{
                background:
                  "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                height: "44px",
                flex: 1,
              }}
            >
              Add New Candidate
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "20px",
            }}
          >
            <Skeleton />
          </div>
        ) : candidates?.length > 0 ? (
          <Row
            gutter={[16, 16]}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            {candidates.map((candidate) => (
              <div key={candidate._id}>
                <Card
                  style={{
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  title={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <UserOutlined
                          style={{
                            color: "#da2c46",
                            marginRight: 8,
                            fontSize: "16px",
                            flexShrink: 0,
                          }}
                        />
                        <Text
                          strong
                          style={{
                            fontSize: "14px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={candidate.fullName}
                        >
                          {candidate.fullName}
                        </Text>
                      </div>
                      <Tag
                        color={
                          candidate.accountStatus === "active" ? "green" : "red"
                        }
                      >
                        {candidate.accountStatus}
                      </Tag>
                    </div>
                  }
                  extra={
                    <Space size="small">
                      <Tooltip title="View Details">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewCandidate(candidate)}
                        />
                      </Tooltip>
                      <Tooltip title="Edit Candidate">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => showEditModal(candidate)}
                        />
                      </Tooltip>
                      <Tooltip
                        title={
                          candidate.accountStatus === "active"
                            ? "Disable Candidate"
                            : "Enable Candidate"
                        }
                      >
                        <Button
                          type="text"
                          size="small"
                          icon={<StopOutlined />}
                          onClick={() => showDisableModal(candidate)}
                          danger={candidate.accountStatus === "active"}
                        />
                      </Tooltip>
                      {/* Add the delete button here */}
                      <Tooltip title="Delete Candidate">
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => showDeleteModal(candidate)}
                          danger
                        />
                      </Tooltip>
                    </Space>
                  }
                >
                  <div style={{ flex: 1 }}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <MailOutlined /> Email
                        </Text>
                        <Paragraph
                          style={{ margin: "4px 0", fontSize: "13px" }}
                          ellipsis={{ rows: 1 }}
                        >
                          {candidate.email}
                        </Paragraph>
                      </div>

                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <PhoneOutlined /> Phone
                        </Text>
                        <Paragraph
                          style={{ margin: "4px 0", fontSize: "13px" }}
                        >
                          {candidate.phone}
                        </Paragraph>
                      </div>

                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <BankOutlined /> Current Company
                        </Text>
                        <Paragraph
                          style={{ margin: "4px 0", fontSize: "13px" }}
                          ellipsis={{ rows: 1 }}
                        >
                          {candidate.companyName || "Not specified"}
                        </Paragraph>
                      </div>

                      <div>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          <TrophyOutlined /> Specialization
                        </Text>
                        <Paragraph
                          style={{ margin: "4px 0", fontSize: "13px" }}
                          ellipsis={{ rows: 1 }}
                        >
                          {candidate.specialization || "Not specified"}
                        </Paragraph>
                      </div>

                      {candidate.skills?.length > 0 && (
                        <div>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            <CodeOutlined /> Skills
                          </Text>
                          <div style={{ marginTop: "4px" }}>
                            {candidate.skills
                              .slice(0, 3)
                              .map((skill, index) => (
                                <Tag
                                  key={index}
                                  style={{ marginBottom: "4px" }}
                                >
                                  {skill}
                                </Tag>
                              ))}
                            {candidate.skills.length > 3 && (
                              <Tooltip
                                title={candidate.skills.slice(3).join(", ")}
                              >
                                <Tag>+{candidate.skills.length - 3} more</Tag>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      )}
                    </Space>
                  </div>

                  <Divider style={{ margin: "12px 0" }} />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Tooltip title="Qualifications">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <BookOutlined
                          style={{ color: "#1890ff", fontSize: "14px" }}
                        />
                        <Text style={{ fontSize: "13px" }}>
                          {candidate.qualifications || "Not specified"}
                        </Text>
                      </div>
                    </Tooltip>
                  </div>
                </Card>
              </div>
            ))}
          </Row>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              marginTop: "16px",
              textAlign: "center",
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Text type="secondary">
                  No candidates found. Add your first candidate to get started.
                </Text>
              }
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showCreateModal}
                style={{
                  background:
                    "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                  border: "none",
                }}
              >
                Add Candidate
              </Button>
            </Empty>
          </Card>
        )}
      </div>

      {/* Candidate Form Modal */}
      <CandidateFormModal
        visible={candidateModalVisible}
        onCancel={handleCandidateModalClose}
        form={form}
        editingCandidate={editingCandidate}
      />
      {/* Candidate View Modal */}
      <CandidateViewModal
        visible={viewModalVisible}
        onCancel={handleViewModalClose}
        candidateId={selectedCandidateId}
      />

      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              color:
                candidateToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
          >
            <ExclamationCircleOutlined
              style={{ marginRight: 8, fontSize: 18 }}
            />
            <span style={{ fontSize: "16px" }}>
              {candidateToToggle?.accountStatus === "active"
                ? "Disable"
                : "Enable"}{" "}
              Candidate
            </span>
          </div>
        }
        open={disableModalVisible}
        onCancel={handleDisableCancel}
        width="90%"
        style={{ maxWidth: 500 }}
        centered
        footer={[
          <Button key="cancel" onClick={handleDisableCancel} size="large">
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger={candidateToToggle?.accountStatus === "active"}
            onClick={handleToggleStatus}
            loading={isToggling}
            size="large"
            style={{
              background:
                candidateToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
              borderColor:
                candidateToToggle?.accountStatus === "active"
                  ? "#ff4d4f"
                  : "#52c41a",
            }}
          >
            {candidateToToggle?.accountStatus === "active"
              ? "Disable"
              : "Enable"}
          </Button>,
        ]}
      >
        <div style={{ padding: "16px 0" }}>
          <Text>
            Are you sure you want to{" "}
            {candidateToToggle?.accountStatus === "active"
              ? "disable"
              : "enable"}{" "}
            the candidate <Text strong>{candidateToToggle?.fullName}</Text>?
          </Text>
          {candidateToToggle?.accountStatus === "active" && (
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Disabling will prevent this candidate from accessing the system.
              </Text>
            </div>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <DeleteOutlined style={{ color: "#ff4d4f" }} />
            <span>Delete Candidate</span>
          </div>
        }
        visible={deleteModalVisible}
        onOk={handleDeleteCandidate}
        onCancel={handleDeleteCancel}
        confirmLoading={isDeleting}
        okText="Delete"
        okButtonProps={{
          danger: true,
        }}
        cancelText="Cancel"
      >
        <div style={{ padding: "16px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <WarningOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />
            <div>
              <Text strong style={{ fontSize: "16px", color: "#ff4d4f" }}>
                This action cannot be undone!
              </Text>
            </div>
          </div>
          <Paragraph style={{ marginBottom: "12px" }}>
            Are you sure you want to permanently delete{" "}
            <Text strong>"{candidateToDelete?.fullName}"</Text>?
          </Paragraph>
          <Paragraph type="secondary" style={{ fontSize: "13px" }}>
            This will remove all candidate information, including their profile,
            applications, and associated data from the system.
          </Paragraph>
        </div>
      </Modal>

      {/* Bulk Import Modal */}
      <Modal
        title="Bulk Import Candidates"
        visible={bulkImportVisible}
        onCancel={handleBulkImportClose}
        footer={null}
        width={600}
      >
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Paragraph type="secondary">
            Upload a CSV file containing candidate data. The file should include
            columns for Full Name, Email, Phone, Password, Company Name,
            Specialization, and Qualifications.
          </Paragraph>

          <Divider />

          <Upload.Dragger
            name="file"
            multiple={false}
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            accept=".csv"
            showUploadList={{
              showRemoveIcon: true,
            }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: "32px", color: "#da2c46" }} />
            </p>
            <p className="ant-upload-text">
              Click or drag CSV file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single CSV file upload only.
            </p>
          </Upload.Dragger>

          <Button
            type="primary"
            onClick={processImport}
            disabled={fileList.length === 0}
            loading={isImporting}
            style={{
              marginTop: 16,
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              border: "none",
            }}
          >
            {isImporting ? "Importing..." : "Import Candidates"}
          </Button>

          <Divider />

          <div>
            <Text strong style={{ display: "block", marginBottom: "8px" }}>
              File Requirements:
            </Text>
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              <li>Maximum file size: 5MB</li>
              <li>Supported formats: .csv only</li>
              <li>Required columns: Full Name, Email, Password</li>
              <li>
                Optional columns: Phone, Company Name, Specialization,
                Qualifications
              </li>
            </ul>
          </div>

          <div style={{ marginTop: "16px" }}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => {
                const headers = [
                  "Full Name",
                  "Email",
                  "Phone",
                  "Password",
                  "Company Name",
                  "Specialization",
                  "Qualifications",
                ];

                const sampleRow = [
                  "John Doe",
                  "john.doe@example.com",
                  "9876543210",
                  "password123",
                  "Acme Corp",
                  "React.js Developer",
                  "B.Tech in Computer Science",
                ];

                const csvContent =
                  "data:text/csv;charset=utf-8," +
                  [headers, sampleRow].map((row) => row.join(",")).join("\n");

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "candidate_template.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
              }}
            >
              Download Template
            </Button>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default AdminCandidates;
