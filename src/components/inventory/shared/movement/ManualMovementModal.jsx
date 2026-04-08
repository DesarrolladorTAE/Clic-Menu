import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import AppAlert from "../../../common/AppAlert";

const MOVEMENT_TYPES = [
  { value: "IN", label: "Entrada" },
  { value: "OUT", label: "Salida" },
  { value: "ADJUST", label: "Ajuste" },
];

const REASONS = [
  { value: "purchase", label: "Compra" },
  { value: "manual_adjustment", label: "Ajuste manual" },
  { value: "waste", label: "Merma" },
  { value: "correction", label: "Corrección" },
  { value: "initial_load", label: "Carga inicial" },
  { value: "other", label: "Otro" },
];

export default function ManualMovementModal({
  open,
  onClose,
  title = "Nuevo movimiento manual",
  entityLabel = "Elemento",
  entityOptions = [],
  warehouseId,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);

  const [entityId, setEntityId] = useState("");
  const [type, setType] = useState("IN");
  const [reason, setReason] = useState("manual_adjustment");
  const [quantity, setQuantity] = useState("");
  const [newOnHand, setNewOnHand] = useState("");
  const [notes, setNotes] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const isAdjust = type === "ADJUST";

  const showAlert = ({
    severity = "error",
    title = "Error",
    message = "",
  }) => {
    setAlertState({
      open: true,
      severity,
      title,
      message,
    });
  };

  const closeAlert = (_, reasonClose) => {
    if (reasonClose === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open) return;

    setEntityId("");
    setType("IN");
    setReason("manual_adjustment");
    setQuantity("");
    setNewOnHand("");
    setNotes("");
  }, [open]);

  const canSave = useMemo(() => {
    if (!entityId) return false;
    if (isAdjust) return newOnHand !== "";
    return quantity !== "";
  }, [entityId, isAdjust, quantity, newOnHand]);

  const handleSave = async () => {
    if (!entityId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: `Selecciona un ${entityLabel.toLowerCase()}.`,
      });
      return;
    }

    const payload = {
      warehouse_id: Number(warehouseId),
      reason,
      type,
      notes: notes.trim() || null,
      ...(isAdjust
        ? { new_on_hand: Number(newOnHand) }
        : { quantity: Number(quantity) }),
    };

    setSaving(true);

    try {
      await onSave(Number(entityId), payload);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo guardar el movimiento.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                Registra una entrada, salida o ajuste manual en el almacén
                actual.
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={saving}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.16)",
                },
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
              <Stack spacing={2.5}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 20 },
                    color: "text.primary",
                  }}
                >
                  Datos del movimiento
                </Typography>

                <Stack spacing={2}>
                  <FieldBlock label={entityLabel}>
                    <FormControl fullWidth>
                      <Select
                        value={entityId}
                        onChange={(e) => setEntityId(e.target.value)}
                        displayEmpty
                        IconComponent={KeyboardArrowDownIcon}
                      >
                        <MenuItem value="">
                          Selecciona un {entityLabel.toLowerCase()}
                        </MenuItem>
                        {entityOptions.map((item) => (
                          <MenuItem key={item.value} value={String(item.value)}>
                            {item.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FieldBlock>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock label="Tipo">
                      <FormControl fullWidth>
                        <Select
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          {MOVEMENT_TYPES.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </FieldBlock>

                    <FieldBlock label="Razón">
                      <FormControl fullWidth>
                        <Select
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          {REASONS.map((item) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </FieldBlock>
                  </Stack>

                  {isAdjust ? (
                    <FieldBlock label="Nuevo stock">
                      <TextField
                        type="number"
                        value={newOnHand}
                        onChange={(e) => setNewOnHand(e.target.value)}
                        placeholder="Ej. 150"
                        inputProps={{ min: 0, step: "0.001" }}
                      />
                    </FieldBlock>
                  ) : (
                    <FieldBlock label="Cantidad">
                      <TextField
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Ej. 10"
                        inputProps={{ min: 0.001, step: "0.001" }}
                      />
                    </FieldBlock>
                  )}

                  <FieldBlock label="Notas">
                    <TextField
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Opcional"
                      multiline
                      minRows={4}
                    />
                  </FieldBlock>
                </Stack>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={1}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
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
                    onClick={handleSave}
                    disabled={!canSave || saving}
                    variant="contained"
                    startIcon={<SaveIcon />}
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

function FieldBlock({ label, children }) {
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

      {children}
    </Box>
  );
}
