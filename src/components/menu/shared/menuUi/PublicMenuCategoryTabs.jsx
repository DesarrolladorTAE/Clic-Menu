// src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx

import React from "react";
import { Box, Tab, Tabs } from "@mui/material";

function isValidColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(String(color || ""));
}

export default function PublicMenuCategoryTabs({
  categoryOptions = [],
  value = "all",
  onChange,
  themeColor,
}) {
  const safeOptions = Array.isArray(categoryOptions) ? categoryOptions : [];
  const safeThemeColor = isValidColor(themeColor) ? themeColor : "#FF7A00";

  const handleChange = (_, nextValue) => {
    onChange?.(nextValue);
  };

  const tabSx = {
    minHeight: 52,
    px: { xs: 2, sm: 2.5 },
    py: 1,
    fontSize: { xs: 14, sm: 16 },
    fontWeight: 800,
    textTransform: "none",
    color: "text.secondary",
    borderRadius: "12px 12px 0 0",
    transition:
      "background-color 0.18s ease, color 0.18s ease, transform 0.12s ease",
    "&.Mui-selected": {
      color: safeThemeColor,
      bgcolor: "transparent",
    },
    "&:hover": {
      bgcolor: `${safeThemeColor}10`,
    },
    "&:active": {
      bgcolor: `${safeThemeColor}22`,
      transform: "scale(0.98)",
    },
  };

  return (
    <Box
      sx={{
        mt: 2,
        width: "100%",
        overflowX: "auto",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Tabs
        value={value || "all"}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="inherit"
        slotProps={{
          indicator: {
            sx: {
              height: 3,
              borderRadius: "999px 999px 0 0",
              backgroundColor: safeThemeColor,
            },
          },
        }}
        sx={{
          minHeight: 52,
          "& .MuiTabs-flexContainer": {
            gap: { xs: 0.5, sm: 1.5 },
          },
          "& .MuiTabs-scrollButtons": {
            color: "text.secondary",
          },
        }}
      >
        {safeOptions.map((option) => (
          <Tab
            key={String(option.value)}
            value={String(option.value)}
            label={option.label}
            disableRipple
            sx={tabSx}
          />
        ))}
      </Tabs>
    </Box>
  );
}