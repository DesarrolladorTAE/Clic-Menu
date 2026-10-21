// src/pages/landing/resources/ResourceArticleLayout.jsx
import React from "react";
import { Box } from "@mui/material";

import LandingMenu from "../../../components/landing/menu/LandingMenu";
import LandingFooter from "../../../components/landing/footer/LandingFooter";

import "./ResourceArticle.css";

export default function ResourceArticleLayout({
  label = "Guía de Clic Menu",
  title,
  description,
  author = "Clic Menu",
  updated = "Octubre de 2026",
  readingTime = null,
  children,
}) {
  return (
    <Box className="cm-resource-page">
      <LandingMenu />

      <Box component="main" className="cm-resource-main">
        {/* Encabezado editorial */}
        <Box component="header" className="cm-resource-hero">
          <Box className="cm-resource-hero-inner">
            <Box component="nav" aria-label="Ruta de navegación" className="cm-resource-breadcrumb">
              <a href="/">Inicio</a>
              <span>/</span>
              <a href="/blog">Blog</a>
              <span>/</span>
              <span>Guías y recursos</span>
            </Box>

            <Box component="span" className="cm-resource-label">
              {label}
            </Box>

            <Box component="h1" className="cm-resource-title">
              {title}
            </Box>

            <Box component="p" className="cm-resource-lead">
              {description}
            </Box>

            <Box className="cm-resource-meta">
              <span>Por {author}</span>
              <span className="cm-resource-meta-separator">•</span>
              <span>Actualizado en {updated}</span>

              {readingTime && (
                <>
                  <span className="cm-resource-meta-separator">•</span>
                  <span>Lectura de {readingTime}</span>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Contenido principal */}
        <Box className="cm-resource-content">
          <Box component="article" className="cm-resource-article">
            <Box className="cm-resource-article-body">
              {children}
            </Box>

            {/* Regresar al blog */}
            <Box component="nav" aria-label="Navegación de recursos" className="cm-resource-back">
              <a href="/blog">← Volver al blog de Clic Menu</a>
              <a href="/planes">Conocer los planes →</a>
            </Box>
          </Box>
        </Box>
      </Box>

      <LandingFooter />
    </Box>
  );
}