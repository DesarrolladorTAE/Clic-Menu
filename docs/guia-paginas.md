# Guía de páginas de ClicMenu

[Volver al índice](../README.md) · [Rutas completas](rutas.md) · [Componentes y servicios](modulos-y-componentes.md)

Esta guía explica las pantallas en lenguaje directo: quién entra, para qué sirven y cómo se relacionan. Las rutas proceden de AppRoutes.jsx y las responsabilidades de las páginas y servicios documentados. Los permisos y las acciones disponibles dependen del contexto, el plan y el backend.

## Cómo leer las rutas

Un nombre con dos puntos es un dato variable: `:restaurantId` identifica un restaurante, `:tableId` una mesa y `:token` un enlace público. No escribir esos nombres literalmente al navegar.

Para evitar repetir prefijos largos, las tablas de operación utilizan estas bases:

- **Restaurante:** `/owner/restaurants/:restaurantId`.
- **Operación:** `/owner/restaurants/:restaurantId/operation`.
- **Caja:** `/staff/cashier`.
- **Plataforma:** `/system-admin`.

Una ruta relativa de una tabla se agrega a su base. Por ejemplo, `menu/products` en Operación corresponde a `/owner/restaurants/:restaurantId/operation/menu/products`.

## Mapa rápido por persona

| Persona | Punto de entrada | Recorrido habitual |
| --- | --- | --- |
| Visitante | `/` | Conoce el producto, consulta planes, guías y blog. |
| Cliente del restaurante | `/menu/:token` | Consulta el menú; según canal y permisos puede armar un pedido o enviarlo. |
| Cliente con pedido web | `/order/:trackingToken` | Consulta el seguimiento y detalle de su pedido. |
| Cliente que solicita factura | `/invoice/:token` | Consulta la información asociada al token y completa la solicitud. |
| Propietario | `/auth/login` | Accede a sus restaurantes y entra a configuración u operación. |
| Mesero | `/staff/login` | Selecciona contexto, abre mesas y captura pedidos. |
| Cocina | `/staff/login` | Entra al KDS del contexto activo y consulta preparación. |
| Cajero | `/staff/login` | Abre o recupera sesión de caja y atiende ventas/pedidos. |
| Administrador de plataforma | `/system-admin/login` | Administra propietarios, suscripciones, complementos y facturación. |

Estos recorridos explican la organización, no una garantía de que cada usuario tenga todas las acciones.

## Páginas públicas

### Información del producto

| Página | Ruta | Para qué sirve |
| --- | --- | --- |
| Inicio | `/` | Presenta ClicMenu, sus secciones comerciales, demostraciones, beneficios y preguntas frecuentes. |
| Planes | `/planes` | Muestra información de planes; consulta el catálogo público de planes. |
| Contacto | `/contacto` | Presenta los medios e información de contacto definidos en la página. |
| Términos y condiciones | `/terminos-y-condiciones` | Consulta y presenta el documento legal público. |
| Guía de menú QR con Canva | `/recursos/menu-qr-con-canva` | Recurso editorial sobre la elaboración de un menú QR con Canva. |
| Guía para elegir menú QR | `/recursos/como-elegir-menu-qr` | Recurso editorial sobre criterios de elección de un menú QR. |

### Blog

| Página | Ruta | Para qué sirve |
| --- | --- | --- |
| Listado de artículos | `/blog` | Consulta las publicaciones del API editorial y permite abrir artículos. |
| Artículo | `/blog/:postSlug` | Muestra una publicación identificada por su slug y sus metadatos. |
| Categoría | `/blog/categorias/:categorySlug` | Lista publicaciones filtradas por categoría. |
| Etiqueta | `/blog/etiquetas/:tagSlug` | Lista publicaciones filtradas por etiqueta. |

El blog utiliza una API distinta de la API operativa. Este frontend no declara una pantalla de edición de artículos.

### Menú y atención al cliente

