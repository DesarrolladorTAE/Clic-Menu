// src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx
// Flujo para corregir una cuenta antes de iniciar el cobro.

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert, Box, Button, Card, CardContent, Checkbox, Chip, CircularProgress, Collapse, Divider,
  FormControlLabel, IconButton, MenuItem, Stack, TextField, Typography,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PlaylistRemoveRoundedIcon from "@mui/icons-material/PlaylistRemoveRounded";
import RemoveShoppingCartRoundedIcon from "@mui/icons-material/RemoveShoppingCartRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import PaginationFooter from "../../../common/PaginationFooter";
import usePagination from "../../../../hooks/usePagination";

const STEP_ORANGE = "#FF9800";
const STEP_GRAY = "#D7D7DD";
const STEP_LINE = "#D8D8DE";

const TERRACOTTA = "#B4533F";
const TERRACOTTA_HOVER = "#963E2F";

const REASON_LABELS = {
  customer_changed_mind: "Cliente cambió de opinión",
  capture_error: "Error de captura",
  service_issue: "Incidencia de servicio",
  quality_issue: "Problema de calidad",
  preparation_incident: "Incidencia de preparación",
  courtesy_compensation: "Cortesía o compensación",
  other: "Otro",
};

export default function CashierAdjustmentCard({
  sale,
  orderCheckId = null,
  itemsFlat = [],
  orders = [],
  summary = null,
  partialForm,
  onPartialFormChange,
  partialDrafts = [],
  onAddPartialDraft,
  onRemovePartialDraft,
  onPartialDraftChange,
  onSubmitPartial,
  cancelOrderId = "",
  onCancelOrderIdChange,
  cancelOrderReason = "",
  onCancelOrderReasonChange,
  onSubmitCancelOrder,
  authorizers = [],
  loadingAuthorizers = false,
  authorizationError = "",
  hasManualDiscountsAffected = false,
  busy = false,
  disabled = false,
}) {
  const [activeMode, setActiveMode] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [authorizationUserId, setAuthorizationUserId] = useState("");
  const [authorizationPin, setAuthorizationPin] = useState("");
  const [clearDiscountsConfirmed, setClearDiscountsConfirmed] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const safeAuthorizers = useMemo(
    () => (Array.isArray(authorizers) ? authorizers : []).filter((authorizer) => resolveAuthorizerUserId(authorizer)),
    [authorizers]
  );

  useEffect(() => {
    setActiveMode("");
    setStepIndex(0);
    setAuthorizationUserId("");
    setAuthorizationPin("");
    setClearDiscountsConfirmed(false);
    setHistoryOpen(false);
  }, [sale?.id, sale?.sale_id]);

  useEffect(() => {
    if (!hasManualDiscountsAffected) setClearDiscountsConfirmed(false);
  }, [hasManualDiscountsAffected]);

  useEffect(() => {
    if (loadingAuthorizers || safeAuthorizers.length !== 1) return;
    setAuthorizationUserId(String(resolveAuthorizerUserId(safeAuthorizers[0])));
  }, [loadingAuthorizers, safeAuthorizers]);

  const currentOrderCheckId = normalizePositiveId(
    orderCheckId ?? summary?.sale?.order_check_id ?? sale?.order_check_id
  );

  const normalizedItems = useMemo(() => {
    const rows = Array.isArray(itemsFlat) ? itemsFlat : [];

    return rows
      .map((item) => {
        const hasFinancialIdentity =
          item?.order_check_item_id !== undefined ||
          item?.order_check_id !== undefined;

        const orderCheckItemId = normalizePositiveId(
          item?.order_check_item_id ?? (hasFinancialIdentity ? item?.id : null)
        );

        const orderItemId = normalizePositiveId(
          item?.order_item_id ?? (!hasFinancialIdentity ? item?.id : null)
        );

        const itemOrderCheckId = normalizePositiveId(item?.order_check_id);
        const sourceOrderId = normalizePositiveId(item?.source_order_id ?? item?.order_id);
        const sourceTableId = normalizePositiveId(item?.source_table_id ?? item?.table_id);
        const parentOrderItemId = normalizePositiveId(item?.parent_order_item_id);
        const itemKind = String(item?.item_kind || "").trim();

        const belongsToCurrentCheck =
          currentOrderCheckId === null ||
          itemOrderCheckId === null ||
          itemOrderCheckId === currentOrderCheckId;

        const quantity = Math.max(toNumber(item?.quantity ?? item?.qty, 0), 0);
        const availableQty = quantity;
        const cancellableQty = Math.max(Math.floor(availableQty + 0.000001), 0);

        return {
          orderCheckItemId,
          orderItemId,
          orderCheckId: itemOrderCheckId,
          sourceOrderId,
          sourceTableId,
          parentOrderItemId,
          name: resolveItemName(item),
          quantity,
          availableQty,
          cancellableQty,
          unitPrice: toNumber(item?.unit_price, 0),
          baseLineTotal: toNumber(item?.base_line_total, 0),
          modifiersTotal: toNumber(item?.modifiers_total, 0),
          promotionDiscountTotal: toNumber(item?.promotion_discount_total, 0),
          manualDiscountTotal: toNumber(item?.manual_discount_total, 0),
          cancellationTotal: toNumber(item?.cancellation_total, 0),
          netLineTotal: toNumber(item?.net_line_total ?? item?.line_total ?? item?.total, 0),
          itemKind,
          isChild: parentOrderItemId !== null || itemKind === "composite_child",
          isCompositeParent: Boolean(item?.is_composite_parent),
          belongsToCurrentCheck,
        };
      })
      .filter((item) => item.orderItemId !== null && item.belongsToCurrentCheck);
  }, [itemsFlat, currentOrderCheckId]);

  const selectableItems = useMemo(() => {
    return normalizedItems.filter(
      (item) => !item.isChild && item.belongsToCurrentCheck && item.cancellableQty > 0
    );
  }, [normalizedItems]);

  const selectableItemsMap = useMemo(() => {
    const map = new Map();

    selectableItems.forEach((item) => {
      map.set(Number(item.orderItemId), item);
    });

    return map;
  }, [selectableItems]);

  const selectedDraftItemIds = useMemo(() => {
    return partialDrafts
      .map((draft) => normalizePositiveId(draft?.orderItemId))
      .filter((id) => id !== null);
  }, [partialDrafts]);

  const normalizedOrders = useMemo(() => {
    const map = new Map();

    const registerOrder = (order) => {
      const orderId = normalizePositiveId(order?.id ?? order?.order_id);
      if (orderId === null) return;

      const previous = map.get(orderId) || {};

      map.set(orderId, {
        ...previous,
        ...order,
        id: orderId,
        order_id: orderId,
        table_id: normalizePositiveId(order?.table_id ?? order?.table?.id ?? previous?.table_id),
        table_name: cleanText(order?.table_name ?? order?.table?.name) || previous?.table_name || "",
        customer_name: cleanText(order?.customer_name) || previous?.customer_name || "",
      });
    };

    (Array.isArray(orders) ? orders : []).forEach(registerOrder);

    normalizedItems.forEach((item) => {
      if (item.sourceOrderId === null) return;

      registerOrder({
        id: item.sourceOrderId,
        table_id: item.sourceTableId,
      });
    });

    registerOrder({
      id: sale?.order_id ?? sale?.order?.id,
      table_id: sale?.order?.table_id ?? sale?.table?.id,
      table_name: sale?.order?.table?.name ?? sale?.table?.name,
      customer_name: sale?.order?.customer_name,
    });

    return Array.from(map.values()).sort((a, b) => Number(a.id) - Number(b.id));
  }, [orders, normalizedItems, sale]);

  const hasMultipleOrders = normalizedOrders.length > 1;
  const requestedCancelOrderId = normalizePositiveId(cancelOrderId);

  const selectedCancelOrder = hasMultipleOrders
    ? normalizedOrders.find((order) => Number(order.id) === Number(requestedCancelOrderId)) || null
    : normalizedOrders[0] || null;

  const resolvedCancelOrderId =
    selectedCancelOrder?.id ??
    (!hasMultipleOrders ? normalizePositiveId(sale?.order_id ?? sale?.order?.id) : null);

  const normalizedPartialDrafts = useMemo(() => {
    return partialDrafts.map((draft) => ({
      orderItemId: normalizePositiveId(draft?.orderItemId),
      quantity: normalizePositiveInteger(draft?.quantity),
    }));
  }, [partialDrafts]);

  const partialReason = cleanText(partialForm?.reason);

  const canSubmitPartial = useMemo(() => {
    if (!partialReason || normalizedPartialDrafts.length === 0) return false;

    const usedOrderItemIds = new Set();

    return normalizedPartialDrafts.every((draft) => {
      if (
        draft.orderItemId === null ||
        draft.quantity === null ||
        usedOrderItemIds.has(draft.orderItemId)
      ) {
        return false;
      }

      const item = selectableItemsMap.get(draft.orderItemId);

      if (!item || draft.quantity < 1 || draft.quantity > item.cancellableQty) return false;

      usedOrderItemIds.add(draft.orderItemId);
      return true;
    });
  }, [normalizedPartialDrafts, partialReason, selectableItemsMap]);

  const canSubmitCancelOrder =
    cleanText(cancelOrderReason) !== "" &&
    resolvedCancelOrderId !== null;

  const authorizationComplete =
    Number(authorizationUserId) > 0 &&
    authorizationPin.trim() !== "" &&
    safeAuthorizers.length > 0 &&
    !loadingAuthorizers;

  const discountsConfirmationComplete =
    !hasManualDiscountsAffected || clearDiscountsConfirmed;

  const canSubmitPartialCorrection =
    canSubmitPartial &&
    authorizationComplete &&
    discountsConfirmationComplete;

  const canSubmitOrderCorrection =
    canSubmitCancelOrder &&
    authorizationComplete &&
    discountsConfirmationComplete;

  const cancelAmount = toNumber(summary?.adjustment_summary?.cancel_amount, 0);

  const originalSubtotal = toNumber(
    summary?.adjustment_summary?.original_subtotal ?? sale?.subtotal,
    0
  );

  const currentSubtotal = toNumber(
    summary?.adjustment_summary?.current_subtotal ?? sale?.subtotal,
    0
  );

  const currentTotal = toNumber(
    summary?.adjustment_summary?.current_total ?? sale?.total,
    0
  );

  const adjustments = Array.isArray(summary?.adjustments) ? summary.adjustments : [];

  const draftPaginationKey = `${sale?.sale_id || sale?.id || 0}:${activeMode}`;

  const {
    page: draftPage,
    nextPage: nextDraftPage,
    prevPage: prevDraftPage,
    total: draftTotal,
    totalPages: draftTotalPages,
    startItem: draftStartItem,
    endItem: draftEndItem,
    hasPrev: draftHasPrev,
    hasNext: draftHasNext,
    paginatedItems: paginatedDrafts,
  } = usePagination({
    items: partialDrafts,
    initialPage: 1,
    pageSize: 4,
    mode: "frontend",
    resetKey: draftPaginationKey,
  });

  const steps = [
    { key: "mode", label: "Ajuste" },
    { key: "correction", label: "Corrección" },
    { key: "authorization", label: "Autorización" },
  ];

  const currentStep = steps[stepIndex] || steps[0];
  const isLastStep = stepIndex === steps.length - 1;

  const canContinue = useMemo(() => {
    if (currentStep.key === "mode") return activeMode === "partial" || activeMode === "total";

    if (currentStep.key === "correction") {
      if (activeMode === "partial") return canSubmitPartial;
      if (activeMode === "total") return canSubmitCancelOrder;
      return false;
    }

    if (currentStep.key === "authorization") {
      return authorizationComplete && discountsConfirmationComplete;
    }

    return false;
  }, [
    currentStep,
    activeMode,
    canSubmitPartial,
    canSubmitCancelOrder,
    authorizationComplete,
    discountsConfirmationComplete,
  ]);

  const buildAuthorizationPayload = () => ({
    authorization_user_id: Number(authorizationUserId),
    authorization_pin: authorizationPin.trim(),
    clear_discounts_on_restructure:
      hasManualDiscountsAffected && clearDiscountsConfirmed,
  });

  const handleModeSelect = (mode) => {
    if (busy || disabled) return;

    setActiveMode(mode);
    setAuthorizationPin("");
    setClearDiscountsConfirmed(false);
  };

  const handleNext = () => {
    if (busy || disabled || isLastStep || !canContinue) return;
    setStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
  };

  const handleBack = () => {
    if (busy) return;
    setStepIndex((previous) => Math.max(0, previous - 1));
  };

  const handleSubmitPartial = async () => {
    if (!canSubmitPartialCorrection) return;

    await onSubmitPartial?.({
      reason: partialReason,
      items: normalizedPartialDrafts.map((draft) => ({
        order_item_id: draft.orderItemId,
        quantity: draft.quantity,
      })),
      ...buildAuthorizationPayload(),
    });

    setAuthorizationPin("");
  };

  const handleSubmitCancelOrder = async () => {
    if (!canSubmitOrderCorrection) return;

    await onSubmitCancelOrder?.({
      order_id: resolvedCancelOrderId,
      reason: cleanText(cancelOrderReason),
      ...buildAuthorizationPayload(),
    });

    setAuthorizationPin("");
  };

  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 0,
        boxShadow: "none",
        bgcolor: "background.paper",
        width: "100%",
        minHeight: "100%",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          pb: { xs: 1.5, sm: 2.5 },
          width: "100%",
          boxSizing: "border-box",
          "&:last-child": { pb: { xs: 1.5, sm: 2.5 } },
        }}
      >
        <Box>
          <StepIndicator steps={steps} currentIndex={stepIndex} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          {currentStep.key === "mode" ? (
            <Stack spacing={2.5}>
              <StepIntro
                number={1}
                title="Tipo de corrección"
                description="Selecciona qué necesitas corregir antes de continuar con el cobro."
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.25,
                }}
              >
                <ModeButton
                  active={activeMode === "partial"}
                  disabled={busy || disabled}
                  icon={<PlaylistRemoveRoundedIcon />}
                  title="Quitar productos"
                  subtitle="Retirar uno o más productos de la cuenta"
                  onClick={() => handleModeSelect("partial")}
                />

                <ModeButton
                  active={activeMode === "total"}
                  disabled={busy || disabled}
                  icon={<RemoveShoppingCartRoundedIcon />}
                  title="Cancelar orden completa"
                  subtitle="Retirar una orden completa de la cuenta"
                  onClick={() => handleModeSelect("total")}
                  danger
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
                  Resumen de la cuenta
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                    gap: 1,
                  }}
                >
                  <AmountBox label="Subtotal original" value={formatCurrency(originalSubtotal)} />
                  <AmountBox label="Total retirado" value={formatCurrency(cancelAmount)} />
                  <AmountBox label="Subtotal actual" value={formatCurrency(currentSubtotal)} />
                  <AmountBox label="Total actual" value={formatCurrency(currentTotal)} highlight />
                </Box>
              </Box>
            </Stack>
          ) : null}

          {currentStep.key === "correction" && activeMode === "partial" ? (
            <Stack spacing={2.5}>
              <StepIntro
                number={2}
                title="Productos a retirar"
                description="Selecciona los productos y cantidades que deben retirarse de la cuenta."
              />

              <FieldBlock
                label="Motivo *"
                input={
                  <TextField
                    fullWidth
                    value={partialForm?.reason || ""}
                    onChange={(event) => onPartialFormChange?.("reason", event.target.value)}
                    placeholder="Ej. El cliente ya no desea una bebida"
                    disabled={busy || disabled}
                  />
                }
              />

              {partialDrafts.length > 0 ? (
                <Stack spacing={1.5}>
                  {paginatedDrafts.map((draft, index) => {
                    const selectedOrderItemId = normalizePositiveId(draft?.orderItemId);

                    const selectedItem =
                      selectedOrderItemId !== null
                        ? selectableItemsMap.get(selectedOrderItemId) || null
                        : null;

                    const visualIndex = draftStartItem + index;

                    return (
                      <Box
                        key={draft.localId}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.default",
                          borderRadius: 1,
                        }}
                      >
                        <Stack spacing={1.5}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                            <Typography sx={{ minWidth: 0, fontSize: 15, fontWeight: 800, color: "text.primary" }}>
                              Producto a retirar {visualIndex}
                            </Typography>

                            <IconButton
                              onClick={() => onRemovePartialDraft?.(draft.localId)}
                              disabled={busy || disabled}
                              sx={iconDeleteSx}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Stack>

                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 180px" },
                              gap: 2,
                            }}
                          >
                            <FieldBlock
                              label="Producto *"
                              input={
                                <TextField
                                  select
                                  fullWidth
                                  value={draft.orderItemId || ""}
                                  onChange={(event) =>
                                    onPartialDraftChange?.(draft.localId, "orderItemId", event.target.value)
                                  }
                                  disabled={busy || disabled}
                                >
                                  <MenuItem value="">Selecciona un producto</MenuItem>

                                  {selectableItems.map((item) => {
                                    const usedByOtherDraft =
                                      selectedDraftItemIds.includes(Number(item.orderItemId)) &&
                                      Number(draft.orderItemId || 0) !== Number(item.orderItemId);

                                    return (
                                      <MenuItem
                                        key={item.orderCheckItemId || item.orderItemId}
                                        value={String(item.orderItemId)}
                                        disabled={usedByOtherDraft}
                                      >
                                        {formatQuantity(item.availableQty)} × {item.name}
                                        {hasMultipleOrders && item.sourceOrderId
                                          ? ` · Orden #${item.sourceOrderId}`
                                          : ""}
                                      </MenuItem>
                                    );
                                  })}
                                </TextField>
                              }
                            />

                            <FieldBlock
                              label="Cantidad *"
                              input={
                                <TextField
                                  select
                                  fullWidth
                                  value={draft.quantity || ""}
                                  onChange={(event) =>
                                    onPartialDraftChange?.(draft.localId, "quantity", event.target.value)
                                  }
                                  disabled={busy || disabled || !selectedItem}
                                >
                                  <MenuItem value="">Selecciona</MenuItem>

                                  {Array.from(
                                    { length: selectedItem?.cancellableQty || 0 },
                                    (_, itemIndex) => itemIndex + 1
                                  ).map((quantity) => (
                                    <MenuItem key={quantity} value={String(quantity)}>
                                      {quantity}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              }
                            />
                          </Box>

                          {selectedItem ? (
                            <Box
                              sx={{
                                px: 1.25,
                                py: 1,
                                borderRadius: 1,
                                bgcolor: "rgba(255,152,0,0.06)",
                              }}
                            >
                              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                                Disponible para retirar: {formatQuantity(selectedItem.availableQty)} · Precio unitario:{" "}
                                {formatCurrency(selectedItem.unitPrice)}
                              </Typography>
                            </Box>
                          ) : null}
                        </Stack>
                      </Box>
                    );
                  })}

                  {draftTotal > 4 ? (
                    <Box sx={{ overflow: "hidden", border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                      <PaginationFooter
                        page={draftPage}
                        totalPages={draftTotalPages}
                        startItem={draftStartItem}
                        endItem={draftEndItem}
                        total={draftTotal}
                        hasPrev={draftHasPrev}
                        hasNext={draftHasNext}
                        onPrev={prevDraftPage}
                        onNext={nextDraftPage}
                        itemLabel="productos"
                      />
                    </Box>
                  ) : null}
                </Stack>
              ) : (
                <HelperBox>
                  Agrega uno o más productos que deban retirarse. Si la corrección deja la orden sin productos,
                  deberá utilizarse la opción de cancelar la orden completa.
                </HelperBox>
              )}

              <Button
                variant="outlined"
                onClick={onAddPartialDraft}
                disabled={busy || disabled || selectableItems.length === 0}
                startIcon={<AddRoundedIcon />}
                sx={{
                  alignSelf: { xs: "stretch", sm: "flex-start" },
                  minWidth: { sm: 220 },
                  height: 42,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Agregar producto
              </Button>

              {selectableItems.length === 0 ? (
                <HelperBox>
                  No hay productos disponibles para retirar de esta cuenta.
                </HelperBox>
              ) : null}
            </Stack>
          ) : null}

          {currentStep.key === "correction" && activeMode === "total" ? (
            <Stack spacing={2.5}>
              <StepIntro
                number={2}
                title="Cancelar orden completa"
                description="Selecciona la orden y registra el motivo de la cancelación."
              />

              {hasMultipleOrders ? (
                <FieldBlock
                  label="Orden a cancelar *"
                  input={
                    <TextField
                      select
                      fullWidth
                      value={cancelOrderId || ""}
                      onChange={(event) => onCancelOrderIdChange?.(event.target.value)}
                      disabled={busy || disabled}
                    >
                      <MenuItem value="">Selecciona una orden</MenuItem>

                      {normalizedOrders.map((order) => (
                        <MenuItem key={order.id} value={String(order.id)}>
                          {resolveOrderLabel(order)}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                />
              ) : selectedCancelOrder ? (
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.default",
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "text.secondary", mb: 0.4 }}>
                    Orden que será cancelada
                  </Typography>

                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                    {resolveOrderLabel(selectedCancelOrder)}
                  </Typography>
                </Box>
              ) : null}

              <FieldBlock
                label="Motivo *"
                input={
                  <TextField
                    fullWidth
                    value={cancelOrderReason || ""}
                    onChange={(event) => onCancelOrderReasonChange?.(event.target.value)}
                    placeholder="Ej. El cliente decidió no consumir"
                    disabled={busy || disabled}
                  />
                }
              />

              <Box
                sx={{
                  p: 1.5,
                  border: "1px dashed",
                  borderColor: "warning.main",
                  borderRadius: 1,
                  bgcolor: "rgba(255,152,0,0.04)",
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <WarningAmberRoundedIcon sx={{ mt: 0.15, color: "warning.main", fontSize: 20 }} />

                  <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
                    Se retirará por completo la orden seleccionada. Si la cuenta contiene otras órdenes,
                    continuarán activas. La mesa solamente se liberará cuando ya no existan órdenes activas relacionadas.
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          ) : null}

          {currentStep.key === "authorization" ? (
            <Stack spacing={2.5}>
              <StepIntro
                number={3}
                title="Autorización operativa"
                description="Un usuario autorizado debe confirmar esta corrección antes de aplicarla."
              />

              {loadingAuthorizers ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} />

                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Cargando autorizadores…
                  </Typography>
                </Stack>
              ) : null}

              {authorizationError ? (
                <Alert severity="warning" variant="outlined">
                  {authorizationError}
                </Alert>
              ) : null}

              {!loadingAuthorizers && safeAuthorizers.length === 0 && !authorizationError ? (
                <Alert severity="warning" variant="outlined">
                  No hay autorizadores operativos disponibles para esta sucursal.
                </Alert>
              ) : null}

              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.default",
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <FieldBlock
                    label="Autorizador *"
                    help={
                      safeAuthorizers.length === 1
                        ? "Se seleccionó automáticamente el único autorizador disponible."
                        : null
                    }
                    input={
                      <TextField
                        select
                        fullWidth
                        value={authorizationUserId}
                        onChange={(event) => setAuthorizationUserId(event.target.value)}
                        disabled={busy || disabled || loadingAuthorizers || safeAuthorizers.length === 0}
                      >
                        <MenuItem value="">Selecciona un autorizador</MenuItem>

                        {safeAuthorizers.map((authorizer) => {
                          const userId = resolveAuthorizerUserId(authorizer);

                          return (
                            <MenuItem key={userId} value={String(userId)}>
                              {resolveAuthorizerLabel(authorizer)}
                            </MenuItem>
                          );
                        })}
                      </TextField>
                    }
                  />

                  <FieldBlock
                    label="PIN *"
                    input={
                      <TextField
                        fullWidth
                        type="password"
                        value={authorizationPin}
                        onChange={(event) => setAuthorizationPin(event.target.value.slice(0, 20))}
                        inputProps={{ maxLength: 20 }}
                        autoComplete="off"
                        placeholder="PIN del autorizador"
                        disabled={busy || disabled || loadingAuthorizers || safeAuthorizers.length === 0}
                      />
                    }
                  />
                </Box>
              </Box>

              {hasManualDiscountsAffected ? (
                <Alert severity="warning" variant="outlined">
                  <Stack spacing={1}>
                    <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                      Esta cuenta tiene descuentos manuales.
                    </Typography>

                    <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>
                      Al modificar la cuenta, los descuentos manuales afectados serán retirados.
                      Después podrás revisar la cuenta y aplicar nuevamente los descuentos que correspondan.
                    </Typography>

                    <FormControlLabel
                      sx={{ m: 0, alignItems: "flex-start" }}
                      control={
                        <Checkbox
                          checked={clearDiscountsConfirmed}
                          onChange={(event) => setClearDiscountsConfirmed(event.target.checked)}
                          disabled={busy || disabled}
                        />
                      }
                      label={
                        <Typography sx={{ pt: 0.9, fontSize: 13, lineHeight: 1.45 }}>
                          Confirmo que los descuentos manuales afectados pueden retirarse.
                        </Typography>
                      }
                    />
                  </Stack>
                </Alert>
              ) : null}
            </Stack>
          ) : null}

          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 1.25 }} />

            <Button
              type="button"
              fullWidth
              onClick={() => setHistoryOpen((previous) => !previous)}
              endIcon={
                <ExpandMoreRoundedIcon
                  sx={{
                    transform: historyOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              }
              sx={{
                minHeight: 44,
                px: 1,
                justifyContent: "space-between",
                color: "text.primary",
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                  Historial de correcciones
                </Typography>

                <Chip label={adjustments.length} size="small" sx={{ height: 23, fontWeight: 800 }} />
              </Stack>
            </Button>

            <Collapse in={historyOpen} unmountOnExit>
              <Box sx={{ pt: 1 }}>
                {adjustments.length > 0 ? (
                  <Stack spacing={1}>
                    {adjustments.map((adjustment) => {
                      const adjustmentItems = Array.isArray(adjustment?.items)
                        ? adjustment.items
                        : [];

                      return (
                        <Box
                          key={adjustment.id}
                          sx={{
                            p: 1.5,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "background.default",
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              <Chip
                                size="small"
                                label={
                                  adjustment.type === "cancel_order"
                                    ? "Orden cancelada"
                                    : adjustment.type === "cancel_item"
                                      ? "Productos retirados"
                                      : "Corrección"
                                }
                              />

                              <Chip
                                size="small"
                                label={`Estado: ${resolveAdjustmentStatusLabel(adjustment.status)}`}
                              />
                            </Stack>

                            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                              {resolveReasonLabel(adjustment.reason)}
                            </Typography>

                            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                              {formatDate(adjustment.created_at)}
                            </Typography>

                            {adjustmentItems.length > 0 ? (
                              <Stack spacing={0.4}>
                                {adjustmentItems.map((row) => {
                                  const orderItemId = normalizePositiveId(row?.order_item_id);

                                  const currentItem =
                                    orderItemId !== null
                                      ? normalizedItems.find(
                                          (item) => Number(item.orderItemId) === Number(orderItemId)
                                        )
                                      : null;

                                  const itemName =
                                    currentItem?.name ||
                                    resolveAdjustmentItemName(row);

                                  return (
                                    <Typography
                                      key={row.id}
                                      sx={{
                                        fontSize: 12.5,
                                        color: "text.secondary",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      • {itemName} · Cantidad: {formatQuantity(row?.quantity)} · Monto:{" "}
                                      {formatCurrency(row?.amount)}
                                    </Typography>
                                  );
                                })}
                              </Stack>
                            ) : null}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <HelperBox>
                    No hay correcciones aplicadas para esta cuenta.
                  </HelperBox>
                )}
              </Box>
            </Collapse>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Button
            type="button"
            onClick={handleBack}
            disabled={busy || stepIndex === 0}
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{
              flex: { xs: 1, sm: "0 0 auto" },
              minWidth: { sm: 140 },
              height: 44,
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Volver
          </Button>

          {!isLastStep ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={busy || disabled || !canContinue}
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                flex: { xs: 1, sm: "0 0 auto" },
                minWidth: { sm: 170 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              }}
            >
              Continuar
            </Button>
          ) : activeMode === "partial" ? (
            <Button
              type="button"
              onClick={handleSubmitPartial}
              disabled={busy || disabled || !canSubmitPartialCorrection}
              variant="contained"
              startIcon={<PlaylistRemoveRoundedIcon />}
              sx={{
                flex: { xs: 1, sm: "0 0 auto" },
                minWidth: { sm: 210 },
                height: 44,
                borderRadius: 2,
                bgcolor: TERRACOTTA,
                color: "#fff",
                fontWeight: 800,
                boxShadow: "none",
                "&:hover": { bgcolor: TERRACOTTA_HOVER, boxShadow: "none" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(180,83,63,0.22)",
                  color: "rgba(180,83,63,0.55)",
                },
              }}
            >
              {busy ? "Procesando…" : "Quitar productos"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmitCancelOrder}
              disabled={busy || disabled || !canSubmitOrderCorrection}
              variant="contained"
              startIcon={<RemoveShoppingCartRoundedIcon />}
              sx={{
                flex: { xs: 1, sm: "0 0 auto" },
                minWidth: { sm: 240 },
                height: 44,
                borderRadius: 2,
                bgcolor: "error.main",
                color: "#fff",
                fontWeight: 800,
                boxShadow: "none",
                "&:hover": { bgcolor: "error.dark", boxShadow: "none" },
              }}
            >
              {busy
                ? "Procesando…"
                : hasMultipleOrders
                  ? "Cancelar orden seleccionada"
                  : "Cancelar orden completa"}
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function StepIndicator({ steps, currentIndex }) {
  return (
    <Box sx={{ width: "100%", px: { xs: 0, sm: 0.5 } }}>
      <Stack direction="row" alignItems="flex-start" sx={{ width: "100%" }}>
        {steps.map((step, index) => {
          const active = index === currentIndex;
          const completed = index < currentIndex;
          const reached = index <= currentIndex;
          const hasNext = index < steps.length - 1;
          const nextReached = index < currentIndex;

          return (
            <React.Fragment key={step.key}>
              <Box
                sx={{
                  flex: "0 0 auto",
                  width: { xs: 76, sm: 110 },
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: { xs: 32, sm: 38 },
                    height: { xs: 32, sm: 38 },
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: reached ? STEP_ORANGE : STEP_GRAY,
                    color: "#fff",
                    fontSize: { xs: 13, sm: 14 },
                    fontWeight: 900,
                    boxShadow: active ? "0 0 0 4px rgba(255,152,0,0.12)" : "none",
                    transition: "all 0.2s ease",
                  }}
                >
                  {index + 1}
                </Box>

                <Typography
                  sx={{
                    mt: 0.9,
                    width: "100%",
                    textAlign: "center",
                    fontSize: { xs: 10.5, sm: 12 },
                    fontWeight: active ? 900 : completed ? 800 : 700,
                    lineHeight: 1.25,
                    color: active ? STEP_ORANGE : completed ? "text.primary" : "text.secondary",
                  }}
                >
                  {step.label}
                </Typography>
              </Box>

              {hasNext ? (
                <Box
                  sx={{
                    flex: 1,
                    minWidth: { xs: 12, sm: 28 },
                    height: 2,
                    mt: { xs: "15px", sm: "18px" },
                    mx: { xs: -1, sm: 0 },
                    bgcolor: nextReached ? STEP_ORANGE : STEP_LINE,
                    transition: "background-color 0.2s ease",
                  }}
                />
              ) : null}
            </React.Fragment>
          );
        })}
      </Stack>
    </Box>
  );
}

function StepIntro({ number, title, description }) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: { xs: 18, sm: 20 },
          fontWeight: 800,
          color: "text.primary",
          lineHeight: 1.25,
        }}
      >
        {number}. {title}
      </Typography>

      <Typography sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary", lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  );
}

function ModeButton({
  active,
  disabled,
  icon,
  title,
  subtitle,
  onClick,
  danger = false,
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant="outlined"
      sx={{
        justifyContent: "flex-start",
        minHeight: 78,
        px: 2,
        py: 1.25,
        borderRadius: 2,
        textTransform: "none",
        borderColor: active
          ? danger
            ? "error.main"
            : STEP_ORANGE
          : "divider",
        bgcolor: active
          ? danger
            ? "error.main"
            : STEP_ORANGE
          : "#fff",
        color: active ? "#fff" : "text.primary",
        boxShadow: "none",
        "&:hover": {
          borderColor: danger ? "error.dark" : "#F57C00",
          bgcolor: active
            ? danger
              ? "error.dark"
              : "#F57C00"
            : "rgba(255,152,0,0.06)",
          boxShadow: "none",
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            color: active ? "#fff" : danger ? "error.main" : STEP_ORANGE,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0, textAlign: "left" }}>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 900,
              lineHeight: 1.15,
              color: "inherit",
              wordBreak: "break-word",
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 0.3,
              fontSize: 12.5,
              fontWeight: 700,
              lineHeight: 1.3,
              color: active ? "rgba(255,255,255,0.92)" : "text.secondary",
              wordBreak: "break-word",
            }}
          >
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Button>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>

      {input}

      {help ? (
        <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary", lineHeight: 1.45 }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

function AmountBox({ label, value, highlight = false }) {
  return (
    <Box
      sx={{
        p: 1.25,
        border: "1px solid",
        borderColor: highlight ? "warning.light" : "divider",
        borderRadius: 1,
        bgcolor: highlight ? "rgba(255,152,0,0.06)" : "background.default",
      }}
    >
      <Typography sx={{ fontSize: 11.5, color: "text.secondary", lineHeight: 1.3 }}>
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.4,
          fontSize: 15,
          fontWeight: 900,
          color: highlight ? "warning.dark" : "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function HelperBox({ children }) {
  return (
    <Box
      sx={{
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1,
        p: 1.5,
      }}
    >
      <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.55 }}>
        {children}
      </Typography>
    </Box>
  );
}

function resolveAuthorizerUserId(authorizer) {
  const userId = Number(authorizer?.user_id ?? authorizer?.user?.id ?? 0);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function resolveAuthorizerLabel(authorizer) {
  const name = cleanText(authorizer?.name ?? authorizer?.user?.name);
  const email = cleanText(authorizer?.email ?? authorizer?.user?.email);

  if (name && email) return `${name} · ${email}`;
  if (name) return name;
  if (email) return email;

  const userId = resolveAuthorizerUserId(authorizer);
  return userId ? `Autorizador ${userId}` : "Autorizador";
}

function resolveOrderLabel(order) {
  const orderId = normalizePositiveId(order?.id ?? order?.order_id);
  const tableName = cleanText(order?.table_name ?? order?.table?.name);
  const customerName = cleanText(order?.customer_name);

  const parts = [orderId !== null ? `Orden #${orderId}` : "Orden"];

  if (tableName) parts.push(`Mesa ${tableName}`);
  if (customerName) parts.push(customerName);

  return parts.join(" · ");
}

function resolveItemName(item) {
  const meta =
    item?.meta_json && typeof item.meta_json === "object"
      ? item.meta_json
      : {};

  const displayName = cleanText(item?.display_name ?? meta?.display_name);
  const productName = cleanText(item?.product_name ?? meta?.product_name);
  const variantName = cleanText(item?.variant_name ?? meta?.variant_name);
  const snapshotName = cleanText(item?.name_snapshot ?? meta?.name_snapshot);

  if (displayName) return displayName;
  if (productName && variantName) return `${productName} · ${variantName}`;
  if (productName) return productName;
  if (variantName) return variantName;
  if (snapshotName) return snapshotName;

  return "Producto";
}

function resolveAdjustmentItemName(row) {
  const orderItem = row?.order_item || null;

  if (!orderItem) return `Producto #${row?.order_item_id || "—"}`;

  const resolvedName = resolveItemName(orderItem);
  if (resolvedName !== "Producto") return resolvedName;

  return `Producto #${orderItem.id}`;
}

function resolveReasonLabel(reason) {
  const value = cleanText(reason);
  if (!value) return "Sin motivo";

  if (REASON_LABELS[value]) return REASON_LABELS[value];

  if (/^[a-z0-9_]+$/.test(value) && value.includes("_")) {
    return "Motivo registrado";
  }

  return value;
}

function resolveAdjustmentStatusLabel(status) {
  const value = String(status || "").toLowerCase();

  if (value === "applied") return "Aplicado";
  if (value === "voided") return "Anulado";
  if (value === "pending") return "Pendiente";
  if (value === "rejected") return "Rechazado";

  return "Sin estado";
}

function normalizePositiveId(value) {
  if (value === null || value === undefined || value === "") return null;

  const normalized = Number(value);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

function normalizePositiveInteger(value) {
  if (value === null || value === undefined || value === "") return null;

  const normalized = Number(value);
  return Number.isInteger(normalized) && normalized > 0 ? normalized : null;
}

function toNumber(value, fallback = 0) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function formatQuantity(value) {
  const quantity = toNumber(value, 0);

  return Number.isInteger(quantity)
    ? String(quantity)
    : quantity.toLocaleString("es-MX", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 4,
      });
}

function formatCurrency(value) {
  const safe = toNumber(value, 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `$${safe.toFixed(2)}`;
  }
}

function formatDate(value) {
  if (!value) return "Fecha no disponible";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

const iconDeleteSx = {
  width: 38,
  height: 38,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  flexShrink: 0,
  "&:hover": { bgcolor: "error.dark" },
  "&.Mui-disabled": {
    bgcolor: "action.disabledBackground",
    color: "action.disabled",
  },
};