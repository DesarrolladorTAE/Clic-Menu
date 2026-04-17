import { useEffect, useState } from "react";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import AppAlert from "../../../components/common/AppAlert";

import PurchaseDetailHeader from "../../../components/inventory/purchases/PurchaseDetailHeader";
import PurchaseMetaCard from "../../../components/inventory/purchases/PurchaseMetaCard";
import PurchaseItemsTabs from "../../../components/inventory/purchases/PurchaseItemsTabs";
import PurchaseIngredientItemsTable from "../../../components/inventory/purchases/PurchaseIngredientItemsTable";
import PurchaseProductItemsTable from "../../../components/inventory/purchases/PurchaseProductItemsTable";
import PurchaseIngredientItemModal from "../../../components/inventory/purchases/PurchaseIngredientItemModal";
import PurchaseProductItemModal from "../../../components/inventory/purchases/PurchaseProductItemModal";

import {
  getPurchase,
  completePurchase,
  createPurchaseIngredientItem,
  updatePurchaseIngredientItem,
  deletePurchaseIngredientItem,
  createPurchaseProductItem,
  updatePurchaseProductItem,
  deletePurchaseProductItem,
} from "../../../services/inventory/purchases/purchases.service";
import { getPurchasableIngredients } from "../../../services/inventory/ingredients/ingredients.service";
import { getProducts } from "../../../services/products/products.service";

