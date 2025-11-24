import React, { useState, useEffect } from "react";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user._id) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getOwnerBookings(user._id);
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('Failed to load bookings: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">You need owner privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 p-8 w-full bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Owner Bookings</h1>

        {loading ? (
          <div className="text-center">Loading bookings...</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            {bookings.length === 0 ? (
              <p className="text-gray-600 text-center">No bookings found for your parking spots.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="border px-4 py-2">Parking Spot</th>
                      <th className="border px-4 py-2">Customer</th>
                      <th className="border px-4 py-2">Start Time</th>
                      <th className="border px-4 py-2">End Time</th>
                      <th className="border px-4 py-2">Price</th>
                      <th className="border px-4 py-2">Status</th>
                      <th className="border px-4 py-2">Booked On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking._id}>
                        <td className="border px-4 py-2">
                          {booking.spot?.name}
                        </td>
                        <td className="border px-4 py-2">
                          {booking.user?.name} ({booking.user?.email})
                        </td>
                        <td className="border px-4 py-2">
                          {formatDate(booking.startTime)}
                        </td>
                        <td className="border px-4 py-2">
                          {formatDate(booking.endTime)}
                        </td>
                        <td className="border px-4 py-2">₹{booking.totalPrice}</td>
                        <td className="border px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="border px-4 py-2">
                          {formatDate(booking.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerBookings;