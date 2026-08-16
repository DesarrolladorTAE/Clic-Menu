import {
  Box, Card, FormControlLabel, IconButton, Paper, Stack, Switch, Tooltip, Typography, Button
} from "@mui/material";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import PaginationFooter from "../../common/PaginationFooter";

function getQrSalesChannelCode(qr) {
  return String(qr?.sales_channel?.code || "").trim().toUpperCase();
}

function isOnlineOrderQr(qr) {
  return qr?.type === "web" && getQrSalesChannelCode(qr) === "ONLINE_ORDER";
}

function getQrBlockReason(qr) {
  if (qr?.blocked_reason) {
    return qr.blocked_reason;
  }

  if (qr?.blocked_by_attention_mode) {
    return "El modo de atención directa no permite activar QR físico ligado a mesa.";
  }

  if (qr?.blocked_by_plan) {
    return "Tu plan actual no permite activar este QR.";
  }

  return "";
}

function getQrBlockTitle(qr) {
  if (qr?.blocked_by_attention_mode) {
    return "QR bloqueado por modo de atención";
  }

  if (isOnlineOrderQr(qr) && qr?.blocked_by_plan) {
    return "No se puede activar";
  }

  if (qr?.blocked_by_plan) {
    return "QR bloqueado por plan";
  }

  return "";
}

function getQrPurposeMeta(qr, typeLabelMap = {}) {
  if (qr?.type === "physical" && qr?.table_id) {
    return {
      title: "QR de mesa",
      description: qr?.table?.name
        ? `Código para ${qr.table.name}`
        : "Código para una mesa específica",
    };
  }

  if (qr?.type === "physical") {
    return {
      title: "Vista general",
      description: "Menú general del salón",
    };
  }

  if (qr?.type === "web") {
    const channelCode = getQrSalesChannelCode(qr);

    if (channelCode === "ONLINE_ORDER") {
      return {
        title: "Pedidos en línea",
        description: "El cliente realiza su pedido directamente desde el menú digital",
      };
    }

    if (channelCode === "WHATSAPP") {
      return {
        title: "Pedidos por WhatsApp",
        description: "El cliente selecciona y envía su pedido por WhatsApp",
      };
    }

    return {
      title: "QR web",
      description: "Código QR con acceso público al menú digital",
    };
  }

  if (qr?.type === "delivery") {
    return {
      title: "Canal específico",
      description: qr?.sales_channel?.name
        ? `Menú de solo lectura para ${qr.sales_channel.name}`
        : "Menú de solo lectura para otro canal de venta",
    };
  }

  return {
    title: typeLabelMap[qr?.type] || qr?.type || "QR",
    description: "Código QR configurado para esta sucursal",
  };
}

function isCustomerAssistedActivationBlocked({
  qr,
  qrUiMeta,
  orderingMode,
}) {
  const intendedOrderingMode = String(
    qr?.intended_ordering_mode || orderingMode || ""
  );

  return (
    !qr?.is_active &&
    qr?.type === "physical" &&
    !!qr?.table_id &&
    intendedOrderingMode === "customer_assisted" &&
    qrUiMeta?.customer_assisted_allowed === false
  );
}

function shouldDisableQrToggle({ qr, busy, qrUiMeta, orderingMode }) {
  if (busy) return true;

  const nextActive = !qr?.is_active;
  const operationLock = qr?.operation_lock || {};

  if (nextActive) {
    if (operationLock?.can_update === false) return true;
    if (qr?.blocked_by_plan || qr?.blocked_by_attention_mode) return true;

    return isCustomerAssistedActivationBlocked({
      qr,
      qrUiMeta,
      orderingMode,
    });
  }

  return operationLock?.can_deactivate === false;
}

function getQrToggleDisabledReason({ qr, busy, qrUiMeta, orderingMode }) {
  if (busy) {
    return "Espera a que termine la operación actual.";
  }

  const nextActive = !qr?.is_active;
  const operationLock = qr?.operation_lock || {};

  if (nextActive && operationLock?.can_update === false) {
    return (
      operationLock?.reason ||
      "No puedes activar este QR mientras la mesa tenga una operación en curso."
    );
  }

  if (!nextActive && operationLock?.can_deactivate === false) {
    return (
      operationLock?.reason ||
      "No puedes desactivar este QR mientras la mesa tenga una operación en curso."
    );
  }

  if (nextActive && qr?.blocked_by_attention_mode) {
    return getQrBlockReason(qr);
  }

  if (nextActive && qr?.blocked_by_plan) {
    return getQrBlockReason(qr);
  }

  if (
    nextActive &&
    isCustomerAssistedActivationBlocked({
      qr,
      qrUiMeta,
      orderingMode,
    })
  ) {
    return (
      qrUiMeta?.qr_ordering_blocked_reason ||
      "Tu plan actual ya no permite activar QRs de mesa para Cliente asistido."
    );
  }

  return "";
}

