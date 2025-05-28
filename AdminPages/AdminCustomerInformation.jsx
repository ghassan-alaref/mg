import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import enUS from "antd/lib/locale/en_US";
import arEG from "antd/lib/locale/ar_EG";
import { useTranslation } from "react-i18next";
import Sidebar from "../Component/AdminSidebar";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import Notifications from "../Component/Notifications";
import ArrowIcon from "../Images/left.png";
import CloseIcon from "../Images/close.png";
import warning from "../Images/warning.png";
import checkmark from "../Images/checkmark.png";
import axios from "axios";
import api from "../UserPages/api"
import { useCookies } from "react-cookie";
import { Loader } from "../Component/Loader";
import { toast } from "react-toastify";
import TableComponent from "../Component/TableComponent";
import { formatNumber } from "../UserPages/CustomerOptions";
import PropGridReadOnly from "../Component/PropGridReadOnly";
import {
  formatDateToDDMMYYYYReadOnly,
  headerStyle,
} from "../UserPages/CustomerInfo";
const backendUrl = process.env.REACT_APP_BACKEND_URL;
const attachmentUrl = process.env.REACT_APP_ATTACHMENTS_URL;

const StepProgressBar = ({ currentStep }) => {
  const { t, i18n } = useTranslation();

  const lineMargin = i18n.language === "ar" ? "1.5rem" : "0.95rem";
  const isArabic = i18n.language === "ar";
  const stepLabels = [
    "personalInfo",
    "generalInfo",
    "financialInfo",
    "pricesInfo",
  ];

  const labelClass = (index) => {
    return i18n.language === "ar" && index === 0 ? "-mr-4" : " ";
  };
  const labelMarginClass = i18n.language === "ar" ? "-ml-1" : "";
  const textClass =
    i18n.language === "ar" ? "text-[8px] md:text-xs px-4 md:px-0" : "text-xs";
  return (
    <div
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      className="flex flex-col md:bg-white p-4  sm:m-5 sm:p-5  md:m-10 xl:m-12  rounded-xl w-[23rem] md:w-5/6 xl:w-11/12"
    >
      <div className="flex items-center px-0 xl:px-14 -mr-0 md:-mr-1 xl:-mr-0">
        {[1, 2, 3, 4].map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center ">
              <div className="flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold bg-blue-500 text-white border-2 border-blue-500">
                {step}
              </div>

              <div
                className={`text-center mt-2 ${textClass}  ${labelMarginClass} ${labelClass(
                  index
                )}`}
              >
                {t(stepLabels[index])}
              </div>
            </div>
            {step !== 4 && (
              <div
                className={`flex-auto border-t-4 mb-5  ${
                  step < currentStep ? "border-blue-500" : "border-blue-500"
                }`}
                style={{
                  marginLeft: index === 0 ? `-${lineMargin}` : `-${lineMargin}`,
                  marginRight: `-${lineMargin}`,
                }}
              ></div>
            )}
          </React.Fragment>
        ))}
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

