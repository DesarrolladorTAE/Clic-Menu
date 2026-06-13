import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Card, CardContent, Dialog, DialogContent, DialogTitle, FormControlLabel, IconButton, MenuItem, Stack,
  Switch, TextField, Typography, useMediaQuery, CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";

import AppAlert from "../../components/common/AppAlert";
import { getWarehouses } from "../../services/inventory/warehouses/warehouses.service";

export default function CashRegisterUpsertModal({
  open,
  onClose,
  restaurantId,
  branches,
  editing,
  planAccess,
  cashRegisterRequiresWarehouse = false,
  onSaved,
  api,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [warehouses, setWarehouses] = useState([]);

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

  const activeWarehouses = useMemo(() => {
    if (!Array.isArray(warehouses)) return [];

    return warehouses.filter((warehouse) => {
      if (!warehouse?.id) return false;
      if (warehouse?.status && warehouse.status !== "active") return false;
      return true;
    });
  }, [warehouses]);

  const availableWarehouses = useMemo(() => {
    if (!branchId) return activeWarehouses;

    return activeWarehouses.filter((warehouse) => {
      const warehouseBranchId = warehouse?.branch_id;

      return (
        warehouseBranchId === null ||
        warehouseBranchId === undefined ||
        Number(warehouseBranchId) === Number(branchId) ||
        warehouse?.scope === "global" ||
        warehouse?.is_global === true
      );
    });
  }, [activeWarehouses, branchId]);

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
      setBranchId(String(editing?.branch_id || ""));
      setWarehouseId(editing?.warehouse_id ? String(editing.warehouse_id) : "");
      setName(editing?.name || "");
      setCode(editing?.code || "");
      setIsActive((editing?.status || "active") === "active");
    } else {
      setBranchId(activeBranches?.[0]?.id ? String(activeBranches[0].id) : "");
      setWarehouseId("");
      setName("");
      setCode("");
      setIsActive(true);
    }
  }, [open, isEdit, editing, activeBranches]);

  useEffect(() => {
    if (!open) return;

    const selectedBranchId = isEdit
      ? editing?.branch_id
      : branchId;

    if (!cashRegisterRequiresWarehouse || !selectedBranchId) {
      setWarehouses([]);
      setWarehouseId("");
      return;
    }

    let alive = true;

    const loadWarehouses = async () => {
      setLoadingWarehouses(true);

      try {
        const response = await getWarehouses(restaurantId, {
          status: "active",
        });

        const rows = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        if (!alive) return;

        setWarehouses(rows);

        if (!isEdit) {
          const firstWarehouse = rows.find((warehouse) => warehouse?.id);
          setWarehouseId(firstWarehouse?.id ? String(firstWarehouse.id) : "");
        } else if (editing?.warehouse_id) {
          setWarehouseId(String(editing.warehouse_id));
        }
      } catch (e) {
        if (!alive) return;

        setWarehouses([]);

        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar los almacenes disponibles.",
        });
      } finally {
        if (alive) {
          setLoadingWarehouses(false);
        }
      }
    };

    loadWarehouses();

    return () => {
      alive = false;
    };
  }, [
    open,
    restaurantId,
    branchId,
    isEdit,
    editing,
    cashRegisterRequiresWarehouse,
  ]);

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (!isEdit && !branchId) return false;
    if (cashRegisterRequiresWarehouse && !warehouseId) return false;
    return true;
  }, [name, branchId, isEdit, cashRegisterRequiresWarehouse, warehouseId]);

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

    if (cashRegisterRequiresWarehouse && !warehouseId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona un almacén para esta caja.",
      });
      return;
    }

    setSaving(true);

    try {
      let saved;

      const warehousePayload = cashRegisterRequiresWarehouse
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

                  {cashRegisterRequiresWarehouse ? (
                    <FieldBlock
                      label="Almacén *"
                      help={`${currentPlanName}: si la venta directa está activa, esta caja necesita un almacén asignado.`}
                      input={
                        <TextField
                          select
                          value={warehouseId}
                          onChange={(e) => setWarehouseId(e.target.value)}
                          disabled={loadingWarehouses || !branchId}
                          helperText={
                            loadingWarehouses
                              ? "Cargando almacenes..."
                              : availableWarehouses.length === 0
                                ? "No hay almacenes activos disponibles para esta sucursal."
                                : ""
                          }
                          InputProps={{
                            endAdornment: loadingWarehouses ? (
                              <CircularProgress size={18} sx={{ mr: 2 }} />
                            ) : null,
                          }}
                        >
                          {availableWarehouses.map((warehouse) => (
                            <MenuItem key={warehouse.id} value={String(warehouse.id)}>
                              {warehouse.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      }
                    />
                  ) : (
                    <FieldBlock
                      label="Almacén"
                      help={`${currentPlanName}: esta caja puede operar sin almacén para productos simples sin inventario.`}
                      input={
                        <TextField
                          value="Sin almacén requerido"
                          disabled
                        />
                      }
                    />
                  )}

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
                    disabled={!canSave || saving || loadingWarehouses}
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