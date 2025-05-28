import React, { useState, useEffect } from "react";
import { DatePicker, ConfigProvider } from "antd";
import { useLocation } from "react-router-dom";
import enUS from "antd/lib/locale/en_US";
import arEG from "antd/lib/locale/ar_EG";
import { useTranslation } from "react-i18next";
import Sidebar from "../Component/Sidebar";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import Notifications from "../Component/Notifications";
import { useCookies } from "react-cookie";
import { Loader } from "../Component/Loader";
import { useCollectionContext } from "../Context/CollectionProvider";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import api from "./api";
import { formatNumber } from "./CustomerOptions";


const Collections = () => {
  const [cookies] = useCookies(["token"]);
  const dbName = cookies.token?.selectedCompany;
  const token = cookies.token?.token;

  const {
    dates,
    setDates,
    paymentMethod,
    setPaymentMethod,
    selectedBranch,
    setSelectedBranch,
    selectedMainBox,
    setSelectedMainBox,
    selectedSalesEmployee,
    setSelectedSalesEmployee,
  } = useCollectionContext();

  const { t, i18n } = useTranslation();
  //const [dates, setDates] = useState({ startDate: null, endDate: null }); //tt
  const locale = i18n.language === "ar" ? arEG : enUS;
  const [showNotifications, setShowNotifications] = useState(false);
  const [mainBoxes, setMainBoxes] = useState([]);
  const [branches, setBranches] = useState([]);
  const [salesEmployees, setSalesEmployees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  useEffect(() => {
    if (!dbName || !token) {
      console.error("Missing dbName or token");
      return;
    }

    const fetchMainBoxes = async () => {
      try {
        const response = await api.get(`api/GetMainBoxes`, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            paymentMethod: paymentMethod,
          },
        });

        if (response.data.status === "Success") {
          setMainBoxes(response.data.results);
        } else {
          console.error("Failed to fetch main boxes");
        }
      } catch (error) {
        console.error("Response data main boxes:", error?.response?.data);
      }
    };

    fetchMainBoxes();
  }, [dbName, token, paymentMethod]);


