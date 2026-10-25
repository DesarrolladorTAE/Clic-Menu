//src/components/menu/shared/menu-sets/MenuSetCartDetail.jsx
//Detalle expandible del Conjunto dentro del carrito e historial.                                                  |
import React, { useMemo, useState } from "react";
import { alpha, useTheme } from "@mui/material/styles";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import RestaurantMenuRoundedIcon from "@mui/icons-material/RestaurantMenuRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { PillButton } from "../../../../pages/public/publicMenu.ui";
import { money } from "../../../../hooks/public/publicMenu.utils";
import { isMenuSetCartLine } from "../../../../hooks/menu/menu-sets/menuSetPayload.utils";

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function getStageId(stage) {
  return positiveId(stage?.stageDefinitionId ?? stage?.menu_set_stage_definition_id);
}

function getOptionId(option) {
  return positiveId(option?.menuSetProductId ?? option?.menu_set_product_id ?? option?.option_id ?? option?.id);
}

function findStage(menuSet, stageId) {
  return asArray(menuSet?.stages).find((stage) => getStageId(stage) === positiveId(stageId));
}

function findOption(stage, optionId) {
  return asArray(stage?.options).find((option) => getOptionId(option) === positiveId(optionId));
}

function buildStageGroups(item, menuSet) {
  const historicStages = asArray(item?.stages);

  if (historicStages.length > 0) {
    return historicStages.map((stage, index) => {
      const stageId = getStageId(stage);
      const catalogStage = findStage(menuSet, stageId);

      return {
        id: stageId || index,
        name: stage.menu_set_stage_name_snapshot || stage.name
          || catalogStage?.name || `Etapa ${index + 1}`,
        items: asArray(stage.items).map((row) => ({
          ...row,
          __option: findOption(catalogStage, row?.menu_set_product_id),
        })),
      };
    });
  }

  const selections = asArray(item?.selections);

  if (selections.length > 0) {
    return selections.map((stage, index) => {
      const stageId = getStageId(stage);
      const catalogStage = findStage(menuSet, stageId);

      return {
        id: stageId || index,
        name: catalogStage?.name || `Etapa ${index + 1}`,
        items: asArray(stage.items).map((row) => ({
          ...row,
          __option: findOption(catalogStage, row?.menu_set_product_id),
        })),
      };
    });
  }

  const children = asArray(item?.children);
  const groups = new Map();

  children.forEach((child) => {
    const stageId = positiveId(child?.menu_set_stage_definition_id);
    const key = stageId || "sin-etapa";

    if (!groups.has(key)) {
      groups.set(key, {
        id: key,
        name: child?.menu_set_stage_name_snapshot || "Productos del Conjunto",
        items: [],
      });
    }

    groups.get(key).items.push(child);
  });

  return Array.from(groups.values());
}

function getItemName(item) {
  const option = item?.__option;
  const base = String(
    item?.display_name || item?.product_name || item?.name
    || option?.name || "Producto seleccionado",
  ).trim();

  if (item?.display_name || !item?.variant_name) return base;
  return `${base} · ${item.variant_name}`;
}

function getVariantLabel(item) {
  if (item?.variant_name) return String(item.variant_name);

  const variantId = positiveId(item?.variant_id ?? item?.variantId);
  if (!variantId) return "";

  const variant = asArray(item?.__option?.variants).find(
    (row) => positiveId(row?.id) === variantId,
  );

  return variant?.display_name || variant?.name || "Variante seleccionada";
}

function getComponentName(component, definitions = []) {
  if (component?.display_name || component?.product_name) {
    return String(component.display_name || component.product_name);
  }

  const componentId = positiveId(component?.component_product_id);
  const definition = asArray(definitions).find(
    (row) => positiveId(row?.component_product_id) === componentId,
  );

  return definition?.component_name || definition?.name
    || definition?.product?.name || "Componente seleccionado";
}

