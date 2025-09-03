import React, { useState, useEffect, useCallback } from "react";
import {
  message,
  Upload,
  Button,
  Table,
  Card,
  Spin,
  Divider,
  Input,
  Modal,
  Form,
  Descriptions,
  DatePicker,
  Row,
  Col,
  Tabs,
  Select,
} from "antd";
import {
  UploadOutlined,
  InboxOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  useUploadPayrollFileMutation,
  useGetPayrollQuery,
  useEditPayrollMutation,
  useGetPayrollByIdQuery,
} from "../../Slices/Employee/EmployeeApis";
import { debounce } from "lodash";

const { Dragger } = Upload;
const { TextArea } = Input;
const { TabPane } = Tabs;

const payrollHeaders = [
  // Basic Information
  "U_year",
  "U_month",
  "U_paygroup",
  "U_PrjNM",
  "U_empname",
  "U_empcode",
  "U_EramId",

  // Salary Components
  "U_basic",
  "U_food",
  "U_hra",
  "U_tel",
  "U_tpa",
  "U_fuel",
  "U_shftallow",
  "U_othrallow",
  "U_otallow",
  "U_specallow",
  "U_actallow",
  "U_projallow",
  "U_offsallow",
  "U_airtallow",
  "U_exefallow",
  "U_OEARN",
  "U_OVSAL",
  "U_TRFAL",
  "U_COMAL",
  "U_HSHIP",
  "U_BENAL",
  "U_OBASE",
  "U_RAAL",
  "U_FOTA",

  // Overtime & Days
  "U_OTHOUR1",
  "U_OTHOUR2",
  "U_OTHOUR3",
  "U_TOTHR",
  "U_OTRT",
  "U_OTLV",
  "U_TABDays",
  "U_absdays",
  "U_stddays",
  "U_TUPDays",
  "U_unpddays",
  "U_umhjdays",
  "U_medidays",
  "U_SFDAY",
  "U_RADAY",
  "U_SADAY",

  // Deductions
  "U_TPAD",
  "U_ODED",
  "U_ODEDSA",
  "U_adv",
  "U_loan",
  "U_gosi",
  "U_TPAD_1",
  "U_ADMC",

  // Actual Values (Optional)
  "U_albasic",
  "U_alfood",
  "U_alhra",
  "U_altel",
  "U_altpa",
  "U_alfuel",
  "U_alshftallow",
  "U_alothrallow",
  "U_alotallow",
  "U_alspecallow",
  "U_alactallow",
  "U_alprojallow",
  "U_aloffsallow",
  "U_alairtallow",
  "U_alexefallow",
  "U_altotalsal",
  "U_alover",
  "U_altran",
  "U_alcomp",
  "U_alhard",
  "U_albene",
  "U_alFOTA",
  "U_alOTLV",

  // Summary
  "U_totalearn",
  "U_ONP",
];

const sampleRow = [
  "2025",
  "8",
  "GroupA",
  "ProjectX",
  "John Doe",
  "EMP001",
  "ERAM001",
  "5000",
  "500",
  "1000",
  "200",
  "300",
  "100",
  "50",
  "20",
  "150",
  "100",
  "200",
  "50",
  "75",
  "100",
  "50",
  "20",
  "10",
  "5",
  "15",
  "10",
  "5",
  "3",
  "20",
  "50",
  "100",
  "2",
  "100",
  "2",
  "1",
  "0",
  "0",
  "5",
  "0",
  "0",
  "50",
  "20",
  "0",
  "100",
  "0",
  "0",
  "0",
  "0",
  "5000",
  "500",
  "1000",
  "200",
  "300",
  "100",
  "50",
  "20",
  "150",
  "100",
  "200",
  "50",
  "75",
  "100",
  "50",
  "20",
  "10",
  "5",
  "15",
  "100",
  "50",
  "6000",
  "5800",
];

