import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Tooltip,
  Typography,
  IconButton,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import SyncRoundedIcon from "@mui/icons-material/SyncRounded";
import CallSplitRoundedIcon from "@mui/icons-material/CallSplitRounded";

import { getRestaurantSubscriptionStatus } from "../../services/restaurant/restaurant.service";
import { getRestaurantSettings } from "../../services/restaurant/restaurantSettings.service";
import {
  getBranch,
  getBranchesByRestaurant,
} from "../../services/restaurant/branch.service";
import {
  getBranchSalesChannels,
  upsertBranchSalesChannel,
} from "../../services/restaurant/branchSalesChannels.service";

import usePagination from "../../hooks/usePagination";
import PaginationFooter from "../../components/common/PaginationFooter";

export default function BranchSalesChannelsPage() {
  const nav = useNavigate();
  const { restaurantId, branchId } = useParams();
  const location = useLocation();
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [savingMap, setSavingMap] = useState({});
  const [branchName, setBranchName] = useState("");
  const [mode, setMode] = useState("global");
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);

  const effectiveRestaurantId = Number(restaurantId);
  const effectiveBranchId = Number(branchId);

  const setSaving = (salesChannelId, v) =>
    setSavingMap((prev) => ({ ...prev, [salesChannelId]: v }));

  const isSaving = (salesChannelId) => !!savingMap[salesChannelId];

  const title = useMemo(() => {
    return "Canales de venta por sucursal";
  }, []);

  const selectedBranch = useMemo(() => {
    return (
      branches.find((b) => Number(b?.id) === effectiveBranchId) || null
    );
  }, [branches, effectiveBranchId]);

  const load = async ({ silent = false } = {}) => {
    setErr("");
    if (!silent) setLoading(true);

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

      try {
        const [branchList, branchData, channelsList] = await Promise.all([
          getBranchesByRestaurant(effectiveRestaurantId),
          getBranch(effectiveRestaurantId, effectiveBranchId),
          getBranchSalesChannels(effectiveRestaurantId, effectiveBranchId),
        ]);

        setBranches(Array.isArray(branchList) ? branchList : []);
        setBranchName(branchData?.name || "");
        setRows(Array.isArray(channelsList) ? channelsList : []);
      } catch {
        try {
          const branchList = await getBranchesByRestaurant(effectiveRestaurantId);
          setBranches(Array.isArray(branchList) ? branchList : []);
        } catch {
          setBranches([]);
        }

        try {
          const b = await getBranch(effectiveRestaurantId, effectiveBranchId);
          setBranchName(b?.name || "");
        } catch {
          setBranchName("");
        }

        const list = await getBranchSalesChannels(
          effectiveRestaurantId,
          effectiveBranchId
        );
        setRows(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      setErr(
        e?.response?.data?.message || "No se pudieron cargar los canales de venta"
      );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, branchId]);

  const orderedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ea = a?.branch?.effective_is_active ? 1 : 0;
      const eb = b?.branch?.effective_is_active ? 1 : 0;
      if (ea !== eb) return eb - ea;

      return (a?.sales_channel?.name || "").localeCompare(
        b?.sales_channel?.name || ""
      );
    });
  }, [rows]);

  const {
    page,
    totalPages,
    startItem,
    endItem,
    total,
    hasPrev,
    hasNext,
    prevPage,
    nextPage,
    paginatedItems,
  } = usePagination({
    items: orderedRows,
    pageSize: 5,
    initialPage: 1,
    mode: "frontend",
  });

  const onToggle = async (row) => {
    const ch = row?.sales_channel;
    const br = row?.branch;

    const salesChannelId = ch?.id;
    if (!salesChannelId) return;

    setErr("");
    if (isSaving(salesChannelId)) return;

    if (ch?.status !== "active") {
      setErr("Este canal está INACTIVO a nivel restaurante. Actívalo primero.");
      return;
    }

    const prev = !!br?.is_active;
    const next = !prev;

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
        effectiveBranchId,
        salesChannelId,
        next
      );

      const list = await getBranchSalesChannels(
        effectiveRestaurantId,
        effectiveBranchId
      );
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "No se pudo actualizar el canal en esta sucursal"
      );
      await load({ silent: true });
    } finally {
      setSaving(salesChannelId, false);
    }
  };

  const onConfig = (row) => {
    const ch = row?.sales_channel;
    const br = row?.branch;

    const salesChannelId = ch?.id;
    if (!salesChannelId) return;

    if (br?.effective_is_active !== true) {
      setErr("Activa este canal en la sucursal antes de configurar productos.");
      return;
    }

    nav(
      `/owner/restaurants/${effectiveRestaurantId}/branches/${effectiveBranchId}/sales-channels/${salesChannelId}/products`,
      {
        state: {
          sales_channel: ch,
          branch_name: branchName,
          products_mode: mode,
          restaurantName: location.state?.restaurantName,
        },
      }
    );
  };

  const handleBack = () => {
    nav(`/owner/restaurants/${effectiveRestaurantId}/branches`, {
      state: { restaurantName: location.state?.restaurantName },
    });
  };

  const handleBranchChange = (_, nextBranch) => {
    if (!nextBranch?.id) return;
    if (Number(nextBranch.id) === effectiveBranchId) return;

    nav(
      `/owner/restaurants/${effectiveRestaurantId}/branches/${nextBranch.id}/sales-channels`,
      {
        state: {
          ...location.state,
          branch_name: nextBranch.name,
          products_mode: mode,
        },
      }
    );
  };

  const branchLabel = branchName?.trim()
    ? branchName.trim()
    : `Sucursal ${effectiveBranchId}`;

  const renderStatusChip = (isRestaurantActive) => {
    return isRestaurantActive ? (
      <Chip
        icon={<CheckCircleRoundedIcon />}
        label="Activo"
        size="small"
        color="success"
        variant="outlined"
      />
    ) : (
      <Chip
        icon={<CancelRoundedIcon />}
        label="Inactivo"
        size="small"
        color="default"
        variant="outlined"
      />
    );
  };

  const renderLoading = () => (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Skeleton variant="rounded" height={120} />
      <Skeleton variant="rounded" height={100} sx={{ mt: 2 }} />
      <Skeleton variant="rounded" height={420} sx={{ mt: 2 }} />
    </Box>
  );

  if (loading) return renderLoading();

  return (
    <Box
      sx={{
        maxWidth: 1100,
        mx: "auto",
        px: { xs: 2, sm: 2.5, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 1,
          borderWidth: 1,
          backgroundColor: "background.paper",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "flex-start" }}
          spacing={2}
        >
          <Stack spacing={1.2} sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Chip
                icon={<StorefrontRoundedIcon />}
                label={`Restaurante ${effectiveRestaurantId}`}
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<ApartmentRoundedIcon />}
                label={branchLabel}
                variant="outlined"
                size="small"
              />
            </Stack>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                  fontSize: { xs: 24, sm: 28 },
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.8,
                  color: "text.secondary",
                  fontSize: 14,
                  maxWidth: 760,
                }}
              >
                Selecciona la sucursal que deseas administrar y activa o desactiva
                sus canales de venta. La configuración de productos se realiza en
                la siguiente pantalla.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={handleBack}
              sx={{
                borderRadius: 1,
                borderWidth: 1,
              }}
            >
              Volver
            </Button>
          </Stack>
        </Stack>

        <Paper
          variant="outlined"
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 1,
            borderWidth: 1,
            backgroundColor: alpha(theme.palette.primary.main, 0.03),
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <Stack spacing={0.6} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CallSplitRoundedIcon color="primary" fontSize="small" />
                <Typography sx={{ fontWeight: 800, fontSize: 15 }}>
                  Seleccionar sucursal
                </Typography>
              </Stack>

              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Cambia rápidamente entre sucursales sin salir de esta pantalla.
              </Typography>
            </Stack>

            <Box sx={{ width: { xs: "100%", md: 360 } }}>
              <Autocomplete
                options={branches}
                value={selectedBranch}
                onChange={handleBranchChange}
                getOptionLabel={(option) => option?.name || `Sucursal ${option?.id || ""}`}
                isOptionEqualToValue={(option, value) =>
                  Number(option?.id) === Number(value?.id)
                }
                noOptionsText="No hay sucursales disponibles"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Sucursal"
                    placeholder="Selecciona una sucursal"
                  />
                )}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
          </Stack>
        </Paper>
      </Paper>

      {err ? (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            borderRadius: 1,
            border: "1px solid",
            borderColor: alpha(theme.palette.error.main, 0.22),
            alignItems: "flex-start",
          }}
        >
          {err}
        </Alert>
      ) : null}

      <Paper
        variant="outlined"
        sx={{
          mt: 2,
          overflow: "hidden",
          borderRadius: 1,
          borderWidth: 1,
          backgroundColor: "background.paper",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: 1.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                Canales disponibles
              </Typography>
              <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Mostrando {startItem} - {endItem} de {total} canales
              </Typography>
            </Box>

            <Chip
              label={branchLabel}
              size="small"
              variant="outlined"
              sx={{ borderRadius: 1 }}
            />
          </Stack>
        </Box>

        {paginatedItems.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Alert
              severity="info"
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: alpha(theme.palette.info.main, 0.2),
              }}
            >
              No hay canales para mostrar.
            </Alert>
          </Box>
        ) : (
          <>
            {!isTablet ? (
              <Box>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) 170px 180px",
                    gap: 2,
                    px: 2.5,
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: 14 }}>
                    Canal
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: 14, textAlign: "center" }}
                  >
                    Estado sucursal
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 800, fontSize: 14, textAlign: "right" }}
                  >
                    Acciones
                  </Typography>
                </Box>

                {paginatedItems.map((r) => {
                  const ch = r?.sales_channel;
                  const br = r?.branch;
                  const restaurantActive = ch?.status === "active";
                  const enabled = !!br?.effective_is_active;
                  const busy = isSaving(ch?.id);
                  const disabledSwitch = busy || !restaurantActive;

                  return (
                    <Box
                      key={ch?.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "minmax(0,1fr) 170px 180px",
                        gap: 2,
                        alignItems: "center",
                        px: 2.5,
                        py: 1.8,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 15,
                              minWidth: 0,
                            }}
                          >
                            {ch?.name || "Canal sin nombre"}
                          </Typography>

                          {renderStatusChip(restaurantActive)}

                          {busy ? (
                            <Chip
                              icon={<SyncRoundedIcon />}
                              label="Guardando..."
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          ) : null}
                        </Stack>

                        <Typography
                          sx={{
                            mt: 0.7,
                            color: "text.secondary",
                            fontSize: 13,
                          }}
                        >
                          Code:{" "}
                          <Box
                            component="span"
                            sx={{
                              fontFamily: "monospace",
                              fontWeight: 700,
                              color: "text.primary",
                            }}
                          >
                            {ch?.code || "—"}
                          </Box>
                        </Typography>

                        {!restaurantActive ? (
                          <Typography
                            sx={{
                              mt: 0.8,
                              color: "text.secondary",
                              fontSize: 12.5,
                            }}
                          >
                            Este canal está inactivo a nivel restaurante. No se
                            puede habilitar en sucursales.
                          </Typography>
                        ) : null}
                      </Box>

                      <Stack
                        direction="column"
                        alignItems="center"
                        justifyContent="center"
                        spacing={0.5}
                      >
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <Switch
                              checked={enabled}
                              disabled={disabledSwitch}
                              onChange={() => onToggle(r)}
                              color="success"
                            />
                          }
                          label=""
                        />

                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: enabled ? "success.main" : "text.secondary",
                          }}
                        >
                          {enabled ? "Activo" : "Inactivo"}
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="center"
                        spacing={1}
                      >
                        <Tooltip
                          title={
                            br?.effective_is_active === true
                              ? "Configurar productos"
                              : "Activa el canal primero"
                          }
                        >
                          <span>
                            <IconButton
                              onClick={() => onConfig(r)}
                              disabled={br?.effective_is_active !== true}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                width: 42,
                                height: 42,
                                color:
                                  br?.effective_is_active === true
                                    ? "primary.main"
                                    : "text.disabled",
                                backgroundColor:
                                  br?.effective_is_active === true
                                    ? alpha(theme.palette.primary.main, 0.06)
                                    : "transparent",
                              }}
                            >
                              <SettingsRoundedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ p: 1.5 }}>
                <Stack spacing={1.5}>
                  {paginatedItems.map((r) => {
                    const ch = r?.sales_channel;
                    const br = r?.branch;
                    const restaurantActive = ch?.status === "active";
                    const enabled = !!br?.effective_is_active;
                    const busy = isSaving(ch?.id);
                    const disabledSwitch = busy || !restaurantActive;

                    return (
                      <Card
                        key={ch?.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 1,
                          borderWidth: 1,
                          boxShadow: "none",
                        }}
                      >
                        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                          <Stack spacing={1.4}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Box sx={{ minWidth: 0 }}>
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: 15,
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {ch?.name || "Canal sin nombre"}
                                </Typography>

                                <Typography
                                  sx={{
                                    mt: 0.6,
                                    color: "text.secondary",
                                    fontSize: 12.5,
                                  }}
                                >
                                  Code:{" "}
                                  <Box
                                    component="span"
                                    sx={{
                                      fontFamily: "monospace",
                                      fontWeight: 700,
                                      color: "text.primary",
                                    }}
                                  >
                                    {ch?.code || "—"}
                                  </Box>
                                </Typography>
                              </Box>

                              <Tooltip
                                title={
                                  br?.effective_is_active === true
                                    ? "Configurar productos"
                                    : "Activa el canal primero"
                                }
                              >
                                <span>
                                  <IconButton
                                    onClick={() => onConfig(r)}
                                    disabled={br?.effective_is_active !== true}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      borderRadius: 1,
                                      width: 40,
                                      height: 40,
                                      color:
                                        br?.effective_is_active === true
                                          ? "primary.main"
                                          : "text.disabled",
                                      flexShrink: 0,
                                    }}
                                  >
                                    <SettingsRoundedIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              useFlexGap
                              alignItems="center"
                            >
                              {renderStatusChip(restaurantActive)}

                              <Chip
                                label={enabled ? "Activo en sucursal" : "Inactivo en sucursal"}
                                size="small"
                                color={enabled ? "success" : "default"}
                                variant="outlined"
                              />

                              {busy ? (
                                <Chip
                                  icon={<SyncRoundedIcon />}
                                  label="Guardando..."
                                  size="small"
                                  variant="outlined"
                                  sx={{ borderRadius: 1 }}
                                />
                              ) : null}
                            </Stack>

                            {!restaurantActive ? (
                              <Alert
                                severity="warning"
                                sx={{
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor: alpha(theme.palette.warning.main, 0.18),
                                  py: 0.5,
                                }}
                              >
                                Este canal está inactivo a nivel restaurante. No se
                                puede usar en sucursales.
                              </Alert>
                            ) : null}

                            <Divider />

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              spacing={2}
                            >
                              <Box>
                                <Typography
                                  sx={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                  }}
                                >
                                  Estado en esta sucursal
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: enabled
                                      ? "success.main"
                                      : "text.secondary",
                                    fontWeight: 700,
                                  }}
                                >
                                  {enabled ? "Activo" : "Inactivo"}
                                </Typography>
                              </Box>

                              <Switch
                                checked={enabled}
                                disabled={disabledSwitch}
                                onChange={() => onToggle(r)}
                                color="success"
                              />
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
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

      <Alert
        severity="info"
        sx={{
          mt: 2,
          borderRadius: 1,
          border: "1px solid",
          borderColor: alpha(theme.palette.info.main, 0.18),
        }}
      >
        Nota: Un canal <strong>Inactivo</strong> a nivel restaurante no puede
        activarse en sucursales.
      </Alert>
    </Box>
  );
}