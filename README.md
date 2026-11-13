# ClicMenu — Frontend

Aplicación React para la administración y operación de restaurantes: menú público QR, pedidos, atención en mesa, cocina y caja. Integra APIs HTTP y notificaciones con Echo/Reverb.

Documentación del código revisado el **13 de noviembre de 2026**. La disponibilidad efectiva de las operaciones depende del backend, los permisos y el plan. No se realizaron operaciones comerciales ni se validó una instalación productiva.

## Índice técnico

1. [Introducción y estructura](docs/introduccion.md)
2. [Requisitos, instalación y variables de entorno](docs/instalacion.md)
3. [Arquitectura](docs/arquitectura.md)
4. [Rutas y navegación: inventario completo](docs/rutas.md)
5. [Módulos funcionales y componentes](docs/modulos-y-componentes.md)
6. [Integración con API y contratos](docs/integracion-api.md)
7. [Catálogo de llamadas HTTP y parámetros](docs/catalogo-endpoints.md)
8. [Autenticación y permisos](docs/autenticacion-y-permisos.md)
9. [Estados, flujos y tiempo real](docs/estados-y-flujos.md)
10. [Referencia de suscripciones y temporizadores](docs/referencia-realtime.md)
11. [Estilos, SEO y despliegue](docs/estilos-seo-despliegue.md)
12. [Mantenimiento, validación y pendientes](docs/mantenimiento.md)
13. [Inventario de módulos y dependencias](docs/inventario-modulos.md)
14. [Guía de páginas por tipo de usuario](docs/guia-paginas.md)
15. [Manual técnico en Word con diseño ClicMenu](docs/ClicMenu_Documentacion_Tecnica.docx)

## Inicio local

Consultar primero [instalación](docs/instalacion.md) para configurar los servicios necesarios.

```sh
npm ci
npm run dev
```

`npm run build` ejecuta Vite y dos etapas de prerenderizado; la del blog consulta su API. Consultar [despliegue](docs/estilos-seo-despliegue.md) antes de publicar.

## Alcance de la revisión

Se revisaron los manifiestos, el README anterior, el arranque, las configuraciones relacionadas y 859 archivos JavaScript, JSX y CSS de src: 526 componentes, 133 archivos de páginas, 145 servicios y 28 archivos de hooks, además de rutas, contextos, layouts, tiempo real, SEO, estilos, temas y utilidades. Se registraron 112 declaraciones de ruta con path o índice y 605 sitios de llamada HTTP en src. Los conteos incluyen padres, índices y llamadas repetidas: **no representan endpoints únicos ni tráfico observado**.

Los inventarios proceden de análisis de sintaxis e imports, complementado con revisión de los flujos principales. Incluyen enlaces a las fuentes. Los aspectos no verificables se señalan como pendientes. Solo se crean o actualizan archivos de documentación; no se publican valores de entorno.
