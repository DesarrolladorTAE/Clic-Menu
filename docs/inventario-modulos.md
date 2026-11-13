# Inventario de módulos y dependencias

[Volver al índice](../README.md)

Cobertura: 859 archivos de src. Inventario estático del 13 de noviembre de 2026. Los imports son relaciones directas, no una garantía de ejecución. Las firmas y estados permiten localizar responsabilidades sin atribuirles reglas que no existen. Los módulos sin consumidores directos quedan señalados; una dependencia transitiva puede usarse desde una página.

## Navegación del anexo

- [components](#components)
- [pages](#pages)
- [routes](#routes)
- [services](#services)
- [context](#context)
- [hooks](#hooks)
- [layouts](#layouts)
- [realtime](#realtime)
- [seo](#seo)
- [styles](#styles)
- [theme](#theme)
- [utils](#utils)
- [otros](#otros)

## components

### components/auth/AuthBrandPanel.jsx

Fuente: [src/components/auth/AuthBrandPanel.jsx](../src/components/auth/AuthBrandPanel.jsx). 71 líneas.

Exportaciones: `default: AuthBrandPanel`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/auth/Login.jsx](../src/pages/auth/Login.jsx), [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx), [src/pages/staff/StaffLogin.jsx](../src/pages/staff/StaffLogin.jsx), [src/pages/system-admin/SystemAdminLogin.jsx](../src/pages/system-admin/SystemAdminLogin.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `logoSrc`, `logoAlt`, `title`, `subtitle`, `side`.

### components/auth/ForgotPasswordModal.jsx

Fuente: [src/components/auth/ForgotPasswordModal.jsx](../src/components/auth/ForgotPasswordModal.jsx). 283 líneas.

Exportaciones: `default: ForgotPasswordModal`.

Dependencias internas: [src/utils/phone.js](../src/utils/phone.js) (`normalizePhone`); [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/services/auth/auth.service.js](../src/services/auth/auth.service.js) (`requestPasswordResetCode`, `resetPassword`).

Consumidores directos: [src/pages/auth/Login.jsx](../src/pages/auth/Login.jsx).

Estados locales (`useState`): `step`, `globalMsg`, `busy`, `cooldown`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`.

### components/auth/TermsModal.jsx

Fuente: [src/components/auth/TermsModal.jsx](../src/components/auth/TermsModal.jsx). 419 líneas.

Exportaciones: `default: TermsModal`.

Dependencias internas: [src/services/auth/auth.service.js](../src/services/auth/auth.service.js) (`acceptTerms`); [src/services/legal/legalDocuments.service.js](../src/services/legal/legalDocuments.service.js) (`getClicmenuTerms`).

Consumidores directos: [src/pages/auth/Login.jsx](../src/pages/auth/Login.jsx), [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx).

Estados locales (`useState`): `busy`, `err`, `terms`, `termsLoading`, `termsError`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onAccepted`, `pendingTermsUser`, `mode`.

### components/catalog/CatalogBranchSelectorCard.jsx

Fuente: [src/components/catalog/CatalogBranchSelectorCard.jsx](../src/components/catalog/CatalogBranchSelectorCard.jsx). 68 líneas.

Exportaciones: `default: CatalogBranchSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`.

### components/catalog/CatalogContextCard.jsx

Fuente: [src/components/catalog/CatalogContextCard.jsx](../src/components/catalog/CatalogContextCard.jsx). 58 líneas.

Exportaciones: `default: CatalogContextCard`.

Dependencias internas: [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx) (`ContextOverview`).

Consumidores directos: [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `contextData`.

### components/catalog/CatalogFiltersCard.jsx

Fuente: [src/components/catalog/CatalogFiltersCard.jsx](../src/components/catalog/CatalogFiltersCard.jsx). 150 líneas.

Exportaciones: `default: CatalogFiltersCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `search`, `onChangeSearch`, `sections`, `sectionId`, `onChangeSection`, `categories`, `categoryId`, `onChangeCategory`, `onlyActiveProducts`, `onChangeOnlyActiveProducts`, `filteredCount`, `totalCount`.

### components/catalog/CatalogHeader.jsx

Fuente: [src/components/catalog/CatalogHeader.jsx](../src/components/catalog/CatalogHeader.jsx). 53 líneas.

Exportaciones: `default: CatalogHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `mode`, `modeHelp`.

### components/catalog/CatalogInstructionsCard.jsx

Fuente: [src/components/catalog/CatalogInstructionsCard.jsx](../src/components/catalog/CatalogInstructionsCard.jsx). 81 líneas.

Exportaciones: `default: CatalogInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/catalog/CatalogProductsPanel.jsx

Fuente: [src/components/catalog/CatalogProductsPanel.jsx](../src/components/catalog/CatalogProductsPanel.jsx). 422 líneas.

Exportaciones: `default: CatalogProductsPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `total`, `page`, `totalPages`, `startItem`, `endItem`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onToggle`, `isSaving`, `selectedBranchId`, `title`, `text`, `label`, `value`.

### components/common/AppAlert.jsx

Fuente: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx). 54 líneas.

Exportaciones: `default: AppAlert`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/floor/qr/BranchQrExportModal.jsx](../src/components/floor/qr/BranchQrExportModal.jsx), [src/components/inventory/IngredientFormModal.jsx](../src/components/inventory/IngredientFormModal.jsx), [src/components/inventory/IngredientGroupUpsertModal.jsx](../src/components/inventory/IngredientGroupUpsertModal.jsx), [src/components/inventory/IngredientPresentationFormModal.jsx](../src/components/inventory/IngredientPresentationFormModal.jsx), [src/components/inventory/IngredientsGroupWizard.jsx](../src/components/inventory/IngredientsGroupWizard.jsx), [src/components/inventory/purchases/PurchaseIngredientItemModal.jsx](../src/components/inventory/purchases/PurchaseIngredientItemModal.jsx), [src/components/inventory/purchases/PurchaseProductItemModal.jsx](../src/components/inventory/purchases/PurchaseProductItemModal.jsx), [src/components/inventory/purchases/PurchaseUpsertModal.jsx](../src/components/inventory/purchases/PurchaseUpsertModal.jsx), [src/components/inventory/shared/movement/ManualMovementModal.jsx](../src/components/inventory/shared/movement/ManualMovementModal.jsx), [src/components/inventory/SupplierUpsertModal.jsx](../src/components/inventory/SupplierUpsertModal.jsx), [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx), [src/components/inventory/warehouses/WarehouseUpsertModal.jsx](../src/components/inventory/warehouses/WarehouseUpsertModal.jsx), [src/components/menu/MenuCategoriesPanel.jsx](../src/components/menu/MenuCategoriesPanel.jsx), [src/components/menu/MenuCategoryUpsertModal.jsx](../src/components/menu/MenuCategoryUpsertModal.jsx), [src/components/menu/MenuSectionsPanel.jsx](../src/components/menu/MenuSectionsPanel.jsx), [src/components/menu/MenuSectionUpsertModal.jsx](../src/components/menu/MenuSectionUpsertModal.jsx), [src/components/menu/menuSets/manage/products/MenuSetProductForm.jsx](../src/components/menu/menuSets/manage/products/MenuSetProductForm.jsx), [src/components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx), [src/components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx), [src/components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx), [src/components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx), [src/components/menu/modifiers/ModifierGroupsPanel.jsx](../src/components/menu/modifiers/ModifierGroupsPanel.jsx), [src/components/menu/modifiers/ModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/ModifierGroupUpsertModal.jsx), [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx), [src/components/menu/modifiers/ModifierOptionsPanel.jsx](../src/components/menu/modifiers/ModifierOptionsPanel.jsx), [src/components/menu/modifiers/ModifierOptionUpsertModal.jsx](../src/components/menu/modifiers/ModifierOptionUpsertModal.jsx), [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx), [src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx](../src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx), [src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx), [src/components/menu/staff/WaiterCancellationDialog.jsx](../src/components/menu/staff/WaiterCancellationDialog.jsx), [src/components/operation/prepared-items/PreparedItemPolicyDialog.jsx](../src/components/operation/prepared-items/PreparedItemPolicyDialog.jsx), [src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx](../src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx), [src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx), [src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx), [src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx), [src/components/staff/CashRegisterUpsertModal.jsx](../src/components/staff/CashRegisterUpsertModal.jsx), [src/components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx](../src/components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx), [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx), [src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx](../src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx), [src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx](../src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx), [src/components/system-admin/owners/SystemOwnerUpsertModal.jsx](../src/components/system-admin/owners/SystemOwnerUpsertModal.jsx), [src/components/variants/content/VariantAttributeFormContent.jsx](../src/components/variants/content/VariantAttributeFormContent.jsx), [src/components/variants/content/VariantAttributesContent.jsx](../src/components/variants/content/VariantAttributesContent.jsx), [src/components/variants/content/VariantAttributeValuesContent.jsx](../src/components/variants/content/VariantAttributeValuesContent.jsx), [src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx), [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx), [src/components/variants/content/VariantDetailContent.jsx](../src/components/variants/content/VariantDetailContent.jsx), [src/components/variants/content/VariantImageContent.jsx](../src/components/variants/content/VariantImageContent.jsx), [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx), [src/layouts/CashierLayout.jsx](../src/layouts/CashierLayout.jsx), [src/layouts/RestaurantAdminLayout.jsx](../src/layouts/RestaurantAdminLayout.jsx), [src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx), [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx), [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx), [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx), [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx), [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx), [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx), [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx), [src/pages/inventory/IngredientsPage.jsx](../src/pages/inventory/IngredientsPage.jsx), [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx), [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx), [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx), [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx), [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx), [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx), [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx), [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx), [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx), [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx), [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx), [src/pages/menu/menuSets/create/MenuSetCreatePage.jsx](../src/pages/menu/menuSets/create/MenuSetCreatePage.jsx), [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx), [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx), [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx), [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx), [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx), [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx), [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx), [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx), [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx), [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx), [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx), [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx), [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx), [src/pages/owner/billing/OwnerBillingPage.jsx](../src/pages/owner/billing/OwnerBillingPage.jsx), [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx), [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx), [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx), [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx), [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx), [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx), [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx), [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx), [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx), [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx), [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx), [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx), [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx), [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx), [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx), [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx), [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx), [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx), [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx), [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx), [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx), [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx), [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx), [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx), [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx), [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx), [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx), [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `severity`, `title`, `message`, `autoHideDuration`, `anchorOrigin`.

### components/common/ContextOverview.jsx

Fuente: [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx). 155 líneas.

Exportaciones: `default: ContextOverview`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/catalog/CatalogContextCard.jsx](../src/components/catalog/CatalogContextCard.jsx), [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx), [src/components/menu/menus/menuContent/MenuSetsTab.jsx](../src/components/menu/menus/menuContent/MenuSetsTab.jsx), [src/components/menu/menuSets/manage/MenuSetGeneralTab.jsx](../src/components/menu/menuSets/manage/MenuSetGeneralTab.jsx), [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx), [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx), [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx), [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `items`, `description`, `icon`, `value`, `chipLabel`, `chipColor`.

### components/common/PageContainer.jsx

Fuente: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx). 49 líneas.

Exportaciones: `default: PageContainer`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx), [src/components/products/CompositionWizard.jsx](../src/components/products/CompositionWizard.jsx), [src/components/products/recipes/ProductRecipeEditorModal.jsx](../src/components/products/recipes/ProductRecipeEditorModal.jsx), [src/components/staff/casher/shared/CashierDialogShell.jsx](../src/components/staff/casher/shared/CashierDialogShell.jsx), [src/components/variants/content/VariantAttributeFormContent.jsx](../src/components/variants/content/VariantAttributeFormContent.jsx), [src/components/variants/content/VariantAttributesContent.jsx](../src/components/variants/content/VariantAttributesContent.jsx), [src/components/variants/content/VariantAttributeValuesContent.jsx](../src/components/variants/content/VariantAttributeValuesContent.jsx), [src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx), [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx), [src/components/variants/content/VariantDetailContent.jsx](../src/components/variants/content/VariantDetailContent.jsx), [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx), [src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx), [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx), [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx), [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx), [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx), [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx), [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx), [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx), [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx), [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx), [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx), [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx), [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx), [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx), [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx), [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx), [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx), [src/pages/menu/menuSets/create/MenuSetCreatePage.jsx](../src/pages/menu/menuSets/create/MenuSetCreatePage.jsx), [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx), [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx), [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx), [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx), [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx), [src/pages/menu/promotions/PromotionEditPage.jsx](../src/pages/menu/promotions/PromotionEditPage.jsx), [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx), [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx), [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx), [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx), [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx), [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx), [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx), [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx), [src/pages/owner/billing/OwnerBillingPage.jsx](../src/pages/owner/billing/OwnerBillingPage.jsx), [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx), [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx), [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx), [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx), [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx), [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx), [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx), [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx), [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx), [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx), [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx), [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx), [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx), [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx), [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx), [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx), [src/pages/staff/StaffSelectContext.jsx](../src/pages/staff/StaffSelectContext.jsx), [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx), [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx), [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx), [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx), [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx), [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx), [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx), [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx), [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `children`, `maxWidth`, `disableInner`, `sx`, `innerSx`.

### components/common/PaginationFooter.jsx

Fuente: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx). 127 líneas.

Exportaciones: `default: PaginationFooter`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/catalog/CatalogProductsPanel.jsx](../src/components/catalog/CatalogProductsPanel.jsx), [src/components/connection/netpay/NetpayTerminalsCard.jsx](../src/components/connection/netpay/NetpayTerminalsCard.jsx), [src/components/floor/FloorTablesPanel.jsx](../src/components/floor/FloorTablesPanel.jsx), [src/components/floor/qr/BranchQrExportModal.jsx](../src/components/floor/qr/BranchQrExportModal.jsx), [src/components/floor/qr/BranchQrListPanel.jsx](../src/components/floor/qr/BranchQrListPanel.jsx), [src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx](../src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx), [src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx](../src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx), [src/components/inventory/IngredientsGroupWizard.jsx](../src/components/inventory/IngredientsGroupWizard.jsx), [src/components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx](../src/components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx), [src/components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx](../src/components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx), [src/components/inventory/purchases/PurchasesTable.jsx](../src/components/inventory/purchases/PurchasesTable.jsx), [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx), [src/components/inventory/warehouses/reports/InventoryReportPreview.jsx](../src/components/inventory/warehouses/reports/InventoryReportPreview.jsx), [src/components/inventory/warehouses/WarehousesListPanel.jsx](../src/components/inventory/warehouses/WarehousesListPanel.jsx), [src/components/menu/MenuCategoriesPanel.jsx](../src/components/menu/MenuCategoriesPanel.jsx), [src/components/menu/menus/menuChannels/MenuChannelsList.jsx](../src/components/menu/menus/menuChannels/MenuChannelsList.jsx), [src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx](../src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx), [src/components/menu/menus/menuContent/MenuSetsTab.jsx](../src/components/menu/menus/menuContent/MenuSetsTab.jsx), [src/components/menu/menus/MenusList.jsx](../src/components/menu/menus/MenusList.jsx), [src/components/menu/MenuSectionsPanel.jsx](../src/components/menu/MenuSectionsPanel.jsx), [src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx), [src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx), [src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx), [src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx), [src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx), [src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx), [src/components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx](../src/components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx), [src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx](../src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx), [src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx), [src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx), [src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx](../src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx), [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx), [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx), [src/components/menu/modifiers/ModifierGroupsPanel.jsx](../src/components/menu/modifiers/ModifierGroupsPanel.jsx), [src/components/menu/modifiers/ModifierOptionsPanel.jsx](../src/components/menu/modifiers/ModifierOptionsPanel.jsx), [src/components/menu/promotions/form/PromotionConfigurationStep.jsx](../src/components/menu/promotions/form/PromotionConfigurationStep.jsx), [src/components/menu/promotions/form/PromotionProductsStep.jsx](../src/components/menu/promotions/form/PromotionProductsStep.jsx), [src/components/menu/promotions/form/PromotionReviewStep.jsx](../src/components/menu/promotions/form/PromotionReviewStep.jsx), [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx), [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx](../src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx), [src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx), [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx), [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx), [src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx), [src/components/menu/staff/WaiterCancellationDialog.jsx](../src/components/menu/staff/WaiterCancellationDialog.jsx), [src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx), [src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx), [src/components/operation/online-orders/delivery/DeliveryConceptsCard.jsx](../src/components/operation/online-orders/delivery/DeliveryConceptsCard.jsx), [src/components/operation/online-orders/delivery/ScheduledPointDaySchedule.jsx](../src/components/operation/online-orders/delivery/ScheduledPointDaySchedule.jsx), [src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx](../src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx), [src/components/operation/prepared-items/PreparedItemProductsPanel.jsx](../src/components/operation/prepared-items/PreparedItemProductsPanel.jsx), [src/components/owner/addon-history/AddonCatalogPanel.jsx](../src/components/owner/addon-history/AddonCatalogPanel.jsx), [src/components/owner/addon-history/AddonHistoryList.jsx](../src/components/owner/addon-history/AddonHistoryList.jsx), [src/components/owner/billing/OwnerBillingInvoicesTab.jsx](../src/components/owner/billing/OwnerBillingInvoicesTab.jsx), [src/components/owner/billing/OwnerBillingPurchasesTab.jsx](../src/components/owner/billing/OwnerBillingPurchasesTab.jsx), [src/components/owner/subscription-history/SubscriptionHistoryList.jsx](../src/components/owner/subscription-history/SubscriptionHistoryList.jsx), [src/components/products/CandidatePicker.jsx](../src/components/products/CandidatePicker.jsx), [src/components/products/CompositionWizard.jsx](../src/components/products/CompositionWizard.jsx), [src/components/products/productsPage/ProductsPageList.jsx](../src/components/products/productsPage/ProductsPageList.jsx), [src/components/public/order-tracking/order-details/OrderDetailsTab.jsx](../src/components/public/order-tracking/order-details/OrderDetailsTab.jsx), [src/components/reports/profit/ProfitReportPreview.jsx](../src/components/reports/profit/ProfitReportPreview.jsx), [src/components/reports/sales/SalesReportPreview.jsx](../src/components/reports/sales/SalesReportPreview.jsx), [src/components/sales_channels/SalesChannelsList.jsx](../src/components/sales_channels/SalesChannelsList.jsx), [src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx), [src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx](../src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx), [src/components/staff/casher/queuePage/CashierSalesPanel.jsx](../src/components/staff/casher/queuePage/CashierSalesPanel.jsx), [src/components/staff/casher/refunds/CashierRefundSalesPanel.jsx](../src/components/staff/casher/refunds/CashierRefundSalesPanel.jsx), [src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx](../src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx), [src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx](../src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx), [src/components/staff/kitchen/KitchenPreparedItemsDrawer.jsx](../src/components/staff/kitchen/KitchenPreparedItemsDrawer.jsx), [src/components/staff/StaffAssignmentsModal.jsx](../src/components/staff/StaffAssignmentsModal.jsx), [src/components/system-admin/addon-sales/SystemAddonSalesListPanel.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesListPanel.jsx), [src/components/system-admin/billing/invoices/SystemPlatformInvoicesPanel.jsx](../src/components/system-admin/billing/invoices/SystemPlatformInvoicesPanel.jsx), [src/components/system-admin/billing/purchases/SystemPlatformPurchasesPanel.jsx](../src/components/system-admin/billing/purchases/SystemPlatformPurchasesPanel.jsx), [src/components/system-admin/owners/detail/SystemOwnerRestaurantsPanel.jsx](../src/components/system-admin/owners/detail/SystemOwnerRestaurantsPanel.jsx), [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsPanel.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsPanel.jsx), [src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchesPanel.jsx](../src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchesPanel.jsx), [src/components/system-admin/owners/SystemOwnersListPanel.jsx](../src/components/system-admin/owners/SystemOwnersListPanel.jsx), [src/components/system-admin/subscription-sales/SystemSubscriptionSalesListPanel.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesListPanel.jsx), [src/components/variants/content/VariantAttributesContent.jsx](../src/components/variants/content/VariantAttributesContent.jsx), [src/components/variants/content/VariantAttributeValuesContent.jsx](../src/components/variants/content/VariantAttributeValuesContent.jsx), [src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx), [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx), [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx), [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx), [src/pages/inventory/IngredientsPage.jsx](../src/pages/inventory/IngredientsPage.jsx), [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx), [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx), [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx), [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx), [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx), [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx), [src/pages/public/public-menu-entry/PublicMenuProductsGrid.jsx](../src/pages/public/public-menu-entry/PublicMenuProductsGrid.jsx), [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx), [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx), [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx), [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx), [src/pages/staff/RestaurantStaffPage.jsx](../src/pages/staff/RestaurantStaffPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx), [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `itemLabel`.

### components/connection/netpay/NetpayInstructionsCard.jsx

Fuente: [src/components/connection/netpay/NetpayInstructionsCard.jsx](../src/components/connection/netpay/NetpayInstructionsCard.jsx). 63 líneas.

Exportaciones: `default: NetpayInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/connection/netpay/NetpayTerminalEditModal.jsx

Fuente: [src/components/connection/netpay/NetpayTerminalEditModal.jsx](../src/components/connection/netpay/NetpayTerminalEditModal.jsx). 305 líneas.

Exportaciones: `default: NetpayTerminalEditModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/connection/netpay/NetpayTerminalsCard.jsx](../src/components/connection/netpay/NetpayTerminalsCard.jsx).

Estados locales (`useState`): `form`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `terminal`, `branches`, `saving`, `onSave`, `label`, `input`, `help`, `value`, `fullWidth`.

### components/connection/netpay/NetpayTerminalsCard.jsx

Fuente: [src/components/connection/netpay/NetpayTerminalsCard.jsx](../src/components/connection/netpay/NetpayTerminalsCard.jsx). 401 líneas.

Exportaciones: `default: NetpayTerminalsCard`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/connection/netpay/NetpayTerminalEditModal.jsx](../src/components/connection/netpay/NetpayTerminalEditModal.jsx) (`NetpayTerminalEditModal`).

Consumidores directos: [src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx).

Estados locales (`useState`): `editing`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `terminals`, `branches`, `savingTerminalId`, `onUpdate`, `onToggleStatus`, `icon`, `label`, `value`, `success`.

### components/connection/tae/TaeAccountCard.jsx

Fuente: [src/components/connection/tae/TaeAccountCard.jsx](../src/components/connection/tae/TaeAccountCard.jsx). 383 líneas.

Exportaciones: `default: TaeAccountCard`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`).

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Estados locales (`useState`): `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `message`, `children`, `label`, `input`, `help`, `error`, `title`, `restaurant`, `account`, `onSave`, `onDelete`, `showToast`, `field`.

### components/connection/tae/TaeCatalogSatStatusCard.jsx

Fuente: [src/components/connection/tae/TaeCatalogSatStatusCard.jsx](../src/components/connection/tae/TaeCatalogSatStatusCard.jsx). 411 líneas.

Exportaciones: `default: TaeCatalogSatStatusCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `catalogSatStatus`, `icon`, `label`, `value`, `helper`, `chipLabel`, `chipColor`.

### components/connection/tae/TaecontaContextCard.jsx

Fuente: [src/components/connection/tae/TaecontaContextCard.jsx](../src/components/connection/tae/TaecontaContextCard.jsx). 180 líneas.

Exportaciones: `default: TaecontaContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurant`, `account`, `contextData`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/connection/tae/TaecontaHeader.jsx

Fuente: [src/components/connection/tae/TaecontaHeader.jsx](../src/components/connection/tae/TaecontaHeader.jsx). 52 líneas.

Exportaciones: `default: TaecontaHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurant`, `isConnected`.

### components/connection/tae/TaecontaInstructionsCard.jsx

Fuente: [src/components/connection/tae/TaecontaInstructionsCard.jsx](../src/components/connection/tae/TaecontaInstructionsCard.jsx). 79 líneas.

Exportaciones: `default: TaecontaInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `isConnected`, `step`, `text`.

### components/connection/tae/TaecontaTabs.jsx

Fuente: [src/components/connection/tae/TaecontaTabs.jsx](../src/components/connection/tae/TaecontaTabs.jsx). 88 líneas.

Exportaciones: `default: TaecontaTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/connection/tae/TaeInvoiceSettingsCard.jsx

Fuente: [src/components/connection/tae/TaeInvoiceSettingsCard.jsx](../src/components/connection/tae/TaeInvoiceSettingsCard.jsx). 730 líneas.

Exportaciones: `default: TaeInvoiceSettingsCard`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`).

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Estados locales (`useState`): `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `message`, `children`, `label`, `input`, `help`, `error`, `title`, `description`, `checked`, `disabled`, `onChange`, `payload`, `onSave`, `onDelete`, `showToast`, `field`.

### components/connection/tae/TaeInvoiceSettingsContextCard.jsx

Fuente: [src/components/connection/tae/TaeInvoiceSettingsContextCard.jsx](../src/components/connection/tae/TaeInvoiceSettingsContextCard.jsx). 172 líneas.

Exportaciones: `default: TaeInvoiceSettingsContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `payload`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/connection/tae/TaeTaxProfileCard.jsx

Fuente: [src/components/connection/tae/TaeTaxProfileCard.jsx](../src/components/connection/tae/TaeTaxProfileCard.jsx). 267 líneas.

Exportaciones: `default: TaeTaxProfileCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `profile`, `title`, `children`, `label`, `value`.

### components/connection/whasapo/chatinbot/ChatingBootConnectionCard.jsx

Fuente: [src/components/connection/whasapo/chatinbot/ChatingBootConnectionCard.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootConnectionCard.jsx). 901 líneas.

Exportaciones: `default: ChatingBootConnectionCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `addonAvailable`, `connection`, `reconnectRequired`, `loading`, `working`, `confirmingDelete`, `onCreate`, `onRequestDelete`, `onCancelDelete`, `onDelete`, `state`, `value`, `number`, `children`, `last`, `label`, `icon`.

### components/connection/whasapo/chatinbot/ChatingBootContextCard.jsx

Fuente: [src/components/connection/whasapo/chatinbot/ChatingBootContextCard.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootContextCard.jsx). 219 líneas.

Exportaciones: `default: ChatingBootContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `addonAvailable`, `connection`, `reconnectRequired`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/connection/whasapo/chatinbot/ChatingBootPanel.jsx

Fuente: [src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx). 372 líneas.

Exportaciones: `default: ChatingBootPanel`.

Dependencias internas: [src/components/connection/whasapo/chatinbot/ChatingBootContextCard.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootContextCard.jsx) (`ChatingBootContextCard`); [src/components/connection/whasapo/chatinbot/ChatingBootConnectionCard.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootConnectionCard.jsx) (`ChatingBootConnectionCard`); [src/services/connection/whatsapp/chatingBootConnection.service.js](../src/services/connection/whatsapp/chatingBootConnection.service.js) (`createBranchWhatsappQrConnection`, `deleteBranchWhatsappQrConnection`, `getBranchWhatsappQrConnection`, `getBranchWhatsappQrConnectionStatus`).

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

Estados locales (`useState`): `loading`, `working`, `preparingQr`, `connection`, `reconnectRequired`, `confirmingDelete`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `selectedBranch`, `addonAvailable`, `onNotify`, `onConnectionChange`, `severity`, `title`, `message`.

### components/connection/whasapo/WhasapoBranchSelectorCard.jsx

Fuente: [src/components/connection/whasapo/WhasapoBranchSelectorCard.jsx](../src/components/connection/whasapo/WhasapoBranchSelectorCard.jsx). 63 líneas.

Exportaciones: `default: WhasapoBranchSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`.

### components/connection/whasapo/WhasapoChannelPreferenceCard.jsx

Fuente: [src/components/connection/whasapo/WhasapoChannelPreferenceCard.jsx](../src/components/connection/whasapo/WhasapoChannelPreferenceCard.jsx). 391 líneas.

Exportaciones: `default: WhasapoChannelPreferenceCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `preferredChannel`, `effectiveChannel`, `canChooseChannel`, `whasapoAvailable`, `addonWhatsappQrAvailable`, `qrConnected`, `reconnectRequired`, `usingSystemFallback`, `saving`, `disabled`, `hasPendingWhasapoChanges`, `onChangePreferredChannel`, `icon`, `title`, `available`, `availableText`, `unavailableText`.

### components/connection/whasapo/WhasapoConnectionHeader.jsx

Fuente: [src/components/connection/whasapo/WhasapoConnectionHeader.jsx](../src/components/connection/whasapo/WhasapoConnectionHeader.jsx). 77 líneas.

Exportaciones: `default: WhasapoConnectionHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`.

### components/connection/whasapo/WhasapoConnectionTabs.jsx

Fuente: [src/components/connection/whasapo/WhasapoConnectionTabs.jsx](../src/components/connection/whasapo/WhasapoConnectionTabs.jsx). 92 líneas.

Exportaciones: `default: WhasapoConnectionTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`, `whatsappQrDisabled`.

### components/connection/whasapo/WhasapoContextCard.jsx

Fuente: [src/components/connection/whasapo/WhasapoContextCard.jsx](../src/components/connection/whasapo/WhasapoContextCard.jsx). 137 líneas.

Exportaciones: `default: WhasapoContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `form`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/connection/whasapo/WhasapoInstructionsCard.jsx

Fuente: [src/components/connection/whasapo/WhasapoInstructionsCard.jsx](../src/components/connection/whasapo/WhasapoInstructionsCard.jsx). 84 líneas.

Exportaciones: `default: WhasapoInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/connection/whasapo/WhasapoSettingsCard.jsx

Fuente: [src/components/connection/whasapo/WhasapoSettingsCard.jsx](../src/components/connection/whasapo/WhasapoSettingsCard.jsx). 220 líneas.

Exportaciones: `default: WhasapoSettingsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `onChange`, `onSave`, `onReset`, `saving`, `disabled`, `label`, `input`, `help`.

### components/floor/AssignZoneWaiterModal.jsx

Fuente: [src/components/floor/AssignZoneWaiterModal.jsx](../src/components/floor/AssignZoneWaiterModal.jsx). 201 líneas.

Exportaciones: `default: AssignZoneWaiterModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `zone`, `waiters`, `loading`, `saving`, `selectedWaiterId`, `onChangeWaiter`, `onClose`, `onSave`, `formatWaiterLabel`.

### components/floor/FloorBranchSelectorCard.jsx

Fuente: [src/components/floor/FloorBranchSelectorCard.jsx](../src/components/floor/FloorBranchSelectorCard.jsx). 66 líneas.

Exportaciones: `default: FloorBranchSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`.

### components/floor/FloorLegendCard.jsx

Fuente: [src/components/floor/FloorLegendCard.jsx](../src/components/floor/FloorLegendCard.jsx). 101 líneas.

Exportaciones: `default: FloorLegendCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `statusMeta`, `canManageQr`.

### components/floor/FloorPlanContextCard.jsx

Fuente: [src/components/floor/FloorPlanContextCard.jsx](../src/components/floor/FloorPlanContextCard.jsx). 180 líneas.

Exportaciones: `default: FloorPlanContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `settings`, `settingsSummary`, `contextData`, `isDirectAttentionMode`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/floor/FloorPlanHeader.jsx

Fuente: [src/components/floor/FloorPlanHeader.jsx](../src/components/floor/FloorPlanHeader.jsx). 143 líneas.

Exportaciones: `default: FloorPlanHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `zonesCount`, `tablesCount`, `onCreateZone`, `onCreateTable`, `onEditSettings`, `onManageQr`, `canManageQr`, `isDirectAttentionMode`.

### components/floor/FloorPlanInstructionsCard.jsx

Fuente: [src/components/floor/FloorPlanInstructionsCard.jsx](../src/components/floor/FloorPlanInstructionsCard.jsx). 100 líneas.

Exportaciones: `default: FloorPlanInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `isDirectAttentionMode`, `step`, `text`.

### components/floor/FloorTablesPanel.jsx

Fuente: [src/components/floor/FloorTablesPanel.jsx](../src/components/floor/FloorTablesPanel.jsx). 360 líneas.

Exportaciones: `default: FloorTablesPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedZone`, `zoneFilter`, `tables`, `total`, `isDirectAttentionMode`, `page`, `totalPages`, `startItem`, `endItem`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onEditTable`, `onDeleteTable`, `getStatusMeta`, `getStatusLabel`, `formatWaiterFromTable`, `children`.

### components/floor/FloorZonesPanel.jsx

Fuente: [src/components/floor/FloorZonesPanel.jsx](../src/components/floor/FloorZonesPanel.jsx). 335 líneas.

Exportaciones: `default: FloorZonesPanel`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `zones`, `tablesByZone`, `isZoneAssignmentEnabled`, `isDirectAttentionMode`, `onAssignWaiter`, `onEditZone`, `onDeleteZone`.

### components/floor/FloorZoneTabs.jsx

Fuente: [src/components/floor/FloorZoneTabs.jsx](../src/components/floor/FloorZoneTabs.jsx). 95 líneas.

Exportaciones: `default: FloorZoneTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `zones`, `value`, `onChange`, `loading`.

### components/floor/OperationalSettingsModal.jsx

Fuente: [src/components/floor/OperationalSettingsModal.jsx](../src/components/floor/OperationalSettingsModal.jsx). 830 líneas.

Exportaciones: `default: OperationalSettingsModal`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/services/floor/operationalSettings.service.js](../src/services/floor/operationalSettings.service.js) (`createOperationalSettings`, `updateOperationalSettings`).

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Estados locales (`useState`): `saving`, `serverNotices`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `message`, `children`, `label`, `input`, `help`, `error`, `title`, `open`, `mode`, `restaurantId`, `branchId`, `initialData`, `isDirectAttentionMode`, `onClose`, `onSaved`, `onConflictRefresh`, `showToast`, `field`.

### components/floor/qr/BranchQrContextCard.jsx

Fuente: [src/components/floor/qr/BranchQrContextCard.jsx](../src/components/floor/qr/BranchQrContextCard.jsx). 213 líneas.

Exportaciones: `default: BranchQrContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `contextData`, `qrUiMeta`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/floor/qr/BranchQrCreateModal.jsx

Fuente: [src/components/floor/qr/BranchQrCreateModal.jsx](../src/components/floor/qr/BranchQrCreateModal.jsx). 917 líneas.

Exportaciones: `default: BranchQrCreateModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `qrPurpose`, `tableId`, `salesChannelId`, `tableOptions`, `specificChannelOptions`, `orderingMode`, `label`, `input`, `help`, `value`, `selected`, `disabled`, `icon`, `title`, `description`, `disabledReason`, `onSelect`, `open`, `onClose`, `onSubmit`, `busy`, `selectedBranch`, `settings`, `salonChannel`, `whatsappChannel`, `onlineOrderChannel`, `qrUiMeta`, `field`.

### components/floor/qr/BranchQrExportModal.jsx

Fuente: [src/components/floor/qr/BranchQrExportModal.jsx](../src/components/floor/qr/BranchQrExportModal.jsx). 945 líneas.

Exportaciones: `default: BranchQrExportModal`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/services/floor/qr/branchQrCodes.service.js](../src/services/floor/qr/branchQrCodes.service.js) (`exportBranchQrCodesPdf`).

Consumidores directos: [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

Estados locales (`useState`): `loading`, `alert`, `filters`, `selected`, `layout`, `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `branchId`, `items`, `busy`.

### components/floor/qr/BranchQrHeader.jsx

Fuente: [src/components/floor/qr/BranchQrHeader.jsx](../src/components/floor/qr/BranchQrHeader.jsx). 93 líneas.

Exportaciones: `default: BranchQrHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `busy`, `canCreateQr`, `createQrBlockReason`, `onCreate`, `onBack`.

### components/floor/qr/BranchQrInstructionsCard.jsx

Fuente: [src/components/floor/qr/BranchQrInstructionsCard.jsx](../src/components/floor/qr/BranchQrInstructionsCard.jsx). 91 líneas.

Exportaciones: `default: BranchQrInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `qrUiMeta`, `step`, `text`.

### components/floor/qr/BranchQrListPanel.jsx

Fuente: [src/components/floor/qr/BranchQrListPanel.jsx](../src/components/floor/qr/BranchQrListPanel.jsx). 688 líneas.

Exportaciones: `default: BranchQrListPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `qr`, `qrUiMeta`, `orderingMode`, `busy`, `items`, `total`, `page`, `totalPages`, `startItem`, `endItem`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onCopy`, `onToggleActive`, `onDelete`, `onOpen`, `onExport`, `typeLabelMap`, `selectedBranchId`, `label`, `value`, `long`.

### components/floor/qr/BranchQrStatusBanner.jsx

Fuente: [src/components/floor/qr/BranchQrStatusBanner.jsx](../src/components/floor/qr/BranchQrStatusBanner.jsx). 70 líneas.

Exportaciones: `default: BranchQrStatusBanner`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tone`, `title`, `body`.

### components/floor/TableModal.jsx

Fuente: [src/components/floor/TableModal.jsx](../src/components/floor/TableModal.jsx). 782 líneas.

Exportaciones: `default: TableModal`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/services/floor/tables.service.js](../src/services/floor/tables.service.js) (`createTable`, `updateTable`, `getAvailableWaiters`).

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Estados locales (`useState`): `saving`, `waitersLoading`, `waiters`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `message`, `children`, `label`, `input`, `help`, `error`, `title`, `open`, `mode`, `restaurantId`, `branchId`, `zones`, `settings`, `initialData`, `onClose`, `onSaved`, `onConflictRefresh`, `showToast`, `field`.

### components/floor/ZoneModal.jsx

Fuente: [src/components/floor/ZoneModal.jsx](../src/components/floor/ZoneModal.jsx). 443 líneas.

Exportaciones: `default: ZoneModal`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/services/floor/zones.service.js](../src/services/floor/zones.service.js) (`createZone`, `updateZone`); [src/services/restaurant/branchSalesChannels.service.js](../src/services/restaurant/branchSalesChannels.service.js) (`getBranchSalesChannels`).

Consumidores directos: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

Estados locales (`useState`): `saving`, `menusLoading`, `salonMenus`, `menusLoadError`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `message`, `children`, `label`, `input`, `help`, `error`, `open`, `mode`, `restaurantId`, `branchId`, `initialData`, `onClose`, `onSaved`, `onConflictRefresh`, `showToast`, `field`.

### components/inventory/IngredientFormModal.jsx

Fuente: [src/components/inventory/IngredientFormModal.jsx](../src/components/inventory/IngredientFormModal.jsx). 717 líneas.

Exportaciones: `default: IngredientFormModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/services/inventory/ingredients/ingredientsGroups.service.js](../src/services/inventory/ingredients/ingredientsGroups.service.js) (`getIngredientGroups`); [src/components/inventory/IngredientsGroupWizard.jsx](../src/components/inventory/IngredientsGroupWizard.jsx) (`IngredientGroupWizard`).

Consumidores directos: [src/pages/inventory/IngredientsPage.jsx](../src/pages/inventory/IngredientsPage.jsx).

Estados locales (`useState`): `saving`, `alertState`, `code`, `name`, `unit`, `ingredientGroupId`, `groups`, `groupsLoading`, `openGroupWizard`, `wastePercentage`, `isStockItem`, `status`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `editRow`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/inventory/IngredientGroupUpsertModal.jsx

Fuente: [src/components/inventory/IngredientGroupUpsertModal.jsx](../src/components/inventory/IngredientGroupUpsertModal.jsx). 405 líneas.

Exportaciones: `default: IngredientGroupUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/components/inventory/IngredientsGroupWizard.jsx](../src/components/inventory/IngredientsGroupWizard.jsx).

Estados locales (`useState`): `saving`, `alertState`, `name`, `description`, `sortOrder`, `status`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/inventory/IngredientPresentationFormModal.jsx

Fuente: [src/components/inventory/IngredientPresentationFormModal.jsx](../src/components/inventory/IngredientPresentationFormModal.jsx). 676 líneas.

Exportaciones: `default: IngredientPresentationFormModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/services/inventory/suppliers/suppliers.service.js](../src/services/inventory/suppliers/suppliers.service.js) (`getSuppliers`); [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx) (`SupplierWizard`).

Consumidores directos: [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx).

Estados locales (`useState`): `saving`, `alertState`, `code`, `description`, `supplierId`, `purchaseCost`, `yieldQty`, `yieldUnit`, `stockMin`, `stockMax`, `storageLocation`, `status`, `suppliers`, `supLoading`, `openSupplierWizard`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `ingredient`, `editRow`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementFilters.jsx

Fuente: [src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementFilters.jsx](../src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementFilters.jsx). 151 líneas.

Exportaciones: `default: IngredientInventoryMovementFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `ingredientId`, `onChangeIngredientId`, `ingredientOptions`, `type`, `onChangeType`, `reason`, `onChangeReason`, `total`, `label`, `helper`, `children`, `sx`.

### components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx

Fuente: [src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx](../src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx). 318 líneas.

Exportaciones: `default: IngredientInventoryMovementTable`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/inventory/shared/movement/InventoryMovementEmptyState.jsx](../src/components/inventory/shared/movement/InventoryMovementEmptyState.jsx) (`InventoryMovementEmptyState`).

Consumidores directos: [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `paginatedItems`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onCreate`, `label`, `value`.

### components/inventory/ingredients/inventoryStock/IngredientInventoryStockFilters.jsx

Fuente: [src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockFilters.jsx](../src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockFilters.jsx). 135 líneas.

Exportaciones: `default: IngredientInventoryStockFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `q`, `onChangeQ`, `onlyPositive`, `onChangeOnlyPositive`, `groupId`, `onChangeGroupId`, `groupOptions`, `total`, `label`, `helper`, `children`, `sx`.

### components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx

Fuente: [src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx](../src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx). 340 líneas.

Exportaciones: `default: IngredientInventoryStockTable`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/inventory/shared/stock/InventoryStockEmptyState.jsx](../src/components/inventory/shared/stock/InventoryStockEmptyState.jsx) (`InventoryStockEmptyState`).

Consumidores directos: [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `paginatedItems`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onToggleStatus`, `label`, `value`.

### components/inventory/IngredientsGroupWizard.jsx

Fuente: [src/components/inventory/IngredientsGroupWizard.jsx](../src/components/inventory/IngredientsGroupWizard.jsx). 751 líneas.

Exportaciones: `default: IngredientGroupWizard`.

Dependencias internas: [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/services/inventory/ingredients/ingredientsGroups.service.js](../src/services/inventory/ingredients/ingredientsGroups.service.js) (`getIngredientGroups`, `createIngredientGroup`, `updateIngredientGroup`, `deleteIngredientGroup`); [src/components/inventory/IngredientGroupUpsertModal.jsx](../src/components/inventory/IngredientGroupUpsertModal.jsx) (`IngredientGroupUpsertModal`).

Consumidores directos: [src/components/inventory/IngredientFormModal.jsx](../src/components/inventory/IngredientFormModal.jsx).

Estados locales (`useState`): `loading`, `rows`, `savingMap`, `reqTick`, `upsertOpen`, `editing`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `restaurantId`, `onClose`, `onChanged`, `severity`, `title`, `message`.

### components/inventory/products/inventoryMovement/ProductInventoryMovementFilters.jsx

Fuente: [src/components/inventory/products/inventoryMovement/ProductInventoryMovementFilters.jsx](../src/components/inventory/products/inventoryMovement/ProductInventoryMovementFilters.jsx). 150 líneas.

Exportaciones: `default: ProductInventoryMovementFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `productId`, `onChangeProductId`, `productOptions`, `type`, `onChangeType`, `reason`, `onChangeReason`, `total`, `label`, `helper`, `children`, `sx`.

### components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx

Fuente: [src/components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx](../src/components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx). 308 líneas.

Exportaciones: `default: ProductInventoryMovementTable`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/inventory/shared/movement/InventoryMovementEmptyState.jsx](../src/components/inventory/shared/movement/InventoryMovementEmptyState.jsx) (`InventoryMovementEmptyState`).

Consumidores directos: [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `paginatedItems`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onCreate`, `label`, `value`.

### components/inventory/products/inventoryStock/ProductInventoryStockFilters.jsx

Fuente: [src/components/inventory/products/inventoryStock/ProductInventoryStockFilters.jsx](../src/components/inventory/products/inventoryStock/ProductInventoryStockFilters.jsx). 154 líneas.

Exportaciones: `default: ProductInventoryStockFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `q`, `onChangeQ`, `onlyPositive`, `onChangeOnlyPositive`, `categoryId`, `onChangeCategoryId`, `categories`, `status`, `onChangeStatus`, `total`, `label`, `helper`, `children`, `sx`.

### components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx

Fuente: [src/components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx](../src/components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx). 349 líneas.

Exportaciones: `default: ProductInventoryStockTable`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/inventory/shared/stock/InventoryStockEmptyState.jsx](../src/components/inventory/shared/stock/InventoryStockEmptyState.jsx) (`InventoryStockEmptyState`).

Consumidores directos: [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `paginatedItems`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onToggleStatus`, `label`, `value`.

### components/inventory/purchases/PurchaseDetailHeader.jsx

Fuente: [src/components/inventory/purchases/PurchaseDetailHeader.jsx](../src/components/inventory/purchases/PurchaseDetailHeader.jsx). 110 líneas.

Exportaciones: `default: PurchaseDetailHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `purchase`, `onBack`, `onComplete`, `completing`.

### components/inventory/purchases/PurchaseFiltersCard.jsx

Fuente: [src/components/inventory/purchases/PurchaseFiltersCard.jsx](../src/components/inventory/purchases/PurchaseFiltersCard.jsx). 140 líneas.

Exportaciones: `default: PurchaseFiltersCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `status`, `onChangeStatus`, `branchId`, `onChangeBranchId`, `supplierId`, `onChangeSupplierId`, `branches`, `suppliers`, `total`, `label`, `helper`, `children`, `sx`.

### components/inventory/purchases/PurchaseIngredientItemModal.jsx

Fuente: [src/components/inventory/purchases/PurchaseIngredientItemModal.jsx](../src/components/inventory/purchases/PurchaseIngredientItemModal.jsx). 302 líneas.

Exportaciones: `default: PurchaseIngredientItemModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx).

Estados locales (`useState`): `saving`, `ingredientId`, `presentationId`, `quantity`, `unitCost`, `notes`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `editing`, `ingredients`, `presentations`, `onIngredientChange`, `onSave`, `severity`, `title`, `message`, `label`, `children`.

### components/inventory/purchases/PurchaseIngredientItemsTable.jsx

Fuente: [src/components/inventory/purchases/PurchaseIngredientItemsTable.jsx](../src/components/inventory/purchases/PurchaseIngredientItemsTable.jsx). 286 líneas.

Exportaciones: `default: PurchaseIngredientItemsTable`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`, `editable`, `onAdd`, `onEdit`, `onDelete`, `text`, `label`, `value`.

### components/inventory/purchases/PurchaseItemsTabs.jsx

Fuente: [src/components/inventory/purchases/PurchaseItemsTabs.jsx](../src/components/inventory/purchases/PurchaseItemsTabs.jsx). 76 líneas.

Exportaciones: `default: PurchaseItemsTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`.

### components/inventory/purchases/PurchaseMetaCard.jsx

Fuente: [src/components/inventory/purchases/PurchaseMetaCard.jsx](../src/components/inventory/purchases/PurchaseMetaCard.jsx). 60 líneas.

Exportaciones: `default: PurchaseMetaCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `purchase`.

### components/inventory/purchases/PurchaseProductItemModal.jsx

Fuente: [src/components/inventory/purchases/PurchaseProductItemModal.jsx](../src/components/inventory/purchases/PurchaseProductItemModal.jsx). 260 líneas.

Exportaciones: `default: PurchaseProductItemModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx).

Estados locales (`useState`): `saving`, `productId`, `quantity`, `unitCost`, `notes`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `editing`, `products`, `onSave`, `severity`, `title`, `message`, `label`, `children`.

### components/inventory/purchases/PurchaseProductItemsTable.jsx

Fuente: [src/components/inventory/purchases/PurchaseProductItemsTable.jsx](../src/components/inventory/purchases/PurchaseProductItemsTable.jsx). 278 líneas.

Exportaciones: `default: PurchaseProductItemsTable`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`, `editable`, `onAdd`, `onEdit`, `onDelete`, `text`, `label`, `value`.

### components/inventory/purchases/PurchasesHeader.jsx

Fuente: [src/components/inventory/purchases/PurchasesHeader.jsx](../src/components/inventory/purchases/PurchasesHeader.jsx). 52 líneas.

Exportaciones: `default: PurchasesHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `onCreate`.

### components/inventory/purchases/PurchasesTable.jsx

Fuente: [src/components/inventory/purchases/PurchasesTable.jsx](../src/components/inventory/purchases/PurchasesTable.jsx). 444 líneas.

Exportaciones: `default: PurchasesTable`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `paginatedItems`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onOpenDetail`, `onEdit`, `onDelete`, `label`, `value`.

### components/inventory/purchases/PurchaseSummaryCards.jsx

Fuente: [src/components/inventory/purchases/PurchaseSummaryCards.jsx](../src/components/inventory/purchases/PurchaseSummaryCards.jsx). 69 líneas.

Exportaciones: `default: PurchaseSummaryCards`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`.

### components/inventory/purchases/PurchaseUpsertModal.jsx

Fuente: [src/components/inventory/purchases/PurchaseUpsertModal.jsx](../src/components/inventory/purchases/PurchaseUpsertModal.jsx). 458 líneas.

Exportaciones: `default: PurchaseUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx).

Estados locales (`useState`): `saving`, `branchId`, `warehouseId`, `supplierId`, `purchaseDate`, `notes`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `editing`, `branches`, `suppliers`, `warehouses`, `inventoryMode`, `onSave`, `severity`, `title`, `message`, `label`, `children`.

### components/inventory/shared/movement/InventoryMovementEmptyState.jsx

Fuente: [src/components/inventory/shared/movement/InventoryMovementEmptyState.jsx](../src/components/inventory/shared/movement/InventoryMovementEmptyState.jsx). 74 líneas.

Exportaciones: `default: InventoryMovementEmptyState`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx](../src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx), [src/components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx](../src/components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `description`, `actionLabel`, `onAction`.

### components/inventory/shared/movement/InventoryMovementSummaryCards.jsx

Fuente: [src/components/inventory/shared/movement/InventoryMovementSummaryCards.jsx](../src/components/inventory/shared/movement/InventoryMovementSummaryCards.jsx). 60 líneas.

Exportaciones: `default: InventoryMovementSummaryCards`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx), [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`.

### components/inventory/shared/movement/ManualMovementModal.jsx

Fuente: [src/components/inventory/shared/movement/ManualMovementModal.jsx](../src/components/inventory/shared/movement/ManualMovementModal.jsx). 402 líneas.

Exportaciones: `default: ManualMovementModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

Estados locales (`useState`): `saving`, `entityId`, `type`, `reason`, `quantity`, `newOnHand`, `notes`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `title`, `entityLabel`, `entityOptions`, `warehouseId`, `onSave`, `severity`, `message`, `label`, `children`.

### components/inventory/shared/stock/InventoryStockEmptyState.jsx

Fuente: [src/components/inventory/shared/stock/InventoryStockEmptyState.jsx](../src/components/inventory/shared/stock/InventoryStockEmptyState.jsx). 74 líneas.

Exportaciones: `default: InventoryStockEmptyState`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx](../src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx), [src/components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx](../src/components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `description`, `actionLabel`, `onAction`.

### components/inventory/shared/stock/InventoryStockSummaryCards.jsx

Fuente: [src/components/inventory/shared/stock/InventoryStockSummaryCards.jsx](../src/components/inventory/shared/stock/InventoryStockSummaryCards.jsx). 63 líneas.

Exportaciones: `default: InventoryStockSummaryCards`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx), [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`.

### components/inventory/shared/stock/InventoryWarehouseContextCard.jsx

Fuente: [src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx](../src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx). 89 líneas.

Exportaciones: `default: InventoryWarehouseContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx), [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx), [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx), [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `warehouse`.

### components/inventory/SupplierUpsertModal.jsx

Fuente: [src/components/inventory/SupplierUpsertModal.jsx](../src/components/inventory/SupplierUpsertModal.jsx). 436 líneas.

Exportaciones: `default: SupplierUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx).

Estados locales (`useState`): `saving`, `alertState`, `name`, `contactName`, `phone`, `email`, `notes`, `status`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/inventory/SupplierWizard.jsx

Fuente: [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx). 737 líneas.

Exportaciones: `default: SupplierWizard`.

Dependencias internas: [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/inventory/suppliers/suppliers.service.js](../src/services/inventory/suppliers/suppliers.service.js) (`getSuppliers`, `createSupplier`, `updateSupplier`, `deleteSupplier`); [src/components/inventory/SupplierUpsertModal.jsx](../src/components/inventory/SupplierUpsertModal.jsx) (`SupplierUpsertModal`).

Consumidores directos: [src/components/inventory/IngredientPresentationFormModal.jsx](../src/components/inventory/IngredientPresentationFormModal.jsx), [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx).

Estados locales (`useState`): `loading`, `rows`, `savingMap`, `reqTick`, `upsertOpen`, `editing`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `restaurantId`, `onClose`, `onChanged`, `preselectId`, `severity`, `title`, `message`.

### components/inventory/warehouses/reports/InventoryReportFilters.jsx

Fuente: [src/components/inventory/warehouses/reports/InventoryReportFilters.jsx](../src/components/inventory/warehouses/reports/InventoryReportFilters.jsx). 198 líneas.

Exportaciones: `default: InventoryReportFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `warehouses`, `filters`, `loading`, `onChange`, `onSubmit`, `label`, `input`.

### components/inventory/warehouses/reports/InventoryReportHeader.jsx

Fuente: [src/components/inventory/warehouses/reports/InventoryReportHeader.jsx](../src/components/inventory/warehouses/reports/InventoryReportHeader.jsx). 51 líneas.

Exportaciones: `default: InventoryReportHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `onBack`.

### components/inventory/warehouses/reports/InventoryReportPreview.jsx

Fuente: [src/components/inventory/warehouses/reports/InventoryReportPreview.jsx](../src/components/inventory/warehouses/reports/InventoryReportPreview.jsx). 427 líneas.

Exportaciones: `default: InventoryReportPreview`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`, `stockBreakdown`, `costBreakdown`, `rows`, `pagination`, `branchName`, `warehouseName`, `filters`, `onPrev`, `onNext`, `label`, `value`, `title`.

### components/inventory/warehouses/reports/InventoryReportSummary.jsx

Fuente: [src/components/inventory/warehouses/reports/InventoryReportSummary.jsx](../src/components/inventory/warehouses/reports/InventoryReportSummary.jsx). 114 líneas.

Exportaciones: `default: InventoryReportSummary`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`, `stockBreakdown`, `costBreakdown`.

### components/inventory/warehouses/WarehouseContextCard.jsx

Fuente: [src/components/inventory/warehouses/WarehouseContextCard.jsx](../src/components/inventory/warehouses/WarehouseContextCard.jsx). 69 líneas.

Exportaciones: `default: WarehouseContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `inventoryMode`, `branches`, `branchId`, `onChangeBranch`, `selectedBranch`.

### components/inventory/warehouses/WarehouseInstructionsCard.jsx

Fuente: [src/components/inventory/warehouses/WarehouseInstructionsCard.jsx](../src/components/inventory/warehouses/WarehouseInstructionsCard.jsx). 80 líneas.

Exportaciones: `default: WarehouseInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `inventoryMode`, `step`, `text`.

### components/inventory/warehouses/WarehouseInventoryReportCard.jsx

Fuente: [src/components/inventory/warehouses/WarehouseInventoryReportCard.jsx](../src/components/inventory/warehouses/WarehouseInventoryReportCard.jsx). 81 líneas.

Exportaciones: `default: WarehouseInventoryReportCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `onOpenReport`.

### components/inventory/warehouses/WarehousesHeader.jsx

Fuente: [src/components/inventory/warehouses/WarehousesHeader.jsx](../src/components/inventory/warehouses/WarehousesHeader.jsx). 84 líneas.

Exportaciones: `default: WarehousesHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `inventoryMode`, `onCreate`, `onEnsureDefaults`, `ensuringDefaults`.

### components/inventory/warehouses/WarehousesListPanel.jsx

Fuente: [src/components/inventory/warehouses/WarehousesListPanel.jsx](../src/components/inventory/warehouses/WarehousesListPanel.jsx). 637 líneas.

Exportaciones: `default: WarehousesListPanel`.

Dependencias internas: [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx).

Estados locales (`useState`): `menuAnchor`, `menuWarehouse`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `inventoryMode`, `branchName`, `warehouses`, `onEdit`, `onToggleStatus`, `onToggleDefault`, `onGoIngredientStocks`, `onGoIngredientMovements`, `onGoProductStocks`, `onGoProductMovements`.

### components/inventory/warehouses/WarehouseUpsertModal.jsx

Fuente: [src/components/inventory/warehouses/WarehouseUpsertModal.jsx](../src/components/inventory/warehouses/WarehouseUpsertModal.jsx). 424 líneas.

Exportaciones: `default: WarehouseUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx).

Estados locales (`useState`): `saving`, `alertState`, `name`, `code`, `notes`, `statusActive`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `inventoryMode`, `editing`, `selectedBranch`, `onSave`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/landing/footer/LandingFooter.jsx

Fuente: [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx). 454 líneas.

Exportaciones: `default: LandingFooter`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`).

Consumidores directos: [src/pages/landing/blog/BlogFilteredPostsPage.jsx](../src/pages/landing/blog/BlogFilteredPostsPage.jsx), [src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx), [src/pages/landing/blog/BlogPostsPage.jsx](../src/pages/landing/blog/BlogPostsPage.jsx), [src/pages/landing/contact/LandingContactPage.jsx](../src/pages/landing/contact/LandingContactPage.jsx), [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx), [src/pages/landing/plans/LandingPlansPage.jsx](../src/pages/landing/plans/LandingPlansPage.jsx), [src/pages/landing/resources/ResourceArticleLayout.jsx](../src/pages/landing/resources/ResourceArticleLayout.jsx), [src/pages/landing/terms/LandingTermsPage.jsx](../src/pages/landing/terms/LandingTermsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `children`, `href`, `label`, `icon`, `hoverColor`, `shadowColor`, `value`.

### components/landing/home/HomeBenefitsSection.jsx

Fuente: [src/components/landing/home/HomeBenefitsSection.jsx](../src/components/landing/home/HomeBenefitsSection.jsx). 148 líneas.

Exportaciones: `default: HomeBenefitsSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`).

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

### components/landing/home/HomeBusinessTypesSection.jsx

Fuente: [src/components/landing/home/HomeBusinessTypesSection.jsx](../src/components/landing/home/HomeBusinessTypesSection.jsx). 218 líneas.

Exportaciones: `default: HomeBusinessTypesSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`).

Consumidores directos: [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx).

Estados locales (`useState`): `activeIndex`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `active`.

### components/landing/home/HomeDemoSection.jsx

Fuente: [src/components/landing/home/HomeDemoSection.jsx](../src/components/landing/home/HomeDemoSection.jsx). 231 líneas.

Exportaciones: `default: HomeDemoSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingButtonSx`, `landingColors`, `landingTypography`).

Consumidores directos: [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `icon`, `text`.

### components/landing/home/HomeFaqSection.jsx

Fuente: [src/components/landing/home/HomeFaqSection.jsx](../src/components/landing/home/HomeFaqSection.jsx). 237 líneas.

Exportaciones: `default: HomeFaqSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`).

Consumidores directos: [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx).

### components/landing/home/HomeFeaturesSection.jsx

Fuente: [src/components/landing/home/HomeFeaturesSection.jsx](../src/components/landing/home/HomeFeaturesSection.jsx). 420 líneas.

Exportaciones: `default: HomeFeaturesSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`).

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

Estados locales (`useState`): `activeIndex`, `isPaused`.

### components/landing/home/HomePlansPreviewSection.jsx

Fuente: [src/components/landing/home/HomePlansPreviewSection.jsx](../src/components/landing/home/HomePlansPreviewSection.jsx). 290 líneas.

Exportaciones: `default: HomePlansPreviewSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingButtonSx`, `landingColors`, `landingTypography`).

Consumidores directos: [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `plan`.

### components/landing/home/HomeSolutionsSection.jsx

Fuente: [src/components/landing/home/HomeSolutionsSection.jsx](../src/components/landing/home/HomeSolutionsSection.jsx). 347 líneas.

Exportaciones: `default: HomeSolutionsSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`).

Consumidores directos: [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`.

### components/landing/home/HomeTestimonialsSection.jsx

Fuente: [src/components/landing/home/HomeTestimonialsSection.jsx](../src/components/landing/home/HomeTestimonialsSection.jsx). 153 líneas.

Exportaciones: `default: HomeTestimonialsSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`).

Consumidores directos: [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx).

### components/landing/home/HomeThermalPrintingSection.jsx

Fuente: [src/components/landing/home/HomeThermalPrintingSection.jsx](../src/components/landing/home/HomeThermalPrintingSection.jsx). 482 líneas.

Exportaciones: `default: HomeThermalPrintingSection`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingButtonSx`, `landingColors`, `landingTypography`).

Consumidores directos: [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `items`, `position`.

### components/landing/menu/LandingMenu.jsx

Fuente: [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx). 530 líneas.

Exportaciones: `default: LandingMenu`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`).

Consumidores directos: [src/pages/landing/blog/BlogFilteredPostsPage.jsx](../src/pages/landing/blog/BlogFilteredPostsPage.jsx), [src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx), [src/pages/landing/blog/BlogPostsPage.jsx](../src/pages/landing/blog/BlogPostsPage.jsx), [src/pages/landing/contact/LandingContactPage.jsx](../src/pages/landing/contact/LandingContactPage.jsx), [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx), [src/pages/landing/plans/LandingPlansPage.jsx](../src/pages/landing/plans/LandingPlansPage.jsx), [src/pages/landing/resources/ResourceArticleLayout.jsx](../src/pages/landing/resources/ResourceArticleLayout.jsx), [src/pages/landing/terms/LandingTermsPage.jsx](../src/pages/landing/terms/LandingTermsPage.jsx).

Estados locales (`useState`): `mobileOpen`.

### components/layout/CashierSidebar.jsx

Fuente: [src/components/layout/CashierSidebar.jsx](../src/components/layout/CashierSidebar.jsx). 350 líneas.

Exportaciones: `default: CashierSidebar`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/layouts/CashierLayout.jsx](../src/layouts/CashierLayout.jsx).

Estados locales (`useState`): `collapsed`, `mobileOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `currentKey`, `onNavigate`, `onCloseCashier`, `title`, `closing`, `canUseOnlineOrders`, `canUseCustomerLoyaltyModules`.

### components/layout/OwnerUserMenu.jsx

Fuente: [src/components/layout/OwnerUserMenu.jsx](../src/components/layout/OwnerUserMenu.jsx). 219 líneas.

Exportaciones: `default: OwnerUserMenu`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `anchorEl`, `open`, `onClose`, `user`, `ownerName`, `onEditProfile`, `onOpenTaxProfile`, `onGoBilling`, `onLogout`.

### components/layout/RestaurantAdminSidebar.jsx

Fuente: [src/components/layout/RestaurantAdminSidebar.jsx](../src/components/layout/RestaurantAdminSidebar.jsx). 361 líneas.

Exportaciones: `default: RestaurantAdminSidebar`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/layouts/RestaurantAdminLayout.jsx](../src/layouts/RestaurantAdminLayout.jsx).

Estados locales (`useState`): `collapsed`, `mobileOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantName`, `currentKey`, `onNavigate`, `onLogout`, `logoSrc`, `planAccess`, `planFeatures`.

### components/layout/RestaurantOperationSidebar.jsx

Fuente: [src/components/layout/RestaurantOperationSidebar.jsx](../src/components/layout/RestaurantOperationSidebar.jsx). 685 líneas.

Exportaciones: `default: RestaurantOperationSidebar`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/layouts/RestaurantOperationLayout.jsx](../src/layouts/RestaurantOperationLayout.jsx).

Estados locales (`useState`): `collapsed`, `mobileOpen`, `openSections`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantName`, `currentKey`, `onNavigate`, `onLogout`, `logoSrc`, `planAccess`, `planFeatures`, `planAccessLoading`, `planAccessError`.

### components/layout/SystemAdminSidebar.jsx

Fuente: [src/components/layout/SystemAdminSidebar.jsx](../src/components/layout/SystemAdminSidebar.jsx). 482 líneas.

Exportaciones: `default: SystemAdminSidebar`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/layouts/SystemAdminLayout.jsx](../src/layouts/SystemAdminLayout.jsx).

Estados locales (`useState`): `collapsed`, `mobileOpen`, `openSections`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `adminName`, `currentKey`, `onNavigate`, `onLogout`, `logoSrc`.

### components/management/settings/BranchSettingsBranchSelector.jsx

Fuente: [src/components/management/settings/BranchSettingsBranchSelector.jsx](../src/components/management/settings/BranchSettingsBranchSelector.jsx). 64 líneas.

Exportaciones: `default: BranchSettingsBranchSelector`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`, `disabled`.

### components/management/settings/BranchSettingsFormCard.jsx

Fuente: [src/components/management/settings/BranchSettingsFormCard.jsx](../src/components/management/settings/BranchSettingsFormCard.jsx). 157 líneas.

Exportaciones: `default: BranchSettingsFormCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `catalogMode`, `cashierDirectMode`, `onChangeCatalogMode`, `onChangeCashierDirectMode`, `catalogDisabled`, `cashierDisabled`, `cashierUnavailableReason`, `label`, `value`, `onChange`, `options`, `help`, `disabled`.

### components/management/settings/BranchSettingsHeader.jsx

Fuente: [src/components/management/settings/BranchSettingsHeader.jsx](../src/components/management/settings/BranchSettingsHeader.jsx). 28 líneas.

Exportaciones: `default: BranchSettingsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx).

### components/menu/MenuCategoriesPanel.jsx

Fuente: [src/components/menu/MenuCategoriesPanel.jsx](../src/components/menu/MenuCategoriesPanel.jsx). 850 líneas.

Exportaciones: `default: MenuCategoriesPanel`.

Dependencias internas: [src/services/menu/categories.service.js](../src/services/menu/categories.service.js) (`createCategory`, `updateCategory`, `deleteCategory`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/MenuCategoryUpsertModal.jsx](../src/components/menu/MenuCategoryUpsertModal.jsx) (`MenuCategoryUpsertModal`).

Consumidores directos: [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx).

Estados locales (`useState`): `savingMap`, `modalOpen`, `editing`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `requiresBranch`, `effectiveBranchId`, `categories`, `sections`, `getSectionLabel`, `onReload`, `onReloadAll`, `severity`, `title`, `message`, `group`, `isMobile`, `activeCategoriesCount`, `isSaving`, `onToggleStatus`, `openEdit`, `onDelete`.

### components/menu/MenuCategoryUpsertModal.jsx

Fuente: [src/components/menu/MenuCategoryUpsertModal.jsx](../src/components/menu/MenuCategoryUpsertModal.jsx). 520 líneas.

Exportaciones: `default: MenuCategoryUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/components/menu/MenuCategoriesPanel.jsx](../src/components/menu/MenuCategoriesPanel.jsx).

Estados locales (`useState`): `saving`, `alertState`, `sectionId`, `name`, `description`, `sortOrder`, `status`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `requiresBranch`, `effectiveBranchId`, `sections`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/menu/menus/MenuActionDialog.jsx

Fuente: [src/components/menu/menus/MenuActionDialog.jsx](../src/components/menu/menus/MenuActionDialog.jsx). 388 líneas.

Exportaciones: `default: MenuActionDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `type`, `menu`, `loading`, `onClose`, `onConfirm`.

### components/menu/menus/MenuBranchSelector.jsx

Fuente: [src/components/menu/menus/MenuBranchSelector.jsx](../src/components/menu/menus/MenuBranchSelector.jsx). 93 líneas.

Exportaciones: `default: MenuBranchSelector`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `value`, `onChange`, `disabled`.

### components/menu/menus/menuChannels/menuChannels.helpers.js

Fuente: [src/components/menu/menus/menuChannels/menuChannels.helpers.js](../src/components/menu/menus/menuChannels/menuChannels.helpers.js). 247 líneas.

Exportaciones: `normalizeMenuChannels`, `buildMenuChannelsPayload`, `updateChannelEnabled`, `updateChannelDefault`, `getMenuChannelsSummary`, `getBackendMessage`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx).

### components/menu/menus/menuChannels/MenuChannelsHeader.jsx

Fuente: [src/components/menu/menus/menuChannels/MenuChannelsHeader.jsx](../src/components/menu/menus/menuChannels/MenuChannelsHeader.jsx). 196 líneas.

Exportaciones: `default: MenuChannelsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `menu`, `hasChanges`, `saving`, `onBack`, `onSave`.

### components/menu/menus/menuChannels/MenuChannelsInstructionsCard.jsx

Fuente: [src/components/menu/menus/menuChannels/MenuChannelsInstructionsCard.jsx](../src/components/menu/menus/menuChannels/MenuChannelsInstructionsCard.jsx). 116 líneas.

Exportaciones: `default: MenuChannelsInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `readOnly`, `step`, `text`.

### components/menu/menus/menuChannels/MenuChannelsList.jsx

Fuente: [src/components/menu/menus/menuChannels/MenuChannelsList.jsx](../src/components/menu/menus/menuChannels/MenuChannelsList.jsx). 1057 líneas.

Exportaciones: `default: MenuChannelsList`.

Dependencias internas: [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `menu`, `channels`, `saving`, `onEnabledChange`, `onDefaultChange`, `channel`, `readOnly`, `enabledCount`, `label`, `helper`, `checked`, `disabled`, `reason`, `onChange`.

### components/menu/menus/menuChannels/MenuChannelsSummaryCards.jsx

Fuente: [src/components/menu/menus/menuChannels/MenuChannelsSummaryCards.jsx](../src/components/menu/menus/menuChannels/MenuChannelsSummaryCards.jsx). 177 líneas.

Exportaciones: `default: MenuChannelsSummaryCards`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`, `icon`, `label`, `value`, `helper`.

### components/menu/menus/menuChannels/MenuDefaultConfirmDialog.jsx

Fuente: [src/components/menu/menus/menuChannels/MenuDefaultConfirmDialog.jsx](../src/components/menu/menus/menuChannels/MenuDefaultConfirmDialog.jsx). 301 líneas.

Exportaciones: `default: MenuDefaultConfirmDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `menu`, `channel`, `onClose`, `onConfirm`.

### components/menu/menus/menuContent/menuContent.helpers.js

Fuente: [src/components/menu/menus/menuContent/menuContent.helpers.js](../src/components/menu/menus/menuContent/menuContent.helpers.js). 1407 líneas.

Exportaciones: `mergeCatalogAndContent`, `setHierarchySelection`, `moveHierarchyItem`, `updateHierarchySchedules`, `findHierarchyNode`, `sortHierarchyItems`, `getMoveAvailability`, `buildMenuContentPayload`, `getHierarchySummary`, `filterHierarchy`, `getScheduleCount`, `getBackendMessage`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx](../src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx), [src/components/menu/menus/menuContent/MenuHierarchyRow.jsx](../src/components/menu/menus/menuContent/MenuHierarchyRow.jsx), [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx), [src/components/menu/menus/menuContent/MenuSetsTab.jsx](../src/components/menu/menus/menuContent/MenuSetsTab.jsx), [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx).

### components/menu/menus/menuContent/MenuContentFilters.jsx

Fuente: [src/components/menu/menus/menuContent/MenuContentFilters.jsx](../src/components/menu/menus/menuContent/MenuContentFilters.jsx). 113 líneas.

Exportaciones: `default: MenuContentFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `search`, `selectedOnly`, `onSearchChange`, `onSelectedOnlyChange`.

### components/menu/menus/menuContent/MenuContentHeader.jsx

Fuente: [src/components/menu/menus/menuContent/MenuContentHeader.jsx](../src/components/menu/menus/menuContent/MenuContentHeader.jsx). 67 líneas.

Exportaciones: `default: MenuContentHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `menu`, `onBack`.

### components/menu/menus/menuContent/MenuContentInstructionsCard.jsx

Fuente: [src/components/menu/menus/menuContent/MenuContentInstructionsCard.jsx](../src/components/menu/menus/menuContent/MenuContentInstructionsCard.jsx). 118 líneas.

Exportaciones: `default: MenuContentInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `readOnly`, `step`, `text`.

### components/menu/menus/menuContent/MenuContentTabs.jsx

Fuente: [src/components/menu/menus/menuContent/MenuContentTabs.jsx](../src/components/menu/menus/menuContent/MenuContentTabs.jsx). 169 líneas.

Exportaciones: `default: MenuContentTabs`.

Dependencias internas: [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx) (`MenuNormalProductsTab`); [src/components/menu/menus/menuContent/MenuSetsTab.jsx](../src/components/menu/menus/menuContent/MenuSetsTab.jsx) (`MenuSetsTab`).

Consumidores directos: [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx).

Estados locales (`useState`): `activeTab`, `visited`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuId`, `menu`, `catalogMode`, `onAlert`, `type`.

### components/menu/menus/menuContent/MenuHierarchyEditor.jsx

Fuente: [src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx](../src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx). 722 líneas.

Exportaciones: `default: MenuHierarchyEditor`.

Dependencias internas: [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/menus/menuContent/MenuHierarchyRow.jsx](../src/components/menu/menus/menuContent/MenuHierarchyRow.jsx) (`MenuHierarchyRow`); [src/components/menu/menus/menuContent/menuContent.helpers.js](../src/components/menu/menus/menuContent/menuContent.helpers.js) (`filterHierarchy`, `getMoveAvailability`, `getScheduleCount`, `sortHierarchyItems`).

Consumidores directos: [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx).

Estados locales (`useState`): `expandedSections`, `expandedCategories`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sections`, `search`, `selectedOnly`, `readOnly`, `saving`, `hasChanges`, `onToggle`, `onMove`, `onSchedule`, `onDiscard`, `onSave`, `section`, `originalSection`, `allSections`, `expanded`, `forceExpanded`, `isCategoryExpanded`, `onToggleExpanded`, `onToggleCategoryExpanded`, `node`, `type`, `level`, `canExpand`, `onExpandToggle`, `canMoveUp`, `canMoveDown`.

### components/menu/menus/menuContent/MenuHierarchyRow.jsx

Fuente: [src/components/menu/menus/menuContent/MenuHierarchyRow.jsx](../src/components/menu/menus/menuContent/MenuHierarchyRow.jsx). 324 líneas.

Exportaciones: `default: MenuHierarchyRow`.

Dependencias internas: [src/components/menu/menus/menuContent/menuContent.helpers.js](../src/components/menu/menus/menuContent/menuContent.helpers.js) (`getScheduleCount`).

Consumidores directos: [src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx](../src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `node`, `type`, `level`, `readOnly`, `canExpand`, `expanded`, `onExpandToggle`, `canMoveUp`, `canMoveDown`, `onToggle`, `onMove`, `onSchedule`.

### components/menu/menus/menuContent/MenuNormalProductsTab.jsx

Fuente: [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx). 322 líneas.

Exportaciones: `default: MenuNormalProductsTab`.

Dependencias internas: [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx) (`ContextOverview`); [src/components/menu/menus/menuContent/MenuContentInstructionsCard.jsx](../src/components/menu/menus/menuContent/MenuContentInstructionsCard.jsx) (`MenuContentInstructionsCard`); [src/components/menu/menus/menuContent/MenuContentFilters.jsx](../src/components/menu/menus/menuContent/MenuContentFilters.jsx) (`MenuContentFilters`); [src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx](../src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx) (`MenuHierarchyEditor`); [src/components/menu/menus/menuContent/MenuScheduleDialog.jsx](../src/components/menu/menus/menuContent/MenuScheduleDialog.jsx) (`MenuScheduleDialog`); [src/components/menu/menus/menuContent/menuContent.helpers.js](../src/components/menu/menus/menuContent/menuContent.helpers.js) (`buildMenuContentPayload`, `findHierarchyNode`, `getBackendMessage`, `getHierarchySummary`, `mergeCatalogAndContent`, `moveHierarchyItem`, `setHierarchySelection`, `updateHierarchySchedules`); [src/services/menu/menus/menuContent/menuContent.service.js](../src/services/menu/menus/menuContent/menuContent.service.js) (`getMenuContent`, `getMenuContentCatalog`, `syncMenuContent`).

Consumidores directos: [src/components/menu/menus/menuContent/MenuContentTabs.jsx](../src/components/menu/menus/menuContent/MenuContentTabs.jsx).

Estados locales (`useState`): `sections`, `loading`, `loadFailed`, `saving`, `search`, `selectedOnly`, `scheduleTarget`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuId`, `menu`, `onAlert`.

### components/menu/menus/menuContent/MenuScheduleDialog.jsx

Fuente: [src/components/menu/menus/menuContent/MenuScheduleDialog.jsx](../src/components/menu/menus/menuContent/MenuScheduleDialog.jsx). 610 líneas.

Exportaciones: `default: MenuScheduleDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `node`, `nodeType`, `readOnly`, `onClose`, `onSave`, `field`, `index`.

### components/menu/menus/menuContent/MenuSetsTab.jsx

Fuente: [src/components/menu/menus/menuContent/MenuSetsTab.jsx](../src/components/menu/menus/menuContent/MenuSetsTab.jsx). 839 líneas.

Exportaciones: `default: MenuSetsTab`.

Dependencias internas: [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx) (`ContextOverview`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/services/menu/menus/menuContent/menuSetAssignment.service.js](../src/services/menu/menus/menuContent/menuSetAssignment.service.js) (`getMenuSetAssignments`, `syncMenuSetAssignments`); [src/components/menu/menus/menuContent/menuContent.helpers.js](../src/components/menu/menus/menuContent/menuContent.helpers.js) (`getBackendMessage`).

Consumidores directos: [src/components/menu/menus/menuContent/MenuContentTabs.jsx](../src/components/menu/menus/menuContent/MenuContentTabs.jsx).

Estados locales (`useState`): `menuSets`, `selectedIds`, `savedIds`, `search`, `selectedOnly`, `loading`, `loadFailed`, `saving`, `serverMenuStatus`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuId`, `menu`, `onAlert`, `readOnly`, `item`, `selected`, `order`, `totalSelected`, `disabled`, `onToggle`, `onMove`, `index`, `total`, `onUp`, `onDown`.

### components/menu/menus/MenuFilters.jsx

Fuente: [src/components/menu/menus/MenuFilters.jsx](../src/components/menu/menus/MenuFilters.jsx). 142 líneas.

Exportaciones: `default: MenuFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `search`, `status`, `total`, `onSearchChange`, `onStatusChange`.

### components/menu/menus/MenuFormDialog.jsx

Fuente: [src/components/menu/menus/MenuFormDialog.jsx](../src/components/menu/menus/MenuFormDialog.jsx). 434 líneas.

Exportaciones: `default: MenuFormDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx).

Estados locales (`useState`): `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `menu`, `onClose`, `onSave`, `onError`, `label`, `input`, `help`, `error`.

### components/menu/menus/MenusHeader.jsx

Fuente: [src/components/menu/menus/MenusHeader.jsx](../src/components/menu/menus/MenusHeader.jsx). 49 líneas.

Exportaciones: `default: MenusHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branchName`.

### components/menu/menus/MenusInstructionsCard.jsx

Fuente: [src/components/menu/menus/MenusInstructionsCard.jsx](../src/components/menu/menus/MenusInstructionsCard.jsx). 84 líneas.

Exportaciones: `default: MenusInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/menu/menus/MenusList.jsx

Fuente: [src/components/menu/menus/MenusList.jsx](../src/components/menu/menus/MenusList.jsx). 1027 líneas.

Exportaciones: `default: MenusList`.

Dependencias internas: [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx).

Estados locales (`useState`): `actionAnchor`, `selectedMenu`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `menus`, `loading`, `busyMenuId`, `onCreate`, `onContent`, `onChannels`, `onEdit`, `onAction`, `menu`, `busy`, `onOpenActions`, `label`, `children`, `compact`.

### components/menu/MenuSectionsPanel.jsx

Fuente: [src/components/menu/MenuSectionsPanel.jsx](../src/components/menu/MenuSectionsPanel.jsx). 699 líneas.

Exportaciones: `default: MenuSectionsPanel`.

Dependencias internas: [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js) (`createMenuSection`, `updateMenuSection`, `deleteMenuSection`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/MenuSectionUpsertModal.jsx](../src/components/menu/MenuSectionUpsertModal.jsx) (`MenuSectionUpsertModal`).

Consumidores directos: [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx).

Estados locales (`useState`): `savingMap`, `modalOpen`, `editing`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `requiresBranch`, `effectiveBranchId`, `sections`, `onReload`, `onReloadAll`, `severity`, `title`, `message`.

### components/menu/MenuSectionUpsertModal.jsx

Fuente: [src/components/menu/MenuSectionUpsertModal.jsx](../src/components/menu/MenuSectionUpsertModal.jsx). 460 líneas.

Exportaciones: `default: MenuSectionUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/components/menu/MenuSectionsPanel.jsx](../src/components/menu/MenuSectionsPanel.jsx).

Estados locales (`useState`): `saving`, `alertState`, `name`, `description`, `sortOrder`, `status`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `requiresBranch`, `effectiveBranchId`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/menu/menuSets/create/MenuSetCreateForm.jsx

Fuente: [src/components/menu/menuSets/create/MenuSetCreateForm.jsx](../src/components/menu/menuSets/create/MenuSetCreateForm.jsx). 374 líneas.

Exportaciones: `default: MenuSetCreateForm`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menuSets/create/MenuSetCreatePage.jsx](../src/pages/menu/menuSets/create/MenuSetCreatePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `description`, `label`, `help`, `children`, `branchName`, `form`, `errors`, `saving`, `onFieldChange`, `onToggleDay`, `onSubmit`.

### components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx

Fuente: [src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx). 471 líneas.

Exportaciones: `default: OwnerDashboardImportUpdates`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js) (`getOwnerImportUpdatesDashboard`).

Consumidores directos: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx).

Estados locales (`useState`): `statusFilter`, `page`, `selectedId`, `result`, `loadedKey`, `loading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `row`, `label`, `value`, `timezone`, `onClose`, `restaurantId`, `branchId`, `serviceDate`, `onAlert`.

### components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx

Fuente: [src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx). 553 líneas.

Exportaciones: `default: OwnerDashboardInventory`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js) (`getOwnerInventoryDashboardItems`).

Consumidores directos: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx).

Estados locales (`useState`): `warehouseId`, `resourceType`, `stockStatus`, `includeInactive`, `warehouses`, `page`, `stockPage`, `reservationPage`, `result`, `loadedKey`, `loading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `value`, `pagination`, `onChange`, `itemLabel`, `description`, `rows`, `columns`, `page`, `onPageChange`, `restaurantId`, `branchId`, `onAlert`.

### components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx

Fuente: [src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx). 954 líneas.

Exportaciones: `default: OwnerDashboardMenuSets`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js) (`getOwnerMenuSetsDashboard`, `getOwnerMenuSetDashboardDetail`).

Consumidores directos: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx).

Estados locales (`useState`): `dayPage`, `page`, `selectedOptionId`, `stagePage`, `availabilityStatus`, `selectedMenuSetId`, `result`, `loadedKey`, `loading`, `detail`, `detailLoading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `status`, `label`, `value`, `pagination`, `onChange`, `itemLabel`, `capacity`, `options`, `detail`, `onClose`, `restaurantId`, `branchId`, `serviceDate`, `onAlert`.

### components/menu/menuSets/dashboard/OwnerDashboardOverview.jsx

Fuente: [src/components/menu/menuSets/dashboard/OwnerDashboardOverview.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardOverview.jsx). 378 líneas.

Exportaciones: `default: OwnerDashboardOverview`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `value`, `title`, `description`, `icon`, `metrics`, `data`, `loading`.

### components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx

Fuente: [src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx). 560 líneas.

Exportaciones: `default: OwnerDashboardProducts`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js) (`getOwnerProductsDashboardAvailability`).

Consumidores directos: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx).

Estados locales (`useState`): `variantPage`, `inventoryType`, `availabilityStatus`, `page`, `selectedProductId`, `result`, `loadedKey`, `loading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `status`, `title`, `value`, `pagination`, `onChange`, `itemLabel`, `product`, `onClose`, `restaurantId`, `branchId`, `onAlert`.

### components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx

Fuente: [src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx). 63 líneas.

Exportaciones: `default: OwnerDashboardReminders`.

Dependencias internas: [src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx) (`ReminderPreview`); [src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx) (`ReminderHistory`); [src/components/menu/menuSets/dashboard/reminders/ReminderChannelStatus.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderChannelStatus.jsx) (`ReminderChannelStatus`).

Consumidores directos: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `onAlert`.

### components/menu/menuSets/dashboard/OwnerDashboardTabs.jsx

Fuente: [src/components/menu/menuSets/dashboard/OwnerDashboardTabs.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardTabs.jsx). 64 líneas.

Exportaciones: `DASHBOARD_TABS`, `normalizeDashboardTab`, `default: OwnerDashboardTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/menu/menuSets/dashboard/reminders/ReminderChannelStatus.jsx

Fuente: [src/components/menu/menuSets/dashboard/reminders/ReminderChannelStatus.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderChannelStatus.jsx). 304 líneas.

Exportaciones: `default: ReminderChannelStatus`.

Dependencias internas: [src/services/menu/menuSets/dashboard/ownerReminders.service.js](../src/services/menu/menuSets/dashboard/ownerReminders.service.js) (`getReminderWhatsappSetting`, `getReminderWhatsappQrConnection`).

Consumidores directos: [src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx).

Estados locales (`useState`): `configuration`, `qr`, `qrAvailable`, `loading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `value`, `detail`, `restaurantId`, `branchId`, `onAlert`.

### components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx

Fuente: [src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx). 516 líneas.

Exportaciones: `default: ReminderHistory`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/menu/menuSets/dashboard/ownerReminders.service.js](../src/services/menu/menuSets/dashboard/ownerReminders.service.js) (`getOwnerReminderHistory`).

Consumidores directos: [src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx).

Estados locales (`useState`): `itemsPage`, `reminderType`, `status`, `page`, `selectedId`, `result`, `loadedKey`, `loading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `row`, `reminder`, `onClose`, `restaurantId`, `branchId`, `onAlert`.

### components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx

Fuente: [src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx). 448 líneas.

Exportaciones: `default: ReminderPreview`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/menu/menuSets/dashboard/ownerReminders.service.js](../src/services/menu/menuSets/dashboard/ownerReminders.service.js) (`getOwnerReminderPreview`).

Consumidores directos: [src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx).

Estados locales (`useState`): `page`, `referenceValue`, `reminderType`, `result`, `loadedKey`, `loading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `value`, `page`, `total`, `onChange`, `eligible`, `rows`, `timezone`, `groups`, `restaurantId`, `branchId`, `onAlert`.

### components/menu/menuSets/list/MenuSetsList.jsx

Fuente: [src/components/menu/menuSets/list/MenuSetsList.jsx](../src/components/menu/menuSets/list/MenuSetsList.jsx). 427 líneas.

Exportaciones: `default: MenuSetsList`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `reason`, `menuSet`, `updating`, `onStatusChange`, `onDelete`, `onManage`, `icon`, `label`, `value`, `menuSets`, `loading`, `updatingIds`.

### components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx

Fuente: [src/components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx](../src/components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx). 840 líneas.

Exportaciones: `default: MenuSetAvailabilityResults`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx](../src/components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `availability`, `label`, `field`, `icon`, `value`, `option`, `options`, `group`, `result`, `queryChanged`.

### components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx

Fuente: [src/components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx](../src/components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx). 400 líneas.

Exportaciones: `default: MenuSetAvailabilityTab`.

Dependencias internas: [src/components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx](../src/components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx) (`MenuSetAvailabilityResults`); [src/services/menu/menuSets/menuSetAvailability.service.js](../src/services/menu/menuSets/menuSetAvailability.service.js) (`getMenuSetAvailabilityPreview`).

Consumidores directos: [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx).

Estados locales (`useState`): `serviceDate`, `quantity`, `errors`, `consulting`, `result`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `help`, `children`, `restaurantId`, `branchId`, `menuSet`, `onAlert`.

### components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx

Fuente: [src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx](../src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx). 1064 líneas.

Exportaciones: `default: MenuSetCapacityTab`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`getMenuSet`, `updateMenuSet`); [src/services/menu/menuSets/menuSetStage.service.js](../src/services/menu/menuSets/menuSetStage.service.js) (`getMenuSetStages`); [src/services/menu/menuSets/menuSetProduct.service.js](../src/services/menu/menuSets/menuSetProduct.service.js) (`getMenuSetStageProducts`, `updateMenuSetStageProduct`).

Consumidores directos: [src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx](../src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx).

Estados locales (`useState`): `mode`, `savedMode`, `stages`, `products`, `inputs`, `stageFilter`, `loading`, `loadFailed`, `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `description`, `product`, `mode`, `values`, `disabled`, `onChange`, `restaurantId`, `branchId`, `menuSet`, `onUpdated`, `onAlert`.

### components/menu/menuSets/manage/definitions/MenuSetStageDefinitionForm.jsx

Fuente: [src/components/menu/menuSets/manage/definitions/MenuSetStageDefinitionForm.jsx](../src/components/menu/menuSets/manage/definitions/MenuSetStageDefinitionForm.jsx). 445 líneas.

Exportaciones: `default: MenuSetStageDefinitionForm`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx).

Estados locales (`useState`): `form`, `errors`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `help`, `children`, `open`, `definition`, `saving`, `onSave`, `onCancel`.

### components/menu/menuSets/manage/definitions/MenuSetStageDefinitionsList.jsx

Fuente: [src/components/menu/menuSets/manage/definitions/MenuSetStageDefinitionsList.jsx](../src/components/menu/menuSets/manage/definitions/MenuSetStageDefinitionsList.jsx). 471 líneas.

Exportaciones: `default: MenuSetStageDefinitionsList`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `definition`, `busy`, `updatingId`, `onStatusChange`, `onEdit`, `onDelete`, `definitions`, `system`.

### components/menu/menuSets/manage/imports/MenuSetImportCurrent.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetImportCurrent.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportCurrent.jsx). 368 líneas.

Exportaciones: `default: MenuSetImportCurrent`.

Dependencias internas: [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js) (`downloadMenuSetImportCurrent`, `getMenuSetImportCurrentStatus`).

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx).

Estados locales (`useState`): `serviceDate`, `format`, `status`, `checking`, `downloading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuSet`, `management`, `refreshToken`, `onAlert`.

### components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx). 463 líneas.

Exportaciones: `default: MenuSetImportHistory`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js) (`getMenuSetImportHistory`, `getMenuSetImportHistoryDetail`).

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx).

Estados locales (`useState`): `page`, `history`, `loading`, `detailOpen`, `detailLoading`, `detail`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `status`, `label`, `value`, `restaurantId`, `branchId`, `menuSet`, `refreshToken`, `onAlert`.

### components/menu/menuSets/manage/imports/MenuSetImportPeriodSummary.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetImportPeriodSummary.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPeriodSummary.jsx). 278 líneas.

Exportaciones: `default: MenuSetImportPeriodSummary`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `icon`, `label`, `value`, `description`, `status`, `checking`, `timezone`.

### components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx). 705 líneas.

Exportaciones: `default: MenuSetImportPreview`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx).

Estados locales (`useState`): `filter`, `now`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `value`, `item`, `review`, `timezone`.

### components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx). 359 líneas.

Exportaciones: `default: MenuSetImportPublish`.

Dependencias internas: [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js) (`publishMenuSetImport`).

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx).

Estados locales (`useState`): `confirmOpen`, `publishing`, `now`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuSet`, `review`, `publicationResult`, `onPublished`, `onInvalid`, `onPublishingChange`, `onAlert`.

### components/menu/menuSets/manage/imports/MenuSetImportTemplate.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetImportTemplate.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportTemplate.jsx). 246 líneas.

Exportaciones: `default: MenuSetImportTemplate`.

Dependencias internas: [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js) (`downloadMenuSetImportTemplate`).

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx).

Estados locales (`useState`): `format`, `downloading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuSet`, `management`, `status`, `selectedPeriod`, `periodOptions`, `checkingPeriod`, `onPeriodChange`, `onAlert`.

### components/menu/menuSets/manage/imports/MenuSetImportUpload.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetImportUpload.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportUpload.jsx). 486 líneas.

Exportaciones: `default: MenuSetImportUpload`.

Dependencias internas: [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js) (`previewMenuSetImport`).

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx).

Estados locales (`useState`): `file`, `dragging`, `reviewing`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuSet`, `status`, `selectedPeriod`, `checkingPeriod`, `onReviewChange`, `onAlert`.

### components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx). 476 líneas.

Exportaciones: `default: MenuSetMassImportTab`.

Dependencias internas: [src/components/menu/menuSets/manage/imports/MenuSetImportPeriodSummary.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPeriodSummary.jsx) (`MenuSetImportPeriodSummary`); [src/components/menu/menuSets/manage/imports/MenuSetImportTemplate.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportTemplate.jsx) (`MenuSetImportTemplate`); [src/components/menu/menuSets/manage/imports/MenuSetImportUpload.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportUpload.jsx) (`MenuSetImportUpload`); [src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx) (`MenuSetImportPreview`); [src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx) (`MenuSetImportPublish`); [src/components/menu/menuSets/manage/imports/MenuSetImportCurrent.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportCurrent.jsx) (`MenuSetImportCurrent`); [src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx) (`MenuSetImportHistory`); [src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx](../src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx) (`MenuSetPublicationHistory`); [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`getMenuSet`); [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js) (`getMenuSetImportCurrentStatus`).

Consumidores directos: [src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx](../src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx).

Estados locales (`useState`): `status`, `selectedPeriod`, `nextPeriodStart`, `review`, `publicationResult`, `publishing`, `section`, `historySection`, `refreshToken`, `uploadVersion`, `loading`, `checkingPeriod`, `loadFailed`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuSet`, `management`, `onUpdated`, `onAlert`.

### components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx

Fuente: [src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx](../src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx). 318 líneas.

Exportaciones: `default: MenuSetPublicationHistory`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js) (`getMenuSetPublicationHistory`).

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx).

Estados locales (`useState`): `page`, `history`, `loading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `current`, `restaurantId`, `branchId`, `menuSet`, `refreshToken`, `onAlert`.

### components/menu/menuSets/manage/MenuSetActivationTab.jsx

Fuente: [src/components/menu/menuSets/manage/MenuSetActivationTab.jsx](../src/components/menu/menuSets/manage/MenuSetActivationTab.jsx). 490 líneas.

Exportaciones: `default: MenuSetActivationTab`.

Dependencias internas: [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`updateMenuSet`); [src/components/menu/menuSets/manage/MenuSetManageTabs.jsx](../src/components/menu/menuSets/manage/MenuSetManageTabs.jsx) (`SHOW_MENU_SET_ADMINISTRATION`).

Consumidores directos: [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx).

Estados locales (`useState`): `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `details`, `isActive`, `canActivate`, `issuesCount`, `primaryBackground`, `restaurantId`, `branchId`, `menuSet`, `onUpdated`, `onAlert`, `checking`.

### components/menu/menuSets/manage/MenuSetAdministrationTab.jsx

Fuente: [src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx](../src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx). 685 líneas.

Exportaciones: `default: MenuSetAdministrationTab`.

Dependencias internas: [src/services/menu/menuSets/menuSetManagement.service.js](../src/services/menu/menuSets/menuSetManagement.service.js) (`updateMenuSetManagement`); [src/components/menu/menuSets/manage/MenuSetManagementConfirmModal.jsx](../src/components/menu/menuSets/manage/MenuSetManagementConfirmModal.jsx) (`MenuSetManagementConfirmModal`).

Consumidores directos: [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx).

Estados locales (`useState`): `form`, `errors`, `saving`, `confirmOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `description`, `label`, `children`, `help`, `restaurantId`, `branchId`, `menuSet`, `management`, `loading`, `onUpdated`, `onAlert`.

### components/menu/menuSets/manage/MenuSetGeneralTab.jsx

Fuente: [src/components/menu/menuSets/manage/MenuSetGeneralTab.jsx](../src/components/menu/menuSets/manage/MenuSetGeneralTab.jsx). 989 líneas.

Exportaciones: `default: MenuSetGeneralTab`.

Dependencias internas: [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`updateMenuSet`, `uploadMenuSetImage`, `deleteMenuSetImage`); [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx) (`ContextOverview`).

Consumidores directos: [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx).

Estados locales (`useState`): `form`, `errors`, `saving`, `image`, `imageBusy`, `imagePreviewError`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `description`, `label`, `help`, `reason`, `children`, `restaurantId`, `branchId`, `menuSet`, `onUpdated`, `onAlert`.

### components/menu/menuSets/manage/MenuSetManagementConfirmModal.jsx

Fuente: [src/components/menu/menuSets/manage/MenuSetManagementConfirmModal.jsx](../src/components/menu/menuSets/manage/MenuSetManagementConfirmModal.jsx). 198 líneas.

Exportaciones: `default: MenuSetManagementConfirmModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx](../src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onConfirm`, `managementMode`, `saving`.

### components/menu/menuSets/manage/MenuSetManageTabs.jsx

Fuente: [src/components/menu/menuSets/manage/MenuSetManageTabs.jsx](../src/components/menu/menuSets/manage/MenuSetManageTabs.jsx). 118 líneas.

Exportaciones: `SHOW_MENU_SET_ADMINISTRATION`, `default: MenuSetManageTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menuSets/manage/MenuSetActivationTab.jsx](../src/components/menu/menuSets/manage/MenuSetActivationTab.jsx), [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `number`, `label`, `value`, `onChange`.

### components/menu/menuSets/manage/MenuSetProgrammingTab.jsx

Fuente: [src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx](../src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx). 280 líneas.

Exportaciones: `default: MenuSetProgrammingTab`.

Dependencias internas: [src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx](../src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx) (`MenuSetCapacityTab`); [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx) (`MenuSetMassImportTab`).

Consumidores directos: [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `value`, `icon`, `restaurantId`, `branchId`, `menuSet`, `management`, `loading`, `onUpdated`, `onAlert`.

### components/menu/menuSets/manage/products/MenuSetProductForm.jsx

Fuente: [src/components/menu/menuSets/manage/products/MenuSetProductForm.jsx](../src/components/menu/menuSets/manage/products/MenuSetProductForm.jsx). 686 líneas.

Exportaciones: `default: MenuSetProductForm`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx).

Estados locales (`useState`): `form`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `help`, `children`, `open`, `option`, `menuSet`, `stage`, `products`, `saving`, `onSave`, `onCancel`, `severity`, `title`, `message`.

### components/menu/menuSets/manage/products/MenuSetProductsList.jsx

Fuente: [src/components/menu/menuSets/manage/products/MenuSetProductsList.jsx](../src/components/menu/menuSets/manage/products/MenuSetProductsList.jsx). 463 líneas.

Exportaciones: `default: MenuSetProductsList`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `reason`, `option`, `updating`, `disabled`, `onStatusChange`, `onEdit`, `onDelete`, `icon`, `label`, `value`, `options`, `loading`, `busy`, `updatingOptionId`, `hasFilters`.

### components/menu/menuSets/manage/stages/MenuSetStageForm.jsx

Fuente: [src/components/menu/menuSets/manage/stages/MenuSetStageForm.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStageForm.jsx). 694 líneas.

Exportaciones: `default: MenuSetStageForm`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx).

Estados locales (`useState`): `form`, `errors`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `help`, `children`, `open`, `stage`, `menuSet`, `definitions`, `usedDefinitionIds`, `saving`, `onSave`, `onCancel`, `onAlert`.

### components/menu/menuSets/manage/stages/MenuSetStagesList.jsx

Fuente: [src/components/menu/menuSets/manage/stages/MenuSetStagesList.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesList.jsx). 501 líneas.

Exportaciones: `default: MenuSetStagesList`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `reason`, `stage`, `busy`, `updating`, `onStatusChange`, `onEdit`, `onDelete`, `onConfigureProducts`, `icon`, `label`, `value`, `stages`, `updatingStageId`, `hasFilters`.

### components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx

Fuente: [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx). 778 líneas.

Exportaciones: `default: MenuSetStagesTab`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx) (`ContextOverview`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/menu/menuSets/manage/stages/MenuSetStageForm.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStageForm.jsx) (`MenuSetStageForm`); [src/components/menu/menuSets/manage/stages/MenuSetStagesList.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesList.jsx) (`MenuSetStagesList`); [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`getMenuSet`); [src/services/menu/menuSets/menuSetStage.service.js](../src/services/menu/menuSets/menuSetStage.service.js) (`getMenuSetStages`, `getMenuSetStageDefinitions`, `createMenuSetStage`, `updateMenuSetStage`, `deleteMenuSetStage`).

Consumidores directos: [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx).

Estados locales (`useState`): `stages`, `definitions`, `loading`, `loadFailed`, `definitionsLoaded`, `search`, `statusFilter`, `formMode`, `editingStage`, `formVersion`, `saving`, `updatingStageId`, `stageToDelete`, `deleting`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `menuSet`, `onUpdated`, `onAlert`, `onConfigureProducts`, `onManageTypes`.

### components/menu/MenuTabs.jsx

Fuente: [src/components/menu/MenuTabs.jsx](../src/components/menu/MenuTabs.jsx). 85 líneas.

Exportaciones: `default: MenuTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`.

### components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx

Fuente: [src/components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx). 617 líneas.

Exportaciones: `default: CompositeComponentModifierGroupUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx) (`ModifierAssignmentRulesFields`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx).

Estados locales (`useState`): `saving`, `modifierGroupId`, `sortOrder`, `isActive`, `rules`, `rulesValid`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `product`, `component`, `requiresBranch`, `effectiveBranchId`, `availableGroups`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx

Fuente: [src/components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx). 676 líneas.

Exportaciones: `default: CompositeComponentVariantModifierGroupUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx) (`ModifierAssignmentRulesFields`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx).

Estados locales (`useState`): `saving`, `modifierGroupId`, `sortOrder`, `isActive`, `rules`, `rulesValid`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `product`, `component`, `variant`, `requiresBranch`, `effectiveBranchId`, `availableGroups`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/menu/modifiers/catalogs/ModifierCatalogsDialog.jsx

Fuente: [src/components/menu/modifiers/catalogs/ModifierCatalogsDialog.jsx](../src/components/menu/modifiers/catalogs/ModifierCatalogsDialog.jsx). 275 líneas.

Exportaciones: `default: ModifierCatalogsDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onSelect`.

### components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx

Fuente: [src/components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx). 595 líneas.

Exportaciones: `default: ProductModifierGroupUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx) (`ModifierAssignmentRulesFields`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx).

Estados locales (`useState`): `saving`, `modifierGroupId`, `sortOrder`, `isActive`, `rules`, `rulesValid`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `product`, `requiresBranch`, `effectiveBranchId`, `availableGroups`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/menu/modifiers/catalogs/shared/catalogShared.js

Fuente: [src/components/menu/modifiers/catalogs/shared/catalogShared.js](../src/components/menu/modifiers/catalogs/shared/catalogShared.js). 96 líneas.

Exportaciones: `ALL_CATEGORIES_VALUE`, `PAGE_SIZE`, `getAppliesToLabel`, `getBranchHelpText`, `fieldLabelSx`, `switchLabelSx`, `iconEditSx`, `iconDeleteSx`, `groupProductsByCategory`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx), [src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `productsAreByBranch`, `modifiersAreByBranch`.

### components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx

Fuente: [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx). 486 líneas.

Exportaciones: `default: ModifierAssignmentRulesFields`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx), [src/components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx), [src/components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx), [src/components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `group`, `value`, `onChange`, `disabled`, `onValidityChange`, `label`, `input`, `help`, `error`.

### components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx

Fuente: [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx). 446 líneas.

Exportaciones: `default: ModifierAssignmentsPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/modifiers/catalogs/shared/catalogShared.js](../src/components/menu/modifiers/catalogs/shared/catalogShared.js) (`getAppliesToLabel`, `iconDeleteSx`, `iconEditSx`, `switchLabelSx`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `row`, `isMobile`, `title`, `addButtonText`, `emptyTitle`, `emptyMessage`, `missingSelectionTitle`, `missingSelectionMessage`, `canAssign`, `hasSelection`, `rows`, `paginatedItems`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onCreate`, `onEdit`, `onDelete`, `onToggleStatus`, `isSaving`, `itemLabel`.

### components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx

Fuente: [src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx). 55 líneas.

Exportaciones: `default: ModifierCatalogBranchSelector`.

Dependencias internas: [src/components/menu/modifiers/catalogs/shared/catalogShared.js](../src/components/menu/modifiers/catalogs/shared/catalogShared.js) (`fieldLabelSx`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `visible`, `branches`, `branchId`, `onChange`, `helpText`.

### components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx

Fuente: [src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx). 69 líneas.

Exportaciones: `default: ModifierCatalogInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`, `steps`.

### components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx

Fuente: [src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx). 69 líneas.

Exportaciones: `default: ModifierCatalogSelectionCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `description`, `children`.

### components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx

Fuente: [src/components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx). 621 líneas.

Exportaciones: `default: VariantModifierGroupUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentRulesFields.jsx) (`ModifierAssignmentRulesFields`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

Estados locales (`useState`): `saving`, `modifierGroupId`, `sortOrder`, `isActive`, `rules`, `rulesValid`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `product`, `variant`, `requiresBranch`, `effectiveBranchId`, `availableGroups`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/menu/modifiers/ModifierGroupsPanel.jsx

Fuente: [src/components/menu/modifiers/ModifierGroupsPanel.jsx](../src/components/menu/modifiers/ModifierGroupsPanel.jsx). 701 líneas.

Exportaciones: `default: ModifierGroupsPanel`.

Dependencias internas: [src/services/menu/modifiers/modifierGroups.service.js](../src/services/menu/modifiers/modifierGroups.service.js) (`createModifierGroup`, `updateModifierGroup`, `deleteModifierGroup`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/modifiers/ModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/ModifierGroupUpsertModal.jsx) (`ModifierGroupUpsertModal`).

Consumidores directos: [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx).

Estados locales (`useState`): `savingMap`, `modalOpen`, `editing`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `requiresBranch`, `effectiveBranchId`, `groups`, `onReload`, `severity`, `title`, `message`.

### components/menu/modifiers/ModifierGroupUpsertModal.jsx

Fuente: [src/components/menu/modifiers/ModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/ModifierGroupUpsertModal.jsx). 752 líneas.

Exportaciones: `default: ModifierGroupUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/components/menu/modifiers/ModifierGroupsPanel.jsx](../src/components/menu/modifiers/ModifierGroupsPanel.jsx).

Estados locales (`useState`): `saving`, `alertState`, `name`, `description`, `selectionMode`, `isRequired`, `minSelect`, `maxSelect`, `appliesTo`, `sortOrder`, `isActive`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `requiresBranch`, `effectiveBranchId`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/menu/modifiers/ModifierOptionConsumptionModal.jsx

Fuente: [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx). 707 líneas.

Exportaciones: `default: ModifierOptionConsumptionModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/modifiers/modifierOptionConsumption.service.js](../src/services/menu/modifiers/modifierOptionConsumption.service.js) (`deleteModifierOptionConsumption`, `fetchCatalogIngredients`, `fetchCatalogProducts`, `fetchWarehousesByRestaurant`, `getModifierOptionConsumption`, `resolveModifierOptionConsumption`, `saveModifierOptionConsumption`); [src/components/menu/modifiers/ModifierOptionConsumptionTabs.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionTabs.jsx) (`ModifierOptionConsumptionTabs`); [src/components/menu/modifiers/ModifierOptionConsumptionMovementTab.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionMovementTab.jsx) (`ModifierOptionConsumptionMovementTab`); [src/components/menu/modifiers/ModifierOptionConsumptionTestTab.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionTestTab.jsx) (`ModifierOptionConsumptionTestTab`); [src/components/menu/modifiers/ModifierOptionConsumptionShared.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionShared.jsx) (`containerSx`, `optionNameSx`, `titleSx`).

Consumidores directos: [src/components/menu/modifiers/ModifierOptionsPanel.jsx](../src/components/menu/modifiers/ModifierOptionsPanel.jsx).

Estados locales (`useState`): `tab`, `loading`, `saving`, `deleting`, `testing`, `ingredients`, `products`, `branches`, `warehouses`, `consumptionId`, `effect`, `consumptionType`, `ingredientId`, `productId`, `qty`, `status`, `notes`, `testBranchId`, `testWarehouseId`, `testOptionQty`, `resolveResult`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `option`, `groupLabel`, `effectiveBranchId`, `requiresBranch`, `onSaved`, `severity`, `title`, `message`.

### components/menu/modifiers/ModifierOptionConsumptionMovementTab.jsx

Fuente: [src/components/menu/modifiers/ModifierOptionConsumptionMovementTab.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionMovementTab.jsx). 327 líneas.

Exportaciones: `default: ModifierOptionConsumptionMovementTab`.

Dependencias internas: [src/components/menu/modifiers/ModifierOptionConsumptionShared.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionShared.jsx) (`containerSx`, `emptyHelpSx`, `FieldBlock`, `InfoPill`, `noticeSx`, `subtitleSx`, `switchLabelSx`, `titleSx`).

Consumidores directos: [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `trackInventory`, `consumptionId`, `ingredients`, `products`, `effect`, `consumptionType`, `ingredientId`, `productId`, `qty`, `status`, `notes`, `saving`, `deleting`, `busy`, `canSave`, `onEffectChange`, `onConsumptionTypeChange`, `onIngredientChange`, `onProductChange`, `onQtyChange`, `onStatusChange`, `onNotesChange`, `onSave`, `onDelete`.

### components/menu/modifiers/ModifierOptionConsumptionShared.jsx

Fuente: [src/components/menu/modifiers/ModifierOptionConsumptionShared.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionShared.jsx). 158 líneas.

Exportaciones: `FieldBlock`, `InfoPill`, `containerSx`, `resultCardSx`, `noticeSx`, `titleSx`, `subtitleSx`, `optionNameSx`, `fieldLabelSx`, `switchLabelSx`, `emptyHelpSx`, `resultTitleSx`, `resultTextSx`, `sectionMiniTitleSx`, `reqTitleSx`, `reqTextSx`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx), [src/components/menu/modifiers/ModifierOptionConsumptionMovementTab.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionMovementTab.jsx), [src/components/menu/modifiers/ModifierOptionConsumptionTestTab.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionTestTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `input`, `help`, `icon`, `text`.

### components/menu/modifiers/ModifierOptionConsumptionTabs.jsx

Fuente: [src/components/menu/modifiers/ModifierOptionConsumptionTabs.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionTabs.jsx). 93 líneas.

Exportaciones: `default: ModifierOptionConsumptionTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`, `testDisabled`.

### components/menu/modifiers/ModifierOptionConsumptionTestTab.jsx

Fuente: [src/components/menu/modifiers/ModifierOptionConsumptionTestTab.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionTestTab.jsx). 735 líneas.

Exportaciones: `default: ModifierOptionConsumptionTestTab`.

Dependencias internas: [src/components/menu/modifiers/ModifierOptionConsumptionShared.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionShared.jsx) (`containerSx`, `FieldBlock`, `noticeSx`, `reqTextSx`, `reqTitleSx`, `resultCardSx`, `resultTextSx`, `sectionMiniTitleSx`, `subtitleSx`, `titleSx`).

Consumidores directos: [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx).

Estados locales (`useState`): `detailOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `trackInventory`, `consumptionId`, `branches`, `filteredWarehouses`, `requiresBranch`, `effectiveBranchId`, `testBranchId`, `testWarehouseId`, `testOptionQty`, `effect`, `resolveResult`, `testing`, `saving`, `deleting`, `busy`, `canTest`, `onBranchChange`, `onWarehouseChange`, `onOptionQtyChange`, `onResolve`, `state`, `warehouseName`, `evaluation`, `name`, `type`, `required`, `unit`, `shortage`, `canFulfill`, `available`, `missing`, `label`, `value`.

### components/menu/modifiers/ModifierOptionsPanel.jsx

Fuente: [src/components/menu/modifiers/ModifierOptionsPanel.jsx](../src/components/menu/modifiers/ModifierOptionsPanel.jsx). 894 líneas.

Exportaciones: `default: ModifierOptionsPanel`.

Dependencias internas: [src/services/menu/modifiers/modifierOptions.service.js](../src/services/menu/modifiers/modifierOptions.service.js) (`createModifierOption`, `updateModifierOption`, `deleteModifierOption`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/modifiers/ModifierOptionUpsertModal.jsx](../src/components/menu/modifiers/ModifierOptionUpsertModal.jsx) (`ModifierOptionUpsertModal`); [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx) (`ModifierOptionConsumptionModal`).

Consumidores directos: [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx).

Estados locales (`useState`): `savingMap`, `modalOpen`, `editing`, `consumptionModalOpen`, `consumptionEditing`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `requiresBranch`, `effectiveBranchId`, `groups`, `options`, `getGroupLabel`, `onReload`, `severity`, `title`, `message`, `group`, `useCards`, `isSaving`, `onToggleStatus`, `openEdit`, `openConsumption`, `onDelete`, `option`, `busy`.

### components/menu/modifiers/ModifierOptionUpsertModal.jsx

Fuente: [src/components/menu/modifiers/ModifierOptionUpsertModal.jsx](../src/components/menu/modifiers/ModifierOptionUpsertModal.jsx). 602 líneas.

Exportaciones: `default: ModifierOptionUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/components/menu/modifiers/ModifierOptionsPanel.jsx](../src/components/menu/modifiers/ModifierOptionsPanel.jsx).

Estados locales (`useState`): `saving`, `alertState`, `modifierGroupId`, `name`, `description`, `price`, `maxQuantityPerSelection`, `isDefault`, `affectsTotal`, `trackInventory`, `sortOrder`, `isActive`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `groups`, `editing`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/menu/modifiers/ModifierTabs.jsx

Fuente: [src/components/menu/modifiers/ModifierTabs.jsx](../src/components/menu/modifiers/ModifierTabs.jsx). 74 líneas.

Exportaciones: `default: ModifierTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`.

### components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx

Fuente: [src/components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx](../src/components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx). 435 líneas.

Exportaciones: `default: PromotionChannelsSchedulesStep`.

Dependencias internas: [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js) (`PROMOTION_DAYS`, `getPromotionDayLabel`); [src/components/menu/promotions/form/PromotionFormField.jsx](../src/components/menu/promotions/form/PromotionFormField.jsx) (`PromotionSectionTitle`).

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `channels`, `selectedChannelIds`, `schedules`, `loading`, `onToggleChannel`, `onScheduleChange`, `onSetAllSchedules`.

### components/menu/promotions/form/PromotionConfigurationStep.jsx

Fuente: [src/components/menu/promotions/form/PromotionConfigurationStep.jsx](../src/components/menu/promotions/form/PromotionConfigurationStep.jsx). 499 líneas.

Exportaciones: `default: PromotionConfigurationStep`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js) (`formatPromotionCurrency`, `getPromotionTargetLabel`, `getPromotionTypeLabel`); [src/components/menu/promotions/form/PromotionFormField.jsx](../src/components/menu/promotions/form/PromotionFormField.jsx) (`PromotionFieldBlock`, `PromotionSectionTitle`).

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx).

Estados locales (`useState`): `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `channels`, `getBasePrice`, `onRuleChange`, `onTargetPriceChange`.

### components/menu/promotions/form/promotionForm.helpers.js

Fuente: [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js). 1032 líneas.

Exportaciones: `PROMOTION_FORM_STEPS`, `PROMOTION_TYPE_OPTIONS`, `PROMOTION_DAYS`, `createInitialPromotionForm`, `buildPromotionEditForm`, `getPromotionTypeLabel`, `getPromotionDayLabel`, `buildPromotionTargetKey`, `getPromotionTargetLabel`, `formatPromotionCurrency`, `extractPromotionApiError`, `validatePromotionStep`, `validateCompletePromotionForm`, `buildPromotionCreatePayload`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx](../src/components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx), [src/components/menu/promotions/form/PromotionConfigurationStep.jsx](../src/components/menu/promotions/form/PromotionConfigurationStep.jsx), [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx), [src/components/menu/promotions/form/PromotionFormStepper.jsx](../src/components/menu/promotions/form/PromotionFormStepper.jsx), [src/components/menu/promotions/form/PromotionInformationStep.jsx](../src/components/menu/promotions/form/PromotionInformationStep.jsx), [src/components/menu/promotions/form/PromotionProductsStep.jsx](../src/components/menu/promotions/form/PromotionProductsStep.jsx), [src/components/menu/promotions/form/PromotionReviewStep.jsx](../src/components/menu/promotions/form/PromotionReviewStep.jsx), [src/pages/menu/promotions/PromotionEditPage.jsx](../src/pages/menu/promotions/PromotionEditPage.jsx).

### components/menu/promotions/form/PromotionFormActions.jsx

Fuente: [src/components/menu/promotions/form/PromotionFormActions.jsx](../src/components/menu/promotions/form/PromotionFormActions.jsx). 170 líneas.

Exportaciones: `default: PromotionFormActions`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `activeStep`, `totalSteps`, `saving`, `loading`, `onCancel`, `onPrevious`, `onNext`, `onSaveInactive`, `onSave`, `cancelLabel`, `previousLabel`, `nextLabel`, `saveInactiveLabel`, `saveLabel`, `savingLabel`, `showSaveInactive`.

### components/menu/promotions/form/PromotionFormField.jsx

Fuente: [src/components/menu/promotions/form/PromotionFormField.jsx](../src/components/menu/promotions/form/PromotionFormField.jsx). 70 líneas.

Exportaciones: `PromotionFieldBlock`, `PromotionSectionTitle`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx](../src/components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx), [src/components/menu/promotions/form/PromotionConfigurationStep.jsx](../src/components/menu/promotions/form/PromotionConfigurationStep.jsx), [src/components/menu/promotions/form/PromotionInformationStep.jsx](../src/components/menu/promotions/form/PromotionInformationStep.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `input`, `help`, `error`, `children`.

### components/menu/promotions/form/PromotionFormHeader.jsx

Fuente: [src/components/menu/promotions/form/PromotionFormHeader.jsx](../src/components/menu/promotions/form/PromotionFormHeader.jsx). 85 líneas.

Exportaciones: `default: PromotionFormHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx), [src/pages/menu/promotions/PromotionEditPage.jsx](../src/pages/menu/promotions/PromotionEditPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branchName`, `onBack`, `title`, `description`, `backLabel`.

### components/menu/promotions/form/PromotionFormPage.jsx

Fuente: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx). 2146 líneas.

Exportaciones: `default: PromotionFormPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/promotions/form/PromotionFormHeader.jsx](../src/components/menu/promotions/form/PromotionFormHeader.jsx) (`PromotionFormHeader`); [src/components/menu/promotions/form/PromotionFormStepper.jsx](../src/components/menu/promotions/form/PromotionFormStepper.jsx) (`PromotionFormStepper`); [src/components/menu/promotions/form/PromotionInformationStep.jsx](../src/components/menu/promotions/form/PromotionInformationStep.jsx) (`PromotionInformationStep`); [src/components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx](../src/components/menu/promotions/form/PromotionChannelsSchedulesStep.jsx) (`PromotionChannelsSchedulesStep`); [src/components/menu/promotions/form/PromotionProductsStep.jsx](../src/components/menu/promotions/form/PromotionProductsStep.jsx) (`PromotionProductsStep`); [src/components/menu/promotions/form/PromotionConfigurationStep.jsx](../src/components/menu/promotions/form/PromotionConfigurationStep.jsx) (`PromotionConfigurationStep`); [src/components/menu/promotions/form/PromotionReviewStep.jsx](../src/components/menu/promotions/form/PromotionReviewStep.jsx) (`PromotionReviewStep`); [src/components/menu/promotions/form/PromotionFormActions.jsx](../src/components/menu/promotions/form/PromotionFormActions.jsx) (`PromotionFormActions`); [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js) (`PROMOTION_FORM_STEPS`, `buildPromotionCreatePayload`, `buildPromotionEditForm`, `buildPromotionTargetKey`, `createInitialPromotionForm`, `extractPromotionApiError`, `getPromotionTargetLabel`, `validateCompletePromotionForm`, `validatePromotionStep`); [src/services/menu/promotions/promotionForm.service.js](../src/services/menu/promotions/promotionForm.service.js) (`getPromotionEligibleProducts`, `getPromotionFormBranches`, `getPromotionFormChannels`).

Consumidores directos: [src/pages/menu/promotions/PromotionCreatePage.jsx](../src/pages/menu/promotions/PromotionCreatePage.jsx), [src/pages/menu/promotions/PromotionEditPage.jsx](../src/pages/menu/promotions/PromotionEditPage.jsx).

Estados locales (`useState`): `form`, `activeStep`, `branches`, `channels`, `products`, `eligibleTargetKeys`, `loadingBranches`, `loadingBranchData`, `loadingProducts`, `branchDataLoaded`, `catalogStatus`, `saving`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `mode`, `initialPromotion`, `initialBranchId`, `initialType`, `restaurantId`, `promotionId`, `onSubmit`, `onBack`, `onCancel`, `title`, `description`, `backLabel`, `saveLabel`, `savingLabel`, `saveInactiveLabel`, `showSaveInactive`, `severity`, `message`.

### components/menu/promotions/form/PromotionFormStepper.jsx

Fuente: [src/components/menu/promotions/form/PromotionFormStepper.jsx](../src/components/menu/promotions/form/PromotionFormStepper.jsx). 290 líneas.

Exportaciones: `default: PromotionFormStepper`.

Dependencias internas: [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js) (`PROMOTION_FORM_STEPS`).

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `activeStep`, `onStepChange`.

### components/menu/promotions/form/PromotionInformationStep.jsx

Fuente: [src/components/menu/promotions/form/PromotionInformationStep.jsx](../src/components/menu/promotions/form/PromotionInformationStep.jsx). 331 líneas.

Exportaciones: `default: PromotionInformationStep`.

Dependencias internas: [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js) (`PROMOTION_TYPE_OPTIONS`); [src/components/menu/promotions/form/PromotionFormField.jsx](../src/components/menu/promotions/form/PromotionFormField.jsx) (`PromotionFieldBlock`, `PromotionSectionTitle`).

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `branches`, `loading`, `onFieldChange`, `onTypeChange`.

### components/menu/promotions/form/PromotionProductsStep.jsx

Fuente: [src/components/menu/promotions/form/PromotionProductsStep.jsx](../src/components/menu/promotions/form/PromotionProductsStep.jsx). 865 líneas.

Exportaciones: `default: PromotionProductsStep`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js) (`buildPromotionTargetKey`, `formatPromotionCurrency`).

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx).

Estados locales (`useState`): `search`, `category`, `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `products`, `targets`, `selectedChannelIds`, `loading`, `onToggleProduct`, `onToggleVariant`.

### components/menu/promotions/form/PromotionReviewStep.jsx

Fuente: [src/components/menu/promotions/form/PromotionReviewStep.jsx](../src/components/menu/promotions/form/PromotionReviewStep.jsx). 736 líneas.

Exportaciones: `default: PromotionReviewStep`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js) (`formatPromotionCurrency`, `getPromotionDayLabel`, `getPromotionTargetLabel`, `getPromotionTypeLabel`).

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx).

Estados locales (`useState`): `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `branch`, `channels`, `isEditing`, `targets`, `title`, `children`, `label`, `value`.

### components/menu/promotions/list/PromotionBranchSelector.jsx

Fuente: [src/components/menu/promotions/list/PromotionBranchSelector.jsx](../src/components/menu/promotions/list/PromotionBranchSelector.jsx). 89 líneas.

Exportaciones: `default: PromotionBranchSelector`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `value`, `onChange`, `disabled`.

### components/menu/promotions/list/PromotionCard.jsx

Fuente: [src/components/menu/promotions/list/PromotionCard.jsx](../src/components/menu/promotions/list/PromotionCard.jsx). 400 líneas.

Exportaciones: `default: PromotionCard`.

Dependencias internas: [src/components/menu/promotions/list/promotionList.helpers.js](../src/components/menu/promotions/list/promotionList.helpers.js) (`formatPromotionValidity`, `getPromotionChannels`, `getPromotionDateState`, `getPromotionRuleSummary`, `getPromotionSchedules`, `getPromotionTargets`).

Consumidores directos: [src/components/menu/promotions/list/PromotionList.jsx](../src/components/menu/promotions/list/PromotionList.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `promotion`, `updating`, `onEdit`, `onStatusChange`, `onDelete`, `icon`, `label`, `value`.

### components/menu/promotions/list/PromotionDeleteDialog.jsx

Fuente: [src/components/menu/promotions/list/PromotionDeleteDialog.jsx](../src/components/menu/promotions/list/PromotionDeleteDialog.jsx). 132 líneas.

Exportaciones: `default: PromotionDeleteDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `promotion`, `deleting`, `onClose`, `onConfirm`.

### components/menu/promotions/list/PromotionFilters.jsx

Fuente: [src/components/menu/promotions/list/PromotionFilters.jsx](../src/components/menu/promotions/list/PromotionFilters.jsx). 119 líneas.

Exportaciones: `default: PromotionFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `search`, `status`, `onSearchChange`, `onStatusChange`.

### components/menu/promotions/list/promotionList.helpers.js

Fuente: [src/components/menu/promotions/list/promotionList.helpers.js](../src/components/menu/promotions/list/promotionList.helpers.js). 270 líneas.

Exportaciones: `PROMOTION_TYPES`, `getPromotionType`, `getMexicoCurrentDate`, `normalizeDateValue`, `formatDate`, `getPromotionDateState`, `isPromotionCurrent`, `formatPromotionValidity`, `getPromotionChannels`, `getPromotionTargets`, `getPromotionSchedules`, `getPromotionRuleSummary`, `getPromotionSearchText`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/promotions/list/PromotionCard.jsx](../src/components/menu/promotions/list/PromotionCard.jsx), [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

### components/menu/promotions/list/PromotionList.jsx

Fuente: [src/components/menu/promotions/list/PromotionList.jsx](../src/components/menu/promotions/list/PromotionList.jsx). 130 líneas.

Exportaciones: `default: PromotionList`.

Dependencias internas: [src/components/menu/promotions/list/PromotionCard.jsx](../src/components/menu/promotions/list/PromotionCard.jsx) (`PromotionCard`); [src/components/menu/promotions/list/PromotionsPaginationFooter.jsx](../src/components/menu/promotions/list/PromotionsPaginationFooter.jsx) (`PromotionsPaginationFooter`).

Consumidores directos: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `promotions`, `loading`, `updatingIds`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `onPrev`, `onNext`, `onEdit`, `onStatusChange`, `onDelete`.

### components/menu/promotions/list/PromotionsHeader.jsx

Fuente: [src/components/menu/promotions/list/PromotionsHeader.jsx](../src/components/menu/promotions/list/PromotionsHeader.jsx). 76 líneas.

Exportaciones: `default: PromotionsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branchName`, `onCreate`.

### components/menu/promotions/list/PromotionsInstructionsCard.jsx

Fuente: [src/components/menu/promotions/list/PromotionsInstructionsCard.jsx](../src/components/menu/promotions/list/PromotionsInstructionsCard.jsx). 82 líneas.

Exportaciones: `default: PromotionsInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/menu/promotions/list/PromotionsPaginationFooter.jsx

Fuente: [src/components/menu/promotions/list/PromotionsPaginationFooter.jsx](../src/components/menu/promotions/list/PromotionsPaginationFooter.jsx). 91 líneas.

Exportaciones: `default: PromotionsPaginationFooter`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/promotions/list/PromotionList.jsx](../src/components/menu/promotions/list/PromotionList.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `page`, `totalPages`, `startItem`, `endItem`, `total`, `onPrev`, `onNext`.

### components/menu/promotions/list/PromotionSummaryCards.jsx

Fuente: [src/components/menu/promotions/list/PromotionSummaryCards.jsx](../src/components/menu/promotions/list/PromotionSummaryCards.jsx). 186 líneas.

Exportaciones: `default: PromotionSummaryCards`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`, `icon`, `label`, `value`, `helper`, `chipLabel`, `chipColor`.

### components/menu/promotions/list/PromotionTypeSelector.jsx

Fuente: [src/components/menu/promotions/list/PromotionTypeSelector.jsx](../src/components/menu/promotions/list/PromotionTypeSelector.jsx). 102 líneas.

Exportaciones: `default: PromotionTypeSelector`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/menu/public/online-order-checkout/OnlineOrderFulfillmentSection.jsx

Fuente: [src/components/menu/public/online-order-checkout/OnlineOrderFulfillmentSection.jsx](../src/components/menu/public/online-order-checkout/OnlineOrderFulfillmentSection.jsx). 762 líneas.

Exportaciones: `default: OnlineOrderFulfillmentSection`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`).

Consumidores directos: [src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx](../src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `fulfillments`, `preparedTimingConflict`, `fulfillmentType`, `selectedFulfillment`, `timingType`, `requestedForAt`, `deliveryConceptId`, `deliveryAddress`, `deliveryInstructions`, `deliveryConcepts`, `selectedDeliveryConcept`, `scheduledPointId`, `scheduledPoints`, `selectedPoint`, `scheduledDate`, `availableBlocks`, `scheduledPointTimeBlockId`, `selectedBlock`, `scheduledTime`, `themeColor`, `disabled`, `onFulfillmentChange`, `onTimingTypeChange`, `onRequestedForAtChange`, `onDeliveryConceptChange`, `onDeliveryAddressChange`, `onDeliveryInstructionsChange`, `onScheduledPointChange`, `onScheduledDateChange`, `onBlockChange`, `onScheduledTimeChange`, `label`, `input`, `help`.

### components/menu/public/PublicMenuBrandCard.jsx

Fuente: [src/components/menu/public/PublicMenuBrandCard.jsx](../src/components/menu/public/PublicMenuBrandCard.jsx). 170 líneas.

Exportaciones: `default: PublicMenuBrandCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Estados locales (`useState`): `coverLoading`, `coverFailed`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `publicMenu`.

### components/menu/public/PublicMenuFooter.jsx

Fuente: [src/components/menu/public/PublicMenuFooter.jsx](../src/components/menu/public/PublicMenuFooter.jsx). 179 líneas.

Exportaciones: `default: PublicMenuFooter`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `publicMenu`, `restaurantName`.

### components/menu/public/PublicMenuGalleryCarousel.jsx

Fuente: [src/components/menu/public/PublicMenuGalleryCarousel.jsx](../src/components/menu/public/PublicMenuGalleryCarousel.jsx). 754 líneas.

Exportaciones: `default: PublicMenuGalleryCarousel`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Estados locales (`useState`): `active`, `notice`, `failedUrls`, `loadedUrls`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `publicMenu`.

### components/menu/public/PublicMenuIdentityCard.jsx

Fuente: [src/components/menu/public/PublicMenuIdentityCard.jsx](../src/components/menu/public/PublicMenuIdentityCard.jsx). 337 líneas.

Exportaciones: `default: PublicMenuIdentityCard`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `publicMenu`, `title`, `subtitle`, `badges`, `extraInfo`, `text`.

### components/menu/public/PublicMenuOrderActionsCard.jsx

Fuente: [src/components/menu/public/PublicMenuOrderActionsCard.jsx](../src/components/menu/public/PublicMenuOrderActionsCard.jsx). 98 líneas.

Exportaciones: `default: PublicMenuOrderActionsCard`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `PillButton`, `SearchBar`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `publicMenu`, `rightActions`, `q`, `onSearchChange`, `totalVisible`, `extraFilterActions`.

### components/menu/public/PublicOnlineOrderCheckoutModal.jsx

Fuente: [src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx](../src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx). 1661 líneas.

Exportaciones: `default: PublicOnlineOrderCheckoutModal`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`getPreparedItemConfigurationSummary`, `getPreparedItemCurrentPrice`, `getPreparedItemDisplayName`, `isPreparedItemLine`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`isMenuSetCartLine`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Modal`, `PillButton`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/public/online-order-checkout/OnlineOrderFulfillmentSection.jsx](../src/components/menu/public/online-order-checkout/OnlineOrderFulfillmentSection.jsx) (`OnlineOrderFulfillmentSection`).

Consumidores directos: [src/pages/public/public-menu-entry/PublicMenuModals.jsx](../src/pages/public/public-menu-entry/PublicMenuModals.jsx).

Estados locales (`useState`): `orderName`, `customerPhone`, `customerEmail`, `customerNotes`, `fulfillmentType`, `timingType`, `requestedForAt`, `deliveryConceptId`, `deliveryAddress`, `deliveryInstructions`, `scheduledPointId`, `scheduledDate`, `scheduledPointTimeBlockId`, `scheduledTime`, `paymentType`, `quote`, `quotedSelection`, `quotedSignature`, `errorMessage`, `cartPage`, `expanded`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `checkoutConfig`, `cart`, `hasInvalidItems`, `invalidItemsCount`, `quoting`, `creating`, `themeColor`, `onClose`, `onQuote`, `onCreate`, `onCreated`, `label`, `input`, `help`, `item`, `color`.

### components/menu/public/PublicSendOrderModal.jsx

Fuente: [src/components/menu/public/PublicSendOrderModal.jsx](../src/components/menu/public/PublicSendOrderModal.jsx). 737 líneas.

Exportaciones: `default: PublicSendOrderModal`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Modal`, `PillButton`).

Consumidores directos: [src/pages/public/public-menu-entry/PublicMenuModals.jsx](../src/pages/public/public-menu-entry/PublicMenuModals.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`, `fallbackCount`, `fallbackTotal`, `approximateTotal`, `hasQuantityPromotion`, `open`, `sending`, `tableSeats`, `allowBaseSend`, `pending`, `canAppend`, `customerName`, `setCustomerName`, `partySize`, `setPartySize`, `adultCount`, `setAdultCount`, `childCount`, `setChildCount`, `cartCount`, `cartTotal`, `newItemsPricingSummary`, `sendToast`, `onClose`, `onSubmit`, `label`, `input`, `help`.

### components/menu/shared/cancellation/OrderCancellationSelection.jsx

Fuente: [src/components/menu/shared/cancellation/OrderCancellationSelection.jsx](../src/components/menu/shared/cancellation/OrderCancellationSelection.jsx). 547 líneas.

Exportaciones: `getOrderCancellationSelectableItems`, `buildOrderCancellationSelectionPayload`, `default: OrderCancellationSelection`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `PillButton`); [src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx](../src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx) (`MenuCartPanelStyles`).

Consumidores directos: [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx), [src/hooks/public/cartAndOrder/usePublicOrderCancellation.js](../src/hooks/public/cartAndOrder/usePublicOrderCancellation.js), [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js), [src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx](../src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `quantity`, `maxQuantity`, `disabled`, `onQuantityChange`, `items`, `selection`, `themeColor`, `onExit`, `onToggleItem`, `onContinue`.

### components/menu/shared/cartPanel/cartPanel.utils.js

Fuente: [src/components/menu/shared/cartPanel/cartPanel.utils.js](../src/components/menu/shared/cartPanel/cartPanel.utils.js). 288 líneas.

Exportaciones: `renderNotes`, `resolveOrderItemCancellationState`, `classifyOrderHistoryItems`, `isOldMenuSetRoot`, `getToastStyles`, `buildOldItemsTree`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx), [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx), [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx).

### components/menu/shared/cartPanel/CartProductDetailIcons.jsx

Fuente: [src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx](../src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx). 253 líneas.

Exportaciones: `getCartProductNotes`, `getCartProductExtras`, `getCartProductExtrasCount`, `default: CartProductDetailIcons`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx](../src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx), [src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx](../src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx), [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx), [src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx](../src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `option`, `onShowDetails`.

### components/menu/shared/cartPanel/CartProductDetailsDialog.jsx

Fuente: [src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx](../src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx). 430 líneas.

Exportaciones: `default: CartProductDetailsDialog`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`); [src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx](../src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx) (`getCartProductExtras`, `getCartProductNotes`).

Consumidores directos: [src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx](../src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx), [src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx](../src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx), [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `item`, `option`, `section`, `themeColor`, `onClose`.

### components/menu/shared/cartPanel/CompositeDetailBlock.jsx

Fuente: [src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx](../src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx). 187 líneas.

Exportaciones: `default: CompositeDetailBlock`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`formatComponentDetailLabel`, `safeNum`); [src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx](../src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx) (`CartProductDetailIcons`); [src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx](../src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx) (`CartProductDetailsDialog`).

Consumidores directos: [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx), [src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx](../src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx).

Estados locales (`useState`): `selectedDetail`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `components`, `definitions`, `depth`, `onShowDetails`, `item`, `details`, `themeColor`.

### components/menu/shared/cartPanel/MenuCartPanelStyles.jsx

Fuente: [src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx](../src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx). 974 líneas.

Exportaciones: `default: MenuCartPanelStyles`.

Dependencias internas: [src/components/menu/shared/cartPanel/styles/cartPanelCancellation.styles.js](../src/components/menu/shared/cartPanel/styles/cartPanelCancellation.styles.js) (`cartPanelCancellationStyles`); [src/components/menu/shared/cartPanel/styles/cartPanelPricing.styles.js](../src/components/menu/shared/cartPanel/styles/cartPanelPricing.styles.js) (`cartPanelPricingStyles`); [src/components/menu/shared/cartPanel/styles/cartPanelComposite.styles.js](../src/components/menu/shared/cartPanel/styles/cartPanelComposite.styles.js) (`cartPanelCompositeStyles`).

Consumidores directos: [src/components/menu/shared/cancellation/OrderCancellationSelection.jsx](../src/components/menu/shared/cancellation/OrderCancellationSelection.jsx), [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx).

### components/menu/shared/cartPanel/ModifierGroupsBlock.jsx

Fuente: [src/components/menu/shared/cartPanel/ModifierGroupsBlock.jsx](../src/components/menu/shared/cartPanel/ModifierGroupsBlock.jsx). 66 líneas.

Exportaciones: `default: ModifierGroupsBlock`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`).

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `groups`, `indent`.

### components/menu/shared/cartPanel/NewItemsSection.jsx

Fuente: [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx). 786 líneas.

Exportaciones: `default: NewItemsSection`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildNewItemsPricingSummary`, `getAvailabilityData`, `getPublicAvailabilityPresentation`, `money`, `safeNum`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`getPreparedItemConfigurationSummary`, `getPreparedItemCurrentPrice`, `getPreparedItemDisplayName`, `isPreparedItemLine`); [src/hooks/menu/menuAvailability.utils.js](../src/hooks/menu/menuAvailability.utils.js) (`isCartItemAvailabilityInvalid`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`isMenuSetCartLine`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`normalizeMenuSet`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/shared/cartPanel/cartPanel.utils.js](../src/components/menu/shared/cartPanel/cartPanel.utils.js) (`buildOldItemsTree`); [src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx](../src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx) (`CompositeDetailBlock`); [src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx](../src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx) (`CartProductDetailIcons`, `getCartProductNotes`); [src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx](../src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx) (`MenuSetCartDetail`); [src/components/menu/shared/cartPanel/QtyControl.jsx](../src/components/menu/shared/cartPanel/QtyControl.jsx) (`QtyControl`).

Consumidores directos: [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx).

Estados locales (`useState`): `page`, `expanded`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `onOpenNote`, `onRemove`, `onShowDetails`, `menuSet`, `themeColor`, `onQtyChange`, `onEditMenuSet`, `newItems`, `menuSets`, `pendingItems`, `canAppend`.

### components/menu/shared/cartPanel/NoteEditorModal.jsx

Fuente: [src/components/menu/shared/cartPanel/NoteEditorModal.jsx](../src/components/menu/shared/cartPanel/NoteEditorModal.jsx). 278 líneas.

Exportaciones: `default: NoteEditorModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `item`, `value`, `setValue`, `onClose`, `onSave`.

### components/menu/shared/cartPanel/OldItemsSection.jsx

Fuente: [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx). 862 líneas.

Exportaciones: `default: OldItemsSection`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `PillButton`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`, `safeNum`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/shared/cartPanel/cartPanel.utils.js](../src/components/menu/shared/cartPanel/cartPanel.utils.js) (`buildOldItemsTree`, `classifyOrderHistoryItems`, `isOldMenuSetRoot`, `resolveOrderItemCancellationState`); [src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx](../src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx) (`CompositeDetailBlock`); [src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx](../src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx) (`CartProductDetailIcons`); [src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx](../src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx) (`MenuSetCartDetail`).

Consumidores directos: [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx).

Estados locales (`useState`): `expanded`, `page`, `inheritedColor`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `onRemoveOldItem`, `removingOldItemId`, `oldItemRemoveLabel`, `promotions`, `pricing`, `themeColor`, `onShowDetails`, `allowOldMenuSetRemoval`, `title`, `items`, `emptyMessage`, `itemLabel`, `oldItems`, `oldItemsTree`.

### components/menu/shared/cartPanel/QtyControl.jsx

Fuente: [src/components/menu/shared/cartPanel/QtyControl.jsx](../src/components/menu/shared/cartPanel/QtyControl.jsx). 73 líneas.

Exportaciones: `default: QtyControl`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`safeNum`).

Consumidores directos: [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `onQtyChange`.

### components/menu/shared/cartPanel/styles/cartPanelCancellation.styles.js

Fuente: [src/components/menu/shared/cartPanel/styles/cartPanelCancellation.styles.js](../src/components/menu/shared/cartPanel/styles/cartPanelCancellation.styles.js). 288 líneas.

Exportaciones: `cartPanelCancellationStyles`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx](../src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx).

### components/menu/shared/cartPanel/styles/cartPanelComposite.styles.js

Fuente: [src/components/menu/shared/cartPanel/styles/cartPanelComposite.styles.js](../src/components/menu/shared/cartPanel/styles/cartPanelComposite.styles.js). 462 líneas.

Exportaciones: `cartPanelCompositeStyles`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx](../src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx).

### components/menu/shared/cartPanel/styles/cartPanelPricing.styles.js

Fuente: [src/components/menu/shared/cartPanel/styles/cartPanelPricing.styles.js](../src/components/menu/shared/cartPanel/styles/cartPanelPricing.styles.js). 310 líneas.

Exportaciones: `cartPanelPricingStyles`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx](../src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx).

### components/menu/shared/CompositeProductModal.jsx

Fuente: [src/components/menu/shared/CompositeProductModal.jsx](../src/components/menu/shared/CompositeProductModal.jsx). 667 líneas.

Exportaciones: `default: CompositeProductModal`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Modal`, `PillButton`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`getPublicAvailabilityPresentation`, `isAvailabilityBlocked`).

Consumidores directos: [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/pages/public/public-menu-entry/PublicMenuModals.jsx](../src/pages/public/public-menu-entry/PublicMenuModals.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `isMobile`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `source`, `open`, `product`, `draft`, `onClose`, `onToggleIncluded`, `onVariantChange`, `onConfirm`, `confirmLabel`, `busy`.

### components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx](../src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx). 142 líneas.

Exportaciones: `default: MenuCatalogModeLayout`.

Dependencias internas: [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`getCatalogModeVisibility`); [src/components/menu/shared/menu-sets/MenuSetsSection.jsx](../src/components/menu/shared/menu-sets/MenuSetsSection.jsx) (`MenuSetsSection`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `catalogMode`, `menuSets`, `normalContent`, `menuSetsContent`, `themeColor`, `onOpenMenuSet`, `loading`, `showNormalHeader`, `children`.

### components/menu/shared/menu-sets/MenuSetCard.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuSetCard.jsx](../src/components/menu/shared/menu-sets/MenuSetCard.jsx). 267 líneas.

Exportaciones: `default: MenuSetCard`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`, `ProductThumb`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`normalizeMenuSet`).

Consumidores directos: [src/components/menu/shared/menu-sets/MenuSetsSection.jsx](../src/components/menu/shared/menu-sets/MenuSetsSection.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `menuSet`, `themeColor`, `onOpenMenuSet`.

### components/menu/shared/menu-sets/MenuSetCartDetail.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx](../src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx). 654 líneas.

Exportaciones: `default: MenuSetCartDetail`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`isMenuSetCartLine`); [src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx](../src/components/menu/shared/cartPanel/CartProductDetailIcons.jsx) (`CartProductDetailIcons`); [src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx](../src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx) (`CartProductDetailsDialog`); [src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx](../src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx) (`CompositeDetailBlock`).

Consumidores directos: [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx).

Estados locales (`useState`): `productsExpanded`, `expanded`, `selectedDetail`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `theme`, `border`, `themeColor`, `onShowDetails`, `menuSet`, `defaultExpanded`, `onEdit`, `onRemove`, `readOnly`.

### components/menu/shared/menu-sets/MenuSetNotesModal.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuSetNotesModal.jsx](../src/components/menu/shared/menu-sets/MenuSetNotesModal.jsx). 255 líneas.

Exportaciones: `default: MenuSetNotesModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `productName`, `value`, `onChange`, `onClose`, `onSave`, `themeColor`, `readOnly`.

### components/menu/shared/menu-sets/MenuSetsSection.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuSetsSection.jsx](../src/components/menu/shared/menu-sets/MenuSetsSection.jsx). 306 líneas.

Exportaciones: `default: MenuSetsSection`.

Dependencias internas: [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`normalizeMenuSet`); [src/components/menu/shared/menu-sets/MenuSetCard.jsx](../src/components/menu/shared/menu-sets/MenuSetCard.jsx) (`MenuSetCard`).

Consumidores directos: [src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx](../src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx).

Estados locales (`useState`): `canScrollLeft`, `canScrollRight`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`, `menuSets`, `loading`, `themeColor`, `onOpenMenuSet`.

### components/menu/shared/menu-sets/MenuSetStageContent.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx). 669 líneas.

Exportaciones: `default: MenuSetStageContent`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildModifierContextSections`); [src/hooks/public/useCompositeDrafts.js](../src/hooks/public/useCompositeDrafts.js) (`useCompositeDrafts`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/shared/CompositeProductModal.jsx](../src/components/menu/shared/CompositeProductModal.jsx) (`CompositeProductModal`); [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx) (`ProductExtrasModal`); [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx) (`ProductVariantsModal`); [src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx](../src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx) (`MenuSetStageProductCard`); [src/components/menu/shared/menu-sets/MenuSetNotesModal.jsx](../src/components/menu/shared/menu-sets/MenuSetNotesModal.jsx) (`MenuSetNotesModal`).

Consumidores directos: [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx).

Estados locales (`useState`): `flow`, `activeDialog`, `noteValue`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `builder`, `stage`, `themeColor`, `canSelect`, `onError`.

### components/menu/shared/menu-sets/MenuSetStageNavigation.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx](../src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx). 804 líneas.

Exportaciones: `default: MenuSetStageNavigation`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx](../src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx) (`MenuSetStageProductCard`).

Consumidores directos: [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `builder`, `stages`, `currentStep`, `stageValidations`, `selectionsByStage`, `themeColor`, `canSelect`, `readOnly`, `showMobileControls`, `onGoToStep`, `onPrevious`, `onNext`, `onBack`, `onSelectOption`, `onRemoveOption`, `onViewOption`, `onConfirm`, `confirmLabel`, `footerActions`, `summaryContent`, `children`.

### components/menu/shared/menu-sets/MenuSetStageProductCard.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx](../src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx). 1087 líneas.

Exportaciones: `default: MenuSetStageProductCard`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`, `ProductThumb`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`normalizeMenuSetOption`).

Consumidores directos: [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx](../src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx).

Estados locales (`useState`): `detailsOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `option`, `selected`, `selection`, `canSelect`, `themeColor`, `onSelect`, `onRemove`, `onOpenVariants`, `onViewDetails`, `onConfigure`, `onNotes`.

### components/menu/shared/menu-sets/MenuSetSummary.jsx

Fuente: [src/components/menu/shared/menu-sets/MenuSetSummary.jsx](../src/components/menu/shared/menu-sets/MenuSetSummary.jsx). 548 líneas.

Exportaciones: `default: MenuSetSummary`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`).

Consumidores directos: [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `option`, `selection`, `color`, `muted`, `builder`, `menuSet`, `stages`, `selectionsByStage`, `themeColor`, `canSelect`, `readOnly`, `onEditStage`, `onRemoveOption`.

### components/menu/shared/MenuCartDrawer.jsx

Fuente: [src/components/menu/shared/MenuCartDrawer.jsx](../src/components/menu/shared/MenuCartDrawer.jsx). 294 líneas.

Exportaciones: `default: MenuCartDrawer`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `PillButton`).

Consumidores directos: [src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx](../src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `title`, `subtitle`, `itemCount`, `total`, `totalLabel`, `isEstimated`, `pricingSummary`, `children`, `disabledClose`, `closeOnBackdrop`.

### components/menu/shared/MenuCartFloatingButton.jsx

Fuente: [src/components/menu/shared/MenuCartFloatingButton.jsx](../src/components/menu/shared/MenuCartFloatingButton.jsx). 199 líneas.

Exportaciones: `default: MenuCartFloatingButton`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `itemCount`, `total`, `totalLabel`, `isEstimated`, `disabled`, `onClick`, `label`, `title`, `showTotal`, `themeColor`.

### components/menu/shared/MenuCartPanel.jsx

Fuente: [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx). 716 líneas.

Exportaciones: `default: MenuCartPanel`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `PillButton`); [src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx](../src/components/menu/shared/cartPanel/MenuCartPanelStyles.jsx) (`MenuCartPanelStyles`); [src/components/menu/shared/cartPanel/NoteEditorModal.jsx](../src/components/menu/shared/cartPanel/NoteEditorModal.jsx) (`NoteEditorModal`); [src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx](../src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx) (`CartProductDetailsDialog`); [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx) (`OldItemsSection`); [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx) (`NewItemsSection`); [src/components/menu/shared/cancellation/OrderCancellationSelection.jsx](../src/components/menu/shared/cancellation/OrderCancellationSelection.jsx) (`OrderCancellationSelection`, `getOrderCancellationSelectableItems`); [src/components/menu/shared/cartPanel/cartPanel.utils.js](../src/components/menu/shared/cartPanel/cartPanel.utils.js) (`buildOldItemsTree`, `getToastStyles`).

Consumidores directos: [src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx](../src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `noteItem`, `noteValue`, `activeView`, `selectedProductDetail`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `pricingSummary`, `fallbackTotal`, `title`, `subtitle`, `customerName`, `themeColor`, `total`, `oldItems`, `newItems`, `menuSets`, `pendingItems`, `sendToast`, `sending`, `canAppend`, `canSubmit`, `hasInvalidItems`, `invalidItemsCount`, `submitBlockReason`, `showPaymentMessage`, `statusBadges`, `extraTopActions`, `submitLabel`, `submitTitle`, `onEmpty`, `onSubmit`, `onQtyChange`, `onNotesChange`, `onRemove`, `onEditMenuSet`, `onRemoveOldItem`, `removingOldItemId`, `oldItemRemoveLabel`, `allowOldMenuSetRemoval`, `requestBillBlock`, `cancellation`.

### components/menu/shared/MenuProductCard.jsx

Fuente: [src/components/menu/shared/MenuProductCard.jsx](../src/components/menu/shared/MenuProductCard.jsx). 606 líneas.

Exportaciones: `default: MenuProductCard`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `PillButton`, `ProductThumb`); [src/components/menu/shared/ProductInfoModal.jsx](../src/components/menu/shared/ProductInfoModal.jsx) (`ProductInfoModal`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`getAvailabilityData`, `getAvailabilityTone`, `getPublicAvailabilityPresentation`, `hasAnyModifierGroups`, `isAvailabilityBlocked`, `money`, `normalizePromotionPresentation`).

Consumidores directos: [src/pages/public/public-menu-entry/PublicMenuProductsGrid.jsx](../src/pages/public/public-menu-entry/PublicMenuProductsGrid.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `infoOpen`, `hovered`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `availability`, `product`, `categoryName`, `canSelect`, `showSelectBtn`, `allowReadOnlyDetails`, `themeColor`, `onAddSimple`, `onAddVariant`, `onOpenComposite`, `onOpenExtras`, `onOpenVariants`.

### components/menu/shared/menuUi/MenuSectionTabs.jsx

Fuente: [src/components/menu/shared/menuUi/MenuSectionTabs.jsx](../src/components/menu/shared/menuUi/MenuSectionTabs.jsx). 462 líneas.

Exportaciones: `default: MenuSectionTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sections`, `selectedSectionId`, `onSectionChange`, `themeColor`.

### components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx

Fuente: [src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx](../src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx). 96 líneas.

Exportaciones: `default: PublicMenuCategoryTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `categoryOptions`, `value`, `onChange`, `themeColor`.

### components/menu/shared/prepared-items/PreparedItemCard.jsx

Fuente: [src/components/menu/shared/prepared-items/PreparedItemCard.jsx](../src/components/menu/shared/prepared-items/PreparedItemCard.jsx). 340 líneas.

Exportaciones: `default: PreparedItemCard`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`, `ProductThumb`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`getPreparedItemConfigurationSummary`, `getPreparedItemCurrentPrice`, `getPreparedItemDisplayName`).

Consumidores directos: [src/components/menu/shared/prepared-items/PreparedItemsSection.jsx](../src/components/menu/shared/prepared-items/PreparedItemsSection.jsx).

Estados locales (`useState`): `hovered`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `preparedItem`, `selected`, `disabled`, `themeColor`, `onSelect`.

### components/menu/shared/prepared-items/PreparedItemsSection.jsx

Fuente: [src/components/menu/shared/prepared-items/PreparedItemsSection.jsx](../src/components/menu/shared/prepared-items/PreparedItemsSection.jsx). 432 líneas.

Exportaciones: `default: PreparedItemsSection`.

Dependencias internas: [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`getPreparedItemCartKey`, `getPreparedItemId`); [src/components/menu/shared/prepared-items/PreparedItemCard.jsx](../src/components/menu/shared/prepared-items/PreparedItemCard.jsx) (`PreparedItemCard`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `canScrollLeft`, `canScrollRight`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`, `loading`, `selectedPreparedItemIds`, `onSelect`, `themeColor`.

### components/menu/shared/product-extras/ModifierCardShells.jsx

Fuente: [src/components/menu/shared/product-extras/ModifierCardShells.jsx](../src/components/menu/shared/product-extras/ModifierCardShells.jsx). 105 líneas.

Exportaciones: `isValidModifierColor`, `getSafeModifierThemeColor`, `modifierHexToRgba`, `ModifierGroupCard`, `ModifierOptionCard`, `ModifierOptionsArea`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/product-extras/ModifierGroupCarousel.jsx](../src/components/menu/shared/product-extras/ModifierGroupCarousel.jsx), [src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx](../src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx), [src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx), [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx), [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `themeColor`, `children`, `style`, `selected`, `muted`.

### components/menu/shared/product-extras/ModifierGroupCarousel.jsx

Fuente: [src/components/menu/shared/product-extras/ModifierGroupCarousel.jsx](../src/components/menu/shared/product-extras/ModifierGroupCarousel.jsx). 413 líneas.

Exportaciones: `getModifierGroupCarouselKey`, `default: ModifierGroupCarousel`.

Dependencias internas: [src/components/menu/shared/product-extras/ModifierCardShells.jsx](../src/components/menu/shared/product-extras/ModifierCardShells.jsx) (`getSafeModifierThemeColor`, `modifierHexToRgba`).

Consumidores directos: [src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx), [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx).

Estados locales (`useState`): `canScrollLeft`, `canScrollRight`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `group`, `selected`, `themeColor`, `onClick`, `groups`, `selectedGroupKey`, `onSelectGroup`.

### components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx

Fuente: [src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx](../src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx). 732 líneas.

Exportaciones: `pluralize`, `getSectionGroupCount`, `getProductLabel`, `getEntityLabel`, `getSectionDisplayLabel`, `getContextTitle`, `getEntityScreenTitle`, `getSectionNavigationKey`, `getGroupMinimumRequirement`, `isModifierGroupRequired`, `buildRequirementSummary`, `buildSectionRequirementSummary`, `buildContextRequirementSummary`, `getRequirementStatus`, `getRequirementDetail`, `buildContextCards`, `RequirementBadge`, `ContextCard`, `EntityCard`.

Dependencias internas: [src/components/menu/shared/product-extras/ModifierCardShells.jsx](../src/components/menu/shared/product-extras/ModifierCardShells.jsx) (`getSafeModifierThemeColor`, `modifierHexToRgba`).

Consumidores directos: [src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx), [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx), [src/components/menu/shared/product-extras/useProductExtrasSelection.js](../src/components/menu/shared/product-extras/useProductExtrasSelection.js).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `status`, `summary`, `context`, `themeColor`, `onClick`, `section`, `requirementSummary`, `interactiveRequirements`.

### components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx

Fuente: [src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx). 847 líneas.

Exportaciones: `default: ProductExtrasReadOnlyNavigator`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`formatModifierGroupSelectionInstruction`, `formatModifierOptionRepeatInstruction`, `getAvailabilityTone`, `getPublicAvailabilityPresentation`, `money`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/shared/product-extras/ModifierCardShells.jsx](../src/components/menu/shared/product-extras/ModifierCardShells.jsx) (`getSafeModifierThemeColor`, `modifierHexToRgba`, `ModifierGroupCard`, `ModifierOptionCard`, `ModifierOptionsArea`); [src/components/menu/shared/product-extras/ModifierGroupCarousel.jsx](../src/components/menu/shared/product-extras/ModifierGroupCarousel.jsx) (`ModifierGroupCarousel`, `getModifierGroupCarouselKey`); [src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx](../src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx) (`buildContextCards`, `ContextCard`, `EntityCard`, `getContextTitle`, `getEntityLabel`, `getEntityScreenTitle`, `getProductLabel`, `getSectionGroupCount`, `pluralize`).

Consumidores directos: [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx).

Estados locales (`useState`): `selectedGroupKey`, `selectedContext`, `selectedSection`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `group`, `option`, `themeColor`, `context`, `onSelectSection`, `section`, `product`, `sections`, `navigationRef`, `onCanGoBackChange`.

### components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx

Fuente: [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx). 1134 líneas.

Exportaciones: `default: ProductExtrasSelectionNavigator`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`formatModifierGroupSelectionInstruction`, `money`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`); [src/components/menu/shared/product-extras/ModifierCardShells.jsx](../src/components/menu/shared/product-extras/ModifierCardShells.jsx) (`getSafeModifierThemeColor`, `modifierHexToRgba`, `ModifierGroupCard`, `ModifierOptionCard`, `ModifierOptionsArea`); [src/components/menu/shared/product-extras/ModifierGroupCarousel.jsx](../src/components/menu/shared/product-extras/ModifierGroupCarousel.jsx) (`ModifierGroupCarousel`, `getModifierGroupCarouselKey`); [src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx](../src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx) (`buildContextCards`, `ContextCard`, `EntityCard`, `getContextTitle`, `getEntityLabel`, `getEntityScreenTitle`, `getProductLabel`, `getSectionDisplayLabel`, `getSectionGroupCount`, `getSectionNavigationKey`, `pluralize`); [src/components/menu/shared/product-extras/useProductExtrasSelection.js](../src/components/menu/shared/product-extras/useProductExtrasSelection.js) (`getDynamicOptionRepeatInstruction`, `getGroupCompliance`, `getOptionSelectionState`).

Consumidores directos: [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx).

Estados locales (`useState`): `selectedGroupKey`, `selectedContextType`, `selectedSectionKey`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `group`, `option`, `selected`, `themeColor`, `onSelectOption`, `onIncrementQty`, `onDecrementQty`, `onRemoveOption`, `selectionMap`, `section`, `product`, `context`, `sectionRequirementSummaries`, `onSelectSection`, `sections`, `contextRequirementSummaries`, `errorMsg`, `navigationRef`, `onCanGoBackChange`.

### components/menu/shared/product-extras/useProductExtrasSelection.js

Fuente: [src/components/menu/shared/product-extras/useProductExtrasSelection.js](../src/components/menu/shared/product-extras/useProductExtrasSelection.js). 896 líneas.

Exportaciones: `makeGroupSelectionKey`, `buildPreparedSections`, `countDistinctSelectedOptions`, `countTotalSelectedUnits`, `getGroupMinSelect`, `getGroupMaxSelect`, `getGroupCompliance`, `buildInitialSelectionMap`, `normalizeSelectionForResult`, `validatePreparedSections`, `getOptionQuantityLimit`, `getAvailabilityUi`, `getOptionSelectionState`, `getDynamicOptionRepeatInstruction`, `default: useProductExtrasSelection`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildModifierDisplayGroupsFromApiGroups`, `formatModifierOptionRepeatInstruction`, `getPublicAvailabilityPresentation`, `isAvailabilityBlocked`); [src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx](../src/components/menu/shared/product-extras/ProductExtrasNavigationShared.jsx) (`buildContextRequirementSummary`, `buildSectionRequirementSummary`, `getGroupMinimumRequirement`, `getSectionNavigationKey`).

Consumidores directos: [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx), [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx).

Estados locales (`useState`): `selectionMap`, `errorMsg`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `product`, `contextSections`, `initialValue`, `group`.

### components/menu/shared/ProductExtrasModal.jsx

Fuente: [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx). 203 líneas.

Exportaciones: `default: ProductExtrasModal`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Modal`, `PillButton`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildModifierContextSections`); [src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx) (`ProductExtrasReadOnlyNavigator`); [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx) (`ProductExtrasSelectionNavigator`); [src/components/menu/shared/product-extras/useProductExtrasSelection.js](../src/components/menu/shared/product-extras/useProductExtrasSelection.js) (`useProductExtrasSelection`); [src/components/menu/shared/product-extras/ModifierCardShells.jsx](../src/components/menu/shared/product-extras/ModifierCardShells.jsx) (`getSafeModifierThemeColor`).

Consumidores directos: [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/pages/public/public-menu-entry/PublicMenuModals.jsx](../src/pages/public/public-menu-entry/PublicMenuModals.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `readOnlyCanGoBack`, `selectionCanGoBack`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `product`, `variantId`, `compositeDraft`, `initialValue`, `readOnly`, `themeColor`, `onClose`, `onConfirm`, `confirmLabel`, `selectionScope`.

### components/menu/shared/ProductInfoModal.jsx

Fuente: [src/components/menu/shared/ProductInfoModal.jsx](../src/components/menu/shared/ProductInfoModal.jsx). 501 líneas.

Exportaciones: `default: ProductInfoModal`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`ProductThumb`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`getAvailabilityData`, `getAvailabilityTone`, `getPublicAvailabilityPresentation`, `money`, `normalizePromotionPresentation`).

Consumidores directos: [src/components/menu/shared/MenuProductCard.jsx](../src/components/menu/shared/MenuProductCard.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `product`, `categoryName`, `themeColor`, `onClose`.

### components/menu/shared/ProductVariantsModal.jsx

Fuente: [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx). 578 líneas.

Exportaciones: `default: ProductVariantsModal`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `Modal`, `PillButton`, `ProductThumb`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`AVAILABILITY_STATUS_UNAVAILABLE_BY_SCHEDULE`, `getAvailabilityData`, `getAvailabilityTone`, `getPublicAvailabilityPresentation`, `isAvailabilityBlocked`, `money`, `normalizePromotionPresentation`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/pages/public/public-menu-entry/PublicMenuModals.jsx](../src/pages/public/public-menu-entry/PublicMenuModals.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `hovered`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `availability`, `product`, `variant`, `index`, `canSelect`, `showSelectBtn`, `themeColor`, `onAddVariant`, `onClose`, `open`.

### components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js

Fuente: [src/components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js](../src/components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js). 386 líneas.

Exportaciones: `REASON_LABELS`, `REUSE_LABELS`, `DELIVERY_NOT_DELIVERED`, `DELIVERY_DELIVERED`, `DELIVERY_LABELS`, `KITCHEN_STATUS_LABELS`, `getOrderItemId`, `getRequestedQuantity`, `getEffectiveQuantity`, `getItemLabel`, `normalizePhysicalOptions`, `getReasonLabel`, `getKitchenStatusLabel`, `formatRequestDate`, `getAuthorizerUserId`, `getAuthorizerLabel`, `buildRequestedItems`, `getPhysicalResolutionItems`, `requiresReuseDecision`, `requiresRequestAuthorization`, `normalizeAuthorizers`, `buildInitialItemDecisions`, `buildApprovalPayload`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx), [src/components/menu/staff/cancellation-request/WaiterCancellationRequestReview.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestReview.jsx), [src/components/menu/staff/WaiterCancellationRequestDialog.jsx](../src/components/menu/staff/WaiterCancellationRequestDialog.jsx).

### components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx

Fuente: [src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx). 864 líneas.

Exportaciones: `default: WaiterCancellationRequestApproval`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js](../src/components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js) (`buildApprovalPayload`, `buildInitialItemDecisions`, `DELIVERY_LABELS`, `DELIVERY_NOT_DELIVERED`, `getItemLabel`, `getOrderItemId`, `getPhysicalResolutionItems`, `getRequestedQuantity`, `normalizePhysicalOptions`, `requiresReuseDecision`, `REUSE_LABELS`).

Consumidores directos: [src/components/menu/staff/WaiterCancellationRequestDialog.jsx](../src/components/menu/staff/WaiterCancellationRequestDialog.jsx).

Estados locales (`useState`): `stepIndex`, `itemDecisions`, `authorizerUserId`, `pin`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`, `requiresAuthorization`, `authorizers`, `loading`, `onBack`, `onConfirm`, `steps`, `currentIndex`, `primaryColor`, `number`, `title`, `description`, `label`, `options`, `value`, `labels`, `onChange`, `input`, `help`.

### components/menu/staff/cancellation-request/WaiterCancellationRequestModalShell.jsx

Fuente: [src/components/menu/staff/cancellation-request/WaiterCancellationRequestModalShell.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestModalShell.jsx). 143 líneas.

Exportaciones: `default: WaiterCancellationRequestModalShell`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/staff/WaiterCancellationRequestDialog.jsx](../src/components/menu/staff/WaiterCancellationRequestDialog.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `title`, `subtitle`, `closeDisabled`, `onClose`, `children`.

### components/menu/staff/cancellation-request/WaiterCancellationRequestReview.jsx

Fuente: [src/components/menu/staff/cancellation-request/WaiterCancellationRequestReview.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestReview.jsx). 503 líneas.

Exportaciones: `default: WaiterCancellationRequestReview`.

Dependencias internas: [src/components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js](../src/components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js) (`formatRequestDate`, `getItemLabel`, `getKitchenStatusLabel`, `getOrderItemId`, `getReasonLabel`, `getRequestedQuantity`).

Consumidores directos: [src/components/menu/staff/WaiterCancellationRequestDialog.jsx](../src/components/menu/staff/WaiterCancellationRequestDialog.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `request`, `items`, `hasStaleItems`, `loading`, `action`, `onReject`, `onApprove`, `label`, `value`.

### components/menu/staff/MenuHeaderCard.jsx

Fuente: [src/components/menu/staff/MenuHeaderCard.jsx](../src/components/menu/staff/MenuHeaderCard.jsx). 146 líneas.

Exportaciones: `default: MenuHeaderCard`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `CategoryChip`, `PillButton`, `SearchBar`).

Consumidores directos: [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `subtitle`, `badges`, `extraInfo`, `rightActions`, `categoryOptions`, `categoryFilter`, `onCategoryChange`, `q`, `onSearchChange`, `totalVisible`, `extraFilterActions`, `children`.

### components/menu/staff/WaiterCancellationDialog.jsx

Fuente: [src/components/menu/staff/WaiterCancellationDialog.jsx](../src/components/menu/staff/WaiterCancellationDialog.jsx). 1063 líneas.

Exportaciones: `default: WaiterCancellationDialog`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `reasonCode`, `reasonNote`, `authorizerUserId`, `pin`, `itemDecisions`, `stepIndex`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `type`, `selectedItems`, `context`, `requiresAuthorization`, `loading`, `error`, `onClose`, `onConfirm`, `severity`, `title`, `message`, `steps`, `currentIndex`, `number`, `description`, `label`, `options`, `value`, `labels`, `onChange`, `input`, `help`.

### components/menu/staff/WaiterCancellationRequestDialog.jsx

Fuente: [src/components/menu/staff/WaiterCancellationRequestDialog.jsx](../src/components/menu/staff/WaiterCancellationRequestDialog.jsx). 161 líneas.

Exportaciones: `default: WaiterCancellationRequestDialog`.

Dependencias internas: [src/components/menu/staff/cancellation-request/WaiterCancellationRequestModalShell.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestModalShell.jsx) (`WaiterCancellationRequestModalShell`); [src/components/menu/staff/cancellation-request/WaiterCancellationRequestReview.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestReview.jsx) (`WaiterCancellationRequestReview`); [src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx) (`WaiterCancellationRequestApproval`); [src/components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js](../src/components/menu/staff/cancellation-request/waiterCancellationRequest.utils.js) (`buildRequestedItems`, `getPhysicalResolutionItems`, `normalizeAuthorizers`, `requiresRequestAuthorization`).

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

Estados locales (`useState`): `view`, `action`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `request`, `context`, `loading`, `onClose`, `onReject`, `onApprove`.

### components/menu/staff/WaiterWarehouseCreateDialog.jsx

Fuente: [src/components/menu/staff/WaiterWarehouseCreateDialog.jsx](../src/components/menu/staff/WaiterWarehouseCreateDialog.jsx). 337 líneas.

Exportaciones: `default: WaiterWarehouseCreateDialog`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`getInitialWarehouseSelectionId`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `Modal`, `PillButton`).

Consumidores directos: [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `warehouseId`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `loading`, `customerName`, `selection`, `onClose`, `onConfirm`.

### components/operation/billing-settings/authorizers/OperationalAuthorizersContextCard.jsx

Fuente: [src/components/operation/billing-settings/authorizers/OperationalAuthorizersContextCard.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersContextCard.jsx). 152 líneas.

Exportaciones: `default: OperationalAuthorizersContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `authorizers`, `candidates`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx

Fuente: [src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx). 662 líneas.

Exportaciones: `default: OperationalAuthorizersListCard`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/operation/billing-settings/authorizers/OperationalAuthorizerUpsertModal.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizerUpsertModal.jsx) (`OperationalAuthorizerUpsertModal`).

Consumidores directos: [src/components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx).

Estados locales (`useState`): `modalOpen`, `editing`, `deleteTarget`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `authorizers`, `candidates`, `savingAuthorizerId`, `deletingAuthorizerId`, `onCreate`, `onUpdate`, `onDelete`, `onToggleStatus`, `showToast`, `active`, `text`.

### components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx

Fuente: [src/components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx). 89 líneas.

Exportaciones: `default: OperationalAuthorizersTab`.

Dependencias internas: [src/components/operation/billing-settings/authorizers/OperationalAuthorizersContextCard.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersContextCard.jsx) (`OperationalAuthorizersContextCard`); [src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx) (`OperationalAuthorizersListCard`).

Consumidores directos: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `authorizers`, `candidates`, `loading`, `savingAuthorizerId`, `deletingAuthorizerId`, `onCreate`, `onUpdate`, `onDelete`, `onToggleStatus`, `showToast`.

### components/operation/billing-settings/authorizers/OperationalAuthorizerUpsertModal.jsx

Fuente: [src/components/operation/billing-settings/authorizers/OperationalAuthorizerUpsertModal.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizerUpsertModal.jsx). 475 líneas.

Exportaciones: `default: OperationalAuthorizerUpsertModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx).

Estados locales (`useState`): `form`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `selectedBranch`, `candidates`, `editing`, `saving`, `onSave`, `showToast`, `label`, `input`, `help`, `title`, `description`, `checked`, `onChange`.

### components/operation/billing-settings/BillingSettingsBranchSelectorCard.jsx

Fuente: [src/components/operation/billing-settings/BillingSettingsBranchSelectorCard.jsx](../src/components/operation/billing-settings/BillingSettingsBranchSelectorCard.jsx). 60 líneas.

Exportaciones: `default: BillingSettingsBranchSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`.

### components/operation/billing-settings/BillingSettingsHeader.jsx

Fuente: [src/components/operation/billing-settings/BillingSettingsHeader.jsx](../src/components/operation/billing-settings/BillingSettingsHeader.jsx). 42 líneas.

Exportaciones: `default: BillingSettingsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`.

### components/operation/billing-settings/BillingSettingsInstructionsCard.jsx

Fuente: [src/components/operation/billing-settings/BillingSettingsInstructionsCard.jsx](../src/components/operation/billing-settings/BillingSettingsInstructionsCard.jsx). 69 líneas.

Exportaciones: `default: BillingSettingsInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/operation/billing-settings/BillingSettingsTabs.jsx

Fuente: [src/components/operation/billing-settings/BillingSettingsTabs.jsx](../src/components/operation/billing-settings/BillingSettingsTabs.jsx). 83 líneas.

Exportaciones: `default: BillingSettingsTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/operation/billing-settings/rules/BillingRulesContextCard.jsx

Fuente: [src/components/operation/billing-settings/rules/BillingRulesContextCard.jsx](../src/components/operation/billing-settings/rules/BillingRulesContextCard.jsx). 154 líneas.

Exportaciones: `default: BillingRulesContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/billing-settings/rules/BillingRulesTab.jsx](../src/components/operation/billing-settings/rules/BillingRulesTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `setting`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/billing-settings/rules/BillingRulesFormCard.jsx

Fuente: [src/components/operation/billing-settings/rules/BillingRulesFormCard.jsx](../src/components/operation/billing-settings/rules/BillingRulesFormCard.jsx). 94 líneas.

Exportaciones: `default: BillingRulesFormCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/billing-settings/rules/BillingRulesTab.jsx](../src/components/operation/billing-settings/rules/BillingRulesTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `canSave`, `saving`, `onChange`, `onSave`.

### components/operation/billing-settings/rules/BillingRulesTab.jsx

Fuente: [src/components/operation/billing-settings/rules/BillingRulesTab.jsx](../src/components/operation/billing-settings/rules/BillingRulesTab.jsx). 154 líneas.

Exportaciones: `default: BillingRulesTab`.

Dependencias internas: [src/components/operation/billing-settings/rules/BillingRulesContextCard.jsx](../src/components/operation/billing-settings/rules/BillingRulesContextCard.jsx) (`BillingRulesContextCard`); [src/components/operation/billing-settings/rules/BillingRulesFormCard.jsx](../src/components/operation/billing-settings/rules/BillingRulesFormCard.jsx) (`BillingRulesFormCard`).

Consumidores directos: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx).

Estados locales (`useState`): `form`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `setting`, `loading`, `saving`, `onSave`, `showToast`, `title`, `message`.

### components/operation/discounts/authorizers/DiscountAuthorizersContextCard.jsx

Fuente: [src/components/operation/discounts/authorizers/DiscountAuthorizersContextCard.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersContextCard.jsx). 167 líneas.

Exportaciones: `default: DiscountAuthorizersContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `authorizers`, `candidates`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx

Fuente: [src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx). 643 líneas.

Exportaciones: `default: DiscountAuthorizersListCard`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/operation/discounts/authorizers/DiscountAuthorizerUpsertModal.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizerUpsertModal.jsx) (`DiscountAuthorizerUpsertModal`).

Consumidores directos: [src/components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx).

Estados locales (`useState`): `modalOpen`, `editing`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `authorizers`, `candidates`, `savingAuthorizerId`, `deletingAuthorizerId`, `onCreate`, `onUpdate`, `onDelete`, `onToggleStatus`, `showToast`, `active`, `text`.

### components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx

Fuente: [src/components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx). 102 líneas.

Exportaciones: `default: DiscountAuthorizersTab`.

Dependencias internas: [src/components/operation/discounts/authorizers/DiscountAuthorizersContextCard.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersContextCard.jsx) (`DiscountAuthorizersContextCard`); [src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx) (`DiscountAuthorizersListCard`).

Consumidores directos: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `authorizers`, `candidates`, `loading`, `savingAuthorizerId`, `deletingAuthorizerId`, `onCreate`, `onUpdate`, `onDelete`, `onToggleStatus`, `showToast`.

### components/operation/discounts/authorizers/DiscountAuthorizerUpsertModal.jsx

Fuente: [src/components/operation/discounts/authorizers/DiscountAuthorizerUpsertModal.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizerUpsertModal.jsx). 486 líneas.

Exportaciones: `default: DiscountAuthorizerUpsertModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx).

Estados locales (`useState`): `form`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `selectedBranch`, `candidates`, `editing`, `saving`, `onSave`, `showToast`, `label`, `input`, `help`, `title`, `description`, `checked`, `onChange`.

### components/operation/discounts/DiscountsBranchSelectorCard.jsx

Fuente: [src/components/operation/discounts/DiscountsBranchSelectorCard.jsx](../src/components/operation/discounts/DiscountsBranchSelectorCard.jsx). 67 líneas.

Exportaciones: `default: DiscountsBranchSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`.

### components/operation/discounts/DiscountsHeader.jsx

Fuente: [src/components/operation/discounts/DiscountsHeader.jsx](../src/components/operation/discounts/DiscountsHeader.jsx). 43 líneas.

Exportaciones: `default: DiscountsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`.

### components/operation/discounts/DiscountsInstructionsCard.jsx

Fuente: [src/components/operation/discounts/DiscountsInstructionsCard.jsx](../src/components/operation/discounts/DiscountsInstructionsCard.jsx). 81 líneas.

Exportaciones: `default: DiscountsInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/operation/discounts/DiscountsTabs.jsx

Fuente: [src/components/operation/discounts/DiscountsTabs.jsx](../src/components/operation/discounts/DiscountsTabs.jsx). 89 líneas.

Exportaciones: `default: DiscountsTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/operation/discounts/policy/DiscountPolicyContextCard.jsx

Fuente: [src/components/operation/discounts/policy/DiscountPolicyContextCard.jsx](../src/components/operation/discounts/policy/DiscountPolicyContextCard.jsx). 187 líneas.

Exportaciones: `default: DiscountPolicyContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/discounts/policy/DiscountPolicyTab.jsx](../src/components/operation/discounts/policy/DiscountPolicyTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `payload`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/discounts/policy/DiscountPolicyFormCard.jsx

Fuente: [src/components/operation/discounts/policy/DiscountPolicyFormCard.jsx](../src/components/operation/discounts/policy/DiscountPolicyFormCard.jsx). 305 líneas.

Exportaciones: `default: DiscountPolicyFormCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/discounts/policy/DiscountPolicyTab.jsx](../src/components/operation/discounts/policy/DiscountPolicyTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `hasPolicy`, `canSave`, `saving`, `deleting`, `onChange`, `onSave`, `onDelete`, `title`, `label`, `input`, `help`, `description`, `checked`.

### components/operation/discounts/policy/DiscountPolicyTab.jsx

Fuente: [src/components/operation/discounts/policy/DiscountPolicyTab.jsx](../src/components/operation/discounts/policy/DiscountPolicyTab.jsx). 191 líneas.

Exportaciones: `default: DiscountPolicyTab`.

Dependencias internas: [src/components/operation/discounts/policy/DiscountPolicyContextCard.jsx](../src/components/operation/discounts/policy/DiscountPolicyContextCard.jsx) (`DiscountPolicyContextCard`); [src/components/operation/discounts/policy/DiscountPolicyFormCard.jsx](../src/components/operation/discounts/policy/DiscountPolicyFormCard.jsx) (`DiscountPolicyFormCard`).

Consumidores directos: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx).

Estados locales (`useState`): `form`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `payload`, `loading`, `saving`, `deleting`, `onSave`, `onDelete`, `showToast`.

### components/operation/loyalty/CustomerLoyaltySettingsContextCard.jsx

Fuente: [src/components/operation/loyalty/CustomerLoyaltySettingsContextCard.jsx](../src/components/operation/loyalty/CustomerLoyaltySettingsContextCard.jsx). 155 líneas.

Exportaciones: `default: CustomerLoyaltySettingsContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `loyaltyData`, `restaurantName`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/loyalty/CustomerLoyaltySettingsFormCard.jsx

Fuente: [src/components/operation/loyalty/CustomerLoyaltySettingsFormCard.jsx](../src/components/operation/loyalty/CustomerLoyaltySettingsFormCard.jsx). 435 líneas.

Exportaciones: `default: CustomerLoyaltySettingsFormCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `onChange`, `disabled`, `preview`, `title`, `label`, `input`, `help`, `description`, `checked`.

### components/operation/loyalty/CustomerLoyaltySettingsHeader.jsx

Fuente: [src/components/operation/loyalty/CustomerLoyaltySettingsHeader.jsx](../src/components/operation/loyalty/CustomerLoyaltySettingsHeader.jsx). 64 líneas.

Exportaciones: `default: CustomerLoyaltySettingsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantName`, `saving`, `onSave`, `canSave`.

### components/operation/loyalty/CustomerLoyaltySettingsInstructionsCard.jsx

Fuente: [src/components/operation/loyalty/CustomerLoyaltySettingsInstructionsCard.jsx](../src/components/operation/loyalty/CustomerLoyaltySettingsInstructionsCard.jsx). 81 líneas.

Exportaciones: `default: CustomerLoyaltySettingsInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/operation/online-orders/activation/ActivationControlCard.jsx

Fuente: [src/components/operation/online-orders/activation/ActivationControlCard.jsx](../src/components/operation/online-orders/activation/ActivationControlCard.jsx). 354 líneas.

Exportaciones: `default: ActivationControlCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx](../src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx).

Estados locales (`useState`): `confirmOpen`, `nextValue`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branchName`, `isActive`, `canActivate`, `saving`, `onChange`.

### components/operation/online-orders/activation/ActivationReadinessCard.jsx

Fuente: [src/components/operation/online-orders/activation/ActivationReadinessCard.jsx](../src/components/operation/online-orders/activation/ActivationReadinessCard.jsx). 280 líneas.

Exportaciones: `default: ActivationReadinessCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx](../src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`, `qr`, `onOpenQr`, `item`, `successBackground`, `pendingBackground`.

### components/operation/online-orders/activation/OnlineOrderActivationTab.jsx

Fuente: [src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx](../src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx). 590 líneas.

Exportaciones: `default: OnlineOrderActivationTab`.

Dependencias internas: [src/components/operation/online-orders/activation/ActivationReadinessCard.jsx](../src/components/operation/online-orders/activation/ActivationReadinessCard.jsx) (`ActivationReadinessCard`); [src/components/operation/online-orders/activation/ActivationControlCard.jsx](../src/components/operation/online-orders/activation/ActivationControlCard.jsx) (`ActivationControlCard`); [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js) (`getOnlineOrderDeliveryConcepts`, `getOnlineOrderFulfillments`, `getOnlineOrderScheduledPoints`, `getOnlineOrderSetting`, `getOnlineOrderTimeBlocks`); [src/services/operation/online-orders/onlineOrderPayments.service.js](../src/services/operation/online-orders/onlineOrderPayments.service.js) (`getOnlineOrderPaymentSettings`); [src/services/operation/online-orders/onlineOrderActivation.service.js](../src/services/operation/online-orders/onlineOrderActivation.service.js) (`getOnlineOrderBranchSalesChannels`, `getOnlineOrderPlanAccess`, `getOnlineOrderQrCodes`, `updateOnlineOrderActivation`).

Consumidores directos: [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx).

Estados locales (`useState`): `loading`, `saving`, `setting`, `planAccess`, `onlineChannel`, `fulfillmentState`, `payments`, `qrState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `branch`, `branchName`, `onGoToTab`, `onAlert`.

### components/operation/online-orders/delivery/DeliveryConceptsCard.jsx

Fuente: [src/components/operation/online-orders/delivery/DeliveryConceptsCard.jsx](../src/components/operation/online-orders/delivery/DeliveryConceptsCard.jsx). 761 líneas.

Exportaciones: `default: DeliveryConceptsCard`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js) (`createOnlineOrderDeliveryConcept`, `deleteOnlineOrderDeliveryConcept`, `getOnlineOrderDeliveryConcepts`, `updateOnlineOrderDeliveryConcept`).

Consumidores directos: [src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx](../src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx).

Estados locales (`useState`): `homeConcepts`, `internalConcepts`, `loading`, `homePage`, `internalPage`, `modal`, `form`, `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `homeDelivery`, `internalLocation`, `onAlert`, `title`, `description`, `fulfillment`, `concepts`, `page`, `setPage`, `loading`, `onCreate`, `onEdit`, `onDelete`, `open`, `mode`, `concept`, `onClose`, `onSaved`, `label`, `input`.

### components/operation/online-orders/delivery/DeliveryMethodsCard.jsx

Fuente: [src/components/operation/online-orders/delivery/DeliveryMethodsCard.jsx](../src/components/operation/online-orders/delivery/DeliveryMethodsCard.jsx). 317 líneas.

Exportaciones: `default: DeliveryMethodsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx](../src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`, `saving`, `hasChanges`, `onChange`, `onSave`, `onDiscard`, `type`, `row`, `label`, `input`, `help`.

### components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx

Fuente: [src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx](../src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx). 504 líneas.

Exportaciones: `default: OnlineOrderDeliveryTab`.

Dependencias internas: [src/components/operation/online-orders/delivery/DeliveryMethodsCard.jsx](../src/components/operation/online-orders/delivery/DeliveryMethodsCard.jsx) (`DeliveryMethodsCard`); [src/components/operation/online-orders/delivery/DeliveryConceptsCard.jsx](../src/components/operation/online-orders/delivery/DeliveryConceptsCard.jsx) (`DeliveryConceptsCard`); [src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx](../src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx) (`ScheduledPointsCard`); [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js) (`getOnlineOrderFulfillments`, `saveOnlineOrderFulfillment`).

Consumidores directos: [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx).

Estados locales (`useState`): `loading`, `saving`, `savedItems`, `items`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `branchName`, `onAlert`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/online-orders/delivery/ScheduledPointDaySchedule.jsx

Fuente: [src/components/operation/online-orders/delivery/ScheduledPointDaySchedule.jsx](../src/components/operation/online-orders/delivery/ScheduledPointDaySchedule.jsx). 256 líneas.

Exportaciones: `getScheduleBlockKey`, `default: ScheduledPointDaySchedule`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx](../src/components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `day`, `blocks`, `page`, `disabled`, `defaultCapacity`, `validationErrors`, `onPageChange`, `onAdd`, `onChange`, `onRemove`, `label`, `input`.

### components/operation/online-orders/delivery/ScheduledPointsCard.jsx

Fuente: [src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx](../src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx). 737 líneas.

Exportaciones: `default: ScheduledPointsCard`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx](../src/components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx) (`ScheduledPointTimeBlocksDialog`); [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js) (`createOnlineOrderScheduledPoint`, `deleteOnlineOrderScheduledPoint`, `getOnlineOrderScheduledPoints`, `updateOnlineOrderScheduledPoint`).

Consumidores directos: [src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx](../src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx).

Estados locales (`useState`): `points`, `page`, `modal`, `timePoint`, `form`, `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `fulfillment`, `onAlert`, `open`, `mode`, `point`, `onClose`, `onSaved`, `label`, `input`.

### components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx

Fuente: [src/components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx](../src/components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx). 631 líneas.

Exportaciones: `default: ScheduledPointTimeBlocksDialog`.

Dependencias internas: [src/components/operation/online-orders/delivery/ScheduledPointDaySchedule.jsx](../src/components/operation/online-orders/delivery/ScheduledPointDaySchedule.jsx) (`ScheduledPointDaySchedule`, `getScheduleBlockKey`); [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js) (`createOnlineOrderTimeBlock`, `deleteOnlineOrderTimeBlock`, `getOnlineOrderTimeBlocks`, `updateOnlineOrderTimeBlock`).

Consumidores directos: [src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx](../src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx).

Estados locales (`useState`): `loading`, `saving`, `dirty`, `originalBlocks`, `blocks`, `pages`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `point`, `restaurantId`, `branchId`, `fulfillment`, `onClose`, `onAlert`.

### components/operation/online-orders/general/OnlineOrderGeneralTab.jsx

Fuente: [src/components/operation/online-orders/general/OnlineOrderGeneralTab.jsx](../src/components/operation/online-orders/general/OnlineOrderGeneralTab.jsx). 654 líneas.

Exportaciones: `default: OnlineOrderGeneralTab`.

Dependencias internas: [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js) (`getOnlineOrderSetting`, `updateOnlineOrderSetting`).

Consumidores directos: [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `branchName`, `setting`, `setSetting`, `loading`, `setLoading`, `onAlert`, `field`, `fieldState`, `icon`, `title`, `value`, `chipLabel`, `chipColor`, `label`, `input`, `help`.

### components/operation/online-orders/OnlineOrderBranchSelector.jsx

Fuente: [src/components/operation/online-orders/OnlineOrderBranchSelector.jsx](../src/components/operation/online-orders/OnlineOrderBranchSelector.jsx). 62 líneas.

Exportaciones: `default: OnlineOrderBranchSelector`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `value`, `onChange`, `disabled`.

### components/operation/online-orders/OnlineOrdersHeader.jsx

Fuente: [src/components/operation/online-orders/OnlineOrdersHeader.jsx](../src/components/operation/online-orders/OnlineOrdersHeader.jsx). 41 líneas.

Exportaciones: `default: OnlineOrdersHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branchName`.

### components/operation/online-orders/OnlineOrderTabs.jsx

Fuente: [src/components/operation/online-orders/OnlineOrderTabs.jsx](../src/components/operation/online-orders/OnlineOrderTabs.jsx). 81 líneas.

Exportaciones: `default: OnlineOrderTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx

Fuente: [src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx](../src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx). 529 líneas.

Exportaciones: `default: OnlineOrderPaymentsTab`.

Dependencias internas: [src/components/operation/online-orders/payments/PaymentMethodsCard.jsx](../src/components/operation/online-orders/payments/PaymentMethodsCard.jsx) (`PaymentMethodsCard`); [src/components/operation/online-orders/payments/TransferSettingsCard.jsx](../src/components/operation/online-orders/payments/TransferSettingsCard.jsx) (`TransferSettingsCard`); [src/services/operation/online-orders/onlineOrderPayments.service.js](../src/services/operation/online-orders/onlineOrderPayments.service.js) (`getOnlineOrderPaymentSettings`, `getOnlineOrderTransferSetting`, `saveOnlineOrderPaymentSetting`, `updateOnlineOrderTransferSetting`).

Consumidores directos: [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx).

Estados locales (`useState`): `loading`, `savingPayments`, `savingTransfer`, `savedPayments`, `payments`, `savedTransfer`, `transfer`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `branchId`, `branchName`, `onAlert`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/online-orders/payments/PaymentMethodsCard.jsx

Fuente: [src/components/operation/online-orders/payments/PaymentMethodsCard.jsx](../src/components/operation/online-orders/payments/PaymentMethodsCard.jsx). 193 líneas.

Exportaciones: `default: PaymentMethodsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx](../src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `payments`, `saving`, `hasChanges`, `onChange`, `onSave`, `onDiscard`, `method`, `row`.

### components/operation/online-orders/payments/TransferSettingsCard.jsx

Fuente: [src/components/operation/online-orders/payments/TransferSettingsCard.jsx](../src/components/operation/online-orders/payments/TransferSettingsCard.jsx). 194 líneas.

Exportaciones: `default: TransferSettingsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx](../src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `saving`, `hasChanges`, `onChange`, `onSave`, `onDiscard`, `label`, `input`, `help`.

### components/operation/prepared-items/PreparedItemBranchSelectorCard.jsx

Fuente: [src/components/operation/prepared-items/PreparedItemBranchSelectorCard.jsx](../src/components/operation/prepared-items/PreparedItemBranchSelectorCard.jsx). 73 líneas.

Exportaciones: `default: PreparedItemBranchSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`, `disabled`.

### components/operation/prepared-items/PreparedItemContextCard.jsx

Fuente: [src/components/operation/prepared-items/PreparedItemContextCard.jsx](../src/components/operation/prepared-items/PreparedItemContextCard.jsx). 161 líneas.

Exportaciones: `default: PreparedItemContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `contextData`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/prepared-items/PreparedItemFiltersCard.jsx

Fuente: [src/components/operation/prepared-items/PreparedItemFiltersCard.jsx](../src/components/operation/prepared-items/PreparedItemFiltersCard.jsx). 183 líneas.

Exportaciones: `default: PreparedItemFiltersCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `search`, `onChangeSearch`, `reusableFilter`, `onChangeReusableFilter`, `sections`, `sectionId`, `onChangeSection`, `categories`, `categoryId`, `onChangeCategory`, `onlyActiveProducts`, `onChangeOnlyActiveProducts`, `filteredCount`, `totalCount`.

### components/operation/prepared-items/PreparedItemGeneralSettingCard.jsx

Fuente: [src/components/operation/prepared-items/PreparedItemGeneralSettingCard.jsx](../src/components/operation/prepared-items/PreparedItemGeneralSettingCard.jsx). 137 líneas.

Exportaciones: `default: PreparedItemGeneralSettingCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branchId`, `minutes`, `onChangeMinutes`, `onSave`, `saving`, `loading`, `source`.

### components/operation/prepared-items/PreparedItemInstructionsCard.jsx

Fuente: [src/components/operation/prepared-items/PreparedItemInstructionsCard.jsx](../src/components/operation/prepared-items/PreparedItemInstructionsCard.jsx). 80 líneas.

Exportaciones: `default: PreparedItemInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/operation/prepared-items/PreparedItemPolicyDialog.jsx

Fuente: [src/components/operation/prepared-items/PreparedItemPolicyDialog.jsx](../src/components/operation/prepared-items/PreparedItemPolicyDialog.jsx). 605 líneas.

Exportaciones: `default: PreparedItemPolicyDialog`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

Estados locales (`useState`): `isReusable`, `timeMode`, `customMinutes`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `row`, `defaultMinutes`, `saving`, `deleting`, `onClose`, `onSave`, `onDelete`, `severity`, `title`, `message`, `value`, `checked`, `disabled`, `description`, `label`, `input`, `help`.

### components/operation/prepared-items/PreparedItemProductsPanel.jsx

Fuente: [src/components/operation/prepared-items/PreparedItemProductsPanel.jsx](../src/components/operation/prepared-items/PreparedItemProductsPanel.jsx). 507 líneas.

Exportaciones: `default: PreparedItemProductsPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `total`, `page`, `totalPages`, `startItem`, `endItem`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onToggle`, `onConfigure`, `isSaving`, `selectedBranchId`, `defaultMinutes`, `loading`, `title`, `text`, `label`, `value`.

### components/operation/prepared-items/PreparedItemSettingsHeader.jsx

Fuente: [src/components/operation/prepared-items/PreparedItemSettingsHeader.jsx](../src/components/operation/prepared-items/PreparedItemSettingsHeader.jsx). 33 líneas.

Exportaciones: `default: PreparedItemSettingsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`.

### components/operation/ticket/TicketBranchSelectorCard.jsx

Fuente: [src/components/operation/ticket/TicketBranchSelectorCard.jsx](../src/components/operation/ticket/TicketBranchSelectorCard.jsx). 66 líneas.

Exportaciones: `default: TicketBranchSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`.

### components/operation/ticket/TicketPrintSettingsCard.jsx

Fuente: [src/components/operation/ticket/TicketPrintSettingsCard.jsx](../src/components/operation/ticket/TicketPrintSettingsCard.jsx). 470 líneas.

Exportaciones: `default: TicketPrintSettingsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `options`, `onChange`, `onSave`, `onReset`, `saving`, `disabled`, `icon`, `title`, `subtitle`, `status`, `buttonText`, `href`, `label`, `input`, `help`.

### components/operation/ticket/TicketSettingsContextCard.jsx

Fuente: [src/components/operation/ticket/TicketSettingsContextCard.jsx](../src/components/operation/ticket/TicketSettingsContextCard.jsx). 168 líneas.

Exportaciones: `default: TicketSettingsContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `ticketData`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/operation/ticket/TicketSettingsFormCard.jsx

Fuente: [src/components/operation/ticket/TicketSettingsFormCard.jsx](../src/components/operation/ticket/TicketSettingsFormCard.jsx). 332 líneas.

Exportaciones: `default: TicketSettingsFormCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `invoiceQrContext`, `onChange`, `disabled`, `title`, `label`, `input`, `help`, `description`, `checked`.

### components/operation/ticket/TicketSettingsHeader.jsx

Fuente: [src/components/operation/ticket/TicketSettingsHeader.jsx](../src/components/operation/ticket/TicketSettingsHeader.jsx). 63 líneas.

Exportaciones: `default: TicketSettingsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `saving`, `onSave`, `canSave`, `activeTab`.

### components/operation/ticket/TicketSettingsInstructionsCard.jsx

Fuente: [src/components/operation/ticket/TicketSettingsInstructionsCard.jsx](../src/components/operation/ticket/TicketSettingsInstructionsCard.jsx). 86 líneas.

Exportaciones: `default: TicketSettingsInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/operation/ticket/TicketSettingsTabs.jsx

Fuente: [src/components/operation/ticket/TicketSettingsTabs.jsx](../src/components/operation/ticket/TicketSettingsTabs.jsx). 70 líneas.

Exportaciones: `default: TicketSettingsTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/operation/ticket/TicketWhatsappMessageSettingsCard.jsx

Fuente: [src/components/operation/ticket/TicketWhatsappMessageSettingsCard.jsx](../src/components/operation/ticket/TicketWhatsappMessageSettingsCard.jsx). 186 líneas.

Exportaciones: `default: TicketWhatsappMessageSettingsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `onChange`, `disabled`, `label`, `input`, `help`.

### components/owner/addon-history/AddonCatalogPanel.jsx

Fuente: [src/components/owner/addon-history/AddonCatalogPanel.jsx](../src/components/owner/addon-history/AddonCatalogPanel.jsx). 491 líneas.

Exportaciones: `default: AddonCatalogPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx).

Estados locales (`useState`): `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `mode`, `catalog`, `currentAddons`, `branches`, `selectedBranchId`, `item`, `title`, `message`, `label`, `value`, `strong`.

### components/owner/addon-history/AddonHistoryFilters.jsx

Fuente: [src/components/owner/addon-history/AddonHistoryFilters.jsx](../src/components/owner/addon-history/AddonHistoryFilters.jsx). 178 líneas.

Exportaciones: `default: AddonHistoryFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `filters`, `branches`, `total`, `onChange`, `label`, `children`, `width`.

### components/owner/addon-history/AddonHistoryHeader.jsx

Fuente: [src/components/owner/addon-history/AddonHistoryHeader.jsx](../src/components/owner/addon-history/AddonHistoryHeader.jsx). 79 líneas.

Exportaciones: `default: AddonHistoryHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurant`, `restaurantId`, `onBack`.

### components/owner/addon-history/AddonHistoryList.jsx

Fuente: [src/components/owner/addon-history/AddonHistoryList.jsx](../src/components/owner/addon-history/AddonHistoryList.jsx). 344 líneas.

Exportaciones: `default: AddonHistoryList`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `pagination`, `onPrev`, `onNext`, `label`, `value`, `strong`.

### components/owner/addon-history/AddonHistoryShortcut.jsx

Fuente: [src/components/owner/addon-history/AddonHistoryShortcut.jsx](../src/components/owner/addon-history/AddonHistoryShortcut.jsx). 85 líneas.

Exportaciones: `default: AddonHistoryShortcut`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `disabled`, `onOpen`.

### components/owner/addon-history/AddonHistorySummary.jsx

Fuente: [src/components/owner/addon-history/AddonHistorySummary.jsx](../src/components/owner/addon-history/AddonHistorySummary.jsx). 143 líneas.

Exportaciones: `default: AddonHistorySummary`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`.

### components/owner/addon-history/AddonTabs.jsx

Fuente: [src/components/owner/addon-history/AddonTabs.jsx](../src/components/owner/addon-history/AddonTabs.jsx). 73 líneas.

Exportaciones: `default: AddonTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`.

### components/owner/billing/OwnerBillingFilters.jsx

Fuente: [src/components/owner/billing/OwnerBillingFilters.jsx](../src/components/owner/billing/OwnerBillingFilters.jsx). 209 líneas.

Exportaciones: `default: OwnerBillingFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/owner/billing/OwnerBillingPurchasesTab.jsx](../src/components/owner/billing/OwnerBillingPurchasesTab.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `filters`, `restaurants`, `onChange`, `disabled`, `label`, `input`.

### components/owner/billing/OwnerBillingInvoicesTab.jsx

Fuente: [src/components/owner/billing/OwnerBillingInvoicesTab.jsx](../src/components/owner/billing/OwnerBillingInvoicesTab.jsx). 696 líneas.

Exportaciones: `default: OwnerBillingInvoicesTab`.

Dependencias internas: [src/services/owner/platformBilling.service.js](../src/services/owner/platformBilling.service.js) (`downloadPlatformInvoicePdf`, `downloadPlatformInvoiceXml`, `getPlatformInvoices`, `retryPlatformInvoice`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/owner/billing/OwnerInvoiceDetailModal.jsx](../src/components/owner/billing/OwnerInvoiceDetailModal.jsx) (`OwnerInvoiceDetailModal`).

Consumidores directos: [src/pages/owner/billing/OwnerBillingPage.jsx](../src/pages/owner/billing/OwnerBillingPage.jsx).

Estados locales (`useState`): `rows`, `page`, `meta`, `loading`, `refreshing`, `detailInvoiceId`, `retryingMap`, `downloadingMap`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `onAlert`, `refreshKey`, `invoice`, `retrying`, `downloadingMap`, `onView`, `onRetry`, `onDownload`, `label`, `value`, `strong`, `status`.

### components/owner/billing/OwnerBillingPurchasesTab.jsx

Fuente: [src/components/owner/billing/OwnerBillingPurchasesTab.jsx](../src/components/owner/billing/OwnerBillingPurchasesTab.jsx). 591 líneas.

Exportaciones: `default: OwnerBillingPurchasesTab`.

Dependencias internas: [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`getMyRestaurants`); [src/services/owner/platformBilling.service.js](../src/services/owner/platformBilling.service.js) (`getPlatformPurchases`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/owner/billing/OwnerBillingFilters.jsx](../src/components/owner/billing/OwnerBillingFilters.jsx) (`OwnerBillingFilters`); [src/components/owner/billing/OwnerPurchaseInvoiceModal.jsx](../src/components/owner/billing/OwnerPurchaseInvoiceModal.jsx) (`OwnerPurchaseInvoiceModal`).

Consumidores directos: [src/pages/owner/billing/OwnerBillingPage.jsx](../src/pages/owner/billing/OwnerBillingPage.jsx).

Estados locales (`useState`): `filters`, `restaurants`, `purchases`, `loading`, `refreshing`, `selectedPurchase`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `onAlert`, `onChanged`, `onEditTaxProfile`, `purchase`, `onInvoice`, `label`, `value`, `status`, `canInvoice`.

### components/owner/billing/OwnerInvoiceDetailModal.jsx

Fuente: [src/components/owner/billing/OwnerInvoiceDetailModal.jsx](../src/components/owner/billing/OwnerInvoiceDetailModal.jsx). 426 líneas.

Exportaciones: `default: OwnerInvoiceDetailModal`.

Dependencias internas: [src/services/owner/platformBilling.service.js](../src/services/owner/platformBilling.service.js) (`getPlatformInvoice`).

Consumidores directos: [src/components/owner/billing/OwnerBillingInvoicesTab.jsx](../src/components/owner/billing/OwnerBillingInvoicesTab.jsx).

Estados locales (`useState`): `loading`, `invoice`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `invoiceId`, `onClose`, `onAlert`, `status`, `label`, `value`, `strong`.

### components/owner/billing/OwnerPurchaseInvoiceModal.jsx

Fuente: [src/components/owner/billing/OwnerPurchaseInvoiceModal.jsx](../src/components/owner/billing/OwnerPurchaseInvoiceModal.jsx). 405 líneas.

Exportaciones: `default: OwnerPurchaseInvoiceModal`.

Dependencias internas: [src/services/owner/taxProfile.service.js](../src/services/owner/taxProfile.service.js) (`getTaxProfile`); [src/services/owner/platformBilling.service.js](../src/services/owner/platformBilling.service.js) (`createPlatformInvoice`).

Consumidores directos: [src/components/owner/billing/OwnerBillingPurchasesTab.jsx](../src/components/owner/billing/OwnerBillingPurchasesTab.jsx).

Estados locales (`useState`): `taxProfile`, `billingEmail`, `usoCfdi`, `loadingProfile`, `busy`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `purchase`, `onClose`, `onCompleted`, `onAlert`, `onEditTaxProfile`, `label`, `value`, `strong`.

### components/owner/PlanCard.jsx

Fuente: [src/components/owner/PlanCard.jsx](../src/components/owner/PlanCard.jsx). 430 líneas.

Exportaciones: `default: PlanCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `plan`, `isCurrent`, `isDisabled`, `busy`, `billingPeriod`, `actionLabel`, `onSubscribe`, `text`, `variant`.

### components/owner/PlansCarouselControls.jsx

Fuente: [src/components/owner/PlansCarouselControls.jsx](../src/components/owner/PlansCarouselControls.jsx). 85 líneas.

Exportaciones: `default: PlansCarouselControls`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `currentGroup`, `totalGroups`, `hasPrev`, `hasNext`, `onPrev`, `onNext`.

### components/owner/PlansHeader.jsx

Fuente: [src/components/owner/PlansHeader.jsx](../src/components/owner/PlansHeader.jsx). 58 líneas.

Exportaciones: `default: PlansHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `totalPlans`, `onBack`.

### components/owner/PlansNoticeCard.jsx

Fuente: [src/components/owner/PlansNoticeCard.jsx](../src/components/owner/PlansNoticeCard.jsx). 81 líneas.

Exportaciones: `default: PlansNoticeCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `message`, `variant`, `noticeCode`, `noticeMeta`.

### components/owner/PlansStateCard.jsx

Fuente: [src/components/owner/PlansStateCard.jsx](../src/components/owner/PlansStateCard.jsx). 290 líneas.

Exportaciones: `default: PlansStateCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `isOperational`, `accessType`, `statusCode`, `statusMessage`, `currentPlanSlug`, `currentEndsAt`, `currentAccess`, `currentPaidSubscription`, `nextSubscription`, `hasNextSubscription`, `canChangeNow`, `isDemo`, `isPaid`, `isInternal`, `daysRemaining`, `title`, `value`, `chipLabel`, `chipColor`.

### components/owner/profile/OwnerProfileModal.jsx

Fuente: [src/components/owner/profile/OwnerProfileModal.jsx](../src/components/owner/profile/OwnerProfileModal.jsx). 376 líneas.

Exportaciones: `default: OwnerProfileModal`.

Dependencias internas: [src/services/owner/ownerProfile.service.js](../src/services/owner/ownerProfile.service.js) (`updateOwnerProfile`); [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`useAuth`).

Consumidores directos: [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx).

Estados locales (`useState`): `busy`, `serverMsg`, `form`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onSaved`, `label`, `input`, `help`.

### components/owner/subscription-history/SubscriptionHistoryFilters.jsx

Fuente: [src/components/owner/subscription-history/SubscriptionHistoryFilters.jsx](../src/components/owner/subscription-history/SubscriptionHistoryFilters.jsx). 206 líneas.

Exportaciones: `default: SubscriptionHistoryFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `children`, `filters`, `activeOnly`, `onChange`, `onActiveOnlyChange`.

### components/owner/subscription-history/SubscriptionHistoryHeader.jsx

Fuente: [src/components/owner/subscription-history/SubscriptionHistoryHeader.jsx](../src/components/owner/subscription-history/SubscriptionHistoryHeader.jsx). 59 líneas.

Exportaciones: `default: SubscriptionHistoryHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurant`, `restaurantId`, `onBack`.

### components/owner/subscription-history/SubscriptionHistoryList.jsx

Fuente: [src/components/owner/subscription-history/SubscriptionHistoryList.jsx](../src/components/owner/subscription-history/SubscriptionHistoryList.jsx). 497 líneas.

Exportaciones: `default: SubscriptionHistoryList`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx).

Estados locales (`useState`): `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `value`, `subscriptions`.

### components/owner/subscription-history/SubscriptionHistoryShortcut.jsx

Fuente: [src/components/owner/subscription-history/SubscriptionHistoryShortcut.jsx](../src/components/owner/subscription-history/SubscriptionHistoryShortcut.jsx). 77 líneas.

Exportaciones: `default: SubscriptionHistoryShortcut`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `onOpen`, `disabled`.

### components/owner/subscription-history/SubscriptionHistorySummary.jsx

Fuente: [src/components/owner/subscription-history/SubscriptionHistorySummary.jsx](../src/components/owner/subscription-history/SubscriptionHistorySummary.jsx). 160 líneas.

Exportaciones: `default: SubscriptionHistorySummary`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`.

### components/owner/tax/OwnerTaxProfileModal.jsx

Fuente: [src/components/owner/tax/OwnerTaxProfileModal.jsx](../src/components/owner/tax/OwnerTaxProfileModal.jsx). 519 líneas.

Exportaciones: `default: OwnerTaxProfileModal`.

Dependencias internas: [src/services/owner/taxProfile.service.js](../src/services/owner/taxProfile.service.js) (`getTaxProfile`, `updateTaxProfile`).

Consumidores directos: [src/pages/owner/billing/OwnerBillingPage.jsx](../src/pages/owner/billing/OwnerBillingPage.jsx), [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx).

Estados locales (`useState`): `form`, `billingEmail`, `loading`, `loaded`, `busy`, `attemptedSave`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onSaved`, `onError`, `label`, `input`, `help`.

### components/paypal/PayPalCheckoutDialog.jsx

Fuente: [src/components/paypal/PayPalCheckoutDialog.jsx](../src/components/paypal/PayPalCheckoutDialog.jsx). 223 líneas.

Exportaciones: `default: PayPalCheckoutDialog`.

Dependencias internas: [src/services/paypal/paypal.service.js](../src/services/paypal/paypal.service.js) (`createPayPalCheckout`, `capturePayPalOrder`).

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `planId`, `months`, `paypalClientId`, `onSuccess`, `onError`.

### components/products/CandidatePicker.jsx

Fuente: [src/components/products/CandidatePicker.jsx](../src/components/products/CandidatePicker.jsx). 290 líneas.

Exportaciones: `default: CandidatePicker`.

Dependencias internas: [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/services/products/catalog/productComponents.service.js](../src/services/products/catalog/productComponents.service.js) (`getComponentCandidates`).

Consumidores directos: [src/components/products/CompositionWizard.jsx](../src/components/products/CompositionWizard.jsx).

Estados locales (`useState`): `q`, `loading`, `err`, `data`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productsMode`, `branchId`, `excludeIds`, `onPick`.

### components/products/CompositionWizard.jsx

Fuente: [src/components/products/CompositionWizard.jsx](../src/components/products/CompositionWizard.jsx). 650 líneas.

Exportaciones: `default: CompositionWizard`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/products/CandidatePicker.jsx](../src/components/products/CandidatePicker.jsx) (`CandidatePicker`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx).

Estados locales (`useState`): `rows`, `localErr`, `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `productId`, `productsMode`, `branchId`, `initialItems`, `onSave`, `label`, `input`, `checked`, `onChange`, `disabled`.

### components/products/ProductCategoryTabs.jsx

Fuente: [src/components/products/ProductCategoryTabs.jsx](../src/components/products/ProductCategoryTabs.jsx). 104 líneas.

Exportaciones: `default: ProductCategoryTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/products/productsPage/ProductsPageFilters.jsx](../src/components/products/productsPage/ProductsPageFilters.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `categories`, `value`, `onChange`.

### components/products/ProductFormModal.jsx

Fuente: [src/components/products/ProductFormModal.jsx](../src/components/products/ProductFormModal.jsx). 1501 líneas.

Exportaciones: `default: ProductFormModal`.

Dependencias internas: [src/services/products/catalog/productType.service.js](../src/services/products/catalog/productType.service.js) (`changeProductType`); [src/services/products/catalog/productInventoryType.service.js](../src/services/products/catalog/productInventoryType.service.js) (`changeInventoryType`); [src/components/products/ProductFormTabs.jsx](../src/components/products/ProductFormTabs.jsx) (`ProductFormTabs`); [src/components/products/ProductTypeModeCards.jsx](../src/components/products/ProductTypeModeCards.jsx) (`ProductTypeModeCards`).

Consumidores directos: [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx).

Estados locales (`useState`): `saving`, `modeSaving`, `activeTab`, `err`, `form`, `images`, `imagesLoading`, `satLoading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `productsMode`, `requiresBranch`, `effectiveBranchId`, `categories`, `initialData`, `allowedProducts`, `getProduct`, `createProduct`, `updateProduct`, `getProductSatMapping`, `updateProductSatMapping`, `getProductImages`, `uploadProductImage`, `deleteProductImage`, `reorderProductImages`, `onSaved`, `product_type`, `inventory_type`, `label`, `input`, `help`.

### components/products/ProductFormTabs.jsx

Fuente: [src/components/products/ProductFormTabs.jsx](../src/components/products/ProductFormTabs.jsx). 77 líneas.

Exportaciones: `default: ProductFormTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/products/ProductFormModal.jsx](../src/components/products/ProductFormModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/products/productsPage/ProductSectionTabs.jsx

Fuente: [src/components/products/productsPage/ProductSectionTabs.jsx](../src/components/products/productsPage/ProductSectionTabs.jsx). 106 líneas.

Exportaciones: `default: ProductSectionTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/products/productsPage/ProductsPageFilters.jsx](../src/components/products/productsPage/ProductsPageFilters.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sections`, `value`, `onChange`.

### components/products/productsPage/ProductsPageFilters.jsx

Fuente: [src/components/products/productsPage/ProductsPageFilters.jsx](../src/components/products/productsPage/ProductsPageFilters.jsx). 224 líneas.

Exportaciones: `default: ProductsPageFilters`.

Dependencias internas: [src/components/products/ProductCategoryTabs.jsx](../src/components/products/ProductCategoryTabs.jsx) (`ProductCategoryTabs`); [src/components/products/productsPage/ProductSectionTabs.jsx](../src/components/products/productsPage/ProductSectionTabs.jsx) (`ProductSectionTabs`).

Consumidores directos: [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `requiresBranch`, `branches`, `branchId`, `onBranchChange`, `err`, `sections`, `sectionId`, `onSectionChange`, `categories`, `categoryId`, `onCategoryChange`, `statusFilter`, `onStatusFilterChange`, `productsCount`.

### components/products/productsPage/ProductsPageHeader.jsx

Fuente: [src/components/products/productsPage/ProductsPageHeader.jsx](../src/components/products/productsPage/ProductsPageHeader.jsx). 181 líneas.

Exportaciones: `default: ProductsPageHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productsMode`, `pageBusy`, `allowedProducts`, `icon`, `text`.

### components/products/productsPage/ProductsPageList.jsx

Fuente: [src/components/products/productsPage/ProductsPageList.jsx](../src/components/products/productsPage/ProductsPageList.jsx). 601 líneas.

Exportaciones: `default: ProductsPageList`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `products`, `productsLoading`, `productsMode`, `allowedProducts`, `pagination`, `onCreate`, `onEdit`, `onDelete`, `onToggleStatus`, `onComponents`, `onVariants`, `onRecipes`, `label`, `value`.

### components/products/ProductTypeModeCards.jsx

Fuente: [src/components/products/ProductTypeModeCards.jsx](../src/components/products/ProductTypeModeCards.jsx). 269 líneas.

Exportaciones: `default: ProductTypeModeCards`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/products/ProductFormModal.jsx](../src/components/products/ProductFormModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `allowedProducts`, `productType`, `inventoryType`, `disabled`, `onChange`.

### components/products/recipes/ProductRecipeEditorModal.jsx

Fuente: [src/components/products/recipes/ProductRecipeEditorModal.jsx](../src/components/products/recipes/ProductRecipeEditorModal.jsx). 643 líneas.

Exportaciones: `default: ProductRecipeEditorModal`.

Dependencias internas: [src/services/inventory/recipes/productRecipes.service.js](../src/services/inventory/recipes/productRecipes.service.js) (`upsertProductRecipeBase`, `upsertProductRecipeVariant`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`).

Consumidores directos: [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx).

Estados locales (`useState`): `saving`, `err`, `items`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `productId`, `branchMode`, `effectiveBranchId`, `ingredients`, `initialItems`, `title`, `variantId`, `onSaved`, `label`, `input`.

### components/public/invoice/PublicInvoiceForm.jsx

Fuente: [src/components/public/invoice/PublicInvoiceForm.jsx](../src/components/public/invoice/PublicInvoiceForm.jsx). 651 líneas.

Exportaciones: `default: PublicInvoiceForm`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx).

Estados locales (`useState`): `form`, `localErrors`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `invoiceMode`, `effectiveInvoiceMode`, `modeLocked`, `isEqualParts`, `onSubmit`, `submitting`, `apiErrors`, `generalError`, `label`, `input`, `help`.

### components/public/invoice/PublicInvoiceStatusCard.jsx

Fuente: [src/components/public/invoice/PublicInvoiceStatusCard.jsx](../src/components/public/invoice/PublicInvoiceStatusCard.jsx). 202 líneas.

Exportaciones: `default: PublicInvoiceStatusCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `status`, `message`, `data`.

### components/public/invoice/PublicInvoiceSuccessCard.jsx

Fuente: [src/components/public/invoice/PublicInvoiceSuccessCard.jsx](../src/components/public/invoice/PublicInvoiceSuccessCard.jsx). 431 líneas.

Exportaciones: `default: PublicInvoiceSuccessCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx).

Estados locales (`useState`): `copied`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `data`, `icon`, `label`, `value`.

### components/public/invoice/PublicInvoiceSummaryCard.jsx

Fuente: [src/components/public/invoice/PublicInvoiceSummaryCard.jsx](../src/components/public/invoice/PublicInvoiceSummaryCard.jsx). 321 líneas.

Exportaciones: `default: PublicInvoiceSummaryCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `data`, `icon`, `label`, `value`, `secondary`.

### components/public/order-tracking/order-details/OrderDetailsTab.jsx

Fuente: [src/components/public/order-tracking/order-details/OrderDetailsTab.jsx](../src/components/public/order-tracking/order-details/OrderDetailsTab.jsx). 1063 líneas.

Exportaciones: `default: OrderDetailsTab`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx).

Estados locales (`useState`): `page`, `componentsExpanded`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `data`, `themeColor`, `onNotify`, `icon`, `label`, `value`, `extra`, `highlight`, `destination`, `item`, `orderCancelled`, `level`, `isLast`, `transfer`, `action`, `valueColor`.

### components/public/order-tracking/OrderTrackingHeader.jsx

Fuente: [src/components/public/order-tracking/OrderTrackingHeader.jsx](../src/components/public/order-tracking/OrderTrackingHeader.jsx). 199 líneas.

Exportaciones: `default: OrderTrackingHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `data`, `themeColor`, `icon`, `text`, `href`.

### components/public/order-tracking/tracking/TrackingTab.jsx

Fuente: [src/components/public/order-tracking/tracking/TrackingTab.jsx](../src/components/public/order-tracking/tracking/TrackingTab.jsx). 414 líneas.

Exportaciones: `default: TrackingTab`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `data`, `themeColor`.

### components/public/PublicOrderCartBox.jsx

Fuente: [src/components/public/PublicOrderCartBox.jsx](../src/components/public/PublicOrderCartBox.jsx). 271 líneas.

Exportaciones: `default: PublicOrderCartBox`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`money`, `safeNum`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `PillButton`).

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `tone`, `orderName`, `oldItems`, `newItems`, `total`, `busy`, `canVaciar`, `canEnviar`, `onVaciar`, `onEnviar`.

### components/public-menu/PublicMenuBranchSelectorCard.jsx

Fuente: [src/components/public-menu/PublicMenuBranchSelectorCard.jsx](../src/components/public-menu/PublicMenuBranchSelectorCard.jsx). 68 líneas.

Exportaciones: `default: PublicMenuBranchSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `branchId`, `onChangeBranch`, `selectedBranch`, `disabled`.

### components/public-menu/PublicMenuContextCard.jsx

Fuente: [src/components/public-menu/PublicMenuContextCard.jsx](../src/components/public-menu/PublicMenuContextCard.jsx). 147 líneas.

Exportaciones: `default: PublicMenuContextCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `setting`, `gallery`, `icon`, `title`, `value`, `chipLabel`, `chipColor`.

### components/public-menu/PublicMenuCoverCard.jsx

Fuente: [src/components/public-menu/PublicMenuCoverCard.jsx](../src/components/public-menu/PublicMenuCoverCard.jsx). 150 líneas.

Exportaciones: `default: PublicMenuCoverCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `setting`, `disabled`, `onUpload`, `onDelete`.

### components/public-menu/PublicMenuGalleryCard.jsx

Fuente: [src/components/public-menu/PublicMenuGalleryCard.jsx](../src/components/public-menu/PublicMenuGalleryCard.jsx). 314 líneas.

Exportaciones: `default: PublicMenuGalleryCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `gallery`, `disabled`, `onUpload`, `onUpdate`, `onDelete`, `image`.

### components/public-menu/PublicMenuInstructionsCard.jsx

Fuente: [src/components/public-menu/PublicMenuInstructionsCard.jsx](../src/components/public-menu/PublicMenuInstructionsCard.jsx). 80 líneas.

Exportaciones: `default: PublicMenuInstructionsCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `step`, `text`.

### components/public-menu/PublicMenuSettingsFormCard.jsx

Fuente: [src/components/public-menu/PublicMenuSettingsFormCard.jsx](../src/components/public-menu/PublicMenuSettingsFormCard.jsx). 255 líneas.

Exportaciones: `default: PublicMenuSettingsFormCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `form`, `onChange`, `disabled`, `title`, `label`, `input`, `help`, `description`, `checked`.

### components/public-menu/PublicMenuSettingsHeader.jsx

Fuente: [src/components/public-menu/PublicMenuSettingsHeader.jsx](../src/components/public-menu/PublicMenuSettingsHeader.jsx). 61 líneas.

Exportaciones: `default: PublicMenuSettingsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `selectedBranch`, `saving`, `onSave`, `canSave`.

### components/referrals/ReferralDiscountModal.jsx

Fuente: [src/components/referrals/ReferralDiscountModal.jsx](../src/components/referrals/ReferralDiscountModal.jsx). 138 líneas.

Exportaciones: `default: ReferralDiscountModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `code`, `percent`, `onClose`, `onGoPlans`, `hasRestaurant`.

### components/reports/profit/ProfitReportFilters.jsx

Fuente: [src/components/reports/profit/ProfitReportFilters.jsx](../src/components/reports/profit/ProfitReportFilters.jsx). 133 líneas.

Exportaciones: `default: ProfitReportFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `filters`, `loading`, `onChange`, `onSubmit`, `label`, `input`.

### components/reports/profit/ProfitReportHeader.jsx

Fuente: [src/components/reports/profit/ProfitReportHeader.jsx](../src/components/reports/profit/ProfitReportHeader.jsx). 36 líneas.

Exportaciones: `default: ProfitReportHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx).

### components/reports/profit/ProfitReportPreview.jsx

Fuente: [src/components/reports/profit/ProfitReportPreview.jsx](../src/components/reports/profit/ProfitReportPreview.jsx). 573 líneas.

Exportaciones: `default: ProfitReportPreview`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantName`, `summary`, `rows`, `pagination`, `branchName`, `filters`, `onPrev`, `onNext`, `label`, `value`, `title`.

### components/reports/profit/ProfitReportSummary.jsx

Fuente: [src/components/reports/profit/ProfitReportSummary.jsx](../src/components/reports/profit/ProfitReportSummary.jsx). 161 líneas.

Exportaciones: `default: ProfitReportSummary`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`.

### components/reports/sales/SalesReportFilters.jsx

Fuente: [src/components/reports/sales/SalesReportFilters.jsx](../src/components/reports/sales/SalesReportFilters.jsx). 133 líneas.

Exportaciones: `default: SalesReportFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `filters`, `loading`, `onChange`, `onSubmit`, `label`, `input`.

### components/reports/sales/SalesReportHeader.jsx

Fuente: [src/components/reports/sales/SalesReportHeader.jsx](../src/components/reports/sales/SalesReportHeader.jsx). 36 líneas.

Exportaciones: `default: SalesReportHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx).

### components/reports/sales/SalesReportPreview.jsx

Fuente: [src/components/reports/sales/SalesReportPreview.jsx](../src/components/reports/sales/SalesReportPreview.jsx). 516 líneas.

Exportaciones: `default: SalesReportPreview`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantName`, `summary`, `paymentBreakdown`, `rows`, `pagination`, `branchName`, `filters`, `onPrev`, `onNext`, `label`, `value`, `title`.

### components/reports/sales/SalesReportSummary.jsx

Fuente: [src/components/reports/sales/SalesReportSummary.jsx](../src/components/reports/sales/SalesReportSummary.jsx). 121 líneas.

Exportaciones: `default: SalesReportSummary`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`.

### components/restaurant/BranchUpsertModal.jsx

Fuente: [src/components/restaurant/BranchUpsertModal.jsx](../src/components/restaurant/BranchUpsertModal.jsx). 685 líneas.

Exportaciones: `default: BranchUpsertModal`.

Dependencias internas: [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`createBranch`, `deleteActiveBranchLogo`, `getBranch`, `getBranchLogo`, `updateBranch`, `uploadBranchLogo`); [src/utils/subscriptionGuards.js](../src/utils/subscriptionGuards.js) (`handleRestaurantApiError`).

Consumidores directos: [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx).

Estados locales (`useState`): `loading`, `saving`, `serverMsg`, `currentLogo`, `selectedLogoFile`, `selectedLogoPreview`, `logoRemoving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `editing`, `onSaved`, `nav`, `field`, `label`, `input`.

### components/restaurant/DemoContentCard.jsx

Fuente: [src/components/restaurant/DemoContentCard.jsx](../src/components/restaurant/DemoContentCard.jsx). 293 líneas.

Exportaciones: `default: DemoContentCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx).

Estados locales (`useState`): `modalOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branch`, `eliminando`, `onConfirmDelete`.

### components/restaurant/RestaurantFormModal.jsx

Fuente: [src/components/restaurant/RestaurantFormModal.jsx](../src/components/restaurant/RestaurantFormModal.jsx). 329 líneas.

Exportaciones: `default: RestaurantFormModal`.

Dependencias internas: [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`createRestaurant`, `updateRestaurant`).

Consumidores directos: [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx).

Estados locales (`useState`): `serverMsg`, `busy`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `mode`, `restaurant`, `onClose`, `onSaved`, `label`, `input`.

### components/sales_channels/ChannelProductConfigModal.jsx

Fuente: [src/components/sales_channels/ChannelProductConfigModal.jsx](../src/components/sales_channels/ChannelProductConfigModal.jsx). 225 líneas.

Exportaciones: `default: ChannelProductConfigModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx).

Estados locales (`useState`): `form`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onSave`, `saving`, `channelName`, `branchLabel`, `editing`, `initialForm`.

### components/sales_channels/SalesChannelsAlerts.jsx

Fuente: [src/components/sales_channels/SalesChannelsAlerts.jsx](../src/components/sales_channels/SalesChannelsAlerts.jsx). 64 líneas.

Exportaciones: `default: SalesChannelsAlerts`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `planAccessError`, `canUseAdditionalSalesChannels`, `err`.

### components/sales_channels/SalesChannelsHeader.jsx

Fuente: [src/components/sales_channels/SalesChannelsHeader.jsx](../src/components/sales_channels/SalesChannelsHeader.jsx). 85 líneas.

Exportaciones: `default: SalesChannelsHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `restaurantId`, `nav`, `saving`, `canUseAdditionalSalesChannels`, `planMessage`, `onCreate`.

### components/sales_channels/SalesChannelsList.jsx

Fuente: [src/components/sales_channels/SalesChannelsList.jsx](../src/components/sales_channels/SalesChannelsList.jsx). 472 líneas.

Exportaciones: `default: SalesChannelsList`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `items`, `paginatedItems`, `isMobile`, `saving`, `canUseAdditionalSalesChannels`, `planMessage`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `prevPage`, `nextPage`, `isSystemChannel`, `onCreate`, `onEdit`, `onDelete`, `onToggleStatus`.

### components/sales_channels/SalesChannelUpsertModal.jsx

Fuente: [src/components/sales_channels/SalesChannelUpsertModal.jsx](../src/components/sales_channels/SalesChannelUpsertModal.jsx). 306 líneas.

Exportaciones: `default: SalesChannelUpsertModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onSubmit`, `onChange`, `form`, `saving`, `editing`, `statusOptions`, `errorMessage`, `label`, `input`, `help`.

### components/seo/SEO.jsx

Fuente: [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx). 334 líneas.

Exportaciones: `default: SEO`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/landing/blog/BlogFilteredPostsPage.jsx](../src/pages/landing/blog/BlogFilteredPostsPage.jsx), [src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx), [src/pages/landing/blog/BlogPostsPage.jsx](../src/pages/landing/blog/BlogPostsPage.jsx), [src/pages/landing/contact/LandingContactPage.jsx](../src/pages/landing/contact/LandingContactPage.jsx), [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx), [src/pages/landing/plans/LandingPlansPage.jsx](../src/pages/landing/plans/LandingPlansPage.jsx), [src/pages/landing/resources/ComoElegirMenuQrPage.jsx](../src/pages/landing/resources/ComoElegirMenuQrPage.jsx), [src/pages/landing/resources/MenuQrCanvaPage.jsx](../src/pages/landing/resources/MenuQrCanvaPage.jsx), [src/pages/landing/terms/LandingTermsPage.jsx](../src/pages/landing/terms/LandingTermsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `element`, `parent`, `title`, `description`, `keywords`, `image`, `url`, `robots`, `ogType`, `ogTitle`, `ogDescription`, `structuredData`, `publishedTime`, `modifiedTime`, `section`, `tags`, `replaceDefaultSeo`.

### components/shared/AxiosAuthInterceptor.jsx

Fuente: [src/components/shared/AxiosAuthInterceptor.jsx](../src/components/shared/AxiosAuthInterceptor.jsx). 211 líneas.

Exportaciones: `default: AxiosAuthInterceptor`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`); [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`); [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`useAuth`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`).

Consumidores directos: [src/App.jsx](../src/App.jsx).

### components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx

Fuente: [src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx](../src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx). 239 líneas.

Exportaciones: `default: CashierOperationalAuthorizationDialog`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/staff/casher/shared/CashierDialogShell.jsx](../src/components/staff/casher/shared/CashierDialogShell.jsx) (`CashierDialogShell`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

Estados locales (`useState`): `authorizationUserId`, `authorizationPin`, `reason`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `title`, `description`, `authorizers`, `loadingAuthorizers`, `submitting`, `onClose`, `onSubmit`, `severity`, `message`, `label`, `input`, `help`.

### components/staff/casher/customer/CashierCustomerBalanceCard.jsx

Fuente: [src/components/staff/casher/customer/CashierCustomerBalanceCard.jsx](../src/components/staff/casher/customer/CashierCustomerBalanceCard.jsx). 152 líneas.

Exportaciones: `default: CashierCustomerBalanceCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `balanceData`, `label`, `value`, `icon`.

### components/staff/casher/customer/CashierCustomerLedgerCard.jsx

Fuente: [src/components/staff/casher/customer/CashierCustomerLedgerCard.jsx](../src/components/staff/casher/customer/CashierCustomerLedgerCard.jsx). 187 líneas.

Exportaciones: `default: CashierCustomerLedgerCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `text`.

### components/staff/casher/customer/CashierCustomerLookupCard.jsx

Fuente: [src/components/staff/casher/customer/CashierCustomerLookupCard.jsx](../src/components/staff/casher/customer/CashierCustomerLookupCard.jsx). 240 líneas.

Exportaciones: `default: CashierCustomerLookupCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `filters`, `onChange`, `onSearch`, `onClearSearch`, `searching`, `results`, `selectedCustomerId`, `onSelectCustomer`, `label`, `input`.

### components/staff/casher/customer/CashierCustomerSalesHistoryCard.jsx

Fuente: [src/components/staff/casher/customer/CashierCustomerSalesHistoryCard.jsx](../src/components/staff/casher/customer/CashierCustomerSalesHistoryCard.jsx). 210 líneas.

Exportaciones: `default: CashierCustomerSalesHistoryCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `text`.

### components/staff/casher/customer/CashierCustomersHeroCard.jsx

Fuente: [src/components/staff/casher/customer/CashierCustomersHeroCard.jsx](../src/components/staff/casher/customer/CashierCustomersHeroCard.jsx). 181 líneas.

Exportaciones: `default: CashierCustomersHeroCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `syncing`, `selectedCustomer`, `ledgerCount`, `salesCount`, `icon`, `label`, `value`, `helper`.

### components/staff/casher/directOrderPage/CashierDirectCreateOrderDialog.jsx

Fuente: [src/components/staff/casher/directOrderPage/CashierDirectCreateOrderDialog.jsx](../src/components/staff/casher/directOrderPage/CashierDirectCreateOrderDialog.jsx). 549 líneas.

Exportaciones: `default: CashierDirectCreateOrderDialog`.

Dependencias internas: [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`isMenuSetCartLine`).

Consumidores directos: [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx).

Estados locales (`useState`): `localName`, `localKitchenFlow`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onConfirm`, `customerName`, `onCustomerNameChange`, `kitchenFlow`, `onKitchenFlowChange`, `cart`, `total`, `pricingSummary`, `saving`, `canChooseKitchenFlow`.

### components/staff/casher/directOrderPage/CashierDirectHeaderCard.jsx

Fuente: [src/components/staff/casher/directOrderPage/CashierDirectHeaderCard.jsx](../src/components/staff/casher/directOrderPage/CashierDirectHeaderCard.jsx). 654 líneas.

Exportaciones: `default: CashierDirectHeaderCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `subtitle`, `menuData`, `cashSession`, `cartCount`, `availableMenus`, `defaultMenuId`, `selectedMenuId`, `selectedMenu`, `selectionLocked`, `menuLoading`, `onMenuChange`, `cartTotal`, `total`, `totalLabel`, `isEstimated`, `q`, `onSearchChange`, `totalVisible`, `onOpenCart`, `syncing`, `icon`, `label`, `value`, `helper`, `statusLabel`, `statusEstimated`.

### components/staff/casher/homePage/CashierSessionHeroCard.jsx

Fuente: [src/components/staff/casher/homePage/CashierSessionHeroCard.jsx](../src/components/staff/casher/homePage/CashierSessionHeroCard.jsx). 277 líneas.

Exportaciones: `default: CashierSessionHeroCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `currentSession`, `onCloseSession`, `onGoQueue`, `onExit`, `exitLabel`, `closing`, `showExitButton`, `label`, `value`.

### components/staff/casher/homePage/CashRegisterCard.jsx

Fuente: [src/components/staff/casher/homePage/CashRegisterCard.jsx](../src/components/staff/casher/homePage/CashRegisterCard.jsx). 227 líneas.

Exportaciones: `default: CashRegisterCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `register`, `onOpen`, `disabled`.

### components/staff/casher/homePage/OpenCashSessionModal.jsx

Fuente: [src/components/staff/casher/homePage/OpenCashSessionModal.jsx](../src/components/staff/casher/homePage/OpenCashSessionModal.jsx). 255 líneas.

Exportaciones: `default: OpenCashSessionModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx).

Estados locales (`useState`): `openingNotes`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `register`, `onConfirm`, `saving`.

### components/staff/casher/onlineOrders/CashierOnlineOrderActionDialog.jsx

Fuente: [src/components/staff/casher/onlineOrders/CashierOnlineOrderActionDialog.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderActionDialog.jsx). 202 líneas.

Exportaciones: `default: CashierOnlineOrderActionDialog`.

Dependencias internas: [src/components/staff/casher/shared/CashierDialogShell.jsx](../src/components/staff/casher/shared/CashierDialogShell.jsx) (`CashierDialogShell`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

Estados locales (`useState`): `reason`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `action`, `order`, `submitting`, `onClose`, `onConfirm`, `label`, `input`.

### components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx

Fuente: [src/components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx). 471 líneas.

Exportaciones: `default: CashierOnlineOrderCancellationDialog`.

Dependencias internas: [src/components/staff/casher/shared/CashierDialogShell.jsx](../src/components/staff/casher/shared/CashierDialogShell.jsx) (`CashierDialogShell`); [src/components/staff/casher/onlineOrders/onlineOrderDisplay.js](../src/components/staff/casher/onlineOrders/onlineOrderDisplay.js) (`ONLINE_ORDER_CANCELLATION_REASONS`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

Estados locales (`useState`): `reasonCode`, `reasonNote`, `authorizerUserId`, `pin`, `physicalDecisions`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `order`, `authorizers`, `loadingAuthorizers`, `submitting`, `onClose`, `onConfirm`, `item`, `value`, `disabled`, `onChange`, `number`, `title`, `description`, `children`, `label`, `input`, `help`.

### components/staff/casher/onlineOrders/CashierOnlineOrderCard.jsx

Fuente: [src/components/staff/casher/onlineOrders/CashierOnlineOrderCard.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderCard.jsx). 594 líneas.

Exportaciones: `default: CashierOnlineOrderCard`.

Dependencias internas: [src/components/staff/casher/onlineOrders/onlineOrderDisplay.js](../src/components/staff/casher/onlineOrders/onlineOrderDisplay.js) (`financialStatusColor`, `financialStatusLabel`, `formatCurrency`, `formatDateTime`, `fulfillmentLabel`, `onlineOrderStatusColor`, `onlineOrderStatusLabel`, `paymentTypeLabel`, `timingLabel`).

Consumidores directos: [src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx).

Estados locales (`useState`): `menuAnchorEl`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `order`, `disabled`, `busyAction`, `printing`, `onOpenDetail`, `onAction`, `onPrintDelivery`, `icon`, `label`, `value`, `strong`.

### components/staff/casher/onlineOrders/CashierOnlineOrderDetailView.jsx

Fuente: [src/components/staff/casher/onlineOrders/CashierOnlineOrderDetailView.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderDetailView.jsx). 1159 líneas.

Exportaciones: `default: CashierOnlineOrderDetailView`.

Dependencias internas: [src/components/staff/casher/onlineOrders/onlineOrderDisplay.js](../src/components/staff/casher/onlineOrders/onlineOrderDisplay.js) (`actorLabel`, `cancellationReasonLabel`, `financialStatusLabel`, `formatCurrency`, `formatDate`, `formatDateTime`, `fulfillmentLabel`, `kitchenFlowLabel`, `onlineOrderStatusLabel`, `ownershipLabel`, `paymentTypeLabel`, `timingLabel`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx).

Estados locales (`useState`): `expanded`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `order`, `onBack`, `title`, `children`, `label`, `value`, `strong`, `products`, `item`, `level`, `hideStageLabel`, `snapshot`, `deliveryInstructions`, `rows`.

### components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard.jsx

Fuente: [src/components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard.jsx). 177 líneas.

Exportaciones: `default: CashierOnlineOrdersHeroCard`.

Dependencias internas: [src/components/staff/casher/onlineOrders/onlineOrderDisplay.js](../src/components/staff/casher/onlineOrders/onlineOrderDisplay.js) (`formatCurrency`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `availableCount`, `myCount`, `myTotal`, `icon`, `label`, `value`, `helper`.

### components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx

Fuente: [src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx). 225 líneas.

Exportaciones: `default: CashierOnlineOrdersPanel`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/staff/casher/onlineOrders/CashierOnlineOrderCard.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderCard.jsx) (`CashierOnlineOrderCard`); [src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](../src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js) (`fetchCashierOnlineOrderDeliveryPrintConfig`, `fetchCashierOnlineOrderDeliveryPrintPayload`); [src/services/staff/casher/cashierTicket.service.js](../src/services/staff/casher/cashierTicket.service.js) (`sendCashierThermalPrintPayload`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

Estados locales (`useState`): `printingOrderId`, `printNotice`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `mode`, `orders`, `busyOrderId`, `busyAction`, `actionsDisabled`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onOpenDetail`, `onAction`.

### components/staff/casher/onlineOrders/CashierOnlineOrdersTabs.jsx

Fuente: [src/components/staff/casher/onlineOrders/CashierOnlineOrdersTabs.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersTabs.jsx). 66 líneas.

Exportaciones: `default: CashierOnlineOrdersTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`, `availableCount`, `myCount`.

### components/staff/casher/onlineOrders/onlineOrderDisplay.js

Fuente: [src/components/staff/casher/onlineOrders/onlineOrderDisplay.js](../src/components/staff/casher/onlineOrders/onlineOrderDisplay.js). 172 líneas.

Exportaciones: `onlineOrderStatusLabel`, `onlineOrderStatusColor`, `financialStatusLabel`, `financialStatusColor`, `fulfillmentLabel`, `timingLabel`, `paymentTypeLabel`, `kitchenFlowLabel`, `ownershipLabel`, `actorLabel`, `ONLINE_ORDER_CANCELLATION_REASONS`, `cancellationReasonLabel`, `formatCurrency`, `formatDateTime`, `formatDate`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx), [src/components/staff/casher/onlineOrders/CashierOnlineOrderCard.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderCard.jsx), [src/components/staff/casher/onlineOrders/CashierOnlineOrderDetailView.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderDetailView.jsx), [src/components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard.jsx), [src/components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard.jsx](../src/components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard.jsx).

### components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard.jsx

Fuente: [src/components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard.jsx](../src/components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard.jsx). 393 líneas.

Exportaciones: `default: CashierOnlineOrderPaymentHeroCard`.

Dependencias internas: [src/components/staff/casher/onlineOrders/onlineOrderDisplay.js](../src/components/staff/casher/onlineOrders/onlineOrderDisplay.js) (`financialStatusColor`, `financialStatusLabel`, `formatCurrency`, `fulfillmentLabel`, `onlineOrderStatusColor`, `onlineOrderStatusLabel`, `paymentTypeLabel`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Estados locales (`useState`): `mobileDetailsOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `order`, `sale`, `check`, `cashSession`, `paymentMethodsCount`, `onBack`, `icon`, `label`, `value`, `helper`, `emphasized`.

### components/staff/casher/prebill/CashierPrebillDialog.jsx

Fuente: [src/components/staff/casher/prebill/CashierPrebillDialog.jsx](../src/components/staff/casher/prebill/CashierPrebillDialog.jsx). 438 líneas.

Exportaciones: `default: CashierPrebillDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

Estados locales (`useState`): `phone`, `saveContact`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `customerSummary`, `onSendWhatsapp`, `sendingWhatsapp`, `onThermalPrint`, `thermalPrinting`, `disabled`, `label`, `input`, `help`.

### components/staff/casher/queuePage/CashierMergeSaleDialog.jsx

Fuente: [src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx). 1496 líneas.

Exportaciones: `default: CashierMergeSaleDialog`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/staff/casher/shared/CashierChoiceCard.jsx](../src/components/staff/casher/shared/CashierChoiceCard.jsx) (`CashierChoiceCard`); [src/components/staff/casher/shared/CashierDialogShell.jsx](../src/components/staff/casher/shared/CashierDialogShell.jsx) (`CashierDialogShell`); [src/components/staff/casher/shared/CashierFlowStepper.jsx](../src/components/staff/casher/shared/CashierFlowStepper.jsx) (`CashierFlowStepper`); [src/services/staff/casher/cashierOrderCheck.service.js](../src/services/staff/casher/cashierOrderCheck.service.js) (`fetchCashierSaleChecks`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx).

Estados locales (`useState`): `loading`, `summary`, `mode`, `activeStep`, `sourceCheckId`, `targetCheckId`, `sourceTableId`, `targetTableId`, `alertState`, `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `sale`, `mySales`, `submitting`, `onClose`, `onMergeChecks`, `onMergeTables`, `severity`, `title`, `message`, `items`, `value`, `onChange`, `disabled`, `renderItem`, `color`, `label`, `description`, `children`.

### components/staff/casher/queuePage/CashierQueueHeroCard.jsx

Fuente: [src/components/staff/casher/queuePage/CashierQueueHeroCard.jsx](../src/components/staff/casher/queuePage/CashierQueueHeroCard.jsx). 272 líneas.

Exportaciones: `default: CashierQueueHeroCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `cashSession`, `availableCount`, `myCount`, `myTotal`, `syncing`, `label`, `value`, `icon`, `helper`.

### components/staff/casher/queuePage/CashierQueueTabs.jsx

Fuente: [src/components/staff/casher/queuePage/CashierQueueTabs.jsx](../src/components/staff/casher/queuePage/CashierQueueTabs.jsx). 87 líneas.

Exportaciones: `default: CashierQueueTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`, `availableCount`, `myCount`.

### components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx

Fuente: [src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx](../src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx). 545 líneas.

Exportaciones: `default: CashierReadyNotificationsDrawer`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onOpen`, `onClose`, `notifications`, `busyId`, `onReadNotification`, `onlineOrderNotifications`, `onlineOrderBusyId`, `onReadOnlineOrderNotification`, `notification`, `busy`, `onRead`, `pagination`, `title`, `count`, `emptyText`, `children`, `label`, `value`.

### components/staff/casher/queuePage/CashierReleaseSaleDialog.jsx

Fuente: [src/components/staff/casher/queuePage/CashierReleaseSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierReleaseSaleDialog.jsx). 215 líneas.

Exportaciones: `default: CashierReleaseSaleDialog`.

Dependencias internas: [src/components/staff/casher/shared/CashierDialogShell.jsx](../src/components/staff/casher/shared/CashierDialogShell.jsx) (`CashierDialogShell`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `sale`, `submitting`, `onClose`, `onConfirm`, `label`, `value`.

### components/staff/casher/queuePage/CashierSaleAccountRow.jsx

Fuente: [src/components/staff/casher/queuePage/CashierSaleAccountRow.jsx](../src/components/staff/casher/queuePage/CashierSaleAccountRow.jsx). 165 líneas.

Exportaciones: `default: CashierSaleAccountRow`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/queuePage/CashierSaleAccountsList.jsx](../src/components/staff/casher/queuePage/CashierSaleAccountsList.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `check`, `isMine`, `disabled`, `onOpen`, `onReopen`.

### components/staff/casher/queuePage/CashierSaleAccountsList.jsx

Fuente: [src/components/staff/casher/queuePage/CashierSaleAccountsList.jsx](../src/components/staff/casher/queuePage/CashierSaleAccountsList.jsx). 94 líneas.

Exportaciones: `default: CashierSaleAccountsList`.

Dependencias internas: [src/components/staff/casher/queuePage/CashierSaleAccountRow.jsx](../src/components/staff/casher/queuePage/CashierSaleAccountRow.jsx) (`CashierSaleAccountRow`).

Consumidores directos: [src/components/staff/casher/queuePage/CashierSaleCard.jsx](../src/components/staff/casher/queuePage/CashierSaleCard.jsx).

Estados locales (`useState`): `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `checks`, `isMine`, `disabled`, `onOpenCheck`, `onReopenCheck`.

### components/staff/casher/queuePage/CashierSaleActionsMenu.jsx

Fuente: [src/components/staff/casher/queuePage/CashierSaleActionsMenu.jsx](../src/components/staff/casher/queuePage/CashierSaleActionsMenu.jsx). 204 líneas.

Exportaciones: `default: CashierSaleActionsMenu`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/queuePage/CashierSaleCard.jsx](../src/components/staff/casher/queuePage/CashierSaleCard.jsx).

Estados locales (`useState`): `anchorEl`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sale`, `disabled`, `onSplit`, `onMerge`, `onRelease`.

### components/staff/casher/queuePage/CashierSaleCard.jsx

Fuente: [src/components/staff/casher/queuePage/CashierSaleCard.jsx](../src/components/staff/casher/queuePage/CashierSaleCard.jsx). 488 líneas.

Exportaciones: `default: CashierSaleCard`.

Dependencias internas: [src/components/staff/casher/queuePage/CashierSaleActionsMenu.jsx](../src/components/staff/casher/queuePage/CashierSaleActionsMenu.jsx) (`CashierSaleActionsMenu`); [src/components/staff/casher/queuePage/CashierSaleAccountsList.jsx](../src/components/staff/casher/queuePage/CashierSaleAccountsList.jsx) (`CashierSaleAccountsList`).

Consumidores directos: [src/components/staff/casher/queuePage/CashierSalesPanel.jsx](../src/components/staff/casher/queuePage/CashierSalesPanel.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sale`, `mode`, `taking`, `disabled`, `onTake`, `onOpenDetail`, `onOpenCheck`, `onReopenCheck`, `onSplit`, `onMerge`, `onRelease`, `label`, `value`, `strong`.

### components/staff/casher/queuePage/CashierSalesPanel.jsx

Fuente: [src/components/staff/casher/queuePage/CashierSalesPanel.jsx](../src/components/staff/casher/queuePage/CashierSalesPanel.jsx). 169 líneas.

Exportaciones: `default: CashierSalesPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/staff/casher/queuePage/CashierSaleCard.jsx](../src/components/staff/casher/queuePage/CashierSaleCard.jsx) (`CashierSaleCard`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `subtitle`, `mode`, `sales`, `actionBusyId`, `actionsDisabled`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onTake`, `onOpenDetail`, `onOpenCheck`, `onReopenCheck`, `onSplit`, `onMerge`, `onRelease`.

### components/staff/casher/queuePage/CashierSplitSaleDialog.jsx

Fuente: [src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx). 2287 líneas.

Exportaciones: `default: CashierSplitSaleDialog`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/staff/casher/shared/CashierChoiceCard.jsx](../src/components/staff/casher/shared/CashierChoiceCard.jsx) (`CashierChoiceCard`); [src/components/staff/casher/shared/CashierDialogShell.jsx](../src/components/staff/casher/shared/CashierDialogShell.jsx) (`CashierDialogShell`); [src/components/staff/casher/shared/CashierFlowStepper.jsx](../src/components/staff/casher/shared/CashierFlowStepper.jsx) (`CashierFlowStepper`); [src/services/staff/casher/cashierOrderCheck.service.js](../src/services/staff/casher/cashierOrderCheck.service.js) (`fetchCashierSaleChecks`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx).

Estados locales (`useState`): `loading`, `busyAction`, `summary`, `method`, `activeStep`, `sourceCheckId`, `targetCheckId`, `checkName`, `reason`, `parts`, `selectedItems`, `partialItemId`, `partialQuantity`, `alertState`, `page`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `sale`, `initialCheckId`, `externalResult`, `onClose`, `onSplitByProducts`, `onSplitEqualParts`, `onUndoEqualParts`, `onMoveItem`, `onMoveQuantity`, `severity`, `title`, `message`, `reason`, `checks`, `canUndo`, `blockedReason`, `busy`, `busyAction`, `onUndo`, `sourceChecks`, `targetChecks`, `sourceCheckId`, `targetCheckId`, `sourceCheck`, `targetCheck`, `sourceItems`, `canManage`, `partialItemId`, `partialQuantity`, `onSourceChange`, `onTargetChange`, `onPartialQuantityChange`, `onOpenPartial`, `onCancelPartial`, `onMove`, `items`, `selectedItems`, `disabled`, `onToggle`, `onQuantityChange`, `item`, `selected`, `quantity`, `rows`, `label`, `value`, `onChange`, `color`, `moving`, `partialOpen`, `onMoveFull`, `onMovePartial`, `summary`, `description`, `help`, `input`, `children`.

### components/staff/casher/refunds/CashierRefundFullCancelDialog.jsx

Fuente: [src/components/staff/casher/refunds/CashierRefundFullCancelDialog.jsx](../src/components/staff/casher/refunds/CashierRefundFullCancelDialog.jsx). 259 líneas.

Exportaciones: `default: CashierRefundFullCancelDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `summary`, `reason`, `onReasonChange`, `onSubmit`, `busy`, `disabled`, `label`, `input`, `help`.

### components/staff/casher/refunds/CashierRefundHistoryFiltersCard.jsx

Fuente: [src/components/staff/casher/refunds/CashierRefundHistoryFiltersCard.jsx](../src/components/staff/casher/refunds/CashierRefundHistoryFiltersCard.jsx). 99 líneas.

Exportaciones: `default: CashierRefundHistoryFiltersCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `filters`, `onChange`, `disabled`, `label`, `input`.

### components/staff/casher/refunds/CashierRefundSaleCard.jsx

Fuente: [src/components/staff/casher/refunds/CashierRefundSaleCard.jsx](../src/components/staff/casher/refunds/CashierRefundSaleCard.jsx). 291 líneas.

Exportaciones: `default: CashierRefundSaleCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/refunds/CashierRefundSalesPanel.jsx](../src/components/staff/casher/refunds/CashierRefundSalesPanel.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sale`, `onOpenDetail`, `onOpenCancel`, `onOpenTicketActions`, `thermalPrintSaleId`, `label`, `value`, `strong`.

### components/staff/casher/refunds/CashierRefundSaleDetailDialog.jsx

Fuente: [src/components/staff/casher/refunds/CashierRefundSaleDetailDialog.jsx](../src/components/staff/casher/refunds/CashierRefundSaleDetailDialog.jsx). 300 líneas.

Exportaciones: `default: CashierRefundSaleDetailDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `summary`, `icon`, `label`, `value`, `helper`, `strong`.

### components/staff/casher/refunds/CashierRefundSalesPanel.jsx

Fuente: [src/components/staff/casher/refunds/CashierRefundSalesPanel.jsx](../src/components/staff/casher/refunds/CashierRefundSalesPanel.jsx). 337 líneas.

Exportaciones: `default: CashierRefundSalesPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/staff/casher/refunds/CashierRefundSaleCard.jsx](../src/components/staff/casher/refunds/CashierRefundSaleCard.jsx) (`CashierRefundSaleCard`).

Consumidores directos: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sales`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`, `onOpenDetail`, `onOpenCancel`, `onOpenTicketActions`, `thermalPrintSaleId`.

### components/staff/casher/refunds/CashierRefundsHeroCard.jsx

Fuente: [src/components/staff/casher/refunds/CashierRefundsHeroCard.jsx](../src/components/staff/casher/refunds/CashierRefundsHeroCard.jsx). 182 líneas.

Exportaciones: `default: CashierRefundsHeroCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `syncing`, `rows`, `icon`, `label`, `value`, `helper`.

### components/staff/casher/refunds/CashierRefundTicketActionsDialog.jsx

Fuente: [src/components/staff/casher/refunds/CashierRefundTicketActionsDialog.jsx](../src/components/staff/casher/refunds/CashierRefundTicketActionsDialog.jsx). 621 líneas.

Exportaciones: `default: CashierRefundTicketActionsDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx).

Estados locales (`useState`): `phone`, `saveContact`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `sale`, `onSendWhatsapp`, `sendingWhatsapp`, `thermalEnabled`, `thermalConfig`, `onThermalPrint`, `thermalPrinting`, `voucherReprintAvailable`, `onReprintNetpayVoucher`, `voucherReprinting`, `label`, `input`, `help`.

### components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx](../src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx). 1540 líneas.

Exportaciones: `default: CashierAdjustmentCard`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

Estados locales (`useState`): `activeMode`, `stepIndex`, `authorizationUserId`, `authorizationPin`, `clearDiscountsConfirmed`, `historyOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sale`, `orderCheckId`, `itemsFlat`, `orders`, `summary`, `partialForm`, `onPartialFormChange`, `partialDrafts`, `onAddPartialDraft`, `onRemovePartialDraft`, `onPartialDraftChange`, `onSubmitPartial`, `cancelOrderId`, `onCancelOrderIdChange`, `cancelOrderReason`, `onCancelOrderReasonChange`, `onSubmitCancelOrder`, `authorizers`, `loadingAuthorizers`, `authorizationError`, `hasManualDiscountsAffected`, `busy`, `disabled`, `steps`, `currentIndex`, `number`, `title`, `description`, `active`, `icon`, `subtitle`, `onClick`, `danger`, `label`, `input`, `help`, `value`, `highlight`, `children`.

### components/staff/casher/saleDetailPage/CashierCustomerCard.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierCustomerCard.jsx](../src/components/staff/casher/saleDetailPage/CashierCustomerCard.jsx). 790 líneas.

Exportaciones: `default: CashierCustomerCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

Estados locales (`useState`): `activeMode`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`, `contactForm`, `onContactFormChange`, `onSaveContact`, `onRemoveContact`, `searchForm`, `onSearchFormChange`, `onSearch`, `searchResults`, `onAttachCustomer`, `createForm`, `onCreateFormChange`, `onCreateAndAttach`, `onDetachCustomer`, `searching`, `busy`, `disabled`, `active`, `icon`, `title`, `subtitle`, `onClick`, `label`, `input`, `value`.

### components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog.jsx](../src/components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog.jsx). 796 líneas.

Exportaciones: `default: CashierDiscountAuthorizationDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `onSubmit`, `authorizers`, `form`, `onFormChange`, `loading`, `busy`, `error`, `message`, `policy`, `label`, `input`, `highlight`, `value`.

### components/staff/casher/saleDetailPage/CashierDiscountCard.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierDiscountCard.jsx](../src/components/staff/casher/saleDetailPage/CashierDiscountCard.jsx). 1166 líneas.

Exportaciones: `default: CashierDiscountCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Estados locales (`useState`): `activeSection`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sale`, `orderCheckId`, `itemsFlat`, `summary`, `globalForm`, `onGlobalFormChange`, `itemDiscountDrafts`, `onAddItemDiscountDraft`, `onRemoveItemDiscountDraft`, `onItemDiscountDraftChange`, `onApplyGlobal`, `onRemoveGlobal`, `onApplyItemDraft`, `onRemoveItem`, `busy`, `disabled`, `active`, `icon`, `label`, `helper`, `onClick`, `input`, `children`, `value`, `baseLineTotal`, `modifiersTotal`, `promotionDiscountTotal`, `cancellationTotal`.

### components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx](../src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx). 1179 líneas.

Exportaciones: `default: CashierOrderItemsCard`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `itemsTree`, `expanded`, `onToggle`, `item`, `level`, `label`, `value`, `strong`, `muted`, `negative`, `promotions`, `group`.

### components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx](../src/components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx). 980 líneas.

Exportaciones: `default: CashierPaymentFormCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `methods`, `initialAmount`, `preview`, `previewMode`, `tip`, `onTipChange`, `payments`, `onAddPayment`, `onRemovePayment`, `onPaymentChange`, `onPreview`, `showPrebill`, `onPrebill`, `prebillDisabled`, `previewing`, `paying`, `hasPreview`, `onPay`, `disabled`, `maxPayments`, `showAddPayment`, `showRemovePayment`, `paymentMethodLocked`, `description`, `helperText`, `netpayAvailable`, `netpayMode`, `onNetpayModeChange`, `netpayBusy`, `netpayStatus`, `netpayStatusLabel`, `netpayTerminal`, `netpayFinancialPending`, `netpayDevicePending`, `netpayRecoveryAvailable`, `netpayPendingMessage`, `onRetryNetpayRecovery`, `paymentAmountLocked`, `bankFieldsLocked`, `amountLocked`, `hideManualCardFields`, `label`, `input`, `method`, `payment`, `status`, `financialPending`, `devicePending`, `recoveryAvailable`, `pendingMessage`.

### components/staff/casher/saleDetailPage/CashierPaymentTabs.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierPaymentTabs.jsx](../src/components/staff/casher/saleDetailPage/CashierPaymentTabs.jsx). 71 líneas.

Exportaciones: `default: CashierPaymentTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `value`, `onChange`.

### components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard.jsx). 651 líneas.

Exportaciones: `default: CashierSaleDetailHeroCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

Estados locales (`useState`): `mobileDetailsOpen`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sale`, `selectedCheck`, `preparedCheck`, `saleCheckContext`, `billingGroup`, `relatedOrders`, `relatedTables`, `cashSession`, `onBack`, `canOperate`, `preparing`, `icon`, `label`, `value`, `helper`, `readyForPayment`, `availableForEditing`, `check`, `checkStatus`, `exactSaleLinked`, `validCashSession`.

### components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar.jsx). 296 líneas.

Exportaciones: `default: CashierSaleOptionalActionsBar`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `adjustmentSummary`, `customerSummary`, `discountSummary`, `disabled`, `adjustmentsDisabled`, `customerDisabled`, `discountsDisabled`, `showAdjustments`, `showCustomer`, `showDiscounts`, `onOpenAdjustments`, `onOpenCustomer`, `onOpenDiscounts`, `icon`, `title`, `status`, `active`, `onClick`.

### components/staff/casher/saleDetailPage/CashierSaleSummaryCard.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierSaleSummaryCard.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleSummaryCard.jsx). 529 líneas.

Exportaciones: `default: CashierSaleSummaryCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `sale`, `liveTip`, `preview`, `previewMode`, `selectedTaxOption`, `expanded`, `onToggle`, `label`, `value`, `strong`.

### components/staff/casher/saleDetailPage/CashierSaleToolDialog.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierSaleToolDialog.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleToolDialog.jsx). 144 líneas.

Exportaciones: `default: CashierSaleToolDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `title`, `subtitle`, `icon`, `onClose`, `children`, `maxWidth`.

### components/staff/casher/saleDetailPage/CashierTaxSelectorCard.jsx

Fuente: [src/components/staff/casher/saleDetailPage/CashierTaxSelectorCard.jsx](../src/components/staff/casher/saleDetailPage/CashierTaxSelectorCard.jsx). 85 líneas.

Exportaciones: `default: CashierTaxSelectorCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `taxOptions`, `value`, `onChange`, `disabled`.

### components/staff/casher/shared/CashierChoiceCard.jsx

Fuente: [src/components/staff/casher/shared/CashierChoiceCard.jsx](../src/components/staff/casher/shared/CashierChoiceCard.jsx). 89 líneas.

Exportaciones: `default: CashierChoiceCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx), [src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `title`, `description`, `icon`, `color`, `disabled`, `disabledReason`, `selected`, `onClick`.

### components/staff/casher/shared/CashierDialogShell.jsx

Fuente: [src/components/staff/casher/shared/CashierDialogShell.jsx](../src/components/staff/casher/shared/CashierDialogShell.jsx). 115 líneas.

Exportaciones: `default: CashierDialogShell`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`).

Consumidores directos: [src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx](../src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx), [src/components/staff/casher/onlineOrders/CashierOnlineOrderActionDialog.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderActionDialog.jsx), [src/components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx), [src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx), [src/components/staff/casher/queuePage/CashierReleaseSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierReleaseSaleDialog.jsx), [src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `title`, `description`, `icon`, `busy`, `maxWidth`, `onClose`, `children`.

### components/staff/casher/shared/CashierFlowStepper.jsx

Fuente: [src/components/staff/casher/shared/CashierFlowStepper.jsx](../src/components/staff/casher/shared/CashierFlowStepper.jsx). 96 líneas.

Exportaciones: `default: CashierFlowStepper`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx), [src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `steps`, `activeStep`.

### components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx

Fuente: [src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx](../src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx). 267 líneas.

Exportaciones: `default: CashierPostPaymentTicketModal`.

Dependencias internas: [src/components/staff/casher/ticket/CashierTicketPreviewCard.jsx](../src/components/staff/casher/ticket/CashierTicketPreviewCard.jsx) (`CashierTicketPreviewCard`); [src/components/staff/casher/ticket/CashierTicketWhatsappCard.jsx](../src/components/staff/casher/ticket/CashierTicketWhatsappCard.jsx) (`CashierTicketWhatsappCard`); [src/components/staff/casher/ticket/CashierTicketActionsBar.jsx](../src/components/staff/casher/ticket/CashierTicketActionsBar.jsx) (`CashierTicketActionsBar`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onContinue`, `onViewTicket`, `onPrintTicket`, `onThermalPrintTicket`, `onDownloadTicket`, `busyView`, `busyPrint`, `busyThermalPrint`, `busyDownload`, `busyWhatsapp`, `onSendWhatsapp`, `showWhatsapp`, `printConfig`, `customerSummary`, `ticket`, `sale`, `order`, `table`, `settlement`, `ticketWarning`, `ticketErrorCode`, `ticketErrorMessage`.

### components/staff/casher/ticket/CashierTicketActionsBar.jsx

Fuente: [src/components/staff/casher/ticket/CashierTicketActionsBar.jsx](../src/components/staff/casher/ticket/CashierTicketActionsBar.jsx). 154 líneas.

Exportaciones: `default: CashierTicketActionsBar`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx](../src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `onView`, `onPrint`, `onThermalPrint`, `onReprintNetpayVoucher`, `onDownload`, `onContinue`, `loadingView`, `loadingPrint`, `loadingThermalPrint`, `loadingVoucherReprint`, `loadingDownload`, `disabled`, `asyncOperationBusy`, `ticketAvailable`, `thermalPrintEnabled`, `voucherReprintAvailable`.

### components/staff/casher/ticket/CashierTicketPreviewCard.jsx

Fuente: [src/components/staff/casher/ticket/CashierTicketPreviewCard.jsx](../src/components/staff/casher/ticket/CashierTicketPreviewCard.jsx). 545 líneas.

Exportaciones: `default: CashierTicketPreviewCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx](../src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `label`, `value`, `highlight`, `ticket`, `sale`, `order`, `table`, `settlement`, `ticketWarning`, `ticketErrorCode`, `ticketErrorMessage`.

### components/staff/casher/ticket/CashierTicketWhatsappCard.jsx

Fuente: [src/components/staff/casher/ticket/CashierTicketWhatsappCard.jsx](../src/components/staff/casher/ticket/CashierTicketWhatsappCard.jsx). 303 líneas.

Exportaciones: `default: CashierTicketWhatsappCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx](../src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx).

Estados locales (`useState`): `phone`, `saveContact`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `ticketAvailable`, `customerSummary`, `onSendWhatsapp`, `busy`, `disabled`, `label`, `input`.

### components/staff/CashRegisterUpsertModal.jsx

Fuente: [src/components/staff/CashRegisterUpsertModal.jsx](../src/components/staff/CashRegisterUpsertModal.jsx). 985 líneas.

Exportaciones: `default: CashRegisterUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx).

Estados locales (`useState`): `saving`, `alertState`, `branchId`, `warehouseId`, `name`, `code`, `isActive`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `branches`, `editing`, `planAccess`, `cashRegisterMeta`, `warehouseOptionsByBranch`, `cashRegisterRequiresWarehouse`, `onSaved`, `api`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/staff/kitchen/kitchen.helpers.js

Fuente: [src/components/staff/kitchen/kitchen.helpers.js](../src/components/staff/kitchen/kitchen.helpers.js). 1520 líneas.

Exportaciones: `ESTADO_ITEM_ES`, `ESTADO_ORDEN_ES`, `tItemStatus`, `tOrderStatus`, `prettyNotes`, `getKitchenEffectiveQuantity`, `isKitchenItemEffective`, `getPreparedReuseBadge`, `formatWhen`, `formatKitchenCompactWhen`, `formatElapsed`, `pill`, `recalcOrderDerived`, `groupItemModifiers`, `modifierLabel`, `buildKitchenItemsView`, `buildConsumptionUi`, `buildKitchenInventoryError`, `extractWarehouseResolutionError`, `wrap`, `topbar`, `title`, `sub`, `note`, `empty`, `grid`, `ticketCard`, `ticketHead`, `ticketHeadTop`, `ticketMesaText`, `ticketTimePill`, `ticketHeadBottom`, `ticketFolioText`, `ticketBadges`, `badgeOk2`, `badgeWarn2`, `badgeDark2`, `ticketCustomer`, `ticketMeta`, `ticketBody`, `emptyItemsBox`, `emptyItemsTitle`, `emptyItemsText`, `ticketFooter`, `ticketFooterLeft`, `ticketFooterRight`, `noticeSentPill`, `noticePendingPill`, `ticketItemRow`, `ticketLeft`, `ticketItemTop`, `qtyDot`, `ticketItemName`, `ticketNotes`, `ticketItemMeta`, `metaDot`, `ticketItemDates`, `preparedReuseRow`, `preparedReusePill`, `consumptionRow`, `consumptionBadgeApplied`, `consumptionBadgeAlready`, `consumptionBadgeNeutral`, `ticketModifiersBlock`, `ticketModifiersTitle`, `ticketModifierGroups`, `ticketModifierGroupCard`, `ticketModifierGroupName`, `ticketModifiers`, `chipModifier`, `compositeGroupWrap`, `compositeGroupHeader`, `compositeGroupTitle`, `compositeGroupSub`, `compositeGroupBody`, `compositeChildRow`, `menuSetGroupWrap`, `menuSetGroupHeader`, `menuSetGroupTitle`, `menuSetStageWrap`, `menuSetStageTitle`, `menuSetStageBody`, `ticketRight`, `btnPrimary`, `btnGhost`, `btnDanger`, `btnAction`, `btnActionOk`, `btnNotifyReady`, `pillBase`, `messagesContainer`, `msgErr`, `msgOk`, `messageIcon`, `messageContent`, `messageCloseButton`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/kitchen/KitchenEmptyState.jsx](../src/components/staff/kitchen/KitchenEmptyState.jsx), [src/components/staff/kitchen/KitchenItemDetailsDialog.jsx](../src/components/staff/kitchen/KitchenItemDetailsDialog.jsx), [src/components/staff/kitchen/KitchenMessages.jsx](../src/components/staff/kitchen/KitchenMessages.jsx), [src/components/staff/kitchen/KitchenOrderCard.jsx](../src/components/staff/kitchen/KitchenOrderCard.jsx), [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

### components/staff/kitchen/KitchenEmptyState.jsx

Fuente: [src/components/staff/kitchen/KitchenEmptyState.jsx](../src/components/staff/kitchen/KitchenEmptyState.jsx). 20 líneas.

Exportaciones: `default: KitchenEmptyState`.

Dependencias internas: [src/components/staff/kitchen/kitchen.helpers.js](../src/components/staff/kitchen/kitchen.helpers.js) (`empty`).

Consumidores directos: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`.

### components/staff/kitchen/KitchenItemDetailsDialog.jsx

Fuente: [src/components/staff/kitchen/KitchenItemDetailsDialog.jsx](../src/components/staff/kitchen/KitchenItemDetailsDialog.jsx). 403 líneas.

Exportaciones: `default: KitchenItemDetailsDialog`.

Dependencias internas: [src/components/staff/kitchen/kitchen.helpers.js](../src/components/staff/kitchen/kitchen.helpers.js) (`getKitchenEffectiveQuantity`, `groupItemModifiers`, `modifierLabel`, `prettyNotes`, `tItemStatus`).

Consumidores directos: [src/components/staff/kitchen/KitchenOrderCard.jsx](../src/components/staff/kitchen/KitchenOrderCard.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `item`, `context`, `onClose`.

### components/staff/kitchen/KitchenMessages.jsx

Fuente: [src/components/staff/kitchen/KitchenMessages.jsx](../src/components/staff/kitchen/KitchenMessages.jsx). 62 líneas.

Exportaciones: `default: KitchenMessages`.

Dependencias internas: [src/components/staff/kitchen/kitchen.helpers.js](../src/components/staff/kitchen/kitchen.helpers.js) (`messageCloseButton`, `messageContent`, `messageIcon`, `messagesContainer`, `msgErr`, `msgOk`).

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `err`, `okMsg`, `onCloseErr`, `onCloseOk`.

### components/staff/kitchen/KitchenOrderCard.jsx

Fuente: [src/components/staff/kitchen/KitchenOrderCard.jsx](../src/components/staff/kitchen/KitchenOrderCard.jsx). 597 líneas.

Exportaciones: `default: KitchenOrderCard`.

Dependencias internas: [src/components/staff/kitchen/KitchenItemDetailsDialog.jsx](../src/components/staff/kitchen/KitchenItemDetailsDialog.jsx) (`KitchenItemDetailsDialog`); [src/components/staff/kitchen/kitchen.helpers.js](../src/components/staff/kitchen/kitchen.helpers.js) (`badgeDark2`, `badgeOk2`, `badgeWarn2`, `buildKitchenItemsView`, `compositeChildRow`, `compositeGroupBody`, `compositeGroupHeader`, `compositeGroupTitle`, `compositeGroupWrap`, `menuSetGroupWrap`, `menuSetGroupHeader`, `menuSetGroupTitle`, `menuSetStageWrap`, `menuSetStageTitle`, `menuSetStageBody`, `consumptionBadgeAlready`, `consumptionBadgeApplied`, `consumptionBadgeNeutral`, `consumptionRow`, `emptyItemsBox`, `emptyItemsText`, `emptyItemsTitle`, `formatElapsed`, `formatWhen`, `formatKitchenCompactWhen`, `getKitchenEffectiveQuantity`, `getPreparedReuseBadge`, `isKitchenItemEffective`, `metaDot`, `noticePendingPill`, `noticeSentPill`, `pill`, `preparedReusePill`, `preparedReuseRow`, `prettyNotes`, `qtyDot`, `tItemStatus`, `tOrderStatus`, `ticketBadges`, `ticketBody`, `ticketCard`, `ticketCustomer`, `ticketFooter`, `ticketFooterLeft`, `ticketFooterRight`, `ticketFolioText`, `ticketHead`, `ticketHeadBottom`, `ticketHeadTop`, `ticketItemMeta`, `ticketItemDates`, `ticketItemName`, `ticketItemRow`, `ticketItemTop`, `ticketLeft`, `ticketMesaText`, `ticketMeta`, `ticketRight`, `ticketTimePill`).

Consumidores directos: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

Estados locales (`useState`): `selectedDetail`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `order`, `onStart`, `onReady`, `onNotifyReady`, `busy`, `notifying`, `busyItemIds`, `itemConsumptionState`, `group`, `onShowDetails`, `context`, `compact`, `item`, `itemBusyState`, `consumptionState`.

### components/staff/kitchen/KitchenPreparedItemsDrawer.jsx

Fuente: [src/components/staff/kitchen/KitchenPreparedItemsDrawer.jsx](../src/components/staff/kitchen/KitchenPreparedItemsDrawer.jsx). 709 líneas.

Exportaciones: `default: KitchenPreparedItemsDrawer`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

Estados locales (`useState`): `activeCategory`, `unfitItem`, `unfitNote`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `item`, `category`, `busyAction`, `onFinish`, `onConfirmReturn`, `onRequestMarkUnfit`, `onRetireExpired`, `open`, `onOpen`, `onClose`, `count`, `recovery`, `busyItemIds`, `onMarkUnfit`.

### components/staff/kitchen/KitchenTabs.jsx

Fuente: [src/components/staff/kitchen/KitchenTabs.jsx](../src/components/staff/kitchen/KitchenTabs.jsx). 78 líneas.

Exportaciones: `default: KitchenTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`, `preparingCount`, `readyCount`.

### components/staff/kitchen/KitchenTopbar.jsx

Fuente: [src/components/staff/kitchen/KitchenTopbar.jsx](../src/components/staff/kitchen/KitchenTopbar.jsx). 47 líneas.

Exportaciones: `default: KitchenTopbar`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `ctx`, `busy`, `onExit`.

### components/staff/kitchen/KitchenWarehouseSelectorDialog.jsx

Fuente: [src/components/staff/kitchen/KitchenWarehouseSelectorDialog.jsx](../src/components/staff/kitchen/KitchenWarehouseSelectorDialog.jsx). 309 líneas.

Exportaciones: `default: KitchenWarehouseSelectorDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

Estados locales (`useState`): `selectedWarehouseId`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `payload`, `inventoryContext`, `selectionField`, `initialSelectedWarehouseId`, `message`, `loading`, `onClose`, `onConfirm`.

### components/staff/StaffAssignmentsModal.jsx

Fuente: [src/components/staff/StaffAssignmentsModal.jsx](../src/components/staff/StaffAssignmentsModal.jsx). 878 líneas.

Exportaciones: `default: StaffAssignmentsModal`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/services/staff/staffAssignments.service.js](../src/services/staff/staffAssignments.service.js) (`getAssignments`, `createAssignment`, `updateAssignment`, `deleteAssignment`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/staff/roles.service.js](../src/services/staff/roles.service.js) (`getRoles`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/staff/RestaurantStaffPage.jsx](../src/pages/staff/RestaurantStaffPage.jsx).

Estados locales (`useState`): `loading`, `saving`, `msg`, `items`, `branches`, `rolesOp`, `editing`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `user`, `attentionMode`, `field`, `label`.

### components/staff/StaffUpsertModal.jsx

Fuente: [src/components/staff/StaffUpsertModal.jsx](../src/components/staff/StaffUpsertModal.jsx). 846 líneas.

Exportaciones: `default: StaffUpsertModal`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/utils/getByPath.js](../src/utils/getByPath.js) (`getByPath`); [src/services/staff/staff.service.js](../src/services/staff/staff.service.js) (`createStaff`, `updateStaff`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/staff/roles.service.js](../src/services/staff/roles.service.js) (`getRoles`).

Consumidores directos: [src/pages/staff/RestaurantStaffPage.jsx](../src/pages/staff/RestaurantStaffPage.jsx).

Estados locales (`useState`): `step`, `saving`, `msg`, `stepAlert`, `branches`, `rolesOp`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `editing`, `attentionMode`, `onSaved`, `field`, `label`, `input`, `error`, `help`.

### components/staff/waiter/WaiterNoticesDrawer.jsx

Fuente: [src/components/staff/waiter/WaiterNoticesDrawer.jsx](../src/components/staff/waiter/WaiterNoticesDrawer.jsx). 593 líneas.

Exportaciones: `default: WaiterNoticesDrawer`.

Dependencias internas: [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

Estados locales (`useState`): `activeNoticeType`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onOpen`, `onClose`, `count`, `requests`, `reqBusyId`, `readyNotifications`, `readyBusyId`, `billRequests`, `billBusyId`, `cancellationRequests`, `cancellationBusyId`, `onReviewCancellation`, `payingBusyOrderId`, `onApproveReq`, `onRejectReq`, `onReadReadyNotification`, `onReadBillRequest`, `floatingIcon`, `title`, `emptyText`, `children`, `subtitle`, `meta`, `actions`, `page`, `totalPages`, `startItem`, `endItem`, `total`, `hasPrev`, `hasNext`, `onPrev`, `onNext`.

### components/staff/waiter/WaiterOccupyTableDialog.jsx

Fuente: [src/components/staff/waiter/WaiterOccupyTableDialog.jsx](../src/components/staff/waiter/WaiterOccupyTableDialog.jsx). 494 líneas.

Exportaciones: `default: WaiterOccupyTableDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

Estados locales (`useState`): `partySize`, `adultCount`, `childCount`, `notes`, `errors`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `table`, `loading`, `onClose`, `onConfirm`, `label`, `input`, `help`, `error`.

### components/staff/waiter/WaiterTableCard.jsx

Fuente: [src/components/staff/waiter/WaiterTableCard.jsx](../src/components/staff/waiter/WaiterTableCard.jsx). 627 líneas.

Exportaciones: `default: WaiterTableCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/waiter/WaiterTablesBoard.jsx](../src/components/staff/waiter/WaiterTablesBoard.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `children`, `onClick`, `disabled`, `variant`, `color`, `title`, `table`, `meta`, `payingBusyOrderId`, `onAttend`, `onRejectCall`, `onFinish`, `onReleaseSession`, `onAccept`, `onReject`, `onStartPayment`, `onOccupy`, `onFree`, `onCreateOrder`, `onViewOrder`.

### components/staff/waiter/WaiterTablesBoard.jsx

Fuente: [src/components/staff/waiter/WaiterTablesBoard.jsx](../src/components/staff/waiter/WaiterTablesBoard.jsx). 57 líneas.

Exportaciones: `default: WaiterTablesBoard`.

Dependencias internas: [src/components/staff/waiter/WaiterTableCard.jsx](../src/components/staff/waiter/WaiterTableCard.jsx) (`WaiterTableCard`).

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tables`, `meta`, `payingBusyOrderId`, `onAttend`, `onRejectCall`, `onFinish`, `onReleaseSession`, `onAccept`, `onReject`, `onStartPayment`, `onOccupy`, `onFree`, `onCreateOrder`, `onViewOrder`.

### components/staff/waiter/WaiterTablesHeader.jsx

Fuente: [src/components/staff/waiter/WaiterTablesHeader.jsx](../src/components/staff/waiter/WaiterTablesHeader.jsx). 104 líneas.

Exportaciones: `default: WaiterTablesHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `meta`, `summary`, `refreshing`, `onDashboard`, `dashboardLabel`.

### components/staff/waiter/WaiterWarehouseSelectionDialog.jsx

Fuente: [src/components/staff/waiter/WaiterWarehouseSelectionDialog.jsx](../src/components/staff/waiter/WaiterWarehouseSelectionDialog.jsx). 301 líneas.

Exportaciones: `default: WaiterWarehouseSelectionDialog`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `loading`, `orderId`, `tableName`, `context`, `selectedWarehouseId`, `onChange`, `onClose`, `onConfirm`.

### components/staff/waiter/WaiterZoneTabs.jsx

Fuente: [src/components/staff/waiter/WaiterZoneTabs.jsx](../src/components/staff/waiter/WaiterZoneTabs.jsx). 75 líneas.

Exportaciones: `default: WaiterZoneTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`, `zones`.

### components/system-admin/addon-sales/SystemAddonSalesFiltersCard.jsx

Fuente: [src/components/system-admin/addon-sales/SystemAddonSalesFiltersCard.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesFiltersCard.jsx). 139 líneas.

Exportaciones: `default: SystemAddonSalesFiltersCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `periodType`, `year`, `month`, `addonId`, `addons`, `q`, `total`, `onChangePeriodType`, `onChangeYear`, `onChangeMonth`, `onChangeAddonId`, `onChangeQ`.

### components/system-admin/addon-sales/SystemAddonSalesHeader.jsx

Fuente: [src/components/system-admin/addon-sales/SystemAddonSalesHeader.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesHeader.jsx). 46 líneas.

Exportaciones: `default: SystemAddonSalesHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `period`.

### components/system-admin/addon-sales/SystemAddonSalesListPanel.jsx

Fuente: [src/components/system-admin/addon-sales/SystemAddonSalesListPanel.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesListPanel.jsx). 369 líneas.

Exportaciones: `default: SystemAddonSalesListPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `period`, `pagination`, `onPrev`, `onNext`, `label`, `value`.

### components/system-admin/addon-sales/SystemAddonSalesSummaryCards.jsx

Fuente: [src/components/system-admin/addon-sales/SystemAddonSalesSummaryCards.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesSummaryCards.jsx). 126 líneas.

Exportaciones: `default: SystemAddonSalesSummaryCards`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`, `icon`, `title`, `value`, `caption`.

### components/system-admin/billing/invoices/SystemPlatformInvoiceDetailModal.jsx

Fuente: [src/components/system-admin/billing/invoices/SystemPlatformInvoiceDetailModal.jsx](../src/components/system-admin/billing/invoices/SystemPlatformInvoiceDetailModal.jsx). 643 líneas.

Exportaciones: `default: SystemPlatformInvoiceDetailModal`.

Dependencias internas: [src/services/system-admin/billing/platformBilling.service.js](../src/services/system-admin/billing/platformBilling.service.js) (`getSystemPlatformInvoice`).

Consumidores directos: [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx).

Estados locales (`useState`): `invoice`, `loading`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `invoiceId`, `onClose`, `onError`, `invoice`, `attempts`, `title`, `children`, `label`, `value`, `monospace`, `status`.

### components/system-admin/billing/invoices/SystemPlatformInvoicesFilters.jsx

Fuente: [src/components/system-admin/billing/invoices/SystemPlatformInvoicesFilters.jsx](../src/components/system-admin/billing/invoices/SystemPlatformInvoicesFilters.jsx). 129 líneas.

Exportaciones: `default: SystemPlatformInvoicesFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `filters`, `owners`, `onChange`, `label`, `children`.

### components/system-admin/billing/invoices/SystemPlatformInvoicesPanel.jsx

Fuente: [src/components/system-admin/billing/invoices/SystemPlatformInvoicesPanel.jsx](../src/components/system-admin/billing/invoices/SystemPlatformInvoicesPanel.jsx). 687 líneas.

Exportaciones: `default: SystemPlatformInvoicesPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `invoices`, `pagination`, `busyKey`, `onView`, `onDownloadPdf`, `onDownloadXml`, `onRetry`, `onPrev`, `onNext`, `invoice`, `label`, `value`, `status`.

### components/system-admin/billing/purchases/SystemPlatformInvoiceModal.jsx

Fuente: [src/components/system-admin/billing/purchases/SystemPlatformInvoiceModal.jsx](../src/components/system-admin/billing/purchases/SystemPlatformInvoiceModal.jsx). 457 líneas.

Exportaciones: `default: SystemPlatformInvoiceModal`.

Dependencias internas: [src/services/system-admin/billing/platformBilling.service.js](../src/services/system-admin/billing/platformBilling.service.js) (`createSystemPlatformInvoice`, `SYSTEM_INVOICE_MODES`).

Consumidores directos: [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx).

Estados locales (`useState`): `mode`, `usoCfdi`, `saving`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `purchases`, `compatibility`, `onClose`, `onCompleted`, `onAlert`, `value`, `checked`, `disabled`, `title`, `description`, `label`.

### components/system-admin/billing/purchases/SystemPlatformPurchasesFilters.jsx

Fuente: [src/components/system-admin/billing/purchases/SystemPlatformPurchasesFilters.jsx](../src/components/system-admin/billing/purchases/SystemPlatformPurchasesFilters.jsx). 289 líneas.

Exportaciones: `default: SystemPlatformPurchasesFilters`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `filters`, `owners`, `contextRows`, `loadingContext`, `onChange`, `label`, `children`, `sx`.

### components/system-admin/billing/purchases/SystemPlatformPurchasesPanel.jsx

Fuente: [src/components/system-admin/billing/purchases/SystemPlatformPurchasesPanel.jsx](../src/components/system-admin/billing/purchases/SystemPlatformPurchasesPanel.jsx). 635 líneas.

Exportaciones: `default: SystemPlatformPurchasesPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `purchases`, `selectedKeys`, `pagination`, `refreshing`, `canSelect`, `onToggle`, `onClearSelection`, `onOpenInvoice`, `purchase`, `selected`, `selectable`, `label`, `value`, `secondary`.

### components/system-admin/owners/detail/SystemOwnerHeroCard.jsx

Fuente: [src/components/system-admin/owners/detail/SystemOwnerHeroCard.jsx](../src/components/system-admin/owners/detail/SystemOwnerHeroCard.jsx). 164 líneas.

Exportaciones: `default: SystemOwnerHeroCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `owner`, `refreshing`, `onCreateRestaurant`, `onBack`, `icon`, `label`.

### components/system-admin/owners/detail/SystemOwnerRestaurantsPanel.jsx

Fuente: [src/components/system-admin/owners/detail/SystemOwnerRestaurantsPanel.jsx](../src/components/system-admin/owners/detail/SystemOwnerRestaurantsPanel.jsx). 555 líneas.

Exportaciones: `default: SystemOwnerRestaurantsPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurants`, `busyId`, `q`, `status`, `filteredLabel`, `total`, `pagination`, `onChangeQ`, `onChangeStatus`, `onManage`, `onEdit`, `onDelete`, `onToggleStatus`, `onPrev`, `onNext`.

### components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx

Fuente: [src/components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx](../src/components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx). 457 líneas.

Exportaciones: `default: SystemOwnerRestaurantUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx).

Estados locales (`useState`): `saving`, `alertState`, `tradeName`, `description`, `contactPhone`, `contactEmail`, `status`, `inventoryMode`, `productsMode`, `recipeMode`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `editing`, `onClose`, `onSave`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx

Fuente: [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx). 454 líneas.

Exportaciones: `default: SystemBranchAddonAssignModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx).

Estados locales (`useState`): `saving`, `addonId`, `source`, `monthsPaid`, `monthsGranted`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `branch`, `addons`, `onClose`, `onSave`, `severity`, `title`, `message`, `label`, `input`.

### components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsHeroCard.jsx

Fuente: [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsHeroCard.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsHeroCard.jsx). 122 líneas.

Exportaciones: `default: SystemBranchAddonsHeroCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `owner`, `restaurant`, `branch`, `onBack`, `icon`, `label`.

### components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsPanel.jsx

Fuente: [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsPanel.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsPanel.jsx). 390 líneas.

Exportaciones: `default: SystemBranchAddonsPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `addons`, `q`, `status`, `filteredLabel`, `total`, `pagination`, `onChangeQ`, `onChangeStatus`, `onAssign`, `row`, `label`, `value`.

### components/system-admin/owners/restaurants/branches/SystemRestaurantBranchesPanel.jsx

Fuente: [src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchesPanel.jsx](../src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchesPanel.jsx). 507 líneas.

Exportaciones: `default: SystemRestaurantBranchesPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `branches`, `busyId`, `q`, `status`, `filteredLabel`, `total`, `pagination`, `onChangeQ`, `onChangeStatus`, `onCreate`, `onManageAddons`, `onEdit`, `onDelete`, `onToggleStatus`, `label`, `value`.

### components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx

Fuente: [src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx](../src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx). 590 líneas.

Exportaciones: `default: SystemRestaurantBranchUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx).

Estados locales (`useState`): `saving`, `alertState`, `name`, `address`, `phone`, `openTime`, `closeTime`, `status`, `selectedLogoFile`, `selectedLogoPreview`, `removeCurrentLogo`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `editing`, `onClose`, `onSave`, `severity`, `title`, `message`, `label`, `input`.

### components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx

Fuente: [src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx](../src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx). 632 líneas.

Exportaciones: `default: SystemRestaurantSubscriptionAssignModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx).

Estados locales (`useState`): `saving`, `planId`, `monthsPaid`, `monthsGranted`, `paidPrice`, `provider`, `providerRef`, `startsAt`, `autoRenew`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `plans`, `owner`, `subscriptions`, `onClose`, `onSave`, `severity`, `title`, `message`, `label`, `input`, `help`.

### components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionPanel.jsx

Fuente: [src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionPanel.jsx](../src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionPanel.jsx). 407 líneas.

Exportaciones: `default: SystemRestaurantSubscriptionPanel`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `currentSubscription`, `subscriptions`, `plans`, `loading`, `busy`, `onAssign`, `onExpireCurrent`, `row`, `label`, `value`.

### components/system-admin/owners/restaurants/SystemOwnerRestaurantHeroCard.jsx

Fuente: [src/components/system-admin/owners/restaurants/SystemOwnerRestaurantHeroCard.jsx](../src/components/system-admin/owners/restaurants/SystemOwnerRestaurantHeroCard.jsx). 126 líneas.

Exportaciones: `default: SystemOwnerRestaurantHeroCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `owner`, `restaurant`, `refreshing`, `onBack`, `icon`, `label`.

### components/system-admin/owners/restaurants/SystemOwnerRestaurantTabs.jsx

Fuente: [src/components/system-admin/owners/restaurants/SystemOwnerRestaurantTabs.jsx](../src/components/system-admin/owners/restaurants/SystemOwnerRestaurantTabs.jsx). 81 líneas.

Exportaciones: `default: SystemOwnerRestaurantTabs`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `tab`, `onChange`.

### components/system-admin/owners/SystemOwnersFiltersCard.jsx

Fuente: [src/components/system-admin/owners/SystemOwnersFiltersCard.jsx](../src/components/system-admin/owners/SystemOwnersFiltersCard.jsx). 92 líneas.

Exportaciones: `default: SystemOwnersFiltersCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `q`, `status`, `filteredLabel`, `total`, `onChangeQ`, `onChangeStatus`.

### components/system-admin/owners/SystemOwnersHeader.jsx

Fuente: [src/components/system-admin/owners/SystemOwnersHeader.jsx](../src/components/system-admin/owners/SystemOwnersHeader.jsx). 63 líneas.

Exportaciones: `default: SystemOwnersHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `onCreate`, `refreshing`.

### components/system-admin/owners/SystemOwnersListPanel.jsx

Fuente: [src/components/system-admin/owners/SystemOwnersListPanel.jsx](../src/components/system-admin/owners/SystemOwnersListPanel.jsx). 397 líneas.

Exportaciones: `default: SystemOwnersListPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `owners`, `busyId`, `pagination`, `onManage`, `onEdit`, `onDelete`, `onToggleStatus`, `onPrev`, `onNext`.

### components/system-admin/owners/SystemOwnerUpsertModal.jsx

Fuente: [src/components/system-admin/owners/SystemOwnerUpsertModal.jsx](../src/components/system-admin/owners/SystemOwnerUpsertModal.jsx). 249 líneas.

Exportaciones: `default: SystemOwnerUpsertModal`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/system-admin/owners/tabs/SystemOwnerAccountTab.jsx](../src/components/system-admin/owners/tabs/SystemOwnerAccountTab.jsx) (`SystemOwnerAccountTab`); [src/components/system-admin/owners/tabs/SystemOwnerTaxProfileTab.jsx](../src/components/system-admin/owners/tabs/SystemOwnerTaxProfileTab.jsx) (`SystemOwnerTaxProfileTab`).

Consumidores directos: [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx).

Estados locales (`useState`): `tab`, `busy`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `editing`, `onClose`, `onSave`, `onTaxProfileSaved`.

### components/system-admin/owners/tabs/SystemOwnerAccountTab.jsx

Fuente: [src/components/system-admin/owners/tabs/SystemOwnerAccountTab.jsx](../src/components/system-admin/owners/tabs/SystemOwnerAccountTab.jsx). 313 líneas.

Exportaciones: `default: SystemOwnerAccountTab`.

Dependencias internas: [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/components/system-admin/owners/SystemOwnerUpsertModal.jsx](../src/components/system-admin/owners/SystemOwnerUpsertModal.jsx).

Estados locales (`useState`): `saving`, `name`, `lastNamePaternal`, `lastNameMaternal`, `phone`, `email`, `password`, `status`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `editing`, `onClose`, `onSave`, `onSaved`, `onError`, `onBusyChange`, `label`, `input`, `help`.

### components/system-admin/owners/tabs/SystemOwnerTaxProfileTab.jsx

Fuente: [src/components/system-admin/owners/tabs/SystemOwnerTaxProfileTab.jsx](../src/components/system-admin/owners/tabs/SystemOwnerTaxProfileTab.jsx). 386 líneas.

Exportaciones: `default: SystemOwnerTaxProfileTab`.

Dependencias internas: [src/services/system-admin/systemOwnerTaxProfile.service.js](../src/services/system-admin/systemOwnerTaxProfile.service.js) (`getSystemOwnerTaxProfile`, `updateSystemOwnerTaxProfile`).

Consumidores directos: [src/components/system-admin/owners/SystemOwnerUpsertModal.jsx](../src/components/system-admin/owners/SystemOwnerUpsertModal.jsx).

Estados locales (`useState`): `form`, `billingEmail`, `loading`, `loaded`, `saving`, `attemptedSave`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `ownerId`, `active`, `onClose`, `onSaved`, `onError`, `onBusyChange`, `label`, `input`, `help`.

### components/system-admin/subscription-sales/SystemSubscriptionSalesFiltersCard.jsx

Fuente: [src/components/system-admin/subscription-sales/SystemSubscriptionSalesFiltersCard.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesFiltersCard.jsx). 228 líneas.

Exportaciones: `default: SystemSubscriptionSalesFiltersCard`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `periodType`, `year`, `month`, `dateField`, `subscriptionType`, `q`, `status`, `total`, `onChangePeriodType`, `onChangeYear`, `onChangeMonth`, `onChangeDateField`, `onChangeSubscriptionType`, `onChangeQ`, `onChangeStatus`.

### components/system-admin/subscription-sales/SystemSubscriptionSalesHeader.jsx

Fuente: [src/components/system-admin/subscription-sales/SystemSubscriptionSalesHeader.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesHeader.jsx). 96 líneas.

Exportaciones: `default: SystemSubscriptionSalesHeader`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `refreshing`, `period`.

### components/system-admin/subscription-sales/SystemSubscriptionSalesListPanel.jsx

Fuente: [src/components/system-admin/subscription-sales/SystemSubscriptionSalesListPanel.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesListPanel.jsx). 374 líneas.

Exportaciones: `default: SystemSubscriptionSalesListPanel`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `rows`, `period`, `pagination`, `onPrev`, `onNext`.

### components/system-admin/subscription-sales/SystemSubscriptionSalesSummaryCards.jsx

Fuente: [src/components/system-admin/subscription-sales/SystemSubscriptionSalesSummaryCards.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesSummaryCards.jsx). 333 líneas.

Exportaciones: `default: SystemSubscriptionSalesSummaryCards`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `summary`, `byType`, `byPlan`, `byStatus`, `byProvider`, `icon`, `title`, `value`, `caption`, `rows`.

### components/variants/content/VariantAttributeFormContent.jsx

Fuente: [src/components/variants/content/VariantAttributeFormContent.jsx](../src/components/variants/content/VariantAttributeFormContent.jsx). 257 líneas.

Exportaciones: `default: VariantAttributeFormContent`.

Dependencias internas: [src/services/products/variants/variantAttributes.service.js](../src/services/products/variants/variantAttributes.service.js) (`createVariantAttribute`, `updateVariantAttribute`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

Estados locales (`useState`): `saving`, `form`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productName`, `editing`, `onBack`, `onSaved`, `severity`, `title`, `message`.

### components/variants/content/VariantAttributesContent.jsx

Fuente: [src/components/variants/content/VariantAttributesContent.jsx](../src/components/variants/content/VariantAttributesContent.jsx). 561 líneas.

Exportaciones: `default: VariantAttributesContent`.

Dependencias internas: [src/services/products/variants/variantAttributes.service.js](../src/services/products/variants/variantAttributes.service.js) (`getVariantAttributes`, `updateVariantAttribute`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

Estados locales (`useState`): `loading`, `loadFailed`, `attributes`, `statusActionId`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productName`, `refreshKey`, `onBack`, `onCreateAttribute`, `onEditAttribute`, `onOpenValues`, `onChanged`, `severity`, `title`, `message`.

### components/variants/content/VariantAttributeValuesContent.jsx

Fuente: [src/components/variants/content/VariantAttributeValuesContent.jsx](../src/components/variants/content/VariantAttributeValuesContent.jsx). 1133 líneas.

Exportaciones: `default: VariantAttributeValuesContent`.

Dependencias internas: [src/services/products/variants/variantAttributeValues.service.js](../src/services/products/variants/variantAttributeValues.service.js) (`getVariantAttributeValues`, `createVariantAttributeValue`, `updateVariantAttributeValue`, `deleteVariantAttributeValue`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

Estados locales (`useState`): `loading`, `values`, `newValue`, `creating`, `editingValueId`, `editingText`, `actionId`, `ordering`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productName`, `attribute`, `refreshKey`, `onBack`, `onChanged`, `severity`, `title`, `message`.

### components/variants/content/VariantChannelsContent.jsx

Fuente: [src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx). 1000 líneas.

Exportaciones: `default: VariantChannelsContent`.

Dependencias internas: [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/products/variants/productVariantChannels.service.js](../src/services/products/variants/productVariantChannels.service.js) (`getVariantChannels`, `upsertVariantChannels`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

Estados locales (`useState`): `branches`, `branchId`, `rows`, `draft`, `loadingBranches`, `loadingTable`, `tableReady`, `saving`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productName`, `variant`, `onChanged`, `severity`, `title`, `message`, `children`, `sx`.

### components/variants/content/VariantCreateContent.jsx

Fuente: [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx). 983 líneas.

Exportaciones: `default: VariantCreateContent`.

Dependencias internas: [src/services/products/variants/variantAttributes.service.js](../src/services/products/variants/variantAttributes.service.js) (`getVariantAttributes`); [src/services/products/variants/variantAttributeValues.service.js](../src/services/products/variants/variantAttributeValues.service.js) (`getVariantAttributeValues`); [src/services/products/variants/productVariantGenerator.service.js](../src/services/products/variants/productVariantGenerator.service.js) (`generateProductVariants`); [src/services/products/variants/productVariants.service.js](../src/services/products/variants/productVariants.service.js) (`getProductVariants`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

Estados locales (`useState`): `loading`, `loadingValues`, `generating`, `step`, `attributes`, `selectedAttributeId`, `attribute`, `values`, `selectedValueIds`, `usedValueIds`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productName`, `disabledByPrecondition`, `refreshKey`, `onManageAttribute`, `onGenerated`, `severity`, `title`, `message`.

### components/variants/content/VariantDetailContent.jsx

Fuente: [src/components/variants/content/VariantDetailContent.jsx](../src/components/variants/content/VariantDetailContent.jsx). 493 líneas.

Exportaciones: `default: VariantDetailContent`.

Dependencias internas: [src/services/products/variants/productVariants.service.js](../src/services/products/variants/productVariants.service.js) (`toggleProductVariant`, `setDefaultProductVariant`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

Estados locales (`useState`): `variant`, `savingStatus`, `savingDefault`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productName`, `variantRow`, `effectiveImage`, `onOpenChannels`, `onOpenImage`, `onOpenRepair`, `onChanged`.

### components/variants/content/VariantImageContent.jsx

Fuente: [src/components/variants/content/VariantImageContent.jsx](../src/components/variants/content/VariantImageContent.jsx). 501 líneas.

Exportaciones: `default: VariantImageContent`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

Estados locales (`useState`): `imageState`, `loading`, `uploading`, `deleting`, `alertState`, `failed`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productName`, `variant`, `getVariantImage`, `uploadVariantImage`, `deleteVariantImage`, `onChanged`, `severity`, `title`, `message`, `src`, `alt`, `emptyText`.

### components/variants/content/VariantRepairContent.jsx

Fuente: [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx). 769 líneas.

Exportaciones: `default: VariantRepairContent`.

Dependencias internas: [src/services/products/variants/variantAttributes.service.js](../src/services/products/variants/variantAttributes.service.js) (`getVariantAttributes`); [src/services/products/variants/variantAttributeValues.service.js](../src/services/products/variants/variantAttributeValues.service.js) (`getVariantAttributeValues`); [src/services/products/variants/productVariants.service.js](../src/services/products/variants/productVariants.service.js) (`repairProductVariant`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

Estados locales (`useState`): `repairedVariant`, `attribute`, `values`, `selectedValueId`, `activateAfter`, `loading`, `saving`, `alertState`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `restaurantId`, `productId`, `productName`, `variantRow`, `onBack`, `onRepaired`, `severity`, `title`, `message`.

### components/variants/VariantManagementDialog.jsx

Fuente: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx). 533 líneas.

Exportaciones: `default: VariantManagementDialog`.

Dependencias internas: [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx) (`VariantCreateContent`); [src/components/variants/content/VariantAttributesContent.jsx](../src/components/variants/content/VariantAttributesContent.jsx) (`VariantAttributesContent`); [src/components/variants/content/VariantAttributeFormContent.jsx](../src/components/variants/content/VariantAttributeFormContent.jsx) (`VariantAttributeFormContent`); [src/components/variants/content/VariantAttributeValuesContent.jsx](../src/components/variants/content/VariantAttributeValuesContent.jsx) (`VariantAttributeValuesContent`); [src/components/variants/content/VariantDetailContent.jsx](../src/components/variants/content/VariantDetailContent.jsx) (`VariantDetailContent`); [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx) (`VariantRepairContent`); [src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx) (`VariantChannelsContent`); [src/components/variants/content/VariantImageContent.jsx](../src/components/variants/content/VariantImageContent.jsx) (`VariantImageContent`); [src/services/products/variants/productVariantImages.service.js](../src/services/products/variants/productVariantImages.service.js) (`getProductVariantImage`, `uploadProductVariantImage`, `deleteProductVariantImage`).

Consumidores directos: [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx).

Estados locales (`useState`): `current`, `history`.

Claves desestructuradas de entrada en funciones (incluye componentes y helpers; no constituye un esquema de props obligatorio): `open`, `onClose`, `restaurantId`, `productId`, `productName`, `initialView`, `initialVariantRow`, `disabledByPrecondition`, `onChanged`.

## pages

### pages/admin/Dashboard.jsx

Fuente: [src/pages/admin/Dashboard.jsx](../src/pages/admin/Dashboard.jsx). 15 líneas.

Exportaciones: `default: Dashboard`.

Dependencias internas: [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`useAuth`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

### pages/auth/Login.jsx

Fuente: [src/pages/auth/Login.jsx](../src/pages/auth/Login.jsx). 459 líneas.

Exportaciones: `default: Login`.

Dependencias internas: [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`useAuth`); [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/components/auth/ForgotPasswordModal.jsx](../src/components/auth/ForgotPasswordModal.jsx) (`ForgotPasswordModal`); [src/components/auth/TermsModal.jsx](../src/components/auth/TermsModal.jsx) (`TermsModal`); [src/components/auth/AuthBrandPanel.jsx](../src/components/auth/AuthBrandPanel.jsx) (`AuthBrandPanel`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `err`, `busy`, `forgotOpen`, `termsOpen`, `pendingCreds`, `pendingTermsUser`, `termsRequiredMsg`.

### pages/auth/ReferralWelcomeModal.jsx

Fuente: [src/pages/auth/ReferralWelcomeModal.jsx](../src/pages/auth/ReferralWelcomeModal.jsx). 131 líneas.

Exportaciones: `default: ReferralWelcomeModal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx).

### pages/auth/Register.jsx

Fuente: [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx). 1034 líneas.

Exportaciones: `default: Register`.

Dependencias internas: [src/components/auth/TermsModal.jsx](../src/components/auth/TermsModal.jsx) (`TermsModal`); [src/components/auth/AuthBrandPanel.jsx](../src/components/auth/AuthBrandPanel.jsx) (`AuthBrandPanel`); [src/utils/phone.js](../src/utils/phone.js) (`normalizePhone`); [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`useAuth`); [src/services/auth/auth.service.js](../src/services/auth/auth.service.js) (`requestRegisterCode`, `verifyRegisterCode`, `resendRegisterCode`); [src/services/referrals/referral.service.js](../src/services/referrals/referral.service.js) (`checkReferralCode`); [src/pages/auth/ReferralWelcomeModal.jsx](../src/pages/auth/ReferralWelcomeModal.jsx) (`ReferralWelcomeModal`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `step`, `globalMsg`, `busy`, `termsOpen`, `cooldown`, `refStatus`, `showReferralModal`.

### pages/connection/netpay/NetpayConnectionPage.jsx

Fuente: [src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx). 312 líneas.

Exportaciones: `default: NetpayConnectionPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/connection/netpay/NetpayInstructionsCard.jsx](../src/components/connection/netpay/NetpayInstructionsCard.jsx) (`NetpayInstructionsCard`); [src/components/connection/netpay/NetpayTerminalsCard.jsx](../src/components/connection/netpay/NetpayTerminalsCard.jsx) (`NetpayTerminalsCard`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/connection/netpay/netpayTerminal.service.js](../src/services/connection/netpay/netpayTerminal.service.js) (`getRestaurantNetpayTerminals`, `updateRestaurantNetpayTerminal`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `terminals`, `branches`, `savingTerminalId`, `alertState`.

### pages/connection/tae/TaecontaAccountPage.jsx

Fuente: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx). 514 líneas.

Exportaciones: `default: TaecontaAccountPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/services/connection/tae/taeAccount.service.js](../src/services/connection/tae/taeAccount.service.js) (`getTaecontaAccount`, `upsertTaecontaAccount`, `deleteTaecontaAccount`); [src/services/connection/tae/taeTaxProfile.service.js](../src/services/connection/tae/taeTaxProfile.service.js) (`getTaecontaTaxProfile`); [src/services/connection/tae/taeInvoiceSetting.service.js](../src/services/connection/tae/taeInvoiceSetting.service.js) (`getTaecontaInvoiceSetting`, `upsertTaecontaInvoiceSetting`, `deleteTaecontaInvoiceSetting`); [src/components/connection/tae/TaecontaHeader.jsx](../src/components/connection/tae/TaecontaHeader.jsx) (`TaecontaHeader`); [src/components/connection/tae/TaecontaInstructionsCard.jsx](../src/components/connection/tae/TaecontaInstructionsCard.jsx) (`TaecontaInstructionsCard`); [src/components/connection/tae/TaecontaTabs.jsx](../src/components/connection/tae/TaecontaTabs.jsx) (`TaecontaTabs`); [src/components/connection/tae/TaecontaContextCard.jsx](../src/components/connection/tae/TaecontaContextCard.jsx) (`TaecontaContextCard`); [src/components/connection/tae/TaeAccountCard.jsx](../src/components/connection/tae/TaeAccountCard.jsx) (`TaeAccountCard`); [src/components/connection/tae/TaeTaxProfileCard.jsx](../src/components/connection/tae/TaeTaxProfileCard.jsx) (`TaeTaxProfileCard`); [src/components/connection/tae/TaeInvoiceSettingsContextCard.jsx](../src/components/connection/tae/TaeInvoiceSettingsContextCard.jsx) (`TaeInvoiceSettingsContextCard`); [src/components/connection/tae/TaeInvoiceSettingsCard.jsx](../src/components/connection/tae/TaeInvoiceSettingsCard.jsx) (`TaeInvoiceSettingsCard`); [src/components/connection/tae/TaeCatalogSatStatusCard.jsx](../src/components/connection/tae/TaeCatalogSatStatusCard.jsx) (`TaeCatalogSatStatusCard`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `activeTab`, `accountPayload`, `taxProfilePayload`, `invoiceSettingPayload`, `alertState`.

### pages/connection/whasapo/WhasapoConnectionPage.jsx

Fuente: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx). 505 líneas.

Exportaciones: `default: WhasapoConnectionPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/connection/whasapo/WhasapoConnectionHeader.jsx](../src/components/connection/whasapo/WhasapoConnectionHeader.jsx) (`WhasapoConnectionHeader`); [src/components/connection/whasapo/WhasapoInstructionsCard.jsx](../src/components/connection/whasapo/WhasapoInstructionsCard.jsx) (`WhasapoInstructionsCard`); [src/components/connection/whasapo/WhasapoBranchSelectorCard.jsx](../src/components/connection/whasapo/WhasapoBranchSelectorCard.jsx) (`WhasapoBranchSelectorCard`); [src/components/connection/whasapo/WhasapoChannelPreferenceCard.jsx](../src/components/connection/whasapo/WhasapoChannelPreferenceCard.jsx) (`WhasapoChannelPreferenceCard`); [src/components/connection/whasapo/WhasapoConnectionTabs.jsx](../src/components/connection/whasapo/WhasapoConnectionTabs.jsx) (`WhasapoConnectionTabs`); [src/components/connection/whasapo/WhasapoContextCard.jsx](../src/components/connection/whasapo/WhasapoContextCard.jsx) (`WhasapoContextCard`); [src/components/connection/whasapo/WhasapoSettingsCard.jsx](../src/components/connection/whasapo/WhasapoSettingsCard.jsx) (`WhasapoSettingsCard`); [src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx) (`ChatingBootPanel`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/operation/ticket/branchWhasapoSetting.service.js](../src/services/operation/ticket/branchWhasapoSetting.service.js) (`getBranchWhasapoSetting`, `updateBranchWhasapoSetting`, `deleteBranchWhasapoSetting`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `saving`, `preferenceSaving`, `branches`, `branchId`, `tab`, `form`, `persistedWhasapo`, `channelState`, `alertState`.

### pages/floor/BranchFloorPlanPage.jsx

Fuente: [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx). 1096 líneas.

Exportaciones: `default: BranchFloorPlanPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/floor/OperationalSettingsModal.jsx](../src/components/floor/OperationalSettingsModal.jsx) (`OperationalSettingsModal`); [src/components/floor/ZoneModal.jsx](../src/components/floor/ZoneModal.jsx) (`ZoneModal`); [src/components/floor/TableModal.jsx](../src/components/floor/TableModal.jsx) (`TableModal`); [src/components/floor/FloorPlanHeader.jsx](../src/components/floor/FloorPlanHeader.jsx) (`FloorPlanHeader`); [src/components/floor/FloorPlanInstructionsCard.jsx](../src/components/floor/FloorPlanInstructionsCard.jsx) (`FloorPlanInstructionsCard`); [src/components/floor/FloorBranchSelectorCard.jsx](../src/components/floor/FloorBranchSelectorCard.jsx) (`FloorBranchSelectorCard`); [src/components/floor/FloorPlanContextCard.jsx](../src/components/floor/FloorPlanContextCard.jsx) (`FloorPlanContextCard`); [src/components/floor/FloorZoneTabs.jsx](../src/components/floor/FloorZoneTabs.jsx) (`FloorZoneTabs`); [src/components/floor/FloorZonesPanel.jsx](../src/components/floor/FloorZonesPanel.jsx) (`FloorZonesPanel`); [src/components/floor/FloorTablesPanel.jsx](../src/components/floor/FloorTablesPanel.jsx) (`FloorTablesPanel`); [src/components/floor/FloorLegendCard.jsx](../src/components/floor/FloorLegendCard.jsx) (`FloorLegendCard`); [src/components/floor/AssignZoneWaiterModal.jsx](../src/components/floor/AssignZoneWaiterModal.jsx) (`AssignZoneWaiterModal`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/floor/operationalSettings.service.js](../src/services/floor/operationalSettings.service.js) (`getOperationalSettings`); [src/services/floor/zones.service.js](../src/services/floor/zones.service.js) (`getZones`, `deleteZone`, `assignZoneWaiter`); [src/services/floor/tables.service.js](../src/services/floor/tables.service.js) (`getTables`, `deleteTable`, `getAvailableWaiters`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `branches`, `selectedBranchId`, `settingsPayload`, `zones`, `tables`, `zonesLoading`, `tablesLoading`, `settingsModalOpen`, `settingsModalMode`, `zoneModalOpen`, `zoneModalMode`, `zoneModalInitial`, `tableModalOpen`, `tableModalMode`, `tableModalInitial`, `assignModalOpen`, `assignZone`, `assignWaitersLoading`, `assignWaiters`, `assignSelectedWaiterId`, `assignSaving`, `zoneFilter`, `alertState`.

### pages/floor/qr/BranchQrCodesPage.jsx

Fuente: [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx). 1118 líneas.

Exportaciones: `default: BranchQrCodesPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/floor/qr/BranchQrHeader.jsx](../src/components/floor/qr/BranchQrHeader.jsx) (`BranchQrHeader`); [src/components/floor/qr/BranchQrInstructionsCard.jsx](../src/components/floor/qr/BranchQrInstructionsCard.jsx) (`BranchQrInstructionsCard`); [src/components/floor/qr/BranchQrContextCard.jsx](../src/components/floor/qr/BranchQrContextCard.jsx) (`BranchQrContextCard`); [src/components/floor/qr/BranchQrStatusBanner.jsx](../src/components/floor/qr/BranchQrStatusBanner.jsx) (`BranchQrStatusBanner`); [src/components/floor/qr/BranchQrListPanel.jsx](../src/components/floor/qr/BranchQrListPanel.jsx) (`BranchQrListPanel`); [src/components/floor/qr/BranchQrCreateModal.jsx](../src/components/floor/qr/BranchQrCreateModal.jsx) (`BranchQrCreateModal`); [src/components/floor/qr/BranchQrExportModal.jsx](../src/components/floor/qr/BranchQrExportModal.jsx) (`BranchQrExportModal`); [src/services/floor/qr/branchQrCodes.service.js](../src/services/floor/qr/branchQrCodes.service.js) (`getBranchQrCodes`, `createBranchQrCode`, `updateBranchQrCode`, `deleteBranchQrCode`); [src/services/floor/tables.service.js](../src/services/floor/tables.service.js) (`getTables`); [src/services/restaurant/branchSalesChannels.service.js](../src/services/restaurant/branchSalesChannels.service.js) (`getBranchSalesChannels`); [src/services/floor/operationalSettings.service.js](../src/services/floor/operationalSettings.service.js) (`getOperationalSettings`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `busy`, `settingsRes`, `settingsLoaded`, `items`, `tables`, `channels`, `qrUiMeta`, `createOpen`, `exportOpen`, `alertState`.

### pages/inventory/IngredientPresentationsPage.jsx

Fuente: [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx). 909 líneas.

Exportaciones: `default: IngredientPresentationsPage`.

Dependencias internas: [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/services/inventory/ingredients/ingredientPresentations.service.js](../src/services/inventory/ingredients/ingredientPresentations.service.js) (`getIngredientPresentations`, `createIngredientPresentation`, `updateIngredientPresentation`, `deleteIngredientPresentation`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/inventory/IngredientPresentationFormModal.jsx](../src/components/inventory/IngredientPresentationFormModal.jsx) (`IngredientPresentationFormModal`); [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx) (`SupplierWizard`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `alertState`, `ingredient`, `rows`, `onlyActive`, `modalOpen`, `editRow`, `openSupplierWizard`.

### pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx

Fuente: [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx). 273 líneas.

Exportaciones: `default: IngredientInventoryMovementPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx](../src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx) (`InventoryWarehouseContextCard`); [src/components/inventory/shared/movement/InventoryMovementSummaryCards.jsx](../src/components/inventory/shared/movement/InventoryMovementSummaryCards.jsx) (`InventoryMovementSummaryCards`); [src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementFilters.jsx](../src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementFilters.jsx) (`IngredientInventoryMovementFilters`); [src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx](../src/components/inventory/ingredients/inventoryMovement/IngredientInventoryMovementTable.jsx) (`IngredientInventoryMovementTable`); [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js) (`getIngredients`); [src/services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js](../src/services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js) (`getIngredientInventoryMovements`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `warehouse`, `rows`, `ingredientOptions`, `ingredientId`, `type`, `reason`, `alertState`.

### pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx

Fuente: [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx). 321 líneas.

Exportaciones: `default: IngredientInventoryStockPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx](../src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx) (`InventoryWarehouseContextCard`); [src/components/inventory/shared/stock/InventoryStockSummaryCards.jsx](../src/components/inventory/shared/stock/InventoryStockSummaryCards.jsx) (`InventoryStockSummaryCards`); [src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockFilters.jsx](../src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockFilters.jsx) (`IngredientInventoryStockFilters`); [src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx](../src/components/inventory/ingredients/inventoryStock/IngredientInventoryStockTable.jsx) (`IngredientInventoryStockTable`); [src/services/inventory/ingredients/inventoryStock/inventoryStock.service.js](../src/services/inventory/ingredients/inventoryStock/inventoryStock.service.js) (`getIngredientInventoryStocks`); [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js) (`updateIngredient`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `warehouse`, `rows`, `q`, `onlyPositive`, `groupId`, `alertState`.

### pages/inventory/IngredientsPage.jsx

Fuente: [src/pages/inventory/IngredientsPage.jsx](../src/pages/inventory/IngredientsPage.jsx). 1055 líneas.

Exportaciones: `default: IngredientsPage`.

Dependencias internas: [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js) (`getIngredients`, `createIngredient`, `updateIngredient`, `deleteIngredient`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/inventory/IngredientFormModal.jsx](../src/components/inventory/IngredientFormModal.jsx) (`IngredientFormModal`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `alertState`, `rows`, `q`, `onlyActive`, `modalOpen`, `editRow`.

### pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx

Fuente: [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx). 284 líneas.

Exportaciones: `default: ProductInventoryMovementPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx](../src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx) (`InventoryWarehouseContextCard`); [src/components/inventory/shared/movement/InventoryMovementSummaryCards.jsx](../src/components/inventory/shared/movement/InventoryMovementSummaryCards.jsx) (`InventoryMovementSummaryCards`); [src/components/inventory/products/inventoryMovement/ProductInventoryMovementFilters.jsx](../src/components/inventory/products/inventoryMovement/ProductInventoryMovementFilters.jsx) (`ProductInventoryMovementFilters`); [src/components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx](../src/components/inventory/products/inventoryMovement/ProductInventoryMovementTable.jsx) (`ProductInventoryMovementTable`); [src/services/products/products.service.js](../src/services/products/products.service.js) (`getProducts`); [src/services/inventory/products/inventoryMovement/inventoryMovement.service.js](../src/services/inventory/products/inventoryMovement/inventoryMovement.service.js) (`getProductInventoryMovements`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `warehouse`, `rows`, `productOptions`, `productId`, `type`, `reason`, `alertState`.

### pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx

Fuente: [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx). 326 líneas.

Exportaciones: `default: ProductInventoryStockPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx](../src/components/inventory/shared/stock/InventoryWarehouseContextCard.jsx) (`InventoryWarehouseContextCard`); [src/components/inventory/shared/stock/InventoryStockSummaryCards.jsx](../src/components/inventory/shared/stock/InventoryStockSummaryCards.jsx) (`InventoryStockSummaryCards`); [src/components/inventory/products/inventoryStock/ProductInventoryStockFilters.jsx](../src/components/inventory/products/inventoryStock/ProductInventoryStockFilters.jsx) (`ProductInventoryStockFilters`); [src/components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx](../src/components/inventory/products/inventoryStock/ProductInventoryStockTable.jsx) (`ProductInventoryStockTable`); [src/services/menu/categories.service.js](../src/services/menu/categories.service.js) (`getCategories`); [src/services/inventory/products/inventoryStock/inventoryStock.service.js](../src/services/inventory/products/inventoryStock/inventoryStock.service.js) (`getProductInventoryStocks`); [src/services/products/products.service.js](../src/services/products/products.service.js) (`updateProduct`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `warehouse`, `rows`, `categories`, `q`, `categoryId`, `status`, `onlyPositive`, `alertState`.

### pages/inventory/purchases/PurchaseDetailPage.jsx

Fuente: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx). 484 líneas.

Exportaciones: `default: PurchaseDetailPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/inventory/purchases/PurchaseDetailHeader.jsx](../src/components/inventory/purchases/PurchaseDetailHeader.jsx) (`PurchaseDetailHeader`); [src/components/inventory/purchases/PurchaseMetaCard.jsx](../src/components/inventory/purchases/PurchaseMetaCard.jsx) (`PurchaseMetaCard`); [src/components/inventory/purchases/PurchaseItemsTabs.jsx](../src/components/inventory/purchases/PurchaseItemsTabs.jsx) (`PurchaseItemsTabs`); [src/components/inventory/purchases/PurchaseIngredientItemsTable.jsx](../src/components/inventory/purchases/PurchaseIngredientItemsTable.jsx) (`PurchaseIngredientItemsTable`); [src/components/inventory/purchases/PurchaseProductItemsTable.jsx](../src/components/inventory/purchases/PurchaseProductItemsTable.jsx) (`PurchaseProductItemsTable`); [src/components/inventory/purchases/PurchaseIngredientItemModal.jsx](../src/components/inventory/purchases/PurchaseIngredientItemModal.jsx) (`PurchaseIngredientItemModal`); [src/components/inventory/purchases/PurchaseProductItemModal.jsx](../src/components/inventory/purchases/PurchaseProductItemModal.jsx) (`PurchaseProductItemModal`); [src/services/inventory/purchases/purchases.service.js](../src/services/inventory/purchases/purchases.service.js) (`getPurchase`, `completePurchase`, `createPurchaseIngredientItem`, `updatePurchaseIngredientItem`, `deletePurchaseIngredientItem`, `createPurchaseProductItem`, `updatePurchaseProductItem`, `deletePurchaseProductItem`); [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js) (`getPurchasableIngredients`); [src/services/products/products.service.js](../src/services/products/products.service.js) (`getProducts`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `completing`, `purchase`, `tab`, `ingredientModalOpen`, `editingIngredientItem`, `productModalOpen`, `editingProductItem`, `ingredients`, `presentations`, `products`, `alertState`.

### pages/inventory/purchases/PurchasesPage.jsx

Fuente: [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx). 283 líneas.

Exportaciones: `default: PurchasesPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/inventory/purchases/PurchasesHeader.jsx](../src/components/inventory/purchases/PurchasesHeader.jsx) (`PurchasesHeader`); [src/components/inventory/purchases/PurchaseSummaryCards.jsx](../src/components/inventory/purchases/PurchaseSummaryCards.jsx) (`PurchaseSummaryCards`); [src/components/inventory/purchases/PurchaseFiltersCard.jsx](../src/components/inventory/purchases/PurchaseFiltersCard.jsx) (`PurchaseFiltersCard`); [src/components/inventory/purchases/PurchasesTable.jsx](../src/components/inventory/purchases/PurchasesTable.jsx) (`PurchasesTable`); [src/components/inventory/purchases/PurchaseUpsertModal.jsx](../src/components/inventory/purchases/PurchaseUpsertModal.jsx) (`PurchaseUpsertModal`); [src/services/inventory/purchases/purchases.service.js](../src/services/inventory/purchases/purchases.service.js) (`getPurchases`, `createPurchase`, `updatePurchase`, `deletePurchase`, `getPurchaseWarehouses`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/inventory/suppliers/suppliers.service.js](../src/services/inventory/suppliers/suppliers.service.js) (`getSuppliers`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `rows`, `branches`, `suppliers`, `warehouses`, `inventoryMode`, `status`, `branchId`, `supplierId`, `modalOpen`, `editingPurchase`, `alertState`.

### pages/inventory/warehouses/reports/InventoryReportPage.jsx

Fuente: [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx). 502 líneas.

Exportaciones: `default: InventoryReportPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/inventory/warehouses/reports/InventoryReportHeader.jsx](../src/components/inventory/warehouses/reports/InventoryReportHeader.jsx) (`InventoryReportHeader`); [src/components/inventory/warehouses/reports/InventoryReportFilters.jsx](../src/components/inventory/warehouses/reports/InventoryReportFilters.jsx) (`InventoryReportFilters`); [src/components/inventory/warehouses/reports/InventoryReportSummary.jsx](../src/components/inventory/warehouses/reports/InventoryReportSummary.jsx) (`InventoryReportSummary`); [src/components/inventory/warehouses/reports/InventoryReportPreview.jsx](../src/components/inventory/warehouses/reports/InventoryReportPreview.jsx) (`InventoryReportPreview`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/inventory/warehouses/warehouses.service.js](../src/services/inventory/warehouses/warehouses.service.js) (`getWarehouses`); [src/services/reports/inventoryReport.service.js](../src/services/reports/inventoryReport.service.js) (`getInventoryReportSummary`, `getInventoryReportTable`, `downloadInventoryReportExcel`, `downloadInventoryReportPdf`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loadingInitial`, `loadingReport`, `downloadingExcel`, `downloadingPdf`, `branches`, `warehouses`, `filters`, `appliedFilters`, `summary`, `stockBreakdown`, `costBreakdown`, `rows`, `pagination`, `alertState`.

### pages/inventory/warehouses/WarehousesPage.jsx

Fuente: [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx). 569 líneas.

Exportaciones: `default: WarehousesPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/inventory/warehouses/WarehousesHeader.jsx](../src/components/inventory/warehouses/WarehousesHeader.jsx) (`WarehousesHeader`); [src/components/inventory/warehouses/WarehouseInstructionsCard.jsx](../src/components/inventory/warehouses/WarehouseInstructionsCard.jsx) (`WarehouseInstructionsCard`); [src/components/inventory/warehouses/WarehouseContextCard.jsx](../src/components/inventory/warehouses/WarehouseContextCard.jsx) (`WarehouseContextCard`); [src/components/inventory/warehouses/WarehouseInventoryReportCard.jsx](../src/components/inventory/warehouses/WarehouseInventoryReportCard.jsx) (`WarehouseInventoryReportCard`); [src/components/inventory/warehouses/WarehousesListPanel.jsx](../src/components/inventory/warehouses/WarehousesListPanel.jsx) (`WarehousesListPanel`); [src/components/inventory/warehouses/WarehouseUpsertModal.jsx](../src/components/inventory/warehouses/WarehouseUpsertModal.jsx) (`WarehouseUpsertModal`); [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/inventory/warehouses/warehouses.service.js](../src/services/inventory/warehouses/warehouses.service.js) (`getWarehouses`, `createWarehouse`, `updateWarehouse`, `ensureDefaultWarehouses`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `savingDefaults`, `settings`, `branches`, `branchId`, `warehouses`, `modalOpen`, `editingWarehouse`, `alertState`.

### pages/landing/blog/BlogFilteredPostsPage.jsx

Fuente: [src/pages/landing/blog/BlogFilteredPostsPage.jsx](../src/pages/landing/blog/BlogFilteredPostsPage.jsx). 548 líneas.

Exportaciones: `default: BlogFilteredPostsPage`.

Dependencias internas: [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx) (`LandingMenu`); [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx) (`LandingFooter`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`); [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingButtonSx`, `landingColors`, `landingTypography`); [src/services/public/clicMenuBlog.service.js](../src/services/public/clicMenuBlog.service.js) (`getClicMenuBlogCategoryPosts`, `getClicMenuBlogTagPosts`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `posts`, `filterData`, `meta`, `searchInput`, `search`, `page`, `loading`, `error`.

### pages/landing/blog/BlogPostDetailPage.jsx

Fuente: [src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx). 2146 líneas.

Exportaciones: `default: BlogPostDetailPage`.

Dependencias internas: [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx) (`LandingMenu`); [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx) (`LandingFooter`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`); [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingButtonSx`, `landingColors`); [src/services/public/clicMenuBlog.service.js](../src/services/public/clicMenuBlog.service.js) (`getClicMenuBlogPost`, `getClicMenuBlogPosts`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

Estados locales (`useState`): `slideIndex`, `post`, `recentPosts`, `loading`, `error`.

### pages/landing/blog/BlogPostsPage.jsx

Fuente: [src/pages/landing/blog/BlogPostsPage.jsx](../src/pages/landing/blog/BlogPostsPage.jsx). 1379 líneas.

Exportaciones: `default: BlogPostsPage`.

Dependencias internas: [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx) (`LandingMenu`); [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx) (`LandingFooter`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`); [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingButtonSx`, `landingColors`, `landingTypography`); [src/services/public/clicMenuBlog.service.js](../src/services/public/clicMenuBlog.service.js) (`getClicMenuBlog`, `getClicMenuBlogPosts`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

Estados locales (`useState`): `blog`, `posts`, `meta`, `searchInput`, `search`, `page`, `loadingBlog`, `loadingPosts`, `error`.

### pages/landing/contact/LandingContactPage.jsx

Fuente: [src/pages/landing/contact/LandingContactPage.jsx](../src/pages/landing/contact/LandingContactPage.jsx). 409 líneas.

Exportaciones: `default: LandingContactPage`.

Dependencias internas: [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx) (`LandingMenu`); [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx) (`LandingFooter`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`); [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

### pages/landing/home/HomePage.jsx

Fuente: [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx). 332 líneas.

Exportaciones: `default: HomePage`.

Dependencias internas: [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingButtonSx`, `landingColors`, `landingTypography`); [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx) (`LandingMenu`); [src/components/landing/home/HomeSolutionsSection.jsx](../src/components/landing/home/HomeSolutionsSection.jsx) (`HomeSolutionsSection`); [src/components/landing/home/HomeDemoSection.jsx](../src/components/landing/home/HomeDemoSection.jsx) (`HomeDemoSection`); [src/components/landing/home/HomeBusinessTypesSection.jsx](../src/components/landing/home/HomeBusinessTypesSection.jsx) (`HomeBusinessTypesSection`); [src/components/landing/home/HomePlansPreviewSection.jsx](../src/components/landing/home/HomePlansPreviewSection.jsx) (`HomePlansPreviewSection`); [src/components/landing/home/HomeTestimonialsSection.jsx](../src/components/landing/home/HomeTestimonialsSection.jsx) (`HomeTestimonialsSection`); [src/components/landing/home/HomeThermalPrintingSection.jsx](../src/components/landing/home/HomeThermalPrintingSection.jsx) (`HomeThermalPrintingSection`); [src/components/landing/home/HomeFaqSection.jsx](../src/components/landing/home/HomeFaqSection.jsx) (`HomeFaqSection`); [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx) (`LandingFooter`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

### pages/landing/plans/LandingPlansPage.jsx

Fuente: [src/pages/landing/plans/LandingPlansPage.jsx](../src/pages/landing/plans/LandingPlansPage.jsx). 837 líneas.

Exportaciones: `default: LandingPlansPage`.

Dependencias internas: [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx) (`LandingMenu`); [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx) (`LandingFooter`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`); [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`); [src/services/landing/publicPlans.service.js](../src/services/landing/publicPlans.service.js) (`getPublicPlans`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

Estados locales (`useState`): `plans`, `loading`, `plansError`, `billingPeriod`.

### pages/landing/resources/ComoElegirMenuQrPage.jsx

Fuente: [src/pages/landing/resources/ComoElegirMenuQrPage.jsx](../src/pages/landing/resources/ComoElegirMenuQrPage.jsx). 426 líneas.

Exportaciones: `COMO_ELEGIR_MENU_QR_SEO`, `default: ComoElegirMenuQrPage`.

Dependencias internas: [src/pages/landing/resources/ResourceArticleLayout.jsx](../src/pages/landing/resources/ResourceArticleLayout.jsx) (`ResourceArticleLayout`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

### pages/landing/resources/MenuQrCanvaPage.jsx

Fuente: [src/pages/landing/resources/MenuQrCanvaPage.jsx](../src/pages/landing/resources/MenuQrCanvaPage.jsx). 396 líneas.

Exportaciones: `MENU_QR_CANVA_SEO`, `default: MenuQrCanvaPage`.

Dependencias internas: [src/pages/landing/resources/ResourceArticleLayout.jsx](../src/pages/landing/resources/ResourceArticleLayout.jsx) (`ResourceArticleLayout`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

### pages/landing/resources/ResourceArticle.css

Fuente: [src/pages/landing/resources/ResourceArticle.css](../src/pages/landing/resources/ResourceArticle.css). 611 líneas.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/landing/resources/ResourceArticleLayout.jsx](../src/pages/landing/resources/ResourceArticleLayout.jsx).

### pages/landing/resources/ResourceArticleLayout.jsx

Fuente: [src/pages/landing/resources/ResourceArticleLayout.jsx](../src/pages/landing/resources/ResourceArticleLayout.jsx). 81 líneas.

Exportaciones: `default: ResourceArticleLayout`.

Dependencias internas: [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx) (`LandingMenu`); [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx) (`LandingFooter`); [src/pages/landing/resources/ResourceArticle.css](../src/pages/landing/resources/ResourceArticle.css) ().

Consumidores directos: [src/pages/landing/resources/ComoElegirMenuQrPage.jsx](../src/pages/landing/resources/ComoElegirMenuQrPage.jsx), [src/pages/landing/resources/MenuQrCanvaPage.jsx](../src/pages/landing/resources/MenuQrCanvaPage.jsx).

### pages/landing/terms/LandingTermsPage.jsx

Fuente: [src/pages/landing/terms/LandingTermsPage.jsx](../src/pages/landing/terms/LandingTermsPage.jsx). 592 líneas.

Exportaciones: `default: LandingTermsPage`.

Dependencias internas: [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx) (`LandingMenu`); [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx) (`LandingFooter`); [src/components/seo/SEO.jsx](../src/components/seo/SEO.jsx) (`SEO`); [src/theme/landingTheme.js](../src/theme/landingTheme.js) (`landingColors`, `landingTypography`); [src/services/legal/legalDocuments.service.js](../src/services/legal/legalDocuments.service.js) (`getClicmenuTerms`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

Estados locales (`useState`): `terms`, `loading`, `termsError`.

### pages/management/settings/BranchSettingsPage.jsx

Fuente: [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx). 590 líneas.

Exportaciones: `default: BranchSettingsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/management/settings/BranchSettingsHeader.jsx](../src/components/management/settings/BranchSettingsHeader.jsx) (`BranchSettingsHeader`); [src/components/management/settings/BranchSettingsBranchSelector.jsx](../src/components/management/settings/BranchSettingsBranchSelector.jsx) (`BranchSettingsBranchSelector`); [src/components/management/settings/BranchSettingsFormCard.jsx](../src/components/management/settings/BranchSettingsFormCard.jsx) (`BranchSettingsFormCard`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/management/settings/branchSettings.service.js](../src/services/management/settings/branchSettings.service.js) (`getBranchWorkflowSetting`, `updateBranchWorkflowSetting`, `getBranchDirectSaleSetting`, `updateBranchDirectSaleSetting`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loadingBranches`, `loadingSettings`, `saving`, `branches`, `selectedBranchId`, `settings`, `form`, `pendingBranchId`, `alertState`.

### pages/menu/MenuManager.jsx

Fuente: [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx). 432 líneas.

Exportaciones: `default: MenuManager`.

Dependencias internas: [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js) (`getMenuSections`); [src/services/menu/categories.service.js](../src/services/menu/categories.service.js) (`getCategories`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/MenuTabs.jsx](../src/components/menu/MenuTabs.jsx) (`MenuTabs`); [src/components/menu/MenuSectionsPanel.jsx](../src/components/menu/MenuSectionsPanel.jsx) (`MenuSectionsPanel`); [src/components/menu/MenuCategoriesPanel.jsx](../src/components/menu/MenuCategoriesPanel.jsx) (`MenuCategoriesPanel`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `alertState`, `settings`, `branches`, `branchId`, `tab`, `sections`, `categories`.

### pages/menu/menus/menuChannels/MenuChannelsPage.jsx

Fuente: [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx). 640 líneas.

Exportaciones: `default: MenuChannelsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/menus/menuChannels/MenuChannelsHeader.jsx](../src/components/menu/menus/menuChannels/MenuChannelsHeader.jsx) (`MenuChannelsHeader`); [src/components/menu/menus/menuChannels/MenuChannelsInstructionsCard.jsx](../src/components/menu/menus/menuChannels/MenuChannelsInstructionsCard.jsx) (`MenuChannelsInstructionsCard`); [src/components/menu/menus/menuChannels/MenuChannelsSummaryCards.jsx](../src/components/menu/menus/menuChannels/MenuChannelsSummaryCards.jsx) (`MenuChannelsSummaryCards`); [src/components/menu/menus/menuChannels/MenuChannelsList.jsx](../src/components/menu/menus/menuChannels/MenuChannelsList.jsx) (`MenuChannelsList`); [src/components/menu/menus/menuChannels/MenuDefaultConfirmDialog.jsx](../src/components/menu/menus/menuChannels/MenuDefaultConfirmDialog.jsx) (`MenuDefaultConfirmDialog`); [src/components/menu/menus/menuChannels/menuChannels.helpers.js](../src/components/menu/menus/menuChannels/menuChannels.helpers.js) (`buildMenuChannelsPayload`, `getBackendMessage`, `getMenuChannelsSummary`, `normalizeMenuChannels`, `updateChannelDefault`, `updateChannelEnabled`); [src/services/menu/menus/menuChannels/menuChannels.service.js](../src/services/menu/menus/menuChannels/menuChannels.service.js) (`getMenuChannels`, `syncMenuChannels`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `saving`, `menu`, `channels`, `replacementChannel`, `alertState`.

### pages/menu/menus/menuContent/MenuContentPage.jsx

Fuente: [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx). 199 líneas.

Exportaciones: `default: MenuContentPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/menus/menuContent/MenuContentHeader.jsx](../src/components/menu/menus/menuContent/MenuContentHeader.jsx) (`MenuContentHeader`); [src/components/menu/menus/menuContent/MenuContentTabs.jsx](../src/components/menu/menus/menuContent/MenuContentTabs.jsx) (`MenuContentTabs`); [src/services/menu/menus/menus.service.js](../src/services/menu/menus/menus.service.js) (`getMenus`); [src/services/management/settings/branchSettings.service.js](../src/services/management/settings/branchSettings.service.js) (`getBranchWorkflowSetting`); [src/components/menu/menus/menuContent/menuContent.helpers.js](../src/components/menu/menus/menuContent/menuContent.helpers.js) (`getBackendMessage`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `menu`, `catalogMode`, `loading`, `loadFailed`, `alertState`.

### pages/menu/menus/MenuListPage.jsx

Fuente: [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx). 789 líneas.

Exportaciones: `default: MenuListPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/menus/MenusHeader.jsx](../src/components/menu/menus/MenusHeader.jsx) (`MenusHeader`); [src/components/menu/menus/MenusInstructionsCard.jsx](../src/components/menu/menus/MenusInstructionsCard.jsx) (`MenusInstructionsCard`); [src/components/menu/menus/MenuBranchSelector.jsx](../src/components/menu/menus/MenuBranchSelector.jsx) (`MenuBranchSelector`); [src/components/menu/menus/MenuFilters.jsx](../src/components/menu/menus/MenuFilters.jsx) (`MenuFilters`); [src/components/menu/menus/MenusList.jsx](../src/components/menu/menus/MenusList.jsx) (`MenusList`); [src/components/menu/menus/MenuFormDialog.jsx](../src/components/menu/menus/MenuFormDialog.jsx) (`MenuFormDialog`); [src/components/menu/menus/MenuActionDialog.jsx](../src/components/menu/menus/MenuActionDialog.jsx) (`MenuActionDialog`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/menus/menus.service.js](../src/services/menu/menus/menus.service.js) (`activateMenu`, `archiveMenu`, `createMenu`, `getMenus`, `updateMenu`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `branches`, `selectedBranchId`, `menus`, `loadingBranches`, `loadingMenus`, `search`, `statusFilter`, `formOpen`, `editingMenu`, `actionState`, `processingAction`, `busyMenuId`, `alertState`.

### pages/menu/menuSets/create/MenuSetCreatePage.jsx

Fuente: [src/pages/menu/menuSets/create/MenuSetCreatePage.jsx](../src/pages/menu/menuSets/create/MenuSetCreatePage.jsx). 410 líneas.

Exportaciones: `default: MenuSetCreatePage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/menuSets/create/MenuSetCreateForm.jsx](../src/components/menu/menuSets/create/MenuSetCreateForm.jsx) (`MenuSetCreateForm`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`createMenuSet`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `branches`, `loadingBranches`, `saving`, `form`, `errors`, `alertState`.

### pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx

Fuente: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx). 539 líneas.

Exportaciones: `default: OwnerOperationalDashboardPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/menuSets/dashboard/OwnerDashboardTabs.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardTabs.jsx) (`OwnerDashboardTabs`, `normalizeDashboardTab`); [src/components/menu/menuSets/dashboard/OwnerDashboardOverview.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardOverview.jsx) (`OwnerDashboardOverview`); [src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx) (`OwnerDashboardInventory`); [src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx) (`OwnerDashboardProducts`); [src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx) (`OwnerDashboardMenuSets`); [src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx) (`OwnerDashboardImportUpdates`); [src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardReminders.jsx) (`OwnerDashboardReminders`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/menuSets/dashboard/operationalDashboard.service.js](../src/services/menu/menuSets/dashboard/operationalDashboard.service.js) (`getOperationalDashboardOverview`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `branches`, `selectedBranchId`, `serviceDate`, `loadingBranches`, `loadingOverview`, `overview`, `alertState`.

### pages/menu/menuSets/list/MenuSetsPage.jsx

Fuente: [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx). 708 líneas.

Exportaciones: `default: MenuSetsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx) (`ContextOverview`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/menu/menuSets/list/MenuSetsList.jsx](../src/components/menu/menuSets/list/MenuSetsList.jsx) (`MenuSetsList`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`getMenuSets`, `changeMenuSetStatus`, `deleteMenuSet`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `branches`, `selectedBranchId`, `menuSets`, `loadedBranchId`, `loadingBranches`, `loadingMenuSets`, `search`, `statusFilter`, `updatingIds`, `menuSetToDelete`, `deleting`, `alertState`.

### pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx

Fuente: [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx). 712 líneas.

Exportaciones: `default: MenuSetStageDefinitionsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx) (`ContextOverview`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/menu/menuSets/manage/definitions/MenuSetStageDefinitionForm.jsx](../src/components/menu/menuSets/manage/definitions/MenuSetStageDefinitionForm.jsx) (`MenuSetStageDefinitionForm`); [src/components/menu/menuSets/manage/definitions/MenuSetStageDefinitionsList.jsx](../src/components/menu/menuSets/manage/definitions/MenuSetStageDefinitionsList.jsx) (`MenuSetStageDefinitionsList`); [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`getMenuSet`); [src/services/menu/menuSets/menuSetStageDefinition.service.js](../src/services/menu/menuSets/menuSetStageDefinition.service.js) (`getMenuSetStageDefinitions`, `createMenuSetStageDefinition`, `updateMenuSetStageDefinition`, `deleteMenuSetStageDefinition`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `menuSet`, `definitions`, `loading`, `loadFailed`, `formMode`, `editingDefinition`, `formVersion`, `saving`, `updatingId`, `definitionToDelete`, `deleting`, `alertState`.

### pages/menu/menuSets/manage/MenuSetManagePage.jsx

Fuente: [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx). 580 líneas.

Exportaciones: `default: MenuSetManagePage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/menuSets/manage/MenuSetManageTabs.jsx](../src/components/menu/menuSets/manage/MenuSetManageTabs.jsx) (`MenuSetManageTabs`, `SHOW_MENU_SET_ADMINISTRATION`); [src/components/menu/menuSets/manage/MenuSetGeneralTab.jsx](../src/components/menu/menuSets/manage/MenuSetGeneralTab.jsx) (`MenuSetGeneralTab`); [src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx](../src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx) (`MenuSetAdministrationTab`); [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx) (`MenuSetStagesTab`); [src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx](../src/components/menu/menuSets/manage/MenuSetProgrammingTab.jsx) (`MenuSetProgrammingTab`); [src/components/menu/menuSets/manage/MenuSetActivationTab.jsx](../src/components/menu/menuSets/manage/MenuSetActivationTab.jsx) (`MenuSetActivationTab`); [src/components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx](../src/components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx) (`MenuSetAvailabilityTab`); [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`getMenuSet`); [src/services/menu/menuSets/menuSetManagement.service.js](../src/services/menu/menuSets/menuSetManagement.service.js) (`getMenuSetManagement`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `menuSet`, `management`, `loading`, `loadingManagement`, `checkingActivation`, `activeTab`, `alertState`.

### pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx

Fuente: [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx). 794 líneas.

Exportaciones: `default: MenuSetStageProductsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/ContextOverview.jsx](../src/components/common/ContextOverview.jsx) (`ContextOverview`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/menu/menuSets/manage/products/MenuSetProductForm.jsx](../src/components/menu/menuSets/manage/products/MenuSetProductForm.jsx) (`MenuSetProductForm`); [src/components/menu/menuSets/manage/products/MenuSetProductsList.jsx](../src/components/menu/menuSets/manage/products/MenuSetProductsList.jsx) (`MenuSetProductsList`); [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js) (`getMenuSet`); [src/services/menu/menuSets/menuSetStage.service.js](../src/services/menu/menuSets/menuSetStage.service.js) (`getMenuSetStage`); [src/services/menu/menuSets/menuSetProduct.service.js](../src/services/menu/menuSets/menuSetProduct.service.js) (`getMenuSetEligibleProducts`, `getMenuSetStageProducts`, `createMenuSetStageProduct`, `updateMenuSetStageProduct`, `deleteMenuSetStageProduct`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `menuSet`, `stage`, `options`, `eligibleProducts`, `loading`, `loadFailed`, `eligibleLoaded`, `search`, `statusFilter`, `formMode`, `editingOption`, `formVersion`, `saving`, `updatingOptionId`, `optionToDelete`, `deleting`, `alertState`.

### pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx

Fuente: [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx). 791 líneas.

Exportaciones: `default: CompositeComponentModifierCatalogPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js) (`useModifierCatalogBase`); [src/services/menu/modifiers/modifierCatalog.service.js](../src/services/menu/modifiers/modifierCatalog.service.js) (`getProductComponentsCatalog`); [src/services/menu/modifiers/compositeComponentModifierGroups.service.js](../src/services/menu/modifiers/compositeComponentModifierGroups.service.js) (`getCompositeComponentModifierGroups`, `createCompositeComponentModifierGroup`, `updateCompositeComponentModifierGroup`, `deleteCompositeComponentModifierGroup`); [src/components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/CompositeComponentModifierGroupUpsertModal.jsx) (`CompositeComponentModifierGroupUpsertModal`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx) (`ModifierCatalogInstructionsCard`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx) (`ModifierCatalogBranchSelector`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx) (`ModifierCatalogSelectionCard`); [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx) (`ModifierAssignmentsPanel`); [src/components/menu/modifiers/catalogs/shared/catalogShared.js](../src/components/menu/modifiers/catalogs/shared/catalogShared.js) (`PAGE_SIZE`, `getBranchHelpText`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `components`, `selectedComponentId`, `componentLoading`, `assignments`, `savingMap`, `modalOpen`, `editing`, `alertState`.

### pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx

Fuente: [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx). 979 líneas.

Exportaciones: `default: CompositeComponentVariantModifierCatalogPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js) (`useModifierCatalogBase`); [src/services/menu/modifiers/modifierCatalog.service.js](../src/services/menu/modifiers/modifierCatalog.service.js) (`getProductComponentsCatalog`, `getComponentProductVariants`); [src/services/menu/modifiers/compositeComponentVariantModifierGroups.service.js](../src/services/menu/modifiers/compositeComponentVariantModifierGroups.service.js) (`getCompositeComponentVariantModifierGroups`, `createCompositeComponentVariantModifierGroup`, `updateCompositeComponentVariantModifierGroup`, `deleteCompositeComponentVariantModifierGroup`); [src/components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/CompositeComponentVariantModifierGroupUpsertModal.jsx) (`CompositeComponentVariantModifierGroupUpsertModal`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx) (`ModifierCatalogInstructionsCard`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx) (`ModifierCatalogBranchSelector`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx) (`ModifierCatalogSelectionCard`); [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx) (`ModifierAssignmentsPanel`); [src/components/menu/modifiers/catalogs/shared/catalogShared.js](../src/components/menu/modifiers/catalogs/shared/catalogShared.js) (`PAGE_SIZE`, `getBranchHelpText`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `components`, `selectedComponentId`, `componentsLoading`, `variants`, `selectedVariantId`, `variantsLoading`, `assignments`, `savingMap`, `modalOpen`, `editing`, `alertState`.

### pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx

Fuente: [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx). 621 líneas.

Exportaciones: `default: ProductModifierCatalogPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js) (`useModifierCatalogBase`); [src/services/menu/modifiers/productModifierGroups.service.js](../src/services/menu/modifiers/productModifierGroups.service.js) (`getProductModifierGroups`, `createProductModifierGroup`, `updateProductModifierGroup`, `deleteProductModifierGroup`); [src/components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/ProductModifierGroupUpsertModal.jsx) (`ProductModifierGroupUpsertModal`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx) (`ModifierCatalogInstructionsCard`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx) (`ModifierCatalogBranchSelector`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx) (`ModifierCatalogSelectionCard`); [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx) (`ModifierAssignmentsPanel`); [src/components/menu/modifiers/catalogs/shared/catalogShared.js](../src/components/menu/modifiers/catalogs/shared/catalogShared.js) (`PAGE_SIZE`, `getBranchHelpText`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `savingMap`, `modalOpen`, `editing`, `assignments`, `alertState`.

### pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx

Fuente: [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx). 775 líneas.

Exportaciones: `default: VariantModifierCatalogPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js) (`useModifierCatalogBase`); [src/services/menu/modifiers/modifierCatalog.service.js](../src/services/menu/modifiers/modifierCatalog.service.js) (`getProductVariants`); [src/services/menu/modifiers/variantModifierGroups.service.js](../src/services/menu/modifiers/variantModifierGroups.service.js) (`getVariantModifierGroups`, `createVariantModifierGroup`, `updateVariantModifierGroup`, `deleteVariantModifierGroup`); [src/components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx](../src/components/menu/modifiers/catalogs/VariantModifierGroupUpsertModal.jsx) (`VariantModifierGroupUpsertModal`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogInstructionsCard.jsx) (`ModifierCatalogInstructionsCard`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogBranchSelector.jsx) (`ModifierCatalogBranchSelector`); [src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierCatalogSelectionCard.jsx) (`ModifierCatalogSelectionCard`); [src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx](../src/components/menu/modifiers/catalogs/shared/ModifierAssignmentsPanel.jsx) (`ModifierAssignmentsPanel`); [src/components/menu/modifiers/catalogs/shared/catalogShared.js](../src/components/menu/modifiers/catalogs/shared/catalogShared.js) (`PAGE_SIZE`, `getBranchHelpText`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `variants`, `selectedVariantId`, `variantLoading`, `assignments`, `savingMap`, `modalOpen`, `editing`, `alertState`.

### pages/menu/modifiers/ModifierManager.jsx

Fuente: [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx). 514 líneas.

Exportaciones: `default: ModifierManager`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/modifiers/ModifierTabs.jsx](../src/components/menu/modifiers/ModifierTabs.jsx) (`ModifierTabs`); [src/components/menu/modifiers/ModifierGroupsPanel.jsx](../src/components/menu/modifiers/ModifierGroupsPanel.jsx) (`ModifierGroupsPanel`); [src/components/menu/modifiers/ModifierOptionsPanel.jsx](../src/components/menu/modifiers/ModifierOptionsPanel.jsx) (`ModifierOptionsPanel`); [src/components/menu/modifiers/catalogs/ModifierCatalogsDialog.jsx](../src/components/menu/modifiers/catalogs/ModifierCatalogsDialog.jsx) (`ModifierCatalogsDialog`); [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/modifiers/modifierGroups.service.js](../src/services/menu/modifiers/modifierGroups.service.js) (`getModifierGroups`); [src/services/menu/modifiers/modifierOptions.service.js](../src/services/menu/modifiers/modifierOptions.service.js) (`getAllModifierOptions`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `catalogsDialogOpen`, `alertState`, `settings`, `branches`, `branchId`, `tab`, `groups`, `options`.

### pages/menu/promotions/PromotionCreatePage.jsx

Fuente: [src/pages/menu/promotions/PromotionCreatePage.jsx](../src/pages/menu/promotions/PromotionCreatePage.jsx). 148 líneas.

Exportaciones: `default: PromotionCreatePage`.

Dependencias internas: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx) (`PromotionFormPage`); [src/services/menu/promotions/promotionForm.service.js](../src/services/menu/promotions/promotionForm.service.js) (`createPromotion`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

### pages/menu/promotions/PromotionEditPage.jsx

Fuente: [src/pages/menu/promotions/PromotionEditPage.jsx](../src/pages/menu/promotions/PromotionEditPage.jsx). 484 líneas.

Exportaciones: `default: PromotionEditPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/menu/promotions/form/PromotionFormHeader.jsx](../src/components/menu/promotions/form/PromotionFormHeader.jsx) (`PromotionFormHeader`); [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx) (`PromotionFormPage`); [src/components/menu/promotions/form/promotionForm.helpers.js](../src/components/menu/promotions/form/promotionForm.helpers.js) (`extractPromotionApiError`); [src/services/menu/promotions/promotion.service.js](../src/services/menu/promotions/promotion.service.js) (`getPromotion`, `updatePromotion`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `promotion`, `loading`, `loadError`, `reloadKey`.

### pages/menu/promotions/PromotionsPage.jsx

Fuente: [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx). 842 líneas.

Exportaciones: `default: PromotionsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/menu/promotions/list/PromotionsHeader.jsx](../src/components/menu/promotions/list/PromotionsHeader.jsx) (`PromotionsHeader`); [src/components/menu/promotions/list/PromotionsInstructionsCard.jsx](../src/components/menu/promotions/list/PromotionsInstructionsCard.jsx) (`PromotionsInstructionsCard`); [src/components/menu/promotions/list/PromotionBranchSelector.jsx](../src/components/menu/promotions/list/PromotionBranchSelector.jsx) (`PromotionBranchSelector`); [src/components/menu/promotions/list/PromotionTypeSelector.jsx](../src/components/menu/promotions/list/PromotionTypeSelector.jsx) (`PromotionTypeSelector`); [src/components/menu/promotions/list/PromotionSummaryCards.jsx](../src/components/menu/promotions/list/PromotionSummaryCards.jsx) (`PromotionSummaryCards`); [src/components/menu/promotions/list/PromotionFilters.jsx](../src/components/menu/promotions/list/PromotionFilters.jsx) (`PromotionFilters`); [src/components/menu/promotions/list/PromotionList.jsx](../src/components/menu/promotions/list/PromotionList.jsx) (`PromotionList`); [src/components/menu/promotions/list/PromotionDeleteDialog.jsx](../src/components/menu/promotions/list/PromotionDeleteDialog.jsx) (`PromotionDeleteDialog`); [src/services/menu/promotions/promotion.service.js](../src/services/menu/promotions/promotion.service.js) (`getPromotionBranches`, `getPromotions`, `changePromotionStatus`, `deletePromotion`); [src/components/menu/promotions/list/promotionList.helpers.js](../src/components/menu/promotions/list/promotionList.helpers.js) (`getPromotionSearchText`, `isPromotionCurrent`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `branches`, `selectedBranchId`, `promotions`, `loadingBranches`, `loadingPromotions`, `activeType`, `search`, `statusFilter`, `page`, `updatingIds`, `promotionToDelete`, `deleting`, `alertState`.

### pages/operation/billing-settings/BillingSettingsPage.jsx

Fuente: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx). 526 líneas.

Exportaciones: `default: BillingSettingsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/operation/billing-settings/BillingSettingsHeader.jsx](../src/components/operation/billing-settings/BillingSettingsHeader.jsx) (`BillingSettingsHeader`); [src/components/operation/billing-settings/BillingSettingsInstructionsCard.jsx](../src/components/operation/billing-settings/BillingSettingsInstructionsCard.jsx) (`BillingSettingsInstructionsCard`); [src/components/operation/billing-settings/BillingSettingsBranchSelectorCard.jsx](../src/components/operation/billing-settings/BillingSettingsBranchSelectorCard.jsx) (`BillingSettingsBranchSelectorCard`); [src/components/operation/billing-settings/BillingSettingsTabs.jsx](../src/components/operation/billing-settings/BillingSettingsTabs.jsx) (`BillingSettingsTabs`); [src/components/operation/billing-settings/rules/BillingRulesTab.jsx](../src/components/operation/billing-settings/rules/BillingRulesTab.jsx) (`BillingRulesTab`); [src/components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersTab.jsx) (`OperationalAuthorizersTab`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/operation/billing-settings/branchBillingSettings.service.js](../src/services/operation/billing-settings/branchBillingSettings.service.js) (`getBranchBillingSettings`, `updateBranchBillingSettings`); [src/services/operation/billing-settings/operationalAuthorizers.service.js](../src/services/operation/billing-settings/operationalAuthorizers.service.js) (`getBranchOperationalAuthorizers`, `getBranchOperationalAuthorizerCandidates`, `createBranchOperationalAuthorizer`, `updateBranchOperationalAuthorizer`, `deleteBranchOperationalAuthorizer`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `loadingRules`, `savingRules`, `loadingAuthorizers`, `savingAuthorizerId`, `deletingAuthorizerId`, `activeTab`, `branches`, `selectedBranchId`, `billingSetting`, `authorizers`, `candidates`, `alertState`.

### pages/operation/discounts/DiscountsPage.jsx

Fuente: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx). 636 líneas.

Exportaciones: `default: DiscountsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/operation/discounts/DiscountsHeader.jsx](../src/components/operation/discounts/DiscountsHeader.jsx) (`DiscountsHeader`); [src/components/operation/discounts/DiscountsInstructionsCard.jsx](../src/components/operation/discounts/DiscountsInstructionsCard.jsx) (`DiscountsInstructionsCard`); [src/components/operation/discounts/DiscountsBranchSelectorCard.jsx](../src/components/operation/discounts/DiscountsBranchSelectorCard.jsx) (`DiscountsBranchSelectorCard`); [src/components/operation/discounts/DiscountsTabs.jsx](../src/components/operation/discounts/DiscountsTabs.jsx) (`DiscountsTabs`); [src/components/operation/discounts/policy/DiscountPolicyTab.jsx](../src/components/operation/discounts/policy/DiscountPolicyTab.jsx) (`DiscountPolicyTab`); [src/components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersTab.jsx) (`DiscountAuthorizersTab`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/operation/discounts/discountPolicy.service.js](../src/services/operation/discounts/discountPolicy.service.js) (`getBranchDiscountPolicy`, `upsertBranchDiscountPolicy`, `deleteBranchDiscountPolicy`); [src/services/operation/discounts/discountAuthorizers.service.js](../src/services/operation/discounts/discountAuthorizers.service.js) (`getBranchDiscountAuthorizers`, `getBranchDiscountAuthorizerCandidates`, `createBranchDiscountAuthorizer`, `updateBranchDiscountAuthorizer`, `deleteBranchDiscountAuthorizer`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `loadingPolicy`, `savingPolicy`, `deletingPolicy`, `loadingAuthorizers`, `savingAuthorizerId`, `deletingAuthorizerId`, `activeTab`, `branches`, `selectedBranchId`, `policyPayload`, `authorizers`, `candidates`, `alertState`.

### pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx

Fuente: [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx). 260 líneas.

Exportaciones: `default: CustomerLoyaltySettingsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/operation/loyalty/CustomerLoyaltySettingsHeader.jsx](../src/components/operation/loyalty/CustomerLoyaltySettingsHeader.jsx) (`CustomerLoyaltySettingsHeader`); [src/components/operation/loyalty/CustomerLoyaltySettingsInstructionsCard.jsx](../src/components/operation/loyalty/CustomerLoyaltySettingsInstructionsCard.jsx) (`CustomerLoyaltySettingsInstructionsCard`); [src/components/operation/loyalty/CustomerLoyaltySettingsContextCard.jsx](../src/components/operation/loyalty/CustomerLoyaltySettingsContextCard.jsx) (`CustomerLoyaltySettingsContextCard`); [src/components/operation/loyalty/CustomerLoyaltySettingsFormCard.jsx](../src/components/operation/loyalty/CustomerLoyaltySettingsFormCard.jsx) (`CustomerLoyaltySettingsFormCard`); [src/services/operation/loyalty/customerLoyaltySettings.service.js](../src/services/operation/loyalty/customerLoyaltySettings.service.js) (`getCustomerLoyaltySettings`, `updateCustomerLoyaltySettings`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `saving`, `loyaltyData`, `form`, `alertState`.

### pages/operation/online-orders/OnlineOrdersPage.jsx

Fuente: [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx). 303 líneas.

Exportaciones: `default: OnlineOrdersPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/operation/online-orders/OnlineOrdersHeader.jsx](../src/components/operation/online-orders/OnlineOrdersHeader.jsx) (`OnlineOrdersHeader`); [src/components/operation/online-orders/OnlineOrderBranchSelector.jsx](../src/components/operation/online-orders/OnlineOrderBranchSelector.jsx) (`OnlineOrderBranchSelector`); [src/components/operation/online-orders/OnlineOrderTabs.jsx](../src/components/operation/online-orders/OnlineOrderTabs.jsx) (`OnlineOrderTabs`); [src/components/operation/online-orders/general/OnlineOrderGeneralTab.jsx](../src/components/operation/online-orders/general/OnlineOrderGeneralTab.jsx) (`OnlineOrderGeneralTab`); [src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx](../src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx) (`OnlineOrderDeliveryTab`); [src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx](../src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx) (`OnlineOrderPaymentsTab`); [src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx](../src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx) (`OnlineOrderActivationTab`); [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js) (`getOnlineOrderBranches`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `branches`, `selectedBranchId`, `activeTab`, `loadingBranches`, `loadingGeneral`, `generalSetting`, `alertState`.

### pages/operation/prepared-items/PreparedItemSettingsPage.jsx

Fuente: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx). 972 líneas.

Exportaciones: `default: PreparedItemSettingsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/operation/prepared-items/PreparedItemSettingsHeader.jsx](../src/components/operation/prepared-items/PreparedItemSettingsHeader.jsx) (`PreparedItemSettingsHeader`); [src/components/operation/prepared-items/PreparedItemInstructionsCard.jsx](../src/components/operation/prepared-items/PreparedItemInstructionsCard.jsx) (`PreparedItemInstructionsCard`); [src/components/operation/prepared-items/PreparedItemBranchSelectorCard.jsx](../src/components/operation/prepared-items/PreparedItemBranchSelectorCard.jsx) (`PreparedItemBranchSelectorCard`); [src/components/operation/prepared-items/PreparedItemGeneralSettingCard.jsx](../src/components/operation/prepared-items/PreparedItemGeneralSettingCard.jsx) (`PreparedItemGeneralSettingCard`); [src/components/operation/prepared-items/PreparedItemContextCard.jsx](../src/components/operation/prepared-items/PreparedItemContextCard.jsx) (`PreparedItemContextCard`); [src/components/operation/prepared-items/PreparedItemFiltersCard.jsx](../src/components/operation/prepared-items/PreparedItemFiltersCard.jsx) (`PreparedItemFiltersCard`); [src/components/operation/prepared-items/PreparedItemProductsPanel.jsx](../src/components/operation/prepared-items/PreparedItemProductsPanel.jsx) (`PreparedItemProductsPanel`); [src/components/operation/prepared-items/PreparedItemPolicyDialog.jsx](../src/components/operation/prepared-items/PreparedItemPolicyDialog.jsx) (`PreparedItemPolicyDialog`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/restaurant/branchCatalog.service.js](../src/services/restaurant/branchCatalog.service.js) (`getBranchCatalog`); [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js) (`getMenuSections`); [src/services/menu/categories.service.js](../src/services/menu/categories.service.js) (`getCategories`); [src/services/operation/prepared-items/preparedItemSettings.service.js](../src/services/operation/prepared-items/preparedItemSettings.service.js) (`deletePreparedProductPolicy`, `getPreparedItemSetting`, `getPreparedProductPolicies`, `updatePreparedItemSetting`, `updatePreparedProductPolicy`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `initialLoading`, `branchLoading`, `branches`, `selectedBranchId`, `rows`, `defaultMinutes`, `minutesInput`, `settingSource`, `savingSetting`, `sections`, `categories`, `sectionId`, `categoryId`, `search`, `reusableFilter`, `onlyActiveProducts`, `savingMap`, `deletingMap`, `policyDialogOpen`, `selectedPolicyRow`, `alertState`.

### pages/operation/ticket/TicketSettingsPage.jsx

Fuente: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx). 493 líneas.

Exportaciones: `default: TicketSettingsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/operation/ticket/TicketSettingsHeader.jsx](../src/components/operation/ticket/TicketSettingsHeader.jsx) (`TicketSettingsHeader`); [src/components/operation/ticket/TicketSettingsInstructionsCard.jsx](../src/components/operation/ticket/TicketSettingsInstructionsCard.jsx) (`TicketSettingsInstructionsCard`); [src/components/operation/ticket/TicketBranchSelectorCard.jsx](../src/components/operation/ticket/TicketBranchSelectorCard.jsx) (`TicketBranchSelectorCard`); [src/components/operation/ticket/TicketSettingsContextCard.jsx](../src/components/operation/ticket/TicketSettingsContextCard.jsx) (`TicketSettingsContextCard`); [src/components/operation/ticket/TicketSettingsFormCard.jsx](../src/components/operation/ticket/TicketSettingsFormCard.jsx) (`TicketSettingsFormCard`); [src/components/operation/ticket/TicketWhatsappMessageSettingsCard.jsx](../src/components/operation/ticket/TicketWhatsappMessageSettingsCard.jsx) (`TicketWhatsappMessageSettingsCard`); [src/components/operation/ticket/TicketPrintSettingsCard.jsx](../src/components/operation/ticket/TicketPrintSettingsCard.jsx) (`TicketPrintSettingsCard`); [src/components/operation/ticket/TicketSettingsTabs.jsx](../src/components/operation/ticket/TicketSettingsTabs.jsx) (`TicketSettingsTabs`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/operation/ticket/ticketSettings.service.js](../src/services/operation/ticket/ticketSettings.service.js) (`getTicketSettings`, `updateTicketSettings`); [src/services/operation/ticket/branchPrintSetting.service.js](../src/services/operation/ticket/branchPrintSetting.service.js) (`getBranchPrintSetting`, `updateBranchPrintSetting`, `deleteBranchPrintSetting`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `activeTab`, `loading`, `saving`, `branches`, `branchId`, `ticketData`, `form`, `printData`, `printOptions`, `printForm`, `savingPrint`, `alertState`.

### pages/owner/addon-history/RestaurantAddonHistoryPage.jsx

Fuente: [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx). 366 líneas.

Exportaciones: `default: RestaurantAddonHistoryPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/owner/addon-history/AddonHistoryHeader.jsx](../src/components/owner/addon-history/AddonHistoryHeader.jsx) (`AddonHistoryHeader`); [src/components/owner/addon-history/AddonTabs.jsx](../src/components/owner/addon-history/AddonTabs.jsx) (`AddonTabs`); [src/components/owner/addon-history/AddonCatalogPanel.jsx](../src/components/owner/addon-history/AddonCatalogPanel.jsx) (`AddonCatalogPanel`); [src/components/owner/addon-history/AddonHistorySummary.jsx](../src/components/owner/addon-history/AddonHistorySummary.jsx) (`AddonHistorySummary`); [src/components/owner/addon-history/AddonHistoryFilters.jsx](../src/components/owner/addon-history/AddonHistoryFilters.jsx) (`AddonHistoryFilters`); [src/components/owner/addon-history/AddonHistoryList.jsx](../src/components/owner/addon-history/AddonHistoryList.jsx) (`AddonHistoryList`); [src/services/owner/addon.service.js](../src/services/owner/addon.service.js) (`getRestaurantAddons`, `getRestaurantAddonCatalog`, `getRestaurantAddonHistory`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `historyLoading`, `tab`, `restaurant`, `branches`, `catalog`, `currentAddons`, `summary`, `rows`, `meta`, `filters`, `alertState`.

### pages/owner/billing/OwnerBillingPage.jsx

Fuente: [src/pages/owner/billing/OwnerBillingPage.jsx](../src/pages/owner/billing/OwnerBillingPage.jsx). 235 líneas.

Exportaciones: `default: OwnerBillingPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/owner/billing/OwnerBillingPurchasesTab.jsx](../src/components/owner/billing/OwnerBillingPurchasesTab.jsx) (`OwnerBillingPurchasesTab`); [src/components/owner/billing/OwnerBillingInvoicesTab.jsx](../src/components/owner/billing/OwnerBillingInvoicesTab.jsx) (`OwnerBillingInvoicesTab`); [src/components/owner/tax/OwnerTaxProfileModal.jsx](../src/components/owner/tax/OwnerTaxProfileModal.jsx) (`OwnerTaxProfileModal`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `tab`, `taxProfileOpen`, `invoicesRefreshKey`, `alertState`.

### pages/owner/RestaurantPlans.jsx

Fuente: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx). 674 líneas.

Exportaciones: `default: RestaurantPlans`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/owner/PlansHeader.jsx](../src/components/owner/PlansHeader.jsx) (`PlansHeader`); [src/components/owner/PlansStateCard.jsx](../src/components/owner/PlansStateCard.jsx) (`PlansStateCard`); [src/components/owner/PlansNoticeCard.jsx](../src/components/owner/PlansNoticeCard.jsx) (`PlansNoticeCard`); [src/components/owner/PlansCarouselControls.jsx](../src/components/owner/PlansCarouselControls.jsx) (`PlansCarouselControls`); [src/components/owner/PlanCard.jsx](../src/components/owner/PlanCard.jsx) (`PlanCard`); [src/components/owner/subscription-history/SubscriptionHistoryShortcut.jsx](../src/components/owner/subscription-history/SubscriptionHistoryShortcut.jsx) (`SubscriptionHistoryShortcut`); [src/components/owner/addon-history/AddonHistoryShortcut.jsx](../src/components/owner/addon-history/AddonHistoryShortcut.jsx) (`AddonHistoryShortcut`); [src/services/owner/plan.service.js](../src/services/owner/plan.service.js) (`getPlans`); [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`getRestaurantSubscriptionStatus`); [src/services/paypal/paypal.service.js](../src/services/paypal/paypal.service.js) (`getPayPalConfig`, `capturePayPalOrder`); [src/components/paypal/PayPalCheckoutDialog.jsx](../src/components/paypal/PayPalCheckoutDialog.jsx) (`PayPalCheckoutDialog`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `plans`, `status`, `loading`, `busyPlanId`, `visibleGroupIndex`, `confirmingPayPal`, `billingPeriod`, `paypalConfig`, `paypalDialogOpen`, `selectedPaypalPlan`, `alertState`.

### pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx

Fuente: [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx). 227 líneas.

Exportaciones: `default: RestaurantSubscriptionHistoryPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/owner/subscription-history/SubscriptionHistoryHeader.jsx](../src/components/owner/subscription-history/SubscriptionHistoryHeader.jsx) (`SubscriptionHistoryHeader`); [src/components/owner/subscription-history/SubscriptionHistorySummary.jsx](../src/components/owner/subscription-history/SubscriptionHistorySummary.jsx) (`SubscriptionHistorySummary`); [src/components/owner/subscription-history/SubscriptionHistoryFilters.jsx](../src/components/owner/subscription-history/SubscriptionHistoryFilters.jsx) (`SubscriptionHistoryFilters`); [src/components/owner/subscription-history/SubscriptionHistoryList.jsx](../src/components/owner/subscription-history/SubscriptionHistoryList.jsx) (`SubscriptionHistoryList`); [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`getRestaurantSubscriptions`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `restaurant`, `summary`, `subscriptions`, `filters`, `activeOnly`, `alertState`.

### pages/products/ProductCompositionPage.jsx

Fuente: [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx). 854 líneas.

Exportaciones: `default: ProductCompositionPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/products/CompositionWizard.jsx](../src/components/products/CompositionWizard.jsx) (`CompositionWizard`); [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/products/catalog/productComponents.service.js](../src/services/products/catalog/productComponents.service.js) (`getProductComponents`, `upsertProductComponents`); [src/services/products/products.service.js](../src/services/products/products.service.js) (`getProduct`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `err`, `alertState`, `settings`, `branches`, `uiMeta`, `product`, `items`, `wizardOpen`.

### pages/products/ProductRecipesPage.jsx

Fuente: [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx). 1143 líneas.

Exportaciones: `default: ProductRecipesPage`.

Dependencias internas: [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js) (`getIngredients`); [src/services/inventory/recipes/productRecipes.service.js](../src/services/inventory/recipes/productRecipes.service.js) (`getProductRecipes`, `setProductRecipeItemStatus`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/products/recipes/ProductRecipeEditorModal.jsx](../src/components/products/recipes/ProductRecipeEditorModal.jsx) (`ProductRecipeEditorModal`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `err`, `alertState`, `settings`, `branches`, `branchId`, `ingredients`, `product`, `baseItems`, `variants`, `editorOpen`, `editorTitle`, `editorVariantId`, `editorItems`.

### pages/products/ProductsPage.jsx

Fuente: [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx). 730 líneas.

Exportaciones: `default: ProductsPage`.

Dependencias internas: [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js) (`getMenuSections`); [src/services/menu/categories.service.js](../src/services/menu/categories.service.js) (`getCategories`); [src/services/products/products.service.js](../src/services/products/products.service.js) (`getProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`, `getProductSatMapping`, `updateProductSatMapping`, `getProductImages`, `uploadProductImage`, `deleteProductImage`, `reorderProductImages`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/products/ProductFormModal.jsx](../src/components/products/ProductFormModal.jsx) (`ProductFormModal`); [src/components/products/productsPage/ProductsPageHeader.jsx](../src/components/products/productsPage/ProductsPageHeader.jsx) (`ProductsPageHeader`); [src/components/products/productsPage/ProductsPageFilters.jsx](../src/components/products/productsPage/ProductsPageFilters.jsx) (`ProductsPageFilters`); [src/components/products/productsPage/ProductsPageList.jsx](../src/components/products/productsPage/ProductsPageList.jsx) (`ProductsPageList`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `pageBusy`, `productsLoading`, `err`, `alertState`, `settings`, `allowedProducts`, `branches`, `branchId`, `sections`, `sectionId`, `categories`, `categoryId`, `products`, `statusFilter`, `modalOpen`, `modalProduct`.

### pages/products/products_variants/ProductVariantsPage.jsx

Fuente: [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx). 1230 líneas.

Exportaciones: `default: ProductVariantsPage`.

Dependencias internas: [src/services/products/variants/productVariants.service.js](../src/services/products/variants/productVariants.service.js) (`getProductVariants`, `toggleProductVariant`, `setDefaultProductVariant`, `deleteProductVariant`); [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx) (`VariantManagementDialog`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `product`, `preconditions`, `basePrice`, `rows`, `pendingActions`, `menuAnchor`, `menuVariantRow`, `management`, `alertState`.

### pages/public/invoice/PublicInvoicePage.jsx

Fuente: [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx). 1312 líneas.

Exportaciones: `default: PublicInvoicePage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/services/public/publicInvoice.service.js](../src/services/public/publicInvoice.service.js) (`getPublicInvoice`, `stampPublicInvoice`); [src/components/public/invoice/PublicInvoiceSummaryCard.jsx](../src/components/public/invoice/PublicInvoiceSummaryCard.jsx) (`PublicInvoiceSummaryCard`); [src/components/public/invoice/PublicInvoiceStatusCard.jsx](../src/components/public/invoice/PublicInvoiceStatusCard.jsx) (`PublicInvoiceStatusCard`); [src/components/public/invoice/PublicInvoiceForm.jsx](../src/components/public/invoice/PublicInvoiceForm.jsx) (`PublicInvoiceForm`); [src/components/public/invoice/PublicInvoiceSuccessCard.jsx](../src/components/public/invoice/PublicInvoiceSuccessCard.jsx) (`PublicInvoiceSuccessCard`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `invoicePayload`, `successData`, `submitting`, `fieldErrors`, `submitError`, `coverImageLoading`, `coverImageError`, `alertState`.

### pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx

Fuente: [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx). 435 líneas.

Exportaciones: `default: PublicOnlineOrderTrackingPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/components/menu/public/PublicMenuFooter.jsx](../src/components/menu/public/PublicMenuFooter.jsx) (`PublicMenuFooter`); [src/components/public/order-tracking/OrderTrackingHeader.jsx](../src/components/public/order-tracking/OrderTrackingHeader.jsx) (`OrderTrackingHeader`); [src/components/public/order-tracking/tracking/TrackingTab.jsx](../src/components/public/order-tracking/tracking/TrackingTab.jsx) (`TrackingTab`); [src/components/public/order-tracking/order-details/OrderDetailsTab.jsx](../src/components/public/order-tracking/order-details/OrderDetailsTab.jsx) (`OrderDetailsTab`); [src/services/public/order-tracking/publicOrderTracking.service.js](../src/services/public/order-tracking/publicOrderTracking.service.js) (`getPublicOnlineOrderTracking`, `getPublicTrackingErrorMessage`, `isValidPublicTrackingToken`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `trackingData`, `loading`, `pageError`, `tab`, `alertState`.

### pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx

Fuente: [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx). 581 líneas.

Exportaciones: `default: MenuSetBuilderPage`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`); [src/hooks/menu/menu-sets/useMenuSetBuilder.js](../src/hooks/menu/menu-sets/useMenuSetBuilder.js) (`useMenuSetBuilder`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`normalizeMenuSet`); [src/hooks/menu/menu-sets/menuSetNavigationStore.js](../src/hooks/menu/menu-sets/menuSetNavigationStore.js) (`createMenuSetNavigationKey`, `getMenuSetCart`, `getMenuSetDraft`, `getMenuSetReturnPath`, `saveMenuSetCart`, `saveMenuSetDraft`, `clearMenuSetDraft`); [src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx](../src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx) (`MenuSetStageNavigation`); [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx) (`MenuSetStageContent`); [src/components/menu/shared/menu-sets/MenuSetSummary.jsx](../src/components/menu/shared/menu-sets/MenuSetSummary.jsx) (`MenuSetSummary`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `localError`, `saving`.

### pages/public/public-menu-entry/PublicCancellationRequestDialog.jsx

Fuente: [src/pages/public/public-menu-entry/PublicCancellationRequestDialog.jsx](../src/pages/public/public-menu-entry/PublicCancellationRequestDialog.jsx). 328 líneas.

Exportaciones: `default: PublicCancellationRequestDialog`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Modal`, `PillButton`).

Consumidores directos: [src/pages/public/public-menu-entry/PublicMenuModals.jsx](../src/pages/public/public-menu-entry/PublicMenuModals.jsx).

Estados locales (`useState`): `reasonCode`, `reasonNote`, `localError`.

### pages/public/public-menu-entry/PublicMenuCallToast.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuCallToast.jsx](../src/pages/public/public-menu-entry/PublicMenuCallToast.jsx). 23 líneas.

Exportaciones: `default: PublicMenuCallToast`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx](../src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx). 296 líneas.

Exportaciones: `default: PublicMenuCartDrawerBlock`.

Dependencias internas: [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx) (`MenuCartPanel`); [src/components/menu/shared/MenuCartDrawer.jsx](../src/components/menu/shared/MenuCartDrawer.jsx) (`MenuCartDrawer`); [src/components/menu/shared/cancellation/OrderCancellationSelection.jsx](../src/components/menu/shared/cancellation/OrderCancellationSelection.jsx) (`OrderCancellationSelection`, `getOrderCancellationSelectableItems`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuEmptyState.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuEmptyState.jsx](../src/pages/public/public-menu-entry/PublicMenuEmptyState.jsx). 23 líneas.

Exportaciones: `default: PublicMenuEmptyState`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/publicMenuEntry.helpers.js

Fuente: [src/pages/public/public-menu-entry/publicMenuEntry.helpers.js](../src/pages/public/public-menu-entry/publicMenuEntry.helpers.js). 79 líneas.

Exportaciones: `sleep`, `buildComponentModifierKey`, `applyComponentModifierPayloadToComponents`, `applyComponentDisplayGroupsToDetails`, `hasContextualModifiers`, `isValidHexColor`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildModifierContextSections`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuErrorState.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuErrorState.jsx](../src/pages/public/public-menu-entry/PublicMenuErrorState.jsx). 74 líneas.

Exportaciones: `default: PublicMenuErrorState`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`PUBLIC_QR_DISABLED_MSG`, `PUBLIC_QR_WRONG_MODE_MSG`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`PillButton`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuLoadingState.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuLoadingState.jsx](../src/pages/public/public-menu-entry/PublicMenuLoadingState.jsx). 42 líneas.

Exportaciones: `default: PublicMenuLoadingState`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `SkeletonCard`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuModals.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuModals.jsx](../src/pages/public/public-menu-entry/PublicMenuModals.jsx). 155 líneas.

Exportaciones: `default: PublicMenuModals`.

Dependencias internas: [src/components/menu/shared/CompositeProductModal.jsx](../src/components/menu/shared/CompositeProductModal.jsx) (`CompositeProductModal`); [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx) (`ProductExtrasModal`); [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx) (`ProductVariantsModal`); [src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx](../src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx) (`PublicOnlineOrderCheckoutModal`); [src/components/menu/public/PublicSendOrderModal.jsx](../src/components/menu/public/PublicSendOrderModal.jsx) (`PublicSendOrderModal`); [src/pages/public/public-menu-entry/PublicCancellationRequestDialog.jsx](../src/pages/public/public-menu-entry/PublicCancellationRequestDialog.jsx) (`PublicCancellationRequestDialog`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuOverlays.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuOverlays.jsx](../src/pages/public/public-menu-entry/PublicMenuOverlays.jsx). 202 líneas.

Exportaciones: `default: PublicMenuOverlays`.

Dependencias internas: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`FullOverlay`, `PillButton`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuProductsGrid.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuProductsGrid.jsx](../src/pages/public/public-menu-entry/PublicMenuProductsGrid.jsx). 96 líneas.

Exportaciones: `default: PublicMenuProductsGrid`.

Dependencias internas: [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/menu/shared/MenuProductCard.jsx](../src/components/menu/shared/MenuProductCard.jsx) (`MenuProductCard`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuWarningBlock.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuWarningBlock.jsx](../src/pages/public/public-menu-entry/PublicMenuWarningBlock.jsx). 24 líneas.

Exportaciones: `default: PublicMenuWarningBlock`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### pages/public/public-menu-entry/PublicMenuWebChannelSelector.jsx

Fuente: [src/pages/public/public-menu-entry/PublicMenuWebChannelSelector.jsx](../src/pages/public/public-menu-entry/PublicMenuWebChannelSelector.jsx). 50 líneas.

Exportaciones: `default: PublicMenuWebChannelSelector`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

### pages/public/publicMenu.ui.jsx

Fuente: [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx). 759 líneas.

Exportaciones: `Badge`, `SkeletonCard`, `PillButton`, `ProductThumb`, `CategoryChip`, `SearchBar`, `Collapse`, `FullOverlay`, `Modal`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/public/PublicMenuIdentityCard.jsx](../src/components/menu/public/PublicMenuIdentityCard.jsx), [src/components/menu/public/PublicMenuOrderActionsCard.jsx](../src/components/menu/public/PublicMenuOrderActionsCard.jsx), [src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx](../src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx), [src/components/menu/public/PublicSendOrderModal.jsx](../src/components/menu/public/PublicSendOrderModal.jsx), [src/components/menu/shared/cancellation/OrderCancellationSelection.jsx](../src/components/menu/shared/cancellation/OrderCancellationSelection.jsx), [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx), [src/components/menu/shared/CompositeProductModal.jsx](../src/components/menu/shared/CompositeProductModal.jsx), [src/components/menu/shared/menu-sets/MenuSetCard.jsx](../src/components/menu/shared/menu-sets/MenuSetCard.jsx), [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx](../src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx), [src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx](../src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx), [src/components/menu/shared/MenuCartDrawer.jsx](../src/components/menu/shared/MenuCartDrawer.jsx), [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx), [src/components/menu/shared/MenuProductCard.jsx](../src/components/menu/shared/MenuProductCard.jsx), [src/components/menu/shared/prepared-items/PreparedItemCard.jsx](../src/components/menu/shared/prepared-items/PreparedItemCard.jsx), [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx), [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx), [src/components/menu/shared/ProductInfoModal.jsx](../src/components/menu/shared/ProductInfoModal.jsx), [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx), [src/components/menu/staff/MenuHeaderCard.jsx](../src/components/menu/staff/MenuHeaderCard.jsx), [src/components/menu/staff/WaiterWarehouseCreateDialog.jsx](../src/components/menu/staff/WaiterWarehouseCreateDialog.jsx), [src/components/public/PublicOrderCartBox.jsx](../src/components/public/PublicOrderCartBox.jsx), [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx), [src/pages/public/public-menu-entry/PublicCancellationRequestDialog.jsx](../src/pages/public/public-menu-entry/PublicCancellationRequestDialog.jsx), [src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx](../src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx), [src/pages/public/public-menu-entry/PublicMenuErrorState.jsx](../src/pages/public/public-menu-entry/PublicMenuErrorState.jsx), [src/pages/public/public-menu-entry/PublicMenuLoadingState.jsx](../src/pages/public/public-menu-entry/PublicMenuLoadingState.jsx), [src/pages/public/public-menu-entry/PublicMenuOverlays.jsx](../src/pages/public/public-menu-entry/PublicMenuOverlays.jsx), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `loading`, `failed`, `isMobile`.

### pages/public/PublicMenuEntryPage.jsx

Fuente: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx). 1607 líneas.

Exportaciones: `default: PublicMenuEntryPage`.

Dependencias internas: [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/services/public/publicMenu.service.js](../src/services/public/publicMenu.service.js) (`callWaiterByTable`, `fetchPreparedItems`, `requestPublicOrderBill`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`fmtMMSS`, `translateOrderingMode`, `translateStatus`, `translateTableServiceMode`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `PillButton`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/hooks/public/usePublicMenuLoader.js](../src/hooks/public/usePublicMenuLoader.js) (`usePublicMenuLoader`); [src/hooks/public/useActiveMenuPayload.js](../src/hooks/public/useActiveMenuPayload.js) (`useActiveMenuPayload`); [src/hooks/public/useTableQrSession.js](../src/hooks/public/useTableQrSession.js) (`useTableQrSession`); [src/hooks/public/useMenuProducts.js](../src/hooks/public/useMenuProducts.js) (`useMenuProducts`); [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js) (`useCartAndOrder`); [src/hooks/public/useCompositeDrafts.js](../src/hooks/public/useCompositeDrafts.js) (`useCompositeDrafts`); [src/hooks/menu/useMenuSectionSelection.js](../src/hooks/menu/useMenuSectionSelection.js) (`useMenuSectionSelection`); [src/hooks/menu/useMenuAvailabilityRealtime.js](../src/hooks/menu/useMenuAvailabilityRealtime.js) (`useMenuAvailabilityRealtime`); [src/hooks/menu/usePreparedItemsCollection.js](../src/hooks/menu/usePreparedItemsCollection.js) (`usePreparedItemsCollection`); [src/components/menu/shared/MenuCartFloatingButton.jsx](../src/components/menu/shared/MenuCartFloatingButton.jsx) (`MenuCartFloatingButton`); [src/components/menu/shared/prepared-items/PreparedItemsSection.jsx](../src/components/menu/shared/prepared-items/PreparedItemsSection.jsx) (`PreparedItemsSection`); [src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx](../src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx) (`PublicMenuCategoryTabs`); [src/components/menu/shared/menuUi/MenuSectionTabs.jsx](../src/components/menu/shared/menuUi/MenuSectionTabs.jsx) (`MenuSectionTabs`); [src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx](../src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx) (`MenuCatalogModeLayout`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`getCatalogModeVisibility`, `normalizeCatalogMode`); [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js) (`countPublicOrderRootItems`); [src/hooks/menu/useTransientMessage.js](../src/hooks/menu/useTransientMessage.js) (`useTransientMessage`); [src/components/menu/public/PublicMenuBrandCard.jsx](../src/components/menu/public/PublicMenuBrandCard.jsx) (`PublicMenuBrandCard`); [src/components/menu/public/PublicMenuGalleryCarousel.jsx](../src/components/menu/public/PublicMenuGalleryCarousel.jsx) (`PublicMenuGalleryCarousel`); [src/components/menu/public/PublicMenuFooter.jsx](../src/components/menu/public/PublicMenuFooter.jsx) (`PublicMenuFooter`); [src/components/menu/public/PublicMenuIdentityCard.jsx](../src/components/menu/public/PublicMenuIdentityCard.jsx) (`PublicMenuIdentityCard`); [src/components/menu/public/PublicMenuOrderActionsCard.jsx](../src/components/menu/public/PublicMenuOrderActionsCard.jsx) (`PublicMenuOrderActionsCard`); [src/pages/public/public-menu-entry/PublicMenuLoadingState.jsx](../src/pages/public/public-menu-entry/PublicMenuLoadingState.jsx) (`PublicMenuLoadingState`); [src/pages/public/public-menu-entry/PublicMenuErrorState.jsx](../src/pages/public/public-menu-entry/PublicMenuErrorState.jsx) (`PublicMenuErrorState`); [src/pages/public/public-menu-entry/PublicMenuEmptyState.jsx](../src/pages/public/public-menu-entry/PublicMenuEmptyState.jsx) (`PublicMenuEmptyState`); [src/pages/public/public-menu-entry/PublicMenuOverlays.jsx](../src/pages/public/public-menu-entry/PublicMenuOverlays.jsx) (`PublicMenuOverlays`); [src/pages/public/public-menu-entry/PublicMenuModals.jsx](../src/pages/public/public-menu-entry/PublicMenuModals.jsx) (`PublicMenuModals`); [src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx](../src/pages/public/public-menu-entry/PublicMenuCartDrawerBlock.jsx) (`PublicMenuCartDrawerBlock`); [src/pages/public/public-menu-entry/PublicMenuCallToast.jsx](../src/pages/public/public-menu-entry/PublicMenuCallToast.jsx) (`PublicMenuCallToast`); [src/pages/public/public-menu-entry/PublicMenuWarningBlock.jsx](../src/pages/public/public-menu-entry/PublicMenuWarningBlock.jsx) (`PublicMenuWarningBlock`); [src/pages/public/public-menu-entry/PublicMenuProductsGrid.jsx](../src/pages/public/public-menu-entry/PublicMenuProductsGrid.jsx) (`PublicMenuProductsGrid`); [src/pages/public/public-menu-entry/publicMenuEntry.helpers.js](../src/pages/public/public-menu-entry/publicMenuEntry.helpers.js) (`sleep`, `applyComponentModifierPayloadToComponents`, `applyComponentDisplayGroupsToDetails`, `hasContextualModifiers`, `isValidHexColor`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `categoryFilter`, `q`, `compositeModalOpen`, `selectedCompositeProduct`, `variantsModalOpen`, `selectedVariantsProduct`, `cartDrawerOpen`, `cancellationRequestOpen`, `extrasModalOpen`, `selectedExtrasProduct`, `selectedExtrasVariantId`, `selectedExtrasCompositeDraft`, `selectedExtrasInitialValue`, `selectedExtrasReadOnly`, `selectedExtrasSubmitKind`, `selectedExtrasVariantObj`, `selectedExtrasSelectionScope`, `pendingCompositeComponents`, `pendingCompositeDetails`, `billRequesting`, `calling`.

### pages/public-menu/PublicMenuSettingsPage.jsx

Fuente: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx). 473 líneas.

Exportaciones: `default: PublicMenuSettingsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/public-menu/PublicMenuSettingsHeader.jsx](../src/components/public-menu/PublicMenuSettingsHeader.jsx) (`PublicMenuSettingsHeader`); [src/components/public-menu/PublicMenuInstructionsCard.jsx](../src/components/public-menu/PublicMenuInstructionsCard.jsx) (`PublicMenuInstructionsCard`); [src/components/public-menu/PublicMenuBranchSelectorCard.jsx](../src/components/public-menu/PublicMenuBranchSelectorCard.jsx) (`PublicMenuBranchSelectorCard`); [src/components/public-menu/PublicMenuContextCard.jsx](../src/components/public-menu/PublicMenuContextCard.jsx) (`PublicMenuContextCard`); [src/components/public-menu/PublicMenuSettingsFormCard.jsx](../src/components/public-menu/PublicMenuSettingsFormCard.jsx) (`PublicMenuSettingsFormCard`); [src/components/public-menu/PublicMenuCoverCard.jsx](../src/components/public-menu/PublicMenuCoverCard.jsx) (`PublicMenuCoverCard`); [src/components/public-menu/PublicMenuGalleryCard.jsx](../src/components/public-menu/PublicMenuGalleryCard.jsx) (`PublicMenuGalleryCard`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/public-menu/branchPublicMenu.service.js](../src/services/public-menu/branchPublicMenu.service.js) (`deleteBranchPublicMenuCover`, `deleteBranchPublicMenuGalleryImage`, `getBranchPublicMenuGallery`, `getBranchPublicMenuSetting`, `updateBranchPublicMenuGalleryImage`, `updateBranchPublicMenuSetting`, `uploadBranchPublicMenuCover`, `uploadBranchPublicMenuGalleryImage`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `loadingBranch`, `saving`, `branches`, `branchId`, `setting`, `gallery`, `form`, `alertState`.

### pages/reports/profit/ProfitReportPage.jsx

Fuente: [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx). 450 líneas.

Exportaciones: `default: ProfitReportPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/reports/profit/ProfitReportHeader.jsx](../src/components/reports/profit/ProfitReportHeader.jsx) (`ProfitReportHeader`); [src/components/reports/profit/ProfitReportFilters.jsx](../src/components/reports/profit/ProfitReportFilters.jsx) (`ProfitReportFilters`); [src/components/reports/profit/ProfitReportSummary.jsx](../src/components/reports/profit/ProfitReportSummary.jsx) (`ProfitReportSummary`); [src/components/reports/profit/ProfitReportPreview.jsx](../src/components/reports/profit/ProfitReportPreview.jsx) (`ProfitReportPreview`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/reports/profitReport.service.js](../src/services/reports/profitReport.service.js) (`getProfitReportSummary`, `getProfitReportTable`, `downloadProfitReportExcel`, `downloadProfitReportPdf`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loadingInitial`, `loadingReport`, `downloadingExcel`, `downloadingPdf`, `branches`, `filters`, `appliedFilters`, `summary`, `rows`, `pagination`, `alertState`.

### pages/reports/sales/SalesReportPage.jsx

Fuente: [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx). 455 líneas.

Exportaciones: `default: SalesReportPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/reports/sales/SalesReportHeader.jsx](../src/components/reports/sales/SalesReportHeader.jsx) (`SalesReportHeader`); [src/components/reports/sales/SalesReportFilters.jsx](../src/components/reports/sales/SalesReportFilters.jsx) (`SalesReportFilters`); [src/components/reports/sales/SalesReportSummary.jsx](../src/components/reports/sales/SalesReportSummary.jsx) (`SalesReportSummary`); [src/components/reports/sales/SalesReportPreview.jsx](../src/components/reports/sales/SalesReportPreview.jsx) (`SalesReportPreview`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/reports/salesReport.service.js](../src/services/reports/salesReport.service.js) (`getSalesReportSummary`, `getSalesReportTable`, `downloadSalesReportExcel`, `downloadSalesReportPdf`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loadingInitial`, `loadingReport`, `downloadingExcel`, `downloadingPdf`, `branches`, `filters`, `appliedFilters`, `summary`, `paymentBreakdown`, `rows`, `pagination`, `alertState`.

### pages/restaurant/BranchesPage.jsx

Fuente: [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx). 748 líneas.

Exportaciones: `default: BranchesPage`.

Dependencias internas: [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`, `dryRunDeleteBranch`, `deleteBranch`); [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`getRestaurant`, `setRestaurantMainBranch`); [src/services/restaurant/demoContent.service.js](../src/services/restaurant/demoContent.service.js) (`deleteDemoContent`, `getDemoContentStatus`); [src/utils/subscriptionGuards.js](../src/utils/subscriptionGuards.js) (`handleRestaurantApiError`); [src/components/restaurant/BranchUpsertModal.jsx](../src/components/restaurant/BranchUpsertModal.jsx) (`BranchUpsertModal`); [src/components/restaurant/DemoContentCard.jsx](../src/components/restaurant/DemoContentCard.jsx) (`DemoContentCard`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `saving`, `deletingBranchId`, `eliminandoContenidoDemo`, `items`, `mainBranchId`, `contenidoDemo`, `modalOpen`, `editing`, `alerta`.

### pages/restaurant/catalog/BranchCatalogPage.jsx

Fuente: [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx). 529 líneas.

Exportaciones: `default: BranchCatalogPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/catalog/CatalogHeader.jsx](../src/components/catalog/CatalogHeader.jsx) (`CatalogHeader`); [src/components/catalog/CatalogInstructionsCard.jsx](../src/components/catalog/CatalogInstructionsCard.jsx) (`CatalogInstructionsCard`); [src/components/catalog/CatalogBranchSelectorCard.jsx](../src/components/catalog/CatalogBranchSelectorCard.jsx) (`CatalogBranchSelectorCard`); [src/components/catalog/CatalogContextCard.jsx](../src/components/catalog/CatalogContextCard.jsx) (`CatalogContextCard`); [src/components/catalog/CatalogFiltersCard.jsx](../src/components/catalog/CatalogFiltersCard.jsx) (`CatalogFiltersCard`); [src/components/catalog/CatalogProductsPanel.jsx](../src/components/catalog/CatalogProductsPanel.jsx) (`CatalogProductsPanel`); [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`getRestaurantSubscriptionStatus`); [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js) (`getMenuSections`); [src/services/menu/categories.service.js](../src/services/menu/categories.service.js) (`getCategories`); [src/services/restaurant/branchCatalog.service.js](../src/services/restaurant/branchCatalog.service.js) (`getBranchCatalog`, `upsertProductOverride`, `deleteProductOverride`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `savingMap`, `mode`, `branches`, `selectedBranchId`, `sections`, `categories`, `sectionId`, `categoryId`, `rows`, `search`, `onlyActiveProducts`, `alertState`.

### pages/restaurant/MyRestaurantsHome.jsx

Fuente: [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx). 805 líneas.

Exportaciones: `default: MyRestaurantsHome`.

Dependencias internas: [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`getMyRestaurants`, `getRestaurantSubscriptionStatus`, `dryRunDeleteRestaurant`, `deleteRestaurant`); [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`useAuth`); [src/components/restaurant/RestaurantFormModal.jsx](../src/components/restaurant/RestaurantFormModal.jsx) (`RestaurantFormModal`); [src/components/owner/profile/OwnerProfileModal.jsx](../src/components/owner/profile/OwnerProfileModal.jsx) (`OwnerProfileModal`); [src/components/owner/tax/OwnerTaxProfileModal.jsx](../src/components/owner/tax/OwnerTaxProfileModal.jsx) (`OwnerTaxProfileModal`); [src/components/layout/OwnerUserMenu.jsx](../src/components/layout/OwnerUserMenu.jsx) (`OwnerUserMenu`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/referrals/ReferralDiscountModal.jsx](../src/components/referrals/ReferralDiscountModal.jsx) (`ReferralDiscountModal`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `items`, `statusMap`, `loading`, `err`, `deletingRestaurantId`, `modalOpen`, `modalMode`, `selectedRestaurant`, `profileOpen`, `taxProfileOpen`, `userMenuAnchor`, `referralModalOpen`, `alertState`.

### pages/restaurant/RestaurantEdit.jsx

Fuente: [src/pages/restaurant/RestaurantEdit.jsx](../src/pages/restaurant/RestaurantEdit.jsx). 341 líneas.

Exportaciones: `default: RestaurantEdit`.

Dependencias internas: [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`getRestaurant`, `updateRestaurant`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `busy`, `serverMsg`, `successMsg`, `restaurant`.

### pages/restaurant/RestaurantSettings.jsx

Fuente: [src/pages/restaurant/RestaurantSettings.jsx](../src/pages/restaurant/RestaurantSettings.jsx). 897 líneas.

Exportaciones: `default: RestaurantSettings`.

Dependencias internas: [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`, `upsertRestaurantSettings`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `saving`, `err`, `warn`, `successMsg`, `uiMeta`, `planAccess`, `cashRegisterReconfiguration`, `form`.

### pages/sales_channels/BranchSalesChannelsPage.jsx

Fuente: [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx). 1013 líneas.

Exportaciones: `default: BranchSalesChannelsPage`.

Dependencias internas: [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js) (`getRestaurantSubscriptionStatus`); [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/restaurant/branchSalesChannels.service.js](../src/services/restaurant/branchSalesChannels.service.js) (`getBranchSalesChannels`, `upsertBranchSalesChannel`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `loadingChannels`, `alertState`, `branches`, `selectedBranchId`, `mode`, `rows`, `savingMap`, `search`, `onlyRestaurantActive`, `onlyBranchEnabled`.

### pages/sales_channels/ChannelsProductsConfigPage.jsx

Fuente: [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx). 981 líneas.

Exportaciones: `default: ChannelProductsConfigPage`.

Dependencias internas: [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranch`); [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js) (`getMenuSections`); [src/services/menu/categories.service.js](../src/services/menu/categories.service.js) (`getCategories`); [src/services/products/sales_channels/productChannel.service.js](../src/services/products/sales_channels/productChannel.service.js) (`getChannelProducts`, `upsertChannelProduct`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/sales_channels/ChannelProductConfigModal.jsx](../src/components/sales_channels/ChannelProductConfigModal.jsx) (`ChannelProductConfigModal`); [src/components/catalog/CatalogFiltersCard.jsx](../src/components/catalog/CatalogFiltersCard.jsx) (`CatalogFiltersCard`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `savingMap`, `alertState`, `mode`, `branchName`, `channelName`, `channelCode`, `rows`, `sections`, `categories`, `sectionId`, `categoryId`, `search`, `onlyActiveProductStatus`, `open`, `editing`, `modalForm`.

### pages/sales_channels/SalesChannelsPage.jsx

Fuente: [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx). 359 líneas.

Exportaciones: `default: SalesChannelsPage`.

Dependencias internas: [src/services/products/sales_channels/sales_channels.service.js](../src/services/products/sales_channels/sales_channels.service.js) (`createSalesChannel`, `deleteSalesChannel`, `getSalesChannels`, `updateSalesChannel`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/hooks/plan/usePlanAccess.js](../src/hooks/plan/usePlanAccess.js) (`usePlanAccess`); [src/components/sales_channels/SalesChannelUpsertModal.jsx](../src/components/sales_channels/SalesChannelUpsertModal.jsx) (`SalesChannelUpsertModal`); [src/components/sales_channels/SalesChannelsHeader.jsx](../src/components/sales_channels/SalesChannelsHeader.jsx) (`SalesChannelsHeader`); [src/components/sales_channels/SalesChannelsAlerts.jsx](../src/components/sales_channels/SalesChannelsAlerts.jsx) (`SalesChannelsAlerts`); [src/components/sales_channels/SalesChannelsList.jsx](../src/components/sales_channels/SalesChannelsList.jsx) (`SalesChannelsList`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `saving`, `err`, `modalErr`, `items`, `open`, `editing`, `form`.

### pages/staff/casher/CashierDirectOrderPage.jsx

Fuente: [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx). 1539 líneas.

Exportaciones: `default: CashierDirectOrderPage`.

Dependencias internas: [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/hooks/menu/useMenuSectionSelection.js](../src/hooks/menu/useMenuSectionSelection.js) (`useMenuSectionSelection`); [src/hooks/menu/useMenuAvailabilityRealtime.js](../src/hooks/menu/useMenuAvailabilityRealtime.js) (`useMenuAvailabilityRealtime`); [src/hooks/menu/usePreparedItemsCollection.js](../src/hooks/menu/usePreparedItemsCollection.js) (`usePreparedItemsCollection`); [src/services/staff/casher/cashierDirectOrder.service.js](../src/services/staff/casher/cashierDirectOrder.service.js) (`fetchCashierDirectMenu`, `fetchCashierDirectMenuSets`, `fetchPreparedItems`); [src/hooks/public/useMenuProducts.js](../src/hooks/public/useMenuProducts.js) (`useMenuProducts`); [src/hooks/public/useCompositeDrafts.js](../src/hooks/public/useCompositeDrafts.js) (`useCompositeDrafts`); [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js) (`useCashierDirectCartAndOrder`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildModifierContextSections`); [src/components/menu/shared/MenuProductCard.jsx](../src/components/menu/shared/MenuProductCard.jsx) (`MenuProductCard`); [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx) (`ProductVariantsModal`); [src/components/menu/shared/CompositeProductModal.jsx](../src/components/menu/shared/CompositeProductModal.jsx) (`CompositeProductModal`); [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx) (`ProductExtrasModal`); [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx) (`MenuCartPanel`); [src/components/menu/shared/cartPanel/cartPanel.utils.js](../src/components/menu/shared/cartPanel/cartPanel.utils.js) (`buildOldItemsTree`); [src/components/menu/shared/MenuCartDrawer.jsx](../src/components/menu/shared/MenuCartDrawer.jsx) (`MenuCartDrawer`); [src/components/menu/shared/MenuCartFloatingButton.jsx](../src/components/menu/shared/MenuCartFloatingButton.jsx) (`MenuCartFloatingButton`); [src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx](../src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx) (`PublicMenuCategoryTabs`); [src/components/menu/shared/menuUi/MenuSectionTabs.jsx](../src/components/menu/shared/menuUi/MenuSectionTabs.jsx) (`MenuSectionTabs`); [src/components/menu/shared/prepared-items/PreparedItemsSection.jsx](../src/components/menu/shared/prepared-items/PreparedItemsSection.jsx) (`PreparedItemsSection`); [src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx](../src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx) (`MenuCatalogModeLayout`); [src/hooks/menu/menu-sets/menuSetNavigationStore.js](../src/hooks/menu/menu-sets/menuSetNavigationStore.js) (`createMenuSetNavigationKey`, `clearMenuSetNavigationState`, `getMenuSetCart`, `saveMenuSetCart`, `saveMenuSetReturnPath`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`getCatalogModeVisibility`, `normalizeMenuSetCatalog`); [src/components/staff/casher/directOrderPage/CashierDirectHeaderCard.jsx](../src/components/staff/casher/directOrderPage/CashierDirectHeaderCard.jsx) (`CashierDirectHeaderCard`); [src/components/staff/casher/directOrderPage/CashierDirectCreateOrderDialog.jsx](../src/components/staff/casher/directOrderPage/CashierDirectCreateOrderDialog.jsx) (`CashierDirectCreateOrderDialog`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `categoryFilter`, `q`, `cartDrawerOpen`, `variantsModalOpen`, `selectedVariantsProduct`, `compositeModalOpen`, `selectedCompositeProduct`, `extrasModalOpen`, `selectedExtrasProduct`, `selectedExtrasVariantId`, `selectedExtrasCompositeDraft`, `selectedExtrasInitialValue`, `selectedExtrasReadOnly`, `selectedExtrasSubmitKind`, `selectedExtrasVariantObj`, `selectedExtrasSelectionScope`, `pendingCompositeComponents`, `pendingCompositeDetails`, `loading`, `syncing`, `loadingExistingOrder`, `errorMsg`, `data`, `menuSetsPayload`, `menuSetsNotice`, `hydratedMenuSetKey`, `selectedMenuId`.

### pages/staff/casher/CashierHomePage.jsx

Fuente: [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx). 602 líneas.

Exportaciones: `default: CashierHomePage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/services/staff/casher/cashierSession.service.js](../src/services/staff/casher/cashierSession.service.js) (`fetchCashierCurrentSession`, `fetchCashierRegisters`, `openCashierSession`, `closeCashierSession`); [src/services/native/netpayBridge.service.js](../src/services/native/netpayBridge.service.js) (`getNetpayCapabilities`, `isNetpayBridgeAvailable`); [src/services/staff/casher/netpayTerminal.service.js](../src/services/staff/casher/netpayTerminal.service.js) (`syncCashierNetpayTerminal`); [src/components/staff/casher/homePage/CashierSessionHeroCard.jsx](../src/components/staff/casher/homePage/CashierSessionHeroCard.jsx) (`CashierSessionHeroCard`); [src/components/staff/casher/homePage/CashRegisterCard.jsx](../src/components/staff/casher/homePage/CashRegisterCard.jsx) (`CashRegisterCard`); [src/components/staff/casher/homePage/OpenCashSessionModal.jsx](../src/components/staff/casher/homePage/OpenCashSessionModal.jsx) (`OpenCashSessionModal`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `currentSession`, `registers`, `selectedRegister`, `openModal`, `opening`, `closing`, `leaving`, `alertState`.

### pages/staff/casher/CashierQueuePage.jsx

Fuente: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx). 1542 líneas.

Exportaciones: `default: CashierQueuePage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/services/staff/casher/cashierQueue.service.js](../src/services/staff/casher/cashierQueue.service.js) (`fetchCashierSaleQueue`, `releaseCashierBillingGroup`, `takeCashierSale`); [src/services/staff/casher/cashierOrderCheck.service.js](../src/services/staff/casher/cashierOrderCheck.service.js) (`mergeCashierChecks`, `mergeCashierTables`, `moveCashierCheckItem`, `moveCashierCheckItemQuantity`, `reopenCashierCheck`, `splitCashierCheckByProducts`, `splitCashierCheckEqualParts`, `undoCashierCheckEqualParts`); [src/services/staff/casher/cashierOperationalAuthorizer.service.js](../src/services/staff/casher/cashierOperationalAuthorizer.service.js) (`fetchCashierOperationalAuthorizers`); [src/services/staff/casher/cashierReadyNotifications.service.js](../src/services/staff/casher/cashierReadyNotifications.service.js) (`fetchCashierReadyNotifications`, `markCashierReadyNotificationRead`); [src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](../src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js) (`fetchCashierOnlineOrderNewNotifications`, `markCashierOnlineOrderNewNotificationRead`); [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js) (`getCashierPendingNetpayOperation`, `resumeCashierPendingNetpayOperation`); [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/components/staff/casher/queuePage/CashierQueueHeroCard.jsx](../src/components/staff/casher/queuePage/CashierQueueHeroCard.jsx) (`CashierQueueHeroCard`); [src/components/staff/casher/queuePage/CashierQueueTabs.jsx](../src/components/staff/casher/queuePage/CashierQueueTabs.jsx) (`CashierQueueTabs`); [src/components/staff/casher/queuePage/CashierSalesPanel.jsx](../src/components/staff/casher/queuePage/CashierSalesPanel.jsx) (`CashierSalesPanel`); [src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx](../src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx) (`CashierReadyNotificationsDrawer`); [src/components/staff/casher/queuePage/CashierReleaseSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierReleaseSaleDialog.jsx) (`CashierReleaseSaleDialog`); [src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx) (`CashierSplitSaleDialog`); [src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx) (`CashierMergeSaleDialog`); [src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx](../src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx) (`CashierOperationalAuthorizationDialog`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `queueData`, `tab`, `takingSaleId`, `releaseDialog`, `splitDialog`, `mergeDialog`, `releaseSubmitting`, `mergeSubmitting`, `splitExternalResult`, `authorizationOpen`, `authorizationLoading`, `authorizationSubmitting`, `operationalAuthorizers`, `pendingAuthorization`, `readyNotifications`, `readyBusyId`, `onlineOrderNotifications`, `onlineOrderBusyId`, `readyDrawerOpen`, `netpayResumeBusy`, `alertState`.

### pages/staff/casher/CashierSaleDetailPage.jsx

Fuente: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx). 1176 líneas.

Exportaciones: `default: CashierSaleDetailPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleDetailHeroCard.jsx) (`CashierSaleDetailHeroCard`); [src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx](../src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx) (`CashierOrderItemsCard`); [src/components/staff/casher/saleDetailPage/CashierSaleSummaryCard.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleSummaryCard.jsx) (`CashierSaleSummaryCard`); [src/components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx](../src/components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx) (`CashierPaymentFormCard`); [src/components/staff/casher/saleDetailPage/CashierTaxSelectorCard.jsx](../src/components/staff/casher/saleDetailPage/CashierTaxSelectorCard.jsx) (`CashierTaxSelectorCard`); [src/components/staff/casher/saleDetailPage/CashierDiscountCard.jsx](../src/components/staff/casher/saleDetailPage/CashierDiscountCard.jsx) (`CashierDiscountCard`); [src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx](../src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx) (`CashierAdjustmentCard`); [src/components/staff/casher/saleDetailPage/CashierCustomerCard.jsx](../src/components/staff/casher/saleDetailPage/CashierCustomerCard.jsx) (`CashierCustomerCard`); [src/components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar.jsx) (`CashierSaleOptionalActionsBar`); [src/components/staff/casher/saleDetailPage/CashierPaymentTabs.jsx](../src/components/staff/casher/saleDetailPage/CashierPaymentTabs.jsx) (`CashierPaymentTabs`); [src/components/staff/casher/saleDetailPage/CashierSaleToolDialog.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleToolDialog.jsx) (`CashierSaleToolDialog`); [src/components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog.jsx](../src/components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog.jsx) (`CashierDiscountAuthorizationDialog`); [src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx](../src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx) (`CashierPostPaymentTicketModal`); [src/components/staff/casher/prebill/CashierPrebillDialog.jsx](../src/components/staff/casher/prebill/CashierPrebillDialog.jsx) (`CashierPrebillDialog`); [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js) (`useCashierSaleDetailLoad`); [src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js](../src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js) (`useCashierSalePaymentFlow`); [src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js](../src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js) (`useCashierSaleDiscounts`); [src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js](../src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js) (`useCashierSaleAdjustments`); [src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js](../src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js) (`useCashierSaleCustomer`); [src/pages/staff/casher/saleDetail/useCashierSaleTicket.js](../src/pages/staff/casher/saleDetail/useCashierSaleTicket.js) (`useCashierSaleTicket`); [src/pages/staff/casher/saleDetail/useCashierSalePrebill.js](../src/pages/staff/casher/saleDetail/useCashierSalePrebill.js) (`useCashierSalePrebill`); [src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js](../src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js) (`MY_SALES_PATH`, `adjustmentOrderRows`, `checkIdOf`, `checkSaleIdOf`, `deriveLegacyCanOperate`, `numberOrNull`, `toArray`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `activeTool`, `paymentTab`, `itemsExpanded`, `summaryExpansionOverride`, `detailData`, `saleCheckContext`, `selectedCheck`, `selectedCheckId`, `selectedSaleId`, `preparedCheck`, `isLegacySale`, `settlement`, `paymentMethods`, `taxOptions`, `discountSummary`, `adjustmentSummary`, `customerSummary`, `taxOptionCode`, `tip`, `payments`, `globalDiscountForm`, `itemDiscountDrafts`, `partialCancelForm`, `partialCancelDrafts`, `contactForm`, `searchCustomerForm`, `customerSearchResults`, `createCustomerForm`, `cancelOrderReason`, `cancelOrderId`, `preview`, `previewing`, `paying`, `discountBusy`, `adjustmentBusy`, `customerBusy`, `searchingCustomers`, `discountAuthorizationOpen`, `discountAuthorizationPolicy`, `discountAuthorizationMessage`, `discountAuthorizationTarget`, `discountAuthorizers`, `discountAuthorizationForm`, `loadingDiscountAuthorizers`, `authorizingDiscount`, `discountAuthorizationError`, `operationalAuthorizers`, `loadingOperationalAuthorizers`, `operationalAuthorizationError`, `postPaymentOpen`, `postPaymentTicket`, `postPaymentTicketWarning`, `postPaymentTicketErrorCode`, `postPaymentTicketErrorMessage`, `postPaymentPrintConfig`, `postPaymentSale`, `postPaymentOrder`, `postPaymentTable`, `postPaymentPayments`, `postPaymentPoints`, `ticketBusy`, `alertState`.

### pages/staff/casher/customer/CashierCustomersPage.jsx

Fuente: [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx). 282 líneas.

Exportaciones: `default: CashierCustomersPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/services/staff/casher/cashierCustomerPoints.service.js](../src/services/staff/casher/cashierCustomerPoints.service.js) (`searchCashierCustomersDirectory`, `fetchCashierCustomerPointsBalance`, `fetchCashierCustomerPointsLedger`, `fetchCashierCustomerSalesHistory`); [src/components/staff/casher/customer/CashierCustomersHeroCard.jsx](../src/components/staff/casher/customer/CashierCustomersHeroCard.jsx) (`CashierCustomersHeroCard`); [src/components/staff/casher/customer/CashierCustomerLookupCard.jsx](../src/components/staff/casher/customer/CashierCustomerLookupCard.jsx) (`CashierCustomerLookupCard`); [src/components/staff/casher/customer/CashierCustomerBalanceCard.jsx](../src/components/staff/casher/customer/CashierCustomerBalanceCard.jsx) (`CashierCustomerBalanceCard`); [src/components/staff/casher/customer/CashierCustomerLedgerCard.jsx](../src/components/staff/casher/customer/CashierCustomerLedgerCard.jsx) (`CashierCustomerLedgerCard`); [src/components/staff/casher/customer/CashierCustomerSalesHistoryCard.jsx](../src/components/staff/casher/customer/CashierCustomerSalesHistoryCard.jsx) (`CashierCustomerSalesHistoryCard`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `searching`, `loadingDetail`, `filters`, `results`, `selectedCustomer`, `balanceData`, `ledgerRows`, `salesRows`, `alertState`.

### pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx

Fuente: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx). 221 líneas.

Exportaciones: `default: CashierOnlineOrderDetailPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](../src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js) (`fetchCashierOnlineOrderDetail`); [src/components/staff/casher/onlineOrders/CashierOnlineOrderDetailView.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderDetailView.jsx) (`CashierOnlineOrderDetailView`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `order`, `alertState`.

### pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx

Fuente: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx). 636 líneas.

Exportaciones: `default: CashierOnlineOrderPaymentPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard.jsx](../src/components/staff/casher/onlineOrders/paymentPage/CashierOnlineOrderPaymentHeroCard.jsx) (`CashierOnlineOrderPaymentHeroCard`); [src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx](../src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx) (`CashierOrderItemsCard`); [src/components/staff/casher/saleDetailPage/CashierSaleSummaryCard.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleSummaryCard.jsx) (`CashierSaleSummaryCard`); [src/components/staff/casher/saleDetailPage/CashierTaxSelectorCard.jsx](../src/components/staff/casher/saleDetailPage/CashierTaxSelectorCard.jsx) (`CashierTaxSelectorCard`); [src/components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx](../src/components/staff/casher/saleDetailPage/CashierPaymentFormCard.jsx) (`CashierPaymentFormCard`); [src/components/staff/casher/saleDetailPage/CashierDiscountCard.jsx](../src/components/staff/casher/saleDetailPage/CashierDiscountCard.jsx) (`CashierDiscountCard`); [src/components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleOptionalActionsBar.jsx) (`CashierSaleOptionalActionsBar`); [src/components/staff/casher/saleDetailPage/CashierPaymentTabs.jsx](../src/components/staff/casher/saleDetailPage/CashierPaymentTabs.jsx) (`CashierPaymentTabs`); [src/components/staff/casher/saleDetailPage/CashierSaleToolDialog.jsx](../src/components/staff/casher/saleDetailPage/CashierSaleToolDialog.jsx) (`CashierSaleToolDialog`); [src/components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog.jsx](../src/components/staff/casher/saleDetailPage/CashierDiscountAuthorizationDialog.jsx) (`CashierDiscountAuthorizationDialog`); [src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx](../src/components/staff/casher/ticket/CashierPostPaymentTicketModal.jsx) (`CashierPostPaymentTicketModal`); [src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js](../src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js) (`buildOnlineOrderCustomerSummary`, `filterOnlinePaymentMethods`, `flattenItemsTree`, `paymentTotalForSale`, `toArray`); [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js) (`useCashierOnlineOrderPaymentLoad`); [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js) (`useCashierOnlineOrderPaymentFlow`); [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js) (`useCashierOnlineOrderDiscounts`); [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js) (`useCashierOnlineOrderTicket`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `activeTool`, `paymentTab`, `itemsExpanded`, `summaryExpansionOverride`, `alertState`.

### pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx

Fuente: [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx). 883 líneas.

Exportaciones: `default: CashierOnlineOrdersPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](../src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js) (`acceptCashierOnlineOrder`, `cancelCashierOnlineOrder`, `confirmCashierOnlineOrderPreparation`, `deliverCashierOnlineOrder`, `fetchCashierOnlineOrderDetail`, `fetchCashierOnlineOrderNewNotifications`, `fetchCashierOnlineOrders`, `markCashierOnlineOrderNewNotificationRead`, `markCashierOnlineOrderOutForDelivery`, `markCashierOnlineOrderArrivedAtDestination`, `markCashierOnlineOrderReady`, `rejectCashierOnlineOrder`, `releaseCashierOnlineOrder`, `startCashierOnlineOrderPreparation`, `takeCashierOnlineOrder`); [src/services/staff/casher/cashierReadyNotifications.service.js](../src/services/staff/casher/cashierReadyNotifications.service.js) (`fetchCashierReadyNotifications`, `markCashierReadyNotificationRead`); [src/services/staff/casher/cashierOrderCheck.service.js](../src/services/staff/casher/cashierOrderCheck.service.js) (`reopenCashierCheck`); [src/services/staff/casher/cashierOperationalAuthorizer.service.js](../src/services/staff/casher/cashierOperationalAuthorizer.service.js) (`fetchCashierOperationalAuthorizers`); [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js) (`getCashierPendingNetpayOperation`, `resumeCashierPendingNetpayOperation`); [src/components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersHeroCard.jsx) (`CashierOnlineOrdersHeroCard`); [src/components/staff/casher/onlineOrders/CashierOnlineOrdersTabs.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersTabs.jsx) (`CashierOnlineOrdersTabs`); [src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx) (`CashierOnlineOrdersPanel`); [src/components/staff/casher/onlineOrders/CashierOnlineOrderActionDialog.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderActionDialog.jsx) (`CashierOnlineOrderActionDialog`); [src/components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrderCancellationDialog.jsx) (`CashierOnlineOrderCancellationDialog`); [src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx](../src/components/staff/casher/authorization/CashierOperationalAuthorizationDialog.jsx) (`CashierOperationalAuthorizationDialog`); [src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx](../src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx) (`CashierReadyNotificationsDrawer`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `data`, `tab`, `busyOrderId`, `busyAction`, `dialogAction`, `dialogOrder`, `cancellationOrder`, `cancellationDetail`, `cancellationDetailLoading`, `cancellationAuthorizers`, `cancellationAuthorizersLoading`, `cancellationSubmitting`, `reopenAuthorizationOpen`, `reopenAuthorizationLoading`, `reopenAuthorizationSubmitting`, `reopenAuthorizers`, `reopenOrder`, `netpayResumeBusy`, `readyNotifications`, `readyBusyId`, `onlineOrderNotifications`, `onlineOrderBusyId`, `noticesDrawerOpen`, `alertState`.

### pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js

Fuente: [src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js](../src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js). 193 líneas.

Exportaciones: `MY_ONLINE_ORDERS_PATH`, `PAYMENT_ACTIONS`, `POLL_INTERVAL`, `toArray`, `numberOrNull`, `round2`, `createPageError`, `pickErr`, `pickCode`, `pickErrorPayload`, `resolveOnlineOrderPayload`, `flattenItemsTree`, `buildFinancialSale`, `buildFinancialCheck`, `buildDefaultTaxCode`, `paymentTotalForSale`, `formatPaymentAmountValue`, `buildOnlineOrderCustomerSummary`, `onlinePaymentMethodCodes`, `filterOnlinePaymentMethods`, `resolveInitialOnlinePaymentMethodId`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js).

### pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js

Fuente: [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js). 621 líneas.

Exportaciones: `default: useCashierOnlineOrderDiscounts`.

Dependencias internas: [src/services/staff/casher/cashierDiscount.service.js](../src/services/staff/casher/cashierDiscount.service.js) (`applyCashierSaleGlobalDiscount`, `applyCashierSaleItemDiscount`, `fetchCashierDiscountAuthorizers`, `fetchCashierSaleDiscountSummary`, `removeCashierSaleGlobalDiscount`, `removeCashierSaleItemDiscount`); [src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js](../src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js) (`formatPaymentAmountValue`, `paymentTotalForSale`, `pickCode`, `pickErr`, `pickErrorPayload`, `toArray`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Estados locales (`useState`): `discountSummary`, `discountBusy`, `globalDiscountForm`, `itemDiscountDrafts`, `discountAuthorizationOpen`, `discountAuthorizationPolicy`, `discountAuthorizationMessage`, `discountAuthorizationTarget`, `discountAuthorizers`, `discountAuthorizationForm`, `loadingDiscountAuthorizers`, `authorizingDiscount`, `discountAuthorizationError`.

### pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js

Fuente: [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js). 1249 líneas.

Exportaciones: `default: useCashierOnlineOrderPaymentFlow`.

Dependencias internas: [src/services/staff/casher/cashierSaleCheck.service.js](../src/services/staff/casher/cashierSaleCheck.service.js) (`prepareCashierSaleCheckPayment`); [src/services/staff/casher/cashierPayment.service.js](../src/services/staff/casher/cashierPayment.service.js) (`payCashierSale`, `previewCashierSalePayment`); [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js) (`executeCashierNetpayPayment`, `getCashierNetpayError`, `getCashierPendingNetpayOperation`, `getCashierUnresolvedNetpayPayment`, `previewCashierNetpayPayment`, `resumeCashierPendingNetpayOperation`, `resumeCashierUnresolvedNetpayPayment`); [src/services/native/netpayBridge.service.js](../src/services/native/netpayBridge.service.js) (`isNetpayBridgeAvailable`); [src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js](../src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js) (`createPageError`, `formatPaymentAmountValue`, `paymentTotalForSale`, `pickCode`, `pickErr`, `toArray`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Estados locales (`useState`): `previewing`, `paying`, `netpayMode`, `netpayPending`, `netpayDevicePending`, `netpayRecoveryAvailable`, `netpayPendingMessage`, `netpayStatus`, `netpayTerminal`.

### pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js

Fuente: [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js). 396 líneas.

Exportaciones: `default: useCashierOnlineOrderPaymentLoad`.

Dependencias internas: [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](../src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js) (`fetchCashierOnlineOrderDetail`); [src/services/staff/casher/cashierPayment.service.js](../src/services/staff/casher/cashierPayment.service.js) (`fetchCashierPaymentMethods`, `fetchCashierTaxOptions`); [src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js](../src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js) (`MY_ONLINE_ORDERS_PATH`, `PAYMENT_ACTIONS`, `POLL_INTERVAL`, `buildDefaultTaxCode`, `buildFinancialCheck`, `buildFinancialSale`, `createPageError`, `filterOnlinePaymentMethods`, `formatPaymentAmountValue`, `numberOrNull`, `paymentTotalForSale`, `pickCode`, `pickErr`, `resolveInitialOnlinePaymentMethodId`, `resolveOnlineOrderPayload`, `toArray`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Estados locales (`useState`): `loading`, `onlineOrder`, `selectedCheck`, `sale`, `cashSession`, `itemsTree`, `paymentMethods`, `taxOptions`, `taxOptionCode`, `tip`, `payments`, `preview`.

### pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js

Fuente: [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js). 455 líneas.

Exportaciones: `default: useCashierOnlineOrderTicket`.

Dependencias internas: [src/services/staff/casher/cashierPayment.service.js](../src/services/staff/casher/cashierPayment.service.js) (`extractTicketFromPayResponse`, `extractTicketWarningFromPayResponse`); [src/services/staff/casher/cashierTicket.service.js](../src/services/staff/casher/cashierTicket.service.js) (`fetchCashierTicketById`, `fetchCashierSaleTicketPrintConfig`, `fetchCashierSaleTicketPrintPayload`, `openCashierTicketHtmlInNewTab`, `openCashierTicketWindow`, `printCashierTicketFromHtml`, `saveCashierTicketPdf`, `sendCashierSaleTicketWhatsapp`, `sendCashierThermalPrintPayload`); [src/services/staff/casher/cashierNetpayVoucherReprint.service.js](../src/services/staff/casher/cashierNetpayVoucherReprint.service.js) (`executeCashierNetpayVoucherReprint`, `getCashierNetpayVoucherReprintError`); [src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js](../src/pages/staff/casher/onlineOrders/payment/cashierOnlineOrderPayment.utils.js) (`pickErr`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx).

Estados locales (`useState`): `settlement`, `postPaymentOpen`, `postPaymentTicket`, `postPaymentTicketWarning`, `postPaymentTicketErrorCode`, `postPaymentTicketErrorMessage`, `postPaymentPrintConfig`, `postPaymentSale`, `postPaymentOrder`, `ticketBusy`.

### pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx

Fuente: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx). 1044 líneas.

Exportaciones: `default: CashierRefundsHistoryPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/services/staff/casher/cashierRefunds.service.js](../src/services/staff/casher/cashierRefunds.service.js) (`fetchCashierRefundSalesHistory`, `fetchCashierSaleRefundSummary`, `refundCashierSaleFull`); [src/services/staff/casher/cashierNetpayCancellation.service.js](../src/services/staff/casher/cashierNetpayCancellation.service.js) (`executeCashierNetpayCancellation`, `resumeCashierPendingNetpayCancellation`); [src/services/staff/casher/cashierNetpayVoucherReprint.service.js](../src/services/staff/casher/cashierNetpayVoucherReprint.service.js) (`executeCashierNetpayVoucherReprint`, `getCashierNetpayVoucherReprintError`, `resumeCashierPendingNetpayVoucherReprint`); [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js) (`getCashierPendingNetpayOperation`); [src/services/staff/casher/cashierTicket.service.js](../src/services/staff/casher/cashierTicket.service.js) (`sendCashierSaleTicketWhatsapp`, `fetchCashierSaleTicketPrintConfig`, `fetchCashierSaleTicketPrintPayload`, `sendCashierThermalPrintPayload`); [src/components/staff/casher/refunds/CashierRefundsHeroCard.jsx](../src/components/staff/casher/refunds/CashierRefundsHeroCard.jsx) (`CashierRefundsHeroCard`); [src/components/staff/casher/refunds/CashierRefundHistoryFiltersCard.jsx](../src/components/staff/casher/refunds/CashierRefundHistoryFiltersCard.jsx) (`CashierRefundHistoryFiltersCard`); [src/components/staff/casher/refunds/CashierRefundSalesPanel.jsx](../src/components/staff/casher/refunds/CashierRefundSalesPanel.jsx) (`CashierRefundSalesPanel`); [src/components/staff/casher/refunds/CashierRefundTicketActionsDialog.jsx](../src/components/staff/casher/refunds/CashierRefundTicketActionsDialog.jsx) (`CashierRefundTicketActionsDialog`); [src/components/staff/casher/refunds/CashierRefundSaleDetailDialog.jsx](../src/components/staff/casher/refunds/CashierRefundSaleDetailDialog.jsx) (`CashierRefundSaleDetailDialog`); [src/components/staff/casher/refunds/CashierRefundFullCancelDialog.jsx](../src/components/staff/casher/refunds/CashierRefundFullCancelDialog.jsx) (`CashierRefundFullCancelDialog`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `rows`, `ticketActionsSale`, `sendingWhatsapp`, `thermalPrintSaleId`, `voucherReprintSaleId`, `thermalConfig`, `detailOpen`, `cancelOpen`, `selectedSummary`, `summaryLoading`, `cancelReason`, `cancelBusy`, `filters`, `alertState`.

### pages/staff/casher/saleDetail/cashierSaleDetail.utils.js

Fuente: [src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js](../src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js). 272 líneas.

Exportaciones: `MY_SALES_PATH`, `toArray`, `numberOrNull`, `checkIdOf`, `checkSaleIdOf`, `normalizeCheckItem`, `buildCheckItemsTree`, `buildCheckItemsSummary`, `buildExactCheckDetail`, `adjustmentOrderRows`, `deriveLegacyCanOperate`, `buildDefaultTaxCode`, `formatPaymentAmountValue`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx), [src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js](../src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js), [src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js](../src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js), [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js), [src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js](../src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js), [src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js](../src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js).

### pages/staff/casher/saleDetail/useCashierSaleAdjustments.js

Fuente: [src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js](../src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js). 322 líneas.

Exportaciones: `default: useCashierSaleAdjustments`.

Dependencias internas: [src/services/staff/casher/cashierAdjustment.service.js](../src/services/staff/casher/cashierAdjustment.service.js) (`cancelCashierSaleItems`, `cancelCashierSaleOrder`); [src/services/staff/casher/cashierOperationalAuthorizer.service.js](../src/services/staff/casher/cashierOperationalAuthorizer.service.js) (`fetchCashierOperationalAuthorizers`); [src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js](../src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js) (`MY_SALES_PATH`, `toArray`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

### pages/staff/casher/saleDetail/useCashierSaleCustomer.js

Fuente: [src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js](../src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js). 285 líneas.

Exportaciones: `default: useCashierSaleCustomer`.

Dependencias internas: [src/services/staff/casher/cashierCustomer.service.js](../src/services/staff/casher/cashierCustomer.service.js) (`searchCashierCustomers`, `createCashierCustomer`, `saveCashierSaleContactData`, `removeCashierSaleContactData`, `attachCashierSaleCustomer`, `detachCashierSaleCustomer`); [src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js](../src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js) (`toArray`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

### pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js

Fuente: [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js). 557 líneas.

Exportaciones: `default: useCashierSaleDetailLoad`.

Dependencias internas: [src/services/staff/casher/cashierQueue.service.js](../src/services/staff/casher/cashierQueue.service.js) (`fetchCashierSaleDetail`); [src/services/staff/casher/cashierSaleCheck.service.js](../src/services/staff/casher/cashierSaleCheck.service.js) (`fetchCashierSaleCheckContext`, `fetchCashierSaleCheckDetail`); [src/services/staff/casher/cashierPayment.service.js](../src/services/staff/casher/cashierPayment.service.js) (`fetchCashierPaymentMethods`, `fetchCashierTaxOptions`); [src/services/staff/casher/cashierDiscount.service.js](../src/services/staff/casher/cashierDiscount.service.js) (`fetchCashierSaleDiscountSummary`); [src/services/staff/casher/cashierAdjustment.service.js](../src/services/staff/casher/cashierAdjustment.service.js) (`fetchCashierSaleAdjustments`); [src/services/staff/casher/cashierCustomer.service.js](../src/services/staff/casher/cashierCustomer.service.js) (`fetchCashierSaleCustomerData`); [src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js](../src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js) (`MY_SALES_PATH`, `adjustmentOrderRows`, `buildDefaultTaxCode`, `buildExactCheckDetail`, `checkIdOf`, `checkSaleIdOf`, `deriveLegacyCanOperate`, `formatPaymentAmountValue`, `numberOrNull`, `toArray`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

### pages/staff/casher/saleDetail/useCashierSaleDiscounts.js

Fuente: [src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js](../src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js). 586 líneas.

Exportaciones: `default: useCashierSaleDiscounts`.

Dependencias internas: [src/services/staff/casher/cashierDiscount.service.js](../src/services/staff/casher/cashierDiscount.service.js) (`fetchCashierDiscountAuthorizers`, `applyCashierSaleGlobalDiscount`, `removeCashierSaleGlobalDiscount`, `applyCashierSaleItemDiscount`, `removeCashierSaleItemDiscount`); [src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js](../src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js) (`toArray`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

### pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js

Fuente: [src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js](../src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js). 1575 líneas.

Exportaciones: `default: useCashierSalePaymentFlow`.

Dependencias internas: [src/services/staff/casher/cashierPayment.service.js](../src/services/staff/casher/cashierPayment.service.js) (`previewCashierSalePayment`, `payCashierSale`, `extractTicketFromPayResponse`, `extractTicketWarningFromPayResponse`); [src/services/staff/casher/cashierSaleCheck.service.js](../src/services/staff/casher/cashierSaleCheck.service.js) (`prepareCashierSaleCheckPayment`); [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js) (`executeCashierNetpayPayment`, `getCashierNetpayError`, `getCashierPendingNetpayOperation`, `getCashierUnresolvedNetpayPayment`, `previewCashierNetpayPayment`, `resumeCashierPendingNetpayOperation`, `resumeCashierUnresolvedNetpayPayment`); [src/services/native/netpayBridge.service.js](../src/services/native/netpayBridge.service.js) (`isNetpayBridgeAvailable`); [src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js](../src/pages/staff/casher/saleDetail/cashierSaleDetail.utils.js) (`MY_SALES_PATH`, `checkIdOf`, `formatPaymentAmountValue`, `numberOrNull`, `toArray`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

Estados locales (`useState`): `previewMode`, `netpayMode`, `netpayBusy`, `netpayStatus`, `netpayPendingBlocked`, `netpayRecoveryAvailable`, `netpayPendingMessage`, `netpayTerminal`.

### pages/staff/casher/saleDetail/useCashierSalePrebill.js

Fuente: [src/pages/staff/casher/saleDetail/useCashierSalePrebill.js](../src/pages/staff/casher/saleDetail/useCashierSalePrebill.js). 187 líneas.

Exportaciones: `default: useCashierSalePrebill`.

Dependencias internas: [src/services/staff/casher/cashierPrebill.service.js](../src/services/staff/casher/cashierPrebill.service.js) (`fetchCashierPrebillPrintPayload`, `sendCashierPrebillWhatsapp`); [src/services/staff/casher/cashierTicket.service.js](../src/services/staff/casher/cashierTicket.service.js) (`sendCashierThermalPrintPayload`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

Estados locales (`useState`): `prebillOpen`, `prebillPrinting`, `prebillWhatsappSending`.

### pages/staff/casher/saleDetail/useCashierSaleTicket.js

Fuente: [src/pages/staff/casher/saleDetail/useCashierSaleTicket.js](../src/pages/staff/casher/saleDetail/useCashierSaleTicket.js). 341 líneas.

Exportaciones: `default: useCashierSaleTicket`.

Dependencias internas: [src/services/staff/casher/cashierTicket.service.js](../src/services/staff/casher/cashierTicket.service.js) (`fetchCashierTicketById`, `openCashierTicketHtmlInNewTab`, `printCashierTicketFromHtml`, `saveCashierTicketPdf`, `openCashierTicketWindow`, `sendCashierSaleTicketWhatsapp`, `fetchCashierSaleTicketPrintConfig`, `fetchCashierSaleTicketPrintPayload`, `sendCashierThermalPrintPayload`); [src/services/staff/casher/cashierNetpayVoucherReprint.service.js](../src/services/staff/casher/cashierNetpayVoucherReprint.service.js) (`executeCashierNetpayVoucherReprint`, `getCashierNetpayVoucherReprintError`).

Consumidores directos: [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx).

### pages/staff/CashRegistersPage.jsx

Fuente: [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx). 1097 líneas.

Exportaciones: `default: CashRegistersPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/staff/CashRegisterUpsertModal.jsx](../src/components/staff/CashRegisterUpsertModal.jsx) (`CashRegisterUpsertModal`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/staff/cashRegisters.service.js](../src/services/staff/cashRegisters.service.js) (`getCashRegistersOverview`, `createCashRegister`, `updateCashRegister`, `deleteCashRegister`, `getRestaurantPlanAccess`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `branches`, `cashRegisters`, `planAccess`, `cashRegisterMeta`, `warehouseOptionsByBranch`, `savingMap`, `modalOpen`, `editing`, `alertState`.

### pages/staff/kitchen/KitchenDashboard.jsx

Fuente: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx). 967 líneas.

Exportaciones: `default: KitchenDashboard`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/services/staff/staffAuth.service.js](../src/services/staff/staffAuth.service.js) (`staffContext`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/services/staff/kitchen/kitchenKds.service.js](../src/services/staff/kitchen/kitchenKds.service.js) (`fetchKitchenKdsOrders`, `startKitchenItem`, `readyKitchenItem`, `notifyKitchenOrderReady`); [src/services/staff/kitchen/kitchenPreparedItems.service.js](../src/services/staff/kitchen/kitchenPreparedItems.service.js) (`finishKitchenPreparedItem`, `confirmKitchenPreparedItemReturn`, `markKitchenPreparedItemUnfit`, `retireExpiredKitchenPreparedItem`); [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/components/staff/kitchen/KitchenTopbar.jsx](../src/components/staff/kitchen/KitchenTopbar.jsx) (`KitchenTopbar`); [src/components/staff/kitchen/KitchenTabs.jsx](../src/components/staff/kitchen/KitchenTabs.jsx) (`KitchenTabs`); [src/components/staff/kitchen/KitchenEmptyState.jsx](../src/components/staff/kitchen/KitchenEmptyState.jsx) (`KitchenEmptyState`); [src/components/staff/kitchen/KitchenOrderCard.jsx](../src/components/staff/kitchen/KitchenOrderCard.jsx) (`KitchenOrderCard`); [src/components/staff/kitchen/KitchenWarehouseSelectorDialog.jsx](../src/components/staff/kitchen/KitchenWarehouseSelectorDialog.jsx) (`KitchenWarehouseSelectorDialog`); [src/components/staff/kitchen/KitchenPreparedItemsDrawer.jsx](../src/components/staff/kitchen/KitchenPreparedItemsDrawer.jsx) (`KitchenPreparedItemsDrawer`); [src/components/staff/kitchen/kitchen.helpers.js](../src/components/staff/kitchen/kitchen.helpers.js) (`buildConsumptionUi`, `buildKitchenInventoryError`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `busy`, `err`, `okMsg`, `ctx`, `tab`, `orders`, `recovery`, `preparedDrawerOpen`, `notifyingOrderId`, `busyItemIds`, `preparedBusyItemIds`, `itemConsumptionState`, `warehouseDialogState`.

### pages/staff/RestaurantStaffPage.jsx

Fuente: [src/pages/staff/RestaurantStaffPage.jsx](../src/pages/staff/RestaurantStaffPage.jsx). 586 líneas.

Exportaciones: `default: StaffPage`.

Dependencias internas: [src/services/staff/staff.service.js](../src/services/staff/staff.service.js) (`getStaff`, `deleteStaff`); [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/components/staff/StaffUpsertModal.jsx](../src/components/staff/StaffUpsertModal.jsx) (`StaffUpsertModal`); [src/components/staff/StaffAssignmentsModal.jsx](../src/components/staff/StaffAssignmentsModal.jsx) (`StaffAssignmentsModal`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `err`, `items`, `attentionMode`, `upsertOpen`, `editing`, `assignOpen`, `assignUser`.

### pages/staff/StaffLogin.jsx

Fuente: [src/pages/staff/StaffLogin.jsx](../src/pages/staff/StaffLogin.jsx). 285 líneas.

Exportaciones: `default: StaffLogin`.

Dependencias internas: [src/components/auth/AuthBrandPanel.jsx](../src/components/auth/AuthBrandPanel.jsx) (`AuthBrandPanel`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `err`, `busy`.

### pages/staff/StaffSelectBranch.jsx

Fuente: [src/pages/staff/StaffSelectBranch.jsx](../src/pages/staff/StaffSelectBranch.jsx). 199 líneas.

Exportaciones: `default: StaffSelectBranch`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/services/staff/staffAuth.service.js](../src/services/staff/staffAuth.service.js) (`staffBranches`, `staffSelectBranch`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`).

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

Estados locales (`useState`): `busy`, `saving`, `loggingOut`, `err`, `contexts`.

### pages/staff/StaffSelectContext.jsx

Fuente: [src/pages/staff/StaffSelectContext.jsx](../src/pages/staff/StaffSelectContext.jsx). 782 líneas.

Exportaciones: `default: StaffSelectContext`.

Dependencias internas: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `busy`, `loggingOut`, `err`.

### pages/staff/waiter/StaffMenuEntryPage.jsx

Fuente: [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx). 1876 líneas.

Exportaciones: `default: StaffMenuEntryPage`.

Dependencias internas: [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/services/staff/waiter/staffOrders.service.js](../src/services/staff/waiter/staffOrders.service.js) (`fetchPreparedItems`, `fetchStaffWaiterMenu`, `fetchStaffWaiterMenuSets`); [src/pages/public/publicMenu.ui.jsx](../src/pages/public/publicMenu.ui.jsx) (`Badge`, `Modal`, `PillButton`, `SkeletonCard`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/public/useMenuProducts.js](../src/hooks/public/useMenuProducts.js) (`useMenuProducts`); [src/hooks/menu/useMenuSectionSelection.js](../src/hooks/menu/useMenuSectionSelection.js) (`useMenuSectionSelection`); [src/hooks/menu/useMenuAvailabilityRealtime.js](../src/hooks/menu/useMenuAvailabilityRealtime.js) (`useMenuAvailabilityRealtime`); [src/hooks/menu/usePreparedItemsCollection.js](../src/hooks/menu/usePreparedItemsCollection.js) (`usePreparedItemsCollection`); [src/hooks/public/useCompositeDrafts.js](../src/hooks/public/useCompositeDrafts.js) (`useCompositeDrafts`); [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js) (`useStaffCartAndOrder`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildModifierContextSections`, `money`); [src/components/menu/staff/MenuHeaderCard.jsx](../src/components/menu/staff/MenuHeaderCard.jsx) (`MenuHeaderCard`); [src/components/menu/staff/WaiterWarehouseCreateDialog.jsx](../src/components/menu/staff/WaiterWarehouseCreateDialog.jsx) (`WaiterWarehouseCreateDialog`); [src/components/menu/staff/WaiterCancellationDialog.jsx](../src/components/menu/staff/WaiterCancellationDialog.jsx) (`WaiterCancellationDialog`); [src/components/menu/shared/MenuProductCard.jsx](../src/components/menu/shared/MenuProductCard.jsx) (`MenuProductCard`); [src/components/menu/shared/prepared-items/PreparedItemsSection.jsx](../src/components/menu/shared/prepared-items/PreparedItemsSection.jsx) (`PreparedItemsSection`); [src/components/menu/shared/cancellation/OrderCancellationSelection.jsx](../src/components/menu/shared/cancellation/OrderCancellationSelection.jsx) (`OrderCancellationSelection`, `getOrderCancellationSelectableItems`); [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx) (`ProductVariantsModal`); [src/components/menu/shared/CompositeProductModal.jsx](../src/components/menu/shared/CompositeProductModal.jsx) (`CompositeProductModal`); [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx) (`ProductExtrasModal`); [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx) (`MenuCartPanel`); [src/components/menu/shared/MenuCartDrawer.jsx](../src/components/menu/shared/MenuCartDrawer.jsx) (`MenuCartDrawer`); [src/components/menu/shared/MenuCartFloatingButton.jsx](../src/components/menu/shared/MenuCartFloatingButton.jsx) (`MenuCartFloatingButton`); [src/components/menu/shared/menuUi/MenuSectionTabs.jsx](../src/components/menu/shared/menuUi/MenuSectionTabs.jsx) (`MenuSectionTabs`); [src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx](../src/components/menu/shared/menuUi/PublicMenuCategoryTabs.jsx) (`PublicMenuCategoryTabs`); [src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx](../src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx) (`MenuCatalogModeLayout`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`getCatalogModeVisibility`, `normalizeMenuSetCatalog`); [src/hooks/menu/menu-sets/menuSetNavigationStore.js](../src/hooks/menu/menu-sets/menuSetNavigationStore.js) (`clearMenuSetNavigationState`, `createMenuSetNavigationKey`, `saveMenuSetReturnPath`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `categoryFilter`, `q`, `cartDrawerOpen`, `waiterCancellationDialogOpen`, `variantsModalOpen`, `selectedVariantsProduct`, `compositeModalOpen`, `selectedCompositeProduct`, `extrasModalOpen`, `selectedExtrasProduct`, `selectedExtrasVariantId`, `selectedExtrasCompositeDraft`, `selectedExtrasInitialValue`, `selectedExtrasReadOnly`, `selectedExtrasSubmitKind`, `selectedExtrasVariantObj`, `selectedExtrasSelectionScope`, `pendingCompositeComponents`, `pendingCompositeDetails`, `loading`, `errorMsg`, `data`, `menuSetCatalog`.

### pages/staff/waiter/WaiterTablesGrid.jsx

Fuente: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx). 1606 líneas.

Exportaciones: `default: WaiterTablesGrid`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/common/PaginationFooter.jsx](../src/components/common/PaginationFooter.jsx) (`PaginationFooter`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/services/staff/waiter/waiterTables.service.js](../src/services/staff/waiter/waiterTables.service.js) (`fetchStaffTablesGrid`, `attendTable`, `finishAttention`, `releaseTableSession`, `rejectTableCall`, `acceptCustomerOrder`, `rejectCustomerOrder`, `fetchWaiterReadyNotifications`, `markWaiterReadyNotificationRead`, `fetchWaiterBillRequests`, `markWaiterBillRequestRead`, `startWaiterOrderPayment`); [src/services/staff/waiter/staffOrders.service.js](../src/services/staff/waiter/staffOrders.service.js) (`occupyTable`, `freeTable`, `fetchStaffWaiterMenu`, `fetchPendingCancellationRequests`, `fetchCancellationContext`, `resolveCancellationRequest`); [src/services/staff/waiter/tableSessionRequests.service.js](../src/services/staff/waiter/tableSessionRequests.service.js) (`fetchTableSessionRequests`, `approveTableSessionRequest`, `rejectTableSessionRequest`); [src/realtime/echo.js](../src/realtime/echo.js) (`echo`); [src/components/staff/waiter/WaiterTablesHeader.jsx](../src/components/staff/waiter/WaiterTablesHeader.jsx) (`WaiterTablesHeader`); [src/components/staff/waiter/WaiterZoneTabs.jsx](../src/components/staff/waiter/WaiterZoneTabs.jsx) (`WaiterZoneTabs`); [src/components/staff/waiter/WaiterTablesBoard.jsx](../src/components/staff/waiter/WaiterTablesBoard.jsx) (`WaiterTablesBoard`); [src/components/staff/waiter/WaiterNoticesDrawer.jsx](../src/components/staff/waiter/WaiterNoticesDrawer.jsx) (`WaiterNoticesDrawer`); [src/components/staff/waiter/WaiterWarehouseSelectionDialog.jsx](../src/components/staff/waiter/WaiterWarehouseSelectionDialog.jsx) (`WaiterWarehouseSelectionDialog`); [src/components/staff/waiter/WaiterOccupyTableDialog.jsx](../src/components/staff/waiter/WaiterOccupyTableDialog.jsx) (`WaiterOccupyTableDialog`); [src/components/menu/staff/WaiterCancellationRequestDialog.jsx](../src/components/menu/staff/WaiterCancellationRequestDialog.jsx) (`WaiterCancellationRequestDialog`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `busy`, `refreshing`, `data`, `requests`, `reqBusyId`, `readyNotifications`, `readyBusyId`, `billRequests`, `billBusyId`, `cancellationRequests`, `cancellationReview`, `payingBusyOrderId`, `noticeOpen`, `zoneTab`, `warehouseDialog`, `occupyDialog`, `alertState`.

### pages/system-admin/addon-sales/SystemAddonSalesPage.jsx

Fuente: [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx). 210 líneas.

Exportaciones: `default: SystemAddonSalesPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/system-admin/addon-sales/SystemAddonSalesHeader.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesHeader.jsx) (`SystemAddonSalesHeader`); [src/components/system-admin/addon-sales/SystemAddonSalesFiltersCard.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesFiltersCard.jsx) (`SystemAddonSalesFiltersCard`); [src/components/system-admin/addon-sales/SystemAddonSalesSummaryCards.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesSummaryCards.jsx) (`SystemAddonSalesSummaryCards`); [src/components/system-admin/addon-sales/SystemAddonSalesListPanel.jsx](../src/components/system-admin/addon-sales/SystemAddonSalesListPanel.jsx) (`SystemAddonSalesListPanel`); [src/services/system-admin/systemAddonSales.service.js](../src/services/system-admin/systemAddonSales.service.js) (`getSystemAddonSalesCatalog`, `getSystemAddonSalesMonthly`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `rows`, `period`, `summary`, `addons`, `meta`, `periodType`, `year`, `month`, `addonId`, `q`, `alertState`.

### pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx

Fuente: [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx). 395 líneas.

Exportaciones: `default: SystemPlatformInvoicesPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/system-admin/billing/invoices/SystemPlatformInvoicesFilters.jsx](../src/components/system-admin/billing/invoices/SystemPlatformInvoicesFilters.jsx) (`SystemPlatformInvoicesFilters`); [src/components/system-admin/billing/invoices/SystemPlatformInvoicesPanel.jsx](../src/components/system-admin/billing/invoices/SystemPlatformInvoicesPanel.jsx) (`SystemPlatformInvoicesPanel`); [src/components/system-admin/billing/invoices/SystemPlatformInvoiceDetailModal.jsx](../src/components/system-admin/billing/invoices/SystemPlatformInvoiceDetailModal.jsx) (`SystemPlatformInvoiceDetailModal`); [src/services/system-admin/systemOwners.service.js](../src/services/system-admin/systemOwners.service.js) (`getSystemOwners`); [src/services/system-admin/billing/platformBilling.service.js](../src/services/system-admin/billing/platformBilling.service.js) (`downloadSystemPlatformInvoicePdf`, `downloadSystemPlatformInvoiceXml`, `getSystemPlatformInvoices`, `retrySystemPlatformInvoice`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `invoices`, `owners`, `filters`, `page`, `meta`, `loading`, `busyKey`, `detailOpen`, `detailInvoiceId`, `alertState`.

### pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx

Fuente: [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx). 456 líneas.

Exportaciones: `default: SystemPlatformPurchasesPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/system-admin/billing/purchases/SystemPlatformPurchasesFilters.jsx](../src/components/system-admin/billing/purchases/SystemPlatformPurchasesFilters.jsx) (`SystemPlatformPurchasesFilters`); [src/components/system-admin/billing/purchases/SystemPlatformPurchasesPanel.jsx](../src/components/system-admin/billing/purchases/SystemPlatformPurchasesPanel.jsx) (`SystemPlatformPurchasesPanel`); [src/components/system-admin/billing/purchases/SystemPlatformInvoiceModal.jsx](../src/components/system-admin/billing/purchases/SystemPlatformInvoiceModal.jsx) (`SystemPlatformInvoiceModal`); [src/services/system-admin/systemOwners.service.js](../src/services/system-admin/systemOwners.service.js) (`getSystemOwners`); [src/services/system-admin/billing/platformBilling.service.js](../src/services/system-admin/billing/platformBilling.service.js) (`getSystemPlatformPurchases`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `filters`, `debouncedQ`, `owners`, `contextRows`, `purchases`, `loading`, `refreshing`, `loadingContext`, `selectedPurchases`, `invoiceModalOpen`, `alertState`.

### pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx

Fuente: [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx). 250 líneas.

Exportaciones: `default: SystemBranchAddonsPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsHeroCard.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsHeroCard.jsx) (`SystemBranchAddonsHeroCard`); [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsPanel.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonsPanel.jsx) (`SystemBranchAddonsPanel`); [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx) (`SystemBranchAddonAssignModal`); [src/services/system-admin/systemOwnerRestaurantAddons.service.js](../src/services/system-admin/systemOwnerRestaurantAddons.service.js) (`assignSystemOwnerRestaurantAddon`, `getSystemAddons`, `getSystemOwnerRestaurantAddons`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `owner`, `restaurant`, `branch`, `catalog`, `branchAssignments`, `q`, `status`, `modalOpen`, `alertState`.

### pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx

Fuente: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx). 556 líneas.

Exportaciones: `default: SystemOwnerRestaurantDetailPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/system-admin/owners/restaurants/SystemOwnerRestaurantHeroCard.jsx](../src/components/system-admin/owners/restaurants/SystemOwnerRestaurantHeroCard.jsx) (`SystemOwnerRestaurantHeroCard`); [src/components/system-admin/owners/restaurants/SystemOwnerRestaurantTabs.jsx](../src/components/system-admin/owners/restaurants/SystemOwnerRestaurantTabs.jsx) (`SystemOwnerRestaurantTabs`); [src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchesPanel.jsx](../src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchesPanel.jsx) (`SystemRestaurantBranchesPanel`); [src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx](../src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx) (`SystemRestaurantBranchUpsertModal`); [src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionPanel.jsx](../src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionPanel.jsx) (`SystemRestaurantSubscriptionPanel`); [src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx](../src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx) (`SystemRestaurantSubscriptionAssignModal`); [src/services/system-admin/systemOwnerRestaurantBranches.service.js](../src/services/system-admin/systemOwnerRestaurantBranches.service.js) (`createSystemOwnerRestaurantBranch`, `dryRunDeleteSystemOwnerRestaurantBranch`, `deleteSystemOwnerRestaurantBranch`, `getSystemOwnerRestaurantBranches`, `updateSystemOwnerRestaurantBranch`, `uploadSystemOwnerRestaurantBranchLogo`, `deleteSystemOwnerRestaurantBranchActiveLogo`); [src/services/system-admin/systemOwnerRestaurantSubscriptions.service.js](../src/services/system-admin/systemOwnerRestaurantSubscriptions.service.js) (`createSystemRestaurantSubscription`, `expireSystemRestaurantCurrentSubscription`, `getSystemPlans`, `getSystemRestaurantCurrentSubscription`, `getSystemRestaurantSubscriptions`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `tab`, `loading`, `refreshing`, `busyId`, `owner`, `restaurant`, `branches`, `currentSubscription`, `subscriptions`, `plans`, `subscriptionBusy`, `subscriptionModalOpen`, `q`, `status`, `modalOpen`, `editingBranch`, `alertState`.

### pages/system-admin/owners/SystemOwnerDetailPage.jsx

Fuente: [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx). 404 líneas.

Exportaciones: `default: SystemOwnerDetailPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/system-admin/owners/detail/SystemOwnerHeroCard.jsx](../src/components/system-admin/owners/detail/SystemOwnerHeroCard.jsx) (`SystemOwnerHeroCard`); [src/components/system-admin/owners/detail/SystemOwnerRestaurantsPanel.jsx](../src/components/system-admin/owners/detail/SystemOwnerRestaurantsPanel.jsx) (`SystemOwnerRestaurantsPanel`); [src/components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx](../src/components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx) (`SystemOwnerRestaurantUpsertModal`); [src/services/system-admin/systemOwnerRestaurants.service.js](../src/services/system-admin/systemOwnerRestaurants.service.js) (`createSystemOwnerRestaurant`, `dryRunDeleteSystemOwnerRestaurant`, `deleteSystemOwnerRestaurant`, `getSystemOwnerRestaurants`, `updateSystemOwnerRestaurant`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `busyId`, `owner`, `restaurants`, `meta`, `q`, `status`, `modalOpen`, `editingRestaurant`, `alertState`.

### pages/system-admin/owners/SystemOwnersPage.jsx

Fuente: [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx). 374 líneas.

Exportaciones: `default: SystemOwnersPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/system-admin/owners/SystemOwnersHeader.jsx](../src/components/system-admin/owners/SystemOwnersHeader.jsx) (`SystemOwnersHeader`); [src/components/system-admin/owners/SystemOwnersFiltersCard.jsx](../src/components/system-admin/owners/SystemOwnersFiltersCard.jsx) (`SystemOwnersFiltersCard`); [src/components/system-admin/owners/SystemOwnersListPanel.jsx](../src/components/system-admin/owners/SystemOwnersListPanel.jsx) (`SystemOwnersListPanel`); [src/components/system-admin/owners/SystemOwnerUpsertModal.jsx](../src/components/system-admin/owners/SystemOwnerUpsertModal.jsx) (`SystemOwnerUpsertModal`); [src/services/system-admin/systemOwners.service.js](../src/services/system-admin/systemOwners.service.js) (`createSystemOwner`, `dryRunDeleteSystemOwner`, `deleteSystemOwner`, `getSystemOwners`, `updateSystemOwner`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `busyId`, `owners`, `meta`, `q`, `status`, `modalOpen`, `editingOwner`, `alertState`.

### pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx

Fuente: [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx). 233 líneas.

Exportaciones: `default: SystemSubscriptionSalesPage`.

Dependencias internas: [src/components/common/PageContainer.jsx](../src/components/common/PageContainer.jsx) (`PageContainer`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/hooks/usePagination.js](../src/hooks/usePagination.js) (`usePagination`); [src/utils/err.js](../src/utils/err.js) (`normalizeErr`); [src/components/system-admin/subscription-sales/SystemSubscriptionSalesHeader.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesHeader.jsx) (`SystemSubscriptionSalesHeader`); [src/components/system-admin/subscription-sales/SystemSubscriptionSalesFiltersCard.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesFiltersCard.jsx) (`SystemSubscriptionSalesFiltersCard`); [src/components/system-admin/subscription-sales/SystemSubscriptionSalesSummaryCards.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesSummaryCards.jsx) (`SystemSubscriptionSalesSummaryCards`); [src/components/system-admin/subscription-sales/SystemSubscriptionSalesListPanel.jsx](../src/components/system-admin/subscription-sales/SystemSubscriptionSalesListPanel.jsx) (`SystemSubscriptionSalesListPanel`); [src/services/system-admin/systemSubscriptionSales.service.js](../src/services/system-admin/systemSubscriptionSales.service.js) (`getSystemSubscriptionSalesMonthly`, `getSystemSubscriptionSalesSummary`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `loading`, `refreshing`, `rows`, `period`, `summary`, `byType`, `byPlan`, `byStatus`, `byProvider`, `meta`, `periodType`, `year`, `month`, `dateField`, `subscriptionType`, `q`, `status`, `alertState`.

### pages/system-admin/SystemAdminDashboard.jsx

Fuente: [src/pages/system-admin/SystemAdminDashboard.jsx](../src/pages/system-admin/SystemAdminDashboard.jsx). 117 líneas.

Exportaciones: `default: SystemAdminDashboard`.

Dependencias internas: [src/context/SystemAdminAuthContext.jsx](../src/context/SystemAdminAuthContext.jsx) (`useSystemAdminAuth`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

### pages/system-admin/SystemAdminLogin.jsx

Fuente: [src/pages/system-admin/SystemAdminLogin.jsx](../src/pages/system-admin/SystemAdminLogin.jsx). 250 líneas.

Exportaciones: `default: SystemAdminLogin`.

Dependencias internas: [src/components/auth/AuthBrandPanel.jsx](../src/components/auth/AuthBrandPanel.jsx) (`AuthBrandPanel`); [src/context/SystemAdminAuthContext.jsx](../src/context/SystemAdminAuthContext.jsx) (`useSystemAdminAuth`); [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js) (`handleFormApiError`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `err`, `busy`.

### pages/TestMui.jsx

Fuente: [src/pages/TestMui.jsx](../src/pages/TestMui.jsx). 31 líneas.

Exportaciones: `default: TestMui`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

### pages/TestRealtime.jsx

Fuente: [src/pages/TestRealtime.jsx](../src/pages/TestRealtime.jsx). 1 líneas.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

## routes

### routes/AppRoutes.jsx

Fuente: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx). 366 líneas.

Exportaciones: `default: AppRoutes`.

Dependencias internas: [src/routes/ProtectedRoute.jsx](../src/routes/ProtectedRoute.jsx) (`ProtectedRoute`); [src/routes/OwnerRoute.jsx](../src/routes/OwnerRoute.jsx) (`OwnerRoute`); [src/routes/StaffProtectedRoute.jsx](../src/routes/StaffProtectedRoute.jsx) (`StaffProtectedRoute`); [src/routes/SystemAdminProtectedRoute.jsx](../src/routes/SystemAdminProtectedRoute.jsx) (`SystemAdminProtectedRoute`); [src/pages/TestMui.jsx](../src/pages/TestMui.jsx) (`TestMui`); [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx) (`HomePage`); [src/pages/landing/terms/LandingTermsPage.jsx](../src/pages/landing/terms/LandingTermsPage.jsx) (`LandingTermsPage`); [src/pages/landing/contact/LandingContactPage.jsx](../src/pages/landing/contact/LandingContactPage.jsx) (`LandingContactPage`); [src/pages/landing/plans/LandingPlansPage.jsx](../src/pages/landing/plans/LandingPlansPage.jsx) (`LandingPlansPage`); [src/pages/landing/resources/MenuQrCanvaPage.jsx](../src/pages/landing/resources/MenuQrCanvaPage.jsx) (`MenuQrCanvaPage`); [src/pages/landing/resources/ComoElegirMenuQrPage.jsx](../src/pages/landing/resources/ComoElegirMenuQrPage.jsx) (`ComoElegirMenuQrPage`); [src/pages/system-admin/SystemAdminLogin.jsx](../src/pages/system-admin/SystemAdminLogin.jsx) (`SystemAdminLogin`); [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx) (`Register`); [src/pages/auth/Login.jsx](../src/pages/auth/Login.jsx) (`Login`); [src/pages/staff/StaffLogin.jsx](../src/pages/staff/StaffLogin.jsx) (`StaffLogin`); [src/pages/staff/StaffSelectContext.jsx](../src/pages/staff/StaffSelectContext.jsx) (`StaffSelectContext`); [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx) (`StaffMenuEntryPage`); [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx) (`CashRegistersPage`); [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx) (`WaiterTablesGrid`); [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx) (`KitchenDashboard`); [src/layouts/SystemAdminLayout.jsx](../src/layouts/SystemAdminLayout.jsx) (`SystemAdminLayout`); [src/pages/system-admin/SystemAdminDashboard.jsx](../src/pages/system-admin/SystemAdminDashboard.jsx) (`SystemAdminDashboard`); [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx) (`SystemOwnersPage`); [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx) (`SystemOwnerDetailPage`); [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx) (`SystemOwnerRestaurantDetailPage`); [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx) (`SystemBranchAddonsPage`); [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx) (`SystemSubscriptionSalesPage`); [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx) (`SystemAddonSalesPage`); [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx) (`SystemPlatformPurchasesPage`); [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx) (`SystemPlatformInvoicesPage`); [src/layouts/CashierLayout.jsx](../src/layouts/CashierLayout.jsx) (`CashierLayout`); [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx) (`CashierHomePage`); [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx) (`CashierQueuePage`); [src/pages/staff/casher/CashierSaleDetailPage.jsx](../src/pages/staff/casher/CashierSaleDetailPage.jsx) (`CashierSaleDetailPage`); [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx) (`CashierRefundsHistoryPage`); [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx) (`CashierCustomersPage`); [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx) (`CashierDirectOrderPage`); [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx) (`CashierOnlineOrdersPage`); [src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx) (`CashierOnlineOrderDetailPage`); [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx) (`CashierOnlineOrderPaymentPage`); [src/pages/admin/Dashboard.jsx](../src/pages/admin/Dashboard.jsx) (`Dashboard`); [src/pages/staff/RestaurantStaffPage.jsx](../src/pages/staff/RestaurantStaffPage.jsx) (`StaffPage`); [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx) (`MyRestaurantsHome`); [src/pages/restaurant/RestaurantEdit.jsx](../src/pages/restaurant/RestaurantEdit.jsx) (`RestaurantEdit`); [src/layouts/RestaurantAdminLayout.jsx](../src/layouts/RestaurantAdminLayout.jsx) (`RestaurantAdminLayout`); [src/pages/restaurant/RestaurantSettings.jsx](../src/pages/restaurant/RestaurantSettings.jsx) (`RestaurantSettings`); [src/layouts/RestaurantOperationLayout.jsx](../src/layouts/RestaurantOperationLayout.jsx) (`RestaurantOperationLayout`); [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx) (`BranchSettingsPage`); [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx) (`ModifierManager`); [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx) (`ProductModifierCatalogPage`); [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx) (`VariantModifierCatalogPage`); [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx) (`CompositeComponentModifierCatalogPage`); [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx) (`CompositeComponentVariantModifierCatalogPage`); [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx) (`BranchesPage`); [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx) (`MenuSetsPage`); [src/pages/menu/menuSets/create/MenuSetCreatePage.jsx](../src/pages/menu/menuSets/create/MenuSetCreatePage.jsx) (`MenuSetCreatePage`); [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx) (`MenuSetManagePage`); [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx) (`MenuSetStageProductsPage`); [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx) (`MenuSetStageDefinitionsPage`); [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx) (`OwnerOperationalDashboardPage`); [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx) (`MenuManager`); [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx) (`MenuListPage`); [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx) (`MenuContentPage`); [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx) (`MenuChannelsPage`); [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx) (`PromotionsPage`); [src/pages/menu/promotions/PromotionCreatePage.jsx](../src/pages/menu/promotions/PromotionCreatePage.jsx) (`PromotionCreatePage`); [src/pages/menu/promotions/PromotionEditPage.jsx](../src/pages/menu/promotions/PromotionEditPage.jsx) (`PromotionEditPage`); [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx) (`ProductsPage`); [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx) (`ProductVariantsPage`); [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx) (`ProductCompositionPage`); [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx) (`ProductRecipesPage`); [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx) (`BranchCatalogPage`); [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx) (`SalesChannelsPage`); [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx) (`BranchSalesChannelsPage`); [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx) (`ChannelProductsConfigPage`); [src/pages/inventory/IngredientsPage.jsx](../src/pages/inventory/IngredientsPage.jsx) (`IngredientsPage`); [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx) (`IngredientPresentationsPage`); [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx) (`WarehousesPage`); [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx) (`InventoryReportPage`); [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx) (`IngredientInventoryStockPage`); [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx) (`ProductInventoryStockPage`); [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx) (`IngredientInventoryMovementPage`); [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx) (`ProductInventoryMovementPage`); [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx) (`PurchasesPage`); [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx) (`PurchaseDetailPage`); [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx) (`TicketSettingsPage`); [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx) (`CustomerLoyaltySettingsPage`); [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx) (`PublicMenuSettingsPage`); [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx) (`DiscountsPage`); [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx) (`BillingSettingsPage`); [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx) (`OnlineOrdersPage`); [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx) (`PreparedItemSettingsPage`); [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx) (`BranchFloorPlanPage`); [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx) (`SalesReportPage`); [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx) (`ProfitReportPage`); [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx) (`WhasapoConnectionPage`); [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx) (`TaecontaAccountPage`); [src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx) (`NetpayConnectionPage`); [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx) (`RestaurantPlans`); [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx) (`RestaurantSubscriptionHistoryPage`); [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx) (`RestaurantAddonHistoryPage`); [src/pages/owner/billing/OwnerBillingPage.jsx](../src/pages/owner/billing/OwnerBillingPage.jsx) (`OwnerBillingPage`); [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx) (`BranchQrCodesPage`); [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx) (`PublicMenuEntryPage`); [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx) (`MenuSetBuilderPage`); [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx) (`PublicInvoicePage`); [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx) (`PublicOnlineOrderTrackingPage`); [src/realtime/TestEventPage.jsx](../src/realtime/TestEventPage.jsx) (`TestEventPage`); [src/pages/landing/blog/BlogPostsPage.jsx](../src/pages/landing/blog/BlogPostsPage.jsx) (`BlogPostsPage`); [src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx) (`BlogPostDetailPage`); [src/pages/landing/blog/BlogFilteredPostsPage.jsx](../src/pages/landing/blog/BlogFilteredPostsPage.jsx) (`BlogFilteredPostsPage`).

Consumidores directos: [src/App.jsx](../src/App.jsx).

### routes/OwnerRoute.jsx

Fuente: [src/routes/OwnerRoute.jsx](../src/routes/OwnerRoute.jsx). 23 líneas.

Exportaciones: `default: OwnerRoute`.

Dependencias internas: [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`useAuth`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

### routes/ProtectedRoute.jsx

Fuente: [src/routes/ProtectedRoute.jsx](../src/routes/ProtectedRoute.jsx). 17 líneas.

Exportaciones: `default: ProtectedRoute`.

Dependencias internas: [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`useAuth`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

### routes/StaffProtectedRoute.jsx

Fuente: [src/routes/StaffProtectedRoute.jsx](../src/routes/StaffProtectedRoute.jsx). 14 líneas.

Exportaciones: `default: StaffProtectedRoute`.

Dependencias internas: [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

### routes/SystemAdminProtectedRoute.jsx

Fuente: [src/routes/SystemAdminProtectedRoute.jsx](../src/routes/SystemAdminProtectedRoute.jsx). 24 líneas.

Exportaciones: `default: SystemAdminProtectedRoute`.

Dependencias internas: [src/context/SystemAdminAuthContext.jsx](../src/context/SystemAdminAuthContext.jsx) (`useSystemAdminAuth`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

## services

### services/api.js

Fuente: [src/services/api.js](../src/services/api.js). 25 líneas.

Exportaciones: `default: api`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/shared/AxiosAuthInterceptor.jsx](../src/components/shared/AxiosAuthInterceptor.jsx), [src/services/auth/auth.service.js](../src/services/auth/auth.service.js), [src/services/connection/netpay/netpayTerminal.service.js](../src/services/connection/netpay/netpayTerminal.service.js), [src/services/connection/tae/taeAccount.service.js](../src/services/connection/tae/taeAccount.service.js), [src/services/connection/tae/taeInvoiceSetting.service.js](../src/services/connection/tae/taeInvoiceSetting.service.js), [src/services/connection/tae/taeTaxProfile.service.js](../src/services/connection/tae/taeTaxProfile.service.js), [src/services/connection/whatsapp/chatingBootConnection.service.js](../src/services/connection/whatsapp/chatingBootConnection.service.js), [src/services/floor/operationalSettings.service.js](../src/services/floor/operationalSettings.service.js), [src/services/floor/qr/branchQrCodes.service.js](../src/services/floor/qr/branchQrCodes.service.js), [src/services/floor/tables.service.js](../src/services/floor/tables.service.js), [src/services/floor/zones.service.js](../src/services/floor/zones.service.js), [src/services/inventory/ingredients/ingredientPresentations.service.js](../src/services/inventory/ingredients/ingredientPresentations.service.js), [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js), [src/services/inventory/ingredients/ingredientsGroups.service.js](../src/services/inventory/ingredients/ingredientsGroups.service.js), [src/services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js](../src/services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js), [src/services/inventory/ingredients/inventoryStock/inventoryStock.service.js](../src/services/inventory/ingredients/inventoryStock/inventoryStock.service.js), [src/services/inventory/products/inventoryMovement/inventoryMovement.service.js](../src/services/inventory/products/inventoryMovement/inventoryMovement.service.js), [src/services/inventory/products/inventoryStock/inventoryStock.service.js](../src/services/inventory/products/inventoryStock/inventoryStock.service.js), [src/services/inventory/purchases/purchases.service.js](../src/services/inventory/purchases/purchases.service.js), [src/services/inventory/recipes/productRecipes.service.js](../src/services/inventory/recipes/productRecipes.service.js), [src/services/inventory/suppliers/suppliers.service.js](../src/services/inventory/suppliers/suppliers.service.js), [src/services/inventory/warehouses/warehouses.service.js](../src/services/inventory/warehouses/warehouses.service.js), [src/services/landing/publicPlans.service.js](../src/services/landing/publicPlans.service.js), [src/services/legal/legalDocuments.service.js](../src/services/legal/legalDocuments.service.js), [src/services/management/settings/branchSettings.service.js](../src/services/management/settings/branchSettings.service.js), [src/services/menu/categories.service.js](../src/services/menu/categories.service.js), [src/services/menu/menus/menuChannels/menuChannels.service.js](../src/services/menu/menus/menuChannels/menuChannels.service.js), [src/services/menu/menus/menuContent/menuContent.service.js](../src/services/menu/menus/menuContent/menuContent.service.js), [src/services/menu/menus/menuContent/menuSetAssignment.service.js](../src/services/menu/menus/menuContent/menuSetAssignment.service.js), [src/services/menu/menus/menus.service.js](../src/services/menu/menus/menus.service.js), [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js), [src/services/menu/menuSets/dashboard/operationalDashboard.service.js](../src/services/menu/menuSets/dashboard/operationalDashboard.service.js), [src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js), [src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js), [src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js), [src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js), [src/services/menu/menuSets/dashboard/ownerReminders.service.js](../src/services/menu/menuSets/dashboard/ownerReminders.service.js), [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js), [src/services/menu/menuSets/menuSetAvailability.service.js](../src/services/menu/menuSets/menuSetAvailability.service.js), [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js), [src/services/menu/menuSets/menuSetManagement.service.js](../src/services/menu/menuSets/menuSetManagement.service.js), [src/services/menu/menuSets/menuSetProduct.service.js](../src/services/menu/menuSets/menuSetProduct.service.js), [src/services/menu/menuSets/menuSetStage.service.js](../src/services/menu/menuSets/menuSetStage.service.js), [src/services/menu/menuSets/menuSetStageDefinition.service.js](../src/services/menu/menuSets/menuSetStageDefinition.service.js), [src/services/menu/modifiers/compositeComponentModifierGroups.service.js](../src/services/menu/modifiers/compositeComponentModifierGroups.service.js), [src/services/menu/modifiers/compositeComponentVariantModifierGroups.service.js](../src/services/menu/modifiers/compositeComponentVariantModifierGroups.service.js), [src/services/menu/modifiers/modifierCatalog.service.js](../src/services/menu/modifiers/modifierCatalog.service.js), [src/services/menu/modifiers/modifierGroups.service.js](../src/services/menu/modifiers/modifierGroups.service.js), [src/services/menu/modifiers/modifierOptionConsumption.service.js](../src/services/menu/modifiers/modifierOptionConsumption.service.js), [src/services/menu/modifiers/modifierOptions.service.js](../src/services/menu/modifiers/modifierOptions.service.js), [src/services/menu/modifiers/productModifierGroups.service.js](../src/services/menu/modifiers/productModifierGroups.service.js), [src/services/menu/modifiers/variantModifierGroups.service.js](../src/services/menu/modifiers/variantModifierGroups.service.js), [src/services/menu/promotions/promotion.service.js](../src/services/menu/promotions/promotion.service.js), [src/services/menu/promotions/promotionForm.service.js](../src/services/menu/promotions/promotionForm.service.js), [src/services/operation/billing-settings/branchBillingSettings.service.js](../src/services/operation/billing-settings/branchBillingSettings.service.js), [src/services/operation/billing-settings/operationalAuthorizers.service.js](../src/services/operation/billing-settings/operationalAuthorizers.service.js), [src/services/operation/discounts/discountAuthorizers.service.js](../src/services/operation/discounts/discountAuthorizers.service.js), [src/services/operation/discounts/discountPolicy.service.js](../src/services/operation/discounts/discountPolicy.service.js), [src/services/operation/loyalty/customerLoyaltySettings.service.js](../src/services/operation/loyalty/customerLoyaltySettings.service.js), [src/services/operation/online-orders/onlineOrderActivation.service.js](../src/services/operation/online-orders/onlineOrderActivation.service.js), [src/services/operation/online-orders/onlineOrderPayments.service.js](../src/services/operation/online-orders/onlineOrderPayments.service.js), [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js), [src/services/operation/prepared-items/preparedItemSettings.service.js](../src/services/operation/prepared-items/preparedItemSettings.service.js), [src/services/operation/ticket/branchPrintSetting.service.js](../src/services/operation/ticket/branchPrintSetting.service.js), [src/services/operation/ticket/branchWhasapoSetting.service.js](../src/services/operation/ticket/branchWhasapoSetting.service.js), [src/services/operation/ticket/ticketSettings.service.js](../src/services/operation/ticket/ticketSettings.service.js), [src/services/owner/addon.service.js](../src/services/owner/addon.service.js), [src/services/owner/ownerProfile.service.js](../src/services/owner/ownerProfile.service.js), [src/services/owner/plan.service.js](../src/services/owner/plan.service.js), [src/services/owner/platformBilling.service.js](../src/services/owner/platformBilling.service.js), [src/services/owner/taxProfile.service.js](../src/services/owner/taxProfile.service.js), [src/services/paypal/paypal.service.js](../src/services/paypal/paypal.service.js), [src/services/plan/planAccess.service.js](../src/services/plan/planAccess.service.js), [src/services/products/catalog/productComponents.service.js](../src/services/products/catalog/productComponents.service.js), [src/services/products/catalog/productInventoryType.service.js](../src/services/products/catalog/productInventoryType.service.js), [src/services/products/catalog/productType.service.js](../src/services/products/catalog/productType.service.js), [src/services/products/products.service.js](../src/services/products/products.service.js), [src/services/products/sales_channels/productChannel.service.js](../src/services/products/sales_channels/productChannel.service.js), [src/services/products/sales_channels/sales_channels.service.js](../src/services/products/sales_channels/sales_channels.service.js), [src/services/products/variants/productVariantChannels.service.js](../src/services/products/variants/productVariantChannels.service.js), [src/services/products/variants/productVariantGenerator.service.js](../src/services/products/variants/productVariantGenerator.service.js), [src/services/products/variants/productVariantImages.service.js](../src/services/products/variants/productVariantImages.service.js), [src/services/products/variants/productVariants.service.js](../src/services/products/variants/productVariants.service.js), [src/services/products/variants/variantAttributes.service.js](../src/services/products/variants/variantAttributes.service.js), [src/services/products/variants/variantAttributeValues.service.js](../src/services/products/variants/variantAttributeValues.service.js), [src/services/public-menu/branchPublicMenu.service.js](../src/services/public-menu/branchPublicMenu.service.js), [src/services/reports/inventoryReport.service.js](../src/services/reports/inventoryReport.service.js), [src/services/reports/profitReport.service.js](../src/services/reports/profitReport.service.js), [src/services/reports/salesReport.service.js](../src/services/reports/salesReport.service.js), [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js), [src/services/restaurant/branchCatalog.service.js](../src/services/restaurant/branchCatalog.service.js), [src/services/restaurant/branchSalesChannels.service.js](../src/services/restaurant/branchSalesChannels.service.js), [src/services/restaurant/demoContent.service.js](../src/services/restaurant/demoContent.service.js), [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js), [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js), [src/services/staff/cashRegisters.service.js](../src/services/staff/cashRegisters.service.js), [src/services/staff/roles.service.js](../src/services/staff/roles.service.js), [src/services/staff/staff.service.js](../src/services/staff/staff.service.js), [src/services/staff/staffAssignments.service.js](../src/services/staff/staffAssignments.service.js).

### services/auth/auth.service.js

Fuente: [src/services/auth/auth.service.js](../src/services/auth/auth.service.js). 73 líneas.

Exportaciones: `requestRegisterCode`, `verifyRegisterCode`, `resendRegisterCode`, `login`, `acceptTerms`, `me`, `logout`, `requestPasswordResetCode`, `resetPassword`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/auth/ForgotPasswordModal.jsx](../src/components/auth/ForgotPasswordModal.jsx), [src/components/auth/TermsModal.jsx](../src/components/auth/TermsModal.jsx), [src/context/AuthContext.jsx](../src/context/AuthContext.jsx), [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx).

### services/connection/netpay/netpayTerminal.service.js

Fuente: [src/services/connection/netpay/netpayTerminal.service.js](../src/services/connection/netpay/netpayTerminal.service.js). 22 líneas.

Exportaciones: `getRestaurantNetpayTerminals`, `updateRestaurantNetpayTerminal`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx).

### services/connection/tae/taeAccount.service.js

Fuente: [src/services/connection/tae/taeAccount.service.js](../src/services/connection/tae/taeAccount.service.js). 26 líneas.

Exportaciones: `getTaecontaAccount`, `upsertTaecontaAccount`, `deleteTaecontaAccount`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

### services/connection/tae/taeInvoiceSetting.service.js

Fuente: [src/services/connection/tae/taeInvoiceSetting.service.js](../src/services/connection/tae/taeInvoiceSetting.service.js). 26 líneas.

Exportaciones: `getTaecontaInvoiceSetting`, `upsertTaecontaInvoiceSetting`, `deleteTaecontaInvoiceSetting`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

### services/connection/tae/taeTaxProfile.service.js

Fuente: [src/services/connection/tae/taeTaxProfile.service.js](../src/services/connection/tae/taeTaxProfile.service.js). 17 líneas.

Exportaciones: `getTaecontaTaxProfile`, `syncTaecontaTaxProfile`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/connection/tae/TaecontaAccountPage.jsx](../src/pages/connection/tae/TaecontaAccountPage.jsx).

### services/connection/whatsapp/chatingBootConnection.service.js

Fuente: [src/services/connection/whatsapp/chatingBootConnection.service.js](../src/services/connection/whatsapp/chatingBootConnection.service.js). 58 líneas.

Exportaciones: `getBranchWhatsappQrConnection`, `createBranchWhatsappQrConnection`, `getBranchWhatsappQrConnectionStatus`, `deleteBranchWhatsappQrConnection`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx](../src/components/connection/whasapo/chatinbot/ChatingBootPanel.jsx).

### services/floor/operationalSettings.service.js

Fuente: [src/services/floor/operationalSettings.service.js](../src/services/floor/operationalSettings.service.js). 52 líneas.

Exportaciones: `getOperationalSettings`, `createOperationalSettings`, `updateOperationalSettings`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/floor/OperationalSettingsModal.jsx](../src/components/floor/OperationalSettingsModal.jsx), [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx), [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx), [src/services/management/settings/branchSettings.service.js](../src/services/management/settings/branchSettings.service.js).

### services/floor/qr/branchQrCodes.service.js

Fuente: [src/services/floor/qr/branchQrCodes.service.js](../src/services/floor/qr/branchQrCodes.service.js). 47 líneas.

Exportaciones: `getBranchQrCodes`, `createBranchQrCode`, `updateBranchQrCode`, `deleteBranchQrCode`, `exportBranchQrCodesPdf`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/floor/qr/BranchQrExportModal.jsx](../src/components/floor/qr/BranchQrExportModal.jsx), [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

### services/floor/tables.service.js

Fuente: [src/services/floor/tables.service.js](../src/services/floor/tables.service.js). 45 líneas.

Exportaciones: `getTables`, `getAvailableWaiters`, `createTable`, `updateTable`, `deleteTable`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/floor/TableModal.jsx](../src/components/floor/TableModal.jsx), [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx), [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx).

### services/floor/zones.service.js

Fuente: [src/services/floor/zones.service.js](../src/services/floor/zones.service.js). 44 líneas.

Exportaciones: `getZones`, `createZone`, `updateZone`, `assignZoneWaiter`, `deleteZone`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/floor/ZoneModal.jsx](../src/components/floor/ZoneModal.jsx), [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx).

### services/inventory/ingredients/ingredientPresentations.service.js

Fuente: [src/services/inventory/ingredients/ingredientPresentations.service.js](../src/services/inventory/ingredients/ingredientPresentations.service.js). 37 líneas.

Exportaciones: `getIngredientPresentations`, `createIngredientPresentation`, `updateIngredientPresentation`, `deleteIngredientPresentation`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx).

### services/inventory/ingredients/ingredients.service.js

Fuente: [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js). 57 líneas.

Exportaciones: `getIngredients`, `getPurchasableIngredients`, `createIngredient`, `getIngredient`, `updateIngredient`, `deleteIngredient`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx), [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx), [src/pages/inventory/IngredientsPage.jsx](../src/pages/inventory/IngredientsPage.jsx), [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx), [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx), [src/services/menu/modifiers/modifierOptionConsumption.service.js](../src/services/menu/modifiers/modifierOptionConsumption.service.js).

### services/inventory/ingredients/ingredientsGroups.service.js

Fuente: [src/services/inventory/ingredients/ingredientsGroups.service.js](../src/services/inventory/ingredients/ingredientsGroups.service.js). 36 líneas.

Exportaciones: `getIngredientGroups`, `createIngredientGroup`, `updateIngredientGroup`, `deleteIngredientGroup`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/inventory/IngredientFormModal.jsx](../src/components/inventory/IngredientFormModal.jsx), [src/components/inventory/IngredientsGroupWizard.jsx](../src/components/inventory/IngredientsGroupWizard.jsx).

### services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js

Fuente: [src/services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js](../src/services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js). 38 líneas.

Exportaciones: `getIngredientInventoryMovements`, `createIngredientInventoryMovement`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx).

### services/inventory/ingredients/inventoryStock/inventoryStock.service.js

Fuente: [src/services/inventory/ingredients/inventoryStock/inventoryStock.service.js](../src/services/inventory/ingredients/inventoryStock/inventoryStock.service.js). 28 líneas.

Exportaciones: `getIngredientInventoryStocks`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx).

### services/inventory/products/inventoryMovement/inventoryMovement.service.js

Fuente: [src/services/inventory/products/inventoryMovement/inventoryMovement.service.js](../src/services/inventory/products/inventoryMovement/inventoryMovement.service.js). 38 líneas.

Exportaciones: `getProductInventoryMovements`, `createProductInventoryMovement`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx).

### services/inventory/products/inventoryStock/inventoryStock.service.js

Fuente: [src/services/inventory/products/inventoryStock/inventoryStock.service.js](../src/services/inventory/products/inventoryStock/inventoryStock.service.js). 30 líneas.

Exportaciones: `getProductInventoryStocks`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx).

### services/inventory/purchases/purchases.service.js

Fuente: [src/services/inventory/purchases/purchases.service.js](../src/services/inventory/purchases/purchases.service.js). 154 líneas.

Exportaciones: `getPurchases`, `getPurchase`, `getPurchaseWarehouses`, `createPurchase`, `updatePurchase`, `deletePurchase`, `completePurchase`, `createPurchaseIngredientItem`, `updatePurchaseIngredientItem`, `deletePurchaseIngredientItem`, `createPurchaseProductItem`, `updatePurchaseProductItem`, `deletePurchaseProductItem`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx), [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx).

### services/inventory/recipes/productRecipes.service.js

Fuente: [src/services/inventory/recipes/productRecipes.service.js](../src/services/inventory/recipes/productRecipes.service.js). 47 líneas.

Exportaciones: `getProductRecipes`, `upsertProductRecipeBase`, `upsertProductRecipeVariant`, `setProductRecipeItemStatus`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/products/recipes/ProductRecipeEditorModal.jsx](../src/components/products/recipes/ProductRecipeEditorModal.jsx), [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx).

### services/inventory/suppliers/suppliers.service.js

Fuente: [src/services/inventory/suppliers/suppliers.service.js](../src/services/inventory/suppliers/suppliers.service.js). 25 líneas.

Exportaciones: `getSuppliers`, `createSupplier`, `updateSupplier`, `deleteSupplier`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/inventory/IngredientPresentationFormModal.jsx](../src/components/inventory/IngredientPresentationFormModal.jsx), [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx), [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx).

### services/inventory/warehouses/warehouses.service.js

Fuente: [src/services/inventory/warehouses/warehouses.service.js](../src/services/inventory/warehouses/warehouses.service.js). 86 líneas.

Exportaciones: `getWarehouses`, `createWarehouse`, `updateWarehouse`, `ensureDefaultWarehouses`, `getEffectiveWarehouse`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx), [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx).

### services/landing/publicPlans.service.js

Fuente: [src/services/landing/publicPlans.service.js](../src/services/landing/publicPlans.service.js). 7 líneas.

Exportaciones: `getPublicPlans`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/landing/plans/LandingPlansPage.jsx](../src/pages/landing/plans/LandingPlansPage.jsx).

### services/legal/legalDocuments.service.js

Fuente: [src/services/legal/legalDocuments.service.js](../src/services/legal/legalDocuments.service.js). 6 líneas.

Exportaciones: `getClicmenuTerms`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/auth/TermsModal.jsx](../src/components/auth/TermsModal.jsx), [src/pages/landing/terms/LandingTermsPage.jsx](../src/pages/landing/terms/LandingTermsPage.jsx).

### services/management/settings/branchSettings.service.js

Fuente: [src/services/management/settings/branchSettings.service.js](../src/services/management/settings/branchSettings.service.js). 71 líneas.

Exportaciones: `getBranchWorkflowSetting`, `updateBranchWorkflowSetting`, `getBranchDirectSaleSetting`, `updateBranchDirectSaleSetting`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`); [src/services/floor/operationalSettings.service.js](../src/services/floor/operationalSettings.service.js) (`getOperationalSettings`, `updateOperationalSettings`).

Consumidores directos: [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx), [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx).

### services/menu/categories.service.js

Fuente: [src/services/menu/categories.service.js](../src/services/menu/categories.service.js). 24 líneas.

Exportaciones: `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/MenuCategoriesPanel.jsx](../src/components/menu/MenuCategoriesPanel.jsx), [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx), [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx), [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx), [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx).

### services/menu/menus/menuChannels/menuChannels.service.js

Fuente: [src/services/menu/menus/menuChannels/menuChannels.service.js](../src/services/menu/menus/menuChannels/menuChannels.service.js). 53 líneas.

Exportaciones: `getMenuChannels`, `syncMenuChannels`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx](../src/pages/menu/menus/menuChannels/MenuChannelsPage.jsx).

### services/menu/menus/menuContent/menuContent.service.js

Fuente: [src/services/menu/menus/menuContent/menuContent.service.js](../src/services/menu/menus/menuContent/menuContent.service.js). 74 líneas.

Exportaciones: `getMenuContentCatalog`, `getMenuContent`, `syncMenuContent`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx](../src/components/menu/menus/menuContent/MenuNormalProductsTab.jsx).

### services/menu/menus/menuContent/menuSetAssignment.service.js

Fuente: [src/services/menu/menus/menuContent/menuSetAssignment.service.js](../src/services/menu/menus/menuContent/menuSetAssignment.service.js). 27 líneas.

Exportaciones: `getMenuSetAssignments`, `syncMenuSetAssignments`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menus/menuContent/MenuSetsTab.jsx](../src/components/menu/menus/menuContent/MenuSetsTab.jsx).

### services/menu/menus/menus.service.js

Fuente: [src/services/menu/menus/menus.service.js](../src/services/menu/menus/menus.service.js). 106 líneas.

Exportaciones: `getMenus`, `getMenu`, `createMenu`, `updateMenu`, `activateMenu`, `archiveMenu`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/menus/menuContent/MenuContentPage.jsx](../src/pages/menu/menus/menuContent/MenuContentPage.jsx), [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx).

### services/menu/menuSections.service.js

Fuente: [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js). 23 líneas.

Exportaciones: `getMenuSections`, `createMenuSection`, `updateMenuSection`, `deleteMenuSection`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/MenuSectionsPanel.jsx](../src/components/menu/MenuSectionsPanel.jsx), [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx), [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx), [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx).

### services/menu/menuSets/dashboard/operationalDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/operationalDashboard.service.js](../src/services/menu/menuSets/dashboard/operationalDashboard.service.js). 30 líneas.

Exportaciones: `getOperationalDashboardOverview`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx).

### services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js). 34 líneas.

Exportaciones: `getOwnerImportUpdatesDashboard`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardImportUpdates.jsx).

### services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js). 61 líneas.

Exportaciones: `getOwnerInventoryDashboardSummary`, `getOwnerInventoryDashboardItems`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardInventory.jsx).

### services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js). 59 líneas.

Exportaciones: `getOwnerMenuSetsDashboard`, `getOwnerMenuSetDashboardDetail`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardMenuSets.jsx).

### services/menu/menuSets/dashboard/ownerProductsDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js). 35 líneas.

Exportaciones: `getOwnerProductsDashboardAvailability`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx](../src/components/menu/menuSets/dashboard/OwnerDashboardProducts.jsx).

### services/menu/menuSets/dashboard/ownerReminders.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerReminders.service.js](../src/services/menu/menuSets/dashboard/ownerReminders.service.js). 133 líneas.

Exportaciones: `getOwnerReminderPreview`, `getOwnerReminderHistory`, `getReminderWhatsappSetting`, `getReminderWhatsappQrConnection`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/dashboard/reminders/ReminderChannelStatus.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderChannelStatus.jsx), [src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderHistory.jsx), [src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx](../src/components/menu/menuSets/dashboard/reminders/ReminderPreview.jsx).

### services/menu/menuSets/menuSet.service.js

Fuente: [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js). 82 líneas.

Exportaciones: `getMenuSets`, `changeMenuSetStatus`, `deleteMenuSet`, `createMenuSet`, `getMenuSet`, `updateMenuSet`, `uploadMenuSetImage`, `deleteMenuSetImage`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx](../src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx), [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx), [src/components/menu/menuSets/manage/MenuSetActivationTab.jsx](../src/components/menu/menuSets/manage/MenuSetActivationTab.jsx), [src/components/menu/menuSets/manage/MenuSetGeneralTab.jsx](../src/components/menu/menuSets/manage/MenuSetGeneralTab.jsx), [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx), [src/pages/menu/menuSets/create/MenuSetCreatePage.jsx](../src/pages/menu/menuSets/create/MenuSetCreatePage.jsx), [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx), [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx), [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx), [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx).

### services/menu/menuSets/menuSetAvailability.service.js

Fuente: [src/services/menu/menuSets/menuSetAvailability.service.js](../src/services/menu/menuSets/menuSetAvailability.service.js). 33 líneas.

Exportaciones: `getMenuSetAvailabilityPreview`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx](../src/components/menu/menuSets/manage/availability/MenuSetAvailabilityTab.jsx).

### services/menu/menuSets/menuSetImport.service.js

Fuente: [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js). 233 líneas.

Exportaciones: `getMenuSetImportCurrentStatus`, `downloadMenuSetImportTemplate`, `downloadMenuSetCurrentConfiguration`, `previewMenuSetImport`, `publishMenuSetImport`, `getMenuSetImportHistory`, `getMenuSetImportDetail`, `downloadMenuSetImportCurrent`, `getMenuSetImportHistoryDetail`, `getMenuSetPublicationHistory`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/manage/imports/MenuSetImportCurrent.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportCurrent.jsx), [src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportHistory.jsx), [src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPublish.jsx), [src/components/menu/menuSets/manage/imports/MenuSetImportTemplate.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportTemplate.jsx), [src/components/menu/menuSets/manage/imports/MenuSetImportUpload.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportUpload.jsx), [src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx](../src/components/menu/menuSets/manage/imports/MenuSetMassImportTab.jsx), [src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx](../src/components/menu/menuSets/manage/imports/MenuSetPublicationHistory.jsx).

### services/menu/menuSets/menuSetManagement.service.js

Fuente: [src/services/menu/menuSets/menuSetManagement.service.js](../src/services/menu/menuSets/menuSetManagement.service.js). 30 líneas.

Exportaciones: `getMenuSetManagement`, `updateMenuSetManagement`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx](../src/components/menu/menuSets/manage/MenuSetAdministrationTab.jsx), [src/pages/menu/menuSets/manage/MenuSetManagePage.jsx](../src/pages/menu/menuSets/manage/MenuSetManagePage.jsx).

### services/menu/menuSets/menuSetProduct.service.js

Fuente: [src/services/menu/menuSets/menuSetProduct.service.js](../src/services/menu/menuSets/menuSetProduct.service.js). 72 líneas.

Exportaciones: `getMenuSetEligibleProducts`, `getMenuSetStageProducts`, `getMenuSetStageProduct`, `createMenuSetStageProduct`, `updateMenuSetStageProduct`, `deleteMenuSetStageProduct`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx](../src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx), [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx).

### services/menu/menuSets/menuSetStage.service.js

Fuente: [src/services/menu/menuSets/menuSetStage.service.js](../src/services/menu/menuSets/menuSetStage.service.js). 54 líneas.

Exportaciones: `getMenuSetStages`, `getMenuSetStage`, `createMenuSetStage`, `updateMenuSetStage`, `deleteMenuSetStage`, `getMenuSetStageDefinitions`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx](../src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx), [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx), [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx).

### services/menu/menuSets/menuSetStageDefinition.service.js

Fuente: [src/services/menu/menuSets/menuSetStageDefinition.service.js](../src/services/menu/menuSets/menuSetStageDefinition.service.js). 38 líneas.

Exportaciones: `getMenuSetStageDefinitions`, `createMenuSetStageDefinition`, `updateMenuSetStageDefinition`, `deleteMenuSetStageDefinition`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx).

### services/menu/modifiers/compositeComponentModifierGroups.service.js

Fuente: [src/services/menu/modifiers/compositeComponentModifierGroups.service.js](../src/services/menu/modifiers/compositeComponentModifierGroups.service.js). 62 líneas.

Exportaciones: `getCompositeComponentModifierGroups`, `createCompositeComponentModifierGroup`, `updateCompositeComponentModifierGroup`, `deleteCompositeComponentModifierGroup`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx).

### services/menu/modifiers/compositeComponentVariantModifierGroups.service.js

Fuente: [src/services/menu/modifiers/compositeComponentVariantModifierGroups.service.js](../src/services/menu/modifiers/compositeComponentVariantModifierGroups.service.js). 62 líneas.

Exportaciones: `getCompositeComponentVariantModifierGroups`, `createCompositeComponentVariantModifierGroup`, `updateCompositeComponentVariantModifierGroup`, `deleteCompositeComponentVariantModifierGroup`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx).

### services/menu/modifiers/modifierCatalog.service.js

Fuente: [src/services/menu/modifiers/modifierCatalog.service.js](../src/services/menu/modifiers/modifierCatalog.service.js). 47 líneas.

Exportaciones: `getModifierCatalog`, `getCatalogProducts`, `getProductVariants`, `getProductComponentsCatalog`, `getComponentProductVariants`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js), [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

### services/menu/modifiers/modifierGroups.service.js

Fuente: [src/services/menu/modifiers/modifierGroups.service.js](../src/services/menu/modifiers/modifierGroups.service.js). 48 líneas.

Exportaciones: `getModifierGroups`, `getModifierGroup`, `createModifierGroup`, `updateModifierGroup`, `deleteModifierGroup`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/modifiers/ModifierGroupsPanel.jsx](../src/components/menu/modifiers/ModifierGroupsPanel.jsx), [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js), [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx).

### services/menu/modifiers/modifierOptionConsumption.service.js

Fuente: [src/services/menu/modifiers/modifierOptionConsumption.service.js](../src/services/menu/modifiers/modifierOptionConsumption.service.js). 111 líneas.

Exportaciones: `getModifierOptionConsumption`, `saveModifierOptionConsumption`, `deleteModifierOptionConsumption`, `resolveModifierOptionConsumption`, `fetchCatalogIngredients`, `fetchCatalogProducts`, `fetchWarehousesByRestaurant`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`); [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js) (`getIngredients`).

Consumidores directos: [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx).

### services/menu/modifiers/modifierOptions.service.js

Fuente: [src/services/menu/modifiers/modifierOptions.service.js](../src/services/menu/modifiers/modifierOptions.service.js). 67 líneas.

Exportaciones: `getModifierOptions`, `getModifierOption`, `createModifierOption`, `updateModifierOption`, `deleteModifierOption`, `getAllModifierOptions`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/modifiers/ModifierOptionsPanel.jsx](../src/components/menu/modifiers/ModifierOptionsPanel.jsx), [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx).

### services/menu/modifiers/productModifierGroups.service.js

Fuente: [src/services/menu/modifiers/productModifierGroups.service.js](../src/services/menu/modifiers/productModifierGroups.service.js). 52 líneas.

Exportaciones: `getProductModifierGroups`, `createProductModifierGroup`, `updateProductModifierGroup`, `deleteProductModifierGroup`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx).

### services/menu/modifiers/variantModifierGroups.service.js

Fuente: [src/services/menu/modifiers/variantModifierGroups.service.js](../src/services/menu/modifiers/variantModifierGroups.service.js). 64 líneas.

Exportaciones: `getVariantModifierGroups`, `createVariantModifierGroup`, `updateVariantModifierGroup`, `deleteVariantModifierGroup`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

### services/menu/promotions/promotion.service.js

Fuente: [src/services/menu/promotions/promotion.service.js](../src/services/menu/promotions/promotion.service.js). 329 líneas.

Exportaciones: `buildPromotionUpdatePayload`, `getPromotionBranches`, `getPromotions`, `getPromotion`, `updatePromotion`, `changePromotionStatus`, `deletePromotion`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/menu/promotions/PromotionEditPage.jsx](../src/pages/menu/promotions/PromotionEditPage.jsx), [src/pages/menu/promotions/PromotionsPage.jsx](../src/pages/menu/promotions/PromotionsPage.jsx).

### services/menu/promotions/promotionForm.service.js

Fuente: [src/services/menu/promotions/promotionForm.service.js](../src/services/menu/promotions/promotionForm.service.js). 425 líneas.

Exportaciones: `getPromotionFormBranches`, `getPromotionFormChannels`, `getPromotionEligibleProducts`, `getPromotionFormProductsCatalog`, `createPromotion`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/promotions/form/PromotionFormPage.jsx](../src/components/menu/promotions/form/PromotionFormPage.jsx), [src/pages/menu/promotions/PromotionCreatePage.jsx](../src/pages/menu/promotions/PromotionCreatePage.jsx).

### services/native/netpayBridge.service.js

Fuente: [src/services/native/netpayBridge.service.js](../src/services/native/netpayBridge.service.js). 385 líneas.

Exportaciones: `NETPAY_RESULT_EVENT`, `getNetpayResultReference`, `isNetpayBridgeAvailable`, `getNetpayCapabilities`, `startNetpaySale`, `startNetpayRecoveryByFolio`, `startNetpayCancellation`, `startNetpayVoucherReprint`, `getNetpayPendingOperation`, `acknowledgeNetpayPendingOperation`, `markNetpayPendingRecovery`, `subscribeNetpayResult`, `createNetpayResultWaiter`, `waitForNetpayResult`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js), [src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js](../src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js), [src/services/staff/casher/cashierNetpayCancellation.service.js](../src/services/staff/casher/cashierNetpayCancellation.service.js), [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js), [src/services/staff/casher/cashierNetpayVoucherReprint.service.js](../src/services/staff/casher/cashierNetpayVoucherReprint.service.js).

### services/operation/billing-settings/branchBillingSettings.service.js

Fuente: [src/services/operation/billing-settings/branchBillingSettings.service.js](../src/services/operation/billing-settings/branchBillingSettings.service.js). 18 líneas.

Exportaciones: `getBranchBillingSettings`, `updateBranchBillingSettings`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx).

### services/operation/billing-settings/operationalAuthorizers.service.js

Fuente: [src/services/operation/billing-settings/operationalAuthorizers.service.js](../src/services/operation/billing-settings/operationalAuthorizers.service.js). 57 líneas.

Exportaciones: `getBranchOperationalAuthorizers`, `getBranchOperationalAuthorizerCandidates`, `createBranchOperationalAuthorizer`, `updateBranchOperationalAuthorizer`, `deleteBranchOperationalAuthorizer`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx).

### services/operation/discounts/discountAuthorizers.service.js

Fuente: [src/services/operation/discounts/discountAuthorizers.service.js](../src/services/operation/discounts/discountAuthorizers.service.js). 57 líneas.

Exportaciones: `getBranchDiscountAuthorizers`, `getBranchDiscountAuthorizerCandidates`, `createBranchDiscountAuthorizer`, `updateBranchDiscountAuthorizer`, `deleteBranchDiscountAuthorizer`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx).

### services/operation/discounts/discountPolicy.service.js

Fuente: [src/services/operation/discounts/discountPolicy.service.js](../src/services/operation/discounts/discountPolicy.service.js). 27 líneas.

Exportaciones: `getBranchDiscountPolicy`, `upsertBranchDiscountPolicy`, `deleteBranchDiscountPolicy`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx).

### services/operation/loyalty/customerLoyaltySettings.service.js

Fuente: [src/services/operation/loyalty/customerLoyaltySettings.service.js](../src/services/operation/loyalty/customerLoyaltySettings.service.js). 31 líneas.

Exportaciones: `getCustomerLoyaltySettings`, `updateCustomerLoyaltySettings`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx](../src/pages/operation/loyalty/CustomerLoyaltySettingsPage.jsx).

### services/operation/online-orders/onlineOrderActivation.service.js

Fuente: [src/services/operation/online-orders/onlineOrderActivation.service.js](../src/services/operation/online-orders/onlineOrderActivation.service.js). 55 líneas.

Exportaciones: `getOnlineOrderPlanAccess`, `getOnlineOrderBranchSalesChannels`, `getOnlineOrderQrCodes`, `updateOnlineOrderActivation`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx](../src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx).

### services/operation/online-orders/onlineOrderPayments.service.js

Fuente: [src/services/operation/online-orders/onlineOrderPayments.service.js](../src/services/operation/online-orders/onlineOrderPayments.service.js). 55 líneas.

Exportaciones: `getOnlineOrderPaymentSettings`, `saveOnlineOrderPaymentSetting`, `getOnlineOrderTransferSetting`, `updateOnlineOrderTransferSetting`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx](../src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx), [src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx](../src/components/operation/online-orders/payments/OnlineOrderPaymentsTab.jsx).

### services/operation/online-orders/onlineOrders.service.js

Fuente: [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js). 247 líneas.

Exportaciones: `getOnlineOrderBranches`, `getOnlineOrderSetting`, `updateOnlineOrderSetting`, `getOnlineOrderFulfillments`, `saveOnlineOrderFulfillment`, `getOnlineOrderDeliveryConcepts`, `createOnlineOrderDeliveryConcept`, `updateOnlineOrderDeliveryConcept`, `deleteOnlineOrderDeliveryConcept`, `getOnlineOrderScheduledPoints`, `createOnlineOrderScheduledPoint`, `updateOnlineOrderScheduledPoint`, `deleteOnlineOrderScheduledPoint`, `getOnlineOrderTimeBlocks`, `createOnlineOrderTimeBlock`, `updateOnlineOrderTimeBlock`, `deleteOnlineOrderTimeBlock`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx](../src/components/operation/online-orders/activation/OnlineOrderActivationTab.jsx), [src/components/operation/online-orders/delivery/DeliveryConceptsCard.jsx](../src/components/operation/online-orders/delivery/DeliveryConceptsCard.jsx), [src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx](../src/components/operation/online-orders/delivery/OnlineOrderDeliveryTab.jsx), [src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx](../src/components/operation/online-orders/delivery/ScheduledPointsCard.jsx), [src/components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx](../src/components/operation/online-orders/delivery/ScheduledPointTimeBlocksDialog.jsx), [src/components/operation/online-orders/general/OnlineOrderGeneralTab.jsx](../src/components/operation/online-orders/general/OnlineOrderGeneralTab.jsx), [src/pages/operation/online-orders/OnlineOrdersPage.jsx](../src/pages/operation/online-orders/OnlineOrdersPage.jsx).

### services/operation/prepared-items/preparedItemSettings.service.js

Fuente: [src/services/operation/prepared-items/preparedItemSettings.service.js](../src/services/operation/prepared-items/preparedItemSettings.service.js). 68 líneas.

Exportaciones: `getPreparedItemSetting`, `updatePreparedItemSetting`, `getPreparedProductPolicies`, `getPreparedProductPolicy`, `updatePreparedProductPolicy`, `deletePreparedProductPolicy`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx).

### services/operation/ticket/branchPrintSetting.service.js

Fuente: [src/services/operation/ticket/branchPrintSetting.service.js](../src/services/operation/ticket/branchPrintSetting.service.js). 43 líneas.

Exportaciones: `getBranchPrintSetting`, `updateBranchPrintSetting`, `deleteBranchPrintSetting`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

### services/operation/ticket/branchWhasapoSetting.service.js

Fuente: [src/services/operation/ticket/branchWhasapoSetting.service.js](../src/services/operation/ticket/branchWhasapoSetting.service.js). 43 líneas.

Exportaciones: `getBranchWhasapoSetting`, `updateBranchWhasapoSetting`, `deleteBranchWhasapoSetting`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx).

### services/operation/ticket/ticketSettings.service.js

Fuente: [src/services/operation/ticket/ticketSettings.service.js](../src/services/operation/ticket/ticketSettings.service.js). 31 líneas.

Exportaciones: `getTicketSettings`, `updateTicketSettings`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx).

### services/owner/addon.service.js

Fuente: [src/services/owner/addon.service.js](../src/services/owner/addon.service.js). 16 líneas.

Exportaciones: `getRestaurantAddons`, `getRestaurantAddonCatalog`, `getRestaurantAddonHistory`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx).

### services/owner/ownerProfile.service.js

Fuente: [src/services/owner/ownerProfile.service.js](../src/services/owner/ownerProfile.service.js). 27 líneas.

Exportaciones: `getOwnerProfile`, `updateOwnerProfile`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/owner/profile/OwnerProfileModal.jsx](../src/components/owner/profile/OwnerProfileModal.jsx).

### services/owner/plan.service.js

Fuente: [src/services/owner/plan.service.js](../src/services/owner/plan.service.js). 8 líneas.

Exportaciones: `getPlans`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

### services/owner/platformBilling.service.js

Fuente: [src/services/owner/platformBilling.service.js](../src/services/owner/platformBilling.service.js). 83 líneas.

Exportaciones: `getPlatformPurchases`, `getPlatformInvoices`, `getPlatformInvoice`, `createPlatformInvoice`, `retryPlatformInvoice`, `downloadPlatformInvoicePdf`, `downloadPlatformInvoiceXml`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/owner/billing/OwnerBillingInvoicesTab.jsx](../src/components/owner/billing/OwnerBillingInvoicesTab.jsx), [src/components/owner/billing/OwnerBillingPurchasesTab.jsx](../src/components/owner/billing/OwnerBillingPurchasesTab.jsx), [src/components/owner/billing/OwnerInvoiceDetailModal.jsx](../src/components/owner/billing/OwnerInvoiceDetailModal.jsx), [src/components/owner/billing/OwnerPurchaseInvoiceModal.jsx](../src/components/owner/billing/OwnerPurchaseInvoiceModal.jsx).

### services/owner/taxProfile.service.js

Fuente: [src/services/owner/taxProfile.service.js](../src/services/owner/taxProfile.service.js). 24 líneas.

Exportaciones: `getTaxProfile`, `updateTaxProfile`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/owner/billing/OwnerPurchaseInvoiceModal.jsx](../src/components/owner/billing/OwnerPurchaseInvoiceModal.jsx), [src/components/owner/tax/OwnerTaxProfileModal.jsx](../src/components/owner/tax/OwnerTaxProfileModal.jsx).

### services/paypal/paypal.service.js

Fuente: [src/services/paypal/paypal.service.js](../src/services/paypal/paypal.service.js). 37 líneas.

Exportaciones: `getPayPalConfig`, `createPayPalCheckout`, `capturePayPalOrder`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/paypal/PayPalCheckoutDialog.jsx](../src/components/paypal/PayPalCheckoutDialog.jsx), [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx).

### services/plan/planAccess.service.js

Fuente: [src/services/plan/planAccess.service.js](../src/services/plan/planAccess.service.js). 18 líneas.

Exportaciones: `getPlanAccess`, `getStaffPlanAccess`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`); [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/hooks/plan/usePlanAccess.js](../src/hooks/plan/usePlanAccess.js), [src/layouts/CashierLayout.jsx](../src/layouts/CashierLayout.jsx), [src/layouts/RestaurantAdminLayout.jsx](../src/layouts/RestaurantAdminLayout.jsx), [src/layouts/RestaurantOperationLayout.jsx](../src/layouts/RestaurantOperationLayout.jsx).

### services/products/catalog/productComponents.service.js

Fuente: [src/services/products/catalog/productComponents.service.js](../src/services/products/catalog/productComponents.service.js). 64 líneas.

Exportaciones: `getProductComponents`, `upsertProductComponents`, `getComponentCandidates`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/products/CandidatePicker.jsx](../src/components/products/CandidatePicker.jsx), [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx).

### services/products/catalog/productInventoryType.service.js

Fuente: [src/services/products/catalog/productInventoryType.service.js](../src/services/products/catalog/productInventoryType.service.js). 10 líneas.

Exportaciones: `changeInventoryType`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/products/ProductFormModal.jsx](../src/components/products/ProductFormModal.jsx).

### services/products/catalog/productType.service.js

Fuente: [src/services/products/catalog/productType.service.js](../src/services/products/catalog/productType.service.js). 10 líneas.

Exportaciones: `changeProductType`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/products/ProductFormModal.jsx](../src/components/products/ProductFormModal.jsx).

### services/products/products.service.js

Fuente: [src/services/products/products.service.js](../src/services/products/products.service.js). 116 líneas.

Exportaciones: `getProducts`, `createProduct`, `getProduct`, `updateProduct`, `deleteProduct`, `getProductSatMapping`, `updateProductSatMapping`, `getProductImages`, `uploadProductImage`, `deleteProductImage`, `reorderProductImages`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx), [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx), [src/pages/inventory/purchases/PurchaseDetailPage.jsx](../src/pages/inventory/purchases/PurchaseDetailPage.jsx), [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx), [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx).

### services/products/sales_channels/productChannel.service.js

Fuente: [src/services/products/sales_channels/productChannel.service.js](../src/services/products/sales_channels/productChannel.service.js). 27 líneas.

Exportaciones: `getChannelProducts`, `upsertChannelProduct`, `deleteChannelProduct`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx).

### services/products/sales_channels/sales_channels.service.js

Fuente: [src/services/products/sales_channels/sales_channels.service.js](../src/services/products/sales_channels/sales_channels.service.js). 31 líneas.

Exportaciones: `getSalesChannels`, `createSalesChannel`, `updateSalesChannel`, `deleteSalesChannel`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx).

### services/products/variants/productVariantChannels.service.js

Fuente: [src/services/products/variants/productVariantChannels.service.js](../src/services/products/variants/productVariantChannels.service.js). 26 líneas.

Exportaciones: `getVariantChannels`, `upsertVariantChannels`, `deleteVariantChannelOverride`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx).

### services/products/variants/productVariantGenerator.service.js

Fuente: [src/services/products/variants/productVariantGenerator.service.js](../src/services/products/variants/productVariantGenerator.service.js). 29 líneas.

Exportaciones: `generateProductVariants`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx).

### services/products/variants/productVariantImages.service.js

Fuente: [src/services/products/variants/productVariantImages.service.js](../src/services/products/variants/productVariantImages.service.js). 56 líneas.

Exportaciones: `getProductVariantImage`, `uploadProductVariantImage`, `deleteProductVariantImage`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/variants/VariantManagementDialog.jsx](../src/components/variants/VariantManagementDialog.jsx).

### services/products/variants/productVariants.service.js

Fuente: [src/services/products/variants/productVariants.service.js](../src/services/products/variants/productVariants.service.js). 55 líneas.

Exportaciones: `getProductVariants`, `toggleProductVariant`, `setDefaultProductVariant`, `repairProductVariant`, `deleteProductVariant`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx), [src/components/variants/content/VariantDetailContent.jsx](../src/components/variants/content/VariantDetailContent.jsx), [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx), [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx).

### services/products/variants/variantAttributes.service.js

Fuente: [src/services/products/variants/variantAttributes.service.js](../src/services/products/variants/variantAttributes.service.js). 57 líneas.

Exportaciones: `getVariantAttributes`, `createVariantAttribute`, `updateVariantAttribute`, `deleteVariantAttribute`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/variants/content/VariantAttributeFormContent.jsx](../src/components/variants/content/VariantAttributeFormContent.jsx), [src/components/variants/content/VariantAttributesContent.jsx](../src/components/variants/content/VariantAttributesContent.jsx), [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx), [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx).

### services/products/variants/variantAttributeValues.service.js

Fuente: [src/services/products/variants/variantAttributeValues.service.js](../src/services/products/variants/variantAttributeValues.service.js). 73 líneas.

Exportaciones: `getVariantAttributeValues`, `createVariantAttributeValue`, `updateVariantAttributeValue`, `deleteVariantAttributeValue`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/variants/content/VariantAttributeValuesContent.jsx](../src/components/variants/content/VariantAttributeValuesContent.jsx), [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx), [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx).

### services/public/clicMenuBlog.service.js

Fuente: [src/services/public/clicMenuBlog.service.js](../src/services/public/clicMenuBlog.service.js). 125 líneas.

Exportaciones: `getClicMenuBlog`, `getClicMenuBlogPosts`, `getClicMenuBlogPost`, `getClicMenuBlogCategories`, `getClicMenuBlogCategoryPosts`, `getClicMenuBlogTags`, `getClicMenuBlogTagPosts`, `getClicMenuBlogSitemapUrl`.

Dependencias internas: [src/services/publicBlogApi.js](../src/services/publicBlogApi.js) (`publicBlogApi`).

Consumidores directos: [src/pages/landing/blog/BlogFilteredPostsPage.jsx](../src/pages/landing/blog/BlogFilteredPostsPage.jsx), [src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx), [src/pages/landing/blog/BlogPostsPage.jsx](../src/pages/landing/blog/BlogPostsPage.jsx).

### services/public/order-tracking/publicOrderTracking.service.js

Fuente: [src/services/public/order-tracking/publicOrderTracking.service.js](../src/services/public/order-tracking/publicOrderTracking.service.js). 47 líneas.

Exportaciones: `isValidPublicTrackingToken`, `getPublicOnlineOrderTracking`, `getPublicTrackingErrorMessage`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx).

### services/public/publicInvoice.service.js

Fuente: [src/services/public/publicInvoice.service.js](../src/services/public/publicInvoice.service.js). 31 líneas.

Exportaciones: `getPublicInvoice`, `stampPublicInvoice`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/invoice/PublicInvoicePage.jsx](../src/pages/public/invoice/PublicInvoicePage.jsx).

### services/public/publicMenu.service.js

Fuente: [src/services/public/publicMenu.service.js](../src/services/public/publicMenu.service.js). 299 líneas.

Exportaciones: `getOrCreatePublicDeviceId`, `resolveMenuToken`, `fetchResolvedMenu`, `fetchPublicMenuSets`, `fetchPreparedItems`, `scanTable`, `getTableSession`, `heartbeatTableSession`, `createJoinRequest`, `getJoinRequestStatus`, `callWaiterByTable`, `createPublicOrder`, `getPublicOrder`, `appendPublicOrderItems`, `requestOrderCancellation`, `requestPublicOrderBill`, `sendPublicWhatsapp`, `quotePublicOnlineOrder`, `createPublicOnlineOrder`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/hooks/public/cartAndOrder/usePublicOrderCancellation.js](../src/hooks/public/cartAndOrder/usePublicOrderCancellation.js), [src/hooks/public/cartAndOrder/usePublicTableOrder.js](../src/hooks/public/cartAndOrder/usePublicTableOrder.js), [src/hooks/public/cartAndOrder/usePublicWebOrdering.js](../src/hooks/public/cartAndOrder/usePublicWebOrdering.js), [src/hooks/public/usePublicMenuLoader.js](../src/hooks/public/usePublicMenuLoader.js), [src/hooks/public/useTableQrSession.js](../src/hooks/public/useTableQrSession.js), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### services/public-menu/branchPublicMenu.service.js

Fuente: [src/services/public-menu/branchPublicMenu.service.js](../src/services/public-menu/branchPublicMenu.service.js). 123 líneas.

Exportaciones: `getBranchPublicMenuSetting`, `createBranchPublicMenuSetting`, `updateBranchPublicMenuSetting`, `uploadBranchPublicMenuCover`, `deleteBranchPublicMenuCover`, `getBranchPublicMenuGallery`, `uploadBranchPublicMenuGalleryImage`, `updateBranchPublicMenuGalleryImage`, `deleteBranchPublicMenuGalleryImage`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx).

### services/publicBlogApi.js

Fuente: [src/services/publicBlogApi.js](../src/services/publicBlogApi.js). 14 líneas.

Exportaciones: `default: publicBlogApi`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/services/public/clicMenuBlog.service.js](../src/services/public/clicMenuBlog.service.js).

### services/referrals/referral.service.js

Fuente: [src/services/referrals/referral.service.js](../src/services/referrals/referral.service.js). 11 líneas.

Exportaciones: `checkReferralCode`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx).

### services/reports/inventoryReport.service.js

Fuente: [src/services/reports/inventoryReport.service.js](../src/services/reports/inventoryReport.service.js). 75 líneas.

Exportaciones: `getInventoryReportSummary`, `getInventoryReportTable`, `getInventoryReportExcelUrl`, `getInventoryReportPdfUrl`, `downloadInventoryReportExcel`, `downloadInventoryReportPdf`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx).

### services/reports/profitReport.service.js

Fuente: [src/services/reports/profitReport.service.js](../src/services/reports/profitReport.service.js). 74 líneas.

Exportaciones: `getProfitReportSummary`, `getProfitReportTable`, `getProfitReportExcelUrl`, `getProfitReportPdfUrl`, `downloadProfitReportExcel`, `downloadProfitReportPdf`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx).

### services/reports/salesReport.service.js

Fuente: [src/services/reports/salesReport.service.js](../src/services/reports/salesReport.service.js). 68 líneas.

Exportaciones: `getSalesReportSummary`, `getSalesReportTable`, `getSalesReportExcelUrl`, `getSalesReportPdfUrl`, `downloadSalesReportExcel`, `downloadSalesReportPdf`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx).

### services/restaurant/branch.service.js

Fuente: [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js). 87 líneas.

Exportaciones: `getBranchesByRestaurant`, `createBranch`, `updateBranch`, `getBranch`, `dryRunDeleteBranch`, `deleteBranch`, `getBranchLogo`, `getBranchLogoHistory`, `uploadBranchLogo`, `deleteActiveBranchLogo`, `deleteBranchLogoFromHistory`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx](../src/components/menu/modifiers/ModifierOptionConsumptionModal.jsx), [src/components/restaurant/BranchUpsertModal.jsx](../src/components/restaurant/BranchUpsertModal.jsx), [src/components/staff/StaffAssignmentsModal.jsx](../src/components/staff/StaffAssignmentsModal.jsx), [src/components/staff/StaffUpsertModal.jsx](../src/components/staff/StaffUpsertModal.jsx), [src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx), [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js), [src/layouts/RestaurantAdminLayout.jsx](../src/layouts/RestaurantAdminLayout.jsx), [src/pages/connection/netpay/NetpayConnectionPage.jsx](../src/pages/connection/netpay/NetpayConnectionPage.jsx), [src/pages/connection/whasapo/WhasapoConnectionPage.jsx](../src/pages/connection/whasapo/WhasapoConnectionPage.jsx), [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx), [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx), [src/pages/inventory/warehouses/reports/InventoryReportPage.jsx](../src/pages/inventory/warehouses/reports/InventoryReportPage.jsx), [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx), [src/pages/management/settings/BranchSettingsPage.jsx](../src/pages/management/settings/BranchSettingsPage.jsx), [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx), [src/pages/menu/menus/MenuListPage.jsx](../src/pages/menu/menus/MenuListPage.jsx), [src/pages/menu/menuSets/create/MenuSetCreatePage.jsx](../src/pages/menu/menuSets/create/MenuSetCreatePage.jsx), [src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx](../src/pages/menu/menuSets/dashboard/OwnerOperationalDashboardPage.jsx), [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx), [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx), [src/pages/operation/billing-settings/BillingSettingsPage.jsx](../src/pages/operation/billing-settings/BillingSettingsPage.jsx), [src/pages/operation/discounts/DiscountsPage.jsx](../src/pages/operation/discounts/DiscountsPage.jsx), [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx), [src/pages/operation/ticket/TicketSettingsPage.jsx](../src/pages/operation/ticket/TicketSettingsPage.jsx), [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx), [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx), [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx), [src/pages/public-menu/PublicMenuSettingsPage.jsx](../src/pages/public-menu/PublicMenuSettingsPage.jsx), [src/pages/reports/profit/ProfitReportPage.jsx](../src/pages/reports/profit/ProfitReportPage.jsx), [src/pages/reports/sales/SalesReportPage.jsx](../src/pages/reports/sales/SalesReportPage.jsx), [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx), [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx), [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx).

### services/restaurant/branchCatalog.service.js

Fuente: [src/services/restaurant/branchCatalog.service.js](../src/services/restaurant/branchCatalog.service.js). 25 líneas.

Exportaciones: `getBranchCatalog`, `upsertProductOverride`, `deleteProductOverride`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx).

### services/restaurant/branchSalesChannels.service.js

Fuente: [src/services/restaurant/branchSalesChannels.service.js](../src/services/restaurant/branchSalesChannels.service.js). 24 líneas.

Exportaciones: `getBranchSalesChannels`, `upsertBranchSalesChannel`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/floor/ZoneModal.jsx](../src/components/floor/ZoneModal.jsx), [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx), [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx).

### services/restaurant/demoContent.service.js

Fuente: [src/services/restaurant/demoContent.service.js](../src/services/restaurant/demoContent.service.js). 21 líneas.

Exportaciones: `getDemoContentStatus`, `deleteDemoContent`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx).

### services/restaurant/restaurant.service.js

Fuente: [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js). 90 líneas.

Exportaciones: `getMyRestaurants`, `createRestaurant`, `getRestaurant`, `updateRestaurant`, `dryRunDeleteRestaurant`, `deleteRestaurant`, `getRestaurantSubscriptionStatus`, `getRestaurantSubscriptions`, `getRestaurantSubscription`, `subscribeRestaurant`, `setRestaurantMainBranch`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/owner/billing/OwnerBillingPurchasesTab.jsx](../src/components/owner/billing/OwnerBillingPurchasesTab.jsx), [src/components/restaurant/RestaurantFormModal.jsx](../src/components/restaurant/RestaurantFormModal.jsx), [src/pages/owner/RestaurantPlans.jsx](../src/pages/owner/RestaurantPlans.jsx), [src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx](../src/pages/owner/subscription-history/RestaurantSubscriptionHistoryPage.jsx), [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx), [src/pages/restaurant/RestaurantEdit.jsx](../src/pages/restaurant/RestaurantEdit.jsx), [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx).

### services/restaurant/restaurantSettings.service.js

Fuente: [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js). 42 líneas.

Exportaciones: `getRestaurantSettings`, `upsertRestaurantSettings`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js), [src/pages/inventory/warehouses/WarehousesPage.jsx](../src/pages/inventory/warehouses/WarehousesPage.jsx), [src/pages/menu/MenuManager.jsx](../src/pages/menu/MenuManager.jsx), [src/pages/menu/modifiers/ModifierManager.jsx](../src/pages/menu/modifiers/ModifierManager.jsx), [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx), [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx), [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/restaurant/RestaurantSettings.jsx](../src/pages/restaurant/RestaurantSettings.jsx), [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx), [src/pages/staff/RestaurantStaffPage.jsx](../src/pages/staff/RestaurantStaffPage.jsx).

### services/staff/casher/cashierAdjustment.service.js

Fuente: [src/services/staff/casher/cashierAdjustment.service.js](../src/services/staff/casher/cashierAdjustment.service.js). 34 líneas.

Exportaciones: `fetchCashierSaleAdjustments`, `cancelCashierSaleItems`, `cancelCashierSaleOrder`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js](../src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js), [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js).

### services/staff/casher/cashierCustomer.service.js

Fuente: [src/services/staff/casher/cashierCustomer.service.js](../src/services/staff/casher/cashierCustomer.service.js). 71 líneas.

Exportaciones: `searchCashierCustomers`, `createCashierCustomer`, `fetchCashierSaleCustomerData`, `saveCashierSaleContactData`, `removeCashierSaleContactData`, `attachCashierSaleCustomer`, `detachCashierSaleCustomer`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js](../src/pages/staff/casher/saleDetail/useCashierSaleCustomer.js), [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js).

### services/staff/casher/cashierCustomerPoints.service.js

Fuente: [src/services/staff/casher/cashierCustomerPoints.service.js](../src/services/staff/casher/cashierCustomerPoints.service.js). 51 líneas.

Exportaciones: `searchCashierCustomersDirectory`, `fetchCashierCustomerPointsBalance`, `fetchCashierCustomerPointsLedger`, `fetchCashierCustomerSalesHistory`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/customer/CashierCustomersPage.jsx](../src/pages/staff/casher/customer/CashierCustomersPage.jsx).

### services/staff/casher/cashierDirectOrder.service.js

Fuente: [src/services/staff/casher/cashierDirectOrder.service.js](../src/services/staff/casher/cashierDirectOrder.service.js). 151 líneas.

Exportaciones: `fetchCashierDirectMenu`, `fetchCashierDirectMenuSets`, `fetchPreparedItems`, `createCashierDirectOrder`, `fetchCashierDirectOrder`, `appendCashierDirectOrderItems`, `reviewCashierDirectOrderStock`, `removeCashierDirectOrderItem`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx).

### services/staff/casher/cashierDiscount.service.js

Fuente: [src/services/staff/casher/cashierDiscount.service.js](../src/services/staff/casher/cashierDiscount.service.js). 73 líneas.

Exportaciones: `fetchCashierSaleDiscountSummary`, `fetchCashierSaleDiscountAudit`, `fetchCashierDiscountAuthorizers`, `applyCashierSaleGlobalDiscount`, `removeCashierSaleGlobalDiscount`, `applyCashierSaleItemDiscount`, `removeCashierSaleItemDiscount`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderDiscounts.js), [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js), [src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js](../src/pages/staff/casher/saleDetail/useCashierSaleDiscounts.js).

### services/staff/casher/cashierNetpayCancellation.service.js

Fuente: [src/services/staff/casher/cashierNetpayCancellation.service.js](../src/services/staff/casher/cashierNetpayCancellation.service.js). 1024 líneas.

Exportaciones: `executeCashierNetpayCancellation`, `resumeCashierPendingNetpayCancellation`.

Dependencias internas: [src/services/native/netpayBridge.service.js](../src/services/native/netpayBridge.service.js) (`acknowledgeNetpayPendingOperation`, `createNetpayResultWaiter`, `markNetpayPendingRecovery`, `startNetpayCancellation`); [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js) (`getCashierPendingNetpayOperation`, `recoverCashierNetpayPayment`, `resolveCashierNetpayTerminal`); [src/services/staff/casher/netpayTransaction.service.js](../src/services/staff/casher/netpayTransaction.service.js) (`finalizeNetpayCancellation`, `requestNetpayCancellation`, `storeNetpayCancellationResult`).

Consumidores directos: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx).

### services/staff/casher/cashierNetpayPayment.service.js

Fuente: [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js). 1729 líneas.

Exportaciones: `resolveCashierNetpayTerminal`, `previewCashierNetpayPayment`, `recoverCashierNetpayPayment`, `executeCashierNetpayPayment`, `getCashierPendingNetpayOperation`, `getCashierUnresolvedNetpayPayment`, `resumeCashierUnresolvedNetpayPayment`, `resumeCashierPendingNetpayOperation`, `getCashierNetpayError`.

Dependencias internas: [src/services/native/netpayBridge.service.js](../src/services/native/netpayBridge.service.js) (`acknowledgeNetpayPendingOperation`, `createNetpayResultWaiter`, `getNetpayCapabilities`, `getNetpayPendingOperation`, `isNetpayBridgeAvailable`, `markNetpayPendingRecovery`, `startNetpayRecoveryByFolio`, `startNetpaySale`); [src/services/staff/casher/netpayTransaction.service.js](../src/services/staff/casher/netpayTransaction.service.js) (`createNetpayTransaction`, `fetchUnresolvedNetpayTransaction`, `finalizeApprovedNetpayTransaction`, `previewNetpayTransaction`, `requestNetpayRecovery`, `storeNetpayRecoveryResult`, `storeNetpaySaleResult`); [src/services/staff/casher/netpayTerminal.service.js](../src/services/staff/casher/netpayTerminal.service.js) (`syncCashierNetpayTerminal`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js), [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx), [src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js](../src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js), [src/services/staff/casher/cashierNetpayCancellation.service.js](../src/services/staff/casher/cashierNetpayCancellation.service.js), [src/services/staff/casher/cashierNetpayVoucherReprint.service.js](../src/services/staff/casher/cashierNetpayVoucherReprint.service.js).

### services/staff/casher/cashierNetpayVoucherReprint.service.js

Fuente: [src/services/staff/casher/cashierNetpayVoucherReprint.service.js](../src/services/staff/casher/cashierNetpayVoucherReprint.service.js). 621 líneas.

Exportaciones: `resumeCashierPendingNetpayVoucherReprint`, `executeCashierNetpayVoucherReprint`, `getCashierNetpayVoucherReprintError`.

Dependencias internas: [src/services/native/netpayBridge.service.js](../src/services/native/netpayBridge.service.js) (`acknowledgeNetpayPendingOperation`, `createNetpayResultWaiter`, `startNetpayVoucherReprint`); [src/services/staff/casher/netpayTransaction.service.js](../src/services/staff/casher/netpayTransaction.service.js) (`requestNetpayVoucherReprint`, `storeNetpayVoucherReprintResult`); [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js) (`getCashierPendingNetpayOperation`, `resolveCashierNetpayTerminal`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js), [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx), [src/pages/staff/casher/saleDetail/useCashierSaleTicket.js](../src/pages/staff/casher/saleDetail/useCashierSaleTicket.js).

### services/staff/casher/cashierOperationalAuthorizer.service.js

Fuente: [src/services/staff/casher/cashierOperationalAuthorizer.service.js](../src/services/staff/casher/cashierOperationalAuthorizer.service.js). 20 líneas.

Exportaciones: `fetchCashierOperationalAuthorizers`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx), [src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js](../src/pages/staff/casher/saleDetail/useCashierSaleAdjustments.js).

### services/staff/casher/cashierOrderCheck.service.js

Fuente: [src/services/staff/casher/cashierOrderCheck.service.js](../src/services/staff/casher/cashierOrderCheck.service.js). 96 líneas.

Exportaciones: `fetchCashierSaleChecks`, `splitCashierCheckByProducts`, `splitCashierCheckEqualParts`, `undoCashierCheckEqualParts`, `moveCashierCheckItem`, `moveCashierCheckItemQuantity`, `mergeCashierChecks`, `mergeCashierTables`, `reopenCashierCheck`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierMergeSaleDialog.jsx), [src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx](../src/components/staff/casher/queuePage/CashierSplitSaleDialog.jsx), [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

### services/staff/casher/cashierPayment.service.js

Fuente: [src/services/staff/casher/cashierPayment.service.js](../src/services/staff/casher/cashierPayment.service.js). 96 líneas.

Exportaciones: `fetchCashierPaymentMethods`, `fetchCashierTaxOptions`, `previewCashierSalePayment`, `payCashierSale`, `extractTicketFromPayResponse`, `extractTicketWarningFromPayResponse`, `extractCashierSettlementFromPayResponse`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js), [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js), [src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js](../src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js).

### services/staff/casher/cashierPrebill.service.js

Fuente: [src/services/staff/casher/cashierPrebill.service.js](../src/services/staff/casher/cashierPrebill.service.js). 91 líneas.

Exportaciones: `fetchCashierPrebill`, `fetchCashierPrebillPdf`, `fetchCashierPrebillPrintPayload`, `sendCashierPrebillWhatsapp`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/saleDetail/useCashierSalePrebill.js](../src/pages/staff/casher/saleDetail/useCashierSalePrebill.js).

### services/staff/casher/cashierQueue.service.js

Fuente: [src/services/staff/casher/cashierQueue.service.js](../src/services/staff/casher/cashierQueue.service.js). 45 líneas.

Exportaciones: `fetchCashierSaleQueue`, `takeCashierSale`, `releaseCashierBillingGroup`, `fetchCashierSaleDetail`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/layouts/CashierLayout.jsx](../src/layouts/CashierLayout.jsx), [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js).

### services/staff/casher/cashierReadyNotifications.service.js

Fuente: [src/services/staff/casher/cashierReadyNotifications.service.js](../src/services/staff/casher/cashierReadyNotifications.service.js). 26 líneas.

Exportaciones: `fetchCashierReadyNotifications`, `markCashierReadyNotificationRead`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx).

### services/staff/casher/cashierRefunds.service.js

Fuente: [src/services/staff/casher/cashierRefunds.service.js](../src/services/staff/casher/cashierRefunds.service.js). 58 líneas.

Exportaciones: `fetchCashierRefundSalesHistory`, `fetchCashierSaleRefundSummary`, `refundCashierSaleFull`, `refundCashierSaleAmount`, `refundCashierSaleItems`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx).

### services/staff/casher/cashierSaleCheck.service.js

Fuente: [src/services/staff/casher/cashierSaleCheck.service.js](../src/services/staff/casher/cashierSaleCheck.service.js). 45 líneas.

Exportaciones: `fetchCashierSaleCheckContext`, `fetchCashierSaleCheckDetail`, `prepareCashierSaleCheckPayment`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentFlow.js), [src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js](../src/pages/staff/casher/saleDetail/useCashierSaleDetailLoad.js), [src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js](../src/pages/staff/casher/saleDetail/useCashierSalePaymentFlow.js).

### services/staff/casher/cashierSession.service.js

Fuente: [src/services/staff/casher/cashierSession.service.js](../src/services/staff/casher/cashierSession.service.js). 42 líneas.

Exportaciones: `fetchCashierCurrentSession`, `fetchCashierRegisters`, `openCashierSession`, `closeCashierSession`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/layouts/CashierLayout.jsx](../src/layouts/CashierLayout.jsx), [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx).

### services/staff/casher/cashierTicket.service.js

Fuente: [src/services/staff/casher/cashierTicket.service.js](../src/services/staff/casher/cashierTicket.service.js). 593 líneas.

Exportaciones: `fetchCashierTicketBySale`, `fetchCashierTicketById`, `fetchCashierTicketHtml`, `downloadCashierTicketPdf`, `isWindowsPrintTarget`, `isAndroidPrintTarget`, `resolveCashierThermalPrintTarget`, `sendCashierThermalPrintPayloadToWindows`, `sendCashierThermalPrintPayloadToAndroid`, `sendCashierThermalPrintPayload`, `openCashierTicketWindow`, `openCashierTicketHtmlInNewTab`, `printCashierTicketFromHtml`, `saveCashierTicketPdf`, `fetchCashierSaleTicketPrintConfig`, `fetchCashierSaleTicketPrintPayload`, `sendCashierSaleTicketWhatsapp`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderTicket.js), [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx), [src/pages/staff/casher/saleDetail/useCashierSalePrebill.js](../src/pages/staff/casher/saleDetail/useCashierSalePrebill.js), [src/pages/staff/casher/saleDetail/useCashierSaleTicket.js](../src/pages/staff/casher/saleDetail/useCashierSaleTicket.js).

### services/staff/casher/netpayTerminal.service.js

Fuente: [src/services/staff/casher/netpayTerminal.service.js](../src/services/staff/casher/netpayTerminal.service.js). 13 líneas.

Exportaciones: `syncCashierNetpayTerminal`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx), [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js).

### services/staff/casher/netpayTransaction.service.js

Fuente: [src/services/staff/casher/netpayTransaction.service.js](../src/services/staff/casher/netpayTransaction.service.js). 193 líneas.

Exportaciones: `previewNetpayTransaction`, `createNetpayTransaction`, `fetchNetpayTransaction`, `fetchUnresolvedNetpayTransaction`, `storeNetpaySaleResult`, `requestNetpayRecovery`, `storeNetpayRecoveryResult`, `finalizeApprovedNetpayTransaction`, `requestNetpayCancellation`, `storeNetpayCancellationResult`, `finalizeNetpayCancellation`, `requestNetpayVoucherReprint`, `storeNetpayVoucherReprintResult`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/services/staff/casher/cashierNetpayCancellation.service.js](../src/services/staff/casher/cashierNetpayCancellation.service.js), [src/services/staff/casher/cashierNetpayPayment.service.js](../src/services/staff/casher/cashierNetpayPayment.service.js), [src/services/staff/casher/cashierNetpayVoucherReprint.service.js](../src/services/staff/casher/cashierNetpayVoucherReprint.service.js).

### services/staff/casher/onlineOrders/cashierOnlineOrders.service.js

Fuente: [src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](../src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js). 199 líneas.

Exportaciones: `fetchCashierOnlineOrders`, `fetchCashierOnlineOrderDetail`, `fetchCashierOnlineOrderDeliveryPrintConfig`, `fetchCashierOnlineOrderDeliveryPrintPayload`, `fetchCashierOnlineOrderNewNotifications`, `markCashierOnlineOrderNewNotificationRead`, `acceptCashierOnlineOrder`, `rejectCashierOnlineOrder`, `cancelCashierOnlineOrder`, `takeCashierOnlineOrder`, `releaseCashierOnlineOrder`, `confirmCashierOnlineOrderPreparation`, `startCashierOnlineOrderPreparation`, `markCashierOnlineOrderReady`, `markCashierOnlineOrderOutForDelivery`, `markCashierOnlineOrderArrivedAtDestination`, `deliverCashierOnlineOrder`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx](../src/components/staff/casher/onlineOrders/CashierOnlineOrdersPanel.jsx), [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js).

### services/staff/cashRegisters.service.js

Fuente: [src/services/staff/cashRegisters.service.js](../src/services/staff/cashRegisters.service.js). 102 líneas.

Exportaciones: `getCashRegistersOverview`, `getCashRegisters`, `createCashRegister`, `updateCashRegister`, `deleteCashRegister`, `getRestaurantPlanAccess`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx).

### services/staff/kitchen/kitchenKds.service.js

Fuente: [src/services/staff/kitchen/kitchenKds.service.js](../src/services/staff/kitchen/kitchenKds.service.js). 62 líneas.

Exportaciones: `fetchKitchenKdsOrders`, `startKitchenItem`, `readyKitchenItem`, `notifyKitchenOrderReady`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

### services/staff/kitchen/kitchenPreparedItems.service.js

Fuente: [src/services/staff/kitchen/kitchenPreparedItems.service.js](../src/services/staff/kitchen/kitchenPreparedItems.service.js). 49 líneas.

Exportaciones: `finishKitchenPreparedItem`, `confirmKitchenPreparedItemReturn`, `markKitchenPreparedItemUnfit`, `retireExpiredKitchenPreparedItem`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx).

### services/staff/roles.service.js

Fuente: [src/services/staff/roles.service.js](../src/services/staff/roles.service.js). 19 líneas.

Exportaciones: `getRoles`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/staff/StaffAssignmentsModal.jsx](../src/components/staff/StaffAssignmentsModal.jsx), [src/components/staff/StaffUpsertModal.jsx](../src/components/staff/StaffUpsertModal.jsx).

### services/staff/staff.service.js

Fuente: [src/services/staff/staff.service.js](../src/services/staff/staff.service.js). 22 líneas.

Exportaciones: `getStaff`, `createStaff`, `updateStaff`, `deleteStaff`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/staff/StaffUpsertModal.jsx](../src/components/staff/StaffUpsertModal.jsx), [src/pages/staff/RestaurantStaffPage.jsx](../src/pages/staff/RestaurantStaffPage.jsx).

### services/staff/staffAssignments.service.js

Fuente: [src/services/staff/staffAssignments.service.js](../src/services/staff/staffAssignments.service.js). 27 líneas.

Exportaciones: `getAssignments`, `createAssignment`, `updateAssignment`, `deleteAssignment`.

Dependencias internas: [src/services/api.js](../src/services/api.js) (`api`).

Consumidores directos: [src/components/staff/StaffAssignmentsModal.jsx](../src/components/staff/StaffAssignmentsModal.jsx).

### services/staff/staffAuth.service.js

Fuente: [src/services/staff/staffAuth.service.js](../src/services/staff/staffAuth.service.js). 122 líneas.

Exportaciones: `staffLogin`, `staffSelectContext`, `staffContext`, `staffExitContext`, `staffLogout`, `getStaffToken`, `getStaffUser`, `getStaffContexts`, `getStaffActiveContext`, `setStaffActiveContext`, `clearStaffLocal`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx), [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx), [src/pages/staff/StaffSelectBranch.jsx](../src/pages/staff/StaffSelectBranch.jsx).

### services/staff/waiter/staffOrders.service.js

Fuente: [src/services/staff/waiter/staffOrders.service.js](../src/services/staff/waiter/staffOrders.service.js). 200 líneas.

Exportaciones: `fetchStaffWaiterMenu`, `fetchStaffWaiterMenuSets`, `fetchPreparedItems`, `occupyTable`, `freeTable`, `createWaiterOrder`, `getCurrentTableOrder`, `getTableOrderHistory`, `appendWaiterOrderItems`, `getOrderById`, `fetchPendingCancellationRequests`, `fetchCancellationContext`, `resolveCancellationRequest`, `cancelOrderItems`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx), [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

### services/staff/waiter/tableSessionRequests.service.js

Fuente: [src/services/staff/waiter/tableSessionRequests.service.js](../src/services/staff/waiter/tableSessionRequests.service.js). 18 líneas.

Exportaciones: `fetchTableSessionRequests`, `approveTableSessionRequest`, `rejectTableSessionRequest`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

### services/staff/waiter/waiterTables.service.js

Fuente: [src/services/staff/waiter/waiterTables.service.js](../src/services/staff/waiter/waiterTables.service.js). 128 líneas.

Exportaciones: `fetchStaffTablesGrid`, `attendTable`, `rejectTableCall`, `finishAttention`, `releaseTableSession`, `acceptCustomerOrder`, `rejectCustomerOrder`, `fetchWaiterReadyNotifications`, `markWaiterReadyNotificationRead`, `fetchWaiterBillRequests`, `markWaiterBillRequestRead`, `startWaiterOrderPayment`.

Dependencias internas: [src/services/staffApi.js](../src/services/staffApi.js) (`staffApi`).

Consumidores directos: [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx).

### services/staffApi.js

Fuente: [src/services/staffApi.js](../src/services/staffApi.js). 18 líneas.

Exportaciones: `default: staffApi`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/shared/AxiosAuthInterceptor.jsx](../src/components/shared/AxiosAuthInterceptor.jsx), [src/services/plan/planAccess.service.js](../src/services/plan/planAccess.service.js), [src/services/staff/casher/cashierAdjustment.service.js](../src/services/staff/casher/cashierAdjustment.service.js), [src/services/staff/casher/cashierCustomer.service.js](../src/services/staff/casher/cashierCustomer.service.js), [src/services/staff/casher/cashierCustomerPoints.service.js](../src/services/staff/casher/cashierCustomerPoints.service.js), [src/services/staff/casher/cashierDirectOrder.service.js](../src/services/staff/casher/cashierDirectOrder.service.js), [src/services/staff/casher/cashierDiscount.service.js](../src/services/staff/casher/cashierDiscount.service.js), [src/services/staff/casher/cashierOperationalAuthorizer.service.js](../src/services/staff/casher/cashierOperationalAuthorizer.service.js), [src/services/staff/casher/cashierOrderCheck.service.js](../src/services/staff/casher/cashierOrderCheck.service.js), [src/services/staff/casher/cashierPayment.service.js](../src/services/staff/casher/cashierPayment.service.js), [src/services/staff/casher/cashierPrebill.service.js](../src/services/staff/casher/cashierPrebill.service.js), [src/services/staff/casher/cashierQueue.service.js](../src/services/staff/casher/cashierQueue.service.js), [src/services/staff/casher/cashierReadyNotifications.service.js](../src/services/staff/casher/cashierReadyNotifications.service.js), [src/services/staff/casher/cashierRefunds.service.js](../src/services/staff/casher/cashierRefunds.service.js), [src/services/staff/casher/cashierSaleCheck.service.js](../src/services/staff/casher/cashierSaleCheck.service.js), [src/services/staff/casher/cashierSession.service.js](../src/services/staff/casher/cashierSession.service.js), [src/services/staff/casher/cashierTicket.service.js](../src/services/staff/casher/cashierTicket.service.js), [src/services/staff/casher/netpayTerminal.service.js](../src/services/staff/casher/netpayTerminal.service.js), [src/services/staff/casher/netpayTransaction.service.js](../src/services/staff/casher/netpayTransaction.service.js), [src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](../src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js), [src/services/staff/kitchen/kitchenKds.service.js](../src/services/staff/kitchen/kitchenKds.service.js), [src/services/staff/kitchen/kitchenPreparedItems.service.js](../src/services/staff/kitchen/kitchenPreparedItems.service.js), [src/services/staff/staffAuth.service.js](../src/services/staff/staffAuth.service.js), [src/services/staff/waiter/staffOrders.service.js](../src/services/staff/waiter/staffOrders.service.js), [src/services/staff/waiter/tableSessionRequests.service.js](../src/services/staff/waiter/tableSessionRequests.service.js), [src/services/staff/waiter/waiterTables.service.js](../src/services/staff/waiter/waiterTables.service.js).

### services/system-admin/billing/platformBilling.service.js

Fuente: [src/services/system-admin/billing/platformBilling.service.js](../src/services/system-admin/billing/platformBilling.service.js). 102 líneas.

Exportaciones: `SYSTEM_INVOICE_MODES`, `getSystemPlatformPurchases`, `createSystemPlatformInvoice`, `getSystemPlatformInvoices`, `getSystemPlatformInvoice`, `retrySystemPlatformInvoice`, `downloadSystemPlatformInvoicePdf`, `downloadSystemPlatformInvoiceXml`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/components/system-admin/billing/invoices/SystemPlatformInvoiceDetailModal.jsx](../src/components/system-admin/billing/invoices/SystemPlatformInvoiceDetailModal.jsx), [src/components/system-admin/billing/purchases/SystemPlatformInvoiceModal.jsx](../src/components/system-admin/billing/purchases/SystemPlatformInvoiceModal.jsx), [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx), [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx).

### services/system-admin/systemAddonSales.service.js

Fuente: [src/services/system-admin/systemAddonSales.service.js](../src/services/system-admin/systemAddonSales.service.js). 36 líneas.

Exportaciones: `getSystemAddonSalesMonthly`, `getSystemAddonSalesSummary`, `getSystemAddonSalesCatalog`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx).

### services/system-admin/systemAdminAuth.service.js

Fuente: [src/services/system-admin/systemAdminAuth.service.js](../src/services/system-admin/systemAdminAuth.service.js). 62 líneas.

Exportaciones: `systemAdminLogin`, `systemAdminMe`, `systemAdminLogout`, `getSystemAdminToken`, `getSystemAdminUser`, `clearSystemAdminLocal`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/context/SystemAdminAuthContext.jsx](../src/context/SystemAdminAuthContext.jsx).

### services/system-admin/systemOwnerRestaurantAddons.service.js

Fuente: [src/services/system-admin/systemOwnerRestaurantAddons.service.js](../src/services/system-admin/systemOwnerRestaurantAddons.service.js). 41 líneas.

Exportaciones: `getSystemAddons`, `getSystemOwnerRestaurantAddons`, `assignSystemOwnerRestaurantAddon`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx).

### services/system-admin/systemOwnerRestaurantBranches.service.js

Fuente: [src/services/system-admin/systemOwnerRestaurantBranches.service.js](../src/services/system-admin/systemOwnerRestaurantBranches.service.js). 123 líneas.

Exportaciones: `getSystemOwnerRestaurantBranches`, `getSystemOwnerRestaurantBranch`, `createSystemOwnerRestaurantBranch`, `updateSystemOwnerRestaurantBranch`, `dryRunDeleteSystemOwnerRestaurantBranch`, `deleteSystemOwnerRestaurantBranch`, `getSystemOwnerRestaurantBranchLogo`, `uploadSystemOwnerRestaurantBranchLogo`, `deleteSystemOwnerRestaurantBranchActiveLogo`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx).

### services/system-admin/systemOwnerRestaurants.service.js

Fuente: [src/services/system-admin/systemOwnerRestaurants.service.js](../src/services/system-admin/systemOwnerRestaurants.service.js). 75 líneas.

Exportaciones: `getSystemOwnerRestaurants`, `getSystemOwnerRestaurant`, `createSystemOwnerRestaurant`, `updateSystemOwnerRestaurant`, `dryRunDeleteSystemOwnerRestaurant`, `deleteSystemOwnerRestaurant`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx).

### services/system-admin/systemOwnerRestaurantSubscriptions.service.js

Fuente: [src/services/system-admin/systemOwnerRestaurantSubscriptions.service.js](../src/services/system-admin/systemOwnerRestaurantSubscriptions.service.js). 60 líneas.

Exportaciones: `getSystemRestaurantSubscriptions`, `getSystemRestaurantCurrentSubscription`, `createSystemRestaurantSubscription`, `expireSystemRestaurantCurrentSubscription`, `getSystemPlans`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx).

### services/system-admin/systemOwners.service.js

Fuente: [src/services/system-admin/systemOwners.service.js](../src/services/system-admin/systemOwners.service.js). 62 líneas.

Exportaciones: `getSystemOwners`, `createSystemOwner`, `updateSystemOwner`, `dryRunDeleteSystemOwner`, `deleteSystemOwner`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx), [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx), [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx).

### services/system-admin/systemOwnerTaxProfile.service.js

Fuente: [src/services/system-admin/systemOwnerTaxProfile.service.js](../src/services/system-admin/systemOwnerTaxProfile.service.js). 29 líneas.

Exportaciones: `getSystemOwnerTaxProfile`, `updateSystemOwnerTaxProfile`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/components/system-admin/owners/tabs/SystemOwnerTaxProfileTab.jsx](../src/components/system-admin/owners/tabs/SystemOwnerTaxProfileTab.jsx).

### services/system-admin/systemSubscriptionSales.service.js

Fuente: [src/services/system-admin/systemSubscriptionSales.service.js](../src/services/system-admin/systemSubscriptionSales.service.js). 38 líneas.

Exportaciones: `getSystemSubscriptionSalesMonthly`, `getSystemSubscriptionSalesSummary`.

Dependencias internas: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js) (`systemAdminApi`).

Consumidores directos: [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

### services/systemAdminApi.js

Fuente: [src/services/systemAdminApi.js](../src/services/systemAdminApi.js). 22 líneas.

Exportaciones: `default: systemAdminApi`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/services/system-admin/billing/platformBilling.service.js](../src/services/system-admin/billing/platformBilling.service.js), [src/services/system-admin/systemAddonSales.service.js](../src/services/system-admin/systemAddonSales.service.js), [src/services/system-admin/systemAdminAuth.service.js](../src/services/system-admin/systemAdminAuth.service.js), [src/services/system-admin/systemOwnerRestaurantAddons.service.js](../src/services/system-admin/systemOwnerRestaurantAddons.service.js), [src/services/system-admin/systemOwnerRestaurantBranches.service.js](../src/services/system-admin/systemOwnerRestaurantBranches.service.js), [src/services/system-admin/systemOwnerRestaurants.service.js](../src/services/system-admin/systemOwnerRestaurants.service.js), [src/services/system-admin/systemOwnerRestaurantSubscriptions.service.js](../src/services/system-admin/systemOwnerRestaurantSubscriptions.service.js), [src/services/system-admin/systemOwners.service.js](../src/services/system-admin/systemOwners.service.js), [src/services/system-admin/systemOwnerTaxProfile.service.js](../src/services/system-admin/systemOwnerTaxProfile.service.js), [src/services/system-admin/systemSubscriptionSales.service.js](../src/services/system-admin/systemSubscriptionSales.service.js).

## context

### context/AuthContext.jsx

Fuente: [src/context/AuthContext.jsx](../src/context/AuthContext.jsx). 108 líneas.

Exportaciones: `AuthProvider`, `useAuth`.

Dependencias internas: [src/services/auth/auth.service.js](../src/services/auth/auth.service.js) (`authService`).

Consumidores directos: [src/components/owner/profile/OwnerProfileModal.jsx](../src/components/owner/profile/OwnerProfileModal.jsx), [src/components/shared/AxiosAuthInterceptor.jsx](../src/components/shared/AxiosAuthInterceptor.jsx), [src/main.jsx](../src/main.jsx), [src/pages/admin/Dashboard.jsx](../src/pages/admin/Dashboard.jsx), [src/pages/auth/Login.jsx](../src/pages/auth/Login.jsx), [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx), [src/pages/restaurant/MyRestaurantsHome.jsx](../src/pages/restaurant/MyRestaurantsHome.jsx), [src/routes/OwnerRoute.jsx](../src/routes/OwnerRoute.jsx), [src/routes/ProtectedRoute.jsx](../src/routes/ProtectedRoute.jsx).

Estados locales (`useState`): `user`, `loading`, `referralDiscount`.

### context/StaffAuthContext.jsx

Fuente: [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx). 171 líneas.

Exportaciones: `StaffAuthProvider`, `useStaffAuth`.

Dependencias internas: [src/services/staff/staffAuth.service.js](../src/services/staff/staffAuth.service.js) (`staffAuth`).

Consumidores directos: [src/components/shared/AxiosAuthInterceptor.jsx](../src/components/shared/AxiosAuthInterceptor.jsx), [src/layouts/CashierLayout.jsx](../src/layouts/CashierLayout.jsx), [src/main.jsx](../src/main.jsx), [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx), [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderPaymentPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx), [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx), [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx), [src/pages/staff/StaffLogin.jsx](../src/pages/staff/StaffLogin.jsx), [src/pages/staff/StaffSelectBranch.jsx](../src/pages/staff/StaffSelectBranch.jsx), [src/pages/staff/StaffSelectContext.jsx](../src/pages/staff/StaffSelectContext.jsx), [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx), [src/routes/StaffProtectedRoute.jsx](../src/routes/StaffProtectedRoute.jsx).

Estados locales (`useState`): `staffUser`, `activeContext`, `contexts`.

### context/SystemAdminAuthContext.jsx

Fuente: [src/context/SystemAdminAuthContext.jsx](../src/context/SystemAdminAuthContext.jsx). 91 líneas.

Exportaciones: `SystemAdminAuthProvider`, `useSystemAdminAuth`.

Dependencias internas: [src/services/system-admin/systemAdminAuth.service.js](../src/services/system-admin/systemAdminAuth.service.js) (`systemAdminAuth`).

Consumidores directos: [src/layouts/SystemAdminLayout.jsx](../src/layouts/SystemAdminLayout.jsx), [src/main.jsx](../src/main.jsx), [src/pages/system-admin/SystemAdminDashboard.jsx](../src/pages/system-admin/SystemAdminDashboard.jsx), [src/pages/system-admin/SystemAdminLogin.jsx](../src/pages/system-admin/SystemAdminLogin.jsx), [src/routes/SystemAdminProtectedRoute.jsx](../src/routes/SystemAdminProtectedRoute.jsx).

Estados locales (`useState`): `adminUser`, `loading`.

## hooks

### hooks/menu/menu-sets/menuSet.utils.js

Fuente: [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js). 391 líneas.

Exportaciones: `MENU_SET_KIND`, `MENU_SET_PAGE_SIZE`, `CATALOG_MODE_NORMAL`, `CATALOG_MODE_SETS`, `CATALOG_MODE_MIXED`, `normalizeCatalogMode`, `getCatalogModeVisibility`, `getMenuSetAvailability`, `normalizeMenuSetOption`, `normalizeMenuSetStage`, `normalizeMenuSet`, `normalizeMenuSetCatalog`, `getMenuSetById`, `getMenuSetStageByDefinitionId`, `getMenuSetOptionById`, `isMenuSetOptionSelectable`, `getMenuSetPage`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx](../src/components/menu/shared/menu-sets/MenuCatalogModeLayout.jsx), [src/components/menu/shared/menu-sets/MenuSetCard.jsx](../src/components/menu/shared/menu-sets/MenuSetCard.jsx), [src/components/menu/shared/menu-sets/MenuSetsSection.jsx](../src/components/menu/shared/menu-sets/MenuSetsSection.jsx), [src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx](../src/components/menu/shared/menu-sets/MenuSetStageProductCard.jsx), [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js), [src/hooks/menu/menu-sets/useMenuSetBuilder.js](../src/hooks/menu/menu-sets/useMenuSetBuilder.js), [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js), [src/hooks/public/useActiveMenuPayload.js](../src/hooks/public/useActiveMenuPayload.js), [src/hooks/public/usePublicMenuLoader.js](../src/hooks/public/usePublicMenuLoader.js), [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js), [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

### hooks/menu/menu-sets/menuSetNavigationStore.js

Fuente: [src/hooks/menu/menu-sets/menuSetNavigationStore.js](../src/hooks/menu/menu-sets/menuSetNavigationStore.js). 355 líneas.

Exportaciones: `createMenuSetNavigationKey`, `getMenuSetNavigationState`, `saveMenuSetNavigationState`, `saveMenuSetCart`, `getMenuSetCart`, `saveMenuSetDraft`, `getMenuSetDraft`, `clearMenuSetDraft`, `saveMenuSetReturnPath`, `getMenuSetReturnPath`, `clearMenuSetNavigationState`, `subscribeMenuSetNavigation`, `useMenuSetNavigationState`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js), [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js), [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js), [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

### hooks/menu/menu-sets/menuSetPayload.utils.js

Fuente: [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js). 401 líneas.

Exportaciones: `MenuSetPayloadError`, `serializeMenuSetOptionSelection`, `serializeMenuSetStageSelection`, `buildMenuSetSelectionPayload`, `isMenuSetCartLine`, `buildMenuSetCartLine`, `serializeCartItemsWithMenuSets`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`normalizeModifierGroupsForKey`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`MENU_SET_KIND`).

Consumidores directos: [src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx](../src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx), [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx](../src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx), [src/components/staff/casher/directOrderPage/CashierDirectCreateOrderDialog.jsx](../src/components/staff/casher/directOrderPage/CashierDirectCreateOrderDialog.jsx), [src/hooks/menu/menu-sets/useMenuSetBuilder.js](../src/hooks/menu/menu-sets/useMenuSetBuilder.js), [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js), [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js), [src/hooks/public/cartAndOrder/usePublicTableOrder.js](../src/hooks/public/cartAndOrder/usePublicTableOrder.js), [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js), [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js), [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js).

### hooks/menu/menu-sets/useMenuSetBuilder.js

Fuente: [src/hooks/menu/menu-sets/useMenuSetBuilder.js](../src/hooks/menu/menu-sets/useMenuSetBuilder.js). 602 líneas.

Exportaciones: `useMenuSetBuilder`, `default: useMenuSetBuilder`.

Dependencias internas: [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`getMenuSetOptionById`, `getMenuSetStageByDefinitionId`, `isMenuSetOptionSelectable`, `normalizeMenuSet`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`buildMenuSetCartLine`, `buildMenuSetSelectionPayload`).

Consumidores directos: [src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx).

Estados locales (`useState`): `selectionsByStage`, `currentStep`, `error`.

### hooks/menu/menuAvailability.utils.js

Fuente: [src/hooks/menu/menuAvailability.utils.js](../src/hooks/menu/menuAvailability.utils.js). 558 líneas.

Exportaciones: `AVAILABILITY_STATUS_AVAILABLE`, `getCartLineProductId`, `getCartLineVariantId`, `buildMenuAvailabilityIndex`, `ensureMenuAvailabilityIndex`, `getMenuAvailabilityRecord`, `getEffectiveMenuAvailability`, `reconcilePendingCartAvailability`, `isCartItemAvailabilityInvalid`, `getInvalidCartItems`, `countInvalidCartItems`, `hasInvalidCartItems`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`AVAILABILITY_STATUS_NO_LONGER_SELLABLE`, `AVAILABILITY_STATUS_UNAVAILABLE_BY_SCHEDULE`, `getAvailabilityData`, `translateAvailabilityStatus`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`isPreparedItemLine`).

Consumidores directos: [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js), [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js), [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js), [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js).

### hooks/menu/modifiers/useModifierCatalogBase.js

Fuente: [src/hooks/menu/modifiers/useModifierCatalogBase.js](../src/hooks/menu/modifiers/useModifierCatalogBase.js). 485 líneas.

Exportaciones: `default: useModifierCatalogBase`.

Dependencias internas: [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js) (`getRestaurantSettings`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/services/menu/modifiers/modifierGroups.service.js](../src/services/menu/modifiers/modifierGroups.service.js) (`getModifierGroups`); [src/services/menu/modifiers/modifierCatalog.service.js](../src/services/menu/modifiers/modifierCatalog.service.js) (`getModifierCatalog`).

Consumidores directos: [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx).

Estados locales (`useState`): `settings`, `branches`, `branchId`, `sections`, `sectionId`, `categories`, `categoryId`, `products`, `selectedProductId`, `groups`, `catalogEmpty`, `catalogEmptyMessage`, `loadingSettings`, `loadingBranches`, `loadingCatalog`, `error`, `catalogVersion`.

### hooks/menu/preparedItem.utils.js

Fuente: [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js). 264 líneas.

Exportaciones: `PREPARED_ITEM_KIND`, `PREPARED_ITEM_KEY_PREFIX`, `getPreparedItemDisplayName`, `getPreparedItemConfigurationSummary`, `getPreparedItemCurrentPrice`, `getPreparedItemId`, `isPreparedItemLine`, `getPreparedItemCartKey`, `buildPreparedItemCartLine`, `getSelectedPreparedItemIds`, `isPreparedItemAlreadySelected`, `serializePreparedItemLine`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx](../src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx), [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/prepared-items/PreparedItemCard.jsx](../src/components/menu/shared/prepared-items/PreparedItemCard.jsx), [src/components/menu/shared/prepared-items/PreparedItemsSection.jsx](../src/components/menu/shared/prepared-items/PreparedItemsSection.jsx), [src/hooks/menu/menuAvailability.utils.js](../src/hooks/menu/menuAvailability.utils.js), [src/hooks/menu/usePreparedItemsCollection.js](../src/hooks/menu/usePreparedItemsCollection.js), [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js), [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js), [src/hooks/public/cartAndOrder/usePublicWebOrdering.js](../src/hooks/public/cartAndOrder/usePublicWebOrdering.js), [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js), [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js).

### hooks/menu/useMenuAvailabilityRealtime.js

Fuente: [src/hooks/menu/useMenuAvailabilityRealtime.js](../src/hooks/menu/useMenuAvailabilityRealtime.js). 226 líneas.

Exportaciones: `useMenuAvailabilityRealtime`, `default: useMenuAvailabilityRealtime`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

### hooks/menu/useMenuSectionSelection.js

Fuente: [src/hooks/menu/useMenuSectionSelection.js](../src/hooks/menu/useMenuSectionSelection.js). 178 líneas.

Exportaciones: `default: useMenuSectionSelection`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `selectedSectionId`.

### hooks/menu/usePreparedItemsCollection.js

Fuente: [src/hooks/menu/usePreparedItemsCollection.js](../src/hooks/menu/usePreparedItemsCollection.js). 428 líneas.

Exportaciones: `usePreparedItemsCollection`.

Dependencias internas: [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`getPreparedItemId`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `items`, `loading`, `error`, `collectionState`.

### hooks/menu/useTransientMessage.js

Fuente: [src/hooks/menu/useTransientMessage.js](../src/hooks/menu/useTransientMessage.js). 60 líneas.

Exportaciones: `useTransientMessage`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js), [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js), [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js), [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Estados locales (`useState`): `message`.

### hooks/plan/usePlanAccess.js

Fuente: [src/hooks/plan/usePlanAccess.js](../src/hooks/plan/usePlanAccess.js). 53 líneas.

Exportaciones: `default: usePlanAccess`.

Dependencias internas: [src/services/plan/planAccess.service.js](../src/services/plan/planAccess.service.js) (`getPlanAccess`).

Consumidores directos: [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx).

Estados locales (`useState`): `loading`, `error`, `access`.

### hooks/public/cartAndOrder/publicCartAndOrder.utils.js

Fuente: [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js). 572 líneas.

Exportaciones: `normalizeItemsForApi`, `normalizeOnlineOrderItemsForApi`, `buildPublicOrderSelectionErrorMessage`, `isActiveOrderStatus`, `isPendingLikeStatus`, `toSafeInt`, `createOnlineOrderIdempotencyKey`, `buildOnlineOrderPublicErrorMessage`, `countPublicOrderRootItems`, `buildCartPromotionMetadata`, `buildCartAvailabilityMetadata`, `mergeConfirmedOrderTotals`, `applyAvailabilityErrorToCart`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`extractApiErrorInfo`, `normalizeCompositeComponentsForKey`, `normalizeModifierGroupsForKey`, `normalizePromotionPresentation`, `safeNum`); [src/hooks/menu/menuAvailability.utils.js](../src/hooks/menu/menuAvailability.utils.js) (`getCartLineProductId`, `getCartLineVariantId`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`isPreparedItemLine`, `serializePreparedItemLine`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`isMenuSetCartLine`, `serializeCartItemsWithMenuSets`).

Consumidores directos: [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js), [src/hooks/public/cartAndOrder/usePublicTableOrder.js](../src/hooks/public/cartAndOrder/usePublicTableOrder.js), [src/hooks/public/cartAndOrder/usePublicWebOrdering.js](../src/hooks/public/cartAndOrder/usePublicWebOrdering.js), [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### hooks/public/cartAndOrder/usePublicCart.js

Fuente: [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js). 860 líneas.

Exportaciones: `usePublicCart`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildCartKey`, `buildNewItemsPricingSummary`, `buildPreparedItemErrorMessage`, `extractApiErrorInfo`, `isPreparedItemError`, `normalizeCompositeComponentsForKey`, `normalizeModifierGroupsForKey`, `safeNum`); [src/hooks/menu/menuAvailability.utils.js](../src/hooks/menu/menuAvailability.utils.js) (`countInvalidCartItems`, `getCartLineProductId`, `getCartLineVariantId`, `reconcilePendingCartAvailability`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`buildPreparedItemCartLine`, `getPreparedItemCartKey`, `getPreparedItemId`, `isPreparedItemAlreadySelected`, `isPreparedItemLine`); [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js) (`applyAvailabilityErrorToCart`, `buildCartAvailabilityMetadata`, `buildCartPromotionMetadata`); [src/hooks/menu/useTransientMessage.js](../src/hooks/menu/useTransientMessage.js) (`useTransientMessage`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`getMenuSetById`, `getMenuSetOptionById`, `getMenuSetStageByDefinitionId`, `isMenuSetOptionSelectable`, `normalizeMenuSetCatalog`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`buildMenuSetSelectionPayload`, `isMenuSetCartLine`); [src/hooks/menu/menu-sets/menuSetNavigationStore.js](../src/hooks/menu/menu-sets/menuSetNavigationStore.js) (`getMenuSetCart`, `saveMenuSetCart`).

Consumidores directos: [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js).

Estados locales (`useState`): `cart`.

### hooks/public/cartAndOrder/usePublicOrderCancellation.js

Fuente: [src/hooks/public/cartAndOrder/usePublicOrderCancellation.js](../src/hooks/public/cartAndOrder/usePublicOrderCancellation.js). 575 líneas.

Exportaciones: `usePublicOrderCancellation`.

Dependencias internas: [src/services/public/publicMenu.service.js](../src/services/public/publicMenu.service.js) (`requestOrderCancellation`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`extractApiErrorInfo`); [src/components/menu/shared/cancellation/OrderCancellationSelection.jsx](../src/components/menu/shared/cancellation/OrderCancellationSelection.jsx) (`buildOrderCancellationSelectionPayload`).

Consumidores directos: [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js).

Estados locales (`useState`): `cancellationSelection`, `cancellationActive`, `cancellationSubmitting`, `cancellationError`.

### hooks/public/cartAndOrder/usePublicTableOrder.js

Fuente: [src/hooks/public/cartAndOrder/usePublicTableOrder.js](../src/hooks/public/cartAndOrder/usePublicTableOrder.js). 1073 líneas.

Exportaciones: `usePublicTableOrder`.

Dependencias internas: [src/services/public/publicMenu.service.js](../src/services/public/publicMenu.service.js) (`appendPublicOrderItems`, `createPublicOrder`, `getPublicOrder`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildAvailabilityErrorMessage`, `extractApiErrorInfo`, `isAvailabilityErrorCode`); [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js) (`buildPublicOrderSelectionErrorMessage`, `isActiveOrderStatus`, `isPendingLikeStatus`, `mergeConfirmedOrderTotals`, `normalizeItemsForApi`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`MenuSetPayloadError`).

Consumidores directos: [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js).

Estados locales (`useState`): `pendingOrder`, `activeOrder`, `orderItems`.

### hooks/public/cartAndOrder/usePublicWebOrdering.js

Fuente: [src/hooks/public/cartAndOrder/usePublicWebOrdering.js](../src/hooks/public/cartAndOrder/usePublicWebOrdering.js). 528 líneas.

Exportaciones: `usePublicWebOrdering`.

Dependencias internas: [src/services/public/publicMenu.service.js](../src/services/public/publicMenu.service.js) (`createPublicOnlineOrder`, `quotePublicOnlineOrder`, `sendPublicWhatsapp`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildAvailabilityErrorMessage`, `extractApiErrorInfo`, `isAvailabilityErrorCode`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`isPreparedItemLine`); [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js) (`buildOnlineOrderPublicErrorMessage`, `createOnlineOrderIdempotencyKey`, `normalizeItemsForApi`, `normalizeOnlineOrderItemsForApi`).

Consumidores directos: [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js).

Estados locales (`useState`): `onlineOrderQuoting`, `onlineOrderCreating`, `onlineOrderCreated`.

### hooks/public/publicMenu.modifiers.js

Fuente: [src/hooks/public/publicMenu.modifiers.js](../src/hooks/public/publicMenu.modifiers.js). 933 líneas.

Exportaciones: `safeNum`, `safeHash`, `makeKey`, `normalizeModifierOptionDefinition`, `normalizeModifierGroupDefinition`, `getModifierSelectionCount`, `getModifierDistinctSelectionCount`, `makeComponentModifierKey`, `normalizeModifierGroupsForKey`, `buildModifierDisplayGroupsFromApiGroups`, `normalizeCompositeComponentsForKey`, `buildCartKey`, `formatComponentDetailLabel`, `buildCompositeDetailsFromDraft`, `getSelectionModeLabel`, `formatModifierGroupMeta`, `hasAnyModifierGroups`, `buildModifierContextSections`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js).

### hooks/public/publicMenu.utils.js

Fuente: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js). 1421 líneas.

Exportaciones: `getPreparedItemCartKey`, `getPreparedItemId`, `isPreparedItemLine`, `buildCartKey`, `buildCompositeDetailsFromDraft`, `buildModifierContextSections`, `buildModifierDisplayGroupsFromApiGroups`, `formatComponentDetailLabel`, `formatModifierGroupMeta`, `getModifierDistinctSelectionCount`, `getModifierSelectionCount`, `getSelectionModeLabel`, `hasAnyModifierGroups`, `makeComponentModifierKey`, `makeKey`, `normalizeCompositeComponentsForKey`, `normalizeModifierGroupDefinition`, `normalizeModifierGroupsForKey`, `normalizeModifierOptionDefinition`, `safeHash`, `safeNum`, `PUBLIC_QR_DISABLED_MSG`, `PUBLIC_QR_WRONG_MODE_MSG`, `money`, `formatModifierGroupSelectionInstruction`, `formatModifierOptionRepeatInstruction`, `translateStatus`, `translateOrderingMode`, `translateTableServiceMode`, `isQrDisabledPublicError`, `isQrWrongModeError`, `fmtMMSS`, `PROMOTION_TYPE_PROMOTIONAL_PRICE`, `PROMOTION_TYPE_BUY_X_PAY_Y`, `PROMOTION_TYPE_PRODUCT_DISCOUNT`, `normalizePromotionPresentation`, `buildNewItemsPricingSummary`, `normalizeConfirmedPricingSummary`, `buildCombinedPricingSummary`, `AVAILABILITY_STATUS_UNAVAILABLE_BY_SCHEDULE`, `AVAILABILITY_STATUS_NO_LONGER_SELLABLE`, `getAvailabilityData`, `translateAvailabilityStatus`, `getAvailabilityTone`, `getPublicAvailabilityPresentation`, `isAvailabilityBlocked`, `formatAvailabilityCaption`, `formatAvailabilityShortLabel`, `extractApiErrorInfo`, `isPreparedItemError`, `buildPreparedItemErrorMessage`, `isAvailabilityErrorCode`, `isWarehouseSelectionErrorCode`, `buildAvailabilityErrorMessage`, `getInitialWarehouseSelectionId`.

Dependencias internas: [src/hooks/public/publicMenu.modifiers.js](../src/hooks/public/publicMenu.modifiers.js) (`safeNum`).

Consumidores directos: [src/components/menu/public/online-order-checkout/OnlineOrderFulfillmentSection.jsx](../src/components/menu/public/online-order-checkout/OnlineOrderFulfillmentSection.jsx), [src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx](../src/components/menu/public/PublicOnlineOrderCheckoutModal.jsx), [src/components/menu/public/PublicSendOrderModal.jsx](../src/components/menu/public/PublicSendOrderModal.jsx), [src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx](../src/components/menu/shared/cartPanel/CartProductDetailsDialog.jsx), [src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx](../src/components/menu/shared/cartPanel/CompositeDetailBlock.jsx), [src/components/menu/shared/cartPanel/ModifierGroupsBlock.jsx](../src/components/menu/shared/cartPanel/ModifierGroupsBlock.jsx), [src/components/menu/shared/cartPanel/NewItemsSection.jsx](../src/components/menu/shared/cartPanel/NewItemsSection.jsx), [src/components/menu/shared/cartPanel/OldItemsSection.jsx](../src/components/menu/shared/cartPanel/OldItemsSection.jsx), [src/components/menu/shared/cartPanel/QtyControl.jsx](../src/components/menu/shared/cartPanel/QtyControl.jsx), [src/components/menu/shared/CompositeProductModal.jsx](../src/components/menu/shared/CompositeProductModal.jsx), [src/components/menu/shared/menu-sets/MenuSetCard.jsx](../src/components/menu/shared/menu-sets/MenuSetCard.jsx), [src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx](../src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx), [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/components/menu/shared/menu-sets/MenuSetSummary.jsx](../src/components/menu/shared/menu-sets/MenuSetSummary.jsx), [src/components/menu/shared/MenuCartDrawer.jsx](../src/components/menu/shared/MenuCartDrawer.jsx), [src/components/menu/shared/MenuCartFloatingButton.jsx](../src/components/menu/shared/MenuCartFloatingButton.jsx), [src/components/menu/shared/MenuCartPanel.jsx](../src/components/menu/shared/MenuCartPanel.jsx), [src/components/menu/shared/MenuProductCard.jsx](../src/components/menu/shared/MenuProductCard.jsx), [src/components/menu/shared/prepared-items/PreparedItemCard.jsx](../src/components/menu/shared/prepared-items/PreparedItemCard.jsx), [src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx), [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx), [src/components/menu/shared/product-extras/useProductExtrasSelection.js](../src/components/menu/shared/product-extras/useProductExtrasSelection.js), [src/components/menu/shared/ProductExtrasModal.jsx](../src/components/menu/shared/ProductExtrasModal.jsx), [src/components/menu/shared/ProductInfoModal.jsx](../src/components/menu/shared/ProductInfoModal.jsx), [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx), [src/components/menu/staff/WaiterWarehouseCreateDialog.jsx](../src/components/menu/staff/WaiterWarehouseCreateDialog.jsx), [src/components/public/PublicOrderCartBox.jsx](../src/components/public/PublicOrderCartBox.jsx), [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js), [src/hooks/menu/menuAvailability.utils.js](../src/hooks/menu/menuAvailability.utils.js), [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js), [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js), [src/hooks/public/cartAndOrder/usePublicOrderCancellation.js](../src/hooks/public/cartAndOrder/usePublicOrderCancellation.js), [src/hooks/public/cartAndOrder/usePublicTableOrder.js](../src/hooks/public/cartAndOrder/usePublicTableOrder.js), [src/hooks/public/cartAndOrder/usePublicWebOrdering.js](../src/hooks/public/cartAndOrder/usePublicWebOrdering.js), [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js), [src/hooks/public/useCompositeDrafts.js](../src/hooks/public/useCompositeDrafts.js), [src/hooks/public/usePublicMenuLoader.js](../src/hooks/public/usePublicMenuLoader.js), [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js), [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js), [src/pages/public/public-menu-entry/publicMenuEntry.helpers.js](../src/pages/public/public-menu-entry/publicMenuEntry.helpers.js), [src/pages/public/public-menu-entry/PublicMenuErrorState.jsx](../src/pages/public/public-menu-entry/PublicMenuErrorState.jsx), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

### hooks/public/useActiveMenuPayload.js

Fuente: [src/hooks/public/useActiveMenuPayload.js](../src/hooks/public/useActiveMenuPayload.js). 314 líneas.

Exportaciones: `useActiveMenuPayload`.

Dependencias internas: [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`getCatalogModeVisibility`, `normalizeCatalogMode`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

### hooks/public/useCartAndOrder.js

Fuente: [src/hooks/public/useCartAndOrder.js](../src/hooks/public/useCartAndOrder.js). 1034 líneas.

Exportaciones: `useCartAndOrder`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildCombinedPricingSummary`, `normalizeConfirmedPricingSummary`, `safeNum`); [src/hooks/public/cartAndOrder/usePublicCart.js](../src/hooks/public/cartAndOrder/usePublicCart.js) (`usePublicCart`); [src/hooks/public/cartAndOrder/usePublicWebOrdering.js](../src/hooks/public/cartAndOrder/usePublicWebOrdering.js) (`usePublicWebOrdering`); [src/hooks/public/cartAndOrder/usePublicTableOrder.js](../src/hooks/public/cartAndOrder/usePublicTableOrder.js) (`usePublicTableOrder`); [src/hooks/public/cartAndOrder/usePublicOrderCancellation.js](../src/hooks/public/cartAndOrder/usePublicOrderCancellation.js) (`usePublicOrderCancellation`); [src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js](../src/hooks/public/cartAndOrder/publicCartAndOrder.utils.js) (`toSafeInt`); [src/hooks/menu/useTransientMessage.js](../src/hooks/menu/useTransientMessage.js) (`useTransientMessage`); [src/hooks/menu/menu-sets/menuSetNavigationStore.js](../src/hooks/menu/menu-sets/menuSetNavigationStore.js) (`createMenuSetNavigationKey`, `saveMenuSetDraft`, `saveMenuSetReturnPath`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`isMenuSetCartLine`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Estados locales (`useState`): `sendOpen`, `customerName`, `partySize`, `adultCount`, `childCount`, `sending`, `pendingCancellation`.

### hooks/public/useCompositeDrafts.js

Fuente: [src/hooks/public/useCompositeDrafts.js](../src/hooks/public/useCompositeDrafts.js). 227 líneas.

Exportaciones: `useCompositeDrafts`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildCompositeDetailsFromDraft`).

Consumidores directos: [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `compositeDrafts`.

### hooks/public/useMenuProducts.js

Fuente: [src/hooks/public/useMenuProducts.js](../src/hooks/public/useMenuProducts.js). 169 líneas.

Exportaciones: `useMenuProducts`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

### hooks/public/usePublicMenuLoader.js

Fuente: [src/hooks/public/usePublicMenuLoader.js](../src/hooks/public/usePublicMenuLoader.js). 215 líneas.

Exportaciones: `usePublicMenuLoader`.

Dependencias internas: [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`PUBLIC_QR_DISABLED_MSG`, `PUBLIC_QR_WRONG_MODE_MSG`, `isQrDisabledPublicError`, `isQrWrongModeError`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`CATALOG_MODE_NORMAL`, `normalizeCatalogMode`, `normalizeMenuSetCatalog`); [src/services/public/publicMenu.service.js](../src/services/public/publicMenu.service.js) (`fetchResolvedMenu`, `fetchPublicMenuSets`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Estados locales (`useState`): `loading`, `errorMsg`, `data`, `menuSetCatalog`, `webChannelId`, `callLocked`.

### hooks/public/useTableQrSession.js

Fuente: [src/hooks/public/useTableQrSession.js](../src/hooks/public/useTableQrSession.js). 479 líneas.

Exportaciones: `useTableQrSession`.

Dependencias internas: [src/services/public/publicMenu.service.js](../src/services/public/publicMenu.service.js) (`getTableSession`, `heartbeatTableSession`, `scanTable`, `createJoinRequest`, `getJoinRequestStatus`).

Consumidores directos: [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx).

Estados locales (`useState`): `session`, `sessionBusy`, `sessionLoading`, `remainingSec`, `sessionUnavailable`, `sessionPlanBlocked`, `callToast`, `takeover`, `joinReq`.

### hooks/staff/useCashierDirectCartAndOrder.js

Fuente: [src/hooks/staff/useCashierDirectCartAndOrder.js](../src/hooks/staff/useCashierDirectCartAndOrder.js). 1765 líneas.

Exportaciones: `useCashierDirectCartAndOrder`.

Dependencias internas: [src/services/staff/casher/cashierDirectOrder.service.js](../src/services/staff/casher/cashierDirectOrder.service.js) (`appendCashierDirectOrderItems`, `createCashierDirectOrder`, `fetchCashierDirectOrder`, `removeCashierDirectOrderItem`, `reviewCashierDirectOrderStock`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildAvailabilityErrorMessage`, `buildCartKey`, `buildCombinedPricingSummary`, `buildNewItemsPricingSummary`, `buildPreparedItemErrorMessage`, `extractApiErrorInfo`, `isAvailabilityErrorCode`, `isPreparedItemError`, `normalizeCompositeComponentsForKey`, `normalizeConfirmedPricingSummary`, `normalizeModifierGroupsForKey`, `normalizePromotionPresentation`, `safeNum`); [src/hooks/menu/menuAvailability.utils.js](../src/hooks/menu/menuAvailability.utils.js) (`countInvalidCartItems`, `getCartLineProductId`, `getCartLineVariantId`, `reconcilePendingCartAvailability`); [src/components/menu/shared/cartPanel/cartPanel.utils.js](../src/components/menu/shared/cartPanel/cartPanel.utils.js) (`isOldMenuSetRoot`); [src/hooks/menu/useTransientMessage.js](../src/hooks/menu/useTransientMessage.js) (`useTransientMessage`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`buildPreparedItemCartLine`, `getPreparedItemId`, `isPreparedItemAlreadySelected`, `isPreparedItemLine`, `serializePreparedItemLine`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`isMenuSetCartLine`, `serializeCartItemsWithMenuSets`).

Consumidores directos: [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx).

Estados locales (`useState`): `cart`, `sendOpen`, `customerName`, `kitchenFlow`, `sending`, `activeOrder`, `activeSale`, `oldItems`, `stockReview`.

### hooks/staff/useStaffCartAndOrder.js

Fuente: [src/hooks/staff/useStaffCartAndOrder.js](../src/hooks/staff/useStaffCartAndOrder.js). 1694 líneas.

Exportaciones: `useStaffCartAndOrder`.

Dependencias internas: [src/services/staff/waiter/staffOrders.service.js](../src/services/staff/waiter/staffOrders.service.js) (`appendWaiterOrderItems`, `cancelOrderItems`, `createWaiterOrder`, `fetchCancellationContext`, `getCurrentTableOrder`, `getOrderById`); [src/hooks/public/publicMenu.utils.js](../src/hooks/public/publicMenu.utils.js) (`buildAvailabilityErrorMessage`, `buildCartKey`, `buildCombinedPricingSummary`, `buildNewItemsPricingSummary`, `extractApiErrorInfo`, `isAvailabilityErrorCode`, `isWarehouseSelectionErrorCode`, `normalizeCompositeComponentsForKey`, `normalizeConfirmedPricingSummary`, `normalizeModifierGroupsForKey`, `normalizePromotionPresentation`, `safeNum`); [src/hooks/menu/menuAvailability.utils.js](../src/hooks/menu/menuAvailability.utils.js) (`countInvalidCartItems`, `getCartLineProductId`, `getCartLineVariantId`, `reconcilePendingCartAvailability`); [src/hooks/menu/useTransientMessage.js](../src/hooks/menu/useTransientMessage.js) (`useTransientMessage`); [src/hooks/menu/menu-sets/menuSet.utils.js](../src/hooks/menu/menu-sets/menuSet.utils.js) (`getMenuSetOptionById`, `getMenuSetStageByDefinitionId`, `isMenuSetOptionSelectable`); [src/hooks/menu/menu-sets/menuSetPayload.utils.js](../src/hooks/menu/menu-sets/menuSetPayload.utils.js) (`isMenuSetCartLine`, `MenuSetPayloadError`, `serializeCartItemsWithMenuSets`); [src/hooks/menu/menu-sets/menuSetNavigationStore.js](../src/hooks/menu/menu-sets/menuSetNavigationStore.js) (`clearMenuSetNavigationState`, `getMenuSetCart`, `saveMenuSetCart`, `useMenuSetNavigationState`); [src/hooks/menu/preparedItem.utils.js](../src/hooks/menu/preparedItem.utils.js) (`buildPreparedItemCartLine`, `getPreparedItemCartKey`, `getPreparedItemId`, `getSelectedPreparedItemIds`, `isPreparedItemAlreadySelected`, `isPreparedItemLine`, `serializePreparedItemLine`); [src/components/menu/shared/cancellation/OrderCancellationSelection.jsx](../src/components/menu/shared/cancellation/OrderCancellationSelection.jsx) (`buildOrderCancellationSelectionPayload`).

Consumidores directos: [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx).

Estados locales (`useState`): `localCart`, `sendOpen`, `customerName`, `sending`, `activeOrder`, `oldItems`, `cancellationContext`, `cancellationSelection`, `cancellationActive`, `cancellationLoading`, `cancellationSubmitting`, `cancellationError`, `warehouseDialogOpen`, `warehouseSelectionContext`.

### hooks/usePagination.js

Fuente: [src/hooks/usePagination.js](../src/hooks/usePagination.js). 95 líneas.

Exportaciones: `default: usePagination`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/connection/netpay/NetpayTerminalsCard.jsx](../src/components/connection/netpay/NetpayTerminalsCard.jsx), [src/components/inventory/IngredientsGroupWizard.jsx](../src/components/inventory/IngredientsGroupWizard.jsx), [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx), [src/components/inventory/warehouses/WarehousesListPanel.jsx](../src/components/inventory/warehouses/WarehousesListPanel.jsx), [src/components/menu/MenuCategoriesPanel.jsx](../src/components/menu/MenuCategoriesPanel.jsx), [src/components/menu/menus/menuChannels/MenuChannelsList.jsx](../src/components/menu/menus/menuChannels/MenuChannelsList.jsx), [src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx](../src/components/menu/menus/menuContent/MenuHierarchyEditor.jsx), [src/components/menu/menus/menuContent/MenuSetsTab.jsx](../src/components/menu/menus/menuContent/MenuSetsTab.jsx), [src/components/menu/menus/MenusList.jsx](../src/components/menu/menus/MenusList.jsx), [src/components/menu/MenuSectionsPanel.jsx](../src/components/menu/MenuSectionsPanel.jsx), [src/components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx](../src/components/menu/menuSets/manage/availability/MenuSetAvailabilityResults.jsx), [src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx](../src/components/menu/menuSets/manage/capacities/MenuSetCapacityTab.jsx), [src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx](../src/components/menu/menuSets/manage/imports/MenuSetImportPreview.jsx), [src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx](../src/components/menu/menuSets/manage/stages/MenuSetStagesTab.jsx), [src/components/menu/modifiers/ModifierGroupsPanel.jsx](../src/components/menu/modifiers/ModifierGroupsPanel.jsx), [src/components/menu/modifiers/ModifierOptionsPanel.jsx](../src/components/menu/modifiers/ModifierOptionsPanel.jsx), [src/components/menu/shared/menu-sets/MenuSetStageContent.jsx](../src/components/menu/shared/menu-sets/MenuSetStageContent.jsx), [src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx](../src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx), [src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasReadOnlyNavigator.jsx), [src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx](../src/components/menu/shared/product-extras/ProductExtrasSelectionNavigator.jsx), [src/components/menu/shared/ProductVariantsModal.jsx](../src/components/menu/shared/ProductVariantsModal.jsx), [src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx](../src/components/menu/staff/cancellation-request/WaiterCancellationRequestApproval.jsx), [src/components/menu/staff/WaiterCancellationDialog.jsx](../src/components/menu/staff/WaiterCancellationDialog.jsx), [src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx](../src/components/operation/billing-settings/authorizers/OperationalAuthorizersListCard.jsx), [src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx](../src/components/operation/discounts/authorizers/DiscountAuthorizersListCard.jsx), [src/components/owner/billing/OwnerBillingPurchasesTab.jsx](../src/components/owner/billing/OwnerBillingPurchasesTab.jsx), [src/components/products/CandidatePicker.jsx](../src/components/products/CandidatePicker.jsx), [src/components/products/CompositionWizard.jsx](../src/components/products/CompositionWizard.jsx), [src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx](../src/components/staff/casher/queuePage/CashierReadyNotificationsDrawer.jsx), [src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx](../src/components/staff/casher/saleDetailPage/CashierAdjustmentCard.jsx), [src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx](../src/components/staff/casher/saleDetailPage/CashierOrderItemsCard.jsx), [src/components/staff/kitchen/KitchenPreparedItemsDrawer.jsx](../src/components/staff/kitchen/KitchenPreparedItemsDrawer.jsx), [src/components/staff/StaffAssignmentsModal.jsx](../src/components/staff/StaffAssignmentsModal.jsx), [src/components/staff/waiter/WaiterNoticesDrawer.jsx](../src/components/staff/waiter/WaiterNoticesDrawer.jsx), [src/components/variants/content/VariantAttributesContent.jsx](../src/components/variants/content/VariantAttributesContent.jsx), [src/components/variants/content/VariantAttributeValuesContent.jsx](../src/components/variants/content/VariantAttributeValuesContent.jsx), [src/components/variants/content/VariantChannelsContent.jsx](../src/components/variants/content/VariantChannelsContent.jsx), [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx), [src/components/variants/content/VariantRepairContent.jsx](../src/components/variants/content/VariantRepairContent.jsx), [src/pages/floor/BranchFloorPlanPage.jsx](../src/pages/floor/BranchFloorPlanPage.jsx), [src/pages/floor/qr/BranchQrCodesPage.jsx](../src/pages/floor/qr/BranchQrCodesPage.jsx), [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx), [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx), [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx), [src/pages/inventory/IngredientsPage.jsx](../src/pages/inventory/IngredientsPage.jsx), [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx), [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx), [src/pages/inventory/purchases/PurchasesPage.jsx](../src/pages/inventory/purchases/PurchasesPage.jsx), [src/pages/menu/menuSets/list/MenuSetsPage.jsx](../src/pages/menu/menuSets/list/MenuSetsPage.jsx), [src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx](../src/pages/menu/menuSets/manage/definitions/MenuSetStageDefinitionsPage.jsx), [src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx](../src/pages/menu/menuSets/manage/products/MenuSetStageProductsPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/CompositeComponentVariantModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/ProductModifierCatalogPage.jsx), [src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx](../src/pages/menu/modifiers/catalogs/VariantModifierCatalogPage.jsx), [src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx](../src/pages/operation/prepared-items/PreparedItemSettingsPage.jsx), [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx), [src/pages/products/ProductCompositionPage.jsx](../src/pages/products/ProductCompositionPage.jsx), [src/pages/products/ProductRecipesPage.jsx](../src/pages/products/ProductRecipesPage.jsx), [src/pages/products/ProductsPage.jsx](../src/pages/products/ProductsPage.jsx), [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/restaurant/catalog/BranchCatalogPage.jsx](../src/pages/restaurant/catalog/BranchCatalogPage.jsx), [src/pages/sales_channels/BranchSalesChannelsPage.jsx](../src/pages/sales_channels/BranchSalesChannelsPage.jsx), [src/pages/sales_channels/ChannelsProductsConfigPage.jsx](../src/pages/sales_channels/ChannelsProductsConfigPage.jsx), [src/pages/sales_channels/SalesChannelsPage.jsx](../src/pages/sales_channels/SalesChannelsPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/casher/CashierHomePage.jsx](../src/pages/staff/casher/CashierHomePage.jsx), [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx), [src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx](../src/pages/staff/casher/refunds/CashierRefundsHistoryPage.jsx), [src/pages/staff/CashRegistersPage.jsx](../src/pages/staff/CashRegistersPage.jsx), [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx), [src/pages/staff/RestaurantStaffPage.jsx](../src/pages/staff/RestaurantStaffPage.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx), [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx), [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx), [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx), [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx), [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx), [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx), [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx), [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

Estados locales (`useState`): `page`.

## layouts

### layouts/CashierLayout.jsx

Fuente: [src/layouts/CashierLayout.jsx](../src/layouts/CashierLayout.jsx). 307 líneas.

Exportaciones: `default: CashierLayout`.

Dependencias internas: [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`); [src/components/layout/CashierSidebar.jsx](../src/components/layout/CashierSidebar.jsx) (`CashierSidebar`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`useStaffAuth`); [src/services/staff/casher/cashierQueue.service.js](../src/services/staff/casher/cashierQueue.service.js) (`fetchCashierSaleQueue`); [src/services/staff/casher/cashierSession.service.js](../src/services/staff/casher/cashierSession.service.js) (`closeCashierSession`); [src/services/plan/planAccess.service.js](../src/services/plan/planAccess.service.js) (`getStaffPlanAccess`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `closing`, `planAccess`, `planAccessLoading`, `alertState`.

### layouts/RestaurantAdminLayout.jsx

Fuente: [src/layouts/RestaurantAdminLayout.jsx](../src/layouts/RestaurantAdminLayout.jsx). 304 líneas.

Exportaciones: `default: RestaurantAdminLayout`.

Dependencias internas: [src/components/layout/RestaurantAdminSidebar.jsx](../src/components/layout/RestaurantAdminSidebar.jsx) (`RestaurantAdminSidebar`); [src/services/plan/planAccess.service.js](../src/services/plan/planAccess.service.js) (`getPlanAccess`); [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js) (`getBranchesByRestaurant`); [src/components/common/AppAlert.jsx](../src/components/common/AppAlert.jsx) (`AppAlert`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `planAccess`, `planAccessLoading`, `planAccessError`, `branches`, `branchesLoading`, `alertState`.

### layouts/RestaurantOperationLayout.jsx

Fuente: [src/layouts/RestaurantOperationLayout.jsx](../src/layouts/RestaurantOperationLayout.jsx). 377 líneas.

Exportaciones: `default: RestaurantOperationLayout`.

Dependencias internas: [src/components/layout/RestaurantOperationSidebar.jsx](../src/components/layout/RestaurantOperationSidebar.jsx) (`RestaurantOperationSidebar`); [src/services/plan/planAccess.service.js](../src/services/plan/planAccess.service.js) (`getPlanAccess`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `planAccess`, `planAccessLoading`, `planAccessError`.

### layouts/SystemAdminLayout.jsx

Fuente: [src/layouts/SystemAdminLayout.jsx](../src/layouts/SystemAdminLayout.jsx). 99 líneas.

Exportaciones: `default: SystemAdminLayout`.

Dependencias internas: [src/components/layout/SystemAdminSidebar.jsx](../src/components/layout/SystemAdminSidebar.jsx) (`SystemAdminSidebar`); [src/context/SystemAdminAuthContext.jsx](../src/context/SystemAdminAuthContext.jsx) (`useSystemAdminAuth`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

## realtime

### realtime/echo.js

Fuente: [src/realtime/echo.js](../src/realtime/echo.js). 53 líneas.

Exportaciones: `default: echo`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx), [src/pages/public/PublicMenuEntryPage.jsx](../src/pages/public/PublicMenuEntryPage.jsx), [src/pages/staff/casher/CashierDirectOrderPage.jsx](../src/pages/staff/casher/CashierDirectOrderPage.jsx), [src/pages/staff/casher/CashierQueuePage.jsx](../src/pages/staff/casher/CashierQueuePage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrderDetailPage.jsx), [src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx](../src/pages/staff/casher/onlineOrders/CashierOnlineOrdersPage.jsx), [src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js](../src/pages/staff/casher/onlineOrders/payment/useCashierOnlineOrderPaymentLoad.js), [src/pages/staff/kitchen/KitchenDashboard.jsx](../src/pages/staff/kitchen/KitchenDashboard.jsx), [src/pages/staff/waiter/StaffMenuEntryPage.jsx](../src/pages/staff/waiter/StaffMenuEntryPage.jsx), [src/pages/staff/waiter/WaiterTablesGrid.jsx](../src/pages/staff/waiter/WaiterTablesGrid.jsx), [src/realtime/TestEventPage.jsx](../src/realtime/TestEventPage.jsx).

### realtime/TestEventPage.jsx

Fuente: [src/realtime/TestEventPage.jsx](../src/realtime/TestEventPage.jsx). 80 líneas.

Exportaciones: `default: TestEventPage`.

Dependencias internas: [src/realtime/echo.js](../src/realtime/echo.js) (`echo`).

Consumidores directos: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx).

Estados locales (`useState`): `logs`.

## seo

### seo/PublicPrerenderApp.jsx

Fuente: [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx). 207 líneas.

Exportaciones: `default: PublicPrerenderApp`.

Dependencias internas: [src/theme/theme.js](../src/theme/theme.js) (`theme`); [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx) (`HomePage`); [src/pages/landing/contact/LandingContactPage.jsx](../src/pages/landing/contact/LandingContactPage.jsx) (`LandingContactPage`); [src/pages/landing/plans/LandingPlansPage.jsx](../src/pages/landing/plans/LandingPlansPage.jsx) (`LandingPlansPage`); [src/pages/landing/terms/LandingTermsPage.jsx](../src/pages/landing/terms/LandingTermsPage.jsx) (`LandingTermsPage`); [src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx) (`BlogPostDetailPage`); [src/pages/landing/blog/BlogPostsPage.jsx](../src/pages/landing/blog/BlogPostsPage.jsx) (`BlogPostsPage`); [src/pages/landing/resources/MenuQrCanvaPage.jsx](../src/pages/landing/resources/MenuQrCanvaPage.jsx) (`MenuQrCanvaPage`); [src/pages/landing/resources/ComoElegirMenuQrPage.jsx](../src/pages/landing/resources/ComoElegirMenuQrPage.jsx) (`ComoElegirMenuQrPage`).

Consumidores directos: [src/main.jsx](../src/main.jsx).

## styles

### styles/landing.css

Fuente: [src/styles/landing.css](../src/styles/landing.css). 278 líneas.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

## theme

### theme/landingTheme.js

Fuente: [src/theme/landingTheme.js](../src/theme/landingTheme.js). 468 líneas.

Exportaciones: `default: landingTheme`, `landingColors`, `landingTypography`, `landingButtonSx`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/landing/footer/LandingFooter.jsx](../src/components/landing/footer/LandingFooter.jsx), [src/components/landing/home/HomeBenefitsSection.jsx](../src/components/landing/home/HomeBenefitsSection.jsx), [src/components/landing/home/HomeBusinessTypesSection.jsx](../src/components/landing/home/HomeBusinessTypesSection.jsx), [src/components/landing/home/HomeDemoSection.jsx](../src/components/landing/home/HomeDemoSection.jsx), [src/components/landing/home/HomeFaqSection.jsx](../src/components/landing/home/HomeFaqSection.jsx), [src/components/landing/home/HomeFeaturesSection.jsx](../src/components/landing/home/HomeFeaturesSection.jsx), [src/components/landing/home/HomePlansPreviewSection.jsx](../src/components/landing/home/HomePlansPreviewSection.jsx), [src/components/landing/home/HomeSolutionsSection.jsx](../src/components/landing/home/HomeSolutionsSection.jsx), [src/components/landing/home/HomeTestimonialsSection.jsx](../src/components/landing/home/HomeTestimonialsSection.jsx), [src/components/landing/home/HomeThermalPrintingSection.jsx](../src/components/landing/home/HomeThermalPrintingSection.jsx), [src/components/landing/menu/LandingMenu.jsx](../src/components/landing/menu/LandingMenu.jsx), [src/pages/landing/blog/BlogFilteredPostsPage.jsx](../src/pages/landing/blog/BlogFilteredPostsPage.jsx), [src/pages/landing/blog/BlogPostDetailPage.jsx](../src/pages/landing/blog/BlogPostDetailPage.jsx), [src/pages/landing/blog/BlogPostsPage.jsx](../src/pages/landing/blog/BlogPostsPage.jsx), [src/pages/landing/contact/LandingContactPage.jsx](../src/pages/landing/contact/LandingContactPage.jsx), [src/pages/landing/home/HomePage.jsx](../src/pages/landing/home/HomePage.jsx), [src/pages/landing/plans/LandingPlansPage.jsx](../src/pages/landing/plans/LandingPlansPage.jsx), [src/pages/landing/terms/LandingTermsPage.jsx](../src/pages/landing/terms/LandingTermsPage.jsx).

### theme/theme.js

Fuente: [src/theme/theme.js](../src/theme/theme.js). 340 líneas.

Exportaciones: `default: theme`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/main.jsx](../src/main.jsx), [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx).

## utils

### utils/err.js

Fuente: [src/utils/err.js](../src/utils/err.js). 11 líneas.

Exportaciones: `normalizeErr`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/inventory/IngredientFormModal.jsx](../src/components/inventory/IngredientFormModal.jsx), [src/components/inventory/IngredientGroupUpsertModal.jsx](../src/components/inventory/IngredientGroupUpsertModal.jsx), [src/components/inventory/IngredientPresentationFormModal.jsx](../src/components/inventory/IngredientPresentationFormModal.jsx), [src/components/inventory/IngredientsGroupWizard.jsx](../src/components/inventory/IngredientsGroupWizard.jsx), [src/components/inventory/SupplierUpsertModal.jsx](../src/components/inventory/SupplierUpsertModal.jsx), [src/components/inventory/SupplierWizard.jsx](../src/components/inventory/SupplierWizard.jsx), [src/components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx](../src/components/system-admin/owners/detail/SystemOwnerRestaurantUpsertModal.jsx), [src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx](../src/components/system-admin/owners/restaurants/branches/addons/SystemBranchAddonAssignModal.jsx), [src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx](../src/components/system-admin/owners/restaurants/branches/SystemRestaurantBranchUpsertModal.jsx), [src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx](../src/components/system-admin/owners/restaurants/subscriptions/SystemRestaurantSubscriptionAssignModal.jsx), [src/components/system-admin/owners/tabs/SystemOwnerAccountTab.jsx](../src/components/system-admin/owners/tabs/SystemOwnerAccountTab.jsx), [src/components/variants/content/VariantAttributeFormContent.jsx](../src/components/variants/content/VariantAttributeFormContent.jsx), [src/components/variants/content/VariantAttributesContent.jsx](../src/components/variants/content/VariantAttributesContent.jsx), [src/components/variants/content/VariantCreateContent.jsx](../src/components/variants/content/VariantCreateContent.jsx), [src/pages/inventory/IngredientPresentationsPage.jsx](../src/pages/inventory/IngredientPresentationsPage.jsx), [src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx](../src/pages/inventory/ingredients/inventoryMovement/IngredientInventoryMovementPage.jsx), [src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx](../src/pages/inventory/ingredients/inventoryStock/IngredientInventoryStockPage.jsx), [src/pages/inventory/IngredientsPage.jsx](../src/pages/inventory/IngredientsPage.jsx), [src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx](../src/pages/inventory/products/inventoryMovement/ProductInventoryMovementPage.jsx), [src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx](../src/pages/inventory/products/inventoryStock/ProductInventoryStockPage.jsx), [src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx](../src/pages/owner/addon-history/RestaurantAddonHistoryPage.jsx), [src/pages/products/products_variants/ProductVariantsPage.jsx](../src/pages/products/products_variants/ProductVariantsPage.jsx), [src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx](../src/pages/system-admin/addon-sales/SystemAddonSalesPage.jsx), [src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx](../src/pages/system-admin/billing/invoices/SystemPlatformInvoicesPage.jsx), [src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx](../src/pages/system-admin/billing/purchases/SystemPlatformPurchasesPage.jsx), [src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx](../src/pages/system-admin/owners/restaurants/addons/SystemBranchAddonsPage.jsx), [src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx](../src/pages/system-admin/owners/restaurants/SystemOwnerRestaurantDetailPage.jsx), [src/pages/system-admin/owners/SystemOwnerDetailPage.jsx](../src/pages/system-admin/owners/SystemOwnerDetailPage.jsx), [src/pages/system-admin/owners/SystemOwnersPage.jsx](../src/pages/system-admin/owners/SystemOwnersPage.jsx), [src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx](../src/pages/system-admin/subscription-sales/SystemSubscriptionSalesPage.jsx).

### utils/getByPath.js

Fuente: [src/utils/getByPath.js](../src/utils/getByPath.js). 11 líneas.

Exportaciones: `getByPath`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/staff/StaffUpsertModal.jsx](../src/components/staff/StaffUpsertModal.jsx).

### utils/phone.js

Fuente: [src/utils/phone.js](../src/utils/phone.js). 6 líneas.

Exportaciones: `normalizePhone`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/auth/ForgotPasswordModal.jsx](../src/components/auth/ForgotPasswordModal.jsx), [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx).

### utils/subscriptionGuards.js

Fuente: [src/utils/subscriptionGuards.js](../src/utils/subscriptionGuards.js). 20 líneas.

Exportaciones: `handleRestaurantApiError`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/restaurant/BranchUpsertModal.jsx](../src/components/restaurant/BranchUpsertModal.jsx), [src/pages/restaurant/BranchesPage.jsx](../src/pages/restaurant/BranchesPage.jsx).

### utils/useFormApiHandler.js

Fuente: [src/utils/useFormApiHandler.js](../src/utils/useFormApiHandler.js). 45 líneas.

Exportaciones: `handleFormApiError`.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/components/auth/ForgotPasswordModal.jsx](../src/components/auth/ForgotPasswordModal.jsx), [src/components/connection/tae/TaeAccountCard.jsx](../src/components/connection/tae/TaeAccountCard.jsx), [src/components/connection/tae/TaeInvoiceSettingsCard.jsx](../src/components/connection/tae/TaeInvoiceSettingsCard.jsx), [src/components/floor/OperationalSettingsModal.jsx](../src/components/floor/OperationalSettingsModal.jsx), [src/components/floor/TableModal.jsx](../src/components/floor/TableModal.jsx), [src/components/floor/ZoneModal.jsx](../src/components/floor/ZoneModal.jsx), [src/components/staff/StaffAssignmentsModal.jsx](../src/components/staff/StaffAssignmentsModal.jsx), [src/components/staff/StaffUpsertModal.jsx](../src/components/staff/StaffUpsertModal.jsx), [src/pages/auth/Login.jsx](../src/pages/auth/Login.jsx), [src/pages/auth/Register.jsx](../src/pages/auth/Register.jsx), [src/pages/staff/StaffLogin.jsx](../src/pages/staff/StaffLogin.jsx), [src/pages/staff/StaffSelectBranch.jsx](../src/pages/staff/StaffSelectBranch.jsx), [src/pages/staff/StaffSelectContext.jsx](../src/pages/staff/StaffSelectContext.jsx), [src/pages/system-admin/SystemAdminLogin.jsx](../src/pages/system-admin/SystemAdminLogin.jsx).

## otros

### App.css

Fuente: [src/App.css](../src/App.css). 43 líneas.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

### App.jsx

Fuente: [src/App.jsx](../src/App.jsx). 15 líneas.

Exportaciones: `default: App`.

Dependencias internas: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx) (`AppRoutes`); [src/components/shared/AxiosAuthInterceptor.jsx](../src/components/shared/AxiosAuthInterceptor.jsx) (`AxiosAuthInterceptor`).

Consumidores directos: [src/main.jsx](../src/main.jsx).

### index.css

Fuente: [src/index.css](../src/index.css). 4 líneas.

Dependencias internas: ninguna importación directa detectada.

Consumidores directos: [src/main.jsx](../src/main.jsx).

### main.jsx

Fuente: [src/main.jsx](../src/main.jsx). 156 líneas.

Dependencias internas: [src/App.jsx](../src/App.jsx) (`App`); [src/seo/PublicPrerenderApp.jsx](../src/seo/PublicPrerenderApp.jsx) (`PublicPrerenderApp`); [src/theme/theme.js](../src/theme/theme.js) (`theme`); [src/context/AuthContext.jsx](../src/context/AuthContext.jsx) (`AuthProvider`); [src/context/StaffAuthContext.jsx](../src/context/StaffAuthContext.jsx) (`StaffAuthProvider`); [src/context/SystemAdminAuthContext.jsx](../src/context/SystemAdminAuthContext.jsx) (`SystemAdminAuthProvider`); [src/index.css](../src/index.css) ().

Consumidores directos: ninguno en src; revisar scripts, referencias CSS o uso externo antes de considerarlo obsoleto.

