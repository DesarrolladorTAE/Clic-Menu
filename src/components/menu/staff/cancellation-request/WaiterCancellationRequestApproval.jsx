import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Chip, Divider, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import AppAlert from "../../../common/AppAlert";
import PaginationFooter from "../../../common/PaginationFooter";
import usePagination from "../../../../hooks/usePagination";

import {
  buildApprovalPayload,
  buildInitialItemDecisions,
  DELIVERY_LABELS,
  DELIVERY_NOT_DELIVERED,
  getItemLabel,
  getOrderItemId,
  getPhysicalResolutionItems,
  getRequestedQuantity,
  normalizePhysicalOptions,
  requiresReuseDecision,
  REUSE_LABELS,
} from "./waiterCancellationRequest.utils";

export default function WaiterCancellationRequestApproval({
  items = [],
  requiresAuthorization = false,
  authorizers = [],
  loading = false,
  onBack,
  onConfirm,
}) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  const physicalItems = useMemo(() => getPhysicalResolutionItems(items), [items]);
  const hasPhysicalResolution = physicalItems.length > 0;

  const steps = useMemo(() => {
    const result = [];

    if (hasPhysicalResolution) {
      result.push({ key: "physical", label: "Resolución" });
    }

    if (requiresAuthorization) {
      result.push({ key: "authorization", label: "Autorización" });
    }

    return result;
  }, [hasPhysicalResolution, requiresAuthorization]);

  const [stepIndex, setStepIndex] = useState(0);
  const [itemDecisions, setItemDecisions] = useState({});
  const [authorizerUserId, setAuthorizerUserId] = useState("");
  const [pin, setPin] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "warning",
    title: "",
    message: "",
  });

  const currentStep = steps[stepIndex] || steps[0] || null;
  const isLastStep = stepIndex === steps.length - 1;

  const physicalPaginationKey = useMemo(() => {
    return physicalItems
      .map((item) => `${getOrderItemId(item) || 0}:${getRequestedQuantity(item)}`)
      .join("|");
  }, [physicalItems]);

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
    items: physicalItems,
    initialPage: 1,
    pageSize: 4,
    mode: "frontend",
    resetKey: physicalPaginationKey,
  });

  const missingPhysicalDecision = useMemo(() => {
    return physicalItems.some((item) => {
      const orderItemId = getOrderItemId(item);

      if (!orderItemId) {
        return true;
      }

      const decision = itemDecisions?.[orderItemId] || {};
      const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
      const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");
      const deliveryState = String(decision?.delivery_state || "");
      const reuseIntent = String(decision?.reuse_intent || "");

      if (deliveryOptions.length > 0 && !deliveryOptions.includes(deliveryState)) {
        return true;
      }

      if (requiresReuseDecision(item, decision)) {
        if (reuseOptions.length === 0) {
          return true;
        }

        if (!reuseOptions.includes(reuseIntent)) {
          return true;
        }
      }

      return false;
    });
  }, [physicalItems, itemDecisions]);

  const canContinue = useMemo(() => {
    if (!currentStep) {
      return false;
    }

    if (currentStep.key === "physical") {
      return !missingPhysicalDecision;
    }

    if (currentStep.key === "authorization") {
      return Number(authorizerUserId) > 0 && Boolean(String(pin || "").trim());
    }

    return false;
  }, [currentStep, missingPhysicalDecision, authorizerUserId, pin]);

  useEffect(() => {
    setStepIndex(0);
    setItemDecisions(buildInitialItemDecisions(items));
    setAuthorizerUserId("");
    setPin("");
    setAlertState({
      open: false,
      severity: "warning",
      title: "",
      message: "",
    });
  }, [items]);

  useEffect(() => {
    if (!requiresAuthorization || authorizers.length !== 1) {
      return;
    }

    setAuthorizerUserId(String(authorizers[0].userId));
  }, [requiresAuthorization, authorizers]);

  const showAlert = (message, title = "Aviso") => {
    setAlertState({
      open: true,
      severity: "warning",
      title,
      message,
    });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((previous) => ({
      ...previous,
      open: false,
    }));
  };

  const updateDecision = (orderItemId, field, value) => {
    if (!orderItemId) {
      return;
    }

    setItemDecisions((previous) => {
      const next = { ...previous };
      const decision = { ...(next[orderItemId] || {}) };

      if (value) {
        decision[field] = value;
      } else {
        delete decision[field];
      }

      if (Object.keys(decision).length > 0) {
        next[orderItemId] = decision;
      } else {
        delete next[orderItemId];
      }

      return next;
    });
  };

  const updateDeliveryDecision = (item, value) => {
    const orderItemId = getOrderItemId(item);

    if (!orderItemId) {
      return;
    }

    const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");

    setItemDecisions((previous) => {
      const next = { ...previous };
      const decision = { ...(next[orderItemId] || {}) };

      if (value) {
        decision.delivery_state = value;
      } else {
        delete decision.delivery_state;
      }

      if (value === DELIVERY_NOT_DELIVERED) {
        const currentReuseIntent = String(decision?.reuse_intent || "");

        if (reuseOptions.length === 1) {
          decision.reuse_intent = reuseOptions[0];
        } else if (currentReuseIntent && !reuseOptions.includes(currentReuseIntent)) {
          delete decision.reuse_intent;
        }
      } else {
        delete decision.reuse_intent;
      }

      if (Object.keys(decision).length > 0) {
        next[orderItemId] = decision;
      } else {
        delete next[orderItemId];
      }

      return next;
    });
  };

  const validatePhysicalStep = () => {
    if (!missingPhysicalDecision) {
      return true;
    }

    showAlert(
      "Debes completar todas las decisiones físicas de los productos antes de continuar.",
      "Resolución física pendiente",
    );

    return false;
  };

  const validateAuthorizationStep = () => {
    if (!(Number(authorizerUserId) > 0)) {
      showAlert("Debes seleccionar un autorizador operativo.", "Falta autorización");
      return false;
    }

    if (!String(pin || "").trim()) {
      showAlert("Debes ingresar el PIN del autorizador operativo.", "Falta autorización");
      return false;
    }

    return true;
  };

  const handleBack = () => {
    if (loading) {
      return;
    }

    if (stepIndex === 0) {
      onBack?.();
      return;
    }

    setStepIndex((previous) => Math.max(0, previous - 1));
  };

  const handleContinue = async () => {
    if (loading || !currentStep || !canContinue) {
      return;
    }

    if (currentStep.key === "physical" && !validatePhysicalStep()) {
      return;
    }

    if (currentStep.key === "authorization" && !validateAuthorizationStep()) {
      return;
    }

    if (!isLastStep) {
      setStepIndex((previous) => Math.min(previous + 1, steps.length - 1));
      return;
    }

    const payload = buildApprovalPayload(
      items,
      itemDecisions,
      requiresAuthorization,
      authorizerUserId,
      pin,
    );

    await onConfirm?.(payload);
  };

  return (
    <>
      <Stack
        sx={{
          flex: 1,
          minHeight: 0,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            pr: { xs: 0.25, sm: 0.75 },
          }}
        >
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2 }}>
            <Chip
              label="Aprobando solicitud"
              size="small"
              sx={{
                fontWeight: 800,
                bgcolor: alpha(primaryColor, 0.1),
                color: primaryColor,
              }}
            />

            <Chip
              label={items.length === 1 ? "1 partida solicitada" : `${items.length} partidas solicitadas`}
              size="small"
              sx={{
                bgcolor: "text.primary",
                color: "#fff",
                fontWeight: 800,
              }}
            />
          </Stack>

          <StepIndicator
            steps={steps}
            currentIndex={stepIndex}
            primaryColor={primaryColor}
          />

          <Divider sx={{ my: 2 }} />

          {currentStep?.key === "physical" ? (
            <Stack spacing={2.5}>
              <StepIntro
                number={stepIndex + 1}
                title="Resolución física"
                description="Completa las decisiones físicas necesarias para cada producto solicitado."
              />

              <Stack spacing={1.5}>
                {paginatedPhysicalItems.map((item) => {
                  const orderItemId = getOrderItemId(item);

                  if (!orderItemId) {
                    return null;
                  }

                  const reuseOptions = normalizePhysicalOptions(item, "reuse_intents");
                  const deliveryOptions = normalizePhysicalOptions(item, "delivery_states");
                  const decision = itemDecisions?.[orderItemId] || {};
                  const reuseRequired = requiresReuseDecision(item, decision);

                  return (
                    <Box
                      key={`qr-cancellation-resolution-${orderItemId}`}
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
                          <Typography
                            sx={{
                              minWidth: 0,
                              fontSize: 15,
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {getItemLabel(item)}
                          </Typography>

                          <Chip
                            label={`Cant. ${getRequestedQuantity(item)}`}
                            size="small"
                            sx={{
                              flexShrink: 0,
                              bgcolor: alpha(primaryColor, 0.1),
                              color: primaryColor,
                              fontWeight: 800,
                            }}
                          />
                        </Stack>

                        {deliveryOptions.length > 0 ? (
                          <PhysicalChoiceBlock
                            label="Estado de entrega"
                            options={deliveryOptions}
                            value={decision?.delivery_state || ""}
                            labels={DELIVERY_LABELS}
                            loading={loading}
                            primaryColor={primaryColor}
                            onChange={(value) => updateDeliveryDecision(item, value)}
                          />
                        ) : null}

                        {reuseRequired && reuseOptions.length > 0 ? (
                          <PhysicalChoiceBlock
                            label="Destino físico"
                            options={reuseOptions}
                            value={decision?.reuse_intent || ""}
                            labels={REUSE_LABELS}
                            loading={loading}
                            primaryColor={primaryColor}
                            onChange={(value) => updateDecision(orderItemId, "reuse_intent", value)}
                          />
                        ) : null}

                        {reuseRequired && reuseOptions.length === 0 ? (
                          <Box
                            sx={{
                              p: 1.25,
                              border: "1px solid",
                              borderColor: "warning.main",
                              bgcolor: alpha(theme.palette.warning.main, 0.08),
                              borderRadius: 1,
                            }}
                          >
                            <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: "warning.dark", lineHeight: 1.45 }}>
                              No hay opciones de destino físico disponibles para completar esta cancelación.
                            </Typography>
                          </Box>
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
                description="La solicitud requiere la autorización de un usuario autorizado de la sucursal."
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
                  {authorizers.length === 0 ? (
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: "warning.main",
                        lineHeight: 1.5,
                      }}
                    >
                      No hay autorizadores disponibles para completar esta cancelación.
                    </Typography>
                  ) : null}

                  <FieldBlock
                    label="Autorizador *"
                    help={
                      authorizers.length === 1
                        ? "Se seleccionó automáticamente el único autorizador disponible."
                        : null
                    }
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

          <Box sx={{ height: 8 }} />
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            bgcolor: "background.paper",
          }}
        >
          <Divider sx={{ my: 2 }} />

          <Stack direction="row" justifyContent="space-between" spacing={1.25}>
            <Button
              type="button"
              variant="outlined"
              disabled={loading}
              startIcon={<ArrowBackIcon />}
              onClick={handleBack}
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

            <Button
              type="button"
              variant="contained"
              color="primary"
              disabled={loading || !canContinue}
              onClick={handleContinue}
              startIcon={isLastStep ? <CheckRoundedIcon /> : null}
              endIcon={!isLastStep ? <ArrowForwardIcon /> : null}
              sx={{
                flex: { xs: 1, sm: "0 0 auto" },
                minWidth: { sm: 190 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              }}
            >
              {loading ? "Procesando…" : isLastStep ? "Aprobar solicitud" : "Continuar"}
            </Button>
          </Stack>
        </Box>
      </Stack>

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

function StepIndicator({ steps, currentIndex, primaryColor }) {
  return (
    <Box sx={{ width: "100%", px: { xs: 0, sm: 0.5 } }}>
      <Stack direction="row" alignItems="flex-start" sx={{ width: "100%" }}>
        {steps.map((step, index) => {
          const active = index === currentIndex;
          const completed = index < currentIndex;
          const reached = index <= currentIndex;
          const hasNext = index < steps.length - 1;

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
                    bgcolor: reached ? primaryColor : "action.disabledBackground",
                    color: "#fff",
                    fontSize: { xs: 13, sm: 14 },
                    fontWeight: 900,
                    boxShadow: active ? `0 0 0 4px ${alpha(primaryColor, 0.12)}` : "none",
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
                    color: active ? primaryColor : completed ? "text.primary" : "text.secondary",
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
                    bgcolor: completed ? primaryColor : "divider",
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

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 12.5,
          color: "text.secondary",
          lineHeight: 1.5,
        }}
      >
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
  primaryColor,
  onChange,
}) {
  const singleOption = options.length === 1;

  return (
    <Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {singleOption ? (
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            border: "1px solid",
            borderColor: primaryColor,
            bgcolor: alpha(primaryColor, 0.06),
            borderRadius: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            {labels[options[0]] || options[0]}
          </Typography>

          <Chip
            label="Automático"
            size="small"
            sx={{
              flexShrink: 0,
              fontSize: 10.5,
              fontWeight: 800,
            }}
          />
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
                color="primary"
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