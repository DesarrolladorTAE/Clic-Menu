import React, { useMemo, useState } from "react";
import { Badge, Button, IconButton, Stack, Tooltip } from "@mui/material";

import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import StickyNote2RoundedIcon from "@mui/icons-material/StickyNote2Rounded";

import KitchenItemDetailsDialog from "./KitchenItemDetailsDialog";
import {
  badgeDark2, badgeOk2, badgeWarn2,
  buildKitchenItemsView,
  compositeChildRow, compositeGroupBody, compositeGroupHeader,
  compositeGroupTitle, compositeGroupWrap,
  menuSetGroupWrap, menuSetGroupHeader, menuSetGroupTitle,
  menuSetStageWrap, menuSetStageTitle, menuSetStageBody,
  consumptionBadgeAlready, consumptionBadgeApplied, consumptionBadgeNeutral,
  consumptionRow, emptyItemsBox, emptyItemsText, emptyItemsTitle,
  formatElapsed, formatWhen, formatKitchenCompactWhen, getKitchenEffectiveQuantity,
  getPreparedReuseBadge, isKitchenItemEffective,
  metaDot, noticePendingPill, noticeSentPill, pill,
  preparedReusePill, preparedReuseRow, prettyNotes, qtyDot,
  tItemStatus, tOrderStatus, ticketBadges, ticketBody,
  ticketCard, ticketCustomer, ticketFooter, ticketFooterLeft,
  ticketFooterRight, ticketFolioText, ticketHead,
  ticketHeadBottom, ticketHeadTop, ticketItemMeta, ticketItemDates,
  ticketItemName, ticketItemRow, ticketItemTop,
  ticketLeft, ticketMesaText, ticketMeta, ticketRight,
  ticketTimePill,
} from "./kitchen.helpers";

