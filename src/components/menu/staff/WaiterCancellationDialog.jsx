import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Chip, Dialog, DialogContent, DialogTitle, Divider, IconButton,
  MenuItem, Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import AppAlert from "../../common/AppAlert";
import PaginationFooter from "../../common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";

/*
 * Resuelve los datos operativos de una cancelación iniciada por Mesero.
 *
 * Qué usa:
 * - StaffOrderCancellationController.php, mediante el contexto ya cargado por el hook.
 * - StoreOrderCancellationRequest.php, respetando reason_code, reason_note,
 *   reuse_intent, delivery_state, authorizer_user_id y pin.
 *
 * Qué archivo lo usa:
 * - src/pages/staff/waiter/StaffMenuEntryPage.jsx.
 *
 * No selecciona productos, no ejecuta requests y no calcula partial/full.
 * La selección ya fue resuelta previamente dentro del carrito.
 */

const REASON_OPTIONS = [
  { value: "customer_changed_mind", label: "Cliente cambió de opinión" },
  { value: "capture_error", label: "Error de captura" },
  { value: "service_issue", label: "Incidencia de servicio" },
  { value: "quality_issue", label: "Problema de calidad" },
  { value: "preparation_incident", label: "Incidencia de preparación" },
  { value: "courtesy_compensation", label: "Cortesía o compensación" },
  { value: "other", label: "Otro" },
];

const REUSE_LABELS = {
  reuse: "Regresar a Preparación rápida",
  discard: "Descartar",
};

const DELIVERY_LABELS = {
  not_delivered: "No entregado a la mesa",
  delivered: "Ya entregado a la mesa",
};

const TERRACOTTA = "#B4533F";
const TERRACOTTA_HOVER = "#963E2F";
const STEP_ORANGE = "#FF9800";
const STEP_GRAY = "#D7D7DD";
const STEP_LINE = "#D8D8DE";

