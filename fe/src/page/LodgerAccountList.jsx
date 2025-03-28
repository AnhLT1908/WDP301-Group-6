import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LodgerAccountList = () => {
  const [houseManageId, setHouseManageId] = useState("");
  const [memberOfHouse, setMemberOfHouse] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const hostId = JSON.parse(localStorage.getItem("user"))._id;
  console.log("Host id", hostId);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/house/houseByHost",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "host-Id": hostId,
            },
          }
        );
        console.log("Response", response.data);
        console.log("Response data detail", response.data.data[0]);
        if (response.data.data && response.data.data.length > 0) {
          setHouseManageId(response.data.data[0]._id);
        }
      } catch (error) {
        console.error("Error fetchHouseData: ", error);
      }
    };
    fetchHouseData();
  }, [hostId, token]);

  useEffect(() => {
    const fetchMemberOfHouse = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/account/lodgerAccount/${houseManageId}`,
          {
            params: {
              page: currentPage,
              limit: 10,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Member response: ", response.data);
        if (
          response.data.memberOfHouse &&
          response.data.memberOfHouse.length > 0
        ) {
          setMemberOfHouse(response.data.memberOfHouse);
          setTotalPages(response.data.pagination.totalPages);
        }
      } catch (error) {
        console.error("Error fetchMemberOfHouse: ", error);
      }
    };
    fetchMemberOfHouse();
  }, [houseManageId, currentPage]);

  const handleChangePages = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCreateAccount = () => {
    navigate("/manager/create-lodger-account");
  };

  console.log("House Id", houseManageId);
  console.log("MemberList", memberOfHouse);

  return (
    <div className="mb-8 flex flex-col">
      {/* Card Container */}
      {/* <div className="m-6">
        <button className="flex justify-center items-center rounded-md font-medium text-white bg-green-600 p-6 w-[100px] h-[50px]">
          Back
        </button>
      </div> */}
      <div className="shadow overflow-hidden m-6">
        {/* Card Header */}
        <div className="flex justify-between items-center rounded-lg bg-gradient-to-r from-green-700 to-green-500 p-6 mx-6">
          <h6 className="text-white text-lg font-medium">Lodger List</h6>
          <button
            onClick={handleCreateAccount}
            className="bg-white text-green-500 hover:bg-green-900  transition duration-300 font-bold px-6 py-2 rounded-xl shadow-md"
          >
            Create new account
          </button>
        </div>
        {/* Card Body */}
        <div className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Name", "Email", "Phone", "Room", "Status", "Actions"].map(
                  (el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 py-3 px-6 text-left"
                    >
                      <span className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </span>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {memberOfHouse.map((member, index) => {
                const cellClass = `py-3 px-6 ${
                  index === memberOfHouse.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                }`;
                return (
                  <tr
                    key={member._id}
                    className="hover:bg-gray-300 transition duration-100"
                  >
                    <td className={cellClass}>
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-semibold text-blue-gray-700">
                            {member.firstName} {member.lastName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {member.email}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {member.phone}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <p className="text-xs font-semibold text-blue-gray-600">
                        {member.roomId.name}
                      </p>
                    </td>

                    <td className={cellClass}>
                      <span
                        className={`py-0.5 px-2 text-[11px] font-medium inline-block rounded ${
                          member.status
                            ? "bg-green-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {member.status ? "Rented" : "Cancel"}
                      </span>
                    </td>

                    <td className={cellClass}>
                      <a
                        href={`/manager/update-lodger-account/${member._id}`}
                        className="text-xs font-semibold text-blue-gray-600 hover:underline"
                      >
                        Edit
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center items-center mt-6">
        <button
          onClick={() => handleChangePages(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center mr-2 w-[80px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Previous
        </button>
        <div className="flex items-center space-x-2">
          {[...Array(totalPages)].map((_, index) => {
            const pageNum = index + 1;
            return (
              <button
                key={pageNum}
                onClick={() => handleChangePages(pageNum)}
                className={`flex items-center justify-center px-3 py-1 text-lg font-semibold rounded-md ${
                  pageNum === currentPage
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-green-500 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => handleChangePages(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex justify-center items-center ml-2 w-[80px] bg-green-500 hover:bg-green-700 p-2 rounded-lg text-base font-semibold text-white"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default LodgerAccountList;
