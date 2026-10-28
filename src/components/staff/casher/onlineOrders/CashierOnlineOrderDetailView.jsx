import React, { useState } from "react";

import {
  Alert, Box, Button, Card, CardContent, Chip, Collapse, Divider, IconButton, Stack, Typography,
} from "@mui/material";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";

import {
  actorLabel,
  cancellationReasonLabel,
  financialStatusLabel,
  formatCurrency,
  formatDate,
  formatDateTime,
  fulfillmentLabel,
  kitchenFlowLabel,
  onlineOrderStatusLabel,
  ownershipLabel,
  paymentTypeLabel,
  timingLabel,
} from "./onlineOrderDisplay";

export default function CashierOnlineOrderDetailView({
  order,
  onBack,
}) {
  return (
    <Stack spacing={3}>
      <Card sx={cardSx}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
              spacing={{ xs: 1.5, sm: 2 }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 24, sm: 30, md: 38 },
                    lineHeight: 1.05,
                    fontWeight: 800,
                    color: "text.primary",
                    wordBreak: "break-word",
                  }}
                >
                  {order?.public_number ? `Pedido ${order.public_number}` : "Pedido"}
                </Typography>

                <Typography sx={{ mt: 0.75, fontSize: 15, color: "text.secondary" }}>
                  {order?.order_name || "Cliente sin nombre"}
                </Typography>
              </Box>

              <Button
                type="button"
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={onBack}
                sx={{
                  minHeight: { xs: 42, sm: 48 },
                  px: { xs: 1.5, sm: 2.5 },
                  fontSize: { xs: 12.5, sm: 14 },
                  fontWeight: 800,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                Volver a pedidos
              </Button>
            </Stack>

            <Divider />

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(4, minmax(0, 1fr))",
                },
              }}
            >
              <SummaryItem label="Entrega" value={fulfillmentLabel(order?.fulfillment_type)} />
              <SummaryItem label="Horario" value={timingLabel(order?.timing_type)} />
              <SummaryItem label="Pago" value={paymentTypeLabel(order?.payment_type)} />
              <SummaryItem label="Preparación" value={kitchenFlowLabel(order?.kitchen_flow)} />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: "repeat(2, minmax(0, 1fr))",
          },
          alignItems: "stretch",
        }}
      >
        <SectionCard title="Cliente">
          <InfoRow label="Nombre" value={order?.order_name || "No proporcionado"} />
          <InfoRow label="Teléfono" value={order?.customer_phone || "No proporcionado"} />
          <InfoRow label="Correo" value={order?.customer_email || "No proporcionado"} />

          {order?.customer_notes ? (
            <>
              <Divider />
              <InfoBlock label="Notas del cliente" value={order.customer_notes} />
            </>
          ) : null}
        </SectionCard>

        <SectionCard title="Entrega y horario">
          <InfoRow label="Forma de entrega" value={fulfillmentLabel(order?.fulfillment_type)} />
          <InfoRow label="Tipo de horario" value={timingLabel(order?.timing_type)} />
          <InfoRow label="Horario solicitado" value={formatDateTime(order?.requested_for_at)} />
          <InfoRow label="Horario estimado" value={formatDateTime(order?.estimated_for_at)} />

          {order?.destination?.scheduled_date ? (
            <InfoRow label="Fecha programada" value={formatDate(order.destination.scheduled_date)} />
          ) : null}

          <DestinationSnapshot snapshot={order?.destination?.destination_snapshot} />

          {order?.fulfillment_type === "home_delivery" &&
            order?.destination?.delivery_address ? (
            <>
              <Divider />
              <InfoBlock
                label="Dirección de entrega"
                value={order.destination.delivery_address}
              />
            </>
          ) : null}
        </SectionCard>

        <SectionCard title="Pago">
          <InfoRow label="Método elegido" value={paymentTypeLabel(order?.payment_type)} />
          <InfoRow label="Estado del pago" value={financialStatusLabel(order?.financial_status)} />
          <InfoRow label="Costo de entrega" value={formatCurrency(order?.delivery_fee)} />
          <Divider />
          <InfoRow label="Total" value={formatCurrency(order?.total)} strong />
        </SectionCard>

        <SectionCard title="Asignación">
          <InfoRow label="Caja" value={ownershipLabel(order?.ownership)} />
          <InfoRow label="Estado" value={onlineOrderStatusLabel(order?.status)} />
          <InfoRow label="Preparación" value={kitchenFlowLabel(order?.kitchen_flow)} />
        </SectionCard>
      </Box>

      <SectionCard title="Productos">
        <ProductsList products={order?.products} />

        {order?.products?.length ? (
          <>
            <Divider />

            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: "text.primary" }}>
                Total del pedido
              </Typography>

              <Typography sx={{ fontSize: 18, fontWeight: 800, color: "primary.main" }}>
                {formatCurrency(order?.total)}
              </Typography>
            </Stack>
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Cancelaciones">
        <CancellationHistory rows={order?.cancellation_history} />
      </SectionCard>

      <SectionCard title="Historial">
        <StatusHistory rows={order?.status_history} />
      </SectionCard>
    </Stack>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card sx={cardSx}>
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          height: "100%",
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        <Stack spacing={2}>
          <Typography sx={{ fontSize: 19, fontWeight: 800, color: "text.primary" }}>
            {title}
          </Typography>

          <Divider />

          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ label, value }) {
  return (
    <Box
      sx={{
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        bgcolor: "background.default",
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "text.secondary",
          textTransform: "uppercase",
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Typography>

      <Typography sx={{ mt: 0.5, fontSize: 14, fontWeight: 800, color: "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}

function InfoRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: strong ? 800 : 700,
          color: strong ? "text.primary" : "text.secondary",
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          maxWidth: "65%",
          fontSize: strong ? 16 : 13,
          fontWeight: 800,
          color: strong ? "primary.main" : "text.primary",
          textAlign: "right",
          wordBreak: "break-word",
        }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

function InfoBlock({ label, value }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
        {label}
      </Typography>

      <Typography
        sx={{
          mt: 0.5,
          fontSize: 14,
          color: "text.primary",
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function ProductsList({ products }) {
  const rows = Array.isArray(products) ? products : [];

  if (rows.length === 0) {
    return (
      <Alert severity="info" variant="outlined">
        No hay productos disponibles para mostrar.
      </Alert>
    );
  }

  return (
    <Stack spacing={1.25}>
      {rows.map((item, index) => (
        <ProductRow key={item?.id || item?.order_item_id || `product:${index}`} item={item} />
      ))}
    </Stack>
  );
}

function ProductRow({
  item,
  level = 0,
  hideStageLabel = false,
}) {

  const isMenuSetRoot =
    item?.is_menu_set_root === true ||
    String(item?.commercial_type || "") === "menu_set" ||
    String(item?.item_kind || "") === "menu_set";

  /*
   * Resolver el nombre utilizando los snapshots
   * que proporciona el Backend.
   */
  const name =
    item?.display_name ||
    (isMenuSetRoot ? item?.menu_set_name_snapshot : null) ||
    item?.product_name ||
    item?.name ||
    "Producto";

  const variant = item?.variant_name || "";

  const quantity = Number(item?.quantity ?? 1);

  const originalQuantity = Number(
    item?.original_quantity ?? quantity
  );

  const cancelledQuantity = Number(
    item?.cancelled_quantity ?? 0
  );

  const effectiveQuantity = Number(
    item?.effective_quantity ?? quantity
  );

  const hasCancellation = cancelledQuantity > 0;

  const isPreparedReuse =
    String(item?.fulfillment_source || "") === "prepared_reuse";

  /*
   * Importe comercial existente.
   */
  const total =
    item?.net_line_total ??
    item?.line_total ??
    item?.total ??
    item?.subtotal;

  /*
   * Componentes físicos o comerciales.
   */
  const children = getProductChildren(item);

  /*
   * Las etapas solamente se utilizan para
   * las raíces comerciales de Conjuntos.
   *
   * Cada etapa ya contiene sus productos.
   * No debemos duplicarlos recorriendo
   * también children.
   */
  const stages = (
    isMenuSetRoot && Array.isArray(item?.stages)
      ? item.stages
      : []
  ).filter((stage) => {
    return (
      Array.isArray(stage?.items) &&
      stage.items.length > 0
    );
  });

  const hasStages = stages.length > 0;

  const hasExpandableContent =
    hasStages || children.length > 0;

  /*
   * Estado exclusivamente visual.
   */
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    setExpanded((previous) => !previous);
  };

  /*
   * Cantidad de componentes disponibles.
   */
  const componentsCount = hasStages
    ? stages.reduce((totalCount, stage) => {
        return totalCount + stage.items.length;
      }, 0)
    : children.length;

  /*
   * Información opcional.
   */
  const notes =
    typeof item?.notes === "string"
      ? item.notes.trim()
      : "";

  const modifierGroups = Array.isArray(
    item?.modifier_groups_display
  )
    ? item.modifier_groups_display
    : [];

  const rawModifiers = Array.isArray(item?.modifiers)
    ? item.modifiers
    : [];

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        p: level > 0 ? 1.15 : 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        backgroundColor:
          level > 0
            ? "background.paper"
            : "background.default",
      }}
    >
      <Stack spacing={1}>
        {/* Encabezado del producto */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.25}
        >
          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: level > 0 ? 13 : 14,
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.35,
                overflowWrap: "anywhere",
              }}
            >
              {name}
            </Typography>

            {/* Identificación del Conjunto */}
            {isMenuSetRoot ? (
              <Chip
                label="Conjunto"
                size="small"
                sx={{
                  mt: 0.65,
                  height: 23,
                  fontSize: 11,
                  fontWeight: 800,
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: "divider",
                  backgroundColor: "background.paper",
                }}
              />
            ) : null}

            {/* Etapa cuando viene en un componente individual */}
            {level > 0 &&
            !hideStageLabel &&
            item?.menu_set_stage_name_snapshot ? (
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              >
                Etapa: {item.menu_set_stage_name_snapshot}
              </Typography>
            ) : null}

            {/* Variante */}
            {variant ? (
              <Typography
                sx={{
                  mt: 0.35,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                {variant}
              </Typography>
            ) : null}

            {/* Preparación rápida */}
            {isPreparedReuse ? (
              <Chip
                label="Preparación rápida"
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  mt: 0.65,
                  height: 23,
                  fontSize: 11,
                  fontWeight: 800,
                }}
              />
            ) : null}

            {/* Cantidades */}
            {hasCancellation ? (
              <Stack
                spacing={0.2}
                sx={{
                  mt: 0.6,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.secondary",
                  }}
                >
                  Cantidad original: {originalQuantity}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "error.main",
                    fontWeight: 700,
                  }}
                >
                  Cancelada: {cancelledQuantity}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "text.primary",
                    fontWeight: 800,
                  }}
                >
                  Cantidad efectiva: {effectiveQuantity}
                </Typography>
              </Stack>
            ) : (
              <Typography
                sx={{
                  mt: 0.4,
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                Cantidad: {effectiveQuantity}
              </Typography>
            )}

            {/* Resumen compacto */}
            {hasExpandableContent && !expanded ? (
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "text.secondary",
                }}
              >
                {componentsCount}{" "}
                {componentsCount === 1
                  ? "producto incluido"
                  : "productos incluidos"}

                {hasStages
                  ? ` · ${stages.length} ${
                      stages.length === 1
                        ? "etapa"
                        : "etapas"
                    }`
                  : ""}
              </Typography>
            ) : null}
          </Box>

          {/* Precio y desplegable */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              flexShrink: 0,
            }}
          >
            {total !== undefined && total !== null ? (
              <Typography
                sx={{
                  fontSize: level > 0 ? 13 : 14,
                  fontWeight: 800,
                  color: "text.primary",
                  whiteSpace: "nowrap",
                }}
              >
                {formatCurrency(total)}
              </Typography>
            ) : null}

            {hasExpandableContent ? (
              <IconButton
                type="button"
                size="small"
                onClick={handleToggle}
                aria-label={
                  expanded
                    ? `Contraer componentes de ${name}`
                    : `Expandir componentes de ${name}`
                }
                aria-expanded={expanded}
                sx={{
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  backgroundColor: "background.paper",
                  color: "primary.main",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {expanded ? (
                  <ExpandLessRoundedIcon fontSize="small" />
                ) : (
                  <ExpandMoreRoundedIcon fontSize="small" />
                )}
              </IconButton>
            ) : null}
          </Stack>
        </Stack>

        {/* Notas del producto */}
        {notes ? (
          <Box
            sx={{
              px: 1,
              py: 0.75,
              borderLeft: "2px solid",
              borderColor: "divider",
              backgroundColor: "background.paper",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
              }}
            >
              Nota: {notes}
            </Typography>
          </Box>
        ) : null}

        {/* Modificadores agrupados */}
        {modifierGroups.length > 0 ? (
          <Stack spacing={0.5}>
            {modifierGroups.map((group, groupIndex) => {
              const options = Array.isArray(group?.options)
                ? group.options
                : [];

              return (
                <Box key={`modifier-group:${groupIndex}`}>
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      fontWeight: 800,
                      color: "text.secondary",
                    }}
                  >
                    {group?.group_name || "Extras"}
                  </Typography>

                  {options.map((option, optionIndex) => (
                    <Typography
                      key={`modifier-option:${optionIndex}`}
                      sx={{
                        mt: 0.25,
                        fontSize: 12,
                        color: "text.secondary",
                      }}
                    >
                      + {Number(option?.quantity ?? 1)} ×{" "}
                      {option?.name ||
                        option?.name_snapshot ||
                        "Modificador"}
                    </Typography>
                  ))}
                </Box>
              );
            })}
          </Stack>
        ) : rawModifiers.length > 0 ? (
          <Stack spacing={0.3}>
            {rawModifiers.map((modifier, index) => (
              <Typography
                key={`modifier:${modifier?.id || index}`}
                sx={{
                  fontSize: 12,
                  color: "text.secondary",
                }}
              >
                + {Number(modifier?.quantity ?? 1)} ×{" "}
                {modifier?.name_snapshot ||
                  modifier?.name ||
                  "Modificador"}
              </Typography>
            ))}
          </Stack>
        ) : null}

        {/* Contenido desplegable */}
        {hasExpandableContent ? (
          <Collapse
            in={expanded}
            timeout={180}
            unmountOnExit
          >
            <Box
              sx={{
                mt: 1.25,
                pt: 1.25,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              {hasStages ? (
                /*
                 * CONJUNTOS:
                 * Mostrar los productos agrupados por etapa.
                 */
                <Stack spacing={1.25}>
                  {stages.map((stage, stageIndex) => {
                    const stageItems = Array.isArray(
                      stage?.items
                    )
                      ? stage.items
                      : [];

                    const stageName =
                      stage?.menu_set_stage_name_snapshot ||
                      `Etapa ${stageIndex + 1}`;

                    return (
                      <Box
                        key={
                          stage?.menu_set_stage_definition_id ||
                          `stage:${stageIndex}`
                        }
                        sx={{
                          minWidth: 0,
                          p: { xs: 1, sm: 1.25 },
                          border: "1px solid",
                          borderColor: "divider",
                          borderLeft: "3px solid",
                          borderLeftColor: "primary.main",
                          borderRadius: 1,
                          backgroundColor: "background.paper",
                        }}
                      >
                        <Typography
                          sx={{
                            mb: 0.85,
                            fontSize: 12,
                            fontWeight: 900,
                            color: "text.primary",
                            textTransform: "uppercase",
                            letterSpacing: 0.3,
                          }}
                        >
                          {stageName}
                        </Typography>

                        <Stack spacing={0.75}>
                          {stageItems.map((stageItem, index) => (
                            <ProductRow
                              key={
                                stageItem?.id ||
                                `stage-item:${index}`
                              }
                              item={stageItem}
                              level={level + 1}
                              hideStageLabel
                            />
                          ))}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              ) : (
                /*
                 * PRODUCTOS COMPUESTOS:
                 * Mostrar los componentes normalmente,
                 * conservando cualquier nivel anidado.
                 */
                <Stack spacing={0.75}>
                  {children.map((child, index) => (
                    <ProductRow
                      key={
                        child?.id ||
                        child?.order_item_id ||
                        `component:${index}`
                      }
                      item={child}
                      level={level + 1}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Collapse>
        ) : null}
      </Stack>
    </Box>
  );
}

function DestinationSnapshot({ snapshot }) {
  const values = extractDestinationValues(snapshot);

  if (values.length === 0) return null;

  return (
    <>
      <Divider />

      <Box>
        <Typography sx={{ mb: 0.75, fontSize: 12, fontWeight: 800, color: "text.secondary" }}>
          Destino
        </Typography>

        <Stack spacing={0.35}>
          {values.map((value, index) => (
            <Typography
              key={`${value}:${index}`}
              sx={{ fontSize: 13, color: "text.primary", wordBreak: "break-word" }}
            >
              {value}
            </Typography>
          ))}
        </Stack>
      </Box>
    </>
  );
}

function CancellationHistory({ rows }) {
  const history = Array.isArray(rows) ? rows : [];

  if (history.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        No hay cancelaciones aplicadas.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {history.map((row, index) => (
        <Box
          key={row?.id || `cancellation:${index}`}
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.default",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
                {cancellationTypeLabel(row?.type)}
              </Typography>

              <Typography sx={{ mt: 0.3, fontSize: 12, color: "text.secondary" }}>
                {cancellationReasonLabel(row?.reason_code)}
              </Typography>

              <Typography sx={{ mt: 0.3, fontSize: 12, fontWeight: 700, color: "text.secondary" }}>
                {cancelledQuantityLabel(row?.cancelled_quantity)}
              </Typography>

              {row?.reason_note ? (
                <Typography sx={{ mt: 0.6, fontSize: 12, color: "text.secondary", lineHeight: 1.5, fontStyle: "italic" }}>
                  “{row.reason_note}”
                </Typography>
              ) : null}
            </Box>

            <Typography sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
              {formatDateTime(row?.resolved_at)}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function cancellationTypeLabel(type) {
  const labels = {
    full: "Cancelación total",
    partial: "Cancelación parcial",
  };

  return labels[String(type || "").toLowerCase()] || "Cancelación";
}

function cancelledQuantityLabel(value) {
  const quantity = Number(value || 0);
  return quantity === 1 ? "1 unidad cancelada" : `${quantity} unidades canceladas`;
}

function StatusHistory({ rows }) {
  const history = Array.isArray(rows) ? rows : [];

  if (history.length === 0) {
    return (
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        Todavía no hay movimientos registrados.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {history.map((row, index) => (
        <Box
          key={`history:${index}:${row?.created_at || ""}`}
          sx={{
            p: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            bgcolor: "background.default",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
                {onlineOrderStatusLabel(row?.to_status)}
              </Typography>

              <Typography sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>
                Realizado por {actorLabel(row?.actor_type)}
              </Typography>

              {row?.reason ? (
                <Typography sx={{ mt: 0.5, fontSize: 12, color: "text.secondary", lineHeight: 1.5 }}>
                  {row.reason}
                </Typography>
              ) : null}
            </Box>

            <Typography sx={{ fontSize: 12, color: "text.secondary", whiteSpace: "nowrap" }}>
              {formatDateTime(row?.created_at)}
            </Typography>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function getProductChildren(item) {
  const children = Array.isArray(item?.children)
    ? item.children
    : [];

  if (children.length > 0) {
    return children;
  }

  const components = Array.isArray(item?.components)
    ? item.components
    : [];

  return components;
}

function extractDestinationValues(snapshot) {
  if (!snapshot) return [];

  if (typeof snapshot === "string") {
    const value = translateDestinationValue(snapshot.trim());
    return value ? [value] : [];
  }

  if (typeof snapshot !== "object" || Array.isArray(snapshot)) return [];

  const ignoredKeys = new Set([
    "id",
    "type",
    "code",
    "fulfillment_id",
    "delivery_concept_id",
    "scheduled_point_id",
    "time_block_id",
  ]);

  const values = [];

  const visit = (value, key = "") => {
    if (ignoredKeys.has(key)) return;

    if (typeof value === "string") {
      const clean = translateDestinationValue(value.trim());
      if (clean) values.push(clean);
      return;
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      values.push(String(value));
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((row) => visit(row));
      return;
    }

    if (value && typeof value === "object") {
      Object.entries(value).forEach(([childKey, childValue]) => visit(childValue, childKey));
    }
  };

  visit(snapshot);

  return Array.from(new Set(values));
}

function translateDestinationValue(value) {
  const clean = String(value || "").trim();
  const normalized = clean.toLowerCase();

  const translations = {
    pickup: "Recoger en sucursal",
    home_delivery: "Entrega a domicilio",
    internal_location: "Entrega en ubicación interna",
    scheduled_point: "Punto programado",
    asap: "Lo antes posible",
    scheduled: "Programado",
  };

  return translations[normalized] || clean;
}

const cardSx = {
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1,
  boxShadow: "none",
  backgroundColor: "background.paper",
};