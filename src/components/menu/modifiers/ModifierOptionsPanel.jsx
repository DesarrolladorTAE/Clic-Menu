import { useMemo, useState } from "react";
import {
  Box, Button, Card, Chip, FormControlLabel, IconButton, Paper, Stack, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import {
  createModifierOption,
  updateModifierOption,
  deleteModifierOption,
} from "../../../services/menu/modifiers/modifierOptions.service";

import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../../components/common/PaginationFooter";

import ModifierOptionUpsertModal from "./ModifierOptionUpsertModal";
import ModifierOptionConsumptionModal from "./ModifierOptionConsumptionModal";

const GROUP_PAGE_SIZE = 5;
const OPTION_PAGE_SIZE = 5;

export default function ModifierOptionsPanel({
  restaurantId,
  requiresBranch = false,
  effectiveBranchId = null,
  groups,
  options,
  getGroupLabel,
  onReload,
}) {
  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  const [savingMap, setSavingMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [consumptionModalOpen, setConsumptionModalOpen] = useState(false);
  const [consumptionEditing, setConsumptionEditing] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const showAlert = ({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  };

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const getBackendMessage = (e, fallback) => {
    const data = e?.response?.data;
    const errors = data?.errors && typeof data.errors === "object"
      ? Object.values(data.errors).flat().filter(Boolean)
      : [];

    if (errors[0]) return errors[0];

    switch (data?.code) {
      case "MODIFIER_INVENTORY_CONFIGURATION_REQUIRED_BEFORE_ACTIVATION":
        return "Configura primero el consumo físico de la opción y después actívala.";
      case "MODIFIER_EFFECT_NOT_ALLOWED_BY_PLAN":
        return "Tu plan actual no permite activar esta configuración de inventario.";
      default:
        return data?.message || fallback;
    }
  };

  const setSaving = (optionId, value) => {
    setSavingMap((prev) => ({ ...prev, [optionId]: value }));
  };

  const isSaving = (optionId) => !!savingMap[optionId];
  const canManage = !requiresBranch || !!effectiveBranchId;

  const groupedOptions = useMemo(() => {
    const optionsByGroup = new Map();

    (Array.isArray(options) ? options : []).forEach((option) => {
      const groupId = Number(option?.modifier_group_id);
      if (!optionsByGroup.has(groupId)) optionsByGroup.set(groupId, []);
      optionsByGroup.get(groupId).push(option);
    });

    return [...(Array.isArray(groups) ? groups : [])]
      .sort((a, b) => {
        const byOrder = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
        if (byOrder !== 0) return byOrder;
        return (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" });
      })
      .map((group) => {
        const groupOptions = [...(optionsByGroup.get(Number(group.id)) || [])].sort((a, b) => {
          const byOrder = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
          if (byOrder !== 0) return byOrder;
          return (a.name || "").localeCompare(b.name || "", "es", { sensitivity: "base" });
        });

        return {
          id: Number(group.id),
          name: group.name || `Grupo ${group.id}`,
          description: group.description || null,
          sortOrder: Number(group.sort_order ?? 0),
          isActive: !!group.is_active,
          options: groupOptions,
        };
      });
  }, [groups, options]);

  const {
    page: groupsPage,
    nextPage: nextGroupsPage,
    prevPage: prevGroupsPage,
    total: totalGroups,
    totalPages: totalGroupPages,
    startItem: startGroupItem,
    endItem: endGroupItem,
    hasPrev: hasPrevGroup,
    hasNext: hasNextGroup,
    paginatedItems: paginatedGroups,
  } = usePagination({
    items: groupedOptions,
    initialPage: 1,
    pageSize: GROUP_PAGE_SIZE,
    mode: "frontend",
  });

  const openCreate = () => {
    if (!canManage) {
      showAlert({
        severity: "warning",
        title: "Sucursal requerida",
        message: "Selecciona una sucursal para crear una opción.",
      });
      return;
    }

    if (!groups.length) {
      showAlert({
        severity: "warning",
        title: "Grupo requerido",
        message: "Primero crea un grupo para poder agregar opciones.",
      });
      return;
    }

    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const openConsumption = (row) => {
    setConsumptionEditing(row);
    setConsumptionModalOpen(true);
  };

  const buildPayload = (row, overrides = {}) => ({
    name: row.name,
    description: row.description || null,
    price: Number(row.price ?? 0),
    max_quantity_per_selection: Number(row.max_quantity_per_selection ?? 1),
    is_default: !!row.is_default,
    affects_total: row.affects_total === undefined ? true : !!row.affects_total,
    track_inventory: !!row.track_inventory,
    sort_order: Number(row.sort_order ?? 0),
    is_active: !!row.is_active,
    ...overrides,
  });

  const onToggleStatus = async (row) => {
    const optionId = row?.id;
    if (!optionId || isSaving(optionId)) return;

    setSaving(optionId, true);

    try {
      await updateModifierOption(
        restaurantId,
        row.modifier_group_id,
        optionId,
        buildPayload(row, { is_active: !row.is_active })
      );

      await onReload?.();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: row.is_active ? "Opción desactivada correctamente." : "Opción activada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getBackendMessage(e, "No se pudo cambiar el estado de la opción."),
      });
    } finally {
      setSaving(optionId, false);
    }
  };

  const onDelete = async (row) => {
    const optionId = row?.id;
    if (!optionId || isSaving(optionId)) return;

    const ok = window.confirm(`¿Eliminar la opción "${row.name}"?`);
    if (!ok) return;

    setSaving(optionId, true);

    try {
      await deleteModifierOption(restaurantId, row.modifier_group_id, optionId);
      await onReload?.();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Opción eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getBackendMessage(e, "No se pudo eliminar la opción."),
      });
    } finally {
      setSaving(optionId, false);
    }
  };

  return (
    <>
      <Paper
        sx={{
          p: 0,
          overflow: "hidden",
          borderRadius: 1,
          backgroundColor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "none",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.75,
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
              Lista de opciones
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary" }}>
              Las opciones se muestran dentro del grupo al que pertenecen.
            </Typography>
          </Box>

          <Button
            onClick={openCreate}
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!groups.length || !canManage}
            sx={{ minWidth: { xs: "100%", sm: 180 }, height: 42, fontWeight: 800 }}
          >
            Nueva opción
          </Button>
        </Box>

        {!groups.length ? (
          <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              Primero crea un grupo
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
              Las opciones deben pertenecer a un grupo antes de poder registrarse.
            </Typography>
          </Box>
        ) : (
          <>
            <Stack spacing={2.5} sx={{ p: 2 }}>
              {paginatedGroups.map((group) => (
                <ModifierOptionGroupBlock
                  key={group.id}
                  group={group}
                  useCards={useCards}
                  isSaving={isSaving}
                  onToggleStatus={onToggleStatus}
                  openEdit={openEdit}
                  openConsumption={openConsumption}
                  onDelete={onDelete}
                />
              ))}
            </Stack>

            <PaginationFooter
              page={groupsPage}
              totalPages={totalGroupPages}
              startItem={startGroupItem}
              endItem={endGroupItem}
              total={totalGroups}
              hasPrev={hasPrevGroup}
              hasNext={hasNextGroup}
              onPrev={prevGroupsPage}
              onNext={nextGroupsPage}
              itemLabel="grupos"
            />
          </>
        )}
      </Paper>

      <ModifierOptionUpsertModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        restaurantId={restaurantId}
        groups={groups}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);
          await onReload?.();
        }}
        api={{
          createModifierOption,
          updateModifierOption,
        }}
      />

      <ModifierOptionConsumptionModal
        open={consumptionModalOpen}
        onClose={() => {
          setConsumptionModalOpen(false);
          setConsumptionEditing(null);
        }}
        restaurantId={restaurantId}
        option={consumptionEditing}
        groupLabel={getGroupLabel(consumptionEditing?.modifier_group_id)}
        requiresBranch={requiresBranch}
        effectiveBranchId={effectiveBranchId}
        onSaved={async () => {
          await onReload?.();
        }}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={3000}
      />
    </>
  );
}

