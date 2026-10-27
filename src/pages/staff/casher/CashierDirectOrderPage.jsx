// src/pages/staff/casher/CashierDirectOrderPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Box, CircularProgress, Snackbar, Stack, Typography } from "@mui/material";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import echo from "../../../realtime/echo";

import PageContainer from "../../../components/common/PageContainer";
import PaginationFooter from "../../../components/common/PaginationFooter";
import usePagination from "../../../hooks/usePagination";
import useMenuSectionSelection from "../../../hooks/menu/useMenuSectionSelection";
import useMenuAvailabilityRealtime from "../../../hooks/menu/useMenuAvailabilityRealtime";
import { usePreparedItemsCollection } from "../../../hooks/menu/usePreparedItemsCollection";

import {
  fetchCashierDirectMenu,
  fetchCashierDirectMenuSets,
  fetchPreparedItems,
} from "../../../services/staff/casher/cashierDirectOrder.service";

import { useMenuProducts } from "../../../hooks/public/useMenuProducts";
import { useCompositeDrafts } from "../../../hooks/public/useCompositeDrafts";
import { useCashierDirectCartAndOrder } from "../../../hooks/staff/useCashierDirectCartAndOrder";
import { buildModifierContextSections } from "../../../hooks/public/publicMenu.utils";

import MenuProductCard from "../../../components/menu/shared/MenuProductCard";
import ProductVariantsModal from "../../../components/menu/shared/ProductVariantsModal";
import CompositeProductModal from "../../../components/menu/shared/CompositeProductModal";
import ProductExtrasModal from "../../../components/menu/shared/ProductExtrasModal";
import MenuCartPanel from "../../../components/menu/shared/MenuCartPanel";
import { buildOldItemsTree } from "../../../components/menu/shared/cartPanel/cartPanel.utils";
import MenuCartDrawer from "../../../components/menu/shared/MenuCartDrawer";
import MenuCartFloatingButton from "../../../components/menu/shared/MenuCartFloatingButton";
import PublicMenuCategoryTabs from "../../../components/menu/shared/menuUi/PublicMenuCategoryTabs";
import MenuSectionTabs from "../../../components/menu/shared/menuUi/MenuSectionTabs";
import PreparedItemsSection from "../../../components/menu/shared/prepared-items/PreparedItemsSection";

import MenuCatalogModeLayout from "../../../components/menu/shared/menu-sets/MenuCatalogModeLayout";

import {
  createMenuSetNavigationKey,
  clearMenuSetNavigationState,
  getMenuSetCart,
  saveMenuSetCart,
  saveMenuSetReturnPath,
} from "../../../hooks/menu/menu-sets/menuSetNavigationStore";

