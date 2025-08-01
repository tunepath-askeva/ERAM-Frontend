import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Card,
  Row,
  Col,
  Radio,
  Checkbox,
  Space,
  Badge,
  Upload,
} from "antd";
import {
  PlusOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  HomeOutlined,
  HeartOutlined,
  TeamOutlined,
  GiftOutlined,
  WarningOutlined,
  SendOutlined,
  SaveOutlined,
  UploadOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSubmitLeaveRequestMutation } from "../../Slices/Employee/EmployeeApis";

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const { Option } = Select;

const leaveTypes = [
  {
    value: "annual",
    label: "Annual Leave",
    color: "blue",
    icon: <CalendarOutlined />,
    description: "Yearly vacation days",
  },
  {
    value: "sick",
    label: "Sick Leave",
    color: "red",
    icon: <MedicineBoxOutlined />,
    description: "Medical leave for illness",
  },
  {
    value: "casual",
    label: "Casual Leave",
    color: "green",
    icon: <HomeOutlined />,
    description: "Short personal breaks",
  },
  {
    value: "maternity",
    label: "Maternity Leave",
    color: "pink",
    icon: <HeartOutlined />,
    description: "Maternity care leave",
  },
  {
    value: "paternity",
    label: "Paternity Leave",
    color: "cyan",
    icon: <TeamOutlined />,
    description: "Paternity care leave",
  },
  {
    value: "compensatory",
    label: "Compensatory Off",
    color: "orange",
    icon: <GiftOutlined />,
    description: "Comp off for overtime",
  },
  {
    value: "emergency",
    label: "Emergency Leave",
    color: "volcano",
    icon: <WarningOutlined />,
    description: "Urgent personal matters",
  },
];

const LeaveForm = ({ onLeaveSubmit, leaveBalances, mobileView }) => {
  const [form] = Form.useForm();
  const [submitLeaveRequest, { isLoading }] = useSubmitLeaveRequestMutation();
  const [fileList, setFileList] = useState([]);

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();

      formData.append("leaveType", values.leaveType);
      formData.append(
        "startDate",
        dayjs(values.dateRange[0]).format("YYYY-MM-DD")
      );
      formData.append(
        "endDate",
        dayjs(values.dateRange[1]).format("YYYY-MM-DD")
      );
      formData.append("reason", values.reason);
      formData.append("isHalfDay", values.isHalfDay || false);
      formData.append("urgency", values.urgency || "Normal");
      formData.append("medicalCertificate", values.medicalCertificate || false);
      formData.append("decisionDate", dayjs().format("YYYY-MM-DD"));

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append("documents", file.originFileObj);
        }
      });

      const response = await submitLeaveRequest(formData).unwrap();

      message.success(
        response.message || "Leave request submitted successfully"
      );
      form.resetFields();
      setFileList([]);

      if (onLeaveSubmit) {
        onLeaveSubmit(newLeave);
      }
    } catch (error) {
      message.error(error.data?.message || "Failed to submit leave request");
    }
  };

  const beforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("File must be smaller than 5MB!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  return (
    <Card
      title={
        <span>
          <PlusOutlined style={{ marginRight: 8, color: "#da2c46" }} />
          Apply for Leave
        </span>
      }
      style={{ borderRadius: "12px" }}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Leave Type"
              name="leaveType"
              rules={[{ required: true, message: "Please select leave type" }]}
            >
              <Select
                placeholder="Select leave type"
                size="large"
                showSearch
                optionFilterProp="children"
              >
                {leaveTypes.map((type) => (
                  <Option key={type.value} value={type.value}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {type.icon}
                        <span style={{ marginLeft: 8 }}>{type.label}</span>
                      </div>
                      <Badge
                        count={leaveBalances?.[type.value]?.remaining || 0}
                        style={{ backgroundColor: "#52c41a" }}
                      />
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Urgency Level"
              name="urgency"
              initialValue="Normal"
            >
              <Radio.Group size="large" buttonStyle="solid">
                <Radio.Button value="Low">Low</Radio.Button>
                <Radio.Button value="Normal">Normal</Radio.Button>
                <Radio.Button value="High">High</Radio.Button>
                <Radio.Button value="Critical">Critical</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Leave Duration"
              name="dateRange"
              rules={[
                { required: true, message: "Please select leave duration" },
              ]}
            >
              <RangePicker
                style={{ width: "100%" }}
                size="large"
                format="DD-MM-YYYY"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="Leave Options">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Form.Item
                  name="isHalfDay"
                  valuePropName="checked"
                  style={{ marginBottom: 8 }}
                >
                  <Checkbox>Half Day Leave</Checkbox>
                </Form.Item>
                <Form.Item
                  name="medicalCertificate"
                  valuePropName="checked"
                  style={{ marginBottom: 0 }}
                >
                  <Checkbox>Medical Certificate Available</Checkbox>
                </Form.Item>
              </Space>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Reason for Leave"
          name="reason"
          rules={[
            { required: true, message: "Please provide reason for leave" },
            { min: 10, message: "Reason must be at least 10 characters" },
          ]}
        >
          <TextArea
            rows={4}
            placeholder="Please provide detailed reason for your leave request..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item label="Supporting Documents">
          <Upload
            beforeUpload={beforeUpload}
            onChange={({ fileList }) => setFileList(fileList)}
            multiple
            fileList={fileList}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          >
            <Button icon={<UploadOutlined />}>Upload Documents</Button>
          </Upload>
          <div style={{ marginTop: 8, color: "rgba(0, 0, 0, 0.45)" }}>
            <PaperClipOutlined /> Supports: PDF, DOC, JPG, PNG (Max 5MB)
          </div>
        </Form.Item>

        <div style={{ textAlign: mobileView ? "center" : "right" }}>
          <Space
            direction={mobileView ? "vertical" : "horizontal"}
            style={{ width: mobileView ? "100%" : "auto" }}
          >
            <Button
              size="large"
              style={{ width: mobileView ? "100%" : "auto" }}
              icon={<SaveOutlined />}
              onClick={() => form.resetFields()}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              size="large"
              style={{
                background: "#da2c46",
                border: "none",
                width: mobileView ? "100%" : "auto",
              }}
              icon={<SendOutlined />}
            >
              Submit Request
            </Button>
          </Space>
        </div>
      </Form>
    </Card>
  );
};

export default LeaveForm;
