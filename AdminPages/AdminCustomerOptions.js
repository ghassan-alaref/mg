import React, { useState, useEffect } from "react";
import { DatePicker, ConfigProvider } from "antd";
import enUS from "antd/lib/locale/en_US";
import arEG from "antd/lib/locale/ar_EG";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Component/AdminSidebar";
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
import { useCookies } from "react-cookie";
import axios from "axios";
import api from "../UserPages/api"
import { toast } from "react-toastify";
import { Loader } from "../Component/Loader";
import { useCustomerOptions } from "../Context/CustomerOptionsContext";
import dayjs from "dayjs";
import { formatNumber } from "../UserPages/CustomerOptions";
const backendUrl = process.env.REACT_APP_BACKEND_URL;
const attachmentUrl = process.env.REACT_APP_ATTACHMENTS_URL;

const Collections = () => {
  const [cookies] = useCookies(["token"]);

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
  } = useCustomerOptions();

  const token = cookies.token?.token;
  const dbName = cookies.token?.selectedCompany;
  const userCode = cookies.token?.userCode;
  const [isLoading, setLoading] = useState(false);

  const adminCustomerInfoHome = JSON.parse(
    localStorage.getItem("adminCustomerInfoHome")
  );

  console.log(adminCustomerInfoHome, "check has fater and parent code");

  const { hasFather, parentCustomer } = adminCustomerInfoHome;

  console.log(hasFather, parentCustomer, "from location state Adminnn");

  console.log(adminCustomerInfoHome, "card code ");

  const { t, i18n } = useTranslation();
  const locale = i18n.language === "ar" ? arEG : enUS;
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const [customerName, setCustomerName] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [billingNo, setBillingNo] = useState("");
  const [balance, setBalance] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [totalPaidAmount, setTotalPaidAmount] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cash");
  const [cashAmount, setCashAmount] = useState("");
  const [branch, setBranch] = useState("");
  const [creditCardType, setCreditCardType] = useState("");
  const [creditCardNumber, setCreditCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [amount, setAmount] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [bank, setBank] = useState("");
  const [amountcheck, setAmountcheck] = useState("");
  const [payeeName, setPayeeName] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [CreditCardTable, setCreditCardTable] = useState([]);
  const [editingIdCreditCardId, seteditingIdCreditCardId] = useState(null);
  const [checkTable, setCheckTable] = useState([]);
  const [editingIdCheckId, seteditingIdCheckId] = useState(null);
  const [cashTable, setCashTable] = useState([]);
  const [editingIdCashId, seteditingIdCashId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [returnedChecksAPI, setReturnedChecksAPI] = useState([]);
  const [customerShipTosAPI, setCustomerShipTosAPI] = useState([]);
  const [openInvoicesAPI, setOpenInvoicesAPI] = useState([]);
  const [branches, setBranches] = useState([]);
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [notes, setNotes] = useState("");
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

        console.log("DB-name Admin", dbName);
        console.log("token Admin", token);
        console.log("customerCode Admin", cardCode);

        const url = `${backendUrl}api/GetAccountStatement`;
        const headers = {
          "Content-Type": "application/json",
          dbName: dbName,
          token: token,
          customerCode: adminCustomerInfoHome.cardCode,
          dateFrom: formattedStartDate,
          dateTo: formattedEndDate,
        };

        try {
          setLoading(true);

          const response = await fetch(url, { headers });
          const data = await response.json();
          if (data.status === "Success") {
            console.log(data.results, "Account Statment Get API");
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

    if (showReturnedChecks) {
      const getReturnedChecks = async () => {
        const url = `${backendUrl}api/GetReturnedChecks`;
        const headers = {
          "Content-Type": "application/json",
          dbName: dbName,
          token: token,
          customerCode: adminCustomerInfoHome?.cardCode,
          branchId: cookies.token?.branchId,
        };

        try {
          const response = await fetch(url, { headers });
          const data = await response.json();
          if (data) {
            setReturnedChecksAPI(data.results);
          } else {
            console.error("Failed to fetch Returned Checks:", data.status);
          }
        } catch (error) {
          console.error("Error fetching Returned Checks:", error);
        }
      };

      getReturnedChecks();
    }

    const getCustomerShipTos = async () => {
      const url = `${backendUrl}api/GetShipTos`;
      const headers = {
        "Content-Type": "application/json",
        dbName: dbName,
        token: token,
       // customerCode: adminCustomerInfoHome?.cardCode,
      };

      try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        if (data) {
          setCustomerShipTosAPI(data.results);
        } else {
          console.error("Failed to fetch CustomerShipTos:", data.status);
        }
      } catch (error) {
        console.error("Error fetching CustomerShipTos:", error);
      }
    };

    getCustomerShipTos();

    const getOpenInvoices = async () => {
      const url = `${backendUrl}api/GetOpenInvoices`;
      const headers = {
        "Content-Type": "application/json",
        dbName: dbName,
        token: token,
        customerCode: adminCustomerInfoHome?.cardCode,
      };

      try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        if (data) {
          setOpenInvoicesAPI(data.results);
        } else {
          console.error("Failed to fetch Open Invoices:", data.status);
        }
      } catch (error) {
        console.error("Error fetching Open Invoices:", error);
      }
    };

    getOpenInvoices();
  }, [
    dbName,
    token,
    cardCode,
    dates.startDate,
    dates.endDate,
    cookies.token?.branchId,
    showReturnedChecks,
  ]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        const response = await api.get(`api/GetBranches`, {
          headers: {
            "Content-Type": "application/json",
            dbName: dbName,
            token: token,
          },
        });

        if (response.data.status === "Success") {
          setBranches(response.data.results);
        } else {
          console.error("Failed to fetch branches");
        }
      } catch (error) {
        toast.error(
     `Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`
        );

        console.error("Error fetching branches:", error);
        console.error("Response data:", error?.response?.data);
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
        console.error("Error fetching banks:", error);
      }
    };

    fetchBanks();
  }, [dbName, token, selectedBankCode]);

  //const shiptoNames = customerShipTosAPI.map((item) => item.shiptoName);

  const handleChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const addCashTable = () => {
    const selectedBranchName =
      branches.find((branch) => branch.branchCode === selectedBranch)
        ?.branchName || "";

    const addCashData = {
      id: cashTable.length + 1,
      branch: selectedBranchName,
      cashAmount: cashAmount,
    };

    setCashTable([...cashTable, addCashData]);
    setCashAmount("");
    setSelectedBranch(selectedBranch); // Ensure selectedBranch is set correctly
  };

  const handlePay = async () => {
    const payload = {
      docDate: docDate(),
      customerCode: cardCode,
      branchId: selectedBranch,
      notes: notes,
      paymentLine: [
        {
          paymentMethod: selectedPaymentMethod,
          amount: totalPaidAmount,
          // creditCardType: creditCardType,
          // creditCardNumber: creditCardNumber,
          // expirationDate: expirationDate,
          // cardHolderName: cardHolderName,
          // voucherNo: voucherNo,
          // dueDate: dates,
          // bankCode: selectedBankCode,
          // payeeName: payeeName,
          // checkNumber: checkNumber,
        },
      ],
    };
    console.log("Payload:", payload);

    const headers = {
      "Content-Type": "application/json",
      dbName: dbName,
      token: token,
    };

    try {
      const response = await fetch(`${backendUrl}api/AddIncomingPayment`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("notes:", notes);
      console.log("cardCode:", cardCode);
      console.log("selectedBranch:", selectedBranch);
      console.log("totalPaidAmount:", totalPaidAmount);
      console.log("selectedPaymentMethod:", selectedPaymentMethod);

      if (data.status === "Success") {
        alert("The Incoming Payment Has Been Added Successfully");
        // Optionally reset the form
        // resetForm();
        // Optionally redirect the user
        // navigate('/success-page');
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
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
  };

  const handleNextToAccountStatement = () => {
    setShowOptions(false);
    setShowAccountStatement(true);
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
  }) => (
    <div className="flex flex-col space-y-1 mt-5">
      <label className="text-sm mb-2">{label}</label>
      <select
        className="p-2 w-3/4 xl:w-1/2 border rounded-xl"
        onChange={onChange}
        value={value}
      >
        <option value="" disabled hidden>
          {" "}
          {"Select an option"}
        </option>
        {label === t("project") && <option value="All">All</option>}
        {options.map((option, index) => (
          <option key={index} value={option[valueKey]}>
            {option[labelKey]}
          </option>
        ))}
      </select>
    </div>
  );

  /*
   const DropdownField = ({ label, value, onChange, options }) => (
    <div className="flex flex-col space-y-1  mt-5">
      <label className="text-sm mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="p-2 w-1/2 xl:w-1/3 border rounded-xl"
      >
        <option value="" disabled hidden>
          {"Select an option"}
        </option>
        {label === t("project") && <option value="All">All</option>}
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
  */

  const handleCardHolderNameChange = (event) => {
    setCardHolderName(event.target.value);
  };

  const handleVoucherNoChange = (event) => {
    setVoucherNo(event.target.value);
  };

  const handleCreditCardTypeChange = (event) => {
    setCreditCardType(event.target.value);
  };

  const handleCreditCardNumberChange = (event) => {
    setCreditCardNumber(event.target.value);
  };

  const addCreditCardTable = () => {
    const newEntry = {
      id: CreditCardTable.length + 1,
      creditCardType: creditCardType,
      creditCardNumber: creditCardNumber,
      expirationDate: expirationDate,
      amount: amount,
      cardHolderName: cardHolderName,
      voucherNo: voucherNo,
    };
    setCreditCardTable([...CreditCardTable, newEntry]);
    updateTotalPaidAmount();
    // Clear form fields
    setCreditCardType("");
    setCreditCardNumber("");
    setExpirationDate("");
    setAmount("");
    setCardHolderName("");
    setVoucherNo("");
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
  };

  const handleEditToggle = (id) => {
    seteditingIdCreditCardId(editingIdCreditCardId === id ? null : id);
  };

  const handleRemoveCreditCard = (id) => {
    const filteredData = CreditCardTable.filter((item) => item.id !== id);
    setCreditCardTable(filteredData);
    if (editingIdCreditCardId === id) {
      seteditingIdCreditCardId(null);
      updateTotalPaidAmount();
    }
  };
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

    const headers = {
      "Content-Type": "application/json",
      dbname: cookies.token?.selectedCompany,
    };

    console.log(
      adminCustomerInfoHome?.cardCode,
      formattedDataAccountStatment,
      "uuuuuuuuuuu"
    );

    let body = {
      customerCode: adminCustomerInfoHome?.cardCode,
      dateFrom: formattedDataAccountStatment.dateFrom,
      dateTo: formattedDataAccountStatment.dateTo,
    };

    console.log(body, "Account statment body");
    console.log(headers, "Account statment headers");

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

      console.log("Response on print Account Statment API:", response);

      if (response.status === 200 && response.data != "") {
        toast.success("Account statement has been successfully generated!");

        const contentType = response.headers["content-type"];
        if (contentType !== "application/pdf") {
          throw new Error("Invalid response type, expected PDF");
        }
        // Create a Blob from the response data
        const file = new Blob([response.data], { type: contentType });

        // Generate a URL for the Blob
        const fileURL = URL.createObjectURL(file);
        console.log(file, "Blob file");
        console.log(fileURL, "Generated file URL");

        // Open the generated PDF in a new tab
        window.open(fileURL, "_blank");

        // Optionally, trigger a download if you want to save the file directly
        const link = document.createElement("a");
        link.href = fileURL;
        link.download = "AccountStatement.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
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

    console.log(body, "Account statment body");
    console.log(headers, "Account statment headers");

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

      console.log("Response on print Account Statment API:", response);

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
        console.log(file, "Blob file");
        console.log(fileURL, "Generated file URL");

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
      customerCode: adminCustomerInfoHome?.cardCode,
      project: selectedOption === "All" ? "" : selectedOption,
      dateFrom: formattedStartDate,
      dateTo: formattedEndDate,
    };
    console.log(body, "body for Q-report");
    try {
      setLoading(true);

      let response = await axios.post(
        `${attachmentUrl}/CustomerQty/Pdf`,
        body,
        {
          headers,
          responseType: "blob",
        }
      );
      toast.success("Quantities Report has been successfully generated!");

      const contentType = response.headers["content-type"];
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
      link.download = "QuantitiesReport.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Response on print Quantities Report API:", response.data);
    } catch (error) {
      toast.error("Failed to print Quntitites report API");
    } finally {
      setLoading(false);
    }
  }

  const addCheckTable = () => {
    const addCheckData = {
      id: checkTable.length + 1,
      checkNumber: checkNumber,
      bank: bank,
      dueDate: dates.startDate ? dates.startDate.format("YYYY-MM-DD") : null,
      amountcheck: amountcheck,
      payeeName: payeeName,
    };
    setCheckTable([...checkTable, addCheckData]);
    updateTotalPaidAmount();
    setCheckNumber("");
    setBank("");
    setDates({ startDate: null, endDate: null });
    setAmountcheck("");
    setPayeeName("");
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
  };

  const handleEditToggleCheckTable = (id) => {
    seteditingIdCheckId(editingIdCheckId === id ? null : id);
  };

  const handleRemoveCheckTable = (id) => {
    const filteredData = checkTable.filter((item) => item.id !== id);
    setCheckTable(filteredData);
    if (editingIdCheckId === id) {
      seteditingIdCheckId(null);
      updateTotalPaidAmount();
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
  };

  const handleEditToggleCashTable = (id) => {
    seteditingIdCashId(editingIdCashId === id ? null : id);
  };

  const handleRemoveCashTable = (id) => {
    const filteredData = cashTable.filter((item) => item.id !== id);
    setCashTable(filteredData);
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
    setTotalPaidAmount(total.toFixed(2));
    console.log("Updated Total:", total);
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

  return (
    <ConfigProvider locale={locale}>
      <div
        className={`bg-[#FAFAFF]  min-h-screen flex ${
          i18n.dir() === "rtl" ? "flex-row-reverse" : ""
        }`}
      >
        {isLoading && <Loader />}
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
                    <div className="border-b-2 border-gray-200 mt-2"></div>
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
                      accountStatmentAPI[0]?.prevBalance
                        ? formatNumber(accountStatmentAPI[0].prevBalance)
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
                      onClick={printAccountStatment}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
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
                    <div className="border-b-2 border-gray-200 mt-2"></div>
                  </div>

                  <div className="Returned-Checks-container ">
                    <div className="overflow-x-auto rounded-md border border-gray-300 mb-5">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-blue-100">
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("JEnumber")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("branch")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("JEdate")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("DueDate")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("CheckAmount")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("Paid")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("TheRemainingAmount")}
                            </th>
                            <th className="font-normal border border-gray-300 px-4 py-2 ">
                              {t("Check Number")}
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {returnedChecksAPI.map((check, index) => (
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
                                  //value={check.branch}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={check.refDate.split(" ")[0]}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={check.dueDate.split(" ")[0]}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={
                                    check.total ? formatNumber(check.total) : ""
                                  }
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
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
                                  readOnly
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
                    <div className="border-b-2 border-gray-200 mt-2"></div>
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
                  <DropdownField
                    label={t("project")}
                    labelKey="shiptoName"
                    valueKey="shiptoCode"
                    value={selectedOption}
                    onChange={handleChange}
                    options={customerShipTosAPI}
                  />

                  {/*
 <DropdownField
                    label={t("project")}
                    value={selectedOption}
                    onChange={handleChange}
                    options={shiptoNames}
                  />
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
                      onClick={printQuantitiesReportFunction}
                      style={{ backgroundColor: "#272C6F" }}
                      className="px-4 md:px-16 py-1 pb-2 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
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
                    <div className="border-b-2 border-gray-200 mt-2"></div>
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
                                  value={invoice.documentDate.split(" ")[0]}
                                  readOnly
                                />
                              </td>
                              <td className="border border-gray-300">
                                <input
                                  type="text"
                                  className="p-4 w-full"
                                  value={invoice.documentDueDate.split(" ")[0]}
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

              {showPayments && (
                <>
                  <div className="ml-5 mr-5 mb-12 ">
                    <h1 className="text-2xl mb-4">{t("Payment")}</h1>
                    <div className="border-b-2 border-gray-200 mt-2"></div>
                  </div>
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
                        onClick={() => setSelectedPaymentMethod("creditCard")}
                        className={`px-4 py-2 text-xs md:text-sm w-1/3 md:w-1/6 border border-gray-300  ${
                          selectedPaymentMethod === "creditCard"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-600"
                        } focus:outline-none`}
                      >
                        {t("creditCard")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPaymentMethod("check")}
                        className={`px-4 py-2 text-xs md:text-sm w-1/3 md:w-1/6 border border-gray-300  ${
                          selectedPaymentMethod === "check"
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
                          onChange={(e) => setCashAmount(e.target.value)}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
             focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                          onClick={addCashTable}
                        >
                          {t("add")}
                        </button>
                      </div>
                    </>
                  )}

                  {selectedPaymentMethod === "creditCard" && (
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
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                            className="mt-2 py-1 px-3 block w-1/2 md:w-full border border-gray-300 rounded-md shadow-sm 
      focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                            onChange={(e) => setAmount(e.target.value)}
                            className="mt-2 py-1 px-3 block w-1/2 md:w-full border border-gray-300 rounded-md shadow-sm 
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
                          {t("voucherNo")}
                        </label>
                        <input
                          type="text"
                          placeholder={t("voucherNo")}
                          value={voucherNo}
                          onChange={handleVoucherNoChange}
                          className="mt-2 py-1 px-3 block w-1/2 md:w-1/3 border border-gray-300 rounded-md shadow-sm 
             focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                        />
                      </div>

                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
                          onClick={addCreditCardTable}
                        >
                          {t("add")}
                        </button>
                      </div>
                    </>
                  )}

                  {selectedPaymentMethod === "check" && (
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
                          value={
                            dates.startDate ? dayjs(dates.startDate) : null
                          }
                          onChange={(date) =>
                            setDates({ ...dates, startDate: date })
                          }
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
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
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
                          onChange={(e) => setAmountcheck(e.target.value)}
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
                          onChange={(e) => setCheckNumber(e.target.value)}
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

                  {cashTable.length > 0 && (
                    <>
                      <div className="overflow-x-auto rounded-md border border-gray-300 mb-5 mt-10">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-blue-100">
                              <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                {t("Branch")}
                              </th>
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
                                <td className="border border-gray-300 text-center py-2">
                                  {editingIdCashId === data.id ? (
                                    <input
                                      type="text"
                                      value={data.branch}
                                      onChange={(e) =>
                                        handleFieldChangeCashTable(
                                          data.id,
                                          "branch",
                                          e.target.value
                                        )
                                      }
                                      className="p-1 w-full"
                                    />
                                  ) : (
                                    <span>{data.branch}</span>
                                  )}
                                </td>
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

                  {CreditCardTable.length > 0 && (
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
                                {t("voucherNo")}
                              </th>
                              <th className="font-normal border border-gray-300 px-4 py-1 text-xs md:text-sm">
                                {t("actions")}
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {CreditCardTable.map((data, index) => (
                              <tr key={data.id}>
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
                                      onClick={() => handleEditToggle(data.id)}
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

                  {checkTable.length > 0 && (
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
                                    <input
                                      type="text"
                                      value={data.bank}
                                      onChange={(e) =>
                                        handleFieldChangeCheckTable(
                                          data.id,
                                          "bank",
                                          e.target.value
                                        )
                                      }
                                      className="p-1 w-full"
                                    />
                                  ) : (
                                    data.bank
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
             focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      readOnly
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
      </div>
    </ConfigProvider>
  );
};

export default Collections;
