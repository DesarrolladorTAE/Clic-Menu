
// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import createCache from "@emotion/cache";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import App from "./App.jsx";
import PublicPrerenderApp from "./seo/PublicPrerenderApp.jsx";
import theme from "./theme/theme";
import { AuthProvider } from "./context/AuthContext.jsx";
import { StaffAuthProvider } from "./context/StaffAuthContext.jsx";
import { SystemAdminAuthProvider } from "./context/SystemAdminAuthContext.jsx";
import "./index.css";

// Inicialización habitual para rutas no prerenderizadas.
// Conserva los proveedores originales de Clic Menu.
function Application() {
  return (
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
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el contenedor principal de Clic Menu.");
}

const isPrerenderedHome =
  window.location.pathname === "/" &&
  rootElement.getAttribute("data-public-prerender") === "home";

if (isPrerenderedHome) {
  const emotionCache = createCache({ key: "css" });

  ReactDOM.hydrateRoot(
    rootElement,
    <PublicPrerenderApp emotionCache={emotionCache} />,
    {
      onRecoverableError(error) {
        console.error("Error de hidratación en la portada:", error);
      },
    }
  );
} else {
  ReactDOM.createRoot(rootElement).render(<Application />);
}