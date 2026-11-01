//src/components/menu/menuSets/manage/MenuSetActivationTab.jsx
import { useRef, useState } from "react";

import {
  Box, Chip, CircularProgress, FormControlLabel, Paper, Stack, Switch, Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";

import { updateMenuSet } from "../../../../services/menu/menuSets/menuSet.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  backgroundColor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  boxShadow: "none",
};

const STEPS = [
  { key: "general", number: 1, title: "General" },
  { key: "administration", number: 2, title: "Administración" },
  { key: "stages", number: 3, title: "Etapas y productos" },
  { key: "programming", number: 4, title: "Programación" },
  { key: "activation", number: 5, title: "Activación" },
  { key: "availability", number: 6, title: "Disponibilidad" },
];

function getErrorMessage(error) {
  const data = error?.response?.data;

  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return errors.find((message) => typeof message === "string")
    || data?.message
    || error?.message
    || "No se pudo cambiar el estado del conjunto.";
}

/*
|--------------------------------------------------------------------------
| Estado de cada paso
|--------------------------------------------------------------------------
*/
function getStepState(step, details, isActive, canActivate, issuesCount) {
  if (step.key === "availability") {
    return { label: "Consulta independiente", color: "default" };
  }

  if (step.key === "activation") {
    if (isActive) {
      return issuesCount > 0
        ? { label: "Activo con pendientes", color: "warning" }
        : { label: "Activo", color: "success" };
    }

    return canActivate
      ? { label: "Listo para activar", color: "success" }
      : { label: "Pendiente", color: "warning" };
  }

  if (details?.is_complete === true) {
    return { label: "Completado", color: "success" };
  }

  if (details?.is_complete === false) {
    return { label: "Pendiente", color: "warning" };
  }

  return { label: "Por verificar", color: "default" };
}

/*
|--------------------------------------------------------------------------
| Tarjeta de configuración
|--------------------------------------------------------------------------
*/
function StepCard({
  step, details, isActive, canActivate, issuesCount, primaryBackground,
}) {
  const state = getStepState(step, details, isActive, canActivate, issuesCount);
  const complete = state.color === "success";

  return (
    <Box sx={{
      width: "100%",
      height: "100%",
      minWidth: 0,
      minHeight: 180,
      p: 1.75,
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.default",
    }}>
      <Stack spacing={1.25} sx={{ height: "100%" }}>
        {/* Número e icono de estado */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
        >
          <Box sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: primaryBackground,
            color: "primary.main",
          }}>
            <Typography sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "inherit",
            }}>
              {step.number}
            </Typography>
          </Box>

          {complete ? (
            <CheckCircleOutlineRoundedIcon
              sx={{ fontSize: 23, color: "success.main", flexShrink: 0 }}
            />
          ) : (
            <ScheduleRoundedIcon
              sx={{ fontSize: 23, color: "warning.main", flexShrink: 0 }}
            />
          )}
        </Stack>

        {/* Nombre del paso */}
        <Typography sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          lineHeight: 1.45,
          overflowWrap: "anywhere",
        }}>
          {step.title}
        </Typography>

        {/* Estado de configuración */}
        <Box>
          <Chip
            label={state.label}
            color={state.color}
            size="small"
            variant="outlined"
            sx={{
              fontWeight: 800,
              maxWidth: "100%",
              "& .MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
            }}
          />
        </Box>

        {/* Descripción */}
        <Typography sx={{
          fontSize: 13,
          color: "text.secondary",
          lineHeight: 1.55,
          overflowWrap: "anywhere",
          flex: 1,
        }}>
          {details?.message || "La información de este paso no está disponible."}
        </Typography>
      </Stack>
    </Box>
  );
}

