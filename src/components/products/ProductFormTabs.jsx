import { Box, Tab, Tabs } from "@mui/material";

export default function ProductFormTabs({
  value = "product",
  onChange,
}) {
  const handleChange = (_, newValue) => {
    onChange?.(newValue);
  };

  const tabSx = {
    minHeight: 52,
    px: { xs: 2, sm: 2.5 },
    py: 1,
    fontSize: { xs: 14, sm: 16 },
    fontWeight: 800,
    textTransform: "none",
    color: "text.secondary",
    transition: "background-color 0.18s ease, color 0.18s ease, transform 0.12s ease",
    "&.Mui-selected": {
      color: "primary.main",
      bgcolor: "rgba(255, 152, 0, 0.05)",
    },
    "&:hover": {
      bgcolor: "rgba(255, 152, 0, 0.05)",
    },
    "&:active": {
      bgcolor: "rgba(255, 152, 0, 0.10)",
      transform: "scale(0.98)",
    },
    "&.Mui-focusVisible": {
      bgcolor: "rgba(255, 152, 0, 0.08)",
    },
  };

  return (
    <Box
      sx={{
        width: "100%",
        overflowX: "auto",
        bgcolor: "background.paper",
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
          minHeight: 52,
          "& .MuiTabs-flexContainer": {
            gap: { xs: 0.5, sm: 1 },
          },
          "& .MuiTabs-scrollButtons": {
            color: "text.secondary",
          },
        }}
      >
        <Tab value="product" label="Datos del producto" disableRipple sx={tabSx} />
        <Tab value="tax" label="Claves fiscales" disableRipple sx={tabSx} />
      </Tabs>
    </Box>
  );
}