function buildShareUrl(qr) {
  return `https://api.clicmenu.com.mx/share/menu/${qr.token}`;
}

export default function BranchQrListPanel({
  items = [],
  total = 0,
  page = 1,
  totalPages = 1,
  startItem = 0,
  endItem = 0,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  onCopy,
  onToggleActive,
  onDelete,
  onOpen,
  onExport,
  typeLabelMap = {},
  busy = false,
  selectedBranchId = "",
  qrUiMeta = null,
  orderingMode = "",
}) {
  return (
    <Paper
      sx={{
        p: 0,
        overflow: "hidden",
        borderRadius: 0,
        backgroundColor: "background.paper",
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
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Lista de QRs
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              fontWeight: 700,
            }}
          >
            {total} resultado(s)
          </Typography>
        </Box>

        <Box>
          <Tooltip title="Descargar QRs">
            <Button
              variant="contained"
              onClick={onExport}
              disabled={!selectedBranchId}
              sx={{
                height: 36,
                fontWeight: 800,
                borderRadius: 1.5,
              }}
            >
              Descargar
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {!selectedBranchId ? (
        <Box
          sx={{
            px: 3,
            py: 5,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Selecciona una sucursal
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            Primero elige una sucursal para visualizar y administrar sus códigos QR.
          </Typography>
        </Box>
      ) : total === 0 ? (
        <Box
          sx={{
            px: 3,
            py: 5,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            No hay QRs registrados
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: "text.secondary",
              fontSize: 14,
            }}
          >
            Crea tu primer QR disponible para esta sucursal según su configuración operativa y plan actual.
          </Typography>
        </Box>
      ) : (
        <>

          <Box
            sx={{
              p: 2,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {items.map((qr) => {
              const channelName = qr?.sales_channel?.name || "—";
              const tableName = qr?.table?.name || "General";
              const purposeMeta = getQrPurposeMeta(qr, typeLabelMap);

              const blockedByPlan = !!qr?.blocked_by_plan;
              const blockedByAttentionMode = !!qr?.blocked_by_attention_mode;
              const isBlocked = blockedByPlan || blockedByAttentionMode;

              const operationLock = qr?.operation_lock || {};
              const operationLocked = operationLock?.locked === true;

              const blockReason = getQrBlockReason(qr);
              const blockTitle = getQrBlockTitle(qr);

              const toggleDisabled = shouldDisableQrToggle({
                qr,
                busy,
                qrUiMeta,
                orderingMode,
              });

              const toggleDisabledReason = getQrToggleDisabledReason({
                qr,
                busy,
                qrUiMeta,
                orderingMode,
              });

              const deleteDisabled = busy || operationLock?.can_delete === false;

              const deleteDisabledReason = busy
                ? "Espera a que termine la operación actual."
                : operationLock?.reason ||
                  "No puedes eliminar este QR mientras la mesa tenga una operación en curso.";

              return (
                <Card
                  key={qr.id}
                  sx={{
                    borderRadius: 1,
                    boxShadow: "none",
                    border: "1px solid",
                    borderColor: isBlocked ? "#F3D48B" : "divider",
                    backgroundColor: "#fff",
                    minHeight: 360,
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ p: 2 }}>
                    <Stack spacing={1.75}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 16,
                              fontWeight: 900,
                              color: "text.primary",
                              lineHeight: 1.3,
                              wordBreak: "break-word",
                            }}
                          >
                            {qr.name}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.5,
                              fontSize: 13,
                              color: "primary.main",
                              fontWeight: 900,
                            }}
                          >
                            {purposeMeta.title}
                          </Typography>

                          <Typography
                            sx={{
                              mt: 0.25,
                              fontSize: 12.5,
                              color: "text.secondary",
                              fontWeight: 600,
                              lineHeight: 1.4,
                            }}
                          >
                            {purposeMeta.description}
                          </Typography>
                        </Box>

                        <Stack spacing={0.75} alignItems="flex-end">
                          <Typography
                            sx={{
                              px: 1.25,
                              py: 0.5,
                              borderRadius: 999,
                              fontSize: 12,
                              fontWeight: 800,
                              bgcolor: qr.is_active ? "#EAF8EE" : "#FFF0EE",
                              color: qr.is_active ? "#0A7A2F" : "#A10000",
                              border: "1px solid",
                              borderColor: qr.is_active ? "#B8E2C3" : "#F6C2B8",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {qr.is_active ? "Activo" : "Inactivo"}
                          </Typography>

                          {operationLocked ? (
                            <Typography
                              sx={{
                                px: 1.1,
                                py: 0.4,
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 800,
                                bgcolor: "#EEF2F7",
                                color: "#475569",
                                border: "1px solid #CBD5E1",
                                whiteSpace: "nowrap",
                              }}
                            >
                              En operación
                            </Typography>
                          ) : null}
                        </Stack>
                      </Stack>

                      <Box
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          backgroundColor: "background.default",
                          p: 2,
                          display: "grid",
                          placeItems: "center",
                          minHeight: 190,
                        }}
                      >
                        {qr.qr_image_url ? (
                          <Box
                            component="img"
                            src={qr.qr_image_url}
                            alt={qr.name || "QR"}
                            sx={{
                              width: 170,
                              height: 170,
                              objectFit: "contain",
                              display: "block",
                            }}
                          />
                        ) : (
                          <Typography
                            sx={{
                              fontSize: 13,
                              color: "text.secondary",
                              fontWeight: 700,
                              textAlign: "center",
                            }}
                          >
                            Imagen QR no disponible
                          </Typography>
                        )}
                      </Box>

                      <Stack spacing={1}>
                        <InfoRow label="Canal" value={channelName} />
                        <InfoRow label="Mesa" value={tableName} />
                        <InfoRow label="URL" value={qr.public_url} long />
                      </Stack>

                      <Tooltip title={toggleDisabled ? toggleDisabledReason : ""}>
                        <Box sx={{ width: "fit-content" }}>
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                checked={!!qr.is_active}
                                onChange={() => onToggleActive(qr)}
                                disabled={toggleDisabled}
                                color="primary"
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
                                {qr.is_active ? "Activo" : "Inactivo"}
                              </Typography>
                            }
                          />
                        </Box>
                      </Tooltip>

                      {isBlocked ? (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#8A5A00",
                            fontWeight: 800,
                            lineHeight: 1.45,
                          }}
                        >
                          {blockTitle ? `${blockTitle}: ` : ""}
                          {blockReason || "Este QR no puede activarse con la configuración actual."}
                        </Typography>
                      ) : null}

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Tooltip title="Copiar URL para compartir">
                          <IconButton
                            onClick={() => onCopy(buildShareUrl(qr))}
                            sx={iconNeutralSx}
                          >
                            <ContentCopyOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Abrir">
                          <IconButton
                            onClick={() => onOpen(qr.public_url)}
                            sx={iconPrimarySx}
                          >
                            <OpenInNewOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={deleteDisabled ? deleteDisabledReason : "Eliminar"}>
                          <Box component="span" sx={{ display: "inline-flex" }}>
                            <IconButton
                              onClick={() => onDelete(qr)}
                              disabled={deleteDisabled}
                              sx={iconDeleteSx}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                </Card>
              );
            })}
          </Box>
          
          <PaginationFooter
            page={page}
            totalPages={totalPages}
            startItem={startItem}
            endItem={endItem}
            total={total}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={onPrev}
            onNext={onNext}
            itemLabel="QRs"
          />
        </>
      )}
    </Paper>
  );
}

function InfoRow({ label, value, long = false }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.25,
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.45,
          wordBreak: long ? "break-all" : "break-word",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

const iconNeutralSx = {
  width: 40,
  height: 40,
  bgcolor: "#fff",
  color: "text.primary",
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "divider",
  "&:hover": {
    bgcolor: "#f7f7f7",
  },
};

const iconPrimarySx = {
  width: 40,
  height: 40,
  bgcolor: "#EAF1FF",
  color: "primary.main",
  borderRadius: 1.5,
  border: "1px solid",
  borderColor: "#CFCFFF",
  "&:hover": {
    bgcolor: "#E1E9FF",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};