export default function KitchenOrderCard({
  order,
  onStart,
  onReady,
  onNotifyReady,
  busy,
  notifying,
  busyItemIds,
  itemConsumptionState,
}) {
  const rawItems = Array.isArray(order?.items) ? order.items : [];
  const items = rawItems.filter(isKitchenItemEffective);
  const createdAt = formatWhen(order?.created_at);
  const hasVisibleItems = items.length > 0;

  const [selectedDetail, setSelectedDetail] = useState(null);

  const openDetails = (item, context = null) => {
    setSelectedDetail({ item, context });
  };

  const closeDetails = () => {
    setSelectedDetail(null);
  };

  const detailItem = selectedDetail?.item
    ? items.find((item) => Number(item.id) === Number(selectedDetail.item.id)) || selectedDetail.item
    : null;

  const allReady =
    typeof order?.all_ready === "boolean"
      ? order.all_ready
      : hasVisibleItems && Number(order?.non_ready_count || 0) === 0;

  const orderStatusEs = tOrderStatus(order?.status);
  const canNotifyReady = !!order?.actions?.can_notify_ready;
  const readyNoticeSent = !!order?.ready_notice_sent;
  const groupedView = useMemo(() => buildKitchenItemsView(order), [order]);

  const orderSource = String(order?.source || "").trim().toLowerCase();
  const isCashierDirect = orderSource === "cashier_direct";
  const isOnlineOrder = orderSource === "online_order";
  const sendsReadyToCashier = isCashierDirect || isOnlineOrder;

  const elapsed = formatElapsed(order?.created_at);

  return (
    <div style={ticketCard}>
      <div style={ticketHead}>
        <div style={{ minWidth: 0 }}>
          <div style={ticketHeadTop}>
            <div style={ticketMesaText}>
              {isOnlineOrder
                ? "Pedido en línea"
                : isCashierDirect
                ? "Caja"
                : `Mesa: ${order?.table_name || order?.table_id || "—"}`}
            </div>
            <div style={ticketTimePill}>{elapsed}</div>
          </div>

          <div style={ticketHeadBottom}>
            <div style={ticketFolioText}>
              Folio {order?.folio ?? order?.id ?? "—"}
            </div>
            <div style={ticketBadges}>
              <span style={allReady ? badgeOk2 : badgeWarn2}>
                {allReady ? "Listo" : "Preparando"}
              </span>
              <span
                style={badgeDark2}
                title={
                  isOnlineOrder
                    ? "Origen: Pedido en línea"
                    : `Estado interno: ${String(order?.status || "")}`
                }
              >
                {isOnlineOrder ? "PEDIDO EN LÍNEA" : String(orderStatusEs || "—").toUpperCase()}
              </span>
            </div>
          </div>

          {order?.customer_name ? (
            <div style={ticketCustomer}>{order.customer_name}</div>
          ) : null}

          {createdAt ? <div style={ticketMeta}>{createdAt}</div> : null}
        </div>
      </div>

      <div style={ticketBody}>
        {hasVisibleItems ? (
          groupedView.map((entry, idx) => {
            if (entry?.type === "single") {
              return (
                <ItemRow
                  key={`single-${entry?.item?.id || idx}`}
                  item={entry.item}
                  onStart={onStart}
                  onReady={onReady}
                  onShowDetails={openDetails}
                  busy={busy}
                  itemBusyState={busyItemIds?.[entry?.item?.id] || null}
                  consumptionState={itemConsumptionState?.[entry?.item?.id] || null}
                />
              );
            }

            if (entry?.type === "menu_set") {
              return (
                <MenuSetGroupCard
                  key={`menu-set-${entry.rootId}`}
                  group={entry}
                  onStart={onStart}
                  onReady={onReady}
                  onShowDetails={openDetails}
                  busy={busy}
                  busyItemIds={busyItemIds}
                  itemConsumptionState={itemConsumptionState}
                />
              );
            }

            return (
              <CompositeGroupCard
                key={`composite-${entry?.parentId || idx}`}
                group={entry}
                onStart={onStart}
                onReady={onReady}
                onShowDetails={openDetails}
                busy={busy}
                busyItemIds={busyItemIds}
                itemConsumptionState={itemConsumptionState}
              />
            );
          })
        ) : readyNoticeSent ? (
          <div style={emptyItemsBox}>
            <div style={emptyItemsTitle}>
              {sendsReadyToCashier
                ? "Esperando confirmación de caja"
                : "Esperando confirmación del mesero"}
            </div>
            <div style={emptyItemsText}>
              Ya no hay ítems visibles en esta comanda, mas el aviso de{" "}
              <b>Pedido listo</b> sigue activo. La tarjeta permanecerá aquí hasta que{" "}
              {sendsReadyToCashier ? "caja" : "el mesero"} lo marque como <b>Leído</b>.
            </div>
          </div>
        ) : (
          <div style={emptyItemsBox}>
            <div style={emptyItemsTitle}>Sin ítems visibles</div>
            <div style={emptyItemsText}>
              Esta comanda no tiene ítems visibles en este modo.
            </div>
          </div>
        )}
      </div>

      <div style={ticketFooter}>
        <div style={ticketFooterLeft}>
          {readyNoticeSent ? (
            <span style={noticeSentPill}>
              {sendsReadyToCashier ? "Aviso enviado a caja" : "Aviso enviado al mesero"}
            </span>
          ) : (
            <span style={noticePendingPill}>
              {allReady
                ? sendsReadyToCashier
                  ? "Listo para avisar a caja"
                  : "Listo para avisar al mesero"
                : "Aún hay ítems pendientes"}
            </span>
          )}
        </div>

        <div style={ticketFooterRight}>
          <Button
            type="button"
            variant="contained"
            color="primary"
            onClick={() => onNotifyReady(order)}
            disabled={busy || notifying || !canNotifyReady}
            title={
              canNotifyReady
                ? readyNoticeSent
                  ? "El aviso ya fue enviado."
                  : sendsReadyToCashier
                  ? "Avisar a caja que el pedido está listo"
                  : "Avisar al mesero que el pedido está listo"
                : "Aún hay pedidos pendientes"
            }
            sx={{ minWidth: 158, fontWeight: 800 }}
          >
            {notifying
              ? "Enviando aviso…"
              : readyNoticeSent
              ? sendsReadyToCashier
                ? "Aviso a caja enviado"
                : "Pedido listo enviado"
              : sendsReadyToCashier
              ? "Avisar a caja"
              : "Pedido listo"}
          </Button>
        </div>
      </div>

      <KitchenItemDetailsDialog
        open={Boolean(selectedDetail)}
        item={detailItem}
        context={selectedDetail?.context || null}
        onClose={closeDetails}
      />
    </div>
  );
}