function ModifierDetails({ item, option, muted }) {
  const savedGroups = asArray(item?.modifier_groups_display);
  const rawGroups = savedGroups.length > 0
    ? savedGroups
    : asArray(item?.modifiers);

  if (rawGroups.length === 0) return null;

  const availableGroups = [
    ...asArray(option?.modifierGroups),
    ...asArray(option?.variants).flatMap((variant) => asArray(variant?.modifier_groups)),
  ];

  return (
    <div style={{ display: "grid", gap: 5, marginTop: 7 }}>
      <strong style={{ fontSize: 11.5 }}>Extras</strong>

      {rawGroups.map((group, groupIndex) => {
        const definition = availableGroups.find(
          (row) => positiveId(row?.id) === positiveId(group?.modifier_group_id),
        );

        const groupName = group?.group_name || group?.group_name_snapshot
          || definition?.name || "Grupo de extras";

        const options = asArray(group?.options);

        return (
          <div key={`${group?.modifier_group_id || groupIndex}-${groupIndex}`} style={{ paddingLeft: 9 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: muted }}>{groupName}</div>

            {options.map((selected, index) => {
              const catalogOption = asArray(definition?.options).find(
                (row) => positiveId(row?.id) === positiveId(selected?.modifier_option_id),
              );

              const name = selected?.name || selected?.name_snapshot
                || catalogOption?.name || "Extra seleccionado";

              const quantity = Number(selected?.quantity || 1);

              return (
                <div key={`${selected?.modifier_option_id || index}-${index}`} style={{
                  fontSize: 11.5, color: muted, lineHeight: 1.5,
                }}>
                  • {name}{quantity > 1 ? ` × ${quantity}` : ""}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function ComponentTree({ components, definitions = [], muted, depth = 0 }) {
  if (depth >= 12 || asArray(components).length === 0) return null;

  return (
    <div style={{ display: "grid", gap: 6, marginTop: 7, paddingLeft: depth > 0 ? 10 : 0 }}>
      {components.map((component, index) => {
        const name = getComponentName(component, definitions);
        const componentId = positiveId(component?.component_product_id);
        const definition = asArray(definitions).find(
          (row) => positiveId(row?.component_product_id) === componentId,
        );

        const nestedDefinitions = definition?.composite?.items
          || definition?.product?.composite?.items || [];

        const quantity = Number(component?.effective_quantity ?? component?.quantity ?? 1);
        const variantName = component?.variant_name || "";

        return (
          <div key={`${component?.id || componentId || index}-${index}`} style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: muted, lineHeight: 1.5 }}>
              • {name}{variantName ? ` · ${variantName}` : ""} · {quantity} {quantity === 1 ? "unidad" : "unidades"}
            </div>

            <ModifierDetails item={component} muted={muted} />

            <ComponentTree
              components={asArray(component?.children).length > 0
                ? component.children : component?.components}
              definitions={nestedDefinitions}
              muted={muted}
              depth={depth + 1}
            />
          </div>
        );
      })}
    </div>
  );
}

function ItemDetail({ item, theme, border }) {
  const muted = theme.palette.text.secondary;
  const option = item?.__option;
  const variantLabel = getVariantLabel(item);
  const components = asArray(item?.children).length > 0
    ? item.children : item?.components;

  const notes = typeof item?.notes === "string" ? item.notes.trim() : "";
  const isPrepared = positiveId(item?.prepared_item_id ?? item?.preparedItemId) !== null
    || item?.fulfillment_source === "prepared_reuse";

  const rawQuantity = Number(item?.effective_quantity ?? item?.quantity ?? 1);
  const quantity = Number.isFinite(rawQuantity) ? Math.max(0, rawQuantity) : 1;

  const compositeDefinitions = option?.composite?.items || [];
  const cancelled = item?.is_cancelled === true && quantity === 0;

  return (
    <div style={{
      display: "grid", gap: 7, padding: 11, minWidth: 0,
      border: `1px solid ${border}`, borderRadius: 10,
      background: theme.palette.background.paper,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontSize: 12.5, fontWeight: 900, minWidth: 0, lineHeight: 1.4 }}>
          {getItemName(item)}
        </div>
        <span style={{
          fontSize: 11, color: muted, fontWeight: 800,
          whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {quantity} {quantity === 1 ? "unidad" : "unidades"}
        </span>
      </div>

      {variantLabel && !item?.display_name && !item?.variant_name ? (
        <div style={{ color: muted, fontSize: 11.5 }}>
          Variante: {variantLabel}
        </div>
      ) : null}

      {isPrepared ? (
        <div style={{ color: muted, fontSize: 11.5 }}>Preparación rápida</div>
      ) : null}

      {cancelled ? (
        <div style={{ color: "#B42318", fontSize: 11.5, fontWeight: 900 }}>
          Producto cancelado
        </div>
      ) : null}

      <ModifierDetails item={item} option={option} muted={muted} />

      {asArray(components).length > 0 ? (
        <div style={{ borderTop: `1px solid ${border}`, paddingTop: 7 }}>
          <strong style={{ fontSize: 11.5 }}>Componentes</strong>
          <ComponentTree
            components={components}
            definitions={compositeDefinitions}
            muted={muted}
          />
        </div>
      ) : null}

      {notes ? (
        <div style={{
          whiteSpace: "pre-wrap", fontSize: 11.5,
          color: muted, lineHeight: 1.5,
        }}>
          Indicaciones: {notes}
        </div>
      ) : null}
    </div>
  );
}

export default function MenuSetCartDetail({
  item,
  menuSet = null,
  themeColor,
  defaultExpanded = false,
  onEdit,
  onRemove,
  readOnly = false,
}) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);

  const color = /^#[0-9A-Fa-f]{6}$/.test(String(themeColor || ""))
    ? themeColor : theme.palette.primary.main;

  const stages = useMemo(() => buildStageGroups(item, menuSet), [item, menuSet]);

  if (!item || !isMenuSetCartLine(item) || item?.is_menu_set_product === true) {
    return null;
  }

  const title = item?.menu_set_name_snapshot || item?.name
    || menuSet?.name || "Conjunto";

  const quantity = Number(item?.effective_quantity ?? item?.quantity ?? 1);
  const confirmed = item?.price_is_estimated !== true
    && (item?.is_menu_set_root === true || item?.commercial_type === "menu_set"
      && item?.net_line_total !== undefined);

  const rawPrice = confirmed
    ? item?.net_line_total ?? item?.unit_price
    : item?.unit_price ?? menuSet?.price;

  const price = rawPrice === null || rawPrice === undefined || rawPrice === ""
    ? null : Number(rawPrice);

  const hasPrice = price !== null && Number.isFinite(price) && price >= 0;
  const productCount = stages.reduce((sum, stage) => sum + stage.items.length, 0);
  const canEdit = !readOnly && typeof onEdit === "function";
  const canRemove = !readOnly && typeof onRemove === "function";

  const border = alpha(color, 0.19);

  return (
    <article style={{
      width: "100%", minWidth: 0, overflow: "hidden",
      border: `1px solid ${border}`, borderRadius: 12,
      background: theme.palette.background.paper,
      color: theme.palette.text.primary,
      boxSizing: "border-box",
    }}>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        style={{
          width: "100%", display: "flex", alignItems: "center",
          gap: 11, padding: 13, border: 0, cursor: "pointer",
          textAlign: "left", color: "inherit", font: "inherit",
          background: alpha(color, 0.045),
        }}
      >
        <span style={{
          width: 35, height: 35, flexShrink: 0, borderRadius: 10,
          display: "grid", placeItems: "center",
          background: alpha(color, 0.12), color,
        }}>
          <RestaurantMenuRoundedIcon sx={{ fontSize: 20 }} />
        </span>

        <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 5 }}>
          <strong style={{ fontSize: 13.5, lineHeight: 1.35 }}>
            {title}
          </strong>
          <span style={{ color: theme.palette.text.secondary, fontSize: 11.5 }}>
            {quantity} {quantity === 1 ? "Conjunto" : "Conjuntos"} ·{" "}
            {productCount} {productCount === 1 ? "producto" : "productos"}
          </span>
        </span>

        <span style={{ textAlign: "right", flexShrink: 0 }}>
          <strong style={{ display: "block", color, fontSize: 14 }}>
            {hasPrice ? money(price) : "Por confirmar"}
          </strong>
          <span style={{ display: "block", fontSize: 10.5, color: theme.palette.text.secondary }}>
            {confirmed ? "Confirmado" : "Aproximado"}
          </span>
        </span>

        {expanded
          ? <ExpandLessRoundedIcon sx={{ fontSize: 21, color }} />
          : <ExpandMoreRoundedIcon sx={{ fontSize: 21, color }} />}
      </button>

      {expanded ? (
        <div style={{ display: "grid", gap: 12, padding: 12 }}>
          {stages.length > 0 ? stages.map((stage, index) => (
            <section key={`${stage.id}-${index}`} style={{ display: "grid", gap: 8 }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", gap: 10,
                paddingBottom: 7, borderBottom: `1px solid ${border}`,
              }}>
                <strong style={{ fontSize: 12.5 }}>{stage.name}</strong>
                <span style={{ fontSize: 11, color: theme.palette.text.secondary }}>
                  {stage.items.length} {stage.items.length === 1 ? "elección" : "elecciones"}
                </span>
              </div>

              {stage.items.length > 0 ? stage.items.map((child, childIndex) => (
                <ItemDetail
                  key={`${child?.id || child?.menu_set_product_id || childIndex}-${childIndex}`}
                  item={child}
                  theme={theme}
                  border={border}
                />
              )) : (
                <div style={{ fontSize: 12, color: theme.palette.text.secondary }}>
                  Sin productos seleccionados.
                </div>
              )}
            </section>
          )) : (
            <div style={{ fontSize: 12, color: theme.palette.text.secondary }}>
              No hay detalles de productos disponibles.
            </div>
          )}

          {!confirmed ? (
            <div style={{
              padding: "9px 10px", border: `1px solid ${border}`,
              borderRadius: 9, background: alpha(color, 0.045),
              fontSize: 11.5, color: theme.palette.text.secondary, lineHeight: 1.5,
            }}>
              El precio final se confirmará al enviar el pedido. Los extras con costo
              se calculan junto con el Conjunto.
            </div>
          ) : null}

          {canEdit || canRemove ? (
            <div style={{
              display: "flex", justifyContent: "flex-end",
              gap: 8, flexWrap: "wrap",
              borderTop: `1px solid ${border}`, paddingTop: 11,
            }}>
              {canEdit ? (
                <PillButton tone="default" onClick={() => onEdit(item)}>
                  <EditRoundedIcon sx={{ fontSize: 15, mr: 0.5, verticalAlign: "middle" }} />
                  Modificar
                </PillButton>
              ) : null}

              {canRemove ? (
                <PillButton tone="danger" onClick={() => onRemove(item)}>
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 15, mr: 0.5, verticalAlign: "middle" }} />
                  Quitar
                </PillButton>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}