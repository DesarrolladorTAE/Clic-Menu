import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";

import {
  Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Paper, Stack, Typography,
} from "@mui/material";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import PauseCircleOutlineOutlinedIcon from "@mui/icons-material/PauseCircleOutlineOutlined";

import PageContainer from "../../../../../components/common/PageContainer";
import AppAlert from "../../../../../components/common/AppAlert";
import PaginationFooter from "../../../../../components/common/PaginationFooter";
import ContextOverview from "../../../../../components/common/ContextOverview";

import usePagination from "../../../../../hooks/usePagination";

import MenuSetStageDefinitionForm from "../../../../../components/menu/menuSets/manage/definitions/MenuSetStageDefinitionForm";
import MenuSetStageDefinitionsList from "../../../../../components/menu/menuSets/manage/definitions/MenuSetStageDefinitionsList";

import { getMenuSet } from "../../../../../services/menu/menuSets/menuSet.service";

import {
  getMenuSetStageDefinitions,
  createMenuSetStageDefinition,
  updateMenuSetStageDefinition,
  deleteMenuSetStageDefinition,
} from "../../../../../services/menu/menuSets/menuSetStageDefinition.service";

const panelSx = {
  borderRadius: 1,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "none",
  overflow: "hidden",
};

function getErrorMessage(error, fallback) {
  const data = error?.response?.data;
  const errors = data?.errors && typeof data.errors === "object"
    ? Object.values(data.errors).flat()
    : [];

  return errors.find((message) => typeof message === "string")
    || data?.message || error?.message || fallback;
}

function isSystemDefinition(definition) {
  return definition?.is_system === true
    || definition?.is_system === 1
    || definition?.is_system === "1";
}

function sortDefinitions(items) {
  return [...items].sort((a, b) => {
    const orderDifference = Number(a.sort_order) - Number(b.sort_order);
    return orderDifference || Number(a.id) - Number(b.id);
  });
}

function PaginationBlock({ pagination, itemLabel }) {
  if (pagination.total === 0) return null;

  return (
    <Box sx={{ borderTop: "1px solid", borderColor: "divider" }}>
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
        itemLabel={itemLabel}
      />
    </Box>
  );
}