| Página | Ruta | Para qué sirve y cómo continúa |
| --- | --- | --- |
| Menú público | `/menu/:token` | Resuelve el enlace QR, carga catálogo y capacidades. Compone productos, variantes, extras, compuestos, conjuntos y carrito. Puede ser solo consulta, mesa asistida, WhatsApp o pedido en línea según el payload. |
| Configurador de conjunto | `/menu/:token/conjuntos/:menuSetId` | Configura selecciones por etapas de un conjunto y devuelve la partida al carrito del contexto correspondiente. |
| Seguimiento del pedido | `/order/:trackingToken` | Presenta estado y detalle del pedido web; se refresca por consulta y eventos. |
| Facturación pública | `/invoice/:token` | Presenta resumen, formulario y estado de solicitud de factura del recurso autorizado por token. |

**Distinción importante:** abrir un menú no crea automáticamente una sesión de mesa ni habilita pedidos. La respuesta indica canal, flujo y capacidades; las condiciones de la sesión y la disponibilidad pueden bloquear el envío.

## Acceso y selección de contexto

| Página | Ruta | Función |
| --- | --- | --- |
| Registro de propietario | `/auth/register` | Coordina captura de datos y verificación por códigos, con aceptación de términos según el flujo implementado. |
| Acceso de propietario | `/auth/login` | Inicia la sesión owner; la recuperación de contraseña se presenta mediante un modal, no una ruta independiente. |
| Panel de usuario | `/app` | Entrada protegida Dashboard; no equivale a una página de operación de restaurante. |
| Acceso del personal | `/staff/login` | Inicia una sesión staff independiente de la del propietario. |
| Selector de contexto | `/staff/select-context` | Selecciona restaurante, sucursal y rol de trabajo cuando corresponde. |
| Acceso de plataforma | `/system-admin/login` | Inicia la sesión administrativa del sistema. |

El router de staff exige autenticación, pero no define por sí solo una matriz completa de roles por página. Las pantallas y el backend verifican las condiciones operativas.

## Área del propietario

### Portafolio y administración principal

| Página | Ruta completa o relativa a Restaurante | Función |
| --- | --- | --- |
| Mis restaurantes | `/owner/restaurants-home` | Lista y gestiona el acceso a los restaurantes del propietario; utiliza formularios y acciones del dominio restaurante. |
| Facturación del propietario | `/owner/billing` | Consulta compras y facturas de plataforma, con filtros y modales de solicitud/detalle. |
| Datos del restaurante | `edit-info` | Edita la información del restaurante seleccionado. |
| Ajustes del restaurante | `settings` | Administra los ajustes generales del restaurante. |
| Sucursales | `branches` | Gestiona sucursales y sus datos mediante formularios. |
| Canales de venta | `sales-channels` | Gestiona los canales de venta del restaurante. |
| Planes del restaurante | `plans` | Consulta opciones de suscripción; puede utilizar checkout PayPal según configuración. |
| Historial de suscripciones | `subscriptions` | Consulta movimientos y estado de suscripciones. |
| Complementos | `addons` | Consulta catálogo e historial de complementos. |

Las rutas base del restaurante montan un layout. Ese layout organiza navegación; no es una pantalla adicional con funciones propias.

### Operación y personal

Base de las siguientes tablas: **Operación**.

| Página | Ruta relativa | Función |
| --- | --- | --- |
| Ajustes de sucursal | `branch-settings` | Configura la sucursal seleccionada. Es el destino índice de Operación. |
| Personal | `staff` | Administra personal y asignaciones a contexto/rol mediante modales. |
| Cajas | `cash-registers` | Administra los registros de caja; no sustituye la pantalla staff que abre una sesión. |
| Catálogo de sucursal | `catalog` | Configura la disponibilidad/asignación del catálogo para una sucursal. |
| Canales de sucursal | `branch-sales-channels` | Configura los canales para la sucursal. |
| Productos por canal | `branches/:branchId/sales-channels/:salesChannelId/products` | Configura los productos de una combinación sucursal/canal. |

### Productos y estructura del menú

