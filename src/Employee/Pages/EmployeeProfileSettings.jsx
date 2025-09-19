import React, { useState, useEffect } from "react";
import { Card, Tabs, message } from "antd";
import { UserOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useGetEmployeeProfileQuery } from "../../Slices/Employee/EmployeeApis";
import EmployeeProfileHeader from "../Components/EmployeeProfileHeader";
import PersonalInformationCard from "../Components/PersonalInformationCard";
import ProfileCompletionCard from "../Components/ProfileCompletetionCard";
import EmploymentDetailsCard from "../Components/EmploymentDetailsCard";
import SecurityContent from "../Components/SecurityContent";
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
      employeeData.firstName,
      employeeData.lastName,
      employeeData.email,
      employeeData.phone,
      employeeData.employmentDetails?.assignedJobTitle || employeeData.title,
      employeeData.employmentDetails?.eramId || employeeData.eramId,
      employeeData.nationality,
      employeeData.image,
      employeeData.fullName,
      employeeData.middleName,
      employeeData.location,
      employeeData.city,
      employeeData.country,
      employeeData.maritalStatus,
      employeeData.bloodGroup,
      employeeData.gender,
      employeeData.age,
      employeeData.passportNo,
      employeeData.skills?.length > 0 ? "skills" : null,
      employeeData.education?.length > 0 ? "education" : null,
      employeeData.workExperience?.length > 0 ? "workExperience" : null,
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
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setEmployeeData((prevData) => ({
        ...prevData,
        ...values,
        employmentDetails: {
          ...prevData.employmentDetails,
          ...Object.keys(values).reduce((acc, key) => {
            if (
              [
                "officialEmail",
                "badgeNo",
                "gatePassId",
                "aramcoId",
                "otherId",
                "plantId",
              ].includes(key)
            ) {
              acc[key] = values[key];
            }
            return acc;
          }, {}),
        },
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
