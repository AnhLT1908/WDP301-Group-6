import React from "react";
import authorsTableData from "../data/authors-table-data";

const LodgerAccountList = () => {
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {/* Card Container */}
      <div className="rounded-lg shadow overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-700 p-6">
          <h6 className="text-white text-lg font-medium">Authors Table</h6>
        </div>
        {/* Card Body */}
        <div className="overflow-x-auto px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["author", "function", "status", "employed", ""].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <span className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {authorsTableData.map(
                ({ img, name, email, job, online, date }, key) => {
                  const cellClass = `py-3 px-5 ${
                    key === authorsTableData.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;
                  return (
                    <tr key={name}>
                      {/* Author Column */}
                      <td className={cellClass}>
                        <div className="flex items-center gap-4">
                          <img
                            src={img}
                            alt={name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-sm font-semibold text-blue-gray-700">
                              {name}
                            </p>
                            <p className="text-xs font-normal text-blue-gray-500">
                              {email}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Job Column */}
                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {job[0]}
                        </p>
                        <p className="text-xs font-normal text-blue-gray-500">
                          {job[1]}
                        </p>
                      </td>
                      {/* Status Column */}
                      <td className={cellClass}>
                        <span
                          className={`py-0.5 px-2 text-[11px] font-medium inline-block rounded ${
                            online
                              ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                              : "bg-gradient-to-r from-blue-gray-400 to-blue-gray-600 text-white"
                          }`}
                        >
                          {online ? "online" : "offline"}
                        </span>
                      </td>
                      {/* Employed Column */}
                      <td className={cellClass}>
                        <p className="text-xs font-semibold text-blue-gray-600">
                          {date}
                        </p>
                      </td>
                      {/* Edit Column */}
                      <td className={cellClass}>
                        <a
                          href="#"
                          className="text-xs font-semibold text-blue-gray-600 hover:underline"
                        >
                          Edit
                        </a>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LodgerAccountList;
