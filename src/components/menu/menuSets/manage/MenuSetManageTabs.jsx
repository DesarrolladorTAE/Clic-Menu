import { Box, Stack, Tab, Tabs, Typography } from "@mui/material";

function StepLabel({ number, label }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box sx={{
        width: 27,
        height: 27,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        bgcolor: "action.hover",
        color: "text.secondary",
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
        fontSize: { xs: 14, sm: 16 },
        fontWeight: 800,
        color: "inherit",
        whiteSpace: "nowrap",
      }}>
        {label}
      </Typography>
    </Stack>
  );
}

export default function MenuSetManageTabs({ value = "general", onChange }) {
  const handleChange = (_, nextValue) => {
    if (typeof onChange === "function") {
      onChange(nextValue);
    }
  };

  const tabSx = {
    minHeight: 60,
    minWidth: "max-content",
    px: { xs: 1.5, sm: 2 },
    py: 1,
    fontWeight: 800,
    textTransform: "none",
    color: "text.secondary",
    borderRadius: 1,
    transition: "background-color 0.18s ease, color 0.18s ease",
    "&.Mui-selected": {
      color: "primary.main",
      bgcolor: "action.hover",
    },
    "&:hover": {
      bgcolor: "action.hover",
    },
    "&.Mui-focusVisible": {
      bgcolor: "action.selected",
    },
  };

  return (
    <Box sx={{
      width: "100%",
      minWidth: 0,
      borderBottom: "1px solid",
      borderColor: "divider",
    }}>
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        textColor="inherit"
        aria-label="Secciones de administración del conjunto"
        slotProps={{
          indicator: {
            sx: {
              height: 3,
              borderRadius: 1,
              bgcolor: "primary.main",
            },
          },
        }}
        sx={{
          minHeight: 60,
          "& .MuiTabs-flexContainer": {
            gap: { xs: 0.5, sm: 1 },
          },
          "& .MuiTabs-scrollButtons": {
            width: 34,
            height: 34,
            minWidth: 34,
            mx: 0.5,
            alignSelf: "center",
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "#fff",
            flexShrink: 0,
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&.Mui-disabled": {
              opacity: 0.3,
            },
          },
          "& .MuiTabs-scrollButtons svg": {
            color: "#fff",
            fontSize: 23,
          },
        }}
      >
        <Tab
          value="general"
          label={<StepLabel number={1} label="General" />}
          disableRipple
          sx={tabSx}
        />

        <Tab
          value="stages"
          label={<StepLabel number={2} label="Etapas" />}
          disableRipple
          sx={tabSx}
        />

        <Tab
          value="capacities"
          label={<StepLabel number={3} label="Capacidades" />}
          disableRipple
          sx={tabSx}
        />

        <Tab
          value="activation"
          label={<StepLabel number={4} label="Activación" />}
          disableRipple
          sx={tabSx}
        />

        <Tab
          value="availability"
          label="Disponibilidad"
          disableRipple
          sx={{
            ...tabSx,
            fontSize: { xs: 14, sm: 16 },
          }}
        />
      </Tabs>
    </Box>
  );
}