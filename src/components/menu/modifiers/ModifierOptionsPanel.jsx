import { Fragment, useMemo, useState } from "react";
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
  createModifierOption,
  updateModifierOption,
  deleteModifierOption,
} from "../../../services/menu/modifiers/modifierOptions.service";

import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../../components/common/PaginationFooter";

import ModifierOptionUpsertModal from "./ModifierOptionUpsertModal";

const PAGE_SIZE = 5;

export default function ModifierOptionsPanel({
  restaurantId,
  groups,
  options,
  getGroupLabel,
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

  const setSaving = (optionId, value) => {
    setSavingMap((prev) => ({ ...prev, [optionId]: value }));
  };

  const isSaving = (optionId) => !!savingMap[optionId];

  const sortedOptions = useMemo(() => {
    const groupOrderMap = {};
    const groupNameMap = {};

    groups.forEach((group) => {
      groupOrderMap[group.id] = Number(group.sort_order ?? 0);
      groupNameMap[group.id] = group.name || "";
    });

    return [...options].sort((a, b) => {
      const aGroupOrder = a.modifier_group_id
        ? Number(groupOrderMap[a.modifier_group_id] ?? 999999)
        : 999999;
      const bGroupOrder = b.modifier_group_id
        ? Number(groupOrderMap[b.modifier_group_id] ?? 999999)
        : 999999;

      if (aGroupOrder !== bGroupOrder) {
        return aGroupOrder - bGroupOrder;
      }

      const aGroupName = a.modifier_group_id
        ? groupNameMap[a.modifier_group_id] || ""
        : "Sin grupo";
      const bGroupName = b.modifier_group_id
        ? groupNameMap[b.modifier_group_id] || ""
        : "Sin grupo";

      const byGroupName = aGroupName.localeCompare(bGroupName, "es", {
        sensitivity: "base",
      });
      if (byGroupName !== 0) {
        return byGroupName;
      }

      const aOrder = Number(a.sort_order ?? 0);
      const bOrder = Number(b.sort_order ?? 0);

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return (a.name || "").localeCompare(b.name || "", "es", {
        sensitivity: "base",
      });
    });
  }, [groups, options]);

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
    items: sortedOptions,
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
    const optionId = row?.id;
    if (!optionId || isSaving(optionId)) return;

    setSaving(optionId, true);

    try {
      await updateModifierOption(
        restaurantId,
        row.modifier_group_id,
        optionId,
        {
          name: row.name,
          description: row.description || null,
          price: Number(row.price ?? 0),
          max_quantity_per_selection: Number(
            row.max_quantity_per_selection ?? 1
          ),
          is_default: !!row.is_default,
          affects_total:
            row.affects_total === undefined ? true : !!row.affects_total,
          track_inventory: !!row.track_inventory,
          sort_order: Number(row.sort_order ?? 0),
          is_active: !row.is_active,
        }
      );

      await onReload();
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo actualizar la opción de modificador",
      });
    } finally {
      setSaving(optionId, false);
    }
  };

  const onDelete = async (row) => {
    const ok = window.confirm("¿Eliminar esta opción?");
    if (!ok) return;

    try {
      await deleteModifierOption(
        restaurantId,
        row.modifier_group_id,
        row.id
      );

      await onReload();

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Opción eliminada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo eliminar la opción de modificador",
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
            Lista de opciones
          </Typography>

          <Button
            onClick={openCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              height: 42,
              borderRadius: 2,
              fontWeight: 800,
            }}
            disabled={groups.length === 0}
          >
            Nueva opción
          </Button>
        </Box>

        {sortedOptions.length === 0 ? (
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
              No hay opciones registradas
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: 14,
              }}
            >
              {groups.length === 0
                ? "Primero crea un grupo para después agregar opciones."
                : "Crea tu primera opción para completar tus modificadores."}
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
              disabled={groups.length === 0}
            >
              Nueva opción
            </Button>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <Stack spacing={1.5} sx={{ p: 2 }}>
                {paginatedItems.map((o, index) => {
                  const active = !!o.is_active;
                  const busy = isSaving(o.id);
                  const prev = paginatedItems[index - 1];
                  const groupChanged =
                    !prev || prev.modifier_group_id !== o.modifier_group_id;

                  return (
                    <Fragment key={o.id}>
                      {groupChanged && (
                        <Box
                          sx={{
                            px: 0.5,
                            pt: index === 0 ? 0 : 1,
                            pb: 0.25,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: "primary.main",
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                            }}
                          >
                            {getGroupLabel(o.modifier_group_id)}
                          </Typography>
                        </Box>
                      )}

                      <Card
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
                                  {o.name}
                                </Typography>

                                {o.description ? (
                                  <Typography
                                    sx={{
                                      mt: 0.5,
                                      fontSize: 13,
                                      color: "text.secondary",
                                      wordBreak: "break-word",
                                    }}
                                  >
                                    {o.description}
                                  </Typography>
                                ) : null}
                              </Box>

                              <Chip
                                label={`Orden ${o.sort_order ?? 0}`}
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
                                label={`$${Number(o.price ?? 0).toFixed(2)}`}
                                size="small"
                              />
                              <Chip
                                label={
                                  o.is_default ? "Predeterminada" : "Normal"
                                }
                                size="small"
                              />
                              <Chip
                                label={
                                  o.affects_total
                                    ? "Afecta total"
                                    : "Sin costo"
                                }
                                size="small"
                              />
                            </Stack>

                            <Box>
                              <Typography sx={mobileLabelSx}>Grupo</Typography>
                              <Typography sx={mobileValueSx}>
                                {getGroupLabel(o.modifier_group_id)}
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
                                    onChange={() => onToggleStatus(o)}
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
                                    onClick={() => openEdit(o)}
                                    sx={iconEditSx}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Eliminar">
                                  <IconButton
                                    onClick={() => onDelete(o)}
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
                    </Fragment>
                  );
                })}
              </Stack>
            ) : (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 1100 }}>
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
                      <TableCell>Grupo</TableCell>
                      <TableCell>Precio</TableCell>
                      <TableCell>Cantidad máx.</TableCell>
                      <TableCell>Orden</TableCell>
                      <TableCell align="center">Estado</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedItems.map((o, index) => {
                      const active = !!o.is_active;
                      const busy = isSaving(o.id);
                      const prev = paginatedItems[index - 1];
                      const groupChanged =
                        !prev || prev.modifier_group_id !== o.modifier_group_id;

                      return (
                        <Fragment key={o.id}>
                          {groupChanged && (
                            <TableRow>
                              <TableCell
                                colSpan={8}
                                sx={{
                                  bgcolor: "#FFF7ED",
                                  color: "primary.main",
                                  fontWeight: 800,
                                  fontSize: 13,
                                  borderBottom: "1px solid",
                                  borderColor: "divider",
                                  textTransform: "uppercase",
                                  letterSpacing: 0.4,
                                }}
                              >
                                {getGroupLabel(o.modifier_group_id)}
                              </TableCell>
                            </TableRow>
                          )}

                          <TableRow
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
                                {o.name}
                              </Typography>
                            </TableCell>

                            <TableCell
                              sx={{
                                whiteSpace: "normal !important",
                                minWidth: 260,
                              }}
                            >
                              {o.description || "—"}
                            </TableCell>

                            <TableCell>
                              {getGroupLabel(o.modifier_group_id)}
                            </TableCell>

                            <TableCell>
                              ${Number(o.price ?? 0).toFixed(2)}
                            </TableCell>

                            <TableCell>
                              {Number(o.max_quantity_per_selection ?? 1)}
                            </TableCell>

                            <TableCell>{o.sort_order ?? 0}</TableCell>

                            <TableCell align="center">
                              <FormControlLabel
                                sx={{ m: 0 }}
                                control={
                                  <Switch
                                    checked={active}
                                    onChange={() => onToggleStatus(o)}
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
                                    onClick={() => openEdit(o)}
                                    sx={iconEditSx}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Eliminar">
                                  <IconButton
                                    onClick={() => onDelete(o)}
                                    sx={iconDeleteSx}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </Fragment>
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
      </Paper>

      <ModifierOptionUpsertModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        restaurantId={restaurantId}
        groups={groups}
        editing={editing}
        onSaved={async () => {
          setModalOpen(false);
          setEditing(null);
          await onReload();
        }}
        api={{
          createModifierOption,
          updateModifierOption,
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