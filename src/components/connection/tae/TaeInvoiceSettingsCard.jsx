import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { handleFormApiError } from "../../../utils/useFormApiHandler";

const DEFAULT_MODE_OPTIONS = [
  {
    value: "global",
    label: "Facturación global",
  },
  {
    value: "per_product",
    label: "Facturación por producto",
  },
  {
    value: "both",
    label: "Ambos modos",
  },
];

function trimOrNull(value) {
  const clean = String(value || "").trim();
  return clean === "" ? null : clean;
}

function requiresGlobalData(invoiceMode) {
  const value = String(invoiceMode || "");
  return value === "global" || value === "both";
}

function FieldError({ message }) {
  if (!message) return null;

  return (
    <Typography
      sx={{
        mt: 0.75,
        fontSize: 12,
        color: "error.main",
        fontWeight: 700,
        lineHeight: 1.4,
      }}
    >
      {message}
    </Typography>
  );
}

function HelperNote({ children }) {
  if (!children) return null;

  return (
    <Typography
      sx={{
        mt: 0.75,
        fontSize: 12,
        color: "text.secondary",
        lineHeight: 1.45,
      }}
    >
      {children}
    </Typography>
  );
}

function FieldBlock({ label, input, help, error }) {
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

      {help ? <HelperNote>{help}</HelperNote> : null}
      <FieldError message={error} />
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

function SwitchInfoCard({
  title,
  description,
  checked,
  disabled = false,
  onChange,
}) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.75,
        backgroundColor: "background.default",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.45,
            }}
          >
            {description}
          </Typography>
        </Box>

        <FormControlLabel
          sx={{ m: 0 }}
          control={
            <Switch
              checked={!!checked}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              color="primary"
            />
          }
          label={
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 700,
                color: disabled ? "text.secondary" : "text.primary",
              }}
            >
              {checked ? "Sí" : "No"}
            </Typography>
          }
        />
      </Stack>
    </Box>
  );
}

