import React, { useMemo } from "react";
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, MenuItem,
  Stack, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function CashierDiscountAuthorizationDialog({
  open,
  onClose,
  authorizers = [],
  loadingAuthorizers = false,
  saving = false,
  form,
  onFormChange,
  onSubmit,
  error = "",
  pendingRequest = null,
  discountPolicy = null,
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const safeAuthorizers = Array.isArray(authorizers) ? authorizers : [];

  const selectedAuthorizer = useMemo(() => {
    const selectedUserId = Number(form?.user_id || 0);

    if (!selectedUserId) return null;

    return (
      safeAuthorizers.find(
        (authorizer) => Number(authorizer?.user_id || 0) === selectedUserId
      ) || null
    );
  }, [form?.user_id, safeAuthorizers]);

  const calculation = discountPolicy?.calculation || {};
  const policy = discountPolicy?.policy || {};

  const requestPayload = pendingRequest?.payload || {};
  const discountType = String(requestPayload?.type || "");
  const discountValue = Number(requestPayload?.value || 0);
  const reason = requestPayload?.reason || "";

  const baseAmount = firstValidNumber([
    calculation?.base_amount,
    discountPolicy?.base_amount,
  ]);

  const amountApplied = firstValidNumber([
    calculation?.amount_applied,
    discountPolicy?.amount_applied,
  ]);

  const effectivePercent = firstValidNumber([
    calculation?.effective_percent,
    discountPolicy?.effective_percent,
  ]);

  const maxDiscountPercent = firstValidNumber([
    calculation?.max_discount_percent,
    policy?.max_discount_percent,
    discountPolicy?.max_discount_percent,
  ]);

  const maxDiscountAmount = firstValidNumber([
    calculation?.max_discount_amount,
    policy?.max_discount_amount,
    discountPolicy?.max_discount_amount,
  ]);

  const scopeLabel =
    pendingRequest?.scope === "item"
      ? "Descuento por ítem"
      : "Descuento total";

  const discountLabel =
    discountType === "percent"
      ? `${formatDecimal(discountValue)}%`
      : formatCurrency(discountValue);

  const canSubmit =
    !saving &&
    !loadingAuthorizers &&
    safeAuthorizers.length > 0 &&
    Number(form?.user_id || 0) > 0 &&
    String(form?.pin || "").trim() !== "";

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
      scroll="paper"
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
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 1,
                bgcolor: "rgba(255, 152, 0, 0.16)",
                color: "#FF9800",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                mt: 0.15,
              }}
            >
              <LockRoundedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                  wordBreak: "break-word",
                }}
              >
                Autorizar descuento
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                  lineHeight: 1.45,
                }}
              >
                Este descuento excede los límites configurados. Selecciona un
                autorizador e ingresa su PIN para continuar.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={saving}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 1,
              flexShrink: 0,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.16)",
              },
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.4)",
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "background.default",
        }}
      >
        <Stack spacing={2}>
          {pendingRequest?.message ? (
            <Alert
              severity="warning"
              icon={<WarningAmberRoundedIcon />}
              sx={{
                borderRadius: 1,
                "& .MuiAlert-message": {
                  width: "100%",
                },
              }}
            >
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>
                {pendingRequest.message}
              </Typography>
            </Alert>
          ) : null}

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#fff",
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <LocalOfferRoundedIcon color="primary" />
                  <Typography sx={{ fontSize: 17, fontWeight: 800 }}>
                    Detalle del descuento
                  </Typography>
                </Stack>

                <Chip
                  label={scopeLabel}
                  size="small"
                  sx={{
                    alignSelf: { xs: "flex-start", sm: "center" },
                    fontWeight: 800,
                    bgcolor: "#FFF3E0",
                    color: "#A75A00",
                  }}
                />
              </Stack>

              <Divider />

              <Stack spacing={0.9}>
                <InfoRow
                  label="Tipo"
                  value={
                    discountType === "percent" ? "Porcentaje" : "Monto fijo"
                  }
                />

                <InfoRow label="Valor capturado" value={discountLabel} />

                {baseAmount !== null ? (
                  <InfoRow label="Base" value={formatCurrency(baseAmount)} />
                ) : null}

                {amountApplied !== null ? (
                  <InfoRow
                    label="Descuento calculado"
                    value={formatCurrency(amountApplied)}
                  />
                ) : null}

                {effectivePercent !== null ? (
                  <InfoRow
                    label="Porcentaje efectivo"
                    value={`${formatDecimal(effectivePercent)}%`}
                  />
                ) : null}

                {maxDiscountPercent !== null ? (
                  <InfoRow
                    label="Máximo permitido"
                    value={`${formatDecimal(maxDiscountPercent)}%`}
                  />
                ) : null}

                {maxDiscountAmount !== null ? (
                  <InfoRow
                    label="Monto máximo permitido"
                    value={formatCurrency(maxDiscountAmount)}
                  />
                ) : null}

                {reason ? <InfoRow label="Motivo" value={reason} /> : null}
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#fff",
              p: { xs: 1.5, sm: 2 },
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <VerifiedUserRoundedIcon color="primary" />
                <Typography sx={{ fontSize: 17, fontWeight: 800 }}>
                  Datos de autorización
                </Typography>
              </Stack>

              {loadingAuthorizers ? (
                <Box
                  sx={{
                    minHeight: 96,
                    display: "grid",
                    placeItems: "center",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Stack spacing={1} alignItems="center">
                    <CircularProgress size={24} />
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      Cargando autorizadores…
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <>
                  {safeAuthorizers.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 1 }}>
                      No hay autorizadores disponibles para esta sucursal.
                    </Alert>
                  ) : null}

                  <FieldBlock
                    label="Autorizador *"
                    input={
                      <TextField
                        select
                        fullWidth
                        value={form?.user_id || ""}
                        onChange={(e) =>
                          onFormChange?.("user_id", e.target.value)
                        }
                        disabled={saving || safeAuthorizers.length === 0}
                      >
                        <MenuItem value="">Selecciona un autorizador</MenuItem>

                        {safeAuthorizers.map((authorizer) => (
                          <MenuItem
                            key={`${authorizer.id}-${authorizer.user_id}`}
                            value={String(authorizer.user_id)}
                          >
                            {authorizer.name || `Usuario #${authorizer.user_id}`}
                            {authorizer?.role?.label
                              ? ` · ${authorizer.role.label}`
                              : ""}
                          </MenuItem>
                        ))}
                      </TextField>
                    }
                  />

                  {selectedAuthorizer ? (
                    <Box
                      sx={{
                        borderRadius: 1,
                        px: 1.25,
                        py: 1,
                        bgcolor: "rgba(255, 152, 0, 0.06)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        {selectedAuthorizer.name}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          fontSize: 12,
                          color: "text.secondary",
                          lineHeight: 1.45,
                        }}
                      >
                        {selectedAuthorizer?.role?.label || "Autorizador"}
                        {selectedAuthorizer?.is_current_user
                          ? " · Usuario actual"
                          : ""}
                      </Typography>
                    </Box>
                  ) : null}

                  <FieldBlock
                    label="PIN de autorización *"
                    input={
                      <TextField
                        fullWidth
                        type="password"
                        value={form?.pin || ""}
                        onChange={(e) => onFormChange?.("pin", e.target.value)}
                        placeholder="Ingresa el PIN"
                        inputProps={{
                          inputMode: "numeric",
                          autoComplete: "off",
                        }}
                        disabled={saving || safeAuthorizers.length === 0}
                      />
                    }
                  />
                </>
              )}

              {error ? (
                <Alert severity="error" sx={{ borderRadius: 1 }}>
                  {error}
                </Alert>
              ) : null}
            </Stack>
          </Box>

          <Box
            sx={{
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              p: 1.5,
              backgroundColor: "#FCFCFC",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <PercentRoundedIcon
                sx={{ color: "#FF9800", fontSize: 20, mt: 0.2 }}
              />

              <Typography
                sx={{
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                }}
              >
                Al confirmar, se reintentará aplicar el mismo descuento con la
                autorización seleccionada. Si el PIN no corresponde, el
                descuento no se aplicará.
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.25}
          sx={{ width: "100%" }}
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={saving}
            sx={{
              minWidth: { xs: "100%", sm: 140 },
              height: 42,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!canSubmit}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <VerifiedUserRoundedIcon />
              )
            }
            sx={{
              minWidth: { xs: "100%", sm: 220 },
              height: 42,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            {saving ? "Autorizando…" : "Autorizar descuento"}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function FieldBlock({ label, input }) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography sx={fieldLabelSx}>{label}</Typography>
      {input}
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      spacing={0.5}
      sx={{ minWidth: 0 }}
    >
      <Typography
        sx={{
          fontSize: 14,
          color: "text.secondary",
          fontWeight: 700,
          lineHeight: 1.35,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          fontWeight: 800,
          lineHeight: 1.35,
          textAlign: { xs: "left", sm: "right" },
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function firstValidNumber(values = []) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    const number = Number(value);

    if (Number.isFinite(number)) {
      return number;
    }
  }

  return null;
}

function formatCurrency(value) {
  const safe = Number(value || 0);

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

function formatDecimal(value) {
  const safe = Number(value || 0);

  if (!Number.isFinite(safe)) {
    return "0";
  }

  return safe.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};
