import { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import WarehousesHeader from "../../../components/inventory/warehouses/WarehousesHeader";
import WarehouseInstructionsCard from "../../../components/inventory/warehouses/WarehouseInstructionsCard";
import WarehouseContextCard from "../../../components/inventory/warehouses/WarehouseContextCard";
import WarehousesListPanel from "../../../components/inventory/warehouses/WarehousesListPanel";
import WarehouseUpsertModal from "../../../components/inventory/warehouses/WarehouseUpsertModal";

import { getRestaurantSettings } from "../../../services/restaurant/restaurantSettings.service";
import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  ensureDefaultWarehouses,
} from "../../../services/inventory/warehouses/warehouses.service";

export default function WarehousesPage() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [savingDefaults, setSavingDefaults] = useState(false);

  const [settings, setSettings] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");

  const [warehouses, setWarehouses] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);

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

  const inventoryMode = settings?.inventory_mode || "branch";
  const requiresBranch = inventoryMode === "branch";

  const selectedBranch = useMemo(() => {
    if (!requiresBranch) return null;
    return branches.find((b) => String(b.id) === String(branchId)) || null;
  }, [branches, requiresBranch, branchId]);

  const sortedWarehouses = useMemo(() => {
    return [...warehouses].sort((a, b) => {
      const byDefault = Number(b.is_default) - Number(a.is_default);
      if (byDefault !== 0) return byDefault;

      const byStatus =
        String(a.status || "").localeCompare(String(b.status || ""), "es", {
          sensitivity: "base",
        });
      if (byStatus !== 0) return byStatus;

      return String(a.name || "").localeCompare(String(b.name || ""), "es", {
        sensitivity: "base",
      });
    });
  }, [warehouses]);

  const loadWarehouses = async ({
    inventoryModeOverride,
    branchIdOverride,
  } = {}) => {
    const mode = inventoryModeOverride || inventoryMode;
    const currentBranchId =
      branchIdOverride !== undefined ? branchIdOverride : branchId;

    const response = await getWarehouses(restaurantId, {
      scope: mode === "global" ? "global" : "branch",
      ...(mode === "branch" && currentBranchId
        ? { branch_id: Number(currentBranchId) }
        : {}),
    });

    const rows = Array.isArray(response?.data) ? response.data : [];
    setWarehouses(rows);
    return rows;
  };

  const loadAll = async () => {
    setLoading(true);

    try {
      const st = await getRestaurantSettings(restaurantId);
      setSettings(st);

      if (st?.inventory_mode === "branch") {
        let loadedBranches = await getBranchesByRestaurant(restaurantId);
        loadedBranches = Array.isArray(loadedBranches) ? loadedBranches : [];
        setBranches(loadedBranches);

        const nextBranchId =
          loadedBranches?.[0]?.id ? String(loadedBranches[0].id) : "";

        setBranchId(nextBranchId);

        if (nextBranchId) {
          const response = await getWarehouses(restaurantId, {
            scope: "branch",
            branch_id: Number(nextBranchId),
          });
          setWarehouses(Array.isArray(response?.data) ? response.data : []);
        } else {
          setWarehouses([]);
        }
      } else {
        setBranches([]);
        setBranchId("");

        const response = await getWarehouses(restaurantId, {
          scope: "global",
        });
        setWarehouses(Array.isArray(response?.data) ? response.data : []);
      }
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo cargar la configuración de almacenes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  useEffect(() => {
    if (!requiresBranch) return;
    if (!branchId) {
      setWarehouses([]);
      return;
    }

    (async () => {
      try {
        await loadWarehouses({
          inventoryModeOverride: "branch",
          branchIdOverride: branchId,
        });
      } catch (e) {
        showAlert({
          severity: "error",
          title: "Error",
          message:
            e?.response?.data?.message ||
            "No se pudieron cargar los almacenes de la sucursal.",
        });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requiresBranch, branchId, restaurantId]);

  const openCreate = () => {
    setEditingWarehouse(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingWarehouse(row);
    setModalOpen(true);
  };

  const handleEnsureDefaults = async () => {
    setSavingDefaults(true);

    try {
      const res = await ensureDefaultWarehouses(restaurantId);
      const created = Array.isArray(res?.data) ? res.data : [];

      if (created.length > 0) {
        await loadWarehouses();
      }

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          created.length > 0
            ? `Se verificaron y generaron ${created.length} almacén(es) base.`
            : "Los almacenes base ya estaban correctos.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudieron verificar los almacenes base.",
      });
    } finally {
      setSavingDefaults(false);
    }
  };

  const handleSaveWarehouse = async (formData, editing) => {
    try {
      if (editing?.id) {
        const res = await updateWarehouse(restaurantId, editing.id, formData);
        const updated = res?.data;

        setWarehouses((prev) => {
          let next = prev.map((item) =>
            item.id === updated.id ? updated : item
          );

          if (updated?.is_default) {
            next = next.map((item) => {
              const sameContext =
                item.scope === updated.scope &&
                Number(item.branch_id || 0) === Number(updated.branch_id || 0);

              if (!sameContext) return item;
              if (item.id === updated.id) return item;
              return { ...item, is_default: false };
            });
          }

          return next;
        });

        showAlert({
          severity: "success",
          title: "Hecho",
          message: "Almacén actualizado correctamente.",
        });
      } else {
        const res = await createWarehouse(restaurantId, formData);
        const created = res?.data;

        setWarehouses((prev) => {
          let next = [created, ...prev];

          if (created?.is_default) {
            next = next.map((item) => {
              const sameContext =
                item.scope === created.scope &&
                Number(item.branch_id || 0) === Number(created.branch_id || 0);

              if (!sameContext) return item;
              if (item.id === created.id) return item;
              return { ...item, is_default: false };
            });
          }

          return next;
        });

        showAlert({
          severity: "success",
          title: "Hecho",
          message: "Almacén creado correctamente.",
        });
      }

      setModalOpen(false);
      setEditingWarehouse(null);
    } catch (e) {
      throw e;
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const nextStatus = row.status === "active" ? "inactive" : "active";

      const res = await updateWarehouse(restaurantId, row.id, {
        status: nextStatus,
      });

      const updated = res?.data;

      setWarehouses((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Estado del almacén actualizado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo actualizar el estado del almacén.",
      });
    }
  };

  const handleToggleDefault = async (row) => {
    try {
      const res = await updateWarehouse(restaurantId, row.id, {
        is_default: !row.is_default,
      });

      const updated = res?.data;

      setWarehouses((prev) => {
        let next = prev.map((item) =>
          item.id === updated.id ? updated : item
        );

        if (updated?.is_default) {
          next = next.map((item) => {
            const sameContext =
              item.scope === updated.scope &&
              Number(item.branch_id || 0) === Number(updated.branch_id || 0);

            if (!sameContext) return item;
            if (item.id === updated.id) return item;
            return { ...item, is_default: false };
          });
        }

        return next;
      });

      showAlert({
        severity: "success",
        title: "Hecho",
        message: "Almacén default actualizado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message ||
          "No se pudo actualizar el almacén default.",
      });
    }
  };

  const handleGoIngredientStocks = (row) => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/warehouses/${row.id}/ingredient-stocks`
    );
  };

  const handleGoIngredientMovements = (row) => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/warehouses/${row.id}/ingredient-movements`
    );
  };

  const handleGoProductStocks = (row) => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/warehouses/${row.id}/product-stocks`
    );
  };

  const handleGoProductMovements = (row) => {
    navigate(
      `/owner/restaurants/${restaurantId}/operation/warehouses/${row.id}/product-movements`
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "60vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Stack spacing={2} alignItems="center">
            <CircularProgress color="primary" />
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              Cargando almacenes…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <WarehousesHeader
          inventoryMode={inventoryMode}
          onCreate={openCreate}
          onEnsureDefaults={handleEnsureDefaults}
          ensuringDefaults={savingDefaults}
        />

        <WarehouseInstructionsCard inventoryMode={inventoryMode} />

        <WarehouseContextCard
          inventoryMode={inventoryMode}
          branches={branches}
          branchId={branchId}
          onChangeBranch={setBranchId}
          selectedBranch={selectedBranch}
        />

        <WarehousesListPanel
          inventoryMode={inventoryMode}
          branchName={selectedBranch?.name || null}
          warehouses={sortedWarehouses}
          onEdit={openEdit}
          onToggleStatus={handleToggleStatus}
          onToggleDefault={handleToggleDefault}
          onGoIngredientStocks={handleGoIngredientStocks}
          onGoIngredientMovements={handleGoIngredientMovements}
          onGoProductStocks={handleGoProductStocks}
          onGoProductMovements={handleGoProductMovements}
        />
      </Stack>

      <WarehouseUpsertModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingWarehouse(null);
        }}
        inventoryMode={inventoryMode}
        editing={editingWarehouse}
        selectedBranch={selectedBranch}
        onSave={handleSaveWarehouse}
      />

      <AppAlert
        open={alertState.open}
        onClose={closeAlert}
        severity={alertState.severity}
        title={alertState.title}
        message={alertState.message}
        autoHideDuration={4000}
      />
    </PageContainer>
  );
}
