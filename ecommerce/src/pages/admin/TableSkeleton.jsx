

const TableSkeleton = ({ columns, rows }) => {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex border-b border-gray-200 bg-gray-50 p-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={`header-${i}`} className="flex-1 h-6 bg-gray-200 rounded mr-4"></div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex border-b border-gray-200 p-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="flex-1 h-6 bg-gray-200 rounded mr-4"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableSkeleton
