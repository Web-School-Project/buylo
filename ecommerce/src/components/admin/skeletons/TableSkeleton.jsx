import React from "react";
import "./TableSkeleton.css";

const TableSkeleton = ({ columns = 5, rows = 5 }) => {
  return (
    <div className="table-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-title"></div>
        <div className="skeleton-actions">
          <div className="skeleton-button"></div>
        </div>
      </div>

      <div className="skeleton-table">
        <div className="skeleton-table-header">
          {Array(columns)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="skeleton-table-cell"></div>
            ))}
        </div>
        {Array(rows)
          .fill(0)
          .map((_, rowIndex) => (
            <div key={rowIndex} className="skeleton-table-row">
              {Array(columns)
                .fill(0)
                .map((_, cellIndex) => (
                  <div key={cellIndex} className="skeleton-table-cell"></div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
