import { Box, Tab, Tabs } from "@mui/material";

export default function WhasapoConnectionTabs({
  tab,
  onChange,
  whatsappQrDisabled = false,
}) {
  const handleChange = (_, newValue) => {
    onChange(newValue);
  };

  const tabSx = {
    minHeight: 56,
    px: { xs: 2, sm: 2.5 },
    py: 1,
    fontSize: { xs: 14, sm: 16 },
    fontWeight: 800,
    textTransform: "none",
    color: "text.secondary",
    transition:
      "background-color 0.18s ease, color 0.18s ease, transform 0.12s ease",
    "&.Mui-selected": {
      color: "primary.main",
      bgcolor: "transparent",
    },
    "&:hover": {
      bgcolor: "action.hover",
    },
    "&:active": {
      bgcolor: "action.selected",
      transform: "scale(0.98)",
    },
    "&.Mui-focusVisible": {
      bgcolor: "action.hover",
    },
    "&.Mui-disabled": {
      opacity: 0.5,
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
        value={tab}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="inherit"
        slotProps={{
          indicator: {
            sx: {
              height: 3,
              backgroundColor: "primary.main",
            },
          },
        }}
        sx={{
          minHeight: 56,
          "& .MuiTabs-flexContainer": {
            gap: { xs: 0.5, sm: 1.5 },
          },
          "& .MuiTabs-scrollButtons": {
            color: "text.secondary",
          },
        }}
      >
        <Tab
          value="whasapo"
          label="Whasapo"
          disableRipple
          sx={tabSx}
        />

        <Tab
          value="whatsapp-qr"
          label="WhatsApp QR"
          disableRipple
          disabled={whatsappQrDisabled}
          sx={tabSx}
        />
      </Tabs>
    </Box>
  );
}