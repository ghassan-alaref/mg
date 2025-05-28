import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import enUS from "antd/lib/locale/en_US";
import arEG from "antd/lib/locale/ar_EG";
import { useTranslation } from "react-i18next";
import Sidebar from "../Component/Sidebar";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import Notifications from "../Component/Notifications";
import ArrowIcon from "../Images/left.png";
import checkmark from "../Images/checkmark.png";
import warning from "../Images/warning.png";
import { useCookies } from "react-cookie";
import DropdownField from "../Component/DropdownField";
import { toast } from "react-toastify";
import { Loader } from "../Component/Loader";
import { useAppContext } from "../Context/NewCustomerContext";
import Select from "react-select";
import PropertyGrid from "../Component/PropertyGrid";
import api from "./api";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const initialLocations = [
  "Shmeisani",
  "Abdoun",
  "Abdali",
  "Sweileh",
  "Dabouq",
  "Al-Weibdeh",
  "Tabarbour",
  "Irbid",
  "Mafraq",
  "Ramtha",
];

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
              <div
                className={`flex items-center  justify-center w-10 h-10 rounded-full text-lg font-bold  ${
                  index < currentStep
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500"
                } border-2 border-blue-500`}
              >
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

const InputField = ({
  label,
  required,
  onChange,
  value,
  showError,
  onKeyPress,
  inputType = "text",
  name,
}) => (
  <div className="flex flex-col space-y-2 mt-5">
    <label className="text-sm">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={inputType}
      value={value}
      name={name} // Add the name attribute to the input element
      onChange={onChange}
      className={`p-2 w-3/4 xl:w-1/2 border rounded-xl ${
        showError ? "border-red-500" : ""
      }`}
      aria-required={required}
      aria-invalid={showError}
    />
  </div>
);

export const DropdownFieldTest = ({
  label,
  name,
  options,
  onChange,
  selectedTerm,
}) => {
  console.log(label, name, options);

  // Initialize state conditionally based on selectedTerm or local storage
  const [selectedValue, setSelectedValue] = useState(() => {
    if (selectedTerm?.payTermCode) {
      return selectedTerm.payTermCode.toString();
    }
    return localStorage.getItem(name) || "";
  });

  // Handle change event
  const handleChange = (event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    if (onChange) {
      onChange(event);
    }
  };

  // Persist selected value in local storage on change
  useEffect(() => {
    localStorage.setItem(name, selectedValue);
  }, [name, selectedValue]);

  return (
    <div className="flex flex-col space-y-2 mt-5">
      <label className="text-sm">{label}</label>
      <select
        name={name}
        value={selectedValue}
        onChange={handleChange}
        className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
      >
        <option hidden>Select an option</option>
        <option value="" disabled hidden>
          Select an option
        </option>
        {options.length > 0 ? (
          options.map((option) => (
            <React.Fragment key={option.payTermCode}>
              {option?.payTermName === "" && (
                <option disabled hidden>
                  {option?.payTermCode}
                </option>
              )}

              <option value={option.payTermCode}>{option.payTermName}</option>
            </React.Fragment>
          ))
        ) : (
          <option disabled>No options available</option>
        )}
      </select>
    </div>
  );
};
export const DropdownFieldInternaly = ({
  label,
  name,
  options,
  selectedValue,
  onChange,
}) => {
  const [localSelectedValue, setLocalSelectedValue] = useState(selectedValue);

  useEffect(() => {
    setLocalSelectedValue(selectedValue);
  }, [selectedValue]);

  const handleChange = (event) => {
    const value = event.target.value;
    setLocalSelectedValue(value);
    onChange(value);
  };

  return (
    <div className="flex flex-col space-y-2 mt-5">
      <label className="text-sm">{label}</label>
      <select
        name={name}
        value={localSelectedValue}
        onChange={handleChange}
        className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.value === ""}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const NewCustomers = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["token"]);
  const [currentEditingRow, setCurrentEditingRow] = useState(null);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationLink, setLocationLink] = useState("");
  const navigate = useNavigate();
 const {
    currentStep,
    customerName,
    nationalId,
    address,
    telephoneNo,
    formData,
    setCurrentStep,
    setCustomerName,
    setNationalId,
    setAddress,
    setTelephoneNo,
    setFormData,
    selectedCoustomerGroupValue,
    setSelectedCustomerGroupValue,
    selectedBranchValue,
    setSelectedBranchValue,
    selectedPrimaryValue,
    setSelectedPrimaryValue,
    selectedSecValue,
    setSelectedSecValue,
    selectedConcreteVapValue,
    setSelectedConcreteVapValue,
    selectedType,
    setSelectedType,
    companyRegistration,
    setCompanyRegistration,
    selectedParentCustomerValue,
    setSelectedParentCustomerValue,
    selectedCollectionMethodValue,
    setSelectedCollectionMethodValue,
    selectedPaymentMethodValue,
    setSelectedPaymentMethodValue,
    paymentTerms,
    setPaymentTerms,
    selectedTerm,
    setSelectedTerm,
    creditLimit,
    setCreditLimit,
    commitmentLimit,
    setCommitmentLimit,
    isExempt,
    setIsExempt,
    discount,
    setDiscount,
    discountReasonselectedOption,
    setDiscountReasonselectedOption,
    extraCharges,
    setExtraCharges,
    extraChargesReasonselectedOption,
    setExtraChargesReasonselectedOption,
    shipTo,
    setShipTo,
    categoryTables,
    setCategoryTables,
    serviceTables,
    setServiceTables,
    uploadedFiles,
    setUploadedFiles,
    fileType,
    setFileType,
    attemptedNext,
    setAttemptedNext,
    isAllRequiredPersonalInfo,
    setIsAllRequiredPersonalInfo,
    isAllRequiredGeneralInfo,
    setIsAllRequiredGeneralInfo,
    isAllRequiredFinancialInfo,
    setIsAllRequiredFinancialInfo,
    attemptedNextFinancialClick,
    setAttemptedNextFinancialClick,
    attemptedNextPricesInfoClick,
    setAttemptedNextPricesInfoClick,
    showPersonalInfo,
    setShowPersonalInfo,
    showGeneralInfo,
    setShowGeneralInfo,
    showFinancialInfo,
    setShowFinancialInfo,
    showPricesInfo,
    setShowPricesInfo,
    parentLabel,
    setparentLabel,
    selectedOption,
    setSelectedOption,
    isDiscountOther,
    setIsDiscountOther,
    isExtraChargesOther,
    setIsExtraChargesOther,
    discountOtherText,
    setDiscountOtherText,
    extraChargesOtherText,
    setExtraChargesOtherText,
    discountOtherError,
    setDiscountOtherError,
    typeOfExemption,
    setTypeOfExemption,
    exemptionPeriod,
    setExemptionPeriod,
    taxExemptedPercentage,
    setTaxExemptedPercentage,
    taxExemptedQuantity,
    setTaxExemptedQuantity,
    properties,
    totalExpectedQuantity,
    setTotalExpectedQuantity,
  } = useAppContext();

  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let { latitude, longitude } = position.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        setLocationLink(
          `https://www.google.com/maps?q=${latitude},${longitude}`
        );
        console.log(position.coords, "Show the position");
        shipTo.forEach((_, index) => {
          handleshipToInputChange(
            index,
            "LocationURL",
            `https://www.google.com/maps?q=${latitude},${longitude}`
          );
        });
      },

      (error) => {
        console.error("Error fetching location:", error);
        alert("Please enable location access.");
      }
    );
  }, []);

  useEffect(() => {
    const token = cookies?.token?.token;
    if (!token) {
      localStorage.removeItem("isAuthenticated");
      sessionStorage.removeItem("isAuthenticated");

      // Clear saved username and password
      localStorage.removeItem("username");
      localStorage.removeItem("password");

      navigate("/");
      return;
    }
  }, [cookies, navigate]);

