# Módulos funcionales y componentes

[Volver al índice](../README.md) · [Referencia por archivo](inventario-modulos.md)

Este capítulo explica los dominios y sus relaciones. El inventario complementario incluye los 526 archivos de components y los 133 de pages, también los hooks/helpers ubicados junto a pantallas. Las listas siguientes identifican puntos de entrada y colaboradores principales; no sustituyen el catálogo completo.

## Público, QR y pedidos

[PublicMenuEntryPage](../src/pages/public/PublicMenuEntryPage.jsx) coordina carga, selección de canal, sesión de mesa, productos y carrito. Compone los bloques de `pages/public/public-menu-entry`: estados de carga/error/vacío, grilla, drawer, overlays y modales. La identidad y presentación usan `components/menu/public`; el selector de variantes, extras, compuestos y panel de carrito proceden de `components/menu/shared`.

| Colaborador | Responsabilidad |
| --- | --- |
| usePublicMenuLoader | Obtiene menú y, cuando corresponde, conjuntos. Valida coherencia de modo, menú y canal, y descarta respuestas anteriores mediante secuencia. |
| useActiveMenuPayload / useMenuProducts | Selección del payload activo y proyección de productos para UI. |
| useTableQrSession | Scan, sesión, solicitud de reingreso, heartbeat y estados temporales de mesa. |
| useCompositeDrafts | Configuración temporal de compuestos. |
| useCartAndOrder | Coordina carrito, pedido de mesa, envío web y cancelación. |
| usePublicCart | Partidas, disponibilidad, preparados y recuperación para navegación a conjuntos. |
| usePublicTableOrder | Creación, consulta, anexado y solicitud de cuenta del pedido. |
| usePublicWebOrdering | WhatsApp, cotización y creación de pedidos en línea. |
| usePublicOrderCancellation | Solicitud de cancelación total o parcial del cliente. |

Los colaboradores HTTP se encuentran en [publicMenu.service](../src/services/public/publicMenu.service.js). El flujo no habilita pedido simplemente por mostrar productos: depende de qr_type, sales_channel_code, public_flow, sesión y flags customer_ui/ui.

[MenuSetBuilderPage](../src/pages/public/public-menu-entry/menu-sets/MenuSetBuilderPage.jsx) se monta tanto en rutas públicas como en mesero y venta directa. El builder, sus payloads y el almacén de navegación están en `hooks/menu/menu-sets`; separan contextos para conservar carrito, selecciones y retorno. El detalle de dependencias puede consultarse por su ruta de archivo en el inventario.

[PublicOnlineOrderTrackingPage](../src/pages/public/order-tracking/PublicOnlineOrderTrackingPage.jsx) consulta por trackingToken y compone encabezado, pestaña de seguimiento y detalle. [PublicInvoicePage](../src/pages/public/invoice/PublicInvoicePage.jsx) compone formulario, resumen, estado y éxito con el servicio público de facturación. Estos tokens son distintos de las sesiones de propietario o personal.

## Atención y cocina

[WaiterTablesGrid](../src/pages/staff/waiter/WaiterTablesGrid.jsx) usa tableros, tarjetas y pestañas de zona de `components/staff/waiter`; coordina ocupación, selección de almacén, avisos y solicitudes. Consulta `waiterTables.service` y `tableSessionRequests.service`.

[StaffMenuEntryPage](../src/pages/staff/waiter/StaffMenuEntryPage.jsx) comparte UI de menú y carrito, emplea `useStaffCartAndOrder` y `staffOrders.service`, y agrega diálogos de cancelación y selección de almacén. La revisión de solicitudes de cancelación tiene componentes separados para selección, revisión y autorización.

[KitchenDashboard](../src/pages/staff/kitchen/KitchenDashboard.jsx) consulta `kitchenKds.service` y `kitchenPreparedItems.service`. Compone topbar, tabs, tarjetas de pedido, detalles y drawer de preparados. El almacén seleccionado y la respuesta del backend condicionan lo mostrado. Usa actualizaciones WebSocket y polling.

## Caja

| Entrada | Colaboradores y flujo |
| --- | --- |
| CashierHomePage | Registros, sesión vigente y apertura mediante cashierSession.service; tarjetas y modal en homePage. |
| CashierQueuePage | Cola de ventas, notificaciones y consultas de detalle con cashierQueue.service. |
| CashierDirectOrderPage | Menú compartido, useCashierDirectCartAndOrder, creación de pedido directo y conjuntos. |
| CashierSaleDetailPage | Hooks saleDetail para carga, cliente, descuentos, ajustes, precuenta, pago y ticket. |
| CashierOnlineOrdersPage / DetailPage | Lista, tabs, tarjetas, aceptación/rechazo, estados y acciones con cashierOnlineOrders.service. |
| CashierOnlineOrderPaymentPage | Hooks de carga/pago junto a la página, medios de pago y orquestación NetPay. |
| CashierRefundsHistoryPage | Historial, resumen y acciones de devolución mediante cashierRefunds.service. |
| CashierCustomersPage | Búsqueda, saldo, historial, movimientos y puntos con servicios de cliente/lealtad. |

