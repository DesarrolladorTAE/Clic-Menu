//src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App.jsx";
import theme from "./theme/theme";
import { AuthProvider } from "./context/AuthContext.jsx";
import { StaffAuthProvider } from "./context/StaffAuthContext.jsx";
import { SystemAdminAuthProvider } from "./context/SystemAdminAuthContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <StaffAuthProvider>
              <SystemAdminAuthProvider>
                <App />
              </SystemAdminAuthProvider>
            </StaffAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);