import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

function isSalonName(name) {
  const n = String(name || "").trim().toLowerCase();
  return n === "salón" || n === "salon" || n === "salón " || n === "salon ";
}

function getQrNoticeForCreate({ type, tableId, orderingMode }) {
  const hasTable = !!tableId;

  if (type === "delivery") {
    return "Menú por canal Delivery, solo lectura.";
  }

  if (type === "web") {
    return "Menú web, solo lectura. Selecciona el canal a visualizar.";
  }

  if (!hasTable) {
    return "Menú completo, solo lectura.";
  }

  if (String(orderingMode) === "customer_assisted") {
    return "Menú para pedidos del cliente (cliente asistido).";
  }

  return "Menú para pedidos del mesero (solo mesero).";
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
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function BranchQrCreateModal({
  open,
  onClose,
  onSubmit,
  busy = false,
  selectedBranch,
  settings,
  salonChannel,
  channelOptionsRaw = [],
  tableOptions = [],
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const defaultValues = useMemo(() => {
    return {
      name: "",
      type: "physical",
      sales_channel_id: salonChannel?.id ? String(salonChannel.id) : "",
      table_id: "",
      is_active: true,
    };
  }, [salonChannel]);

  const { control, watch, reset, setValue, handleSubmit } = useForm({
    defaultValues,
  });

  const type = watch("type");
  const tableId = watch("table_id");
  const salesChannelId = watch("sales_channel_id");

  const filteredChannelOptions = useMemo(() => {
    if (!type) return [];

    if (type === "physical") {
      return salonChannel ? [salonChannel] : [];
    }

    if (type === "delivery") {
      return (channelOptionsRaw || []).filter((c) => !isSalonName(c.name));
    }

    if (type === "web") {
      return salonChannel ? [salonChannel] : [];
    }

    return channelOptionsRaw || [];
  }, [type, channelOptionsRaw, salonChannel]);

  const filteredTableOptions = useMemo(() => {
    if (type === "delivery" || type === "web") return [];
    return tableOptions;
  }, [type, tableOptions]);

  const canSubmit = useMemo(() => {
    const hasName = String(watch("name") || "").trim().length > 0;
    const hasType = String(type || "").length > 0;
    const hasChannel = String(salesChannelId || "").length > 0;
    return hasName && hasType && hasChannel;
  }, [watch, type, salesChannelId]);

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, reset, defaultValues]);

  useEffect(() => {
    if (!open) return;

    if (type === "delivery" || type === "web") {
      if (tableId) {
        setValue("table_id", "");
      }
    }

    const currentChannelId = salesChannelId ? Number(salesChannelId) : null;

    if (type === "physical" || type === "web") {
      const wanted = salonChannel?.id ? String(salonChannel.id) : "";
      if (wanted && salesChannelId !== wanted) {
        setValue("sales_channel_id", wanted);
      }
      if (!wanted && salesChannelId) {
        setValue("sales_channel_id", "");
      }
      return;
    }

    if (type === "delivery") {
      if (
        currentChannelId &&
        salonChannel?.id &&
        currentChannelId === salonChannel.id
      ) {
        setValue("sales_channel_id", "");
        return;
      }

      if (!salesChannelId && filteredChannelOptions.length > 0) {
        setValue("sales_channel_id", String(filteredChannelOptions[0].id));
      }
    }
  }, [
    open,
    type,
    tableId,
    salesChannelId,
    salonChannel,
    filteredChannelOptions,
    setValue,
  ]);

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, sm: 1 },
            overflow: "hidden",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          bgcolor: "#111111",
          color: "#fff",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 20, sm: 24 },
                lineHeight: 1.2,
                color: "#fff",
              }}
            >
              Crear QR
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Genera token, imagen PNG y URL pública para{" "}
              {selectedBranch?.name || "la sucursal seleccionada"}.
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            disabled={busy}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 20 },
                    color: "text.primary",
                  }}
                >
                  Datos del QR
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FieldBlock
                    label="Nombre"
                    input={
                      <Controller
                        name="name"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            fullWidth
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder='Ej. "QR Comedor" o "Mesa 4"'
                          />
                        )}
                      />
                    }
                  />

                  <FieldBlock
                    label="Tipo"
                    input={
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            value={field.value ?? ""}
                            onChange={(e) => {
                              field.onChange(e);
                              setValue("table_id", "");
                            }}
                            SelectProps={{
                              IconComponent: KeyboardArrowDownIcon,
                            }}
                          >
                            <MenuItem value="physical">Físico</MenuItem>
                            <MenuItem value="web">Web</MenuItem>
                            <MenuItem value="delivery">Delivery</MenuItem>
                          </TextField>
                        )}
                      />
                    }
                    help={
                      type === "web" || type === "delivery"
                        ? `${type === "web" ? "Web" : "Delivery"}: se fuerza “General (sin mesa)”.`
                        : null
                    }
                  />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FieldBlock
                    label="Canal de venta"
                    input={
                      <Controller
                        name="sales_channel_id"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            SelectProps={{
                              IconComponent: KeyboardArrowDownIcon,
                            }}
                          >
                            <MenuItem value="">
                              {filteredChannelOptions.length
                                ? "Selecciona..."
                                : "Sin canales disponibles"}
                            </MenuItem>
                            {filteredChannelOptions.map((c) => (
                              <MenuItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    }
                    help={
                      type === "physical"
                        ? "Físico: solo permite Salón."
                        : type === "delivery"
                        ? "Delivery: permite todos los canales menos Salón."
                        : "Web: solo permite Salón."
                    }
                  />

                  <FieldBlock
                    label="Mesa"
                    input={
                      <Controller
                        name="table_id"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            select
                            fullWidth
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            disabled={type !== "physical"}
                            SelectProps={{
                              IconComponent: KeyboardArrowDownIcon,
                            }}
                          >
                            <MenuItem value="">General (sin mesa)</MenuItem>
                            {filteredTableOptions.map((t) => (
                              <MenuItem key={t.id} value={String(t.id)}>
                                {t.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    }
                    help={
                      type !== "physical"
                        ? "Solo los QRs físicos pueden ligarse a una mesa."
                        : "Opcional. Si no eliges mesa, será un QR general."
                    }
                  />
                </Stack>

                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#EEF2FF",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: "#2D2D7A",
                    }}
                  >
                    ¿Qué crea este QR?
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 13,
                      color: "#2D2D7A",
                      lineHeight: 1.45,
                      fontWeight: 700,
                    }}
                  >
                    {getQrNoticeForCreate({
                      type,
                      tableId,
                      orderingMode: settings?.ordering_mode,
                    })}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "background.default",
                  }}
                >
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Controller
                        name="is_active"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={!!field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "text.primary",
                        }}
                      >
                        Crear como activo
                      </Typography>
                    }
                  />
                </Box>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={1}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={busy}
                    variant="outlined"
                    sx={{
                      minWidth: { xs: "100%", sm: 150 },
                      height: 44,
                      borderRadius: 2,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="submit"
                    disabled={busy || !canSubmit}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    {busy ? "Creando…" : "Crear QR"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}