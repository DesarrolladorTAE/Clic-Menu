import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert, Box, Button, Card, Chip, CircularProgress, FormControlLabel, IconButton, Paper, Stack, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TuneIcon from "@mui/icons-material/Tune";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";

import {
  getProductVariants,
  toggleProductVariant,
  setDefaultProductVariant,
  deleteProductVariant,
} from "../../../services/products/variants/productVariants.service";

import VariantWizardModal from "../../../components/variants/VariantWizardModal";
import RepairVariantModal from "../../../components/variants/RepairVariantModal";
import VariantChannelsModal from "../../../components/variants/VariantChannelsModal";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import PaginationFooter from "../../../components/common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";
import { normalizeErr } from "../../../utils/err";

const PAGE_SIZE = 5;

function money(n) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  return num.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

function buildAttrSummary(attributes) {
  if (!attributes?.length) return "—";
  const parts = attributes.map((a) => {
    const vals = (a.values || []).map((v) => v.value_name).join(", ");
    return `${a.attribute_name}: ${vals}`;
  });
  return parts.join(" | ");
}

export default function ProductVariantsPage() {
  const nav = useNavigate();
  const { restaurantId, productId } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [product, setProduct] = useState(null);
  const [preconditions, setPreconditions] = useState(null);
  const [basePrice, setBasePrice] = useState(null);
  const [rows, setRows] = useState([]);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [repairOpen, setRepairOpen] = useState(false);
  const [repairTarget, setRepairTarget] = useState(null);
  const [channelsOpen, setChannelsOpen] = useState(false);
  const [channelsTarget, setChannelsTarget] = useState(null);

  const reqRef = useRef(0);

  const titleName = product?.name || "Producto";
  const canCreateVariants = !!preconditions?.has_any_channel_price;
  const isEmpty = !loading && rows.length === 0;

  const basePriceLabel = useMemo(() => {
    if (!basePrice) return "—";
    const min = basePrice?.min;
    const max = basePrice?.max;
    if (min == null && max == null) return "—";
    if (min === max) return money(min);
    return `${money(min)} - ${money(max)}`;
  }, [basePrice]);

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

  const load = async (opts = { initial: false }) => {
    const myReq = ++reqRef.current;
    setErr("");

    if (opts.initial) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await getProductVariants(restaurantId, productId);
      if (myReq !== reqRef.current) return;

      setProduct(data?.product || null);
      setPreconditions(data?.preconditions || null);
      setBasePrice(data?.base_price || null);
      setRows(data?.data || []);
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudieron cargar variantes"));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId]);

  useEffect(() => {
    if (!err) return;

    const timer = setTimeout(() => {
      setErr("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [err]);

  const onToggle = async (variantId, nextEnabled) => {
    setErr("");

    const row = rows.find((x) => x?.variant?.id === variantId);
    const v = row?.variant;

    if (v?.is_invalid) return;

    const snapshot = rows;
    setRows((prev) =>
      prev.map((r) =>
        r.variant.id === variantId
          ? { ...r, variant: { ...r.variant, is_enabled: !!nextEnabled } }
          : r
      )
    );

    try {
      await toggleProductVariant(
        restaurantId,
        productId,
        variantId,
        nextEnabled
      );

      showAlert({
        severity: "success",
        title: "Estado actualizado",
        message: nextEnabled
          ? "La variante quedó activa."
          : "La variante quedó inactiva.",
      });
    } catch (e) {
      setRows(snapshot);
      setErr(normalizeErr(e, "No se pudo actualizar estado"));
    }
  };

  const onDefault = async (variantId, nextDefault) => {
    setErr("");

    const row = rows.find((x) => x?.variant?.id === variantId);
    const v = row?.variant;

    if (v?.is_invalid) {
      setErr(
        "No puedes marcar como default una variante inválida. Corrige o elimina la variante."
      );
      return;
    }

    const snapshot = rows;

    setRows((prev) =>
      prev.map((r) => {
        if (r.variant.id === variantId) {
          const forceEnabled = nextDefault ? true : r.variant.is_enabled;
          return {
            ...r,
            variant: {
              ...r.variant,
              is_default: !!nextDefault,
              is_enabled: forceEnabled,
            },
          };
        }

        return nextDefault
          ? { ...r, variant: { ...r.variant, is_default: false } }
          : r;
      })
    );

    try {
      await setDefaultProductVariant(
        restaurantId,
        productId,
        variantId,
        nextDefault
      );

      showAlert({
        severity: "success",
        title: "Default actualizado",
        message: nextDefault
          ? "La variante quedó como predeterminada."
          : "La variante dejó de ser predeterminada.",
      });
    } catch (e) {
      setRows(snapshot);
      setErr(normalizeErr(e, "No se pudo actualizar default"));
    }
  };

  const onDelete = async (variantId, variantName) => {
    setErr("");

    const ok = window.confirm(
      `¿Eliminar esta variante?\n\n${variantName || "Variante"}\n\nEsto borrará también sus valores relacionados.`
    );
    if (!ok) return;

    const snapshot = rows;
    setRows((prev) => prev.filter((r) => r.variant.id !== variantId));

    try {
      await deleteProductVariant(restaurantId, productId, variantId);
      await load({ initial: false });

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "La variante fue eliminada correctamente.",
      });
    } catch (e) {
      setRows(snapshot);
      setErr(normalizeErr(e, "No se pudo eliminar la variante"));
    }
  };

  const onEdit = (variantRow) => {
    setRepairTarget(variantRow);
    setRepairOpen(true);
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
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
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
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 30, md: 42 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.1,
              }}
            >
              Variantes
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 15, md: 18 },
              }}
            >
              Administra las combinaciones disponibles para <strong>{titleName}</strong>.
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              sx={{ mt: 1.5 }}
            >
              <Chip
                size="small"
                color="secondary"
                label={`Precio base: ${basePriceLabel}`}
                sx={{ fontWeight: 800 }}
              />

              {refreshing ? (
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  Actualizando cambios…
                </Typography>
              ) : null}
            </Stack>
          </Box>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.5}
            width={{ xs: "100%", md: "auto" }}
          >
            <Button
              onClick={() =>
                nav(`/owner/restaurants/${restaurantId}/operation/menu/products`)
              }
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 210 },
                height: 44,
                borderRadius: 2,
              }}
            >
              Volver a productos
            </Button>

            <Button
              onClick={() => {
                setWizardOpen(true);
              }}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!canCreateVariants}
              title={
                !canCreateVariants
                  ? "Configura al menos un precio por canal antes"
                  : "Crear variantes"
              }
              sx={{
                minWidth: { xs: "100%", sm: 190 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Crear variante
            </Button>
          </Stack>
        </Stack>

        <Paper
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: 1,
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
              Antes de comenzar
            </Typography>

            <InstructionRow
              icon={<AutoAwesomeMotionIcon sx={{ fontSize: 18 }} />}
              text="Las variantes permiten ofrecer diferentes combinaciones del mismo producto, como tamaño, sabor o presentación."
            />

            <InstructionRow
              icon={<TuneIcon sx={{ fontSize: 18 }} />}
              text="Una variante inválida no puede activarse ni quedar como predeterminada hasta corregirse o eliminarse."
            />

            <InstructionRow
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
              text="El precio base se hereda del producto. Después puedes ajustar precios específicos por canal en cada variante."
            />
          </Stack>
        </Paper>

        {!canCreateVariants ? (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 1,
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                No se pueden crear variantes todavía
              </Typography>
              <Typography variant="body2">
                Este producto no tiene ningún precio habilitado por canal.
                Configura primero el precio en <code>product_channel</code>.
              </Typography>
            </Box>
          </Alert>
        ) : null}

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
                Ocurrió un problema
              </Typography>
              <Typography variant="body2">{err}</Typography>
            </Box>
          </Alert>
        ) : null}

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
              Lista de variantes
            </Typography>
          </Box>

          {isEmpty ? (
            <Box
              sx={{
                px: 3,
                py: 5,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Este producto no tiene variantes
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Crea la primera variante para comenzar a manejar combinaciones.
              </Typography>

              <Button
                onClick={() => setWizardOpen(true)}
                variant="contained"
                startIcon={<AddIcon />}
                disabled={!canCreateVariants}
                sx={{
                  mt: 2.5,
                  minWidth: 220,
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                Crear variante
              </Button>
            </Box>
          ) : (
            <>
              {isMobile ? (
                <Stack spacing={1.5} sx={{ p: 2 }}>
                  {paginatedItems.map((r) => {
                    const v = r.variant;
                    const attrs = r.attributes;

                    const isInvalid = !!v.is_invalid;
                    const invalidReason = v.invalid_reason || "";
                    const canOpenChannels = !isInvalid && !!v.is_enabled;

                    return (
                      <Card
                        key={v.id}
                        sx={{
                          borderRadius: 1,
                          boxShadow: "none",
                          border: "1px solid",
                          borderColor: isInvalid ? "#FFD1D1" : "divider",
                          backgroundColor: isInvalid ? "#FFF7F7" : "#fff",
                        }}
                      >
                        <Box sx={{ p: 2 }}>
                          <Stack spacing={1.5}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "text.primary",
                                    lineHeight: 1.25,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {v.name}
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  useFlexGap
                                  sx={{ mt: 1 }}
                                >
                                  {v.is_default ? (
                                    <Chip
                                      size="small"
                                      label="Default"
                                      color="success"
                                      sx={{ fontWeight: 800 }}
                                    />
                                  ) : null}

                                  {isInvalid ? (
                                    <Chip
                                      size="small"
                                      label="Inválida"
                                      color="error"
                                      sx={{ fontWeight: 800 }}
                                    />
                                  ) : null}
                                </Stack>
                              </Box>

                              <Stack direction="row" spacing={1}>
                                <Tooltip title="Editar">
                                  <span>
                                    <IconButton
                                      onClick={() => onEdit(r)}
                                      disabled={!isInvalid}
                                      sx={iconEditSx}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title="Eliminar">
                                  <IconButton
                                    onClick={() => onDelete(v.id, v.name)}
                                    sx={iconDeleteSx}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>

                            {isInvalid ? (
                              <Alert
                                severity="error"
                                sx={{
                                  borderRadius: 1,
                                  alignItems: "flex-start",
                                }}
                              >
                                <Typography variant="body2">
                                  {invalidReason ||
                                    "Esta variante quedó inválida. Corrige o elimínala."}
                                </Typography>
                              </Alert>
                            ) : null}

                            <InfoRow
                              label="Atributos"
                              value={buildAttrSummary(attrs)}
                            />

                            <InfoRow
                              label="Precio base"
                              value={basePriceLabel}
                            />

                            <Box>
                              <Typography sx={mobileLabelSx}>Estado</Typography>

                              <FormControlLabel
                                sx={{ m: 0, mt: 0.5 }}
                                control={
                                  <Switch
                                    checked={!!v.is_enabled}
                                    disabled={isInvalid}
                                    onChange={(e) =>
                                      onToggle(v.id, e.target.checked)
                                    }
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography sx={switchLabelSx}>
                                    {v.is_enabled ? "Activa" : "Inactiva"}
                                  </Typography>
                                }
                              />
                            </Box>

                            <Box>
                              <Typography sx={mobileLabelSx}>
                                Predeterminada
                              </Typography>

                              <FormControlLabel
                                sx={{ m: 0, mt: 0.5 }}
                                control={
                                  <Switch
                                    checked={!!v.is_default}
                                    disabled={isInvalid}
                                    onChange={(e) =>
                                      onDefault(v.id, e.target.checked)
                                    }
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography sx={switchLabelSx}>
                                    {v.is_default ? "Sí" : "No"}
                                  </Typography>
                                }
                              />
                            </Box>

                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                            >
                              <Button
                                onClick={() => {
                                  setChannelsTarget(v);
                                  setChannelsOpen(true);
                                }}
                                disabled={!canOpenChannels}
                                variant="outlined"
                                startIcon={<TuneIcon />}
                                sx={{
                                  flex: 1,
                                  height: 40,
                                  borderRadius: 2,
                                  fontSize: 12,
                                  fontWeight: 800,
                                }}
                              >
                                Canales
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      </Card>
                    );
                  })}
                </Stack>
              ) : (
                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                  <Table sx={{ minWidth: 1080 }}>
                    <TableHead>
                      <TableRow
                        sx={{
                          "& th": {
                            backgroundColor: "primary.main",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: 13,
                            borderBottom: "none",
                            whiteSpace: "nowrap",
                          },
                        }}
                      >
                        <TableCell>Variante</TableCell>
                        <TableCell>Atributos</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Precio base</TableCell>
                        <TableCell align="right">Acciones</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedItems.map((r) => {
                        const v = r.variant;
                        const attrs = r.attributes;

                        const isInvalid = !!v.is_invalid;
                        const invalidReason = v.invalid_reason || "";
                        const canOpenChannels = !isInvalid && !!v.is_enabled;

                        return (
                          <TableRow
                            key={v.id}
                            hover
                            sx={{
                              backgroundColor: isInvalid ? "#FFF7F7" : "inherit",
                              "& td": {
                                borderBottom: "1px solid",
                                borderColor: "divider",
                                fontSize: 14,
                                color: "text.primary",
                                verticalAlign: "top",
                              },
                            }}
                          >
                            <TableCell>
                              <Stack spacing={0.75}>
                                <Typography sx={{ fontWeight: 800 }}>
                                  {v.name}
                                </Typography>
                                
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  flexWrap="wrap"
                                  useFlexGap
                                >
                                  {v.is_default ? (
                                    <Chip
                                      size="small"
                                      label="Default"
                                      color="success"
                                      sx={{ fontWeight: 800 }}
                                    />
                                  ) : null}

                                  {isInvalid ? (
                                    <Chip
                                      size="small"
                                      label="Inválida"
                                      color="error"
                                      sx={{ fontWeight: 800 }}
                                    />
                                  ) : null}
                                </Stack>

                                {isInvalid ? (
                                  <Alert
                                    severity="error"
                                    sx={{
                                      mt: 0.5,
                                      borderRadius: 1,
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <Typography variant="body2">
                                      {invalidReason ||
                                        "Esta variante quedó inválida. Corrige o elimínala."}
                                    </Typography>
                                  </Alert>
                                ) : null}
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <Typography
                                sx={{
                                  fontSize: 13,
                                  color: "text.primary",
                                  lineHeight: 1.55,
                                  whiteSpace: "normal",
                                }}
                              >
                                {buildAttrSummary(attrs)}
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Stack spacing={1}>
                                <FormControlLabel
                                  sx={{ m: 0 }}
                                  control={
                                    <Switch
                                      checked={!!v.is_enabled}
                                      disabled={isInvalid}
                                      onChange={(e) =>
                                        onToggle(v.id, e.target.checked)
                                      }
                                      color="primary"
                                    />
                                  }
                                  label={
                                    <Typography sx={switchLabelSx}>
                                      {v.is_enabled ? "Activa" : "Inactiva"}
                                    </Typography>
                                  }
                                />

                                <FormControlLabel
                                  sx={{ m: 0 }}
                                  control={
                                    <Switch
                                      checked={!!v.is_default}
                                      disabled={isInvalid}
                                      onChange={(e) =>
                                        onDefault(v.id, e.target.checked)
                                      }
                                      color="primary"
                                    />
                                  }
                                  label={
                                    <Typography sx={switchLabelSx}>
                                      {v.is_default ? "Default" : "Sin default"}
                                    </Typography>
                                  }
                                />

                                {isInvalid ? (
                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "text.secondary",
                                    }}
                                  >
                                    No se puede activar hasta corregir.
                                  </Typography>
                                ) : null}
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <Stack spacing={0.5}>
                                <Typography sx={{ fontWeight: 800 }}>
                                  {basePriceLabel}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "text.secondary",
                                  }}
                                >
                                  Hereda del producto
                                </Typography>
                              </Stack>
                            </TableCell>

                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                                alignItems="center"
                                flexWrap="nowrap"
                              >
                                <Button
                                  onClick={() => {
                                    setChannelsTarget(v);
                                    setChannelsOpen(true);
                                  }}
                                  disabled={!canOpenChannels}
                                  variant="outlined"
                                  sx={{
                                    height: 36,
                                    minWidth: 120,
                                    borderRadius: 2,
                                    fontSize: 12,
                                    fontWeight: 800,
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  Canales
                                </Button>

                                <Tooltip title="Editar">
                                  <span>
                                    <IconButton
                                      onClick={() => onEdit(r)}
                                      disabled={!isInvalid}
                                      sx={iconEditSx}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title="Eliminar">
                                  <IconButton
                                    onClick={() => onDelete(v.id, v.name)}
                                    sx={iconDeleteSx}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
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

        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          Nota: si una variante se vuelve inválida por borrar un atributo o valor,
          queda inactiva y no puede reactivarse hasta corregirse o eliminarse.
        </Typography>
      </Stack>

      <VariantWizardModal
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false);
        }}
        restaurantId={restaurantId}
        productId={productId}
        productName={titleName}
        disabledByPrecondition={!canCreateVariants}
        onGenerated={async () => {
          await load({ initial: false });
          showAlert({
            severity: "success",
            title: "Hecho",
            message: "Las variantes se actualizaron correctamente.",
          });
        }}
      />

      <RepairVariantModal
        open={repairOpen}
        onClose={() => {
          setRepairOpen(false);
          setRepairTarget(null);
        }}
        restaurantId={restaurantId}
        productId={productId}
        variantRow={repairTarget}
        onRepaired={async () => {
          await load({ initial: false });
          showAlert({
            severity: "success",
            title: "Variante corregida",
            message: "La variante fue reparada correctamente.",
          });
        }}
      />

      <VariantChannelsModal
        open={channelsOpen}
        onClose={() => {
          setChannelsOpen(false);
          setChannelsTarget(null);
        }}
        restaurantId={restaurantId}
        productId={productId}
        variant={channelsTarget}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </PageContainer>
  );
}

function InstructionRow({ icon, text }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          minWidth: 28,
          height: 28,
          borderRadius: 999,
          bgcolor: "primary.main",
          color: "#fff",
          display: "grid",
          placeItems: "center",
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.6,
        }}
      >
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
  mt: 0.25,
  fontSize: 14,
  color: "text.primary",
  wordBreak: "break-word",
  lineHeight: 1.5,
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
  "&.Mui-disabled": {
    bgcolor: "#EFE7BF",
    color: "rgba(255,255,255,0.85)",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "error.dark",
  },
};