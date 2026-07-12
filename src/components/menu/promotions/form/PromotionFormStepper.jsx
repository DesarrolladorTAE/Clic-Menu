import {
  Box,
  Paper,
  Step,
  StepButton,
  Stepper,
} from "@mui/material";

import { PROMOTION_FORM_STEPS } from "./promotionForm.helpers";

export default function PromotionFormStepper({
  activeStep,
  onStepChange,
}) {
  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          pb: 0.5,
        }}
      >
        <Stepper
          nonLinear
          activeStep={activeStep}
          sx={{
            minWidth: {
              xs: 760,
              md: "auto",
            },
            "& .MuiStepLabel-label": {
              fontSize: 13,
              fontWeight: 700,
            },
            "& .MuiStepLabel-label.Mui-active": {
              color: "primary.main",
              fontWeight: 800,
            },
            "& .MuiStepLabel-label.Mui-completed": {
              color: "text.primary",
            },
          }}
        >
          {PROMOTION_FORM_STEPS.map(
            (label, index) => (
              <Step
                key={label}
                completed={index < activeStep}
              >
                <StepButton
                  onClick={() => {
                    if (index <= activeStep) {
                      onStepChange(index);
                    }
                  }}
                  disabled={index > activeStep}
                >
                  {label}
                </StepButton>
              </Step>
            )
          )}
        </Stepper>
      </Box>
    </Paper>
  );
}
