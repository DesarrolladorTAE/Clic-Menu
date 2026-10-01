import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, CircularProgress, FormControlLabel, Paper, Radio, Stack,
  Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PlaylistAddCheckCircleOutlinedIcon from "@mui/icons-material/PlaylistAddCheckCircleOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { getVariantAttributes } from "../../../services/products/variants/variantAttributes.service";
import { getVariantAttributeValues } from "../../../services/products/variants/variantAttributeValues.service";
import { repairProductVariant } from "../../../services/products/variants/productVariants.service";

import usePagination from "../../../hooks/usePagination";
import PageContainer from "../../common/PageContainer";
import PaginationFooter from "../../common/PaginationFooter";
import AppAlert from "../../common/AppAlert";

const PAGE_SIZE = 5;

function normalizeErr(e) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors ? Object.values(e.response.data.errors).flat().join("\n") : "") ||
    "Ocurrió un error"
  );
}

function normalizeText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function extractCurrentValueId(variantRow, attributeId) {
  const attributes = Array.isArray(variantRow?.attributes) ? variantRow.attributes : [];

  for (const attribute of attributes) {
    if (Number(attribute?.attribute_id) !== Number(attributeId)) continue;

    const values = Array.isArray(attribute?.values) ? attribute.values : [];

    if (values.length === 1 && Number(values[0]?.value_id) > 0) {
      return Number(values[0].value_id);
    }
  }

  const directValues = Array.isArray(variantRow?.values) ? variantRow.values : [];

  if (
    directValues.length === 1 &&
    Number(directValues[0]?.attribute_id) === Number(attributeId) &&
    Number(directValues[0]?.value_id) > 0
  ) {
    return Number(directValues[0].value_id);
  }

  return null;
}

function buildDisplayName(productName, variantName, fallback = "") {
  const product = normalizeText(productName);
  const option = normalizeText(variantName);
  const fallbackName = normalizeText(fallback);

  if (!product) return fallbackName || option;
  if (!option) return fallbackName || product;

  const productLower = product.toLocaleLowerCase("es");
  const optionLower = option.toLocaleLowerCase("es");

  if (optionLower === productLower || optionLower.startsWith(`${productLower} `)) return option;

  return `${product} · ${option}`;
}

