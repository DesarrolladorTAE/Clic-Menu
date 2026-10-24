//tabs conjuntos
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Button, Chip, CircularProgress, FormControlLabel, IconButton,
  InputAdornment, Paper, Stack, Switch, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Tooltip, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import ChecklistOutlinedIcon from "@mui/icons-material/ChecklistOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import KeyboardArrowUpOutlinedIcon from "@mui/icons-material/KeyboardArrowUpOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

import ContextOverview from "../../../common/ContextOverview";
import PaginationFooter from "../../../common/PaginationFooter";
import usePagination from "../../../../hooks/usePagination";

import {
  getMenuSetAssignments,
  syncMenuSetAssignments,
} from "../../../../services/menu/menus/menuContent/menuSetAssignment.service";

import { getBackendMessage } from "./menuContent.helpers";

const PAGE_SIZE = 5;

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function normalizeIds(ids) {
  if (!Array.isArray(ids)) return [];

  return [...new Set(
    ids.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0)
  )];
}

function normalizeMenuSets(items) {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => Number(item.id) > 0).map((item) => ({
    ...item,
    id: Number(item.id),
    name: item.name || "Conjunto sin nombre",
    price: Number(item.price ?? 0),
    sort_order: Number(item.sort_order ?? 0),
    is_active: item.is_active === true || item.is_active === 1,
  }));
}

