import React, { useState } from "react";
import { Modal, Button, Upload, message, Alert } from "antd";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";

const ImportEmployeeCSVModal = ({ visible, onCancel, onImport, isLoading }) => {
  const [fileList, setFileList] = useState([]);
  const [previewData, setPreviewData] = useState([]);

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error("Please select a CSV file");
      return;
    }

    const file = fileList[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          message.error(
            "CSV file must contain headers and at least one employee"
          );
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

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
          return;
        }

        const employees = lines
          .slice(1)
          .map((line, index) => {
            // Handle commas within quoted fields
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
            const cleanedValues = values.map((v) =>
              v.replace(/^"|"$/g, "").trim()
            );

            const employee = {};
            headers.forEach((header, idx) => {
              employee[header] = cleanedValues[idx] || "";
            });

            // Validate essential fields
            if (
              !employee.firstname ||
              !employee.lastname ||
              !employee.email ||
              !employee.phone ||
              !employee.password
            ) {
              console.warn(`Row ${index + 2}: Missing required fields`);
              return null;
            }

            // Map to expected format
            return {
              firstName: employee.firstname,
              middleName: employee.middlename || "",
              lastName: employee.lastname,
              email: employee.email,
              phone: employee.phone,
              password: employee.password,

              // Mandatory fields
              assignedJobTitle: employee.assignedjobtitle || "",
              category: employee.category || "",
              eramId: employee.eramid || "",
              dateOfJoining: employee.dateofjoining || "",
              officialEmail: employee.officialemail || "",

              // Optional basic fields
              badgeNo: employee.badgeno || "",
              gatePassId: employee.gatepassid || "",
              aramcoId: employee.aramcoid || "",
              otherId: employee.otherid || "",
              plantId: employee.plantid || "",

              // NEW FIELDS - Add these:
              externalEmpNo: employee.externalempno || "",
              designation: employee.designation || "",
              visaCategory: employee.visacategory || "",
              employeeGroup: employee.employeegroup || "",
              employmentType: employee.employmenttype || "",
              payrollGroup: employee.payrollgroup || "",
              sponsorName: employee.sponsorname || "",
              workHours: employee.workhours || "",
              workDays: employee.workdays || "",
              airTicketFrequency: employee.airticketfrequency || "",
              probationPeriod: employee.probationperiod || "",
              periodOfContract: employee.periodofcontract || "",
              workLocation: employee.worklocation || "",
              familyStatus: employee.familystatus || "",
              lastArrival: employee.lastarrival || "",
              eligibleVacationDays: employee.eligiblevacationdays || "",
              eligibleVacationMonth: employee.eligiblevacationmonth || "",

              // IQAMA Details
              iqamaId: employee.iqamaid || "",
              iqamaIssueDate: employee.iqamaissuedate || "",
              iqamaExpiryDate: employee.iqamaexpirydate || "",
              iqamaArabicDateOfIssue: employee.iqamaarabicdateofissue || "",
              iqamaArabicDateOfExpiry: employee.iqamaarabicdateofexpiry || "",

              // Insurance & Benefits
              gosi: employee.gosi || "",
              drivingLicense: employee.drivinglicense || "",
              medicalPolicy: employee.medicalpolicy || "",
              medicalPolicyNumber: employee.medicalpolicynumber || "",
              noOfDependent: employee.noofdependent || "",
              insuranceCategory: employee.insurancecategory || "",
              classCode: employee.classcode || "",
              assetAllocation: employee.assetallocation
                ? employee.assetallocation.split(";").map((s) => s.trim())
                : [],

              // Other fields
              lastWorkingDay: employee.lastworkingday || "",
              firstTimeLogin: employee.firsttimelogin || "",

              basicAssets: employee.basicassets || "",
              reportingAndDocumentation:
                employee.reportinganddocumentation || "",
            };
          })
          .filter(Boolean);

        if (employees.length === 0) {
          message.error("No valid employee data found in CSV");
          return;
        }

        setPreviewData(employees);
        message.info(
          `Found ${employees.length} valid employees to import. Click Import to proceed.`
        );
        onImport({ employees });
        setFileList([]);
        setPreviewData([]);
      } catch (error) {
        console.error("CSV parsing error:", error);
        message.error("Error parsing CSV file. Please check the format.");
      }
    };

    reader.onerror = () => {
      message.error("Error reading file");
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const headers = [
      "firstname", // Changed from "firstName"
      "middlename", // Changed from "middleName"
      "lastname", // Changed from "lastName"
      "email",
      "phone",
      "password",
      "assignedjobtitle", // Changed from "assignedJobTitle"
      "category",
      "eramid", // Changed from "eramId"
      "badgeno", // Changed from "badgeNo"
      "dateofjoining", // Changed from "dateOfJoining"
      "gatepassid", // Changed from "gatePassId"
      "aramcoid", // Changed from "aramcoId"
      "otherid", // Changed from "otherId"
      "plantid", // Changed from "plantId"
      "officialemail", // Changed from "officialEmail"
      "basicassets", // Changed from "basicAssets"
      "reportinganddocumentation", // Changed

      // ADD NEW FIELDS HERE:
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
      "966501234567",
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

      // NEW FIELDS (30+ values):
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
      return false;
    },
    fileList,
    onRemove: () => {
      setFileList([]);
      setPreviewData([]);
    },
    maxCount: 1,
  };

  const handleCancel = () => {
    setFileList([]);
    setPreviewData([]);
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
      onCancel={handleCancel}
      onOk={handleUpload}
      okText="Import"
      confirmLoading={isLoading}
      okButtonProps={{
        style: { backgroundColor: "#da2c46", borderColor: "#da2c46" },
        disabled: fileList.length === 0,
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
                Required columns: firstName*, lastName*, email*, phone*,
                password*, assignedJobTitle*, category*, eramId*,
                dateOfJoining*, officialEmail*
              </p>
              <p style={{ marginBottom: 0 }}>
                Optional columns: middleName, badgeNo, gatePassId, aramcoId,
                otherId, plantId, externalEmpNo, designation, visaCategory,
                employeeGroup, employmentType, payrollGroup, sponsorName,
                workHours, workDays, airTicketFrequency, probationPeriod,
                periodOfContract, workLocation, familyStatus, lastArrival,
                eligibleVacationDays, eligibleVacationMonth, iqamaId,
                iqamaIssueDate, iqamaExpiryDate, iqamaArabicDateOfIssue,
                iqamaArabicDateOfExpiry, gosi, drivingLicense, medicalPolicy,
                medicalPolicyNumber, noOfDependent, insuranceCategory,
                classCode, assetAllocation (semicolon-separated),
                lastWorkingDay, firstTimeLogin, basicAssets,
                reportingAndDocumentation
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

        {/* CSV Format Example */}
        <div>
          <p style={{ fontWeight: 500, marginBottom: "8px" }}>CSV Format:</p>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              padding: "12px",
              borderRadius: "4px",
              fontSize: "12px",
              fontFamily: "monospace",
              overflowX: "auto",
            }}
          >
            <div>firstName,middleName,lastName,email,phone,password,...</div>
            <div>John,M,Doe,john1@example.com,966501234567,pass123,...</div>
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
            <p style={{ fontWeight: 500, marginBottom: "8px" }}>
              Preview ({previewData.length} employees):
            </p>
            <div
              style={{
                maxHeight: "200px",
                overflowY: "auto",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
                padding: "8px",
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
                Phone numbers must include country code (e.g., 966501234567 for
                Saudi Arabia)
              </li>
              <li>Do NOT use + or any symbols before phone numbers</li>
              <li>
                Full name will be auto-generated from firstName, middleName, and
                lastName
              </li>
              <li>Passwords will be encrypted before storing</li>
              <li>Duplicate emails will be skipped</li>
              <li>Date format should be YYYY-MM-DD</li>
              <li>All employees will be created with 'employee' role</li>
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
