import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../Images/Background_Login.jpg"; // Ensure this path is correct
import i18n from "../Language/i18n";
import { changeLanguage } from "../Language/languageUtils";
import { useCookies } from "react-cookie";
import { Bounce, toast } from "react-toastify";
import { Loader } from "../Component/Loader";
import { useAppContext } from "../Context/NewCustomerContext";
import { useAdminNewCustomerContext } from "../Context/AdminNewCustomerContext";
import api from "./api"
const backendUrl = process.env.REACT_APP_BACKEND_URL;

const LoginPage = () => {
  const [cookies, setCookie] = useCookies(["token"]);
  const { setNewCustomerNum, setUpdateCustomerNum } = useAppContext();

  const { setCustomerData, setCustomerDataModifications } =
    useAdminNewCustomerContext(); // this CustomerData named as "customerDataAdmin" in local storge

  const [currentLang, setCurrentLang] = useState(
    i18n.language === "ar" ? "عربي" : "English"
  );
  const [isLoading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("isAuthenticated");
    if (token) {
      navigateBasedOnUsername();
    } else {
      // Populate username and password if "Remember me" was checked
      const rememberedUsername = localStorage.getItem("rememberedUsername");
      const rememberedPassword = localStorage.getItem("rememberedPassword");
      if (rememberedUsername) setUsername(rememberedUsername);
      if (rememberedPassword) setPassword(rememberedPassword);
    }
  }, [navigate]);

  const navigateBasedOnUsername = () => {
    const userRole = localStorage.getItem("userRole");

    if (userRole === "admin") {
      navigate("/admin-home");
    } else {
      navigate("/home");
    }
  };


  const fetchCompanies = async () => {
    const url = `api/GetCompanies`;

    console.log("Fetching companies for username:", username);
    console.log("Request URL:", url);
    try {
      setLoading(true);
      const response = await api.get(url, {
        headers: {
          "Content-Type": "application/json",
          userCode: username, // Add the userCode to the headers
        },
      });
      console.log("Companies response:", response.data);
      if (response.data.status === "Success") {
        toast.success(`Company Found`, {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        setCompanies(response.data.results);
      } else {
        console.log(response, "get companies error");
        
      }
    } catch (error) {
      toast.error("Failed to fetch companies", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      console.error("Fetch companies error:", error);
      // alert('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCompany) {
      toast.error("Please select a company", {
        position: "bottom-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    const url = `api/GetToken`;

    try {
  setLoading(true);
  const response = await api.get(url, {
    headers: {
      "Content-Type": "application/json",
      dbName: selectedCompany,
      username: username,
      password: password,
    },
  });

  const tokenData = response.data;
  console.log(tokenData, "Token Data log in");

  if (tokenData.status === "Success") {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userRole", tokenData.isAdmin === "Y" ? "admin" : "user");

    // Save username and password if "Remember me" is checked
    if (rememberMe) {
      localStorage.setItem("rememberedUsername", username);
      localStorage.setItem("rememberedPassword", password);
    } else {
      localStorage.removeItem("rememberedUsername");
      localStorage.removeItem("rememberedPassword");
    }

    const userRole = tokenData.isAdmin === "Y" ? "admin" : "user";
    const homeRoute = userRole === "admin" ? "/admin-home" : "/home";

    const cookieValue = JSON.stringify({
      token: tokenData.token,
      selectedCompany: selectedCompany,
      username: tokenData.username,
      branchId: tokenData.userBranch,
      userCode: tokenData.userCode,
    });

    let oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    // Await saving the cookie before proceeding
   setCookie("token", cookieValue, { path: "/", expires: oneWeekFromNow });

    // After the token is saved, only then proceed with the API requests
    if (homeRoute === "/admin-home") {
      const dbName = selectedCompany;
      const token = JSON.parse(cookieValue).token;
      const userCode = tokenData.userCode;

      // Fetch pending customers
      const fetchPendingCustomers = async () => {
        const url = `api/GetPendingCustomers`;
        try {
          setLoading(true);
          const response = await api.get(url, {
            headers: {
              "Content-Type": "application/json",
              dbName: dbName,
              token: token,
              userCode: userCode,
              type: "A",
            },
          });

          const results = response?.data.results;
          const countPStatus = results.reduce((count, item) => {
            return item.status === "P" ? count + 1 : count;
          }, 0);

          setNewCustomerNum(countPStatus);
          setCustomerData(results);
        } catch (error) {
          console.error("Fetch customers error:", error);
          toast.error(` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`);
        } finally {
          setLoading(false);
        }
      };

      await fetchPendingCustomers();

      // Fetch pending customer updates
      const fetchPendingCustomersUpdate = async () => {
        const url = `api/GetPendingCustomers`;
        try {
          setLoading(true);
          const response = await api.get(url, {
            headers: {
              "Content-Type": "application/json",
              dbName: dbName,
              token: token,
              userCode: userCode,
              type: "U",
            },
          });

          const results = response?.data.results;
          const countPStatus = results.reduce((count, item) => {
            return item.status === "P" ? count + 1 : count;
          }, 0);

          setUpdateCustomerNum(countPStatus);
          setCustomerDataModifications(results);
        } catch (error) {
          toast.error(` Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`);
          console.error("Fetch Update customers error:", error);
        } finally {
          setLoading(false);
        }
      };

      await fetchPendingCustomersUpdate();
    }

    navigate(homeRoute);
  }
}  catch (error) {
      toast.error(
        `Login Status:${error?.response?.data?.status} Code:${error?.response?.data?.statusCode} Message: ${error?.response?.data?.errorMessage}`,
        {
          position: "bottom-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        }
      );
      console.error("Login error:", error);
      setErrorMessage(i18n.t("Login failed! Check user name and password."));
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  // Function to toggle the language
  const toggleLanguage = () => {
    const newLang = currentLang === "عربي" ? "en" : "ar";
    setCurrentLang(newLang === "ar" ? "عربي" : "English");
    changeLanguage(newLang);
  };

  const buttonText = i18n.language === "ar" ? "English" : "عربي";
  // Text content based on the selected language
  const content = {
    login: currentLang === "عربي" ? "تسجيل الدخول" : "Log in",
    welcomeBack: currentLang === "عربي" ? "!مرحبا بعودتك" : "Welcome Back!",
    userNamePlaceholder: currentLang === "عربي" ? "اسم المستخدم" : "User Name",
    passwordPlaceholder: currentLang === "عربي" ? "كلمة السر" : "Password",
    rememberMe: currentLang === "عربي" ? "تذكرني" : "Remember me",
    forgotPassword:
      currentLang === "عربي" ? "هل نسيت كلمة السر؟" : "Forgot your password?",
    loginButton: currentLang === "عربي" ? "دخول" : "Log in",
  };

  return (
    <div
      className={`flex h-screen bg-white ${
        currentLang === "عربي" ? "flex-row-reverse" : ""
      }`}
    >
      <div
        className={`absolute ${
          currentLang === "عربي" ? "left-0" : "right-0"
        } top-0 p-4`}
      >
        <button
          onClick={toggleLanguage}
          className="text-md px-8 py-1 bg-white font-bold shadow-md rounded-full focus:outline-none"
        >
          {buttonText}
        </button>
      </div>
      <div className="hidden md:block w-1/2 h-screen">
        <img
          className="object-cover w-full h-full"
          src={backgroundImage}
          alt="Background"
        />
      </div>

      <div
        className={`w-full flex flex-col justify-center items-center p-4 ${
          currentLang === "عربي" ? "md:items-end" : "md:items-start"
        } xl:items-center md:p-8 xl:p-22 h-screen `}
      >
        <div className="max-w-lg xl:max-w-xl w-full space-y-8">
          <div
            className={`w-full  ${
              currentLang === "عربي" ? "text-right" : "text-left"
            }`}
          >
            <h2 className="text-3xl font-extrabold text-gray-900">
              {content.login}
            </h2>
            <p className="mt-2 text-gray-600">{content.welcomeBack}</p>
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-10 xl:space-y-12"
            action="#"
            method="POST"
          >
            <input
              type="text"
              name="username"
              id="username"
              autoComplete="username"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 xl:py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm xl:text-lg"
              placeholder={content.userNamePlaceholder}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={fetchCompanies} // Fetch companies when the user finishes entering the username
              dir={currentLang === "" ? "rtl" : "ltr"}
            />
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 xl:py-4 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm xl:text-lg"
              placeholder={content.passwordPlaceholder}
              onChange={(e) => setPassword(e.target.value)}
              dir={currentLang === "عربي" ? "rtl" : "ltr"}
            />
            {errorMessage && (
              <div className="mt-4 text-red-600 text-center">
                {errorMessage}
              </div>
            )}
            <div
              className={`flex items-center ${
                currentLang === "عربي" ? "justify-between" : "justify-between"
              }`}
            >
              {currentLang === "عربي" && (
                // "Forgot your password?" link for Arabic
                <div className="text-sm xl:text-lg">
                  {/* <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    {content.forgotPassword}
                  </a> */}
                </div>
              )}

              {currentLang !== "عربي" && (
                // "Forgot your password?" link for English
                <div className="text-sm xl:text-lg">
                  {/* <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    {content.forgotPassword}
                  </a> */}
                </div>
              )}
            </div>

            {/* Company Dropdown */}
            <div className="flex flex-col w-full">
              <label
                htmlFor="company"
                className={`block text-lg xl:text-lg mb-5 font-medium text-gray-700 ${
                  currentLang === "عربي" ? "text-right" : "text-left"
                }`}
              >
                {currentLang === "عربي" ? ":الشركة" : "Company:"}
              </label>
              <select
                name="company"
                id="company"
                autoComplete="company-name"
                required
                className="mt-1 mb-1 block w-full pl-3 pr-3 py-4 xl:py-4 border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                dir={currentLang === "عربي" ? "rtl" : "ltr"}
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="" disabled>
                  {currentLang === "عربي" ? "اختر الشركة" : "Select Company"}
                </option>
                {companies.map((company) => (
                  <option
                    key={company.databaseName}
                    value={company.databaseName}
                  >
                    {company.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 xl:py-4 px-4 border border-transparent text-sm xl:text-lg font-medium rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                style={{ backgroundColor: "#272C6F" }}
              >
                {content.loginButton}
              </button>
            </div>
          </form>
        </div>
      </div>
      {isLoading && <Loader />}
    </div>
  );
};

export default LoginPage;
