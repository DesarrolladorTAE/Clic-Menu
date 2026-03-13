import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  Alert, Box, Button, Card, Chip,CircularProgress, FormControlLabel, IconButton, Paper,Stack, Switch,
  Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsInputComponentOutlinedIcon from "@mui/icons-material/SettingsInputComponentOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import AutoAwesomeMotionIcon from "@mui/icons-material/AutoAwesomeMotion";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import {
  getProductComponents,
  upsertProductComponents,
} from "../../services/products/catalog/productComponents.service";
import { getProduct } from "../../services/products/products.service";

import PageContainer from "../../components/common/PageContainer";
import AppAlert from "../../components/common/AppAlert";
import PaginationFooter from "../../components/common/PaginationFooter";
import usePagination from "../../hooks/usePagination";
import CompositionWizard from "../../components/products/CompositionWizard";

function apiErrorToMessage(e, fallback) {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    fallback
  );
}

const PAGE_SIZE = 5;

export default function ProductCompositionPage() {
  const nav = useNavigate();
  const { restaurantId, productId } = useParams();
  const [sp, setSp] = useSearchParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const [settings, setSettings] = useState(null);
  const productsMode = settings?.products_mode || "global";
  const requiresBranch = productsMode === "branch";

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const effectiveBranchId = useMemo(() => {
    if (requiresBranch) return branchId ? Number(branchId) : null;
    return branchId ? Number(branchId) : null;
  }, [requiresBranch, branchId]);

  const [product, setProduct] = useState(null);
  const [items, setItems] = useState([]);

  const [wizardOpen, setWizardOpen] = useState(false);

  const branchLabel = useMemo(() => {
    if (!branchId) return "—";
    const b = branches.find((x) => String(x.id) === String(branchId));
    return b?.name || "Sucursal";
  }, [branches, branchId]);

  const showAlert = ({
    severity = "success",
    title = "",
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
    if (!err) return;
    const timer = setTimeout(() => setErr(""), 5000);
    return () => clearTimeout(timer);
  }, [err]);

  const loadAll = async () => {
    setErr("");
    setLoading(true);

    try {
      const st = await getRestaurantSettings(restaurantId);
      setSettings(st);

      const br = await getBranchesByRestaurant(restaurantId);
      const branchList = Array.isArray(br) ? br : [];
      setBranches(branchList);

      const qBranch = sp.get("branch_id");
      const chosen = qBranch || (branchList?.[0]?.id ? String(branchList[0].id) : "");

      if (chosen && chosen !== branchId) {
        setBranchId(chosen);
      }

      const p = await getProduct(restaurantId, productId);
      setProduct(p);

      const params =
        st?.products_mode === "branch"
          ? { branch_id: chosen ? Number(chosen) : undefined }
          : {};

      const comp = await getProductComponents(restaurantId, productId, params);
      setItems(comp?.data?.items || []);
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo cargar composición"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, productId]);

  useEffect(() => {
    if (!branchId) return;
    const next = new URLSearchParams(sp);
    next.set("branch_id", branchId);
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  const warningCompositeNoItems = useMemo(() => {
    if (!product) return false;
    if ((product.product_type || "simple") !== "composite") return false;
    return (items?.length || 0) === 0;
  }, [product, items]);

  const onSave = async (draftItems) => {
    setErr("");

    if (!product) return;

    if ((product.product_type || "simple") !== "composite") {
      setErr(
        "Este producto no es compuesto. Cambia su tipo a 'Compuesto' para configurar componentes."
      );
      return;
    }

    if (requiresBranch && !effectiveBranchId) {
      setErr("Selecciona una sucursal.");
      return;
    }

    const payload = {
      ...(requiresBranch ? { branch_id: effectiveBranchId } : {}),
      items: (draftItems || []).map((x, idx) => ({
        component_product_id: Number(x.component_product_id),
        qty: Number(x.qty || 1),
        allow_variant: !!x.allow_variant,
        apply_variant_price: !!x.apply_variant_price,
        is_optional: !!x.is_optional,
        sort_order: Number(x.sort_order ?? idx),
        notes: x.notes || null,
      })),
    };

    try {
      await upsertProductComponents(restaurantId, productId, payload);
      await loadAll();
      setWizardOpen(false);

      showAlert({
        severity: "success",
        title: "Composición guardada",
        message: "La composición del producto se actualizó correctamente.",
      });
    } catch (e) {
      setErr(apiErrorToMessage(e, "No se pudo guardar composición"));
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
    items,
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
              Cargando composición…
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
              Producto compuesto
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 15, md: 18 },
              }}
            >
              Configura la composición de <strong>{product?.name || "este producto"}</strong>.
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
                label={`Tipo: ${product?.product_type || "simple"}`}
                sx={{ fontWeight: 800 }}
              />
              <Chip
                size="small"
                color="secondary"
                label={`Modo: ${productsMode}`}
                sx={{ fontWeight: 800 }}
              />
            </Stack>
          </Box>

          <Button
            onClick={() =>
              nav(`/owner/restaurants/${restaurantId}/operation/menu/products`)
            }
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 220 },
              height: 44,
              borderRadius: 2,
            }}
          >
            Volver a productos
          </Button>
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
              icon={<SettingsInputComponentOutlinedIcon sx={{ fontSize: 18 }} />}
              text="Agrega los productos que formarán parte del compuesto. Cada componente puede tener cantidad, comportamiento opcional y configuración de variantes."
            />

            <InstructionRow
              icon={<Inventory2OutlinedIcon sx={{ fontSize: 18 }} />}
              text="Solo puedes usar productos activos y vendibles como componentes"
            />

            <InstructionRow
              icon={<StorefrontOutlinedIcon sx={{ fontSize: 18 }} />}
              text={
                productsMode === "global"
                  ? "Modo global: la sucursal seleccionada se usa para evaluar qué productos son vendibles."
                  : "Modo por sucursal: la composición se guarda específicamente en la sucursal seleccionada."
              }
            />
          </Stack>
        </Paper>

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
              Sucursales
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: "text.secondary",
              }}
            >
              Seleccionada: <strong>{branchLabel}</strong>
            </Typography>

            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Tabs
                value={branchId}
                onChange={(_, value) => setBranchId(value)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                textColor="inherit"
                slotProps={{
                  indicator: {
                    sx: {
                      height: 3,
                      borderRadius: "999px 999px 0 0",
                      backgroundColor: "primary.main",
                    },
                  },
                }}
                sx={{
                  minHeight: 56,
                  "& .MuiTabs-flexContainer": {
                    gap: { xs: 1, sm: 2 },
                  },
                  "& .MuiTabs-scrollButtons": {
                    color: "text.secondary",
                  },
                }}
              >
                {branches.map((b) => (
                  <Tab
                    key={b.id}
                    value={String(b.id)}
                    label={b.name || "Sucursal"}
                    disableRipple
                    sx={branchTabSx}
                  />
                ))}
              </Tabs>
            </Box>
          </Stack>
        </Paper>

        {warningCompositeNoItems ? (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 1,
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                Composición incompleta
              </Typography>
              <Typography variant="body2">
                Este producto compuesto no tiene componentes definidos. Por regla se considera inactivo hasta configurarse.
              </Typography>
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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
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
                  Componentes del producto
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "text.secondary",
                  }}
                >
                  Mostrando {total} componentes registrados.
                </Typography>
              </Box>

              <Button
                onClick={() => setWizardOpen(true)}
                disabled={(product?.product_type || "simple") !== "composite"}
                variant="contained"
                startIcon={<EditIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 200 },
                  height: 44,
                  borderRadius: 2,
                  fontWeight: 800,
                }}
              >
                {items.length ? "Editar composición" : "Crear composición"}
              </Button>
            </Stack>
          </Box>

          {items.length === 0 ? (
            <Box
              sx={{
                px: 3,
                py: 5,
                textAlign: "center",
              }}
            >
              <WarningAmberRoundedIcon
                sx={{
                  fontSize: 34,
                  color: "text.secondary",
                }}
              />

              <Typography
                sx={{
                  mt: 1,
                  fontSize: 20,
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                No hay componentes todavía
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 14,
                }}
              >
                Agrega componentes para construir este producto compuesto.
              </Typography>
            </Box>
          ) : (
            <>
              {isMobile ? (
                <Stack spacing={1.5} sx={{ p: 2 }}>
                  {paginatedItems.map((it) => (
                    <Card
                      key={it.id}
                      sx={{
                        borderRadius: 1,
                        boxShadow: "none",
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "#fff",
                      }}
                    >
                      <Box sx={{ p: 2 }}>
                        <Stack spacing={1.25}>
                          <InfoRow
                            label="Componente"
                            value={
                              it.component_product?.name ||
                              `Producto ${it.component_product_id}`
                            }
                          />
                          <InfoRow label="Cantidad" value={String(it.qty)} />

                          <Box>
                            <Typography sx={mobileLabelSx}>
                              Permite variantes
                            </Typography>
                            <FormControlLabel
                              sx={{ m: 0, mt: 0.5 }}
                              control={
                                <Switch
                                  checked={!!it.allow_variant}
                                  disabled
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {it.allow_variant ? "Sí" : "No"}
                                </Typography>
                              }
                            />
                          </Box>

                          <Box>
                            <Typography sx={mobileLabelSx}>
                              Precio extra
                            </Typography>
                            <FormControlLabel
                              sx={{ m: 0, mt: 0.5 }}
                              control={
                                <Switch
                                  checked={!!it.apply_variant_price}
                                  disabled
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {it.apply_variant_price ? "Sí" : "No"}
                                </Typography>
                              }
                            />
                          </Box>

                          <Box>
                            <Typography sx={mobileLabelSx}>Opcional</Typography>
                            <FormControlLabel
                              sx={{ m: 0, mt: 0.5 }}
                              control={
                                <Switch
                                  checked={!!it.is_optional}
                                  disabled
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {it.is_optional ? "Sí" : "No"}
                                </Typography>
                              }
                            />
                          </Box>
                        </Stack>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              ) : (
                <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                  <Table sx={{ minWidth: 980 }}>
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
                        <TableCell>Componente</TableCell>
                        <TableCell>Cantidad</TableCell>
                        <TableCell>Permite variantes</TableCell>
                        <TableCell>Precio extra</TableCell>
                        <TableCell>Opcional</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {paginatedItems.map((it) => (
                        <TableRow
                          key={it.id}
                          hover
                          sx={{
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
                            <Typography sx={{ fontWeight: 800 }}>
                              {it.component_product?.name ||
                                `Producto ${it.component_product_id}`}
                            </Typography>
                          </TableCell>

                          <TableCell>{it.qty}</TableCell>

                          <TableCell>
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={!!it.allow_variant}
                                  disabled
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {it.allow_variant ? "Sí" : "No"}
                                </Typography>
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={!!it.apply_variant_price}
                                  disabled
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {it.apply_variant_price ? "Sí" : "No"}
                                </Typography>
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={!!it.is_optional}
                                  disabled
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {it.is_optional ? "Sí" : "No"}
                                </Typography>
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
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
                itemLabel="componentes"
              />
            </>
          )}
        </Paper>
      </Stack>

      <CompositionWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        restaurantId={restaurantId}
        productId={productId}
        productsMode={productsMode}
        branchId={effectiveBranchId}
        initialItems={(items || []).map((x) => ({
          component_product_id: x.component_product_id,
          name: x.component_product?.name || "",
          qty: x.qty,
          allow_variant: !!x.allow_variant,
          apply_variant_price: !!x.apply_variant_price,
          is_optional: !!x.is_optional,
          sort_order: x.sort_order ?? 0,
          notes: x.notes || "",
        }))}
        onSave={onSave}
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

const branchTabSx = {
  minHeight: 56,
  px: { xs: 2, sm: 2.5 },
  py: 1,
  fontSize: { xs: 15, sm: 17 },
  fontWeight: 800,
  textTransform: "none",
  color: "text.secondary",
  borderRadius: "12px 12px 0 0",
  transition:
    "background-color 0.18s ease, color 0.18s ease, transform 0.12s ease",
  "&.Mui-selected": {
    color: "primary.main",
    bgcolor: "transparent",
  },
  "&:hover": {
    bgcolor: "rgba(255, 152, 0, 0.06)",
  },
  "&:active": {
    bgcolor: "rgba(255, 152, 0, 0.14)",
    transform: "scale(0.98)",
  },
  "&.Mui-focusVisible": {
    bgcolor: "rgba(255, 152, 0, 0.10)",
  },
};

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