/*
|--------------------------------------------------------------------------
| Administración de la activación del Conjunto
|--------------------------------------------------------------------------
*/
export default function MenuSetActivationTab({
  restaurantId,
  branchId,
  menuSet,
  onUpdated,
  onAlert,
  checking = false,
}) {
  const theme = useTheme();
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const isActive = menuSet?.is_active === true;
  const canActivate = menuSet?.can_activate === true;
  const canDeactivate = menuSet?.can_deactivate === true;

  const steps = menuSet?.configuration_steps || {};
  const managementMode = menuSet?.management_mode;

  const issues = Array.isArray(menuSet?.activation_issues)
    ? menuSet.activation_issues.filter((issue) => typeof issue === "string" && issue.trim())
    : [];

  const configurationComplete = issues.length === 0;
  const canChangeStatus = isActive ? canDeactivate : canActivate;

  const resolvedSteps = {
    general: steps.general,
    administration: steps.administration || {
      is_complete: ["manual", "mass_import"].includes(managementMode) ? true : null,
      message: managementMode === "manual"
        ? "El conjunto utiliza administración manual."
        : managementMode === "mass_import"
          ? "El conjunto utiliza administración mediante archivos."
          : "No se pudo identificar la modalidad de administración.",
    },
    stages: steps.stages,
    programming: steps.programming || (
      managementMode === "manual"
        ? steps.capacity
        : {
          is_complete: null,
          message: "La programación de cada periodo se valida mediante sus publicaciones. Consulta el apartado Programación para revisar el periodo correspondiente.",
        }
    ),
    activation: steps.activation,
    availability: {
      is_complete: null,
      message: "Consulta la disponibilidad de los productos por fecha y cantidad. El estado de venta del conjunto completo se determina por separado.",
    },
  };

  const primaryBackground = alpha(theme.palette.primary.main, 0.12);

  /*
  |--------------------------------------------------------------------------
  | Resumen de la configuración
  |--------------------------------------------------------------------------
  */
    const statusDescription = isActive
      ? configurationComplete
        ? "El conjunto está activo. Su disponibilidad para venderse depende de la fecha, la programación, los cupos y los productos disponibles."
        : "El conjunto sigue activo, pero tiene configuraciones pendientes que pueden limitar su disponibilidad."
      : canActivate
        ? "La configuración cumple las condiciones de activación. Puedes habilitar el conjunto."
        : issues.length > 0
          ? "Completa los puntos pendientes para poder activar el conjunto."
          : menuSet?.activate_block_reason || "El conjunto todavía no reúne las condiciones necesarias para activarse.";

  /*
  |--------------------------------------------------------------------------
  | Activar o desactivar el Conjunto
  |--------------------------------------------------------------------------
  */
  const handleChangeStatus = async () => {
    if (savingRef.current || saving || checking || !canChangeStatus || !menuSet?.id) {
      return;
    }

    savingRef.current = true;
    setSaving(true);

    const nextStatus = !isActive;

    try {
      const response = await updateMenuSet(
        restaurantId,
        branchId,
        menuSet.id,
        { is_active: nextStatus }
      );

      const updatedSet = response?.menu_set;

      if (!updatedSet?.id) {
        throw new Error("No se recibió la información actualizada del conjunto.");
      }

      onUpdated?.(updatedSet);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: nextStatus
          ? "El conjunto se activó correctamente."
          : "El conjunto se desactivó correctamente.",
      });
    } catch (error) {
      onAlert?.({
        severity: "error",
        title: "No se pudo cambiar el estado",
        message: getErrorMessage(error),
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Estado de configuración: mismo diseño de los otros apartados */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Box>
            <Typography sx={{
              fontSize: 16,
              fontWeight: 800,
              color: "text.primary",
            }}>
              Estado de configuración
            </Typography>

            <Typography sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.55,
            }}>
              {statusDescription}
            </Typography>
          </Box>

          {/* Seis apartados de configuración */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gridAutoRows: "1fr",
            gap: 1.5,
            width: "100%",
            alignItems: "stretch",
          }}>
            {STEPS.map((step) => (
              <StepCard
                key={step.key}
                step={step}
                details={resolvedSteps[step.key]}
                isActive={isActive}
                canActivate={canActivate}
                issuesCount={issues.length}
                primaryBackground={primaryBackground}
              />
            ))}
          </Box>
        </Stack>
      </Paper>

      {/* Configuración pendiente */}
      {issues.length > 0 ? (
        <Paper sx={panelSx}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ flexWrap: "wrap", rowGap: 1 }}
            >
              <ErrorOutlineRoundedIcon sx={{
                fontSize: 23,
                color: "warning.main",
                flexShrink: 0,
              }} />

              <Typography sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}>
                Configuración pendiente
              </Typography>

              <Chip
                label={issues.length}
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontWeight: 800 }}
              />
            </Stack>

            <Typography sx={{
              fontSize: 13,
              color: "text.secondary",
              lineHeight: 1.55,
            }}>
              Revisa los siguientes puntos para completar la configuración del conjunto.
            </Typography>

            <Stack spacing={1}>
              {issues.map((issue, index) => (
                <Stack
                  key={`${index}-${issue}`}
                  direction="row"
                  spacing={1.25}
                  alignItems="flex-start"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
                  <ErrorOutlineRoundedIcon sx={{
                    fontSize: 19,
                    color: "warning.main",
                    mt: 0.1,
                    flexShrink: 0,
                  }} />

                  <Typography sx={{
                    fontSize: 13,
                    color: "text.primary",
                    lineHeight: 1.55,
                    overflowWrap: "anywhere",
                  }}>
                    {issue}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      {/* Activación del Conjunto */}
      <Paper sx={panelSx}>
        <Stack spacing={2.5}>
          <Typography sx={{
            fontSize: 18,
            fontWeight: 800,
            color: "text.primary",
          }}>
            {isActive ? "Estado del conjunto" : "Activar conjunto"}
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="flex-start"
              >
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: primaryBackground,
                  color: "primary.main",
                }}>
                  <PowerSettingsNewRoundedIcon fontSize="small" />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "text.primary",
                  }}>
                    {isActive ? "Conjunto habilitado" : "Conjunto desactivado"}
                  </Typography>

                  <Typography sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.55,
                  }}>
                    {isActive
                      ? "Puedes desactivar el conjunto cuando no existan operaciones pendientes que impidan el cambio."
                      : "Al activarlo, podrá utilizarse en los menús donde esté asociado, siempre que corresponda a un día configurado."}
                  </Typography>

                  {!canChangeStatus && !checking && (
                    (isActive && menuSet?.deactivate_block_reason)
                    || (!isActive && menuSet?.activate_block_reason)
                  ) ? (
                    <Typography sx={{
                      mt: 1,
                      fontSize: 12,
                      color: "text.secondary",
                      lineHeight: 1.5,
                      overflowWrap: "anywhere",
                    }}>
                      {isActive
                        ? menuSet.deactivate_block_reason
                        : menuSet.activate_block_reason}
                    </Typography>
                  ) : null}
                </Box>
              </Stack>
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent={{ xs: "space-between", md: "flex-end" }}
              spacing={1.5}
              sx={{ minWidth: { xs: "100%", md: 210 }, flexShrink: 0 }}
            >
              {saving || checking ? <CircularProgress size={18} /> : null}

              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    color="primary"
                    checked={isActive}
                    onChange={handleChangeStatus}
                    disabled={saving || checking || !canChangeStatus}
                    inputProps={{
                      "aria-label": isActive ? "Desactivar conjunto" : "Activar conjunto",
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                    {saving ? "Guardando…" : checking ? "Comprobando…" : isActive ? "Activo" : "Inactivo"}
                  </Typography>
                }
              />
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}