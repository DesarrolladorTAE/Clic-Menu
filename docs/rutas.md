# Rutas y navegación

[Volver al índice](../README.md)

Fuente: [src/routes/AppRoutes.jsx](../src/routes/AppRoutes.jsx). Rutas completas compuestas a partir de los padres JSX. Los padres con layout y las rutas índice pueden compartir URL; se conservan ambos registros. `:parametro` identifica parámetros de React Router. Los guards de personal comprueban autenticación, sin una restricción universal de rol en el router.

| URL | Elemento | Guard y layout heredados | Redirección |
| --- | --- | --- | --- |
| `/` | `HomePage` | pública | `` |
| `/planes` | `LandingPlansPage` | pública | `` |
| `/contacto` | `LandingContactPage` | pública | `` |
| `/terminos-y-condiciones` | `LandingTermsPage` | pública | `` |
| `/recursos/menu-qr-con-canva` | `MenuQrCanvaPage` | pública | `` |
| `/recursos/como-elegir-menu-qr` | `ComoElegirMenuQrPage` | pública | `` |
| `/menu/:token` | `PublicMenuEntryPage` | pública | `` |
| `/menu/:token/conjuntos/:menuSetId` | `MenuSetBuilderPage` | pública | `` |
| `/order/:trackingToken` | `PublicOnlineOrderTrackingPage` | pública | `` |
| `/invoice/:token` | `PublicInvoicePage` | pública | `` |
| `/test-mui` | `TestMui` | pública | `` |
| `/test-event` | `TestEventPage` | pública | `` |
| `/blog` | `BlogPostsPage` | pública | `` |
| `/blog/:postSlug` | `BlogPostDetailPage` | pública | `` |
| `/blog/categorias/:categorySlug` | `BlogFilteredPostsPage` | pública | `` |
| `/blog/etiquetas/:tagSlug` | `BlogFilteredPostsPage` | pública | `` |
| `/auth/register` | `Register` | pública | `` |
| `/auth/login` | `Login` | pública | `` |
| `/system-admin/login` | `SystemAdminLogin` | pública | `` |
| `/staff/login` | `StaffLogin` | pública | `` |
| `/staff/select-context` | `StaffSelectContext` | StaffProtectedRoute | `` |
| `/staff/waiter/tables/grid` | `WaiterTablesGrid` | StaffProtectedRoute | `` |
| `/staff/waiter/tables/:tableId/order` | `StaffMenuEntryPage` | StaffProtectedRoute | `` |
| `/staff/waiter/tables/:tableId/order/conjuntos/:menuSetId` | `MenuSetBuilderPage` | StaffProtectedRoute | `` |
| `/staff/kitchen` | `KitchenDashboard` | StaffProtectedRoute | `` |
| `/staff/cashier` | `CashierHomePage` | StaffProtectedRoute | `` |
| `/staff/cashier` | `CashierLayout` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/queue` | `CashierQueuePage` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/direct-order` | `CashierDirectOrderPage` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/direct-order/conjuntos/:menuSetId` | `MenuSetBuilderPage` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/online-orders` | `CashierOnlineOrdersPage` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/online-orders/:onlineOrderId` | `CashierOnlineOrderDetailPage` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/online-orders/:onlineOrderId/payment` | `CashierOnlineOrderPaymentPage` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/refunds` | `CashierRefundsHistoryPage` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/customers` | `CashierCustomersPage` | StaffProtectedRoute → CashierLayout | `` |
| `/staff/cashier/sales/:saleId` | `CashierSaleDetailPage` | StaffProtectedRoute | `` |
| `/app` | `Dashboard` | ProtectedRoute | `` |
| `/owner/restaurants-home` | `MyRestaurantsHome` | OwnerRoute | `` |
| `/owner/billing` | `OwnerBillingPage` | OwnerRoute | `` |
| `/owner/restaurants/:restaurantId` | `RestaurantAdminLayout` | OwnerRoute → RestaurantAdminLayout | `` |
| `/owner/restaurants/:restaurantId/edit-info` | `RestaurantEdit` | OwnerRoute → RestaurantAdminLayout | `` |
| `/owner/restaurants/:restaurantId/settings` | `RestaurantSettings` | OwnerRoute → RestaurantAdminLayout | `` |
| `/owner/restaurants/:restaurantId/branches` | `BranchesPage` | OwnerRoute → RestaurantAdminLayout | `` |
| `/owner/restaurants/:restaurantId/sales-channels` | `SalesChannelsPage` | OwnerRoute → RestaurantAdminLayout | `` |
| `/owner/restaurants/:restaurantId/operation` | `RestaurantOperationLayout` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation` | `Navigate` | OwnerRoute → RestaurantOperationLayout | `<Navigate to="branch-settings" replace />` |
| `/owner/restaurants/:restaurantId/operation/branch-settings` | `BranchSettingsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/staff` | `StaffPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/ingredients` | `IngredientsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/ingredients/:ingredientId/presentations` | `IngredientPresentationsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/warehouses` | `WarehousesPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/warehouses/inventory-report` | `InventoryReportPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/warehouses/:warehouseId/ingredient-stocks` | `IngredientInventoryStockPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/warehouses/:warehouseId/product-stocks` | `ProductInventoryStockPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/warehouses/:warehouseId/ingredient-movements` | `IngredientInventoryMovementPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/warehouses/:warehouseId/product-movements` | `ProductInventoryMovementPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/purchases` | `PurchasesPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/purchases/:purchaseId` | `PurchaseDetailPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/branch-sales-channels` | `BranchSalesChannelsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/branches/:branchId/sales-channels/:salesChannelId/products` | `ChannelProductsConfigPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu-sets` | `MenuSetsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu-sets/new` | `MenuSetCreatePage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu-sets/panel-operativo` | `OwnerOperationalDashboardPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu-sets/:menuSetId` | `MenuSetManagePage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu-sets/:menuSetId/stages/:stageId/products` | `MenuSetStageProductsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu-sets/:menuSetId/stage-definitions` | `MenuSetStageDefinitionsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menus` | `MenuListPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menus/:menuId/content` | `MenuContentPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menus/:menuId/channels` | `MenuChannelsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu` | `MenuManager` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu/products` | `ProductsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu/products/:productId/variants` | `ProductVariantsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu/products/:productId/recipes` | `ProductRecipesPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/menu/products/:productId/components` | `ProductCompositionPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/catalog` | `BranchCatalogPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/promotions` | `PromotionsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/promotions/create` | `PromotionCreatePage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/promotions/:promotionId/edit` | `PromotionEditPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/modifiers` | `ModifierManager` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/modifiers/catalogs/products` | `ProductModifierCatalogPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/modifiers/catalogs/variants` | `VariantModifierCatalogPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/modifiers/catalogs/components` | `CompositeComponentModifierCatalogPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/modifiers/catalogs/component-variants` | `CompositeComponentVariantModifierCatalogPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/tables` | `BranchFloorPlanPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/tables/qr-codes` | `BranchQrCodesPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/cash-registers` | `CashRegistersPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/online-orders` | `OnlineOrdersPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/prepared-items` | `PreparedItemSettingsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/billing-settings` | `BillingSettingsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/discounts` | `DiscountsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/ticket-settings` | `TicketSettingsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/public-menu-settings` | `PublicMenuSettingsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/customer-loyalty-settings` | `CustomerLoyaltySettingsPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/reports/sales` | `SalesReportPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/reports/profit` | `ProfitReportPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/connections/whasapo` | `WhasapoConnectionPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/connections/taeconta` | `TaecontaAccountPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/operation/connections/netpay` | `NetpayConnectionPage` | OwnerRoute → RestaurantOperationLayout | `` |
| `/owner/restaurants/:restaurantId/plans` | `RestaurantPlans` | OwnerRoute | `` |
| `/owner/restaurants/:restaurantId/subscriptions` | `RestaurantSubscriptionHistoryPage` | OwnerRoute | `` |
| `/owner/restaurants/:restaurantId/addons` | `RestaurantAddonHistoryPage` | OwnerRoute | `` |
| `/system-admin` | `SystemAdminLayout` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin` | `SystemAdminDashboard` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin/owners` | `SystemOwnersPage` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin/owners/:ownerId` | `SystemOwnerDetailPage` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin/owners/:ownerId/restaurants/:restaurantId` | `SystemOwnerRestaurantDetailPage` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin/owners/:ownerId/restaurants/:restaurantId/branches/:branchId/addons` | `SystemBranchAddonsPage` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin/subscription-sales` | `SystemSubscriptionSalesPage` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin/addon-sales` | `SystemAddonSalesPage` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin/billing/purchases` | `SystemPlatformPurchasesPage` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/system-admin/billing/invoices` | `SystemPlatformInvoicesPage` | SystemAdminProtectedRoute → SystemAdminLayout | `` |
| `/*` | `Navigate` | pública | `<Navigate to="/auth/login" replace />` |

Las rutas /test-mui y /test-event están declaradas como públicas. La ruta comodín redirige a /auth/login. No hay ruta /staff/app declarada aunque el interceptor la usa como destino alternativo en state. Los nombres de carpetas casher, whasapo y products_variants se conservan tal como aparecen en el repositorio.

