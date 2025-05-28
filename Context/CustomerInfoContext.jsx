import React, { createContext, useState, useContext, useEffect } from "react";

const CustomerInfoContext = createContext();

export const CustomerInfoProvider = ({ children }) => {
  const usePersistedState = (key, defaultValue) => {
    const getInitialState = () => {
      const storedValue = localStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
    };

    const [state, setState] = useState(getInitialState);

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
  };

  // Use the custom hook for each state

  // Add the new states with the same local storage logic
  const [showPersonalInfo, setShowPersonalInfo] = usePersistedState(
    "showPersonalInfo",
    true
  );
  const [showGeneralInfo, setShowGeneralInfo] = usePersistedState(
    "showGeneralInfo",
    false
  );
  const [showFinancialInfo, setShowFinancialInfo] = usePersistedState(
    "showFinancialInfo",
    false
  );
  const [showPricesInfo, setShowPricesInfo] = usePersistedState(
    "showPricesInfo",
    false
  );
  const [isEditModalOpen, setIsEditModalOpen] = usePersistedState(
    "isEditModalOpen",
    false
  );

  const [customrData, setCustomerData] = usePersistedState("customerData", {
    creditLimit: "",
    creditLimit2: "",
    commitmentLimit: "",
    discount: "",
    extraCharges: "",
  });



  const [serviceTables, setServiceTables] = useState(() => {
    const savedServiceTables = localStorage.getItem("serviceTablescustomerInfo");
    return savedServiceTables
      ? JSON.parse(savedServiceTables)
      : [{ itemCode: "", price: "",  selectedServiceOption: null, isChecked: false }];
  });


  const [categoryTables, setCategoryTables] = useState(() => {
    const savedCategoryTables = localStorage.getItem("categoryTablesCustomerInfo");
    return savedCategoryTables
      ? JSON.parse(savedCategoryTables)
      : [{ itemCode: "", price: "", selectedItemOption: null, isChecked: false }];
  });

  

  const [shipTo, setShipTo] = usePersistedState("shipTocustomerInfo", [
    {
      shipToCode: "",
      shipToName: "",
      longitude: "",
      latitude: "",
      expectedQty: "",
      distance: "",
      isChecked: false
    },
  ]);

  useEffect(() => {
    localStorage.setItem("categoryTablesCustomerInfo", JSON.stringify(categoryTables));
    localStorage.setItem("serviceTablescustomerInfo", JSON.stringify(serviceTables));
  }, [categoryTables, serviceTables]);

  useEffect(() => {
    if (!isEditModalOpen) {
      localStorage.removeItem("customerData");
      localStorage.removeItem("serviceTablescustomerInfo");
      localStorage.removeItem("categoryTablesCustomerInfo");
      localStorage.removeItem("shipTocustomerInfo");

      setCustomerData({
        creditLimit: "",
        creditLimit2: "",
        commitmentLimit: "",
        discount: "",
        extraCharges: "",
      });
      setServiceTables( [{ itemCode: "", price: "", selectedServiceOption: null }]);
      setCategoryTables([
        { itemCode: "", price: "", selectedItemOption: null },
      ]);
      setShipTo([
        {
          shipToCode: "",
          shipToName: "",
          longitude: "",
          latitude: "",
          expectedQty: "",
          distance: "",
        },
      ]);
    }
  }, [isEditModalOpen]);

  const logoutCustomerInfo = () => {
    localStorage.removeItem("showPersonalInfo");
    localStorage.removeItem("showGeneralInfo");
    localStorage.removeItem("showFinancialInfo");
    localStorage.removeItem("showPricesInfo");
    localStorage.removeItem("isEditModalOpen");
    localStorage.removeItem("customerData");
    localStorage.removeItem("serviceTablescustomerInfo");
    localStorage.removeItem("categoryTablesCustomerInfo");
    localStorage.removeItem("shipTocustomerInfo");

    setShowPersonalInfo(true);
    setShowGeneralInfo(false);
    setShowFinancialInfo(false);
    setShowPricesInfo(false);
    setIsEditModalOpen(false);
    setCustomerData({
      creditLimit: "",
      creditLimit2: "",
      commitmentLimit: "",
      discount: "",
      extraCharges: "",
    });
    setServiceTables( [{ itemCode: "", price: "", selectedServiceOption: null }]);
    setCategoryTables([{ itemCode: "", price: "", selectedItemOption: null }]);
    setShipTo([
      {
        shipToCode: "",
        shipToName: "",
        longitude: "",
        latitude: "",
        expectedQty: "",
        distance: "",
      },
    ]);
  };

  return (
    <CustomerInfoContext.Provider
      value={{
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
      }}
    >
      {children}
    </CustomerInfoContext.Provider>
  );
};

export const useCustomerInfoContext = () => useContext(CustomerInfoContext);