function ModifierOptionGroupBlock({
  group,
  useCards,
  isSaving,
  onToggleStatus,
  openEdit,
  openConsumption,
  onDelete,
}) {
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
    items: group.options,
    initialPage: 1,
    pageSize: OPTION_PAGE_SIZE,
    mode: "frontend",
  });

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1}
        sx={{ mb: 1, px: 0.25 }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: 15, sm: 16 },
              fontWeight: 700,
              color: "text.secondary",
              lineHeight: 1.3,
            }}
          >
            Grupo:{" "}
            <Box component="span" sx={{ fontWeight: 800, color: "#B85C38" }}>
              {group.name}
            </Box>
          </Typography>

          {group.description ? (
            <Typography sx={{ mt: 0.4, fontSize: 12, color: "text.secondary", lineHeight: 1.4 }}>
              {group.description}
            </Typography>
          ) : null}
        </Box>

        <Chip
          label={`${group.options.length} ${group.options.length === 1 ? "opción" : "opciones"}`}
          size="small"
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      <Box
        sx={{
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          backgroundColor: "background.paper",
        }}
      >
        {!group.options.length ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.secondary" }}>
              Este grupo todavía no tiene opciones.
            </Typography>
          </Box>
        ) : (
          <>
            {useCards ? (
              <Box
                sx={{
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 1.5,
                  alignItems: "stretch",
                }}
              >
                {paginatedItems.map((option) => (
                  <ModifierOptionCard
                    key={option.id}
                    option={option}
                    busy={isSaving(option.id)}
                    onToggleStatus={onToggleStatus}
                    openEdit={openEdit}
                    openConsumption={openConsumption}
                    onDelete={onDelete}
                  />
                ))}
              </Box>
            ) : (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 1050 }}>
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
                      <TableCell>Nombre</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell align="center">Máximo</TableCell>
                      <TableCell>Importe</TableCell>
                      <TableCell>Inventario</TableCell>
                      <TableCell align="center">Orden</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((option) => {
                      const active = !!option.is_active;
                      const busy = isSaving(option.id);

                      return (
                        <TableRow
                          key={option.id}
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
                          <TableCell sx={{ minWidth: 220, maxWidth: 300 }}>
                            <Stack spacing={0.4}>
                              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
                                <Typography
                                  sx={{
                                    fontWeight: 800,
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {option.name}
                                </Typography>

                                {option.is_default ? (
                                  <Chip label="Predeterminada" size="small" sx={{ fontWeight: 700 }} />
                                ) : null}
                              </Stack>

                              {option.description ? (
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "text.secondary",
                                    lineHeight: 1.4,
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {option.description}
                                </Typography>
                              ) : null}
                            </Stack>
                          </TableCell>

                          <TableCell>${Number(option.price ?? 0).toFixed(2)}</TableCell>
                          <TableCell align="center">{Number(option.max_quantity_per_selection ?? 1)}</TableCell>

                          <TableCell>
                            <Chip
                              label={option.affects_total === false ? "No se suma" : "Se suma al total"}
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={option.track_inventory ? "Controla inventario" : "Sin inventario"}
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>

                          <TableCell align="center">{option.sort_order ?? 0}</TableCell>

                          <TableCell align="center">
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={active}
                                  onChange={() => onToggleStatus(option)}
                                  disabled={busy}
                                  color="primary"
                                />
                              }
                              label={
                                <Typography sx={switchLabelSx}>
                                  {active ? "Activo" : "Inactivo"}
                                </Typography>
                              }
                            />
                          </TableCell>

                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                              <Tooltip title="Configurar consumo">
                                <span>
                                  <IconButton
                                    aria-label="Configurar consumo"
                                    onClick={() => openConsumption(option)}
                                    sx={iconConsumptionSx}
                                    disabled={busy}
                                  >
                                    <Inventory2OutlinedIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Editar">
                                <span>
                                  <IconButton
                                    aria-label="Editar opción"
                                    onClick={() => openEdit(option)}
                                    sx={iconEditSx}
                                    disabled={busy}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <span>
                                  <IconButton
                                    aria-label="Eliminar opción"
                                    onClick={() => onDelete(option)}
                                    sx={iconDeleteSx}
                                    disabled={busy}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
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
              itemLabel="opciones"
            />
          </>
        )}
      </Box>
    </Box>
  );
}

function ModifierOptionCard({
  option,
  busy,
  onToggleStatus,
  openEdit,
  openConsumption,
  onDelete,
}) {
  const active = !!option.is_active;

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        minHeight: 290,
        borderRadius: 1,
        boxShadow: "none",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Box sx={{ p: 2, height: "100%" }}>
        <Stack spacing={1.5} sx={{ height: "100%" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
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
                {option.name}
              </Typography>

              {option.description ? (
                <Typography
                  sx={{
                    mt: 0.5,
                    fontSize: 13,
                    color: "text.secondary",
                    lineHeight: 1.45,
                    wordBreak: "break-word",
                  }}
                >
                  {option.description}
                </Typography>
              ) : null}
            </Box>

            <Chip
              label={`Orden ${option.sort_order ?? 0}`}
              size="small"
              sx={{ flexShrink: 0, fontWeight: 800, bgcolor: "#FFF3E0", color: "#A75A00" }}
            />
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label={`$${Number(option.price ?? 0).toFixed(2)}`} size="small" sx={{ fontWeight: 700 }} />
            {option.is_default ? <Chip label="Predeterminada" size="small" sx={{ fontWeight: 700 }} /> : null}
            <Chip
              label={option.affects_total === false ? "No se suma al total" : "Se suma al total"}
              size="small"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={option.track_inventory ? "Controla inventario" : "Sin inventario"}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Box>
            <Typography sx={mobileLabelSx}>Cantidad máxima por selección</Typography>
            <Typography sx={mobileValueSx}>{Number(option.max_quantity_per_selection ?? 1)}</Typography>
          </Box>

          <Box
            sx={{
              mt: "auto",
              pt: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <FormControlLabel
              sx={{ m: 0 }}
              control={
                <Switch
                  checked={active}
                  onChange={() => onToggleStatus(option)}
                  disabled={busy}
                  color="primary"
                />
              }
              label={
                <Typography sx={switchLabelSx}>
                  {active ? "Activo" : "Inactivo"}
                </Typography>
              }
            />

            <Stack direction="row" spacing={1}>
              <Tooltip title="Configurar consumo">
                <span>
                  <IconButton
                    aria-label="Configurar consumo"
                    onClick={() => openConsumption(option)}
                    sx={iconConsumptionSx}
                    disabled={busy}
                  >
                    <Inventory2OutlinedIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Editar">
                <span>
                  <IconButton
                    aria-label="Editar opción"
                    onClick={() => openEdit(option)}
                    sx={iconEditSx}
                    disabled={busy}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Eliminar">
                <span>
                  <IconButton
                    aria-label="Eliminar opción"
                    onClick={() => onDelete(option)}
                    sx={iconDeleteSx}
                    disabled={busy}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Card>
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
  fontWeight: 700,
  color: "text.primary",
};

const iconConsumptionSx = {
  width: 40,
  height: 40,
  bgcolor: "#1E5AA8",
  color: "#fff",
  "&:hover": {
    bgcolor: "#184B8B",
  },
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
  },
};

const iconEditSx = {
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  "&:hover": {
    bgcolor: "#C9AA39",
  },
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
  },
};

const iconDeleteSx = {
  width: 40,
  height: 40,
  bgcolor: "error.main",
  color: "#fff",
  "&:hover": {
    bgcolor: "error.dark",
  },
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
  },
};