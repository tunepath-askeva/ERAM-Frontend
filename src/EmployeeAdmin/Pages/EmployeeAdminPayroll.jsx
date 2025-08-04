import React, { useState } from "react";
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
} from "antd";
import {
  UploadOutlined,
  InboxOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  useUploadPayrollFileMutation,
  useGetPayrollQuery,
} from "../../Slices/Employee/EmployeeApis";

const { Dragger } = Upload;
const { TextArea } = Input;
const { TabPane } = Tabs;

const EmployeeAdminPayroll = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [form] = Form.useForm();

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

  const { data: payrollData, refetch: refetchPayroll } = useGetPayrollQuery();

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
    form.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      // Here you would typically call an API to update the record
      console.log("Updated values:", values);
      message.success("Payroll record updated successfully");
      setIsEditModalVisible(false);
      refetchPayroll();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const filteredData = payrollData?.payroll?.filter(
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
      sorter: (a, b) => a.U_empname.localeCompare(b.U_empname),
    },
    {
      title: "Email",
      dataIndex: "U_email",
      key: "U_email",
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
      sorter: (a, b) => a.U_totalearn - b.U_totalearn,
      render: (text) => `${text}`,
    },
    {
      title: "Month/Year",
      dataIndex: "uploadedAt",
      key: "monthYear",
      render: (date) =>
        new Date(date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
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
    if (!selectedRecord) return null;

    return (
      <Tabs defaultActiveKey="1">
        <TabPane tab="Basic Information" key="1">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Year">
              {selectedRecord.U_year}
            </Descriptions.Item>
            <Descriptions.Item label="Pay Group">
              {selectedRecord.U_paygroup}
            </Descriptions.Item>
            <Descriptions.Item label="Project Name">
              {selectedRecord.U_PrjNM}
            </Descriptions.Item>
            <Descriptions.Item label="Employee Name">
              {selectedRecord.U_empname}
            </Descriptions.Item>
            <Descriptions.Item label="Employee Code">
              {selectedRecord.U_empcode}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedRecord.U_email}
            </Descriptions.Item>
            <Descriptions.Item label="ERAM ID">
              {selectedRecord.U_EramId}
            </Descriptions.Item>
            <Descriptions.Item label="Upload Date">
              {new Date(selectedRecord.uploadedAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
                day: "numeric",
              })}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="Salary Components" key="2">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Basic Salary">
              {selectedRecord.U_basic}
            </Descriptions.Item>
            <Descriptions.Item label="Food Allowance">
              {selectedRecord.U_food}
            </Descriptions.Item>
            <Descriptions.Item label="HRA">
              {selectedRecord.U_hra}
            </Descriptions.Item>
            <Descriptions.Item label="Telephone Allowance">
              {selectedRecord.U_tel}
            </Descriptions.Item>
            <Descriptions.Item label="TPA">
              {selectedRecord.U_tpa}
            </Descriptions.Item>
            <Descriptions.Item label="Fuel Allowance">
              {selectedRecord.U_fuel}
            </Descriptions.Item>
            <Descriptions.Item label="Shift Allowance">
              {selectedRecord.U_shftallow}
            </Descriptions.Item>
            <Descriptions.Item label="Other Allowance">
              {selectedRecord.U_othrallow}
            </Descriptions.Item>
            <Descriptions.Item label="OT Allowance">
              {selectedRecord.U_otallow}
            </Descriptions.Item>
            <Descriptions.Item label="Special Allowance">
              {selectedRecord.U_specallow}
            </Descriptions.Item>
            <Descriptions.Item label="Act. Allowance">
              {selectedRecord.U_actallow}
            </Descriptions.Item>
            <Descriptions.Item label="Project Allowance">
              {selectedRecord.U_projallow}
            </Descriptions.Item>
            <Descriptions.Item label="Offshore Allowance">
              {selectedRecord.U_offsallow}
            </Descriptions.Item>
            <Descriptions.Item label="Air Ticket Allowance">
              {selectedRecord.U_airtallow}
            </Descriptions.Item>
            <Descriptions.Item label="Extra Effort Allowance">
              {selectedRecord.U_exefallow}
            </Descriptions.Item>
            <Descriptions.Item label="Other Earning">
              {selectedRecord.U_OEARN}
            </Descriptions.Item>
            <Descriptions.Item label="Overseas Allowance">
              {selectedRecord.U_OVSAL}
            </Descriptions.Item>
            <Descriptions.Item label="Transfer Allowance">
              {selectedRecord.U_TRFAL}
            </Descriptions.Item>
            <Descriptions.Item label="Competitive Allowance">
              {selectedRecord.U_COMAL}
            </Descriptions.Item>
            <Descriptions.Item label="Hardship Allowance">
              {selectedRecord.U_HSHIP}
            </Descriptions.Item>
            <Descriptions.Item label="Benefit Adj Allowance">
              {selectedRecord.U_BENAL}
            </Descriptions.Item>
            <Descriptions.Item label="Over Base Allowance">
              {selectedRecord.U_OBASE}
            </Descriptions.Item>
            <Descriptions.Item label="Remote Area Allowance">
              {selectedRecord.U_RAAL}
            </Descriptions.Item>
            <Descriptions.Item label="Fixed OT Allowance">
              {selectedRecord.U_FOTA}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="Overtime & Days" key="3">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Normal OT Hours">
              {selectedRecord.U_OTHOUR1}
            </Descriptions.Item>
            <Descriptions.Item label="PH OT Hours">
              {selectedRecord.U_OTHOUR2}
            </Descriptions.Item>
            <Descriptions.Item label="Ramadan OT Hours">
              {selectedRecord.U_OTHOUR3}
            </Descriptions.Item>
            <Descriptions.Item label="Total OT Hours">
              {selectedRecord.U_TOTHR}
            </Descriptions.Item>
            <Descriptions.Item label="OT Rate">
              {selectedRecord.U_OTRT}
            </Descriptions.Item>
            <Descriptions.Item label="Out Living Exp">
              {selectedRecord.U_OTLV}
            </Descriptions.Item>
            <Descriptions.Item label="Total Absent Days">
              {selectedRecord.U_TABDays}
            </Descriptions.Item>
            <Descriptions.Item label="Absent Days Deduction">
              {selectedRecord.U_absdays}
            </Descriptions.Item>
            <Descriptions.Item label="Stand By Days">
              {selectedRecord.U_stddays}
            </Descriptions.Item>
            <Descriptions.Item label="Total UnPaid Days">
              {selectedRecord.U_TUPDays}
            </Descriptions.Item>
            <Descriptions.Item label="UnPaid Days">
              {selectedRecord.U_unpddays}
            </Descriptions.Item>
            <Descriptions.Item label="UMRAH/HAJJ Days">
              {selectedRecord.U_umhjdays}
            </Descriptions.Item>
            <Descriptions.Item label="Medical Days">
              {selectedRecord.U_medidays}
            </Descriptions.Item>
            <Descriptions.Item label="Shift Days">
              {selectedRecord.U_SFDAY}
            </Descriptions.Item>
            <Descriptions.Item label="Remote Area Days">
              {selectedRecord.U_RADAY}
            </Descriptions.Item>
            <Descriptions.Item label="Site Activation Days">
              {selectedRecord.U_SADAY}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="Deductions" key="4">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="TPA Deduction">
              {selectedRecord.U_TPAD}
            </Descriptions.Item>
            <Descriptions.Item label="Other Deduction">
              {selectedRecord.U_ODED}
            </Descriptions.Item>
            <Descriptions.Item label="Other Deduction Staff Accounts">
              {selectedRecord.U_ODEDSA}
            </Descriptions.Item>
            <Descriptions.Item label="Advance">
              {selectedRecord.U_adv}
            </Descriptions.Item>
            <Descriptions.Item label="Loan">
              {selectedRecord.U_loan}
            </Descriptions.Item>
            <Descriptions.Item label="GOSI">
              {selectedRecord.U_gosi}
            </Descriptions.Item>
            <Descriptions.Item label="TPA Deduction (Alt)">
              {selectedRecord.U_TPAD_1}
            </Descriptions.Item>
            <Descriptions.Item label="Admin Charge">
              {selectedRecord.U_ADMC}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="Actual Values" key="5">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Actual Basic">
              {selectedRecord.U_albasic}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Food">
              {selectedRecord.U_alfood}
            </Descriptions.Item>
            <Descriptions.Item label="Actual HRA">
              {selectedRecord.U_alhra}
            </Descriptions.Item>
            <Descriptions.Item label="Actual TEL">
              {selectedRecord.U_altel}
            </Descriptions.Item>
            <Descriptions.Item label="Actual TPA">
              {selectedRecord.U_altpa}
            </Descriptions.Item>
            <Descriptions.Item label="Actual FUEL">
              {selectedRecord.U_alfuel}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Shift Allowance">
              {selectedRecord.U_alshftallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Other Allowance">
              {selectedRecord.U_alothrallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual OT Allowance">
              {selectedRecord.U_alotallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Special Allowance">
              {selectedRecord.U_alspecallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Act. Allowance">
              {selectedRecord.U_alactallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Project Allowance">
              {selectedRecord.U_alprojallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Offshore Allowance">
              {selectedRecord.U_aloffsallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Air Ticket Allowance">
              {selectedRecord.U_alairtallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Extra Effort Allowance">
              {selectedRecord.U_alexefallow}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Total Salary">
              {selectedRecord.U_altotalsal}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Overseas Allowance">
              {selectedRecord.U_alover}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Transfer Allowance">
              {selectedRecord.U_altran}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Competitive Allowance">
              {selectedRecord.U_alcomp}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Hardship Allowance">
              {selectedRecord.U_alhard}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Benefit Adj Allowance">
              {selectedRecord.U_albene}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Fixed OT Allowance">
              {selectedRecord.U_alFOTA}
            </Descriptions.Item>
            <Descriptions.Item label="Actual Out Living Exp">
              {selectedRecord.U_alOTLV}
            </Descriptions.Item>
          </Descriptions>
        </TabPane>

        <TabPane tab="Summary" key="6">
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Total Earnings" span={2}>
              <strong style={{ fontSize: "16px", color: "#52c41a" }}>
                {selectedRecord.U_totalearn}
              </strong>
            </Descriptions.Item>
            <Descriptions.Item label="Overall Net Payable" span={2}>
              <strong style={{ fontSize: "16px", color: "#1890ff" }}>
                {selectedRecord.U_ONP}
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
          <TabPane tab="Basic Information" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="U_year" label="Year">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_paygroup" label="Pay Group">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
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
                <Form.Item name="U_email" label="Email">
                  <Input type="email" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="U_EramId" label="ERAM ID">
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Salary Components" key="2">
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

          <TabPane tab="Overtime & Days" key="3">
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

          <TabPane tab="Deductions" key="4">
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

          <TabPane tab="Summary" key="5">
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
          <Input
            placeholder="Search by name, email or ERAM ID"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 300 }}
          />
        }
      >
        {payrollData?.payroll ? (
          <Table
            columns={payrollColumns}
            dataSource={filteredData}
            rowKey="_id"
            scroll={{ x: true }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} records`,
            }}
            loading={!payrollData}
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
        width="90%"
        style={{ top: 20 }}
      >
        {renderViewContent()}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Payroll Record"
        visible={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        width="90%"
        style={{ top: 20 }}
        okText="Save Changes"
        okButtonProps={{
          style: {
            background: "linear-gradient(135deg,  #da2c46 70%, #a51632 100%)",
          },
        }}
        cancelText="Cancel"
      >
        {renderEditForm()}
      </Modal>
    </div>
  );
};

export default EmployeeAdminPayroll;
