import React from "react";

const accounts = Array(6).fill({
  name: "Lindsey Curtis",
  role: "Web Designer",
  project: "Agency Website",
  status: "Active",
  budget: "3.9K"
});

export default function ManagerList() {
  return (
    <section className="p-8 w-full">
      <h2 className="text-yellow-500 text-2xl font-bold mb-4">Manager List</h2>
      <h3 className="text-yellow-400 text-xl font-bold mb-4">List</h3>
      <div className="bg-white p-4 rounded-lg shadow">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th>User</th>
              <th>Project Name</th>
              <th>Team</th>
              <th>Status</th>
              <th>Budget</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account, index) => (
              <tr key={index} className="border-t">
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <div>
                      {account.name}<br/>
                      <span className="text-sm text-gray-500">{account.role}</span>
                    </div>
                  </div>
                </td>
                <td>{account.project}</td>
                <td>👥👥👥</td>
                <td className="text-green-500">{account.status}</td>
                <td>{account.budget}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
