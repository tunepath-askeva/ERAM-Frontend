import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  Avatar,
  Button,
  Space,
  Tag,
  Typography,
  Modal,
  Upload,
  message,
  Card,
  DatePicker,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  CameraOutlined,
  UploadOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  FlagOutlined,
  MailOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useSnackbar } from "notistack";
import PhoneInput from "../../Global/PhoneInput";
import { phoneUtils } from "../../utils/countryMobileLimits";

const { Text } = Typography;
const { TextArea } = Input;

const PersonalInformationCard = ({ employeeData, loading, onUpdate }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [form] = Form.useForm();
  const [editMode, setEditMode] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [userData, setUserData] = useState({
    image: employeeData?.image || "",
    imageFile: null,
  });

  const handleAvatarUpload = ({ fileList: newFileList }) => {
    if (newFileList.length > 0) {
      const file = newFileList[0].originFileObj || newFileList[0];

      if (!file || file.url) {
        return;
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        message.error("Only JPEG, JPG, and PNG files are allowed!");
        setFileList([]);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        message.error("File size should not exceed 5MB!");
        setFileList([]);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData({
          ...userData,
          image: e.target.result, // Preview URL
          imageFile: file, // Store file for upload
        });
      };
      reader.readAsDataURL(file);
    } else {
      setUserData({
        ...userData,
        image: employeeData?.image || "",
        imageFile: null,
      });
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Explicitly get phoneCountryCode from form to ensure it's included
      const phoneCountryCode = form.getFieldValue("phoneCountryCode") || values.phoneCountryCode || "91";
      const phoneNumber = values.phone || "";
      const cleanPhoneNumber = phoneNumber.replace(/^\+/, "").replace(/\D/g, "");

      const submitData = {
        ...values,
        phone: cleanPhoneNumber, // Phone number without country code
        phoneCountryCode: phoneCountryCode, // Country code sent separately - explicitly included
        imageFile: userData.imageFile, // Pass the file to parent
      };
      
      // Ensure phoneCountryCode is always in the payload
      if (!submitData.phoneCountryCode) {
        submitData.phoneCountryCode = "91";
      }
      
      await onUpdate(submitData);
      enqueueSnackbar("Personal information updated successfully!", {
        variant: "success",
      });
      setUserData({
        image: "",
        imageFile: null,
      });

      setEditMode(false);
    } catch (error) {
      enqueueSnackbar(error?.data?.message || "Failed to update profile", {
        variant: "error",
      });
    }
  };

  // Format date for DatePicker
  const formatDate = (dateString) => {
    return dateString ? dayjs(dateString) : null;
  };

  // Extract country code from phone number if present, prioritizing stored country code
  const extractPhoneData = (phoneStr, storedCountryCode) => {
    if (!phoneStr) return { phone: "", phoneCountryCode: storedCountryCode || "91" };
    
    // If we have a stored country code, use it
    if (storedCountryCode) {
      // Remove + prefix if present
      let phoneWithoutPlus = phoneStr.trim();
      while (phoneWithoutPlus.startsWith("+")) {
        phoneWithoutPlus = phoneWithoutPlus.substring(1).trim();
      }
      const cleanPhone = phoneWithoutPlus.replace(/\D/g, "");
      
      // If phone starts with country code, remove it
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
    
    // Fallback: extract country code if not stored
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
        phoneCountryCode: "91", // Default to 91
      };
    }
    
    return { phone: "", phoneCountryCode: "91" };
  };

  const phoneData = extractPhoneData(employeeData?.phone, employeeData?.phoneCountryCode);

  const formInitialValues = {
    firstName: employeeData?.firstName || "",
    middleName: employeeData?.middleName || "",
    lastName: employeeData?.lastName || "",
    fullName: employeeData?.fullName || "",
    eramId: employeeData?.employmentDetails?.eramId || "",
    nationality: employeeData?.nationality || "",
    assignedJobTitle: employeeData?.employmentDetails?.assignedJobTitle || "",
    email: employeeData?.email || "",
    phone: phoneData.phone,
    phoneCountryCode: phoneData.phoneCountryCode,
    dob: formatDate(employeeData?.dob),
    age: employeeData?.age || "",
    gender: employeeData?.gender || "",
    bloodGroup: employeeData?.bloodGroup || "",
    maritalStatus: employeeData?.maritalStatus || "",
    religion: employeeData?.religion || "",
    countryOfBirth: employeeData?.countryOfBirth || "",
    passportNo: employeeData?.passportNo || "",
    passportPlaceOfIssue: employeeData?.passportPlaceOfIssue || "",
    iqamaNo: employeeData?.iqamaNo || "",
    visaStatus: Array.isArray(employeeData?.visaStatus)
      ? employeeData.visaStatus[0] || ""
      : employeeData?.visaStatus || "",
    totalExperienceYears: employeeData?.totalExperienceYears || "",
    profileSummary: employeeData?.profileSummary || "",
  };

  return (
    <>
      <Card
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>
              <UserOutlined style={{ marginRight: 8, color: "#da2c46" }} />
              Personal Information
            </span>
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit"}
            </Button>
          </div>
        }
        style={{ marginBottom: 24, borderRadius: "12px" }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={formInitialValues}
        >
          <Row gutter={24}>
            <Col span={24} style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  size={100}
                  src={userData.image || employeeData?.image || undefined}
                  icon={
                    !userData.image && !employeeData?.image ? (
                      <UserOutlined />
                    ) : null
                  }
                  style={{ border: "4px solid #da2c46" }}
                />
                {editMode && (
                  <>
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const allowedTypes = [
                          "image/jpeg",
                          "image/jpg",
                          "image/png",
                        ];
                        if (!allowedTypes.includes(file.type)) {
                          message.error(
                            "Only JPEG, JPG, and PNG files are allowed!"
                          );
                          return false;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          message.error("File size should not exceed 5MB!");
                          return false;
                        }

                        // Create preview
                        const reader = new FileReader();
                        reader.onload = (e) => {
                          setUserData({
                            ...userData,
                            image: e.target.result,
                            imageFile: file,
                          });
                        };
                        reader.readAsDataURL(file);

                        return false; // Prevent auto upload
                      }}
                    >
                      <Button
                        type="primary"
                        shape="circle"
                        icon={<CameraOutlined />}
                        size="small"
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          background: "#da2c46",
                          border: "2px solid white",
                        }}
                      />
                    </Upload>
                  </>
                )}
              </div>

              {editMode && userData.imageFile && (
                <div style={{ marginTop: 12 }}>
                  <Space>
                    <Text style={{ color: "#52c41a", fontSize: 12 }}>
                      ✓ New image selected
                    </Text>
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        setUserData({
                          ...userData,
                          image: employeeData?.image || "",
                          imageFile: null,
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </Space>
                </div>
              )}

              <div style={{ marginTop: 12 }}>
                <Text
                  style={{
                    display: "block",
                    fontSize: "16px",
                    fontWeight: 600,
                  }}
                >
                  {employeeData?.fullName ||
                    `${employeeData?.firstName || ""} ${
                      employeeData?.lastName || ""
                    }`.trim()}
                </Text>
                <Text type="secondary">
                  {employeeData?.employmentDetails?.assignedJobTitle}
                </Text>
                <br />
                <Tag color="blue" style={{ marginTop: 4 }}>
                  ID: {employeeData?.employmentDetails?.eramId}
                </Tag>
              </div>
            </Col>
            {/* Basic Information */}
            <Col xs={24} sm={8}>
              <Form.Item label="First Name" name="firstName">
                <Input prefix={<UserOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Middle Name" name="middleName">
                <Input prefix={<UserOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Last Name" name="lastName">
                <Input prefix={<UserOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Full Name" name="fullName">
                <Input prefix={<UserOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="ERAM ID" name="eramId">
                <Input prefix={<IdcardOutlined />} disabled />
              </Form.Item>
            </Col>
            {/* Contact Information */}
            <Col xs={24} sm={12}>
              <Form.Item label="Email" name="email">
                <Input prefix={<MailOutlined />} disabled />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <PhoneInput
                form={form}
                name="phone"
                label="Phone"
                required={false}
                disabled={!editMode}
              />
            </Col>
            {/* Personal Details */}
            <Col xs={24} sm={8}>
              <Form.Item label="Date of Birth" name="dob">
                <DatePicker
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  disabled={!editMode}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Age" name="age">
                <Input disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Gender" name="gender">
                <Select disabled={!editMode} placeholder="Select gender">
                  <Select.Option value="Male">Male</Select.Option>
                  <Select.Option value="Female">Female</Select.Option>
                  <Select.Option value="Prefer not to say">
                    Prefer not to say
                  </Select.Option>
                  <Select.Option value="Others">Others</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Marital Status" name="maritalStatus">
                <Select
                  disabled={!editMode}
                  placeholder="Select marital status"
                >
                  <Select.Option value="Single">Single</Select.Option>
                  <Select.Option value="Married">Married</Select.Option>
                  <Select.Option value="Divorced">Divorced</Select.Option>
                  <Select.Option value="Widowed">Widowed</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Blood Group" name="bloodGroup">
                <Select disabled={!editMode} placeholder="Select blood group">
                  <Select.Option value="A+">A+</Select.Option>
                  <Select.Option value="A-">A-</Select.Option>
                  <Select.Option value="B+">B+</Select.Option>
                  <Select.Option value="B-">B-</Select.Option>
                  <Select.Option value="O+">O+</Select.Option>
                  <Select.Option value="O-">O-</Select.Option>
                  <Select.Option value="AB+">AB+</Select.Option>
                  <Select.Option value="AB-">AB-</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item label="Religion" name="religion">
                <Select disabled={!editMode} placeholder="Select religion">
                  <Select.Option value="Christianity">
                    Christianity
                  </Select.Option>
                  <Select.Option value="Islam">Islam</Select.Option>
                  <Select.Option value="Hinduism">Hinduism</Select.Option>
                  <Select.Option value="Buddhism">Buddhism</Select.Option>
                  <Select.Option value="Judaism">Judaism</Select.Option>
                  <Select.Option value="Sikhism">Sikhism</Select.Option>
                  <Select.Option value="Jainism">Jainism</Select.Option>
                  <Select.Option value="Other">Other</Select.Option>
                  <Select.Option value="Prefer not to say">
                    Prefer not to say
                  </Select.Option>
                </Select>
              </Form.Item>
            </Col>
            {/* Nationality & Documents */}
            <Col xs={24} sm={12}>
              <Form.Item label="Nationality" name="nationality">
                <Input prefix={<FlagOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Country of Birth" name="countryOfBirth">
                <Input prefix={<EnvironmentOutlined />} disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Passport Number" name="passportNo">
                <Input disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Passport Place of Issue"
                name="passportPlaceOfIssue"
              >
                <Input disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Iqama Number" name="iqamaNo">
                <Input disabled={!editMode} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item label="Visa Status" name="visaStatus">
                <Input disabled={!editMode} />
              </Form.Item>
            </Col>
            {/* Experience */}
            <Col xs={24} sm={12}>
              <Form.Item label="Total Experience" name="totalExperienceYears">
                <Input disabled={!editMode} />
              </Form.Item>
            </Col>
            {/* Profile Summary */}
            <Col span={24}>
              <Form.Item label="Profile Summary" name="profileSummary">
                <TextArea
                  rows={4}
                  disabled={!editMode}
                  placeholder="Brief summary about yourself"
                />
              </Form.Item>
            </Col>
          </Row>

          {editMode && (
            <div style={{ textAlign: "right", marginTop: 16 }}>
              <Space>
                <Button onClick={() => setEditMode(false)}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ background: "#da2c46", border: "none" }}
                >
                  Save Changes
                </Button>
              </Space>
            </div>
          )}
        </Form>
      </Card>

      <Modal
        title="Update Profile Picture"
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={null}
        centered
      >
        <div style={{ textAlign: "center" }}>
          <Avatar
            size={120}
            src={employeeData?.image}
            icon={<UserOutlined />}
            style={{ border: "4px solid #da2c46", marginBottom: 16 }}
          />
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
            onChange={handleAvatarUpload}
          >
            <Button
              type="primary"
              icon={<UploadOutlined />}
              style={{ background: "#da2c46", border: "none" }}
            >
              Upload New Picture
            </Button>
          </Upload>
          <div style={{ marginTop: 16, color: "#666", fontSize: "12px" }}>
            Recommended: Square image, max 2MB
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PersonalInformationCard;
