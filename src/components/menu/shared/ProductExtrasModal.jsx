import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  PillButton,
} from "../../../pages/public/publicMenu.ui";
import {
  buildModifierContextSections,
  buildModifierDisplayGroupsFromApiGroups,
  formatModifierGroupMeta,
  money,
} from "../../../hooks/public/publicMenu.utils";

function makeGroupSelectionKey(section, group) {
  const componentProductId = Number(section?.component?.component_product_id || 0);
  const componentVariantId = Number(section?.option?.variant_id || 0);
  const variantId = Number(section?.variant?.id || 0);

  return [
    section?.context_type || "product",
    Number(group?.id || 0),
    componentProductId || 0,
    componentVariantId || 0,
    variantId || 0,
  ].join("|");
}

function buildPreparedSections(product, sections) {
  const title = product?.display_name || product?.name || "Producto";

  return (Array.isArray(sections) ? sections : []).map((section) => {
    const contextSource =
      section?.context_type === "variant"
        ? "variant"
        : section?.context_type === "component"
        ? "component"
        : section?.context_type === "component_variant"
        ? "component_variant"
        : "product";

    const appliesToLevel =
      section?.context_type === "component" || section?.context_type === "component_variant"
        ? "composite_component"
        : "order_item";

    const contextLabel = section?.subtitle || title;

    const componentProductId =
      section?.context_type === "component" || section?.context_type === "component_variant"
        ? Number(section?.component?.component_product_id || 0) || null
        : null;

    const componentVariantId =
      section?.context_type === "component_variant"
        ? Number(section?.option?.variant_id || 0) || null
        : null;

    return {
      ...section,
      groups: (Array.isArray(section?.groups) ? section.groups : []).map((group) => ({
        ...group,
        __selection_key: makeGroupSelectionKey(section, group),
        __context_source: contextSource,
        __applies_to_level: appliesToLevel,
        __context_label: contextLabel,
        __component_product_id: componentProductId,
        __component_variant_id: componentVariantId,
      })),
    };
  });
}

function countDistinctSelectedOptions(selectedMapForGroup) {
  const values = Object.values(selectedMapForGroup || {});
  return values.filter((qty) => Number(qty || 0) > 0).length;
}

function countTotalSelectedUnits(selectedMapForGroup) {
  return Object.values(selectedMapForGroup || {}).reduce(
    (sum, qty) => sum + Number(qty || 0),
    0,
  );
}

function buildInitialSelectionMap(initialValue, preparedSections) {
  const groups = Array.isArray(initialValue) ? initialValue : [];
  const map = {};

  const allPreparedGroups = preparedSections.flatMap((section) => section.groups || []);

  allPreparedGroups.forEach((pg) => {
    const match = groups.find((g) => {
      return (
        Number(g?.modifier_group_id || g?.id || 0) === Number(pg?.id || 0) &&
        String(g?.applies_to_level || "order_item") ===
          String(pg?.__applies_to_level || "order_item") &&
        Number(g?.component_product_id || 0) ===
          Number(pg?.__component_product_id || 0) &&
        Number(g?.component_variant_id || 0) ===
          Number(pg?.__component_variant_id || 0)
      );
    });

    if (!match) return;

    const optMap = {};
    (Array.isArray(match?.options) ? match.options : []).forEach((opt) => {
      const optionId = Number(opt?.modifier_option_id || opt?.id || 0);
      const qty = Number(opt?.quantity || 0);
      if (optionId > 0 && qty > 0) {
        optMap[optionId] = qty;
      }
    });

    if (Object.keys(optMap).length > 0) {
      map[pg.__selection_key] = optMap;
    }
  });

  return map;
}

