import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SettingsInputComponentOutlinedIcon from "@mui/icons-material/SettingsInputComponentOutlined";

import PageContainer from "../common/PageContainer";
import CandidatePicker from "./CandidatePicker";
import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../common/PaginationFooter";

function normalizeErr(msg, fallback = "Ocurrió un error") {
  return msg || fallback;
}

const PAGE_SIZE = 5;

export default function CompositionWizard({
  open,
  onClose,
  restaurantId,
  productId,
  productsMode,
  branchId,
  initialItems = [],
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [rows, setRows] = useState([]);
  const [localErr, setLocalErr] = useState("");
  const [saving, setSaving] = useState(false);

  const canPickCandidates = useMemo(() => !!branchId, [branchId]);

  useEffect(() => {
    if (!open) return;

    setLocalErr("");
    setSaving(false);
    setRows(
      (initialItems || []).map((x, idx) => ({
        ...x,
        qty: Number(x.qty || 1),
        sort_order: Number(x.sort_order ?? idx),
      }))
    );
  }, [open, initialItems]);

  useEffect(() => {
    if (!localErr) return;
    const timer = setTimeout(() => setLocalErr(""), 5000);
    return () => clearTimeout(timer);
  }, [localErr]);

  const onAddCandidate = (c) => {
    setLocalErr("");

    if (!c?.id) return;

    if (rows.some((r) => Number(r.component_product_id) === Number(c.id))) {
      setLocalErr("Ese componente ya está agregado.");
      return;
    }

    setRows((prev) => [
      ...prev,
      {
        component_product_id: Number(c.id),
        name: c.name,
        qty: 1,
        allow_variant: !!c.has_variants,
        apply_variant_price: false,
        is_optional: false,
        sort_order: prev.length,
        notes: "",
      },
    ]);
  };

  const onRemove = (id) => {
    setRows((prev) =>
      prev
        .filter((x) => Number(x.component_product_id) !== Number(id))
        .map((x, idx) => ({
          ...x,
          sort_order: idx,
        }))
    );
  };

  const updateRow = (id, patch) => {
    setRows((prev) =>
      prev.map((x) =>
        Number(x.component_product_id) === Number(id) ? { ...x, ...patch } : x
      )
    );
  };

  const submit = async () => {
    setLocalErr("");

    if (!rows.length) {
      setLocalErr("Agrega al menos 1 componente.");
      return;
    }

    for (const r of rows) {
      if (!r.component_product_id) {
        setLocalErr("Hay un componente inválido.");
        return;
      }
      if (!r.qty || Number(r.qty) <= 0) {
        setLocalErr("La cantidad debe ser mayor a 0.");
        return;
      }
      if (!r.allow_variant && r.apply_variant_price) {
        setLocalErr(
          "No puedes activar precio extra si el componente no permite variantes."
        );
        return;
      }
    }

    setSaving(true);

    try {
      await onSave(rows);
    } catch (e) {
      setLocalErr(normalizeErr(e?.message));
    } finally {
      setSaving(false);
    }
  };

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: rows,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

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
              Editar composición
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 13,
                color: "rgba(255,255,255,0.82)",
              }}
            >
              Modo: {productsMode} · {branchId ? "Sucursal lista" : "Falta sucursal"}
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
            {localErr ? (
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
                  <Typography variant="body2">{localErr}</Typography>
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
              <Stack spacing={1.5}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Agregar componente
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  Busca productos activos y vendibles para agregarlos como componentes.
                </Typography>

                {!canPickCandidates ? (
                  <Alert
                    severity="warning"
                    sx={{
                      borderRadius: 1,
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography variant="body2">
                      Selecciona una sucursal para listar productos vendibles.
                    </Typography>
                  </Alert>
                ) : (
                  <CandidatePicker
                    restaurantId={restaurantId}
                    productId={productId}
                    branchId={branchId}
                    excludeIds={rows.map((x) => x.component_product_id)}
                    onPick={onAddCandidate}
                  />
                )}
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
                <Typography
                  sx={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  Componentes seleccionados
                </Typography>
              </Box>

              {!rows.length ? (
                <Box
                  sx={{
                    px: 3,
                    py: 5,
                    textAlign: "center",
                  }}
                >
                  <SettingsInputComponentOutlinedIcon
                    sx={{
                      fontSize: 34,
                      color: "text.secondary",
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 18,
                      fontWeight: 800,
                      color: "text.primary",
                    }}
                  >
                    Aún no hay componentes
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 14,
                      color: "text.secondary",
                    }}
                  >
                    Agrega los productos que formarán parte del compuesto.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box
                    sx={{
                      p: 2,
                      display: "grid",
                      gap: 2,
                    }}
                  >
                    {paginatedItems.map((r) => (
                      <Card
                        key={r.component_product_id}
                        sx={{
                          borderRadius: 1,
                          boxShadow: "none",
                          border: "1px solid",
                          borderColor: "divider",
                          backgroundColor: "#fff",
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Stack spacing={2}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              alignItems={{ xs: "flex-start", sm: "center" }}
                              spacing={1}
                            >
                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "text.primary",
                                  }}
                                >
                                  {r.name || `Producto ${r.component_product_id}`}
                                </Typography>

                                <Typography
                                  sx={{
                                    mt: 0.5,
                                    fontSize: 12,
                                    color: "text.secondary",
                                  }}
                                >
                                  Configura cantidad y comportamiento del componente.
                                </Typography>
                              </Box>

                              <Button
                                onClick={() => onRemove(r.component_product_id)}
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
                                label="Cantidad"
                                input={
                                  <TextField
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    value={r.qty}
                                    onChange={(e) =>
                                      updateRow(r.component_product_id, {
                                        qty: Number(e.target.value),
                                      })
                                    }
                                  />
                                }
                              />

                              <FieldBlock
                                label="Notas"
                                input={
                                  <TextField
                                    value={r.notes || ""}
                                    onChange={(e) =>
                                      updateRow(r.component_product_id, {
                                        notes: e.target.value,
                                      })
                                    }
                                    placeholder="Opcional"
                                  />
                                }
                              />
                            </Stack>

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                              <FieldSwitch
                                label="Permite variantes"
                                checked={!!r.allow_variant}
                                onChange={(checked) =>
                                  updateRow(r.component_product_id, {
                                    allow_variant: checked,
                                    apply_variant_price: checked
                                      ? r.apply_variant_price
                                      : false,
                                  })
                                }
                              />

                              <FieldSwitch
                                label="Precio extra"
                                checked={!!r.apply_variant_price}
                                disabled={!r.allow_variant}
                                onChange={(checked) =>
                                  updateRow(r.component_product_id, {
                                    apply_variant_price: checked,
                                  })
                                }
                              />

                              <FieldSwitch
                                label="Opcional"
                                checked={!!r.is_optional}
                                onChange={(checked) =>
                                  updateRow(r.component_product_id, {
                                    is_optional: checked,
                                  })
                                }
                              />
                            </Stack>
                          </Stack>
                        </Box>
                      </Card>
                    ))}
                  </Box>

                  <PaginationFooter
                    page={page}
                    totalPages={totalPages}
                    startItem={startItem}
                    endItem={endItem}
                    total={total}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                    onPrev={prevPage}
                    onNext={nextPage}
                    itemLabel="componentes"
                  />
                </>
              )}
            </Paper>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
            >
              <Button
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
                onClick={submit}
                disabled={saving}
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 210 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {saving ? "Guardando…" : "Guardar composición"}
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

function FieldSwitch({ label, checked, onChange, disabled = false }) {
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

      <FormControlLabel
        sx={{ m: 0 }}
        control={
          <Switch
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
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
            {checked ? "Activo" : "Inactivo"}
          </Typography>
        }
      />
    </Box>
  );
}