import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import FindParking from "./pages/FindParking";
import MyBookings from "./pages/MyBookings";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AddParking from "./pages/AddParking";
import OwnerBookings from "./pages/OwnerBookings";
import OwnerAnalytics from "./pages/OwnerAnalytics";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/parking" element={<FindParking />} />
              <Route path="/my-bookings" element={<MyBookings />} />
              <Route path="/owner" element={<OwnerDashboard />} />
              <Route path="/owner/add" element={<AddParking />} />
              <Route path="/owner/bookings" element={<OwnerBookings />} />
              <Route path="/owner/analytics" element={<OwnerAnalytics />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;