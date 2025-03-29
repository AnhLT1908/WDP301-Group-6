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

  console.log("contracts", contracts);

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
    const date = new Date(dateString);
    return (
      `${date.getDate().toString().padStart(2, "0")}/` +
      `${date.getMonth().toString().padStart(2, "0")}/` +
      `${date.getFullYear()}`
    );
  };
  const openConfirmModal = () => {
    setShowModal(true);
  };

  const closeConfirmModal = () => {
    setShowModal(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Chi Tiết Hợp Đồng</h1>
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
                  Hợp Đồng Phòng {contract.roomId?.name || "Unknown"}
                </h2>
                <span
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    contract.status === "valid"
                      ? "bg-green-300 text-green-800"
                      : "bg-gray-300 text-gray-800"
                  }`}
                >
                  {contract.status === "valid"
                    ? "Còn Hiệu Lực"
                    : "Hết Hiệu Lực"}
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Thông tin phòng:
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Tên Phòng:</span>{" "}
                      {contract.roomId?.name || "unknonwn"}
                    </p>
                    <p>
                      <span className="font-medium">Tầng:</span>{" "}
                      {contract.roomId?.floor || "unknonwn"}
                    </p>
                    <p>
                      <span className="font-medium">Diện Tích:</span>{" "}
                      {contract.roomId?.area || "unknonwn"} m²
                    </p>
                    <p>
                      <span className="font-medium">Giá Phòng:</span>{" "}
                      {contract.roomId?.priceList.roomPrice.toLocaleString() ||
                        "unknonwn"}{" "}
                      VND
                    </p>
                    <p>
                      <span className="font-medium">Tiền Cọc:</span>{" "}
                      {contract.roomId?.priceList.deposit.toLocaleString() ||
                        "Không có tiền cọc"}{" "}
                      VND
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Thời Gian Hiệu Lực
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Từ Ngày:</span>{" "}
                      {formatDate(contract.startDate)}
                    </p>
                    <p>
                      <span className="font-medium">Đến Ngày:</span>{" "}
                      {formatDate(contract.endDate)}
                    </p>
                    <p>
                      <span className="font-medium">Trạng Thái Xác Nhận:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-md text-xs font-medium ${
                          contract.verifyTwoSide === "verified"
                            ? "bg-green-200 text-green-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {contract.verifyTwoSide === "verified"
                          ? "Đã xác nhận"
                          : "Chưa xác nhận"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Bên A (Quản Lý Nhà Trọ)
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Họ và Tên:</span>{" "}
                      {contract.benA?.lastName +
                        " " +
                        contract.benA?.firstName || "unknonwn"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {contract.benA?.email || "unknonwn"}
                    </p>
                    <p>
                      <span className="font-medium">Số Điện Thoại:</span>{" "}
                      {contract.benA?.phone || "unknonwn"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Bên B (Người Đại Diện Thuê Phòng)
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Họ và Tên:</span>{" "}
                      {contract.benB.lastName} {contract.benB.firstName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {contract.benB.email}
                    </p>
                    <p>
                      <span className="font-medium">Số Điện Thoại:</span>{" "}
                      {contract.benB.phone}
                    </p>
                  </div>
                </div>
              </div>

              {contract.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Điều Khoản Hợp Đồng:</h3>
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
                    Xác Nhận Hợp Đồng
                  </button>
                  {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Xác Nhận Hợp Đồng
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Bạn có chắc chắn muốn xác nhận hợp đồng này không? Sau khi đã xác nhận sẽ không thể thay đổi trạng thái.
                        </p>
                        <div className="flex justify-end space-x-3">
                          <button
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 transition-colors"
                            onClick={closeConfirmModal}
                          >
                            Hủy
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
                            Xác Nhận
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <span className="px-3 py-1 bg-green-300 text-green-800 rounded-md  text-sm font-medium">
                  Hợp Đồng Đã Được Xác Nhận
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
