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
  Divider,
  Descriptions,
  List,
  Spin,
  Input,
  Form,
  Select,
  Upload,
  Skeleton,
  Pagination,
  Table,
  Checkbox,
  Dropdown,
  Menu,
  Alert,
  Result,
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
  MoreOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useSnackbar } from "notistack";

import {
  useGetCandidatesQuery,
  useBulkImportCandidatesMutation,
  useDeleteCandidateMutation,
  useGetCandidateByIdQuery,
  useDisableCandidateStatusMutation,
} from "../../Slices/Admin/AdminApis.js";
import CandidateFormModal from "../Components/CandidateFormModal";
import CandidateViewDrawer from "../Components/CandidateViewDrawer.jsx";
import { useForm } from "antd/es/form/Form.js";
import SkeletonLoader from "../../Global/SkeletonLoader.jsx";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminCandidates = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [disableModalVisible, setDisableModalVisible] = useState(false);
  const [candidateToToggle, setCandidateToToggle] = useState(null);
  const [viewDrawerVisible, setViewDrawerVisible] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [bulkImportVisible, setBulkImportVisible] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [fetchingCandidateId, setFetchingCandidateId] = useState(null);
  const [bulkImportResult, setBulkImportResult] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 700);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: candidatesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCandidatesQuery({
    searchTerm: debouncedSearchTerm,
    page: currentPage,
    pageSize: pageSize,
  });

  const {
    data: candidateDetailsById,
    isLoading: isLoadingCandidate,
    error: candidateError,
  } = useGetCandidateByIdQuery(fetchingCandidateId, {
    skip: !fetchingCandidateId,
  });

  const [bulkImportCandidates] = useBulkImportCandidatesMutation();
  const [deleteCandidate, { isLoading: isDeleting }] =
    useDeleteCandidateMutation();
  const [toggleCandidateStatus] = useDisableCandidateStatusMutation();

  const candidates = candidatesResponse?.getCandidates || [];
  const candidateDetails = candidateDetailsById?.candidate;
  const totalCount = candidatesResponse?.totalCount || 0;
  const totalPages = candidatesResponse?.totalPages || 0;

  const [form] = useForm();

  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Error handling
  useEffect(() => {
    if (isError) {
      enqueueSnackbar(
        `Failed to load candidates: ${
          error?.data?.message || error?.message || "Unknown error"
        }`,
        { variant: "error" }
      );
    }
  }, [isError, error]);

  useEffect(() => {
    if (candidateDetails && fetchingCandidateId) {
      // Ensure candidateDetails has the required properties
      const safeCandidate = {
        ...candidateDetails,
        fullName:
          candidateDetails.fullName ||
          candidateDetails.firstName ||
          candidateDetails.lastName ||
          "Unknown",
      };
      setEditingCandidate(safeCandidate);
    }
  }, [candidateDetails, fetchingCandidateId]);

  const isRecentlyUpdated = (date) => {
    if (!date) return false;
    const updated = new Date(date);
    const now = new Date();
    const diff = (now - updated) / (1000 * 60 * 60 * 24); // in days
    return diff <= 2;
  };

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
      const response = await toggleCandidateStatus(
        candidateToToggle._id
      ).unwrap();

      const newStatus =
        response?.accountStatus ||
        (candidateToToggle.accountStatus === "active" ? "inactive" : "active");

      enqueueSnackbar(
        `Candidate "${candidateToToggle.fullName}" status updated to ${newStatus}`,
        { variant: "success" }
      );

      setDisableModalVisible(false);
      setCandidateToToggle(null);
      refetch();
    } catch (error) {
      console.error("Toggle status error:", error);
      enqueueSnackbar(
        error?.data?.message ||
          "Failed to update candidate status. Please try again.",
        { variant: "error" }
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
      enqueueSnackbar(
        `Candidate "${candidateToDelete.fullName}" has been deleted successfully`,
        { variant: "success" }
      );
      setDeleteModalVisible(false);
      setCandidateToDelete(null);
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      enqueueSnackbar(
        error?.data?.message || "Failed to delete candidate. Please try again.",
        { variant: "error" }
      );
    }
  };

  const showCreateModal = () => {
    setEditingCandidate(null);
    setCandidateModalVisible(true);
  };

  const showEditModal = (candidate) => {
    setFetchingCandidateId(candidate._id);
    setEditingCandidate(candidate);
    setCandidateModalVisible(true);
  };

  const handleCandidateModalClose = () => {
    setCandidateModalVisible(false);
    setEditingCandidate(null);
    setFetchingCandidateId(null);
    refetch();
  };

  const handleViewCandidate = (candidateId) => {
    setSelectedCandidateId(candidateId);
    setViewDrawerVisible(true);
  };

  const handleViewDrawerClose = () => {
    setViewDrawerVisible(false);
    setSelectedCandidateId(null);
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
      file.type === "application/vnd.ms-excel" || // .xls
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // .xlsx

    if (!isCSVorExcel) {
      enqueueSnackbar("You can only upload CSV or Excel (.xls/.xlsx) files!", {
        variant: "error",
      });
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      enqueueSnackbar("File must be smaller than 5MB!", { variant: "error" });
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

  const parseExcel = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        resolve(data);
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });

  const handleFileChange = (info) => {
    setFileList(info.fileList.slice(-1));
  };

  const getCandidateSource = (candidate) => {
    switch (candidate.enteringCandidate) {
      case "lowlevel":
        return "Converted from CV";
      case "registered":
        return "Registered";
      case "addedcandidate":
        return "Added";
      case "bulk":
        return "Bulk imported";
      default:
        return "Bulk imported"; // fallback
    }
  };

  const processImport = async () => {
    if (fileList.length === 0) {
      enqueueSnackbar("Please select a file first", { variant: "error" });
      return;
    }

    setIsImporting(true);

    try {
      const file = fileList[0].originFileObj || fileList[0];
      const fileName = file.name.toLowerCase();

      let parsedData = [];

      if (fileName.endsWith(".csv")) {
        const fileContent = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        parsedData = await new Promise((resolve, reject) => {
          Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(
                  new Error("CSV parsing error: " + results.errors[0].message)
                );
              } else {
                resolve(results.data);
              }
            },
            error: reject,
          });
        });
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              defval: "",
            });
            resolve(jsonData);
          };
          reader.onerror = reject;
          reader.readAsBinaryString(file);
        });

        parsedData = data;
      } else {
        enqueueSnackbar(
          "Unsupported file type. Please upload a .csv or .xlsx file.",
          { variant: "error" }
        );
        setIsImporting(false);
        return;
      }

      if (parsedData.length === 0) {
        enqueueSnackbar("No valid data found in the file", {
          variant: "error",
        });
        setIsImporting(false);
        return;
      }

      const candidates = [];
      let skippedRows = 0;

      parsedData.forEach((row) => {
        const firstName = row["First Name"]?.trim() || "";
        const middleName = row["Middle Name"]?.trim() || "";
        const lastName = row["Last Name"]?.trim() || "";

        let fullName = "";
        if (firstName || lastName) {
          fullName = [firstName, middleName, lastName]
            .filter(Boolean)
            .join(" ");
        } else {
          fullName = row["Full Name"]?.trim() || "";
        }

        const email = row["Email"]?.trim();
        const password = row["Password"]?.trim();

        // Handle phone number with country code
        let phone = "";
        let phoneCountryCode = "91";
        
        // Option 1: If separate Country Code and Phone Number columns exist
        const countryCodeColumn = row["Country Code"]?.toString()?.trim().replace("+", "") || 
                                 row["Phone Country Code"]?.toString()?.trim().replace("+", "") || "";
        const phoneNumberColumn = row["Phone Number"]?.toString()?.trim() || 
                                 row["Phone"]?.toString()?.trim() || "";
        
        if (countryCodeColumn && phoneNumberColumn) {
          phoneCountryCode = countryCodeColumn;
          phone = phoneNumberColumn.replace(/^\+/, "").replace(/\D/g, "");
        } else {
          // Option 2: If Phone column contains full number
          const phoneColumn = row["Phone"]?.toString()?.trim() || 
                             row["Phone Number"]?.toString()?.trim() || "";
          
          if (phoneColumn) {
            // Remove + prefix if present
            let phoneWithoutPlus = phoneColumn.trim();
            while (phoneWithoutPlus.startsWith("+")) {
              phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
            }
            
            // Try to extract country code - for now use default, can enhance with phoneUtils later
            phoneCountryCode = "91";
            phone = phoneWithoutPlus.replace(/\D/g, "");
          }
        }

        if (fullName && email && password) {
          candidates.push({
            firstName: firstName,
            middleName: middleName,
            lastName: lastName,
            fullName: fullName,
            email: email?.toLowerCase() || "",
            phone: phone,
            phoneCountryCode: phoneCountryCode,
            password: password || "",
            companyName:
              row["Company Name"]?.trim() || row["Company"]?.trim() || "",
            specialization: row["Specialization"]?.trim() || "",
            qualifications: row["Qualifications"]?.trim() || "",
            nationality: row["Nationality"]?.trim() || "",
            agency: row["Agency"]?.toString()?.trim() || "",
            workorderhint: row["Work Order Hint"]?.toString()?.trim() || "",
            client: row["Client"]?.toString()?.trim() || "",
          });
        }
        if (!(fullName && email && password)) {
          console.log("Skipped Row:", row);
        } else {
          skippedRows++;
        }
      });

      if (candidates.length === 0) {
        enqueueSnackbar(
          "No valid candidates found (Full Name, Email, Password required)",
          { variant: "error" }
        );
        setIsImporting(false);
        return;
      }

      if (skippedRows > 0) {
        enqueueSnackbar(
          `${skippedRows} row(s) skipped due to missing required fields.`,
          { variant: "warning" }
        );
      }

      const response = await bulkImportCandidates({
        candidates,
        role: "candidate",
      }).unwrap();

      const inserted = response?.insertedCount || 0;
      const duplicates = response?.duplicateCount || 0;
      const invalids = response?.invalidCount || 0;

      setBulkImportResult(response);

      if (inserted > 0) {
        enqueueSnackbar(`✅ Imported ${inserted} candidate(s).`, {
          variant: "success",
        });
      }
      if (duplicates > 0 || invalids > 0) {
        enqueueSnackbar(
          `⚠️ ${duplicates} duplicates and ${invalids} invalid skipped.`,
          { variant: "warning" }
        );
      }
      if (inserted === 0 && (duplicates > 0 || invalids > 0)) {
        enqueueSnackbar("❌ No candidates imported.", { variant: "error" });
      }

      refetch();
      setBulkImportVisible(false);
      setFileList([]);
    } catch (error) {
      console.error("Import error:", error);
      enqueueSnackbar(
        error?.data?.message ||
          error?.message ||
          "Failed to import candidates. Please check the file format.",
        { variant: "error" }
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Table row selection
  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    preserveSelectedRowKeys: true,
  };

  // Bulk actions
  const handleBulkDisable = async () => {
    if (selectedRowKeys.length === 0) return;

    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedRowKeys.map((id) => toggleCandidateStatus(id).unwrap())
      );
      enqueueSnackbar(
        `Successfully updated status for ${selectedRowKeys.length} candidates`,
        { variant: "success" }
      );
      setSelectedRowKeys([]);
      refetch();
    } catch (error) {
      console.error("Bulk disable error:", error);
      enqueueSnackbar(
        error?.data?.message ||
          "Failed to update status for some candidates. Please try again.",
        { variant: "error" }
      );
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRowKeys.length === 0) return;

    setBulkActionLoading(true);
    try {
      await Promise.all(
        selectedRowKeys.map((id) => deleteCandidate(id).unwrap())
      );
      enqueueSnackbar(
        `Successfully deleted ${selectedRowKeys.length} candidates`,
        { variant: "success" }
      );
      setSelectedRowKeys([]);
      refetch();
    } catch (error) {
      console.error("Bulk delete error:", error);
      enqueueSnackbar(
        error?.data?.message ||
          "Failed to delete some candidates. Please try again.",
        { variant: "error" }
      );
    } finally {
      setBulkActionLoading(false);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <UserOutlined style={{ color: "#da2c46" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {text}
              {isRecentlyUpdated(record.updatedAt) && (
                <Tooltip title="Recently updated profile within the last 2 days">
                  <span className="glow-dot" />
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 200,
      render: (createdBy) => {
        if (!createdBy) {
          return <Text type="secondary">N/A</Text>;
        }

        return (
          <Space direction="vertical" size={0}>
            <Text strong style={{ fontSize: 13 }}>
              {createdBy.fullName}
            </Text>
            <Text
              type="secondary"
              style={{
                fontSize: 12,
                wordBreak: "break-all",
              }}
            >
              {createdBy.email}
            </Text>
          </Space>
        );
      },
    },
    {
      title: "Candidate Code",
      dataIndex: "uniqueCode",
      key: "uniqueCode",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{text || "N/A"}</span>
        </div>
      ),
    },
    {
      title: "Source",
      dataIndex: "enteringCandidate",
      render: (_, record) => (
        <Tag color="purple">{getCandidateSource(record)}</Tag>
      ),
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MailOutlined style={{ color: "#1890ff" }} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PhoneOutlined style={{ color: "#52c41a" }} />
          <span>{text || "-"}</span>
        </div>
      ),
    },

    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      render: (text) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BankOutlined style={{ color: "#722ed1" }} />
          <span>{text || "-"}</span>
        </div>
      ),
    },

    {
      title: "Status",
      dataIndex: "accountStatus",
      key: "accountStatus",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status || "inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      fixed: "right",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewCandidate(record._id)}
            />
          </Tooltip>
          <Tooltip title="Edit Candidate">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
          <Tooltip
            title={
              record.accountStatus === "active"
                ? "Disable Candidate"
                : "Enable Candidate"
            }
          >
            <Button
              type="text"
              icon={<StopOutlined />}
              onClick={() => showDisableModal(record)}
              danger={record.accountStatus === "active"}
            />
          </Tooltip>
          <Tooltip title="Delete Candidate">
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => showDeleteModal(record)}
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const bulkActionMenu = (
    <Menu
      items={[
        {
          key: "1",
          label: "Enable Selected",
          icon: <CheckCircleOutlined />,
          onClick: handleBulkDisable,
          disabled: selectedRowKeys.length === 0,
        },
        {
          key: "2",
          label: "Disable Selected",
          icon: <StopOutlined />,
          onClick: handleBulkDisable,
          disabled: selectedRowKeys.length === 0,
        },
        {
          key: "3",
          label: "Delete Selected",
          icon: <DeleteOutlined />,
          danger: true,
          onClick: handleBulkDelete,
          disabled: selectedRowKeys.length === 0,
        },
      ]}
    />
  );

  return (
    <>
      <div className="candidate-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              minWidth: "200px",
            }}
          >
            <TeamOutlined
              size={24}
              style={{ marginRight: "8px", color: "#2c3e50" }}
            />
            <Title
              level={2}
              className="candidate-title"
              style={{ margin: 0, color: "#2c3e50", fontSize: "22px" }}
            >
              Candidate Management
            </Title>
          </div>

          {/* Search and Button Section */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              flex: 1,
              justifyContent: "flex-end",
              minWidth: "300px",
            }}
          >
            <Input.Search
              placeholder="Search Candidates"
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                maxWidth: "300px",
                width: "100%",
                borderRadius: "8px",
                height: "35px",
              }}
              size="large"
              className="custom-search-input"
            />

            {selectedRowKeys.length > 0 && (
              <Dropdown overlay={bulkActionMenu} placement="bottomRight">
                <Button
                  type="primary"
                  size="large"
                  icon={<MoreOutlined />}
                  loading={bulkActionLoading}
                  style={{
                    background: "#da2c46",
                    height: "48px",
                    minWidth: "150px",
                  }}
                >
                  Bulk Actions ({selectedRowKeys.length})
                </Button>
              </Dropdown>
            )}

            <Button
              type="default"
              size="large"
              icon={<UploadOutlined />}
              onClick={handleBulkImport}
              className="candidate-button bulk-import-btn"
              style={{
                border: "1px solid #da2c46",
                color: "#da2c46",
                height: "48px",
                minWidth: "150px",
              }}
            >
              Bulk Import
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={showCreateModal}
              className="candidate-button add-candidate-btn"
              style={{
                background:
                  "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
                height: "48px",
                minWidth: "200px",
              }}
            >
              Add New Candidate
            </Button>
          </div>
        </div>
      </div>

      {bulkImportResult && (
        <Alert
          message="Bulk Import Summary"
          description={
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              <p>
                <b>{bulkImportResult.insertedCount}</b> candidates inserted
                successfully.
              </p>
              {bulkImportResult.duplicateCount > 0 && (
                <>
                  <p>
                    <b>{bulkImportResult.duplicateCount}</b> duplicates found:
                  </p>
                  <ul>
                    {bulkImportResult.duplicates.map((dup, idx) => (
                      <li key={idx}>
                        <b>{dup.email}</b> – {dup.reason}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {bulkImportResult.invalidCount > 0 && (
                <>
                  <p>
                    <b>{bulkImportResult.invalidCount}</b> invalid records:
                  </p>
                  <ul>
                    {bulkImportResult.invalid.map((inv, idx) => (
                      <li key={idx}>
                        <b>{inv.email}</b> – {inv.reason}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          }
          type="info"
          showIcon
          closable
          style={{ marginBottom: 16 }}
          onClose={() => setBulkImportResult(null)}
        />
      )}

      <div
        style={{
          padding: "16px",
          minHeight: "100vh",
          "@media (min-width: 576px)": {
            padding: "24px",
          },
          "@media (min-width: 768px)": {
            padding: "32px",
          },
        }}
      >
        {isLoading ? (
          <div>
            <SkeletonLoader />
          </div>
        ) : candidates?.length > 0 ? (
          <>
            <Table
              rowKey="_id"
              columns={columns}
              dataSource={candidates}
              rowSelection={rowSelection}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalCount,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} candidates`,
                pageSizeOptions: ["10", "20", "40", "80", "160"],
                onChange: handlePageChange,
                onShowSizeChange: handlePageChange,
              }}
              scroll={{ x: "max-content" }}
              style={{ marginTop: "16px" }}
            />
          </>
        ) : (
          <Card
            style={{
              borderRadius: "12px",
              marginTop: "16px",
              textAlign: "center",
            }}
          >
            {isError ? (
              <Result
                status="500"
                title="500"
                subTitle="Oops! Something went wrong while loading candidates."
              />
            ) : searchTerm ? (
              <Result
                status="404"
                title="No Results"
                subTitle="No candidates found matching your search."
              />
            ) : (
              <Result
                status="404"
                title="No Candidates Yet"
                subTitle="You haven't added any candidates so far."
              />
            )}
          </Card>
        )}
      </div>

      {/* Candidate Form Modal */}
      <CandidateFormModal
        visible={candidateModalVisible}
        onCancel={handleCandidateModalClose}
        form={form}
        editingCandidate={editingCandidate}
        isLoadingCandidate={isLoadingCandidate}
      />
      {/* Candidate View Modal */}
      <CandidateViewDrawer
        visible={viewDrawerVisible}
        onClose={handleViewDrawerClose}
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
            accept=".csv,.xls,.xlsx"
            showUploadList={{
              showRemoveIcon: true,
            }}
          >
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: "32px", color: "#da2c46" }} />
            </p>
            <p className="ant-upload-text">
              Click or drag CSV, XLSX file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single CSV, XLSX file upload only.
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
              color: "white",
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
              <li>Required columns:First Name OR Full Name, Email, Password</li>
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
                  "First Name",
                  "Middle Name",
                  "Last Name",
                  "Full Name",
                  "Email",
                  "Country Code",
                  "Phone Number",
                  "Password",
                  "Company Name",
                  "Specialization",
                  "Qualifications",
                  "Agency",
                  "Work Order Hint",
                  "Client",
                  "Nationality",
                ];

                const sampleRow = [
                  "John",
                  "Michael",
                  "Doe",
                  "John Michael Doe",
                  "john.doe@example.com",
                  "91",
                  "9876543210",
                  "password123",
                  "Acme Corp",
                  "React.js Developer",
                  "B.Tech in Computer Science",
                  "Demo",
                  "This is demo work order candidate",
                  "Demo-123",
                  "Indian",
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
    </>
  );
};

export default AdminCandidates;
