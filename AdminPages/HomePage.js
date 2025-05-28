import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SearchIcon from "../Images/search.png";
import Sidebar from "../Component/AdminSidebar";
import Header from "../Component/AdminHeader";
import Footer from "../Component/Footer";
import ArrowIcon from "../Images/left.png";
import add from "../Images/add.png";
import CloseIcon from "../Images/close.png";
import clipboard from "../Images/clipboard.png";
import calendar from "../Images/calendar.png";
import api from "../UserPages/api"
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { Loader } from "../Component/Loader";
import { useAppContext } from "../Context/NewCustomerContext";
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
      className="flex flex-col md:bg-white p-2  ml-5 md:ml-10 xl:ml-12 mt-5  rounded-xl w-[21rem] md:w-5/6 xl:w-11/12"
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
  console.log(cookies.token, "cookies tooken");
  const [searchValue, setSearchValue] = useState("");
  const userCode = cookies.token?.userCode;
  const [customerData, setCustomerData] = useState([]);
  const { setUpdateCustomerNum } = useAppContext();

  const [customers, setCustomers] = useState([]);
  const [dbName, setDbName] = useState(
    cookies.token?.selectedCompany || localStorage.getItem("dbName") || ""
  );
  const [token, setToken] = useState(
    cookies.token?.token || localStorage.getItem("token") || ""
  );

  // Use dbName and token as needed in your HomePage component
  const [isLoading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(customers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomerData, setSelectedCustomerData] = useState();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const totalPages = Math.ceil(filteredData.length / pageSize);

  const navigate = useNavigate();

  useEffect(() => {
    if (dbName && token) {
      localStorage.setItem("dbName", dbName);
      localStorage.setItem("token", token);
    }
  }, [dbName, token]);

  useEffect(() => {
    const storedDbName = localStorage.getItem("dbName");
    const storedToken = localStorage.getItem("token");

    if (!dbName && storedDbName) {
      setDbName(storedDbName);
    }

    if (!token && storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleInfoClick = (customer) => {
    console.log(customer, "clicked customer");

    const fetcCustomers = async () => {
      const url = `api/GetCustomers`;
      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            customerCode: customer.cardCode,
          },
        });
        setSelectedCustomerData(response.data.results[0]);
        localStorage.setItem(
          "adminCustomerInfoHome",
          JSON.stringify(response.data.results[0])
        );
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch customers error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetcCustomers();

    const statusMapping = {
      R: "Rejected",
      P: "Pending",
      A: "Approved",
    };
    const customerData = {
      status: statusMapping[customer.approvalStatus],
      dbName,
      token,
      cardCode: customer.cardCode,
      cardName: customer.cardName,
      foreignName: customer.foreignName,
      customerGroup: customer.customerGroup,
      nationalId: customer.nationalId,
      address: customer.address,
      phoneNo: customer.phoneNo,
      fax: customer.fax,
      email: customer.email,
      primaryAccountManager: customer.primaryAccountManager,
      secondaryAccountManager: customer.secondaryAccountManager,
      concreteVap: customer.concreteVap,
      companyOrIndividual: customer.companyOrIndividual,
      companyTaxNumber: customer.companyTaxNumber,
      companyRegistration: customer.companyRegistration,
      parentCustomer: customer.parentCustomer,
      creditLimit: customer.creditLimit,
      commetimentLimit: customer.commetimentLimit,
      paymentTerms: customer.paymentTerms,
      paymentMethod: customer.paymentMethod,
      isExempt: customer.isExempt,
      taxExemptedGroup: customer.taxExemptedGroup,
      taxExemptedQty: customer.taxExemptedQty,
      exemptionPeriod: customer.exemptionPeriod,
      discount: customer.discount,
      discountReason: customer.discountReason,
      extraCharges: customer.extraCharges,
      extraChargesReason: customer.extraChargesReason,
      exemptionTypeName: customer.exemptionTypeName,
      hasFather: customer.hasFather,
      parentCustomer: customer.parentCustomer,
      parentCustomerName: customer.parentCustomerName,
      property1: customer.property1,
      property2: customer.property2,
      property3: customer.property3,
      property4: customer.property4,
      property5: customer.property5,
      property6: customer.property6,

      army: customer.army,
      church: customer.church,
      commercialBuilding: customer.commercialBuilding,
      electricityTransmissionGrids: customer.electricityTransmissionGrids,
      farm: customer.farm,
      fuelStation: customer.fuelStation,
      governmental: customer.governmental,
      hangar: customer.hangar,
      highRisk: customer.highRisk,
      hospitals: customer.hospitals,
      hotels: customer.hotels,
      house: customer.house,
      housing: customer.housing,
      industrial: customer.industrial,
      infrastructure: customer.infrastructure,
      lowRisk: customer.lowRisk,
      mediumRisk: customer.mediumRisk,
      mosque: customer.mosque,
      pipelines: customer.pipelines,
      port: customer.port,
      residential: customer.residential,
      road: customer.road,
      schools: customer.schools,
      store: customer.store,
      university: customer.university,
      villa: customer.villa,
      waterDesalinationPlant: customer.waterDesalinationPlant,
      wwtp: customer.wwtp,
    };

    navigate(`/admin-customer-infomation`, { state: { ...customerData } });
  };

  const handleRowClick = (customer) => {
    console.log(customer, "customeerrrrrrrrrr");

    const fetcCustomers = async () => {
      const url = `api/GetCustomers`;
      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            customerCode: customer.cardCode,
            hasFather: customer.hasFather,
            parentCustomer: customer.parentCustomer,
          },
        });
        setSelectedCustomerData(response.data.results[0]);
        console.log(response.data.results[0], "iiiiiiiiiiiiiuuuuuuuuuu");
        
        localStorage.setItem(
          "adminCustomerInfoHome",
          JSON.stringify(response.data.results[0])
        );
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch customers error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetcCustomers();

    if (customer.approvalStatus === "A") {
      navigate(`/admin-customer-options`);
    }
  };


    async function handleSearch(searchValue) {
       if (searchValue !== "") {
        const url = `api/GetCustomers?filter=${searchValue}`;
        try {
          setLoading(true);
          console.log("Fetching customers with headers:", {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
          });

          const response = await api.get(url, {
            headers: {
              "Content-Type": "application/json",
              dbName: dbName,
              token: token,
            },
          });

          const fetchedCustomers = response?.data?.results;

          if (fetchedCustomers.length === 0) {
            toast.error(
              `No matches found. Please try a different search term.`
            );
            return;
          }

          // Directly filter the fetched customers
          const filtered = fetchedCustomers.filter((customer) => {
            const searchLower = searchValue.toLowerCase();

            return (
              (customer.cardName &&
                customer.cardName.toLowerCase().includes(searchLower)) ||
              (customer.cardCode &&
                customer.cardCode.toLowerCase().includes(searchLower))
            );
          });

          setCustomers(fetchedCustomers);
          setFilteredData(filtered);
          setSearchTerm(searchValue);
          setCurrentPage(1);
        } catch (error) {
          toast.error(
            `Error occurred while fetching customers data: ${error?.response?.data.errorMessage}`
          );
          console.error("Fetch customers error:", error);
        } finally {
          setLoading(false);
        }

    } else {
      setFilteredData("");
      setSearchTerm("");
    }
    }

   

