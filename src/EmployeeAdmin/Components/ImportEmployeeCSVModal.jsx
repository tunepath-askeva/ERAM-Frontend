import React, { useState } from "react";
import { Modal, Button, Upload, message, Alert } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";

const ImportEmployeeCSVModal = ({ visible, onCancel, onImport, isLoading }) => {
  const [fileList, setFileList] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [parsedEmployees, setParsedEmployees] = useState([]); // Store parsed data

  // Parse CSV when file is uploaded
  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          message.error(
            "CSV file must contain headers and at least one employee"
          );
          setFileList([]);
          return;
        }

        // Parse CSV properly handling quoted fields and empty values
        // Parse CSV properly handling quoted fields and empty values
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

        // ADD THIS NEW HELPER FUNCTION
        const parsePhoneNumber = (phoneStr) => {
          if (!phoneStr || phoneStr.trim() === "") return "";

          let phone = phoneStr.trim();

          // Handle scientific notation (e.g., 9.66501E+11)
          if (phone.includes("E") || phone.includes("e")) {
            try {
              // Convert scientific notation to regular number
              const num = parseFloat(phone);
              if (!isNaN(num)) {
                phone = num.toFixed(0); // Convert to string without decimals
              }
            } catch (e) {
              console.warn("Failed to parse phone number:", phoneStr);
            }
          }

          // Remove any non-digit characters except leading +
          phone = phone.replace(/[^\d+]/g, "");

          // Remove + if present (as backend expects numbers without +)
          phone = phone.replace(/^\+/, "");

          return phone;
        };

        const headers = parseCSVLine(lines[0]).map((h) =>
          h.toLowerCase().trim()
        );

        // Validate required headers
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

        // Helper function to safely get date or empty string
        const getDateOrEmpty = (dateStr) => {
          if (!dateStr || dateStr.trim() === "") return "";
          // Validate date format YYYY-MM-DD
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return "";
          return dateStr.trim();
        };

        // Helper function to safely get number or empty string
        const getNumberOrEmpty = (numStr) => {
          if (!numStr || numStr.trim() === "") return "";
          const num = Number(numStr.trim());
          return isNaN(num) ? "" : numStr.trim();
        };

        const employees = lines
          .slice(1)
          .map((line, index) => {
            const values = parseCSVLine(line);

            // Create object with proper mapping
            const employee = {};
            headers.forEach((header, idx) => {
              const value = values[idx] || "";
              employee[header] = value.trim();
            });

            // Validate essential fields
            if (
              !employee.firstname ||
              !employee.lastname ||
              !employee.email ||
              !employee.phone ||
              !employee.password
            ) {
              console.warn(
                `Row ${index + 2}: Missing required fields`,
                employee
              );
              return null;
            }

            // Map to expected format with proper validation
            return {
              firstName: employee.firstname || "",
              middleName: employee.middlename || "",
              lastName: employee.lastname || "",
              email: employee.email || "",
              phone: parsePhoneNumber(employee.phone),
              password: employee.password || "",

              // Mandatory fields - but allow empty for backend validation
              assignedJobTitle: employee.assignedjobtitle || "",
              category: employee.category || "",
              eramId: employee.eramid || "",
              dateOfJoining: getDateOrEmpty(employee.dateofjoining),
              officialEmail: employee.officialemail || "",

              // Optional fields
              badgeNo: employee.badgeno || "",
              gatePassId: employee.gatepassid || "",
              aramcoId: employee.aramcoid || "",
              otherId: employee.otherid || "",
              plantId: employee.plantid || "",

              // New fields with proper handling
              externalEmpNo: employee.externalempno || "",
              designation: employee.designation || "",
              visaCategory: employee.visacategory || "",
              employeeGroup: employee.employeegroup || "",
              employmentType: employee.employmenttype || "",
              payrollGroup: employee.payrollgroup || "",
              sponsorName: employee.sponsorname || "",
              workHours: getNumberOrEmpty(employee.workhours),
              workDays: getNumberOrEmpty(employee.workdays),
              airTicketFrequency: employee.airticketfrequency || "",
              probationPeriod: employee.probationperiod || "",
              periodOfContract: employee.periodofcontract || "",
              workLocation: employee.worklocation || "",
              familyStatus: employee.familystatus || "",
              lastArrival: getDateOrEmpty(employee.lastarrival),
              eligibleVacationDays: getNumberOrEmpty(
                employee.eligiblevacationdays
              ),
              eligibleVacationMonth: getNumberOrEmpty(
                employee.eligiblevacationmonth
              ),

              // IQAMA Details
              iqamaId: employee.iqamaid || "",
              iqamaIssueDate: getDateOrEmpty(employee.iqamaissuedate),
              iqamaExpiryDate: getDateOrEmpty(employee.iqamaexpirydate),
              iqamaArabicDateOfIssue: getDateOrEmpty(
                employee.iqamaarabicdateofissue
              ),
              iqamaArabicDateOfExpiry: getDateOrEmpty(
                employee.iqamaarabicdateofexpiry
              ),

              // Insurance & Benefits
              gosi: employee.gosi || "",
              drivingLicense: employee.drivinglicense || "",
              medicalPolicy: employee.medicalpolicy || "",
              medicalPolicyNumber: employee.medicalpolicynumber || "",
              noOfDependent: getNumberOrEmpty(employee.noofdependent),
              insuranceCategory: employee.insurancecategory || "",
              classCode: employee.classcode || "",
              assetAllocation: employee.assetallocation
                ? employee.assetallocation
                    .split(";")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [],

              // Other fields
              lastWorkingDay: getDateOrEmpty(employee.lastworkingday),
              firstTimeLogin: employee.firsttimelogin || "",
              basicAssets: employee.basicassets || "",
              reportingAndDocumentation:
                employee.reportinganddocumentation || "",
            };
          })
          .filter(Boolean);

        if (employees.length === 0) {
          message.error("No valid employee data found in CSV");
          setFileList([]);
          return;
        }

        setParsedEmployees(employees); // Store parsed data
        setPreviewData(employees);
        message.success(
          `✓ Parsed ${employees.length} valid employee(s). Review and click Import.`
        );
      } catch (error) {
        console.error("CSV parsing error:", error);
        message.error("Error parsing CSV file. Please check the format.");
        setFileList([]);
      }
    };

    reader.onerror = () => {
      message.error("Error reading file");
      setFileList([]);
    };

    reader.readAsText(file);
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
      const isCsv = file.name.endsWith(".csv");
      if (!isCsv) {
        message.error("Please upload a CSV file");
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
                Upload a CSV file with employee data. Required fields are marked
                with *.
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
              Select CSV File
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
