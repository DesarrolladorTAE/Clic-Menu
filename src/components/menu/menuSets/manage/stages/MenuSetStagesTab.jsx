//src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, InputAdornment, MenuItem,
  Paper, Stack, TextField, Tooltip, Typography,
} from "@mui/material";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";

import PaginationFooter from "../../../../common/PaginationFooter";
import usePagination from "../../../../../hooks/usePagination";

import MenuSetStageForm from "./MenuSetStageForm";
import MenuSetStagesList from "./MenuSetStagesList";

import { getMenuSet } from "../../../../../services/menu/menuSets/menuSet.service";

import {
  getMenuSetStages,
  getMenuSetStageDefinitions,
  createMenuSetStage,
  updateMenuSetStage,
  deleteMenuSetStage,
} from "../../../../../services/menu/menuSets/menuSetStage.service";

const panelSx = {
  p: { xs: 2, sm: 2.5 },
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  backgroundColor: "background.paper",
  boxShadow: "none",
};

const labelSx = {
  fontSize: 14,
  fontWeight: 800,
  color: "text.primary",
  mb: 1,
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;

  const fieldErrors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return fieldErrors.find((message) => typeof message === "string")
    || data?.message
    || error?.message
    || fallback;
}

function SummaryCard({ label, value, helper, icon: Icon }) {
  return (
    <Box sx={{
      p: 1.75,
      height: "100%",
      minWidth: 0,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      bgcolor: "background.default",
    }}>
      <Stack spacing={1} height="100%">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box sx={{
            width: 34, height: 34,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            bgcolor: "rgba(255, 152, 0, 0.12)",
            color: "primary.main",
            flexShrink: 0,
          }}>
            <Icon fontSize="small" />
          </Box>

          <Typography sx={{
            fontSize: 14,
            fontWeight: 800,
            color: "text.primary",
          }}>
            {label}
          </Typography>
        </Stack>

        <Typography sx={{
          fontSize: 24,
          fontWeight: 800,
          color: "primary.main",
        }}>
          {value}
        </Typography>

        <Typography sx={{
          mt: "auto",
          fontSize: 12,
          color: "text.secondary",
          lineHeight: 1.5,
        }}>
          {helper}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function MenuSetStagesTab({
  restaurantId,
  branchId,
  menuSet,
  onUpdated,
  onAlert,
  onConfigureProducts,
  onManageTypes,
}) {
  const menuSetId = menuSet?.id;

  const [stages, setStages] = useState([]);
  const [definitions, setDefinitions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [definitionsLoaded, setDefinitionsLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formMode, setFormMode] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [saving, setSaving] = useState(false);

  const [updatingStageId, setUpdatingStageId] = useState(null);
  const [stageToDelete, setStageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const operationRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const busy = saving || deleting || updatingStageId !== null;

  // Consultar las etapas y sus definiciones.
  useEffect(() => {
    if (!restaurantId || !branchId || !menuSetId) {
      setStages([]);
      setDefinitions([]);
      setDefinitionsLoaded(false);
      setLoadFailed(true);
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadConfiguration = async () => {
      setLoading(true);
      setLoadFailed(false);
      setDefinitionsLoaded(false);

      const results = await Promise.allSettled([
        getMenuSetStages(restaurantId, branchId, menuSetId),
        getMenuSetStageDefinitions(restaurantId, branchId),
      ]);

      if (!active) {
        return;
      }

      const stagesResult = results[0];
      const definitionsResult = results[1];

      if (stagesResult.status === "fulfilled") {
        setStages(stagesResult.value);
      } else {
        setStages([]);
        setLoadFailed(true);
      }

      if (definitionsResult.status === "fulfilled") {
        setDefinitions(definitionsResult.value);
        setDefinitionsLoaded(true);
      } else {
        setDefinitions([]);
        setDefinitionsLoaded(false);
      }

      if (stagesResult.status === "rejected" || definitionsResult.status === "rejected") {
        const error = stagesResult.status === "rejected"
          ? stagesResult.reason
          : definitionsResult.reason;

        onAlert?.({
          severity: "error",
          title: "Error",
          message: getErrorMessage(
            error,
            "No se pudo consultar toda la información de las etapas."
          ),
        });
      }

      setLoading(false);
    };

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuSetId, onAlert]);

  // Actualizar los permisos y datos relacionados sin recargar la pantalla.
  const synchronize = async () => {
    const results = await Promise.allSettled([
      getMenuSetStages(restaurantId, branchId, menuSetId),
      getMenuSet(restaurantId, branchId, menuSetId),
    ]);

    if (!mountedRef.current) {
      return;
    }

    if (results[0].status === "fulfilled") {
      setStages(results[0].value);
    }

    if (results[1].status === "fulfilled" && results[1].value?.id) {
      onUpdated?.(results[1].value);
    }
  };

  const orderedStages = useMemo(() => {
    return [...stages].sort((a, b) => {
      const orderDifference = Number(a.sort_order) - Number(b.sort_order);
      return orderDifference || Number(a.id) - Number(b.id);
    });
  }, [stages]);

  const summary = useMemo(() => ({
    total: stages.length,
    active: stages.filter((stage) => Boolean(stage.is_active)).length,
    inactive: stages.filter((stage) => !stage.is_active).length,
  }), [stages]);

  const usedDefinitionIds = useMemo(() => {
    return stages.map((stage) => Number(stage.stage_definition_id));
  }, [stages]);

  const availableDefinitions = useMemo(() => {
    return definitions.filter((definition) => {
      return Boolean(definition.is_active)
        && !usedDefinitionIds.includes(Number(definition.id));
    });
  }, [definitions, usedDefinitionIds]);

  const filteredStages = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("es-MX");

    return orderedStages.filter((stage) => {
      const matchesStatus = statusFilter === "all"
        || (statusFilter === "active" && Boolean(stage.is_active))
        || (statusFilter === "inactive" && !stage.is_active);

      const name = String(stage.name || "").toLocaleLowerCase("es-MX");
      const matchesSearch = !term || name.includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [orderedStages, search, statusFilter]);

  const pagination = usePagination({
    items: filteredStages,
    pageSize: 5,
    resetKey: `${menuSetId}|${search}|${statusFilter}`,
  });

  const summaryItems = [
    {
      key: "total",
      label: "Etapas totales",
      icon: LayersOutlinedIcon,
      helper: "Etapas agregadas al conjunto.",
    },
    {
      key: "active",
      label: "Etapas activas",
      icon: CheckCircleOutlineOutlinedIcon,
      helper: "Etapas habilitadas.",
    },
    {
      key: "inactive",
      label: "Etapas inactivas",
      icon: PauseCircleOutlineOutlinedIcon,
      helper: "Etapas guardadas sin habilitar.",
    },
  ];

  const openForm = (mode, stage = null) => {
    if (busy || operationRef.current) {
        return;
    }

    setFormMode(mode);
    setEditingStage(stage);
    setFormVersion((current) => current + 1);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setFormMode(null);
    setEditingStage(null);
  };

  const handleSave = async (payload, stage) => {
    if (operationRef.current) {
      return;
    }

    operationRef.current = true;
    setSaving(true);

    try {
      const response = stage
        ? await updateMenuSetStage(
            restaurantId, branchId, menuSetId, stage.id, payload
          )
        : await createMenuSetStage(
            restaurantId, branchId, menuSetId, payload
          );

      const savedStage = response?.stage;

      if (!savedStage?.id) {
        throw new Error("No se recibió la información de la etapa guardada.");
      }

      // Mostrar el cambio inmediatamente.
      setStages((current) => {
        const exists = current.some((item) => String(item.id) === String(savedStage.id));

        if (exists) {
          return current.map((item) =>
            String(item.id) === String(savedStage.id) ? savedStage : item
          );
        }

        return [...current, savedStage];
      });

      setFormMode(null);
      setEditingStage(null);

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Etapa guardada correctamente.",
      });

      await synchronize();
    } finally {
      operationRef.current = false;

      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  const handleStatusChange = async (stage, checked) => {
    if (operationRef.current || busy) {
      return;
    }

    const allowed = checked
      ? stage.can_activate === true
      : stage.can_deactivate === true;

    if (!allowed) {
      return;
    }

    operationRef.current = true;
    setUpdatingStageId(stage.id);

    // Aplicar visualmente el nuevo estado.
    setStages((current) => current.map((item) =>
      String(item.id) === String(stage.id)
        ? { ...item, is_active: checked }
        : item
    ));

    try {
      const response = await updateMenuSetStage(
        restaurantId,
        branchId,
        menuSetId,
        stage.id,
        { is_active: checked }
      );

      if (!response?.stage?.id) {
        throw new Error("No se recibió la información actualizada de la etapa.");
      }

      setStages((current) => current.map((item) =>
        String(item.id) === String(stage.id)
          ? response.stage
          : item
      ));

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Estado de la etapa actualizado correctamente.",
      });

      await synchronize();
    } catch (error) {
      // Restaurar la información anterior si falla.
      setStages((current) => current.map((item) =>
        String(item.id) === String(stage.id) ? stage : item
      ));

      onAlert?.({
        severity: "error",
        title: "Error",
        message: getErrorMessage(error, "No se pudo cambiar el estado de la etapa."),
      });
    } finally {
      operationRef.current = false;

      if (mountedRef.current) {
        setUpdatingStageId(null);
      }
    }
  };

  const handleDeleteRequest = (stage) => {
    if (busy || stage.can_delete !== true) {
      return;
    }

    setStageToDelete(stage);
  };

  const handleDeleteConfirm = async () => {
    if (!stageToDelete?.id || operationRef.current || deleting) {
      return;
    }

    const stageId = stageToDelete.id;

    operationRef.current = true;
    setDeleting(true);

    try {
      const response = await deleteMenuSetStage(
        restaurantId,
        branchId,
        menuSetId,
        stageId
      );

      setStages((current) => current.filter(
        (stage) => String(stage.id) !== String(stageId)
      ));

      setStageToDelete(null);

      if (String(editingStage?.id) === String(stageId)) {
        setEditingStage(null);
        setFormMode(null);
      }

      onAlert?.({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Etapa eliminada correctamente.",
      });

      await synchronize();
    } catch (error) {
      onAlert?.({
        severity: "error",
        title: "Error",
        message: getErrorMessage(error, "No se pudo eliminar la etapa."),
      });
    } finally {
      operationRef.current = false;

      if (mountedRef.current) {
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <Paper sx={panelSx}>
        <Stack spacing={2} alignItems="center" sx={{ py: 5 }}>
          <CircularProgress color="primary" />

          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
            Cargando etapas del conjunto…
          </Typography>
        </Stack>
      </Paper>
    );
  }

  if (loadFailed) {
    return (
      <Paper sx={{ ...panelSx, py: 5, textAlign: "center" }}>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
          No se pudieron consultar las etapas
        </Typography>

        <Typography sx={{
          mt: 1, fontSize: 14,
          color: "text.secondary", lineHeight: 1.55,
        }}>
          Vuelve a ingresar a esta sección para consultar la información del conjunto.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Contexto actual */}
      <Paper sx={panelSx}>
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
            Contexto actual
          </Typography>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gridAutoRows: "1fr",
            gap: 1.5,
          }}>
            {summaryItems.map((item) => (
              <SummaryCard
                key={item.key}
                label={item.label}
                value={summary[item.key]}
                helper={item.helper}
                icon={item.icon}
              />
            ))}
          </Box>
        </Stack>
      </Paper>

      {/* Encabezado de etapas */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
            Etapas del conjunto
          </Typography>

          <Typography sx={{
            mt: 0.5,
            fontSize: 13,
            color: "text.secondary",
            lineHeight: 1.55,
          }}>
            Organiza las etapas y define cuántos productos podrá seleccionar el cliente.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ flexShrink: 0 }}
        >
          <Tooltip
            title={onManageTypes
              ? "Administrar los tipos de etapas disponibles"
              : "La administración de tipos de etapas estará disponible en el paso correspondiente."}
            arrow
          >
            <span>
              <Button
                type="button"
                variant="outlined"
                startIcon={<TuneOutlinedIcon />}
                disabled={busy || typeof onManageTypes !== "function"}
                onClick={() => onManageTypes?.()}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                Administrar tipos de etapas
              </Button>
            </span>
          </Tooltip>

          <Tooltip
            title={!definitionsLoaded
              ? "No se pudieron consultar los tipos de etapas disponibles."
              : availableDefinitions.length === 0
                ? "No hay más tipos de etapas disponibles para agregar."
                : ""}
            arrow
          >
            <span>
              <Button
                type="button"
                variant="contained"
                startIcon={<AddOutlinedIcon />}
                disabled={busy || !definitionsLoaded || availableDefinitions.length === 0}
                onClick={() => openForm("create")}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  height: 44,
                  fontWeight: 800,
                }}
              >
                Agregar etapa
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Buscar y filtrar */}
      <Paper sx={panelSx}>
        <Stack spacing={1.75}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: "text.primary" }}>
              Buscar y filtrar
            </Typography>

            <Typography sx={{
              mt: 0.5,
              fontSize: 13,
              color: "text.secondary",
            }}>
              Localiza etapas por nombre o estado.
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              fullWidth
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar etapa..."
              inputProps={{ "aria-label": "Buscar etapa" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon
                      fontSize="small"
                      sx={{ color: "text.secondary" }}
                    />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              SelectProps={{ IconComponent: KeyboardArrowDownIcon }}
              sx={{
                width: { xs: "100%", md: 220 },
                flexShrink: 0,
              }}
            >
              <MenuItem value="all">Todas</MenuItem>
              <MenuItem value="active">Activas</MenuItem>
              <MenuItem value="inactive">Inactivas</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Paper>

      {/* Listado */}
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 18, fontWeight: 800, color: "text.primary" }}>
          Etapas registradas
        </Typography>

        <MenuSetStagesList
          stages={pagination.paginatedItems}
          busy={busy}
          updatingStageId={updatingStageId}
          hasFilters={Boolean(search.trim()) || statusFilter !== "all"}
          onStatusChange={handleStatusChange}
          onEdit={(stage) => openForm("edit", stage)}
          onDelete={handleDeleteRequest}
          onConfigureProducts={onConfigureProducts}
        />

        {filteredStages.length > 0 ? (
          <Paper sx={{
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "none",
            overflow: "hidden",
          }}>
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
              itemLabel="etapas"
            />
          </Paper>
        ) : null}
      </Stack>

      {/* Modal para agregar o editar etapas */}
      {formMode ? (
        <MenuSetStageForm
            key={`${formMode}-${editingStage?.id || "new"}-${formVersion}`}
            open={Boolean(formMode)}
            stage={editingStage}
            menuSet={menuSet}
            definitions={definitions}
            usedDefinitionIds={usedDefinitionIds}
            saving={saving}
            onSave={handleSave}
            onCancel={closeForm}
            onAlert={onAlert}
        />
      ) : null}

      {/* Confirmar eliminación */}
      <Dialog
        open={Boolean(stageToDelete)}
        onClose={deleting ? undefined : () => setStageToDelete(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
          Eliminar etapa
        </DialogTitle>

        <DialogContent>
          <Stack spacing={1.25}>
            <Typography sx={{
              fontSize: 14,
              lineHeight: 1.55,
              color: "text.primary",
            }}>
              ¿Deseas eliminar la etapa{" "}
              <Box component="span" sx={{ fontWeight: 800 }}>
                {stageToDelete?.name || "seleccionada"}
              </Box>?
            </Typography>

            <Typography sx={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "text.secondary",
            }}>
              Esta acción eliminará la etapa y sus productos asignados. No se podrá deshacer.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{
          px: 3,
          pb: 2.5,
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: 1,
        }}>
          <Button
            type="button"
            variant="outlined"
            disabled={deleting}
            onClick={() => setStageToDelete(null)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            variant="contained"
            color="error"
            disabled={deleting}
            onClick={handleDeleteConfirm}
            startIcon={deleting
              ? <CircularProgress size={18} color="inherit" />
              : <DeleteOutlineOutlinedIcon />}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {deleting ? "Eliminando…" : "Eliminar etapa"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}