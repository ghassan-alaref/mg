import React, { createContext, useState, useContext, useEffect } from "react";

const AppContext = createContext();

const useLocalStorageState = (key, initialValue) => {
  // Initialize state with a function that checks local storage
  const [state, setState] = useState(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  // Update local storage whenever the state changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export const AppProvider = ({ children }) => {
  const [properties, setProperties] = useLocalStorageState("properties", [
    { name: "army", status: "N" },
    { name: "church", status: "N" },
    { name: "commercialBuilding", status: "N" },
    { name: "electricityTransmissionGrids", status: "N" },
    { name: "farm", status: "N" },
    { name: "fuelStation", status: "N" },
    { name: "governmental", status: "N" },
    { name: "hangar", status: "N" },
    { name: "highRisk", status: "N" },
    { name: "hospitals", status: "N" },
    { name: "hotels", status: "N" },
    { name: "house", status: "N" },
    { name: "housing", status: "N" },
    { name: "industrial", status: "N" },
    { name: "infrastructure", status: "N" },
    { name: "lowRisk", status: "N" },
    { name: "mediumRisk", status: "N" },
    { name: "mosque", status: "N" },
    { name: "pipelines", status: "N" },
    { name: "port", status: "N" },
    { name: "residential", status: "N" },
    { name: "road", status: "N" },
    { name: "schools", status: "N" },
    { name: "store", status: "N" },
    { name: "university", status: "N" },
    { name: "villa", status: "N" },
    { name: "waterDesalinationPlant", status: "N" },
    { name: "wwtp", status: "N" },
  ]);

  const [taxExemptedPercentage, setTaxExemptedPercentage] =
    useLocalStorageState("taxExemptedPercentage", "");

  const [taxExemptedQuantity, setTaxExemptedQuantity] = useLocalStorageState(
    "taxExemptedQuantity",
    ""
  );

  const [isDiscountOther, setIsDiscountOther] = useLocalStorageState(
    "isDiscountOther",
    false
  );
  const [isExtraChargesOther, setIsExtraChargesOther] = useLocalStorageState(
    "isExtraChargesOther",
    false
  );
  const [discountOtherText, setDiscountOtherText] = useLocalStorageState(
    "discountOtherText",
    ""
  );
  const [extraChargesOtherText, setExtraChargesOtherText] =
    useLocalStorageState("extraChargesOtherText", "");
  const [discountOtherError, setDiscountOtherError] = useLocalStorageState(
    "discountOtherError",
    false
  );
  const [typeOfExemption, setTypeOfExemption] = useLocalStorageState(
    "typeOfExemption",
    ""
  );
  const [exemptionPeriod, setExemptionPeriod] = useLocalStorageState(
    "exemptionPeriod",
    ""
  );

  // Existing states
  const useLocalStorage = (key, initialValue) => {
    const [value, setValue] = useState(() => {
      return JSON.parse(localStorage.getItem(key));
    });

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
  };

  const [newCustomerNum, setNewCustomerNum] = useLocalStorage(
    "newCustomerNum",
    0
  );

  useEffect(() => {
    localStorage.setItem("newCustomerNum", newCustomerNum);
  }, [newCustomerNum]);

  const [updateCustomerNum, setUpdateCustomerNum] = useLocalStorage(
    "updateCustomerNum",
    0
  );

  useEffect(() => {
    localStorage.setItem("updateCustomerNum", updateCustomerNum);
  }, [updateCustomerNum]);

  const [isAllRequiredPersonalInfo, setIsAllRequiredPersonalInfo] =
    useLocalStorage("isAllRequiredPersonalInfo", false);
  const [isAllRequiredGeneralInfo, setIsAllRequiredGeneralInfo] =
    useLocalStorage("isAllRequiredGeneralInfo", false);
  const [isAllRequiredFinancialInfo, setIsAllRequiredFinancialInfo] =
    useLocalStorage("isAllRequiredFinancialInfo", false);
  const [attemptedNextFinancialClick, setAttemptedNextFinancialClick] =
    useLocalStorage("attemptedNextFinancialClick", false);
  const [attemptedNextPricesInfoClick, setAttemptedNextPricesInfoClick] =
    useLocalStorage("attemptedNextPricesInfoClick", false);
  const [showPersonalInfo, setShowPersonalInfo] = useLocalStorage(
    "showPersonalInfo",
    true
  );

  const [editPendingCustomerInfo, setEditPendingCustomerInfo] = useLocalStorage(
    "editPendingCustomerInfo",
    false
  );
  const [customerGroupChanged, setCustomerGroupChanged] = useLocalStorage(
    "customerGroupChanged",
    false
  );

  const [ParentCustomerChanged, setParentCustomerChanged] = useLocalStorage(
    "ParentCustomerChanged",
    false
  );

  const [primaryAccountManagerChanged, setPrimaryAccountManagerChanged] =
    useLocalStorage("primaryAccountManagerChanged", false);
  const [discountReasonChanged, setDiscountReasonChanged] = useLocalStorage(
    "discountReasonChanged",
    false
  );
  const [taxExemptedPercentageChanged, setTaxExemptedPercentageChanged] =
    useLocalStorage("taxExemptedPercentageChanged", false);
  const [extraChargesReasonChanged, setExtraChargesReasonChanged] =
    useLocalStorage("extraChargesReasonChanged", false);
  const [secondaryAccountManagerChanged, setSecondaryAccountManagerChanged] =
    useLocalStorage("secondaryAccountManagerChanged", false);
  const [concreteVapChanged, setConcreteVapChanged] = useLocalStorage(
    "concreteVapChanged",
    false
  );

  const [paymentTermsChanged, setPaymentTermsChanged] = useLocalStorage(
    "paymentTermsChanged",
    false
  );
  const [typeOfExemptionChanged, setTypeOfExemptionChanged] = useLocalStorage(
    "typeOfExemptionChanged",
    false
  );

  const [customerTypeChanged, setCustomerTypeChanged] = useLocalStorage(
    "customerTypeChanged",
    false
  );
  const [paymentMethodChanged, setPaymentMethodChanged] = useLocalStorage(
    "paymentMethodChanged",
    false
  );
  const [totalExpectedQtyChanged, setTotalExpectedQtyChanged] = useLocalStorage(
    "totalExpectedQtyChanged",
    false
  );

  const [showGeneralInfo, setShowGeneralInfo] = useLocalStorage(
    "showGeneralInfo",
    false
  );
  const [showFinancialInfo, setShowFinancialInfo] = useLocalStorage(
    "showFinancialInfo",
    false
  );
  const [showPricesInfo, setShowPricesInfo] = useLocalStorage(
    "showPricesInfo",
    false
  );

  const [attemptedNext, setAttemptedNext] = useState(() => {
    return JSON.parse(localStorage.getItem("attemptedNext"));
  });

  useEffect(() => {
    localStorage.setItem("attemptedNext", JSON.stringify(attemptedNext));
  }, [attemptedNext]);
  ///////

  const [currentStep, setCurrentStep] = useState(() => {
    return parseInt(localStorage.getItem("currentStep")) || 0;
  });

  const [fileType, setFileType] = useState(() => {
    return parseInt(localStorage.getItem("fileType"));
  });

  useEffect(() => {
    localStorage.setItem("fileType", fileType);
  }, [fileType]);

  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem("customerName") || "";
  });
  const [nationalId, setNationalId] = useState(() => {
    return localStorage.getItem("nationalId") || "";
  });
  const [address, setAddress] = useState(() => {
    return localStorage.getItem("address") || "";
  });
  const [telephoneNo, setTelephoneNo] = useState(() => {
    return localStorage.getItem("telephoneNo") || "";
  });

  const [formData, setFormData] = useState(() => {
    const savedFormData = localStorage.getItem("formData");
    return savedFormData
      ? JSON.parse(savedFormData)
      : {
          fullName: "",
          foreignName: "",
          fullforeignName: "",
          fax: "",
          email: "",
          taxNoOfCompany: "",
        };
  });

  // New states
  const [selectedCoustomerGroupValue, setSelectedCustomerGroupValue] = useState(
    () => {
      return localStorage.getItem("selectedCoustomerGroupValue") || "";
    }
  );

  const [selectedBranchValue, setSelectedBranchValue] = useState(() => {
    return localStorage.getItem("selectedBranchValue") || "";
  });

  const [selectedPrimaryValue, setSelectedPrimaryValue] = useState(() => {
    return localStorage.getItem("selectedPrimaryValue") || "";
  });

  const [selectedSecValue, setSelectedSecValue] = useState(() => {
    return localStorage.getItem("selectedSecValue") || "";
  });

  const [selectedConcreteVapValue, setSelectedConcreteVapValue] = useState(
    () => {
      return localStorage.getItem("selectedConcreteVapValue") || "";
    }
  );

  const [selectedType, setSelectedType] = useState(() => {
    return localStorage.getItem("selectedType") || "";
  });

  const [companyRegistration, setCompanyRegistration] = useState(() => {
    return localStorage.getItem("companyRegistration") || "";
  });

  const [selectedParentCustomerValue, setSelectedParentCustomerValue] =
    useState(() => {
      return localStorage.getItem("selectedParentCustomerValue") || "";
    });

  const [parentLabel, setparentLabel] = useState(() => {
    return localStorage.getItem("parentLabel") || "";
  });

  // Existing useEffects for local storage
  useEffect(() => {
    localStorage.setItem("fileType", fileType);
  }, [fileType]);

  useEffect(() => {
    localStorage.setItem("customerName", customerName);
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem("currentStep", currentStep);
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem("nationalId", nationalId);
  }, [nationalId]);

  useEffect(() => {
    localStorage.setItem("address", address);
  }, [address]);

  useEffect(() => {
    localStorage.setItem("telephoneNo", telephoneNo);
  }, [telephoneNo]);

  useEffect(() => {
    localStorage.setItem("formData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem(
      "selectedCoustomerGroupValue",
      selectedCoustomerGroupValue
    );
  }, [selectedCoustomerGroupValue]);
  ///////////

  const [selectedCollectionMethodValue, setSelectedCollectionMethodValue] =
    useState(() => {
      return localStorage.getItem("selectedCollectionMethodValue") || "";
    });

  useEffect(() => {
    localStorage.setItem(
      "selectedCollectionMethodValue",
      selectedCollectionMethodValue
    );
  }, [selectedCollectionMethodValue]);

  const [selectedPaymentMethodValue, setSelectedPaymentMethodValue] = useState(
    () => {
      return localStorage.getItem("selectedPaymentMethodValue") || "";
    }
  );

  useEffect(() => {
    localStorage.setItem(
      "selectedPaymentMethodValue",
      selectedPaymentMethodValue
    );
  }, [selectedPaymentMethodValue]);

  const [paymentTerms, setPaymentTerms] = useState(() => {
    const terms = localStorage.getItem("paymentTerms");
    return terms ? JSON.parse(terms) : [];
  });

  useEffect(() => {
    localStorage.setItem("paymentTerms", JSON.stringify(paymentTerms));
  }, [paymentTerms]);

  const [selectedTerm, setSelectedTerm] = useState(() => {
    const term = localStorage.getItem("selectedTerm");
    return term ? JSON.parse(term) : { payTermCode: "", payTermDays: "" };
  });

  useEffect(() => {
    localStorage.setItem("selectedTerm", JSON.stringify(selectedTerm));
  }, [selectedTerm]);

  const [creditLimit, setCreditLimit] = useState(() => {
    return localStorage.getItem("creditLimit") || "";
  });

  useEffect(() => {
    localStorage.setItem("creditLimit", creditLimit);
  }, [creditLimit]);

  const [commitmentLimit, setCommitmentLimit] = useState(() => {
    return localStorage.getItem("commitmentLimit") || "";
  });

  const [totalExpectedQuantity, setTotalExpectedQuantity] = useState(() => {
    return localStorage.getItem("totalExpectedQuantity") || "";
  });

  useEffect(() => {
    localStorage.setItem("commitmentLimit", commitmentLimit);
    localStorage.setItem("totalExpectedQuantity", totalExpectedQuantity);
  }, [commitmentLimit, totalExpectedQuantity]);

  const [isExempt, setIsExempt] = useState(() => {
    return localStorage.getItem("isExempt") || "";
  });

  useEffect(() => {
    localStorage.setItem("isExempt", isExempt);
  }, [isExempt]);

  // New useEffects for local storage

  useEffect(() => {
    localStorage.setItem("selectedBranchValue", selectedBranchValue);
  }, [selectedBranchValue]);

  useEffect(() => {
    localStorage.setItem("selectedPrimaryValue", selectedPrimaryValue);
  }, [selectedPrimaryValue]);

  useEffect(() => {
    localStorage.setItem("selectedSecValue", selectedSecValue);
  }, [selectedSecValue]);

  useEffect(() => {
    localStorage.setItem("selectedConcreteVapValue", selectedConcreteVapValue);
  }, [selectedConcreteVapValue]);

  useEffect(() => {
    localStorage.setItem("selectedType", selectedType);
  }, [selectedType]);

  useEffect(() => {
    localStorage.setItem("companyRegistration", companyRegistration);
  }, [companyRegistration]);

  useEffect(() => {
    localStorage.setItem(
      "selectedParentCustomerValue",
      selectedParentCustomerValue
    );
  }, [selectedParentCustomerValue]);

  useEffect(() => {
    localStorage.setItem("parentLabel", parentLabel);
  }, [parentLabel]);

  const [discount, setDiscount] = useState(
    () => localStorage.getItem("discount") || ""
  );
  const [discountReasonselectedOption, setDiscountReasonselectedOption] =
    useState(() => localStorage.getItem("discountReasonselectedOption") || "");

  const [extraCharges, setExtraCharges] = useState(
    () => localStorage.getItem("extraCharges") || ""
  );
  const [
    extraChargesReasonselectedOption,
    setExtraChargesReasonselectedOption,
  ] = useState(
    () => localStorage.getItem("extraChargesReasonselectedOption") || ""
  );

  const [shipTo, setShipTo] = useState(() => {
    const savedShipTo = localStorage.getItem("shipTo");
    return savedShipTo
      ? JSON.parse(savedShipTo)
      : [
          {
            shipToCode: "",
            shipToName: "",
            expectedQty: "",
            distance: "",
            city: "",
            street: "",
            LocationURL: "",
          },
        ];
  });

  const [updatePendingShipTo, setUpdatePendingShipTo] = useState(() => {
    const savedShipTo = localStorage.getItem("updatePendingShipTo");
    return savedShipTo
      ? JSON.parse(savedShipTo)
      : [
          {
            shipToCode: "",
            shipToName: "",
            longitude: "",
            latitude: "",
            expectedQty: "",
            distance: "",
          },
        ];
  });

  const [categoryTables, setCategoryTables] = useState(() => {
    const savedCategoryTables = localStorage.getItem("categoryTables");
    return savedCategoryTables
      ? JSON.parse(savedCategoryTables)
      : [
          {
            itemCode: "",
            price: "",
            specialdiscount: "",
            selectedItemOption: null,
            FinalPrice: "",
          },
        ];
  });

  const [selectedOption, setSelectedOption] = useState(
    () => localStorage.getItem("selectedOption") || null
  );
  const [selectedServiceOption, setSelectedServiceOption] = useState(
    () => localStorage.getItem("selectedServiceOption") || null
  );

  const [serviceTables, setServiceTables] = useState(() => {
    const savedServiceTables = localStorage.getItem("serviceTables");
    return savedServiceTables
      ? JSON.parse(savedServiceTables)
      : [{ itemCode: "", price: "", selectedServiceOption: null }];
  });

  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const savedFiles = localStorage.getItem("uploadedFiles");
    return savedFiles ? JSON.parse(savedFiles) : [];
  });

  const [customerData, setCustomerData] = useState(() => {
    const savedCustomerData = localStorage.getItem("customerData");
    return savedCustomerData ? JSON.parse(savedCustomerData) : [];
  });

  // Update local storage whenever states change
  useEffect(() => {
    localStorage.setItem("discount", discount);
    localStorage.setItem("selectedServiceOption", selectedServiceOption);
    localStorage.setItem("selectedOption", selectedOption);
    localStorage.setItem("customerData", JSON.stringify(customerData));

    localStorage.setItem(
      "discountReasonselectedOption",
      discountReasonselectedOption
    );
    localStorage.setItem("extraCharges", extraCharges);
    localStorage.setItem(
      "extraChargesReasonselectedOption",
      extraChargesReasonselectedOption
    );
    localStorage.setItem("shipTo", JSON.stringify(shipTo));
    localStorage.setItem(
      "updatePendingShipTo",
      JSON.stringify(updatePendingShipTo)
    );

    localStorage.setItem("categoryTables", JSON.stringify(categoryTables));
    localStorage.setItem("serviceTables", JSON.stringify(serviceTables));
    localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
  }, [
    discount,
    discountReasonselectedOption,
    extraCharges,
    extraChargesReasonselectedOption,
    shipTo,
    categoryTables,
    serviceTables,
    uploadedFiles,
    customerData,

    updatePendingShipTo,
  ]);

  //////////////

  const logoutContext = () => {
    // Existing logout functionality
    localStorage.removeItem("currentStep");
    localStorage.removeItem("customerName");
    localStorage.removeItem("nationalId");
    localStorage.removeItem("address");
    localStorage.removeItem("telephoneNo");
    localStorage.removeItem("formData");
    localStorage.removeItem("fileType");
    localStorage.removeItem("selectedOption");
    localStorage.removeItem("selectedServiceOption");

    // New logout items
    localStorage.removeItem("selectedCoustomerGroupValue");
    localStorage.removeItem("selectedBranchValue");
    localStorage.removeItem("selectedPrimaryValue");
    localStorage.removeItem("selectedSecValue");
    localStorage.removeItem("selectedConcreteVapValue");
    localStorage.removeItem("selectedType");
    localStorage.removeItem("companyRegistration");
    localStorage.removeItem("selectedParentCustomerValue");
    /////

    localStorage.removeItem("selectedCollectionMethodValue");
    localStorage.removeItem("selectedPaymentMethodValue");
    localStorage.removeItem("paymentTerms");
    localStorage.removeItem("selectedTerm");
    localStorage.removeItem("creditLimit");
    localStorage.removeItem("commitmentLimit");
    localStorage.removeItem("totalExpectedQuantity");

    localStorage.removeItem("isExempt");
    /////////////
    localStorage.removeItem("discount");
    localStorage.removeItem("discountReasonselectedOption");
    localStorage.removeItem("extraCharges");
    localStorage.removeItem("extraChargesReasonselectedOption");
    localStorage.removeItem("shipTo");
    localStorage.removeItem("updatePendingShipTo");

    localStorage.removeItem("categoryTables");
    localStorage.removeItem("serviceTables");
    localStorage.removeItem("uploadedFiles");

    // Resetting state values
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
    setparentLabel("");
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
    setUpdatePendingShipTo([
      {
        shipToCode: "",
        shipToName: "",
        expectedQty: "",
        distance: "",
      },
    ]);

    setCategoryTables([
      {
        itemCode: "",
        price: "",
        specialdiscount: "",
        selectedItemOption: null,
        FinalPrice: "",
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
    setFileType("");
    setSelectedServiceOption(null);
    setSelectedOption(null);
    localStorage.removeItem("attemptedNext");
    setAttemptedNext(false);
    localStorage.removeItem("isAllRequiredPersonalInfo");
    localStorage.removeItem("isAllRequiredGeneralInfo");
    localStorage.removeItem("isAllRequiredFinancialInfo");
    localStorage.removeItem("attemptedNextFinancialClick");
    localStorage.removeItem("attemptedNextPricesInfoClick");
    localStorage.removeItem("showPersonalInfo");
    localStorage.removeItem("showGeneralInfo");
    localStorage.removeItem("editPendingCustomerInfo");

    localStorage.removeItem("showFinancialInfo");
    localStorage.removeItem("showPricesInfo");

    setEditPendingCustomerInfo(false);
    setIsAllRequiredPersonalInfo(false);
    setIsAllRequiredGeneralInfo(false);
    setIsAllRequiredFinancialInfo(false);
    setAttemptedNextFinancialClick(false);
    setAttemptedNextPricesInfoClick(false);
    setShowPersonalInfo(true);
    setShowGeneralInfo(false);
    setShowFinancialInfo(false);
    setShowPricesInfo(false);

    localStorage.removeItem("isDiscountOther");
    localStorage.removeItem("isExtraChargesOther");
    localStorage.removeItem("discountOtherText");
    localStorage.removeItem("extraChargesOtherText");
    localStorage.removeItem("discountOtherError");
    localStorage.removeItem("typeOfExemption");
    localStorage.removeItem("exemptionPeriod");
    localStorage.removeItem("taxExemptedPercentage");
    localStorage.removeItem("taxExemptedQuantity");
    localStorage.removeItem("properties"); // Add this line to remove properties from local storage
    localStorage.removeItem("customerGroupChanged");
    localStorage.removeItem("primaryAccountManagerChanged");
    localStorage.removeItem("secondaryAccountManagerChanged");
    localStorage.removeItem("concreteVapChanged");
    localStorage.removeItem("customerTypeChanged");
    localStorage.removeItem("paymentMethodChanged");
    localStorage.removeItem("totalExpectedQtyChanged");
    localStorage.removeItem("discountReasonChanged");
    localStorage.removeItem("extraChargesReasonChanged");
    localStorage.removeItem("taxExemptedPercentageChanged");
    localStorage.removeItem("paymentTermsChanged");
    localStorage.removeItem("typeOfExemptionChanged");
    localStorage.removeItem("ParentCustomerChanged");

    // Reset states to their initial values
    setTypeOfExemptionChanged(false);
    setParentCustomerChanged(false);
    setPaymentTermsChanged(false);
    setTaxExemptedPercentageChanged(false);
    setDiscountReasonChanged(false);
    setExtraChargesReasonChanged(false);
    setPrimaryAccountManagerChanged(false);
    setPaymentMethodChanged(false);
    setTotalExpectedQtyChanged(false);
    setSecondaryAccountManagerChanged(false);
    setConcreteVapChanged(false);
    setCustomerTypeChanged(false);
    setCustomerGroupChanged(false);
    setIsDiscountOther(false);
    setIsExtraChargesOther(false);
    setDiscountOtherText("");
    setExtraChargesOtherText("");
    setDiscountOtherError(false);
    setTypeOfExemption("");
    setExemptionPeriod("");
    setTaxExemptedPercentage("");
    setTaxExemptedQuantity("");
    setTotalExpectedQuantity("");
    setProperties([
      { name: "army", status: "N" },
      { name: "church", status: "N" },
      { name: "commercialBuilding", status: "N" },
      { name: "electricityTransmissionGrids", status: "N" },
      { name: "farm", status: "N" },
      { name: "fuelStation", status: "N" },
      { name: "governmental", status: "N" },
      { name: "hangar", status: "N" },
      { name: "highRisk", status: "N" },
      { name: "hospitals", status: "N" },
      { name: "hotels", status: "N" },
      { name: "house", status: "N" },
      { name: "housing", status: "N" },
      { name: "industrial", status: "N" },
      { name: "infrastructure", status: "N" },
      { name: "lowRisk", status: "N" },
      { name: "mediumRisk", status: "N" },
      { name: "mosque", status: "N" },
      { name: "pipelines", status: "N" },
      { name: "port", status: "N" },
      { name: "residential", status: "N" },
      { name: "road", status: "N" },
      { name: "schools", status: "N" },
      { name: "store", status: "N" },
      { name: "university", status: "N" },
      { name: "villa", status: "N" },
      { name: "waterDesalinationPlant", status: "N" },
      { name: "wwtp", status: "N" },
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        updatePendingShipTo,
        setUpdatePendingShipTo,
        paymentTermsChanged,
        setPaymentTermsChanged,
        typeOfExemptionChanged,
        setTypeOfExemptionChanged,
        taxExemptedPercentageChanged,
        setTaxExemptedPercentageChanged,
        discountReasonChanged,
        setDiscountReasonChanged,
        extraChargesReasonChanged,
        setExtraChargesReasonChanged,
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
        currentStep,
        setCurrentStep,
        customerName,
        setCustomerName,
        nationalId,
        setNationalId,
        address,
        setAddress,
        telephoneNo,
        setTelephoneNo,
        formData,
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
        totalExpectedQuantity,
        setTotalExpectedQuantity,
        logoutContext,
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
        selectedServiceOption,
        setSelectedServiceOption,
        newCustomerNum,
        setNewCustomerNum,
        updateCustomerNum,
        setUpdateCustomerNum,
        customerData,
        setCustomerData,
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
        setProperties,
        editPendingCustomerInfo,
        setEditPendingCustomerInfo,
        ParentCustomerChanged,
        setParentCustomerChanged,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
