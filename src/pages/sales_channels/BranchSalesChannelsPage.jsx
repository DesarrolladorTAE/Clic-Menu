import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  Alert, Box, Button, Card, Chip, CircularProgress, FormControlLabel, Paper, Stack, Switch, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, MenuItem,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";
import SettingsIcon from "@mui/icons-material/Settings";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { getRestaurantSubscriptionStatus } from "../../services/restaurant/restaurant.service";
import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../services/restaurant/branch.service";

import {
  getBranchSalesChannels,
  upsertBranchSalesChannel,
} from "../../services/restaurant/branchSalesChannels.service";

import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";
import AppAlert from "../../components/common/AppAlert";

const PAGE_SIZE = 5;

export default function BranchSalesChannelsPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { restaurantId, branchId } = useParams();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const effectiveRestaurantId = Number(restaurantId);
  const initialBranchId = branchId ? Number(branchId) : null;

  const [loading, setLoading] = useState(true);
  const [loadingChannels, setLoadingChannels] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId || "");
  const [mode, setMode] = useState("global");

  const [rows, setRows] = useState([]);
  const [savingMap, setSavingMap] = useState({});

  const [search, setSearch] = useState("");
  const [onlyRestaurantActive, setOnlyRestaurantActive] = useState(false);
  const [onlyBranchEnabled, setOnlyBranchEnabled] = useState(false);

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

  const setSaving = (salesChannelId, value) => {
    setSavingMap((prev) => ({ ...prev, [salesChannelId]: value }));
  };

  const isSaving = (salesChannelId) => !!savingMap[salesChannelId];

  const selectedBranch = useMemo(() => {
    return branches.find((b) => Number(b.id) === Number(selectedBranchId)) || null;
  }, [branches, selectedBranchId]);

  const title = useMemo(() => {
    return "Canales de venta por sucursal";
  }, []);

  const subtitle = useMemo(() => {
    if (!selectedBranchId) {
      return "Selecciona una sucursal para activar o desactivar los canales que podrá utilizar.";
    }

    return `Administra los canales habilitados para ${selectedBranch?.name || `Sucursal ${selectedBranchId}`}.`;
  }, [selectedBranch, selectedBranchId]);

  const loadBase = async () => {
    setLoading(true);

    try {
      const st = await getRestaurantSubscriptionStatus(effectiveRestaurantId);

      if (st?.is_operational !== true) {
        nav(`/owner/restaurants/${effectiveRestaurantId}/plans`, {
          state: {
            notice: "Este restaurante está bloqueado. Contrata un plan para operar.",
            code: st?.code || "SUBSCRIPTION_REQUIRED",
          },
        });
        return;
      }

      let pm = location?.state?.products_mode;
      if (!pm) {
        const settings = await getRestaurantSettings(effectiveRestaurantId);
        pm = settings?.products_mode || "global";
      }
      setMode(pm);

      const branchList = await getBranchesByRestaurant(effectiveRestaurantId);
      const safeBranches = Array.isArray(branchList) ? branchList : [];
      setBranches(safeBranches);

      if (safeBranches.length === 0) {
        setSelectedBranchId("");
        setRows([]);
        return;
      }

      const requestedBranchId =
        initialBranchId && safeBranches.some((b) => Number(b.id) === Number(initialBranchId))
          ? Number(initialBranchId)
          : null;

      const firstBranchId = Number(safeBranches[0]?.id);

      setSelectedBranchId((prev) => {
        if (prev && safeBranches.some((b) => Number(b.id) === Number(prev))) {
          return Number(prev);
        }
        return requestedBranchId || firstBranchId;
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudieron cargar las sucursales del restaurante",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChannels = async (targetBranchId) => {
    if (!targetBranchId) {
      setRows([]);
      return;
    }

    setLoadingChannels(true);

    try {
      const list = await getBranchSalesChannels(
        effectiveRestaurantId,
        Number(targetBranchId)
      );
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudieron cargar los canales de venta",
      });
      setRows([]);
    } finally {
      setLoadingChannels(false);
    }
  };

  useEffect(() => {
    loadBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!selectedBranchId) return;
    loadChannels(selectedBranchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows
      .filter((r) => {
        const ch = r?.sales_channel;
        const br = r?.branch;

        if (onlyRestaurantActive && ch?.status !== "active") return false;
        if (onlyBranchEnabled && br?.effective_is_active !== true) return false;

        if (!q) return true;

        const name = (ch?.name || "").toLowerCase();
        const code = (ch?.code || "").toLowerCase();

        return name.includes(q) || code.includes(q);
      })
      .sort((a, b) => {
        const ea = a?.branch?.effective_is_active ? 1 : 0;
        const eb = b?.branch?.effective_is_active ? 1 : 0;

        if (ea !== eb) return eb - ea;

        return (a?.sales_channel?.name || "").localeCompare(
          b?.sales_channel?.name || ""
        );
      });
  }, [rows, search, onlyRestaurantActive, onlyBranchEnabled]);

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

  const onToggle = async (row) => {
    const ch = row?.sales_channel;
    const br = row?.branch;

    const salesChannelId = ch?.id;
    if (!salesChannelId || !selectedBranchId) return;

    if (isSaving(salesChannelId)) return;

    if (ch?.status !== "active") {
      showAlert({
        severity: "error",
        title: "Error",
        message: "Este canal está INACTIVO a nivel restaurante. Actívalo primero.",
      });
      return;
    }

    const prevBranch = {
      ...(br || {}),
    };

    const next = !prevBranch?.is_active;

    setRows((prevRows) =>
      prevRows.map((r) => {
        if (r?.sales_channel?.id !== salesChannelId) return r;

        return {
          ...r,
          branch: {
            ...(r.branch || {}),
            is_active: next,
            effective_is_active: next,
            blocked_by_channel_status: false,
          },
        };
      })
    );

    setSaving(salesChannelId, true);

    try {
      await upsertBranchSalesChannel(
        effectiveRestaurantId,
        Number(selectedBranchId),
        salesChannelId,
        next
      );
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo actualizar el canal en esta sucursal",
      });

      setRows((prevRows) =>
        prevRows.map((r) => {
          if (r?.sales_channel?.id !== salesChannelId) return r;

          return {
            ...r,
            branch: {
              ...(r.branch || {}),
              ...prevBranch,
            },
          };
        })
      );
    } finally {
      setSaving(salesChannelId, false);
    }
  };

  const onConfig = (row) => {
    const ch = row?.sales_channel;
    const br = row?.branch;

    const salesChannelId = ch?.id;
    if (!salesChannelId || !selectedBranchId) return;

    if (br?.effective_is_active !== true) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Activa este canal en la sucursal antes de configurar productos.",
      });
      return;
    }

    nav(
      `/owner/restaurants/${effectiveRestaurantId}/operation/branches/${selectedBranchId}/sales-channels/${salesChannelId}/products`,
      {
        state: {
          sales_channel: ch,
          branch_name: selectedBranch?.name || "",
          products_mode: mode,
        },
      }
    );
  };

  const handleBranchChange = (nextBranchId) => {
    setSelectedBranchId(nextBranchId ? Number(nextBranchId) : "");
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
            Cargando sucursales…
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
          {/* Header */}
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={1}
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
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "text.secondary",
                  fontSize: { xs: 15, md: 18 },
                }}
              >
                {subtitle}
              </Typography>
            </Box>

          </Stack>

          {/* Sin sucursales */}
          {branches.length === 0 ? (
            <Paper
              sx={{
                p: 0,
                overflow: "hidden",
                borderRadius: 0,
                backgroundColor: "background.paper",
              }}
            >
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
                  No hay sucursales registradas
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "text.secondary",
                    fontSize: 14,
                  }}
                >
                  Primero crea una sucursal para poder administrar sus canales de venta.
                </Typography>
              </Box>
            </Paper>
          ) : (
            <>
              {/* Filtros */}
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
                      <Typography sx={fieldLabelSx}>Sucursal</Typography>

                      <TextField
                        select
                        value={selectedBranchId}
                        onChange={(e) => handleBranchChange(e.target.value)}
                        fullWidth
                        SelectProps={{
                          IconComponent: KeyboardArrowDownIcon,
                        }}
                      >
                        {branches.map((b) => (
                          <MenuItem key={b.id} value={Number(b.id)}>
                            {b.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography sx={fieldLabelSx}>Buscar canal</Typography>

                      <TextField
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o code..."
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
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={{ xs: 0.5, sm: 2 }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={onlyRestaurantActive}
                            onChange={(e) => setOnlyRestaurantActive(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography sx={switchLabelSx}>
                            Solo canales activos del restaurante
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={onlyBranchEnabled}
                            onChange={(e) => setOnlyBranchEnabled(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography sx={switchLabelSx}>
                            Solo activos en la sucursal
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "text.secondary",
                        fontWeight: 700,
                      }}
                    >
                      Mostrando {filtered.length} de {rows.length} canales
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>

              {/* Contenido */}
              <Paper
                sx={{
                  p: 0,
                  overflow: "hidden",
                  borderRadius: 0,
                  backgroundColor: "background.paper",
                }}
              >
                {loadingChannels ? (
                  <Box
                    sx={{
                      minHeight: 240,
                      display: "grid",
                      placeItems: "center",
                      px: 2,
                    }}
                  >
                    <Stack spacing={2} alignItems="center">
                      <CircularProgress color="primary" />
                      <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
                        Cargando canales…
                      </Typography>
                    </Stack>
                  </Box>
                ) : filtered.length === 0 ? (
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
                      No hay canales para mostrar
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        color: "text.secondary",
                        fontSize: 14,
                      }}
                    >
                      Ajusta los filtros o selecciona otra sucursal para continuar.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {isMobile ? (
                      <Stack spacing={1.5} sx={{ p: 2 }}>
                        {paginatedItems.map((r) => {
                          const ch = r?.sales_channel;
                          const br = r?.branch;

                          const restaurantActive = ch?.status === "active";
                          const enabled = !!br?.effective_is_active;
                          const busy = isSaving(ch?.id);

                          return (
                            <Card
                              key={ch?.id}
                              sx={{
                                borderRadius: 1,
                                boxShadow: "none",
                                border: "1px solid",
                                borderColor: "divider",
                                backgroundColor: "#fff",
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
                                        {ch?.name || "Canal sin nombre"}
                                      </Typography>

                                      <Typography
                                        sx={{
                                          mt: 0.5,
                                          fontSize: 13,
                                          color: "text.secondary",
                                          fontFamily: "monospace",
                                          wordBreak: "break-word",
                                        }}
                                      >
                                        {ch?.code || "—"}
                                      </Typography>
                                    </Box>

                                    <Stack spacing={0.75} alignItems="flex-end">
                                      <Chip
                                        label={restaurantActive ? "ACTIVO" : "INACTIVO"}
                                        color={restaurantActive ? "success" : "default"}
                                        size="small"
                                        sx={{ fontWeight: 800 }}
                                      />

                                      <Chip
                                        label={enabled ? "HABILITADO" : "DESHABILITADO"}
                                        color={enabled ? "success" : "default"}
                                        size="small"
                                        sx={{
                                          fontWeight: 800,
                                          minWidth: 110,
                                        }}
                                      />
                                    </Stack>
                                  </Stack>

                                  {!restaurantActive && (
                                    <Alert
                                      severity="warning"
                                      sx={{
                                        borderRadius: 1,
                                        py: 0.5,
                                        alignItems: "center",
                                      }}
                                    >
                                      <Typography variant="body2">
                                        Este canal está inactivo a nivel restaurante.
                                      </Typography>
                                    </Alert>
                                  )}

                                  <Stack spacing={1}>
                                    <Box>
                                      <Typography sx={mobileLabelSx}>
                                        Estado en sucursal
                                      </Typography>

                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        sx={{ mt: 0.5 }}
                                      >
                                        {enabled ? (
                                          <CheckCircleIcon
                                            sx={{ fontSize: 18, color: "success.main" }}
                                          />
                                        ) : (
                                          <BlockIcon
                                            sx={{ fontSize: 18, color: "text.secondary" }}
                                          />
                                        )}

                                        <Typography sx={mobileValueSx}>
                                          {enabled ? "Activo para esta sucursal" : "No disponible en esta sucursal"}
                                        </Typography>

                                        {busy && (
                                          <CircularProgress size={16} color="primary" />
                                        )}
                                      </Stack>
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
                                              disabled={busy || !restaurantActive}
                                              onChange={() => onToggle(r)}
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

                                      <Button
                                        onClick={() => onConfig(r)}
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<SettingsIcon />}
                                        disabled={br?.effective_is_active !== true}
                                        fullWidth
                                        sx={{
                                          height: 42,
                                          fontSize: 13,
                                          fontWeight: 800,
                                          whiteSpace: "normal",
                                          textAlign: "center",
                                          lineHeight: 1.2,
                                          px: 1.75,
                                        }}
                                      >
                                        Configurar productos
                                      </Button>
                                    </Stack>
                                  </Stack>
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
                              <TableCell>Canal</TableCell>
                              <TableCell>Code</TableCell>
                              <TableCell>Estado restaurante</TableCell>
                              <TableCell>Estado sucursal</TableCell>
                              <TableCell align="center">Activo</TableCell>
                              <TableCell align="right">Acciones</TableCell>
                            </TableRow>
                          </TableHead>

                          <TableBody>
                            {paginatedItems.map((r) => {
                              const ch = r?.sales_channel;
                              const br = r?.branch;

                              const restaurantActive = ch?.status === "active";
                              const enabled = !!br?.effective_is_active;
                              const busy = isSaving(ch?.id);

                              return (
                                <TableRow
                                  key={ch?.id}
                                  hover
                                  sx={{
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
                                        {ch?.name || "Canal sin nombre"}
                                      </Typography>

                                      {!restaurantActive && (
                                        <Typography
                                          sx={{
                                            fontSize: 12,
                                            color: "text.secondary",
                                            whiteSpace: "normal",
                                          }}
                                        >
                                          Este canal está inactivo a nivel restaurante.
                                        </Typography>
                                      )}
                                    </Stack>
                                  </TableCell>

                                  <TableCell sx={{ fontFamily: "monospace", fontWeight: 700 }}>
                                    {ch?.code || "—"}
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label={restaurantActive ? "ACTIVO" : "INACTIVO"}
                                      color={restaurantActive ? "success" : "default"}
                                      size="small"
                                      sx={{
                                        fontWeight: 800,
                                        minWidth: 92,
                                      }}
                                    />
                                  </TableCell>

                                  <TableCell>
                                    <Chip
                                      label={enabled ? "HABILITADO" : "DESHABILITADO"}
                                      color={enabled ? "success" : "default"}
                                      size="small"
                                      sx={{
                                        fontWeight: 800,
                                        minWidth: 120,
                                      }}
                                    />
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
                                        disabled={busy || !restaurantActive}
                                        onChange={() => onToggle(r)}
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
                                      <Button
                                        onClick={() => onConfig(r)}
                                        variant="contained"
                                        color="secondary"
                                        startIcon={<SettingsIcon />}
                                        disabled={br?.effective_is_active !== true}
                                        sx={{
                                          height: 36,
                                          minWidth: 190,
                                          borderRadius: 2,
                                          fontSize: 12,
                                          fontWeight: 800,
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        Configurar productos
                                      </Button>
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
                      itemLabel="canales"
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
                Nota: Un canal <strong>Inactivo</strong> a nivel restaurante no puede activarse en sucursales.
              </Typography>
            </>
          )}
        </Stack>
      </Box>
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
  fontSize: 14,
  color: "text.primary",
  wordBreak: "break-word",
};