export default function PurchaseDetailPage() {
  const navigate = useNavigate();
  const { restaurantId, purchaseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const [purchase, setPurchase] = useState(null);
  const [tab, setTab] = useState("ingredients");

  const [ingredientModalOpen, setIngredientModalOpen] = useState(false);
  const [editingIngredientItem, setEditingIngredientItem] = useState(null);

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductItem, setEditingProductItem] = useState(null);

  const [ingredients, setIngredients] = useState([]);
  const [presentations, setPresentations] = useState([]);
  const [products, setProducts] = useState([]);

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
      const [purchaseRes, ingredientsRes, productsRes] = await Promise.all([
        getPurchase(restaurantId, purchaseId),
        getPurchasableIngredients(restaurantId, { q: "" }),
        getProducts(restaurantId, { include_inactive: true }),
      ]);

      const nextPurchase = purchaseRes?.data || null;
      setPurchase(nextPurchase);

      setIngredients(
        Array.isArray(ingredientsRes?.data) ? ingredientsRes.data : []
      );

      const productRows = Array.isArray(productsRes?.data)
        ? productsRes.data
        : Array.isArray(productsRes)
          ? productsRes
          : [];

      const directProducts = productRows.filter(
        (item) =>
          item.product_type === "simple" &&
          item.inventory_type === "product" &&
          item.status === "active"
      );

      setProducts(directProducts);
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: e?.response?.data?.message || "No se pudo cargar la compra.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId, purchaseId]);

  const editable = purchase?.status === "draft";

  const loadPresentationsByIngredient = (ingredientId) => {
    const selectedIngredient = ingredients.find(
      (item) => Number(item.id) === Number(ingredientId)
    );

    const nextPresentations = Array.isArray(selectedIngredient?.presentations)
      ? selectedIngredient.presentations.filter(
          (item) => String(item?.status || "active") === "active"
        )
      : [];

    setPresentations(nextPresentations);
  };

  const handleComplete = async () => {
    setCompleting(true);

    try {
      const res = await completePurchase(restaurantId, purchase.id, {});
      setPurchase(res?.data || purchase);

      showAlert({
        severity: "success",
        title: "Hecho",
        message: res?.message || "Compra completada correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message:
          e?.response?.data?.message || "No se pudo completar la compra.",
      });
    } finally {
      setCompleting(false);
    }
  };

  const openIngredientCreate = () => {
    setEditingIngredientItem(null);
    setPresentations([]);
    setIngredientModalOpen(true);
  };

  const openIngredientEdit = (item) => {
    setEditingIngredientItem(item);

    if (item?.ingredient?.id) {
      loadPresentationsByIngredient(item.ingredient.id);
    } else {
      setPresentations([]);
    }

    setIngredientModalOpen(true);
  };

  const handleSaveIngredientItem = async (payload) => {
    try {
      if (editingIngredientItem?.id) {
        const res = await updatePurchaseIngredientItem(
          restaurantId,
          purchase.id,
          editingIngredientItem.id,
          payload
        );

        const updated =
          res?.data?.item || res?.data || null;
        const purchaseTotal =
          res?.data?.purchase_total ?? res?.purchase_total ?? null;

        setPurchase((prev) => ({
          ...prev,
          total_amount: purchaseTotal ?? prev.total_amount,
          items: prev.items.map((item) =>
            item.id === updated.id ? updated : item
          ),
        }));

        showAlert({
          severity: "success",
          title: "Hecho",
          message: res?.message || "Ítem actualizado correctamente.",
        });
      } else {
        const res = await createPurchaseIngredientItem(
          restaurantId,
          purchase.id,
          payload
        );

        const created =
          res?.data?.item || res?.data || null;
        const purchaseTotal =
          res?.data?.purchase_total ?? res?.purchase_total ?? null;

        setPurchase((prev) => ({
          ...prev,
          total_amount: purchaseTotal ?? prev.total_amount,
          items: [...prev.items, created],
        }));

        showAlert({
          severity: "success",
          title: "Hecho",
          message: res?.message || "Ítem agregado correctamente.",
        });
      }

      setIngredientModalOpen(false);
      setEditingIngredientItem(null);
      setPresentations([]);
    } catch (e) {
      throw e;
    }
  };

  const handleDeleteIngredientItem = async (item) => {
    try {
      const res = await deletePurchaseIngredientItem(
        restaurantId,
        purchase.id,
        item.id
      );

      setPurchase((prev) => ({
        ...prev,
        total_amount:
          res?.data?.purchase_total ?? res?.purchase_total ?? prev.total_amount,
        items: prev.items.filter((x) => x.id !== item.id),
      }));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: res?.message || "Ítem eliminado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: e?.response?.data?.message || "No se pudo eliminar el ítem.",
      });
    }
  };

  const openProductCreate = () => {
    setEditingProductItem(null);
    setProductModalOpen(true);
  };

  const openProductEdit = (item) => {
    setEditingProductItem(item);
    setProductModalOpen(true);
  };

  const handleSaveProductItem = async (payload) => {
    try {
      if (editingProductItem?.id) {
        const res = await updatePurchaseProductItem(
          restaurantId,
          purchase.id,
          editingProductItem.id,
          payload
        );

        const updated = res?.data?.item;
        const purchaseTotal = res?.data?.purchase_total;

        setPurchase((prev) => ({
          ...prev,
          total_amount: purchaseTotal ?? prev.total_amount,
          product_items: prev.product_items.map((item) =>
            item.id === updated.id ? updated : item
          ),
        }));

        showAlert({
          severity: "success",
          title: "Hecho",
          message: res?.message || "Ítem de producto actualizado correctamente.",
        });
      } else {
        const res = await createPurchaseProductItem(
          restaurantId,
          purchase.id,
          payload
        );

        const created = res?.data?.item;
        const purchaseTotal = res?.data?.purchase_total;

        setPurchase((prev) => ({
          ...prev,
          total_amount: purchaseTotal ?? prev.total_amount,
          product_items: [...prev.product_items, created],
        }));

        showAlert({
          severity: "success",
          title: "Hecho",
          message: res?.message || "Ítem de producto agregado correctamente.",
        });
      }

      setProductModalOpen(false);
      setEditingProductItem(null);
    } catch (e) {
      throw e;
    }
  };

  const handleDeleteProductItem = async (item) => {
    try {
      const res = await deletePurchaseProductItem(
        restaurantId,
        purchase.id,
        item.id
      );

      setPurchase((prev) => ({
        ...prev,
        total_amount: res?.purchase_total ?? prev.total_amount,
        product_items: prev.product_items.filter((x) => x.id !== item.id),
      }));

      showAlert({
        severity: "success",
        title: "Hecho",
        message: res?.message || "Ítem eliminado correctamente.",
      });
    } catch (e) {
      showAlert({
        severity: "error",
        title: "Error",
        message: e?.response?.data?.message || "No se pudo eliminar el ítem.",
      });
    }
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
              Cargando compra…
            </Typography>
          </Stack>
        </Box>
      </PageContainer>
    );
  }

  if (!purchase) {
    return (
      <PageContainer>
        <Typography sx={{ color: "text.secondary" }}>
          No se encontró la compra.
        </Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Stack spacing={3}>
        <PurchaseDetailHeader
          purchase={purchase}
          onBack={() =>
            navigate(`/owner/restaurants/${restaurantId}/operation/purchases`)
          }
          onComplete={handleComplete}
          completing={completing}
        />

        <PurchaseMetaCard purchase={purchase} />

        <Paper
          sx={{
            p: 0,
            overflow: "hidden",
            borderRadius: 0,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <PurchaseItemsTabs tab={tab} onChange={setTab} />

          <Box sx={{ p: 2 }}>
            {tab === "ingredients" ? (
              <PurchaseIngredientItemsTable
                items={purchase.items || []}
                editable={editable}
                onAdd={openIngredientCreate}
                onEdit={openIngredientEdit}
                onDelete={handleDeleteIngredientItem}
              />
            ) : (
              <PurchaseProductItemsTable
                items={purchase.product_items || []}
                editable={editable}
                onAdd={openProductCreate}
                onEdit={openProductEdit}
                onDelete={handleDeleteProductItem}
              />
            )}
          </Box>
        </Paper>
      </Stack>

      <PurchaseIngredientItemModal
        open={ingredientModalOpen}
        onClose={() => {
          setIngredientModalOpen(false);
          setEditingIngredientItem(null);
          setPresentations([]);
        }}
        editing={editingIngredientItem}
        ingredients={ingredients}
        presentations={presentations}
        onIngredientChange={loadPresentationsByIngredient}
        onSave={handleSaveIngredientItem}
      />

      <PurchaseProductItemModal
        open={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProductItem(null);
        }}
        editing={editingProductItem}
        products={products}
        onSave={handleSaveProductItem}
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