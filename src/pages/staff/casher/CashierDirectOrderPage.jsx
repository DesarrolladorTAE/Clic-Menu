// src/pages/staff/casher/CashierDirectOrderPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import PageContainer from "../../../components/common/PageContainer";
import PaginationFooter from "../../../components/common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";
import useMenuSectionSelection from "../../../hooks/menu/useMenuSectionSelection";

import { fetchCashierDirectMenu } from "../../../services/staff/casher/cashierDirectOrder.service";

import { useMenuProducts } from "../../../hooks/public/useMenuProducts";
import { useCompositeDrafts } from "../../../hooks/public/useCompositeDrafts";
import { useCashierDirectCartAndOrder } from "../../../hooks/staff/useCashierDirectCartAndOrder";
import { buildModifierContextSections } from "../../../hooks/public/publicMenu.utils";

import MenuProductCard from "../../../components/menu/shared/MenuProductCard";
import ProductVariantsModal from "../../../components/menu/shared/ProductVariantsModal";
import CompositeProductModal from "../../../components/menu/shared/CompositeProductModal";
import ProductExtrasModal from "../../../components/menu/shared/ProductExtrasModal";
import MenuCartPanel from "../../../components/menu/shared/MenuCartPanel";
import MenuCartDrawer from "../../../components/menu/shared/MenuCartDrawer";
import MenuCartFloatingButton from "../../../components/menu/shared/MenuCartFloatingButton";
import PublicMenuCategoryTabs from "../../../components/menu/shared/menuUi/PublicMenuCategoryTabs";
import MenuSectionTabs from "../../../components/menu/shared/menuUi/MenuSectionTabs";

import CashierDirectHeaderCard from "../../../components/staff/casher/directOrderPage/CashierDirectHeaderCard";
import CashierDirectCreateOrderDialog from "../../../components/staff/casher/directOrderPage/CashierDirectCreateOrderDialog";

const PAGE_SIZE = 8;

function buildComponentModifierKey(componentProductId, variantId = null) {
  return `${Number(componentProductId || 0)}:${
    variantId ? Number(variantId) : 0
  }`;
}

function applyComponentModifierPayloadToComponents(
  components = [],
  componentModifiers = []
) {
  const grouped = {};

  (Array.isArray(componentModifiers) ? componentModifiers : []).forEach(
    (group) => {
      const key = buildComponentModifierKey(
        group?.component_product_id,
        group?.component_variant_id
      );

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(group);
    }
  );

  return (Array.isArray(components) ? components : []).map((component) => {
    const key = buildComponentModifierKey(
      component?.component_product_id,
      component?.variant_id
    );

    return {
      ...component,
      modifiers: grouped[key] || [],
    };
  });
}

function applyComponentDisplayGroupsToDetails(
  details = [],
  componentDisplayGroups = []
) {
  const grouped = {};

  (Array.isArray(componentDisplayGroups) ? componentDisplayGroups : []).forEach(
    (group) => {
      const key = buildComponentModifierKey(
        group?.component_product_id,
        group?.component_variant_id
      );

      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(group);
    }
  );

  return (Array.isArray(details) ? details : []).map((detail) => {
    const key = buildComponentModifierKey(
      detail?.component_product_id,
      detail?.variant_id
    );

    return {
      ...detail,
      modifier_groups_display: grouped[key] || [],
    };
  });
}

function hasContextualModifiers(product, opts = {}) {
  return buildModifierContextSections(product, opts).length > 0;
}

