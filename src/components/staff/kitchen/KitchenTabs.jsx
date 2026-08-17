import React from "react";
import { Box, Tab, Tabs } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export default function KitchenTabs({
  tab,
  onChange,
  preparingCount = 0,
  readyCount = 0,
}) {
  const theme = useTheme();

  const tabSx = {
    minHeight: 56,
    px: { xs: 2, sm: 2.5 },
    py: 1,
    fontSize: { xs: 15, sm: 17 },
    fontWeight: 800,
    textTransform: "none",
    color: "text.secondary",
    borderRadius: "12px 12px 0 0",
    transition: "background-color 0.18s ease, color 0.18s ease, transform 0.12s ease",
    "&.Mui-selected": { color: "primary.main", bgcolor: "transparent" },
    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
    "&:active": { bgcolor: alpha(theme.palette.primary.main, 0.12), transform: "scale(0.98)" },
    "&.Mui-focusVisible": { bgcolor: alpha(theme.palette.primary.main, 0.1) },
  };

  return (
    <Box
      sx={{
        width: "100%",
        mb: 2,
        overflowX: "auto",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, value) => onChange?.(value)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="inherit"
        slotProps={{
          indicator: {
            sx: {
              height: 3,
              borderRadius: "999px 999px 0 0",
              backgroundColor: "primary.main",
            },
          },
        }}
        sx={{
          minHeight: 56,
          "& .MuiTabs-flexContainer": { gap: { xs: 1, sm: 2 } },
          "& .MuiTabs-scrollButtons": { color: "text.secondary" },
        }}
      >
        <Tab
          value="preparing"
          label={`En preparación (${preparingCount})`}
          disableRipple
          sx={tabSx}
        />

        <Tab
          value="ready"
          label={`Listos para avisar (${readyCount})`}
          disableRipple
          sx={tabSx}
        />
      </Tabs>
    </Box>
  );
}
