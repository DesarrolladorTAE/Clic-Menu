import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box, Button, ButtonBase, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack,
  Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import QrCode2RoundedIcon from "@mui/icons-material/QrCode2Rounded";
import TableRestaurantRoundedIcon from "@mui/icons-material/TableRestaurantRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const TERRACOTTA = "#B86149";

function getQrNoticeForCreate({
  qrPurpose,
  tableId,
  salesChannelId,
  tableOptions,
  specificChannelOptions,
  orderingMode,
}) {
  if (qrPurpose === "general") {
    return "Se creará una Vista general con el menú del salón, sin mesa vinculada.";
  }

  if (qrPurpose === "table") {
    const table = tableOptions.find(
      (item) => Number(item.id) === Number(tableId)
    );

    if (!table) {
      return "Selecciona la mesa que utilizará este código QR.";
    }

    return String(orderingMode) === "customer_assisted"
      ? `Se creará un QR para ${table.name}, vinculado al modo Cliente asistido.`
      : `Se creará un QR para ${table.name}, vinculado al modo Solo mesero.`;
  }

  if (qrPurpose === "whatsapp") {
    return "Se creará un QR para que el cliente consulte el menú, seleccione productos y envíe su pedido por WhatsApp.";
  }

  if (qrPurpose === "online_order") {
    return "Se creará un QR para recibir órdenes sin mesa vinculada y permitir que el cliente consulte su avance mediante un enlace de seguimiento.";
  }

  if (qrPurpose === "channel") {
    const channel = specificChannelOptions.find(
      (item) => Number(item.id) === Number(salesChannelId)
    );

    return channel
      ? `Se creará un menú de solo lectura para el canal ${channel.name}.`
      : "Selecciona el canal de venta para el que deseas crear este QR.";
  }

  return "Selecciona una de las opciones para definir qué función tendrá este código QR.";
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

function QrPurposeCard({
  value,
  selected,
  disabled = false,
  icon,
  title,
  description,
  disabledReason = "",
  onSelect,
}) {
  const theme = useTheme();

  return (
    <ButtonBase
      onClick={() => onSelect(value)}
      disabled={disabled}
      sx={{
        width: "100%",
        height: "100%",
        textAlign: "left",
        justifyContent: "stretch",
        borderRadius: 2,
        overflow: "hidden",
        opacity: disabled ? 0.58 : 1,
      }}
    >
      <Box
        sx={{
          width: "100%",
          minHeight: 152,
          p: 2,
          borderRadius: 2,
          border: "2px solid",
          borderColor: selected
            ? TERRACOTTA
            : disabled
            ? "divider"
            : "divider",
          bgcolor: selected
            ? alpha(theme.palette.primary.main, 0.06)
            : "background.paper",
          boxShadow: selected
            ? `0 0 0 3px ${alpha(TERRACOTTA, 0.12)}`
            : "none",
          transition: "border-color 150ms ease, background-color 150ms ease, box-shadow 150ms ease",
          position: "relative",
          "&:hover": disabled
            ? {}
            : {
                borderColor: selected
                  ? TERRACOTTA
                  : theme.palette.primary.main,
                bgcolor: selected
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.primary.main, 0.025),
              },
        }}
      >
        {selected ? (
          <CheckCircleRoundedIcon
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              fontSize: 22,
              color: TERRACOTTA,
            }}
          />
        ) : null}

        <Stack spacing={1.25}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              display: "grid",
              placeItems: "center",
              bgcolor: selected
                ? TERRACOTTA
                : alpha(theme.palette.primary.main, 0.09),
              color: selected ? "#fff" : "primary.main",
              transition: "background-color 150ms ease, color 150ms ease",
            }}
          >
            {icon}
          </Box>

          <Box sx={{ pr: selected ? 3 : 0 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 900,
                color: selected ? "primary.main" : "text.primary",
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                fontSize: 12.5,
                color: "text.secondary",
                lineHeight: 1.45,
              }}
            >
              {description}
            </Typography>
          </Box>

          {disabled && disabledReason ? (
            <Typography
              sx={{
                fontSize: 11.5,
                fontWeight: 800,
                color: "text.secondary",
                lineHeight: 1.4,
              }}
            >
              {disabledReason}
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </ButtonBase>
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
  whatsappChannel,
  onlineOrderChannel,
  specificChannelOptions = [],
  tableOptions = [],
  qrUiMeta = null,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isDirectAttentionMode = qrUiMeta?.attention_mode === "direct";

  const onlineOrderQrMeta = qrUiMeta?.online_order_qr || {};
  const onlineOrderCanCreateInactive = onlineOrderQrMeta?.can_create_inactive !== false;
  const onlineOrderCanActivate = onlineOrderQrMeta?.can_activate === true;
  const onlineOrderBlockedReason = onlineOrderQrMeta?.blocked_reason ||
    "Completa la configuración de Pedidos en línea para poder activar este QR.";
  
  const availableTableOptions = useMemo(() => {
    return (tableOptions || []).filter(
      (table) => table?.operation_lock?.locked !== true
    );
  }, [tableOptions]);

  const isCustomerAssistedMode =
    String(settings?.ordering_mode || "") === "customer_assisted";

  const customerAssistedQrBlocked =
    isCustomerAssistedMode &&
    qrUiMeta?.customer_assisted_allowed === false;

  const availableQrTypes = useMemo(() => {
    const options = Array.isArray(qrUiMeta?.qr_type_options)
      ? qrUiMeta.qr_type_options
      : [{ value: "physical" }];

    return new Set(
      options
        .map((item) => String(item?.value || ""))
        .filter(Boolean)
    );
  }, [qrUiMeta]);

  const generalAvailable =
    availableQrTypes.has("physical") &&
    qrUiMeta?.physical_general_qr_allowed !== false &&
    !!salonChannel?.id;

  const tableAvailable =
    availableQrTypes.has("physical") &&
    !isDirectAttentionMode &&
    qrUiMeta?.table_selector_visible !== false &&
    qrUiMeta?.physical_table_qr_allowed !== false &&
    !!salonChannel?.id &&
    !customerAssistedQrBlocked &&
    availableTableOptions.length > 0;

  const whatsappAvailable =
    availableQrTypes.has("web") &&
    qrUiMeta?.qr_web_whatsapp_allowed !== false &&
    !!whatsappChannel?.id;

  const onlineOrderAvailable =
    availableQrTypes.has("web") &&
    !!onlineOrderChannel?.id &&
    onlineOrderCanCreateInactive;

  const specificChannelAvailable =
    availableQrTypes.has("delivery") &&
    !!qrUiMeta?.qr_readonly_by_channel_allowed &&
    specificChannelOptions.length > 0;

  const defaultValues = useMemo(
    () => ({
      name: "",
      qrPurpose: "",
      table_id: "",
      sales_channel_id: "",
      is_active: true,
    }),
    []
  );

  const { control, watch, reset, setValue, handleSubmit } = useForm({
    defaultValues,
    mode: "onChange",
  });

  const nameValue = watch("name");
  const qrPurpose = watch("qrPurpose");
  const tableId = watch("table_id");
  const salesChannelId = watch("sales_channel_id");

  const selectedTableOption = useMemo(() => {
    if (!tableId) return null;

    return (
      tableOptions.find((table) => Number(table.id) === Number(tableId)) || null
    );
  }, [tableOptions, tableId]);

  const selectedTableAvailable =
    !!selectedTableOption &&
    selectedTableOption?.operation_lock?.locked !== true;

  const purposeOptions = [
    {
      value: "general",
      title: "Vista general",
      description: "Menú general del salón, sin mesa vinculada.",
      icon: <QrCode2RoundedIcon />,
      available: generalAvailable,
      disabledReason: !salonChannel?.id
        ? "No se encontró el canal SALÓN."
        : "No disponible con la configuración actual.",
    },
    {
      value: "table",
      title: "QR de mesa",
      description: "Código QR para una mesa específica.",
      icon: <TableRestaurantRoundedIcon />,
      available: tableAvailable,
      disabledReason: isDirectAttentionMode
        ? "No disponible en modo de atención directa."
        : !salonChannel?.id
        ? "No se encontró el canal SALÓN."
        : qrUiMeta?.physical_table_qr_allowed === false
        ? "La configuración actual no permite QRs ligados a mesa."
        : customerAssistedQrBlocked
        ? qrUiMeta?.qr_ordering_blocked_reason ||
          "No disponible con el plan actual."
        : tableOptions.length === 0
        ? "No hay mesas disponibles en esta sucursal."
        : availableTableOptions.length === 0
        ? "No hay mesas disponibles para crear un QR en este momento."
        : "No disponible con la configuración actual.",
    },
    {
      value: "whatsapp",
      title: "Pedidos por WhatsApp",
      description: "El cliente selecciona productos y envía su pedido por WhatsApp.",
      icon: <ChatRoundedIcon />,
      available: whatsappAvailable,
      disabledReason: !whatsappChannel?.id
        ? "No se encontró el canal WHATSAPP."
        : qrUiMeta?.qr_web_whatsapp_blocked_reason ||
          "No disponible con la configuración actual.",
    },
    {
      value: "online_order",
      title: "Pedidos en línea",
      description: "El cliente realiza su orden (sin mesa vinculada) y puede consultar su avance desde un enlace de seguimiento.",
      icon: <ShoppingBagRoundedIcon />,
      available: onlineOrderAvailable,
      disabledReason: !onlineOrderChannel?.id
        ? "No se encontró el canal ONLINE_ORDER."
        : !onlineOrderCanCreateInactive
        ? "No disponible con la configuración actual."
        : "",
    },
    {
      value: "channel",
      title: "Canal específico",
      description: "Menú de solo lectura para otro canal de venta.",
      icon: <HubRoundedIcon />,
      available: specificChannelAvailable,
      disabledReason: !qrUiMeta?.qr_readonly_by_channel_allowed
        ? qrUiMeta?.qr_readonly_by_channel_blocked_reason || "No disponible con el plan actual."
        : specificChannelOptions.length === 0
        ? "No hay canales adicionales disponibles en esta sucursal."
        : "No disponible con la configuración actual.",
    },
  ];

  const canSubmit = useMemo(() => {
    const hasName = String(nameValue || "").trim().length > 0;

    if (!hasName || !qrPurpose) {
      return false;
    }

    if (qrPurpose === "general") {
      return generalAvailable;
    }

    if (qrPurpose === "table") {
      return tableAvailable && !!tableId && selectedTableAvailable;
    }

    if (qrPurpose === "whatsapp") {
      return whatsappAvailable;
    }

    if (qrPurpose === "online_order") {
      return onlineOrderAvailable;
    }

    if (qrPurpose === "channel") {
      return specificChannelAvailable && !!salesChannelId;
    }

    return false;
  }, [
    nameValue,
    qrPurpose,
    tableId,
    salesChannelId,
    generalAvailable,
    tableAvailable,
    selectedTableAvailable,
    whatsappAvailable,
    onlineOrderAvailable,
    specificChannelAvailable,
  ]);

  const selectPurpose = (purpose) => {
    const option = purposeOptions.find((item) => item.value === purpose);

    if (!option?.available) {
      return;
    }

    setValue("qrPurpose", purpose, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (purpose !== "table") {
      setValue("table_id", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    if (purpose !== "channel") {
      setValue("sales_channel_id", "", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  useEffect(() => {
    if (!open) return;
    reset(defaultValues);
  }, [open, reset, defaultValues]);

  useEffect(() => {
    if (!open || qrPurpose !== "online_order" || onlineOrderCanActivate) return;

    setValue("is_active", false, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [open, qrPurpose, onlineOrderCanActivate, setValue]);

  useEffect(() => {
    if (!open || qrPurpose !== "table" || !tableId) return;
    if (selectedTableAvailable) return;

    setValue("table_id", "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [
    open,
    qrPurpose,
    tableId,
    selectedTableAvailable,
    setValue,
  ]);

  useEffect(() => {
    if (!open || !qrPurpose) return;

    const selectedOption = purposeOptions.find(
      (item) => item.value === qrPurpose
    );

    if (!selectedOption?.available) {
      setValue("qrPurpose", "");
      setValue("table_id", "");
      setValue("sales_channel_id", "");
    }
  }, [
    open,
    qrPurpose,
    generalAvailable,
    tableAvailable,
    whatsappAvailable,
    onlineOrderAvailable,
    specificChannelAvailable,
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
              Genera token, imagen SVG y URL pública para{" "}
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
                          placeholder='Ej. "Menú general", "Mesa 4" o "Pedidos WhatsApp"'
                        />
                      )}
                    />
                  }
                  help="Usa un nombre corto que te permita identificar fácilmente este código QR."
                />

                <Box>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "text.primary",
                    }}
                  >
                    ¿Qué QR deseas crear?
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "text.secondary",
                      lineHeight: 1.5,
                    }}
                  >
                    Selecciona una opción. El tipo y el canal correspondiente se configurarán automáticamente.
                  </Typography>
                </Box>

                <Controller
                  name="qrPurpose"
                  control={control}
                  render={() => (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(0, 1fr))",
                        },
                        gap: 1.5,
                      }}
                    >
                      {purposeOptions.map((option) => (
                        <Box
                          key={option.value}
                          sx={{
                            height: "100%",
                            gridColumn: option.value === "channel"
                              ? { xs: "auto", sm: "1 / -1" }
                              : "auto",
                          }}
                        >
                          <QrPurposeCard
                            value={option.value}
                            selected={qrPurpose === option.value}
                            disabled={!option.available}
                            icon={option.icon}
                            title={option.title}
                            description={option.description}
                            disabledReason={option.disabledReason}
                            onSelect={selectPurpose}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                />

                {qrPurpose === "table" ? (
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
                            SelectProps={{
                              IconComponent: KeyboardArrowDownIcon,
                            }}
                          >
                            <MenuItem value="">Selecciona una mesa...</MenuItem>

                            {tableOptions.map((table) => {
                              const operationLocked = table?.operation_lock?.locked === true;

                              return (
                                <MenuItem
                                  key={table.id}
                                  value={String(table.id)}
                                  disabled={operationLocked}
                                >
                                  {table.name}
                                  {operationLocked ? " — En operación" : ""}
                                </MenuItem>
                              );
                            })}
                          </TextField>
                        )}
                      />
                    }
                    help="Este QR quedará ligado únicamente a la mesa seleccionada. Las mesas en operación no pueden seleccionarse."
                  />
                ) : null}

                {qrPurpose === "channel" ? (
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
                            <MenuItem value="">Selecciona un canal...</MenuItem>

                            {specificChannelOptions.map((channel) => (
                              <MenuItem key={channel.id} value={String(channel.id)}>
                                {channel.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    }
                    help="Solo aparecen canales adicionales activos y disponibles para esta sucursal."
                  />
                ) : null}

                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    bgcolor: alpha(theme.palette.primary.main, 0.055),
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 900,
                      color: "primary.main"
                    }}
                  >
                    ¿Qué crea este QR?
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 13,
                      color: "text.primary",
                      lineHeight: 1.45,
                      fontWeight: 700,
                    }}
                  >
                    {getQrNoticeForCreate({
                      qrPurpose,
                      tableId,
                      salesChannelId,
                      tableOptions,
                      specificChannelOptions,
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
                            disabled={qrPurpose === "online_order" && !onlineOrderCanActivate}
                            color="primary"
                          />
                        )}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
                        Crear como activo
                      </Typography>
                    }
                  />

                  {qrPurpose === "online_order" && !onlineOrderCanActivate ? (
                    <Typography
                      sx={{
                        mt: 1,
                        pt: 1,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        fontSize: 12.5,
                        color: "#8A5A00",
                        lineHeight: 1.5,
                      }}
                    >
                      <Box component="span" sx={{ fontWeight: 800 }}>
                        Este QR puede crearse ahora, pero permanecerá inactivo.
                      </Box>{" "}
                      {onlineOrderBlockedReason}
                    </Typography>
                  ) : null}
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