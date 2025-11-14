import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChartCard from "../components/ChartCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const OwnerDashboard = () => {
  const [spots, setSpots] = useState([
    { id: 1, name: "City Center", slots: 10, price: 40, booked: 6 },
    { id: 2, name: "Mall Road", slots: 8, price: 50, booked: 5 },
  ]);

  const data = [
    { name: "Mon", bookings: 5 },
    { name: "Tue", bookings: 8 },
    { name: "Wed", bookings: 6 },
    { name: "Thu", bookings: 9 },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Owner Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <ChartCard title="Total Spots" value={spots.length} icon="🅿️" />
          <ChartCard title="Active Bookings" value={11} icon="📋" />
          <ChartCard title="Total Revenue" value="₹1,200" icon="💰" />
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-4">📈 Weekly Bookings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Parking Spots Table */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">🅿️ Your Parking Spots</h2>
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Total Slots</th>
                <th className="border px-4 py-2">Booked</th>
                <th className="border px-4 py-2">Price/hr</th>
              </tr>
            </thead>
            <tbody>
              {spots.map((s) => (
                <tr key={s.id}>
                  <td className="border px-4 py-2">{s.name}</td>
                  <td className="border px-4 py-2">{s.slots}</td>
                  <td className="border px-4 py-2">{s.booked}</td>
                  <td className="border px-4 py-2">₹{s.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