La carpeta real se llama `casher` aunque las rutas utilizan `cashier`. Los componentes de cuentas, pagos, descuentos, precuenta, tickets y autorizaciones están en `components/staff/casher`. El [catálogo HTTP](catalogo-endpoints.md) distingue los servicios para venta, cuenta y pedido en línea; no asumir que son recursos intercambiables.

## Catálogo y menús del propietario

- Productos: ProductsPage, ProductVariantsPage, ProductCompositionPage y ProductRecipesPage coordinan formulario, variantes, canales, composición y recetas con servicios de `products` e `inventory/recipes`.
- Estructura de menú: MenuManager, paneles de secciones/categorías y servicios de `menu`; MenuListPage, MenuContentPage y MenuChannelsPage administran menús, contenido, jerarquía, programación y canales.
- Modificadores: ModifierManager y catálogos separados para productos, variantes, componentes y variantes de componentes. Incluyen grupos, opciones y configuración/prueba/movimientos de consumo. No equivalen al catálogo de variantes de producto.
- Promociones: listado, creación y edición reutilizan PromotionFormPage y pasos de información, productos, canales/horarios, configuración y revisión. `promotionForm.service` y `promotion.service` transforman datos además de hacer HTTP.
- Conjuntos: listado, creación, gestión de etapas, definiciones y productos; programación, activación, administración, capacidades, disponibilidad e importaciones. El panel operativo del propietario reúne conjuntos, productos, inventario, actualizaciones y recordatorios.

Las importaciones tienen una secuencia específica: consultar periodo/estado → descargar plantilla/configuración → subir archivo para preview → revisar → publicar import_id → consultar historial/publicaciones. No se documenta el formato completo de la plantilla como contrato confirmado del backend.

## Administración de operación

| Dominio | Páginas y UI | Servicios |
| --- | --- | --- |
| Restaurante/sucursal | MyRestaurantsHome, edición, ajustes, sucursales y catálogos | restaurant, branch, settings, demoContent, branchCatalog y branchSalesChannels. |
| Personal/cajas | RestaurantStaffPage, asignaciones y CashRegistersPage | staff, roles, staffAssignments, cashRegisters. |
| Inventario | Ingredientes, presentaciones, almacenes, stocks, movimientos y compras/detalle | inventory por entidad; proveedores, grupos, recetas y reportes. |
| Piso y QR | BranchFloorPlanPage y BranchQrCodesPage; zonas, mesas, asignaciones y exportación QR | floor/zones, tables, operationalSettings y qr. |
| Reglas | Ajustes de sucursal, facturación operativa, autorizadores, descuentos, tickets, lealtad, menú público, preparados y pedidos en línea | management/settings, operation y public-menu. |
| Reportes | Ventas, utilidad e inventario; filtros, resumen y preview | reports, con descargas PDF/Excel por HTTP. |
| Conexiones | WhasapoConnectionPage, TaecontaAccountPage, NetpayConnectionPage | connection/whatsapp, tae y netpay. |
| Suscripciones | Planes, historial, complementos y facturación del propietario | owner, restaurant, paypal y plan. |

## Plataforma y contenido público

Las páginas de `system-admin` separan propietarios, detalle de restaurante/sucursal, complementos, ventas de suscripción/complementos y facturación de plataforma. Los componentes de `components/system-admin` reflejan esa división; sus peticiones usan systemAdminApi.

Las páginas landing componen secciones de portada, navegación y footer; planes y términos consultan sus servicios. El blog usa un API editorial diferente mediante publicBlogApi. Las guías tienen layout y CSS editorial propios. No se identificó un CMS de edición de artículos dentro de las rutas de esta aplicación.

## Primitivas y utilidades

`components/common` reúne AppAlert, PageContainer, ContextOverview y PaginationFooter. Los componentes layout implementan menús y sidebars. Los formularios usan estado local y, en partes del proyecto, React Hook Form.

| Utilidad | Comportamiento verificable |
| --- | --- |
| normalizeErr | Mensaje de respuesta, errores de campos o fallback. |
| getByPath | Acceso por ruta con puntos y fallback para ausencia/null. |
| normalizePhone | Extrae dígitos y conserva los últimos diez. |
| handleRestaurantApiError | Redirección a planes para códigos de suscripción/límite específicos. |
| handleFormApiError | Mapea 422 a setError y delega auth/mensaje por callbacks. |
| usePagination | Estado y operaciones de paginación; ver contrato en fuente. |
| useTransientMessage | Mensajes temporales del menú. |

El inventario distingue exportaciones, estados y claves desestructuradas. Estas últimas incluyen helpers y no deben interpretarse como un esquema formal de props obligatorias.
