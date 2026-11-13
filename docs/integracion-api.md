# Integración con API

[Volver al índice](../README.md) · [Catálogo de llamadas](catalogo-endpoints.md)

## Clientes y credenciales

| Cliente | Base | Token y opciones |
| --- | --- | --- |
| [api](../src/services/api.js) | VITE_API_BASE_URL o fallback ClicMenu | Bearer auth_token leído de localStorage en cada request. |
| [staffApi](../src/services/staffApi.js) | Misma selección de base | Bearer staff_token. |
| [systemAdminApi](../src/services/systemAdminApi.js) | Misma selección de base | Bearer system_admin_token. |
| [publicBlogApi](../src/services/publicBlogApi.js) | VITE_BLOG_API_BASE_URL, sin fallback local | Sin interceptor de token. |
| publicApi de publicMenu/publicInvoice | Base API configurable o fallback | Instancias independientes sin interceptor owner/staff. |
| publicTrackingApi | Base API configurable o fallback | Instancia pública independiente. |
| axios de referidos | URL fija de Tecnologías Administrativas | POST check-codigo con codigo_ref. |
| fetch de Echo | URL fija API ClicMenu /api/broadcasting/auth | POST con Bearer staff_token, socket_id y channel_name. |

Los clientes Axios compartidos principales configuran Accept application/json, timeout de 30000 ms y withCredentials false. Revisar las opciones exactas de cada instancia pública en su fuente. Con la base predeterminada, una ruta `/login` se envía bajo `/api/login`; no añadir dos veces el prefijo `/api`.

Los servicios públicos que importan `api`, como planes, siguen las reglas de ese cliente y podrían enviar un token owner existente. No todos los servicios denominados públicos usan una instancia anónima.

## Convenciones y formatos

- GET usa params para filtros y paginación. Algunos servicios agregan `_t: Date.now()` y cabeceras de no caché.
- POST/PUT/PATCH reciben payload o un objeto construido localmente; DELETE puede recibir opciones. El catálogo conserva los argumentos para evitar asumir que un identificador va siempre en el body.
- Imágenes, galerías e importaciones emplean FormData/multipart donde se declara. No imponer JSON globalmente sobre esos flujos.
- Descargas usan responseType blob y en algunos casos content-disposition para el nombre. Los reportes construyen URLSearchParams; NetPay también tiene integración nativa, que no constituye HTTP.
- No hay un unwrapping global de respuestas: algunos servicios retornan data, otros data.data y otros una estructura de descarga. El consumidor debe respetar el retorno específico.
- AbortSignal se pasa en consultas que lo implementan; no hay cancelación global de todas las solicitudes.

## Contratos principales observados

| Operación | Método y recurso | Datos relevantes |
| --- | --- | --- |
| Login owner | POST /login | email/password; servicio guarda token si se recibe. |
| Sesión owner | GET /me | El contexto lee user y referral_discount. |
| Contexto staff | POST /staff/select-context | restaurant_id, branch_id, role_id; devuelve active_context. |
| Menú QR | GET /public/menu/${token} | El servicio retorna data.data; el loader valida catalog_mode y contexto. |
| Conjuntos públicos | GET /public/menu/${safeToken}/sets | service_date opcional; coherencia de menú/canal con el catálogo. |
| Scan de mesa | POST /public/tables/${tableId}/scan | device_identifier persistente del dispositivo. |
| Pedido público | POST /public/orders | token, device_identifier, customer_name, party_size, adult_count, child_count, items. |
| Agregar partidas | POST /public/orders/${orderId}/append-items | token, device_identifier e items. |
| Cancelación pública | POST /public/orders/${Number(orderId)}/cancellation-request | token/device_identifier en query; body type, reason_code, reason_note e items para partial. |
| Pedir cuenta | POST /public/orders/${orderId}/request-bill | token y device_identifier. |
| WhatsApp | POST /public/web/send-whatsapp | token e items; no equivale a un cobro. |
| Cotizar pedido web | POST /public/menu/${tokenCodificado}/online-order/quote | Payload de checkout; conservar separación entre cotización y creación. |
| Crear pedido web | POST /public/menu/${tokenCodificado}/online-order/orders | Payload construido por checkout; respuesta gobierna la continuación. |
| PayPal | GET /paypal/config; POST /restaurants/${restaurantId}/paypal/checkout y /capture | Captura envía order_id; configuración llega del backend. |

Las expresiones de esta tabla son plantillas explicativas. El [catálogo](catalogo-endpoints.md) conserva las expresiones exactas, funciones, cliente, método, línea y opciones de todas las llamadas detectadas en src.

## Errores y sesión

[AxiosAuthInterceptor](../src/components/shared/AxiosAuthInterceptor.jsx) se aplica a api y staffApi. Un 401, o un 403 considerado no autenticado por ausencia de token/mensaje, limpia la sesión y dirige al login correspondiente, excluyendo endpoints de acceso según las reglas del archivo. Errores de red sin status se propagan.

Un 403 de permisos y un 409 de negocio se dejan a la pantalla; no deben interpretarse globalmente como cierre de sesión. `handleFormApiError` asigna errores 422 a React Hook Form. Los códigos SUBSCRIPTION_REQUIRED y BRANCH_LIMIT_REACHED tienen redirección a planes en subscriptionGuards cuando el consumidor lo usa. No hay un interceptor global equivalente de systemAdminApi en ese componente.

## Integraciones especiales

NetPay: los hooks de pago de venta y pedido en línea usan cashierNetpayPayment.service. Coordina terminal, transacción backend, bridge Android, resultado asíncrono, persistencia/finalización y recuperación. Otros servicios orquestan cancelación y reimpresión. La ausencia de bridge o métodos produce códigos NETPAY_BRIDGE_*. La recepción se correlaciona por netpay_transaction_id/operation_uuid; el evento es clicmenu:netpay-result. La aplicación Android y el SDK no están aquí.

TAE: servicios separados para cuenta, perfil fiscal y reglas de factura. WhatsApp/Whasapo: configuración de conexión y QR con sus propios endpoints. La ejecución externa y credenciales backend quedan fuera de este repositorio.

## Interpretación del catálogo

Los 605 sitios HTTP no son 605 endpoints distintos. Una misma ruta puede repetirse entre servicios; una función genérica de descarga recibe URL de sus llamadores. Los constructores locales y las descargas indirectas se complementan al final del catálogo. La existencia de una llamada demuestra implementación, no invocación exitosa, autorización del backend o ejecución en producción.
