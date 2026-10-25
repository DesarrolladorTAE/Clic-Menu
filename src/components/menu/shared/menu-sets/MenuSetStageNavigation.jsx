//src/components/menu/shared/menu-sets/MenuSetStageNavigation.jsx
import React, { useMemo } from "react";
import { alpha, useTheme } from "@mui/material/styles";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import { PillButton } from "../../../../pages/public/publicMenu.ui";
import usePagination from "../../../../hooks/usePagination";
import PaginationFooter from "../../../common/PaginationFooter";
import MenuSetStageProductCard from "./MenuSetStageProductCard";

const PAGE_SIZE = 8;

function getSafeColor(theme, color) {
  if (/^#[0-9A-Fa-f]{6}$/.test(String(color || ""))) return color;

  const primary = theme.palette.primary.main;
  return /^#[0-9A-Fa-f]{6}$/.test(primary) ? primary : "#FF7A00";
}

function getStageId(stage) {
  return Number(stage?.stageDefinitionId ?? stage?.menu_set_stage_definition_id ?? 0);
}

function getOptionId(option) {
  return Number(option?.menuSetProductId ?? option?.menu_set_product_id ?? option?.id ?? 0);
}

function getSelectedOptionId(item) {
  return Number(item?.menuSetProductId ?? item?.menu_set_product_id ?? item?.option_id ?? 0);
}

export default function MenuSetStageNavigation({
  builder,
  stages = [],
  currentStep = 0,
  stageValidations = [],
  selectionsByStage = {},
  themeColor,
  canSelect = true,
  readOnly = false,
  showMobileControls = true,
  onGoToStep,
  onPrevious,
  onNext,
  onBack,
  onSelectOption,
  onRemoveOption,
  onViewOption,
  onConfirm,
  footerActions = null,
  summaryContent = null,
  children = null,
}) {
  const theme = useTheme();
  const color = getSafeColor(theme, themeColor);
  const viewOnly = readOnly || builder?.readOnly === true || !canSelect;

  const availableStages = builder?.stages ?? stages;
  const validations = builder?.stageValidations ?? stageValidations;
  const selections = builder?.selectionsByStage ?? selectionsByStage;
  const requestedStep = Number(builder?.currentStep ?? currentStep);

  const step = Number.isInteger(requestedStep)
    ? Math.max(0, Math.min(availableStages.length, requestedStep))
    : 0;

  const isSummary = availableStages.length > 0 && step === availableStages.length;
  const activeStage = isSummary ? null : availableStages[step] || null;

  const stageOptions = useMemo(() => {
    return Array.isArray(activeStage?.options) ? activeStage.options : [];
  }, [activeStage]);

  const activeStageId = getStageId(activeStage);
  const selectedItems = Array.isArray(selections?.[activeStageId])
    ? selections[activeStageId] : [];

  const {
    page, nextPage, prevPage, total, totalPages,
    startItem, endItem, hasPrev, hasNext, paginatedItems,
  } = usePagination({
    items: stageOptions,
    initialPage: 1,
    pageSize: PAGE_SIZE,
    mode: "frontend",
    resetKey: `${builder?.menuSetId || 0}:${activeStageId}`,
  });

  const goToStep = builder?.goToStep ?? onGoToStep;
  const previousStep = builder?.previousStep ?? onPrevious;
  const nextStep = builder?.nextStep ?? onNext;

  const canGoPrevious = step > 0 && typeof previousStep === "function";
  const canGoBack = step === 0 && typeof onBack === "function";
  const canGoNext = !isSummary && typeof nextStep === "function";

  const stageTitle = isSummary
    ? viewOnly ? "Resumen del menú" : "Resumen de tu menú"
    : activeStage?.name
      ? viewOnly
        ? String(activeStage.name)
        : `Elige tu ${String(activeStage.name).toLocaleLowerCase("es-MX")}`
      : viewOnly ? "Productos de esta etapa" : "Elige tus productos";

  const required = activeStage?.required === true;
  const minimum = Number(activeStage?.minSelections ?? 0);
  const maximum = Number(activeStage?.maxSelections ?? 0);

  const stageInstruction = viewOnly
    ? activeStage?.description || "Consulta los productos que forman parte de esta etapa."
    : activeStage?.description || (
        required
          ? minimum === maximum
            ? `Selecciona ${minimum} ${minimum === 1 ? "opción" : "opciones"} para continuar.`
            : `Selecciona de ${minimum} a ${maximum} opciones para continuar.`
          : `Puedes seleccionar hasta ${maximum} ${maximum === 1 ? "opción" : "opciones"}.`
      );

  const handlePrevious = () => {
    if (canGoPrevious) {
      previousStep();
      return;
    }

    if (canGoBack) {
      onBack();
    }
  };

  const handleRemove = (option) => {
    if (!canSelect || viewOnly) return;

    if (typeof onRemoveOption === "function") {
      onRemoveOption(option, activeStage);
      return;
    }

    builder?.removeOption?.(activeStageId, getOptionId(option));
  };

  const handleConfirm = () => {
    if (viewOnly || !builder?.buildResult || typeof onConfirm !== "function") return;

    const result = builder.buildResult();
    if (result?.ok) {
      onConfirm(result);
    }
  };

  const defaultSummary = (
    <div className="cm-set-stage-summary">
      {availableStages.map((stage, index) => {
        const id = getStageId(stage);
        const chosen = Array.isArray(selections?.[id]) ? selections[id] : [];
        const options = Array.isArray(stage.options) ? stage.options : [];

        return (
          <div key={id || index} className="cm-set-stage-summary-row">
            <div style={{ fontWeight: 900, fontSize: 13 }}>
              {stage.name || `Etapa ${index + 1}`}
            </div>

            <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.55 }}>
              {viewOnly
                ? options.length > 0
                  ? options.map((option) => option.name || "Producto").join(" · ")
                  : "Sin productos registrados en esta etapa."
                : chosen.length > 0
                  ? chosen.map((item) => {
                      const option = options.find(
                        (row) => getOptionId(row) === getSelectedOptionId(item),
                      );
                      return option?.name || "Producto seleccionado";
                    }).join(" · ")
                  : "Sin productos seleccionados"}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (availableStages.length === 0) return null;

  return (
    <section
      className="cm-set-stage-navigation"
      aria-label={viewOnly ? "Consulta las etapas del menú" : "Personaliza tu menú"}
      style={{
        "--cm-stage-color": color,
        "--cm-stage-border": alpha(color, 0.19),
        "--cm-stage-soft": alpha(color, 0.075),
        "--cm-stage-text": theme.palette.text.primary,
        "--cm-stage-muted": theme.palette.text.secondary,
        "--cm-stage-surface": theme.palette.background.paper,
      }}
    >
      <style>
        {`
          .cm-set-stage-navigation,
          .cm-set-stage-navigation * {
            box-sizing: border-box;
          }

          .cm-set-stage-navigation {
            width: 100%;
            min-width: 0;
            min-height: 680px;
            height: auto;
            padding: 16px;
            border: 1px solid var(--cm-stage-border);
            border-radius: 15px;
            background: var(--cm-stage-surface);
            overflow: visible;
          }

          .cm-set-stage-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            padding-bottom: 15px;
          }

          .cm-set-stage-heading-title {
            margin: 3px 0 0;
            font-size: 20px;
            font-weight: 950;
            color: var(--cm-stage-text);
            line-height: 1.25;
          }

          .cm-set-stage-layout {
            display: grid;
            grid-template-columns: 155px minmax(0, 1fr);
            gap: 20px;
            align-items: stretch;
            width: 100%;
            min-width: 0;
            min-height: 560px;
          }

          .cm-set-stage-sidebar {
            display: grid;
            gap: 9px;
            align-content: start;
            min-width: 0;
          }

          .cm-set-stage-side-button {
            display: grid;
            gap: 6px;
            width: 100%;
            min-width: 0;
            padding: 12px;
            text-align: left;
            color: var(--cm-stage-text);
            background: var(--cm-stage-surface);
            border: 1px solid transparent;
            border-radius: 10px;
            cursor: pointer;
            font: inherit;
            overflow-wrap: anywhere;
            transition: background 160ms ease, border-color 160ms ease;
          }

          .cm-set-stage-side-button:hover {
            background: var(--cm-stage-soft);
          }

          .cm-set-stage-side-button.is-active {
            background: var(--cm-stage-soft);
            border-color: var(--cm-stage-color);
          }

          .cm-set-stage-side-button:focus-visible {
            outline: 2px solid var(--cm-stage-color);
            outline-offset: 2px;
          }

          .cm-set-stage-side-button:disabled {
            cursor: not-allowed;
            opacity: 0.55;
          }

          .cm-set-stage-main {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
            width: 100%;
            min-width: 0;
            min-height: 560px;
          }

          .cm-set-stage-main > * {
            min-width: 0;
            max-width: 100%;
          }

          .cm-set-stage-title {
            margin: 0;
            font-size: 21px;
            font-weight: 950;
            line-height: 1.25;
            color: var(--cm-stage-text);
            overflow-wrap: anywhere;
          }

          .cm-set-stage-instruction {
            margin: 6px 0 0;
            font-size: 12.5px;
            color: var(--cm-stage-muted);
            line-height: 1.45;
          }

          .cm-set-stage-counter {
            display: inline-flex;
            align-items: center;
            max-width: 100%;
            margin-top: 10px;
            padding: 5px 10px;
            border: 1px solid var(--cm-stage-border);
            border-radius: 999px;
            color: var(--cm-stage-color);
            background: var(--cm-stage-soft);
            font-size: 11px;
            font-weight: 900;
          }

          /*
           * Cuadrícula de respaldo cuando no se utiliza
           * MenuSetStageContent como children.
           *
           * El selector directo no sobrescribe la cuadrícula
           * interna de MenuSetStageContent.
           */
          .cm-set-stage-main > .cm-set-stage-products {
            display: grid;
            grid-template-columns: minmax(0, 1fr);
            gap: 12px;
            align-items: stretch;
            width: 100%;
            min-width: 0;
            max-width: 100%;
          }

          .cm-set-stage-main > .cm-set-stage-products > * {
            min-width: 0;
            max-width: 100%;
          }

          .cm-set-stage-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: auto;
            padding-top: 15px;
            border-top: 1px solid var(--cm-stage-border);
            width: 100%;
            min-width: 0;
          }

          .cm-set-stage-footer > button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            min-width: 0;
            max-width: 100%;
          }

          .cm-set-stage-summary {
            display: grid;
            gap: 10px;
            min-width: 0;
            width: 100%;
          }

          .cm-set-stage-summary-row {
            min-width: 0;
            padding: 13px;
            border: 1px solid var(--cm-stage-border);
            border-radius: 10px;
            background: var(--cm-stage-surface);
            color: var(--cm-stage-muted);
            overflow-wrap: anywhere;
          }

          .cm-set-stage-mobile {
            display: none;
          }

          .cm-set-stage-pagination {
            min-width: 0;
            max-width: 100%;
            border: 1px solid var(--cm-stage-border);
            border-radius: 10px;
            overflow-x: auto;
            overflow-y: hidden;
          }

          @media (min-width: 640px) {
            .cm-set-stage-main > .cm-set-stage-products {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (min-width: 1200px) {
            .cm-set-stage-main > .cm-set-stage-products {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }

          @media (max-width: 767px) {
            .cm-set-stage-navigation {
              min-height: 480px;
              padding: 12px;
              border-radius: 12px;
            }

            .cm-set-stage-heading,
            .cm-set-stage-sidebar {
              display: none;
            }

            .cm-set-stage-layout {
              display: block;
              width: 100%;
              min-width: 0;
              min-height: 0;
            }

            .cm-set-stage-main {
              min-height: 390px;
            }

            .cm-set-stage-mobile {
              display: grid;
              gap: 12px;
              margin-bottom: 17px;
            }

            .cm-set-stage-mobile-top {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
            }

            .cm-set-stage-mobile-back {
              display: inline-flex;
              align-items: center;
              gap: 5px;
              padding: 5px 0;
              border: 0;
              background: transparent;
              color: var(--cm-stage-text);
              font: inherit;
              font-size: 12px;
              font-weight: 800;
              cursor: pointer;
            }

            .cm-set-stage-mobile-back:disabled {
              opacity: 0.45;
              cursor: not-allowed;
            }

            .cm-set-stage-progress {
              display: grid;
              gap: 4px;
              grid-template-columns: repeat(var(--cm-stage-count), minmax(0, 1fr));
              width: 100%;
              min-width: 0;
            }

            .cm-set-stage-progress-bar {
              height: 4px;
              border-radius: 999px;
              background: var(--cm-stage-border);
              transition: background-color 180ms ease;
            }

            .cm-set-stage-progress-bar.is-done,
            .cm-set-stage-progress-bar.is-current {
              background: var(--cm-stage-color);
            }

            .cm-set-stage-title {
              font-size: 19px;
            }

            .cm-set-stage-main > .cm-set-stage-products {
              gap: 10px;
            }

            .cm-set-stage-footer > button {
              flex: 1 1 auto;
            }
          }

          @media (max-width: 639px) {
            .cm-set-stage-main > .cm-set-stage-products {
              grid-template-columns: minmax(0, 1fr);
            }
          }

          @media (max-width: 359px) {
            .cm-set-stage-navigation { padding: 9px; }
            .cm-set-stage-footer { gap: 8px; }
            .cm-set-stage-title { font-size: 18px; }
          }
        `}
      </style>

      <header className="cm-set-stage-heading">
        <div>
          <div style={{ color, fontSize: 11, fontWeight: 850 }}>
            ARMA TU MENÚ
          </div>

          <h2 className="cm-set-stage-heading-title">
            {builder?.menuSet?.name || "Personaliza tu menú"}
          </h2>
        </div>

        <span className="cm-set-stage-counter" style={{ marginTop: 0 }}>
          {viewOnly ? "Vista general" : isSummary ? "Resumen" : "En proceso"}
        </span>
      </header>

      <div className="cm-set-stage-mobile">
        {showMobileControls ? (
          <div className="cm-set-stage-mobile-top">
            <button
              type="button"
              className="cm-set-stage-mobile-back"
              onClick={handlePrevious}
              disabled={!canGoPrevious && !canGoBack}
            >
              <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
              Volver
            </button>

            <span style={{
              color: theme.palette.text.secondary,
              fontSize: 11,
              fontWeight: 850,
            }}>
              {isSummary ? "Resumen" : `Paso ${step + 1} de ${availableStages.length}`}
            </span>
          </div>
        ) : null}

        <div
          className="cm-set-stage-progress"
          style={{ "--cm-stage-count": availableStages.length }}
          role="progressbar"
          aria-label="Progreso de las etapas"
          aria-valuemin={1}
          aria-valuemax={availableStages.length}
          aria-valuenow={isSummary ? availableStages.length : step + 1}
        >
          {availableStages.map((stage, index) => (
            <span
              key={getStageId(stage) || index}
              className={`cm-set-stage-progress-bar ${
                index < step ? "is-done" : index === step ? "is-current" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <div className="cm-set-stage-layout">
        <nav className="cm-set-stage-sidebar" aria-label="Etapas del menú">
          {availableStages.map((stage, index) => {
            const done = !viewOnly && index < step && validations[index]?.valid === true;

            return (
              <button
                key={getStageId(stage) || index}
                type="button"
                className={`cm-set-stage-side-button${step === index ? " is-active" : ""}`}
                aria-current={step === index ? "step" : undefined}
                disabled={typeof goToStep !== "function"}
                onClick={() => goToStep?.(index)}
              >
                <span style={{ fontSize: 10, color: theme.palette.text.secondary }}>
                  Etapa {index + 1}
                </span>

                <span style={{ fontSize: 12.5, fontWeight: 900, lineHeight: 1.3 }}>
                  {done ? (
                    <CheckRoundedIcon
                      sx={{ fontSize: 15, color, verticalAlign: "middle", mr: 0.5 }}
                    />
                  ) : null}
                  {stage.name}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            className={`cm-set-stage-side-button${isSummary ? " is-active" : ""}`}
            aria-current={isSummary ? "step" : undefined}
            disabled={typeof goToStep !== "function"}
            onClick={() => goToStep?.(availableStages.length)}
          >
            <span style={{ fontSize: 12.5, fontWeight: 900 }}>Resumen</span>
          </button>
        </nav>

        <div className="cm-set-stage-main">
          <div>
            <h3 className="cm-set-stage-title">{stageTitle}</h3>

            <p className="cm-set-stage-instruction">
              {isSummary
                ? viewOnly
                  ? "Consulta las etapas y los productos que integran este menú."
                  : "Revisa los productos que elegiste antes de agregarlos a tu pedido."
                : stageInstruction}
            </p>

            {!isSummary ? (
              <span className="cm-set-stage-counter">
                {viewOnly
                  ? `${stageOptions.length} ${stageOptions.length === 1 ? "producto" : "productos"} para consultar`
                  : `${required ? "Obligatoria" : "Opcional"} · ${selectedItems.length} de ${maximum}`}
              </span>
            ) : null}
          </div>

          {isSummary ? (
            viewOnly ? defaultSummary : (summaryContent ?? defaultSummary)
          ) : children !== null ? (
            children
          ) : (
            <>
              {stageOptions.length > 0 ? (
                <div className="cm-set-stage-products">
                  {paginatedItems.map((option) => {
                    const selected = selectedItems.find(
                      (item) => getSelectedOptionId(item) === getOptionId(option),
                    ) || null;

                    return (
                      <MenuSetStageProductCard
                        key={getOptionId(option)}
                        option={option}
                        selection={selected}
                        selected={!!selected}
                        themeColor={color}
                        canSelect={canSelect && !viewOnly}
                        onSelect={canSelect && !viewOnly
                          ? () => onSelectOption?.(option, activeStage) : undefined}
                        onRemove={canSelect && !viewOnly
                          ? () => handleRemove(option) : undefined}
                        onViewDetails={onViewOption
                          ? () => onViewOption(option, activeStage) : undefined}
                      />
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  padding: 15,
                  border: `1px solid ${alpha(color, 0.18)}`,
                  borderRadius: 10,
                  color: theme.palette.text.secondary,
                  fontSize: 12.5,
                }}>
                  Esta etapa no tiene productos disponibles para mostrar.
                </div>
              )}

              {totalPages > 1 ? (
                <div className="cm-set-stage-pagination">
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
                    itemLabel="productos"
                  />
                </div>
              ) : null}
            </>
          )}

          <footer className="cm-set-stage-footer">
            <PillButton
              tone="orange"
              themeColor={color}
              onClick={handlePrevious}
              disabled={!canGoPrevious && !canGoBack}
            >
              <ChevronLeftRoundedIcon sx={{ mr: 0.5, fontSize: 17 }} />
              Anterior
            </PillButton>

            {footerActions ?? (
              isSummary ? (
                viewOnly ? (
                  <PillButton
                    tone="orange"
                    themeColor={color}
                    onClick={() => goToStep?.(0)}
                    disabled={typeof goToStep !== "function"}
                  >
                    Ver etapas
                  </PillButton>
                ) : (
                  <PillButton
                    tone="orange"
                    themeColor={color}
                    disabled={!builder?.isComplete || typeof onConfirm !== "function"}
                    onClick={handleConfirm}
                  >
                    Agregar al pedido
                  </PillButton>
                )
              ) : (
                <PillButton
                  tone="orange"
                  themeColor={color}
                  disabled={!canGoNext}
                  onClick={() => nextStep?.()}
                >
                  {viewOnly && step === availableStages.length - 1
                    ? "Ver resumen" : "Siguiente"}
                  <ChevronRightRoundedIcon sx={{ ml: 0.5, fontSize: 17 }} />
                </PillButton>
              )
            )}
          </footer>
        </div>
      </div>
    </section>
  );
}