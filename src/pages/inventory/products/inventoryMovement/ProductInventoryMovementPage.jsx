import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

import PageContainer from "../../../../components/common/PageContainer";
import AppAlert from "../../../../components/common/AppAlert";
import usePagination from "../../../../hooks/usePagination";

import InventoryWarehouseContextCard from "../../../../components/inventory/shared/stock/InventoryWarehouseContextCard";
import InventoryMovementSummaryCards from "../../../../components/inventory/shared/movement/InventoryMovementSummaryCards";
import ManualMovementModal from "../../../../components/inventory/shared/movement/ManualMovementModal";
import ProductInventoryMovementFilters from "../../../../components/inventory/products/inventoryMovement/ProductInventoryMovementFilters";
import ProductInventoryMovementTable from "../../../../components/inventory/products/inventoryMovement/ProductInventoryMovementTable";

import { getProducts } from "../../../../services/products/products.service";
import {
  getProductInventoryMovements,
  createProductInventoryMovement,
} from "../../../../services/inventory/products/inventoryMovement/inventoryMovement.service";
import { normalizeErr } from "../../../../utils/err";

const PAGE_SIZE = 5;

export default function ProductInventoryMovementPage() {
  const nav = useNavigate();
  const { restaurantId, warehouseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [warehouse, setWarehouse] = useState(null);
  const [rows, setRows] = useState([]);
  const [productOptions, setProductOptions] = useState([]);

  const [productId, setProductId] = useState("");
  const [type, setType] = useState("");
  const [reason, setReason] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

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

  const closeAlert = (_, reasonClose) => {
    if (reasonClose === "clickaway") return;
    setAlertState((prev) => ({ ...prev, open: false }));
  };

  const load = async ({ initial = false } = {}) => {
    const myReq = ++reqRef.current;

    if (initial) setLoading(true);
    else setRefreshing(true);

    try {
      const [movRes, productsRes] = await Promise.all([
        getProductInventoryMovements(restaurantId, warehouseId, {
          product_id: productId,
          type,
          reason,
          limit: 200,
        }),
        getProducts(restaurantId, {
          include_inactive: true,
        }),
      ]);

      if (myReq !== reqRef.current) return;

      setWarehouse(movRes?.data?.warehouse || null);
      setRows(Array.isArray(movRes?.data?.movements) ? movRes.data.movements : []);

      const products = Array.isArray(productsRes) ? productsRes : [];
      const directProducts = products.filter(
        (p) => p.product_type === "simple" && p.inventory_type === "product"
      );

      setProductOptions(
        directProducts.map((item) => ({
          value: item.id,
          label: item.name,
        }))
      );
    } catch (e) {
      if (myReq !== reqRef.current) return;

      showAlert({
        severity: "error",
        title: "Error",
        message: normalizeErr(
          e,
          "No se pudo cargar el historial de movimientos."
        ),
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
  }, [productId, type, reason]);

  const handleSaveMovement = async (selectedProductId, payload) => {
    const res = await createProductInventoryMovement(restaurantId, {
      ...payload,
      product_id: selectedProductId,
    });

    const movement = res?.data?.movement;
    if (movement) {
      setRows((prev) => [movement, ...prev]);
    }

    setModalOpen(false);

    showAlert({
      severity: "success",
      title: "Hecho",
      message: res?.message || "Movimiento aplicado correctamente.",
    });

    await load({ initial: false });
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
              Cargando movimientos de productos…
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
              Movimientos de productos
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color: "text.secondary",
                fontSize: { xs: 15, md: 18 },
              }}
            >
              Revisa el historial de entradas, salidas y ajustes manuales de
              productos con stock directo.
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
              onClick={() => setModalOpen(true)}
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                minWidth: { xs: "100%", sm: 210 },
                height: 44,
                borderRadius: 2,
                fontWeight: 800,
              }}
            >
              Nuevo movimiento
            </Button>
          </Stack>
        </Stack>

        <InventoryWarehouseContextCard warehouse={warehouse} />

        <InventoryMovementSummaryCards items={rows} />

        <ProductInventoryMovementFilters
          productId={productId}
          onChangeProductId={setProductId}
          productOptions={productOptions}
          type={type}
          onChangeType={setType}
          reason={reason}
          onChangeReason={setReason}
          total={rows.length}
        />

        <ProductInventoryMovementTable
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
          onCreate={() => setModalOpen(true)}
        />
      </Stack>

      <ManualMovementModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nuevo movimiento manual de producto"
        entityLabel="Producto"
        entityOptions={productOptions}
        warehouseId={warehouseId}
        onSave={handleSaveMovement}
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
