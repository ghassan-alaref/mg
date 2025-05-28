import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Logo from "../Images/logo.png";
import NewCustomersIcon from "../Images/Vector.png";
import CollectionsIcon from "../Images/edit.png";
import LanguageIcon from "../Images/language.png";
import UserIcon from "../Images/user-square.png";
import Arrow from "../Images/next.png";
import { useTranslation } from "react-i18next";
import { useCustomerOptions } from "../Context/CustomerOptionsContext";
import { changeLanguage } from "../Language/languageUtils";
import { useAppContext } from "../Context/NewCustomerContext";
import { useAdminNewCustomerContext } from "../Context/AdminNewCustomerContext";
import { toast } from "react-toastify";
import { useCookies } from "react-cookie";
import api from "../UserPages/api";

const Sidebar = () => {
  const [cookies] = useCookies(["token"]);
  const token = cookies?.token?.token;
  const dbName = cookies?.token?.selectedCompany;
  const userCode = cookies?.token?.userCode;

  const { newCustomerNum, updateCustomerNum,setNewCustomerNum } = useAppContext();
  const {
    logoutAdminNewCustomer,
    setCustomerData,
    setCustomerDataModifications,
  } = useAdminNewCustomerContext();
  const [isLoading, setLoading] = useState(false);

  const location = useLocation();
  const isHomeRoute =
    location.pathname.startsWith("/admin-home") ||
    location.pathname.startsWith("/admin-customer-info") ||
    location.pathname.startsWith("/admin-customer-options");
  const isNewcustomers = location.pathname === "/admin-new-customers";
  const isCollectionsRoute = location.pathname === "/modificationsrequests";
  const { i18n, t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar toggle on mobile
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const { logoutCustomerOptions } = useCustomerOptions();

  const handleNavClick = () => {

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
        setNewCustomerNum(response?.data.results.length);
        console.log(
          response?.data.results,
          "Admin New Customer inside if side navbar Pageee"
        );
        setCustomerData(response?.data.results);
      } catch (error) {
        console.error("Fetch customers error:", error);
        toast.error(
     `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCustomers();

    const fetchPendingCustomersUpdate = async () => {
      const url = `api/GetPendingCustomers`;
      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            userCode: userCode,
            type: "U",
          },
        });
        console.log(response.data, "setCustomerDataModifications");
        setCustomerDataModifications(response.data.results);
      } catch (error) {
        toast.error(
     `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch Update customers error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingCustomersUpdate();

    logoutAdminNewCustomer(); // Call the logout function
    console.log("Logout triggered, currentPage reset."); // For debugging
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const handleLanguageChange = (lng) => {
    changeLanguage(lng);
    setIsLanguageDropdownOpen(false);
  };

  const direction = i18n.language === "ar" ? "rtl" : "ltr";

  return (
    <div className="flex md:min-h-screen" dir={direction}>
      {/* <div className={`p-4 md:hidden ${isSidebarOpen ? 'absolute z-50 top-0 right-0' : ''}`}>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="flex items-center justify-center w-8 h-8 mt-4">
                    <img src={MenuIcon} alt="Menu" className="h-6 w-6" />
                </button>
            </div> */}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
        <nav className="flex justify-around text-center">
          {/* Home Tab */}
          <NavLink
            to="/admin-home"
            className="flex flex-col items-center py-3 w-full"
            onClick={handleNavClick}
          >
            <img src={UserIcon} alt="Home" className="h-6 mb-1" />
            <p className="font-semibold" style={{ fontSize: "0.55rem" }}>
              {t("customers")}
            </p>
          </NavLink>

          {/* Search Tab */}
          <NavLink
            to="/admin-new-customers"
            className="flex flex-col items-center py-3 w-full"
            onClick={handleNavClick}
          >
            <img src={NewCustomersIcon} alt="Search" className="h-6 mb-1" />
            <p className="font-semibold" style={{ fontSize: "0.55rem" }}>
              {t("newCustomers")}
            </p>
          </NavLink>

          {/* Profile Tab */}
          <NavLink
            to="/modificationsrequests"
            className="flex flex-col items-center py-3 w-full"
            onClick={handleNavClick}
          >
            <img src={CollectionsIcon} alt="Profile" className="h-6 mb-1" />
            <p className="font-semibold" style={{ fontSize: "0.55rem" }}>
              {t("modificationRequests")}
            </p>
          </NavLink>

          {/* Settings Tab */}
          <div
            className="relative flex flex-col items-center py-3 w-full"
            onClick={toggleLanguageDropdown}
          >
            <img src={LanguageIcon} alt="Language" className="h-6 mb-1" />
            <p className="font-semibold" style={{ fontSize: "0.55rem" }}>
              {t("language")}
            </p>

            {/* Language Dropdown Menu */}
            {isLanguageDropdownOpen && (
              <div
                className={`absolute bottom-8  mb-14 w-full bg-white shadow-md rounded-lg py-1 z-10 ${
                  i18n.language === "ar" ? "ml-3 md:ml-0" : "mr-3 md:mr-0"
                }`}
              >
                <ul>
                  {/* Click handler to change language to English */}
                  <li
                    className="text-xs px-0 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleLanguageChange("en")}
                  >
                    English
                  </li>
                  {/* Click handler to change language to Arabic */}
                  <li
                    className="text-xs px-0 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleLanguageChange("ar")}
                  >
                    العربية
                  </li>
                </ul>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-white p-5 flex flex-col justify-between ${
          isSidebarOpen ? "fixed inset-0 z-40 overflow-y-auto" : "hidden"
        } md:flex md:relative md:w-60 lg:w-72`}
      >
        {/* Ensuring the sidebar content is scrollable on mobile devices if it overflows */}
        <div>
          {/* Logo */}
          <Link
            to="/admin-home"
            className="flex justify-center items-center"
            onClick={logoutCustomerOptions}
          >
            <img src={Logo} alt="Logo" className="h-12 mb-10" />
          </Link>

          {/* Navigation */}
          <nav>
            {/* NavLink for "Customers" */}
            <NavLink
              to="/admin-home"
              className={`flex p-0 md:p-3 items-center w-1/2 md:w-full pl-4 py-3 mt-3 transition duration-200 ease-in-out transform hover:translate-x-1 hover:bg-blue-100 rounded-md ${
                isHomeRoute ? "bg-[#272C6F]" : ""
              }`}
              onClick={logoutCustomerOptions}
            >
              <img src={UserIcon} alt="Customers" className="h-5 md:h-6 mr-3" />
              <div className="flex flex-row justify-between items-center w-72 md:w-full">
                <p
                  className={`text-center text-xs  font-semibold ${
                    i18n.language === "ar" ? "mr-5" : ""
                  }`}
                  style={{ color: isHomeRoute ? "#FFFFFF" : "#489AB9" }}
                >
                  {t("customers")}
                </p>

                <img
                  src={Arrow}
                  className={`w-3 h-auto md:w-4 h-auto mt-1 ${
                    i18n.language === "ar"
                      ? "rotate-180"
                      : "mr-2 md:-mr-2 lg:mr-2"
                  }`}
                />
              </div>
            </NavLink>
            {/* Additional NavLinks follow a similar pattern */}
            <NavLink
              to="/admin-new-customers"
              className={`flex p-0 md:p-3 items-center  w-1/2 md:w-full pl-4 py-3 mt-3 transition duration-200 ease-in-out transform hover:translate-x-1 hover:bg-blue-100 rounded-md ${
                isNewcustomers ? "bg-[#272C6F]" : ""
              }`}
              onClick={logoutCustomerOptions}
            >
              <img
                src={NewCustomersIcon}
                alt="Admin New Customers"
                className="h-5 md:h-6 mr-3"
              />
              <div className="flex flex-row justify-between items-center  w-72 md:w-full">
                <p
                  className={`text-center text-xs font-semibold ${
                    i18n.language === "ar" ? "mr-5" : ""
                  }`}
                  style={{ color: isNewcustomers ? "#FFFFFF" : "#489AB9" }}
                >
                  {t("newCustomers")}
                </p>
                <div className="flex flex-row justify-between items-center gap-1">
                  <div className="bg-[#A70909] rounded-full  flex items-center justify-center w-6 h-6">
                    <p className="text-white text-xs">{newCustomerNum}</p>
                  </div>
                  <img
                    src={Arrow}
                    className={`w-3 h-auto md:w-4 h-auto mt-1 ${
                      i18n.language === "ar"
                        ? "rotate-180"
                        : "mr-2 md:-mr-2 lg:mr-2"
                    }`}
                  />
                </div>
              </div>
            </NavLink>
            <NavLink
              to="/modificationsrequests"
              className={`flex p-0 md:p-3  items-center w-1/2 md:w-full pl-4 py-3 mt-3 transition duration-200 ease-in-out transform hover:translate-x-1 hover:bg-blue-100 rounded-md  ${
                isCollectionsRoute ? "bg-[#272C6F]" : ""
              }`}
              onClick={logoutCustomerOptions}
            >
              <img
                src={CollectionsIcon}
                alt="Collections"
                className="h-5 md:h-6  mr-3"
              />
              <div className="flex flex-row justify-between items-center  w-72 md:w-full ">
                <p
                  className={`text-center text-xs font-semibold ${
                    i18n.language === "ar"
                      ? "mr-5"
                      : "text-xs  md:text-[0.6rem] lg:text-xs "
                  }`}
                  style={{ color: isCollectionsRoute ? "#FFFFFF" : "#489AB9" }}
                >
                  {t("modificationRequests")}
                </p>
                <div className="flex flex-row justify-between items-center gap-1">
                  <div className="bg-[#A70909] rounded-full  flex items-center justify-center w-6 h-6">
                    <p className="text-white text-xs">{updateCustomerNum}</p>
                  </div>
                  <img
                    src={Arrow}
                    className={`w-3 h-auto md:w-4 h-auto mt-1 ${
                      i18n.language === "ar"
                        ? "rotate-180"
                        : "mr-2 md:-mr-2 lg:mr-2"
                    }`}
                  />
                </div>
              </div>
            </NavLink>
            <div
              className={`flex p-0 md:p-3 items-center w-1/2 md:w-full pl-4 py-3 mt-3  transition duration-200 ease-in-out transform hover:translate-x-1 hover:bg-blue-100 rounded-md ${
                isLanguageDropdownOpen ? "bg-[#272C6F]" : "bg-transparent"
              } cursor-pointer`}
              onClick={toggleLanguageDropdown}
            >
              <img
                src={LanguageIcon}
                alt="Language"
                className="h-5 md:h-6 mr-3"
              />
              <div className="flex flex-row justify-between items-center w-72 md:w-full">
                <p
                  className={`text-center text-xs font-semibold ${
                    i18n.language === "ar" ? "mr-5" : ""
                  }`}
                  style={{
                    color: isLanguageDropdownOpen ? "#FFFFFF" : "#489AB9",
                  }}
                >
                  {t("language")}
                </p>
                <img
                  src={Arrow}
                  className={`w-3 h-auto md:w-4 h-auto mt-1 ${
                    i18n.language === "ar"
                      ? "rotate-180"
                      : "mr-2 md:-mr-2 lg:mr-2"
                  }`}
                />
              </div>
            </div>

            {/* Language Dropdown Menu */}
            {isLanguageDropdownOpen && (
              <div className="absolute mt-3 w-48 bg-white shadow-md rounded-lg py-1">
                <ul>
                  {/* Click handler to change language to English */}
                  <li
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleLanguageChange("en")}
                  >
                    English
                  </li>
                  {/* Click handler to change language to Arabic */}
                  <li
                    className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => handleLanguageChange("ar")}
                  >
                    العربية
                  </li>
                </ul>
              </div>
            )}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center mb-10">
          <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-300 mr-3">
            {/* Placeholder for user icon, potentially an <img> or an icon component */}
          </div>
          <span
            className={`text-sm font-semibold ${
              i18n.language === "ar" ? "mr-5" : ""
            }`}
          >
            {t("userProfile")}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-grow ${isSidebarOpen ? "hidden" : ""}`}>
        {/* Your main content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;
