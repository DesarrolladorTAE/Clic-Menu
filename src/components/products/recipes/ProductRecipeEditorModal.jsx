import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  upsertProductRecipeBase,
  upsertProductRecipeVariant,
} from "../../../services/inventory/recipes/productRecipes.service";

import PageContainer from "../../common/PageContainer";

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    "No se pudo guardar la receta"
  );
}

export default function ProductRecipeEditorModal({
  open,
  onClose,
  restaurantId,
  productId,
  branchMode,
  effectiveBranchId,
  ingredients = [],
  initialItems = [],
  title = "Editar receta",
  variantId = null,
  onSaved,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);

  const ingredientsById = useMemo(() => {
    const map = new Map();
    (ingredients || []).forEach((ing) => map.set(Number(ing.id), ing));
    return map;
  }, [ingredients]);

  useEffect(() => {
    if (!open) return;

    setErr("");
    setItems(
      (initialItems || []).map((it) => ({
        id: it.id ?? null,
        ingredient_id: it.ingredient_id ?? "",
        qty: it.qty ?? 1,
        notes: it.notes ?? "",
        status: it.status || "active",
      }))
    );
  }, [open, initialItems]);

  useEffect(() => {
    if (!err) return;
    const timer = setTimeout(() => setErr(""), 5000);
    return () => clearTimeout(timer);
  }, [err]);

  const updateRow = (index, patch) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const removeRow = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const addRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: null,
        ingredient_id: "",
        qty: 1,
        notes: "",
        status: "active",
      },
    ]);
  };

  const validateItems = (rows) => {
    const errors = [];
    const seen = new Set();

    rows.forEach((it, idx) => {
      const ingId = Number(it.ingredient_id || 0);
      const qty = Number(it.qty || 0);

      if (!ingId) errors.push(`Fila ${idx + 1}: ingrediente requerido`);
      if (!(qty > 0)) errors.push(`Fila ${idx + 1}: la cantidad debe ser mayor a 0`);

      if (ingId) {
        if (seen.has(String(ingId))) {
          const ing = ingredientsById.get(ingId);
          errors.push(`Ingrediente repetido: ${ing?.name || "Ingrediente"}`);
        }
        seen.add(String(ingId));
      }
    });

    return errors;
  };

  const handleSave = async () => {
    setErr("");

    if (branchMode && !effectiveBranchId) {
      setErr("Selecciona una sucursal antes de guardar la receta.");
      return;
    }

    const validationErrors = validateItems(items);
    if (validationErrors.length) {
      setErr(validationErrors.join("\n"));
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...(branchMode ? { branch_id: effectiveBranchId } : {}),
        items: items.map((it) => ({
          ingredient_id: Number(it.ingredient_id),
          qty: Number(it.qty),
          notes: it.notes?.trim() ? it.notes.trim() : null,
          status: it.status || "active",
        })),
      };

      if (variantId) {
        await upsertProductRecipeVariant(
          restaurantId,
          productId,
          variantId,
          payload
        );
      } else {
        await upsertProductRecipeBase(restaurantId, productId, payload);
      }

      await onSaved?.();
    } catch (e) {
      setErr(normalizeErr(e));
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="lg"
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
              Agrega ingredientes, cantidades y notas para esta receta.
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
          p: 0,
          bgcolor: "background.default",
        }}
      >
        <PageContainer
          maxWidth={1100}
          sx={{
            py: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 3 },
          }}
          innerSx={{
            width: "100%",
          }}
        >
          <Stack spacing={2.5}>
            {err ? (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 1,
                  alignItems: "flex-start",
                  whiteSpace: "pre-line",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                    No se pudo completar la acción
                  </Typography>
                  <Typography variant="body2">{err}</Typography>
                </Box>
              </Alert>
            ) : null}

            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 0,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
              }}
            >
              <Stack spacing={1.25}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Configuración de la receta
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  {branchMode
                    ? "La receta se guardará para la sucursal seleccionada."
                    : "La receta se guardará en modo global."}
                </Typography>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 0,
                overflow: "hidden",
                borderRadius: 0,
                backgroundColor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "#fff",
                }}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", sm: "center" }}
                  spacing={1.5}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "text.primary",
                      }}
                    >
                      Ingredientes de la receta
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.5,
                        fontSize: 13,
                        color: "text.secondary",
                      }}
                    >
                      Agrega los ingredientes que se consumirán cuando se venda este producto o variante.
                    </Typography>
                  </Box>

                  <Button
                    onClick={addRow}
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={saving}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    Agregar ingrediente
                  </Button>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: 2,
                  display: "grid",
                  gap: 2,
                }}
              >
                {!items.length ? (
                  <Card
                    sx={{
                      borderRadius: 1,
                      boxShadow: "none",
                      border: "1px solid",
                      borderColor: "divider",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Box sx={{ p: 3, textAlign: "center" }}>
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        Todavía no hay ingredientes
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.75,
                          fontSize: 14,
                          color: "text.secondary",
                        }}
                      >
                        Agrega al menos uno para construir la receta.
                      </Typography>
                    </Box>
                  </Card>
                ) : (
                  items.map((row, index) => (
                    <Card
                      key={`${row.id || "new"}-${index}`}
                      sx={{
                        borderRadius: 1,
                        boxShadow: "none",
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "#fff",
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        <Stack spacing={2}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            spacing={1}
                          >
                            <Typography
                              sx={{
                                fontSize: 16,
                                fontWeight: 800,
                                color: "text.primary",
                              }}
                            >
                              Ingrediente #{index + 1}
                            </Typography>

                            <Button
                              onClick={() => removeRow(index)}
                              variant="outlined"
                              color="error"
                              startIcon={<DeleteOutlineIcon />}
                              disabled={saving}
                              sx={{
                                height: 40,
                                borderRadius: 2,
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              Quitar
                            </Button>
                          </Stack>

                          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                            <FieldBlock
                              label="Ingrediente *"
                              input={
                                <TextField
                                  select
                                  value={String(row.ingredient_id || "")}
                                  onChange={(e) =>
                                    updateRow(index, {
                                      ingredient_id: e.target.value,
                                    })
                                  }
                                >
                                  <MenuItem value="">Selecciona…</MenuItem>
                                  {ingredients.map((ing) => (
                                    <MenuItem key={ing.id} value={String(ing.id)}>
                                      {ing.name}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              }
                            />

                            <FieldBlock
                              label="Cantidad *"
                              input={
                                <TextField
                                  type="number"
                                  inputProps={{ min: 0, step: "0.001" }}
                                  value={row.qty}
                                  onChange={(e) =>
                                    updateRow(index, {
                                      qty: e.target.value,
                                    })
                                  }
                                />
                              }
                            />
                          </Stack>

                          <FieldBlock
                            label="Notas"
                            input={
                              <TextField
                                value={row.notes || ""}
                                onChange={(e) =>
                                  updateRow(index, {
                                    notes: e.target.value,
                                  })
                                }
                                placeholder="Opcional"
                                multiline
                                minRows={2}
                              />
                            }
                          />

                          <Box>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 800,
                                color: "text.primary",
                                mb: 1,
                              }}
                            >
                              Estado al guardar
                            </Typography>

                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={row.status === "active"}
                                  onChange={(e) =>
                                    updateRow(index, {
                                      status: e.target.checked
                                        ? "active"
                                        : "inactive",
                                    })
                                  }
                                  color="primary"
                                />
                              }
                              label={
                                <Typography
                                  sx={{
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: "text.primary",
                                  }}
                                >
                                  {row.status === "active" ? "Activo" : "Inactivo"}
                                </Typography>
                              }
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Box>
            </Paper>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
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
                disabled={saving}
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 190 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {saving ? "Guardando…" : "Guardar receta"}
              </Button>
            </Stack>
          </Stack>
        </PageContainer>
      </DialogContent>
    </Dialog>
  );
}

function FieldBlock({ label, input }) {
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
    </Box>
  );
}