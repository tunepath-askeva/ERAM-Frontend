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
import {
  useGetEmployeePayrollQuery,
  useGeneratePayslipMutation,
} from "../../Slices/Employee/EmployeeApis";

const { Title, Text } = Typography;
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
  const [generatePayslip, { isLoading: isGenerating }] =
    useGeneratePayslipMutation();

  const transformPayrollData = (apiData) => {
    if (!apiData?.payroll) return [];

    const payroll = apiData.payroll;
    return [
      {
        id: payroll._id,
        empName: payroll.U_empname,
        empId: payroll.U_EramId,
        month: getMonthName(payroll.U_month),
        year: payroll.U_year,
        designation: "", 
        nationality: "", 
        basicSalary: parseFloat(payroll.U_basic || 0),
        hra: parseFloat(payroll.U_hra || 0),
        transportation: parseFloat(payroll.U_tpa || 0),
        foodAllowance: parseFloat(payroll.U_food || 0),
        otherAllowance: parseFloat(payroll.U_othrallow || 0),
        otAllowance: parseFloat(payroll.U_otallow || 0),
        airTicketAllowance: parseFloat(payroll.U_airtallow || 0),
        totalEarnings: parseFloat(payroll.U_totalearn || 0),
        deductions:
          parseFloat(payroll.U_adv || 0) +
          parseFloat(payroll.U_loan || 0) +
          parseFloat(payroll.U_gosi || 0),
        netPay: parseFloat(payroll.U_ONP || 0),
        status: "Paid", 
        payDate: new Date().toISOString().split("T")[0],
        iqamaNo: "", 
        gosiNo: "", 
        daysInMonth: 30, 
        presentDays: 30,
        absVacDays: parseFloat(payroll.U_absdays || 0),
        sapId: payroll.U_empcode,
        workArea: payroll.U_PrjNM,
        iban: "",
        bankName: "",
        iqamaExp: "",
        doj: "",
        otHours: parseFloat(payroll.U_OTHOUR1 || 0),
        remarks: "",
        email: payroll.U_email,
        paygroup: payroll.U_paygroup,
        advance: parseFloat(payroll.U_adv || 0),
        loan: parseFloat(payroll.U_loan || 0),
        gosi: parseFloat(payroll.U_gosi || 0),
        telephone: parseFloat(payroll.U_tel || 0),
        fuel: parseFloat(payroll.U_fuel || 0),
        shiftAllowance: parseFloat(payroll.U_shftallow || 0),
        specialAllowance: parseFloat(payroll.U_specallow || 0),
        actualAllowance: parseFloat(payroll.U_actallow || 0),
        projectAllowance: parseFloat(payroll.U_projallow || 0),
        offshoreAllowance: parseFloat(payroll.U_offsallow || 0),
        executiveAllowance: parseFloat(payroll.U_exefallow || 0),
      },
    ];
  };

  const getMonthName = (monthNumber) => {
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
    return months[parseInt(monthNumber) - 1] || "";
  };

  const payrollData = data ? transformPayrollData(data) : [];

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
            loading={isGenerating}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Download"}
          </Button>
        </Space>
      ),
    },
  ];

  const handleView = (record) => {
    setSelectedPayroll(record);
    setViewModalVisible(true);
  };

  const handleDownload = async (record) => {
    try {
      await generatePayslip({ id: record.id });
    } catch (error) {
      console.error("Error generating payslip:", error);
    }
  };

  const handleMonthChange = (value) => {
    setSelectedMonth(value);
    setCurrentPage(1);
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    setCurrentPage(1);
  };

  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const filteredData = payrollData.filter((item) => {
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

  const PayslipContent = ({ payroll }) => {
    const renderSalaryItem = (label, value) => {
      if (value > 0) {
        return (
          <div
            style={{
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{label}</span>
            <span>{value.toFixed(2)}</span>
          </div>
        );
      }
      return null;
    };

    const renderEarningsItem = (label, value) => {
      if (value > 0) {
        return (
          <div
            style={{
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{label}</span>
            <span>{value.toFixed(2)}</span>
          </div>
        );
      }
      return null;
    };

    const renderDeductionItem = (label, value) => {
      if (value > 0) {
        return (
          <div
            style={{
              marginBottom: "8px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{label}</span>
            <span>{value.toFixed(2)}</span>
          </div>
        );
      }
      return null;
    };

    return (
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

        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              marginBottom: "8px",
            }}
          >
            Eram Company Limited
          </div>
          <div
            style={{ borderBottom: "2px solid #000", marginBottom: "8px" }}
          ></div>
          <div style={{ fontSize: "14px", fontWeight: "bold" }}>
            PAYSLIP FOR {payroll.month} - {payroll.year}
          </div>
          <div
            style={{ borderBottom: "1px solid #000", marginTop: "8px" }}
          ></div>
        </div>

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
                {payroll.designation || "N/A"}
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
                {payroll.workArea || "N/A"}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "4px 6px",
                  backgroundColor: "#f8f9fa",
                  fontWeight: "bold",
                }}
              >
                Email
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
                {payroll.email || "N/A"}
              </td>
            </tr>
          </tbody>
        </table>

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
                {renderSalaryItem("Basic", payroll.basicSalary)}
                {renderSalaryItem("Food Allowance", payroll.foodAllowance)}
                {renderSalaryItem("HRA", payroll.hra)}
                {renderSalaryItem("Transportation", payroll.transportation)}
                {renderSalaryItem("Telephone", payroll.telephone)}
                {renderSalaryItem("Fuel", payroll.fuel)}
                {renderSalaryItem("Shift Allowance", payroll.shiftAllowance)}
                {renderSalaryItem("Other Allowance", payroll.otherAllowance)}
                {renderSalaryItem("OT Allowance", payroll.otAllowance)}
                {renderSalaryItem(
                  "Special Allowance",
                  payroll.specialAllowance
                )}
                {renderSalaryItem("Actual Allowance", payroll.actualAllowance)}
                {renderSalaryItem(
                  "Project Allowance",
                  payroll.projectAllowance
                )}
                {renderSalaryItem(
                  "Offshore Allowance",
                  payroll.offshoreAllowance
                )}
                {renderSalaryItem(
                  "Air Ticket Allowance",
                  payroll.airTicketAllowance
                )}
                {renderSalaryItem(
                  "Executive Allowance",
                  payroll.executiveAllowance
                )}

                <div
                  style={{
                    borderTop: "1px solid #000",
                    paddingTop: "8px",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "auto",
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
                {renderEarningsItem("Basic Allowance", payroll.basicSalary)}
                {renderEarningsItem("Food Allowance", payroll.foodAllowance)}
                {renderEarningsItem("HRA", payroll.hra)}
                {renderEarningsItem(
                  "Transport Allowance",
                  payroll.transportation
                )}
                {renderEarningsItem("Telephone", payroll.telephone)}
                {renderEarningsItem("Fuel", payroll.fuel)}
                {renderEarningsItem("Shift Allowance", payroll.shiftAllowance)}
                {renderEarningsItem("Other Allowance", payroll.otherAllowance)}
                {renderEarningsItem("OT Allowance", payroll.otAllowance)}
                {renderEarningsItem(
                  "Special Allowance",
                  payroll.specialAllowance
                )}
                {renderEarningsItem(
                  "Actual Allowance",
                  payroll.actualAllowance
                )}
                {renderEarningsItem(
                  "Project Allowance",
                  payroll.projectAllowance
                )}
                {renderEarningsItem(
                  "Offshore Allowance",
                  payroll.offshoreAllowance
                )}
                {renderEarningsItem(
                  "Air Ticket Allowance",
                  payroll.airTicketAllowance
                )}
                {renderEarningsItem(
                  "Executive Allowance",
                  payroll.executiveAllowance
                )}

                {payroll.otHours > 0 && (
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
                )}

                <div
                  style={{
                    borderTop: "1px solid #000",
                    paddingTop: "8px",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "auto",
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
                {renderDeductionItem("Advance", payroll.advance)}
                {renderDeductionItem("Loan", payroll.loan)}
                {renderDeductionItem("GOSI", payroll.gosi)}

                <div
                  style={{
                    borderTop: "1px solid #000",
                    paddingTop: "8px",
                    fontWeight: "bold",
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "auto",
                  }}
                >
                  <span>Deduction Total :</span>
                  <span>{payroll.deductions.toFixed(2)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

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
                style={{
                  border: "1px solid #000",
                  padding: "8px",
                  width: "40%",
                }}
              >
                Saudi Riyal - {numberToWords(Math.floor(payroll.netPay))} Only
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            textAlign: "center",
            fontSize: "9px",
            fontStyle: "italic",
            marginTop: "15px",
          }}
        >
          Note : This is system generated payslip and does not require
          signatures or stamps.
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
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
              key="download"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(selectedPayroll)}
              loading={isGenerating}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Download"}
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
      </div>
    </div>
  );
};

export default EmployeePayroll;
