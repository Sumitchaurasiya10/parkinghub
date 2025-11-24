import React, { useState, useEffect } from "react";
import { adminAPI, parkingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("spots");
  const [users, setUsers] = useState([]);
  const [spots, setSpots] = useState([]);
  const [allSpots, setAllSpots] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const response = await adminAPI.getUsers();
        setUsers(response.data);
      } else if (activeTab === 'spots') {
        // Use the correct method from parkingAPI
        const response = await parkingAPI.getAllSpotsForAdmin();
        setAllSpots(response.data);
        const pendingSpots = response.data.filter(spot => spot.status === 'pending');
        setSpots(pendingSpots);
      } else if (activeTab === 'allSpots') {
        const response = await parkingAPI.getAllSpotsForAdmin();
        setAllSpots(response.data);
      } else if (activeTab === 'analytics') {
        const response = await adminAPI.getAnalytics();
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const approveSpot = async (id) => {
    try {
      await adminAPI.approveSpot(id);
      alert('✅ Parking spot approved successfully! It is now visible to users.');
      loadData(); // Refresh the list
    } catch (error) {
      alert('❌ Approval failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const rejectSpot = async (id) => {
    if (!window.confirm('Are you sure you want to reject this parking spot?')) return;
    
    try {
      await parkingAPI.update(id, { status: 'inactive' });
      alert('❌ Parking spot rejected!');
      loadData();
    } catch (error) {
      alert('Rejection failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminAPI.deleteUser(id);
      alert('✅ User deleted successfully!');
      loadData();
    } catch (error) {
      alert('❌ Deletion failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-700 text-center mb-2">
          🛠️ Admin Dashboard
        </h1>
        <p className="text-center text-gray-600 mb-8">Manage parking spots and users</p>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-blue-600">{spots.length}</div>
            <div className="text-gray-600 text-sm">Pending Spots</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-green-600">{allSpots.filter(s => s.status === 'active').length}</div>
            <div className="text-gray-600 text-sm">Active Spots</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <div className="text-gray-600 text-sm">Total Users</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow border">
            <div className="text-2xl font-bold text-orange-600">{users.filter(u => u.role === 'owner').length}</div>
            <div className="text-gray-600 text-sm">Parking Owners</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-8 gap-2">
          <button
            onClick={() => setActiveTab("spots")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "spots"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 shadow hover:bg-gray-50"
            }`}
          >
            ⏳ Pending Spots ({spots.length})
          </button>
          <button
            onClick={() => setActiveTab("allSpots")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "allSpots"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 shadow hover:bg-gray-50"
            }`}
          >
            🅿️ All Spots ({allSpots.length})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 shadow hover:bg-gray-50"
            }`}
          >
            👥 Manage Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === "analytics"
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-gray-700 shadow hover:bg-gray-50"
            }`}
          >
            📊 Analytics
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* PENDING SPOTS SECTION */}
            {activeTab === "spots" && (
              <div className="bg-white rounded-xl shadow-lg border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    ⏳ Pending Parking Spots Approval
                    <span className="ml-3 bg-yellow-500 text-white text-sm px-3 py-1 rounded-full">
                      {spots.length} waiting
                    </span>
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Review and approve parking spots submitted by owners. Approved spots will be visible to all users.
                  </p>
                </div>

                {spots.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Spots</h3>
                    <p className="text-gray-500">All parking spots have been reviewed. Check back later for new submissions.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Parking Spot Details</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Owner Info</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Pricing & Slots</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Submitted</th>
                          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {spots.map((spot) => (
                          <tr key={spot._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-start space-x-4">
                                {spot.imageUrl && (
                                  <img
                                    src={spot.imageUrl}
                                    alt={spot.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                                <div>
                                  <h3 className="font-semibold text-gray-900">{spot.name}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{spot.address}</p>
                                  {spot.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{spot.description}</p>
                                  )}
                                  {spot.amenities && spot.amenities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {spot.amenities.map((amenity, index) => (
                                        <span
                                          key={index}
                                          className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
                                        >
                                          {amenity}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{spot.owner?.name}</p>
                                <p className="text-sm text-gray-600">{spot.owner?.email}</p>
                                {spot.owner?.phone && (
                                  <p className="text-sm text-gray-600">{spot.owner.phone}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="space-y-2">
                                <div>
                                  <span className="font-semibold text-green-600">₹{spot.pricePerHour}</span>
                                  <span className="text-sm text-gray-600">/hour</span>
                                </div>
                                <div>
                                  <span className="text-sm text-gray-600">
                                    {spot.availableSlots}/{spot.totalSlots} slots available
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">
                                {new Date(spot.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(spot.createdAt).toLocaleTimeString()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-2">
                                <button
                                  onClick={() => approveSpot(spot._id)}
                                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold text-sm"
                                >
                                  ✅ Approve
                                </button>
                                <button
                                  onClick={() => rejectSpot(spot._id)}
                                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                                >
                                  ❌ Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ALL SPOTS SECTION */}
            {activeTab === "allSpots" && (
              <div className="bg-white rounded-xl shadow-lg border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">🅿️ All Parking Spots</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Address</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price/hr</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Slots</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Owner</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allSpots.map((spot) => (
                        <tr key={spot._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{spot.name}</td>
                          <td className="px-6 py-4 text-gray-600">{spot.address}</td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-green-600">₹{spot.pricePerHour}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {spot.availableSlots}/{spot.totalSlots}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{spot.owner?.name}</p>
                              <p className="text-sm text-gray-500">{spot.owner?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(spot.status)}`}>
                              {spot.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {spot.status === 'pending' && (
                              <button
                                onClick={() => approveSpot(spot._id)}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 text-sm"
                              >
                                Approve
                              </button>
                            )}
                            {spot.status === 'active' && (
                              <span className="text-green-600 text-sm font-semibold">✓ Approved</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* USERS SECTION */}
            {activeTab === "users" && (
              <div className="bg-white rounded-xl shadow-lg border">
                <div className="p-6 border-b">
                  <h2 className="text-2xl font-bold text-gray-800">👥 All Users</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Phone</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-gray-600">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user.role === 'admin' 
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : user.role === 'owner'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => deleteUser(user._id)}
                              disabled={user.role === 'admin'} // Prevent deleting admin accounts
                              className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                                user.role === 'admin'
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              {user.role === 'admin' ? 'Protected' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ANALYTICS SECTION */}
            {activeTab === "analytics" && analytics && (
              <div className="bg-white rounded-xl shadow-lg border p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Analytics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-200">
                    <div className="text-3xl font-bold text-blue-700">{analytics.totalUsers}</div>
                    <div className="text-gray-600 font-medium">Total Users</div>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200">
                    <div className="text-3xl font-bold text-green-700">{analytics.totalOwners}</div>
                    <div className="text-gray-600 font-medium">Total Owners</div>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-xl text-center border border-purple-200">
                    <div className="text-3xl font-bold text-purple-700">{analytics.totalSpots}</div>
                    <div className="text-gray-600 font-medium">Total Spots</div>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-xl text-center border border-orange-200">
                    <div className="text-3xl font-bold text-orange-700">{analytics.totalBookings}</div>
                    <div className="text-gray-600 font-medium">Total Bookings</div>
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border">
                  <h3 className="font-semibold text-lg mb-3">📈 Recent Activity</h3>
                  <p className="text-gray-700">
                    Bookings in last 7 days: <span className="font-bold text-blue-600">{analytics.recentBookingsCount}</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;