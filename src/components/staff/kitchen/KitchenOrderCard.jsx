import React, { useMemo } from "react";
import {
  badgeDark2,
  badgeOk2,
  badgeWarn2,
  btnAction,
  btnActionOk,
  btnNotifyReady,
  buildKitchenItemsView,
  chipModifier,
  compositeChildRow,
  compositeGroupBody,
  compositeGroupHeader,
  compositeGroupSub,
  compositeGroupTitle,
  compositeGroupWrap,
  consumptionBadgeAlready,
  consumptionBadgeApplied,
  consumptionBadgeNeutral,
  consumptionRow,
  emptyItemsBox,
  emptyItemsText,
  emptyItemsTitle,
  formatElapsed,
  formatWhen,
  groupItemModifiers,
  metaDot,
  modifierLabel,
  noticePendingPill,
  noticeSentPill,
  pill,
  prettyNotes,
  qtyDot,
  tItemStatus,
  tOrderStatus,
  ticketBadges,
  ticketBody,
  ticketCard,
  ticketCustomer,
  ticketFooter,
  ticketFooterLeft,
  ticketFooterRight,
  ticketFolioText,
  ticketHead,
  ticketHeadBottom,
  ticketHeadTop,
  ticketItemMeta,
  ticketItemName,
  ticketItemRow,
  ticketItemTop,
  ticketLeft,
  ticketMesaText,
  ticketMeta,
  ticketModifierGroupCard,
  ticketModifierGroupName,
  ticketModifierGroups,
  ticketModifiers,
  ticketModifiersBlock,
  ticketModifiersTitle,
  ticketNotes,
  ticketRight,
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
  const items = Array.isArray(order?.items) ? order.items : [];
  const createdAt = formatWhen(order?.created_at);

  const allReady = !!order?.all_ready || Number(order?.non_ready_count || 0) === 0;
  const orderStatusEs = tOrderStatus(order?.status);
  const canNotifyReady = !!order?.actions?.can_notify_ready;
  const readyNoticeSent = !!order?.ready_notice_sent;
  const hasVisibleItems = items.length > 0;
  const groupedView = useMemo(() => buildKitchenItemsView(items), [items]);

  const elapsed = formatElapsed(order?.created_at);

  return (
    <div style={ticketCard}>
      <div style={ticketHead}>
        <div style={{ minWidth: 0 }}>
          <div style={ticketHeadTop}>
            <div style={ticketMesaText}>
              Mesa: {order?.table_name || order?.table_id || "—"}
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
                title={`Estado interno: ${String(order?.status || "")}`}
              >
                {String(orderStatusEs || "—").toUpperCase()}
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
                  busy={busy}
                  itemBusyState={busyItemIds?.[entry?.item?.id] || null}
                  consumptionState={
                    itemConsumptionState?.[entry?.item?.id] || null
                  }
                />
              );
            }

            return (
              <CompositeGroupCard
                key={`composite-${entry?.parentId || idx}`}
                group={entry}
                onStart={onStart}
                onReady={onReady}
                busy={busy}
                busyItemIds={busyItemIds}
                itemConsumptionState={itemConsumptionState}
              />
            );
          })
        ) : readyNoticeSent ? (
          <div style={emptyItemsBox}>
            <div style={emptyItemsTitle}>Esperando confirmación del mesero</div>
            <div style={emptyItemsText}>
              Ya no hay ítems visibles en esta comanda, mas el aviso de{" "}
              <b>Pedido listo</b> sigue activo. La tarjeta permanecerá aquí
              hasta que el mesero lo marque como <b>Leído</b>.
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
            <span style={noticeSentPill}>Aviso enviado al mesero</span>
          ) : (
            <span style={noticePendingPill}>
              {allReady ? "Listo para avisar" : "Aún hay ítems pendientes"}
            </span>
          )}
        </div>

        <div style={ticketFooterRight}>
          <button
            style={btnNotifyReady(canNotifyReady && !busy && !notifying)}
            onClick={() => onNotifyReady(order)}
            disabled={busy || notifying || !canNotifyReady}
            title={
              canNotifyReady
                ? readyNoticeSent
                  ? "El aviso ya fue enviado. Si lo oprimes de nuevo, el sistema te lo confirmará."
                  : "Avisar al mesero que el pedido está listo"
                : "Aún hay pedidos pendientes"
            }
          >
            {notifying
              ? "Enviando aviso…"
              : readyNoticeSent
              ? "Pedido listo enviado"
              : "Pedido listo"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompositeGroupCard({
  group,
  onStart,
  onReady,
  busy,
  busyItemIds,
  itemConsumptionState,
}) {
  const items = Array.isArray(group?.items) ? group.items : [];
  if (!items.length) return null;

  return (
    <div style={compositeGroupWrap}>
      <div style={compositeGroupHeader}>
        <div style={compositeGroupTitle}>Producto compuesto</div>
        <div style={compositeGroupSub}>
          Agrupado por padre #{group?.parentId || "—"}
        </div>
      </div>

      <div style={compositeGroupBody}>
        {items.map((item) => (
          <div key={item.id} style={compositeChildRow}>
            <ItemRow
              item={item}
              onStart={onStart}
              onReady={onReady}
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

function ItemRow({
  item,
  onStart,
  onReady,
  busy,
  itemBusyState,
  consumptionState,
  compact = false,
}) {
  const st = String(item?.kitchen_status || "");
  const canStart = st === "queued";
  const canReady = st === "in_progress";

  const name = [
    item?.product_name || "Producto",
    item?.variant_name ? `(${item.variant_name})` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const notes = prettyNotes(item?.notes);
  const itemStatusEs = tItemStatus(st);
  const groupedModifiers = groupItemModifiers(item?.modifiers);

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
          <span style={qtyDot}>{item?.quantity ?? 1}</span>
          <div style={{ minWidth: 0 }}>
            <div style={ticketItemName} title={name}>
              {name}
            </div>

            {notes ? <div style={ticketNotes}>{notes}</div> : null}

            <div style={ticketItemMeta}>
              <span style={pill(st)} title={`Estado interno: ${st || ""}`}>
                {itemStatusEs}
              </span>

              {item?.kitchen_started_at ? (
                <span style={metaDot}>
                  Inició {formatWhen(item.kitchen_started_at)}
                </span>
              ) : null}

              {item?.kitchen_ready_at ? (
                <span style={metaDot}>
                  Listo {formatWhen(item.kitchen_ready_at)}
                </span>
              ) : null}
            </div>

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
        </div>

        {groupedModifiers.length ? (
          <div style={ticketModifiersBlock}>
            <div style={ticketModifiersTitle}>Modificadores</div>

            <div style={ticketModifierGroups}>
              {groupedModifiers.map((group) => (
                <div key={group.groupName} style={ticketModifierGroupCard}>
                  <div style={ticketModifierGroupName}>{group.groupName}</div>

                  <div style={ticketModifiers}>
                    {group.items.map((m) => (
                      <span key={m.id} style={chipModifier}>
                        {modifierLabel(m)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div style={ticketRight}>
        <button
          style={btnAction(canStart && !itemBusyState)}
          onClick={() => onStart(item)}
          disabled={!canStart || busy || !!itemBusyState}
          title={
            canStart
              ? "Marcar como en proceso"
              : "Solo se permite si está pendiente"
          }
        >
          {itemBusyState === "start" ? "Empezando…" : "Empezar"}
        </button>

        <button
          style={btnActionOk(canReady && !itemBusyState)}
          onClick={() => onReady(item)}
          disabled={!canReady || busy || !!itemBusyState}
          title={
            canReady
              ? "Marcar como listo"
              : "Solo se permite si está en proceso"
          }
        >
          {itemBusyState === "ready" ? "Marcando…" : "Listo"}
        </button>
      </div>
    </div>
  );
}
