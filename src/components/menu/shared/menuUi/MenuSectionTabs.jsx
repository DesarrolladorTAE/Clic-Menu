// src/components/menu/shared/menuUi/MenuSectionTabs.jsx

import React, { useMemo } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import {
  alpha,
  darken,
  getContrastRatio,
} from "@mui/material/styles";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

function hasValidSectionId(section) {
  return (
    section &&
    section.id !== null &&
    section.id !== undefined &&
    section.id !== ""
  );
}

/**
 * Conserva el orden enviado por el backend.
 * No crea secciones artificiales ni una opción "Todas".
 */
function normalizeSections(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  const normalized = [];
  const seenIds = new Set();

  for (const section of sections) {
    if (!hasValidSectionId(section)) {
      continue;
    }

    const sectionName = String(section?.name || "").trim();

    if (!sectionName) {
      continue;
    }

    const sectionKey = String(section.id);

    if (seenIds.has(sectionKey)) {
      continue;
    }

    seenIds.add(sectionKey);

    normalized.push({
      ...section,
      name: sectionName,
    });
  }

  return normalized;
}

export default function MenuSectionTabs({
  sections = [],
  selectedSectionId = null,
  onSectionChange,
  themeColor,
}) {
  const safeThemeColor = isValidColor(themeColor)
    ? themeColor
    : "#FF7A00";

  const safeSections = useMemo(
    () => normalizeSections(sections),
    [sections],
  );

  /**
   * Con una sola sección no se muestra el selector.
   */
  if (safeSections.length <= 1) {
    return null;
  }

  const requestedSectionId =
    selectedSectionId === null || selectedSectionId === undefined
      ? null
      : String(selectedSectionId);

  const selectedSectionExists = safeSections.some(
    (section) => String(section.id) === requestedSectionId,
  );

  /**
   * Evita advertencias de MUI cuando el payload cambia.
   */
  const safeSelectedValue = selectedSectionExists
    ? requestedSectionId
    : String(safeSections[0].id);

  const gradientEndColor = darken(safeThemeColor, 0.16);

  /**
   * Ajusta el color del texto activo según el contraste
   * del color configurado por el propietario.
   */
  const activeTextColor =
    Math.min(
      getContrastRatio(safeThemeColor, "#FFFFFF"),
      getContrastRatio(gradientEndColor, "#FFFFFF"),
    ) >= 4.5
      ? "#FFFFFF"
      : "#111827";

  const handleChange = (_, nextSectionId) => {
    onSectionChange?.(nextSectionId);
  };

  const sectionTabSx = {
    minWidth: "max-content",
    maxWidth: "none",
    minHeight: 46,

    px: {
      xs: 2.25,
      sm: 2.75,
    },

    py: 1,

    borderRadius: "12px",

    border: "1px solid",
    borderColor: alpha(safeThemeColor, 0.16),

    bgcolor: "#FFFFFF",
    color: "text.secondary",

    fontSize: {
      xs: 13.5,
      sm: 15,
    },

    fontWeight: 800,
    lineHeight: 1.2,
    textTransform: "none",
    whiteSpace: "nowrap",

    boxShadow: "0 2px 7px rgba(15, 23, 42, 0.05)",

    transition:
      "background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease",

    "&.Mui-selected": {
      color: activeTextColor,
      borderColor: safeThemeColor,

      backgroundImage: `linear-gradient(
        135deg,
        ${safeThemeColor} 0%,
        ${gradientEndColor} 100%
      )`,

      boxShadow: `0 6px 16px ${alpha(safeThemeColor, 0.24)}`,
    },

    "&.Mui-selected:hover": {
      color: activeTextColor,
      borderColor: safeThemeColor,

      backgroundImage: `linear-gradient(
        135deg,
        ${safeThemeColor} 0%,
        ${gradientEndColor} 100%
      )`,
    },

    "&:hover": {
      bgcolor: alpha(safeThemeColor, 0.065),
      borderColor: alpha(safeThemeColor, 0.38),
      color: safeThemeColor,
    },

    "&:active": {
      transform: "scale(0.98)",
    },

    "&:focus-visible": {
      outline: `3px solid ${alpha(safeThemeColor, 0.24)}`,
      outlineOffset: 2,
    },
  };

  return (
    <Box
      component="section"
      aria-labelledby="menu-sections-title"
      sx={{
        position: "relative",

        mt: 2.25,
        width: "100%",

        borderRadius: {
          xs: 1.75,
          sm: 2,
        },

        border: "1px solid",
        borderColor: alpha(safeThemeColor, 0.18),

        backgroundImage: `linear-gradient(
          180deg,
          ${alpha(safeThemeColor, 0.085)} 0%,
          #FFFFFF 64%
        )`,

        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)",

        overflow: "hidden",
      }}
    >
      {/* Franja superior con el color configurado */}
      <Box
        aria-hidden="true"
        sx={{
          height: 5,

          backgroundImage: `linear-gradient(
            90deg,
            ${safeThemeColor} 0%,
            ${gradientEndColor} 100%
          )`,
        }}
      />

      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,

          px: {
            xs: 1.5,
            sm: 2,
          },

          pt: {
            xs: 1.5,
            sm: 1.75,
          },

          pb: {
            xs: 1.25,
            sm: 1.5,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            minWidth: 0,
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              width: {
                xs: 38,
                sm: 42,
              },

              height: {
                xs: 38,
                sm: 42,
              },

              flexShrink: 0,

              display: "grid",
              placeItems: "center",

              borderRadius: "11px",

              color: safeThemeColor,
              bgcolor: alpha(safeThemeColor, 0.1),

              border: "1px solid",
              borderColor: alpha(safeThemeColor, 0.18),
            }}
          >
            <RestaurantMenuRoundedIcon
              sx={{
                fontSize: {
                  xs: 21,
                  sm: 23,
                },
              }}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              id="menu-sections-title"
              component="h2"
              sx={{
                color: "text.primary",

                fontSize: {
                  xs: 14.5,
                  sm: 16,
                },

                fontWeight: 900,
                lineHeight: 1.2,
                letterSpacing: "0.025em",
                textTransform: "uppercase",
              }}
            >
              Secciones del menú
            </Typography>

            <Typography
              sx={{
                mt: 0.35,

                color: "text.secondary",

                fontSize: {
                  xs: 12.5,
                  sm: 13.5,
                },

                fontWeight: 600,
                lineHeight: 1.35,
              }}
            >
              Selecciona una sección para consultar sus categorías.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: {
              xs: "none",
              sm: "inline-flex",
            },

            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,

            minHeight: 30,
            px: 1.25,

            borderRadius: "10px",

            bgcolor: "#FFFFFF",
            color: safeThemeColor,

            border: "1px solid",
            borderColor: alpha(safeThemeColor, 0.2),

            boxShadow: "0 2px 7px rgba(15, 23, 42, 0.04)",

            fontSize: 12,
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {safeSections.length} secciones
        </Box>
      </Box>

      {/* Opciones de sección */}
      <Box
        sx={{
          px: {
            xs: 1,
            sm: 1.5,
          },

          pb: {
            xs: 1.25,
            sm: 1.5,
          },
        }}
      >
        <Tabs
          value={safeSelectedValue}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          textColor="inherit"
          aria-label="Seleccionar una sección del menú"
          slotProps={{
            indicator: {
              sx: {
                display: "none",
              },
            },
          }}
          sx={{
            minHeight: 50,

            "& .MuiTabs-flexContainer": {
              gap: {
                xs: 1,
                sm: 1.25,
              },
            },

            "& .MuiTabs-scroller": {
              scrollbarWidth: "none",

              "&::-webkit-scrollbar": {
                display: "none",
              },
            },

            "& .MuiTabs-scrollButtons": {
              width: {
                xs: 30,
                sm: 36,
              },

              color: "text.secondary",
              borderRadius: "10px",

              "&:hover": {
                bgcolor: alpha(safeThemeColor, 0.08),
                color: safeThemeColor,
              },

              "&.Mui-disabled": {
                opacity: 0.2,
              },
            },
          }}
        >
          {safeSections.map((section) => (
            <Tab
              key={String(section.id)}
              value={String(section.id)}
              label={section.name}
              disableRipple
              sx={sectionTabSx}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}