import { Box, Tab, Tabs } from "@mui/material";

export default function FloorZoneTabs({
  zones = [],
  value = "all",
  onChange,
  loading = false,
}) {
  const handleChange = (_, newValue) => {
    onChange(newValue);
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
    transition:
      "background-color 0.18s ease, color 0.18s ease, transform 0.12s ease",
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
          "& .MuiTabs-flexContainer": {
            gap: { xs: 1, sm: 2 },
          },
          "& .MuiTabs-scrollButtons": {
            color: "text.secondary",
          },
        }}
      >
        <Tab
          value="all"
          label={loading ? "Cargando zonas…" : "Todas las zonas"}
          disableRipple
          sx={tabSx}
        />

        {zones.map((zone) => (
          <Tab
            key={zone.id}
            value={String(zone.id)}
            label={zone.name}
            disableRipple
            sx={tabSx}
          />
        ))}
      </Tabs>
    </Box>
  );
}
