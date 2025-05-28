import React, { createContext, useState, useContext, useEffect } from "react";

const CollectionContext = createContext();

export const CollectionProvider = ({ children }) => {
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
  const [dates, setDates] = usePersistedState("dates", {
    startDate: null,
    endDate: null,
  });
  const [paymentMethod, setPaymentMethod] = usePersistedState(
    "paymentMethod",
    ""
  );
  const [selectedBranch, setSelectedBranch] = usePersistedState(
    "selectedBranch",
    ""
  );
  const [selectedMainBox, setSelectedMainBox] = usePersistedState(
    "selectedMainBox",
    ""
  );
  const [selectedSalesEmployee, setSelectedSalesEmployee] = usePersistedState(
    "selectedSalesEmployee",
    ""
  );

  const logoutCollectionContext = () => {
    localStorage.removeItem("dates");
    localStorage.removeItem("paymentMethod");
    localStorage.removeItem("selectedBranch");
    localStorage.removeItem("selectedMainBox");
    localStorage.removeItem("selectedSalesEmployee");

    setDates({ startDate: null, endDate: null });
    setPaymentMethod("");
    setSelectedBranch("");
    setSelectedMainBox("");
    setSelectedSalesEmployee("");
  };

  return (
    <CollectionContext.Provider
      value={{
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
        logoutCollectionContext,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollectionContext = () => useContext(CollectionContext);