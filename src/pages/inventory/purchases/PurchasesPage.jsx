import { useEffect, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";
import usePagination from "../../../hooks/usePagination";

import PurchasesHeader from "../../../components/inventory/purchases/PurchasesHeader";
import PurchaseSummaryCards from "../../../components/inventory/purchases/PurchaseSummaryCards";
import PurchaseFiltersCard from "../../../components/inventory/purchases/PurchaseFiltersCard";
import PurchasesTable from "../../../components/inventory/purchases/PurchasesTable";
import PurchaseUpsertModal from "../../../components/inventory/purchases/PurchaseUpsertModal";

import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../../../services/inventory/purchases/purchases.service";
import { getBranchesByRestaurant } from "../../../services/restaurant/branch.service";
import { getSuppliers } from "../../../services/inventory/suppliers/suppliers.service";

const PAGE_SIZE = 5;

export default function PurchasesPage() {
  const navigate = useNavigate();
  const { restaurantId } = useParams();

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [status, setStatus] = useState("");
  const [branchId, setBranchId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);

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

  const load = async () => {
    setLoading(true);

    try {
      const [purchasesRes, branchesRes, suppliersRes] = await Promise.all([
        getPurchases(restaurantId, {
          status,
          branch_id: branchId,
          supplier_id: supplierId,
        }),
        getBranchesByRestaurant(restaurantId),
        getSuppliers(restaurantId),
      ]);

      setRows(Array.isArray(purchasesRes?.data) ? purchasesRes.data : []);
      setBranches(Array.isArray(branchesRes) ? branchesRes : []);
      setSuppliers(Array.isArray(suppliersRes?.data) ? suppliersRes.data : []);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudieron cargar las compras.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, status, branchId, supplierId]);

  const openCreate = () => {
    setEditingPurchase(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingPurchase(row);
    setModalOpen(true);
  };

  const handleSavePurchase = async (payload) => {
    try {
      if (editingPurchase?.id) {
        const res = await updatePurchase(
          restaurantId,
          editingPurchase.id,
          payload
        );

        const updated = res?.data;

        setRows((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );

        showAlert({
          severity: "success",
          title: "Hecho",
          message: res?.message || "Compra actualizada.",
        });
      } else {
        const res = await createPurchase(restaurantId, payload);
        const created = res?.data;

        setRows((prev) => [created, ...prev]);

        showAlert({
          severity: "success",
          title: "Hecho",
          message: res?.message || "Compra creada.",
        });
      }

      setModalOpen(false);
      setEditingPurchase(null);
    } catch (e) {
      throw e;
    }
  };

  const handleDelete = async (row) => {
    try {
      const res = await deletePurchase(restaurantId, row.id);

      setRows((prev) => prev.filter((item) => item.id !== row.id));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: res?.message || "Compra eliminada.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo eliminar la compra.",
      });
    }
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
              Cargando compras…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <PurchasesHeader onCreate={openCreate} />

        <PurchaseSummaryCards items={rows} />

        <PurchaseFiltersCard
          status={status}
          onChangeStatus={setStatus}
          branchId={branchId}
          onChangeBranchId={setBranchId}
          supplierId={supplierId}
          onChangeSupplierId={setSupplierId}
          branches={branches}
          suppliers={suppliers}
          total={rows.length}
        />

        <PurchasesTable
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
          onOpenDetail={(row) =>
            navigate(
              `/owner/restaurants/${restaurantId}/operation/purchases/${row.id}`
            )
          }
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </Stack>

      <PurchaseUpsertModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingPurchase(null);
        }}
        editing={editingPurchase}
        branches={branches}
        suppliers={suppliers}
        onSave={handleSavePurchase}
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