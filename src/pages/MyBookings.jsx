import React, { useState, useEffect } from "react";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Dummy bookings (replace later with API)
    setBookings([
      { id: 1, spot: "City Center", vehicle: "BR01AB1234", duration: 2, price: 80, status: "Active" },
      { id: 2, spot: "Mall Road", vehicle: "DL05CD7890", duration: 1, price: 50, status: "Completed" },
    ]);
  }, []);

  const handleCancel = (id) => {
    setBookings(bookings.filter((b) => b.id !== id));
    alert("Booking cancelled successfully ❌");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">My Bookings</h1>
      <div className="bg-white rounded-xl shadow p-6">
        {bookings.length === 0 ? (
          <p className="text-gray-600 text-center">No bookings found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border px-4 py-2">Spot</th>
                <th className="border px-4 py-2">Vehicle</th>
                <th className="border px-4 py-2">Duration</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="border px-4 py-2">{b.spot}</td>
                  <td className="border px-4 py-2">{b.vehicle}</td>
                  <td className="border px-4 py-2">{b.duration} hr</td>
                  <td className="border px-4 py-2">₹{b.price}</td>
                  <td className="border px-4 py-2">{b.status}</td>
                  <td className="border px-4 py-2 text-center">
                    {b.status === "Active" && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
