// src/components/seo/SEO.jsx
import React from "react";
import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "Clic Menu | Sistema para restaurantes con menú QR y punto de venta",
  description = "Digitaliza tu restaurante con Clic Menu. Menú digital QR, punto de venta, control de pedidos, caja, inventario y herramientas para mejorar tu operación.",
  keywords = "clic menu, menú digital, menú QR, punto de venta restaurante, software restaurante, sistema restaurante, POS restaurante",
  image = "https://clicmenu.com.mx/images/seo/clic-menu-preview.png",
  url = "https://clicmenu.com.mx",
  robots = "index, follow",

  /*
   * Propiedades opcionales para publicaciones del blog.
   * Las páginas existentes conservan el comportamiento actual.
   */
  ogType = "website",
  structuredData = null,
  publishedTime = null,
  modifiedTime = null,
  section = null,
  tags = [],
}) {
  const fullTitle = title.includes("Clic Menu")
    ? title
    : `${title} | Clic Menu`;

  return (
    <Helmet>
      {/* SEO principal */}
      <title>{fullTitle}</title>

      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />

      {/* Canonical */}
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook / WhatsApp) */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Clic Menu" />

      {/* Metadatos exclusivos para publicaciones del blog */}
      {ogType === "article" && publishedTime && (
        <meta
          property="article:published_time"
          content={publishedTime}
        />
      )}

      {ogType === "article" && modifiedTime && (
        <meta
          property="article:modified_time"
          content={modifiedTime}
        />
      )}

      {ogType === "article" && section && (
        <meta
          property="article:section"
          content={section}
        />
      )}

      {ogType === "article" &&
        Array.isArray(tags) &&
        tags.map((tag, index) => (
          <meta
            key={`${tag}-${index}`}
            property="article:tag"
            content={tag}
          />
        ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Extras */}
      <meta name="theme-color" content="#C95A3B" />
      <meta name="author" content="Clic Menu" />

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
