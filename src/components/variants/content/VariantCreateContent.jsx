import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, Checkbox, Chip, CircularProgress, FormControlLabel, Paper, Radio, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import TuneIcon from "@mui/icons-material/Tune";

import { getVariantAttributes } from "../../../services/products/variants/variantAttributes.service";
import { getVariantAttributeValues } from "../../../services/products/variants/variantAttributeValues.service";
import { generateProductVariants } from "../../../services/products/variants/productVariantGenerator.service";
import { getProductVariants } from "../../../services/products/variants/productVariants.service";

import PageContainer from "../../common/PageContainer";
import AppAlert from "../../common/AppAlert";
import PaginationFooter from "../../common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

const PAGE_SIZE = 5;

function existingVariantValueIds(response) {
  const rows = Array.isArray(response?.data) ? response.data : [];
  const ids = new Set();

  rows.forEach((row) => {
    const attributes = Array.isArray(row?.attributes) ? row.attributes : [];

    attributes.forEach((attribute) => {
      const values = Array.isArray(attribute?.values) ? attribute.values : [];

      values.forEach((value) => {
        const valueId = Number(value?.value_id);
        if (Number.isInteger(valueId) && valueId > 0) ids.add(valueId);
      });
    });
  });

  return Array.from(ids);
}

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
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(true);
  const [loadingValues, setLoadingValues] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [step, setStep] = useState("attributes");
  const [attributes, setAttributes] = useState([]);
  const [selectedAttributeId, setSelectedAttributeId] = useState(null);
  const [attribute, setAttribute] = useState(null);

  const [values, setValues] = useState([]);
  const [selectedValueIds, setSelectedValueIds] = useState([]);
  const [usedValueIds, setUsedValueIds] = useState([]);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);
  const valuesReqRef = useRef(0);

  const showAlert = ({ severity = "error", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const load = async () => {
    const myReq = ++reqRef.current;
    ++valuesReqRef.current;

    setLoading(true);
    setStep("attributes");
    setAttributes([]);
    setSelectedAttributeId(null);
    setAttribute(null);
    setValues([]);
    setSelectedValueIds([]);

    try {
      const [attributeResponse, variantsResponse] = await Promise.all([
        getVariantAttributes(restaurantId, productId, { only_active: false }),
        getProductVariants(restaurantId, productId),
      ]);

      if (myReq !== reqRef.current) return;

      setAttributes(Array.isArray(attributeResponse?.data) ? attributeResponse.data : []);
      setUsedValueIds(existingVariantValueIds(variantsResponse));
    } catch (e) {
      if (myReq !== reqRef.current) return;

      setAttributes([]);
      setUsedValueIds([]);

      showAlert({
        severity: "error",
        title: "No se pudo cargar la información",
        message: normalizeErr(e, "No se pudo preparar la creación de variantes."),
      });
    } finally {
      if (myReq === reqRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId, refreshKey]);

  const selectedAttribute = useMemo(() => {
    return attributes.find((item) => Number(item.id) === Number(selectedAttributeId)) || null;
  }, [attributes, selectedAttributeId]);

  const usedValueSet = useMemo(() => new Set(usedValueIds.map(Number)), [usedValueIds]);
  const selectedSet = useMemo(() => new Set(selectedValueIds.map(Number)), [selectedValueIds]);

  const isAttributeActive = attribute?.status === "active";

  const activeValuesCount = useMemo(() => {
    return values.filter((item) => item.status === "active").length;
  }, [values]);

  const availableValuesCount = useMemo(() => {
    return values.filter((item) => item.status === "active" && !usedValueSet.has(Number(item.id))).length;
  }, [values, usedValueSet]);

  const selectAttribute = (row) => {
    if (row.status !== "active" || loadingValues || generating) return;
    setSelectedAttributeId(Number(row.id));
  };

  const goToValues = async () => {
    if (!selectedAttribute) {
      showAlert({
        severity: "warning",
        title: "Selecciona un atributo",
        message: "Elige el atributo que deseas utilizar para crear las variantes.",
      });
      return;
    }

    if (selectedAttribute.status !== "active") {
      showAlert({
        severity: "warning",
        title: "El atributo está inactivo",
        message: "Activa el atributo antes de utilizar sus opciones.",
      });
      return;
    }

    const myReq = ++valuesReqRef.current;

    setAttribute(selectedAttribute);
    setValues([]);
    setSelectedValueIds([]);
    setStep("values");
    setLoadingValues(true);

    try {
      const response = await getVariantAttributeValues(
        restaurantId,
        productId,
        selectedAttribute.id,
        { only_active: false }
      );

      if (myReq !== valuesReqRef.current) return;

      setValues(Array.isArray(response?.data) ? response.data : []);
    } catch (e) {
      if (myReq !== valuesReqRef.current) return;

      setValues([]);

      showAlert({
        severity: "error",
        title: "No se pudieron cargar las opciones",
        message: normalizeErr(e, "No se pudieron consultar las opciones del atributo."),
      });
    } finally {
      if (myReq === valuesReqRef.current) setLoadingValues(false);
    }
  };

  const goToAttributes = () => {
    ++valuesReqRef.current;
    setStep("attributes");
    setAttribute(null);
    setValues([]);
    setSelectedValueIds([]);
    setLoadingValues(false);
  };

  const toggleValue = (value) => {
    const valueId = Number(value.id);
    const alreadyCreated = usedValueSet.has(valueId);

    if (value.status !== "active" || !isAttributeActive || alreadyCreated || generating) return;

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
        title: "Selecciona un atributo",
        message: "Primero selecciona el atributo que utilizarán las nuevas variantes.",
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

    const selectedIds = selectedValueIds.map(Number);

    setGenerating(true);

    try {
      const response = await generateProductVariants(restaurantId, productId, {
        selections: [{
          attribute_id: Number(attribute.id),
          value_ids: selectedIds,
        }],
      });

      const createdCount = Number(response?.data?.created_count ?? 0);
      const syncedCount = Number(response?.data?.synced_count ?? selectedIds.length);

      setUsedValueIds((prev) => Array.from(new Set([...prev.map(Number), ...selectedIds])));
      setSelectedValueIds([]);

      if (createdCount === 0) {
        showAlert({
          severity: "warning",
          title: "No se crearon variantes nuevas",
          message: "Las opciones seleccionadas ya estaban relacionadas con variantes de este producto.",
        });
      } else if (createdCount < syncedCount) {
        showAlert({
          severity: "success",
          title: "Variantes creadas",
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
    page: attributePage,
    nextPage: nextAttributePage,
    prevPage: prevAttributePage,
    total: attributeTotal,
    totalPages: attributeTotalPages,
    startItem: attributeStartItem,
    endItem: attributeEndItem,
    hasPrev: attributeHasPrev,
    hasNext: attributeHasNext,
    paginatedItems: paginatedAttributes,
  } = usePagination({
    items: attributes,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const {
    page: valuePage,
    nextPage: nextValuePage,
    prevPage: prevValuePage,
    total: valueTotal,
    totalPages: valueTotalPages,
    startItem: valueStartItem,
    endItem: valueEndItem,
    hasPrev: valueHasPrev,
    hasNext: valueHasNext,
    paginatedItems: paginatedValues,
  } = usePagination({
    items: values,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  return (
    <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
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

            <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
              {step === "attributes"
                ? "Selecciona el atributo que deseas utilizar."
                : "Selecciona las opciones que deseas convertir en variantes del producto."}
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={<TuneIcon />}
            onClick={() => onManageAttribute?.()}
            disabled={generating || loadingValues}
            sx={{ minWidth: { xs: "100%", sm: 190 }, height: 44, fontWeight: 800 }}
          >
            Administrar atributos
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
                Preparando los atributos…
              </Typography>
            </Stack>
          </Paper>
        ) : attributes.length === 0 ? (
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
              Este producto todavía no tiene atributos
            </Typography>

            <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary", lineHeight: 1.5 }}>
              Crea un atributo y sus opciones para comenzar a generar variantes.
            </Typography>

            <Button
              type="button"
              variant="contained"
              startIcon={<TuneIcon />}
              onClick={() => onManageAttribute?.()}
              sx={{ mt: 2, minWidth: 210, height: 44, fontWeight: 800 }}
            >
              Configurar atributos
            </Button>
          </Paper>
        ) : step === "attributes" ? (
          <>
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
              <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography sx={{ fontSize: 17, fontWeight: 800, color: "text.primary" }}>
                  Atributos disponibles
                </Typography>

                <Typography sx={{ mt: 0.35, fontSize: 12, color: "text.secondary" }}>
                  Selecciona un atributo para consultar sus opciones.
                </Typography>
              </Box>

              {useCards ? (
                <Stack spacing={1.5} sx={{ p: 2 }}>
                  {paginatedAttributes.map((row) => {
                    const active = row.status === "active";
                    const selected = Number(selectedAttributeId) === Number(row.id);

                    return (
                      <Card
                        key={row.id}
                        sx={{
                          width: "100%",
                          minHeight: 88,
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: selected ? "primary.main" : "divider",
                          boxShadow: "none",
                          backgroundColor: selected ? "action.selected" : "background.paper",
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
                              <Radio
                                checked={selected}
                                disabled={!active}
                                onChange={() => selectAttribute(row)}
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
                                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary", wordBreak: "break-word" }}>
                                  {row.name}
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
                        <TableCell>Atributo</TableCell>
                        <TableCell width={160}>Estado</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedAttributes.map((row) => {
                        const active = row.status === "active";
                        const selected = Number(selectedAttributeId) === Number(row.id);

                        return (
                          <TableRow key={row.id} hover>
                            <TableCell>
                              <Radio
                                checked={selected}
                                disabled={!active}
                                onChange={() => selectAttribute(row)}
                              />
                            </TableCell>

                            <TableCell>
                              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                                {row.name}
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
                page={attributePage}
                totalPages={attributeTotalPages}
                startItem={attributeStartItem}
                endItem={attributeEndItem}
                total={attributeTotal}
                hasPrev={attributeHasPrev}
                hasNext={attributeHasNext}
                onPrev={prevAttributePage}
                onNext={nextAttributePage}
                itemLabel="atributos"
              />
            </Paper>

            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end">
              <Button
                type="button"
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={goToValues}
                disabled={!selectedAttribute}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 160 },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                Siguiente
              </Button>
            </Stack>
          </>
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
                    ATRIBUTO SELECCIONADO
                  </Typography>

                  <Typography sx={{ mt: 0.4, fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                    {attribute?.name}
                  </Typography>

                  <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary" }}>
                    {activeValuesCount} opción{activeValuesCount === 1 ? "" : "es"} activa{activeValuesCount === 1 ? "" : "s"} ·{" "}
                    {availableValuesCount} disponible{availableValuesCount === 1 ? "" : "s"}.
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

            {loadingValues ? (
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
                    Cargando opciones…
                  </Typography>
                </Stack>
              </Paper>
            ) : values.length === 0 ? (
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
                  Este atributo todavía no tiene opciones
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
                  Entra a administrar los atributos para agregar sus opciones.
                </Typography>

                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<TuneIcon />}
                  onClick={() => onManageAttribute?.()}
                  sx={{ mt: 2, minWidth: 210, height: 44, fontWeight: 800 }}
                >
                  Administrar atributos
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
                <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
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
                        Selecciona una o varias opciones. Las que ya tienen variante no pueden seleccionarse otra vez.
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

                {useCards ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedValues.map((value) => {
                      const valueId = Number(value.id);
                      const active = value.status === "active";
                      const alreadyCreated = usedValueSet.has(valueId);
                      const checked = selectedSet.has(valueId);

                      return (
                        <Card
                          key={value.id}
                          sx={{
                            width: "100%",
                            minHeight: 88,
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
                                  disabled={!active || !isAttributeActive || alreadyCreated || generating}
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
                                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary", wordBreak: "break-word" }}>
                                    {value.value}
                                  </Typography>

                                  <Stack direction="row" spacing={0.75} alignItems="center">
                                    <Chip
                                      size="small"
                                      color={active ? "success" : "default"}
                                      label={active ? "Activo" : "Inactivo"}
                                      sx={{ fontWeight: 800 }}
                                    />

                                    {alreadyCreated ? (
                                      <Chip
                                        size="small"
                                        label="Ya creada"
                                        sx={{ fontWeight: 800 }}
                                      />
                                    ) : null}
                                  </Stack>
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
                    <Table sx={{ minWidth: 680 }}>
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
                          <TableCell width={230}>Estado</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedValues.map((value) => {
                          const valueId = Number(value.id);
                          const active = value.status === "active";
                          const alreadyCreated = usedValueSet.has(valueId);
                          const checked = selectedSet.has(valueId);

                          return (
                            <TableRow key={value.id} hover>
                              <TableCell>
                                <Checkbox
                                  checked={checked}
                                  disabled={!active || !isAttributeActive || alreadyCreated || generating}
                                  onChange={() => toggleValue(value)}
                                />
                              </TableCell>

                              <TableCell>
                                <Typography sx={{ fontSize: 14, fontWeight: 800, color: "text.primary" }}>
                                  {value.value}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                                  <Chip
                                    size="small"
                                    color={active ? "success" : "default"}
                                    label={active ? "Activo" : "Inactivo"}
                                    sx={{ fontWeight: 800 }}
                                  />

                                  {alreadyCreated ? (
                                    <Chip
                                      size="small"
                                      label="Ya creada"
                                      sx={{ fontWeight: 800 }}
                                    />
                                  ) : null}
                                </Stack>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <PaginationFooter
                  page={valuePage}
                  totalPages={valueTotalPages}
                  startItem={valueStartItem}
                  endItem={valueEndItem}
                  total={valueTotal}
                  hasPrev={valueHasPrev}
                  hasNext={valueHasNext}
                  onPrev={prevValuePage}
                  onNext={nextValuePage}
                  itemLabel="opciones"
                />
              </Paper>
            )}

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Button
                type="button"
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={goToAttributes}
                disabled={generating || loadingValues}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 180 },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                Cambiar atributo
              </Button>

              <Button
                type="button"
                variant="contained"
                startIcon={generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                onClick={generate}
                disabled={
                  disabledByPrecondition ||
                  generating ||
                  loadingValues ||
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
                {generating
                  ? "Creando…"
                  : selectedValueIds.length === 1
                    ? "Crear variante"
                    : "Crear variantes"}
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