import React from 'react';
import { cn } from '../../lib/utils';

interface Column {
  key: string;
  header: string;
  width?: string;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T = any> {
  columns: Column[];
  data: T[];
  className?: string;
  onSort?: (column: string) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  renderCell?: (column: Column, row: T, index: number) => React.ReactNode;
  renderRow?: (row: T, index: number) => Record<string, React.ReactNode>;
  keyExtractor?: (row: T, index: number) => string;
}

const Table = <T = any,>({
  columns,
  data,
  className,
  onSort,
  sortColumn,
  sortDirection,
  renderCell,
  renderRow,
  keyExtractor,
}: TableProps<T>) => {
  const handleSort = (column: Column) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                    column.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700",
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <svg
                          className={cn(
                            "h-3 w-3 -mb-1",
                            sortColumn === column.key && sortDirection === 'asc'
                              ? "text-blue-500"
                              : "text-gray-300"
                          )}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg
                          className={cn(
                            "h-3 w-3",
                            sortColumn === column.key && sortDirection === 'desc'
                              ? "text-blue-500"
                              : "text-gray-300"
                          )}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((row, rowIndex) => {
              const rowData = renderRow ? renderRow(row, rowIndex) : {};
              return (
                <tr
                  key={keyExtractor ? keyExtractor(row, rowIndex) : rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-6 py-4 whitespace-nowrap text-sm",
                        column.className
                      )}
                      style={{ width: column.width }}
                    >
                      {renderRow ? (
                        rowData[column.key] || null
                      ) : renderCell ? (
                        renderCell(column, row, rowIndex)
                      ) : (
                        <div className="text-gray-900 dark:text-gray-100">
                          {(row as any)[column.key]}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {data.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      )}
    </div>
  );
};

export default Table;