export default function MenuSetsTab({
  restaurantId,
  branchId,
  menuId,
  menu,
  onAlert,
}) {
  const theme = useTheme();
  const useCards = useMediaQuery(theme.breakpoints.down("md"));

  const [menuSets, setMenuSets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedOnly, setSelectedOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverMenuStatus, setServerMenuStatus] = useState(null);

  const savingRef = useRef(false);
  const onAlertRef = useRef(onAlert);

  const readOnly = menu?.is_archived === true
    || menu?.status === "archived"
    || serverMenuStatus === "archived";

  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    let active = true;

    const loadAssignments = async () => {
      setLoading(true);
      setLoadFailed(false);

      try {
        const result = await getMenuSetAssignments(restaurantId, branchId, menuId);

        if (!active) return;

        if (!result?.data || !Array.isArray(result.data.available_menu_sets)) {
          throw new Error("No se pudo recuperar la lista de Conjuntos de esta sucursal.");
        }

        const data = result.data;
        const ids = normalizeIds(data.menu_set_ids);

        setMenuSets(normalizeMenuSets(data.available_menu_sets));
        setSelectedIds(ids);
        setSavedIds(ids);
        setServerMenuStatus(data.menu_status || null);
      } catch (error) {
        if (!active) return;

        setMenuSets([]);
        setSelectedIds([]);
        setSavedIds([]);
        setLoadFailed(true);

        onAlertRef.current?.({
          severity: "error",
          title: "Error",
          message: getBackendMessage(error, "No se pudieron consultar los Conjuntos del menú."),
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadAssignments();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuId]);

  const selectedLookup = useMemo(() => new Set(selectedIds), [selectedIds]);

  const hasChanges = useMemo(() => {
    if (loading || loadFailed) return false;
    return JSON.stringify(selectedIds) !== JSON.stringify(savedIds);
  }, [selectedIds, savedIds, loading, loadFailed]);

  const orderedMenuSets = useMemo(() => {
    const selectedOrder = new Map(selectedIds.map((id, index) => [id, index]));

    return [...menuSets].sort((a, b) => {
      const aSelected = selectedOrder.has(a.id);
      const bSelected = selectedOrder.has(b.id);

      if (aSelected && bSelected) {
        return selectedOrder.get(a.id) - selectedOrder.get(b.id);
      }

      if (aSelected !== bSelected) return aSelected ? -1 : 1;

      return a.sort_order - b.sort_order
        || a.name.localeCompare(b.name, "es", { sensitivity: "base" })
        || a.id - b.id;
    });
  }, [menuSets, selectedIds]);

  const filteredMenuSets = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-MX");

    return orderedMenuSets.filter((item) => {
      if (selectedOnly && !selectedLookup.has(item.id)) return false;
      if (!term) return true;

      const content = `${item.name} ${item.billing_name || ""}`
        .toLocaleLowerCase("es-MX");

      return content.includes(term);
    });
  }, [orderedMenuSets, search, selectedOnly, selectedLookup]);

  const pagination = usePagination({
    items: filteredMenuSets,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
    resetKey: `${menuId}|${search}|${selectedOnly}`,
  });

  const contextItems = useMemo(() => [
    {
      key: "assigned",
      icon: <ChecklistOutlinedIcon fontSize="small" />,
      title: "Conjuntos seleccionados",
      value: String(selectedIds.length),
    },
    {
      key: "available",
      icon: <LayersOutlinedIcon fontSize="small" />,
      title: "Conjuntos de la sucursal",
      value: String(menuSets.length),
    },
  ], [selectedIds.length, menuSets.length]);

  const handleToggle = (menuSetId, checked) => {
    if (readOnly || saving) return;

    setSelectedIds((current) => {
      if (checked) {
        return current.includes(menuSetId) ? current : [...current, menuSetId];
      }

      return current.filter((id) => id !== menuSetId);
    });
  };

  const handleMove = (menuSetId, direction) => {
    if (readOnly || saving) return;

    setSelectedIds((current) => {
      const index = current.indexOf(menuSetId);
      const nextIndex = direction === "up" ? index - 1 : index + 1;

      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;

      const updated = [...current];
      [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];

      return updated;
    });
  };

  const handleDiscard = () => {
    if (saving || !hasChanges) return;
    setSelectedIds([...savedIds]);
  };

  const handleSave = async () => {
    if (saving || savingRef.current || readOnly || !hasChanges) return;

    savingRef.current = true;
    setSaving(true);

    try {
      const result = await syncMenuSetAssignments(
        restaurantId, branchId, menuId, selectedIds
      );

      if (!result?.data || !Array.isArray(result.data.menu_set_ids)) {
        throw new Error("No se recibió la confirmación de las asignaciones.");
      }

      const data = result.data;
      const updatedIds = normalizeIds(data.menu_set_ids);

      if (Array.isArray(data.available_menu_sets)) {
        setMenuSets(normalizeMenuSets(data.available_menu_sets));
      }

      setSelectedIds(updatedIds);
      setSavedIds(updatedIds);
      setServerMenuStatus(data.menu_status || serverMenuStatus);

      onAlertRef.current?.({
        severity: "success",
        title: "Hecho",
        message: result.message || "Conjuntos del menú actualizados correctamente.",
      });
    } catch (error) {
      onAlertRef.current?.({
        severity: "error",
        title: "Error",
        message: getBackendMessage(error, "No se pudieron guardar los Conjuntos del menú."),
      });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={panelSx}>
        <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
          <CircularProgress />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Cargando Conjuntos del menú…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (loadFailed) {
    return (
      <Paper sx={{ ...panelSx, p: 4, textAlign: "center" }}>
        <Typography sx={{ fontSize: 19, fontWeight: 800 }}>
          No fue posible cargar los Conjuntos
        </Typography>

        <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
          No se realizaron cambios en las asignaciones del menú.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <MenuSetsInstructions readOnly={readOnly} />

      <ContextOverview
        title="Contenido seleccionado"
        items={contextItems}
      />

      <Paper sx={{ ...panelSx, p: { xs: 2, sm: 2.5 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ mb: 1, fontSize: 14, fontWeight: 800 }}>
              Buscar Conjunto
            </Typography>

            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <FormControlLabel
            sx={{ m: 0, minHeight: 44 }}
            control={
              <Switch
                checked={selectedOnly}
                onChange={(event) => setSelectedOnly(event.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                Solo seleccionados
              </Typography>
            }
          />
        </Stack>
      </Paper>

      <Paper sx={listSx}>
        <Box sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.75,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", lg: "center" },
          gap: 2,
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
              Conjuntos disponibles
            </Typography>

            <Typography sx={{
              mt: 0.5,
              fontSize: 12,
              color: "text.secondary",
              lineHeight: 1.5,
            }}>
              El orden de los Conjuntos seleccionados determina su presentación en el menú.
            </Typography>

            {!readOnly && hasChanges ? (
              <Typography sx={{
                mt: 0.75,
                fontSize: 12,
                color: "warning.dark",
                fontWeight: 700,
              }}>
                Tienes cambios pendientes de guardar.
              </Typography>
            ) : null}
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent={{ xs: "flex-start", lg: "flex-end" }}
            sx={{ width: { xs: "100%", lg: "auto" }, flexShrink: 0 }}
          >
            <Chip
              label={`${pagination.total} ${pagination.total === 1 ? "Conjunto" : "Conjuntos"}`}
              color="primary"
              size="small"
              variant="outlined"
              sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
            />

            {!readOnly ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<RestartAltRoundedIcon />}
                  onClick={handleDiscard}
                  disabled={!hasChanges || saving}
                  sx={{ height: 44, whiteSpace: "nowrap" }}
                >
                  Descartar cambios
                </Button>

                <Button
                  type="button"
                  variant="contained"
                  startIcon={saving
                    ? <CircularProgress size={18} color="inherit" />
                    : <SaveOutlinedIcon />}
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  sx={{ height: 44, fontWeight: 800, whiteSpace: "nowrap" }}
                >
                  {saving ? "Guardando…" : "Guardar Conjuntos"}
                </Button>
              </Stack>
            ) : null}
          </Stack>
        </Box>

        {pagination.total === 0 ? (
          <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
            <LayersOutlinedIcon sx={{ fontSize: 36, color: "text.disabled", mb: 1 }} />

            <Typography sx={{ fontSize: 18, fontWeight: 800 }}>
              No hay Conjuntos para mostrar
            </Typography>

            <Typography sx={{ mt: 1, fontSize: 13, color: "text.secondary" }}>
              {menuSets.length === 0
                ? "Esta sucursal todavía no tiene Conjuntos registrados."
                : "Cambia la búsqueda o el filtro de selección."}
            </Typography>
          </Box>
        ) : (
          <>
            {useCards ? (
              <Box sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gridAutoRows: "1fr",
                gap: 1.5,
                p: { xs: 2, sm: 2.5 },
                alignItems: "stretch",
              }}>
                {pagination.paginatedItems.map((item) => {
                  const selected = selectedLookup.has(item.id);
                  const index = selectedIds.indexOf(item.id);

                  return (
                    <MenuSetCard
                      key={item.id}
                      item={item}
                      selected={selected}
                      order={index}
                      totalSelected={selectedIds.length}
                      disabled={readOnly || saving}
                      onToggle={handleToggle}
                      onMove={handleMove}
                    />
                  );
                })}
              </Box>
            ) : (
              <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
                <Table sx={{ minWidth: 850 }}>
                  <TableHead>
                    <TableRow sx={{
                      "& th": {
                        bgcolor: "primary.main",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: 13,
                        borderBottom: "none",
                        whiteSpace: "nowrap",
                      },
                    }}>
                      <TableCell sx={{ width: "35%" }}>Conjunto</TableCell>
                      <TableCell sx={{ width: "15%" }}>Precio</TableCell>
                      <TableCell sx={{ width: "15%" }}>Estado</TableCell>
                      <TableCell align="center" sx={{ width: "17%" }}>Orden</TableCell>
                      <TableCell align="center" sx={{ width: "18%" }}>Incluir en menú</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {pagination.paginatedItems.map((item) => {
                      const selected = selectedLookup.has(item.id);
                      const index = selectedIds.indexOf(item.id);

                      return (
                        <TableRow key={item.id} hover sx={{
                          "& td": {
                            py: 2,
                            borderBottom: "1px solid",
                            borderColor: "divider",
                            verticalAlign: "middle",
                          },
                        }}>
                          <TableCell>
                            <Typography sx={{
                              fontSize: 14,
                              fontWeight: 800,
                              color: "text.primary",
                              overflowWrap: "anywhere",
                            }}>
                              {item.name}
                            </Typography>

                            {item.billing_name && item.billing_name !== item.name ? (
                              <Typography sx={{
                                mt: 0.4,
                                fontSize: 12,
                                color: "text.secondary",
                                overflowWrap: "anywhere",
                              }}>
                                Nombre para cobro: {item.billing_name}
                              </Typography>
                            ) : null}
                          </TableCell>

                          <TableCell>
                            <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                              {currencyFormatter.format(item.price)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <MenuSetStatus item={item} />
                          </TableCell>

                          <TableCell align="center">
                            <OrderControls
                              selected={selected}
                              index={index}
                              total={selectedIds.length}
                              disabled={readOnly || saving}
                              onUp={() => handleMove(item.id, "up")}
                              onDown={() => handleMove(item.id, "down")}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <Switch
                              checked={selected}
                              onChange={(event) => handleToggle(item.id, event.target.checked)}
                              disabled={readOnly || saving}
                              color="primary"
                              inputProps={{ "aria-label": `Incluir ${item.name} en el menú` }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <PaginationFooter
              page={pagination.page}
              totalPages={pagination.totalPages}
              startItem={pagination.startItem}
              endItem={pagination.endItem}
              total={pagination.total}
              hasPrev={pagination.hasPrev}
              hasNext={pagination.hasNext}
              onPrev={pagination.prevPage}
              onNext={pagination.nextPage}
              itemLabel="Conjuntos"
            />
          </>
        )}
      </Paper>
    </Stack>
  );
}

function MenuSetsInstructions({ readOnly = false }) {
  const instructions = [
    "Selecciona los Conjuntos que deseas incluir en este menú.",
    "Organiza el orden en el que aparecerán los Conjuntos seleccionados.",
    "Cada Conjunto conserva su configuración, productos y precio originales.",
  ];

  return (
    <Paper sx={{ ...panelSx, p: { xs: 2, sm: 2.5 } }}>
      <Stack spacing={1.25}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
          {readOnly ? "Contenido archivado" : "Antes de comenzar"}
        </Typography>

        {readOnly ? (
          <Typography sx={{ fontSize: 14, color: "text.secondary", lineHeight: 1.6 }}>
            Este menú está archivado. Puedes consultar sus Conjuntos, pero ya no puedes modificarlos.
          </Typography>
        ) : (
          instructions.map((instruction, index) => (
            <Stack key={instruction} direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{
                minWidth: 28,
                height: 28,
                borderRadius: 999,
                bgcolor: "primary.main",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 13,
                fontWeight: 800,
              }}>
                {index + 1}
              </Box>

              <Typography sx={{
                fontSize: 14,
                color: "text.primary",
                lineHeight: 1.6,
              }}>
                {instruction}
              </Typography>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  );
}

function MenuSetCard({
  item,
  selected,
  order,
  totalSelected,
  disabled,
  onToggle,
  onMove,
}) {
  return (
    <Paper sx={{
      p: 2,
      minWidth: 0,
      minHeight: 215,
      height: "100%",
      borderRadius: 1,
      border: "1px solid",
      borderColor: selected ? "#E5A67F" : "divider",
      bgcolor: selected ? "rgba(214, 122, 58, 0.04)" : "background.paper",
      boxShadow: "none",
      display: "flex",
      flexDirection: "column",
    }}>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <Box sx={{
            width: 38,
            height: 38,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: 1,
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: "primary.main",
          }}>
            <LayersOutlinedIcon fontSize="small" />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{
              fontSize: 16,
              fontWeight: 800,
              color: "text.primary",
              overflowWrap: "anywhere",
              lineHeight: 1.4,
            }}>
              {item.name}
            </Typography>

            <Typography sx={{ mt: 0.4, fontSize: 14, fontWeight: 800 }}>
              {currencyFormatter.format(item.price)}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <MenuSetStatus item={item} />

          {selected ? (
            <Chip label="Seleccionado" size="small" color="success" />
          ) : null}
        </Stack>

        <Box sx={{
          mt: "auto !important",
          pt: 1.5,
          borderTop: "1px solid",
          borderColor: "divider",
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
            <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
              Incluir en menú
            </Typography>

            <Switch
              checked={selected}
              onChange={(event) => onToggle(item.id, event.target.checked)}
              disabled={disabled}
              color="primary"
              inputProps={{ "aria-label": `Incluir ${item.name} en el menú` }}
            />
          </Stack>

          {selected ? (
            <Box sx={{ mt: 1 }}>
              <OrderControls
                selected={selected}
                index={order}
                total={totalSelected}
                disabled={disabled}
                onUp={() => onMove(item.id, "up")}
                onDown={() => onMove(item.id, "down")}
              />
            </Box>
          ) : null}
        </Box>
      </Stack>
    </Paper>
  );
}

function MenuSetStatus({ item }) {
  return (
    <Chip
      label={item.is_active ? "Activo" : "Inactivo"}
      color={item.is_active ? "success" : "default"}
      variant={item.is_active ? "filled" : "outlined"}
      size="small"
      sx={{ fontWeight: 800 }}
    />
  );
}

function OrderControls({
  selected,
  index,
  total,
  disabled,
  onUp,
  onDown,
}) {
  if (!selected) {
    return (
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        —
      </Typography>
    );
  }

  return (
    <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
      <Typography sx={{
        minWidth: 55,
        fontSize: 13,
        fontWeight: 800,
        color: "text.primary",
      }}>
        Orden {index + 1}
      </Typography>

      {!disabled ? (
        <>
          <Tooltip title="Subir Conjunto">
            <span>
              <IconButton
                size="small"
                onClick={onUp}
                disabled={index <= 0}
                aria-label="Subir Conjunto"
              >
                <KeyboardArrowUpOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Bajar Conjunto">
            <span>
              <IconButton
                size="small"
                onClick={onDown}
                disabled={index >= total - 1}
                aria-label="Bajar Conjunto"
              >
                <KeyboardArrowDownOutlinedIcon />
              </IconButton>
            </span>
          </Tooltip>
        </>
      ) : null}
    </Stack>
  );
}

const panelSx = {
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
};

const listSx = {
  ...panelSx,
  p: 0,
  overflow: "hidden",
};
