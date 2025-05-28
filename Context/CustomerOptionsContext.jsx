import React, { createContext, useState, useContext, useEffect } from "react";

// Custom hook for handling state with local storage
const useLocalStorageState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    const savedValue = localStorage.getItem(key);
    try {
      return savedValue !== null ? JSON.parse(savedValue) : defaultValue;
    } catch (error) {
      return savedValue !== null ? savedValue : defaultValue;
    }
  });

  useEffect(() => {
    if (typeof state === "object") {
      localStorage.setItem(key, JSON.stringify(state));
    } else {
      localStorage.setItem(key, state);
    }
  }, [key, state]);

  return [state, setState];
};

const CustomerOptionsContext = createContext();

export const CustomerOptionsProvider = ({ children }) => {
  const [showAccountStatement, setShowAccountStatement] = useLocalStorageState(
    "showAccountStatement",
    false
  );
  const [showReturnedChecks, setShowReturnedChecks] = useLocalStorageState(
    "showReturnedChecks",
    false
  );
  const [showInvoices, setShowInvoices] = useLocalStorageState(
    "showInvoices",
    false
  );
  const [showQuantitiesReport, setShowQuantitiesReport] = useLocalStorageState(
    "showQuantitiesReport",
    false
  );
  const [showPayments, setShowPayments] = useLocalStorageState(
    "showPayments",
    false
  );
  const [showInvoiceHistory, setShowInvoiceHistory] = useLocalStorageState(
    "showInvoiceHistory",
    false
  );
  const [dates, setDates] = useLocalStorageState("DataAccountStatment", {
    startDate: null,
    endDate: null,
  });
  const [showOptions, setShowOptions] = useLocalStorageState(
    "showOptions",
    true
  );
  const [accountStatmentAPI, setAccountStatmentAPI] = useLocalStorageState(
    "accountStatmentAPI",
    []
  );
  const [selectedBranch, setSelectedBranch] = useLocalStorageState(
    "selectedBranchOptions",
    ""
  );
  const [selectedOption, setSelectedOption] = useLocalStorageState(
    "project",
    ""
  );
  const [cashAmount, setCashAmount] = useLocalStorageState("cashAmount", "");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useLocalStorageState("selectedPaymentMethod", "Cash");
  const [totalPaidAmount, setTotalPaidAmount] = useLocalStorageState(
    "totalPaidAmount",
    ""
  );
  const [cashTable, setCashTable] = useLocalStorageState("cashTable", []);
  const [CreditCardTable, setCreditCardTable] = useLocalStorageState(
    "CreditCardTable",
    []
  );

  const [branches, setBranches] = useLocalStorageState("branchesAPI", []);

  const [notes, setNotes] = useLocalStorageState("notes", "");
  const [paymentLine, setPaymentLine] = useLocalStorageState("paymentLine", [
    {
      paymentMethod: "",
      amount: "",
      creditCardType: 0,
      creditCardNumber: "",
      expirationDate: "",
      cardHolderName: "",
      voucherNo: "",
      dueDate: "",
      bankCode: "",
      payeeName: "",
      checkNumber: 0,
    },
  ]);

  const [creditCardType, setCreditCardType] = useLocalStorageState(
    "creditCardType",
    0
  );
  const [creditCardNumber, setCreditCardNumber] = useLocalStorageState(
    "creditCardNumber",
    ""
  );
  const [expirationDate, setExpirationDate] = useLocalStorageState(
    "expirationDate",
    ""
  );

  const [dateNotFormatted, setdateNotFormatted] = useLocalStorageState(
    "dateNotFormatted",
    ""
  );
  const [amount, setAmount] = useLocalStorageState("amount", "");
  const [cardHolderName, setCardHolderName] = useLocalStorageState(
    "cardHolderName",
    ""
  );
  const [voucherNo, setVoucherNo] = useLocalStorageState("voucherNo", "");

  const [amountcheck, setAmountcheck] = useLocalStorageState("amountcheck", "");
  const [payeeName, setPayeeName] = useLocalStorageState("payeeName", "");
  const [checkNumber, setCheckNumber] = useLocalStorageState("checkNumber", 0);
  const [banks, setBanks] = useLocalStorageState("banks", []);
  const [selectedBank, setSelectedBank] = useLocalStorageState("selectedBank", {
    bankCode: "",
    bankName: "",
  });
  const [dueDate, setDueDate] = useLocalStorageState("dueDate", null);
  const [checkTable, setCheckTable] = useLocalStorageState("checkTable", []);

  const logoutCustomerOptions = () => {
    const resetters = [
      {
        stateSetter: setPaymentLine,
        key: "paymentLine",
        defaultValue: [
          {
            paymentMethod: "",
            amount: "",
            creditCardType: 0,
            creditCardNumber: "",
            expirationDate: "",
            cardHolderName: "",
            voucherNo: "",
            dueDate: "",
            bankCode: "",
            payeeName: "",
            checkNumber: 0,
          },
        ],
      },
      { stateSetter: setNotes, key: "notes", defaultValue: "" },
      {
        stateSetter: setdateNotFormatted,
        key: "dateNotFormatted",
        defaultValue: "",
      },

      { stateSetter: setCashTable, key: "cashTable", defaultValue: [] },
      {
        stateSetter: setTotalPaidAmount,
        key: "totalPaidAmount",
        defaultValue: "",
      },
      {
        stateSetter: setSelectedPaymentMethod,
        key: "selectedPaymentMethod",
        defaultValue: "Cash",
      },
      { stateSetter: setCashAmount, key: "cashAmount", defaultValue: "" },
      {
        stateSetter: setShowAccountStatement,
        key: "showAccountStatement",
        defaultValue: false,
      },
      {
        stateSetter: setShowReturnedChecks,
        key: "showReturnedChecks",
        defaultValue: false,
      },
      {
        stateSetter: setShowInvoices,
        key: "showInvoices",
        defaultValue: false,
      },
      {
        stateSetter: setShowQuantitiesReport,
        key: "showQuantitiesReport",
        defaultValue: false,
      },
      {
        stateSetter: setShowPayments,
        key: "showPayments",
        defaultValue: false,
      },
      {
        stateSetter: setShowInvoiceHistory,
        key: "showInvoiceHistory",
        defaultValue: false,
      },
      { stateSetter: setShowOptions, key: "showOptions", defaultValue: true },
      {
        stateSetter: setDates,
        key: "DataAccountStatment",
        defaultValue: { startDate: null, endDate: null },
      },
      {
        stateSetter: setAccountStatmentAPI,
        key: "accountStatmentAPI",
        defaultValue: [],
      },
      {
        stateSetter: setSelectedBranch,
        key: "selectedBranchOptions",
        defaultValue: "",
      },
      { stateSetter: setSelectedOption, key: "project", defaultValue: "" },
      {
        stateSetter: setCreditCardType,
        key: "creditCardType",
        defaultValue: 0,
      },
      {
        stateSetter: setCreditCardNumber,
        key: "creditCardNumber",
        defaultValue: "",
      },
      {
        stateSetter: setExpirationDate,
        key: "expirationDate",
        defaultValue: null,
      },
      { stateSetter: setAmount, key: "amount", defaultValue: "" },
      {
        stateSetter: setCardHolderName,
        key: "cardHolderName",
        defaultValue: "",
      },
      { stateSetter: setVoucherNo, key: "voucherNo", defaultValue: "" },
      {
        stateSetter: setCreditCardTable,
        key: "CreditCardTable",
        defaultValue: [],
      },
      { stateSetter: setAmountcheck, key: "amountcheck", defaultValue: "" },
      { stateSetter: setPayeeName, key: "payeeName", defaultValue: "" },
      { stateSetter: setCheckNumber, key: "checkNumber", defaultValue: 0 },
      // { stateSetter: setBanks, key: "banks", defaultValue: [] },
      {
        stateSetter: setSelectedBank,
        key: "selectedBank",
        defaultValue: { bankCode: "", bankName: "" },
      },
      { stateSetter: setDueDate, key: "dueDate", defaultValue: null },
      {
        stateSetter: setCheckTable,
        key: "checkTable",
        defaultValue: [],
      },
    ];

    resetters.forEach(({ stateSetter, key, defaultValue }) => {
      stateSetter(defaultValue);
      localStorage.removeItem(key);
    });
  };

  return (
    <CustomerOptionsContext.Provider
      value={{
        logoutCustomerOptions,
        showAccountStatement,
        setShowAccountStatement,
        showReturnedChecks,
        setShowReturnedChecks,
        showInvoices,
        setShowInvoices,
        showQuantitiesReport,
        setShowQuantitiesReport,
        showPayments,
        setShowPayments,
        showOptions,
        setShowOptions,
        selectedBranch,
        setSelectedBranch,
        dates,
        setDates,
        accountStatmentAPI,
        setAccountStatmentAPI,
        selectedOption,
        setSelectedOption,
        cashAmount,
        setCashAmount,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        totalPaidAmount,
        setTotalPaidAmount,
        cashTable,
        setCashTable,
        notes,
        setNotes,
        paymentLine,
        setPaymentLine,
        creditCardType,
        setCreditCardType,
        creditCardNumber,
        setCreditCardNumber,
        expirationDate,
        setExpirationDate,
        amount,
        setAmount,
        cardHolderName,
        setCardHolderName,
        voucherNo,
        setVoucherNo,
        CreditCardTable,
        setCreditCardTable,
        dateNotFormatted,
        setdateNotFormatted,
        branches,
        setBranches,
        amountcheck,
        setAmountcheck,
        payeeName,
        setPayeeName,
        checkNumber,
        setCheckNumber,
        banks,
        setBanks,
        selectedBank,
        setSelectedBank,
        dueDate,
        setDueDate,
        checkTable,
        setCheckTable,
        setShowInvoiceHistory,
        showInvoiceHistory,
      }}
    >
      {children}
    </CustomerOptionsContext.Provider>
  );
};

export const useCustomerOptions = () => useContext(CustomerOptionsContext);
