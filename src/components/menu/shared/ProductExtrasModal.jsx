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
import usePagination from "../../../hooks/usePagination";
import PaginationFooter from "../../common/PaginationFooter";

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
            availability: opt?.availability || null,
            is_available:
              typeof opt?.is_available === "boolean" ? opt.is_available : true,
            availability_label: opt?.availability_label || null,
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

function getAvailabilityUi(option) {
  const availability = option?.availability || null;
  const status = String(
    option?.availability_label ||
      availability?.status ||
      "disponible"
  ).toLowerCase();

  const maxQty = availability?.max_available_qty;
  const reason = availability?.reason || null;
  const isAvailable =
    typeof option?.is_available === "boolean" ? option.is_available : true;

  const map = {
    disponible: {
      label: "Disponible",
      bg: "#e8f7ee",
      color: "#18794e",
      border: "rgba(24,121,78,0.18)",
    },
    available: {
      label: "Disponible",
      bg: "#e8f7ee",
      color: "#18794e",
      border: "rgba(24,121,78,0.18)",
    },
    agotado: {
      label: "Agotado",
      bg: "#fdecec",
      color: "#b42318",
      border: "rgba(180,35,24,0.18)",
    },
    out_of_stock: {
      label: "Agotado",
      bg: "#fdecec",
      color: "#b42318",
      border: "rgba(180,35,24,0.18)",
    },
    stock_insuficiente: {
      label: "Stock insuficiente",
      bg: "#fff4e5",
      color: "#b26a00",
      border: "rgba(178,106,0,0.18)",
    },
    insufficient_stock: {
      label: "Stock insuficiente",
      bg: "#fff4e5",
      color: "#b26a00",
      border: "rgba(178,106,0,0.18)",
    },
    sin_receta: {
      label: "Sin receta",
      bg: "#f3e8ff",
      color: "#7c3aed",
      border: "rgba(124,58,237,0.18)",
    },
    recipe_missing: {
      label: "Sin receta",
      bg: "#f3e8ff",
      color: "#7c3aed",
      border: "rgba(124,58,237,0.18)",
    },
    bloqueado: {
      label: "Bloqueado",
      bg: "#eef2ff",
      color: "#4338ca",
      border: "rgba(67,56,202,0.18)",
    },
    inventory_blocked: {
      label: "Bloqueado",
      bg: "#eef2ff",
      color: "#4338ca",
      border: "rgba(67,56,202,0.18)",
    },
  };

  const current = map[status] || map.disponible;

  return {
    isAvailable,
    label: current.label,
    bg: current.bg,
    color: current.color,
    border: current.border,
    maxQty,
    reason,
  };
}

