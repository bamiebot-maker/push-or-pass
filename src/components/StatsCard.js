import React from "react";

const StatsCard = ({ number, label, icon, trend }) => {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="stat-number">{number}</div>
          <div className="stat-label">{label}</div>
        </div>
        {icon && (
          <div className="text-2xl">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`text-sm ${trend > 0 ? 'text-success' : 'text-danger'}`}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  );
};

export default StatsCard;
