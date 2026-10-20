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

const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

const prerenderedPage = rootElement.getAttribute("data-public-prerender");

const publicPageByPath = {
  "/": "home",
  "/contacto": "contact",
  "/planes": "plans",
  "/terminos-y-condiciones": "terms",
  "/blog": "blog",
};

const blogPostMatch = pathname.match(
  /^\/blog\/([a-z0-9][a-z0-9_-]*)$/i
);

let expectedPage =
  publicPageByPath[pathname] ?? null;

let initialPost = null;

if (
  blogPostMatch &&
  prerenderedPage === "blog-post"
) {
  const postElement = document.getElementById(
    "clicmenu-initial-blog-post"
  );

  if (postElement) {
    try {
      const parsedPost = JSON.parse(
        postElement.textContent || "null"
      );

      if (
        parsedPost &&
        parsedPost.slug === blogPostMatch[1] &&
        parsedPost.__prerendered === true &&
        typeof parsedPost.content === "string"
      ) {
        initialPost = parsedPost;
        expectedPage = "blog-post";
      }
    } catch (error) {
      console.error(
        "No se pudieron recuperar los datos del artículo.",
        error
      );
    }
  }
}

let initialBlogData = null;

if (pathname === "/blog" && prerenderedPage === "blog") {
  const blogElement = document.getElementById("clicmenu-initial-blog");

  if (blogElement) {
    try {
      const parsedData = JSON.parse(blogElement.textContent || "null");

      if (
        parsedData &&
        parsedData.blog &&
        typeof parsedData.blog === "object" &&
        Array.isArray(parsedData.posts)
      ) {
        initialBlogData = parsedData;
      }
    } catch (error) {
      console.error("No se pudieron recuperar los datos del blog.", error);
    }
  }
}

const shouldHydrate =
  expectedPage !== null &&
  prerenderedPage === expectedPage &&
  (expectedPage !== "blog-post" || initialPost !== null) &&
  (expectedPage !== "blog" || initialBlogData !== null);

if (shouldHydrate) {
  const emotionCache = createCache({ key: "css" });

  ReactDOM.hydrateRoot(
    rootElement,
    <PublicPrerenderApp
      page={expectedPage}
      emotionCache={emotionCache}
      postSlug={blogPostMatch?.[1] ?? null}
      initialPost={initialPost}
      initialBlog={initialBlogData?.blog ?? null}
      initialPosts={initialBlogData?.posts ?? null}
      initialMeta={initialBlogData?.meta ?? null}
    />,
    {
      onRecoverableError(error) {
        console.error(
          `Error de hidratación en la página ${expectedPage}:`,
          error
        );
      },
    }
  );
} else {
  ReactDOM.createRoot(rootElement).render(<Application />);
}