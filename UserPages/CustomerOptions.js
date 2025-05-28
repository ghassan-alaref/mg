import React, { useState, useEffect } from "react";
import { DatePicker, ConfigProvider } from "antd";
import { useLocation } from "react-router-dom";
import enUS from "antd/lib/locale/en_US";
import arEG from "antd/lib/locale/ar_EG";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Component/Sidebar";
import Header from "../Component/Header";
import Footer from "../Component/Footer";
import Notifications from "../Component/Notifications";
import statementIcon from "../Images/add-photo.png";
import checksIcon from "../Images/list.png";
import reportIcon from "../Images/report.png";
import invoiceIcon from "../Images/file.png";
import paymentIcon from "../Images/payment-method.png";
import pencil from "../Images/pencil.png";
import trash from "../Images/trash-can.png";
import checkmark from "../Images/checkmark.png";
import axios from "axios";
import { useCookies } from "react-cookie";
import { Loader } from "../Component/Loader";
import { toast } from "react-toastify";
import { useCustomerOptions } from "../Context/CustomerOptionsContext";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { Autocomplete, TextField } from "@mui/material";

const backendUrl = process.env.REACT_APP_BACKEND_URL;
const attachmentUrl = process.env.REACT_APP_ATTACHMENTS_URL;
export const formatNumber = (num) => {
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
};
const Collections = () => {
  const [cookies] = useCookies(["token"]);
  const headers = {
    "Content-Type": "application/json",
    dbname: cookies.token?.selectedCompany,
    token: cookies.token?.token,
  };
  const [isLoading, setLoading] = useState(false);

  const location = useLocation();
  const [dbName, setDbName] = useState(
    cookies.token?.selectedCompany || localStorage.getItem("dbName") || ""
  );
  const [token, setToken] = useState(
    cookies.token?.token || localStorage.getItem("token") || ""
  );
  //const [cardCode, setCardCode] = useState(location.state?.cardCode || "");
  // Use dbName and token as needed in your HomePage component

  const { hasFather, parentCustomer, cardCode, cardName, fullName } =
    location.state;

  const {
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
    setShowInvoiceHistory,
    showInvoiceHistory,
    showOptions,
    setShowOptions,
    dates,
    setDates,
    logoutCustomerOptions,
    accountStatmentAPI,
    setAccountStatmentAPI,
    selectedBranch,
    setSelectedBranch,
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
  } = useCustomerOptions();

  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? arEG : enUS;
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const [editingIdCreditCardId, seteditingIdCreditCardId] = useState(null);
  const [editingIdCheckId, seteditingIdCheckId] = useState(null);
  const [editingIdCashId, seteditingIdCashId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openInvoicesAPI, setOpenInvoicesAPI] = useState([]);
  const [returnedChecksAPI, setReturnedChecksAPI] = useState([]);
  const [customerShipTosAPI, setCustomerShipTosAPI] = useState([]);
  const [formattedDataAccountStatment, setFormattedDataAccountStatment] =
    useState({
      dateFrom: "",
      dateTo: "",
    });

  function docDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  const totalRecords = returnedChecksAPI.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = returnedChecksAPI.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`${backendUrl}api/GetBranches`, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
          },
        });

        console.log(response.data.results, "ffff");

        if (response.data.status === "Success") {
          setBranches(response.data.results);
        } else {
          console.error("Failed to fetch branches");
        }
      } catch (error) {
        toast.error(`Error accrued while fetching branches data`);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [dbName, token]);

  useEffect(() => {
    const fetchBanks = async () => {
      const url = `${backendUrl}api/GetBanks`;
      const headers = {
        "Content-Type": "application/json",
        dbName: dbName,
        token: token,
      };

      try {
        setLoading(true);

        const response = await fetch(url, { headers });
        const data = await response.json();

        if (data.status === "Success") {
          setBanks(data.results);

          // Set selectedBankCode initially if not set (optional)
          if (!selectedBankCode && data.results.length > 0) {
            setSelectedBankCode(data.results[0].bankCode); // Example: setting the first bankCode as default
          }
        } else {
          console.error("Failed to fetch banks:", data.status);
        }
      } catch (error) {
        toast.error(`Error accrued while fetching banks data`);
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, [dbName, token, selectedBankCode]);

  const isValid = (selectedBranch) => {
    if (selectedBranch !== "") {
      return true;
    } else {
      return false;
    }
  };
  isValid(selectedBranch);

  useEffect(() => {
    if (
      showAccountStatement &&
      dates.startDate != null &&
      dates.endDate != null
    ) {
      const getAccountStatment = async () => {
        const startDate = new Date(dates.startDate);
        const endDate = new Date(dates.endDate);

        const formattedStartDate = `${startDate.getFullYear()}-${(
          startDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${startDate
          .getDate()
          .toString()
          .padStart(2, "0")}`;
        const formattedEndDate = `${endDate.getFullYear()}-${(
          endDate.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}-${endDate.getDate().toString().padStart(2, "0")}`;
        setFormattedDataAccountStatment((prevState) => ({
          ...prevState,
          dateFrom: formattedStartDate,
          dateTo: formattedEndDate,
        }));

        const url = `${backendUrl}api/GetAccountStatement`;
        const headers = {
          "Content-Type": "application/json",
          dbName: dbName,
          token: token,
          customerCode: cardCode,
          dateFrom: formattedStartDate,
          dateTo: formattedEndDate,
        };

        try {
          setLoading(true);

          const response = await fetch(url, { headers });
          const data = await response.json();
          if (data.status === "Success") {
            setAccountStatmentAPI(data.results);
          } else {
            console.error("Failed to fetch Account Statement:", data.status);
          }
        } catch (error) {
          toast.error(`Error accrued while fetching account statement data`);
        } finally {
          setLoading(false);
        }
      };

      getAccountStatment();
    }
  }, [
    dbName,
    token,
    cardCode,
    dates.startDate,
    dates.endDate,
    showOptions,
    showAccountStatement,
  ]);

  useEffect(() => {
    if (showReturnedChecks) {
      const getReturnedChecks = async () => {
        const url = `${backendUrl}api/GetReturnedChecks`;
        const headers = {
          "Content-Type": "application/json",
          dbName: dbName,
          token: token,
          customerCode: cardCode,
          branchId: cookies.token?.branchId,
        };

        try {
          setLoading(true);

          const response = await fetch(url, { headers });
          const data = await response.json();
          if (data.status === "Success") {
            console.log(data.results, "resultes dataaa");

            setReturnedChecksAPI(data.results);
          } else if (data.state === "Failure") {
            console.error("Failed to fetch Returned Checks:", data.status);
            toast.error(
              `Failed to fetch Returned Checks:" ${data.errorMessage}`
            );
          }
        } catch (error) {
          toast.error(`Error accrued while fetching returned checks data`);
        } finally {
          setLoading(false);
        }
      };

      getReturnedChecks();
    }
  }, [dbName, token, cardCode, cookies.token?.branchId, showReturnedChecks]);
  ////

  //Invoices
  useEffect(() => {
    if (showInvoices) {
      const getOpenInvoices = async () => {
        const url = `${backendUrl}api/GetOpenInvoices`;
        const headers = {
          "Content-Type": "application/json",
          dbName: dbName,
          token: token,
          customerCode: cardCode,
        };

        try {
          setLoading(true);

          const response = await fetch(url, { headers });
          const data = await response.json();
          if (data.status === "Success") {
            console.log(data.results, "here rana");

            setOpenInvoicesAPI(data.results);
          } else if (data.state === "Failure") {
            console.error("Failed to fetch Open Invoices:", data.status);
            toast.error(`Failed to fetch Open Invoices:" ${data.errorMessage}`);
          }
        } catch (error) {
          toast.error(`Error accrued while fetching open invoices data`);
        } finally {
          setLoading(false);
        }
      };

      getOpenInvoices();
    }
  }, [dbName, token, cardCode, showInvoices]);

  useEffect(() => {
    const getCustomerShipTos = async () => {
      const url = `${backendUrl}api/GetShipTos`;
      const headers = {
        "Content-Type": "application/json",
        dbName: dbName,
        token: token,
        // customerCode: cardCode,
      };

      try {
        setLoading(true);

        const response = await fetch(url, { headers });
        const data = await response.json();
        //console.log(response, "test projects");

        if (data.status === "Success") {
          console.log(data, "test projects");
          setCustomerShipTosAPI(data.results);
        } else if (data.state === "Failure") {
          console.error("Failed to fetch CustomerShipTos:", data.status);
          toast.error(`Failed to fetch CustomerShipTos:" ${data.errorMessage}`);
        }
      } catch (error) {
        console.log(error, "Qty report error");

        toast.error(
          `Error accrued while fetching customer shipTos data`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    getCustomerShipTos();
  }, [dbName, token, cardCode]);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handelSelectedBank = (e) => {
    const selectedBankCode = e.target.value;

    // Find the bank object that matches the selected bankCode
    const selectedBankDetails = banks.find(
      (bank) => bank.bankCode === selectedBankCode
    );

    if (selectedBankDetails) {
      setSelectedBank({
        bankCode: selectedBankDetails.bankCode,
        bankName: selectedBankDetails.bankName,
      });
    } else {
      // Reset if no bank is selected
      setSelectedBank({ bankCode: "", bankName: "" });
    }
  };

  const handleBackToOptionsFromAccountStatement = () => {
    setShowOptions(true);
    setShowAccountStatement(false);
    logoutCustomerOptions();
  };

  const handleBackToOptionsFromReturnedChecks = () => {
    setShowOptions(true);
    setShowReturnedChecks(false);
  };

  const handleBackToOptionsFromQuantitiesReport = () => {
    setShowOptions(true);
    setShowQuantitiesReport(false);
    logoutCustomerOptions();
  };

  const handleBackToOptionsFromInvoices = () => {
    setShowOptions(true);
    setShowInvoices(false);
  };

  const handleBackToOptionsFrompayments = () => {
    setShowOptions(true);
    setShowPayments(false);
    logoutCustomerOptions();
  };

  const handleNextToAccountStatement = () => {
    setShowAccountStatement(true);
    setShowOptions(false);
  };

  const handleNextToReturnedChecks = () => {
    setShowOptions(false);
    setShowReturnedChecks(true);
  };

  const handleNextToQuantitiesReport = () => {
    setShowOptions(false);
    setShowQuantitiesReport(true);
  };

  const handleNextToInvoices = () => {
    setShowOptions(false);
    setShowInvoices(true);
  };

  const handleNextTopayments = () => {
    setShowOptions(false);
    setShowPayments(true);
  };

  const handleNextToInvoiceHistory = () => {
    setShowOptions(false);
    setShowInvoiceHistory(true);
  };

  const ReadOnlyInputField = ({ label, value, readOnly }) => (
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

  const InputField = ({ label, value, onChange }) => (
    <div className="flex flex-col space-y-2 mt-5">
      <label className="text-sm  ">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="p-2 w-3/4 xl:w-1/3 border rounded-xl "
      />
    </div>
  );

  const DropdownField = ({
    label,
    value,
    onChange,
    options,
    valueKey,
    labelKey,
  }) => {
    const selectedOption =
      options.find((option) => option[valueKey] === value) || null;

    return (
      <div className="flex flex-col space-y-1 mt-5">
        <label className="text-sm mb-2">{label}</label>
        <div className="w-3/5 xl:w-1/2">
          <Autocomplete
            value={selectedOption}
            onChange={(event, newValue) => {
              onChange({
                target: {
                  value: newValue ? newValue[valueKey] : "",
                },
              });
            }}
            options={options}
            getOptionLabel={(option) => option[labelKey] || ""}
            isOptionEqualToValue={(option, val) =>
              option[valueKey] === val[valueKey]
            }
            renderInput={(params) => (
              <TextField {...params} label={`Select`} size="small" />
            )}
            disableClearable={false}
          />
        </div>
      </div>
    );
  };

  const handleCardHolderNameChange = (event) => {
    setCardHolderName(event.target.value);
  };

  const handleVoucherNoChange = (event) => {
    const value = event.target.value;

    if (!/^\d*$/.test(value)) {
      toast.error("Voucher No must contain only numbers.");
      return;
    }

    if (value.length > 20) {
      toast.error("Voucher No cannot exceed 20 characters.");
      return;
    }

    setVoucherNo(value);
  };

  const handleCreditCardTypeChange = (event) => {
    setCreditCardType(event.target.value);
  };

  const handleCreditCardNumberChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      if (value.length <= 4) {
        setCreditCardNumber(value);
      } else {
        toast.error("Credit card number cannot exceed 4 digits.");
      }
    } else {
      toast.error("Credit card number must contain only numbers.");
    }
  };

  const addCreditCardTable = () => {
    if (creditCardType === 0) {
      toast.error("Please choose a credit card type.");
    } else if (creditCardNumber === "") {
      toast.error("Credit card number date is mandatory.");
    } else if (expirationDate === "") {
      toast.error("Expiration date is mandatory.");
    } else if (amount === "") {
      toast.error("Amount date is mandatory.");
    } else if (cardHolderName === "") {
      toast.error("Card holder name date is mandatory.");
    } else if (voucherNo === "") {
      toast.error("Voucher No date is mandatory.");
    } else {
      let creditCardTypeAsInt = 0;

      const uniqueId = uuidv4();
      const newEntry = {
        id: uniqueId,
        creditCardType: creditCardType,
        creditCardNumber: creditCardNumber,
        expirationDate: expirationDate,
        amount: amount,
        cardHolderName: cardHolderName,
        voucherNo: voucherNo,
      };

      setCreditCardTable([...CreditCardTable, newEntry]);
      updateTotalPaidAmount();

      if (creditCardType === "Visa") {
        creditCardTypeAsInt = 1;
      }
      if (creditCardType === "Mastercard") {
        creditCardTypeAsInt = 2;
      }
      setPaymentLine((prevPaymentLine) => [
        ...prevPaymentLine,
        {
          id: newEntry.id,
          paymentMethod: "CreditCard",
          creditCardType: creditCardTypeAsInt,
          creditCardNumber: creditCardNumber,
          expirationDate: expirationDate,
          cardHolderName: cardHolderName,
          voucherNo: voucherNo,
          amount: amount,
          dueDate: "",
          bankCode: "",
          payeeName: "",
          checkNumber: 0,
        },
      ]);
      // Clear form fields
      setCreditCardType("");
      setCreditCardNumber("");
      setExpirationDate("");
      setAmount("");
      setCardHolderName("");
      setVoucherNo("");
      setdateNotFormatted(null);
    }
  };

  const handleFieldChange = (id, field, value) => {
    const updatedPayments = CreditCardTable.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setCreditCardTable(updatedPayments);
    updateTotalPaidAmount();

    setPaymentLine((prevPaymentLine) =>
      prevPaymentLine.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleEditToggle = (id) => {
    seteditingIdCreditCardId(editingIdCreditCardId === id ? null : id);
  };

  const cashAmountHandler = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,3}$/.test(value)) {
      setCashAmount(value);
    } else {
      toast.error(
        "Cash Amount must be a valid number with up to 3 decimal places."
      );
    }
  };

  const formatDate = (dateString) => {
    // Extract the date part (before the space)
    const datePart = dateString.split(" ")[0];

    // Split the date part into day, month, and year
    const [day, month, year] = datePart.split("/");

    // Reformat the date to the desired format (month/day/year)
    return `${month}/${day}/${year}`;
  };

  const handleRemoveCreditCard = (id) => {
    const filteredData = CreditCardTable.filter((item) => item.id !== id);
    setCreditCardTable(filteredData);

    setPaymentLine((prevPaymentLine) =>
      prevPaymentLine.filter((item) => item.id !== id)
    );

    if (editingIdCreditCardId === id) {
      seteditingIdCreditCardId(null);
      updateTotalPaidAmount();
    }
  };

  const addCheckTable = () => {
    if (checkNumber === 0) {
      toast.error("Please fill Check number.");
    } else if (selectedBank.bankCode === "") {
      toast.error("Please choose a bank.");
    } else if (dueDate === "") {
      toast.error("Please choose a due date.");
    } else if (amountcheck === "") {
      toast.error("Amount is mandatory.");
    } else if (payeeName === "") {
      toast.error("Payee Name is mandatory.");
    } else {
      const startDate = new Date(dueDate);

      const formattedStartDate = `${startDate
        .getDate()
        .toString()
        .padStart(2, "0")}/${(startDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${startDate.getFullYear()}`;

      const uniqueId = uuidv4();

      const addCheckData = {
        id: uniqueId,
        checkNumber: checkNumber,
        bank: selectedBank.bankCode,

        dueDate: formattedStartDate,
        amountcheck: amountcheck,
        payeeName: payeeName,
      };

      ///////////////
      setPaymentLine((prevPaymentLine) => [
        ...prevPaymentLine,
        {
          id: addCheckData.id,
          paymentMethod: "Check",
          creditCardType: 0,
          creditCardNumber: "",
          expirationDate: "",
          cardHolderName: "",
          voucherNo: "",
          amount: amountcheck,
          dueDate: formattedStartDate,
          bankCode: selectedBank.bankCode,
          payeeName: payeeName,
          checkNumber: checkNumber,
        },
      ]);
      ///////////////
      setCheckTable([...checkTable, addCheckData]);
      updateTotalPaidAmount();
      setCheckNumber("");
      setSelectedBank({
        bankCode: "",
        bankName: "",
      });
      setDueDate("");
      setAmountcheck("");
      setPayeeName("");
    }
  };

  const handleFieldChangeCheckTable = (id, field, value) => {
    const updatedCheckTable = checkTable.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setCheckTable(updatedCheckTable);
    updateTotalPaidAmount();

    setPaymentLine((prevPaymentLine) =>
      prevPaymentLine.map((item) => {
        if (item.id === id) {
          // Ensure that we map cashAmount to amount and remove cashAmount
          const updatedItem = { ...item };

          if (field === "amountcheck") {
            updatedItem.amount = value; // Update the amount field
          } else {
            updatedItem[field] = value; // Update other fields
          }

          delete updatedItem.amountcheck; // Ensure cashAmount is removed from the object

          return updatedItem;
        }
        return item;
      })
    );

    /*  setPaymentLine((prevPaymentLine) =>
      prevPaymentLine.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
    */
  };

  const handleEditToggleCheckTable = (id) => {
    seteditingIdCheckId(editingIdCheckId === id ? null : id);
  };

  const handleRemoveCheckTable = (id) => {
    const filteredData = checkTable.filter((item) => item.id !== id);
    setCheckTable(filteredData);

    setPaymentLine((prevPaymentLine) =>
      prevPaymentLine.filter((item) => item.id !== id)
    );

    if (editingIdCheckId === id) {
      seteditingIdCheckId(null);
      updateTotalPaidAmount();
    }
  };

  const addCashTable = () => {
    if (cashAmount === "") {
      toast.error("Cash amount date is mandatory.");
    } else {
      const selectedBranchName =
        branches.find((branch) => branch.branchCode === cookies.token?.branchId)
          ?.branchName || "";

      const addCashData = {
        id: cashTable.length + 1,
        branch: selectedBranchName,
        cashAmount: cashAmount,
      };

      setPaymentLine((prevPaymentLine) => [
        ...prevPaymentLine,
        {
          id: addCashData.id,
          paymentMethod: "Cash",
          creditCardType: 0,
          creditCardNumber: "",
          expirationDate: "",
          cardHolderName: "",
          voucherNo: "",
          amount: cashAmount,
          dueDate: "",
          bankCode: "",
          payeeName: "",
          checkNumber: 0,
        },
      ]);

      setCashTable([...cashTable, addCashData]);
      setCashAmount("");
      setSelectedBranch(cookies.token?.branchId); // Ensure selectedBranch is set correctly
    }
  };

  const amountcheckHandler = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,3}$/.test(value)) {
      setAmountcheck(value);
    } else {
      toast.error("Amount check must contain only numbers.");
    }
  };

  const CheckNumberHandler = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCheckNumber(value);
    } else {
      toast.error("Check number must contain only numbers.");
    }
  };

  const handleFieldChangeCashTable = (id, field, value) => {
    const updatedCashTable = cashTable.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setCashTable(updatedCashTable);
    updateTotalPaidAmount();

    setPaymentLine((prevPaymentLine) =>
      prevPaymentLine.map((item) => {
        if (item.id === id) {
          // Ensure that we map cashAmount to amount and remove cashAmount
          const updatedItem = { ...item };

          if (field === "cashAmount") {
            updatedItem.amount = value; // Update the amount field
          } else {
            updatedItem[field] = value; // Update other fields
          }

          delete updatedItem.cashAmount; // Ensure cashAmount is removed from the object

          return updatedItem;
        }
        return item;
      })
    );
  };

  const handleEditToggleCashTable = (id) => {
    seteditingIdCashId(editingIdCashId === id ? null : id);
  };

  const handleRemoveCashTable = (id) => {
    const filteredData = cashTable.filter((item) => item.id !== id);
    setCashTable(filteredData);

    setPaymentLine((prevPaymentLine) =>
      prevPaymentLine.filter((item) => item.id !== id)
    );

    if (editingIdCashId === id) {
      seteditingIdCashId(null);
      updateTotalPaidAmount();
    }
  };

  const updateTotalPaidAmount = () => {
    const sumCashAmount = cashTable.reduce(
      (acc, item) => acc + parseFloat(item.cashAmount || 0),
      0
    );
    const sumCreditAmount = CreditCardTable.reduce(
      (acc, item) => acc + parseFloat(item.amount || 0),
      0
    );
    const sumCheckAmount = checkTable.reduce(
      (acc, item) => acc + parseFloat(item.amountcheck || 0),
      0
    );
    const total = sumCashAmount + sumCreditAmount + sumCheckAmount;
    setTotalPaidAmount(total.toFixed(3));
  };

  useEffect(() => {
    updateTotalPaidAmount();
  }, [cashTable, CreditCardTable, checkTable]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const hideModal = () => {
    setIsModalVisible(false);
    setShowPayments(false);
    setShowOptions(true);
  };

  function expirationDateFunction(date) {
    setdateNotFormatted(date);

    const newdate = new Date(date);

    const formattedDate = `${newdate.getDate().toString().padStart(2, "0")}/${(
      newdate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${newdate.getFullYear()}`;

    setExpirationDate(formattedDate);
  }

  async function handlePay() {
    const filteredPaymentLine = paymentLine.filter(
      (line) => line.paymentMethod !== ""
    );

    // Update the state with the filtered array
    setPaymentLine(filteredPaymentLine);
    if (filteredPaymentLine.length === 0) {
      toast.error("At least add one payment method details");
    } else {
      const payload = {
        docDate: docDate(),
        customerCode: cardCode,
        userCode: cookies.token?.userCode,
        branchId: cookies.token?.branchId,
        notes: notes,
        paymentLine: filteredPaymentLine,
      };

      const headers = {
        "Content-Type": "application/json",
        dbName: dbName,
        token: token,
      };

      try {
        setLoading(true);

        const response = await fetch(`${backendUrl}api/AddIncomingPayment`, {
          method: "POST",
          headers: headers,
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.status === "Success") {
          toast.success("The Incoming Payment Has Been Added Successfully");
          // Optionally reset the form
          // resetForm();
          // Optionally redirect the user
          // navigate('/success-page');
          logoutCustomerOptions();
        } else {
          const parsedError = JSON.parse(data.errorMessage);
          const errorValue = parsedError.error.message.value;
          toast.error(`Failed to add the incoming payment. ${errorValue}`);
        }
      } catch (error) {
        toast.error(
          `Failed to add the incoming payment. Please select a branch.`
        );
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
  }

  ///Print Account Statment logic
  async function printAccountStatment() {
    if (dates.startDate == null) {
      toast.error("Please select from date");
      return;
    }
    if (dates.endDate === null) {
      toast.error("Please select to date");
      return;
    }

    {
      /*
        const headers = {
      "Content-Type": "application/json",
      dbname: cookies.token?.selectedCompany,
    };
      */
    }

    let body = {
      customerCode: cardCode,
      dateFrom: formattedDataAccountStatment.dateFrom,
      dateTo: formattedDataAccountStatment.dateTo,
      dbname: cookies.token?.selectedCompany,
    };

    try {
      setLoading(true);

      let response = await axios.post(
        `${attachmentUrl}/AccountStatement/Pdf`,
        body,
        {
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        toast.success("Account statement has been successfully generated!");

        const contentType = response.headers["content-type"];
        if (contentType !== "application/pdf") {
          throw new Error("Invalid response type, expected PDF");
        }
        // Create a Blob from the response data
        const file = new Blob([response.data], { type: contentType });

        // Generate a URL for the Blob
        const fileURL = URL.createObjectURL(file);
        // Open the generated PDF in a new tab
        window.open(fileURL, "_blank");

        // Optionally, trigger a download if you want to save the file directly
        const link = document.createElement("a");
        link.href = fileURL;
        link.download = "AccountStatement.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.log("Check");

        toast.error("Failed to generate account statement. Please try again.");
      }
    } catch (error) {
      console.log(error);

      toast.error("Failed to generate account statement. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function printFatherAccountStatment() {
    if (dates.startDate == null) {
      toast.error("Please select from date");
      return;
    }
    if (dates.endDate === null) {
      toast.error("Please select to date");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      dbname: cookies.token?.selectedCompany,
    };

    let body = {
      customerCode: parentCustomer,
      dateFrom: formattedDataAccountStatment.dateFrom,
      dateTo: formattedDataAccountStatment.dateTo,
    };

    try {
      setLoading(true);

      let response = await axios.post(
        `${attachmentUrl}/AccountStatement/Pdf`,
        body,
        {
          headers,
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        toast.success("Account statement has been successfully generated!");

        const contentType = response.headers["content-type"];

        if (contentType !== "application/pdf") {
          throw new Error("Invalid response type, expected PDF");
        }
        // Create a Blob from the response data
        const file = new Blob([response.data], { type: contentType });

        // Generate a URL for the Blob
        const fileURL = URL.createObjectURL(file);

        // Open the generated PDF in a new tab
        window.open(fileURL, "_blank");

        // Optionally, trigger a download if you want to save the file directly
        const link = document.createElement("a");
        link.href = fileURL;
        link.download = "AccountStatement.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error("Failed to generate account statement. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to generate account statement. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const amountvalidation = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,3}$/.test(value)) {
      setAmount(value);
    } else {
      toast.error("Amount must contain only numbers.");
    }
  };
  async function printQuantitiesReportFunction() {
    //edit date format
    if (dates.startDate == null) {
      toast.error("Please select from date");
      return;
    }
    if (dates.endDate === null) {
      toast.error("Please select to date");
      return;
    }

    if (selectedOption === "") {
      toast.error("Please select a project");
      return;
    }

    const startDate = new Date(dates.startDate);
    const endDate = new Date(dates.endDate);

    const formattedStartDate = `${(startDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${startDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${startDate.getFullYear()}`;

    const formattedEndDate = `${(endDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${endDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${endDate.getFullYear()}`;

    const headers = {
      "Content-Type": "application/json",
      dbname: cookies.token?.selectedCompany,
    };

    let body = {
      customerCode: cardCode,
      project: selectedOption === "All" ? "" : selectedOption,
      dateFrom: formattedStartDate,
      dateTo: formattedEndDate,
      dbname: cookies.token?.selectedCompany,
    };

    console.log(body);

    try {
      setLoading(true);

      let response = await axios.post(
        `${attachmentUrl}/CustomerQty/Pdf`,
        body,
        {
          //headers,
          responseType: "blob",
        }
      );

      const contentType = response.headers["content-type"];

      if (contentType !== "application/pdf") {
        throw new Error("Invalid response type, expected PDF");
      }
      // Create a blob from the response data
      const file = new Blob([response.data], { type: "application/pdf" });

      // Create a URL for the blob
      const fileURL = URL.createObjectURL(file);

      // Open the PDF in a new tab
      window.open(fileURL, "_blank");
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = "QuantitiesReport.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error, "error");

      toast.error("Failed to print Quntitites report API");
    } finally {
      setLoading(false);
    }
  }

  // Print All Invoices Report
  async function InvoiceHistory() {
    //edit date format
    if (dates.startDate == null) {
      toast.error("Please select from date");
      return;
    }
    if (dates.endDate === null) {
      toast.error("Please select to date");
      return;
    }

    const startDate = new Date(dates.startDate);
    const endDate = new Date(dates.endDate);

    const formattedStartDate = `${(startDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${startDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${startDate.getFullYear()}`;

    const formattedEndDate = `${(endDate.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${endDate
      .getDate()
      .toString()
      .padStart(2, "0")}/${endDate.getFullYear()}`;

    {
      /*
       const headers = {
      "Content-Type": "application/json",
      dbname: cookies.token?.selectedCompany,
    }; 
        */
    }
    let body = {
      CardCode: cardCode,
      //Branch: selectedBranch === "All" ? "" : selectedBranch,
      FromDate: formattedStartDate,
      ToDate: formattedEndDate,
      dbname: cookies.token?.selectedCompany,
    };
    console.log(body, "Bodyy");

    try {
      setLoading(true);

      let response = await axios.post(`${attachmentUrl}/ARInvoices/Pdf`, body, {
        //headers,
        responseType: "blob",
      });
      // toast.success("Quantities Report has been successfully generated!");
      console.log(response, "response from Q-report");

      console.log(response.headers, "headerssss");

      const contentType = response.headers["content-type"];
      console.log(contentType, "content type");

      if (contentType !== "application/pdf") {
        throw new Error("Invalid response type, expected PDF");
      }
      // Create a blob from the response data
      const file = new Blob([response.data], { type: "application/pdf" });

      // Create a URL for the blob
      const fileURL = URL.createObjectURL(file);
      console.log(response, "Full response from API");
      console.log(file, "Blob file");
      console.log(fileURL, "Generated file URL");

      // Open the PDF in a new tab
      window.open(fileURL, "_blank");
      const link = document.createElement("a");
      link.href = fileURL;
      link.download = "ARInvoices.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Response on print Quantities Report API:", response.data);
    } catch (error) {
      console.log(error, "ARInvoices error");

      toast.error("Failed to print ARInvoices report API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ConfigProvider locale={locale}>
      <div
        className={`bg-[#FAFAFF]  min-h-screen flex ${
          i18n.dir() === "rtl" ? "flex-row-reverse" : ""
        }`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header onNotificationsClick={toggleNotifications} />
          {showNotifications ? (
            <Notifications />
          ) : (
            <main
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
              className="md:bg-white   p-4 sm:m-5 sm:p-5  md:m-10 xl:m-12 mt-5 rounded-xl w-[23rem] md:w-5/6 xl:w-11/12 "
              style={{ height: "100%" }}
            >
              {showOptions && (
                <>
                  <div className="ml-5 mr-5 mb-12">
                    <h1 className="text-2xl mb-4">{t("customersOptions")}</h1>
                    <div className="border-b-2 border-gray-200 mt-2"></div>
                  </div>

                  <ul
                    className={`w-full max-w-md space-y-14 ${
                      i18n.language === "ar" ? "mr-5" : "ml-5"
                    }`}
                  >
                    <li
                      className="flex items-center gap-5 cursor-pointer"
                      onClick={handleNextToAccountStatement}
                    >
                      <img
                        src={statementIcon}
                        alt="Statement"
                        className="h-6 w-6"
                      />
                      <span className="text-lg">{t("accountStatement")}</span>
                    </li>
                    <li
                      className="flex items-center gap-5 cursor-pointer"
                      onClick={handleNextToReturnedChecks}
                    >
                      <img src={checksIcon} alt="Checks" className="h-6 w-6" />
                      <span className="text-lg">{t("returnedChecks")}</span>
                    </li>
                    <li
                      className="flex items-center gap-5 cursor-pointer"
                      onClick={handleNextToQuantitiesReport}
                    >
                      <img src={reportIcon} alt="Report" className="h-6 w-6" />
                      <span className="text-lg">{t("quantitiesReport")}</span>
                    </li>
                    <li
                      className="flex items-center gap-5 cursor-pointer"
                      onClick={handleNextToInvoices}
                    >
                      <img
                        src={invoiceIcon}
                        alt="Invoice"
                        className="h-6 w-6"
                      />
                      <span className="text-lg">{t("openInvoices")}</span>
                    </li>
                    <li
                      className="flex items-center gap-5 cursor-pointer"
                      onClick={handleNextToInvoiceHistory}
                    >
                      <img
                        src={invoiceIcon}
                        alt="Invoice"
                        className="h-6 w-6"
                      />
                      <span className="text-lg">{t("InvoiceHistory")}</span>
                    </li>

                    <li
                      className="flex items-center gap-5 cursor-pointer"
                      onClick={handleNextTopayments}
                    >
                      <img
                        src={paymentIcon}
                        alt="Payment"
                        className="h-6 w-6"
                      />
                      <span className="text-lg">{t("Payment")}</span>
                    </li>
                  </ul>
                  <div className="flex justify-end mr-5 mb-5 mt-5">
                    <button
                      className="mt-8 px-6 py-1 pb-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={handleBack}
                    >
                      {t("back")}
                    </button>
                  </div>
                </>
              )}
              {showAccountStatement && (
                <>
                  <div className="ml-5 mr-5 mb-12">
                    <h1 className="text-2xl mb-4">{t("accountStatement")}</h1>

                    <div className="border-b-2 border-gray-200 mt-2 flex gap-10">
                      <h3>
                        {t("customerName")}: {fullName}
                      </h3>
                      <h3>
                        {t("cardcode")}: {cardCode}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col md:grid grid-cols-4 gap-4 mb-8 mt-8">
                    <div>
                      <label
                        htmlFor="fromDate"
                        className="block  text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("From")}
                      </label>
                      <DatePicker
                        value={dates.startDate ? dayjs(dates.startDate) : null}
                        onChange={(date) =>
                          setDates({ ...dates, startDate: date })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="toDate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("To")}
                      </label>
                      <DatePicker
                        value={dates.endDate ? dayjs(dates.endDate) : null}
                        onChange={(date) =>
                          setDates({ ...dates, endDate: date })
                        }
                      />
                    </div>
                  </div>

                  <ReadOnlyInputField
                    label={t("customername")}
                    value={accountStatmentAPI[0]?.cardName}
                    readOnly={true}
                  />
                  <ReadOnlyInputField
                    label={t("cardcode")}
                    value={accountStatmentAPI[0]?.cardCode}
                    readOnly={true}
                  />
                  <ReadOnlyInputField
                    label={t("billingno.")}
                    value={accountStatmentAPI[0]?.u_ST_BillingNo}
                    readOnly={true}
                  />
                  <ReadOnlyInputField
                    label={t("balance")}
                    value={
                      accountStatmentAPI[0]?.balance
                        ? formatNumber(accountStatmentAPI[0]?.balance)
                        : ""
                    }
                    readOnly={true}
                  />
                  <ReadOnlyInputField
                    label={t("creditlimit")}
                    value={
                      accountStatmentAPI[0]?.creditLine
                        ? formatNumber(accountStatmentAPI[0]?.creditLine)
                        : ""
                    }
                    readOnly={true}
                  />
                  <ReadOnlyInputField
                    label={t("paymentterms")}
                    value={accountStatmentAPI[0]?.pymntGroup}
                    readOnly={true}
                  />

                  <div className="flex justify-end mt-8 mb-8 gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: "#489AB9" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleBackToOptionsFromAccountStatement}
                    >
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={printAccountStatment}
                    >
                      {t("account statement")}
                    </button>
                  </div>

                  {hasFather === "Y" && (
                    <div className="flex justify-end mt-8 mb-8 gap-3 mr-12">
                      <button
                        type="button"
                        style={{ backgroundColor: "#272C6F" }}
                        className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                        onClick={printFatherAccountStatment}
                      >
                        {t("father account statement")}
                      </button>
                    </div>
                  )}
                </>
              )}

              {showReturnedChecks && (
                <>
                  <div className="ml-5 mr-5 mb-12">
                    <h1 className="text-2xl mb-4">{t("returnedChecks")}</h1>

                    <div className="border-b-2 border-gray-200 mt-2 flex gap-10">
                      <h3>
                        {t("customerName")}: {fullName}
                      </h3>
                      <h3>
                        {t("cardcode")}: {cardCode}
                      </h3>
                    </div>
                  </div>

                  <div className="Returned-Checks-container">
                    <div className="overflow-x-auto rounded-md border border-gray-300 mb-5">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="font-normal border border-gray-300 px-4 py-2">
                              {t("JEnumber")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2">
                              {t("branch")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2">
                              {t("JEdate")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2">
                              {t("DueDate")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2">
                              {t("CheckAmount")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2">
                              {t("TheRemainingAmount")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2">
                              {t("Check Number")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentRecords.map((check, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={check.transNumber}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={check.branch}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={formatDate(check.refDate)}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={formatDate(check.dueDate)}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={
                                    check.total
                                      ? formatNumber(check.checkAmount)
                                      : ""
                                  }
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={
                                    check.balanceDue
                                      ? formatNumber(check.balanceDue)
                                      : ""
                                  }
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={check.checkNum}
                                  readOnly
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className="flex justify-end p-4">
                        <input
                          type="text"
                          className="p-4 w-full text-right"
                          value={`${t("TotalOpenAmount")}: ${formatNumber(
                            returnedChecksAPI.reduce(
                              (sum, check) =>
                                sum + (parseFloat(check.balanceDue) || 0),
                              0
                            )
                          )}`}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mb-5">
                        <nav className="flex gap-2">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
                          >
                            Previous
                          </button>

                          {pageNumbers.map((number) => (
                            <button
                              key={number}
                              onClick={() => handlePageChange(number)}
                              className={`px-3 py-1 rounded-md ${
                                currentPage === number
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200 hover:bg-gray-300"
                              }`}
                            >
                              {number}
                            </button>
                          ))}

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded-md bg-gray-200 disabled:opacity-50 hover:bg-gray-300"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end mt-36 mb-8 gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: "#489AB9" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleBackToOptionsFromReturnedChecks}
                    >
                      {t("back")}
                    </button>
                  </div>
                </>
              )}

              {showQuantitiesReport && (
                <>
                  <div className="ml-5 mr-5 mb-12">
                    <h1 className="text-2xl mb-4">{t("quantitiesReport")}</h1>

                    <div className="border-b-2 border-gray-200 mt-2 flex gap-10">
                      <h3>
                        {t("customerName")}: {fullName}
                      </h3>
                      <h3>
                        {t("cardcode")}: {cardCode}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col md:grid grid-cols-4 gap-4 mb-8 mt-8">
                    <div>
                      <label
                        htmlFor="fromDate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("From")}
                      </label>
                      <DatePicker
                        value={dates.startDate ? dayjs(dates.startDate) : null}
                        onChange={(date) =>
                          setDates({ ...dates, startDate: date })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="toDate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("To")}
                      </label>
                      <DatePicker
                        value={dates.endDate ? dayjs(dates.endDate) : null}
                        onChange={(date) =>
                          setDates({ ...dates, endDate: date })
                        }
                      />
                    </div>
                  </div>

                  <DropdownField
                    label={t("project")}
                    labelKey="shipToName"
                    valueKey="shipToCode"
                    value={selectedOption}
                    onChange={handleChange}
                    options={customerShipTosAPI}
                  />

                  <div className="flex justify-end mt-36 mb-8 gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: "#489AB9" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleBackToOptionsFromQuantitiesReport}
                    >
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={printQuantitiesReportFunction}
                    >
                      {t("print")}
                    </button>
                  </div>
                </>
              )}

              {showInvoices && (
                <>
                  <div className="ml-5 mr-5 mb-12">
                    <h1 className="text-2xl mb-4">{t("Invoices")}</h1>
                    <div className="border-b-2 border-gray-200 mt-2 flex gap-10">
                      <h3>
                        {t("customerName")}: {fullName}
                      </h3>
                      <h3>
                        {t("cardcode")}: {cardCode}
                      </h3>
                    </div>
                  </div>

                  <div className="Invoices-container ">
                    <div className="overflow-x-auto rounded-md border border-gray-300 mb-5">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("invoiceNumber")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("branch")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("Invoicedate")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("DueDate")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("InvoiceAmount")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("Paid")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("TheRemainingAmount")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("tax")}
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {openInvoicesAPI.map((invoice, index) => (
                            <tr key={index}>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={invoice.documentNumber}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={invoice.bplName}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={formatDate(invoice.documentDate)}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={formatDate(invoice.documentDueDate)}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={
                                    invoice.documentTotal
                                      ? formatNumber(invoice.documentTotal)
                                      : ""
                                  }
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={
                                    invoice.paid
                                      ? formatNumber(invoice.paid)
                                      : ""
                                  }
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={
                                    invoice.documentRemainingAmount
                                      ? formatNumber(
                                          invoice.documentRemainingAmount
                                        )
                                      : ""
                                  }
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={
                                    invoice.tax ? formatNumber(invoice.tax) : ""
                                  }
                                  readOnly
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <input
                        type="text"
                        className="p-4 w-full"
                        value={`${t("TotalOpenAmount")}: ${formatNumber(
                          openInvoicesAPI.reduce(
                            (sum, invoice) =>
                              sum +
                              (parseFloat(invoice.documentRemainingAmount) ||
                                0),
                            0
                          )
                        )}`}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-36 mb-8 gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: "#489AB9" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleBackToOptionsFromInvoices}
                    >
                      {t("back")}
                    </button>
                  </div>
                </>
              )}

              {showInvoiceHistory && (
                <>
                  <div className="ml-5 mr-5 mb-12">
                    <h1 className="text-2xl mb-4">{t("InvoiceHistory")}</h1>

                    <div className="border-b-2 border-gray-200 mt-2 flex gap-10">
                      <h3>
                        {t("customerName")}: {fullName}
                      </h3>
                      <h3>
                        {t("cardcode")}: {cardCode}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col md:grid grid-cols-4 gap-4 mb-8 mt-8">
                    <div>
                      <label
                        htmlFor="fromDate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("From")}
                      </label>
                      <DatePicker
                        value={dates.startDate ? dayjs(dates.startDate) : null}
                        onChange={(date) =>
                          setDates({ ...dates, startDate: date })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="toDate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        {t("To")}
                      </label>
                      <DatePicker
                        value={dates.endDate ? dayjs(dates.endDate) : null}
                        onChange={(date) =>
                          setDates({ ...dates, endDate: date })
                        }
                      />
                    </div>
                  </div>

                  {/*
   <div className="mb-4">
                    <label
                      htmlFor="branch"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("Branch")}
                    </label>
                    <select
                      id="branch"
                      name="branch"
                      className="bg-white mt-1 md:mt-3 block py-1 md:py-2 pl-2 w-3/4 xl:w-1/3 rounded-md border shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
                      onChange={(e) => setSelectedBranch(e.target.value)} // Add this line
                    >
                      <option value="" disabled selected>
                        Select an option
                      </option>
                      {branches.map((branch) => (
                        <option
                          key={branch.branchCode}
                          value={branch.branchCode}
                        >
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                  </div>
*/}

                  <div className="flex justify-end mt-36 mb-8 gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: "#489AB9" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleBackToOptionsFromQuantitiesReport}
                    >
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={InvoiceHistory}
                    >
                      {t("print")}
                    </button>
                  </div>
                </>
              )}

              {showPayments && (
                <>
                  <div className="ml-5 mr-5 mb-12 ">
                    <h1 className="text-2xl mb-4">{t("Payment")}</h1>
                    <div className="border-b-2 border-gray-200 mt-2 flex gap-10">
                      <h3>
                        {t("customerName")}: {fullName}
                      </h3>
                      <h3>
                        {t("cardcode")}: {cardCode}
                      </h3>
                    </div>
                  </div>

                  {/*
                              <div className="mb-4">
                    <label
                      htmlFor="branch"
                      className="block text-sm font-medium text-gray-700"
                    >
                      {t("Branch")}
                    </label>
                    <select
                      id="branch"
                      name="branch"
                      className="bg-white mt-1 md:mt-3 block py-1 md:py-2 pl-2 w-3/4 xl:w-1/3 rounded-md border shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
                      onChange={(e) => setSelectedBranch(e.target.value)} // Add this line
                    >
                      <option value="" disabled selected>
                        Select an option
                      </option>
                      {branches.map((branch) => (
                        <option
                          key={branch.branchCode}
                          value={branch.branchCode}
                        >
                          {branch.branchName}
                        </option>
                      ))}
                    </select>
                  </div>
                  */}

                  <div className="mb-4 w-full  mt-10">
                    <label className="block text-lg font-medium text-gray-700">
                      {t("paymentMethod")}
                    </label>
                    <div className="mt-5 ">
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("Cash")}
                        className={`px-4 py-2 text-xs md:text-sm w-1/3 md:w-1/6 border border-gray-300  ${
                          selectedPaymentMethod === "Cash"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600"
                        } focus:outline-none`}
                      >
                        {t("cash")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("CreditCard")}
                        className={`px-4 py-2 text-xs md:text-sm w-1/3 md:w-1/6 border border-gray-300  ${
                          selectedPaymentMethod === "CreditCard"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600"
                        } focus:outline-none`}
                      >
                        {t("creditCard")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("Check")}
                        className={`px-4 py-2 text-xs md:text-sm w-1/3 md:w-1/6 border border-gray-300  ${
                          selectedPaymentMethod === "Check"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600"
                        } focus:outline-none`}
                      >
                        {t("check")}
                      </button>
                    </div>
                  </div>

                  {selectedPaymentMethod === "Cash" && (
                    <>
                      <div className="mb-4 mt-10">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("cashAmount")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("cashAmount")}
                          value={cashAmount}
                          onChange={cashAmountHandler}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
             focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>
                      {cashTable.length === 0 && (
                        <div className="flex justify-end mt-4">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                            onClick={addCashTable}
                          >
                            {t("add")}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {selectedPaymentMethod === "CreditCard" && (
                    <>
                      <div className="mb-4 mt10">
                        <label
                          htmlFor="creditCardType"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("creditCardType")}
                        </label>
                        <select
                          id="creditCardType"
                          name="creditCardType"
                          value={creditCardType}
                          onChange={handleCreditCardTypeChange}
                          className="bg-white mt-1 md:mt-3 block py-1 md:py-2 pl-2 w-3/4 xl:w-1/3 rounded-md border shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
                        >
                          <option value="">
                            {t("Select a credit card type")}
                          </option>
                          <option value="Visa">{t("Visa")}</option>
                          <option value="Mastercard">{t("Mastercard")}</option>
                        </select>
                      </div>

                      <div className="mb-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("creditCardNumber")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("creditCardNumber")}
                          value={creditCardNumber}
                          onChange={handleCreditCardNumberChange}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
            focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      <div className="flex flex-col md:flex-row justify-start gap-5 md:gap-20 ">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t("expirationDate")}
                          </label>
                          <DatePicker
                            value={
                              dateNotFormatted ? dayjs(dateNotFormatted) : null
                            }
                            onChange={expirationDateFunction}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            {t("amount")}
                          </label>
                          <input
                            type="text"
                            placeholder={t("amount")}
                            value={amount}
                            onChange={amountvalidation}
                            className="py-1 px-3 block w-1/2 md:w-full border border-gray-300 rounded-md shadow-sm 
          focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                          />
                        </div>
                      </div>

                      <div className="mb-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("cardHolderName")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("cardHolderName")}
                          value={cardHolderName}
                          onChange={handleCardHolderNameChange}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
            focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      <div className="mb-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("voucherNo.")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("voucherNo.")}
                          value={voucherNo}
                          onChange={handleVoucherNoChange}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
            focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      {/* Conditionally render the "Add" button only if the CreditCardTable is empty */}
                      {CreditCardTable.length === 0 && (
                        <div className="flex justify-end mt-4">
                          <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                            onClick={addCreditCardTable}
                          >
                            {t("add")}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {selectedPaymentMethod === "Check" && (
                    <>
                      <div>
                        <label
                          htmlFor="fromDate"
                          value={dates}
                          onChange={(e) => setDates(e.target.value)}
                          className="block  text-sm font-medium text-gray-700 mb-2 mt-10"
                        >
                          {t("DueDate")}
                        </label>
                        <DatePicker
                          value={dueDate ? dayjs(dueDate) : null}
                          onChange={(date) => setDueDate(date)}
                        />
                      </div>

                      <div className="mb-4 mt-4">
                        <label
                          htmlFor="bank"
                          className="block text-sm font-medium text-gray-700"
                        >
                          {t("Bank")}
                        </label>
                        <select
                          id="bank"
                          name="bank"
                          value={selectedBank.bankCode}
                          onChange={handelSelectedBank}
                          className="bg-white mt-1 md:mt-3 block py-1 md:py-2 pl-2 w-3/4 xl:w-1/3 rounded-md border shadow-sm focus:border-indigo-300 focus:ring focus:ring-opacity-50"
                        >
                          <option value="">{t("Select a bank")}</option>
                          {banks.map((bank) => (
                            <option key={bank.bankCode} value={bank.bankCode}>
                              {bank.bankName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("amount")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("amount")}
                          value={amountcheck}
                          onChange={amountcheckHandler}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
             focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      <div className="mb-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("payeeName")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("payeeName")}
                          value={payeeName}
                          onChange={(e) => setPayeeName(e.target.value)}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
               focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      <div className="mb-4 mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                          {t("checkNumber")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("checkNumber")}
                          value={checkNumber}
                          onChange={CheckNumberHandler}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
               focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                          onClick={addCheckTable}
                        >
                          {t("add")}
                        </button>
                      </div>
                    </>
                  )}

                  {cashTable.length > 0 && selectedPaymentMethod === "Cash" && (
                    <>
                      <div className="overflow-x-auto rounded-md border border-gray-300 mb-5 mt-10">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                {t("cashAmount")}
                              </th>
                              <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                {t("actions")}
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {cashTable.map((data) => (
                              <tr key={data.id}>
                                {console.log(data, "inside table it self")}
                                <td className="border border-gray-300 text-center">
                                  {editingIdCashId === data.id ? (
                                    <input
                                      type="text"
                                      value={data.cashAmount}
                                      onChange={(e) =>
                                        handleFieldChangeCashTable(
                                          data.id,
                                          "cashAmount",
                                          e.target.value
                                        )
                                      }
                                      className="p-1 w-full"
                                    />
                                  ) : (
                                    <span>{data.cashAmount}</span>
                                  )}
                                </td>
                                <td className="border border-gray-300 ">
                                  <div className="flex flex-row justify-center items-center gap-2 ">
                                    <img
                                      src={pencil}
                                      alt="Edit"
                                      className="cursor-pointer w-4 h-auto"
                                      onClick={() =>
                                        handleEditToggleCashTable(data.id)
                                      }
                                    />
                                    <img
                                      src={trash}
                                      alt="Remove"
                                      className="cursor-pointer ml-2 w-4 h-auto"
                                      onClick={() =>
                                        handleRemoveCashTable(data.id)
                                      }
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {CreditCardTable.length > 0 &&
                    selectedPaymentMethod === "CreditCard" && (
                      <>
                        <div className="overflow-x-auto rounded-md border border-gray-300 mb-5 mt-10">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-blue-100">
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("creditCardType")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("creditCardNumber")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("expirationDate")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("amount")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("cardHolderName")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("voucherNo.")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("actions")}
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {CreditCardTable.map((data, index) => (
                                <tr key={data.id}>
                                  {console.log(data, "hhhhhhhh")}
                                  <td className="border border-gray-300 text-center py-2">
                                    {editingIdCreditCardId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.creditCardType}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            data.id,
                                            "creditCardType",
                                            e.target.value
                                          )
                                        }
                                        className="p-1  w-full"
                                      />
                                    ) : (
                                      data.creditCardType
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCreditCardId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.creditCardNumber}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            data.id,
                                            "creditCardNumber",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full"
                                      />
                                    ) : (
                                      data.creditCardNumber
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCreditCardId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.expirationDate}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            data.id,
                                            "expirationDate",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full"
                                      />
                                    ) : (
                                      data.expirationDate
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCreditCardId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.amount}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            data.id,
                                            "amount",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full"
                                      />
                                    ) : (
                                      data.amount
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCreditCardId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.cardHolderName}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            data.id,
                                            "cardHolderName",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full"
                                      />
                                    ) : (
                                      data.cardHolderName
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCreditCardId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.voucherNo}
                                        onChange={(e) =>
                                          handleFieldChange(
                                            data.id,
                                            "voucherNo",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full"
                                      />
                                    ) : (
                                      data.voucherNo
                                    )}
                                  </td>
                                  <td className="border border-gray-300 ">
                                    <div className="flex flex-row justify-center items-center gap-2 ">
                                      <img
                                        src={pencil}
                                        alt="Edit"
                                        className="cursor-pointer w-4 h-auto"
                                        onClick={() =>
                                          handleEditToggle(data.id)
                                        }
                                      />
                                      <img
                                        src={trash}
                                        alt="Remove"
                                        className="cursor-pointer ml-2 w-4 h-auto"
                                        onClick={() =>
                                          handleRemoveCreditCard(data.id)
                                        }
                                      />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                  {checkTable.length > 0 &&
                    selectedPaymentMethod === "Check" && (
                      <>
                        <div className="overflow-x-auto rounded-md border border-gray-300 mb-10 mt-10">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-blue-100">
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("DueDate")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("bank")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("amount")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("payeeName")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("checkNumber")}
                                </th>
                                <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                  {t("actions")}
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {checkTable.map((data, index) => (
                                <tr key={data.id}>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCheckId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.dueDate}
                                        onChange={(e) =>
                                          handleFieldChangeCheckTable(
                                            data.id,
                                            "dueDate",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full"
                                      />
                                    ) : (
                                      data.dueDate
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCheckId === data.id ? (
                                      <select
                                        value={data.bank}
                                        onChange={(e) =>
                                          handleFieldChangeCheckTable(
                                            data.id,
                                            "bankCode",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full bg-white border rounded-md"
                                      >
                                        <option value="">
                                          {t("Select a bank")}
                                        </option>
                                        {banks.map((bank) => (
                                          <option
                                            key={bank.bankCode}
                                            value={bank.bankCode}
                                          >
                                            {bank.bankName}
                                          </option>
                                        ))}
                                      </select>
                                    ) : (
                                      banks.find(
                                        (bank) => bank.bankCode === data.bank
                                      )?.bankName || "Unknown Bank"
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCheckId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.amountcheck}
                                        onChange={(e) =>
                                          handleFieldChangeCheckTable(
                                            data.id,
                                            "amountcheck",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full"
                                      />
                                    ) : (
                                      data.amountcheck
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center">
                                    {editingIdCheckId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.payeeName}
                                        onChange={(e) =>
                                          handleFieldChangeCheckTable(
                                            data.id,
                                            "payeeName",
                                            e.target.value
                                          )
                                        }
                                        className="p-1 w-full"
                                      />
                                    ) : (
                                      data.payeeName
                                    )}
                                  </td>
                                  <td className="border border-gray-300 text-center py-2">
                                    {editingIdCheckId === data.id ? (
                                      <input
                                        type="text"
                                        value={data.checkNumber}
                                        onChange={(e) =>
                                          handleFieldChangeCheckTable(
                                            data.id,
                                            "checkNumber",
                                            e.target.value
                                          )
                                        }
                                        className="p-1  w-full"
                                      />
                                    ) : (
                                      data.checkNumber
                                    )}
                                  </td>

                                  <td className="border border-gray-300 ">
                                    <div className="flex flex-row justify-center items-center gap-2 ">
                                      <img
                                        src={pencil}
                                        alt="Edit"
                                        className="cursor-pointer w-4 h-auto"
                                        onClick={() =>
                                          handleEditToggleCheckTable(data.id)
                                        }
                                      />
                                      <img
                                        src={trash}
                                        alt="Remove"
                                        className="cursor-pointer ml-2 w-4 h-auto"
                                        onClick={() =>
                                          handleRemoveCheckTable(data.id)
                                        }
                                      />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}

                  <div className="mb-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {t("totalPaidAmount")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("totalPaidAmount")}
                      value={totalPaidAmount}
                      className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
             bg-gray-100 text-gray-500 cursor-not-allowed"
                      readOnly
                      disabled
                    />
                  </div>
                  <h1 className="text-lg mb-4 mt-10">{t("notes")}</h1>
                  <textarea
                    className="w-full p-4 h-52 text-gray-700 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("Enter your notes here")}
                  ></textarea>

                  <div className="flex justify-end mt-36 mb-8 gap-3">
                    <button
                      type="button"
                      style={{ backgroundColor: "#489AB9" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handleBackToOptionsFrompayments}
                    >
                      {t("back")}
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                      onClick={handlePay} // Change from showModal to handlePay
                    >
                      {t("Pay")}
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
                            <img
                              src={checkmark}
                              alt="Back"
                              className="h-auto w-12 "
                            />
                          </div>
                          <h3 className="text-sm md:text-lg leading-6 font-medium text-gray-900 mt-4 md:mt-8">
                            {t("paymentSuccessful")}
                          </h3>
                          {/* Button to close the modal */}
                          <div className="mt-6 md:mt-14">
                            <button
                              type="button"
                              className="inline-flex justify-center w-28 md:w-40 rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none "
                              onClick={() => {
                                hideModal();
                              }}
                            >
                              {t("close")}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          )}
          <Footer />
        </div>
        {isLoading && <Loader />}
      </div>
    </ConfigProvider>
  );
};

export default Collections;
