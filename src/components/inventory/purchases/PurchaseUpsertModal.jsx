import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AppAlert from "../../common/AppAlert";

export default function PurchaseUpsertModal({
  open,
  onClose,
  editing,
  branches = [],
  suppliers = [],
  warehouses = [],
  inventoryMode = "branch",
  onSave,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const isEdit = !!editing?.id;

  const [saving, setSaving] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [notes, setNotes] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const title = useMemo(
    () => (isEdit ? "Editar compra" : "Nueva compra"),
    [isEdit]
  );

  const filteredWarehouses = useMemo(() => {
    const activeWarehouses = Array.isArray(warehouses)
      ? warehouses.filter((item) => item?.status === "active")
      : [];

    if (inventoryMode === "global") {
      return activeWarehouses.filter(
        (item) => item?.scope === "global" && item?.branch_id == null
      );
    }

    if (!branchId) return [];

    return activeWarehouses.filter(
      (item) =>
        item?.scope === "branch" &&
        String(item?.branch_id || "") === String(branchId)
    );
  }, [warehouses, inventoryMode, branchId]);

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
      setBranchId(editing?.branch_id ? String(editing.branch_id) : "");
      setWarehouseId(editing?.warehouse_id ? String(editing.warehouse_id) : "");
      setSupplierId(editing?.supplier_id ? String(editing.supplier_id) : "");
      setPurchaseDate(editing?.purchase_date || "");
      setNotes(editing?.notes || "");
    } else {
      setBranchId("");
      setWarehouseId("");
      setSupplierId("");
      setPurchaseDate(new Date().toISOString().slice(0, 10));
      setNotes("");
    }
  }, [open, isEdit, editing]);

  useEffect(() => {
    if (!open) return;

    if (!warehouseId) return;

    const existsInFiltered = filteredWarehouses.some(
      (item) => String(item.id) === String(warehouseId)
    );

    if (!existsInFiltered) {
      setWarehouseId("");
    }
  }, [filteredWarehouses, warehouseId, open]);

  const canSave = !!branchId && !!warehouseId && !!purchaseDate;

  const handleBranchChange = (value) => {
    setBranchId(value);
  };

  const handleSave = async () => {
    if (!branchId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona una sucursal.",
      });
      return;
    }

    if (!warehouseId) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona un almacén destino.",
      });
      return;
    }

    if (!purchaseDate) {
      showAlert({
        severity: "warning",
        title: "Nota",
        message: "Selecciona la fecha de compra.",
      });
      return;
    }

    setSaving(true);

    try {
      await onSave({
        branch_id: Number(branchId),
        warehouse_id: Number(warehouseId),
        supplier_id: supplierId ? Number(supplierId) : null,
        purchase_date: purchaseDate,
        notes: notes.trim() || null,
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo guardar la compra.",
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
                  ? "Actualiza la cabecera de la compra draft."
                  : "Crea una nueva compra en estado draft."}
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
                  Datos de la compra
                </Typography>

                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock label="Sucursal *">
                      <FormControl fullWidth>
                        <Select
                          value={branchId}
                          onChange={(e) => handleBranchChange(e.target.value)}
                          displayEmpty
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="">Selecciona una sucursal</MenuItem>
                          {branches.map((branch) => (
                            <MenuItem key={branch.id} value={String(branch.id)}>
                              {branch.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </FieldBlock>

                    <FieldBlock label="Almacén *">
                      <FormControl fullWidth>
                        <Select
                          value={warehouseId}
                          onChange={(e) => setWarehouseId(e.target.value)}
                          displayEmpty
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="">
                            {branchId
                              ? "Selecciona un almacén"
                              : "Primero selecciona una sucursal"}
                          </MenuItem>

                          {filteredWarehouses.map((warehouse) => (
                            <MenuItem
                              key={warehouse.id}
                              value={String(warehouse.id)}
                            >
                              {warehouse.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: 12,
                          color: "text.secondary",
                        }}
                      >
                        {inventoryMode === "global"
                          ? "Se muestran almacenes globales activos del restaurante."
                          : "Se muestran almacenes activos de la sucursal seleccionada."}
                      </Typography>
                    </FieldBlock>
                  </Stack>

                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <FieldBlock label="Proveedor">
                      <FormControl fullWidth>
                        <Select
                          value={supplierId}
                          onChange={(e) => setSupplierId(e.target.value)}
                          displayEmpty
                          IconComponent={KeyboardArrowDownIcon}
                        >
                          <MenuItem value="">Sin proveedor</MenuItem>
                          {suppliers.map((supplier) => (
                            <MenuItem
                              key={supplier.id}
                              value={String(supplier.id)}
                            >
                              {supplier.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </FieldBlock>

                    <FieldBlock label="Fecha de compra *">
                      <TextField
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </FieldBlock>
                  </Stack>

                  <FieldBlock label="Notas">
                    <TextField
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Opcional"
                      multiline
                      minRows={4}
                    />
                  </FieldBlock>
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
                    onClick={handleSave}
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

function FieldBlock({ label, children }) {
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
      {children}
    </Box>
  );
}
