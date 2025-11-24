import React from "react";

const BookingModal = ({ show, parking, onClose, onConfirm, bookingData, setBookingData }) => {
  if (!show) return null;

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
  };

  const calculatePrice = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0;
    
    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    
    return hours * (parking?.pricePerHour || 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">
          Book Parking: {parking?.name}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              name="startTime"
              value={bookingData.startTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              name="endTime"
              value={bookingData.endTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              min={bookingData.startTime || new Date().toISOString().slice(0, 16)}
            />
          </div>

          {calculatePrice() > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-lg font-semibold text-blue-700">
                Total Price: ₹{calculatePrice()}
              </p>
              <p className="text-sm text-gray-600">
                {Math.ceil(
                  (new Date(bookingData.endTime) - new Date(bookingData.startTime)) / (1000 * 60 * 60)
                )} hours × ₹{parking?.pricePerHour}/hour
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!bookingData.startTime || !bookingData.endTime}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;