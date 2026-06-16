import {
  Box, Card, FormControlLabel, IconButton, Paper, Stack, Switch, Tooltip, Typography,
} from "@mui/material";

import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import PaginationFooter from "../../common/PaginationFooter";

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

  if (qr?.blocked_by_plan) {
    return "QR bloqueado por plan";
  }

  return "";
}

function shouldDisableQrToggle({ qr, busy, canManageQr }) {
  if (busy) return true;
  if (!canManageQr) return true;

  const nextActive = !qr?.is_active;

  if (!nextActive) {
    return false;
  }

  return !!qr?.blocked_by_plan || !!qr?.blocked_by_attention_mode;
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
  typeLabelMap = {},
  busy = false,
  canManageQr = false,
  manageQrBlockReason = null,
  selectedBranchId = "",
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
              const typeLabel = typeLabelMap[qr.type] || qr.type;

              const typeDescription =
                qr.type === "web"
                  ? "Pedido por WhatsApp"
                  : qr.type === "delivery"
                  ? "Menú solo lectura"
                  : "Menú físico";

              const blockedByPlan = !!qr?.blocked_by_plan;
              const blockedByAttentionMode = !!qr?.blocked_by_attention_mode;
              const isBlocked = blockedByPlan || blockedByAttentionMode;
              const blockReason = getQrBlockReason(qr);
              const blockTitle = getQrBlockTitle(qr);
              const toggleDisabled = shouldDisableQrToggle({ qr, busy, canManageQr });

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
                              color: "text.secondary",
                              fontWeight: 700,
                            }}
                          >
                            {typeLabel} · {typeDescription}
                          </Typography>
                        </Box>

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

                      <Tooltip
                        title={
                          toggleDisabled
                            ? blockReason ||
                              manageQrBlockReason ||
                              "QR desactivado para esta sucursal."
                            : ""
                        }
                      >
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

                      {!canManageQr ? (
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "#8A5A00",
                            fontWeight: 800,
                            lineHeight: 1.45,
                          }}
                        >
                          {manageQrBlockReason || "QR desactivado para esta sucursal."}
                        </Typography>
                      ) : null}

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

                        <Tooltip title="Eliminar">
                          <IconButton
                            onClick={() => onDelete(qr)}
                            disabled={busy}
                            sx={iconDeleteSx}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
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