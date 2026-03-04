import React, { useState, useEffect } from "react";
import { Card, Form, Input, Row, Col, Button, Space, Typography, Checkbox, message } from "antd";
import { HomeOutlined, SaveOutlined, EditOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { TextArea } = Input;

const AddressInformationCard = ({ employeeData, loading, onUpdate }) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [sameAsPresent, setSameAsPresent] = useState(false);

  useEffect(() => {
    if (employeeData) {
      const presentAddr = employeeData?.presentAddress || {};
      const permanentAddr = employeeData?.permanentAddress || {};
      
      // Check if addresses are the same
      const addressesMatch = 
        presentAddr.region === permanentAddr.region &&
        presentAddr.streetNo === permanentAddr.streetNo &&
        presentAddr.streetName === permanentAddr.streetName &&
        presentAddr.block === permanentAddr.block &&
        presentAddr.building === permanentAddr.building &&
        presentAddr.zipCode === permanentAddr.zipCode &&
        presentAddr.city === permanentAddr.city &&
        presentAddr.state === permanentAddr.state &&
        presentAddr.country === permanentAddr.country;

      setSameAsPresent(addressesMatch);

      form.setFieldsValue({
        presentAddress: {
          region: presentAddr.region || "",
          streetNo: presentAddr.streetNo || "",
          streetName: presentAddr.streetName || "",
          block: presentAddr.block || "",
          building: presentAddr.building || "",
          zipCode: presentAddr.zipCode || "",
          city: presentAddr.city || "",
          state: presentAddr.state || "",
          country: presentAddr.country || "",
        },
        permanentAddress: {
          region: permanentAddr.region || "",
          streetNo: permanentAddr.streetNo || "",
          streetName: permanentAddr.streetName || "",
          block: permanentAddr.block || "",
          building: permanentAddr.building || "",
          zipCode: permanentAddr.zipCode || "",
          city: permanentAddr.city || "",
          state: permanentAddr.state || "",
          country: permanentAddr.country || "",
        },
      });
    }
  }, [employeeData, form]);

  const handleSameAsPresentChange = (e) => {
    const checked = e.target.checked;
    setSameAsPresent(checked);
    
    if (checked) {
      const presentValues = form.getFieldValue("presentAddress");
      form.setFieldsValue({
        permanentAddress: { ...presentValues },
      });
    }
  };

  const handlePresentAddressChange = () => {
    if (sameAsPresent) {
      const presentValues = form.getFieldValue("presentAddress");
      form.setFieldsValue({
        permanentAddress: { ...presentValues },
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const submitData = {
        presentAddress: values.presentAddress || {},
        permanentAddress: values.permanentAddress || {},
      };

      await onUpdate(submitData);
      setEditMode(false);
      message.success("Address information updated successfully!");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Card
      title={
        <Space size="small">
          <HomeOutlined style={{ color: "#da2c46" }} />
          <Text strong>Address Information</Text>
        </Space>
      }
      extra={
        !editMode ? (
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => setEditMode(true)}
            style={{ background: "#da2c46", border: "none" }}
          >
            Edit
          </Button>
        ) : (
          <Space>
            <Button onClick={() => {
              setEditMode(false);
              form.resetFields();
            }}>
              Cancel
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={loading}
              style={{ background: "#da2c46", border: "none" }}
            >
              Save
            </Button>
          </Space>
        )
      }
      style={{
        marginBottom: "24px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Form form={form} layout="vertical">
        {/* Present Address Section */}
        <div style={{ marginBottom: "32px" }}>
          <Text strong style={{ fontSize: "16px", marginBottom: "16px", display: "block" }}>
            Present Address
          </Text>
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Country"
                name={["presentAddress", "country"]}
                rules={[{ required: true, message: "Please enter country" }]}
              >
                <Input placeholder="Enter country" disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="State/Province"
                name={["presentAddress", "state"]}
                rules={[{ required: true, message: "Please enter state" }]}
              >
                <Input placeholder="Enter state/province" disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="City"
                name={["presentAddress", "city"]}
                rules={[{ required: true, message: "Please enter city" }]}
              >
                <Input placeholder="Enter city" disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Street Name" name={["presentAddress", "streetName"]}>
                <Input placeholder="Enter street name" disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Street No" name={["presentAddress", "streetNo"]}>
                <Input placeholder="Enter street number" disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Block" name={["presentAddress", "block"]}>
                <Input placeholder="Enter block" disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Building" name={["presentAddress", "building"]}>
                <Input placeholder="Enter building" disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Zip/Postal Code" name={["presentAddress", "zipCode"]}>
                <Input placeholder="Enter zip/postal code" disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Full Address" name={["presentAddress", "region"]}>
                <TextArea
                  rows={3}
                  placeholder="Enter full address"
                  disabled={!editMode}
                  onChange={editMode ? handlePresentAddressChange : undefined}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Permanent Address Section */}
        <div>
          <div style={{ marginBottom: "16px" }}>
            <Checkbox
              checked={sameAsPresent}
              onChange={handleSameAsPresentChange}
              disabled={!editMode}
            >
              <Text strong>Permanent address is same as present address</Text>
            </Checkbox>
          </div>
          <Text strong style={{ fontSize: "16px", marginBottom: "16px", display: "block" }}>
            Permanent Address
          </Text>
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Form.Item
                label="Country"
                name={["permanentAddress", "country"]}
                rules={[{ required: true, message: "Please enter country" }]}
              >
                <Input placeholder="Enter country" disabled={!editMode || sameAsPresent} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="State/Province"
                name={["permanentAddress", "state"]}
                rules={[{ required: true, message: "Please enter state" }]}
              >
                <Input placeholder="Enter state/province" disabled={!editMode || sameAsPresent} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label="City"
                name={["permanentAddress", "city"]}
                rules={[{ required: true, message: "Please enter city" }]}
              >
                <Input placeholder="Enter city" disabled={!editMode || sameAsPresent} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Street Name" name={["permanentAddress", "streetName"]}>
                <Input placeholder="Enter street name" disabled={!editMode || sameAsPresent} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Street No" name={["permanentAddress", "streetNo"]}>
                <Input placeholder="Enter street number" disabled={!editMode || sameAsPresent} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Block" name={["permanentAddress", "block"]}>
                <Input placeholder="Enter block" disabled={!editMode || sameAsPresent} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Building" name={["permanentAddress", "building"]}>
                <Input placeholder="Enter building" disabled={!editMode || sameAsPresent} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Zip/Postal Code" name={["permanentAddress", "zipCode"]}>
                <Input placeholder="Enter zip/postal code" disabled={!editMode || sameAsPresent} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label="Full Address" name={["permanentAddress", "region"]}>
                <TextArea
                  rows={3}
                  placeholder="Enter full address"
                  disabled={!editMode || sameAsPresent}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Card>
  );
};

export default AddressInformationCard;

