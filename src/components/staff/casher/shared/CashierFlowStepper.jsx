// src/components/staff/casher/shared/CashierFlowStepper.jsx
import React from "react";
import { Box, Paper, Step, StepLabel, Stepper, useMediaQuery } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export default function CashierFlowStepper({ steps = [], activeStep = 0 }) {
  const theme = useTheme();
  const vertical = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Paper
      sx={{
        p: { xs: 1.25, sm: 1.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        boxShadow: "none",
        backgroundColor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Stepper
          activeStep={activeStep}
          orientation={vertical ? "vertical" : "horizontal"}
          alternativeLabel={!vertical}
          sx={{
            width: "100%",
            minWidth: 0,

            "& .MuiStep-root": {
              px: vertical ? 0 : 0.5,
              py: vertical ? 0.25 : 0,
              minWidth: 0,
            },

            "& .MuiStepConnector-alternativeLabel": {
              top: 20,
              left: "calc(-50% + 21px)",
              right: "calc(50% + 21px)",
            },

            "& .MuiStepConnector-line": {
              borderColor: alpha(theme.palette.text.primary, 0.16),
              borderWidth: 0,
              borderTopWidth: vertical ? 0 : 2,
              borderLeftWidth: vertical ? 2 : 0,
            },

            "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": { borderColor: "primary.main" },
            "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line": { borderColor: "primary.main" },

            "& .MuiStepIcon-root": {
              fontSize: 28,
              color: alpha(theme.palette.text.primary, 0.22),
            },

            "& .MuiStepIcon-root.Mui-active": { color: "primary.main" },
            "& .MuiStepIcon-root.Mui-completed": { color: "primary.main" },

            "& .MuiStepIcon-text": {
              fill: theme.palette.primary.contrastText,
              fontSize: 11,
              fontWeight: 800,
            },

            "& .MuiStepLabel-label": {
              mt: vertical ? 0 : 0.75,
              fontSize: { xs: 13, sm: 13.5 },
              fontWeight: 700,
              lineHeight: 1.25,
              color: "text.secondary",
            },

            "& .MuiStepLabel-label.Mui-active": {
              color: "primary.main",
              fontWeight: 800,
            },

            "& .MuiStepLabel-label.Mui-completed": {
              color: "text.primary",
              fontWeight: 700,
            },
          }}
        >
          {steps.map((label, index) => (
            <Step key={`${index}:${label}`} completed={index < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Paper>
  );
}
