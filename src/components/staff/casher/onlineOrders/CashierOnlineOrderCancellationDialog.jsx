import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, CircularProgress, FormControlLabel,
  MenuItem, Radio, RadioGroup, Stack, TextField, Typography,
} from "@mui/material";

import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import CashierDialogShell from "../shared/CashierDialogShell";
import { ONLINE_ORDER_CANCELLATION_REASONS } from "./onlineOrderDisplay";

export default function CashierOnlineOrderCancellationDialog({
  open,
  order,
  authorizers = [],
  loadingAuthorizers = false,
  submitting = false,
  onClose,
  onConfirm,
}) {
  const [reasonCode, setReasonCode] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [authorizerUserId, setAuthorizerUserId] = useState("");
  const [pin, setPin] = useState("");
  const [physicalDecisions, setPhysicalDecisions] = useState({});

  const safeAuthorizers = useMemo(
    () => (Array.isArray(authorizers) ? authorizers : []),
    [authorizers]
  );

  const physicalProducts = useMemo(() => {
    const products = Array.isArray(order?.products) ? order.products : [];

    return products.filter((item) => {
      const guide = item?.cancellation_physical;
      return Number(item?.effective_quantity || 0) > 0 && guide?.requires_reuse_intent === true;
    });
  }, [order?.products]);

  useEffect(() => {
    if (!open) return;

    setReasonCode("");
    setReasonNote("");
    setAuthorizerUserId("");
    setPin("");
    setPhysicalDecisions({});
  }, [open, order?.id]);

  const allPhysicalDecisionsReady = physicalProducts.every((item) => {
    const decision = resolvePhysicalDecision(item, physicalDecisions);
    return decision === "reuse" || decision === "discard";
  });

  const canSubmit =
    reasonCode !== "" &&
    Number(authorizerUserId) > 0 &&
    pin.trim() !== "" &&
    allPhysicalDecisionsReady &&
    safeAuthorizers.length > 0 &&
    !loadingAuthorizers &&
    !submitting;

  const handlePhysicalDecision = (orderItemId, value) => {
    setPhysicalDecisions((previous) => ({
      ...previous,
      [String(orderItemId)]: value,
    }));
  };

  const handleConfirm = () => {
    if (!canSubmit) return;

    const items = physicalProducts.map((item) => ({
      order_item_id: Number(item.id),
      reuse_intent: resolvePhysicalDecision(item, physicalDecisions),
    }));

    onConfirm?.({
      reason_code: reasonCode,
      reason_note: reasonNote.trim() || null,
      items,
      authorizer_user_id: Number(authorizerUserId),
      pin: pin.trim(),
    });
  };

  return (
    <CashierDialogShell
      open={open}
      title="Cancelar pedido"
      description="Confirma la cancelación completa de este Pedido en línea."
      icon={<CloseRoundedIcon />}
      busy={submitting}
      maxWidth="md"
      onClose={onClose}
    >
      <Card sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, boxShadow: "none" }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, "&:last-child": { pb: { xs: 2, sm: 3 } } }}>
          <Stack spacing={3}>
            <Alert severity="warning" variant="outlined">
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                Se cancelará el pedido completo.
              </Typography>

              <Typography sx={{ mt: 0.4, fontSize: 13, lineHeight: 1.5 }}>
                No es posible cancelar productos individuales desde Pedidos en línea.
              </Typography>
            </Alert>

            <Stack spacing={0.4}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.secondary" }}>
                Pedido
              </Typography>

              <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary", wordBreak: "break-word" }}>
                {order?.public_number || "Sin número"}
              </Typography>

              <Typography sx={{ fontSize: 14, color: "text.secondary", wordBreak: "break-word" }}>
                {order?.order_name || "Cliente sin nombre"}
              </Typography>
            </Stack>

            <SectionBlock
              number="1"
              title="Motivo"
              description="Selecciona el motivo de la cancelación y agrega una observación si es necesario."
            >
              <Stack spacing={2}>
                <FieldBlock
                  label="Motivo *"
                  input={
                    <TextField
                      select
                      fullWidth
                      value={reasonCode}
                      onChange={(event) => setReasonCode(event.target.value)}
                      disabled={submitting}
                    >
                      {ONLINE_ORDER_CANCELLATION_REASONS.map((reason) => (
                        <MenuItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                />

                <FieldBlock
                  label="Observaciones"
                  help={`${reasonNote.length}/500`}
                  input={
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      value={reasonNote}
                      onChange={(event) => setReasonNote(event.target.value.slice(0, 500))}
                      inputProps={{ maxLength: 500 }}
                      disabled={submitting}
                      placeholder="Agrega información adicional sobre la cancelación"
                    />
                  }
                />
              </Stack>
            </SectionBlock>

            <SectionBlock
              number="2"
              title="Resolución física"
              description={
                physicalProducts.length > 0
                  ? "Define qué ocurrirá con los productos que ya tienen una condición física que debe resolverse."
                  : "Este pedido no tiene productos que requieran una decisión física adicional."
              }
            >
              {physicalProducts.length === 0 ? (
                <Alert severity="info" variant="outlined">
                  No se requiere decidir entre reutilizar o descartar ningún producto.
                </Alert>
              ) : (
                <Stack spacing={1.5}>
                  {physicalProducts.map((item) => (
                    <PhysicalProductCard
                      key={item.id}
                      item={item}
                      order={order}
                      value={resolvePhysicalDecision(item, physicalDecisions)}
                      disabled={submitting}
                      onChange={(value) => handlePhysicalDecision(item.id, value)}
                    />
                  ))}
                </Stack>
              )}
            </SectionBlock>

            <SectionBlock
              number="3"
              title="Autorización operacional"
              description="Selecciona un autorizador operativo e ingresa su PIN para confirmar la cancelación."
            >
              {loadingAuthorizers ? (
                <Box sx={{ minHeight: 150, display: "grid", placeItems: "center" }}>
                  <Stack alignItems="center" spacing={1}>
                    <CircularProgress size={28} />
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Cargando autorizadores…
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {safeAuthorizers.length === 0 ? (
                    <Alert severity="warning" variant="outlined">
                      No hay autorizadores operativos activos para esta sucursal.
                    </Alert>
                  ) : null}

                  <FieldBlock
                    label="Autorizador *"
                    input={
                      <TextField
                        select
                        fullWidth
                        value={authorizerUserId}
                        onChange={(event) => setAuthorizerUserId(event.target.value)}
                        disabled={submitting || safeAuthorizers.length === 0}
                      >
                        {safeAuthorizers.map((authorizer) => (
                          <MenuItem key={authorizer.user_id} value={authorizer.user_id}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                                {authorizer.name || `Usuario #${authorizer.user_id}`}
                              </Typography>

                              {authorizer.email ? (
                                <Typography sx={{ mt: 0.2, fontSize: 12, color: "text.secondary" }}>
                                  {authorizer.email}
                                </Typography>
                              ) : null}
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />

                  <FieldBlock
                    label="PIN *"
                    input={
                      <TextField
                        fullWidth
                        type="password"
                        value={pin}
                        onChange={(event) => setPin(event.target.value.slice(0, 50))}
                        inputProps={{ maxLength: 50 }}
                        autoComplete="off"
                        disabled={submitting}
                        placeholder="Ingresa el PIN del autorizador"
                      />
                    }
                  />

                  <Box sx={{ px: 2, py: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.default" }}>
                    <Stack direction="row" spacing={1.25} alignItems="flex-start">
                      <AdminPanelSettingsRoundedIcon color="action" sx={{ mt: 0.1 }} />

                      <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: "text.secondary" }}>
                        El PIN se enviará únicamente para validar esta operación y no se conservará en la pantalla.
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              )}
            </SectionBlock>

            <SectionBlock
              number="4"
              title="Confirmación"
              description="Verifica la información antes de cancelar definitivamente el pedido."
            >
              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                justifyContent="flex-end"
                spacing={1.5}
                sx={{
                  "& > .MuiButton-root": {
                    width: { xs: "100%", sm: "auto" },
                    minWidth: { sm: 150 },
                  },
                }}
              >
                <Button type="button" variant="outlined" onClick={onClose} disabled={submitting}>
                  Regresar
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  color="error"
                  disabled={!canSubmit}
                  onClick={handleConfirm}
                  startIcon={submitting ? <CircularProgress size={17} color="inherit" /> : <CloseRoundedIcon />}
                >
                  {submitting ? "Cancelando…" : "Cancelar pedido"}
                </Button>
              </Stack>
            </SectionBlock>
          </Stack>
        </CardContent>
      </Card>
    </CashierDialogShell>
  );
}

function PhysicalProductCard({ item, order, value, disabled, onChange }) {
  const guide = item?.cancellation_physical || {};
  const forcedDecision = normalizeReuseIntent(guide?.forced_reuse_intent);
  const reuseAllowed = guide?.reuse_allowed === true;
  const displayName = item?.display_name || item?.product_name || `Producto #${item?.id || ""}`;
  const effectiveQuantity = Math.max(0, Number(item?.effective_quantity || 0));
  const outsideBranch = ["out_for_delivery", "arrived_at_destination"].includes(
    String(order?.status || "").toLowerCase()
  );

  return (
    <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1, bgcolor: "background.paper" }}>
      <Stack spacing={1.5}>
        <Box>
          <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary", wordBreak: "break-word" }}>
            {displayName}
          </Typography>

          <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary" }}>
            Cantidad efectiva: {effectiveQuantity}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: 13, lineHeight: 1.5, color: "text.secondary" }}>
          {physicalProductMessage(item)}
        </Typography>

        {forcedDecision === "discard" ? (
          <Alert severity="warning" variant="outlined">
            {outsideBranch
              ? "Este producto ya salió de la sucursal. Se descartará automáticamente al cancelar el pedido."
              : "Este producto no permite reutilización. Se descartará automáticamente al cancelar el pedido."}
          </Alert>
        ) : null}

        {forcedDecision === "reuse" ? (
          <Alert severity="info" variant="outlined">
            Este producto se conservará para reutilización conforme a la resolución indicada por el sistema.
          </Alert>
        ) : null}

        {!forcedDecision && reuseAllowed ? (
          <Box>
            <Typography sx={{ mb: 0.5, fontSize: 13, fontWeight: 800, color: "text.primary" }}>
              ¿Qué se hará con el producto?
            </Typography>

            <RadioGroup value={value || ""} onChange={(event) => onChange?.(event.target.value)}>
              <FormControlLabel
                value="reuse"
                control={<Radio />}
                label="Reutilizar"
                disabled={disabled}
              />

              <FormControlLabel
                value="discard"
                control={<Radio />}
                label="Descartar"
                disabled={disabled}
              />
            </RadioGroup>
          </Box>
        ) : null}

        {!forcedDecision && !reuseAllowed ? (
          <Alert severity="error" variant="outlined">
            No fue posible determinar automáticamente la resolución física de este producto. Actualiza el detalle antes de continuar.
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}

function SectionBlock({ number, title, description, children }) {
  return (
    <Box sx={{ pt: 0.5 }}>
      <Stack direction="row" spacing={1.25} alignItems="flex-start" mb={1.75}>
        <Box
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {number}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>

          <Typography sx={{ mt: 0.25, fontSize: 13, lineHeight: 1.5, color: "text.secondary" }}>
            {description}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ pl: { xs: 0, sm: 5 } }}>{children}</Box>
    </Box>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, lineHeight: 1.45, color: "text.secondary", textAlign: "right" }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

function resolvePhysicalDecision(item, decisions) {
  const forcedDecision = normalizeReuseIntent(item?.cancellation_physical?.forced_reuse_intent);
  if (forcedDecision) return forcedDecision;

  return normalizeReuseIntent(decisions?.[String(item?.id)]);
}

function normalizeReuseIntent(value) {
  const intent = String(value || "").toLowerCase();
  return ["reuse", "discard"].includes(intent) ? intent : "";
}

function physicalProductMessage(item) {
  const kitchenStatus = String(item?.kitchen_status || "").toLowerCase();
  const preparedReuse = String(item?.fulfillment_source || "").toLowerCase() === "prepared_reuse";

  if (kitchenStatus === "in_progress") return "Este producto ya está en preparación.";
  if (kitchenStatus === "ready") return "Este producto ya fue preparado y está listo.";
  if (kitchenStatus === "picked_up") return "Este producto ya fue recogido de Cocina y requiere una resolución física.";
  if (preparedReuse) return "Este producto utiliza una unidad física de Preparación rápida ya asignada.";

  return "Este producto requiere una resolución física antes de completar la cancelación.";
}