import React, { useState } from "react";
import { message, Upload, Button, Table, Card, Spin, Divider } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import { useUploadPayrollFileMutation } from "../../Slices/Employee/EmployeeApis";

const { Dragger } = Upload;

const EmployeeAdminPolicy = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  // RTK Query hooks
  const [
    uploadFile,
    {
      isLoading: isUploading,
      isSuccess: uploadSuccess,
      isError: uploadError,
      error: uploadErrorData,
      data: uploadResult,
    },
  ] = useUploadPayrollFileMutation();

  // Handle file upload with validation
  const handleFileUpload = async (file) => {
    setSelectedFile(file);

    try {
      // Upload the file
      const result = await uploadFile(file).unwrap();

      message.success(`File uploaded successfully! ${result.message || ""}`);

      // Refresh the upload history
      refetchHistory();
    } catch (error) {
      console.error("Upload failed:", error);

      if (error.status === 400) {
        message.error(error.data?.message || "Invalid file format");
        if (error.data?.errors) {
          error.data.errors.forEach((err) => message.error(err));
        }
      } else if (error.status === 413) {
        message.error("File too large");
      } else if (error.status === 500) {
        message.error("Server error. Please try again later.");
      } else {
        message.error("Upload failed. Please check your connection.");
      }
    }

    return false; // Prevent default upload behavior
  };

  // Upload component props
  const uploadProps = {
    name: "payrollFile",
    multiple: false,
    accept: ".xlsx,.xls,.csv",
    beforeUpload: handleFileUpload,
    showUploadList: false,
    disabled: isUploading,
  };

  // Columns for upload history table
  const historyColumns = [
    {
      title: "File Name",
      dataIndex: "fileName",
      key: "fileName",
    },
    {
      title: "Upload Date",
      dataIndex: "uploadDate",
      key: "uploadDate",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        if (status === "completed") color = "green";
        if (status === "failed") color = "red";
        return <span style={{ color }}>{status}</span>;
      },
    },
    {
      title: "Records",
      dataIndex: "recordsProcessed",
      key: "recordsProcessed",
    },
    {
      title: "File Size",
      dataIndex: "fileSize",
      key: "fileSize",
      render: (size) => `${(size / (1024 * 1024)).toFixed(2)} MB`,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card title="Upload Payroll File" style={{ marginBottom: "24px" }}>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag payroll file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Supported formats: .xlsx, .xls, .csv. Max file size: 10MB
          </p>
          {selectedFile && (
            <p>
              Selected file: <strong>{selectedFile.name}</strong> (
              {selectedFile.size} bytes)
            </p>
          )}
        </Dragger>

        <div style={{ marginTop: "16px", textAlign: "right" }}>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={isUploading}
            onClick={() => selectedFile && handleFileUpload(selectedFile)}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Uploading..." : "Start Upload"}
          </Button>
        </div>
      </Card>

      <Divider />

      {/* Upload status messages */}
      {uploadSuccess && (
        <div style={{ marginTop: "16px" }}>
          <p>Upload successful!</p>
          {uploadResult && <pre>{JSON.stringify(uploadResult, null, 2)}</pre>}
        </div>
      )}

      {uploadError && (
        <div style={{ marginTop: "16px", color: "red" }}>
          <p>Upload failed!</p>
          {uploadErrorData && (
            <pre>{JSON.stringify(uploadErrorData, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeAdminPolicy;
