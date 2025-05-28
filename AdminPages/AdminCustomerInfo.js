import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import pencil from "../Images/pencil.png";
import CloseIcon from "../Images/close.png";
import warning from "../Images/warning.png";
import checkmark from "../Images/checkmark.png";
import axios from "axios";
import api from "../UserPages/api"
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { Loader } from "../Component/Loader";
import { useAdminNewCustomerContext } from "../Context/AdminNewCustomerContext";
import { formatNumber } from "../UserPages/CustomerOptions";
import TableComponent from "../Component/TableComponent";
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

const CustomerInfo = () => {
  const [cookies] = useCookies(["token"]);

  const token = cookies.token?.token;
  const dbName = cookies.token?.selectedCompany;
  const userCode = cookies.token?.userCode;
  const location = useLocation();
  const {
    currentStep,
    setCurrentStep,
    adminEditAttachments,
    setAdminEditAttachments,
    adminuploadedFiles,
    setAdminUploadedFiles,
  } = useAdminNewCustomerContext();
  const [BPType, setBPType] = useState("");

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
  } = location.state || {};

  const adminCustomerInfo = JSON.parse(
    localStorage.getItem("adminCustomerInfo")
  );

 
  const adminCustomerInfoHome = JSON.parse(
    localStorage.getItem("adminCustomerInfoHome")
  );
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

  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const navigate = useNavigate();
  const generalInfoRef = useRef(null);
  const FinancialInfoRef = useRef(null);
  const PricesInfoRef = useRef(null);
  const { customerId } = useParams();

  const customerStatus = adminCustomerInfo[0]?.approvalStatusName;
  const [selectedFile, setSelectedFile] = useState(null);
  const [reason, setReason] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Set state with extracted data
  const [customerName, setCustomerName] = useState(cardName || "");
  const [fullName, setfullName] = useState("");
  const [foreignNameState, setforeignName] = useState(foreignName || "");
  const [nationalIdState, setnationalId] = useState(nationalId || "");
  const [addressState, setaddress] = useState(address || "");
  const [telephoneNo, settelephoneNo] = useState(phoneNo || "");
  const [faxState, setfax] = useState(fax || "");
  const [emailState, setemail] = useState(email || "");
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
  const [rejectionReason, setRejectionReason] = useState("");
  const [acceptReason, setAcceptReason] = useState("");

  const [isExemptNew, setisExemptNew] = useState("");
  const [shipToAPI, setShipToAPI] = useState([]);
  const [serviceItemsAPI, setServiceItemsAPI] = useState([]);
  const [itemsAPI, setItemsAPI] = useState([]);
  const [getAttachmentAPI, setGetAttachmentAPI] = useState([]);
  const [clickedAttachment, setClickedAttachment] = useState("");

  useEffect(() => {
    if (adminCustomerInfo[0]?.hasFather === "N") {
      setBPType("Father");
    }
    if (adminCustomerInfo[0]?.hasFather === "Y") {
      setBPType("Child");
    }
  }, [adminCustomerInfo[0]?.hasFather]);

  useEffect(() => {
    if (adminCustomerInfo[0]?.isExempt == "Y") {
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
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
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
            customerCode: adminCustomerInfo[0]?.cardCode,
          },
        });

        if (response.data.status === "Success") {
          setBranches(response.data.results);
        } else {
          alert("Failed to fetch branches");
        }
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
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
            customerCode: adminCustomerInfo[0]?.cardCode,
          },
        });

        if (response.data.status === "Success") {
          console.log(response.data.results, "Ship to");
          
          setShipToAPI(response.data.results);
        }
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch shipTos error:", error);
      } finally {
        setLoading(false);
      }
    };

    //// Service Items API
    const fetcCustomerServiceItems = async () => {
      const url = `${backendUrl}api/GetCustomerServiceItems`;
      try {
        setLoading(true);
        const response = await axios.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
            customerCode: `${adminCustomerInfo[0]?.cardCode}`,
          },
        });

        console.log(response, "ServiceItems");

        setServiceItemsAPI(response.data.results);
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch fetcCustomerServiceItems error:", error);
      } finally {
        setLoading(false);
      }
    };

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
            customerCode: `${adminCustomerInfo[0]?.cardCode}`,
          },
        });

        console.log(response, "Items");

        setItemsAPI(response?.data.results);
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Fetch fetcCustomerItems error:", error);
      } finally {
        setLoading(false);
      }
    };

    /// Get Attachment
    const GetAttachments = async () => { 
     const url = `${attachmentUrl}/CustomerAttachments/GetFiles?dbName=${dbName}&cardCode=${adminCustomerInfo[0]?.cardCode}`;
      try {
        setLoading(true);
        const response = await axios.get(url);
        console.log(response, "Attachments");

        setGetAttachmentAPI(response?.data);

        const apiFiles = response?.data;

        // Define a function to get the file type based on its extension
        const getFileType = (fileName) => {
          const extension = fileName.split(".").pop().toLowerCase();
          if (["png", "jpg", "jpeg", "gif"].includes(extension))
            return "image/png";
          if (extension === "txt") return "text/plain";
          if (extension === "pdf") return "application/pdf";
          return "unknown";
        };

        // Mock function to generate metadata (e.g., lastModified, size)
        const generateMockMetadata = (fileName) => {
          return {
            lastModified: Date.now(), // Use the current timestamp as a mock
            size: Math.floor(Math.random() * 100000) + 1000, // Mock size between 1KB and 100KB
            type: getFileType(fileName),
            webkitRelativePath: "", // Default empty as per example
          };
        };

        // Map the file paths into the desired format
        const formattedFiles = apiFiles.map((filePath) => {
          const name = filePath.split("\\").pop(); // Extract the file name
          const metadata = generateMockMetadata(name);
          // Create a placeholder Blob for the file content
          const fileContent = new Blob(["placeholder content"], {
            type: metadata.type,
          });

          // Create the File object
          const file = new File([fileContent], name, {
            type: metadata.type,
            lastModified: metadata.lastModified,
          });

          return {
            file, // Include the constructed File object
            name: name,
            type: metadata.type,
            customType: "Predefined",
            filePath: filePath, // Original file path
          };
        });
        setAdminUploadedFiles(formattedFiles);
      } catch (error) {
        console.error("Fetch GetAttachments error:", error);

        toast.error(
          ` Status:${error?.response?.data.status} Code:${error?.response?.data.statusCode} Message: ${error?.response?.data.errorMessage}`
        );

      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
    fetcCustomerShipTos();
    fetcCustomerServiceItems();
    fetcCustomerItems();
    GetAttachments();
  }, [dbName, token, adminCustomerInfo[0]?.cardCode]);

  //DownLoade Attchment functions
  const DownloadAttachment = async (fileName) => {
    console.log(fileName, "clicked file name");

    const url = `${attachmentUrl}/CustomerAttachments/DownloadFile?fileName=${fileName}`;
    console.log(url, "working url");

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
        ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
      );

      console.error("Fetch DownloadAttachment error:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteAttachment = (index) => {
    setAdminUploadedFiles((prevAttachments) =>
      prevAttachments.filter((_, i) => i !== index)
    );
  };
  const handleAttachmentClick = (fileName) => {
    setClickedAttachment(fileName);
    DownloadAttachment(fileName);
  };

  const UpdateAttachmentsAPI = async (cardCode) => {
    setAdminEditAttachments(false);

  const formDataAppend = new FormData();
  adminuploadedFiles.forEach((fileObj) => {

    formDataAppend.append("files", fileObj.file); 
  });

  for (let pair of formDataAppend.entries()) {
    console.log(pair);
    console.log(
      pair[0] + ":------------------------------------- " + pair[1]
    );
  }

  const formDataObject = {};
  formDataAppend.forEach((value, key) => {
    formDataObject[key] = value;
  });

 // console.log(customerRequestJson, "update attachments");
  const headers = {
    dbname: cookies.token?.selectedCompany,
    token: cookies.token?.token,
    cardCode
  };

  try {
    setLoading(true);
    const response = await api.post(`api/UpdateCustomerAttachaments`, formDataAppend, {
      headers,
    });
  

  } catch (error) {
    console.error("Error updating the attachments:", error);
    const errorMessage = error?.response?.data?.errorMessage;
    toast.error(
      `Add Customer Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${errorMessage}`
    );
  } finally {
    setLoading(false);
  }




  };

  const Dropdown = ({ label, value, readOnly, options }) => (
    <div className="flex flex-col space-y-2 mt-5">
      <label className="text-sm">{label}</label>
      {options ? (
        <select
          className={`p-2 w-3/4 xl:w-1/2 border rounded-xl 
          ${readOnly ? "bg-gray-200 text-gray-500 cursor-not-allowed" : ""}`} // Apply styles if read-only
          value={value} // Ensure this matches one of the option values
          onChange={(e) => !readOnly && setCustomerGroup(e.target.value)} // Prevent onChange if read-only
          disabled={readOnly}
        >
          {console.log("Dropdown options:", options)}{" "}
          {/* Log the options to check if they are being passed correctly */}
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {" "}
              {/* Use option.value for value */}
              {console.log(option, "optioof dd")}
              {option.label} {/* Use option.label for label */}
            </option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          readOnly={readOnly}
          disabled={readOnly} // Disables the input
          className={`p-2 w-3/4 xl:w-1/2 border rounded-xl 
            ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`} // Applies styles if read-only
        />
      )}
    </div>
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    const allowedExtensions = ["image/*", "text/plain", "application/pdf"];

    const type = fileType === "Other" ? reason : t(fileType);

    // Check if the file type is allowed
    const isValidType = allowedExtensions.some((extension) => {
      if (extension === "image/*") {
        return file?.type.startsWith("image/");
      }
      return file?.type === extension;
    });
    //test
    if (isValidType) {
      const fileMetadata = {
        file,
        name: file?.name,
        type: file?.type,
        customType: type,
      };
      setAdminUploadedFiles((prevFiles) => [...prevFiles, fileMetadata]);
      // setGetAttachmentAPI((prevFiles) => [...prevFiles, fileMetadata.name]);

      // Reset fields
      setFileType("");
      setReason("");
      event.target.value = ""; // Clear the file input value
    } else {
      setModalMessage(t("warning"));
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const showRejectModal = () => {
    setIsRejectModalOpen(true);
  };

  const hideRejectModal = () => setIsRejectModalOpen(false);

  const submitRejection = async () => {
    const body = {
      approverUserCode: userCode,
      customerCode: adminCustomerInfo[0]?.cardCode,
      //guid: adminCustomerInfo[0]?.guid,
      response: "R",
      note: rejectionReason,
    };

    const headers = {
      accept: "*/*",
      dbname: cookies.token?.selectedCompany,
      token: cookies.token?.token,
    };

    try {
      setLoading(true);
      const response = await api.post(
        `api/ResponseOnAdd`,
        body,
        {
          headers,
        }
      );

      console.log("Response on Rejection API:", response.data);
      hideRejectModal();
    } catch (error) {
      toast.error(
        ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
      );

      console.error("Error on Rejection API:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitAccept = async () => {
    const body = {
      approverUserCode: userCode,
      customerCode: adminCustomerInfo[0]?.cardCode,
      // guid: adminCustomerInfo[0]?.guid,
      response: "A",
      note: acceptReason,
    };

    const headers = {
      accept: "*/*",
      dbname: cookies.token?.selectedCompany,
      token: cookies.token?.token,
    };
    console.log(body, "body, Approved");
    console.log(headers, "headers, approved");

    try {
      setLoading(true);
      const response = await api.post(
        `api/ResponseOnAdd`,
        body,
        {
          headers,
        }
      );

      console.log("Response on Accept API:", response.data);
      hideRejectModal();
    } catch (error) {
      toast.error(
        ` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
      );

      console.error("Error on Accept API:", error);
    } finally {
      setLoading(false);
    }
  };

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
    setCurrentStep(1);
  };
  const handleNextToFinancialClick = () => {
    setShowGeneralInfo(false);
    setShowFinancialInfo(true);
    setCurrentStep(2);
  };

  const handleNextToPricesInfoClick = () => {
    setShowFinancialInfo(false);
    setShowPricesInfo(true);
    setShowGeneralInfo(false);
    setShowPersonalInfo(false);
    setCurrentStep(3);
  };

  const handleNextToEdit = () => {
    setShowPersonalInfo(false);
    setShowGeneralInfo(false);
    setShowFinancialInfo(false);
    setShowPricesInfo(false);
    setIsEditModalOpen(true);
    setCurrentStep(4);
  };

  const handleAttachmentsEdit = () => {
    setAdminEditAttachments(true);
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

  const shouldRenderTableComponent = (arr) => {
    // Check if the array is not empty and contains at least one object with the 'date' property
    return (
      arr.length > 0 &&
      arr.some((obj) => obj.hasOwnProperty("date") && obj.date)
    );
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
                      {customerStatus === "Approved" && (
                        <img
                          src={pencil}
                          alt="Edit"
                          className="h-5 w-3 md:h-auto w-6 cursor-pointer"
                          onClick={handleNextToEdit}
                        />
                      )}
                    </div>
                  </div>

                  <InputField
                    label={t("customerName")}
                    value={adminCustomerInfo[0]?.cardName}
                    readOnly={true}
                  />

                  <InputField
                    label={t("fullName")}
                    value={adminCustomerInfo[0]?.fullName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("foreignName")}
                    value={adminCustomerInfo[0]?.foreignName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("fullforeignName")}
                    value={adminCustomerInfo[0]?.fullforeignName}
                    readOnly={true}
                  />

                  <InputField
                    label={t("nationalId")}
                    value={adminCustomerInfo[0]?.nationalId}
                    readOnly={true}
                  />

                  <InputField
                    label={t("address")}
                    value={adminCustomerInfo[0]?.address}
                    readOnly={true}
                  />

                  <InputField
                    label={t("telephoneNo")}
                    value={adminCustomerInfo[0]?.phoneNo}
                    readOnly={true}
                  />

                  <InputField
                    label={t("fax")}
                    value={adminCustomerInfo[0]?.fax}
                    readOnly={true}
                  />
                  <InputField
                    label={t("email")}
                    value={adminCustomerInfo[0]?.email}
                    readOnly={true}
                  />

                  <InputField
                    label={t("BP Type")}
                    value={adminCustomerInfo[0]?.hasFather}
                    readOnly={true}
                  />
                  <InputField
                    label={t("parentCustomer")}
                    value={adminCustomerInfo[0]?.parentCustomerName}
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
                      <PropGridReadOnly
                        name={"Army"}
                        status={adminCustomerInfo[0]?.army}
                      />
                      <PropGridReadOnly
                        name={"Church"}
                        status={adminCustomerInfo[0]?.church}
                      />
                      <PropGridReadOnly
                        name={"Commercial Building"}
                        status={adminCustomerInfo[0]?.commercialBuilding}
                      />
                      <PropGridReadOnly
                        name={"Electricity Transmission Grids"}
                        status={
                          adminCustomerInfo[0]?.electricityTransmissionGrids
                        }
                      />
                      <PropGridReadOnly
                        name={"Farm"}
                        status={adminCustomerInfo[0]?.farm}
                      />
                      <PropGridReadOnly
                        name={"Fuel Station"}
                        status={adminCustomerInfo[0]?.fuelStation}
                      />

                      <PropGridReadOnly
                        name={"Governmental"}
                        status={adminCustomerInfo[0]?.governmental}
                      />
                      <PropGridReadOnly
                        name={"Hangar"}
                        status={adminCustomerInfo[0]?.hangar}
                      />
                      <PropGridReadOnly
                        name={"High Risk"}
                        status={adminCustomerInfo[0]?.highRisk}
                      />
                      <PropGridReadOnly
                        name={"Hospitals"}
                        status={adminCustomerInfo[0]?.hospitals}
                      />
                    </table>

                    <table style={{ borderCollapse: "collapse", width: "30%" }}>
                      <thead>
                        <tr>
                          <th style={headerStyle}>{t("Properties")}</th>
                          <th style={headerStyle}></th>
                        </tr>
                      </thead>
                      <PropGridReadOnly
                        name={"Hotels"}
                        status={adminCustomerInfo[0]?.hotels}
                      />
                      <PropGridReadOnly
                        name={"House"}
                        status={adminCustomerInfo[0]?.house}
                      />
                      <PropGridReadOnly
                        name={"Housing"}
                        status={adminCustomerInfo[0]?.housing}
                      />
                      <PropGridReadOnly
                        name={"Industrial"}
                        status={adminCustomerInfo[0]?.industrial}
                      />
                      <PropGridReadOnly
                        name={"Infrastructure"}
                        status={adminCustomerInfo[0]?.infrastructure}
                      />
                      <PropGridReadOnly
                        name={"Low Risk"}
                        status={adminCustomerInfo[0]?.lowRisk}
                      />

                      <PropGridReadOnly
                        name={"MediumRisk"}
                        status={adminCustomerInfo[0]?.mediumRisk}
                      />
                      <PropGridReadOnly
                        name={"Mosque"}
                        status={adminCustomerInfo[0]?.mosque}
                      />
                      <PropGridReadOnly
                        name={"Pipelines"}
                        status={adminCustomerInfo[0]?.pipelines}
                      />
                      <PropGridReadOnly
                        name={"Port"}
                        status={adminCustomerInfo[0]?.port}
                      />
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
                      <PropGridReadOnly
                        name={"Road"}
                        status={adminCustomerInfo[0]?.road}
                      />
                      <PropGridReadOnly
                        name={"Schools"}
                        status={adminCustomerInfo[0]?.schools}
                      />
                      <PropGridReadOnly
                        name={"store"}
                        status={adminCustomerInfo[0]?.store}
                      />
                      <PropGridReadOnly
                        name={"University"}
                        status={adminCustomerInfo[0]?.university}
                      />
                      <PropGridReadOnly
                        name={"Villa"}
                        status={adminCustomerInfo[0]?.villa}
                      />

                      <PropGridReadOnly
                        name={"Water Desalination Plant"}
                        status={adminCustomerInfo[0]?.waterDesalinationPlant}
                      />
                      <PropGridReadOnly
                        name={"WWTP"}
                        status={adminCustomerInfo[0]?.wwtp}
                      />
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
                      {customerStatus === "Approved" && (
                        <img
                          src={pencil}
                          alt="Edit"
                          className="h-5 w-3 md:h-auto w-6 cursor-pointer"
                          onClick={handleNextToEdit}
                        />
                      )}
                    </div>
                  </div>

                  <Dropdown
                    label={t("customerGroup")}
                    value={adminCustomerInfo[0]?.customerGroupName}
                    readOnly={true}
                  />

                  <InputField
                    label={t("primaryAccountManager")}
                    value={adminCustomerInfo[0]?.primaryAccountManager}
                    readOnly={true}
                  />
                  <InputField
                    label={t("secondaryAccountManager")}
                    value={adminCustomerInfo[0]?.secondaryAccountManager}
                    readOnly={true}
                  />
                  <InputField
                    label={t("concreteVAP")}
                    value={adminCustomerInfo[0]?.concreteVapName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("companyIndividual")}
                    value={adminCustomerInfo[0]?.companyOrIndividualName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("taxNoOfCompany")}
                    value={adminCustomerInfo[0]?.companyTaxNumber}
                    readOnly={true}
                  />
                  <InputField
                    label={t("companyRegistration")}
                    value={adminCustomerInfo[0]?.companyRegistration}
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
                      {customerStatus === "Approved" && (
                        <img
                          src={pencil}
                          alt="Edit"
                          className="h-5 w-3 md:h-auto w-6 cursor-pointer"
                          onClick={handleNextToEdit}
                        />
                      )}
                    </div>
                  </div>
                  {/* <InputField label={t('requiredDiscount')} value={requiredDiscount} readOnly={true}/> */}
                  <InputField
                    label={t("creditLimit")}
                    value={
                      adminCustomerInfo[0]?.creditLimit
                        ? formatNumber(adminCustomerInfo[0]?.creditLimit)
                        : ""
                    }
                    readOnly={true}
                  />
                  <InputField
                    label={t("commitmentLimit")}
                    value={
                      adminCustomerInfo[0]?.commetimentLimit
                        ? formatNumber(adminCustomerInfo[0]?.commetimentLimit)
                        : ""
                    }
                    readOnly={true}
                  />

                  <InputField
                    label={t("totalExpectedQuantity")}
                    value={
                     adminCustomerInfo[0]?.totalExpectedQuantity
                    }
                    readOnly={true}
                  />

                  <InputField
                    label={t("paymentTerms")}
                    value={adminCustomerInfo[0]?.paymentTermsName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("paymentMethod")}
                    value={adminCustomerInfo[0]?.paymentMethodName}
                    readOnly={true}
                  />
                  <InputField
                    label={t("isExempt")}
                    value={
                      adminCustomerInfo[0]?.isExempt === "Y"
                        ? t("yes")
                        : t("no")
                    }
                    readOnly={true}
                  />
                  {adminCustomerInfo[0]?.isExempt === "Y" && (
                    <>
                      <InputField
                        label={t("taxExemptedPercentage")}
                        value={adminCustomerInfo[0]?.taxExemptedGroup}
                        readOnly={true}
                      />
                      <InputField
                        label={t("exemptionTypeName")}
                        value={adminCustomerInfo[0]?.exemptionTypeName}
                        readOnly={true}
                      />
                      <InputField
                        label={t("taxExemptedQuantity")}
                        value={
                          adminCustomerInfo[0]?.taxExemptedQty
                            ? formatNumber(adminCustomerInfo[0]?.taxExemptedQty)
                            : ""
                        }
                        readOnly={true}
                      />
                      <InputField
                        label={t("exemptionPeriod")}
                        value={formatDateToDDMMYYYYReadOnly(
                          adminCustomerInfo[0]?.exemptionPeriod
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

                        {customerStatus === "Approved" && (
                          <img
                            src={pencil}
                            alt="Edit"
                            className="h-5 w-3 md:h-auto w-6 cursor-pointer"
                            onClick={handleNextToEdit}
                          />
                        )}
                      </div>
                    </div>
                    <div className="financial-info-form mx-5">
                      <div className="mt-16 mb-5">
                        <InputField
                          label={t("discount")}
                          value={adminCustomerInfo[0]?.discount}
                          readOnly={true}
                        />
                        <InputField
                          label={t("discountReason")}
                          value={adminCustomerInfo[0]?.discountReason}
                          readOnly={true}
                        />
                        <InputField
                          label={t("otherReason")}
                          value={adminCustomerInfo[0]?.discountOtherReason}
                          readOnly={true}
                        />

                        <InputField
                          label={t("extraCharges")}
                          value={
                            adminCustomerInfo[0]?.extraCharges
                              ? formatNumber(adminCustomerInfo[0]?.extraCharges)
                              : ""
                          }
                          readOnly={true}
                        />
                        <InputField
                          label={t("extraChargesReason")}
                          value={adminCustomerInfo[0]?.extraChargesReason}
                          readOnly={true}
                        />
                        <InputField
                          label={t("otherReason")}
                          value={adminCustomerInfo[0]?.extraChargesOtherReason}
                          readOnly={true}
                        />
                      </div>

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

                      {/* Ship-to-section */}
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

                              header:   t("location"),
                              accessor: "locationUrl",
                            },
                            { header: t("city"), accessor: "city" },
                            { header: t("street"), accessor: "street" },
                          ]}
                        />
                      )}

                      <img
                        src={pencil}
                        alt="Edit"
                        className="h-5 w-3 md:h-auto w-6 cursor-pointer"
                        onClick={handleAttachmentsEdit}
                      />

                      {/* File Download */}
                      {getAttachmentAPI.length != 0 && (
                        <div className="flex flex-col file-upload mt-4 mb-6 bg-gray-100 rounded-lg p-4 shadow-md">
                          <h3 className="text-lg font-semibold mb-3 text-gray-700">
                            Attachments
                          </h3>
                          <ul className="space-y-2">
                            {adminuploadedFiles.map((attachment, index) => (
                              <li
                                key={index}
                                className="flex items-center space-x-3"
                              >
                                <button
                                  onClick={() =>
                                    handleAttachmentClick(attachment.filePath)
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
                                    {attachment.filePath || attachment.name}
                                  </span>
                                </button>
                                {adminEditAttachments && (
                                  <button
                                    onClick={() =>
                                      handleDeleteAttachment(index)
                                    }
                                    className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                      className="w-5 h-5"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {adminEditAttachments && (
                        <input
                          type="file"
                          className="w-1/4 p-2 border rounded-xl mt-2 mb-4"
                          onChange={handleFileChange}
                          accept="image/*,.txt,.pdf"
                        />
                      )}

                      {/* Back and Done Buttons */}
                      {adminCustomerInfo[0]?.approvalStatus == "P" && (
                        <div className="flex justify-end mt-8 mb-8 gap-3">
                          {adminEditAttachments && (
                            <button
                              type="button"
                              style={{ backgroundColor: "#D40909" }}
                              className="px-4 md:px-16 py-1 pb-2 text-xs md:text-sm text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                              onClick={()=> UpdateAttachmentsAPI(adminCustomerInfo[0].cardCode)}
                            >
                              {t("update")}
                            </button>
                          )}
                          {!adminEditAttachments && (
                            <>
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
                            </>
                          )}
                        </div>
                      )}

                      {isModalVisible && (
                        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center px-4">
                          <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-auto p-5 border">
                            <div className="flex justify-between items-center pb-3">
                              <p className="text-xl font-bold">
                                {t("acceptApplication")}
                              </p>
                              <button
                                className="text-black p-1"
                                onClick={hideModal}
                              >
                                &times;
                              </button>
                            </div>
                            <p>{t("applicationAccepted")}</p>{" "}
                            {/* Make sure you have 'rejectionMessage' in your i18n files */}
                            <textarea
                              className="w-full h-40 p-2 mt-4 mb-4 border rounded-md"
                              placeholder={t("accceptionPlaceholder")} // Add 'rejectionPlaceholder' to your i18n files
                              value={acceptReason}
                              onChange={(e) =>
                                setAcceptReason(e.target.value)
                              }
                            ></textarea>
                            {/* Make sure you have 'rejectionMessage' in your i18n files */}
                            <div className="flex justify-end">
                              <button
                                style={{ backgroundColor: "#272C6F" }}
                                className="hover:bg-blue-800 text-white py-1 px-4 rounded"
                                onClick={() => {
                                  navigate("/admin-new-customers");
                                  submitAccept();
                                  toast.success(
                                    "You have successfully accepted this new customer request."
                                  );
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
                              onChange={(e) =>
                                setRejectionReason(e.target.value)
                              }
                            ></textarea>
                            <div className="flex justify-end">
                              <button
                                style={{ backgroundColor: "#272C6F" }}
                                className="hover:bg-blue-800 text-white py-1 px-4 rounded"
                                onClick={() => {
                                  navigate("/admin-new-customers");
                                  submitRejection();
                                  toast.success(
                                    "You have successfully rejected this new customer request."
                                  );
                                }}
                              >
                                {t("submit")}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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

export default CustomerInfo;
