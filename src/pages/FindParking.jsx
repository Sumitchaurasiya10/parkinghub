import React, { useEffect, useMemo, useState } from "react";
import { parkingAPI, bookingAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import BookingModal from "../components/BookingModal";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const FindParking = () => {
  const [location, setLocation] = useState("");
  const [parkings, setParkings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedParking, setSelectedParking] = useState(null);
  const [activeSpotId, setActiveSpotId] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'map'
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
  });
  
  const { user } = useAuth();

  useEffect(() => {
    loadParkings();
  }, []);

  const loadParkings = async () => {
    setLoading(true);
    try {
      const response = await parkingAPI.getAll();
      const activeSpots = response.data.filter(spot => spot.status === 'active');
      setParkings(activeSpots);
      if (activeSpots.length > 0 && !activeSpotId) {
        setActiveSpotId(activeSpots[0]._id);
      }
    } catch (error) {
      console.error('Error loading parkings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!location.trim()) {
      loadParkings();
      return;
    }

    setLoading(true);
    try {
      const response = await parkingAPI.getAll();
      const activeSpots = response.data.filter(spot => 
        spot.status === 'active' && 
        (spot.name?.toLowerCase().includes(location.toLowerCase()) ||
         spot.address?.toLowerCase().includes(location.toLowerCase()))
      );
      setParkings(activeSpots);
      if (activeSpots.length > 0) {
        setActiveSpotId(activeSpots[0]._id);
      }
    } catch (error) {
      console.error('Error searching parkings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (parking) => {
    if (!user) {
      alert("Please login to book parking");
      return;
    }
    setSelectedParking(parking);
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingData.startTime || !bookingData.endTime) {
      alert("Please select start and end time");
      return;
    }

    try {
      await bookingAPI.create({
        spotId: selectedParking._id,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
      });
      
      alert("Booking created successfully!");
      setShowModal(false);
      setBookingData({ startTime: "", endTime: "" });
      loadParkings();
    } catch (error) {
      alert(error.response?.data?.message || "Booking failed");
    }
  };

  const getCoordinates = (spot) => {
    const coords = spot?.location?.coordinates;
    if (coords && coords.length === 2) {
      return [coords[1], coords[0]];
    }
    if (spot?.lat && spot?.lng) {
      return [spot.lat, spot.lng];
    }
    return null;
  };

  const activeSpot = useMemo(
    () => parkings.find((spot) => spot._id === activeSpotId),
    [parkings, activeSpotId]
  );

  const mapCenter = useMemo(() => {
    const coords = getCoordinates(activeSpot);
    return coords || [20.5937, 78.9629];
  }, [activeSpot]);

  useEffect(() => {
    if (mapInstance && mapCenter && activeSpot) {
      mapInstance.flyTo(mapCenter, 15, {
        duration: 1.2,
      });
    }
  }, [mapCenter, mapInstance, activeSpot]);

  // Custom parking icon
  const parkingIcon = useMemo(
    () =>
      new L.DivIcon({
        className: 'custom-parking-icon',
        html: `<div style="
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          width: 40px;
          height: 40px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
            font-size: 18px;
            font-weight: bold;
          ">P</span>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
      }),
    []
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
    hover: {
      scale: 1.03,
      y: -8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Main Content */}
      <motion.div
        className="py-12 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900">
              Find Your Perfect Parking Spot
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Browse available spots on the map, see real-time availability, and book instantly
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-3xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by location, name, or address..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 pl-12 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              </div>
              <motion.button
                onClick={handleSearch}
                disabled={loading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? "Searching..." : "Search"}
              </motion.button>
            </div>
          </motion.div>

          {/* View Toggle */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center gap-4"
          >
            <button
              onClick={() => setViewMode("grid")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "bg-transparent text-slate-500 hover:bg-white"
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                viewMode === "map"
                  ? "bg-white text-slate-900 shadow-lg"
                  : "bg-transparent text-slate-500 hover:bg-white"
              }`}
            >
              Map View
            </button>
          </motion.div>

          {/* Content Area */}
          <AnimatePresence mode="wait">
            {viewMode === "grid" ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {loading ? (
                  <div className="col-span-full text-center text-slate-500 py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-500"></div>
                    <p className="mt-4">Loading parking spots...</p>
                  </div>
                ) : parkings.length === 0 ? (
                  <div className="col-span-full bg-white border border-slate-100 rounded-2xl p-12 text-center text-slate-500 shadow">
                    <div className="text-6xl mb-4">🚗</div>
                    <p className="text-xl font-semibold mb-2">No parking spots found</p>
                    <p>{location && "Try a different search term or clear the search to see all spots."}</p>
                  </div>
                ) : (
                  parkings.map((parking, index) => {
                    const coords = getCoordinates(parking);
                    const isActive = parking._id === activeSpotId;
                    return (
                      <motion.div
                        key={parking._id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover="hover"
                        transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-2xl overflow-hidden border shadow-xl cursor-pointer transition-all ${
                          isActive
                          ? "border-blue-200 ring-2 ring-blue-200/60 shadow-2xl"
                          : "border-slate-100"
                        }`}
                        onClick={() => setActiveSpotId(parking._id)}
                        onMouseEnter={() => setActiveSpotId(parking._id)}
                      >
                        {parking.imageUrl ? (
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={parking.imageUrl}
                              alt={parking.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-full text-white text-sm font-semibold">
                              ₹{parking.pricePerHour}/hr
                            </div>
                            {parking.availableSlots > 0 && (
                              <div className="absolute top-4 left-4 bg-green-500/90 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-semibold">
                                {parking.availableSlots} Available
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-48 bg-slate-100 flex items-center justify-center">
                            <span className="text-6xl">🅿️</span>
                          </div>
                        )}
                        <div className="p-5 space-y-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{parking.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2">
                              {parking.address || "Address shared after booking"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600">
                              🅿️ {parking.availableSlots}/{parking.totalSlots} slots
                            </span>
                            {coords && (
                              <a
                                href={`https://www.google.com/maps/search/?api=1&query=${coords[0]},${coords[1]}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-blue-600 hover:text-blue-500 text-xs underline"
                              >
                                View on Map
                              </a>
                            )}
                          </div>
                          {parking.amenities?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {parking.amenities.slice(0, 3).map((amenity, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600"
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          )}
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBook(parking);
                            }}
                            disabled={parking.availableSlots <= 0}
                            whileHover={parking.availableSlots > 0 ? { scale: 1.02 } : {}}
                            whileTap={parking.availableSlots > 0 ? { scale: 0.98 } : {}}
                            className={`w-full py-3 rounded-xl font-semibold transition-all ${
                              parking.availableSlots > 0
                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {parking.availableSlots > 0 ? "Book Now" : "Fully Booked"}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Map */}
                <motion.div
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-2 border border-slate-100 shadow-xl h-[600px] lg:sticky lg:top-8"
                >
                  <div className="h-full rounded-xl overflow-hidden relative">
                    <MapContainer
                      center={mapCenter}
                      zoom={activeSpot ? 15 : 5}
                      scrollWheelZoom={true}
                      style={{ height: "100%", width: "100%", zIndex: 1 }}
                      whenCreated={setMapInstance}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {parkings.map((spot) => {
                        const coords = getCoordinates(spot);
                        if (!coords) return null;
                        const isActive = spot._id === activeSpotId;
                        return (
                          <Marker
                            key={spot._id}
                            position={coords}
                            icon={parkingIcon}
                            eventHandlers={{
                              click: () => setActiveSpotId(spot._id),
                            }}
                          >
                            <Popup>
                              <div className="space-y-2 min-w-[200px]">
                                <p className="font-bold text-gray-800">{spot.name}</p>
                                <p className="text-xs text-gray-600">{spot.address}</p>
                                <p className="text-xs text-gray-700">
                                  ₹{spot.pricePerHour}/hr · {spot.availableSlots}/{spot.totalSlots} slots
                                </p>
                                <button
                                  onClick={() => handleBook(spot)}
                                  disabled={spot.availableSlots <= 0}
                                  className={`w-full py-2 rounded-md text-white text-sm font-semibold ${
                                    spot.availableSlots > 0
                                      ? "bg-blue-600 hover:bg-blue-700"
                                      : "bg-gray-400 cursor-not-allowed"
                                  }`}
                                >
                                  {spot.availableSlots > 0 ? "Book Now" : "Full"}
                                </button>
                              </div>
                            </Popup>
                          </Marker>
                        );
                      })}
                    </MapContainer>
                  </div>
                </motion.div>

                {/* List Sidebar */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {parkings.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-2xl p-10 text-center text-slate-500 shadow">
                      <p>No parking spots found</p>
                    </div>
                  ) : (
                    parkings.map((parking, index) => {
                      const isActive = parking._id === activeSpotId;
                      return (
                        <motion.div
                          key={parking._id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          transition={{ delay: index * 0.05 }}
                          className={`bg-white rounded-xl p-4 border cursor-pointer transition-all shadow ${
                            isActive
                              ? "border-blue-200 ring-2 ring-blue-200/60"
                              : "border-slate-100"
                          }`}
                          onClick={() => setActiveSpotId(parking._id)}
                        >
                          <div className="flex gap-4">
                            {parking.imageUrl ? (
                              <img
                                src={parking.imageUrl}
                                alt={parking.name}
                                className="w-24 h-24 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-lg bg-slate-100 flex items-center justify-center">
                                <span className="text-3xl">🅿️</span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-slate-900 mb-1 truncate">{parking.name}</h3>
                              <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                                {parking.address || "Address shared after booking"}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">
                                  ₹{parking.pricePerHour}/hr
                                </span>
                                <span className="text-xs text-slate-500">
                                  {parking.availableSlots}/{parking.totalSlots} slots
                                </span>
                              </div>
                              <motion.button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBook(parking);
                                }}
                                disabled={parking.availableSlots <= 0}
                                whileHover={parking.availableSlots > 0 ? { scale: 1.05 } : {}}
                                whileTap={parking.availableSlots > 0 ? { scale: 0.95 } : {}}
                                className={`mt-2 w-full py-2 rounded-lg text-sm font-semibold ${
                                  parking.availableSlots > 0
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                }`}
                              >
                                {parking.availableSlots > 0 ? "Book" : "Full"}
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <BookingModal
        show={showModal}
        parking={selectedParking}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmBooking}
        bookingData={bookingData}
        setBookingData={setBookingData}
      />

      <style>{`
        .custom-parking-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
        }
      `}</style>
    </div>
  );
};

export default FindParking;
