import React from "react";
import "./AdminSkeleton.css";

const AdminSkeleton = () => {
  return (
    <div className="admin-skeleton">
      {/* Header skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-actions">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>

      {/* Stats cards skeleton */}
      <div className="skeleton-stats">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="skeleton-stat-card">
            <div className="skeleton-stat-icon"></div>
            <div className="skeleton-stat-content">
              <div className="skeleton-stat-title"></div>
              <div className="skeleton-stat-value"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="skeleton-table">
        <div className="skeleton-table-header">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="skeleton-table-cell"></div>
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="skeleton-table-row">
            {[1, 2, 3, 4, 5].map((cell) => (
              <div key={cell} className="skeleton-table-cell"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSkeleton;
