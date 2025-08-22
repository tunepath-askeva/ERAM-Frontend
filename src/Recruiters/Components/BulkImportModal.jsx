// BulkImportModal.jsx
import React, { useState } from "react";
import {
  Modal,
  Space,
  Upload,
  Button,
  Divider,
  Typography,
  message,
} from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useSnackbar } from "notistack";

const { Paragraph, Text } = Typography;

const BulkImportModal = ({ visible, onCancel, onImport }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [fileList, setFileList] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  const beforeUpload = (file) => {
    const isCSVorExcel =
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel" ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

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

  const handleFileChange = (info) => {
    setFileList(info.fileList.slice(-1));
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
          reader.onerror = (e) => reject(new Error("Failed to read file"));
          reader.readAsText(file);
        });

        parsedData = await new Promise((resolve, reject) => {
          Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(), // Clean headers
            complete: (results) => {
              if (results.errors.length > 0) {
                console.warn("CSV parsing warnings:", results.errors);
                // Only reject on critical errors, not warnings
                const criticalErrors = results.errors.filter(error => 
                  error.type === "Delimiter" || error.type === "Quotes"
                );
                if (criticalErrors.length > 0) {
                  reject(new Error("CSV parsing error: " + criticalErrors[0].message));
                } else {
                  resolve(results.data);
                }
              } else {
                resolve(results.data);
              }
            },
            error: (error) => reject(new Error("CSV parsing failed: " + error.message)),
          });
        });
      } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const workbook = XLSX.read(e.target.result, { type: "binary" });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                defval: "",
                raw: false, // Convert everything to strings
              });
              resolve(jsonData);
            } catch (xlsxError) {
              reject(new Error("Failed to parse Excel file: " + xlsxError.message));
            }
          };
          reader.onerror = (e) => reject(new Error("Failed to read Excel file"));
          reader.readAsBinaryString(file);
        });

        parsedData = data;
      } else {
        throw new Error("Unsupported file type. Please upload a .csv or .xlsx file.");
      }

      if (!parsedData || parsedData.length === 0) {
        throw new Error("No valid data found in the file");
      }

      const candidates = [];
      let skippedRows = 0;
      const errors = [];

      parsedData.forEach((row, index) => {
        try {
          // Clean and validate data
          const fullName = (
            row["Full Name"]?.toString()?.trim() ||
            [row["First Name"], row["Middle Name"], row["Last Name"]]
              .filter(Boolean)
              .map((s) => s?.toString()?.trim())
              .join(" ")
          );

          const email = row["Email"]?.toString()?.trim()?.toLowerCase();
          const password = row["Password"]?.toString()?.trim();

          if (!fullName || !email || !password) {
            skippedRows++;
            errors.push(`Row ${index + 2}: Missing required fields (Full Name, Email, Password)`);
            return;
          }

          // Basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            skippedRows++;
            errors.push(`Row ${index + 2}: Invalid email format`);
            return;
          }

          candidates.push({
            fullName: fullName,
            email: email,
            phone: row["Phone"]?.toString()?.trim() || "",
            password: password,
            companyName: row["Company Name"]?.toString()?.trim() || 
                         row["Company"]?.toString()?.trim() || "",
            specialization: row["Specialization"]?.toString()?.trim() || "",
            qualifications: row["Qualifications"]?.toString()?.trim() || "",
            role: "candidate", // Add role here too
          });
        } catch (rowError) {
          skippedRows++;
          errors.push(`Row ${index + 2}: ${rowError.message}`);
        }
      });

      if (candidates.length === 0) {
        throw new Error(
          "No valid candidates found. Please check the file format and required fields."
        );
      }

      if (skippedRows > 0) {
        console.warn("Import warnings:", errors);
        enqueueSnackbar(
          `${skippedRows} row(s) skipped due to invalid data. Check console for details.`,
          { variant: "warning" }
        );
      }

      // Call the import function and wait for result
      const result = await onImport(candidates);
      
      // Only proceed if import was successful
      if (result && result.success !== false) {
        setFileList([]);
        enqueueSnackbar(
          `Successfully imported ${candidates.length} candidate(s)!`,
          { variant: "success" }
        );
        onCancel(); // Close modal only on success
      }

    } catch (error) {
      console.error("Import error:", error);
      
      let errorMessage = "Failed to import candidates. Please check the file format.";
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      title="Bulk Import Candidates"
      open={visible}
      onCancel={() => {
        setFileList([]);
        onCancel();
      }}
      footer={null}
      width={600}
    >
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        <Paragraph type="secondary">
          Upload a CSV or Excel file containing candidate data. The file should include
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
            <li>Supported formats: .csv, .xls, .xlsx</li>
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
              try {
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
                
                enqueueSnackbar("Template downloaded successfully!", { 
                  variant: "success" 
                });
              } catch (downloadError) {
                console.error("Download error:", downloadError);
                enqueueSnackbar("Failed to download template", { 
                  variant: "error" 
                });
              }
            }}
            style={{
              background: "linear-gradient(135deg, #da2c46 70%, #a51632 100%)",
            }}
          >
            Download Template
          </Button>
        </div>
      </Space>
    </Modal>
  );
};

export default BulkImportModal;