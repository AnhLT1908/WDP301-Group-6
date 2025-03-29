import Axios from "axios";
import React, { useEffect, useState } from "react";

const LodgerContract = () => {
  const [error, setError] = useState(null);
  const [contracts, setContract] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const lodgerId = storedUser._id;
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const res = await Axios.get(
          `http://localhost:5000/api/v1/contract/lodger/${lodgerId}`
          //   `http://localhost:5000/api/v1/contract/lodger/67e44c6e5cc03e311a0442e4`
        );
        setContract(res.data.data);
      } catch (error) {
        setError(error.response.data.message);
      }
    };
    fetchContract();
  }, []);

  const handleVerifyContract = (id, verifyTwoSide) => {
    const newVerifyTwoSide =
      verifyTwoSide === "verified" ? "unverified" : "verified";
    Axios.patch(
      `http://localhost:5000/api/v1/contract/lodger/${id}`,
      {
        verifyTwoSide: newVerifyTwoSide,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        console.log("Contract verified successfully:", response.data);
        // Update local state to reflect the change
        setContract((prevContracts) =>
          prevContracts.map((contract) =>
            contract._id === id
              ? { ...contract, verifyTwoSide: "verified" }
              : contract
          )
        );
      })
      .catch((error) => {
        console.error("Error verifying contract:", error);
      });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const openConfirmModal = () => {
    setShowModal(true);
  };

  const closeConfirmModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Contract Details</h1>
      {error ? (
        <div className="text-red-600 font-semibold">{error}</div>
      ) : (
        contracts &&
        contracts.map((contract, index) => (
          <div
            key={contract._id || index}
            className="bg-white rounded-lg shadow-md overflow-hidden mb-6"
          >
            {/* Card Header */}
            <div className="border-b p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Contract for {contract.roomId?.name || "Unknown"}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    contract.status === "valid"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {contract.status}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                ID: {contract._id}
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Room Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Room Name:</span>{" "}
                      {contract.roomId?.name || "unknonwn"}
                    </p>
                    <p>
                      <span className="font-medium">Floor:</span>{" "}
                      {contract.roomId?.floor || "unknonwn"}
                    </p>
                    <p>
                      <span className="font-medium">Area:</span>{" "}
                      {contract.roomId?.area || "unknonwn"} m²
                    </p>
                    <p>
                      <span className="font-medium">Room Price:</span>{" "}
                      {contract.roomId?.priceList.roomPrice.toLocaleString() ||
                        "unknonwn"}{" "}
                      VND
                    </p>
                    <p>
                      <span className="font-medium">Deposit:</span>{" "}
                      {contract.roomId?.priceList.deposit.toLocaleString() ||
                        "unknonwn"}{" "}
                      VND
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Contract Period
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Start Date:</span>{" "}
                      {formatDate(contract.startDate)}
                    </p>
                    <p>
                      <span className="font-medium">End Date:</span>{" "}
                      {formatDate(contract.endDate)}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {contract.status}
                    </p>
                    <p>
                      <span className="font-medium">Verification Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-md text-xs font-medium ${
                          contract.verifyTwoSide === "verified"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {contract.verifyTwoSide}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Party A (Owner/Manager)
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {contract.benA?.name || "unknonwn"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {contract.benA?.email || "unknonwn"}
                    </p>
                    <p>
                      <span className="font-medium">Role:</span>{" "}
                      {contract.benA?.accountType || "unknonwn"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Party B (Lodger)
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {contract.benB.firstName} {contract.benB.lastName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {contract.benB.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {contract.benB.phone}
                    </p>
                  </div>
                </div>
              </div>

              {contract.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p>{contract.description}</p>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="border-t p-4">
              {contract.verifyTwoSide === "unverified" ? (
                <>
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                    onClick={openConfirmModal}
                  >
                    Verify Contract
                  </button>
                  {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Confirm Contract Verification
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Are you sure you want to verify this contract? This
                          action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                          <button
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
                            onClick={closeConfirmModal}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            onClick={() => {
                              handleVerifyContract(
                                contract._id,
                                contract.verifyTwoSide
                              );
                              closeConfirmModal();
                            }}
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Contract Verified
                </span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LodgerContract;
