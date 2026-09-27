import React from "react";
import {
  Box, Button, Chip, Divider, Stack, Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import {
  formatRequestDate,
  getItemLabel,
  getKitchenStatusLabel,
  getOrderItemId,
  getReasonLabel,
  getRequestedQuantity,
} from "./waiterCancellationRequest.utils";

export default function WaiterCancellationRequestReview({
  request,
  items = [],
  hasStaleItems = false,
  loading = false,
  action = null,
  onReject,
  onApprove,
}) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const isFull = String(request?.type || "").toLowerCase() === "full";

  const reasonLabel = getReasonLabel(request?.reason_code);
  const reasonNote = String(request?.reason_note || "").trim();
  const requestedAt = formatRequestDate(request?.created_at);

  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      <Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip
            label={isFull ? "Cancelación total" : "Cancelación parcial"}
            size="small"
            sx={{ fontWeight: 800, bgcolor: alpha(primaryColor, 0.1), color: primaryColor }}
          />

          <Chip
            label={items.length === 1 ? "1 partida solicitada" : `${items.length} partidas solicitadas`}
            size="small"
            sx={{ bgcolor: "text.primary", color: "#fff", fontWeight: 800 }}
          />

          {hasStaleItems ? (
            <Chip label="Solicitud desactualizada" size="small" color="error" variant="outlined" sx={{ fontWeight: 800 }} />
          ) : null}
        </Stack>

        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
            borderRadius: 1,
          }}
        >
          <Stack spacing={1.25}>
            <InfoRow label="Mesa" value={request?.table_id ? `#${request.table_id}` : "—"} />
            <InfoRow label="Orden" value={request?.order_id ? `#${request.order_id}` : "—"} />
            <InfoRow label="Motivo" value={reasonLabel} />

            {reasonNote ? <InfoRow label="Nota" value={reasonNote} /> : null}
            {requestedAt ? <InfoRow label="Solicitada" value={requestedAt} /> : null}
          </Stack>
        </Box>

        {hasStaleItems ? (
          <Box
            role="alert"
            sx={{
              mt: 2,
              p: 1.5,
              border: "1px solid",
              borderColor: alpha(theme.palette.error.main, 0.24),
              bgcolor: alpha(theme.palette.error.main, 0.06),
              borderRadius: 1,
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "error.main", lineHeight: 1.5 }}>
              La comanda cambió después de que el cliente envió esta solicitud. Puedes rechazarla, pero no aprobarla con información desactualizada.
            </Typography>
          </Box>
        ) : null}

        <Stack spacing={1.25} sx={{ mt: 2 }}>
          {items.map((item) => {
            const orderItemId = getOrderItemId(item);
            const kitchenLabel = getKitchenStatusLabel(item?.kitchen_status);

            return (
              <Box
                key={`qr-cancellation-item-${orderItemId}`}
                sx={{
                  p: { xs: 1.5, sm: 1.75 },
                  border: "1px solid",
                  borderColor: item?.stale ? alpha(theme.palette.error.main, 0.28) : "divider",
                  bgcolor: item?.stale ? alpha(theme.palette.error.main, 0.04) : "background.paper",
                  borderRadius: 1,
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: "text.primary", lineHeight: 1.35 }}>
                        {getItemLabel(item)}
                      </Typography>

                      {kitchenLabel ? (
                        <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
                          Cocina: <strong>{kitchenLabel}</strong>
                        </Typography>
                      ) : null}
                    </Box>

                    <Chip
                      label={`Cant. ${getRequestedQuantity(item)}`}
                      size="small"
                      sx={{ flexShrink: 0, bgcolor: alpha(primaryColor, 0.1), color: primaryColor, fontWeight: 800 }}
                    />
                  </Stack>

                  {item?.stale ? (
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: "error.main", lineHeight: 1.45 }}>
                      {item.stale_message}
                    </Typography>
                  ) : null}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Divider sx={{ my: 2 }} />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
        <Button
            type="button"
            fullWidth
            variant="contained"
            color="error"
            disabled={loading}
            onClick={onReject}
            sx={{
                minHeight: 46,
                borderRadius: 2,
                fontWeight: 800,
                color: "#fff",
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
            }}
            >
            {loading && action === "reject" ? "Rechazando…" : "Rechazar solicitud"}
        </Button>

        <Button
          type="button"
          fullWidth
          variant="contained"
          color="primary"
          disabled={loading || hasStaleItems || items.length === 0}
          startIcon={<CheckRoundedIcon />}
          onClick={onApprove}
          sx={{ minHeight: 46, borderRadius: 2, fontWeight: 800, boxShadow: "none", "&:hover": { boxShadow: "none" } }}
        >
          {loading && action === "approve" ? "Aprobando…" : "Aprobar solicitud"}
        </Button>
      </Stack>
    </Stack>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography sx={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        sx={{
          minWidth: 0,
          fontSize: 13,
          fontWeight: 800,
          color: "text.primary",
          textAlign: "right",
          whiteSpace: "pre-line",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}