function MenuSetGroupCard({
  group,
  onStart,
  onReady,
  onShowDetails,
  busy,
  busyItemIds,
  itemConsumptionState,
}) {
  const stages = Array.isArray(group?.stages) ? group.stages : [];
  if (!stages.length) {
    return null;
  }

  return (
    <div style={menuSetGroupWrap}>
      <div style={menuSetGroupHeader}>
        <div style={menuSetGroupTitle} title={group?.name || "Conjunto"}>
          CONJUNTO: {group?.name || "Conjunto"}
        </div>
      </div>

      {stages.map((stage, stageIndex) => (
        <div
          key={`${group.rootId}-${stage.stageId}`}
          style={{
            ...menuSetStageWrap,
            borderBottom: stageIndex === stages.length - 1 ? "none" : menuSetStageWrap.borderBottom,
          }}
        >
          <div style={menuSetStageTitle} title={stage?.name || "Etapa"}>
            ETAPA: {stage?.name || "Etapa"}
          </div>

          <div style={menuSetStageBody}>
            {(stage.entries || []).map((entry, entryIndex) => {
              if (entry.type === "single") {
                const item = entry.item;

                return (
                  <div
                    key={`set-item-${item.id}`}
                    style={{ borderTop: entryIndex > 0 ? "1px dashed #dbeafe" : "none" }}
                  >
                    <ItemRow
                      item={item}
                      onStart={onStart}
                      onReady={onReady}
                      onShowDetails={onShowDetails}
                      context={{ menuSetName: group?.name, stageName: stage?.name }}
                      busy={busy}
                      itemBusyState={busyItemIds?.[item.id] || null}
                      consumptionState={itemConsumptionState?.[item.id] || null}
                      compact
                    />
                  </div>
                );
              }

              return (
                <CompositeGroupCard
                  key={`set-composite-${entry.parentId}`}
                  group={entry}
                  onStart={onStart}
                  onReady={onReady}
                  onShowDetails={onShowDetails}
                  context={{ menuSetName: group?.name, stageName: stage?.name }}
                  busy={busy}
                  busyItemIds={busyItemIds}
                  itemConsumptionState={itemConsumptionState}
                  compact
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompositeGroupCard({
  group,
  onStart,
  onReady,
  onShowDetails,
  context = null,
  busy,
  busyItemIds,
  itemConsumptionState,
  compact = false,
}) {
  const items = Array.isArray(group?.items) ? group.items : [];
  if (!items.length) return null;

  const parent = group?.parent || null;
  const parentName = [
    parent?.product_name || "Producto compuesto",
    parent?.variant_name ? `(${parent.variant_name})` : "",
  ].filter(Boolean).join(" ");

  return (
    <div style={compact ? { ...compositeGroupWrap, marginTop: 5, borderRadius: 8 } : compositeGroupWrap}>
      <div style={compact ? { ...compositeGroupHeader, padding: "5px 8px" } : compositeGroupHeader}>
        <div style={compositeGroupTitle} title={parentName}>
          COMPUESTO: {parentName}
        </div>

        <ItemDetailsIcons item={parent} context={context} onShowDetails={onShowDetails} />
      </div>

      <div style={compact ? { ...compositeGroupBody, padding: "2px 8px 5px" } : compositeGroupBody}>
        {items.map((item, index) => (
          <div
            key={item.id}
            style={{
              ...compositeChildRow,
              borderTop: index === 0 ? "none" : compositeChildRow.borderTop,
            }}
          >
            <ItemRow
              item={item}
              onStart={onStart}
              onReady={onReady}
              onShowDetails={onShowDetails}
              context={context}
              busy={busy}
              itemBusyState={busyItemIds?.[item.id] || null}
              consumptionState={itemConsumptionState?.[item.id] || null}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ItemDetailsIcons({ item, context = null, onShowDetails }) {
  if (!item || !onShowDetails) return null;

  const modifierCount = Array.isArray(item?.modifiers) ? item.modifiers.length : 0;
  const notes = prettyNotes(item?.notes).trim();
  const hasNotes = Boolean(notes && notes !== "{}" && notes !== "[]");

  if (!modifierCount && !hasNotes) return null;

  return (
    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
      {modifierCount > 0 ? (
        <Tooltip title={`Ver modificadores (${modifierCount})`} arrow>
          <IconButton
            type="button"
            size="small"
            aria-label={`Ver ${modifierCount} modificadores del producto`}
            onClick={() => onShowDetails(item, context)}
            sx={{
              width: 38,
              height: 38,
              border: "1px solid #bfdbfe",
              borderRadius: 1.5,
              bgcolor: "#eff6ff",
              color: "#1d4ed8",
              "&:hover": { bgcolor: "#dbeafe" },
            }}
          >
            <Badge
              badgeContent={modifierCount}
              color="primary"
              max={99}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: 9,
                  minWidth: 17,
                  height: 17,
                  px: 0.4,
                  top: -2,
                  right: -4,
                },
              }}
            >
              <TuneRoundedIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Tooltip>
      ) : null}

      {hasNotes ? (
        <Tooltip title="Ver notas del producto" arrow>
          <IconButton
            type="button"
            size="small"
            aria-label="Ver notas del producto"
            onClick={() => onShowDetails(item, context)}
            sx={{
              width: 38,
              height: 38,
              border: "1px solid #fed7aa",
              borderRadius: 1.5,
              bgcolor: "#fff7ed",
              color: "#c2410c",
              "&:hover": { bgcolor: "#ffedd5" },
            }}
          >
            <StickyNote2RoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );
}

function ItemRow({
  item,
  onStart,
  onReady,
  onShowDetails,
  context = null,
  busy,
  itemBusyState,
  consumptionState,
  compact = false,
}) {
  if (!isKitchenItemEffective(item)) return null;

  const st = String(item?.kitchen_status || "");
  const canStart = st === "queued";
  const canReady = st === "in_progress";

  const name = [
    item?.product_name || "Producto",
    item?.variant_name ? `(${item.variant_name})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const itemStatusEs = tItemStatus(st);
  const effectiveQuantity = getKitchenEffectiveQuantity(item);
  const preparedReuseBadge = getPreparedReuseBadge(item);

  return (
    <div
      style={{
        ...ticketItemRow,
        borderTop: compact ? "none" : ticketItemRow.borderTop,
        padding: compact ? "6px 0" : ticketItemRow.padding,
      }}
    >
      <div style={ticketLeft}>
        <div style={ticketItemTop}>
          <span style={qtyDot}>{effectiveQuantity}</span>

          <div style={{ minWidth: 0 }}>
            <div style={ticketItemName} title={name}>
              {name}
            </div>

            {preparedReuseBadge ? (
              <div style={preparedReuseRow}>
                <span style={preparedReusePill}>{preparedReuseBadge}</span>
              </div>
            ) : null}
          </div>

          <ItemDetailsIcons item={item} context={context} onShowDetails={onShowDetails} />
        </div>

        <div style={ticketItemMeta}>
          <span style={pill(st)} title={`Estado interno: ${st || ""}`}>
            {itemStatusEs}
          </span>

          {consumptionState?.text ? (
            <div style={consumptionRow}>
              <span
                style={
                  consumptionState?.kind === "already"
                    ? consumptionBadgeAlready
                    : consumptionState?.kind === "neutral"
                    ? consumptionBadgeNeutral
                    : consumptionBadgeApplied
                }
              >
                {consumptionState.text}
              </span>
            </div>
          ) : null}
        </div>

        {item?.kitchen_started_at || item?.kitchen_ready_at ? (
          <div style={ticketItemDates}>
            {item?.kitchen_started_at ? (
              <span style={metaDot} title={`Inició ${formatWhen(item.kitchen_started_at)}`}>
                Inició {formatKitchenCompactWhen(item.kitchen_started_at)}
              </span>
            ) : null}

            {item?.kitchen_ready_at ? (
              <span style={metaDot} title={`Listo ${formatWhen(item.kitchen_ready_at)}`}>
                Listo {formatKitchenCompactWhen(item.kitchen_ready_at)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div style={ticketRight}>
        <Button
          type="button"
          variant="contained"
          color="secondary"
          onClick={() => onStart(item)}
          disabled={!canStart || busy || !!itemBusyState}
          title={canStart ? "Comenzar la preparación" : "Solo se permite si está pendiente"}
          sx={{
            width: "calc(50% - 3px)",
            minWidth: 0,
            minHeight: 40,
            px: { xs: 0.5, sm: 1 },
            fontSize: { xs: 12, sm: 13 },
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {itemBusyState === "start" ? "Empezando…" : "Empezar"}
        </Button>

        <Button
          type="button"
          variant="outlined"
          color="secondary"
          onClick={() => onReady(item)}
          disabled={!canReady || busy || !!itemBusyState}
          title={canReady ? "Marcar como listo" : "Solo se permite si está en preparación"}
          sx={{
            width: "calc(50% - 3px)",
            minWidth: 0,
            minHeight: 40,
            px: { xs: 0.5, sm: 1 },
            fontSize: { xs: 12, sm: 13 },
            fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {itemBusyState === "ready" ? "Marcando…" : "Listo"}
        </Button>
      </div>
    </div>
  );
}
