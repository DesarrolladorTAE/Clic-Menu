import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert, Box, Button, Card, Chip, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  Paper, Stack, Switch, Tab, Tabs, TextField,Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";
import {
  getVariantChannels,
  upsertVariantChannels,
} from "../../services/products/variants/productVariantChannels.service";

import PageContainer from "../common/PageContainer";
import PaginationFooter from "../common/PaginationFooter";
import AppAlert from "../common/AppAlert";
import usePagination from "../../hooks/usePagination";

const PAGE_SIZE = 5;

function money(n) {
  if (n == null || n === "") return "—";
  const num = Number(n);
  if (!Number.isFinite(num)) return String(n);
  return num.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function normalizeErr(e, fallback = "Ocurrió un error") {
  return (
    e?.response?.data?.message ||
    (e?.response?.data?.errors
      ? Object.values(e.response.data.errors).flat().join("\n")
      : "") ||
    fallback
  );
}

export default function VariantChannelsModal({
  open,
  onClose,
  restaurantId,
  productId,
  variant,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [err, setErr] = useState("");
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [tableReady, setTableReady] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [table, setTable] = useState(null);
  const [rows, setRows] = useState([]);

  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

  const variantDisabled = !variant?.is_enabled;

  const canEditGlobal = useMemo(() => {
    return open && !variantDisabled;
  }, [open, variantDisabled]);

  const selectedBranchName = useMemo(() => {
    return branches.find((b) => String(b.id) === String(branchId))?.name || "";
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

  const close = () => {
    setErr("");
    setTable(null);
    setRows([]);
    setDraft({});
    setBranchId("");
    setTableReady(false);
    onClose?.();
  };

  useEffect(() => {
    if (!err) return;

    const timer = setTimeout(() => {
      setErr("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [err]);

  const loadBranches = async () => {
    const myReq = ++reqRef.current;
    setErr("");
    setLoadingBranches(true);

    try {
      const data = await getBranchesByRestaurant(restaurantId);
      if (myReq !== reqRef.current) return;

      const list = Array.isArray(data)
        ? data
        : data?.data || data?.branches || [];

      setBranches(list);

      if (!branchId && list.length) {
        setBranchId(String(list[0].id));
      }
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudieron cargar sucursales"));
    } finally {
      if (myReq !== reqRef.current) return;
      setLoadingBranches(false);
    }
  };

  const loadTable = async (bId) => {
    if (!bId) return;

    const myReq = ++reqRef.current;
    setErr("");
    setLoadingTable(true);

    try {
      const data = await getVariantChannels(
        restaurantId,
        productId,
        variant.id,
        Number(bId)
      );

      if (myReq !== reqRef.current) return;

      setTable(data);
      setRows(data?.data || []);
      setDraft({});
    } catch (e) {
      if (myReq !== reqRef.current) return;
      setErr(normalizeErr(e, "No se pudo cargar configuración por canal"));
      setTable(null);
      setRows([]);
      setDraft({});
    } finally {
      if (myReq !== reqRef.current) return;
      setLoadingTable(false);
      setTableReady(true);
    }
  };

  useEffect(() => {
    if (!open) return;

    setErr("");
    setBranches([]);
    setBranchId("");
    setTable(null);
    setRows([]);
    setDraft({});
    setSaving(false);
    setTableReady(false);

    loadBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, restaurantId, productId, variant?.id]);

  useEffect(() => {
    if (!open || !branchId) return;
    loadTable(branchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, branchId]);

  const resolvedRow = (r) => {
    const bscId = r.branch_sales_channel_id;
    const d = draft[bscId];

    const base = r.base;
    const ovr = r.override;

    let visible = r.visible;
    let price = r.price;
    let origin = r.origin;

    if (d) {
      if (d.mode === "remove") {
        if (r.branch_is_active) {
          if (base) {
            visible = !!base.is_enabled;
            price = base.is_enabled ? Number(base.price) : null;
            origin = "product";
          } else {
            visible = false;
            price = null;
            origin = null;
          }
        } else {
          visible = false;
          price = null;
          origin = null;
        }
      } else {
        visible = !!d.is_enabled;
        price = visible ? (d.price === "" ? "" : Number(d.price)) : null;
        origin = "variant";
      }
    }

    const channelDisabled = !r.branch_is_active;
    const rowLocked = variantDisabled || channelDisabled;

    return {
      ...r,
      _base: base,
      _override: ovr,
      _draft: d || null,
      ui_visible: visible,
      ui_price: price,
      ui_origin: origin,
      ui_channelDisabled: channelDisabled,
      ui_rowLocked: rowLocked,
    };
  };

  const mergedRows = useMemo(() => {
    return rows.map(resolvedRow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, draft, variantDisabled]);

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
    items: mergedRows,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const onChangeVisible = (bscId, next) => {
    setErr("");

    setDraft((prev) => {
      const current = prev[bscId];
      const base = rows.find(
        (x) => x.branch_sales_channel_id === bscId
      )?.base;
      const suggestedPrice = base?.price ?? 0;

      return {
        ...prev,
        [bscId]: {
          mode: "set",
          is_enabled: !!next,
          price:
            current?.mode === "set"
              ? current.price
              : String(suggestedPrice),
        },
      };
    });
  };

  const onChangePrice = (bscId, nextPrice) => {
    setErr("");

    setDraft((prev) => {
      const current = prev[bscId];

      return {
        ...prev,
        [bscId]: {
          mode: "set",
          is_enabled:
            current?.mode === "set" ? !!current.is_enabled : true,
          price: nextPrice,
        },
      };
    });
  };

  const useProductFallback = (bscId) => {
    setErr("");
    setDraft((prev) => ({
      ...prev,
      [bscId]: { mode: "remove" },
    }));
  };

  const clearDraftRow = (bscId) => {
    setErr("");
    setDraft((prev) => {
      const cp = { ...prev };
      delete cp[bscId];
      return cp;
    });
  };

  const hasChanges = Object.keys(draft).length > 0;

  const buildItemsPayload = () => {
    const items = [];

    for (const [k, v] of Object.entries(draft)) {
      const bscId = Number(k);

      if (v.mode === "remove") {
        items.push({
          branch_sales_channel_id: bscId,
          mode: "remove",
        });
        continue;
      }

      const rawPrice = v.price;

      if (rawPrice === "" || rawPrice == null) {
        throw new Error(
          `Falta precio para branch_sales_channel_id=${bscId}`
        );
      }

      const num = Number(rawPrice);
      if (!Number.isFinite(num) || num < 0) {
        throw new Error(
          `Precio inválido para branch_sales_channel_id=${bscId}`
        );
      }

      items.push({
        branch_sales_channel_id: bscId,
        mode: "set",
        is_enabled: !!v.is_enabled,
        price: num,
      });
    }

    return items;
  };

  const save = async () => {
    setErr("");

    if (!branchId) {
      setErr("Selecciona una sucursal.");
      return;
    }

    if (variantDisabled) {
      setErr(
        "La variante está inactiva. Actívala para configurar precios por canal."
      );
      return;
    }

    if (!hasChanges) return;

    const disabledTouched = mergedRows.some(
      (r) => r.ui_channelDisabled && draft[r.branch_sales_channel_id]
    );

    if (disabledTouched) {
      setErr(
        "Hay cambios en un canal apagado por sucursal. No se puede configurar ahí."
      );
      return;
    }

    let items;
    try {
      items = buildItemsPayload();
    } catch (e) {
      setErr(e.message || "Payload inválido");
      return;
    }

    setSaving(true);

    try {
      await upsertVariantChannels(
        restaurantId,
        productId,
        variant.id,
        items
      );

      showAlert({
        severity: "success",
        title: "Cambios guardados",
        message:
          "La configuración de precios por canal se actualizó correctamente.",
      });

      await loadTable(branchId);
    } catch (e) {
      setErr(normalizeErr(e, "No se pudo guardar configuración"));
    } finally {
      setSaving(false);
    }
  };

  const branchTabSx = {
    minHeight: 52,
    px: { xs: 2, sm: 2.5 },
    py: 1,
    fontSize: { xs: 14, sm: 16 },
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

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={saving || loadingTable ? undefined : close}
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
                Precios de variante por canal
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                {table?.product?.name || "Producto"} · {variant?.name || "Variante"}
              </Typography>
            </Box>

            <IconButton
              onClick={close}
              disabled={saving || loadingTable}
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

              {variantDisabled ? (
                <Alert
                  severity="warning"
                  sx={{
                    borderRadius: 1,
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
                      Variante inactiva
                    </Typography>
                    <Typography variant="body2">
                      Puedes revisar la configuración, pero no podrás cambiar
                      precios por canal hasta que la variante vuelva a estar activa.
                    </Typography>
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
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                    spacing={1.5}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: "text.primary",
                        }}
                      >
                        Sucursal
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontSize: 13,
                          color: "text.secondary",
                        }}
                      >
                        Selecciona la sucursal para editar el override de la variante
                        sobre los canales disponibles.
                      </Typography>
                    </Box>

                    <Chip
                      icon={<StorefrontOutlinedIcon />}
                      label={
                        loadingTable
                          ? "Cargando canales..."
                          : selectedBranchName || "Sin sucursal"
                      }
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

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
                        minHeight: 52,
                        "& .MuiTabs-flexContainer": {
                          gap: { xs: 1, sm: 2 },
                        },
                        "& .MuiTabs-scrollButtons": {
                          color: "text.secondary",
                        },
                      }}
                    >
                      {loadingBranches ? (
                        <Tab
                          value=""
                          disabled
                          label="Cargando..."
                          sx={branchTabSx}
                        />
                      ) : branches.length ? (
                        branches.map((b) => (
                          <Tab
                            key={b.id}
                            value={String(b.id)}
                            label={b.name || `Sucursal ${b.id}`}
                            disableRipple
                            sx={branchTabSx}
                          />
                        ))
                      ) : (
                        <Tab
                          value=""
                          disabled
                          label="Sin sucursales"
                          sx={branchTabSx}
                        />
                      )}
                    </Tabs>
                  </Box>
                </Stack>
              </Paper>

              {!tableReady || loadingTable ? (
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 0,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                    Cargando configuración por canal…
                  </Typography>
                </Paper>
              ) : total === 0 ? (
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 0,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "none",
                    textAlign: "center",
                  }}
                >
                  <PointOfSaleOutlinedIcon
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
                    No hay canales configurados
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.75,
                      fontSize: 14,
                      color: "text.secondary",
                    }}
                  >
                    Esta sucursal no tiene canales disponibles para esta variante.
                  </Typography>
                </Paper>
              ) : (
                <>
                  {!isMobile ? (
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
                      <Box sx={{ width: "100%", overflowX: "auto" }}>
                        <Box
                          component="table"
                          sx={{
                            width: "100%",
                            borderCollapse: "collapse",
                            minWidth: 980,
                          }}
                        >
                          <Box component="thead">
                            <Box
                              component="tr"
                              sx={{ backgroundColor: "#fafafa" }}
                            >
                              <TableHeadCell>Canal</TableHeadCell>
                              <TableHeadCell>Estado canal</TableHeadCell>
                              <TableHeadCell>Visible</TableHeadCell>
                              <TableHeadCell>Precio</TableHeadCell>
                              <TableHeadCell>Origen</TableHeadCell>
                              <TableHeadCell>Acciones</TableHeadCell>
                            </Box>
                          </Box>

                          <Box component="tbody">
                            {paginatedItems.map((r) => {
                              const bscId = r.branch_sales_channel_id;
                              const locked = r.ui_rowLocked || !canEditGlobal;
                              const hasDraft = !!r._draft;

                              return (
                                <Box component="tr" key={bscId}>
                                  <TableBodyCell>
                                    <Typography
                                      sx={{
                                        fontSize: 14,
                                        fontWeight: 800,
                                        color: "text.primary",
                                      }}
                                    >
                                      {r.sales_channel?.name}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        mt: 0.35,
                                        fontSize: 12,
                                        color: "text.secondary",
                                      }}
                                    >
                                      {r.sales_channel?.code} · bsc_id: {bscId}
                                    </Typography>
                                  </TableBodyCell>

                                  <TableBodyCell>
                                    <Chip
                                      size="small"
                                      label={
                                        r.branch_is_active ? "Activo" : "Apagado"
                                      }
                                      color={
                                        r.branch_is_active ? "success" : "default"
                                      }
                                      sx={{ fontWeight: 800 }}
                                    />
                                  </TableBodyCell>

                                  <TableBodyCell>
                                    <FormControlLabel
                                      sx={{
                                        m: 0,
                                        "& .MuiFormControlLabel-label": {
                                          minWidth: 0,
                                        },
                                      }}
                                      control={
                                        <Switch
                                          checked={!!r.ui_visible}
                                          disabled={locked}
                                          onChange={(e) =>
                                            onChangeVisible(
                                              bscId,
                                              e.target.checked
                                            )
                                          }
                                          color="primary"
                                        />
                                      }
                                      label={
                                        <Typography sx={switchLabelSx}>
                                          {r.ui_visible ? "Activo" : "Inactivo"}
                                        </Typography>
                                      }
                                    />
                                  </TableBodyCell>

                                  <TableBodyCell>
                                    <TextField
                                      value={
                                        r.ui_price == null ? "" : String(r.ui_price)
                                      }
                                      disabled={locked || !r.ui_visible}
                                      onChange={(e) =>
                                        onChangePrice(bscId, e.target.value)
                                      }
                                      placeholder="0.00"
                                      inputProps={{
                                        inputMode: "decimal",
                                      }}
                                      sx={{ maxWidth: 150 }}
                                    />

                                    <Typography
                                      sx={{
                                        mt: 0.75,
                                        fontSize: 12,
                                        color: "text.secondary",
                                      }}
                                    >
                                      Base: {r._base ? money(r._base.price) : "—"}
                                    </Typography>
                                  </TableBodyCell>

                                  <TableBodyCell>
                                    {r.ui_origin === "variant" ? (
                                      <Chip
                                        size="small"
                                        label="Variante"
                                        color="info"
                                        sx={{ fontWeight: 800 }}
                                      />
                                    ) : r.ui_origin === "product" ? (
                                      <Chip
                                        size="small"
                                        label="Producto"
                                        sx={{ fontWeight: 800 }}
                                      />
                                    ) : (
                                      <Typography
                                        sx={{
                                          fontSize: 13,
                                          color: "text.secondary",
                                        }}
                                      >
                                        —
                                      </Typography>
                                    )}
                                  </TableBodyCell>

                                  <TableBodyCell>
                                    <Stack direction="row" spacing={1}>
                                      <Button
                                        onClick={() => useProductFallback(bscId)}
                                        disabled={locked}
                                        variant="outlined"
                                        startIcon={<RestartAltIcon />}
                                        sx={{
                                          height: 40,
                                          borderRadius: 2,
                                          fontSize: 12,
                                          fontWeight: 800,
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Usar producto
                                      </Button>

                                      {hasDraft ? (
                                        <Button
                                          onClick={() => clearDraftRow(bscId)}
                                          disabled={locked}
                                          variant="outlined"
                                          sx={{
                                            height: 40,
                                            borderRadius: 2,
                                            fontSize: 12,
                                            fontWeight: 800,
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          Descartar
                                        </Button>
                                      ) : null}
                                    </Stack>
                                  </TableBodyCell>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
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
                        itemLabel="canales"
                      />
                    </Paper>
                  ) : (
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
                          p: 2,
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: 2,
                        }}
                      >
                        {paginatedItems.map((r) => {
                          const bscId = r.branch_sales_channel_id;
                          const locked = r.ui_rowLocked || !canEditGlobal;
                          const hasDraft = !!r._draft;

                          return (
                            <Card
                              key={bscId}
                              sx={{
                                borderRadius: 1,
                                boxShadow: "none",
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "#fff",
                              }}
                            >
                              <Box sx={{ p: 2 }}>
                                <Stack spacing={1.75}>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    spacing={1.5}
                                  >
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography
                                        sx={{
                                          fontSize: 18,
                                          fontWeight: 800,
                                          color: "text.primary",
                                          lineHeight: 1.25,
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {r.sales_channel?.name}
                                      </Typography>

                                      <Typography
                                        sx={{
                                          mt: 0.5,
                                          fontSize: 12,
                                          color: "text.secondary",
                                        }}
                                      >
                                        {r.sales_channel?.code} · bsc_id: {bscId}
                                      </Typography>
                                    </Box>

                                    <Chip
                                      size="small"
                                      label={
                                        r.branch_is_active ? "Activo" : "Apagado"
                                      }
                                      color={
                                        r.branch_is_active ? "success" : "default"
                                      }
                                      sx={{ fontWeight: 800 }}
                                    />
                                  </Stack>

                                  <Stack spacing={1}>
                                    <InfoRow
                                      label="Estado"
                                      value={
                                        <FormControlLabel
                                          sx={{
                                            m: 0,
                                            "& .MuiFormControlLabel-label": {
                                              minWidth: 0,
                                            },
                                          }}
                                          control={
                                            <Switch
                                              checked={!!r.ui_visible}
                                              disabled={locked}
                                              onChange={(e) =>
                                                onChangeVisible(
                                                  bscId,
                                                  e.target.checked
                                                )
                                              }
                                              color="primary"
                                            />
                                          }
                                          label={
                                            <Typography sx={switchLabelSx}>
                                              {r.ui_visible
                                                ? "Activo"
                                                : "Inactivo"}
                                            </Typography>
                                          }
                                        />
                                      }
                                    />

                                    <InfoRow
                                      label="Origen"
                                      value={
                                        r.ui_origin === "variant" ? (
                                          <Chip
                                            size="small"
                                            label="Variante"
                                            color="info"
                                            sx={{ fontWeight: 800 }}
                                          />
                                        ) : r.ui_origin === "product" ? (
                                          <Chip
                                            size="small"
                                            label="Producto"
                                            sx={{ fontWeight: 800 }}
                                          />
                                        ) : (
                                          "—"
                                        )
                                      }
                                    />

                                    <Box>
                                      <Typography sx={mobileLabelSx}>
                                        Precio
                                      </Typography>

                                      <TextField
                                        value={
                                          r.ui_price == null
                                            ? ""
                                            : String(r.ui_price)
                                        }
                                        disabled={locked || !r.ui_visible}
                                        onChange={(e) =>
                                          onChangePrice(bscId, e.target.value)
                                        }
                                        placeholder="0.00"
                                        inputProps={{
                                          inputMode: "decimal",
                                        }}
                                        sx={{ mt: 0.75 }}
                                      />

                                      <Typography
                                        sx={{
                                          mt: 0.75,
                                          fontSize: 12,
                                          color: "text.secondary",
                                        }}
                                      >
                                        Base: {r._base ? money(r._base.price) : "—"}
                                      </Typography>
                                    </Box>
                                  </Stack>

                                  <Box
                                    sx={{
                                      pt: 1,
                                      borderTop: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <Typography
                                      sx={{
                                        fontSize: 12,
                                        fontWeight: 800,
                                        color: "text.secondary",
                                        mb: 1,
                                        textTransform: "uppercase",
                                        letterSpacing: 0.35,
                                      }}
                                    >
                                      Acciones
                                    </Typography>

                                    <Stack
                                      direction={{ xs: "column", sm: "row" }}
                                      spacing={1}
                                    >
                                      <Button
                                        onClick={() => useProductFallback(bscId)}
                                        disabled={locked}
                                        variant="outlined"
                                        startIcon={<RestartAltIcon />}
                                        sx={{
                                          height: 40,
                                          borderRadius: 2,
                                          fontSize: 12,
                                          fontWeight: 800,
                                        }}
                                      >
                                        Usar producto
                                      </Button>

                                      {hasDraft ? (
                                        <Button
                                          onClick={() => clearDraftRow(bscId)}
                                          disabled={locked}
                                          variant="outlined"
                                          sx={{
                                            height: 40,
                                            borderRadius: 2,
                                            fontSize: 12,
                                            fontWeight: 800,
                                          }}
                                        >
                                          Descartar
                                        </Button>
                                      ) : null}
                                    </Stack>
                                  </Box>
                                </Stack>
                              </Box>
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
                        itemLabel="canales"
                      />
                    </Paper>
                  )}

                  <Stack
                    direction={{ xs: "column-reverse", sm: "row" }}
                    justifyContent="flex-end"
                    spacing={1.5}
                  >
                    <Button
                      type="button"
                      onClick={close}
                      disabled={saving}
                      variant="outlined"
                      sx={{
                        minWidth: { xs: "100%", sm: 150 },
                        height: 44,
                        borderRadius: 2,
                      }}
                    >
                      Cerrar
                    </Button>

                    <Button
                      type="button"
                      onClick={save}
                      disabled={
                        !canEditGlobal || !hasChanges || loadingTable || saving
                      }
                      variant="contained"
                      startIcon={<SaveIcon />}
                      sx={{
                        minWidth: { xs: "100%", sm: 200 },
                        height: 44,
                        borderRadius: 2,
                        fontWeight: 800,
                      }}
                    >
                      {saving ? "Guardando…" : "Guardar cambios"}
                    </Button>
                  </Stack>
                </>
              )}

              <Typography
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                  lineHeight: 1.5,
                }}
              >
                Regla: si existe override de variante se usa ese precio. Si no,
                se toma el precio heredado del producto por canal.
              </Typography>
            </Stack>
          </PageContainer>
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

function InfoRow({ label, value }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.5, sm: 1.25 }}
      alignItems={{ xs: "flex-start", sm: "center" }}
    >
      <Typography sx={mobileLabelSx}>{label}</Typography>

      {typeof value === "string" ? (
        <Typography sx={mobileValueSx}>{value}</Typography>
      ) : (
        value
      )}
    </Stack>
  );
}

function TableHeadCell({ children }) {
  return (
    <Box
      component="th"
      sx={{
        textAlign: "left",
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider",
        fontSize: 13,
        fontWeight: 800,
        color: "text.primary",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </Box>
  );
}

function TableBodyCell({ children }) {
  return (
    <Box
      component="td"
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "#f0f0f0",
        verticalAlign: "top",
      }}
    >
      {children}
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
  fontSize: 14,
  color: "text.primary",
  wordBreak: "break-word",
  lineHeight: 1.5,
};