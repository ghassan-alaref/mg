import { useEffect, useState } from "react";
import Footer from "../Component/Footer";
import Sidebar from "../Component/Sidebar";
import { useTranslation } from "react-i18next";
import { useCookies } from "react-cookie";
import Header from "../Component/Header";
import api from "./api"


export function PendingCustomers() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [cookies] = useCookies(["token"]);
  const [pendingreq, setPendingReq] = useState([]);

  useEffect(() => {
    const headers = {
      "Content-Type": "application/json",
      dbname: cookies.token?.selectedCompany,
      token: cookies.token?.token,
      userCode: cookies.token?.userCode,
    };

    const fetchOptions = async () => {
      try {
        const response = await api.get(
          `api/GetPendingCustomersByCreator`,
          { headers }
        );
        setPendingReq(response.data.results);
        console.log(response.data, "pendingcustomersApi");
      } catch (error) {
        console.error("Get pending customers error:", error);
      }
    };

    fetchOptions();
  }, []);

  return (
    <div
      className={`bg-[#FAFAFF]  min-h-screen flex ${
        i18n.dir() === "rtl" ? "flex-row-reverse" : ""
      }`}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main
          className={`md:bg-white p-4 md:p-12 m-0  md:m-10 xl:m-12  rounded-xl w-[23rem] h-screen  md:w-5/6 xl:w-11/12 ${
            isArabic ? "ml-0 md:ml-10" : ""
          }`}
          style={{ height: "100%" }}
        >
          <>
            <div
              dir={i18n.language === "ar" ? "rtl" : "ltr"}
              className="  items-center"
            >
              <h1
                className={`text-md md:text-xl  xl:text-2xl font-bold text-black  ${
                  isArabic ? "ml-2 md:ml-0" : ""
                }`}
              >
                {t("PendingCustomers")}
              </h1>
            </div>
          </>

          <div className="flex flex-col justify-center items-center w-full">
            <>
              <div className="container  " dir={isArabic ? "rtl" : "ltr"}>
                <div className="py-4  overflow-x-auto">
                  <table className="min-w-full leading-normal ">
                    <thead>
                      <tr>
                        <th
                          className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                            isArabic ? "text-right" : "text-left"
                          }`}
                        >
                          {t("cardCode")}
                        </th>
                        <th
                          className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                            isArabic ? "text-right" : "text-left"
                          }`}
                        >
                          {t("customerName")}
                        </th>

                        <th
                          className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                            isArabic ? "text-right" : "text-left"
                          }`}
                        >
                          {t("group")}
                        </th>
                        <th
                          className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                            isArabic ? "text-right" : "text-left"
                          }`}
                        >
                          {t("authoriser")}{" "}
                        </th>
                        <th
                          className={`px-3 py-3 border-b-2 border-gray-200 text-sm font-semibold text-gray-600 uppercase tracking-wider sm:px-5 ${
                            isArabic ? "text-right" : "text-left"
                          }`}
                        >
                          {t("status")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingreq.map(
                        ({
                          customerCode,
                          customerName,
                          customerGroup,
                          approver,
                        }) => (
                          <tr key={customerCode}>
                            {[
                              customerCode,
                              customerName,
                              customerGroup,
                              approver,
                            ].map((value, index) => (
                              <td
                                key={index}
                                className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5"
                              >
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {value}
                                </p>
                              </td>
                            ))}{" "}
                            <td className="px-3 py-5 border-b border-gray-200 bg-white text-sm sm:px-5">
                              <span
                                style={{ width: "120px" }}
                                className="px-4 py-1 inline-flex border-gray-200 items-center justify-center text-xs leading-5 font-semibold rounded-md bg-blue-500 text-white"
                              >
                                {t("pending")}
                              </span>
                            </td>
                            <td className="px-1 py-5 border-b border-gray-200 bg-white text-sm"></td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
