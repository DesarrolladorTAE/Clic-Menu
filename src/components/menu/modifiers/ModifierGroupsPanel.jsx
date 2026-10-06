import { useMemo, useState } from "react";

import {
  Box, Button, Card, Chip, FormControlLabel, IconButton, Paper, Stack, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import {
  createModifierGroup,
  updateModifierGroup,
  deleteModifierGroup,
} from "../../../services/menu/modifiers/modifierGroups.service";

import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../../components/common/PaginationFooter";

import ModifierGroupUpsertModal from "./ModifierGroupUpsertModal";

const PAGE_SIZE = 5;

export default function ModifierGroupsPanel({
  restaurantId,
  requiresBranch,
  effectiveBranchId,
  groups,
  onReload,
}) {
  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  const [savingMap, setSavingMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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

    return errors[0] || data?.message || fallback;
  };

  const setSaving = (groupId, value) => {
    setSavingMap((prev) => ({ ...prev, [groupId]: value }));
  };

  const isSaving = (groupId) => !!savingMap[groupId];

  const getAppliesToLabel = (value) => {
    switch (value) {
      case "product":
        return "Producto";
      case "variant":
        return "Variante";
      case "component":
        return "Componente";
      case "any":
        return "Cualquiera";
      default:
        return "Producto";
    }
  };

  const getSelectionModeLabel = (value) => {
    return value === "single" ? "Una opción" : "Múltiples opciones";
  };

  const getSelectionRangeLabel = (group) => {
    const min = Number(group?.min_select ?? 0);
    const max = group?.max_select === null || group?.max_select === undefined
      ? "Sin límite"
      : Number(group.max_select);

    return `Mínimo ${min} · Máximo ${max}`;
  };

  const sortedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
      const byOrder = Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0);
      if (byOrder !== 0) return byOrder;

      return (a.name || "").localeCompare(b.name || "", "es", {
        sensitivity: "base",
      });
    });
  }, [groups]);

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
    items: sortedGroups,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const canManage = !requiresBranch || !!effectiveBranchId;

  const openCreate = () => {
    if (!canManage) {
      showAlert({
        severity: "warning",
        title: "Sucursal requerida",
        message: "Selecciona una sucursal para crear un grupo.",
      });
      return;
    }

    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    if (!canManage) {
      showAlert({
        severity: "warning",
        title: "Sucursal requerida",
        message: "Selecciona una sucursal para editar el grupo.",
      });
      return;
    }

    setEditing(row);
    setModalOpen(true);
  };

  const onToggleStatus = async (row) => {
    const groupId = row?.id;
    if (!groupId || isSaving(groupId)) return;

    if (!canManage) {
      showAlert({
        severity: "warning",
        title: "Sucursal requerida",
        message: "Selecciona una sucursal para cambiar el estado.",
      });
      return;
    }

    setSaving(groupId, true);

    try {
      await updateModifierGroup(restaurantId, groupId, {
        branch_id: requiresBranch ? effectiveBranchId : null,
        name: row.name,
        description: row.description || null,
        selection_mode: row.selection_mode || "multiple",
        is_required: !!row.is_required,
        min_select: Number(row.min_select ?? 0),
        max_select: row.max_select === null || row.max_select === undefined ? null : Number(row.max_select),
        applies_to: row.applies_to || "product",
        sort_order: Number(row.sort_order ?? 0),
        is_active: !row.is_active,
      });

      await onReload?.();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: row.is_active
          ? "Grupo desactivado correctamente."
          : "Grupo activado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getBackendMessage(e, "No se pudo actualizar el grupo."),
      });
    } finally {
      setSaving(groupId, false);
    }
  };

  const onDelete = async (row) => {
    const groupId = row?.id;
    if (!groupId || isSaving(groupId)) return;

    const optionsCount = Array.isArray(row?.options) ? row.options.length : 0;

    if (optionsCount > 0) {
      showAlert({
        severity: "warning",
        title: "No disponible",
        message: "Elimina primero las opciones asociadas a este grupo.",
      });
      return;
    }

    const ok = window.confirm(`¿Eliminar el grupo "${row.name}"?`);
    if (!ok) return;

    setSaving(groupId, true);

    try {
      await deleteModifierGroup(restaurantId, groupId);
      await onReload?.();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Grupo eliminado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getBackendMessage(e, "No se pudo eliminar el grupo."),
      });
    } finally {
      setSaving(groupId, false);
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
              Lista de grupos
            </Typography>

            <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary" }}>
              Organiza cómo puede personalizarse cada producto, variante o componente.
            </Typography>
          </Box>

          <Button
            onClick={openCreate}
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!canManage}
            sx={{ minWidth: { xs: "100%", sm: 170 }, height: 42, fontWeight: 800 }}
          >
            Nuevo grupo
          </Button>
        </Box>

        {sortedGroups.length === 0 ? (
          <Box sx={{ px: 3, py: 5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              No hay grupos registrados
            </Typography>

            <Typography sx={{ mt: 1, color: "text.secondary", fontSize: 14 }}>
              Crea tu primer grupo para comenzar a organizar las opciones disponibles.
            </Typography>

            <Button
              onClick={openCreate}
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!canManage}
              sx={{ mt: 2.5, minWidth: 220, height: 44, fontWeight: 800 }}
            >
              Nuevo grupo
            </Button>
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
                {paginatedItems.map((g) => {
                  const active = !!g.is_active;
                  const busy = isSaving(g.id);
                  const optionsCount = Array.isArray(g.options) ? g.options.length : 0;
                  const hasOptions = optionsCount > 0;

                  return (
                    <Card
                      key={g.id}
                      sx={{
                        width: "100%",
                        height: "100%",
                        minHeight: 250,
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
                                {g.name}
                              </Typography>

                              {g.description ? (
                                <Typography
                                  sx={{
                                    mt: 0.5,
                                    fontSize: 13,
                                    color: "text.secondary",
                                    lineHeight: 1.45,
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {g.description}
                                </Typography>
                              ) : null}
                            </Box>

                            <Chip
                              label={`Orden ${g.sort_order ?? 0}`}
                              size="small"
                              sx={{ flexShrink: 0, fontWeight: 800, bgcolor: "#FFF3E0", color: "#A75A00" }}
                            />
                          </Stack>

                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            <Chip label={getSelectionModeLabel(g.selection_mode)} size="small" />
                            <Chip label={getAppliesToLabel(g.applies_to)} size="small" />
                            <Chip label={g.is_required ? "Obligatorio" : "Opcional"} size="small" />
                            <Chip label={`${optionsCount} ${optionsCount === 1 ? "opción" : "opciones"}`} size="small" />
                          </Stack>

                          <Box>
                            <Typography sx={mobileLabelSx}>Selección permitida</Typography>
                            <Typography sx={mobileValueSx}>{getSelectionRangeLabel(g)}</Typography>
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
                                  onChange={() => onToggleStatus(g)}
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
                              <Tooltip title="Editar">
                                <span>
                                  <IconButton onClick={() => openEdit(g)} sx={iconEditSx} disabled={busy}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip
                                title={
                                  hasOptions
                                    ? "Elimina primero las opciones asociadas."
                                    : "Eliminar"
                                }
                              >
                                <span>
                                  <IconButton
                                    onClick={() => onDelete(g)}
                                    sx={iconDeleteSx}
                                    disabled={busy || hasOptions}
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
                })}
              </Box>
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
                      <TableCell>Nombre</TableCell>
                      <TableCell>Modo</TableCell>
                      <TableCell>Aplica para</TableCell>
                      <TableCell>Selección</TableCell>
                      <TableCell align="center">Opciones</TableCell>
                      <TableCell align="center">Orden</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((g) => {
                      const active = !!g.is_active;
                      const busy = isSaving(g.id);
                      const optionsCount = Array.isArray(g.options) ? g.options.length : 0;
                      const hasOptions = optionsCount > 0;

                      return (
                        <TableRow
                          key={g.id}
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
                              <Typography sx={{ fontWeight: 800, whiteSpace: "normal", wordBreak: "break-word" }}>
                                {g.name}
                              </Typography>

                              {g.description ? (
                                <Typography
                                  sx={{
                                    fontSize: 12,
                                    color: "text.secondary",
                                    lineHeight: 1.4,
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                  }}
                                >
                                  {g.description}
                                </Typography>
                              ) : null}
                            </Stack>
                          </TableCell>

                          <TableCell>{getSelectionModeLabel(g.selection_mode)}</TableCell>
                          <TableCell>{getAppliesToLabel(g.applies_to)}</TableCell>

                          <TableCell>
                            <Stack spacing={0.2}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                                {g.is_required ? "Obligatorio" : "Opcional"}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                                {getSelectionRangeLabel(g)}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell align="center">{optionsCount}</TableCell>
                          <TableCell align="center">{g.sort_order ?? 0}</TableCell>

                          <TableCell align="center">
                            <FormControlLabel
                              sx={{ m: 0 }}
                              control={
                                <Switch
                                  checked={active}
                                  onChange={() => onToggleStatus(g)}
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
                              <Tooltip title="Editar">
                                <span>
                                  <IconButton onClick={() => openEdit(g)} sx={iconEditSx} disabled={busy}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>

                              <Tooltip
                                title={
                                  hasOptions
                                    ? "Elimina primero las opciones asociadas."
                                    : "Eliminar"
                                }
                              >
                                <span>
                                  <IconButton
                                    onClick={() => onDelete(g)}
                                    sx={iconDeleteSx}
                                    disabled={busy || hasOptions}
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
              itemLabel="grupos"
            />
          </>
        )}
      </Paper>

      <ModifierGroupUpsertModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        restaurantId={restaurantId}
        requiresBranch={requiresBranch}
        effectiveBranchId={effectiveBranchId}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);
          await onReload?.();
        }}
        api={{
          createModifierGroup,
          updateModifierGroup,
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
  width: 40,
  height: 40,
  bgcolor: "#E3C24A",
  color: "#fff",
  borderRadius: 1,
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
  borderRadius: 1,
  "&:hover": {
    bgcolor: "error.dark",
  },
  "&.Mui-disabled": {
    bgcolor: "#E0E0E0",
    color: "#9E9E9E",
  },
};