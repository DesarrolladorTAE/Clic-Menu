import { Box, Tab, Tabs } from "@mui/material";

export default function OnlineOrderTabs({ value = "general", onChange }) {
  const handleChange = (_, nextValue) => {
    if (typeof onChange === "function") onChange(nextValue);
  };

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
    "&.Mui-selected": {
      color: "primary.main",
      bgcolor: "transparent",
    },
    "&:hover": {
      bgcolor: "rgba(255, 152, 0, 0.06)",
    },
    "&:active": {
      bgcolor: "rgba(255, 152, 0, 0.14)",
      transform: "scale(0.98)",
    },
    "&.Mui-focusVisible": {
      bgcolor: "rgba(255, 152, 0, 0.10)",
    },
    "&.Mui-disabled": {
      color: "text.secondary",
      opacity: 0.52,
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Tabs
        value={value}
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
        <Tab value="general" label="General" disableRipple sx={tabSx} />
        <Tab value="delivery" label="Entrega" disableRipple sx={tabSx} />
        <Tab value="payments" label="Pagos" disableRipple sx={tabSx} />
        <Tab
          value="activation"
          label="Preparación para activar"
          disableRipple
          sx={tabSx}
        />
      </Tabs>
    </Box>
  );
}