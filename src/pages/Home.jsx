import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Lottie from "lottie-react";
import { useAuth } from "../context/AuthContext";
import { adminAPI, bookingAPI, parkingAPI } from "../services/api";

// Simple working Lottie animation - location pin with pulse
const locationAnimation = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Location Pin",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Pin",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 0, s: [100, 100, 100] },
            { i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 30, s: [120, 120, 100] },
            { t: 60, s: [100, 100, 100] }
          ]
        }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              d: 1,
              ty: "el",
              s: { a: 0, k: [60, 60] },
              p: { a: 0, k: [0, 0] },
              nm: "Circle"
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.3, 0.6, 1, 1] },
              o: { a: 0, k: 100 },
              r: 1,
              bm: 0,
              nm: "Fill"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 },
              nm: "Transform"
            }
          ],
          nm: "Circle Shape",
          bm: 0
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ],
  markers: []
};

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lottieError, setLottieError] = useState(false);
  const [snapshot, setSnapshot] = useState({
    total: 0,
    active: 0,
    totalAvailability: 0,
    averageRate: 0,
    topAmenities: [],
    featured: [],
  });
  const [snapshotError, setSnapshotError] = useState("");
  const [isFetchingSnapshot, setIsFetchingSnapshot] = useState(true);
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [ownerMetrics, setOwnerMetrics] = useState(null);
  const [userHighlights, setUserHighlights] = useState(null);
  const { user } = useAuth();
  const { scrollY } = useScroll();

  const dashboardRoute = useMemo(() => {
    if (!user) return "/parking";
    if (user.role === "admin") return "/admin";
    if (user.role === "owner") return "/owner";
    return "/my-bookings";
  }, [user]);

  // Parallax effects
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const contentY = useTransform(scrollY, [0, 500], [0, 50]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadLiveData = async () => {
      setIsFetchingSnapshot(true);
      setSnapshotError("");
      try {
        const { data: spots = [] } = await parkingAPI.getAll();
        if (!isMounted) return;

        const activeSpots = spots.filter((spot) => spot.status === "active");
        const totalAvailability = activeSpots.reduce(
          (sum, spot) => sum + (spot.availableSlots ?? 0),
          0
        );
        const averageRate = activeSpots.length
          ? Math.round(
              activeSpots.reduce((sum, spot) => sum + (spot.pricePerHour || 0), 0) /
                activeSpots.length
            )
          : 0;

        const amenityUsage = activeSpots.reduce((map, spot) => {
          (spot.amenities || []).forEach((amenity) => {
            if (!amenity) return;
            map[amenity] = (map[amenity] || 0) + 1;
          });
          return map;
        }, {});
        const topAmenities = Object.entries(amenityUsage)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([label, count]) => ({ label, count }));

        setSnapshot({
          total: spots.length,
          active: activeSpots.length,
          totalAvailability,
          averageRate,
          topAmenities,
          featured: activeSpots.slice(0, 3),
        });

        if (user?.role === "admin") {
          const { data } = await adminAPI.getAnalytics();
          if (!isMounted) return;
          setAdminMetrics(data);
        } else if (user?.role === "owner" && user?._id) {
          const [{ data: ownerBookings }] = await Promise.all([
            bookingAPI.getOwnerBookings(user._id),
          ]);
          if (!isMounted) return;
          const ownerSpots = spots.filter((spot) => spot.owner?._id === user._id);
          const totalRevenue = ownerBookings.reduce(
            (sum, booking) => sum + (booking.totalPrice || 0),
            0
          );
          const activeBookings = ownerBookings.filter((booking) =>
            ["reserved", "active"].includes(booking.status)
          ).length;

          setOwnerMetrics({
            totalSpots: ownerSpots.length,
            activeSpots: ownerSpots.filter((spot) => spot.status === "active").length,
            pendingSpots: ownerSpots.filter((spot) => spot.status === "pending").length,
            totalRevenue,
            activeBookings,
          });
        } else if (user?.role === "user" && user?._id) {
          const { data: userBookings } = await bookingAPI.getUserBookings(user._id);
          if (!isMounted) return;
          const upcoming = userBookings
            .filter((booking) => new Date(booking.startTime) > new Date())
            .sort(
              (a, b) =>
                new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            )[0];

          setUserHighlights({
            totalBookings: userBookings.length,
            upcoming: upcoming
              ? {
                  spot: upcoming.spot?.name || "Reserved spot",
                  startTime: upcoming.startTime,
                  address: upcoming.spot?.address,
                }
              : null,
          });
        } else {
          setAdminMetrics(null);
          setOwnerMetrics(null);
          setUserHighlights(null);
        }
      } catch (error) {
        if (!isMounted) return;
        setSnapshotError(
          error.response?.data?.message || "Unable to load live availability right now."
        );
      } finally {
        if (isMounted) {
          setIsFetchingSnapshot(false);
        }
      }
    };

    loadLiveData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.05,
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Unique Mesh Gradient Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800" />
        
        {/* Animated mesh gradients */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(at 0% 0%, rgba(120, 119, 198, 0.5) 0px, transparent 50%),
              radial-gradient(at 50% 0%, rgba(99, 102, 241, 0.4) 0px, transparent 50%),
              radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.4) 0px, transparent 50%),
              radial-gradient(at 0% 50%, rgba(236, 72, 153, 0.3) 0px, transparent 50%),
              radial-gradient(at 100% 50%, rgba(59, 130, 246, 0.4) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(139, 92, 246, 0.3) 0px, transparent 50%),
              radial-gradient(at 50% 100%, rgba(168, 85, 247, 0.4) 0px, transparent 50%),
              radial-gradient(at 100% 100%, rgba(236, 72, 153, 0.3) 0px, transparent 50%)
            `,
            y: backgroundY,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -80, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 120, 0],
            y: [0, -60, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ y: contentY }}
      >
        {/* Hero Section with Lottie */}
        <motion.div className="mb-12" variants={itemVariants}>
          {user && (
            <motion.div
              className="inline-flex items-center gap-3 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-sm font-semibold text-white">Welcome back</span>
              <span className="text-sm font-medium text-white/80">
                {user.name} &middot; {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </motion.div>
          )}

          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            {/* Lottie Animation with Fallback */}
            <motion.div
              className="w-48 h-48 sm:w-64 sm:h-64 relative"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.3,
              }}
            >
              {!lottieError ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lottie
                    animationData={locationAnimation}
                    loop={true}
                    style={{ width: "100%", height: "100%" }}
                    className="drop-shadow-2xl"
                    onError={() => setLottieError(true)}
                  />
                </div>
              ) : (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center text-8xl sm:text-9xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🚗
                </motion.div>
              )}
              {/* Animated rings around icon */}
              <motion.div
                className="absolute inset-0 border-4 border-white/30 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <motion.div
                className="absolute inset-0 border-4 border-white/20 rounded-full"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: 0.3,
                }}
              />
            </motion.div>

            <motion.h1
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-4"
              variants={itemVariants}
            >
              ParkingHub
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto"
              variants={itemVariants}
            >
              Live inventory, verified hosts, and real-time availability—built for commuters, owners, and admins.
            </motion.p>
          </div>
        </motion.div>

        {/* Live Snapshot Cards */}
        <motion.div className="space-y-6 mb-12" variants={itemVariants}>
          {snapshotError && (
            <motion.div
              className="max-w-3xl mx-auto rounded-2xl border border-red-300/50 bg-red-500/20 backdrop-blur-xl text-red-100 px-6 py-4 text-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {snapshotError}
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                label: "Active Spots",
                value: snapshot.active ? snapshot.active.toLocaleString() : (isFetchingSnapshot ? "…" : "0"),
                footer: "Verified & bookable",
                icon: "📍",
              },
              {
                label: "Open Slots",
                value: snapshot.totalAvailability
                  ? snapshot.totalAvailability.toLocaleString()
                  : isFetchingSnapshot
                  ? "…"
                  : "0",
                footer: "Updating live",
                icon: "🅿️",
              },
              {
                label: "Avg. Hourly Rate",
                value:
                  snapshot.averageRate && snapshot.averageRate > 0
                    ? `₹${snapshot.averageRate}`
                    : isFetchingSnapshot
                    ? "…"
                    : "—",
                footer: "Across current inventory",
                icon: "💰",
              },
              {
                label: "Top Amenity",
                value: snapshot.topAmenities[0]?.label || (isFetchingSnapshot ? "…" : "Add yours"),
                footer: snapshot.topAmenities[0]
                  ? `${snapshot.topAmenities[0].count} live listings`
                  : "Be the first to list",
                icon: "⭐",
              },
            ].map((metric, index) => (
              <motion.div
                key={metric.label}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl relative overflow-hidden group"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-3">{metric.icon}</div>
                <div className="text-sm uppercase tracking-wide text-white/70 mb-2">{metric.label}</div>
                <div className="text-3xl font-extrabold text-white mb-2">{metric.value}</div>
                <p className="text-sm text-white/60">{metric.footer}</p>
                
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "200%" }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {snapshot.topAmenities.length > 0 && (
            <motion.div
              className="flex flex-wrap justify-center gap-3 text-xs sm:text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {snapshot.topAmenities.map((amenity, index) => (
                <motion.span
                  key={amenity.label}
                  className="px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur text-white font-semibold shadow-lg"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  {amenity.label} &middot; {amenity.count} spots live
                </motion.span>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12"
          variants={itemVariants}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={dashboardRoute}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-2xl overflow-hidden min-w-[200px] text-center block"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {user ? "🚀 Go to Dashboard" : "🔍 Find Parking"}
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>

          {user ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/parking"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-xl shadow-2xl border-2 border-white/30 min-w-[200px] text-center block hover:bg-white/20 transition-colors"
              >
                Browse Nearby Spots
              </Link>
            </motion.div>
          ) : (
            <>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white font-semibold rounded-xl shadow-2xl border-2 border-white/30 min-w-[200px] text-center block hover:bg-white/20 transition-colors"
                >
                  Login
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-xl shadow-2xl min-w-[200px] text-center block"
                >
                  Create Account
                </Link>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Featured Spots */}
        <motion.div className="mt-12 sm:mt-16 w-full" variants={itemVariants}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="text-left">
              <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-2">Live inventory</p>
              <h2 className="text-2xl font-bold text-white">Trending parking spots right now</h2>
            </div>
            <Link
              to="/parking"
              className="text-sm font-semibold text-white hover:text-white/80 inline-flex items-center gap-2"
            >
              View all spots <span className="text-lg">→</span>
            </Link>
          </div>

          {isFetchingSnapshot ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((placeholder) => (
                <motion.div
                  key={placeholder}
                  className="rounded-2xl bg-white/10 backdrop-blur-xl h-40 border border-white/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ))}
            </div>
          ) : snapshot.featured.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {snapshot.featured.map((spot, index) => (
                <motion.div
                  key={spot._id}
                  className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col gap-3 text-left"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{spot.name}</h3>
                    <span className="text-xs uppercase tracking-wide text-green-300 bg-green-500/20 px-3 py-1 rounded-full border border-green-400/30">
                      {spot.availableSlots ?? 0} slots open
                    </span>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2">{spot.address || "Address shared post-booking"}</p>
                  <div className="flex items-center justify-between text-sm text-white/80">
                    <span className="font-semibold text-white text-lg">₹{spot.pricePerHour || 0}/hr</span>
                    <span>{spot.totalSlots} total bays</span>
                  </div>
                  {spot.amenities?.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-white/60">
                      {spot.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-3 py-1 rounded-full bg-white/10 border border-white/20"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center text-white/70 bg-white/10 backdrop-blur-xl border border-dashed border-white/20 rounded-2xl py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No active spots yet. Owners can list their first location from the dashboard.
            </motion.div>
          )}
        </motion.div>

        {/* Role-Specific Insights */}
        {(adminMetrics || ownerMetrics || userHighlights) && (
          <motion.div
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full"
            variants={itemVariants}
          >
            {adminMetrics && (
              <motion.div
                className="col-span-1 md:col-span-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl text-left"
                variants={cardVariants}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-3">Admin pulse</p>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: "Users", value: adminMetrics.totalUsers },
                    { label: "Owners", value: adminMetrics.totalOwners },
                    { label: "Spots", value: adminMetrics.totalSpots },
                    { label: "Bookings", value: adminMetrics.totalBookings },
                    { label: "Last 7d", value: adminMetrics.recentBookingsCount },
                  ].map((item) => (
                    <motion.div
                      key={item.label}
                      className="p-4 rounded-xl bg-white/10 border border-white/20 text-center"
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                    >
                      <div className="text-2xl font-bold text-white">{item.value ?? "0"}</div>
                      <div className="text-xs uppercase tracking-wide text-white/60">{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {ownerMetrics && (
              <motion.div
                className="bg-gradient-to-br from-purple-600/80 to-blue-600/80 backdrop-blur-xl text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                variants={cardVariants}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25),_transparent)] pointer-events-none" />
                <div className="relative">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/80 mb-3">Owner performance</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Listed", value: ownerMetrics.totalSpots },
                      { label: "Live", value: ownerMetrics.activeSpots },
                      { label: "Pending", value: ownerMetrics.pendingSpots },
                      { label: "Active bookings", value: ownerMetrics.activeBookings },
                    ].map((item) => (
                      <motion.div
                        key={item.label}
                        className="rounded-xl bg-white/10 p-4 text-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div className="text-2xl font-semibold">{item.value ?? 0}</div>
                        <div className="text-xs uppercase tracking-wide text-white/70">{item.label}</div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 rounded-xl bg-white/15 backdrop-blur">
                    <p className="text-sm text-white/80">Revenue earned</p>
                    <p className="text-2xl font-bold">₹{ownerMetrics.totalRevenue?.toLocaleString() || "0"}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {userHighlights && (
              <motion.div
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col text-left"
                variants={cardVariants}
              >
                <p className="text-sm uppercase tracking-[0.2em] text-white/60 mb-3">Your activity</p>
                <div className="text-3xl font-bold text-white mb-2">{userHighlights.totalBookings}</div>
                <p className="text-sm text-white/70">Completed & upcoming bookings</p>
                <div className="mt-6">
                  <p className="text-xs uppercase tracking-wide text-white/60 mb-2">Next reservation</p>
                  {userHighlights.upcoming ? (
                    <div className="p-4 rounded-xl bg-white/10 border border-white/20">
                      <p className="font-semibold text-white">{userHighlights.upcoming.spot}</p>
                      {userHighlights.upcoming.address && (
                        <p className="text-xs text-white/60">{userHighlights.upcoming.address}</p>
                      )}
                      <p className="text-sm text-blue-300 mt-2">
                        {new Date(userHighlights.upcoming.startTime).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-white/60">No upcoming bookings. Secure a slot to get moving.</p>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Home;