const EmployeeAdminPayroll = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [project, setProject] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      setDebouncedSearchText(searchValue);
      setCurrentPage(1);
    }, 2500),
    []
  );

  // Effect to handle search debouncing
  useEffect(() => {
    debouncedSearch(searchText);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchText, debouncedSearch]);

  const [
    uploadFile,
    {
      isLoading: isUploading,
      isSuccess: uploadSuccess,
      isError: uploadError,
      error: uploadErrorData,
      data: uploadResult,
    },
  ] = useUploadPayrollFileMutation();

  const { data: payrollData, isLoading: isPayrollLoading } = useGetPayrollQuery(
    {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearchText,
      project,
      month,
      year,
    }
  );

  const [editPayroll, { isLoading: isEditing }] = useEditPayrollMutation();
  const { data: singlePayrollData, isLoading: isSinglePayrollLoading } =
    useGetPayrollByIdQuery(selectedRecord?._id, {
      skip: !selectedRecord,
    });

  useEffect(() => {
    if (singlePayrollData?.payroll && isEditModalVisible) {
      form.setFieldsValue(singlePayrollData.payroll);
    }
  }, [singlePayrollData, isEditModalVisible, form]);

  const handleFileUpload = async (file) => {
    setSelectedFile(file);

    try {
      const result = await uploadFile(file).unwrap();
      message.success(`File uploaded successfully! ${result.message || ""}`);
      setSelectedFile(null);
      refetchPayroll();
    } catch (error) {
      console.error("Upload failed:", error);

      if (error.status === 400) {
        message.error(error.data?.message || "Invalid file format");
        if (error.data?.errors) {
          error.data.errors.forEach((err) => message.error(err));
        }
      } else if (error.status === 413) {
        message.error("File too large");
      } else if (error.status === 500) {
        message.error("Server error. Please try again later.");
      } else {
        message.error("Upload failed. Please check your connection.");
      }
    }

    return false;
  };

  const handleDownloadSample = () => {
    const csvRows = [
      payrollHeaders.join(","), // First row: headers
      sampleRow.join(","), // Second row: sample data
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sample_payroll.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const projectOptions = [
    ...new Set(payrollData?.data?.map((item) => item.U_PrjNM).filter(Boolean)),
  ];

  const handleRemoveFile = () => {
    setSelectedFile(null);
    message.info("File removed");
  };

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsViewModalVisible(true);
  };

  const handleEdit = (record) => {
    setSelectedRecord(record);
    form.resetFields();
    form.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await editPayroll({
        id: selectedRecord._id,
        payload: values,
      }).unwrap();
      console.log("Updated values:", values);
      message.success("Payroll record updated successfully");
      setIsEditModalVisible(false);
      refetchPayroll();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const filteredData = payrollData?.data?.filter(
    (item) =>
      item.U_empname?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.U_email?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.U_EramId?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Columns for payroll data table
  const payrollColumns = [
    {
      title: "Employee Name",
      dataIndex: "U_empname",
      key: "U_empname",
    },
    {
      title: "ERAM ID",
      dataIndex: "U_EramId",
      key: "U_EramId",
    },
    {
      title: "Total Earnings",
      dataIndex: "U_totalearn",
      key: "U_totalearn",
      render: (text) => `${text}`,
    },
    {
      title: "Month/Year",
      key: "monthYear",
      render: (_, record) => {
        if (record.U_month && record.U_year) {
          const monthNames = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];
          const monthName =
            typeof record.U_month === "number"
              ? monthNames[record.U_month - 1]
              : record.U_month;

          return `${monthName}/${record.U_year}`;
        }
        return new Date(record.uploadedAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
        </>
      ),
    },
  ];

  const uploadProps = {
    name: "payrollFile",
    multiple: false,
    accept: ".xlsx,.xls,.csv",
    beforeUpload: handleFileUpload,
    showUploadList: false,
    disabled: isUploading,
  };

  // Render View Modal Content
  const renderViewContent = () => {
    const recordToDisplay = singlePayrollData?.payroll || selectedRecord;
    if (!recordToDisplay) return null;

    return (
      <Tabs defaultActiveKey="1">
        <TabPane
          tab={
            <span style={{ fontSize: "13px", color: " #da2c46" }}>
              Basic Information
            </span>
          }
          key="1"
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Year">
              {recordToDisplay.U_year}
            </Descriptions.Item>
            <Descriptions.Item label="Month">
              {recordToDisplay.U_month}
            </Descriptions.Item>
            <Descriptions.Item label="Pay Group">
              {recordToDisplay.U_paygroup}
            </Descriptions.Item>
            <Descriptions.Item label="Project Name">
              {recordToDisplay.U_PrjNM}
            </Descriptions.Item>
            <Descriptions.Item label="Employee Name">
              {recordToDisplay.U_empname}
            </Descriptions.Item>
            <Descriptions.Item label="Employee Code">
              {recordToDisplay.U_empcode}
            </Descriptions.Item>
            <Descriptions.Item label="ERAM ID">
              {recordToDisplay.U_EramId}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane
          tab={
            <span style={{ fontSize: "13px", color: " #da2c46" }}>
              Salary Components
            </span>
          }
          key="2"
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Basic Salary">
              {recordToDisplay.U_basic}
            </Descriptions.Item>
            <Descriptions.Item label="Food Allowance">
              {recordToDisplay.U_food}
            </Descriptions.Item>
            <Descriptions.Item label="HRA">
              {recordToDisplay.U_hra}
            </Descriptions.Item>
            <Descriptions.Item label="Telephone Allowance">
              {recordToDisplay.U_tel}
            </Descriptions.Item>
            <Descriptions.Item label="TPA">
              {recordToDisplay.U_tpa}
            </Descriptions.Item>
            <Descriptions.Item label="Fuel Allowance">
              {recordToDisplay.U_fuel}
            </Descriptions.Item>
            <Descriptions.Item label="Shift Allowance">
              {recordToDisplay.U_shftallow}
            </Descriptions.Item>
            <Descriptions.Item label="Other Allowance">
              {recordToDisplay.U_othrallow}
            </Descriptions.Item>
            <Descriptions.Item label="OT Allowance">
              {recordToDisplay.U_otallow}
            </Descriptions.Item>
            <Descriptions.Item label="Special Allowance">
              {recordToDisplay.U_specallow}
            </Descriptions.Item>
            <Descriptions.Item label="Act. Allowance">
              {recordToDisplay.U_actallow}
            </Descriptions.Item>
            <Descriptions.Item label="Project Allowance">
              {recordToDisplay.U_projallow}
            </Descriptions.Item>
            <Descriptions.Item label="Offshore Allowance">
              {recordToDisplay.U_offsallow}
            </Descriptions.Item>
            <Descriptions.Item label="Air Ticket Allowance">
              {recordToDisplay.U_airtallow}
            </Descriptions.Item>
            <Descriptions.Item label="Extra Effort Allowance">
              {recordToDisplay.U_exefallow}
            </Descriptions.Item>
            <Descriptions.Item label="Other Earning">
              {recordToDisplay.U_OEARN}
            </Descriptions.Item>
            <Descriptions.Item label="Overseas Allowance">
              {recordToDisplay.U_OVSAL}
            </Descriptions.Item>
            <Descriptions.Item label="Transfer Allowance">
              {recordToDisplay.U_TRFAL}
            </Descriptions.Item>
            <Descriptions.Item label="Competitive Allowance">
              {recordToDisplay.U_COMAL}
            </Descriptions.Item>
            <Descriptions.Item label="Hardship Allowance">
              {recordToDisplay.U_HSHIP}
            </Descriptions.Item>
            <Descriptions.Item label="Benefit Adj Allowance">
              {recordToDisplay.U_BENAL}
            </Descriptions.Item>
            <Descriptions.Item label="Over Base Allowance">
              {recordToDisplay.U_OBASE}
            </Descriptions.Item>
            <Descriptions.Item label="Remote Area Allowance">
              {recordToDisplay.U_RAAL}
            </Descriptions.Item>
            <Descriptions.Item label="Fixed OT Allowance">
              {recordToDisplay.U_FOTA}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane
          tab={
            <span style={{ fontSize: "13px", color: " #da2c46" }}>
              Overtime & Days
            </span>
          }
          key="3"
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Normal OT Hours">
              {recordToDisplay.U_OTHOUR1}
            </Descriptions.Item>
            <Descriptions.Item label="PH OT Hours">
              {recordToDisplay.U_OTHOUR2}
            </Descriptions.Item>
            <Descriptions.Item label="Ramadan OT Hours">
              {recordToDisplay.U_OTHOUR3}
            </Descriptions.Item>
            <Descriptions.Item label="Total OT Hours">
              {recordToDisplay.U_TOTHR}
            </Descriptions.Item>
            <Descriptions.Item label="OT Rate">
              {recordToDisplay.U_OTRT}
            </Descriptions.Item>
            <Descriptions.Item label="Out Living Exp">
              {recordToDisplay.U_OTLV}
            </Descriptions.Item>
            <Descriptions.Item label="Total Absent Days">
              {recordToDisplay.U_TABDays}
            </Descriptions.Item>
            <Descriptions.Item label="Absent Days Deduction">
              {recordToDisplay.U_absdays}
            </Descriptions.Item>
            <Descriptions.Item label="Stand By Days">
              {recordToDisplay.U_stddays}
            </Descriptions.Item>
            <Descriptions.Item label="Total UnPaid Days">
              {recordToDisplay.U_TUPDays}
            </Descriptions.Item>
            <Descriptions.Item label="UnPaid Days">
              {recordToDisplay.U_unpddays}
            </Descriptions.Item>
            <Descriptions.Item label="UMRAH/HAJJ Days">
              {recordToDisplay.U_umhjdays}
            </Descriptions.Item>
            <Descriptions.Item label="Medical Days">
              {recordToDisplay.U_medidays}
            </Descriptions.Item>
            <Descriptions.Item label="Shift Days">
              {recordToDisplay.U_SFDAY}
            </Descriptions.Item>
            <Descriptions.Item label="Remote Area Days">
              {recordToDisplay.U_RADAY}
            </Descriptions.Item>
            <Descriptions.Item label="Site Activation Days">
              {recordToDisplay.U_SADAY}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane
          tab={
            <span style={{ fontSize: "13px", color: " #da2c46" }}>
              Deductions
            </span>
          }
          key="4"
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="TPA Deduction">
              {recordToDisplay.U_TPAD}
            </Descriptions.Item>
            <Descriptions.Item label="Other Deduction">
              {recordToDisplay.U_ODED}
            </Descriptions.Item>
            <Descriptions.Item label="Other Deduction Staff Accounts">
              {recordToDisplay.U_ODEDSA}
            </Descriptions.Item>
            <Descriptions.Item label="Advance">
              {recordToDisplay.U_adv}
            </Descriptions.Item>
            <Descriptions.Item label="Loan">
              {recordToDisplay.U_loan}
            </Descriptions.Item>
            <Descriptions.Item label="GOSI">
              {recordToDisplay.U_gosi}
            </Descriptions.Item>
            <Descriptions.Item label="TPA Deduction (Alt)">
              {recordToDisplay.U_TPAD_1}
            </Descriptions.Item>
            <Descriptions.Item label="Admin Charge">
              {recordToDisplay.U_ADMC}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane
          tab={
            <span style={{ fontSize: "13px", color: " #da2c46" }}>
              Actual Values
            </span>
          }
          key="5"
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Actual Basic">
              {recordToDisplay.U_albasic}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Food">
              {recordToDisplay.U_alfood}
            </Descriptions.Item>
            <Descriptions.Item label="Actual HRA">
              {recordToDisplay.U_alhra}
            </Descriptions.Item>
            <Descriptions.Item label="Actual TEL">
              {recordToDisplay.U_altel}
            </Descriptions.Item>
            <Descriptions.Item label="Actual TPA">
              {recordToDisplay.U_altpa}
            </Descriptions.Item>
            <Descriptions.Item label="Actual FUEL">
              {recordToDisplay.U_alfuel}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Shift Allowance">
              {recordToDisplay.U_alshftallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Other Allowance">
              {recordToDisplay.U_alothrallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual OT Allowance">
              {recordToDisplay.U_alotallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Special Allowance">
              {recordToDisplay.U_alspecallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Act. Allowance">
              {recordToDisplay.U_alactallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Project Allowance">
              {recordToDisplay.U_alprojallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Offshore Allowance">
              {recordToDisplay.U_aloffsallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Air Ticket Allowance">
              {recordToDisplay.U_alairtallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Extra Effort Allowance">
              {recordToDisplay.U_alexefallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Total Salary">
              {recordToDisplay.U_altotalsal}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Overseas Allowance">
              {recordToDisplay.U_alover}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Transfer Allowance">
              {recordToDisplay.U_altran}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Competitive Allowance">
              {recordToDisplay.U_alcomp}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Hardship Allowance">
              {recordToDisplay.U_alhard}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Benefit Adj Allowance">
              {recordToDisplay.U_albene}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Fixed OT Allowance">
              {recordToDisplay.U_alFOTA}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Out Living Exp">
              {recordToDisplay.U_alOTLV}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane
          tab={
            <span style={{ fontSize: "13px", color: " #da2c46" }}>Summary</span>
          }
          key="6"
        >
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Total Earnings" span={2}>
              <strong style={{ fontSize: "16px", color: "#52c41a" }}>
                {recordToDisplay.U_totalearn}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Overall Net Payable" span={2}>
              <strong style={{ fontSize: "16px", color: "#1890ff" }}>
                {recordToDisplay.U_ONP}
              </strong>
            </Descriptions.Item>
          </Descriptions>
        </TabPane>
      </Tabs>
    );
  };

  // Render Edit Form Content
  const renderEditForm = () => {
    return (
      <Form form={form} layout="vertical">
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span style={{ fontSize: "13px", color: " #da2c46" }}>
                Basic Information
              </span>
            }
            key="1"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="U_year" label="Year">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_month" label="Month">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_paygroup" label="Pay Group">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_PrjNM" label="Project Name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_empname" label="Employee Name">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_empcode" label="Employee Code">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_EramId" label="ERAM ID">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span style={{ fontSize: "13px", color: " #da2c46" }}>
                Salary Components
              </span>
            }
            key="2"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="U_basic" label="Basic Salary">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_food" label="Food Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_hra" label="HRA">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_tel" label="Telephone Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_tpa" label="TPA">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_fuel" label="Fuel Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_shftallow" label="Shift Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_othrallow" label="Other Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_otallow" label="OT Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_specallow" label="Special Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_actallow" label="Act. Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_projallow" label="Project Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_offsallow" label="Offshore Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_airtallow" label="Air Ticket Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_exefallow" label="Extra Effort Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_OEARN" label="Other Earning">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_OVSAL" label="Overseas Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_TRFAL" label="Transfer Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_COMAL" label="Competitive Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_HSHIP" label="Hardship Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_BENAL" label="Benefit Adj Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_OBASE" label="Over Base Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_RAAL" label="Remote Area Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_FOTA" label="Fixed OT Allowance">
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span style={{ fontSize: "13px", color: " #da2c46" }}>
                Overtime & Days
              </span>
            }
            key="3"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="U_OTHOUR1" label="Normal OT Hours">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_OTHOUR2" label="PH OT Hours">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_OTHOUR3" label="Ramadan OT Hours">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_TOTHR" label="Total OT Hours">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_OTRT" label="OT Rate">
                  <Input type="number" step="0.01" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_OTLV" label="Out Living Exp">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_TABDays" label="Total Absent Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_absdays" label="Absent Days Deduction">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_stddays" label="Stand By Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_TUPDays" label="Total UnPaid Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_unpddays" label="UnPaid Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_umhjdays" label="UMRAH/HAJJ Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_medidays" label="Medical Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_SFDAY" label="Shift Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_RADAY" label="Remote Area Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_SADAY" label="Site Activation Days">
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span style={{ fontSize: "13px", color: " #da2c46" }}>
                Deductions
              </span>
            }
            key="4"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="U_TPAD" label="TPA Deduction">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_ODED" label="Other Deduction">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="U_ODEDSA"
                  label="Other Deduction Staff Accounts"
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_adv" label="Advance">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_loan" label="Loan">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_gosi" label="GOSI">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_TPAD_1" label="TPA Deduction (Alt)">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_ADMC" label="Admin Charge">
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane
            tab={
              <span style={{ fontSize: "13px", color: " #da2c46" }}>
                Summary
              </span>
            }
            key="5"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="U_totalearn" label="Total Earnings">
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_ONP" label="Overall Net Payable">
                  <Input type="number" />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Form>
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Upload Payroll File" style={{ marginBottom: "24px" }}>
        <Dragger
          {...uploadProps}
          style={{
            borderColor: "#da2c46",
            borderWidth: "2px",
            borderStyle: "dashed",
          }}
        >
          <p className="ant-upload-drag-icon" style={{ color: "#da2c46" }}>
            <InboxOutlined style={{ color: "inherit" }} />
          </p>
          <p className="ant-upload-text">
            Click or drag payroll file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Supported formats: .xlsx, .xls, .csv. Max file size: 10MB
          </p>
          {selectedFile && (
            <p>
              Selected file: <strong>{selectedFile.name}</strong> (
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
            </p>
          )}
        </Dragger>

        <div style={{ marginTop: "16px", textAlign: "right" }}>
          {selectedFile && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemoveFile}
              disabled={isUploading}
              style={{ marginRight: "8px" }}
            >
              Remove File
            </Button>
          )}

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            style={{ backgroundColor: "#da2c46", marginRight: "5px" }}
            onClick={handleDownloadSample}
          >
            Download Sample Payroll File
          </Button>

          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={isUploading}
            onClick={() => selectedFile && handleFileUpload(selectedFile)}
            disabled={!selectedFile || isUploading}
            style={{ backgroundColor: "#da2c46" }}
          >
            {isUploading ? "Uploading..." : "Start Upload"}
          </Button>
        </div>
      </Card>

      <Card
        title="Payroll Data"
        extra={
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col>
              <Input
                allowClear
                placeholder="Search by ERAM ID"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 200 }}
              />
            </Col>
            <Col>
              <Select
                placeholder="Select Project"
                style={{ width: 180 }}
                allowClear
                value={project}
                onChange={(value) => setProject(value)}
              >
                {projectOptions.map((proj) => (
                  <Select.Option key={proj} value={proj}>
                    {proj}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col>
              <DatePicker
                picker="month"
                placeholder="Select Month"
                onChange={(date) => setMonth(date ? date.month() + 1 : "")}
                style={{ width: 150 }}
              />
            </Col>
            <Col>
              <DatePicker
                picker="year"
                placeholder="Select Year"
                onChange={(date) => setYear(date ? date.year() : "")}
                style={{ width: 150 }}
              />
            </Col>
          </Row>
        }
      >
        {payrollData?.data ? (
          <Table
            columns={payrollColumns}
            dataSource={payrollData?.data || []}
            rowKey="_id"
            scroll={{ x: true }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: payrollData?.total || 0,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} records`,
            }}
            loading={isPayrollLoading}
            onChange={handleTableChange}
            locale={{
              emptyText:
                searchText || project || month || year
                  ? "No matching payroll records"
                  : "No payroll data available",
            }}
          />
        ) : (
          <Spin tip="Loading payroll data..." />
        )}
      </Card>

      {/* View Modal */}
      <Modal
        title="Payroll Details"
        visible={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsViewModalVisible(false)}>
            Close
          </Button>,
        ]}
        width="50%"
        style={{ top: 20 }}
      >
        {isSinglePayrollLoading ? (
          <Spin tip="Loading payroll details..." />
        ) : (
          renderViewContent()
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Payroll Record"
        visible={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        width="50%"
        style={{ top: 20 }}
        okText="Save Changes"
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
          },
        }}
        cancelText="Cancel"
        confirmLoading={isEditing}
      >
        {renderEditForm()}
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
    </div>
  );
};

export default EmployeeAdminPayroll;
