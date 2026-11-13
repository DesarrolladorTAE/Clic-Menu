# Introducción y estructura

[Volver al índice](../README.md)

ClicMenu reúne contenido público, administración del propietario, operación del personal y administración del sistema. El repositorio contiene el frontend; no contiene el backend, el contenedor Android ni los servicios externos que procesan cobros, mensajería y facturación.

## Superficies funcionales

| Área | Capacidades observables |
| --- | --- |
| Pública | Portada, planes, contacto, términos, guías y blog con categorías y etiquetas. Menú QR por token, conjuntos, pedidos de mesa, WhatsApp y pedido en línea según payload. Seguimiento y factura por token. |
| Propietario | Restaurantes, sucursales, personal, catálogo, productos, variantes, composición, recetas, modificadores, promociones, menús, conjuntos, piso y QR; inventario y compras; reglas de operación, reportes, conexiones, planes, complementos e historiales de facturación. |
| Personal | Contexto restaurante/sucursal/rol; mesas y pedidos; KDS y preparados; sesiones de caja, cola, venta directa, cuentas, pagos, descuentos, ajustes, tickets, devoluciones, clientes y pedidos en línea. |
| Sistema | Propietarios, restaurantes, sucursales, suscripciones y complementos asignados, ventas, compras y facturas de plataforma. |

Una pantalla existente no implica disponibilidad para todos los usuarios. Las respuestas del backend y las features del plan condicionan sus acciones.

## Estructura

```text
/
├── package.json / package-lock.json  Scripts y dependencias
├── index.html                       Plantilla y SEO inicial
├── vite.config.js                   Desarrollo y compilación
├── eslint.config.js                 Análisis estático
├── postcss.config.js / tailwind.config.js
├── public/                          Imágenes, robots, Apache y PHP SEO
├── scripts/                         Prerender editorial y público
├── src/
│   ├── main.jsx / App.jsx            Arranque y proveedores
│   ├── components/                  UI compartida y por dominio
│   ├── pages/                       Pantallas y lógica asociada
│   ├── routes/                      Paths, parámetros y guards
│   ├── services/                    HTTP y orquestación
│   ├── context/                     Sesiones de tres audiencias
│   ├── hooks/                       Menú, carrito, QR, conjuntos y acceso
│   ├── layouts/                     Navegación privada y Outlet
│   ├── realtime/                    Echo/Reverb
│   ├── seo/                         Aplicación pública prerenderizable
│   ├── styles/ / theme/              CSS y temas MUI
│   ├── utils/                       Errores, formularios y normalización
│   └── assets/                      Recursos importables
└── docs/                            Documentación técnica
```

La salida configurada es `dist/`. El [inventario](inventario-modulos.md) enumera todos los módulos analizados, exportaciones, imports, consumidores y estados locales.

## Evidencia y límites

Las rutas se extraen del JSX de AppRoutes; los verbos HTTP de llamadas ejecutables, excluyendo comentarios. Las dependencias son imports locales resueltos. Los valores dinámicos se conservan como expresiones cuando dependen de ejecución. Los contratos se describen desde lo que el cliente envía o lee; el esquema completo del backend queda pendiente.

No se han leído ni publicado valores de .env, invocado APIs con sesiones, realizado operaciones comerciales o publicado el sitio. El README anterior era la plantilla de React + Vite, sin instrucciones propias del producto.
