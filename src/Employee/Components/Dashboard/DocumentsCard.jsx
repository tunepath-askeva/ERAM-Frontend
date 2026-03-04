import React from "react";
import { Card, Space, Typography, Progress, Badge, Empty, Spin, List } from "antd";
import { WarningOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Text } = Typography;

const DocumentsCard = ({ documentStatus, compliancePercentage, documentsLoading, screenSize }) => {
  const navigate = useNavigate();

  // Get documents expiring within 5 days (including expired) - limit to 3 to fit
  // If no documents expiring within 5 days, show latest 5 documents
  const documentsNearExpiry = React.useMemo(() => {
    if (!documentStatus.all || documentStatus.all.length === 0) return [];
    
    const now = dayjs();
    const startOfToday = now.startOf('day');
    
    // Filter documents expiring within 5 days (including expired)
    const expiringDocs = documentStatus.all
      .filter((doc) => {
        if (!doc.expiryDate) return false;
        const expiry = dayjs(doc.expiryDate).startOf('day');
        const daysUntilExpiry = expiry.diff(startOfToday, "days");
        // Show documents that are expired or expiring within 5 days
        return daysUntilExpiry <= 5;
      })
      .sort((a, b) => {
        const dateA = dayjs(a.expiryDate);
        const dateB = dayjs(b.expiryDate);
        return dateA - dateB;
      });
    
    // If there are documents expiring within 5 days, return them (limit to 3)
    if (expiringDocs.length > 0) {
      return expiringDocs.slice(0, 3);
    }
    
    // Otherwise, return latest 5 documents sorted by expiry date (most recent first)
    return documentStatus.all
      .filter((doc) => doc.expiryDate) // Only documents with expiry dates
      .sort((a, b) => {
        const dateA = dayjs(a.expiryDate);
        const dateB = dayjs(b.expiryDate);
        return dateB - dateA; // Sort descending (latest first)
      })
      .slice(0, 5);
  }, [documentStatus]);

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case "expired":
        return <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: screenSize.isMobile ? "14px" : "16px" }} />;
      case "nearing":
        return <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: screenSize.isMobile ? "14px" : "16px" }} />;
      case "fine":
        return <CheckCircleOutlined style={{ color: "#52c41a", fontSize: screenSize.isMobile ? "14px" : "16px" }} />;
      default:
        return null;
    }
  };

  const getDocumentStatusColor = (status) => {
    switch (status) {
      case "expired":
        return "#ff4d4f";
      case "nearing":
        return "#faad14";
      case "fine":
        return "#52c41a";
      default:
        return "#8c8c8c";
    }
  };

  // Calculate progress based on counts
  const totalDocs = documentStatus.stats.total;
  const expiredCount = documentStatus.stats.expired;
  const nearingCount = documentStatus.stats.nearing;
  const fineCount = documentStatus.stats.fine;

  // Single progress bar visualization component
  const DocumentStatusChart = () => {
    const totalDocs = documentStatus.stats.total || 0;

    // Determine progress bar color based on compliance
    const getProgressColor = () => {
      if (compliancePercentage >= 80) return "#52c41a"; // Green for good compliance
      if (compliancePercentage >= 50) return "#faad14"; // Orange for moderate
      return "#ff4d4f"; // Red for poor compliance
    };

    return (
      <div style={{ marginTop: "8px" }}>
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <Text
              style={{
                fontSize: screenSize.isMobile ? "11px" : "12px",
                fontWeight: 600,
                color: "#262626",
              }}
            >
              Document Compliance
            </Text>
            <Text
              style={{
                fontSize: screenSize.isMobile ? "11px" : "12px",
                fontWeight: 600,
                color: getProgressColor(),
              }}
            >
              {compliancePercentage}%
            </Text>
          </div>
          <Progress
            percent={compliancePercentage}
            strokeColor={getProgressColor()}
            trailColor="#f0f0f0"
            strokeWidth={screenSize.isMobile ? 8 : 10}
            showInfo={false}
          
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space size="small">
                <Text style={{ fontSize: screenSize.isMobile ? "9px" : "10px" }}>Expired</Text>
              </Space>
              <Text style={{ fontSize: screenSize.isMobile ? "9px" : "10px", fontWeight: 500 }}>
                {expiredCount}/{totalDocs}
              </Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space size="small">
                <Text style={{ fontSize: screenSize.isMobile ? "9px" : "10px" }}>Expiring</Text>
              </Space>
              <Text style={{ fontSize: screenSize.isMobile ? "9px" : "10px", fontWeight: 500 }}>
                {nearingCount}/{totalDocs}
              </Text>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Space size="small">
                <Text style={{ fontSize: screenSize.isMobile ? "9px" : "10px" }}>Fine</Text>
              </Space>
              <Text style={{ fontSize: screenSize.isMobile ? "9px" : "10px", fontWeight: 500 }}>
                {fineCount}/{totalDocs}
              </Text>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginLeft: "12px", alignItems: "flex-end" }}>
            <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: screenSize.isMobile ? "16px" : "18px" }} />
            <ExclamationCircleOutlined style={{ color: "#faad14", fontSize: screenSize.isMobile ? "16px" : "18px" }} />
            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: screenSize.isMobile ? "16px" : "18px" }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card
      title={
        <Space size="small">
          <WarningOutlined style={{ color: "#da2c46", fontSize: "14px" }} />
          <Text strong style={{ fontSize: screenSize.isMobile ? "11px" : "16px" }}>
            Expiring Documents
          </Text>
        </Space>
      }
      hoverable
      onClick={() => navigate("/employee/documents")}
      style={{
        cursor: "pointer",
        borderRadius: "8px",
        border: "1px solid #e8e8e8",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      bodyStyle={{
        padding: screenSize.isMobile ? "8px" : "10px",
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
      headStyle={{
        padding: screenSize.isMobile ? "8px 10px" : "10px 12px",
        minHeight: "auto",
      }}
      extra={
        (documentStatus.stats.expired > 0 || documentStatus.stats.nearing > 0) && (
          <Badge
            count={documentStatus.stats.expired + documentStatus.stats.nearing}
            size="small"
          />
        )
      }
    >
      {documentsLoading ? (
        <Spin size="small" />
      ) : documentsNearExpiry.length > 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <List
            size="small"
            dataSource={documentsNearExpiry}
            renderItem={(doc) => {
              const expiryDate = dayjs(doc.expiryDate).startOf('day');
              const now = dayjs().startOf('day');
              const daysUntilExpiry = expiryDate.diff(now, "days");
              // Expired: on expiry date or after (daysUntilExpiry <= 0)
              // Expiring: within 5 days before expiry (1 <= daysUntilExpiry <= 5)
              const isExpired = daysUntilExpiry <= 0;
              const isNearing = daysUntilExpiry > 0 && daysUntilExpiry <= 5;
              
              return (
                <List.Item
                  style={{
                    padding: "4px 0",
                    border: "none",
                    borderBottom: documentsNearExpiry.indexOf(doc) < documentsNearExpiry.length - 1
                      ? "1px solid #f0f0f0"
                      : "none",
                  }}
                >
                  <div style={{ display: "flex", width: "100%", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontSize: screenSize.isMobile ? "10px" : "11px",
                          display: "block",
                          marginBottom: "1px",
                          fontWeight: 500,
                        }}
                        ellipsis={{ tooltip: doc.documentName || doc.name || "Document" }}
                      >
                        {doc.documentName || doc.name || "Document"}
                      </Text>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: screenSize.isMobile ? "9px" : "10px",
                          display: "block",
                          color: getDocumentStatusColor(isExpired ? "expired" : isNearing ? "nearing" : "fine"),
                        }}
                      >
                        {isExpired 
                          ? `Expired ${Math.abs(daysUntilExpiry)}d ago - ${expiryDate.format("DD MMM YYYY")}`
                          : isNearing
                          ? `Expires in ${daysUntilExpiry}d - ${expiryDate.format("DD MMM YYYY")}`
                          : `Expires ${expiryDate.format("DD MMM YYYY")}`
                        }
                      </Text>
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                      {getDocumentStatusIcon(isExpired ? "expired" : isNearing ? "nearing" : "fine")}
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
          <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #f0f0f0" }}>
            <DocumentStatusChart />
          </div>
        </div>
      ) : documentStatus.stats.total > 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text
                type="secondary"
                style={{
                  fontSize: screenSize.isMobile ? "9px" : "10px",
                }}
              >
                No documents expiring within 5 days
              </Text>
            }
            imageStyle={{ height: 24 }}
          />
          <div style={{ marginTop: "8px" }}>
            <DocumentStatusChart />
          </div>
        </div>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text
              type="secondary"
              style={{
                fontSize: screenSize.isMobile ? "9px" : "10px",
              }}
            >
              No documents
            </Text>
          }
          imageStyle={{ height: 24 }}
        />
      )}
    </Card>
  );
};

export default DocumentsCard;