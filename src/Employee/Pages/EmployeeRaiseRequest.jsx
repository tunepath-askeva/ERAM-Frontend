import React, { useState } from "react";
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Typography,
    message,
    Row,
    Col,
    Space
} from "antd";
import {
    SolutionOutlined,
    FormOutlined,
    SendOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const EmployeeRaiseRequest = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const requestTypes = [
        "Leave Request",
        "Salary Increase",
        "Promotion",
        "Title Change",
        "Bonus Request",
        "Work Condition Adjustment",
        "Other",
    ];

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            message.success("Your request has been submitted successfully!");
            form.resetFields();
        } catch (error) {
            message.error("Failed to submit request. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div style={{
            padding: "24px",
            minHeight: "100vh"
        }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{
                    background: "white",
                    padding: "24px",
                    borderRadius: "12px",
                    marginBottom: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Title level={2} style={{ margin: 0, color: "#da2c46" }}>
                                <SolutionOutlined style={{ marginRight: 12 }} />
                                Raise Request
                            </Title>
                            <Text type="secondary">
                                Submit a formal request for salary increase, promotion, or other adjustments
                            </Text>
                        </Col>
                    </Row>
                </div>

                {/* Main Content */}
                <Card 
                    style={{ 
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                    }}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="requestType"
                                    label="Request Type"
                                    rules={[
                                        { 
                                            required: true, 
                                            message: 'Please select request type'
                                        }
                                    ]}
                                >
                                    <Select
                                        placeholder="Select request type"
                                        suffixIcon={<FormOutlined />}
                                    >
                                        {requestTypes.map((type, index) => (
                                            <Option key={index} value={type}>
                                                {type}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item
                                    name="description"
                                    label="Description"
                                    rules={[
                                        { 
                                            required: true, 
                                            message: 'Please provide details about your request'
                                        },
                                        {
                                            min: 20,
                                            message: 'Description should be at least 20 characters'
                                        }
                                    ]}
                                >
                                    <TextArea
                                        rows={6}
                                        placeholder="Please provide detailed justification for your request..."
                                        showCount
                                        maxLength={1000}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div style={{ textAlign: "right", marginTop: 24 }}>
                            <Space>
                                <Button 
                                    onClick={() => form.resetFields()}
                                    disabled={loading}
                                >
                                    Clear
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    icon={<SendOutlined />}
                                    style={{ 
                                        background: "#da2c46", 
                                        border: "none" 
                                    }}
                                >
                                    Submit Request
                                </Button>
                            </Space>
                        </div>
                    </Form>
                </Card>

                {/* Additional Information */}
                {/* <Card 
                    style={{ 
                        marginTop: 24,
                        borderRadius: "12px", 
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
                    }}
                >
                    <Title level={4} style={{ color: "#da2c46" }}>
                        <SolutionOutlined style={{ marginRight: 8 }} />
                        Request Process Information
                    </Title>
                    <Text type="secondary">
                        <ul>
                            <li>Requests typically take 5-7 business days to process</li>
                            <li>You will receive a notification when your request is reviewed</li>
                            <li>HR may contact you for additional information</li>
                            <li>All requests are confidential</li>
                        </ul>
                    </Text>
                </Card> */}
            </div>
        </div>
    );
};

export default EmployeeRaiseRequest;