import React, { useState } from "react";
import {
  Card,
  Typography,
  Tag,
  Button,
  Upload,
  message,
  Space,
  Select,
  Divider,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  useUploadStageDocumentsMutation,
  useSubmitWorkOrderDocumentsMutation,
  useEditDocumentMutation,
} from "../../Slices/Users/UserApis";

const { Title, Text } = Typography;

const SourcedDocumentsTab = ({
  sourcedJob,
  uploadedFiles,
  setUploadedFiles,
  selectedExistingFiles,
  setSelectedExistingFiles,
  editingDocuments,
  setEditingDocuments,
  editReplacements,
  setEditReplacements,
  refetch,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStageDocuments] = useUploadStageDocumentsMutation();
  const [submitWorkOrderDocuments] = useSubmitWorkOrderDocumentsMutation();
  const [editDocument] = useEditDocumentMutation();

  const { stageProgress } = sourcedJob;

  // Helper Functions
  const getStatusInfo = (status) => {
    switch (status) {
      case "completed":
        return { icon: <CheckCircleOutlined />, color: "green" };
      case "pending":
        return { icon: <ClockCircleOutlined />, color: "orange" };
      default:
        return { icon: <ClockCircleOutlined />, color: "blue" };
    }
  };

  const getDocumentName = (doc) => {
    if (typeof doc === "string") return doc;
    if (typeof doc === "object" && doc.title) return doc.title;
    return "Unknown Document";
  };

  const getDocumentId = (doc) => {
    if (typeof doc === "object" && doc._id) return doc._id;
    return null;
  };

  const isDocumentUploaded = (stageDocuments, requiredDocName) => {
    return stageDocuments?.some(
      (doc) =>
        doc.documentName === requiredDocName ||
        doc.documentName?.toLowerCase() === requiredDocName.toLowerCase() ||
        doc.fileName?.toLowerCase().includes(requiredDocName.toLowerCase())
    );
  };

  const getUploadedDocument = (stageDocuments, requiredDocName) => {
    return stageDocuments?.find(
      (doc) =>
        doc.documentName === requiredDocName ||
        doc.documentName?.toLowerCase() === requiredDocName.toLowerCase() ||
        doc.fileName?.toLowerCase().includes(requiredDocName.toLowerCase())
    );
  };

  const getPendingRequiredDocuments = (
    requiredDocs,
    uploadedDocs,
    additionalDocs = []
  ) => {
    // Do NOT include additional documents as they don't need to be uploaded
    return requiredDocs.filter((doc) => {
      const docName = typeof doc === "string" ? doc : getDocumentName(doc);
      return !isDocumentUploaded(uploadedDocs, docName);
    });
  };

  // File Management Functions
  const removeFile = (stageId, fileIndex) => {
    setUploadedFiles((prev) => {
      const updatedFiles = { ...prev };
      if (updatedFiles[stageId]) {
        updatedFiles[stageId] = updatedFiles[stageId].filter(
          (_, index) => index !== fileIndex
        );
        if (updatedFiles[stageId].length === 0) {
          delete updatedFiles[stageId];
        }
      }
      return updatedFiles;
    });
  };

  const handleSelectExistingFile = (stageId, certificate, documentType) => {
    // Add this check at the beginning
    if (!certificate) {
      message.error("Certificate not found");
      return;
    }

    setSelectedExistingFiles((prev) => ({
      ...prev,
      [stageId]: [
        ...(prev[stageId] || []),
        {
          fileName: certificate.fileName,
          fileUrl: certificate.fileUrl,
          documentName: documentType,
          _id: certificate._id,
        },
      ],
    }));
    message.success(
      `${certificate.fileName} selected from existing certificates`
    );
  };

  const removeExistingFile = (stageId, fileId) => {
    setSelectedExistingFiles((prev) => {
      const updatedFiles = { ...prev };
      if (updatedFiles[stageId]) {
        updatedFiles[stageId] = updatedFiles[stageId].filter(
          (file) => file._id !== fileId
        );
        if (updatedFiles[stageId].length === 0) {
          delete updatedFiles[stageId];
        }
      }
      return updatedFiles;
    });
  };

  const handleEditDocument = (stageId, docName, currentDoc) => {
    setEditingDocuments((prev) => ({
      ...prev,
      [stageId]: {
        ...(prev[stageId] || {}),
        [docName]: currentDoc,
      },
    }));
  };

  const handleReplaceDocument = (
    stageId,
    docName,
    newFile,
    isExisting = false,
    isEditing = false
  ) => {
    if (isEditing) {
      if (isExisting) {
        setEditReplacements((prev) => ({
          ...prev,
          [stageId]: {
            ...(prev[stageId] || {}),
            [docName]: {
              fileName: newFile.fileName,
              fileUrl: newFile.fileUrl,
              documentName: docName,
              _id: newFile._id,
              isExisting: true,
            },
          },
        }));
      } else {
        setEditReplacements((prev) => ({
          ...prev,
          [stageId]: {
            ...(prev[stageId] || {}),
            [docName]: {
              name: newFile.name,
              size: newFile.size,
              type: newFile.type,
              documentType: docName,
              lastModified: newFile.lastModified,
              preview: URL.createObjectURL(newFile),
              originFileObj: newFile,
              isExisting: false,
            },
          },
        }));
      }
    } else {
      if (isExisting) {
        setSelectedExistingFiles((prev) => ({
          ...prev,
          [stageId]: [
            ...(prev[stageId] || []).filter((f) => f.documentName !== docName),
            {
              fileName: newFile.fileName,
              fileUrl: newFile.fileUrl,
              documentName: docName,
              _id: newFile._id,
              isReplaced: true,
            },
          ],
        }));
        setUploadedFiles((prev) => ({
          ...prev,
          [stageId]: (prev[stageId] || []).filter(
            (f) => f.documentType !== docName
          ),
        }));
      } else {
        setUploadedFiles((prev) => ({
          ...prev,
          [stageId]: [
            ...(prev[stageId] || []).filter((f) => f.documentType !== docName),
            {
              name: newFile.name,
              size: newFile.size,
              type: newFile.type,
              documentType: docName,
              lastModified: newFile.lastModified,
              preview: URL.createObjectURL(newFile),
              originFileObj: newFile,
            },
          ],
        }));
        setSelectedExistingFiles((prev) => ({
          ...prev,
          [stageId]: (prev[stageId] || []).filter(
            (f) => f.documentName !== docName
          ),
        }));
      }
    }
    message.success(`Document replaced successfully`);
  };

  const handleCancelEdit = (stageId, docName) => {
    setEditingDocuments((prev) => {
      const updated = { ...prev };
      if (updated[stageId]) {
        delete updated[stageId][docName];
      }
      return updated;
    });
    setEditReplacements((prev) => {
      const updated = { ...prev };
      if (updated[stageId]) {
        delete updated[stageId][docName];
        if (Object.keys(updated[stageId]).length === 0) {
          delete updated[stageId];
        }
      }
      return updated;
    });
  };

  const clearAllPendingDocuments = (stageId) => {
    setUploadedFiles((prev) => ({ ...prev, [stageId]: [] }));
    setSelectedExistingFiles((prev) => ({ ...prev, [stageId]: [] }));
    setEditingDocuments((prev) => ({ ...prev, [stageId]: {} }));
    message.success("All pending documents cleared");
  };

  const handleFileUpload = (stageId, docType) => {
    return (info) => {
      const { file } = info;
      if (file.status === "done") {
        setUploadedFiles((prev) => ({
          ...prev,
          [stageId]: [
            ...(prev[stageId] || []),
            {
              name: file.name,
              size: file.size,
              type: file.type,
              documentType: docType,
              lastModified: file.lastModified,
              preview: URL.createObjectURL(file.originFileObj),
              originFileObj: file.originFileObj,
            },
          ],
        }));
        message.success(`${file.name} file uploaded successfully.`);
      }
    };
  };

  const uploadProps = (stageId, docType) => ({
    name: "file",
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("File must be smaller than 5MB!");
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    customRequest: ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess("ok");
      }, 1000);
    },
    onChange: handleFileUpload(stageId, docType),
  });

  const handleSubmitDocuments = async (stageId) => {
    const stageFiles = uploadedFiles[stageId] || [];
    const existingFiles = selectedExistingFiles[stageId] || [];
    const stage = sourcedJob.stageProgress.find((s) => s._id === stageId);

    if (stageFiles.length === 0 && existingFiles.length === 0) {
      message.warning("Please upload at least one document before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customFieldId: sourcedJob._id,
        stageId: stage.stageId,
      };

      if (stageFiles.length > 0) {
        payload.files = stageFiles.map((file) => file.originFileObj);
        payload.filesMetadata = stageFiles.map((file) => ({
          fileName: file.name,
          documentName: file.documentType,
          fileSize: file.size,
          fileType: file.type,
        }));
      } else {
        payload.files = [];
        payload.filesMetadata = [];
      }

      if (existingFiles.length > 0) {
        payload.existingFiles = existingFiles.map((file) => ({
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          documentName: file.documentName,
        }));
        payload.isReplaced = true;
      }

      const response = await uploadStageDocuments(payload).unwrap();
      message.success(response.message || "Documents submitted successfully!");

      setUploadedFiles((prev) => ({ ...prev, [stageId]: [] }));
      setSelectedExistingFiles((prev) => ({ ...prev, [stageId]: [] }));

      await refetch();
    } catch (error) {
      console.error("Failed to upload documents:", error);
      message.error(error?.data?.message || "Failed to submit documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWorkOrderDocuments = async () => {
    const woFiles = uploadedFiles["workOrder"] || [];
    const existingFiles = selectedExistingFiles["workOrder"] || [];

    if (woFiles.length === 0 && existingFiles.length === 0) {
      message.warning("Please upload at least one document before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { customFieldId: sourcedJob._id };

      if (woFiles.length > 0) {
        payload.files = woFiles.map((file) => file.originFileObj);
        payload.filesMetadata = woFiles.map((file) => ({
          fileName: file.name,
          documentName: file.documentType,
          fileSize: file.size,
          fileType: file.type,
        }));
      } else {
        payload.files = [];
        payload.filesMetadata = [];
      }

      if (existingFiles.length > 0) {
        payload.existingFiles = existingFiles.map((file) => ({
          fileName: file.fileName,
          fileUrl: file.fileUrl,
          documentName: file.documentName,
        }));
        payload.isReplaced = true;
      }

      const response = await submitWorkOrderDocuments(payload).unwrap();
      message.success(response.message || "Documents submitted successfully!");

      setUploadedFiles((prev) => ({ ...prev, workOrder: [] }));
      setSelectedExistingFiles((prev) => ({ ...prev, workOrder: [] }));

      await refetch();
    } catch (error) {
      console.error("Failed to upload work order documents:", error);
      message.error(error?.data?.message || "Failed to submit documents");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEditedDocument = async (
    stageId,
    docName,
    documentType = "stage"
  ) => {
    const replacement = editReplacements[stageId]?.[docName];

    if (!replacement) {
      message.warning("No replacement document selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customFieldId: sourcedJob._id,
        documentName: docName,
        documentType: documentType,
      };

      if (documentType === "stage") {
        const stage = sourcedJob.stageProgress.find((s) => s._id === stageId);
        payload.stageId = stage?.stageId;
      }

      if (replacement.isExisting) {
        payload.existingFile = {
          fileName: replacement.fileName,
          fileUrl: replacement.fileUrl,
          _id: replacement._id,
        };
      } else {
        payload.file = replacement.originFileObj;
        payload.fileName = replacement.name;
      }

      const response = await editDocument(payload).unwrap();
      message.success(response.message || "Document updated successfully!");

      setEditingDocuments((prev) => {
        const updated = { ...prev };
        if (updated[stageId]) {
          delete updated[stageId][docName];
        }
        return updated;
      });

      setEditReplacements((prev) => {
        const updated = { ...prev };
        if (updated[stageId]) {
          delete updated[stageId][docName];
          if (Object.keys(updated[stageId]).length === 0) {
            delete updated[stageId];
          }
        }
        return updated;
      });

      await refetch();
    } catch (error) {
      console.error("Failed to update document:", error);
      message.error(error?.data?.message || "Failed to update document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Work Order Documents Section - Similar structure to stage documents */}
      {sourcedJob.workOrder?.documents?.length > 0 && (
        <Card style={{ marginBottom: "16px" }}>
          <Title level={5} style={{ marginBottom: "16px" }}>
            <FileTextOutlined style={{ marginRight: "8px" }} />
            Work Order Required Documents
          </Title>

          <div style={{ marginBottom: "16px" }}>
            <Text type="secondary">
              Status:
              <Tag
                color={
                  sourcedJob.workOrderuploadedDocuments?.length ===
                  sourcedJob.workOrder.documents.length
                    ? "success"
                    : "warning"
                }
                style={{ marginLeft: "8px" }}
              >
                {sourcedJob.workOrderuploadedDocuments?.length || 0}/
                {sourcedJob.workOrder.documents.length} Uploaded
              </Tag>
            </Text>
          </div>

          {/* Required Documents Display */}
          <div style={{ marginBottom: "24px" }}>
            <Title level={3}>
              Required Documents ({sourcedJob.workOrder.documents.length})
            </Title>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "12px",
              }}
            >
              {sourcedJob.workOrder.documents.map((doc, docIndex) => {
                const isUploaded = isDocumentUploaded(
                  sourcedJob.workOrderuploadedDocuments,
                  doc.name
                );
                const isPending = uploadedFiles["workOrder"]?.some(
                  (pendingDoc) => pendingDoc.documentType === doc.name
                );
                const uploadedDoc = getUploadedDocument(
                  sourcedJob.workOrderuploadedDocuments,
                  doc.name
                );
                const isEditing = editingDocuments["workOrder"]?.[doc.name];

                return (
                  <div
                    key={doc._id || docIndex}
                    style={{
                      padding: "12px",
                      border: `2px solid ${
                        isEditing
                          ? "#1890ff"
                          : isUploaded
                          ? "#52c41a"
                          : isPending
                          ? "#faad14"
                          : "#d9d9d9"
                      }`,
                      borderRadius: "8px",
                      backgroundColor: isEditing
                        ? "#e6f7ff"
                        : isUploaded
                        ? "#f6ffed"
                        : isPending
                        ? "#fffbf0"
                        : "#fafafa",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <FileTextOutlined
                          style={{
                            color: isEditing
                              ? "#1890ff"
                              : isUploaded
                              ? "#52c41a"
                              : isPending
                              ? "#faad14"
                              : "#8c8c8c",
                            fontSize: "16px",
                          }}
                        />
                        <Text strong style={{ fontSize: "14px" }}>
                          {doc.name}
                        </Text>
                      </div>

                      <div style={{ display: "flex", gap: "8px" }}>
                        {isUploaded && uploadedDoc && !isEditing && (
                          <>
                            <Button
                              type="primary"
                              size="small"
                              ghost
                              onClick={() => {
                                if (uploadedDoc.fileUrl) {
                                  window.open(uploadedDoc.fileUrl, "_blank");
                                } else {
                                  message.info("File preview not available");
                                }
                              }}
                              style={{
                                borderColor: "#52c41a",
                                color: "#52c41a",
                              }}
                            >
                              View
                            </Button>
                            <Button
                              type="default"
                              size="small"
                              onClick={() =>
                                handleEditDocument(
                                  "workOrder",
                                  doc.name,
                                  uploadedDoc
                                )
                              }
                            >
                              Edit
                            </Button>
                          </>
                        )}
                        {isEditing && (
                          <>
                            <Button
                              type="primary"
                              size="small"
                              onClick={() =>
                                handleSubmitEditedDocument(
                                  "workOrder",
                                  doc.name,
                                  "workOrder"
                                )
                              }
                              loading={isSubmitting}
                            >
                              Save
                            </Button>
                            <Button
                              type="text"
                              size="small"
                              onClick={() =>
                                handleCancelEdit("workOrder", doc.name)
                              }
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {doc.description && (
                      <Text type="secondary" style={{ marginTop: "4px" }}>
                        {doc.description}
                      </Text>
                    )}

                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {isUploaded ? (
                        <Tag
                          color={isEditing ? "blue" : "success"}
                          size="small"
                          icon={<CheckCircleOutlined />}
                        >
                          {isEditing ? "Editing" : "Uploaded"}
                        </Tag>
                      ) : isPending ? (
                        <Tag
                          color="warning"
                          size="small"
                          icon={<ClockCircleOutlined />}
                        >
                          Pending Submit
                        </Tag>
                      ) : (
                        <Tag color="default" size="small">
                          Not Uploaded
                        </Tag>
                      )}
                    </div>

                    {isUploaded && uploadedDoc?.uploadedAt && (
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        {new Date(uploadedDoc.uploadedAt).toLocaleDateString()}
                      </Text>
                    )}

                    {isEditing && (
                      <Text
                        type="warning"
                        style={{
                          fontSize: "12px",
                          display: "block",
                          marginTop: "4px",
                        }}
                      >
                        Select replacement below
                      </Text>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Edit Section for Work Order */}
          {Object.keys(editingDocuments["workOrder"] || {}).length > 0 &&
            Object.keys(editingDocuments["workOrder"] || {}).map((docName) => {
              const currentDoc = editingDocuments["workOrder"][docName];
              return (
                <div
                  key={`edit-wo-${docName}`}
                  style={{
                    marginTop: "16px",
                    padding: "16px",
                    border: "2px solid #1890ff",
                    borderRadius: "8px",
                    backgroundColor: "#f0f5ff",
                  }}
                >
                  <Title
                    level={5}
                    style={{ color: "#1890ff", marginBottom: "16px" }}
                  >
                    Replace: {docName}
                  </Title>

                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "12px",
                      backgroundColor: "#fff",
                      borderRadius: "6px",
                      border: "1px solid #d9d9d9",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{ display: "block", marginBottom: "4px" }}
                    >
                      Current Document:
                    </Text>
                    <Text strong>{currentDoc.fileName || "Current file"}</Text>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <Text
                      strong
                      style={{ display: "block", marginBottom: "8px" }}
                    >
                      Upload New File:
                    </Text>
                    <Upload
                      name="file"
                      multiple={false}
                      showUploadList={false}
                      beforeUpload={(file) => {
                        const isLt5M = file.size / 1024 / 1024 < 5;
                        if (!isLt5M) {
                          message.error("File must be smaller than 5MB!");
                          return Upload.LIST_IGNORE;
                        }
                        handleReplaceDocument(
                          "workOrder",
                          docName,
                          file,
                          false,
                          true
                        );
                        return false;
                      }}
                    >
                      <Button icon={<UploadOutlined />} type="primary" ghost>
                        Choose New File
                      </Button>
                    </Upload>
                  </div>

                  {sourcedJob.certificates?.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                      <Text
                        strong
                        style={{ display: "block", marginBottom: "8px" }}
                      >
                        Or Select from Existing Certificates:
                      </Text>
                      <Select
                        style={{ width: "100%" }}
                        allowClear
                        placeholder="Select existing certificate"
                        value={
                          editReplacements["workOrder"]?.[docName]?.isExisting
                            ? editReplacements["workOrder"][docName]._id
                            : undefined
                        }
                        onClear={() => {
                          // Optional: Add any cleanup if needed
                        }}
                        onChange={(value) => {
                          const certificate = sourcedJob.certificates.find(
                            (cert) => cert._id === value
                          );
                          handleReplaceDocument(
                            "workOrder",
                            docName,
                            certificate,
                            true,
                            true
                          );
                        }}
                      >
                        {sourcedJob.certificates.map((cert) => (
                          <Select.Option key={cert._id} value={cert._id}>
                            {cert.fileName}
                          </Select.Option>
                        ))}
                      </Select>
                    </div>
                  )}

                  {editReplacements["workOrder"]?.[docName] && (
                    <div
                      style={{
                        marginTop: "8px",
                        marginBottom: "16px",
                        padding: "12px",
                        backgroundColor: "#e6f7ff",
                        borderRadius: "6px",
                        border: "1px solid #91d5ff",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: "#1890ff",
                          display: "block",
                          marginBottom: "4px",
                        }}
                      >
                        Replacement Selected:
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: "4px",
                        }}
                      >
                        <FileTextOutlined
                          style={{ marginRight: "8px", color: "#1890ff" }}
                        />
                        <Text style={{ flex: 1 }}>
                          {editReplacements["workOrder"][docName].isExisting
                            ? editReplacements["workOrder"][docName].fileName
                            : editReplacements["workOrder"][docName].name}
                        </Text>
                        <Tag
                          color={
                            editReplacements["workOrder"][docName].isExisting
                              ? "green"
                              : "blue"
                          }
                          style={{ marginLeft: "8px" }}
                        >
                          {editReplacements["workOrder"][docName].isExisting
                            ? "Existing File"
                            : "New Upload"}
                        </Tag>
                      </div>
                    </div>
                  )}

                  <Space>
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      onClick={() =>
                        handleSubmitEditedDocument(
                          "workOrder",
                          docName,
                          "workOrder"
                        )
                      }
                      loading={isSubmitting}
                      disabled={!editReplacements["workOrder"]?.[docName]}
                    >
                      Save Replacement
                    </Button>
                    <Button
                      onClick={() => handleCancelEdit("workOrder", docName)}
                    >
                      Cancel
                    </Button>
                  </Space>
                </div>
              );
            })}

          {/* Upload Section */}
          <Divider />
          <div>
            <Title level={3}>Upload Work Order Documents</Title>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {sourcedJob.workOrder.documents
                .filter(
                  (doc) =>
                    !isDocumentUploaded(
                      sourcedJob.workOrderuploadedDocuments,
                      doc.name
                    )
                )
                .map((doc, docIndex) => (
                  <div
                    key={`wo-${doc._id || docIndex}`}
                    style={{
                      border: "2px dashed #d9d9d9",
                      borderRadius: "12px",
                      padding: "20px",
                      textAlign: "center",
                      backgroundColor: "#fafafa",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  >
                    <Upload
                      {...uploadProps("workOrder", doc.name)}
                      style={{ width: "100%" }}
                    >
                      <div>
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            borderRadius: "50%",
                            backgroundColor: "#da2c46",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 12px",
                          }}
                        >
                          <UploadOutlined
                            style={{ fontSize: "20px", color: "white" }}
                          />
                        </div>
                        <Text
                          strong
                          style={{
                            display: "block",
                            marginBottom: "4px",
                            fontSize: "16px",
                          }}
                        >
                          {doc.name}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                          Click to upload or drag & drop
                        </Text>
                      </div>
                    </Upload>
                    {sourcedJob.certificates?.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <Text
                          type="secondary"
                          style={{ display: "block", marginBottom: "8px" }}
                        >
                          Or select from existing certificates:
                        </Text>
                        <Select
                          style={{ width: "100%" }}
                          allowClear
                          placeholder="Select existing certificate"
                          value={undefined}
                          onClear={() => {
                            // Optional: Add any cleanup if needed
                          }}
                          onChange={(value) => {
                            const certificate = sourcedJob.certificates.find(
                              (cert) => cert._id === value
                            );
                            handleSelectExistingFile(
                              "workOrder",
                              certificate,
                              doc.name
                            );
                          }}
                        >
                          {sourcedJob.certificates.map((cert) => (
                            <Select.Option key={cert._id} value={cert._id}>
                              {cert.fileName}
                            </Select.Option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Submit Button for Work Order */}
          {(uploadedFiles["workOrder"]?.length > 0 ||
            selectedExistingFiles["workOrder"]?.length > 0) && (
            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <Text strong style={{ fontSize: "16px" }}>
                  Ready to Submit:{" "}
                  {(uploadedFiles["workOrder"]?.length || 0) +
                    (selectedExistingFiles["workOrder"]?.length || 0)}{" "}
                  document(s)
                </Text>
              </div>
              <Space>
                <Button
                  type="primary"
                  size="large"
                  loading={isSubmitting}
                  onClick={handleSubmitWorkOrderDocuments}
                  style={{
                    backgroundColor: "#da2c46",
                    borderColor: "#da2c46",
                    minWidth: "140px",
                  }}
                  icon={!isSubmitting ? <CheckCircleOutlined /> : null}
                >
                  {isSubmitting ? "Submitting..." : "Submit Documents"}
                </Button>
                <Button
                  size="large"
                  onClick={() => clearAllPendingDocuments("workOrder")}
                >
                  Clear All (
                  {(uploadedFiles["workOrder"]?.length || 0) +
                    (selectedExistingFiles["workOrder"]?.length || 0)}
                  )
                </Button>
              </Space>
            </div>
          )}
        </Card>
      )}

      {/* Stage Documents Section */}
      {stageProgress?.map((stage, index) => {
        const fullStage = stage.fullStage || stage;
        const requiredDocs = fullStage.requiredDocuments || [];
        const additionalDocs = stage.additionalStageDocuments || [];
        const uploadedDocs = stage.uploadedDocuments || [];
        const pendingDocs = uploadedFiles[stage._id] || [];
        const pendingRequiredDocs = getPendingRequiredDocuments(
          requiredDocs,
          uploadedDocs,
          additionalDocs
        );
        const allRequiredDocsUploaded =
          requiredDocs.length > 0 && // UPDATE THIS LINE
          pendingRequiredDocs.length === 0;

        return (
          <Card key={stage._id || index} style={{ marginBottom: "16px" }}>
            <Title level={5} style={{ marginBottom: "16px" }}>
              <FileTextOutlined style={{ marginRight: "8px" }} />
              {stage.stageName} - Documents
            </Title>

            <div style={{ marginBottom: "16px" }}>
              <Text type="secondary">
                Stage Status:
                <Tag
                  color={getStatusInfo(stage.stageStatus).color}
                  style={{ marginLeft: "8px" }}
                >
                  {stage.stageStatus?.toUpperCase() || "PENDING"}
                </Tag>
              </Text>
              {requiredDocs.length > 0 && ( // UPDATE THIS CONDITION
                <div style={{ marginTop: "8px" }}>
                  <Text type="secondary">
                    Document Status:
                    <Tag
                      color={allRequiredDocsUploaded ? "success" : "warning"}
                      style={{ marginLeft: "8px" }}
                    >
                      {uploadedDocs.length}/{requiredDocs.length} Uploaded
                    </Tag>
                  </Text>
                </div>
              )}
            </div>

            {/* Required Documents Display */}
            {(requiredDocs.length > 0 || additionalDocs.length > 0) && (
              <div style={{ marginBottom: "24px" }}>
                <Title level={3}>Documents for this Stage</Title>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "12px",
                  }}
                >
                  {/* BASE REQUIRED DOCUMENTS - MUST UPLOAD */}
                  {requiredDocs.map((doc, docIndex) => {
                    const docName = getDocumentName(doc);
                    const docId = getDocumentId(doc);
                    const isUploaded = isDocumentUploaded(
                      uploadedDocs,
                      docName
                    );
                    const isPending = pendingDocs.some(
                      (pendingDoc) => pendingDoc.documentType === docName
                    );

                    return (
                      <div
                        key={docId || docIndex}
                        style={{
                          padding: "12px",
                          border: `2px solid ${
                            isUploaded
                              ? "#52c41a"
                              : isPending
                              ? "#faad14"
                              : "#d9d9d9"
                          }`,
                          borderRadius: "8px",
                          backgroundColor: isUploaded
                            ? "#f6ffed"
                            : isPending
                            ? "#fffbf0"
                            : "#fafafa",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <FileTextOutlined
                            style={{
                              color: isUploaded
                                ? "#52c41a"
                                : isPending
                                ? "#faad14"
                                : "#8c8c8c",
                              fontSize: "16px",
                            }}
                          />
                          <Text strong style={{ fontSize: "14px" }}>
                            {docName}
                          </Text>
                          <Tag color="blue" size="small">
                            Required
                          </Tag>
                        </div>
                        <div
                          style={{
                            marginTop: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {isUploaded ? (
                            <Tag
                              color="success"
                              size="small"
                              icon={<CheckCircleOutlined />}
                            >
                              Uploaded
                            </Tag>
                          ) : isPending ? (
                            <Tag
                              color="warning"
                              size="small"
                              icon={<ClockCircleOutlined />}
                            >
                              Pending Submit
                            </Tag>
                          ) : (
                            <Tag color="default" size="small">
                              Not Uploaded
                            </Tag>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* ADDITIONAL DOCUMENTS - VIEW ONLY, NO UPLOAD NEEDED */}
                  {additionalDocs.map((doc, docIndex) => {
                    const docName = doc.documentName;

                    return (
                      <div
                        key={`additional-${doc._id || docIndex}`}
                        style={{
                          padding: "12px",
                          border: "2px solid #52c41a",
                          borderRadius: "8px",
                          backgroundColor: "#f6ffed",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              flex: 1,
                            }}
                          >
                            <FileTextOutlined
                              style={{
                                color: "#52c41a",
                                fontSize: "16px",
                              }}
                            />
                            <Text strong style={{ fontSize: "14px" }}>
                              {docName}
                            </Text>
                            <Tag color="green" size="small">
                              Reference Only
                            </Tag>
                          </div>
                          {doc.fileUrl && (
                            <Button
                              type="primary"
                              size="small"
                              ghost
                              icon={<EyeOutlined />}
                              onClick={() => window.open(doc.fileUrl, "_blank")}
                              style={{
                                borderColor: "#52c41a",
                                color: "#52c41a",
                              }}
                            >
                              View
                            </Button>
                          )}
                        </div>
                        <div style={{ marginTop: "8px" }}>
                          <Tag
                            color="success"
                            size="small"
                            icon={<CheckCircleOutlined />}
                          >
                            Available for Reference
                          </Tag>
                        </div>
                        <Text
                          type="secondary"
                          style={{
                            fontSize: "12px",
                            display: "block",
                            marginTop: "4px",
                            fontStyle: "italic",
                          }}
                        >
                          ℹ️ This document is provided by the recruitment team
                          for your reference. No upload required.
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Uploaded Documents Section */}
            {uploadedDocs.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Title level={3}>
                    Uploaded Documents ({uploadedDocs.length})
                  </Title>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {uploadedDocs.map((doc, docIndex) => {
                    const isEditing =
                      editingDocuments[stage._id]?.[doc.documentName];

                    return (
                      <div
                        key={`uploaded-${docIndex}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "12px",
                          border: isEditing
                            ? "2px solid #1890ff"
                            : "1px solid #b7eb8f",
                          borderRadius: "6px",
                          backgroundColor: isEditing ? "#e6f7ff" : "#f6ffed",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            flex: 1,
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: isEditing
                                ? "#1890ff"
                                : "#52c41a",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FileTextOutlined
                              style={{ color: "white", fontSize: "14px" }}
                            />
                          </div>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ display: "block" }}>
                              {doc.fileName ||
                                doc.name ||
                                `Document ${docIndex + 1}`}
                            </Text>
                            {doc.documentName && (
                              <Tag
                                color={isEditing ? "blue" : "green"}
                                size="small"
                                style={{ marginTop: "4px" }}
                              >
                                {doc.documentName}
                              </Tag>
                            )}
                            {doc.uploadedAt && (
                              <Text
                                type="secondary"
                                style={{
                                  fontSize: "12px",
                                  display: "block",
                                  marginTop: "2px",
                                }}
                              >
                                Uploaded:{" "}
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </Text>
                            )}
                            {isEditing && (
                              <Text
                                type="warning"
                                style={{ fontSize: "12px", display: "block" }}
                              >
                                Select replacement below
                              </Text>
                            )}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {!isEditing ? (
                            <>
                              <Tag
                                color="success"
                                icon={<CheckCircleOutlined />}
                              >
                                Submitted
                              </Tag>
                              <Button
                                type="primary"
                                size="small"
                                ghost
                                onClick={() => {
                                  if (doc.fileUrl) {
                                    window.open(doc.fileUrl, "_blank");
                                  } else {
                                    message.info("File preview not available");
                                  }
                                }}
                              >
                                View
                              </Button>
                              {stage.stageStatus !== "approved" ? (
                                <Button
                                  type="default"
                                  size="small"
                                  onClick={() =>
                                    handleEditDocument(
                                      stage._id,
                                      doc.documentName,
                                      doc
                                    )
                                  }
                                >
                                  Edit
                                </Button>
                              ) : (
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: "12px",
                                    fontStyle: "italic",
                                  }}
                                >
                                  Cannot edit - Approved
                                </Text>
                              )}
                            </>
                          ) : (
                            <>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() =>
                                  handleSubmitEditedDocument(
                                    stage._id,
                                    doc.documentName,
                                    "stage"
                                  )
                                }
                                loading={isSubmitting}
                              >
                                Save
                              </Button>
                              <Button
                                type="text"
                                size="small"
                                onClick={() =>
                                  handleCancelEdit(stage._id, doc.documentName)
                                }
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Edit/Replace Section for Stage Documents */}
                {Object.keys(editingDocuments[stage._id] || {}).length > 0 &&
                  Object.keys(editingDocuments[stage._id] || {}).map(
                    (docName) => {
                      const currentDoc = editingDocuments[stage._id][docName];

                      return (
                        <div
                          key={`edit-${docName}`}
                          style={{
                            marginTop: "16px",
                            padding: "16px",
                            border: "2px solid #1890ff",
                            borderRadius: "8px",
                            backgroundColor: "#f0f5ff",
                          }}
                        >
                          <Title
                            level={5}
                            style={{ color: "#1890ff", marginBottom: "16px" }}
                          >
                            Replace: {docName}
                          </Title>

                          <div
                            style={{
                              marginBottom: "16px",
                              padding: "12px",
                              backgroundColor: "#fff",
                              borderRadius: "6px",
                              border: "1px solid #d9d9d9",
                            }}
                          >
                            <Text
                              type="secondary"
                              style={{ display: "block", marginBottom: "4px" }}
                            >
                              Current Document:
                            </Text>
                            <Text strong>
                              {currentDoc.fileName || "Current file"}
                            </Text>
                          </div>

                          <div style={{ marginBottom: "16px" }}>
                            <Text
                              strong
                              style={{ display: "block", marginBottom: "8px" }}
                            >
                              Upload New File:
                            </Text>
                            <Upload
                              name="file"
                              multiple={false}
                              showUploadList={false}
                              beforeUpload={(file) => {
                                const isLt5M = file.size / 1024 / 1024 < 5;
                                if (!isLt5M) {
                                  message.error(
                                    "File must be smaller than 5MB!"
                                  );
                                  return Upload.LIST_IGNORE;
                                }
                                handleReplaceDocument(
                                  stage._id,
                                  docName,
                                  file,
                                  false,
                                  true
                                );
                                return false;
                              }}
                            >
                              <Button
                                icon={<UploadOutlined />}
                                type="primary"
                                ghost
                              >
                                Choose New File
                              </Button>
                            </Upload>
                          </div>

                          {sourcedJob.certificates?.length > 0 && (
                            <div style={{ marginBottom: "16px" }}>
                              <Text
                                strong
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                }}
                              >
                                Or Select from Existing Certificates:
                              </Text>
                              <Select
                                style={{ width: "100%" }}
                                placeholder="Select existing certificate"
                                value={
                                  editReplacements[stage._id]?.[docName]
                                    ?.isExisting
                                    ? editReplacements[stage._id][docName]._id
                                    : undefined
                                }
                                onChange={(value) => {
                                  const certificate =
                                    sourcedJob.certificates.find(
                                      (cert) => cert._id === value
                                    );
                                  handleReplaceDocument(
                                    stage._id,
                                    docName,
                                    certificate,
                                    true,
                                    true
                                  );
                                }}
                              >
                                {sourcedJob.certificates.map((cert) => (
                                  <Select.Option
                                    key={cert._id}
                                    value={cert._id}
                                  >
                                    {cert.fileName}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                          )}

                          {editReplacements[stage._id]?.[docName] && (
                            <div
                              style={{
                                marginTop: "8px",
                                marginBottom: "16px",
                                padding: "12px",
                                backgroundColor: "#e6f7ff",
                                borderRadius: "6px",
                                border: "1px solid #91d5ff",
                              }}
                            >
                              <Text
                                strong
                                style={{
                                  color: "#1890ff",
                                  display: "block",
                                  marginBottom: "4px",
                                }}
                              >
                                Replacement Selected:
                              </Text>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  marginTop: "4px",
                                }}
                              >
                                <FileTextOutlined
                                  style={{
                                    marginRight: "8px",
                                    color: "#1890ff",
                                  }}
                                />
                                <Text style={{ flex: 1 }}>
                                  {editReplacements[stage._id][docName]
                                    .isExisting
                                    ? editReplacements[stage._id][docName]
                                        .fileName
                                    : editReplacements[stage._id][docName].name}
                                </Text>
                                <Tag
                                  color={
                                    editReplacements[stage._id][docName]
                                      .isExisting
                                      ? "green"
                                      : "blue"
                                  }
                                  style={{ marginLeft: "8px" }}
                                >
                                  {editReplacements[stage._id][docName]
                                    .isExisting
                                    ? "Existing File"
                                    : "New Upload"}
                                </Tag>
                              </div>
                            </div>
                          )}

                          <Space>
                            <Button
                              type="primary"
                              icon={<CheckCircleOutlined />}
                              onClick={() =>
                                handleSubmitEditedDocument(
                                  stage._id,
                                  docName,
                                  "stage"
                                )
                              }
                              loading={isSubmitting}
                              disabled={!editReplacements[stage._id]?.[docName]}
                            >
                              Save Replacement
                            </Button>
                            <Button
                              onClick={() =>
                                handleCancelEdit(stage._id, docName)
                              }
                            >
                              Cancel
                            </Button>
                          </Space>
                        </div>
                      );
                    }
                  )}
              </div>
            )}

            {/* Pending Documents Display */}
            {pendingDocs.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Title level={3}>
                    Pending Documents ({pendingDocs.length})
                  </Title>
                  <Button
                    type="text"
                    danger
                    size="small"
                    onClick={() => {
                      setUploadedFiles((prev) => ({
                        ...prev,
                        [stage._id]: [],
                      }));
                      message.success("All pending uploads cleared");
                    }}
                  >
                    Clear All Pending
                  </Button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {pendingDocs.map((file, fileIndex) => (
                    <div
                      key={`pending-${fileIndex}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        border: "1px solid #faad14",
                        borderRadius: "6px",
                        backgroundColor: "#fffbf0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#faad14",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FileTextOutlined
                            style={{ color: "white", fontSize: "14px" }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ display: "block" }}>
                            {file.name}
                          </Text>
                          {file.documentType && (
                            <Tag
                              color="orange"
                              size="small"
                              style={{ marginTop: "4px" }}
                            >
                              {file.documentType}
                            </Tag>
                          )}
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "12px",
                              display: "block",
                              marginTop: "2px",
                            }}
                          >
                            Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                          </Text>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          onClick={() => removeFile(stage._id, fileIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Existing Files Section */}
            {selectedExistingFiles[stage._id]?.length > 0 && (
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <Title level={3}>
                    Selected Existing Files (
                    {selectedExistingFiles[stage._id].length})
                  </Title>
                  <Button
                    type="text"
                    danger
                    size="small"
                    onClick={() => {
                      setSelectedExistingFiles((prev) => ({
                        ...prev,
                        [stage._id]: [],
                      }));
                      message.success("All selected files cleared");
                    }}
                  >
                    Clear All Selected
                  </Button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {selectedExistingFiles[stage._id].map((file, index) => (
                    <div
                      key={`existing-${index}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px",
                        border: "1px solid #52c41a",
                        borderRadius: "6px",
                        backgroundColor: "#f6ffed",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#52c41a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FileTextOutlined
                            style={{ color: "white", fontSize: "14px" }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <Text strong style={{ display: "block" }}>
                            {file.fileName}
                          </Text>
                          <Tag
                            color="green"
                            size="small"
                            style={{ marginTop: "4px" }}
                          >
                            {file.documentName} (Existing)
                          </Tag>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Button
                          type="primary"
                          size="small"
                          ghost
                          onClick={() => window.open(file.fileUrl, "_blank")}
                        >
                          View
                        </Button>
                        <Button
                          type="text"
                          size="small"
                          danger
                          onClick={() =>
                            removeExistingFile(stage._id, file._id)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Section for Missing Documents */}
            {pendingRequiredDocs.length > 0 && (
              <>
                <Divider />
                <div>
                  <Title level={3}>
                    Upload Missing Documents ({pendingRequiredDocs.length}{" "}
                    remaining)
                  </Title>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    {pendingRequiredDocs.map((doc, docIndex) => {
                      const docName = getDocumentName(doc);
                      const docId = getDocumentId(doc);

                      return (
                        <div
                          key={docId || docIndex}
                          style={{
                            border: "2px dashed #d9d9d9",
                            borderRadius: "12px",
                            padding: "20px",
                            textAlign: "center",
                            backgroundColor: "#fafafa",
                            cursor: "pointer",
                          }}
                        >
                          <Upload
                            {...uploadProps(stage._id, docName)}
                            style={{ width: "100%" }}
                          >
                            <div>
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  backgroundColor: "#da2c46",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  margin: "0 auto 12px",
                                }}
                              >
                                <UploadOutlined
                                  style={{ fontSize: "20px", color: "white" }}
                                />
                              </div>
                              <Text
                                strong
                                style={{
                                  display: "block",
                                  marginBottom: "4px",
                                  fontSize: "16px",
                                }}
                              >
                                {docName}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: "12px" }}
                              >
                                Click to upload or drag & drop
                              </Text>
                            </div>
                          </Upload>
                          {sourcedJob.certificates?.length > 0 && (
                            <div style={{ marginTop: "12px" }}>
                              <Text
                                type="secondary"
                                style={{
                                  display: "block",
                                  marginBottom: "8px",
                                }}
                              >
                                Or select from existing certificates:
                              </Text>
                              <Select
                                style={{ width: "100%" }}
                                allowClear
                                placeholder="Select existing certificate"
                                value={undefined}
                                onClear={() => {
                                  // Optional: Add any cleanup if needed
                                }}
                                onChange={(value) => {
                                  const certificate =
                                    sourcedJob.certificates.find(
                                      (cert) => cert._id === value
                                    );
                                  handleSelectExistingFile(
                                    stage._id,
                                    certificate,
                                    docName
                                  );
                                }}
                              >
                                {sourcedJob.certificates.map((cert) => (
                                  <Select.Option
                                    key={cert._id}
                                    value={cert._id}
                                  >
                                    {cert.fileName}
                                  </Select.Option>
                                ))}
                              </Select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Submit Button Section for Stage Documents */}
            {(pendingDocs.length > 0 ||
              selectedExistingFiles[stage._id]?.length > 0) && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "8px",
                }}
              >
                <div style={{ marginBottom: "12px" }}>
                  <Text strong style={{ fontSize: "16px" }}>
                    Ready to Submit:{" "}
                    {pendingDocs.length +
                      (selectedExistingFiles[stage._id]?.length || 0)}{" "}
                    document(s)
                  </Text>
                </div>
                <Space>
                  <Button
                    type="primary"
                    size="large"
                    loading={isSubmitting}
                    onClick={() => handleSubmitDocuments(stage._id)}
                    style={{
                      backgroundColor: "#da2c46",
                      borderColor: "#da2c46",
                      minWidth: "140px",
                    }}
                    icon={!isSubmitting ? <CheckCircleOutlined /> : null}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Documents"}
                  </Button>
                  <Button
                    size="large"
                    onClick={() => clearAllPendingDocuments(stage._id)}
                  >
                    Clear All (
                    {pendingDocs.length +
                      (selectedExistingFiles[stage._id]?.length || 0)}
                    )
                  </Button>
                </Space>
              </div>
            )}
          </Card>
        );
      })}

      {/* No Stages Message */}
      {!stageProgress?.length && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <FileTextOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
            <Title level={4} style={{ marginTop: "16px", color: "#999" }}>
              No stages available
            </Title>
            <Text type="secondary">
              Document upload will be available once the application progresses
              through stages.
            </Text>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SourcedDocumentsTab;