| Página | Ruta relativa | Función |
| --- | --- | --- |
| Estructura del menú | `menu` | Organiza secciones y categorías usadas por el catálogo. |
| Productos | `menu/products` | Lista, filtra y administra productos con formularios. |
| Variantes | `menu/products/:productId/variants` | Gestiona variantes, atributos, valores, imágenes y canales asociados. |
| Recetas | `menu/products/:productId/recipes` | Edita la configuración de recetas del producto. |
| Composición | `menu/products/:productId/components` | Configura componentes de productos compuestos. |
| Menús | `menus` | Lista y administra menús. |
| Contenido de menú | `menus/:menuId/content` | Configura jerarquía, productos normales, conjuntos y programación correspondiente. |
| Canales de menú | `menus/:menuId/channels` | Asocia/configura canales y opciones de menú predeterminado. |

**Cómo se conectan:** productos y variantes describen lo vendible; secciones y categorías organizan; un menú define el contenido publicado y sus canales; el catálogo de sucursal y la disponibilidad del backend condicionan lo que ve la operación o el cliente.

### Conjuntos

| Página | Ruta relativa | Función |
| --- | --- | --- |
| Lista de conjuntos | `menu-sets` | Consulta y abre configuraciones de conjuntos. |
| Crear conjunto | `menu-sets/new` | Captura la configuración inicial. |
| Panel operativo | `menu-sets/panel-operativo` | Reúne vistas de conjuntos, productos, inventario, actualizaciones y recordatorios. |
| Gestionar conjunto | `menu-sets/:menuSetId` | Agrupa ajustes generales, etapas, programación, activación, administración, capacidades, disponibilidad e importación mediante pestañas. |
| Productos de etapa | `menu-sets/:menuSetId/stages/:stageId/products` | Gestiona productos asignados a una etapa. |
| Definiciones de etapa | `menu-sets/:menuSetId/stage-definitions` | Administra las definiciones de etapas disponibles para ese contexto. |

La importación es una pestaña del área de gestión: consulta periodo → descarga plantilla → carga para vista previa → revisión → publicación → historial. No es una ruta independiente declarada.

### Modificadores y promociones

| Página | Ruta relativa | Función |
| --- | --- | --- |
| Modificadores | `modifiers` | Administra grupos, opciones y configuración de consumo. |
| Catálogo por producto | `modifiers/catalogs/products` | Asigna/configura grupos para productos. |
| Catálogo por variante | `modifiers/catalogs/variants` | Asigna/configura grupos para variantes. |
| Catálogo por componente | `modifiers/catalogs/components` | Configura modificadores de componentes de compuestos. |
| Catálogo por variante de componente | `modifiers/catalogs/component-variants` | Configura modificadores de variantes de esos componentes. |
| Lista de promociones | `promotions` | Consulta, filtra y gestiona promociones. |
| Crear promoción | `promotions/create` | Recorre los pasos de información, productos, canales/horarios, configuración y revisión. |
| Editar promoción | `promotions/:promotionId/edit` | Reutiliza el formulario por pasos sobre una promoción existente. |

### Inventario y compras

| Página | Ruta relativa | Función |
| --- | --- | --- |
| Ingredientes | `ingredients` | Gestiona ingredientes y agrupación mediante formularios. |
| Presentaciones | `ingredients/:ingredientId/presentations` | Configura presentaciones del ingrediente seleccionado. |
| Almacenes | `warehouses` | Gestiona almacenes del contexto. |
| Reporte de inventario | `warehouses/inventory-report` | Consulta resumen/detalle y exportaciones del reporte. |
| Existencias de ingredientes | `warehouses/:warehouseId/ingredient-stocks` | Consulta stock de ingredientes del almacén. |
| Existencias de productos | `warehouses/:warehouseId/product-stocks` | Consulta stock de productos del almacén. |
| Movimientos de ingredientes | `warehouses/:warehouseId/ingredient-movements` | Consulta movimientos y utiliza el flujo de movimiento manual cuando corresponde. |
| Movimientos de productos | `warehouses/:warehouseId/product-movements` | Consulta movimientos de productos y su flujo manual correspondiente. |
| Compras | `purchases` | Lista, filtra y gestiona compras. |
| Detalle de compra | `purchases/:purchaseId` | Reúne metadatos y partidas de productos/ingredientes. |

