import {
  Button,
  CircularProgress,
  Paper,
  Stack,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

export default function PromotionFormActions({
  activeStep,
  totalSteps,
  saving = false,
  loading = false,
  onCancel,
  onPrevious,
  onNext,
  onSaveInactive,
  onSave,
}) {
  const isFirst = activeStep === 0;
  const isLast =
    activeStep === totalSteps - 1;

  return (
    <Paper
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Stack
        direction={{
          xs: "column-reverse",
          sm: "row",
        }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={
            isFirst ? null : (
              <ArrowBackOutlinedIcon />
            )
          }
          onClick={
            isFirst ? onCancel : onPrevious
          }
          disabled={saving}
          sx={{
            minWidth: {
              xs: "100%",
              sm: 150,
            },
            height: 44,
            borderRadius: 2,
          }}
        >
          {isFirst ? "Cancelar" : "Anterior"}
        </Button>

        {!isLast ? (
          <Button
            type="button"
            variant="contained"
            endIcon={
              <ArrowForwardOutlinedIcon />
            }
            onClick={onNext}
            disabled={
              saving || loading
            }
            sx={{
              minWidth: {
                xs: "100%",
                sm: 170,
              },
              height: 44,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Siguiente
          </Button>
        ) : (
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1.5}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={onSaveInactive}
              disabled={saving}
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 190,
                },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Guardar inactiva
            </Button>

            <Button
              type="button"
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress
                    size={18}
                    color="inherit"
                  />
                ) : (
                  <SaveOutlinedIcon />
                )
              }
              onClick={onSave}
              disabled={saving}
              sx={{
                minWidth: {
                  xs: "100%",
                  md: 190,
                },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              {saving
                ? "Creando…"
                : "Crear promoción"}
            </Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
