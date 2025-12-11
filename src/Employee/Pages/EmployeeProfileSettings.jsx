import React, { useState, useEffect } from "react";
import { Card, Tabs, message } from "antd";
import { 
  UserOutlined, 
  SafetyCertificateOutlined,
  IdcardOutlined,
  FileTextOutlined,
  TagOutlined
} from "@ant-design/icons";
import { useGetEmployeeProfileQuery } from "../../Slices/Employee/EmployeeApis";
import EmployeeProfileHeader from "../Components/EmployeeProfileHeader";
import PersonalInformationCard from "../Components/PersonalInformationCard";
import ProfileCompletionCard from "../Components/ProfileCompletetionCard";
import EmploymentDetailsCard from "../Components/EmploymentDetailsCard";
import SecurityContent from "../Components/SecurityContent";
import SkillsLanguagesCard from "../Components/SkillsLanguagesCard";
import DocumentsCertificatesCard from "../Components/DocumentsCertificatesCard";
import SkeletonLoader from "../../Global/SkeletonLoader";

const { TabPane } = Tabs;

const EmployeeProfileSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState(null);

  const { data, error, isLoading, refetch } = useGetEmployeeProfileQuery();

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
      
      // Employment Details
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
      
      // Arrays/Objects
      employeeData.skills?.length > 0 ? "skills" : null,
      employeeData.languages?.length > 0 ? "languages" : null,
      employeeData.education?.length > 0 ? "education" : null,
      employeeData.workExperience?.length > 0 ? "workExperience" : null,
      employeeData.certificates?.length > 0 ? "certificates" : null,
      
      // Profile
      employeeData.image,
      employeeData.profileSummary,
    ];

    const filledFields = requiredFields.filter(
      (field) =>
        field && (typeof field === "string" ? field.trim() !== "" : true)
    ).length;

    return Math.round((filledFields / requiredFields.length) * 100);
  };

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      // Here you would make your API call to update the profile
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEmployeeData((prevData) => ({
        ...prevData,
        ...values,
        employmentDetails: {
          ...prevData.employmentDetails,
          ...(values.employmentDetails || {})
        }
      }));

      message.success("Profile updated successfully!");
    } catch (error) {
      message.error("Failed to update profile");
    }
    setLoading(false);
  };

  const handleRefresh = () => {
    refetch();
    message.success("Profile data refreshed!");
  };

  const handleSaveAll = () => {
    // This would collect data from all forms and submit at once
    message.success("All changes saved successfully!");
  };

  if (isLoading) return <SkeletonLoader />;
  if (error) return <div>Error loading profile data</div>;
  if (!employeeData) return <div>No profile data available</div>;

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
                loading={loading}
                onUpdate={handleProfileUpdate}
              />
              <EmploymentDetailsCard
                employeeData={employeeData}
                loading={loading}
                onUpdate={handleProfileUpdate}
              />
              <SkillsLanguagesCard
                employeeData={employeeData}
                loading={loading}
                onUpdate={handleProfileUpdate}
              />
              <DocumentsCertificatesCard
                employeeData={employeeData}
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