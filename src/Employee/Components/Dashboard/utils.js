import dayjs from "dayjs";

/**
 * Calculate profile completion percentage
 */
export const calculateProfileCompletion = (employee) => {
  if (!employee) return 0;

  const requiredFields = [
    // Personal Info
    employee.firstName,
    employee.lastName,
    employee.email,
    employee.phone,
    employee.dateOfBirth,
    employee.age,
    employee.gender,
    employee.nationality,
    employee.countryOfBirth,
    
    // Employment Details
    employee.employmentDetails?.assignedJobTitle,
    employee.employmentDetails?.eramId,
    employee.employmentDetails?.officialEmail,
    employee.employmentDetails?.dateOfJoining,
    employee.employmentDetails?.category,
    employee.employmentDetails?.designation,
    employee.employmentDetails?.visaCategory,
    
    // Documents
    employee.passportNo,
    employee.iqamaNo,
    
    // Arrays/Objects - Check if arrays exist and have length
    employee.skills && employee.skills.length > 0 ? "skills" : null,
    employee.languages && employee.languages.length > 0 ? "languages" : null,
    employee.education && employee.education.length > 0 ? "education" : null,
    employee.workExperience && employee.workExperience.length > 0
      ? "workExperience"
      : null,
    employee.certificates && employee.certificates.length > 0
      ? "certificates"
      : null,
    
    // Profile
    employee.image,
    employee.profileSummary,
  ];

  const filledFields = requiredFields.filter(
    (field) => field !== null && field !== undefined && field !== ""
  );
  return Math.round((filledFields.length / requiredFields.length) * 100);
};

/**
 * Calculate document status from documents data
 */
export const calculateDocumentStatus = (documentsData) => {
  if (!documentsData?.documents) {
    return {
      all: [],
      expired: [],
      nearingExpiry: [],
      fine: [],
      stats: { total: 0, expired: 0, nearing: 0, fine: 0 },
    };
  }

  const allDocs = documentsData.documents.flatMap(
    (record) =>
      record.documents?.map((doc) => ({
        ...doc,
        workOrderId: record.workOrder?._id,
        workOrderTitle: record.workOrder?.title,
        recordId: record._id,
      })) || []
  );

  const now = dayjs().startOf('day');
  const fiveDaysFromNow = now.add(5, "days");

  const docsWithStatus = allDocs
    .filter((doc) => doc.expiryDate)
    .map((doc) => {
      const expiry = dayjs(doc.expiryDate).startOf('day');
      const daysUntilExpiry = expiry.diff(now, "days");

      let status = "fine";
      // Expired: on expiry date or after (daysUntilExpiry <= 0)
      if (daysUntilExpiry <= 0) {
        status = "expired";
      } 
      // Expiring: within 5 days before expiry (1 <= daysUntilExpiry <= 5)
      else if (daysUntilExpiry <= 5) {
        status = "nearing";
      }

      return { ...doc, status, daysUntilExpiry };
    });

  const expired = docsWithStatus.filter((doc) => doc.status === "expired");
  const nearingExpiry = docsWithStatus.filter((doc) => doc.status === "nearing");
  const fine = docsWithStatus.filter((doc) => doc.status === "fine");

  return {
    all: docsWithStatus,
    expired,
    nearingExpiry,
    fine,
    stats: {
      total: docsWithStatus.length,
      expired: expired.length,
      nearing: nearingExpiry.length,
      fine: fine.length,
    },
  };
};

/**
 * Calculate compliance percentage
 */
export const calculateCompliancePercentage = (documentStatus) => {
  if (documentStatus.stats.total === 0) return 100;
  return Math.round(
    ((documentStatus.stats.fine + documentStatus.stats.nearing) /
      documentStatus.stats.total) *
      100
  );
};

/**
 * Get request type name (handles both string and object types)
 */
export const getRequestTypeName = (type) => {
  if (typeof type === "string") {
    return type;
  }
  if (type && typeof type === "object") {
    return type.name || type.prefix || "Other Request";
  }
  return "Other Request";
};

/**
 * Get request status color
 */
export const getRequestStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "approved":
      return "green";
    case "pending":
      return "orange";
    case "rejected":
      return "red";
    case "in progress":
      return "blue";
    default:
      return "default";
  }
};

/**
 * Get available height for dashboard
 */
export const getAvailableHeight = (screenSize) => {
  const navbarHeight = screenSize.isMobile ? 56 : screenSize.isTablet ? 60 : 64;
  return `calc(100vh - ${navbarHeight}px)`;
};

/**
 * Filter and sort published news
 */
export const getPublishedNews = (newsData) => {
  return (
    newsData?.news
      ?.filter((n) => n.status === "published")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []
  );
};

/**
 * Get published news only (not events)
 */
export const getPublishedNewsOnly = (newsData) => {
  return (
    newsData?.news
      ?.filter((n) => n.status === "published" && n.type !== "event")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []
  );
};

/**
 * Get published events only
 */
export const getPublishedEvents = (newsData) => {
  return (
    newsData?.news
      ?.filter((n) => n.status === "published" && n.type === "event" && n.eventDate)
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)) || [] // Sort by event date ascending
  );
};

