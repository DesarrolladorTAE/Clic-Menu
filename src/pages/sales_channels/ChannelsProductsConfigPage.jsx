import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";

import { getBranch } from "../../services/restaurant/branch.service";
import {
  getChannelProducts,
  upsertChannelProduct,
} from "../../services/products/sales_channels/productChannel.service";

import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";
import AppAlert from "../../components/common/AppAlert";
import ChannelProductConfigModal from "../../components/sales_channels/ChannelProductConfigModal";

const PAGE_SIZE = 5;

function money(v) {
  if (v == null || v === "") return "—";
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

export default function ChannelProductsConfigPage() {
  const nav = useNavigate();
  const { restaurantId, branchId, salesChannelId } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const rid = Number(restaurantId);
  const bid = Number(branchId);
  const scid = Number(salesChannelId);

  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState({});

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [mode, setMode] = useState("global");
  const [branchName, setBranchName] = useState("");
  const [channelName, setChannelName] = useState("");
  const [channelCode, setChannelCode] = useState("");

  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [onlyActiveProductStatus, setOnlyActiveProductStatus] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [modalForm, setModalForm] = useState({ is_enabled: false, price: "" });

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

  const setSaving = (productId, v) =>
    setSavingMap((prev) => ({ ...prev, [productId]: v }));

  const isSaving = (productId) => !!savingMap[productId];

  const load = async () => {
    setLoading(true);

    try {
      try {
        const b = await getBranch(rid, bid);
        setBranchName(b?.name || "");
      } catch {
        setBranchName("");
      }

      const res = await getChannelProducts(rid, bid, scid);

      setMode(res?.mode || "global");
      setChannelName(res?.sales_channel?.name || "");
      setChannelCode(res?.sales_channel?.code || "");
      setRows(Array.isArray(res?.data) ? res.data : []);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la configuración del canal",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId, salesChannelId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows
      .filter((r) => {
        const p = r.product;
        if (onlyActiveProductStatus && p?.status !== "active") return false;
        if (!q) return true;

        const name = (p?.name || "").toLowerCase();
        const desc = (p?.description || "").toLowerCase();
        const cat = (p?.category?.name || "").toLowerCase();

        return name.includes(q) || desc.includes(q) || cat.includes(q);
      })
      .sort((a, b) => {
        const ea = a?.channel?.is_enabled ? 1 : 0;
        const eb = b?.channel?.is_enabled ? 1 : 0;
        if (ea !== eb) return eb - ea;
        return (a?.product?.name || "").localeCompare(b?.product?.name || "");
      });
  }, [rows, search, onlyActiveProductStatus]);

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
    items: filtered,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const branchLabel = branchName?.trim() ? branchName.trim() : `Sucursal ${bid}`;

  const modeHelp =
    mode === "global"
      ? "Modo GLOBAL: aquí configuras precio y visibilidad por canal para productos que la sucursal ya habilitó en su catálogo."
      : "Modo BRANCH: aquí configuras precio y visibilidad por canal para productos propios de la sucursal.";

  const openEdit = (row) => {
    const enabled = !!row?.channel?.is_enabled;
    const price = row?.channel?.price ?? "";

    setEditing(row);
    setModalForm({
      is_enabled: enabled,
      price: enabled ? String(price ?? "") : "",
    });
    setOpen(true);
  };

  const closeModal = () => {
    const pId = editing?.product?.id;
    if (pId && isSaving(pId)) return;
    setOpen(false);
    setEditing(null);
  };

  const onSaveModal = async (formValues) => {
    if (!editing?.product?.id) return;

    const productId = editing.product.id;
    if (isSaving(productId)) return;

    const enabled = !!formValues.is_enabled;
    const priceRaw = (formValues.price ?? "").toString().trim();

    if (enabled) {
      if (!priceRaw) {
        showAlert({
          severity: "warning",
          title: "Nota",
          message: "Si el producto está ACTIVO en el canal, el precio es obligatorio.",
        });
        return;
      }

      const priceNum = Number(priceRaw);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        showAlert({
          severity: "error",
          title: "Error",
          message: "Precio inválido. Usa un número mayor o igual a 0.",
        });
        return;
      }
    }

    setRows((prev) =>
      prev.map((r) => {
        if (r.product?.id !== productId) return r;
        return {
          ...r,
          channel: {
            ...(r.channel || {}),
            is_enabled: enabled,
            price: enabled ? Number(priceRaw) : null,
          },
        };
      })
    );

    setSaving(productId, true);

    try {
      await upsertChannelProduct(rid, bid, scid, productId, {
        is_enabled: enabled,
        price: enabled ? Number(priceRaw) : undefined,
      });

      setOpen(false);
      setEditing(null);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: e?.response?.data?.message || "No se pudo guardar la configuración",
      });
      await load();
    } finally {
      setSaving(productId, false);
    }
  };

  const onToggleQuick = async (row) => {
    const productId = row?.product?.id;
    if (!productId) return;

    if (isSaving(productId)) return;

    const prev = !!row?.channel?.is_enabled;
    const next = !prev;

    if (next) {
      openEdit(row);
      setModalForm({
        is_enabled: true,
        price: String(row?.channel?.price ?? ""),
      });
      return;
    }

    setRows((prevRows) =>
      prevRows.map((r) => {
        if (r.product?.id !== productId) return r;
        return {
          ...r,
          channel: { ...(r.channel || {}), is_enabled: false, price: null },
        };
      })
    );

    setSaving(productId, true);

    try {
      await upsertChannelProduct(rid, bid, scid, productId, {
        is_enabled: false,
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: e?.response?.data?.message || "No se pudo actualizar el estado",
      });
      await load();
    } finally {
      setSaving(productId, false);
    }
  };

  const handleBack = () => {
    nav(`/owner/restaurants/${rid}/operation/branch-sales-channels`);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "grid",
          placeItems: "center",
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="primary" />
          <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
            Cargando configuración…
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 8, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
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
                Configuración de productos
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 15, md: 18 },
                }}
              >
                {branchLabel} · Canal:{" "}
                <strong>{channelCode ? `${channelCode} · ` : ""}{channelName || scid}</strong>
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: 13,
                }}
              >
                {modeHelp}
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              width={{ xs: "100%", md: "auto" }}
            >
              <Button
                onClick={handleBack}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                sx={{
                  minWidth: { xs: "100%", sm: 150 },
                  height: 44,
                  borderRadius: 2,
                }}
              >
                Volver
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
            <Stack spacing={2}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "flex-end" }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={fieldLabelSx}>Buscar producto</Typography>
                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, descripción o categoría..."
                    fullWidth
                  />
                </Box>
              </Stack>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={onlyActiveProductStatus}
                      onChange={(e) => setOnlyActiveProductStatus(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography sx={switchLabelSx}>
                      Solo productos activos
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />

                <Typography
                  sx={{
                    fontSize: 13,
                    color: "text.secondary",
                    fontWeight: 700,
                  }}
                >
                  Mostrando {filtered.length} de {rows.length} productos
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            sx={{
              p: 0,
              overflow: "hidden",
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            {filtered.length === 0 ? (
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
                  No hay productos para mostrar
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Ajusta el filtro o revisa la configuración del canal seleccionado.
                </Typography>
              </Box>
            ) : (
              <>
                {isMobile ? (
                  <Stack spacing={1.5} sx={{ p: 2 }}>
                    {paginatedItems.map((r) => {
                      const p = r.product;
                      const enabled = !!r?.channel?.is_enabled;
                      const price = r?.channel?.price;
                      const busy = isSaving(p.id);
                      const disabledByProductStatus = p?.status !== "active";

                      return (
                        <Card
                          key={p.id}
                          sx={{
                            borderRadius: 1,
                            boxShadow: "none",
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: "#fff",
                            opacity: disabledByProductStatus ? 0.65 : 1,
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
                                      fontSize: 15,
                                      fontWeight: 800,
                                      color: "text.primary",
                                      lineHeight: 1.3,
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {p?.name || "Producto sin nombre"}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: 13,
                                      color: "text.secondary",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {p?.category?.name || "Sin categoría"}
                                  </Typography>
                                </Box>

                                <Stack spacing={0.75} alignItems="flex-end">
                                  <Chip
                                    label={enabled ? "ACTIVO" : "NO ACTIVO"}
                                    color={enabled ? "success" : "default"}
                                    size="small"
                                    sx={{ fontWeight: 800 }}
                                  />
                                </Stack>
                              </Stack>

                              {p?.description ? (
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    color: "text.secondary",
                                    lineHeight: 1.45,
                                  }}
                                >
                                  {p.description}
                                </Typography>
                              ) : null}

                              <Box>
                                <Typography sx={mobileLabelSx}>Estado del producto</Typography>
                                <Typography sx={mobileValueSx}>
                                  {p?.status || "—"}
                                </Typography>
                              </Box>

                              <Box>
                                <Typography sx={mobileLabelSx}>Precio en canal</Typography>
                                <Typography sx={mobileValueSx}>
                                  {enabled ? money(price) : "—"}
                                </Typography>
                              </Box>

                              <Stack spacing={1.25}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-start",
                                    minWidth: 0,
                                  }}
                                >
                                  <FormControlLabel
                                    sx={{
                                      m: 0,
                                      minWidth: 0,
                                      "& .MuiFormControlLabel-label": {
                                        minWidth: 0,
                                      },
                                    }}
                                    control={
                                      <Switch
                                        checked={enabled}
                                        disabled={busy || disabledByProductStatus}
                                        onChange={() => onToggleQuick(r)}
                                        color="primary"
                                      />
                                    }
                                    label={
                                      <Typography sx={switchLabelSx}>
                                        {enabled ? "Activo" : "Inactivo"}
                                      </Typography>
                                    }
                                  />
                                </Box>

                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Tooltip title="Editar configuración">
                                    <span>
                                      <IconButton
                                        onClick={() => openEdit(r)}
                                        disabled={busy || disabledByProductStatus}
                                        sx={iconEditSx}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Stack>
                              </Stack>

                              {busy ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <CircularProgress size={16} color="primary" />
                                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                    Guardando cambios…
                                  </Typography>
                                </Stack>
                              ) : null}
                            </Stack>
                          </Box>
                        </Card>
                      );
                    })}
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
                          <TableCell>Producto</TableCell>
                          <TableCell>Estado producto</TableCell>
                          <TableCell>Estado canal</TableCell>
                          <TableCell>Precio</TableCell>
                          <TableCell align="center">Activo</TableCell>
                          <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                      </TableHead>

                      <TableBody>
                        {paginatedItems.map((r) => {
                          const p = r.product;
                          const enabled = !!r?.channel?.is_enabled;
                          const price = r?.channel?.price;
                          const busy = isSaving(p.id);
                          const disabledByProductStatus = p?.status !== "active";

                          return (
                            <TableRow
                              key={p.id}
                              hover
                              sx={{
                                opacity: disabledByProductStatus ? 0.6 : 1,
                                "& td": {
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  fontSize: 14,
                                  color: "text.primary",
                                  whiteSpace: "nowrap",
                                },
                              }}
                            >
                              <TableCell>
                                <Stack spacing={0.5}>
                                  <Typography sx={{ fontWeight: 800 }}>
                                    {p?.name || "Producto sin nombre"}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontSize: 12,
                                      color: "text.secondary",
                                      whiteSpace: "normal",
                                    }}
                                  >
                                    Categoría: <strong>{p?.category?.name || "—"}</strong>
                                  </Typography>

                                  {p?.description ? (
                                    <Typography
                                      sx={{
                                        fontSize: 12,
                                        color: "text.secondary",
                                        whiteSpace: "normal",
                                      }}
                                    >
                                      {p.description}
                                    </Typography>
                                  ) : null}
                                </Stack>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={p?.status === "active" ? "ACTIVO" : "INACTIVO"}
                                  color={p?.status === "active" ? "success" : "default"}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    minWidth: 92,
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={enabled ? "ACTIVO" : "NO ACTIVO"}
                                  color={enabled ? "success" : "default"}
                                  size="small"
                                  sx={{
                                    fontWeight: 800,
                                    minWidth: 100,
                                  }}
                                />
                              </TableCell>

                              <TableCell sx={{ fontWeight: 800 }}>
                                {enabled ? money(price) : "—"}
                              </TableCell>

                              <TableCell align="center">
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  <Switch
                                    checked={enabled}
                                    disabled={busy || disabledByProductStatus}
                                    onChange={() => onToggleQuick(r)}
                                    color="primary"
                                  />

                                  {busy && <CircularProgress size={16} color="primary" />}
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
                                  <Tooltip title="Editar configuración">
                                    <span>
                                      <IconButton
                                        onClick={() => openEdit(r)}
                                        disabled={busy || disabledByProductStatus}
                                        sx={iconEditSx}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                    </span>
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
                  itemLabel="productos"
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
            Nota: si un producto está <strong>Inactivo</strong> a nivel catálogo, actívalo primero en “Administrar productos”.
          </Typography>
        </Stack>
      </Box>

      <ChannelProductConfigModal
        open={open}
        onClose={closeModal}
        onSave={onSaveModal}
        saving={isSaving(editing?.product?.id)}
        channelName={channelName}
        branchLabel={branchLabel}
        editing={editing}
        initialForm={modalForm}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </Box>
  );
}

const fieldLabelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
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
};

const iconEditSx = {
  width: 36,
  height: 36,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
  },
};