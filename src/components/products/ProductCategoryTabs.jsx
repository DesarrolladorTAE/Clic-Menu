import { Box, Tab, Tabs, Typography } from "@mui/material";

export default function ProductCategoryTabs({
  categories = [],
  value = "",
  onChange,
}) {
  const handleChange = (_, newValue) => {
    onChange?.(newValue);
  };

  if (!categories.length) {
    return (
      <Box
        sx={{
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          px: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          No hay categorías disponibles.
        </Typography>
      </Box>
    );
  }

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
        {categories.map((c) => (
          <Tab
            key={c.id}
            value={String(c.id)}
            label={c.name}
            disableRipple
            sx={tabSx}
          />
        ))}
      </Tabs>
    </Box>
  );
}