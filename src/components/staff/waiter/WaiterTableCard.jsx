import React, { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

function money(n) {
  const num = Number(n || 0);
  try {
    return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
  } catch {
    return `$${num.toFixed(2)}`;
  }
}

function stateVisual(uiState, orderStatus) {
  if (String(orderStatus || "") === "paying") {
    return {
      bg: "#FFF4E8",
      bd: "#FFC27A",
      fg: "#A75A00",
      label: "En proceso de pago",
    };
  }

  const map = {
    free: { bg: "#E6FFED", bd: "#8AE99C", fg: "#0A7A2F", label: "Libre" },
    call: { bg: "#FFF3CD", bd: "#FFE08A", fg: "#8A6D3B", label: "Llamando" },
    mine: { bg: "#E8F1FF", bd: "#95B9FF", fg: "#0B4DB3", label: "Atendiendo" },
    locked: { bg: "#F3F4F6", bd: "#D1D5DB", fg: "#374151", label: "Ocupada" },
    blocked: { bg: "#EFEFF3", bd: "#C7C7D0", fg: "#4B5563", label: "Bloqueada" },
    pending: {
      bg: "#FFF3CD",
      bd: "#FFE08A",
      fg: "#8A6D3B",
      label: "Comanda pendiente",
    },
  };

  return map[uiState] || map.free;
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "outlined",
  color = "primary",
  title,
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant}
      color={color}
      title={title}
      sx={{
        minHeight: 40,
        borderRadius: 2,
        fontWeight: 800,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Button>
  );
}

export default function WaiterTableCard({
  table,
  meta,
  payingBusyOrderId,
  onAttend,
  onRejectCall,
  onFinish,
  onReleaseSession,
  onMarkPaid,
  onAccept,
  onReject,
  onStartPayment,
  onOccupy,
  onFree,
  onCreateOrder,
  onViewOrder,
}) {
  const pending = table?.pending_order || null;
  const hasPending = !!pending?.id;

  const openOrder = table?.active_order || null;
  const hasOpenOrder = !!openOrder?.id;
  const openOrderId = Number(openOrder?.id || 0);
  const orderStatus = String(openOrder?.status || "");

  const uiState = String(table?.ui_state || "free");
  const visual = stateVisual(uiState, orderStatus);

  const session = table?.session || null;
  const hasDevice = !!session?.has_device;

  const orderingMode = String(
    table?.ordering_mode || meta?.ordering_mode || ""
  );

  const canAttend = !!table?.actions?.can_attend;
  const canFinish = !!table?.actions?.can_finish_attention;
  const canRejectCall = !!table?.actions?.can_reject_call;

  const canAccept = !!table?.actions?.can_accept_order && hasPending;
  const canReject = !!table?.actions?.can_reject_order && hasPending;
  const canMarkPaid = !!table?.actions?.can_mark_paid && hasOpenOrder;

  const canMarkOccupied = !!table?.actions?.can_mark_occupied;
  const canMarkFree = !!table?.actions?.can_mark_free;
  const canCreateOrder = !!table?.actions?.can_create_order && !hasOpenOrder;
  const canViewOrder = !!table?.actions?.can_view_order && hasOpenOrder;

  const showWaiterOnlyActions =
    orderingMode === "waiter_only" || orderingMode === "waiter";

  const isCalling = uiState === "call";
  const isMine = !!table?.is_mine || uiState === "mine";
  const isLockedLike = uiState === "locked" || uiState === "blocked";

  const belongsToMe =
    !!table?.is_mine ||
    (Number(table?.assigned_waiter_id || 0) > 0 &&
      Number(table?.assigned_waiter_id || 0) === Number(meta?.staff_id || 0));

  const isUnassignedTable = Number(table?.assigned_waiter_id || 0) === 0;

  const shouldShowOrderSummary = belongsToMe && hasOpenOrder;
  const showReleaseSession =
    belongsToMe && !!table?.actions?.can_release_session && hasOpenOrder;

  const showChargeButton =
    belongsToMe &&
    hasOpenOrder &&
    (orderStatus === "open" || orderStatus === "ready");

  const canChargeFromTable =
    belongsToMe &&
    !!table?.actions?.can_start_payment &&
    (orderStatus === "open" || orderStatus === "ready");

  const safeCanAttend =
    isCalling && canAttend && (belongsToMe || isUnassignedTable);

  const safeCanRejectCall =
    isCalling && canRejectCall && belongsToMe;

  const safeCanFinish =
    belongsToMe && isMine && canFinish;

  const safeCanMarkPaid =
    belongsToMe && canMarkPaid;

  const safeCanAccept =
    canAccept && !isLockedLike;

  const safeCanReject =
    canReject && !isLockedLike && (belongsToMe || isUnassignedTable);

  const statusChipColor = useMemo(() => {
    if (uiState === "free") return { bg: "#E7F8EB", color: "#0A7A2F" };
    if (uiState === "call") return { bg: "#FFF4D9", color: "#8A6D3B" };
    if (uiState === "mine") return { bg: "#EAF2FF", color: "#0B4DB3" };
    if (uiState === "blocked") return { bg: "#EFEFF3", color: "#4B5563" };
    if (uiState === "locked") return { bg: "#F3F4F6", color: "#374151" };
    return { bg: "#FFF4D9", color: "#8A6D3B" };
  }, [uiState]);

  return (
    <Card
      sx={{
        height: { xs: 360, md: 390 },
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: visual.bd,
        backgroundColor: visual.bg,
        borderRadius: 1,
        boxShadow: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1.5,
          borderBottom: "1px solid",
          borderColor: "rgba(0,0,0,0.05)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 900,
                lineHeight: 1,
                color: visual.fg,
                mb: 0.75,
                wordBreak: "break-word",
              }}
            >
              {table?.name || `Mesa #${table?.id}`}
            </Typography>

            <Chip
              label={visual.label}
              sx={{
                bgcolor: statusChipColor.bg,
                color: statusChipColor.color,
                fontWeight: 800,
              }}
            />
          </Box>

          <Stack alignItems="flex-end" spacing={0.5}>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              Asientos
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              {table?.seats ?? "—"}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "grid",
          gap: 1,
          minHeight: 86,
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Typography sx={{ fontSize: 13, color: "text.secondary", flex: 1 }}>
            {table?.ui_reason || "Sin novedad"}
          </Typography>

          <Typography
            sx={{
              fontSize: 13,
              color: "text.secondary",
              minWidth: 94,
              textAlign: "right",
            }}
          >
            QR:{" "}
            <strong style={{ color: "#3F3A52" }}>
              {session ? (hasDevice ? "Con sesión" : "Sin dispositivo") : "—"}
            </strong>
          </Typography>
        </Stack>

        {shouldShowOrderSummary ? (
          <Box
            sx={{
              background:
                orderStatus === "paying"
                  ? "rgba(255, 122, 0, 0.08)"
                  : "rgba(255,255,255,0.65)",
              border:
                orderStatus === "paying"
                  ? "1px solid rgba(255, 122, 0, 0.22)"
                  : "1px solid rgba(0,0,0,0.08)",
              borderRadius: 1,
              p: 1.5,
              display: "grid",
              gap: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 900,
                color: "text.primary",
                lineHeight: 1.25,
              }}
            >
              {orderStatus === "paying"
                ? `Comanda #${openOrder.id} · En proceso de pago`
                : `Comanda activa #${openOrder.id}`}
            </Typography>

            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              Total: <strong style={{ color: "#3F3A52" }}>{money(openOrder.total)}</strong>
            </Typography>

            {orderStatus === "paying" ? (
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#A75A00",
                  lineHeight: 1.45,
                }}
              >
                Esta cuenta ya fue enviada a caja. El cierre final lo realiza el cajero.
              </Typography>
            ) : null}
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          px: 2,
          pb: 2,
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        <Stack spacing={1.2}>
          {safeCanAttend ? (
            <ActionButton
              variant="contained"
              color="success"
              onClick={() => onAttend(table)}
              title="Atender llamada"
            >
              Atender
            </ActionButton>
          ) : null}

          {safeCanRejectCall ? (
            <ActionButton
              variant="contained"
              color="error"
              onClick={() => onRejectCall(table)}
              title="Rechazar llamada"
            >
              Rechazar
            </ActionButton>
          ) : null}

          {safeCanFinish ? (
            <ActionButton
              variant="outlined"
              color="inherit"
              onClick={() => onFinish(table)}
              title="Finalizar atención"
            >
              Finalizar
            </ActionButton>
          ) : null}

          {showWaiterOnlyActions && canMarkOccupied ? (
            <ActionButton
              variant="contained"
              color="info"
              onClick={() => onOccupy(table)}
              title="Marcar mesa como ocupada"
            >
              Ocupar
            </ActionButton>
          ) : null}

          {showWaiterOnlyActions && canMarkFree ? (
            <ActionButton
              variant="outlined"
              color="inherit"
              onClick={() => onFree(table)}
              title="Poner mesa como libre"
            >
              Liberar
            </ActionButton>
          ) : null}

          {showWaiterOnlyActions && canCreateOrder ? (
            <ActionButton
              variant="contained"
              color="primary"
              onClick={() => onCreateOrder(table)}
              title="Crear comanda"
            >
              Crear comanda
            </ActionButton>
          ) : null}

          {showWaiterOnlyActions && canViewOrder ? (
            <ActionButton
              variant="contained"
              color="primary"
              onClick={() => onViewOrder(table)}
              title="Ver comanda y agregar productos"
            >
              Ver comanda
            </ActionButton>
          ) : null}

          {showReleaseSession ? (
            <ActionButton
              variant="outlined"
              color="warning"
              onClick={() => onReleaseSession(table)}
              disabled={!table?.actions?.can_release_session_enabled}
              title={
                table?.actions?.can_release_session_enabled
                  ? "Liberar sesión"
                  : "No hay dispositivo vinculado"
              }
            >
              Liberar sesión
            </ActionButton>
          ) : null}

          {showChargeButton ? (
            <ActionButton
              variant="contained"
              color="primary"
              onClick={() => onStartPayment(openOrderId)}
              disabled={
                !canChargeFromTable || payingBusyOrderId === openOrderId
              }
              title="Enviar esta cuenta al panel de caja"
            >
              {payingBusyOrderId === openOrderId ? "Enviando…" : "Enviar a caja"}
            </ActionButton>
          ) : null}

          {belongsToMe && hasOpenOrder && orderStatus === "paying" ? (
            <ActionButton
              variant="outlined"
              color="warning"
              disabled
              title="La cuenta ya fue enviada al cajero"
            >
              En caja
            </ActionButton>
          ) : null}

          {safeCanMarkPaid ? (
            <ActionButton
              variant="contained"
              color="success"
              onClick={() => onMarkPaid(table)}
              title="El cierre final lo realiza caja"
            >
              Pagado
            </ActionButton>
          ) : null}

          {safeCanAccept ? (
            <ActionButton
              variant="contained"
              color="success"
              onClick={() => onAccept(table)}
              title="Aceptar comanda"
            >
              Aceptar
            </ActionButton>
          ) : null}

          {safeCanReject ? (
            <ActionButton
              variant="contained"
              color="error"
              onClick={() => onReject(table)}
              title="Rechazar comanda"
            >
              Rechazar
            </ActionButton>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}
