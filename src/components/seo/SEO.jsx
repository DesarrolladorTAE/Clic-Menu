
// src/components/seo/SEO.jsx
import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

/*
 * Administrador compartido de los metadatos definidos
 * directamente en index.html.
 *
 * Se mantiene fuera del componente para soportar:
 * - React StrictMode en desarrollo.
 * - Montajes y desmontajes consecutivos.
 * - Más de un componente SEO activo.
 */
let defaultSeoSnapshot = [];
let defaultSeoConsumers = 0;
let defaultSeoRestoreTimer = null;

function captureAndRemoveDefaultSeo() {
  if (typeof document === "undefined") {
    return;
  }

  const currentElements = Array.from(
    document.head.querySelectorAll(
      '[data-default-seo="true"]'
    )
  );

  if (
    defaultSeoSnapshot.length === 0 &&
    currentElements.length > 0
  ) {
    defaultSeoSnapshot = currentElements.map(
      (element) => ({
        element,
        parent: element.parentNode,
      })
    );
  }

  currentElements.forEach((element) => {
    element.remove();
  });
}

function restoreDefaultSeo() {
  if (typeof document === "undefined") {
    return;
  }

  defaultSeoSnapshot.forEach(
    ({
      element,
      parent,
    }) => {
      if (
        !parent ||
        document.head.contains(element)
      ) {
        return;
      }

      parent.appendChild(element);
    }
  );
}

export default function SEO({
  title = "Clic Menu | Sistema para restaurantes con menú QR y punto de venta",
  description = "Digitaliza tu restaurante con Clic Menu. Menú digital QR, punto de venta, control de pedidos, caja, inventario y herramientas para mejorar tu operación.",
  keywords = "clic menu, menú digital, menú QR, punto de venta restaurante, software restaurante, sistema restaurante, POS restaurante",
  image = "https://clicmenu.com.mx/images/seo/clic-menu-preview.png",
  url = "https://clicmenu.com.mx",
  robots = "index, follow",

  /*
   * Propiedades opcionales para Open Graph.
   * Si no se envían, se conservan title y description.
   */
  ogType = "website",
  ogTitle = null,
  ogDescription = null,

  /*
   * Propiedades opcionales para publicaciones del blog.
   * Las páginas existentes conservan el comportamiento actual.
   */
  structuredData = null,
  publishedTime = null,
  modifiedTime = null,
  section = null,
  tags = [],

  /*
   * Cuando es true, retira temporalmente del <head>
   * los metadatos generales marcados en index.html con:
   *
   * data-default-seo="true"
   *
   * Solo debe activarse en las páginas del blog.
   */
  replaceDefaultSeo = false,
}) {
  const resolvedTitle =
    typeof title === "string" &&
    title.trim() !== ""
      ? title.trim()
      : "Clic Menu | Sistema para restaurantes con menú QR y punto de venta";

  const fullTitle =
    resolvedTitle.includes("Clic Menu")
      ? resolvedTitle
      : `${resolvedTitle} | Clic Menu`;

  const resolvedDescription =
    typeof description === "string" &&
    description.trim() !== ""
      ? description.trim()
      : "Digitaliza tu restaurante con Clic Menu. Menú digital QR, punto de venta, control de pedidos, caja, inventario y herramientas para mejorar tu operación.";

  const resolvedKeywords = Array.isArray(keywords)
    ? keywords
        .filter(
          (keyword) =>
            typeof keyword === "string" &&
            keyword.trim() !== ""
        )
        .map((keyword) => keyword.trim())
        .join(", ")
    : typeof keywords === "string"
      ? keywords.trim()
      : "";

  const resolvedOgTitle =
    typeof ogTitle === "string" &&
    ogTitle.trim() !== ""
      ? ogTitle.trim()
      : fullTitle;

  const resolvedOgDescription =
    typeof ogDescription === "string" &&
    ogDescription.trim() !== ""
      ? ogDescription.trim()
      : resolvedDescription;

  useEffect(() => {
    if (
      !replaceDefaultSeo ||
      typeof document === "undefined"
    ) {
      return undefined;
    }

    /*
     * Cancelar una restauración pendiente.
     * Esto evita que el ciclo adicional de StrictMode
     * vuelva a insertar los metadatos generales.
     */
    if (defaultSeoRestoreTimer !== null) {
      window.clearTimeout(
        defaultSeoRestoreTimer
      );

      defaultSeoRestoreTimer = null;
    }

    defaultSeoConsumers += 1;

    captureAndRemoveDefaultSeo();

    return () => {
      defaultSeoConsumers = Math.max(
        0,
        defaultSeoConsumers - 1
      );

      /*
       * La restauración se difiere un ciclo.
       * Si React vuelve a montar inmediatamente el SEO
       * del blog, el nuevo montaje cancela este timer.
       */
      defaultSeoRestoreTimer =
        window.setTimeout(() => {
          if (defaultSeoConsumers === 0) {
            restoreDefaultSeo();
          }

          defaultSeoRestoreTimer = null;
        }, 0);
    };
  }, [replaceDefaultSeo]);

  return (
    <Helmet>
      {/* SEO principal */}
      <title>{fullTitle}</title>

      <meta
        name="description"
        content={resolvedDescription}
      />

      <meta
        name="keywords"
        content={resolvedKeywords}
      />

      <meta
        name="robots"
        content={robots}
      />

      {/* Canonical */}
      <link
        rel="canonical"
        href={url}
      />

      {/* Open Graph (Facebook / WhatsApp) */}
      <meta
        property="og:type"
        content={ogType}
      />

      <meta
        property="og:title"
        content={resolvedOgTitle}
      />

      <meta
        property="og:description"
        content={resolvedOgDescription}
      />

      <meta
        property="og:image"
        content={image}
      />

      <meta
        property="og:url"
        content={url}
      />

      <meta
        property="og:site_name"
        content="Clic Menu"
      />

      {/* Metadatos exclusivos para publicaciones del blog */}
      {ogType === "article" &&
        publishedTime && (
          <meta
            property="article:published_time"
            content={publishedTime}
          />
        )}

      {ogType === "article" &&
        modifiedTime && (
          <meta
            property="article:modified_time"
            content={modifiedTime}
          />
        )}

      {ogType === "article" &&
        section && (
          <meta
            property="article:section"
            content={section}
          />
        )}

      {ogType === "article" &&
        Array.isArray(tags) &&
        tags
          .filter(
            (tag) =>
              typeof tag === "string" &&
              tag.trim() !== ""
          )
          .map((tag, index) => (
            <meta
              key={`${tag}-${index}`}
              property="article:tag"
              content={tag.trim()}
            />
          ))}

      {/* Twitter Card */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={resolvedOgTitle}
      />

      <meta
        name="twitter:description"
        content={resolvedOgDescription}
      />

      <meta
        name="twitter:image"
        content={image}
      />

      {/* Extras */}
      <meta
        name="theme-color"
        content="#C95A3B"
      />

      <meta
        name="author"
        content="Clic Menu"
      />

      {/* Idioma */}
      <html lang="es-MX" />

      {/* Datos estructurados enviados por la API del blog */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}