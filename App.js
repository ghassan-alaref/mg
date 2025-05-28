import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import LoginPage from "./UserPages/LoginPage";
import HomePage from "./UserPages/HomePage";
import AdminHomePage from "./AdminPages/HomePage";
import Collections from "./UserPages/Collections";
import ModificationsRequests from "./AdminPages/ModificationsRequests";
import NewCustomers from "./UserPages/NewCustomers";
import AdminNewCustomers from "./AdminPages/Admin-NewCustomers";
import CustomerInfo from "./UserPages/CustomerInfo";
import AdminCustomerInfo from "./AdminPages/AdminCustomerInfo";
import CustomerOptions from "./UserPages/CustomerOptions";
import AdminCustomerOptions from "./AdminPages/AdminCustomerOptions";
import ProtectedRoute from "./ProtectedRoute";
import UnauthorizedPage from "./Component/UnauthorizedPage";
import List from "./UserPages/List";
import "./Language/i18n";
import AdminCustomerInformation from "./AdminPages/AdminCustomerInformation";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ModificationsInfo from "./AdminPages/ModificationsInfo";
import { PendingCustomers } from "./UserPages/PendingCustomers";
import { useEffect } from "react";
import { useCookies } from "react-cookie";
function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminHomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-info"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <CustomerInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-customer-info"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCustomerInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-customer-infomation"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCustomerInformation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modifications-info"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ModificationsInfo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/new-customers"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <NewCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <List />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pendingCustomers"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <PendingCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-new-customers"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminNewCustomers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Collections />
            </ProtectedRoute>
          }
        />
        <Route
          path="/modificationsrequests"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ModificationsRequests />
            </ProtectedRoute>
          }
        />
        {/*        <Route path="/modificationsrequestsInfo" element={<ProtectedRoute allowedRoles={['admin']}><ModificationsRequestsInfo /></ProtectedRoute>} />

        */}
        <Route
          path="/customeroptions"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <CustomerOptions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-customer-options"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminCustomerOptions />
            </ProtectedRoute>
          }
        />
        <Route path="/notfound" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/notfound" replace />} />{" "}
        {/* Fallback route */}
      </Routes>
    </Router>
  );
}

export default App;
