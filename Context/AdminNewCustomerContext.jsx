import React, { createContext, useState, useContext, useEffect } from "react";

const AdminNewCustomerContext = createContext();

export const AdminNewCustomerProvider = ({ children }) => {
  const usePersistedState = (key, defaultValue) => {
    const getInitialState = () => {
      try {
        const storedValue = localStorage.getItem(key);
        // Check if the stored value is not null and is a valid JSON
        return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
      } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        // If there's a parsing error, return the default value
        return defaultValue;
      }
    };

    const [state, setState] = useState(getInitialState);

    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
  };

  // Use the custom hook for each state
  const [currentPage, setCurrentPage] = usePersistedState("currentPage", 1);
  const [currentStep, setCurrentStep] = usePersistedState(
    "admincurrentStep",
    0
  );
  const [customerData, setCustomerData] = usePersistedState(
    "customerDataAdmin",
    []
  );

  const [adminuploadedFiles, setAdminUploadedFiles] = useState(() => {
    const savedFiles = localStorage.getItem("adminuploadedFiles");
    return savedFiles ? JSON.parse(savedFiles) : [];
  });
  const [adminEditAttachments, setAdminEditAttachments] = usePersistedState(
    "adminEditAttachments",
    false
  );
  const [customerDataModifications, setCustomerDataModifications] =
    usePersistedState("customerDataModifications", []);

  const logoutAdminNewCustomer = () => {
    localStorage.removeItem("currentPage");
    setCurrentPage(1);

    localStorage.removeItem("admincurrentStep");
    setCurrentStep(0);

    localStorage.removeItem("adminEditAttachments");
    setAdminEditAttachments(false);

    setAdminUploadedFiles([]);
    localStorage.removeItem("adminuploadedFiles");


    console.log("logoutAdminNewCustomer called, currentPage set to 1."); // Debugging
  };

  return (
    <AdminNewCustomerContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currentStep,
        setCurrentStep,
        customerData,
        setCustomerData,
        customerDataModifications,
        setCustomerDataModifications,
        adminEditAttachments,
        setAdminEditAttachments,
        logoutAdminNewCustomer,
        adminuploadedFiles,
        setAdminUploadedFiles,
      }}
    >
      {children}
    </AdminNewCustomerContext.Provider>
  );
};

export const useAdminNewCustomerContext = () =>
  useContext(AdminNewCustomerContext);
