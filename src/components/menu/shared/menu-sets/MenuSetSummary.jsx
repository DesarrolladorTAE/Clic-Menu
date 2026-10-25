//src/components/menu/shared/menu-sets/MenuSetSummary.jsx
import React from "react";
import { alpha, useTheme } from "@mui/material/styles";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import { PillButton } from "../../../../pages/public/publicMenu.ui";
import { money } from "../../../../hooks/public/publicMenu.utils";

function positiveId(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

function getStageId(stage) {
  return positiveId(stage?.stageDefinitionId ?? stage?.menu_set_stage_definition_id);
}

function getOptionId(option) {
  return positiveId(option?.menuSetProductId ?? option?.menu_set_product_id ?? option?.id);
}

function getSelectionId(item) {
  return positiveId(item?.menuSetProductId ?? item?.menu_set_product_id ?? item?.option_id);
}

function getVariantName(option, variantId) {
  const id = positiveId(variantId);
  if (!id) return "";

  const variant = (option?.variants || []).find(
    (item) => positiveId(item?.id) === id,
  );

  return variant?.display_name || variant?.name || "Variante seleccionada";
}

function getComponentName(component, definitions = []) {
  const id = positiveId(component?.component_product_id);
  const definition = definitions.find((item) => {
    return positiveId(item?.component_product_id) === id;
  });

  return definition?.component_name || definition?.name
    || definition?.product?.name || "Componente seleccionado";
}

function renderComponents(components, definitions = [], depth = 0) {
  if (!Array.isArray(components) || components.length === 0 || depth >= 12) {
    return null;
  }

  return (
    <div style={{
      display: "grid", gap: 5, marginTop: 6,
      paddingLeft: depth > 0 ? 10 : 0,
    }}>
      {components.map((component, index) => {
        const name = getComponentName(component, definitions);
        const quantity = Number(component?.quantity || 1);
        const variantId = positiveId(component?.variant_id);

        const definition = definitions.find(
          (item) => positiveId(item?.component_product_id)
            === positiveId(component?.component_product_id),
        );

        const variant = (definition?.selector?.options || definition?.variants || []).find(
          (item) => positiveId(item?.variant_id ?? item?.id) === variantId,
        );

        const nestedDefinitions = definition?.composite?.items
          || definition?.product?.composite?.items || [];

        return (
          <div
            key={`${component?.component_product_id || index}-${index}`}
            style={{ minWidth: 0 }}
          >
            <div style={{ fontSize: 12, lineHeight: 1.5 }}>
              • {name}{quantity > 1 ? ` · ${quantity} unidades` : ""}
              {variantId
                ? ` · ${variant?.label || variant?.name || "Variante elegida"}`
                : ""}
            </div>

            {Array.isArray(component?.modifiers) && component.modifiers.length > 0 ? (
              <div style={{ paddingLeft: 12, fontSize: 11.5, opacity: 0.85 }}>
                Extras configurados
              </div>
            ) : null}

            {renderComponents(component?.components, nestedDefinitions, depth + 1)}
          </div>
        );
      })}
    </div>
  );
}

function SelectionDetail({ option, selection, color, muted }) {
  const variantName = getVariantName(
    option,
    selection?.variant_id ?? selection?.variantId,
  );

  const components = Array.isArray(selection?.components) ? selection.components : [];
  const modifiers = Array.isArray(selection?.modifiers) ? selection.modifiers : [];
  const compositeDefinitions = option?.composite?.items || [];
  const hasPrepared = positiveId(selection?.prepared_item_id ?? selection?.preparedItemId);
  const notes = String(selection?.notes || "").trim();

  return (
    <div style={{ minWidth: 0, display: "grid", gap: 5 }}>
      <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.35 }}>
        {option?.name || "Producto seleccionado"}
      </div>

      {variantName ? (
        <div style={{ fontSize: 12, color: muted }}>
          Variante: <strong>{variantName}</strong>
        </div>
      ) : null}

      {hasPrepared ? (
        <div style={{ fontSize: 11.5, color, fontWeight: 800 }}>
          Preparación rápida seleccionada
        </div>
      ) : null}

      {components.length > 0 ? (
        <div style={{ color: muted, fontSize: 12, lineHeight: 1.5 }}>
          <strong>Componentes</strong>
          {renderComponents(components, compositeDefinitions)}
        </div>
      ) : null}

      {modifiers.length > 0 ? (
        <div style={{ fontSize: 11.5, color: muted }}>
          Extras personalizados
        </div>
      ) : null}

      {notes ? (
        <div style={{
          marginTop: 4,
          padding: "7px 9px",
          fontSize: 11.5,
          color: muted,
          whiteSpace: "pre-wrap",
          borderLeft: `2px solid ${color}`,
          lineHeight: 1.45,
        }}>
          {notes}
        </div>
      ) : null}
    </div>
  );
}

