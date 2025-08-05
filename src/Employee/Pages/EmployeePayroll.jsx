import React, { useState, useRef } from "react";
import {
  Table,
  Card,
  Select,
  Button,
  Space,
  Modal,
  Row,
  Col,
  Typography,
  Tag,
  Pagination,
} from "antd";
import {
  EyeOutlined,
  DownloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useGetEmployeePayrollQuery } from "../../Slices/Employee/EmployeeApis";

const { Title ,Text} = Typography;
const { Option } = Select;

const EmployeePayroll = () => {
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const printRef = useRef();

  const { data } = useGetEmployeePayrollQuery();

  const mockPayrollData = [
    {
      id: 1,
      empName: "TORKI ALIHASAN",
      empId: "13504",
      month: "MAY",
      year: "2025",
      designation: "COLLECTOR",
      nationality: "Pakistan",
      basicSalary: 6296.0,
      hra: 1574.0,
      transportation: 630.0,
      otherAllowance: 1500.0,
      totalEarnings: 10000.0,
      deductions: 1574.0,
      netPay: 8426.0,
      status: "Paid",
      payDate: "2025-05-31",
      iqamaNo: "2037073067",
      gosiNo: "",
      daysInMonth: 31,
      presentDays: 31,
      absVacDays: 0,
      sapId: "1778",
      workArea: "",
      iban: "SA1145000000262035058001",
      bankName: "Saudi British Bank (SABB)",
      iqamaExp: "29-Aug-2025",
      doj: "01-Jan-2019",
      otHours: 0,
      remarks: "DEDUCT SAR 1,574 FOR ADVANCE HOUSING",
    },
    {
      id: 2,
      empName: "TORKI ALIHASAN",
      empId: "13504",
      month: "APRIL",
      year: "2025",
      designation: "COLLECTOR",
      nationality: "Pakistan",
      basicSalary: 6296.0,
      hra: 1574.0,
      transportation: 630.0,
      otherAllowance: 1500.0,
      totalEarnings: 10000.0,
      deductions: 1200.0,
      netPay: 8800.0,
      status: "Paid",
      payDate: "2025-04-30",
      iqamaNo: "2037073067",
      gosiNo: "",
      daysInMonth: 30,
      presentDays: 30,
      absVacDays: 0,
      sapId: "1778",
      workArea: "",
      iban: "SA1145000000262035058001",
      bankName: "Saudi British Bank (SABB)",
      iqamaExp: "29-Aug-2025",
      doj: "01-Jan-2019",
      otHours: 0,
      remarks: "ADVANCE DEDUCTION",
    },
  ];

  const columns = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      width: 120,
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      width: 100,
    },
    {
      title: "Basic Salary",
      dataIndex: "basicSalary",
      key: "basicSalary",
      width: 150,
      render: (value) => `SAR ${value.toLocaleString()}`,
    },
    {
      title: "Total Earnings",
      dataIndex: "totalEarnings",
      key: "totalEarnings",
      width: 150,
      render: (value) => `SAR ${value.toLocaleString()}`,
    },
    {
      title: "Deductions",
      dataIndex: "deductions",
      key: "deductions",
      width: 120,
      render: (value) => `SAR ${value.toLocaleString()}`,
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      key: "netPay",
      width: 150,
      render: (value) => `SAR ${value.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "Paid" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          >
            View
          </Button>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
            size="small"
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record) => {
    setSelectedPayroll(record);
    setViewModalVisible(true);
  };

  const handleDownload = (record) => {
    setSelectedPayroll(record);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    setCurrentPage(1);
    // Trigger API call with new filters
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    setCurrentPage(1);
    // Trigger API call with new filters
  };

  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
    // Trigger API call with new pagination params
  };

  const filteredData = mockPayrollData.filter((item) => {
    const matchesMonth = !selectedMonth || item.month === selectedMonth;
    const matchesYear = !selectedYear || item.year === selectedYear;
    return matchesMonth && matchesYear;
  });

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const months = [
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];
  const years = ["2023", "2024", "2025", "2026"];

  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const thousands = ["", "Thousand", "Million", "Billion"];

    if (num === 0) return "Zero";

    const convertHundreds = (n) => {
      let result = "";
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + " ";
        return result;
      }
      if (n > 0) {
        result += ones[n] + " ";
      }
      return result;
    };

    let result = "";
    let thousandCounter = 0;

    while (num > 0) {
      if (num % 1000 !== 0) {
        result =
          convertHundreds(num % 1000) +
          thousands[thousandCounter] +
          " " +
          result;
      }
      num = Math.floor(num / 1000);
      thousandCounter++;
    }

    return result.trim();
  };

  const PayslipContent = ({ payroll }) => (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        fontSize: "11px",
        lineHeight: "1.2",
        padding: "20px",
        backgroundColor: "white",
        color: "black",
        border: "2px solid #000",
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Red triangle in top-left corner */}
      <div
        style={{
          position: "absolute",
          top: "0",
          left: "0",
          width: "0",
          height: "0",
          borderLeft: "60px solid #dc3545",
          borderBottom: "60px solid transparent",
        }}
      ></div>

      {/* Logo in top-right corner */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          fontWeight: "bold",
          fontSize: "16px",
          border: "2px solid #000",
          padding: "5px 10px",
          backgroundColor: "white",
        }}
      >
        <div style={{ color: "#000" }}>ERAM</div>
        <div style={{ fontSize: "10px", letterSpacing: "2px" }}>TALENT</div>
      </div>

      {/* Header */}
      <div
        style={{ textAlign: "center", marginBottom: "20px", marginTop: "20px" }}
      >
        <div
          style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px" }}
        >
          Eram Company Limited
        </div>
        <div
          style={{ borderBottom: "2px solid #000", marginBottom: "8px" }}
        ></div>
        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
          GGI PAYSLIP FOR {payroll.month} - {payroll.year}
        </div>
        <div style={{ borderBottom: "1px solid #000", marginTop: "8px" }}></div>
      </div>

      {/* Employee Details Grid */}
      <table
        style={{
          width: "100%",
          marginBottom: "15px",
          fontSize: "10px",
          borderCollapse: "collapse",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                width: "12%",
                fontWeight: "bold",
              }}
            >
              Emp Name
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                width: "1%",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                width: "20%",
              }}
            >
              {payroll.empName}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                width: "12%",
                fontWeight: "bold",
              }}
            >
              Designation
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                width: "1%",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                width: "15%",
              }}
            >
              {payroll.designation}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                width: "10%",
                fontWeight: "bold",
              }}
            >
              SAP ID
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                width: "1%",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                width: "15%",
              }}
            >
              {payroll.sapId}
            </td>
          </tr>

          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              Eram ID
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.empId}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              Nationality
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.nationality}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              Bank Name
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.bankName}
            </td>
          </tr>

          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              Days in a Month
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.daysInMonth}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              Work Area
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.workArea}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              IBAN
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.iban}
            </td>
          </tr>

          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              Present Days
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.presentDays}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              ID / IQAMA No
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.iqamaNo}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              GOSI No
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.gosiNo}
            </td>
          </tr>

          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              Abs / Vac Days
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.absVacDays}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              IQAMA Exp
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.iqamaExp}
            </td>

            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
              }}
            >
              DOJ
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "4px 6px",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td style={{ border: "1px solid #000", padding: "4px 6px" }}>
              {payroll.doj}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Salary Structure, Earnings, and Deductions */}
      <table
        style={{
          width: "100%",
          border: "2px solid #000",
          borderCollapse: "collapse",
          marginBottom: "15px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #000",
                padding: "8px",
                backgroundColor: "#e9ecef",
                textAlign: "center",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              Salary Structure (SAR)
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "8px",
                backgroundColor: "#e9ecef",
                textAlign: "center",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              Earnings (SAR)
            </th>
            <th
              style={{
                border: "1px solid #000",
                padding: "8px",
                backgroundColor: "#e9ecef",
                textAlign: "center",
                fontSize: "11px",
                fontWeight: "bold",
              }}
            >
              Deductions (SAR)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                verticalAlign: "top",
                height: "250px",
              }}
            >
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Basic</span>
                <span>{payroll.basicSalary.toFixed(2)}</span>
              </div>
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>HRA</span>
                <span>{payroll.hra.toFixed(2)}</span>
              </div>
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Transportation</span>
                <span>{payroll.transportation.toFixed(2)}</span>
              </div>
              <div
                style={{
                  marginBottom: "60px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Other Allowance</span>
                <span>{payroll.otherAllowance.toFixed(2)}</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid #000",
                  paddingTop: "8px",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Pay Structure Total :</span>
                <span>{payroll.totalEarnings.toFixed(2)}</span>
              </div>
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                verticalAlign: "top",
                height: "250px",
              }}
            >
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Basic Allowance</span>
                <span>{payroll.basicSalary.toFixed(2)}</span>
              </div>
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>HRA</span>
                <span>{payroll.hra.toFixed(2)}</span>
              </div>
              <div
                style={{
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Transport Allowance</span>
                <span>{payroll.transportation.toFixed(2)}</span>
              </div>
              <div
                style={{
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Other Allowance</span>
                <span>{payroll.otherAllowance.toFixed(2)}</span>
              </div>
              <div
                style={{
                  marginBottom: "20px",
                  textAlign: "center",
                  border: "1px solid #000",
                  padding: "5px",
                }}
              >
                {payroll.month.substring(0, 3)} {payroll.year} OT HOUR{" "}
                {payroll.otHours}
              </div>
              <div
                style={{
                  borderTop: "1px solid #000",
                  paddingTop: "8px",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Earnings Total :</span>
                <span>{payroll.totalEarnings.toFixed(2)}</span>
              </div>
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                verticalAlign: "top",
                height: "250px",
              }}
            >
              <div
                style={{
                  marginBottom: "60px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Other Deduction</span>
                <span>{payroll.deductions.toFixed(2)}</span>
              </div>
              <div
                style={{
                  borderTop: "1px solid #000",
                  paddingTop: "8px",
                  fontWeight: "bold",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Deduction Total :</span>
                <span>{payroll.deductions.toFixed(2)}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Net Pay and Amount in Words */}
      <table
        style={{
          width: "100%",
          border: "1px solid #000",
          borderCollapse: "collapse",
          marginBottom: "15px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
                width: "15%",
              }}
            >
              Net Pay
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                width: "5%",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                fontWeight: "bold",
                fontSize: "14px",
                width: "20%",
              }}
            >
              {payroll.netPay.toFixed(2)}
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
                width: "15%",
              }}
            >
              Amount In Words
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                width: "5%",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td
              style={{ border: "1px solid #000", padding: "8px", width: "40%" }}
            >
              Saudi Riyal - {numberToWords(Math.floor(payroll.netPay))} Only
            </td>
          </tr>
        </tbody>
      </table>

      {/* Remarks and Received By */}
      <table
        style={{
          width: "100%",
          border: "1px solid #000",
          borderCollapse: "collapse",
          marginBottom: "15px",
        }}
      >
        <tbody>
          <tr>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                backgroundColor: "#f8f9fa",
                fontWeight: "bold",
                width: "10%",
              }}
            >
              Remarks
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                width: "5%",
                textAlign: "center",
              }}
            >
              :
            </td>
            <td
              style={{ border: "1px solid #000", padding: "8px", width: "60%" }}
            >
              {payroll.remarks}
            </td>
            <td
              style={{
                border: "1px solid #000",
                padding: "8px",
                width: "25%",
                textAlign: "right",
              }}
            >
              <span style={{ fontWeight: "bold" }}>Received By</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Note */}
      <div
        style={{
          textAlign: "center",
          fontSize: "9px",
          fontStyle: "italic",
          marginTop: "15px",
        }}
      >
        Note : This is system generated payslip and does not require signatures
        or stamps.
      </div>
    </div>
  );

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "white",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Row align="middle" justify="space-between">
            <Col>
              <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
                <DownloadOutlined style={{ marginRight: 12 }} />
                My Payroll Details
              </Title>
              <Text type="secondary">
                View and download your salary statements
              </Text>
            </Col>
          </Row>
        </div>

        <Card style={{ marginBottom: "24px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Select
                placeholder="Select Month"
                style={{ width: "100%" }}
                value={selectedMonth}
                onChange={handleMonthChange}
                allowClear
              >
                {months.map((month) => (
                  <Option key={month} value={month}>
                    {month}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Select Year"
                style={{ width: "100%" }}
                value={selectedYear}
                onChange={handleYearChange}
                allowClear
              >
                {years.map((year) => (
                  <Option key={year} value={year}>
                    {year}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
            size="middle"
          />

          <div style={{ marginTop: "16px", textAlign: "right" }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredData.length}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} items`
              }
              onChange={handlePaginationChange}
              onShowSizeChange={handlePaginationChange}
              pageSizeOptions={["10", "20", "50", "100"]}
            />
          </div>
        </Card>

        <Modal
          title="Payroll Details"
          open={viewModalVisible}
          onCancel={() => setViewModalVisible(false)}
          footer={[
            <Button
              key="print"
              icon={<PrinterOutlined />}
              onClick={() => handleDownload(selectedPayroll)}
            >
              Print
            </Button>,
            <Button key="close" onClick={() => setViewModalVisible(false)}>
              Close
            </Button>,
          ]}
          width={1000}
        >
          {selectedPayroll && <PayslipContent payroll={selectedPayroll} />}
        </Modal>

        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .ant-modal-body *,
            .ant-modal-body {
              visibility: visible;
            }
            .ant-modal-body {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .ant-modal-header,
            .ant-modal-footer {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default EmployeePayroll;
