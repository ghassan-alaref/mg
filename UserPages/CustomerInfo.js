import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import enUS from "antd/lib/locale/en_US";
import arEG from "antd/lib/locale/ar_EG";
import { useTranslation } from "react-i18next";
import Sidebar from "../Component/Sidebar";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import Notifications from "../Component/Notifications";
import ArrowIcon from "../Images/left.png";
import pencil from "../Images/pencil.png";
import CloseIcon from "../Images/close.png";
import warning from "../Images/warning.png";
import checkmark from "../Images/checkmark.png";
import axios from "axios";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { useCustomerInfoContext } from "../Context/CustomerInfoContext";
import Select from "react-select";
import { Loader } from "../Component/Loader";
import TableComponent from "../Component/TableComponent";
import { formatNumber } from "./CustomerOptions";
import PropGridReadOnly from "../Component/PropGridReadOnly";
import { useAppContext } from "../Context/NewCustomerContext";
import DropdownField from "../Component/DropdownField";
import PropertyGrid from "../Component/PropertyGrid";
import { DropdownFieldInternaly, DropdownFieldTest } from "./NewCustomers";
import api from "./api";
const attachmentUrl = process.env.REACT_APP_ATTACHMENTS_URL;
const backendUrl = process.env.REACT_APP_BACKEND_URL;

export const formatDateToDDMMYYYYReadOnly = (dateString) => {
  if (!dateString) return "";
  let formattedDate = dateString.split(" ");
  const [month, day, year] = formattedDate[0].split("/");
  return `${month}/${day}/${year}`;
};

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

export const headerStyle = {
  border: "1px solid #ddd",
  padding: "8px",
  backgroundColor: "#f2f2f2",
  textAlign: "left",
  fontWeight: "bold",
};

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

const InputField = ({
  label,
  value,
  readOnly,
  onChange,
  name,
  inputType = "text",
}) => (
  <div className="flex flex-col space-y-2 mt-5">
    <label className="text-sm">{label}</label>
    <input
      type={inputType}
      value={value}
      readOnly={readOnly}
      disabled={readOnly}
      name={name}
      onChange={onChange}
      className={`p-2 w-3/4 xl:w-1/2 border rounded-xl 
        ${readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`} // Applies styles if read-only
    />
  </div>
);

const UpdateInputField = ({ label, name, value, onChange }) => (
  <div className="flex flex-col space-y-2 mt-5">
    <label className="text-sm">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
    />
  </div>
);

const PaymentDropdownField = ({
  label,
  name,
  options,
  onChange,
  selectedTerm,
}) => {
  return (
    <div className="flex flex-col space-y-2 mt-5">
      <label className="text-sm">{label}</label>
      <select
        name={name}
        onChange={onChange}
        className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
      >
        <option hidden>{"Select an option"}</option>
        {selectedTerm.paymentTerms !== "" ? (
          <>
            <option key={selectedTerm.payTermCode} value={selectedTerm}>
              {selectedTerm.payTermDays}
            </option>
            {options.map((option) => (
              <option key={option.payTermCode} value={option.payTermCode}>
                {option.payTermName}
              </option>
            ))}
          </>
        ) : (
          <>
            {options.map((option) => (
              <option key={option.payTermCode} value={option.payTermCode}>
                {option.payTermName}
              </option>
            ))}
          </>
        )}
      </select>
    </div>
  );
};