function normalizeSelectionForResult(preparedSections, selectionMap) {
  const allPreparedGroups = preparedSections.flatMap((section) => section.groups || []);
  const normalized = [];

  allPreparedGroups.forEach((group) => {
    const selected = selectionMap?.[group.__selection_key] || {};
    const options = Array.isArray(group?.options) ? group.options : [];

    const normalizedOptions = options
      .map((opt) => {
        const optionId = Number(opt?.id || 0);
        const qty = Number(selected?.[optionId] || 0);
        if (!optionId || qty <= 0) return null;

        const unitPrice = Number(opt?.price || 0);
        const affectsTotal = !!opt?.affects_total;
        const totalPrice = affectsTotal ? unitPrice * qty : 0;

        return {
          id: optionId,
          modifier_group_id: Number(group?.id || 0),
          modifier_option_id: optionId,
          name: String(opt?.name || "Extra"),
          name_snapshot: String(opt?.name || "Extra"),
          quantity: qty,
          unit_price: unitPrice,
          total_price: Math.round(totalPrice * 100) / 100,
          affects_total: affectsTotal,
          description_snapshot: opt?.description || null,
          meta: {
            track_inventory: !!opt?.track_inventory,
            is_default: !!opt?.is_default,
            max_quantity_per_selection: Number(opt?.max_quantity_per_selection || 1),
          },
        };
      })
      .filter(Boolean);

    if (!normalizedOptions.length) return;

    normalized.push({
      id: Number(group?.id || 0),
      modifier_group_id: Number(group?.id || 0),
      applies_to_level: String(group?.__applies_to_level || "order_item"),
      component_product_id: group?.__component_product_id || null,
      component_variant_id: group?.__component_variant_id || null,
      group_name_snapshot: String(group?.name || "Extras"),
      context_source: String(group?.__context_source || "product"),
      context_label: String(group?.__context_label || ""),
      group_description_snapshot: group?.description || null,
      selection_mode: String(group?.selection_mode || ""),
      is_required: !!group?.is_required,
      min_select: Number(group?.min_select || 0),
      max_select:
        group?.max_select == null || group?.max_select === ""
          ? null
          : Number(group.max_select),
      options: normalizedOptions,
    });
  });

  const parentModifiers = normalized.filter(
    (g) => String(g.applies_to_level) === "order_item",
  );

  const componentModifiers = normalized.filter(
    (g) => String(g.applies_to_level) === "composite_component",
  );

  return {
    parentModifiers,
    componentModifiers,
    parentDisplayGroups: buildModifierDisplayGroupsFromApiGroups(parentModifiers),
    componentDisplayGroups: buildModifierDisplayGroupsFromApiGroups(componentModifiers),
    total: Math.round(
      normalized.reduce((acc, g) => {
        const groupTotal = (Array.isArray(g.options) ? g.options : []).reduce(
          (sum, opt) => sum + Number(opt?.total_price || 0),
          0,
        );
        return acc + groupTotal;
      }, 0) * 100,
    ) / 100,
  };
}

function validatePreparedSections(preparedSections, selectionMap) {
  const errors = [];

  preparedSections.forEach((section) => {
    (Array.isArray(section?.groups) ? section.groups : []).forEach((group) => {
      const selected = selectionMap?.[group.__selection_key] || {};
      const distinctCount = countDistinctSelectedOptions(selected);

      const min = Number(group?.min_select || 0);
      const max =
        group?.max_select == null || group?.max_select === ""
          ? null
          : Number(group.max_select);

      if (group?.is_required && distinctCount <= 0) {
        errors.push(`Debes seleccionar al menos una opción en "${group?.name}".`);
        return;
      }

      if (min > 0 && distinctCount < min) {
        errors.push(
          `El grupo "${group?.name}" requiere mínimo ${min} opción(es) diferente(s).`,
        );
      }

      if (max !== null && distinctCount > max) {
        errors.push(
          `El grupo "${group?.name}" permite máximo ${max} opción(es) diferente(s).`,
        );
      }
    });
  });

  return errors;
}