export default function VariantRepairContent({
  restaurantId,
  productId,
  productName,
  variantRow,
  onBack,
  onRepaired,
}) {
  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  const sourceVariant = useMemo(
    () => variantRow?.variant || variantRow || {},
    [variantRow]
  );

  const [repairedVariant, setRepairedVariant] = useState(null);
  const [attribute, setAttribute] = useState(null);
  const [values, setValues] = useState([]);
  const [selectedValueId, setSelectedValueId] = useState(null);
  const [activateAfter, setActivateAfter] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const requestRef = useRef(0);

  const variant = useMemo(
    () => ({ ...sourceVariant, ...(repairedVariant || {}) }),
    [sourceVariant, repairedVariant]
  );

  const showAlert = ({ severity = "success", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    setRepairedVariant(null);
    setAttribute(null);
    setValues([]);
    setSelectedValueId(null);
    setActivateAfter(true);
  }, [variantRow]);

  useEffect(() => {
    if (!restaurantId || !productId || !variant?.id) {
      setLoading(false);
      return;
    }

    const myRequest = ++requestRef.current;
    setLoading(true);

    (async () => {
      try {
        const attributesResponse = await getVariantAttributes(
          restaurantId,
          productId,
          { only_active: false }
        );

        if (myRequest !== requestRef.current) return;

        const attributes = Array.isArray(attributesResponse?.data)
          ? attributesResponse.data
          : [];

        if (attributes.length === 0) {
          setAttribute(null);
          setValues([]);
          setSelectedValueId(null);
          return;
        }

        if (attributes.length > 1) {
          setAttribute(null);
          setValues([]);
          setSelectedValueId(null);

          showAlert({
            severity: "error",
            title: "No se puede corregir la variante",
            message: "Este producto tiene más de un atributo configurado. Debe conservar solamente uno.",
          });

          return;
        }

        const currentAttribute = attributes[0];
        setAttribute(currentAttribute);

        const valuesResponse = await getVariantAttributeValues(
          restaurantId,
          productId,
          currentAttribute.id,
          { only_active: true }
        );

        if (myRequest !== requestRef.current) return;

        const availableValues = Array.isArray(valuesResponse?.data)
          ? valuesResponse.data
          : [];

        const sortedValues = [...availableValues].sort((a, b) => {
          const orderA = Number(a.sort_order ?? 0);
          const orderB = Number(b.sort_order ?? 0);

          if (orderA !== orderB) return orderA - orderB;

          return String(a.value || "").localeCompare(String(b.value || ""), "es");
        });

        setValues(sortedValues);

        const currentValueId = extractCurrentValueId(variantRow, currentAttribute.id);
        const currentStillAvailable = sortedValues.some(
          (item) => Number(item.id) === Number(currentValueId)
        );

        setSelectedValueId(currentStillAvailable ? Number(currentValueId) : null);
      } catch (e) {
        if (myRequest !== requestRef.current) return;

        setAttribute(null);
        setValues([]);
        setSelectedValueId(null);

        showAlert({
          severity: "error",
          title: "No se pudo cargar la información",
          message: normalizeErr(e),
        });
      } finally {
        if (myRequest === requestRef.current) setLoading(false);
      }
    })();
  }, [restaurantId, productId, variant?.id, variantRow]);

  const sortedValues = useMemo(() => {
    return [...values].sort((a, b) => {
      const orderA = Number(a.sort_order ?? 0);
      const orderB = Number(b.sort_order ?? 0);

      if (orderA !== orderB) return orderA - orderB;

      return String(a.value || "").localeCompare(String(b.value || ""), "es");
    });
  }, [values]);

  const currentVariantName = normalizeText(
    variant?.variant_name ||
    variant?.canonical_name ||
    variant?.stored_name ||
    variant?.name
  );

  const displayName = buildDisplayName(
    productName,
    currentVariantName,
    variant?.display_name || variant?.name
  );

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
    items: sortedValues,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const selectValue = (valueId) => {
    if (saving) return;
    setSelectedValueId(Number(valueId));
  };

  const saveRepair = async () => {
    if (!attribute?.id) {
      showAlert({
        severity: "warning",
        title: "Falta el atributo",
        message: "Este producto todavía no tiene un atributo disponible para corregir la variante.",
      });
      return;
    }

    if (!selectedValueId) {
      showAlert({
        severity: "warning",
        title: "Selecciona una opción",
        message: "Elige la opción que debe quedar relacionada con esta variante.",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await repairProductVariant(
        restaurantId,
        productId,
        variant.id,
        {
          selections: [
            {
              attribute_id: Number(attribute.id),
              value_id: Number(selectedValueId),
            },
          ],
          activate: Boolean(activateAfter),
        }
      );

      const updated = response?.data || {};
      setRepairedVariant((prev) => ({ ...(prev || variant), ...updated }));

      showAlert({
        severity: "success",
        title: "Variante corregida",
        message: activateAfter
          ? "La variante se corrigió y quedó activa."
          : "La variante se corrigió correctamente.",
      });

      onRepaired?.(updated);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudo corregir la variante",
        message: normalizeErr(e),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
      <Stack spacing={2.5}>
        <Box>
          <Button
            type="button"
            variant="text"
            startIcon={<ArrowBackIcon />}
            onClick={() => onBack?.()}
            disabled={saving}
            sx={{ mb: 1, fontWeight: 800 }}
          >
            Volver
          </Button>

          <Typography
            sx={{
              fontSize: { xs: 22, sm: 26 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.25,
              wordBreak: "break-word",
            }}
          >
            Reparar variante
          </Typography>

          <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
            {displayName}
          </Typography>
        </Box>

        {variant?.is_invalid ? (
          <Paper
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "warning.main",
              borderRadius: 1,
              boxShadow: "none",
              backgroundColor: "background.paper",
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <WarningAmberRoundedIcon color="warning" />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                  Motivo de la corrección
                </Typography>

                <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                  {variant?.invalid_reason || "La configuración actual de la variante no es válida."}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ) : repairedVariant ? (
          <Paper
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "success.main",
              borderRadius: 1,
              boxShadow: "none",
              backgroundColor: "background.paper",
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <CheckCircleOutlineIcon color="success" />
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                La variante ya quedó corregida.
              </Typography>
            </Stack>
          </Paper>
        ) : null}

        {loading ? (
          <Paper
            sx={{
              minHeight: 260,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              boxShadow: "none",
              display: "grid",
              placeItems: "center",
              backgroundColor: "background.paper",
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress size={30} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Cargando opciones…
              </Typography>
            </Stack>
          </Paper>
        ) : !attribute?.id ? (
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              boxShadow: "none",
              textAlign: "center",
              backgroundColor: "background.paper",
            }}
          >
            <PlaylistAddCheckCircleOutlinedIcon sx={{ fontSize: 38, color: "text.secondary" }} />

            <Typography sx={{ mt: 1, fontSize: 18, fontWeight: 800 }}>
              No hay un atributo disponible
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
              Configura primero el atributo de variantes de este producto.
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                boxShadow: "none",
                backgroundColor: "background.paper",
              }}
            >
              <Stack spacing={0.75}>
                <Typography sx={fieldLabelSx}>Atributo</Typography>

                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                  {attribute.name}
                </Typography>

                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  Selecciona una sola opción para corregir esta variante.
                </Typography>
              </Stack>
            </Paper>

            {total === 0 ? (
              <Paper
                sx={{
                  p: { xs: 3, sm: 4 },
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  boxShadow: "none",
                  textAlign: "center",
                  backgroundColor: "background.paper",
                }}
              >
                <PlaylistAddCheckCircleOutlinedIcon sx={{ fontSize: 38, color: "text.secondary" }} />

                <Typography sx={{ mt: 1, fontSize: 18, fontWeight: 800 }}>
                  No hay opciones activas
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
                  Activa o crea una opción en el atributo antes de continuar.
                </Typography>
              </Paper>
            ) : (
              <Paper
                sx={{
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  boxShadow: "none",
                  backgroundColor: "background.paper",
                }}
              >
                {useCards ? (
                  <Box
                    sx={{
                      p: 2,
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                      gap: 1.5,
                    }}
                  >
                    {paginatedItems.map((row) => {
                      const selected = Number(selectedValueId) === Number(row.id);

                      return (
                        <Card
                          key={row.id}
                          onClick={() => selectValue(row.id)}
                          sx={{
                            width: "100%",
                            minHeight: 132,
                            border: "1px solid",
                            borderColor: selected ? "primary.main" : "divider",
                            borderRadius: 1,
                            boxShadow: "none",
                            backgroundColor: selected ? "action.selected" : "background.paper",
                            cursor: saving ? "default" : "pointer",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              p: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1.5,
                            }}
                          >
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={fieldLabelSx}>Opción</Typography>

                              <Typography
                                sx={{
                                  mt: 0.6,
                                  fontSize: 17,
                                  fontWeight: 800,
                                  color: "text.primary",
                                  overflow: "hidden",
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                  wordBreak: "break-word",
                                }}
                              >
                                {row.value}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 1,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  color: selected ? "primary.main" : "text.secondary",
                                }}
                              >
                                {selected ? "Seleccionada" : "Seleccionar"}
                              </Typography>
                            </Box>

                            <Radio
                              checked={selected}
                              disabled={saving}
                              onChange={() => selectValue(row.id)}
                              inputProps={{ "aria-label": `Seleccionar ${row.value}` }}
                            />
                          </Box>
                        </Card>
                      );
                    })}
                  </Box>
                ) : (
                  <TableContainer>
                    <Table sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              backgroundColor: "primary.main",
                              color: "#fff",
                              fontWeight: 800,
                              borderBottom: "none",
                            },
                          }}
                        >
                          <TableCell>Opción</TableCell>
                          <TableCell width={160} align="center">Seleccionar</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((row) => {
                          const selected = Number(selectedValueId) === Number(row.id);

                          return (
                            <TableRow
                              key={row.id}
                              hover
                              onClick={() => selectValue(row.id)}
                              sx={{ cursor: saving ? "default" : "pointer" }}
                            >
                              <TableCell>
                                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                                  {row.value}
                                </Typography>
                              </TableCell>

                              <TableCell align="center">
                                <Radio
                                  checked={selected}
                                  disabled={saving}
                                  onChange={() => selectValue(row.id)}
                                  inputProps={{ "aria-label": `Seleccionar ${row.value}` }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

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
                  itemLabel="opciones"
                />
              </Paper>
            )}

            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                boxShadow: "none",
                backgroundColor: "background.paper",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={2}
              >
                <Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
                    Estado al finalizar
                  </Typography>

                  <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                    Puedes dejar activa la variante después de corregirla.
                  </Typography>
                </Box>

                <FormControlLabel
                  sx={{ m: 0 }}
                  control={
                    <Switch
                      checked={activateAfter}
                      disabled={saving}
                      onChange={(e) => setActivateAfter(e.target.checked)}
                    />
                  }
                  label={
                    <Typography sx={switchLabelSx}>
                      {activateAfter ? "Dejar activa" : "Dejar inactiva"}
                    </Typography>
                  }
                />
              </Stack>
            </Paper>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.25}
            >
              <Button
                type="button"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => onBack?.()}
                disabled={saving}
                sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 150 }, height: 44 }}
              >
                Volver
              </Button>

              <Button
                type="button"
                variant="contained"
                startIcon={
                  saving
                    ? <CircularProgress size={18} color="inherit" />
                    : <BuildCircleOutlinedIcon />
                }
                onClick={saveRepair}
                disabled={saving || !attribute?.id || !selectedValueId}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 210 },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                {saving ? "Guardando…" : "Guardar corrección"}
              </Button>
            </Stack>
          </>
        )}
      </Stack>

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </PageContainer>
  );
}

const fieldLabelSx = {
  fontSize: 12,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.35,
};

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};