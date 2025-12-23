import React, { useState } from "react";
import { Modal, Button, Upload, message, Alert } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import { useSnackbar } from "notistack";

const ImportEmployeeCSVModal = ({ visible, onCancel, onImport, isLoading }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [fileList, setFileList] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [parsedEmployees, setParsedEmployees] = useState([]); // Store parsed data

  const handleFileUpload = async (file) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        let rows = [];

        // Check file type and parse accordingly
        if (file.name.endsWith(".csv")) {
          // Parse CSV
          const text = e.target.result;
          const lines = text.split("\n").filter((line) => line.trim());

          if (lines.length < 2) {
            message.error(
              "CSV file must contain headers and at least one employee"
            );
            setFileList([]);
            return;
          }

          const parseCSVLine = (line) => {
            const result = [];
            let current = "";
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];

              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === "," && !inQuotes) {
                result.push(current.trim());
                current = "";
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };

          const headers = parseCSVLine(lines[0]).map((h) =>
            h.toLowerCase().trim()
          );
          rows = lines.slice(1).map((line) => {
            const values = parseCSVLine(line);
            const row = {};
            headers.forEach((header, idx) => {
              row[header] = values[idx] || "";
            });
            return row;
          });
        } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
          // Parse Excel using SheetJS
          const XLSX = await import("xlsx");
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false, // Keep as strings
            defval: "", // Default value for empty cells
          });

          if (jsonData.length === 0) {
            message.error("Excel file must contain at least one employee row");
            setFileList([]);
            return;
          }

          // Normalize headers to lowercase
          rows = jsonData.map((row) => {
            const normalizedRow = {};
            Object.keys(row).forEach((key) => {
              normalizedRow[key.toLowerCase().trim()] = row[key];
            });
            return normalizedRow;
          });
        }

        // Rest of your existing validation code stays the same...
        const parsePhoneNumber = (phoneStr) => {
          if (!phoneStr || phoneStr.trim() === "") return "";
          let phone = phoneStr.trim();
          if (phone.includes("E") || phone.includes("e")) {
            try {
              const num = parseFloat(phone);
              if (!isNaN(num)) {
                phone = num.toFixed(0);
              }
            } catch (e) {
              console.warn("Failed to parse phone number:", phoneStr);
            }
          }
          phone = phone.replace(/[^\d+]/g, "");
          phone = phone.replace(/^\+/, "");
          return phone;
        };

        // Validate required headers
        const firstRow = rows[0];
        const headers = Object.keys(firstRow);
        const requiredHeaders = [
          "firstname",
          "lastname",
          "email",
          "phone",
          "password",
        ];
        const missingHeaders = requiredHeaders.filter(
          (header) => !headers.includes(header)
        );

        if (missingHeaders.length > 0) {
          message.error(
            `Missing required headers: ${missingHeaders.join(", ")}`
          );
          setFileList([]);
          return;
        }

        // Helper functions (keep existing ones)
        const getDateOrEmpty = (dateStr) => {
          if (!dateStr || dateStr.trim() === "") return "";
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return "";
          return dateStr.trim();
        };

        const getNumberOrEmpty = (numStr) => {
          if (!numStr || numStr.trim() === "") return "";
          const num = Number(numStr.trim());
          return isNaN(num) ? "" : numStr.trim();
        };

        // Map rows to employee objects (keep your existing mapping logic)
        // Map rows to employee objects
        const employees = rows
          .map((employee, index) => {
            // Use lowercase keys since CSV headers are normalized to lowercase
            const firstName = employee.firstname || employee.firstName || "";
            const middleName = employee.middlename || employee.middleName || "";
            const lastName = employee.lastname || employee.lastName || "";
            const email = employee.email || "";
            const phone = parsePhoneNumber(employee.phone || "");
            const password = employee.password || "";

            // Validate required fields
            if (!firstName || !lastName || !email || !phone || !password) {
              console.warn(`Row ${index + 2}: Missing required fields`, {
                firstName,
                lastName,
                email,
                phone,
                password,
              });
              return null;
            }

            return {
              firstName: firstName,
              middleName: middleName,
              lastName: lastName,
              email: email,
              phone: phone,
              password: password,
              assignedJobTitle:
                employee.assignedjobtitle || employee.assignedJobTitle || "",
              category: employee.category || "",
              eramId: employee.eramid || employee.eramId || "",
              dateOfJoining: getDateOrEmpty(
                employee.dateofjoining || employee.dateOfJoining
              ),
              officialEmail:
                employee.officialemail || employee.officialEmail || "",
              badgeNo: employee.badgeno || employee.badgeNo || "",
              gatePassId: employee.gatepassid || employee.gatePassId || "",
              aramcoId: employee.aramcoid || employee.aramcoId || "",
              otherId: employee.otherid || employee.otherId || "",
              plantId: employee.plantid || employee.plantId || "",
              externalEmpNo:
                employee.externalempno || employee.externalEmpNo || "",
              designation: employee.designation || "",
              visaCategory:
                employee.visacategory || employee.visaCategory || "",
              employeeGroup:
                employee.employeegroup || employee.employeeGroup || "",
              employmentType:
                employee.employmenttype || employee.employmentType || "",
              payrollGroup:
                employee.payrollgroup || employee.payrollGroup || "",
              sponsorName: employee.sponsorname || employee.sponsorName || "",
              workHours: getNumberOrEmpty(
                employee.workhours || employee.workHours
              ),
              workDays: getNumberOrEmpty(
                employee.workdays || employee.workDays
              ),
              airTicketFrequency:
                employee.airticketfrequency ||
                employee.airTicketFrequency ||
                "",
              probationPeriod:
                employee.probationperiod || employee.probationPeriod || "",
              periodOfContract:
                employee.periodofcontract || employee.periodOfContract || "",
              workLocation:
                employee.worklocation || employee.workLocation || "",
              familyStatus:
                employee.familystatus || employee.familyStatus || "",
              lastArrival: getDateOrEmpty(
                employee.lastarrival || employee.lastArrival
              ),
              eligibleVacationDays: getNumberOrEmpty(
                employee.eligiblevacationdays || employee.eligibleVacationDays
              ),
              eligibleVacationMonth: getNumberOrEmpty(
                employee.eligiblevacationmonth || employee.eligibleVacationMonth
              ),
              iqamaId: employee.iqamaid || employee.iqamaId || "",
              iqamaIssueDate: getDateOrEmpty(
                employee.iqamaissuedate || employee.iqamaIssueDate
              ),
              iqamaExpiryDate: getDateOrEmpty(
                employee.iqamaexpirydate || employee.iqamaExpiryDate
              ),
              iqamaArabicDateOfIssue: getDateOrEmpty(
                employee.iqamaarabicdateofissue ||
                  employee.iqamaArabicDateOfIssue
              ),
              iqamaArabicDateOfExpiry: getDateOrEmpty(
                employee.iqamaarabicdateofexpiry ||
                  employee.iqamaArabicDateOfExpiry
              ),
              gosi: employee.gosi || "",
              drivingLicense:
                employee.drivinglicense || employee.drivingLicense || "",
              medicalPolicy:
                employee.medicalpolicy || employee.medicalPolicy || "",
              medicalPolicyNumber:
                employee.medicalpolicynumber ||
                employee.medicalPolicyNumber ||
                "",
              noOfDependent: getNumberOrEmpty(
                employee.noofdependent || employee.noOfDependent
              ),
              insuranceCategory:
                employee.insurancecategory || employee.insuranceCategory || "",
              classCode: employee.classcode || employee.classCode || "",
              assetAllocation:
                employee.assetallocation || employee.assetAllocation
                  ? (employee.assetallocation || employee.assetAllocation)
                      .split(";")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : [],
              lastWorkingDay: getDateOrEmpty(
                employee.lastworkingday || employee.lastWorkingDay
              ),
              firstTimeLogin:
                employee.firsttimelogin || employee.firstTimeLogin || "",
              basicAssets: employee.basicassets || employee.basicAssets || "",
              reportingAndDocumentation:
                employee.reportinganddocumentation ||
                employee.reportingAndDocumentation ||
                "",
            };
          })
          .filter(Boolean);

        if (employees.length === 0) {
          message.error("No valid employee data found in file");
          setFileList([]);
          return;
        }

        setParsedEmployees(employees);
        setPreviewData(employees);
        message.success(
          `✓ Parsed ${employees.length} valid employee(s). Review and click Import.`
        );
      } catch (error) {
        console.error("File parsing error:", error);
        message.error("Error parsing file. Please check the format.");
        setFileList([]);
      }
    };

    reader.onerror = () => {
      message.error("Error reading file");
      setFileList([]);
    };

    // Read as ArrayBuffer for Excel, Text for CSV
    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  // Import button handler
  const handleImport = () => {
    if (parsedEmployees.length === 0) {
      message.error("No employees to import. Please upload a valid CSV file.");
      return;
    }

    onImport({ employees: parsedEmployees });
  };

  const downloadTemplate = () => {
    const headers = [
      "firstname",
      "middlename",
      "lastname",
      "email",
      "phone",
      "password",
      "assignedjobtitle",
      "category",
      "eramid",
      "badgeno",
      "dateofjoining",
      "gatepassid",
      "aramcoid",
      "otherid",
      "plantid",
      "officialemail",
      "basicassets",
      "reportinganddocumentation",
      "externalempno",
      "designation",
      "visacategory",
      "employeegroup",
      "employmenttype",
      "payrollgroup",
      "sponsorname",
      "workhours",
      "workdays",
      "airticketfrequency",
      "probationperiod",
      "periodofcontract",
      "worklocation",
      "familystatus",
      "lastarrival",
      "eligiblevacationdays",
      "eligiblevacationmonth",
      "iqamaid",
      "iqamaissuedate",
      "iqamaexpirydate",
      "iqamaarabicdateofissue",
      "iqamaarabicdateofexpiry",
      "gosi",
      "drivinglicense",
      "medicalpolicy",
      "medicalpolicynumber",
      "noofdependent",
      "insurancecategory",
      "classcode",
      "assetallocation",
      "lastworkingday",
      "firsttimelogin",
    ];

    const sampleData = [
      "John",
      "M",
      "Doe",
      "john.doe@example.com",
      "='966501234567'",
      "password123",
      "Software Engineer",
      "IT",
      "EMP001",
      "BADGE001",
      "2024-01-15",
      "GATE001",
      "ARAMCO001",
      "OTHER001",
      "PLANT001",
      "john.doe@company.com",
      "Laptop, Phone",
      "Weekly reports",
      "EXT001",
      "Senior Dev",
      "Work Visa",
      "Technical",
      "SUPPLIER",
      "Monthly",
      "Saudi Aramco",
      "8",
      "5",
      "Annual",
      "3 months",
      "2 years",
      "Riyadh Office",
      "Family",
      "2024-01-01",
      "22",
      "11",
      "IQA123456",
      "2023-01-01",
      "2025-01-01",
      "1444-06-10",
      "1446-06-10",
      "YES",
      "YES",
      "Y",
      "POL12345",
      "3",
      "Premium",
      "A1",
      "Laptop;Phone;Access Card",
      "",
      "Y",
    ];

    const csvContent = [headers.join(","), sampleData.join(",")].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee_import_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    message.success("Template downloaded successfully");
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isValidFormat =
        file.name.endsWith(".csv") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls");
      if (!isValidFormat) {
        enqueueSnackbar(
          "Please upload a CSV or Excel file (.csv, .xlsx, .xls)",
          {
            variant: "warning",
          }
        );
        return false;
      }
      setFileList([file]);
      handleFileUpload(file); // Parse immediately when file is selected
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
      setPreviewData([]);
      setParsedEmployees([]);
    },
    maxCount: 1,
  };

  const handleModalCancel = () => {
    setFileList([]);
    setPreviewData([]);
    setParsedEmployees([]);
    onCancel();
  };

  return (
    <Modal
      title={
        <span style={{ color: "#da2c46", fontSize: "18px" }}>
          Import Employees from CSV
        </span>
      }
      open={visible}
      onCancel={handleModalCancel}
      onOk={handleImport}
      okText="Import"
      confirmLoading={isLoading}
      okButtonProps={{
        style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
        disabled: parsedEmployees.length === 0,
      }}
      width={800}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Instructions */}
        <Alert
          message="Import Instructions"
          description={
            <div>
              <p style={{ marginBottom: "8px" }}>
                Upload a CSV or Excel file (.csv, .xlsx, .xls) with employee
                data. Required fields are marked with *.
              </p>
              <p style={{ marginBottom: "8px", fontWeight: 500 }}>
                <strong>Required columns:</strong> firstName*, lastName*,
                email*, phone*, password*
              </p>
              <p style={{ marginBottom: "8px", fontWeight: 500 }}>
                <strong>Recommended columns:</strong> assignedJobTitle,
                category, eramId, dateOfJoining (YYYY-MM-DD), officialEmail
              </p>
              <p style={{ marginBottom: 0, fontSize: "12px", color: "#666" }}>
                All other fields are optional. Download the template below to
                see all available columns.
              </p>
            </div>
          }
          type="info"
          showIcon
        />

        {/* Template Download */}
        <div
          style={{
            padding: "16px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            border: "1px dashed #d9d9d9",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ margin: 0, fontWeight: 500, marginBottom: "4px" }}>
                Download CSV Template
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
                Use this template to format your employee data correctly
              </p>
            </div>
            <Button
              icon={<DownloadOutlined />}
              onClick={downloadTemplate}
              type="primary"
              ghost
              style={{ borderColor: "#da2c46", color: "#da2c46" }}
            >
              Download Template
            </Button>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <p style={{ fontWeight: 500, marginBottom: "8px" }}>
            Upload CSV File:
          </p>
          <Upload {...uploadProps}>
            <Button
              icon={<UploadOutlined />}
              style={{ width: "100%" }}
              size="large"
            >
              Select CSV or Excel File
            </Button>
          </Upload>
        </div>

        {/* Preview */}
        {previewData.length > 0 && (
          <div>
            <p
              style={{ fontWeight: 500, marginBottom: "8px", color: "#52c41a" }}
            >
              ✓ Preview ({previewData.length} employees ready to import):
            </p>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                padding: "8px",
                backgroundColor: "#fafafa",
              }}
            >
              {previewData.slice(0, 5).map((emp, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "8px",
                    borderBottom:
                      idx < 4 && idx < previewData.length - 1
                        ? "1px solid #f0f0f0"
                        : "none",
                  }}
                >
                  <strong>
                    {emp.firstName} {emp.middleName} {emp.lastName}
                  </strong>{" "}
                  - {emp.email} - {emp.phone}
                </div>
              ))}
              {previewData.length > 5 && (
                <div
                  style={{ padding: "8px", color: "#666", fontStyle: "italic" }}
                >
                  ... and {previewData.length - 5} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Important Notes */}
        <Alert
          message="Important Notes"
          description={
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              <li>
                Date format must be <strong>YYYY-MM-DD</strong> (e.g.,
                2024-01-15)
              </li>
              <li>
                <strong>Phone numbers:</strong> Include country code without +
                symbol (e.g., 966501234567)
                <br />
                <span style={{ fontSize: "12px", color: "#ff4d4f" }}>
                  ⚠ In Excel: Format phone column as TEXT or prefix with
                  apostrophe (='966501234567') to prevent scientific notation
                </span>
              </li>
              <li>Boolean fields accept: Y/N, Yes/No, True/False, 1/0</li>
              <li>Empty optional fields are allowed</li>
              <li>Duplicate emails will be skipped</li>
              <li>Invalid entries will be reported after import</li>
            </ul>
          }
          type="warning"
          showIcon
        />
      </div>
    </Modal>
  );
};

export default ImportEmployeeCSVModal;
