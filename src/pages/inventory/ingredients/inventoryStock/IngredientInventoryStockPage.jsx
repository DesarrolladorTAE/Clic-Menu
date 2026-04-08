import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SettingsIcon from "@mui/icons-material/Settings";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";

import InventoryWarehouseContextCard from "../../../../components/inventory/shared/stock/InventoryWarehouseContextCard";
import InventoryStockSummaryCards from "../../../../components/inventory/shared/stock/InventoryStockSummaryCards";
import IngredientInventoryStockFilters from "../../../../components/inventory/ingredients/inventoryStock/IngredientInventoryStockFilters";
import IngredientInventoryStockTable from "../../../../components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable";

import { getIngredientInventoryStocks } from "../../../../services/inventory/ingredients/inventoryStock/inventoryStock.service";
import { updateIngredient } from "../../../../services/inventory/ingredients/ingredients.service";
import { normalizeErr } from "../../../../utils/err";

const PAGE_SIZE = 5;

export default function IngredientInventoryStockPage() {
  const nav = useNavigate();
  const { restaurantId, warehouseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [warehouse, setWarehouse] = useState(null);
  const [rows, setRows] = useState([]);

  const [q, setQ] = useState("");
  const [onlyPositive, setOnlyPositive] = useState(false);
  const [groupId, setGroupId] = useState("");

  const [alertState, setAlertState] = useState({
    open: false,
    severity: "error",
    title: "",
    message: "",
  });

  const reqRef = useRef(0);

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

  const load = async ({ initial = false } = {}) => {
    const myReq = ++reqRef.current;

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await getIngredientInventoryStocks(restaurantId, warehouseId, {
        q,
        ingredient_group_id: groupId,
        only_positive: onlyPositive,
      });

      if (myReq !== reqRef.current) return;

      setWarehouse(res?.data?.warehouse || null);
      setRows(Array.isArray(res?.data?.stocks) ? res.data.stocks : []);
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo cargar el stock de ingredientes."),
      });
    } finally {
      if (myReq !== reqRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load({ initial: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, warehouseId]);

  useEffect(() => {
    const t = setTimeout(() => load({ initial: false }), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, onlyPositive, groupId]);

  const groupOptions = useMemo(() => {
    const map = new Map();

    rows.forEach((row) => {
      const ing = row.ingredient || {};
      if (!ing.ingredient_group_id) return;
      if (map.has(ing.ingredient_group_id)) return;

      map.set(ing.ingredient_group_id, {
        value: ing.ingredient_group_id,
        label: ing.group_name || `Grupo ${ing.ingredient_group_id}`,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a.label).localeCompare(String(b.label), "es", {
        sensitivity: "base",
      })
    );
  }, [rows]);

  const onToggleStatus = async (row) => {
    const ing = row.ingredient || {};
    const nextStatus = ing.status === "active" ? "inactive" : "active";

    const snapshot = rows;
    setRows((prev) =>
      prev.map((x) =>
        x.id === row.id
          ? {
              ...x,
              ingredient: {
                ...x.ingredient,
                status: nextStatus,
              },
            }
          : x
      )
    );

    try {
      await updateIngredient(restaurantId, ing.id, {
        name: ing.name,
        unit: ing.unit,
        ingredient_group_id: ing.ingredient_group_id ?? null,
        is_stock_item: !!ing.is_stock_item,
        waste_percentage: ing.waste_percentage ?? null,
        code: ing.code ?? null,
        status: nextStatus,
      });

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          nextStatus === "active"
            ? "Ingrediente activado correctamente."
            : "Ingrediente inactivado correctamente.",
      });
    } catch (e) {
      setRows(snapshot);
      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo actualizar el estado."),
      });
    }
  };

  const onOpenIngredientConfig = (row) => {
    const ing = row.ingredient || {};
    nav(`/owner/restaurants/${restaurantId}/operation/ingredients`, {
      state: {
        focusIngredientId: ing.id,
      },
    });
  };

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
    items: rows,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

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
              Cargando stock de ingredientes…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 30, md: 42 },
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.1,
              }}
            >
              Stock de ingredientes
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 15, md: 18 },
              }}
            >
              Consulta existencias, costos y estado operativo de los
              ingredientes inventariables de este almacén.
            </Typography>

            {refreshing ? (
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 13,
                  color: "text.secondary",
                }}
              >
                Actualizando cambios…
              </Typography>
            ) : null}
          </Box>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.5}
            width={{ xs: "100%", md: "auto" }}
          >
            <Button
              onClick={() =>
                nav(`/owner/restaurants/${restaurantId}/operation/warehouses`)
              }
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 170 },
                height: 44,
                borderRadius: 2,
              }}
            >
              Volver a almacenes
            </Button>

            <Button
              onClick={() =>
                nav(`/owner/restaurants/${restaurantId}/operation/ingredients`)
              }
              variant="contained"
              startIcon={<SettingsIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 210 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Configuración ingredientes
            </Button>
          </Stack>
        </Stack>

        <InventoryWarehouseContextCard warehouse={warehouse} />

        <InventoryStockSummaryCards items={rows} />

        <IngredientInventoryStockFilters
          q={q}
          onChangeQ={setQ}
          onlyPositive={onlyPositive}
          onChangeOnlyPositive={setOnlyPositive}
          groupId={groupId}
          onChangeGroupId={setGroupId}
          groupOptions={groupOptions}
          total={rows.length}
        />

        <IngredientInventoryStockTable
          rows={rows}
          paginatedItems={paginatedItems}
          page={page}
          totalPages={totalPages}
          startItem={startItem}
          endItem={endItem}
          total={total}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={prevPage}
          onNext={nextPage}
          onOpenIngredientConfig={onOpenIngredientConfig}
          onToggleStatus={onToggleStatus}
        />
      </Stack>

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