export default function CashierDirectOrderPage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const orderIdFromQuery = sp.get("order_id")
    ? Number(sp.get("order_id"))
    : null;

  const returnSaleId = sp.get("return_sale_id")
    ? Number(sp.get("return_sale_id"))
    : null;

  const isEditingExistingDirectOrder = Boolean(orderIdFromQuery);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [q, setQ] = useState("");

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const [variantsModalOpen, setVariantsModalOpen] = useState(false);
  const [selectedVariantsProduct, setSelectedVariantsProduct] = useState(null);

  const [compositeModalOpen, setCompositeModalOpen] = useState(false);
  const [selectedCompositeProduct, setSelectedCompositeProduct] =
    useState(null);

  const [extrasModalOpen, setExtrasModalOpen] = useState(false);
  const [selectedExtrasProduct, setSelectedExtrasProduct] = useState(null);
  const [selectedExtrasVariantId, setSelectedExtrasVariantId] = useState(null);
  const [selectedExtrasCompositeDraft, setSelectedExtrasCompositeDraft] =
    useState(null);
  const [selectedExtrasInitialValue, setSelectedExtrasInitialValue] = useState(
    []
  );
  const [selectedExtrasReadOnly, setSelectedExtrasReadOnly] = useState(false);
  const [selectedExtrasSubmitKind, setSelectedExtrasSubmitKind] =
    useState(null);
  const [selectedExtrasVariantObj, setSelectedExtrasVariantObj] =
    useState(null);
  const [selectedExtrasSelectionScope, setSelectedExtrasSelectionScope] =
    useState("all");
  const [pendingCompositeComponents, setPendingCompositeComponents] = useState(
    []
  );
  const [pendingCompositeDetails, setPendingCompositeDetails] = useState([]);

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [loadingExistingOrder, setLoadingExistingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [data, setData] = useState(null);

  const [selectedMenuId, setSelectedMenuId] = useState(null);

  const cartOrder = useCashierDirectCartAndOrder({
    returnSaleId,
    selectedMenuId,
  });

  const composite = useCompositeDrafts();

  const sections = Array.isArray(data?.sections)
    ? data.sections
    : Array.isArray(data?.data?.sections)
      ? data.data.sections
      : [];

  /*
   * Catálogo de menús que el backend autorizó para caja directa.
   */
  const availableMenus = Array.isArray(data?.available_menus)
    ? data.available_menus
    : [];

  const defaultMenuId = Number(data?.default_menu_id || 0) || null;

  /*
   * En una venta existente el menú siempre queda bloqueado,
   * aunque el endpoint del catálogo devuelva selection_locked = false.
   */
  const selectionLocked =
    isEditingExistingDirectOrder ||
    Boolean(data?.selection_locked);

  const selectedMenu =
    data?.selected_menu ||
    availableMenus.find(
      (menu) => String(menu?.id) === String(selectedMenuId)
    ) ||
    null;

  const {
    selectedSectionId,
    selectSection,
    showSectionSelector,
  } = useMenuSectionSelection(sections);

  const cashSession = data?.cash_session || null;

  const { categoryNameById, categoryOptions, filteredProducts } =
    useMenuProducts({
      sections,
      selectedSectionId,
      categoryFilter,
      q,
    });

  /*
   * Si el backend cambia las secciones o el usuario selecciona
   * otra sección, regresamos a todas las categorías de esa sección.
   */
  useEffect(() => {
    setCategoryFilter("all");
  }, [selectedSectionId]);

  const handleSectionChange = (nextSectionId) => {
    setCategoryFilter("all");
    selectSection(nextSectionId);
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
    paginatedItems: paginatedProducts,
  } = usePagination({
    items: filteredProducts,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
  });

  const cartDrawerItemCount =
    Number(cartOrder.cart?.length || 0) +
    Number(cartOrder.oldItems?.length || 0);

  const hasCartContent =
    (Array.isArray(cartOrder.cart) && cartOrder.cart.length > 0) ||
    (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0);

  const canSelect = true;
  const canAppend = cartOrder.canAppend;
  const hasOld =
    Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0;

  const canChooseKitchenFlow = useMemo(() => {
    return Boolean(
      data?.can_choose_kitchen_flow ||
        data?.cashier_direct_can_choose_kitchen_flow
    );
  }, [data]);

  const load = async ({
    silent = false,
    menuId = undefined,
  } = {}) => {
    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    } else {
      setSyncing(true);
    }

    /*
     * Cuando menuId no se envía explícitamente:
     *
     * 1. Una venta existente utiliza el menu_id de su orden.
     * 2. Una venta nueva conserva el menú seleccionado actualmente.
     * 3. Si todavía no existe selección, el backend devuelve
     *    el menú predeterminado.
     */
    const currentMenuId = Number(
      cartOrder.activeOrder?.menu_id ||
        selectedMenuId ||
        0
    );

    const requestedMenuId =
      menuId === undefined
        ? currentMenuId || null
        : Number(menuId || 0) || null;

    try {
      const res = await fetchCashierDirectMenu(
        requestedMenuId
          ? {
              menuId: requestedMenuId,
            }
          : undefined
      );

      const payload = res?.data ? res.data : res;

      const resolvedMenuId =
        Number(
          payload?.selected_menu?.id ||
            payload?.default_menu_id ||
            requestedMenuId ||
            0
        ) || null;

      setData(payload || null);
      setSelectedMenuId(resolvedMenuId);

      return payload || null;
    } catch (e) {
      const code = e?.response?.data?.code;
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "No se pudo cargar el menú de caja directa.";

      if (code === "NO_OPEN_CASH_SESSION") {
        navigate("/staff/cashier", { replace: true });
        return null;
      }

      setErrorMsg(String(msg));

      if (!silent) {
        setData(null);
      }

      return null;
    } finally {
      if (!silent) {
        setLoading(false);
      }

      setSyncing(false);
    }
  };

  
  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      /*
       * Nueva venta directa:
       * se solicita el menú predeterminado.
       */
      if (!orderIdFromQuery) {
        await load();
        return;
      }

      /*
       * Venta directa existente:
       *
       * 1. Cargar la orden.
       * 2. Obtener su menu_id.
       * 3. Cargar exactamente ese catálogo.
       * 4. Revisar stock.
       */
      try {
        setLoading(true);
        setLoadingExistingOrder(true);
        setErrorMsg("");

        const existing = await cartOrder.loadExisting({
          orderId: orderIdFromQuery,
          force: true,
        });

        if (!mounted) return;

        const lockedMenuId =
          Number(existing?.order?.menu_id || 0) || null;

        if (!lockedMenuId) {
          setErrorMsg(
            "La venta directa existente no tiene un menú válido asociado."
          );
          return;
        }

        const menuPayload = await load({
          menuId: lockedMenuId,
        });

        if (!mounted || !menuPayload) return;

        const reviewRes = await cartOrder.reviewStock(
          orderIdFromQuery
        );

        if (!mounted) return;

        if (
          !reviewRes?.ok &&
          Number(reviewRes?.__httpStatus || 0) === 409
        ) {
          const message =
            reviewRes?.message ||
            reviewRes?.data?.message ||
            "La venta directa no puede continuar con la configuración actual de la caja.";

          setErrorMsg(String(message));
        }
      } catch (e) {
        if (!mounted) return;

        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          e?.message ||
          "No se pudo cargar la venta directa existente.";

        setErrorMsg(String(msg));
      } finally {
        if (mounted) {
          setLoading(false);
          setLoadingExistingOrder(false);
        }
      }
    };

    initializePage();

    return () => {
      mounted = false;
      cartOrder.resetAll();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdFromQuery]);

  const resetExtrasFlow = () => {
    setExtrasModalOpen(false);
    setSelectedExtrasProduct(null);
    setSelectedExtrasVariantId(null);
    setSelectedExtrasCompositeDraft(null);
    setSelectedExtrasInitialValue([]);
    setSelectedExtrasReadOnly(false);
    setSelectedExtrasSubmitKind(null);
    setSelectedExtrasVariantObj(null);
    setSelectedExtrasSelectionScope("all");
    setPendingCompositeComponents([]);
    setPendingCompositeDetails([]);
  };

    /*
   * Limpia únicamente la captura pendiente.
   *
   * No elimina productos ya guardados en una orden existente.
   * No reinicia la búsqueda.
   * No modifica el cliente ni el flujo de cocina.
   */
  const resetPendingCaptureForMenuChange = () => {
    cartOrder.setCart([]);

    setCartDrawerOpen(false);

    setVariantsModalOpen(false);
    setSelectedVariantsProduct(null);

    setCompositeModalOpen(false);
    setSelectedCompositeProduct(null);

    resetExtrasFlow();

    composite.resetCompositeDrafts?.();

    setCategoryFilter("all");
  };

  const handleMenuChange = async (nextMenuId) => {
    if (selectionLocked || syncing) {
      return;
    }

    const normalizedMenuId =
      Number(nextMenuId || 0) || null;

    if (!normalizedMenuId) {
      return;
    }

    if (
      String(normalizedMenuId) ===
      String(selectedMenuId)
    ) {
      return;
    }

    /*
     * Los productos pendientes pertenecen al catálogo anterior.
     * Deben eliminarse antes de abrir el nuevo menú.
     */
    resetPendingCaptureForMenuChange();

    await load({
      silent: true,
      menuId: normalizedMenuId,
    });
  };

  const openReadOnlyExtrasViewer = (product) => {
    setSelectedExtrasProduct(product);
    setSelectedExtrasVariantId(null);
    setSelectedExtrasCompositeDraft(null);
    setSelectedExtrasInitialValue([]);
    setSelectedExtrasReadOnly(true);
    setSelectedExtrasSubmitKind(null);
    setSelectedExtrasVariantObj(null);
    setSelectedExtrasSelectionScope("all");
    setPendingCompositeComponents([]);
    setPendingCompositeDetails([]);
    setExtrasModalOpen(true);
  };

  const openVariantsViewer = (product) => {
    setSelectedVariantsProduct(product);
    setVariantsModalOpen(true);
  };

  const closeVariantsViewer = () => {
    setVariantsModalOpen(false);
    setSelectedVariantsProduct(null);
  };

  const openProductSelectionFlow = (product) => {
    if (hasContextualModifiers(product, { selectionScope: "product_only" })) {
      setSelectedExtrasProduct(product);
      setSelectedExtrasVariantId(null);
      setSelectedExtrasCompositeDraft(null);
      setSelectedExtrasInitialValue([]);
      setSelectedExtrasReadOnly(false);
      setSelectedExtrasSubmitKind("product");
      setSelectedExtrasVariantObj(null);
      setSelectedExtrasSelectionScope("product_only");
      setPendingCompositeComponents([]);
      setPendingCompositeDetails([]);
      setExtrasModalOpen(true);
      return;
    }

    cartOrder.addToCartFromProduct(product);
    setCartDrawerOpen(true);
  };

  const openVariantSelectionFlow = (product, variant) => {
    if (
      hasContextualModifiers(product, {
        variantId: Number(variant?.id || 0),
        selectionScope: "variant_only",
      })
    ) {
      setSelectedExtrasProduct(product);
      setSelectedExtrasVariantId(Number(variant?.id || 0));
      setSelectedExtrasCompositeDraft(null);
      setSelectedExtrasInitialValue([]);
      setSelectedExtrasReadOnly(false);
      setSelectedExtrasSubmitKind("variant");
      setSelectedExtrasVariantObj(variant);
      setSelectedExtrasSelectionScope("variant_only");
      setPendingCompositeComponents([]);
      setPendingCompositeDetails([]);
      setExtrasModalOpen(true);
      return;
    }

    cartOrder.addToCartFromVariant(product, variant);
    setCartDrawerOpen(true);
  };

  const openCompositeConfigurator = (product) => {
    composite.resetDraftForProduct(product);
    setSelectedCompositeProduct(product);
    setCompositeModalOpen(true);
  };

  const confirmCompositeSelection = () => {
    if (!selectedCompositeProduct) return;

    const draft = composite.getOrInitCompositeDraft(selectedCompositeProduct);

    const components =
      composite.buildSubmitComponentsFromProduct(selectedCompositeProduct) || [];

    const details =
      composite.buildDetailsFromProduct(selectedCompositeProduct) || [];

    if (
      hasContextualModifiers(selectedCompositeProduct, {
        compositeDraft: draft,
        selectionScope: "composite_only",
      })
    ) {
      setSelectedExtrasProduct(selectedCompositeProduct);
      setSelectedExtrasVariantId(null);
      setSelectedExtrasCompositeDraft(draft);
      setSelectedExtrasInitialValue([]);
      setSelectedExtrasReadOnly(false);
      setSelectedExtrasSubmitKind("composite");
      setSelectedExtrasVariantObj(null);
      setSelectedExtrasSelectionScope("composite_only");
      setPendingCompositeComponents(components);
      setPendingCompositeDetails(details);
      setCompositeModalOpen(false);
      setSelectedCompositeProduct(null);
      setExtrasModalOpen(true);
      return;
    }

    cartOrder.addToCartFromProduct(
      selectedCompositeProduct,
      components,
      details
    );

    setCompositeModalOpen(false);
    setSelectedCompositeProduct(null);
    setCartDrawerOpen(true);
  };

  const handleConfirmExtras = (result) => {
    if (!selectedExtrasProduct) {
      resetExtrasFlow();
      return;
    }

    const parentModifiers = result?.parentModifiers || [];
    const parentDisplayGroups = result?.parentDisplayGroups || [];
    const componentModifiers = result?.componentModifiers || [];
    const componentDisplayGroups = result?.componentDisplayGroups || [];

    if (selectedExtrasSubmitKind === "variant" && selectedExtrasVariantObj) {
      cartOrder.addToCartFromVariant(
        selectedExtrasProduct,
        selectedExtrasVariantObj,
        [],
        [],
        parentModifiers,
        parentDisplayGroups
      );

      resetExtrasFlow();
      setCartDrawerOpen(true);
      return;
    }

    if (selectedExtrasSubmitKind === "composite") {
      const nextComponents = applyComponentModifierPayloadToComponents(
        pendingCompositeComponents,
        componentModifiers
      );

      const nextDetails = applyComponentDisplayGroupsToDetails(
        pendingCompositeDetails,
        componentDisplayGroups
      );

      cartOrder.addToCartFromProduct(
        selectedExtrasProduct,
        nextComponents,
        nextDetails,
        parentModifiers,
        parentDisplayGroups
      );

      resetExtrasFlow();
      setCartDrawerOpen(true);
      return;
    }

    cartOrder.addToCartFromProduct(
      selectedExtrasProduct,
      [],
      [],
      parentModifiers,
      parentDisplayGroups
    );

    resetExtrasFlow();
    setCartDrawerOpen(true);
  };

  const handleSubmitCart = () => {
    if (isEditingExistingDirectOrder) {
      cartOrder.validateAndGoToPayment();
      return;
    }

    if (canAppend) {
      cartOrder.submitOrderOrAppend();
      return;
    }

    cartOrder.setCustomerName("");
    cartOrder.setSendOpen(true);
  };

  const handleConfirmCreateOrder = async ({ customer_name, kitchen_flow }) => {
    const nextName = String(customer_name || "").trim();

    cartOrder.setCustomerName(nextName);

    if (kitchen_flow) {
      cartOrder.setKitchenFlow(kitchen_flow);
    }

    await cartOrder.createFirstOrder({
      name: nextName,
      requestedKitchenFlow: kitchen_flow || "",
    });
  };

  const handleBack = () => {
    if (isEditingExistingDirectOrder && returnSaleId) {
      navigate(`/staff/cashier/sales/${returnSaleId}`);
      return;
    }

    cartOrder.goToSaleDetail();
    navigate("/staff/cashier/queue");
  };

  if (loading || loadingExistingOrder) {
    return (
      <PageContainer>
        <Box
          sx={{
            minHeight: "70vh",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2, color: "text.secondary", fontSize: 14 }}>
              {loadingExistingOrder
                ? "Cargando venta directa existente…"
                : "Cargando venta directa…"}
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  if (errorMsg) {
    return (
      <PageContainer>
        <Box
          sx={{
            border: "1px solid",
            borderColor: "#F3B4B4",
            bgcolor: "#FFF1F1",
            borderRadius: 1,
            p: 3,
          }}
        >
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 800,
              color: "#A10000",
            }}
          >
            No se pudo cargar caja directa
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: 14,
              color: "text.secondary",
              whiteSpace: "pre-line",
            }}
          >
            {errorMsg}
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1300}>
      <Stack spacing={3} sx={{ pb: 10 }}>
        <CashierDirectHeaderCard
          title={
            isEditingExistingDirectOrder
              ? "Corregir venta directa"
              : "Venta directa"
          }
          subtitle={
            isEditingExistingDirectOrder
              ? "Quita productos sin stock o agrega nuevos productos a la misma venta. Al presionar Cobrar, se validará el stock antes de volver al cobro."
              : "Selecciona productos, confirma el cliente y crea una venta tomada por tu caja. Después continuarás al detalle para cobrar."
          }
          menuData={data}
          cashSession={cashSession}
          cartCount={cartDrawerItemCount}

          availableMenus={availableMenus}
          defaultMenuId={defaultMenuId}
          selectedMenuId={selectedMenuId}
          selectedMenu={selectedMenu}
          selectionLocked={selectionLocked}
          menuLoading={syncing}
          onMenuChange={handleMenuChange}

          cartTotal={cartOrder.totalGlobal}
          total={cartOrder.displayTotal}
          totalLabel={cartOrder.totalLabel}
          isEstimated={cartOrder.isEstimated}

          q={q}
          onSearchChange={setQ}
          totalVisible={filteredProducts.length}
          onOpenCart={() => setCartDrawerOpen(true)}
          onRefresh={() => load({ silent: true })}
          syncing={syncing}
        />

        {showSectionSelector ? (
          <MenuSectionTabs
            sections={sections}
            selectedSectionId={selectedSectionId}
            onSectionChange={handleSectionChange}
          />
        ) : null}

        {sections.length > 0 ? (
          <PublicMenuCategoryTabs
            categoryOptions={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        ) : null}

        <Box>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "repeat(1, minmax(0, 1fr))",
                sm: "repeat(2, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                xl: "repeat(4, minmax(0, 1fr))",
              },
            }}
          >
            {sections.length > 0 && filteredProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <MenuProductCard
                  key={product.id}
                  product={product}
                  categoryName={
                    product.__categoryName ||
                    categoryNameById.get(Number(product.category_id)) ||
                    "Sin categoría"
                  }
                  canSelect={canSelect}
                  showSelectBtn
                  onAddSimple={openProductSelectionFlow}
                  onAddVariant={openVariantSelectionFlow}
                  onOpenComposite={openCompositeConfigurator}
                  onOpenExtras={openReadOnlyExtrasViewer}
                  onOpenVariants={openVariantsViewer}
                />
              ))
            ) : (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  border: "1px dashed",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.paper",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "text.primary",
                  }}
                >
                  {sections.length === 0
                    ? "Sin secciones disponibles"
                    : "Sin productos"}
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 14,
                    color: "text.secondary",
                  }}
                >
                  {sections.length === 0
                    ? "El menú seleccionado no tiene secciones disponibles."
                    : "Prueba con otro texto o cambia de categoría."}
                </Typography>
              </Box>
            )}
          </Box>

          {filteredProducts.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <PaginationFooter
                page={page}
                totalPages={totalPages}
                startItem={startItem}
                endItem={endItem}
                total={total}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={prevPage}
                onNext={nextPage}
                itemLabel="productos"
              />
            </Box>
          ) : null}
        </Box>
      </Stack>

      {!isEditingExistingDirectOrder ? (
        <CashierDirectCreateOrderDialog
          open={cartOrder.sendOpen}
          onClose={() => {
            if (cartOrder.sending) return;
            cartOrder.setSendOpen(false);
          }}
          onConfirm={handleConfirmCreateOrder}
          customerName={cartOrder.customerName || ""}
          onCustomerNameChange={cartOrder.setCustomerName}
          kitchenFlow={cartOrder.kitchenFlow}
          onKitchenFlowChange={cartOrder.setKitchenFlow}
          cart={cartOrder.cart}
          total={cartOrder.cartTotal}
          pricingSummary={cartOrder.newItemsPricingSummary}
          saving={cartOrder.sending}
          canChooseKitchenFlow={canChooseKitchenFlow}
        />
      ) : null}

      <CompositeProductModal
        open={compositeModalOpen}
        product={selectedCompositeProduct}
        draft={
          selectedCompositeProduct
            ? composite.getOrInitCompositeDraft(selectedCompositeProduct)
            : []
        }
        onClose={() => {
          setCompositeModalOpen(false);
          setSelectedCompositeProduct(null);
        }}
        onToggleIncluded={(componentId, included) => {
          if (!selectedCompositeProduct) return;

          composite.setDraftIncluded(
            Number(selectedCompositeProduct.id),
            componentId,
            included
          );
        }}
        onVariantChange={(componentId, variantId) => {
          if (!selectedCompositeProduct) return;

          composite.setDraftVariant(
            Number(selectedCompositeProduct.id),
            componentId,
            variantId
          );
        }}
        onConfirm={confirmCompositeSelection}
        confirmLabel="Agregar compuesto"
      />

      <ProductExtrasModal
        open={extrasModalOpen}
        product={selectedExtrasProduct}
        variantId={selectedExtrasVariantId}
        compositeDraft={selectedExtrasCompositeDraft}
        initialValue={selectedExtrasInitialValue}
        readOnly={selectedExtrasReadOnly}
        onClose={resetExtrasFlow}
        onConfirm={handleConfirmExtras}
        confirmLabel={selectedExtrasReadOnly ? "Listo" : "Guardar extras"}
        selectionScope={selectedExtrasSelectionScope}
      />

      <ProductVariantsModal
        open={variantsModalOpen}
        product={selectedVariantsProduct}
        canSelect={canSelect}
        showSelectBtn
        onClose={closeVariantsViewer}
        onAddVariant={openVariantSelectionFlow}
      />

      <MenuCartDrawer
        open={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        title={
          isEditingExistingDirectOrder
            ? "Corregir venta directa"
            : "Venta directa"
        }
        subtitle={
          isEditingExistingDirectOrder
            ? "Quita productos sin stock o agrega nuevos productos. Al presionar Cobrar se validará la venta."
            : canAppend
            ? "Puedes agregar productos a esta venta directa antes de cobrar."
            : "Revisa los productos seleccionados antes de crear la venta."
        }
        itemCount={cartDrawerItemCount}
        total={cartOrder.displayTotal}
        totalLabel={cartOrder.totalLabel}
        isEstimated={cartOrder.isEstimated}
        pricingSummary={cartOrder.pricingSummary}
        disabledClose={cartOrder.sending}
      >
        <MenuCartPanel
          title={
            isEditingExistingDirectOrder
              ? "Corregir venta directa"
              : "Venta directa"
          }
          subtitle={
            isEditingExistingDirectOrder
              ? "Cuando la venta tenga stock suficiente y no esté vacía, podrás volver al cobro."
              : canAppend
              ? "Venta directa activa: puedes agregar productos."
              : "Selecciona productos y luego crea la venta."
          }
          customerName={
            canAppend || isEditingExistingDirectOrder
              ? cartOrder.activeOrder?.customer_name || ""
              : ""
          }
          total={cartOrder.displayTotal}
          pricingSummary={cartOrder.pricingSummary}
          oldItems={cartOrder.oldItems}
          newItems={cartOrder.cart}
          sendToast={cartOrder.sendToast}
          sending={cartOrder.sending}
          canAppend={canAppend || isEditingExistingDirectOrder}
          canSubmit={
            isEditingExistingDirectOrder
              ? hasOld || cartOrder.cart.length > 0
              : cartOrder.cart.length > 0
          }
          submitLabel={isEditingExistingDirectOrder ? "Cobrar" : undefined}
          onEmpty={() => cartOrder.setCart([])}
          onSubmit={handleSubmitCart}
          onQtyChange={cartOrder.setCartQty}
          onNotesChange={cartOrder.setCartNotes}
          onRemove={cartOrder.removeCartItem}
          onRemoveOldItem={(orderItem) => {
            const orderItemId = Number(
              orderItem?.id || orderItem?.order_item_id || 0
            );

            if (!orderItemId) return;

            cartOrder.removeExistingOrderItem(orderItemId, {
              returnToSaleDetail: false,
            });
          }}
          statusBadges={[
            { tone: "dark", label: "💵 Caja directa" },
            ...(canAppend || isEditingExistingDirectOrder
              ? [
                  {
                    tone: "ok",
                    label: "Venta activa",
                    title: "Venta directa tomada por caja",
                  },
                ]
              : []),
            ...(isEditingExistingDirectOrder
              ? [
                  {
                    tone: "warn",
                    label: "Corrección",
                    title: "Estás corrigiendo una venta existente",
                  },
                ]
              : []),
            ...(hasOld
              ? [
                  {
                    tone: "default",
                    label: `Actuales: ${cartOrder.oldItems.length}`,
                    title: "Productos ya guardados",
                  },
                ]
              : []),
            {
              tone: cartOrder.cart.length > 0 ? "ok" : "warn",
              label: `Nuevos: ${cartOrder.cart.length}`,
            },
          ]}
        />
      </MenuCartDrawer>

      <MenuCartFloatingButton
        itemCount={cartDrawerItemCount}
        total={cartOrder.displayTotal}
        totalLabel={cartOrder.totalLabel}
        isEstimated={cartOrder.isEstimated}
        disabled={false}
        onClick={() => setCartDrawerOpen(true)}
        label={hasCartContent ? "Ver venta" : "Venta"}
        title="Abrir venta directa"
      />
    </PageContainer>
  );
}