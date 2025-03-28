import React, { useState, useEffect } from "react";
import axios from "axios";

const BillEvidenceUpload = ({ billId, isPaid, onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [existingEvidence, setExistingEvidence] = useState(null);

  // Fetch existing evidence on component mount
  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/bill/evidence/${billId}`
        );

        if (response.data.success && response.data.data.billEvidence) {
          setExistingEvidence(response.data.data.billEvidence);
        }
      } catch (error) {
        console.error("Error fetching bill evidence:", error);
      }
    };

    if (billId) {
      fetchEvidence();
    }
  }, [billId]);

  console.log("Evidence image", existingEvidence);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Reset states
    setError(null);

    if (!selectedFile) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!validTypes.includes(selectedFile.type)) {
      setError(
        "Invalid file type. Please select an image (JPEG, PNG, JPG, GIF)."
      );
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Validate file size (5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit. Please select a smaller file.");
      setFile(null);
      setPreviewUrl(null);
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setFile(selectedFile);
    setPreviewUrl(objectUrl);

    // Clean up preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("billEvidence", file);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/bill/evidence/${billId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setExistingEvidence(response.data.data.billEvidence);
        setFile(null);
        setPreviewUrl(null);

        // Call callback if provided
        if (onUploadSuccess && typeof onUploadSuccess === "function") {
          onUploadSuccess(response.data.data);
        }
      }
    } catch (error) {
      console.error("Error uploading evidence:", error);
      setError(
        error.response?.data?.message ||
          "Failed to upload file. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resolveImagePath = (path) => {
    if (!path) return "";

    // For debugging
    console.log("Attempting to resolve path:", path);

    // Direct access if it's an absolute URL
    if (path.startsWith("http")) return path;

    // Handle relative paths from backend
    // This approach works if the backend is configured to serve static files
    return `http://localhost:5000/${path.replace(/^\/+/, "")}`;

    // Alternative: If images are served from your React public folder
    // return `${process.env.PUBLIC_URL}/${path.replace(/^\/+/, '')}`;
  };

  useEffect(() => {
    if (existingEvidence) {
      console.log("Resolved image path:", resolveImagePath(existingEvidence));
    }
  }, [existingEvidence]);

  // Handle evidence deletion
  const handleDelete = async () => {
    if (!existingEvidence) return;

    if (!window.confirm("Bạn có chắc là muốn thu hồi ảnh không?")) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.delete(
        `http://localhost:5000/api/v1/bill/evidence/${billId}`
      );

      if (response.data.success) {
        setExistingEvidence(null);
      }
    } catch (error) {
      console.error("Error deleting evidence:", error);
      setError(
        error.response?.data?.message ||
          "Failed to delete file. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-4">
      <h2 className="text-xl font-bold mb-4">Bằng chứng thanh toán</h2>

      {/* Display existing evidence if available */}
      {existingEvidence && (
        <div className="mb-4">
          <div className="relative">
            <img
              src={resolveImagePath(existingEvidence)}
              alt="Bill Evidence"
              className="w-full max-h-64 object-contain rounded-md mb-2"
            />
            {!isPaid && (
              <button
                onClick={handleDelete}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-md hover:bg-red-700 transition duration-200"
                title="Delete Evidence"
              >
                Thu hồi và thay đổi ảnh
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload form */}
      {!existingEvidence && (
        <div className="flex flex-col">
          <div className="mb-4">
            <label
              htmlFor="bill_evidence"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tải lên ảnh hóa đơn đã thanh toán:
            </label>

            {/* File preview */}
            {previewUrl && (
              <div className="mb-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded-md border border-gray-300"
                />
              </div>
            )}

            {/* File input */}
            <div className="flex items-center">
              <input
                type="file"
                id="bill_evidence"
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/gif,image/jpg"
                className="text-sm text-gray-700 bg-gray-100 rounded-lg w-full p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Error message */}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className={`self-start px-4 py-2 rounded-md ${
              loading || !file
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-700"
            } text-white transition duration-200`}
          >
            {loading ? "Đang tải lên..." : "Tải ảnh"}
          </button>
        </div>
      )}

      {/* Note for paid bills */}
      {isPaid && !existingEvidence && (
        <p className="mt-4 text-sm text-green-600">
          Hóa đơn này đã được đánh dấu là đã thanh toán. Tải lên bằng chứng
          thanh toán để lưu trữ.
        </p>
      )}
    </div>
  );
};

export default BillEvidenceUpload;
