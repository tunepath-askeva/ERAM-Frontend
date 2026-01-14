import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Spin,
  Alert,
  Button,
  Typography,
  Space,
  Avatar,
  Tag,
} from "antd";
import BranchHeader from "../Global/BranchHeader.jsx";
import BranchFooter from "../Global/BranchFooter.jsx";
import JobsSection from "./JobsSection.jsx";
import SkeletonLoader from "../Global/SkeletonLoader.jsx";
import { useBranch } from "../utils/useBranch.js";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

const BranchHome = () => {
  const navigate = useNavigate();
  const params = useParams();

  const { currentBranch, isLoading, error, domain } = useBranch();

  useEffect(() => {
    if (currentBranch) {
      console.log("Updating metadata for branch:", currentBranch);
      updateBranchMetadata(currentBranch);
    }
  }, [currentBranch]);

  const updateBranchMetadata = (branch) => {
    document.title = `${branch.name}`;

    if (branch.brand_logo) {
      updateFavicon(branch.brand_logo);
    }

    updateMetaTags(branch);

    console.log("Metadata updated for:", branch.name);
  };

  const updateFavicon = (logoUrl) => {
    const existingFavicons = document.querySelectorAll("link[rel*='icon']");
    existingFavicons.forEach((favicon) => favicon.remove());

    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = logoUrl;
    document.head.appendChild(link);

    const appleLink = document.createElement("link");
    appleLink.rel = "apple-touch-icon";
    appleLink.href = logoUrl;
    document.head.appendChild(appleLink);
  };

  const updateMetaTags = (branch) => {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.name = "description";
      document.head.appendChild(metaDescription);
    }
    metaDescription.content =
      branch.description ||
      `Welcome to ${branch.name} - Professional services in ${
        branch.location?.city || "your area"
      }`;

    const ogTags = [
      { property: "og:title", content: `${branch.name}` },
      {
        property: "og:description",
        content: branch.description || `${branch.name} services`,
      },
      { property: "og:image", content: branch.brand_logo },
      { property: "og:url", content: window.location.href },
    ];

    ogTags.forEach((tag) => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute("property", tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.content = tag.content || "";
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <BranchHeader />
        <div>
          <SkeletonLoader />
        </div>
        <BranchFooter />
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <BranchHeader />
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            padding: "50px 20px",
          }}
        >
          <Alert
            message="Error Loading Branch Data"
            description="There was an error loading the branch information. Please try again."
            type="error"
            showIcon
            action={
              <Button
                size="small"
                danger
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            }
          />
        </div>
        <BranchFooter />
      </Layout>
    );
  }

  // No branch found state
  if (!isLoading && !currentBranch) {
    return (
      <Layout>
        <BranchHeader />
        <Content
          style={{
            padding: "50px 20px",
            background: "linear-gradient(135deg, #da2c46 0%, #b91c3c 100%)",
          }}
        >
          <div
            style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
          >
            <Alert
              message="Branch Not Found"
              description={`No branch is configured for ${params.branchCode ? `branch code: ${params.branchCode}` : `domain: ${window.location.hostname}`}`}
              type="warning"
              showIcon
              action={
                <Button size="small" onClick={() => navigate("/branches")}>
                  View All Branches
                </Button>
              }
            />
          </div>
        </Content>
        <BranchFooter />
      </Layout>
    );
  }

  // Success state - render branch page
  return (
    <Layout>
      <BranchHeader currentBranch={currentBranch} />

      {/* Main Content */}
      <Content
        style={{
          backgroundColor: "#f8fafc",
          padding: "0",
        }}
      >
        <div>
          {/* Main Column - Jobs */}
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "40px 30px",
              borderLeft: "1px solid #e2e8f0",
              borderRight: "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <JobsSection
              currentBranch={currentBranch}
            />
          </div>
        </div>
      </Content>

      <BranchFooter currentBranch={currentBranch} />
    </Layout>
  );
};

export default BranchHome;
