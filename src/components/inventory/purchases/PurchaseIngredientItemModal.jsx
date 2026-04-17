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
import AppAlert from "../../common/AppAlert";

export default function PurchaseIngredientItemModal({
  open,
  onClose,
  editing,
  ingredients = [],
  presentations = [],
  onIngredientChange,
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);
  const [ingredientId, setIngredientId] = useState("");
  const [presentationId, setPresentationId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [notes, setNotes] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const title = useMemo(
    () => (isEdit ? "Editar ingrediente" : "Agregar ingrediente"),
    [isEdit]
  );

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

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      const nextIngredientId = editing?.ingredient?.id
        ? String(editing.ingredient.id)
        : "";

      setIngredientId(nextIngredientId);
      setPresentationId(
        editing?.ingredient_presentation_id
          ? String(editing.ingredient_presentation_id)
          : ""
      );
      setQuantity(String(editing?.quantity ?? ""));
      setUnitCost(String(editing?.unit_cost ?? ""));
      setNotes(editing?.notes || "");

      if (nextIngredientId) {
        onIngredientChange?.(Number(nextIngredientId));
      }
    } else {
      setIngredientId("");
      setPresentationId("");
      setQuantity("");
      setUnitCost("");
      setNotes("");
    }
  }, [open, isEdit, editing]); // 👈 quitamos onIngredientChange de deps para evitar bucle por referencia nueva

  const canSave = !!presentationId && !!quantity && !!unitCost;

  const handleIngredientSelect = (value) => {
    setIngredientId(value);
    setPresentationId("");
    if (value) {
      onIngredientChange?.(Number(value));
    }
  };

  const handleSave = async () => {
    if (!presentationId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una presentación.",
      });
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ingredient_presentation_id: Number(presentationId),
        quantity: Number(quantity),
        unit_cost: Number(unitCost),
        notes: notes.trim() || null,
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo guardar el ítem.",
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
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 20, sm: 24 } }}>
                {title}
              </Typography>
            </Box>

            <IconButton onClick={onClose} disabled={saving} sx={{ color: "#fff" }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: { xs: 2, sm: 3 }, bgcolor: "background.default" }}>
          <Card sx={{ borderRadius: 0 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Stack spacing={2}>
                  <FieldBlock label="Ingrediente">
                    <FormControl fullWidth>
                      <Select
                        value={ingredientId}
                        onChange={(e) => handleIngredientSelect(e.target.value)}
                        displayEmpty
                        IconComponent={KeyboardArrowDownIcon}
                      >
                        <MenuItem value="">Selecciona un ingrediente</MenuItem>
                        {ingredients.map((item) => (
                          <MenuItem key={item.id} value={String(item.id)}>
                            {item.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FieldBlock>

                  <FieldBlock label="Presentación">
                    <FormControl fullWidth>
                      <Select
                        value={presentationId}
                        onChange={(e) => setPresentationId(e.target.value)}
                        displayEmpty
                        IconComponent={KeyboardArrowDownIcon}
                      >
                        <MenuItem value="">Selecciona una presentación</MenuItem>
                        {presentations.map((item) => (
                          <MenuItem key={item.id} value={String(item.id)}>
                            {item.description}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </FieldBlock>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock label="Cantidad">
                      <TextField
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        inputProps={{ min: 0.001, step: "0.001" }}
                      />
                    </FieldBlock>

                    <FieldBlock label="Costo unitario">
                      <TextField
                        type="number"
                        value={unitCost}
                        onChange={(e) => setUnitCost(e.target.value)}
                        inputProps={{ min: 0.01, step: "0.01" }}
                      />
                    </FieldBlock>
                  </Stack>

                  <FieldBlock label="Notas">
                    <TextField
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      multiline
                      minRows={4}
                    />
                  </FieldBlock>
                </Stack>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                >
                  <Button onClick={onClose} disabled={saving} variant="outlined">
                    Cancelar
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={!canSave || saving}
                    variant="contained"
                    startIcon={<SaveIcon />}
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
      <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 1 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}