export default function MenuSetSummary({
  builder,
  menuSet,
  stages,
  selectionsByStage,
  themeColor,
  canSelect = true,
  readOnly = false,
  onEditStage,
  onRemoveOption,
}) {
  const theme = useTheme();
  const color = /^#[0-9A-Fa-f]{6}$/.test(String(themeColor || ""))
    ? themeColor : theme.palette.primary.main;

  const viewOnly = readOnly || builder?.readOnly === true || !canSelect;
  const set = menuSet || builder?.menuSet || {};
  const availableStages = stages || builder?.stages || [];
  const selections = selectionsByStage || builder?.selectionsByStage || {};
  const validations = builder?.stageValidations || [];

  const selectedCount = availableStages.reduce((sum, stage) => {
    const selected = selections?.[getStageId(stage)] || [];
    return sum + (Array.isArray(selected) ? selected.length : 0);
  }, 0);

  const price = set.price === null || set.price === undefined || set.price === ""
    ? null : Number(set.price);

  const hasPrice = price !== null && Number.isFinite(price) && price >= 0;

  const handleEditStage = (index, stage) => {
    if (viewOnly) return;

    if (typeof onEditStage === "function") {
      onEditStage(index, stage);
      return;
    }

    builder?.goToStep?.(index);
  };

  const handleRemove = (stage, option) => {
    if (viewOnly) return;

    if (typeof onRemoveOption === "function") {
      onRemoveOption(stage, option);
      return;
    }

    builder?.removeOption?.(getStageId(stage), getOptionId(option));
  };

  return (
    <div
      className="cm-menu-set-summary"
      style={{
        "--cm-summary-color": color,
        "--cm-summary-soft": alpha(color, 0.07),
        "--cm-summary-border": alpha(color, 0.18),
        "--cm-summary-surface": theme.palette.background.paper,
        "--cm-summary-text": theme.palette.text.primary,
        "--cm-summary-muted": theme.palette.text.secondary,
      }}
    >
      <style>
        {`
          .cm-menu-set-summary,
          .cm-menu-set-summary * {
            box-sizing: border-box;
          }

          .cm-menu-set-summary {
            width: 100%;
            min-width: 0;
            display: grid;
            gap: 13px;
          }

          .cm-menu-set-summary-head {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            flex-wrap: wrap;
            gap: 12px;
            padding: 14px;
            border: 1px solid var(--cm-summary-border);
            border-radius: 12px;
            background: var(--cm-summary-soft);
          }

          .cm-menu-set-summary-title {
            margin: 0;
            color: var(--cm-summary-text);
            font-size: 17px;
            font-weight: 950;
            line-height: 1.3;
            overflow-wrap: anywhere;
          }

          .cm-menu-set-summary-stage {
            min-width: 0;
            max-width: 100%;
            padding: 12px;
            border: 1px solid var(--cm-summary-border);
            border-radius: 11px;
            background: var(--cm-summary-surface);
          }

          .cm-menu-set-summary-stage-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 10px;
          }

          .cm-menu-set-summary-items {
            display: grid;
            gap: 8px;
          }

          .cm-menu-set-summary-item {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            min-width: 0;
            padding: 11px;
            border: 1px solid var(--cm-summary-border);
            border-radius: 9px;
            overflow-wrap: anywhere;
          }

          .cm-menu-set-summary-option {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            min-width: 0;
            padding: 10px 11px;
            border: 1px solid var(--cm-summary-border);
            border-radius: 9px;
            background: var(--cm-summary-surface);
          }

          .cm-menu-set-summary-option-name {
            flex: 1;
            min-width: 0;
            color: var(--cm-summary-text);
            font-size: 12.5px;
            font-weight: 800;
            line-height: 1.4;
            overflow-wrap: anywhere;
          }

          .cm-menu-set-summary-option-status {
            flex-shrink: 0;
            color: var(--cm-summary-muted);
            font-size: 10.5px;
            font-weight: 800;
            text-align: right;
          }

          .cm-menu-set-summary-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            padding: 14px;
            border: 1px solid var(--cm-summary-border);
            border-radius: 11px;
          }

          @media (max-width: 639px) {
            .cm-menu-set-summary-head,
            .cm-menu-set-summary-footer {
              padding: 12px;
            }

            .cm-menu-set-summary-stage { padding: 10px; }
            .cm-menu-set-summary-item { padding: 9px; }
            .cm-menu-set-summary-option { padding: 9px; }
          }
        `}
      </style>

      <div className="cm-menu-set-summary-head">
        <div style={{ minWidth: 0 }}>
          <h3 className="cm-menu-set-summary-title">
            {set.name || "Tu menú personalizado"}
          </h3>

          <div style={{
            color: "var(--cm-summary-muted)",
            fontSize: 12,
            marginTop: 5,
          }}>
            {viewOnly
              ? `${availableStages.length} ${availableStages.length === 1 ? "etapa" : "etapas"} disponibles para consultar`
              : `${selectedCount} ${selectedCount === 1 ? "producto seleccionado" : "productos seleccionados"}`}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "var(--cm-summary-muted)" }}>
            Precio base
          </div>
          <strong style={{ fontSize: 19, color: "var(--cm-summary-color)" }}>
            {hasPrice ? money(price) : "Por confirmar"}
          </strong>
        </div>
      </div>

      {availableStages.map((stage, stageIndex) => {
        const stageId = getStageId(stage);
        const chosen = Array.isArray(selections?.[stageId]) ? selections[stageId] : [];
        const options = Array.isArray(stage.options) ? stage.options : [];
        const validation = validations[stageIndex];
        const valid = validation?.valid === true;

        return (
          <section key={stageId || stageIndex} className="cm-menu-set-summary-stage">
            <div className="cm-menu-set-summary-stage-header">
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {!viewOnly && valid ? (
                    <CheckCircleRoundedIcon sx={{ color, fontSize: 17 }} />
                  ) : null}

                  <strong style={{ fontSize: 13, lineHeight: 1.35 }}>
                    {stage.name || `Etapa ${stageIndex + 1}`}
                  </strong>
                </div>

                <div style={{
                  fontSize: 11.5,
                  marginTop: 4,
                  color: "var(--cm-summary-muted)",
                }}>
                  {viewOnly
                    ? `${stage.required ? "Etapa obligatoria" : "Etapa opcional"} · ${options.length} ${options.length === 1 ? "opción" : "opciones"}`
                    : `${stage.required ? "Obligatoria" : "Opcional"} · ${chosen.length} de ${stage.maxSelections ?? 0}`}
                </div>
              </div>

              {canSelect && !viewOnly ? (
                <PillButton
                  tone="default"
                  onClick={() => handleEditStage(stageIndex, stage)}
                >
                  <EditRoundedIcon sx={{ fontSize: 15, mr: 0.5, verticalAlign: "middle" }} />
                  Cambiar
                </PillButton>
              ) : null}
            </div>

            {viewOnly ? (
              options.length > 0 ? (
                <div className="cm-menu-set-summary-items">
                  {options.map((option, index) => {
                    const optionUnavailable = option.isActive === false
                      || option.availability?.isAvailable === false;

                    return (
                      <div
                        key={`${getOptionId(option) || index}-${index}`}
                        className="cm-menu-set-summary-option"
                      >
                        <span className="cm-menu-set-summary-option-name">
                          {option.name || "Producto"}
                        </span>

                        {optionUnavailable ? (
                          <span className="cm-menu-set-summary-option-status">
                            No disponible
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  padding: "10px 0",
                  fontSize: 12,
                  color: "var(--cm-summary-muted)",
                }}>
                  Esta etapa no tiene productos registrados para mostrar.
                </div>
              )
            ) : chosen.length > 0 ? (
              <div className="cm-menu-set-summary-items">
                {chosen.map((selection, index) => {
                  const option = stage.options?.find(
                    (item) => getOptionId(item) === getSelectionId(selection),
                  );

                  return (
                    <div
                      key={`${getSelectionId(selection) || index}-${index}`}
                      className="cm-menu-set-summary-item"
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <SelectionDetail
                          option={option}
                          selection={selection}
                          color={color}
                          muted={theme.palette.text.secondary}
                        />
                      </div>

                      {canSelect && option ? (
                        <PillButton
                          tone="default"
                          onClick={() => handleRemove(stage, option)}
                          title={`Quitar ${option.name || "producto"}`}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                        </PillButton>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                padding: "10px 0",
                fontSize: 12,
                color: "var(--cm-summary-muted)",
              }}>
                {stage.required
                  ? "Faltan productos por seleccionar."
                  : "Sin productos adicionales."}
              </div>
            )}
          </section>
        );
      })}

      <div className="cm-menu-set-summary-footer">
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 900,
            color: "var(--cm-summary-text)",
          }}>
            {viewOnly
              ? "Información general del menú"
              : builder?.isComplete
                ? "Tu selección está completa"
                : "Revisa las etapas pendientes"}
          </div>

          <div style={{
            marginTop: 5,
            color: "var(--cm-summary-muted)",
            fontSize: 11.5,
            lineHeight: 1.5,
          }}>
            {viewOnly
              ? "Consulta las opciones disponibles en cada etapa. La disponibilidad y el importe final pueden variar según la configuración elegida."
              : "El importe final incluirá los extras con costo y se confirmará al enviar el pedido."}
          </div>
        </div>

        <strong style={{
          fontSize: 18,
          color: "var(--cm-summary-color)",
          whiteSpace: "nowrap",
        }}>
          {hasPrice ? money(price) : "—"}
        </strong>
      </div>
    </div>
  );
}