export default function TaeInvoiceSettingsCard({
  payload,
  onSave,
  onDelete,
  showToast,
}) {
  const [saving, setSaving] = useState(false);

  const setting = payload?.taeconta_invoice_setting || null;
  const ui = payload?.ui || {};
  const account = payload?.taeconta_account || null;

  const canEnable = !!ui?.can_enable;

  const invoiceModeOptions = useMemo(() => {
    const raw = Array.isArray(ui?.invoice_mode_options)
      ? ui.invoice_mode_options
      : [];

    const options = raw
      .map((item) => ({
        value: item?.value,
        label: item?.label,
      }))
      .filter((item) => item.value && item.label);

    return options.length > 0 ? options : DEFAULT_MODE_OPTIONS;
  }, [ui]);

  const defaultValues = useMemo(
    () => ({
      enabled: !!setting?.enabled,
      invoice_mode: setting?.invoice_mode || "global",
      serie: setting?.serie || "",
      global_sat_product_service: setting?.global_sat_product_service || "",
      global_sat_unit: setting?.global_sat_unit || "",
      global_description: setting?.global_description || "",
    }),
    [setting]
  );

  const {
    control,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues });

  const enabled = watch("enabled");
  const invoiceMode = watch("invoice_mode");
  const showGlobalFields = requiresGlobalData(invoiceMode);

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!canEnable && enabled) {
      setValue("enabled", false);
    }
  }, [canEnable, enabled, setValue]);

  const submit = async (form) => {
    setSaving(true);

    try {
      const useGlobalData = requiresGlobalData(form.invoice_mode);

      const payloadToSend = {
        enabled: !!form.enabled && canEnable,
        invoice_mode: form.invoice_mode || "global",
        serie: String(form.serie || "").trim(),
        global_sat_product_service: useGlobalData
          ? trimOrNull(form.global_sat_product_service)
          : null,
        global_sat_unit: useGlobalData ? trimOrNull(form.global_sat_unit) : null,
        global_description: useGlobalData
          ? trimOrNull(form.global_description)
          : null,
      };

      const response = await onSave(payloadToSend);

      if (showToast) {
        showToast(
          response?.message ||
            "Configuración de auto-facturación guardada correctamente.",
          "success"
        );
      }
    } catch (e) {
      const handled = handleFormApiError(e, setError, {
        onMessage: (msg) => {
          if (showToast) showToast(msg, "error");
        },
      });

      if (!handled && showToast) {
        showToast(
          e?.response?.data?.message ||
            e?.message ||
            "No se pudo guardar la configuración de auto-facturación.",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 1,
        backgroundColor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "none",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              Configuración de auto-facturación
            </Typography>

            <Chip
              label={enabled ? "Activa" : "Inactiva"}
              size="small"
              color={enabled ? "success" : "default"}
              variant={enabled ? "filled" : "outlined"}
            />
          </Stack>

          <Typography
            sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}
          >
            Define cómo Clic Menu enviará la venta a Taeconta para generar la factura.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
        <form onSubmit={handleSubmit(submit)}>
          <Stack spacing={2.5}>
            {!canEnable ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "#F3D48B",
                  backgroundColor: "#FFF7E8",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#8A5A00",
                    mb: 0.5,
                  }}
                >
                  Primero conecta Taeconta
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#8A5A00",
                    lineHeight: 1.45,
                  }}
                >
                  La cuenta{" "}
                  <Typography
                    component="span"
                    sx={{ fontSize: 13, fontWeight: 800, color: "#8A5A00" }}
                  >
                    {account?.email || "Taeconta"}
                  </Typography>{" "}
                  debe estar vinculada correctamente antes de activar la auto-facturación.
                </Typography>
              </Box>
            ) : null}

            <SectionTitle title="Activación" />

            <SwitchInfoCard
              title="Activar auto-facturación"
              description="Al activarla, el sistema podrá generar facturas desde los tickets que cumplan las reglas fiscales."
              checked={!!enabled}
              disabled={!canEnable || saving}
              onChange={(checked) => setValue("enabled", checked)}
            />

            <SectionTitle title="Modo de facturación" />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FieldBlock
                label="Modo"
                input={
                  <Controller
                    name="invoice_mode"
                    control={control}
                    rules={{
                      required: "Selecciona un modo de facturación.",
                    }}
                    render={({ field }) => (
                      <TextField
                        select
                        fullWidth
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        disabled={saving}
                        SelectProps={{
                          IconComponent: KeyboardArrowDownIcon,
                        }}
                      >
                        {invoiceModeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                }
                help="Define si se facturará de forma global, por producto o permitiendo ambos modos."
                error={errors?.invoice_mode?.message}
              />

              <FieldBlock
                label="Serie"
                input={
                  <Controller
                    name="serie"
                    control={control}
                    rules={{
                      required: "La serie es obligatoria.",
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        disabled={saving}
                        placeholder="Ej. CM"
                      />
                    )}
                  />
                }
                help="Serie que se enviará a Taeconta para generar la factura."
                error={errors?.serie?.message}
              />
            </Stack>

            {showGlobalFields ? (
              <>
                <SectionTitle title="Datos globales SAT" />

                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.default",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                      <FieldBlock
                        label="Clave SAT producto/servicio"
                        input={
                          <Controller
                            name="global_sat_product_service"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                disabled={saving}
                                placeholder="Ej. 90101501"
                              />
                            )}
                          />
                        }
                        help="Clave SAT usada para facturación global."
                        error={errors?.global_sat_product_service?.message}
                      />

                      <FieldBlock
                        label="Clave SAT unidad"
                        input={
                          <Controller
                            name="global_sat_unit"
                            control={control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                fullWidth
                                disabled={saving}
                                placeholder="Ej. E48"
                              />
                            )}
                          />
                        }
                        help="Unidad SAT usada para el concepto global."
                        error={errors?.global_sat_unit?.message}
                      />
                    </Stack>

                    <FieldBlock
                      label="Descripción global"
                      input={
                        <Controller
                          name="global_description"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              disabled={saving}
                              placeholder="Ej. Consumo de alimentos"
                            />
                          )}
                        />
                      }
                      help="Texto que se usará como descripción del concepto global."
                      error={errors?.global_description?.message}
                    />
                  </Stack>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "#B8D7F0",
                  backgroundColor: "#EEF7FF",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#0B4A75",
                    mb: 0.5,
                  }}
                >
                  Facturación por producto
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "#0B4A75",
                    lineHeight: 1.45,
                  }}
                >
                  En este modo se usarán las claves SAT configuradas en cada producto.
                  Los campos globales no se enviarán.
                </Typography>
              </Box>
            )}

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
              pt={1}
            >
              {setting?.id ? (
                <Button
                  type="button"
                  onClick={onDelete}
                  disabled={saving}
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  sx={{
                    minWidth: { xs: "100%", sm: 210 },
                    height: 44,
                    fontWeight: 800,
                  }}
                >
                  Eliminar configuración
                </Button>
              ) : null}

              <Button
                type="submit"
                disabled={saving}
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 220 },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                {saving ? "Guardando…" : "Guardar configuración"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Paper>
  );
}