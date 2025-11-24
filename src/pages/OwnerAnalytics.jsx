import React, { useState, useEffect } from "react";
import { bookingAPI, parkingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChartCard from "../components/ChartCard";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const OwnerAnalytics = () => {
  const [spots, setSpots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalSpots: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeBookings: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Load owner's parking spots
      const spotsResponse = await parkingAPI.getAll();
      const ownerSpots = spotsResponse.data.filter(spot => spot.owner?._id === user._id);
      setSpots(ownerSpots);

      // Load owner's bookings
      const bookingsResponse = await bookingAPI.getOwnerBookings(user._id);
      setBookings(bookingsResponse.data);

      // Calculate analytics
      const totalRevenue = bookingsResponse.data.reduce((sum, booking) => sum + booking.totalPrice, 0);
      const activeBookings = bookingsResponse.data.filter(booking => 
        booking.status === 'reserved' || booking.status === 'active'
      ).length;

      setAnalytics({
        totalSpots: ownerSpots.length,
        totalBookings: bookingsResponse.data.length,
        totalRevenue,
        activeBookings
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for weekly bookings
  const getWeeklyBookingsData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }).reverse();

    return last7Days.map(day => {
      const dayBookings = bookings.filter(booking => {
        const bookingDate = new Date(booking.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        return bookingDate === day;
      });
      return {
        name: day,
        bookings: dayBookings.length,
        revenue: dayBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)
      };
    });
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
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Owner Analytics</h1>

        {loading ? (
          <div className="text-center">Loading analytics...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <ChartCard title="Total Spots" value={analytics.totalSpots} icon="🅿️" />
              <ChartCard title="Total Bookings" value={analytics.totalBookings} icon="📋" />
              <ChartCard title="Active Bookings" value={analytics.activeBookings} icon="✅" />
              <ChartCard title="Total Revenue" value={`₹${analytics.totalRevenue}`} icon="💰" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Weekly Bookings Chart */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4">📈 Weekly Bookings</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWeeklyBookingsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-xl font-semibold mb-4">💰 Weekly Revenue</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWeeklyBookingsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Parking Spots Table */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🅿️ Your Parking Spots</h2>
              {spots.length === 0 ? (
                <p className="text-gray-600 text-center">No parking spots found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Name</th>
                        <th className="border px-4 py-2">Address</th>
                        <th className="border px-4 py-2">Total Slots</th>
                        <th className="border px-4 py-2">Available Slots</th>
                        <th className="border px-4 py-2">Price/hr</th>
                        <th className="border px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spots.map((spot) => (
                        <tr key={spot._id}>
                          <td className="border px-4 py-2">{spot.name}</td>
                          <td className="border px-4 py-2">{spot.address}</td>
                          <td className="border px-4 py-2">{spot.totalSlots}</td>
                          <td className="border px-4 py-2">{spot.availableSlots}</td>
                          <td className="border px-4 py-2">₹{spot.pricePerHour}</td>
                          <td className="border px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              spot.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : spot.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {spot.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">📋 Recent Bookings</h2>
              {bookings.length === 0 ? (
                <p className="text-gray-600 text-center">No bookings found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-4 py-2">Spot</th>
                        <th className="border px-4 py-2">Customer</th>
                        <th className="border px-4 py-2">Duration</th>
                        <th className="border px-4 py-2">Price</th>
                        <th className="border px-4 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((booking) => (
                        <tr key={booking._id}>
                          <td className="border px-4 py-2">{booking.spot?.name}</td>
                          <td className="border px-4 py-2">{booking.user?.name}</td>
                          <td className="border px-4 py-2">
                            {Math.ceil((new Date(booking.endTime) - new Date(booking.startTime)) / (1000 * 60 * 60))} hrs
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OwnerAnalytics;