function OptionRow({
  group,
  option,
  selectedQty,
  readOnly,
  onSelectOption,
  onIncrementQty,
  onDecrementQty,
  onRemoveOption,
}) {
  const affectsPrice = !!option?.affects_total;
  const price = Number(option?.price || 0);
  const maxPerSelection = Number(option?.max_quantity_per_selection || 1);

  return (
    <div
      style={{
        display: "grid",
        gap: 8,
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: selectedQty > 0 ? "#fff7ed" : "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 13 }}>
            {option?.name || "Opción"}
          </div>

          {option?.description ? (
            <div style={{ fontSize: 12, opacity: 0.76, marginTop: 2 }}>
              {option.description}
            </div>
          ) : null}

          <div style={{ fontSize: 12, opacity: 0.72, marginTop: 4 }}>
            {affectsPrice ? `Ajuste: ${money(price)}` : "Sin ajuste al total"}
            {maxPerSelection > 1 ? ` · Máx. por selección: ${maxPerSelection}` : ""}
            {option?.is_default ? " · Sugerido por defecto" : ""}
          </div>
        </div>

        {readOnly ? (
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              opacity: 0.72,
              alignSelf: "center",
            }}
          >
            {selectedQty > 0 ? `Seleccionado (${selectedQty})` : "Solo vista"}
          </div>
        ) : selectedQty > 0 ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "inline-flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
              <PillButton
                tone="default"
                onClick={() => onDecrementQty?.(group, option)}
                disabled={selectedQty <= 0}
                title="Restar"
              >
                −
              </PillButton>

              <div style={{ minWidth: 28, textAlign: "center", fontWeight: 900 }}>
                {selectedQty}
              </div>

              <PillButton
                tone="soft"
                onClick={() => onIncrementQty?.(group, option)}
                disabled={selectedQty >= maxPerSelection}
                title="Sumar"
              >
                +
              </PillButton>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <PillButton
                tone="soft"
                onClick={() => onRemoveOption?.(group, option)}
                title="Quitar opción"
              >
                Quitar
              </PillButton>
            </div>
          </div>
        ) : (
          <PillButton
            tone="soft"
            onClick={() => onSelectOption?.(group, option)}
            title="Seleccionar"
          >
            Seleccionar
          </PillButton>
        )}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  readOnly,
  selectedMap,
  onSelectOption,
  onIncrementQty,
  onDecrementQty,
  onRemoveOption,
}) {
  const options = Array.isArray(group?.options) ? group.options : [];
  const distinctCount = countDistinctSelectedOptions(selectedMap?.[group.__selection_key] || {});

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: "12px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "#fff",
      }}
    >
      <div>
        <div style={{ fontWeight: 950, fontSize: 14 }}>
          {group?.name || "Grupo de extras"}
        </div>

        {group?.description ? (
          <div style={{ fontSize: 12, opacity: 0.78, marginTop: 3 }}>
            {group.description}
          </div>
        ) : null}

        <div style={{ fontSize: 12, opacity: 0.74, marginTop: 5 }}>
          {formatModifierGroupMeta(group)}
        </div>

        {!readOnly ? (
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
            Opciones elegidas: {distinctCount}
          </div>
        ) : null}
      </div>

      {options.length > 0 ? (
        <div style={{ display: "grid", gap: 8 }}>
          {options.map((option) => {
            const selectedQty = Number(
              selectedMap?.[group.__selection_key]?.[Number(option?.id || 0)] || 0,
            );

            return (
              <OptionRow
                key={option?.id}
                group={group}
                option={option}
                selectedQty={selectedQty}
                readOnly={readOnly}
                onSelectOption={onSelectOption}
                onIncrementQty={onIncrementQty}
                onDecrementQty={onDecrementQty}
                onRemoveOption={onRemoveOption}
              />
            );
          })}
        </div>
      ) : (
        <div
          style={{
            fontSize: 12,
            opacity: 0.7,
            padding: "10px 12px",
            borderRadius: 12,
            background: "#fafafa",
            border: "1px dashed rgba(0,0,0,0.12)",
          }}
        >
          Este grupo no tiene opciones visibles en este contexto.
        </div>
      )}
    </div>
  );
}