function getOrderItemId(item) {
  const id = Number(item?.order_item_id || 0);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function getItemLabel(item) {
  const productName = String(item?.product_name || item?.display_name || "Producto").trim();
  return productName || "Producto";
}

function normalizePhysicalOptions(item, key) {
  const options = item?.physical_options?.[key];

  return Array.isArray(options)
    ? options.map((value) => String(value || "").trim()).filter(Boolean)
    : [];
}

function buildInitialItemDecisions(items) {
  const decisions = {};

  (Array.isArray(items) ? items : []).forEach((item) => {
    const orderItemId = getOrderItemId(item);
    if (!orderItemId) return;

    const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
    const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");
    const decision = {};

    if (reuseOptions.length === 1) decision.reuse_intent = reuseOptions[0];
    if (deliveryOptions.length === 1) decision.delivery_state = deliveryOptions[0];
    if (Object.keys(decision).length > 0) decisions[orderItemId] = decision;
  });

  return decisions;
}

function getAuthorizerUserId(authorizer) {
  const userId = Number(authorizer?.user_id ?? authorizer?.user?.id ?? 0);
  return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function getAuthorizerLabel(authorizer) {
  /*
   * activeAuthorizersForContext() devuelve:
   * {
   *   id,
   *   user_id,
   *   name,
   *   email,
   *   can_self_authorize
   * }
   *
   * Se conserva el fallback a user.* por compatibilidad con payloads anteriores.
   */
  const name = String(authorizer?.name || authorizer?.user?.name || "").trim();
  const email = String(authorizer?.email || authorizer?.user?.email || "").trim();

  if (name && email) return `${name} · ${email}`;
  if (name) return name;
  if (email) return email;

  const userId = getAuthorizerUserId(authorizer);
  return userId ? `Autorizador ${userId}` : "Autorizador";
}

export default function WaiterCancellationDialog({
  open,
  type = "partial",
  selectedItems = [],
  context = null,
  requiresAuthorization = false,
  loading = false,
  error = "",
  onClose,
  onConfirm,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isFull = String(type || "").toLowerCase() === "full";

  const [reasonCode, setReasonCode] = useState("");
  const [reasonNote, setReasonNote] = useState("");
  const [authorizerUserId, setAuthorizerUserId] = useState("");
  const [pin, setPin] = useState("");
  const [itemDecisions, setItemDecisions] = useState({});
  const [stepIndex, setStepIndex] = useState(0);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const authorizers = useMemo(() => {
    return (Array.isArray(context?.authorizers) ? context.authorizers : [])
      .map((authorizer) => ({
        raw: authorizer,
        userId: getAuthorizerUserId(authorizer),
        label: getAuthorizerLabel(authorizer),
      }))
      .filter((authorizer) => authorizer.userId);
  }, [context]);

  const physicalResolutionItems = useMemo(() => {
    return (Array.isArray(selectedItems) ? selectedItems : []).filter((item) => {
      return normalizePhysicalOptions(item, "reuse_intents").length > 0 ||
        normalizePhysicalOptions(item, "delivery_states").length > 0;
    });
  }, [selectedItems]);

  const hasPhysicalResolution = physicalResolutionItems.length > 0;

  const physicalPaginationKey = useMemo(() => {
    const itemsKey = physicalResolutionItems
      .map((item) => `${getOrderItemId(item) || 0}:${Number(item?.selected_quantity || 0)}`)
      .join("|");

    return `${open ? "open" : "closed"}:${itemsKey}`;
  }, [open, physicalResolutionItems]);

  const {
    page: physicalPage,
    nextPage: nextPhysicalPage,
    prevPage: prevPhysicalPage,
    total: physicalTotal,
    totalPages: physicalTotalPages,
    startItem: physicalStartItem,
    endItem: physicalEndItem,
    hasPrev: physicalHasPrev,
    hasNext: physicalHasNext,
    paginatedItems: paginatedPhysicalItems,
  } = usePagination({
    items: physicalResolutionItems,
    initialPage: 1,
    pageSize: 4,
    mode: "frontend",
    resetKey: physicalPaginationKey,
  });

  const missingPhysicalDecision = useMemo(() => {
    return physicalResolutionItems.some((item) => {
      const orderItemId = getOrderItemId(item);
      if (!orderItemId) return false;

      const decision = itemDecisions?.[orderItemId] || {};
      const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
      const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");

      if (reuseOptions.length > 0 && !reuseOptions.includes(String(decision?.reuse_intent || ""))) return true;
      if (deliveryOptions.length > 0 && !deliveryOptions.includes(String(decision?.delivery_state || ""))) return true;

      return false;
    });
  }, [physicalResolutionItems, itemDecisions]);

  const steps = useMemo(() => {
    const result = [{ key: "reason", label: "Motivo" }];

    if (hasPhysicalResolution) result.push({ key: "physical", label: "Resolución" });
    if (requiresAuthorization) result.push({ key: "authorization", label: "Autorización" });

    return result;
  }, [hasPhysicalResolution, requiresAuthorization]);

  const currentStep = steps[stepIndex] || steps[0];
  const isLastStep = stepIndex === steps.length - 1;

  const canContinue = useMemo(() => {
    if (!currentStep) return false;
    if (currentStep.key === "reason") return Boolean(reasonCode);
    if (currentStep.key === "physical") return !missingPhysicalDecision;

    if (currentStep.key === "authorization") {
      return Number(authorizerUserId) > 0 && Boolean(String(pin || "").trim());
    }

    return false;
  }, [currentStep, reasonCode, missingPhysicalDecision, authorizerUserId, pin]);

  const canSubmit =
    selectedItems.length > 0 &&
    Boolean(reasonCode) &&
    !missingPhysicalDecision &&
    (!requiresAuthorization || (Number(authorizerUserId) > 0 && Boolean(String(pin || "").trim())));

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((previous) => ({ ...previous, open: false }));
  };

  useEffect(() => {
    if (!open) return;

    setReasonCode("");
    setReasonNote("");
    setAuthorizerUserId("");
    setPin("");
    setStepIndex(0);
    setItemDecisions(buildInitialItemDecisions(selectedItems));
    setAlertState({
      open: false,
      severity: "error",
      title: "",
      message: "",
    });
  }, [open, selectedItems]);

  useEffect(() => {
    if (!open || !requiresAuthorization || authorizers.length !== 1) return;
    setAuthorizerUserId(String(authorizers[0].userId));
  }, [open, requiresAuthorization, authorizers]);

  useEffect(() => {
    if (stepIndex <= steps.length - 1) return;
    setStepIndex(Math.max(0, steps.length - 1));
  }, [stepIndex, steps.length]);

  const updateDecision = (orderItemId, field, value) => {
    if (!orderItemId) return;

    setItemDecisions((previous) => {
      const next = { ...previous };
      const decision = { ...(next[orderItemId] || {}) };

      if (value) decision[field] = value;
      else delete decision[field];

      if (Object.keys(decision).length > 0) next[orderItemId] = decision;
      else delete next[orderItemId];

      return next;
    });
  };

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  const validateReasonStep = () => {
    if (reasonCode) return true;

    showAlert({
      severity: "warning",
      title: "Falta información",
      message: "Debes indicar el motivo de la cancelación.",
    });

    return false;
  };

  const validatePhysicalStep = () => {
    if (!missingPhysicalDecision) return true;

    showAlert({
      severity: "warning",
      title: "Resolución física pendiente",
      message: "Debes resolver el destino físico de todos los productos que lo requieren.",
    });

    return false;
  };

  const validateAuthorizationStep = () => {
    if (!(Number(authorizerUserId) > 0)) {
      showAlert({
        severity: "warning",
        title: "Falta autorización",
        message: "Debes seleccionar un autorizador operativo.",
      });
      return false;
    }

    if (!String(pin || "").trim()) {
      showAlert({
        severity: "warning",
        title: "Falta autorización",
        message: "Debes ingresar el PIN del autorizador operativo.",
      });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (loading || isLastStep || !canContinue) return;

    if (currentStep?.key === "reason" && !validateReasonStep()) return;
    if (currentStep?.key === "physical" && !validatePhysicalStep()) return;

    setStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
  };

  const handleBack = () => {
    if (loading) return;

    if (stepIndex === 0) {
      handleClose();
      return;
    }

    setStepIndex((previous) => Math.max(0, previous - 1));
  };

  const handleConfirm = async () => {
    if (loading || !canSubmit) return;
    if (!validateReasonStep()) return;
    if (hasPhysicalResolution && !validatePhysicalStep()) return;
    if (requiresAuthorization && !validateAuthorizationStep()) return;

    const resolution = {
      reason_code: reasonCode,
      reason_note: String(reasonNote || "").trim() || null,
      item_decisions: itemDecisions,
    };

    if (requiresAuthorization) {
      resolution.authorizer_user_id = Number(authorizerUserId);
      resolution.pin = String(pin || "").trim();
    }

    try {
      const result = await onConfirm?.(resolution);

      if (result?.ok === false) {
        const externalMessage = String(error || "").trim();

        showAlert({
          severity: "error",
          title: "No se pudo cancelar",
          message:
            result?.message ||
            result?.error ||
            externalMessage ||
            "No fue posible aplicar la cancelación.",
        });
      }
    } catch (requestError) {
      const errors = requestError?.response?.data?.errors;
      const firstError =
        errors && typeof errors === "object"
          ? Object.values(errors)?.flat()?.[0]
          : null;

      showAlert({
        severity: "error",
        title: "No se pudo cancelar",
        message:
          firstError ||
          requestError?.response?.data?.message ||
          requestError?.message ||
          "No fue posible aplicar la cancelación.",
      });
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={loading ? undefined : handleClose}
        fullWidth
        maxWidth="sm"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              height: { xs: "100dvh", sm: "min(680px, calc(100dvh - 48px))" },
              maxHeight: { xs: "100dvh", sm: "calc(100dvh - 48px)" },
              borderRadius: { xs: 0, sm: 1 },
              overflow: "hidden",
              bgcolor: "background.paper",
              display: "flex",
              flexDirection: "column",
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
            flexShrink: 0,
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 }, lineHeight: 1.2, color: "#fff" }}>
                {isFull ? "Cancelar comanda" : "Cancelar productos"}
              </Typography>

              <Typography sx={{ mt: 0.5, fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
                {isFull
                  ? "Confirma el motivo y la resolución operativa de la comanda."
                  : "Confirma el motivo y la resolución operativa de los productos seleccionados."}
              </Typography>
            </Box>

            <IconButton
              onClick={handleClose}
              disabled={loading}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                flexShrink: 0,
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            bgcolor: "background.default",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
          }}
        >
          <Card
            sx={{
              flex: 1,
              minHeight: 0,
              width: "100%",
              borderRadius: 0,
              bgcolor: "background.paper",
              display: "flex",
            }}
          >
            <CardContent
              sx={{
                p: { xs: 1.5, sm: 2.5 },
                pb: { xs: 1.5, sm: 2.5 },
                width: "100%",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                "&:last-child": { pb: { xs: 1.5, sm: 2.5 } },
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
                  <Chip
                    label={isFull ? "Cancelación total" : "Cancelación parcial"}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: isFull ? "warning.light" : "rgba(63,81,181,0.10)",
                      color: isFull ? "warning.dark" : "#3434A8",
                    }}
                  />

                  <Chip
                    label={selectedItems.length === 1 ? "1 partida seleccionada" : `${selectedItems.length} partidas seleccionadas`}
                    size="small"
                    sx={{ bgcolor: "#111827", color: "#fff", fontWeight: 800 }}
                  />
                </Stack>

                <StepIndicator steps={steps} currentIndex={stepIndex} />
              </Box>

              <Divider sx={{ my: 2, flexShrink: 0 }} />

              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: { xs: 0.25, sm: 0.75 } }}>
                {currentStep?.key === "reason" ? (
                  <Stack spacing={2.5}>
                    <StepIntro
                      number={stepIndex + 1}
                      title="Motivo de cancelación"
                      description="Indica por qué se está realizando esta cancelación."
                    />

                    <FieldBlock
                      label="Motivo *"
                      input={
                        <TextField
                          select
                          fullWidth
                          value={reasonCode}
                          onChange={(event) => setReasonCode(event.target.value)}
                          disabled={loading}
                        >
                          <MenuItem value="">Selecciona un motivo</MenuItem>

                          {REASON_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      }
                    />

                    <FieldBlock
                      label="Nota"
                      help={`${reasonNote.length}/500 caracteres · Opcional`}
                      input={
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          maxRows={5}
                          value={reasonNote}
                          onChange={(event) => setReasonNote(event.target.value.slice(0, 500))}
                          disabled={loading}
                          placeholder="Observación opcional"
                        />
                      }
                    />
                  </Stack>
                ) : null}

                {currentStep?.key === "physical" ? (
                  <Stack spacing={2.5}>
                    <StepIntro
                      number={stepIndex + 1}
                      title="Resolución física"
                      description="Indica qué debe ocurrir físicamente con cada producto cancelado."
                    />

                    <Stack spacing={1.5}>
                      {paginatedPhysicalItems.map((item) => {
                        const orderItemId = getOrderItemId(item);
                        const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
                        const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");

                        if (!orderItemId) return null;

                        const decision = itemDecisions?.[orderItemId] || {};
                        const selectedQuantity = Math.max(1, Number(item?.selected_quantity || 1));

                        return (
                          <Box
                            key={`waiter-cancellation-resolution-${orderItemId}`}
                            sx={{
                              p: { xs: 1.5, sm: 2 },
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "background.default",
                              borderRadius: 1,
                            }}
                          >
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                                <Typography sx={{ minWidth: 0, fontSize: 15, fontWeight: 800, color: "text.primary" }}>
                                  {getItemLabel(item)}
                                </Typography>

                                <Chip
                                  label={`Cant. ${selectedQuantity}`}
                                  size="small"
                                  sx={{
                                    flexShrink: 0,
                                    fontWeight: 800,
                                    bgcolor: "rgba(63,81,181,0.10)",
                                    color: "#3434A8",
                                  }}
                                />
                              </Stack>

                              {reuseOptions.length > 0 ? (
                                <PhysicalChoiceBlock
                                  label="Destino físico"
                                  options={reuseOptions}
                                  value={decision?.reuse_intent || ""}
                                  labels={REUSE_LABELS}
                                  loading={loading}
                                  onChange={(value) => updateDecision(orderItemId, "reuse_intent", value)}
                                />
                              ) : null}

                              {deliveryOptions.length > 0 ? (
                                <PhysicalChoiceBlock
                                  label="Estado de entrega"
                                  options={deliveryOptions}
                                  value={decision?.delivery_state || ""}
                                  labels={DELIVERY_LABELS}
                                  loading={loading}
                                  onChange={(value) => updateDecision(orderItemId, "delivery_state", value)}
                                />
                              ) : null}
                            </Stack>
                          </Box>
                        );
                      })}
                    </Stack>

                    {physicalTotal > 4 ? (
                      <Box
                        sx={{
                          overflow: "hidden",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <PaginationFooter
                          page={physicalPage}
                          totalPages={physicalTotalPages}
                          startItem={physicalStartItem}
                          endItem={physicalEndItem}
                          total={physicalTotal}
                          hasPrev={physicalHasPrev}
                          hasNext={physicalHasNext}
                          onPrev={prevPhysicalPage}
                          onNext={nextPhysicalPage}
                          itemLabel="productos"
                        />
                      </Box>
                    ) : null}
                  </Stack>
                ) : null}

                {currentStep?.key === "authorization" ? (
                  <Stack spacing={2.5}>
                    <StepIntro
                      number={stepIndex + 1}
                      title="Autorización operativa"
                      description="La cancelación requiere la autorización de un usuario autorizado de la sucursal."
                    />

                    <Box
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.default",
                        borderRadius: 1,
                      }}
                    >
                      <Stack spacing={2.5}>
                        <FieldBlock
                          label="Autorizador *"
                          help={authorizers.length === 1 ? "Se seleccionó automáticamente el único autorizador disponible." : null}
                          input={
                            <TextField
                              select
                              fullWidth
                              value={authorizerUserId}
                              onChange={(event) => setAuthorizerUserId(event.target.value)}
                              disabled={loading || authorizers.length === 0}
                            >
                              <MenuItem value="">Selecciona un autorizador</MenuItem>

                              {authorizers.map((authorizer) => (
                                <MenuItem key={authorizer.userId} value={String(authorizer.userId)}>
                                  {authorizer.label}
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
                              onChange={(event) => setPin(event.target.value)}
                              disabled={loading || authorizers.length === 0}
                              autoComplete="off"
                              inputProps={{ maxLength: 50 }}
                              placeholder="PIN del autorizador"
                            />
                          }
                        />
                      </Stack>
                    </Box>
                  </Stack>
                ) : null}
              </Box>

              <Divider sx={{ my: 2, flexShrink: 0 }} />

              <Stack direction="row" justifyContent="space-between" spacing={1.5} sx={{ flexShrink: 0 }}>
                <Button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  variant="outlined"
                  startIcon={stepIndex > 0 ? <ArrowBackIcon /> : null}
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
                    disabled={loading || !canContinue}
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
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
                ) : (
                  <Button
                    type="button"
                    onClick={handleConfirm}
                    disabled={loading || !canSubmit}
                    variant="contained"
                    startIcon={<DeleteOutlineIcon />}
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
                    {loading ? "Procesando…" : isFull ? "Cancelar comanda" : "Cancelar productos"}
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </>
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
                  width: { xs: 76, sm: 100 },
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
      <Typography sx={{ fontSize: { xs: 18, sm: 20 }, fontWeight: 800, color: "text.primary", lineHeight: 1.25 }}>
        {number}. {title}
      </Typography>

      <Typography sx={{ mt: 0.5, fontSize: 12.5, color: "text.secondary", lineHeight: 1.5 }}>
        {description}
      </Typography>
    </Box>
  );
}

function PhysicalChoiceBlock({
  label,
  options = [],
  value = "",
  labels = {},
  loading = false,
  onChange,
}) {
  const singleOption = options.length === 1;

  return (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary", mb: 1 }}>
        {label}
      </Typography>

      {singleOption ? (
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            border: "1px solid",
            borderColor: "primary.main",
            bgcolor: "rgba(255,122,0,0.06)",
            borderRadius: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
            {labels[options[0]] || options[0]}
          </Typography>

          <Chip label="Automático" size="small" sx={{ flexShrink: 0, fontSize: 10.5, fontWeight: 800 }} />
        </Box>
      ) : (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          {options.map((option) => {
            const selected = String(value || "") === String(option);

            return (
              <Button
                key={option}
                type="button"
                fullWidth
                disabled={loading}
                variant={selected ? "contained" : "outlined"}
                onClick={() => onChange?.(option)}
                sx={{
                  minHeight: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                  boxShadow: "none",
                  textTransform: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                {labels[option] || option}
              </Button>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary", mb: 1 }}>
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