const AdminCustomerInformation = () => {
  const [cookies] = useCookies(["token"]);

  const token = cookies.token?.token;
  const dbName = cookies.token?.selectedCompany;
  const userCode = cookies.token?.userCode;
  const location = useLocation();
  const [getAttachmentAPI, setGetAttachmentAPI] = useState([]);
  const [clickedAttachment, setClickedAttachment] = useState("");

  // Extract data from location.state
  const {
    status,
    cardCode,
    cardName,
    foreignName,
    customerGroup,
    nationalId,
    address,
    phoneNo,
    fax,
    email,
    primaryAccountManager,
    secondaryAccountManager,
    concreteVap,
    companyOrIndividual,
    companyTaxNumber,
    companyRegistration,
    parentCustomer,
    creditLimit,
    commetimentLimit,
    paymentTerms,
    paymentMethod,
    isExempt,
    taxExemptedGroup,
    taxExemptedQty,
    exemptionPeriod,
    discount,
    discountReason,
    extraCharges,
    extraChargesReason,
    exemptionTypeName,
    hasFather,
    property1,
    property2,
    property3,
    property4,
    property5,
    property6,
    army,
    church,
    commercialBuilding,
    electricityTransmissionGrids,
    farm,
    fuelStation,
    governmental,
    hangar,
    highRisk,
    hospitals,
    hotels,
    house,
    housing,
    industrial,
    infrastructure,
    lowRisk,
    mediumRisk,
    mosque,
    pipelines,
    port,
    residential,
    road,
    schools,
    store,
    university,
    villa,
    waterDesalinationPlant,
    wwtp,
    parentCustomerName,
  } = location.state || {};

  const adminCustomerInfoHome = JSON.parse(
    localStorage.getItem("adminCustomerInfoHome")
  );

  console.log(adminCustomerInfoHome, "rrrrrrrrrrrrrrrrraaaaaaaa");

  const [isLoading, setLoading] = useState(false);

  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? arEG : enUS;
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [showGeneralInfo, setShowGeneralInfo] = useState(false);
  const [showFinancialInfo, setShowFinancialInfo] = useState(false);
  const [showPricesInfo, setShowPricesInfo] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [property, setproperty] = useState("");
  const [distance, setdistance] = useState("");
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [taxExemptedPercentage, setTaxExemptedPercentage] = useState("");
  const [collectionMethod, setcollectionMethod] = useState("");
  const [requiredDiscount, setrequiredDiscount] = useState("");
  const [priceCategory, setpriceCategory] = useState("");
  const [category, setcategory] = useState("");
  const [priceServiceItem, setpriceServiceItem] = useState("");
  const [serviceItem, setserviceItem] = useState("");
  const [longitude, setlongitude] = useState("");
  const [latitude, setlatitude] = useState("");
  const [shipToSection, setshipToSection] = useState("");
  const [tables, setTables] = useState([{}]);
  const [fileType, setFileType] = useState("");
  const [serviceTables, setServiceTables] = useState([{}]);
  const [CategoryTables, setCategoryTables] = useState([{}]);
  const [isServiceDeleteConfirmVisible, setIsServiceDeleteConfirmVisible] =
    useState(false);
  const [isCategoryDeleteConfirmVisible, setIsCategoryDeleteConfirmVisible] =
    useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const isArabic = i18n.language === "ar";
  const [currentStep, setCurrentStep] = useState(0);
  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const navigate = useNavigate();
  const generalInfoRef = useRef(null);
  const FinancialInfoRef = useRef(null);
  const PricesInfoRef = useRef(null);
  const { customerId } = useParams();

  const customerStatus = adminCustomerInfoHome?.approvalStatusName;

  const [selectedFile, setSelectedFile] = useState(null);
  const [reason, setReason] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [BPType, setBPType] = useState("");
  const [customerGroupState, setCustomerGroup] = useState(customerGroup || "");
  const [customerGroups, setCustomerGroups] = useState([]);

  const [primaryAccountManagerState, setprimaryAccountManager] = useState(
    primaryAccountManager || ""
  );
  const [secondaryAccountManagerState, setsecondaryAccountManager] = useState(
    secondaryAccountManager || ""
  );
  const [concreteVAPState, setconcreteVAP] = useState(concreteVap || "");
  const [companyIndividualState, setcompanyIndividual] = useState(
    companyOrIndividual || ""
  );
  const [taxNoOfCompanyState, settaxNoOfCompany] = useState(
    companyTaxNumber || ""
  );
  const [companyRegistrationState, setCompanyRegistration] = useState(
    companyRegistration || ""
  );
  const [parentCustomerState, setparentCustomer] = useState(
    parentCustomer || ""
  );
  const [creditLimitState, setCreditLimit] = useState(creditLimit || "");
  const [commitmentLimitState, setCommitmentLimit] = useState(
    commetimentLimit || ""
  );
  const [paymentTermsState, setpaymentTerms] = useState(paymentTerms || "");
  const [paymentMethodState, setpaymentMethod] = useState(paymentMethod || "");
  const [isExemptState, setisExempt] = useState(isExempt || "");
  const [taxExemptedGroupState, setTaxExemptedGroup] = useState(
    taxExemptedGroup || ""
  );
  const [taxExemptedQuantityState, setTaxExemptedQuantity] = useState(
    taxExemptedQty || ""
  );
  const [exemptionPeriodState, setexemptionPeriod] = useState(
    exemptionPeriod || ""
  );
  const [discountState, setdiscount] = useState(discount || "");
  const [discountReasonState, setdiscountReason] = useState(
    discountReason || ""
  );
  const [extraChargesState, setextraCharges] = useState(extraCharges || "");
  const [extraChargesReasonState, setextraChargesReason] = useState(
    extraChargesReason || ""
  );
  const [isModalVisibleWarning, setIsModalVisibleWarning] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const [isExemptNew, setisExemptNew] = useState("");
  const [shipToAPI, setShipToAPI] = useState([]);
  const [serviceItemsAPI, setServiceItemsAPI] = useState([]);
  const [itemsAPI, setItemsAPI] = useState([]);

  useEffect(() => {
    if (hasFather === "N") {
      setBPType("Father");
    }
    if (hasFather === "Y") {
      setBPType("Child");
    }
  }, [hasFather]);

  useEffect(() => {
    if (adminCustomerInfoHome?.isExempt == "Y") {
      setisExemptNew("Yes");
    } else {
      setisExemptNew("No");
    }

    const fetchCustomerGroups = async () => {
      if (!dbName || !token) {
        console.error("Missing dbName or token");
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`api/GetCustomerGroups`, {
          headers: {
            "Content-Type": "application/json",
            dbname: dbName,
            token: token,
          },
        });
        if (response.data.status === "Success") {
          setCustomerGroups(response.data.results);
        } else {
          alert("Failed to fetch customer groups");
        }
      } catch (error) {
        toast.error(
          `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch customer groups error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerGroups();
  }, [dbName, token]);

  useEffect(() => {
    const fetchBranches = async () => {
      const url = `api/GetCustomerBranches`;

      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbname: dbName,
            token: token,
            customerCode: adminCustomerInfoHome?.cardCode,
          },
        });

        if (response.data.status === "Success") {
          setBranches(response.data.results);
        } else {
          alert("Failed to fetch branches");
        }
      } catch (error) {
        toast.error(
          `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch branches error Admin:", error);
      } finally {
        setLoading(false);
      }
    };

    //// Ship Tos API
    const fetcCustomerShipTos = async () => {
      const url = `api/GetCustomerShipTos`;
      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            customerCode: adminCustomerInfoHome?.cardCode,
          },
        });
        if (response.data.status === "Success") {
          setShipToAPI(response.data.results);
        }
      } catch (error) {
        toast.error(
          `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch customers error:", error);
      } finally {
        setLoading(false);
      }
    };

    //// Service Items API
    const fetcCustomerServiceItems = async () => {
      const url = `api/GetCustomerServiceItems`;
      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            customerCode: adminCustomerInfoHome?.cardCode,
          },
        });
        setServiceItemsAPI(response.data.results);
      } catch (error) {
        toast.error(
          `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch fetcCustomerServiceItems error:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log(adminCustomerInfoHome?.guid);

    ////Items API
    const fetcCustomerItems = async () => {
      const url = `api/GetCustomerItems`;
      try {
        setLoading(true);
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            customerCode: adminCustomerInfoHome?.cardCode,
          },
        });

        console.log(response, "itemssssss response");

        setItemsAPI(response.data.results);
      } catch (error) {
        toast.error(
          `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch fetcCustomerItems error:", error);
      } finally {
        setLoading(false);
      }
    };

    const GetAttachments = async () => {
      const url = `${attachmentUrl}/CustomerAttachments/GetFiles?dbName=${dbName}&cardCode=${adminCustomerInfoHome?.cardCode}`;
      try {
        setLoading(true);
        const response = await axios.get(url);
        setGetAttachmentAPI(response?.data);
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data.status} Code:${error?.response?.data.statusCode} Message: ${error?.response?.data.errorMessage}`
        );

        console.error("Fetch GetAttachments error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (adminCustomerInfoHome?.cardCode) {
      GetAttachments();
      fetchBranches();
      fetcCustomerShipTos();
      fetcCustomerServiceItems();
      fetcCustomerItems();
    }
  }, [dbName, token, adminCustomerInfoHome?.cardCode]);

  const Dropdown = ({ label, value, readOnly, options }) => (
    <div className="flex flex-col space-y-2 mt-5">
      <label className="text-sm">{label}</label>
      {options ? (
        <select
          className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
          value={customerGroupState} // Ensure this matches one of the option values
          onChange={(e) => setCustomerGroup(e.target.value)}
          disabled={readOnly}
        >
          {/* Log the options to check if they are being passed correctly */}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {" "}
              {/* Use option.value for value */}
              {option.label} {/* Use option.label for label */}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
        />
      )}
    </div>
  );

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
      } else {
        setModalMessage(t("warning"));
        setIsModalVisibleWarning(true);
      }
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  //DownLoade Attchment functions
  const DownloadAttachment = async (fileName) => {
    const url = `${attachmentUrl}/CustomerAttachments/DownloadFile?fileName=${fileName}`;
    try {
      setLoading(true);
      const response = await axios.get(url, {
        responseType: "blob", // Important to specify the response type as 'blob'
      });

      // Create a URL for the blob
      const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));

      // Sanitize the file name
      const sanitizedFileName = fileName.replace(/\\/g, "/").split("/").pop(); // Keep only the file name

      // Create a link element
      const link = document.createElement("a");

      // Set the download attribute with the sanitized file name
      link.href = downloadUrl;
      link.setAttribute("download", sanitizedFileName); // Use the sanitized file name

      // Append the link to the body
      document.body.appendChild(link);

      // Programmatically click the link to trigger the download
      link.click();

      // Clean up by removing the link element
      link.parentNode.removeChild(link);
    } catch (error) {
      toast.error(
        `Error Message: ${error?.response?.statusText} Code:${error?.response?.status}`
      );

      console.error(
        "Fetch DownloadAttachment error:",
        error?.response?.statusText
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentClick = (fileName) => {
    setClickedAttachment(fileName);
    DownloadAttachment(fileName);
  };

  const showRejectModal = () => {
    setIsRejectModalOpen(true);
  };

  const hideRejectModal = () => setIsRejectModalOpen(false);

  const handleDeleteConfirmationServiceTable = () => {
    removeServiceTable();
    setIsServiceDeleteConfirmVisible(false);
  };

  const handleDeleteConfirmationCategoryTable = () => {
    removeCategoryTable();
    setIsCategoryDeleteConfirmVisible(false);
  };

  const removeServiceTable = () => {
    if (serviceTables.length > 1) {
      setServiceTables(serviceTables.slice(0, -1));
    }
  };

  const removeCategoryTable = () => {
    if (CategoryTables.length > 1) {
      setCategoryTables(CategoryTables.slice(0, -1));
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

  const hideModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (showGeneralInfo) {
      generalInfoRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showGeneralInfo]);

  useEffect(() => {
    if (showFinancialInfo) {
      FinancialInfoRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showFinancialInfo]);

  useEffect(() => {
    if (showPricesInfo) {
      PricesInfoRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showPricesInfo]);

  const handleNextClick = () => {
    setShowPersonalInfo(false);
    setShowGeneralInfo(true);
  };
  const handleNextToFinancialClick = () => {
    setShowGeneralInfo(false);
    setShowFinancialInfo(true);
  };

  const handleNextToPricesInfoClick = () => {
    setShowFinancialInfo(false);
    setShowPricesInfo(true);
    setShowGeneralInfo(false);
    setShowPersonalInfo(false);
  };

  const handleNextToEdit = () => {
    setShowPersonalInfo(false);
    setShowGeneralInfo(false);
    setShowFinancialInfo(false);
    setShowPricesInfo(false);
    setIsEditModalOpen(true);
  };

  const handleBackPersonalInfo = () => {
    setShowPersonalInfo(true);
    setShowGeneralInfo(false);
    setShowFinancialInfo(false);
  };

  const handleBackGeneralInfo = () => {
    setShowPersonalInfo(false);
    setShowGeneralInfo(true);
    setShowFinancialInfo(false);
    setCurrentStep(1);
  };

  const handleBackFinancialInfo = () => {
    setShowPersonalInfo(false);
    setShowGeneralInfo(false);
    setShowFinancialInfo(true);
    setShowPricesInfo(true);
    setCurrentStep(2);
  };

  return (
    <div
      className={`bg-[#FAFAFF]  min-h-screen flex ${
        i18n.dir() === "rtl" ? "flex-row-reverse" : ""
      }`}
    >
      {isLoading && <Loader />}
      <Sidebar />
      <div className="flex-1  flex-col">
        <Header onNotificationsClick={toggleNotifications} />

        {showNotifications ? (
          <Notifications />
        ) : (
          <div className="">
            <StepProgressBar currentStep={currentStep} />
            <main
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
              className="md:bg-white   p-4 sm:m-5 sm:p-5  md:m-10 xl:m-12 mt-5 rounded-xl w-[23rem] md:w-5/6 xl:w-11/12 "
              style={{ height: "80%" }}
            >
              {showPersonalInfo && !showGeneralInfo && (
                <>
                  <div className="flex justify-between items-center">
                    <h1 className="text-sm font-bold">{t("personalInfo")}</h1>
                    <div className="flex items-center gap-5">
                      <span
                        className={`px-4 py-1 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-md ${
                          customerStatus === "Approved"
                            ? "bg-green-500 text-white"
                            : customerStatus === "Rejected"
                            ? "bg-red-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {t(customerStatus?.toLowerCase())}
                      </span>
                    </div>
                  </div>

                  <InputField
                    label={t("customerName")}
                    value={adminCustomerInfoHome?.cardName}
                    readOnly={true}
                  />

                  <InputField
                    label={t("fullName")}
                    value={adminCustomerInfoHome?.fullName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("foreignName")}
                    value={adminCustomerInfoHome?.foreignName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("fullforeignName")}
                    value={adminCustomerInfoHome?.fullforeignName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("nationalId")}
                    value={adminCustomerInfoHome?.nationalId}
                    readOnly={true}
                  />

                  <InputField
                    label={t("address")}
                    value={adminCustomerInfoHome?.address}
                    readOnly={true}
                  />

                  <InputField
                    label={t("telephoneNo")}
                    value={adminCustomerInfoHome?.phoneNo}
                    readOnly={true}
                  />

                  <InputField
                    label={t("fax")}
                    value={adminCustomerInfoHome?.fax}
                    readOnly={true}
                  />
                  <InputField
                    label={t("email")}
                    value={adminCustomerInfoHome?.email}
                    readOnly={true}
                  />
                  <InputField
                    label={t("BP Type")}
                    value={hasFather}
                    readOnly={true}
                  />
                  <InputField
                    label={t("parentCustomer")}
                    value={adminCustomerInfoHome?.parentCustomerName} //parentCustomer
                    readOnly={true}
                  />

                  <div className="flex gap-10  mt-5">
                    <table style={{ borderCollapse: "collapse", width: "30%" }}>
                      <thead>
                        <tr>
                          <th style={headerStyle}>{t("Properties")}</th>
                          <th style={headerStyle}></th>
                        </tr>
                      </thead>
                      <PropGridReadOnly name={"Army"} status={army} />
                      <PropGridReadOnly name={"Church"} status={church} />
                      <PropGridReadOnly
                        name={"Commercial Building"}
                        status={commercialBuilding}
                      />
                      <PropGridReadOnly
                        name={"Electricity Transmission Grids"}
                        status={electricityTransmissionGrids}
                      />
                      <PropGridReadOnly name={"Farm"} status={farm} />
                      <PropGridReadOnly
                        name={"Fuel Station"}
                        status={fuelStation}
                      />

                      <PropGridReadOnly
                        name={"Governmental"}
                        status={governmental}
                      />
                      <PropGridReadOnly name={"Hangar"} status={hangar} />
                      <PropGridReadOnly name={"High Risk"} status={highRisk} />
                      <PropGridReadOnly name={"Hospitals"} status={hospitals} />
                    </table>

                    <table style={{ borderCollapse: "collapse", width: "30%" }}>
                      <thead>
                        <tr>
                          <th style={headerStyle}>{t("Properties")}</th>
                          <th style={headerStyle}></th>
                        </tr>
                      </thead>
                      <PropGridReadOnly name={"Hotels"} status={hotels} />
                      <PropGridReadOnly name={"House"} status={house} />
                      <PropGridReadOnly name={"Housing"} status={housing} />
                      <PropGridReadOnly
                        name={"Industrial"}
                        status={industrial}
                      />
                      <PropGridReadOnly
                        name={"Infrastructure"}
                        status={infrastructure}
                      />
                      <PropGridReadOnly name={"Low Risk"} status={lowRisk} />

                      <PropGridReadOnly
                        name={"MediumRisk"}
                        status={mediumRisk}
                      />
                      <PropGridReadOnly name={"Mosque"} status={mosque} />
                      <PropGridReadOnly name={"Pipelines"} status={pipelines} />
                      <PropGridReadOnly name={"Port"} status={port} />
                    </table>
                    <table style={{ borderCollapse: "collapse", width: "30%" }}>
                      <thead>
                        <tr>
                          <th style={headerStyle}>{t("Properties")}</th>
                          <th style={headerStyle}></th>
                        </tr>
                      </thead>
                      <PropGridReadOnly
                        name={"Residential"}
                        status={residential}
                      />
                      <PropGridReadOnly name={"Road"} status={road} />
                      <PropGridReadOnly name={"Schools"} status={schools} />
                      <PropGridReadOnly name={"store"} status={store} />
                      <PropGridReadOnly
                        name={"University"}
                        status={university}
                      />
                      <PropGridReadOnly name={"Villa"} status={villa} />

                      <PropGridReadOnly
                        name={"Water Desalination Plant"}
                        status={waterDesalinationPlant}
                      />
                      <PropGridReadOnly name={"WWTP"} status={wwtp} />
                    </table>
                  </div>
                  <div className="flex justify-end mb-10 mt-16">
                    <button
                      type="button"
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleNextClick}
                    >
                      {t("next")}
                    </button>
                  </div>
                </>
              )}

              {showGeneralInfo && !showPersonalInfo && (
                <div ref={generalInfoRef} className="general-info-form">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-row mr-0 md:mr-0  items-center">
                      <img
                        src={ArrowIcon}
                        alt="Back"
                        className={`h-5 w-3 md:h-auto w-6 ${
                          isArabic ? "transform rotate-180" : ""
                        } cursor-pointer ${isArabic ? "ml-0 md:ml-0" : ""}`}
                        onClick={handleBackPersonalInfo}
                      />

                      <h1 className="text-sm font-bold">{t("generalInfo")}</h1>
                    </div>
                    <div className="flex items-center gap-5">
                      <span
                        className={`px-4 py-1 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-md ${
                          customerStatus === "Approved"
                            ? "bg-green-500 text-white"
                            : customerStatus === "Rejected"
                            ? "bg-red-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {t(customerStatus?.toLowerCase())}
                      </span>
                    </div>
                  </div>

                  <InputField
                    label={t("customerGroup")}
                    value={adminCustomerInfoHome?.customerGroupName}
                    readOnly={true}
                  />

                  <InputField
                    label={t("primaryAccountManager")}
                    value={adminCustomerInfoHome?.primaryAccountManager}
                    readOnly={true}
                  />
                  <InputField
                    label={t("secondaryAccountManager")}
                    value={adminCustomerInfoHome?.secondaryAccountManager}
                    readOnly={true}
                  />
                  <InputField
                    label={t("concreteVAP")}
                    value={adminCustomerInfoHome?.concreteVapName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("companyIndividual")}
                    value={adminCustomerInfoHome?.companyOrIndividualName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("taxNoOfCompany")}
                    value={adminCustomerInfoHome?.companyTaxNumber}
                    readOnly={true}
                  />
                  <InputField
                    label={t("companyRegistration")}
                    value={adminCustomerInfoHome?.companyRegistration}
                    readOnly={true}
                  />

                  <div className="flex justify-end mt-8 mb-8 gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: "#489AB9" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleBackPersonalInfo}
                    >
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleNextToFinancialClick}
                    >
                      {t("next")}
                    </button>
                  </div>
                </div>
              )}

              {showFinancialInfo && !showGeneralInfo && !showPersonalInfo && (
                <div ref={FinancialInfoRef} className="financial-info-form">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-row mr-0 md:mr-0  items-center">
                      <img
                        src={ArrowIcon}
                        alt="Back"
                        className={`h-5 w-3 md:h-auto w-6 ${
                          isArabic ? "transform rotate-180" : ""
                        } cursor-pointer ${isArabic ? "ml-0 md:ml-0" : ""}`}
                        onClick={handleBackPersonalInfo}
                      />

                      <h1 className="text-sm font-bold">
                        {t("financialInfo")}
                      </h1>
                    </div>
                    <div className="flex items-center gap-5">
                      <span
                        className={`px-4 py-1 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-md ${
                          customerStatus === "Approved"
                            ? "bg-green-500 text-white"
                            : customerStatus === "Rejected"
                            ? "bg-red-500 text-white"
                            : "bg-blue-500 text-white"
                        }`}
                      >
                        {t(customerStatus?.toLowerCase())}
                      </span>
                    </div>
                  </div>
                  {/* <InputField label={t('requiredDiscount')} value={requiredDiscount} readOnly={true}/> */}
                  <InputField
                    label={t("creditLimit")}
                    value={
                      adminCustomerInfoHome?.creditLimit
                        ? formatNumber(adminCustomerInfoHome?.creditLimit)
                        : ""
                    }
                    readOnly={true}
                  />
                  <InputField
                    label={t("commitmentLimit")}
                    value={
                      adminCustomerInfoHome?.commetimentLimit
                        ? formatNumber(adminCustomerInfoHome?.commetimentLimit)
                        : ""
                    }
                    readOnly={true}
                  />
                  <InputField
                    label={t("totalExpectedQuantity")}
                    value={adminCustomerInfoHome?.totalExpectedQuantity}
                    readOnly={true}
                  />
                  <InputField
                    label={t("paymentTerms")}
                    value={adminCustomerInfoHome?.paymentTermsName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("paymentMethod")}
                    value={adminCustomerInfoHome?.paymentMethodName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("isExempt")}
                    value={
                      adminCustomerInfoHome?.isExempt === "Y"
                        ? t("yes")
                        : t("no")
                    }
                    readOnly={true}
                  />

                  {adminCustomerInfoHome?.isExempt === "Y" && (
                    <>
                      <InputField
                        label={t("taxExemptedPercentage")}
                        value={taxExemptedGroupState}
                        readOnly={true}
                      />
                      <InputField
                        label={t("exemptionTypeName")}
                        value={exemptionTypeName}
                        readOnly={true}
                      />
                      <InputField
                        label={t("taxExemptedQuantity")}
                        value={
                          adminCustomerInfoHome?.taxExemptedQty
                            ? formatNumber(
                                adminCustomerInfoHome?.taxExemptedQty
                              )
                            : ""
                        }
                        readOnly={true}
                      />
                      <InputField
                        label={t("exemptionPeriod")}
                        value={formatDateToDDMMYYYYReadOnly(
                          adminCustomerInfoHome?.exemptionPeriod
                        )}
                        readOnly={true}
                      />
                    </>
                  )}

                  <div className="flex justify-end mt-8 mb-8 gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: "#489AB9" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleBackGeneralInfo}
                    >
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleNextToPricesInfoClick}
                    >
                      {t("next")}
                    </button>
                  </div>
                </div>
              )}

              {showPricesInfo &&
                !showFinancialInfo &&
                !showGeneralInfo &&
                !showPersonalInfo && (
                  <div ref={PricesInfoRef} className="Prices-info-form">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-row mr-0 md:mr-0  items-center">
                        <img
                          src={ArrowIcon}
                          alt="Back"
                          className={`h-5 w-3 md:h-auto w-6 ${
                            isArabic ? "transform rotate-180" : ""
                          } cursor-pointer ${isArabic ? "ml-0 md:ml-0" : ""}`}
                          onClick={handleBackPersonalInfo}
                        />

                        <h1 className="text-sm font-bold">{t("pricesInfo")}</h1>
                      </div>
                      <div className="flex items-center gap-5">
                        <span
                          className={`px-4 py-1 inline-flex items-center justify-center text-xs leading-5 font-semibold rounded-md ${
                            customerStatus === "Approved"
                              ? "bg-green-500 text-white"
                              : customerStatus === "Rejected"
                              ? "bg-red-500 text-white"
                              : "bg-blue-500 text-white"
                          }`}
                        >
                          {t(customerStatus?.toLowerCase())}
                        </span>
                      </div>
                    </div>
                    <div className="financial-info-form mx-5">
                      <div className="mt-16 mb-5">
                        <InputField
                          label={t("discount")}
                          value={
                            adminCustomerInfoHome?.discount
                              ? formatNumber(adminCustomerInfoHome?.discount)
                              : ""
                          }
                          readOnly={true}
                        />
                        <InputField
                          label={t("discountReason")}
                          value={adminCustomerInfoHome?.discountReason}
                          readOnly={true}
                        />

                        <InputField
                          label={t("otherReason")}
                          value={adminCustomerInfoHome?.discountOtherReason}
                          readOnly={true}
                        />

                        <InputField
                          label={t("extraCharges")}
                          value={adminCustomerInfoHome?.extraCharges}
                          readOnly={true}
                        />
                        <InputField
                          label={t("extraChargesReason")}
                          value={adminCustomerInfoHome?.extraChargesReason}
                          readOnly={true}
                        />
                        <InputField
                          label={t("otherReason")}
                          value={adminCustomerInfoHome?.extraChargesOtherReason}
                          readOnly={true}
                        />
                      </div>

                      {/* Ship-to-section */}

                      {/* Service Item */}
                      {serviceItemsAPI.length != 0 && (
                        <TableComponent
                          items={serviceItemsAPI}
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
                      {itemsAPI.length != 0 && (
                        <TableComponent
                          items={itemsAPI}
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
                      {shipToAPI.length != 0 && (
                        <TableComponent
                          items={shipToAPI}
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
                              header: t("location"),
                              accessor: "locationUrl",
                            },
                            { header: t("city"), accessor: "city" },
                            { header: t("street"), accessor: "street" },
                          ]}
                        />
                      )}

                      {/* Discount, Discount Reason, Extra Charges */}

                      {/* File Download */}
                      {/* File Download */}

                      {getAttachmentAPI.length != 0 && (
                        <div className="flex flex-col file-upload mt-4 mb-6 bg-gray-100 rounded-lg p-4 shadow-md">
                          <h3 className="text-lg font-semibold mb-3 text-gray-700">
                            Attachments
                          </h3>
                          <ul className="space-y-2">
                            {getAttachmentAPI.map((attachment, index) => (
                              <li
                                key={index}
                                className="flex items-center space-x-3"
                              >
                                <button
                                  onClick={() =>
                                    handleAttachmentClick(attachment)
                                  }
                                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 truncate"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    className="w-5 h-5 mr-2 flex-shrink-0"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M15 12V8a3 3 0 10-6 0v4m6 4v2a3 3 0 01-6 0v-2m6 0H9"
                                    />
                                  </svg>
                                  <span className="block max-w-full truncate">
                                    {attachment}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Back and Done Buttons */}
                      <button
                        type="button"
                        style={{ backgroundColor: "#272C6F" }}
                        className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                        onClick={() => {
                          navigate("/admin-home");
                        }}
                      >
                        {t("done")}
                      </button>
                    </div>
                  </div>
                )}
              {isEditModalOpen &&
                !showPricesInfo &&
                !showFinancialInfo &&
                !showGeneralInfo &&
                !showPersonalInfo && (
                  <div>
                    <div className="flex flex-row justify-between  items-center">
                      <h1 className="text-sm font-bold">
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
                        {t("customerName")}:
                      </h1>
                      <div className="hidden md:flex md:flex-1"></div>
                      <h1 className="text-xs md:text-sm mt-5 md:mt-0 md:self-center md:self-auto">
                        {t("cardCode")}:
                      </h1>
                      <div className="hidden md:flex md:flex-1"></div>
                    </div>

                    <InputField label={t("paymentTerms")} />
                    <InputField label={t("creditLimit")} />
                    <InputField label={t("commitmentLimit")} />
                    <InputField label={t("discount")} />
                    <InputField label={t("extraCharges")} />

                    {/* Service Item */}
                    <div className="ship-to-section-container ">
                      <div className="flex justify-end p-2 mb-3 mt-7">
                        <div className="flex items-center">
                          <button
                            className="minus-btn bg-blue-100 pb-1 text-black border  rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                            onClick={() => {
                              if (serviceTables.length > 1) {
                                setIsServiceDeleteConfirmVisible(true);
                              } else {
                                setShowAlert(true);
                                setTimeout(() => setShowAlert(false), 3000); // Hide alert after 3 seconds
                              }
                            }}
                          >
                            –
                          </button>
                          {isServiceDeleteConfirmVisible && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-auto w-full z-50 flex items-center justify-center">
                              <div className="relative mx-auto p-5 border w-72 md:w-96 h-44 md:h-52 max-w-md shadow-lg rounded-md bg-white">
                                <div className="text-center">
                                  <div className="mb-4">
                                    {/* Icon container */}
                                    <div className="flex justify-center">
                                      {/* You can replace the svg with the actual icon you want to use */}
                                      <img
                                        src={warning}
                                        alt="Back"
                                        className="h-auto w-4 md:h-auto w-8 "
                                      />
                                    </div>
                                  </div>
                                  <p className="text-gray-800 text-xs md:text-md font-medium  mb-5">
                                    {t("areYouSure")}
                                  </p>
                                  <div className="flex justify-center gap-4 mt-5 md:mt-10">
                                    <button
                                      className="bg-red-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                                      type="button"
                                      onClick={() =>
                                        setIsServiceDeleteConfirmVisible(false)
                                      }
                                    >
                                      {t("no")}
                                    </button>
                                    <button
                                      className="bg-green-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
                                      type="button"
                                      onClick={
                                        handleDeleteConfirmationServiceTable
                                      }
                                    >
                                      {t("yes")}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <button
                            className="plus-btn bg-blue-100 pb-1 text-black border  rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                            onClick={addServiceTable}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {serviceTables.map((table, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-md border border-gray-300 mb-5"
                        >
                          <table className="w-full">
                            <thead>
                              <tr className="bg-blue-100">
                                <th
                                  className={`font-normal border border-gray-300 px-4 py-2 ${
                                    isArabic ? "text-right" : "text-left"
                                  } w-2/3`}
                                >
                                  {t("serviceItem")}
                                </th>
                                <th
                                  className={`font-normal border border-gray-300 px-4 py-2 ${
                                    isArabic ? "text-right" : "text-left"
                                  }`}
                                >
                                  {t("price")}
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              <tr>
                                <td className="border border-gray-300  ">
                                  <input type="text" className="p-4 w-full" />
                                </td>
                                <td className="border border-gray-300  ">
                                  <input type="text" className="p-4 w-full" />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>

                    {/* Category */}
                    <div className="ship-to-section-container ">
                      <div className="flex justify-end p-2 mb-3 mt-7">
                        <div className="flex items-center">
                          <button
                            className="minus-btn bg-blue-100 pb-1 text-black border  rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                            onClick={() => {
                              if (CategoryTables.length > 1) {
                                setIsCategoryDeleteConfirmVisible(true);
                              } else {
                                setShowAlert(true);
                                setTimeout(() => setShowAlert(false), 3000);
                              }
                            }}
                          >
                            –
                          </button>
                          {isCategoryDeleteConfirmVisible && (
                            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-auto w-full z-50 flex items-center justify-center">
                              <div className="relative mx-auto p-5 border w-72 md:w-96 h-44 md:h-52 max-w-md shadow-lg rounded-md bg-white">
                                <div className="text-center">
                                  <div className="mb-4">
                                    {/* Icon container */}
                                    <div className="flex justify-center">
                                      {/* You can replace the svg with the actual icon you want to use */}
                                      <img
                                        src={warning}
                                        alt="Back"
                                        className="h-auto w-4 md:h-auto w-8 "
                                      />
                                    </div>
                                  </div>
                                  <p className="text-gray-800 text-xs md:text-md font-medium  mb-5">
                                    {t("areYouSure")}
                                  </p>
                                  <div className="flex justify-center gap-4 mt-5 md:mt-10">
                                    <button
                                      className="bg-red-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                                      type="button"
                                      onClick={() =>
                                        setIsCategoryDeleteConfirmVisible(false)
                                      }
                                    >
                                      {t("no")}
                                    </button>
                                    <button
                                      className="bg-green-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
                                      type="button"
                                      onClick={
                                        handleDeleteConfirmationCategoryTable
                                      }
                                    >
                                      {t("yes")}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          <button
                            className="plus-btn bg-blue-100 pb-1 text-black border  rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                            onClick={addCategoryTable}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      {CategoryTables.map((table, index) => (
                        <div
                          key={index}
                          className="overflow-hidden rounded-md border border-gray-300 mb-5"
                        >
                          <table className="w-full">
                            <thead>
                              <tr className="bg-blue-100">
                                <th
                                  className={`font-normal border border-gray-300 px-4 py-2 ${
                                    isArabic ? "text-right" : "text-left"
                                  } w-2/3`}
                                >
                                  {t("category")}
                                </th>
                                <th
                                  className={`font-normal border border-gray-300 px-4 py-2 ${
                                    isArabic ? "text-right" : "text-left"
                                  }`}
                                >
                                  {t("price")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="border border-gray-300  ">
                                  <input type="text" className="p-4 w-full" />
                                </td>
                                <td className="border border-gray-300  ">
                                  <input type="text" className="p-4 w-full" />
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-20 mb-8 gap-3">
                      <button
                        type="button"
                        style={{ backgroundColor: "#272C6F" }}
                        className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                        onClick={showModal}
                      >
                        {t("update")}
                      </button>
                    </div>
                    {isModalVisible && (
                      <div
                        className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-auto w-full"
                        id="my-modal"
                      >
                        <div className="relative top-20 mx-auto p-5 border w-72 md:w-96 h-60 md:h-72 mt-32 shadow-lg rounded-md bg-white">
                          <div className="mt-3 text-center">
                            <div className=" flex items-center justify-center mt-5 ">
                              {/* Checkmark icon */}
                              <img
                                src={checkmark}
                                alt="Back"
                                className="h-auto w-12"
                              />
                            </div>
                            <h3 className="text-sm md:text-lg leading-6 font-medium text-gray-900 mt-4 md:mt-8">
                              {t("applicationmodification")}
                            </h3>
                            {/* Button to close the modal */}
                            <div className="mt-6 md:mt-8">
                              <button
                                type="button"
                                className="inline-flex justify-center w-28 md:w-40 rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none "
                                onClick={() => {
                                  hideModal();
                                  navigate("/home");
                                }}
                              >
                                {t("close")}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
            </main>
            <Footer />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomerInformation;
