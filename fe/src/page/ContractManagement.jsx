import Axios from "axios";
import React, { useEffect, useState } from "react";

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [listLodger, setListLodger] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [formData, setFormData] = useState({
    description: "",
    roomId: "",
    benB: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
      .toISOString()
      .split("T")[0],
  });

  const data = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  const parsedData = data ? JSON.parse(data) : null;
  const managerId = parsedData?._id;

  useEffect(() => {
    const fetchLogder = async () => {
      try {
        if (!managerId) throw new Error("Manager ID is undefined");
        const res = await Axios.get(
          `http://localhost:5000/api/v1/account/lodger-account-list`
        );
        setListLodger(res.data.data);
      } catch (error) {
        console.error("Fetch error:", error);
        setListLodger([]);
      }
    };
    const fetchContract = async () => {
      try {
        if (!managerId) throw new Error("Manager ID is undefined");
        const res = await Axios.get(
          `http://localhost:5000/api/v1/contract/manager/${managerId}`
        );
        setContracts(res.data.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
        setContracts([]);
      }
    };
    const fetchRoom = async () => {
      try {
        const res = await Axios.get(
          `http://localhost:5000/api/v1/room/house/manager/${managerId}`
        );
        setRooms(res.data.rooms);
      } catch (error) {
        console.error("Fetch error:", error);
        setRooms([]);
      }
    };
    fetchContract();
    fetchLogder();
    fetchRoom();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      `${date.getDate().toString().padStart(2, "0")}/` +
      `${(date.getMonth() + 1).toString().padStart(2, "0")}/` +
      `${date.getFullYear()}`
    );
  };

  const openModal = (contractId = null) => {
    if (contractId) {
      const contract = contracts.find((c) => c._id === contractId);
      console.log(contract);
      if (contract) {
        setFormData({
          description: contract.description || "",
          roomId: contract.roomId?.name || "",
          benA: contract.benA?.name || "",
          benB: contract.benB?.name || "",
          status: contract.status || "valid",
          verifyTwoSide: contract.verifyTwoSide || "unverified",
          startDate: contract.startDate.split("T")[0] || "",
          endDate: contract.endDate.split("T")[0] || "",
        });
        setIsEditMode(true);
        setSelectedContract(contractId);
      }
    } else {
      setFormData({
        description: "",
        roomId: "",
        benA: "",
        benB: "",
        status: "valid",
        verifyTwoSide: "unverified",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
          .toISOString()
          .split("T")[0],
      });
      setIsEditMode(false);
      setSelectedContract(null);
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const newContractData = {
      _id: isEditMode ? selectedContract : `new-${Date.now()}`,
      description: formData.description,
      roomId: formData.roomId || null,
      benA: formData.benA || null,
      benB: formData.benB || null,
      status: formData.status,
      verifyTwoSide: formData.verifyTwoSide,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      createdAt: isEditMode
        ? contracts.find((c) => c._id === selectedContract)?.createdAt
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditMode) {
      try {
        // Define the data to be sent to the API based on your backend requirements
        const contractData = {
          description: formData.description,
          status: formData.status,
          verifyTwoSide: formData.verifyTwoSide,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };

        // Make the API call
        const response = await Axios.patch(
          `http://localhost:5000/api/v1/contract/${selectedContract}`,
          contractData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();

        // Check if the update was successful
        if (result.success) {
          // Update the local state with the data returned from the API
          const updatedContracts = contracts.map((c) =>
            c._id === selectedContract ? result.data : c
          );
          setContracts(updatedContracts);
        }
      } catch (error) {
        console.error("Error updating contract:", error);
      } finally {
        setIsEditMode(false);
      }

      const updatedContracts = contracts.map((c) =>
        c._id === selectedContract ? newContractData : c
      );
      setContracts(updatedContracts);
    } else {
      try {
        const res = await Axios.post(
          "http://localhost:5000/api/v1/contract/room",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setContracts([...contracts, newContractData]);

        alert(res.data.message);
      } catch (error) {
        alert(error.response.data.message);
      }
    }
    setShowModal(false);
  };

  const handleDeleteContract = async (contractId) => {
    if (window.confirm("Bạn có chắc muốn xóa hợp đồng không?")) {
      const updatedContracts = contracts.filter((c) => c._id !== contractId);
      setContracts(updatedContracts);
      try {
        await Axios.delete(
          `http://localhost:5000/api/v1/contract/${contractId}`
        ).then((res) => {
          alert(res.data.message);
        });
      } catch (error) {
        alert(error.response.data.message);
      }

      setShowModal(false);
    }
  };

  return (
    <div className="p-5 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Quản Lý Hợp Đồng</h1>
        <button
          onClick={() => openModal()}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-md transition-colors"
        >
          Tạo Hợp Đồng Mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contracts.map((contract) => (
          <div
            key={contract._id}
            className="bg-white rounded-lg shadow-md p-4 flex justify-between items-start"
          >
            <div
              className="cursor-pointer flex-1"
              onClick={() => openModal(contract._id)}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Hợp Đồng Phòng {contract.roomId.name}
              </h3>
              <p className="text-gray-600">
                Điều Khoản: {contract.description}{" "}
              </p>
              <p className="text-gray-600">
                Trạng Thái:{" "}
                {contract.status === "valid" ? "Còn Hiệu Lực" : "Hết Hiệu Lực"}
              </p>
              <p className="text-gray-600">
                Hiệu Lực Từ Ngày: {formatDate(contract.startDate)}
              </p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs mt-2 ${
                  contract.verifyTwoSide === "verified"
                    ? "bg-green-100 text-green-800"
                    : "bg-orange-100 text-orange-800"
                }`}
              >
                {contract.verifyTwoSide === "verified"
                  ? "Đã Xác Nhận"
                  : "Chưa Xác Nhận"}
              </span>
            </div>
            <button
              onClick={() => handleDeleteContract(contract._id)}
              className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md ml-2"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {isEditMode ? "Cập Nhật Hợp Đồng" : "Hợp Đồng Mới"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Điều khoản hợp đồng
                </label>
                <input
                  type="text"
                  onChange={(e) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      description: e.target.value,
                    }))
                  }
                  value={formData.description}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hợp đồng phòng
                  </label>
                  <select
                    value={formData.roomId}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        roomId: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  >
                    <option value="">Hãy Chọn Phòng</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.name} (Tầng {room.floor})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Trạng Thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        status: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  >
                    <option value="valid">Còn Hiệu Lực</option>
                    <option value="invalid">Hết Hiệu Lực</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bên A
                  </label>
                  <div className="mt-1 block w-full rounded-md shadow-md p-2">
                    {`${parsedData.lastName} ${parsedData.firstName}`}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bên B
                  </label>
                  <select
                    value={formData.benB}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        benB: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  >
                    <option value="">Chọn người đại diện bên B</option>
                    {listLodger.map((lodger, index) => (
                      <option key={index} value={lodger._id}>
                        {lodger.firstName} {lodger.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hiệu Lực Từ Ngày
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        startDate: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Hiệu Lực Đến Ngày
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        endDate: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
                  />
                </div>
              </div>
              {isEditMode && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Thông Tin Khác
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <strong>Ngày Tạo Hóa Đơn:</strong>{" "}
                      {formatDate(
                        contracts.find((c) => c._id === selectedContract)
                          ?.createdAt
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Ngày Cập Nhật Hóa Đơn:</strong>{" "}
                      {formatDate(
                        contracts.find((c) => c._id === selectedContract)
                          ?.updatedAt
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  {isEditMode ? "Lưu Thay Đổi" : "Tạo Mới"}
                </button>
                {/* {isEditMode && (
                  <button
                    type="button"
                    onClick={() => handleDeleteContract(selectedContract)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                  >
                    Delete
                  </button>
                )} */}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractManagement;
