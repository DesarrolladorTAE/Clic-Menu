import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box, Button, Card, Chip, CircularProgress, FormControlLabel, Paper, Stack, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import {
  getProductVariants,
  toggleProductVariant,
  setDefaultProductVariant,
  deleteProductVariant,
} from "../../../services/products/variants/productVariants.service";

import VariantManagementDialog from "../../../components/variants/VariantManagementDialog";
import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import PaginationFooter from "../../../components/common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

const PAGE_SIZE = 5;

function money(value) {
  if (value == null || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return String(value);
  }

  return number.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function buildPresentationSummary(attributes) {
  if (!Array.isArray(attributes) || !attributes.length) {
    return "Sin presentación relacionada";
  }

  return attributes
    .map((attribute) => {
      const values = (attribute?.values || [])
        .map((value) => value?.value_name)
        .filter(Boolean)
        .join(", ");

      if (!values) {
        return attribute?.attribute_name || "";
      }

      return `${attribute?.attribute_name || "Presentación"}: ${values}`;
    })
    .filter(Boolean)
    .join(" · ");
}

function resolveVariantNames(product, row) {
  const variant = row?.variant || {};
  const productName = String(variant?.product_name || product?.name || "").trim();

  let variantName = String(
    variant?.variant_name ||
    variant?.canonical_name ||
    variant?.stored_name ||
    ""
  ).trim();

  if (!variantName && row?.attributes?.length === 1) {
    const values = row.attributes[0]?.values || [];

    if (values.length === 1) {
      variantName = String(values[0]?.value_name || "").trim();
    }
  }

  if (!variantName) {
    variantName = String(variant?.name || "Variante").trim();
  }

  const displayName = String(
    variant?.display_name ||
    [productName, variantName].filter(Boolean).join(" ")
  ).trim();

  let title = displayName || "Variante";

  if (productName && variantName) {
    title = `${productName} · ${variantName}`;
  }

  return { productName, variantName, displayName, title };
}

export default function ProductVariantsPage() {
  const nav = useNavigate();
  const { restaurantId, productId } = useParams();

  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));
  const requestRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [preconditions, setPreconditions] = useState(null);
  const [basePrice, setBasePrice] = useState(null);
  const [rows, setRows] = useState([]);
  const [pendingActions, setPendingActions] = useState({});

  const [management, setManagement] = useState({
    open: false,
    initialView: "create",
    variantRow: null,
  });

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const titleName = product?.name || "Producto";
  const canCreateVariants = Boolean(preconditions?.has_any_channel_price);
  const isEmpty = !loading && rows.length === 0;

  const basePriceLabel = useMemo(() => {
    if (!basePrice) {
      return "—";
    }

    const min = basePrice?.min;
    const max = basePrice?.max;

    if (min == null && max == null) {
      return "—";
    }

    if (Number(min) === Number(max)) {
      return money(min);
    }

    return `${money(min)} - ${money(max)}`;
  }, [basePrice]);

  const showAlert = ({ severity = "success", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const setPending = (key, value) => {
    setPendingActions((prev) => {
      const next = { ...prev };

      if (value) {
        next[key] = true;
      } else {
        delete next[key];
      }

      return next;
    });
  };

  const isPending = (variantId, action) => {
    return Boolean(pendingActions[`${variantId}:${action}`]);
  };

  const variantHasPendingChange = (variantId) => {
    return (
      isPending(variantId, "estado") ||
      isPending(variantId, "predeterminada") ||
      isPending(variantId, "eliminar")
    );
  };

  const applyPayload = (data) => {
    setProduct(data?.product || null);
    setPreconditions(data?.preconditions || null);
    setBasePrice(data?.base_price || null);
    setRows(Array.isArray(data?.data) ? data.data : []);
  };

  const loadVariants = async ({ initial = false, showError = true } = {}) => {
    const requestId = ++requestRef.current;

    if (initial) {
      setLoading(true);
    }

    try {
      const data = await getProductVariants(restaurantId, productId);

      if (requestId !== requestRef.current) {
        return null;
      }

      applyPayload(data);
      return data;
    } catch (error) {
      if (requestId !== requestRef.current) {
        return null;
      }

      if (showError) {
        showAlert({
          severity: "error",
          title: "No se pudieron cargar las variantes",
          message: normalizeErr(error, "Inténtalo nuevamente."),
        });
      }

      return null;
    } finally {
      if (requestId === requestRef.current && initial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadVariants({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId]);

  const syncVariants = async () => {
    return loadVariants({ initial: false, showError: true });
  };

  const openCreate = () => {
    setManagement({
      open: true,
      initialView: "create",
      variantRow: null,
    });
  };

  const openManage = (variantRow) => {
    setManagement({
      open: true,
      initialView: "variant_detail",
      variantRow,
    });
  };

  const closeManagement = () => {
    setManagement({
      open: false,
      initialView: "create",
      variantRow: null,
    });
  };

  const onToggle = async (variantId, nextEnabled) => {
    const row = rows.find((item) => Number(item?.variant?.id) === Number(variantId));
    const variant = row?.variant;

    if (!variant || variant?.is_invalid || variantHasPendingChange(variantId)) {
      return;
    }

    const snapshot = rows;
    const key = `${variantId}:estado`;

    setRows((prev) =>
      prev.map((item) => {
        if (Number(item?.variant?.id) !== Number(variantId)) {
          return item;
        }

        return {
          ...item,
          variant: {
            ...item.variant,
            is_enabled: Boolean(nextEnabled),
            is_default: nextEnabled ? item.variant.is_default : false,
          },
        };
      })
    );

    setPending(key, true);

    try {
      await toggleProductVariant(restaurantId, productId, variantId, nextEnabled);

      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message: nextEnabled
          ? "La variante quedó activa."
          : "La variante quedó inactiva y dejó de ser predeterminada si lo era.",
      });
    } catch (error) {
      setRows(snapshot);

      showAlert({
        severity: "error",
        title: "No se pudo cambiar el estado",
        message: normalizeErr(error, "Inténtalo nuevamente."),
      });
    } finally {
      setPending(key, false);
    }
  };

  const onDefault = async (variantId, nextDefault) => {
    const row = rows.find((item) => Number(item?.variant?.id) === Number(variantId));
    const variant = row?.variant;

    if (!variant || variantHasPendingChange(variantId)) {
      return;
    }

    if (variant?.is_invalid) {
      showAlert({
        severity: "error",
        title: "La variante requiere corrección",
        message: "Corrige la variante antes de marcarla como predeterminada.",
      });
      return;
    }

    const snapshot = rows;
    const key = `${variantId}:predeterminada`;

    setRows((prev) =>
      prev.map((item) => {
        if (Number(item?.variant?.id) === Number(variantId)) {
          return {
            ...item,
            variant: {
              ...item.variant,
              is_default: Boolean(nextDefault),
              is_enabled: nextDefault ? true : item.variant.is_enabled,
            },
          };
        }

        if (nextDefault && item?.variant?.is_default) {
          return {
            ...item,
            variant: {
              ...item.variant,
              is_default: false,
            },
          };
        }

        return item;
      })
    );

    setPending(key, true);

    try {
      await setDefaultProductVariant(restaurantId, productId, variantId, nextDefault);

      showAlert({
        severity: "success",
        title: "Presentación predeterminada actualizada",
        message: nextDefault
          ? "La variante quedó activa y predeterminada."
          : "La variante dejó de ser predeterminada.",
      });
    } catch (error) {
      setRows(snapshot);

      showAlert({
        severity: "error",
        title: "No se pudo actualizar",
        message: normalizeErr(error, "Inténtalo nuevamente."),
      });
    } finally {
      setPending(key, false);
    }
  };

  const onDelete = async (variantRow) => {
    const variant = variantRow?.variant;

    if (!variant?.id || variantHasPendingChange(variant?.id)) {
      return;
    }

    const names = resolveVariantNames(product, variantRow);

    const confirmed = window.confirm(
      `¿Deseas eliminar esta variante?\n\n${names.title}\n\nSi ya tiene información relacionada, el sistema protegerá sus datos y no permitirá eliminarla.`
    );

    if (!confirmed) {
      return;
    }

    const snapshot = rows;
    const key = `${variant.id}:eliminar`;

    setRows((prev) =>
      prev.filter((item) => Number(item?.variant?.id) !== Number(variant.id))
    );

    setPending(key, true);

    try {
      await deleteProductVariant(restaurantId, productId, variant.id);

      showAlert({
        severity: "success",
        title: "Variante eliminada",
        message: "La variante se eliminó correctamente.",
      });
    } catch (error) {
      setRows(snapshot);

      showAlert({
        severity: "error",
        title: "No se pudo eliminar",
        message: normalizeErr(error, "Inténtalo nuevamente."),
      });
    } finally {
      setPending(key, false);
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

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
          <Stack spacing={1.5} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
              Cargando variantes…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 30, md: 42 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.1,
              }}
            >
              Variantes y presentaciones
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: { xs: 15, md: 18 },
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Administra las presentaciones disponibles de{" "}
              <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>
                {titleName}
              </Box>
              .
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Chip
                size="small"
                color="secondary"
                label={`Precio base: ${basePriceLabel}`}
                sx={{ fontWeight: 800 }}
              />

              <Chip
                size="small"
                label={`${rows.length} ${rows.length === 1 ? "variante" : "variantes"}`}
                sx={{ fontWeight: 800 }}
              />
            </Stack>
          </Box>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.25}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => nav(`/owner/restaurants/${restaurantId}/operation/menu/products`)}
              sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 190 }, minHeight: 44 }}
            >
              Volver a productos
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              disabled={!canCreateVariants}
              sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 180 }, minHeight: 44, fontWeight: 800 }}
            >
              Crear variante
            </Button>
          </Stack>
        </Stack>

        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: "none",
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={1.5}>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
              Cómo funcionan las variantes
            </Typography>

            <InstructionRow
              icon={<AutoAwesomeMotionIcon sx={{ fontSize: 18 }} />}
              text="Cada producto utiliza una sola presentación, por ejemplo Tamaño, y cada opción crea una variante independiente, por ejemplo Chica, Mediana o Grande."
            />

            <InstructionRow
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
              text="El precio se toma inicialmente del producto y puedes definir un precio particular por canal para cada variante."
            />

            {!canCreateVariants ? (
              <Box
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "warning.light",
                  borderRadius: 1,
                  bgcolor: "warning.50",
                }}
              >
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <WarningAmberRoundedIcon sx={{ mt: 0.1, color: "warning.main" }} />

                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                      Primero configura un precio de venta
                    </Typography>

                    <Typography sx={{ mt: 0.35, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
                      El producto necesita al menos un precio habilitado por canal antes de poder crear variantes.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ) : null}
          </Stack>
        </Paper>

        <Paper
          sx={{
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: "none",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              py: 1.75,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Variantes disponibles
            </Typography>
          </Box>

          {isEmpty ? (
            <Box sx={{ px: 3, py: { xs: 5, sm: 6 }, textAlign: "center" }}>
              <AutoAwesomeMotionIcon sx={{ fontSize: 42, color: "text.secondary" }} />

              <Typography sx={{ mt: 1.25, fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                Este producto todavía no tiene variantes
              </Typography>

              <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
                Crea una presentación y sus opciones para comenzar.
              </Typography>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                disabled={!canCreateVariants}
                sx={{ mt: 2.5, minWidth: 210, minHeight: 44, fontWeight: 800 }}
              >
                Crear variante
              </Button>
            </Box>
          ) : useCards ? (
            <>
              <Box
                sx={{
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gridAutoRows: "1fr",
                  gap: 2,
                  alignItems: "stretch",
                }}
              >
                {paginatedItems.map((row) => {
                  const variant = row?.variant || {};
                  const names = resolveVariantNames(product, row);
                  const isInvalid = Boolean(variant?.is_invalid);
                  const changingState = isPending(variant.id, "estado");
                  const changingDefault = isPending(variant.id, "predeterminada");
                  const deleting = isPending(variant.id, "eliminar");
                  const changingVariant = changingState || changingDefault || deleting;

                  return (
                    <Card
                      key={variant.id}
                      sx={{
                        width: "100%",
                        minWidth: 0,
                        minHeight: 355,
                        height: "100%",
                        display: "flex",
                        border: "1px solid",
                        borderColor: isInvalid ? "error.light" : "divider",
                        borderRadius: 1,
                        boxShadow: "none",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Stack spacing={1.75} sx={{ p: 2, width: "100%", height: "100%" }}>
                        <Box>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            spacing={1}
                          >
                            <Typography
                              sx={{
                                minWidth: 0,
                                fontSize: 17,
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.3,
                                wordBreak: "break-word",
                              }}
                            >
                              {names.title}
                            </Typography>

                            {isInvalid ? (
                              <Chip
                                size="small"
                                color="error"
                                label="Requiere corrección"
                                sx={{ flexShrink: 0, fontWeight: 800 }}
                              />
                            ) : variant?.is_default ? (
                              <Chip
                                size="small"
                                color="success"
                                label="Predeterminada"
                                sx={{ flexShrink: 0, fontWeight: 800 }}
                              />
                            ) : null}
                          </Stack>

                          {isInvalid && variant?.invalid_reason ? (
                            <Typography sx={{ mt: 1, fontSize: 12, color: "error.main", lineHeight: 1.45 }}>
                              {variant.invalid_reason}
                            </Typography>
                          ) : null}
                        </Box>

                        <InfoRow label="Presentación" value={buildPresentationSummary(row?.attributes)} />
                        <InfoRow label="Precio base" value={basePriceLabel} />

                        <Box>
                          <Typography sx={mobileLabelSx}>Estado</Typography>

                          <FormControlLabel
                            sx={{ m: 0, mt: 0.25 }}
                            control={
                              <Switch
                                checked={Boolean(variant?.is_enabled)}
                                disabled={isInvalid || changingVariant}
                                onChange={(event) => onToggle(variant.id, event.target.checked)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography sx={switchLabelSx}>
                                {changingState ? "Guardando…" : variant?.is_enabled ? "Activa" : "Inactiva"}
                              </Typography>
                            }
                          />
                        </Box>

                        <Box>
                          <Typography sx={mobileLabelSx}>Predeterminada</Typography>

                          <FormControlLabel
                            sx={{ m: 0, mt: 0.25 }}
                            control={
                              <Switch
                                checked={Boolean(variant?.is_default)}
                                disabled={isInvalid || changingVariant}
                                onChange={(event) => onDefault(variant.id, event.target.checked)}
                                color="primary"
                              />
                            }
                            label={
                              <Typography sx={switchLabelSx}>
                                {changingDefault ? "Guardando…" : variant?.is_default ? "Sí" : "No"}
                              </Typography>
                            }
                          />
                        </Box>

                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          spacing={1}
                          sx={{ mt: "auto !important", pt: 1 }}
                        >
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<SettingsOutlinedIcon />}
                            onClick={() => openManage(row)}
                            disabled={changingVariant}
                            sx={{ minHeight: 42, fontWeight: 800 }}
                          >
                            Administrar
                          </Button>

                          <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteOutlineIcon />}
                            onClick={() => onDelete(row)}
                            disabled={changingVariant}
                            sx={{ minHeight: 42, fontWeight: 800 }}
                          >
                            {deleting ? "Eliminando…" : "Eliminar"}
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  );
                })}
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
                itemLabel="variantes"
              />
            </>
          ) : (
            <>
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 1050 }}>
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          bgcolor: "primary.main",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 800,
                          whiteSpace: "nowrap",
                          borderBottom: "none",
                        },
                      }}
                    >
                      <TableCell>Variante</TableCell>
                      <TableCell>Presentación</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Predeterminada</TableCell>
                      <TableCell>Precio base</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((row) => {
                      const variant = row?.variant || {};
                      const names = resolveVariantNames(product, row);
                      const isInvalid = Boolean(variant?.is_invalid);
                      const changingState = isPending(variant.id, "estado");
                      const changingDefault = isPending(variant.id, "predeterminada");
                      const deleting = isPending(variant.id, "eliminar");
                      const changingVariant = changingState || changingDefault || deleting;

                      return (
                        <TableRow
                          key={variant.id}
                          hover
                          sx={{
                            bgcolor: isInvalid ? "rgba(211,47,47,0.035)" : "inherit",
                            "& td": {
                              py: 1.6,
                              borderBottom: "1px solid",
                              borderColor: "divider",
                              verticalAlign: "middle",
                            },
                          }}
                        >
                          <TableCell sx={{ minWidth: 250 }}>
                            <Stack spacing={0.6}>
                              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                                {names.title}
                              </Typography>

                              {isInvalid ? (
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  <Chip
                                    size="small"
                                    color="error"
                                    label="Requiere corrección"
                                    sx={{ fontWeight: 800 }}
                                  />

                                  {variant?.invalid_reason ? (
                                    <Typography
                                      sx={{
                                        maxWidth: 280,
                                        fontSize: 11,
                                        color: "error.main",
                                        lineHeight: 1.35,
                                      }}
                                    >
                                      {variant.invalid_reason}
                                    </Typography>
                                  ) : null}
                                </Stack>
                              ) : null}
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ minWidth: 220 }}>
                            <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>
                              {buildPresentationSummary(row?.attributes)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={Boolean(variant?.is_enabled)}
                                  disabled={isInvalid || changingVariant}
                                  onChange={(event) => onToggle(variant.id, event.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {changingState ? "Guardando…" : variant?.is_enabled ? "Activa" : "Inactiva"}
                                </Typography>
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={Boolean(variant?.is_default)}
                                  disabled={isInvalid || changingVariant}
                                  onChange={(event) => onDefault(variant.id, event.target.checked)}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {changingDefault ? "Guardando…" : variant?.is_default ? "Sí" : "No"}
                                </Typography>
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                              {basePriceLabel}
                            </Typography>

                            <Typography sx={{ mt: 0.25, fontSize: 11, color: "text.secondary" }}>
                              Precio del producto
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                              <Button
                                variant="outlined"
                                startIcon={<SettingsOutlinedIcon />}
                                onClick={() => openManage(row)}
                                disabled={changingVariant}
                                sx={{ minHeight: 38, minWidth: 125, fontSize: 12, fontWeight: 800 }}
                              >
                                Administrar
                              </Button>

                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteOutlineIcon />}
                                onClick={() => onDelete(row)}
                                disabled={changingVariant}
                                sx={{ minHeight: 38, minWidth: 110, fontSize: 12, fontWeight: 800 }}
                              >
                                {deleting ? "Eliminando…" : "Eliminar"}
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

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
                itemLabel="variantes"
              />
            </>
          )}
        </Paper>

        <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
          Las variantes que requieren corrección permanecen inactivas hasta que su presentación vuelva a quedar correctamente relacionada.
        </Typography>
      </Stack>

      <VariantManagementDialog
        open={management.open}
        onClose={closeManagement}
        restaurantId={restaurantId}
        productId={productId}
        productName={titleName}
        initialView={management.initialView}
        initialVariantRow={management.variantRow}
        disabledByPrecondition={!canCreateVariants}
        onChanged={syncVariants}
      />

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

function InstructionRow({ icon, text }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 30,
          minWidth: 30,
          height: 30,
          display: "grid",
          placeItems: "center",
          borderRadius: 1,
          bgcolor: "primary.main",
          color: "#fff",
        }}
      >
        {icon}
      </Box>

      <Typography sx={{ pt: 0.35, fontSize: 14, color: "text.primary", lineHeight: 1.55 }}>
        {text}
      </Typography>
    </Stack>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box>
      <Typography sx={mobileLabelSx}>{label}</Typography>
      <Typography sx={mobileValueSx}>{value}</Typography>
    </Box>
  );
}

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};

const mobileLabelSx = {
  fontSize: 11,
  fontWeight: 800,
  color: "text.secondary",
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const mobileValueSx = {
  mt: 0.3,
  fontSize: 14,
  color: "text.primary",
  lineHeight: 1.5,
  wordBreak: "break-word",
};