useEffect(() => {
  if(searchValue === ""){
    setSearchValue("");
    setSelectedCustomer(null);
    setSearchTerm("");
    setFilteredData(customers);
  }
 }, [searchValue]);

  //this one
  useEffect(() => {
    const fetchPendingCustomers = async () => {
      const url = `api/GetPendingCustomers`;
      try {
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            userCode: userCode,
            type: "U",
          },
        });
        console.log(response.data, "Admin Update Customer inside if ");
        setCustomerData(response.data.results);
        let newdata = response?.data.results.filter(
          (customr) => customr.status === "P"
        );

        if (newdata && newdata.length > 0) {
          setUpdateCustomerNum(newdata.length);
        } else {
          setUpdateCustomerNum(0);
        }
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch Update customers error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCustomers();
  }, [token, dbName, userCode]);

  const handleCustomerClick = (customer) => {
    if (customer === "empty") {
      setShowAll("all");
      setSelectedCustomer(customer);
    } else {
      setShowAll("onlyOne");
      setFilteredData(customers);
      setSelectedCustomer(customer);
      setCurrentPage(1);
    }
    {
      /*
        if (customer) {
      setSelectedCustomer(customer);
    } else {
      // For seeAllResults, set the state to include all customers
      setFilteredData(customers);
      setCurrentPage(1);
    } 
      */
    }
  };

  const handleBackToSearch = () => {
    setSearchValue("");
    setSelectedCustomer(null);
    setSearchTerm("");
    setFilteredData(customers);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  console.log(paginatedData, "test test");

  const renderStatus = (approvalStatus) => {
    const statusMapping = {
      A: "Approved",
      R: "Rejected",
      P: "Pending",
    };

    const status = statusMapping[approvalStatus] || "Unknown";

    const statusClasses = {
      Approved: "bg-green-500 text-white",
      Rejected: "bg-red-500 text-white",
      Pending: "bg-blue-500 text-white",
      Unknown: "bg-gray-500 text-white",
    };

    const translatedStatus = t(status.toLowerCase());

    return (
      <span
        style={{ width: "120px" }}
        className={`px-4 py-1 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-md ${statusClasses[status]}`}
      >
        {translatedStatus}
      </span>
    );
  };

  const handleFilterChange = (e) => {
    const statusMapping = {
      All: null,
      Approved: "A",
      Rejected: "R",
      Pending: "P",
    };

    const status = statusMapping[e.target.value];

    if (status === null) {
      setFilteredData(customers);
    } else {
      const filtered = customers.filter(
        (customer) => customer.approvalStatus === status
      );
      setFilteredData(filtered);
    }

    setCurrentPage(1); // Reset to the first page when filter changes
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
          {!selectedCustomer ? (
            <>
              <h1
                className={`text-md md:text-xl xl:text-2xl font-bold text-black mb-6 ${
                  isArabic ? "text-right" : "text-left"
                }`}
              >
                {t("welcomeBack")}
              </h1>
              {/* Rest of your search view code */}
            </>
          ) : (
            <>
              <div
                dir={i18n.language === "ar" ? "rtl" : "ltr"}
                className="flex flex-row md:justify-between items-center"
              >
                <div className="flex flex-row mr-0 md:mr-0  items-center">
                  <img
                    src={ArrowIcon}
                    alt="Back"
                    className={`h-5 w-3 md:h-auto w-6 ${
                      isArabic ? "transform rotate-180" : ""
                    } cursor-pointer ${isArabic ? "ml-0 md:ml-0" : ""}`}
                    onClick={handleBackToSearch}
                  />
                  <h1
                    className={`text-md md:text-xl  xl:text-2xl font-bold text-black  ${
                      isArabic ? "ml-2 md:ml-0" : ""
                    }`}
                  >
                    {t("customers")}
                  </h1>
                </div>

                <div
                  className={`flex  items-center gap:0 md:gap-10  ${
                    isArabic ? "mr-10 md:mr-0" : "ml-10 md:ml-0"
                  }`}
                >
                  <div className="flex items-center bg-gray-200 rounded px-2 py-1">
                    <span className=" text-gray-700 mr-2">{t("sortBy")}</span>
                    <select
                      onChange={handleFilterChange}
                      className=" bg-transparent focus:outline-none "
                    >
                      <option value="All">{t("All")}</option>
                      <option value="Approved">{t("approved")}</option>
                      <option value="Rejected">{t("rejected")}</option>
                      <option value="Pending">{t("pending")}</option>
                    </select>
                  </div>
                  <button
                    className="focus:outline-none"
                    onClick={handleBackToSearch}
                  >
                    <img
                      src={CloseIcon}
                      alt="Clear"
                      className={`w-3 h-auto md:w-4 h-auto cursor-pointer ${
                        isArabic ? "mr-2 md:mr-0" : "ml-2 md:ml-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </>
          )}
          <div className="flex flex-col justify-center items-center w-full md:w-[26rem] lg:w-full xl:w-full">
            {!selectedCustomer ? (
              <>
                <p
                  className={`text-center text-xs md:text-sm text-gray-600 mt-10 md:mt-20  ${
                    isArabic ? "text-right " : "text-left "
                  }`}
                >
                  {t("easilyLocateCustomerInformation")}
                </p>
<div className="flex flex-col gap-10 justify-center items-center">
<div
                  className={`search-container relative max-w-md w-full px-4 sm:px-10 mt-5 ${
                    isArabic ? "text-right " : "text-left "
                  }`}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <img
                      src={SearchIcon}
                      alt="Search"
                      className={`h-5 w-5  text-gray-400 ${
                        isArabic ? "ml-64 md:ml-5" : "ml-4 md:ml-10"
                      }`}
                    />
                  </div>
                  <input
                    type="search"
                    className={`block w-52  md:w-96  py-2 border rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                      isArabic
                        ? "ml-20  md:-ml-5 pr-10 md:pr-4"
                        : "mr-10 md:mr-0 pl-10 md:pl-10"
                    }`}
                    placeholder={t("search")}
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    dir={i18n.language === "ar" ? "rtl" : "ltr"}
                  />
                  {searchTerm.length > 0 && (
                    <ul
                      className={`absolute z-10 top-full mt-1 w-52 md:w-96 bg-white shadow-lg rounded-xl border ${
                        isArabic ? "ml-20 md:-ml-5" : "mr-4 md:mr-10"
                      }`}
                    >
                      {filteredData.slice(0, 5).map((customer) => (
                        <li
                          key={customer.cardCode}
                          className="flex items-center pl-10 py-2 border-b last:border-b-0 cursor-pointer"
                          onClick={() => handleCustomerClick(customer)}
                        >
                          <img
                            src={SearchIcon}
                            alt="Search"
                            className="h-5 w-5 text-gray-400"
                          />
                          <span className="ml-5">{customer.cardName}</span>
                        </li>
                      ))}
                      <li
                        className="text-center py-2"
                        onClick={() => handleCustomerClick("empty")}
                      >
                        <a className="text-blue-500 hover:text-blue-700 cursor-pointer">
                          {t("seeAllResults")}
                        </a>
                      </li>
                    </ul>
                  )}
                </div>
                <button
                      type="button"
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={() => handleSearch(searchValue)}
                    >
                      {t("search")}
                    </button>
</div>
                
              </>
            ) : (
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
                      {showAll === "onlyOne" && (
                            <tr key={selectedCustomer.id}>
                              <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                                <p
                                  className="text-gray-900 whitespace-no-wrap cursor-pointer"
                                  onClick={() =>
                                    handleRowClick(selectedCustomer)
                                  }
                                >
                                  {selectedCustomer.cardCode}
                                </p>
                              </td>
                              <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                                <p
                                  className="text-gray-900 whitespace-no-wrap cursor-pointer"
                                  onClick={() =>
                                    handleRowClick(selectedCustomer)
                                  }
                                >
                                  {selectedCustomer.cardName}
                                </p>
                              </td>
                              <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                                <p
                                  className="text-gray-900 whitespace-no-wrap cursor-pointer"
                                  onClick={() =>
                                    handleRowClick(selectedCustomer)
                                  }
                                >
                                  {selectedCustomer.customerGroupName}
                                </p>
                              </td>
                              <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm text-right sm:px-5">
                                <img
                                  src={add}
                                  alt="Info"
                                  className={`h-auto w-3 md:h-auto w-6 ${
                                    isArabic ? "xl:mr-10" : "ml-10"
                                  } cursor-pointer`}
                                  onClick={() =>
                                    handleInfoClick(selectedCustomer)
                                  }
                                />
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
                                    src={add}
                                    alt="Info"
                                    className={`h-auto w-3 md:h-auto w-6 ${
                                      isArabic ? "xl:mr-10" : "ml-10"
                                    } cursor-pointer`}
                                    onClick={() => handleInfoClick(customer)}
                                  />
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

                  {renderPagination()}
                </div>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
      {isLoading && <Loader />}
    </div>
  );
};

export default HomePage;
