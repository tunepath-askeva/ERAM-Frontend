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
        const fullName =
          row["Full Name"]?.trim() ||
          [row["First Name"], row["Middle Name"], row["Last Name"]]
            .filter(Boolean)
            .map((s) => s.trim())
            .join(" ");

        const email = row["Email"]?.trim();
        const password = row["Password"]?.trim();

        if (fullName && email && password) {
          candidates.push({
            fullName: fullName || "",
            email: email?.toLowerCase() || "",
            phone: row["Phone"]?.trim() || "",
            password: password || "",
            companyName:
              row["Company Name"]?.trim() || row["Company"]?.trim() || "",
            specialization: row["Specialization"]?.trim() || "",
            qualifications: row["Qualifications"]?.trim() || "",
          });
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

      await onImport(candidates);
      setFileList([]);
      onCancel();
    } catch (error) {
      console.error("Import error:", error);
      enqueueSnackbar(
        error?.message ||
          "Failed to import candidates. Please check the file format.",
        { variant: "error" }
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      title="Bulk Import Candidates"
      open={visible}
      onCancel={onCancel}
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
