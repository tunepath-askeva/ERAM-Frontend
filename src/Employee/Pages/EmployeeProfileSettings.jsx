import React, { useState, useEffect } from "react";
import { Card, Tabs, message, Upload, Result, Button } from "antd";
import "./EmployeeProfileSettings.css";

// Breakpoints for responsive design
const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200,
};
import {
  UserOutlined,
  SafetyCertificateOutlined,
  CameraOutlined,
  FrownOutlined,
  ReloadOutlined,
  ContactsOutlined,
  HomeOutlined,
  IdcardOutlined,
  FileImageOutlined,
  BookOutlined,
  FileTextOutlined,
  TrophyOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import {
  useGetEmployeeProfileQuery,
  useUpdateEmployeeProfileMutation,
} from "../../Slices/Employee/EmployeeApis";
import EmployeeProfileHeader from "../Components/EmployeeProfileHeader";
import PersonalInformationCard from "../Components/PersonalInformationCard";
import ProfileCompletionCard from "../Components/ProfileCompletetionCard";
import EmploymentDetailsCard from "../Components/EmploymentDetailsCard";
import SecurityContent from "../Components/SecurityContent";
import SkillsLanguagesCard from "../Components/SkillsLanguagesCard";
import DocumentsCertificatesCard from "../Components/DocumentsCertificatesCard";
import ContactInformationCard from "../Components/ContactInformationCard";
import AddressInformationCard from "../Components/AddressInformationCard";
import SkeletonLoader from "../../Global/SkeletonLoader";
import EducationCard from "../Components/EducationCard";
import WorkExperienceCard from "../Components/WorkExperienceCard";
import { useSnackbar } from "notistack";
import { calculateProfileCompletion } from "../Components/Dashboard/utils";

const { TabPane } = Tabs;

const EmployeeProfileSettings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState("overview");
  const [employeeData, setEmployeeData] = useState(null);
  const [certificateFiles, setCertificateFiles] = useState([]);
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    isMobile: window.innerWidth < BREAKPOINTS.mobile,
    isTablet: window.innerWidth >= BREAKPOINTS.mobile && window.innerWidth < BREAKPOINTS.tablet,
    isDesktop: window.innerWidth >= BREAKPOINTS.tablet && window.innerWidth < BREAKPOINTS.desktop,
    isLargeDesktop: window.innerWidth >= BREAKPOINTS.desktop,
  });

  const { data, error, isLoading, refetch } = useGetEmployeeProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateEmployeeProfileMutation();

  useEffect(() => {
    if (data && data.employee) {
      // Ensure certificates is always an array, never undefined
      const employeeDataWithCertificates = {
        ...data.employee,
        certificates: Array.isArray(data.employee.certificates) 
          ? data.employee.certificates 
          : [],
      };
      setEmployeeData(employeeDataWithCertificates);
    }
  }, [data]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        width,
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
        isLargeDesktop: width >= BREAKPOINTS.desktop,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Use the shared utility function for consistent profile completion calculation
  const getProfileCompletion = () => {
    return calculateProfileCompletion(employeeData);
  };

  const handleProfileUpdate = async (values) => {
    try {
      const formData = new FormData();

      // Add basic fields
      const fields = [
        "firstName",
        "middleName",
        "lastName",
        "fullName",
        "phone",
        "phoneCountryCode",
        "emergencyContactNo",
        "emergencyContactNoCountryCode",
        "dateOfBirth",
        "age",
        "gender",
        "bloodGroup",
        "maritalStatus",
        "religion",
        "nationality",
        "countryOfBirth",
        "passportNo",
        "passportPlaceOfIssue",
        "iqamaNo",
        "totalExperienceYears",
        "profileSummary",
      ];

      fields.forEach((field) => {
        const value = values[field];
        // For phoneCountryCode and emergencyContactNoCountryCode, always include them (default to "91" if not provided)
        if (field === "phoneCountryCode" || field === "emergencyContactNoCountryCode") {
          formData.append(field, value || "91");
        } else if (value !== undefined && value !== null && value !== "") {
          // Handle dates
          if (field === "dateOfBirth" && value) {
            formData.append(
              "dateOfBirth",
              value.format ? value.format("YYYY-MM-DD") : value
            );
          } else {
            formData.append(field, value);
          }
        }
      });

      // ✅ CHANGE: Update skills from state
      if (values.skills !== undefined) {
        formData.append("skills", JSON.stringify(values.skills));
      }

      // ✅ CHANGE: Update languages from state
      if (values.languages !== undefined) {
        formData.append("languages", JSON.stringify(values.languages));
      }

      // Add visaStatus as JSON array
      if (values.visaStatus) {
        formData.append(
          "visaStatus",
          JSON.stringify(
            Array.isArray(values.visaStatus)
              ? values.visaStatus
              : [values.visaStatus]
          )
        );
      }

      // Add employment details
      if (values.employmentDetails) {
        const employmentFields = [
          "badgeNo",
          "gatePassId",
          "aramcoId",
          "otherId",
          "plantId",
          "basicAssets",
          "visaCategory",
          "periodOfContract",
          "probationPeriod",
          "insuranceCategory",
          "medicalPolicyNumber",
          "noOfDependent",
          "workDays",
          "workHours",
          "airTicketFrequency",
          "lastArrival",
          "lastWorkingDay",
          "iqamaIssueDate",
          "iqamaExpiryDate",
          "iqamaArabicDateOfIssue",
          "iqamaArabicDateOfExpiry",
          "department",
          "reportingManager",
        ];

        employmentFields.forEach((field) => {
          const value = values.employmentDetails[field];
          // For department and reportingManager, always send them (even if empty string) to allow clearing
          const isOptionalField = field === "department" || field === "reportingManager";
          
          if (value !== undefined && value !== null) {
            // For optional fields, always send (even empty string)
            // For other fields, only send if not empty
            if (isOptionalField || value !== "") {
              // Handle dates
              if (
                field.includes("Date") ||
                field.includes("Arrival") ||
                field.includes("Day")
              ) {
                formData.append(
                  field,
                  value.format ? value.format("YYYY-MM-DD") : value
                );
              } else {
                formData.append(field, value);
              }
            }
          }
        });

        // Add project field if present
        if (values.employmentDetails.project !== undefined && values.employmentDetails.project !== null && values.employmentDetails.project !== "") {
          formData.append("project", values.employmentDetails.project);
        }
      }

      // Add image file if selected
      if (values.imageFile) {
        formData.append("image", values.imageFile);
      }

      // Add certificate files
      if (certificateFiles.length > 0) {
        certificateFiles.forEach((file) => {
          formData.append("certificates", file.originFileObj || file);
        });
      }

      if (values.education !== undefined) {
        formData.append("education", JSON.stringify(values.education));
      }

      // Add work experience
      if (values.workExperience !== undefined) {
        formData.append(
          "workExperience",
          JSON.stringify(values.workExperience)
        );
      }

      // Add contact information
      if (values.contactPersonName !== undefined) {
        // Ensure contactPersonName is a string, not an array
        const contactPersonNameValue = Array.isArray(values.contactPersonName) 
          ? values.contactPersonName.join(" ") 
          : String(values.contactPersonName || "");
        formData.append("contactPersonName", contactPersonNameValue);
      }
      if (values.contactPersonMobile !== undefined) {
        // Ensure it's a string
        const contactPersonMobileValue = Array.isArray(values.contactPersonMobile)
          ? values.contactPersonMobile.join("")
          : String(values.contactPersonMobile || "");
        formData.append("contactPersonMobile", contactPersonMobileValue);
      }
      if (values.contactPersonMobileCountryCode !== undefined) {
        formData.append("contactPersonMobileCountryCode", values.contactPersonMobileCountryCode || "91");
      }
      if (values.contactPersonHomeNo !== undefined) {
        // Ensure it's a string
        const contactPersonHomeNoValue = Array.isArray(values.contactPersonHomeNo)
          ? values.contactPersonHomeNo.join("")
          : String(values.contactPersonHomeNo || "");
        formData.append("contactPersonHomeNo", contactPersonHomeNoValue);
      }
      if (values.contactPersonHomeNoCountryCode !== undefined) {
        formData.append("contactPersonHomeNoCountryCode", values.contactPersonHomeNoCountryCode || "91");
      }

      // Add address information
      if (values.presentAddress !== undefined) {
        formData.append("presentAddress", JSON.stringify(values.presentAddress));
      }
      if (values.permanentAddress !== undefined) {
        formData.append("permanentAddress", JSON.stringify(values.permanentAddress));
      }

      // Call the mutation
      await updateProfile(formData).unwrap();

      enqueueSnackbar("Profile updated successfully!", { variant: "success" });

      // setImageFile(null);
      setCertificateFiles([]);

      // Refetch data
      await refetch();
    } catch (error) {
      console.error("Failed to update profile", error);
      enqueueSnackbar(error?.data?.message || "Failed to update profile", {
        variant: "error",
      });
    }
  };

  const handleRefresh = () => {
    refetch();
    enqueueSnackbar("Profile data refreshed!", { variant: "success" });
  };

  const handleSaveAll = async () => {
    try {
      // Collect all form data from all sections
      const allValues = {
        ...employeeData,
        employmentDetails: employeeData.employmentDetails,
      };

      await handleProfileUpdate(allValues);
    } catch (error) {
      console.error("Save all error:", error);
    }
  };

  if (isLoading) return <SkeletonLoader />;
  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="500"
          title="Error Loading Profile"
          subTitle="Sorry, something went wrong while loading your profile data."
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={refetch}
              style={{ background: "#da2c46", border: "none" }}
            >
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div
        style={{
          padding: "24px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="404"
          title="No Profile Data"
          subTitle="Sorry, we couldn't find your profile information."
          extra={
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={refetch}
              style={{ background: "#da2c46", border: "none" }}
            >
              Refresh
            </Button>
          }
        />
      </div>
    );
  }

  // Determine tab position based on screen size
  const tabPosition = screenSize.isMobile || screenSize.isTablet ? "top" : "left";
  const tabSize = screenSize.isMobile ? "small" : "large";

  return (
    <div 
      style={{ 
        padding: screenSize.isMobile ? "12px" : screenSize.isTablet ? "16px" : "24px", 
        minHeight: "100vh" 
      }}
    >
      <div 
        style={{ 
          maxWidth: screenSize.isLargeDesktop ? "1400px" : "100%", 
          margin: "0 auto" 
        }}
      >
        <EmployeeProfileHeader
          onRefresh={handleRefresh}
          onSaveAll={handleSaveAll}
        />

        <Card
          style={{
            borderRadius: screenSize.isMobile ? "8px" : "12px",
            boxShadow: screenSize.isMobile 
              ? "0 1px 4px rgba(0,0,0,0.08)" 
              : "0 2px 8px rgba(0,0,0,0.1)",
            marginTop: screenSize.isMobile ? "12px" : "16px",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            tabPosition={tabPosition}
            animated={{
              inkBar: true,
              tabPane: true,
            }}
            size={tabSize}
            style={{ 
              minHeight: screenSize.isMobile ? "400px" : "600px",
              transition: "all 0.3s ease-in-out",
            }}
            tabBarStyle={
              tabPosition === "left"
                ? {
                    marginRight: screenSize.isTablet ? "16px" : "24px",
                    borderRight: "1px solid #f0f0f0",
                    paddingRight: screenSize.isTablet ? "12px" : "16px",
                    minWidth: screenSize.isTablet ? "160px" : "200px",
                  }
                : {
                    marginBottom: screenSize.isMobile ? "16px" : "24px",
                    borderBottom: "1px solid #f0f0f0",
                  }
            }
          >
            {/* Profile Overview Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <UserOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  {screenSize.isMobile ? "Overview" : "Profile Overview"}
                </span>
              }
              key="overview"
            >
              <div 
                className="tab-content-wrapper"
                style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: screenSize.isMobile ? "12px" : screenSize.isTablet ? "16px" : "20px" 
                }}
              >
                <ProfileCompletionCard
                  completionPercentage={getProfileCompletion()}
                />
                
                <PersonalInformationCard
                  employeeData={employeeData}
                  loading={isUpdating}
                  onUpdate={handleProfileUpdate}
                />
                
                <EmploymentDetailsCard
                  employeeData={employeeData}
                />
              </div>
            </TabPane>

            {/* Personal Information Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <IdcardOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  {screenSize.isMobile ? "Personal" : "Personal Information"}
                </span>
              }
              key="personal"
            >
              <PersonalInformationCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
            </TabPane>

            {/* Employment Details Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <FileImageOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  {screenSize.isMobile ? "Employment" : "Employment Details"}
                </span>
              }
              key="employment"
            >
              <EmploymentDetailsCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
            </TabPane>

            {/* Skills & Languages Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <CodeOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  {screenSize.isMobile ? "Skills" : "Skills & Languages"}
                </span>
              }
              key="skills"
            >
              <SkillsLanguagesCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
            </TabPane>

            {/* Education Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <BookOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  Education
                </span>
              }
              key="education"
            >
              <EducationCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
            </TabPane>

            {/* Work Experience Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <FileTextOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  {screenSize.isMobile ? "Experience" : "Work Experience"}
                </span>
              }
              key="experience"
            >
              <WorkExperienceCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
            </TabPane>

            {/* Certificates Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <TrophyOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  Certificates
                </span>
              }
              key="certificates"
            >
              <DocumentsCertificatesCard
                employeeData={employeeData}
                onCertificatesChange={setCertificateFiles}
                onSave={async () => {
                  await handleProfileUpdate({ certificates: certificateFiles });
                  setCertificateFiles([]); // Clear after save
                  refetch(); // Refetch to get updated certificates
                }}
              />
            </TabPane>

            {/* Contact Information Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <ContactsOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  {screenSize.isMobile ? "Contact" : "Contact Information"}
                </span>
              }
              key="contact"
            >
              <ContactInformationCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
            </TabPane>

            {/* Address Information Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <HomeOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  {screenSize.isMobile ? "Address" : "Address Information"}
                </span>
              }
              key="address"
            >
              <AddressInformationCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
            </TabPane>

            {/* Security Tab */}
            <TabPane
              tab={
                <span style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: screenSize.isMobile ? "4px" : "8px",
                  fontSize: screenSize.isMobile ? "13px" : "14px"
                }}>
                  <SafetyCertificateOutlined style={{ fontSize: screenSize.isMobile ? "14px" : "16px" }} />
                  Security
                </span>
              }
              key="security"
            >
              <SecurityContent employeeData={employeeData} />
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeProfileSettings;