// Initialize state from localStorage on mount
useEffect(() => {
  const savedValue = localStorage.getItem("selectedParentCustomerValue");
  const savedLabel = localStorage.getItem("parentLabel");
  if (savedValue && savedLabel) {
    setSelectedOption({ value: savedValue, label: savedLabel });
    setSelectedParentCustomerValue(savedValue);
    setparentLabel(savedLabel);
  }
}, []);
  
  const headers = {
    "Content-Type": "application/json",
    dbname: cookies.token?.selectedCompany,
    token: cookies.token?.token,
  };
 
  const propertiesObject = properties.reduce((acc, property) => {
    acc[property.name] = property.status;
    return acc;
  }, {});

  const hadStatusY = properties.some((prop) => prop.status === "Y");

  console.log(cookies.token?.token, cookies.token?.selectedCompany);
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? arEG : enUS;
  const [isLoading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  /////////////////////////////////////////////////////
  const [customerGroup, setCustomerGroup] = useState("");
  const [branch, setBranch] = useState("");

  // Step 3 state

  ////

  const [tables, setTables] = useState([{}]);
  const isArabic = i18n.language === "ar";
  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisibleWarning, setIsModalVisibleWarning] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isServiceDeleteConfirmVisible, setIsServiceDeleteConfirmVisible] =
    useState(false);
  const [isShipToDeleteConfirmVisible, setIsShipToDeleteConfirmVisible] =
    useState(false);

  const [isCategoryDeleteConfirmVisible, setIsCategoryDeleteConfirmVisible] =
    useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const generalInfoRef = useRef(null);
  const FinancialInfoRef = useRef(null);
  const PricesInfoRef = useRef(null);
  const [reason, setReason] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [extraChargesOtherError, setExtraChargesOtherError] = useState(false);

  ////////////////////////////////////////////////////////////////////
  const [shipToFromApi, setShipToFromApi] = useState([]);
  const [items, setItems] = useState([]);
  const [serviceItems, setServiceItems] = useState([]);

  const [customers, setCustomers] = useState([]);
  const [filteredData, setFilteredData] = useState(customers);
  const [selectedCustomer, setSelectedCustomer] = useState(null);


  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  // Convert from dd-mm-yyyy to yyyy-mm-dd when sending to the server or storing
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleDropdownDiscountReason = (event) => {
    if (event.target.value === "07") {
      setIsDiscountOther(true);
    } else {
      setIsDiscountOther(false);
      setDiscountOtherText("");
    }
    setDiscountReasonselectedOption(event.target.value);
  };

  const handleDropdownextraChargesReason = (event) => {
    if (event.target.value === "07") {
      setIsExtraChargesOther(true);
    } else {
      setIsExtraChargesOther(false);
      setExtraChargesOtherText("");
    }

    setExtraChargesReasonselectedOption(event.target.value);
  };

  ////////////////
  const [serviceItemValue, setServiceItemValue] = useState("");
  const [ItemValue, setItemValue] = useState("");

  ////////////////

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);

        const response = await api.get("api/GetShipTos", {
          headers,
        });
        if (response.data.status === "Success") {
          setShipToFromApi(response.data.results);
          // setOptions(response.data.results);
        } else {
          alert(`Failed to fetch data from GetShipTos`);
        }
      } catch (error) {
        if (error.response.statusText === "Forbidden") {
          removeCookie("token", { path: "/" });
          navigate("/");
        }
        toast.error(`Error accrued while fetching data from ShipTos`);
        console.error(`Error fetching data from GetShipTos:`, error);
      } finally {
        setLoading(false);
      }
    };

    const fetchItems = async () => {
      try {
        setLoading(true);
        const headers = {
          "Content-Type": "application/json",
          dbname: cookies.token?.selectedCompany,
          token: cookies.token?.token,
          branchID: selectedBranchValue,
        };
        const response = await api.get(`api/GetItems`, {
          headers,
        });

        if (response.data.status === "Success") {
          const responseData = response.data.results;
console.log(responseData, "responseData");

          const inventoryItems = responseData.filter(
            (item) => item.inventoryItem === "Y"
          );
          const serviceItems = responseData.filter(
            (item) => item.inventoryItem === "N"
          );

          setItems(inventoryItems);
          setServiceItems(serviceItems);
        } else {
          alert(`Failed to fetch data from Items`);
        }
      } catch (error) {
        toast.error(`Error accrued while fetching data from Items`);
      } finally {
        setLoading(false);
      }
    };

    const fetchPaymentTerms = async () => {
      try {
        setLoading(true);

        const response = await api.get(`api/GetPaymentTerms`, {
          headers,
        });
        if (response.data.status === "Success") {
          const responseData = response.data.results;
          setPaymentTerms(responseData);
        } else {
          alert(`Failed to fetch data from fetchPaymentTerms`);
        }
      } catch (error) {
        toast.error(`Error accrued while fetching data from Payment Terms`);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
    if (selectedBranchValue) {
      fetchItems();
    }
    fetchPaymentTerms();
  }, [selectedBranchValue]);

  const formattedServiceItemsOptions = serviceItems.map((item) => ({
    value: item.itemCode,
    label: item.itemName,
    price: item.price,
  }));

  const formattedItemsOptions = items.map((item) => ({
    value: item.itemCode,
    label: item.itemName,
    price: item.price,
  }));

  ////GetCustomer:
  const handleCustomerClick = (customer) => {
    if (customer) {
      setSelectedCustomer(customer);
    } else {
      // For seeAllResults, set the state to include all customers
      setFilteredData(customers);
    }
  };

  const [searchValue, setSearchValue] = useState("");
  const [optionsTest, setOptions] = useState([]);

  useEffect(() => {
    if (searchValue !== "") {
      const fetchData = setTimeout(async () => {
        const url = `api/GetCustomers?filter=${searchValue}`;
        try {
          setLoading(true);
          console.log(
            url,
            cookies.token?.selectedCompany,
            cookies.token?.token
          );

          const response = await api.get(url, {
            headers: {
              "Content-Type": "application/json",
              dbName: cookies.token?.selectedCompany,
              token: cookies.token?.token,
            },
          });

          if (response.data.results.length === 0) {
            toast.error(
              `No matches found. Please try a different search term.`
            );
            setOptions([]);
            return;
          }

          const formattedOptions = response.data.results.map((customer) => ({
            value: customer.cardCode,
            label: customer.cardName,
          }));
          setOptions(formattedOptions);
        } catch (error) {
          toast.error(`Error occurred while fetching customer data.`);
          console.error("Fetch customers error:", error);
        } finally {
          setLoading(false);
        }
      }, 1000);

      return () => clearTimeout(fetchData);
    }
  }, [searchValue, backendUrl, cookies]);

  //////////////////

  const handleParentChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedParentCustomerValue(selectedOption.value);
      setparentLabel(selectedOption.label);
      setSelectedOption(selectedOption);
      localStorage.setItem("selectedParentCustomerValue", selectedOption.value);

      localStorage.setItem("parentLabel", selectedOption.label);
    } else {
      setSelectedParentCustomerValue("");
      setparentLabel("");
      localStorage.removeItem("selectedParentCustomerValue");
      localStorage.removeItem("parentLabel");
      setSelectedOption(null);
    }
  };

  const clearSelection = () => {
    handleParentChange(null);
  };

  //Step 1 States

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "taxNoOfCompany") {
      if (/^\d*$/.test(value)) {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));
      } else {
        toast.error("Tax Number of Company must contain only numbers.");
      }
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleNationalIdChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setNationalId(value);
    } else {
      toast.error("National ID must contain only numbers.");
    }
  };

  // Telephone No validation

  const handleTelephoneNoChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTelephoneNo(value);
    } else {
      toast.error("Telephone No. must contain only numbers.");
    }
  };

  // CreditLimit validation

  const handleCreditLimitChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCreditLimit(value);
    } else {
      toast.error("Credit Limit must contain only numbers.");
    }
  };

  //  setCommitmentLimit Validation

  const handleCommitmentLimitChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCommitmentLimit(value);
    } else {
      toast.error("Commitment Limit must contain only numbers.");
    }
  };
  const handleTotalExpectedQuantityChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setTotalExpectedQuantity(value);
    } else {
      toast.error("Total Expected Quantity must contain only numbers.");
    }
  };

  //  Discount Validation

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setDiscount(value);
    } else {
      toast.error("Discount must contain only numbers.");
    }
  };

  useEffect(() => {
    if (discount === "") {
      setDiscountReasonselectedOption("");
      setDiscountOtherText("");
    }

    if (extraCharges === "") {
      setExtraChargesReasonselectedOption("");
      setExtraChargesOtherText("");
    }
  }, [discount, extraCharges]);

  //Step 2 States

  const handleTypeChange = (value) => {
    setSelectedType(value);
  };

  const handleExemptionType = (value) => {
    setTypeOfExemption(value);
  };

  const handleTaxExemptedPercentage = (value) => {
    setTaxExemptedPercentage(value);
  };

  const options = [
    { label: t("Select an option"), value: "" },
    { label: t("Company"), value: "C" },
    { label: t("Individual"), value: "I" },
  ];

  const validateSelections = () => {
    return (
      selectedCoustomerGroupValue !== "" &&
      selectedBranchValue !== "" &&
      selectedPrimaryValue !== "" &&
      selectedSecValue !== "" &&
      selectedConcreteVapValue !== "" &&
      selectedType !== ""
    );
  };
  const stepTwoDropdownValidation = validateSelections();
  ///////////////
  //step 3

  const handleDropdownChange = (event) => {
    const selectedOption = paymentTerms.find(
      (term) => term.payTermCode === event.target.value
    );
    setSelectedTerm({
      payTermCode: selectedOption.payTermCode,
      payTermDays: selectedOption.payTermDays,
    });
  };

  const validateSelectionsstepThree = () => {
    return (
      selectedCollectionMethodValue !== "" &&
      selectedPaymentMethodValue !== "" &&
      paymentTerms.length !== 0 &&
      isExempt !== ""
    );
  };
  const stepThreeDropdownValidation = validateSelectionsstepThree();
  //////Step 4

  const [locations, setLocations] = useState(initialLocations); //Ship to
  /////Service Items

  const addServiceTable = () => {
    setServiceTables((prevTables) => [
      ...prevTables,
      { itemCode: "", price: "", selectedServiceOption: null },
    ]);
  };

  const handleServiceItemsChange = (index, selectedOption) => {
    console.log(selectedOption, "check selectedOption");

    let checkIfItemIsSelectedBefore = serviceTables.some(
      (item) => item.itemCode === selectedOption.value
    );

    if (checkIfItemIsSelectedBefore) {
      toast.error(
        "This item has already been selected. Please choose a different value."
      );
    } else {
      setServiceTables((prevTables) =>
        prevTables.map((table, i) =>
          i === index
            ? {
                ...table,
                selectedServiceOption: selectedOption,
                itemCode: selectedOption.value,
                price: table.price,
              }
            : table
        )
      );
    }
  };

  const clearServiceSelection = (index) => {
    setServiceTables((prevTables) =>
      prevTables.map((table, i) =>
        i === index
          ? { ...table, selectedServiceOption: null, itemCode: "", price: "" }
          : table
      )
    );
  };

  const handlePriceChange = (index, price) => {
    const value = price;
    if (/^\d*$/.test(value)) {
      const updatedTables = [...serviceTables];
      updatedTables[index].price = price;
      setServiceTables(updatedTables);
    } else {
      toast.error("Price must contain only numbers.");
    }
  };

  //////Items

  const handleItemsChange = (index, selectedOption) => {
    console.log(selectedOption, "selected option");

    let checkIfItemIsSelectedBefore = categoryTables.some(
      (item) => item.itemCode === selectedOption.value
    );

    if (checkIfItemIsSelectedBefore) {
      toast.error(
        "This item has already been selected. Please choose a different value."
      );
    } else {
      setCategoryTables((prevTables) =>
        prevTables.map((table, i) =>
          i === index
            ? {
                ...table,
                selectedItemOption: selectedOption,
                itemCode: selectedOption.value,
                price: selectedOption.price,
                specialdiscount: selectedOption.specialdiscount,
                FinalPrice: selectedOption.FinalPrice,
              }
            : table
        )
      );
    }
  };

  const clearItemSelection = (index) => {
    setCategoryTables((prevTables) =>
      prevTables.map((table, i) =>
        i === index
          ? {
              ...table,
              selectedItemOption: null,
              itemCode: "",
              price: "",
              specialdiscount: "",
              FinalPrice: "",
            }
          : table
      )
    );
  };

  const addCategoryTable = () => {
    setCategoryTables((prevTables) => [
      ...prevTables,
      {
        itemCode: "",
        price: "",
        selectedItemOption: null,
        specialdiscount: "",
        FinalPrice: "",
      },
    ]);
  };

  const handleCatPriceChange = (index, price) => {
    const value = price;
    if (/^\d*$/.test(value)) {
      const newCategoryTables = [...categoryTables];
      newCategoryTables[index].price = price;
      setCategoryTables(newCategoryTables);
    } else {
      toast.error("Price must contain only numbers.");
    }
  };

  const handleCatspecialDiscountChange = (index, specialdiscount) => {
    const value = specialdiscount;
    if (/^\d*\.?\d*$/.test(value)) { 
      const newCategoryTables = [...categoryTables];
      newCategoryTables[index].specialdiscount = value;
  
      // Calculate finalPrice
      const price = parseFloat(newCategoryTables[index].price) || 0;
      const specialDiscount = parseFloat(value) || 0;
      const extra = parseFloat(extraCharges) || 0;
      const disc = parseFloat(discount) || 0;
      const finalPrice = price + extra - disc - specialDiscount;
  
      newCategoryTables[index].FinalPrice = finalPrice.toFixed(3); 
      setCategoryTables(newCategoryTables);
    } else {
      toast.error("Special Discount must contain only numbers.");
    }
  };

  // Ship To

  const [locationInput, setLocationInput] = useState("");
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [showAddNewOption, setShowAddNewOption] = useState(false);
  const locationInputRef = useRef();

  const handleLocationChange = (index, value) => {
    setLocationInput(value);
    const filtered = shipToFromApi.filter((location) =>
      location.shipToName.includes(value)
    );
    setFilteredLocations(filtered);
    setShowAddNewOption(filtered.length === 0);
    updateShipTo(index, "shipToName", value);
    setCurrentEditingRow(index);
  };

  const handleSuggestionClick = (index, suggestion) => {
    let checkIfItemIsSelectedBefore = shipTo.some(
      (item) => item.shipToCode === suggestion.shipToCode
    );

    if (checkIfItemIsSelectedBefore) {
      toast.error(
        "This item has already been selected. Please choose a different value."
      );
    } else {
      updateShipTo(index, "shipToName", suggestion.shipToName);
      updateShipTo(index, "shipToCode", suggestion.shipToCode);
      setLocationInput("");
      setFilteredLocations([]);
      setShowAddNewOption(false);
      setCurrentEditingRow(null);
    }
  };

  const handleAddNewLocation = (index) => {
    updateShipTo(index, "shipToName", locationInput);
    updateShipTo(index, "shipToCode", ""); // Keep code empty for new locations
    setLocationInput("");
    setFilteredLocations([]);
    setShowAddNewOption(false);
  };

  const handleshipToInputChange = (index, field, value) => {
    console.log(value, "teeesst");

    updateShipTo(index, field, value);
  };

  const updateShipTo = (index, field, value) => {
    const updatedShipTo = [...shipTo];
    updatedShipTo[index][field] = value;
    setShipTo(updatedShipTo);
  };

  console.log(shipTo);

  const addTable = () => {
    setShipTo([
      ...shipTo,
      {
        shipToCode: "",
        shipToName: "",
        expectedQty: "",
        distance: "",
        city: "",
        street: "",
        LocationURL: locationLink,
      },
    ]);


  };

  const handleDeleteTable = (index) => {
    setShipTo((prevShipTo) => prevShipTo.filter((_, i) => i !== index));
  };

  const handleCustomerGroupChange = (e) => {
    setSelectedCustomerGroupValue(e.target.value);
  };
  console.log(selectedCoustomerGroupValue);

  const handleBranchChange = (e) => {
    setSelectedBranchValue(e.target.value);
  };

  const handlePrimaryAccountManager = (e) => {
    setSelectedPrimaryValue(e.target.value);
  };

  const handleSecAccountManager = (e) => {
    setSelectedSecValue(e.target.value);
  };

  const handleGetConcreteVap = (e) => {
    setSelectedConcreteVapValue(e.target.value);
  };

  const CollectionMethodOptions = [
    { label: t("Select an option"), value: "" },
    { label: t("Cash"), value: "Cash" },
    { label: t("creditCard"), value: "Credit" },
  ];

  const handleCollectionMethodChange = (value) => {
    setSelectedCollectionMethodValue(value);
  };

  const handleGetPaymentMethod = (e) => {
    setSelectedPaymentMethodValue(e.target.value);
  };

  const handleDiscountOtherTextChange = (e) => {
    const value = e.target.value;
    setDiscountOtherText(value);
    setDiscountOtherError(value.trim() === "");
  };

  const handleExtraChargesOtherTextChange = (e) => {
    const value = e.target.value;
    setExtraChargesOtherText(value);
    setExtraChargesOtherError(value.trim() === "");
  };


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
          return file?.type.startsWith("image/");
        }
        return file?.type === extension;
      });
      //test
      if (isValidType) {
        const fileMetadata = {
          file, // Store the file object itself
          name: file.name,
          type: file.type,
          customType: type, // Add your custom type or reason here
        };
        setUploadedFiles((prevFiles) => [...prevFiles, fileMetadata]);
        //  setUploadedFiles((prevFiles) => [...prevFiles, { file, type }]);

        // Reset fields
        setFileType("");
        setReason("");
        event.target.value = "";

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

  //Upload Files Validation
  const checkRequiredFiles = (
    uploadedFiles,
    selectedPaymentMethodValue,
    IsTaxExempt
  ) => {
    const requiredFiles = [
      t("National ID"),
      t("Inspector Result"),
      t("Sales Agreement"),
      t("Company Registration"),
    ];

    if (selectedPaymentMethodValue === 2) {
      requiredFiles.push(t("Bank Guarantee Letter"));
    }

    if (IsTaxExempt === "Y") {
      requiredFiles.push(t("Tax Exempted Letter"));
    }

    const fileTypes = uploadedFiles.map((file) => file.customType);
    const missingFiles = requiredFiles.filter(
      (requiredFile) => !fileTypes.includes(requiredFile)
    );

    return missingFiles;
  };

  const handleFileValidation = () => {
    const missingFiles = checkRequiredFiles(
      uploadedFiles,
      selectedPaymentMethodValue,
      isExempt
    );

    if (missingFiles.length > 0) {
      toast.error(`Missing required attachments: ${missingFiles.join(", ")}`);
      return false;
    }

    return true;
  };

  const removeTable = () => {
    if (tables.length > 1) {
      setTables(tables.slice(0, -1));
    }
  };

  const removeServiceTable = () => {
    const hasCheckedItems = serviceTables.some((table) => table.isChecked);

    if (!hasCheckedItems) {
      toast.error("No items selected to delete.");
      return;
    }

    setServiceTables((prevServiceTables) =>
      prevServiceTables.filter((table) => !table.isChecked)
    );
  };

  const removeCategoryTable = () => {
    const hasCheckedItems = categoryTables.some((table) => table.isChecked);

    if (!hasCheckedItems) {
      toast.error("No items selected to delete.");
      return;
    }

    setCategoryTables((prevServiceTables) =>
      prevServiceTables.filter((table) => !table.isChecked)
    );
  };

  const handleServiceTablesCheckBox = (index) => {
    setServiceTables((prevTables) =>
      prevTables.map((table, i) =>
        i === index
          ? {
              ...table,
              isChecked: !table.isChecked,
            }
          : table
      )
    );
  };

  const handleCategoryTablesCheckBox = (index) => {
    setCategoryTables((prevTables) =>
      prevTables.map((table, i) =>
        i === index
          ? {
              ...table,
              isChecked: !table.isChecked,
            }
          : table
      )
    );
  };

  const handleShipToCheckBox = (index) => {
    setShipTo((prevTables) =>
      prevTables.map((table, i) =>
        i === index
          ? {
              ...table,
              isChecked: !table.isChecked,
            }
          : table
      )
    );
  };

  const removeShipToTable = () => {
    const hasCheckedItems = shipTo.some((table) => table.isChecked);

    if (!hasCheckedItems) {
      toast.error("No items selected to delete.");
      return;
    }

    setShipTo((prevServiceTables) =>
      prevServiceTables.filter((table) => !table.isChecked)
    );
  };

  const handleDeleteConfirmation = () => {
    removeTable();
    setIsDeleteConfirmVisible(false);
  };

  const handleDeleteConfirmationServiceTable = () => {
    removeServiceTable();
    setIsServiceDeleteConfirmVisible(false);
  };

  const handleDeleteConfirmationCategoryTable = () => {
    removeCategoryTable();
    setIsCategoryDeleteConfirmVisible(false);
  };

  const handleDeleteConfirmationShipToTable = () => {
    removeShipToTable();
    setIsShipToDeleteConfirmVisible(false);
  };

  const prepareCategoryTableDataForSubmission = () => {
    return categoryTables.map((table) => {
      const price = parseFloat(table.price) || 0;
      const specialDiscount = parseFloat(table.specialdiscount) || 0;
      const extra = parseFloat(extraCharges) || 0;
      const disc = parseFloat(discount) || 0;
  
      const finalPrice = price + extra - disc - specialDiscount;
  
      return {
        ...table,
        price: finalPrice, 
      };
    });
  };

  useEffect(() => {
    if (isExempt === "N") {
      setTypeOfExemption("");
      setTaxExemptedPercentage("");
      setTaxExemptedQuantity("");
      setExemptionPeriod("");
    }

    if (typeOfExemption === "P") {
      setTaxExemptedQuantity("");
    }

    if (typeOfExemption === "Q") {
      setExemptionPeriod("");
    }

    if (typeOfExemption === "N") {
      setTaxExemptedQuantity("");

      setExemptionPeriod("");
    }
  }, [isExempt, typeOfExemption]);

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

  const showModal = async () => {
    //Post Request
    const isValid = handleFileValidation();
    const areShipToFieldsFilled = shipTo.every(
      (shipTo) => shipTo.shipToName !== ""
    );

    const areItemsFieldsFilled = categoryTables.every(
      (item) => item.itemCode !== "" && item.price !== ""
    );

    if (!areShipToFieldsFilled) {
      toast.error("Please select or add a 'Ship To' entry.");
    }
    if (!areItemsFieldsFilled) {
      toast.error("Please select an item and fill in the price field.");
    }

    const formattedCategoryTables = prepareCategoryTableDataForSubmission();
    console.log(formattedCategoryTables, "dataToSenddataToSend");
    
    if (isValid && areShipToFieldsFilled && areItemsFieldsFilled) {
      const customerRequestJson = {
        CustomerName: customerName,
        CustomerFName: formData.foreignName,
        CustomerFullName: formData.fullName,
        fullforeignName: formData.fullforeignName,
        CustomerGroupCode: selectedCoustomerGroupValue,
        CreditLimit: creditLimit,
        CommitmentLimit: commitmentLimit,
        PayTermCode: selectedTerm.payTermCode,
        PayTermDays: selectedTerm.payTermDays,
        BranchId: selectedBranchValue,
        Address: address,
        PhoneNo: telephoneNo,
        Fax: formData.fax,
        Email: formData.email,
        CompanyRegNo: companyRegistration,
        NationalId: nationalId,
        //   ParentCustomer: selectedParentCustomerValue,
        CreditType: selectedCollectionMethodValue,
        CustomerType: selectedType,
        IsTaxExempt: isExempt,
        CompanyTaxNumber: formData.taxNoOfCompany,
        //  ExemptionType: typeOfExemption,
        ExemptionQuantity: taxExemptedQuantity,
        ExemptionPeriod: exemptionPeriod,
        ExemptionPercentage: taxExemptedPercentage,
        ConcreteVap: selectedConcreteVapValue,
        PrimaryAccountManager: selectedPrimaryValue,
        SecondaryAccountManager: selectedSecValue,
        PaymentMethod: selectedPaymentMethodValue,
        Discount: discount,
        DiscountReason: discountReasonselectedOption,
        //DiscountOtherReason:
        ExtraCharges: extraCharges,
        ExtraChargesReason: extraChargesReasonselectedOption,
        //ExtraChargesOtherReason
        army: propertiesObject["army"],
        church: propertiesObject["church"],
        commercialBuilding: propertiesObject["commercialBuilding"],
        electricityTransmissionGrids:
          propertiesObject["electricityTransmissionGrids"],
        farm: propertiesObject["farm"],
        fuelStation: propertiesObject["fuelStation"],
        governmental: propertiesObject["governmental"],
        hangar: propertiesObject["hangar"],
        highRisk: propertiesObject["highRisk"],
        hospitals: propertiesObject["hospitals"],
        hotels: propertiesObject["hotels"],
        house: propertiesObject["house"],
        housing: propertiesObject["housing"],
        industrial: propertiesObject["industrial"],
        infrastructure: propertiesObject["infrastructure"],
        lowRisk: propertiesObject["lowRisk"],
        mediumRisk: propertiesObject["mediumRisk"],
        mosque: propertiesObject["mosque"],
        pipelines: propertiesObject["pipelines"],
        port: propertiesObject["port"],
        residential: propertiesObject["residential"],
        road: propertiesObject["road"],
        schools: propertiesObject["schools"],
        store: propertiesObject["store"],
        university: propertiesObject["university"],
        villa: propertiesObject["villa"],
        waterDesalinationPlant: propertiesObject["waterDesalinationPlant"],
        wwtp: propertiesObject["wwtp"],
        totalExpectedQuantity: totalExpectedQuantity,
        userCode: cookies.token?.userCode,
        ShipTo: shipTo,
        Item: formattedCategoryTables,
      };

      // send discount others text
      if (selectedParentCustomerValue) {
        customerRequestJson.ParentCustomer = selectedParentCustomerValue; //parent customer optional
      }
      if (discountReasonselectedOption === "07") {
        customerRequestJson.DiscountOtherReason = discountOtherText;
      }
      if (typeOfExemption != "") {
        customerRequestJson.ExemptionType = typeOfExemption;
      }
      if (extraChargesReasonselectedOption === "07") {
        customerRequestJson.ExtraChargesOtherReason = extraChargesOtherText;
      }

      const areFieldsFilled = serviceTables.every(
        (service) => service.itemCode !== "" && service.price !== ""
      );

      if (areFieldsFilled) {
        customerRequestJson.ServiceItem = serviceTables;
      }

      const formDataAppend = new FormData();
      formDataAppend.append(
        "customerRequestJson",
        JSON.stringify(customerRequestJson)
      );

      // If you have files to append

      console.log(uploadedFiles, "check the uploaded files");

      uploadedFiles.forEach((fileObj) => {
        console.log(fileObj.file, "check the file path");

        formDataAppend.append("files", fileObj.file); // Append the actual file
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

      console.log(customerRequestJson, "posstteedddddddddd");
      console.log(formDataObject, "formDataAppend");
      const headers = {
        dbname: cookies.token?.selectedCompany,
        token: cookies.token?.token,
      };

      try {
        setLoading(true);
        const response = await api.post(`api/AddCustomer`, formDataAppend, {
          headers,
        });
        console.log(
          "Response from adding new customer",
          response.data,
          "ooooooooooooo"
        );

        ///////
        let valid = true;

        if (isDiscountOther && !discountOtherText.trim()) {
          setDiscountOtherError(true);
          valid = false;
        } else {
          setDiscountOtherError(false);
        }

        if (isExtraChargesOther && !extraChargesOtherText.trim()) {
          setExtraChargesOtherError(true);
          valid = false;
        } else {
          setExtraChargesOtherError(false);
        }

        if (valid) {
          setIsModalVisible(true);
          setCurrentStep(4);
        }
        setCurrentStep(0);
        setCustomerName("");
        setNationalId("");
        setAddress("");
        setTelephoneNo("");
        setFormData({
          fullName: "",
          foreignName: "",
          fullforeignName: "",
          fax: "",
          email: "",
          taxNoOfCompany: "",
        });
        setSelectedCustomerGroupValue("");
        setSelectedBranchValue("");
        setSelectedPrimaryValue("");
        setSelectedSecValue("");
        setSelectedConcreteVapValue("");
        setSelectedType("");
        setCompanyRegistration("");
        setSelectedParentCustomerValue("");
        setSelectedCollectionMethodValue("");
        setCreditLimit("");
        setDiscount("");
        setDiscountReasonselectedOption("");
        setExtraCharges("");
        setExtraChargesReasonselectedOption("");
        setShipTo([
          {
            shipToCode: "",
            shipToName: "",
            expectedQty: "",
            distance: "",
            city: "",
            street: "",
            LocationURL: "",
          },
        ]);
        setCategoryTables([
          {
            itemCode: "",
            price: "",
            selectedItemOption: null,
            specialdiscount: "",
            FinalPrice: ""
          },
        ]);
        setServiceTables([
          { itemCode: "", price: "", selectedServiceOption: null },
        ]);
        setUploadedFiles([]);
        setCommitmentLimit("");
        setSelectedPaymentMethodValue("");
        setIsExempt("");
        setPaymentTerms([]);
        setTotalExpectedQuantity("");
        ////
      } catch (error) {
        console.error("Error:", error);
        const errorMessage = error?.response?.data?.errorMessage;
        toast.error(
          `Add Customer Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${errorMessage}`
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const checkEmailFormat = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    setIsAllRequiredPersonalInfo(
      customerName.trim() !== "" &&
        nationalId.trim() !== "" &&
        address.trim() !== "" &&
        telephoneNo.trim() !== "" &&
        formData.email.trim() !== "" &&
        checkEmailFormat(formData.email) &&
        hadStatusY === true
    );
  }, [
    customerName,
    nationalId,
    address,
    telephoneNo,
    formData.email,
    hadStatusY,
  ]);

  useEffect(() => {
    if (selectedType === "C") {
      setIsAllRequiredGeneralInfo(
        /* customerGroup.trim() !== "" &&
      branch.trim() !== "" && 
       */
        companyRegistration.trim() !== ""
      );
    }
  }, [customerGroup, branch, companyRegistration]);

  useEffect(() => {
    setIsAllRequiredFinancialInfo(
      creditLimit.trim() !== "" &&
        commitmentLimit.trim() !== "" &&
        totalExpectedQuantity.trim() !== ""
    );
  }, [creditLimit, commitmentLimit, totalExpectedQuantity]);

  const handleNextClick = () => {
    setAttemptedNext(true);
    if (!checkEmailFormat(formData.email)) {
      toast.error("Please check the email format.");
    }

    if (isAllRequiredPersonalInfo) {
      setShowPersonalInfo(false);
      setShowGeneralInfo(true);
      setCurrentStep(1);
    }
  };
  const handleNextToFinancialClick = () => {
    if (!stepTwoDropdownValidation) {
      toast.error("Please select an option for all dropdown fields.");
    } else {
      setAttemptedNextFinancialClick(true);

      if (isAllRequiredGeneralInfo || selectedType === "I") {
        setShowGeneralInfo(false);
        setShowFinancialInfo(true);
        setCurrentStep(2);
      }
    }
  };

  const handleNextToPricesInfoClick = () => {
    if (!stepThreeDropdownValidation) {
      toast.error("Please select an option for all dropdown fields.");
    } else {
      setAttemptedNextPricesInfoClick(true);

      let valid = true;

      if (isExempt === t("Y")) {
        if (formData.taxNoOfCompany === "") {
          toast.error("Please Fill Tax Number of Company.");
        }

        if (!taxExemptedPercentage.trim()) {
          toast.error("Please Fill Tax Exempted Percentage.");
          valid = false;
        }
        if (!typeOfExemption.trim()) {
          toast.error("Please Fill Type Of Exemption.");

          valid = false;
        }
        if (typeOfExemption === t("Q") && !taxExemptedQuantity.trim()) {
          toast.error("Please Fill Tax Exempted Quantity.");

          valid = false;
        }
        if (typeOfExemption === t("P") && !exemptionPeriod.trim()) {
          toast.error("Please Fill Exemption Period.");

          valid = false;
        }
      }

      if (isAllRequiredFinancialInfo && valid) {
        setShowFinancialInfo(false);
        setShowPricesInfo(true);
        setShowGeneralInfo(false);
        setShowPersonalInfo(false);
        setCurrentStep(3);
      }
    }
  };

  const handleBackPersonalInfo = () => {
    setShowPersonalInfo(true);
    setShowGeneralInfo(false);
    setShowFinancialInfo(false);
    setCurrentStep(0);
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
                  <h1 className="text-sm font-bold">{t("personalInfo")}</h1>

                  <InputField
                    label={t("customerName")}
                    required
                    onChange={(e) => setCustomerName(e.target.value)}
                    value={customerName}
                  />

                  {attemptedNext && !customerName && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredField")}*
                    </span>
                  )}

                  <InputField
                    label={t("fullName")}
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  <InputField
                    label={t("foreignName")}
                    name="foreignName"
                    value={formData.foreignName}
                    onChange={handleChange}
                  />
                  <InputField
                    label={t("fullforeignName")}
                    name="fullforeignName"
                    value={formData.fullforeignName}
                    onChange={handleChange}
                  />

                  <InputField
                    label={t("nationalId")}
                    required
                    onChange={handleNationalIdChange}
                    value={nationalId}
                  />

                  {attemptedNext && !nationalId && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredField")}*
                    </span>
                  )}
                  <InputField
                    label={t("address")}
                    required
                    onChange={(e) => setAddress(e.target.value)}
                    value={address}
                  />
                  {attemptedNext && !address && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredField")}*
                    </span>
                  )}
                  <InputField
                    label={t("telephoneNo")}
                    required
                    onChange={handleTelephoneNoChange}
                    value={telephoneNo}
                  />
                  {attemptedNext && !telephoneNo && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredField")}*
                    </span>
                  )}
                  <InputField
                    label={t("fax")}
                    name="fax"
                    value={formData.fax}
                    onChange={handleChange}
                  />
                  <InputField
                    label={t("email")}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {attemptedNext && !formData.email && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredFieldorCheckEmailFormat")}*
                    </span>
                  )}
                  {/* <InputField label={t('property')} /> */}
                  <div style={{ display: "flex", gap: 18, marginTop: 24 }}>
                    <PropertyGrid maxCount={10} offset={0} />
                    <PropertyGrid maxCount={10} offset={10} />
                    <PropertyGrid maxCount={10} offset={20} />
                  </div>
                  {attemptedNext && !hadStatusY && (
                    <span className="text-red-500 text-xs ">
                      {t("selectAtLeastOneProp")}*
                    </span>
                  )}
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

                  <DropdownField
                    label={t("customerGroup")}
                    required={true}
                    labelKey="groupName"
                    valueKey="groupCode"
                    onChange={handleCustomerGroupChange}
                    value={selectedCoustomerGroupValue}
                    endpoint={`${backendUrl}api/GetCustomerGroups`}
                    headers={headers}
                  />

                  {attemptedNextFinancialClick && !customerGroup && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredField")}*
                    </span>
                  )}

                  <DropdownField
                    label={t("Branch")}
                    required={true}
                    labelKey="branchName"
                    valueKey="branchCode"
                    onChange={handleBranchChange}
                    value={selectedBranchValue}
                    endpoint={`${backendUrl}api/GetBranches`}
                    headers={headers}
                  />

                  {attemptedNextFinancialClick && !branch && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredField")}*
                    </span>
                  )}

                  <DropdownField
                    label={t("primaryAccountManager")}
                    required={true}
                    labelKey="accountManagerName"
                    valueKey="accountManagerCode"
                    onChange={handlePrimaryAccountManager}
                    value={selectedPrimaryValue}
                    endpoint={`${backendUrl}api/GetAccountManager`}
                    headers={headers}
                  />

                  <DropdownField
                    label={t("secondaryAccountManager")}
                    required
                    valueKey="accountManagerCode"
                    labelKey="accountManagerName"
                    onChange={handleSecAccountManager}
                    value={selectedSecValue}
                    endpoint={`${backendUrl}api/GetAccountManager`}
                    headers={headers}
                  />
                  <DropdownField
                    label={t("concreteVAP")}
                    required
                    valueKey="code"
                    labelKey="name"
                    onChange={handleGetConcreteVap}
                    value={selectedConcreteVapValue}
                    endpoint={`${backendUrl}api/GetConcreteVap`}
                    headers={headers}
                  />

                  <DropdownFieldInternaly
                    label={t("companyIndividual")}
                    name="companyIndividual"
                    options={options}
                    onChange={handleTypeChange}
                    selectedValue={selectedType}
                  />

                  <InputField
                    label={t("taxNoOfCompany")}
                    name="taxNoOfCompany"
                    value={formData.taxNoOfCompany}
                    onChange={handleChange}
                  />

                  {selectedType === "C" && (
                    <>
                      <InputField
                        label={t("companyRegistration")}
                        required
                        onChange={(e) => setCompanyRegistration(e.target.value)}
                        value={companyRegistration}
                      />
                      {attemptedNextFinancialClick && !companyRegistration && (
                        <span className="text-red-500 text-xs ">
                          {t("requiredField")}*
                        </span>
                      )}
                    </>
                  )}

                  <div className="flex flex-col space-y-1 mt-5">
                    <label className="text-sm mb-2">
                      {t("parentCustomer")}{" "}
                    </label>
                    <div className="relative">
                      <Select
                        className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
                        options={optionsTest}
                        placeholder={isLoading ? "Loading..." : "Search..."}
                        onInputChange={(inputValue) =>
                          setSearchValue(inputValue)
                        }
                        onChange={handleParentChange}
                        isLoading={isLoading}
                        noOptionsMessage={() =>
                          isLoading ? "Loading..." : "No options"
                        }
                        value={selectedOption}
                      />
                      {selectedOption && (
                        <button
                          className={`absolute ${
                            isArabic ? "right-4" : "left-4"
                          } top-2 text-gray-500 hover:text-gray-700`}
                          onClick={clearSelection}
                        >
                          &#x2715;
                        </button>
                      )}
                    </div>
                  </div>

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
                  <div className="flex flex-row mr-0 md:mr-0  items-center">
                    <img
                      src={ArrowIcon}
                      alt="Back"
                      className={`h-5 w-3 md:h-auto w-6 ${
                        isArabic ? "transform rotate-180" : ""
                      } cursor-pointer ${isArabic ? "ml-0 md:ml-0" : ""}`}
                      onClick={handleBackGeneralInfo}
                    />
                    <h1 className="text-sm font-bold">{t("financialInfo")}</h1>
                  </div>
                  {/* <InputField label={t('requiredDiscount')} /> */}

                  <DropdownFieldInternaly
                    label={t("collectionMethod")}
                    name="collectionMethod"
                    options={CollectionMethodOptions}
                    onChange={handleCollectionMethodChange}
                    selectedValue={selectedCollectionMethodValue}
                  />

                  <InputField
                    label={t("creditLimit")}
                    required
                    onChange={handleCreditLimitChange}
                    value={creditLimit}
                  />

                  {attemptedNextPricesInfoClick && !creditLimit && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredField")}*
                    </span>
                  )}
                  <InputField
                    label={t("commitmentLimit")}
                    required
                    onChange={handleCommitmentLimitChange}
                    value={commitmentLimit}
                  />

                  <InputField
                    label={t("totalExpectedQuantity")}
                    required
                    onChange={handleTotalExpectedQuantityChange}
                    value={totalExpectedQuantity}
                  />

                  {attemptedNextPricesInfoClick && !commitmentLimit && (
                    <span className="text-red-500 text-xs ">
                      {t("requiredField")}*
                    </span>
                  )}

                  <DropdownFieldTest
                    label={t("paymentTerms")}
                    name="paymentTerms"
                    options={paymentTerms}
                    onChange={handleDropdownChange}
                  />

                  <DropdownField
                    label={t("paymentMethod")}
                    required
                    labelKey="name"
                    valueKey="code"
                    onChange={handleGetPaymentMethod}
                    value={selectedPaymentMethodValue}
                    endpoint={`${backendUrl}api/GetPaymentMethods`}
                    headers={headers}
                  />
                  <DropdownFieldInternaly
                    label={t("isExempt")}
                    required={isExempt === t("yes")}
                    options={[
                      { label: t("Select an option"), value: "" },
                      { label: t("yes"), value: "Y" },
                      { label: t("no"), value: "N" },
                    ]}
                    onChange={(e) => setIsExempt(e)}
                    value={isExempt}
                    selectedValue={isExempt}
                    name="isExempt"
                  />
                  {isExempt === "Y" && (
                    <>
                      <DropdownFieldInternaly
                        label={t("taxExemptedPercentage")}
                        required={isExempt === t("yes")}
                        options={[
                          { label: t("Select an option"), value: "" },
                          { label: t("Out 0%"), value: "Out 0%" },
                          { label: t("OutExmpt"), value: "OutExmpt" },
                        ]}
                        onChange={handleTaxExemptedPercentage}
                        value={taxExemptedPercentage}
                        showError={
                          attemptedNextPricesInfoClick && !typeOfExemption
                        }
                        selectedValue={taxExemptedPercentage}
                      />

                      <DropdownFieldInternaly
                        label={t("TypeOfExemption")}
                        required={isExempt === t("yes")}
                        options={[
                          { label: t("Select an option"), value: "" },
                          { label: t("Quantity"), value: "Q" },
                          { label: t("Period"), value: "P" },
                          { label: t("None"), value: "N" },
                        ]}
                        onChange={handleExemptionType}
                        value={typeOfExemption}
                        showError={
                          attemptedNextPricesInfoClick && !typeOfExemption
                        }
                        selectedValue={typeOfExemption}
                      />

                      {typeOfExemption === "Q" && (
                        <InputField
                          label={t("taxExemptedQuantity")}
                          required={isExempt === t("yes")}
                          onChange={(e) =>
                            setTaxExemptedQuantity(e.target.value)
                          }
                          value={taxExemptedQuantity}
                          showError={
                            attemptedNextPricesInfoClick && !taxExemptedQuantity
                          }
                        />
                      )}
                      {typeOfExemption === "P" && (
                        <InputField
                          label={t("exemptionPeriod")}
                          required={isExempt === t("yes")}
                          onChange={(e) =>
                            setExemptionPeriod(
                              formatDateToYYYYMMDD(e.target.value)
                            )
                          }
                          value={formatDateToDDMMYYYY(exemptionPeriod)}
                          showError={
                            attemptedNextPricesInfoClick && !exemptionPeriod
                          }
                          inputType="date"
                        />
                      )}
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
                    <div className="flex flex-row mr-0 md:mr-0  items-center">
                      <img
                        src={ArrowIcon}
                        alt="Back"
                        className={`h-5 w-3 md:h-auto w-6 ${
                          isArabic ? "transform rotate-180" : ""
                        } cursor-pointer ${isArabic ? "ml-0 md:ml-0" : ""}`}
                        onClick={handleBackFinancialInfo}
                      />
                      <h1 className="text-md font-bold">{t("pricesInfo")}</h1>
                    </div>
                    <div className="financial-info-form mx-5">
                      {/* Discount, Discount Reason, Extra Charges */}
                      <div className="mt-16 mb-5">
                        <InputField
                          label={t("discount")}
                          onChange={handleDiscountChange}
                          value={discount}
                        />

                        {discount && (
                          <>
                            <DropdownField
                              label={t("discountReason")}
                              required={true}
                              labelKey="name"
                              valueKey="code"
                              onChange={handleDropdownDiscountReason}
                              value={discountReasonselectedOption}
                              endpoint={`${backendUrl}api/GetDiscountReasons`}
                              headers={headers}
                            />

                            {isDiscountOther && (
                              <InputField
                                label={t("otherReason")}
                                required
                                onChange={handleDiscountOtherTextChange}
                                value={discountOtherText}
                                showError={discountOtherError}
                                t={t}
                              />
                            )}
                            {discountOtherError && (
                              <span className="text-red-500 text-xs">
                                {t("requiredField")}*
                              </span>
                            )}
                          </>
                        )}

                        <InputField
                          label={t("extraCharges")}
                          onChange={(e) => setExtraCharges(e.target.value)}
                          value={extraCharges}
                        />

                        {extraCharges && (
                          <>
                            <DropdownField
                              label={t("extraChargesReason")}
                              required={true}
                              labelKey="name"
                              valueKey="code"
                              onChange={handleDropdownextraChargesReason}
                              value={extraChargesReasonselectedOption}
                              endpoint={`${backendUrl}api/GetExtraCharges`}
                              headers={headers}
                            />

                            {isExtraChargesOther && (
                              <InputField
                                label={t("otherReason")}
                                required
                                onChange={handleExtraChargesOtherTextChange}
                                value={extraChargesOtherText}
                                showError={extraChargesOtherError}
                                t={t}
                              />
                            )}
                            {extraChargesOtherError && (
                              <span className="text-red-500 text-xs">
                                {t("requiredField")}*
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Service Item */}
                      <div className="ship-to-section-container">
                        <div className="flex justify-end p-2 mb-3 mt-7">
                          <div className="flex items-center">
                            <button
                              className="minus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                              onClick={() => {
                                if (serviceTables.length > 1) {
                                  setIsServiceDeleteConfirmVisible(true);
                                } else {
                                  setShowAlert(true);
                                  setTimeout(() => setShowAlert(false), 3000);
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
                                      <div className="flex justify-center">
                                        <img
                                          src={warning}
                                          alt="Back"
                                          className="h-auto w-4 md:h-auto w-8"
                                        />
                                      </div>
                                    </div>
                                    <p className="text-gray-800 text-xs md:text-md font-medium mb-5">
                                      {t("areYouSure")}
                                    </p>
                                    <div className="flex justify-center gap-4 mt-5 md:mt-10">
                                      <button
                                        className="bg-red-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                                        type="button"
                                        onClick={() =>
                                          setIsServiceDeleteConfirmVisible(
                                            false
                                          )
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
                              className="plus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                              onClick={addServiceTable}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="overflow-visible rounded-md border border-gray-300 mb-5">
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
                              {serviceTables.map((table, index) => (
                                <tr key={index}>
                                  <td className="border border-gray-300 relative">
                                    <div className="relative z-10">
                                      <Select
                                        options={formattedServiceItemsOptions}
                                        placeholder={
                                          isLoading
                                            ? "Loading..."
                                            : "Service Item Search..."
                                        }
                                        onInputChange={(inputValue) =>
                                          setServiceItemValue(inputValue)
                                        }
                                        onChange={(selectedOption) =>
                                          handleServiceItemsChange(
                                            index,
                                            selectedOption
                                          )
                                        }
                                        isLoading={isLoading}
                                        noOptionsMessage={() =>
                                          isLoading
                                            ? "Loading..."
                                            : "No options"
                                        }
                                        value={table.selectedServiceOption}
                                        styles={{
                                          menu: (provided) => ({
                                            ...provided,
                                            zIndex: 9999,
                                          }),
                                        }}
                                      />
                                      {table.selectedServiceOption && (
                                        <button
                                          className="absolute right-4 top-2 text-gray-500 hover:text-gray-700"
                                          onClick={() =>
                                            clearServiceSelection(index)
                                          }
                                        >
                                          &#x2715;
                                        </button>
                                      )}
                                    </div>
                                  </td>

                                  <td className="border border-gray-300 flex">
                                    <input
                                      type="text"
                                      className="p-4 w-full"
                                      value={table.price}
                                      onChange={(e) =>
                                        handlePriceChange(index, e.target.value)
                                      }
                                    />
                                    {serviceTables.length > 1 && (
                                      <input
                                        type="checkbox"
                                        checked={table.isChecked}
                                        onChange={() =>
                                          handleServiceTablesCheckBox(index)
                                        }
                                      />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Category */}
                      <div className="ship-to-section-container">
                        <div className="flex justify-end p-2 mb-3 mt-7">
                          <div className="flex items-center">
                            <button
                              className="minus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                              onClick={() => {
                                if (categoryTables.length > 1) {
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
                                      <div className="flex justify-center">
                                        <img
                                          src={warning}
                                          alt="Back"
                                          className="h-auto w-4 md:h-auto w-8"
                                        />
                                      </div>
                                    </div>
                                    <p className="text-gray-800 text-xs md:text-md font-medium mb-5">
                                      {t("areYouSure")}
                                    </p>
                                    <div className="flex justify-center gap-4 mt-5 md:mt-10">
                                      <button
                                        className="bg-red-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                                        type="button"
                                        onClick={() =>
                                          setIsCategoryDeleteConfirmVisible(
                                            false
                                          )
                                        }
                                      >
                                        {t("no")}
                                      </button>
                                      <button
                                        className="bg-green-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
                                        type="button"
                                        onClick={() =>
                                          handleDeleteConfirmationCategoryTable()
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
                              className="plus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                              onClick={addCategoryTable}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="overflow-visible rounded-md border border-gray-300 mb-5">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-blue-100">
                                <th
                                  className={`font-normal border border-gray-300 px-4 py-2 ${
                                    isArabic ? "text-right" : "text-left"
                                  } w-2/5`}
                                >
                                  {t("item")}
                                </th>
                                <th
                                  className={`font-normal border border-gray-300 px-4 py-2 ${
                                    isArabic ? "text-right" : "text-left"
                                  } w-1/5`}
                                >
                                  {t("price")}
                                </th>
                                <th
                                  className={`font-normal border border-gray-300 px-4 py-2 ${
                                    isArabic ? "text-right" : "text-left"
                                  } w-1/5`}
                                >
                                  {t("specialdiscount")}
                                </th>
                                <th
                                  className={`font-normal border border-gray-300 px-4 py-2 ${
                                    isArabic ? "text-right" : "text-left"
                                  } w-1/5`}
                                >
                                  {t("finalPrice")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryTables.map((table, index) => {
                                // Calculate final price
                                const price = parseFloat(table.price) || 0;
                                const specialDiscount =
                                  parseFloat(table.specialdiscount) || 0;
                                const extra = parseFloat(extraCharges) || 0;
                                const disc = parseFloat(discount) || 0;
                                const finalPrice =
                                  price + extra - disc - specialDiscount;

                                return (
                                  <tr key={index}>
                                    <td className="border border-gray-300 relative">
                                      <div className="relative z-12">
                                        <Select
                                          options={formattedItemsOptions}
                                          placeholder={
                                            isLoading
                                              ? "Loading..."
                                              : "Item Search..."
                                          }
                                          onInputChange={(inputValue) =>
                                            setItemValue(inputValue)
                                          }
                                          onChange={(selectedOption) =>
                                            handleItemsChange(
                                              index,
                                              selectedOption
                                            )
                                          }
                                          isLoading={isLoading}
                                          noOptionsMessage={() =>
                                            isLoading
                                              ? "Loading..."
                                              : "No options"
                                          }
                                          value={table.selectedItemOption}
                                          styles={{
                                            menu: (provided) => ({
                                              ...provided,
                                              zIndex: 9999,
                                            }),
                                          }}
                                        />
                                        {table.selectedItemOption && (
                                          <button
                                            className="absolute right-4 top-2 text-gray-500 hover:text-gray-700"
                                            onClick={() =>
                                              clearItemSelection(index)
                                            }
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="border border-gray-300">
                                      <input
                                        type="text"
                                        className="p-4 w-full"
                                        value={table.price}
                                      />
                                    </td>
                                    <td className="border border-gray-300">
                                      <input
                                        type="text"
                                        className="p-4 w-full"
                                        value={table.specialdiscount || ""}
                                        onChange={(e) =>
                                          handleCatspecialDiscountChange(
                                            index,
                                            e.target.value
                                          )
                                        }
                                      />
                                    </td>
                                    <td className="border border-gray-300 flex items-center">
                                      <input
                                        type="text"
                                        className="p-4 w-full"
                                        value={finalPrice.toFixed(3)}
                                        readOnly
                                      />
                                      {categoryTables.length > 1 && (
                                        <input
                                          type="checkbox"
                                          className="ml-2"
                                          checked={table.isChecked}
                                          onChange={() =>
                                            handleCategoryTablesCheckBox(index)
                                          }
                                        />
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Ship-to-section */}
                      <div className="ship-to-section-container">
                        <div className="flex justify-end p-2 mb-3">
                          <div className="flex items-center">
                            <button
                              className="minus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                              onClick={() => {
                                if (shipTo.length > 1) {
                                  setIsShipToDeleteConfirmVisible(true);
                                } else {
                                  setShowAlert(true);
                                  setTimeout(() => setShowAlert(false), 3000);
                                }
                              }}
                            >
                              –
                            </button>
                            {isShipToDeleteConfirmVisible && (
                              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-auto w-full z-50 flex items-center justify-center">
                                <div className="relative mx-auto p-5 border w-72 md:w-96 h-44 md:h-52 max-w-md shadow-lg rounded-md bg-white">
                                  <div className="text-center">
                                    <div className="mb-4">
                                      <div className="flex justify-center">
                                        <img
                                          src={warning}
                                          alt="Back"
                                          className="h-auto w-4 md:h-auto w-8"
                                        />
                                      </div>
                                    </div>
                                    <p className="text-gray-800 text-xs md:text-md font-medium mb-5">
                                      {t("areYouSure")}
                                    </p>
                                    <div className="flex justify-center gap-4 mt-5 md:mt-10">
                                      <button
                                        className="bg-red-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
                                        type="button"
                                        onClick={() =>
                                          setIsShipToDeleteConfirmVisible(false)
                                        }
                                      >
                                        {t("no")}
                                      </button>
                                      <button
                                        className="bg-green-500 text-white font-bold uppercase text-sm px-6 py-3 rounded shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-opacity-50"
                                        type="button"
                                        onClick={
                                          handleDeleteConfirmationShipToTable
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
                              className="plus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                              onClick={addTable}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="rounded-md border border-gray-300 mb-5">
                          <div className="overflow-x-visable">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr className="bg-blue-100">
                                  <th
                                    className={`font-normal border border-gray-300 px-4 py-2 ${
                                      isArabic ? "text-right" : "text-left"
                                    } w-1/2`}
                                  >
                                    {t("shipToSection")}{" "}
                                  </th>
                                  <th
                                    className={`font-normal border border-gray-300 px-4 py-2 ${
                                      isArabic ? "text-right" : "text-left"
                                    } `}
                                  >
                                    {t("distance")}
                                  </th>
                                  <th
                                    className={`font-normal border border-gray-300 px-4 py-2 text-left ${
                                      isArabic ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {t("Expectedquantity")}{" "}
                                  </th>
                                  <th
                                    className={`font-normal border border-gray-300 px-4 py-2 text-left ${
                                      isArabic ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {t("location")}
                                  </th>
                                  <th
                                    className={`font-normal border border-gray-300 px-4 py-2 text-left ${
                                      isArabic ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {t("city")}
                                  </th>
                                  <th
                                    className={`font-normal border border-gray-300 px-4 py-2 text-left ${
                                      isArabic ? "text-right" : "text-left"
                                    }`}
                                  >
                                    {t("street")}
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {shipTo.map((table, index) => (
                                  <>
                                    <tr>
                                      <td className="border border-gray-300 relative">
                                        <input
                                          type="text"
                                          ref={locationInputRef}
                                          className="p-4 w-full"
                                          value={table.shipToName}
                                          onChange={(e) =>
                                            handleLocationChange(
                                              index,
                                              e.target.value
                                            )
                                          }
                                        />
                                        {currentEditingRow === index &&
                                          filteredLocations.length > 0 && (
                                            <ul className="border border-gray-300 absolute bg-white w-full max-h-60 overflow-y-auto z-10">
                                              {filteredLocations.map(
                                                (suggestion, i) => (
                                                  <li
                                                    key={i}
                                                    className="p-2 cursor-pointer hover:bg-gray-200"
                                                    onClick={() =>
                                                      handleSuggestionClick(
                                                        index,
                                                        suggestion
                                                      )
                                                    }
                                                  >
                                                    {suggestion.shipToName}
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          )}
                                        {currentEditingRow === index &&
                                          showAddNewOption && (
                                            <button
                                              className="absolute right-0 top-0 mt-1 mr-1 bg-blue-500 text-white p-2 rounded"
                                              onClick={() =>
                                                handleAddNewLocation(index)
                                              }
                                            >
                                              Add "{locationInput}"
                                            </button>
                                          )}
                                      </td>
                                      <td className="border border-gray-300">
                                        <input
                                          type="text"
                                          className="p-4 w-full"
                                          value={table.distance}
                                          onChange={(e) =>
                                            handleshipToInputChange(
                                              index,
                                              "distance",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="border border-gray-300">
                                        <input
                                          type="text"
                                          className="p-4 w-full"
                                          value={table.expectedQty}
                                          onChange={(e) =>
                                            handleshipToInputChange(
                                              index,
                                              "expectedQty",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>

                                      <td className="border border-gray-300">
                                        <a
                                          href={locationLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block p-4 w-full text-blue-600 underline hover:text-blue-800"
                                          onChange={() =>
                                            handleshipToInputChange(
                                              index,
                                              "LocationURL",
                                              locationLink
                                            )
                                          }
                                        >
                                          Location
                                        </a>
                                      </td>

                                      <td className="border border-gray-300">
                                        <input
                                          type="text"
                                          className="p-4 w-full"
                                          value={table.city}
                                          onChange={(e) =>
                                            handleshipToInputChange(
                                              index,
                                              "city",
                                              e.target.value
                                            )
                                          }
                                        />
                                      </td>
                                      <td className="border border-gray-300 flex">
                                        <input
                                          type="text"
                                          className="p-4 w-full"
                                          value={table.street}
                                          onChange={(e) =>
                                            handleshipToInputChange(
                                              index,
                                              "street",
                                              e.target.value
                                            )
                                          }
                                        />

                                        {shipTo.length > 1 && (
                                          <input
                                            type="checkbox"
                                            checked={table.isChecked}
                                            onChange={() =>
                                              handleShipToCheckBox(index)
                                            }
                                          />
                                        )}
                                      </td>
                                    </tr>
                                  </>
                                ))}{" "}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="flex flex-col file-upload mt-4 mb-6">
                        <label className="block text-sm mb-2">
                          {t("chooseFilesToUpload")}
                        </label>
                        <select
                          value={fileType}
                          onChange={(e) => setFileType(e.target.value)}
                          className="w-1/2 p-2 border rounded-xl mb-4"
                        >
                          <option value="">{t("selectFileType")}</option>
                          <option value="National ID">
                            {t("National ID")}
                          </option>
                          <option value="Bank Guarantee Letter">
                            {t("Bank Guarantee Letter")}
                          </option>
                          <option value="Tax Exempted Letter">
                            {t("Tax Exempted Letter")}
                          </option>
                          <option value="Company Registration">
                            {t("Company Registration")}
                          </option>
                          <option value="Inspector Result">
                            {t("Inspector Result")}
                          </option>
                          <option value="Sales Agreement">
                            {t("Sales Agreement")}
                          </option>
                          <option value="Screening">{t("Screening")}</option>
                          <option value="Other">{t("Other")}</option>
                        </select>

                        {fileType === "Other" && (
                          <input
                            type="text"
                            className="w-1/2 p-2 border rounded-xl mb-4"
                            placeholder={t("PleaseSelectTheFileType")}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                          />
                        )}

                        <input
                          type="file"
                          className="w-1/2 p-2 border rounded-xl mt-2 mb-4"
                          onChange={handleFileChange}
                          disabled={
                            !fileType || (fileType === "Other" && !reason)
                          }
                          accept="image/*,.txt,.pdf"
                        />

                        {uploadedFiles.length > 0 && (
                          <table className="w-1/2 mt-4 border rounded-xl">
                            <thead>
                              <tr className="bg-blue-100">
                                <th className="font-normal border px-4 py-2">
                                  {t("fileName")}
                                </th>
                                <th className="font-normal border px-4 py-2">
                                  {t("fileType")}
                                </th>
                                <th className="font-normal border px-4 py-2">
                                  {t("actions")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {uploadedFiles.map((file, index) => (
                                <tr key={index}>
                                  <td className="border px-4 py-2">
                                    {file.customType}
                                  </td>{" "}
                                  <td className="border px-4 py-2">
                                    {file.name}
                                  </td>{" "}
                                  {/* Display only the file name */}
                                  <td className="border px-4 py-2">
                                    <button
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => handleRemoveFile(index)}
                                    >
                                      {t("remove")}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {isModalVisibleWarning && (
                          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50 ">
                            <div className="bg-white p-4 pt-10 rounded-lg shadow-lg sm:w-1/3 md:w-1/3 xl:w-1/5 items-center justify-center text-center">
                              <h2 className="text-xl font-semibold ">
                                {modalMessage}
                              </h2>
                              <p className="p-7 ">{t("invalidFileType")}</p>
                              <button
                                onClick={() => setIsModalVisibleWarning(false)}
                                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded-lg"
                              >
                                {t("close")}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Back and Done Buttons */}
                      <div className="flex justify-end mt-8 mb-8 gap-3">
                        <button
                          type="button"
                          style={{ backgroundColor: "#489AB9" }}
                          className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                          onClick={handleBackFinancialInfo}
                        >
                          {t("back")}
                        </button>
                        <button
                          type="button"
                          style={{ backgroundColor: "#272C6F" }}
                          className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                          onClick={showModal}
                        >
                          {t("done")}
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
                                  className="h-auto w-12 "
                                />
                              </div>
                              <h3 className="text-sm md:text-lg leading-6 font-medium text-gray-900 mt-4 md:mt-8">
                                {t("applicationSent")}
                              </h3>
                              {/* Button to close the modal */}
                              <div className="mt-6 md:mt-14">
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
                  </div>
                )}
            </main>
            <Footer />
          </div>
        )}
      </div>
      {isLoading && <Loader />}
    </div>
  );
};

export default NewCustomers;
