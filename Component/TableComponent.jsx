import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const TableComponent = ({
  items, // Array of objects representing the data to display
  columns, // Array of column configurations
  title, // Optional title for the table
  itemsPerPage = 5, // Number of items to display per page
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { t, i18n } = useTranslation();

  const isArabic = i18n.language === "ar";
  // Filter items based on the search term
  const filteredItems = items.filter((item) =>
    columns.some((col) =>
      item[col.accessor]
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Get items for the current page
  const displayedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  return (
    <div className="ship-to-section-container p-4">
      {/* Search Input */}
      <div className="flex justify-between p-2 mb-3 mt-7">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="border rounded p-2"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-gray-300 mb-5">
        <table className="w-full">
          <thead className="sticky top-0 bg-blue-100">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  className={`font-normal border border-gray-300 px-4 py-2 ${
                    isArabic ? "text-right" : "text-left"
                  } ${col.width ? `w-${col.width}` : ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((item, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="border border-gray-300">
                    {col.accessor === "locationUrl" ? (
                      <a
                        href={item[col.accessor]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline p-4 block text-center"
                      >
                        {t("location")}{" "}
                        {/* or just use "Location" if not translated */}
                      </a>
                    ) : (
                      <input
                        type="text"
                        className="p-4 w-full"
                        value={
                          col.format
                            ? col.format(item[col.accessor])
                            : item[col.accessor]
                        }
                        readOnly
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {t("previous")}
        </button>
        <span>
          {t("page")} {currentPage} {t("of")} {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {t("next")}
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
