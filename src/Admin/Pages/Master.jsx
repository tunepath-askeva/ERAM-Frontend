import React, { useState } from "react";
import { Tabs, Card } from "antd";
import ProjectManagement from "../Components/ProjectManagement";
import ClientsManagement from "../Components/ClientManagement";
import StaffManagement from "../Components/StaffManagement";

const { TabPane } = Tabs;

const Master = () => {
  const [activeTab, setActiveTab] = useState("projects");

  const tabStyle = {
    color: "#da2c46",
    borderColor: "#da2c46",
  };

  return (
    <div
      style={{
        padding: "16px",
        "@media (max-width: 768px)": {
          padding: "8px",
        },
      }}
    >
     
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarStyle={{
            marginBottom: 24,
            "@media (max-width: 576px)": {
              marginBottom: 16,
            },
          }}
          tabBarGutter={32}
          centered
          type="line"
        >
          <TabPane
            tab={
              <span
                style={{
                  color: activeTab === "projects" ? "#da2c46" : "inherit",
                  fontWeight: activeTab === "projects" ? 600 : "normal",
                  padding: "8px 16px",
                  "@media (max-width: 576px)": {
                    padding: "8px",
                    fontSize: "14px",
                  },
                }}
              >
                Projects
              </span>
            }
            key="projects"
          >
            <ProjectManagement />
          </TabPane>
          <TabPane
            tab={
              <span
                style={{
                  color: activeTab === "clients" ? "#da2c46" : "inherit",
                  fontWeight: activeTab === "clients" ? 600 : "normal",
                  padding: "8px 16px",
                  "@media (max-width: 576px)": {
                    padding: "8px",
                    fontSize: "14px",
                  },
                }}
              >
                Clients
              </span>
            }
            key="clients"
          >
            <ClientsManagement />
          </TabPane>
          <TabPane
            tab={
              <span
                style={{
                  color: activeTab === "staff" ? "#da2c46" : "inherit",
                  fontWeight: activeTab === "staff" ? 600 : "normal",
                  padding: "8px 16px",
                  "@media (max-width: 576px)": {
                    padding: "8px",
                    fontSize: "14px",
                  },
                }}
              >
                Staff
              </span>
            }
            key="staff"
          >
            <StaffManagement />
          </TabPane>
        </Tabs>
     
    </div>
  );
};

export default Master;