export default function ProductExtrasModal({
  open,
  product,
  variantId = null,
  compositeDraft = null,
  initialValue = [],
  readOnly = false,
  onClose,
  onConfirm,
  confirmLabel = "Continuar",
}) {
  const sections = useMemo(() => {
    return buildPreparedSections(
      product,
      buildModifierContextSections(product, {
        variantId,
        compositeDraft,
      }),
    );
  }, [product, variantId, compositeDraft]);

  const [selectionMap, setSelectionMap] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectionMap(buildInitialSelectionMap(initialValue, sections));
    setErrorMsg("");
  }, [open, initialValue, sections]);

  if (!product) return null;

  const title = product?.display_name || product?.name || "Producto";

  const updateGroupMap = (group, nextOptionMap) => {
    setSelectionMap((prev) => ({
      ...prev,
      [group.__selection_key]: nextOptionMap,
    }));
  };

  const handleSelectOption = (group, option) => {
    const optionId = Number(option?.id || 0);
    const current = { ...(selectionMap?.[group.__selection_key] || {}) };
    const mode = String(group?.selection_mode || "").toLowerCase();

    if (mode === "single") {
      updateGroupMap(group, { [optionId]: 1 });
      return;
    }

    current[optionId] = Math.max(1, Number(current?.[optionId] || 0) || 1);
    updateGroupMap(group, current);
  };

  const handleIncrementQty = (group, option) => {
    const optionId = Number(option?.id || 0);
    const maxPerSelection = Number(option?.max_quantity_per_selection || 1);
    const current = { ...(selectionMap?.[group.__selection_key] || {}) };
    const mode = String(group?.selection_mode || "").toLowerCase();
    const distinctCount = countDistinctSelectedOptions(current);
    const maxDistinct =
      group?.max_select == null || group?.max_select === ""
        ? null
        : Number(group.max_select);

    if (!current[optionId]) {
      if (mode === "single") {
        updateGroupMap(group, { [optionId]: 1 });
        return;
      }

      if (maxDistinct !== null && distinctCount >= maxDistinct) {
        return;
      }

      current[optionId] = 1;
      updateGroupMap(group, current);
      return;
    }

    const nextQty = Math.min(maxPerSelection, Number(current?.[optionId] || 0) + 1);
    current[optionId] = nextQty;
    updateGroupMap(group, current);
  };

  const handleDecrementQty = (group, option) => {
    const optionId = Number(option?.id || 0);
    const current = { ...(selectionMap?.[group.__selection_key] || {}) };
    const nextQty = Math.max(0, Number(current?.[optionId] || 0) - 1);

    if (nextQty <= 0) {
      delete current[optionId];
    } else {
      current[optionId] = nextQty;
    }

    updateGroupMap(group, current);
  };

  const handleRemoveOption = (group, option) => {
    const optionId = Number(option?.id || 0);
    const current = { ...(selectionMap?.[group.__selection_key] || {}) };
    delete current[optionId];
    updateGroupMap(group, current);
  };

  const handleConfirm = () => {
    if (readOnly) {
      onClose?.();
      return;
    }

    const errors = validatePreparedSections(sections, selectionMap);
    if (errors.length > 0) {
      setErrorMsg(errors[0]);
      return;
    }

    const normalized = normalizeSelectionForResult(sections, selectionMap);
    setErrorMsg("");
    onConfirm?.(normalized);
  };

  const totalDistinctSelected = sections.reduce((acc, section) => {
    return (
      acc +
      (Array.isArray(section?.groups) ? section.groups : []).reduce((sum, group) => {
        return (
          sum +
          countDistinctSelectedOptions(selectionMap?.[group.__selection_key] || {})
        );
      }, 0)
    );
  }, 0);

  const totalUnitsSelected = sections.reduce((acc, section) => {
    return (
      acc +
      (Array.isArray(section?.groups) ? section.groups : []).reduce((sum, group) => {
        return (
          sum +
          countTotalSelectedUnits(selectionMap?.[group.__selection_key] || {})
        );
      }, 0)
    );
  }, 0);

  return (
    <Modal
      open={open}
      title={`Extras: ${title}`}
      onClose={onClose}
      actions={
        <>
          <PillButton tone="default" onClick={onClose} title="Cerrar">
            {readOnly ? "Cerrar" : "Cancelar"}
          </PillButton>

          <PillButton
            tone={readOnly ? "soft" : "orange"}
            onClick={handleConfirm}
            title={readOnly ? "Cerrar vista de extras" : "Continuar con la selección actual"}
          >
            {readOnly ? "Listo" : confirmLabel}
          </PillButton>
        </>
      }
    >
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ fontSize: 13, opacity: 0.82 }}>
          Aquí se muestran los extras disponibles según su contexto real:
          producto, variante, componente o variante del componente.
        </div>

        <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.78 }}>
          Opciones distintas seleccionadas: {totalDistinctSelected} · Cantidad total: {totalUnitsSelected}
        </div>

        {errorMsg ? (
          <div
            style={{
              border: "1px solid rgba(255,0,0,0.18)",
              background: "#ffecec",
              color: "#a10000",
              borderRadius: 14,
              padding: "10px 12px",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {errorMsg}
          </div>
        ) : null}

        {sections.length > 0 ? (
          sections.map((section) => (
            <div
              key={section.key}
              style={{
                display: "grid",
                gap: 10,
                padding: "12px",
                borderRadius: 16,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "#fafafa",
              }}
            >
              <div>
                <div style={{ fontWeight: 950, fontSize: 14 }}>
                  {section.title}
                </div>
                <div style={{ fontSize: 12, opacity: 0.76, marginTop: 2 }}>
                  {section.subtitle}
                </div>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {(section.groups || []).map((group) => (
                  <GroupCard
                    key={group.__selection_key}
                    group={group}
                    readOnly={readOnly}
                    selectedMap={selectionMap}
                    onSelectOption={handleSelectOption}
                    onIncrementQty={handleIncrementQty}
                    onDecrementQty={handleDecrementQty}
                    onRemoveOption={handleRemoveOption}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: 13,
              opacity: 0.78,
              padding: "12px",
              borderRadius: 14,
              border: "1px dashed rgba(0,0,0,0.12)",
              background: "#fafafa",
            }}
          >
            Este producto no tiene extras visibles para este contexto.
          </div>
        )}
      </div>
    </Modal>
  );
}