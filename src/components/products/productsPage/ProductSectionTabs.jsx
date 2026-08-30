import { Box, Tab, Tabs, Typography } from "@mui/material";

const TERRACOTTA = "#B85C38";

export default function ProductSectionTabs({
  sections = [],
  value = "",
  onChange,
}) {
  const handleChange = (_, newValue) => {
    onChange?.(newValue);
  };

  if (!sections.length) {
    return (
      <Box
        sx={{
          minHeight: 54,
          display: "flex",
          alignItems: "center",
          px: 0.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
          No hay secciones disponibles.
        </Typography>
      </Box>
    );
  }

  const tabSx = {
    minHeight: 54,
    px: { xs: 2, sm: 2.5 },
    py: 1,
    fontSize: { xs: 15, sm: 16 },
    fontWeight: 800,
    textTransform: "none",
    color: "text.secondary",
    transition: "color 0.18s ease, background-color 0.18s ease, transform 0.12s ease",
    "&.Mui-selected": {
      color: TERRACOTTA,
      bgcolor: "transparent",
    },
    "&:hover": {
      color: TERRACOTTA,
      bgcolor: "rgba(184, 92, 56, 0.05)",
    },
    "&:active": {
      bgcolor: "rgba(184, 92, 56, 0.09)",
      transform: "scale(0.98)",
    },
    "&.Mui-focusVisible": {
      bgcolor: "rgba(184, 92, 56, 0.07)",
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
        value={value || false}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="inherit"
        slotProps={{
          indicator: {
            sx: {
              height: 4,
              borderRadius: "999px 999px 0 0",
              backgroundColor: TERRACOTTA,
            },
          },
        }}
        sx={{
          minHeight: 54,
          "& .MuiTabs-flexContainer": {
            gap: { xs: 0.5, sm: 1.5 },
          },
          "& .MuiTabs-scrollButtons": {
            color: "text.secondary",
          },
        }}
      >
        {sections.map((section) => (
          <Tab
            key={section.id}
            value={String(section.id)}
            label={section.name}
            disableRipple
            sx={tabSx}
          />
        ))}
      </Tabs>
    </Box>
  );
}