La gestión de proveedores se presenta mediante componentes y servicios del dominio, sin una ruta de página de proveedores declarada en AppRoutes.

### Piso y reglas de operación

| Página | Ruta relativa | Función |
| --- | --- | --- |
| Plano de mesas | `tables` | Gestiona zonas, mesas, asignaciones de mesero y ajustes operativos mediante paneles/modales. |
| Códigos QR | `tables/qr-codes` | Lista, crea, administra y exporta códigos QR mediante diálogos. |
| Pedidos en línea | `online-orders` | Configura activación, reglas generales, entrega y métodos de pago. Es configuración del propietario, no la bandeja de pedidos del cajero. |
| Preparados | `prepared-items` | Configura políticas de productos preparados y preparación rápida. |
| Facturación operativa | `billing-settings` | Configura reglas operativas y autorizadores. No es el historial de facturas de plataforma. |
| Descuentos | `discounts` | Administra política y autorizadores de descuentos. |
| Tickets | `ticket-settings` | Configura ticket, impresión y mensajes WhatsApp. |
| Menú público | `public-menu-settings` | Configura presentación, portada y galería del menú público. |
| Lealtad | `customer-loyalty-settings` | Configura las reglas de lealtad del cliente. |

### Reportes y conexiones

| Página | Ruta relativa | Función |
| --- | --- | --- |
| Reporte de ventas | `reports/sales` | Filtros, resumen, vista previa y descargas de ventas. |
| Reporte de utilidad | `reports/profit` | Filtros, resumen, vista previa y descargas de utilidad. |
| WhatsApp o Whasapo | `connections/whasapo` | Configura conexión, preferencias y flujo QR de mensajería. |
| TAE | `connections/taeconta` | Configura cuenta, perfil fiscal y opciones de factura de la integración. |
| NetPay | `connections/netpay` | Consulta/configura terminales de la integración. El cobro ocurre en flujos de caja. |

## Operación del personal

### Mesero y cocina

| Página | Ruta completa | Función |
| --- | --- | --- |
| Tablero de mesas | `/staff/waiter/tables/grid` | Muestra zonas/mesas, ocupación, avisos y solicitudes; permite pasar a la captura de pedido. |
| Pedido de mesa | `/staff/waiter/tables/:tableId/order` | Carga menú y pedido del contexto, configura partidas y coordina envío y solicitudes de cancelación. |
| Conjunto del pedido | `/staff/waiter/tables/:tableId/order/conjuntos/:menuSetId` | Configura una partida de conjunto y retorna al pedido del mesero. |
| Cocina | `/staff/kitchen` | Presenta el KDS, tarjetas y detalles de preparación, selección de almacén y drawer de preparados. |

### Caja

Base: **Caja**.

| Página | Ruta relativa o base | Función |
| --- | --- | --- |
| Inicio de caja | Base `/staff/cashier` | Consulta cajas/sesión vigente y permite abrir sesión mediante modal. |
| Cola | `queue` | Lista ventas a atender y permite abrir su detalle. |
| Venta directa | `direct-order` | Arma un pedido desde caja usando menú y carrito compartidos. |
| Conjunto de venta directa | `direct-order/conjuntos/:menuSetId` | Configura un conjunto en el carrito de caja. |
| Pedidos en línea | `online-orders` | Bandeja operativa con filtros/pestañas y avisos de pedidos. |
| Detalle de pedido en línea | `online-orders/:onlineOrderId` | Consulta el pedido y ejecuta acciones disponibles de atención y estado. |
| Pago de pedido en línea | `online-orders/:onlineOrderId/payment` | Coordina medios de pago y flujo de cobro del pedido. |
| Historial y devoluciones | `refunds` | Consulta ventas y resumen/acciones de devolución. |
| Clientes | `customers` | Consulta cliente, saldo, historial, movimientos y puntos según capacidades. |
| Detalle de venta | `sales/:saleId` | Reúne cuentas, cliente, descuentos, ajustes, precuenta, pago y ticket. Está protegida, pero fuera del CashierLayout en el router. |

