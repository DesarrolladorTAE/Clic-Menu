import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box, Button, Chip, CircularProgress, MenuItem, Paper, Stack, TextField, Typography,
} from "@mui/material";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PowerSettingsNewRoundedIcon from "@mui/icons-material/PowerSettingsNewRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import PhoneAndroidRoundedIcon from "@mui/icons-material/PhoneAndroidRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import {
  getOnlineOrderSetting,
  updateOnlineOrderSetting,
} from "../../../../services/operation/online-orders/onlineOrders.service";

const KITCHEN_MODE_WITH_KITCHEN = "with_kitchen";
const KITCHEN_MODE_WITHOUT_KITCHEN = "without_kitchen";

const EMPTY_VALUES = {
  kitchen_mode: "",
  max_active_orders_per_phone: "",
};

function mapSettingToForm(setting) {
  return {
    kitchen_mode: setting?.kitchen_mode ?? "",
    max_active_orders_per_phone:
      setting?.max_active_orders_per_phone === null ||
      setting?.max_active_orders_per_phone === undefined
        ? ""
        : String(setting.max_active_orders_per_phone),
  };
}

function isSettingActive(value) {
  return value === true || value === 1 || value === "1";
}

function getKitchenModeLabel(value) {
  if (value === KITCHEN_MODE_WITH_KITCHEN) return "Con cocina";
  if (value === KITCHEN_MODE_WITHOUT_KITCHEN) return "Sin cocina";
  return "Sin definir";
}

