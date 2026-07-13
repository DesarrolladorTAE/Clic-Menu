import {
  Box,
  Paper,
  Step,
  StepButton,
  Stepper,
  useMediaQuery,
} from "@mui/material";
import {
  alpha,
  useTheme,
} from "@mui/material/styles";

import { PROMOTION_FORM_STEPS } from "./promotionForm.helpers";

export default function PromotionFormStepper({
  activeStep,
  onStepChange,
}) {
  const theme = useTheme();

  const useVerticalLayout =
    useMediaQuery(
      theme.breakpoints.down("md")
    );

  return (
    <Paper
      sx={{
        p: {
          xs: 1.25,
          sm: 1.5,
          md: 2,
        },
        borderRadius: 2,
        backgroundColor:
          "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow:
          "0 4px 16px rgba(52, 39, 31, 0.05)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
        }}
      >
        <Stepper
          nonLinear
          activeStep={activeStep}
          orientation={
            useVerticalLayout
              ? "vertical"
              : "horizontal"
          }
          alternativeLabel={
            !useVerticalLayout
          }
          sx={{
            width: "100%",
            minWidth: 0,

            "& .MuiStep-root": {
              px: useVerticalLayout
                ? 0
                : 0.5,
              py: useVerticalLayout
                ? 0.25
                : 0,
              minWidth: 0,
            },

            "& .MuiStepConnector-line": {
              borderColor: alpha(
                theme.palette.text.primary,
                0.16
              ),
              borderWidth: 0,
              borderTopWidth:
                useVerticalLayout
                  ? 0
                  : 2,
              borderLeftWidth:
                useVerticalLayout
                  ? 2
                  : 0,
            },

            "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line":
              {
                borderColor:
                  "primary.main",
              },

            "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line":
              {
                borderColor:
                  "primary.main",
              },

            "& .MuiStepIcon-root": {
              fontSize: 30,
              color: alpha(
                theme.palette.text.primary,
                0.22
              ),
              transition:
                "color 160ms ease, transform 160ms ease",
            },

            "& .MuiStepIcon-root.Mui-active":
              {
                color: "primary.main",
                transform: "scale(1.05)",
              },

            "& .MuiStepIcon-root.Mui-completed":
              {
                color: "primary.main",
              },

            "& .MuiStepIcon-text": {
              fill:
                theme.palette.primary
                  .contrastText,
              fontSize: 11,
              fontWeight: 800,
            },

            "& .MuiStepLabel-label": {
              mt: useVerticalLayout
                ? 0
                : 0.75,
              fontSize: {
                xs: 13,
                sm: 13.5,
              },
              fontWeight: 700,
              color: "text.secondary",
              lineHeight: 1.25,
              whiteSpace:
                useVerticalLayout
                  ? "normal"
                  : "nowrap",
              transition:
                "color 160ms ease",
            },

            "& .MuiStepLabel-label.Mui-active":
              {
                color: "primary.main",
                fontWeight: 800,
              },

            "& .MuiStepLabel-label.Mui-completed":
              {
                color: "text.primary",
                fontWeight: 700,
              },
          }}
        >
          {PROMOTION_FORM_STEPS.map(
            (label, index) => {
              const isCompleted =
                index < activeStep;

              const canNavigate =
                index <= activeStep;

              return (
                <Step
                  key={label}
                  completed={isCompleted}
                  sx={{
                    flex: useVerticalLayout
                      ? "initial"
                      : 1,
                  }}
                >
                  <StepButton
                    onClick={() => {
                      if (canNavigate) {
                        onStepChange(index);
                      }
                    }}
                    disabled={!canNavigate}
                    sx={{
                      width: "100%",
                      minWidth: 0,
                      minHeight:
                        useVerticalLayout
                          ? 54
                          : 76,
                      px: useVerticalLayout
                        ? 1.25
                        : 0.5,
                      py: useVerticalLayout
                        ? 0.75
                        : 1,
                      borderRadius: 1.5,
                      border: "none",
                      backgroundColor:
                        "transparent",
                      justifyContent:
                        useVerticalLayout
                          ? "flex-start"
                          : "center",
                      transition:
                        "background-color 160ms ease",

                      "&:hover": {
                        backgroundColor:
                          canNavigate
                            ? alpha(
                                theme.palette
                                  .primary.main,
                                0.08
                              )
                            : "transparent",
                      },

                      "&.Mui-focusVisible": {
                        backgroundColor:
                          alpha(
                            theme.palette
                              .primary.main,
                            0.08
                          ),
                      },

                      "&.Mui-disabled": {
                        opacity: 1,
                        backgroundColor:
                          "transparent",
                      },

                      "& .MuiStepLabel-root":
                        {
                          width: "100%",
                          minWidth: 0,
                        },

                      "& .MuiStepLabel-iconContainer":
                        {
                          pr: useVerticalLayout
                            ? 1.25
                            : 0,
                        },

                      "& .MuiStepLabel-labelContainer":
                        {
                          minWidth: 0,
                          textAlign:
                            useVerticalLayout
                              ? "left"
                              : "center",
                        },
                    }}
                  >
                    {label}
                  </StepButton>
                </Step>
              );
            }
          )}
        </Stepper>
      </Box>
    </Paper>
  );
}