El mismo prefijo `/staff/cashier` aparece para la página de inicio y para un layout que contiene las páginas hijas. Son dos declaraciones del router, no dos inicios de caja distintos.

## Administración de plataforma

Base: **Plataforma**. Requiere el guard de administrador con rol admin y scope system.

| Página | Ruta relativa o base | Función |
| --- | --- | --- |
| Panel de plataforma | Base `/system-admin` | Entrada de la administración del sistema. |
| Propietarios | `owners` | Lista, filtra y administra propietarios mediante formularios. |
| Detalle del propietario | `owners/:ownerId` | Reúne cuenta, perfil fiscal y restaurantes asociados. |
| Detalle del restaurante | `owners/:ownerId/restaurants/:restaurantId` | Administra datos, sucursales y suscripciones del restaurante del propietario. |
| Complementos de sucursal | `owners/:ownerId/restaurants/:restaurantId/branches/:branchId/addons` | Consulta y asigna complementos para la sucursal. |
| Ventas de suscripciones | `subscription-sales` | Lista, filtra y resume ventas de suscripción. |
| Ventas de complementos | `addon-sales` | Lista, filtra y resume ventas de complementos. |
| Compras de plataforma | `billing/purchases` | Consulta compras y utiliza el flujo administrativo de facturación. |
| Facturas de plataforma | `billing/invoices` | Consulta detalle, estado, reintentos y descargas según servicio. |

## Pantallas de prueba y elementos sin página propia

`/test-mui` y `/test-event` están declaradas públicas. Confirmar su exposición intencional en producción. La ruta comodín dirige a `/auth/login`. No hay una ruta `/staff/app` aunque el interceptor la utiliza como retorno alternativo en state.

Perfiles, datos fiscales, recuperación de contraseña, autorizaciones, apertura/cierre, pagos PayPal, configuración de variantes y varios formularios usan modales, pestañas o componentes internos. No deben documentarse como páginas nuevas si AppRoutes no les asigna una ruta.

Los layouts tampoco equivalen a pantallas de negocio. Los archivos de pages que no aparecen en AppRoutes pueden ser colaboradores o pantallas sin montaje directo; comprobar el [inventario de imports](inventario-modulos.md) antes de asumir que son accesibles.

## Recorridos para comprender el sistema

1. **Preparar un restaurante:** acceso del propietario → mis restaurantes → datos y sucursales → configuración operativa → personal, catálogo, menús y canales → piso/QR según modalidad.
2. **Atender una mesa:** acceso staff → contexto → tablero de mesas → pedido → preparación en cocina → atención/cobro en caja. Las transiciones permitidas las confirma el backend.
3. **Atender un pedido web:** cliente abre menú habilitado → carrito y checkout → seguimiento público; caja consulta su bandeja, atiende el pedido y gestiona el pago según configuración.
4. **Mantener un conjunto:** propietario abre conjuntos → configuración por etapas/productos → programación/disponibilidad → asignación a menú; el cliente o staff lo configura en el builder al pedir.
5. **Administrar la plataforma:** acceso de sistema → propietario → restaurante/sucursal → suscripción/complementos; ventas y facturas se consultan en sus secciones propias.

## Dónde ampliar

- [Rutas](rutas.md): paths completos, componente montado y guard/layout heredado.
- [Módulos](modulos-y-componentes.md): relaciones con componentes, hooks y servicios.
- [API](integracion-api.md): clientes, contratos y errores.
- [Endpoints](catalogo-endpoints.md): verbos y expresiones realmente implementadas.
- [Permisos](autenticacion-y-permisos.md): sesión, rol y restricciones por plan.
- [Pendientes](mantenimiento.md): aspectos que requieren backend, ambiente o validación externa.
