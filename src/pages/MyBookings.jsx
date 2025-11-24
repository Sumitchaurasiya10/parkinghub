import React, { useState, useEffect } from "react";
import { bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const response = await bookingAPI.getUserBookings(user._id);
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingAPI.cancel(id);
      alert('Booking cancelled successfully');
      loadBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Cancellation failed');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center">
        <div className="text-center">Loading your bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">My Bookings</h1>
      
      <div className="bg-white rounded-xl shadow p-6">
        {bookings.length === 0 ? (
          <p className="text-gray-600 text-center">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border px-4 py-2">Parking Spot</th>
                  <th className="border px-4 py-2">Start Time</th>
                  <th className="border px-4 py-2">End Time</th>
                  <th className="border px-4 py-2">Price</th>
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td className="border px-4 py-2">
                      {booking.spot?.name}
                    </td>
                    <td className="border px-4 py-2">
                      {formatDate(booking.startTime)}
                    </td>
                    <td className="border px-4 py-2">
                      {formatDate(booking.endTime)}
                    </td>
                    <td className="border px-4 py-2">₹{booking.totalPrice}</td>
                    <td className="border px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        booking.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'active' ? 'bg-green-100 text-green-800' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {booking.status === 'reserved' && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 text-sm"
                        >
                          Cancel
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
    </div>
  );
};

export default MyBookings;