import {
  getCatalogModeVisibility,
  normalizeMenuSetCatalog,
} from "../../../hooks/menu/menu-sets/menuSet.utils";

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
  const location = useLocation();
  const [sp] = useSearchParams();

  const menuSetContextKeyRef = useRef(null);
  const catalogRequestRef = useRef(0);

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
  const [menuSetsPayload, setMenuSetsPayload] = useState(null);
  const [menuSetsNotice, setMenuSetsNotice] = useState("");
  const [hydratedMenuSetKey, setHydratedMenuSetKey] = useState(null);

  const [selectedMenuId, setSelectedMenuId] = useState(null);

  const preparedItems = usePreparedItemsCollection({
    enabled: Boolean(selectedMenuId),
    contextKey: selectedMenuId ? `cashier-direct:${selectedMenuId}` : "cashier-direct:none",
    loader: selectedMenuId ? () => fetchPreparedItems(selectedMenuId) : null,
  });

  const cartOrder = useCashierDirectCartAndOrder({
    returnSaleId,
    selectedMenuId,
    onPreparedItemsRefresh: preparedItems.refetch,
    onCommitted: () => {
      if (menuSetContextKeyRef.current) {
        clearMenuSetNavigationState(menuSetContextKeyRef.current);
      }
    },
  });

  const composite = useCompositeDrafts();

  useEffect(() => {
    if (!selectedMenuId || preparedItems.loading) {
      return;
    }

    cartOrder.reconcilePreparedItems?.(preparedItems.items);
  }, [
    selectedMenuId,
    preparedItems.items,
    preparedItems.loading,
    cartOrder.reconcilePreparedItems,
  ]);

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
  
  /*
  * El catálogo de Conjuntos respeta la modalidad configurada en la sucursal.
  * Los productos normales y los Conjuntos comparten el menú seleccionado.
  */
  const menuSetCatalog = useMemo(() => {
    return normalizeMenuSetCatalog(menuSetsPayload);
  }, [menuSetsPayload]);

  const catalogMode = menuSetCatalog.catalogMode || data?.catalog_mode || null;
  const catalogVisibility = getCatalogModeVisibility(catalogMode);
  const menuSets = menuSetCatalog.menuSets;

  const filteredMenuSets = useMemo(() => {
    const search = String(q || "").trim().toLocaleLowerCase("es-MX");
    if (!search) return menuSets;

    return menuSets.filter((set) => {
      const content = `${set.name || ""} ${set.description || ""}`.toLocaleLowerCase("es-MX");
      return content.includes(search);
    });
  }, [menuSets, q]);

  /*
  * Cada caja, menú y venta existente conserva un contexto independiente.
  * La venta existente utiliza siempre el menú original de su orden.
  */
  const menuSetNavigationContext = useMemo(() => {
    const branchId = Number(
      data?.branch_id || data?.branch?.id ||
      menuSetsPayload?.data?.branch_id || cartOrder.activeOrder?.branch_id || 0
    );

    const menuId = Number(
      isEditingExistingDirectOrder
        ? cartOrder.activeOrder?.menu_id || 0
        : selectedMenuId || 0
    );

    if (!branchId || !menuId) return null;

    return {
      channel: "caja",
      restaurantId: Number(data?.restaurant_id || data?.restaurant?.id || 0) || null,
      branchId,
      menuId,
      orderId: isEditingExistingDirectOrder ? orderIdFromQuery : null,
      saleId: isEditingExistingDirectOrder
        ? Number(cartOrder.activeSale?.id || returnSaleId || 0) || null
        : null,
    };
  }, [
    data, menuSetsPayload, selectedMenuId, isEditingExistingDirectOrder,
    orderIdFromQuery, returnSaleId, cartOrder.activeOrder, cartOrder.activeSale,
  ]);

  const menuSetNavigationKey = useMemo(() => {
    return createMenuSetNavigationKey(menuSetNavigationContext);
  }, [menuSetNavigationContext]);

  menuSetContextKeyRef.current = menuSetNavigationKey;

  /*
  * Recuperar la captura al regresar de la pantalla de Conjuntos.
  * La sincronización comienza después de recuperar el carrito guardado,
  * para evitar sobrescribirlo con un carrito vacío al montar la página.
  */
  useEffect(() => {
    if (!menuSetNavigationKey) {
      setHydratedMenuSetKey(null);
      return;
    }

    const savedCart = getMenuSetCart(menuSetNavigationKey);
    if (Array.isArray(savedCart)) cartOrder.setCart(savedCart);

    setHydratedMenuSetKey(menuSetNavigationKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuSetNavigationKey]);

  useEffect(() => {
    if (!menuSetNavigationKey || hydratedMenuSetKey !== menuSetNavigationKey) return;
    saveMenuSetCart(menuSetNavigationKey, cartOrder.cart);
  }, [menuSetNavigationKey, hydratedMenuSetKey, cartOrder.cart]);

  /*
  * Los Conjuntos se actualizan según la disponibilidad del catálogo.
  * El servidor vuelve a validar inventario, etapas y capacidad al guardar.
  */
  useEffect(() => {
    if (menuSetsPayload?.ok !== true) return;
    cartOrder.reconcileMenuSetsAvailability(menuSets);
  }, [menuSetsPayload, menuSets, cartOrder.reconcileMenuSetsAvailability]);

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

  useEffect(() => {
    if (categoryFilter === "all") return;

    const categoryStillExists = categoryOptions.some(
      (option) => String(option?.value) === String(categoryFilter)
    );

    if (!categoryStillExists) setCategoryFilter("all");
  }, [categoryFilter, categoryOptions]);

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

  const savedRootCount = useMemo(() => {
    return buildOldItemsTree(cartOrder.oldItems).length;
  }, [cartOrder.oldItems]);

  const cartDrawerItemCount =
    Number(cartOrder.cart?.length || 0) + savedRootCount;

  const hasCartContent =
    (Array.isArray(cartOrder.cart) && cartOrder.cart.length > 0) ||
    (Array.isArray(cartOrder.oldItems) && cartOrder.oldItems.length > 0);

  const canAppend = cartOrder.canAppend;
  const canSelect = !isEditingExistingDirectOrder || canAppend;
  const hasInvalidItems = Boolean(cartOrder.hasInvalidCartItems);
  const invalidItemsCount = Math.max(0, Number(cartOrder.invalidCartItemsCount || 0));
  const submitBlockReason =
    "Hay productos que ya no están disponibles. Quítalos para continuar.";

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
    indicateProgress = false,
  } = {}) => {
    const requestId = ++catalogRequestRef.current;

    if (!silent) {
      setLoading(true);
      setErrorMsg("");
    } else if (indicateProgress) {
      setSyncing(true);
    }

    /*
    * Cuando menuId no se envía explícitamente:
    * 1. Una venta existente utiliza el menu_id de su orden.
    * 2. Una venta nueva conserva el menú seleccionado actualmente.
    * 3. Si todavía no existe selección, el backend devuelve
    *    el menú predeterminado.
    */
    const currentMenuId = Number(cartOrder.activeOrder?.menu_id || selectedMenuId || 0);
    const requestedMenuId = menuId === undefined
      ? currentMenuId || null
      : Number(menuId || 0) || null;

    try {
      const res = await fetchCashierDirectMenu(
        requestedMenuId ? { menuId: requestedMenuId } : undefined
      );

      if (requestId !== catalogRequestRef.current) return null;

      const payload = res?.data ? res.data : res;
      const resolvedMenuId = Number(
        payload?.selected_menu?.id || payload?.default_menu_id || requestedMenuId || 0
      ) || null;

      setData(payload || null);
      setSelectedMenuId(resolvedMenuId);

      /*
      * Consultar Conjuntos con el mismo menú.
      * En una corrección también se envía order_id.
      */
      try {
        const setsResponse = await fetchCashierDirectMenuSets({
          menuId: resolvedMenuId,
          orderId: isEditingExistingDirectOrder ? orderIdFromQuery : null,
        });

        if (requestId !== catalogRequestRef.current) return null;

        if (setsResponse?.ok === false) {
          throw new Error(setsResponse?.message || "No se pudieron consultar los Conjuntos.");
        }

        setMenuSetsPayload(setsResponse);
        setMenuSetsNotice("");
      } catch (error) {
        if (requestId !== catalogRequestRef.current) return null;

        setMenuSetsPayload(null);
        setMenuSetsNotice(
          String(error?.response?.data?.message || error?.message || "No se pudieron cargar los Conjuntos.")
        );
      }

      return payload || null;
    } catch (error) {
      if (requestId !== catalogRequestRef.current) return null;

      const code = error?.response?.data?.code;
      const message = error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "No se pudo cargar el menú de caja directa.";

      if (code === "NO_OPEN_CASH_SESSION") {
        navigate("/staff/cashier", { replace: true });
        return null;
      }

      if (!silent) {
        setErrorMsg(String(message));
        setData(null);
        setMenuSetsPayload(null);
      } else {
        setMenuSetsNotice(String(message));
      }

      return null;
    } finally {
      if (requestId === catalogRequestRef.current) {
        if (!silent) setLoading(false);
        setSyncing(false);
      }
    }
  };

  const availabilityMenuId =
    Number(
      isEditingExistingDirectOrder
        ? cartOrder.activeOrder?.menu_id
        : selectedMenuId || data?.selected_menu?.id || defaultMenuId || 0
    ) || null;

  useMenuAvailabilityRealtime({
    echo,
    data,
    enabled: Boolean(
      availabilityMenuId &&
        data?.realtime?.channel_type &&
        data?.realtime?.channel &&
        data?.realtime?.event
    ),
    onAvailabilityEvent: async (event) => {
      const affectedMenuIds = (Array.isArray(event?.affected_menu_ids)
        ? event.affected_menu_ids
        : []
      )
        .map((menuId) => Number(menuId || 0))
        .filter((menuId) => menuId > 0);

      if (
        affectedMenuIds.length > 0 &&
        !affectedMenuIds.includes(availabilityMenuId)
      ) {
        return;
      }

      const refreshedPayload = await load({
        silent: true,
        menuId: availabilityMenuId,
      });

      if (!refreshedPayload) return;

      cartOrder.reconcileCartAvailability?.(refreshedPayload);
      await preparedItems.refetch().catch(() => {});
    },
  });
  
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
    if (menuSetNavigationKey) {
      clearMenuSetNavigationState(menuSetNavigationKey);
    }

    if (menuSetNavigationContext) {
      clearMenuSetNavigationState({
        ...menuSetNavigationContext,
        menuId: normalizedMenuId,
        orderId: null,
        saleId: null,
      });
    }

    resetPendingCaptureForMenuChange();
    setMenuSetsPayload(null);
    setMenuSetsNotice("");

    await load({
      silent: true,
      menuId: normalizedMenuId,
      indicateProgress: true,
    });
  };

  /*
  * Abre el configurador compartido mediante su propia ruta.
  * El carrito y la ruta de regreso se conservan por contexto.
  */
  const handleOpenMenuSet = (menuSet, options = {}) => {
    if (syncing) return;

    if (!canSelect) {
      setMenuSetsNotice("Esta venta ya no permite agregar ni modificar productos.");
      return;
    }

    if (!menuSet?.id || !menuSetNavigationKey || !menuSetNavigationContext) {
      setMenuSetsNotice("No se pudo identificar el menú de esta venta.");
      return;
    }

    const editCartKey = String(options?.editCartKey || "");
    if (!editCartKey && menuSet.isSellable === false) {
      const reason = menuSet.source?.unavailability_reason
        || menuSet.availability?.reason
        || "Este Conjunto no está disponible por el momento.";

      setMenuSetsNotice(reason);
      return;
    }

    const savedCart = saveMenuSetCart(menuSetNavigationKey, cartOrder.cart);
    if (!savedCart?.ok) {
      setMenuSetsNotice(savedCart?.message || "No se pudo conservar tu selección.");
      return;
    }

    const returnPath = `${location.pathname}${location.search}`;
    const savedReturn = saveMenuSetReturnPath(menuSetNavigationKey, returnPath, menuSet.id);

    if (!savedReturn?.ok) {
      setMenuSetsNotice(savedReturn?.message || "No se pudo preparar el configurador.");
      return;
    }

    setCartDrawerOpen(false);

    navigate(`/staff/cashier/direct-order/conjuntos/${menuSet.id}`, {
      state: {
        menuSet,
        menuSetId: menuSet.id,
        navigationContext: menuSetNavigationContext,
        returnPath,
        channel: "caja",
        ...(editCartKey ? {
          editCartKey,
          initialSelections: options.initialSelections,
        } : {}),
      },
    });
  };

  /*
  * La edición reemplaza una partida pendiente, conservando su identificador.
  * No modifica productos ya guardados en una venta existente.
  */
  const handleEditMenuSet = (item) => {
    const menuSet = menuSets.find((set) => Number(set.id) === Number(item?.menu_set_id));

    if (!menuSet || !item?.key) {
      setMenuSetsNotice("No se encontró el Conjunto que deseas modificar.");
      return;
    }

    const stages = Array.isArray(item?.display_stages) && item.display_stages.length > 0
      ? item.display_stages
      : Array.isArray(item?.selections) ? item.selections : [];

    handleOpenMenuSet(menuSet, {
      editCartKey: item.key,
      initialSelections: {
        menuSetId: Number(menuSet.id),
        currentStep: 0,
        selections: stages,
      },
    });
  };

  const handlePreparedItemSelect = (preparedItem) => {
    if (!canSelect || syncing) return;

    const result = cartOrder.addPreparedItem(preparedItem);

    if (result?.ok) {
      setCartDrawerOpen(true);
    }
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
    if (!canSelect || syncing) return;

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
    if (!canSelect || syncing) return;

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
    if (!canSelect || syncing) return;

    composite.resetDraftForProduct(product);
    setSelectedCompositeProduct(product);
    setCompositeModalOpen(true);
  };

  const confirmCompositeSelection = () => {
    if (!canSelect || syncing || !selectedCompositeProduct) return;

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
    if (!canSelect || syncing || !selectedExtrasProduct) {
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
    if (hasInvalidItems) {
      cartOrder.setSendToast(submitBlockReason);
      return;
    }

    if (isEditingExistingDirectOrder) {
      if (!canAppend && cartOrder.cart.length > 0) {
        cartOrder.setSendToast(
          "⚠️ Esta venta ya no permite agregar productos. Quita los productos pendientes para continuar."
        );
        return;
      }

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
    if (hasInvalidItems) {
      cartOrder.setSendToast(submitBlockReason);
      return { ok: false, availabilityError: true };
    }

    const nextName = String(customer_name || "").trim();

    cartOrder.setCustomerName(nextName);

    if (kitchen_flow) {
      cartOrder.setKitchenFlow(kitchen_flow);
    }

    return cartOrder.createFirstOrder({
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
              ? canAppend
                ? "Puedes retirar productos permitidos o agregar nuevos a esta venta. Antes de continuar al cobro, se revisará el inventario."
                : "Esta venta ya no permite modificar sus productos. Puedes revisar su estado antes de continuar al cobro."
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
          totalVisible={catalogVisibility.showNormalProducts ? filteredProducts.length : filteredMenuSets.length}
          onOpenCart={() => setCartDrawerOpen(true)}
          syncing={syncing}
        />

        <MenuCatalogModeLayout
          catalogMode={catalogMode}
          menuSets={filteredMenuSets}
          themeColor="#FF7A00"
          onOpenMenuSet={handleOpenMenuSet}
          loading={loading || syncing}
          normalContent={
            <>

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

                <PreparedItemsSection
                  items={preparedItems.items}
                  loading={preparedItems.loading || syncing}
                  selectedPreparedItemIds={cartOrder.selectedPreparedItemIds}
                  onSelect={handlePreparedItemSelect}
                />
              </Box>
            </>
          }
        />
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
            ? canAppend
              ? "Revisa los productos de la venta. Puedes agregar nuevos o retirar los permitidos."
              : "Esta venta no permite modificar productos. Revisa la información antes de continuar."
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
              ? "Para continuar al cobro, la venta debe tener productos vigentes y su inventario debe estar validado."
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
          menuSets={menuSets}
          allowOldMenuSetRemoval={false}
          onEditMenuSet={canSelect ? handleEditMenuSet : undefined}
          sendToast={cartOrder.sendToast}
          sending={cartOrder.sending}
          canAppend={canAppend}
          canSubmit={
            !hasInvalidItems &&
            (isEditingExistingDirectOrder
              ? canAppend
                ? hasOld || cartOrder.cart.length > 0
                : hasOld && cartOrder.cart.length === 0
              : cartOrder.cart.length > 0)
          }
          hasInvalidItems={hasInvalidItems}
          invalidItemsCount={invalidItemsCount}
          submitBlockReason={submitBlockReason}
          submitLabel={isEditingExistingDirectOrder ? "Cobrar" : undefined}
          onEmpty={() => cartOrder.setCart([])}
          onSubmit={handleSubmitCart}
          onQtyChange={canSelect ? cartOrder.setCartQty : undefined}
          onNotesChange={canSelect ? cartOrder.setCartNotes : undefined}
          onRemove={cartOrder.removeCartItem}
          onRemoveOldItem={canAppend ? (orderItem) => {
            const orderItemId = Number(orderItem?.id || orderItem?.order_item_id || 0);
            if (!orderItemId) return;

            cartOrder.removeExistingOrderItem(orderItemId, {
              returnToSaleDetail: false,
            });
          } : undefined}
          statusBadges={[
            { tone: "dark", label: "💵 Caja directa" },
            ...(canAppend
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
                    label: `Actuales: ${savedRootCount}`,
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

      <Snackbar
        open={Boolean(menuSetsNotice)}
        autoHideDuration={3000}
        onClose={(_event, reason) => {
          if (reason !== "clickaway") setMenuSetsNotice("");
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setMenuSetsNotice("")}
          sx={{ width: "100%", borderRadius: 1 }}
        >
          {menuSetsNotice}
        </Alert>
      </Snackbar>
    </PageContainer>
  );
}