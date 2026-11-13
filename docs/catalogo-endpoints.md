# Catálogo de llamadas HTTP

[Volver al índice](../README.md) · [Integración y contratos](integracion-api.md)

Cada fila del inventario principal procede de una llamada ejecutable analizada mediante AST, sin tomar endpoints de comentarios. Son llamadas implementadas, no tráfico capturado ni pruebas contra el backend. Las expresiones `${...}` conservan los identificadores reales; no son URLs literales. Las funciones auxiliares y constantes de ruta se muestran después de cada tabla cuando intervienen. Los argumentos adicionales muestran una representación compacta del cuerpo y/o las opciones Axios; sus variables se resuelven en la fuente enlazada. El inventario de módulos indica consumidores y permite distinguir código disponible de código conectado.

Los métodos corresponden al verbo Axios. En fetch se conserva la configuración para verificar el método explícito. Base URL y credenciales: consultar integración. No se publican valores de .env.

## Navegación del anexo

- [realtime/echo.js](#realtimeechojs)
- [services/auth/auth.service.js](#servicesauthauthservicejs)
- [services/connection/netpay/netpayTerminal.service.js](#servicesconnectionnetpaynetpayterminalservicejs)
- [services/connection/tae/taeAccount.service.js](#servicesconnectiontaetaeaccountservicejs)
- [services/connection/tae/taeInvoiceSetting.service.js](#servicesconnectiontaetaeinvoicesettingservicejs)
- [services/connection/tae/taeTaxProfile.service.js](#servicesconnectiontaetaetaxprofileservicejs)
- [services/connection/whatsapp/chatingBootConnection.service.js](#servicesconnectionwhatsappchatingbootconnectionservicejs)
- [services/floor/operationalSettings.service.js](#servicesflooroperationalsettingsservicejs)
- [services/floor/qr/branchQrCodes.service.js](#servicesfloorqrbranchqrcodesservicejs)
- [services/floor/tables.service.js](#servicesfloortablesservicejs)
- [services/floor/zones.service.js](#servicesfloorzonesservicejs)
- [services/inventory/ingredients/ingredientPresentations.service.js](#servicesinventoryingredientsingredientpresentationsservicejs)
- [services/inventory/ingredients/ingredients.service.js](#servicesinventoryingredientsingredientsservicejs)
- [services/inventory/ingredients/ingredientsGroups.service.js](#servicesinventoryingredientsingredientsgroupsservicejs)
- [services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js](#servicesinventoryingredientsinventorymovementinventorymovementservicejs)
- [services/inventory/ingredients/inventoryStock/inventoryStock.service.js](#servicesinventoryingredientsinventorystockinventorystockservicejs)
- [services/inventory/products/inventoryMovement/inventoryMovement.service.js](#servicesinventoryproductsinventorymovementinventorymovementservicejs)
- [services/inventory/products/inventoryStock/inventoryStock.service.js](#servicesinventoryproductsinventorystockinventorystockservicejs)
- [services/inventory/purchases/purchases.service.js](#servicesinventorypurchasespurchasesservicejs)
- [services/inventory/recipes/productRecipes.service.js](#servicesinventoryrecipesproductrecipesservicejs)
- [services/inventory/suppliers/suppliers.service.js](#servicesinventorysupplierssuppliersservicejs)
- [services/inventory/warehouses/warehouses.service.js](#servicesinventorywarehouseswarehousesservicejs)
- [services/landing/publicPlans.service.js](#serviceslandingpublicplansservicejs)
- [services/legal/legalDocuments.service.js](#serviceslegallegaldocumentsservicejs)
- [services/management/settings/branchSettings.service.js](#servicesmanagementsettingsbranchsettingsservicejs)
- [services/menu/categories.service.js](#servicesmenucategoriesservicejs)
- [services/menu/menus/menuChannels/menuChannels.service.js](#servicesmenumenusmenuchannelsmenuchannelsservicejs)
- [services/menu/menus/menuContent/menuContent.service.js](#servicesmenumenusmenucontentmenucontentservicejs)
- [services/menu/menus/menuContent/menuSetAssignment.service.js](#servicesmenumenusmenucontentmenusetassignmentservicejs)
- [services/menu/menus/menus.service.js](#servicesmenumenusmenusservicejs)
- [services/menu/menuSections.service.js](#servicesmenumenusectionsservicejs)
- [services/menu/menuSets/dashboard/operationalDashboard.service.js](#servicesmenumenusetsdashboardoperationaldashboardservicejs)
- [services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js](#servicesmenumenusetsdashboardownerimportupdatesdashboardservicejs)
- [services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js](#servicesmenumenusetsdashboardownerinventorydashboardservicejs)
- [services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js](#servicesmenumenusetsdashboardownermenusetsdashboardservicejs)
- [services/menu/menuSets/dashboard/ownerProductsDashboard.service.js](#servicesmenumenusetsdashboardownerproductsdashboardservicejs)
- [services/menu/menuSets/dashboard/ownerReminders.service.js](#servicesmenumenusetsdashboardownerremindersservicejs)
- [services/menu/menuSets/menuSet.service.js](#servicesmenumenusetsmenusetservicejs)
- [services/menu/menuSets/menuSetAvailability.service.js](#servicesmenumenusetsmenusetavailabilityservicejs)
- [services/menu/menuSets/menuSetImport.service.js](#servicesmenumenusetsmenusetimportservicejs)
- [services/menu/menuSets/menuSetManagement.service.js](#servicesmenumenusetsmenusetmanagementservicejs)
- [services/menu/menuSets/menuSetProduct.service.js](#servicesmenumenusetsmenusetproductservicejs)
- [services/menu/menuSets/menuSetStage.service.js](#servicesmenumenusetsmenusetstageservicejs)
- [services/menu/menuSets/menuSetStageDefinition.service.js](#servicesmenumenusetsmenusetstagedefinitionservicejs)
- [services/menu/modifiers/compositeComponentModifierGroups.service.js](#servicesmenumodifierscompositecomponentmodifiergroupsservicejs)
- [services/menu/modifiers/compositeComponentVariantModifierGroups.service.js](#servicesmenumodifierscompositecomponentvariantmodifiergroupsservicejs)
- [services/menu/modifiers/modifierCatalog.service.js](#servicesmenumodifiersmodifiercatalogservicejs)
- [services/menu/modifiers/modifierGroups.service.js](#servicesmenumodifiersmodifiergroupsservicejs)
- [services/menu/modifiers/modifierOptionConsumption.service.js](#servicesmenumodifiersmodifieroptionconsumptionservicejs)
- [services/menu/modifiers/modifierOptions.service.js](#servicesmenumodifiersmodifieroptionsservicejs)
- [services/menu/modifiers/productModifierGroups.service.js](#servicesmenumodifiersproductmodifiergroupsservicejs)
- [services/menu/modifiers/variantModifierGroups.service.js](#servicesmenumodifiersvariantmodifiergroupsservicejs)
- [services/menu/promotions/promotion.service.js](#servicesmenupromotionspromotionservicejs)
- [services/menu/promotions/promotionForm.service.js](#servicesmenupromotionspromotionformservicejs)
- [services/operation/billing-settings/branchBillingSettings.service.js](#servicesoperationbilling-settingsbranchbillingsettingsservicejs)
- [services/operation/billing-settings/operationalAuthorizers.service.js](#servicesoperationbilling-settingsoperationalauthorizersservicejs)
- [services/operation/discounts/discountAuthorizers.service.js](#servicesoperationdiscountsdiscountauthorizersservicejs)
- [services/operation/discounts/discountPolicy.service.js](#servicesoperationdiscountsdiscountpolicyservicejs)
- [services/operation/loyalty/customerLoyaltySettings.service.js](#servicesoperationloyaltycustomerloyaltysettingsservicejs)
- [services/operation/online-orders/onlineOrderActivation.service.js](#servicesoperationonline-ordersonlineorderactivationservicejs)
- [services/operation/online-orders/onlineOrderPayments.service.js](#servicesoperationonline-ordersonlineorderpaymentsservicejs)
- [services/operation/online-orders/onlineOrders.service.js](#servicesoperationonline-ordersonlineordersservicejs)
- [services/operation/prepared-items/preparedItemSettings.service.js](#servicesoperationprepared-itemsprepareditemsettingsservicejs)
- [services/operation/ticket/branchPrintSetting.service.js](#servicesoperationticketbranchprintsettingservicejs)
- [services/operation/ticket/branchWhasapoSetting.service.js](#servicesoperationticketbranchwhasaposettingservicejs)
- [services/operation/ticket/ticketSettings.service.js](#servicesoperationticketticketsettingsservicejs)
- [services/owner/addon.service.js](#servicesowneraddonservicejs)
- [services/owner/ownerProfile.service.js](#servicesownerownerprofileservicejs)
- [services/owner/plan.service.js](#servicesownerplanservicejs)
- [services/owner/platformBilling.service.js](#servicesownerplatformbillingservicejs)
- [services/owner/taxProfile.service.js](#servicesownertaxprofileservicejs)
- [services/paypal/paypal.service.js](#servicespaypalpaypalservicejs)
- [services/plan/planAccess.service.js](#servicesplanplanaccessservicejs)
- [services/products/catalog/productComponents.service.js](#servicesproductscatalogproductcomponentsservicejs)
- [services/products/catalog/productInventoryType.service.js](#servicesproductscatalogproductinventorytypeservicejs)
- [services/products/catalog/productType.service.js](#servicesproductscatalogproducttypeservicejs)
- [services/products/products.service.js](#servicesproductsproductsservicejs)
- [services/products/sales_channels/productChannel.service.js](#servicesproductssales_channelsproductchannelservicejs)
- [services/products/sales_channels/sales_channels.service.js](#servicesproductssales_channelssales_channelsservicejs)
- [services/products/variants/productVariantChannels.service.js](#servicesproductsvariantsproductvariantchannelsservicejs)
- [services/products/variants/productVariantGenerator.service.js](#servicesproductsvariantsproductvariantgeneratorservicejs)
- [services/products/variants/productVariantImages.service.js](#servicesproductsvariantsproductvariantimagesservicejs)
- [services/products/variants/productVariants.service.js](#servicesproductsvariantsproductvariantsservicejs)
- [services/products/variants/variantAttributes.service.js](#servicesproductsvariantsvariantattributesservicejs)
- [services/products/variants/variantAttributeValues.service.js](#servicesproductsvariantsvariantattributevaluesservicejs)
- [services/public/clicMenuBlog.service.js](#servicespublicclicmenublogservicejs)
- [services/public/order-tracking/publicOrderTracking.service.js](#servicespublicorder-trackingpublicordertrackingservicejs)
- [services/public/publicInvoice.service.js](#servicespublicpublicinvoiceservicejs)
- [services/public/publicMenu.service.js](#servicespublicpublicmenuservicejs)
- [services/public-menu/branchPublicMenu.service.js](#servicespublic-menubranchpublicmenuservicejs)
- [services/referrals/referral.service.js](#servicesreferralsreferralservicejs)
- [services/reports/inventoryReport.service.js](#servicesreportsinventoryreportservicejs)
- [services/reports/profitReport.service.js](#servicesreportsprofitreportservicejs)
- [services/reports/salesReport.service.js](#servicesreportssalesreportservicejs)
- [services/restaurant/branch.service.js](#servicesrestaurantbranchservicejs)
- [services/restaurant/branchCatalog.service.js](#servicesrestaurantbranchcatalogservicejs)
- [services/restaurant/branchSalesChannels.service.js](#servicesrestaurantbranchsaleschannelsservicejs)
- [services/restaurant/demoContent.service.js](#servicesrestaurantdemocontentservicejs)
- [services/restaurant/restaurant.service.js](#servicesrestaurantrestaurantservicejs)
- [services/restaurant/restaurantSettings.service.js](#servicesrestaurantrestaurantsettingsservicejs)
- [services/staff/casher/cashierAdjustment.service.js](#servicesstaffcashercashieradjustmentservicejs)
- [services/staff/casher/cashierCustomer.service.js](#servicesstaffcashercashiercustomerservicejs)
- [services/staff/casher/cashierCustomerPoints.service.js](#servicesstaffcashercashiercustomerpointsservicejs)
- [services/staff/casher/cashierDirectOrder.service.js](#servicesstaffcashercashierdirectorderservicejs)
- [services/staff/casher/cashierDiscount.service.js](#servicesstaffcashercashierdiscountservicejs)
- [services/staff/casher/cashierOperationalAuthorizer.service.js](#servicesstaffcashercashieroperationalauthorizerservicejs)
- [services/staff/casher/cashierOrderCheck.service.js](#servicesstaffcashercashierordercheckservicejs)
- [services/staff/casher/cashierPayment.service.js](#servicesstaffcashercashierpaymentservicejs)
- [services/staff/casher/cashierPrebill.service.js](#servicesstaffcashercashierprebillservicejs)
- [services/staff/casher/cashierQueue.service.js](#servicesstaffcashercashierqueueservicejs)
- [services/staff/casher/cashierReadyNotifications.service.js](#servicesstaffcashercashierreadynotificationsservicejs)
- [services/staff/casher/cashierRefunds.service.js](#servicesstaffcashercashierrefundsservicejs)
- [services/staff/casher/cashierSaleCheck.service.js](#servicesstaffcashercashiersalecheckservicejs)
- [services/staff/casher/cashierSession.service.js](#servicesstaffcashercashiersessionservicejs)
- [services/staff/casher/cashierTicket.service.js](#servicesstaffcashercashierticketservicejs)
- [services/staff/casher/netpayTerminal.service.js](#servicesstaffcashernetpayterminalservicejs)
- [services/staff/casher/netpayTransaction.service.js](#servicesstaffcashernetpaytransactionservicejs)
- [services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](#servicesstaffcasheronlineorderscashieronlineordersservicejs)
- [services/staff/cashRegisters.service.js](#servicesstaffcashregistersservicejs)
- [services/staff/kitchen/kitchenKds.service.js](#servicesstaffkitchenkitchenkdsservicejs)
- [services/staff/kitchen/kitchenPreparedItems.service.js](#servicesstaffkitchenkitchenprepareditemsservicejs)
- [services/staff/roles.service.js](#servicesstaffrolesservicejs)
- [services/staff/staff.service.js](#servicesstaffstaffservicejs)
- [services/staff/staffAssignments.service.js](#servicesstaffstaffassignmentsservicejs)
- [services/staff/staffAuth.service.js](#servicesstaffstaffauthservicejs)
- [services/staff/waiter/staffOrders.service.js](#servicesstaffwaiterstaffordersservicejs)
- [services/staff/waiter/tableSessionRequests.service.js](#servicesstaffwaitertablesessionrequestsservicejs)
- [services/staff/waiter/waiterTables.service.js](#servicesstaffwaiterwaitertablesservicejs)
- [services/system-admin/billing/platformBilling.service.js](#servicessystem-adminbillingplatformbillingservicejs)
- [services/system-admin/systemAddonSales.service.js](#servicessystem-adminsystemaddonsalesservicejs)
- [services/system-admin/systemAdminAuth.service.js](#servicessystem-adminsystemadminauthservicejs)
- [services/system-admin/systemOwnerRestaurantAddons.service.js](#servicessystem-adminsystemownerrestaurantaddonsservicejs)
- [services/system-admin/systemOwnerRestaurantBranches.service.js](#servicessystem-adminsystemownerrestaurantbranchesservicejs)
- [services/system-admin/systemOwnerRestaurants.service.js](#servicessystem-adminsystemownerrestaurantsservicejs)
- [services/system-admin/systemOwnerRestaurantSubscriptions.service.js](#servicessystem-adminsystemownerrestaurantsubscriptionsservicejs)
- [services/system-admin/systemOwners.service.js](#servicessystem-adminsystemownersservicejs)
- [services/system-admin/systemOwnerTaxProfile.service.js](#servicessystem-adminsystemownertaxprofileservicejs)
- [services/system-admin/systemSubscriptionSales.service.js](#servicessystem-adminsystemsubscriptionsalesservicejs)
- [Constructores adicionales y descargas indirectas](#constructores-adicionales-y-descargas-indirectas)
- [HTTP fuera del runtime src](#http-fuera-del-runtime-src)

## realtime/echo.js

Fuente: [src/realtime/echo.js](../src/realtime/echo.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetch` | `fetch` | POST | `"https://api.clicmenu.com.mx/api/broadcasting/auth"` | 28 |

### Parámetros de llamada

- `fetch` (POST, línea 28): `{           method: "POST",           headers: {             "Authorization": Bearer ${token},             "Content-Type": "application/json",             "Accept": "application/json",           },           body: JSON.stringify({             socket_id: socketId,             channel_name: channel.name,           }),         }`.

## services/auth/auth.service.js

Fuente: [src/services/auth/auth.service.js](../src/services/auth/auth.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `requestRegisterCode` | `api` | POST | `"/register/request-code"` | 8 |
| `verifyRegisterCode` | `api` | POST | `"/register/verify-code"` | 13 |
| `resendRegisterCode` | `api` | POST | `"/register/resend-code"` | 23 |
| `login` | `api` | POST | `"/login"` | 31 |
| `acceptTerms` | `api` | POST | `"/terms/accept"` | 44 |
| `me` | `api` | GET | `"/me"` | 52 |
| `logout` | `api` | POST | `"/logout"` | 57 |
| `requestPasswordResetCode` | `api` | POST | `"/password/request-code"` | 66 |
| `resetPassword` | `api` | POST | `"/password/reset"` | 71 |

### Parámetros de llamada

- `requestRegisterCode` (POST, línea 8): `payload`.

- `verifyRegisterCode` (POST, línea 13): `payload`.

- `resendRegisterCode` (POST, línea 23): `payload`.

- `login` (POST, línea 31): `payload`.

- `acceptTerms` (POST, línea 44): `payload`.

- `me` (GET, línea 52): sin cuerpo ni opciones explícitos.

- `logout` (POST, línea 57): sin cuerpo ni opciones explícitos.

- `requestPasswordResetCode` (POST, línea 66): `payload`.

- `resetPassword` (POST, línea 71): `payload`.

## services/connection/netpay/netpayTerminal.service.js

Fuente: [src/services/connection/netpay/netpayTerminal.service.js](../src/services/connection/netpay/netpayTerminal.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getRestaurantNetpayTerminals` | `api` | GET | `/restaurants/${restaurantId}/netpay-terminals` | 4 |
| `updateRestaurantNetpayTerminal` | `api` | PATCH | `/restaurants/${restaurantId}/netpay-terminals/${terminalId}` | 16 |

### Parámetros de llamada

- `getRestaurantNetpayTerminals` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `updateRestaurantNetpayTerminal` (PATCH, línea 16): `payload`.

## services/connection/tae/taeAccount.service.js

Fuente: [src/services/connection/tae/taeAccount.service.js](../src/services/connection/tae/taeAccount.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getTaecontaAccount` | `api` | GET | `/restaurants/${restaurantId}/taeconta-account` | 4 |
| `upsertTaecontaAccount` | `api` | PUT | `/restaurants/${restaurantId}/taeconta-account` | 12 |
| `deleteTaecontaAccount` | `api` | DELETE | `/restaurants/${restaurantId}/taeconta-account` | 21 |

### Parámetros de llamada

- `getTaecontaAccount` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `upsertTaecontaAccount` (PUT, línea 12): `payload`.

- `deleteTaecontaAccount` (DELETE, línea 21): sin cuerpo ni opciones explícitos.

## services/connection/tae/taeInvoiceSetting.service.js

Fuente: [src/services/connection/tae/taeInvoiceSetting.service.js](../src/services/connection/tae/taeInvoiceSetting.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getTaecontaInvoiceSetting` | `api` | GET | `/restaurants/${restaurantId}/taeconta-invoice-setting` | 4 |
| `upsertTaecontaInvoiceSetting` | `api` | PUT | `/restaurants/${restaurantId}/taeconta-invoice-setting` | 12 |
| `deleteTaecontaInvoiceSetting` | `api` | DELETE | `/restaurants/${restaurantId}/taeconta-invoice-setting` | 21 |

### Parámetros de llamada

- `getTaecontaInvoiceSetting` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `upsertTaecontaInvoiceSetting` (PUT, línea 12): `payload`.

- `deleteTaecontaInvoiceSetting` (DELETE, línea 21): sin cuerpo ni opciones explícitos.

## services/connection/tae/taeTaxProfile.service.js

Fuente: [src/services/connection/tae/taeTaxProfile.service.js](../src/services/connection/tae/taeTaxProfile.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getTaecontaTaxProfile` | `api` | GET | `/restaurants/${restaurantId}/taeconta-tax-profile` | 4 |
| `syncTaecontaTaxProfile` | `api` | POST | `/restaurants/${restaurantId}/taeconta-tax-profile/sync` | 12 |

### Parámetros de llamada

- `getTaecontaTaxProfile` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `syncTaecontaTaxProfile` (POST, línea 12): sin cuerpo ni opciones explícitos.

## services/connection/whatsapp/chatingBootConnection.service.js

Fuente: [src/services/connection/whatsapp/chatingBootConnection.service.js](../src/services/connection/whatsapp/chatingBootConnection.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchWhatsappQrConnection` | `api` | GET | `connectionUrl(restaurantId, branchId)` | 13 |
| `createBranchWhatsappQrConnection` | `api` | POST | `connectionUrl(restaurantId, branchId)` | 26 |
| `getBranchWhatsappQrConnectionStatus` | `api` | GET | `${connectionUrl(restaurantId, branchId)}/status` | 38 |
| `deleteBranchWhatsappQrConnection` | `api` | DELETE | `connectionUrl(restaurantId, branchId)` | 53 |

Constantes y constructores locales de referencia:

```js
connectionUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/whatsapp-qr-connection`
```

### Parámetros de llamada

- `getBranchWhatsappQrConnection` (GET, línea 13): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `createBranchWhatsappQrConnection` (POST, línea 26): `payload`.

- `getBranchWhatsappQrConnectionStatus` (GET, línea 38): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `deleteBranchWhatsappQrConnection` (DELETE, línea 53): sin cuerpo ni opciones explícitos.

## services/floor/operationalSettings.service.js

Fuente: [src/services/floor/operationalSettings.service.js](../src/services/floor/operationalSettings.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOperationalSettings` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/operational-settings` | 25 |
| `createOperationalSettings` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/operational-settings` | 34 |
| `updateOperationalSettings` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/operational-settings` | 44 |

### Parámetros de llamada

- `getOperationalSettings` (GET, línea 25): sin cuerpo ni opciones explícitos.

- `createOperationalSettings` (POST, línea 34): `payload`.

- `updateOperationalSettings` (PUT, línea 44): `payload`.

## services/floor/qr/branchQrCodes.service.js

Fuente: [src/services/floor/qr/branchQrCodes.service.js](../src/services/floor/qr/branchQrCodes.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchQrCodes` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/qr-codes` | 4 |
| `createBranchQrCode` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/qr-codes` | 12 |
| `updateBranchQrCode` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/qr-codes/${qrId}` | 21 |
| `deleteBranchQrCode` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/qr-codes/${qrId}` | 30 |
| `exportBranchQrCodesPdf` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/qr/export` | 38 |

### Parámetros de llamada

- `getBranchQrCodes` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `createBranchQrCode` (POST, línea 12): `payload`.

- `updateBranchQrCode` (PUT, línea 21): `payload`.

- `deleteBranchQrCode` (DELETE, línea 30): sin cuerpo ni opciones explícitos.

- `exportBranchQrCodesPdf` (POST, línea 38): `payload, {       responseType: "blob",     }`.

## services/floor/tables.service.js

Fuente: [src/services/floor/tables.service.js](../src/services/floor/tables.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getTables` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/tables` | 5 |
| `getAvailableWaiters` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/available-waiters${qs}` | 14 |
| `createTable` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/tables` | 22 |
| `updateTable` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/tables/${tableId}` | 31 |
| `deleteTable` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/tables/${tableId}` | 40 |

### Parámetros de llamada

- `getTables` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `getAvailableWaiters` (GET, línea 14): sin cuerpo ni opciones explícitos.

- `createTable` (POST, línea 22): `payload`.

- `updateTable` (PUT, línea 31): `payload`.

- `deleteTable` (DELETE, línea 40): sin cuerpo ni opciones explícitos.

## services/floor/zones.service.js

Fuente: [src/services/floor/zones.service.js](../src/services/floor/zones.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getZones` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/zones` | 5 |
| `createZone` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/zones` | 13 |
| `updateZone` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/zones/${zoneId}` | 22 |
| `assignZoneWaiter` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/zones/${zoneId}/assign-waiter` | 31 |
| `deleteZone` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/zones/${zoneId}` | 40 |

### Parámetros de llamada

- `getZones` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `createZone` (POST, línea 13): `payload`.

- `updateZone` (PUT, línea 22): `payload`.

- `assignZoneWaiter` (PUT, línea 31): `{ assigned_waiter_id }`.

- `deleteZone` (DELETE, línea 40): sin cuerpo ni opciones explícitos.

## services/inventory/ingredients/ingredientPresentations.service.js

Fuente: [src/services/inventory/ingredients/ingredientPresentations.service.js](../src/services/inventory/ingredients/ingredientPresentations.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getIngredientPresentations` | `api` | GET | `/restaurants/${restaurantId}/ingredients/${ingredientId}/presentations` | 5 |
| `createIngredientPresentation` | `api` | POST | `/restaurants/${restaurantId}/ingredients/${ingredientId}/presentations` | 14 |
| `updateIngredientPresentation` | `api` | PUT | `/restaurants/${restaurantId}/ingredients/${ingredientId}/presentations/${presentationId}` | 23 |
| `deleteIngredientPresentation` | `api` | DELETE | `/restaurants/${restaurantId}/ingredients/${ingredientId}/presentations/${presentationId}` | 32 |

### Parámetros de llamada

- `getIngredientPresentations` (GET, línea 5): `{ params: { only_active: only_active ? 1 : 0 } }`.

- `createIngredientPresentation` (POST, línea 14): `payload`.

- `updateIngredientPresentation` (PUT, línea 23): `payload`.

- `deleteIngredientPresentation` (DELETE, línea 32): sin cuerpo ni opciones explícitos.

## services/inventory/ingredients/ingredients.service.js

Fuente: [src/services/inventory/ingredients/ingredients.service.js](../src/services/inventory/ingredients/ingredients.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getIngredients` | `api` | GET | `/restaurants/${restaurantId}/ingredients` | 7 |
| `getPurchasableIngredients` | `api` | GET | `/restaurants/${restaurantId}/ingredients/purchasable` | 17 |
| `createIngredient` | `api` | POST | `/restaurants/${restaurantId}/ingredients` | 30 |
| `getIngredient` | `api` | GET | `/restaurants/${restaurantId}/ingredients/${ingredientId}` | 38 |
| `updateIngredient` | `api` | PUT | `/restaurants/${restaurantId}/ingredients/${ingredientId}` | 46 |
| `deleteIngredient` | `api` | DELETE | `/restaurants/${restaurantId}/ingredients/${ingredientId}` | 54 |

### Parámetros de llamada

- `getIngredients` (GET, línea 7): `{     params: { only_active: only_active ? 1 : 0, q: q &#124;&#124; "" },   }`.

- `getPurchasableIngredients` (GET, línea 17): `{       params: { q: q &#124;&#124; "" },     }`.

- `createIngredient` (POST, línea 30): `payload`.

- `getIngredient` (GET, línea 38): sin cuerpo ni opciones explícitos.

- `updateIngredient` (PUT, línea 46): `payload`.

- `deleteIngredient` (DELETE, línea 54): sin cuerpo ni opciones explícitos.

## services/inventory/ingredients/ingredientsGroups.service.js

Fuente: [src/services/inventory/ingredients/ingredientsGroups.service.js](../src/services/inventory/ingredients/ingredientsGroups.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getIngredientGroups` | `api` | GET | `/restaurants/${restaurantId}/ingredient-groups` | 7 |
| `createIngredientGroup` | `api` | POST | `/restaurants/${restaurantId}/ingredient-groups` | 17 |
| `updateIngredientGroup` | `api` | PUT | `/restaurants/${restaurantId}/ingredient-groups/${groupId}` | 25 |
| `deleteIngredientGroup` | `api` | DELETE | `/restaurants/${restaurantId}/ingredient-groups/${groupId}` | 33 |

### Parámetros de llamada

- `getIngredientGroups` (GET, línea 7): `{     params: { only_active: only_active ? 1 : 0, q: q &#124;&#124; "" },   }`.

- `createIngredientGroup` (POST, línea 17): `payload`.

- `updateIngredientGroup` (PUT, línea 25): `payload`.

- `deleteIngredientGroup` (DELETE, línea 33): sin cuerpo ni opciones explícitos.

## services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js

Fuente: [src/services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js](../src/services/inventory/ingredients/inventoryMovement/inventoryMovement.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getIngredientInventoryMovements` | `api` | GET | `/restaurants/${restaurantId}/warehouses/${warehouseId}/movements` | 14 |
| `createIngredientInventoryMovement` | `api` | POST | `/restaurants/${restaurantId}/inventory/movements/manual` | 32 |

### Parámetros de llamada

- `getIngredientInventoryMovements` (GET, línea 14): `{       params: {         ...(ingredient_id ? { ingredient_id } : {}),         ...(type ? { type } : {}),         ...(reason ? { reason } : {}),         limit,         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

- `createIngredientInventoryMovement` (POST, línea 32): `payload`.

## services/inventory/ingredients/inventoryStock/inventoryStock.service.js

Fuente: [src/services/inventory/ingredients/inventoryStock/inventoryStock.service.js](../src/services/inventory/ingredients/inventoryStock/inventoryStock.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getIngredientInventoryStocks` | `api` | GET | `/restaurants/${restaurantId}/warehouses/${warehouseId}/stocks` | 14 |

### Parámetros de llamada

- `getIngredientInventoryStocks` (GET, línea 14): `{       params: {         ...(q ? { q } : {}),         ...(ingredient_group_id ? { ingredient_group_id } : {}),         ...(only_positive ? { only_positive: 1 } : {}),         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

## services/inventory/products/inventoryMovement/inventoryMovement.service.js

Fuente: [src/services/inventory/products/inventoryMovement/inventoryMovement.service.js](../src/services/inventory/products/inventoryMovement/inventoryMovement.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProductInventoryMovements` | `api` | GET | `/restaurants/${restaurantId}/warehouses/${warehouseId}/product-movements` | 14 |
| `createProductInventoryMovement` | `api` | POST | `/restaurants/${restaurantId}/product-movements/manual` | 32 |

### Parámetros de llamada

- `getProductInventoryMovements` (GET, línea 14): `{       params: {         ...(product_id ? { product_id } : {}),         ...(type ? { type } : {}),         ...(reason ? { reason } : {}),         limit,         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

- `createProductInventoryMovement` (POST, línea 32): `payload`.

## services/inventory/products/inventoryStock/inventoryStock.service.js

Fuente: [src/services/inventory/products/inventoryStock/inventoryStock.service.js](../src/services/inventory/products/inventoryStock/inventoryStock.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProductInventoryStocks` | `api` | GET | `/restaurants/${restaurantId}/warehouses/${warehouseId}/product-stocks` | 14 |

### Parámetros de llamada

- `getProductInventoryStocks` (GET, línea 14): `{       params: {         ...(q ? { q } : {}),         ...(category_id ? { category_id } : {}),         ...(status ? { status } : {}),         ...(only_positive ? { only_positive: 1 } : {}),         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

## services/inventory/purchases/purchases.service.js

Fuente: [src/services/inventory/purchases/purchases.service.js](../src/services/inventory/purchases/purchases.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPurchases` | `api` | GET | `/restaurants/${restaurantId}/purchases` | 13 |
| `getPurchase` | `api` | GET | `/restaurants/${restaurantId}/purchases/${purchaseId}` | 27 |
| `getPurchaseWarehouses` | `api` | GET | `/restaurants/${restaurantId}/warehouses` | 39 |
| `createPurchase` | `api` | POST | `/restaurants/${restaurantId}/purchases` | 51 |
| `updatePurchase` | `api` | PUT | `/restaurants/${restaurantId}/purchases/${purchaseId}` | 59 |
| `deletePurchase` | `api` | DELETE | `/restaurants/${restaurantId}/purchases/${purchaseId}` | 67 |
| `completePurchase` | `api` | POST | `/restaurants/${restaurantId}/purchases/${purchaseId}/complete` | 74 |
| `createPurchaseIngredientItem` | `api` | POST | `/restaurants/${restaurantId}/purchases/${purchaseId}/items` | 87 |
| `updatePurchaseIngredientItem` | `api` | PUT | `/restaurants/${restaurantId}/purchases/${purchaseId}/items/${itemId}` | 100 |
| `deletePurchaseIngredientItem` | `api` | DELETE | `/restaurants/${restaurantId}/purchases/${purchaseId}/items/${itemId}` | 112 |
| `createPurchaseProductItem` | `api` | POST | `/restaurants/${restaurantId}/purchases/${purchaseId}/product-items` | 124 |
| `updatePurchaseProductItem` | `api` | PUT | `/restaurants/${restaurantId}/purchases/${purchaseId}/product-items/${itemId}` | 137 |
| `deletePurchaseProductItem` | `api` | DELETE | `/restaurants/${restaurantId}/purchases/${purchaseId}/product-items/${itemId}` | 149 |

### Parámetros de llamada

- `getPurchases` (GET, línea 13): `{     params: {       ...(status ? { status } : {}),       ...(branch_id ? { branch_id } : {}),       ...(supplier_id ? { supplier_id } : {}),       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `getPurchase` (GET, línea 27): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `getPurchaseWarehouses` (GET, línea 39): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `createPurchase` (POST, línea 51): `payload`.

- `updatePurchase` (PUT, línea 59): `payload`.

- `deletePurchase` (DELETE, línea 67): sin cuerpo ni opciones explícitos.

- `completePurchase` (POST, línea 74): `payload`.

- `createPurchaseIngredientItem` (POST, línea 87): `payload`.

- `updatePurchaseIngredientItem` (PUT, línea 100): `payload`.

- `deletePurchaseIngredientItem` (DELETE, línea 112): sin cuerpo ni opciones explícitos.

- `createPurchaseProductItem` (POST, línea 124): `payload`.

- `updatePurchaseProductItem` (PUT, línea 137): `payload`.

- `deletePurchaseProductItem` (DELETE, línea 149): sin cuerpo ni opciones explícitos.

## services/inventory/recipes/productRecipes.service.js

Fuente: [src/services/inventory/recipes/productRecipes.service.js](../src/services/inventory/recipes/productRecipes.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProductRecipes` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/recipes` | 7 |
| `upsertProductRecipeBase` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/recipes/base` | 17 |
| `upsertProductRecipeVariant` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/recipes/variants/${variantId}` | 29 |
| `setProductRecipeItemStatus` | `api` | PATCH | `/restaurants/${restaurantId}/products/${productId}/recipes/items/${itemId}/status` | 41 |

### Parámetros de llamada

- `getProductRecipes` (GET, línea 7): `{     params: branch_id ? { branch_id } : {},   }`.

- `upsertProductRecipeBase` (PUT, línea 17): `payload`.

- `upsertProductRecipeVariant` (PUT, línea 29): `payload`.

- `setProductRecipeItemStatus` (PATCH, línea 41): `{ status }`.

## services/inventory/suppliers/suppliers.service.js

Fuente: [src/services/inventory/suppliers/suppliers.service.js](../src/services/inventory/suppliers/suppliers.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSuppliers` | `api` | GET | `/restaurants/${restaurantId}/suppliers` | 5 |
| `createSupplier` | `api` | POST | `/restaurants/${restaurantId}/suppliers` | 12 |
| `updateSupplier` | `api` | PUT | `/restaurants/${restaurantId}/suppliers/${supplierId}` | 17 |
| `deleteSupplier` | `api` | DELETE | `/restaurants/${restaurantId}/suppliers/${supplierId}` | 22 |

### Parámetros de llamada

- `getSuppliers` (GET, línea 5): `{     params: { only_active: only_active ? 1 : 0, q: q &#124;&#124; "" },   }`.

- `createSupplier` (POST, línea 12): `payload`.

- `updateSupplier` (PUT, línea 17): `payload`.

- `deleteSupplier` (DELETE, línea 22): sin cuerpo ni opciones explícitos.

## services/inventory/warehouses/warehouses.service.js

Fuente: [src/services/inventory/warehouses/warehouses.service.js](../src/services/inventory/warehouses/warehouses.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getWarehouses` | `api` | GET | `/restaurants/${restaurantId}/warehouses` | 20 |
| `createWarehouse` | `api` | POST | `/restaurants/${restaurantId}/warehouses` | 37 |
| `updateWarehouse` | `api` | PUT | `/restaurants/${restaurantId}/warehouses/${warehouseId}` | 48 |
| `ensureDefaultWarehouses` | `api` | POST | `/restaurants/${restaurantId}/warehouses/ensure-defaults` | 59 |
| `getEffectiveWarehouse` | `api` | GET | `/restaurants/${restaurantId}/warehouses/effective` | 73 |

### Parámetros de llamada

- `getWarehouses` (GET, línea 20): `{     params: {       ...(scope ? { scope } : {}),       ...(branch_id ? { branch_id } : {}),       ...(status ? { status } : {}),       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `createWarehouse` (POST, línea 37): `payload`.

- `updateWarehouse` (PUT, línea 48): `payload`.

- `ensureDefaultWarehouses` (POST, línea 59): `{}`.

- `getEffectiveWarehouse` (GET, línea 73): `{       params: {         ...(branch_id ? { branch_id } : {}),         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

## services/landing/publicPlans.service.js

Fuente: [src/services/landing/publicPlans.service.js](../src/services/landing/publicPlans.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPublicPlans` | `api` | GET | `"/public/plans"` | 5 |

### Parámetros de llamada

- `getPublicPlans` (GET, línea 5): sin cuerpo ni opciones explícitos.

## services/legal/legalDocuments.service.js

Fuente: [src/services/legal/legalDocuments.service.js](../src/services/legal/legalDocuments.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getClicmenuTerms` | `api` | GET | `"/legal/clicmenu/terms"` | 4 |

### Parámetros de llamada

- `getClicmenuTerms` (GET, línea 4): sin cuerpo ni opciones explícitos.

## services/management/settings/branchSettings.service.js

Fuente: [src/services/management/settings/branchSettings.service.js](../src/services/management/settings/branchSettings.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchWorkflowSetting` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/workflow-setting` | 9 |
| `updateBranchWorkflowSetting` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/workflow-setting` | 17 |

### Parámetros de llamada

- `getBranchWorkflowSetting` (GET, línea 9): sin cuerpo ni opciones explícitos.

- `updateBranchWorkflowSetting` (PUT, línea 17): `{ catalog_mode: catalogMode }`.

## services/menu/categories.service.js

Fuente: [src/services/menu/categories.service.js](../src/services/menu/categories.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getCategories` | `api` | GET | `/restaurants/${restaurantId}/categories` | 6 |
| `createCategory` | `api` | POST | `/restaurants/${restaurantId}/categories` | 11 |
| `updateCategory` | `api` | PUT | `/restaurants/${restaurantId}/categories/${categoryId}` | 16 |
| `deleteCategory` | `api` | DELETE | `/restaurants/${restaurantId}/categories/${categoryId}` | 21 |

### Parámetros de llamada

- `getCategories` (GET, línea 6): `{ params }`.

- `createCategory` (POST, línea 11): `payload`.

- `updateCategory` (PUT, línea 16): `payload`.

- `deleteCategory` (DELETE, línea 21): sin cuerpo ni opciones explícitos.

## services/menu/menus/menuChannels/menuChannels.service.js

Fuente: [src/services/menu/menus/menuChannels/menuChannels.service.js](../src/services/menu/menus/menuChannels/menuChannels.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuChannels` | `api` | GET | `menuChannelsPath(       restaurantId,       branchId,       menuId     )` | 16 |
| `syncMenuChannels` | `api` | PUT | `menuChannelsPath(       restaurantId,       branchId,       menuId     )` | 38 |

### Parámetros de llamada

- `getMenuChannels` (GET, línea 16): sin cuerpo ni opciones explícitos.

- `syncMenuChannels` (PUT, línea 38): `payload`.

## services/menu/menus/menuContent/menuContent.service.js

Fuente: [src/services/menu/menus/menuContent/menuContent.service.js](../src/services/menu/menus/menuContent/menuContent.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuContentCatalog` | `api` | GET | `${menuContentPath(       restaurantId,       branchId,       menuId     )}/catalog` | 16 |
| `getMenuContent` | `api` | GET | `menuContentPath(       restaurantId,       branchId,       menuId     )` | 37 |
| `syncMenuContent` | `api` | PUT | `menuContentPath(       restaurantId,       branchId,       menuId     )` | 59 |

### Parámetros de llamada

- `getMenuContentCatalog` (GET, línea 16): sin cuerpo ni opciones explícitos.

- `getMenuContent` (GET, línea 37): sin cuerpo ni opciones explícitos.

- `syncMenuContent` (PUT, línea 59): `payload`.

## services/menu/menus/menuContent/menuSetAssignment.service.js

Fuente: [src/services/menu/menus/menuContent/menuSetAssignment.service.js](../src/services/menu/menus/menuContent/menuSetAssignment.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuSetAssignments` | `api` | GET | `menuSetAssignmentPath(restaurantId, branchId, menuId)` | 9 |
| `syncMenuSetAssignments` | `api` | PUT | `menuSetAssignmentPath(restaurantId, branchId, menuId)` | 18 |

### Parámetros de llamada

- `getMenuSetAssignments` (GET, línea 9): sin cuerpo ni opciones explícitos.

- `syncMenuSetAssignments` (PUT, línea 18): `{ menu_set_ids: menuSetIds }`.

## services/menu/menus/menus.service.js

Fuente: [src/services/menu/menus/menus.service.js](../src/services/menu/menus/menus.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenus` | `api` | GET | `menusPath(restaurantId, branchId)` | 12 |
| `getMenu` | `api` | GET | `${menusPath(restaurantId, branchId)}/${menuId}` | 29 |
| `createMenu` | `api` | POST | `menusPath(restaurantId, branchId)` | 44 |
| `updateMenu` | `api` | PUT | `${menusPath(restaurantId, branchId)}/${menuId}` | 63 |
| `archiveMenu` | `api` | POST | `${menusPath(restaurantId, branchId)}/${menuId}/archive` | 96 |

### Parámetros de llamada

- `getMenus` (GET, línea 12): `{ params }`.

- `getMenu` (GET, línea 29): sin cuerpo ni opciones explícitos.

- `createMenu` (POST, línea 44): `payload`.

- `updateMenu` (PUT, línea 63): `payload`.

- `archiveMenu` (POST, línea 96): sin cuerpo ni opciones explícitos.

## services/menu/menuSections.service.js

Fuente: [src/services/menu/menuSections.service.js](../src/services/menu/menuSections.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuSections` | `api` | GET | `/restaurants/${restaurantId}/menu-sections` | 5 |
| `createMenuSection` | `api` | POST | `/restaurants/${restaurantId}/menu-sections` | 10 |
| `updateMenuSection` | `api` | PUT | `/restaurants/${restaurantId}/menu-sections/${sectionId}` | 15 |
| `deleteMenuSection` | `api` | DELETE | `/restaurants/${restaurantId}/menu-sections/${sectionId}` | 20 |

### Parámetros de llamada

- `getMenuSections` (GET, línea 5): `{ params }`.

- `createMenuSection` (POST, línea 10): `payload`.

- `updateMenuSection` (PUT, línea 15): `payload`.

- `deleteMenuSection` (DELETE, línea 20): sin cuerpo ni opciones explícitos.

## services/menu/menuSets/dashboard/operationalDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/operationalDashboard.service.js](../src/services/menu/menuSets/dashboard/operationalDashboard.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOperationalDashboardOverview` | `api` | GET | `${dashboardUrl(restaurantId, branchId)}/overview` | 13 |

Constantes y constructores locales de referencia:

```js
dashboardUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard`
```

### Parámetros de llamada

- `getOperationalDashboardOverview` (GET, línea 13): `{ params, signal }`.

## services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerImportUpdatesDashboard.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOwnerImportUpdatesDashboard` | `api` | GET | `updatesUrl(restaurantId, branchId)` | 25 |

Constantes y constructores locales de referencia:

```js
updatesUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/import-updates`
```

### Parámetros de llamada

- `getOwnerImportUpdatesDashboard` (GET, línea 25): `{ params, signal }`.

## services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerInventoryDashboard.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOwnerInventoryDashboardSummary` | `api` | GET | `${inventoryUrl(restaurantId, branchId)}/summary` | 43 |
| `getOwnerInventoryDashboardItems` | `api` | GET | `${inventoryUrl(restaurantId, branchId)}/items` | 55 |

Constantes y constructores locales de referencia:

```js
inventoryUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/inventory`
```

### Parámetros de llamada

- `getOwnerInventoryDashboardSummary` (GET, línea 43): `{ params: buildFilters(filters), signal }`.

- `getOwnerInventoryDashboardItems` (GET, línea 55): `{ params: buildFilters(filters, true), signal }`.

## services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerMenuSetsDashboard.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOwnerMenuSetsDashboard` | `api` | GET | `menuSetsUrl(restaurantId, branchId)` | 25 |
| `getOwnerMenuSetDashboardDetail` | `api` | GET | `${menuSetsUrl(restaurantId, branchId)}/${menuSetId}` | 46 |

Constantes y constructores locales de referencia:

```js
menuSetsUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/menu-sets`
```

### Parámetros de llamada

- `getOwnerMenuSetsDashboard` (GET, línea 25): `{ params, signal }`.

- `getOwnerMenuSetDashboardDetail` (GET, línea 46): `{ params, signal }`.

## services/menu/menuSets/dashboard/ownerProductsDashboard.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js](../src/services/menu/menuSets/dashboard/ownerProductsDashboard.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOwnerProductsDashboardAvailability` | `api` | GET | `productsUrl(restaurantId, branchId)` | 22 |

Constantes y constructores locales de referencia:

```js
productsUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/products/availability`
```

### Parámetros de llamada

- `getOwnerProductsDashboardAvailability` (GET, línea 22): `{ params, signal }`.

## services/menu/menuSets/dashboard/ownerReminders.service.js

Fuente: [src/services/menu/menuSets/dashboard/ownerReminders.service.js](../src/services/menu/menuSets/dashboard/ownerReminders.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOwnerReminderPreview` | `api` | GET | `${reminderUrl(restaurantId, branchId)}/preview` | 24 |
| `getOwnerReminderHistory` | `api` | GET | `reminderUrl(restaurantId, branchId)` | 55 |
| `getReminderWhatsappSetting` | `api` | GET | `${branchUrl(restaurantId, branchId)}/whasapo-setting` | 74 |
| `getReminderWhatsappQrConnection` | `api` | GET | `${branchUrl(restaurantId, branchId)}/whatsapp-qr-connection` | 111 |

Constantes y constructores locales de referencia:

```js
reminderUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/operational-dashboard/reminders`
branchUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}`
```

### Parámetros de llamada

- `getOwnerReminderPreview` (GET, línea 24): `{     params, signal,   }`.

- `getOwnerReminderHistory` (GET, línea 55): `{     params, signal,   }`.

- `getReminderWhatsappSetting` (GET, línea 74): `{ signal }`.

- `getReminderWhatsappQrConnection` (GET, línea 111): `{ signal }`.

## services/menu/menuSets/menuSet.service.js

Fuente: [src/services/menu/menuSets/menuSet.service.js](../src/services/menu/menuSets/menuSet.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuSets` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets` | 6 |
| `changeMenuSetStatus` | `api` | PATCH | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}` | 15 |
| `deleteMenuSet` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}` | 25 |
| `createMenuSet` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets` | 34 |
| `getMenuSet` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}` | 44 |
| `updateMenuSet` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}` | 53 |
| `uploadMenuSetImage` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/image` | 66 |
| `deleteMenuSetImage` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/image` | 77 |

### Parámetros de llamada

- `getMenuSets` (GET, línea 6): sin cuerpo ni opciones explícitos.

- `changeMenuSetStatus` (PATCH, línea 15): `{ is_active: isActive }`.

- `deleteMenuSet` (DELETE, línea 25): sin cuerpo ni opciones explícitos.

- `createMenuSet` (POST, línea 34): `payload`.

- `getMenuSet` (GET, línea 44): sin cuerpo ni opciones explícitos.

- `updateMenuSet` (PUT, línea 53): `payload`.

- `uploadMenuSetImage` (POST, línea 66): `formData, { headers: { "Content-Type": "multipart/form-data" } }`.

- `deleteMenuSetImage` (DELETE, línea 77): sin cuerpo ni opciones explícitos.

## services/menu/menuSets/menuSetAvailability.service.js

Fuente: [src/services/menu/menuSets/menuSetAvailability.service.js](../src/services/menu/menuSets/menuSetAvailability.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuSetAvailabilityPreview` | `api` | GET | `availabilityUrl(restaurantId, branchId, menuSetId)` | 11 |

Constantes y constructores locales de referencia:

```js
availabilityUrl = (restaurantId, branchId, menuSetId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/availability-preview`
```

### Parámetros de llamada

- `getMenuSetAvailabilityPreview` (GET, línea 11): `{       params: {         service_date: serviceDate,         quantity,       },       signal,     }`.

## services/menu/menuSets/menuSetImport.service.js

Fuente: [src/services/menu/menuSets/menuSetImport.service.js](../src/services/menu/menuSets/menuSetImport.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `downloadFile` | `api` | GET | `url` | 26 |
| `getMenuSetImportCurrentStatus` | `api` | GET | `${importUrl(restaurantId, branchId, menuSetId)}/current-status` | 79 |
| `previewMenuSetImport` | `api` | POST | `${importUrl(restaurantId, branchId, menuSetId)}/preview` | 127 |
| `publishMenuSetImport` | `api` | POST | `${importUrl(restaurantId, branchId, menuSetId)}/publish` | 143 |
| `getMenuSetImportHistory` | `api` | GET | `${importUrl(restaurantId, branchId, menuSetId)}/history` | 160 |
| `getMenuSetImportDetail` | `api` | GET | `${importUrl(restaurantId, branchId, menuSetId)}/history/${importId}` | 170 |
| `downloadMenuSetImportCurrent` | `api` | GET | `${importUrl(restaurantId, branchId, menuSetId)}/current` | 180 |
| `getMenuSetImportHistoryDetail` | `api` | GET | `${importUrl(restaurantId, branchId, menuSetId)}/history/${importId}` | 216 |
| `getMenuSetPublicationHistory` | `api` | GET | `${importUrl(restaurantId, branchId, menuSetId)}/publications` | 227 |

Constantes y constructores locales de referencia:

```js
importUrl = (restaurantId, branchId, menuSetId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/import`
```

### Parámetros de llamada

- `downloadFile` (GET, línea 26): `{ params, responseType: "blob" }`.

- `getMenuSetImportCurrentStatus` (GET, línea 79): `{ params, signal }`.

- `previewMenuSetImport` (POST, línea 127): `payload, {       headers: { "Content-Type": "multipart/form-data" },       signal,     }`.

- `publishMenuSetImport` (POST, línea 143): `{ import_id: Number(importId) }, { signal }`.

- `getMenuSetImportHistory` (GET, línea 160): `{ params: { page, per_page: perPage }, signal: requestSignal }`.

- `getMenuSetImportDetail` (GET, línea 170): sin cuerpo ni opciones explícitos.

- `downloadMenuSetImportCurrent` (GET, línea 180): `{       params: { format, service_date: serviceDate },       responseType: "blob",       signal,     }`.

- `getMenuSetImportHistoryDetail` (GET, línea 216): `{ signal }`.

- `getMenuSetPublicationHistory` (GET, línea 227): `{ params: { page, per_page: 5 }, signal }`.

## services/menu/menuSets/menuSetManagement.service.js

Fuente: [src/services/menu/menuSets/menuSetManagement.service.js](../src/services/menu/menuSets/menuSetManagement.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuSetManagement` | `api` | GET | `managementUrl(restaurantId, branchId, menuSetId)` | 9 |
| `updateMenuSetManagement` | `api` | PUT | `managementUrl(restaurantId, branchId, menuSetId)` | 20 |

Constantes y constructores locales de referencia:

```js
managementUrl = (restaurantId, branchId, menuSetId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/management`
```

### Parámetros de llamada

- `getMenuSetManagement` (GET, línea 9): sin cuerpo ni opciones explícitos.

- `updateMenuSetManagement` (PUT, línea 20): `payload`.

## services/menu/menuSets/menuSetProduct.service.js

Fuente: [src/services/menu/menuSets/menuSetProduct.service.js](../src/services/menu/menuSets/menuSetProduct.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuSetEligibleProducts` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/eligible-products` | 9 |
| `getMenuSetStageProducts` | `api` | GET | `productsUrl(restaurantId, branchId, menuSetId, stageId)` | 18 |
| `getMenuSetStageProduct` | `api` | GET | `${productsUrl(restaurantId, branchId, menuSetId, stageId)}/${optionId}` | 32 |
| `createMenuSetStageProduct` | `api` | POST | `productsUrl(restaurantId, branchId, menuSetId, stageId)` | 43 |
| `updateMenuSetStageProduct` | `api` | PUT | `${productsUrl(restaurantId, branchId, menuSetId, stageId)}/${optionId}` | 55 |
| `deleteMenuSetStageProduct` | `api` | DELETE | `${productsUrl(restaurantId, branchId, menuSetId, stageId)}/${optionId}` | 67 |

Constantes y constructores locales de referencia:

```js
productsUrl = (restaurantId, branchId, menuSetId, stageId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/stages/${stageId}/products`
```

### Parámetros de llamada

- `getMenuSetEligibleProducts` (GET, línea 9): sin cuerpo ni opciones explícitos.

- `getMenuSetStageProducts` (GET, línea 18): sin cuerpo ni opciones explícitos.

- `getMenuSetStageProduct` (GET, línea 32): sin cuerpo ni opciones explícitos.

- `createMenuSetStageProduct` (POST, línea 43): `payload`.

- `updateMenuSetStageProduct` (PUT, línea 55): `payload`.

- `deleteMenuSetStageProduct` (DELETE, línea 67): sin cuerpo ni opciones explícitos.

## services/menu/menuSets/menuSetStage.service.js

Fuente: [src/services/menu/menuSets/menuSetStage.service.js](../src/services/menu/menuSets/menuSetStage.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuSetStages` | `api` | GET | `stageUrl(restaurantId, branchId, menuSetId)` | 9 |
| `getMenuSetStage` | `api` | GET | `${stageUrl(restaurantId, branchId, menuSetId)}/${stageId}` | 15 |
| `createMenuSetStage` | `api` | POST | `stageUrl(restaurantId, branchId, menuSetId)` | 24 |
| `updateMenuSetStage` | `api` | PUT | `${stageUrl(restaurantId, branchId, menuSetId)}/${stageId}` | 36 |
| `deleteMenuSetStage` | `api` | DELETE | `${stageUrl(restaurantId, branchId, menuSetId)}/${stageId}` | 46 |

Constantes y constructores locales de referencia:

```js
stageUrl = (restaurantId, branchId, menuSetId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-sets/${menuSetId}/stages`
```

### Parámetros de llamada

- `getMenuSetStages` (GET, línea 9): sin cuerpo ni opciones explícitos.

- `getMenuSetStage` (GET, línea 15): sin cuerpo ni opciones explícitos.

- `createMenuSetStage` (POST, línea 24): `payload`.

- `updateMenuSetStage` (PUT, línea 36): `payload`.

- `deleteMenuSetStage` (DELETE, línea 46): sin cuerpo ni opciones explícitos.

## services/menu/menuSets/menuSetStageDefinition.service.js

Fuente: [src/services/menu/menuSets/menuSetStageDefinition.service.js](../src/services/menu/menuSets/menuSetStageDefinition.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMenuSetStageDefinitions` | `api` | GET | `definitionsUrl(restaurantId, branchId)` | 9 |
| `createMenuSetStageDefinition` | `api` | POST | `definitionsUrl(restaurantId, branchId)` | 15 |
| `updateMenuSetStageDefinition` | `api` | PUT | `${definitionsUrl(restaurantId, branchId)}/${definitionId}` | 23 |
| `deleteMenuSetStageDefinition` | `api` | DELETE | `${definitionsUrl(restaurantId, branchId)}/${definitionId}` | 33 |

Constantes y constructores locales de referencia:

```js
definitionsUrl = (restaurantId, branchId) =>
  `/restaurants/${restaurantId}/branches/${branchId}/menu-set-stage-definitions`
```

### Parámetros de llamada

- `getMenuSetStageDefinitions` (GET, línea 9): sin cuerpo ni opciones explícitos.

- `createMenuSetStageDefinition` (POST, línea 15): `payload`.

- `updateMenuSetStageDefinition` (PUT, línea 23): `payload`.

- `deleteMenuSetStageDefinition` (DELETE, línea 33): sin cuerpo ni opciones explícitos.

## services/menu/modifiers/compositeComponentModifierGroups.service.js

Fuente: [src/services/menu/modifiers/compositeComponentModifierGroups.service.js](../src/services/menu/modifiers/compositeComponentModifierGroups.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getCompositeComponentModifierGroups` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/component-modifier-groups` | 8 |
| `createCompositeComponentModifierGroup` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/component-modifier-groups` | 28 |
| `updateCompositeComponentModifierGroup` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/component-modifier-groups/${assignmentId}` | 42 |
| `deleteCompositeComponentModifierGroup` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/component-modifier-groups/${assignmentId}` | 56 |

### Parámetros de llamada

- `getCompositeComponentModifierGroups` (GET, línea 8): `{ params }`.

- `createCompositeComponentModifierGroup` (POST, línea 28): `payload`.

- `updateCompositeComponentModifierGroup` (PUT, línea 42): `payload`.

- `deleteCompositeComponentModifierGroup` (DELETE, línea 56): `{ params }`.

## services/menu/modifiers/compositeComponentVariantModifierGroups.service.js

Fuente: [src/services/menu/modifiers/compositeComponentVariantModifierGroups.service.js](../src/services/menu/modifiers/compositeComponentVariantModifierGroups.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getCompositeComponentVariantModifierGroups` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/component-variant-modifier-groups` | 8 |
| `createCompositeComponentVariantModifierGroup` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/component-variant-modifier-groups` | 28 |
| `updateCompositeComponentVariantModifierGroup` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/component-variant-modifier-groups/${assignmentId}` | 42 |
| `deleteCompositeComponentVariantModifierGroup` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/component-variant-modifier-groups/${assignmentId}` | 56 |

### Parámetros de llamada

- `getCompositeComponentVariantModifierGroups` (GET, línea 8): `{ params }`.

- `createCompositeComponentVariantModifierGroup` (POST, línea 28): `payload`.

- `updateCompositeComponentVariantModifierGroup` (PUT, línea 42): `payload`.

- `deleteCompositeComponentVariantModifierGroup` (DELETE, línea 56): `{ params }`.

## services/menu/modifiers/modifierCatalog.service.js

Fuente: [src/services/menu/modifiers/modifierCatalog.service.js](../src/services/menu/modifiers/modifierCatalog.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getModifierCatalog` | `api` | GET | `/restaurants/${restaurantId}/modifier-catalog` | 10 |
| `getCatalogProducts` | `api` | GET | `/restaurants/${restaurantId}/products` | 18 |
| `getProductVariants` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/variants` | 29 |
| `getProductComponentsCatalog` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/components` | 37 |

### Parámetros de llamada

- `getModifierCatalog` (GET, línea 10): `{     params: requestParams,   }`.

- `getCatalogProducts` (GET, línea 18): `{     params: {       include_inactive: true,       ...params,     },   }`.

- `getProductVariants` (GET, línea 29): sin cuerpo ni opciones explícitos.

- `getProductComponentsCatalog` (GET, línea 37): `{ params }`.

## services/menu/modifiers/modifierGroups.service.js

Fuente: [src/services/menu/modifiers/modifierGroups.service.js](../src/services/menu/modifiers/modifierGroups.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getModifierGroups` | `api` | GET | `/restaurants/${restaurantId}/modifier-groups` | 4 |
| `getModifierGroup` | `api` | GET | `/restaurants/${restaurantId}/modifier-groups/${groupId}` | 17 |
| `createModifierGroup` | `api` | POST | `/restaurants/${restaurantId}/modifier-groups` | 25 |
| `updateModifierGroup` | `api` | PUT | `/restaurants/${restaurantId}/modifier-groups/${groupId}` | 34 |
| `deleteModifierGroup` | `api` | DELETE | `/restaurants/${restaurantId}/modifier-groups/${groupId}` | 43 |

### Parámetros de llamada

- `getModifierGroups` (GET, línea 4): `{ params }`.

- `getModifierGroup` (GET, línea 17): sin cuerpo ni opciones explícitos.

- `createModifierGroup` (POST, línea 25): `payload`.

- `updateModifierGroup` (PUT, línea 34): `payload`.

- `deleteModifierGroup` (DELETE, línea 43): sin cuerpo ni opciones explícitos.

## services/menu/modifiers/modifierOptionConsumption.service.js

Fuente: [src/services/menu/modifiers/modifierOptionConsumption.service.js](../src/services/menu/modifiers/modifierOptionConsumption.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getModifierOptionConsumption` | `api` | GET | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}/consumption` | 14 |
| `saveModifierOptionConsumption` | `api` | PUT | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}/consumption` | 43 |
| `deleteModifierOptionConsumption` | `api` | DELETE | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}/consumption` | 56 |
| `resolveModifierOptionConsumption` | `api` | POST | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}/consumption/resolve` | 79 |
| `fetchCatalogProducts` | `api` | GET | `/restaurants/${restaurantId}/products` | 98 |
| `fetchWarehousesByRestaurant` | `api` | GET | `/restaurants/${restaurantId}/warehouses` | 106 |

### Parámetros de llamada

- `getModifierOptionConsumption` (GET, línea 14): sin cuerpo ni opciones explícitos.

- `saveModifierOptionConsumption` (PUT, línea 43): `cleanPayload`.

- `deleteModifierOptionConsumption` (DELETE, línea 56): sin cuerpo ni opciones explícitos.

- `resolveModifierOptionConsumption` (POST, línea 79): `cleanPayload`.

- `fetchCatalogProducts` (GET, línea 98): `{     params,   }`.

- `fetchWarehousesByRestaurant` (GET, línea 106): `{     params,   }`.

## services/menu/modifiers/modifierOptions.service.js

Fuente: [src/services/menu/modifiers/modifierOptions.service.js](../src/services/menu/modifiers/modifierOptions.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getModifierOptions` | `api` | GET | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options` | 4 |
| `getModifierOption` | `api` | GET | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}` | 12 |
| `createModifierOption` | `api` | POST | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options` | 20 |
| `updateModifierOption` | `api` | PUT | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}` | 34 |
| `deleteModifierOption` | `api` | DELETE | `/restaurants/${restaurantId}/modifier-groups/${groupId}/options/${optionId}` | 43 |

### Parámetros de llamada

- `getModifierOptions` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `getModifierOption` (GET, línea 12): sin cuerpo ni opciones explícitos.

- `createModifierOption` (POST, línea 20): `payload`.

- `updateModifierOption` (PUT, línea 34): `payload`.

- `deleteModifierOption` (DELETE, línea 43): sin cuerpo ni opciones explícitos.

## services/menu/modifiers/productModifierGroups.service.js

Fuente: [src/services/menu/modifiers/productModifierGroups.service.js](../src/services/menu/modifiers/productModifierGroups.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProductModifierGroups` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/modifier-groups` | 4 |
| `createProductModifierGroup` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/modifier-groups` | 18 |
| `updateProductModifierGroup` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/modifier-groups/${assignmentId}` | 32 |
| `deleteProductModifierGroup` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/modifier-groups/${assignmentId}` | 46 |

### Parámetros de llamada

- `getProductModifierGroups` (GET, línea 4): `{ params }`.

- `createProductModifierGroup` (POST, línea 18): `payload`.

- `updateProductModifierGroup` (PUT, línea 32): `payload`.

- `deleteProductModifierGroup` (DELETE, línea 46): `{ params }`.

## services/menu/modifiers/variantModifierGroups.service.js

Fuente: [src/services/menu/modifiers/variantModifierGroups.service.js](../src/services/menu/modifiers/variantModifierGroups.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getVariantModifierGroups` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/modifier-groups` | 9 |
| `createVariantModifierGroup` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/modifier-groups` | 28 |
| `updateVariantModifierGroup` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/modifier-groups/${assignmentId}` | 43 |
| `deleteVariantModifierGroup` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/modifier-groups/${assignmentId}` | 58 |

### Parámetros de llamada

- `getVariantModifierGroups` (GET, línea 9): `{ params }`.

- `createVariantModifierGroup` (POST, línea 28): `payload`.

- `updateVariantModifierGroup` (PUT, línea 43): `payload`.

- `deleteVariantModifierGroup` (DELETE, línea 58): `{ params }`.

## services/menu/promotions/promotion.service.js

Fuente: [src/services/menu/promotions/promotion.service.js](../src/services/menu/promotions/promotion.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPromotionBranches` | `api` | GET | `/restaurants/${restaurantId}/branches` | 222 |
| `getPromotions` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/promotions` | 246 |
| `getPromotion` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/promotions/${promotionId}` | 260 |
| `updatePromotion` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/promotions/${promotionId}` | 273 |
| `deletePromotion` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/promotions/${promotionId}` | 323 |

### Parámetros de llamada

- `getPromotionBranches` (GET, línea 222): sin cuerpo ni opciones explícitos.

- `getPromotions` (GET, línea 246): sin cuerpo ni opciones explícitos.

- `getPromotion` (GET, línea 260): sin cuerpo ni opciones explícitos.

- `updatePromotion` (PUT, línea 273): `payload`.

- `deletePromotion` (DELETE, línea 323): sin cuerpo ni opciones explícitos.

## services/menu/promotions/promotionForm.service.js

Fuente: [src/services/menu/promotions/promotionForm.service.js](../src/services/menu/promotions/promotionForm.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPromotionFormBranches` | `api` | GET | `/restaurants/${restaurantId}/branches` | 329 |
| `getPromotionFormChannels` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/sales-channels` | 347 |
| `getPromotionEligibleProducts` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/promotions/eligible-products` | 381 |
| `createPromotion` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/promotions` | 414 |

### Parámetros de llamada

- `getPromotionFormBranches` (GET, línea 329): sin cuerpo ni opciones explícitos.

- `getPromotionFormChannels` (GET, línea 347): sin cuerpo ni opciones explícitos.

- `getPromotionEligibleProducts` (GET, línea 381): `{       params: {         branch_sales_channel_ids:           normalizedChannelIds,       },     }`.

- `createPromotion` (POST, línea 414): `payload`.

## services/operation/billing-settings/branchBillingSettings.service.js

Fuente: [src/services/operation/billing-settings/branchBillingSettings.service.js](../src/services/operation/billing-settings/branchBillingSettings.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchBillingSettings` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/billing-settings` | 4 |
| `updateBranchBillingSettings` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/billing-settings` | 12 |

### Parámetros de llamada

- `getBranchBillingSettings` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `updateBranchBillingSettings` (PUT, línea 12): `payload`.

## services/operation/billing-settings/operationalAuthorizers.service.js

Fuente: [src/services/operation/billing-settings/operationalAuthorizers.service.js](../src/services/operation/billing-settings/operationalAuthorizers.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchOperationalAuthorizers` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers` | 4 |
| `getBranchOperationalAuthorizerCandidates` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers/candidates` | 12 |
| `createBranchOperationalAuthorizer` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers` | 24 |
| `updateBranchOperationalAuthorizer` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers/${authorizerId}` | 38 |
| `deleteBranchOperationalAuthorizer` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/operational-authorizers/${authorizerId}` | 51 |

### Parámetros de llamada

- `getBranchOperationalAuthorizers` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `getBranchOperationalAuthorizerCandidates` (GET, línea 12): sin cuerpo ni opciones explícitos.

- `createBranchOperationalAuthorizer` (POST, línea 24): `payload`.

- `updateBranchOperationalAuthorizer` (PUT, línea 38): `payload`.

- `deleteBranchOperationalAuthorizer` (DELETE, línea 51): sin cuerpo ni opciones explícitos.

## services/operation/discounts/discountAuthorizers.service.js

Fuente: [src/services/operation/discounts/discountAuthorizers.service.js](../src/services/operation/discounts/discountAuthorizers.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchDiscountAuthorizers` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers` | 4 |
| `getBranchDiscountAuthorizerCandidates` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers/candidates` | 12 |
| `createBranchDiscountAuthorizer` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers` | 24 |
| `updateBranchDiscountAuthorizer` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers/${authorizerId}` | 38 |
| `deleteBranchDiscountAuthorizer` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/discount-authorizers/${authorizerId}` | 51 |

### Parámetros de llamada

- `getBranchDiscountAuthorizers` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `getBranchDiscountAuthorizerCandidates` (GET, línea 12): sin cuerpo ni opciones explícitos.

- `createBranchDiscountAuthorizer` (POST, línea 24): `payload`.

- `updateBranchDiscountAuthorizer` (PUT, línea 38): `payload`.

- `deleteBranchDiscountAuthorizer` (DELETE, línea 51): sin cuerpo ni opciones explícitos.

## services/operation/discounts/discountPolicy.service.js

Fuente: [src/services/operation/discounts/discountPolicy.service.js](../src/services/operation/discounts/discountPolicy.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchDiscountPolicy` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/discount-policy` | 4 |
| `upsertBranchDiscountPolicy` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/discount-policy` | 12 |
| `deleteBranchDiscountPolicy` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/discount-policy` | 21 |

### Parámetros de llamada

- `getBranchDiscountPolicy` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `upsertBranchDiscountPolicy` (PUT, línea 12): `payload`.

- `deleteBranchDiscountPolicy` (DELETE, línea 21): sin cuerpo ni opciones explícitos.

## services/operation/loyalty/customerLoyaltySettings.service.js

Fuente: [src/services/operation/loyalty/customerLoyaltySettings.service.js](../src/services/operation/loyalty/customerLoyaltySettings.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getCustomerLoyaltySettings` | `api` | GET | `/restaurants/${restaurantId}/customer-loyalty-settings` | 11 |
| `updateCustomerLoyaltySettings` | `api` | PUT | `/restaurants/${restaurantId}/customer-loyalty-settings` | 24 |

### Parámetros de llamada

- `getCustomerLoyaltySettings` (GET, línea 11): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `updateCustomerLoyaltySettings` (PUT, línea 24): `payload`.

## services/operation/online-orders/onlineOrderActivation.service.js

Fuente: [src/services/operation/online-orders/onlineOrderActivation.service.js](../src/services/operation/online-orders/onlineOrderActivation.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOnlineOrderPlanAccess` | `api` | GET | `/restaurants/${restaurantId}/plan-access` | 10 |
| `getOnlineOrderBranchSalesChannels` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/sales-channels` | 19 |
| `getOnlineOrderQrCodes` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/qr-codes` | 31 |
| `updateOnlineOrderActivation` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/online-order-activation` | 46 |

### Parámetros de llamada

- `getOnlineOrderPlanAccess` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getOnlineOrderBranchSalesChannels` (GET, línea 19): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `getOnlineOrderQrCodes` (GET, línea 31): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `updateOnlineOrderActivation` (PUT, línea 46): `{       is_active: !!isActive,     }`.

## services/operation/online-orders/onlineOrderPayments.service.js

Fuente: [src/services/operation/online-orders/onlineOrderPayments.service.js](../src/services/operation/online-orders/onlineOrderPayments.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOnlineOrderPaymentSettings` | `api` | GET | `paymentSettingsPath(restaurantId, branchId)` | 20 |
| `saveOnlineOrderPaymentSetting` | `api` | PUT | `paymentSettingsPath(restaurantId, branchId)` | 29 |
| `getOnlineOrderTransferSetting` | `api` | GET | `transferSettingPath(restaurantId, branchId)` | 40 |
| `updateOnlineOrderTransferSetting` | `api` | PUT | `transferSettingPath(restaurantId, branchId)` | 49 |

### Parámetros de llamada

- `getOnlineOrderPaymentSettings` (GET, línea 20): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `saveOnlineOrderPaymentSetting` (PUT, línea 29): `payload`.

- `getOnlineOrderTransferSetting` (GET, línea 40): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `updateOnlineOrderTransferSetting` (PUT, línea 49): `payload`.

## services/operation/online-orders/onlineOrders.service.js

Fuente: [src/services/operation/online-orders/onlineOrders.service.js](../src/services/operation/online-orders/onlineOrders.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOnlineOrderBranches` | `api` | GET | `/restaurants/${restaurantId}/branches` | 11 |
| `getOnlineOrderSetting` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/online-order-setting` | 24 |
| `updateOnlineOrderSetting` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/online-order-setting` | 37 |
| `getOnlineOrderFulfillments` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments` | 49 |
| `saveOnlineOrderFulfillment` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments` | 62 |
| `getOnlineOrderDeliveryConcepts` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/delivery-concepts` | 74 |
| `createOnlineOrderDeliveryConcept` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/delivery-concepts` | 91 |
| `updateOnlineOrderDeliveryConcept` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/delivery-concepts/${conceptId}` | 106 |
| `deleteOnlineOrderDeliveryConcept` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/delivery-concepts/${conceptId}` | 120 |
| `getOnlineOrderScheduledPoints` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points` | 131 |
| `createOnlineOrderScheduledPoint` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points` | 148 |
| `updateOnlineOrderScheduledPoint` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}` | 163 |
| `deleteOnlineOrderScheduledPoint` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}` | 177 |
| `getOnlineOrderTimeBlocks` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}/time-blocks` | 193 |
| `createOnlineOrderTimeBlock` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}/time-blocks` | 211 |
| `updateOnlineOrderTimeBlock` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}/time-blocks/${blockId}` | 227 |
| `deleteOnlineOrderTimeBlock` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/online-order-fulfillments/${fulfillmentId}/scheduled-points/${pointId}/time-blocks/${blockId}` | 242 |

### Parámetros de llamada

- `getOnlineOrderBranches` (GET, línea 11): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getOnlineOrderSetting` (GET, línea 24): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `updateOnlineOrderSetting` (PUT, línea 37): `payload`.

- `getOnlineOrderFulfillments` (GET, línea 49): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `saveOnlineOrderFulfillment` (PUT, línea 62): `payload`.

- `getOnlineOrderDeliveryConcepts` (GET, línea 74): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `createOnlineOrderDeliveryConcept` (POST, línea 91): `payload`.

- `updateOnlineOrderDeliveryConcept` (PUT, línea 106): `payload`.

- `deleteOnlineOrderDeliveryConcept` (DELETE, línea 120): sin cuerpo ni opciones explícitos.

- `getOnlineOrderScheduledPoints` (GET, línea 131): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `createOnlineOrderScheduledPoint` (POST, línea 148): `payload`.

- `updateOnlineOrderScheduledPoint` (PUT, línea 163): `payload`.

- `deleteOnlineOrderScheduledPoint` (DELETE, línea 177): sin cuerpo ni opciones explícitos.

- `getOnlineOrderTimeBlocks` (GET, línea 193): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `createOnlineOrderTimeBlock` (POST, línea 211): `payload`.

- `updateOnlineOrderTimeBlock` (PUT, línea 227): `payload`.

- `deleteOnlineOrderTimeBlock` (DELETE, línea 242): sin cuerpo ni opciones explícitos.

## services/operation/prepared-items/preparedItemSettings.service.js

Fuente: [src/services/operation/prepared-items/preparedItemSettings.service.js](../src/services/operation/prepared-items/preparedItemSettings.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPreparedItemSetting` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/prepared-item-setting` | 4 |
| `updatePreparedItemSetting` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/prepared-item-setting` | 16 |
| `getPreparedProductPolicies` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/prepared-product-policies` | 25 |
| `getPreparedProductPolicy` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/prepared-product-policies/${productId}` | 37 |
| `updatePreparedProductPolicy` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/prepared-product-policies/${productId}` | 50 |
| `deletePreparedProductPolicy` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/prepared-product-policies/${productId}` | 63 |

### Parámetros de llamada

- `getPreparedItemSetting` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `updatePreparedItemSetting` (PUT, línea 16): `payload`.

- `getPreparedProductPolicies` (GET, línea 25): sin cuerpo ni opciones explícitos.

- `getPreparedProductPolicy` (GET, línea 37): sin cuerpo ni opciones explícitos.

- `updatePreparedProductPolicy` (PUT, línea 50): `payload`.

- `deletePreparedProductPolicy` (DELETE, línea 63): sin cuerpo ni opciones explícitos.

## services/operation/ticket/branchPrintSetting.service.js

Fuente: [src/services/operation/ticket/branchPrintSetting.service.js](../src/services/operation/ticket/branchPrintSetting.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchPrintSetting` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/print-setting` | 11 |
| `updateBranchPrintSetting` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/print-setting` | 28 |
| `deleteBranchPrintSetting` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/print-setting` | 38 |

### Parámetros de llamada

- `getBranchPrintSetting` (GET, línea 11): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `updateBranchPrintSetting` (PUT, línea 28): `payload`.

- `deleteBranchPrintSetting` (DELETE, línea 38): sin cuerpo ni opciones explícitos.

## services/operation/ticket/branchWhasapoSetting.service.js

Fuente: [src/services/operation/ticket/branchWhasapoSetting.service.js](../src/services/operation/ticket/branchWhasapoSetting.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchWhasapoSetting` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/whasapo-setting` | 11 |
| `updateBranchWhasapoSetting` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/whasapo-setting` | 28 |
| `deleteBranchWhasapoSetting` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/whasapo-setting` | 38 |

### Parámetros de llamada

- `getBranchWhasapoSetting` (GET, línea 11): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `updateBranchWhasapoSetting` (PUT, línea 28): `payload`.

- `deleteBranchWhasapoSetting` (DELETE, línea 38): sin cuerpo ni opciones explícitos.

## services/operation/ticket/ticketSettings.service.js

Fuente: [src/services/operation/ticket/ticketSettings.service.js](../src/services/operation/ticket/ticketSettings.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getTicketSettings` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/ticket-settings` | 11 |
| `updateTicketSettings` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/ticket-settings` | 24 |

### Parámetros de llamada

- `getTicketSettings` (GET, línea 11): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `updateTicketSettings` (PUT, línea 24): `payload`.

## services/owner/addon.service.js

Fuente: [src/services/owner/addon.service.js](../src/services/owner/addon.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getRestaurantAddons` | `api` | GET | `/restaurants/${restaurantId}/addons` | 4 |
| `getRestaurantAddonCatalog` | `api` | GET | `/restaurants/${restaurantId}/addons/catalog` | 9 |
| `getRestaurantAddonHistory` | `api` | GET | `/restaurants/${restaurantId}/addons/history` | 14 |

### Parámetros de llamada

- `getRestaurantAddons` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `getRestaurantAddonCatalog` (GET, línea 9): sin cuerpo ni opciones explícitos.

- `getRestaurantAddonHistory` (GET, línea 14): `{ params }`.

## services/owner/ownerProfile.service.js

Fuente: [src/services/owner/ownerProfile.service.js](../src/services/owner/ownerProfile.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getOwnerProfile` | `api` | GET | `"/owner/profile"` | 11 |
| `updateOwnerProfile` | `api` | PUT | `"/owner/profile"` | 22 |

### Parámetros de llamada

- `getOwnerProfile` (GET, línea 11): `{     params: {       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `updateOwnerProfile` (PUT, línea 22): `payload, {     headers: NO_CACHE_HEADERS,   }`.

## services/owner/plan.service.js

Fuente: [src/services/owner/plan.service.js](../src/services/owner/plan.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPlans` | `api` | GET | `"/plans"` | 5 |

### Parámetros de llamada

- `getPlans` (GET, línea 5): sin cuerpo ni opciones explícitos.

## services/owner/platformBilling.service.js

Fuente: [src/services/owner/platformBilling.service.js](../src/services/owner/platformBilling.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPlatformPurchases` | `api` | GET | `"/platform-purchases"` | 10 |
| `getPlatformInvoices` | `api` | GET | `"/platform-invoices"` | 19 |
| `getPlatformInvoice` | `api` | GET | `/platform-invoices/${invoiceId}` | 28 |
| `createPlatformInvoice` | `api` | POST | `"/platform-invoices"` | 37 |
| `retryPlatformInvoice` | `api` | POST | `/platform-invoices/${invoiceId}/retry` | 42 |
| `downloadPlatformInvoiceDocument` | `api` | GET | `/platform-invoices/${invoiceId}/${type}/download` | 55 |

### Parámetros de llamada

- `getPlatformPurchases` (GET, línea 10): `{     params: { ...params, _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getPlatformInvoices` (GET, línea 19): `{     params: { ...params, _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getPlatformInvoice` (GET, línea 28): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `createPlatformInvoice` (POST, línea 37): `payload`.

- `retryPlatformInvoice` (POST, línea 42): sin cuerpo ni opciones explícitos.

- `downloadPlatformInvoiceDocument` (GET, línea 55): `{     responseType: "blob",     headers: NO_CACHE_HEADERS,   }`.

## services/owner/taxProfile.service.js

Fuente: [src/services/owner/taxProfile.service.js](../src/services/owner/taxProfile.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getTaxProfile` | `api` | GET | `"/tax-profile"` | 10 |
| `updateTaxProfile` | `api` | PUT | `"/tax-profile"` | 19 |

### Parámetros de llamada

- `getTaxProfile` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `updateTaxProfile` (PUT, línea 19): `payload, {     headers: NO_CACHE_HEADERS,   }`.

## services/paypal/paypal.service.js

Fuente: [src/services/paypal/paypal.service.js](../src/services/paypal/paypal.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPayPalConfig` | `api` | GET | `"/paypal/config"` | 9 |
| `createPayPalCheckout` | `api` | POST | `/restaurants/${restaurantId}/paypal/checkout` | 17 |
| `capturePayPalOrder` | `api` | POST | `/restaurants/${restaurantId}/paypal/capture` | 29 |

### Parámetros de llamada

- `getPayPalConfig` (GET, línea 9): sin cuerpo ni opciones explícitos.

- `createPayPalCheckout` (POST, línea 17): `payload`.

- `capturePayPalOrder` (POST, línea 29): `{       order_id: orderId,     }`.

## services/plan/planAccess.service.js

Fuente: [src/services/plan/planAccess.service.js](../src/services/plan/planAccess.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPlanAccess` | `api` | GET | `/restaurants/${restaurantId}/plan-access` | 5 |
| `getStaffPlanAccess` | `staffApi` | GET | `"/staff/cashier/plan-access"` | 13 |

### Parámetros de llamada

- `getPlanAccess` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `getStaffPlanAccess` (GET, línea 13): sin cuerpo ni opciones explícitos.

## services/products/catalog/productComponents.service.js

Fuente: [src/services/products/catalog/productComponents.service.js](../src/services/products/catalog/productComponents.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProductComponents` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/components` | 39 |
| `upsertProductComponents` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/components` | 49 |
| `getComponentCandidates` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/components/candidates` | 59 |

### Parámetros de llamada

- `getProductComponents` (GET, línea 39): `{ params: finalParams }`.

- `upsertProductComponents` (PUT, línea 49): `finalPayload`.

- `getComponentCandidates` (GET, línea 59): `{ params: finalParams }`.

## services/products/catalog/productInventoryType.service.js

Fuente: [src/services/products/catalog/productInventoryType.service.js](../src/services/products/catalog/productInventoryType.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `changeInventoryType` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/inventory-type` | 4 |

### Parámetros de llamada

- `changeInventoryType` (PUT, línea 4): `{ inventory_type }`.

## services/products/catalog/productType.service.js

Fuente: [src/services/products/catalog/productType.service.js](../src/services/products/catalog/productType.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `changeProductType` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/type` | 4 |

### Parámetros de llamada

- `changeProductType` (PUT, línea 4): `{ product_type }`.

## services/products/products.service.js

Fuente: [src/services/products/products.service.js](../src/services/products/products.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProducts` | `api` | GET | `/restaurants/${restaurantId}/products` | 4 |
| `createProduct` | `api` | POST | `/restaurants/${restaurantId}/products` | 22 |
| `getProduct` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}` | 30 |
| `updateProduct` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}` | 37 |
| `deleteProduct` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}` | 45 |
| `getProductSatMapping` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/sat` | 54 |
| `updateProductSatMapping` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/sat` | 66 |
| `getProductImages` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/images` | 76 |
| `uploadProductImage` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/images` | 95 |
| `deleteProductImage` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/images/${imageId}` | 104 |
| `reorderProductImages` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/images/reorder` | 111 |

### Parámetros de llamada

- `getProducts` (GET, línea 4): `{     params,   }`.

- `createProduct` (POST, línea 22): `payload`.

- `getProduct` (GET, línea 30): sin cuerpo ni opciones explícitos.

- `updateProduct` (PUT, línea 37): `payload`.

- `deleteProduct` (DELETE, línea 45): sin cuerpo ni opciones explícitos.

- `getProductSatMapping` (GET, línea 54): sin cuerpo ni opciones explícitos.

- `updateProductSatMapping` (PUT, línea 66): `payload`.

- `getProductImages` (GET, línea 76): sin cuerpo ni opciones explícitos.

- `uploadProductImage` (POST, línea 95): `fd`.

- `deleteProductImage` (DELETE, línea 104): sin cuerpo ni opciones explícitos.

- `reorderProductImages` (PUT, línea 111): `{ items }`.

## services/products/sales_channels/productChannel.service.js

Fuente: [src/services/products/sales_channels/productChannel.service.js](../src/services/products/sales_channels/productChannel.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getChannelProducts` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}/products` | 5 |
| `upsertChannelProduct` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}/products/${productId}` | 13 |
| `deleteChannelProduct` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}/products/${productId}` | 22 |

### Parámetros de llamada

- `getChannelProducts` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `upsertChannelProduct` (PUT, línea 13): `payload`.

- `deleteChannelProduct` (DELETE, línea 22): sin cuerpo ni opciones explícitos.

## services/products/sales_channels/sales_channels.service.js

Fuente: [src/services/products/sales_channels/sales_channels.service.js](../src/services/products/sales_channels/sales_channels.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSalesChannels` | `api` | GET | `/restaurants/${restaurantId}/sales-channels` | 5 |
| `createSalesChannel` | `api` | POST | `/restaurants/${restaurantId}/sales-channels` | 11 |
| `updateSalesChannel` | `api` | PUT | `/restaurants/${restaurantId}/sales-channels/${salesChannelId}` | 17 |
| `deleteSalesChannel` | `api` | DELETE | `/restaurants/${restaurantId}/sales-channels/${salesChannelId}` | 26 |

### Parámetros de llamada

- `getSalesChannels` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `createSalesChannel` (POST, línea 11): `payload`.

- `updateSalesChannel` (PUT, línea 17): `payload`.

- `deleteSalesChannel` (DELETE, línea 26): sin cuerpo ni opciones explícitos.

## services/products/variants/productVariantChannels.service.js

Fuente: [src/services/products/variants/productVariantChannels.service.js](../src/services/products/variants/productVariantChannels.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getVariantChannels` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/channels` | 5 |
| `upsertVariantChannels` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/channels` | 13 |
| `deleteVariantChannelOverride` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/channels/${branchSalesChannelId}` | 21 |

### Parámetros de llamada

- `getVariantChannels` (GET, línea 5): `{ params: { branch_id: branchId } }`.

- `upsertVariantChannels` (PUT, línea 13): `{ items }`.

- `deleteVariantChannelOverride` (DELETE, línea 21): sin cuerpo ni opciones explícitos.

## services/products/variants/productVariantGenerator.service.js

Fuente: [src/services/products/variants/productVariantGenerator.service.js](../src/services/products/variants/productVariantGenerator.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `generateProductVariants` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/variants/generate` | 23 |

### Parámetros de llamada

- `generateProductVariants` (POST, línea 23): `body`.

## services/products/variants/productVariantImages.service.js

Fuente: [src/services/products/variants/productVariantImages.service.js](../src/services/products/variants/productVariantImages.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProductVariantImage` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/image` | 11 |
| `uploadProductVariantImage` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/image` | 32 |
| `deleteProductVariantImage` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/image` | 51 |

### Parámetros de llamada

- `getProductVariantImage` (GET, línea 11): sin cuerpo ni opciones explícitos.

- `uploadProductVariantImage` (POST, línea 32): `formData`.

- `deleteProductVariantImage` (DELETE, línea 51): sin cuerpo ni opciones explícitos.

## services/products/variants/productVariants.service.js

Fuente: [src/services/products/variants/productVariants.service.js](../src/services/products/variants/productVariants.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProductVariants` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/variants` | 8 |
| `toggleProductVariant` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/toggle` | 19 |
| `setDefaultProductVariant` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/default` | 31 |
| `repairProductVariant` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}/repair` | 39 |
| `deleteProductVariant` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/variants/${variantId}` | 50 |

### Parámetros de llamada

- `getProductVariants` (GET, línea 8): sin cuerpo ni opciones explícitos.

- `toggleProductVariant` (PUT, línea 19): `{ is_enabled: !!isEnabled }`.

- `setDefaultProductVariant` (PUT, línea 31): `{ is_default: !!isDefault }`.

- `repairProductVariant` (PUT, línea 39): `payload`.

- `deleteProductVariant` (DELETE, línea 50): sin cuerpo ni opciones explícitos.

## services/products/variants/variantAttributes.service.js

Fuente: [src/services/products/variants/variantAttributes.service.js](../src/services/products/variants/variantAttributes.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getVariantAttributes` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/variant-attributes` | 9 |
| `createVariantAttribute` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/variant-attributes` | 22 |
| `updateVariantAttribute` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}` | 40 |
| `deleteVariantAttribute` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}` | 52 |

### Parámetros de llamada

- `getVariantAttributes` (GET, línea 9): `{ params }`.

- `createVariantAttribute` (POST, línea 22): `payload`.

- `updateVariantAttribute` (PUT, línea 40): `payload`.

- `deleteVariantAttribute` (DELETE, línea 52): sin cuerpo ni opciones explícitos.

## services/products/variants/variantAttributeValues.service.js

Fuente: [src/services/products/variants/variantAttributeValues.service.js](../src/services/products/variants/variantAttributeValues.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getVariantAttributeValues` | `api` | GET | `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}/values` | 14 |
| `createVariantAttributeValue` | `api` | POST | `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}/values` | 32 |
| `updateVariantAttributeValue` | `api` | PUT | `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}/values/${valueId}` | 51 |
| `deleteVariantAttributeValue` | `api` | DELETE | `/restaurants/${restaurantId}/products/${productId}/variant-attributes/${attributeId}/values/${valueId}` | 68 |

### Parámetros de llamada

- `getVariantAttributeValues` (GET, línea 14): `{ params }`.

- `createVariantAttributeValue` (POST, línea 32): `payload`.

- `updateVariantAttributeValue` (PUT, línea 51): `payload`.

- `deleteVariantAttributeValue` (DELETE, línea 68): sin cuerpo ni opciones explícitos.

## services/public/clicMenuBlog.service.js

Fuente: [src/services/public/clicMenuBlog.service.js](../src/services/public/clicMenuBlog.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getClicMenuBlog` | `publicBlogApi` | GET | `BLOG_BASE_ROUTE` | 21 |
| `getClicMenuBlogPosts` | `publicBlogApi` | GET | `${BLOG_BASE_ROUTE}/posts` | 27 |
| `getClicMenuBlogPost` | `publicBlogApi` | GET | `${BLOG_BASE_ROUTE}/posts/${slug}` | 46 |
| `getClicMenuBlogCategories` | `publicBlogApi` | GET | `${BLOG_BASE_ROUTE}/categories` | 54 |
| `getClicMenuBlogCategoryPosts` | `publicBlogApi` | GET | `${BLOG_BASE_ROUTE}/categories/${slug}/posts` | 76 |
| `getClicMenuBlogTags` | `publicBlogApi` | GET | `${BLOG_BASE_ROUTE}/tags` | 87 |
| `getClicMenuBlogTagPosts` | `publicBlogApi` | GET | `${BLOG_BASE_ROUTE}/tags/${slug}/posts` | 109 |

Constantes y constructores locales de referencia:

```js
SYSTEM_SLUG = "clic-menu"
BLOG_SLUG = "blog-clicmenu"
BLOG_BASE_ROUTE = `/public/v1/${SYSTEM_SLUG}/blogs/${BLOG_SLUG}`
normalizeSlug = (value) =>
  encodeURIComponent(String(value ?? "").trim())
cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ""
    )
  )
function getClicMenuBlogSitemapUrl() {
  const baseUrl = String(
    import.meta.env.VITE_BLOG_API_BASE_URL || ""
  ).replace(/\/+$/, "");

  return `${baseUrl}${BLOG_BASE_ROUTE}/sitemap.xml`;
}
```

### Parámetros de llamada

- `getClicMenuBlog` (GET, línea 21): sin cuerpo ni opciones explícitos.

- `getClicMenuBlogPosts` (GET, línea 27): `{       params: cleanParams(params),     }`.

- `getClicMenuBlogPost` (GET, línea 46): sin cuerpo ni opciones explícitos.

- `getClicMenuBlogCategories` (GET, línea 54): `{       params: cleanParams(params),     }`.

- `getClicMenuBlogCategoryPosts` (GET, línea 76): `{       params: cleanParams(params),     }`.

- `getClicMenuBlogTags` (GET, línea 87): `{       params: cleanParams(params),     }`.

- `getClicMenuBlogTagPosts` (GET, línea 109): `{       params: cleanParams(params),     }`.

## services/public/order-tracking/publicOrderTracking.service.js

Fuente: [src/services/public/order-tracking/publicOrderTracking.service.js](../src/services/public/order-tracking/publicOrderTracking.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPublicOnlineOrderTracking` | `publicTrackingApi` | GET | `/public/online-orders/tracking/${encodeURIComponent(token)}` | 24 |

Constantes y constructores locales de referencia:

```js
apiBase =
  import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api"
```

### Parámetros de llamada

- `getPublicOnlineOrderTracking` (GET, línea 24): sin cuerpo ni opciones explícitos.

## services/public/publicInvoice.service.js

Fuente: [src/services/public/publicInvoice.service.js](../src/services/public/publicInvoice.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getPublicInvoice` | `publicApi` | GET | `/public/invoice/${cleanToken}` | 17 |
| `stampPublicInvoice` | `publicApi` | POST | `/public/invoice/${cleanToken}/stamp` | 25 |

Constantes y constructores locales de referencia:

```js
apiBase =
  import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api"
```

### Parámetros de llamada

- `getPublicInvoice` (GET, línea 17): sin cuerpo ni opciones explícitos.

- `stampPublicInvoice` (POST, línea 25): `payload`.

## services/public/publicMenu.service.js

Fuente: [src/services/public/publicMenu.service.js](../src/services/public/publicMenu.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `resolveMenuToken` | `publicApi` | GET | `/public/menu/${token}/resolve` | 42 |
| `fetchResolvedMenu` | `publicApi` | GET | `/public/menu/${token}` | 47 |
| `fetchPublicMenuSets` | `publicApi` | GET | `/public/menu/${safeToken}/sets` | 66 |
| `fetchPreparedItems` | `publicApi` | GET | `/public/menu/${safeToken}/prepared-items` | 82 |
| `scanTable` | `publicApi` | POST | `/public/tables/${tableId}/scan` | 94 |
| `getTableSession` | `publicApi` | GET | `/public/table-sessions/${sessionId}` | 102 |
| `heartbeatTableSession` | `publicApi` | POST | `/public/table-sessions/${sessionId}/heartbeat` | 110 |
| `createJoinRequest` | `publicApi` | POST | `/public/tables/${tableId}/join-request` | 124 |
| `getJoinRequestStatus` | `publicApi` | GET | `/public/tables/${tableId}/join-request/status` | 132 |
| `callWaiterByTable` | `publicApi` | POST | `/public/tables/${tableId}/call-waiter` | 145 |
| `createPublicOrder` | `publicApi` | POST | `/public/orders` | 176 |
| `getPublicOrder` | `publicApi` | GET | `/public/orders/${orderId}` | 182 |
| `appendPublicOrderItems` | `publicApi` | POST | `/public/orders/${orderId}/append-items` | 199 |
| `requestOrderCancellation` | `publicApi` | POST | `/public/orders/${Number(orderId)}/cancellation-request` | 235 |
| `requestPublicOrderBill` | `publicApi` | POST | `/public/orders/${orderId}/request-bill` | 262 |
| `sendPublicWhatsapp` | `publicApi` | POST | `/public/web/send-whatsapp` | 273 |
| `quotePublicOnlineOrder` | `publicApi` | POST | `/public/menu/${encodeURIComponent(String(token &#124;&#124; ""))}/online-order/quote` | 283 |
| `createPublicOnlineOrder` | `publicApi` | POST | `/public/menu/${encodeURIComponent(String(token &#124;&#124; ""))}/online-order/orders` | 292 |

Constantes y constructores locales de referencia:

```js
apiBase =
  import.meta.env.VITE_API_BASE_URL || "https://api.clicmenu.com.mx/api"
```

### Parámetros de llamada

- `resolveMenuToken` (GET, línea 42): sin cuerpo ni opciones explícitos.

- `fetchResolvedMenu` (GET, línea 47): sin cuerpo ni opciones explícitos.

- `fetchPublicMenuSets` (GET, línea 66): `{     params,   }`.

- `fetchPreparedItems` (GET, línea 82): sin cuerpo ni opciones explícitos.

- `scanTable` (POST, línea 94): `{     device_identifier,   }`.

- `getTableSession` (GET, línea 102): `{     params: { device_identifier },   }`.

- `heartbeatTableSession` (POST, línea 110): `{ device_identifier }`.

- `createJoinRequest` (POST, línea 124): `{     device_identifier,   }`.

- `getJoinRequestStatus` (GET, línea 132): `{     params: { device_identifier },   }`.

- `callWaiterByTable` (POST, línea 145): `{     device_identifier,   }`.

- `createPublicOrder` (POST, línea 176): `payload`.

- `getPublicOrder` (GET, línea 182): `{     params: {       token: String(token &#124;&#124; ""),       device_identifier,     },   }`.

- `appendPublicOrderItems` (POST, línea 199): `payload`.

- `requestOrderCancellation` (POST, línea 235): `payload, {       params: {         token: String(token &#124;&#124; ""),         device_identifier,       },     }`.

- `requestPublicOrderBill` (POST, línea 262): `payload`.

- `sendPublicWhatsapp` (POST, línea 273): `payload`.

- `quotePublicOnlineOrder` (POST, línea 283): `payload`.

- `createPublicOnlineOrder` (POST, línea 292): `payload`.

## services/public-menu/branchPublicMenu.service.js

Fuente: [src/services/public-menu/branchPublicMenu.service.js](../src/services/public-menu/branchPublicMenu.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchPublicMenuSetting` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/public-menu-setting` | 10 |
| `createBranchPublicMenuSetting` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/public-menu-setting` | 22 |
| `updateBranchPublicMenuSetting` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/public-menu-setting` | 31 |
| `uploadBranchPublicMenuCover` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/public-menu/cover` | 43 |
| `deleteBranchPublicMenuCover` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/public-menu/cover` | 52 |
| `getBranchPublicMenuGallery` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/public-menu/gallery` | 62 |
| `uploadBranchPublicMenuGalleryImage` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/public-menu/gallery` | 90 |
| `updateBranchPublicMenuGalleryImage` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/public-menu/gallery/${imageId}` | 104 |
| `deleteBranchPublicMenuGalleryImage` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/public-menu/gallery/${imageId}` | 117 |

### Parámetros de llamada

- `getBranchPublicMenuSetting` (GET, línea 10): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `createBranchPublicMenuSetting` (POST, línea 22): `payload`.

- `updateBranchPublicMenuSetting` (PUT, línea 31): `payload`.

- `uploadBranchPublicMenuCover` (POST, línea 43): `fd`.

- `deleteBranchPublicMenuCover` (DELETE, línea 52): sin cuerpo ni opciones explícitos.

- `getBranchPublicMenuGallery` (GET, línea 62): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `uploadBranchPublicMenuGalleryImage` (POST, línea 90): `fd`.

- `updateBranchPublicMenuGalleryImage` (PUT, línea 104): `payload`.

- `deleteBranchPublicMenuGalleryImage` (DELETE, línea 117): sin cuerpo ni opciones explícitos.

## services/referrals/referral.service.js

Fuente: [src/services/referrals/referral.service.js](../src/services/referrals/referral.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `ámbito de módulo` | `axios` | POST | `${REFERRAL_API}/check-codigo` | 6 |

Constantes y constructores locales de referencia:

```js
REFERRAL_API = "https://api.tecnologiasadministrativas.com/api"
checkReferralCode = async (codigoRef) => {
  const { data } = await axios.post(`${REFERRAL_API}/check-codigo`, {
    codigo_ref: codigoRef,
  });

  return data;
}
```

### Parámetros de llamada

- `ámbito de módulo` (POST, línea 6): `{     codigo_ref: codigoRef,   }`.

## services/reports/inventoryReport.service.js

Fuente: [src/services/reports/inventoryReport.service.js](../src/services/reports/inventoryReport.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getInventoryReportSummary` | `api` | GET | `/restaurants/${restaurantId}/reports/inventory/summary` | 18 |
| `getInventoryReportTable` | `api` | GET | `/restaurants/${restaurantId}/reports/inventory/table` | 33 |
| `downloadInventoryReportExcel` | `api` | GET | `getInventoryReportExcelUrl(restaurantId, params)` | 62 |
| `downloadInventoryReportPdf` | `api` | GET | `getInventoryReportPdfUrl(restaurantId, params)` | 70 |

Constantes y constructores locales de referencia:

```js
function getInventoryReportExcelUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  return `/restaurants/${restaurantId}/reports/inventory/export/excel${
    query ? `?${query}` : ""
  }`;
}
function getInventoryReportPdfUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();
  return `/restaurants/${restaurantId}/reports/inventory/export/pdf${
    query ? `?${query}` : ""
  }`;
}
```

### Parámetros de llamada

- `getInventoryReportSummary` (GET, línea 18): `{       params: {         ...cleanParams(params),         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

- `getInventoryReportTable` (GET, línea 33): `{       params: {         ...cleanParams(params),         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

- `downloadInventoryReportExcel` (GET, línea 62): `{     responseType: "blob",   }`.

- `downloadInventoryReportPdf` (GET, línea 70): `{     responseType: "blob",   }`.

## services/reports/profitReport.service.js

Fuente: [src/services/reports/profitReport.service.js](../src/services/reports/profitReport.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getProfitReportSummary` | `api` | GET | `/restaurants/${restaurantId}/reports/profit/summary` | 18 |
| `getProfitReportTable` | `api` | GET | `/restaurants/${restaurantId}/reports/profit/table` | 33 |
| `downloadProfitReportExcel` | `api` | GET | `getProfitReportExcelUrl(restaurantId, params)` | 64 |
| `downloadProfitReportPdf` | `api` | GET | `getProfitReportPdfUrl(restaurantId, params)` | 70 |

Constantes y constructores locales de referencia:

```js
function getProfitReportExcelUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();

  return `/restaurants/${restaurantId}/reports/profit/export/excel${
    query ? `?${query}` : ""
  }`;
}
function getProfitReportPdfUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();

  return `/restaurants/${restaurantId}/reports/profit/export/pdf${
    query ? `?${query}` : ""
  }`;
}
```

### Parámetros de llamada

- `getProfitReportSummary` (GET, línea 18): `{       params: {         ...cleanParams(params),         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

- `getProfitReportTable` (GET, línea 33): `{       params: {         ...cleanParams(params),         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

- `downloadProfitReportExcel` (GET, línea 64): `{     responseType: "blob",   }`.

- `downloadProfitReportPdf` (GET, línea 70): `{     responseType: "blob",   }`.

## services/reports/salesReport.service.js

Fuente: [src/services/reports/salesReport.service.js](../src/services/reports/salesReport.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSalesReportSummary` | `api` | GET | `/restaurants/${restaurantId}/reports/summary` | 18 |
| `getSalesReportTable` | `api` | GET | `/restaurants/${restaurantId}/reports/sales` | 30 |
| `downloadSalesReportExcel` | `api` | GET | `getSalesReportExcelUrl(restaurantId, params)` | 58 |
| `downloadSalesReportPdf` | `api` | GET | `getSalesReportPdfUrl(restaurantId, params)` | 64 |

Constantes y constructores locales de referencia:

```js
function getSalesReportExcelUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();

  return `/restaurants/${restaurantId}/reports/export/excel${
    query ? `?${query}` : ""
  }`;
}
function getSalesReportPdfUrl(restaurantId, params = {}) {
  const query = new URLSearchParams(cleanParams(params)).toString();

  return `/restaurants/${restaurantId}/reports/export/pdf${
    query ? `?${query}` : ""
  }`;
}
```

### Parámetros de llamada

- `getSalesReportSummary` (GET, línea 18): `{     params: {       ...cleanParams(params),       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `getSalesReportTable` (GET, línea 30): `{     params: {       ...cleanParams(params),       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `downloadSalesReportExcel` (GET, línea 58): `{     responseType: "blob",   }`.

- `downloadSalesReportPdf` (GET, línea 64): `{     responseType: "blob",   }`.

## services/restaurant/branch.service.js

Fuente: [src/services/restaurant/branch.service.js](../src/services/restaurant/branch.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchesByRestaurant` | `api` | GET | `/restaurants/${restaurantId}/branches` | 5 |
| `createBranch` | `api` | POST | `/restaurants/${restaurantId}/branches` | 11 |
| `updateBranch` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}` | 17 |
| `getBranch` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}` | 23 |
| `dryRunDeleteBranch` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/hard-delete-dry-run` | 29 |
| `deleteBranch` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}` | 38 |
| `getBranchLogo` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/logo` | 50 |
| `getBranchLogoHistory` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/logos` | 56 |
| `uploadBranchLogo` | `api` | POST | `/restaurants/${restaurantId}/branches/${branchId}/logo` | 65 |
| `deleteActiveBranchLogo` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/logo` | 75 |
| `deleteBranchLogoFromHistory` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/logos/${logoId}` | 83 |

### Parámetros de llamada

- `getBranchesByRestaurant` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `createBranch` (POST, línea 11): `payload`.

- `updateBranch` (PUT, línea 17): `payload`.

- `getBranch` (GET, línea 23): sin cuerpo ni opciones explícitos.

- `dryRunDeleteBranch` (POST, línea 29): sin cuerpo ni opciones explícitos.

- `deleteBranch` (DELETE, línea 38): sin cuerpo ni opciones explícitos.

- `getBranchLogo` (GET, línea 50): sin cuerpo ni opciones explícitos.

- `getBranchLogoHistory` (GET, línea 56): sin cuerpo ni opciones explícitos.

- `uploadBranchLogo` (POST, línea 65): `fd`.

- `deleteActiveBranchLogo` (DELETE, línea 75): sin cuerpo ni opciones explícitos.

- `deleteBranchLogoFromHistory` (DELETE, línea 83): sin cuerpo ni opciones explícitos.

## services/restaurant/branchCatalog.service.js

Fuente: [src/services/restaurant/branchCatalog.service.js](../src/services/restaurant/branchCatalog.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchCatalog` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/catalog` | 5 |
| `upsertProductOverride` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/products/${productId}/override` | 12 |
| `deleteProductOverride` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/products/${productId}/override` | 20 |

### Parámetros de llamada

- `getBranchCatalog` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `upsertProductOverride` (PUT, línea 12): `payload`.

- `deleteProductOverride` (DELETE, línea 20): sin cuerpo ni opciones explícitos.

## services/restaurant/branchSalesChannels.service.js

Fuente: [src/services/restaurant/branchSalesChannels.service.js](../src/services/restaurant/branchSalesChannels.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getBranchSalesChannels` | `api` | GET | `/restaurants/${restaurantId}/branches/${branchId}/sales-channels` | 6 |
| `upsertBranchSalesChannel` | `api` | PUT | `/restaurants/${restaurantId}/branches/${branchId}/sales-channels/${salesChannelId}` | 18 |

### Parámetros de llamada

- `getBranchSalesChannels` (GET, línea 6): sin cuerpo ni opciones explícitos.

- `upsertBranchSalesChannel` (PUT, línea 18): `{ is_active }`.

## services/restaurant/demoContent.service.js

Fuente: [src/services/restaurant/demoContent.service.js](../src/services/restaurant/demoContent.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getDemoContentStatus` | `api` | GET | `/restaurants/${restaurantId}/demo-content` | 5 |
| `deleteDemoContent` | `api` | DELETE | `/restaurants/${restaurantId}/branches/${branchId}/demo-content` | 11 |

### Parámetros de llamada

- `getDemoContentStatus` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `deleteDemoContent` (DELETE, línea 11): `{       data: {         confirm: true,       },     }`.

## services/restaurant/restaurant.service.js

Fuente: [src/services/restaurant/restaurant.service.js](../src/services/restaurant/restaurant.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getMyRestaurants` | `api` | GET | `"/restaurants"` | 6 |
| `createRestaurant` | `api` | POST | `"/restaurants"` | 12 |
| `getRestaurant` | `api` | GET | `/restaurants/${id}` | 18 |
| `updateRestaurant` | `api` | PUT | `/restaurants/${id}` | 24 |
| `dryRunDeleteRestaurant` | `api` | POST | `/restaurants/${id}/hard-delete-dry-run` | 30 |
| `deleteRestaurant` | `api` | DELETE | `/restaurants/${id}` | 36 |
| `getRestaurantSubscriptionStatus` | `api` | GET | `/restaurants/${restaurantId}/subscription` | 42 |
| `getRestaurantSubscriptions` | `api` | GET | `/restaurants/${restaurantId}/subscriptions` | 62 |
| `getRestaurantSubscription` | `api` | GET | `/restaurants/${restaurantId}/subscriptions/${subscriptionId}` | 71 |
| `subscribeRestaurant` | `api` | POST | `/restaurants/${restaurantId}/subscribe` | 80 |
| `setRestaurantMainBranch` | `api` | PUT | `/restaurants/${restaurantId}/main-branch` | 86 |

### Parámetros de llamada

- `getMyRestaurants` (GET, línea 6): sin cuerpo ni opciones explícitos.

- `createRestaurant` (POST, línea 12): `payload`.

- `getRestaurant` (GET, línea 18): sin cuerpo ni opciones explícitos.

- `updateRestaurant` (PUT, línea 24): `payload`.

- `dryRunDeleteRestaurant` (POST, línea 30): sin cuerpo ni opciones explícitos.

- `deleteRestaurant` (DELETE, línea 36): sin cuerpo ni opciones explícitos.

- `getRestaurantSubscriptionStatus` (GET, línea 42): sin cuerpo ni opciones explícitos.

- `getRestaurantSubscriptions` (GET, línea 62): `{     params,   }`.

- `getRestaurantSubscription` (GET, línea 71): sin cuerpo ni opciones explícitos.

- `subscribeRestaurant` (POST, línea 80): `payload`.

- `setRestaurantMainBranch` (PUT, línea 86): `{     main_branch_id: mainBranchId,   }`.

## services/restaurant/restaurantSettings.service.js

Fuente: [src/services/restaurant/restaurantSettings.service.js](../src/services/restaurant/restaurantSettings.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getRestaurantSettings` | `api` | GET | `/restaurants/${restaurantId}/settings` | 4 |
| `upsertRestaurantSettings` | `api` | PUT | `/restaurants/${restaurantId}/settings` | 18 |

### Parámetros de llamada

- `getRestaurantSettings` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `upsertRestaurantSettings` (PUT, línea 18): `payload`.

## services/staff/casher/cashierAdjustment.service.js

Fuente: [src/services/staff/casher/cashierAdjustment.service.js](../src/services/staff/casher/cashierAdjustment.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierSaleAdjustments` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/adjustments` | 11 |
| `cancelCashierSaleItems` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/adjustments/cancel-items` | 19 |
| `cancelCashierSaleOrder` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/adjustments/cancel-order` | 28 |

### Parámetros de llamada

- `fetchCashierSaleAdjustments` (GET, línea 11): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `cancelCashierSaleItems` (POST, línea 19): `payload, { headers: NO_CACHE_HEADERS }`.

- `cancelCashierSaleOrder` (POST, línea 28): `payload, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierCustomer.service.js

Fuente: [src/services/staff/casher/cashierCustomer.service.js](../src/services/staff/casher/cashierCustomer.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `searchCashierCustomers` | `staffApi` | GET | `"/staff/cashier/customers/search"` | 11 |
| `createCashierCustomer` | `staffApi` | POST | `"/staff/cashier/customers"` | 22 |
| `fetchCashierSaleCustomerData` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/customer-data` | 29 |
| `saveCashierSaleContactData` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/contact-data` | 40 |
| `removeCashierSaleContactData` | `staffApi` | DELETE | `/staff/cashier/sales/${saleId}/contact-data` | 49 |
| `attachCashierSaleCustomer` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/customer` | 57 |
| `detachCashierSaleCustomer` | `staffApi` | DELETE | `/staff/cashier/sales/${saleId}/customer` | 66 |

### Parámetros de llamada

- `searchCashierCustomers` (GET, línea 11): `{     params: {       ...params,       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `createCashierCustomer` (POST, línea 22): `payload, {     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierSaleCustomerData` (GET, línea 29): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `saveCashierSaleContactData` (POST, línea 40): `payload, { headers: NO_CACHE_HEADERS }`.

- `removeCashierSaleContactData` (DELETE, línea 49): `{ headers: NO_CACHE_HEADERS }`.

- `attachCashierSaleCustomer` (POST, línea 57): `payload, { headers: NO_CACHE_HEADERS }`.

- `detachCashierSaleCustomer` (DELETE, línea 66): `{ headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierCustomerPoints.service.js

Fuente: [src/services/staff/casher/cashierCustomerPoints.service.js](../src/services/staff/casher/cashierCustomerPoints.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `searchCashierCustomersDirectory` | `staffApi` | GET | `"/staff/cashier/customers/search"` | 10 |
| `fetchCashierCustomerPointsBalance` | `staffApi` | GET | `/staff/cashier/customers/${customerId}/points-balance` | 21 |
| `fetchCashierCustomerPointsLedger` | `staffApi` | GET | `/staff/cashier/customers/${customerId}/points-ledger` | 32 |
| `fetchCashierCustomerSalesHistory` | `staffApi` | GET | `/staff/cashier/customers/${customerId}/sales-history` | 43 |

### Parámetros de llamada

- `searchCashierCustomersDirectory` (GET, línea 10): `{     params: {       ...params,       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierCustomerPointsBalance` (GET, línea 21): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierCustomerPointsLedger` (GET, línea 32): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierCustomerSalesHistory` (GET, línea 43): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

## services/staff/casher/cashierDirectOrder.service.js

Fuente: [src/services/staff/casher/cashierDirectOrder.service.js](../src/services/staff/casher/cashierDirectOrder.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierDirectMenu` | `staffApi` | GET | `"/staff/cashier/direct-orders/menu"` | 23 |
| `fetchCashierDirectMenuSets` | `staffApi` | GET | `"/staff/cashier/direct-orders/menu-sets"` | 54 |
| `fetchPreparedItems` | `staffApi` | GET | `"/staff/cashier/direct-orders/prepared-items"` | 70 |
| `createCashierDirectOrder` | `staffApi` | POST | `"/staff/cashier/direct-orders"` | 82 |
| `fetchCashierDirectOrder` | `staffApi` | GET | `/staff/cashier/direct-orders/${orderId}` | 95 |
| `appendCashierDirectOrderItems` | `staffApi` | POST | `/staff/cashier/direct-orders/${orderId}/items` | 104 |
| `reviewCashierDirectOrderStock` | `staffApi` | GET | `/staff/cashier/direct-orders/${orderId}/stock-review` | 121 |
| `removeCashierDirectOrderItem` | `staffApi` | DELETE | `/staff/cashier/direct-orders/${orderId}/items/${orderItemId}` | 138 |

### Parámetros de llamada

- `fetchCashierDirectMenu` (GET, línea 23): `{       params,       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierDirectMenuSets` (GET, línea 54): `{     params,     headers: NO_CACHE_HEADERS,   }`.

- `fetchPreparedItems` (GET, línea 70): `{       params,       headers: NO_CACHE_HEADERS,     }`.

- `createCashierDirectOrder` (POST, línea 82): `payload, {     headers: NO_CACHE_HEADERS,     validateStatus: (status) =>       (status >= 200 && status < 300) &#124;&#124; status === 409 &#124;&#124; status === 422,   }`.

- `fetchCashierDirectOrder` (GET, línea 95): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `appendCashierDirectOrderItems` (POST, línea 104): `payload, {       headers: NO_CACHE_HEADERS,       validateStatus: (status) =>         (status >= 200 && status < 300) &#124;&#124; status === 409 &#124;&#124; status === 422,     }`.

- `reviewCashierDirectOrderStock` (GET, línea 121): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,       validateStatus: (status) =>         (status >= 200 && status < 300) &#124;&#124; status === 409 &#124;&#124; status === 422,     }`.

- `removeCashierDirectOrderItem` (DELETE, línea 138): `{       headers: NO_CACHE_HEADERS,       validateStatus: (status) =>         (status >= 200 && status < 300) &#124;&#124; status === 409 &#124;&#124; status === 422,     }`.

## services/staff/casher/cashierDiscount.service.js

Fuente: [src/services/staff/casher/cashierDiscount.service.js](../src/services/staff/casher/cashierDiscount.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierSaleDiscountSummary` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/discounts` | 10 |
| `fetchCashierSaleDiscountAudit` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/discount-audit` | 18 |
| `fetchCashierDiscountAuthorizers` | `staffApi` | GET | `/staff/cashier/discounts/authorizers` | 29 |
| `applyCashierSaleGlobalDiscount` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/discounts/global` | 38 |
| `removeCashierSaleGlobalDiscount` | `staffApi` | DELETE | `/staff/cashier/sales/${saleId}/discounts/global` | 47 |
| `applyCashierSaleItemDiscount` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/discounts/items/${orderItemId}` | 59 |
| `removeCashierSaleItemDiscount` | `staffApi` | DELETE | `/staff/cashier/sales/${saleId}/discounts/items/${orderItemId}` | 68 |

### Parámetros de llamada

- `fetchCashierSaleDiscountSummary` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierSaleDiscountAudit` (GET, línea 18): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierDiscountAuthorizers` (GET, línea 29): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `applyCashierSaleGlobalDiscount` (POST, línea 38): `payload, { headers: NO_CACHE_HEADERS }`.

- `removeCashierSaleGlobalDiscount` (DELETE, línea 47): `{ headers: NO_CACHE_HEADERS }`.

- `applyCashierSaleItemDiscount` (POST, línea 59): `payload, { headers: NO_CACHE_HEADERS }`.

- `removeCashierSaleItemDiscount` (DELETE, línea 68): `{ headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierOperationalAuthorizer.service.js

Fuente: [src/services/staff/casher/cashierOperationalAuthorizer.service.js](../src/services/staff/casher/cashierOperationalAuthorizer.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierOperationalAuthorizers` | `staffApi` | GET | `"/staff/cashier/operational-authorizers"` | 10 |

### Parámetros de llamada

- `fetchCashierOperationalAuthorizers` (GET, línea 10): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

## services/staff/casher/cashierOrderCheck.service.js

Fuente: [src/services/staff/casher/cashierOrderCheck.service.js](../src/services/staff/casher/cashierOrderCheck.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierSaleChecks` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/checks` | 10 |
| `splitCashierCheckByProducts` | `staffApi` | POST | `/staff/cashier/checks/${checkId}/split` | 19 |
| `splitCashierCheckEqualParts` | `staffApi` | POST | `/staff/cashier/checks/${checkId}/split-equal-parts` | 29 |
| `undoCashierCheckEqualParts` | `staffApi` | POST | `/staff/cashier/billing-groups/${groupId}/undo-equal-parts` | 39 |
| `moveCashierCheckItem` | `staffApi` | POST | `/staff/cashier/checks/${checkId}/items/${itemId}/move` | 49 |
| `moveCashierCheckItemQuantity` | `staffApi` | POST | `/staff/cashier/checks/${checkId}/items/${itemId}/move-quantity` | 59 |
| `mergeCashierChecks` | `staffApi` | POST | `/staff/cashier/checks/${sourceCheckId}/merge-into/${targetCheckId}` | 69 |
| `mergeCashierTables` | `staffApi` | POST | `/staff/cashier/tables/${sourceTableId}/merge-into/${targetTableId}` | 79 |
| `reopenCashierCheck` | `staffApi` | POST | `/staff/cashier/checks/${checkId}/reopen` | 89 |

### Parámetros de llamada

- `fetchCashierSaleChecks` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `splitCashierCheckByProducts` (POST, línea 19): `payload, { headers: NO_CACHE_HEADERS }`.

- `splitCashierCheckEqualParts` (POST, línea 29): `payload, { headers: NO_CACHE_HEADERS }`.

- `undoCashierCheckEqualParts` (POST, línea 39): `payload, { headers: NO_CACHE_HEADERS }`.

- `moveCashierCheckItem` (POST, línea 49): `payload, { headers: NO_CACHE_HEADERS }`.

- `moveCashierCheckItemQuantity` (POST, línea 59): `payload, { headers: NO_CACHE_HEADERS }`.

- `mergeCashierChecks` (POST, línea 69): `payload, { headers: NO_CACHE_HEADERS }`.

- `mergeCashierTables` (POST, línea 79): `payload, { headers: NO_CACHE_HEADERS }`.

- `reopenCashierCheck` (POST, línea 89): `payload, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierPayment.service.js

Fuente: [src/services/staff/casher/cashierPayment.service.js](../src/services/staff/casher/cashierPayment.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierPaymentMethods` | `staffApi` | GET | `"/staff/cashier/payment-methods"` | 10 |
| `fetchCashierTaxOptions` | `staffApi` | GET | `"/staff/cashier/consumption-tax-options"` | 18 |
| `previewCashierSalePayment` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/preview-payment` | 26 |
| `payCashierSale` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/pay` | 35 |

### Parámetros de llamada

- `fetchCashierPaymentMethods` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierTaxOptions` (GET, línea 18): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `previewCashierSalePayment` (POST, línea 26): `payload, { headers: NO_CACHE_HEADERS }`.

- `payCashierSale` (POST, línea 35): `payload, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierPrebill.service.js

Fuente: [src/services/staff/casher/cashierPrebill.service.js](../src/services/staff/casher/cashierPrebill.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierPrebill` | `staffApi` | GET | `/staff/cashier/checks/${checkId}/prebill` | 32 |
| `fetchCashierPrebillPdf` | `staffApi` | GET | `/staff/cashier/checks/${checkId}/prebill/pdf` | 44 |
| `fetchCashierPrebillPrintPayload` | `staffApi` | GET | `/staff/cashier/checks/${checkId}/prebill/print-payload` | 67 |
| `sendCashierPrebillWhatsapp` | `staffApi` | POST | `/staff/cashier/checks/${checkId}/prebill/whatsapp` | 79 |

### Parámetros de llamada

- `fetchCashierPrebill` (GET, línea 32): `{       params: buildPrebillParams(taxOptionCode),       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierPrebillPdf` (GET, línea 44): `{       params: buildPrebillParams(taxOptionCode),       headers: NO_CACHE_HEADERS,       responseType: "blob",     }`.

- `fetchCashierPrebillPrintPayload` (GET, línea 67): `{       params: buildPrebillParams(taxOptionCode),       headers: NO_CACHE_HEADERS,     }`.

- `sendCashierPrebillWhatsapp` (POST, línea 79): `{       phone: payload.phone &#124;&#124; null,       save_contact: Boolean(payload.save_contact),       body: payload.body &#124;&#124; null,       tax_option_code: payload.tax_option_code &#124;&#124; null,     }, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierQueue.service.js

Fuente: [src/services/staff/casher/cashierQueue.service.js](../src/services/staff/casher/cashierQueue.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierSaleQueue` | `staffApi` | GET | `"/staff/cashier/sales/queue"` | 10 |
| `takeCashierSale` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/take` | 19 |
| `releaseCashierBillingGroup` | `staffApi` | POST | `/staff/cashier/billing-groups/${groupId}/release` | 29 |
| `fetchCashierSaleDetail` | `staffApi` | GET | `/staff/cashier/sales/${saleId}` | 39 |

### Parámetros de llamada

- `fetchCashierSaleQueue` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `takeCashierSale` (POST, línea 19): `{}, { headers: NO_CACHE_HEADERS }`.

- `releaseCashierBillingGroup` (POST, línea 29): `undefined, { headers: NO_CACHE_HEADERS }`.

- `fetchCashierSaleDetail` (GET, línea 39): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

## services/staff/casher/cashierReadyNotifications.service.js

Fuente: [src/services/staff/casher/cashierReadyNotifications.service.js](../src/services/staff/casher/cashierReadyNotifications.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierReadyNotifications` | `staffApi` | GET | `"/staff/cashier/ready-notifications"` | 10 |
| `markCashierReadyNotificationRead` | `staffApi` | POST | `/staff/cashier/ready-notifications/${notificationId}/read` | 19 |

### Parámetros de llamada

- `fetchCashierReadyNotifications` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `markCashierReadyNotificationRead` (POST, línea 19): `{}, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierRefunds.service.js

Fuente: [src/services/staff/casher/cashierRefunds.service.js](../src/services/staff/casher/cashierRefunds.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierRefundSalesHistory` | `staffApi` | GET | `"/staff/cashier/sales/history"` | 14 |
| `fetchCashierSaleRefundSummary` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/refunds/summary` | 25 |
| `refundCashierSaleFull` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/refunds/full` | 33 |
| `refundCashierSaleAmount` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/refunds/amount` | 42 |
| `refundCashierSaleItems` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/refunds/items` | 51 |

### Parámetros de llamada

- `fetchCashierRefundSalesHistory` (GET, línea 14): `{     params: {       ...params,       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierSaleRefundSummary` (GET, línea 25): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `refundCashierSaleFull` (POST, línea 33): `payload, { headers: NO_CACHE_HEADERS }`.

- `refundCashierSaleAmount` (POST, línea 42): `payload, { headers: NO_CACHE_HEADERS }`.

- `refundCashierSaleItems` (POST, línea 51): `payload, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierSaleCheck.service.js

Fuente: [src/services/staff/casher/cashierSaleCheck.service.js](../src/services/staff/casher/cashierSaleCheck.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierSaleCheckContext` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/checks` | 12 |
| `fetchCashierSaleCheckDetail` | `staffApi` | GET | `/staff/cashier/checks/${checkId}` | 25 |
| `prepareCashierSaleCheckPayment` | `staffApi` | POST | `/staff/cashier/checks/${checkId}/prepare-payment` | 38 |

### Parámetros de llamada

- `fetchCashierSaleCheckContext` (GET, línea 12): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierSaleCheckDetail` (GET, línea 25): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `prepareCashierSaleCheckPayment` (POST, línea 38): `{}, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierSession.service.js

Fuente: [src/services/staff/casher/cashierSession.service.js](../src/services/staff/casher/cashierSession.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierCurrentSession` | `staffApi` | GET | `"/staff/cashier/cash-session/current"` | 10 |
| `fetchCashierRegisters` | `staffApi` | GET | `"/staff/cashier/registers"` | 18 |
| `openCashierSession` | `staffApi` | POST | `"/staff/cashier/cash-session/open"` | 26 |
| `closeCashierSession` | `staffApi` | POST | `"/staff/cashier/cash-session/close"` | 35 |

### Parámetros de llamada

- `fetchCashierCurrentSession` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierRegisters` (GET, línea 18): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `openCashierSession` (POST, línea 26): `payload, { headers: NO_CACHE_HEADERS }`.

- `closeCashierSession` (POST, línea 35): `payload, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/cashierTicket.service.js

Fuente: [src/services/staff/casher/cashierTicket.service.js](../src/services/staff/casher/cashierTicket.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierTicketBySale` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/ticket` | 20 |
| `fetchCashierTicketById` | `staffApi` | GET | `/staff/cashier/tickets/${ticketId}` | 29 |
| `fetchCashierTicketHtml` | `staffApi` | GET | `/staff/cashier/tickets/${ticketId}/html` | 38 |
| `downloadCashierTicketPdf` | `staffApi` | GET | `/staff/cashier/tickets/${ticketId}/download` | 51 |
| `fetchCashierSaleTicketPrintConfig` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/ticket/print-config` | 551 |
| `fetchCashierSaleTicketPrintPayload` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/ticket/print-payload` | 563 |
| `sendCashierSaleTicketWhatsapp` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/ticket/whatsapp` | 576 |

Constantes y constructores locales de referencia:

```js
function createHtmlBlobUrl(html) {
  return URL.createObjectURL(
    new Blob([html], { type: "text/html;charset=utf-8" })
  );
}
function scheduleUrlRevoke(url, delay = 120_000) {
  setTimeout(() => {
    try {
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  }, delay);
}
```

### Parámetros de llamada

- `fetchCashierTicketBySale` (GET, línea 20): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierTicketById` (GET, línea 29): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierTicketHtml` (GET, línea 38): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,     responseType: "blob",   }`.

- `downloadCashierTicketPdf` (GET, línea 51): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,     responseType: "blob",   }`.

- `fetchCashierSaleTicketPrintConfig` (GET, línea 551): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierSaleTicketPrintPayload` (GET, línea 563): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `sendCashierSaleTicketWhatsapp` (POST, línea 576): `{       phone: payload.phone &#124;&#124; null,       save_contact: Boolean(payload.save_contact),       body: payload.body &#124;&#124; null,     }`.

## services/staff/casher/netpayTerminal.service.js

Fuente: [src/services/staff/casher/netpayTerminal.service.js](../src/services/staff/casher/netpayTerminal.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `syncCashierNetpayTerminal` | `staffApi` | POST | `"/staff/cashier/netpay-terminals/sync"` | 6 |

### Parámetros de llamada

- `syncCashierNetpayTerminal` (POST, línea 6): `capabilities`.

## services/staff/casher/netpayTransaction.service.js

Fuente: [src/services/staff/casher/netpayTransaction.service.js](../src/services/staff/casher/netpayTransaction.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `previewNetpayTransaction` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/preview` | 25 |
| `createNetpayTransaction` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions` | 35 |
| `fetchNetpayTransaction` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}` | 48 |
| `fetchUnresolvedNetpayTransaction` | `staffApi` | GET | `/staff/cashier/sales/${saleId}/netpay-transactions/unresolved` | 60 |
| `storeNetpaySaleResult` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/sale-result` | 76 |
| `requestNetpayRecovery` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/recovery` | 89 |
| `storeNetpayRecoveryResult` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/recovery-result` | 103 |
| `finalizeApprovedNetpayTransaction` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/finalize-approved` | 116 |
| `requestNetpayCancellation` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/cancellation` | 130 |
| `storeNetpayCancellationResult` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/cancellation-result` | 144 |
| `finalizeNetpayCancellation` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/finalize-cancellation` | 157 |
| `requestNetpayVoucherReprint` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/voucher-reprint` | 171 |
| `storeNetpayVoucherReprintResult` | `staffApi` | POST | `/staff/cashier/sales/${saleId}/netpay-transactions/${netpayTransactionId}/voucher-reprint-result` | 185 |

### Parámetros de llamada

- `previewNetpayTransaction` (POST, línea 25): `payload, { headers: NO_CACHE_HEADERS }`.

- `createNetpayTransaction` (POST, línea 35): `payload, { headers: NO_CACHE_HEADERS }`.

- `fetchNetpayTransaction` (GET, línea 48): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `fetchUnresolvedNetpayTransaction` (GET, línea 60): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `storeNetpaySaleResult` (POST, línea 76): `payload, { headers: NO_CACHE_HEADERS }`.

- `requestNetpayRecovery` (POST, línea 89): `{}, { headers: NO_CACHE_HEADERS }`.

- `storeNetpayRecoveryResult` (POST, línea 103): `payload, { headers: NO_CACHE_HEADERS }`.

- `finalizeApprovedNetpayTransaction` (POST, línea 116): `{}, { headers: NO_CACHE_HEADERS }`.

- `requestNetpayCancellation` (POST, línea 130): `payload, { headers: NO_CACHE_HEADERS }`.

- `storeNetpayCancellationResult` (POST, línea 144): `payload, { headers: NO_CACHE_HEADERS }`.

- `finalizeNetpayCancellation` (POST, línea 157): `{}, { headers: NO_CACHE_HEADERS }`.

- `requestNetpayVoucherReprint` (POST, línea 171): `payload, { headers: NO_CACHE_HEADERS }`.

- `storeNetpayVoucherReprintResult` (POST, línea 185): `payload, { headers: NO_CACHE_HEADERS }`.

## services/staff/casher/onlineOrders/cashierOnlineOrders.service.js

Fuente: [src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js](../src/services/staff/casher/onlineOrders/cashierOnlineOrders.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchCashierOnlineOrders` | `staffApi` | GET | `"/staff/cashier/online-orders"` | 10 |
| `fetchCashierOnlineOrderDetail` | `staffApi` | GET | `/staff/cashier/online-orders/${onlineOrderId}` | 19 |
| `fetchCashierOnlineOrderDeliveryPrintConfig` | `staffApi` | GET | `/staff/cashier/online-orders/${onlineOrderId}/delivery-print/config` | 31 |
| `fetchCashierOnlineOrderDeliveryPrintPayload` | `staffApi` | GET | `/staff/cashier/online-orders/${onlineOrderId}/delivery-print/payload` | 46 |
| `fetchCashierOnlineOrderNewNotifications` | `staffApi` | GET | `"/staff/cashier/online-order-new-notifications"` | 58 |
| `markCashierOnlineOrderNewNotificationRead` | `staffApi` | POST | `/staff/cashier/online-order-new-notifications/${notificationId}/read` | 67 |
| `acceptCashierOnlineOrder` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/accept` | 77 |
| `rejectCashierOnlineOrder` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/reject` | 87 |
| `cancelCashierOnlineOrder` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/cancel` | 110 |
| `takeCashierOnlineOrder` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/take` | 120 |
| `releaseCashierOnlineOrder` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/release` | 130 |
| `confirmCashierOnlineOrderPreparation` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/confirm-preparation` | 140 |
| `startCashierOnlineOrderPreparation` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/start-preparation` | 150 |
| `markCashierOnlineOrderReady` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/mark-ready` | 160 |
| `markCashierOnlineOrderOutForDelivery` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/out-for-delivery` | 170 |
| `markCashierOnlineOrderArrivedAtDestination` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/arrived-at-destination` | 180 |
| `deliverCashierOnlineOrder` | `staffApi` | POST | `/staff/cashier/online-orders/${onlineOrderId}/deliver` | 190 |

### Parámetros de llamada

- `fetchCashierOnlineOrders` (GET, línea 10): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierOnlineOrderDetail` (GET, línea 19): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCashierOnlineOrderDeliveryPrintConfig` (GET, línea 31): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierOnlineOrderDeliveryPrintPayload` (GET, línea 46): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `fetchCashierOnlineOrderNewNotifications` (GET, línea 58): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `markCashierOnlineOrderNewNotificationRead` (POST, línea 67): `{}, { headers: NO_CACHE_HEADERS }`.

- `acceptCashierOnlineOrder` (POST, línea 77): `{}, { headers: NO_CACHE_HEADERS }`.

- `rejectCashierOnlineOrder` (POST, línea 87): `{ reason }, { headers: NO_CACHE_HEADERS }`.

- `cancelCashierOnlineOrder` (POST, línea 110): `body, { headers: NO_CACHE_HEADERS }`.

- `takeCashierOnlineOrder` (POST, línea 120): `{}, { headers: NO_CACHE_HEADERS }`.

- `releaseCashierOnlineOrder` (POST, línea 130): `{}, { headers: NO_CACHE_HEADERS }`.

- `confirmCashierOnlineOrderPreparation` (POST, línea 140): `{}, { headers: NO_CACHE_HEADERS }`.

- `startCashierOnlineOrderPreparation` (POST, línea 150): `{}, { headers: NO_CACHE_HEADERS }`.

- `markCashierOnlineOrderReady` (POST, línea 160): `{}, { headers: NO_CACHE_HEADERS }`.

- `markCashierOnlineOrderOutForDelivery` (POST, línea 170): `{}, { headers: NO_CACHE_HEADERS }`.

- `markCashierOnlineOrderArrivedAtDestination` (POST, línea 180): `{}, { headers: NO_CACHE_HEADERS }`.

- `deliverCashierOnlineOrder` (POST, línea 190): `{}, { headers: NO_CACHE_HEADERS }`.

## services/staff/cashRegisters.service.js

Fuente: [src/services/staff/cashRegisters.service.js](../src/services/staff/cashRegisters.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getCashRegistersOverview` | `api` | GET | `buildBase(restaurantId)` | 41 |
| `createCashRegister` | `api` | POST | `buildBase(restaurantId)` | 62 |
| `updateCashRegister` | `api` | PUT | `${buildBase(restaurantId)}/${cashRegisterId}` | 75 |
| `deleteCashRegister` | `api` | DELETE | `${buildBase(restaurantId)}/${cashRegisterId}` | 87 |
| `getRestaurantPlanAccess` | `api` | GET | `/restaurants/${restaurantId}/plan-access` | 97 |

Constantes y constructores locales de referencia:

```js
buildBase = (restaurantId) =>
  `/restaurants/${restaurantId}/cash-registers`
normalizeCashRegistersResponse = (payload) => {
  return {
    ok: payload?.ok === true,

    meta:
      payload?.meta &&
      typeof payload.meta === "object" &&
      !Array.isArray(payload.meta)
        ? payload.meta
        : {},

    warehouse_options_by_branch: Array.isArray(
      payload?.warehouse_options_by_branch
    )
      ? payload.warehouse_options_by_branch
      : [],

    data: Array.isArray(payload?.data)
      ? payload.data
      : [],
  };
}
```

### Parámetros de llamada

- `getCashRegistersOverview` (GET, línea 41): sin cuerpo ni opciones explícitos.

- `createCashRegister` (POST, línea 62): `payload`.

- `updateCashRegister` (PUT, línea 75): `payload`.

- `deleteCashRegister` (DELETE, línea 87): sin cuerpo ni opciones explícitos.

- `getRestaurantPlanAccess` (GET, línea 97): sin cuerpo ni opciones explícitos.

## services/staff/kitchen/kitchenKds.service.js

Fuente: [src/services/staff/kitchen/kitchenKds.service.js](../src/services/staff/kitchen/kitchenKds.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchKitchenKdsOrders` | `staffApi` | GET | `/staff/kitchen/kds/orders` | 18 |
| `startKitchenItem` | `staffApi` | POST | `/staff/kitchen/kds/order-items/${itemId}/start` | 30 |
| `readyKitchenItem` | `staffApi` | POST | `/staff/kitchen/kds/order-items/${itemId}/ready` | 47 |
| `notifyKitchenOrderReady` | `staffApi` | POST | `/staff/kitchen/kds/orders/${orderId}/notify-ready` | 56 |

### Parámetros de llamada

- `fetchKitchenKdsOrders` (GET, línea 18): `{     params: {       ...params,       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `startKitchenItem` (POST, línea 30): `payload, {       headers: NO_CACHE_HEADERS,       validateStatus: (status) =>         (status >= 200 && status < 300) &#124;&#124; status === 409 &#124;&#124; status === 422,     }`.

- `readyKitchenItem` (POST, línea 47): `{}, { headers: NO_CACHE_HEADERS }`.

- `notifyKitchenOrderReady` (POST, línea 56): `{}, { headers: NO_CACHE_HEADERS }`.

## services/staff/kitchen/kitchenPreparedItems.service.js

Fuente: [src/services/staff/kitchen/kitchenPreparedItems.service.js](../src/services/staff/kitchen/kitchenPreparedItems.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `finishKitchenPreparedItem` | `staffApi` | POST | `/staff/kitchen/prepared-items/${preparedItemId}/finish` | 10 |
| `confirmKitchenPreparedItemReturn` | `staffApi` | POST | `/staff/kitchen/prepared-items/${preparedItemId}/confirm-return` | 20 |
| `markKitchenPreparedItemUnfit` | `staffApi` | POST | `/staff/kitchen/prepared-items/${preparedItemId}/mark-unfit` | 32 |
| `retireExpiredKitchenPreparedItem` | `staffApi` | POST | `/staff/kitchen/prepared-items/${preparedItemId}/retire-expired` | 42 |

### Parámetros de llamada

- `finishKitchenPreparedItem` (POST, línea 10): `{}, { headers: NO_CACHE_HEADERS }`.

- `confirmKitchenPreparedItemReturn` (POST, línea 20): `{}, { headers: NO_CACHE_HEADERS }`.

- `markKitchenPreparedItemUnfit` (POST, línea 32): `{ note: normalizedNote &#124;&#124; null }, { headers: NO_CACHE_HEADERS }`.

- `retireExpiredKitchenPreparedItem` (POST, línea 42): `{}, { headers: NO_CACHE_HEADERS }`.

## services/staff/roles.service.js

Fuente: [src/services/staff/roles.service.js](../src/services/staff/roles.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getRoles` | `api` | GET | `"/roles"` | 10 |

### Parámetros de llamada

- `getRoles` (GET, línea 10): `{     params: {       ...(scope ? { scope } : {}),       ...(q ? { q } : {}),     },   }`.

## services/staff/staff.service.js

Fuente: [src/services/staff/staff.service.js](../src/services/staff/staff.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getStaff` | `api` | GET | `/restaurants/${restaurantId}/staff` | 4 |
| `createStaff` | `api` | POST | `/restaurants/${restaurantId}/staff` | 9 |
| `updateStaff` | `api` | PUT | `/restaurants/${restaurantId}/staff/${userId}` | 14 |
| `deleteStaff` | `api` | DELETE | `/restaurants/${restaurantId}/staff/${userId}` | 19 |

### Parámetros de llamada

- `getStaff` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `createStaff` (POST, línea 9): `payload`.

- `updateStaff` (PUT, línea 14): `payload`.

- `deleteStaff` (DELETE, línea 19): sin cuerpo ni opciones explícitos.

## services/staff/staffAssignments.service.js

Fuente: [src/services/staff/staffAssignments.service.js](../src/services/staff/staffAssignments.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getAssignments` | `api` | GET | `/restaurants/${restaurantId}/staff/${userId}/assignments` | 4 |
| `createAssignment` | `api` | POST | `/restaurants/${restaurantId}/staff/${userId}/assignments` | 9 |
| `updateAssignment` | `api` | PUT | `/restaurants/${restaurantId}/staff/${userId}/assignments/${assignmentId}` | 14 |
| `deleteAssignment` | `api` | DELETE | `/restaurants/${restaurantId}/staff/${userId}/assignments/${assignmentId}` | 22 |

### Parámetros de llamada

- `getAssignments` (GET, línea 4): sin cuerpo ni opciones explícitos.

- `createAssignment` (POST, línea 9): `payload`.

- `updateAssignment` (PUT, línea 14): `payload`.

- `deleteAssignment` (DELETE, línea 22): sin cuerpo ni opciones explícitos.

## services/staff/staffAuth.service.js

Fuente: [src/services/staff/staffAuth.service.js](../src/services/staff/staffAuth.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `staffLogin` | `staffApi` | POST | `"/staff/login"` | 15 |
| `staffSelectContext` | `staffApi` | POST | `"/staff/select-context"` | 40 |
| `staffContext` | `staffApi` | GET | `"/staff/context"` | 54 |
| `staffExitContext` | `staffApi` | POST | `"/staff/exit-context"` | 63 |
| `staffLogout` | `staffApi` | POST | `"/staff/logout"` | 73 |

### Parámetros de llamada

- `staffLogin` (POST, línea 15): `payload`.

- `staffSelectContext` (POST, línea 40): `payload`.

- `staffContext` (GET, línea 54): sin cuerpo ni opciones explícitos.

- `staffExitContext` (POST, línea 63): sin cuerpo ni opciones explícitos.

- `staffLogout` (POST, línea 73): sin cuerpo ni opciones explícitos.

## services/staff/waiter/staffOrders.service.js

Fuente: [src/services/staff/waiter/staffOrders.service.js](../src/services/staff/waiter/staffOrders.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchStaffWaiterMenu` | `staffApi` | GET | `"/staff/waiter/menu"` | 38 |
| `fetchStaffWaiterMenuSets` | `staffApi` | GET | `"/staff/waiter/menu-sets"` | 56 |
| `fetchPreparedItems` | `staffApi` | GET | `"/staff/waiter/prepared-items"` | 70 |
| `occupyTable` | `staffApi` | POST | `/staff/waiter/tables/${tableId}/occupy` | 79 |
| `freeTable` | `staffApi` | POST | `/staff/waiter/tables/${tableId}/free` | 88 |
| `createWaiterOrder` | `staffApi` | POST | `/staff/waiter/tables/${tableId}/orders` | 98 |
| `getCurrentTableOrder` | `staffApi` | GET | `/staff/waiter/tables/${tableId}/orders/current` | 115 |
| `getTableOrderHistory` | `staffApi` | GET | `/staff/waiter/tables/${tableId}/orders/history` | 123 |
| `appendWaiterOrderItems` | `staffApi` | POST | `/staff/waiter/orders/${orderId}/append-items` | 132 |
| `getOrderById` | `staffApi` | GET | `/staff/waiter/orders/${orderId}` | 144 |
| `fetchPendingCancellationRequests` | `staffApi` | GET | `"/staff/waiter/cancellation-requests/pending"` | 153 |
| `fetchCancellationContext` | `staffApi` | GET | `/staff/waiter/orders/${normalizedOrderId}/cancellation-context` | 164 |
| `resolveCancellationRequest` | `staffApi` | POST | `/staff/waiter/cancellation-requests/${normalizedCancellationId}/resolve` | 181 |
| `cancelOrderItems` | `staffApi` | POST | `/staff/waiter/orders/${normalizedOrderId}/cancellations` | 193 |

### Parámetros de llamada

- `fetchStaffWaiterMenu` (GET, línea 38): `{     params,     headers: NO_CACHE_HEADERS,   }`.

- `fetchStaffWaiterMenuSets` (GET, línea 56): `{     params,     headers: NO_CACHE_HEADERS,   }`.

- `fetchPreparedItems` (GET, línea 70): `{     params,     headers: NO_CACHE_HEADERS,   }`.

- `occupyTable` (POST, línea 79): `payload, { headers: NO_CACHE_HEADERS }`.

- `freeTable` (POST, línea 88): `{}, { headers: NO_CACHE_HEADERS }`.

- `createWaiterOrder` (POST, línea 98): `payload, {       headers: NO_CACHE_HEADERS,       validateStatus: (status) =>         (status >= 200 && status < 300) &#124;&#124; status === 409 &#124;&#124; status === 422,     }`.

- `getCurrentTableOrder` (GET, línea 115): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getTableOrderHistory` (GET, línea 123): `{     params: { limit, _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `appendWaiterOrderItems` (POST, línea 132): `payload, { headers: NO_CACHE_HEADERS }`.

- `getOrderById` (GET, línea 144): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchPendingCancellationRequests` (GET, línea 153): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `fetchCancellationContext` (GET, línea 164): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `resolveCancellationRequest` (POST, línea 181): `payload, { headers: NO_CACHE_HEADERS }`.

- `cancelOrderItems` (POST, línea 193): `payload, { headers: NO_CACHE_HEADERS }`.

## services/staff/waiter/tableSessionRequests.service.js

Fuente: [src/services/staff/waiter/tableSessionRequests.service.js](../src/services/staff/waiter/tableSessionRequests.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchTableSessionRequests` | `staffApi` | GET | `"/staff/waiter/table-session-requests"` | 5 |
| `approveTableSessionRequest` | `staffApi` | POST | `/staff/waiter/table-session-requests/${reqId}/approve` | 10 |
| `rejectTableSessionRequest` | `staffApi` | DELETE | `/staff/waiter/table-session-requests/${reqId}` | 16 |

### Parámetros de llamada

- `fetchTableSessionRequests` (GET, línea 5): sin cuerpo ni opciones explícitos.

- `approveTableSessionRequest` (POST, línea 10): sin cuerpo ni opciones explícitos.

- `rejectTableSessionRequest` (DELETE, línea 16): sin cuerpo ni opciones explícitos.

## services/staff/waiter/waiterTables.service.js

Fuente: [src/services/staff/waiter/waiterTables.service.js](../src/services/staff/waiter/waiterTables.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `fetchStaffTablesGrid` | `staffApi` | GET | `"/staff/waiter/tables/grid"` | 11 |
| `attendTable` | `staffApi` | POST | `/staff/waiter/tables/${tableId}/attend` | 19 |
| `rejectTableCall` | `staffApi` | POST | `/staff/waiter/tables/${tableId}/reject-call` | 28 |
| `finishAttention` | `staffApi` | POST | `/staff/waiter/tables/${tableId}/finish-attention` | 37 |
| `releaseTableSession` | `staffApi` | POST | `/staff/waiter/tables/${tableId}/release-session` | 46 |
| `acceptCustomerOrder` | `staffApi` | POST | `/staff/waiter/orders/${orderId}/accept` | 58 |
| `rejectCustomerOrder` | `staffApi` | POST | `/staff/waiter/orders/${orderId}/reject` | 75 |
| `fetchWaiterReadyNotifications` | `staffApi` | GET | `/staff/waiter/ready-notifications` | 85 |
| `markWaiterReadyNotificationRead` | `staffApi` | POST | `/staff/waiter/ready-notifications/${notificationId}/read` | 93 |
| `fetchWaiterBillRequests` | `staffApi` | GET | `/staff/waiter/bill-requests` | 105 |
| `markWaiterBillRequestRead` | `staffApi` | POST | `/staff/waiter/bill-requests/${billRequestId}/read` | 113 |
| `startWaiterOrderPayment` | `staffApi` | POST | `/staff/waiter/orders/${orderId}/start-payment` | 122 |

### Parámetros de llamada

- `fetchStaffTablesGrid` (GET, línea 11): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `attendTable` (POST, línea 19): `{}, { headers: NO_CACHE_HEADERS }`.

- `rejectTableCall` (POST, línea 28): `{}, { headers: NO_CACHE_HEADERS }`.

- `finishAttention` (POST, línea 37): `{}, { headers: NO_CACHE_HEADERS }`.

- `releaseTableSession` (POST, línea 46): `{}, { headers: NO_CACHE_HEADERS }`.

- `acceptCustomerOrder` (POST, línea 58): `body, {       headers: NO_CACHE_HEADERS,       validateStatus: (status) =>         (status >= 200 && status < 300) &#124;&#124; status === 409 &#124;&#124; status === 422,     }`.

- `rejectCustomerOrder` (POST, línea 75): `{}, { headers: NO_CACHE_HEADERS }`.

- `fetchWaiterReadyNotifications` (GET, línea 85): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `markWaiterReadyNotificationRead` (POST, línea 93): `{}, { headers: NO_CACHE_HEADERS }`.

- `fetchWaiterBillRequests` (GET, línea 105): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `markWaiterBillRequestRead` (POST, línea 113): `{}, { headers: NO_CACHE_HEADERS }`.

- `startWaiterOrderPayment` (POST, línea 122): `{}, { headers: NO_CACHE_HEADERS }`.

## services/system-admin/billing/platformBilling.service.js

Fuente: [src/services/system-admin/billing/platformBilling.service.js](../src/services/system-admin/billing/platformBilling.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemPlatformPurchases` | `systemAdminApi` | GET | `"/system-admin/platform-purchases"` | 15 |
| `createSystemPlatformInvoice` | `systemAdminApi` | POST | `"/system-admin/platform-invoices"` | 24 |
| `getSystemPlatformInvoices` | `systemAdminApi` | GET | `"/system-admin/platform-invoices"` | 34 |
| `getSystemPlatformInvoice` | `systemAdminApi` | GET | `/system-admin/platform-invoices/${invoiceId}` | 43 |
| `retrySystemPlatformInvoice` | `systemAdminApi` | POST | `/system-admin/platform-invoices/${invoiceId}/retry` | 55 |
| `downloadInvoiceDocument` | `systemAdminApi` | GET | `url` | 79 |

### Parámetros de llamada

- `getSystemPlatformPurchases` (GET, línea 15): `{     params: { ...params, _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `createSystemPlatformInvoice` (POST, línea 24): `payload, { headers: NO_CACHE_HEADERS }`.

- `getSystemPlatformInvoices` (GET, línea 34): `{     params: { ...params, _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getSystemPlatformInvoice` (GET, línea 43): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `retrySystemPlatformInvoice` (POST, línea 55): `{}, { headers: NO_CACHE_HEADERS }`.

- `downloadInvoiceDocument` (GET, línea 79): `{     responseType: "blob",     headers: NO_CACHE_HEADERS,   }`.

## services/system-admin/systemAddonSales.service.js

Fuente: [src/services/system-admin/systemAddonSales.service.js](../src/services/system-admin/systemAddonSales.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemAddonSalesMonthly` | `systemAdminApi` | GET | `${salesBase}/monthly` | 12 |
| `getSystemAddonSalesSummary` | `systemAdminApi` | GET | `${salesBase}/summary` | 21 |
| `getSystemAddonSalesCatalog` | `systemAdminApi` | GET | `"/system-admin/addons"` | 30 |

Constantes y constructores locales de referencia:

```js
salesBase = "/system-admin/addon-sales"
```

### Parámetros de llamada

- `getSystemAddonSalesMonthly` (GET, línea 12): `{     params: { ...params, _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getSystemAddonSalesSummary` (GET, línea 21): `{     params: { ...params, _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getSystemAddonSalesCatalog` (GET, línea 30): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

## services/system-admin/systemAdminAuth.service.js

Fuente: [src/services/system-admin/systemAdminAuth.service.js](../src/services/system-admin/systemAdminAuth.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `systemAdminLogin` | `systemAdminApi` | POST | `"/system-admin/login"` | 6 |
| `systemAdminMe` | `systemAdminApi` | GET | `"/system-admin/me"` | 31 |
| `systemAdminLogout` | `systemAdminApi` | POST | `"/system-admin/logout"` | 41 |

### Parámetros de llamada

- `systemAdminLogin` (POST, línea 6): `payload`.

- `systemAdminMe` (GET, línea 31): sin cuerpo ni opciones explícitos.

- `systemAdminLogout` (POST, línea 41): sin cuerpo ni opciones explícitos.

## services/system-admin/systemOwnerRestaurantAddons.service.js

Fuente: [src/services/system-admin/systemOwnerRestaurantAddons.service.js](../src/services/system-admin/systemOwnerRestaurantAddons.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemAddons` | `systemAdminApi` | GET | `"/system-admin/addons"` | 13 |
| `getSystemOwnerRestaurantAddons` | `systemAdminApi` | GET | `${restaurantBase(ownerId, restaurantId)}/addons` | 22 |
| `assignSystemOwnerRestaurantAddon` | `systemAdminApi` | POST | `${restaurantBase(ownerId, restaurantId)}/addons/${addonId}` | 34 |

Constantes y constructores locales de referencia:

```js
restaurantBase = (ownerId, restaurantId) =>
  `/system-admin/owners/${ownerId}/restaurants/${restaurantId}`
```

### Parámetros de llamada

- `getSystemAddons` (GET, línea 13): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

- `getSystemOwnerRestaurantAddons` (GET, línea 22): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `assignSystemOwnerRestaurantAddon` (POST, línea 34): `payload, { headers: NO_CACHE_HEADERS }`.

## services/system-admin/systemOwnerRestaurantBranches.service.js

Fuente: [src/services/system-admin/systemOwnerRestaurantBranches.service.js](../src/services/system-admin/systemOwnerRestaurantBranches.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemOwnerRestaurantBranches` | `systemAdminApi` | GET | `base(ownerId, restaurantId)` | 13 |
| `getSystemOwnerRestaurantBranch` | `systemAdminApi` | GET | `${base(ownerId, restaurantId)}/${branchId}` | 25 |
| `createSystemOwnerRestaurantBranch` | `systemAdminApi` | POST | `base(ownerId, restaurantId)` | 37 |
| `updateSystemOwnerRestaurantBranch` | `systemAdminApi` | PUT | `${base(ownerId, restaurantId)}/${branchId}` | 45 |
| `dryRunDeleteSystemOwnerRestaurantBranch` | `systemAdminApi` | POST | `${base(ownerId, restaurantId)}/${branchId}/hard-delete-dry-run` | 59 |
| `deleteSystemOwnerRestaurantBranch` | `systemAdminApi` | DELETE | `${base(ownerId, restaurantId)}/${branchId}` | 69 |
| `getSystemOwnerRestaurantBranchLogo` | `systemAdminApi` | GET | `${base(ownerId, restaurantId)}/${branchId}/logo` | 78 |
| `uploadSystemOwnerRestaurantBranchLogo` | `systemAdminApi` | POST | `${base(ownerId, restaurantId)}/${branchId}/logo` | 98 |
| `deleteSystemOwnerRestaurantBranchActiveLogo` | `systemAdminApi` | DELETE | `${base(ownerId, restaurantId)}/${branchId}/logo` | 117 |

Constantes y constructores locales de referencia:

```js
base = (ownerId, restaurantId) =>
  `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/branches`
```

### Parámetros de llamada

- `getSystemOwnerRestaurantBranches` (GET, línea 13): `{     params: {       ...params,       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `getSystemOwnerRestaurantBranch` (GET, línea 25): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `createSystemOwnerRestaurantBranch` (POST, línea 37): `payload, {     headers: NO_CACHE_HEADERS,   }`.

- `updateSystemOwnerRestaurantBranch` (PUT, línea 45): `payload, { headers: NO_CACHE_HEADERS }`.

- `dryRunDeleteSystemOwnerRestaurantBranch` (POST, línea 59): `{}, { headers: NO_CACHE_HEADERS }`.

- `deleteSystemOwnerRestaurantBranch` (DELETE, línea 69): `{ headers: NO_CACHE_HEADERS }`.

- `getSystemOwnerRestaurantBranchLogo` (GET, línea 78): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `uploadSystemOwnerRestaurantBranchLogo` (POST, línea 98): `formData, {       headers: {         ...NO_CACHE_HEADERS,         "Content-Type": "multipart/form-data",       },     }`.

- `deleteSystemOwnerRestaurantBranchActiveLogo` (DELETE, línea 117): `{ headers: NO_CACHE_HEADERS }`.

## services/system-admin/systemOwnerRestaurants.service.js

Fuente: [src/services/system-admin/systemOwnerRestaurants.service.js](../src/services/system-admin/systemOwnerRestaurants.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemOwnerRestaurants` | `systemAdminApi` | GET | `/system-admin/owners/${ownerId}/restaurants` | 10 |
| `getSystemOwnerRestaurant` | `systemAdminApi` | GET | `/system-admin/owners/${ownerId}/restaurants/${restaurantId}` | 26 |
| `createSystemOwnerRestaurant` | `systemAdminApi` | POST | `/system-admin/owners/${ownerId}/restaurants` | 38 |
| `updateSystemOwnerRestaurant` | `systemAdminApi` | PUT | `/system-admin/owners/${ownerId}/restaurants/${restaurantId}` | 48 |
| `dryRunDeleteSystemOwnerRestaurant` | `systemAdminApi` | POST | `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/hard-delete-dry-run` | 58 |
| `deleteSystemOwnerRestaurant` | `systemAdminApi` | DELETE | `/system-admin/owners/${ownerId}/restaurants/${restaurantId}` | 68 |

### Parámetros de llamada

- `getSystemOwnerRestaurants` (GET, línea 10): `{       params: {         per_page: 5,         ...params,         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

- `getSystemOwnerRestaurant` (GET, línea 26): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `createSystemOwnerRestaurant` (POST, línea 38): `payload, { headers: NO_CACHE_HEADERS }`.

- `updateSystemOwnerRestaurant` (PUT, línea 48): `payload, { headers: NO_CACHE_HEADERS }`.

- `dryRunDeleteSystemOwnerRestaurant` (POST, línea 58): `{}, { headers: NO_CACHE_HEADERS }`.

- `deleteSystemOwnerRestaurant` (DELETE, línea 68): `{ headers: NO_CACHE_HEADERS }`.

## services/system-admin/systemOwnerRestaurantSubscriptions.service.js

Fuente: [src/services/system-admin/systemOwnerRestaurantSubscriptions.service.js](../src/services/system-admin/systemOwnerRestaurantSubscriptions.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemRestaurantSubscriptions` | `systemAdminApi` | GET | `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/subscriptions` | 10 |
| `getSystemRestaurantCurrentSubscription` | `systemAdminApi` | GET | `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/current` | 22 |
| `createSystemRestaurantSubscription` | `systemAdminApi` | POST | `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/subscriptions` | 34 |
| `expireSystemRestaurantCurrentSubscription` | `systemAdminApi` | POST | `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/subscriptions/current/expire` | 44 |
| `getSystemPlans` | `systemAdminApi` | GET | `"/plans"` | 54 |

### Parámetros de llamada

- `getSystemRestaurantSubscriptions` (GET, línea 10): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `getSystemRestaurantCurrentSubscription` (GET, línea 22): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `createSystemRestaurantSubscription` (POST, línea 34): `payload, { headers: NO_CACHE_HEADERS }`.

- `expireSystemRestaurantCurrentSubscription` (POST, línea 44): `{}, { headers: NO_CACHE_HEADERS }`.

- `getSystemPlans` (GET, línea 54): `{     params: { _t: Date.now() },     headers: NO_CACHE_HEADERS,   }`.

## services/system-admin/systemOwners.service.js

Fuente: [src/services/system-admin/systemOwners.service.js](../src/services/system-admin/systemOwners.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemOwners` | `systemAdminApi` | GET | `"/system-admin/owners"` | 10 |
| `createSystemOwner` | `systemAdminApi` | POST | `"/system-admin/owners"` | 23 |
| `updateSystemOwner` | `systemAdminApi` | PUT | `/system-admin/owners/${ownerId}` | 31 |
| `dryRunDeleteSystemOwner` | `systemAdminApi` | POST | `/system-admin/owners/${ownerId}/hard-delete-dry-run` | 41 |
| `deleteSystemOwner` | `systemAdminApi` | DELETE | `/system-admin/owners/${ownerId}` | 53 |

### Parámetros de llamada

- `getSystemOwners` (GET, línea 10): `{     params: {       per_page: 5,       ...params,       _t: Date.now(),     },     headers: NO_CACHE_HEADERS,   }`.

- `createSystemOwner` (POST, línea 23): `payload, {     headers: NO_CACHE_HEADERS,   }`.

- `updateSystemOwner` (PUT, línea 31): `payload, { headers: NO_CACHE_HEADERS }`.

- `dryRunDeleteSystemOwner` (POST, línea 41): `{}, {       headers: NO_CACHE_HEADERS,     }`.

- `deleteSystemOwner` (DELETE, línea 53): `{       headers: NO_CACHE_HEADERS,     }`.

## services/system-admin/systemOwnerTaxProfile.service.js

Fuente: [src/services/system-admin/systemOwnerTaxProfile.service.js](../src/services/system-admin/systemOwnerTaxProfile.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemOwnerTaxProfile` | `systemAdminApi` | GET | `/system-admin/owners/${ownerId}/tax-profile` | 10 |
| `updateSystemOwnerTaxProfile` | `systemAdminApi` | PUT | `/system-admin/owners/${ownerId}/tax-profile` | 22 |

### Parámetros de llamada

- `getSystemOwnerTaxProfile` (GET, línea 10): `{       params: { _t: Date.now() },       headers: NO_CACHE_HEADERS,     }`.

- `updateSystemOwnerTaxProfile` (PUT, línea 22): `payload, { headers: NO_CACHE_HEADERS }`.

## services/system-admin/systemSubscriptionSales.service.js

Fuente: [src/services/system-admin/systemSubscriptionSales.service.js](../src/services/system-admin/systemSubscriptionSales.service.js).

| Función | Cliente | Método | Ruta o expresión | Línea |
| --- | --- | --- | --- | --- |
| `getSystemSubscriptionSalesMonthly` | `systemAdminApi` | GET | `"/system-admin/subscription-sales/monthly"` | 10 |
| `getSystemSubscriptionSalesSummary` | `systemAdminApi` | GET | `"/system-admin/subscription-sales/summary"` | 26 |

### Parámetros de llamada

- `getSystemSubscriptionSalesMonthly` (GET, línea 10): `{       params: {         per_page: 5,         ...params,         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.

- `getSystemSubscriptionSalesSummary` (GET, línea 26): `{       params: {         ...params,         _t: Date.now(),       },       headers: NO_CACHE_HEADERS,     }`.


## Constructores adicionales y descargas indirectas

Los siguientes extractos completan las rutas que se calculan mediante helpers o se pasan a una función genérica GET. Se conserva la construcción real, incluidos parámetros de formato y filtros; no se evalúan valores de sesión.

### src/services/menu/menuSets/menuSetImport.service.js

[Fuente](../src/services/menu/menuSets/menuSetImport.service.js)

```js
async function downloadMenuSetImportTemplate(
  restaurantId, branchId, menuSetId, format = "xlsx", targetWeekStart = null
) {
  const params = { format };

  if (targetWeekStart) {
    params.target_week_start = targetWeekStart;
  }

  const extension = format === "csv" ? "csv" : "xlsx";

  return downloadFile(
    `${importUrl(restaurantId, branchId, menuSetId)}/template`,
    params,
    `plantilla_conjunto_${menuSetId}.${extension}`
  );
}

async function downloadMenuSetCurrentConfiguration(
  restaurantId, branchId, menuSetId, format = "xlsx", serviceDate = null
) {
  const params = { format };

  if (serviceDate) {
    params.service_date = serviceDate;
  }

  return downloadFile(
    `${importUrl(restaurantId, branchId, menuSetId)}/current`,
    params,
    `configuracion_conjunto_${menuSetId}.${format}`
  );
}
```

### src/services/staff/cashRegisters.service.js

[Fuente](../src/services/staff/cashRegisters.service.js)

```js
buildBase = (restaurantId) =>
  `/restaurants/${restaurantId}/cash-registers`
```

### src/services/system-admin/billing/platformBilling.service.js

[Fuente](../src/services/system-admin/billing/platformBilling.service.js)

```js
async function downloadSystemPlatformInvoicePdf(invoiceId) {
  return downloadInvoiceDocument(
    `/system-admin/platform-invoices/${invoiceId}/pdf/download`,
    `factura_${invoiceId}.pdf`
  );
}

async function downloadSystemPlatformInvoiceXml(invoiceId) {
  return downloadInvoiceDocument(
    `/system-admin/platform-invoices/${invoiceId}/xml/download`,
    `factura_${invoiceId}.xml`
  );
}
```

### src/services/system-admin/systemOwnerRestaurantBranches.service.js

[Fuente](../src/services/system-admin/systemOwnerRestaurantBranches.service.js)

```js
base = (ownerId, restaurantId) =>
  `/system-admin/owners/${ownerId}/restaurants/${restaurantId}/branches`
```

## HTTP fuera del runtime src

El conteo de 605 sitios corresponde solo a src. El prerender editorial y PHP también consultan el API editorial. No añaden permisos de sesión de la aplicación.

| Consumidor | Método | Recurso implementado |
| --- | --- | --- |
| [prerender-blog](../scripts/prerender-blog.mjs) | GET mediante getJson | `route` |
| [prerender-blog](../scripts/prerender-blog.mjs) | GET mediante getJson | `BLOG_ROUTE` |
| [prerender-blog](../scripts/prerender-blog.mjs) | GET mediante getJson | `${BLOG_ROUTE}/posts` |
| [prerender-blog](../scripts/prerender-blog.mjs) | GET mediante getJson | `${BLOG_ROUTE}/posts/${encodeURIComponent(slug)}` |
| [sitemap.php](../public/sitemap.php) | GET mediante cURL | API editorial fijo de posts con query de paginación |
| [blog-meta.php](../public/blog-meta.php) | GET mediante cURL | API editorial fijo de posts; uso productivo pendiente de confirmar |

El script editorial fija `SYSTEM_SLUG = clic-menu`, `BLOG_SLUG = blog-clicmenu` y `BLOG_ROUTE = /public/v1/clic-menu/blogs/blog-clicmenu`. Sus funciones de paginación reciben el recurso y envían params.
