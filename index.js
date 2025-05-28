import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { AppProvider } from "./Context/NewCustomerContext";
import { CollectionProvider } from "./Context/CollectionProvider";
import { CustomerOptionsProvider } from "./Context/CustomerOptionsContext";
import { CustomerInfoProvider } from "./Context/CustomerInfoContext";
import { AdminNewCustomerProvider } from "./Context/AdminNewCustomerContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CustomerOptionsProvider>
      <AppProvider>
        <CollectionProvider>
          <CustomerInfoProvider>
            <AdminNewCustomerProvider>
              <App />
            </AdminNewCustomerProvider>
          </CustomerInfoProvider>
        </CollectionProvider>
      </AppProvider>
    </CustomerOptionsProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