export default function MenuSetStageDefinitionsPage() {
  const { restaurantId, menuSetId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const branchId = String(searchParams.get("branchId") || location.state?.branchId || "");

  const [menuSet, setMenuSet] = useState(null);
  const [definitions, setDefinitions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [formMode, setFormMode] = useState(null);
  const [editingDefinition, setEditingDefinition] = useState(null);
  const [formVersion, setFormVersion] = useState(0);
  const [saving, setSaving] = useState(false);

  const [updatingId, setUpdatingId] = useState(null);
  const [definitionToDelete, setDefinitionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const operationRef = useRef(false);
  const mountedRef = useRef(true);

  const busy = saving || deleting || updatingId !== null;

  const showAlert = useCallback(({ severity = "error", title = "Error", message = "" }) => {
    setAlertState({ open: true, severity, title, message });
  }, []);

  const closeAlert = (_, reason) => {
    if (reason === "clickaway") return;
    setAlertState((current) => ({ ...current, open: false }));
  };

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Consultar el conjunto y los tipos de etapas disponibles.
  useEffect(() => {
    if (!restaurantId || !branchId || !menuSetId) {
      setMenuSet(null);
      setDefinitions([]);
      setLoadFailed(true);
      setLoading(false);
      return undefined;
    }

    let active = true;

    const loadConfiguration = async () => {
      setLoading(true);
      setLoadFailed(false);

      try {
        const [set, rows] = await Promise.all([
          getMenuSet(restaurantId, branchId, menuSetId),
          getMenuSetStageDefinitions(restaurantId, branchId),
        ]);

        if (!active) return;

        if (!set?.id) {
          throw new Error("No se encontró el conjunto seleccionado.");
        }

        setMenuSet(set);
        setDefinitions(rows);
      } catch (error) {
        if (!active) return;

        setMenuSet(null);
        setDefinitions([]);
        setLoadFailed(true);

        showAlert({
          severity: "error",
          title: "Error",
          message: getErrorMessage(error, "No se pudieron consultar los tipos de etapas."),
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [restaurantId, branchId, menuSetId, showAlert]);

  const systemDefinitions = useMemo(() => {
    return sortDefinitions(definitions.filter(isSystemDefinition));
  }, [definitions]);

  const customDefinitions = useMemo(() => {
    return sortDefinitions(definitions.filter((definition) => !isSystemDefinition(definition)));
  }, [definitions]);

  const systemPagination = usePagination({
    items: systemDefinitions,
    pageSize: 5,
    resetKey: branchId,
  });

  const customPagination = usePagination({
    items: customDefinitions,
    pageSize: 5,
    resetKey: branchId,
  });

  const branchName = menuSet?.branch?.name || "Sucursal seleccionada";

  const customActiveCount = customDefinitions.filter(
    (item) => item.is_active === true || item.is_active === 1 || item.is_active === "1"
  ).length;

  const contextItems = [
    {
      key: "system",
      title: "Etapas predeterminadas",
      value: systemDefinitions.length,
      icon: <LayersOutlinedIcon fontSize="small" />,
      chipLabel: "Generales",
      chipColor: "primary",
    },
    {
      key: "custom",
      title: "Etapas personalizadas",
      value: customDefinitions.length,
      icon: <CategoryOutlinedIcon fontSize="small" />,
      chipLabel: "Registradas",
      chipColor: "primary",
    },
    {
      key: "active",
      title: "Personalizadas activas",
      value: customActiveCount,
      icon: <CheckCircleOutlineOutlinedIcon fontSize="small" />,
      chipLabel: "Disponibles",
      chipColor: "success",
    },
    {
      key: "inactive",
      title: "Personalizadas inactivas",
      value: customDefinitions.length - customActiveCount,
      icon: <PauseCircleOutlineOutlinedIcon fontSize="small" />,
      chipLabel: "Inactivas",
      chipColor: "default",
    },
  ];

  const handleBack = () => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/menu-sets/${menuSetId}?branchId=${encodeURIComponent(branchId)}`,
      {
        state: {
          branchId,
          activeTab: "stages",
        },
      }
    );
  };

  const openForm = (mode, definition = null) => {
    if (busy || operationRef.current) return;

    if (mode === "edit" && definition?.can_edit !== true) return;

    setEditingDefinition(definition);
    setFormMode(mode);
    setFormVersion((current) => current + 1);
  };

  const closeForm = () => {
    if (saving) return;

    setFormMode(null);
    setEditingDefinition(null);
  };

  const replaceDefinition = (updated) => {
    setDefinitions((current) => {
      const exists = current.some((item) => String(item.id) === String(updated.id));

      if (exists) {
        return current.map((item) =>
          String(item.id) === String(updated.id) ? updated : item
        );
      }

      return [...current, updated];
    });
  };

  // Guardar creación o edición sin recargar la página.
  const handleSave = async (payload, definition) => {
    if (operationRef.current || busy) return;

    operationRef.current = true;
    setSaving(true);

    try {
      const response = definition
        ? await updateMenuSetStageDefinition(
            restaurantId, branchId, definition.id, payload
          )
        : await createMenuSetStageDefinition(
            restaurantId, branchId, payload
          );

      const savedDefinition = response?.stage_definition;

      if (!savedDefinition?.id) {
        throw new Error("No se recibió la información de la etapa guardada.");
      }

      replaceDefinition(savedDefinition);

      setFormMode(null);
      setEditingDefinition(null);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Etapa guardada correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(error, "No se pudo guardar la etapa."),
      });

      throw error;
    } finally {
      operationRef.current = false;

      if (mountedRef.current) setSaving(false);
    }
  };

  // Cambio de estado con actualización visual inmediata.
  const handleStatusChange = async (definition, checked) => {
    if (operationRef.current || busy || isSystemDefinition(definition)) return;

    const allowed = checked
      ? definition.can_activate === true
      : definition.can_deactivate === true;

    if (!allowed) return;

    operationRef.current = true;
    setUpdatingId(definition.id);

    setDefinitions((current) => current.map((item) =>
      String(item.id) === String(definition.id)
        ? { ...item, is_active: checked }
        : item
    ));

    try {
      const response = await updateMenuSetStageDefinition(
        restaurantId,
        branchId,
        definition.id,
        { is_active: checked }
      );

      const updated = response?.stage_definition;

      if (!updated?.id) {
        throw new Error("No se recibió la información actualizada de la etapa.");
      }

      replaceDefinition(updated);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Estado actualizado correctamente.",
      });
    } catch (error) {
      setDefinitions((current) => current.map((item) =>
        String(item.id) === String(definition.id) ? definition : item
      ));

      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(error, "No se pudo cambiar el estado de la etapa."),
      });
    } finally {
      operationRef.current = false;

      if (mountedRef.current) setUpdatingId(null);
    }
  };

  const handleDeleteRequest = (definition) => {
    if (busy || operationRef.current || definition.can_delete !== true) return;
    setDefinitionToDelete(definition);
  };

  const handleDeleteConfirm = async () => {
    if (!definitionToDelete?.id || busy || operationRef.current) return;

    const definitionId = definitionToDelete.id;

    operationRef.current = true;
    setDeleting(true);

    try {
      const response = await deleteMenuSetStageDefinition(
        restaurantId,
        branchId,
        definitionId
      );

      setDefinitions((current) => current.filter(
        (item) => String(item.id) !== String(definitionId)
      ));

      setDefinitionToDelete(null);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: response?.message || "Etapa eliminada correctamente.",
      });
    } catch (error) {
      showAlert({
        severity: "error",
        title: "Error",
        message: getErrorMessage(error, "No se pudo eliminar la etapa."),
      });
    } finally {
      operationRef.current = false;

      if (mountedRef.current) setDeleting(false);
    }
  };

  return (
    <PageContainer>
      <Stack spacing={3}>
        {/* Encabezado */}
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontSize: { xs: 30, md: 42 },
              fontWeight: 800,
              color: "text.primary",
              lineHeight: 1.1,
            }}>
              Administrar tipos de etapas
            </Typography>

            <Typography sx={{
              mt: 1,
              fontSize: { xs: 14, md: 17 },
              color: "text.secondary",
              lineHeight: 1.55,
            }}>
              Organiza las etapas disponibles para{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 800 }}>
                {branchName}
              </Box>.
            </Typography>
          </Box>

          <Button
            type="button"
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={handleBack}
            sx={{
              minWidth: { xs: "100%", sm: 190 },
              height: 44,
              fontWeight: 800,
            }}
          >
            Volver a etapas
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ minHeight: "45vh", display: "grid", placeItems: "center" }}>
            <Stack spacing={2} alignItems="center">
              <CircularProgress color="primary" />

              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Cargando tipos de etapas…
              </Typography>
            </Stack>
          </Box>
        ) : loadFailed ? (
          <Paper sx={{ ...panelSx, p: { xs: 2, sm: 2.5 }, py: 5, textAlign: "center" }}>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
              No se pudieron consultar las etapas
            </Typography>

            <Typography sx={{ mt: 1, fontSize: 14, color: "text.secondary" }}>
              Regresa a la administración del conjunto para volver a ingresar.
            </Typography>
          </Paper>
        ) : (
          <>
            {/* Contexto actual */}
            <ContextOverview
              items={contextItems}
              description="Las etapas personalizadas que registres podrán utilizarse en diferentes Conjuntos de esta sucursal."
            />

            {/* Etapas predeterminadas */}
            <Paper sx={panelSx}>
              <Box sx={{
                px: { xs: 2, sm: 2.5 },
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                  Etapas predeterminadas
                </Typography>

                <Typography sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "text.secondary",
                  lineHeight: 1.55,
                }}>
                  Etapas generales disponibles para los Conjuntos.
                </Typography>
              </Box>

              <MenuSetStageDefinitionsList
                definitions={systemPagination.paginatedItems}
                system
                busy={busy}
              />

              <PaginationBlock
                pagination={systemPagination}
                itemLabel="etapas"
              />
            </Paper>

            {/* Etapas personalizadas */}
            <Paper sx={panelSx}>
              <Box sx={{
                px: { xs: 2, sm: 2.5 },
                py: 1.75,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "stretch", md: "center" }}
                  spacing={2}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 20, fontWeight: 800, color: "text.primary" }}>
                      Etapas personalizadas
                    </Typography>

                    <Typography sx={{
                      mt: 0.5,
                      fontSize: 13,
                      color: "text.secondary",
                      lineHeight: 1.55,
                    }}>
                      Crea y organiza tus propios tipos de etapas para esta sucursal.
                    </Typography>
                  </Box>

                  <Button
                    type="button"
                    variant="contained"
                    startIcon={<AddOutlinedIcon />}
                    disabled={busy}
                    onClick={() => openForm("create")}
                    sx={{
                      width: { xs: "100%", md: "auto" },
                      height: 44,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    Nueva etapa personalizada
                  </Button>
                </Stack>
              </Box>

              <MenuSetStageDefinitionsList
                definitions={customPagination.paginatedItems}
                busy={busy}
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
                onEdit={(definition) => openForm("edit", definition)}
                onDelete={handleDeleteRequest}
              />

              <PaginationBlock
                pagination={customPagination}
                itemLabel="etapas"
              />
            </Paper>
          </>
        )}
      </Stack>

      {/* Formulario */}
      {formMode ? (
        <MenuSetStageDefinitionForm
          key={`${formMode}-${editingDefinition?.id || "new"}-${formVersion}`}
          open
          definition={editingDefinition}
          saving={saving}
          onSave={handleSave}
          onCancel={closeForm}
        />
      ) : null}

      {/* Confirmación de eliminación */}
      <Dialog
        open={Boolean(definitionToDelete)}
        onClose={deleting ? undefined : () => setDefinitionToDelete(null)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "text.primary" }}>
          Eliminar etapa personalizada
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
                {definitionToDelete?.name || "seleccionada"}
              </Box>?
            </Typography>

            <Typography sx={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "text.secondary",
            }}>
              Esta acción eliminará permanentemente la etapa personalizada y no se podrá deshacer.
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
            onClick={() => setDefinitionToDelete(null)}
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

      {/* Alertas */}
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