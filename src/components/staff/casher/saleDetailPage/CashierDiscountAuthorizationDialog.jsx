import React, { useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function CashierDiscountAuthorizationDialog({
  open = false,
  onClose,
  onSubmit,
  authorizers = [],
  form,
  onFormChange,
  loading = false,
  busy = false,
  error = "",
  message = "",
  policy = null,
}) {
  const rows = Array.isArray(authorizers) ? authorizers : [];

  const selectedAuthorizer = useMemo(() => {
    return (
      rows.find(
        (row) => String(row?.user_id || "") === String(form?.user_id || "")
      ) || null
    );
  }, [rows, form?.user_id]);

  const policyRows = useMemo(() => buildPolicyRows(policy), [policy]);

  const shortMessage =
    "El descuento excede la política configurada. Completa autorización para continuar.";

  const handleClose = (_, reason) => {
    if (busy) return;
    if (reason === "backdropClick" && busy) return;
    onClose?.();
  };

  const canSubmit =
    !busy &&
    !loading &&
    rows.length > 0 &&
    !!form?.user_id &&
    !!String(form?.pin || "").trim();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 20,
        "& .MuiDialog-paper": {
          width: {
            xs: "calc(100% - 20px)",
            sm: "100%",
          },
          m: {
            xs: 1.25,
            sm: 3,
          },
          maxHeight: {
            xs: "calc(100dvh - 20px)",
            sm: "calc(100vh - 64px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: { xs: 1.25, sm: 1.5 },
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.38)",
        },
      }}
      BackdropProps={{
        sx: {
          backgroundColor: "rgba(0,0,0,0.48)",
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          backgroundColor: "#111",
          color: "#fff",
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: { xs: 1.75, sm: 2.5 },
            py: { xs: 1.4, sm: 1.75 },
            minWidth: 0,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{ minWidth: 0, flex: 1 }}
          >
            <Box
              sx={{
                width: { xs: 40, sm: 42 },
                height: { xs: 40, sm: 42 },
                borderRadius: 1.25,
                display: "grid",
                placeItems: "center",
                backgroundColor: "rgba(255, 152, 0, 0.22)",
                color: "#FF9800",
                flexShrink: 0,
              }}
            >
              <VerifiedUserRoundedIcon />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: { xs: 21, sm: 24 },
                  fontWeight: 900,
                  lineHeight: 1.05,
                  color: "#fff",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                Autorizar descuento
              </Typography>

              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: { xs: 12, sm: 13 },
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: "rgba(255,255,255,0.72)",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                Selecciona autorizador e ingresa PIN.
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={() => onClose?.()}
            disabled={busy}
            sx={{
              width: 40,
              height: 40,
              color: "#fff",
              backgroundColor: "rgba(255,255,255,0.10)",
              borderRadius: 1.25,
              flexShrink: 0,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.18)",
              },
              "&.Mui-disabled": {
                color: "rgba(255,255,255,0.35)",
              },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 1.75, sm: 2.5 },
          backgroundColor: "#FAFAFA",
          overflowX: "hidden",
        }}
      >
        <Stack spacing={1.75} sx={{ minWidth: 0, width: "100%" }}>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#fff",
              p: { xs: 1.25, sm: 1.5 },
              minWidth: 0,
              width: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="flex-start"
              sx={{ minWidth: 0, width: "100%" }}
            >
              <WarningAmberRoundedIcon
                sx={{
                  color: "#FF9800",
                  fontSize: 21,
                  mt: 0.1,
                  flexShrink: 0,
                }}
              />

              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 13, sm: 14 },
                    color: "text.primary",
                    fontWeight: 800,
                    lineHeight: 1.45,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                    whiteSpace: "normal",
                  }}
                >
                  {shortMessage}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              backgroundColor: "#fff",
              p: { xs: 1.5, sm: 2 },
              minWidth: 0,
              width: "100%",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <Stack spacing={1.6} sx={{ minWidth: 0, width: "100%" }}>
              <Typography
                sx={{
                  fontSize: { xs: 16, sm: 17 },
                  fontWeight: 900,
                  color: "text.primary",
                  lineHeight: 1.2,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                Datos de autorización
              </Typography>

              {loading ? (
                <Box
                  sx={{
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "#FCFCFC",
                    p: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1.25,
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <CircularProgress size={20} />
                  <Typography
                    sx={{
                      fontSize: 14,
                      color: "text.secondary",
                      fontWeight: 700,
                      overflowWrap: "anywhere",
                      wordBreak: "break-word",
                    }}
                  >
                    Cargando autorizadores…
                  </Typography>
                </Box>
              ) : null}

              {!loading && rows.length === 0 ? (
                <Alert severity="warning" sx={responsiveAlertSx}>
                  No hay autorizadores de descuentos disponibles para esta
                  sucursal.
                </Alert>
              ) : null}

              {error ? (
                <Alert severity="error" sx={responsiveAlertSx}>
                  {error}
                </Alert>
              ) : null}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ minWidth: 0, width: "100%" }}
              >
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
                      disabled={busy || loading || rows.length === 0}
                      size="medium"
                      SelectProps={{
                        MenuProps: {
                          sx: {
                            zIndex: (theme) => theme.zIndex.modal + 40,
                          },
                        },
                      }}
                    >
                      <MenuItem value="">Selecciona autorizador</MenuItem>

                      {rows.map((authorizer) => (
                        <MenuItem
                          key={`${authorizer.id}-${authorizer.user_id}`}
                          value={String(authorizer.user_id)}
                        >
                          {authorizer.name} -{" "}
                          {authorizer?.role?.label || "Autorizador"}
                          {authorizer.is_current_user ? " (tú)" : ""}
                        </MenuItem>
                      ))}
                    </TextField>
                  }
                />

                <FieldBlock
                  label="PIN *"
                  highlight
                  input={
                    <TextField
                      fullWidth
                      type="password"
                      value={form?.pin || ""}
                      onChange={(e) => onFormChange?.("pin", e.target.value)}
                      placeholder="PIN"
                      disabled={busy || loading || rows.length === 0}
                      autoFocus={!loading && rows.length > 0}
                      inputProps={{
                        autoComplete: "new-password",
                        inputMode: "numeric",
                      }}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: 18,
                          fontWeight: 900,
                          letterSpacing: "0.08em",
                        },
                      }}
                    />
                  }
                />
              </Stack>

              {selectedAuthorizer ? (
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    backgroundColor: "#FCFCFC",
                    p: 1.25,
                    minWidth: 0,
                    width: "100%",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.25}
                    alignItems="center"
                    sx={{ minWidth: 0, width: "100%" }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1,
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: "rgba(255, 152, 0, 0.10)",
                        color: "#FF9800",
                        flexShrink: 0,
                      }}
                    >
                      <LockRoundedIcon fontSize="small" />
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 900,
                          color: "text.primary",
                          lineHeight: 1.25,
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {selectedAuthorizer.name}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.15,
                          fontSize: 12.5,
                          color: "text.secondary",
                          lineHeight: 1.35,
                          overflowWrap: "anywhere",
                          wordBreak: "break-word",
                        }}
                      >
                        {selectedAuthorizer?.role?.label || "Autorizador"}
                        {selectedAuthorizer.is_current_user
                          ? " · Usuario actual"
                          : ""}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Box>

          {policyRows.length > 0 ? (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                backgroundColor: "#fff",
                p: { xs: 1.25, sm: 1.5 },
                minWidth: 0,
                width: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "text.primary",
                  mb: 1,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                Política aplicada
              </Typography>

              <Stack spacing={0.65} sx={{ minWidth: 0, width: "100%" }}>
                {policyRows.map((row) => (
                  <InfoRow key={row.label} label={row.label} value={row.value} />
                ))}
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions
        sx={{
          px: { xs: 1.75, sm: 2.5 },
          py: { xs: 1.4, sm: 1.75 },
          backgroundColor: "#fff",
          position: { xs: "sticky", sm: "static" },
          bottom: 0,
          zIndex: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          justifyContent="flex-end"
          sx={{ width: "100%", minWidth: 0 }}
        >
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!canSubmit}
            startIcon={
              busy ? <CircularProgress size={18} color="inherit" /> : null
            }
            sx={{
              order: { xs: 1, sm: 2 },
              minWidth: { xs: "100%", sm: 220 },
              height: 46,
              borderRadius: 2,
              fontWeight: 900,
              backgroundColor: "#FF9800",
              "&:hover": {
                backgroundColor: "#F08C00",
              },
            }}
          >
            {busy ? "Autorizando…" : "Autorizar descuento"}
          </Button>

          <Button
            variant="outlined"
            onClick={() => onClose?.()}
            disabled={busy}
            sx={{
              order: { xs: 2, sm: 1 },
              minWidth: { xs: "100%", sm: 130 },
              height: 46,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Cancelar
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

function FieldBlock({ label, input, highlight = false }) {
  return (
    <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
      <Typography
        sx={{
          ...fieldLabelSx,
          color: highlight ? "#111" : "text.primary",
        }}
      >
        {label}
      </Typography>
      {input}
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      spacing={{ xs: 0.15, sm: 1 }}
      sx={{
        minWidth: 0,
        width: "100%",
      }}
    >
      <Typography
        sx={{
          fontSize: 13,
          color: "text.secondary",
          fontWeight: 700,
          lineHeight: 1.35,
          minWidth: 0,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontSize: 13,
          color: "text.primary",
          fontWeight: 900,
          textAlign: { xs: "left", sm: "right" },
          lineHeight: 1.35,
          minWidth: 0,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function buildPolicyRows(policy) {
  if (!policy || typeof policy !== "object") return [];

  const calculation = policy?.calculation || {};
  const policyData = policy?.policy || {};

  const rows = [];

  const effectivePercent = firstNumber([
    calculation?.effective_percent,
    policy?.effective_percent,
  ]);

  const maxDiscountPercent = firstNumber([
    calculation?.max_discount_percent,
    policyData?.max_discount_percent,
    policy?.max_discount_percent,
  ]);

  const maxDiscountAmount = firstNumber([
    calculation?.max_discount_amount,
    policyData?.max_discount_amount,
    policy?.max_discount_amount,
  ]);

  const baseAmount = firstNumber([
    calculation?.base_amount,
    policy?.base_amount,
  ]);

  const amountApplied = firstNumber([
    calculation?.amount_applied,
    policy?.amount_applied,
  ]);

  if (baseAmount !== null) {
    rows.push({
      label: "Base evaluada",
      value: formatCurrency(baseAmount),
    });
  }

  if (amountApplied !== null) {
    rows.push({
      label: "Descuento solicitado",
      value: formatCurrency(amountApplied),
    });
  }

  if (effectivePercent !== null) {
    rows.push({
      label: "Porcentaje efectivo",
      value: `${formatNumber(effectivePercent)}%`,
    });
  }

  if (maxDiscountPercent !== null) {
    rows.push({
      label: "Máximo permitido por porcentaje",
      value: `${formatNumber(maxDiscountPercent)}%`,
    });
  }

  if (maxDiscountAmount !== null) {
    rows.push({
      label: "Máximo permitido por monto",
      value: formatCurrency(maxDiscountAmount),
    });
  }

  if (
    calculation?.exceeded_percent === true ||
    policy?.exceeded_percent === true
  ) {
    rows.push({
      label: "Exceso",
      value: "Supera el porcentaje permitido",
    });
  }

  if (
    calculation?.exceeded_amount === true ||
    policy?.exceeded_amount === true
  ) {
    rows.push({
      label: "Exceso por monto",
      value: "Supera el monto permitido",
    });
  }

  return rows;
}

function firstNumber(values) {
  const found = values.find(
    (value) => value !== null && value !== undefined && value !== ""
  );

  if (found === null || found === undefined || found === "") return null;

  const parsed = Number(found);

  return Number.isFinite(parsed) ? parsed : null;
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

function formatNumber(value) {
  const safe = Number(value || 0);

  try {
    return new Intl.NumberFormat("es-MX", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return String(safe);
  }
}

const responsiveAlertSx = {
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  borderRadius: 1,
  alignItems: "flex-start",
  overflow: "hidden",
  px: { xs: 1.1, sm: 1.5 },
  py: { xs: 1, sm: 1.2 },
  "& .MuiAlert-icon": {
    flexShrink: 0,
    mt: 0.15,
    mr: 1,
  },
  "& .MuiAlert-message": {
    minWidth: 0,
    width: "100%",
    maxWidth: "100%",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    whiteSpace: "normal",
    fontSize: { xs: 12.5, sm: 13 },
    fontWeight: 800,
    lineHeight: 1.45,
  },
};

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 900,
  color: "text.primary",
  mb: 0.85,
};