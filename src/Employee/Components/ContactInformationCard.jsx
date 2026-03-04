import React, { useState, useEffect } from "react";
import { Card, Form, Input, Row, Col, Button, Space, Typography, message } from "antd";
import { ContactsOutlined, SaveOutlined, EditOutlined } from "@ant-design/icons";
import PhoneInput from "../../Global/PhoneInput";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Text } = Typography;

const ContactInformationCard = ({ employeeData, loading, onUpdate }) => {
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (employeeData) {
      const contactMobileData = extractPhoneData(
        employeeData?.contactPersonMobile,
        employeeData?.contactPersonMobileCountryCode
      );
      const contactHomeData = extractPhoneData(
        employeeData?.contactPersonHomeNo,
        employeeData?.contactPersonHomeNoCountryCode
      );
      const emergencyData = extractPhoneData(
        employeeData?.emergencyContactNo,
        employeeData?.emergencyContactNoCountryCode
      );

      form.setFieldsValue({
        contactPersonName: employeeData?.contactPersonName || "",
        contactPersonMobile: contactMobileData.phone,
        contactPersonMobileCountryCode: contactMobileData.phoneCountryCode,
        contactPersonHomeNo: contactHomeData.phone,
        contactPersonHomeNoCountryCode: contactHomeData.phoneCountryCode,
        emergencyContactNo: emergencyData.phone,
        emergencyContactNoCountryCode: emergencyData.phoneCountryCode,
      });
    }
  }, [employeeData, form]);

  const extractPhoneData = (phoneStr, storedCountryCode) => {
    if (!phoneStr) return { phone: "", phoneCountryCode: storedCountryCode || "91" };
    
    if (storedCountryCode) {
      let phoneWithoutPlus = phoneStr.trim();
      while (phoneWithoutPlus.startsWith("+")) {
        phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
      }
      const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
      
      if (cleanPhone.startsWith(storedCountryCode)) {
        return {
          phone: cleanPhone.slice(storedCountryCode.length),
          phoneCountryCode: storedCountryCode,
        };
      } else {
        return {
          phone: cleanPhone,
          phoneCountryCode: storedCountryCode,
        };
      }
    }
    
    let phoneWithoutPlus = phoneStr.trim();
    while (phoneWithoutPlus.startsWith("+")) {
      phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
    }
    
    const parsed = phoneUtils.parsePhoneNumber(phoneWithoutPlus);
    if (parsed.countryCode && parsed.phoneNumber) {
      return {
        phone: parsed.phoneNumber,
        phoneCountryCode: parsed.countryCode,
      };
    } else if (phoneWithoutPlus) {
      return {
        phone: phoneWithoutPlus.replace(/\D/g, ""),
        phoneCountryCode: "91",
      };
    }
    
    return { phone: "", phoneCountryCode: "91" };
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const contactMobileCountryCode = form.getFieldValue("contactPersonMobileCountryCode") || values.contactPersonMobileCountryCode || "91";
      const contactMobileNumber = values.contactPersonMobile || "";
      let cleanContactMobile = contactMobileNumber.replace(/^\+/, "").replace(/\D/g, "");
      if (cleanContactMobile && cleanContactMobile.startsWith(contactMobileCountryCode)) {
        cleanContactMobile = cleanContactMobile.slice(contactMobileCountryCode.length);
      }

      const contactHomeCountryCode = form.getFieldValue("contactPersonHomeNoCountryCode") || values.contactPersonHomeNoCountryCode || "91";
      const contactHomeNumber = values.contactPersonHomeNo || "";
      let cleanContactHome = contactHomeNumber.replace(/^\+/, "").replace(/\D/g, "");
      if (cleanContactHome && cleanContactHome.startsWith(contactHomeCountryCode)) {
        cleanContactHome = cleanContactHome.slice(contactHomeCountryCode.length);
      }

      const emergencyCountryCode = form.getFieldValue("emergencyContactNoCountryCode") || values.emergencyContactNoCountryCode || "91";
      const emergencyPhoneNumber = values.emergencyContactNo || "";
      let cleanEmergencyPhone = emergencyPhoneNumber.replace(/^\+/, "").replace(/\D/g, "");
      if (cleanEmergencyPhone && cleanEmergencyPhone.startsWith(emergencyCountryCode)) {
        cleanEmergencyPhone = cleanEmergencyPhone.slice(emergencyCountryCode.length);
      }

      const submitData = {
        contactPersonName: values.contactPersonName || "",
        contactPersonMobile: cleanContactMobile,
        contactPersonMobileCountryCode: contactMobileCountryCode,
        contactPersonHomeNo: cleanContactHome,
        contactPersonHomeNoCountryCode: contactHomeCountryCode,
        emergencyContactNo: cleanEmergencyPhone,
        emergencyContactNoCountryCode: emergencyCountryCode,
      };

      await onUpdate(submitData);
      setEditMode(false);
      message.success("Contact information updated successfully!");
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <Card
      title={
        <Space size="small">
          <ContactsOutlined style={{ color: "#da2c46" }} />
          <Text strong>Contact Information</Text>
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
        <Row gutter={24}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Emergency Contact Person Name"
              name="contactPersonName"
              rules={[
                {
                  required: true,
                  message: "Please enter contact person name",
                },
              ]}
            >
              <Input
                placeholder="Enter name"
                disabled={!editMode}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <PhoneInput
              form={form}
              name="emergencyContactNo"
              label="Emergency Contact Number"
              required={false}
              disabled={!editMode}
              countryCodeFieldName="emergencyContactNoCountryCode"
            />
          </Col>

          <Col xs={24} sm={12}>
            <PhoneInput
              form={form}
              name="contactPersonMobile"
              label="Contact Person Mobile"
              required={false}
              disabled={!editMode}
              countryCodeFieldName="contactPersonMobileCountryCode"
            />
          </Col>

          <Col xs={24} sm={12}>
            <PhoneInput
              form={form}
              name="contactPersonHomeNo"
              label="Contact Person Home No"
              required={false}
              disabled={!editMode}
              countryCodeFieldName="contactPersonHomeNoCountryCode"
            />
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default ContactInformationCard;

