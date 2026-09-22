import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, CircularProgress, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Radio, RadioGroup, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import AppAlert from "../../common/AppAlert";

export default function PreparedItemPolicyDialog({
  open,
  row,
  defaultMinutes = 15,
  saving = false,
  deleting = false,
  onClose,
  onSave,
  onDelete,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [isReusable, setIsReusable] = useState(false);
  const [timeMode, setTimeMode] = useState("general");
  const [customMinutes, setCustomMinutes] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const busy = saving || deleting;
  const productName = row?.product?.name || "Producto";

  const hasPolicy = useMemo(() => !!row?.policy, [row]);

  const canSave = useMemo(() => {
    if (!row?.product?.id || busy) return false;
    if (!isReusable) return true;
    if (timeMode === "general") return true;

    const minutes = Number(customMinutes);
    return customMinutes !== "" && Number.isInteger(minutes) && minutes >= 1;
  }, [row, busy, isReusable, timeMode, customMinutes]);

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open || !row) return;

    const policy = row.policy || null;
    const reusable = !!policy?.is_reusable;
    const usesCustom = reusable && policy?.reuse_minutes !== null && policy?.reuse_minutes !== undefined;

    setIsReusable(reusable);
    setTimeMode(usesCustom ? "custom" : "general");
    setCustomMinutes(usesCustom ? String(policy.reuse_minutes) : "");
    setAlertState((prev) => ({ ...prev, open: false }));
  }, [open, row]);

  const handleReusableChange = (event) => {
    const checked = event.target.checked;

    setIsReusable(checked);

    if (!checked) {
      setTimeMode("general");
      setCustomMinutes("");
    }
  };

  const handleTimeModeChange = (event) => {
    const nextMode = event.target.value;
    setTimeMode(nextMode);

    if (nextMode === "general") {
      setCustomMinutes("");
    }
  };

  const handleMinutesChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setCustomMinutes("");
      return;
    }

    if (!/^\d+$/.test(value)) return;

    setCustomMinutes(value);
  };

  const handleSubmit = () => {
    if (!row?.product?.id || busy) return;

    if (!isReusable) {
      onSave({
        productId: row.product.id,
        isReusable: false,
        reuseMinutes: null,
      });
      return;
    }

    if (timeMode === "general") {
      onSave({
        productId: row.product.id,
        isReusable: true,
        reuseMinutes: null,
      });
      return;
    }

    const minutes = Number(customMinutes);

    if (!customMinutes || !Number.isInteger(minutes) || minutes < 1) {
      showAlert({
        severity: "warning",
        title: "Revisa el tiempo",
        message: "Ingresa un número entero mayor a cero.",
      });
      return;
    }

    onSave({
      productId: row.product.id,
      isReusable: true,
      reuseMinutes: minutes,
    });
  };

  const handleDelete = () => {
    if (!row?.product?.id || busy || !hasPolicy) return;
    onDelete(row.product.id);
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={busy ? undefined : onClose}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
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
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                Configurar reutilización
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Define si este producto puede volver a ofrecerse después de una cancelación.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={busy}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
          }}
        >
          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: "text.secondary",
                      mb: 0.5,
                    }}
                  >
                    Producto
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: { xs: 19, sm: 21 },
                      fontWeight: 800,
                      color: "text.primary",
                      lineHeight: 1.3,
                    }}
                  >
                    {productName}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: { xs: 1.75, sm: 2 },
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    bgcolor: "background.default",
                  }}
                >
                  <FormControlLabel
                    sx={{
                      m: 0,
                      width: "100%",
                      alignItems: "flex-start",
                      "& .MuiFormControlLabel-label": { flex: 1 },
                    }}
                    control={
                      <Switch
                        checked={isReusable}
                        onChange={handleReusableChange}
                        disabled={busy}
                        color="primary"
                        sx={{ mt: -0.25, mr: 1 }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          sx={{
                            fontSize: 15,
                            fontWeight: 800,
                            color: "text.primary",
                          }}
                        >
                          Permitir reutilización
                        </Typography>

                        <Typography
                          sx={{
                            mt: 0.35,
                            fontSize: 13,
                            color: "text.secondary",
                            lineHeight: 1.55,
                          }}
                        >
                          El producto podrá volver a ofrecerse cuando cumpla las condiciones operativas correspondientes.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>

                {isReusable ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        Tiempo de reutilización
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.4,
                          fontSize: 13,
                          color: "text.secondary",
                          lineHeight: 1.5,
                        }}
                      >
                        Indica cuánto tiempo podrá mantenerse disponible este producto.
                      </Typography>
                    </Box>

                    <RadioGroup value={timeMode} onChange={handleTimeModeChange}>
                      <Stack spacing={1}>
                        <OptionCard
                          value="general"
                          checked={timeMode === "general"}
                          disabled={busy}
                          title="Usar tiempo general de la sucursal"
                          description={`${defaultMinutes} minuto(s)`}
                        />

                        <OptionCard
                          value="custom"
                          checked={timeMode === "custom"}
                          disabled={busy}
                          title="Usar un tiempo particular"
                          description="Define un tiempo diferente únicamente para este producto."
                        />
                      </Stack>
                    </RadioGroup>

                    {timeMode === "custom" ? (
                      <FieldBlock
                        label="Minutos *"
                        help="Ingresa un número entero mayor a cero."
                        input={
                          <TextField
                            fullWidth
                            type="text"
                            value={customMinutes}
                            onChange={handleMinutesChange}
                            disabled={busy}
                            placeholder="Ej. 10"
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                              maxLength: 4,
                            }}
                          />
                        }
                      />
                    ) : null}

                    {timeMode === "general" ? (
                      <Box
                        sx={{
                          p: 1.5,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          bgcolor: "background.default",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: "text.secondary",
                            lineHeight: 1.55,
                          }}
                        >
                          Este producto utilizará el tiempo general configurado para la sucursal:{" "}
                          <Typography
                            component="span"
                            sx={{
                              fontSize: 12,
                              fontWeight: 800,
                              color: "text.primary",
                            }}
                          >
                            {defaultMinutes} minuto(s)
                          </Typography>
                          .
                        </Typography>
                      </Box>
                    ) : null}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.default",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        lineHeight: 1.55,
                      }}
                    >
                      Mientras la reutilización esté desactivada, este producto no volverá a ofrecerse como Preparación rápida después de una cancelación.
                    </Typography>
                  </Box>
                )}

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent={hasPolicy ? "space-between" : "flex-end"}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1.5}
                  pt={1}
                >
                  {hasPolicy ? (
                    <Button
                      type="button"
                      color="inherit"
                      variant="outlined"
                      onClick={handleDelete}
                      disabled={busy}
                      startIcon={
                        deleting ? (
                          <CircularProgress size={17} color="inherit" />
                        ) : (
                          <DeleteOutlineOutlinedIcon />
                        )
                      }
                      sx={{
                        minWidth: { xs: "100%", sm: 150 },
                        height: 44,
                        borderRadius: 2,
                      }}
                    >
                      {deleting ? "Restableciendo…" : "Restablecer"}
                    </Button>
                  ) : null}

                  <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    spacing={1.5}
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    <Button
                      type="button"
                      onClick={onClose}
                      disabled={busy}
                      variant="outlined"
                      sx={{
                        minWidth: { xs: "100%", sm: 150 },
                        height: 44,
                        borderRadius: 2,
                      }}
                    >
                      Cancelar
                    </Button>

                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canSave}
                      variant="contained"
                      startIcon={
                        saving ? (
                          <CircularProgress size={17} color="inherit" />
                        ) : (
                          <SaveOutlinedIcon />
                        )
                      }
                      sx={{
                        minWidth: { xs: "100%", sm: 180 },
                        height: 44,
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      {saving ? "Guardando…" : "Guardar"}
                    </Button>
                  </Stack>
                </Stack>
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
        autoHideDuration={3000}
      />
    </>
  );
}

function OptionCard({ value, checked, disabled, title, description }) {
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: checked ? "primary.main" : "divider",
        borderRadius: 1,
        bgcolor: checked ? "rgba(255, 152, 0, 0.05)" : "background.paper",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
      }}
    >
      <FormControlLabel
        value={value}
        disabled={disabled}
        sx={{
          m: 0,
          width: "100%",
          px: 1.5,
          py: 1.25,
          alignItems: "flex-start",
          "& .MuiFormControlLabel-label": { flex: 1 },
        }}
        control={<Radio color="primary" sx={{ mt: -0.4 }} />}
        label={
          <Box sx={{ pt: 0.2 }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 800,
                color: "text.primary",
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 0.3,
                fontSize: 12,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          </Box>
        }
      />
    </Box>
  );
}

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
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