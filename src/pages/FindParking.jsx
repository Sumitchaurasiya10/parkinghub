import React, { useState } from "react";

const FindParking = () => {
  const [location, setLocation] = useState("");
  const [parkings, setParkings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [duration, setDuration] = useState("");

  // Dummy parking data (replace with backend later)
  const parkingData = [
    { id: 1, name: "City Center Parking", distance: "500m", price: "₹50/hr", available: true },
    { id: 2, name: "Mall Road Parking", distance: "1.2km", price: "₹40/hr", available: false },
    { id: 3, name: "Railway Station Parking", distance: "2km", price: "₹30/hr", available: true },
  ];

  // Search filter
  const handleSearch = () => {
    if (!location.trim()) {
      alert("Please enter a location!");
      return;
    }
    const results = parkingData.filter((p) =>
      p.name.toLowerCase().includes(location.toLowerCase())
    );
    setParkings(results.length > 0 ? results : parkingData);
  };

  // Booking handler
  const handleBook = (parking) => {
    setSelectedParking(parking);
    setShowModal(true);
  };

  // Confirm booking
  const handleConfirm = () => {
    if (!vehicleNumber || !duration) {
      alert("Please fill all fields!");
      return;
    }
    alert(
      `✅ Booking confirmed at ${selectedParking.name}\nVehicle: ${vehicleNumber}\nDuration: ${duration} hours`
    );
    setShowModal(false);
    setVehicleNumber("");
    setDuration("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">Find Parking</h1>

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 w-full max-w-xl">
        <input
          type="text"
          placeholder="Enter your location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Search
        </button>
      </div>

      {/* Parking Results */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {parkings.length === 0 ? (
          <p className="text-gray-600 text-center w-full">No parking spots found. Try searching!</p>
        ) : (
          parkings.map((p) => (
            <div
              key={p.id}
              className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{p.name}</h2>
              <p className="text-gray-600">📍 {p.distance} away</p>
              <p className="text-gray-600">💰 {p.price}</p>
              <p
                className={`mt-2 font-medium ${
                  p.available ? "text-green-600" : "text-red-500"
                }`}
              >
                {p.available ? "Available" : "Full"}
              </p>
              <button
                onClick={() => handleBook(p)}
                disabled={!p.available}
                className={`mt-4 w-full py-2 rounded-lg text-white ${
                  p.available
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {p.available ? "Book Now" : "Unavailable"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-xl shadow-lg p-8 w-96 relative">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">
              Book Parking: {selectedParking?.name}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Vehicle Number (e.g. MH12AB1234)"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Duration (in hours)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindParking;
