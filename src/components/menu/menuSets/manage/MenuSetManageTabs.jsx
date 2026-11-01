//src/components/menu/menuSets/manage/MenuSetManageTabs.js
import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";

// Cambiar a true cuando se habilite nuevamente la administración masiva.
export const SHOW_MENU_SET_ADMINISTRATION = false;

function StepLabel({ number, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{
        width: 27, height: 27, borderRadius: "50%",
        display: "grid", placeItems: "center",
        bgcolor: "action.hover", color: "text.secondary",
        transition: "background-color 0.18s ease, color 0.18s ease",
        ".Mui-selected &": {
          bgcolor: "primary.main",
          color: "#fff",
        },
      }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "inherit" }}>
          {number}
        </Typography>
      </Box>

      <Typography sx={{
        fontSize: { xs: 14, sm: 16 }, fontWeight: 800,
        color: "inherit", whiteSpace: "nowrap",
      }}>
        {label}
      </Typography>
    </Stack>
  );
}

export default function MenuSetManageTabs({ value = "general", onChange }) {
  const normalizedValue = value === "capacities"
    ? "programming"
    : value === "administration" && !SHOW_MENU_SET_ADMINISTRATION
      ? "stages"
      : value;

  const handleChange = (_, nextValue) => {
    if (!SHOW_MENU_SET_ADMINISTRATION && nextValue === "administration")
    {
      return;
    }

    if (typeof onChange === "function")
    {
      onChange(nextValue);
    }
  };

  const tabSx = {
    minHeight: 60, minWidth: "max-content",
    px: { xs: 1.5, sm: 2 }, py: 1,
    fontWeight: 800, textTransform: "none",
    color: "text.secondary", borderRadius: 1,
    transition: "background-color 0.18s ease, color 0.18s ease",
    "&.Mui-selected": {
      color: "primary.main",
      bgcolor: "action.hover",
    },
    "&:hover": { bgcolor: "action.hover" },
    "&.Mui-focusVisible": { bgcolor: "action.selected" },
  };

  const administrationOffset = SHOW_MENU_SET_ADMINISTRATION ? 1 : 0;

  return (
    <Box sx={{
      width: "100%", minWidth: 0,
      borderBottom: "1px solid", borderColor: "divider",
    }}>
      <Tabs
        value={normalizedValue}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="inherit"
        aria-label="Secciones de administración del conjunto"
        slotProps={{
          indicator: {
            sx: { height: 3, borderRadius: 1, bgcolor: "primary.main" },
          },
        }}
        sx={{
          minHeight: 60,
          "& .MuiTabs-flexContainer": {
            gap: { xs: 0.5, sm: 1 },
          },
          "& .MuiTabs-scrollButtons": {
            width: 34, height: 34, minWidth: 34,
            mx: 0.5, alignSelf: "center", borderRadius: "50%",
            bgcolor: "primary.main", color: "#fff", flexShrink: 0,
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": { opacity: 0.3 },
          },
          "& .MuiTabs-scrollButtons svg": {
            color: "#fff", fontSize: 23,
          },
        }}
      >
        <Tab value="general" label={<StepLabel number={1} label="General" />} disableRipple sx={tabSx} />

        {SHOW_MENU_SET_ADMINISTRATION ? (
          <Tab value="administration" label={<StepLabel number={2} label="Administración" />} disableRipple sx={tabSx} />
        ) : null}

        <Tab value="stages" label={<StepLabel number={2 + administrationOffset} label="Etapas y productos" />} disableRipple sx={tabSx} />
        <Tab value="programming" label={<StepLabel number={3 + administrationOffset} label="Programación" />} disableRipple sx={tabSx} />
        <Tab value="activation" label={<StepLabel number={4 + administrationOffset} label="Activación" />} disableRipple sx={tabSx} />
        <Tab value="availability" label={<StepLabel number={5 + administrationOffset} label="Disponibilidad" />} disableRipple sx={tabSx} />
      </Tabs>
    </Box>
  );
}