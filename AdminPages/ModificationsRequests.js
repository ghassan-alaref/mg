import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../Component/AdminSidebar";
import Header from "../Component/AdminHeader";
import Footer from "../Component/Footer";
import add from "../Images/add.png";
import clipboard from "../Images/clipboard.png";
import calendar from "../Images/calendar.png";
import CloseIcon from "../Images/close.png";
import { useCookies } from "react-cookie";
import api from "../UserPages/api"
import { ToastContainer, toast } from "react-toastify";
import { Loader } from "../Component/Loader";
import { useAppContext } from "../Context/NewCustomerContext";
import AppContext from "antd/es/app/context";
import { formatNumber } from "../UserPages/CustomerOptions";
import TableComponent from "../Component/TableComponent";
import { useAdminNewCustomerContext } from "../Context/AdminNewCustomerContext";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const pageSize = 8;

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

const InputField = ({ label, value, readOnly }) => (
  <div className="flex flex-col space-y-2 mt-5">
    <label className="text-sm">{label}</label>
    <input
      type="text"
      value={value}
      readOnly={readOnly}
      disabled={readOnly} // Disables the input
      className={`p-2 w-3/4 xl:w-1/2 border rounded-xl 
        ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`} // Applies styles if read-only
    />
  </div>
);

const HomePage = () => {
  const [cookies] = useCookies(["token"]);
  const [isLoading, setLoading] = useState(false);
  const { customerDataModifications, setCustomerDataModifications } =
    useAdminNewCustomerContext();

  const token = cookies.token?.token;
  const dbName = cookies.token?.selectedCompany;
  const userCode = cookies.token?.userCode;
  console.log(token, dbName, userCode);

  // const { customerData, setCustomerData } = useAppContext();
  // const [customerData, setCustomerData] = useState([])

  const [currentPage, setCurrentPage] = useState(1);
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const totalPages = Math.ceil(customerDataModifications.length / pageSize);
  const [isTableOpen, setIsTableOpen] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [serviceTables, setServiceTables] = useState([{}]);
  const [isServiceDeleteConfirmVisible, setIsServiceDeleteConfirmVisible] =
    useState(false);
  const [isCategoryDeleteConfirmVisible, setIsCategoryDeleteConfirmVisible] =
    useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleReject, setIsModalVisibleReject] = useState(false);
  const [CategoryTables, setCategoryTables] = useState([{}]);
  const [customerName, setCustomerName] = useState("");
  const navigate = useNavigate();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [acceptReason, setAcceptReason] = useState("");

  const [fileType, setFileType] = useState("");
  const [reason, setReason] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModalVisibleWarning, setIsModalVisibleWarning] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedCustomerInfo, setSelectedCustomerInfo] = useState({});
  const [getGuid, setGetGuid] = useState("");
  const [getOldCustomeData, setGetOldCustomeData] = useState([]);
  const { setUpdateCustomerNum } = useAppContext();

  console.log(getOldCustomeData[0], "old data");


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
            type: "U",
          },
        });

        const results = response?.data.results;
        console.log(results, "rrrrryryryr");
        
        const countPStatus = results.reduce((count, item) => {
          return item.status === "P" ? count + 1 : count;
        }, 0);

        const pendingCustomers = results.filter((item) => item.status === "P");

        setUpdateCustomerNum(countPStatus);
        setCustomerDataModifications(pendingCustomers);
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
  }, [dbName, token, userCode]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const allowedExtensions = ["image/*", "text/plain", "application/pdf"];

    if (
      fileType &&
      (fileType !== "Other" || (fileType === "Other" && reason))
    ) {
      const type = fileType === "Other" ? reason : t(fileType);

      // Check if the file type is allowed
      const isValidType = allowedExtensions.some((extension) => {
        if (extension === "image/*") {
          return file.type.startsWith("image/");
        }
        return file.type === extension;
      });

      if (isValidType) {
        setUploadedFiles((prevFiles) => [
          ...prevFiles,
          { fileType: type, fileName: file.name },
        ]);
        setSelectedFile(file);
        console.log(file); // You can handle the file upload logic here
      } else {
        setModalMessage(t("warning"));
        setIsModalVisibleWarning(true);
      }
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const showRejectModal = () => setIsRejectModalOpen(true);
  const hideRejectModal = () => setIsRejectModalOpen(false);

  const submitRejection = async () => {
    const body = {
      approverUserCode: userCode,
      customerCode: selectedCustomerInfo.customerCode,
     // guid: getOldCustomeData[0]?.guid,
      response: "R",
      note: rejectionReason,
    };
    const headers = {
      accept: "*/*",
      dbname: cookies.token?.selectedCompany,
      token: cookies.token?.token,
    };

    console.log(body, "rejection body");
    console.log(headers, "rejection headers");

    try {
      setLoading(true);
      const response = await api.post(
        `api/ResponseOnUpdate`,
        body,
        {
          headers,
        }
      );
      console.log(response, "response on update rejection ");

      hideRejectModal();
      setIsEditModalOpen(false);
      setIsTableOpen(true);
      toast.success("You have successfully rejected this update request.");
      //  window.location.reload();
    } catch (error) {
      toast.error(
`Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`      );

      console.error("Error on Rejection Edit API:", error);
    } finally {
      setLoading(false);
      window.location.reload();
    }
  };

  const submitAccept = async () => {
    const body = {
      approverUserCode: userCode,
      customerCode: selectedCustomerInfo.customerCode,
      //guid: getOldCustomeData[0]?.guid,
      response: "A",
      note: acceptReason,
    };

    const headers = {
      accept: "*/*",
      dbname: cookies.token?.selectedCompany,
      token: cookies.token?.token,
    };
    try {
      setLoading(true);
      const response = await api.post(
        `api/ResponseOnUpdate`,
        body,
        {
          headers,
        }
      );

      console.log("Response on Accept API for edit pageeeee:", response.data);
      hideRejectModal();
    } catch (error) {
      console.log(error, "accept api");

      toast.error(
`Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`      );

      console.error("Error on Accept API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextToEdit = (customer) => {
    console.log(customer, "selected customer to edit it ");
    
    setSelectedCustomerInfo(customer);
    console.log("Editing:", customer);
    const fetchCustomers = async () => {
      const url = `api/GetCustomers`;
      console.log(userCode, "userCode");
      console.log(customer.customerCode, " customer.customerCode");

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
        console.log(response.data.results, "chek this old values");
        
        setGetOldCustomeData(response.data.results);
      } catch (error) {
        toast.error(
          `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch Update customers error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingCustomers = async () => {
      const url = `api/GetPendingCustomers?cardCode=${customer.customerCode}`;
      console.log(userCode, "userCode");
      console.log(customer.customerCode, " customer.customerCode");

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
        const results = response?.data.results;
        const countPStatus = results.reduce((count, item) => {
          return item.status === "P" ? count + 1 : count;
        }, 0);

        setUpdateCustomerNum(countPStatus);
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

    fetchCustomers();
    fetchPendingCustomers();
    setIsTableOpen(false);
    setCustomerName(customer.name);
    setIsEditModalOpen(true);
    //   navigate("/modifications-info");
  };

  const handleBackPersonalInfo = () => {
    setIsTableOpen(true);
    setIsEditModalOpen(false);
    window.location.reload(); // This will refresh the page
  };

  const handleDeleteConfirmationServiceTable = () => {
    removeServiceTable();
    setIsServiceDeleteConfirmVisible(false);
  };

  const removeServiceTable = () => {
    if (serviceTables.length > 1) {
      setServiceTables(serviceTables.slice(0, -1));
    }
  };

  const addServiceTable = () => {
    setServiceTables([...serviceTables, {}]);
  };

  const addCategoryTable = () => {
    setCategoryTables([...CategoryTables, {}]);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const showModalReject = () => {
    isModalVisibleReject(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setIsEditModalOpen(false);
    setIsTableOpen(true);
    window.location.reload();
  };

  const handleDeleteConfirmationCategoryTable = () => {
    removeCategoryTable();
    setIsCategoryDeleteConfirmVisible(false);
  };

  const removeCategoryTable = () => {
    if (CategoryTables.length > 1) {
      setCategoryTables(CategoryTables.slice(0, -1));
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const sortedData = customerDataModifications.sort((a, b) => {
    // Define the sorting order for statuses
    const statusOrder = { P: 1, A: 2, R: 3 };

    return statusOrder[a.status] - statusOrder[b.status];
  });

  const paginatedData = sortedData
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : [];

  const renderStatus = (status) => {
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
          className={`md:bg-white p-4 md:p-12 m-0  md:m-10 xl:m-12  rounded-xl w-[23rem] h-full  md:w-5/6 xl:w-11/12 ${
            isArabic ? "ml-0 md:ml-10" : ""
          }`}
        >
          {isTableOpen && (
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
                  {t("modificationRequests")}
                </h1>
              </div>

              <div className="flex flex-col justify-center items-center w-full">
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
                                onClick={() => handleNextToEdit(customer)}
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
              </div>
            </>
          )}

          {isEditModalOpen && (
            <div dir={i18n.dir()}>
              <div className="flex flex-row justify-between  items-center mb-10">
                <h1
                  className={`text-md md:text-xl  xl:text-2xl font-bold text-black  ${
                    isArabic ? "ml-2 md:ml-0" : ""
                  }`}
                >
                  {t("Editcustomerinfo")}
                </h1>

                <img
                  src={CloseIcon}
                  alt="Edit"
                  className={`w-3 h-auto md:w-4 h-auto ${
                    isArabic ? "transform rotate-180" : ""
                  } cursor-pointer ${isArabic ? "ml-0 md:ml-0" : ""}`}
                  onClick={handleBackPersonalInfo}
                />
              </div>

              <div className="flex flex-col md:flex-row mt-5 items-start md:items-center justify-between mb-10">
                <h1 className="text-xs md:text-sm">
                  {t("customerName")}: {selectedCustomerInfo.customerName}
                </h1>
                <div className="hidden md:flex md:flex-1"></div>
                <h1 className="text-xs md:text-sm mt-5 md:mt-0 md:self-center md:self-auto">
                  {t("cardCode")}: {selectedCustomerInfo.customerCode}
                </h1>
                <div className="hidden md:flex md:flex-1"></div>
              </div>

              <InputField
                label={t("paymentTerms")}
                readOnly={true}
                value={selectedCustomerInfo.newPaymentTermName}
              />

              <InputField
                label={t("oldpaymentTerms")}
                readOnly={true}
                value={getOldCustomeData[0]?.paymentTermsName}
              />

              <InputField
                label={t("creditLimit")}
                readOnly={true}
                value={
                  selectedCustomerInfo.newCreditLimit
                    ? formatNumber(selectedCustomerInfo.newCreditLimit)
                    : ""
                }
              />
              <InputField
                label={t("oldcreditLimit")}
                readOnly={true}
                value={
                  getOldCustomeData[0]?.creditLimit
                    ? formatNumber(getOldCustomeData[0]?.creditLimit)
                    : ""
                }
              />
              <InputField
                label={t("commitmentLimit")}
                readOnly={true}
                value={
                  selectedCustomerInfo.newCommitmentLimit
                    ? formatNumber(selectedCustomerInfo.newCommitmentLimit)
                    : ""
                }
              />
              <InputField
                label={t("oldcommitmentLimit")}
                readOnly={true}
                value={
                  getOldCustomeData[0]?.commetimentLimit
                    ? formatNumber(getOldCustomeData[0]?.commetimentLimit)
                    : ""
                }
              />
              <InputField
                label={t("discount")}
                readOnly={true}
                value={selectedCustomerInfo.newDiscount}
              />
              <InputField
                label={t("olddiscount")}
                readOnly={true}
                value={getOldCustomeData[0]?.discount}
              />
              <InputField
                label={t("extraCharges")}
                readOnly={true}
                value={
                  selectedCustomerInfo.newExtraCharges
                    ? formatNumber(selectedCustomerInfo.newExtraCharges)
                    : ""
                }
              />
              <InputField
                label={t("oldextraCharges")}
                readOnly={true}
                value={
                  getOldCustomeData[0]?.extraCharges
                    ? formatNumber(getOldCustomeData[0]?.extraCharges)
                    : ""
                }
              />

             

              {/* Service Item */}
              {selectedCustomerInfo.serviceItemsList.length != 0 && (
                <TableComponent
                  items={selectedCustomerInfo.serviceItemsList}
                  columns={[
                    {
                      header: t("serviceItem"),
                      accessor: "itemName",
                      width: "2/3",
                    },
                    {
                      header: t("price"),
                      accessor: "price",
                      format: formatNumber,
                    },
                  ]}
                  title={t("customerServiceItems")}
                  itemsPerPage={5}
                />
              )}

              {/* Category */}
              {selectedCustomerInfo.itemsList.length != 0 && (
                <TableComponent
                  items={selectedCustomerInfo.itemsList}
                  columns={[
                    {
                      header: t("item"),
                      accessor: "itemName",
                      width: "2/3",
                    },
                    {
                      header: t("price"),
                      accessor: "price",
                      format: formatNumber,
                    },
                  ]}
                  title={t("item")}
                  itemsPerPage={5}
                />
              )}
               {selectedCustomerInfo.shipToList.length != 0 && (
                <TableComponent
                  items={selectedCustomerInfo.shipToList}
                  columns={[
                    {
                      header: t("shipToSection"),
                      accessor: "shiptoName",
                      width: "1/2",
                    },
                    { header: t("distance"), accessor: "distance" },
                    {
                      header: t("Expectedquantity"),
                      accessor: "expectedQty",
                    },
                    {                                   

                      header:   t("location"),
                      accessor: "locationUrl",
                    },
                    { header: t("city"), accessor: "city" },
                    { header: t("street"), accessor: "street" },

                  ]}
                />
              )}

              {selectedCustomerInfo.status == "P" && (
                <div className="flex justify-end mt-8 mb-8 gap-3">
                  <button
                    type="button"
                    style={{ backgroundColor: "#D40909" }}
                    className="px-4 md:px-16 py-1 pb-2 text-xs md:text-sm  text-white rounded-md hover:bg-red-700 focus:outline-none focus:bg-red-700"
                    onClick={showRejectModal}
                  >
                    {t("rejectApplication")}
                  </button>

                  <button
                    type="button"
                    style={{ backgroundColor: "#272C6F" }}
                    className="px-4 md:px-16 py-1 pb-2 text-xs md:text-sm text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                    onClick={showModal}
                  >
                    {t("acceptApplication")}
                  </button>
                </div>
              )}

              {isModalVisible && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4">
                  <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-auto p-5 border">
                    <div className="flex justify-between items-center pb-3">
                      <p className="text-xl font-bold">
                        {t("acceptApplication")}
                      </p>
                      <button className="text-black p-1" onClick={hideModal}>
                        &times;
                      </button>
                    </div>
                    <p>{t("applicationAccepted")}</p>{" "}
                    {/* Make sure you have 'rejectionMessage' in your i18n files */}
                    <div className="flex justify-end">
                      <button
                        style={{ backgroundColor: "#272C6F" }}
                        className="hover:bg-blue-800 text-white py-1 px-4 rounded"
                        onClick={() => {
                          submitAccept();
                          toast.success(
                            "You have successfully accepted this update request."
                          );
                          hideModal();
                        }}
                      >
                        {t("submit")}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {isRejectModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4">
                  <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-auto p-5 border">
                    <div className="flex justify-between items-center pb-3">
                      <p className="text-xl font-bold">
                        {t("rejectApplication")}
                      </p>
                      <button
                        className="text-black p-1"
                        onClick={hideRejectModal}
                      >
                        &times;
                      </button>
                    </div>
                    <p>{t("rejectionMessage")}</p>{" "}
                    {/* Make sure you have 'rejectionMessage' in your i18n files */}
                    <textarea
                      className="w-full h-40 p-2 mt-4 mb-4 border rounded-md"
                      placeholder={t("rejectionPlaceholder")} // Add 'rejectionPlaceholder' to your i18n files
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end">
                      <button
                        style={{ backgroundColor: "#272C6F" }}
                        className="hover:bg-blue-800 text-white py-1 px-4 rounded"
                        onClick={() => {
                          submitRejection();
                        }}
                      >
                        {t("submit")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
