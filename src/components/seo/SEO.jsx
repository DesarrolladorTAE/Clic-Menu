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
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Clic Menu" />

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
    </Helmet>
  );
}