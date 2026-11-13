# Requisitos e instalación

[Volver al índice](../README.md)

## Requisitos

- Node.js compatible con Vite: la copia instalada declara `^20.19.0 || >=22.12.0` en su manifiesto. El package.json del proyecto no fija su propia versión Node; confirmar la utilizada por equipo y CI.
- npm y lockfile sincronizado para `npm ci`.
- Navegador con almacenamiento web y WebSocket. El target `chrome80` de Vite no equivale a una matriz completa de navegadores probados.
- APIs ClicMenu y editorial, y Reverb para los flujos correspondientes.
- Para NetPay, contenedor Android con `window.NetpayBridge`; no está incluido en una pestaña de navegador común.

Fuentes: [package.json](../package.json), [Vite](../vite.config.js), [puente nativo](../src/services/native/netpayBridge.service.js).

## Inicio local

1. Abrir la raíz del repositorio.
2. Instalar mediante `npm ci`.
3. Configurar el ambiente con los nombres siguientes.
4. Ejecutar `npm run dev` y abrir la URL informada por Vite. No hay un puerto fijo declarado en vite.config.js.
5. Verificar conexiones con cuentas de prueba autorizadas.

```sh
npm ci
npm run dev
```

No se declaran scripts `start` ni `test`.

## Variables de entorno

| Variable | Uso | Necesidad o fallback |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Axios owner, staff, sistema y públicos de menú/factura/seguimiento | Base con prefijo API. Fallback codificado al API ClicMenu; definir para dirigir tráfico al ambiente correcto. |
| `VITE_BLOG_API_BASE_URL` | Cliente editorial y prerender del blog | El cliente navegador no tiene fallback; el script de build sí tiene un destino fijo alternativo y normaliza la URL. |
| `VITE_REVERB_APP_KEY` | Echo/Reverb | Clave pública de conexión; no sustituye autorización privada. |
| `VITE_REVERB_HOST` | Echo/Reverb | Host WebSocket, sin fallback local. |
| `VITE_REVERB_PORT` | Echo/Reverb | Conversión mediante Number; sin fallback local. |
| `VITE_REVERB_SCHEME` | Echo/Reverb | `https` activa forceTLS; otro valor no lo activa. |
| `VITE_PUBLIC_SITE_URL` | Prerender editorial | URL pública preferente para SEO del blog; alternativa VITE_SITE_URL y luego dominio fijo. |
| `VITE_SITE_URL` | Prerender editorial | Alternativa de la anterior. No configura todas las canonical. |
| `MODE` | Proceso Node del prerender editorial | Selecciona loadEnv; production por defecto. No es una variable del cliente. |

Ejemplo conceptual; reemplazar los marcadores antes de usar:

```dotenv
VITE_API_BASE_URL=<base-api-con-prefijo>
VITE_BLOG_API_BASE_URL=<base-editorial>
VITE_REVERB_APP_KEY=<clave-publica>
VITE_REVERB_HOST=<host>
VITE_REVERB_PORT=<puerto-numerico>
VITE_REVERB_SCHEME=<http-o-https>
VITE_PUBLIC_SITE_URL=<url-publica>
```

Las variables VITE consumidas por navegador forman parte del frontend. No poner secretos de servidor, contraseñas o tokens de sesión en ellas. Reiniciar Vite o reconstruir después de cambiarlas.

La autorización privada Echo, el API de referidos y las URLs PHP/SEO tienen destinos fijos en código: VITE_API_BASE_URL no los reconfigura. PayPal obtiene configuración del backend; no se identificó una VITE_PAYPAL usada.

## Scripts

| Comando | Acción declarada |
| --- | --- |
| `npm run dev` | Vite de desarrollo. |
| `npm run build:vite` | Solo vite build. |
| `npm run prerender:blog` | Genera HTML editorial desde API sobre dist existente. |
| `npm run prerender:public` | Genera páginas públicas sobre dist existente. |
| `npm run build` | Vite → blog → público, deteniéndose si falla una etapa. |
| `npm run build:seo` | Alias de build. |
| `npm run preview` | Previsualización Vite. |
| `npm run preview:public` | Script público con --preview. |
| `npm run lint` | eslint . |

No se ejecutaron instalación, build ni lint durante esta revisión documental.