export default function OnlineOrderGeneralTab({
  restaurantId,
  branchId,
  branchName,
  setting,
  setSetting,
  loading,
  setLoading,
  onAlert,
}) {
  const {
    control,
    watch,
    reset,
    setError,
    clearErrors,
    handleSubmit,
    formState: { isDirty, isValid, isSubmitting },
  } = useForm({
    defaultValues: EMPTY_VALUES,
    mode: "onChange",
  });

  const kitchenMode = watch("kitchen_mode");
  const phoneLimit = watch("max_active_orders_per_phone");
  const currentActive = isSettingActive(setting?.is_active);

  const contextItems = useMemo(
    () => [
      {
        title: "Sucursal",
        value: branchName || "No seleccionada",
        chipLabel: branchId ? "Seleccionada" : "Pendiente",
        chipColor: branchId ? "primary" : "default",
        icon: <StorefrontRoundedIcon fontSize="small" />,
      },
      {
        title: "Estado",
        value: currentActive
          ? "La sucursal puede recibir Pedidos en línea"
          : "Pedidos en línea todavía no está activo",
        chipLabel: currentActive ? "Activo" : "Inactivo",
        chipColor: currentActive ? "success" : "default",
        icon: <PowerSettingsNewRoundedIcon fontSize="small" />,
      },
      {
        title: "Preparación",
        value: getKitchenModeLabel(kitchenMode),
        chipLabel: kitchenMode ? "Configurado" : "Pendiente",
        chipColor: kitchenMode ? "primary" : "default",
        icon: <RestaurantRoundedIcon fontSize="small" />,
      },
      {
        title: "Límite por teléfono",
        value: phoneLimit
          ? `${phoneLimit} pedido${Number(phoneLimit) === 1 ? "" : "s"} activos`
          : "Sin límite definido",
        chipLabel: phoneLimit ? "Configurado" : "Pendiente",
        chipColor: phoneLimit ? "primary" : "default",
        icon: <PhoneAndroidRoundedIcon fontSize="small" />,
      },
    ],
    [branchId, branchName, currentActive, kitchenMode, phoneLimit]
  );

  useEffect(() => {
    if (!restaurantId || !branchId) {
      setSetting(null);
      reset(EMPTY_VALUES);
      return undefined;
    }

    let active = true;

    const loadSetting = async () => {
      setLoading(true);
      clearErrors();

      try {
        const result = await getOnlineOrderSetting(restaurantId, branchId);
        if (!active) return;

        setSetting(result);
        reset(mapSettingToForm(result));
      } catch (error) {
        if (!active) return;

        setSetting(null);
        reset(EMPTY_VALUES);

        onAlert?.({
          severity: "error",
          title: "Error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "No se pudo cargar la configuración general de Pedidos en línea.",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadSetting();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    branchId,
    reset,
    clearErrors,
    setSetting,
    setLoading,
    onAlert,
  ]);

  const save = async (values) => {
    if (!restaurantId || !branchId) {
      onAlert?.({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

    clearErrors();

    const phoneLimitValue = String(values.max_active_orders_per_phone || "").trim();

    const payload = {
      kitchen_mode: values.kitchen_mode || null,
      max_active_orders_per_phone:
        phoneLimitValue === "" ? null : Number(phoneLimitValue),
    };

    try {
      const response = await updateOnlineOrderSetting(restaurantId, branchId, payload);
      const updatedSetting = response?.data ?? { ...setting, ...payload };

      setSetting(updatedSetting);
      reset(mapSettingToForm(updatedSetting));

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message:
          response?.message ||
          "La configuración general de Pedidos en línea se actualizó correctamente.",
      });
    } catch (error) {
      const errors = error?.response?.data?.errors || {};
      const kitchenError = Array.isArray(errors?.kitchen_mode)
        ? errors.kitchen_mode[0]
        : null;
      const phoneLimitError = Array.isArray(errors?.max_active_orders_per_phone)
        ? errors.max_active_orders_per_phone[0]
        : null;

      if (kitchenError) {
        setError("kitchen_mode", {
          type: "server",
          message: kitchenError,
        });
      }

      if (phoneLimitError) {
        setError("max_active_orders_per_phone", {
          type: "server",
          message: phoneLimitError,
        });
      }

      const firstError = Object.values(errors).flat()?.[0];

      onAlert?.({
        severity: "error",
        title: "Error",
        message:
          firstError ||
          error?.response?.data?.message ||
          error?.message ||
          "No se pudo guardar la configuración general de Pedidos en línea.",
      });
    }
  };

  const discardChanges = () => {
    clearErrors();
    reset(mapSettingToForm(setting));
  };

  if (loading) {
    return (
      <Paper
        sx={{
          p: 4,
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Cargando configuración general…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (!setting) {
    return (
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
          No se pudo cargar la configuración
        </Typography>

        <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary", lineHeight: 1.55 }}>
          Selecciona otra sucursal o vuelve a ingresar a esta sección.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Stack spacing={3}>
        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
              Contexto actual
            </Typography>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              useFlexGap
              flexWrap="wrap"
            >
              {contextItems.map((item) => (
                <ContextMiniCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  value={item.value}
                  chipLabel={item.chipLabel}
                  chipColor={item.chipColor}
                />
              ))}
            </Stack>

            <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
              {branchName
                ? `Los cambios que guardes en este apartado se aplicarán únicamente a ${branchName}.`
                : "Selecciona una sucursal para continuar."}
            </Typography>
          </Stack>
        </Paper>

        <Paper
          component="form"
          onSubmit={handleSubmit(save)}
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
          }}
        >
          <Stack spacing={3}>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Configuración general
            </Typography>

            <Stack spacing={2.5}>
              <SectionTitle title="Funcionamiento de los pedidos" />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <FieldBlock
                  label="Modo de preparación"
                  help="Define si los pedidos pasarán por el flujo de Cocina o si serán preparados directamente por el personal encargado."
                  input={
                    <Controller
                      name="kitchen_mode"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          select
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || ""}
                          SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
                        >
                          <MenuItem value="">Sin definir</MenuItem>
                          <MenuItem value={KITCHEN_MODE_WITH_KITCHEN}>Con cocina</MenuItem>
                          <MenuItem value={KITCHEN_MODE_WITHOUT_KITCHEN}>Sin cocina</MenuItem>
                        </TextField>
                      )}
                    />
                  }
                />

                <FieldBlock
                  label="Máximo de pedidos activos por teléfono"
                  help="Define cuántos pedidos sin finalizar puede mantener al mismo tiempo un cliente con el mismo número telefónico."
                  input={
                    <Controller
                      name="max_active_orders_per_phone"
                      control={control}
                      rules={{
                        validate: (value) => {
                          const normalized = String(value || "").trim();

                          if (normalized === "") return true;
                          if (!/^\d+$/.test(normalized)) {
                            return "El límite debe ser un número entero.";
                          }
                          if (Number(normalized) < 1) {
                            return "El límite debe ser mayor a cero.";
                          }

                          return true;
                        },
                      }}
                      render={({ field, fieldState }) => (
                        <TextField
                          type="text"
                          value={field.value ?? ""}
                          onChange={(event) => {
                            const onlyNumbers = event.target.value.replace(/\D/g, "");
                            field.onChange(onlyNumbers);
                          }}
                          placeholder="Ej. 3"
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message || ""}
                          inputProps={{
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }}
                        />
                      )}
                    />
                  }
                />
              </Stack>

              <SectionTitle title="Activación" />

              <Box
                sx={{
                  p: 1.75,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.default",
                }}
              >
                <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>
                  <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
                    Esta sección no activa Pedidos en línea.
                  </Box>{" "}
                  Puedes guardar la configuración general y continuar después con Entrega y Pagos.
                  La activación se realizará únicamente desde{" "}
                  <Box component="span" sx={{ fontWeight: 800, color: "primary.main" }}>
                    Preparación para activar
                  </Box>
                  .
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                pt={1}
              >
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={discardChanges}
                  disabled={!isDirty || isSubmitting}
                  sx={{
                    minWidth: { xs: "100%", sm: 190 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  Descartar cambios
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveOutlinedIcon />}
                  disabled={!isDirty || !isValid || isSubmitting}
                  sx={{
                    minWidth: { xs: "100%", sm: 190 },
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {isSubmitting ? "Guardando…" : "Guardar cambios"}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}

function ContextMiniCard({
  icon,
  title,
  value,
  chipLabel,
  chipColor = "default",
}) {
  return (
    <Box
      sx={{
        flex: "1 1 220px",
        minWidth: { xs: "100%", sm: 220 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack spacing={1} height="100%">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255, 152, 0, 0.12)",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: 14,
            color: "text.primary",
            lineHeight: 1.45,
            minHeight: 42,
          }}
        >
          {value}
        </Typography>

        <Box sx={{ mt: "auto" }}>
          <Chip
            label={chipLabel}
            size="small"
            color={chipColor}
            variant={chipColor === "default" ? "outlined" : "filled"}
          />
        </Box>
      </Stack>
    </Box>
  );
}

function SectionTitle({ title }) {
  return (
    <Typography
      sx={{
        fontSize: 15,
        fontWeight: 800,
        color: "primary.main",
        pt: 0.5,
      }}
    >
      {title}
    </Typography>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}