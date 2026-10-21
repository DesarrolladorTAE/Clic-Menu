// src/seo/PublicPrerenderApp.jsx
// Renderiza e hidrata las páginas públicas prerenderizadas.
// Las demás rutas continúan utilizando la aplicación habitual.

import React, { useEffect, useRef } from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { HelmetProvider } from "react-helmet-async";
import {
  BrowserRouter,
  MemoryRouter,
  useLocation,
} from "react-router-dom";

import theme from "../theme/theme";

import HomePage from "../pages/landing/home/HomePage.jsx";
import LandingContactPage from "../pages/landing/contact/LandingContactPage.jsx";
import LandingPlansPage from "../pages/landing/plans/LandingPlansPage.jsx";
import LandingTermsPage from "../pages/landing/terms/LandingTermsPage.jsx";
import BlogPostDetailPage from "../pages/landing/blog/BlogPostDetailPage.jsx";
import BlogPostsPage from "../pages/landing/blog/BlogPostsPage.jsx";

import MenuQrCanvaPage from "../pages/landing/resources/MenuQrCanvaPage.jsx";
import ComoElegirMenuQrPage from "../pages/landing/resources/ComoElegirMenuQrPage.jsx";

const PUBLIC_PAGES = {
  home: "/",
  contact: "/contacto",
  plans: "/planes",
  terms: "/terminos-y-condiciones",
  blog: "/blog",
  "resource-canva": "/recursos/menu-qr-con-canva",
  "resource-choose-menu-qr": "/recursos/como-elegir-menu-qr",
};

function normalizePathname(pathname) {
  return pathname.replace(/\/+$/, "") || "/";
}

// Controla la navegación desde una página prerenderizada.
// Cuando el usuario abandona su ruta, se carga el documento
// correspondiente mediante una navegación normal del navegador.
function PublicPageNavigation({
  page,
  postSlug = null,
  initialPost = null,
  initialBlog = null,
  initialPosts = null,
  initialMeta = null,
}) {
  const location = useLocation();
  const leavingRef = useRef(false);

  useEffect(() => {
    const currentPath = normalizePathname(
      location.pathname
    );

    const expectedPath =
      page === "blog-post"
        ? `/blog/${postSlug}`
        : PUBLIC_PAGES[page];


    if (
      currentPath === expectedPath ||
      leavingRef.current
    ) {
      return;
    }

    leavingRef.current = true;

    const destination =
      `${location.pathname}${location.search}${location.hash}`;

    window.location.replace(destination);
  }, [
    page,
    postSlug,
    location.pathname,
    location.search,
    location.hash,
  ]);

  if (page === "contact") {
    return <LandingContactPage skipSeo />;
  }

  if (page === "plans") {
    return <LandingPlansPage skipSeo />;
  }

  if (page === "terms") {
    return <LandingTermsPage skipSeo />;
  }

  if (page === "resource-canva") {
    return <MenuQrCanvaPage skipSeo />;
  }

  if (page === "resource-choose-menu-qr") {
    return <ComoElegirMenuQrPage skipSeo />;
  }

  if (page === "blog") {
    return (
      <BlogPostsPage
        skipSeo
        initialBlog={initialBlog}
        initialPosts={initialPosts}
        initialMeta={initialMeta}
      />
    );
  }

  if (page === "blog-post") {
    return (
      <BlogPostDetailPage
        skipSeo
        initialPost={initialPost}
        postSlugOverride={postSlug}
      />
    );
  }

  return <HomePage skipSeo />;
}

// Comparte el mismo árbol React entre servidor y navegador.
// Esto permite hidratar el HTML sin reconstruir la interfaz.
export default function PublicPrerenderApp({
  page = "home",
  server = false,
  emotionCache,
  helmetContext,
  postSlug = null,
  initialPost = null,
  initialBlog = null,
  initialPosts = null,
  initialMeta = null,
}) {
  if (
    page !== "blog-post" &&
    !Object.prototype.hasOwnProperty.call(PUBLIC_PAGES, page)
  ) {
    throw new Error("Página pública no reconocida.");
  }

  if (page === "blog-post") {
    if (
      !postSlug ||
      !initialPost ||
      initialPost.slug !== postSlug
    ) {
      throw new Error("Faltan los datos iniciales del artículo.");
    }
  }

  if (page === "blog") {
    if (!initialBlog || !Array.isArray(initialPosts)) {
      throw new Error("Faltan los datos iniciales del blog.");
    }
  }

  if (!emotionCache) {
    throw new Error(
      "Falta la configuración de estilos de la página pública."
    );
  }

  const Router = server ? MemoryRouter : BrowserRouter;

  const initialPath =
    page === "blog-post"
      ? `/blog/${postSlug}`
      : PUBLIC_PAGES[page];

  const routerProps = server
    ? { initialEntries: [initialPath] }
    : {};

  return (
    <CacheProvider value={emotionCache}>
      <React.StrictMode>
        <HelmetProvider context={helmetContext}>
          <ThemeProvider theme={theme}>
            <CssBaseline />

            <Router {...routerProps}>
              <PublicPageNavigation
                page={page}
                postSlug={postSlug}
                initialPost={initialPost}
                initialBlog={initialBlog}
                initialPosts={initialPosts}
                initialMeta={initialMeta}
              />
            </Router>
          </ThemeProvider>
        </HelmetProvider>
      </React.StrictMode>
    </CacheProvider>
  );
}