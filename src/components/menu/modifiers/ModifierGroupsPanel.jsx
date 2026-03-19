import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
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
  Tooltip,
  Typography,
  useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [savingMap, setSavingMap] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

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
    return value === "single" ? "Una opción" : "Múltiples";
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

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const onToggleStatus = async (row) => {
    const groupId = row?.id;
    if (!groupId || isSaving(groupId)) return;

    setSaving(groupId, true);

    try {
      await updateModifierGroup(restaurantId, groupId, {
        branch_id: requiresBranch ? effectiveBranchId : null,
        name: row.name,
        description: row.description || null,
        selection_mode: row.selection_mode || "multiple",
        is_required: !!row.is_required,
        min_select: Number(row.min_select ?? 0),
        max_select:
          row.max_select === null || row.max_select === undefined
            ? null
            : Number(row.max_select),
        applies_to: row.applies_to || "product",
        sort_order: Number(row.sort_order ?? 0),
        is_active: !row.is_active,
      });

      await onReload();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo actualizar el grupo de modificadores",
      });
    } finally {
      setSaving(groupId, false);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm("¿Eliminar este grupo?");
    if (!ok) return;

    try {
      await deleteModifierGroup(restaurantId, id);
      await onReload();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Grupo eliminado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo eliminar el grupo de modificadores",
      });
    }
  };

  return (
    <>
      <Paper
        sx={{
          p: 0,
          overflow: "hidden",
          borderRadius: 0,
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
          <Typography
            sx={{
              fontSize: 18,
              fontWeight: 800,
              color: "text.primary",
            }}
          >
            Lista de grupos
          </Typography>

          <Button
            onClick={openCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 170 },
              height: 42,
              borderRadius: 2,
              fontWeight: 800,
            }}
          >
            Nuevo grupo
          </Button>
        </Box>

        {sortedGroups.length === 0 ? (
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
              No hay grupos registrados
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              Crea tu primer grupo para empezar a organizar extras y variantes.
            </Typography>

            <Button
              onClick={openCreate}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                mt: 2.5,
                minWidth: 220,
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Nuevo grupo
            </Button>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                {paginatedItems.map((g) => {
                  const active = !!g.is_active;
                  const busy = isSaving(g.id);
                  const optionsCount = Array.isArray(g.options)
                    ? g.options.length
                    : 0;

                  return (
                    <Card
                      key={g.id}
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
                                {g.name}
                              </Typography>

                              {g.description ? (
                                <Typography
                                  sx={{
                                    mt: 0.5,
                                    fontSize: 13,
                                    color: "text.secondary",
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
                              sx={{
                                fontWeight: 800,
                                bgcolor: "#FFF3E0",
                                color: "#A75A00",
                              }}
                            />
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                              label={getSelectionModeLabel(g.selection_mode)}
                              size="small"
                            />
                            <Chip
                              label={getAppliesToLabel(g.applies_to)}
                              size="small"
                            />
                            <Chip
                              label={g.is_required ? "Obligatorio" : "Opcional"}
                              size="small"
                            />
                            <Chip
                              label={`${optionsCount} opción${
                                optionsCount === 1 ? "" : "es"
                              }`}
                              size="small"
                            />
                          </Stack>

                          <Box>
                            <Typography sx={mobileLabelSx}>Selección</Typography>
                            <Typography sx={mobileValueSx}>
                              Min: {Number(g.min_select ?? 0)} | Max:{" "}
                              {g.max_select === null || g.max_select === undefined
                                ? "Sin límite"
                                : Number(g.max_select)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
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
                                <IconButton
                                  onClick={() => openEdit(g)}
                                  sx={iconEditSx}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => onDelete(g.id)}
                                  sx={iconDeleteSx}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Box>
                        </Stack>
                      </Box>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 1180 }}>
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
                      <TableCell>Descripción</TableCell>
                      <TableCell>Modo</TableCell>
                      <TableCell>Aplica para</TableCell>
                      <TableCell>Selección</TableCell>
                      <TableCell>Opciones</TableCell>
                      <TableCell>Orden</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((g) => {
                      const active = !!g.is_active;
                      const busy = isSaving(g.id);
                      const optionsCount = Array.isArray(g.options)
                        ? g.options.length
                        : 0;

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
                          <TableCell>
                            <Typography sx={{ fontWeight: 800 }}>
                              {g.name}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              whiteSpace: "normal !important",
                              minWidth: 260,
                            }}
                          >
                            {g.description || "—"}
                          </TableCell>

                          <TableCell>
                            {getSelectionModeLabel(g.selection_mode)}
                          </TableCell>

                          <TableCell>{getAppliesToLabel(g.applies_to)}</TableCell>

                          <TableCell>
                            Min: {Number(g.min_select ?? 0)} | Max:{" "}
                            {g.max_select === null || g.max_select === undefined
                              ? "Sin límite"
                              : Number(g.max_select)}
                          </TableCell>

                          <TableCell>{optionsCount}</TableCell>

                          <TableCell>{g.sort_order ?? 0}</TableCell>

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
                            <Stack
                              direction="row"
                              spacing={1}
                              justifyContent="flex-end"
                              alignItems="center"
                              flexWrap="nowrap"
                            >
                              <Tooltip title="Editar">
                                <IconButton
                                  onClick={() => openEdit(g)}
                                  sx={iconEditSx}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Eliminar">
                                <IconButton
                                  onClick={() => onDelete(g.id)}
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
              itemLabel="grupos"
            />
          </>
        )}
      </Paper>

      <ModifierGroupUpsertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        requiresBranch={requiresBranch}
        effectiveBranchId={effectiveBranchId}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);
          await onReload();
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
        autoHideDuration={4000}
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
  borderRadius: 1.5,
  "&:hover": {
    bgcolor: "#C9AA39",
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