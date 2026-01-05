import React, { useState, useEffect } from "react";
import { Card, Tabs, message, Upload, Result, Button } from "antd";
import {
  UserOutlined,
  SafetyCertificateOutlined,
  CameraOutlined,
  FrownOutlined,
  ReloadOutlined,
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
import SkeletonLoader from "../../Global/SkeletonLoader";
import EducationCard from "../Components/EducationCard";
import WorkExperienceCard from "../Components/WorkExperienceCard";
import { useSnackbar } from "notistack";

const { TabPane } = Tabs;

const EmployeeProfileSettings = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState("profile");
  const [employeeData, setEmployeeData] = useState(null);
  const [certificateFiles, setCertificateFiles] = useState([]);

  const { data, error, isLoading, refetch } = useGetEmployeeProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateEmployeeProfileMutation();

  useEffect(() => {
    if (data && data.employee) {
      setEmployeeData(data.employee);
    }
  }, [data]);

  const calculateProfileCompletion = () => {
    if (!employeeData) return 0;

    const requiredFields = [
      // Personal Info
      employeeData.firstName,
      employeeData.lastName,
      employeeData.email,
      employeeData.phone,
      employeeData.dob,
      employeeData.age,
      employeeData.gender,
      employeeData.nationality,
      employeeData.countryOfBirth,

      // Employment Details - FIX: Access nested properties correctly
      employeeData.employmentDetails?.assignedJobTitle,
      employeeData.employmentDetails?.eramId,
      employeeData.employmentDetails?.officialEmail,
      employeeData.employmentDetails?.dateOfJoining,
      employeeData.employmentDetails?.category,
      employeeData.employmentDetails?.designation,
      employeeData.employmentDetails?.visaCategory,

      // Documents
      employeeData.passportNo,
      employeeData.iqamaNo,

      // Arrays/Objects - FIX: Check if arrays exist and have length
      employeeData.skills && employeeData.skills.length > 0 ? "skills" : null,
      employeeData.languages && employeeData.languages.length > 0
        ? "languages"
        : null,
      employeeData.education && employeeData.education.length > 0
        ? "education"
        : null,
      employeeData.workExperience && employeeData.workExperience.length > 0
        ? "workExperience"
        : null,
      employeeData.certificates && employeeData.certificates.length > 0
        ? "certificates"
        : null,

      // Profile
      employeeData.image,
      employeeData.profileSummary,
    ];

    const filledFields = requiredFields.filter(
      (field) =>
        field !== null &&
        field !== undefined &&
        (typeof field === "string" ? field.trim() !== "" : true)
    ).length;

    return Math.round((filledFields / requiredFields.length) * 100);
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
        "dob",
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
        // For phoneCountryCode, always include it (default to "91" if not provided)
        if (field === "phoneCountryCode") {
          formData.append(field, value || "91");
        } else if (value !== undefined && value !== null && value !== "") {
          // Handle dates
          if (field === "dob" && value) {
            formData.append(
              field,
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
        ];

        employmentFields.forEach((field) => {
          const value = values.employmentDetails[field];
          if (value !== undefined && value !== null && value !== "") {
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

  return (
    <div style={{ padding: "24px", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <EmployeeProfileHeader
          onRefresh={handleRefresh}
          onSaveAll={handleSaveAll}
        />

        <Card
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            size="large"
          >
            <TabPane
              tab={
                <span>
                  <UserOutlined />
                  Profile
                </span>
              }
              key="profile"
            >
              <ProfileCompletionCard
                completionPercentage={calculateProfileCompletion()}
              />

              <PersonalInformationCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
              <EmploymentDetailsCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
              <SkillsLanguagesCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
              <EducationCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />

              {/* Work Experience Card */}
              <WorkExperienceCard
                employeeData={employeeData}
                loading={isUpdating}
                onUpdate={handleProfileUpdate}
              />
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
            <TabPane
              tab={
                <span>
                  <SafetyCertificateOutlined />
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