const CustomerInfo = () => {
  const [cookies] = useCookies(["token"]);
  const headers = {
    "Content-Type": "application/json",
    dbname: cookies.token?.selectedCompany,
    token: cookies.token?.token,
  };
  const [locationLink, setLocationLink] = useState("");

  const {
    formData,
    setFormData,
    customerName,
    setCustomerName,
    telephoneNo,
    setTelephoneNo,
    address,
    setAddress,
    nationalId,
    setNationalId,
    selectedCoustomerGroupValue,
    setSelectedCustomerGroupValue,
    properties,
    setProperties,
    companyRegistration,
    setCompanyRegistration,
    selectedPrimaryValue,
    setSelectedPrimaryValue,
    selectedSecValue,
    setSelectedSecValue,
    selectedConcreteVapValue,
    setSelectedConcreteVapValue,
    selectedType,
    setSelectedType,
    creditLimit,
    setCreditLimit,
    commitmentLimit,
    setCommitmentLimit,
    selectedPaymentMethodValue,
    setSelectedPaymentMethodValue,
    isExempt,
    setIsExempt,
    selectedParentCustomerValue,
    setSelectedParentCustomerValue,
    parentLabel,
    setparentLabel,
    selectedOption,
    setSelectedOption,
    discount,
    setDiscount,
    discountReasonselectedOption,
    setDiscountReasonselectedOption,
    isDiscountOther,
    setIsDiscountOther,
    discountOtherText,
    setDiscountOtherText,
    discountOtherError,
    setDiscountOtherError,
    extraCharges,
    setExtraCharges,
    extraChargesReasonselectedOption,
    setExtraChargesReasonselectedOption,
    isExtraChargesOther,
    setIsExtraChargesOther,
    extraChargesOtherText,
    setExtraChargesOtherText,
    editPendingCustomerInfo,
    setEditPendingCustomerInfo,
    logoutContext,
    typeOfExemption,
    setTypeOfExemption,
    exemptionPeriod,
    setExemptionPeriod,
    taxExemptedPercentage,
    setTaxExemptedPercentage,
    taxExemptedQuantity,
    setTaxExemptedQuantity,
    customerGroupChanged,
    setCustomerGroupChanged,
    primaryAccountManagerChanged,
    setPrimaryAccountManagerChanged,
    secondaryAccountManagerChanged,
    setSecondaryAccountManagerChanged,
    concreteVapChanged,
    setConcreteVapChanged,
    customerTypeChanged,
    setCustomerTypeChanged,
    paymentMethodChanged,
    setPaymentMethodChanged,
    totalExpectedQtyChanged,
    setTotalExpectedQtyChanged,
    discountReasonChanged,
    setDiscountReasonChanged,
    extraChargesReasonChanged,
    setExtraChargesReasonChanged,
    taxExemptedPercentageChanged,
    setTaxExemptedPercentageChanged,
    paymentTermsChanged,
    setPaymentTermsChanged,
    typeOfExemptionChanged,
    setTypeOfExemptionChanged,
    uploadedFiles,
    setUploadedFiles,
    ParentCustomerChanged,
    setParentCustomerChanged,
    totalExpectedQuantity,
    setTotalExpectedQuantity,
  } = useAppContext();

  const location = useLocation();
  const [getAttachmentAPI, setGetAttachmentAPI] = useState([]);
  const [clickedAttachment, setClickedAttachment] = useState("");
  const [currentEditingRow, setCurrentEditingRow] = useState(null);
  const [extraChargesOtherError, setExtraChargesOtherError] = useState(false);

  // Extract data from location.state
  const {
    status,
    dbName,
    token,
    cardCode,
    cardName,
    fullforeignName,
    foreignName,
    customerGroup,
    customerGroupName,
    customerNationalId,
    customerAddress,
    phoneNo,
    fax,
    email,
    fullName,
    primaryAccountManager,
    secondaryAccountManager,
    concreteVapName,
    companyOrIndividualName,
    companyTaxNumber,
    cusromerCompanyRegistration,
    parentCustomerName,
    customerCreditLimit,
    commetimentLimit,
    paymentTermsName,
    customerPaymentTerms,
    paymentMethodName,
    customerIsExempt,
    taxExemptedGroup,
    taxExemptedQty,
    customerExemptionPeriod,
    customerDiscount,
    discountReason,
    customerExtraCharges,
    extraChargesReason,
    exemptionTypeName,
    hasFather,
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
    branch,
    branchId,
    paymentTermsDays,
    customerExtraChargesOtherReason,
    customerDiscountOtherReason,
    customertotalExpectedQuantity,
  } = location.state || {};

  /////////////

  const {
    showPersonalInfo,
    setShowPersonalInfo,
    showGeneralInfo,
    setShowGeneralInfo,
    showFinancialInfo,
    setShowFinancialInfo,
    showPricesInfo,
    setShowPricesInfo,
    isEditModalOpen,
    setIsEditModalOpen,
    customrData,
    setCustomerData,
    serviceTables,
    setServiceTables,
    categoryTables,
    setCategoryTables,
    shipTo,
    setShipTo,
    logoutCustomerInfo,
  } = useCustomerInfoContext();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        let { latitude, longitude } = position.coords;

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


  {/*
      if (exemptionTypeName === "Quantity") {
    setTypeOfExemption("Q");
  } else if (exemptionTypeName === "Period") {
    setTypeOfExemption("P");
  } else {
    setTypeOfExemption("N");
  }

  */}
  console.log(typeOfExemption, "typeOfExemptiontypeOfExemption");
  console.log(exemptionTypeName, "exemptionTypeNameexemptionTypeName");


  const propertiesObject = properties.reduce((acc, property) => {
    acc[property.name] = property.status;
    return acc;
  }, {});

  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? arEG : enUS;
  const [showNotifications, setShowNotifications] = useState(false);
  const [branches, setBranches] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);
  const [fileType, setFileType] = useState("");
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
  let customerInformatics = location.state || "";
  const customerStatus = location.state?.status;
  const [reason, setReason] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // Set state with extracted data
  // const [telephoneNo, settelephoneNo] = useState(phoneNo || "");
  const [faxState, setfax] = useState(fax || "");
  const [customerGroupState, setCustomerGroup] = useState(customerGroup || "");
  const [customerGroups, setCustomerGroups] = useState([]);
  // Payment Terms
  const [paymentTerms, setPaymentTerms] = useState([]);

  const [selectedTerm, setSelectedTerm] = useState({
    payTermCode: customerInformatics.paymentTerms,
    payTermDays: customerInformatics.paymentTermsName,
  });

  const [isShipToDeleteConfirmVisible, setIsShipToDeleteConfirmVisible] =
    useState(false);

  /// to handle update logic

  const updateProperties = (updates) => {
    setProperties((prevProperties) =>
      prevProperties.map((property) =>
        updates[property.name] !== undefined
          ? { ...property, status: updates[property.name] }
          : property
      )
    );
  };

  useEffect(() => {
    if (!editPendingCustomerInfo) {
      setFormData((prevData) => ({
        ...prevData,
        fullName: fullName,
        foreignName: foreignName,
        fullforeignName: fullforeignName,
        fax: faxState,
        email: email,
        taxNoOfCompany: taxNoOfCompanyState,
      }));
      setCustomerName(cardName);
      setTelephoneNo(phoneNo);
      setAddress(customerAddress);
      setNationalId(customerNationalId);
      setSelectedParentCustomerValue(parentCustomerName);
      updateProperties({
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
      });
      setSelectedCustomerGroupValue(customerGroupName);
      setSelectedPrimaryValue(primaryAccountManagerState);
      setSelectedSecValue(secondaryAccountManagerState);
      setSelectedConcreteVapValue(concreteVapNameState);
      setSelectedType(concreteVapNameState);
      setCompanyRegistration(cusromerCompanyRegistration);
      setCreditLimit(customerCreditLimit);
      setCommitmentLimit(commetimentLimit);
      setSelectedPaymentMethodValue(paymentMethodState);
      setIsExempt(customerIsExempt);
      setSelectedTerm({
        payTermCode: customerPaymentTerms,
        payTermDays: paymentTermsDays,
      });
      setDiscount(customerDiscount);
      setDiscountReasonselectedOption(discountReasonState);
      setExtraCharges(customerExtraCharges);
      setExtraChargesReasonselectedOption(extraChargesReason);
      setTaxExemptedPercentage(taxExemptedGroupState);

      setTypeOfExemption("P"); //Check Q case and Non

      setTaxExemptedQuantity(taxExemptedQty);
      setExemptionPeriod(formatDateToYYYYMMDD(customerExemptionPeriod));
      setDiscountOtherText(customerDiscountOtherReason);
      setTotalExpectedQuantity(customertotalExpectedQuantity);
      setExtraChargesOtherText(customerExtraChargesOtherReason);
      setSelectedOption(parentCustomerName); // Check this
      //setparentLabel(selectedParentCustomerValue)
      localStorage.setItem(
        "selectedParentCustomerValue",
        selectedParentCustomerValue
      );
    }
  }, [editPendingCustomerInfo]);

  useEffect(() => {
    if (parentCustomerName) {
      const option = {
        label: parentCustomerName,
      };
      setSelectedOption(option);
      setparentLabel(parentCustomerName);
      localStorage.setItem("parentLabel", parentCustomerName);
    }
  }, [parentCustomerName]);
  /*
    useEffect(() => {
    if (editPendingCustomerInfo) {
      if (isExempt === "N") {
        setTypeOfExemption("");
        setTaxExemptedPercentage("");
        setTaxExemptedQuantity("");
        setExemptionPeriod("");
      }

      if (typeOfExemption === "P" || typeOfExemption === "Period") {
        setTaxExemptedQuantity("");
      }

      if (typeOfExemption === "Q") {
        setExemptionPeriod("");
      }

      if (typeOfExemption === "N") {
        setTaxExemptedQuantity("");

        setExemptionPeriod("");
      }
    }
  }, [isExempt, typeOfExemption]);

  */

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

  const handleDeleteConfirmationShipToTable = () => {
    removeShipToTable();
    setIsShipToDeleteConfirmVisible(false);
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

  const handleDropdownChange = (event) => {
    const selected = paymentTerms.find(
      (term) => term.payTermCode === event.target.value
    );

    if (selectedTerm) {
      setSelectedTerm({
        payTermCode: selected.payTermCode,
        payTermDays: selected.payTermDays,
      });
    }
  };

  /////
  const [ItemValue, setItemValue] = useState("");
  const [serviceItemValue, setServiceItemValue] = useState("");
  const [items, setItems] = useState([]);
  const [serviceItems, setServiceItems] = useState([]);

  const [locations, setLocations] = useState(initialLocations); //Ship to
  const [shipToFromApi, setShipToFromApi] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);

        const response = await api.get(`api/GetShipTos`, {
          headers,
        });
        if (response.data.status === "Success") {
          setShipToFromApi(response.data.results);
          // setOptions(response.data.results);
        } else {
          alert(`Failed to fetch data from GetShipTos`);
        }
      } catch (error) {
        toast.error(`Error accrued while fetching ship-to data`);
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
          branchID: cardCode,
        };
        //Add branch id for this one , from get old data
        const response = await api.get(`api/GetItems`, {
          headers,
        });
        if (response.data.status === "Success") {
          const responseData = response.data.results;

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
        toast.error(`Error accrued while fetching items data`);
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
        toast.error(`Error accrued while fetching payment terms data`);
      } finally {
        setLoading(false);
      }
    };

    ////////////////////Get Customer Items, Servies Items and shipTos

    fetchOptions();
    fetchItems();
    fetchPaymentTerms();
  }, [cardCode]);

  const formattedItemsOptions = items.map((item) => ({
    value: item.itemCode,
    label: item.itemName,
    price: item.price,
  }));

  const formattedServiceItemsOptions = serviceItems.map((item) => ({
    value: item.itemCode,
    label: item.itemName,
    price: item.price,
  }));

  //////Items

  const handleItemsChange = (index, selectedOption) => {
    let checkIfItemIsSelectedBefore = customerItems.some(
      (item) => item.itemCode === selectedOption.value
    );

    let checkIfItemIsSelectedBefore2 = categoryTables.some(
      (item) => item.itemCode === selectedOption.value
    );

    if (checkIfItemIsSelectedBefore || checkIfItemIsSelectedBefore2) {
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
                itemName: selectedOption.label,
                price: selectedOption.price,
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
              itemName: "",
              price: "",
            }
          : table
      )
    );
  };

  const addCategoryTable = () => {
    setCategoryTables((prevTables) => [
      ...prevTables,
      { itemCode: "", price: "", selectedItemOption: null, itemName: "" },
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

  /////Service Items

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

  const addServiceTable = () => {
    setServiceTables((prevTables) => [
      ...prevTables,
      { itemCode: "", price: "", itemName: "", selectedServiceOption: null },
    ]);
  };

  const handleServiceItemsChange = (index, selectedOption) => {
    let checkIfItemIsSelectedBefore = customerServiceItems.some(
      (item) => item.itemCode === selectedOption.value
    );

    let checkIfItemIsSelectedBefore2 = serviceTables.some(
      (item) => item.itemCode === selectedOption.value
    );

    if (checkIfItemIsSelectedBefore || checkIfItemIsSelectedBefore2) {
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
                itemName: selectedOption.label,
                //price: selectedOption.price,
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
          ? {
              ...table,
              selectedServiceOption: null,
              itemCode: "",
              itemName: "",
              price: "",
            }
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

    //const updatedTables = [...serviceTables];
    //updatedTables[index].price = price;
    //setServiceTables(updatedTables);
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
    let checkIfItemIsSelectedBefore = tables.some(
      (item) => item.shiptoCode === suggestion.shipToCode
    );
    let checkIfItemIsSelectedBefore2 = shipTo.some(
      (item) => item.shipToCode === suggestion.shipToCode
    );
    if (checkIfItemIsSelectedBefore || checkIfItemIsSelectedBefore2) {
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
    updateShipTo(index, field, value);
  };

  const updateShipTo = (index, field, value) => {
    const updatedShipTo = [...shipTo];
    updatedShipTo[index][field] = value;
    setShipTo(updatedShipTo);
  };

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

  const handleDeleteConfirmation = (index) => {
    const updatedShipTo = shipTo.filter((_, i) => i !== index);
    setShipTo(updatedShipTo);
  };

  const [primaryAccountManagerState, setprimaryAccountManager] = useState(
    primaryAccountManager || ""
  );
  const [secondaryAccountManagerState, setsecondaryAccountManager] = useState(
    secondaryAccountManager || ""
  );
  const [concreteVapNameState, setconcreteVapName] = useState(
    concreteVapName || ""
  );
  const [companyIndividualState, setcompanyIndividual] = useState(
    companyOrIndividualName || ""
  );
  const [taxNoOfCompanyState, settaxNoOfCompany] = useState(
    companyTaxNumber || ""
  );

  const [paymentMethodState, setpaymentMethod] = useState(
    paymentMethodName || ""
  );
  const [taxExemptedGroupState, setTaxExemptedGroup] = useState(
    taxExemptedGroup || ""
  );

  const [discountState, setdiscount] = useState(customerDiscount || "");
  const [discountReasonState, setdiscountReason] = useState(
    discountReason || ""
  );
  const [extraChargesState, setextraCharges] = useState(extraCharges || "");
  const [extraChargesReasonState, setextraChargesReason] = useState(
    extraChargesReason || ""
  );

  const [customerItems, setCustomerItems] = useState([]);
  const [customerServiceItems, setCustomerServiecItems] = useState([]);

  //////////////

  //DownLoade Attchment functions
  const DownloadAttachment = async (fileName) => {
    const url = `${attachmentUrl}/CustomerAttachments//DownloadFile?fileName=${fileName}`;

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
        ` Status:${error?.response?.statusText} Code:${error?.response?.status}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAttachmentClick = (fileName) => {
    setClickedAttachment(fileName);
    DownloadAttachment(fileName);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (/^\d*$/.test(value)) {
      setCustomerData({
        ...customrData,
        [name]: value,
      });
    } else {
      toast.error(`This filed must contain only numbers.`);
    }

    /*   setCustomerData({
      ...customrData,
      [name]: value,
    });

*/
  };

  useEffect(() => {
    console.log("dbName:", dbName, "token:", token); // Log dbName and token for debugging
    const fetchCustomerGroups = async () => {
      if (!dbName || !token) {
        console.error("Missing dbName or token");
        return;
      }

      try {
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
        toast.error(`Error accrued while fetching customer groups data`);
      }
    };

    const GetAttachments = async () => {
      const url = `${attachmentUrl}/CustomerAttachments/GetFiles?dbName=${dbName}&cardCode=${cardCode}`;
      // const url = `${attachmentUrl}/CustomerAttachments/GetFiles`;
      const headers = {
        "Content-Type": "application/json",
        dbName: dbName,
        cardCode: cardCode,
      };

      console.log(headers);

      try {
        setLoading(true);
        const response = await axios.get(url);
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
        setUploadedFiles(formattedFiles);
      } catch (error) {
        toast.error(
          ` Status:${error?.response?.data.status} Code:${error?.response?.data.statusCode} Message: ${error?.response?.data.errorMessage}`
        );

        console.error("Fetch GetAttachments error:", error);
      } finally {
        setLoading(false);
      }
    };
    GetAttachments();
    fetchCustomerGroups();
  }, [dbName, token, cardCode]);

  useEffect(() => {
    const fetchBranches = async () => {
      const url = `api/GetCustomerBranches`;

      try {
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbname: dbName,
            token: token,
            customerCode: cardCode,
          },
        });

        if (response.data.status === "Success") {
          setBranches(response.data.results);
        } else {
          alert("Failed to fetch branches");
        }
      } catch (error) {
        toast.error(`Error accrued while fetching branches data`);
      }
    };

    fetchBranches();
  }, [dbName, token]);

  useEffect(() => {
    const fetchCustomerShipTos = async () => {
      const url = `api/GetCustomerShipTos`;

      console.log("Fetching customer ship-tos with the following details:");
      console.log("URL:", url);
      console.log("Headers:", {
        "Content-Type": "application/json",
        dbname: dbName,
        token: token,
        customerCode: cardCode,
      });

      try {
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbname: dbName,
            token: token,
            customerCode: cardCode,
          },
        });

        if (response.data.status === "Success") {
          setTables(response.data.results);
          console.log(response.data.results, "kkkkkkkkkkk");

          const apiResults = response.data.results;
          const transformedData = apiResults.map((item) => ({
            shipToCode: item?.shiptoCode,
            shipToName: item.shiptoName,
            longitude: item.longitude,
            latitude: item.latitude,
            expectedQty: item.expectedQty,
            distance: item.distance,
            city: item?.city,
            street: item?.street,
          }));
          // Setting the state
          //setShipTo(transformedData);
        } else {
          alert("Failed to fetch customer ship-tos");
        }
      } catch (error) {
        console.log(error, "error - error");

        toast.error(`Error accrued while fetching ship-tos data`);
      }
    };

    const fetchCustomerItems = async () => {
      const url = `api/GetCustomerItems`;
      try {
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbname: dbName,
            token: token,
            customerCode: cardCode,
          },
        });
        if (response.data.status === "Success") {
          const apiResults = response.data.results;
          setCustomerItems(response.data.results);

          const transformedData = apiResults.map((item) => ({
            itemCode: item.itemCode,
            itemName: item.itemName,
            price: item.price,
            selectedItemOption: {
              value: item.itemCode,
              label: item.itemName,
              price: item.price,
            },
          }));
          // Setting the state
          //setCategoryTables(transformedData);
        } else {
          alert("Failed to fetch customer GetCustomerItems");
        }
      } catch (error) {
        toast.error(`Error accrued while fetching customer items data`);
      }
    };

    const fetchgetCustomerServiceItems = async () => {
      const url = `api/GetCustomerServiceItems`;
      try {
        const response = await api.get(url, {
          headers: {
            "Content-Type": "application/json",
            dbname: dbName,
            token: token,
            customerCode: cardCode,
          },
        });
        if (response.data.status === "Success") {
          const apiResults = response.data.results;

          setCustomerServiecItems(response.data.results);

          const transformedData = apiResults.map((item) => ({
            itemCode: item.itemCode,
            itemName: item.itemName,
            price: item.price,
            selectedServiceOption: {
              value: item.itemCode,
              label: item.itemName,
              price: item.price,
            },
          }));

          // Setting the state
          // setServiceTables(transformedData);
        } else {
          alert("Failed to fetch customer GetCustomerServiceItems");
        }
      } catch (error) {
        toast.error(`Error accrued while fetching customer service items data`);
      }
    };

    fetchCustomerShipTos();
    fetchCustomerItems();
    fetchgetCustomerServiceItems();
  }, [dbName, token, cardCode]);

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
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
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
      setUploadedFiles((prevFiles) => [...prevFiles, fileMetadata]);
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

  const handleDeleteConfirmationServiceTable = () => {
    removeServiceTable();
    setIsServiceDeleteConfirmVisible(false);
  };

  const handleDeleteConfirmationCategoryTable = () => {
    removeCategoryTable();
    setIsCategoryDeleteConfirmVisible(false);
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
    handleParentChange(null); // Clear selection
  };

  const handleDeleteAttachment = (index) => {
    setUploadedFiles((prevAttachments) =>
      prevAttachments.filter((_, i) => i !== index)
    );
  };

  const prepareCategoryTableDataForSubmission = () => {
    return categoryTables.map((table) => {
      const price = parseFloat(table.price) || 0;
      const specialDiscount = parseFloat(table.specialdiscount) || 0;
      const extra = parseFloat(customrData.extraCharges) || 0;
      const disc = parseFloat(customrData.discount) || 0;

      const finalPrice = price + extra - disc - specialDiscount;

      return {
        ...table,
        price: finalPrice,
      };
    });
  };

  const showModal = async () => {
    try {
      const formattedCategoryTables = prepareCategoryTableDataForSubmission();

      const headers = {
        "Content-Type": "application/json",
        dbname: cookies.token?.selectedCompany,
        token: cookies.token?.token,
      };

      let body = {
        userCode: cookies.token?.userCode,
        //branchId: cookies.token?.branchId,
        branchId: branchId,
        customerCode: cardCode,
        payTermCode:
          selectedTerm.payTermCode == "" ? "0" : selectedTerm.payTermCode, //
        payTermDays:
          selectedTerm.payTermDays == "" ? "0" : selectedTerm.payTermDays, //
        creditLimit: customrData.creditLimit2,
        commitmentLimit:
          customrData.commitmentLimit == "" ? "0" : customrData.commitmentLimit, ///
        discount: customrData.discount,
        extraCharges: customrData.extraCharges,
      };

      if (serviceTables[0].itemCode) {
        body.serviceItem = serviceTables;
      }

      if (categoryTables[0].itemCode) {
        body.item = formattedCategoryTables;
      }

      if (shipTo[0].shipToName) {
        body.shipTo = shipTo;
      }

      console.log(body, "update customer body");
      console.log(headers, "update customer headers");

      try {
        setLoading(true);

        let response = await api.post(`api/UpdateCustomer`, body, {
          headers,
        });

        console.log("Response on UpdateCustomer API:", response);
        setIsModalVisible(true);
      } catch (error) {
        const errorMessage = error?.response?.data?.errorMessage;
        toast.error(`Failed to update customer. Message: ${errorMessage}`);
        console.log(error, "update customer");
      }
    } catch (error) {
      console.log(error, "update customer");
      toast.error("Failed to update customer. Please try again.");
    } finally {
      setLoading(false);
    }
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

  const handleNextToEdit = async () => {
    if (
      (customerStatus === "Pending" && cardCode && cardCode.includes("DRFT")) ||
      (customerStatus === "Rejected" && cardCode && cardCode.includes("DRFT"))
    ) {
      console.log(customerStatus, "Customer Status");
      console.log(cookies.token?.selectedCompany, cardCode);

      try {
        const headers = {
          "Content-Type": "application/json",
          cardCode: cardCode,
          dbName: cookies.token?.selectedCompany,
          //          token: cookies.token?.token,
        };

        const response = await api.get(`api/CheckBPApprovers`, {
          headers,
        });
        if (response.data.status === "Success") {
          console.log(response.data.errorMessage, "Success");
          setEditPendingCustomerInfo(true);
          return;
        } else {
          toast.error(response.data.errorMessage);
        }
      } catch (error) {
        toast.error(`${error.response.data.errorMessage}`);
        return;
      }
    }

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
    setIsEditModalOpen(false);
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

  ////////////////////

  const options = [
    { label: t("Select an option"), value: "" },
    { label: t("Company"), value: "C" },
    { label: t("Individual"), value: "I" },
  ];

  //////////////
  const handleCustomerGroupChange = (e) => {
    setCustomerGroupChanged(true);
    setSelectedCustomerGroupValue(e.target.value);
  };

  const handlePrimaryAccountManager = (e) => {
    setPrimaryAccountManagerChanged(false);
    setSelectedPrimaryValue(e.target.value);
  };

  const handleSecAccountManager = (e) => {
    setSecondaryAccountManagerChanged(true);
    setSelectedSecValue(e.target.value);
  };

  const handleGetConcreteVap = (e) => {
    setConcreteVapChanged(true);
    setSelectedConcreteVapValue(e.target.value);
  };

  const handleTypeChange = (value) => {
    setCustomerTypeChanged(true);
    setSelectedType(value);
  };
  const formatDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    console.log(dateString, "'check the date here");

    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };
  const handleTaxExemptedPercentage = (value) => {
    setTaxExemptedPercentageChanged(true);
    setTaxExemptedPercentage(value);
  };
  const handleExemptionType = (value) => {
    setTypeOfExemptionChanged(true);
    setTypeOfExemption(value);
  };

  const handleCreditLimitChange = (e) => {
    const value = e.target.value;
    setCreditLimit(value);
  };

  const handleDiscountChange = (e) => {
    const value = e.target.value;
    setDiscount(value);
  };

  useEffect(() => {
    if (customerExemptionPeriod) {
      const formattedDate = formatBackendDateToYYYYMMDD(
        customerExemptionPeriod
      );
      setExemptionPeriod(formattedDate);
    }
  }, [customerExemptionPeriod]);

  const formatBackendDateToYYYYMMDD = (dateString) => {
    if (!dateString) return "";
    const [datePart] = dateString.split(" ");
    const [month, day, year] = datePart.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const handleDropdownDiscountReason = (event) => {
    setDiscountReasonChanged(true);
    if (event.target.value === "07") {
      setIsDiscountOther(true);
    } else {
      setIsDiscountOther(false);
      setDiscountOtherText("");
    }

    setDiscountReasonselectedOption(event.target.value);
  };
  const handleDropdownextraChargesReason = (event) => {
    setExtraChargesReasonChanged(true);
    if (event.target.value === "07") {
      setIsExtraChargesOther(true);
    } else {
      setIsExtraChargesOther(false);
      setExtraChargesOtherText("");
    }
    setExtraChargesReasonselectedOption(event.target.value);
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
  const handleCommitmentLimitChange = (e) => {
    const value = e.target.value;
    setCommitmentLimit(value);
  };
  const handleTotalExpectedQtyChange = (e) => {
    setTotalExpectedQtyChanged(true);
    const value = e.target.value;
    setTotalExpectedQuantity(value);
  };

  const handlePaymentChange = (event) => {
    setPaymentTermsChanged(true);
    const selectedOption = paymentTerms.find(
      (term) => term.payTermCode === event.target.value
    );
    setSelectedTerm({
      payTermCode: selectedOption.payTermCode,
      payTermDays: selectedOption.payTermDays,
    });
  };

  const handleGetPaymentMethod = (e) => {
    setPaymentMethodChanged(true);
    setSelectedPaymentMethodValue(e.target.value);
  };

  async function updatePendingCustomerInfo() {
    const headers = {
      dbname: cookies.token?.selectedCompany,
      token: cookies.token?.token,
    };

    const data = {
      userCode: cookies.token?.userCode,
      CustomerCode: cardCode,
      CustomerName: customerName,
      CustomerFName: formData.foreignName,
      CustomerFullName: formData.fullName,
      fullforeignName: formData.fullforeignName,
      NationalId: nationalId,
      Address: address,
      PhoneNo: telephoneNo,
      Fax: formData.fax,
      Email: formData.email,
      BranchId: branchId,
      CompanyTaxNumber: formData.taxNoOfCompany,
      CompanyRegNo: companyRegistration,
      CreditLimit: creditLimit,
      CommitmentLimit: commitmentLimit,
      IsTaxExempt: isExempt,
      // add is exempt other logic
      ExemptionQuantity: taxExemptedQuantity,
      ExemptionPeriod: exemptionPeriod,

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
      Discount: discount,
      ExtraCharges: extraCharges,
    };

    if (taxExemptedPercentageChanged) {
      data.ExemptionPercentage = taxExemptedPercentage;
    }
    if (customerGroupChanged) {
      data.CustomerGroupCode = selectedCoustomerGroupValue;
    }
    if (primaryAccountManagerChanged) {
      data.PrimaryAccountManager = selectedPrimaryValue;
    }
    if (secondaryAccountManagerChanged) {
      data.SecondaryAccountManager = selectedSecValue;
    }
    if (concreteVapChanged) {
      data.ConcreteVap = selectedConcreteVapValue;
    }
    if (customerTypeChanged) {
      data.CustomerType = selectedType;
    }
    if (paymentMethodChanged) {
      data.PaymentMethod = selectedPaymentMethodValue;
    }

    if (totalExpectedQtyChanged) {
      data.totalExpectedQuantity = totalExpectedQuantity;
    }

    if (selectedParentCustomerValue && ParentCustomerChanged) {
      data.ParentCustomer = selectedParentCustomerValue;
    }
    if (discountReasonChanged && discountReasonselectedOption !== "07") {
      data.DiscountReason = discountReasonselectedOption;
    }
    if (
      extraChargesReasonChanged &&
      extraChargesReasonselectedOption !== "07"
    ) {
      data.ExtraChargesReason = extraChargesReasonselectedOption;
    }
    if (discountReasonselectedOption === "07") {
      data.DiscountOtherReason = discountOtherText;
    }
    if (extraChargesReasonselectedOption === "07") {
      data.ExtraChargesOtherReason = extraChargesOtherText;
    }
    if (typeOfExemption != "" && typeOfExemptionChanged) {
      data.ExemptionType = typeOfExemption;
    }

    data.PayTermCode = selectedTerm.payTermCode;
    data.PayTermDays = selectedTerm.payTermDays;

    if (serviceTables[0].itemCode) {
      data.ServiceItem = serviceTables;
    }

    if (categoryTables[0].itemCode) {
      data.Item = categoryTables;
    }

    if (shipTo[0].shipToName) {
      data.ShipTo = shipTo;
    }

    ////////////////////
    const formDataAppend = new FormData();
    formDataAppend.append("customerRequestJson", JSON.stringify(data));

    uploadedFiles.forEach((fileObj) => {
      console.log(fileObj.file, "check the file path");

      formDataAppend.append("files", fileObj.file); // Append the actual file
    });

    console.log(formDataAppend, "ssenddedddd body on update draft");

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

    console.log(formDataObject, "formDataAppend");

    try {
      setLoading(true);
      const updaterequest = await api.post(
        `api/updateDraftCustomer`,
        formDataAppend,
        { headers }
      );
      console.log(updaterequest, "Draft updaterequest");
      navigate("/home");
      logoutContext();
      logoutCustomerInfo();
      toast.success("Done");
    } catch (error) {
      console.log(error);
      const errorMessage = error?.response?.data?.errorMessage;
      toast.error(
        `Update Customer Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${errorMessage}`
      );
    } finally {
      setLoading(false);
    }
  }

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
                      {(customerStatus === "Approved" || "Rejected") && (
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
                    value={customerName}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={(e) => setCustomerName(e.target.value)}
                    name="customerName"
                  />

                  <InputField
                    label={t("fullName")}
                    value={formData.fullName}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={handleChange}
                    name="fullName"
                  />
                  <InputField
                    label={t("foreignName")}
                    value={formData.foreignName}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={handleChange}
                    name="foreignName"
                  />

                  <InputField
                    label={t("fullforeignName")}
                    value={formData.fullforeignName}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={handleChange}
                    name="fullforeignName"
                  />

                  <InputField
                    label={t("nationalId")}
                    value={nationalId}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={(e) => setNationalId(e.target.value)}
                    name="nationalId"
                  />

                  <InputField
                    label={t("address")}
                    value={address}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={(e) => setAddress(e.target.value)}
                    name="address"
                  />

                  <InputField
                    label={t("telephoneNo")}
                    value={telephoneNo}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={(e) => setTelephoneNo(e.target.value)}
                    name="telephoneNo"
                  />

                  <InputField
                    label={t("fax")}
                    value={formData.fax}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={handleChange}
                    name="fax"
                  />
                  <InputField
                    label={t("email")}
                    value={formData.email}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={handleChange}
                    name="email"
                  />

                  <InputField
                    label={t("BP Type")}
                    value={hasFather} //this one from SAP not editable
                    readOnly={true}
                  />

                  {editPendingCustomerInfo ? (
                    <>
                      <div className="flex flex-col space-y-1 mt-5">
                        <label className="text-sm mb-2">
                          {t("parentCustomer")}{" "}
                        </label>
                        <div className="relative">
                          <Select
                            className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
                            options={optionsTest}
                            placeholder={isLoading ? "Loading..." : "Search..."}
                            onInputChange={(inputValue) => {
                              setSearchValue(inputValue);
                              setParentCustomerChanged(true);
                            }}
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
                      <div style={{ display: "flex", gap: 18, marginTop: 24 }}>
                        <PropertyGrid maxCount={10} offset={0} />
                        <PropertyGrid maxCount={10} offset={10} />
                        <PropertyGrid maxCount={10} offset={20} />
                      </div>
                    </>
                  ) : (
                    <>
                      <InputField
                        label={t("parentCustomer")}
                        value={parentCustomerName}
                        readOnly={true}
                      />
                      {/*/////////////////////////*/}
                      <div className="flex gap-10  mt-5">
                        <table
                          style={{ borderCollapse: "collapse", width: "30%" }}
                        >
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
                          <PropGridReadOnly
                            name={"High Risk"}
                            status={highRisk}
                          />
                          <PropGridReadOnly
                            name={"Hospitals"}
                            status={hospitals}
                          />
                        </table>

                        <table
                          style={{ borderCollapse: "collapse", width: "30%" }}
                        >
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
                          <PropGridReadOnly
                            name={"Low Risk"}
                            status={lowRisk}
                          />

                          <PropGridReadOnly
                            name={"MediumRisk"}
                            status={mediumRisk}
                          />
                          <PropGridReadOnly name={"Mosque"} status={mosque} />
                          <PropGridReadOnly
                            name={"Pipelines"}
                            status={pipelines}
                          />
                          <PropGridReadOnly name={"Port"} status={port} />
                        </table>
                        <table
                          style={{ borderCollapse: "collapse", width: "30%" }}
                        >
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
                    </>
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

                  {editPendingCustomerInfo ? (
                    <>
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
                      <InputField
                        label={t("branch")}
                        value={branch}
                        readOnly={true}
                      />
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
                    </>
                  ) : (
                    <>
                      <InputField
                        label={t("customerGroup")}
                        value={customerGroupName}
                        readOnly={true}
                      />
                      <InputField
                        label={t("branch")}
                        value={branch}
                        readOnly={true}
                      />
                      <InputField
                        label={t("primaryAccountManager")}
                        value={primaryAccountManagerState}
                        readOnly={true}
                      />

                      <InputField
                        label={t("secondaryAccountManager")}
                        value={secondaryAccountManagerState}
                        readOnly={true}
                      />
                      <InputField
                        label={t("concreteVAP")}
                        value={concreteVapNameState}
                        readOnly={true}
                      />
                      <InputField
                        label={t("companyIndividual")}
                        value={companyIndividualState}
                        readOnly={true}
                      />
                    </>
                  )}

                  <InputField
                    label={t("taxNoOfCompany")}
                    value={formData.taxNoOfCompany}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={handleChange}
                    name="taxNoOfCompany"
                  />

                  <InputField
                    label={t("companyRegistration")}
                    value={companyRegistration}
                    readOnly={!editPendingCustomerInfo && true}
                    onChange={(e) => setCompanyRegistration(e.target.value)}
                    name="companyRegistration"
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

                  {editPendingCustomerInfo ? (
                    <>
                      <InputField
                        label={t("creditLimit")}
                        value={creditLimit}
                        readOnly={!editPendingCustomerInfo && true}
                        onChange={handleCreditLimitChange}
                        name="creditLimit"
                      />
                      <InputField
                        label={t("commitmentLimit")}
                        value={commitmentLimit}
                        readOnly={!editPendingCustomerInfo && true}
                        onChange={handleCommitmentLimitChange}
                        name="creditLimit"
                      />

                      <InputField
                        label={t("totalExpectedQuantity")}
                        value={totalExpectedQuantity}
                        readOnly={!editPendingCustomerInfo && true}
                        onChange={handleTotalExpectedQtyChange}
                        name="totalExpectedQuantity"
                      />

                      <DropdownFieldTest
                        label={t("paymentTerms")}
                        name="paymentTerms"
                        options={paymentTerms}
                        onChange={handlePaymentChange}
                        selectedTerm={selectedTerm}
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
                          selectedValue={taxExemptedPercentage}
                        />

                        <DropdownFieldInternaly
                          label={t("exemptionTypeName")}
                          required={isExempt === t("yes")}
                          options={[
                            { label: t("Select an option"), value: "" },
                            { label: t("Quantity"), value: "Q" },
                            { label: t("Period"), value: "P" },
                            { label: t("None"), value: "N" },
                          ]}
                          onChange={handleExemptionType}
                          value={typeOfExemption}
                          selectedValue={typeOfExemption}
                        />

                        <InputField
                          label={t("taxExemptedQuantity")}
                          required={isExempt === t("yes")}
                          onChange={(e) =>
                            setTaxExemptedQuantity(e.target.value)
                          }
                          value={taxExemptedQuantity}
                        />

                        <InputField
                          label={t("exemptionPeriod")}
                          required={isExempt === t("yes")}
                          onChange={(e) => setExemptionPeriod(e.target.value)}
                          value={exemptionPeriod}
                          inputType="date"
                          name="exemptionPeriod"
                        />
                      </>
                    </>
                  ) : (
                    <>
                      <InputField
                        label={t("creditLimit")}
                        value={creditLimit ? formatNumber(creditLimit) : ""}
                        readOnly={true}
                      />
                      <InputField
                        label={t("commitmentLimit")}
                        value={
                          commitmentLimit ? formatNumber(commitmentLimit) : ""
                        }
                        readOnly={true}
                      />
                      <InputField
                        label={t("totalExpectedQuantity")}
                        value={customertotalExpectedQuantity}
                        readOnly={true}
                      />
                      <InputField
                        label={t("paymentTerms")}
                        value={paymentTermsName}
                        readOnly={true}
                      />
                      <InputField
                        label={t("paymentMethod")}
                        value={paymentMethodState}
                        readOnly={true}
                      />
                      <InputField
                        label={t("isExempt")}
                        value={customerIsExempt === "Y" ? t("yes") : t("no")}
                        readOnly={true}
                      />
                      {customerIsExempt === "Y" && (
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
                              taxExemptedQty ? formatNumber(taxExemptedQty) : ""
                            }
                            readOnly={true}
                          />
                          <InputField
                            label={t("exemptionPeriod")}
                            value={formatDateToDDMMYYYYReadOnly(
                              customerExemptionPeriod
                            )}
                            readOnly={true}
                          />
                        </>
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
                      {/* Discount, Discount Reason, Extra Charges */}
                      <div className="mt-16 mb-5">
                        {editPendingCustomerInfo ? (
                          <>
                            <InputField
                              label={t("discount")}
                              value={discount}
                              readOnly={!editPendingCustomerInfo && true}
                              onChange={handleDiscountChange}
                              name="discount"
                            />

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

                            <InputField
                              label={t("otherReason")}
                              required
                              onChange={handleDiscountOtherTextChange}
                              value={discountOtherText}
                              showError={discountOtherError}
                              t={t}
                            />

                            <InputField
                              label={t("extraCharges")}
                              value={extraCharges}
                              readOnly={!editPendingCustomerInfo && true}
                              onChange={(e) => setExtraCharges(e.target.value)}
                              name="extraCharges"
                            />

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

                              <InputField
                                label={t("otherReason")}
                                required
                                onChange={handleExtraChargesOtherTextChange}
                                value={extraChargesOtherText}
                                showError={extraChargesOtherError}
                                t={t}
                              />

                              {extraChargesOtherError && (
                                <span className="text-red-500 text-xs">
                                  {t("requiredField")}*
                                </span>
                              )}
                            </>
                          </>
                        ) : (
                          <>
                            <InputField
                              label={t("discount")}
                              value={
                                discountState ? formatNumber(discountState) : ""
                              }
                              readOnly={true}
                            />
                            <InputField
                              label={t("discountReason")}
                              value={discountReasonselectedOption}
                              readOnly={true}
                            />
                            <InputField
                              label={t("otherReason")}
                              value={customerDiscountOtherReason}
                              readOnly={true}
                              t={t}
                            />
                            <InputField
                              label={t("extraCharges")}
                              value={customerExtraCharges}
                              readOnly={true}
                            />
                            <InputField
                              label={t("extraChargesReason")}
                              value={extraChargesReasonselectedOption}
                              readOnly={true}
                            />
                            <InputField
                              label={t("otherReason")}
                              value={customerExtraChargesOtherReason}
                              readOnly={true}
                              t={t}
                            />
                          </>
                        )}
                      </div>

                      {editPendingCustomerInfo ? (
                        <>
                          <div className="ship-to-section-container">
                            <div className="flex justify-end p-2 mb-3 mt-7">
                              <h4>
                                Number of existing records:{" "}
                                {customerServiceItems.length}
                              </h4>
                              <div className="flex items-center">
                                <button
                                  className="minus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                                  onClick={() => {
                                    if (serviceTables.length > 1) {
                                      setIsServiceDeleteConfirmVisible(true);
                                    } else {
                                      setShowAlert(true);
                                      setTimeout(
                                        () => setShowAlert(false),
                                        3000
                                      );
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
                                        <div className="relative z-12">
                                          <Select
                                            options={
                                              formattedServiceItemsOptions
                                            }
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
                                              className="absolute top-2 text-gray-500 hover:text-gray-700"
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
                                            handlePriceChange(
                                              index,
                                              e.target.value
                                            )
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

                          <div className="ship-to-section-container">
                            <div className="flex justify-end p-2 mb-3 mt-7">
                              <h4>
                                {" "}
                                Number of existing records:{" "}
                                {customerItems.length}
                              </h4>

                              <div className="flex items-center">
                                <button
                                  className="minus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                                  onClick={() => {
                                    if (categoryTables.length > 1) {
                                      setIsCategoryDeleteConfirmVisible(true);
                                    } else {
                                      setShowAlert(true);
                                      setTimeout(
                                        () => setShowAlert(false),
                                        3000
                                      );
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
                                    const extra =
                                      parseFloat(customrData.extraCharges) || 0;
                                    const disc =
                                      parseFloat(customrData.discount) || 0;
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
                                                handleCategoryTablesCheckBox(
                                                  index
                                                )
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

                          <div className="ship-to-section-container">
                            <div className="flex justify-end p-2 mb-3">
                              <h4>
                                {" "}
                                Number of existing records: {tables.length}
                              </h4>
                              <div className="flex items-center">
                                <button
                                  className="minus-btn bg-blue-100 pb-1 text-black border rounded-md h-6 w-6 flex items-center justify-center mx-3 hover:bg-blue-200"
                                  onClick={() => {
                                    if (shipTo.length > 1) {
                                      setIsShipToDeleteConfirmVisible(true);
                                    } else {
                                      setShowAlert(true);
                                      setTimeout(
                                        () => setShowAlert(false),
                                        3000
                                      );
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
                                              setIsShipToDeleteConfirmVisible(
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
                        </>
                      ) : (
                        <>
                          {customerServiceItems.length != 0 && (
                            <TableComponent
                              items={customerServiceItems}
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

                          {customerItems.length != 0 && (
                            <TableComponent
                              items={customerItems}
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
                          {tables.length != 0 && (
                            <TableComponent
                              items={tables}
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
                        </>
                      )}

                      {/* File Download */}

                      {getAttachmentAPI.length !== 0 && (
                        <div className="flex flex-col file-upload mt-4 mb-6 bg-gray-100 rounded-lg p-4 shadow-md">
                          <h3 className="text-lg font-semibold mb-3 text-gray-700">
                            Attachments
                          </h3>
                          <ul className="space-y-2">
                            {uploadedFiles.map((attachment, index) => (
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
                                {editPendingCustomerInfo && (
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

                      {editPendingCustomerInfo && (
                        <input
                          type="file"
                          className="w-1/4 p-2 border rounded-xl mt-2 mb-4"
                          onChange={handleFileChange}
                          accept="image/*,.txt,.pdf"
                        />
                      )}

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
                        {editPendingCustomerInfo ? (
                          <button
                            type="button"
                            style={{ backgroundColor: "#272C6F" }}
                            className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                            onClick={updatePendingCustomerInfo}
                          >
                            {t("update")}
                          </button>
                        ) : null}
                      </div>
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
                        {t("customerName")}:{cardName}
                      </h1>
                      <div className="hidden md:flex md:flex-1"></div>
                      <h1 className="text-xs md:text-sm mt-5 md:mt-0 md:self-center md:self-auto">
                        {t("cardCode")}:{cardCode}
                      </h1>
                      <div className="hidden md:flex md:flex-1"></div>
                    </div>
                    <PaymentDropdownField
                      selectedTerm={selectedTerm}
                      label={t("paymentTerms")}
                      name="paymentTerms"
                      options={paymentTerms}
                      onChange={handleDropdownChange}
                    />
                    <UpdateInputField
                      label={t("creditLimit")}
                      name="creditLimit2"
                      value={customrData.creditLimit2}
                      onChange={handleInputChange}
                    />
                    <UpdateInputField
                      label={t("commitmentLimit")}
                      name="commitmentLimit"
                      value={customrData.commitmentLimit}
                      onChange={handleInputChange}
                    />
                    <UpdateInputField
                      label={t("discount")}
                      name="discount"
                      value={customrData.discount}
                      onChange={handleInputChange}
                    />
                    <UpdateInputField
                      label={t("extraCharges")}
                      name="extraCharges"
                      value={customrData.extraCharges}
                      onChange={handleInputChange}
                    />
                    {/* Service Item */}
                    <div className="ship-to-section-container">
                      <div className="flex justify-end p-2 mb-3 mt-7">
                        <h4>
                          Number of existing records:{" "}
                          {customerServiceItems.length}
                        </h4>
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
                                  <div className="relative z-12">
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
                                        isLoading ? "Loading..." : "No options"
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
                                        className="absolute top-2 text-gray-500 hover:text-gray-700"
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
                    {/* Category */}-
                    <div className="ship-to-section-container">
                      <div className="flex justify-end p-2 mb-3 mt-7">
                        <h4>
                          {" "}
                          Number of existing records: {customerItems.length}
                        </h4>

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
                                        setIsCategoryDeleteConfirmVisible(false)
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
                              const extra =
                                parseFloat(customrData.extraCharges) || 0;
                              const disc =
                                parseFloat(customrData.discount) || 0;
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
                    {/*Ship To*/}
                    <div className="ship-to-section-container">
                      <div className="flex justify-end p-2 mb-3">
                        <h4> Number of existing records: {tables.length}</h4>
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
                                  toast.success(
                                    "Update request has been sent successfully. Please wait for admin approval or rejection."
                                  );
                                  logoutCustomerInfo();
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
      {isLoading && <Loader />}
    </div>
  );
};

export default CustomerInfo;