console.log(documents, "documents");


  let datesfromLocalStorge;
  useEffect(() => {
    datesfromLocalStorge = localStorage.getItem("dates");
  }, [dates]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await api.get(`api/GetBranches`, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
          },
        });

        if (response.data.status === "Success") {
          setBranches(response.data.results);
        } else {
          console.error("Failed to fetch branches");
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        console.error("Response data branches:", error?.response?.data);
      }
    };

    fetchBranches();
  }, [dbName, token]);

  useEffect(() => {
    setDates((prevDates) => ({
      startDate: prevDates.startDate || dates.startDate,
      endDate: prevDates.endDate || dates.endDate,
    }));
    setPaymentMethod(paymentMethod);
    setSelectedBranch(selectedBranch);
    setSelectedMainBox(selectedMainBox);
    setSelectedSalesEmployee(selectedSalesEmployee);
  }, []);

  useEffect(() => {
    const fetchSalesEmployees = async () => {
      try {
        const response = await api.get(`api/GetSalesEmployee`, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
          },
        });

        if (response.data.status === "Success") {
          setSalesEmployees(response.data.results);
        } else {
          console.error("Failed to fetch sales employees");
        }
      } catch (error) {
        console.error("Error fetching sales employees:", error);
        console.error("Response data sales employees:", error?.response?.data);
      }
    };

    fetchSalesEmployees();
  }, [dbName, token]);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const startDate = new Date(dates.startDate);
        const endDate = new Date(dates.endDate);

        const formattedStartDate = `${startDate.getFullYear()}-${(
          startDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${startDate
          .getDate()
          .toString()
          .padStart(2, "0")}`;
        const formattedEndDate = `${endDate.getFullYear()}-${(
          endDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}`;
        const response = await api.get(`api/GetDocuments`, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            paymentMethod: paymentMethod,
            mainBox: selectedMainBox,
            dateFrom: formattedStartDate,
            dateTo: formattedEndDate,
            userID: selectedSalesEmployee,
            branchId: selectedBranch,

          },
        });

        if (response.data.status === "Success") {
          setDocuments(response.data.results);
        } else {
          console.error("Failed to fetch documents");
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
        console.error("Response data documents:", error?.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [
    dbName,
    token,
    paymentMethod,
    dates.startDate,
    dates.endDate,
    selectedSalesEmployee,
    selectedMainBox,
    selectedBranch,
  ]);

  const handleCollectClick = async () => {
    // Filter selected documents
    const selectedDocs = documents.filter((doc) => doc.selected);

    // Check if any documents are selected
    if (selectedDocs.length === 0) {
      toast.error("Please select a document.");
      return;
    }

    // Prepare data for API request
    const collectionData = {
      dateFrom: dates.startDate,
      dateTo: dates.endDate,
      paymentMethod: paymentMethod,
      mainBox: selectedMainBox,
      branchId: selectedBranch,
    //  branchId: cookies.token?.branchId,
      salesEmployeeId: selectedSalesEmployee,
      collectionLine: selectedDocs.map((doc) => ({
        docEntry: doc.docEntry,
        docTotal: doc.docTotal,
        account: doc.account,
        checkNum: doc.checkNum || "",
        checkSum: doc.checkSum || "",
        bankCode: doc.bankCode || "",
      })),
    };

    try {
      setLoading(true);
      // Make POST request to API endpoint
      const response = await api.post(
        `api/AddCollection`,
        collectionData,
        {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
          },
        }
      );

      // Handle successful response
      if (response.data.status === "Success") {
        // Display success message

        toast.success(t("CollectionMessage"));

        // Clear all data
        setDates({ startDate: null, endDate: null });
        setPaymentMethod("");
        setSelectedMainBox("");
        setSelectedBranch("");
        setSelectedSalesEmployee("");
        setDocuments([]);

        // Optionally, you can handle additional success actions here
      } else {
        console.error("Failed to add collection.");
      }
    } catch (error) {
      // Handle error
      console.error("Error adding collection:", error);
      console.error("Response data adding collection:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentSelect = (e, doc) => {
    const { checked } = e.target;
    setDocuments((prevDocs) => {
      return prevDocs.map((d) => {
        if (d.docEntry === doc.docEntry) {
          return { ...d, selected: checked };
        }
        return d;
      });
    });
  };

  return (
    <ConfigProvider locale={locale}>
      <div
        className={`bg-[#FAFAFF] min-h-screen flex ${
          i18n.dir() === "rtl" ? "flex-row-reverse" : ""
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header onNotificationsClick={toggleNotifications} />
          {showNotifications ? (
            <Notifications />
          ) : (
            <main
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
              className="md:bg-white p-4 sm:m-5 sm:p-5 md:m-10 xl:m-12 mt-5 rounded-xl w-[23rem] md:w-5/6 xl:w-11/12"
              style={{ height: "100%" }}
            >
              <h2 className="text-2xl font-bold mb-4">{t("Collections")}</h2>

              <div className="flex flex-col md:grid grid-cols-4 gap-4 mb-8">
                <div>
                  <label
                    htmlFor="fromDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("From")}
                  </label>
                  <DatePicker
                    value={dates.startDate ? dayjs(dates.startDate) : null}
                    onChange={(date) => setDates({ ...dates, startDate: date })}
                  />
                </div>
                <div>
                  <label
                    htmlFor="toDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    {t("To")}
                  </label>
                  <DatePicker
                    value={dates.endDate ? dayjs(dates.endDate) : null}
                    onChange={(date) => setDates({ ...dates, endDate: date })}
                  />
                </div>
              </div>

              <div className="mb-2 md:mb-4">
                <label
                  htmlFor="cashChecks"
                  className="block text-sm font-medium text-gray-700 "
                >
                  {t("CashChecks")}
                </label>
                <select
                  id="cashChecks"
                  value={paymentMethod}
                  name="cashChecks"
                  className="bg-white mt-1 md:mt-3 block py-1 md:py-2 pl-2 w-3/4 xl:w-1/3 rounded-md border shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="">{t("Select Payment Method")}</option>
                  <option value="Cash">{t("Cash")}</option>
                  <option value="Check">{t("Check")}</option>
                  <option value="CreditCard">{t("CreditCard")}</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="mainBox"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("MainBox")}
                </label>
                <select
                  id="mainBox"
                  value={selectedMainBox}
                  name="mainBox"
                  className="bg-white mt-1 md:mt-3 block py-1 md:py-2 pl-2 w-3/4 xl:w-1/3 rounded-md border shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
                  onChange={(e) => setSelectedMainBox(e.target.value)} // Add this line
                >
                  <option hidden>Select an option</option>
                  {mainBoxes.map((box, index) => (
                    <option key={index} value={box.mainBox}>
                      {box.mainBox}
                    </option>
                  ))}
                </select>
              </div>


     <div className="mb-4">
                <label
                  htmlFor="branch"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("Branch")}
                </label>
                <select
                  id="branch"
                  value={selectedBranch}
                  name="branch"
                  className="bg-white mt-1 md:mt-3 block py-1 md:py-2 pl-2 w-3/4 xl:w-1/3 rounded-md border shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
                  onChange={(e) => setSelectedBranch(e.target.value)} // Add this line
                >
                  <option value="" disabled selected>
                    Select an option
                  </option>
                  {branches.map((branch) => (
                    <option key={branch.branchCode} value={branch.branchCode}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>

         

              <div className="mb-4">
                <label
                  htmlFor="salesEmployee"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t("SalesEmployee")}
                </label>
                <select
                  id="salesEmployee"
                  name="salesEmployee"
                  value={selectedSalesEmployee}
                  className="bg-white mt-1 md:mt-3 block py-1 md:py-2 pl-2 w-3/4 xl:w-1/3 rounded-md border shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
                  onChange={(e) => setSelectedSalesEmployee(e.target.value)} // Add this line
                >
                  <option hidden>Select an option</option>
                  {salesEmployees.map((employee) => (
                    <option key={employee.userID} value={employee.userID}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Display fetched documents */}
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                  <h3 className="text-lg font-semibold mb-3 mt-10">
                    {t("Documents")}
                  </h3>
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : documents.length === 0 ? (
                    <div>{t("No documents found.")}</div>
                  ) : (
                    <div className="overflow-x-auto ">
                      <table className="min-w-full  divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                              {t("Select")}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                              {t("Document Number")}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                              {t("Document Date")}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                              {t("Sales Employee")}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                              {t("Account")}
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                              {t("Document Total")}
                            </th>
                            {paymentMethod === "Check" && (
                              <>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                  {t("checkNum")}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                  {t("bankCode")}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                                  {t("dueDate")}
                                </th>
                              </>
                            )}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {documents.map((doc) => (
                            <tr key={doc.docEntry}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <input
                                  type="checkbox"
                                  className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                  value={doc.docEntry}
                                  onChange={(e) => handleDocumentSelect(e, doc)}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                {doc.docNum}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                {new Date(doc.docDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                {doc.salesEmployee}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                {doc.account}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                {doc.docTotal ? formatNumber(doc.docTotal) : formatNumber(doc.checkSum)}
                              </td>
                              {paymentMethod === "Check" && (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    {doc.checkNum}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    {doc.bankCode}
                                  </td>{" "}
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    {new Date(doc.dueDate).toLocaleDateString()}
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mb-5 mt-16">
                <button
                  type="button"
                  style={{ backgroundColor: "#272C6F" }}
                  className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                  onClick={handleCollectClick} // Add this line
                >
                  {t("Collect")}
                </button>
              </div>
            </main>
          )}
          <Footer />
        </div>
        {isLoading && <Loader />}
      </div>
    </ConfigProvider>
  );
};

export default Collections;
