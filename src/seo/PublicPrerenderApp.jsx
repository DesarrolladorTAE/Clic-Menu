// src/seo/PublicPrerenderApp.jsx
// Utilizado por prerender-public.mjs y main.jsx.
// Renderiza HomePage real y dirige las demás rutas a la aplicación habitual.

import React, { useEffect, useRef } from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, MemoryRouter, useLocation } from "react-router-dom";

import theme from "../theme/theme";
import HomePage from "../pages/landing/home/HomePage.jsx";

// Controla la navegación al salir de la portada prerenderizada.
// Las demás rutas serán atendidas por App.jsx desde main.jsx.
function PublicHomeNavigation() {
  const location = useLocation();
  const leavingRef = useRef(false);

  useEffect(() => {
    if (location.pathname === "/" || leavingRef.current) {
      return;
    }

    leavingRef.current = true;

    const destination = `${location.pathname}${location.search}${location.hash}`;
    window.location.replace(destination);
  }, [location.pathname, location.search, location.hash]);

  return <HomePage skipSeo />;
}

// Comparte el mismo contenido para el prerenderizado y la hidratación.
// Mantiene Material UI, Emotion, React Router y Helmet.
export default function PublicPrerenderApp({
  server = false,
  emotionCache,
  helmetContext,
}) {
  const Router = server ? MemoryRouter : BrowserRouter;
  const routerProps = server ? { initialEntries: ["/"] } : {};

  if (!emotionCache) {
    throw new Error("Falta la configuración de estilos de la portada.");
  }

  return (
    <CacheProvider value={emotionCache}>
      <React.StrictMode>
        <HelmetProvider context={helmetContext}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router {...routerProps}>
              <PublicHomeNavigation />
            </Router>
          </ThemeProvider>
        </HelmetProvider>
      </React.StrictMode>
    </CacheProvider>
  );
}