import {
  Box, Button, Chip, Stack, Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

export default function MenuChannelsHeader({
  menu,
  hasChanges,
  saving,
  onBack,
  onSave,
}) {
  const statusConfig = {
    draft: {
      label: "Borrador",
      color: "warning",
    },

    active: {
      label: "Activo",
      color: "success",
    },

    archived: {
      label: "Archivado",
      color: "default",
    },
  }[
    menu?.status || "draft"
  ] || {
    label: "Desconocido",
    color: "default",
  };

  const readOnly =
    !!menu?.is_archived;

  return (
    <Stack
      direction={{
        xs: "column",
        md: "row",
      }}
      justifyContent="space-between"
      alignItems={{
        xs: "flex-start",
        md: "center",
      }}
      spacing={2}
    >
      <Box>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Typography
            sx={{
              fontSize: {
                xs: 30,
                md: 42,
              },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}
          >
            Canales del menú
          </Typography>

          <Chip
            label={
              statusConfig.label
            }
            color={
              statusConfig.color
            }
            size="small"
            variant={
              statusConfig.color ===
              "default"
                ? "outlined"
                : "filled"
            }
            sx={{
              fontWeight: 800,
            }}
          />
        </Stack>

        <Typography
          sx={{
            mt: 1,
            color: "text.secondary",
            fontSize: {
              xs: 14,
              md: 17,
            },
            lineHeight: 1.55,
          }}
        >
          Configura los canales donde participará{" "}
          <Box
            component="span"
            sx={{
              color: "primary.main",
              fontWeight: 800,
            }}
          >
            {menu?.name ||
              "este menú"}
          </Box>
          .
        </Typography>

        {hasChanges &&
        !readOnly ? (
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 13,
              color: "warning.dark",
              fontWeight: 800,
            }}
          >
            Tienes cambios pendientes de guardar.
          </Typography>
        ) : null}
      </Box>

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
        sx={{
          width: {
            xs: "100%",
            md: "auto",
          },
        }}
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={
            <ArrowBackOutlinedIcon />
          }
          onClick={onBack}
          disabled={saving}
          sx={{
            minWidth: {
              xs: "100%",
              sm: 170,
            },
            height: 44,
          }}
        >
          Volver a menús
        </Button>

        {!readOnly ? (
          <Button
            type="button"
            variant="contained"
            startIcon={
              <SaveOutlinedIcon />
            }
            onClick={onSave}
            disabled={
              saving ||
              !hasChanges
            }
            sx={{
              minWidth: {
                xs: "100%",
                sm: 190,
              },
              height: 44,
              fontWeight: 800,
            }}
          >
            {saving
              ? "Guardando…"
              : "Guardar canales"}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  );
}