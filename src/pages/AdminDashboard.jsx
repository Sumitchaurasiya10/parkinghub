import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [spots, setSpots] = useState([]);

  // Dummy data (replace later with API calls)
  useEffect(() => {
    setUsers([
      { id: 1, name: "Sweta Raj", email: "sweta@example.com", role: "user" },
      { id: 2, name: "Amit Kumar", email: "amit@example.com", role: "owner" },
    ]);

    setSpots([
      { id: 1, name: "City Center Parking", owner: "Amit Kumar", status: "pending" },
      { id: 2, name: "Mall Road Parking", owner: "Amit Kumar", status: "approved" },
    ]);
  }, []);

  const approveSpot = (id) => {
    alert(`✅ Parking spot #${id} approved!`);
  };

  const blockUser = (id) => {
    alert(`🚫 User #${id} blocked!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <h1 className="text-4xl font-bold text-blue-700 text-center mb-10">
        🛠️ Admin Dashboard
      </h1>

      {/* Tabs */}
      <div className="flex justify-center mb-8 space-x-4">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            activeTab === "users"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab("spots")}
          className={`px-6 py-2 rounded-lg font-semibold ${
            activeTab === "spots"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Manage Parking Spots
        </button>
      </div>

      {/* Users Section */}
      {activeTab === "users" && (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">👥 All Users</h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Email</th>
                <th className="border px-4 py-2">Role</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border px-4 py-2">{u.id}</td>
                  <td className="border px-4 py-2">{u.name}</td>
                  <td className="border px-4 py-2">{u.email}</td>
                  <td className="border px-4 py-2 capitalize">{u.role}</td>
                  <td className="border px-4 py-2 text-center">
                    <button
                      onClick={() => blockUser(u.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                    >
                      Block
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Parking Spots Section */}
      {activeTab === "spots" && (
        <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">🅿️ Parking Spots</h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Owner</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {spots.map((s) => (
                <tr key={s.id}>
                  <td className="border px-4 py-2">{s.id}</td>
                  <td className="border px-4 py-2">{s.name}</td>
                  <td className="border px-4 py-2">{s.owner}</td>
                  <td
                    className={`border px-4 py-2 font-semibold ${
                      s.status === "approved" ? "text-green-600" : "text-yellow-600"
                    }`}
                  >
                    {s.status}
                  </td>
                  <td className="border px-4 py-2 text-center">
                    {s.status === "pending" && (
                      <button
                        onClick={() => approveSpot(s.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
