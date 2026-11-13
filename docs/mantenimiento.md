# Mantenimiento, validación y pendientes

[Volver al índice](../README.md)

## Cómo mantener la documentación

Al modificar una funcionalidad, seguir su ruta desde AppRoutes hasta página, hooks/componentes, servicio y cliente HTTP. Actualizar el contrato enviado/leído, errores de negocio, feature de plan y eventos de invalidación. Mantener el mismo identificador de contexto entre menú, carrito y conjuntos. Distinguir llamadas de venta, cuenta, pedido y pedido en línea.

Si cambia una ruta, revisar navegación de sidebars, enlaces públicos, retorno después de login, PHP sitemap, scripts de prerender y reglas Apache. Si cambia un endpoint, actualizar el catálogo y sus consumidores; si cambia entorno, revisar también destinos codificados que no dependen de VITE_API_BASE_URL.

El [inventario](inventario-modulos.md) sirve como mapa de impacto de imports y estados. Es una fotografía estática: no debe utilizarse como prueba de que una función se ejecuta ni de que un archivo sin consumidor directo está obsoleto. Los nombres reales casher, whasapo y products_variants se conservan en los enlaces.

## Comprobaciones adecuadas

El proyecto declara `npm run lint`, `npm run build:vite`, `npm run build` y previsualizaciones. No declara un script test. La ausencia de ese script no demuestra ausencia absoluta de pruebas externas. No se agregaron tests ni se cambiaron dependencias durante esta revisión.

Para un cambio funcional futuro, comprobar al menos el flujo afectado con datos de prueba: carga, error de red, 422, permisos 403, conflicto 409 y sesión expirada; verificar contexto restaurante/sucursal, features del plan, recarga directa de ruta, listeners y timers. Para pagos y devoluciones usar ambientes autorizados y comprobar el resultado confirmado por backend, recuperación y prevención de repetición; no usar transacciones reales como prueba rutinaria.

Para cambios SEO comprobar HTML antes de JavaScript, H1, canonical, datos estructurados, hidratación y estilos Emotion. Para disponibilidad/carrito comprobar que una invalidación no sobrescriba selección con respuestas viejas y que partidas inválidas bloqueen el envío cuando corresponda.

## Validación de esta entrega

- Análisis sintáctico con Babel de los módulos JS/JSX de src, extracción de rutas, imports, exportaciones, estados y llamadas HTTP; lectura de CSS y archivos de configuración pertinentes.
- Revisión focal de arranque/hidratación, clientes HTTP, contextos, guards, restricciones de plan, hooks de carrito/sesión, canales, temporizadores, integraciones nativas y scripts/reglas de despliegue.
- Comprobación de enlaces relativos de la documentación y de que los archivos modificados por esta tarea sean documentales.
- Sin instalación, lint, build, pruebas contra backend, cobros ni publicación. Estas verificaciones permanecen pendientes y no se presentan como exitosas.

El análisis inicial encontró `package-lock.json` ya modificado en el árbol de trabajo. Esta tarea no lo editó ni lo restauró. Para la revisión de cambios, separar esa modificación previa de README.md y docs/.

## Pendientes y límites verificables

| Punto | Evidencia y motivo | Verificación necesaria |
| --- | --- | --- |
| Contrato backend | El cliente revela requests y campos leídos, no reglas completas ni todas las respuestas. | OpenAPI/backend, tipos, validación y códigos de cada dominio. |
| Tráfico realmente ejecutado | Inventario estático de llamadas implementadas. | Captura de red o pruebas de flujos autorizadas; no confundir 605 sitios con endpoints únicos. |
| Permisos staff | Guard general basado en token, sin matriz universal por rol. | Revisar controles por pantalla y autorización backend por restaurante/sucursal/rol. |
| Expiración/revocación | No se encontró renovación automática de token. | Política de vigencia, logout fallido y multidispositivo. |
| Entorno operativo | Se identifican nombres y fallbacks; no se inspeccionan valores .env. | Confirmar ambientes, CORS, TLS, host/puerto y claves públicas Reverb. |
| Destinos fijos | Broadcasting auth, referidos, PHP y parte del SEO tienen URLs codificadas. | Confirmar compatibilidad de staging y producción. |
| API editorial | Cliente navegador sin fallback de base; build con fallback fijo y dependencia de red. | Base correcta, paginación, datos publicados y manejo de caída durante build. |
| NetPay | Bridge y servicios frontend presentes; Android/SDK ausentes. | Versiones, capacidades, terminales, cobro, recovery, cancelación y reimpresión en ambiente de prueba. |
| PayPal/TAE/WhatsApp | Servicios y pantallas frontend. | Credenciales/configuración backend, callbacks/webhooks y comportamiento externo. |
| Hosting | Reglas Apache y PHP presentes, comentario cPanel. | Proveedor real, módulos Apache, versión/extensión PHP, publicación y rollback. |
| blog-meta.php | Archivo presente, sin rewrite expreso en .htaccess revisado. | Confirmar si se invoca externamente o quedó como alternativa. |
| Ruta de retorno staff | Interceptor usa /staff/app como fallback en state; AppRoutes no la declara. | Validar qué hace login con ese destino en cada caso. |
| Pantallas de prueba | /test-mui y /test-event son públicas en router. | Confirmar si esa exposición es intencional para el ambiente productivo. |
| Compatibilidad visual | MUI, sx, CSS y directivas Tailwind coexisten. | Build y revisión visual/responsive/accesibilidad, fuentes y navegadores soportados. |
| Versiones de ejecución | Sin engines de proyecto ni versión de Node propia fijada en package.json. | Confirmar y documentar Node/npm usados por CI y equipo. |
| Estado del build/lint | No ejecutados en esta tarea documental. | Ejecutarlos en revisión funcional; prerender requiere API editorial. |
| Operación de producción | Sin comprobación de monitoreo, respaldos, SLA o pipeline. | Documentación operativa del equipo responsable. |

No se proponen configuraciones inexistentes como hechos ni se corrigen estos puntos modificando código: quedan documentados para su verificación.
