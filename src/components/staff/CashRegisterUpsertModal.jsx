import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton,
  MenuItem, Stack, Switch, TextField, Typography, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../components/common/AppAlert";

export default function CashRegisterUpsertModal({
  open,
  onClose,
  restaurantId,
  branches,
  editing,
  planAccess,
  cashRegisterMeta = {},
  warehouseOptionsByBranch = [],
  cashRegisterRequiresWarehouse = false,
  onSaved,
  api,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const [branchId, setBranchId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);

  const title = useMemo(
    () => (isEdit ? "Editar caja" : "Nueva caja"),
    [isEdit]
  );

  const currentPlanName = useMemo(() => {
    return planAccess?.plan?.name || "Plan actual";
  }, [planAccess]);

  const activeBranches = useMemo(
    () => (Array.isArray(branches) ? branches.filter((b) => b?.id) : []),
    [branches]
  );

  const selectedBranchId = useMemo(() => {
    if (isEdit) {
      return editing?.branch_id
        ? Number(editing.branch_id)
        : null;
    }

    return branchId ? Number(branchId) : null;
  }, [isEdit, editing, branchId]);

  const selectedBranchPolicy = useMemo(() => {
    if (!selectedBranchId) return null;

    if (!Array.isArray(warehouseOptionsByBranch)) {
      return null;
    }

    return (
      warehouseOptionsByBranch.find(
        (item) =>
          Number(item?.branch_id) ===
          Number(selectedBranchId)
      ) || null
    );
  }, [
    warehouseOptionsByBranch,
    selectedBranchId,
  ]);

  const warehouseAllowed = useMemo(() => {
    if (selectedBranchPolicy) {
      return selectedBranchPolicy?.warehouse_allowed === true;
    }

    /*
    * Respaldo de compatibilidad.
    * La página corregida siempre debe entregar selectedBranchPolicy.
    */
    return !!cashRegisterRequiresWarehouse;
  }, [
    selectedBranchPolicy,
    cashRegisterRequiresWarehouse,
  ]);

  const warehouseRequired = useMemo(() => {
    if (selectedBranchPolicy) {
      return selectedBranchPolicy?.warehouse_required === true;
    }

    return !!cashRegisterRequiresWarehouse;
  }, [
    selectedBranchPolicy,
    cashRegisterRequiresWarehouse,
  ]);

  const availableWarehouses = useMemo(() => {
    if (!warehouseAllowed) return [];

    const rows = Array.isArray(
      selectedBranchPolicy?.warehouses
    )
      ? selectedBranchPolicy.warehouses
      : [];

    return rows.filter((warehouse) => {
      if (!warehouse?.id) return false;

      if (
        warehouse?.status &&
        warehouse.status !== "active"
      ) {
        return false;
      }

      return true;
    });
  }, [
    selectedBranchPolicy,
    warehouseAllowed,
  ]);

  const inventoryMode = useMemo(() => {
    return (
      selectedBranchPolicy?.inventory_mode ||
      cashRegisterMeta?.inventory_mode ||
      "branch"
    );
  }, [
    selectedBranchPolicy,
    cashRegisterMeta,
  ]);

  const cashierDirectMode = useMemo(() => {
    return (
      selectedBranchPolicy?.cashier_direct_mode ||
      "disabled"
    );
  }, [selectedBranchPolicy]);

  const cashierDirectEnabled = useMemo(() => {
    const backendValue =
      selectedBranchPolicy?.cashier_direct_enabled;

    if (typeof backendValue === "boolean") {
      return backendValue;
    }

    return !["", "disabled"].includes(
      cashierDirectMode
    );
  }, [
    selectedBranchPolicy,
    cashierDirectMode,
  ]);

  const warehouseAllowedByPlan = useMemo(() => {
    const branchValue =
      selectedBranchPolicy?.warehouse_allowed_by_plan;

    if (typeof branchValue === "boolean") {
      return branchValue;
    }

    const metaValue =
      cashRegisterMeta?.plan_allows_warehouses;

    if (typeof metaValue === "boolean") {
      return metaValue;
    }

    /*
    * Respaldo de compatibilidad para respuestas anteriores
    * que todavía no incluyan la capacidad explícita del plan.
    */
    return warehouseAllowed;
  }, [
    selectedBranchPolicy,
    cashRegisterMeta,
    warehouseAllowed,
  ]);

  const hasOpenSession = useMemo(() => {
    return Boolean(
      editing?.has_open_session ||
      editing?.active_session ||
      editing?.activeSession
    );
  }, [editing]);

  const selectedWarehouseIsValid = useMemo(() => {
    if (!warehouseId) return true;

    return availableWarehouses.some(
      (warehouse) =>
        Number(warehouse.id) === Number(warehouseId)
    );
  }, [
    availableWarehouses,
    warehouseId,
  ]);

  const currentWarehouseNeedsCorrection = useMemo(() => {
    if (!isEdit) return false;

    if (editing?.warehouse_policy?.ok === false) {
      return true;
    }

    if (!editing?.warehouse_id) {
      return false;
    }

    return !availableWarehouses.some(
      (warehouse) =>
        Number(warehouse.id) ===
        Number(editing.warehouse_id)
    );
  }, [
    isEdit,
    editing,
    availableWarehouses,
  ]);

  const warehouseHelp = useMemo(() => {
    if (!selectedBranchId) {
      return "Selecciona una sucursal para consultar sus almacenes disponibles.";
    }

    /*
    * Primera causa posible:
    * el plan no permite utilizar almacenes.
    */
    if (!warehouseAllowedByPlan) {
      return "Tu plan actual no permite utilizar almacenes. La caja debe operar sin almacén asignado.";
    }

    /*
    * Segunda causa posible:
    * el plan sí permite almacenes, pero la venta directa
    * está desactivada en esta sucursal.
    */
    if (!cashierDirectEnabled) {
      return "La venta directa desde caja está desactivada en esta sucursal, por lo que la caja no debe tener almacén asignado.";
    }

    /*
    * Respaldo ante alguna combinación futura donde el backend
    * indique que no está permitido sin corresponder a las
    * dos causas anteriores.
    */
    if (!warehouseAllowed) {
      return "La caja debe operar sin almacén asignado.";
    }

    if (hasOpenSession) {
      return "Esta caja tiene una sesión abierta. Debes cerrar la sesión antes de cambiar su almacén.";
    }

    const modeDescription =
      inventoryMode === "global"
        ? "Solo se muestran almacenes globales válidos para el restaurante."
        : "Solo se muestran almacenes pertenecientes a esta sucursal.";

    if (warehouseRequired) {
      return `${currentPlanName}: el almacén es obligatorio. ${modeDescription}`;
    }

    return `${currentPlanName}: el almacén es opcional. ${modeDescription}`;
  }, [
    selectedBranchId,
    warehouseAllowedByPlan,
    cashierDirectEnabled,
    warehouseAllowed,
    hasOpenSession,
    inventoryMode,
    warehouseRequired,
    currentPlanName,
  ]);

  const selectedBranchLabel = useMemo(() => {
    if (!editing?.branch_id) return "—";
    const branch = activeBranches.find(
      (item) => Number(item.id) === Number(editing.branch_id)
    );
    return branch?.name || editing?.branch?.name || `Sucursal ${editing.branch_id}`;
  }, [activeBranches, editing]);

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

  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      setBranchId(
        editing?.branch_id
          ? String(editing.branch_id)
          : ""
      );

      setWarehouseId("");
      setName(editing?.name || "");
      setCode(editing?.code || "");
      setIsActive(
        (editing?.status || "active") === "active"
      );

      return;
    }

    setBranchId(
      activeBranches?.[0]?.id
        ? String(activeBranches[0].id)
        : ""
    );

    setWarehouseId("");
    setName("");
    setCode("");
    setIsActive(true);
  }, [
    open,
    isEdit,
    editing,
    activeBranches,
  ]);

  useEffect(() => {
    if (!open) return;

    if (!selectedBranchId || !warehouseAllowed) {
      setWarehouseId("");
      return;
    }

    const validWarehouseIds = availableWarehouses.map(
      (warehouse) => Number(warehouse.id)
    );

    setWarehouseId((currentValue) => {
      if (
        currentValue &&
        validWarehouseIds.includes(
          Number(currentValue)
        )
      ) {
        return currentValue;
      }

      if (
        isEdit &&
        editing?.warehouse_id &&
        validWarehouseIds.includes(
          Number(editing.warehouse_id)
        )
      ) {
        return String(editing.warehouse_id);
      }

      /*
      * En creación se selecciona automáticamente el primer
      * almacén solamente cuando es obligatorio.
      */
      if (
        !isEdit &&
        warehouseRequired &&
        availableWarehouses[0]?.id
      ) {
        return String(
          availableWarehouses[0].id
        );
      }

      return "";
    });
  }, [
    open,
    selectedBranchId,
    warehouseAllowed,
    warehouseRequired,
    availableWarehouses,
    isEdit,
    editing?.warehouse_id,
  ]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;

    if (!isEdit && !branchId) {
      return false;
    }

    if (
      warehouseAllowed &&
      warehouseRequired &&
      !warehouseId
    ) {
      return false;
    }

    if (
      warehouseId &&
      !selectedWarehouseIsValid
    ) {
      return false;
    }

    if (
      isEdit &&
      hasOpenSession
    ) {
      const currentWarehouseId =
        editing?.warehouse_id
          ? Number(editing.warehouse_id)
          : null;

      const requestedWarehouseId =
        warehouseId
          ? Number(warehouseId)
          : null;

      if (
        currentWarehouseId !==
        requestedWarehouseId
      ) {
        return false;
      }
    }

    return true;
  }, [
    name,
    branchId,
    isEdit,
    warehouseAllowed,
    warehouseRequired,
    warehouseId,
    selectedWarehouseIsValid,
    hasOpenSession,
    editing,
  ]);

  const save = async () => {
    if (!name.trim()) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "El nombre de la caja es obligatorio.",
      });
      return;
    }

    if (!isEdit && !branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal para continuar.",
      });
      return;
    }

    if (
      warehouseAllowed &&
      warehouseRequired &&
      !warehouseId
    ) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          "Selecciona un almacén válido para esta caja.",
      });

      return;
    }

    if (
      warehouseId &&
      !selectedWarehouseIsValid
    ) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message:
          "El almacén seleccionado ya no es válido para esta sucursal.",
      });

      return;
    }

    if (
      isEdit &&
      hasOpenSession
    ) {
      const currentWarehouseId =
        editing?.warehouse_id
          ? Number(editing.warehouse_id)
          : null;

      const requestedWarehouseId =
        warehouseId
          ? Number(warehouseId)
          : null;

      if (
        currentWarehouseId !==
        requestedWarehouseId
      ) {
        showAlert({
          severity: "warning",
          title: "Sesión abierta",
          message:
            "Debes cerrar la sesión de caja antes de cambiar el almacén.",
        });

        return;
      }
    }

    setSaving(true);

    try {
      let saved;

      const warehousePayload =
        warehouseAllowed && warehouseId
          ? Number(warehouseId)
          : null;

      if (isEdit) {
        saved = await api.updateCashRegister(restaurantId, editing.id, {
          name: name.trim(),
          code: code.trim() || null,
          warehouse_id: warehousePayload,
        });
      } else {
        saved = await api.createCashRegister(restaurantId, {
          branch_id: Number(branchId),
          warehouse_id: warehousePayload,
          name: name.trim(),
          code: code.trim() || null,
          status: isActive ? "active" : "inactive",
        });
      }

      await onSaved?.(saved, isEdit ? "edit" : "create");
    } catch (e) {
      const errors = e?.response?.data?.errors;
      const firstError =
        errors && typeof errors === "object"
          ? Object.values(errors)?.flat()?.[0]
          : null;

      showAlert({
        severity: "error",
        title: "Error",
        message:
          firstError ||
          e?.response?.data?.message ||
          "No se pudo guardar la caja",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={saving ? undefined : onClose}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              borderRadius: { xs: 0, sm: 1 },
              overflow: "hidden",
              backgroundColor: "background.paper",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            bgcolor: "#111111",
            color: "#fff",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 20, sm: 24 },
                  lineHeight: 1.2,
                  color: "#fff",
                }}
              >
                {title}
              </Typography>

              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                {isEdit
                  ? "Actualiza el nombre, código o almacén de la caja."
                  : "Crea una caja para organizar el flujo de cobro por sucursal."}
              </Typography>
            </Box>

            <IconButton
              onClick={onClose}
              disabled={saving}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.08)",
                borderRadius: 1,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.16)",
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
          }}
        >
          <Card
            sx={{
              borderRadius: 0,
              backgroundColor: "background.paper",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={2.5}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: 18, sm: 20 },
                    color: "text.primary",
                  }}
                >
                  Datos de la caja
                </Typography>

                <Stack spacing={2}>
                  {isEdit ? (
                    <FieldBlock
                      label="Sucursal"
                      input={
                        <TextField
                          value={selectedBranchLabel}
                          disabled
                        />
                      }
                    />
                  ) : (
                    <FieldBlock
                      label="Sucursal *"
                      input={
                        <TextField
                          select
                          value={branchId}
                          onChange={(e) => {
                            setBranchId(e.target.value);
                            setWarehouseId("");
                          }}
                        >
                          {activeBranches.map((branch) => (
                            <MenuItem key={branch.id} value={String(branch.id)}>
                              {branch.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      }
                    />
                  )}

                  {warehouseAllowed ? (
                    <FieldBlock
                      label={
                        warehouseRequired
                          ? "Almacén *"
                          : "Almacén"
                      }
                      help={warehouseHelp}
                      input={
                        <Stack spacing={1}>
                          <TextField
                            select
                            value={warehouseId}
                            onChange={(e) =>
                              setWarehouseId(e.target.value)
                            }
                            disabled={
                              !selectedBranchId ||
                              hasOpenSession ||
                              availableWarehouses.length === 0
                            }
                            helperText={
                              availableWarehouses.length === 0
                                ? "No hay almacenes válidos disponibles para esta sucursal y modo de inventario."
                                : ""
                            }
                          >
                            {!warehouseRequired ? (
                              <MenuItem value="">
                                Sin almacén
                              </MenuItem>
                            ) : null}

                            {availableWarehouses.map(
                              (warehouse) => (
                                <MenuItem
                                  key={warehouse.id}
                                  value={String(warehouse.id)}
                                >
                                  {warehouse.name}
                                </MenuItem>
                              )
                            )}
                          </TextField>

                          {currentWarehouseNeedsCorrection ? (
                            <Typography
                              sx={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: "error.main",
                                lineHeight: 1.45,
                              }}
                            >
                              {editing?.warehouse_policy?.message ||
                                "El almacén actual ya no es válido. Selecciona uno compatible antes de guardar."}
                            </Typography>
                          ) : null}
                        </Stack>
                      }
                    />
                  ) : (
                    <FieldBlock
                      label="Almacén"
                      help={warehouseHelp}
                      input={
                        <TextField
                          value="Sin almacén permitido"
                          disabled
                        />
                      }
                    />
                  )}

                  <Box
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      bgcolor: "background.default",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        color: "text.secondary",
                        lineHeight: 1.55,
                      }}
                    >
                      Modo de inventario:{" "}
                      <strong>
                        {inventoryMode === "global"
                          ? "Global"
                          : "Por sucursal"}
                      </strong>
                      {" · "}
                      Venta directa:{" "}
                      <strong>
                        {cashierDirectEnabled
                          ? "Activada"
                          : "Desactivada"}
                      </strong>
                    </Typography>
                  </Box>

                  <FieldBlock
                    label="Nombre *"
                    input={
                      <TextField
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ej. Caja principal"
                      />
                    }
                  />

                  <FieldBlock
                    label="Código"
                    help="Opcional. Puedes usar un identificador corto como CAJA-01."
                    input={
                      <TextField
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ej. CAJA-01"
                      />
                    }
                  />

                  {!isEdit ? (
                    <Box sx={{ flex: 1, width: "100%" }}>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: "text.primary",
                          mb: 1,
                        }}
                      >
                        Estado inicial
                      </Typography>

                      <FormControlLabel
                        sx={{ m: 0 }}
                        control={
                          <Switch
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Typography sx={switchLabelSx}>
                            {isActive ? "Activo" : "Inactivo"}
                          </Typography>
                        }
                      />
                    </Box>
                  ) : null}
                </Stack>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  justifyContent="flex-end"
                  spacing={1.5}
                  pt={1}
                >
                  <Button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    variant="outlined"
                    sx={{
                      minWidth: { xs: "100%", sm: 150 },
                      height: 44,
                      borderRadius: 2,
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    type="button"
                    onClick={save}
                    disabled={!canSave || saving}
                    variant="contained"
                    startIcon={<SaveIcon />}
                    sx={{
                      minWidth: { xs: "100%", sm: 180 },
                      height: 44,
                      borderRadius: 2,
                      fontWeight: 800,
                    }}
                  >
                    {saving ? "Guardando…" : "Guardar"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>

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

function FieldBlock({ label, input, help }) {
  return (
    <Box sx={{ flex: 1, width: "100%" }}>
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 800,
          color: "text.primary",
          mb: 1,
        }}
      >
        {label}
      </Typography>

      {input}

      {help ? (
        <Typography
          sx={{
            mt: 0.75,
            fontSize: 12,
            color: "text.secondary",
            lineHeight: 1.45,
          }}
        >
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}

const switchLabelSx = {
  fontSize: 14,
  fontWeight: 700,
  color: "text.primary",
};