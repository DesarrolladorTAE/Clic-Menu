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
import ProductInventoryStockFilters from "../../../../components/inventory/products/inventoryStock/ProductInventoryStockFilters";
import ProductInventoryStockTable from "../../../../components/inventory/products/inventoryStock/ProductInventoryStockTable";

import { getCategories } from "../../../../services/menu/categories.service";
import { getProductInventoryStocks } from "../../../../services/inventory/products/inventoryStock/inventoryStock.service";
import { updateProduct } from "../../../../services/products/products.service";
import { normalizeErr } from "../../../../utils/err";

const PAGE_SIZE = 5;

export default function ProductInventoryStockPage() {
  const nav = useNavigate();
  const { restaurantId, warehouseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [warehouse, setWarehouse] = useState(null);
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);

  const [q, setQ] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [onlyPositive, setOnlyPositive] = useState(false);

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
      const res = await getProductInventoryStocks(restaurantId, warehouseId, {
        q,
        category_id: categoryId,
        status,
        only_positive: onlyPositive,
      });

      if (myReq !== reqRef.current) return;

      const nextWarehouse = res?.data?.warehouse || null;
      setWarehouse(nextWarehouse);
      setRows(Array.isArray(res?.data?.stocks) ? res.data.stocks : []);

      const catRes = await getCategories(restaurantId, {
        status: "active",
        ...(nextWarehouse?.branch_id ? { branch_id: nextWarehouse.branch_id } : {}),
      });

      if (myReq !== reqRef.current) return;
      setCategories(Array.isArray(catRes) ? catRes : []);
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(e, "No se pudo cargar el stock de productos."),
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
  }, [q, categoryId, status, onlyPositive]);

  const onToggleStatus = async (row) => {
    const product = row.product || {};
    const nextStatus = product.status === "active" ? "inactive" : "active";

    const snapshot = rows;
    setRows((prev) =>
      prev.map((x) =>
        x.id === row.id
          ? {
              ...x,
              product: {
                ...x.product,
                status: nextStatus,
              },
            }
          : x
      )
    );

    try {
      await updateProduct(restaurantId, product.id, {
        name: product.name,
        category_id: product.category_id ?? null,
        status: nextStatus,
        product_type: product.product_type,
        inventory_type: product.inventory_type,
      });

      showAlert({
        severity: "success",
        title: "Hecho",
        message:
          nextStatus === "active"
            ? "Producto activado correctamente."
            : "Producto inactivado correctamente.",
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

  const onOpenProductConfig = (row) => {
    const product = row.product || {};
    nav(`/owner/restaurants/${restaurantId}/operation/menu/products`, {
      state: {
        focusProductId: product.id,
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
              Cargando stock de productos…
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
              Stock de productos
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 15, md: 18 },
              }}
            >
              Consulta existencias de productos simples que manejan inventario
              directo dentro de este almacén.
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
                nav(`/owner/restaurants/${restaurantId}/operation/menu/products`)
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
              Configuración productos
            </Button>
          </Stack>
        </Stack>

        <InventoryWarehouseContextCard warehouse={warehouse} />

        <InventoryStockSummaryCards items={rows} />

        <ProductInventoryStockFilters
          q={q}
          onChangeQ={setQ}
          onlyPositive={onlyPositive}
          onChangeOnlyPositive={setOnlyPositive}
          categoryId={categoryId}
          onChangeCategoryId={setCategoryId}
          categories={categories}
          status={status}
          onChangeStatus={setStatus}
          total={rows.length}
        />

        <ProductInventoryStockTable
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
          onOpenProductConfig={onOpenProductConfig}
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
