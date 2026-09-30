import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, Checkbox, Chip, CircularProgress, FormControlLabel, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import TuneIcon from "@mui/icons-material/Tune";

import { getVariantAttributes } from "../../../services/products/variants/variantAttributes.service";
import { getVariantAttributeValues } from "../../../services/products/variants/variantAttributeValues.service";
import { generateProductVariants } from "../../../services/products/variants/productVariantGenerator.service";

import PageContainer from "../../common/PageContainer";
import AppAlert from "../../common/AppAlert";
import PaginationFooter from "../../common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

const PAGE_SIZE = 5;

export default function VariantCreateContent({
  restaurantId,
  productId,
  productName,
  disabledByPrecondition = false,
  refreshKey = 0,
  onManageAttribute,
  onGenerated,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [attribute, setAttribute] = useState(null);
  const [values, setValues] = useState([]);
  const [selectedValueIds, setSelectedValueIds] = useState([]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

  const showAlert = ({ severity = "error", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const load = async () => {
    const myReq = ++reqRef.current;
    setLoading(true);

    try {
      const attributeResponse = await getVariantAttributes(
        restaurantId,
        productId,
        { only_active: false }
      );

      if (myReq !== reqRef.current) return;

      const attributes = Array.isArray(attributeResponse?.data)
        ? attributeResponse.data
        : [];

      const currentAttribute = attributes[0] || null;
      setAttribute(currentAttribute);

      if (!currentAttribute) {
        setValues([]);
        setSelectedValueIds([]);
        return;
      }

      const valuesResponse = await getVariantAttributeValues(
        restaurantId,
        productId,
        currentAttribute.id,
        { only_active: false }
      );

      if (myReq !== reqRef.current) return;

      const nextValues = Array.isArray(valuesResponse?.data)
        ? valuesResponse.data
        : [];

      setValues(nextValues);

      setSelectedValueIds((prev) => {
        const allowedIds = new Set(
          nextValues
            .filter((item) => item.status === "active")
            .map((item) => Number(item.id))
        );

        return prev.map(Number).filter((id) => allowedIds.has(id));
      });
    } catch (e) {
      if (myReq !== reqRef.current) return;

      setAttribute(null);
      setValues([]);
      setSelectedValueIds([]);

      showAlert({
        severity: "error",
        title: "No se pudo cargar la información",
        message: normalizeErr(e, "No se pudo preparar la creación de variantes."),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId, refreshKey]);

  const isAttributeActive = attribute?.status === "active";

  const activeValuesCount = useMemo(() => {
    return values.filter((item) => item.status === "active").length;
  }, [values]);

  const selectedSet = useMemo(() => {
    return new Set(selectedValueIds.map(Number));
  }, [selectedValueIds]);

  const toggleValue = (value) => {
    if (value.status !== "active" || !isAttributeActive || generating) return;

    const valueId = Number(value.id);

    setSelectedValueIds((prev) => {
      const next = new Set(prev.map(Number));

      if (next.has(valueId)) next.delete(valueId);
      else next.add(valueId);

      return Array.from(next);
    });
  };

  const generate = async () => {
    if (!attribute) {
      showAlert({
        severity: "warning",
        title: "Falta configurar el atributo",
        message: "Primero configura el atributo que utilizará este producto.",
      });
      return;
    }

    if (!isAttributeActive) {
      showAlert({
        severity: "warning",
        title: "El atributo está inactivo",
        message: "Activa el atributo antes de crear nuevas variantes.",
      });
      return;
    }

    if (selectedValueIds.length === 0) {
      showAlert({
        severity: "warning",
        title: "Selecciona una opción",
        message: "Debes seleccionar al menos una opción para crear variantes.",
      });
      return;
    }

    setGenerating(true);

    try {
      const response = await generateProductVariants(
        restaurantId,
        productId,
        {
          selections: [{
            attribute_id: Number(attribute.id),
            value_ids: selectedValueIds.map(Number),
          }],
        }
      );

      const createdCount = Number(response?.data?.created_count ?? 0);
      const syncedCount = Number(response?.data?.synced_count ?? selectedValueIds.length);

      if (createdCount === 0) {
        showAlert({
          severity: "warning",
          title: "No se crearon variantes nuevas",
          message: "Las opciones seleccionadas ya estaban relacionadas con variantes de este producto.",
        });
      } else if (createdCount < syncedCount) {
        showAlert({
          severity: "success",
          title: "Variantes actualizadas",
          message: `Se crearon ${createdCount} variante(s). Las demás opciones ya estaban configuradas.`,
        });
      } else {
        showAlert({
          severity: "success",
          title: "Variantes creadas",
          message: `Se crearon ${createdCount} variante(s) correctamente.`,
        });
      }

      await onGenerated?.(response);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "No se pudieron crear las variantes",
        message: normalizeErr(e, "No se pudo completar la creación de variantes."),
      });
    } finally {
      setGenerating(false);
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
    items: values,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  return (
    <PageContainer
      sx={{ py: 0, px: 0 }}
      innerSx={{ width: "100%" }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: 22, sm: 26 },
                color: "text.primary",
                lineHeight: 1.2,
              }}
            >
              Crear variantes{productName ? ` — ${productName}` : ""}
            </Typography>

            <Typography
              sx={{
                mt: 0.75,
                fontSize: 14,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Selecciona las opciones que deseas convertir en variantes del producto.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={<TuneIcon />}
            onClick={() => onManageAttribute?.()}
            disabled={generating}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              height: 44,
              fontWeight: 800,
            }}
          >
            Administrar atributo
          </Button>
        </Stack>

        {disabledByPrecondition ? (
          <Paper
            sx={{
              p: 2,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              backgroundColor: "background.paper",
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
              Antes de crear variantes
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
              Primero configura un precio de venta en al menos un canal del producto.
            </Typography>
          </Paper>
        ) : null}

        {loading ? (
          <Paper
            sx={{
              minHeight: 260,
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              display: "grid",
              placeItems: "center",
              backgroundColor: "background.paper",
            }}
          >
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress size={30} />
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Preparando las opciones…
              </Typography>
            </Stack>
          </Paper>
        ) : !attribute ? (
          <Paper
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              textAlign: "center",
              backgroundColor: "background.paper",
            }}
          >
            <CategoryOutlinedIcon sx={{ fontSize: 40, color: "text.secondary" }} />

            <Typography sx={{ mt: 1, fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Este producto todavía no tiene un atributo
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
              Crea uno para definir opciones como Chico, Mediano, Grande u otra presentación.
            </Typography>

            <Button
              type="button"
              variant="contained"
              startIcon={<TuneIcon />}
              onClick={() => onManageAttribute?.()}
              sx={{ mt: 2, minWidth: 210, height: 44, fontWeight: 800 }}
            >
              Configurar atributo
            </Button>
          </Paper>
        ) : (
          <>
            <Paper
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "none",
                backgroundColor: "background.paper",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.5}
              >
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
                    ATRIBUTO DEL PRODUCTO
                  </Typography>

                  <Typography sx={{ mt: 0.4, fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                    {attribute.name}
                  </Typography>

                  <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary" }}>
                    {activeValuesCount} opción{activeValuesCount === 1 ? "" : "es"} activa{activeValuesCount === 1 ? "" : "s"}.
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  color={isAttributeActive ? "success" : "default"}
                  label={isAttributeActive ? "Activo" : "Inactivo"}
                  sx={{ fontWeight: 800 }}
                />
              </Stack>
            </Paper>

            {values.length === 0 ? (
              <Paper
                sx={{
                  p: { xs: 3, sm: 4 },
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  textAlign: "center",
                  backgroundColor: "background.paper",
                }}
              >
                <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
                  El atributo todavía no tiene opciones
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
                  Entra a administrar el atributo para agregar sus opciones.
                </Typography>

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<TuneIcon />}
                  onClick={() => onManageAttribute?.()}
                  sx={{ mt: 2, minWidth: 210, height: 44, fontWeight: 800 }}
                >
                  Administrar atributo
                </Button>
              </Paper>
            ) : (
              <Paper
                sx={{
                  p: 0,
                  overflow: "hidden",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",
                  backgroundColor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={1}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
                        Opciones disponibles
                      </Typography>

                      <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
                        Selecciona una o varias opciones. Cada opción corresponde a una variante.
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      color={selectedValueIds.length > 0 ? "primary" : "default"}
                      label={`${selectedValueIds.length} seleccionada${selectedValueIds.length === 1 ? "" : "s"}`}
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>
                </Box>

                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedItems.map((value) => {
                      const active = value.status === "active";
                      const checked = selectedSet.has(Number(value.id));

                      return (
                        <Card
                          key={value.id}
                          sx={{
                            width: "100%",
                            minHeight: 82,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: checked ? "primary.main" : "divider",
                            boxShadow: "none",
                            backgroundColor: checked ? "action.selected" : "background.paper",
                          }}
                        >
                          <Box sx={{ p: 1.5 }}>
                            <FormControlLabel
                              sx={{
                                m: 0,
                                width: "100%",
                                alignItems: "center",
                                "& .MuiFormControlLabel-label": { width: "100%" },
                              }}
                              control={
                                <Checkbox
                                  checked={checked}
                                  disabled={!active || !isAttributeActive || generating}
                                  onChange={() => toggleValue(value)}
                                />
                              }
                              label={
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  spacing={1}
                                  sx={{ width: "100%" }}
                                >
                                  <Typography
                                    sx={{
                                      fontSize: 15,
                                      fontWeight: 800,
                                      color: "text.primary",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {value.value}
                                  </Typography>

                                  <Chip
                                    size="small"
                                    color={active ? "success" : "default"}
                                    label={active ? "Activo" : "Inactivo"}
                                    sx={{ fontWeight: 800 }}
                                  />
                                </Stack>
                              }
                            />
                          </Box>
                        </Card>
                      );
                    })}
                  </Stack>
                ) : (
                  <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                    <Table sx={{ minWidth: 620 }}>
                      <TableHead>
                        <TableRow
                          sx={{
                            "& th": {
                              backgroundColor: "primary.main",
                              color: "#fff",
                              fontWeight: 800,
                              borderBottom: "none",
                              whiteSpace: "nowrap",
                            },
                          }}
                        >
                          <TableCell width={110}>Seleccionar</TableCell>
                          <TableCell>Opción</TableCell>
                          <TableCell width={150}>Estado</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((value) => {
                          const active = value.status === "active";
                          const checked = selectedSet.has(Number(value.id));

                          return (
                            <TableRow key={value.id} hover>
                              <TableCell>
                                <Checkbox
                                  checked={checked}
                                  disabled={!active || !isAttributeActive || generating}
                                  onChange={() => toggleValue(value)}
                                />
                              </TableCell>

                              <TableCell>
                                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                                  {value.value}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  size="small"
                                  color={active ? "success" : "default"}
                                  label={active ? "Activo" : "Inactivo"}
                                  sx={{ fontWeight: 800 }}
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

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="flex-end"
              spacing={1.5}
            >
              <Button
                type="button"
                variant="contained"
                startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={generate}
                disabled={
                  disabledByPrecondition ||
                  generating ||
                  !attribute ||
                  !isAttributeActive ||
                  selectedValueIds.length === 0
                }
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 210 },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                {generating ? "Creando…" : "Crear variantes"}
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