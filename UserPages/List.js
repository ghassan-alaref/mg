import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Footer from "../Component/Footer";
import Sidebar from "../Component/Sidebar";

const List = ({
  isArabic,
  selectedCustomer,
  showAll,
  paginatedData,
  handleRowClick,
  handleInfoClick,
  ShowNotesFunction,
  renderStatus,
  renderPagination,
  addIcon,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <div
      className={`bg-[#FAFAFF]  min-h-screen flex ${
        i18n.dir() === "rtl" ? "flex-row-reverse" : ""
      }`}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <div className="container" dir={isArabic ? "rtl" : "ltr"}>
          <div className="py-4 overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th
                    className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("cardCode")}
                  </th>
                  <th
                    className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("customerName")}
                  </th>
                  <th
                    className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("group")}
                  </th>
                  <th
                    className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("customerInfo")}
                  </th>
                  <th
                    className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("Notes")}
                  </th>
                  <th
                    className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("authoriser")}
                  </th>
                  <th
                    className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                      isArabic ? "text-right" : "text-left"
                    }`}
                  >
                    {t("status")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {showAll === "onlyOne" && selectedCustomer && (
                  <tr key={selectedCustomer.id}>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                      <p
                        className="text-gray-900 whitespace-no-wrap cursor-pointer"
                        onClick={() => handleRowClick(selectedCustomer)}
                      >
                        {selectedCustomer.cardCode}
                      </p>
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                      <p
                        className="text-gray-900 whitespace-no-wrap cursor-pointer"
                        onClick={() => handleRowClick(selectedCustomer)}
                      >
                        {selectedCustomer.cardName}
                      </p>
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                      <p
                        className="text-gray-900 whitespace-no-wrap cursor-pointer"
                        onClick={() => handleRowClick(selectedCustomer)}
                      >
                        {selectedCustomer.customerGroupName}
                      </p>
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm text-right sm:px-5">
                      <img
                        src={addIcon}
                        alt="Info"
                        className={`h-auto w-3 md:h-auto w-6 ${
                          isArabic ? "xl:mr-10" : "ml-10"
                        } cursor-pointer`}
                        onClick={() => handleInfoClick(selectedCustomer)}
                      />
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                      <button
                        onClick={() =>
                          ShowNotesFunction(selectedCustomer?.notes)
                        }
                        className="flex items-center gap-1 text-black-600 hover:text-black-800 transition-colors duration-150"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{t("show")}</span>
                      </button>
                    </td>
                    <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                      <p className="text-gray-900 whitespace-no-wrap cursor-pointer">
                        {selectedCustomer.authorizerName}
                      </p>
                    </td>
                    <td className="px-1 py-5 border-b border-gray-200 bg-white text-sm">
                      {renderStatus(selectedCustomer.approvalStatus)}
                    </td>
                  </tr>
                )}
                {showAll === "all" &&
                  paginatedData.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                        <p
                          className="text-gray-900 whitespace-no-wrap cursor-pointer"
                          onClick={() => handleRowClick(customer)}
                        >
                          {customer.cardCode}
                        </p>
                      </td>
                      <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                        <p
                          className="text-gray-900 whitespace-no-wrap cursor-pointer"
                          onClick={() => handleRowClick(customer)}
                        >
                          {customer.cardName}
                        </p>
                      </td>
                      <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                        <p
                          className="text-gray-900 whitespace-no-wrap cursor-pointer"
                          onClick={() => handleRowClick(customer)}
                        >
                          {customer.customerGroupName}
                        </p>
                      </td>
                      <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm text-right sm:px-5">
                        <img
                          src={addIcon}
                          alt="Info"
                          className={`h-auto w-3 md:h-auto w-6 ${
                            isArabic ? "xl:mr-10" : "ml-10"
                          } cursor-pointer`}
                          onClick={() => handleInfoClick(customer)}
                        />
                      </td>
                      <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                        <button
                          onClick={() => ShowNotesFunction(customer?.notes)}
                          className="flex items-center gap-1 text-black-600 hover:text-black-800 transition-colors duration-150"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{t("show")}</span>
                        </button>
                      </td>
                      <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                        <p className="text-gray-900 whitespace-no-wrap cursor-pointer">
                          {customer.authorizerName}
                        </p>
                      </td>
                      <td className="px-1 py-5 border-b border-gray-200 bg-white text-sm">
                        {renderStatus(customer.approvalStatus)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {renderPagination}
        </div>

        <Footer />
      </div>
    </div>
  );
};

List.propTypes = {
  isArabic: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  selectedCustomer: PropTypes.object,
  showAll: PropTypes.string.isRequired,
  paginatedData: PropTypes.array.isRequired,
  handleRowClick: PropTypes.func.isRequired,
  handleInfoClick: PropTypes.func.isRequired,
  ShowNotesFunction: PropTypes.func.isRequired,
  renderStatus: PropTypes.func.isRequired,
  renderPagination: PropTypes.func,
  addIcon: PropTypes.string.isRequired,
};

export default List;
