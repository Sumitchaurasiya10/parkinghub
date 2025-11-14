import React from "react";

const ChartCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-all flex items-center justify-between">
      <div>
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-3xl font-bold text-blue-700">{value}</p>
      </div>
      <div className="text-blue-600 text-3xl">{icon}</div>
    </div>
  );
};

export default ChartCard;