function formatMaxQty(value) {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return null;
  if (Math.floor(num) === num) return String(num);
  return String(num);
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
  const availabilityUi = getAvailabilityUi(option);
  const disabledByAvailability = !availabilityUi.isAvailable;

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: "12px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        background: selectedQty > 0 ? "#fff7ed" : "#fff",
        opacity: disabledByAvailability && selectedQty <= 0 ? 0.78 : 1,
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
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 14,
              color: "#3F3A52",
              lineHeight: 1.25,
            }}
          >
            {option?.name || "Opción"}
          </div>

          {option?.description ? (
            <div
              style={{
                fontSize: 12,
                color: "#6E6A6A",
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              {option.description}
            </div>
          ) : null}

          <div
            style={{
              fontSize: 12,
              color: "#6E6A6A",
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            {affectsPrice ? `Ajuste: ${money(price)}` : "Sin ajuste al total"}
            {maxPerSelection > 1 ? ` · Máx. por selección: ${maxPerSelection}` : ""}
            {option?.is_default ? " · Sugerido por defecto" : ""}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 900,
                background: availabilityUi.bg,
                color: availabilityUi.color,
                border: `1px solid ${availabilityUi.border}`,
              }}
            >
              {availabilityUi.label}
            </span>

            {availabilityUi.maxQty !== null &&
            availabilityUi.maxQty !== undefined &&
            Number(availabilityUi.maxQty) > 0 ? (
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#6E6A6A",
                }}
              >
                Máx. disponible: {formatMaxQty(availabilityUi.maxQty)}
              </span>
            ) : null}
          </div>

          {availabilityUi.reason ? (
            <div
              style={{
                fontSize: 12,
                marginTop: 8,
                color: disabledByAvailability ? "#b42318" : "#6E6A6A",
                fontWeight: disabledByAvailability ? 700 : 500,
                lineHeight: 1.45,
              }}
            >
              {availabilityUi.reason}
            </div>
          ) : null}
        </div>

        {readOnly ? (
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#6E6A6A",
              alignSelf: "center",
            }}
          >
            {selectedQty > 0 ? `Seleccionado (${selectedQty})` : "Solo vista"}
          </div>
        ) : selectedQty > 0 ? (
          <div
            style={{
              display: "grid",
              gap: 8,
              minWidth: 132,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <PillButton
                tone="default"
                onClick={() => onDecrementQty?.(group, option)}
                disabled={selectedQty <= 0}
                title="Restar"
              >
                −
              </PillButton>

              <div
                style={{
                  minWidth: 28,
                  textAlign: "center",
                  fontWeight: 900,
                  color: "#3F3A52",
                }}
              >
                {selectedQty}
              </div>

              <PillButton
                tone="soft"
                onClick={() => onIncrementQty?.(group, option)}
                disabled={
                  selectedQty >= maxPerSelection || disabledByAvailability
                }
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
            tone={disabledByAvailability ? "default" : "soft"}
            onClick={() => onSelectOption?.(group, option)}
            disabled={disabledByAvailability}
            title={
              disabledByAvailability
                ? "Esta opción no está disponible"
                : "Seleccionar"
            }
          >
            {disabledByAvailability ? "No disponible" : "Seleccionar"}
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
  const distinctCount = countDistinctSelectedOptions(
    selectedMap?.[group.__selection_key] || {}
  );

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        padding: "14px",
        borderRadius: 14,
        border: "1px solid #D9D3D3",
        background: "#FBF8F8",
        boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 900,
            fontSize: 15,
            color: "#3F3A52",
            lineHeight: 1.2,
          }}
        >
          {group?.name || "Grupo de extras"}
        </div>

        {group?.description ? (
          <div
            style={{
              fontSize: 12,
              color: "#6E6A6A",
              marginTop: 4,
              lineHeight: 1.45,
            }}
          >
            {group.description}
          </div>
        ) : null}

        <div
          style={{
            fontSize: 12,
            color: "#6E6A6A",
            marginTop: 6,
            lineHeight: 1.45,
          }}
        >
          {formatModifierGroupMeta(group)}
        </div>

        {!readOnly ? (
          <div
            style={{
              fontSize: 12,
              color: "#6E6A6A",
              marginTop: 6,
              fontWeight: 700,
            }}
          >
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
            color: "#6E6A6A",
            padding: "12px",
            borderRadius: 12,
            background: "#fff",
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
  selectionScope = "all",
}) {
  const sections = useMemo(() => {
    return buildPreparedSections(
      product,
      buildModifierContextSections(product, {
        variantId,
        compositeDraft,
        selectionScope,
      }),
    );
  }, [product, variantId, compositeDraft, selectionScope]);

  const flatGroups = useMemo(() => {
    return sections.flatMap((section) =>
      (Array.isArray(section?.groups) ? section.groups : []).map((group) => ({
        sectionKey: section?.key || "section",
        sectionTitle: section?.title || "Extras",
        sectionSubtitle: section?.subtitle || "",
        group,
      })),
    );
  }, [sections]);

  const [selectionMap, setSelectionMap] = useState({});
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelectionMap(buildInitialSelectionMap(initialValue, sections));
    setErrorMsg("");
  }, [open, initialValue, sections]);

  const {
    page,
    nextPage,
    prevPage,
    total,
    totalPages,
    startItem,
    endItem,
    hasPrev,
    hasNext,
    paginatedItems,
  } = usePagination({
    items: flatGroups,
    initialPage: 1,
    pageSize: 5,
    mode: "frontend",
  });

  const paginatedGroupsBySection = useMemo(() => {
    const grouped = {};
    paginatedItems.forEach((item) => {
      if (!grouped[item.sectionKey]) {
        grouped[item.sectionKey] = {
          sectionKey: item.sectionKey,
          sectionTitle: item.sectionTitle,
          sectionSubtitle: item.sectionSubtitle,
          items: [],
        };
      }
      grouped[item.sectionKey].items.push(item.group);
    });

    return Object.values(grouped);
  }, [paginatedItems]);

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
    const optionAvailable =
      typeof option?.is_available === "boolean" ? option.is_available : true;

    if (!optionAvailable) return;

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
    const optionAvailable =
      typeof option?.is_available === "boolean" ? option.is_available : true;

    if (!optionAvailable) return;

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

    for (const section of sections) {
      for (const group of Array.isArray(section?.groups) ? section.groups : []) {
        const selected = selectionMap?.[group.__selection_key] || {};
        const options = Array.isArray(group?.options) ? group.options : [];

        for (const option of options) {
          const optionId = Number(option?.id || 0);
          const qty = Number(selected?.[optionId] || 0);
          const optionAvailable =
            typeof option?.is_available === "boolean" ? option.is_available : true;

          if (qty > 0 && !optionAvailable) {
            setErrorMsg(
              `La opción "${option?.name || "Extra"}" ya no está disponible.`
            );
            return;
          }
        }
      }
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
      width="min(920px, 96vw)"
      maxHeight="min(88vh, 920px)"
      bodyPadding={16}
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
      <div style={{ display: "grid", gap: 14 }}>
        <div
          style={{
            border: "1px solid #D9D3D3",
            borderRadius: 14,
            background: "#FBF8F8",
            padding: 14,
            display: "grid",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "#3F3A52",
            }}
          >
            Configuración de modificadores
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#6E6A6A",
              lineHeight: 1.55,
            }}
          >
            Aquí se muestran los extras disponibles según su contexto real:
            producto, variante, componente o variante del componente.
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "#fff",
                color: "#3F3A52",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Opciones distintas: {totalDistinctSelected}
            </span>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.10)",
                background: "#fff",
                color: "#3F3A52",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Cantidad total: {totalUnitsSelected}
            </span>
          </div>
        </div>

        {errorMsg ? (
          <div
            style={{
              border: "1px solid rgba(242,100,42,0.28)",
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

        {total > 0 ? (
          <>
            <div style={{ display: "grid", gap: 12 }}>
              {paginatedGroupsBySection.map((section) => (
                <div
                  key={section.sectionKey}
                  style={{
                    display: "grid",
                    gap: 10,
                    padding: "14px",
                    borderRadius: 14,
                    border: "1px solid #D9D3D3",
                    background: "#fff",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 15,
                        color: "#3F3A52",
                        lineHeight: 1.2,
                      }}
                    >
                      {section.sectionTitle}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: "#6E6A6A",
                        marginTop: 4,
                      }}
                    >
                      {section.sectionSubtitle}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {section.items.map((group) => (
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
              ))}
            </div>

            <div
              style={{
                border: "1px solid #D9D3D3",
                borderRadius: 12,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              <PaginationFooter
                page={page}
                totalPages={totalPages}
                startItem={startItem}
                endItem={endItem}
                total={total}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={prevPage}
                onNext={nextPage}
                itemLabel="grupos"
              />
            </div>
          </>
        ) : (
          <div
            style={{
              fontSize: 13,
              color: "#6E6A6A",
              padding: "16px",
              borderRadius: 14,
              border: "1px dashed rgba(0,0,0,0.12)",
              background: "#FBF8F8",
            }}
          >
            Este producto no tiene extras visibles para este contexto.
          </div>
        )}
      </div>
    </Modal>
  );
}