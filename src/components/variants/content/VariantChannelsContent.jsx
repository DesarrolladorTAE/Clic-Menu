import { useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, Card, CircularProgress, FormControlLabel, Paper, Stack, Switch,
  Tab, Tabs, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import SaveIcon from "@mui/icons-material/Save";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";

import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  getVariantChannels,
  upsertVariantChannels,
} from "../../../services/products/variants/productVariantChannels.service";

import AppAlert from "../../common/AppAlert";
import PageContainer from "../../common/PageContainer";
import PaginationFooter from "../../common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";

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

function normalizeErr(error, fallback = "Ocurrió un error") {
  return (
    error?.response?.data?.message ||
    (error?.response?.data?.errors
      ? Object.values(error.response.data.errors).flat().join("\n")
      : "") ||
    fallback
  );
}

function variantTitle(productName, variant) {
  const product = String(productName || "").trim();
  const option = String(
    variant?.variant_name ||
    variant?.canonical_name ||
    variant?.stored_name ||
    ""
  ).trim();

  if (product && option) {
    return `${product} · ${option}`;
  }

  return variant?.display_name || variant?.name || product || "Variante";
}

export default function VariantChannelsContent({
  restaurantId,
  productId,
  productName,
  variant,
  onChanged,
}) {
  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  const branchReqRef = useRef(0);
  const tableReqRef = useRef(0);

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [rows, setRows] = useState([]);
  const [draft, setDraft] = useState({});
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingTable, setLoadingTable] = useState(false);
  const [tableReady, setTableReady] = useState(false);
  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "success",
    title: "",
    message: "",
  });

  const variantDisabled = !variant?.is_enabled;
  const canEdit = !variantDisabled;

  const showAlert = ({ severity = "success", title = "", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const selectedBranchName = useMemo(() => {
    return branches.find((branch) => String(branch.id) === String(branchId))?.name || "";
  }, [branches, branchId]);

  useEffect(() => {
    if (!restaurantId || !variant?.id) {
      return;
    }

    const requestId = ++branchReqRef.current;

    setBranches([]);
    setBranchId("");
    setRows([]);
    setDraft({});
    setTableReady(false);
    setLoadingBranches(true);

    (async () => {
      try {
        const response = await getBranchesByRestaurant(restaurantId);

        if (requestId !== branchReqRef.current) {
          return;
        }

        const list = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.branches)
          ? response.branches
          : [];

        setBranches(list);

        if (list.length > 0) {
          setBranchId(String(list[0].id));
        }
      } catch (error) {
        if (requestId !== branchReqRef.current) {
          return;
        }

        showAlert({
          severity: "error",
          title: "No se pudieron cargar las sucursales",
          message: normalizeErr(error, "Inténtalo nuevamente."),
        });
      } finally {
        if (requestId === branchReqRef.current) {
          setLoadingBranches(false);
        }
      }
    })();

    return () => {
      branchReqRef.current += 1;
      tableReqRef.current += 1;
    };
  }, [restaurantId, productId, variant?.id]);

  useEffect(() => {
    if (!restaurantId || !productId || !variant?.id || !branchId) {
      return;
    }

    const requestId = ++tableReqRef.current;

    setLoadingTable(true);
    setTableReady(false);
    setDraft({});

    (async () => {
      try {
        const response = await getVariantChannels(
          restaurantId,
          productId,
          variant.id,
          Number(branchId)
        );

        if (requestId !== tableReqRef.current) {
          return;
        }

        setRows(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        if (requestId !== tableReqRef.current) {
          return;
        }

        setRows([]);

        showAlert({
          severity: "error",
          title: "No se pudieron cargar los canales",
          message: normalizeErr(error, "Inténtalo nuevamente."),
        });
      } finally {
        if (requestId === tableReqRef.current) {
          setLoadingTable(false);
          setTableReady(true);
        }
      }
    })();
  }, [restaurantId, productId, variant?.id, branchId]);

  const resolvedRow = (row) => {
    const channelId = Number(row.branch_sales_channel_id);
    const change = draft[channelId];

    let visible = row.visible;
    let price = row.price;
    let origin = row.origin;

    if (change?.mode === "remove") {
      if (row.branch_is_active && row.base) {
        visible = Boolean(row.base.is_enabled);
        price = row.base.is_enabled ? Number(row.base.price) : null;
        origin = "product";
      } else {
        visible = false;
        price = null;
        origin = null;
      }
    }

    if (change?.mode === "set") {
      visible = Boolean(change.is_enabled);
      price = visible ? (change.price === "" ? "" : Number(change.price)) : null;
      origin = "variant";
    }

    return {
      ...row,
      ui_visible: visible,
      ui_price: price,
      ui_origin: origin,
      ui_locked: variantDisabled || !row.branch_is_active,
    };
  };

  const mergedRows = useMemo(
    () => rows.map(resolvedRow),
    [rows, draft, variantDisabled]
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
    items: mergedRows,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const onChangeVisible = (channelId, checked) => {
    setDraft((prev) => {
      const row = rows.find(
        (item) => Number(item.branch_sales_channel_id) === Number(channelId)
      );

      const current = prev[channelId];

      return {
        ...prev,
        [channelId]: {
          mode: "set",
          is_enabled: Boolean(checked),
          price: current?.mode === "set"
            ? current.price
            : String(row?.base?.price ?? row?.price ?? 0),
        },
      };
    });
  };

  const onChangePrice = (channelId, value) => {
    setDraft((prev) => {
      const current = prev[channelId];

      return {
        ...prev,
        [channelId]: {
          mode: "set",
          is_enabled: current?.mode === "set" ? Boolean(current.is_enabled) : true,
          price: value,
        },
      };
    });
  };

  const useProductPrice = (channelId) => {
    setDraft((prev) => ({
      ...prev,
      [channelId]: {
        mode: "remove",
      },
    }));
  };

  const hasChanges = Object.keys(draft).length > 0;

  const buildItemsPayload = () => {
    const items = [];

    for (const [key, change] of Object.entries(draft)) {
      const channelId = Number(key);
      const row = rows.find(
        (item) => Number(item.branch_sales_channel_id) === channelId
      );

      const channelName = row?.sales_channel?.name || "el canal seleccionado";

      if (change.mode === "remove") {
        items.push({
          branch_sales_channel_id: channelId,
          mode: "remove",
        });

        continue;
      }

      if (change.price === "" || change.price == null) {
        throw new Error(`Captura el precio de ${channelName}.`);
      }

      const price = Number(change.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error(`El precio de ${channelName} no es válido.`);
      }

      items.push({
        branch_sales_channel_id: channelId,
        mode: "set",
        is_enabled: Boolean(change.is_enabled),
        price,
      });
    }

    return items;
  };

  const applySavedChanges = () => {
    const updatedRows = rows.map((row) => {
      const channelId = Number(row.branch_sales_channel_id);
      const change = draft[channelId];

      if (!change) {
        return row;
      }

      if (change.mode === "remove") {
        const visible = Boolean(row.branch_is_active && row.base?.is_enabled);

        return {
          ...row,
          override: null,
          visible,
          price: visible ? Number(row.base.price) : null,
          origin: visible ? "product" : null,
        };
      }

      return {
        ...row,
        override: {
          branch_sales_channel_id: channelId,
          is_enabled: Boolean(change.is_enabled),
          price: Number(change.price),
        },
        visible: Boolean(change.is_enabled),
        price: change.is_enabled ? Number(change.price) : null,
        origin: "variant",
      };
    });

    setRows(updatedRows);
    setDraft({});

    onChanged?.({
      branch_id: Number(branchId),
      branch_name: selectedBranchName,
      channels: updatedRows,
    });
  };

  const save = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Selecciona una sucursal",
        message: "Elige la sucursal que deseas configurar.",
      });

      return;
    }

    if (variantDisabled) {
      showAlert({
        severity: "warning",
        title: "Variante inactiva",
        message: "Activa la variante antes de modificar sus precios por canal.",
      });

      return;
    }

    if (!hasChanges) {
      return;
    }

    const touchedInactiveChannel = rows.some((row) => {
      return !row.branch_is_active && Boolean(draft[Number(row.branch_sales_channel_id)]);
    });

    if (touchedInactiveChannel) {
      showAlert({
        severity: "error",
        title: "Hay un canal no disponible",
        message: "No se pueden guardar cambios en un canal desactivado para esta sucursal.",
      });

      return;
    }

    let items = [];

    try {
      items = buildItemsPayload();
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Revisa los precios",
        message: error?.message || "Hay información que necesita corrección.",
      });

      return;
    }

    setSaving(true);

    try {
      await upsertVariantChannels(restaurantId, productId, variant.id, items);
      applySavedChanges();

      showAlert({
        severity: "success",
        title: "Cambios guardados",
        message: "Los precios por canal se actualizaron correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "No se pudieron guardar los cambios",
        message: normalizeErr(error, "Inténtalo nuevamente."),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageContainer sx={{ py: 0, px: 0 }} innerSx={{ width: "100%" }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography sx={titleSx}>Precios por canal</Typography>

          <Typography sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
            {variantTitle(productName, variant)}
          </Typography>
        </Box>

        {variantDisabled ? (
          <Paper sx={warningSx}>
            <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
              Variante inactiva
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}>
              Puedes consultar los precios, pero debes activar la variante para modificarlos.
            </Typography>
          </Paper>
        ) : null}

        <Paper sx={containerSx}>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={1.5}
            >
              <Box>
                <Typography sx={sectionTitleSx}>Sucursal</Typography>

                <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                  Selecciona dónde deseas configurar el precio de esta variante.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <StorefrontOutlinedIcon color="primary" />

                <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                  {loadingBranches
                    ? "Cargando sucursales…"
                    : selectedBranchName || "Sin sucursal"}
                </Typography>
              </Stack>
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
                sx={{
                  minHeight: 52,
                  "& .MuiTabs-flexContainer": { gap: { xs: 0.5, sm: 1 } },
                  "& .MuiTabs-indicator": { height: 3 },
                }}
              >
                {loadingBranches ? (
                  <Tab value="" disabled label="Cargando…" sx={tabSx} />
                ) : branches.length > 0 ? (
                  branches.map((branch) => (
                    <Tab
                      key={branch.id}
                      value={String(branch.id)}
                      label={branch.name || `Sucursal ${branch.id}`}
                      sx={tabSx}
                    />
                  ))
                ) : (
                  <Tab value="" disabled label="Sin sucursales" sx={tabSx} />
                )}
              </Tabs>
            </Box>
          </Stack>
        </Paper>

        {!tableReady || loadingTable ? (
          <Paper sx={loadingSx}>
            <CircularProgress size={28} />

            <Typography sx={{ mt: 1.25, fontSize: 13, color: "text.secondary" }}>
              Cargando canales…
            </Typography>
          </Paper>
        ) : total === 0 ? (
          <Paper sx={loadingSx}>
            <PointOfSaleOutlinedIcon sx={{ fontSize: 38, color: "text.secondary" }} />

            <Typography sx={{ mt: 1, fontSize: 18, fontWeight: 800 }}>
              No hay canales disponibles
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
              Esta sucursal todavía no tiene canales configurados para este producto.
            </Typography>
          </Paper>
        ) : (
          <>
            {!useCards ? (
              <Paper sx={tableContainerSx}>
                <Box sx={{ width: "100%", overflowX: "auto" }}>
                  <Box
                    component="table"
                    sx={{
                      width: "100%",
                      minWidth: 780,
                      borderCollapse: "collapse",
                      tableLayout: "fixed",
                    }}
                  >
                    <Box component="thead">
                      <Box component="tr">
                        <TableHeadCell sx={{ width: "18%" }}>Canal</TableHeadCell>
                        <TableHeadCell sx={{ width: "18%" }}>Variante disponible</TableHeadCell>
                        <TableHeadCell sx={{ width: "18%" }}>Precio</TableHeadCell>
                        <TableHeadCell sx={{ width: "18%" }}>Precio aplicado</TableHeadCell>
                        <TableHeadCell sx={{ width: "28%" }}>Acciones</TableHeadCell>
                      </Box>
                    </Box>

                    <Box component="tbody">
                      {paginatedItems.map((row) => {
                        const channelId = Number(row.branch_sales_channel_id);

                        return (
                          <Box component="tr" key={channelId} sx={tableRowSx}>
                            <TableBodyCell>
                              <Typography sx={{ fontSize: 14, fontWeight: 800, lineHeight: 1.35 }}>
                                {row.sales_channel?.name || "Canal"}
                              </Typography>

                              <Typography
                                sx={{
                                  mt: 0.35,
                                  fontSize: 11.5,
                                  fontWeight: 800,
                                  lineHeight: 1.35,
                                  color: row.branch_is_active ? "success.main" : "error.main",
                                }}
                              >
                                {row.branch_is_active ? "Disponible" : "No disponible"}
                              </Typography>
                            </TableBodyCell>

                            <TableBodyCell>
                              <FormControlLabel
                                sx={{ m: 0 }}
                                control={
                                  <Switch
                                    checked={Boolean(row.ui_visible)}
                                    disabled={row.ui_locked || saving}
                                    onChange={(event) =>
                                      onChangeVisible(channelId, event.target.checked)
                                    }
                                  />
                                }
                                label={
                                  <Typography sx={switchLabelSx}>
                                    {row.ui_visible ? "Activa" : "Inactiva"}
                                  </Typography>
                                }
                              />
                            </TableBodyCell>

                            <TableBodyCell>
                              <TextField
                                value={row.ui_price == null ? "" : String(row.ui_price)}
                                disabled={row.ui_locked || !row.ui_visible || saving}
                                onChange={(event) => onChangePrice(channelId, event.target.value)}
                                placeholder="0.00"
                                inputProps={{ inputMode: "decimal" }}
                                sx={{ width: 140 }}
                              />

                              <Typography sx={{ mt: 0.6, fontSize: 11, color: "text.secondary" }}>
                                Producto: {row.base ? money(row.base.price) : "—"}
                              </Typography>
                            </TableBodyCell>

                            <TableBodyCell>
                              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                                {row.ui_origin === "variant"
                                  ? "Precio propio"
                                  : row.ui_origin === "product"
                                  ? "Precio del producto"
                                  : "Sin precio"}
                              </Typography>
                            </TableBodyCell>

                            <TableBodyCell>
                              <Button
                                variant="outlined"
                                disabled={row.ui_locked || saving}
                                onClick={() => useProductPrice(channelId)}
                                sx={{ whiteSpace: "nowrap", fontWeight: 800, px: 1.5 }}
                              >
                                Usar precio del producto
                              </Button>
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
              <Paper sx={tableContainerSx}>
                <Box
                  sx={{
                    p: 2,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                    gap: 1.5,
                  }}
                >
                  {paginatedItems.map((row) => {
                    const channelId = Number(row.branch_sales_channel_id);

                    return (
                      <Card
                        key={channelId}
                        sx={{
                          width: "100%",
                          minHeight: 300,
                          height: "100%",
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                          boxShadow: "none",
                          bgcolor: "background.paper",
                        }}
                      >
                        <Stack sx={{ height: "100%", p: 2 }} spacing={1.75}>
                          <Box>
                            <Typography sx={{ fontSize: 18, fontWeight: 800, wordBreak: "break-word" }}>
                              {row.sales_channel?.name || "Canal"}
                            </Typography>

                            <Typography
                              sx={{
                                mt: 0.4,
                                fontSize: 12,
                                fontWeight: 800,
                                color: row.branch_is_active ? "success.main" : "error.main",
                              }}
                            >
                              {row.branch_is_active ? "Disponible" : "No disponible"}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography sx={mobileLabelSx}>Variante disponible</Typography>

                            <FormControlLabel
                              sx={{ m: 0, mt: 0.4 }}
                              control={
                                <Switch
                                  checked={Boolean(row.ui_visible)}
                                  disabled={row.ui_locked || saving}
                                  onChange={(event) =>
                                    onChangeVisible(channelId, event.target.checked)
                                  }
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {row.ui_visible ? "Activa" : "Inactiva"}
                                </Typography>
                              }
                            />
                          </Box>

                          <Box>
                            <Typography sx={mobileLabelSx}>Precio</Typography>

                            <TextField
                              fullWidth
                              value={row.ui_price == null ? "" : String(row.ui_price)}
                              disabled={row.ui_locked || !row.ui_visible || saving}
                              onChange={(event) => onChangePrice(channelId, event.target.value)}
                              placeholder="0.00"
                              inputProps={{ inputMode: "decimal" }}
                              sx={{ mt: 0.7 }}
                            />

                            <Typography sx={{ mt: 0.6, fontSize: 11, color: "text.secondary" }}>
                              Precio del producto: {row.base ? money(row.base.price) : "—"}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography sx={mobileLabelSx}>Precio aplicado</Typography>

                            <Typography sx={{ mt: 0.4, fontSize: 14, fontWeight: 700 }}>
                              {row.ui_origin === "variant"
                                ? "Precio propio"
                                : row.ui_origin === "product"
                                ? "Precio del producto"
                                : "Sin precio"}
                            </Typography>
                          </Box>

                          <Stack spacing={1} sx={{ mt: "auto", pt: 1 }}>
                            <Button
                              fullWidth
                              variant="outlined"
                              disabled={row.ui_locked || saving}
                              onClick={() => useProductPrice(channelId)}
                              sx={{ fontWeight: 800 }}
                            >
                              Usar precio del producto
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
                  itemLabel="canales"
                />
              </Paper>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="flex-end" spacing={1.25}>
              <Button
                type="button"
                variant="contained"
                startIcon={saving ? <CircularProgress size={17} color="inherit" /> : <SaveIcon />}
                onClick={save}
                disabled={!canEdit || !hasChanges || saving || loadingTable}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  minWidth: { sm: 190 },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
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

function TableHeadCell({ children, sx = {} }) {
  return (
    <Box
      component="th"
      sx={{
        px: 2,
        py: 1.75,
        textAlign: "left",
        backgroundColor: "primary.main",
        borderBottom: "none",
        fontSize: 13,
        fontWeight: 800,
        color: "#fff",
        whiteSpace: "nowrap",
        ...sx,
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
        py: 1.6,
        verticalAlign: "middle",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      {children}
    </Box>
  );
}

const titleSx = {
  fontSize: { xs: 22, sm: 26 },
  fontWeight: 800,
  color: "text.primary",
  lineHeight: 1.25,
};

const sectionTitleSx = {
  fontSize: 17,
  fontWeight: 800,
  color: "text.primary",
};

const containerSx = {
  p: { xs: 2, sm: 2.5 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};

const warningSx = {
  p: 2,
  border: "1px solid",
  borderColor: "warning.main",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};

const loadingSx = {
  minHeight: 220,
  p: 3,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};

const tableContainerSx = {
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};

const tableRowSx = {
  backgroundColor: "background.paper",
  "&:hover": {
    backgroundColor: "action.hover",
  },
};

const tabSx = {
  minHeight: 52,
  px: { xs: 1.5, sm: 2.5 },
  fontSize: { xs: 13, sm: 14 },
  fontWeight: 800,
  textTransform: "none",
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