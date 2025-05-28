import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../Component/AdminSidebar";
import Header from "../Component/AdminHeader";
import Footer from "../Component/Footer";
import add from "../Images/add.png";
import clipboard from "../Images/clipboard.png";
import calendar from "../Images/calendar.png";
import { useCookies } from "react-cookie";
import api from "../UserPages/api";
import { Loader } from "../Component/Loader";
import { toast } from "react-toastify";
import { useAppContext } from "../Context/NewCustomerContext";
import { useAdminNewCustomerContext } from "../Context/AdminNewCustomerContext";
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const pageSize = 10;

const StepProgressBar = () => {
  const { t, i18n } = useTranslation();
  const now = new Date();
  const dateString = now.toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dayString = now.toLocaleDateString(i18n.language, { weekday: "long" });
  const { newCustomerNum, updateCustomerNum } = useAppContext();

  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="flex flex-col md:bg-white p-2  ml-5 md:ml-10 xl:ml-12 mt-5  rounded-xl w-[23rem] md:w-5/6 xl:w-11/12"
    >
      <div className="flex  flex-row justify-center items-center gap-10 md:gap-14 xl:gap-52 ">
        <div className="flex items-center   ">
          <div className="p-0 md:p-3 xl:p-6  md:bg-[#E6F2FF] rounded-full ">
            <img src={clipboard} alt="clipboard" className="h-8 w-8 " />
          </div>
          <div
            className={` ${
              i18n.language === "ar" ? "mr-2 xl:mr-8" : "ml-2 xl:ml-8"
            }`}
          >
            <div className="text-xs md:text-sm text-gray-500">
              {t("pendingTasks")}
            </div>
            <div className="text-sm md:text-xl font-semibold">
              {newCustomerNum + updateCustomerNum}
            </div>
          </div>
        </div>
        <div className="border-r border-gray-300 h-full"></div>

        <div className="flex items-center   ">
          <div className="p-0 md:p-3 xl:p-6 md:bg-[#E6F2FF] rounded-full">
            <img src={calendar} alt="calendar" className="h-8 w-8 " />
          </div>
          <div
            className={` ${
              i18n.language === "ar" ? "mr-2 xl:mr-8" : "ml-2 xl:ml-8"
            }`}
          >
            <div className="text-xs md:text-sm text-gray-500">{dateString}</div>
            <div className="text-sm md:text-xl font-semibold">{dayString}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const [cookies] = useCookies(["token"]);
  const { currentPage, setCurrentPage,  customerData, setCustomerData} = useAdminNewCustomerContext();
const {setNewCustomerNum} = useAppContext()


  const token = cookies.token?.token;
  const dbName = cookies.token?.selectedCompany;
  const userCode = cookies.token?.userCode;
  console.log(token, dbName, userCode);

  const [isLoading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const totalPages = Math.ceil(customerData.length / pageSize);


  useEffect(() => {
    const fetchPendingCustomers = async () => {
      const url = `api/GetPendingCustomers`;
      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            userCode: userCode,
            type: "A",
          },
        });

        const results = response?.data.results;
        console.log(results, "resultsresults");
        
        const countPStatus = results.reduce((count, item) => {
          return item.status === "P" ? count + 1 : count;
        }, 0);

        const pendingCustomers = results.filter(item => item.status === "P");

        setNewCustomerNum(countPStatus);
        setCustomerData(pendingCustomers);
      } catch (error) {
        console.error("Fetch customers error:", error);
        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCustomers();
  }, [dbName, token, userCode]);





  const navigate = useNavigate();

  const handleInfoClick = (customer) => {
    console.log(customer.customerCode, "inside on click");

    const fetcCustomers = async () => {
      const url = `api/GetCustomers`;
      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            customerCode: customer.customerCode,
          },
        });
        console.log(response.data.results, "Admin Customer info for specific customer");

        // Save data to local storage
        localStorage.setItem(
          "adminCustomerInfo",
          JSON.stringify(response.data.results)
        );

        // Navigate to new page with state
        navigate(`/admin-customer-info`, {
          state: { data: response.data.results },
        });
      } catch (error) {
        console.error("Fetch customers error:", error);

        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetcCustomers();
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const sortedData = customerData.sort((a, b) => {
    // Define the sorting order for statuses
    const statusOrder = { P: 1, A: 2, R: 3 };
  
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
 const paginatedData = sortedData
  ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  : [];


  const renderStatus = (status) => {
console.log(status, "PendingPendingPending");

    let newStatus;

    if (status === "P") {
      newStatus = "Pending";
    }
    if (status === "A") {
      newStatus = "Approved";
    }
    if (status === "R") {
      newStatus = "Rejected";
    }
    if (status === "N") {
      newStatus = "Unknown";
    }
    
    const statusClasses = {
      Pending: "bg-blue-500 text-white",
      Approved: "bg-green-500 text-white",
      Rejected: "bg-red-500 text-white",
    };

    // Use the translation function to translate the status
    const translatedStatus = t(newStatus.toLowerCase());

    return (
      <span
        style={{ width: "120px" }}
        className={`px-4 py-1 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-md ${statusClasses[newStatus]}`}
      >
        {translatedStatus}
      </span>
    );
  };

  const renderPagination = () => {
    let pages = [];

    // Adjust pages based on currentPage and totalPages
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }

    // Adjust visibility of page numbers based on currentPage
    if (totalPages > 4) {
      // If there are more than 4 total pages and the currentPage is greater than 4,
      // adjust the pages array to include the first page, ellipses ('...'), current page, and totalPages
      if (currentPage > 4 && currentPage < totalPages - 3) {
        pages = [
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        ];
      } else if (currentPage >= totalPages - 3) {
        // If currentPage is among the last 4 pages, show the last 5 pages including ellipses after the first page
        pages = [
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        ];
      } else {
        // For the first 4 pages, show the first 4 pages and the last page with ellipses before it
        pages = [1, 2, 3, 4, "...", totalPages];
      }
    }

    // Render the pagination buttons and ellipses
    return (
      <div className="flex justify-end p-5">
        {isLoading && <Loader />}
        <div className="flex rounded-md">
          <button
            onClick={() => handlePageClick(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="h-8 w-8 rounded-l-md bg-white text-gray-500 hover:bg-gray-100"
          >
            {"<"}
          </button>
          {pages.map((number, index) => (
            <React.Fragment key={index}>
              {number === "..." ? (
                <div className="h-8 w-8 flex justify-center items-center text-gray-500">
                  {number}
                </div>
              ) : (
                <button
                  onClick={() => handlePageClick(number)}
                  className={`h-8 w-8 ${
                    currentPage === number
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-500"
                  } hover:bg-gray-100 rounded-md`}
                >
                  {number}
                </button>
              )}
            </React.Fragment>
          ))}
          <button
            onClick={() =>
              handlePageClick(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="h-8 w-8 rounded-r-md bg-white text-gray-500 hover:bg-gray-100"
          >
            {">"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-[#FAFAFF]  min-h-screen flex ${
        i18n.dir() === "rtl" ? "flex-row-reverse" : ""
      }`}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />

        <StepProgressBar />

        <main
          className={`md:bg-white p-4 md:p-12 m-0  md:m-10 xl:m-12  rounded-xl w-[23rem] h-screen  md:w-5/6 xl:w-11/12 ${
            isArabic ? "ml-0 md:ml-10" : ""
          }`}
          style={{ height: "100%" }}
        >
          <>
            <div
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
              className="  items-center"
            >
              <h1
                className={`text-md md:text-xl  xl:text-2xl font-bold text-black  ${
                  isArabic ? "ml-2 md:ml-0" : ""
                }`}
              >
                {t("newCustomers")}
              </h1>
            </div>
          </>

          <div className="flex flex-col justify-center items-center w-full">
            <>
              <div className="container  " dir={isArabic ? "rtl" : "ltr"}>
                <div className="py-4  overflow-x-auto">
                  <table className="min-w-full leading-normal ">
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
                          {t("status")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((customer) => (
                        <tr key={customer.id}>
                          <td className="px-3  py-5 border-b border-gray-200 bg-white text-sm sm:px-5 ">
                            <p
                              className="text-gray-900 whitespace-no-wrap "
                              key={customer.id}
                            >
                              {customer.customerCode}
                            </p>
                          </td>
                          <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                            <p
                              className="text-gray-900 whitespace-no-wrap "
                              key={customer.id}
                            >
                              {customer.customerName}
                            </p>
                          </td>
                          <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                            <p
                              className="text-gray-900 whitespace-no-wrap "
                              key={customer.id}
                            >
                              {customer.customerGroup}
                            </p>
                          </td>
                          <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm text-right sm:px-5">
                            <img
                              src={add}
                              alt="Info"
                              className={`h-auto w-3 md:h-auto w-6 ${
                                isArabic ? "xl:mr-10" : "ml-10"
                              } cursor-pointer`}
                              onClick={() => handleInfoClick(customer)}
                            />
                          </td>
                          <td className="px-1 py-5 border-b border-gray-200 bg-white text-sm">
                            {renderStatus(customer.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {renderPagination()}
              </div>
            </>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
